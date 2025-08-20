import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from src.models.user import db
from src.routes.user import user_bp
from src.routes.exercise import exercise_bp
from src.routes.auth import auth_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
# Use defaults if env vars are unset or empty strings
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'asdf#FGSgvasgf$5$WGT'
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # For development - tokens don't expire

# Initialize JWT
jwt = JWTManager(app)

# JWT error handlers for better debugging
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print(f"DEBUG: Token expired - header: {jwt_header}, payload: {jwt_payload}, auth={request.headers.get('Authorization')}")
    return {'message': 'Token has expired'}, 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"DEBUG: Invalid token error: {error}, auth={request.headers.get('Authorization')}")
    return {'message': f'Invalid token: {error}'}, 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"DEBUG: Missing token error: {error}, auth={request.headers.get('Authorization')}")
    return {'message': f'Authorization token required: {error}'}, 401

# Enable CORS for all routes - simplified approach
CORS(app, origins='*', allow_headers=['Content-Type', 'Authorization'], methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(exercise_bp, url_prefix='/api')

# Database configuration with production support
database_url = os.environ.get('DATABASE_URL') or os.environ.get('POSTGRES_URL')
if database_url:
    # Fix postgres:// -> postgresql:// for SQLAlchemy compatibility
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    print(f"Using PostgreSQL database: {database_url[:50]}...")
else:
    # Development fallback to SQLite
    sqlite_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{sqlite_path}"
    print(f"Using SQLite database: {sqlite_path}")
    
    # Ensure database directory exists for SQLite
    os.makedirs(os.path.dirname(sqlite_path), exist_ok=True)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Import all models to ensure they are registered
from src.models.exercise import Exercise, WorkoutSession, WorkoutExercise, ExerciseSet, PersonalRecord

with app.app_context():
    db.create_all()



    # Distinguish between local SQLite and production Postgres/Neon
    using_postgres = bool(database_url)

    # Local dev convenience: create default user and seed a few basics (SQLite only)
    if not using_postgres:
        # Create default user if it doesn't exist
        from src.models.user import User
        if not User.query.filter_by(username='melanie').first():
            user = User(username='melanie', email='melanie@example.com')
            user.set_password('1234')
            db.session.add(user)
            db.session.commit()
            print("Created default user: melanie/1234")

        # Seed basic exercises if database is empty
        if Exercise.query.count() == 0:
            basic_exercises = [
                {'name': 'Push-ups', 'muscle_group': 'Chest', 'equipment': 'Bodyweight', 'difficulty': 'Beginner'},
                {'name': 'Squats', 'muscle_group': 'Legs', 'equipment': 'Bodyweight', 'difficulty': 'Beginner'},
                {'name': 'Bench Press', 'muscle_group': 'Chest', 'equipment': 'Barbell', 'difficulty': 'Intermediate'},
                {'name': 'Deadlift', 'muscle_group': 'Back', 'equipment': 'Barbell', 'difficulty': 'Advanced'},
                {'name': 'Pull-ups', 'muscle_group': 'Back', 'equipment': 'Bodyweight', 'difficulty': 'Intermediate'},
                {'name': 'Overhead Press', 'muscle_group': 'Shoulders', 'equipment': 'Barbell', 'difficulty': 'Intermediate'},
                {'name': 'Bicep Curls', 'muscle_group': 'Arms', 'equipment': 'Dumbbell', 'difficulty': 'Beginner'},
                {'name': 'Tricep Dips', 'muscle_group': 'Arms', 'equipment': 'Bodyweight', 'difficulty': 'Beginner'},
                {'name': 'Lunges', 'muscle_group': 'Legs', 'equipment': 'Bodyweight', 'difficulty': 'Beginner'},
                {'name': 'Planks', 'muscle_group': 'Core', 'equipment': 'Bodyweight', 'difficulty': 'Beginner'}
            ]
            
            for ex_data in basic_exercises:
                exercise = Exercise(
                    name=ex_data['name'],
                    muscle_group=ex_data['muscle_group'],
                    equipment=ex_data['equipment'],
                    difficulty=ex_data['difficulty'],
                    instructions='{"allowed_fields": ["reps", "weight"]}',
                    is_custom=False
                )
                db.session.add(exercise)
            
            db.session.commit()
            print(f"Seeded {len(basic_exercises)} basic exercises (SQLite dev)")

    # Production-safe: auto-import full Free Exercise DB into Neon/Postgres once if empty
    auto_seed = os.environ.get('AUTO_SEED_IF_EMPTY', '').lower() in ('1', 'true', 'yes')
    if using_postgres and auto_seed:
        count = Exercise.query.count()
        if count == 0:
            try:
                # Importer lives in src/scripts and expects app to exist; import lazily to avoid circulars
                from src.scripts.import_free_exercise_db import load_dataset, import_exercises
                local_path = os.path.join(os.path.dirname(__file__), 'data', 'free-exercise-db', 'exercises.json')
                data = load_dataset(local_path, download=False)
                summary = import_exercises(data, commit_every=200)
                print(
                    f"Auto-seeded Free Exercise DB into Postgres -> inserted: {summary['inserted']}, "
                    f"skipped: {summary['skipped_dupe']}, updated_difficulty: {summary['updated_difficulty']}"
                )
            except Exception as e:
                print(f"Auto-seed failed: {e}")
        else:
            print(f"Skipping auto-seed: database already has {count} exercises.")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
