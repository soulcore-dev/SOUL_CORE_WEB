package handlers

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/soul-core/license-server/internal/crypto"
	"github.com/soul-core/license-server/internal/delivery"
	"github.com/soul-core/license-server/internal/store"
)

const maxRebindsPerYear = 3

type Handler struct {
	db              *store.DB
	keyPair         *crypto.KeyPair
	whopSecret      string
	serviceSecret   string
	downloadManager *delivery.DownloadManager
}

func New(db *store.DB, kp *crypto.KeyPair, whopSecret, serviceSecret string) *Handler {
	return &Handler{
		db:            db,
		keyPair:       kp,
		whopSecret:    whopSecret,
		serviceSecret: serviceSecret,
	}
}

// --- Health ---

func (h *Handler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "license-server", "time": time.Now().UTC()})
}

// --- Validate License ---

type ValidateRequest struct {
	LicenseKey  string `json:"license_key" binding:"required"`
	MachineHash string `json:"machine_hash,omitempty"`
	ProductID   int    `json:"product_id,omitempty"`
}

type ValidateResponse struct {
	Valid       bool   `json:"valid"`
	CustomerID  string `json:"customer_id,omitempty"`
	ProductName string `json:"product_name,omitempty"`
	ExpiresAt   string `json:"expires_at,omitempty"`
	Features    int    `json:"features,omitempty"`
	Warning     string `json:"warning,omitempty"`
	Reason      string `json:"reason,omitempty"`
}

func (h *Handler) ValidateLicense(c *gin.Context) {
	var req ValidateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ValidateResponse{Valid: false, Reason: "invalid_request"})
		return
	}

	// 1. Cryptographic validation (offline-capable with public key)
	data, err := crypto.ValidateLicenseKey(h.keyPair.Public, req.LicenseKey)
	if err != nil {
		reason := "signature_invalid"
		if strings.Contains(err.Error(), "expired") {
			reason = "license_expired"
		}
		c.JSON(http.StatusOK, ValidateResponse{Valid: false, Reason: reason})
		return
	}

	// 2. Database lookup for status and machine binding
	lic, err := h.db.GetLicenseByKey(req.LicenseKey)
	if err != nil {
		// Key is cryptographically valid but not in DB — accept (offline-generated)
		c.JSON(http.StatusOK, ValidateResponse{
			Valid:      true,
			CustomerID: data.CustomerID,
			Features:   int(data.Features),
		})
		return
	}

	// 3. Check license status
	if lic.Status != "active" {
		c.JSON(http.StatusOK, ValidateResponse{Valid: false, Reason: "license_" + lic.Status})
		return
	}

	// 4. Machine binding
	if req.MachineHash != "" {
		if lic.MachineHash == "" {
			// First activation — bind to this machine
			_ = h.db.BindMachine(lic.ID, req.MachineHash)
		} else if !crypto.ValidateMachineBinding(lic.MachineHash, req.MachineHash) {
			c.JSON(http.StatusOK, ValidateResponse{Valid: false, Reason: "machine_mismatch"})
			_ = h.db.RecordValidation(lic.ID, req.MachineHash, c.ClientIP(), false)
			return
		}
	}

	// 5. Record successful validation
	_ = h.db.RecordValidation(lic.ID, req.MachineHash, c.ClientIP(), true)

	// 6. Build response
	resp := ValidateResponse{
		Valid:      true,
		CustomerID: lic.CustomerID,
		Features:   int(data.Features),
	}

	if lic.ExpiresAt != nil {
		resp.ExpiresAt = lic.ExpiresAt.Format(time.RFC3339)
		daysLeft := int(time.Until(*lic.ExpiresAt).Hours() / 24)
		if daysLeft > 0 && daysLeft <= 30 {
			resp.Warning = fmt.Sprintf("License expires in %d days", daysLeft)
		}
	}

	c.JSON(http.StatusOK, resp)
}

// --- Rebind Machine ---

type RebindRequest struct {
	LicenseKey     string `json:"license_key" binding:"required"`
	NewMachineHash string `json:"new_machine_hash" binding:"required"`
}

