# Magical Girl Gym Tracker - Development TODO List

This comprehensive TODO list outlines all the features and tasks needed to build the magical girl anime-themed workout/gym tracker app. Tasks are organized by priority and development phases.

## Phase 1: Foundation & Core Setup ⭐ (HIGH PRIORITY)

### 1.1 Project Infrastructure
- [x] Set up Docker development environment
- [x] Create React frontend template
- [x] Create Flask backend template
- [x] Configure Docker Compose
- [x] Set up environment variables and configuration
- [x] Create database schema and models
- [x] Set up basic API endpoints structure
- [x] Configure CORS for frontend-backend communication
- [x] Set up basic routing in React frontend

### 1.2 Database Design
- [x] Design user authentication schema
- [x] Design exercise database schema
- [x] Design workout logging schema
- [x] Design progress tracking schema
- [ ] Create database migrations
- [x] Seed database with initial exercise data
- [x] Set up database relationships and constraints

### 1.3 Authentication System
- [x] Implement user registration API endpoint
- [x] Implement user login API endpoint
- [x] Set up JWT token authentication
- [x] Create user profile management
- [ ] Implement password reset functionality
- [ ] Add email verification (optional)

## Phase 2: Core Workout Features ⭐ (HIGH PRIORITY)

### 2.1 Exercise Database
- [x] Create comprehensive exercise database (300+ exercises)
- [x] Implement exercise search and filtering
- [x] Add exercise categories (muscle groups, equipment)
- [x] Create exercise detail pages with instructions
- [x] Add muscle group diagrams
- [x] Implement custom exercise creation
- [x] Vendor Free Exercise DB (800+ exercises) with offline importer
- [ ] Normalize imported data fields and `allowed_fields` mapping (cleanup pass)

### 2.2 Workout Logging
- [x] Create workout session start/end functionality
- [x] Implement set, rep, and weight logging
- [x] Add rest timer between sets
- [ ] Support different set types (regular, superset, dropset)
- [ ] Create workout templates and routines
- [x] Implement workout history and logs
- [ ] Add workout notes and comments

### 2.3 Progress Tracking
- [ ] Calculate and display personal records (PRs)
- [ ] Create progress charts and graphs
- [ ] Track volume and intensity metrics
- [ ] Implement progress photos feature
- [ ] Add body measurements tracking
- [ ] Create progress comparison tools

## Phase 3: Magical Girl Theme & UI ⭐ (HIGH PRIORITY)

### 3.1 Visual Design Implementation
- [ ] Design magical girl color palette (pastels, jewel tones)
- [ ] Create magical girl avatar system
- [ ] Design UI components with anime aesthetics
- [ ] Implement sparkle and glitter animations
- [ ] Create transformation sequence animations
- [ ] Design magical girl themed icons and buttons

### 3.2 Gamification Elements
- [ ] Implement user level and experience system
- [ ] Create magical item collection system
- [ ] Design achievement and badge system
- [ ] Add daily/weekly challenges
- [ ] Implement streak tracking
- [ ] Create magical girl outfit unlocking system

### 3.3 Mascot and Storytelling
- [ ] Design and implement mascot character
- [ ] Create motivational messages system
- [ ] Add light narrative elements
- [ ] Implement visual novel-style cutscenes
- [ ] Create seasonal events and themes

### 3.4 Decora-kei Enhancements (UI polish)
- [x] CSS groundwork for marquee bar, scanline overlay, sticker belts, 88x31 button belt, and custom cursors (`frontend/magical-girl-gym-tracker-frontend/src/App.css`)
- [x] Marquee Header below main header is now ALWAYS visible; respects reduced-motion (animation pauses) (`frontend/magical-girl-gym-tracker-frontend/src/App.jsx`)
- [x] Removed Chaos Mode and all non-working features (Sparkle Machine, Animation Playground, particles) for stability and performance
- [x] Global custom cursor toggle (heart/star/default) with localStorage persistence and reduced-motion respect (kept)
- [x] Scanline overlay layer behind content; toggleable and disabled when prefers-reduced-motion (kept)
- [ ] Sticker belts on left/right sidebars using existing sticker assets; persist visibility/order per user
- [ ] 88x31 button belt near footer; allow user to enable/disable; persist per user

## Phase 4: Advanced Features 🌟 (MEDIUM PRIORITY)

### 4.1 Social Features
- [ ] Implement user profiles and following system
- [ ] Create community feed for sharing workouts
- [ ] Add workout sharing functionality
- [ ] Implement leaderboards and challenges
- [ ] Create group workout features
- [ ] Add friend recommendations

### 4.2 Analytics and Insights
- [ ] Advanced progress analytics dashboard
- [ ] Workout pattern analysis
- [ ] Strength progression predictions
- [ ] Muscle group balance analysis
- [ ] Training volume optimization suggestions
- [ ] Injury risk assessment

