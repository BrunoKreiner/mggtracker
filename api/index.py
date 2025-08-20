import os
import sys

# Import the Flask app from backend (now colocated under api/src)
from src.main import app

# This is the entry point for Vercel
# Vercel will call this app directly
if __name__ == "__main__":
    # Ensure the server is reachable from outside the container
    app.run(host="0.0.0.0", port=5000, debug=True)
