# 03 — UI, Frontend Performance & Fast Loading

## 1. High Performance & Fast Initial Loading
- **Bundle Size Vigilance:** Keep JavaScript bundles lean. Use dynamic imports and code splitting (`React.lazy`, Next.js dynamic) for heavy dialogs, modals, and charts.
- **Tree-Shaking & Targeted Imports:** Avoid importing entire icon libraries or utility bundles.
- **Core Web Vitals & Render Efficiency:**
  - Prevent unnecessary re-renders using proper state scoping, `useMemo`, and `useCallback` where compute is intensive.
  - Avoid Cumulative Layout Shift (CLS) by always providing width/height attributes for media and images.
  - Optimize assets using modern formats (WebP/SVG).
- **Efficient Data Fetching:** Use caching and deduping layers (SWR, TanStack Query, or Next.js fetch cache). Never trigger duplicate API calls on every re-render.

## 2. Modern UI & Visual Standards
- **Aesthetic Quality:** Design clean, contemporary interfaces with consistent spacing, polished color palettes, and accessible contrast ratios (WCAG AA).
- **Anti-AI Slop:** Avoid repetitive, cookie-cutter AI templates. Structure layouts to match actual user needs.
- **Responsive by Default:** Ensure fluid responsiveness across mobile, tablet, and desktop screens with semantic HTML5 elements.
- **Design Token Adherence:** Strictly follow design tokens in `PROJECT.md`.

## 3. Browser Testing & MCP Discipline (Strict)
- **No Automatic Browser Invocations:** Never launch browser tools automatically for normal frontend edits.
- **Explicit Trigger Only:** Run browser testing only when user explicitly asks for visual verification or QA.
- **Scoped Verification:** Verify only the specific component, page, or flow requested.
