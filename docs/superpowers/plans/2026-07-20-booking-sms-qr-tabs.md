# Booking Hub SMS Campaigns and QR Codes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add complete, working SMS Campaigns and QR Codes tabs to Booking Hub using the content from `nexora-sms-dashboard.html` and the visual system from `booking-book-phase-1.html`.

**Architecture:** Keep the current single-file Booking Book architecture and shared `data-tab-target` controller. Add two native panels, extend the existing SMS composer IIFE so the overview and modal share one segment/credit state, and add an isolated QR IIFE that owns QR demo data and behavior. Scope all new CSS beneath `#panel-sms-campaigns`, `#panel-qr-codes`, or `#kioskOverlay`.

**Tech Stack:** Static HTML5, scoped CSS, vanilla JavaScript, Node.js built-in test runner, QRCode.js 1.0.0.

## Global Constraints

- Port every section, control, helper message, warning, table field, preview, and action belonging to source views `#view-sms` and `#view-qrcodes`.
- Reuse the complete SMS composer already present in the Booking Book page.
- Preserve `Booking Book` as the default tab.
- Use URL targets exactly `sms-campaigns` and `qr-codes`.
- Do not port the source dark theme, source sidebar, or unrelated source views.
- Do not add backend persistence, real SMS sending, or real QR publishing.
- Preserve unrelated working-tree changes and existing Booking Book behavior.

## File Structure

- Create `html/pages/booking-book-phase-1.sms-qr.test.mjs`: static contract tests for navigation, complete content parity, interaction hooks, and QR fallback.
- Modify `html/pages/booking-book-phase-1.html`: two navigation entries, two panel implementations, scoped responsive styles, SMS overview integration, QR behavior, QR kiosk overlay, and QRCode.js dependency.

---

### Task 1: Register both tabs in Booking Hub navigation

**Files:**
- Create: `html/pages/booking-book-phase-1.sms-qr.test.mjs`
- Modify: `html/pages/booking-book-phase-1.html` near the external assets in `<head>`, Booking Hub submenu, page tabs, and tab-content closing tag

**Interfaces:**
- Consumes: existing `activateMainTab(target, options)`, `getValidMainTab(target)`, and `[data-tab-target]`/`[data-tab-panel]` conventions.
- Produces: `panel-sms-campaigns`, `panel-qr-codes`, and direct URLs `?tab=sms-campaigns`/`?tab=qr-codes`.

- [ ] **Step 1: Write the failing navigation test**

Create the test file with this initial content:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const BOOKING_URL = new URL('./booking-book-phase-1.html', import.meta.url);

function source() {
  assert.ok(existsSync(BOOKING_URL), 'booking-book-phase-1.html must exist');
  return readFileSync(BOOKING_URL, 'utf8');
}

test('registers SMS Campaigns and QR Codes in both Booking Hub navigation surfaces', () => {
  const html = source();
  for (const [target, label] of [['sms-campaigns', 'SMS Campaigns'], ['qr-codes', 'QR Codes']]) {
    assert.equal((html.match(new RegExp(`data-tab-target="${target}"`, 'g')) || []).length, 2);
    assert.match(html, new RegExp(`data-tab-target="${target}"[^>]*aria-controls="panel-${target}"`));
    assert.match(html, new RegExp(`<span>${label}<\\/span>`));
    assert.match(html, new RegExp(`id="panel-${target}"[^>]*data-tab-panel="${target}"[^>]*role="tabpanel"`));
  }
  assert.match(html, /qrcodejs\/1\.0\.0\/qrcode\.min\.js/);
});