### 4.3 Workout Planning
- [ ] AI-powered workout plan generation
- [ ] Periodization and program design
- [ ] Adaptive training recommendations
- [ ] Deload week suggestions
- [ ] Exercise substitution recommendations
- [ ] Training split optimization

## Phase 5: Mobile & Cross-Platform 🌟 (MEDIUM PRIORITY)

### 5.1 React Native Setup
- [ ] Convert React components to React Native
- [ ] Set up React Native navigation
- [ ] Implement platform-specific UI adjustments
- [ ] Configure Android build environment
- [ ] Set up APK generation pipeline
- [ ] Test cross-platform compatibility

### 5.2 Mobile-Specific Features
- [ ] Implement offline mode for workout logging
- [ ] Add push notifications for workout reminders
- [ ] Integrate with device sensors (if available)
- [ ] Optimize for mobile performance
- [ ] Add haptic feedback for interactions
- [ ] Implement background sync

### 5.3 App Store Preparation
- [ ] Create app icons and splash screens
- [ ] Write app store descriptions
- [ ] Prepare screenshots and promotional materials
- [ ] Set up app signing and distribution
- [ ] Create privacy policy and terms of service

## Phase 6: Premium Features 💎 (LOW PRIORITY)

### 6.1 Nutrition Integration
- [ ] Basic calorie and macro tracking
- [ ] Meal planning suggestions
- [ ] Integration with nutrition databases
- [ ] Magical girl themed meal plans
- [ ] Hydration tracking with cute animations

### 6.2 Wearable Integration
- [ ] Smartwatch app companion
- [ ] Heart rate monitoring integration
- [ ] Automatic workout detection
- [ ] Sleep tracking integration
- [ ] Step counting and activity tracking

### 6.3 Advanced Customization
- [ ] Custom magical girl avatar creation
- [ ] Personalized UI themes
- [ ] Custom workout music integration
- [ ] Voice coaching and guidance
- [ ] AR workout demonstrations

## Phase 7: Polish & Launch 🚀 (ONGOING)

### 7.1 Testing and Quality Assurance
- [ ] Unit testing for backend APIs
- [ ] Integration testing for frontend-backend
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Security audit and penetration testing
- [ ] Accessibility compliance testing

### 7.2 Documentation and Support
- [ ] Complete API documentation
- [ ] User manual and tutorials
- [ ] Developer documentation
- [ ] FAQ and troubleshooting guide
- [ ] Video tutorials for key features
- [ ] Community guidelines and moderation

### 7.3 Deployment and Monitoring
- [ ] Production deployment setup
- [ ] Monitoring and logging systems
- [ ] Error tracking and reporting
- [ ] Performance monitoring
- [ ] User analytics and feedback collection
- [ ] Backup and disaster recovery

## Immediate Next Steps (Start Here!)

~~1. Image Board: add local file upload from device (left sidebar, active workout, workout modal) and persist images in localStorage.~~ ✅ **COMPLETED**
~~2. Image Board UI: redesign to a 3-per-row tilted grid with short date captions; clicking an image opens a popup with the image and linked workout info.~~ ✅ **COMPLETED**
~~3. Profile picture: implement upload + localStorage persistence; use across avatar displays.~~ ✅ **COMPLETED**
~~4. Document and defer: Particle preset buttons (x20, Starfall, Twinkle) not spawning visible effects reliably; revisit later.~~ ✅ **COMPLETED**

~~5. Gate the entire app behind a full-screen Login/Register until authenticated.~~ ✅ **COMPLETED**
~~6. Exercise Grid: show an empty-state when no exercises match filters/search.~~ ✅ **COMPLETED**

1. Responsive testing and performance check (FPS, DOM node count) on desktop and mobile for the simplified, always-on decora UI.
~~2. Add "Delete Exercise" and "Delete Set" in Active Workout UI and test end-to-end.~~ ✅ **COMPLETED**
3. Verify difficulty mapping from Free Exercise DB and display a difficulty badge in the UI.
4. Seed the database using the Free Exercise DB importer (one-time per environment).

   - Local reset + import (DROPS ALL DATA):
     Use Windows PowerShell from repo root:
     ```powershell
     .\.venv\Scripts\python.exe backend\magical-girl-gym-tracker-backend\reset_and_import_free_db.py
     ```
   - Verify count:
     ```powershell
     $count = (Invoke-RestMethod http://localhost:5000/api/exercises).Count
     Write-Host "Imported $count exercises."
     ```
