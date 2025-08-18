#!/usr/bin/env python3
"""
Reset database and import Free Exercise DB from local data
"""
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db
from src.scripts.import_free_exercise_db import load_dataset, import_exercises

def reset_and_import():
    """Reset database and import Free Exercise DB from local files"""
    
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        
        print("Creating fresh tables...")
        db.create_all()
        
        print("Loading Free Exercise DB from local files...")
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
    reset_and_import()
