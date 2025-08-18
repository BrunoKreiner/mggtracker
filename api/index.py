import os
import sys
from flask import Flask, request

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'magical-girl-gym-tracker-backend')
sys.path.insert(0, backend_path)

# Import the Flask app from your existing backend
from src.main import app

# Vercel serverless function handler
def handler(request, response):
    return app(request.environ, lambda status, headers: None)

# For Vercel
app = app
