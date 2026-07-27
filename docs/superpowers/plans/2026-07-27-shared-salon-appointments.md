
# Shared Salon Catalog and Two-Way Appointments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Make Booking Book and POS use one salon-scoped service/technician catalog and one persistent appointment store with two-way cross-tab synchronization.

**Architecture:** Add a UMD-compatible salon-data.js module for the Bitcoin Nail Bar catalog and an appointments-store.js module for normalized appointments, localStorage persistence, migration, conflict validation, and storage-event subscriptions. Both HTML pages load those modules before their inline runtime scripts, migrate their existing fixtures once, render from store snapshots, and write all appointment mutations through the store.

**Tech Stack:** Vanilla JavaScript, single-file HTML pages, DayPilot Lite 5.9.0, browser localStorage/storage events, Node.js built-in node:test, CommonJS and ESM test files.

## Global Constraints

- Salon ID is exactly 'bitcoin-nail-bar-houston'.
- Catalog storage key is exactly 'nexora:salon-data:v1:bitcoin-nail-bar-houston'.
- Appointment storage key is exactly 'nexora:appointments:v1:bitcoin-nail-bar-houston'.
- Use no backend, authentication, new runtime dependency, or real SMS integration.
- Preserve local date/time fields without converting through UTC.
- Appointment cancellation is soft cancellation with status 'cancelled'; never remove the canonical record.
- Use the existing escaping helpers before rendering customer, service, technician, and note values.
- Keep DayPilot Lite 5.9.0 and the existing responsive layouts.
- Preserve existing POS payroll fields through technician.posProfile rather than creating a second technician authority.
- Existing demo fixtures are imported exactly once per source key: 'booking-book-static-v1' and 'pos-seed-v1'.
- Every task must finish with its focused tests passing and a separate git commit.

## File Map

Create:

- html/assets/salon-data.js — default salon metadata, service catalog, technician roster, catalog normalization, alias lookup, and catalog persistence.
- html/assets/salon-data.test.cjs — catalog shape, alias, persistence, and fallback tests.
- html/assets/appointments-store.js — canonical appointment model, normalization, migration markers, CRUD, conflict validation, persistence, and subscriptions.
- html/assets/appointments-store.test.cjs — store behavior and migration tests using an in-memory storage adapter.
- html/pages/booking-book-phase-1.shared-appointments.test.mjs — Booking Book static contract tests for shared scripts, migration, rendering, and synchronization hooks.

Modify:

- html/pages/booking-book-phase-1.html:9701-10735,10880-11055,11590-11705 — load shared modules, replace duplicate catalog authorities, migrate/render rows from the store, write status/create/catalog changes through shared APIs, and subscribe to updates.
- html/pages/pos-phase-1.html:747-825,2182-2535,2800-2845 — load shared modules, derive TECHS/MENU from the catalog, migrate the POS seed, use a store-backed snapshot, and write appointment mutations through the store.
- html/assets/pos-appointments-data.js:50-116 — retain the seed generator as a fixture provider and add an explicit migration-fixture export without making it runtime authority.
- html/pages/pos-phase-1.appointments.test.cjs — assert shared module loading, catalog-driven authorities, store mutations, and soft cancellation.
- html/assets/pos-appointments-data.test.cjs — preserve fixture coverage and verify the migration-fixture export.

---

### Task 1: Add the shared salon catalog

**Files:**

- Create: html/assets/salon-data.test.cjs
- Create: html/assets/salon-data.js

**Interfaces:**

- Produces SALON_ID, DEFAULT_CATALOG, cloneCatalog(catalog), normalizeCatalog(input), findService(catalog, value), findTechnician(catalog, value), loadCatalog(storage), and saveCatalog(catalog, storage) through CommonJS and window.NEXORA_SALON_DATA.
- findService and findTechnician accept a canonical ID, exact name, or case-insensitive alias and return a normalized object or null.

- [ ] **Step 1: Write the failing catalog tests**

~~~js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  SALON_ID,
  DEFAULT_CATALOG,
  findService,
  findTechnician,
  normalizeCatalog,
  loadCatalog,
  saveCatalog,
} = require('./salon-data.js');

function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

test('default catalog is scoped to one salon with unique services and technicians', () => {
  assert.equal(SALON_ID, 'bitcoin-nail-bar-houston');
  assert.equal(DEFAULT_CATALOG.salon.id, SALON_ID);
  assert.equal(new Set(DEFAULT_CATALOG.services.map((item) => item.id)).size, DEFAULT_CATALOG.services.length);
  assert.equal(new Set(DEFAULT_CATALOG.technicians.map((item) => item.id)).size, DEFAULT_CATALOG.technicians.length);
  assert.ok(DEFAULT_CATALOG.services.some((item) => item.name === 'Eyelash'));
  assert.ok(DEFAULT_CATALOG.technicians.some((item) => item.name === 'Mai P.'));
});

test('lookup resolves canonical IDs, names, and aliases', () => {
  assert.equal(findTechnician(DEFAULT_CATALOG, 'Kim N.').id, 't2');
  assert.equal(findTechnician(DEFAULT_CATALOG, 't8').name, 'Mai P.');
  assert.equal(findService(DEFAULT_CATALOG, 'Classic Pedicure').id, 'pedi');
  assert.equal(findService(DEFAULT_CATALOG, 'missing-service'), null);
});

