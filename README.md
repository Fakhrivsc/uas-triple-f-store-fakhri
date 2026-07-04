# 🥩 Triple-F Store

**Triple-F Store** adalah aplikasi e-commerce daging sapi premium berbasis web yang dibangun dengan React.js (frontend) dan Node.js/Express (backend).

---

## Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS
- Redux Toolkit
- React Router v6
- Axios
- Recharts
- react-hot-toast
- lucide-react

**Backend:**
- Node.js + Express.js
- MySQL + Sequelize ORM
- JWT Authentication
- Multer (file upload)
- Helmet, CORS, express-rate-limit

---

## Prasyarat

- Node.js >= 18.x
- MySQL >= 8.x
- npm >= 9.x

---

## Cara Menjalankan Lokal

### 1. Clone & Install Dependencies

```bash
# Install semua dependencies (root + server + client)
npm run install:all
```

### 2. Setup Database

Buat database MySQL:
```sql
CREATE DATABASE triple_f_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Konfigurasi Environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env sesuai konfigurasi database Anda

# Client
cp client/.env.example client/.env
```

Edit `server/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=triple_f_store
DB_USER=root
DB_PASS=your_password
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5000
UPLOAD_DIR=uploads
```

### 4. Jalankan Migrasi & Seeder

```bash
# Jalankan migrasi (buat tabel)
npm run migrate

# Jalankan seeder (isi data awal)
npm run seed
```

### 5. Jalankan Aplikasi

```bash
# Jalankan server dan client bersamaan
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api/v1

---

## Akun Default

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@triplef.com | Admin123! |
| Customer | budi.santoso@gmail.com | Customer123! |
| Customer | siti.rahayu@gmail.com | Customer123! |
| Customer | ahmad.fauzi@gmail.com | Customer123! |

---

## Fitur Utama

### Storefront
- 🏠 Halaman beranda dengan hero banner, kategori, dan produk unggulan
- 🛍️ Katalog produk dengan filter, pencarian, dan pagination
- 📦 Detail produk dengan galeri gambar, ulasan, dan produk terkait
- 🛒 Keranjang belanja (persistent untuk user login, localStorage untuk guest)
- 💳 Checkout multi-step (alamat → pengiriman → pembayaran → konfirmasi)
- 📋 Manajemen pesanan dan tracking pengiriman
- 💝 Wishlist produk
- 👤 Profil pengguna dan manajemen alamat

### Admin Panel
- 📊 Dashboard dengan statistik, grafik pendapatan, dan produk terlaris
- 📦 CRUD produk dengan upload gambar multiple
- 🏷️ CRUD kategori
- 📋 Manajemen pesanan dan update status
- 💰 Konfirmasi/tolak pembayaran
- 👥 Manajemen pengguna
- ⭐ Moderasi ulasan
- ⚙️ Pengaturan toko

---

## Struktur Folder

```
triple-f-store/
├── client/                 # React frontend
│   └── src/
│       ├── api/            # Axios API calls
│       ├── components/     # Reusable components
│       ├── hooks/          # Custom hooks
│       ├── pages/          # Page components
│       ├── store/          # Redux store
│       └── utils/          # Helper functions
├── server/                 # Express backend
│   └── src/
│       ├── config/         # Database config
│       ├── controllers/    # Route controllers
│       ├── middleware/      # Auth, upload, validate
│       ├── migrations/     # DB migrations
│       ├── models/         # Sequelize models
│       ├── routes/         # Express routes
│       ├── seeders/        # DB seeders
│       └── utils/          # Helper functions
└── package.json            # Root package.json
```

---

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /auth/register | Registrasi |
| POST | /auth/login | Login |
| POST | /auth/logout | Logout |
| POST | /auth/refresh | Refresh token |
| GET | /products | Daftar produk |
| GET | /products/:slug | Detail produk |
| GET | /categories | Daftar kategori |
| GET | /cart | Keranjang |
| POST | /orders | Buat pesanan |
| GET | /orders/mine | Pesanan saya |
| ... | ... | ... |

Lihat dokumentasi lengkap di source code routes.
