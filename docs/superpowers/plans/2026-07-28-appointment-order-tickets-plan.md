# Appointment Order Tickets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace flat multi-service selection with service-ticket assignment in Booking Book and POS Appointments, preserving each service's technician, price, duration, and calendar lane.

**Architecture:** Add a small pure ticket utility beside the appointment store for normalizing ticket rows, calculating totals, and scheduling ticket lanes. Keep the existing appointment record as the parent order while preserving legacy `serviceNames`, `serviceDetails`, and parent technician fields. Both page runtimes will use the same service/technician search-and-add interaction and render one calendar event per ticket.

**Tech Stack:** Static HTML, inline JavaScript, shared browser assets, Node `node:test`, DayPilot Calendar, existing salon catalog and appointments store.

## Global Constraints

- Use `html/assets/booking-service-catalog-draft.json` for service search, price, duration, and category metadata.
- Keep the salon catalog as the source for active technicians and technician skill metadata.
- Preserve old appointment records that do not contain `tickets`.
- Apply the same ticket interaction and data contract to Booking Book and POS Appointments.
- Do not modify POS management service configuration, customer check-in flows, SMS campaigns, or unrelated calendar screens.

### Task 1: Add pure ticket domain helpers

**Files:**
- Create: `html/assets/appointment-tickets.js`
- Create: `html/assets/appointment-tickets.test.cjs`

**Interfaces:**
- `normalizeTickets(input, catalog)` returns ticket rows with stable IDs, service metadata, technician metadata, and optional timing.
- `ticketTotals(tickets)` returns `{ price, duration }` using numeric price and duration values.
- `scheduleTickets(tickets, startAt)` returns ticket rows with `startAt` and `endAt`, using one sequential cursor per technician lane and independent cursors for different lanes.
- `parentTechnicianId(tickets)` returns the one technician ID only when every named ticket uses the same technician; otherwise it returns `null`.

- [ ] **Step 1: Write failing tests for normalization, totals, parent technician, and lane scheduling.**

```js
test('normalizes one ticket and keeps Anyone unassigned', () => {
  const result = tickets.normalizeTickets([{
    serviceId: 'svc-dip', serviceName: 'DIP POWDER', price: 52, durationMin: 60,
    technicianId: null, technicianName: 'Anyone'
  }]);
  assert.deepEqual(result[0], {
    id: 'ticket-1', serviceId: 'svc-dip', serviceName: 'DIP POWDER', price: 52,
    durationMin: 60, technicianId: null, technicianName: 'Anyone', status: 'confirmed'
  });
});

test('schedules same-tech tickets sequentially and different-tech tickets in parallel', () => {
  const scheduled = tickets.scheduleTickets([
    { id: 'ticket-1', serviceName: 'A', durationMin: 60, technicianId: 'tech-a', technicianName: 'A' },
    { id: 'ticket-2', serviceName: 'B', durationMin: 30, technicianId: 'tech-b', technicianName: 'B' },
    { id: 'ticket-3', serviceName: 'C', durationMin: 45, technicianId: 'tech-a', technicianName: 'A' }
  ], '2026-07-28T10:00:00');
  assert.equal(scheduled[0].endAt, '2026-07-28T11:00:00');
  assert.equal(scheduled[1].startAt, '2026-07-28T10:00:00');
  assert.equal(scheduled[2].startAt, '2026-07-28T11:00:00');
  assert.equal(scheduled[2].endAt, '2026-07-28T11:45:00');
});
```

- [ ] **Step 2: Run the ticket utility test and verify it fails because the module is missing.**

Run: `node --test html/assets/appointment-tickets.test.cjs`

Expected: FAIL with `Cannot find module './appointment-tickets.js'`.

- [ ] **Step 3: Implement the pure helpers.**

Use `ticket-1`, `ticket-2`, etc. only when an input ticket has no ID; preserve existing IDs. Convert invalid price to `null`, invalid/non-positive duration to `60`, normalize missing technician to `{ technicianId: null, technicianName: 'Anyone' }`, and calculate lane timestamps using local `YYYY-MM-DDTHH:mm:ss` values.

- [ ] **Step 4: Run the utility tests and verify they pass.**

Run: `node --test html/assets/appointment-tickets.test.cjs`

- [ ] **Step 5: Commit the standalone ticket helper.**

```bash
git add html/assets/appointment-tickets.js html/assets/appointment-tickets.test.cjs
git commit -m "feat: add appointment ticket scheduling helpers"
```

### Task 2: Extend the shared appointment store with backward-compatible tickets

**Files:**
- Modify: `html/assets/appointments-store.js`
- Create: `html/assets/appointments-store.tickets.test.cjs`

**Interfaces:**
- `normalizeAppointment` preserves normalized `tickets` on the canonical record.
- Existing records without tickets derive one ticket per known `serviceDetails`/`serviceNames` row with the parent technician or Anyone.

- [ ] **Step 1: Write failing tests for ticket persistence and legacy fallback.**

