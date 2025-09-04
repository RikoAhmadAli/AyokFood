# Aplikasi GoFood (Fullstack)

Ini adalah proyek aplikasi kloning GoFood yang dibangun menggunakan Next.js (frontend) dan Node.js/Express (backend).

## Cara Menjalankan Proyek

### Prasyarat
- Node.js
- MySQL

### Pengaturan Backend
1. Masuk ke folder `backend`: `cd backend`
2. Install dependensi: `npm install`
3. Buat file `.env` dan konfigurasikan koneksi database.
4. Jalankan server: `npm start`

### Pengaturan Frontend
1. Masuk ke folder `frontend`: `cd frontend`
2. Install dependensi: `npm install`
3. Buat file `.env.local` dan masukkan `NEXT_PUBLIC_API_URL` dan `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
4. Jalankan aplikasi: `npm run dev`

### Pengaturan Database
1. Buat database baru di MySQL (misal: `db_gofood`).
2. Impor file `db_gofood.sql` ke dalam database tersebut menggunakan phpMyAdmin atau perintah `mysql`.
