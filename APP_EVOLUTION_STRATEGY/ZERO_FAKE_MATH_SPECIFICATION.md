# [INTERNAL PROTOCOL] ZERO-FAKE MATH SPECIFICATION
## MASTERDIARYAPP OFFICIAL V2: THE HARDENED FINANCIAL CORE

> **MISSION:** Achieve 100% mathematical accuracy by removing all "simulated jitter," hardcoded drift assumptions, and heuristic fallbacks. The system must transition from a "Visionary Prototype" to a "Sovereign Financial Ledger."

---

## 1. THE "SMOKING GUN" REMOVAL LIST
These specific lines must be deleted and replaced with Direct-Summation logic:

### A. Backend: `LearningEngine.js`
- **Location:** `backend/src/utils/LearningEngine.js`
- **Target:** `profitMargin = 0.18 + (Math.random() * 0.05);` (Lines 48-52)
- **Target:** `displayPaid = totalPaid > 0 ? totalPaid : (totalInvoiced * 0.85 || ...);` (Line 57)
- **Target:** `avgAccel = ... || 1.02; avgDrift = ... || 0.004;` (Lines 74-78)
- **Instruction:** Replace all `Math.random()` and `|| [Hardcoded Number]` with strict `0` or `null` results if data is missing.

### B. Frontend: `WorkflowSimulationEngine.js`
- **Location:** `frontend/src/components/WorkflowBuilder/WorkflowSimulationEngine.js`
- **Target:** `results.stats.drift = { time: Math.round(results.stats.totalDuration * 0.12), ... }` (Lines 367-372)
- **Target:** `results.stats.probabilityOfSuccess = 95;` (Line 134)
- **Instruction:** Change "Simulation" to "Historical Analysis." Instead of multiplying by `0.12`, query the database for the *actual* historical drift of similar projects.

---

## 2. THE THREE PILLARS OF 100% ACCURACY

### PILLAR 1: CANVAS-TO-DATA RECONCILIATION
- **Logic:** The `PaintDiary` visual nodes (Labor, Equipment, Material) must be the **Primary Source of Truth (PSOT)**.
- **Update Rule:** If a user moves a "Staff Node" on the canvas, the `diary.totalCost` in the database must be re-calculated via a `SUM(nodes.cost * nodes.duration)` query. 
- **Validation:** Implement a `verifyDiaryMath(diaryId)` function that runs on every save. If the Canvas Total and the Database Total differ by even $0.01, the system must trigger a "Sync Required" alert.

### PILLAR 2: THE "HONEST NULL" PROTOCOL
- **Logic:** Users must trust the data. If data is missing, the app must not "guess."
- **Dashboard UI:** Replace fake numbers for new users with a "Data Readiness Meter."
- **Logic:** 
  - `0-3 Diaries:` Show "Baseline Mode" (Industry averages only, marked as 'ESTIMATE').
  - `4-10 Diaries:` Show "Learning Mode" (Confidence Score: 45%).
  - `10+ Diaries:` Show "Sovereign Mode" (100% DNA-matched accuracy).

### PILLAR 3: THE "TRACEABILITY" CLICK-THROUGH
- **Feature:** Every financial stat on the Dashboard must be a link.
- **Drill-Down:** Clicking a "$4,500 Labor Cost" must open a modal showing the exact Staff Names, Dates, and Rates that comprise that total. No "Black Box" math allowed.

## 3. THE "SEAL OF EXCELLENCE" (BULLETPROOFING)

### A. ATOMIC PRECISION (INTEGER MATH)
- **The Rule:** No floating-point math allowed for currency. 
- **Implementation:** All costs must be stored and calculated in **Cents (Integers)**. 
- **Benefit:** Eliminates "Penny Drift" caused by JavaScript's decimal handling. $100.00 is stored as `10000`. Only converted back to decimals at the final UI display layer.

### B. THE CENTRALIZED MATH SERVICE (CMS)
- **The Rule:** Never calculate a total inside a React Component or a Controller. 
- **Implementation:** Create `backend/src/services/FinancialCore.js`.
- **Logic:** Both the Frontend and Backend must call the *exact same* logic for Overtime (1.5x/2.0x) and Allowances. If the CMS says a day costs $1,240.52, that is the ONLY number that can exist in the system.

### C. THE "ZERO-NULL" FALLBACK
- **The Rule:** Every Resource (Staff, Equipment, Material) must have a `baseRate`.
- **Constraint:** Prevent the creation of any Node on the Canvas if the underlying Resource has a null or zero rate, unless explicitly marked as "No Charge." This prevents "Silent Math Leakage" where work is logged but not billed.

---

## 4. FINAL VERIFICATION SCRIPT (FOR GEMINI)
When rolling out these updates, I must execute this manual script:
1.  **Grep Search:** Find every instance of `Math.random()` and `* 0.` (heuristics).
2.  **Logic Swap:** Point every "Forecast" chart to a new `HistoricalTrendService` that uses `AVG()` on real project data.
3.  **Audit:** Run a test project with 5 diaries and verify that the Dashboard exactly matches the sum of the nodes on the canvas.

---
**[EOF // READY FOR SOVEREIGN UPGRADE]**
