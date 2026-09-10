# Development Tasks

## Phase 0

- [x] Initialize Next.js 15 (15.5.22, App Router, src dir)
- [x] Configure TypeScript (strict mode, `@/*` alias)
- [x] Configure TailwindCSS (v4)
- [x] Configure ESLint (flat config, next/core-web-vitals + next/typescript)
- [x] Configure Prettier (`.prettierrc.json`, `format` / `format:check` scripts)
- [x] Configure Shadcn UI (`components.json`, radix base, `src/lib/utils.ts`, css variables)
- [x] Configure Prisma (7.9.1, `prisma-client` generator, `prisma.config.ts`, adapter `@prisma/adapter-pg`)
- [x] Configure PostgreSQL (Postgres 16 via Docker Compose; `users`/session/account/verification tables)
- [x] Configure Better Auth (1.6.25 + `@better-auth/prisma-adapter`; `src/lib/auth.ts`, int serial IDs, email/password enabled)
- [x] Configure Docker (`Dockerfile`, `.dockerignore`)
- [x] Configure Docker Compose (`docker-compose.yml` dev: app/db/minio/mailhog; `docker-compose.prod.yml`)
- [x] Configure environment variables (`.env`, `.env.example` — includes BETTER_AUTH_SECRET/BETTER_AUTH_URL)
- [x] Configure project aliases (`@/*` -> `./src/*`; shadcn aliases for components/ui/lib/hooks)
- [x] Create documented folder structure (per blueprint §37: domain/infrastructure/shared/config + tests)

> Phase 0 verification: `npm install` ✓ · `npm run dev` ✓ (HTTP 200 on `/`) · `npm run lint` ✓ · `npm run typecheck` ✓ · `npm run build` ✓.
>
> Schema adaptations for Better Auth (documented deviations): `users.password_hash` and `users.role_id` made nullable (Better Auth stores credentials in `accounts.password`; role is assigned at app level in Phase 1). New `sessions`, `accounts`, `verifications` tables with Int serial IDs matching `users.id`. Initial migration regenerated at `prisma/migrations/20260802000000_init` (not yet applied — needs a running Postgres).
>
> Note: Docker compose files provided but untested locally (no Docker binary on this machine); run `docker compose up -d db` then `npm run db:migrate` + `npm run db:seed` once Docker is available. Better Auth API route handler (`/api/auth/[...all]`) is intentionally deferred to Phase 1 (Authentication) per the "no features/pages in Phase 0" constraint.

## Phase 0 — Senior Review (no new features)

- [x] Fix `src/config/env.ts` — numeric env vars now parsed via `envNumber()` (rejects `NaN`, falls back to default)
- [x] Fix `prisma/seed.ts` — fails fast with a clear error when `DATABASE_URL` is missing (was silently `?? ""`)
- [x] Fix `src/app/layout.tsx` — default locale `lang="id"` per §4; HuCha metadata (was `lang="en"` + "Create Next App")
- [x] Fix `src/app/page.tsx` — removed create-next-app/Vercel boilerplate; minimal Indonesian placeholder (no features)
- [x] Fix `next.config.ts` — security headers per §32 (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; HSTS production-only)
- [x] Fix `Dockerfile` — runner stage now ships production-only deps (`npm ci --omit=dev`) instead of full dev node_modules
- [x] Fix `docker-compose.yml` — secrets moved to env interpolation (`${VAR:-default}`); no credentials hardcoded (§41)
- [x] Fix `npm audit` — added `overrides` forcing patched `postcss@^8.5.25` and `sharp@^0.35.3` (was 3 high + 1 moderate: PostCSS XSS/path-traversal, sharp libvips CVEs)
- [x] Fix `.prettierignore` — exclude `Dockerfile` (no Prettier parser; `format:check` was failing)
- [x] Verified: `npm run lint` ✓ · `npm run typecheck` ✓ · `npm run build` ✓ · `npm run format:check` ✓ · `npm run dev` ✓ (HTTP 200, security headers present, `lang="id"`) · `npm audit` ✓ (0 vulnerabilities)

> Reviewed but intentionally unchanged: empty `src/domain/*`/`src/infrastructure/{email,storage}` placeholders kept as §37 scaffold; `src/lib/auth.ts` (Better Auth adapter) vs `src/infrastructure/auth/` (RBAC middleware, Phase 1) split documented; `npm audit fix --force` not used (its resolution would downgrade to next@9.3.3).

## Phase 1

### Phase 1 — Database Layer (complete)

- [x] Author `DATABASE.md` + `ERD.md` (from blueprint §14–17, incl. Better Auth tables)
- [x] Prisma schema — 19 domain entities + Better Auth tables; 10 enums; JSONB permission map on `roles`; soft-delete columns on content tables; indexes per §33
- [x] Initial migration `prisma/migrations/20260802000000_init` applied to PostgreSQL 16
- [x] Seed data — 3 roles w/ permission maps, 3 top-level categories + 10 sub-categories, 3 blog categories, 5 tags, 3 FAQ categories + 5 FAQs, 3 jobs, 3 testimonials, 4 settings, demo super admin (`admin@hucha.id`), 6 published products + placeholder media, 3 published articles; idempotent (upsert / find-then-create)
- [x] Repository layer — 17 repositories across 9 domain modules (users, roles, products/categories, articles/blog-categories/tags, leads, jobs/applications, media, seo, analytics, testimonials, faqs, settings, audit) wrapping the shared `PrismaClient`
- [x] Validation schemas (`src/shared/validation`) — Zod v4 per §31: leads (distributor/oem/contact), products, articles, jobs/applications, auth, testimonials, faqs, categories, media, seo + shared `slug`/`whatsapp`/`text` utils
- [x] Add `zod` as a direct dependency (`^4.4.3`)
- [x] Verified: `prisma migrate deploy` ✓ · `prisma db seed` ✓ (twice, idempotent) · `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run format:check` ✓

> Local DB: no Docker/sudo on this machine, so the migration/seed were run against an **embedded PostgreSQL 16** instance (via `embedded-postgres`) listening on `localhost:55432` (`hucha/hucha`). Node process still running in the background (detached). Stop with `pkill -f 'node start.mjs'`; restart from `/tmp/opencode/hucha-pg` with `setsid node start.mjs`.
>
> Flagged (blueprint inconsistency): §7.2 lists "Lead status tagging + **notes**" but §16 `leads` has no `notes` column — notes should be added via a Phase 4 migration if required. Seeded admin credential is created via `scripts/create-admin.ts` (Phase 2), not the (disabled) sign-up flow.

### Phase 1 — Senior Review (no new features)

