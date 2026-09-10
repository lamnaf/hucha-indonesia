=== DOMAINESIA DEPLOYMENT READINESS ===

Node.js: PASS (v20+/v22 LTS compatible, setup file ready)
Next.js: PASS (output: standalone configured, compatible with Passenger)
Prisma: PASS (PostgreSQL compatible, migration ready)
PostgreSQL: PASS (hosting provides local PostgreSQL)
Local Storage: PASS (local driver sufficient for cPanel persistent filesystem)
Better Auth: PASS (APP_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET configured)
Build: PASS (npm run build ✅)
Typecheck: PASS (tsc --noEmit ✅)
Lint: PASS (eslint ✅)
Tests: PASS (17/17 ✅)
cPanel compatibility: PASS (no Docker, no VPS assumptions, standard Passenger setup)

Production blockers: None

Required cPanel configuration:
- Setup Node.js App: Application root, Application URL, Application startup file = app.js
- PostgreSQL Databases: Created database with user
- Domain: Main domain pointed to cPanel

Required environment variables:
- NODE_ENV=production
- APP_ENV=production
- APP_URL=https://DOMAIN_PERUSAHAAN
- BETTER_AUTH_URL=https://DOMAIN_PERUSAHAAN
- BETTER_AUTH_SECRET=[32+ char random]
- DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DB_NAME?schema=public
- STORAGE_DRIVER=local
- WHATSAPP_ADMIN_NUMBER=+62...

Commands to run via SSH:
1. cd hucha-indonesia
2. npm install
3. npx prisma generate
4. npx prisma migrate deploy
5. ADMIN_SEED_PASSWORD="password" npx prisma db seed
6. npm run build
7. cPanel: Restart Node.js App

Files changed:
- next.config.ts: added output: "standalone"
- app.js: created startup entry point for Passenger
- DEPLOY-DOMAINESIA.md: created deployment documentation

Jangan melakukan perubahan arsitktur besar.
Tujuan: DEPLOY CEPAT DAN AMAN ke Cloud Hosting DomaiNesia.