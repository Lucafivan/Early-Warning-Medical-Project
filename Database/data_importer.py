import os
import pandas as pd
import psycopg2
from psycopg2 import sql
from datetime import datetime

# --- KONFIGURASI ---
DB_CONFIG = {
    "dbname": "early_warning",
    "user": "postgres",
    "password": "your_password", # <-- GANTI DENGAN PASSWORD ANDA
    "host": "localhost",
    "port": "5432"
}

# Pastikan file ini berada di folder yang sama dengan skrip
DATA_FILE = 'hasil_gabungan_final.csv'

def get_or_create_id(cursor, table, column_map, value_map, conflict_column):
    """
    Fungsi cerdas untuk mendapatkan ID. Jika record sudah ada berdasarkan conflict_column,
    ID akan dikembalikan. Jika tidak, record baru akan dibuat.
    """
    if value_map.get(conflict_column) is None:
        return None

    # Cek apakah record sudah ada
    query_select = sql.SQL("SELECT id FROM {table} WHERE {conflict_col} = %s").format(
        table=sql.Identifier(table),
        conflict_col=sql.Identifier(conflict_column)
    )
    cursor.execute(query_select, (value_map[conflict_column],))
    result = cursor.fetchone()

    if result:
        return result[0]
    else:
        # Jika tidak ada, buat record baru
        columns = sql.SQL(', ').join(map(sql.Identifier, column_map))
        placeholders = sql.SQL(', ').join(sql.Placeholder() * len(column_map))
        values = [value_map.get(col) for col in column_map]
        
        query_insert = sql.SQL("INSERT INTO {table} ({columns}) VALUES ({placeholders}) RETURNING id").format(
            table=sql.Identifier(table),
            columns=columns,
            placeholders=placeholders
        )
        cursor.execute(query_insert, values)
        return cursor.fetchone()[0]

def main():
    """Fungsi utama untuk menjalankan proses impor."""
    try:
        print(f"Membaca file data '{DATA_FILE}'...")
        # Baca semua data sebagai string untuk menghindari konversi otomatis yang salah
        df = pd.read_csv(DATA_FILE, dtype=str)
        # Ganti nilai kosong pandas (NaN, NaT, dll) dan string 'nan' menjadi None
        df = df.replace({pd.NA: None, 'nan': None})
        print("File berhasil dibaca.")
    except FileNotFoundError:
        print(f"[FATAL] File '{DATA_FILE}' tidak ditemukan. Pastikan file berada di folder yang sama.")
        return

    conn = None
    try:
        print("Menghubungkan ke database...")
        conn = psycopg2.connect(**DB_CONFIG)
        print("Koneksi berhasil.")

        with conn.cursor() as cursor:
            total_rows = len(df)
            for index, row in df.iterrows():
                print(f"  Memproses baris {index + 1}/{total_rows}...", end='\r')
                try:
                    cursor.execute("SAVEPOINT row_import")

                    # 1. Lokasi Kerja (Work Locations)
                    loc_id = get_or_create_id(
                        cursor, 'work_locations', ['location_name', 'latitude', 'longitude'],
                        {'location_name': row['Office Location'], 'latitude': pd.to_numeric(row['lat'], errors='coerce'), 'longitude': pd.to_numeric(row['lon'], errors='coerce')},
                        'location_name'
                    )

                    # 2. Penyakit (Diseases)
                    disease_id = get_or_create_id(
                        cursor, 'diseases', ['disease_name'],
                        {'disease_name': row['DIAGNOSIS DESC']},
                        'disease_name'
                    )

                    # 3. Karyawan (Employees)
                    employee_id = get_or_create_id(
                        cursor, 'employees', ['full_name'],
                        {'full_name': row['Name']},
                        'full_name'
                    )

                    # 4. Penugasan (Employee Assignments)
                    # Ini akan dilewati jika penugasan yang sama persis sudah ada
                    try:
                        cursor.execute("""
                            INSERT INTO employee_assignments (employee_id, work_location_id, department, division, position, level)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            ON CONFLICT (employee_id, work_location_id, position, department, division) DO NOTHING;
                        """, (employee_id, loc_id, row['Department'], row['Division'], row['Position'], row['Level']))
                    except psycopg2.IntegrityError:
                        pass # Lewati jika ada duplikat

                    # Tanggal kejadian
                    admission_date = pd.to_datetime(row['ADMISSION_DATE'], errors='coerce')
                    if pd.isna(admission_date):
                        continue # Lewati baris jika tanggal tidak valid

                    # 5. Cuaca (Weather)
                    try:
                        cursor.execute("""
                            INSERT INTO weather (work_location_id, timestamp, min_temp, max_temp, avg_temp, weather_condition)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            ON CONFLICT (work_location_id, timestamp) DO NOTHING;
                        """, (
                            loc_id, admission_date.date(), pd.to_numeric(row['min_temp'], errors='coerce'), 
                            pd.to_numeric(row['max_temp'], errors='coerce'), pd.to_numeric(row['avg_temp'], errors='coerce'), 
                            row['weather_con']
                        ))
                    except psycopg2.IntegrityError:
                        pass # Lewati jika ada duplikat

                    # 6. Kualitas Udara (Air Quality)
                    try:
                        cursor.execute("""
                            INSERT INTO air_quality (work_location_id, timestamp, air_quality_index)
                            VALUES (%s, %s, %s)
                            ON CONFLICT (work_location_id, timestamp) DO NOTHING;
                        """, (loc_id, admission_date.date(), pd.to_numeric(row['air_qual'], errors='coerce')))
                    except psycopg2.IntegrityError:
                        pass # Lewati jika ada duplikat

                    # 7. Catatan Kesehatan (Health Records)
                    discharge_date = pd.to_datetime(row['DISCHARGEABLE_DATE'], errors='coerce')
                    cursor.execute("""
                        INSERT INTO health_records (employee_id, disease_id, admission_date, dischargeable_date,
                        claims_id, provider_name, status, duration_stay_days, daily_cases, high_risk)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (claims_id) DO NOTHING;
                    """, (
                        employee_id, disease_id, admission_date, discharge_date,
                        pd.to_numeric(row['CLAIMS_ID'], errors='coerce'), row['PROVIDER NAME'], row['STATUS'],
                        pd.to_numeric(row['DURATION_STAY'], errors='coerce'), pd.to_numeric(row['daily_cases'], errors='coerce'),
                        pd.to_numeric(row['HIGH_RISK'], errors='coerce')
                    ))

                    cursor.execute("RELEASE SAVEPOINT row_import")
                except Exception as e:
                    cursor.execute("ROLLBACK TO SAVEPOINT row_import")
                    print(f"\n[SKIPPED] Gagal memproses baris #{index + 1}: {e}")
            
            print("\nProses impor selesai.")
            conn.commit()

    except psycopg2.OperationalError as e:
        print(f"\n[FATAL] Gagal terhubung ke database: {e}")
        print("Pastikan konfigurasi di DB_CONFIG sudah benar dan database PostgreSQL sedang berjalan.")
    except Exception as e:
        print(f"\n[FATAL] Terjadi kesalahan yang tidak terduga: {e}")
    finally:
        if conn:
            conn.close()
            print("Koneksi database ditutup.")

if __name__ == "__main__":
    main()

