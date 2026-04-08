# PROJ_00032 — SoulCore License Server

ECDSA P-256 license server for digital software sales. Reusable across all SoulCore products.

## Features

- **ECDSA P-256** license key generation & validation (64+ char keys)
- **Machine binding** (CPU + hostname hash, MODERATE strictness)
- **3 rebinds/year** before manual verification required
- **Whop webhook** integration (auto-generate license on purchase)
- **Signed download URLs** (HMAC-SHA256, time-limited)
- **Rate limiting** (30 req/min per IP on validation)
- **SQLite** storage (products, licenses, validation logs, webhook audit)
- **Pure Go** (CGO_ENABLED=0, ~13MB binary)

## Quick Start

```bash
# Generate ECDSA keys
./license-server --generate-keys

# Run server
LICENSE_SERVICE_SECRET=your-secret ./license-server --addr :8090 --db licenses.db

# Build
CGO_ENABLED=0 go build -ldflags="-s -w" -o license-server ./cmd/server/
```

## API Endpoints

| Endpoint | Auth | Description |
|---|---|---|
| `GET /health` | Public | Health check |
| `POST /api/v1/licenses/validate` | Public (rate-limited) | Validate license + machine binding |
| `POST /api/v1/licenses/rebind` | Public | Rebind to new machine (3/year) |
| `POST /api/v1/webhooks/whop` | HMAC-SHA256 | Whop webhook → auto-generate license |
| `POST /api/v1/licenses/generate` | Bearer token | Manual license generation |
| `POST /api/v1/downloads/sign` | Bearer token | Generate signed download URL |
| `GET/POST /api/v1/products` | Bearer token | Product CRUD |
| `GET /download/*` | Signed URL | Serve files with signature validation |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `LICENSE_SERVICE_SECRET` | `soulcore-license-dev-secret` | Bearer token for admin endpoints |
| `WHOP_WEBHOOK_SECRET` | (empty) | HMAC key for Whop webhook verification |
| `DOWNLOAD_SECRET` | (reuses service secret) | HMAC key for signed download URLs |
| `DOWNLOAD_BASE_URL` | `http://localhost:8090` | Public URL for download links |
| `FILES_DIR` | `files` | Directory containing downloadable files |

## Architecture

```
Client App                    License Server (Go)
    │                              │
    ├─ POST /validate ────────────►│ 1. Verify ECDSA signature
    │  {license_key, machine_hash} │ 2. Check DB status
    │                              │ 3. Bind/verify machine
    │◄─ {valid: true/false} ──────┤ 4. Log validation
    │                              │
Whop ─── webhook ─────────────────►│ Generate ECDSA license
                                   │ Store in SQLite
                                   │ (TODO: email customer)
```

## License Key Format

```
SOULCORE-{payload_hex}-{signature_hex}
Payload: ProductID(4B) + ExpiresAt(8B) + Features(2B) + CustomerID(16B) = 30 bytes
Signature: ECDSA P-256 (r=32B, s=32B) = 64 bytes
```

## Used By

- PROJ_00005 SoulCore Landing & Store (primary consumer)
- Any future SoulCore product that needs licensing
