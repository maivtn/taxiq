import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';

const PAGE_URL = new URL('./w9-form.html', import.meta.url);
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function source() {
  assert.ok(existsSync(PAGE_URL), 'w9-form.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForJson(url, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      lastError = new Error(`HTTP ${response.status} from ${url}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

async function connectCdp(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
      return;
    }
    const eventListeners = listeners.get(message.method) || [];
    eventListeners.splice(0).forEach((listener) => listener(message.params));
  });

  return {
    close() { socket.close(); },
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    once(method) {
      return new Promise((resolve) => {
        const eventListeners = listeners.get(method) || [];
        eventListeners.push(resolve);
        listeners.set(method, eventListeners);
      });
    }
  };
}

async function waitFor(downloadDir, predicate, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = predicate();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for browser state in ${downloadDir}`);
}

test('exercises the handwritten signature lifecycle and custom PDF output in Chrome', { timeout: 30_000 }, async () => {
  assert.ok(existsSync(CHROME_PATH), 'local Google Chrome must exist');
  const browserDir = mkdtempSync(join(tmpdir(), 'w9-browser-'));
  const downloadDir = join(browserDir, 'downloads');
  mkdirSync(downloadDir);
  const port = await freePort();
  const chrome = spawn(CHROME_PATH, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', `--remote-debugging-port=${port}`,
    `--user-data-dir=${join(browserDir, 'profile')}`, 'about:blank'
  ], { stdio: 'ignore' });
  let cdp;

  try {
    const targets = await waitForJson(`http://127.0.0.1:${port}/json/list`);
    const pageTarget = targets.find((target) => target.type === 'page');
    assert.ok(pageTarget?.webSocketDebuggerUrl, 'Chrome page target must be available');
    cdp = await connectCdp(pageTarget.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadDir,
      eventsEnabled: true
    });
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: `
      window.__w9PdfOps = [];
      const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (...args) {
        if (this.canvas.width === 1275 && this.canvas.height === 1650) {
          window.__w9PdfOps.push({ type: 'drawImage', sourceId: args[0]?.id || '' });
        }
        return originalDrawImage.apply(this, args);
      };
      const originalFillText = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
        if (this.canvas.width === 1275 && this.canvas.height === 1650) {
          window.__w9PdfOps.push({
            type: 'fillText', text: String(text), x, y,
            width: this.measureText(String(text)).width,
            font: this.font,
            maxWidth: maxWidth ?? null
          });
        }
        return originalFillText.apply(this, arguments);
      };
    ` });

    const loaded = cdp.once('Page.loadEventFired');
    await cdp.send('Page.navigate', { url: PAGE_URL.href });
    await loaded;

    async function evaluate(expression) {
      const result = await cdp.send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true
      });
      if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      }
      return result.result.value;
    }

    await evaluate(`(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.getElementById('signature-canvas').scrollIntoView({ block: 'center', behavior: 'instant' });
    })()`);

    async function canvasState() {
      return evaluate(`(() => {
        const canvas = document.getElementById('signature-canvas');
        const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        let inkPixels = 0;
        for (let index = 3; index < pixels.length; index += 4) {
          if (pixels[index] !== 0) inkPixels += 1;
        }
        return {
          inkPixels,
          clearDisabled: document.getElementById('clear-signature').disabled,
          rect: canvas.getBoundingClientRect().toJSON()
        };
      })()`);
    }

    async function dispatchMouse(type, x, y, buttons) {
      await cdp.send('Input.dispatchMouseEvent', {
        type, x, y, button: 'left', buttons,
        clickCount: type === 'mousePressed' || type === 'mouseReleased' ? 1 : 0
      });
    }

    const initial = await canvasState();
    const tapX = initial.rect.x + 32;
    const tapY = initial.rect.y + 34;
    await dispatchMouse('mousePressed', tapX, tapY, 1);
    await dispatchMouse('mouseReleased', tapX, tapY, 0);
    const tapped = await canvasState();
    assert.ok(tapped.inkPixels > 0, `a pointer tap must leave a visible dot: ${JSON.stringify(tapped)}`);
    assert.equal(tapped.clearDisabled, false, 'a pointer tap must mark the pad signed');

    await evaluate(`document.getElementById('clear-signature').click()`);
    assert.equal((await canvasState()).inkPixels, 0, 'Ký lại must clear tap ink');

    const competingPointer = await evaluate(`(() => {
      const canvas = document.getElementById('signature-canvas');
      const rect = canvas.getBoundingClientRect();
      const originalCapture = canvas.setPointerCapture;
      canvas.setPointerCapture = () => {};
      const send = (type, pointerId, x, y) => canvas.dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, pointerId, pointerType: 'touch',
        clientX: rect.left + x, clientY: rect.top + y, isPrimary: pointerId === 41
      }));
      send('pointerdown', 41, 20, 20);
      send('pointerdown', 42, 100, 20);
      send('pointermove', 42, 150, 20);
      send('pointerup', 42, 150, 20);
      const beforePrimaryUp = document.getElementById('clear-signature').disabled;
      send('pointerup', 41, 20, 20);
      canvas.setPointerCapture = originalCapture;
      return { beforePrimaryUp, afterPrimaryUp: document.getElementById('clear-signature').disabled };
    })()`);
    assert.equal(competingPointer.beforePrimaryUp, true, 'a second pointer must not draw or take ownership');
    assert.equal(competingPointer.afterPrimaryUp, false, 'the original tap must complete after a second pointer is ignored');

    await evaluate(`document.getElementById('clear-signature').click()`);
    const drawStart = await canvasState();
    const startX = drawStart.rect.x + 45;
    const startY = drawStart.rect.y + 70;
    await dispatchMouse('mousePressed', startX, startY, 1);
    await dispatchMouse('mouseMoved', startX + 70, startY - 28, 1);
    await dispatchMouse('mouseMoved', startX + 140, startY + 12, 1);
    await dispatchMouse('mouseReleased', startX + 140, startY + 12, 0);
    const drawn = await canvasState();
    assert.ok(drawn.inkPixels > 0, 'real browser Pointer Events must draw ink');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 620, height: 900, deviceScaleFactor: 1, mobile: false
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.ok((await canvasState()).inkPixels > 0, 'resize must preserve handwritten ink');

    await evaluate(`document.getElementById('clear-signature').click()`);
    assert.deepEqual(await canvasState().then(({ inkPixels, clearDisabled }) => ({ inkPixels, clearDisabled })), {
      inkPixels: 0,
      clearDisabled: true
    });

    await evaluate(`document.getElementById('dev-fill').click(); window.confirm = () => true; document.getElementById('clear-form').click()`);
    const resetState = await evaluate(`({
      signature: document.getElementById('signature').value,
      signatureDate: document.getElementById('signature-date').value,
      ssn: document.getElementById('ssn').value,
      certification: document.getElementById('certification-acknowledgment').checked,
      printDate: document.getElementById('signature-date-print').textContent
    })`);
    assert.deepEqual(resetState, {
      signature: '', signatureDate: '', ssn: '', certification: false, printDate: ''
    });
    assert.equal((await canvasState()).inkPixels, 0, 'Reset must clear ink');

    await evaluate(`(() => {
      const key = window.W9_FORM_TEST_API.STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify({ taxpayerName: 'Restored Draft', streetAddress: '5 Main St' }));
      document.getElementById('dev-fill').click();
      document.getElementById('signature').value = 'Prior Legal Signer';
      document.getElementById('signature-date').value = '2025-01-02';
      document.getElementById('signature-date').dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('ssn').value = '999-88-7777';
      document.getElementById('ein').value = '98-7654321';
      document.getElementById('certification-acknowledgment').checked = true;
      document.getElementById('restore-draft').click();
    })()`);
    const restored = await evaluate(`({
      taxpayerName: document.getElementById('taxpayer-name').value,
      signature: document.getElementById('signature').value,
      signatureDate: document.getElementById('signature-date').value,
      printDate: document.getElementById('signature-date-print').textContent,
      ssn: document.getElementById('ssn').value,
      ein: document.getElementById('ein').value,
      certification: document.getElementById('certification-acknowledgment').checked
    })`);
    assert.deepEqual(restored, {
      taxpayerName: 'Restored Draft', signature: '', signatureDate: '', printDate: '',
      ssn: '', ein: '', certification: false
    });
    assert.equal((await canvasState()).inkPixels, 0, 'Restore Draft must clear ink');

    const longName = 'Alexandria Catherine Montgomery Santiago Nguyen Rodriguez Authorized Representative';
    await evaluate(`(() => {
      window.__w9PdfOps = [];
      document.getElementById('taxpayer-name').value = 'Fallback Test';
      document.getElementById('signature').value = ${JSON.stringify(longName)};
      document.getElementById('signature-date').value = '2026-07-20';
      document.getElementById('signature-date').dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('download-pdf').click();
    })()`);
    await waitFor(downloadDir, () => existsSync(downloadDir) && readdirSync(downloadDir).some((name) => name.endsWith('.pdf')));
    const fallbackOps = await evaluate(`window.__w9PdfOps`);
    const fallbackSignatureLines = fallbackOps.filter((op) =>
      op.type === 'fillText' && op.font.includes('Georgia') && op.y > 1000
    );
    assert.ok(fallbackSignatureLines.length >= 2, 'long /s/ fallback must wrap within its column');
    assert.ok(fallbackSignatureLines[0].text.startsWith('/s/ '), 'empty-pad PDF must use the /s/ fallback');
    fallbackSignatureLines.forEach((op) => {
      assert.ok(op.x + op.width <= 694, `fallback line clips its column: ${op.text}`);
    });
    const legalNameLines = fallbackOps.filter((op) =>
      op.type === 'fillText' && op.x === 714 && op.y > 1000 && !op.text.startsWith('Date:')
    );
    assert.ok(legalNameLines.length >= 2, 'long legal name must wrap within its column');
    legalNameLines.forEach((op) => {
      assert.ok(op.x + op.width <= 1187, `legal-name line clips its column: ${op.text}`);
    });
    assert.equal(await evaluate(`document.getElementById('signature-date-print').textContent`), '07/20/2026');

    await evaluate(`window.__w9PdfOps = []; document.getElementById('taxpayer-name').value = 'Ink Test'`);
    await evaluate(`document.getElementById('signature-canvas').scrollIntoView({ block: 'center', behavior: 'instant' })`);
    const inkCanvas = await canvasState();
    const inkX = inkCanvas.rect.x + 35;
    const inkY = inkCanvas.rect.y + 55;
    await dispatchMouse('mousePressed', inkX, inkY, 1);
    await dispatchMouse('mouseMoved', inkX + 100, inkY + 15, 1);
    await dispatchMouse('mouseReleased', inkX + 100, inkY + 15, 0);
    await evaluate(`document.getElementById('download-pdf').click()`);
    await waitFor(downloadDir, () => readdirSync(downloadDir).filter((name) => name.endsWith('.pdf')).length >= 2);
    const inkOps = await evaluate(`window.__w9PdfOps`);
    assert.ok(inkOps.some((op) => op.type === 'drawImage' && op.sourceId === 'signature-canvas'),
      'handwritten PDF branch must copy the live signature canvas');
    assert.equal(inkOps.some((op) => op.type === 'fillText' && op.text.startsWith('/s/ ')), false,
      'handwritten PDF branch must not substitute the typed fallback');
    const inkLegalNameLines = inkOps.filter((op) =>
      op.type === 'fillText' && op.x === 714 && op.y > 1000 && !op.text.startsWith('Date:')
    );
    assert.ok(inkLegalNameLines.length >= 2, 'long legal name must wrap beside handwritten ink');
    inkLegalNameLines.forEach((op) => {
      assert.ok(op.x + op.width <= 1187, `handwritten legal-name line clips its column: ${op.text}`);
    });
    readdirSync(downloadDir).filter((name) => name.endsWith('.pdf')).forEach((name) => {
      assert.match(readFileSync(join(downloadDir, name), 'latin1'), /^%PDF-1\.4/,
        `${name} must be a generated PDF file`);
    });

    for (const width of [320, 375, 430]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width, height: 900, deviceScaleFactor: 1, mobile: true
      });
      await new Promise((resolve) => setTimeout(resolve, 50));
      const layout = await evaluate(`(() => {
        const section = document.getElementById('certification-section');
        const canvas = document.getElementById('signature-canvas');
        const sectionRect = section.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        return {
          documentFits: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          sectionFits: section.scrollWidth <= section.clientWidth,
          canvasFits: canvasRect.left >= 0 && canvasRect.right <= window.innerWidth,
          sectionRight: sectionRect.right,
          viewportWidth: window.innerWidth
        };
      })()`);
      assert.equal(layout.documentFits, true, `${width}px document must not overflow horizontally`);
      assert.equal(layout.sectionFits, true, `${width}px signature section must not overflow horizontally`);
      assert.equal(layout.canvasFits, true, `${width}px signature canvas must fit the viewport`);
      assert.ok(layout.sectionRight <= layout.viewportWidth, `${width}px certification section must fit the viewport`);
    }
  } finally {
    cdp?.close();
    if (chrome.exitCode === null) {
      chrome.kill('SIGTERM');
      await new Promise((resolve) => chrome.once('exit', resolve));
    }
    rmSync(browserDir, { recursive: true, force: true });
  }
});

