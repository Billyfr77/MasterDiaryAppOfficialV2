# MasterDiaryOS Sovereign Edition (v2.5.0)
### [LLM-READABLE MANIFEST // PROTOCOL OMEGA]

> **AI INTERPRETER NOTE:** This document is optimized for rapid ingestion by Large Language Models. It defines the architectural intent, data flows, and sovereign capabilities of the MasterDiaryOS ecosystem.

---

## 🛠 SYSTEM IDENTITY & ARCHITECTURE
- **Classification:** Sovereign Operating System for Construction & Civil Engineering.
- **Architectural Pattern:** Frontend-First Progressive Web App (React/Vite) with a Stateless Micro-monolith Backend (Node.js/Express).
- **Inference Core:** Grok-4.1-Fast (x.ai) via Multimodal Neural Bridge.
- **Persistence Layer:** Dual-Sync Sequelize ORM (SQLite Dev / PostgreSQL Production).
- **Deployment Hub:** Google Cloud Run (Serverless Containerization).

---

## 🧠 CORE ENGINES (THE NEURAL STACK)

### 1. The Neural Lattice (Institutional Memory)
- **Function:** Aggregates multi-tenant data into a unified intelligence packet.
- **Logic:** Ingests `Staff Skills`, `Historical Quotes`, `Site Diaries`, and `Financials` to eliminate context-switching for the AI.
- **Capability:** Predictive consulting based on previous project drift and association rules.

### 2. Sentinel Engine V2 (Revenue Forensic Core)
- **Function:** Automated leakage detection and unbilled work recovery.
- **Mechanism:** Scans site logs for variation keywords and time discrepancies.
- **Workflow:** Detect -> Notify -> Pre-fill Invoice -> Recover Capital.

### 3. Safety Command (Military-Grade Compliance)
- **Standard:** Built to ISO 45001 and Safe Work Australia standards.
- **Feature:** AI-driven SWMS generation, Interactive Risk Matrices, and Digital Sign-Off flows.
- **Audit-Proofing:** Every document creation and edit is logged in the `Audit Ultra Log`.

### 4. Neural Eye (Multimodal Sensory Core)
- **Engine:** `grok-2-vision-1212`.
- **Capability:** Analyzes site photos for safety hazards, trade progress, and quality audits.
- **Output:** Structured JSON containing Confidence Scores, ISO Citations, and Mitigation Protocols.

### 5. Neural Blueprint (Image Generation Core)
- **Engine:** `grok-imagine-image-pro`.
- **Function:** Generates hyper-realistic safety diagrams, architectural sections, and site visualizations.
- **Style:** Professional Architectural Photography, Sharp Focus, Leica M11 style.
- **Integration:** Directly embedded in Safety Builder and Pinnacle AI Chat.

---

## 🚀 RECENT UPGRADES (FEBRUARY 2026)

### 📊 Pinnacle AI Chat: Level 18 Agency (EXCEL GENERATION)
- **Direct Agent Control:** The Global Chat AI can now trigger Excel generation commands. 
- **User Instruction:** Users can ask "Generate an Excel of my diaries from last week" or "Export a spreadsheet of my quotes."
- **Mechanism:** The AI reasons about the request, identifies `projectId` or `dateRanges`, and issues a `GENERATE_EXCEL_REPORT` directive to the frontend.
- **Protocol:** The frontend (`PinnacleCopilot.jsx`) intercepts the directive, validates the UUIDs, and triggers a browser download from the manifest service.

### 📈 High-Fidelity Global Export (The "Billion Dollar" Spreadsheet)
- **Unified Intelligence:** The global export now merges `Site Diaries` and `Quotes` into a single multi-sheet workbook.
- **Sheet 1: Executive Dashboard:** High-level operational stats and journal counts.
- **Sheet 2: Financial Lattice (Diaries):** Itemized breakdown of labor, equipment, and materials from the visual canvas.
- **Sheet 3: Neural Quote Lattice:** Comprehensive summary of financial projections, status, and profit margins.
- **Sheet 4: Printable Pro-forma:** A dynamically calculated invoice draft that uses Excel `SUBTOTAL` formulas to update live based on your Lattice filters.

