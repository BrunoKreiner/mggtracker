# Deployment Guide

This guide covers deploying the Magical Girl Gym Tracker to production using Render (backend) and Vercel (frontend).

## Prerequisites

- Render account (free tier available)
- Vercel account (free tier available)
- GitHub repository with your code

## Backend Deployment (Render)

### 1. Create Web Service on Render

1. Connect your GitHub repository
2. Select the backend directory: `backend/magical-girl-gym-tracker-backend`
3. Configure the service:
   - **Name**: `magical-girl-gym-tracker-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT src.main:app`

### 2. Environment Variables

Set these in Render's Environment tab:

```
DATABASE_URL=<auto-provided-postgres-url>
SECRET_KEY=<generate-random-32-char-string>
JWT_SECRET_KEY=<generate-random-32-char-string>
FLASK_ENV=production
```

**Important**: Render automatically provides `DATABASE_URL` when you add a PostgreSQL database. The app will use this instead of SQLite.

### 3. Add PostgreSQL Database

1. In your Render dashboard, create a new PostgreSQL database
2. Link it to your web service
3. The `DATABASE_URL` will be automatically set

### 4. Initial Database Seeding

After first deployment, seed the database via Render's Shell:

```bash
python seed_if_empty.py
```

This is safe to run multiple times - it only imports if the database is empty.

## Frontend Deployment (Vercel)

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
