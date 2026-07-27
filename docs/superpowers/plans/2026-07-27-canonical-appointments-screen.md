# Canonical Appointments Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the duplicate Booking Book appointment workspace from the visible UI and make POS Appointments the single screen for all appointment data and actions.

**Architecture:** Booking Book renders a handoff card linking to the POS Appointments tab. Its legacy appointment markup stays hidden during this focused cleanup so existing store migration/runtime code is not destabilized. POS remains the only visible appointment calendar, list, editor, and action surface, backed by the shared appointment store.

**Tech Stack:** Static HTML/CSS/inline JavaScript, Node.js built-in test runner, local HTTP server for browser smoke testing.

## Global Constraints

- Keep `html/assets/appointments-store.js` as the single appointment data contract.
- Do not duplicate appointment mutations or catalog data in Booking Book.
- Preserve Booking Book Customers, Call Log, SMS Campaigns, QR Codes, Plans, and Salon Settings.
- Use the existing POS Appointments URL: `pos-phase-1.html?tab=appointments`.

### Task 1: Add the canonical-screen contract test

**Files:**
- Modify: `html/pages/booking-book-phase-1.shared-appointments.test.mjs`

**Interfaces:**
- Requires the approved canonical-screen design.
- Produces assertions for the Booking Book handoff and hidden legacy appointment surface.

- [ ] **Step 1: Write the failing test**

Add a test that requires `data-booking-appointments-handoff`, the POS appointments URL, and a handoff label; require the old editor/layout not to be exposed as visible markup.

- [ ] **Step 2: Run the focused test**

Run:
```bash
node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs
```
Expected: FAIL because Booking Book currently exposes `data-booking-appointment-panel` and has no handoff contract.

- [ ] **Step 3: Commit the failing contract**

```bash
git add html/pages/booking-book-phase-1.shared-appointments.test.mjs
git commit -m "test: specify canonical appointments screen"
```

### Task 2: Replace the visible Booking Book appointment workspace

**Files:**
- Modify: `html/pages/booking-book-phase-1.html:7577-8402`

**Interfaces:**
- Consumes the existing shared-store migration/runtime code.
- Produces `data-booking-appointments-handoff` and a link to `pos-phase-1.html?tab=appointments`.

- [ ] **Step 1: Add the handoff card**

Add a visible card in `panel-booking` with heading `Appointments live in POS`, explanatory copy that all channels share one appointment book, and an accessible link:
```html
<a data-booking-appointments-handoff href="pos-phase-1.html?tab=appointments">Open POS Appointments</a>
```

- [ ] **Step 2: Hide the legacy appointment subpanels and modals**

Keep the existing appointment markup and script hooks behind a hidden wrapper, remove its visible right-side editor state, and ensure the old toolbar/subtabs are not visible. The visible Booking Book page must not show the table, card view, calendar, create modal, detail modal, or `data-booking-appointment-panel`.

- [ ] **Step 3: Run the focused test**

Run:
```bash
node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs
```
Expected: PASS.

- [ ] **Step 4: Commit the UI consolidation**

```bash
git add html/pages/booking-book-phase-1.html
git commit -m "feat: make POS the canonical appointments screen"
```

### Task 3: Verify shared navigation and regression behavior

**Files:**
- Test: `html/pages/booking-book-phase-1.shared-appointments.test.mjs`
- Test: `html/pages/pos-phase-1.appointments.test.cjs`

**Interfaces:**
- Booking Book handoff targets the existing POS Appointments tab.
- POS continues reading and mutating the shared appointment store.

- [ ] **Step 1: Run the complete appointment suite**

```bash
node --test html/assets/salon-data.test.cjs html/assets/appointments-store.test.cjs html/assets/pos-appointments-data.test.cjs html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Parse inline page scripts and check whitespace**

```bash
node -e 'const fs=require("fs"); for (const file of ["html/pages/booking-book-phase-1.html","html/pages/pos-phase-1.html"]) { const html=fs.readFileSync(file,"utf8"); const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim()); scripts.forEach(source=>new Function(source)); console.log(file+": parsed "+scripts.length+" inline scripts"); }'
git diff --check
```

- [ ] **Step 3: Run browser smoke checks**

Open Booking Book and verify the handoff card is visible with no appointment editor panel; open the link and verify POS Appointments shows the shared calendar and panel host.

- [ ] **Step 4: Commit any test-only adjustments and finish**

```bash
git status --short --branch
```

The worktree must be clean before handoff.
