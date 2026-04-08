package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// --- Admin Auth ---

type AdminLoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *Handler) AdminLogin(c *gin.Context) {
	var req AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
		return
	}

	user, err := h.db.AuthenticateAdmin(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_credentials"})
		return
	}

	token, err := h.db.CreateSession("admin", user.ID, 24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "session_failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":    token,
		"username": user.Username,
		"role":     user.Role,
	})
}

func (h *Handler) AdminMe(c *gin.Context) {
	token := extractToken(c)
	userID, err := h.db.ValidateSession(token, "admin")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_session"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user_id": userID, "type": "admin"})
}

func (h *Handler) AdminLogout(c *gin.Context) {
	token := extractToken(c)
	h.db.DeleteSession(token)
	c.JSON(http.StatusOK, gin.H{"status": "logged_out"})
}

// --- Customer Auth ---

type CustomerLoginRequest struct {
	Email      string `json:"email" binding:"required"`
	LicenseKey string `json:"license_key" binding:"required"`
}

func (h *Handler) CustomerLogin(c *gin.Context) {
	var req CustomerLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
		return
	}

	customer, err := h.db.AuthenticateCustomer(req.Email, req.LicenseKey)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_credentials"})
		return
	}

	token, err := h.db.CreateSession("customer", customer.ID, 7*24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "session_failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"email": customer.Email,
		"name":  customer.Name,
	})
}

func (h *Handler) CustomerMe(c *gin.Context) {
	token := extractToken(c)
	userID, err := h.db.ValidateSession(token, "customer")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_session"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user_id": userID, "type": "customer"})
}

func (h *Handler) CustomerProducts(c *gin.Context) {
	email, err := h.getCustomerEmail(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_session"})
		return
	}

	products, err := h.db.GetCustomerProducts(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": products})
}

func (h *Handler) CustomerDevices(c *gin.Context) {
	email, err := h.getCustomerEmail(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_session"})
		return
	}

	devices, err := h.db.GetCustomerDevices(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": devices})
}

func (h *Handler) CustomerLogout(c *gin.Context) {
	token := extractToken(c)
	h.db.DeleteSession(token)
	c.JSON(http.StatusOK, gin.H{"status": "logged_out"})
}

// --- Helpers ---

func extractToken(c *gin.Context) string {
	auth := c.GetHeader("Authorization")
	if strings.HasPrefix(auth, "Bearer ") {
		return strings.TrimPrefix(auth, "Bearer ")
	}
	return c.Query("token")
}

func (h *Handler) getCustomerEmail(c *gin.Context) (string, error) {
	token := extractToken(c)
	userID, err := h.db.ValidateSession(token, "customer")
	if err != nil {
		return "", err
	}
	// Get email from customer ID
	var email string
	// We need to access the customer table — add a helper
	row := h.db.GetConn().QueryRow("SELECT email FROM customers WHERE id = ?", userID)
	err = row.Scan(&email)
	return email, err
}
