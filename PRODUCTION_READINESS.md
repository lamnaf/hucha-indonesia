# HuCha Indonesia — Production Readiness Report

Audited against `docs/HuCha_Indonesia_Master_Blueprint.md`, `.opencode/`,
`AGENTS.md`, the Prisma schema, and the full `src/` tree. Target production
stack: **Next.js on Vercel + PostgreSQL on Neon**, with S3-compatible object
storage for uploads.

Verified with `npm run lint`, `npm run typecheck`, and `npm run build` — all
green at the time of writing, against a live PostgreSQL 16 (`docker compose up -d db`).

## 1. Production status

**PRODUCTION READY: YES** (codebase). The repository is deployment-ready for
Vercel + Neon. Deploying still requires provisioning external resources first
(Neon DB, object-storage bucket, secrets, Super Admin password) — see
sections 6–9. No code blockers remain.

## 2. Build status

| Check | Result |
|---|---|
| `npm run lint` | ✅ clean |
| `npm run typecheck` (`tsc --noEmit`) | ✅ no errors |
| `npm run build` | ✅ success — 11 static/SSG public routes + admin/API dynamic routes, middleware 34.7 kB, shared JS 103 kB |
| `npm install` / postinstall | ✅ runs `prisma generate` (fixes Prisma client on Vercel) |

The build statically renders public pages from the database, so **the DB must
be reachable at build time** (see §6–7).

## 3. Database requirements

- Engine: **PostgreSQL** (`prisma/schema.prisma` datasource `provider = "postgresql"`).
- 9 migrations under `prisma/migrations/`; **`prisma migrate deploy`** is the
  production migration command. No `migrate reset`, no `db push`.
- Verified: the full migration chain applies cleanly to an **empty** PostgreSQL
  (27 tables created) with only `DATABASE_URL` set — no dependency on local
  Docker data.
- Driver adapter: `@prisma/adapter-pg`; SSL is enabled automatically when
  `APP_ENV=production`.
- Connection string is 100% env-driven (`prisma.config.ts` + `src/config/env.ts`).

## 4. Required environment variables

### Required for production
| Variable | Purpose |
|---|---|
| `APP_ENV` | `production` (inferred automatically from `NODE_ENV=production`, but set explicitly) |
| `APP_URL` | Canonical/base URL (must be https, validated at boot) |
| `DATABASE_URL` | Neon Postgres connection string (`?sslmode=require`); needed by Prisma CLI **and** the app |
| `BETTER_AUTH_SECRET` | ≥ 32 chars (e.g. `openssl rand -base64 32`); boot fails on short/placeholder values |

### Optional (with defaults)
| Variable | Default | Purpose |
|---|---|---|
| `BETTER_AUTH_URL` | `APP_URL` | Explicit auth base URL |
| `WHATSAPP_ADMIN_NUMBER` | `""` | Floating-widget deep-link |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | unset = email disabled | Best-effort lead/application notifications |
| `STORAGE_DRIVER` | `local` | `s3` required on Vercel (see §6/§8) |
| `STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_BUCKET`, `STORAGE_KEY`, `STORAGE_SECRET` | — | S3-compatible credentials (s3 driver) |
| `STORAGE_PUBLIC_URL` | `<endpoint>/<bucket>` | Public/CDN base URL for stored objects |
| `STORAGE_FORCE_PATH_STYLE` | `true` | Path-style addressing for MinIO/R2 |

### Category mapping
- **Prisma**: `DATABASE_URL`
- **Authentication**: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- **Email**: `SMTP_*`
- **Upload/media**: `STORAGE_*`
- **SEO/notifications**: `APP_URL`
- **Dev-only**: `APP_ENV=development`, localhost URLs, `STORAGE_DRIVER=local`

Templates: `.env.example` (dev) and `.env.production.example` (committed;
copy to `.env.production` locally / Vercel env vars). `.env`, `.env.local`,
`.env.production` are gitignored. **No real secrets are committed.**

## 5. Authentication setup

- **Single role: Super Admin.** Identified by `users.is_admin` (RBAC migration
  `20260810120000_rbac_to_is_admin`). No Content Editor / Sales Manager — no
  `roles` table, no residual role code. Every admin page/action is gated by
  `requireAdmin`/`requirePageAuth` (`src/domain/auth/guards.ts`).
- Email + password via Better Auth (`/api/auth/[...all]`); sign-up disabled;
  minimum password 10 chars (letter + number), common-password blocklist.
- Passwords are **scrypt-hashed** by Better Auth in `accounts.password` —
  never plaintext, never stored in `users.password_hash`.
- **No default password.** `prisma/seed.ts` creates `admin@hucha.id` without a
  credential; set one with `npx tsx scripts/create-admin.ts admin@hucha.id '<password>'`.
