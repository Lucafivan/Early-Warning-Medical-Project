import os
import pandas as pd
import psycopg2
import psycopg2.extras
from psycopg2 import sql
from datetime import datetime

# --- KONFIGURASI DATABASE ---
DB_CONFIG = {
    "dbname": "early_warning",
    "user": "postgres",
    "password": "labda321", # <-- GANTI DENGAN PASSWORD ANDA
    "host": "localhost",
    "port": "5432"
}

# --- NAMA FILE DATA ---
EMPLOYEE_DATA_FILE = 'Alias Karyawan.xlsx'
MEDICAL_DATA_FILE = 'Dummy Medical Data.xlsx'

def check_tables_exist(cursor):
    """Memeriksa apakah semua tabel yang dibutuhkan sudah ada."""
    required_tables = [
        'work_locations', 'hazards', 'diseases', 'users', 'employees',
        'employee_assignments', 'health_records', 'weather', 'air_quality'
    ]
    missing_tables = []
    for table in required_tables:
        cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = %s)", (table,))
        if not cursor.fetchone()[0]:
            missing_tables.append(table)
    return missing_tables

def get_or_create_id(cursor, table, column, value):
    """Mendapatkan ID jika ada, atau membuat record baru dan mengembalikan ID-nya."""
    if value is None:
        return None
        
    query = sql.SQL("SELECT id FROM {table} WHERE {column} = %s").format(
        table=sql.Identifier(table),
        column=sql.Identifier(column)
    )
    cursor.execute(query, (value,))
    result = cursor.fetchone()

    if result:
        return result[0]
    else:
        query = sql.SQL("INSERT INTO {table} ({column}) VALUES (%s) RETURNING id").format(
            table=sql.Identifier(table),
            column=sql.Identifier(column)
        )
        cursor.execute(query, (value,))
        return cursor.fetchone()[0]

def parse_excel_date(value, row_index):
    """Fungsi cerdas untuk menangani berbagai format tanggal dari Excel."""
    if value is None or pd.isna(value):
        return None
    
    # Coba jika sudah dalam format datetime
    if isinstance(value, datetime):
        return value

    # Coba jika formatnya adalah nomor seri Excel (integer atau float)
    if isinstance(value, (int, float)):
        try:
            # Excel menghitung hari dari 1899-12-30 (bukan 1900 karena bug leap year)
            return pd.to_datetime(value, unit='D', origin='1899-12-30')
        except (ValueError, TypeError):
            pass # Lanjutkan ke metode berikutnya jika gagal

    # Coba jika formatnya adalah string
    try:
        cleaned_str = str(value).strip()
        # Coba format dd/mm/yy
        return pd.to_datetime(cleaned_str, format='%d/%m/%y', errors='raise')
    except (ValueError, TypeError):
        # Jika semua gagal, cetak peringatan
        print(f"  [WARNING] Baris #{row_index+2}: Format tanggal tidak dapat dikenali. Nilai asli: '{value}'. Dilewati.")
        return None


