# W-9 Handwritten Signature Pad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the W-9 prototype's text-only signature control with a responsive handwritten signature pad that works on phones and appears in Print and Download PDF output.

**Architecture:** Keep the standalone `w9-form.html` structure and add a canvas-backed signature controller inside its existing initializer. Pure date and validation behavior stays in the exported test API; DOM tests assert the signature contract and Pointer Events wiring. The custom PDF renderer receives the live signature canvas and draws it into a dedicated Part II signature block.

**Tech Stack:** Semantic HTML, embedded mobile-first CSS, browser Canvas 2D API, Pointer Events, vanilla JavaScript, Node.js `node:test`, headless Chrome, Poppler.

## Global Constraints

- Modify only `html/pages/w9-form.html`, `html/pages/w9-form.test.mjs`, and the approved W-9 signature documentation.
- Do not add authentication, PIN, API, server storage, audit logging, third-party signature libraries, or IRS submission.
- Keep the signature bitmap, signer name, and signature date out of `localStorage`.
- Preserve the existing mobile-first layout from 320 pixels wide and all existing W-9 fields and validation behavior.
- The pad must accept touch, stylus, and mouse using Pointer Events.
- Keep `Full legal name` as the required keyboard-accessible signature fallback; canvas ink is optional.
- Print and Download PDF must show the handwritten mark, legal signer name, and `MM/DD/YYYY` date.
- `Reset`, draft restore, and `Ký lại` must leave an empty pad; Dev Fill must draw a synthetic demo signature.
- Use test-first red-green cycles for every production change.

## File Structure

- `html/pages/w9-form.html`: signature markup, responsive/print styles, validation, canvas controller, Reset/Dev Fill integration, and PDF rendering.
- `html/pages/w9-form.test.mjs`: source-contract tests plus pure validation/date/PDF-row regression tests.
- `docs/superpowers/specs/2026-07-20-w9-handwritten-signature-design.md`: approved design source; no implementation edits expected.
- `docs/superpowers/plans/2026-07-20-w9-handwritten-signature.md`: this execution checklist.

---

### Task 1: Signature Contract, Validation, and Date Formatting

**Files:**
- Modify: `html/pages/w9-form.test.mjs:12-225`
- Modify: `html/pages/w9-form.html:614-631, 1115-1158, 1180-1356`

**Interfaces:**
- Consumes: existing `validateValues(values)`, `createDevFixture(dateString)`, `sanitizeDraft(values)`, and `pdfFieldRows(values)` helpers.
- Produces: `formatUsDate(value: unknown): string`, the Dev-only `signatureDrawn: boolean` fixture flag, and DOM ids `signature-pad`, `signature-canvas`, `signature-placeholder`, `clear-signature`, `signature`, and `signature-date`.

- [ ] **Step 1: Write failing markup, validation, and date tests**

Add these tests to `html/pages/w9-form.test.mjs`:

```js
test('renders the approved handwritten signature controls in source order', () => {
  const html = source();
  const ids = [
    'signature-pad', 'signature-canvas', 'signature-placeholder',
    'clear-signature', 'signature', 'signature-date'
  ];
  let cursor = -1;
  ids.forEach((id) => {
    const next = html.indexOf(`id="${id}"`);
    assert.ok(next > cursor, `${id} must follow the previous signature control`);
    cursor = next;
  });
  assert.match(html, /id="signature-placeholder"[^>]*>Ký bằng ngón tay<\/span>/);
  assert.match(html, /id="clear-signature"[^>]*disabled[^>]*>Ký lại<\/button>/);
  assert.match(html, /for="signature"[^>]*>Full legal name/);
});

test('accepts legal name as the accessible fallback while retaining demo ink state', () => {
  const form = api();
  const fixture = form.createDevFixture('2026-07-20');
  assert.equal(fixture.signatureDrawn, true);
  assert.equal(Object.keys(form.validateValues(fixture)).length, 0);

  const withoutInk = form.validateValues({ ...fixture, signatureDrawn: false });
  assert.equal(Object.keys(withoutInk).length, 0);
  const withoutName = form.validateValues({ ...fixture, signature: '' });
  assert.equal(withoutName.signature, 'Type your full legal name to sign.');
});

test('formats a valid signature date for U.S. print and PDF output', () => {
  const form = api();
  assert.equal(form.formatUsDate('2026-07-20'), '07/20/2026');
  assert.equal(form.formatUsDate(''), '');
  assert.equal(form.formatUsDate('20/07/2026'), '20/07/2026');
});
```

