# [INTERNAL PROTOCOL] MODULAR TRANSITION SAFETY (MTS)
## MASTERDIARYAPP OFFICIAL V2: THE STABILITY MANIFEST

> **MISSION:** To decompose "God Components" (like `PaintDiary.jsx`) into clean, atomic segments without breaking the application. This protocol ensures that external dependencies are never orphaned and that the original logic is preserved as a "Gold Standard" reference.

---

## 1. THE "SHADOW REFERENCE" SYSTEM
Before a single line of code is moved, we must preserve the original state.
- **Action:** Create a `.backup/` directory within the component folder.
- **Action:** Copy the original file as `[FileName].original.jsx`.
- **Constraint:** This file is **READ-ONLY**. It serves as the baseline for 100% logic parity. If the new modular version fails, we revert to the original instantly to restore service.

---

## 2. THE "BRIDGE" EXPORT PATTERN
The most common cause of "Breakage" is other files calling functions that have moved. We solve this using a "Bridge" (index file).
- **Old Way:** `import { someFunc } from './PaintDiary'` (fails if someFunc moves).
- **The MTS Way (The Bridge):**
  1. Create smaller files: `CanvasCore.jsx`, `ResourceSidebar.jsx`, `CalculationEngine.js`.
  2. Create an `index.jsx` in the folder.
  3. The `index.jsx` re-exports everything:
     ```javascript
     export { default as PaintDiary } from './PaintDiaryMain';
     export { calculateTotals } from './CalculationEngine';
     // External files still see the same "Public API"
     ```

---

## 3. STEP-BY-STEP REFACTORING PIPELINE

### STEP 1: Dependency Mapping (The "Grep" Phase)
- **Before Moving Code:** Run a global search for the component name. 
- **Identify:** Who is importing this? What props are they passing?
- **Document:** Create a list of "External Anchors" that must not be broken.

### STEP 2: Logic Extraction (Not UI)
- **Action:** Move "Math" and "Data" logic (the `useEffect` and `useCallback` hooks) into a custom hook (e.g., `usePaintDiaryLogic.js`).
- **Validation:** Test the original `PaintDiary.jsx` using the *new* hook. If the UI still works, the logic extraction was successful.

### STEP 3: UI Segmenting (Atomic Sub-Components)
- **Action:** Extract the JSX for sidebars, modals, and headers into small, functional components.
- **Constraint:** Pass data via **Props** or **Context**, never by "guessing" global state.

### STEP 4: The "Final Assembly"
- **Action:** Re-assemble the main component (`PaintDiaryMain.jsx`) using only the atomic sub-components and the custom hook.
- **Target:** The main file should be < 150 lines of code, serving only as a "Layout Shell."

---

## 4. THE "VERIFICATION OF PARITY" TEST
To confirm "Flawless" transition, Gemini must:
1.  **Mount the Original:** Record the exact behavior (e.g., "Dragging a staff node adds $50 to total").
2.  **Mount the Modular:** Perform the exact same action.
3.  **Result:** If the results are not identical to the cent, the transition is aborted and rolled back using the Shadow Reference.

---
**[EOF // MTS PROTOCOL ACTIVE]**
