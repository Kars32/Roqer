# Palette Journal - UX & Accessibility Learnings

This journal records critical UX and accessibility learnings for this repository.

## 2025-05-18 - Popover Triggers and Collapsible Buttons ARIA Attributes
**Learning:** Custom interactive elements that toggle floating popovers (such as status pills) or collapsible cards must explicitly state `aria-expanded` and `aria-haspopup="true"` (for popovers) and `aria-label` (for icon-only toggles). HTML `title` attributes alone do not reliably provide an accessible name for screen readers when buttons contain hidden icon elements.
**Action:** When adding or modifying custom dropdown/popover trigger buttons or icon-only toggle buttons in React desktop components, always ensure `aria-expanded`, `aria-haspopup`, and descriptive `aria-label` attributes are included.
