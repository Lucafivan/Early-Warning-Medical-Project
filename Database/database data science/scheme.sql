-- ==========================================
-- Skrip SQL untuk Membuat Semua Tabel
-- Jalankan skrip ini di database 'early_warning' yang kosong.
-- ==========================================

-- Hapus perintah CREATE DATABASE jika Anda menjalankan ini di Query Tool
-- terhadap database yang sudah ada untuk menghindari error.
-- CREATE DATABASE early_warning;

-- ==========================================
-- TABEL MASTER LOKASI KERJA
-- ==========================================
CREATE TABLE work_locations (
    id SERIAL PRIMARY KEY,
    location_name VARCHAR(150) NOT NULL UNIQUE,
    city VARCHAR(100),          -- Nama kota untuk query API
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6)
);

-- Memasukkan data lokasi awal
INSERT INTO work_locations (location_name, city, latitude, longitude) VALUES
('Kantor Pusat', 'Surabaya', -7.2371678363250735, 112.73933699269045),
('Perak Barat', 'Surabaya', -7.231449273619633, 112.72828546626496),
('Kalianak', 'Surabaya', -7.230964164937335, 112.7058541276304),
('Cabang Jakarta', 'Jakarta', -6.110445734514671, 106.8920855806901),
('Cabang Balikpapan', 'Balikpapan', -1.2753420746274544, 116.8187722896864),
('Cabang Sampit', 'Sampit', -2.5529751355733588, 112.94999966042496),
('Cabang Banjarmasin', 'Banjarmasin', -3.321447748621868, 114.58010402393569),
-- Tambahkan lokasi dari file excel jika belum ada
('LCE Surabaya', 'Surabaya', null, null);


-- ==========================================
-- TABEL MASTER POTENSI BAHAYA (HAZARDS)
-- ==========================================
CREATE TABLE hazards (
    id SERIAL PRIMARY KEY,
    hazard_name VARCHAR(150) NOT NULL,
    hazard_type VARCHAR(50), -- e.g., 'Kimia', 'Fisik', 'Ergonomi'
    description TEXT,
    exposure_limit NUMERIC
);

-- ==========================================
-- TABEL MASTER PENYAKIT (DISEASES)
-- ==========================================
CREATE TABLE diseases (
    id SERIAL PRIMARY KEY,
    disease_name VARCHAR(255) NOT NULL UNIQUE
);

-- ==========================================
-- TABEL USERS
-- ==========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABEL KARYAWAN (EMPLOYEES)
-- ==========================================
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL
);
ALTER TABLE employees ADD CONSTRAINT employees_full_name_unique UNIQUE (full_name);


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
    level VARCHAR(50)
);

-- ==========================================
-- TABEL DATA KESEHATAN (Riwayat PAK, dll)
-- ==========================================
CREATE TABLE health_records (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    disease_id INT REFERENCES diseases(id),
    record_type VARCHAR(50),
    record_date DATE,
    claims_id BIGINT,
    provider_name VARCHAR(255),
    due_total NUMERIC,
    approve NUMERIC,
    member_pay NUMERIC,
    excess_paid NUMERIC,
    excess_not_paid NUMERIC,
    claim_status VARCHAR(50),
    coverage_id VARCHAR(20)
);

-- ==========================================
-- TABEL CUACA
-- ==========================================
CREATE TABLE weather (
    id SERIAL PRIMARY KEY,
    work_location_id INT NOT NULL REFERENCES work_locations(id),
    temperature FLOAT,
    humidity FLOAT,
    wind_speed FLOAT,
    timestamp DATE NOT NULL
);

-- ==========================================
-- TABEL KUALITAS UDARA
-- ==========================================
CREATE TABLE air_quality (
    id SERIAL PRIMARY KEY,
    work_location_id INT NOT NULL REFERENCES work_locations(id),
    aqi FLOAT,
    pm25 FLOAT,
    pm10 FLOAT,
    co_level FLOAT,
    timestamp DATE NOT NULL
);

-- Tambahkan constraint UNIQUE untuk mencegah data duplikat per hari per lokasi
ALTER TABLE weather ADD CONSTRAINT weather_location_date_unique UNIQUE (work_location_id, timestamp);
ALTER TABLE air_quality ADD CONSTRAINT air_quality_location_date_unique UNIQUE (work_location_id, timestamp);

