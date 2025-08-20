# syntax=docker/dockerfile:1

FROM python:3.11-slim

# Prevent Python from writing .pyc files and stdout buffering
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set workdir
WORKDIR /app

# Install system deps (optional: build tools if needed by psycopg2-binary)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (better layer caching)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application code
COPY . /app

# Expose Flask port
EXPOSE 5000

# Default env for dev; DATABASE_URL can be provided via docker-compose/.env to use Neon
ENV FLASK_ENV=development \
    FLASK_DEBUG=1

# Run the Flask app (uses debug reloader per src/main.py)
CMD ["python", "-u", "index.py"]
