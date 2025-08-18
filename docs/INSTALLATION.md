# Installation Guide

This guide will help you set up the Magical Girl Gym Tracker development environment using Docker.

## Prerequisites

### Required Software

1. **Docker Desktop** (Windows/macOS) or **Docker Engine** (Linux)
   - Download from: https://www.docker.com/products/docker-desktop
   - Ensure Docker Compose is included (it comes with Docker Desktop by default)

2. **Git**
   - Download from: https://git-scm.com/downloads

### System Requirements

- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 10GB free space
- **OS**: Windows 10/11, macOS 10.14+, or Linux

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd magical-girl-gym-tracker
```

### Step 2: Verify Docker Installation

```bash
docker --version
docker-compose --version
```

You should see version numbers for both commands.

### Step 3: Build and Start the Development Environment

```bash
# Build and start all services
docker-compose up --build
```

This command will:
- Build the frontend and backend Docker images
- Install all dependencies
- Start the development servers
- Set up hot reload for both frontend and backend

### Step 4: Verify the Installation

1. **Frontend (Web App)**:
   - Open your browser and go to: http://localhost:3000
   - You should see the Magical Girl Gym Tracker web application

2. **Backend API**:
   - Open your browser and go to: http://localhost:5000
   - You should see the Flask backend API response

## Development Workflow

### Starting the Development Environment

```bash
# Start all services
docker-compose up

# Start in detached mode (runs in background)
docker-compose up -d

# View logs
docker-compose logs -f
```

### Stopping the Development Environment

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

### Rebuilding After Changes

```bash
# Rebuild and restart
docker-compose up --build

# Rebuild specific service
docker-compose build frontend
docker-compose build backend
```

## Android Development

### Prerequisites for Android

- **Android Studio** (for emulator and debugging)
- **ADB** (Android Debug Bridge)

### Building Android APK

1. Start the Android build environment:
   ```bash
   docker-compose --profile android up android-build
   ```

2. Connect to the Android build container:
   ```bash
   docker-compose exec android-build bash
   ```

3. Inside the container, build the APK:
   ```bash
   # Commands will be added as React Native setup is completed
   ```

## Troubleshooting

### Common Issues

#### Port Already in Use

If you get port conflicts:

```bash
# Check what's using the ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Kill processes using the ports
sudo kill -9 <process-id>
```

#### Docker Build Fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Permission Issues (Linux/macOS)

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Add user to docker group (Linux)
sudo usermod -aG docker $USER
# Log out and log back in
```

#### Windows WSL Issues

If you're having WSL issues, Docker Desktop provides a good alternative:

1. Install Docker Desktop for Windows
2. Enable WSL 2 integration in Docker Desktop settings
3. Use PowerShell or Command Prompt instead of WSL

### Getting Help

1. Check the logs:
   ```bash
   docker-compose logs frontend
   docker-compose logs backend
   ```

2. Restart specific services:
   ```bash
   docker-compose restart frontend
   docker-compose restart backend
   ```

3. Clean restart:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

## Environment Variables

Create a `.env` file in the project root for custom configuration:

```env
# Frontend
REACT_APP_API_URL=http://localhost:5000

# Backend
FLASK_ENV=development
FLASK_DEBUG=1
DATABASE_URL=sqlite:///app.db

# Docker
COMPOSE_PROJECT_NAME=magical-girl-gym-tracker
```

## Next Steps

After successful installation:

1. Read the [Development Guide](DEVELOPMENT.md)
2. Check the [TODO List](TODO.md) for features to implement
3. Review the [API Documentation](API.md)
4. Explore the [Design Guidelines](DESIGN.md)

## Support

If you encounter issues not covered in this guide:

1. Check the project's GitHub Issues
2. Review Docker documentation
3. Consult the project's Discord/Slack channel (if available)

