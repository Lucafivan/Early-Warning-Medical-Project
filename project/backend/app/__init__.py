from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Inisialisasi objek SQLAlchemy
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Konfigurasi koneksi ke PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:alfanmahdi20@localhost:5432/early_warning'  # Ganti password sesuai kebutuhan
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inisialisasi SQLAlchemy dan Migrate
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import dan daftarkan rute di dalam factory
    from .routes import configure_routes
    from . import models
    from .seeder import seed_data

    @app.cli.command("seed")
    def seed_command():
        """Isi database dengan data dummy."""
        with app.app_context():
            seed_data()
            print("Database seeded successfully!")

    configure_routes(app)

    return app
