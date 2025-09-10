from . import db
from .models import (
    WorkLocation, Hazard, Disease, User,
    Employee, EmployeeAssignment, HealthRecord,
    Weather, AirQuality
)
from flask import jsonify, request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from datetime import date

main_bp = Blueprint('main_bp', __name__)
user_bp = Blueprint("user", __name__)

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
            'city': loc.city,
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
            'timestamp': weather.timestamp
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

@main_bp.route('/dashboard_top_diseases', methods=['GET'])
def get_dashboard_top_diseases():
    try:
        limit = int(request.args.get('limit', 10))
        if limit < 1:
            limit = 1
        elif limit > 50:
            limit = 50
    except (ValueError, TypeError):
        limit = 10

    results = (
        db.session.query(
            HealthRecord.disease_id,
            func.count(HealthRecord.id).label('count'),
            Disease.disease_name
        )
        .join(Disease, HealthRecord.disease_id == Disease.id)
        .group_by(HealthRecord.disease_id, Disease.disease_name)
        .order_by(func.count(HealthRecord.id).desc())
        .limit(limit)
        .all()
    )
    output = [
        {
            'disease_id': r.disease_id,
            'disease_name': r.disease_name,
            'count': r.count
        }
        for r in results
    ]
    return jsonify(output)

@main_bp.route('/dashboard_weather', methods=['GET'])
@jwt_required()
def get_dashboard_weather():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    employee = Employee.query.filter_by(user_id=user.id).first()
    if not employee:
        return jsonify({'error': 'Employee not found'}), 404

    assignment = EmployeeAssignment.query.filter_by(employee_id=employee.id).first()
    if not assignment:
        return jsonify({'error': 'Employee assignment not found'}), 404

    work_location_id = assignment.work_location_id
    weather = Weather.query.filter_by(work_location_id=work_location_id).order_by(Weather.timestamp.desc()).first()
    air_quality = AirQuality.query.filter_by(work_location_id=work_location_id).order_by(AirQuality.timestamp.desc()).first()

    result = {
        'weather': {
            'temperature': weather.temperature if weather else None,
            'humidity': weather.humidity if weather else None,
            'wind_speed': weather.wind_speed if weather else None,
            'timestamp': weather.timestamp if weather else None
        } if weather else None,
        'air_quality': {
            'aqi': air_quality.aqi if air_quality else None,
            'pm25': air_quality.pm25 if air_quality else None,
            'pm10': air_quality.pm10 if air_quality else None,
            'co_level': air_quality.co_level if air_quality else None,
            'timestamp': air_quality.timestamp if air_quality else None
        } if air_quality else None
    }
    return jsonify(result)

@main_bp.route('/health_record', methods=['POST'])
def create_health_record():
    data = request.get_json()
    record_type = data.get('record_type')
    provider = data.get('provider')
    principle_name = data.get('principle_name')
    disease_name = data.get('disease_name')

    disease = Disease.query.filter_by(disease_name=disease_name).first()
    if not disease:
        disease = Disease(disease_name=disease_name)
        db.session.add(disease)
        db.session.flush()

    employee = Employee.query.filter_by(full_name=principle_name).first()
    if not employee:
        employee = Employee(full_name=principle_name)
        db.session.add(employee)
        db.session.flush()

    last_record = HealthRecord.query.order_by(HealthRecord.id.desc()).first()
    last_claims_id = last_record.claims_id if last_record and last_record.claims_id is not None else 0
    claims_id = last_claims_id + 2

    health_record = HealthRecord(
        employee_id=employee.id,
        disease_id=disease.id,
        record_type=record_type,
        record_date=date.today(),
        claims_id=claims_id,
        provider_name=provider,
        due_total=None,
        approve=None,
        member_pay=None,
        excess_paid=None,
        excess_not_paid=None,
        claim_status=None,
        coverage_id=None
    )
    db.session.add(health_record)
    db.session.commit()
    return jsonify({'message': 'Health record created', 'id': health_record.id}), 201


@user_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    # Update username
    if "username" in data and data["username"]:
        existing_user = User.query.filter_by(username=data["username"]).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({"error": "Username already taken"}), 400
        user.username = data["username"]

    # Update email
    if "email" in data and data["email"]:
        existing_email = User.query.filter_by(email=data["email"]).first()
        if existing_email and existing_email.id != user.id:
            return jsonify({"error": "Email already in use"}), 400
        user.email = data["email"]

    # Update password
    if "password" in data and data["password"]:
        if "confirm_password" not in data or data["password"] != data["confirm_password"]:
            return jsonify({"error": "Password confirmation does not match"}), 400
        user.set_password(data["password"])

    db.session.commit()

    return jsonify({
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at
        }
    }), 200

