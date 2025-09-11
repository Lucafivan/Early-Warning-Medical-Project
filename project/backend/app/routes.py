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
            'location_name': loc.location_name,
            'latitude': float(loc.latitude) if loc.latitude is not None else None,
            'longitude': float(loc.longitude) if loc.longitude is not None else None
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
            'description': haz.description
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
            'claims_id': hr.claims_id,
            'admission_date': hr.admission_date,
            'provider_name': hr.provider_name,
            'due_total': hr.due_total,
            'approve': hr.approve,
            'member_pay': hr.member_pay,
            'status': hr.status,
            'duration_stay': hr.duration_stay,
            'daily_cases': hr.daily_cases,
            'high_risk': hr.high_risk
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
            'min_temperature': weather.min_temperature,
            'max_temperature': weather.max_temperature,
            'average_temperature': weather.average_temperature,
            'weather_condition': weather.weather_condition,
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
            'air_quality_index': aq.air_quality_index,
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
        'work_location': {
            'id': work_location_id,
        },
        'weather': {
            'min_temperature': weather.min_temperature if weather else None,
            'max_temperature': weather.max_temperature if weather else None,
            'average_temperature': weather.average_temperature if weather else None,
            'weather_condition': weather.weather_condition if weather else None,
            'timestamp': weather.timestamp if weather else None
        } if weather else None,
        'air_quality': {
            'air_quality_index': air_quality.air_quality_index if air_quality else None,
            'timestamp': air_quality.timestamp if air_quality else None
        } if air_quality else None
    }
    return jsonify(result)

@main_bp.route('/early_warning', methods=['GET'])
def get_early_warning():
    return jsonify({'message': 'Early warning endpoint under construction'}), 501

@main_bp.route('/health_record', methods=['POST'])
@jwt_required()
def create_health_record():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    employee = Employee.query.filter_by(user_id=user.id).first()
    if not employee:
        return jsonify({'error': 'Employee not found'}), 404
    
    disease = Disease.query.filter_by(disease_name=disease_name).first()
    if not disease:
        disease = Disease(disease_name=disease_name)
        db.session.add(disease)
        db.session.flush()

    last_record = HealthRecord.query.order_by(HealthRecord.id.desc()).first()
    last_claims_id = last_record.claims_id if last_record and last_record.claims_id is not None else 0
    claims_id = last_claims_id + 2

    data = request.get_json()
    provider = data.get('provider')
    disease_name = data.get('disease_name')

    health_record = HealthRecord(
        employee_id=employee.id,
        disease_id=disease.id,
        claims_id=claims_id,
        admission_date=date.today(),
        provider_name=provider,
        due_total=None,
        approve=None,
        member_pay=None,
        status=None,
        duration_stay=None,
        daily_cases=None,
        high_risk=None
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
