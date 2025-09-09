import os
import requests
import psycopg2
from psycopg2 import sql
from datetime import datetime

# --- KONFIGURASI API ---
VISUAL_CROSSING_KEY = os.environ.get('VISUAL_CROSSING_KEY', '4SD5JP775G8EFDF9T5HV7KF2B')
AQICN_TOKEN = os.environ.get('AQICN_TOKEN', 'db81fc42c61c3ed75bf2a98c285470286fc8da51')

# --- KONFIGURASI DATABASE ---
DB_CONFIG = {
    "dbname": "early_warning",
    "user": "postgres",
    "password": "your_password", # <-- GANTI DENGAN PASSWORD ANDA
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    """Membuat dan mengembalikan koneksi ke database."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.OperationalError as e:
        print(f"[FATAL] Gagal terhubung ke database: {e}")
        return None

def fetch_current_weather(latitude, longitude):
    """Mengambil data cuaca terkini dari Visual Crossing."""
    if not VISUAL_CROSSING_KEY or 'GANTI_DENGAN' in VISUAL_CROSSING_KEY:
        print("[ERROR] Visual Crossing API Key belum diatur.")
        return None
        
    url = (
        f"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"
        f"{latitude},{longitude}/today?unitGroup=metric&include=days&key={VISUAL_CROSSING_KEY}&contentType=json"
    )
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        # Ambil data dari prakiraan hari ini
        today_data = data.get('days', [{}])[0]
        return {
            'min_temp': today_data.get('tempmin'),
            'max_temp': today_data.get('tempmax'),
            'avg_temp': today_data.get('temp'),
            'weather_condition': today_data.get('conditions')
        }
    except requests.exceptions.RequestException as e:
        print(f"  [ERROR] Gagal mengambil data cuaca: {e}")
        return None

def fetch_current_aqi(latitude, longitude):
    """Mengambil data kualitas udara terkini dari AQICN."""
    if not AQICN_TOKEN or 'GANTI_DENGAN' in AQICN_TOKEN:
        print("[ERROR] AQICN Token belum diatur.")
        return None

    url = f"https://api.waqi.info/feed/geo:{latitude};{longitude}/?token={AQICN_TOKEN}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        if data.get('status') == 'ok':
            return {
                'aqi': data.get('data', {}).get('aqi')
            }
        else:
            print(f"  [WARN] Status API AQICN tidak 'ok': {data.get('data')}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"  [ERROR] Gagal mengambil data AQI: {e}")
        return None

def main():
    """Fungsi utama untuk menjalankan proses impor data terkini."""
    conn = get_db_connection()
    if not conn:
        return

    try:
        with conn.cursor() as cursor:
            # 1. Ambil semua lokasi kerja dari database
            cursor.execute("SELECT id, location_name, latitude, longitude FROM work_locations WHERE latitude IS NOT NULL AND longitude IS NOT NULL")
            locations = cursor.fetchall()
            
            if not locations:
                print("[WARN] Tidak ada lokasi kerja dengan koordinat yang valid di database.")
                return

            print(f"Memulai pengambilan data terkini untuk {len(locations)} lokasi...")
            today_date = datetime.now().date()

            for loc_id, loc_name, lat, lon in locations:
                print(f"\n-> Memproses lokasi: {loc_name}")

                # 2. Ambil data cuaca terkini
                weather_data = fetch_current_weather(lat, lon)
                if weather_data:
                    try:
                        cursor.execute("""
                            INSERT INTO weather (work_location_id, timestamp, min_temp, max_temp, avg_temp, weather_condition)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            ON CONFLICT (work_location_id, timestamp) DO UPDATE SET
                                min_temp = EXCLUDED.min_temp,
                                max_temp = EXCLUDED.max_temp,
                                avg_temp = EXCLUDED.avg_temp,
                                weather_condition = EXCLUDED.weather_condition;
                        """, (
                            loc_id, today_date, weather_data['min_temp'], weather_data['max_temp'],
                            weather_data['avg_temp'], weather_data['weather_condition']
                        ))
                        print("  - Data cuaca berhasil disimpan.")
                    except Exception as e:
                        print(f"  [ERROR] Gagal menyimpan data cuaca: {e}")
                        conn.rollback()


                # 3. Ambil data kualitas udara terkini
                aqi_data = fetch_current_aqi(lat, lon)
                if aqi_data and aqi_data['aqi'] is not None:
                    try:
                        cursor.execute("""
                            INSERT INTO air_quality (work_location_id, timestamp, air_quality_index)
                            VALUES (%s, %s, %s)
                            ON CONFLICT (work_location_id, timestamp) DO UPDATE SET
                                air_quality_index = EXCLUDED.air_quality_index;
                        """, (loc_id, today_date, aqi_data['aqi']))
                        print("  - Data kualitas udara berhasil disimpan.")
                    except Exception as e:
                        print(f"  [ERROR] Gagal menyimpan data kualitas udara: {e}")
                        conn.rollback()
                
                # Simpan perubahan untuk lokasi ini
                conn.commit()

    except Exception as e:
        print(f"\n[FATAL] Terjadi kesalahan yang tidak terduga: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()
            print("\nProses selesai. Koneksi database ditutup.")

if __name__ == "__main__":
    main()
