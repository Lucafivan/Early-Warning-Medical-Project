import pandas as pd
from . import db
import os
from .models import (
    WorkLocation, Hazard, Disease, User,
    Employee, EmployeeAssignment, HealthRecord,
    Weather, AirQuality
)
import random
import requests
from datetime import datetime, timedelta, date

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EMPLOYEE_DATA_FILE = os.path.join(BASE_DIR, 'Alias Karyawan.xlsx')
MEDICAL_DATA_FILE = os.path.join(BASE_DIR, 'Dummy Medical Data.xlsx')

def seed_data():
    print("Seeding database...")
    from sqlalchemy import text
    for table, seq in [
        ("employee_assignments", "employee_assignments_id_seq"),
        ("air_quality", "air_quality_id_seq"),
        ("weather", "weather_id_seq"),
        ("work_locations", "work_locations_id_seq"),
        ("health_records", "health_records_id_seq"),
        ("employees", "employees_id_seq"),
        ("diseases", "diseases_id_seq"),
        ("hazards", "hazards_id_seq"),
        ("users", "users_id_seq"),
    ]:
        db.session.execute(text(f"DELETE FROM {table}"))
        db.session.execute(text(f"ALTER SEQUENCE {seq} RESTART WITH 1"))
    db.session.commit()

    seed_work_locations()
    seed_hazards()
    seed_users()
    import_employee_data()
    import_medical_data()
    seed_weather_and_air_quality()
    print("Database seeding completed!")

def seed_work_locations():
    locations = [
        WorkLocation(location_name="Kantor Pusat", city="Surabaya", latitude=-7.2371678363250735, longitude=112.73933699269045),
        WorkLocation(location_name="Perak Barat", city="Surabaya", latitude=-7.231449273619633, longitude=112.72828546626496),
        WorkLocation(location_name="Kalianak", city="Surabaya", latitude=-7.230964164937335, longitude=112.7058541276304),
        WorkLocation(location_name="Cabang Jakarta", city="Jakarta", latitude=-6.110445734514671, longitude=106.8920855806901),
        WorkLocation(location_name="Cabang Balikpapan", city="Balikpapan", latitude=-1.2753420746274544, longitude=116.8187722896864),
        WorkLocation(location_name="Cabang Sampit", city="Sampit", latitude=-2.5529751355733588, longitude=112.94999966042496),
        WorkLocation(location_name="Cabang Banjarmasin", city="Banjarmasin", latitude=-3.321447748621868, longitude=114.58010402393569),
        WorkLocation(location_name="LCE Surabaya", city="Surabaya", latitude=None, longitude=None)
    ]
    db.session.bulk_save_objects(locations)
    db.session.commit()
    print("Seeded work_locations table.")

def seed_hazards():
    hazards = [
        Hazard(hazard_name="Debu Silika", hazard_type="Kimia", description="Paparan debu silika dari proses manufaktur."),
        Hazard(hazard_name="Bising Mesin", hazard_type="Fisik", description="Tingkat kebisingan tinggi dari mesin produksi.")
    ]
    db.session.bulk_save_objects(hazards)
    db.session.commit()
    print("Seeded hazards table.")

def seed_users():
    users = [
        User(username="admin", password_hash="admin_hash_123", email="admin@example.com", role="admin"),
        User(username="user1", password_hash="user1_hash_123", email="user1@example.com", role="user"),
        User(username="user2", password_hash="user2_hash_123", email="user2@example.com", role="user")
    ]
    db.session.bulk_save_objects(users)
    db.session.commit()
    print("Seeded users table.")

def import_employee_data():
    print(f"Memulai impor data dari '{EMPLOYEE_DATA_FILE}' (SQLAlchemy)...")
    try:
        df = pd.read_excel(EMPLOYEE_DATA_FILE)
        df = df.where(pd.notna(df), None)
        for index, row in df.iterrows():
            employee_name = row['Name']
            if not employee_name:
                continue
            # Cari atau buat employee
            employee = Employee.query.filter_by(full_name=employee_name).first()
            if not employee:
                employee = Employee(full_name=employee_name)
                db.session.add(employee)
                db.session.flush()  # agar dapat id
            # Cari atau buat lokasi
            location_name = row['Location']
            location = WorkLocation.query.filter_by(location_name=location_name).first()
            if not location:
                location = WorkLocation(location_name=location_name, city="-", latitude=None, longitude=None)
                db.session.add(location)
                db.session.flush()
            # Tambah assignment
            assignment = EmployeeAssignment(
                employee_id=employee.id,
                work_location_id=location.id,
                department=row.get('Department'),
                division=row.get('Division'),
                position=row.get('Position'),
                level=row.get('Level')
            )
            db.session.add(assignment)
        db.session.commit()
        print("Impor data karyawan selesai.")
    except FileNotFoundError:
        print(f"[ERROR] File '{EMPLOYEE_DATA_FILE}' tidak ditemukan.")
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Terjadi kesalahan saat impor data karyawan: {e}")