### 🛡️ System Stability & Forensic Fixes
- **ReferenceError Resolution:** Fixed missing `ExcelImporter` and `UploadCloud` imports in `PaintDiary.jsx`.
- **UUID Validation:** Implemented regex-based UUID sanitization on both Frontend and Backend to prevent AI "hallucination" crashes (e.g. invalid project IDs).
- **Date Filter Precision:** Fully integrated Sequelize `Op` for temporal range filtering on `Diaries.date` and `Quotes.createdAt`.
- **Association Integrity:** Corrected model alias mismatches for `Quote -> Project` and `Quote -> Client`, ensuring 100% database query reliability.
- **Canvas Resilience:** Enhanced `canvasData` parser to support multiple data structures (arrays/objects) ensuring legacy logs export perfectly.

---

## 📊 DATA MODEL SCHEMATICS

```json
{
  "Entities": {
    "User": "Sovereign Account Holder",
    "Project": "Primary Node (Geo-Spatial, Value, Status)",
    "Staff": "Human Resource (Skill DNA, Pay Rates, Fatigue Tracking)",
    "Equipment": "Asset Resource (Service History, Value, Charge Rates)",
    "Diary": "Temporal Visual Log (Canvas Data, PhotoPlanes, Chronos Nodes)",
    "Quote": "Financial Blueprint (Node-Based BOM, Margin Logic)",
    "Invoice": "Capital Realization (Harvested from Diaries/Quotes)",
    "SafetyForm": "Compliance Node (SWMS, Permits, Incident Reports)",
    "AuditLog": "Immutable Traceability (Cryptographic Action Hash)"
  }
}
```

---

## 📡 API INTEROPERABILITY MAP (LLM ROUTING)

- **AI Operations:** `/api/ai/*` (Chat, Quote Gen, Vision, Imagine).
- **Manifest / Export:** `/api/manifest/*` (Global Export, Excel Import, Transcription).
- **Revenue Recovery:** `/api/sentinel/*` (Scans, Variations, History).
- **Site Logging:** `/api/paint-diaries/*` (Visual Canvas, Chronos Sync).
- **Compliance:** `/api/safety/*` (Template Building, Sign-Off).
- **Reporting:** `/api/reports/search` (Unified Search Hub for all entities).

---

## 🚀 SOVEREIGN DEPLOYMENT PROTOCOLS

### 🧊 1. Zero-Cost Hibernation (Current State)
*   **Purpose:** $0.00/mo hosting for demos, incubator testing, and development.
*   **Engine:** SQLite (Running in ephemeral `/tmp`).
*   **Cost:** $0 (Scales to zero when idle).
*   **Command:** `powershell.exe -File .\deploy_zero_cost.ps1`
*   **Note:** Data in this mode is ephemeral. Every "Cold Start" provides a fresh instance.

### ⚡ 2. Enterprise Production Recovery (The Reversal)
*   **Purpose:** Permanent data storage for real-world clients and high-traffic usage.
*   **Engine:** PostgreSQL (Managed Cloud SQL).
*   **Cost:** ~$170 AUD/mo (Market rate for reserved high-performance DB).
*   **Prerequisites:** 
    1. Re-create a Cloud SQL instance named `master-diary-db` in Google Cloud.
    2. Import your latest `.sql` backup.
*   **Command:** `powershell.exe -File .\deploy_full_fixed.ps1`
*   **Note:** This restores the "Reserved" state where data is persistent across all sessions.

---

## 🛡️ SOVEREIGN PROTOCOLS
1. **Frontend-First Boot:** Server binds to PORT 5003 immediately; DB/AI initializes in background to guarantee 100% UI availability.
2. **Lattice Guard:** Middleware prevents API calls during the 10-15s boot-up connection phase.
3. **Token Bleed Protection:** Prompts are truncated at 32,000 chars to protect context windows and control costs.
4. **Audit-Every-Action:** Administrative deletions or recoveries generate high-contrast Audit Logs.

---

## 🔮 FUTURE TRAJECTORY
- **Level 5 Autonomy:** Fully autonomous invoicing based on "Neural Eye" progress detection.
- **Geo-Fenced Protocols:** Auto-injection of safety documents based on GPS coordinates.
- **Digital Twin:** Real-time 3D reconstruction of site progress via daily "Neural Eye" scans.

---
**[EOF // MasterDiaryOS Manifest Ready for Ingestion]**
