## Proyek Early Warning System - Panduan Setup Database

Selamat datang di Proyek Early Warning System! Dokumen ini adalah panduan utama bagi tim Backend Developer untuk menyiapkan database PostgreSQL secara lokal.

Karena database yang sudah berisi data tidak dapat disimpan di Git, setiap developer harus membuat ulang database di mesin masing-masing dengan mengikuti langkah-langkah di bawah ini.
Prasyarat

Pastikan perangkat lunak berikut sudah terinstal di komputer Anda:

    PostgreSQL: Server database yang akan kita gunakan.

    pgAdmin4 (Sangat Direkomendasikan): Alat bantu visual untuk mengelola PostgreSQL.

    Python 3: Untuk menjalankan skrip impor data.

    Git: Untuk mengkloning repositori ini.

Langkah-langkah Setup Database

# Langkah 0
--- KONFIGURASI DATABASE di file data_importer.py
Ganti nilai di bawah ini sesuai dengan konfigurasi database PostgreSQL Anda.
    DB_CONFIG = {
        "dbname": "early_warning",
        "user": "postgres",
        "password": "password",
        "host": "localhost",
        "port": "5432"
    }

Proses ini terdiri dari tiga tahap utama: membuat database kosong, membangun strukturnya, dan mengisinya dengan data.
# Tahap 1: Buat Database Kosong

Anda perlu membuat sebuah database kosong bernama early_warning.

Menggunakan pgAdmin4 (Direkomendasikan):

    Buka pgAdmin4.

    Di panel Browser sebelah kiri, klik kanan pada Databases > Create > Database....

    Di kolom Database, ketik early_warning.

    Klik Save.

# Tahap 2: Bangun Struktur Tabel

Setelah database kosong dibuat, kita perlu membuat semua tabel di dalamnya dengan menjalankan skrip SQL yang sudah disediakan.

    Di pgAdmin4, klik pada database early_warning.

    Buka Query Tool (klik ikon petir/kilat).

    Di dalam Query Tool, klik ikon Open File (ikon folder).

    Cari dan buka file final_schema.sql dari folder proyek ini.

    Klik ikon Execute/Run (ikon petir/tombol play) untuk menjalankan seluruh skrip.

    Verifikasi: Setelah selesai, refresh daftar Tables di bawah early_warning > Schemas > public. Anda seharusnya melihat semua tabel proyek (employees, health_records, dll.) telah dibuat.

# Tahap 3: Isi Database dengan Data Awal

Sekarang kita akan menggunakan skrip Python untuk membaca file Excel dan memasukkan datanya ke dalam tabel yang baru saja dibuat.

1. Siapkan Lingkungan Python:

    Buka terminal di folder utama proyek.

    Buat virtual environment:

    python3 -m venv venv

    Aktifkan virtual environment:

        macOS/Linux: source venv/bin/activate

        Windows: venv\Scripts\activate

    Instal semua library yang dibutuhkan:

    pip install -r requirements.txt

2. Konfigurasi Koneksi Database:

    Buka file data_importer.py di editor kode Anda.

    Temukan bagian DB_CONFIG di bagian atas file.

    Ganti nilai "your_password" dengan password PostgreSQL Anda.

    DB_CONFIG = {
        "dbname": "early_warning",
        "user": "postgres",
        "password": "GANTI_DENGAN_PASSWORD_ANDA", # <--- EDIT BARIS INI
        "host": "localhost",
        "port": "5432"
    }

    Simpan file tersebut.

3. Jalankan Skrip Importer:

    Kembali ke terminal Anda (pastikan venv masih aktif).

    Jalankan perintah berikut:

    python data_importer.py

    Skrip akan berjalan dan mencetak status progresnya. Proses ini mungkin memakan waktu beberapa detik.

Tahap 4: Verifikasi Akhir

Setelah skrip selesai, pastikan data sudah benar-benar masuk.

Gunakan pgAdmin4:

    Klik kanan pada tabel employees atau health_records.

    Pilih View/Edit Data > All Rows.

    Anda akan melihat tabel tersebut sudah terisi dengan data dari file Excel.

Gunakan SQL:

    Di Query Tool, jalankan perintah berikut untuk mengecek jumlah baris:

    SELECT COUNT(*) FROM employees;
    SELECT COUNT(*) FROM health_records;

Selesai!

Database Anda sekarang sudah sepenuhnya siap. Aplikasi Flask dapat terhubung dan mulai menggunakan data yang ada di dalamnya.