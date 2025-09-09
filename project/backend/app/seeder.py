from . import db
from .models import (
    WorkLocation, Hazard, Disease, User,
    Employee, EmployeeAssignment, HealthRecord,
    Weather, AirQuality
)
import random
from datetime import datetime, timedelta

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
    seed_diseases()
    seed_users()
    seed_employees()
    seed_employee_assignments()
    seed_health_records()
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

def seed_diseases():
    diseases = [
        Disease(disease_name="Silikosis"),
        Disease(disease_name="Tinnitus"),
        Disease(disease_name="Asma Kerja")
    ]
    db.session.bulk_save_objects(diseases)
    db.session.commit()
    print("Seeded diseases table.")

def seed_users():
    users = [
        User(username="admin", password_hash="admin_hash_123", email="admin@example.com", role="admin"),
        User(username="user1", password_hash="user1_hash_123", email="user1@example.com", role="user"),
        User(username="user2", password_hash="user2_hash_123", email="user2@example.com", role="user")
    ]
    db.session.bulk_save_objects(users)
    db.session.commit()
    print("Seeded users table.")
    
def seed_employees():
    employees = [
        Employee(full_name="Budi Santoso", user_id=1),
        Employee(full_name="Ani Wijaya", user_id=2),
        Employee(full_name="Joko Susanto", user_id=3)
    ]
    db.session.bulk_save_objects(employees)
    db.session.commit()
    print("Seeded employees table.")

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

def seed_weather_and_air_quality():
    weather_data = [
        Weather(work_location_id=1, temperature=28.5, humidity=75.2, wind_speed=10.1, timestamp=datetime.now()),
        Weather(work_location_id=2, temperature=30.1, humidity=70.5, wind_speed=8.7, timestamp=datetime.now())
    ]
    air_quality_data = [
        AirQuality(work_location_id=1, aqi=55.0, pm25=15.5, pm10=25.0, co_level=2.1, timestamp=datetime.now()),
        AirQuality(work_location_id=2, aqi=82.0, pm25=25.8, pm10=35.5, co_level=3.5, timestamp=datetime.now())
    ]
    db.session.bulk_save_objects(weather_data + air_quality_data)
    db.session.commit()
    print("Seeded weather and air_quality tables.")