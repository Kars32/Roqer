# Palette's Journal

Critical UX and accessibility learnings only.

## 2026-10-10 - Custom Popover Disclosure Semantics in Header Pills
**Learning:** In desktop headers with custom status pills that trigger popovers (such as Studio connection and Rojo sync status), leaving the triggers as untyped buttons without `aria-haspopup="dialog"`, `aria-expanded`, or `aria-controls` leaves assistive technology users unable to discern whether the pill is an interactive disclosure control or just a static status badge. Providing explicit dialog disclosure semantics and labelling the popovers as `role="dialog"` with descriptive `aria-label`s turns ambiguous UI widgets into accessible, predictable disclosure patterns.
**Action:** Always ensure custom popover triggers specify `type="button"`, `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`, and ensure the popover container has `role="dialog"` with an accessible name.
