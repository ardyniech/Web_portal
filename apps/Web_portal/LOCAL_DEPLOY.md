# Panduan Pemasangan Lokal - Orchestra Gateway
# Local Deployment Guide for Orchestra Gateway

---

## 🇮🇩 VERSI BAHASA INDONESIA (Mudah Dipahami Pemula)

Orchestra Gateway dirancang untuk dijalankan di server lokal atau komputer pribadi Anda dengan sangat handal. Ikuti langkah-langkah sederhana di bawah ini untuk memasangnya:

### Syarat Sebelum Memulai

1. **Aplikasi Node.js**: Pastikan Anda sudah menginstal aplikasi Node.js (v18 ke atas) di komputer Anda. Ini adalah motor penggerak utama aplikasi ini.
2. **Koneksi Jaringan**: Pastikan port/jalur internet nomor `3000` di komputer Anda tidak diblokir oleh antivirus atau firewall.
3. **Pengatur Alamat**: Sangat direkomendasikan untuk memasang program **PM2** di komputer Anda agar aplikasi dapat otomatis menyala kembali jika komputer mati atau restart.

### Langkah-Langkah Pemasangan

1. **Mengatur Dokumen Kunci (`.env`)**:
   - Salin file bernama `.env.example` lalu ubah namanya menjadi `.env`.
   - Isi kata kunci yang diperlukan atau abaikan jika Anda hanya ingin mencoba aplikasi secara offline.
   - **PENTING**: Jangan pernah menyebarkan isi file `.env` ini kepada siapa pun karena berisi kunci rahasia server Anda.

2. **Menginstal & Mempersiapkan Aplikasi**:
   Jalankan perintah ini di dalam cmd/terminal Anda secara berurutan:
   ```bash
   npm install
   npm run build
   ```

3. **Menyalakan Aplikasi**:
   Jalankan perintah berikut:
   ```bash
   npm start
   ```
   Selamat! Aplikasi sekarang sudah aktif dan dapat dibuka melalui browser Anda di alamat: `http://localhost:3000`

---

## 🇺🇸 ENGLISH VERSION

Orchestra Gateway is a production-ready infrastructure tool. To ensure it runs reliably on your local server, follow these simple steps:

### Prerequisites

1. **Node.js**: Ensure Node.js (v18+) is installed on your server.
2. **Container/Environment**: The application is optimized for containerized environments (Docker/Podman recommended but works native).
3. **Port Access**: Ensure port `3000` is open and accessible through your network firewall (e.g., UFW or cloud security groups).

### Deployment Steps

1. **Environment Variables**:
   - Copy `.env.example` to `.env`.
   - Set your production environment variables (API keys, etc.) in `.env`.
   - **DO NOT COMMIT** your `.env` file to version control.

2. **Build**:
   ```bash
   npm install
   npm run build
   ```

3. **Run**:
   ```bash
   npm start
   ```
   Orchestra Gateway will now be accessible at `http://localhost:3000`.

### Infrastructure Recommendations

- **Process Manager**: It is highly recommended to run the application using **PM2** to ensure it stays running after restarts:
  ```bash
  pm2 start npm --name "orchestra-gateway" -- run start
  ```
- **Reverse Proxy**: Place Orchestra Gateway behind a production Nginx or Caddy reverse proxy to handle SSL/TLS termination automatically.
