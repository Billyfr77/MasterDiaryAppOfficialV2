# MasterDiaryApp v2 - System Context & Technical Reference

> **SYSTEM INSTRUCTION FOR AI AGENTS:**
> This file contains the absolute truth about the application's current architecture, data models, and operational logic. Read this to understand the codebase state before initiating any code modifications.

## 1. Technical Stack & Architecture

### Frontend (Client)
*   **Framework:** React 18 (Vite Build System)
*   **Routing:** `react-router-dom` v7 (Client-side routing)
*   **State Management:** Local React state (`useState`, `useReducer`) + Prop drilling. No global Redux store currently active for core logic.
*   **Styling:** Tailwind CSS (Utility-first).
*   **HTTP Client:** `axios` instance configured in `src/utils/api.js` (Handles Auth Headers).
*   **Visualization:** 
    *   `@xyflow/react` (React Flow) for the Quote Builder canvas.
    *   `@react-google-maps/api` for the Map Builder and Live Maps.
    *   `chart.js` / `react-chartjs-2` for dashboard analytics.

### Backend (Server)
*   **Runtime:** Node.js 20+
*   **Framework:** Express.js
*   **ORM:** Sequelize (v6) with PostgreSQL dialect.
*   **Database:** 
    *   **Production:** Google Cloud SQL (PostgreSQL 15+).
    *   **Dev:** SQLite (`database.sqlite`) or Local Postgres.
*   **Authentication:** JWT (Access Token) + Refresh Token (HttpOnly Cookie).
*   **AI Engine:** Google Gemini (via `@google/generative-ai`) integrated in `aiController.js`.

### DevOps & Cloud
*   **Containerization:** Docker (Multi-stage build).
    *   *Build Args:* `VITE_GOOGLE_MAPS_API_KEY` must be passed at build time.
*   **CI/CD:** Google Cloud Build (configured via `cloudbuild.yaml`).
*   **Hosting:** Google Cloud Run (Service: `master-diary-app-v2`).
*   **Scripting:** PowerShell (`deploy_cloud_run.ps1`) automates the build-submit-deploy loop.

---

## 2. Data Models (Schema Reference)

### **Project**
*   **Concept:** The central entity. All other resources link back to this.
*   **Fields:** `id` (UUID), `name`, `client`, `status` ('active', 'completed'), `site` (Address), `value` (Contract Value), `lat`/`lng`, `financials` (JSONB for caching totals).

### **Quote**
*   **Concept:** Estimating tool.
*   **Fields:** 
    *   `nodes` (JSONB): Array of visual nodes from React Flow (visual positions + data).
    *   `staff` (JSONB): List of staff ID + hours.
    *   `equipment` (JSONB): List of equipment ID + hours.
    *   `totalCost` / `totalRevenue` / `marginPct`: Calculated server-side on save/update.
    *   `status`: 'draft', 'approved', etc.

### **Diary**
*   **Concept:** Daily site reporting.
*   **Fields:** `date`, `weather` (String), `notes` (Text), `site_photos` (JSON array of URLs).
*   **Logic:** One diary entry per project per day usually, but supports multiple.

### **Allocation**
*   **Concept:** Resource scheduling.
*   **Fields:** `resourceId`, `resourceType` ('staff' | 'equipment'), `startDate`, `endDate`.
*   **Mechanic:** Links a resource to a Project for a date range. Used by the Map Builder timeline.

### **MapAsset**
*   **Concept:** Geo-spatial data for the Map Builder.
*   **Fields:** 
    *   `type`: 'ProjectZone' (Polygon), 'OfficeZone' (Polygon), 'Point'.
    *   `coordinates`: Array of Lat/Lng objects.
    *   `properties`: JSONB for color, metadata, and linked Project ID.

### **SafetyForm**
*   **Concept:** Compliance documents.
*   **Fields:** `type` ('SWMS', 'INCIDENT'), `data` (JSON form fields), `signatures` (JSON array).

---

## 3. Key Component Mechanics

### **Map Builder (`VisualMapBuilder.jsx`)**
*   **State:** Uses `localStorage` key `master_diary_map_view` to persist Zoom/Center between reloads.
*   **Data:** Fetches Projects and MapAssets in parallel.
*   **Interactivity:** 
    *   Drawing Manager allows creating Polygons.
    *   "Drop" logic allows dragging Projects from the sidebar onto the map to create a new Zone.
*   **Rendering:** Uses `OverlayView` for custom HTML markers (RichMarker) that show financial stats when zoomed in.

### **Quote Builder (`QuoteBuilder.jsx`)**
*   **Canvas:** Infinite canvas powered by React Flow.
*   **Nodes:** 
    *   `glass`: Represents a material/item.
    *   `dimension`: Visual area (room/zone).
*   **Logic:** Dragging an item from the sidebar onto a `dimension` node triggers auto-calculation of quantity based on the dimension's area and the material's coverage stats.
*   **Persistence:** Saves the entire node graph to the `Quote` model's `nodes` JSON field.

### **AI Controller (`aiController.js`)**
*   **Routes:** `/api/ai/chat`, `/api/ai/summary`, `/api/ai/workflow`.
*   **Mechanic:** Accepts a `prompt` and `context` (JSON data about the project/diary). Wraps this in a System Prompt defining the AI as "Pinnacle AI" (Construction Expert) and sends to Gemini Pro. Returns text or JSON.

---

## 4. API & Data Flow

1.  **Request:** Frontend calls `api.get('/endpoint')`.
2.  **Interceptor:** `src/utils/api.js` attaches `Authorization: Bearer <token>`.
3.  **Middleware:** `authenticateToken` in backend verifies JWT.
4.  **Controller:** Queries DB via Sequelize models.
5.  **Response:** Returns JSON.

**Special Handling:**
*   **Quotes:** `getAllQuotes` endpoint accepts `?projectId=UUID` to filter results.
*   **Uploads:** `uploads.js` handles `multer` storage (local `uploads/` directory in container). *Note: In Cloud Run, local filesystem is ephemeral. Persistent storage requires Google Cloud Storage integration.*

---

## 5. Deployment Procedures

**To Update the Application:**

1.  **Modify Code:** Make changes to Frontend or Backend.
2.  **Build & Deploy:** Run the PowerShell script:
    ```powershell
    .\deploy_cloud_run.ps1
    ```
    *   **Mechanism:** This script calls `gcloud builds submit` using `cloudbuild.yaml`.
    *   **Config:** `cloudbuild.yaml` injects the `VITE_GOOGLE_MAPS_API_KEY` build arg.
    *   **Runtime:** Cloud Run automatically migrates traffic to the new revision.

**Environment Variables Required (Cloud Run):**
*   `NODE_ENV`: 'production'
*   `DB_SOCKET_PATH`: `/cloudsql/<project:region:instance>`
*   `DB_PASSWORD`: (Secure Password)
*   `DB_USER`: (e.g., postgres)
*   `DB_NAME`: (e.g., postgres)
*   `JWT_SECRET`: (Signing key)

---
**Agent Note:** This file represents the **operational reality** of the system. Use this structure to navigate files and understand dependencies when executing tasks.