test('normalizeCatalog removes duplicate IDs and supplies safe defaults', () => {
  const catalog = normalizeCatalog({
    salon: { id: SALON_ID, name: 'Test Salon', location: 'Houston, TX' },
    services: [{ id: 'pedi', name: 'Pedicure' }, { id: 'pedi', name: 'Duplicate' }],
    technicians: [{ id: 't1', name: 'Tina' }, { id: 't1', name: 'Duplicate' }],
  });
  assert.equal(catalog.services.length, 1);
  assert.equal(catalog.technicians.length, 1);
  assert.equal(catalog.services[0].active, true);
  assert.deepEqual(catalog.technicians[0].skills, []);
});

test('catalog persistence falls back to defaults for missing or invalid JSON', () => {
  const missing = loadCatalog(storage());
  assert.equal(missing.salon.id, SALON_ID);

  const invalid = loadCatalog(storage({
    ['nexora:salon-data:v1:' + SALON_ID]: '{bad json',
  }));
  assert.equal(invalid.salon.id, SALON_ID);
});

test('saveCatalog writes a normalized clone under the salon-scoped key', () => {
  const target = storage();
  const result = saveCatalog({
    salon: { id: SALON_ID, name: 'Saved Salon', location: 'Houston, TX' },
    services: [], technicians: [],
  }, target);
  assert.equal(result.salon.name, 'Saved Salon');
  assert.match(target.getItem('nexora:salon-data:v1:' + SALON_ID), /Saved Salon/);
});
~~~

- [ ] **Step 2: Run the catalog tests to verify they fail**

Run: node --test html/assets/salon-data.test.cjs

Expected: FAIL because html/assets/salon-data.js does not exist.

- [ ] **Step 3: Implement the catalog module**

Implement a UMD wrapper matching html/assets/pos-appointments-data.js. Define the eight technicians:

- t1 Tina
- t2 Kim, alias Kim N.
- t3 Helen
- t4 Andy
- t5 Vy
- t6 Lan T.
- t7 Linda
- t8 Mai P.

Move the current POS service IDs into the shared services list. Add Booking Book aliases, the Booking Book Eyelash service, and the POS Kid's Menu entry. Keep POS payroll fields under posProfile and give t6-t8 null/empty profile values.

Use this persistence contract:

~~~js
var SALON_ID = 'bitcoin-nail-bar-houston';
var STORAGE_KEY = 'nexora:salon-data:v1:' + SALON_ID;

function loadCatalog(storage) {
  var target = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!target) return cloneCatalog(DEFAULT_CATALOG);
  try {
    var raw = target.getItem(STORAGE_KEY);
    return raw ? normalizeCatalog(JSON.parse(raw)) : cloneCatalog(DEFAULT_CATALOG);
  } catch (error) {
    return cloneCatalog(DEFAULT_CATALOG);
  }
}

function saveCatalog(catalog, storage) {
  var normalized = normalizeCatalog(catalog);
  var target = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  if (target) target.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return cloneCatalog(normalized);
}
~~~

Use price/duration values already present in the current Booking Book options where available. Preserve current POS IDs; use aliases for conflicting labels instead of creating duplicate records.

- [ ] **Step 4: Run the catalog tests to verify they pass**

Run: node --test html/assets/salon-data.test.cjs

Expected: PASS for all catalog tests.

- [ ] **Step 5: Commit the catalog module**

~~~bash
git add html/assets/salon-data.js html/assets/salon-data.test.cjs
git commit -m "feat: add shared salon catalog"
~~~

### Task 2: Add the canonical appointment store

**Files:**

- Create: html/assets/appointments-store.test.cjs
- Create: html/assets/appointments-store.js

**Interfaces:**

- Consumes the salon-data.js catalog and the existing POS/Booking Book record shapes.
- Produces normalizeAppointment(input, catalog, now), mapBookingStatus(status), mapCanonicalToBookingStatus(record), loadAll(storage, catalog), ensureSource(sourceKey, records, storage, catalog, now), create(record, storage, catalog, now), update(id, patch, storage, catalog, now), upsert(record, storage, catalog, now), cancel(id, storage, catalog, now), hasConflict(records, candidate, excludeId), and subscribe(listener, windowObject).
- Every mutation returns { ok: true, record } or { ok: false, error: { code, message, field } } without throwing for user input errors.

- [ ] **Step 1: Write the failing store tests**

~~~js
const test = require('node:test');
const assert = require('node:assert/strict');
const catalogApi = require('./salon-data.js');
const store = require('./appointments-store.js');

function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

const catalog = catalogApi.DEFAULT_CATALOG;

test('normalizes a POS seed into canonical local date/time fields', () => {
  const record = store.normalizeAppointment({
    id: 'apt-1', name: 'Linh', phone: '(832) 555-0100', techId: 't2',
    serviceIds: ['pedi'], svc: '🦶 Pedicure', status: 'confirmed',
    source: 'Online', start: '2026-07-20T14:30:00', end: '2026-07-20T15:30:00',
  }, catalog, '2026-07-27T00:00:00.000Z');
  assert.equal(record.startAt, '2026-07-20T14:30:00');
  assert.equal(record.endAt, '2026-07-20T15:30:00');
  assert.equal(record.technicianId, 't2');
  assert.equal(record.status, 'confirmed');
  assert.deepEqual(record.serviceIds, ['pedi']);
});

