# Orchestra Gateway - Kendali Dinamis & Infrastruktur Jaringan Gateway

[English Version Below]

Orchestra Gateway adalah dasbor pengelolaan infrastruktur dan halaman tampilan utama (landing page) berkinerja tinggi yang dirancang sangat mudah dipahami. Sistem ini berfungsi sebagai pusat kendali untuk mengelola layanan jaringan rute komputer, pengarah lalu lintas (reverse proxy Nginx/Caddy), sinkronisasi nama web dinamis (DDNS), serta pemantauan status server.

---

## 🇮🇩 VERSI BAHASA INDONESIA (Panduan Pemula)

### 🚀 Fitur Utama Yang Luar Biasa

- **Pemantau Jaringan Interaktif (Gateway Monitor)**: Tampilan utama yang ramah pemula untuk melihat status kesehatan server dan melakukan simulasi perjalanan data (trace packet) secara langsung hanya dengan sekali klik.
- **Pengatur Rute Web Praktis (Nginx/Caddy VirtualHosts)**: Mengatur aliran masuk kunjungan web dari internet ke server lokal Anda secara otomatis dan teratur.
- **Sistem Nama Domain Otomatis (DDNS Synchronizer)**: Secara berkala mencocokkan alamat IP jaringan rumah/kantor Anda ke penyedia nama domain seperti Cloudflare, DuckDNS, atau No-IP agar website Anda selalu bisa diakses meskipun IP berubah.
- **Pintu Terowongan Port (Port Ingress Forwarding)**: Membuka pintu rute khusus agar data luar (seperti webhook GitHub) dapat masuk dan langsung diuji oleh pengembang dengan respons waktu yang cepat.
- **Uji Coba Pintar (Trace Sandbox)**: Mengetahui seberapa cepat sistem merespons (Ping). Dilengkapi grafik keren untuk memantau jika ada gangguan koneksi lambat.
- **Dukungan Dua Bahasa**: Dapat berpindah bahasa dengan mudah antara Bahasa Indonesia dan Bahasa Inggris menggunakan tombol di sudut kanan atas panel admin.

### 🛠️ Cara Mulai Menggunakan (Sangat Mudah)

1. **Persiapan**: Pastikan Anda sudah mengunduh dan menginstal **Node.js** (versi 18 ke atas) di komputer Anda.
2. **Pasang Bahan-Bahan**: Buka terminal/cmd Anda pada folder ini lalu jalankan perintah:
   ```bash
   npm install
   ```
3. **Mulai Jalankan (Mode Pengembangan)**: 
   ```bash
   npm run dev
   ```
   Sekarang Anda bisa membuka aplikasi ini melalui browser di alamat: `http://localhost:3000`

4. **Siap Pakai untuk Publik (Build)**:
   ```bash
   npm run build
   ```
   Setelah selesai mendesain atau mengonfigurasi, jalankan perintah di bawah ini untuk memulai sistem utama:
   ```bash
   npm start
   ```

---

## 🇺🇸 ENGLISH VERSION

Orchestra Gateway is a high-performance, professional-grade infrastructure management dashboard and landing page. It serves as a unified control center for managing network services, reverse proxies, DDNS synchronization, and service monitoring.

### 🚀 Key Features

- **Advanced Gateway Mesh**: A professional landing page with integrated status monitoring and interactive trace sandboxes.
- **Dynamic VHost Management**: Real-time configuration and generation of Nginx virtual host templates for multi-node upstream target groups.
- **Caddy Proxy Telemetry**: Real-time monitoring of Caddy sites with load statistics.
- **System Resource Monitoring**: Dashboard for monitoring CPU, RAM, and Disk space.
- **Deployment Pre-flight**: Integrated checklist and validator for local environment preparation.
- **DDNS Synchronizer**: Built-in DDNS resolver that synchronizes dynamically updated home server WAN addresses into Cloudflare, DuckDNS, or No-IP zones.
- **Port Ingress Forwarding**: Manage and expose port mappings with built-in webhook receiver inspection for tools like GitHub or custom deployment pipelines.
- **Interactive Trace Sandbox**: Real-time network latency simulation with min/max/average statistics and high-latency alerts.
- **Multilingual Support**: Fully localized interface supporting English and Indonesian.

### 🛠️ Quick Start & Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```
4. **Start Production Server**:
   ```bash
   npm start
   ```

---
*Dikembangkan oleh / Crafted by Ardy Syafii*
