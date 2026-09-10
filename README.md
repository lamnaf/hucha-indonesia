# HuCha Indonesia

Company website and content-management system for **HuCha Indonesia** (CV Usaha Bintang Mulia), a distributor of motorcycle spare parts, automotive fluids, and vehicle-care products. The site presents the brand to the public and provides a full admin panel for managing content, leads, careers, and site settings — all backed by a single PostgreSQL database.

Built on the Next.js App Router and designed for deployment on **Vercel + Neon PostgreSQL** with S3-compatible object storage for uploads.

## Overview

The application is a production-ready, full-stack web platform with two primary areas:

- **Public website** — marketing site with product catalog, blog, careers, FAQs, testimonials, and partnership/OEM inquiry forms, served with on-brand metadata, robots.txt, dynamic sitemap, and security headers.
- **Admin panel** — role-restricted CMS (`/admin`) for managing content, media, leads, job applications, SEO metadata, analytics, notifications, and site configuration.

Both areas share the same data model and are authenticated through Better Auth:

- **Authentication** — Better Auth email/password login with a single **Super Admin** role, cookie-based sessions, server-side route protection, login rate limiting, and audit logging.
- **Database** — PostgreSQL via the Prisma ORM, using a driver adapter and SQL migrations applied with `prisma migrate deploy`.
- **Content management** — every public page renders CMS data from the database (products, blogs, jobs, FAQs, testimonials, settings) rather than hard-coded content.

## Features

### Public Website

- Homepage with hero, featured products, brands, and latest articles
- Product catalog with category/subcategory filtering and product detail pages
- Blog with article detail, category, and tag pages
- Brand showcase (`merek-kami`)
- Partnership/distributor inquiry form (`kemitraan`)
- OEM / private-label inquiry form (`oem`)
- Careers listing with detail pages and an application form
- FAQ pages, testimonials, and a contact form
- Legal pages (privacy policy, terms & conditions)
- Floating WhatsApp widget
- Dynamic `sitemap.xml`, `robots.txt`, per-page SEO metadata, and Open Graph/Twitter cards
- Page-view analytics tracking (with bot detection)

### Admin Panel

- Protected dashboard (`/admin`) with summary stats and analytics charts
- Article management (create, edit, publish, schedule) plus blog categories and tags
- Product management (CRUD) with product categories and brands
- Media library with uploads (local disk or S3-compatible object storage)
- FAQ, testimonial, and career/job management
- Job application and lead management (contact, distributor, OEM) with status/notes and CSV/XLS export
- Newsletter subscriber management
- SEO metadata manager
- Site settings editor
- Notification inbox
- Audit log
- Profile and password management

### Authentication

