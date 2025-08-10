# SXDOX Telegram Bot

**SXDOX** adalah sebuah proyek profesional berbasis **Node.js** yang menghadirkan bot Telegram multifungsi untuk kebutuhan edukasi, riset keamanan jaringan, dan automasi pengujian HTTP. Seluruh kode sumber ditulis menggunakan JavaScript murni (full JS) tanpa framework backend tambahan, sehingga mudah dipahami, dikembangkan, dan diintegrasikan dengan berbagai sistem.

---

## ✨ Fitur Profesional

- **Arsitektur Modular:**  
  Setiap fitur utama dipecah dalam command terpisah, mudah untuk dikustomisasi dan dikembangkan lebih lanjut.

- **Logging Otomatis:**  
  Semua aktivitas pengguna dan eksekusi perintah tercatat rapi di file log.

- **Eksekusi Script Eksternal:**  
  Bot dapat menjalankan berbagai script eksternal (misal: hold.js, H2-FURY.js, AQUA.js) untuk simulasi pengujian HTTP/HTTPS.

- **Manajemen Proxy:**  
  Mendukung scraping, validasi, dan penggunaan file proxy secara otomatis.

- **Kontrol Akses:**  
  Hanya user tertentu yang dapat menggunakan fitur utama, sehingga keamanan tetap terjaga.

- **Integrasi Telegram API:**  
  Menggunakan library [Telegraf](https://telegraf.js.org/) untuk komunikasi real-time dengan Telegram.

---

## 🚀 Cara Instalasi & Menjalankan

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd SXDOX
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Token Bot**
   - Edit file `index.js`
   - Masukkan token bot Telegram Anda pada variabel `BOT_TOKEN`

4. **Jalankan Bot**
   ```bash
   node index.js
   ```

---

## 📚 Daftar Perintah

| Perintah | Fungsi |
|----------|--------|
| `/menu` | Menampilkan daftar perintah |
| `/hold <url> <durasi> <rate> <thread> <proxy.txt>` | Menjalankan simulasi hold/attack |
| `/proxy` | Scrape proxy otomatis |
| `/method` | Daftar metode serangan dari `method.json` |
| `/ongoing` | Daftar proses hold terakhir |
| `/myid` | Info akun Telegram Anda |
| `/addplan <id>` | Tambah user ke whitelist (admin) |
| `/stop <url>` | Menghentikan proses hold tertentu |
| `/gethtml <url>` | Mengambil HTML dari URL target |

---

## 🗂️ Struktur Proyek

- `index.js` — Source utama bot Telegram (JavaScript murni)
- `method.json` — Daftar metode serangan
- `proxy.txt` — File proxy yang digunakan
- `logs.txt` — Catatan aktivitas bot
- `scrape.js`, `hold.js`, `H2-FURY.js`, `H2-VERN.js`, `AQUA.js` — Script eksternal untuk simulasi pengujian

---

## ⚠️ Disclaimer

> **Bot ini hanya untuk edukasi dan riset keamanan. Dilarang digunakan untuk aktivitas ilegal atau tanpa izin target. Semua aktivitas terekam otomatis di file log.**

---

## 👨‍💻 Pengembang

Developed By
**Claritiano Samosir**  
Copyright © 2025

---

## 📬 Kontak
