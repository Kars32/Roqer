# Palette's Journal

Critical UX and accessibility learnings only. Do not log routine enhancements.

## 2026-10-11 - Dynamic Accessible Names on Chevron Collapse Toggles
**Learning:** Icon-only toggle buttons using directional chevron SVGs (`results-collapse`, `diff-collapse`) often rely exclusively on `title` and `aria-expanded` attributes. Assistive technologies and screen readers may miss or incompletely announce the control's purpose without an explicit `aria-label`. Moreover, the action changes based on the toggle state (e.g. "Fold" vs "Show" or "Collapse" vs "Expand"), so the accessible name should dynamically mirror the action toggling the control will perform while keeping alignment with the hover tooltip.
**Action:** When adding or auditing icon-only collapse/expand chevron buttons, ensure dynamic `aria-label` attributes reflecting the toggle action are provided alongside `aria-expanded` and matching `title`.
