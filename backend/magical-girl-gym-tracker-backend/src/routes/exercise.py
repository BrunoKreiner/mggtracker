from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.exercise import Exercise, WorkoutSession, WorkoutExercise, ExerciseSet, PersonalRecord
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity

exercise_bp = Blueprint('exercise', __name__)

@exercise_bp.route('/exercises', methods=['GET'])
def get_exercises():
    """Get all exercises with optional filtering"""
    muscle_group = request.args.get('muscle_group')
    equipment = request.args.get('equipment')
    search = request.args.get('search')
    
    query = Exercise.query
    
    if muscle_group:
        query = query.filter(Exercise.muscle_group.ilike(f'%{muscle_group}%'))
    
    if equipment:
        query = query.filter(Exercise.equipment.ilike(f'%{equipment}%'))
    
    if search:
        query = query.filter(Exercise.name.ilike(f'%{search}%'))
    
    exercises = query.all()
    return jsonify([exercise.to_dict() for exercise in exercises])

@exercise_bp.route('/exercises/<int:exercise_id>', methods=['GET'])
def get_exercise(exercise_id):
    """Get a specific exercise by ID"""
    exercise = Exercise.query.get_or_404(exercise_id)
    return jsonify(exercise.to_dict())

@exercise_bp.route('/exercises', methods=['POST'])
@jwt_required()
def create_exercise():
    """Create a new custom exercise (auth required)"""
    data = request.get_json() or {}

    user_id = int(get_jwt_identity())

    exercise = Exercise(
        name=data['name'],
        description=data.get('description'),
        muscle_group=data['muscle_group'],
        equipment=data.get('equipment'),
        instructions=data.get('instructions'),
        is_custom=True,
        created_by=user_id
    )
    
    db.session.add(exercise)
    db.session.commit()
    
    return jsonify(exercise.to_dict()), 201

@exercise_bp.route('/_deprecated/workouts', methods=['POST'])
def start_workout():
    """Start a new workout session"""
    data = request.get_json()
    
    workout = WorkoutSession(
        user_id=data['user_id'],
        name=data.get('name', 'Workout'),
        start_time=datetime.utcnow(),
        notes=data.get('notes')
    )
    
    db.session.add(workout)
    db.session.commit()
    
    return jsonify(workout.to_dict()), 201

@exercise_bp.route('/_deprecated/workouts/<int:workout_id>', methods=['PUT'])
def end_workout(workout_id):
    """End a workout session"""
    workout = WorkoutSession.query.get_or_404(workout_id)
    workout.end_time = datetime.utcnow()
    
    data = request.get_json()
    if data and 'notes' in data:
        workout.notes = data['notes']
    
    db.session.commit()
    return jsonify(workout.to_dict())

@exercise_bp.route('/_deprecated/workouts/<int:workout_id>', methods=['PATCH'])
def update_workout(workout_id):
    """Update workout fields (e.g., notes) without ending the workout"""
    workout = WorkoutSession.query.get_or_404(workout_id)
    data = request.get_json() or {}
    if 'notes' in data:
        workout.notes = data['notes']
    db.session.commit()
    return jsonify(workout.to_dict())

@exercise_bp.route('/_deprecated/workouts/<int:workout_id>/exercises', methods=['POST'])
def add_exercise_to_workout(workout_id):
    """Add an exercise to a workout session"""
    data = request.get_json()
    
    workout_exercise = WorkoutExercise(
        session_id=workout_id,
        exercise_id=data['exercise_id'],
        order_in_workout=data.get('order_in_workout', 1)
    )
    
    db.session.add(workout_exercise)
    db.session.commit()
    
    return jsonify(workout_exercise.to_dict()), 201

@exercise_bp.route('/_deprecated/workout-exercises/<int:workout_exercise_id>/sets', methods=['POST'])
def add_set_to_exercise(workout_exercise_id):
    """Add a set to a workout exercise"""
    data = request.get_json()
    
    exercise_set = ExerciseSet(
        workout_exercise_id=workout_exercise_id,
        set_number=data['set_number'],
        reps=data.get('reps'),
        weight=data.get('weight'),
        duration=data.get('duration'),
        distance=data.get('distance'),
        rest_time=data.get('rest_time'),
        set_type=data.get('set_type', 'normal'),
        notes=data.get('notes')
    )
    
    db.session.add(exercise_set)
    db.session.commit()
    
    return jsonify(exercise_set.to_dict()), 201

@exercise_bp.route('/_deprecated/workout-exercises/<int:workout_exercise_id>', methods=['DELETE'])
def delete_workout_exercise(workout_exercise_id):
    """Delete a workout exercise (and cascade delete its sets)"""
    we = WorkoutExercise.query.get_or_404(workout_exercise_id)
    db.session.delete(we)
    db.session.commit()
    return '', 204

@exercise_bp.route('/_deprecated/sets/<int:set_id>', methods=['DELETE'])
def delete_set(set_id):
    """Delete a single set and renumber remaining sets for that workout exercise"""
    set_obj = ExerciseSet.query.get_or_404(set_id)
    we_id = set_obj.workout_exercise_id
    db.session.delete(set_obj)
    # Flush so the deletion is visible when we fetch remaining sets before committing
    db.session.flush()

    # Renumber remaining sets to keep set_number consecutive starting at 1
    remaining = (
        ExerciseSet.query
        .filter_by(workout_exercise_id=we_id)
        .order_by(ExerciseSet.set_number.asc())
        .all()
    )
    for idx, s in enumerate(remaining, start=1):
        s.set_number = idx

    db.session.commit()
    return '', 204

@exercise_bp.route('/_deprecated/sets/<int:set_id>', methods=['PUT', 'PATCH'])
def update_set(set_id):
    """Update a single set's fields"""
    set_obj = ExerciseSet.query.get_or_404(set_id)
    data = request.get_json() or {}
    for field in ['reps', 'weight', 'duration', 'distance', 'rest_time', 'set_type', 'notes']:
        if field in data:
            setattr(set_obj, field, data[field])
    db.session.commit()
    return jsonify(set_obj.to_dict())

@exercise_bp.route('/_deprecated/users/<int:user_id>/workouts', methods=['GET'])
def get_user_workouts(user_id):
    """Get all workouts for a user"""
    workouts = WorkoutSession.query.filter_by(user_id=user_id).order_by(WorkoutSession.start_time.desc()).all()
    return jsonify([workout.to_dict() for workout in workouts])

@exercise_bp.route('/_deprecated/users/<int:user_id>/personal-records', methods=['GET'])
def get_personal_records(user_id):
    """Get personal records for a user"""
    records = PersonalRecord.query.filter_by(user_id=user_id).all()
    return jsonify([record.to_dict() for record in records])

@exercise_bp.route('/muscle-groups', methods=['GET'])
def get_muscle_groups():
    """Get all available muscle groups"""
    muscle_groups = db.session.query(Exercise.muscle_group).distinct().all()
    return jsonify([group[0] for group in muscle_groups if group[0]])

@exercise_bp.route('/equipment', methods=['GET'])
def get_equipment():
    """Get all available equipment types"""
    equipment = db.session.query(Exercise.equipment).distinct().all()
    return jsonify([eq[0] for eq in equipment if eq[0]])
