# Database Design — HuCha Indonesia

Source of truth: `docs/HuCha_Indonesia_Master_Blueprint.md` §14 (Database Design), §16 (Entity Definitions), §17 (Relationship Definitions), §31 (Validation Rules), §33 (Performance Requirements). Textual ERD lives in `ERD.md`.

## Engine

PostgreSQL 16. Relational integrity matters for leads/roles; JSONB is used for flexible maps (role permissions, settings, analytics top-articles, audit diffs).

## Design Principles

- **Soft deletes** (`deleted_at`) on content tables: `products`, `articles`, `testimonials`, `jobs`. Deleted rows are excluded from every public query and from the admin catalog listing.
- **Unified leads table** with a `type` discriminator (`distributor | oem | contact | career_note`) instead of four near-duplicate tables — one query surface for the Admin Lead Inbox (FR-15).
- **Generic `seo_meta`** with a polymorphic `entity_type`/`entity_id` (application-layer enforced, no FK to two parents).
- **Centralized `media`**; every other table references it by FK, never duplicate files.
- **JSONB permission map on `roles`** (not hardcoded in app logic) so new roles can be added without migration.

## Naming Conventions

- Tables + columns: `snake_case`.
- Prisma model/enum names: `PascalCase` / `UPPER_SNAKE_CASE`; `@@map` / `@map` to the physical snake_case names.
- IDs: `Int` auto-increment (serial), matching Better Auth adapter expectations (Phase 0 deviation documented below).

## Schema Adaptation — Better Auth (Phase 0 deviation from blueprint)

Better Auth requires `sessions`, `accounts`, `verifications` and a `users` row shape it controls. Deviations from §16:

- `users.password_hash` and `users.role_id` are **nullable**. Better Auth stores credentials in `accounts.password`; the role is assigned at the application layer (Phase 1 RBAC).
- `users.email_verified`, `users.image` added (Better Auth required).
- `sessions` / `accounts` / `verifications` tables use the same `Int` serial IDs as `users`.

## Entity Catalog

| Model (Prisma)      | Table                 | Notes                                                    |
| ------------------- | --------------------- | -------------------------------------------------------- |
| `Role`              | `roles`               | `name` unique enum, `permissions` JSONB                  |
| `User`              | `users`               | Better Auth user + app role FK                           |
| `Session`           | `sessions`            | Better Auth                                              |
| `Account`           | `accounts`            | Better Auth credentials/social logins                    |
| `Verification`      | `verifications`       | Better Auth token verification                           |
| `Category`          | `categories`          | Self-referencing `parent_id` for sub-categories          |
| `Product`           | `products`            | Marketplace URLs, status, soft delete                    |
| `ProductImage`      | `product_images`      | join Product↔Media with `sort_order`                     |
| `BlogCategory`      | `blog_categories`     |                                                          |
| `Tag`               | `tags`                |                                                          |
| `Article`           | `articles`            | status, `published_at`, `author_id`, soft delete         |
| `ArticleTag`        | `article_tags`        | composite PK `(article_id, tag_id)`                      |
| `SeoMeta`           | `seo_meta`            | polymorphic `entity_type`/`entity_id`                    |
| `Media`             | `media`               | centralized assets                                       |
| `Job`               | `jobs`                | soft delete                                              |
| `Application`       | `applications`        | `cv_media_id` → `media`                                  |
| `Lead`              | `leads`               | unified inbox, `type`/`status` enums, `assigned_to` user |
| `Testimonial`       | `testimonials`        | `partner_logo_media_id`, soft delete                     |
| `FaqCategory`       | `faq_categories`      |                                                          |
| `Faq`               | `faqs`                | `sort_order`, `is_published`                             |
| `AuditLog`          | `audit_logs`          | append-only by convention, `meta` JSONB diff             |
| `AnalyticsSnapshot` | `analytics_snapshots` | nightly aggregate, `date` unique                         |
| `Setting`           | `settings`            | `key` PK, `value` JSONB                                  |

## Enums

