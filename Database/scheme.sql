-- ===================================================================
-- Skrip SQL Final untuk Proyek Early Warning System
-- Didesain untuk diisi dari file hasil_gabungan_final.csv
-- ===================================================================

-- Menghapus tabel lama jika ada untuk memastikan setup yang bersih
DROP TABLE IF EXISTS risk_predictions CASCADE;
DROP TABLE IF EXISTS air_quality CASCADE;
DROP TABLE IF EXISTS weather CASCADE;
DROP TABLE IF EXISTS health_records CASCADE;
DROP TABLE IF EXISTS employee_assignments CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS diseases CASCADE;
DROP TABLE IF EXISTS hazards CASCADE;
DROP TABLE IF EXISTS work_locations CASCADE;

-- ==========================================
-- TABEL MASTER LOKASI KERJA
-- ==========================================
CREATE TABLE work_locations (
    id SERIAL PRIMARY KEY,
    location_name VARCHAR(150) NOT NULL UNIQUE,
    latitude DECIMAL(18, 14),
    longitude DECIMAL(18, 14)
);

-- ==========================================
-- TABEL MASTER PENYAKIT (DISEASES)
-- ==========================================
CREATE TABLE diseases (
    id SERIAL PRIMARY KEY,
    disease_name VARCHAR(255) NOT NULL UNIQUE
);

-- ==========================================
-- TABEL KARYAWAN (EMPLOYEES)
-- ==========================================
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL UNIQUE
);

-- ==========================================
-- TABEL RIWAYAT PENUGASAN KARYAWAN
-- ==========================================
CREATE TABLE employee_assignments (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    work_location_id INT REFERENCES work_locations(id),
    department VARCHAR(100),
    division VARCHAR(100),
    position VARCHAR(100),
    level VARCHAR(50),
    -- Mencegah entri duplikat untuk penugasan yang sama
    CONSTRAINT unique_assignment UNIQUE (employee_id, work_location_id, position, department, division)
);

-- ==========================================
-- TABEL CUACA HARIAN
-- ==========================================
CREATE TABLE weather (
    id SERIAL PRIMARY KEY,
    work_location_id INT NOT NULL REFERENCES work_locations(id),
    timestamp DATE NOT NULL,
    min_temp FLOAT,
    max_temp FLOAT,
    avg_temp FLOAT,
    weather_condition VARCHAR(100),
    -- Mencegah data cuaca duplikat untuk hari dan lokasi yang sama
    CONSTRAINT weather_location_date_unique UNIQUE (work_location_id, timestamp)
);

-- ==========================================
-- TABEL KUALITAS UDARA HARIAN
-- ==========================================
CREATE TABLE air_quality (
    id SERIAL PRIMARY KEY,
    work_location_id INT NOT NULL REFERENCES work_locations(id),
    timestamp DATE NOT NULL,
    air_quality_index INT,
    -- Mencegah data AQI duplikat untuk hari dan lokasi yang sama
    CONSTRAINT air_quality_location_date_unique UNIQUE (work_location_id, timestamp)
);

-- ==========================================
-- TABEL DATA KESEHATAN (FAKTA UTAMA)
-- ==========================================
CREATE TABLE health_records (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    disease_id INT REFERENCES diseases(id),
    admission_date TIMESTAMP,
    dischargeable_date TIMESTAMP,
    claims_id BIGINT UNIQUE,
    provider_name VARCHAR(255),
    status VARCHAR(100),
    -- Kolom baru dari file gabungan
    duration_stay_days INT,
    daily_cases INT,
    high_risk INT -- 1 untuk True, 0 untuk False
);

-- ==========================================
-- TABEL UNTUK PREDIKSI BACKEND
-- ==========================================
CREATE TABLE risk_predictions (
    id SERIAL PRIMARY KEY,
    work_location_id INT NOT NULL REFERENCES work_locations(id),
    prediction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    predicted_risk_level VARCHAR(50),
    input_features JSONB -- Menyimpan fitur cuaca yang digunakan untuk prediksi
);

