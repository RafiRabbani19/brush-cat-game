# Brushcat Game (Grooming Simulator)

Sebuah game non-profit bertema *cute-absurd* tentang merawat seekor kucing. Sisirlah kucingnya dan raih skor tertinggi! Namun hati-hati, jangan membuat kucing tersebut marah dan mencakar Anda. Kumpulkan skor terbaik Anda dan bersainglah dengan pemain lain di Papan Peringkat (Leaderboard).

Proyek ini terdiri dari dua bagian utama:
1. **Frontend:** Aplikasi web berbasis HTML, CSS (Vanilla), dan JavaScript yang dijalankan di sisi client (browser).
2. **Backend:** RESTful API server menggunakan Elysia.js (Bun) dan database MySQL untuk menyimpan data user, sesi login, dan skor leaderboard.

---

## 📂 Struktur Folder Proyek

```text
brushcat/
├── assets/               # Asset gambar/animasi game (.png)
├── backend/              # Sumber kode backend (API, Database, DB Schema)
│   ├── src/              # Logic server
│   ├── tests/            # Folder untuk unit test backend
│   └── package.json      # Dependencies backend
├── game.html             # Tampilan halaman area bermain game
├── index.html            # Halaman utama / landing page & menu utama
├── script.js             # Logic frontend game & integrasi API backend
├── style.css             # Desain & styling (Visual aesthetic scrapbook & paper grain)
└── README.md             # Dokumentasi utama proyek (file ini)
```

---

## 🎨 Frontend (Client Side)

Frontend game ini dibangun dengan gaya estetika *scrapbook*, hand-drawn, dan paper-grain texture menggunakan SVG warp filter.

### Fitur Frontend
- **Landing Page & Modul Autentikasi:** Menu utama game yang berisi instruksi bermain, tombol Mulai Bermain, tombol Login/Sign Up, serta integrasi dengan API backend untuk mendeteksi user aktif.
- **Game Engine:** Simulasi menyikat bulu kucing menggunakan mouse/sentuhan dengan mekanisme timer dan tingkat kemarahan kucing.
- **Responsif:** Tampilan adaptif untuk layar handphone maupun desktop.

### Cara Menjalankan Frontend
1. Cukup buka file `index.html` langsung di browser favorit Anda, atau jalankan menggunakan VS Code Live Server / extension sejenis.
2. Pastikan Server Backend sudah berjalan agar fitur registrasi, login, submit skor, dan leaderboard berfungsi dengan baik.

---

## 🖥️ Backend (API Server & Database)

Backend menangani penyimpanan data user secara persisten, autentikasi berbasis sesi (Token), dan validasi skor.

### Tech Stack Backend
- **Runtime:** [Bun](https://bun.sh/) (Cepat, built-in bundler & test runner)
- **Framework:** [Elysia.js](https://elysiajs.com/) (Web framework yang sangat cepat untuk Bun)
- **Bahasa:** TypeScript
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** MySQL

### Skema Database
1. **`users`** (Tabel Pengguna): Menyimpan username (`name`) dan hashed `password`.
2. **`sessions`** (Tabel Sesi): Menyimpan session token untuk autentikasi API.
3. **`scores`** (Tabel Skor): Menyimpan riwayat pencapaian skor bermain milik user.

### Daftar API yang Tersedia

Dokumentasi lengkap API juga dapat diakses via **Swagger UI** di endpoint `/swagger` saat server berjalan.

| Method | Endpoint | Keterangan | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/` | Root endpoint, healthcheck server | No |
| `POST` | `/api/users/` | Registrasi user baru | No |
| `POST` | `/api/users/login` | Login user, mengembalikan token | No |
| `GET` | `/api/users/current` | Mengambil data user yang sedang login | Yes |
| `DELETE` | `/api/users/logout` | Menghapus sesi user (logout) | Yes |
| `POST` | `/api/users/score` | Submit skor terbaru user | Yes |
| `GET` | `/api/users/leaderboard` | Mengambil data papan peringkat teratas | No |

---

## 🚀 Cara Setup Backend & Database

1. **Pastikan sudah menginstal [Bun](https://bun.sh/) dan MySQL server**.
2. **Masuk ke folder `backend`:**
   ```bash
   cd backend
   ```
3. **Install Dependencies:**
   ```bash
   bun install
   ```
4. **Setup Environment Variables:**
   Salin file `.env.example` menjadi `.env` di dalam folder `backend/`:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/nama_database"
   ```
5. **Push Skema ke Database:**
   Perintah ini akan membuat tabel-tabel secara otomatis di database MySQL Anda:
   ```bash
   bun run db:push
   ```
6. **Jalankan Server Backend:**
   ```bash
   bun run dev
   ```
   Server secara default akan berjalan di port `3000`. 
   Anda bisa memverifikasinya dengan membuka:
   - **API Root:** [http://localhost:3000/](http://localhost:3000/)
   - **Swagger Docs:** [http://localhost:3000/swagger](http://localhost:3000/swagger)
