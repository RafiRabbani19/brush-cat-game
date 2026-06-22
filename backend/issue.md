# Perencanaan Unit Test API Backend

Issue ini ditujukan untuk implementasi unit test pada semua API endpoint yang tersedia. Implementasi dapat dilakukan oleh junior programmer atau asisten AI.

## Instruksi Umum
- Gunakan framework testing bawaan **`bun test`**.
- Simpan semua file unit test di dalam folder **`tests/`**.
- **Wajib (Konsistensi Data):** Pada setiap skenario test, bersihkan/hapus data terkait di database terlebih dahulu (misalnya menggunakan fungsi reset table di `beforeEach` atau skenario spesifik) agar test tetap konsisten dan independen.
- Silakan implementasikan detail kodenya secara lengkap berdasarkan daftar skenario di bawah ini.

## Daftar Skenario Test per API

### 1. `POST /api/users/` (Registrasi User Baru)
- **Registrasi Sukses:** Mengirim data `name` dan `password` yang valid. Ekspektasi: status 201 Created.
- **Registrasi Gagal (Username Sudah Ada):** Mengirim username yang sudah terdaftar sebelumnya. Ekspektasi: status 400 Bad Request ("Username sudah terdaftar").
- **Registrasi Gagal (Validasi Data):** 
  - `name` terlalu pendek atau mengandung karakter spesial yang tidak diizinkan.
  - `password` terlalu pendek.
  - Ekspektasi: ValidationError / status error dari Elysia.

### 2. `POST /api/users/login` (Login User)
- **Login Sukses:** Mengirim `name` dan `password` yang cocok. Ekspektasi: status 200 OK dan mengembalikan token beserta data user.
- **Login Gagal (Kredensial Salah):** Mengirim kombinasi `name` dan `password` yang salah. Ekspektasi: status 400 Bad Request ("Username atau password salah").
- **Login Gagal (Validasi Data):** Mengirim payload yang tidak sesuai skema (misal tanpa password).
- **Rate Limiter Aktif:** Mencoba login gagal berulang kali (>= 5 kali) dari IP yang sama. Ekspektasi: Pada percobaan ke-6 menerima status 429 Too Many Requests (Lock 15 menit).

### 3. `GET /api/users/current` (Ambil Data User Saat Ini)
- **Akses Sukses:** Menyertakan header `Authorization: Bearer <token>` yang valid hasil dari login. Ekspektasi: status 200 OK dengan detail data id, name, bestScore, dan rank.
- **Akses Ditolak (Tanpa Token):** Tidak menyertakan header Authorization. Ekspektasi: status 401 Unauthorized.
- **Akses Ditolak (Token Invalid):** Menyertakan format token yang salah atau token sudah dihapus/logout. Ekspektasi: status 401 Unauthorized.

### 4. `POST /api/users/score` (Submit Skor Bermain)
- **Submit Skor Sukses:** Menyertakan token yang valid dan payload `score` bertipe number. Ekspektasi: status 200 OK.
- **Submit Skor Gagal (Validasi Payload):** Menyertakan payload tanpa properti `score` atau tipe datanya bukan angka.
- **Submit Skor Ditolak (Unauthorized):** Mengirim request tanpa token valid. Ekspektasi: status 401 Unauthorized.

### 5. `GET /api/users/leaderboard` (Melihat Papan Peringkat)
- **Mengambil Leaderboard Sukses:** Melakukan request ke endpoint. Ekspektasi: status 200 OK dan mengembalikan array object berisi `name` dan `bestScore`.
- **Leaderboard Saat Data Kosong:** Memastikan endpoint tidak crash saat tidak ada satupun skor di database (mengembalikan array kosong).

### 6. `DELETE /api/users/logout` (Logout)
- **Logout Sukses:** Menyertakan token valid, melakukan proses logout agar sesi tersebut terhapus/invalid. Ekspektasi: status 200 OK.
- **Logout Gagal (Unauthorized):** Request dilakukan dengan tanpa token atau token sudah logout sebelumnya. Ekspektasi: status 401 Unauthorized.

### 7. Root Endpoint `GET /`
- **Cek Status Server:** Melakukan request ke root url `/`. Ekspektasi: status 200 OK mengembalikan pesan "Brushcat Game API Server is running!".
