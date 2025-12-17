# MasterDiaryApp OS (Pinnacle Edition) v2.0

**The World's Most Advanced Construction Management Operating System.**

MasterDiaryApp OS is a high-fidelity, AI-powered SaaS platform designed to replace fragmented spreadsheets with a unified, visual, and intelligent interface. Built for speed, precision, and automation using a "Zero-Context" AI architecture.

---

## 🚀 Key Innovation: "Zero-Context" AI Engine
We have pioneered a **"Zero-Context" AI Engine** (powered by **Google Gemini** & **Pinnacle AI**) that delivers complex generative tasks in **under 6 seconds**.

*   **⚡ Ultra-Fast Quote Builder:** `generateQuote` endpoint utilizes a "Zero-Context" strategy with a strict 1000-token limit to instantly generate visual node graphs (Materials, Labor, Equipment) from simple prompts.
*   **🧠 Smart Diary Copilot:** Optimized with a 300-token limit to parse natural language site logs ("Crew of 3 did 50m fencing") into structured data in real-time.
*   **🤖 Neural Core:** The "Chief Construction Analyst" module (`analyzeMapZone`, `dashboardInsights`) performs deep strategic reviews of project financials and risks.

---

## 💎 Core Modules & Capabilities

### 1. 🏗️ Visual Quote Builder (`/quotes`)
*   **Infinite Canvas:** React Flow-powered drag-and-drop interface.
*   **AI "Blueprint Mode":** Generates entire project structures (Nodes & Edges) with "Systems Thinking" (e.g., auto-adding Labor/Plant to Materials).
*   **Smart Links:** Actionable nodes that link directly to app functions.
*   **Real-time Costing:** Instant margin and tax calculations.

### 2. ⚡ Workflow Automation Engine (`/workflows`)
*   **Visual Logic:** Drag-and-drop builder for business logic (Triggers, Actions, Decisions).
*   **Integrated Actions:**
    *   `create_invoice`: Auto-draft invoices based on milestones.
    *   `assign_staff`: Auto-allocate resources.
    *   `send_notification`: Real-time alerts.
*   **AI Architect:** "Generate Workflow" builds complex logic chains from a single sentence.

### 3. 📅 Smart Site Diary (`/diary`)
*   **Natural Language Entry:** Type freely; AI extracts Staff, Activities, and Asset usage.
*   **Offline-First Architecture:** Powered by **Dexie.js** (IndexedDB), enabling full functionality without internet access. Data syncs automatically when online.
*   **Weather Integration:** Auto-fetches site weather context.

### 4. 🛡️ Safety & Compliance (`/safety`)
*   **AI Safety Officer:** Generates ISO 45001-compliant Task Hazard Analyses (THA) via `analyzeSafetyTask`.
*   **Document Intelligence:** `analyzeDocument` scans PDFs/Images to extract key risks and compliance dates.

### 5. 🌍 GeoCore Map Layer (`/map`)
*   **AI Spatial Analysis:** `generateMapElements` creates site zones (Logistics, Safety, Exclusion) and configures 3D/Satellite views based on context.

---

## 🛠️ Technical Stack (The "Pinnacle" Stack)

*   **Frontend:** React 18, Vite, TailwindCSS, Framer Motion, React Flow.
*   **State & Storage:** Redux Toolkit + **Dexie.js (IndexedDB)** for robust offline support.
*   **PWA:** `vite-plugin-pwa` integrated for installable app capabilities.
*   **Backend:** Node.js, Express.
*   **Database:** Sequelize ORM (supporting **SQLite** & **PostgreSQL**).
*   **AI Layer:** Google Gemini (via `@google/generative-ai`) managed by `grokService.js`.
*   **Deployment:** Docker, Google Cloud Run.

---

## 📦 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Billyfr77/MasterDiaryAppOfficialV2.git
    cd MasterDiaryAppOfficialV2
    ```

2.  **Install Dependencies**
    ```bash
    # Install Backend
    cd backend
    npm install

    # Install Frontend
    cd ../frontend
    npm install
    ```

3.  **Run Development Servers**
    ```bash
    # Terminal 1 (Backend - Port 5003)
    cd backend
    npm run dev

    # Terminal 2 (Frontend - Port 5173)
    cd frontend
    npm run dev
    ```

4.  **Environment Variables**
    Ensure your `.env` file in `backend/` is configured with:
    *   `GEMINI_API_KEY` (for AI features)
    *   `DB_DIALECT` (sqlite/postgres)

---

## 🔮 Roadmap to Perfection

1.  **Multiplayer Collaboration:** Integrate Yjs for real-time concurrent editing on the Quote Canvas.
2.  **Financial Sync:** Two-way sync with Xero/QuickBooks APIs.
3.  **Mobile Native:** Wrap the PWA in Capacitor for App Store deployment.

---

**MasterDiaryApp OS** - Build Faster. Quote Smarter. Automate Everything.