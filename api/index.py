import os
import sys

# Import the Flask app from backend (now colocated under api/src)
from src.main import app

# This is the entry point for Vercel
# Vercel will call this app directly
if __name__ == "__main__":
    app.run()
