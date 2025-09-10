import threading
import time
import requests
from datetime import datetime, date
from app import db
from app.models import WorkLocation, Weather, AirQuality

VISUAL_CROSSING_KEY = "4SD5JP775G8EFDF9T5HV7KF2B"
AQICN_TOKEN = "db81fc42c61c3ed75bf2a98c285470286fc8da51"

UPDATE_INTERVAL = 120

def update_weather_and_air_quality(app):
    with app.app_context():
        while True:
            print(f"[Updater] Memulai update weather & air quality {datetime.now()}")
            today = date.today().isoformat()
            work_locations = WorkLocation.query.filter(WorkLocation.latitude != None, WorkLocation.longitude != None).all()
            for loc in work_locations:
                lat = float(loc.latitude)
                lon = float(loc.longitude)
                # Weather
                weather_url = f"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{lat},{lon}/{today}?unitGroup=metric&key={VISUAL_CROSSING_KEY}&include=days"
                try:
                    wresp = requests.get(weather_url)
                    wresp.raise_for_status()
                    wjson = wresp.json()
                    day = wjson['days'][0] if 'days' in wjson and wjson['days'] else None
                    if day:
                        existing_weather = Weather.query.filter(
                            Weather.work_location_id == loc.id,
                        ).first()
                        if existing_weather:
                            existing_weather.temperature = day.get('temp', None)
                            existing_weather.humidity = day.get('humidity', None)
                            existing_weather.wind_speed = day.get('windspeed', None)
                            existing_weather.timestamp = datetime.now()
                        else:
                            weather = Weather(
                                work_location_id=loc.id,
                                temperature=day.get('temp', None),
                                humidity=day.get('humidity', None),
                                wind_speed=day.get('windspeed', None),
                                timestamp=datetime.now()
                            )
                            db.session.add(weather)
                except Exception as e:
                    print(f"[Weather] Failed for {loc.location_name}: {e}")
                # Air Quality
                aq_url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={AQICN_TOKEN}"
                try:
                    aqresp = requests.get(aq_url)
                    aqresp.raise_for_status()
                    aqjson = aqresp.json()
                    if aqjson.get('status') == 'ok':
                        iaqi = aqjson['data'].get('iaqi', {})
                        existing_aq = AirQuality.query.filter(
                            AirQuality.work_location_id == loc.id,
                        ).first()
                        if existing_aq:
                            existing_aq.aqi = aqjson['data'].get('aqi', None)
                            existing_aq.pm25 = iaqi.get('pm25', {}).get('v', None)
                            existing_aq.pm10 = iaqi.get('pm10', {}).get('v', None)
                            existing_aq.co_level = iaqi.get('co', {}).get('v', None)
                            existing_aq.timestamp = datetime.now()
                        else:
                            air_quality = AirQuality(
                                work_location_id=loc.id,
                                aqi=aqjson['data'].get('aqi', None),
                                pm25=iaqi.get('pm25', {}).get('v', None),
                                pm10=iaqi.get('pm10', {}).get('v', None),
                                co_level=iaqi.get('co', {}).get('v', None),
                                timestamp=datetime.now()
                            )
                            db.session.add(air_quality)
                except Exception as e:
                    print(f"[AQICN] Failed for {loc.location_name}: {e}")
            db.session.commit()
            print(f"[Updater] Selesai update weather & air quality {datetime.now()}")
            time.sleep(UPDATE_INTERVAL)

def start_background_updater(app):
    t = threading.Thread(target=update_weather_and_air_quality, args=(app,), daemon=True)
    t.start()
