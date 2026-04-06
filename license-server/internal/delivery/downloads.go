package delivery

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// DownloadManager handles secure file delivery with signed URLs.
// Uses HMAC-SHA256 signed tokens instead of S3/CloudFront — works with any
// file storage (local, S3, or served by Nginx).
type DownloadManager struct {
	secret   string // HMAC signing secret
	baseURL  string // Public base URL for downloads (e.g. https://cdn.soulcore.dev)
	filesDir string // Local directory for files (if serving locally)
}

// NewDownloadManager creates a new download manager.
func NewDownloadManager(secret, baseURL, filesDir string) *DownloadManager {
	return &DownloadManager{
		secret:   secret,
		baseURL:  baseURL,
		filesDir: filesDir,
	}
}

// GenerateSignedURL creates a time-limited download URL.
// The URL contains the file path, expiration timestamp, and HMAC signature.
// Format: {baseURL}/download/{path}?expires={unix}&sig={hmac}
func (dm *DownloadManager) GenerateSignedURL(filePath string, validFor time.Duration) string {
	expires := time.Now().Add(validFor).Unix()
	sig := dm.sign(filePath, expires)
	return fmt.Sprintf("%s/download/%s?expires=%d&sig=%s", dm.baseURL, filePath, expires, sig)
}

// sign creates an HMAC-SHA256 signature for a path + expiration.
func (dm *DownloadManager) sign(path string, expires int64) string {
	msg := fmt.Sprintf("%s:%d", path, expires)
	mac := hmac.New(sha256.New, []byte(dm.secret))
	mac.Write([]byte(msg))
	return hex.EncodeToString(mac.Sum(nil))
}

// VerifyAndServe validates the signed URL and serves the file.
func (dm *DownloadManager) VerifyAndServe(c *gin.Context) {
	path := c.Param("filepath")
	if path == "" || path == "/" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing_path"})
		return
	}
	// Remove leading slash if present
	if path[0] == '/' {
		path = path[1:]
	}

	expiresStr := c.Query("expires")
	sig := c.Query("sig")

	if expiresStr == "" || sig == "" {
		c.JSON(http.StatusForbidden, gin.H{"error": "missing_signature"})
		return
	}

	expires, err := strconv.ParseInt(expiresStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_expires"})
		return
	}

	// Check expiration
	if time.Now().Unix() > expires {
		c.JSON(http.StatusGone, gin.H{"error": "link_expired"})
		return
	}

	// Verify signature
	expected := dm.sign(path, expires)
	if !hmac.Equal([]byte(sig), []byte(expected)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "invalid_signature"})
		return
	}

	// Serve the file
	fullPath := dm.filesDir + "/" + path
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", path))
	c.File(fullPath)
}

// RegisterRoutes adds download routes to the router.
func (dm *DownloadManager) RegisterRoutes(r *gin.Engine) {
	r.GET("/download/*filepath", dm.VerifyAndServe)
}
