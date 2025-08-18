from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User, db
from src.models.exercise import WorkoutSession, WorkoutExercise, ExerciseSet, PersonalRecord
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/_deprecated/users', methods=['GET'])
def get_users():
    return jsonify({'message': 'Deprecated: use /api/register, /api/login, /api/me'}), 410

@user_bp.route('/_deprecated/users', methods=['POST'])
def create_user():
    return jsonify({'message': 'Deprecated: use /api/register'}), 410

@user_bp.route('/_deprecated/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    return jsonify({'message': 'Deprecated: use /api/me'}), 410

@user_bp.route('/_deprecated/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    return jsonify({'message': 'Deprecated: use /api/me'}), 410

@user_bp.route('/_deprecated/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    return jsonify({'message': 'Deprecated endpoint'}), 410

@user_bp.route('/users/<int:user_id>/workouts', methods=['GET'])
@jwt_required()
def get_user_workouts(user_id):
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id:
        return jsonify({'message': 'Access denied'}), 403
    
    workouts = WorkoutSession.query.filter_by(user_id=user_id).order_by(WorkoutSession.start_time.desc()).all()
    return jsonify([workout.to_dict() for workout in workouts])

@user_bp.route('/workouts', methods=['POST'])
@jwt_required()
def create_workout():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    workout = WorkoutSession(
        user_id=user_id,
        name=data.get('name', 'Workout'),
        start_time=datetime.utcnow(),
        notes=data.get('notes', '')
    )
    
    db.session.add(workout)
    db.session.commit()
    
    return jsonify(workout.to_dict()), 201

@user_bp.route('/workouts/<int:workout_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_workout(workout_id):
    user_id = int(get_jwt_identity())
    workout = WorkoutSession.query.filter_by(id=workout_id, user_id=user_id).first_or_404()
    
    data = request.get_json() or {}
    
    # For PUT, end the workout now; PATCH only updates fields without ending
    if request.method == 'PUT':
        workout.end_time = datetime.utcnow()
    
    if 'name' in data:
        workout.name = data['name']
    if 'notes' in data:
        workout.notes = data['notes']
    if 'end_time' in data and data['end_time']:
        workout.end_time = datetime.utcnow()
    
    db.session.commit()
    return jsonify(workout.to_dict())

@user_bp.route('/workouts/active', methods=['GET'])
@jwt_required()
def get_active_workout():
    """Return the current user's most recent in-progress workout, or 204 if none."""
    print(f"DEBUG: get_active_workout called")
    try:
        user_id = int(get_jwt_identity())
        print(f"DEBUG: JWT user_id = {user_id}")
        workout = (
            WorkoutSession.query
            .filter_by(user_id=user_id, end_time=None)
            .order_by(WorkoutSession.start_time.desc())
            .first()
        )
        if not workout:
            print(f"DEBUG: No active workout found for user {user_id}")
            return '', 204
        print(f"DEBUG: Found active workout {workout.id} for user {user_id}")
        return jsonify(workout.to_dict())
    except Exception as e:
        print(f"DEBUG: Exception in get_active_workout: {e}")
        raise

@user_bp.route('/workouts/<int:workout_id>/exercises', methods=['POST'])
@jwt_required()
def add_exercise_to_workout(workout_id):
    user_id = int(get_jwt_identity())
    workout = WorkoutSession.query.filter_by(id=workout_id, user_id=user_id).first_or_404()
    
    data = request.get_json()
    exercise_id = data['exercise_id']
    
    # Get the next order number
    max_order = db.session.query(db.func.max(WorkoutExercise.order_in_workout)).filter_by(session_id=workout_id).scalar()
    next_order = (max_order or 0) + 1
    
    workout_exercise = WorkoutExercise(
        session_id=workout_id,
        exercise_id=exercise_id,
        order_in_workout=next_order
    )
    
    db.session.add(workout_exercise)
    db.session.commit()
    
    return jsonify(workout_exercise.to_dict()), 201

@user_bp.route('/workout-exercises/<int:workout_exercise_id>', methods=['DELETE'])
@jwt_required()
def delete_workout_exercise(workout_exercise_id):
    """Delete a workout exercise owned by the current user (cascades sets)."""
    user_id = int(get_jwt_identity())
    we = WorkoutExercise.query.join(WorkoutSession).filter(
        WorkoutExercise.id == workout_exercise_id,
        WorkoutSession.user_id == user_id
    ).first_or_404()
    db.session.delete(we)
    db.session.commit()
    return '', 204

@user_bp.route('/workout-exercises/<int:workout_exercise_id>/sets', methods=['POST'])
@jwt_required()
def add_set_to_exercise(workout_exercise_id):
    user_id = int(get_jwt_identity())
    
    # Verify user owns this workout exercise
    workout_exercise = WorkoutExercise.query.join(WorkoutSession).filter(
        WorkoutExercise.id == workout_exercise_id,
        WorkoutSession.user_id == user_id
    ).first_or_404()
    
    data = request.get_json()
    
    # Get the next set number
    max_set = db.session.query(db.func.max(ExerciseSet.set_number)).filter_by(workout_exercise_id=workout_exercise_id).scalar()
    next_set_number = (max_set or 0) + 1
    
    exercise_set = ExerciseSet(
        workout_exercise_id=workout_exercise_id,
        set_number=next_set_number,
        reps=data.get('reps'),
        weight=data.get('weight'),
        duration=data.get('duration'),
        distance=data.get('distance'),
        rest_time=data.get('rest_time'),
        set_type=data.get('set_type', 'normal'),
        notes=data.get('notes', '')
    )
    
    db.session.add(exercise_set)
    db.session.commit()
    
    return jsonify(exercise_set.to_dict()), 201

@user_bp.route('/sets/<int:set_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_set(set_id):
    user_id = int(get_jwt_identity())
    
    # Verify user owns this set
    exercise_set = ExerciseSet.query.join(WorkoutExercise).join(WorkoutSession).filter(
        ExerciseSet.id == set_id,
        WorkoutSession.user_id == user_id
    ).first_or_404()
    
    data = request.get_json()
    
    if 'reps' in data:
        exercise_set.reps = data['reps']
    if 'weight' in data:
        exercise_set.weight = data['weight']
    if 'duration' in data:
        exercise_set.duration = data['duration']
    if 'distance' in data:
        exercise_set.distance = data['distance']
    if 'rest_time' in data:
        exercise_set.rest_time = data['rest_time']
    if 'notes' in data:
        exercise_set.notes = data['notes']
    
    db.session.commit()
    return jsonify(exercise_set.to_dict())

@user_bp.route('/sets/<int:set_id>', methods=['DELETE'])
@jwt_required()
def delete_set(set_id):
    """Delete a set owned by the current user and renumber remaining sets."""
    user_id = int(get_jwt_identity())
    set_obj = ExerciseSet.query.join(WorkoutExercise).join(WorkoutSession).filter(
        ExerciseSet.id == set_id,
        WorkoutSession.user_id == user_id
    ).first_or_404()
    we_id = set_obj.workout_exercise_id
    db.session.delete(set_obj)
    # Flush so deletion is visible when we fetch remaining sets before commit
    db.session.flush()

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

@user_bp.route('/users/<int:user_id>/personal-records', methods=['GET'])
@jwt_required()
def get_personal_records(user_id):
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id:
        return jsonify({'message': 'Access denied'}), 403
    
    records = PersonalRecord.query.filter_by(user_id=user_id).all()
    return jsonify([record.to_dict() for record in records])