test('maps Booking Book status separately from SMS state', () => {
  assert.deepEqual(store.mapBookingStatus('new'), { status: 'pending', smsStatus: 'not-sent' });
  assert.deepEqual(store.mapBookingStatus('sms-sent'), { status: 'pending', smsStatus: 'sent' });
  assert.deepEqual(store.mapBookingStatus('done'), { status: 'completed', smsStatus: 'not-sent' });
  assert.deepEqual(store.mapBookingStatus('noshow'), { status: 'no-show', smsStatus: 'not-sent' });
});

test('ensureSource is idempotent and does not overwrite a user edit', () => {
  const target = storage();
  const first = store.ensureSource('booking-book-static-v1', [{
    id: 'booking-1', name: 'Mary', phone: '8325550100', services: ['Pedicure'],
    tech: 'Kim N.', date: '2026-07-09', time: '09:00', duration: 60, status: 'new',
  }], target, catalog, '2026-07-27T00:00:00.000Z');
  assert.equal(first.inserted, 1);
  const edited = store.update('booking-1', { customerName: 'Mary Updated' }, target, catalog, '2026-07-27T00:00:01.000Z');
  assert.equal(edited.ok, true);
  const second = store.ensureSource('booking-book-static-v1', [{
    id: 'booking-1', name: 'Mary', phone: '8325550100', services: ['Pedicure'],
    tech: 'Kim N.', date: '2026-07-09', time: '09:00', duration: 60, status: 'new',
  }], target, catalog, '2026-07-27T00:00:02.000Z');
  assert.equal(second.inserted, 0);
  assert.equal(store.loadAll(target, catalog)[0].customerName, 'Mary Updated');
});

test('conflict detection excludes the edited appointment and ignores unassigned records', () => {
  const records = [{ id: 'existing', technicianId: 't2', startAt: '2026-07-20T10:00:00', endAt: '2026-07-20T11:00:00' }];
  assert.equal(store.hasConflict(records, { technicianId: 't2', startAt: '2026-07-20T10:30:00', endAt: '2026-07-20T11:30:00' }), true);
  assert.equal(store.hasConflict(records, { technicianId: 't2', startAt: '2026-07-20T10:30:00', endAt: '2026-07-20T11:30:00' }, 'existing'), false);
  assert.equal(store.hasConflict(records, { technicianId: null, startAt: '2026-07-20T10:30:00', endAt: '2026-07-20T11:30:00' }), false);
});

test('cancel keeps the record and changes only its status', () => {
  const target = storage();
  store.upsert({ id: 'apt-1', name: 'Linh', phone: '8325550100', serviceIds: ['pedi'], techId: null,
    start: '2026-07-20T10:00:00', end: '2026-07-20T11:00:00', status: 'confirmed' }, target, catalog, '2026-07-27T00:00:00.000Z');
  const result = store.cancel('apt-1', target, catalog, '2026-07-27T00:00:01.000Z');
  assert.equal(result.ok, true);
  assert.equal(store.loadAll(target, catalog)[0].status, 'cancelled');
});
~~~

- [ ] **Step 2: Run the store tests to verify they fail**

Run: node --test html/assets/appointments-store.test.cjs

Expected: FAIL because html/assets/appointments-store.js does not exist.

- [ ] **Step 3: Implement storage-safe normalization and migration**

Use a UMD wrapper. Store an object, not a bare array, so migration markers and records are atomic:

~~~js
{
  version: 1,
  sources: { 'booking-book-static-v1': true, 'pos-seed-v1': true },
  records: []
}
~~~

normalizeAppointment must accept canonical fields and the existing Booking Book/POS fields. Resolve technician by techId, technicianId, tech, or technicianName; resolve services from serviceIds, services, or svc; retain unmatched names in serviceNames; calculate durationMin from explicit input before catalog fallback; preserve optional POS runtime fields such as eta under metadata.

Implement ensureSource so it inserts a source's missing IDs, sets the source marker, writes once, and returns { inserted, skipped, records }. A source marker must not prevent insertion of new IDs added later to a fixture; compare IDs on every call and only avoid overwriting existing records.

Use these status mappings:

~~~js
function mapBookingStatus(status) {
  if (status === 'sms-sent') return { status: 'pending', smsStatus: 'sent' };
  if (status === 'done') return { status: 'completed', smsStatus: 'not-sent' };
  if (status === 'noshow') return { status: 'no-show', smsStatus: 'not-sent' };
  return { status: status === 'confirmed' ? 'confirmed' : 'pending', smsStatus: 'not-sent' };
}
~~~

- [ ] **Step 4: Implement CRUD, conflict checks, and subscriptions**

Use this mutation flow:

~~~js
function update(id, patch, storage, catalog, now) {
  var state = readState(storage, catalog);
  var index = state.records.findIndex(function (record) { return String(record.id) === String(id); });
  if (index < 0) return { ok: false, error: { code: 'not-found', message: 'Appointment not found.' } };
  var candidate = normalizeAppointment(Object.assign({}, state.records[index], patch), catalog, now);
  if (hasConflict(state.records, candidate, id)) {
    return { ok: false, error: { code: 'technician-conflict', message: 'Technician already has an overlapping appointment.' } };
  }
  candidate.updatedAt = now || new Date().toISOString();
  state.records[index] = candidate;
  writeState(state, storage, catalog);
  notifySubscribers();
  return { ok: true, record: clone(candidate) };
}
~~~