test('contains the complete editable W-9 page-one field contract in source order', () => {
  const html = source();
  const ids = [
    'taxpayer-name', 'business-name', 'classification-individual',
    'classification-c-corp', 'classification-s-corp', 'classification-partnership',
    'classification-trust', 'classification-llc', 'llc-code', 'classification-other',
    'foreign-owners', 'exempt-payee-code', 'fatca-code', 'street-address',
    'city', 'state', 'zip', 'requester-details', 'account-numbers',
    'tin-type-ssn', 'tin-type-ein', 'ssn', 'ein', 'certification-acknowledgment',
    'signature', 'signature-date'
  ];

  ids.forEach((id) => {
    assert.match(html, new RegExp(`id=["']${id}["']`), `${id} must exist`);
  });

  const ordered = [
    'taxpayer-section', 'classification-section', 'address-section',
    'tin-section', 'certification-section'
  ];
  let cursor = -1;
  ordered.forEach((id) => {
    const next = html.indexOf(`id="${id}"`);
    assert.ok(next > cursor, `${id} must follow the previous W-9 section`);
    cursor = next;
  });

  assert.match(html, /Do not send this form to the IRS/i);
  assert.match(html, /Không gửi trực tiếp[^.]*IRS/i);
});

test('declares mobile-first touch, safe-area, and US Letter print behavior', () => {
  const html = source();
  assert.match(html, /width=device-width,\s*initial-scale=1/);
  assert.match(html, /min-height:\s*44px/);
  assert.match(html, /env\(safe-area-inset-bottom/);
  assert.match(html, /@page\s*{[^}]*size:\s*Letter portrait/s);
  assert.match(html, /@media\s+print/);
  assert.match(html, /@media\s*\(min-width:\s*768px\)/);
});

test('keeps fieldset legends within valid phrasing content', () => {
  const html = source();
  const legends = [...html.matchAll(/<legend\b[\s\S]*?<\/legend>/g)].map((match) => match[0]);
  assert.equal(legends.length, 5);
  legends.forEach((legend) => assert.doesNotMatch(legend, /<h[1-6]\b/i));
});

test('keeps every section badge on one line', () => {
  const html = source();
  const baseRule = html.match(/\n    \.section-number\s*{([^}]*)}/);
  assert.ok(baseRule, 'base section-number rule must exist');
  assert.match(baseRule[1], /flex:\s*0\s+0\s+auto/);
  assert.match(baseRule[1], /white-space:\s*nowrap/);
  assert.match(
    html,
    /\.part-heading\s+\.section-number\s*{[^}]*flex:\s*0\s+0\s+auto/s
  );
});

