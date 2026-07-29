# Booking Calendar Subtab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tách calendar của Booking Book thành subtab `Calendar`, đồng thời giữ `Table / Card` là hai mode duy nhất trong `Appointments`.

**Architecture:** Giữ một appointment workspace dùng chung gồm vùng nội dung của hai subtab `Appointments`/`Calendar` và một detail panel duy nhất. `Appointments` chỉ render table/card; `Calendar` sở hữu DayPilot calendar và các thao tác lịch. `Team` nằm ngoài workspace và được runtime ẩn workspace khi active.

**Tech Stack:** Static HTML, inline JavaScript, CSS trong `html/pages/booking-book-phase-1.html`, DayPilot Lite, shared `appointments-store.js`, Node built-in test runner.

## Global Constraints

- Không đổi schema hoặc business rule của appointment store.
- Không tạo catalog, data model hoặc renderer appointment thứ hai.
- Không thêm query parameter cho subtab; `?tab=booking` vẫn mở `Appointments`.
- `Appointments` chỉ có mode `Table` và `Card`.
- Calendar giữ date controls, create, time-range selection, click, drag và resize.
- Giữ nguyên `Team`, POS calendar và các page khác.

---

### Task 1: Cập nhật contract tests cho subtab và view mode

**Files:**
- Modify: `html/pages/booking-book-phase-1.shared-appointments.test.mjs`
- Test target: source contract của `html/pages/booking-book-phase-1.html`

**Interfaces:**
- Consumes: markup/runtime contract hiện tại của Booking Book.
- Produces: các assertion red mô tả subtab Calendar, Table/Card-only mode và calendar workspace mới.

- [ ] **Step 1: Sửa test subtab để yêu cầu Calendar panel riêng**

Thay test workspace hiện tại để yêu cầu:

```js
test('Booking Book exposes Appointments, Calendar, and Team subtabs', () => {
  assert.match(SOURCE, /data-booking-subtab-target="today"[^>]*aria-controls="booking-subpanel-today"/);
  assert.match(SOURCE, /data-booking-subtab-target="calendar"[^>]*aria-controls="booking-subpanel-calendar"/);
  assert.match(SOURCE, /<span>Calendar<\/span>/);
  assert.match(SOURCE, /data-booking-subtab-target="team"[^>]*aria-controls="booking-subpanel-team"/);
  assert.match(SOURCE, /id="booking-subpanel-calendar" data-booking-sub-panel="calendar"/);
});
```

- [ ] **Step 2: Sửa test mode view để cấm Calendar mode trong Appointments**

Thay các expectation mặc định calendar bằng:

```js
test('Booking Book keeps Table and Card modes inside Appointments', () => {
  assert.match(SOURCE, /data-booking-view-target="table"/);
  assert.match(SOURCE, /data-booking-view-target="card"/);
  assert.doesNotMatch(SOURCE, /data-booking-view-target="calendar"/);
  assert.doesNotMatch(SOURCE, /data-booking-view-panel="calendar"/);
  assert.match(SOURCE, /function initBookingViewMode\(\)[\s\S]*setBookingViewMode\('table'\)/);
  assert.doesNotMatch(SOURCE, /setBookingViewMode\('calendar'\)/);
});
```

- [ ] **Step 3: Sửa các test layout cũ theo workspace dùng chung**

Giữ assertion cho detail panel, nhưng đổi contract từ `data-booking-view-mode="calendar"` sang workspace dùng chung:

```js
test('Booking Book keeps one detail panel for appointment and calendar workspaces', () => {
  assert.match(SOURCE, /data-booking-appointment-workspace/);
  assert.match(SOURCE, /data-booking-appointment-panel/);
  assert.match(SOURCE, /id="booking-subpanel-calendar" data-booking-sub-panel="calendar"[\s\S]*data-booking-team-calendar/);
  assert.match(SOURCE, /booking-appointment-panel \{[\s\S]*position: sticky/);
});
```

- [ ] **Step 4: Chạy test để xác nhận RED**

Run:

```bash
node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs
```

