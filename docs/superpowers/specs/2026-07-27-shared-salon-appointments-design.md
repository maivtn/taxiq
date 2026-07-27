# Shared Salon Catalog and Two-Way Appointments Design

**Date:** 2026-07-27  
**Status:** Approved for implementation planning

## Goal

Make `html/pages/booking-book-phase-1.html` and `html/pages/pos-phase-1.html` use one shared salon catalog and one shared appointment dataset. A booking created or updated in either screen must appear with the same customer, service, technician, time, and status in the other screen.

## Scope

This work covers:

- A shared, salon-scoped service catalog.
- A shared technician roster for Bitcoin Nail Bar in Houston.
- A canonical appointment store persisted in `localStorage`.
- Two-way synchronization between Booking Book and POS in separate tabs.
- One-time migration of the current Booking Book HTML rows and POS seed appointments.
- Tests for catalog normalization, appointment normalization, migration idempotency, mapping, conflict validation, and cross-page contracts.

This work does not add a backend, authentication, multi-salon administration, server-side conflict locking, or real SMS delivery.

## Current State

The two screens currently have separate data models:

- Booking Book keeps appointments as static table rows with `data-booking-*` attributes. Its calendar derives events from those rows, and new rows are appended to the table.
- POS loads seed records from `html/assets/pos-appointments-data.js` into an in-memory `BOOKINGS` array. Its appointment calendar and dispatch board read that array.
- Booking Book and POS use different status names, technician identifiers/names, service names, and date defaults.
- The existing POS `MENU` and `TECHS` arrays and Booking Book calendar service/technician arrays duplicate salon data.

## Architecture

### Shared salon catalog

Create `html/assets/salon-data.js`. It exposes a UMD-compatible API for browser pages and Node tests through `window.NEXORA_SALON_DATA` and `module.exports`.

The catalog is scoped to one salon:

```js
{
  salon: {
    id: 'bitcoin-nail-bar-houston',
    name: 'Bitcoin Nail Bar',
    location: 'Houston, TX'
  },
  services: [
    {
      id: 'pedi',
      name: 'Pedicure',
      aliases: ['Classic Pedicure'],
      price: 30,
      durationMin: 60,
      requiredSkill: 'Pedicure',
      active: true
    }
  ],
  technicians: [
    {
      id: 't1',
      name: 'Tina',
      aliases: [],
      active: true,
      skills: ['Pedicure', 'Manicure', 'Gel', 'Dip', 'Acrylic', 'Design'],
      posProfile: { bnum: 1, turns: 3, comm: 0.60, guar: 1000, payModel: 'max', baoSplit: 0.60, vlink: 'VL-20481' }
    }
  ]
}
```

The full default catalog moves the current service values from Booking Book and POS into one list. Existing POS IDs remain stable (`pedi`, `mani`, `full`, `fill`, `dip`, `gel`, `wax`, `addon`) so existing seed records do not require ID rewriting. Booking Book names become aliases or composite service labels instead of separate duplicate catalog entries. The catalog includes the current Booking Book-only `Eyelash` service and the current POS-only `Kid's Menu` entry; fields without a current source value remain `null` and use the existing duration fallback only when a new appointment requires one.

The default technician roster contains the current people from both screens exactly once:

- `t1` Tina
- `t2` Kim, alias `Kim N.`
- `t3` Helen
- `t4` Andy
- `t5` Vy
- `t6` Lan T.
- `t7` Linda
- `t8` Mai P.

The current POS payroll and skill fields move into each technician's `posProfile`/shared skill fields. Technicians that do not yet have POS payroll data retain `null` profile values but remain schedulable in the shared roster.

`salon-data.js` provides pure helpers to clone, normalize, find by ID or alias, and load/save the salon catalog. The default catalog is the fallback. Catalog overrides are stored under:

```text
nexora:salon-data:v1:bitcoin-nail-bar-houston
```

Booking Book's Add Technician flow and any existing technician edits write through this catalog API, so both pages see the same roster after a catalog change. Service editing is not expanded beyond the current UI; all service selectors read the shared catalog.