test('keeps section header borders aligned across the fieldset', () => {
  const html = source();
  const headingRule = html.match(/\n    \.section-heading\s*{([^}]*)}/);
  assert.ok(headingRule, 'section-heading rule must exist');
  assert.match(headingRule[1], /width:\s*100%/);
  assert.match(headingRule[1], /float:\s*left/);
  assert.match(
    html,
    /\.section-heading\s*\+\s*\.section-content\s*{[^}]*clear:\s*both/s
  );
});

test('preserves section badges when printing', () => {
  const html = source();
  const rules = [...html.matchAll(/\.section-number\s*{([^}]*)}/g)];
  const printRule = rules.at(-1)?.[1] || '';
  assert.match(printRule, /color:\s*#fff/);
  assert.match(printRule, /background:\s*#000/);
  assert.match(printRule, /-webkit-print-color-adjust:\s*exact/);
  assert.match(printRule, /print-color-adjust:\s*exact/);
});

test('renders the clear-form action as a Reset text button', () => {
  const html = source();
  const button = html.match(/<button\b[^>]*id="clear-form"[^>]*>([\s\S]*?)<\/button>/);
  assert.ok(button, 'clear-form button must exist');
  assert.equal(button[1].replace(/<[^>]+>/g, '').trim(), 'Reset');
  assert.doesNotMatch(button[0], /\bbutton-icon\b/);
});

test('offers a complete Dev test fixture action', () => {
  const html = source();
  assert.match(html, /id="dev-fill"[^>]*>Dev: Fill test data<\/button>/);
  assert.match(html, /byId\("dev-fill"\)\.addEventListener\("click"/);
  assert.match(html, /applyValues\(createDevFixture\(/);
});

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

test('offers separate Print and Download PDF completion actions', () => {
  const html = source();
  assert.match(html, /id="print-form"[^>]*>Print<\/button>/);
  assert.match(html, /id="download-pdf"[^>]*>Download PDF<\/button>/);
});

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

test('wires Download PDF to a self-contained canvas and PDF blob flow', () => {
  const html = source();
  assert.match(html, /byId\("download-pdf"\)\.addEventListener\("click"/);
  assert.match(html, /document\.createElement\("canvas"\)/);
  assert.match(html, /buildImagePdf\(jpegBytes, canvas\.width, canvas\.height\)/);
  assert.match(html, /new window\.Blob\(\[pdfBytes\],\s*{ type: "application\/pdf" }\)/);
});

function api() {
  const html = source();
  const script = html.match(/<script id="w9-form-script">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'inline W-9 script must exist');
  const window = { W9_FORM_SKIP_INIT: true };
  window.window = window;
  const context = vm.createContext({ window, console, JSON, Date, TextEncoder, Uint8Array });
  vm.runInContext(script, context);
  assert.ok(window.W9_FORM_TEST_API, 'W-9 helper API must be exported');
  return window.W9_FORM_TEST_API;
}

test('creates a complete valid Dev fixture', () => {
  const helpers = api();
  const fixture = helpers.createDevFixture('2026-07-20');

  assert.equal(fixture.taxpayerName, 'Linh Nguyen');
  assert.equal(fixture.businessName, '');
  assert.equal(fixture.classification, 'individual');
  assert.equal(fixture.tinType, 'ssn');
  assert.equal(fixture.ssn, '123-45-6789');
  assert.equal(fixture.ein, '');
  assert.equal(fixture.requesterDetails, '');
  assert.equal(fixture.certificationAcknowledgment, true);
  assert.equal(fixture.signature, 'Linh Nguyen');
  assert.equal(fixture.signatureDate, '2026-07-20');
  assert.equal(fixture.signatureDrawn, true);
  assert.equal(Object.keys(helpers.validateValues(fixture)).length, 0);
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

test('formats and validates SSN and EIN by TIN type', () => {
  const form = api();
  assert.equal(form.formatTin('ssn', '123456789'), '123-45-6789');
  assert.equal(form.formatTin('ein', '123456789'), '12-3456789');
  assert.equal(form.isValidTin('ssn', '123-45-6789'), true);
  assert.equal(form.isValidTin('ein', '12-3456789'), true);
  assert.equal(form.isValidTin('ssn', '1234'), false);
});

test('shows line 3b only for flow-through classifications', () => {
  const form = api();
  assert.equal(form.line3bApplies('partnership', ''), true);
  assert.equal(form.line3bApplies('trust', ''), true);
  assert.equal(form.line3bApplies('llc', 'P'), true);
  assert.equal(form.line3bApplies('llc', 'S'), false);
  assert.equal(form.line3bApplies('individual', ''), false);
});

test('removes TIN and signature from the device-local draft', () => {
  const form = api();
  const draft = form.sanitizeDraft({
    taxpayerName: 'Amy Nguyen',
    businessName: 'Amy Nail Studio',
    ssn: '123-45-6789',
    ein: '12-3456789',
    signatureDrawn: true,
    signature: 'Amy Nguyen',
    signatureDate: '2026-07-20'
  });

  assert.equal(draft.taxpayerName, 'Amy Nguyen');
  assert.equal(draft.businessName, 'Amy Nail Studio');
  assert.equal('ssn' in draft, false);
  assert.equal('ein' in draft, false);
  assert.equal('signature' in draft, false);
  assert.equal('signatureDate' in draft, false);
  assert.equal('signatureDrawn' in draft, false);
});

test('returns field-specific errors for missing and conditional values', () => {
  const form = api();
  const errors = form.validateValues({
    classification: 'llc',
    llcCode: '',
    tinType: 'ssn',
    ssn: '123'
  });

  assert.equal(errors.taxpayerName, 'Enter the name shown on your tax return.');
  assert.equal(errors.llcCode, 'Choose C, S, or P for the LLC.');
  assert.equal(errors.streetAddress, 'Enter your street address.');
  assert.equal(errors.ssn, 'Enter a valid 9-digit SSN.');
  assert.equal(errors.certificationAcknowledgment, 'Accept the certification to continue.');
  assert.equal(errors.signature, 'Type your full legal name to sign.');
});

test('accepts a complete U.S. address and certification while rejecting invalid state and ZIP values', () => {
  const form = api();
  const valid = {
    taxpayerName: 'Amy Nguyen',
    classification: 'individual',
    streetAddress: '100 Main Street',
    city: 'Houston',
    state: 'TX',
    zip: '77002-1234',
    tinType: 'ssn',
    ssn: '123-45-6789',
    certificationAcknowledgment: true,
    signatureDrawn: true,
    signature: 'Amy Nguyen',
    signatureDate: '2026-07-20'
  };

  assert.deepEqual(Object.keys(form.validateValues(valid)), []);
  const invalid = form.validateValues({ ...valid, state: 'ZZ', zip: '1234' });
  assert.equal(invalid.state, 'Enter a valid 2-letter U.S. state or territory code.');
  assert.equal(invalid.zip, 'Enter a valid 5-digit ZIP or ZIP+4.');
});

test('builds downloadable PDF bytes and a safe filename without external libraries', () => {
  const form = api();
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]);
  const pdf = form.buildImagePdf(jpeg, 1275, 1650);
  const text = Buffer.from(pdf).toString('latin1');

  assert.match(text, /^%PDF-1\.4/);
  assert.match(text, /\/Subtype \/Image/);
  assert.match(text, /\/MediaBox \[0 0 612 792\]/);
  assert.match(text, /\/Length 4/);
  assert.match(text, /%%EOF\s*$/);
  assert.equal(form.safePdfFilename('Amy Nguyễn / Studio'), 'Form-W9-Amy-Nguyen-Studio.pdf');
});

test('maps every completed W-9 group into printable PDF rows', () => {
  const form = api();
  const rows = form.pdfFieldRows({
    taxpayerName: 'Amy Nguyen',
    businessName: 'Amy Nail Studio',
    classification: 'llc',
    llcCode: 'S',
    foreignOwners: false,
    exemptPayeeCode: '5',
    fatcaCode: 'A',
    streetAddress: '100 Main Street',
    city: 'Houston',
    state: 'TX',
    zip: '77002',
    requesterDetails: 'Nexora Touch, Houston TX',
    accountNumbers: 'acct-1002',
    tinType: 'ein',
    ein: '12-3456789',
    backupWithholdingSubject: false,
    signatureDrawn: true,
    signature: 'Amy Nguyen',
    signatureDate: '2026-07-20'
  });
  const fields = Object.fromEntries(rows.map((row) => [row.label, row.value]));

  assert.equal(fields['1 Name'], 'Amy Nguyen');
  assert.equal(fields['2 Business name'], 'Amy Nail Studio');
  assert.equal(fields['3a Federal tax classification'], 'LLC - S corporation');
  assert.equal(fields['4 Exemptions'], 'Payee code 5; FATCA code A');
  assert.equal(fields['5-6 Address'], '100 Main Street, Houston, TX 77002');
  assert.equal(fields['Requester'], 'Nexora Touch, Houston TX');
  assert.equal(fields['7 Account number(s)'], 'acct-1002');
  assert.equal(fields['Part I - EIN'], '12-3456789');
  assert.equal(fields['Backup withholding'], 'Not subject');
  assert.equal(fields['Signature'], 'Amy Nguyen');
  assert.equal(fields['Date'], '07/20/2026');
});
