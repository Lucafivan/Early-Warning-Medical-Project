import os
import pandas as pd
import psycopg2
import psycopg2.extras
from psycopg2 import sql

# --- KONFIGURASI DATABASE ---
# Ganti nilai di bawah ini sesuai dengan konfigurasi database PostgreSQL Anda.
DB_CONFIG = {
    "dbname": "early_warning",
    "user": "postgres",
    "password": "labda321",
    "host": "localhost",
    "port": "5432"
}

# --- NAMA FILE DATA ---
# Pastikan file Excel ini berada di folder yang sama dengan skrip ini.
EMPLOYEE_DATA_FILE = '/Users/farhanlado/Documents/kuliah/semester 7/Proyek Early Warning/Alias Karyawan.xlsx'
MEDICAL_DATA_FILE = '/Users/farhanlado/Documents/kuliah/semester 7/Proyek Early Warning/Dummy Medical Data.xlsx'


def get_or_create_id(cursor, table, column, value):
    """
    Fungsi untuk memeriksa apakah sebuah nilai sudah ada di tabel master.
    Jika ada, kembalikan ID-nya. Jika tidak, masukkan nilai baru dan kembalikan ID baru.
    """
    # Cek apakah nilai sudah ada
    query = sql.SQL("SELECT id FROM {table} WHERE {column} = %s").format(
        table=sql.Identifier(table),
        column=sql.Identifier(column)
    )
    cursor.execute(query, (value,))
    result = cursor.fetchone()

    if result:
        return result[0]
    else:
        # Jika tidak ada, masukkan record baru
        query = sql.SQL("INSERT INTO {table} ({column}) VALUES (%s) RETURNING id").format(
            table=sql.Identifier(table),
            column=sql.Identifier(column)
        )
        cursor.execute(query, (value,))
        return cursor.fetchone()[0]


def import_employee_data(conn):
    """
    Membaca dan memproses data dari file Alias Karyawan.
    """
    print(f"Memulai impor data dari '{EMPLOYEE_DATA_FILE}'...")
    try:
        df = pd.read_excel(EMPLOYEE_DATA_FILE)
        # Ganti nilai kosong (NaN) dengan None agar bisa di-handle sebagai NULL di SQL
        df = df.where(pd.notna(df), None)

        with conn.cursor() as cursor:
            for _, row in df.iterrows():
                try:
                    # 1. Proses tabel `employees`
                    employee_name = row['Name']
                    if not employee_name:
                        continue # Lewati baris jika nama karyawan kosong
                    employee_id = get_or_create_id(cursor, 'employees', 'full_name', employee_name)

                    # 2. Proses tabel `work_locations`
                    location_name = row['Location']
                    location_id = None
                    if location_name:
                        location_id = get_or_create_id(cursor, 'work_locations', 'location_name', location_name)

                    # 3. Proses tabel `employee_assignments`
                    cursor.execute("""
                        INSERT INTO employee_assignments (employee_id, work_location_id, department, division, position, level)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (employee_id, location_id, row['Department'], row['Division'], row['Position'], row['Level']))

                except Exception as e:
                    print(f"  [ERROR] Gagal memproses baris karyawan '{row.get('Name')}': {e}")

        conn.commit()
        print(f"Impor data karyawan selesai.")

    except FileNotFoundError:
        print(f"[ERROR] File '{EMPLOYEE_DATA_FILE}' tidak ditemukan.")
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Terjadi kesalahan saat impor data karyawan: {e}")


def import_medical_data(conn):
    """
    Membaca dan memproses data dari file Dummy Medical Data.
    """
    print(f"Memulai impor data dari '{MEDICAL_DATA_FILE}'...")
    try:
        df = pd.read_excel(MEDICAL_DATA_FILE)
        df = df.where(pd.notna(df), None)

        with conn.cursor() as cursor:
            for _, row in df.iterrows():
                try:
                    # 1. Pastikan pasien terdaftar di tabel `employees`
                    patient_name = row['ALIAS_PATIENT']
                    if not patient_name:
                        continue # Lewati baris jika nama pasien kosong
                    employee_id = get_or_create_id(cursor, 'employees', 'full_name', patient_name)

                    # 2. Proses tabel `diseases`
                    disease_name = row['DIAGNOSIS DESC']
                    disease_id = None
                    if disease_name:
                        disease_id = get_or_create_id(cursor, 'diseases', 'disease_name', disease_name)

                    # 3. Proses tabel `health_records`
                    # Konversi tanggal, jika gagal gunakan None
                    record_date = pd.to_datetime(row['ADMISSION_DATE'], errors='coerce')
                    if pd.isna(record_date):
                        record_date = None

                    # Fungsi untuk konversi numerik dengan aman
                    def to_numeric_safe(val):
                        return pd.to_numeric(val, errors='coerce') if val is not None else None

                    cursor.execute("""
                        INSERT INTO health_records (
                            employee_id, disease_id, record_type, record_date, claims_id,
                            provider_name, due_total, approve, member_pay, excess_paid,
                            excess_not_paid, claim_status, coverage_id
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        employee_id,
                        disease_id,
                        'Klaim PAK', # Tipe record default
                        record_date,
                        row['CLAIMS_ID'],
                        row['PROVIDER NAME'],
                        to_numeric_safe(row['DUE_TOTAL']),
                        to_numeric_safe(row['APPROVE']),
                        to_numeric_safe(row['MEMBER PAY']),
                        to_numeric_safe(row['EXCESS PAID']),
                        to_numeric_safe(row['EXCESS NOT PAID']),
                        row['STATUS'],
                        row['COVERAGE_ID']
                    ))
                except Exception as e:
                    print(f"  [ERROR] Gagal memproses baris klaim '{row.get('CLAIMS_ID')}': {e}")

        conn.commit()
        print(f"Impor data medis selesai.")

    except FileNotFoundError:
        print(f"[ERROR] File '{MEDICAL_DATA_FILE}' tidak ditemukan.")
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Terjadi kesalahan saat impor data medis: {e}")


def main():
    """
    Fungsi utama untuk menjalankan proses impor.
    """
    conn = None
    try:
        print("Menghubungkan ke database...")
        conn = psycopg2.connect(**DB_CONFIG)
        print("Koneksi berhasil.")

        import_employee_data(conn)
        print("-" * 30)
        import_medical_data(conn)

    except psycopg2.OperationalError as e:
        print(f"[FATAL] Gagal terhubung ke database: {e}")
        print("Pastikan konfigurasi di DB_CONFIG sudah benar dan database PostgreSQL sedang berjalan.")
    except Exception as e:
        print(f"[FATAL] Terjadi kesalahan yang tidak terduga: {e}")
    finally:
        if conn:
            conn.close()
            print("\nKoneksi database ditutup.")


if __name__ == "__main__":
    main()

