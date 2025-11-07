# MasterDiaryAppOfficial

A construction SaaS application focused on spreadsheet-like diary management for tracking work hours, costs, revenues, and margins.

## Overview
MasterDiaryAppOfficial is a full-stack web app that allows construction companies to manage projects, staff, equipment, and daily work diaries. It includes real-time calculations for costs and revenues based on staff rates, with a responsive UI and secure authentication.

## Tech Stack
- **Backend**: Node.js, Express, Sequelize ORM, SQLite, JWT, bcrypt
- **Frontend**: React, Vite, React Router, Axios, Chart.js, react-datepicker
- **Authentication**: JWT with httpOnly refresh tokens
- **Styling**: Inline styles with styled-jsx, responsive design
- **Database**: SQLite with migrations

## Project Structure

### Backend (`/backend`)
- **src/controllers/**: Business logic for each model (e.g., projectController.js handles CRUD)
- **src/models/**: Sequelize models (User, Project, Staff, Diary, Settings, Equipment)
- **src/routes/**: Express routes (e.g., projects.js defines GET/POST/PUT/DELETE)
- **src/middleware/**: Auth middleware (authenticateToken, authorizeRoles)
- **src/utils/**: Settings cache utility
- **migrations/**: Database migration files
- **config/**: Sequelize config for environments
- **server.js**: Main server file with CORS, rate limiting, routes setup

### Frontend (`/frontend`)
- **src/components/**: React components (Login, Dashboard, Projects, etc.)
- **src/context/**: SettingsContext for global state
- **src/utils/**: API utility with axios interceptors
- **src/main.jsx**: App entry with Router and SettingsProvider
- **src/App.jsx**: Main app with routes and navigation

### Root Files
- **.env**: Environment variables (JWT secrets, DB path, ports)
- **package.json**: Scripts for running backend and frontend concurrently

## Database Schema

### Tables
- **Users**: id (UUID), username, email, password (hashed), role (admin/supervisor/manager)
- **Projects**: id (UUID), name, site
- **Staff**: id (UUID), name, role, payRateBase/OT1/OT2, chargeOutBase/OT1/OT2
- **Diaries**: id (UUID), date, projectId, workerId, start/finish (TIME), breakMins, totalHours, ordinary/ot1/ot2Hours, costs, revenues, marginPct
- **Settings**: id (UUID), parameter (unique), value, notes
- **Equipment**: id (UUID), name, category, ownership, costRateBase/OT1/OT2

### Relationships
- Diary belongsTo Project and Staff
- Foreign keys with CASCADE on delete

### Migrations
Run `npx sequelize-cli db:migrate` in `/backend` to apply.

## API Endpoints

### Auth (`/api/auth`)
- POST `/register`: Register user { username, email, password, role? }
- POST `/login`: Login { email, password } → { accessToken, user }
- POST `/refresh`: Refresh access token
- POST `/logout`: Logout

### Projects (`/api/projects`) - Auth required
- GET `/`: List projects (paginated)
- GET `/:id`: Get project by ID
- POST `/`: Create project { name, site }
- PUT `/:id`: Update project
- DELETE `/:id`: Delete project

### Staff (`/api/staff`) - Auth required
- GET `/`: List staff (paginated)
- GET `/:id`: Get staff by ID
- POST `/`: Create staff { name, role, payRateBase, payRateOT1?, payRateOT2?, chargeOutBase, chargeOutOT1?, chargeOutOT2? }
- PUT `/:id`: Update staff
- DELETE `/:id`: Delete staff

### Diaries (`/api/diaries`) - Auth required
- GET `/`: List diaries (filter by date/projectId, sorted by date DESC)
- GET `/:id`: Get diary by ID
- POST `/`: Create diary entry → Auto-calculates hours/costs/revenues/margin
- PUT `/:id`: Update diary
- DELETE `/:id`: Delete diary

### Settings (`/api/settings`) - Admin only
- GET `/`: List settings
- POST `/`: Create setting { parameter, value, notes? }
- PUT `/:id`: Update setting
- DELETE `/:id`: Delete setting

### Equipment (`/api/equipment`) - Auth required
- GET `/`: List equipment (paginated)
- POST `/`: Create equipment { name, category, ownership, costRateBase, costRateOT1?, costRateOT2? }

## Frontend Components

### Core Components
- **Login**: Register/login form with validation
- **Dashboard**: Chart.js line chart for revenue/margin trends
- **Diary**: Form to add diary entries with real-time preview, table of recent entries
- **Projects**: CRUD form and list for projects
- **Staff**: CRUD form and list for staff (includes charge-out rates)
- **Settings**: Admin-only settings management
- **Equipment**: CRUD for equipment
- **Reports**: Summary stats and full diary table

### Utilities
- **api.js**: Axios instance with auth interceptors for token handling
- **SettingsContext**: Global settings state with fetch/update

## Installation & Setup

1. **Clone/Setup**:
   ```bash
   git clone <repo-url>
   cd MasterDiaryAppOfficialV2
   ```

2. **Backend**:
   ```bash
   cd backend
   npm install
   npx sequelize-cli db:migrate  # Apply migrations
   cd ..
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Environment**:
   - Copy `.env` and set JWT_SECRET, JWT_REFRESH_SECRET, etc.

5. **Run**:
   ```bash
   npm run dev  # Runs both backend (5000) and frontend (5173)
   ```

6. **Access**: http://localhost:5173 → Register/Login → Use app

## Usage
- Register as admin/manager/supervisor
- Add projects, staff (with pay/charge rates), equipment
- Log diary entries: Select date/project/worker, times → Auto-calculate costs/revenues
- View dashboard charts, reports for insights

## Key Features
- **Auto-Calculations**: Diary entries compute hours (ordinary/OT), costs (based on pay rates), revenues (based on charge-out rates), margins
- **Real-Time Preview**: Form shows live calculations before submit
- **Authentication**: JWT with roles (admin for settings)
- **Responsive UI**: Mobile-friendly with styled-jsx
- **Charts**: Revenue/margin trends by date
- **Pagination**: For large lists
- **Error Handling**: Validation, alerts, try-catch

## Future Enhancements
- Edit/delete diary entries
- PDF reports export
- Equipment integration in diaries
- Multi-user projects
- Advanced filtering/sorting
- Deployment (Heroku/Vercel)

## Development Notes
- **Breaking Changes**: Avoid removing core functionality; test thoroughly
- **Styling**: Uses styled-jsx for scoped styles; replace with CSS modules if needed
- **Auth**: Tokens in localStorage; refresh via cookies
- **DB**: SQLite for dev; switch to PostgreSQL for prod
- **API**: RESTful with consistent error responses
- **State**: Context for settings; use Redux if app grows

This documentation ensures any developer (or AI) can instantly understand and contribute to MasterDiaryAppOfficial. For issues, check logs or add console.logs for debugging.