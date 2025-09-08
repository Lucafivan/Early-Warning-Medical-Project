CREATE DATABASE early_warning;

-- ==========================================
-- TABEL MASTER LOKASI KERJA
-- ==========================================
CREATE TABLE work_locations (
    id SERIAL PRIMARY KEY,
    location_name VARCHAR(150) NOT NULL UNIQUE,
    address TEXT,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6)
);

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
-- TABEL MASTER PENYAKIT (DISEASES) - [DIPERBARUI]
-- Kolom kategori dihilangkan sesuai permintaan.
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
-- TABEL KARYAWAN (EMPLOYEES) - [DIPERBARUI]
-- Kolom disesuaikan dengan data yang ada di file Excel.
-- ==========================================
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL, -- Diambil dari kolom 'Name'
    user_id INT REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================
-- TABEL RIWAYAT PENUGASAN KARYAWAN
-- ==========================================
CREATE TABLE employee_assignments (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    work_location_id INT NOT NULL REFERENCES work_locations(id),
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
    disease_id INT REFERENCES diseases(id), -- FK ke tabel diseases
    record_type VARCHAR(50), -- 'MCU', 'Klaim PAK', 'Laporan Gejala'
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
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);