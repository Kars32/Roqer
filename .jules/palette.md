## 2025-05-18 - Popover Toggle Button Accessibility Patterns
**Learning:** Interactive popover and pill buttons that toggle drop-downs/dialogs (such as connection pills or model status toggles) need explicit `aria-expanded` and `aria-haspopup="dialog"` attributes to inform screen readers of their state, and internal decorative chevron icons should be marked `aria-hidden="true"`.
**Action:** When creating or modifying popover toggle buttons, ensure `aria-expanded`, `aria-haspopup`, and `aria-label` are provided, and decorative SVG/Lucide icons carry `aria-hidden="true"`.
