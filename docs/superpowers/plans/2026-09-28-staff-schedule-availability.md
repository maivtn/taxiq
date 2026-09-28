# Staff Schedule & Booking Availability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng lịch làm việc toàn đội cho Owner/Manager trong Salon Settings, hiển thị coverage/conflict tại Front Desk và nâng cấp My Calendar để Staff xem lịch cá nhân và gửi Day-off Request.

**Architecture:** Một UMD store mới là nguồn dữ liệu dùng chung cho published schedule, draft, exception, permission và request, tương tự các store prototype hiện có. Salon Settings sở hữu thao tác quản trị; My Calendar chỉ đọc lịch của Staff đăng nhập và tạo request; Front Desk chỉ đọc availability/conflict để hỗ trợ vận hành. Appointment tiếp tục lấy từ `NEXORA_APPOINTMENTS_STORE`, còn hồ sơ/kỹ năng Staff tiếp tục lấy từ `NEXORA_SALON_DATA`.

**Tech Stack:** HTML5, CSS, JavaScript UMD/IIFE, LocalStorage, JSDOM, Node.js test runner, Lucide.

**Spec:** `docs/superpowers/specs/2026-09-28-staff-schedule-availability-design.md`

## Global Constraints

- Không tạo appointment model thứ hai; mọi Booking Impact phải đọc từ `NEXORA_APPOINTMENTS_STORE`.
- Staff chỉ xem dữ liệu cá nhân tại salon đang chọn, không được render lịch của Staff khác.
- Draft không thay đổi Booking Availability hoặc My Calendar trước khi publish.
- Appointment hiện có không được tự động hủy, đổi giờ hoặc đổi Staff.
- Day-off Request mặc định cần Owner/Manager duyệt; Reject hoặc Cancel không thay đổi lịch.
- Select/dropdown phải có arrow cách mép phải 16px, icon rộng 16px và padding phải tối thiểu 44px ở mọi breakpoint.
- Tất cả JavaScript test mới nằm dưới `tests/` và đường dẫn fixture phải dựa trên `import.meta.url` hoặc `__dirname`.
- Không sửa hoặc commit `.claude/SKIL_Doc.md` và `tmp/NEXORA-OneQR-Tong-Hop-Toan-Bo-Gui-IT/`; đây là thay đổi có sẵn ngoài phạm vi.

## Review Focus

- Storage chứa JSON hỏng hoặc bị chặn phải quay về defaults, không làm trắng màn hình; Task 1 kiểm thử `loadState` và `publishDraft` với storage lỗi.
- Giờ kết thúc bằng/trước giờ bắt đầu, break ngoài ca hoặc break chồng nhau phải chặn publish; Task 1 kiểm thử toàn bộ validation này.
- Appointment có technician ở cấp ticket thay vì cấp appointment vẫn phải tạo Booking Impact; Task 1 kiểm thử cả hai dạng.
- Salon hoặc Staff không tồn tại trong URL phải fallback an toàn và không rò lịch Staff khác; Task 4 kiểm thử URL không hợp lệ.
- Mở nhiều tab phải cập nhật UI sau `storage` event và giữ nguyên section/view hiện tại; Tasks 2, 4 và 5 kiểm thử subscription/refresh.

---

### Task 1: Shared schedule, availability and request store

**Files:**

- Create: `html/assets/staff-schedule-store.js`
- Create: `tests/html/assets/staff-schedule-store.test.cjs`

**Interfaces:**

- Consumes: `NEXORA_SALON_DATA.DEFAULT_CATALOG`, canonical appointment records from `NEXORA_APPOINTMENTS_STORE.loadAll()`.
- Produces: `window.NEXORA_STAFF_SCHEDULE_STORE` and CommonJS export with `loadState`, `getStaffSchedule`, `saveDraft`, `discardDraft`, `validateSchedule`, `findBookingImpacts`, `publishDraft`, `availabilityForDay`, `createRequest`, `reviewRequest`, `cancelRequest`, `subscribe`, `DEFAULT_STATE`, `STORAGE_KEY`, `EVENT_NAME`.
- State shape:

```js
{
  version: 1,
  salons: {
    'bitcoin-nail-bar-houston': {
      publishedAt: '2026-09-28T10:00:00.000Z',
      syncedAt: '2026-09-28T10:00:00.000Z',
      staff: {
        t1: {
          permission: 'request',
          weekly: {mon: {working: true, start: '09:00', end: '19:00', breaks: [{start: '13:00', end: '13:30'}]}},
          exceptions: {'2026-09-30': {type: 'day-off', start: '', end: '', breaks: []}}
        }
      }
    }
  },
  drafts: {},
  requests: []
}
```

- [ ] **Step 1: Write failing normalization, persistence and corrupted-storage tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../../../html/assets/staff-schedule-store.js');

function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

