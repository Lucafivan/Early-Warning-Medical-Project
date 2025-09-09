* Tahap 1: Setup Database PostgreSQL

Bagian ini menjelaskan cara membuat "wadah" kosong untuk data Anda.

    Buat Database Kosong:

        Buka pgAdmin4.

        Di panel kiri, klik kanan pada Databases -> Create -> Database....

        Isi nama database: early_warning.

        Klik Save.

* Tahap 2: Bangun Struktur dan Isi Database

Proses ini menggunakan skrip SQL untuk membangun struktur tabel dan skrip Python untuk mengisi data.

    Bangun Struktur Tabel:

        Buka Query Tool untuk database early_warning yang baru saja Anda buat.

        Salin seluruh isi dari file scheme.sql dan tempelkan ke dalam Query Tool.

        Klik tombol Execute/Run (ikon petir).

        Hasil: Semua tabel (employees, health_records, weather, dll.) akan dibuat secara otomatis di dalam database Anda.

    Isi Semua Data (Seeding):

        Pastikan virtual environment (venv) Anda aktif.

        Buka file data_importer.py dan pastikan konfigurasi DB_CONFIG (terutama password) sudah benar.

        Jalankan skrip dari terminal:

        python data_importer.py

        Hasil: Skrip ini akan membaca hasil_gabungan_final.csv dan secara cerdas mengisi semua tabel dengan data yang relevan. Proses ini mungkin memakan waktu beberapa saat.

* Tahap 3: Menjalankan Monitor Cuaca Terkini (Untuk Prediksi Real-time)

Tahap ini sangat penting untuk fitur early warning. Skrip ini akan mengambil data cuaca dan kualitas udara terkini dan menyimpannya ke database untuk digunakan oleh model prediksi.

    Jalankan Importer Cuaca Terkini:

        Dari terminal (dengan venv aktif), jalankan:

        python weather_importer.py

        Hasil: Skrip ini akan mengambil data terkini untuk semua lokasi kerja dan menyimpannya ke dalam tabel weather dan air_quality. Skrip ini dirancang untuk bisa dijalankan berulang kali (misalnya setiap hari) untuk memperbarui data.

* Tahap 4: Verifikasi dan Langkah Selanjutnya

Database Anda sekarang sudah terisi lengkap dan siap digunakan oleh aplikasi backend.

    Verifikasi Cepat: Untuk memastikan data sudah masuk, jalankan query SQL sederhana ini di Query Tool pgAdmin:

        SELECT COUNT(*) FROM health_records;

    Anda akan melihat jumlah total baris yang berhasil diimpor. Untuk memeriksa data cuaca, jalankan:

        SELECT * FROM weather ORDER BY timestamp DESC LIMIT 5;