| Enum                | Values                                           |
| ------------------- | ------------------------------------------------ |
| `RoleName`          | `super_admin`, `content_editor`, `sales_manager` |
| `CategoryType`      | `spareparts`, `fluids`, `autocare`               |
| `ProductStatus`     | `draft`, `published`                             |
| `ArticleStatus`     | `draft`, `scheduled`, `published`                |
| `LeadType`          | `distributor`, `oem`, `contact`, `career_note`   |
| `LeadStatus`        | `new`, `contacted`, `converted`, `rejected`      |
| `ApplicationStatus` | `new`, `reviewed`, `rejected`, `hired`           |
| `JobStatus`         | `open`, `closed`                                 |
| `SeoEntityType`     | `product`, `article`                             |
| `AuditAction`       | `create`, `update`, `delete`, `publish`, `login` |

## Relationships (summary)

- `roles 1—N users`; `users 1—N audit_logs`; `users 1—N articles` (author); `users 1—N media` (uploader); `users 1—N leads` (`assigned_to`, nullable).
- `categories 1—N products` (top-level) and `categories 1—N products` via `sub_category_id`; `categories self` tree.
- `products 1—N product_images N—1 media`.
- `articles N—1 blog_categories`, `articles N—N tags` via `article_tags`, `articles N—1 media` (featured).
- `seo_meta` polymorphic: 1:1 with product or article (application-enforced).
- `jobs 1—N applications N—1 media` (CV).
- `testimonials N—1 media` (optional partner logo).
- `faq_categories 1—N faqs`.

Cascade/restrict rules (matching §17):

- `category` with existing products: FK `RESTRICT` — must reassign or soft-delete products first.
- `product_images.product_id`: `CASCADE` (images die with the product).
- `product_images.media_id`: `RESTRICT` (cannot orphan shared media).
- `media.uploaded_by`: `SET NULL` (keep assets if user removed).
- `applications.job_id`: `RESTRICT` (jobs are soft-deleted, never hard-deleted while applications exist).

## Indexes (§33)

| Table                                                             | Index                          | Type   |
| ----------------------------------------------------------------- | ------------------------------ | ------ |
| `products`                                                        | `slug`                         | unique |
| `products`                                                        | `category_id`                  | plain  |
| `articles`                                                        | `slug`                         | unique |
| `leads`                                                           | `type`, `status`, `created_at` | plain  |
| `seo_meta`                                                        | `(entity_type, entity_id)`     | plain  |
| `analytics_snapshots`                                             | `date`                         | unique |
| `categories`, `blog_categories`, `tags`, `faq_categories`, `jobs` | `slug`                         | unique |

## Validation Rules (§31, applied in `src/shared/validation`)

| Field               | Rule                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| Email               | RFC 5322-compatible regex, max 255 chars                             |
| Indonesian WhatsApp | Normalize `0`/`62`/`+62` → canonical `+62`; 9–13 digits after prefix |
| Slug                | lowercase, ASCII, hyphen-separated, unique per entity type           |
| Image upload        | jpg/png/webp only, ≤10MB                                             |
| CV upload           | pdf/doc/docx only, ≤5MB                                              |
| Meta title          | recommended ≤60 chars (soft)                                         |
| Meta description    | recommended ≤155 chars (soft)                                        |
| Admin password      | min 10 chars, ≥1 number + 1 letter                                   |
| Message fields      | min length (OEM 20), max 2000, HTML stripped                         |

## Repository Layer

Repositories live under `src/domain/<module>/` (e.g. `products/product.repository.ts`) and wrap the shared `PrismaClient` (`src/infrastructure/database/prisma.ts`). All database access goes through Prisma only (RULES.md).

## Seed Data

`prisma/seed.ts` (run via `prisma db seed`, wired in `prisma.config.ts`) seeds idempotently via `upsert`:

- 3 roles with the full permission map
- 3 top-level product categories + sub-categories
- blog categories, tags
- FAQ categories + FAQs
- open jobs
- published testimonials
- site settings
- demo super admin user (`admin@hucha.id`) — credentials managed by Better Auth in the Phase 1 auth task
- sample published products (with placeholder media + marketplace URLs)
- sample published articles (with tags, authored by the demo admin)
