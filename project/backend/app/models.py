from . import db

class WorkLocation(db.Model):
    __tablename__ = 'work_locations'
    id = db.Column(db.Integer, primary_key=True)
    location_name = db.Column(db.String(150), nullable=False, unique=True)
    address = db.Column(db.Text)
    latitude = db.Column(db.Numeric(9, 6))
    longitude = db.Column(db.Numeric(9, 6))

class Hazard(db.Model):
    __tablename__ = 'hazards'
    id = db.Column(db.Integer, primary_key=True)
    hazard_name = db.Column(db.String(150), nullable=False)
    hazard_type = db.Column(db.String(50))
    description = db.Column(db.Text)
    exposure_limit = db.Column(db.Numeric)

class Disease(db.Model):
    __tablename__ = 'diseases'
    id = db.Column(db.Integer, primary_key=True)
    disease_name = db.Column(db.String(255), nullable=False, unique=True)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100))
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    full_name = db.Column(db.String(100), nullable=False)

class EmployeeAssignment(db.Model):
    __tablename__ = 'employee_assignments'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id', ondelete='CASCADE'), nullable=False)
    work_location_id = db.Column(db.Integer, db.ForeignKey('work_locations.id'), nullable=False)
    department = db.Column(db.String(100))
    division = db.Column(db.String(100))
    position = db.Column(db.String(100))
    level = db.Column(db.String(50))

class HealthRecord(db.Model):
    __tablename__ = 'health_records'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id', ondelete='CASCADE'), nullable=False)
    disease_id = db.Column(db.Integer, db.ForeignKey('diseases.id'))
    record_type = db.Column(db.String(50))
    record_date = db.Column(db.Date)
    claims_id = db.Column(db.BigInteger)
    provider_name = db.Column(db.String(255))
    due_total = db.Column(db.Numeric)
    approve = db.Column(db.Numeric)
    member_pay = db.Column(db.Numeric)
    excess_paid = db.Column(db.Numeric)
    excess_not_paid = db.Column(db.Numeric)
    claim_status = db.Column(db.String(50))
    coverage_id = db.Column(db.String(20))

class Weather(db.Model):
    __tablename__ = 'weather'
    id = db.Column(db.Integer, primary_key=True)
    work_location_id = db.Column(db.Integer, db.ForeignKey('work_locations.id'), nullable=False)
    temperature = db.Column(db.Float)
    humidity = db.Column(db.Float)
    wind_speed = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

class AirQuality(db.Model):
    __tablename__ = 'air_quality'
    id = db.Column(db.Integer, primary_key=True)
    work_location_id = db.Column(db.Integer, db.ForeignKey('work_locations.id'), nullable=False)
    aqi = db.Column(db.Float)
    pm25 = db.Column(db.Float)
    pm10 = db.Column(db.Float)
    co_level = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())