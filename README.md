# MasterDiaryAppOfficial

A stunning, production-ready SaaS application for construction management, focused on real-time diary tracking, cost calculations, and analytics. Built with a beautiful, accessible UI and powerful features for efficient project oversight.

## 🚀 Overview

MasterDiaryAppOfficial revolutionizes construction project management by providing:
- **Real-time calculations** for hours, costs, revenues, and margins
- **Beautiful, responsive UI** with dark mode, animations, and accessibility
- **Advanced data management** with filtering, sorting, pagination, and PDF reports
- **Team collaboration** through project assignments and user management
- **Comprehensive analytics** via dashboards and charts

Perfect for construction companies to track work hours, manage staff/equipment, and generate insights—all with a modern, polished interface.

## ✨ Key Features

### Core Functionality
- **Diary Tracking**: Log work entries with start/end times, breaks, projects, workers, and equipment
- **Auto-Calculations**: Instant computation of ordinary/OT hours, staff costs, equipment costs, revenues, and margins
- **Project Management**: Create, edit, delete projects; assign users for access control
- **Staff & Equipment**: Manage rates, categories, and assignments
- **Real-Time Preview**: See calculations before saving entries

### Advanced Features
- **Data Grids**: Paginated tables with sorting, filtering, and search
- **Analytics Dashboard**: Metric cards, trend charts, and recent activity widgets
- **PDF Reports**: Filtered exports with summaries and detailed tables
- **Multi-User Support**: JWT authentication, role-based access, project assignments

### UI/UX Excellence
- **Design System**: Consistent Inter font, color palette, spacing, and components
- **Icons & Animations**: Lucide icons, smooth transitions, loading states, micro-interactions
- **Dark Mode**: Manual/auto toggle with system preference detection
- **Responsive Design**: Mobile-optimized with touch-friendly elements
- **Accessibility**: ARIA labels, keyboard navigation, high contrast support
- **Landing Page**: Hero section, features, testimonials, and CTAs

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, React Router, Lucide Icons, Chart.js, DatePicker
- **Backend**: Node.js, Express, Sequelize ORM, SQLite, JWT, bcrypt
- **Database**: SQLite (dev); PostgreSQL (prod-ready)
- **Styling**: CSS Variables, Styled-Components approach, Responsive Grid
- **Other**: jsPDF for reports, Real-time calculations, Form validation

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Git

### Clone & Install
```bash
git clone https://github.com/Billyfr77/MasterDiaryAppOfficialV2.git
cd MasterDiaryAppOfficialV2

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Environment Setup
Create `.env` in `/backend`:
```
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
PORT=5000
NODE_ENV=development
```

### Database
Run migrations:
```bash
cd backend
npx sequelize-cli db:migrate
```

### Run the App
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` for the landing page, or login to access the app.

## 📖 Usage

1. **Landing Page**: Explore features and testimonials
2. **Login/Register**: Create account or sign in
3. **Dashboard**: View metrics, charts, and recent activity
4. **Projects**: Manage projects and assign users
5. **Staff/Equipment**: Set up workers and tools with rates
6. **Diary**: Log work entries with real-time calculations
7. **Reports**: Filter data and export PDFs
8. **Settings**: Configure app parameters

### Example Workflow
- Add staff with pay/charge rates
- Create projects and assign users
- Log diary entries (auto-calculates costs/margins)
- View dashboard for insights
- Generate reports for stakeholders

## 🔗 API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Projects
- `GET /api/projects` - List projects (paginated)
- `GET /api/projects/:id` - Get project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/users` - Get assigned users
- `POST /api/projects/:id/users` - Assign user
- `DELETE /api/projects/:id/users/:userId` - Remove user

### Staff
- `GET /api/staff` - List staff (paginated)
- `POST /api/staff` - Create staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

### Equipment
- `GET /api/equipment` - List equipment
- `POST /api/equipment` - Create equipment

### Diaries
- `GET /api/diaries` - List diaries (with filters)
- `POST /api/diaries` - Create diary entry
- `PUT /api/diaries/:id` - Update entry
- `DELETE /api/diaries/:id` - Delete entry

### Settings
- `GET /api/settings` - List settings
- `POST /api/settings` - Create setting
- `PUT /api/settings/:id` - Update setting
- `DELETE /api/settings/:id` - Delete setting

## 🗄 Database Schema

### Tables
- **Users**: id, username, email, password (hashed), role
- **Projects**: id, name, site
- **Staff**: id, name, role, pay rates (base/OT1/OT2), charge rates
- **Equipment**: id, name, category, cost rates
- **Diaries**: id, date, projectId, workerId, equipmentId, times, calculations
- **Settings**: id, parameter, value, notes
- **ProjectUsers**: Junction for many-to-many projects-users

### Relationships
- Diary belongs to Project, Staff, Equipment
- Project belongs to many Users (via ProjectUsers)

## 🎨 Design System

### Colors
- Primary: #007bff
- Secondary: #6c757d
- Success: #28a745
- Danger: #dc3545
- Warning: #ffc107
- Info: #17a2b8
- Grays: 100-900 scale

### Typography
- Font: Inter (Google Fonts)
- Sizes: xs (0.75rem) to 4xl (2.25rem)
- Weights: Light (300) to Bold (700)

### Components
- Buttons: Primary, secondary, outline, danger variants
- Inputs: Styled with focus states and validation
- Cards: Elevated containers with hover effects
- Tables: Sortable, paginated data grids
- Icons: Lucide React library

### Animations
- Page fades, slide-ins, button ripples
- Loading skeletons, hover transforms
- Error shakes, pulse effects

## 🔒 Security & Accessibility

- **Authentication**: JWT with refresh tokens, bcrypt hashing
- **Validation**: Joi schemas, input sanitization
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Responsive**: Mobile-first design with touch optimization

## 🚀 Deployment

### Production Setup
1. Switch to PostgreSQL in Sequelize config
2. Set `NODE_ENV=production`
3. Build frontend: `npm run build`
4. Deploy backend to Heroku/Vercel
5. Serve built frontend statically

### Environment Variables (Prod)
```
DATABASE_URL=postgres://...
JWT_SECRET=strong-secret
PORT=5000
```

## 📈 Future Enhancements (Completed)

All planned features implemented:
- ✅ Edit/Delete diary entries
- ✅ Equipment integration
- ✅ PDF reports
- ✅ Advanced filtering/sorting
- ✅ Multi-user projects
- ✅ UI improvements (design system, icons, animations, dark mode, mobile, accessibility)
- ✅ Landing page

## 💡 Development Notes

- **Architecture**: Modular components, RESTful API, ORM for DB
- **State Management**: React hooks, localStorage for persistence
- **Error Handling**: Try-catch, user-friendly messages
- **Performance**: Pagination, lazy loading, optimized renders
- **Testing**: Manual testing completed; add unit tests for production
- **Contributing**: Any AI/developer can instantly understand via this README

## 📞 Support

For issues or contributions, open a GitHub issue or PR. This app is designed for easy extension—any AI can continue development seamlessly.

---

**MasterDiaryAppOfficial**: Beautiful, functional, and production-ready. Transform your construction management today! 🏗️✨