Update the existing valid fixture objects in the validation and PDF-row tests to include `signatureDrawn: true`. Change the expected PDF date from `2026-07-20` to `07/20/2026`. Extend the draft test input with `signatureDrawn: true` and assert that it is absent from the sanitized draft.

- [ ] **Step 2: Run the new tests and verify RED**

Run:

```bash
node --test --test-name-pattern='handwritten signature controls|accessible fallback|signature date' html/pages/w9-form.test.mjs
```

Expected: FAIL because the signature-pad ids, Dev ink flag, and `formatUsDate` do not exist.

- [ ] **Step 3: Add the approved signature markup and responsive styles**

Replace the current signature/date two-column block in `html/pages/w9-form.html` with:

```html
<div class="signature-field">
  <span class="field-label" id="signature-label">Signature of U.S. person <span class="required-marker" aria-hidden="true">*</span></span>
  <div class="signature-pad" id="signature-pad">
    <canvas id="signature-canvas" class="signature-canvas" tabindex="0" aria-labelledby="signature-label" aria-describedby="signature-help">Use touch, stylus, or mouse to draw your signature.</canvas>
    <span class="signature-placeholder" id="signature-placeholder" aria-hidden="true">Ký bằng ngón tay</span>
  </div>
  <div class="signature-actions screen-only">
    <button class="signature-clear" id="clear-signature" type="button" disabled>Ký lại</button>
  </div>
  <p class="field-help" id="signature-help">Use your finger, stylus, or mouse, or enter your full legal name below as a keyboard-accessible signature.</p>
</div>

<div class="field-grid two-column signature-details">
  <div class="field">
    <label class="field-label" for="signature">Full legal name <span class="required-marker" aria-hidden="true">*</span></label>
    <input id="signature" name="signature" type="text" autocomplete="name" required aria-describedby="signature-error" placeholder="Linh Nguyen">
    <p class="error-message" id="signature-error"></p>
  </div>
  <div class="field">
    <label class="field-label" for="signature-date">Date <span class="required-marker" aria-hidden="true">*</span></label>
    <input id="signature-date" name="signatureDate" type="date" required aria-describedby="signature-date-error">
    <p class="error-message" id="signature-date-error"></p>
  </div>
</div>
```

Add these base styles after `.certification-note`:

```css
.signature-field { min-width: 0; }
.signature-pad {
  position: relative;
  overflow: hidden;
  border: 1.5px solid #69748c;
  border-radius: 12px;
  background: #fff;
}
.signature-pad:focus-within {
  border-color: var(--action);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, .14);
}
.signature-canvas {
  display: block;
  width: 100%;
  height: 156px;
  background: transparent;
  cursor: crosshair;
  touch-action: none;
}
.signature-canvas:focus { outline: 0; }
.signature-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #858ea2;
  font-size: 14px;
  font-weight: 750;
  pointer-events: none;
  transition: opacity .15s ease;
}
.signature-pad.has-signature .signature-placeholder { opacity: 0; }
.signature-actions { display: flex; justify-content: flex-end; margin-top: 4px; }
.signature-clear {
  min-width: 72px;
  min-height: 44px;
  border: 0;
  padding: 8px 2px;
  color: var(--action-dark);
  background: transparent;
  cursor: pointer;
  font-weight: 850;
}
.signature-clear:disabled { color: #929bad; cursor: default; }
.signature-details { margin-top: 2px; }
```

- [ ] **Step 4: Add pure validation and date behavior**

Add this helper before `validateValues` and export it in `W9_FORM_TEST_API`:

```js
function formatUsDate(value) {
  const input = stringValue(value).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  return match ? match[2] + "/" + match[3] + "/" + match[1] : input;
}
```