### Canonical appointment store

Create `html/assets/appointments-store.js`. It consumes `NEXORA_SALON_DATA` and exposes browser/Node-compatible functions:

```js
loadAll(storage, catalog)
ensureSource(sourceKey, records, storage, catalog)
create(record, storage, catalog)
update(id, patch, storage, catalog)
upsert(record, storage, catalog)
cancel(id, storage, catalog)
hasConflict(records, candidate, excludeId)
subscribe(listener, windowObject)
```

Appointments are persisted under:

```text
nexora:appointments:v1:bitcoin-nail-bar-houston
```

The canonical shape is:

```js
{
  id: 'booking-kim-phan',
  salonId: 'bitcoin-nail-bar-houston',
  customerName: 'Kim Phan',
  phone: '7135550148',
  email: 'kim.phan@example.com',
  serviceIds: ['pedi'],
  serviceNames: ['Pedicure Gel Polish'],
  technicianId: 't6',
  technicianName: 'Lan T.',
  startAt: '2026-07-09T09:00:00',
  endAt: '2026-07-09T10:15:00',
  durationMin: 75,
  status: 'pending',
  smsStatus: 'not-sent',
  source: 'booking-book',
  note: 'Prefers warm water and extra heel care.',
  createdAt: '2026-07-27T00:00:00.000Z',
  updatedAt: '2026-07-27T00:00:00.000Z'
}
```

Canonical statuses are `pending`, `confirmed`, `checked-in`, `completed`, `no-show`, and `cancelled`. SMS delivery state is independent: `smsStatus` is `not-sent` or `sent`. This preserves Booking Book's current `SMS Sent` display without incorrectly treating SMS delivery as appointment confirmation.

The store normalizes local date/time strings without converting them through UTC. It validates required customer name, phone, at least one service, valid start/end, and a non-negative duration. It rejects an overlapping appointment for the same non-null technician, excluding the record currently being edited. `cancel()` uses a soft-cancel status and retains the record for history.

Writes use `updatedAt`. If two tabs write the same ID, the record with the later `updatedAt` wins. A successful write immediately calls listeners in the current tab and triggers the browser `storage` event for other tabs. `BroadcastChannel` is not required for the first implementation.

## Migration and Mapping

### Booking Book migration

On first load, Booking Book parses every existing `[data-booking-item]` row into the canonical shape. It reads customer, phone, email, date, time, duration, service labels, technician name, note, and status from the row's data attributes and child elements.

It imports these records with source key `booking-book-static-v1`. The migration is idempotent: it inserts only IDs missing from the canonical store and does not overwrite records already changed by the user. After import, the table, cards, KPI counters, filters, and calendar render from the store rather than treating the original static rows as authority.

New calendar appointments use the shared catalog for service choices and technician choices, then call `create()` instead of appending directly to the table.

Booking Book status mapping:

```text
new      -> status: pending,  smsStatus: not-sent
sms-sent -> status: pending,  smsStatus: sent
done     -> status: completed
noshow   -> status: no-show
```

The Booking Book UI adds a `Cancelled` presentation for canonical cancelled records and continues to show the existing labels for other statuses.

### POS migration

POS calls `createSeedBookings()` from `html/assets/pos-appointments-data.js`, normalizes those records, and imports them with source key `pos-seed-v1`. The seed generator remains a fixture provider only; it is no longer the runtime source of appointment state.

POS replaces its runtime `BOOKINGS` array with a snapshot loaded from the shared store. Existing dispatch, ETA, appointment calendar, filter, detail, and summary functions continue to consume that snapshot, which is refreshed after every store write and storage event.

POS status mapping is direct for `pending`, `confirmed`, `checked-in`, `completed`, and `no-show`. The POS cancel action changes the canonical status to `cancelled` rather than removing the array item.

### Technician mapping

The shared catalog resolves technician IDs by canonical ID first, then by case-insensitive name or alias. Therefore `Kim N.` maps to `t2`; `Tina`, `Helen`, `Andy`, and `Vy` map to their existing POS IDs. `Lan T.`, `Linda`, and `Mai P.` use `t6`, `t7`, and `t8`, so they remain assigned when shown in POS.