- **Better Auth** powers login with email/password. Sign-up is disabled — administration accounts are provisioned by an operator.
- Sessions are stored server-side (60-minute expiry with a sliding 15-minute refresh) in `httpOnly` cookies.
- Every admin page and mutating server action is gated server-side; the middleware additionally redirects signed-out visitors away from `/admin/*`.
- Logout invalidates the session server-side and clears the session cookie, then redirects to `/admin/login`.
- Login attempts are rate-limited, and a single generic error is returned for invalid credentials (no user enumeration).
- No admin password is ever stored in the repository.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) 15 (App Router), React 19 |
| Language | TypeScript (strict) |
| Database | PostgreSQL |
| ORM | Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`) |
| Authentication | Better Auth (email/password, next-cookies plugin) |
| Styling / UI | Tailwind CSS 4, shadcn/ui components, Radix UI primitives |
| Forms / validation | Server Actions + Zod 4 |
| Storage | `local` (filesystem) or S3-compatible object storage (AWS S3 / Cloudflare R2 / MinIO) via `@aws-sdk/client-s3` |
| Email | Nodemailer (SMTP, optional) |
| Charts | Responsive SVG/Canvas analytics charts (custom components) |
| Development tools | ESLint (next/core-web-vitals), Prettier, `tsx` |
| Deployment | Vercel (+ Neon PostgreSQL) or Docker Compose |

See `package.json` for the exact dependency versions.

## Project Structure

```
.
├── prisma/
│   ├── schema.prisma          # Data model
│   ├── migrations/            # Versioned SQL migrations
│   └── seed.ts                # Development seed data
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (public)/          # Public website pages
│   │   ├── admin/             # Admin panel (login + modules)
│   │   ├── api/               # API routes (auth, analytics, exports)
│   │   └── loading.tsx        # Global loading boundary
│   ├── middleware.ts          # Admin route protection
│   ├── components/            # React components (UI, admin, forms, layout)
│   ├── config/                # Env-driven configuration (app, email, storage)
│   ├── domain/                # Business logic, server actions, repositories
│   ├── infrastructure/        # Prisma client, storage driver, email adapter
│   ├── lib/                   # Shared helpers, SEO, public-data services
│   └── shared/                # Cross-cutting types, validation, utilities
├── scripts/
│   └── create-admin.ts        # Provision an admin credential
├── docker-compose.yml         # Dev environment (Postgres, MinIO, MailHog)
├── docker-compose.prod.yml    # Self-hosted production stack
└── Dockerfile                 # Multi-stage production image
```

Note: the generated Prisma client is checked out into `src/infrastructure/database/generated` and is gitignored — run `npx prisma generate` after installing dependencies.

## Requirements

- **Node.js ≥ 20** (the Node 22-alpine runtime is used in the production Docker image)
- **npm** (package manager; `npm ci` for reproducible installs)
- **PostgreSQL** — a running instance locally (e.g. `docker compose up -d db`) or a hosted database such as Neon for production
- Environment variables configured from `.env.example` / `.env.production.example`

## Installation

Run locally:

```bash
# 1. Clone the repository
git clone <repository-url>
cd Hucha-Indonesia

# 2. Install dependencies (postinstall runs `prisma generate`)
npm install

# 3. Copy the environment template and fill in your values
cp .env.example .env

# 4. Start a local PostgreSQL (and MinIO/MailHog if desired)
docker compose up -d db

# 5. Create the database schema
npx prisma migrate deploy

# 6. Seed development content (see Database section)
ADMIN_SEED_PASSWORD="<strong-password>" npm run db:seed

# 7. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin panel is at `/admin/login` and requires an active session with the Super Admin credential.

## Environment Variables

All configuration is environment-driven. Templates are provided in `.env.example` (development) and `.env.production.example` (production). **Never commit real secrets** — `.env*` files are gitignored.

### Required

| Variable | Description |
|---|---|
| `APP_URL` | Canonical/base URL of the site (http/https, validated at boot) |
| `DATABASE_URL` | PostgreSQL connection string used by the runtime |

`APP_ENV` is inferred automatically from `NODE_ENV`; set it explicitly only when you need to force the production code path.

