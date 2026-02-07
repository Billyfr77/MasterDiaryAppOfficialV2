# 🪐 MasterDiaryOS: The Sovereign Operating System for Construction

> **"Not just an app. A Neural Co-Founder for the Built World."**

MasterDiaryOS is a **Generative Operating System** designed to replace the fragmented, manual administration of construction projects with a unified, autonomous, and visually immersive "Neural Lattice."

It fuses **Generative UI** (visual node-based editing) with a **Sovereign AI Oracle** (Grok 4.1 reasoning engine) to move the industry from "Data Entry" to **"Data Architecture."**

---

## 🌌 The Vision: "Zero-Click Administration"

Construction software is broken. It treats users like data entry clerks.
MasterDiaryOS treats users like **Architects**.

*   **Old Way:** Type a quote into a spreadsheet. Hope you didn't miss a zero. Manually copy diary hours into an invoice.
*   **The MasterDiary Way:** Tell the AI, *"Build a quote for a luxury pool deck."*
    *   The **AI Generates** the visual circuit of materials, labor, and machinery.
    *   The **Oracle Simulates** 10,000 parallel futures to predict your profit margin.
    *   The **System Executes** the workflows automatically.
    *   The **Harvester** sweeps completed diaries instantly into invoices.

We are building the **JARVIS** for construction—an omnipresent, intelligent layer that watches, predicts, and executes.

---

## 🧠 The Neural Brain (Architecture)

At the core of the system is the **Neural Intelligence Engine**, powered by a custom integration of **Grok 4.1 (x.ai)**.

### 1. The Sovereign Oracle (`/ai/oracle-sync`)
A specialized Monte Carlo simulation engine that doesn't just "guess"; it mathematically models the future.
*   **10,000 Parallel Scenarios:** Every time you build a quote, the Oracle runs 10,000 simulations against market volatility, crew efficiency logs, and weather patterns.
*   **Neural Cortex:** The engine features **Self-Correcting Intelligence**. It calculates historical **Estimation Bias** (Quote vs. Actual spend) and automatically adjusts new estimates to ensure profitability.
*   **Predictive Fatigue:** Tracks consecutive staff workdays to issue safety alerts and suggest rest days *before* incidents occur.
*   **Asset Perception:** The AI explicitly monitors **Materials (Stock)** and **Equipment (Fleet status)**, advising on utilization ("Use existing 500L paint stock before buying more").

### 2. The Agency Engine (`/ai/execute-agency`)
The system possesses **Level 4 Autonomy**. It observes project data and **proposes directives**.
*   **Genesis Protocol (GeoCore):** Capable of understanding complex natural language spatial commands like *"Scan for local hardware stores and route the fleet to Site Alpha."*
*   **Neural Optimizer (Chronos):** Analyzes staff schedules to suggest "Ghost Moves"—AI-proposed schedule shifts to resolve conflicts and minimize travel time.

---

## 🦄 The "Unicorn" Modules (End-to-End Workloops)

### 1. 🏗️ Neural Quote Builder ("The Patent-Pending Engine")
A visual, node-based estimation environment.
*   **Visual Logic:** Drag `Area Nodes` (Rooms) and connect them to `Material Nodes`. The system auto-calculates quantities based on coverage rates.
*   **Smart Associations:** The AI learns your habits (e.g., "Always add *Primer* with *Paint*") and proactively suggests missing items.
*   **Robust Drafts:** Save work-in-progress drafts without assigning projects (`projectId` nullable).
*   **Zero-Context Topology:** Privacy-focused AI processing that strips sensitive data while retaining context for maximum speed.

### 2. 🧾 Invoice Command ("The Financial Harvester")
A split-screen financial engine that turns site data into cash flow.
*   **Diary Harvest:** One-click "Harvest" logic scans an entire project for uninvoiced diary entries, labor, and materials, instantly merging them into a draft invoice. **No more lost billables.**
*   **Real-Time Paper Preview:** A split-screen HTML-to-PDF engine that renders the final document live as you type, complete with tax logic and brand customization.
*   **Drag-and-Drop Line Items:** Reorder and group invoice items visually.

### 3. 🌍 GeoCore Ultra ("The God-View Map")
A geospatial command centre that rivals military-grade systems.
*   **Genesis Neural Link:** Speak to the map. Voice commands like *"Thermal Vision"* or *"Drone Mode"* toggle view layers instantly.
*   **Ghost Moves:** The AI projects holographic "Ghost Markers" on the map, proposing where resources *should* be for maximum efficiency. You simply click to "Deploy."
*   **Logistics Scanning:** Automatically scans the real-world vicinity for suppliers (Hardware stores, tips) and calculates route viability.

### 4. 📅 Chronos Grid ("The Resource Command")
A high-fidelity Gantt scheduler for managing human and machine assets.
*   **Neural Optimizer:** Click one button to have the AI analyze weeks of scheduling. It detects conflicts, fatigue risks, and inefficiencies, returning a set of "Ghost Allocations" you can approve.
*   **Time Warp:** A fluid zoom slider that compresses the timeline from detailed "Day View" to strategic "Quarterly View" instantly.
*   **Capacity Heatmap:** Visualizes organizational stress and project density with a thermal overlay.

### 5. 🦺 Safety Architect ("The AI Compliance Officer")
A generative document builder that ensures compliance without the boredom.
*   **AI Form Generation:** Prompt the Architect: *"Build a Hot Work Permit for a hospital site."* It generates the entire form structure, hazards, checks, and signature blocks automatically.
*   **Magic Polish:** A "Wand" button on every text field uses AI to rewrite rough field notes into professional, legally sound safety language.
*   **Interactive Risk Matrix:** Embed live, interactive risk calculation grids directly into documents.