func (h *Handler) RebindMachine(c *gin.Context) {
	var req RebindRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
		return
	}

	lic, err := h.db.GetLicenseByKey(req.LicenseKey)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "license_not_found"})
		return
	}

	if lic.RebindCount >= maxRebindsPerYear {
		c.JSON(http.StatusForbidden, gin.H{"error": "rebind_limit_exceeded", "max": maxRebindsPerYear})
		return
	}

	if err := h.db.RebindMachine(lic.ID, req.NewMachineHash); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "rebind_failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":          true,
		"rebinds_used":     lic.RebindCount + 1,
		"rebinds_remaining": maxRebindsPerYear - lic.RebindCount - 1,
	})
}

// --- Generate License (Internal / Service-to-Service) ---

type GenerateRequest struct {
	CustomerEmail    string `json:"customer_email" binding:"required"`
	CustomerID       string `json:"customer_id"`
	ProductSlug      string `json:"product_slug" binding:"required"`
	WhopMembershipID string `json:"whop_membership_id"`
	ExpiresInDays    int    `json:"expires_in_days"` // 0 = perpetual
}

type GenerateResponse struct {
	LicenseKey string `json:"license_key"`
	ProductName string `json:"product_name"`
	IssuedAt    string `json:"issued_at"`
	ExpiresAt   string `json:"expires_at,omitempty"`
}

func (h *Handler) GenerateLicense(c *gin.Context) {
	// Auth: service secret
	auth := c.GetHeader("Authorization")
	if auth != "Bearer "+h.serviceSecret {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find product
	product, err := h.db.GetProductBySlug(req.ProductSlug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product_not_found"})
		return
	}

	// Generate customer ID if not provided
	custID := req.CustomerID
	if custID == "" {
		b := make([]byte, 16)
		rand.Read(b)
		custID = hex.EncodeToString(b)
	}
	// Ensure 32 hex chars
	if len(custID) > 32 {
		custID = custID[:32]
	}
	for len(custID) < 32 {
		custID = "0" + custID
	}

	// Calculate expiration
	var expiresAt int64
	var expiresTime *time.Time
	if req.ExpiresInDays > 0 {
		t := time.Now().AddDate(0, 0, req.ExpiresInDays)
		expiresAt = t.Unix()
		expiresTime = &t
	}

	// Generate ECDSA license key
	licData := crypto.LicenseData{
		ProductID:  uint32(product.ID),
		CustomerID: custID,
		ExpiresAt:  expiresAt,
		Features:   uint16(product.FeaturesMask),
	}
	licenseKey, err := crypto.GenerateLicenseKey(h.keyPair, licData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "key_generation_failed"})
		return
	}

	// Generate UUID for license record
	idBytes := make([]byte, 16)
	rand.Read(idBytes)
	licID := hex.EncodeToString(idBytes)

	// Store in DB
	lic := &store.License{
		ID:               licID,
		ProductID:        product.ID,
		CustomerID:       custID,
		CustomerEmail:    req.CustomerEmail,
		LicenseKey:       licenseKey,
		Status:           "active",
		WhopMembershipID: req.WhopMembershipID,
		ExpiresAt:        expiresTime,
	}
	if err := h.db.CreateLicense(lic); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "store_failed"})
		return
	}

	resp := GenerateResponse{
		LicenseKey:  licenseKey,
		ProductName: product.Name,
		IssuedAt:    time.Now().Format(time.RFC3339),
	}
	if expiresTime != nil {
		resp.ExpiresAt = expiresTime.Format(time.RFC3339)
	}

	log.Printf("[LICENSE] Generated for %s — product=%s key=%s...%s",
		req.CustomerEmail, product.Slug, licenseKey[:15], licenseKey[len(licenseKey)-8:])

	c.JSON(http.StatusCreated, resp)
}

// --- Whop Webhook ---

