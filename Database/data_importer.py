import os
import pandas as pd
import psycopg2
from psycopg2 import sql

# --- KONFIGURASI DATABASE ---
DB_CONFIG = {
    "dbname": "early_warning",
    "user": "postgres",
    "password": "password", # <-- GANTI DENGAN PASSWORD ANDA
    "host": "localhost",
    "port": "5432"
}

# --- NAMA FILE DATA ---
DATA_FILE = 'hasil_gabungan_final.csv'

def get_or_create_id(cursor, table, column_map):
    """
    Fungsi untuk mendapatkan ID dari tabel master.
    Jika ada, kembalikan ID-nya. Jika tidak, buat record baru.
    column_map adalah dictionary, contoh: {'location_name': 'Kantor Pusat'}
    """
    # Ambil kolom dan nilai pertama dari map untuk cek
    columns = list(column_map.keys())
    values = list(column_map.values())
    
    # Lewati jika nilai utamanya None
    if values[0] is None:
        return None

    # Buat klausa WHERE
    where_clauses = [sql.SQL("{col} = %s").format(col=sql.Identifier(col)) for col in columns]
    where_sql = sql.SQL(" AND ").join(where_clauses)

    # Cek apakah record sudah ada
    query = sql.SQL("SELECT id FROM {table} WHERE {where}").format(
        table=sql.Identifier(table),
        where=where_sql
    )
    cursor.execute(query, values)
    result = cursor.fetchone()

    if result:
        return result[0]
    else:
        # Jika tidak ada, buat record baru
        insert_cols = sql.SQL(', ').join(map(sql.Identifier, columns))
        placeholders = sql.SQL(', ').join(sql.Placeholder() * len(values))
        
        query = sql.SQL("INSERT INTO {table} ({cols}) VALUES ({placeholders}) RETURNING id").format(
            table=sql.Identifier(table),
            cols=insert_cols,
            placeholders=placeholders
        )
        cursor.execute(query, values)
        return cursor.fetchone()[0]

def main():
    """Fungsi utama untuk menjalankan proses impor dari file CSV gabungan."""
    conn = None
    try:
        print("Menghubungkan ke database...")
        conn = psycopg2.connect(**DB_CONFIG)
        print("Koneksi berhasil.")

        print(f"Memulai impor data dari '{DATA_FILE}'...")
        df = pd.read_csv(DATA_FILE)
        # Ganti nilai kosong dengan None agar kompatibel dengan SQL NULL
        df = df.where(pd.notna(df) & (df != ''), None)
        
        with conn.cursor() as cursor:
            for index, row in df.iterrows():
                try:
                    # Setiap baris adalah transaksi kecil (savepoint)
                    cursor.execute(f"SAVEPOINT row_{index}")

                    # 1. Proses Master Data (Employees, Diseases, Locations)
                    employee_id = get_or_create_id(cursor, 'employees', {'full_name': row['Name']})
                    disease_id = get_or_create_id(cursor, 'diseases', {'disease_name': row['DIAGNOSIS DESC']})
                    
                    # --- PERBAIKAN LOGIKA LOKASI DI SINI ---
                    location_id = None
                    location_name = row['Office Location']
                    if location_name:
                        # Cek apakah lokasi sudah ada HANYA berdasarkan nama
                        cursor.execute("SELECT id FROM work_locations WHERE location_name = %s", (location_name,))
                        result = cursor.fetchone()
                        if result:
                            # Jika ada, gunakan ID yang sudah ada
                            location_id = result[0]
                        else:
                            # Jika belum ada, buat entri baru dengan semua detail
                            cursor.execute(
                                "INSERT INTO work_locations (location_name, latitude, longitude) VALUES (%s, %s, %s) RETURNING id",
                                (location_name, row['lat'], row['lon'])
                            )
                            location_id = cursor.fetchone()[0]
                    
                    # 2. Proses Penugasan Karyawan (hindari duplikat)
                    if employee_id and location_id:
                        cursor.execute("""
                            INSERT INTO employee_assignments (employee_id, work_location_id, department, division, position, level)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            ON CONFLICT (employee_id, work_location_id, department, division, position, level) DO NOTHING
                        """, (employee_id, location_id, row['Department'], row['Division'], row['Position'], row['Level']))

                    # Konversi tanggal dengan aman
                    admission_date = pd.to_datetime(row['ADMISSION_DATE'], errors='coerce')
                    dischargeable_date = pd.to_datetime(row['DISCHARGEABLE_DATE'], errors='coerce')
                    record_date = admission_date.date() if pd.notna(admission_date) else None

                    # 3. Proses Riwayat Kesehatan
                    if employee_id and disease_id and pd.notna(row['CLAIMS_ID']):
                        cursor.execute("""
                            INSERT INTO health_records (claims_id, employee_id, disease_id, admission_date, dischargeable_date, 
                                provider_name, due_total, approve, member_pay, status, duration_stay, daily_cases, high_risk)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (claims_id) DO NOTHING
                        """, (
                            row['CLAIMS_ID'], employee_id, disease_id, admission_date, dischargeable_date,
                            row['PROVIDER NAME'], row['DUE_TOTAL'], row['APPROVE'], row['MEMBER PAY'], row['STATUS'],
                            row['DURATION_STAY'], row['daily_cases'], row['HIGH_RISK']
                        ))
                    
                    # 4. Proses Data Cuaca (hindari duplikat)
                    if location_id and record_date:
                        cursor.execute("""
                            INSERT INTO weather (work_location_id, timestamp, min_temp, max_temp, avg_temp, weather_condition)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            ON CONFLICT (work_location_id, timestamp) DO NOTHING
                        """, (location_id, record_date, row['min_temp'], row['max_temp'], row['avg_temp'], row['weather_con']))

                    # 5. Proses Kualitas Udara (hindari duplikat)
                    if location_id and record_date:
                        cursor.execute("""
                            INSERT INTO air_quality (work_location_id, timestamp, air_quality_index)
                            VALUES (%s, %s, %s)
                            ON CONFLICT (work_location_id, timestamp) DO NOTHING
                        """, (location_id, record_date, row['air_qual']))

                    cursor.execute(f"RELEASE SAVEPOINT row_{index}")
                except Exception as e:
                    cursor.execute(f"ROLLBACK TO SAVEPOINT row_{index}")
                    print(f"  [SKIPPED] Gagal memproses baris #{index+2}: {e}")
        
        conn.commit()
        print("Impor data dari file gabungan selesai.")

    except FileNotFoundError:
        print(f"[FATAL] File data '{DATA_FILE}' tidak ditemukan. Pastikan file berada di folder yang sama.")
    except Exception as e:
        if conn: conn.rollback()
        print(f"[FATAL] Terjadi kesalahan yang tidak terduga: {e}")
    finally:
        if conn:
            conn.close()
            print("\nKoneksi database ditutup.")

if __name__ == "__main__":
    main()