Keep the existing required legal-name validation as the accessible signature fallback and set `signatureDrawn: true` in `createDevFixture`. In `pdfFieldRows`, format the date with:

```js
{ label: "Date", value: formatUsDate(input.signatureDate) || "Not provided" }
```

The existing `DRAFT_FIELDS` allowlist remains unchanged, which excludes `signatureDrawn`, `signature`, and `signatureDate`.

- [ ] **Step 5: Run the targeted tests and full suite to verify GREEN**

Run:

```bash
node --test --test-name-pattern='handwritten signature controls|accessible fallback|signature date' html/pages/w9-form.test.mjs
node --test html/pages/w9-form.test.mjs
```

Expected: the targeted tests PASS; the full suite reports zero failures.

- [ ] **Step 6: Commit the signature contract**

```bash
git add html/pages/w9-form.html html/pages/w9-form.test.mjs
git commit -m "feat: add W-9 handwritten signature contract"
```

---

### Task 2: Pointer Drawing, Reset, Draft Restore, and Dev Fill

**Files:**
- Modify: `html/pages/w9-form.test.mjs:90-225`
- Modify: `html/pages/w9-form.html:1440-2050`

**Interfaces:**
- Consumes: Task 1 DOM ids and `signatureDrawn` validation contract.
- Produces: initializer-local functions `resizeSignatureCanvas(preserve)`, `clearSignature()`, `drawSyntheticSignature()`, and `localDateValue(date)`; handwritten state stays controller-local.

- [ ] **Step 1: Write failing Pointer Events and lifecycle tests**

Add these tests:

```js
test('wires touch, stylus, and mouse drawing through Pointer Events', () => {
  const html = source();
  assert.match(html, /signatureCanvas\.addEventListener\("pointerdown"/);
  assert.match(html, /signatureCanvas\.addEventListener\("pointermove"/);
  assert.match(html, /\["pointerup", "pointercancel", "lostpointercapture"\]/);
  assert.match(html, /signatureCanvas\.setPointerCapture\(event\.pointerId\)/);
  assert.match(html, /window\.devicePixelRatio/);
  assert.match(html, /resizeSignatureCanvas\(true\)/);
});

test('clears and demo-fills handwritten signature state', () => {
  const html = source();
  assert.match(html, /byId\("clear-signature"\)\.addEventListener\("click", clearSignature\)/);
  assert.match(html, /function clearSignature\(\)[\s\S]*setSignatureState\(false\)/);
  assert.match(html, /function drawSyntheticSignature\(\)[\s\S]*setSignatureState\(true\)/);
  assert.match(html, /form\.reset\(\);[\s\S]*clearSignature\(\)/);
  assert.match(html, /applyValues\(createDevFixture\(localDate\)\)[\s\S]*drawSyntheticSignature\(\)/);
});

test('defaults signature date to the current local calendar date', () => {
  const html = source();
  assert.match(html, /function localDateValue\(date\)/);
  assert.match(html, /byId\("signature-date"\)\.value = localDateValue\(new Date\(\)\)/);
});
```

- [ ] **Step 2: Run lifecycle tests and verify RED**

Run:

```bash
node --test --test-name-pattern='Pointer Events|handwritten signature state|current local calendar date' html/pages/w9-form.test.mjs
```

Expected: FAIL because the canvas controller and lifecycle wiring do not exist.

- [ ] **Step 3: Add the signature controller to `init()`**

After the existing control constants in `init()`, add:

```js
const signaturePad = byId("signature-pad");
const signatureCanvas = byId("signature-canvas");
const signatureContext = signatureCanvas.getContext("2d");
const clearSignatureButton = byId("clear-signature");
let signatureDrawn = false;
let activeSignaturePointer = null;

if (!signatureContext) throw new Error("Signature drawing is unavailable.");

function setSignatureState(hasInk) {
  signatureDrawn = Boolean(hasInk);
  signaturePad.classList.toggle("has-signature", signatureDrawn);
  clearSignatureButton.disabled = !signatureDrawn;
}

function configureSignatureInk() {
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  signatureContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  signatureContext.strokeStyle = "#111318";
  signatureContext.fillStyle = "#111318";
  signatureContext.lineWidth = 2.4;
  signatureContext.lineCap = "round";
  signatureContext.lineJoin = "round";
}

function resizeSignatureCanvas(preserve) {
  const rect = signatureCanvas.getBoundingClientRect();
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (signatureCanvas.width === width && signatureCanvas.height === height) return;

  const copy = document.createElement("canvas");
  copy.width = signatureCanvas.width || width;
  copy.height = signatureCanvas.height || height;
  if (preserve && signatureDrawn && signatureCanvas.width && signatureCanvas.height) {
    copy.getContext("2d").drawImage(signatureCanvas, 0, 0);
  }
  signatureCanvas.width = width;
  signatureCanvas.height = height;
  configureSignatureInk();
  if (preserve && signatureDrawn) {
    signatureContext.drawImage(copy, 0, 0, copy.width, copy.height, 0, 0, rect.width, rect.height);
  }
}

function clearSignature() {
  signatureContext.save();
  signatureContext.setTransform(1, 0, 0, 1, 0, 0);
  signatureContext.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  signatureContext.restore();
  setSignatureState(false);
  clearErrors();
  updateProgress();
}

function signaturePoint(event) {
  const rect = signatureCanvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
```

Wire Pointer Events after the general form listeners:

```js
signatureCanvas.addEventListener("pointerdown", function (event) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  activeSignaturePointer = event.pointerId;
  signatureCanvas.setPointerCapture(event.pointerId);
  const point = signaturePoint(event);
  signatureContext.beginPath();
  signatureContext.moveTo(point.x, point.y);
  event.preventDefault();
});

signatureCanvas.addEventListener("pointermove", function (event) {
  if (event.pointerId !== activeSignaturePointer) return;
  const point = signaturePoint(event);
  signatureContext.lineTo(point.x, point.y);
  signatureContext.stroke();
  setSignatureState(true);
  event.preventDefault();
});

["pointerup", "pointercancel", "lostpointercapture"].forEach(function (type) {
  signatureCanvas.addEventListener(type, function (event) {
    if (event.pointerId === activeSignaturePointer) activeSignaturePointer = null;
  });
});

clearSignatureButton.addEventListener("click", clearSignature);
window.addEventListener("resize", function () { resizeSignatureCanvas(true); });
```

- [ ] **Step 4: Integrate values, errors, dates, Reset, restore, and Dev Fill**

Use this local date helper:

```js
function localDateValue(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}
```

Call `clearSignature()` immediately after `form.reset()` inside `applyValues`; do not draw a signature there. Define the synthetic demo using the same configured context:

```js
function drawSyntheticSignature() {
  clearSignature();
  const rect = signatureCanvas.getBoundingClientRect();
  signatureContext.beginPath();
  signatureContext.moveTo(rect.width * .14, rect.height * .62);
  signatureContext.bezierCurveTo(rect.width * .25, rect.height * .15, rect.width * .32, rect.height * .86, rect.width * .43, rect.height * .42);
  signatureContext.bezierCurveTo(rect.width * .51, rect.height * .2, rect.width * .56, rect.height * .75, rect.width * .66, rect.height * .44);
  signatureContext.bezierCurveTo(rect.width * .72, rect.height * .3, rect.width * .76, rect.height * .58, rect.width * .84, rect.height * .46);
  signatureContext.stroke();
  setSignatureState(true);
  updateProgress();
}
```

Call `clearSignature()` immediately after every other `form.reset()`. Call `drawSyntheticSignature()` once after the Dev fixture has been applied. On draft restore, call `clearSignature()` so no prior canvas survives. Initialize in this order at the bottom of `init()`:

```js
resizeSignatureCanvas(false);
byId("signature-date").value = localDateValue(new Date());
syncConditionals();
updateProgress();
```

Keep the existing legal-name id/error mapping and certification section keys unchanged; the canvas has no separate validation error because typed legal name is the fallback.

- [ ] **Step 5: Run targeted and full tests to verify GREEN**

Run:

```bash
node --test --test-name-pattern='Pointer Events|handwritten signature state|current local calendar date' html/pages/w9-form.test.mjs
node --test html/pages/w9-form.test.mjs
```

Expected: all tests PASS with zero failures.

- [ ] **Step 6: Commit drawing behavior**

```bash
git add html/pages/w9-form.html html/pages/w9-form.test.mjs
git commit -m "feat: add mobile W-9 signature drawing"
```

---

### Task 3: Print, PDF, and Final Verification

**Files:**
- Modify: `html/pages/w9-form.test.mjs:90-330`
- Modify: `html/pages/w9-form.html:780-848, 1575-1712, 2001-2055`
- Generate temporarily: `tmp/pdfs/w9-signature-print.pdf`
- Generate temporarily: `tmp/pdfs/w9-signature-print-page-1.png`

**Interfaces:**
- Consumes: Task 2 live `signatureCanvas`, `signatureDrawn`, and `formatUsDate`.
- Produces: `renderPdfCanvas(values, signatureSource)` with a dedicated handwritten signature block; `downloadW9Pdf(values, signatureSource)`.

- [ ] **Step 1: Write failing print and PDF integration tests**

Add:

```js
test('keeps handwritten ink in print while hiding signature actions', () => {
  const html = source();
  const printStart = html.indexOf('@media print');
  const printBlock = html.slice(printStart, html.indexOf('</style>', printStart));
  assert.match(printBlock, /\.signature-placeholder[^}]*display:\s*none/);
  assert.match(printBlock, /\.signature-actions[^}]*display:\s*none/);
  assert.match(printBlock, /\.signature-canvas[^}]*height:/);
  assert.match(printBlock, /\.signature-pad[^}]*border-bottom:\s*1px solid #000/);
  assert.match(printBlock, /#signature-date[^}]*display:\s*none/);
  assert.match(printBlock, /\.signature-date-print[^}]*display:\s*block/);
  assert.match(html, /id="signature-date-print"/);
  assert.match(html, /function syncPrintedSignatureDate\(\)[\s\S]*formatUsDate/);
});

test('draws the handwritten signature into the downloaded PDF canvas', () => {
  const html = source();
  assert.match(html, /function renderPdfCanvas\(values, signatureSource\)/);
  assert.match(html, /function drawSignatureBlock\(signatureSource, signerName, signatureDate\)/);
  assert.match(html, /context\.drawImage\(signatureSource/);
  assert.match(html, /"\/s\/ " \+ stringValue\(signerName\)/);
  assert.match(html, /renderPdfCanvas\(values, signatureSource\)/);
  assert.match(html, /downloadW9Pdf\(readValues\(\), signatureCanvas\)/);
});
```

- [ ] **Step 2: Run print/PDF tests and verify RED**

Run:

```bash
node --test --test-name-pattern='handwritten ink in print|handwritten signature into the downloaded PDF' html/pages/w9-form.test.mjs
```

Expected: FAIL because print-specific signature rules and the PDF signature source parameter do not exist.

- [ ] **Step 3: Add print styling for the signature area**

Inside the existing print media block add:

```css
.signature-placeholder, .signature-actions, #signature-help { display: none !important; }
.signature-pad {
  border: 0;
  border-bottom: 1px solid #000;
  border-radius: 0;
  box-shadow: none !important;
}
.signature-canvas { height: .62in; }
.signature-details { grid-template-columns: 1fr 1.25in; }
#signature-date { display: none; }
.signature-date-print {
  display: block;
  min-height: 24px;
  border-bottom: 1px solid #000;
  padding: 2px 3px;
}
```

Add this screen-hidden value immediately after the native date input:

```html
<span class="print-only signature-date-print" id="signature-date-print"></span>
```

Keep it synchronized with the required U.S. print format:

```js
function syncPrintedSignatureDate() {
  byId("signature-date-print").textContent = formatUsDate(byId("signature-date").value);
}

byId("signature-date").addEventListener("change", syncPrintedSignatureDate);
```

