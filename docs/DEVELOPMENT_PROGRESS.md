# Development Progress Report

## Completed Tasks 

### 1. Docker Development Environment
- Created Docker Compose configuration for multi-service development
- Set up frontend Dockerfile for React development with hot reload
- Set up backend Dockerfile for Flask development with auto-restart
- Created Android build Dockerfile for future React Native compilation
- Configured volume mounting for live code editing
- Set up proper networking between frontend and backend services

### 2. Backend Infrastructure
- Created Flask backend with proper project structure
- Implemented comprehensive database models:
  - User model for authentication
  - Exercise model with muscle groups, equipment, difficulty levels
  - WorkoutSession model for tracking workout sessions
  - WorkoutExercise model for exercises within workouts
  - ExerciseSet model for individual sets (reps, weight, etc.)
  - PersonalRecord model for tracking PRs
- Set up SQLite database with automatic table creation
- Implemented CORS for frontend-backend communication
- Created comprehensive API endpoints:
  - GET /api/exercises (with filtering by muscle group, equipment, search)
  - GET /api/exercises/{id} (individual exercise details)
  - POST /api/exercises (create custom exercises)
  - POST /api/workouts (start workout session)
  - PUT /api/workouts/{id} (end workout session)
  - POST /api/workouts/{id}/exercises (add exercise to workout)
  - POST /api/workout-exercises/{id}/sets (log sets)
  - GET /api/users/{id}/workouts (user workout history)
  - GET /api/users/{id}/personal-records (user PRs)
  - GET /api/muscle-groups (available muscle groups)
  - GET /api/equipment (available equipment types)

### 3. Database Seeding
- Created comprehensive exercise database with 23+ exercises
- Included exercises for all major muscle groups:
  - Chest (Push-ups, Bench Press, Dumbbell Flyes)
  - Back (Pull-ups, Deadlifts, Bent-over Rows)
  - Legs (Squats, Barbell Squats, Lunges, Romanian Deadlifts)
  - Shoulders (Overhead Press, Lateral Raises, Pike Push-ups)
  - Arms (Bicep Curls, Tricep Dips, Close-grip Push-ups)
  - Core (Plank, Crunches, Russian Twists, Mountain Climbers)
  - Cardio (Jumping Jacks, Burpees, High Knees)
- Added detailed instructions and descriptions for each exercise
- Categorized exercises by difficulty level (beginner, intermediate, advanced)
- Included equipment requirements for each exercise

### 4. Frontend Implementation
- Created magical girl themed React frontend
- Implemented beautiful gradient backgrounds (pink, purple, indigo)
- Added magical girl themed UI elements:
  - Sparkles, hearts, stars, and other magical icons
  - Gradient buttons with hover effects
  - Cute color palette inspired by magical girl anime
  - Magical loading animations
- Built exercise browsing interface:
  - Exercise cards with muscle group icons
  - Difficulty badges with color coding
  - Muscle group filtering
  - Responsive grid layout
- Integrated with backend API for real-time data fetching
- Added proper error handling and loading states
- Implemented mobile-responsive design

### 5. Project Documentation
- Created comprehensive README with quick start guide
- Written detailed installation guide with troubleshooting
- Generated extensive TODO list with prioritized features
- Documented API endpoints and database schema
- Created development progress tracking

### 6. Recent Frontend Additions
- Per-exercise `allowed_fields` now drive which inputs show when adding sets.
- "Add Set" appends visible rows under each workout exercise.
- Active workout persists via localStorage; ongoing backend session is auto-restored.
- Past Workouts section lists sessions and set counts.
- "End Workout" refreshes history after closing a session.
 - Delete actions added: per-exercise "Delete" and per-set "Delete" in Active Workout UI.
 - Rest Timer (per exercise):
   - Auto-starts when a set is marked done, using that set's `rest_time` seconds.
   - Displays countdown and total; Pause/Resume, Reset, and Stop controls.
   - Manual "Start Rest" available next to the Rest (s) input.
   - Cleans up when ending workout or deleting the exercise.

### 7. Data Integration: Free Exercise DB
- Added resilient importer script: `src/scripts/import_free_exercise_db.py`
- Vendoring path: `src/data/free-exercise-db/exercises.json` (commit this file for offline resilience)
- Importer maps fields and skips duplicates; sets `instructions` JSON with `source` and `allowed_fields`
- Offline-first: app uses local DB, not the network dataset; upstream outages will not break the app

### 8. Decora-kei Theming & UX Fixes
- Fixed modal backdrop click and URL-hash close in `frontend/magical-girl-gym-tracker-frontend/src/App.jsx`.
- Integrated Iconify icons (hearts, stars, sparkles) via runtime script in `frontend/magical-girl-gym-tracker-frontend/index.html`.
- Added decora background and helpers in `frontend/magical-girl-gym-tracker-frontend/src/App.css`:
  - `bg-decora`, `decora-overlay`, `sweet-card`, `washi`, `sticker`, `scallop`, `jp-label`, `glitter-sep`.