test('keeps shared tab and query-string synchronization for new targets', () => {
  const html = source();
  assert.match(html, /document\.querySelectorAll\('\[data-tab-target\]'\)/);
  assert.match(html, /url\.searchParams\.set\('tab', target\)/);
  assert.match(html, /var DEFAULT_MAIN_TAB = 'booking'/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test html/pages/booking-book-phase-1.sms-qr.test.mjs`

Expected: FAIL because `data-tab-target="sms-campaigns"` and `data-tab-target="qr-codes"` do not exist.

- [ ] **Step 3: Add the dependency, paired navigation buttons, and panel roots**

Add this script after the current external stylesheet links:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

Add these buttons after Call Log in both the Booking Hub submenu and `.page-tabs`; use the compact icon span already used by the surrounding buttons:

```html
<button class="nav-subitem" type="button" data-tab-target="sms-campaigns" aria-controls="panel-sms-campaigns">
  <span class="nav-subitem-dot" aria-hidden="true"></span>
  <span>SMS Campaigns</span>
</button>
<button class="nav-subitem" type="button" data-tab-target="qr-codes" aria-controls="panel-qr-codes">
  <span class="nav-subitem-dot" aria-hidden="true"></span>
  <span>QR Codes</span>
</button>
```

```html
<button class="page-tab" type="button" role="tab" aria-selected="false" data-tab-target="sms-campaigns" aria-controls="panel-sms-campaigns">
  <span class="page-tab-icon"><i class="bi bi-chat-dots" aria-hidden="true"></i></span>
  <span>SMS Campaigns</span>
</button>
<button class="page-tab" type="button" role="tab" aria-selected="false" data-tab-target="qr-codes" aria-controls="panel-qr-codes">
  <span class="page-tab-icon"><i class="bi bi-qr-code" aria-hidden="true"></i></span>
  <span>QR Codes</span>
</button>
```

Add these roots after `panel-calllog` and before `.tab-content` closes:

```html
<section class="tab-panel" id="panel-sms-campaigns" data-tab-panel="sms-campaigns" role="tabpanel" aria-label="SMS Campaigns panel"></section>
<section class="tab-panel" id="panel-qr-codes" data-tab-panel="qr-codes" role="tabpanel" aria-label="QR Codes panel"></section>
```

- [ ] **Step 4: Run the test and verify GREEN**

Run: `node --test html/pages/booking-book-phase-1.sms-qr.test.mjs`

Expected: 2 tests pass.

- [ ] **Step 5: Commit the navigation slice**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.sms-qr.test.mjs
git commit -m "feat: register Booking Hub SMS and QR tabs"
```

---

### Task 2: Port the complete SMS Campaigns view and connect the existing composer

**Files:**
- Modify: `html/pages/booking-book-phase-1.sms-qr.test.mjs`
- Modify: `html/pages/booking-book-phase-1.html` inside `panel-sms-campaigns`, before the existing composer CSS media rule, and inside the existing SMS composer IIFE

**Interfaces:**
- Consumes: existing `SEGMENTS`, `escapeHtml(s)`, `openComposer(segId)`, `updateCredits(newVal)`, and `window.openSmsCampaignComposer(opts)` inside the composer IIFE.
- Produces: `renderSmsCampaignCards()`, `[data-sms-campaign-grid]`, `[data-sms-segment]`, `[data-sms-campaign-new]`, `[data-sms-credits]`, and `[data-sms-credits-usd]`.

- [ ] **Step 1: Add failing SMS content-parity tests**

Append:

```js
test('ports the complete SMS Campaigns view and reuses the composer', () => {
  const html = source();
  for (const copy of [
    'Chọn nhóm khách → Soạn tin → Gửi hoặc hẹn giờ',
    'Tổng khách', '1,284', 'SMS đã gửi tháng này', '3,412',
    'Khách quay lại', '147', 'Revenue từ SMS', '$8,820',
    'Nhóm khách — Chọn để gửi campaign', 'Tạo Campaign Mới'
  ]) assert.ok(html.includes(copy), `missing SMS copy: ${copy}`);

  for (const segment of ['new', 'day15', 'day30', 'day60', 'vip', 'birthday']) {
    assert.match(html, new RegExp(`id: '${segment}'`));
  }

  assert.match(html, /data-sms-campaign-grid/);
  assert.match(html, /data-sms-campaign-new/);
  assert.match(html, /function renderSmsCampaignCards\(\)/);
  assert.match(html, /window\.openSmsCampaignComposer/);
  assert.match(html, /openComposer\(btn\.dataset\.smsSegment\)/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-name-pattern="complete SMS" html/pages/booking-book-phase-1.sms-qr.test.mjs`

Expected: FAIL with missing SMS copy or `data-sms-campaign-grid`.

- [ ] **Step 3: Replace the SMS panel root with the full source content**

Use this native Booking Book markup:

```html
<section class="tab-panel" id="panel-sms-campaigns" data-tab-panel="sms-campaigns" role="tabpanel" aria-label="SMS Campaigns panel">
  <div class="marketing-panel-head">
    <div>
      <h2>💬 SMS Campaigns</h2>
      <p>Chọn nhóm khách → Soạn tin → Gửi hoặc hẹn giờ</p>
    </div>
    <div class="marketing-panel-actions">
      <div class="sms-credit-pill">
        <span>SMS Credits</span>
        <strong data-sms-credits>847</strong>
        <small data-sms-credits-usd>≈ $21.18 remaining</small>
      </div>
      <button class="booking-primary-button" type="button" data-sms-campaign-new><i class="bi bi-stars" aria-hidden="true"></i> Tạo Campaign Mới</button>
    </div>
  </div>
  <div class="sms-campaign-stats">
    <article class="sms-stat-card cyan"><span>Tổng khách</span><strong>1,284</strong><small>↑ +23 tuần này</small></article>
    <article class="sms-stat-card violet"><span>SMS đã gửi tháng này</span><strong>3,412</strong><small>↑ +18% so tháng trước</small></article>
    <article class="sms-stat-card green"><span>Khách quay lại</span><strong>147</strong><small>↑ từ SMS tháng này</small></article>
    <article class="sms-stat-card orange"><span>Revenue từ SMS</span><strong>$8,820</strong><small>↑ avg $60/khách quay lại</small></article>
  </div>
  <div class="marketing-section-heading">
    <h3>Nhóm khách — Chọn để gửi campaign</h3>
  </div>
  <div class="sms-campaign-grid" data-sms-campaign-grid></div>
</section>
```

- [ ] **Step 4: Add scoped Booking Book styles for every SMS element**

Add a scoped block that implements these exact layout contracts:

```css
#panel-sms-campaigns { --cyan:#0891b2; --green:var(--nexora-success); --purple:var(--nexora-violet); --orange:var(--nexora-warning); --pink:#ec4899; }
#panel-sms-campaigns .marketing-panel-head,
#panel-qr-codes .marketing-panel-head { display:flex; justify-content:space-between; align-items:flex-start; gap:18px; margin-bottom:18px; }
#panel-sms-campaigns .marketing-panel-head h2,
#panel-qr-codes .marketing-panel-head h2 { margin:0; font-size:22px; line-height:1.2; }
#panel-sms-campaigns .marketing-panel-head p,
#panel-qr-codes .marketing-panel-head p { margin:6px 0 0; color:var(--nexora-muted); font-size:13px; line-height:1.55; }
#panel-sms-campaigns .marketing-panel-actions { display:flex; align-items:stretch; gap:10px; }
#panel-sms-campaigns .sms-credit-pill { display:grid; grid-template-columns:auto auto; gap:2px 10px; min-width:170px; border:1px solid var(--nexora-border); border-radius:12px; background:#fff; padding:9px 12px; box-shadow:var(--nexora-card-shadow); }
#panel-sms-campaigns .sms-credit-pill span { color:var(--nexora-subtle); font-size:10px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }
#panel-sms-campaigns .sms-credit-pill strong { grid-row:1 / 3; grid-column:2; align-self:center; color:var(--nexora-brand); font-size:20px; }
#panel-sms-campaigns .sms-credit-pill small { color:var(--nexora-muted); font-size:10px; }
#panel-sms-campaigns .sms-campaign-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-bottom:24px; }
#panel-sms-campaigns .sms-stat-card,
#panel-sms-campaigns .sms-campaign-card { position:relative; overflow:hidden; border:1px solid var(--nexora-border); border-radius:12px; background:#fff; box-shadow:var(--nexora-card-shadow); }
#panel-sms-campaigns .sms-stat-card { padding:16px; }
#panel-sms-campaigns .sms-stat-card::before,
#panel-sms-campaigns .sms-campaign-card::before { content:""; position:absolute; inset:0 0 auto; height:3px; background:var(--card-accent,var(--nexora-brand)); }
#panel-sms-campaigns .sms-stat-card span { display:block; color:var(--nexora-muted); font-size:11px; font-weight:700; }
#panel-sms-campaigns .sms-stat-card strong { display:block; margin:7px 0 3px; color:var(--card-accent,var(--nexora-brand)); font-size:25px; }
#panel-sms-campaigns .sms-stat-card small { color:var(--nexora-subtle); font-size:10px; }
#panel-sms-campaigns .sms-stat-card.cyan { --card-accent:#0891b2; }
#panel-sms-campaigns .sms-stat-card.violet { --card-accent:var(--nexora-violet); }
#panel-sms-campaigns .sms-stat-card.green { --card-accent:var(--nexora-success); }
#panel-sms-campaigns .sms-stat-card.orange { --card-accent:var(--nexora-warning); }
#panel-sms-campaigns .marketing-section-heading h3 { margin:0 0 12px; font-size:14px; }
#panel-sms-campaigns .sms-campaign-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
#panel-sms-campaigns .sms-campaign-card { width:100%; padding:17px; color:var(--nexora-text); text-align:left; transition:.2s ease; }
#panel-sms-campaigns .sms-campaign-card:hover { border-color:rgba(70,72,216,.5); transform:translateY(-2px); }
#panel-sms-campaigns .sms-campaign-icon { margin-bottom:9px; color:var(--nexora-brand); font-size:22px; }
#panel-sms-campaigns .sms-campaign-name { font-size:14px; font-weight:800; }
#panel-sms-campaigns .sms-campaign-desc { min-height:54px; margin:5px 0 13px; color:var(--nexora-muted); font-size:11px; line-height:1.55; }
#panel-sms-campaigns .sms-campaign-meta { display:flex; justify-content:space-between; align-items:end; gap:10px; }
#panel-sms-campaigns .sms-campaign-count { color:#0891b2; font-size:19px; font-weight:800; }
#panel-sms-campaigns .sms-campaign-count-label { color:var(--nexora-subtle); font-size:9px; }
#panel-sms-campaigns .sms-campaign-badge { border-radius:999px; background:var(--nexora-surface-muted); padding:4px 8px; color:var(--nexora-muted); font-size:9px; font-weight:800; }
@media (max-width:900px) { #panel-sms-campaigns .sms-campaign-stats { grid-template-columns:repeat(2,minmax(0,1fr)); } #panel-sms-campaigns .sms-campaign-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:600px) { #panel-sms-campaigns .marketing-panel-head { flex-direction:column; } #panel-sms-campaigns .marketing-panel-actions { width:100%; flex-direction:column; } #panel-sms-campaigns .sms-campaign-stats, #panel-sms-campaigns .sms-campaign-grid { grid-template-columns:1fr; } }
```

- [ ] **Step 5: Render segment cards from the existing data and wire all source entry points**

Inside the existing composer IIFE, add and call:

```js
function renderSmsCampaignCards() {
  const grid = document.querySelector('[data-sms-campaign-grid]');
  if (!grid) return;
  grid.innerHTML = SEGMENTS.map(function(s) {
    return '<button class="sms-campaign-card" type="button" data-sms-segment="' + s.id + '" style="--card-accent:' + s.accent + '">' +
      '<span class="sms-campaign-icon">' + s.icon + '</span>' +
      '<span class="sms-campaign-name">' + escapeHtml(s.name) + '</span>' +
      '<span class="sms-campaign-desc">' + escapeHtml(s.desc) + '</span>' +
      '<span class="sms-campaign-meta"><span><span class="sms-campaign-count">' + s.count + '</span><span class="sms-campaign-count-label">' + escapeHtml(s.countLabel) + '</span></span>' +
      '<span class="sms-campaign-badge">' + escapeHtml(s.badgeText) + '</span></span></button>';
  }).join('');
}

document.querySelectorAll('[data-sms-campaign-new]').forEach(function(btn) {
  btn.addEventListener('click', function() { openComposer('new'); });
});
const smsCampaignGrid = document.querySelector('[data-sms-campaign-grid]');
if (smsCampaignGrid) smsCampaignGrid.addEventListener('click', function(event) {
  const btn = event.target.closest('[data-sms-segment]');
  if (btn) openComposer(btn.dataset.smsSegment);
});

renderSmsCampaignCards();
updateCredits(state.credits);
```

Replace `updateCredits` with the multi-surface version:

```js
function updateCredits(newVal) {
  state.credits = newVal;
  document.querySelectorAll('[data-sms-credits]').forEach(function(el) {
    el.textContent = newVal.toLocaleString();
    el.classList.toggle('low', newVal < 100);
  });
  document.querySelectorAll('[data-sms-credits-usd]').forEach(function(el) {
    el.textContent = `≈ $${(newVal * PRICE_PER_SMS).toFixed(2)} remaining`;
  });
}
```

- [ ] **Step 6: Run the focused and full new test**

Run: `node --test --test-name-pattern="complete SMS" html/pages/booking-book-phase-1.sms-qr.test.mjs`

Expected: 1 test passes.

Run: `node --test html/pages/booking-book-phase-1.sms-qr.test.mjs`

Expected: all current tests pass.

- [ ] **Step 7: Commit the SMS slice**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.sms-qr.test.mjs
git commit -m "feat: add Booking Hub SMS Campaigns content"
```

---

### Task 3: Port the complete QR Codes content and Booking Book styling

**Files:**
- Modify: `html/pages/booking-book-phase-1.sms-qr.test.mjs`
- Modify: `html/pages/booking-book-phase-1.html` inside `panel-qr-codes`, alongside the scoped marketing styles, and after the current modal markup

**Interfaces:**
- Consumes: source markup between `<!-- ===== QR CODES VIEW ===== -->` and `<!-- ===== DASHBOARD VIEW ===== -->` in `nexora-sms-dashboard.html`.
- Produces: IDs `qrGuideBtn`, `publishQrBtn`, `qrGuide`, `qrName`, `qrPromo`, `qrFormTitle`, `qrQuestion`, `qrSlug`, `qrLinkPreview`, `qrCanvas`, `qrDownloadBtn`, `qrPrintBtn`, `kioskBtn`, `verifyInput`, `verifyBtn`, `verifyResult`, `qrLeadsBody`, `qrPreviewUrl`, `qrIframe`, `kioskOverlay`, `kioskExit`, and `kioskIframe`.

- [ ] **Step 1: Add failing complete-content tests**

Append:

```js
test('ports every QR Codes section and its kiosk surface', () => {
  const html = source();
  for (const id of [
    'qrGuideBtn', 'publishQrBtn', 'qrGuide', 'qrName', 'qrPromo',
    'qrFormTitle', 'qrQuestion', 'qrSlug', 'qrLinkPreview', 'qrCanvas',
    'qrDownloadBtn', 'qrPrintBtn', 'kioskBtn', 'verifyInput', 'verifyBtn',
    'verifyResult', 'qrLeadsBody', 'qrPreviewUrl', 'qrIframe',
    'kioskOverlay', 'kioskExit', 'kioskIframe'
  ]) assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);

  for (const copy of [
    'Khách scan → điền tên + SĐT → nhận mã qua SMS → AI voice chào đúng tên khi gọi',
    'Bước 1 — Chủ tiệm setup', 'Bước 2 — Khách scan', 'Bước 3 — Nhân viên tại quầy',
    '3 lỗi hay gặp', 'Chương trình khuyến mãi', 'Form khách điền',
    'Checkbox đồng ý nhận SMS', 'Link & Mã QR', 'Verify code tại quầy',
    'Leads đã thu từ QR này', 'Promotion Code', 'Chế độ Kiosk'
  ]) assert.ok(html.includes(copy), `missing QR copy: ${copy}`);
});
```

- [ ] **Step 2: Run the QR content test and verify RED**

Run: `node --test --test-name-pattern="every QR Codes section" html/pages/booking-book-phase-1.sms-qr.test.mjs`

Expected: FAIL on the first missing QR control.

- [ ] **Step 3: Port all QR view markup without omissions**

Copy the complete inner content of source `#view-qrcodes` into `#panel-qr-codes`. Remove only the source `.topbar` and `.content` shell wrappers; retain all guide steps 1–8, the three-error warning, all four form sections, every button, the five-column leads table, and the preview iframe. Replace the removed shell with:

```html
<div class="marketing-panel-head">
  <div>
    <h2>🔳 QR Codes</h2>
    <p>Khách scan → điền tên + SĐT → nhận mã qua SMS → AI voice chào đúng tên khi gọi</p>
  </div>
  <div class="qr-head-actions">
    <button class="booking-secondary-button" type="button" id="qrGuideBtn">📖 Ẩn hướng dẫn</button>
    <button class="booking-primary-button" type="button" id="publishQrBtn">🚀 Publish QR</button>
  </div>
</div>
```

Keep the source IDs exactly as listed in **Produces**. Apply these class mappings: `lp-builder` → `qr-builder`, `lp-form` → `qr-form-stack`, `lp-section` → `qr-section`, `lp-section-title` → `qr-section-title`, `field-group` → `qr-field`, `field-label` → `qr-field-label`, `lp-preview` → `qr-preview`, `dash-table` → `booking-table qr-leads-table`, and `form-input`/`form-select`/`form-textarea` → `booking-input`. Change source generic button classes to `booking-primary-button` and `booking-secondary-button`. Preserve all IDs, values, and the TCPA notice text verbatim.

Add the complete kiosk surface after `#nx-campaign-root`:

```html
<div class="kiosk-overlay" id="kioskOverlay" aria-hidden="true">
  <div class="kiosk-bar">
    <span class="kiosk-hint">🖥 Chế độ Kiosk — đặt tablet tại quầy, form tự reset sau mỗi khách</span>
    <button class="booking-secondary-button" type="button" id="kioskExit">✕ Thoát Kiosk</button>
  </div>
  <iframe id="kioskIframe" title="Kiosk đăng ký nhận ưu đãi"></iframe>
</div>
```

- [ ] **Step 4: Add scoped QR styles using Booking Book tokens**

Implement the following layout and state contracts, keeping every selector under `#panel-qr-codes` except the isolated kiosk overlay:

```css
#panel-qr-codes .qr-head-actions { display:flex; flex-wrap:wrap; gap:8px; }
#panel-qr-codes .guide-panel,
#panel-qr-codes .qr-section { border:1px solid var(--nexora-border); border-radius:12px; background:#fff; padding:18px; box-shadow:var(--nexora-card-shadow); }
#panel-qr-codes .guide-panel { margin-bottom:16px; }
#panel-qr-codes .guide-cols { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
#panel-qr-codes .guide-phase-title { margin-bottom:11px; color:var(--nexora-brand); font-size:10px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
#panel-qr-codes .guide-step { display:flex; gap:9px; margin-bottom:9px; color:var(--nexora-muted); font-size:11px; line-height:1.55; }
#panel-qr-codes .guide-num { display:grid; width:22px; height:22px; flex:0 0 22px; place-items:center; border-radius:50%; background:rgba(70,72,216,.1); color:var(--nexora-brand); font-size:10px; font-weight:900; }
#panel-qr-codes .guide-num.c2 { background:rgba(8,145,178,.1); color:#0891b2; }
#panel-qr-codes .guide-num.c3 { background:rgba(0,184,115,.1); color:var(--nexora-success); }
#panel-qr-codes .guide-tips { border-top:1px solid var(--nexora-rule); margin-top:12px; padding-top:12px; color:var(--nexora-muted); font-size:10px; line-height:1.65; }
#panel-qr-codes .qr-builder { display:grid; grid-template-columns:minmax(0,1fr) minmax(320px,.85fr); gap:16px; align-items:start; }
#panel-qr-codes .qr-form-stack { display:grid; gap:14px; }
#panel-qr-codes .qr-section-title { margin-bottom:13px; font-size:13px; font-weight:900; }
#panel-qr-codes .qr-field { display:grid; gap:6px; margin-bottom:12px; }
#panel-qr-codes .qr-field:last-child { margin-bottom:0; }
#panel-qr-codes .qr-field-label { margin-bottom:6px; color:var(--nexora-muted); font-size:10px; font-weight:800; }
#panel-qr-codes textarea.booking-input { min-height:105px; resize:vertical; }
#panel-qr-codes .consent-note { margin-top:10px; border:1px solid rgba(245,158,11,.3); border-radius:9px; background:rgba(245,158,11,.07); padding:10px 12px; color:#9a5a00; font-size:10px; line-height:1.55; }
#panel-qr-codes .link-preview { margin-top:7px; border-radius:8px; background:var(--nexora-surface-muted); padding:9px 11px; color:var(--nexora-brand); font-family:monospace; font-size:10px; overflow-wrap:anywhere; }
#panel-qr-codes .qr-display-row { display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-top:12px; }
#panel-qr-codes .qr-box { display:grid; min-width:168px; min-height:168px; place-items:center; border:1px solid var(--nexora-border); border-radius:12px; background:#fff; padding:13px; }
#panel-qr-codes .qr-box img, #panel-qr-codes .qr-box canvas { display:block; }
#panel-qr-codes .qr-fallback { max-width:145px; color:var(--nexora-muted); font-size:10px; text-align:center; }
#panel-qr-codes .qr-actions { display:grid; gap:8px; }
#panel-qr-codes .lead-flow-note { color:var(--nexora-muted); font-size:10px; line-height:1.55; }
#panel-qr-codes .verify-row { display:flex; gap:9px; }
#panel-qr-codes .verify-row .booking-input { flex:1; min-width:0; font-family:monospace; letter-spacing:.08em; text-transform:uppercase; }
#panel-qr-codes .verify-result { display:none; margin-top:11px; border-radius:9px; padding:12px; font-size:11px; line-height:1.55; }
#panel-qr-codes .verify-result.show { display:block; }
#panel-qr-codes .verify-result.ok { border:1px solid rgba(0,184,115,.35); background:rgba(0,184,115,.07); }
#panel-qr-codes .verify-result.used { border:1px solid rgba(245,158,11,.35); background:rgba(245,158,11,.07); color:#9a5a00; }
#panel-qr-codes .verify-result.bad { border:1px solid rgba(220,38,38,.3); background:rgba(220,38,38,.06); color:#b91c1c; }
#panel-qr-codes .call-status { display:inline-flex; border-radius:999px; padding:4px 8px; font-size:9px; font-weight:800; white-space:nowrap; }
#panel-qr-codes .call-status.call-answered { background:rgba(0,184,115,.1); color:var(--nexora-success); }
#panel-qr-codes .call-status.call-booked { background:rgba(245,158,11,.1); color:#9a5a00; }
#panel-qr-codes .qr-preview { position:sticky; top:86px; overflow:hidden; min-height:650px; border:1px solid var(--nexora-border); border-radius:12px; background:#fff; box-shadow:var(--nexora-card-shadow); }
#panel-qr-codes .preview-bar { display:flex; align-items:center; gap:6px; border-bottom:1px solid var(--nexora-rule); padding:9px 11px; background:var(--nexora-surface-muted); }
#panel-qr-codes .preview-dot { width:8px; height:8px; border-radius:50%; }
#panel-qr-codes .preview-url { flex:1; overflow:hidden; color:var(--nexora-muted); font-family:monospace; font-size:9px; text-overflow:ellipsis; white-space:nowrap; }
#panel-qr-codes .qr-preview iframe { width:100%; min-height:610px; border:0; }
.kiosk-overlay { position:fixed; inset:0; z-index:200; display:none; flex-direction:column; background:#0b1220; }
.kiosk-overlay.open { display:flex; }
.kiosk-overlay .kiosk-bar { display:flex; justify-content:space-between; align-items:center; gap:12px; border-bottom:1px solid rgba(255,255,255,.14); padding:10px 14px; }
.kiosk-overlay .kiosk-hint { color:#dbe5f4; font-size:11px; }
.kiosk-overlay iframe { width:100%; flex:1; border:0; }
@media (max-width:980px) { #panel-qr-codes .guide-cols, #panel-qr-codes .qr-builder { grid-template-columns:1fr; } #panel-qr-codes .qr-preview { position:static; } }
@media (max-width:767px) { #panel-qr-codes .qr-leads-table td:nth-child(1)::before { content:"Thời gian"; } #panel-qr-codes .qr-leads-table td:nth-child(2)::before { content:"Tên khách"; } #panel-qr-codes .qr-leads-table td:nth-child(3)::before { content:"Điện thoại"; } #panel-qr-codes .qr-leads-table td:nth-child(4)::before { content:"Promotion Code"; } #panel-qr-codes .qr-leads-table td:nth-child(5)::before { content:"Trạng thái"; } }
@media (max-width:600px) { #panel-qr-codes .marketing-panel-head { flex-direction:column; } #panel-qr-codes .qr-head-actions, #panel-qr-codes .qr-head-actions button { width:100%; } #panel-qr-codes .verify-row { flex-direction:column; } }
```

- [ ] **Step 5: Run the QR content test and verify GREEN**

Run: `node --test --test-name-pattern="every QR Codes section" html/pages/booking-book-phase-1.sms-qr.test.mjs`

Expected: 1 test passes.

- [ ] **Step 6: Commit the QR content slice**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.sms-qr.test.mjs
git commit -m "feat: add complete Booking Hub QR content"
```

---

### Task 4: Port every QR demo interaction and fallback

**Files:**
- Modify: `html/pages/booking-book-phase-1.sms-qr.test.mjs`
- Modify: `html/pages/booking-book-phase-1.html` before the final `window.NEXORA_SHELL` script

**Interfaces:**
- Consumes: the QR element IDs from Task 3 and global `QRCode` when the CDN succeeds.
- Produces: isolated functions `qrUrl`, `renderQrPromoOptions`, `renderQrCode`, `renderQrLeads`, `verifyCode`, `markCodeUsed`, `buildQrPageHtml`, `updateQrPreview`, `openKiosk`, `printPoster`, and `refreshQr` inside one IIFE.

- [ ] **Step 1: Add failing QR behavior tests**

Append:

```js
test('ports QR generation, preview, verification, download, print, kiosk, and publish behavior', () => {
  const html = source();
  for (const fn of [
    'qrUrl', 'renderQrPromoOptions', 'renderQrCode', 'renderQrLeads',
    'verifyCode', 'markCodeUsed', 'buildQrPageHtml', 'updateQrPreview',
    'openKiosk', 'printPoster', 'refreshQr'
  ]) assert.match(html, new RegExp(`function ${fn}\\(`), `missing ${fn}`);

  assert.match(html, /typeof QRCode === 'undefined'/);
  assert.match(html, /Không tải được thư viện QR/);
  assert.match(html, /QR_PROMOS = \[/);
  assert.match(html, /QR_LEADS = \[/);
  assert.match(html, /qrGuideBtn.*addEventListener/s);
  assert.match(html, /qrDownloadBtn.*addEventListener/s);
  assert.match(html, /qrPrintBtn.*addEventListener/s);
  assert.match(html, /kioskBtn.*addEventListener/s);
  assert.match(html, /publishQrBtn.*addEventListener/s);
  assert.match(html, /verifyInput.*keydown/s);
  assert.match(html, /Reply STOP để hủy, HELP để được hỗ trợ/);
  assert.match(html, /Text Me My Promotion Code/);
});
```

- [ ] **Step 2: Run the QR behavior test and verify RED**

Run: `node --test --test-name-pattern="QR generation" html/pages/booking-book-phase-1.sms-qr.test.mjs`

Expected: FAIL because `qrUrl` and the other QR functions are absent.

- [ ] **Step 3: Port the complete source QR behavior into an isolated IIFE**

Copy the exact contiguous source behavior block beginning with `const QR_PROMOS = [` and ending with the closing brace of `refreshQr()` from `nexora-sms-dashboard.html`. Place it inside this wrapper, immediately after `escapeQrHtml` and before the event wiring shown below:

```js
(function initQrCodesPanel() {
  'use strict';
  const byId = function(id) { return document.getElementById(id); };
  const panel = byId('panel-qr-codes');
  if (!panel) return;

  function escapeQrHtml(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char];
    });
  }
```

Apply these mechanical substitutions within that copied block: `$(` → `byId(`, `escapeHtml` → `escapeQrHtml`, and inline `color:var(--cyan)` → `color:var(--nexora-electric)`. Keep all five `QR_PROMOS`, all four `QR_LEADS`, the full VI/EN I18N object, phone masking, TCPA validation, success state, optional booking form, kiosk auto-reset, poster HTML, QR fallback, and all eleven function bodies. Then append this event wiring and close the IIFE:

```js
  byId('qrGuideBtn').addEventListener('click', function() {
    const guide = byId('qrGuide');
    const hidden = guide.hidden;
    guide.hidden = !hidden;
    this.textContent = hidden ? '📖 Ẩn hướng dẫn' : '📖 Hướng dẫn';
  });
  byId('verifyBtn').addEventListener('click', verifyCode);
  byId('verifyInput').addEventListener('keydown', function(event) { if (event.key === 'Enter') verifyCode(); });
  byId('verifyResult').addEventListener('click', function(event) {
    const button = event.target.closest('[data-code]');
    if (button) markCodeUsed(button.dataset.code);
  });
  ['qrName', 'qrFormTitle', 'qrQuestion'].forEach(function(id) { byId(id).addEventListener('input', updateQrPreview); });
  byId('qrSlug').addEventListener('input', refreshQr);
  byId('qrPromo').addEventListener('change', function(event) {
    qrState.promo = QR_PROMOS.find(function(promo) { return promo.id === event.target.value; }) || QR_PROMOS[0];
    updateQrPreview();
  });
  byId('qrDownloadBtn').addEventListener('click', function() {
    const image = byId('qrCanvas').querySelector('img, canvas');
    if (!image) { alert('QR chưa render — kiểm tra kết nối mạng.'); return; }
    const link = document.createElement('a');
    link.href = image.tagName === 'CANVAS' ? image.toDataURL('image/png') : image.src;
    link.download = 'qr-' + (byId('qrSlug').value.trim() || 'nexora') + '.png';
    link.click();
  });
  byId('qrPrintBtn').addEventListener('click', printPoster);
  byId('kioskBtn').addEventListener('click', openKiosk);
  byId('kioskExit').addEventListener('click', function() { byId('kioskOverlay').classList.remove('open'); });
  byId('publishQrBtn').addEventListener('click', function() {
    alert('🚀 QR đã publish!\n\n' + byId('qrName').value + '\nKhuyến mãi: ' + qrState.promo.label + '\nLink: https://' + qrUrl() + '\n\nTải PNG và in đặt tại quầy. Leads sẽ đổ về tab Customers.');
  });

  renderQrPromoOptions();
  renderQrLeads();
  refreshQr();
})();
```

- [ ] **Step 4: Run the QR behavior test and verify GREEN**

Run: `node --test --test-name-pattern="QR generation" html/pages/booking-book-phase-1.sms-qr.test.mjs`

Expected: 1 test passes.

- [ ] **Step 5: Check extracted inline JavaScript syntax**

Run:

```bash
node -e "const fs=require('fs'),vm=require('vm'); const html=fs.readFileSync('html/pages/booking-book-phase-1.html','utf8'); const scripts=[...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].map(m=>m[1]).filter(Boolean); scripts.forEach((code,index)=>new vm.Script(code,{filename:'inline-'+index+'.js'})); console.log('inline scripts parse:',scripts.length)"
```

Expected: prints `inline scripts parse:` followed by a positive number and exits 0.

- [ ] **Step 6: Commit the QR behavior slice**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-book-phase-1.sms-qr.test.mjs
git commit -m "feat: add Booking Hub QR interactions"
```

---

### Task 5: Regression and visual verification

**Files:**
- Verify: `html/pages/booking-book-phase-1.html`
- Verify: `html/pages/booking-book-phase-1.sms-qr.test.mjs`
- Verify: `html/pages/community.test.mjs`
- Verify: `html/pages/staff-app.test.mjs`
- Verify: `html/pages/w9-form.test.mjs`

**Interfaces:**
- Consumes: completed HTML, CSS, and JavaScript from Tasks 1–4.
- Produces: a verified feature with no additional API.

- [ ] **Step 1: Run focused and neighboring page tests**

Run:

```bash
node --test html/pages/booking-book-phase-1.sms-qr.test.mjs html/pages/community.test.mjs html/pages/staff-app.test.mjs html/pages/w9-form.test.mjs
```

Expected: every test passes with zero failures.

- [ ] **Step 2: Check whitespace and accidental unrelated changes**

Run: `git diff --check`

Expected: no output.

Run: `git status --short`

Expected: only known user-owned unrelated changes remain; the two feature files are clean after the task commits.

- [ ] **Step 3: Inspect both responsive layouts in a browser**

Open `html/pages/booking-book-phase-1.html?tab=sms-campaigns` and `html/pages/booking-book-phase-1.html?tab=qr-codes` at desktop width and a 390px mobile viewport. Verify:

- both sidebar entries and page tabs activate the same panel;
- seven page tabs wrap without horizontal overflow;
- all SMS stats and six segment cards are visible;
- every SMS entry point opens the existing composer with the correct segment;
- all QR guide text, fields, controls, leads columns, and preview are visible;
- QR fallback remains readable with the CDN blocked;
- valid, used, invalid, and empty verification paths render correctly;
- guide toggle, PNG download, poster print, kiosk open/close, and publish demo work;
- Booking Book, Customers, Call Log, Plans, and Salon Settings still activate normally.

- [ ] **Step 4: Record final repository evidence**

Run: `git log -4 --oneline`

Expected: the four feature commits from Tasks 1–4 appear after the documentation commits, with no commit containing unrelated user files.
