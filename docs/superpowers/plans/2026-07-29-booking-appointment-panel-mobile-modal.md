# Booking Appointment Panel Responsive Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present the Booking Book appointment panel as a modal below `1400px` while keeping the desktop side rail unchanged.

**Architecture:** Reuse the existing `data-booking-appointment-panel` host and runtime state. Add a sibling backdrop, a runtime presentation synchronizer, and responsive CSS; do not duplicate the appointment form in `booking-detail-modal`.

**Tech Stack:** Static HTML, scoped CSS, vanilla JavaScript, Node `node:test`.

## Global Constraints

- Keep the appointment panel as a sticky side rail at viewport widths of `1400px` and above.
- At widths below `1400px`, show the existing panel as a fixed modal presentation with a backdrop.
- Use a centered dialog treatment for tablet widths and a full-width bottom sheet treatment for mobile widths.
- Lock body scrolling while the panel modal is open.
- Close the modal through the existing panel Close action, a new header close control, backdrop click, or Escape.
- Preserve all existing appointment form fields, actions, state, and `data-booking-panel-*` hooks.

---

### Task 1: Add the failing responsive modal contract

**Files:**
- Modify: `html/pages/pos-phase-1.appointments.test.cjs`

**Interfaces:**
- The test covers `pos-phase-1.html`, `pos-booking.css`, and `pos-booking-runtime.js`.

- [ ] **Step 1: Add assertions for the modal hooks and breakpoint**

Add this test:

```js
test('turns the appointment panel into a responsive modal below 1400px', () => {
  assert.match(html, /data-booking-appointment-backdrop/);
  assert.match(runtime, /function syncBookingAppointmentPanelPresentation\(/);
  assert.match(runtime, /booking-appointment-panel-modal-open/);
  assert.match(runtime, /data-booking-appointment-backdrop/);
  assert.match(runtime, /event\.key === 'Escape'[\s\S]*closeBookingAppointmentPanel\(\)/);
  assert.match(css, /@media\s*\(max-width:\s*1399px\)/);
  assert.match(css, /data-booking-panel-presentation="modal"/);
  assert.match(css, /\.booking-appointment-backdrop\s*\{/);
  assert.match(source, /data-booking-panel-action="close"[^>]*aria-label="Close appointment details"/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test html/pages/pos-phase-1.appointments.test.cjs
```

Expected: the new test fails because the backdrop, synchronizer, and `<1400px` modal contract do not exist.

### Task 2: Implement the shared panel modal presentation

**Files:**
- Modify: `html/pages/pos-phase-1.html:1127-1134`
- Modify: `html/assets/pos-booking.css:476-524,1276-1301`
- Modify: `html/assets/pos-booking-runtime.js:569-617,650-657,2760-2970,3110-3145`

**Interfaces:**
- `syncBookingAppointmentPanelPresentation()` synchronizes the panel presentation state, backdrop visibility, ARIA attributes, and body scroll-lock class.
- `closeBookingAppointmentPanel()` remains the single close path for the panel state.

- [ ] **Step 1: Add the sibling backdrop hook**

Place this immediately before the appointment panel:

```html
<div class="booking-appointment-backdrop" data-booking-appointment-backdrop hidden></div>
<aside class="booking-appointment-panel overview-card" data-booking-appointment-panel aria-label="Appointment details" hidden>
```

- [ ] **Step 2: Add the header close action**

Inside the rendered `.booking-panel-head`, add:

```html
<button class="booking-panel-header-close booking-secondary-button icon-only" type="button" data-booking-panel-action="close" aria-label="Close appointment details">
  <i class="bi bi-x-lg" aria-hidden="true"></i>
</button>
```

Keep the existing bottom Close action unchanged.

- [ ] **Step 3: Add responsive modal CSS**

Keep the sticky rail as the desktop default. Under `@media (max-width: 1399px)`, collapse the calendar layout to one column, show the backdrop, and position `[data-booking-panel-presentation="modal"]` as a centered fixed dialog. Under `@media (max-width: 600px)`, change it to a full-width bottom sheet with `max-height: 94dvh` and rounded top corners. Add `body.booking-appointment-panel-modal-open { overflow: hidden; }` and hide the header close button outside the modal presentation.

- [ ] **Step 4: Add the runtime presentation synchronizer**

Implement this behavior:

```js
function bookingAppointmentPanelUsesModal() {
  return window.matchMedia
    ? window.matchMedia('(max-width: 1399px)').matches
    : window.innerWidth < 1400;
}

function syncBookingAppointmentPanelPresentation() {
  var panel = document.querySelector('[data-booking-appointment-panel]');
  var backdrop = document.querySelector('[data-booking-appointment-backdrop]');
  var isModal = !!bookingPanelMode && bookingAppointmentPanelUsesModal();
  if (panel) {
    panel.dataset.bookingPanelPresentation = isModal ? 'modal' : 'rail';
    panel.setAttribute('role', isModal ? 'dialog' : 'complementary');
    if (isModal) panel.setAttribute('aria-modal', 'true');
    else panel.removeAttribute('aria-modal');
  }
  if (backdrop) backdrop.hidden = !isModal;
  document.body.classList.toggle('booking-appointment-panel-modal-open', isModal);
}
```

Call it after panel render, after opening/closing panel state, and on window resize.

- [ ] **Step 5: Wire backdrop and Escape close behavior**

In the delegated click handler, close when `event.target.closest('[data-booking-appointment-backdrop]')` is truthy. In the keydown handler, when Escape is pressed and the panel presentation is `modal`, call `closeBookingAppointmentPanel()` and return.

- [ ] **Step 6: Run the focused suite and verify GREEN**

Run:

```bash
node --test html/pages/pos-phase-1.appointments.test.cjs
```

Expected: all POS appointment contract tests pass.

### Task 3: Verify the final implementation

- [ ] **Step 1: Check syntax and whitespace**

Run:

```bash
node --check html/assets/pos-booking-runtime.js
git diff --check
```

Expected: both commands exit 0.

- [ ] **Step 2: Review the scoped diff**

Run:

```bash
git diff -- html/pages/pos-phase-1.html html/assets/pos-booking.css html/assets/pos-booking-runtime.js html/pages/pos-phase-1.appointments.test.cjs
```

Confirm the diff only adds responsive modal presentation, backdrop/close wiring, and regression assertions; preserve unrelated existing edits.
