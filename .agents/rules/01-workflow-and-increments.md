# 01 — Workflow, Strict Implementation Plan Gatekeeper & Reporting

## 1. Task Classification & Universal Implementation Plan Mandate
Before touching any code, classify the request:
- **Small Task:** Minor UI tweaks, typo fixes, 1-line query tweaks, small CSS adjust, error string tweak.
  - *Action:* Draft a short, concise implementation plan stating what will change and which layer (UI, API, DB) is affected. Wait for approval.
- **Large Task:** New fullstack features, database schema changes, new API routes, multi-file refactors.
  - *Action:* Draft a comprehensive, step-by-step implementation plan including overview, affected files, model/server-action/UI interaction, and migration/risk analysis. Wait for approval.

**CRITICAL RULE: No implementation work may begin for ANY task (small or large) until the user explicitly approves the plan.**

---

## 2. Multi-Stage Approval Protocol (Strictly Enforced)

### Stage 1 — Planning & The Hard Stop (Wait for Plan Approval)
1. **Deep Analysis:** Inspect relevant manifest/files using targeted reads.
2. **Draft Implementation Plan:**
   - **Overview:** Exactly what fullstack unit is being built/modified.
   - **Files to be Modified/Created:** Exact file paths.
   - **Step-by-Step Logic:** How model, server action/route, and UI component will interact.
   - **Potential Risks/Impact:** Schema migration lock, breaking client-server contract.
3. **The HARD STOP (Wait for Approval):**
   - Present the plan.
   - **CALL ZERO FILE-WRITING, EDITING, OR DELETING TOOLS IN THIS TURN.**
   - End response with this exact question:
     *"Do you approve this implementation plan? I will not write, modify, or delete any code until you explicitly reply with 'Approved' or 'Proceed'."*
   - Stop and yield execution back to the user.

### Stage 2 — Execution (After Approval Only)
- Start coding ONLY after user explicitly types "Approved", "Proceed", or "Go ahead".
- **Plan Revision Rule:** If the user responds with feedback or requests changes to the plan, revise the implementation plan and **STOP AGAIN** for approval. Do not start coding until the revised plan is approved.
- Follow the approved plan strictly in small verifiable increments (checkpointing). Make only the changes covered by the approved scope.

### Stage 3 — Post-Implementation Review & Decision Gate (Never Auto-Accept)
- Code changes must NEVER be automatically accepted, finalized, or committed without explicit user permission.
- Immediately after applying code edits, present the changes for review:
  - List of modified, added, or deleted files.
  - Summary of exact code changes (Before vs. After).
- End response with this explicit decision question:
  *"Do you accept and keep these code changes, or would you like to reject, discard, or revert them?"*
- Stop and yield execution to the user.
- **Reversion Guarantee:** If the user rejects the changes or requests a revert, immediately restore original files without losing working code.

---

## 3. Mandatory Task Reporting Protocol
After the user approves and accepts the changes, output a report using this exact structure. Never just say "Done" or "Fixed."

### 📌 Task Overview
Briefly explain what the user asked for.

### 🔍 Root Cause Analysis (The "Why")
Why did this issue happen or why was this feature needed? Explain the architectural or logic gap.

### 🛠️ The Fix (The "How")
Explain the exact logic changed across the stack (API, UI, Database).

### 🔄 Before vs. After
- **Before:** What the application was doing previously.
- **After:** What the application does now.

### 📝 Final Summary
A concise 2-3 sentence summary explaining the final state of the application.
