# 🪐 MasterDiaryOS: The Sovereign Operating System for Construction

> **"Not just an app. A Neural Co-Founder for the Built World."**

MasterDiaryOS is a **Generative Operating System** designed to replace the fragmented, manual administration of construction projects with a unified, autonomous, and visually immersive "Neural Lattice."

It fuses **Generative UI** (visual node-based editing) with a **Sovereign AI Oracle** (Grok 4.1 reasoning engine) to move the industry from "Data Entry" to **"Data Architecture."**

---

## 🌌 The Vision: "Zero-Click Administration"

Construction software is broken. It treats users like data entry clerks.
MasterDiaryOS treats users like **Architects**.

*   **Old Way:** Type a quote into a spreadsheet. Hope you didn't miss a zero.
*   **The MasterDiary Way:** Tell the AI, *"Build a quote for a luxury pool deck."*
    *   The **AI Generates** the visual circuit of materials, labor, and machinery.
    *   The **Oracle Simulates** 10,000 parallel futures to predict your profit margin.
    *   The **System Executes** the workflows automatically.

We are building the **JARVIS** for construction—an omnipresent, intelligent layer that watches, predicts, and executes.

---

## 🧠 The Neural Brain (Architecture)

At the core of the system is the **Neural Intelligence Engine**, powered by a custom integration of **Grok 4.1 (x.ai)**.

### 1. The Sovereign Oracle (`/ai/oracle-sync`)
A specialized Monte Carlo simulation engine that doesn't just "guess"; it mathematically models the future.
*   **10,000 Parallel Scenarios:** Every time you build a quote, the Oracle runs 10,000 simulations against market volatility, crew efficiency logs, and weather patterns.
*   **Predictive Outputs:**
    *   **Bid Success Probability:** "84% chance to win at this margin."
    *   **Velocity Drift:** "You are burning cash 4.2% faster than schedule."
    *   **Ideal Margin Point:** "Increase markup to 26.4% to maximize yield."

### 2. The Agency Engine (`/ai/execute-agency`)
The system possesses **Level 4 Autonomy**. It observes project data and **proposes directives**.
*   *Example:* "I noticed the concrete pour is delayed. I have drafted a Variation Order and alerted the Site Foreman. Approve?"
*   **Zero-Context Topology:** We strip database objects to their bare IDs/Roles before sending to AI, ensuring maximum privacy while retaining context awareness.

### 3. Generative UI (The "Lattice")
The AI interacts with the user by **building the interface**.
*   When you ask for a workflow, the backend sends a JSON graph (`nodes` + `edges`).
*   The frontend renders this as a living, interactive circuit board using **React Flow**.
*   **Benefit:** You don't read the AI's answer; you *edit* it.

---

## ⚡ Core Workloops & Features

### 1. 🏗️ The Neural Quote Builder ("The Patent-Pending Engine")
A visual, node-based estimation environment.
*   **Visual Logic:** Drag `Area Nodes` (Rooms) and connect them to `Material Nodes` (Paint, Timber). The system auto-calculates quantities based on coverage rates and area dimensions.
*   **Smart Linking:** Connect a `Zone` to `Labor`. If the Zone size changes, the Labor hours auto-recalculate instantly.
*   **Ghost Nodes:** The AI proactively suggests missing items (e.g., "You added *Drywall*; do you need *Joint Compound*?") as translucent nodes you can click to materialize.
*   **Heatmap Mode:** Visualize cost distribution. High-cost nodes glow red; low-cost nodes dim.

### 2. 🔄 The Workflow Architect
A logic-flow editor for designing business processes.
*   **Time Machine:** Undo/Redo with a visual timeline scrubber. Jump back to any state in the session.
*   **Simulation Injection:** Press "PULSE" to inject a virtual packet into your workflow. Watch it travel through the logic gates, highlighting bottlenecks or broken paths in real-time.
*   **Architectural Layouts:** Auto-arrange complex graphs into "Star," "Grid," "Radial," or "Neural Pipeline" formations with one click.

### 3. 🎨 PaintDiary (Visual Site Logs)
The daily diary, reimagined as a digital canvas.
*   **Draggable Reality:** Drag photos, weather icons, and staff onto a timeline canvas.
*   **Chronos Nodes:** Link staff to time nodes. If a delay happens, drag the delay node onto the timeline, and it auto-updates the timesheets for the connected crew.
*   **Forensic Lens:** Toggle "Forensic Mode" to highlight safety risks and compliance gaps in purple.

### 4. 🦅 Executive Pulse Dashboard
The "God Mode" view for business owners.
*   **PRISM Analysis:** Real-time velocity tracking of all active projects.
*   **Neural Feed:** A scrolling feed of AI-detected anomalies and strategic advice.
*   **Financial Telemetry:** Live visualization of burn rates vs. revenue.

---

## 🛠️ Technical Stack (The "Lamborghini" Under the Hood)

### Frontend (The Glass)
*   **Framework:** React 18 + Vite (Blazing fast HMR)
*   **Visualization:** React Flow (The engine behind the node graphs)
*   **Styling:** Tailwind CSS (Glassmorphism, Neon gradients, "Cyber-Industrial" aesthetic)
*   **State:** Context API + LocalStorage Persistence

### Backend (The Engine)
*   **Runtime:** Node.js + Express
*   **ORM:** Sequelize (SQL-agnostic)
*   **Database:** 
    *   **Dev:** SQLite (Zero-config, portable)
    *   **Prod:** PostgreSQL (Enterprise scale)
*   **AI Controller:** A custom orchestration layer that sanitizes inputs, manages "Context Windows," and communicates with the `Grok 4.1` Reasoning API.

### Cost Efficiency
*   **Optimized Token Usage:** By stripping metadata and using "Circuit-Only" prompts, we achieve **< $2.00/month** in AI costs per heavy power user.
*   **High Margin:** At a standard SaaS price point, the AI cost is negligible (<2%), ensuring massive scalability.

---

## 🚀 How to Run

1.  **Install Dependencies:**
    ```bash
    cd frontend && npm install
    cd ../backend && npm install
    ```

2.  **Start the Neural Core (Backend):**
    ```bash
    cd backend
    npm start
    ```
    *Listens on Port 5000*

3.  **Launch the Visual Interface (Frontend):**
    ```bash
    cd frontend
    npm run dev
    ```
    *Accessible at http://localhost:5173*

4.  **Ignite the AI:**
    Ensure `GROK_API_KEY` is set in `backend/.env` to enable the Sovereign Oracle.

---

> **MasterDiaryOS**
> *Built for the builders. Powered by the stars.*
>
> **Status:** 🟢 Operational
> **Version:** V2 (Neural-Ready)
> **License:** Proprietary
