from flask import jsonify, request
from .__init__ import db
from .models import WorkLocation

def configure_routes(app):
    @app.route('/')
    def index():
        return "Selamat datang di API Early Warning System!"

    @app.route('/locations', methods=['GET'])
    def get_locations():
        locations = WorkLocation.query.all()
        output = []
        for loc in locations:
            output.append({
                'id': loc.id,
                'name': loc.location_name,
                'address': loc.address
            })
        return jsonify(output)