test('loads defaults from missing or corrupt storage and keeps salon scope', () => {
  assert.equal(store.loadState(storage()).version, 1);
  const broken = storage({[store.STORAGE_KEY]: '{bad json'});
  assert.equal(store.loadState(broken).salons['bitcoin-nail-bar-houston'] != null, true);
});

test('draft save does not mutate the published schedule', () => {
  const target = storage();
  const before = store.loadState(target).salons['bitcoin-nail-bar-houston'].staff.t1.weekly.mon.start;
  store.saveDraft('bitcoin-nail-bar-houston', 't1', {weekly: {mon: {working: true, start: '10:00', end: '18:00', breaks: []}}}, target);
  assert.equal(store.loadState(target).salons['bitcoin-nail-bar-houston'].staff.t1.weekly.mon.start, before);
  assert.equal(store.loadState(target).drafts['bitcoin-nail-bar-houston'].t1.weekly.mon.start, '10:00');
});
```

- [ ] **Step 2: Run the store test and verify the missing module failure**

Run: `node --test tests/html/assets/staff-schedule-store.test.cjs`

Expected: FAIL with `Cannot find module '../../../html/assets/staff-schedule-store.js'`.

- [ ] **Step 3: Implement UMD state normalization and safe storage**

```js
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NEXORA_STAFF_SCHEDULE_STORE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var STORAGE_KEY = 'nexora:staff-schedule:v1';
  var EVENT_NAME = 'nexora:staff-schedule-change';
  var SALON_ID = 'bitcoin-nail-bar-houston';
  var DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat'];
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function defaultDay(day) { return {working: day !== 'sun', start: day === 'sun' ? '' : '09:00', end: day === 'sun' ? '' : '19:00', breaks: []}; }
  function defaultStaff() { return {permission: 'request', weekly: Object.fromEntries(DAY_KEYS.map(day => [day, defaultDay(day)])), exceptions: {}}; }
  function defaultState() { return {version: 1, salons: {[SALON_ID]: {publishedAt: '', syncedAt: '', staff: {t1: defaultStaff(), t2: defaultStaff(), t3: defaultStaff()}}}, drafts: {}, requests: []}; }
  function resolveStorage(target) { if (target) return target; try { return localStorage; } catch (_) { return null; } }
  function loadState(target) { var storage = resolveStorage(target); try { return normalizeState(JSON.parse(storage && storage.getItem(STORAGE_KEY) || 'null')); } catch (_) { return defaultState(); } }
  function persist(state, target) { var storage = resolveStorage(target); if (!storage) return {ok: false, error: {code: 'storage-unavailable'}}; try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return {ok: true, state: clone(state)}; } catch (_) { return {ok: false, error: {code: 'storage-failed'}}; } }
  return {STORAGE_KEY, EVENT_NAME, DEFAULT_STATE: defaultState(), loadState};
});
```

`normalizeState` must whitelist `permission` values (`none`, `request`, `same-day`), normalize all seven days and discard invalid request records without throwing.

- [ ] **Step 4: Add failing schedule validation and Booking Impact tests**

```js
test('rejects invalid shifts and breaks', () => {
  assert.deepEqual(store.validateSchedule({mon:{working:true,start:'18:00',end:'09:00',breaks:[]}}).errors.map(e=>e.code), ['invalid-shift']);
  assert.deepEqual(store.validateSchedule({mon:{working:true,start:'09:00',end:'18:00',breaks:[{start:'08:00',end:'09:30'}]}}).errors.map(e=>e.code), ['break-outside-shift']);
  assert.deepEqual(store.validateSchedule({mon:{working:true,start:'09:00',end:'18:00',breaks:[{start:'12:00',end:'13:00'},{start:'12:30',end:'13:30'}]}}).errors.map(e=>e.code), ['break-overlap']);
});

