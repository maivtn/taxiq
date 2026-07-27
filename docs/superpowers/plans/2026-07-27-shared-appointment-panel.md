# Shared Appointment Action Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a POS-style right-side appointment workspace to Booking Book and align both pages around the same shared appointment actions and canonical store records.

**Architecture:** Keep page-local renderers because POS and Booking Book have different shells, but give both panels the same states, field set, action labels, and appointments-store.js mutation paths. Booking Book row/card/calendar actions become selection entry points into its panel; POS keeps its existing panel and gains the missing operational buttons. Both pages continue refreshing from the shared appointment store and storage events.

**Tech Stack:** Existing static HTML/CSS, inline JavaScript, DayPilot Lite, shared salon-data.js, shared appointments-store.js, Node built-in test runner, browser smoke testing.

## Global Constraints

- Do not add a backend, authentication, real SMS delivery, or a new application-wide component framework.
- Preserve the canonical appointment schema and salon-scoped appointments-store.js API.
- Keep POS ETA/check-in behavior POS-only while sharing the underlying appointment record.
- Existing row/card buttons remain compact entry points; the right panel is the primary appointment action surface.
- Escape customer, service, technician, source, and note values when rendering dynamic HTML.
- At narrow widths, the Booking Book panel must remain usable without horizontal clipping.
- Run the existing shared catalog/store/page suite after every implementation task; baseline is 44 passing tests.

---

### Task 1: Add failing panel contract tests

**Files:**
- Modify: html/pages/booking-book-phase-1.shared-appointments.test.mjs
- Modify: html/pages/pos-phase-1.appointments.test.cjs

**Interfaces:**
- Consumes: existing source-contract tests and appointments-store action names.
- Produces: assertions for panel hosts, panel states, shared action hooks, and responsive layout.

- [ ] **Step 1: Write the failing Booking Book tests**