- Session: 60-min TTL, 15-min sliding update, `httpOnly`/`sameSite=lax`/`secure`
  (https base URL), cookie-gate middleware + server-side enforcement, login
  rate limit (in-memory) + Better Auth 429 handling, uniform error message
  (no user enumeration), full audit logging, change-password revokes other sessions.

## 6. Vercel requirements

1. **Framework preset Next.js; runtime Node.js** (no Edge routes — no
   `export const runtime` anywhere; all Node APIs are safe).
2. `npm install` runs postinstall → `prisma generate` (client is gitignored).
3. **DB reachable at build time**: static pages read the DB. Set `DATABASE_URL`
   (+ all env vars) in the Vercel project **before** deploying.
4. **Run migrations once** against Neon before/at deploy:
   `npx prisma migrate deploy` (local with `DATABASE_URL` pointed at Neon, or a
   one-off `vercel run` step). Do not put `migrate deploy` inside the build
   command (race conditions on preview builds).
5. **Object storage mandatory for uploads**: set `STORAGE_DRIVER=s3` + bucket
   credentials + `STORAGE_PUBLIC_URL`. Vercel's filesystem is ephemeral.
6. No hardcoded `localhost`/Docker hostnames in source; no filesystem writes
   outside the storage driver.
7. CSP already allows the storage/CDN origin and GA4/GTM domains
   (`next.config.ts`).

## 7. Neon requirements

1. Create a Neon project (Postgres 16) and a production branch.
2. Set `DATABASE_URL` = `postgresql://<user>:<password>@<host>/hucha?sslmode=require`.
   The app enables `ssl` in production automatically.
3. Apply migrations: `npx prisma migrate deploy` with that URL.
4. Seed + create the Super Admin (see §5).
5. Optionally pool with Neon's connection-pooler URL; the `pg` driver adapter
   supports it.

## 8. Known limitations

| Sev | Item |
|---|---|
| MED | In-memory rate limiters (login, public submissions) are per-instance; on serverless the counters are not global. Acceptable now; move to DB/Redis before multi-instance scale-out. |
| MED | `x-forwarded-for` used for client IP (Vercel sets it; fine behind a trusted proxy). |
| LOW | Deleting a job application does not purge its CV media row/file (orphans until manual cleanup). |
| LOW | `src/lib/seo.ts` falls back to `https://hucha.id` for canonical/OG when `APP_URL` is unset/localhost — dev-only; production always sets `APP_URL`. |
| LOW | `.opencode/DATABASE.md`/`ERD.md` still describe the old Role-based RBAC; the live schema uses `is_admin` (single role). Docs drift only. |
| LOW | Local (dev) storage driver writes under `public/uploads`; switch to `s3` for any non-local shared deployment. |

## 9. Deployment steps

1. **Provision Neon** (Postgres 16), copy the connection string.
2. **Provision object storage** (e.g. Cloudflare R2 / AWS S3 / MinIO) and a
   bucket + public URL/CDN for media.
3. **Set Vercel project env vars** (from §4): `APP_ENV`, `APP_URL`,
   `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `STORAGE_DRIVER=s3`,
   `STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_BUCKET`, `STORAGE_KEY`,
   `STORAGE_SECRET`, `STORAGE_PUBLIC_URL`, `STORAGE_FORCE_PATH_STYLE`, and
   optional `SMTP_*` + `WHATSAPP_ADMIN_NUMBER`.
4. **Apply migrations** against Neon: `npx prisma migrate deploy`.
5. **Seed** content: `npm run db:seed` (with `DATABASE_URL` → Neon).
6. **Create the Super Admin credential**: `npx tsx scripts/create-admin.ts admin@hucha.id '<strong-password>'`.
7. **Push to Vercel** (Import Git repo / `vercel --prod`). Build runs
   `npm install` (postinstall `prisma generate`) → `npm run build`.
8. Alternative self-host: `docker compose -f docker-compose.prod.yml up --build`
   (requires `.env.production` and a `DATABASE_URL` reachable at build time).

## 10. Post-deployment verification

- Visit `/` — public pages render CMS content (products, blog, careers, FAQ).
- Visit `/sitemap.xml`, `/robots.txt`, view-source metadata/canonical/OG on a
  product page.
- Log in at `/admin/login` with the Super Admin credential.
- Upload an image in `/admin/media` and confirm it loads (object-storage URL).
- Submit the contact/kemitraan/career forms and confirm the rows appear in
  `/admin/leads` / `/admin/applications`.
- Check `/api/admin/leads/export` (auth-gated) and email notification delivery
  (if `SMTP_*` set).