test('finds impacts for appointment and ticket technician lanes', () => {
  const appointments = [
    {id:'a1', customerName:'Ava', technicianId:'t1', startAt:'2026-09-28T17:00:00', endAt:'2026-09-28T18:00:00', status:'confirmed'},
    {id:'a2', customerName:'Mia', tickets:[{technicianId:'t1', startAt:'2026-09-28T18:00:00', endAt:'2026-09-28T19:00:00'}], status:'confirmed'}
  ];
  const schedule = {weekly:{mon:{working:true,start:'09:00',end:'17:30',breaks:[]}},exceptions:{}};
  assert.deepEqual(store.findBookingImpacts('t1', schedule, appointments).map(item=>item.appointmentId), ['a1','a2']);
});
```

- [ ] **Step 5: Implement validation, day resolution and impact detection**

Implement these exact signatures:

```js
function validateSchedule(schedule) // => {ok:Boolean, errors:[{code,day,index?}]}
function getStaffSchedule(salonId, staffId, options, storage) // => normalized schedule; options.includeDraft defaults false
function scheduleForDate(staffSchedule, dateKey) // exception wins over weekly
function appointmentLanes(appointment) // => [{technicianId,startAt,endAt}]
function findBookingImpacts(technicianId, staffSchedule, appointments) // ignores cancelled/no-show
function availabilityForDay(input) // => {date, working, start, end, breaks, appointments, openSlots, conflicts}
```

`availabilityForDay({salonHours, staffSchedule, appointments, technicianId, date, slotMinutes})` must create slots only inside the intersection of salon hours and shift, remove breaks and overlapping appointment lanes, and default `slotMinutes` to 30.

`getStaffSchedule` must return a cloned default schedule for a Staff ID that has not been persisted yet. With `{includeDraft:true}`, it overlays the Staff draft; otherwise it returns published data only.

- [ ] **Step 6: Add failing publish and request lifecycle tests**

```js
test('publish blocks unresolved impacts and preserves published state on storage failure', () => {
  const target = storage();
  store.saveDraft('bitcoin-nail-bar-houston','t1',{weekly:{mon:{working:false,start:'',end:'',breaks:[]}}},target);
  const blocked = store.publishDraft('bitcoin-nail-bar-houston','t1',[{id:'a1',technicianId:'t1',startAt:'2026-09-28T10:00:00',endAt:'2026-09-28T11:00:00',status:'confirmed'}],[],target,'2026-09-28T09:00:00.000Z');
  assert.equal(blocked.error.code,'booking-impact');
  const failing = {getItem:target.getItem,setItem(){throw new Error('full');}};
  const failed = store.publishDraft('bitcoin-nail-bar-houston','t1',[],[],failing,'2026-09-28T09:00:00.000Z');
  assert.equal(failed.error.code,'storage-failed');
});

test('day-off request changes schedule only after approval is applied', () => {
  const target = storage();
  const created = store.createRequest({salonId:'bitcoin-nail-bar-houston',staffId:'t1',type:'day-off',date:'2026-10-02',reason:'Personal'},target,'2026-09-28T09:00:00.000Z');
  assert.equal(created.request.status,'pending');
  assert.equal(store.loadState(target).salons['bitcoin-nail-bar-houston'].staff.t1.exceptions['2026-10-02'],undefined);
  const reviewed = store.reviewRequest(created.request.id,'approve',[],target,'2026-09-28T10:00:00.000Z');
  assert.equal(reviewed.request.status,'applied');
  assert.equal(store.loadState(target).salons['bitcoin-nail-bar-houston'].staff.t1.exceptions['2026-10-02'].type,'day-off');
});
```

- [ ] **Step 7: Implement draft publish, requests and subscriptions**

Implement:

```js
function saveDraft(salonId, staffId, patch, storage)
function discardDraft(salonId, staffId, storage)
function publishDraft(salonId, staffId, appointments, resolvedAppointmentIds, storage, now)
function createRequest(input, storage, now)
function reviewRequest(requestId, decision, appointments, storage, now)
function cancelRequest(requestId, staffId, storage, now)
function subscribe(listener, targetWindow) // listens to storage and EVENT_NAME; returns unsubscribe
```

`reviewRequest(..., 'approve', appointments)` returns `booking-impact` while affected appointment IDs are unresolved. A successful approval sets `approved` then applies the exception atomically and persists final status `applied`. All successful mutations dispatch `CustomEvent(EVENT_NAME)` when a browser window exists.

- [ ] **Step 8: Run the focused store suite**

Run: `node --test tests/html/assets/staff-schedule-store.test.cjs`

Expected: PASS with tests covering defaults, corrupted storage, draft isolation, validation, ticket impacts, storage failure, request approval/reject/cancel and subscriptions.

- [ ] **Step 9: Commit the shared store**

```bash
git add html/assets/staff-schedule-store.js tests/html/assets/staff-schedule-store.test.cjs
git commit -m "feat(schedule): add shared staff availability store"
```

### Task 2: Salon Settings navigation and team schedule overview

**Files:**

- Modify: `html/pages/pos-salon-settings.html:484-514`
- Modify: `html/assets/pos-salon-settings.js:20-29`
- Modify: `html/assets/pos-salon-settings.css`
- Create: `html/assets/staff-schedule-settings.js`
- Modify: `tests/html/pages/pos-salon-settings.test.mjs`

**Interfaces:**

- Consumes: `NEXORA_STAFF_SCHEDULE_STORE.loadState/subscribe/availabilityForDay`, `NEXORA_SALON_DATA.loadCatalog`, `NEXORA_APPOINTMENTS_STORE.loadAll`.
- Produces: settings tab `data-settings-tab="staff-schedule"`, panel `data-settings-panel="staff-schedule"`, public `window.NEXORA_STAFF_SCHEDULE_SETTINGS.refresh()` for same-page roster changes.

- [ ] **Step 1: Extend the Salon Settings boot fixture and write the failing navigation contract**

Load `appointments-store.js`, `staff-schedule-store.js` and `staff-schedule-settings.js` in the test boot after `salon-data.js`. Add:

```js
test('Staff Schedule is a real Salon Settings section with deep-link support',()=>{
 const {dom,w,d,errors}=boot(null,'?section=staff-schedule');
 assert.equal(d.querySelector('[data-settings-tab="staff-schedule"]').classList.contains('active'),true);
 assert.equal(d.querySelector('[data-settings-panel="staff-schedule"]').hidden,false);
 assert.ok(d.querySelector('[data-schedule-week]'));
 assert.equal(new URL(w.location.href).searchParams.get('section'),'staff-schedule');
 assert.deepEqual(errors,[]);dom.window.close();
});
```

Update `boot(serviceCatalog = null, search = '')` so JSDOM uses `https://example.test/pages/pos-salon-settings.html${search}`.

