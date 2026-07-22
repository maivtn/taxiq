# VMM USDV Conversion Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect `Get more VMM` to a self-contained USDV-to-VMM conversion modal in the VMM embed prototype.

**Architecture:** Extend the existing single-file prototype. Reuse the existing modal and history patterns, keep conversion state local to the current IIFE, and update the existing VMM balance/history render paths after a successful demo conversion.

**Tech Stack:** Standalone HTML, scoped CSS, vanilla JavaScript, SweetAlert2 CDN already used by the file.

## Global Constraints

- Use the dedicated prototype rate `1 VMM = 0.00229 USDV`.
- Calculate received VMM as `USDV amount / 0.00229`.
- Keep the conversion flow demo-only: no API, authentication, server ledger, persistence, live rate, fees, or date enforcement.
- Keep the existing page layout and all existing deposit behavior unchanged.
- Use `Aug 07, 2026 – Aug 31, 2026` for the conversion-period reminder.
- Success feedback must be manual-close only and include the generated transaction code.

---

### Task 1: Add the conversion modal UI and styles

**Files:**
- Modify: `html/vmm3y/vmm-3-year-program-embed-tabs.html:660-850` for modal styles.
- Modify: `html/vmm3y/vmm-3-year-program-embed-tabs.html:1060-1145` for modal markup.

**Interfaces:**
- Consumes: Existing `.vmm-modal-backdrop`, `.vmm-modal`, `.vmm-modal-head`, `.vmm-modal-body`, `.vmm-modal-foot`, `.vmm-btn`, and `.vmm-close` styles.
- Produces: A `#convertModal` modal containing `#usdvBalance`, `#conversionRate`, `#convertAmount`, `#convertPreview`, `#convertValidation`, `#cancelConversion`, and `#confirmConversion`.

- [ ] **Step 1: Add conversion-specific style rules**

Add these rules near the existing modal styles:

```css
.vmm-conversion-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.vmm-conversion-stat,
.vmm-conversion-preview {
  padding: 14px;
  border: 1px solid var(--vmm-line);
  border-radius: 14px;
  background: #f1f6fd;
}

.vmm-conversion-stat span,
.vmm-conversion-preview span {
  display: block;
  color: var(--vmm-muted);
  font-size: 12px;
}

.vmm-conversion-stat strong,
.vmm-conversion-preview strong {
  display: block;
  margin-top: 5px;
  color: var(--vmm-text);
  font-size: 17px;
}

.vmm-conversion-label {
  display: block;
  margin-bottom: 8px;
  color: var(--vmm-text);
  font-size: 13px;
  font-weight: 800;
}

.vmm-conversion-input {
  width: 100%;
  min-height: 46px;
  padding: 0 13px;
  border: 1px solid #b9cce5;
  border-radius: 11px;
  color: var(--vmm-text);
  background: #ffffff;
  outline: none;
}

.vmm-conversion-input:focus {
  border-color: var(--vmm-blue);
  box-shadow: 0 0 0 3px rgba(47,100,220,.12);
}

.vmm-conversion-help {
  margin: 7px 0 0;
  color: var(--vmm-muted);
  font-size: 12px;
}

.vmm-conversion-validation {
  min-height: 18px;
  margin: 7px 0 0;
  color: var(--vmm-danger);
  font-size: 12px;
}

@media (max-width: 640px) {
  .vmm-conversion-summary {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Add the modal markup**

Insert the following sibling of `#termsModal` inside `#vmm-program-root`:

