package crypto

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"runtime"
	"strings"
)

// MachineHash generates a hardware fingerprint for machine binding.
// Uses MODERATE strictness: CPU/platform + hostname.
func MachineHash() string {
	var parts []string

	// 1. Hostname
	host, _ := os.Hostname()
	parts = append(parts, host)

	// 2. OS + Architecture (stable across reboots)
	parts = append(parts, runtime.GOOS, runtime.GOARCH)

	// 3. Platform-specific machine ID
	machineID := getPlatformMachineID()
	if machineID != "" {
		parts = append(parts, machineID)
	}

	combined := strings.Join(parts, "|")
	hash := sha256.Sum256([]byte(combined))
	return hex.EncodeToString(hash[:])
}

// getPlatformMachineID reads the system's unique machine identifier.
func getPlatformMachineID() string {
	switch runtime.GOOS {
	case "linux":
		// /etc/machine-id is stable across reboots, unique per install
		data, err := os.ReadFile("/etc/machine-id")
		if err == nil {
			return strings.TrimSpace(string(data))
		}
		data, err = os.ReadFile("/var/lib/dbus/machine-id")
		if err == nil {
			return strings.TrimSpace(string(data))
		}
	case "darwin":
		// macOS hardware UUID via IOPlatformUUID
		// Fallback to hostname-based if not available
		data, err := os.ReadFile("/Library/Preferences/SystemConfiguration/com.apple.computer-identity.plist")
		if err == nil {
			return fmt.Sprintf("darwin-%x", sha256.Sum256(data))[:32]
		}
	case "windows":
		// Windows MachineGuid from registry
		data, err := os.ReadFile(`C:\Windows\System32\config\systemprofile\.machine-id`)
		if err == nil {
			return strings.TrimSpace(string(data))
		}
	}
	return ""
}

// ValidateMachineBinding checks if a license's stored machine hash
// matches the current machine. Returns true if:
// - No machine hash was stored (first activation)
// - Hashes match
func ValidateMachineBinding(storedHash, currentHash string) bool {
	if storedHash == "" {
		return true // Not yet bound
	}
	return storedHash == currentHash
}
