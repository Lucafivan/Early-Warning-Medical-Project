# Medical-Early-Warning-Project
This project build at PT Salam Pacific Indonesia Lines, as a team we do this project to make a system that can be use for practical early warning on the field.

## Panduan Setup dan Penggunaan

### Setup Awal
1. Backend (Flask): Lakukan setup seperti biasa. Masuk ke folder `backend` dan jalankan `conda create`, `conda activate`, dan `pip install -r requirements.txt`. Apabila ingin menambahkan package baru, jangan lupa untuk memperbarui `requirements.txt` dengan `pip freeze | Out-File -FilePath requirements.txt -Encoding utf8`.

2. Frontend (React & Vite): Masuk ke folder `frontend` dan jalankan `npm install` untuk menginstal semua dependensi React.

### Jalankan Saat Pengembangan (Development)
Untuk pengembangan sehari-hari, Anda akan menjalankan dua perintah di dua terminal terpisah.

1. Terminal 1 (Backend): Masuk ke folder `backend` dan aktifkan environment Flask Anda. Jalankan server Flask:
    ```
    python run.py
    ```
    Server ini akan berjalan di `http://127.0.0.1:5000` dan akan melayani API Anda.

2. Terminal 2 (Frontend): Masuk ke folder `frontend` dan jalankan development server Vite:
    ```
    npm run dev
    ```
    Server ini akan berjalan di `http://127.0.0.1:5173` (atau port default Vite lainnya). Buka alamat ini untuk melihat aplikasi React Anda.

    Catatan: Dalam mode pengembangan, Anda akan mengakses `http://127.0.0.1:5173` untuk melihat tampilan web Anda, bukan `http://127.0.0.1:5000`. Server Vite akan mengelola seluruh tampilan frontend, dan Anda bisa membuat panggilan API ke server Flask (port 5000) dari kode React Anda.

### Persiapan untuk Produksi (Production)
Saat siap untuk deployment, Anda perlu membuat versi final dari kode frontend yang sudah dioptimasi.

Di folder `frontend`, jalankan:

```
npm run build
```
Penting: Anda harus mengonfigurasi `vite.config.ts` agar hasil kompilasi (biasanya di folder dist) ditempatkan di `../backend/app/static/dist/`. Dengan begitu, Flask dapat menyajikannya sebagai aset statis.

Contoh `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/app/static/dist',
    emptyOutDir: true,
  }
})
```
### Integrasi Final
Setelah Anda menjalankan `npm run build`, Anda bisa memodifikasi `backend/app/templates/index.html` agar me-load aset dari folder `static/dist/`.

```html
<script type="module" src="{{ url_for('static', filename='dist/index.js') }}"></script>
<link rel="stylesheet" href="{{ url_for('static', filename='dist/index.css') }}">
```
Dengan alur kerja ini, Flask dan React bisa bekerja sama dengan efisien, di mana Flask menyediakan data dan React mengelola tampilan dan interaktivitasnya.
