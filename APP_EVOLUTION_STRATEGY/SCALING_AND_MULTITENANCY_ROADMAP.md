# [INTERNAL PROTOCOL] SCALING & MULTI-TENANCY ROADMAP
## MASTERDIARYAPP OFFICIAL V2: THE UNICORN ARCHITECTURE

> **MISSION:** Transition from a single-user "Sovereign Tool" to a massive, multi-tenant industrial platform that runs on slow workplace hardware while handling hundreds of concurrent staff members.

---

## 1. PHASE 1: CODE ATOMIZATION (CLEAN & FAST)

### A. The "God Component" Deconstruction
- **Target:** `PaintDiary.jsx` (~96KB)
- **Strategy:** Break into functional sub-components:
  - `CanvasManager.jsx`: Handles React Flow state and node placement.
  - `ResourceDock.jsx`: Handles the sidebar and drag-and-drop.
  - `TimelineEngine.js`: Handles the math and time propagation logic.
  - `IntelligenceLayer.jsx`: Handles the AI overlays.
- **Goal:** Files must not exceed **250 lines** or **10KB** each. This makes the app load faster on cheap laptops and easier to debug.

### B. The "Slow Laptop" Performance Mode
- **Feature:** Implement a "Performance Toggle" (Low/High Fidelity).
- **Optimization:** 
  - **Low Fidelity:** Disables `backdrop-blur`, `noise texture`, `animated gradients`, and `neural glows`. 
  - **Virtualization:** Uses `React.memo` and `windowing` for the Gantt Chart and Item Lists to only render what's on screen.
  - **CSS:** Replaces heavy Framer Motion animations with lightweight native CSS transitions.

---

## 2. PHASE 2: TRUE MULTI-TENANCY (THE BUSINESS ENGINE)

### A. The Organization Node
- **Database Schema Update:** 
  - Every table (Users, Projects, Diaries, Invoices) must have an `organizationId` (UUID).
  - Middleware must wrap every Sequelize query with `{ where: { organizationId: req.user.organizationId } }` to prevent data leakage between businesses.
- **Sovereign Isolation:** Business A must never see Business B's data, even if they share the same backend.

### B. Role-Based Access Control (RBAC)
- **Roles:**
  - `Sovereign (Owner):` Full financial visibility, AI Co-Founder access, user management.
  - `Planner (Office):` Scheduling, Quotes, Invoices, no administrative control.
  - `Foreman (Field):` Site Diaries, Safety Forms, Resource Allocation only.
  - `Worker (Site):` View schedule, clock in/out, view safety documents.

### C. Simultaneous Execution (Concurrent Users)
- **Real-Time Sync:** Move from "Polling" to "WebSockets" (Socket.io) for the Chronos Grid and Timeline Canvas.
- **Conflict Resolution:** If two Foremen edit the same Site Diary, the system must show "Live Presence" (e.g., "John is editing this node...") and handle state merges gracefully.

---

## 3. PHASE 3: SERVICE DECOUPLING (THE ENTERPRISE BACKEND)

### A. Prompt Engineering Library
- **Strategy:** Extract all AI prompts from `aiController.js` into a dedicated `backend/src/services/prompts/` directory.
- **Benefit:** Allows you to update the "Foreman Persona" without touching the core application logic.

### B. The "Math Service" (Zero-Jitter Engine)
- **Strategy:** Create a dedicated `FinancialCalculationsService.js`.
- **Logic:** Move all cost, profit, and margin calculations out of the Controllers and into this service. This service must be 100% unit-tested for accuracy before any release.

---

## 4. PHASE 4: THE UNICORN FEATURES (LEVEL 18 AGENCY)

- **Autonomous Invoicing:** Sentinel automatically drafts invoices based on verified Site Diary nodes.
- **Geo-Fenced Safety:** Safety Forms are automatically "injected" onto a user's phone when their GPS enters a project site.
- **Predictive Resource Leveling:** AI analyzes 10,000 parallel scenarios to find the "Ideal Path" for fleet movement to minimize fuel and idle time.

---
**[EOF // THE ROADMAP TO INCREDIBLE STATUS]**