type WhopWebhookPayload struct {
	Event string `json:"event"`
	Data  struct {
		ID   string `json:"id"`
		User struct {
			ID    string `json:"id"`
			Email string `json:"email"`
		} `json:"user"`
		Product struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"product"`
		Plan struct {
			ID        string `json:"id"`
			PlanType  string `json:"plan_type"`
			RenewalPeriod string `json:"renewal_period"`
		} `json:"plan"`
	} `json:"data"`
}

func (h *Handler) WhopWebhook(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "read_body_failed"})
		return
	}

	// Verify HMAC-SHA256 signature
	if h.whopSecret != "" {
		sig := c.GetHeader("X-Whop-Signature")
		if sig == "" {
			sig = c.GetHeader("whop-signature")
		}
		if sig != "" {
			mac := hmac.New(sha256.New, []byte(h.whopSecret))
			mac.Write(body)
			expected := hex.EncodeToString(mac.Sum(nil))
			if !hmac.Equal([]byte(sig), []byte(expected)) {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_signature"})
				return
			}
		}
	}

	var payload WhopWebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_json"})
		return
	}

	// Store webhook for audit
	_ = h.db.StoreWebhook(
		payload.Event,
		payload.Data.ID,
		payload.Data.User.Email,
		string(body),
	)

	log.Printf("[WHOP] Event: %s | membership=%s | email=%s", payload.Event, payload.Data.ID, payload.Data.User.Email)

	switch payload.Event {
	case "membership.went_valid", "membership_activated", "membership.created":
		// Customer purchased — find product and generate license
		product, err := h.db.GetProductByWhopID(payload.Data.Product.ID)
		if err != nil {
			log.Printf("[WHOP] Product not found for whop_id=%s, skipping", payload.Data.Product.ID)
			c.JSON(http.StatusOK, gin.H{"status": "product_not_found"})
			return
		}

		// Determine expiration based on plan type
		expiresInDays := 0
		switch payload.Data.Plan.PlanType {
		case "renewal":
			switch payload.Data.Plan.RenewalPeriod {
			case "monthly":
				expiresInDays = 31
			case "yearly":
				expiresInDays = 366
			case "weekly":
				expiresInDays = 8
			default:
				expiresInDays = 31
			}
		}
		// one_time and free = perpetual (0)

		// Generate customer ID from Whop user ID
		custID := fmt.Sprintf("%032s", payload.Data.User.ID)
		if len(custID) > 32 {
			custID = custID[:32]
		}

		var expiresAt int64
		var expiresTime *time.Time
		if expiresInDays > 0 {
			t := time.Now().AddDate(0, 0, expiresInDays)
			expiresAt = t.Unix()
			expiresTime = &t
		}

		licData := crypto.LicenseData{
			ProductID:  uint32(product.ID),
			CustomerID: custID,
			ExpiresAt:  expiresAt,
			Features:   uint16(product.FeaturesMask),
		}
		licenseKey, err := crypto.GenerateLicenseKey(h.keyPair, licData)
		if err != nil {
			log.Printf("[WHOP] License generation failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "generation_failed"})
			return
		}

		idBytes := make([]byte, 16)
		rand.Read(idBytes)

		lic := &store.License{
			ID:               hex.EncodeToString(idBytes),
			ProductID:        product.ID,
			CustomerID:       custID,
			CustomerEmail:    payload.Data.User.Email,
			LicenseKey:       licenseKey,
			Status:           "active",
			WhopMembershipID: payload.Data.ID,
			ExpiresAt:        expiresTime,
		}
		if err := h.db.CreateLicense(lic); err != nil {
			log.Printf("[WHOP] Store license failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "store_failed"})
			return
		}

		log.Printf("[WHOP] License generated: product=%s email=%s key=%s...%s",
			product.Name, payload.Data.User.Email, licenseKey[:15], licenseKey[len(licenseKey)-8:])

		// TODO: Send email with license key + download link
		c.JSON(http.StatusOK, gin.H{"status": "license_generated", "license_key": licenseKey})

	case "membership.went_invalid", "membership_deactivated", "membership.canceled":
		_ = h.db.SuspendByWhopMembership(payload.Data.ID)
		log.Printf("[WHOP] License suspended: membership=%s", payload.Data.ID)
		c.JSON(http.StatusOK, gin.H{"status": "license_suspended"})

	default:
		log.Printf("[WHOP] Unhandled event: %s", payload.Event)
		c.JSON(http.StatusOK, gin.H{"status": "ignored", "event": payload.Event})
	}
}

// --- List Products (Admin) ---

func (h *Handler) ListProducts(c *gin.Context) {
	products, err := h.db.ListProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": products})
}

// --- Create Product (Admin) ---

type CreateProductRequest struct {
	Name          string `json:"name" binding:"required"`
	Slug          string `json:"slug" binding:"required"`
	Tagline       string `json:"tagline"`
	Description   string `json:"description"`
	Icon          string `json:"icon"`
	Category      string `json:"category"`
	Color         string `json:"color"`
	TechStack     string `json:"tech_stack"`
	Version       string `json:"version"`
	UpdatedAt     string `json:"updated_at"`
	DemoURL       string `json:"demo_url"`
	Author        string `json:"author"`
	AuthorAvatar  string `json:"author_avatar"`
	PriceCents    int    `json:"price_cents"`
	PriceType     string `json:"price_type"`
	Badge         string `json:"badge"`
	Downloads     int    `json:"downloads"`
	Rating        int    `json:"rating"`
	ReviewCount   int    `json:"review_count"`
	Features      string `json:"features"`
	Specs         string `json:"specs"`
	WhopProductID string `json:"whop_product_id"`
	FeaturesMask  int    `json:"features_mask"`
}

func (h *Handler) CreateProduct(c *gin.Context) {
	auth := c.GetHeader("Authorization")
	if auth != "Bearer "+h.serviceSecret {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.FeaturesMask == 0 { req.FeaturesMask = 65535 }
	if req.Icon == "" { req.Icon = "Package" }
	if req.PriceType == "" { req.PriceType = "one_time" }
	if req.Features == "" { req.Features = "[]" }
	if req.Specs == "" { req.Specs = "{}" }
	if req.TechStack == "" { req.TechStack = "[]" }
	if req.Version == "" { req.Version = "1.0.0" }
	if req.Author == "" { req.Author = "SoulCore Dev" }

	p := &store.Product{
		Name: req.Name, Slug: req.Slug, Tagline: req.Tagline, Description: req.Description,
		Icon: req.Icon, Category: req.Category, Color: req.Color,
		TechStack: req.TechStack, Version: req.Version, UpdatedAt: req.UpdatedAt,
		DemoURL: req.DemoURL, Author: req.Author, AuthorAvatar: req.AuthorAvatar,
		PriceCents: req.PriceCents, PriceType: req.PriceType,
		Badge: req.Badge, Downloads: req.Downloads, Rating: req.Rating, ReviewCount: req.ReviewCount,
		Features: req.Features, Specs: req.Specs, WhopProductID: req.WhopProductID,
		FeaturesMask: req.FeaturesMask, Visible: true,
	}
	if err := h.db.CreateProduct(p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, p)
}

func (h *Handler) GetProduct(c *gin.Context) {
	idStr := c.Param("id")
	id := 0
	fmt.Sscanf(idStr, "%d", &id)
	if id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_id"})
		return
	}
	p, err := h.db.GetProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

// --- Download Manager ---

func (h *Handler) SetDownloadManager(dm *delivery.DownloadManager) {
	h.downloadManager = dm
}

// --- Sign Download URL ---

type SignDownloadRequest struct {
	FilePath    string `json:"file_path" binding:"required"`
	ValidHours int    `json:"valid_hours"` // default 24
}

func (h *Handler) SignDownloadURL(c *gin.Context) {
	auth := c.GetHeader("Authorization")
	if auth != "Bearer "+h.serviceSecret {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req SignDownloadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if h.downloadManager == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "downloads_not_configured"})
		return
	}

	hours := req.ValidHours
	if hours <= 0 {
		hours = 24
	}

	url := h.downloadManager.GenerateSignedURL(req.FilePath, time.Duration(hours)*time.Hour)
	c.JSON(http.StatusOK, gin.H{"download_url": url, "expires_in_hours": hours})
}
