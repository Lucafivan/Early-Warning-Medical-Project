from flask import jsonify, request, Blueprint
from . import db
from .models import AirQuality, Disease, Employee, EmployeeAssignment, Hazard, HealthRecord, User, Weather, WorkLocation
from flask_jwt_extended import jwt_required

main_bp = Blueprint('main_bp', __name__)

@main_bp.route('/')
def index():
    return "Selamat datang di API Early Warning System!"

@main_bp.route('/work_locations', methods=['GET'])
def get_locations():
    locations = WorkLocation.query.all()
    output = []
    for loc in locations:
        output.append({
            'id': loc.id,
            'name': loc.location_name,
            'address': loc.address,
            'latitude': loc.latitude,
            'longitude': loc.longitude
        })
    return jsonify(output)

@main_bp.route('/hazards', methods=['GET'])
def get_hazards():
    hazards = Hazard.query.all()
    output = []
    for haz in hazards:
        output.append({
            'id': haz.id,
            'hazard_name': haz.hazard_name,
            'hazard_type': haz.hazard_type,
            'description': haz.description,
            'exposure_limit': haz.exposure_limit
        })
    return jsonify(output)

@main_bp.route('/diseases', methods=['GET'])
def get_diseases():
    diseases = Disease.query.all()
    output = []
    for dis in diseases:
        output.append({
            'id': dis.id,
            'disease_name': dis.disease_name
        })
    return jsonify(output)

@main_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    output = []
    for user in users:
        output.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'created_at': user.created_at
        })
    return jsonify(output)

@main_bp.route('/employees', methods=['GET'])
def get_employees():
    employees = Employee.query.all()
    output = []
    for emp in employees:
        output.append({
            'id': emp.id,
            'user_id': emp.user_id,
            'full_name': emp.full_name
        })
    return jsonify(output)

@main_bp.route('/employee_assignments', methods=['GET'])
def get_employee_assignments():
    employee_assignments = EmployeeAssignment.query.all()
    output = []
    for ea in employee_assignments:
        output.append({
            'id': ea.id,
            'employee_id': ea.employee_id,
            'work_location_id': ea.work_location_id,
            'department': ea.department,
            'division': ea.division,
            'position': ea.position,
            'level': ea.level
        })
    return jsonify(output)

@main_bp.route('/health_records', methods=['GET'])
def get_health_records():
    health_records = HealthRecord.query.all()
    output = []
    for hr in health_records:
        output.append({
            'id': hr.id,
            'employee_id': hr.employee_id,
            'disease_id': hr.disease_id,
            'record_type': hr.record_type,
            'record_date': hr.record_date,
            'claims_id': hr.claims_id,
            'provider_name': hr.provider_name,
            'due_total': hr.due_total,
            'approve': hr.approve,
            'member_pay': hr.member_pay,
            'excess_paid': hr.excess_paid,
            'excess_not_paid': hr.excess_not_paid,
            'claim_status': hr.claim_status,
            'coverage_id': hr.coverage_id
        })
    return jsonify(output)

@main_bp.route('/weather', methods=['GET'])
def get_weather():
    weather_data = Weather.query.all()
    output = []
    for weather in weather_data:
        output.append({
            'id': weather.id,
            'work_location_id': weather.work_location_id,
            'temperature': weather.temperature,
            'humidity': weather.humidity,
            'wind_speed': weather.wind_speed,
            'precipitation': weather.precipitation
        })
    return jsonify(output)

@main_bp.route('/air_quality', methods=['GET'])
def get_air_quality():
    air_quality = AirQuality.query.all()
    output = []
    for aq in air_quality:
        output.append({
            'id': aq.id,
            'work_location_id': aq.work_location_id,
            'aqi': aq.aqi,
            'pm25': aq.pm25,
            'pm10': aq.pm10,
            'co_level': aq.co_level,
            'timestamp': aq.timestamp
        })
    return jsonify(output)
