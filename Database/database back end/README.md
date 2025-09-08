# Proyek Early Warning System - Panduan untuk Tim Backend

Dokumen ini adalah panduan teknis bagi Backend Developer untuk menyiapkan dan menjalankan layanan monitoring risiko Penyakit Akibat Kerja (PAK) secara real-time.
1. Tujuan Alur Kerja Backend

Tugas utama alur kerja backend adalah menjalankan skrip realtime_monitor.py secara berkala. Skrip ini akan:

    Mengambil data cuaca dan kualitas udara terkini dari WeatherAPI.com untuk semua lokasi kerja.

    Memasukkan data tersebut ke dalam model machine learning yang sudah dilatih.

    Menyimpan hasil prediksi risiko (Risiko Rendah, Risiko Sedang, Risiko Tinggi) ke dalam tabel risk_predictions di database.

    Data di dalam tabel risk_predictions inilah yang nantinya akan disajikan melalui API ke aplikasi frontend atau dashboard.

2. Panduan Setup Lingkungan

Ikuti langkah-langkah ini untuk menyiapkan lingkungan di mesin lokal Anda.
* Tahap 1: Setup Proyek & Database

    Clone Repositori & Install Dependensi: Pastikan Anda sudah mengunduh proyek, membuat virtual environment (venv), dan menginstal semua library yang dibutuhkan dengan pip install -r requirements.txt.

    Buat Database Kosong:

        Buka pgAdmin4.

        Buat database baru dengan nama early_warning.

    Bangun Struktur Tabel:

        Buka Query Tool untuk database early_warning.

        Salin seluruh isi dari file final_schema.sql dan jalankan. Ini akan membuat semua tabel, termasuk tabel risk_predictions yang penting untuk backend.

    Isi Data Master (Penting): Skrip monitor memerlukan daftar lokasi kerja. Jalankan skrip data_importer.py satu kali untuk mengisi data master seperti work_locations dan employees.

    # Pastikan venv aktif dan DB_CONFIG di skrip sudah benar
    python data_importer.py

* Tahap 2: Konfigurasi dan Menjalankan Monitor Real-time

    Jalankan Skrip Monitor:

        Aktifkan virtual environment Anda (source venv/bin/activate).

        Jalankan skrip dari terminal:

        python realtime_monitor.py
