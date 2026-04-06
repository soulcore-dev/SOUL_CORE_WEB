package crypto

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"encoding/hex"
	"encoding/pem"
	"fmt"
	"math/big"
	"os"
	"strings"
	"time"
)

// LicenseData holds the payload embedded in a license key.
type LicenseData struct {
	ProductID  uint32
	CustomerID string // hex-encoded, 32 chars
	ExpiresAt  int64  // unix timestamp, 0 = perpetual
	Features   uint16
}

// KeyPair holds ECDSA P-256 keys for license signing/verification.
type KeyPair struct {
	Private *ecdsa.PrivateKey
	Public  *ecdsa.PublicKey
}

// GenerateKeyPair creates a new ECDSA P-256 key pair.
func GenerateKeyPair() (*KeyPair, error) {
	priv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return nil, fmt.Errorf("generate key: %w", err)
	}
	return &KeyPair{Private: priv, Public: &priv.PublicKey}, nil
}

// SavePrivateKey writes the private key to a PEM file.
func (kp *KeyPair) SavePrivateKey(path string) error {
	der, err := x509.MarshalECPrivateKey(kp.Private)
	if err != nil {
		return err
	}
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	return pem.Encode(f, &pem.Block{Type: "EC PRIVATE KEY", Bytes: der})
}

// SavePublicKey writes the public key to a PEM file.
func (kp *KeyPair) SavePublicKey(path string) error {
	der, err := x509.MarshalPKIXPublicKey(kp.Public)
	if err != nil {
		return err
	}
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	return pem.Encode(f, &pem.Block{Type: "PUBLIC KEY", Bytes: der})
}

// LoadPrivateKey loads an ECDSA private key from PEM file.
func LoadPrivateKey(path string) (*KeyPair, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("no PEM block found in %s", path)
	}
	priv, err := x509.ParseECPrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return &KeyPair{Private: priv, Public: &priv.PublicKey}, nil
}

// LoadPublicKey loads an ECDSA public key from PEM file.
func LoadPublicKey(path string) (*ecdsa.PublicKey, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("no PEM block found in %s", path)
	}
	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	ecPub, ok := pub.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("not an ECDSA public key")
	}
	return ecPub, nil
}

// buildPayload creates the byte payload for signing.
func buildPayload(data LicenseData) []byte {
	// ProductID(4) + ExpiresAt(8) + Features(2) + CustomerID(32 hex = 16 bytes)
	buf := make([]byte, 0, 30)
	buf = append(buf,
		byte(data.ProductID>>24), byte(data.ProductID>>16),
		byte(data.ProductID>>8), byte(data.ProductID),
	)
	buf = append(buf,
		byte(data.ExpiresAt>>56), byte(data.ExpiresAt>>48),
		byte(data.ExpiresAt>>40), byte(data.ExpiresAt>>32),
		byte(data.ExpiresAt>>24), byte(data.ExpiresAt>>16),
		byte(data.ExpiresAt>>8), byte(data.ExpiresAt),
	)
	buf = append(buf, byte(data.Features>>8), byte(data.Features))
	custBytes, _ := hex.DecodeString(data.CustomerID)
	buf = append(buf, custBytes...)
	return buf
}

// GenerateLicenseKey creates a signed license key string.
// Format: SOULCORE-XXXX-XXXX-XXXX-XXXX (signature hex, grouped by 4)
func GenerateLicenseKey(kp *KeyPair, data LicenseData) (string, error) {
	payload := buildPayload(data)
	hash := sha256.Sum256(payload)

	r, s, err := ecdsa.Sign(rand.Reader, kp.Private, hash[:])
	if err != nil {
		return "", fmt.Errorf("sign: %w", err)
	}

	// Encode r and s as fixed-size 32-byte big-endian
	rBytes := padLeft(r.Bytes(), 32)
	sBytes := padLeft(s.Bytes(), 32)
	sigHex := hex.EncodeToString(append(rBytes, sBytes...))
	sigHex = strings.ToUpper(sigHex)

	// Format: SOULCORE- + payload hex + signature hex, grouped by 4
	payloadHex := strings.ToUpper(hex.EncodeToString(payload))
	full := payloadHex + sigHex

	// Group by 4
	var groups []string
	for i := 0; i < len(full); i += 4 {
		end := i + 4
		if end > len(full) {
			end = len(full)
		}
		groups = append(groups, full[i:end])
	}

	return "SOULCORE-" + strings.Join(groups, "-"), nil
}

// ValidateLicenseKey verifies a license key and extracts its data.
func ValidateLicenseKey(pubKey *ecdsa.PublicKey, licenseKey string) (*LicenseData, error) {
	// Remove prefix
	if !strings.HasPrefix(licenseKey, "SOULCORE-") {
		return nil, fmt.Errorf("invalid prefix")
	}
	rest := strings.TrimPrefix(licenseKey, "SOULCORE-")
	hexStr := strings.ReplaceAll(rest, "-", "")
	raw, err := hex.DecodeString(hexStr)
	if err != nil {
		return nil, fmt.Errorf("invalid hex: %w", err)
	}

	// Payload is first 30 bytes, signature is 64 bytes (r=32, s=32)
	if len(raw) < 94 { // 30 payload + 64 signature
		return nil, fmt.Errorf("key too short")
	}

	payload := raw[:30]
	sigBytes := raw[30:94]

	// Verify signature
	hash := sha256.Sum256(payload)
	r := new(big.Int).SetBytes(sigBytes[:32])
	s := new(big.Int).SetBytes(sigBytes[32:64])

	if !ecdsa.Verify(pubKey, hash[:], r, s) {
		return nil, fmt.Errorf("signature_invalid")
	}

	// Parse payload
	productID := uint32(payload[0])<<24 | uint32(payload[1])<<16 | uint32(payload[2])<<8 | uint32(payload[3])
	expiresAt := int64(payload[4])<<56 | int64(payload[5])<<48 | int64(payload[6])<<40 | int64(payload[7])<<32 |
		int64(payload[8])<<24 | int64(payload[9])<<16 | int64(payload[10])<<8 | int64(payload[11])
	features := uint16(payload[12])<<8 | uint16(payload[13])
	customerID := hex.EncodeToString(payload[14:30])

	// Check expiration
	if expiresAt > 0 && time.Now().Unix() > expiresAt {
		return nil, fmt.Errorf("license_expired")
	}

	return &LicenseData{
		ProductID:  productID,
		CustomerID: customerID,
		ExpiresAt:  expiresAt,
		Features:   features,
	}, nil
}

func padLeft(b []byte, size int) []byte {
	if len(b) >= size {
		return b[:size]
	}
	padded := make([]byte, size)
	copy(padded[size-len(b):], b)
	return padded
}
