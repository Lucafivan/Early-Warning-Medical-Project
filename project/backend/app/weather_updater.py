import threading
import time
import requests
from datetime import datetime, date
from app import db
from app.models import WorkLocation, Weather, AirQuality

VISUAL_CROSSING_KEY = "4SD5JP775G8EFDF9T5HV7KF2B"
AQICN_TOKEN = "db81fc42c61c3ed75bf2a98c285470286fc8da51"

UPDATE_INTERVAL = 15 * 60

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
                            db.func.date(Weather.timestamp) == today
                        ).first()
                        if existing_weather:
                            existing_weather.min_temperature = day.get('tempmin', None)
                            existing_weather.max_temperature = day.get('tempmax', None)
                            existing_weather.average_temperature = day.get('temp', None)
                            existing_weather.weather_condition = day.get('conditions', None)
                            existing_weather.timestamp = datetime.now()
                        else:
                            weather = Weather(
                                work_location_id=loc.id,
                                min_temperature=day.get('tempmin', None),
                                max_temperature=day.get('tempmax', None),
                                average_temperature=day.get('temp', None),
                                weather_condition=day.get('conditions', None),
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
                        existing_aq = AirQuality.query.filter(
                            AirQuality.work_location_id == loc.id,
                            db.func.date(AirQuality.timestamp) == today
                        ).first()
                        aqi_value = aqjson['data'].get('aqi', None)
                        if existing_aq:
                            existing_aq.air_quality_index = aqi_value
                            existing_aq.timestamp = datetime.now()
                        else:
                            air_quality = AirQuality(
                                work_location_id=loc.id,
                                air_quality_index=aqi_value,
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
