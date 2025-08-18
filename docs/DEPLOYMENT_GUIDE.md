# Deployment Guide

This guide covers deploying the Magical Girl Gym Tracker to production using **Vercel only** (both frontend and backend).

## Prerequisites

- Vercel account (free tier available)
- GitHub repository with your code

## Full-Stack Deployment (Vercel)

### 1. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect the configuration from `vercel.json`
3. The deployment includes:
   - **Frontend**: React app built with Vite
   - **Backend**: Flask API as serverless functions

### 2. Add Neon Postgres Database

1. In your Vercel dashboard, go to **Storage**
2. Create a **Neon** database (free tier: 0.5GB storage, no time limits)
3. This automatically provides environment variables:
   - `DATABASE_URL` (recommended for most uses)
   - `DATABASE_URL_UNPOOLED` (for direct connections)
   - `PGHOST`, `PGDATABASE`, etc. (connection parameters)

### 3. Environment Variables

Set these in Vercel's Environment Variables:

```
SECRET_KEY=<generate-random-32-char-string>
JWT_SECRET_KEY=<generate-random-32-char-string>
FLASK_ENV=production
```

**Note**: `DATABASE_URL` is automatically provided by Neon Postgres.

### 4. Initial Database Seeding

After first deployment, seed the database via Vercel's Functions tab or locally:

```bash
python backend/magical-girl-gym-tracker-backend/seed_if_empty.py
```

## Configuration Files

The deployment uses these configuration files:

### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/magical-girl-gym-tracker-frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "api/index.py" },
    { "src": "/(.*)", "dest": "frontend/magical-girl-gym-tracker-frontend/dist/$1" }
  ]
}
```

### `requirements.txt` (root level)
```
Flask==3.1.1
Flask-JWT-Extended==4.6.0
Flask-SQLAlchemy==3.1.1
Flask-CORS==6.0.0
psycopg2-binary==2.9.9
bcrypt==4.0.1
requests==2.32.3
```

### 1. Deploy to Vercel

1. Connect your GitHub repository
2. Select the frontend directory: `frontend/magical-girl-gym-tracker-frontend`
3. Vercel will auto-detect Vite configuration

### 2. Environment Variables

Set this in Vercel's Environment Variables:

```
VITE_API_URL=https://your-backend-name.onrender.com
```

Replace `your-backend-name` with your actual Render service name.

### 3. Build Settings

Vercel should auto-detect:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Post-Deployment Verification

### Backend Health Check

```bash
curl https://your-backend-name.onrender.com/api/exercises
```

Should return JSON array of exercises.

### Frontend Verification

1. Visit your Vercel URL
2. Register a new user
3. Verify exercises load and workout functionality works

## Environment Variables Reference

### Backend (Render)
- `DATABASE_URL`: Auto-provided by Render PostgreSQL
- `SECRET_KEY`: Random 32-character string for Flask sessions
- `JWT_SECRET_KEY`: Random 32-character string for JWT tokens
- `FLASK_ENV`: Set to `production`

### Frontend (Vercel)
- `VITE_API_URL`: Your Render backend URL (e.g., `https://magical-girl-gym-tracker-backend.onrender.com`)

## Backup Strategy

### Automated Backups (Recommended)

Render PostgreSQL includes automated daily backups on paid plans. For free tier:

### Manual Backup

Use `pg_dump` with your DATABASE_URL:

```bash
# Get DATABASE_URL from Render dashboard
pg_dump --no-owner --clean $DATABASE_URL > backup-$(date +%Y%m%d-%H%M).sql
```

### Restore from Backup

```bash
psql $DATABASE_URL < backup-file.sql
```

## Troubleshooting

### Common Issues

1. **Backend 500 errors**: Check Render logs for database connection issues
2. **Frontend can't reach API**: Verify `VITE_API_URL` is set correctly
3. **CORS errors**: Backend automatically allows all origins via Flask-CORS
4. **Database empty**: Run `python seed_if_empty.py` in Render Shell

### Logs Access

- **Render**: View logs in service dashboard
- **Vercel**: View function logs in deployment dashboard

## Security Notes

- JWT tokens don't expire in development but should in production
- Consider adding rate limiting for production
- Database credentials are managed by Render
- Never commit API keys or secrets to git

## Scaling Considerations

- Render free tier sleeps after 15 minutes of inactivity
- Consider upgrading to paid tier for always-on service
- PostgreSQL free tier has 1GB storage limit
- Vercel free tier includes generous bandwidth allowance