- Implemented Tumblr-style profile card with JP labels in `src/App.jsx` (below Welcome section) with washi tape and stickers.
- Added JP fonts via Google Fonts: Noto Sans JP, Zen Maru Gothic.
- Layering/z-index tweaks so main content sits above decorative overlay; overlay is pointer-events-none.
- Performance: debounced localStorage writes for set overrides and memoized filtered lists to reduce UI latency.

#### New: Decora-kei CSS groundwork and Marquee Header
- CSS scaffolding added in `frontend/magical-girl-gym-tracker-frontend/src/App.css` for:
  - `marquee-bar`, `marquee-track`, `marquee-segment` with `marquee-scroll` keyframes
  - scanline overlay, sticker belts, 88x31 button belt, and custom cursors (heart/star)
  - Respects `prefers-reduced-motion`: marquee animation disabled when user prefers reduced motion
- Marquee Header component added in `frontend/magical-girl-gym-tracker-frontend/src/App.jsx` directly below the main header:
  - Duplicated segments for seamless scroll; pause on hover
  - Always visible; respects `prefers-reduced-motion` (animation pauses when reduced motion is on)
  - Small "Compact (coming soon)" button in the header replaced the old marquee toggle
  - Content shows welcome/user, current workout name, and hydration reminder

### 11. Chaos Mode Removal & UI Simplification
- Removed Chaos Mode and all non-working/beta features (Sparkle Machine, Animation Playground, particle spawns)
- Marquee header and decorative overlays are always rendered for a consistent theme
- Retained only useful, stable toggles: Custom Cursor and Scanline Overlay (persisted per user)
- Added a small "Compact (coming soon)" button in the header as a placeholder for future layout toggle
- Result: simpler, more performant, and stable UI without clutter or hidden states

### 12. Additional Decora-kei Features
- **Custom Cursor System**: Implemented heart and star cursor options with per-user localStorage persistence
  - Dropdown selector in "Decora Effects" section (always visible)
  - CSS cursor definitions using SVG data URLs for heart (pink) and star (purple) cursors
  - Applied to entire app container for consistent cursor experience
- **Scanline Overlay**: Added retro CRT-style scanline effect
  - Toggleable via "Decora Effects" section (always visible)
  - Respects `prefers-reduced-motion` preference (disabled by default for accessibility)
  - CSS uses repeating linear gradient for authentic scanline appearance
  - Positioned with proper z-index layering to overlay content subtly

### 9. Image Board & Profile Picture System
- **Image Board**: Implemented local filesystem image uploads with data URL persistence in localStorage under key `imageBoard`
  - File upload inputs in three locations: left sidebar, Active Workout toolbar, and Workout Modal header
  - Support for both local file upload and URL-based image addition
  - 3-per-row tilted grid display with CSS transform effects and hover animations
  - Short date captions for each image with workout linkage information
- **Image Modal**: Click-to-popup image viewer with full-size display
  - Delete button to remove images from the board with immediate localStorage update
  - "Open Workout" button for images linked to specific workout sessions
  - Responsive modal with proper backdrop click handling
- **Profile Picture**: Upload and localStorage persistence system
  - Profile picture upload functionality with file validation (images only)
  - Persistent storage under localStorage key `profilePic` using data URLs
  - Used consistently across all avatar displays (left sidebar pinned avatar and center profile card)
  - "Change photo" buttons integrated into both profile locations
- **Persistence Fixes**: Resolved localStorage timing issues
  - Implemented separate loading guard (`imageLoaded` state) to prevent overwriting stored data during initial app load
  - Error handling for localStorage quota exceeded scenarios with user feedback
  - Automatic fallback to dicebear generated avatars when no custom profile picture is set

### 10. Auth Hardening & Login Flow
- Backend auth hardened: trimmed inputs, validated required fields, duplicate username/email checks, min password length, improved error handling.
- JWT identity standardized to string user.id; cast to int on usage in routes to avoid 422 errors.
- Frontend now gates the entire app behind a full-screen Login/Register screen until authenticated.
- Exercise Grid improved with a clear empty-state when no results match filters/search.
- Username and profile picture propagate consistently across sidebar and profile card after login.

## Current Status 

The project now has a solid foundation with:
- **Working Docker development environment** that can be started with `docker-compose up --build`
- **Functional backend API** with an importer for a comprehensive exercise dataset
- **Beautiful magical girl themed frontend** that displays exercises
- **Comprehensive exercise dataset vendored locally; importer can load 873 exercises (Free Exercise DB)**
- **Production-ready deployment configuration** for Render (backend) + Vercel (frontend)
- **Complete documentation** for setup, development, and deployment

## Next Immediate Steps 
1. **Deploy using split-project approach**: Create separate Vercel projects for frontend and backend
2. (Done) Add "Delete Exercise" and "Delete Set" in Active Workout UI and test end-to-end.
3. Remove the `difficulty` column from the backend database (migration) and clean API responses.
4. Seed the database using the Free Exercise DB importer (one-time per environment).
5. (Rest timer done) Add support for set types (warmup, dropset, superset).

## How to Get Started 