```html
<div class="vmm-modal-backdrop" id="convertModal" aria-hidden="true">
  <section class="vmm-modal" role="dialog" aria-modal="true" aria-labelledby="convertTitle">
    <div class="vmm-modal-head">
      <h3 id="convertTitle">Đổi USDV sang VMM</h3>
      <button class="vmm-close" type="button" data-close-convert aria-label="Đóng">×</button>
    </div>

    <div class="vmm-modal-body">
      <div class="vmm-conversion-summary">
        <div class="vmm-conversion-stat">
          <span>Số dư USDV khả dụng</span>
          <strong id="usdvBalance">0 USDV</strong>
        </div>
        <div class="vmm-conversion-stat">
          <span>Tỷ giá chương trình</span>
          <strong id="conversionRate">1 VMM = 0.00229 USDV</strong>
        </div>
      </div>

      <label class="vmm-conversion-label" for="convertAmount">Số USDV muốn đổi</label>
      <input class="vmm-conversion-input" id="convertAmount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Nhập số USDV" />
      <p class="vmm-conversion-help">Áp dụng từ Aug 07, 2026 – Aug 31, 2026.</p>
      <p class="vmm-conversion-validation" id="convertValidation" role="alert"></p>

      <div class="vmm-conversion-preview">
        <span>VMM dự kiến nhận</span>
        <strong id="convertPreview">0 VMM</strong>
      </div>
    </div>

    <div class="vmm-modal-foot">
      <button class="vmm-btn vmm-btn-ghost" type="button" data-close-convert>Hủy</button>
      <button class="vmm-btn vmm-btn-more" type="button" id="confirmConversion" disabled>Xác nhận đổi</button>
    </div>
  </section>
</div>
```

- [ ] **Step 3: Check the new markup**

Run:

```bash
rg -n -- "convertModal|convertAmount|convertPreview|confirmConversion" html/vmm3y/vmm-3-year-program-embed-tabs.html
```

Expected: each required ID appears in the modal markup and no existing terms modal IDs are changed.

---

### Task 2: Wire conversion state, validation, and history

**Files:**
- Modify: `html/vmm3y/vmm-3-year-program-embed-tabs.html:1120-1320` inside the existing JavaScript IIFE.

**Interfaces:**
- Consumes: The modal IDs from Task 1, existing `walletBalance`, `updateBalances()`, `formatDate()`, and `historyList`.
- Produces: `openConversion()`, `closeConversion()`, `renderConversionState()`, `addConversionHistoryItem()`, and `completeConversion()` behavior.

- [ ] **Step 1: Add prototype conversion constants and element references**

Add after the existing balance state:

```js
let usdvBalance = 1000000;
const conversionRate = 0.00229;
```

Add with the other element references:

```js
const convertModal = root.querySelector('#convertModal');
const usdvBalanceLabel = root.querySelector('#usdvBalance');
const convertAmount = root.querySelector('#convertAmount');
const convertPreview = root.querySelector('#convertPreview');
const convertValidation = root.querySelector('#convertValidation');
const confirmConversion = root.querySelector('#confirmConversion');
```

- [ ] **Step 2: Add conversion render and modal helpers**

Implement the following functions:

```js
function formatConversionAmount(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2
  }).format(value);
}

function renderConversionState() {
  usdvBalanceLabel.textContent = `${formatConversionAmount(usdvBalance)} USDV`;
  convertPreview.textContent = '0 VMM';
  convertValidation.textContent = '';
  convertAmount.value = '';
  confirmConversion.disabled = true;
}

function openConversion() {
  renderConversionState();
  convertModal.classList.add('is-open');
  convertModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  convertAmount.focus();
}

function closeConversion() {
  convertModal.classList.remove('is-open');
  convertModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
```

- [ ] **Step 3: Add input validation and preview calculation**

Implement the input handler with this exact behavior:

```js
function updateConversionPreview() {
  const amount = Number(convertAmount.value);
  const valid = Number.isFinite(amount) && amount > 0 && amount <= usdvBalance;

  if (!convertAmount.value || !Number.isFinite(amount) || amount <= 0) {
    convertValidation.textContent = 'Nhập số USDV lớn hơn 0.';
    convertPreview.textContent = '0 VMM';
    confirmConversion.disabled = true;
    return;
  }

  if (amount > usdvBalance) {
    convertValidation.textContent = 'Số dư USDV không đủ.';
    convertPreview.textContent = '0 VMM';
    confirmConversion.disabled = true;
    return;
  }

  const vmmAmount = amount / conversionRate;
  convertValidation.textContent = '';
  convertPreview.textContent = `${formatConversionAmount(vmmAmount)} VMM`;
  confirmConversion.disabled = !valid;
}
```

Attach it with:

```js
convertAmount.addEventListener('input', updateConversionPreview);
```

- [ ] **Step 4: Add conversion history and completion behavior**

Implement `addConversionHistoryItem(amount, vmmAmount, transactionCode)` using the existing `.vmm-history-item` structure:

