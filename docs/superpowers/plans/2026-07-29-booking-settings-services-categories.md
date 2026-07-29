# Booking Settings Services & Pricing Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay các service rows viết cứng trong `Services & Pricing` bằng giao diện category accordion dựng từ `booking-service-catalog-draft.json`, nhưng vẫn giữ chỉnh sửa, thêm, gợi ý và xóa dịch vụ ở mức UI hiện tại.

**Architecture:** Tái sử dụng `appointmentServiceCatalogLoader` và biến `appointmentServiceCatalog` đã có trong `booking-book-phase-1.html`. Một renderer Settings sẽ nhận catalog chuẩn hóa, dựng từng category và service row bằng HTML đã escape; nếu JSON lỗi, renderer nhóm `catalog.services` hiện có thành category dự phòng. Các thao tác thêm thủ công sẽ tạo category `CUSTOM SERVICES` khi cần và dùng lại event delegation hiện tại.

**Tech Stack:** HTML/CSS inline trong `html/pages/booking-book-phase-1.html`, JavaScript trình duyệt không framework, Node.js built-in test runner, catalog normalizer `html/assets/appointment-service-catalog.js`.

## Ràng buộc chung

- Dùng lại `appointmentServiceCatalogLoader` và URL `APPOINTMENT_SERVICE_CATALOG_URL` hiện có.
- Không sửa `booking-service-catalog-draft.json`.
- Không thay đổi schema `salon-data` hoặc persistence chung cho Booking/POS.
- Không thay đổi bộ chọn dịch vụ của appointment ngoài việc giữ tương thích với loader hiện có.
- Tất cả dữ liệu từ JSON phải được escape trước khi đưa vào `innerHTML`.
- Giữ các selector `data-service-row`, `data-service-remove` và class input hiện có.

## Bản đồ file

- Sửa `html/pages/booking-book-phase-1.html`: thay markup 10 rows, thêm CSS accordion, thêm renderer catalog/fallback và nối renderer vào loader.
- Tạo `html/pages/booking-book-phase-1.settings-services.test.mjs`: source-contract tests cho markup, loader, renderer, fallback và các hook thao tác.
- Không sửa JSON hoặc các module shared khác.

### Task 1: Viết source-contract tests cho behavior mới

**Files:**
- Create: `html/pages/booking-book-phase-1.settings-services.test.mjs`
- Test target: `html/pages/booking-book-phase-1.html`

**Interfaces:**
- Test đọc toàn bộ HTML bằng `readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8')`.
- Các contract cần có sau triển khai: `data-settings-service-catalog`, `data-service-category`, `renderSettingsServiceCatalog`, `settingsEnsureCustomCategory`, `settingsServiceRowMarkup`, `appointmentServiceCatalogLoader.load`, `CUSTOM SERVICES`, `data-service-row`, `data-service-remove`.

- [ ] **Bước 1: Tạo test đang thất bại**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');