Call `syncPrintedSignatureDate()` during initialization and at the start of the existing `beforeprint` listener. This guarantees browser Print uses `MM/DD/YYYY` instead of the browser locale rendering of `input[type="date"]`.

- [ ] **Step 4: Render handwritten ink in a dedicated PDF signature block**

Change the renderer signatures to:

```js
function renderPdfCanvas(values, signatureSource) {
function downloadW9Pdf(values, signatureSource) {
  const canvas = renderPdfCanvas(values, signatureSource);
```

Add this nested function after `drawPart`:

```js
function drawSignatureBlock(signatureSource, signerName, signatureDate) {
  const blockHeight = 168;
  context.fillStyle = "#ffffff";
  context.fillRect(margin, cursorY, contentWidth, blockHeight);
  context.strokeStyle = "#aeb7c8";
  context.strokeRect(margin, cursorY, contentWidth, blockHeight);
  setFont(13, "700");
  context.fillStyle = "#4b5364";
  context.fillText("Signature of U.S. person", margin + 14, cursorY + 8);

  if (signatureSource && signatureSource.width && signatureSource.height) {
    const maxWidth = 590;
    const maxHeight = 88;
    const scale = Math.min(maxWidth / signatureSource.width, maxHeight / signatureSource.height);
    const drawWidth = signatureSource.width * scale;
    const drawHeight = signatureSource.height * scale;
    context.drawImage(signatureSource, margin + 14, cursorY + 28, drawWidth, drawHeight);
  } else {
    setFont(30, "400", "Georgia, serif");
    context.fillStyle = "#111318";
    context.fillText("/s/ " + stringValue(signerName).trim(), margin + 14, cursorY + 52);
  }

  setFont(15, "400");
  context.fillStyle = "#111318";
  context.fillText("Full legal name: " + stringValue(signerName).trim(), margin + 640, cursorY + 50);
  context.fillText("Date: " + formatUsDate(signatureDate), margin + 640, cursorY + 80);
  cursorY += blockHeight + 13;
}
```

Replace the current Part II draw call with:

```js
drawPart("Part II - Certification", rows.slice(9, 11));
drawSignatureBlock(signatureSource, values.signature, values.signatureDate);
```

Call the downloader with the live pad:

```js
downloadW9Pdf(readValues(), signatureCanvas);
```

- [ ] **Step 5: Run the entire automated suite and static verification**

Run:

```bash
node --test html/pages/w9-form.test.mjs
git diff --check
```

Expected: every W-9 test PASS, zero failures, and `git diff --check` produces no output.

- [ ] **Step 6: Render and inspect the latest print layout**

Run:

```bash
mkdir -p tmp/pdfs
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="tmp/pdfs/w9-signature-print.pdf" "file:///Users/loinguyen/Documents/VLINKGROUP/TaxIQ/html/pages/w9-form.html"
"/Users/loinguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm" -f 1 -singlefile -png -r 144 tmp/pdfs/w9-signature-print.pdf tmp/pdfs/w9-signature-print-page-1
```

Inspect `tmp/pdfs/w9-signature-print-page-1.png`. Confirm the signature box fits the Part II section, the legal-name/date grid aligns, no text clips, and existing section borders remain aligned.

- [ ] **Step 7: Verify the mobile source constraints**

Run:

```bash
rg -n "signature-canvas|touch-action: none|pointerdown|pointermove|Ký lại|Full legal name|formatUsDate|drawSignatureBlock" html/pages/w9-form.html
```

Expected: every signature interaction, mobile touch rule, approved label, date formatter, and PDF block has at least one match.

- [ ] **Step 8: Commit the print/PDF integration**

```bash
git add html/pages/w9-form.html html/pages/w9-form.test.mjs docs/superpowers/plans/2026-07-20-w9-handwritten-signature.md
git commit -m "feat: include W-9 handwriting in print and PDF"
```

- [ ] **Step 9: Report the completed verification without pushing unrelated commits**

Run:

```bash
git status --short --branch
git log --oneline --decorate -6
```

Expected: the W-9 implementation commits are present and the working tree has no uncommitted W-9 changes. Push only after checking whether the local `main` branch contains unrelated commits that the user did not ask to publish.