def seed_employee_assignments():
    assignments = [
        EmployeeAssignment(employee_id=1, work_location_id=1, department="Manajemen", position="CEO"),
        EmployeeAssignment(employee_id=2, work_location_id=2, department="Produksi", position="Operator"),
        EmployeeAssignment(employee_id=3, work_location_id=2, department="Teknis", position="Mekanik")
    ]
    db.session.bulk_save_objects(assignments)
    db.session.commit()
    print("Seeded employee_assignments table.")
    
def seed_health_records():
    records = [
        HealthRecord(employee_id=2, disease_id=random.choice([1, 2, 3]), record_type="MCU", record_date=datetime.now().date(), due_total=500000, approve=500000),
        HealthRecord(employee_id=2, record_type="Laporan Gejala", record_date=datetime.now().date() - timedelta(days=30), claim_status="Disetujui"),
    ]
    db.session.bulk_save_objects(records)
    db.session.commit()
    print("Seeded health_records table.")

def import_medical_data():
    print(f"Memulai impor data dari '{MEDICAL_DATA_FILE}' (SQLAlchemy)...")
    try:
        df = pd.read_excel(MEDICAL_DATA_FILE)
        df = df.where(pd.notna(df), None)
        for index, row in df.iterrows():
            patient_name = row['ALIAS_PATIENT']
            if not patient_name:
                continue
            # Cari atau buat employee
            employee = Employee.query.filter_by(full_name=patient_name).first()
            if not employee:
                employee = Employee(full_name=patient_name)
                db.session.add(employee)
                db.session.flush()
            # Cari atau buat disease
            disease_name = row['DIAGNOSIS DESC']
            disease = Disease.query.filter_by(disease_name=disease_name).first()
            if not disease:
                disease = Disease(disease_name=disease_name)
                db.session.add(disease)
                db.session.flush()
            # Parse tanggal
            record_date = None
            try:
                val = row['ADMISSION_DATE']
                if val is not None:
                    record_date = pd.to_datetime(val, errors='coerce').date()
            except Exception:
                pass
            def to_numeric_safe(val):
                return pd.to_numeric(val, errors='coerce') if val is not None else None
            health_record = HealthRecord(
                employee_id=employee.id,
                disease_id=disease.id,
                record_type='Klaim PAK',
                record_date=record_date,
                claims_id=row.get('CLAIMS_ID'),
                provider_name=row.get('PROVIDER NAME'),
                due_total=to_numeric_safe(row.get('DUE_TOTAL')),
                approve=to_numeric_safe(row.get('APPROVE')),
                member_pay=to_numeric_safe(row.get('MEMBER PAY')),
                excess_paid=to_numeric_safe(row.get('EXCESS PAID')),
                excess_not_paid=to_numeric_safe(row.get('EXCESS NOT PAID')),
                claim_status=row.get('STATUS'),
                coverage_id=row.get('COVERAGE_ID')
            )
            db.session.add(health_record)
        db.session.commit()
        print("Impor data medis selesai.")
    except FileNotFoundError:
        print(f"[ERROR] File '{MEDICAL_DATA_FILE}' tidak ditemukan.")
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Terjadi kesalahan saat impor data medis: {e}")

def seed_weather_and_air_quality():
    VISUAL_CROSSING_KEY = "4SD5JP775G8EFDF9T5HV7KF2B"
    AQICN_TOKEN = "db81fc42c61c3ed75bf2a98c285470286fc8da51"
    today = date.today().isoformat()
    work_locations = WorkLocation.query.filter(WorkLocation.latitude != None, WorkLocation.longitude != None).all()
    weather_data = []
    air_quality_data = []
    for loc in work_locations:
        lat = float(loc.latitude)
        lon = float(loc.longitude)
        
        weather_url = f"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{lat},{lon}/{today}?unitGroup=metric&key={VISUAL_CROSSING_KEY}&include=days"
        try:
            wresp = requests.get(weather_url)
            wresp.raise_for_status()
            wjson = wresp.json()
            day = wjson['days'][0] if 'days' in wjson and wjson['days'] else None
            if day:
                weather_data.append(Weather(
                    work_location_id=loc.id,
                    temperature=day.get('temp', None),
                    humidity=day.get('humidity', None),
                    wind_speed=day.get('windspeed', None),
                    timestamp=datetime.now()
                ))
        except Exception as e:
            print(f"[Weather] Failed for {loc.location_name}: {e}")

        aq_url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={AQICN_TOKEN}"
        try:
            aqresp = requests.get(aq_url)
            aqresp.raise_for_status()
            aqjson = aqresp.json()
            if aqjson.get('status') == 'ok':
                iaqi = aqjson['data'].get('iaqi', {})
                air_quality_data.append(AirQuality(
                    work_location_id=loc.id,
                    aqi=aqjson['data'].get('aqi', None),
                    pm25=iaqi.get('pm25', {}).get('v', None),
                    pm10=iaqi.get('pm10', {}).get('v', None),
                    co_level=iaqi.get('co', {}).get('v', None),
                    timestamp=datetime.now()
                ))
        except Exception as e:
            print(f"[AQICN] Failed for {loc.location_name}: {e}")

    db.session.bulk_save_objects(weather_data + air_quality_data)
    db.session.commit()
    print("Seeded weather and air_quality tables.")