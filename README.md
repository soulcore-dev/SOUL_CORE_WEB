# SOUL CORE — Landing & Store

Marketing landing + customer portal + license server for **SOUL CORE DEVELOPERS GROUP** ([soulcore.dev](https://soulcore.dev)).

Monorepo (Turborepo + npm workspaces) with two deployables and one shared package.

## What lives here

| Path | Stack | Purpose |
|---|---|---|
| `apps/web/` | Next.js 15 (App Router, RSC, next-intl 5 locales) | Public landing, services, portfolio, store, customer portal, admin |
| `apps/license-server/` | Go + Gin + SQLite + ECDSA P-256 | License issuance, validation, device binding, free + paid flows |
| `packages/i18n/` | TypeScript | Shared i18n config (locales, request defaults) |

## Run locally

```bash
npm install
npm run dev              # turbo dev — apps/web on :3000, license-server on :8090
```

Environment variables — see `apps/web/.env.example` and `apps/license-server/.env.example`. The web app talks to the license server via `LICENSE_API_URL` and authenticates with `LICENSE_SERVICE_SECRET`.

## Deploy

Production runs on a GCP `e2-small` VM in `us-central1-b` (`soulcore-landing`, static IP `136.111.4.235`), fronted by Caddy with auto-TLS on `soulcore.dev` + `www.soulcore.dev`.

```bash
./deploy/build.sh                                  # build prod tarball
gcloud compute scp soulcore_web.tar.gz soulcore-landing:/tmp/
gcloud compute ssh soulcore-landing -- bash /tmp/deploy.sh
```

The deploy script extracts, runs `docker compose -f docker-compose.graviton.yml up -d --build`, and waits for healthchecks. Caddy reloads automatically on `Caddyfile` change.

## Architecture conventions

- **i18n routing**: `app/[locale]/...` with `locale ∈ {es, en, pt, fr, de}`. Strings live in `apps/web/messages/<locale>.json`.
- **Error handling**: `catch (err: unknown)` + `instanceof Error` narrowing. No `: any` types in production code.
- **Image fallback**: `<img onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none' }} />` or use `<SafeImage>` from `components/ui/`.
- **Icon maps**: `Record<string, LucideIcon>` typed against `lucide-react` exports.

## Quality

Audited with `mcp__aether__aether_profile` (web profile). See `docs/quality-baseline.md` for the current snapshot.

## Repo

Mirror: [github.com/soulcore-dev/SOUL_CORE_WEB](https://github.com/soulcore-dev/SOUL_CORE_WEB).
