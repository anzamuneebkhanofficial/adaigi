# 00 — Token Economy, Anti-Rescanning & Conversational Memory (Master Rule)

## Core Directive
Operate with extreme context efficiency. Quota and context window are scarce budgets. Never read files or scan directories speculatively.

## The 5 Anti-Waste Rules

1. **Conversational Turn Memory (Anti-Rescan on "Continue"):**
   - When the user prompts with "Continue", "Go ahead", or a follow-up instruction: **NEVER** re-scan the project directory, re-list folders, or re-read files that were already opened earlier in this conversation session.
   - Retain and trust the context already loaded in your conversation history. Proceed immediately to the next targeted diff.

2. **Anchor String Exact Targeting (No Guessing Unrelated Files):**
   - When the user reports an issue with a specific UI element, route handler, or error message:
     - Do NOT open unrelated pages or scan broad folder trees.
     - Use `grep_search` with the exact literal string (e.g. component text, action name, route path, or error string).
     - Jump directly to the exact file and lines that contain that anchor.

3. **Never Re-Scan the Codebase:**
   - Do NOT run directory-wide searches or open multiple unrelated files when addressing a specific bug or feature.
   - Use targeted symbol searches strictly for the named component, function, or route.

4. **Never Rewrite Entire Files (Targeted Diffs Only):**
   - Use targeted line replacements (`replace_file_content`).
   - If modifying a 200-line file to change 4 lines, touch only those 4 lines. Full-file rewrites waste output quota and create accidental regressions.

5. **Reuse Before Create & Ask Instead of Guessing:**
   - Before writing a new helper, utility, UI component, or API response format, check if an existing one already exists in the codebase.
   - If a request is ambiguous, ask ONE short clarifying question upfront instead of guessing wrong and burning quota on a rollback.