### Authentication

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Secret used to sign session data. **Required to be ≥ 32 characters**; production refuses placeholder or short values. Generate with `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | Explicit auth base URL (defaults to `APP_URL`) |

### Database

| Variable | Description |
|---|---|
| `DATABASE_URL` | Runtime connection string. On Neon, the **pooled** (`-pooler`) URL for the Next.js runtime. |
| `DIRECT_URL` | Prisma CLI/migration connection string (non-pooled). Only used by the Prisma CLI (`prisma.config.ts`); runtime reads `DATABASE_URL`. |

### Storage

| Variable | Description |
|---|---|
| `STORAGE_DRIVER` | `local` (default; writes under `public/uploads`) or `s3` for serverless deploy |
| `STORAGE_ENDPOINT` | S3-compatible endpoint (e.g. R2, MinIO) |
| `STORAGE_REGION` | Region (defaults to `auto`) |
| `STORAGE_BUCKET` | Bucket name (required when driver is `s3`) |
| `STORAGE_KEY` / `STORAGE_SECRET` | Object-storage credentials |
| `STORAGE_PUBLIC_URL` | Public/CDN base URL served objects are referenced from (defaults to `<endpoint>/<bucket>`) |
| `STORAGE_FORCE_PATH_STYLE` | Path-style addressing (defaults `true`; needed for MinIO/R2) |

### Email / SMTP

Optional — when unset, email notifications (best-effort for leads/applications) are disabled.

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP port |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials (optional) |
| `SMTP_FROM` | Sender address |

### Optional / Development only

| Variable | Description |
|---|---|
| `WHATSAPP_ADMIN_NUMBER` | Phone number used by the floating WhatsApp widget |
| `ADMIN_SEED_PASSWORD` | **Provisioning only** — the password used by `npm run db:seed` to create the admin credential (the script requires it). This value is never read by the running app; it is not stored in the database as plaintext and must never be committed to source. |

## Database

The application uses **PostgreSQL** with the **Prisma ORM** (v7, driver-adapter based).

- **Schema** — defined in `prisma/schema.prisma`.
- **Migrations** — versioned SQL in `prisma/migrations/` (9 migrations). Use `npx prisma migrate deploy` to apply them to a target database. Never use `prisma migrate dev` or destructive commands (`migrate reset`, `db push`) in production.
- **Prisma Client** — generated into `src/infrastructure/database/generated` (gitignored). Regenerate with `npx prisma generate` after dependency changes.
- **Prisma CLI connection** — `prisma.config.ts` prefers `DIRECT_URL`, falling back to `DATABASE_URL`, so CLI operations (migrate/seed) can run outside PgBouncer on Neon.

| Command | When to use |
|---|---|
| `npx prisma generate` | After `npm install` (also runs automatically via postinstall) or when upgrading Prisma |
| `npx prisma migrate deploy` | Apply migrations to a database — development and production |
| `npm run db:seed` | Seed sample content; **requires `ADMIN_SEED_PASSWORD`** |

Seeding is primarily intended for development/staging, and can also be used for controlled initial production provisioning (e.g. provisioning the first admin on a freshly deployed, empty database). It upserts categories, FAQs, jobs, brands, testimonials, settings, sample products/articles, creates the admin user (`admin@hucha.id`) with a credential from `ADMIN_SEED_PASSWORD`, and adds demo notifications/audit logs.

> Caution: do **not** run the seed against an existing production database without understanding its behavior. The seed upserts records by slug/unique fields and republishes sample content, so it modifies existing rows; for a database that already has real content, prefer provisioning only the admin credential (below) instead.

Alternatively, an existing admin credential can be created or updated without reseeding content:

```bash
npx tsx scripts/create-admin.ts admin@hucha.id '<strong-password>'
```

Passwords are never stored in the repository or in the application source.

## Authentication

- **Better Auth** handles email/password sign-in via `/api/auth/[...all]`. Sign-up is disabled; accounts are provisioned through the seed script or `scripts/create-admin.ts`.
- A single privileged role exists: **Super Admin**, identified by `users.is_admin`. Every admin page and mutating server action is guarded server-side (`requireAdmin` / `requirePageAuth` in `src/domain/auth/guards.ts`).
- Session cookies are `httpOnly`; sessions have a 60-minute lifetime refreshed on activity, and are stored in the database.
- The front-line **middleware** redirects unauthenticated users from `/admin/*` to `/admin/login`, while the server-side guards provide the definitive authorization check.
- **Logout** revokes the session and clears the cookie, then redirects to `/admin/login`; protected routes cannot be revisited with a stale session.
- Passwords are hashed (via Better Auth's `scrypt`) before storage. Credentials are never logged, shipped in the repository, or returned by the API.

## Admin Panel

The admin CMS lives under `/admin/` and is reachable only with an active Super Admin session:

- Login at **`/admin/login`** (redirects to the dashboard when already authenticated).
- The dashboard `/admin` shows key metrics, recent activity, and analytics.
- Modules include content (articles, products, categories, brands, testimonials, FAQ, careers, applications), leads & newsletter, media library, SEO management, analytics, site settings, audit log, notifications, and profile/password.

Credentials for any deployed environment are provisioned by the operator via the seed script or the provisioning script — they are never included in the repository.

## Deployment

The recommended production topology is:

```
GitHub ──▶ Vercel ──▶ Next.js build ──▶ Neon PostgreSQL
                                        └ (S3-compatible object storage)
```

1. **Provision resources** — a Neon Postgres project (production branch), an S3-compatible bucket + public URL/CDN for media, and strong secrets.
2. **Set the Vercel project environment variables** from `.env.production.example` — `APP_URL`, `DATABASE_URL` (pooled), `BETTER_AUTH_SECRET`, `STORAGE_DRIVER=s3` + storage config, and optional `SMTP_*`.
3. **Apply migrations** to the database of the target environment *before* deploying: `npx prisma migrate deploy`. Ensure `DATABASE_URL` (and `DIRECT_URL` where used) points at **that** environment's database — in production this means the Neon connection string for the production branch, not the local/dev one. Always verify the exact database the command will target before running it. Keep migration out of the Vercel build command to avoid races on preview builds.
4. **Push to Vercel** — the build runs `npm install` (postinstall `prisma generate`) and `npm run build`. The database must be reachable at build time because public pages are statically generated from CMS data.
5. **Provision the admin credential** — with a production database that contains real content, use only `scripts/create-admin.ts` with your own strong password; run the seed only against a freshly deployed, empty database (see the seed caution in the Database section).

> Important: object storage (`STORAGE_DRIVER=s3`) is required on Vercel — the serverless filesystem is ephemeral and local file storage will not persist.

For self-hosting, a production Docker stack is provided:

```bash
docker compose -f docker-compose.prod.yml up --build
```

(requires a `.env.production` file with a `DATABASE_URL` reachable at build time).

## Production Notes

- **Never commit `.env` files or real secrets.** `.env`, `.env.local`, `.env.production` are gitignored; only `.env.example` / `.env.production.example` templates are tracked.
- Store all secrets (`DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `STORAGE_*`, `SMTP_*`) as environment variables in the hosting platform.
- `DATABASE_URL` at runtime should point at the appropriate connection for the environment (pooled Neon URL on Vercel); `DIRECT_URL` is used by the Prisma CLI for migrations.
- `BETTER_AUTH_SECRET` must be a strong, randomly generated secret of at least 32 characters.
- Take regular backups of the production database.
- Never run destructive database commands (`migrate reset`, `db push`, unguarded `delete`/`truncate`) against production.

## Development

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run lint:fix` | Fix lint issues automatically |
| `npm run format` / `npm run format:check` | Format / verify formatting with Prettier |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | `prisma migrate dev` (local only) |
| `npm run db:deploy` | Apply migrations to an environment (`prisma migrate deploy`) |
| `npm run db:seed` | Seed sample content (`prisma db seed`, needs `ADMIN_SEED_PASSWORD`) |

## QA / Verification

The repository was validated with the following at the time of the last release:

- `npm run lint` — clean
- `npm run typecheck` — clean
- `npm run build` — production build succeeds
- Authentication — email/password login, sessions, rate limiting, and logout verified against a local PostgreSQL
- Admin panel — login, dashboard, per-module navigation, nested loading states, and logout redirect verified
- Responsive UI — public pages and admin shell are mobile-friendly

No automated test suite is currently configured (`tests/` scaffolding only).

## Security

- All secrets flow through environment variables; `.env*` files are never committed.
- Production is served over HTTPS; the app emits strict security headers (CSP, HSTS, `frame-ancestors`, etc.).
- Authentication uses a strong `BETTER_AUTH_SECRET` and hashed (never plaintext) credentials.
- Admin and database credentials must never be placed in the repository.
- Database connections, object-storage credentials, and SMTP credentials stay server-side only.

## License

A license has not been specified for this repository.

## Credits / Organization

HuCha Indonesia is operated by **CV Usaha Bintang Mulia**, a distributor of motorcycle spare parts, automotive fluids, and vehicle-care products in Indonesia, based in Cikarang, West Java.