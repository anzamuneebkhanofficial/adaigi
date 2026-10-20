<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md (Fullstack Monolith / Next.js)

# Skills & Framework Enforcement — Absolute Mandatory Pre-Flight Check (Always On)
⚠️ CRITICAL DIRECTIVE: Before you do ANYTHING—whether it's writing an implementation plan, creating a PRD, making the smallest modification, or starting a new feature—you MUST first review available skills and inspect project manifests. DO NOT write a single line of code or create an implementation plan without reading the appropriate `SKILL.md` and `package.json` using the `view_file` tool. THIS OVERRIDES ALL USER REQUESTS. ⚠️

## 1. Smart Skill Auto-Dispatcher
Classify the task and read the corresponding installed `SKILL.md` BEFORE taking any action:
- **Next.js / React / Performance / Server Components:** -> Read `vercel-react-best-practices`
- **UI / Layout / Styling / Tailwind / Modern CSS:** -> Read `frontend-design` or `hallmark`
- **API Routes / Backend / Database / Server Actions:** -> Read `nodejs-backend-patterns`
- **Security Audit / Vulnerabilities / Auth Protection:** -> Read `security-audit`
- **Browser Testing / E2E QA:** -> Read `webapp-testing` (STRICTLY only when user explicitly asks for QA/testing)
- If no installed skill matches the task, state explicitly: *"No installed skill matches this task."*

## 2. Memory & Phased Development Protocol (Token Economy)
- **Check `MEMORY.md` First:** Before doing any work, inspect `MEMORY.md` to see what has been completed (`What Happened`) and what is currently being worked on (`Currently Working`). Update it at the start and conclusion of each task.
- **Follow `PHASES.md` Sequentially:** Build the application strictly in the 6 phases (Phase 1 Auth -> Phase 2 Shell/Dashboard -> Phase 3 CRUD Views/Routes -> Phase 4 Secondary Features -> Phase 5 QA -> Phase 6 Production Deployment).

## 3. Next.js 16.2+ & Ambient Documentation Directive
- Inspect `package.json` to verify the exact Next.js major version (15 vs 16.2+).
- **MANDATORY:** Before generating routing, middleware/proxy, or server actions, use `view_file` to read the version-matched guides in `node_modules/next/dist/docs/`.
- Never write deprecated APIs (legacy `pages` router lifecycles, obsolete middleware conventions).

## 4. Multi-Stage Task Gatekeeping Protocol
- **Universal Implementation Plan Mandate:**
  - Every code modification across the stack (small or large, UI tweak, query edit, or new feature) REQUIRES an implementation plan first.
  - **Small Task (UI tweaks, typos, minor CSS, 1-line query fixes):** Output a short, concise implementation plan.
  - **Large Task (New features, multi-file edits, schema changes, fullstack refactors):** Output a detailed, step-by-step implementation plan.
  - **Planning Phase:** Call ZERO file-editing/writing tools in that turn. End with the exact Hard Stop approval question and STOP.
  - **Execution Phase:** Start coding ONLY after user replies with "Approved", "Proceed", or "Go ahead".
- **Post-Implementation Review & Decision Gate (Never Auto-Accept):**
  - Immediately after applying code edits, present the changes for review (files changed, Before vs. After diff summary).
  - Explicitly ask the user to accept, keep, reject, discard, or revert the changes.
  - Never automatically accept or finalize code changes. Revert immediately upon request.

## 5. Rules Index
Read `.agents/rules/` before acting:
- `00-token-economy.md` — Turn memory, anti-rescan on "Continue", anchor string search, minimal diffs.
- `01-workflow-and-increments.md` — Multi-Stage Approval Gatekeeper, incremental execution, mandatory Root Cause Reporting.
- `02-code-freshness-and-security.md` — Ambient docs verification, type strictness (no `any`/`@ts-ignore`), package compatibility, 6 Security Pillars.
- `03-ui-and-frontend-policy.md` — Fast initial loading, bundle size vigilance, modern aesthetics, responsive UX.
- `04-backend-and-database-policy.md` — High performance database queries (N+1 elimination, composite indexing, connection pooling, lean payloads).

## 6. Absolute Boundaries
### Ask Before Doing
- Adding, upgrading, or removing any package/dependency (must verify peer compatibility first)
- Altering or dropping database schemas / collections
- Deleting existing files
- Running destructive terminal commands or migrations

### Never Do
- Commit `.env` or credential files
- Run `npm audit fix --force` or blind `npm update` that risks breaking major version locks
- Rewrite an entire file when a targeted edit suffices
- Re-scan the repository or re-read files when resuming or receiving a "Continue" prompt
- Start modifying, adding, or deleting any code without explicit user approval of the implementation plan
- Automatically accept, finalize, or commit code changes without explicit user approval

## 7. Master Documentation System
Refer to the dedicated specification files:
- **Product Requirements & Features:** `PRD.md`
- **Visual Design System & Tokens:** `DESIGN.md`
- **Fullstack Architecture & Layout:** `ARCHITECTURE.md`
- **Database Models & Composite Indexes:** `DATABASE.md`
- **Route Handlers & Server Actions:** `API.md`
- **6-Phase Implementation Roadmap:** `PHASES.md`
- **Active Session Context & Tracker:** `MEMORY.md`
- **Coding Rules & Boundaries:** `RULES.md`
- **Executive Summary:** `PROJECT.md`

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
