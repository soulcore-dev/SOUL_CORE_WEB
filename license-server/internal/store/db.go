package store

import (
	"database/sql"
	"fmt"
	"time"

	_ "modernc.org/sqlite"
)

type DB struct {
	conn *sql.DB
}

type Product struct {
	ID            int    `json:"id"`
	Name          string `json:"name"`
	Slug          string `json:"slug"`
	Tagline       string `json:"tagline,omitempty"`
	Description   string `json:"description,omitempty"`
	Icon          string `json:"icon,omitempty"`
	Category      string `json:"category,omitempty"`
	Color         string `json:"color,omitempty"`          // tailwind gradient e.g. "from-violet-500 to-purple-600"
	TechStack     string `json:"tech_stack,omitempty"`     // JSON array of tech tags
	Version       string `json:"version,omitempty"`        // e.g. "1.2.0"
	UpdatedAt     string `json:"updated_at,omitempty"`     // e.g. "2026-04-01"
	DemoURL       string `json:"demo_url,omitempty"`       // live demo link
	Author        string `json:"author,omitempty"`         // e.g. "SoulCore Dev"
	AuthorAvatar  string `json:"author_avatar,omitempty"`  // URL or empty for default
	PriceCents    int    `json:"price_cents"`
	PriceType     string `json:"price_type,omitempty"`
	Badge         string `json:"badge,omitempty"`
	Downloads     int    `json:"downloads"`
	Rating        int    `json:"rating"`
	ReviewCount   int    `json:"review_count"`
	Features      string `json:"features,omitempty"`
	Specs         string `json:"specs,omitempty"`
	WhopProductID string `json:"whop_product_id,omitempty"`
	FeaturesMask  int    `json:"features_mask"`
	Visible       bool   `json:"visible"`
}

type License struct {
	ID              string     `json:"id"`
	ProductID       int        `json:"product_id"`
	CustomerID      string     `json:"customer_id"`
	CustomerEmail   string     `json:"customer_email"`
	LicenseKey      string     `json:"license_key"`
	MachineHash     string     `json:"machine_hash,omitempty"`
	BoundAt         *time.Time `json:"bound_at,omitempty"`
	IssuedAt        time.Time  `json:"issued_at"`
	ExpiresAt       *time.Time `json:"expires_at,omitempty"`
	Status          string     `json:"status"` // active, suspended, revoked
	LastValidatedAt *time.Time `json:"last_validated_at,omitempty"`
	ValidationCount int        `json:"validation_count"`
	RebindCount     int        `json:"rebind_count"`
	WhopMembershipID string   `json:"whop_membership_id,omitempty"`
}

func Open(dbPath string) (*DB, error) {
	conn, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}
	conn.SetMaxOpenConns(1) // SQLite single-writer
	db := &DB{conn: conn}
	if err := db.migrate(); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}
	if err := db.migrateAuth(); err != nil {
		return nil, fmt.Errorf("migrate auth: %w", err)
	}
	return db, nil
}

func (db *DB) Close() error {
	return db.conn.Close()
}

func (db *DB) GetConn() *sql.DB {
	return db.conn
}