create, upsert, and cancel must use the same normalization/conflict path. cancel patches status: 'cancelled' and leaves all other fields intact. subscribe(listener, windowObject) registers a storage listener for the appointment key and returns an unsubscribe function; it must not require a browser in Node tests.

- [ ] **Step 5: Add tests for malformed JSON, last-write-wins, and subscription cleanup**

Add tests that invalid JSON returns an empty record state, an older updatedAt cannot replace a newer record, and subscribe removes its event listener when the returned unsubscribe function is called.

- [ ] **Step 6: Run the store tests to verify they pass**

Run: node --test html/assets/salon-data.test.cjs html/assets/appointments-store.test.cjs

Expected: PASS for catalog and store tests.

- [ ] **Step 7: Commit the store**

~~~bash
git add html/assets/appointments-store.js html/assets/appointments-store.test.cjs
git commit -m "feat: add shared appointment store"
~~~

### Task 3: Make both pages load shared modules and add static contracts

**Files:**

- Create: html/pages/booking-book-phase-1.shared-appointments.test.mjs
- Modify: html/pages/booking-book-phase-1.html:9701-9705
- Modify: html/pages/pos-phase-1.html:747-754
- Modify: html/pages/pos-phase-1.appointments.test.cjs

**Interfaces:**

- Both pages expose window.NEXORA_SALON_DATA and window.NEXORA_APPOINTMENTS_STORE before their inline application scripts execute.
- Page tests consume HTML source text; runtime unit behavior remains in the asset tests.

- [ ] **Step 1: Add failing page contract assertions**

Add this assertion to the POS appointment test:

~~~js
test('appointments page loads shared salon catalog and appointment store', () => {
  assert.match(html, /\.\.\/assets\/salon-data\.js/);
  assert.match(html, /\.\.\/assets\/appointments-store\.js/);
  assert.match(html, /NEXORA_SALON_DATA/);
  assert.match(html, /NEXORA_APPOINTMENTS_STORE/);
});
~~~

Create booking-book-phase-1.shared-appointments.test.mjs with:

~~~js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');

test('Booking Book loads shared catalog and appointment store before its runtime', () => {
  assert.match(SOURCE, /\.\.\/assets\/salon-data\.js/);
  assert.match(SOURCE, /\.\.\/assets\/appointments-store\.js/);
  assert.match(SOURCE, /NEXORA_SALON_DATA/);
  assert.match(SOURCE, /NEXORA_APPOINTMENTS_STORE/);
});

test('Booking Book loads the shared catalog module', () => {
  assert.match(SOURCE, /salon-data\.js/);
});
~~~

- [ ] **Step 2: Run the page contract tests to verify they fail**

Run: node --test html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs

Expected: FAIL because the shared script tags are not implemented.

- [ ] **Step 3: Add script tags in dependency order**

In POS, use:

~~~html
<script src="../assets/salon-data.js"></script>
<script src="../assets/appointments-store.js"></script>
<script src="../assets/pos-appointments-data.js"></script>
~~~

Insert the same two shared scripts before the DayPilot script in Booking Book's bottom external asset block. Do not move or remove DayPilot, Lucide, Flatpickr, SweetAlert2, or the shell script.

- [ ] **Step 4: Keep duplicate declarations temporarily isolated to the pages that still use them**

Do not delete the old catalog declarations in this wiring task. Tasks 4 and 5 remove them together with the runtime code that consumes them, so each page remains runnable at the end of this task. Keep function names only when they remain compatibility adapters backed by the shared catalog.

- [ ] **Step 5: Run the page script-loading tests**

Run: node --test html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs

Expected: PASS for script ordering and shared global assertions; duplicate-authority assertions are added in Tasks 4 and 5.

- [ ] **Step 6: Commit the page wiring**

~~~bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.shared-appointments.test.mjs html/pages/pos-phase-1.html html/pages/pos-phase-1.appointments.test.cjs
git commit -m "chore: load shared salon appointment modules"
~~~

### Task 4: Convert POS to the shared catalog and store

**Files:**

- Modify: html/pages/pos-phase-1.html:785-825,2182-2535,2806-2845
- Modify: html/assets/pos-appointments-data.js:50-116
- Modify: html/assets/pos-appointments-data.test.cjs
- Modify: html/pages/pos-phase-1.appointments.test.cjs

**Interfaces:**

- Consumes salonData.loadCatalog(), store.loadAll(), store.ensureSource(), store.create(), store.update(), store.cancel(), store.subscribe(), and appointmentData.createSeedBookings().
- Produces a local BOOKINGS view-model snapshot for existing dispatch code and canonical store writes for all appointment mutations.

- [ ] **Step 1: Add failing POS migration and mutation contracts**

Add source assertions:

~~~js
test('POS migrates seed data into the shared appointment store', () => {
  assert.match(html, /ensureSource\(['"]pos-seed-v1/);
  assert.match(html, /createMigrationSeed\(/);
  assert.match(html, /appointmentStore\.(create|upsert|update)|store\.(create|upsert|update)/);
  assert.match(html, /appointmentStore\.cancel|store\.cancel/);
  assert.match(html, /appointmentStore\.subscribe|store\.subscribe/);
  assert.match(html, /status:\s*['"]cancelled['"]/);
});
~~~

Add a fixture export test:

~~~js
test('seed module exposes a migration fixture provider', () => {
  const fixture = require('./pos-appointments-data.js');
  assert.equal(typeof fixture.createSeedBookings, 'function');
  assert.equal(typeof fixture.createMigrationSeed, 'function');
});

test('POS has no independent technician or service catalog literals', () => {
  assert.doesNotMatch(html, /var TECHS = \[/);
  assert.doesNotMatch(html, /var MENU = \[/);
});
~~~

- [ ] **Step 2: Run POS tests to verify the new contracts fail**

Run: node --test html/assets/pos-appointments-data.test.cjs html/pages/pos-phase-1.appointments.test.cjs

Expected: FAIL because the migration provider and store-backed calls do not exist.

- [ ] **Step 3: Add the explicit seed migration provider**

In pos-appointments-data.js, add:

~~~js
function createMigrationSeed(anchorDate) {
  return createSeedBookings(anchorDate).map(function (booking) {
    return Object.assign({}, booking, { migrationSource: 'pos-seed-v1' });
  });
}
~~~

Export createMigrationSeed while keeping createSeedBookings, formatLocalDateTime, and hasTechConflict unchanged for existing tests.

- [ ] **Step 4: Derive POS technicians and services from the catalog**

Replace the inline TECHS authority with:

~~~js
var salonData = window.NEXORA_SALON_DATA;
var catalog = salonData.loadCatalog();
var TECHS = catalog.technicians.filter(function (tech) { return tech.active; }).map(function (tech) {
  return Object.assign({ bnum: null, turns: 0, comm: 0, guar: 0, payModel: 'max', baoSplit: 0, vlink: null }, tech.posProfile || {}, {
    id: tech.id,
    name: tech.name,
    skills: tech.skills || [],
    exp: tech.exp || [],
    fit: tech.fit || []
  });
});
var MENU = catalog.services.filter(function (service) { return service.active; }).map(function (service) {
  return { id: service.id, label: service.name, icon: service.icon || '✨' };
});
~~~

Update SVC_REQ to use service.requiredSkill || '' while keeping the existing POS fallback for kid and addon.

- [ ] **Step 5: Migrate the seed and create a POS view model**

Replace the runtime seed assignment with:

~~~js
var appointmentStore = window.NEXORA_APPOINTMENTS_STORE;
var BOOKINGS = [];

function posBookingView(record) {
  var start = new Date(record.startAt);
  return Object.assign({}, record, {
    start: record.startAt,
    end: record.endAt,
    name: record.customerName,
    phone: record.phone,
    techId: record.technicianId,
    svc: (record.serviceNames || []).join(' + '),
    time: apClock(start),
    day: apRelativeDay(record.startAt),
    eta: record.metadata && record.metadata.eta ? record.metadata.eta : null
  });
}

function reloadAppointmentSnapshot() {
  BOOKINGS = appointmentStore.loadAll(null, catalog).map(posBookingView);
}

appointmentStore.ensureSource(
  'pos-seed-v1',
  appointmentData.createMigrationSeed(new Date()),
  null,
  catalog
);
reloadAppointmentSnapshot();
~~~

Keep BOOKINGS as a derived compatibility snapshot for dispatch functions. Do not mutate it as authority; after every write call reloadAppointmentSnapshot(), then renderAppt() and/or renderFloor().

- [ ] **Step 6: Route POS appointment actions through the store**

Update these existing handlers:

- apApplyDayPilotMove → appointmentStore.update(booking.id, { technicianId, startAt, endAt, durationMin }, null, catalog), then reload and render; show the existing warning toast on failure.
- data-ap-save handler → appointmentStore.create() for a new record or appointmentStore.update() for apSel, passing customerName, phone, serviceIds, serviceNames, technicianId, startAt, endAt, status, and source: 'front-desk'.
- data-ap-del handler → appointmentStore.cancel(apSel, null, catalog) and show the existing cancelled toast without splicing BOOKINGS.
- ETA changes in the dispatch handler → update metadata.eta through appointmentStore.update() rather than mutating BOOKINGS[index].eta directly.

Preserve apOpenEdit, apEvent, resource filtering, and dispatch rendering by reading the derived view model. When an imported service is not in MENU, render its serviceNames as a non-destructive external chip and preserve it on save.

- [ ] **Step 7: Subscribe POS to catalog and appointment changes**

Register one appointment subscription after the initial catalog/BOOKINGS setup:

~~~js
var unsubscribeAppointments = appointmentStore.subscribe(function () {
  catalog = salonData.loadCatalog();
  reloadAppointmentSnapshot();
  renderAppt();
  renderFloor();
}, window);
~~~

Use a catalog-specific subscription or the same storage listener to reload TECHS, MENU, and appointment resource columns when the salon-data key changes. Do not register duplicate listeners on tab activation.

- [ ] **Step 8: Run focused POS tests**

Run: node --test html/assets/pos-appointments-data.test.cjs html/assets/appointments-store.test.cjs html/pages/pos-phase-1.appointments.test.cjs

Expected: PASS, including existing DayPilot/resource/selection contracts and new store migration/mutation contracts.

- [ ] **Step 9: Commit POS integration**

~~~bash
git add html/pages/pos-phase-1.html html/assets/pos-appointments-data.js html/assets/pos-appointments-data.test.cjs html/pages/pos-phase-1.appointments.test.cjs
git commit -m "feat: connect POS appointments to shared salon data"
~~~

### Task 5: Convert Booking Book rows, calendar, and status actions to the shared store

**Files:**

- Modify: html/pages/booking-book-phase-1.html:9707-10360,10464-10626,11590-11705
- Modify: html/pages/booking-book-phase-1.shared-appointments.test.mjs

**Interfaces:**

- Consumes salonData.loadCatalog() and all appointment-store APIs from Tasks 1–2.
- Produces bookingRecordFromItem(item), bookingRecordToRowData(record), renderBookingStoreRows(), and store-backed saveBookingFromCalendar()/setBookingStatus() behavior.

- [ ] **Step 1: Add failing Booking Book runtime contracts**

Add assertions:

~~~js
test('Booking Book imports static rows and renders from the shared store', () => {
  assert.match(SOURCE, /ensureSource\(['"]booking-book-static-v1/);
  assert.match(SOURCE, /loadAll\(/);
  assert.match(SOURCE, /renderBookingStoreRows/);
  assert.match(SOURCE, /appointmentStore\.(create|upsert|update)|store\.(create|upsert|update)/);
  assert.match(SOURCE, /appointmentStore\.subscribe|store\.subscribe/);
});

test('Booking Book does not append new appointments directly to the table', () => {
  assert.doesNotMatch(SOURCE, /tbody\.insertAdjacentHTML\(['"]beforeend['"]/);
});

test('Booking Book has no independent calendar catalog literals', () => {
  assert.doesNotMatch(SOURCE, /var BOOKING_CALENDAR_SERVICE_OPTIONS = \[/);
  assert.doesNotMatch(SOURCE, /var BOOKING_CALENDAR_TECHNICIANS = \[/);
});
~~~

- [ ] **Step 2: Run the Booking Book contracts to verify they fail**

Run: node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs

Expected: FAIL because the page still reads static rows and appends new rows directly.

- [ ] **Step 3: Add row-to-record and record-to-row adapters**

Implement a one-time parser before clearing the table:

~~~js
function bookingRecordFromItem(item) {
  var services = Array.from(item.querySelectorAll('.booking-service-chip')).map(function (chip) {
    return chip.textContent.trim();
  }).filter(Boolean);
  var time = item.querySelector('.booking-time-main:not(.booking-callstart-main)');
  return {
    id: item.dataset.bookingId,
    name: item.dataset.bookingName,
    phone: item.dataset.bookingPhone,
    email: item.dataset.bookingEmail,
    services: services.length ? services : [item.dataset.bookingService],
    tech: item.dataset.bookingTech,
    date: item.dataset.bookingDate,
    time: time ? parseBookingCalendarTime(time.textContent) : '09:00',
    duration: Number(item.dataset.bookingDuration || bookingCalendarDurationMinutes(item)),
    status: statusKeyFromItem(item),
    note: item.dataset.bookingNote || '',
    source: 'booking-book'
  };
}
~~~

Define the two parsing helpers used above next to the existing date helpers:

~~~js
function parseBookingCalendarTime(label) {
  var match = String(label || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return '09:00';
  var hour = Number(match[1]) % 12;
  if (String(match[3]).toUpperCase() === 'PM') hour += 12;
  return String(hour).padStart(2, '0') + ':' + match[2];
}

function statusKeyFromItem(item) {
  if (item.classList.contains('is-sms-sent')) return 'sms-sent';
  if (item.classList.contains('is-done')) return 'done';
  if (item.classList.contains('is-noshow')) return 'noshow';
  return 'new';
}
~~~

bookingRecordToRowData(record) must map canonical fields back to createBookingTableRow() input. Convert canonical technician ID/name through the shared catalog and display Unassigned only for a null technician ID. Preserve record.serviceNames when service IDs are empty.

- [ ] **Step 4: Import existing rows once and render them from store**

At Booking Book boot, before the first filterBookingItems() call:

~~~js
var salonData = window.NEXORA_SALON_DATA;
var appointmentStore = window.NEXORA_APPOINTMENTS_STORE;
var catalog = salonData.loadCatalog();
var initialRows = Array.from(document.querySelectorAll('[data-booking-item]'));

appointmentStore.ensureSource(
  'booking-book-static-v1',
  initialRows.map(bookingRecordFromItem),
  null,
  catalog
);

function renderBookingStoreRows() {
  var tbody = document.querySelector('[data-booking-table] tbody');
  if (!tbody) return;
  var records = appointmentStore.loadAll(null, catalog);
  tbody.innerHTML = records.map(function (record) {
    return createBookingTableRow(bookingRecordToRowData(record));
  }).join('');
  tbody.querySelectorAll('[data-booking-item]').forEach(function (item) {
    var actions = item.querySelector('.booking-actions');
    if (actions) actions.innerHTML = renderBookingActionButtons(item);
  });
}
~~~

Call renderBookingStoreRows() before initBookingViewMode() and before filtering. The original HTML rows remain only as migration fixtures; no later render reads them as authority.

- [ ] **Step 5: Replace Booking Book catalog arrays with catalog-derived options**

Use catalog.services.filter(service => service.active) in populateBookingCreateForm(), bookingServiceDurationMinutes(), and bookingServicePriceTotal(). Use catalog.technicians.filter(tech => tech.active) in bookingCalendarColumns() and the create form. Resolve technician names by ID/alias through salonData.findTechnician().

Keep bookingCalendarDurationMinutes(item) precedence as explicit row duration, shared catalog duration, then 60 minutes. This keeps imported composite durations stable and uses the shared catalog for new bookings.

- [ ] **Step 6: Route create and status actions through the store**

Replace the direct tbody.insertAdjacentHTML() block in saveBookingFromCalendar() with:

~~~js
var result = appointmentStore.create({
  id: 'booking-frontdesk-' + Date.now(),
  name: name,
  phone: phone,
  services: services,
  tech: tech,
  date: date,
  time: time,
  duration: duration,
  status: status,
  note: note,
  source: 'booking-book'
}, null, catalog);

if (!result.ok) {
  setBookingCreateError(result.error.message);
  return;
}

renderBookingStoreRows();
filterBookingItems();
renderBookingCalendar();
~~~

Update setBookingStatus(item, status) to call appointmentStore.update(item.dataset.bookingId, appointmentStore.mapBookingStatus(status), null, catalog) and rerender only after success. sendBookingSms() must update smsStatus: 'sent' without changing a confirmed/checked-in status. Add a canonical-to-Booking Book display mapper for cancelled.

- [ ] **Step 7: Subscribe Booking Book to store and catalog changes**

Register one appointment subscription after initial boot:

~~~js
appointmentStore.subscribe(function () {
  catalog = salonData.loadCatalog();
  renderBookingStoreRows();
  filterBookingItems();
  renderBookingCalendar();
  renderBookingCards();
}, window);
~~~

Reload service/technician controls when the catalog key changes. Do not call initBookingCalendar() repeatedly if bookingTeamCalendar already exists.

- [ ] **Step 8: Run Booking Book tests and parse every inline script**

Run:

~~~bash
node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs html/assets/salon-data.test.cjs html/assets/appointments-store.test.cjs
node -e "const fs=require('fs'),vm=require('vm'); const html=fs.readFileSync('html/pages/booking-book-phase-1.html','utf8'); for (const [i,m] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) if (m[1].trim()) new vm.Script(m[1], {filename:'booking-inline-'+i+'.js'}); console.log('inline scripts parse')"
~~~

Expected: PASS and no inline JavaScript syntax error.

- [ ] **Step 9: Commit Booking Book integration**

~~~bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.shared-appointments.test.mjs
git commit -m "feat: connect Booking Book to shared appointments"
~~~

### Task 6: Persist technician roster changes and refresh catalog consumers

**Files:**

- Modify: html/pages/booking-book-phase-1.html:10880-11055
- Modify: html/assets/salon-data.test.cjs
- Modify: html/pages/booking-book-phase-1.shared-appointments.test.mjs
- Modify: html/pages/pos-phase-1.html:798-825,2182-2275

**Interfaces:**

- Consumes salonData.loadCatalog() and salonData.saveCatalog().
- Produces a single persisted technician roster used by Booking Book selectors, Booking Book team cards, POS selectors, POS resource columns, and POS management cards.

- [ ] **Step 1: Add failing catalog-update contracts**

~~~js
test('technician save writes through the salon catalog API', () => {
  assert.match(SOURCE, /saveCatalog\(/);
  assert.match(SOURCE, /data-tech-modal-save/);
});

test('POS derives appointment resources from the shared active roster', () => {
  assert.match(html, /catalog\.technicians/);
  assert.doesNotMatch(html, /var TECHS = \[/);
});
~~~

- [ ] **Step 2: Run focused contracts to verify they fail**

Run: node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs html/pages/pos-phase-1.appointments.test.cjs

Expected: FAIL because the technician modal still changes page-local state and POS still has the inline roster.

- [ ] **Step 3: Route saveTechModal() through the catalog**

Preserve the existing form validation and write the normalized technician record:

~~~js
var nextCatalog = salonData.loadCatalog();
var existing = salonData.findTechnician(nextCatalog, data.id);
var nextTechnicians = nextCatalog.technicians.filter(function (tech) { return tech.id !== data.id; });
nextTechnicians.push(Object.assign({}, existing || {}, data, { active: data.active !== false }));
salonData.saveCatalog(Object.assign({}, nextCatalog, { technicians: nextTechnicians }));
catalog = salonData.loadCatalog();
renderBookingStoreRows();
filterBookingItems();
~~~

Keep the existing technician modal UI and copy. Do not create a second storage key for technician profiles.

- [ ] **Step 4: Make POS refresh technician/service selectors from catalog changes**

Extract buildPosCatalogViews() from the current initialization. On a catalog storage event, rebuild TECHS, MENU, SVC_REQ, appointment filter options, resource columns, and appointment form chips before calling renderAppt() and renderFloor().

- [ ] **Step 5: Add catalog save/load tests**

Test that a saved t8 technician appears in findTechnician, survives loadCatalog, and is returned by the POS resource-column builder after a catalog refresh. Test that an inactive technician is excluded from new appointment choices but remains resolvable for historical records.

- [ ] **Step 6: Run focused catalog/page tests**

Run: node --test html/assets/salon-data.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs html/pages/pos-phase-1.appointments.test.cjs

Expected: PASS.

- [ ] **Step 7: Commit catalog consumer refresh**

~~~bash
git add html/pages/booking-book-phase-1.html html/pages/pos-phase-1.html html/assets/salon-data.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs html/pages/pos-phase-1.appointments.test.cjs
git commit -m "feat: persist shared technician roster"
~~~

### Task 7: Add cross-page regression tests and complete error handling

**Files:**

- Modify: html/assets/appointments-store.test.cjs
- Modify: html/assets/salon-data.test.cjs
- Modify: html/pages/booking-book-phase-1.shared-appointments.test.mjs
- Modify: html/pages/pos-phase-1.appointments.test.cjs
- Modify: html/pages/booking-book-phase-1.html
- Modify: html/pages/pos-phase-1.html

**Interfaces:**

- Consumes the completed catalog/store/page integrations.
- Produces automated coverage for the acceptance criteria and user-visible fallback behavior.

- [ ] **Step 1: Add failing cross-page contract assertions**

Add assertions that both pages use the exact salon-scoped storage keys, subscribe to storage updates, retain unknown service names, and use cancelled instead of array removal:

~~~js
const KEY = 'bitcoin-nail-bar-houston';
assert.match(SOURCE, new RegExp('nexora:appointments:v1:' + KEY));
assert.match(SOURCE, /storage/);
assert.match(SOURCE, /serviceNames/);
assert.match(SOURCE, /cancelled/);
~~~

- [ ] **Step 2: Run the full focused test set to verify new assertions fail where behavior is missing**

Run: node --test html/assets/salon-data.test.cjs html/assets/appointments-store.test.cjs html/assets/pos-appointments-data.test.cjs html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs

Expected: FAIL only for missing assertions/behaviors added in this task.

- [ ] **Step 3: Implement safe storage fallback and user-visible warning**

Guard localStorage access in both pages. If access throws, keep the store's memory adapter active and call the existing page toast/banner function with: Local changes are available in this tab; cross-tab sync is unavailable. Do not prevent appointment creation when persistence is unavailable.

- [ ] **Step 4: Add unknown-record rendering guards**

In both page renderers, use empty strings and fallback labels for missing customer/service/technician fields, preserve serviceNames and technicianName, and route every dynamic value through the existing esc/escapeHtml helper before assigning innerHTML.

- [ ] **Step 5: Add two-tab storage-event simulation tests**

Use a fake window with addEventListener/removeEventListener and dispatch a storage event whose key is the appointment key. Assert the subscribed listener is called once, ignores unrelated keys, and stops after unsubscribe.

- [ ] **Step 6: Run all asset and page tests**

Run:

~~~bash
node --test html/assets/salon-data.test.cjs html/assets/appointments-store.test.cjs html/assets/pos-appointments-data.test.cjs html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
~~~

Expected: PASS with no skipped tests.

- [ ] **Step 7: Commit regression and fallback coverage**

~~~bash
git add html/assets/salon-data.test.cjs html/assets/appointments-store.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.html html/pages/pos-phase-1.html
git commit -m "test: cover shared appointment synchronization"
~~~

### Task 8: Full verification and implementation handoff

**Files:**

- Verify: html/assets/salon-data.js
- Verify: html/assets/appointments-store.js
- Verify: html/assets/pos-appointments-data.js
- Verify: html/pages/booking-book-phase-1.html
- Verify: html/pages/pos-phase-1.html
- Verify: all new and modified test files

**Interfaces:**

- Consumes all completed tasks.
- Produces a verified implementation handoff with test output and a manual browser checklist.

- [ ] **Step 1: Run the complete Node test suite for touched modules**

Run:

~~~bash
node --test html/assets/salon-data.test.cjs html/assets/appointments-store.test.cjs html/assets/pos-appointments-data.test.cjs html/pages/pos-phase-1.appointments.test.cjs html/pages/booking-book-phase-1.shared-appointments.test.mjs
~~~

Expected: PASS for every test.

- [ ] **Step 2: Parse changed inline scripts**

Run:

~~~bash
node -e "const fs=require('fs'),vm=require('vm'); for (const file of ['html/pages/booking-book-phase-1.html','html/pages/pos-phase-1.html']) { const html=fs.readFileSync(file,'utf8'); for (const [i,m] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) if (m[1].trim()) new vm.Script(m[1], {filename:file+'#'+i}); } console.log('changed inline scripts parse')"
~~~

Expected: changed inline scripts parse with exit code 0.

- [ ] **Step 3: Run repository-level static checks**

Run:

~~~bash
git diff --check
rg -n "var BOOKING_CALENDAR_SERVICE_OPTIONS = \[|var BOOKING_CALENDAR_TECHNICIANS = \[|var TECHS = \[|var MENU = \[" html/pages/booking-book-phase-1.html html/pages/pos-phase-1.html
~~~

Expected: the first command is silent; the second command returns no duplicate catalog authority declarations.

- [ ] **Step 4: Perform the browser smoke test**

Serve the workspace with the repository's existing local server command and open both pages in separate tabs. Verify:

1. Open Booking Book first: all six static Booking Book rows migrate once, and the calendar/table still render.
2. Open POS: POS seed records are added without duplicating Booking Book records.
3. Create a booking in Booking Book; switch to POS and confirm the customer, service, technician, local start/end, and status appear.
4. Drag or resize that appointment in POS; return to Booking Book and confirm the time/technician changed.
5. Mark the appointment SMS Sent, Completed, and No-show from Booking Book; confirm POS sees the corresponding canonical status/SMS state.
6. Cancel it from POS; confirm both pages keep the record with Cancelled state after reload.
7. Save a technician change in Booking Book; confirm both pages' technician selectors and resource columns update.
8. Test a 390px viewport and a desktop viewport; confirm the existing responsive layout and no console error.

- [ ] **Step 5: Commit verification-only fixes if needed and report final results**

If verification reveals a defect, fix it in the smallest affected task file, rerun that task's focused tests and the complete suite, then commit with a message naming the defect. If all checks pass, record the exact commands and browser smoke results in the final handoff.
