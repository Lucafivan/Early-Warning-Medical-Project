import os
import json
import requests
import psycopg2
from datetime import datetime

# === CONFIGURATION ===
WEATHER_API_KEY = os.getenv(" 14c57538c90d47e480622045250409")  # api key
WEATHER_BASE_URL = "https://api.weatherapi.com/v1/current.json"

DB_CONFIG = {
    "dbname": "early_warning",
    "user": "postgres",       # change if needed
    "password": "your_password",  # change if needed
    "host": "localhost",
    "port": "5432"
}

# === FETCH WEATHER + AQI ===
def fetch_weather(city="Jakarta"):
    """Fetch weather and air quality data from WeatherAPI.com"""
    url = f"{WEATHER_BASE_URL}?key={WEATHER_API_KEY}&q={city}&aqi=yes"
    response = requests.get(url)
    data = response.json()

    # Weather data
    weather = {
        "location": data["location"]["name"],
        "temperature": data["current"]["temp_c"],
        "humidity": data["current"]["humidity"],
        "wind_speed": data["current"]["wind_kph"],
    }

    # Air Quality data (from WeatherAPI response)
    aq = data["current"].get("air_quality", {})
    air_quality = {
        "aqi": aq.get("us-epa-index"),   # 1–6 scale
        "pm25": aq.get("pm2_5"),
        "pm10": aq.get("pm10"),
        "co": aq.get("co"),
    }

    return weather, air_quality

# === SAVE TO DATABASE ===
def save_weather_to_db(weather, work_location_id=1):
    """Insert weather data into 'weather' table"""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO weather (work_location_id, temperature, humidity, wind_speed, timestamp)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        work_location_id,
        weather["temperature"],
        weather["humidity"],
        weather["wind_speed"],
        datetime.now()
    ))
    conn.commit()
    cur.close()
    conn.close()

def save_air_quality_to_db(air_quality, work_location_id=1):
    """Insert AQI data into 'air_quality' table"""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO air_quality (work_location_id, aqi, pm25, pm10, co_level, timestamp)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        work_location_id,
        air_quality["aqi"],
        air_quality["pm25"],
        air_quality["pm10"],
        air_quality["co"],
        datetime.now()
    ))
    conn.commit()
    cur.close()
    conn.close()

# === MAIN SCRIPT ===
if __name__ == "__main__":
    weather, air_quality = fetch_weather("Jakarta")
    save_weather_to_db(weather, work_location_id=1)
    save_air_quality_to_db(air_quality, work_location_id=1)
    print("✅ Weather & Air Quality data saved to database")
