# Cinelog Web App (Nuxt 3)

Web Application untuk melacak film & serial TV Cinelog, dibangun menggunakan **Nuxt 3**, **Vue 3 Composition API**, **Pinia**, dan **Vanilla Glassmorphism CSS**.

---

## Prasyarat
- **Node.js**: v18.x / v20.x / v24.x
- **NPM**: v9+

---

## Konfigurasi Environment (`.env`)
Salin `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel API Base URL:
```env
# Untuk Lokal Development:
NUXT_PUBLIC_API_BASE=http://localhost:3000

# Untuk Produksi VPS (contoh):
# NUXT_PUBLIC_API_BASE=https://api.domainkamu.com
```

---

## Jalankan di Lokal (Development)
```bash
# 1. Install dependensi
npm install

# 2. Jalankan Server Dev
npm run dev
```
Buka `http://localhost:3000` di browser.

---

## Deployment Produksi (VPS)

### 1. Build Production Bundle
```bash
NUXT_TELEMETRY_DISABLED=1 npm run build
```
Hasil build akan berada di folder `.output/`.

### 2. Jalankan Node Server di Produksi
Kamu bisa menjalankan server produksi menggunakan **PM2**:
```bash
# Install PM2 jika belum ada
npm install -g pm2

# Jalankan server Nuxt Nitro
NUXT_PUBLIC_API_BASE=https://api.domainkamu.com PORT=3000 pm2 start .output/server/index.mjs --name "cinelog-web"
```

### 3. Nginx Reverse Proxy Config (Opsional)
Jika menggunakan Nginx di VPS:
```nginx
server {
    listen 80;
    server_name domainkamu.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
