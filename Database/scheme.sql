-- ==========================================
-- Skrip SQL untuk Membuat Semua Tabel
-- Versi ini mendukung multi-role (user, admin, super admin)
-- dan integrasi bahaya (hazards) untuk sistem early warning.
-- ==========================================

-- Menghapus tabel lama jika ada untuk memastikan setup yang bersih
DROP TABLE IF EXISTS location_hazards CASCADE;
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
-- TABEL MASTER: Lokasi Kerja
-- ==========================================
CREATE TABLE work_locations (
    id SERIAL PRIMARY KEY,
    location_name VARCHAR(150) NOT NULL UNIQUE,
    latitude DECIMAL(18, 15),
    longitude DECIMAL(18, 15)
);

-- ==========================================
-- TABEL MASTER: Penyakit
-- ==========================================
CREATE TABLE diseases (
    id SERIAL PRIMARY KEY,
    disease_name VARCHAR(255) NOT NULL UNIQUE
);

-- ==========================================
-- TABEL MASTER: Karyawan
-- ==========================================
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL UNIQUE
);

-- ==========================================
-- TABEL MASTER: Potensi Bahaya (Hazards)
-- ==========================================
CREATE TABLE hazards (
    id SERIAL PRIMARY KEY,
    hazard_name VARCHAR(150) NOT NULL UNIQUE,
    hazard_type VARCHAR(50), -- Contoh: 'Kimia', 'Fisik', 'Ergonomi'
    description TEXT
);

-- ==========================================
-- TABEL PENGGUNA (USERS) - [DIPERBARUI]
-- ==========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE,
    -- Role bisa berupa: 'user', 'admin', atau 'super admin'
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABEL TRANSAKSIONAL: Penugasan Karyawan
-- ==========================================
CREATE TABLE employee_assignments (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    work_location_id INT REFERENCES work_locations(id),
    department VARCHAR(100),
    division VARCHAR(100),
    position VARCHAR(100),
    level VARCHAR(50),
    -- Constraint untuk mencegah duplikasi penugasan yang sama persis
    UNIQUE(employee_id, work_location_id, department, division, position, level)
);

-- ==========================================
-- TABEL TRANSAKSIONAL: Riwayat Kesehatan
-- ==========================================
CREATE TABLE health_records (
    id SERIAL PRIMARY KEY,
    claims_id BIGINT UNIQUE,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    disease_id INT REFERENCES diseases(id),
    admission_date TIMESTAMP,
    dischargeable_date TIMESTAMP,
    provider_name VARCHAR(255),
    due_total NUMERIC,
    approve NUMERIC,
    member_pay NUMERIC,
    status VARCHAR(50),
    duration_stay INT,
    daily_cases INT,
    high_risk INT
);

-- ==========================================
-- TABEL TRANSAKSIONAL: Cuaca
-- ==========================================
CREATE TABLE weather (
    id SERIAL PRIMARY KEY,
    work_location_id INT NOT NULL REFERENCES work_locations(id),
    timestamp DATE NOT NULL,
    min_temp FLOAT,
    max_temp FLOAT,
    avg_temp FLOAT,
    weather_condition VARCHAR(100),
    UNIQUE(work_location_id, timestamp)
);

-- ==========================================
-- TABEL TRANSAKSIONAL: Kualitas Udara
-- ==========================================
CREATE TABLE air_quality (
    id SERIAL PRIMARY KEY,
    work_location_id INT NOT NULL REFERENCES work_locations(id),
    timestamp DATE NOT NULL,
    air_quality_index INT,
    UNIQUE(work_location_id, timestamp)
);