```js
test('normalizes supplied ticket rows without dropping service details', () => {
  const record = store.normalize({
    id: 'apt-1', customerName: 'Mai', phone: '7135550000',
    tickets: [{ id: 'ticket-a', serviceId: 'svc-a', serviceName: 'DIP POWDER', price: 52, durationMin: 60, technicianId: 'tech-a', technicianName: 'Lan T.' }],
    startAt: '2026-07-28T10:00:00', endAt: '2026-07-28T11:00:00'
  }, catalog);
  assert.equal(record.tickets[0].technicianId, 'tech-a');
  assert.equal(record.serviceDetails[0].price, 52);
});

test('legacy serviceNames become Anyone tickets when no ticket array exists', () => {
  const record = store.normalize({
    id: 'apt-legacy', customerName: 'Mai', phone: '7135550000',
    serviceNames: ['DIP POWDER'], startAt: '2026-07-28T10:00:00', endAt: '2026-07-28T11:00:00'
  }, catalog);
  assert.equal(record.tickets.length, 1);
  assert.equal(record.tickets[0].technicianName, 'Anyone');
});
```

- [ ] **Step 2: Run the focused store test and verify it fails because tickets are not part of the canonical record.**

Run: `node --test html/assets/appointments-store.tickets.test.cjs`

- [ ] **Step 3: Implement store ticket normalization.**

Normalize `input.tickets` through the ticket helper when present; otherwise derive one ticket for each canonical service name/detail. Preserve tickets in the returned record, keep existing legacy arrays, and calculate the parent `technicianId` from tickets only when all named tickets share one technician.

- [ ] **Step 4: Run the store ticket tests and the existing appointment-store tests.**

Run: `node --test html/assets/appointments-store.tickets.test.cjs html/assets/appointments-store.test.cjs`

- [ ] **Step 5: Commit the shared store change.**

```bash
git add html/assets/appointments-store.js html/assets/appointments-store.tickets.test.cjs
git commit -m "feat: persist appointment order tickets"
```

### Task 3: Add the shared ticket picker interaction to POS Appointments

**Files:**
- Modify: `html/pages/pos-phase-1.html`
- Modify: `html/pages/pos-phase-1.appointments.test.cjs`

**Interfaces:**
- POS runtime keeps `apTickets` as the current form ticket array.
- `renderApTicketPicker()` renders service search, technician search, Add, removable rows, and totals.
- `apTicketPayload()` returns normalized tickets for store create/update.

- [ ] **Step 1: Write failing source-contract tests for the two search inputs, Add/remove controls, ticket rows, and ticket payload.**

```js
test('POS appointment picker creates service-technician tickets', () => {
  assert.match(html, /data-ap-service-search/);
  assert.match(html, /data-ap-tech-search/);
  assert.match(html, /data-ap-service-add/);
  assert.match(html, /data-ap-ticket-remove/);
  assert.match(html, /tickets:\s*apTicketPayload\(\)/);
});
```

- [ ] **Step 2: Run the POS appointment tests and verify the new contract fails.**

Run: `node --test html/pages/pos-phase-1.appointments.test.cjs`

- [ ] **Step 3: Replace the category chip picker with the ticket picker.**

Add state for the selected service, selected technician, search query, and `apTickets`. Render matching service options from `APPOINTMENT_MENU` in a dropdown, matching active technicians plus `Anyone` in a dropdown, and Add/remove actions. Keep price and duration in each result and ticket row. Calculate totals from `apTickets`, and schedule tickets from the appointment start when the form is rendered.

- [ ] **Step 4: Wire edit/new/save flows.**

Initialize new forms with empty tickets and Anyone as the selected technician. On edit, use `record.tickets` when available and derive legacy rows when not. Save `tickets`, `serviceIds`, `serviceNames`, `serviceDetails`, parent technician, duration, and start/end through the shared store.

- [ ] **Step 5: Run the POS tests and verify they pass.**

Run: `node --test html/pages/pos-phase-1.appointments.test.cjs`