Expected: FAIL vì source hiện chưa có subtab/panel `Calendar`, vẫn còn target/panel view `calendar`, và mặc định vẫn gọi `setBookingViewMode('calendar')`.

### Task 2: Tái cấu trúc markup và CSS

**Files:**
- Modify: `html/pages/booking-book-phase-1.html:3831-3905` (workspace CSS)
- Modify: `html/pages/booking-book-phase-1.html:7922-8490` (Booking markup)

**Interfaces:**
- Consumes: contract tests từ Task 1.
- Produces: DOM có ba subtab; một workspace chung với detail panel duy nhất; `Appointments` chỉ table/card; `Calendar` chứa DayPilot host.

- [ ] **Step 1: Thêm button Calendar vào booking subtab list**

Chèn giữa `Appointments` và `Team` một button role tab có `data-booking-subtab-target="calendar"`, `aria-controls="booking-subpanel-calendar"`, label `Calendar` và icon calendar.

- [ ] **Step 2: Tạo wrapper workspace dùng chung**

Đặt wrapper trước `booking-subpanel-today`:

```html
<div class="booking-appointment-layout" data-booking-appointment-workspace>
  <div class="booking-appointment-main">
    <div class="booking-sub-panel is-active" id="booking-subpanel-today" data-booking-sub-panel="today">
      ...Appointments KPI + table/card...
    </div>
    <div class="booking-sub-panel" id="booking-subpanel-calendar" data-booking-sub-panel="calendar">
      ...Calendar workspace...
    </div>
  </div>
  <aside class="booking-appointment-panel overview-card" data-booking-appointment-panel aria-label="Appointment details">
    ...existing empty state...
  </aside>
</div>
```

Giữ detail/create modal trong booking content, chuyển detail aside ra khỏi `today` để calendar event và table action cùng dùng một host.

- [ ] **Step 3: Giữ Table/Card trong Appointments và bỏ calendar view block**

Trong daybar của Appointments, giữ nguyên `data-booking-view-target="table"` và `data-booking-view-target="card"`; xóa button Calendar. Xóa `data-booking-view-panel="calendar"` cùng markup calendar cũ khỏi article Appointments.

- [ ] **Step 4: Thêm Calendar panel với calendar markup hiện tại**

Tạo panel `booking-subpanel-calendar` và đưa vào đó calendar head, date controls, `data-booking-calendar-add`, `data-booking-calendar-prev`, `data-booking-calendar-today`, `data-booking-calendar-next` và `data-booking-team-calendar`. Calendar panel không dùng `data-booking-view-panel`.

- [ ] **Step 5: Cập nhật CSS layout**

Đổi `.booking-appointment-layout` thành grid luôn có hai cột; xóa các selector phụ thuộc `data-booking-view-mode="calendar"` và quy tắc ẩn detail panel ngoài calendar mode. Ở breakpoint `1120px`, chuyển grid về một cột như layout hiện tại.

- [ ] **Step 6: Parse và chạy lại contract tests**

Run:

```bash
node --check html/pages/booking-book-phase-1.shared-appointments.test.mjs
node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs
```

Expected: test file parse được; tests vẫn có thể FAIL ở runtime assertions cho tới Task 3, nhưng không được có lỗi HTML/JS syntax do chỉnh markup.

### Task 3: Chuyển runtime từ calendar mode sang Calendar subtab

**Files:**
- Modify: `html/pages/booking-book-phase-1.html:10425-10460` (subtab activation)
- Modify: `html/pages/booking-book-phase-1.html:11760-11795` (view mode)
- Modify: `html/pages/booking-book-phase-1.html:11900-11910` (initialization)
- Modify: `html/pages/booking-book-phase-1.html:13090-13115` (listeners)
- Modify: `html/pages/booking-book-phase-1.html:13980-13990` (startup)

**Interfaces:**
- Consumes: `data-booking-appointment-workspace`, `booking-subpanel-calendar`, existing calendar functions.
- Produces: `activateBookingSubTab('calendar')` initializes/renders calendar; `setBookingViewMode()` chỉ xử lý table/card; appointments create và calendar create tách listener.