POS appointment resource columns are generated from the shared active technician roster, not only the old five-entry POS array. `unassigned` remains a separate resource for an explicit null technician ID.

### Service mapping

The store keeps both `serviceIds` and `serviceNames`. Known POS IDs are preserved. Booking Book labels are resolved against canonical names and aliases when possible. Composite or unmatched labels remain in `serviceNames` and retain their source duration. POS edit rendering shows unmatched names as non-destructive external chips instead of silently replacing them with another service.

## Page Integration

Both pages load scripts in this order:

```html
<script src="../assets/salon-data.js"></script>
<script src="../assets/appointments-store.js"></script>
```

`booking-book-phase-1.html` will:

- replace inline service and technician arrays with catalog selectors;
- initialize from the shared store;
- write create/status/catalog actions through the shared APIs;
- refresh table, cards, calendar, filters, counters, and detail panels from store snapshots;
- subscribe to catalog and appointment changes.

`pos-phase-1.html` will:

- replace inline `MENU` and `TECHS` authorities with catalog-derived data;
- preserve POS-specific rendering and payroll fields through `posProfile`;
- initialize/migrate from the shared store;
- write create/edit/move/resize/cancel actions through the shared APIs;
- generate appointment resources and service chips from the shared catalog;
- refresh dispatch and appointment UI after local or cross-tab changes.

The shared catalog and appointment store are loaded before page scripts that call `MENU`, `TECHS`, `BOOKINGS`, or appointment helpers.

## Error Handling

- If localStorage is unavailable, the store falls back to an in-memory snapshot for the current tab and surfaces a non-blocking warning that cross-tab persistence is unavailable.
- If stored JSON is invalid, the store discards only the invalid payload, restores the default catalog or empty appointment list, and logs a diagnostic message.
- Invalid individual records are skipped with a diagnostic; one malformed record cannot prevent the page from booting.
- Unknown service or technician references remain visible by name and never cause a render exception.
- A conflict returns a structured validation error so each page can show its existing warning/toast style.
- All DOM renderers continue to escape customer, service, technician, and note values.

## Testing Strategy

Create `html/assets/salon-data.test.cjs` for:

- the one-salon ID and default catalog shape;
- unique service and technician IDs;
- alias resolution, especially `Kim N.` → `t2`;
- service duration/price lookup and unknown-label preservation;
- catalog save/load fallback behavior.

Create `html/assets/appointments-store.test.cjs` for:

- canonical record normalization;
- local date/time preservation;
- `ensureSource()` idempotency and source migration markers;
- upsert/update/cancel behavior;
- status and SMS mapping;
- technician conflict detection and edit exclusion;
- last-write-wins handling;
- malformed storage fallback.

Update `html/pages/pos-phase-1.appointments.test.cjs` to assert shared script loading, catalog-driven technicians/services, store-backed mutations, soft cancellation, and removal of the old runtime seed authority.

Create `html/pages/booking-book-phase-1.shared-appointments.test.mjs` to assert shared script loading, absence of independent calendar service/technician authorities, store migration hooks, store-backed create/status actions, and storage-event refresh hooks.

Run the existing POS appointment/data tests and the new tests with Node's built-in test runner. Manually verify two browser tabs at desktop and mobile widths: create in Booking Book → appears in POS; move in POS → changes in Booking Book; status changes and cancellation stay consistent after reload.

## Acceptance Criteria

1. Both pages show the same appointment records after either page creates or edits one.
2. Reloading either page preserves appointments, catalog changes, and cancellation state for the salon.
3. The two pages use one service catalog and one technician roster; no duplicate runtime lists remain authoritative.
4. Existing demo records from both pages are imported exactly once.
5. Technician and service conflicts are validated consistently.
6. Existing appointment calendar, table/card views, POS dispatch, filters, status actions, and responsive layouts continue to work.
7. Automated tests cover shared catalog, store behavior, migration idempotency, mapping, and page contracts.
