from . import db, bcrypt
from datetime import datetime
from sqlalchemy import UniqueConstraint

class WorkLocation(db.Model):
    __tablename__ = 'work_locations'
    id = db.Column(db.Integer, primary_key=True)
    location_name = db.Column(db.String(150), nullable=False, unique=True)
    latitude = db.Column(db.Numeric(18, 15))
    longitude = db.Column(db.Numeric(18, 15))

class Hazard(db.Model):
    __tablename__ = 'hazards'
    id = db.Column(db.Integer, primary_key=True)
    hazard_name = db.Column(db.String(150), nullable=False)
    hazard_type = db.Column(db.String(50))
    description = db.Column(db.Text)

class Disease(db.Model):
    __tablename__ = 'diseases'
    id = db.Column(db.Integer, primary_key=True)
    disease_name = db.Column(db.String(255), nullable=False, unique=True)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), unique=True)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.now)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    full_name = db.Column(db.String(100), nullable=False, unique=True)

class EmployeeAssignment(db.Model):
    __tablename__ = 'employee_assignments'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id', ondelete='CASCADE'), nullable=False)
    work_location_id = db.Column(db.Integer, db.ForeignKey('work_locations.id'))
    department = db.Column(db.String(100))
    division = db.Column(db.String(100))
    position = db.Column(db.String(100))
    level = db.Column(db.String(50))

    __table_args__ = (
        UniqueConstraint('employee_id', 'work_location_id', 'department', 'division', 'position', 'level', name='uq_employee_assignment'),
    )

class HealthRecord(db.Model):
    __tablename__ = 'health_records'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id', ondelete='CASCADE'), nullable=False)
    disease_id = db.Column(db.Integer, db.ForeignKey('diseases.id'))
    claims_id = db.Column(db.BigInteger)
    admission_date = db.Column(db.Date)
    provider_name = db.Column(db.String(255))
    due_total = db.Column(db.Numeric)
    approve = db.Column(db.Numeric)
    member_pay = db.Column(db.Numeric)
    status = db.Column(db.String(50))
    duration_stay = db.Column(db.Integer)
    daily_cases = db.Column(db.Integer)
    high_risk = db.Column(db.Integer)

class Weather(db.Model):
    __tablename__ = 'weather'
    id = db.Column(db.Integer, primary_key=True)
    work_location_id = db.Column(db.Integer, db.ForeignKey('work_locations.id'), nullable=False)
    min_temperature = db.Column(db.Float)
    max_temperature = db.Column(db.Float)
    average_temperature = db.Column(db.Float)
    weather_condition = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.now, nullable=False)

class AirQuality(db.Model):
    __tablename__ = 'air_quality'
    id = db.Column(db.Integer, primary_key=True)
    work_location_id = db.Column(db.Integer, db.ForeignKey('work_locations.id'), nullable=False)
    air_quality_index = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=datetime.now, nullable=False)