- [x] Add `src/domain/errors.ts` — `DomainError` base + `NotFoundError` (P2025) + `ConflictError` (P2002), `mapPrismaError`, `runMapped(op, hints)` helper
- [x] Error-map every mutating repository op (12 repositories) so raw Prisma `P2002`/`P2025` no longer leak to callers; Indonesian user-facing hints
- [x] Fix `product.repository.listPublished` — unknown category slug now returns an empty page (was returning ALL products — filtering bug)
- [x] Fix `article.repository` — `ArticleUpdateInput = Omit<ArticleInput, "authorId">` (author immutability); `publishedAt` explicit `undefined|null|Date` semantics on update
- [x] Fix `media.repository.delete` — throws `ConflictError` (was generic `Error`)
- [x] Fix `lead.repository` — `countByStatus`/`countByType` return zero for enum keys without rows (was unsafe cast, keys missing)
- [x] Remove dead `UserWithRole` type from `user.repository.ts`
- [x] Dedupe duplicate `employmentTypeSchema` import in `src/shared/validation/job.ts`
- [x] Fix `src/infrastructure/database/prisma.ts` — SSL only in production (`ssl: appEnv === "production"`); dev no longer forces TLS, so the shared client works against local/embedded Postgres (was failing with P1011)
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run format:check` ✓ · runtime smoke test on embedded PG ✓ (unknown-category → 0 rows; 6 published products; `countByStatus` all 4 keys present; `setFeatured` on missing id → `NotFoundError`; `mapPrismaError` P2002→`ConflictError`, P2025→`NotFoundError`)
- [x] Reviewed but unchanged: `role`/`setting`/`seo-meta`/`analytics`/`audit-log` repositories use `upsert`/read-only ops (no P2025/P2002 can surface), and audit-log is append-only by design (§32)

### Phase 1 (remaining)

> Auth + RBAC items delivered under Phase 2 below.

## Phase 2

### Phase 2 — Authentication & RBAC (complete)

- [x] Better Auth config (`src/lib/auth.ts`) — `nextCookies()` plugin, session `expiresIn: 60m` / `updateAge: 15m` (blueprint §32 inactivity timeout), `disableSignUp: true` (admins only), baseURL + trustedOrigins from env
- [x] Better Auth route handler `src/app/api/auth/[...all]/route.ts` (`toNextJsHandler`)
- [x] Login/logout server actions (`src/domain/auth/actions.ts`) — `loginAction` (zod-validated, `auth.api.signInEmail`, redirects to `/admin`), `logoutAction` (`auth.api.signOut`)
- [x] Session helpers (`src/domain/auth/session.ts`) — `getSession`, `getCurrentUser` (session user → `UserRepository` join with role/permissions; coerces Better Auth string id → Int)
- [x] RBAC guards (`src/domain/auth/guards.ts`) — `requireAuth`, `requirePermission(module, action)` (JSONB map via `hasPermission`), `requireRole(...names)`, `requirePageAuth` (redirects to login); new `UnauthorizedError`/`ForbiddenError` in `src/domain/errors.ts`
- [x] Middleware (`src/middleware.ts`) — edge-safe cookie gate via `getSessionCookie`; unauthenticated `/admin/*` → `/admin/login?callbackUrl=...`; authed `/admin/login` → `/admin` (definitive checks still run server-side)
- [x] Schema: add `@@unique([providerId, accountId])` on `accounts` (Better Auth credential lookup) — migration `20260803000000_add_account_unique_constraint` applied
- [x] Admin scaffolding (no dashboard UI) — `/admin/login` page + client form (`useActionState`), protected `/admin` placeholder (role shown + logout), admin layout `robots: noindex` (blueprint §8)
- [x] `scripts/create-admin.ts` — sets/rotates the email+password credential for a seeded user via Better Auth-compatible scrypt hash (no public sign-up)
- [x] Verified auth on embedded PG: `/admin` unauthed → 307 `/admin/login` ✓ · sign-in → 200 + `set-cookie` (Max-Age 3600) ✓ · `get-session` → user ✓ · `/admin` authed → 200 (shows `Super Admin` / `super_admin`) ✓ · sign-out → cookies cleared ✓ · `/admin` after sign-out → 307 ✓ · `/admin/login` while authed → 307 `/admin` ✓ · wrong password / unknown email → 401 ✓ · tampered cookie → null session ✓ · `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run format:check` ✓

> Local test credential (dev only, embedded PG): `admin@hucha.id` / `HuchaAdmin2026!`. Rotate with `npx tsx scripts/create-admin.ts admin@hucha.id '<new-password>'`.

### Phase 2 — Senior Review (no new features)

- [x] **Rate limiting on login** (blueprint §32) — Better Auth `rateLimit` enabled (`60/min` default, `5/min` custom rule on `/sign-in/email`), **plus** a server-action-level in-memory sliding-window limiter (`src/domain/auth/rate-limit.ts`: 10 attempts / 15 min / IP). Rationale: Better Auth's built-in limiter only runs on HTTP requests through `auth.handler`; programmatic `auth.api.signInEmail` calls from server actions bypass it — verified empirically (7 rapid server-action logins all passed while the API endpoint 429'd)
- [x] **Record `last_login_at`** on successful login — `loginAction` now calls `UserRepository.touchLastLogin` (the method existed but was dead code; field is in blueprint §16 `users`) — verified updated in DB
- [x] **Don't swallow login errors** — `loginAction` distinguishes Better Auth 429 (rate-limited) from other failures and `console.error`s unexpected errors instead of silently returning "wrong credentials"; also treats a non-session `signInEmail` result as rate-limited
- [x] **`requirePageAuth`** now also redirects deactivated users (`ForbiddenError`) to login instead of surfacing a 500 error boundary
- [x] **Trusted origins** include `BETTER_AUTH_URL` in addition to `APP_URL` (origin check for sign-in when the two differ)
- [x] Harden `scripts/create-admin.ts` — `main()` with `try/finally` disconnect, explicit exit codes, rejects inactive users
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run build` ✓ · `npm run format:check` ✓ · runtime: 10 server-action logins OK, 11th+ → rate-limit message ✓ · `last_login_at` written ✓ · API `/sign-in/email` 429 on 6th rapid attempt ✓

> Reviewed, no change needed: seed `roles.permissions` maps match blueprint §19 exactly (cross-checked all 3 roles × 13 modules) · login errors intentionally generic (no user enumeration) · session 60-min expiry + 15-min refresh (blueprint §32) · sign-up disabled (admins created via script) · auth module keeps the project's existing `domain` pattern of framework-coupled helpers (consistent with repositories using Prisma)

### Phase 2 (remaining)

- [ ] Landing Page
- [ ] About
- [ ] Products

## Phase 3

### Phase 3 — Reusable Design System (complete)

- [x] Installed `embla-carousel-react` for the Carousel primitive
- [x] **Core primitives** (`src/components/ui/`) — `Button` (+variants/asChild), `Badge`, `Card` (+Header/Title/Description/Action/Content/Footer), `Input`, `Textarea`, `Label`, `Select`, `Checkbox`, `Switch`, `Skeleton`, `Separator`, `Table`
- [x] **Overlay/interaction primitives** — `Dialog`, `Modal` (controlled convenience wrapper), `Drawer` (top/right/bottom/left slide-over), `Accordion`, `Tabs`, `Toast` (+`Toaster`, `useToast`, variants) — all built on the `radix-ui` meta-package (1.6.7)
- [x] **Content components** — `DataTable` (generic, loading skeleton / empty state / footer / pagination), `DataTablePagination` (page links + optional page-size selector), `Carousel`
- [x] **Layout components** — `Navbar` (responsive mobile menu), `Footer` (link columns), `Sidebar` (flat + collapsible nested groups), `DashboardLayout` (desktop fixed sidebar, mobile slide-over)
- [x] **State/components** — `Hero`, `EmptyState`, `ErrorState`
- [x] Toast provider wired into root layout (`src/app/layout.tsx` renders `<Toaster />`)
- [x] Conventions: shadcn v4 style (`data-slot` attributes, cva variants, `cn()`), radix namespaces imported aliased (`import { Slot as SlotPrimitive } from "radix-ui"`), all text content in Indonesian, no business logic (pure presentational/reusable)
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run format:check` ✓ · `npm run build` ✓ (7 routes, middleware 34.7 kB)

> Notes: `lucide-react@1.28.0` removed brand icons (Facebook/Instagram/Twitter/Youtube/Linkedin) — social links should use neutral text/placeholders. The remaining Better Auth secret warnings during build are pre-existing dev-env config, unrelated to Phase 3.

### Phase 3 — Senior Review (no new features)

- [x] **Accessibility (blueprint §34)** — interactive pagination controls rendered as `<a>` without `href` (not keyboard-focusable) → replaced with `<button>` (`PaginationPageButton`, `PaginationPrevious`, `PaginationNext`); `PaginationLink` retained as a real `<a>` for href-based navigation. `ToastClose` given `aria-label`. `Navbar` mobile menu wired with `aria-controls` + closes on `Escape`. `DashboardLayout` mobile menu now reuses the `Drawer` primitive (focus trap, overlay/Escape close, portal) instead of a hand-rolled overlay. `Modal.title` made required so dialogs always expose an accessible name.
- [x] **Correctness** — `Hero` no longer leaves a wasted half-width grid column when `visual` is absent and `align` is not `center` (content now always `col-span-full` without a visual). `SelectValue` no longer renders its own border/box (double-frame inside the trigger). `DrawerContent` base dropped the always-on `inset-y-0` that conflicted with top/bottom sides. Toast action background selector fixed (`group-[.toast]` → `group-data-[slot=toast]`, matching the `data-slot` convention); removed duplicated `text-foreground/50` on `ToastClose`.
- [x] **TypeScript quality / performance** — `data-table-pagination` now types page items as `PageItem = number | "ellipsis"` (no `as number` cast), `PAGE_SIZE_OPTIONS` `as const`, explicit `range()` return type. `useToast` subscribes once (`[]` deps) instead of re-subscribing on every state change.
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run format:check` ✓ · `npm run build` ✓ (7 routes, middleware 34.7 kB, no size regression)

## Phase 4

### Phase 4 — Public Pages (complete)

- [x] Mock data (`src/lib/mock/`) — extended `site.ts` (nav, footer columns, marketplaces, WhatsApp display, hours, map embed), added `brands.ts`, `jobs.ts`, `testimonials.ts`, `faqs.ts`, `legal.ts`
- [x] Shared content components — `BrandLogo`, `SocialLinks`, `FloatingSocial`, `StarRating`, `MediaPlaceholder` (gradient placeholder), `SectionHeading`, `MarketplaceBadges`, `ProductCard`, `ArticleCard`, `FaqAccordion`, `LegalDocument`
- [x] Public layout shell — `(public)` route group: `layout.tsx` (SiteHeader + SiteFooter + FloatingSocial + Organization JSON-LD), `site-header.tsx` (active-link aware), `site-footer.tsx`
- [x] Form kit — `FormField`, `FormSuccess`, `SubmitButton`, `HoneypotField`, `useMockSubmit` (Zod-validate + simulated 700ms submit), `whatsapp-link`; forms: `DistributorForm`, `OemForm`, `ContactForm`, `CareerApplicationForm`
- [x] Home `/` — hero, featured brands, product carousel, USP grid, testimonials, CTA
- [x] About `/tentang-kami` · Brands `/merek-kami` (grouped by brand) · Testimonials `/testimoni` · FAQ `/faq`
- [x] Products `/produk` (client filter/search catalog) + `/produk/[slug]` (SSG, Product JSON-LD)
- [x] Distributor `/kemitraan` + `/oem` (lead forms) · Careers `/karir` + `/karir/[slug]` (SSG, JobPosting JSON-LD)
- [x] Blog `/blog`, `/blog/[slug]` (SSG, Article JSON-LD), `/blog/kategori/[slug]`
- [x] Contact `/kontak` (embedded map) · Legal `/kebijakan-privasi` + `/syarat-ketentuan` (shared `LegalDocument`) · custom 404 `src/app/not-found.tsx`
- [x] SEO metadata via `src/lib/seo.ts` (`pageMetadata` → canonical + OG + Twitter) on every page; removed stale placeholder `src/app/page.tsx`
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run format:check` ✓ · `npm run build` ✓ (35 static routes incl. all SSG param sets)

> Notes: real image assets still placeholders (gradient `MediaPlaceholder`) — swap in actual product/brand imagery when available. `APP_URL` not in `.env`, so `siteUrl()` falls back to `https://hucha.id` for canonical/OG. Forms are mock-submit only; Phase 5 wiring to `POST /api/leads/*` + lead repository replaces `useMockSubmit`.

### Phase 4 — Senior Review (no new features)

- [x] **CV validation bug (real)** — `CareerApplicationForm` flipped to the success screen even when the uploaded CV was invalid/missing, because `useMockSubmit` sets `status: success` on Zod pass independently of the file check. Now validates the file first and bails before submitting, so a bad CV can never reach the success state
- [x] **Product catalog filter/search not URL-synced** — the nav dropdown children (`/produk?kategori=…`) and category cards are plain links, so clicking them while already on `/produk` did nothing (initial-state-only props). `ProductCatalog` now derives `kategori`/`q` from `useSearchParams` and pushes changes via `router.replace({ scroll: false })`; the search input stays locally controlled (synced via `useEffect`) to avoid keystroke loss. `/produk` reverted from dynamic to a static page wrapped in `<Suspense>` for `useSearchParams`
- [x] **Navbar dropdown parent not clickable** — the "Produk" trigger was a `<button>` with no navigation; converted to a `<Link href>` so clicking navigates (hover/focus still open the submenu); dropped the always-false `aria-expanded`
- [x] **JobPosting schema.org mapping wrong** — non-full-time jobs were all emitted as `CONTRACTOR`; now a proper `EmploymentType → {FULL_TIME|PART_TIME|CONTRACTOR|INTERNSHIP}` map
- [x] **"Artikel Terbaru" ordering wrong** — articles were rendered oldest-first (array order); added `getArticlesNewestFirst()` and used it on the blog index, homepage, and "Baca Juga"
- [x] **Dead code removed** — unused `getBrandByCategory`, `categoryNameById`, `getOpenJobs`, `getRecentArticles`; unused `priority` prop on `ProductCard`
- [x] **TypeScript / naming quality** — `brands.ts` now reuses the shared `CategoryType` union and `MockCategory`/`MockProduct` instead of duplicating literal unions / opaque `ReturnType<>`; `MarketplaceBadges` no longer uses the `!` non-null assertion (typed `VisibleButton` with required `href`); `social-links` uses the idiomatic `LucideIcon` type; `contactItems` in `/kontak` given an explicit `ContactItem` interface
- [x] **Misc polish** — removed explicit `label={undefined}`/`icon={null}`; corrected misleading `siteUrl()` JSDoc (falls back to `https://hucha.id`, not `localhost:3000`)
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run format:check` ✓ · `npm run build` ✓ (35 routes; `/produk` now static, +11 kB First Load) · `next start` smoke test: `/`, `/produk`, `/produk?kategori=spareparts`, `/blog`, `/karir/…`, `/kemitraan`, `/oem`, `/kontak`, `/syarat-ketentuan` → 200; unknown route → 404 ✓

### Phase 4 — Senior Review #2 (no new features)

- [x] **Structured-data security + DRY** — all four JSON-LD `<script dangerouslySetInnerHTML>` blocks (public layout, product/job/article detail) replaced with a single `src/components/json-ld.tsx` component that escapes `<` → `\u003c` before injecting, so a literal `</script>` in any string can never break out (defense in depth, §32); `dangerouslySetInnerHTML` now exists in exactly one file
- [x] **Invalid Product structured data removed** — the Product JSON-LD emitted an `Offer` with no `price` (invalid schema.org, can't trigger rich results); dropped `offers`/`absoluteUrl` since mock products have no pricing data
- [x] **Duplicate accessible label** — `SocialLinks` rendered both the visible label and an `sr-only` label when `showLabel` was set (screen readers announced each link twice); the two are now mutually exclusive
- [x] **Unnecessary defensive copy in footer** — `site-footer` shallow-copied every `footerColumns` link purely to satisfy the `as const` readonly typing; removed `as const` (typed explicitly) and pass the array straight to `Footer`
- [x] **Import-group consistency** — `@/lib/mock/*` imports interleaved inside the `@/components/*` block in `/kemitraan` and `/tentang-kami`; reordered to match the convention used everywhere else (lib → mock → components)
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run format:check` ✓ · `npm run build` ✓ (35 static routes, no size regression) · built HTML inspected: Organization JSON-LD intact, Product JSON-LD without invalid `offers` ✓

> Note: Better Auth's `BETTER_AUTH_SECRET` low-entropy warning during build is a pre-existing dev-env setting (Phase 2), unrelated to Phase 4.

### Phase 4 (remaining)

- [ ] Swap placeholder gradients for real imagery (product/brand/blog)
- [ ] Phase 5: wire public forms to real lead API + repository, replace `useMockSubmit`

...

## Phase 5 — CMS Foundation / Admin Core (complete)

> Scope (user-directed): Dashboard, Sidebar, Top Navigation, User Profile, Settings, Notifications, Activity Log, User Management, Role Management, Permission Management. **No feature modules** (products/articles/media/leads CRUD deferred).

- [x] **Admin shell** — `src/components/admin/admin-nav.tsx` (`buildAdminNav(user)`: permission-filtered groups, disabled "Segera" placeholders for not-yet-shipped modules), `admin-shell.tsx` (client active-route wrapper over `DashboardLayout`), `admin-header.tsx` (notification bell w/ unread badge + user dropdown: profil/keluar via `logoutAction`), `form-status.tsx` (renders `AdminFormState`)
- [x] **Layout rewrite** — `src/app/admin/layout.tsx`: signed-in → `AdminShell` (sidebar brand/footer with role label, header actions); signed-out → plain frame (keeps `/admin/login` working); `unreadCount` loaded per user
- [x] **Shell primitives** — `DashboardLayout` gained `headerActions` prop; `Sidebar` gained `disabled` items rendered as non-interactive "Segera" labels
- [x] **Dashboard** `/admin` — `requirePageAuth`; role-gated stat cards (produk terbit, artikel terbit, lead 7 hari, lamaran masuk, pengguna aktif, notifikasi belum dibaca), recent audit activity (5), quick links (users/roles/notifications/settings per permission)
- [x] **Profile** `/admin/profil` — account info card + `ProfileForm` (`updateProfileAction`, direct `UserRepository.update` since Better Auth rejects email change) + `PasswordForm` (`changePasswordAction`, maps Better Auth `INVALID_PASSWORD` → "Kata sandi saat ini salah", revokes other sessions)
- [x] **Settings** `/admin/settings` — `requirePermission("settings","manage")`; loads JSONB settings via `SettingRepository.getAll`, groups into company/social/seo/notification_recipients (`SETTINGS_GROUPS` shared from `src/shared/validation/admin.ts`); `SettingsForms` client component (comma-separated email lists ↔ arrays, server-side validation authoritative)
- [x] **Notifications** `/admin/notifications` — paginated list via `NotificationRepository.listForUser`, unread indicator, per-item + mark-all-read actions (`markNotificationReadAction` / `markAllNotificationsReadAction`, owner-scoped)
- [x] **Activity Log** `/admin/audit-log` — `requirePermission("auditLog","view")`; read-only table (action/entity/detail/user/waktu), filter by action + entity type, page links; `AuditLogRepository.list` reused (append-only §32)
- [x] **Users** `/admin/users` — `requirePermission("users","manage")`; search + paginated list, active/role status badges, `CreateUserButton` dialog (`createUserAction`: atomic user + Better Auth credential account via `UserRepository.createWithCredential`, zod-validated), row actions client component (`setUserRoleAction` / `setUserActiveAction` with toast feedback; self-actions disabled)
- [x] **Roles & Permissions** `/admin/roles` + `/admin/roles/[id]` — role list with granted-permission counts; `PermissionForm` checkbox grid (13 modules × view/manage/export, labels in Indonesian) submitting `updateRolePermissionsAction` (`rolePermissionsSchema`); JSONB cast via `as unknown as`; only `RoleName` enum roles editable
- [x] **Auth actions** — added `updateProfileAction`, `changePasswordAction` to `src/domain/auth/actions.ts` (audit-logged); `logoutAction` retained
- [x] **Helpers** — `src/lib/admin.ts`: `roleLabel`, `auditActionLabel`, `entityLabel`, `formatDate`, `formatDateTime`, `formatRelativeTime` (id-ID)
- [x] Verified: `npm run lint` ✓ (0 errors/warnings) · `npm run typecheck` ✓ · `npm run build` ✓ (41 routes; new admin routes all dynamic `ƒ`; existing public routes unchanged)

> Notes: only the seeded `super_admin` role has `users`/`settings`/`auditLog` permissions, so Users/Roles/Settings/Activity Log are hidden from `content_editor`/`sales_manager` (§19 + §32). The audit-log filter uses a native `<select>` (server-rendered GET form; `ui/select` exports styled parts but no `Root` — Radix `Select.Root` is used in client components like the user forms). No DB migration needed this phase (settings JSONB, roles JSONB). Better Auth secret warnings during build are pre-existing dev-env settings.

### Phase 5 (remaining)

- [ ] Phase 5: wire public forms to real lead API + repository, replace `useMockSubmit`
- [ ] Feature modules (deferred): Products, Articles/Blog, Media Library, SEO Manager, Leads Inbox, Career/Applications, Testimonials, FAQ, Analytics, Email notification delivery (§30) + scheduled lead/application notifications

### Phase 5 — Senior Review (no new features)

- [x] **Security — super_admin role now immutable** — `updateRolePermissionsAction` rejects edits to the `super_admin` role (it holds `users.manage`, so editing it could revoke the last admin → self-lockout); `roles/[id]` shows a read-only notice and the roles list renders a "Tetap" badge instead of the edit link for it. Protected-role + role-name helpers centralized in `src/domain/users/roles.ts` (`ROLE_NAMES`, `isRoleName`, `isProtectedRole`), removing the duplicated `isRoleName` from `role-actions.ts` and `roles/[id]/page.tsx`
- [x] **Security — role/self mutations hardened** — `setUserRoleAction` now blocks changing your own role (mirrors `setUserActiveAction`'s self-deactivation guard) and both role-changing actions validate the target role exists (`RoleRepository.findById`), so an unknown `roleId` no longer leaks a raw P2003 FK error
- [x] **Security — precise change-password errors** — `changePasswordAction` no longer maps _every_ Better Auth `APIError` to "Kata sandi saat ini salah"; only `body.code === "INVALID_PASSWORD"` does (429 → rate-limit message, anything else → generic + `console.error`)
- [x] **Security — create-user no longer defaults to super_admin** — the "Tambah Pengguna" dialog previously defaulted the role `Select` to the first role (id-ordered → `super_admin`); it now starts unselected with a placeholder and requires an explicit choice
- [x] **Robustness — best-effort audit logging** — new `src/domain/audit/log-audit.ts` wraps `AuditLogRepository.create` in try/catch + `console.error` (mirrors the §29 "notifications are best-effort" rule); all admin actions (`users`, `roles`, `settings`, profile/password) now use it so a failed audit write can never roll back or mask a successful mutation
- [x] **Error handling — admin error boundary** — added `src/app/admin/error.tsx` (`ErrorState` + retry/back-to-dashboard) so unexpected page/action failures render a friendly screen instead of a raw stack trace; `requirePermission`/`NotFoundError` page failures now surface there
- [x] **DRY — shared settings groups** — `SETTINGS_GROUPS` + `SettingsGroup` moved to `src/shared/validation/admin.ts` (the schema module both sides already import); `settings/actions.ts` and the client `settings-form.tsx` now share the single group→schema map (was duplicated as `GROUP_SCHEMAS`)
- [x] **DRY + a11y — shared pagination** — new `src/components/admin/pagination-nav.tsx` (prev/next with real disabled `<button>`s at boundaries, §34) reused by audit-log, users, and notifications; replaces the focusable-but-inert `pointer-events-none` links
- [x] **Performance — removed duplicate user fetch** — `/admin/users` used `requirePermission` _and_ `getCurrentUser` (two session→DB round-trips); now reuses the guard's return value for `isSelf`
- [x] **UI/UX** — profile & password forms no longer render the form-level error under every field (was shown 3×); users table shows localized `roleLabel` instead of the raw enum; create-user password placeholder corrected to "Minimal 10 karakter" (was 8, schema requires 10); notifications list now paginates (was reading a dead `page` param with no controls)
- [x] **Types** — `PermissionForm`/`roles/[id]` now use the domain `RolePermissions` type (no `Record<string, Record<string, boolean>>`); `countGrants` accepts `unknown` (no casts)
- [x] Verified: `npm run lint` ✓ · `npm run typecheck` ✓ · `npm run build` ✓ (all admin routes compile; no size regression)

### Phase 6 — Business Modules (12 modules behind the Phase 5 admin shell)

- [x] **Schema + migration** — `Brand` (name/slug/tagline/description/category/logo FK/JSONB highlights/sortOrder/isPublished + soft delete; `products.brandId` FK `SetNull`) and `NewsletterSubscriber` (unique email, optional name, isSubscribed, source) added to `prisma/schema.prisma`; `prisma validate` + `prisma generate` ✓; hand-written migration `20260805000000_add_brand_and_newsletter/migration.sql` (awaits running `prisma migrate deploy` once PostgreSQL is up)
- [x] **Shared admin infra** — `PageHeader` (`src/components/admin/page-header.tsx`), `Field`/`SubmitButton` (`form-fields.tsx`), `MediaPicker` (searchable single/multi picker, `media-picker.tsx`), FormData parsers `toOptionalString/Number`, `toBoolean`, `toNumberArray`, `toNullableString` (`src/domain/action-utils.ts`), `mapPrismaError` P2003→`ConflictError` ("Data masih digunakan…") for FK-protected deletes, `canManage` helper, label maps in `src/lib/admin.ts` (`CATEGORY_TYPE_LABELS`, `PRODUCT_STATUS_LABELS`, `ARTICLE_STATUS_LABELS`, `JOB_STATUS_LABELS`, `EMPLOYMENT_TYPE_LABELS`, `APPLICATION_STATUS_LABELS`, `LEAD_TYPE_LABELS`, `LEAD_STATUS_LABELS`, `formatFileSize`)
- [x] **Media Library** `/admin/media` — grid + search + mime-type badges + pagination, `MediaPicker`-ready; upload modal (multipart, 5 MB, JPEG/PNG/WebP/GIF/SVG → `public/uploads`), alt-text edit modal, delete modal with `ConflictError` handling (`src/domain/media/actions.ts`); gate `media.manage`; `MediaRepository.findByIds` added
- [x] **Products** `/admin/products` + `[id]` + `new` — `src/domain/products/actions.ts` (create/update/delete/featured w/ FK-reference validation), `product-form.tsx` (controlled category→subcategory select, brand select, media picker ≤5, marketplace links), `product-actions.tsx` (featured switch + delete), list with search/status/category/brand filters + pagination; `listAdmin` extended (status/brandId/category + `brand` include), `ProductInput.brandId`
- [x] **Categories** `/admin/categories` — `src/domain/products/category-actions.ts` (create/update/delete, parent-type + 2-level max validation), modal form (`category-form.tsx`, `create-category-button.tsx`), row actions, search + type filter; `CategoryRepository.listAdmin/delete`
- [x] **Brands** `/admin/brands` + `[id]` + `new` — `src/domain/brands/{brand.repository.ts,actions.ts}` (create/update/softDelete), `shared/validation/brand.ts` (highlights ≤10), logo media picker (single), JSONB highlights line-per-row, list + forms; uses `products.manage` permission
- [x] **Blog & Artikel** `/admin/blog` + `new` + `[id]` — `src/domain/articles/actions.ts` (create/update/delete/publish; author bound at create; scheduled requires `publishedAt`; FK refs validated), `article-form.tsx` (category/status/datetime-local slug publish/tags/featured picker), search/status/category filters; taxonomy sub-modules `/admin/blog/categories` + `/admin/blog/tags` via `taxonomy-actions.ts` + shared `taxonomy-form.tsx`/`taxonomy-manager.tsx` (reused for FAQ categories)
- [x] **Karir** `/admin/career` + `new` + `[id]` — `src/domain/jobs/actions.ts` (create/update/delete/status), `job-form.tsx`, open/close switch + delete, search/status filters; `JobRepository.listAdmin` extended
- [x] **Lamaran** `/admin/applications` + `[id]` — `src/domain/jobs/application-actions.ts` (status transitions, delete), status select (client, `applications.manage`), list w/ search + job/status filters, detail page (contact info, cover note, CV link, status change, delete); `ApplicationRepository.list` gained search + `delete`
- [x] **Testimoni** `/admin/testimonials` + `[id]` + `new` — `src/domain/testimonials/actions.ts` (create/update/publish toggle/soft delete), star-rating input + logo media picker form, list w/ search + published filter, row actions
- [x] **FAQ** `/admin/faq` + `[id]` + `new` — `src/domain/faqs/actions.ts` (FAQ + category CRUD), `faq.repository.ts` extended (listAdmin search/published/category, update/delete category w/ FK protection, delete FAQ), page combines `TaxonomyManager` category manager (new `deleteHint` prop) + paginated FAQ table
- [x] **Leads** `/admin/leads` + `[id]` — type tabs (Semua/Distributor/OEM/Kontak), search + status filter, detail page w/ full contact card + `LeadDetailForm` (status + assignee select, validates assignee exists), delete; `LeadRepository` gained search + `delete`
- [x] **Newsletter** `/admin/newsletter` — new `src/domain/newsletter/newsletter.repository.ts` (subscribe upsert, opt-out, delete, listAdmin) + `actions.ts`; subscriber list w/ search + subscribed filter, opt-out + delete row actions
- [x] **Permissions wiring** — `newsletter` added to `RolePermissions`, `rolePermissionsSchema`, `permission-form.tsx` module labels, and seed role maps (super_admin + content_editor); nav `buildAdminNav` now maps all 12 modules to live routes (SEO/Analytics still disabled placeholders); `applications.manage`/`newsletter.manage` enforced in actions + page gates
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ (0 warnings) · `npm run build` ✓ (60/60 static pages, 12 new admin modules compile)

### Phase 6 Review — senior-engineer audit + fixes

- [x] **HIGH — article scheduling** — `parseArticleForm` now converts `datetime-local` → ISO UTC (`new Date(publishedAt).toISOString()`) before `z.iso.datetime()` validation (Zod v4 requires trailing `Z`); scheduled publishing works
- [x] **MED — blog category filter** — `ArticleRepository.listAdmin` now applies `options.category` → `where.blogCategory = { slug }` (was silently ignored)
- [x] **MED — job status validation** — added `jobStatusUpdateSchema` (`src/shared/validation/job.ts`); `setJobStatusAction` validates `status` before the repo call
- [x] **MED — testimonial/FAQ FK + revalidation** — testimonials `partnerLogoMediaId` and FAQ `faqCategoryId` now reference-checked before create (no raw P2003 leaks, `runMapped` conflict hints); audit `entityId`/`entityType` fixed for FAQ categories; revalidation corrected to `/admin/testimonials`+`/testimoni` and `/admin/faq`+`/faq` (was over-broad `revalidatePath("/", "layout")`); testimonial delete returns a success message
- [x] **MED — shared taxonomy schema** — new `taxonomySchema` in `src/shared/validation/common.ts` (name 3–100 + slug); `faqCategorySchema` aliases it; `taxonomy-actions.ts` no longer imports the FAQ module's schema
- [x] **MED — media upload hardening** — new `src/domain/media/image-type.ts` magic-byte sniffer (`sniffImageType`); upload now content-sniffs JPEG/PNG/WebP, rejects GIF/SVG (SVG stored-XSS vector; global `nosniff` already on), 10 MB max (§31)
- [x] **MED — public-route revalidation** — all module actions now revalidate their public consumers: `/produk[/slug]`, `/merek-kami`, `/blog[/slug]`, `/karir[/slug]`, `/testimoni`, `/faq`, `/admin/applications/[id]` — no more blanket root revalidation
- [x] **MED — missing manage gates** — products/categories/brands/blog/career/applications/testimonials/newsletter/leads/media list pages now wrap Edit/delete row actions in `canManage*` (UI was hidden while controls stayed visible)
- [x] **MED — lead action signature** — `updateLeadAction` is now `(id, prevState, formData)`; `LeadDetailForm` rewritten on the shared `useActionState`/`Field`/`SubmitButton`/`FormStatus` pattern (was the only module off-pattern)
- [x] **LOW — cleanup** — removed dead code (`isSlugAvailable` ×3, `listForExport`, `findSubcategories`); deleted redundant `router.refresh()` after `router.push()`; `countByStatus` uses one pass; brand `highlights` parsed via `z.array(z.string())` (no unsafe cast); `MediaRepository.countUsages` now includes brand logos; `ENTITY_LABELS` covers `faq_category`/`blog_category`/`brand`/`newsletter`
- [x] Verified post-fix: `npx tsc --noEmit` ✓ · `npm run lint` ✓ (0 warnings) · `npm run build` ✓ (60/60 static pages, `Compiled successfully`)

> Notes: DB was offline (P1001) so `prisma migrate deploy` / `npm run db:deploy` is still required once PostgreSQL is up (migration SQL is committed). `npx prettier --write` not yet run on new files (pre-existing `prisma/seed.ts` format failure). Leads/contact still come from the public API mock (`useMockSubmit`) — deferred to Phase 5 remaining.

## Phase 7 — SEO & Analytics (Metadata, Structured Data, Reports)

> Scope (user-directed): Analytics Dashboard, SEO Manager, Metadata, OpenGraph, Twitter Card, Schema.org, robots.txt, sitemap.xml, Breadcrumb, Performance optimization.

- [x] **Metadata/OG/Twitter** — `src/lib/seo.ts` extended: `pageMetadata` now accepts `ogImage` + `openGraphType`, emits `openGraph.images` (1200×630) and `twitter.images` (summary_large_image); `DEFAULT_OG_IMAGE` fallback per §27.
- [x] **A real default OG image** — generated `public/og-default.png` (1200×630, generated once via sharp; brand imagery still placeholders per Phase 4 note) so the OG fallback never 404s.
- [x] **Root layout** — `src/app/layout.tsx`: added `metadataBase` (`siteUrl()`), site-wide `openGraph` + `twitter`, and a proper `viewport` export with `themeColor` (moved out of `metadata` to silence the Next `themeColor` warning).
- [x] **Breadcrumb** — new `src/components/breadcrumb.tsx` (server component): home-prepended trail with `nav aria-label`, visible `ChevronRight` separators, `aria-current="page"`, plus a matching `BreadcrumbList` JSON-LD block. Applied to `/produk/[slug]`, `/blog/[slug]`, `/blog/kategori/[slug]`, `/karir/[slug]` (replacing the old "Kembali ke ..." links; removed now-unused `ArrowLeftIcon` imports).
- [x] **robots.txt** — `src/app/robots.ts` (disallow `/admin/`, `sitemap` URL) — verified at runtime.
- [x] **sitemap.xml** — `src/app/sitemap.ts` (static routes + products + blog categories + articles + jobs; article `lastmod` from `publishedAt`) — verified at runtime.
- [x] **Schema.org** — Organization (public layout, pre-existing), Product/Article/JobPosting JSON-LD (pre-existing), `BreadcrumbList` via the new Breadcrumb component; all still escaped through the single `JsonLd` component (§32).
- [x] **SEO Manager** — new `src/app/admin/seo/page.tsx`: `requirePermission("seo","view")`, dry-run SEO audit from `SeoMetaRepository.listAuditCandidates()`, summary stat cards, entity/status GET filters, issue → Indonesian labels, deep-link "Edit SEO" to the product/article form; nav item `admin-nav.tsx` un-disabled → `/admin/seo`.
- [x] **Analytics Dashboard** — new `src/app/admin/analytics/page.tsx`: `requirePermission("analytics","view")`, 7/30-day range toggle, stat cards (pageViews/uniqueVisitors/newLeads range + total leads), line chart of daily views, bar chart of leads per type, top-articles list from latest snapshot JSONB; graceful empty state when no snapshots (§20/§28). Charts are new dependency-free server-rendered SVG primitives `src/components/admin/analytics-charts.tsx`. Nav item un-disabled → `/admin/analytics`.
- [x] **Performance** — `metadataBase` + OG/Twitter images, static robots/sitemap, server-rendered SVG charts (no new client runtime), `themeColor` via `viewport`.
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ (0 errors) · `npm run build` ✓ (64 static pages incl. robots.xml sitemap + SSG param sets; no themeColor warning) · `npx prettier --write` run on all Phase 7 files · runtime `next start` smoke test: `/robots.txt` (404 `/admin` disallow) ✓ · `/sitemap.xml` (29 URLs, correct article `lastmod`) ✓.

> Notes: build route count grew 60 → 64 (robots.txt, sitemap.xml, /admin/seo, /admin/analytics). `/admin/seo` and `/admin/analytics` hit the DB at runtime (P1001 on these pages until PostgreSQL is back up) — same as every other Phase 5/6 admin module. `format:check` still reports ~40 pre-existing Phase 6 files (Prettier debt documented above, untouched per RULES) — all Phase 7 files are clean. Better Auth `BETTER_AUTH_SECRET` warnings remain pre-existing dev-env config. OG/Twitter cards reference `public/og-default.png` (real asset) until per-entity imagery ships. Consistent with blueprint §27 sitemap/robots behavior but driven by mock data — wired to Prisma once the public site reads from repositories.

### Phase 7 — Senior Review (no new features)

- [x] **Security — gate "Edit SEO" links by permission** — `/admin/seo` previously linked every audit row to the product/article edit page, which is itself gated by `products.manage`/`articles.manage`, but a role that only has `seo.view` would click into a 403. `SeoManagerPage` now captures the user from `requirePermission("seo","view")` and renders the "Edit SEO" action only when `canManage(user.role.permissions, module)` matches the row's entity (else a "Hanya lihat" label). Defense in depth consistent with §32 (§19 permissions honored in the UI, not just server-side).
- [x] **TypeScript quality — remove unsafe casts in the SEO page** — the `entity`/`status` filter parsing relied on nested ternaries and `as "product"`/`as "article"` casts. Replaced with `isAuditEntity`/`isAuditStatus` type guards over `as const` option arrays (`ENTITY_OPTIONS`, `STATUS_OPTIONS`), so the values are narrowed (`AuditEntity`/`AuditStatus`) with no casts.
- [x] **Correctness — timezone-safe analytics day boundaries** — `/admin/analytics` built `from`/`to` by combining local `setDate()` with `setUTCHours()`, which can shift a day across timezones and mis-key against the repository's UTC-midnight snapshots (§28). Now computed entirely in UTC (`Date.UTC(...)`), matching `AnalyticsRepository.upsertDaily`.
- [x] **TypeScript quality — typed top-articles parsing** — the snapshot `top_articles` JSONB was handled with an inline `as unknown[]` + per-row `as Record` casts. Replaced with a guarded `parseTopArticles` helper returning a stable `TopArticle[]`, dropping any non-object element so a malformed snapshot can never break the page.
- [x] **Metadata accuracy — OG width/height only for the default asset** — `pageMetadata` claimed `1200×630` for every OG image even when the caller supplied a custom `ogImage` of unknown dimensions. Width/height are now emitted only when the `DEFAULT_OG_IMAGE` fallback (authored at that size) is used (§27).
- [x] **Accessibility / localization — Indonesian `aria-label`** — `Breadcrumb` used `aria-label="Breadcrumb"`; changed to `aria-label="Jejak navigasi"` to match the site's Bahasa Indonesia UI (blueprint §4/§34).
- [x] **SOLID/architecture — split the chart module** — `admin/analytics-charts.tsx` co-located two components + shared geometry (two responsibilities in one file). Split into `chart-types.ts` (shared `ChartPoint` + geometry constants), `analytics-line-chart.tsx`, and `analytics-bar-chart.tsx` (single responsibility each, per RULES).
- [x] **Correctness — SVG y-axis label overflow** — the line chart drew y-axis value labels at `x = WIDTH - PAD_X + 4` anchored start, overflowing the 600-unit viewBox and clipping large values. Labels moved to the left edge inside the plot and `CHART_PAD_X` widened to 48 so max-value ticks stay within bounds.
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ (0 errors) · `npm run build` ✓ (64/64 static pages; no themeColor/SEO warnings) · `format:check` still 0 Phase 7/review files (40 pre-existing Phase 6 files remain, untouched) · fixes are additive/refactor-only, no new features.

## Phase 8 — Public Site on Prisma (mock → DB)

> Scope (user-directed): drive every public page from the CMS database instead of `src/lib/mock/*` data, while keeping the components' existing mock-shaped props and SSG semantics so no feature is lost.

- [x] **Migrated all public routes from mock to DB-backed queries** — every public page is now `async` and reads published rows via `src/lib/public/*` repositories (site config, products, categories, blog, jobs, testimonials, FAQ, brands) so the admin CMS is the single source of truth.
- [x] **New query layer `src/lib/public/`** — thin Prisma→mock-shape mappers so components are unchanged: `products.ts` (`getPublicCategories/Products/FeaturedProducts`, `getProductBySlug`, marketplace URLs → `undefined`), `blog.ts` (categories + newest-first articles, `readingMinutes` derived from `body`, `publishedAt` `YYYY-MM-DD`), `jobs.ts` (`requirements` TEXT split on newline into `string[]`, `employmentType`/`location`/`department` defaults), `testimonials.ts` (adds `partnerRegion`), `faqs.ts` (published FAQs grouped by category), `brands.ts` (`getPublicBrands` + `getBrandProductGroups`, `highlights` JSON array → `string[]`), `site.ts` (`getSiteConfig` from `company`/`social` settings with static fallback + `whatsappDisplay`).
- [x] **Site chrome now DB-driven** — `(public)/layout.tsx` (Organization JSON-LD) and `components/layout/site-footer.tsx` (description/legalName) fetch `getSiteConfig()`; `site-header`/`social-links`/`brand-logo`/`whatsapp-link` remain on static `siteConfig`/nav (intentional passthroughs).
- [x] **sitemap.xml → Prisma** — products, blog categories, articles (real `publishedAt` `lastmod`), and jobs now come from repositories instead of mock imports.
- [x] **Kebijakan Privasi** — `register`/`legalName` via `getSiteConfig()` (legal section text stays static `lib/mock/legal`).
- [x] **Seed & schema additions** — `Testimonial.partnerRegion` (migration `20260806000000_add_testimonial_region`), brands seed (HuCha Racing/Lubricants/Auto Care with `isPublished`) linked to products by category, testimonial upsert on `partnerName` with `isPublished: true` + region, jobs `requirements` as multi-line text; all applied via `npm run db:deploy` + `db:seed`.
- [x] **Admin echo** — `partnerRegion` through testimonial repository/actions/validation/form/admin pages; `BrandRepository` create/update `highlights` JSON array + `Prisma.DbNull` fix.
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ (0 errors) · `npm run build` ✓ (SSG param sets now generated from DB: 6 products, 3 articles, 3 blog categories, 3 jobs) · runtime `next start` smoke test: `/`, `/produk`, `/karir/sales-area-jawa-barat`, `/blog`, `/faq`, `/merek-kami`, `/sitemap.xml` all 200 · rendered HTML confirmed DB-driven (`sales-area-jawa-barat` job, `HuCha Racing/Lubricants/Auto Care` brand lines, testimonial `partnerRegion` Bekasi/Jawa Barat).

> Notes: `src/lib/mock/*` retained only as type definitions, static labels (`categoryTypeLabel`, `employmentTypeLabel`, `brandCategoryIndex`), site chrome config, and legal text — no page consumes mock *data arrays* anymore. `npm run build` now requires the DB to be reachable (SSG queries at build time); local docker compose and the prod-compose `DATABASE_URL` satisfy this (Dockerfile already runs `prisma generate` before build).

## Phase 9 — Notification System & Email Flow (§29–30)

> Scope (user-directed, blueprint §48 step 9): transactional email adapter + in-app notifications for new leads & job applications, configurable recipients.

- [x] **Email adapter** — `src/config/email.ts` (optional SMTP config: `SMTP_HOST/PORT/USER/PASS/FROM`, `enabled` flag, runtime no-op when unset) + `src/infrastructure/email/send-email.ts` (nodemailer transport, secure on 465, `sendEmail` with 3-attempt exponential-backoff retry, `trySendEmail` best-effort wrapper never throws).
- [x] **Notification service** — `src/domain/notifications/notification.service.ts`: `notifyLeadCreated` (lead type → `notification_recipients` setting emails) + `notifyApplicationCreated`; both fire in-app `Notification` rows for active admin users whose role grants `manage` on `leads`/`applications` (§19). Best-effort by construction — failures are logged, never thrown, and never block the DB write (§29 edge case).
- [x] **Wired into public forms** — `submitLead*` actions (`src/domain/leads/public-actions.ts`) and `submitJobApplicationAction` (`src/domain/jobs/public-application-actions.ts`) now call `void notifyLeadCreated`/`notifyApplicationCreated` *after* the repository write succeeds (fire-and-forget, non-blocking, §29 "DB write always succeeds first").
- [x] **Config** — SMTP vars added to `.env.example` (optional) + `docker-compose.yml` (mailhog passthrough). `package.json` `overrides` gain `hono@^4.12.34` to clear the transitive dev-tool ReDoS (`npm audit` → 0 vulnerabilities).
- [x] Dependencies added: `nodemailer` (runtime), `@types/nodemailer` (dev).
- [x] Verified: `npm install` ✓ · `npm run typecheck` ✓ · `npm run lint` ✓ (0 errors) · `npm run build` ✓ · `npx prettier --write` on new/changed files ✓ · `npm audit` 0 ✓.
- [x] Runtime smoke tests (embedded PG live): `notifyLeadCreated` → 1 in-app notification for the `super_admin` user (the only `leads.manage` role) ✓; email disabled-path no-ops (`sendEmail` → `false`) ✓; SMTP send-path against a local sink → `sendEmail` → `true`, `trySendEmail` → undefined, no throw ✓.

> Notes: in-app recipients are derived from permissions (not a stored role list) to stay consistent with §19/RBAC; emails use the existing seeded `notification_recipients` setting. Without SMTP config the adapter is a silent no-op, so dev without mailhog still works. Resolves the "Notification + Email flow" item deferred from prior phases. Leads CSV export — FR-15 / T-LEAD-09 — delivered in Phase 10; the scheduled analytics aggregation job (§28) remains open.

## Phase 10 — Admin Enhancements (leads CSV/inbox, media library, users, SEO)

> Scope (user-directed): a second pass over the admin modules surfaced after Phase 6–9 QA. Delivered in the working tree alongside Phases 8–9; documented here so TASKS.md matches the codebase.

- [x] **Leads inbox upgrades (blueprint §7.2 notes / §15 "inbox")** — migration `20260806154151_admin_cms_enhancements` adds `leads.archived`, `leads.is_read`, `leads.notes`. Full-timeline lookup: `archive`/`markRead`/`addNote`/`updateNotes` (`src/domain/leads/actions.ts` + `lead.repository.ts`), `LeadNoteForm` + `LeadDetailForm` status/assignee on `/admin/leads/[id]`, read/unread badge + archived filter on `/admin/leads`, `archiveLeadAction` in row actions.
- [x] **Leads CSV export route** — `/api/admin/leads/export` (`requirePermission("leads","view")`), UTF-8 BOM CSV (FR-15/T-LEAD-09), respects the current `type`/`status`/`search`/`archived` filters via `LeadRepository.exportAll`; "Export CSV" button in the leads page header. XLSX deferred to follow-up.
- [x] **Media Library enhancements** — `media.folder` column + folder filter/grouping, `MediaRepository` gains `list` folder/mime filters, `listFolders`, `listMimeTypes`, `updateFileName`, `updateFolder`, `findReferenced`, `deleteMany`, `uploadMediaAction` capture width/height; new `media-library-client` grid (`MediaGridItem` checkbox select, folder tabs, bulk bar) + `MediaBulkBar`; row actions add copy-URL, rename, move-to-folder.
- [x] **Per-user audit history** — `/admin/users/[id]/audit` (Super Admin `users.manage`): `AuditLogRepository.list({ userId })` filtered list w/ entity filter + pagination; "Riwayat" link per user row.
- [x] **Admin reset password** — `resetUserPasswordAction` (opens/updates Better Auth `credential` account, `passwordSchema` validation, audit-logged) + `ResetPasswordButton` modal on user list rows.
- [x] **Article admin extras** — `isFeatured` (migration column) + `setArticleFeaturedAction` (star toggle in `ArticleRowActions`), `duplicate` (`ArticleRepository.duplicate`, transaction clone §25), `isFeatured` form field.
- [x] **SEO Manager extension** — migration adds `seo_meta.og_title/og_description/twitter_card/robots/keywords`; `seoSchema`/`SeoMetaInput`/`toAuditItem` extended, Article form gains the full SEO tab (meta title/desc character counts + warnings, OG title/desc/image, twitter card, robots, keywords, canonical) + `LiveSeoPreview`; SEO audit page new issue labels.
- [x] **Dashboard enhancement** — `countByMonth`/`countPublishedByMonth` chart data, per-type lead stat cards, article by-status cards (`/admin/page.tsx`).
- [x] **Loose-end cleanup** — removed dead code: unused `leadTypeBarData`/`LeadType`/`LEAD_TYPES`/`leadTypeLabel` in `/admin/page.tsx`, unused `Input`/`Button` imports in `media-library-client.tsx`; wired `setTitle` into the controlled title input in `article-form.tsx`.
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ (0 errors) · `npm run build` ✓ (64/64) · runtime (Postgres up, `prisma migrate deploy` + `db:seed` run): `exportAll`/`countByMonth`/`listFolders`/`countByStatus`/`countPublishedByMonth` all return correct rows; migration columns present (leads.archived/is_read/notes, media.folder, seo_meta og/twitter/robots/keywords).

## Phase 12 — Admin Settings seniority review pass

> Scope (session): senior-review hardening of the admin settings/analytics/export work (existing Prisma models only — **no new schema/features**). All fixes verified in one pass.

- [x] **Settings form contracts** — `settings-form.tsx`: removed duplicate client-side Zod validation (server stays the single validator), dropped `port`/`mediaOptions` special-casing, deduped `<label>`/`Switch` markup, replaced double `media.find`+`!` with a single checked lookup.
- [x] **DRY** — `parseTopArticles` extracted to `src/lib/analytics.ts` and shared by `/admin` + `/admin/analytics`; removed the single-element `Promise.all` in `settings/page.tsx`.
- [x] **Rich-text round-trip** — `toSafeInitialHtml` (rich-text-editor.tsx) passes HTML bodies through unchanged, escapes legacy plain text + `\n → <br>`.
- [x] **XLS export repaired** — export-xls rewrite: single `columnLetters`/`renderRowCells`/`xmlEscape`, numeric `ss:Index`, both `header`/`wrap` styles, XML-illegal control chars stripped; headers/filters/rows shared with CSV via `src/domain/leads/leads-export.ts`.
- [x] **Media bulk download** — `media-bulk-bar.tsx` defers `URL.revokeObjectURL` one tick (was canceling Chrome downloads) + sanitizes the download filename.
- [x] **GTM/GA4 IDs hardened** — write-side `analyticsSettingsSchema` enforces `^G-[A-Z0-9]{6,}$` / `^GTM-[A-Z0-9]{4,}$` so a non-conforming ID can't reach the injected `<script>`.
- [x] Verified: `npm run typecheck` ✓ · `npm run lint` ✓ (0 errors) · `npm run build` ✓ (65 static pages + SSG param sets).

> Notes: no schema changes (existing models); SMTP stays env-driven per §41, `smpt` settings group remains informational UI.
