# DEPLOY HUCHA INDONESIA KE DOMAINESIA (cPanel)

Panduan deployment Next.js via **Setup Node.js App** (Phusion Passenger) di Cloud Hosting DomaiNesia. Tidak pakai Docker.

## A. Persiapan cPanel

1. Login cPanel.
2. **PostgreSQL Databases**:
   - Buat database (mis. `cpanel_user_hucha`).
   - Buat user (`cpanel_user_hucha`) + password kuat.
   - Grant all privileges ke database.
   - Catat: `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST` (biasanya `localhost`).
3. **SSL/TLS** (sudah aktif di hosting) — pastikan domain pakai HTTPS.

## B. Buat Node.js App

Menu **Setup Node.js App → Create Application**:
- **Node.js version**: pilih **20 LTS** atau **22 LTS** (project butuh `>=20`).
- **Application mode**: `Production`.
- **Application root**: `hucha-indonesia` (folder project).
- **Application URL**: domain utama perusahaan.
- **Application startup file**: `app.js`.
- Klik **Create**.

Passenger akan menjalankan `app.js` dan menyetel `PORT` + reverse-proxy ke domain.

## C. Upload / Clone project

Via **SSH** (disarankan) atau **File Manager**:

```bash
cd ~
git clone <repo-url> hucha-indonesia
# atau upload zip lalu ekstrak ke ~/hucha-indonesia
cd hucha-indonesia
```

## D. Install dependencies

```bash
cd ~/hucha-indonesia
npm install
```

> cPanel Node.js App biasanya sudah jalan `npm install` otomatis saat deploy.
> Kalau build OOM di shared hosting, build di lokal lalu upload folder `.next` + `node_modules`.

## E. Configure environment

Buat/edit file `.env` di root project (jangan commit!):

```env
NODE_ENV=production
APP_ENV=production
APP_URL=https://DOMAIN_PERUSAHAAN
BETTER_AUTH_URL=https://DOMAIN_PERUSAHAAN
BETTER_AUTH_SECRET=<openssl rand -base64 32>
DATABASE_URL=postgresql://DB_USER:DB_PASS@localhost:5432/DB_NAME?schema=public
STORAGE_DRIVER=local
WHATSAPP_ADMIN_NUMBER=+628xxxx
```

Atau set variable lewat UI **Setup Node.js App → Environment Variables** (lebih disarankan, tidak tersimpan di file).

## F. Prisma generate

```bash
npx prisma generate
```

## G. Prisma migrate deploy (JANGAN pakai migrate dev)

```bash
npx prisma migrate deploy
```

## H. Seed admin (HANYA SEKALI, bila perlu)

```bash
ADMIN_SEED_PASSWORD='<password-kuat-min-10>' npx prisma db seed
```

## I. Build

```bash
npm run build
```

## J. Start / Restart Node.js App

Kembali ke cPanel **Setup Node.js App**, klik **Restart** pada aplikasi.
`app.js` menjalankan Next.js production lewat programmatic API (bukan Express, bukan standalone) dan listen di `PORT` dari Passenger.

## K. Permission uploads

Storage lokal tulis ke `public/uploads` (persistent di filesystem cPanel):

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

Folder ini sudah di-`.gitignore` supaya upload user tidak ke-commit.

## L. SSL & Domain

- Hosting sudah sediakan SSL; pastikan **Force HTTPS** aktif.
- `APP_URL` & `BETTER_AUTH_URL` harus `https://DOMAIN_PERUSAHAAN` persis.
- Cookie Better Auth otomatis `secure` karena baseURL HTTPS.

## M. Smoke test

1. Buka `https://DOMAIN_PERUSAHAAN` → halaman utama 200.
2. Upload gambar di admin → file muncul di `public/uploads` & bisa diakses browser.
3. Login admin `/admin/login` → redirect ke `/admin`.
4. Cek `npx prisma migrate status` = up to date.

## N. Troubleshooting

- **App tidak start**: cek `stderr.log` di root project / menu Logs Node.js App.
- **500 / module not found**: pastikan `npm install` & `npx prisma generate` sukses; `node_modules` ada di root.
- **Upload 404**: pastikan `STORAGE_DRIVER=local` dan `public/uploads` ada + readable.
- **Login gagal/cookie**: pastikan `BETTER_AUTH_URL` == domain HTTPS persis, dan `BETTER_AUTH_SECRET` >= 32 char.
- **DB connection error**: cek `DATABASE_URL` host `localhost`, user/db/pass benar, db sudah di-create di cPanel.

---
Hucha Indonesia — production-ready untuk cPanel/DomaiNesia.