- [ ] **Step 2: Run the Salon Settings test and verify it fails**

Run: `node --test tests/html/pages/pos-salon-settings.test.mjs`

Expected: FAIL because the `staff-schedule` tab and panel do not exist.

- [ ] **Step 3: Add the Staff Schedule tab, empty panel and scripts**

Add after the existing Staff tab:

```html
<button type="button" data-settings-tab="staff-schedule"><i data-lucide="calendar-range" aria-hidden="true"></i> Staff Schedule</button>
```

Add:

```html
<section data-settings-panel="staff-schedule" hidden>
  <div data-staff-schedule-settings aria-live="polite"></div>
</section>
```

Load `appointments-store.js`, then `staff-schedule-store.js`, then `staff-schedule-settings.js`. Extend the valid section list in `pos-salon-settings.js` with `staff-schedule`.

- [ ] **Step 4: Write the failing overview and responsive form-control test**

```js
test('Staff Schedule renders summaries, staff week cells and compliant selectors',()=>{
 const {dom,d,errors}=boot(null,'?section=staff-schedule');
 assert.ok(d.querySelector('[data-schedule-summary="working"]'));
 assert.ok(d.querySelector('[data-schedule-staff="staff-0"] [data-schedule-day]'));
 assert.ok(d.querySelector('[data-schedule-sync-status]'));
 for(const select of d.querySelectorAll('[data-settings-panel="staff-schedule"] select')) assert.match(select.className,/schedule-select/);
 assert.match(readFileSync(new URL('../assets/pos-salon-settings.css',SOURCE_DIR),'utf8'),/\.schedule-select[^}]*padding-right:\s*44px/);
 assert.deepEqual(errors,[]);dom.window.close();
});
```

- [ ] **Step 5: Implement the read-only team overview**

`staff-schedule-settings.js` renders:

```html
<header class="schedule-heading">...</header>
<div class="schedule-summary" data-schedule-summary-list>...</div>
<div class="schedule-week" data-schedule-week>...</div>
<aside class="schedule-request-queue" data-schedule-requests>...</aside>
```

For each active technician, render one row with seven buttons carrying `data-schedule-staff` and `data-schedule-date`. Use `availabilityForDay` to show working/day-off, shift, break count, appointment count, open slot count and conflict marker. Do not place editable fields in the grid.

- [ ] **Step 6: Add the Staff-tab deep link into full schedule**

Add an `Open full schedule` action to each Staff row:

```html
<button type="button" data-staff-schedule-open="STAFF_ID">Open full schedule</button>
```

The click handler selects `staff-schedule`, writes `staff=STAFF_ID` to the URL and calls `NEXORA_STAFF_SCHEDULE_SETTINGS.refresh(STAFF_ID)`.

- [ ] **Step 7: Run Salon Settings tests**

Run: `node --test tests/html/pages/pos-salon-settings.test.mjs`

Expected: PASS, including existing Staff/Services/SMS tests.

- [ ] **Step 8: Commit navigation and overview**

```bash
git add html/pages/pos-salon-settings.html html/assets/pos-salon-settings.js html/assets/pos-salon-settings.css html/assets/staff-schedule-settings.js tests/html/pages/pos-salon-settings.test.mjs
git commit -m "feat(schedule): add Salon Settings team schedule"
```

### Task 3: Manager editor, Booking Impact review and request queue

**Files:**

- Modify: `html/assets/staff-schedule-settings.js`
- Modify: `html/assets/pos-salon-settings.css`
- Modify: `tests/html/pages/pos-salon-settings.test.mjs`

**Interfaces:**

- Consumes: Task 1 draft/publish/request APIs and Task 2 schedule grid hooks.
- Produces: drawer hooks `data-schedule-drawer`, `data-schedule-save-draft`, `data-schedule-publish`, `data-schedule-discard`; impact dialog `data-schedule-impact`; request actions `data-request-approve` and `data-request-reject`.

