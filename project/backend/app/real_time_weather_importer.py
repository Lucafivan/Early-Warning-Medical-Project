import os
import requests
import psycopg2
# import joblib  # Library untuk memuat model machine learning yang sudah dilatih

# --- KONFIGURASI ---
API_KEY = os.environ.get('WEATHER_API_KEY', '14c57538c90d47e480622045250409')#<- key
DB_CONFIG = {
    "dbname": "early_warning",
    "user": "postgres",
    "password": "your_password", # Ganti dengan password Anda
    "host": "localhost",
    "port": "5432"
}
# Lokasi file model yang sudah dilatih oleh tim data science
# MODEL_FILE_PATH = 'model_pak.pkl' 

def get_current_weather(city='Jakarta'):
    """Mengambil data cuaca dan kualitas udara terkini."""
    print(f"Mengambil data cuaca terkini untuk {city}...")
    base_url = "http://api.weatherapi.com/v1/current.json"
    params = {'key': API_KEY, 'q': city, 'aqi': 'yes'}
    
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()['current']
        
        # Ekstrak fitur yang dibutuhkan oleh model
        features = {
            'temperature': data['temp_c'],
            'humidity': data['humidity'],
            'wind_speed': data['wind_kph'],
            'pm25': data.get('air_quality', {}).get('pm2_5', 0)
        }
        print("  -> Data berhasil diambil.")
        return features
    except requests.exceptions.RequestException as e:
        print(f"  [ERROR] Gagal mengambil data API: {e}")
        return None

def predict_risk(features):
    """
    Memuat model yang sudah dilatih dan menghasilkan prediksi.
    Ini adalah bagian yang akan diimplementasikan oleh tim data science.
    """
    print("Memasukkan data ke dalam model prediksi...")
    
    # --- CONTOH KONSEPTUAL ---
    # 1. Muat model dari file
    # try:
    #     model = joblib.load(MODEL_FILE_PATH)
    # except FileNotFoundError:
    #     print(f"  [ERROR] File model '{MODEL_FILE_PATH}' tidak ditemukan. Silakan latih model terlebih dahulu.")
    #     return "Tidak Diketahui"

    # 2. Siapkan data agar sesuai dengan format yang diharapkan model
    #    (misalnya, ubah menjadi DataFrame atau array numpy)
    # input_data = [[features['temperature'], features['humidity'], features['wind_speed'], features['pm25']]]
    
    # 3. Lakukan prediksi
    # prediction_result = model.predict(input_data)
    # risk_level = prediction_result[0] 
    # --- AKHIR CONTOH KONSEPTUAL ---

    # Untuk sekarang, kita gunakan logika sederhana sebagai placeholder
    if features['pm25'] > 55:
        risk_level = "Risiko Tinggi"
    elif features['pm25'] > 35:
        risk_level = "Risiko Sedang"
    else:
        risk_level = "Risiko Rendah"
        
    print(f"  -> Hasil Prediksi: {risk_level}")
    return risk_level

def main():
    """Fungsi utama untuk menjalankan monitor."""
    # Anda bisa membuat loop ini untuk semua lokasi kerja penting
    target_city = 'Jakarta'
    
    current_features = get_current_weather(target_city)
    
    if current_features:
        risk = predict_risk(current_features)
        
        # Di sini Anda bisa menyimpan hasil prediksi ke database,
        # mengirim notifikasi, atau menampilkannya di dashboard.
        print(f"\nKesimpulan: Tingkat risiko PAK terkait pernapasan di {target_city} saat ini adalah **{risk}**.")

if __name__ == "__main__":
    main()
