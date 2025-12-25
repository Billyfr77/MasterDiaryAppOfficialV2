# MasterDiaryAppOS - AI Handover Blueprint

## 🚀 Project Status: World-Class V2 (Production Ready)
**Date:** December 16, 2025
**Version:** 2.5.0 (Enterprise AI Edition)

---

## 🧠 For Future AI Developers (Gemini 3 CLI)
**Context:** This application is a high-fidelity Construction SaaS platform. It has been heavily optimized for performance, cost-efficiency, and visual polish.
**Core Philosophy:** "Visual First, AI Powered." Every feature replaces a spreadsheet with a visual tool (Map, Canvas, Graph) backed by an expert AI agent.

---

## 🏗️ Architecture Stack
- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion (Animations), React Flow (Graphs), React Google Maps (Geospatial), Lucide Icons.
- **Backend:** Node.js, Express.js.
- **Database:** Sequelize ORM (SQLite for Dev / Postgres for Prod).
- **AI Engine:** xAI (Grok-4) via `grokService.js`.
- **Infrastructure:** Google Cloud Run (Docker), Google Cloud Storage (Uploads).
- **Monetization:** Stripe (Checkout & Portal).

---

## 🤖 AI Core ("Pinnacle AI")
The AI logic is centralized in `backend/src/controllers/aiController.js` and `backend/src/services/grokService.js`.

### 1. Optimization Strategy (CRITICAL)
To maintain speed (<6s responses) and low cost, we enforce:
- **Strict Token Limits:** Interactive chats (Quote/Diary) are capped at **300-1000 tokens**. Complex blueprints at **3000 tokens**.
- **Context Trimming:** We do NOT send the entire database. We truncate logs to 12k chars and limit resource lists to the "Top 15".
- **Prompt Engineering:** All prompts explicitly demand **"RAW JSON ONLY"** and **"NO MARKDOWN"**. We use specific personas ("Senior Estimator", "Site Clerk") to enforce quality.

### 2. Key AI Functions
| Function | Persona | Output | Optimization |
| :--- | :--- | :--- | :--- |
| `generateQuote` | Senior Estimator | Visual Graph (`nodes`, `edges`) | Mandates `cost > 0` for all items. 3000 tokens. |
| `chatDiaryAssistant` | Site Clerk | JSON Actions (`add_item`) | Mandates `suggestedActions` for work descriptions. 300 tokens. |
| `generateDashboardInsights`| Neural Core | Strategic Report (Exec Summary, Risks) | Analyzes financial delta. 1024 tokens. |
| `analyzeSafetyTask` | ISO Auditor | Safety Docs (Hazards, Controls) | Generates structured forms. 2048 tokens. |
| `chatGlobal` | Pinnacle Copilot | Conversational reply | 800 tokens. General app assistance. |
| `analyzeDocument` | Document Analyst | Summarized Document Insights | 1024 tokens. Truncates large docs. |
| `analyzeMapZone` | Chief Construction Analyst | Strategic Project Review | 1500 tokens. Deep project data analysis. |
| `generateMapElements` | Geospatial Architect | Map Asset JSON | 2048 tokens. Creates visual map zones/markers. |
| `parseDiaryLog` | Senior Site Clerk | Structured Diary Items | 1024 tokens. Extracts resources from text. |
| `generateWorkflow` | Expert Project Manager | React Flow JSON (Workflow) | 4096 tokens. Creates operational workflows. |

---

## 💎 Key Features & Implementation Details

### 1. Pulse Dashboard (`frontend/src/components/Dashboard/UltimatePulseDashboard.jsx`)
- **Overview:** Centralized hub for project overviews, KPIs, and real-time data.
- **KPI Grid:** Customizable Key Performance Indicators (Revenue, Profit, Utilization, Alerts).
- **Financial Velocity Chart:** Line chart showing historical revenue/cost and future forecast.
- **Revenue Breakdown:** Doughnut chart for project-wise revenue distribution.
- **Resource Radar:** Identifies top used staff/equipment.
- **Project Health Table:** Summarizes active project statuses.
- **Activity Feed:** Live stream of project updates, alerts, and AI insights.
- **AI Neural Core:** Dynamic, AI-generated strategic insights from company stats.
- **Weather Widget:** Live weather conditions for a default location.

