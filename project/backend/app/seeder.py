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
        WorkLocation(location_name="Kantor Pusat", address="Jl. Jend. Sudirman No. 1", latitude=-6.2088, longitude=106.8456),
        WorkLocation(location_name="Pabrik Surabaya", address="Jl. Raya Kalirungkut No. 50", latitude=-7.2917, longitude=112.7937),
        WorkLocation(location_name="Gudang Bekasi", address="Jl. Narogong Km 10", latitude=-6.2372, longitude=106.9753)
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