func (db *DB) migrate() error {
	_, err := db.conn.Exec(`
		CREATE TABLE IF NOT EXISTS products (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			slug TEXT UNIQUE NOT NULL,
			tagline TEXT DEFAULT '',
			description TEXT DEFAULT '',
			icon TEXT DEFAULT 'Package',
			category TEXT DEFAULT '',
			color TEXT DEFAULT '',
			tech_stack TEXT DEFAULT '[]',
			version TEXT DEFAULT '1.0.0',
			updated_at TEXT DEFAULT '',
			demo_url TEXT DEFAULT '',
			author TEXT DEFAULT 'SoulCore Dev',
			author_avatar TEXT DEFAULT '',
			price_cents INTEGER DEFAULT 0,
			price_type TEXT DEFAULT 'one_time',
			badge TEXT DEFAULT '',
			downloads INTEGER DEFAULT 0,
			rating INTEGER DEFAULT 0,
			review_count INTEGER DEFAULT 0,
			features TEXT DEFAULT '[]',
			specs TEXT DEFAULT '{}',
			whop_product_id TEXT,
			features_mask INTEGER DEFAULT 65535,
			visible INTEGER DEFAULT 1
		);

		CREATE TABLE IF NOT EXISTS licenses (
			id TEXT PRIMARY KEY,
			product_id INTEGER NOT NULL REFERENCES products(id),
			customer_id TEXT NOT NULL,
			customer_email TEXT NOT NULL,
			license_key TEXT NOT NULL UNIQUE,
			machine_hash TEXT DEFAULT '',
			bound_at DATETIME,
			issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			expires_at DATETIME,
			status TEXT DEFAULT 'active',
			last_validated_at DATETIME,
			validation_count INTEGER DEFAULT 0,
			rebind_count INTEGER DEFAULT 0,
			whop_membership_id TEXT DEFAULT ''
		);

		CREATE TABLE IF NOT EXISTS validation_logs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			license_id TEXT REFERENCES licenses(id),
			validated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			machine_hash TEXT,
			ip_address TEXT,
			success INTEGER DEFAULT 1,
			offline INTEGER DEFAULT 0
		);

		CREATE TABLE IF NOT EXISTS whop_webhooks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			event_type TEXT,
			whop_membership_id TEXT,
			customer_email TEXT,
			payload TEXT,
			processed_at DATETIME,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);
		CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(customer_email);
		CREATE INDEX IF NOT EXISTS idx_validation_logs_license ON validation_logs(license_id);
	`)
	return err
}

// --- Products ---

