# Proyek Early Warning System: Panduan Database untuk Analisis & Modelling

Tujuan utama dari pipeline data ini adalah untuk menciptakan sebuah dataset yang kaya dan terstruktur dengan menggabungkan tiga sumber informasi utama: Data Karyawan, Riwayat Kesehatan, dan Data Lingkungan Historis.

[Gambar alur data dari sumber ke database terpusat]
* Tahap 1: Setup Database PostgreSQL

Bagian ini menjelaskan cara membuat database lokal yang identik dengan lingkungan produksi.

    Buat Database Kosong:

        Buka pgAdmin4.

        Di panel kiri, klik kanan pada Databases -> Create -> Database....

        Isi nama database: early_warning.

        Klik Save.

    Konfigurasi Koneksi:

        Buka file app.py.

        Ganti nilai 'your_password' dengan password PostgreSQL Anda.

        # app.py
        DB_PASSWORD = os.environ.get('DB_PASSWORD', 'your_password') # <-- EDIT BARIS INI

* Tahap 2: Membangun dan Mengisi Database

Proses ini menggunakan Flask-Migrate untuk membangun struktur dan skrip Python untuk mengisi data.

    Atur Variabel FLASK_APP (di terminal):

        macOS/Linux: export FLASK_APP=app.py

        Windows: set FLASK_APP=app.py

    Bangun Struktur Tabel (Migrasi):

    flask db upgrade

    Hasil: Semua tabel akan dibuat secara otomatis di dalam database early_warning.

    Isi Data Awal (Seeding):

    python data_importer.py

    Hasil: Tabel employees, health_records, diseases, dll., akan terisi dengan data dari file Excel.

* Tahap 3: Memperkaya Data dengan Faktor Lingkungan

Ini adalah langkah krusial yang menciptakan fitur (features) lingkungan untuk model Anda.

    Konfigurasi API Key:

        Buka file history_weather_importer.py.

        Ganti nilai GANTI_DENGAN_API_KEY_ANDA dengan API Key dari WeatherAPI.com. Pastikan juga password database sudah benar.

    Jalankan Importer Cuaca:

    python history_weather_importer.py

    Hasil: Tabel weather dan air_quality akan terisi dengan data cuaca historis yang relevan dengan setiap kasus penyakit.

* Tahap 4: Ekstraksi Data untuk Modelling

Database Anda sekarang siap untuk dianalisis. Berikut adalah contoh-contoh query SQL yang dirancang untuk mengekstrak dataset yang siap digunakan untuk berbagai jenis model.

# Jalankan query ini di Query Tool pgAdmin. Anda bisa mengekspor hasilnya ke CSV langsung dari pgAdmin.
* Query 1: Dataset untuk Model Klasifikasi (Fitur Lengkap per Kasus)

Query ini menciptakan "flat table" yang ideal untuk melatih model klasifikasi (misalnya, memprediksi nama penyakit berdasarkan kondisi). Setiap baris mewakili satu kasus penyakit dengan semua fitur yang relevan.

        -- Mengambil semua fitur relevan untuk setiap record kesehatan
        SELECT
            hr.id AS record_id,
            hr.record_date,
            e.full_name AS nama_karyawan,
            ea.position AS posisi_pekerjaan,
            ea.department AS departemen,
            wl.location_name AS lokasi_kerja,
            wl.city,
            d.disease_name AS nama_penyakit,
            -- Fitur Cuaca
            w.temperature AS suhu,
            w.humidity AS kelembapan,
            w.wind_speed AS kecepatan_angin,
            -- Fitur Kualitas Udara
            aq.pm25,
            aq.pm10,
            aq.co_level,
            aq.aqi
        FROM
            health_records hr
        JOIN employees e ON hr.employee_id = e.id
        JOIN diseases d ON hr.disease_id = d.id
        JOIN employee_assignments ea ON hr.employee_id = ea.employee_id
        JOIN work_locations wl ON ea.work_location_id = wl.id
        LEFT JOIN weather w ON wl.id = w.work_location_id AND hr.record_date = DATE(w.timestamp)
        LEFT JOIN air_quality aq ON wl.id = aq.work_location_id AND hr.record_date = DATE(aq.timestamp)
        WHERE
            -- Memastikan data lingkungan tersedia untuk training set yang berkualitas
            w.temperature IS NOT NULL AND aq.pm25 IS NOT NULL
        ORDER BY
            hr.record_date;

Penggunaan: Ekspor hasil query ini ke CSV. Ini adalah dataset utama Anda untuk melatih model seperti Random Forest, XGBoost, atau Logistic Regression.
Query 2: Dataset untuk Analisis Time Series

* Query ini mengagregasi jumlah kasus penyakit tertentu per hari dan menggabungkannya dengan kondisi cuaca rata-rata di lokasi "panas" (misalnya, Kalianak).

        -- Agregasi jumlah kasus penyakit pernapasan harian di Kalianak beserta data cuaca
        SELECT
            hr.record_date AS tanggal,
            COUNT(hr.id) AS jumlah_kasus_pernapasan,
            AVG(w.temperature) AS suhu_rata_rata,
            AVG(aq.pm25) AS pm25_rata_rata
        FROM
            health_records hr
        JOIN diseases d ON hr.disease_id = d.id
        JOIN employee_assignments ea ON hr.employee_id = ea.employee_id
        JOIN work_locations wl ON ea.work_location_id = wl.id
        LEFT JOIN weather w ON wl.id = w.work_location_id AND hr.record_date = DATE(w.timestamp)
        LEFT JOIN air_quality aq ON wl.id = aq.work_location_id AND hr.record_date = DATE(aq.timestamp)
        WHERE
            wl.location_name = 'Kalianak'
            AND (d.disease_name ILIKE '%PNEUMONIA%' OR d.disease_name ILIKE '%RESPIRATORY%')
        GROUP BY
            hr.record_date
        HAVING
            COUNT(hr.id) > 0
        ORDER BY
            hr.record_date;

Penggunaan: Dataset ini cocok untuk model forecasting seperti ARIMA, Prophet, atau LSTM untuk memprediksi lonjakan kasus penyakit berdasarkan data cuaca historis.
* Query 3: Analisis "Hotspot" (Lokasi & Posisi Paling Berisiko)

Query ini mengidentifikasi kombinasi Lokasi dan Posisi Pekerjaan yang memiliki jumlah kasus terbanyak, dirata-ratakan dengan kondisi lingkungan yang paling buruk.

        -- Mengidentifikasi kombinasi posisi dan lokasi dengan risiko tertinggi
        SELECT
            wl.location_name,
            ea.position,
            COUNT(hr.id) AS total_kasus,
            ROUND(AVG(aq.pm25)::numeric, 2) AS pm25_rata_rata
        FROM
            health_records hr
        JOIN employee_assignments ea ON hr.employee_id = ea.employee_id
        JOIN work_locations wl ON ea.work_location_id = wl.id
        LEFT JOIN air_quality aq ON wl.id = aq.work_location_id AND hr.record_date = DATE(aq.timestamp)
        WHERE aq.pm25 IS NOT NULL
        GROUP BY
            wl.location_name,
            ea.position
        ORDER BY
            total_kasus DESC,
            pm25_rata_rata DESC
        LIMIT 20;

