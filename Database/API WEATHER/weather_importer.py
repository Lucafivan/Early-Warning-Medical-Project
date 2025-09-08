import os
import requests
import psycopg2
import time
from datetime import date

# ==============================================================================
# KONFIGURASI - GANTI DENGAN DETAIL ANDA
# ==============================================================================

# Dapatkan API Key Anda dari www.weatherapi.com
API_KEY = os.environ.get('WEATHER_API_KEY', 'GANTI_DENGAN_API_KEY_ANDA')

# Konfigurasi koneksi database
DB_CONFIG = {
    'dbname': os.environ.get('DB_NAME', 'early_warning'),
    'user': os.environ.get('DB_USER', 'postgres'),
    'password': os.environ.get('DB_PASSWORD', 'your_password'), # Ganti dengan password Anda
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': os.environ.get('DB_PORT', '5432')
}

# ==============================================================================
# FUNGSI-FUNGSI HELPER
# ==============================================================================

def get_db_connection():
    """Membuat dan mengembalikan koneksi ke database."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.OperationalError as e:
        print(f"[FATAL] Gagal terhubung ke database: {e}")
        return None

def fetch_historical_weather(location_name, latitude, longitude, target_date):
    """
    Mengambil data cuaca historis dari WeatherAPI.com.
    Ini adalah fungsi kunci yang memanggil endpoint 'history.json'.
    """
    base_url = "http://api.weatherapi.com/v1/history.json"
    query = f"{latitude},{longitude}"
    
    params = {
        'key': API_KEY,
        'q': query,
        'dt': target_date.strftime('%Y-%m-%d'), # Menggunakan tanggal spesifik dari data medis
        'aqi': 'yes'
    }

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status() # Akan error jika status code bukan 200
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Gagal mengambil data API untuk {location_name} pada {target_date}: {e}")
        return None

def insert_weather_data(cursor, location_id, timestamp, weather_data):
    """Memasukkan data cuaca ke tabel 'weather', menghindari duplikat."""
    # Struktur JSON dari WeatherAPI menempatkan data harian di dalam forecast -> forecastday[0] -> day
    day_data = weather_data.get('forecast', {}).get('forecastday', [{}])[0].get('day', {})
    
    # Cek apakah data untuk lokasi dan tanggal ini sudah ada
    cursor.execute(
        "SELECT id FROM weather WHERE work_location_id = %s AND DATE(timestamp) = %s",
        (location_id, timestamp)
    )
    if cursor.fetchone():
        return False # Data sudah ada, tidak perlu insert lagi

    if day_data:
        cursor.execute("""
            INSERT INTO weather (work_location_id, timestamp, temperature, humidity, wind_speed)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            location_id, timestamp, day_data.get('avgtemp_c'),
            day_data.get('avghumidity'), day_data.get('maxwind_kph')
        ))
        return True
    return False

def insert_air_quality_data(cursor, location_id, timestamp, weather_data):
    """Memasukkan data kualitas udara ke tabel 'air_quality', menghindari duplikat."""
    # Data kualitas udara juga berada di dalam 'day'
    air_quality = weather_data.get('forecast', {}).get('forecastday', [{}])[0].get('day', {}).get('air_quality', {})
    
    # Cek apakah data untuk lokasi dan tanggal ini sudah ada
    cursor.execute(
        "SELECT id FROM air_quality WHERE work_location_id = %s AND DATE(timestamp) = %s",
        (location_id, timestamp)
    )
    if cursor.fetchone():
        return False # Data sudah ada, tidak perlu insert lagi

    if air_quality:
        cursor.execute("""
            INSERT INTO air_quality (work_location_id, timestamp, aqi, pm25, pm10, co_level)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            location_id, timestamp, air_quality.get('us-epa-index'),
            air_quality.get('pm2_5'), air_quality.get('pm10'), air_quality.get('co')
        ))
        return True
    return False

# ==============================================================================
# FUNGSI UTAMA
# ==============================================================================

def main():
    """Fungsi utama untuk menjalankan proses impor yang akurat."""
    if 'GANTI_DENGAN_API_KEY_ANDA' in API_KEY:
        print("[FATAL] API Key belum diatur di file weather_importer.py.")
        return

    conn = get_db_connection()
    if not conn:
        return

    try:
        with conn.cursor() as cursor:
            # Ini adalah 'Query Cerdas' yang menjadi inti dari logika skrip.
            # Ia menggabungkan data kesehatan dengan data penugasan karyawan
            # untuk menemukan di mana dan kapan setiap kasus penyakit terjadi.
            cursor.execute("""
                SELECT DISTINCT
                    hr.record_date, wl.id, wl.location_name, wl.latitude, wl.longitude
                FROM health_records hr
                JOIN employee_assignments ea ON hr.employee_id = ea.employee_id
                JOIN work_locations wl ON ea.work_location_id = wl.id
                WHERE hr.record_date IS NOT NULL AND wl.latitude IS NOT NULL AND wl.longitude IS NOT NULL;
            """)
            tasks = cursor.fetchall()

            print(f"Ditemukan {len(tasks)} kombinasi unik (tanggal, lokasi) untuk diambil datanya.")
            
            for i, task in enumerate(tasks):
                target_date, loc_id, loc_name, lat, lon = task
                print(f"\n[Proses {i+1}/{len(tasks)}] Mengambil data untuk {loc_name} pada {target_date}...")

                weather_data = fetch_historical_weather(loc_name, lat, lon, target_date)

                if weather_data:
                    # Kita hanya menyimpan tanggal, bukan jam, karena data historis bersifat harian
                    timestamp = date(target_date.year, target_date.month, target_date.day)
                    
                    weather_inserted = insert_weather_data(cursor, loc_id, timestamp, weather_data)
                    aqi_inserted = insert_air_quality_data(cursor, loc_id, timestamp, weather_data)
                    
                    if weather_inserted or aqi_inserted:
                        print(f"  -> Data untuk {loc_name} pada {target_date} berhasil dimasukkan.")
                        conn.commit() # Simpan perubahan ke database
                    else:
                        print(f"  -> Data untuk {loc_name} pada {target_date} sudah ada, dilewati.")

                # Beri jeda antar panggilan API untuk menghindari rate limit
                time.sleep(1)

    except Exception as e:
        print(f"[ERROR] Terjadi kesalahan saat proses impor: {e}")
    finally:
        if conn:
            conn.close()
            print("\nProses selesai. Koneksi database ditutup.")

if __name__ == '__main__':
    main()