```js
function addConversionHistoryItem(amount, vmmAmount, transactionCode) {
  const item = document.createElement('div');
  item.className = 'vmm-history-item';
  item.innerHTML = `
    <div class="vmm-history-main">
      <div class="vmm-history-icon">↗</div>
      <div class="vmm-history-copy">
        <strong>Đổi USDV sang VMM</strong>
        <span>${formatDate('2026-08-07')} · ${transactionCode}</span>
      </div>
    </div>
    <div class="vmm-history-value">
      <strong style="color:var(--vmm-green)">+${formatConversionAmount(vmmAmount)} VMM</strong>
      <span>Hoàn tất · -${formatConversionAmount(amount)} USDV</span>
    </div>
  `;

  root.querySelector('#historyList').prepend(item);
}
```

Implement completion as:

```js
function completeConversion() {
  const amount = Number(convertAmount.value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > usdvBalance) return;

  const vmmAmount = amount / conversionRate;
  const code = `USDV-VMM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  usdvBalance -= amount;
  walletBalance += vmmAmount;
  addConversionHistoryItem(amount, vmmAmount, code);
  updateBalances();
  closeConversion();

  if (window.Swal && typeof window.Swal.fire === 'function') {
    window.Swal.fire({
      icon: 'success',
      title: 'Đổi VMM thành công',
      html: `${formatConversionAmount(vmmAmount)} VMM đã được cộng vào ví.<br><strong>Mã giao dịch: ${code}</strong>`,
      confirmButtonText: 'Đóng',
      showCloseButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: { confirmButton: 'vmm-swal-confirm' }
    });
  } else {
    window.alert(`${formatConversionAmount(vmmAmount)} VMM đã được cộng vào ví.\nMã giao dịch: ${code}`);
  }

  renderConversionState();
}
```

- [ ] **Step 5: Wire events and initialize state**

Add these event bindings:

```js
root.querySelectorAll('[data-get-more-vmm]').forEach(button => {
  button.addEventListener('click', openConversion);
});

root.querySelectorAll('[data-close-convert]').forEach(button => {
  button.addEventListener('click', closeConversion);
});

convertModal.addEventListener('click', event => {
  if (event.target === convertModal) closeConversion();
});

confirmConversion.addEventListener('click', completeConversion);
```

Extend the Escape-key handler so it closes either modal:

```js
if (event.key === 'Escape') {
  if (termsModal.classList.contains('is-open')) closeTerms();
  if (convertModal.classList.contains('is-open')) closeConversion();
}
```

Call `renderConversionState()` before the existing `updateBalances()` and `renderTiers()` initialization calls.

---

### Task 3: Verify the conversion prototype

**Files:**
- Test: `html/vmm3y/vmm-3-year-program-embed-tabs.html` via static checks and JavaScript syntax validation.

**Interfaces:**
- Consumes: Completed modal markup and conversion behavior from Tasks 1–2.
- Produces: Evidence that the new flow is wired without breaking the existing deposit flow.

- [ ] **Step 1: Run JavaScript syntax validation**

Run:

```bash
sed -n '/<script>/,/<\/script>/p' html/vmm3y/vmm-3-year-program-embed-tabs.html | sed '1d;$d' > /tmp/vmm-embed-check.js
node --check /tmp/vmm-embed-check.js
```

Expected: exit code `0` and no syntax errors.

- [ ] **Step 2: Verify required selectors and formula**

Run:

```bash
rg -n -- "data-get-more-vmm|convertModal|conversionRate = 0.00229|amount / conversionRate|completeConversion|USDV-VMM-|showCloseButton|allowOutsideClick: false|allowEscapeKey: false" html/vmm3y/vmm-3-year-program-embed-tabs.html
```

Expected: every required pattern is present.

- [ ] **Step 3: Verify stale demo behavior is absent**

Run:

```bash
if rg -n -- "conversionRate = 1|1 USDV = 1 VMM|setTimeout.*Swal|successToast|vmm-toast" html/vmm3y/vmm-3-year-program-embed-tabs.html; then exit 1; else echo "stale conversion/toast behavior: none"; fi
```

Expected: `stale conversion/toast behavior: none`.

- [ ] **Step 4: Review the final file state**

Run:

```bash
git diff --check
git status --short --untracked-files=all
```

Expected: no whitespace errors; only the intended HTML change is unstaged/uncommitted, alongside the user-provided untracked VMM files.
