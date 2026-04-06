package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/soul-core/license-server/internal/crypto"
	"github.com/soul-core/license-server/internal/delivery"
	"github.com/soul-core/license-server/internal/handlers"
	"github.com/soul-core/license-server/internal/store"
)

func main() {
	addr := flag.String("addr", ":8090", "Listen address")
	dbPath := flag.String("db", "licenses.db", "SQLite database path")
	keyDir := flag.String("keys", "keys", "Directory for ECDSA keys")
	genKeys := flag.Bool("generate-keys", false, "Generate new ECDSA key pair and exit")
	flag.Parse()

	// Key generation mode
	if *genKeys {
		kp, err := crypto.GenerateKeyPair()
		if err != nil {
			log.Fatalf("Generate keys: %v", err)
		}
		os.MkdirAll(*keyDir, 0700)
		privPath := *keyDir + "/private.pem"
		pubPath := *keyDir + "/public.pem"
		if err := kp.SavePrivateKey(privPath); err != nil {
			log.Fatalf("Save private key: %v", err)
		}
		if err := kp.SavePublicKey(pubPath); err != nil {
			log.Fatalf("Save public key: %v", err)
		}
		fmt.Printf("Keys generated:\n  Private: %s\n  Public:  %s\n", privPath, pubPath)
		fmt.Println("Keep private.pem SECRET. Distribute public.pem with your software.")
		return
	}

	// Load keys
	privPath := *keyDir + "/private.pem"
	if _, err := os.Stat(privPath); os.IsNotExist(err) {
		log.Println("No keys found. Generating new key pair...")
		kp, err := crypto.GenerateKeyPair()
		if err != nil {
			log.Fatalf("Generate keys: %v", err)
		}
		os.MkdirAll(*keyDir, 0700)
		if err := kp.SavePrivateKey(privPath); err != nil {
			log.Fatalf("Save private key: %v", err)
		}
		pubPath := *keyDir + "/public.pem"
		if err := kp.SavePublicKey(pubPath); err != nil {
			log.Fatalf("Save public key: %v", err)
		}
		log.Printf("Keys generated in %s/", *keyDir)
	}

	kp, err := crypto.LoadPrivateKey(privPath)
	if err != nil {
		log.Fatalf("Load keys: %v", err)
	}
	log.Println("ECDSA P-256 keys loaded")

	// Open database
	db, err := store.Open(*dbPath)
	if err != nil {
		log.Fatalf("Open database: %v", err)
	}
	defer db.Close()
	log.Printf("Database: %s", *dbPath)

	// Env vars
	whopSecret := os.Getenv("WHOP_WEBHOOK_SECRET")
	serviceSecret := os.Getenv("LICENSE_SERVICE_SECRET")
	if serviceSecret == "" {
		log.Fatal("FATAL: LICENSE_SERVICE_SECRET not set. Cannot start without a service secret.")
	}

	// Router
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(requestLogger())
	r.Use(rateLimiter())

	h := handlers.New(db, kp, whopSecret, serviceSecret)

	// Signed downloads
	downloadSecret := os.Getenv("DOWNLOAD_SECRET")
	if downloadSecret == "" {
		downloadSecret = serviceSecret // Reuse service secret in dev
	}
	downloadBaseURL := os.Getenv("DOWNLOAD_BASE_URL")
	if downloadBaseURL == "" {
		downloadBaseURL = "http://localhost:8090"
	}
	filesDir := os.Getenv("FILES_DIR")
	if filesDir == "" {
		filesDir = "files"
	}
	os.MkdirAll(filesDir, 0755)
	dm := delivery.NewDownloadManager(downloadSecret, downloadBaseURL, filesDir)
	dm.RegisterRoutes(r)
	h.SetDownloadManager(dm)
	log.Printf("Downloads: %s → %s", filesDir, downloadBaseURL)

	// Seed default admin if none exists
	if db.AdminUserCount() == 0 {
		adminPass := os.Getenv("ADMIN_DEFAULT_PASSWORD")
		if adminPass == "" {
			log.Println("WARNING: No admin user exists and ADMIN_DEFAULT_PASSWORD not set. Set it to create the initial admin.")
		} else {
			db.CreateAdminUser("admin", adminPass, "super_admin")
			log.Println("Default admin user created (username: admin). Change the password immediately.")
		}
	}

	// Public endpoints
	r.GET("/health", h.Health)
	r.POST("/api/v1/licenses/validate", h.ValidateLicense)
	r.POST("/api/v1/licenses/rebind", h.RebindMachine)

	// Auth endpoints
	r.POST("/api/v1/auth/admin/login", h.AdminLogin)
	r.GET("/api/v1/auth/admin/me", h.AdminMe)
	r.POST("/api/v1/auth/admin/logout", h.AdminLogout)
	r.POST("/api/v1/auth/customer/login", h.CustomerLogin)
	r.GET("/api/v1/auth/customer/me", h.CustomerMe)
	r.POST("/api/v1/auth/customer/logout", h.CustomerLogout)

	// Customer portal (requires customer session)
	r.GET("/api/v1/portal/products", h.CustomerProducts)
	r.GET("/api/v1/portal/devices", h.CustomerDevices)

	// Webhook (Whop calls this)
	r.POST("/api/v1/webhooks/whop", h.WhopWebhook)

	// Admin/Service endpoints (require service secret)
	r.POST("/api/v1/licenses/generate", h.GenerateLicense)
	r.POST("/api/v1/downloads/sign", h.SignDownloadURL)
	r.GET("/api/v1/products", h.ListProducts)
	r.GET("/api/v1/products/:id", h.GetProduct)
	r.POST("/api/v1/products", h.CreateProduct)

	log.Printf("License Server starting on %s", *addr)
	if err := r.Run(*addr); err != nil {
		log.Fatalf("Server: %v", err)
	}
}

// requestLogger logs each request with timing.
func requestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		log.Printf("%s %s %d %s",
			c.Request.Method, c.Request.URL.Path, c.Writer.Status(), time.Since(start).Round(time.Microsecond))
	}
}

// rateLimiter implements simple per-IP rate limiting.
// In production, use a proper rate limiter (redis-based).
func rateLimiter() gin.HandlerFunc {
	type entry struct {
		count int
		reset time.Time
	}
	clients := make(map[string]*entry)

	return func(c *gin.Context) {
		// Only rate-limit validation endpoint
		if c.Request.URL.Path != "/api/v1/licenses/validate" {
			c.Next()
			return
		}

		ip := c.ClientIP()
		now := time.Now()

		e, ok := clients[ip]
		if !ok || now.After(e.reset) {
			clients[ip] = &entry{count: 1, reset: now.Add(time.Minute)}
			c.Next()
			return
		}

		e.count++
		if e.count > 30 { // 30 requests per minute per IP
			c.JSON(429, gin.H{"error": "rate_limit_exceeded", "retry_after": int(time.Until(e.reset).Seconds())})
			c.Abort()
			return
		}

		c.Next()
	}
}