def import_employee_data(conn):
    """Mengimpor data karyawan."""
    print(f"Memulai impor data dari '{EMPLOYEE_DATA_FILE}'...")
    try:
        df = pd.read_excel(EMPLOYEE_DATA_FILE)
        df = df.where(pd.notna(df), None)

        with conn.cursor() as cursor:
            for index, row in df.iterrows():
                try:
                    cursor.execute("SAVEPOINT employee_row")
                    employee_name = row['Name']
                    if not employee_name:
                        continue
                    employee_id = get_or_create_id(cursor, 'employees', 'full_name', employee_name)
                    location_name = row['Location']
                    location_id = get_or_create_id(cursor, 'work_locations', 'location_name', location_name)
                    cursor.execute("""
                        INSERT INTO employee_assignments (employee_id, work_location_id, department, division, position, level)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, (employee_id, location_id, row['Department'], row['Division'], row['Position'], row['Level']))
                    cursor.execute("RELEASE SAVEPOINT employee_row")
                except Exception as e:
                    cursor.execute("ROLLBACK TO SAVEPOINT employee_row")
                    print(f"  [SKIPPED] Gagal memproses baris karyawan #{index+1} ('{row.get('Name')}'): {e}")
        conn.commit()
        print(f"Impor data karyawan selesai.")
    except FileNotFoundError:
        print(f"[ERROR] File '{EMPLOYEE_DATA_FILE}' tidak ditemukan.")
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Terjadi kesalahan saat impor data karyawan: {e}")

def import_medical_data(conn):
    """Mengimpor data medis dengan penanganan format tanggal yang tangguh."""
    print(f"Memulai impor data dari '{MEDICAL_DATA_FILE}'...")
    try:
        df = pd.read_excel(MEDICAL_DATA_FILE)
        df = df.where(pd.notna(df), None)

        with conn.cursor() as cursor:
            for index, row in df.iterrows():
                try:
                    cursor.execute("SAVEPOINT medical_row")
                    patient_name = row['ALIAS_PATIENT']
                    if not patient_name:
                        continue
                    employee_id = get_or_create_id(cursor, 'employees', 'full_name', patient_name)
                    disease_name = row['DIAGNOSIS DESC']
                    disease_id = get_or_create_id(cursor, 'diseases', 'disease_name', disease_name)

                    # Gunakan fungsi baru yang cerdas untuk mem-parsing tanggal
                    record_date = parse_excel_date(row['ADMISSION_DATE'], index)

                    def to_numeric_safe(val):
                        return pd.to_numeric(val, errors='coerce') if val is not None else None

                    cursor.execute("""
                        INSERT INTO health_records (
                            employee_id, disease_id, record_type, record_date, claims_id,
                            provider_name, due_total, approve, member_pay, excess_paid,
                            excess_not_paid, claim_status, coverage_id
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        employee_id, disease_id, 'Klaim PAK', record_date,
                        row['CLAIMS_ID'], row['PROVIDER NAME'], to_numeric_safe(row['DUE_TOTAL']),
                        to_numeric_safe(row['APPROVE']), to_numeric_safe(row['MEMBER PAY']),
                        to_numeric_safe(row['EXCESS PAID']), to_numeric_safe(row['EXCESS NOT PAID']),
                        row['STATUS'], row['COVERAGE_ID']
                    ))
                    cursor.execute("RELEASE SAVEPOINT medical_row")
                except Exception as e:
                    cursor.execute("ROLLBACK TO SAVEPOINT medical_row")
                    print(f"  [SKIPPED] Gagal memproses baris klaim #{index+2} ('{row.get('CLAIMS_ID')}'): {e}")
        conn.commit()
        print(f"Impor data medis selesai.")
    except FileNotFoundError:
        print(f"[ERROR] File '{MEDICAL_DATA_FILE}' tidak ditemukan.")
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Terjadi kesalahan saat impor data medis: {e}")

def main():
    """Fungsi utama untuk menjalankan proses impor."""
    conn = None
    try:
        print("Menghubungkan ke database...")
        conn = psycopg2.connect(**DB_CONFIG)
        print("Koneksi berhasil.")
        with conn.cursor() as cursor:
            missing_tables = check_tables_exist(cursor)
            if missing_tables:
                print("\n[FATAL] Proses impor dihentikan. Tabel-tabel berikut tidak ditemukan di database:")
                for table in missing_tables:
                    print(f"  - {table}")
                print("\nSOLUSI: Pastikan Anda sudah menjalankan skrip 'final_schema.sql' di pgAdmin untuk membuat struktur database terlebih dahulu.")
                return
        import_employee_data(conn)
        print("-" * 30)
        import_medical_data(conn)
    except psycopg2.OperationalError as e:
        print(f"[FATAL] Gagal terhubung ke database: {e}")
    except Exception as e:
        print(f"[FATAL] Terjadi kesalahan yang tidak terduga: {e}")
    finally:
        if conn:
            conn.close()
            print("\nKoneksi database ditutup.")

if __name__ == "__main__":
    main()

