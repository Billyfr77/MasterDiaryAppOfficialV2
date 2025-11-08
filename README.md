# MasterDiaryAppOfficial

A stunning, production-ready SaaS application for construction management, focused on real-time diary tracking, cost calculations, analytics, materials management, and quoting. **Now enhanced with immersive UI, animations, and best-in-class workflow!**

## 🚀 Overview

MasterDiaryAppOfficial revolutionizes construction project management by providing:
- **Real-time calculations** for hours, costs, revenues, and margins
- **Materials management** with customizable nodes (materials) and pricing
- **Quoting system** for project estimates with auto-calculated totals
- **Immersive UI** with dark themes, animations, particles, confetti, parallax backgrounds, and sound toggles
- **Advanced data management** with filtering, sorting, pagination, and PDF reports
- **Team collaboration** through project assignments and user management
- **Comprehensive analytics** via dashboards and charts
- **Workflow-optimized navigation** (Dashboard → Projects → Resources → Quotes → Logging → Reports → Settings)

Perfect for construction companies to track work hours, manage staff/equipment/materials, generate quotes, and gain insights—all with a modern, polished interface.

## ✨ Key Features

### Core Functionality
- **Diary Tracking**: Log work entries with start/end times, breaks, projects, workers, and equipment
- **Auto-Calculations**: Instant computation of ordinary/OT hours, staff costs, equipment costs, revenues, and margins
- **Project Management**: Create, edit, delete projects; assign users for access control
- **Staff & Equipment**: Manage rates, categories, and assignments
- **Materials (Nodes)**: Define materials with name, category, unit, and price per unit
- **Quoting**: Build quotes with selected materials, quantities, margins; auto-calculate costs and revenues
- **Real-Time Preview**: See calculations before saving entries

### Advanced Features
- **Data Grids**: Paginated tables with sorting, filtering, and search
- **Analytics Dashboard**: HUD-style gauges, trend charts, and recent activity widgets
- **PDF Reports**: Filtered exports with summaries and detailed tables
- **Multi-User Support**: JWT authentication, role-based access, project assignments
- **Strategic Insights**: Cost drivers, margin suggestions, historical comparisons, quote versioning

### UI/UX Excellence
- **Immersive Design**: Full-screen dark themes with parallax layers, lighting effects, and particle animations
- **Interactive Elements**: Hover effects, floating animations, confetti celebrations, sound toggles
- **Responsive Layout**: Grid-based pages with blurred glassmorphism cards
- **Typography & Icons**: Inter/Poppins fonts, Lucide icons with gradients
- **Animations**: CSS keyframes for spins, floats, glows, and transitions
- **Landing Page**: Hero section, features, testimonials, and CTAs
- **Workflow Nav**: Reordered menu: Dashboard → Projects → Staff → Equipment → Materials → Quotes → Diary → Reports → Settings

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, React Router, Lucide Icons, Chart.js, DatePicker, jsPDF
- **Backend**: Node.js, Express, Sequelize ORM, SQLite, JWT, bcrypt
- **Database**: SQLite (dev); PostgreSQL (prod-ready)
- **Styling**: CSS Variables, Styled-Components approach, Responsive Grid, Glassmorphism
- **Other**: Real-time calculations, Form validation, Parallax effects, Sound integration

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
3. **Dashboard**: View HUD gauges, performance trends, and recent activities (enhanced UI)
4. **Projects**: Manage projects and assign users (workflow order)
5. **Staff**: Manage staff rates and roles (immersive cards)
6. **Equipment**: Handle equipment costs and categories (full CRUD)
7. **Materials**: Define materials with pricing (enhanced forms)
8. **Quotes**: Create quotes with real-time calculations (QuoteBuilder with animations)
9. **Diary**: Log work entries (simplified form with previews)
10. **Reports**: Filter data and export PDFs (interactive filters)
11. **Settings**: Configure app parameters (moved to end of nav)

### Example Workflow
- Add staff with pay/charge rates
- Create projects and assign users
- Define materials in Materials section
- Build quotes with materials, quantities, and margins
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
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

### Nodes (Materials)
- `GET /api/nodes` - List nodes (paginated)
- `GET /api/nodes/:id` - Get node
- `POST /api/nodes` - Create node
- `PUT /api/nodes/:id` - Update node
- `DELETE /api/nodes/:id` - Delete node

### Quotes
- `GET /api/quotes` - List quotes (paginated)
- `GET /api/quotes/:id` - Get quote
- `POST /api/quotes` - Create quote (auto-calculates totals)
- `PUT /api/quotes/:id` - Update quote (re-calculates totals)
- `DELETE /api/quotes/:id` - Delete quote

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
- **Equipment**: id, name, category, ownership, cost rates
- **Nodes**: id, name, category, unit, pricePerUnit, userId
- **Quotes**: id, name, projectId, userId, nodes (JSON), totalCost, totalRevenue, marginPct
- **Diaries**: id, date, projectId, workerId, equipmentId, times, calculations
- **Settings**: id, parameter, value, notes
- **ProjectUsers**: Junction for many-to-many projects-users

### Relationships
- Diary belongs to Project, Staff, Equipment
- Quote belongs to Project, User
- Node belongs to User
- Project belongs to many Users (via ProjectUsers)

## 🎨 Design System

### Colors
- Primary: #667eea (Blue)
- Secondary: #764ba2 (Purple)
- Success: #4ecdc4 (Teal)
- Danger: #ff6b6b (Red)
- Warning: #ffd93d (Yellow)
- Grays: 100-900 scale with transparency

### Typography
- Font: Inter (body), Poppins (headings)
- Sizes: xs (0.75rem) to 4xl (2.25rem)
- Weights: Light (300) to Bold (700)

### Components
- Buttons: Gradient backgrounds, hover transforms, shadow effects
- Inputs: Blurred backgrounds, border animations
- Cards: Glassmorphism with backdrop blur, floating animations
- Tables: Interactive rows with hover effects
- Gauges: SVG circles with live updates
- Icons: Lucide React with custom styling

### Animations
- Page fades, slide-ins, float effects
- Loading spinners, confetti particles
- Hover transforms, glows, pulses
- Parallax backgrounds, lighting gradients

## 🔒 Security & Accessibility

- **Authentication**: JWT with refresh tokens, bcrypt hashing
- **Validation**: Joi schemas, input sanitization
- **Accessibility**: ARIA labels, keyboard navigation, high contrast support
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

## 📈 Future Enhancements (Implemented)

All planned features implemented and enhanced:
- ✅ Real-time calculations and live margin indicators
- ✅ Materials (Nodes) management with full CRUD
- ✅ Quoting system with auto-calculations
- ✅ PDF reports and CSV exports
- ✅ Advanced filtering/sorting
- ✅ Multi-user projects with assignments
- ✅ Immersive UI: Dark themes, animations, particles, confetti, parallax, sound
- ✅ HUD gauges, interactive cards, workflow nav order
- ✅ Landing page with testimonials

## 💡 Development Notes

- **Architecture**: Modular components, RESTful API, ORM for DB
- **State Management**: React hooks, localStorage for persistence
- **Error Handling**: Try-catch, user-friendly messages
- **Performance**: Pagination, lazy loading, optimized renders
- **Testing**: Manual testing completed; add unit tests for production
- **Contributing**: Enhanced with stunning UI; easy to extend

## 📞 Support

For issues or contributions, open a GitHub issue or PR. This app is designed for easy extension—any developer can instantly understand and enhance it.

---

**MasterDiaryAppOfficial**: Beautiful, functional, and production-ready. Transform your construction management today! 🏗️✨🚀