Add tests like:

    test('Booking Book exposes a right-side appointment panel contract', () => {
      assert.match(SOURCE, /data-booking-appointment-panel/);
      assert.match(SOURCE, /data-booking-panel-state="empty"/);
    });

    test('Booking Book routes selection through the panel', () => {
      assert.match(SOURCE, /function openBookingAppointmentPanel\(/);
      assert.match(SOURCE, /data-booking-panel-select/);
      assert.match(SOURCE, /openBookingAppointmentPanel\(item/);
    });

    test('Booking Book has responsive appointment panel layout', () => {
      assert.match(SOURCE, /booking-appointment-layout/);
      assert.match(SOURCE, /booking-appointment-panel/);
    });

- [ ] **Step 2: Write the failing POS test**

Add:

    test('POS appointment panel exposes shared operational actions', () => {
      assert.match(SOURCE, /data-ap-panel/);
      assert.match(SOURCE, /data-ap-action="send-sms"/);
      assert.match(SOURCE, /data-ap-action="done"/);
      assert.match(SOURCE, /data-ap-action="noshow"/);
      assert.match(SOURCE, /appointmentStore\.(update|cancel)/);
    });

- [ ] **Step 3: Run tests and confirm the expected red state**

Run:

    node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs html/pages/pos-phase-1.appointments.test.cjs

Expected: FAIL because Booking Book has no right-panel contract and POS has no data-ap-action hooks.

- [ ] **Step 4: Commit the red tests**

    git add html/pages/booking-book-phase-1.shared-appointments.test.mjs html/pages/pos-phase-1.appointments.test.cjs
    git commit -m "test: specify shared appointment panel contracts"

---

### Task 2: Add the Booking Book right-side layout

**Files:**
- Modify: html/pages/booking-book-phase-1.html
- Modify: html/pages/booking-book-phase-1.shared-appointments.test.mjs only if selectors need to be stabilized.

**Interfaces:**
- Consumes: Task 1 panel contract.
- Produces: Booking Book panel host, empty state, and responsive grid used by Tasks 3 and 4.

- [ ] **Step 1: Add the panel host beside the existing overview view**

Wrap the current table/card/calendar view region in a booking-appointment-layout grid and add:

    <aside class="booking-appointment-panel overview-card"
      data-booking-appointment-panel
      aria-label="Appointment editor"
      aria-live="polite">
      <div data-booking-panel-state="empty">
        <i class="bi bi-calendar2-week" aria-hidden="true"></i>
        <strong>Select an appointment</strong>
        <span>Choose a row or calendar event to edit it here.</span>
      </div>
    </aside>

Keep table/card/calendar panels inside the flexible primary column. The runtime will replace the panel contents later, so do not duplicate a complete form in static HTML.

- [ ] **Step 2: Add desktop and responsive CSS**

Use the existing Booking Book tokens and POS visual language:

    .booking-appointment-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 320px;
      gap: 14px;
      align-items: start;
    }

    .booking-appointment-panel {
      position: sticky;
      top: 18px;
      min-width: 0;
    }

    @media (max-width: 1120px) {
      .booking-appointment-layout { grid-template-columns: 1fr; }
      .booking-appointment-panel { position: static; }
    }

Add stacked form-grid and panel action styles. At max-width 600px, make the panel full width and keep Save/status/cancel/close controls reachable.

- [ ] **Step 3: Run focused tests and parse checks**

    node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs
    node - <<'NODE'
    const fs = require('fs'), vm = require('vm');
    for (const file of ['html/pages/booking-book-phase-1.html', 'html/pages/pos-phase-1.html']) {
      const html = fs.readFileSync(file, 'utf8');
      for (const [i, match] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) {
        if (match[1].trim()) new vm.Script(match[1], { filename: file + '#' + i });
      }
    }
    console.log('inline scripts parse: pass');
    NODE

Expected: the Booking Book layout assertions pass and inline scripts parse.

- [ ] **Step 4: Commit the layout**

    git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.shared-appointments.test.mjs
    git commit -m "feat: add Booking Book appointment side panel"

---

### Task 3: Implement Booking Book panel state and selection

**Files:**
- Modify: html/pages/booking-book-phase-1.html around renderBookingStoreRows, createBookingTableRow, openBookingCreateModal, openBookingDetailModal, and the main click handlers.
- Modify: html/pages/booking-book-phase-1.shared-appointments.test.mjs.

**Interfaces:**
- Consumes: salonData, appointmentStore, bookingRecordToRowData(), bookingTechName(), catalog-derived service/technician views, and the Task 2 panel host.
- Produces: bookingPanelMode, bookingPanelAppointmentId, renderBookingAppointmentPanel(), openBookingAppointmentPanel(item), openBookingAppointmentPanelForNew(start, end, tech), closeBookingAppointmentPanel(), and bookingPanelSyncDraft().

- [ ] **Step 1: Add the failing state/render assertions**

    test('Booking Book panel renders canonical appointment fields', () => {
      assert.match(SOURCE, /var bookingPanelMode = null/);
      assert.match(SOURCE, /var bookingPanelAppointmentId = null/);
      assert.match(SOURCE, /function renderBookingAppointmentPanel\(/);
      assert.match(SOURCE, /data-booking-panel-field="name"/);
      assert.match(SOURCE, /data-booking-panel-field="services"/);
      assert.match(SOURCE, /data-booking-panel-action="save"/);
    });

- [ ] **Step 2: Run the focused test and confirm it fails**

    node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs

Expected: FAIL because the panel state and renderer do not exist.

- [ ] **Step 3: Add page-local panel state and renderer**

Add:

    var bookingPanelMode = null; // null | 'new' | 'edit'
    var bookingPanelAppointmentId = null;
    var bookingPanelDraft = null;
    var bookingPanelServices = {};
    var bookingPanelExternalServices = [];
    var bookingPanelWarning = '';

Render empty, loading, new, and edit states. The edit form must contain customer, phone, services, technician, date, time, duration, status, source metadata, warning, Save, action buttons, and Close. Resolve selected data from appointmentStore.loadAll(null, catalog) by ID; do not use a rendered row as authority. Escape every dynamic value.

- [ ] **Step 4: Route selection entry points to the panel**

Change the table/card action, team-calendar event, New appointment button, and free calendar range to:

    openBookingAppointmentPanel(item);
    openBookingAppointmentPanelForNew(start, end, bookingCalendarResourceTech(args.resource));

The appointment detail action must select the panel rather than open the centered detail modal. Keep unrelated technician/customer/campaign/settings modals untouched.

- [ ] **Step 5: Refresh the panel with store/catalog updates**

Call renderBookingAppointmentPanel() after renderBookingStoreRows(), in the appointment-store subscription, and in the salon catalog storage handler. If the selected record was cancelled or removed from active data, clear the selection and render the empty state.

- [ ] **Step 6: Run tests and commit**

    node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs
    node --test html/assets/salon-data.test.cjs html/assets/appointments-store.test.cjs html/assets/pos-appointments-data.test.cjs html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
    git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.shared-appointments.test.mjs
    git commit -m "feat: render Booking Book appointment panel state"

---

### Task 4: Move Booking Book appointment mutations into the panel

**Files:**
- Modify: html/pages/booking-book-phase-1.html around saveBookingFromCalendar, sendBookingSms, setBookingStatus, and appointment click/close handlers.
- Modify: html/pages/booking-book-phase-1.shared-appointments.test.mjs.

**Interfaces:**
- Consumes: Task 3 panel state/draft functions and appointmentStore.create/update/cancel.
- Produces: saveBookingAppointmentPanel(), setBookingPanelStatus(status), cancelBookingPanelAppointment(), and panel hooks for save, send-sms, done, noshow, cancel, and close.

- [ ] **Step 1: Add failing mutation/action assertions**

    test('Booking Book panel actions write through the shared appointment store', () => {
      assert.match(SOURCE, /function saveBookingAppointmentPanel\(/);
      assert.match(SOURCE, /function cancelBookingPanelAppointment\(/);
      assert.match(SOURCE, /data-booking-panel-action="send-sms"/);
      assert.match(SOURCE, /appointmentStore\.create\(/);
      assert.match(SOURCE, /appointmentStore\.update\(/);
      assert.match(SOURCE, /appointmentStore\.cancel\(/);
    });

- [ ] **Step 2: Run the focused test and confirm it fails**

    node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs

Expected: FAIL until panel mutation functions and hooks are present.

- [ ] **Step 3: Implement draft synchronization and validation**

Read data-booking-panel-field values into bookingPanelDraft before service/status actions. Use existing bookingServiceDurationMinutes() and appointmentStore.hasConflict() semantics. Keep the panel open and render the warning inside data-booking-panel-warning on validation failure.

- [ ] **Step 4: Implement create/update through the canonical store**

Use:

    var result = bookingPanelMode === 'edit'
      ? appointmentStore.update(bookingPanelAppointmentId, payload, null, catalog)
      : appointmentStore.create(payload, null, catalog);

Preserve source, metadata, createdAt, and SMS state when editing. New records use source booking-book. After success, refresh rows/cards/calendar/KPIs and keep the saved record selected in edit mode.

- [ ] **Step 5: Implement shared actions**

Use the existing store mappings:

    sendBookingSms(item);            // smsStatus: sent
    setBookingPanelStatus('done');   // status: completed
    setBookingPanelStatus('noshow'); // status: no-show
    appointmentStore.cancel(id, null, catalog);

Use the current SweetAlert confirmation style for cancellation. After cancel, clear selection and refresh active views while retaining the canonical history record.

- [ ] **Step 6: Remove the primary appointment create/detail modal flow**

Route data-booking-calendar-add, free calendar selections, table/card detail, and team-calendar clicks to the panel. Remove only appointment-specific create/detail modal listeners and markup when no longer referenced; leave non-appointment modals intact.

- [ ] **Step 7: Run full tests, parse, and diff checks**

    node --test html/assets/salon-data.test.cjs html/assets/appointments-store.test.cjs html/assets/pos-appointments-data.test.cjs html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
    node - <<'NODE'
    const fs = require('fs'), vm = require('vm');
    for (const file of ['html/pages/booking-book-phase-1.html', 'html/pages/pos-phase-1.html']) {
      const html = fs.readFileSync(file, 'utf8');
      for (const [i, match] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) {
        if (match[1].trim()) new vm.Script(match[1], { filename: file + '#' + i });
      }
    }
    console.log('inline scripts parse: pass');
    NODE
    git diff --check

Expected: 44 or more tests pass, scripts parse, and diff check is clean.

- [ ] **Step 8: Commit panel mutations**

    git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.shared-appointments.test.mjs
    git commit -m "feat: move Booking Book appointment actions into panel"

---

### Task 5: Align POS panel with the shared actions

**Files:**
- Modify: html/pages/pos-phase-1.html around renderApPanel(), the appointments click delegate, and appointment mutation helpers.
- Modify: html/pages/pos-phase-1.appointments.test.cjs.

**Interfaces:**
- Consumes: apMode, apSel, apDraft, apBookingById(), appointmentStore.update(), appointmentStore.cancel(), and existing POS toast/confirm helpers.
- Produces: data-ap-action="send-sms|done|noshow|cancel" controls and apApplySharedAction(action).

- [ ] **Step 1: Add the failing POS action test**

    test('POS appointment panel exposes shared status and SMS actions', () => {
      assert.match(SOURCE, /data-ap-action="send-sms"/);
      assert.match(SOURCE, /data-ap-action="done"/);
      assert.match(SOURCE, /data-ap-action="noshow"/);
      assert.match(SOURCE, /function apApplySharedAction\(/);
    });

- [ ] **Step 2: Run the POS test and confirm it fails**

    node --test html/pages/pos-phase-1.appointments.test.cjs

Expected: FAIL because POS currently exposes only Save, Cancel, and Close.

- [ ] **Step 3: Render operational buttons in edit mode**

In renderApPanel(), retain Save, the existing cancel button, and Close. Add compact Send SMS, Done, and No-show buttons only when editing an existing record. Use accessible labels and Booking Book's action colors.

- [ ] **Step 4: Implement apApplySharedAction(action)**

Route actions through the canonical store:

    if (action === 'send-sms') appointmentStore.update(apSel, { smsStatus: 'sent' }, null, salonCatalog);
    if (action === 'done') appointmentStore.update(apSel, { status: 'completed' }, null, salonCatalog);
    if (action === 'noshow') appointmentStore.update(apSel, { status: 'no-show' }, null, salonCatalog);
    if (action === 'cancel') appointmentStore.cancel(apSel, null, salonCatalog);

After success, call reloadAppointmentSnapshot(), refresh calendar/floor/panel, and show the existing POS toast. Cancel requires confirmation and clears apMode/apSel.

- [ ] **Step 5: Connect the click delegate without changing POS ETA behavior**

Handle data-ap-action in the existing appointments click delegate. Keep ETA/check-in controls in renderEta() and continue writing their metadata to the same canonical record.

- [ ] **Step 6: Run tests and commit**

    node --test html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
    node --test html/assets/salon-data.test.cjs html/assets/appointments-store.test.cjs html/assets/pos-appointments-data.test.cjs html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
    git diff --check
    git add html/pages/pos-phase-1.html html/pages/pos-phase-1.appointments.test.cjs
    git commit -m "feat: align POS appointment panel actions"

---

### Task 6: Verify desktop/mobile and cross-page behavior

**Files:**
- Modify: html/pages/booking-book-phase-1.html or html/pages/pos-phase-1.html only for smoke-test fixes.
- Modify: html/pages/booking-book-phase-1.shared-appointments.test.mjs or html/pages/pos-phase-1.appointments.test.cjs only for a regression test that captures a discovered bug.

**Interfaces:**
- Consumes: completed panel implementations and shared localStorage appointment store.
- Produces: verified desktop/mobile behavior and a clean branch ready for handoff.

- [ ] **Step 1: Start the local server**

    python3 -m http.server 8123 --directory html

Open:

    http://localhost:8123/pages/booking-book-phase-1.html?tab=booking
    http://localhost:8123/pages/pos-phase-1.html?tab=appointments

- [ ] **Step 2: Run desktop smoke checks**

Verify:

1. Booking Book row View opens the right panel without the centered appointment modal.
2. Booking Book New appointment opens the same panel in new mode.
3. Save a test booking; the record appears in POS and clicking it opens the POS right panel.
4. Edit technician/time in POS; Booking Book reflects the same values after the store event.
5. Send SMS, Done, No-show, and Cancel from either panel; both pages update and cancelled records leave active views.
6. POS ETA/check-in remains available for the selected record.

- [ ] **Step 3: Run responsive smoke checks**

At widths below 1120px and 600px verify that the primary view stays readable, the panel stacks or opens as a full-width surface, all actions remain clickable, and no horizontal overflow is introduced.

- [ ] **Step 4: Run final automated verification**

    node --test html/assets/salon-data.test.cjs html/assets/appointments-store.test.cjs html/assets/pos-appointments-data.test.cjs html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
    node - <<'NODE'
    const fs = require('fs'), vm = require('vm');
    for (const file of ['html/pages/booking-book-phase-1.html', 'html/pages/pos-phase-1.html']) {
      const html = fs.readFileSync(file, 'utf8');
      for (const [i, match] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) {
        if (match[1].trim()) new vm.Script(match[1], { filename: file + '#' + i });
      }
    }
    console.log('inline scripts parse: pass');
    NODE
    git diff --check
    git status --short --branch

Expected: all tests pass, scripts parse, diff check is clean, and only intended files are present.

- [ ] **Step 5: Commit only verified fixes**

If smoke testing finds a regression, add its focused regression test and minimal fix before committing:

    git add html/pages/booking-book-phase-1.html html/pages/pos-phase-1.html html/pages/*.test.*
    git commit -m "fix: polish shared appointment panel interactions"

Otherwise preserve the implementation commits and report the branch, verification output, and browser smoke results.