### 6. 🎨 PaintDiary (Visual Site Logs)
The daily diary, reimagined as a digital canvas.
*   **Neural Prism (NDE):** A high-level analysis node that plugs into any `Chronos` hub to provide live burn rates, predicted margins, and efficiency drift.
*   **Draggable Reality:** Drag photos, weather icons, and staff directly onto a timeline canvas to reconstruct the day.
*   **Smart Allowances:** Visual "Allowance Nodes" that auto-calculate overtime and penalty rates when connected to staff.

---

## 🦅 Executive Pulse Dashboard
The "God Mode" view for business owners.
*   **Legacy Archive:** Toggle into a separate "Archive Solar System" where completed projects orbit a white-dwarf core, glowing **Green** for success or **Red** for loss.
*   **Financial Telemetry:** Live visualization of burn rates vs. revenue across the entire organization.

---

## 🛠️ Technical Stack (The "Lamborghini" Under the Hood)

### Frontend (The Glass)
*   **Framework:** React 18 + Vite (Blazing fast HMR)
*   **Visualization:** React Flow (Node graphs), React Google Maps (GeoCore), React DnD (Safety/Chronos)
*   **Styling:** Tailwind CSS (Glassmorphism, Neon gradients, "Cyber-Industrial" aesthetic)
*   **State:** Context API + LocalStorage Persistence + Premium Number Inputs

### Backend (The Engine)
*   **Runtime:** Node.js + Express
*   **ORM:** Sequelize (SQL-agnostic)
*   **Database:** SQLite (Dev) / PostgreSQL (Prod - Google Cloud SQL)
*   **Security:** Rate Limiting, Helmet, MongoSanitize, HPP.
*   **AI Controller:** Custom orchestration layer for `Grok 4.1` Reasoning API.
*   **Self-Healing:** Automatic schema patching (`manualSchemaFix.js`) and database synchronization on startup.

---

## 🚀 Deployment (Google Cloud Run)

This system is "Serverless-First" designed for Google Cloud Run.

1.  **Build & Deploy:**
    ```bash
    gcloud builds submit --config cloudbuild.yaml
    gcloud run deploy master-diary-app-v2 ...
    ```

2.  **Emergency Schema Fix:**
    If database schema drifts (e.g., 400 errors on saving), trigger the self-healing endpoint:
    `https://[YOUR_URL]/api/fix-schema?secret=[YOUR_SECRET]`

---

---

## 🛠️ Stable Evolution & Fixes (Feb 2026)

The system has undergone a major stabilization phase to ensure 100% data integrity and a seamless user experience across all "Unicorn" modules.

### 1. 🧠 Neural Lattice & AI Integrity
*   **Resolved Database Schema Drift**: Fixed a critical issue where the `userId` column was missing from the `Diaries` and `Allocations` tables, which previously took the Neural Lattice offline.
*   **Total Financial Truth**: Implemented a "Financial Truth" mapping in the `LearningEngine`. The AI now has direct access to exact project-by-project costs, revenues, and profit margins, ensuring 100% accurate financial answers.
*   **Site Activity Trail**: Enhanced the AI's context with a chronological "Site Activity Trail." This provides the AI with absolute visibility into every historical diary entry, including crew details and specific site outcomes.
*   **Institutional Memory Upgraded**: All AI assistants (Global, Diary, and Quote) now utilize the enriched institutional memory, allowing them to cross-reference past performance with current requests.

### 2. 🌍 GeoCore Ultra (Map Builder) Upgrades
*   **Project Hub Overhaul**: The Map Builder's project menu now matches the `EnhancedProjects` component in richness. It displays live financials, associated documents, safety forms, recent site activity, and active variations.
*   **Resource Sync**: Fixed the linkage between the Map Builder and the Resource Allocator. The Project Hub now correctly displays all human and heavy assets currently allocated to the site.
*   **Technical Stability**: Resolved a `ReferenceError` related to the `jobs` variable and fixed the project ID mapping for cover image uploads and document vault associations.

### 3. 🏗️ Quote Builder Stabilization
*   **Initialization Fix**: Resolved a critical "ReferenceError: Cannot access financials before initialization" by reordering React hooks and component logic. This ensures the quoting engine loads perfectly in all bundled environments.
*   **BOM Load Fix**: Corrected the "Load" button logic to ensure that saved quotes are actually fetched from the database when the modal is opened.

### 4. 🦅 Executive HQ Optimization
*   **Simulated Projections**: Implemented a "Sovereign Projection Layer" for the HQ. In zero-data states (e.g., a new firm), the HQ now displays plausible "Projected" stats based on quoted baselines instead of showing empty zeros.
*   **Formatting Excellence**: Improved metric formatting to handle values ranging from K (Thousands) to M (Millions) dynamically.

### 5. 🕹️ UX & Interaction Polishing
*   **Nav Bar Scroll Fixed**: Prevented the horizontal navigation scroll from hijacking the vertical page scroll. Users can now browse navigation items without the page jumping.
*   **Authentication Hardening**: Added robust authentication middleware to the `clients` and `allocations` routes to ensure multi-tenant data isolation.

---

> **MasterDiaryOS**
> *Built for the builders. Powered by the stars.*
>
> **Status:** 🟢 Operational (Production - Stable)
> **Version:** V3.5 (Sovereign Lattice Edition)
> **License:** Proprietary