1. **Clone the repository** (when available)
2. **Install Docker Desktop** on your system
3. **Run the setup**:
   ```bash
   cd magical-girl-gym-tracker
   docker-compose up --build
   ```
4. **Access the applications**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
5. **Reset + import the full exercise dataset (DANGEROUS: DROPS ALL DATA)**
   - Windows PowerShell (local venv):
     ```powershell
     .\.venv\Scripts\python.exe backend\magical-girl-gym-tracker-backend\reset_and_import_free_db.py
     ```
   - Or via Docker Compose:
     ```bash
     docker-compose exec backend python reset_and_import_free_db.py
     ```
   - Verify import count:
     ```powershell
     (Invoke-RestMethod http://localhost:5000/api/exercises).Count
     ```
   - Note: This will remove ALL tables including users. Re-register a user after running.

The development environment is now ready for your girlfriend to start building her magical girl gym tracker! 

## Deployment Notes (Vercel) - UPDATED

### Previous Issues (Resolved)
- __Root Cause__: Monorepo approach with single `vercel.json` caused conflicts between framework detection
- __Problem__: Root `GET /` returned 404 while API routes worked fine
- __Multiple Failed Attempts__: builds[] array, Build Output API, complex routing strategies

### Current Solution: Split Projects (Recommended)
- __Approach__: Separate Vercel projects instead of monorepo configuration
- __Frontend Project__:
  - Root Directory: `frontend/magical-girl-gym-tracker-frontend`
  - Framework: Vite (auto-detected)
  - Configuration: `frontend/magical-girl-gym-tracker-frontend/vercel.json`
  - SPA routing with proper asset caching
- __Backend Project__:
  - Root Directory: `api`
  - Source code location: `api/src` (backend relocated under `api/` for deployment)
  - Runtime: Python 3.9 (auto-detected)
  - Configuration: `api/vercel.json`
  - Serverless functions for all API endpoints
  - Recent tweaks: `api/vercel.json` explicitly defines `builds` with `@vercel/python` for `index.py` and rewrites `/(.*)` to `index.py` so `/api/*` hits Flask. Added `api/requirements.txt` to ensure dependencies install during build.
- __Environment Variables__:
  - Frontend: `VITE_API_URL=https://backend-project-name.vercel.app` (no trailing slash)
  - Backend: `DATABASE_URL` for Neon database connection
  - Backend (seeding): `AUTO_SEED_IF_EMPTY` (true/false). When true and the database has 0 exercises, the backend auto-imports the vendored Free Exercise DB on first cold start.
- __Benefits__:
  - Proper framework detection per project
  - Independent deployments and scaling
  - Simplified configuration files
  - No routing conflicts
- __Files Created__:
  - `frontend/magical-girl-gym-tracker-frontend/vercel.json`
  - `api/vercel.json`
  - Updated `frontend/magical-girl-gym-tracker-frontend/.env.example`
  - Removed root `vercel.json` to prevent conflicts

### New (2025-08-20): Neon Production Auto-Seeding
- Backend logic updated in `api/src/main.py`:
  - Default user and 10 basic exercises now seed only when using local SQLite (no DATABASE_URL) to avoid polluting production data.
  - When running on Postgres/Neon (DATABASE_URL present) and `AUTO_SEED_IF_EMPTY=true`, the app checks `Exercise` count and, if zero, imports ALL exercises from `api/src/data/free-exercise-db/exercises.json` via `src/scripts/import_free_exercise_db.py`.
- How to reset and seed Neon:
  1. In Neon Console, run one of the following resets:
     - Drop schema (simplest):
       ```sql
       DROP SCHEMA IF EXISTS public CASCADE;
       CREATE SCHEMA public;
       GRANT ALL ON SCHEMA public TO PUBLIC;
       ```
     - Or drop tables (quoted for reserved name):
       ```sql
       DROP TABLE IF EXISTS exercise_set, workout_exercise, personal_record, workout_session, exercise, "user" CASCADE;
       ```
  2. In Vercel (Backend project, root `api`), set env vars:
     - `DATABASE_URL` = Neon connection string
     - `AUTO_SEED_IF_EMPTY` = `true`
  3. Redeploy backend. First cold start will create tables and auto-import ~800+ exercises.
  4. Hit `GET https://<backend>.vercel.app/api/exercises` to trigger and verify.
  5. Optional: remove or set `AUTO_SEED_IF_EMPTY=false` after successful import.

### Git History Cleanup (2025-08-19)
- Squashed the last 21 noisy "debug Vercel" commits into a single clean commit summarizing:
  - Split vercel.json into frontend and backend projects
  - Moved backend under `api/src` and adjusted `api/index.py`
  - Ensured `api/requirements.txt` and routes config
  - Updated docs and CORS notes
  - Created backup branch `backup/pre-squash-20250819-0009` for safety

### Cross-Project Ops Note (2025-08-19)
- Table Tennis League App: Deployment guide updated to Vercel-only (frontend Vite SPA + backend Express as Vercel Function + Vercel Postgres). Backend guarded from listening on Vercel and exposes `api/index.js`. Frontend `vercel.json` uses SPA rewrite to `/index.html`.
