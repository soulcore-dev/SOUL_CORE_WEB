package store

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AdminUser struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"` // super_admin, admin
	CreatedAt    time.Time `json:"created_at"`
}

type Customer struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type CustomerDevice struct {
	LicenseID   string `json:"license_id"`
	ProductName string `json:"product_name"`
	MachineHash string `json:"machine_hash"`
	BoundAt     string `json:"bound_at"`
	Status      string `json:"status"`
}

type CustomerProduct struct {
	LicenseID   string  `json:"license_id"`
	LicenseKey  string  `json:"license_key"`
	ProductID   int     `json:"product_id"`
	ProductName string  `json:"product_name"`
	ProductSlug string  `json:"product_slug"`
	ProductIcon string  `json:"product_icon"`
	MachineHash string  `json:"machine_hash"`
	Status      string  `json:"status"`
	IssuedAt    string  `json:"issued_at"`
	ExpiresAt   string  `json:"expires_at,omitempty"`
	RebindCount int     `json:"rebind_count"`
}

func (db *DB) migrateAuth() error {
	_, err := db.conn.Exec(`
		CREATE TABLE IF NOT EXISTS admin_users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			role TEXT DEFAULT 'admin',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS customers (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT UNIQUE NOT NULL,
			name TEXT DEFAULT '',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_type TEXT NOT NULL,
			user_id INTEGER NOT NULL,
			expires_at DATETIME NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`)
	return err
}

// --- Password hashing ---

func HashPassword(password string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		// Fallback should never happen with valid input
		salt := make([]byte, 16)
		rand.Read(salt)
		return "bcrypt-error:" + hex.EncodeToString(salt)
	}
	return string(hash)
}

func VerifyPassword(stored, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(stored), []byte(password))
	return err == nil
}

// --- Admin Users ---

func (db *DB) CreateAdminUser(username, password, role string) error {
	hash := HashPassword(password)
	_, err := db.conn.Exec(
		"INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)",
		username, hash, role,
	)
	return err
}

func (db *DB) AuthenticateAdmin(username, password string) (*AdminUser, error) {
	u := &AdminUser{}
	err := db.conn.QueryRow(
		"SELECT id, username, password_hash, role, created_at FROM admin_users WHERE username = ?",
		username,
	).Scan(&u.ID, &u.Username, &u.PasswordHash, &u.Role, &u.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}
	if !VerifyPassword(u.PasswordHash, password) {
		return nil, fmt.Errorf("invalid password")
	}
	return u, nil
}

func (db *DB) AdminUserCount() int {
	var count int
	db.conn.QueryRow("SELECT COUNT(*) FROM admin_users").Scan(&count)
	return count
}

// --- Customers ---

func (db *DB) GetOrCreateCustomer(email, name string) (*Customer, error) {
	c := &Customer{}
	err := db.conn.QueryRow(
		"SELECT id, email, name, created_at FROM customers WHERE email = ?", email,
	).Scan(&c.ID, &c.Email, &c.Name, &c.CreatedAt)
	if err == sql.ErrNoRows {
		res, err := db.conn.Exec(
			"INSERT INTO customers (email, name) VALUES (?, ?)", email, name,
		)
		if err != nil {
			return nil, err
		}
		id, _ := res.LastInsertId()
		c.ID = int(id)
		c.Email = email
		c.Name = name
		c.CreatedAt = time.Now()
		return c, nil
	}
	return c, err
}

func (db *DB) AuthenticateCustomer(email, licenseKey string) (*Customer, error) {
	// Verify the customer owns this license
	var customerEmail string
	err := db.conn.QueryRow(
		"SELECT customer_email FROM licenses WHERE license_key = ? AND status = 'active'",
		licenseKey,
	).Scan(&customerEmail)
	if err != nil {
		return nil, fmt.Errorf("invalid license")
	}
	if customerEmail != email {
		return nil, fmt.Errorf("email mismatch")
	}
	return db.GetOrCreateCustomer(email, "")
}

// --- Sessions ---

func (db *DB) CreateSession(userType string, userID int, duration time.Duration) (string, error) {
	id := make([]byte, 32)
	rand.Read(id)
	token := hex.EncodeToString(id)
	expires := time.Now().Add(duration)
	_, err := db.conn.Exec(
		"INSERT INTO sessions (id, user_type, user_id, expires_at) VALUES (?, ?, ?, ?)",
		token, userType, userID, expires,
	)
	return token, err
}

func (db *DB) ValidateSession(token, userType string) (int, error) {
	var userID int
	var expiresAt time.Time
	err := db.conn.QueryRow(
		"SELECT user_id, expires_at FROM sessions WHERE id = ? AND user_type = ?",
		token, userType,
	).Scan(&userID, &expiresAt)
	if err != nil {
		return 0, fmt.Errorf("invalid session")
	}
	if time.Now().After(expiresAt) {
		db.conn.Exec("DELETE FROM sessions WHERE id = ?", token)
		return 0, fmt.Errorf("session expired")
	}
	return userID, nil
}

func (db *DB) DeleteSession(token string) {
	db.conn.Exec("DELETE FROM sessions WHERE id = ?", token)
}

// --- Customer Portal Queries ---

func (db *DB) GetCustomerProducts(email string) ([]CustomerProduct, error) {
	rows, err := db.conn.Query(`
		SELECT l.id, l.license_key, l.product_id, p.name, p.slug, p.icon,
		       l.machine_hash, l.status, l.issued_at, l.expires_at, l.rebind_count
		FROM licenses l
		JOIN products p ON l.product_id = p.id
		WHERE l.customer_email = ?
		ORDER BY l.issued_at DESC`, email,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []CustomerProduct
	for rows.Next() {
		var cp CustomerProduct
		var expiresAt sql.NullTime
		var issuedAt time.Time
		err := rows.Scan(&cp.LicenseID, &cp.LicenseKey, &cp.ProductID, &cp.ProductName,
			&cp.ProductSlug, &cp.ProductIcon, &cp.MachineHash, &cp.Status, &issuedAt, &expiresAt, &cp.RebindCount)
		if err != nil {
			return nil, err
		}
		cp.IssuedAt = issuedAt.Format("2006-01-02")
		if expiresAt.Valid {
			cp.ExpiresAt = expiresAt.Time.Format("2006-01-02")
		}
		products = append(products, cp)
	}
	return products, nil
}

func (db *DB) GetCustomerDevices(email string) ([]CustomerDevice, error) {
	rows, err := db.conn.Query(`
		SELECT l.id, p.name, l.machine_hash, l.bound_at, l.status
		FROM licenses l
		JOIN products p ON l.product_id = p.id
		WHERE l.customer_email = ? AND l.machine_hash != ''
		ORDER BY l.bound_at DESC`, email,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []CustomerDevice
	for rows.Next() {
		var d CustomerDevice
		var boundAt sql.NullTime
		err := rows.Scan(&d.LicenseID, &d.ProductName, &d.MachineHash, &boundAt, &d.Status)
		if err != nil {
			return nil, err
		}
		if boundAt.Valid {
			d.BoundAt = boundAt.Time.Format("2006-01-02 15:04")
		}
		devices = append(devices, d)
	}
	return devices, nil
}
