import pandas as pd
from . import db
import os
from .models import (
    WorkLocation, Disease,
    Employee, EmployeeAssignment, HealthRecord
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'hasil_gabungan_final.csv')

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

    import_employee_and_medical_data()

def import_employee_and_medical_data():
    print(f"Memulai impor data dari '{DATA_FILE}' (SQLAlchemy)...")
    try:
        df = pd.read_csv(DATA_FILE)
        df = df.where(pd.notna(df) & (df != ''), None)
        for _, row in df.iterrows():
            # 1. Employee
            employee = Employee.query.filter_by(full_name=row['Name']).first()
            if not employee:
                employee = Employee(full_name=row['Name'])
                db.session.add(employee)
                db.session.flush()

            # 2. Disease
            disease = Disease.query.filter_by(disease_name=row['DIAGNOSIS DESC']).first()
            if not disease:
                disease = Disease(disease_name=row['DIAGNOSIS DESC'])
                db.session.add(disease)
                db.session.flush()

            # 3. WorkLocation
            location = WorkLocation.query.filter_by(location_name=row['Office Location']).first()
            if not location:
                location = WorkLocation(
                    location_name=row['Office Location'],
                    latitude=row['lat'],
                    longitude=row['lon']
                )
                db.session.add(location)
                db.session.flush()

            # 4. EmployeeAssignment
            assignment = EmployeeAssignment.query.filter_by(
                employee_id=employee.id,
                work_location_id=location.id,
                department=row['Department'],
                division=row['Division'],
                position=row['Position'],
                level=row['Level']
            ).first()
            if not assignment:
                assignment = EmployeeAssignment(
                    employee_id=employee.id,
                    work_location_id=location.id,
                    department=row['Department'],
                    division=row['Division'],
                    position=row['Position'],
                    level=row['Level']
                )
                db.session.add(assignment)

            # 5. HealthRecord
            admission_date = pd.to_datetime(row['ADMISSION_DATE'], errors='coerce')
            health_record = HealthRecord.query.filter_by(claims_id=row['CLAIMS_ID']).first()
            if not health_record:
                health_record = HealthRecord(
                    claims_id=row['CLAIMS_ID'],
                    employee_id=employee.id,
                    disease_id=disease.id,
                    admission_date=admission_date.date() if pd.notna(admission_date) else None,
                    provider_name=row.get('PROVIDER NAME'),
                    due_total=row.get('DUE_TOTAL'),
                    approve=row.get('APPROVE'),
                    member_pay=row.get('MEMBER PAY'),
                    status=row.get('STATUS'),
                    duration_stay=row.get('DURATION_STAY'),
                    daily_cases=row.get('DAILY_CASES'),
                    high_risk=row.get('HIGH_RISK')
                )
                db.session.add(health_record)

        db.session.commit()
        print('Impor data employee dan medical selesai.')
    except FileNotFoundError:
        print(f"[ERROR] File '{DATA_FILE}' tidak ditemukan.")
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Terjadi kesalahan saat impor data: {e}")