### 2. Projects (`frontend/src/components/EnhancedProjects.jsx`)
- **Management:** Create, view, update, delete projects.
- **Details:** Track client, site, status, value.
- **Integrations:** Linked to Quotes, Diaries, Map Assets.

### 3. Job Board (`frontend/src/components/JobBoard.jsx`)
- **Overview:** Visual Kanban board for job statuses (e.g., To Do, In Progress, Done).
- **Task Management:** Basic job tracking with drag-and-drop functionality.

### 4. Resource Allocator (`frontend/src/components/ResourceCommand.jsx`)
- **Visual Scheduler:** Drag-and-drop staff/equipment onto a calendar grid.
- **Conflict Detection:** Highlights resource conflicts (e.g., staff double-booked).
- **HR/Leave Tracking:** Special handling for sick leave, annual leave, training.
- **Filtering:** Filter resources and projects by various criteria.
- **Editing:** Modal for editing allocation details (dates, category, notes).

### 5. Invoicing (`frontend/src/components/InvoiceBuilder.jsx`)
- **Creation:** Generate invoices from quotes or manually add line items.
- **Details:** Track client, dates, status, total amounts.
- **Integration:** Xero integration for syncing invoices to accounting software.

### 6. Clients (`frontend/src/components/Clients/Clients.jsx`)
- **CRM:** Centralized management of client information.
- **Project Linking:** Link clients to specific projects and quotes.

### 7. Staff (`frontend/src/components/EnhancedStaff.jsx`)
- **HR Management:** Track staff details, roles, pay rates, charge-out rates.
- **Allocation:** Integrated with Resource Allocator.

### 8. Equipment (`frontend/src/components/EnhancedEquipment.jsx`)
- **Fleet Management:** Track equipment details, cost rates, availability.
- **Allocation:** Integrated with Resource Allocator.

### 9. Materials Library (`frontend/src/components/EnhancedNodes.jsx`)
- **Inventory:** Centralized database of materials (nodes) with pricing and units.
- **Quote Integration:** Used by Quote Builder for material estimation.

### 10. Reports (`frontend/src/components/PinnacleIntelligentReports.jsx`)
- **Overview:** Generate various reports (financial, project progress, resource utilization).
- **Customization:** Tools for creating custom report layouts.

### 11. Workflows (`frontend/src/components/WorkflowBuilder/WorkflowBuilder.jsx`)
- **Visual Builder:** Drag-and-drop interface for designing operational workflows.
- **AI Generation:** AI can create complex workflows from natural language descriptions.
- **Status Tracking:** Nodes can have statuses (pending, in-progress, completed) for process management.

### 12. Authentication & Authorization
- **JWT (JSON Web Tokens):** Secure token-based authentication.
- **Roles:** `admin`, `manager`, `user` roles (`backend/src/middleware/auth.js`).
- **Session Management:** Token refresh mechanism.

### 13. UI/UX Components (General)
- **Error Boundary:** Catches and gracefully handles rendering errors.
- **Command Palette:** Global search and quick actions.
- **Notification Provider:** System-wide toast notifications.
- **Settings Provider:** User-specific settings (dark mode, preferences).
- **Drag-to-Scroll Nav:** Enhanced navigation experience.

---

## 🔮 Future Enhancements (The Roadmap for Gemini 3)
1.  **Multi-Tenancy:** Upgrade `User` model to `Organization` model to allow teams and permission hierarchies.
2.  **Offline PWA:** Implement `dexie.js` in frontend for robust offline data sync (critical for field workers).
3.  **Cross-Project Analytics:** Enhance Dashboard with advanced analytics across *all* projects (e.g., staff utilization heatmaps, global safety trends).
4.  **Integration Hub Expansion:** Expand Xero integration (two-way sync), add QuickBooks, Procore APIs.
5.  **Dedicated Mobile App:** Explore native app development (React Native/Flutter) for deeper device integration.

**Codebase State:** STABLE. AI Logic is MAXIMIZED for performance and intelligence. UI is POLISHED and GLITCH-FREE.