test('Settings Services & Pricing renders from the shared JSON catalog', () => {
  assert.match(SOURCE, /data-settings-service-catalog/);
  assert.match(SOURCE, /appointmentServiceCatalogLoader\.load/);
  assert.match(SOURCE, /function renderSettingsServiceCatalog\(/);
  assert.match(SOURCE, /function settingsServiceRowMarkup\(/);
  assert.match(SOURCE, /service\.durationMin/);
  assert.match(SOURCE, /service\.price/);
});

test('Settings service markup is category-based and keeps dynamic row hooks', () => {
  assert.match(SOURCE, /function settingsServiceCategoryMarkup\(/);
  assert.match(SOURCE, /data-service-category/);
  assert.match(SOURCE, /CUSTOM SERVICES/);
  assert.match(SOURCE, /data-service-row/);
  assert.match(SOURCE, /data-service-remove/);
  assert.doesNotMatch(SOURCE, /value="Gel Manicure"/);
  assert.doesNotMatch(SOURCE, /value="Classic Manicure"/);
});

test('Settings has loading and catalog fallback behavior', () => {
  assert.match(SOURCE, /Loading services/);
  assert.match(SOURCE, /catalog\.services/);
  assert.match(SOURCE, /renderSettingsServiceCatalog\([\s\S]*fallback/);
});

test('manual and industry services are added to CUSTOM SERVICES', () => {
  assert.match(SOURCE, /function settingsEnsureCustomCategory\(/);
  assert.match(SOURCE, /settingsEnsureCustomCategory\(\)/);
  assert.match(SOURCE, /data-service-suggest-add/);
  assert.match(SOURCE, /data-service-remove/);
});
```

- [ ] **Bước 2: Chạy test để xác nhận RED**

Run: `node --test html/pages/booking-book-phase-1.settings-services.test.mjs`

Expected: FAIL vì markup và các hàm renderer mới chưa tồn tại; các test hiện có của project không được dùng để suy ra behavior mới.

### Task 2: Thay markup hard-code bằng container loading

**Files:**
- Modify: `html/pages/booking-book-phase-1.html:9207-9364`

**Interfaces:**
- Container mới: `<div class="settings-service-list settings-service-body" data-settings-service-catalog>`.
- Renderer ở Task 4 sẽ thay nội dung container bằng category markup.
- Event delegation hiện tại tiếp tục tìm `data-service-remove` và `data-service-suggest-add`.

- [ ] **Bước 1: Xóa 10 service rows viết cứng**

Giữ phần action buttons, scan panel và suggest panel; thay toàn bộ service header cùng 10 row bằng:

```html
<div class="settings-service-list settings-service-body" data-settings-service-catalog>
  <div class="settings-service-catalog-state" data-settings-service-catalog-state>Loading services…</div>
</div>
```

- [ ] **Bước 2: Thêm style cho accordion category và trạng thái catalog**

Thêm các rule gần nhóm `.settings-service-*` hiện có:

```css
.settings-service-catalog-state {
  border: 1px dashed var(--nexora-border);
  border-radius: 10px;
  padding: 16px;
  color: var(--nexora-muted);
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.settings-service-category {
  overflow: hidden;
  border: 1px solid var(--nexora-border);
  border-radius: 11px;
  background: #fff;
}

.settings-service-category + .settings-service-category {
  margin-top: 6px;
}

.settings-service-category-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  list-style: none;
  cursor: pointer;
  padding: 10px 11px;
  background: #f8faff;
}

.settings-service-category-head::-webkit-details-marker {
  display: none;
}

.settings-service-category-head::after {
  content: '⌄';
  color: var(--nexora-subtle);
  font-size: 14px;
  font-weight: 900;
  transition: transform .16s ease;
}

.settings-service-category:not([open]) .settings-service-category-head::after {
  transform: rotate(-90deg);
}

.settings-service-category-name {
  color: var(--nexora-text);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.settings-service-category-count {
  margin-left: auto;
  border-radius: 999px;
  background: #e9edff;
  padding: 2px 7px;
  color: var(--nexora-brand);
  font-size: 10px;
  font-weight: 800;
}

.settings-service-category-body {
  display: grid;
  gap: 5px;
  padding: 7px;
}
```

- [ ] **Bước 3: Chạy source-contract test lại**

Run: `node --test html/pages/booking-book-phase-1.settings-services.test.mjs`

Expected: vẫn FAIL vì renderer chưa được viết; test phải tiếp tục fail ở contract của JavaScript chứ không fail do cú pháp test.

### Task 3: Viết renderer category/service và fallback

**Files:**
- Modify: `html/pages/booking-book-phase-1.html` trong vùng Settings helper sau `setSettingsStatus`

**Interfaces:**
- `settingsServiceCategoriesFromCatalog(source) -> Array<{id:string,name:string,services:Array}>`.
- `settingsServiceRowMarkup(service, index) -> string`.
- `settingsServiceCategoryMarkup(category, index) -> string`.
- `renderSettingsServiceCatalog(source, fallback) -> void`.
- Các hàm dùng `escapeHtml` hiện có.

- [ ] **Bước 1: Thêm hàm gom category fallback**

```js
function settingsServiceCategoriesFromCatalog(source) {
  if (source && Array.isArray(source.categories) && source.categories.length) return source.categories;

  var groups = {};
  (source && Array.isArray(source.services) ? source.services : []).filter(function(service) {
    return service && service.active !== false;
  }).forEach(function(service) {
    var name = service.requiredSkill || 'Other services';
    var id = 'fallback-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!groups[id]) groups[id] = { id: id, name: name, services: [] };
    groups[id].services.push(service);
  });
  return Object.keys(groups).map(function(id) { return groups[id]; });
}
```

- [ ] **Bước 2: Thêm row renderer đã escape dữ liệu**

`settingsServiceRowMarkup` phải dùng `escapeHtml` cho `id`, `name`, `icon`, `price` và `durationMin`, dùng chuỗi rỗng cho giá null, giữ `data-service-row` và tạo input class `settings-service-input`, `price`, `duration` cùng nút `data-service-remove`.

```js
function settingsServiceRowMarkup(service, index) {
  service = service || {};
  var price = service.price == null ? '' : service.price;
  var duration = service.durationMin == null ? 60 : service.durationMin;
  var tone = ['tone-violet', 'tone-cyan', 'tone-rose', 'tone-sky', 'tone-amber', 'tone-emerald'][index % 6];
  return '<div class="settings-service-row" data-service-row data-service-id="' + escapeHtml(service.id || '') + '">' +
    '<div class="settings-service-edit-grid">' +
      '<span class="settings-service-visual ' + tone + '" aria-hidden="true">' + escapeHtml(service.icon || '✨') + '</span>' +
      '<input class="settings-service-input" type="text" value="' + escapeHtml(service.name || 'Unnamed service') + '" aria-label="Service name">' +
      '<div class="settings-service-input-wrap"><span class="settings-service-prefix">$</span><input class="settings-service-input price" type="number" value="' + escapeHtml(price) + '" aria-label="Service price"></div>' +
      '<div class="settings-service-input-wrap"><input class="settings-service-input duration" type="number" value="' + escapeHtml(duration) + '" aria-label="Service duration"><span class="settings-service-suffix">min</span></div>' +
      '<button class="settings-service-remove" type="button" data-service-remove aria-label="Remove service">×</button>' +
    '</div>' +
  '</div>';
}
```

- [ ] **Bước 3: Thêm category renderer và renderer chính**

`settingsServiceCategoryMarkup` dùng `<details>`, mở category đầu tiên, tạo summary tên/count, header cột hiện tại và map toàn bộ service. `renderSettingsServiceCatalog` đặt trạng thái loading/error, render categories theo thứ tự JSON, cập nhật status khi fallback và không đụng vào các picker appointment.

```js
function settingsServiceCategoryMarkup(category, index) {
  var services = Array.isArray(category.services) ? category.services : [];
  return '<details class="settings-service-category" data-service-category data-service-category-id="' + escapeHtml(category.id || '') + '"' + (index === 0 ? ' open' : '') + '>' +
    '<summary class="settings-service-category-head"><span class="settings-service-category-name">' + escapeHtml(category.name || 'Other services') + '</span><span class="settings-service-category-count">' + services.length + '</span></summary>' +
    '<div class="settings-service-category-body"><div class="settings-service-header" aria-hidden="true"><span></span><span>Service</span><span>Price</span><span>Duration</span><span></span></div>' +
    services.map(function(service, serviceIndex) { return settingsServiceRowMarkup(service, index + serviceIndex); }).join('') + '</div></details>';
}

function renderSettingsServiceCatalog(source, fallback) {
  var container = document.querySelector('[data-settings-service-catalog]');
  if (!container) return;
  var categories = settingsServiceCategoriesFromCatalog(source);
  container.innerHTML = categories.length
    ? categories.map(settingsServiceCategoryMarkup).join('')
    : '<div class="settings-service-catalog-state">No services available.</div>';
  if (fallback) setSettingsStatus('Catalog JSON unavailable. Showing salon catalog services.');
}
```

- [ ] **Bước 4: Chạy test để xác nhận GREEN cho renderer contracts**

Run: `node --test html/pages/booking-book-phase-1.settings-services.test.mjs`

Expected: FAIL only for custom-category wiring if that function is not yet added; all loader/renderer/markup contracts must pass.

### Task 4: Nối loader và giữ thao tác thêm thủ công

**Files:**
- Modify: `html/pages/booking-book-phase-1.html` trong `loadBookingAppointmentServiceCatalog`, `addSettingsServiceRow` và click handler Settings

**Interfaces:**
- `settingsEnsureCustomCategory() -> HTMLElement` tạo category `CUSTOM SERVICES` nếu chưa có.
- `addSettingsServiceRow(name, price, duration) -> void` thêm row vào body của custom category.
- `loadBookingAppointmentServiceCatalog() -> void` render success hoặc fallback.

- [ ] **Bước 1: Tạo custom category khi người dùng thêm service**

`settingsEnsureCustomCategory` kiểm tra `[data-service-category-id="custom-services"]`; nếu thiếu, append category markup rỗng vào container, mở category và trả về `.settings-service-category-body`. Category này dùng cùng header cột và không có service hard-code.

- [ ] **Bước 2: Cập nhật `addSettingsServiceRow`**

Thay `document.querySelector('.settings-service-list')` bằng `settingsEnsureCustomCategory()`, tạo row với `settingsServiceRowMarkup({ id: 'custom-' + Date.now(), name, price: Number(price), durationMin: Number(duration), icon: '✨' }, rowIndex)`, append vào body và cập nhật count của category.

- [ ] **Bước 3: Nối success/fallback vào loader**

Trong `loadBookingAppointmentServiceCatalog`:

```js
function loadBookingAppointmentServiceCatalog() {
  var fallbackCatalog = { services: catalog.services };
  if (!appointmentServiceCatalogLoader || typeof appointmentServiceCatalogLoader.load !== 'function') {
    renderSettingsServiceCatalog(fallbackCatalog, true);
    return;
  }
  appointmentServiceCatalogLoader.load(APPOINTMENT_SERVICE_CATALOG_URL).then(function(nextCatalog) {
    appointmentServiceCatalog = nextCatalog;
    rebuildBookingCatalogViews();
    renderSettingsServiceCatalog(nextCatalog, false);
    if (bookingPanelMode) renderBookingAppointmentPanel();
    var createModal = document.querySelector('[data-booking-create-modal]');
    if (createModal && !createModal.hidden) populateBookingCreateForm();
  }).catch(function() {
    renderSettingsServiceCatalog(fallbackCatalog, true);
  });
}
```

- [ ] **Bước 4: Chạy test để xác nhận toàn bộ contract mới**

Run: `node --test html/pages/booking-book-phase-1.settings-services.test.mjs`

Expected: PASS với toàn bộ test trong file.

### Task 5: Kiểm tra regression và chất lượng thay đổi

**Files:**
- Modify only if a test exposes a regression: `html/pages/booking-book-phase-1.html`

- [ ] **Bước 1: Chạy test Settings và shared appointments**

Run: `node --test html/pages/booking-book-phase-1.settings-services.test.mjs html/pages/booking-book-phase-1.shared-appointments.test.mjs`

Expected: PASS, không có failure hoặc warning.

- [ ] **Bước 2: Kiểm tra cú pháp JavaScript**

Run: `node --check html/assets/appointment-service-catalog.js`

Expected: exit code 0.

- [ ] **Bước 3: Kiểm tra diff whitespace**

Run: `git diff --check`

Expected: không có output và exit code 0.

- [ ] **Bước 4: Kiểm tra diff chỉ chứa phạm vi yêu cầu**

Run: `git diff --stat && git status --short`

Expected: có thay đổi ở HTML và test mới; các thay đổi có sẵn của user ở file khác vẫn được giữ nguyên, không bị stage/ghi đè.

- [ ] **Bước 5: Commit implementation**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.settings-services.test.mjs
git commit -m "feat: render booking settings services by category"
```
