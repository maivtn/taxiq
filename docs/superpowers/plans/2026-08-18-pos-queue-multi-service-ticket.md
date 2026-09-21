# POS Queue Multi-Service Technician Ticket Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each open Queue ticket represent every service assigned to one technician within one customer order, with a multi-select Edit service flow that persists through Booking, Queue, and Checkout.

**Architecture:** Keep Booking's canonical one-record-per-service schema and make `WAITLIST.items` the Queue ticket's service source of truth. Normalize legacy rows, aggregate Booking and walk-in services by order plus technician assignment, and expand Queue items back into canonical service records for Booking persistence and Checkout. All mutations that touch a linked Booking persist first and update in-memory Queue state only after the appointment store succeeds.

**Tech Stack:** Static HTML/CSS, browser JavaScript (ES5-compatible style used by the page), Node.js built-in `node:test`, shared appointment store and salon catalog utilities already loaded by `pos-phase-1.html`.

**Spec:** `docs/superpowers/specs/2026-08-18-pos-queue-multi-service-ticket-design.md`

## Global Constraints

- Queue identity is exactly `orderId + technician assignment = one open Queue ticket`.
- Technician assignment resolves in this order: `techId`, then `reqTech`, then `Anyone`.
- `items` is the source of truth; `svc`, `serviceTicketId`, and `durationMin` remain synchronized compatibility fields.
- Booking remains canonical as one appointment service ticket per service.
- A Queue ticket has one shared technician, status, elapsed timer, and action set for all selected services.
- Edit service accepts one or more active catalog services and rejects an empty selection.
- A linked Booking store failure must leave both the Queue ticket and modal draft unchanged.
- No new dependency and no unrelated page or catalog redesign.

---

## File map

- Modify: `html/pages/pos-phase-1.html` — Queue model normalization, aggregation, service editor UI, Booking persistence, technician matching/merge behavior, rendering, cancellation, completion, and Checkout expansion.
- Modify: `html/pages/pos-phase-1.operational-tickets.test.cjs` — focused source and behavioral regression tests for the complete multi-service Queue lifecycle.

### Task 1: Normalize Queue tickets around `items[]`

**Files:**
- Modify: `html/pages/pos-phase-1.html:2798-2885`
- Test: `html/pages/pos-phase-1.operational-tickets.test.cjs:1-80`

**Interfaces:**
- Consumes: `salonData.findService(catalog, value)`, `posServiceDisplayName(value)`, `legacyServiceGroupKey(service)`.
- Produces: `queueItemForService(service, techId, serviceTicketId) -> QueueItem`, `queueTicketServiceIds(w) -> string[]`, `normalizeQueueTicketServices(w) -> QueueTicket`, `queueTicketHasServiceTicket(w, serviceTicketId) -> boolean`, and `queueTicketAssignment(w) -> string`.
- `QueueItem` shape: `{ serviceId: string, serviceTicketId: string|null, name: string, price: number, durationMin: number, techId: string|null, cat: string }`.

- [ ] **Step 1: Replace the obsolete one-service source assertions with failing normalization tests**

Add source assertions that require the new compatibility fields and a small behavioral harness for the pure normalizer:

```js
test('Queue normalizes legacy and multi-service rows around items', () => {
  assert.match(html, /function queueItemForService\(service, techId, serviceTicketId\) \{/);
  assert.match(html, /function queueTicketServiceIds\(w\) \{/);
  assert.match(html, /function normalizeQueueTicketServices\(w\) \{/);
  assert.match(html, /w\.serviceTicketIds = queueTicketServiceIds\(w\);/);
  assert.match(html, /w\.serviceTicketId = w\.serviceTicketIds\[0\] \|\| null;/);
  assert.match(html, /w\.svc = w\.items\[0\] \? w\.items\[0\]\.name : '';/);
  assert.match(html, /w\.durationMin = w\.items\.reduce/);
});

test('Queue duplicate checks recognize every linked service ticket id', () => {
  const duplicateFn = html.match(/function hasOperationalTicketForServiceTicket\(serviceTicketId\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(duplicateFn, /queueTicketHasServiceTicket\(w, serviceTicketId\)/);
  assert.match(duplicateFn, /w\.status !== 'cancelled'/);
});
```

Update the old test description from “one operational ticket per service ticket” to the new technician-ticket invariant; do not keep assertions that require `w.serviceTicketId === ticket.id` as the only duplicate check.

- [ ] **Step 2: Run the focused tests and confirm the new contract fails**

Run:

```bash
node --test --test-name-pattern="normalizes legacy|duplicate checks" html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: FAIL because `queueItemForService`, `queueTicketServiceIds`, and `hasOperationalTicketForServiceTicket` do not exist yet.

- [ ] **Step 3: Implement item creation and Queue normalization**

Replace the single-item hydration block with these concrete helpers, retaining `queueItemsForService` as a one-item compatibility wrapper for older callers:

```js
function queueItemForService(service, techId, serviceTicketId) {
  var serviceName = posServiceDisplayName(service && (service.label || service.name) || '');
  return {
    serviceId: service && service.id ? String(service.id) : '',
    serviceTicketId: serviceTicketId == null ? null : String(serviceTicketId),
    name: serviceName,
    price: Number(service && service.price) || 0,
    durationMin: Number(service && service.durationMin) || 0,
    techId: techId || null,
    cat: queueServiceCategory(service, serviceName)
  };
}
function queueItemsForService(value, techId) {
  var service = salonData.findService(salonCatalog, value);
  if (!service) {
    service = { id: '', label: posServiceDisplayName(value || ''), price: 0, durationMin: 0 };
  }
  return service.label ? [queueItemForService(service, techId || null, null)] : [];
}
function queueTicketServiceIds(w) {
  var ids = [];
  (w && w.items || []).forEach(function (item) {
    var id = item && item.serviceTicketId;
    if (id != null && ids.indexOf(String(id)) === -1) ids.push(String(id));
  });
  (w && w.serviceTicketIds || []).forEach(function (id) {
    if (id != null && ids.indexOf(String(id)) === -1) ids.push(String(id));
  });
  if (w && w.serviceTicketId != null && ids.indexOf(String(w.serviceTicketId)) === -1) ids.push(String(w.serviceTicketId));
  return ids;
}
function normalizeQueueTicketServices(w) {
  if (!Array.isArray(w.items)) w.items = [];
  if (!w.items.length && w.svc) w.items = queueItemsForService(w.svc, w.techId || w.reqTech || null);
  w.items = w.items.map(function (item) {
    var service = salonData.findService(salonCatalog, item.serviceId || item.name);
    return {
      serviceId: String(item.serviceId || service && service.id || ''),
      serviceTicketId: item.serviceTicketId == null ? null : String(item.serviceTicketId),
      name: posServiceDisplayName(item.name || service && (service.label || service.name) || ''),
      price: Number(item.price != null ? item.price : service && service.price) || 0,
      durationMin: Number(item.durationMin != null ? item.durationMin : service && service.durationMin) || 0,
      techId: w.techId || w.reqTech || item.techId || null,
      cat: item.cat || queueServiceCategory(service, item.name)
    };
  }).filter(function (item) { return !!item.name; });
  w.serviceTicketIds = queueTicketServiceIds(w);
  w.items.forEach(function (item, index) {
    if (!item.serviceTicketId && w.serviceTicketIds[index]) item.serviceTicketId = w.serviceTicketIds[index];
  });
  w.serviceTicketIds = queueTicketServiceIds(w);
  w.serviceTicketId = w.serviceTicketIds[0] || null;
  w.svc = w.items[0] ? w.items[0].name : '';
  w.durationMin = w.items.reduce(function (sum, item) { return sum + item.durationMin; }, 0);
  return w;
}
function queueTicketHasServiceTicket(w, serviceTicketId) {
  return serviceTicketId != null && queueTicketServiceIds(w).indexOf(String(serviceTicketId)) !== -1;
}
function queueTicketAssignment(w) {
  return String(w && (w.techId || w.reqTech) || 'anyone');
}
function hasOperationalTicketForServiceTicket(serviceTicketId) {
  return WAITLIST.some(function (w) {
    return w.status !== 'cancelled' && queueTicketHasServiceTicket(w, serviceTicketId);
  });
}
```

In the initial `WAITLIST.forEach`, initialize `serviceTicketIds`, then call `normalizeQueueTicketServices(w)`. Keep `orderId`, `bookingId`, and `customerId` compatibility initialization in the same loop.

- [ ] **Step 4: Run the focused tests**

Run:

```bash
node --test --test-name-pattern="normalizes legacy|duplicate checks|operational-ticket links" html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: PASS.

