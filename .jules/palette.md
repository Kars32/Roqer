## 2025-05-18 - Modal Dialog Focus Trapping
**Learning:** React portals mounted to `document.body` for overlay modals (`role="dialog"`, `aria-modal="true"`) require explicit `Tab` key event listeners to trap focus within the modal dialog container, preventing keyboard navigation from escaping to background UI elements.
**Action:** When implementing modal overlay components rendered via portals, attach a `useRef` to the container and handle `Tab` / `Shift+Tab` keydown events to wrap focus between the first and last focusable elements.
