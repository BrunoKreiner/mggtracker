#!/usr/bin/env python3
"""
Production-safe seeding script: Only imports exercises if database is empty.
Safe to run multiple times - will not duplicate data.
"""
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db
from src.models.exercise import Exercise
from src.scripts.import_free_exercise_db import load_dataset, import_exercises

def seed_if_empty():
    """Import exercises only if database is empty (production-safe)"""
    
    with app.app_context():
        exercise_count = Exercise.query.count()
        
        if exercise_count > 0:
            print(f"Database already has {exercise_count} exercises. Skipping import.")
            return
        
        print("Database is empty. Loading Free Exercise DB from local files...")
        
        # Use the existing importer's load_dataset function with local path
        local_path = "src/data/free-exercise-db/exercises.json"
        data = load_dataset(local_path, download=False)
        
        print(f"Loaded {len(data)} exercises from Free Exercise DB")
        
        print("Importing exercises...")
        summary = import_exercises(data, commit_every=100)
        
        print("Import completed!")
        print(f"Inserted: {summary['inserted']}")
        print(f"Skipped duplicates: {summary['skipped_dupe']}")
        print(f"Updated difficulty: {summary['updated_difficulty']}")

if __name__ == "__main__":
    seed_if_empty()