- [ ] **Step 1: Cập nhật activateBookingSubTab**

Giữ toggle active/aria state của tabs và panels. Thêm workspace visibility:

```js
var workspace = document.querySelector('[data-booking-appointment-workspace]');
if (workspace) workspace.hidden = target === 'team';
if (target === 'calendar') {
  initBookingCalendar();
  renderBookingCalendar();
}
```

Khi `Team` active, workspace và detail panel bị ẩn; khi `Appointments` hoặc `Calendar` active, workspace hiện lại.

- [ ] **Step 2: Giới hạn setBookingViewMode ở table/card**

Đổi normalization thành:

```js
var nextMode = mode === 'card' ? 'card' : 'table';
```

Chỉ query các `[data-booking-view-panel]` trong `booking-subpanel-today`, cập nhật button Table/Card, và bỏ nhánh `nextMode === 'calendar'`. Không còn gán `appointmentLayout.dataset.bookingViewMode`.

- [ ] **Step 3: Đặt mode mặc định là Table**

Đổi `initBookingViewMode()` thành gọi `setBookingViewMode('table')`. Xóa `if (activeTarget === 'booking') setBookingViewMode('calendar')` trong `activateMainTab`; việc mở main tab không được khởi tạo calendar mode.

- [ ] **Step 4: Tách nút tạo appointment của hai panel**

Đổi nút `New appointment` ở Appointments thành `data-booking-appointments-add`; giữ nút Calendar là `data-booking-calendar-add`. Appointments gọi `openBookingNewAppointment()` để mở create modal. Calendar gọi `activateBookingSubTab('calendar')` rồi `openBookingAppointmentPanelForNew(null, null, 'unassigned')`.

Đơn giản hóa `openBookingNewAppointment()` để luôn đóng panel và mở create modal; bỏ logic đọc `data-booking-view-mode`.

- [ ] **Step 5: Giữ calendar handlers và kiểm tra initialization**

Giữ nguyên date controls, `onTimeRangeSelected`, `onEventClick`, `onEventMoved`, `onEventResized`. Đảm bảo `initBookingCalendar()` chỉ tạo một DayPilot instance và `renderBookingCalendar()` an toàn khi panel chưa được khởi tạo.

- [ ] **Step 6: Chạy test để xác nhận GREEN**

Run:

```bash
node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs
```

Expected: focused Booking Book contract suite PASS.

### Task 4: Kiểm tra toàn bộ behavior và hoàn thiện diff

**Files:**
- Verify: `html/pages/booking-book-phase-1.html`
- Verify: `html/pages/booking-book-phase-1.shared-appointments.test.mjs`

**Interfaces:**
- Consumes: implementation từ Tasks 1–3.
- Produces: evidence cho acceptance criteria và diff sạch.

- [ ] **Step 1: Chạy full focused test suite**

```bash
node --test html/pages/booking-book-phase-1.shared-appointments.test.mjs
```

- [ ] **Step 2: Kiểm tra inline scripts**

```bash
node - <<'NODE'
const fs = require('fs');
const source = fs.readFileSync('html/pages/booking-book-phase-1.html', 'utf8');
const scripts = [...source.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].map(match => match[1]);
for (const [index, script] of scripts.entries()) {
  if (!script.trim()) continue;
  new Function(script);
  console.log(`script ${index + 1}: ok`);
}
NODE
```

- [ ] **Step 3: Kiểm tra không còn calendar mode contract**

```bash
rg -n 'data-booking-view-target="calendar"|data-booking-view-panel="calendar"|setBookingViewMode\('\''calendar'\''\)|data-booking-view-mode="calendar"' html/pages/booking-book-phase-1.html
```

Expected: không có output.

- [ ] **Step 4: Kiểm tra diff whitespace và status**

```bash
git diff --check
git status --short
git diff --stat
```

Expected: không có whitespace error; chỉ các file thuộc task thay đổi ngoài các thay đổi dirty có sẵn của user.

