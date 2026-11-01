# Palette's Journal

Critical UX and accessibility learnings only.

## 2026-10-24 - Dynamic Accessible Labels on Collapsible Controls and Icon Buttons
**Learning:** In desktop interfaces with collapsible panels (`results-collapse`) or icon-only actions (`dark icon-button`), relying solely on `title` or `aria-expanded` leaves screen reader users without an accessible name that clearly announces the active toggling intent (e.g., "Fold the results" vs "Show the results"). `title` is not reliably announced by all screen readers and does not satisfy accessible naming best practices when no visible text is present.
**Action:** Always provide an explicit `aria-label` on icon-only buttons. For toggles, ensure the `aria-label` updates dynamically to reflect the action that activating the control will perform.
