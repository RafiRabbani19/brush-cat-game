# Brushcat Game Backend

Ini adalah repository backend untuk game **Brushcat**. Backend ini menyediakan RESTful API untuk menangani autentikasi pengguna (register, login, logout), manajemen sesi, pencatatan skor permainan, dan sistem papan peringkat (leaderboard).

---

## 🛠 Tech Stack yang Digunakan

- **Runtime:** [Bun](https://bun.sh/) (Cepat, built-in bundler & test runner)
- **Framework:** [Elysia.js](https://elysiajs.com/) (Web framework yang sangat cepat untuk Bun)
- **Bahasa:** TypeScript
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** MySQL

---

## 📦 Library Utama

- `elysia` - Framework utama.
- `@elysiajs/cors` - Middleware untuk menangani CORS agar bisa diakses dari frontend.
- `@elysiajs/swagger` - Untuk auto-generate dokumentasi API (Swagger UI).
- `drizzle-orm` & `drizzle-kit` - Untuk interaksi database dan migrasi (schema builder).
- `mysql2` - Driver database MySQL.
- `bcryptjs` - Library untuk hashing dan verifikasi password.

---

## 📂 Arsitektur dan Struktur Folder

Aplikasi ini menggunakan struktur folder modular yang memisahkan antara *routing*, *business logic*, dan *database*.

```text
backend/
├── src/
│   ├── index.ts          # Entry point aplikasi (Inisialisasi Elysia, CORS, Swagger)
│   ├── db/
│   │   ├── index.ts      # Konfigurasi koneksi database
│   │   ├── schema.ts     # Definisi skema tabel Drizzle ORM
│   │   └── reset.ts      # Script utilitas database
│   ├── routes/
│   │   └── users-route.ts # Definisi endpoint API (Request, Response, Validasi)
│   └── services/
│       └── users-service.ts # Business logic & interaksi database
├── tests/                # Folder untuk unit test
├── package.json          # List dependencies dan scripts
└── bun.lock              # Lockfile bawaan Bun
```

---

## 🗄️ Skema Database (Schema)

Terdapat 3 tabel utama di dalam database:

1. **`users`** (Tabel Pengguna)
   - `id` (int, PK, auto-increment)
   - `name` (varchar 100, unique, not null) - Username pemain
   - `password` (varchar 255, not null) - Password (di-hash)
   - `createdAt` (timestamp)

2. **`sessions`** (Tabel Sesi Login)
   - `id` (int, PK, auto-increment)
   - `token` (varchar 255, not null) - Token autentikasi
   - `userId` (int, FK ke `users.id`)
   - `createdAt` (timestamp)

3. **`scores`** (Tabel Skor Pemain)
   - `id` (int, PK, auto-increment)
   - `userId` (int, FK ke `users.id`)
   - `score` (int, not null) - Skor yang dicapai
   - `createdAt` (timestamp)

---

## 🌐 Daftar API yang Tersedia

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

*(Catatan: Endpoint yang membutuhkan Auth wajib menyertakan header `Authorization: Bearer <token>`)*

---

## 🚀 Cara Setup Project

1. **Pastikan sudah menginstal [Bun](https://bun.sh/) dan MySQL server**.
2. **Clone/Buka repository ini**, lalu masuk ke folder `backend`.
3. **Install Dependencies:**
   ```bash
   bun install
   ```
4. **Setup Environment Variables:**
   Duplikat file `.env.example` dan ubah namanya menjadi `.env`.
   Sesuaikan konfigurasi URL database MySQL Anda di dalam `.env`:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/nama_database"
   ```
5. **Push Skema ke Database:**
   Perintah ini akan membuat tabel-tabel secara otomatis di database Anda.
   ```bash
   bun run db:push
   ```

---

## 🏃 Cara Menjalankan Aplikasi

Untuk menjalankan server dalam mode pengembangan (development mode dengan auto-reload / watch):

```bash
bun run dev
```

Server secara default akan berjalan di port `3000`. 
Anda bisa memverifikasinya dengan membuka:
- **API Root:** [http://localhost:3000/](http://localhost:3000/)
- **Swagger Docs:** [http://localhost:3000/swagger](http://localhost:3000/swagger)
