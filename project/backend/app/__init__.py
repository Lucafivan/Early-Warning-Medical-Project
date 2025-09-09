import os
from datetime import timedelta
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

# Memuat variabel lingkungan dari file .env
load_dotenv()

# Inisialisasi objek SQLAlchemy
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()
BLOCKLIST = set()

def create_app():
    app = Flask(__name__)

    # Konfigurasi
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key-yang-tidak-aman')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://user:pass@host/db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'fallback-jwt-secret-key-yang-tidak-aman')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

    app.config["JWT_BLACKLIST_ENABLED"] = True
    app.config["JWT_BLACKLIST_TOKEN_CHECKS"] = ["access", "refresh"]

    # Inisialisasi ekstensi dengan aplikasi
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    with app.app_context():
        # Import dan daftarkan rute
        from .routes import main_bp, user_bp
        from .auth_routes import auth_bp
        from . import models
        from .seeder import seed_data

        @jwt.token_in_blocklist_loader
        def check_if_token_in_blocklist(jwt_header, jwt_payload):
            jti = jwt_payload["jti"]
            return jti in BLOCKLIST

        app.register_blueprint(main_bp)
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(user_bp, url_prefix='/users') 

        @app.cli.command("seed")
        def seed_command():
            """Isi database dengan data dummy."""
            with app.app_context():
                seed_data()
                print("Database seeded successfully!")

    return app
