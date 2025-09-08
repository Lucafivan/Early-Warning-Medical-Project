# Panduan Migrasi Database
Panduan ini menjelaskan cara mengelola dan menerapkan migrasi database untuk proyek ini. Kita menggunakan Flask-Migrate, yang didukung oleh Alembic, untuk memastikan skema database kita tetap sinkron di seluruh tim.

## Persiapan Awal
Pastikan Anda telah menginstal semua dependensi proyek:
```bash
pip install -r requirements.txt
```
Jika Anda belum memiliki file requirements.txt, jalankan perintah berikut:

```bash
pip freeze | Out-File -FilePath requirements.txt -Encoding utf8
```
Pastikan Anda telah membuat database PostgreSQL dengan nama early_warning dan kredensial yang sesuai.

## Alur Kerja Migrasi Harian
Ikuti langkah-langkah ini setiap kali Anda membuat perubahan pada model SQLAlchemy (app/models.py).

### Buat Perubahan pada Model
Ubah file app/models.py dengan menambahkan, menghapus, atau memodifikasi kolom/tabel.

### Buat Skrip Migrasi
Setelah membuat perubahan, jalankan perintah ini untuk membuat skrip migrasi yang akan melacak perubahan tersebut.

```bash
flask db migrate -m "message"
```
Penting: Ganti pesan di atas dengan deskripsi yang jelas dan singkat tentang perubahan yang Anda lakukan.

Perintah ini akan membuat file Python baru di folder migrations/versions/. Buka file tersebut dan tinjau kodenya untuk memastikan Alembic mendeteksi perubahan dengan benar.

### Terapkan Migrasi Anda
Setelah skrip migrasi dibuat, terapkan perubahan ke database lokal Anda.

```bash
flask db upgrade
```
### Bagikan Perubahan
Lakukan commit pada perubahan Anda, termasuk file skrip migrasi yang baru dibuat di folder migrations/.

```bash
git add .
git commit -m "feat(db): message"
git push
```

Jika Menerima Pembaruan dari Tim Lain
Setiap kali Anda melakukan git pull dan mendapatkan pembaruan dari anggota tim lain, Anda mungkin perlu memperbarui skema database lokal Anda.

Cukup jalankan satu perintah ini:

```bash
flask db upgrade
```
Perintah ini akan secara otomatis mendeteksi skrip migrasi baru yang belum diterapkan di database Anda dan menjalankannya secara berurutan.