func (db *DB) CreateProduct(p *Product) error {
	res, err := db.conn.Exec(`
		INSERT INTO products (name, slug, tagline, description, icon, category, color, tech_stack, version, updated_at, demo_url, author, author_avatar, price_cents, price_type, badge, downloads, rating, review_count, features, specs, whop_product_id, features_mask, visible)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		p.Name, p.Slug, p.Tagline, p.Description, p.Icon, p.Category,
		p.Color, p.TechStack, p.Version, p.UpdatedAt, p.DemoURL, p.Author, p.AuthorAvatar,
		p.PriceCents, p.PriceType, p.Badge, p.Downloads, p.Rating, p.ReviewCount,
		p.Features, p.Specs, p.WhopProductID, p.FeaturesMask, p.Visible,
	)
	if err != nil {
		return err
	}
	id, _ := res.LastInsertId()
	p.ID = int(id)
	return nil
}

const productCols = `id, name, slug, tagline, description, icon, category, color, tech_stack, version, updated_at, demo_url, author, author_avatar, price_cents, price_type, badge, downloads, rating, review_count, features, specs, whop_product_id, features_mask, visible`

func scanProduct(row interface{ Scan(...any) error }) (*Product, error) {
	p := &Product{}
	err := row.Scan(&p.ID, &p.Name, &p.Slug, &p.Tagline, &p.Description, &p.Icon, &p.Category,
		&p.Color, &p.TechStack, &p.Version, &p.UpdatedAt, &p.DemoURL, &p.Author, &p.AuthorAvatar,
		&p.PriceCents, &p.PriceType, &p.Badge, &p.Downloads, &p.Rating, &p.ReviewCount,
		&p.Features, &p.Specs, &p.WhopProductID, &p.FeaturesMask, &p.Visible)
	return p, err
}

func (db *DB) GetProductByID(id int) (*Product, error) {
	return scanProduct(db.conn.QueryRow("SELECT "+productCols+" FROM products WHERE id = ?", id))
}

func (db *DB) GetProductByWhopID(whopID string) (*Product, error) {
	return scanProduct(db.conn.QueryRow("SELECT "+productCols+" FROM products WHERE whop_product_id = ?", whopID))
}

func (db *DB) GetProductBySlug(slug string) (*Product, error) {
	return scanProduct(db.conn.QueryRow("SELECT "+productCols+" FROM products WHERE slug = ?", slug))
}

func (db *DB) ListProducts() ([]Product, error) {
	rows, err := db.conn.Query("SELECT " + productCols + " FROM products WHERE visible = 1 ORDER BY id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var products []Product
	for rows.Next() {
		p, err := scanProduct(rows)
		if err != nil {
			return nil, err
		}
		products = append(products, *p)
	}
	return products, nil
}

func (db *DB) UpdateProduct(p *Product) error {
	_, err := db.conn.Exec(`
		UPDATE products SET name=?, slug=?, tagline=?, description=?, icon=?, category=?,
		color=?, tech_stack=?, version=?, updated_at=?, demo_url=?, author=?, author_avatar=?,
		price_cents=?, price_type=?, badge=?, downloads=?, rating=?, review_count=?,
		features=?, specs=?, whop_product_id=?, features_mask=?, visible=? WHERE id=?`,
		p.Name, p.Slug, p.Tagline, p.Description, p.Icon, p.Category,
		p.Color, p.TechStack, p.Version, p.UpdatedAt, p.DemoURL, p.Author, p.AuthorAvatar,
		p.PriceCents, p.PriceType, p.Badge, p.Downloads, p.Rating, p.ReviewCount,
		p.Features, p.Specs, p.WhopProductID, p.FeaturesMask, p.Visible, p.ID,
	)
	return err
}

// --- Licenses ---

func (db *DB) CreateLicense(l *License) error {
	_, err := db.conn.Exec(`
		INSERT INTO licenses (id, product_id, customer_id, customer_email, license_key, status, whop_membership_id, expires_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		l.ID, l.ProductID, l.CustomerID, l.CustomerEmail, l.LicenseKey, l.Status, l.WhopMembershipID, l.ExpiresAt,
	)
	return err
}

func (db *DB) GetLicenseByKey(key string) (*License, error) {
	l := &License{}
	var boundAt, expiresAt, lastValidated sql.NullTime
	err := db.conn.QueryRow(`
		SELECT id, product_id, customer_id, customer_email, license_key, machine_hash,
		       bound_at, issued_at, expires_at, status, last_validated_at, validation_count, rebind_count, whop_membership_id
		FROM licenses WHERE license_key = ?`, key,
	).Scan(&l.ID, &l.ProductID, &l.CustomerID, &l.CustomerEmail, &l.LicenseKey, &l.MachineHash,
		&boundAt, &l.IssuedAt, &expiresAt, &l.Status, &lastValidated, &l.ValidationCount, &l.RebindCount, &l.WhopMembershipID,
	)
	if err != nil {
		return nil, err
	}
	if boundAt.Valid {
		l.BoundAt = &boundAt.Time
	}
	if expiresAt.Valid {
		l.ExpiresAt = &expiresAt.Time
	}
	if lastValidated.Valid {
		l.LastValidatedAt = &lastValidated.Time
	}
	return l, nil
}

func (db *DB) BindMachine(licenseID, machineHash string) error {
	now := time.Now()
	_, err := db.conn.Exec(
		"UPDATE licenses SET machine_hash = ?, bound_at = ? WHERE id = ?",
		machineHash, now, licenseID,
	)
	return err
}

func (db *DB) RebindMachine(licenseID, newHash string) error {
	now := time.Now()
	_, err := db.conn.Exec(
		"UPDATE licenses SET machine_hash = ?, bound_at = ?, rebind_count = rebind_count + 1 WHERE id = ?",
		newHash, now, licenseID,
	)
	return err
}

func (db *DB) RecordValidation(licenseID, machineHash, ip string, success bool) error {
	now := time.Now()
	_, err := db.conn.Exec(`
		INSERT INTO validation_logs (license_id, validated_at, machine_hash, ip_address, success)
		VALUES (?, ?, ?, ?, ?)`, licenseID, now, machineHash, ip, success,
	)
	if err != nil {
		return err
	}
	if success {
		_, err = db.conn.Exec(
			"UPDATE licenses SET last_validated_at = ?, validation_count = validation_count + 1 WHERE id = ?",
			now, licenseID,
		)
	}
	return err
}

func (db *DB) SuspendByWhopMembership(membershipID string) error {
	_, err := db.conn.Exec(
		"UPDATE licenses SET status = 'suspended' WHERE whop_membership_id = ?", membershipID,
	)
	return err
}

func (db *DB) ReactivateByWhopMembership(membershipID string) error {
	_, err := db.conn.Exec(
		"UPDATE licenses SET status = 'active' WHERE whop_membership_id = ?", membershipID,
	)
	return err
}

func (db *DB) StoreWebhook(eventType, membershipID, email, payload string) error {
	now := time.Now()
	_, err := db.conn.Exec(`
		INSERT INTO whop_webhooks (event_type, whop_membership_id, customer_email, payload, processed_at)
		VALUES (?, ?, ?, ?, ?)`, eventType, membershipID, email, payload, now,
	)
	return err
}
