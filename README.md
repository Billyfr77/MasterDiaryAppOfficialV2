# MasterDiaryOS — AI-Native Construction Operating System 🚀

**MasterDiaryOS** is a visual, graph-based operating system designed to unify the entire construction lifecycle—from estimation to execution and invoicing—into a single, high-performance node engine. It is built to feel like the **Unreal Engine of Project Management**.

---

## 🧠 System Architecture & Philosophy

### 1. The Unified Graph Engine (@xyflow/react)
At the heart of every module is a custom-tuned React Flow implementation.
- **Node-Based Truth:** Data isn't just stored in rows; it exists as interactive nodes (Staff, Equipment, Materials, Time, Zones).
- **Relational Logic:** Connections (edges) aren't just visual; they carry **logic propagation**.
  - *Example:* Connecting a `Delay` node to a `Chronos` (Time) node automatically recalculates the duration for every linked resource in that branch.
  - *Example:* Connecting an `Allowance` node to a `Staff` node instantly injects financial overhead into that specific record.

### 2. The "Power Layout" Standard
Every high-performance module (Diary, Quote, Map) follows this strict 3-tier structure:
1.  **PowerHeader:** HUD-style top bar displaying real-time financial "Pulse" (Cost, Revenue, Profit, Productivity %).
2.  **Visual Workspace:**
    - **Resource Dock (Left):** Context-aware library of draggable assets.
    - **Infinite Canvas (Right):** The primary node-graph interaction area.
3.  **Data Manifest (Bottom):** A premium ledger (ItemList) that synchronized 1:1 with the canvas, allowing for bulk editing and fine-tuned numeric input.

---

## 🧩 Core Modules & Intelligence

### 🏗️ AI Blueprint Engine (Quote Builder)
- **Primary Aesthetic:** Arctic Blue / Indigo.
- **Logic:** Converts "Scope of Works" text into a full visual bill of materials.
- **Wormhole Nodes:** Sub-containers that group nested costs, allowing for "Drill-Down" project organization.

### 🎨 AI Diary Engine (Paint Your Day)
- **Primary Aesthetic:** Jade Emerald / Teal.
- **Chronos System:** The "Time Hub" concept. All resources attached to a Chronos node inherit its start/finish times.
- **Overtime Engine:** Multi-tier calculation logic (1.5x, 2.0x, Night Rates) applied automatically based on node time data.
- **Diary Harvesting:** A bridging service that allows the Invoice Builder to "scan" completed diary entries and convert node clusters into billable line items.

### 🛡️ AI Safety & Workflow
- **Safety Dashboard:** Automated SWMS and Risk Assessment generation via Grok-4 reasoning.
- **Automation Graph:** A visual workflow builder where "Trigger" nodes (e.g., `quote.approved`) spawn "Action" nodes (e.g., `create_project`, `send_notification`).

### 🗺️ AI Map Builder (GeoCore)
- **Function:** Geo-spatial site planning using Mapbox/Google Maps integration.
- **Interaction:** Drag resources directly onto high-res satellite imagery to define compounds, exclusion zones, and site access routes.

---

## 🛠️ Technical Implementation Details (For Future AI)

### Backend (Node.js/Express/Sequelize)
- **Models:** Centralized in `backend/src/models`. `Diary`, `Project`, `Quote`, and `Allocation` are the core entities.
- **AI Integration (`grokService.js`):** Uses `grok-4-1-fast-reasoning` for all JSON-structured generation.
- **Normalization:** The backend expects `canvasData` to be an array of entries. Each entry contains `items`, `extraNodes`, and `edges`.

### Frontend (React/Vite/Tailwind)
- **State Management:** Heavy use of custom hooks (e.g., `useDiaryEngine`, `useTimelineEngine`) to separate graph logic from UI rendering.
- **Communication:** Standardized `api` utility in `frontend/src/utils/api.js`.
- **Styling:** Custom "Enterprise Data Visuals" theme with #0a0a0c base, noise textures, and animated indigo/violet aurora glows.

---

## 🚀 Pre-Launch Priorities (Status: 98%)
1.  **Human-Approval Layers:** Finalizing UI modals for "Workflow Approval" nodes.
2.  **Reliability Polish:** Hardening `canvasData` persistence (Handled).
3.  **Xero Integration:** Export logic for harvested invoices.

**Founder:** Billy Fraser  
**Philosophy:** Don't build a tool. Build a new category.