- [ ] **Step 1: Write a failing draft isolation and validation UI test**

```js
test('manager edits a draft without changing published availability and invalid shifts block save',()=>{
 const {dom,w,d}=boot(null,'?section=staff-schedule&staff=staff-0');
 d.querySelector('[data-schedule-day]').click();
 const start=d.querySelector('[data-schedule-start]');
 const end=d.querySelector('[data-schedule-end]');
 start.value='18:00';end.value='09:00';
 d.querySelector('[data-schedule-save-draft]').click();
 assert.match(d.querySelector('[data-schedule-error]').textContent,/end time/i);
 assert.equal(w.NEXORA_STAFF_SCHEDULE_STORE.loadState().drafts['bitcoin-nail-bar-houston'],undefined);
 start.value='10:00';end.value='17:00';d.querySelector('[data-schedule-save-draft]').click();
 assert.ok(w.NEXORA_STAFF_SCHEDULE_STORE.loadState().drafts['bitcoin-nail-bar-houston']['staff-0']);
 dom.window.close();
});
```

- [ ] **Step 2: Run the focused test and verify missing editor hooks**

Run: `node --test --test-name-pattern="manager edits" tests/html/pages/pos-salon-settings.test.mjs`

Expected: FAIL because the drawer fields do not exist.

- [ ] **Step 3: Implement the accessible editor drawer**

Render a drawer with:

- seven day rows with Working/Day off, start/end and removable breaks;
- selected-date exception type (`regular`, `custom-hours`, `day-off`);
- permission select (`none`, `request`, `same-day`);
- service eligibility summary from Salon Data;
- inline errors with `role="alert"`;
- Save draft, Publish & Sync Booking, Discard and Close.

Every select uses `.schedule-select`; focus moves to the drawer heading on open and returns to the opening day cell on close. Escape closes only when no unsaved field edit exists; otherwise show the discard confirmation within the drawer.

- [ ] **Step 4: Write a failing Booking Impact publish test**

```js
test('publish opens Booking Impact and waits for explicit resolution',()=>{
 const {dom,w,d}=boot(null,'?section=staff-schedule&staff=staff-0');
 seedAppointment(w,{id:'affected',technicianId:'staff-0',startAt:'2026-09-28T17:00:00',endAt:'2026-09-28T18:00:00',status:'confirmed'});
 d.querySelector('[data-schedule-day]').click();
 d.querySelector('[data-schedule-working]').checked=false;
 d.querySelector('[data-schedule-save-draft]').click();
 d.querySelector('[data-schedule-publish]').click();
 assert.equal(d.querySelector('[data-schedule-impact]').hidden,false);
 assert.match(d.querySelector('[data-schedule-impact]').textContent,/affected/i);
 assert.equal(w.NEXORA_STAFF_SCHEDULE_STORE.loadState().drafts['bitcoin-nail-bar-houston']['staff-0'] != null,true);
 d.querySelector('[data-impact-keep="affected"]').click();
 d.querySelector('[data-impact-confirm]').click();
 assert.equal(w.NEXORA_STAFF_SCHEDULE_STORE.loadState().drafts['bitcoin-nail-bar-houston'],undefined);
 dom.window.close();
});
```

- [ ] **Step 5: Implement Booking Impact Review**

The dialog lists customer, service, time and conflict reason. Prototype resolution actions are:

- `Keep appointment as exception`: add appointment ID to resolved list.
- `Open Front Desk`: link to `pos-front-desk.html?tab=appointments&view=calendar&date=YYYY-MM-DD` without mutating appointment.
- `Cancel schedule change`: close impact review and keep draft.

`Confirm & Publish` remains disabled until every impact has a selected resolution.

- [ ] **Step 6: Write failing request approval/rejection tests**

```js
test('manager request queue approves or rejects without silent schedule changes',()=>{
 const {dom,w,d}=boot(null,'?section=staff-schedule');
 const pending=w.NEXORA_STAFF_SCHEDULE_STORE.createRequest({salonId:'bitcoin-nail-bar-houston',staffId:'staff-0',type:'day-off',date:'2026-10-02',reason:'Personal'}).request;
 w.NEXORA_STAFF_SCHEDULE_SETTINGS.refresh();
 assert.match(d.querySelector('[data-schedule-requests]').textContent,/Personal/);
 d.querySelector('[data-request-reject="'+pending.id+'"]').click();
 assert.equal(w.NEXORA_STAFF_SCHEDULE_STORE.loadState().requests.find(item=>item.id===pending.id).status,'rejected');
 assert.equal(w.NEXORA_STAFF_SCHEDULE_STORE.loadState().salons['bitcoin-nail-bar-houston'].staff['staff-0']?.exceptions?.['2026-10-02'],undefined);
 dom.window.close();
});
```

