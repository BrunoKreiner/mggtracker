from src.models.user import db

class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    muscle_group = db.Column(db.String(50), nullable=False)
    equipment = db.Column(db.String(50))
    difficulty = db.Column(db.String(20))  # beginner, intermediate, advanced
    instructions = db.Column(db.Text)
    is_custom = db.Column(db.Boolean, default=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    
    def __repr__(self):
        return f'<Exercise {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'muscle_group': self.muscle_group,
            'equipment': self.equipment,
            'difficulty': self.difficulty,
            'instructions': self.instructions,
            'is_custom': self.is_custom,
            'created_by': self.created_by
        }

class WorkoutSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100))
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    
    # Relationships
    user = db.relationship('User', backref='workout_sessions')
    exercises = db.relationship('WorkoutExercise', backref='session', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<WorkoutSession {self.id} - {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'notes': self.notes,
            'exercises': [exercise.to_dict() for exercise in self.exercises]
        }

class WorkoutExercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('workout_session.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercise.id'), nullable=False)
    order_in_workout = db.Column(db.Integer, nullable=False)
    
    # Relationships
    exercise = db.relationship('Exercise')
    sets = db.relationship('ExerciseSet', backref='workout_exercise', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<WorkoutExercise {self.exercise.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'exercise_id': self.exercise_id,
            'exercise': self.exercise.to_dict() if self.exercise else None,
            'order_in_workout': self.order_in_workout,
            'sets': [set_obj.to_dict() for set_obj in self.sets]
        }

class ExerciseSet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    workout_exercise_id = db.Column(db.Integer, db.ForeignKey('workout_exercise.id'), nullable=False)
    set_number = db.Column(db.Integer, nullable=False)
    reps = db.Column(db.Integer)
    weight = db.Column(db.Float)
    duration = db.Column(db.Integer)  # in seconds, for time-based exercises
    distance = db.Column(db.Float)  # for cardio exercises
    rest_time = db.Column(db.Integer)  # in seconds
    set_type = db.Column(db.String(20), default='normal')  # normal, warmup, dropset, superset
    notes = db.Column(db.Text)
    
    def __repr__(self):
        return f'<ExerciseSet {self.set_number}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'workout_exercise_id': self.workout_exercise_id,
            'set_number': self.set_number,
            'reps': self.reps,
            'weight': self.weight,
            'duration': self.duration,
            'distance': self.distance,
            'rest_time': self.rest_time,
            'set_type': self.set_type,
            'notes': self.notes
        }

class PersonalRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercise.id'), nullable=False)
    record_type = db.Column(db.String(20), nullable=False)  # max_weight, max_reps, max_volume
    value = db.Column(db.Float, nullable=False)
    achieved_date = db.Column(db.DateTime, nullable=False)
    workout_session_id = db.Column(db.Integer, db.ForeignKey('workout_session.id'))
    
    # Relationships
    user = db.relationship('User', backref='personal_records')
    exercise = db.relationship('Exercise')
    
    def __repr__(self):
        return f'<PersonalRecord {self.exercise.name} - {self.record_type}: {self.value}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'exercise_id': self.exercise_id,
            'exercise': self.exercise.to_dict() if self.exercise else None,
            'record_type': self.record_type,
            'value': self.value,
            'achieved_date': self.achieved_date.isoformat() if self.achieved_date else None,
            'workout_session_id': self.workout_session_id
        }