- [x] **FIXED**: Split into separate Vercel projects instead of monorepo approach
  - **Frontend Project**: Deploy `frontend/magical-girl-gym-tracker-frontend/` as separate Vite project
    - Framework auto-detection works properly
    - Root directory: `frontend/magical-girl-gym-tracker-frontend`
    - Uses `vercel.json` in frontend directory for SPA routing
  - **Backend Project**: Deploy `api/` as separate Python serverless project
    - Framework auto-detection works properly
    - Root directory: `api`
    - Uses `vercel.json` in api directory for Python runtime
  - [ ] **Setup Steps**:
  1. Create frontend Vercel project: Root Directory = `frontend/magical-girl-gym-tracker-frontend`
  2. Create backend Vercel project: Root Directory = `api`
  3. Set `VITE_API_URL` environment variable in frontend project to backend project URL
  4. Deploy both projects separately
  5. Ensure `api/requirements.txt` exists with backend dependencies
  6. Ensure `api/vercel.json` includes builds + routes (map `/(.*)` -> `index.py`)
  - [ ] **Environment Variables**:
    - Frontend: Set `VITE_API_URL=https://your-backend-project.vercel.app` (no trailing slash)
    - Backend: Set `DATABASE_URL` for Neon database connection
    - Backend (seeding): Optionally set `AUTO_SEED_IF_EMPTY=true` to auto-import the full exercise dataset on empty databases.
  - [ ] **Post-deploy checks**:
    - Frontend: `GET /` loads index.html and `/assets/*` serve properly
    - Backend: `GET /api/exercises` returns JSON (200)
    - Backend responses include `Access-Control-Allow-Origin` (either `*` or your frontend domain)
    - Preflight: `OPTIONS /api/exercises` responds 200/204 and includes `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers`
    - Cross-origin requests work between frontend and backend projects

## Local Docker Dev (rewired to `api/`) — 2025-08-20

- [x] Update `docker-compose.yml` to build backend from `api/` instead of legacy `backend/`
- [x] Add `api/Dockerfile` to run Flask app via `index.py`
- [ ] Create a root `.env` file (not committed) with:
  ```env
  DATABASE_URL=postgresql://<user>:<pass>@<neon-host>/<db>?sslmode=require
  AUTO_SEED_IF_EMPTY=false
  SECRET_KEY=dev-secret
  JWT_SECRET_KEY=dev-jwt
  ```
- [ ] Start stack:
  ```powershell
  docker compose up --build
  ```
- [ ] Verify backend connects to Neon in logs: `Using PostgreSQL database:` in `api/src/main.py` boot logs
- [ ] Verify exercise count:
  ```powershell
  (Invoke-RestMethod http://localhost:5000/api/exercises).Count
  ```
  Expect ~800+ if Neon has been seeded. If you see ~10, you are likely on SQLite — ensure `.env` with `DATABASE_URL` is present and restart containers.
- [ ] Frontend API base URL:
  - Dev default: `frontend/src/App.jsx` uses `http://localhost:5000` when no `VITE_API_URL` is set
  - Optional: create `frontend/.env.local` with `VITE_API_URL=http://localhost:5000` if you want explicit config

## Test on Vercel (no Docker) — 2025-08-20

- [ ] Backend project (root `api/` in Vercel):
  - Set Environment Variables (Production/Preview):
    - `DATABASE_URL=postgresql://<user>:<pass>@<neon-host>/<db>?sslmode=require`
    - `AUTO_SEED_IF_EMPTY=true` (temporarily, only if Exercise table is empty)
    - `JWT_SECRET_KEY=<some-secret>`
    - `SECRET_KEY=<some-secret>`
  - Redeploy. On first cold start, seeding runs if empty.
  - Verify: open `https://<backend>.vercel.app/api/exercises` and check response count (should be ~800+ after seed).
  - Then set `AUTO_SEED_IF_EMPTY=false` and redeploy to avoid repeated checks.

- [ ] Frontend project (root `frontend/magical-girl-gym-tracker-frontend/`):
  - Set `VITE_API_URL=https://<backend>.vercel.app`
  - Redeploy frontend.
  - Verify in browser dev console: `Loaded N exercises` where N ~ 800+.

### Repo Hygiene
- [x] Squash noisy Vercel debug commits (last 21) into a single clean commit; keep backup branch
- [x] Squash Vercel debug commit history.

## Development Guidelines

- **Magical Girl First**: Every feature should incorporate the magical girl theme
- **Mobile Responsive**: Design for mobile-first, then scale up
- **Performance**: Keep animations smooth and app responsive
- **User Experience**: Prioritize ease of use and motivation
- **Community**: Build features that encourage positive community interaction

## Feature Prioritization

- ⭐ **HIGH PRIORITY**: Core functionality needed for MVP
- 🌟 **MEDIUM PRIORITY**: Important features for full release
- 💎 **LOW PRIORITY**: Nice-to-have features for future updates

This TODO list will be updated as development progresses and new requirements emerge.

---

### Cross-Project Ops Note (2025-08-19)
- Table Tennis League App: Deployment docs switched to Vercel-only.
  - Frontend: Vite SPA with `frontend/vercel.json` (rewrite to `/index.html`).
  - Backend: Express exported as Vercel Function via `backend/api/index.js` with `backend/vercel.json` routes.
  - Env: Frontend `VITE_API_URL`, Backend `FRONTEND_URL`, `DATABASE_URL` (Vercel Postgres).