- [ ] **Step 7: Implement request queue and live refresh**

Render Pending requests first with Approve/Reject actions, then the five most recent resolved requests. Approval calls `reviewRequest`; if it returns `booking-impact`, reuse the impact dialog. Subscribe to the store and call `refresh()` without changing the selected week, Staff drawer or URL section.

- [ ] **Step 8: Run Salon Settings tests and full store tests**

Run: `node --test tests/html/assets/staff-schedule-store.test.cjs tests/html/pages/pos-salon-settings.test.mjs`

Expected: PASS.

- [ ] **Step 9: Commit manager workflow**

```bash
git add html/assets/staff-schedule-settings.js html/assets/pos-salon-settings.css tests/html/pages/pos-salon-settings.test.mjs
git commit -m "feat(schedule): manage availability and day-off requests"
```

### Task 4: Staff My Calendar, work schedule and Day-off Request

**Files:**

- Modify: `html/pages/pos-calendar.html`
- Create: `html/assets/staff-calendar.js`
- Create: `html/assets/staff-calendar.css`
- Modify: `tests/html/pages/pos-calendar.test.mjs`

**Interfaces:**

- Consumes: `NEXORA_STAFF_SCHEDULE_STORE.loadState/createRequest/cancelRequest/availabilityForDay/subscribe`, Salon Data and Appointments Store.
- Produces: My Calendar tabs `appointments`, `work-schedule`, `requests`; query parameters `salon`, `staff`, `date`, `view`; request dialog hooks.

- [ ] **Step 1: Replace inline calendar boot in the test and write failing IA assertions**

Boot the page by evaluating `salon-data.js`, `appointments-store.js`, `staff-schedule-store.js` and `staff-calendar.js`. Add:

```js
test('My Calendar keeps the staff shell and exposes personal calendar tabs',()=>{
 const {dom,d,errors}=boot('?salon=bitcoin-nail-bar-houston&staff=t1');
 assert.equal(d.querySelector('h1').textContent,'My Calendar');
 assert.deepEqual(Array.from(d.querySelectorAll('[data-calendar-tab]'),n=>n.dataset.calendarTab),['appointments','work-schedule','requests']);
 assert.ok(d.querySelector('[data-calendar-salon]'));
 assert.match(d.querySelector('[data-calendar-sync]').textContent,/Booking/);
 assert.equal(d.querySelector('[data-team-schedule]'),null);
 assert.deepEqual(errors,[]);dom.window.close();
});
```

- [ ] **Step 2: Run My Calendar tests and verify they fail**

Run: `node --test tests/html/pages/pos-calendar.test.mjs`

Expected: FAIL because the tabs, salon selector and sync status do not exist.

- [ ] **Step 3: Move inline CSS/JS to focused assets and build the My Calendar shell**

Keep `window.NEXORA_SHELL = {activePage:'staff', activeTab:'my-calendar'}`. The HTML should contain only semantic hosts and script ordering; `staff-calendar.js` owns rendering and interactions. `staff-calendar.css` preserves the current mobile-first design and adds a two-column desktop layout for timeline plus schedule/request side card.

- [ ] **Step 4: Write failing personal timeline and URL fallback tests**

```js
test('day timeline contains shift boundaries, breaks, appointments and open slots for only the logged-in staff',()=>{
 const {dom,d}=boot('?staff=t1&date=2026-09-28');
 const text=d.querySelector('[data-calendar-timeline]').textContent;
 assert.match(text,/Work starts/);assert.match(text,/Break/);assert.match(text,/Open slot/);assert.match(text,/Work ends/);
 assert.doesNotMatch(text,/Staff 2 private appointment/);
 dom.window.close();
});

test('invalid salon and staff URL values fall back to the logged-in staff scope',()=>{
 const {dom,w,d}=boot('?salon=missing&staff=missing');
 assert.equal(d.querySelector('[data-calendar]').dataset.staffId,'t1');
 assert.equal(new URL(w.location.href).searchParams.get('staff'),'t1');
 dom.window.close();
});
```

- [ ] **Step 5: Implement scoped timeline rendering**

Filter canonical appointments by selected date and the resolved Staff ID, including ticket lanes. Merge them with `availabilityForDay` into ordered timeline items. Render labels `Work starts`, `Appointment`, `Break`, `Open slot`, `Work ends`. Requests and working hours must always use the selected salon.

- [ ] **Step 6: Write failing Day-off Request behavior test**

