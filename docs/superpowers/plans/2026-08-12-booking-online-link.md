# Booking Online Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a shareable online-booking URL beside the AI Voice guide with working copy and scannable-QR actions.

**Architecture:** Add responsive share-control and modal markup to the Booking Book page, while keeping behavior in a focused browser asset. The asset resolves one absolute URL from the current page, then reuses it for the visible link, clipboard, QR payload, and modal fallback.

**Tech Stack:** Static HTML/CSS, browser JavaScript, Bootstrap Icons, existing qrcodejs 1.0.0, Node.js built-in test runner and VM.

## Global Constraints

- Resolve `../customer/booking.html` against `window.location.href`; on a deployed `/html/pages/booking-book-phase-1.html`, the result must end in `/html/customer/booking.html` on the same origin.
- The visible link, copied value, QR payload, and modal fallback must contain the same absolute URL.
- Generate QR locally through the qrcodejs library already loaded by the page.
- Keep QR fallback usable when qrcodejs is unavailable.
- Preserve all unrelated worktree changes.

---

### Task 1: Booking link runtime contract

**Files:**
- Create: `html/assets/booking-online-link.js`
- Create: `html/pages/booking-online-link.test.mjs`

**Interfaces:**
- Consumes: browser `URL`, optional `navigator.clipboard`, DOM document, and optional `window.QRCode`.
- Produces: `window.NEXORA_BOOKING_LINK.resolveBookingUrl(pageHref, bookingPath)`, `copyText(text, clipboard, document)`, `renderBookingQr(container, url, QRCodeCtor)`, and `initialize(document, environment)`.

- [ ] **Step 1: Write failing behavior tests**

Create a VM-backed test that loads the real runtime asset and asserts these literal outcomes:

```js
assert.equal(
  api.resolveBookingUrl(
    'https://merchant.nexora.test/html/pages/booking-book-phase-1.html?tab=booking',
    '../customer/booking.html'
  ),
  'https://merchant.nexora.test/html/customer/booking.html'
);

await api.copyText('https://merchant.nexora.test/html/customer/booking.html', clipboard, document);
assert.equal(copiedText, 'https://merchant.nexora.test/html/customer/booking.html');

assert.equal(api.renderBookingQr(container, bookingUrl, FakeQRCode), true);
assert.equal(container.encodedText, bookingUrl);
assert.equal(api.renderBookingQr(container, bookingUrl, undefined), false);
```

- [ ] **Step 2: Verify RED**

Run: `node --test html/pages/booking-online-link.test.mjs`

Expected: FAIL because `html/assets/booking-online-link.js` and its API do not exist.

- [ ] **Step 3: Implement the minimal runtime**

Implement one IIFE with:

```js
function resolveBookingUrl(pageHref, bookingPath) {
  return new URL(bookingPath || '../customer/booking.html', pageHref).href;
}

function renderBookingQr(container, url, QRCodeCtor) {
  container.replaceChildren();
  if (typeof QRCodeCtor !== 'function') return false;
  new QRCodeCtor(container, {
    text: url,
    width: 224,
    height: 224,
    colorDark: '#0b1220',
    colorLight: '#ffffff',
    correctLevel: QRCodeCtor.CorrectLevel && QRCodeCtor.CorrectLevel.M
  });
  return true;
}
```

`copyText` must prefer `clipboard.writeText(text)` and use a temporary selected textarea plus `document.execCommand('copy')` as fallback. `initialize` must assign the resolved URL to every `[data-booking-online-url]` anchor/text node, wire the copy button, render QR once on first QR-button activation, and open the native dialog with an `open`-attribute fallback.

- [ ] **Step 4: Verify GREEN**

Run: `node --test html/pages/booking-online-link.test.mjs`

Expected: all runtime-contract tests PASS.

- [ ] **Step 5: Commit runtime unit**

```bash
git add html/assets/booking-online-link.js html/pages/booking-online-link.test.mjs
git commit -m "feat: add booking link share runtime"
```

### Task 2: Booking Book share control and modal

**Files:**
- Modify: `html/pages/booking-book-phase-1.html:600-670`
- Modify: `html/pages/booking-book-phase-1.html:8895-8910`
- Modify: `html/pages/booking-book-phase-1.html` immediately before the existing Nexora shell script.
- Test: `html/pages/booking-online-link.test.mjs`

**Interfaces:**
- Consumes: selectors and API from `html/assets/booking-online-link.js`.
- Produces: `[data-booking-online-share]`, `[data-booking-online-url]`, `[data-booking-online-copy]`, `[data-booking-online-qr-open]`, `[data-booking-online-qr]`, and `[data-booking-online-qr-dialog]` DOM hooks.

- [ ] **Step 1: Add a failing page-integration test**

Extend the focused test to read the real HTML and require:

```js
assert.match(html, /class="page-heading-links"/);
assert.match(html, /data-booking-online-share[^>]*data-booking-path="\.\.\/customer\/booking\.html"/);
assert.match(html, /Link booking online/);
assert.match(html, /data-booking-online-copy[^>]*aria-label="Copy online booking link"/);
assert.match(html, /data-booking-online-qr-open[^>]*aria-label="Show online booking QR code"/);
assert.match(html, /data-booking-online-qr-dialog/);
assert.match(html, /src="\.\.\/assets\/booking-online-link\.js"/);
```

- [ ] **Step 2: Verify RED**

Run: `node --test html/pages/booking-online-link.test.mjs`

Expected: runtime tests PASS and page-integration test FAIL because the control is absent.

- [ ] **Step 3: Add minimal accessible markup and styles**

Wrap the existing guide and new share control in `.page-heading-links`. The new control contains a direct anchor, copy and QR icon buttons using `bi-copy` and `bi-qr-code`, an `aria-live="polite"` status, and a native `<dialog>` with close button, QR container, and direct URL link. Add responsive CSS so the row wraps and long URLs truncate visually without changing their copy value.

Load the focused runtime after the page markup and before `nexora-shell.js`:

```html
<script src="../assets/booking-online-link.js"></script>
```

- [ ] **Step 4: Verify GREEN and regressions**

Run:

```bash
node --test html/pages/booking-online-link.test.mjs
node --test html/pages/booking-book-phase-1.*.test.mjs
git diff --check -- html/pages/booking-book-phase-1.html html/assets/booking-online-link.js html/pages/booking-online-link.test.mjs
```

Expected: all tests PASS and diff check exits 0.

- [ ] **Step 5: Commit page integration**

```bash
git add html/pages/booking-book-phase-1.html html/pages/booking-online-link.test.mjs
git commit -m "feat: expose online booking link and QR"
```