- [ ] **Step 6: Commit the POS ticket picker.**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.appointments.test.cjs
git commit -m "feat: add POS service technician ticket picker"
```

### Task 4: Render one POS calendar event per ticket

**Files:**
- Modify: `html/pages/pos-phase-1.html`
- Modify: `html/pages/pos-phase-1.appointments.test.cjs`

**Interfaces:**
- `apCalendarBookings()` expands each parent order into ticket events with a stable `orderId` and `ticketId`.
- `apOpenEdit(orderId)` still opens the parent form when any ticket event is clicked.

- [ ] **Step 1: Write failing source-contract tests for ticket event expansion and technician resource mapping.**

```js
test('POS calendar expands order tickets into technician-column events', () => {
  assert.match(html, /tickets\.map\(/);
  assert.match(html, /ticket\.technicianId/);
  assert.match(html, /ticket\.startAt/);
  assert.match(html, /ticket\.endAt/);
});
```

- [ ] **Step 2: Run the focused POS tests and verify they fail.**

Run: `node --test html/pages/pos-phase-1.appointments.test.cjs`

- [ ] **Step 3: Expand ticket events and preserve parent edit behavior.**

Use `scheduleTickets` for records without stored timing, create one event per ticket with service name and technician name, and map `ticket.technicianId || 'unassigned'` to the calendar resource. Keep the parent order ID on each event so event click opens the full ticket editor.

- [ ] **Step 4: Make drag/resize ticket-safe.**

When an event has a `ticketId`, update only that ticket's `startAt`/`endAt` in the parent ticket array, then persist the parent record. Reject moves that would create an overlap in the same technician lane; do not rewrite unrelated ticket timing.

- [ ] **Step 5: Run the POS tests and commit the calendar expansion.**

Run: `node --test html/pages/pos-phase-1.appointments.test.cjs`

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.appointments.test.cjs
git commit -m "feat: render POS appointment tickets on technician lanes"
```

### Task 5: Add the same ticket picker and payload contract to Booking Book

**Files:**
- Modify: `html/pages/booking-book-phase-1.html`
- Modify: `html/pages/booking-book-phase-1.shared-appointments.test.mjs`
- Modify: `html/pages/booking-book-phase-1.sms-qr.test.mjs`

**Interfaces:**
- Booking runtime keeps `bookingPanelTickets` and `bookingCreateTickets` as ticket arrays for the panel and legacy create modal.
- `renderBookingTicketPicker(mode)` renders the same service/technician search and ticket row behavior as POS.
- Booking save payloads include `tickets` while retaining legacy fields.

- [ ] **Step 1: Write failing source-contract tests for Booking search inputs, Add/remove rows, and ticket payloads.**

```js
test('Booking picker creates service-technician tickets', () => {
  assert.match(SOURCE, /data-booking-service-search/);
  assert.match(SOURCE, /data-booking-tech-search/);
  assert.match(SOURCE, /data-booking-service-add/);
  assert.match(SOURCE, /data-booking-ticket-remove/);
  assert.match(SOURCE, /tickets:\s*bookingTicketPayload\(/);
});
```

- [ ] **Step 2: Run Booking tests and verify the new contract fails.**

Run: `node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs html/pages/booking-book-phase-1.sms-qr.test.mjs`

- [ ] **Step 3: Replace both Booking service pickers with ticket picker markup and state.**

Use the approved service JSON for service search and the active salon technician list for technician search. Keep Anyone selected initially, render removable ticket rows, and show price/time totals from the ticket list.

- [ ] **Step 4: Wire Booking panel and legacy create modal saves/edits.**

Use stored tickets when editing shared appointments. Fall back to one ticket per legacy service name and parent technician. Save tickets plus existing service arrays and parent fields through `appointmentStore.create`/`update`.

- [ ] **Step 5: Run Booking tests and verify they pass.**

Run: `node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs html/pages/booking-book-phase-1.sms-qr.test.mjs`

- [ ] **Step 6: Commit the Booking ticket picker.**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.shared-appointments.test.mjs html/pages/booking-book-phase-1.sms-qr.test.mjs
git commit -m "feat: add Booking service technician tickets"
```

### Task 6: Render Booking ticket calendar events and verify cross-surface behavior

**Files:**
- Modify: `html/pages/booking-book-phase-1.html`
- Modify: `html/pages/booking-book-phase-1.shared-appointments.test.mjs`
- Modify: `html/pages/booking-book-phase-1.sms-qr.test.mjs`

- [ ] **Step 1: Write failing source-contract tests for Booking ticket event expansion.**

```js
test('Booking calendar expands tickets into technician-column events', () => {
  assert.match(SOURCE, /tickets\.map\(/);
  assert.match(SOURCE, /ticket\.technicianId/);
  assert.match(SOURCE, /ticket\.startAt/);
  assert.match(SOURCE, /ticket\.endAt/);
});
```

- [ ] **Step 2: Implement ticket event expansion and ticket-safe move/resize behavior in Booking.**

Reuse the ticket scheduling contract, attach parent and ticket IDs to each calendar event, open the parent order editor on click, and persist only the moved ticket when a ticket event is dragged or resized.

- [ ] **Step 3: Run all focused tests and parse inline scripts.**

Run:

```bash
node --test html/assets/appointment-tickets.test.cjs html/assets/appointments-store.tickets.test.cjs
node --test html/pages/pos-phase-1.appointments.test.cjs
node --test --test-name-pattern='ticket|service technician|approved category' html/pages/booking-book-phase-1.shared-appointments.test.mjs html/pages/booking-book-phase-1.sms-qr.test.mjs
node --check html/assets/appointment-tickets.js
```

Extract each inline `<script>` block from both pages and compile it with `vm.Script`.

- [ ] **Step 4: Manually verify the exact local URL and both surfaces.**

At `http://127.0.0.1:5503/html/pages/pos-phase-1.html?tab=appointments`, create four tickets with two tickets on one tech, one on a second tech, and one Anyone ticket. Confirm same-tech tickets are sequential, different-tech tickets are parallel, totals are correct, and removing a row updates totals. Repeat the form flow in Booking Book.

- [ ] **Step 5: Commit the final calendar verification changes.**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.shared-appointments.test.mjs html/pages/booking-book-phase-1.sms-qr.test.mjs
git commit -m "feat: render Booking appointment tickets on technician lanes"
```