```js
test('staff submits a pending Day-off Request without changing the published schedule',()=>{
 const {dom,w,d}=boot('?staff=t1&date=2026-10-02');
 d.querySelector('[data-calendar-tab="requests"]').click();
 d.querySelector('[data-request-day-off]').click();
 d.querySelector('[data-request-date]').value='2026-10-02';
 d.querySelector('[data-request-reason]').value='Personal';
 d.querySelector('[data-request-form]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const state=w.NEXORA_STAFF_SCHEDULE_STORE.loadState();
 assert.equal(state.requests.at(-1).status,'pending');
 assert.equal(state.salons['bitcoin-nail-bar-houston'].staff.t1.exceptions['2026-10-02'],undefined);
 assert.match(d.querySelector('[data-request-list]').textContent,/Pending/);
 dom.window.close();
});
```

- [ ] **Step 7: Implement Requests and permission states**

When permission is `none`, hide the form actions and render the policy explanation. When `request`, allow Day off and Change hours requests. When `same-day`, show Take break only for today but still use the store validation and block affected appointments. Pending requests have Cancel; Applied/Rejected/Cancelled are read-only.

- [ ] **Step 8: Add subscription refresh without losing active tab/date**

On a schedule store change, rerender the current active tab, selected date and salon. Do not reset to Appointments. Add a JSDOM test that dispatches `StorageEvent('storage', {key: store.STORAGE_KEY})` after publishing and asserts the current Work Schedule tab updates.

- [ ] **Step 9: Run My Calendar and shell tests**

Run: `node --test tests/html/pages/pos-calendar.test.mjs tests/html/assets/nexora-shell.staff-calendar.test.mjs`

Expected: PASS.

- [ ] **Step 10: Commit Staff My Calendar**

```bash
git add html/pages/pos-calendar.html html/assets/staff-calendar.js html/assets/staff-calendar.css tests/html/pages/pos-calendar.test.mjs
git commit -m "feat(schedule): upgrade staff My Calendar"
```

### Task 5: Front Desk coverage, schedule conflicts and booking guard

**Files:**

- Modify: `html/pages/pos-front-desk.html:45-60`
- Create: `html/assets/front-desk-schedule.js`
- Create: `html/assets/front-desk-schedule.css`
- Modify: `html/assets/pos-front-desk.js`
- Modify: `html/assets/team-calendar-content.js`
- Modify: `tests/html/pages/pos-front-desk.test.mjs`

**Interfaces:**

- Consumes: Schedule store read APIs, Appointments Store and Salon Data.
- Produces: `window.NEXORA_FRONT_DESK_SCHEDULE.validateBooking(input)`, coverage bar `data-front-schedule`, conflict badge and Salon Settings deep link.

- [ ] **Step 1: Extend Front Desk boot and write a failing operational indicator test**

```js
test('Front Desk shows schedule coverage and links management to Salon Settings',()=>{
 const dom=boot(),d=dom.window.document;
 assert.ok(d.querySelector('[data-front-schedule]'));
 assert.ok(d.querySelector('[data-front-schedule-conflicts]'));
 assert.equal(d.querySelector('[data-manage-staff-schedule]').getAttribute('href'),'pos-salon-settings.html?section=staff-schedule');
 dom.window.close();
});
```

- [ ] **Step 2: Run the Front Desk test and verify missing indicators**

Run: `node --test --test-name-pattern="schedule coverage" tests/html/pages/pos-front-desk.test.mjs`

Expected: FAIL because the coverage host does not exist.

- [ ] **Step 3: Add the schedule status host and read-only adapter**

Add before the appointment toolbar:

```html
<section class="front-schedule" data-front-schedule aria-label="Staff schedule coverage"></section>
```

Load Schedule Store and `front-desk-schedule.js` before `pos-front-desk.js`. Render working Staff count, open slots, conflicts and `Manage staff schedule`. Subscribe and refresh without changing table/card/calendar view.

- [ ] **Step 4: Write failing booking availability guard tests**

```js
test('New Booking blocks a technician outside published availability',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 d.querySelector('#new-booking').click();
 d.querySelector('[name="customerName"]').value='Outside shift';
 d.querySelector('[name="phone"]').value='5551234567';
 d.querySelector('[name="startAt"]').value='2026-09-28T22:00';
 d.querySelector('[name="technicianId"]').value='t1';
 d.querySelector('#booking-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 assert.match(d.querySelector('#form-error').textContent,/outside.*availability/i);
 assert.equal(w.NEXORA_APPOINTMENTS_STORE.loadAll().some(item=>item.customerName==='Outside shift'),false);
 dom.window.close();
});
```

- [ ] **Step 5: Implement `validateBooking` and integrate it before store mutation**

```js
function validateBooking(input) {
  if (!input.technicianId) return {ok:true};
  var day = scheduleStore.availabilityForDay({
    salonHours: salonHoursFor(input.startAt),
    staffSchedule: publishedStaffSchedule(input.salonId,input.technicianId),
    appointments: appointmentsStore.loadAll(),
    technicianId: input.technicianId,
    date: input.startAt.slice(0,10),
    slotMinutes: input.durationMin
  });
  return day.openSlots.some(slot => slot.startAt === input.startAt)
    ? {ok:true}
    : {ok:false,error:{code:'outside-availability',message:'This technician is outside published availability.'}};
}
```