- [ ] **Step 5: Commit the normalized Queue model**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.operational-tickets.test.cjs
git commit -m "refactor: normalize queue service items"
```

### Task 2: Aggregate check-in, rehydration, and walk-ins by technician

**Files:**
- Modify: `html/pages/pos-phase-1.html:2950-3130`
- Test: `html/pages/pos-phase-1.operational-tickets.test.cjs:20-125`

**Interfaces:**
- Consumes: `queueItemForService`, `normalizeQueueTicketServices`, `queueTicketAssignment`, `hasOperationalTicketForServiceTicket` from Task 1.
- Produces: `bookingTicketGroups(booking) -> ServiceTicket[][]`, `createOperationalTicket(booking, tickets) -> QueueTicket`, `syncBookingOperationalTickets(booking) -> QueueTicket[]`, and `walkInTicketGroups(tickets) -> WalkInService[][]`.

- [ ] **Step 1: Write failing aggregation and reload tests**

Replace the old “one operational ticket per service ticket” test with:

```js
test('Booking check-in groups services by technician into Queue tickets', () => {
  assert.match(html, /function bookingTicketGroups\(booking\) \{/);
  assert.match(html, /function createOperationalTicket\(booking, tickets\) \{/);
  assert.match(html, /function syncBookingOperationalTickets\(booking\) \{/);
  const checkIn = html.match(/function checkInBooking\(eb\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(checkIn, /syncBookingOperationalTickets\(booking\)/);
  const create = html.match(/function createOperationalTicket\(booking, tickets\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(create, /serviceTicketIds: tickets\.map/);
  assert.match(create, /items: tickets\.map/);
});

test('Queue rehydration uses the same technician grouping as check-in', () => {
  const rehydrate = html.match(/function rehydrateOperationalTickets\(\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(rehydrate, /syncBookingOperationalTickets\(b\)/);
  assert.doesNotMatch(rehydrate, /createOperationalTicket\(b, ticket\)/);
});

test('Walk-in services assigned to the same technician share one Queue ticket', () => {
  assert.match(html, /function walkInTicketGroups\(tickets\) \{/);
  const addWalkIn = html.match(/function addWalkIn\(name, phone, tickets\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(addWalkIn, /walkInTicketGroups\(tickets\)/);
  assert.match(addWalkIn, /items: group\.map/);
});
```

- [ ] **Step 2: Run the aggregation tests and observe failure**

```bash
node --test --test-name-pattern="groups services by technician|same technician grouping|Walk-in services" html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: FAIL because both Booking and walk-in paths still create one Queue row per service.

- [ ] **Step 3: Implement Booking grouping and a shared sync path**

Use the assignment key `String(ticket.technicianId || 'anyone')`, filter cancelled canonical tickets, and retain original order within each group:

```js
function bookingTicketGroups(booking) {
  var order = [], groups = {};
  (booking && booking.tickets || []).filter(function (ticket) { return ticket.status !== 'cancelled'; }).forEach(function (ticket) {
    var key = String(ticket.technicianId || 'anyone');
    if (!groups[key]) { groups[key] = []; order.push(groups[key]); }
    groups[key].push(ticket);
  });
  return order;
}
function createOperationalTicket(booking, tickets) {
  tickets = Array.isArray(tickets) ? tickets : [tickets];
  var techId = tickets[0] && tickets[0].technicianId || null;
  var w = {
    id: ++wlSeq, bookingId: booking.id, orderId: booking.id,
    serviceTicketId: tickets[0] ? tickets[0].id : null,
    serviceTicketIds: tickets.map(function (ticket) { return String(ticket.id); }),
    customerId: booking.name, name: booking.name, phone: booking.phone,
    customerGroup: booking.customerGroup || 'New', badge: 'blue',
    badgeTxt: booking.time ? 'Booking' : '', bookingTime: booking.time || '',
    svc: '', note: booking.note || '', at: nowTime(), atMs: Date.now(), status: 'waiting',
    techId: techId, reqTech: techId,
    items: tickets.map(function (ticket) {
      var service = salonData.findService(salonCatalog, ticket.serviceId || ticket.serviceName) || {
        id: ticket.serviceId || '', label: ticket.serviceName, price: ticket.price, durationMin: ticket.durationMin
      };
      return queueItemForService(service, techId, ticket.id);
    }),
    log: [], appt: true
  };
  return normalizeQueueTicketServices(w);
}
function syncBookingOperationalTickets(booking) {
  var touched = [];
  bookingTicketGroups(booking).forEach(function (tickets) {
    var missing = tickets.filter(function (ticket) { return !hasOperationalTicketForServiceTicket(ticket.id); });
    if (!missing.length) return;
    var assignment = String(tickets[0].technicianId || 'anyone');
    var existing = WAITLIST.find(function (w) {
      return ticketOpen(w) && String(w.orderId) === String(booking.id) && queueTicketAssignment(w) === assignment;
    });
    if (!existing) {
      existing = createOperationalTicket(booking, missing);
      WAITLIST.push(existing);
    } else {
      var added = createOperationalTicket(booking, missing);
      existing.items = existing.items.concat(added.items);
      existing.serviceTicketIds = queueTicketServiceIds(existing).concat(added.serviceTicketIds);
      normalizeQueueTicketServices(existing);
    }
    touched.push(existing);
  });
  return touched;
}
```

Call `syncBookingOperationalTickets(booking)` after a successful check-in reload and from `rehydrateOperationalTickets()`. Remove the old nested per-ticket `WAITLIST.push` loops.

- [ ] **Step 4: Group walk-in service choices by technician**

Add `walkInTicketGroups(tickets)` with the same ordered grouping rule and make `addWalkIn` push one normalized Queue row per group:

```js
function walkInTicketGroups(tickets) {
  var source = tickets && tickets.length ? tickets : [null];
  var order = [], groups = {};
  source.forEach(function (ticket) {
    var key = String(ticket && ticket.technicianId || 'anyone');
    if (!groups[key]) { groups[key] = []; order.push(groups[key]); }
    groups[key].push(ticket);
  });
  return order;
}
```

Replace the existing `list.forEach` body in `addWalkIn` with this grouped push. A no-service walk-in remains one empty ticket that can be completed through Edit service:

```js
walkInTicketGroups(tickets).forEach(function (group) {
  var first = group[0];
  var techId = first && first.technicianId || null;
  var wlId = ++wlSeq;
  var w = {
    id: wlId, orderId: orderId, bookingId: null, serviceTicketId: null, serviceTicketIds: [],
    customerId: name, name: name, phone: phone,
    customerGroup: known ? (CUST_SEG_META[known.seg] ? CUST_SEG_META[known.seg].label : 'New') : 'New',
    badge: badge, badgeTxt: badgeTxt, svc: '', at: nowTime(), atMs: Date.now(), status: 'waiting',
    techId: techId, reqTech: techId || (known ? known.prefTech : null),
    items: group.filter(Boolean).map(function (ticket) {
      var service = salonData.findService(salonCatalog, ticket.serviceId || ticket.serviceName) || {
        id: ticket.serviceId || '', label: ticket.serviceName, price: ticket.price, durationMin: ticket.durationMin
      };
      return queueItemForService(service, techId, null);
    }),
    log: []
  };
  WAITLIST.push(normalizeQueueTicketServices(w));
});
```

- [ ] **Step 5: Run focused and full regression tests**

```bash
node --test --test-name-pattern="Booking check-in|rehydration|Walk-in services|operational-ticket links" html/pages/pos-phase-1.operational-tickets.test.cjs
node --test html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: the focused tests PASS. For the full file, only pre-recorded unrelated baseline failures are acceptable; compare the failing test names with the pre-change run and introduce no new failure.

- [ ] **Step 6: Commit technician-grouped Queue creation**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.operational-tickets.test.cjs
git commit -m "feat: group queue services by technician"
```

### Task 3: Convert Edit service into a multi-select draft UI

**Files:**
- Modify: `html/pages/pos-phase-1.html:1215-1240`
- Modify: `html/pages/pos-phase-1.html:4470-4580`
- Modify: `html/pages/pos-phase-1.html:4730-4780`
- Test: `html/pages/pos-phase-1.operational-tickets.test.cjs:260-340`

**Interfaces:**
- Consumes: normalized `w.items`, active `MENU`, `money`, `esc`, `ticketOpen`.
- Produces: `queueServiceDraftIds: string[]`, `queueServiceOriginalServices: Service[]`, `queueServiceCatalogReady: boolean`, `queueSelectedServices() -> Service[]`, `toggleQueueServiceDraft(serviceId)`, `renderQueueServiceDraft(w)`, `changeQueueTicketServices(w, services) -> { ok, error? }`, `saveQueueServices()`, and unchanged open/close entry points.

- [ ] **Step 1: Write failing modal contract tests**

Replace the assertion that an option calls `chooseQueueService` immediately. Require draft toggling, summary, validation, and explicit Save:

```js
test('Edit service is a multi-select draft that saves explicitly', () => {
  assert.match(html, /data-queue-service-summary/);
  assert.match(html, /data-queue-service-error/);
  assert.match(html, /data-queue-service-save/);
  assert.match(html, /var queueServiceFor = null, queueServiceDraftIds = \[\];/);
  assert.match(html, /function queueSelectedServices\(\) \{/);
  assert.match(html, /function toggleQueueServiceDraft\(serviceId\) \{/);
  assert.match(html, /function renderQueueServiceDraft\(w\) \{/);
  assert.match(html, /function saveQueueServices\(\) \{/);
  const open = html.match(/function openQueueServiceModal\(wid\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(open, /queueServiceDraftIds = w\.items\.map/);
  const clicks = html.match(/\/\* edit queue service \*\/[\s\S]*?\/\* ▶ one-tap assign \*\//)?.[0] || '';
  assert.match(clicks, /toggleQueueServiceDraft/);
  assert.match(clicks, /saveQueueServices/);
  assert.doesNotMatch(clicks, /chooseQueueService/);
});

test('Edit service rejects an empty draft before mutating Queue state', () => {
  const save = html.match(/function saveQueueServices\(\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(save, /if \(!services\.length\)/);
  assert.match(save, /At least one service is required\./);
  assert.match(save, /saveButton\.disabled = !selected\.length/);
});

test('Edit service keeps current items visible when the active catalog is unavailable', () => {
  assert.match(html, /var queueServiceCatalogReady = false;/);
  assert.match(html, /var queueServiceOriginalServices = \[\];/);
  const selected = html.match(/function queueSelectedServices\(\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(selected, /queueServiceOriginalServices/);
  const render = html.match(/function renderQueueServiceDraft\(w\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(render, /saveButton\.disabled = !selected\.length \|\| !queueServiceCatalogReady/);
  assert.match(html, /Current service unavailable/);
});
```

- [ ] **Step 2: Run the modal tests and verify failure**

```bash
node --test --test-name-pattern="multi-select draft|empty draft" html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: FAIL because the current option click saves immediately and the modal has no Save footer.

- [ ] **Step 3: Add modal footer and accessible toggle markup**

Change the dialog copy to “Choose one or more services”, give the option list `aria-multiselectable="true"`, and add:

```html
<div class="queue-service-selection" aria-live="polite" data-queue-service-summary>0 services · 0 min · $0.00</div>
<p class="pos-error" data-queue-service-error hidden>At least one service is required.</p>
```

Use this footer:

```html
<div class="sms-mfoot" style="justify-content:space-between;align-items:center">
  <span class="pos-muted">Changes apply to this technician ticket.</span>
  <span class="pos-inline">
    <button class="pos-btn pos-btn-sm" type="button" data-queue-service-close>Cancel</button>
    <button class="pos-btn pos-btn-primary pos-btn-sm" type="button" data-queue-service-save><i class="bi bi-floppy" aria-hidden="true"></i> Save services</button>
  </span>
</div>
```

Add narrowly scoped styles for `.queue-service-option.is-selected`, `.queue-service-selection`, and the checkmark without altering shared `.swap-tech-option` behavior.

- [ ] **Step 4: Implement draft state, toggles, and summary rendering**

Use stable service IDs in modal state and never mutate `w` while clicking options. For a legacy current item without a catalog ID, use `linked:<serviceTicketId>` (or `legacy:<index>` when it has no canonical link) as its draft key:

```js
var queueServiceFor = null, queueServiceDraftIds = [];
var queueServiceOriginalServices = [];
var queueServiceCatalogReady = false;
function queueSelectedServices() {
  var selected = (MENU || []).filter(function (service) {
    return queueServiceDraftIds.indexOf(String(service.id)) !== -1;
  });
  queueServiceOriginalServices.forEach(function (service) {
    if (queueServiceDraftIds.indexOf(String(service._draftId)) === -1) return;
    if (!selected.some(function (candidate) { return String(candidate.id) === String(service.id); })) selected.push(service);
  });
  return selected;
}
function toggleQueueServiceDraft(serviceId) {
  serviceId = String(serviceId);
  var index = queueServiceDraftIds.indexOf(serviceId);
  if (index === -1) queueServiceDraftIds.push(serviceId);
  else queueServiceDraftIds.splice(index, 1);
  var w = WAITLIST.find(function (ticket) { return ticket.id === queueServiceFor; });
  if (w) renderQueueServiceDraft(w);
}
function renderQueueServiceDraft(w) {
  var selected = queueSelectedServices();
  html('[data-queue-service-list]', queueServiceOptionsHtml(w));
  set('[data-queue-service-summary]', selected.length + ' ' + (selected.length === 1 ? 'service' : 'services') + ' · ' +
    selected.reduce(function (sum, service) { return sum + (Number(service.durationMin) || 0); }, 0) + ' min · ' +
    money(selected.reduce(function (sum, service) { return sum + (Number(service.price) || 0); }, 0)));
  var saveButton = $('[data-queue-service-save]');
  if (saveButton) saveButton.disabled = !selected.length || !queueServiceCatalogReady;
  var error = $('[data-queue-service-error]');
  if (error) error.hidden = !!selected.length;
}
```

`queueServiceOptionsHtml` must mark each active option with `aria-selected`, `.is-selected`, and a check icon according to `queueServiceDraftIds`; no selected active option is disabled. Append each original item missing from `MENU` as “Current service unavailable”: it stays toggleable while selected, then becomes disabled after removal so it cannot be newly reselected. `openQueueServiceModal` snapshots every current item into `queueServiceOriginalServices`, assigns each `_draftId`, derives initial draft IDs, sets `queueServiceCatalogReady = (MENU || []).length > 0`, and calls `renderQueueServiceDraft(w)`. If the catalog is unavailable, the original rows and summary stay visible but Save is disabled. `closeQueueServiceModal` clears all modal state so Cancel and Escape discard the draft.

- [ ] **Step 5: Wire explicit toggle and Save events**

In the Queue document click handler:

```js
var servicePick = e.target.closest('[data-queue-service-pick]');
if (servicePick) {
  toggleQueueServiceDraft(servicePick.getAttribute('data-queue-service-pick'));
  return;
}
if (e.target.closest('[data-queue-service-save]')) {
  saveQueueServices();
  return;
}
```

Add a complete session-only implementation so this task independently delivers multi-service editing for walk-ins:

```js
function changeQueueTicketServices(w, services) {
  if (!w || !services || !services.length) return { ok: false, error: { message: 'At least one service is required.' } };
  if (w.bookingId) return { ok: false, error: { message: 'Linked Booking services are not available yet.' } };
  var previousNames = (w.items || []).map(function (item) { return item.name; });
  var techId = w.techId || w.reqTech || null;
  w.items = services.map(function (service) { return queueItemForService(service, techId, null); });
  w.serviceTicketIds = [];
  normalizeQueueTicketServices(w);
  wlog(w, 'Changed services from ' + (previousNames.join(', ') || 'none') + ' to ' + w.items.map(function (item) { return item.name; }).join(', '));
  return { ok: true };
}
function saveQueueServices() {
  var w = WAITLIST.find(function (ticket) { return ticket.id === queueServiceFor && ticketOpen(ticket); });
  var services = queueSelectedServices();
  var error = $('[data-queue-service-error]');
  if (!services.length) {
    if (error) { error.textContent = 'At least one service is required.'; error.hidden = false; }
    return;
  }
  var result = changeQueueTicketServices(w, services);
  if (!result.ok) {
    if (error) { error.textContent = result.error && result.error.message || 'Services could not be updated.'; error.hidden = false; }
    return;
  }
  closeQueueServiceModal();
  followQueueTicketAfterAction(w, w.status);
  toast(w.name + ' · ' + w.items.length + ' services updated');
}
```

Task 4 replaces only the Booking-linked error branch with persist-first canonical synchronization; the walk-in behavior and `saveQueueServices` contract stay unchanged.

- [ ] **Step 6: Run modal tests and commit the interaction shell**

```bash
node --test --test-name-pattern="Edit service|multi-select draft|empty draft" html/pages/pos-phase-1.operational-tickets.test.cjs
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.operational-tickets.test.cjs
git commit -m "feat: add multi-select queue service editor"
```

Expected: modal source tests PASS; no option click closes the dialog or mutates the ticket, and explicit Save updates a session-only walk-in.

### Task 4: Persist multi-service edits transactionally to Booking

**Files:**
- Modify: `html/pages/pos-phase-1.html:4470-4585`
- Test: `html/pages/pos-phase-1.operational-tickets.test.cjs:275-365`

**Interfaces:**
- Consumes: `queueItemForService`, `queueTicketServiceIds`, `normalizeQueueTicketServices`, modal functions from Task 3, `appointmentStore.update`.
- Produces: `nextBookingServiceTicketId(usedIds) -> string`, `queueBookingServicesPatch(booking, w, services) -> { ok, patch, items, serviceTicketIds }`, and `changeQueueTicketServices(w, services) -> { ok, error? }`.

- [ ] **Step 1: Replace the one-service behavior test with linked Booking add/retain/remove coverage**

Build the existing `new Function` harness with the three new function sources and assert this scenario:

```js
test('Queue multi-service edit preserves, creates, and cancels linked Booking tickets atomically', () => {
  const booking = {
    id: 'booking-1',
    tickets: [
      { id: 'ticket-1', serviceId: 'svc-keep', serviceName: 'Keep', price: 20, durationMin: 20, technicianId: 't1', status: 'confirmed' },
      { id: 'ticket-2', serviceId: 'svc-remove', serviceName: 'Remove', price: 15, durationMin: 15, technicianId: 't1', status: 'confirmed' },
      { id: 'ticket-3', serviceId: 'svc-other', serviceName: 'Other tech', price: 30, durationMin: 30, technicianId: 't2', status: 'confirmed' }
    ]
  };
  const queue = {
    id: 7, bookingId: booking.id, techId: 't1', reqTech: 't1', svc: 'Keep',
    serviceTicketId: 'ticket-1', serviceTicketIds: ['ticket-1', 'ticket-2'],
    items: [
      { serviceId: 'svc-keep', serviceTicketId: 'ticket-1', name: 'Keep', price: 20, durationMin: 20, techId: 't1', cat: 'mani' },
      { serviceId: 'svc-remove', serviceTicketId: 'ticket-2', name: 'Remove', price: 15, durationMin: 15, techId: 't1', cat: 'gel' }
    ]
  };
  const selected = [
    { id: 'svc-keep', label: 'Keep', price: 20, durationMin: 20 },
    { id: 'svc-new', label: 'New', price: 40, durationMin: 45 }
  ];
  const result = changeQueueTicketServices(queue, selected);
  assert.equal(result.ok, true);
  assert.deepEqual(queue.serviceTicketIds, ['ticket-1', 'ticket-4']);
  assert.deepEqual(queue.items.map((item) => item.serviceId), ['svc-keep', 'svc-new']);
  assert.equal(queue.durationMin, 65);
  assert.equal(updates[0].patch.tickets.find((ticket) => ticket.id === 'ticket-2').status, 'cancelled');
  assert.equal(updates[0].patch.tickets.find((ticket) => ticket.id === 'ticket-3').status, 'confirmed');
});
```

Add a second harness where `appointmentStore.update` returns `{ ok: false, error: { message: 'Store unavailable' } }`; deep-clone `queue` before the call and assert strict deep equality afterward.

- [ ] **Step 2: Run the persistence tests and verify failure**

```bash
node --test --test-name-pattern="preserves, creates, and cancels|Store unavailable" html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: FAIL because the current mutation updates one canonical ticket in place.

- [ ] **Step 3: Implement a deterministic canonical Booking patch**

`nextBookingServiceTicketId` must scan all existing IDs and return the first free `ticket-N`. `queueBookingServicesPatch` must:

1. Validate every ID returned by `queueTicketServiceIds(w)` exists in `booking.tickets`; return `{ ok:false, error:{ message:'The linked booking ticket could not be found.' } }` if one is absent.
2. Match a retained selected service by `serviceId` only within the Queue ticket's linked IDs and preserve that canonical ID.
3. Allocate a new ID for each selected service not retained.
4. Copy unrelated Booking tickets unchanged.
5. Mark linked tickets omitted from the selection as `{ ...ticket, status: 'cancelled' }`.
6. Append newly created canonical tickets with the Queue technician, technician name, numeric price/duration, and status `confirmed`.
7. Build top-level `serviceIds`, `serviceNames`, and `serviceDetails` from every non-cancelled canonical ticket.
8. Return Queue `items` carrying the retained/new canonical IDs.

Use this exact return contract:

```js
return {
  ok: true,
  patch: {
    tickets: nextTickets,
    serviceIds: activeTickets.map(function (ticket) { return ticket.serviceId || ''; }),
    serviceNames: activeTickets.map(function (ticket) { return ticket.serviceName || ''; }),
    serviceDetails: activeTickets.map(function (ticket) {
      return { id: ticket.serviceId || '', name: ticket.serviceName || '', price: ticket.price, durationMin: ticket.durationMin, icon: '✨' };
    })
  },
  items: selectedTickets.map(function (ticket) {
    var service = services.find(function (candidate) { return String(candidate.id) === String(ticket.serviceId); });
    return queueItemForService(service, techId, ticket.id);
  }),
  serviceTicketIds: selectedTickets.map(function (ticket) { return String(ticket.id); })
};
```

- [ ] **Step 4: Implement persist-first Queue mutation**

`changeQueueTicketServices(w, services)` must validate non-empty active selections, prepare every next field in local variables, persist the Booking patch, and only then mutate `w`:

```js
function changeQueueTicketServices(w, services) {
  if (!w || !services || !services.length) return { ok: false, error: { message: 'At least one service is required.' } };
  var previousNames = (w.items || []).map(function (item) { return item.name; });
  var techId = w.techId || w.reqTech || null;
  var nextItems, nextIds;
  if (w.bookingId) {
    var booking = posBookingById(w.bookingId);
    if (!booking) return { ok: false, error: { message: 'The linked booking could not be found.' } };
    var prepared = queueBookingServicesPatch(booking, w, services);
    if (!prepared.ok) return prepared;
    var updateResult = appointmentStore.update(booking.id, prepared.patch, null, salonCatalog);
    if (!updateResult.ok) return updateResult;
    nextItems = prepared.items;
    nextIds = prepared.serviceTicketIds;
    reloadAppointmentSnapshot();
  } else {
    nextItems = services.map(function (service) { return queueItemForService(service, techId, null); });
    nextIds = [];
  }
  w.items = nextItems;
  w.serviceTicketIds = nextIds;
  normalizeQueueTicketServices(w);
  wlog(w, 'Changed services from ' + (previousNames.join(', ') || 'none') + ' to ' + w.items.map(function (item) { return item.name; }).join(', '));
  return { ok: true };
}
```

`saveQueueServices()` calls this function, keeps the modal open and displays the returned error on failure, and on success closes, rerenders, restores focus with `followQueueTicketAfterAction(w, w.status)`, and shows a count-based toast.

- [ ] **Step 5: Run persistence and modal regressions**

```bash
node --test --test-name-pattern="Queue multi-service edit|Edit service|empty draft" html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: PASS, including the store-failure no-mutation assertion.

- [ ] **Step 6: Commit transactional multi-service persistence**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.operational-tickets.test.cjs
git commit -m "feat: persist queue multi-service edits"
```

### Task 5: Render every service and require every skill

**Files:**
- Modify: `html/pages/pos-phase-1.html:3270-3325`
- Modify: `html/pages/pos-phase-1.html:4180-4395`
- Test: `html/pages/pos-phase-1.operational-tickets.test.cjs:190-275`

**Interfaces:**
- Consumes: normalized `QueueItem[]` and existing `SVC_REQ`, `SVC_PRI`, `matchScore` call sites.
- Produces: `queueServiceNames(w) -> string[]`, `queueServicesHtml(w, variant) -> string`, `reqSkills(w) -> string[]`; `matchScore` additionally returns `reqs: string[]` and `missing: string[]` while retaining `req: string|null` for compatibility.

- [ ] **Step 1: Write failing render and all-skills tests**

```js
test('Queue card, table, and grouped labels render every service item', () => {
  assert.match(html, /function queueServiceNames\(w\) \{/);
  assert.match(html, /function queueServicesHtml\(w, variant\) \{/);
  const table = html.match(/function renderTicketsTable\(groups, now\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const card = html.match(/function ticketCardBodyHtml\(w, elapsedLabel, statusChipHtml, techExtra\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const label = html.match(/function ticketLabelHtml\(w\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(table, /queueServicesHtml\(w, 'table'\)/);
  assert.match(card, /queueServicesHtml\(w, 'card'\)/);
  assert.match(label, /queueServiceNames\(w\)\.join\(', '\)/);
});

test('Technician matching requires skills for every Queue item', () => {
  assert.match(html, /function reqSkills\(w\) \{/);
  const score = html.match(/function matchScore\(t, w\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(score, /var reqs = reqSkills\(w\);/);
  assert.match(score, /var missing = reqs\.filter/);
  assert.match(score, /okSkill: missing\.length === 0/);
});
```

- [ ] **Step 2: Run render/matching tests and verify failure**

```bash
node --test --test-name-pattern="render every service|requires skills for every" html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: FAIL because renderers use only `w.svc` and matching returns the first inferred skill.

- [ ] **Step 3: Add shared service-list rendering**

Implement:

```js
function queueServiceNames(w) {
  var names = (w.items || []).map(function (item) { return posServiceDisplayName(item.name || ''); }).filter(Boolean);
  return names.length ? names : [posServiceDisplayName(w.svc || 'No service chosen')];
}
function queueServicesHtml(w, variant) {
  var names = queueServiceNames(w);
  if (variant === 'card') {
    return '<span class="queue-ticket-services">' + names.map(function (name) {
      return '<span class="queue-ticket-service-line">' + esc(name) + '</span>';
    }).join('') + '</span>';
  }
  return '<span class="queue-ticket-services queue-ticket-services-compact">' + esc(names.join(', ')) + '</span>';
}
```

Use the helper in `renderTicketsTable`, `ticketCardBodyHtml`, and use `queueServiceNames(w).join(', ')` in `ticketLabelHtml`. Ensure the grouped-order row therefore shows every item before the technician/status suffix. Keep totals as the sum of all item prices and duration as the normalized sum.

- [ ] **Step 4: Replace first-match skill logic with an all-requirements result**

Make `reqSkills(w)` infer a requirement separately for each item, deduplicate in service order, and let `reqSkill(w)` return the first item only as a compatibility alias:

```js
function reqSkills(w) {
  var requirements = [];
  (w.items && w.items.length ? w.items : [{ name: w.svc || '', cat: '' }]).forEach(function (item) {
    var req = null;
    if (item.cat && SVC_REQ[item.cat]) req = SVC_REQ[item.cat];
    if (!req) {
      var txt = String(item.name || '').toLowerCase();
      if (/acrylic|full set|fill|ombre|sculpt/.test(txt)) req = 'Acrylic';
      else if (/dip/.test(txt)) req = 'Dip';
      else if (/pedicure|pedi/.test(txt)) req = 'Pedicure';
      else if (/design|nail art|chrome|cat eye/.test(txt)) req = 'Design';
      else if (/wax/.test(txt)) req = 'Waxing';
      else if (/gel|shellac/.test(txt)) req = 'Gel';
      else if (/manicure|mani/.test(txt)) req = 'Manicure';
    }
    if (req && requirements.indexOf(req) === -1) requirements.push(req);
  });
  return requirements;
}
function reqSkill(w) { return reqSkills(w)[0] || null; }
```

In `matchScore`, compute `missing`, make `okSkill` depend on `missing.length === 0`, grant expertise points only for requirements present in `t.exp`, and return `{ sc, req: reqs.join(', ') || null, reqs, missing, okSkill }`. Update swap, two-tap assignment, and access-request warnings to list `match.missing.join(', ')` so the exact missing skills are visible.

- [ ] **Step 5: Run focused and current action-layout tests**

```bash
node --test --test-name-pattern="render every service|requires skills for every|Change tech|Queue table" html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: PASS; Edit service remains available in waiting, service, and ready states.

- [ ] **Step 6: Commit multi-service rendering and matching**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.operational-tickets.test.cjs
git commit -m "feat: render and match all queue services"
```

### Task 6: Merge ticket collisions when technician assignment changes

**Files:**
- Modify: `html/pages/pos-phase-1.html:3330-3390`
- Modify: `html/pages/pos-phase-1.html:4400-4470`
- Modify: `html/pages/pos-phase-1.html:4780-4840`
- Test: `html/pages/pos-phase-1.operational-tickets.test.cjs:340-440`

**Interfaces:**
- Consumes: `queueTicketAssignment`, `normalizeQueueTicketServices`, `queueTicketServiceIds`, `wlog`.
- Produces: `mergeQueueTicketForAssignment(w) -> QueueTicket`, `applyQueueTechnician(w, tid) -> QueueTicket`; `assignWaitingTech` and `fAssign` return the surviving Queue ticket.

- [ ] **Step 1: Write failing merge-policy tests**

```js
test('Changing technician merges same-order Queue tickets without losing services', () => {
  assert.match(html, /function mergeQueueTicketForAssignment\(w\) \{/);
  assert.match(html, /function applyQueueTechnician\(w, tid\) \{/);
  const merge = html.match(/function mergeQueueTicketForAssignment\(w\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(merge, /String\(candidate\.orderId\) === String\(w\.orderId\)/);
  assert.match(merge, /queueTicketAssignment\(candidate\) === queueTicketAssignment\(w\)/);
  assert.match(merge, /serviceTicketId \|\| item\.serviceId/);
  assert.match(merge, /service: 3, waiting: 2, ready: 1/);
  assert.match(merge, /Math\.min/);
  assert.match(merge, /Merged technician ticket/);
});
```

Add a behavioral harness with two tickets from the same order: one `ready` ticket containing `svc-a`, one `service` ticket containing `svc-b`. Assign the ready ticket to the service ticket's technician and assert one open ticket remains, it is `service`, contains both unique service IDs and linked IDs, uses the earliest `atMs`/`svcAtMs`, and has a merge log entry.

- [ ] **Step 2: Run the merge test and verify failure**

```bash
node --test --test-name-pattern="merges same-order Queue tickets" html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: FAIL because current technician assignment can leave two open rows with the same order/technician identity.

- [ ] **Step 3: Implement the deterministic merge**

Use the current ticket as survivor. Find other open tickets with the same `orderId` and assignment. Merge items using `serviceTicketId` as the primary uniqueness key and `serviceId` as the fallback. Merge `serviceTicketIds` uniquely, concatenate histories, and calculate state with:

```js
var statusRank = { service: 3, waiting: 2, ready: 1 };
var statuses = [w.status, collision.status];
w.status = statuses.sort(function (a, b) { return (statusRank[b] || 0) - (statusRank[a] || 0); })[0];
function earliest(a, b) {
  if (!a) return b;
  if (!b) return a;
  return Math.min(a, b);
}
w.atMs = earliest(w.atMs, collision.atMs);
w.svcAtMs = earliest(w.svcAtMs, collision.svcAtMs);
w.readyAtMs = earliest(w.readyAtMs, collision.readyAtMs);
```

After copying data, set each collision to `status = 'cancelled'` as a superseded Queue record, clear its linked IDs/items so completion cannot count them twice, call `normalizeQueueTicketServices(w)`, and log `Merged technician ticket #<id> into this ticket`. Do not invoke Booking cancellation for a superseded row.

- [ ] **Step 4: Route every technician assignment through one helper**

```js
function applyQueueTechnician(w, tid) {
  w.techId = tid || null;
  w.reqTech = tid || null;
  (w.items || []).forEach(function (item) { item.techId = tid || null; });
  return mergeQueueTicketForAssignment(w);
}
```

Make `assignWaitingTech` and `fAssign` call this helper and return its result. Update `chooseSwapTech`, the Start handler, and the two-tap technician handler to use the returned survivor for `followQueueTicketAfterAction`, selection, logging, and toast text.

- [ ] **Step 5: Run merge, assignment, and matching tests**

```bash
node --test --test-name-pattern="merges same-order|Assign tech|requires skills|Change tech" html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: PASS, with exactly one open ticket per order/technician after each assignment path.

- [ ] **Step 6: Commit collision-safe technician movement**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.operational-tickets.test.cjs
git commit -m "fix: merge queue tickets after technician changes"
```

### Task 7: Expand Checkout/completion and persist whole-ticket cancellation

**Files:**
- Modify: `html/pages/pos-phase-1.html:2885-2950`
- Modify: `html/pages/pos-phase-1.html:3090-3130`
- Modify: `html/pages/pos-phase-1.html:4790-4830`
- Test: `html/pages/pos-phase-1.operational-tickets.test.cjs:80-190`

**Interfaces:**
- Consumes: `queueTicketServiceIds`, normalized item fields, `appointmentStore.update`.
- Produces: flattened Checkout `serviceDetails` and `tickets`, multi-ID Booking completion, `cancelQueueTicket(w) -> { ok, error? }`.

- [ ] **Step 1: Write failing Checkout, completion, and cancellation tests**

```js
test('Queue Checkout emits one canonical detail and ticket per Queue item', () => {
  const snapshot = html.match(/function queueCheckoutSnapshot\(orderKey, groupTickets\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(snapshot, /serviceTicketId: item\.serviceTicketId \|\| null/);
  assert.match(snapshot, /durationMin: item\.durationMin \|\| null/);
  assert.match(snapshot, /var checkoutTickets = \[\];/);
  assert.match(snapshot, /checkoutTickets\.push/);
  assert.match(snapshot, /tickets: checkoutTickets/);
});

test('Booking completion recognizes every serviceTicketIds value', () => {
  const complete = html.match(/function checkBookingOrderComplete\(bookingId\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(complete, /queueTicketHasServiceTicket\(candidate, t\.id\)/);
});

test('Queue cancellation persists every linked canonical Booking ticket before mutating Queue', () => {
  assert.match(html, /function cancelQueueTicket\(w\) \{/);
  const cancel = html.match(/function cancelQueueTicket\(w\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(cancel, /queueTicketServiceIds\(w\)/);
  assert.match(cancel, /appointmentStore\.update/);
  assert.match(cancel, /if \(!result\.ok\) return result;/);
  assert.match(cancel, /w\.status = 'cancelled'/);
});
```

Add behavior assertions that a two-item Queue ticket produces two `serviceDetails`, two Checkout `tickets`, the correct combined total, and distinct canonical `serviceTicketId` values. Add a failed-store cancellation harness that proves `w.status` remains unchanged.

- [ ] **Step 2: Run the lifecycle tests and verify failure**

```bash
node --test --test-name-pattern="one canonical detail|recognizes every|persists every linked" html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: FAIL because Checkout assigns the row-level ID to every item, completion checks one ID, and cancellation mutates only Queue memory.

- [ ] **Step 3: Flatten every Queue item into Checkout**

Inside `queueCheckoutSnapshot`, initialize `var checkoutTickets = [];`. In the existing item loop push both structures using item-level values:

```js
var serviceTicketId = item.serviceTicketId || null;
var detail = {
  name: item.name || w.svc || 'Service',
  price: Number(item.price) || 0,
  technicianId: tid,
  technicianName: tid ? techName(tid) : 'Anyone',
  serviceTicketId: serviceTicketId,
  durationMin: item.durationMin || null,
  category: item.cat || ''
};
serviceDetails.push(detail);
checkoutTickets.push({
  id: serviceTicketId || ('queue-ticket-' + w.id + '-' + checkoutTickets.length),
  serviceName: detail.name,
  price: detail.price,
  technicianId: tid,
  technicianName: detail.technicianName,
  status: w.status,
  queueTicketId: w.id
});
```

Return `tickets: checkoutTickets`. Do not use row-level `w.durationMin` or `w.serviceTicketId` for each service detail.

- [ ] **Step 4: Update completion and transactional cancellation**

In `checkBookingOrderComplete`, find a completed Queue ticket with `queueTicketHasServiceTicket(candidate, t.id)` for each non-cancelled canonical ticket.

Implement cancellation as:

```js
function cancelQueueTicket(w) {
  if (!w) return { ok: false, error: { message: 'Queue ticket not found.' } };
  if (w.bookingId) {
    var booking = posBookingById(w.bookingId);
    var ids = queueTicketServiceIds(w);
    if (!booking || ids.some(function (id) { return !(booking.tickets || []).some(function (ticket) { return String(ticket.id) === id; }); })) {
      return { ok: false, error: { message: 'The linked booking ticket could not be found.' } };
    }
    var nextTickets = (booking.tickets || []).map(function (ticket) {
      return ids.indexOf(String(ticket.id)) === -1 ? ticket : Object.assign({}, ticket, { status: 'cancelled' });
    });
    var active = nextTickets.filter(function (ticket) { return ticket.status !== 'cancelled'; });
    var result = appointmentStore.update(booking.id, {
      tickets: nextTickets,
      serviceIds: active.map(function (ticket) { return ticket.serviceId || ''; }),
      serviceNames: active.map(function (ticket) { return ticket.serviceName || ''; }),
      serviceDetails: active.map(function (ticket) { return { id: ticket.serviceId || '', name: ticket.serviceName || '', price: ticket.price, durationMin: ticket.durationMin, icon: '✨' }; })
    }, null, salonCatalog);
    if (!result.ok) return result;
    reloadAppointmentSnapshot();
  }
  w.status = 'cancelled';
  wlog(w, 'Cancelled technician ticket and all linked services');
  return { ok: true };
}
```

The confirmation handler calls `cancelQueueTicket(xw)`, shows an error toast and leaves the card/modal state intact on failure, or calls `followQueueTicketAfterAction` only on success.

- [ ] **Step 5: Run all operational-ticket tests**

```bash
node --test html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: all tests touched by this plan PASS and there are no new failures relative to the recorded baseline.

- [ ] **Step 6: Commit full lifecycle support**

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.operational-tickets.test.cjs
git commit -m "feat: complete multi-service queue lifecycle"
```

### Task 8: Browser regression and final cleanup

**Files:**
- Modify if needed: `html/pages/pos-phase-1.html`
- Modify if needed: `html/pages/pos-phase-1.operational-tickets.test.cjs`

**Interfaces:**
- Consumes: complete multi-service Queue implementation from Tasks 1-7.
- Produces: verified user-facing workflow and a clean scoped diff.

- [ ] **Step 1: Run syntax and focused regression checks**

```bash
node --check html/pages/pos-phase-1.operational-tickets.test.cjs
node --test --test-name-pattern="Queue|Booking check-in|rehydration|Checkout|completion|cancellation|technician" html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: both commands exit 0.

- [ ] **Step 2: Run the complete test file and capture exact results**

```bash
node --test html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: no failure caused by changed Queue behavior. If the repository still contains unrelated baseline failures, record their exact names and confirm they match the pre-implementation baseline.

- [ ] **Step 3: Serve the prototype locally**

```bash
python3 -m http.server 4173 --directory html
```

Open `http://localhost:4173/pages/pos-phase-1.html?tab=tickets`.

- [ ] **Step 4: Verify the walk-in multi-service flow in the browser**

Use a waiting walk-in ticket and verify all of these observable results:

1. Edit service opens with every current service preselected.
2. Selecting a second service does not close the modal or change the Queue card.
3. The footer count, total minutes, and total price update immediately.
4. Removing every service disables Save and shows “At least one service is required.”
5. Saving two services closes the modal and shows both names, summed duration, and summed price on one ticket.
6. Card and table views show the same service list.

- [ ] **Step 5: Verify Booking-linked grouping, technician movement, and Checkout**

Create/check in a Booking with two services for the same technician and one service for another technician. Confirm:

1. Queue shows two open technician tickets, not three service rows.
2. Editing the two-service ticket persists after a page reload.
3. Changing its technician to the other ticket's technician merges them into one open ticket with all services.
4. A technician missing any required skill triggers the override warning listing each missing skill.
5. Done/Checkout applies to the whole technician ticket.
6. The Checkout payload contains one detail per service and its total matches Queue.
7. Cancelling a linked ticket cancels all of its canonical services and a reload does not recreate them.

- [ ] **Step 6: Inspect the final scoped diff**

```bash
git status --short
git diff --check
git diff -- html/pages/pos-phase-1.html html/pages/pos-phase-1.operational-tickets.test.cjs
```

Expected: no whitespace errors, no debug output, no unrelated file changes, and no obsolete references to `chooseQueueService` or `changeQueueTicketService`.

- [ ] **Step 7: Commit any browser-found fixes**

If Step 4 or 5 required a correction, rerun Steps 1-2 and commit only the scoped files:

```bash
git add html/pages/pos-phase-1.html html/pages/pos-phase-1.operational-tickets.test.cjs
git commit -m "fix: polish multi-service queue workflow"
```

If no correction was needed, do not create an empty commit.
