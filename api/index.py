import os
import sys

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'magical-girl-gym-tracker-backend')
sys.path.insert(0, backend_path)

# Import the Flask app from your existing backend
from src.main import app

# This is the entry point for Vercel
# Vercel will call this app directly
if __name__ == "__main__":
    app.run()