Call it after normal form validation and before `store.create` or `store.update`. Unassigned (`Anyone`) appointments remain allowed because a technician will be chosen later.

- [ ] **Step 6: Add schedule overlays to Team Calendar through an event contract**

Dispatch `calendar-schedule-update` on `#team-calendar` with `{availabilityByTechnician, conflicts}` after mount and schedule changes. In `team-calendar-content.js`, listen for the event and render non-interactive `.schedule-unavailable` and `.schedule-break` layers behind appointments. Add a test that checks the shadow root contains both layers and appointment click still opens the appointment drawer.

- [ ] **Step 7: Run Front Desk tests**

Run: `node --test tests/html/pages/pos-front-desk.test.mjs tests/html/assets/team-calendar-turn-focus.test.cjs`

Expected: PASS.

- [ ] **Step 8: Commit Front Desk integration**

```bash
git add html/pages/pos-front-desk.html html/assets/front-desk-schedule.js html/assets/front-desk-schedule.css html/assets/pos-front-desk.js html/assets/team-calendar-content.js tests/html/pages/pos-front-desk.test.mjs
git commit -m "feat(schedule): surface availability in Front Desk"
```

### Task 6: Cross-surface regression, accessibility and final verification

**Files:**

- Modify: `tests/html/pages/pos-salon-settings.test.mjs`
- Modify: `tests/html/pages/pos-calendar.test.mjs`
- Modify: `tests/html/pages/pos-front-desk.test.mjs`
- Modify: `tests/html/assets/staff-schedule-store.test.cjs`

**Interfaces:**

- Consumes: all public interfaces from Tasks 1–5.
- Produces: stable cross-surface acceptance coverage; no new runtime API.

- [ ] **Step 1: Add a cross-surface round-trip test**

Create one shared in-memory/localStorage seed and prove this sequence:

```js
// 1. Staff creates a pending day-off request.
// 2. Salon Settings renders it without changing published availability.
// 3. Manager approves it after resolving impacts.
// 4. My Calendar renders Day off and Front Desk reduces coverage.
// 5. Rejecting a second request leaves published availability unchanged.
```

Use explicit assertions on request statuses, published exception, My Calendar text and Front Desk coverage count; do not rely only on snapshots.

- [ ] **Step 2: Add keyboard and ARIA assertions**

Verify:

- active tabs expose `aria-selected="true"` or `aria-current="page"` consistently;
- drawer/dialog headings are focused when opened;
- Escape and Close restore focus;
- invalid fields have `aria-invalid="true"` and link to the error message;
- disabled request actions include visible policy copy;
- every icon-only button has an accessible name.

- [ ] **Step 3: Run all schedule-related tests**

Run:

```bash
node --test \
  tests/html/assets/staff-schedule-store.test.cjs \
  tests/html/pages/pos-salon-settings.test.mjs \
  tests/html/pages/pos-calendar.test.mjs \
  tests/html/pages/pos-front-desk.test.mjs \
  tests/html/assets/nexora-shell.staff-calendar.test.mjs
```

Expected: PASS.

- [ ] **Step 4: Run the entire repository test suite**

Run: `npm test`

Expected: PASS with zero failures.

- [ ] **Step 5: Run static checks and inspect the final diff**

Run:

```bash
git diff --check
git status --short
git diff --stat
```

Expected: no whitespace errors; only files in this plan are staged/committed; `.claude/SKIL_Doc.md` and `tmp/NEXORA-OneQR-Tong-Hop-Toan-Bo-Gui-IT/` remain untouched.

- [ ] **Step 6: Perform browser smoke checks**

Open these URLs at desktop and mobile widths:

- `html/pages/pos-salon-settings.html?section=staff-schedule`
- `html/pages/pos-salon-settings.html?section=staff-schedule&staff=t1`
- `html/pages/pos-calendar.html?salon=bitcoin-nail-bar-houston&staff=t1`
- `html/pages/pos-front-desk.html?tab=appointments&view=calendar`

Verify tab navigation, drawer/dialog focus, week overflow, dropdown arrow spacing, Day-off Request, approval, Booking Impact and Front Desk refresh.

- [ ] **Step 7: Commit final regression coverage**

```bash
git add tests/html/assets/staff-schedule-store.test.cjs tests/html/pages/pos-salon-settings.test.mjs tests/html/pages/pos-calendar.test.mjs tests/html/pages/pos-front-desk.test.mjs
git commit -m "test(schedule): cover cross-surface availability workflow"
```

- [ ] **Step 8: Run completion verification and record evidence**

Run `npm test` again immediately before reporting completion. Record the passing test count, the four feature commits and the final `git status --short`; do not claim completion from an earlier run.
