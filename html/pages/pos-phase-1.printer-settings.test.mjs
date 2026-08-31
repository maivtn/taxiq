import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const here = path.dirname(fileURLToPath(import.meta.url));
const pagePath = path.join(here, 'pos-phase-1.html');
const runtimePath = path.join(here, '..', 'assets', 'pos-printer-settings.js');

function pageDom() {
  return new JSDOM(fs.readFileSync(pagePath, 'utf8'));
}

function runtimeHarness(runtime = 'native') {
  const dom = new JSDOM('<!doctype html><body></body>', {
    runScripts: 'outside-only',
    url: 'https://pos.example.test/'
  });
  const source = fs.existsSync(runtimePath) ? fs.readFileSync(runtimePath, 'utf8') : '';
  dom.window.eval(source);
  const root = dom.window.document.createElement('main');
  root.setAttribute('data-printer-settings-root', '');
  dom.window.document.body.append(root);
  return { dom, root, api: dom.window.NEXORA_POS_PRINTER_SETTINGS, source };
}

test('POS exposes an accessible Printer Settings tab and workspace', () => {
  const dom = pageDom();
  const document = dom.window.document;
  const tab = document.querySelector('[data-pos-tab="printer"]');
  const panel = document.querySelector('[data-pos-panel="printer"]');

  assert.ok(tab, 'Printer Settings should be reachable from the POS tabs');
  assert.match(tab.textContent, /Printer Settings/i);
  assert.equal(tab.getAttribute('role'), 'tab');
  assert.ok(panel, 'Printer Settings should have a matching POS panel');
  assert.equal(panel.getAttribute('aria-label'), 'Printer Settings');
  assert.ok(panel.querySelector('[data-printer-settings-root]'));
});

test('POS loads page-scoped Printer Settings styling', () => {
  const dom = pageDom();
  const stylesheet = dom.window.document.querySelector('link[rel="stylesheet"][href="../assets/pos-printer-settings.css"]');
  assert.ok(stylesheet, 'Printer Settings should load its POS-scoped responsive stylesheet');
});

test('Printer Settings switches between direct Star SDK and Safari PassPRNT workflows', () => {
  const { root, api } = runtimeHarness();
  assert.ok(api && typeof api.init === 'function', 'Printer Settings runtime should initialize the workspace');
  api.init(root, { runtime: 'native' });

  assert.match(root.textContent, /Star SDK/);
  assert.ok(root.querySelector('[data-printer-action="change-printer"]'));
  assert.ok(root.querySelector('[data-printer-action="disconnect"]'));

  root.querySelector('[data-printer-mode="safari"]').click();

  assert.match(root.textContent, /PassPRNT/);
  assert.ok(root.querySelector('[data-printer-action="install-passprnt"]'));
  assert.ok(root.querySelector('[data-printer-action="open-passprnt"]'));
  assert.equal(root.querySelector('[data-printer-action="change-printer"]'), null);
  assert.equal(root.querySelector('[data-printer-action="disconnect"]'), null);
});

test('Receipt Settings tracks unsaved changes, clamps copies to 0–3, and survives runtime changes', () => {
  const { root, api } = runtimeHarness();
  api.init(root, { runtime: 'native' });

  const initialSave = root.querySelector('[data-printer-action="save-settings"]');
  assert.ok(initialSave, 'Receipt Settings should provide one save action');
  assert.equal(initialSave.disabled, true);
  root.querySelector('[data-printer-preference="printProducts"]').click();
  assert.match(root.querySelector('[data-printer-save-state]').textContent, /Unsaved changes/i);
  assert.equal(root.querySelector('[data-printer-action="save-settings"]').disabled, false);

  for (let index = 0; index < 5; index += 1) {
    root.querySelector('[data-printer-adjust="cardCopies"][data-delta="1"]').click();
  }
  assert.equal(root.querySelector('[data-printer-copy-output="cardCopies"]').textContent, '3');
  assert.equal(root.querySelector('[data-printer-adjust="cardCopies"][data-delta="1"]').disabled, true);

  root.querySelector('[data-printer-mode="safari"]').click();
  assert.equal(root.querySelector('[data-printer-preference="printProducts"]').checked, false);
  assert.equal(root.querySelector('[data-printer-copy-output="cardCopies"]').textContent, '3');

  for (let index = 0; index < 5; index += 1) {
    root.querySelector('[data-printer-adjust="otherCopies"][data-delta="-1"]').click();
  }
  assert.equal(root.querySelector('[data-printer-copy-output="otherCopies"]').textContent, '0');
  assert.equal(root.querySelector('[data-printer-adjust="otherCopies"][data-delta="-1"]').disabled, true);

  root.querySelector('[data-printer-action="save-settings"]').click();
  assert.match(root.querySelector('[data-printer-save-state]').textContent, /All changes saved/i);
  assert.equal(root.querySelector('[data-printer-action="save-settings"]').disabled, true);
});

test('Native printer states gate Test Print and reconnect through discovered Star printers', async () => {
  const { dom, root, api } = runtimeHarness();
  api.init(root, { runtime: 'native' });

  const statusSelect = root.querySelector('[data-printer-status-simulator]');
  assert.ok(statusSelect, 'Native mode should expose prototype printer states');
  statusSelect.value = 'paperEmpty';
  statusSelect.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  assert.match(root.textContent, /Out of paper/);
  assert.match(root.textContent, /Replace the paper roll/);
  assert.equal(root.querySelector('[data-printer-action="test-print"]').disabled, true);

  root.querySelector('[data-printer-status-simulator]').value = 'paperLow';
  root.querySelector('[data-printer-status-simulator]').dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  assert.match(root.textContent, /Paper low/);
  assert.equal(root.querySelector('[data-printer-action="test-print"]').disabled, false);

  root.querySelector('[data-printer-action="disconnect"]').click();
  assert.match(root.textContent, /No printer connected/);
  root.querySelector('[data-printer-action="find-printer"]').click();

  const discovery = root.querySelector('[data-printer-discovery-modal]');
  assert.ok(discovery, 'Find printer should open the discovery workflow');
  assert.equal(discovery.getAttribute('aria-hidden'), 'false');
  discovery.querySelector('[data-printer-id="mcprint3"]').click();
  assert.match(root.textContent, /Connecting/);
  assert.equal(root.querySelector('[data-printer-action="test-print"]').disabled, true);

  await new Promise((resolve) => dom.window.setTimeout(resolve, 700));
  assert.match(root.textContent, /Star mC-Print3/);
  assert.match(root.textContent, /Ready/);
  assert.equal(root.querySelector('[data-printer-action="test-print"]').disabled, false);
});

test('Saved receipt preferences reload in a new Printer Settings workspace', () => {
  const { dom, root, api } = runtimeHarness();
  api.init(root, { runtime: 'native' });

  root.querySelector('[data-printer-preference="sortServices"]').click();
  root.querySelector('[data-printer-adjust="cardCopies"][data-delta="1"]').click();
  root.querySelector('[data-printer-action="save-settings"]').click();

  const reloadedRoot = dom.window.document.createElement('main');
  reloadedRoot.setAttribute('data-printer-settings-root', '');
  dom.window.document.body.append(reloadedRoot);
  api.init(reloadedRoot, { runtime: 'safari' });

  assert.equal(reloadedRoot.querySelector('[data-printer-preference="sortServices"]').checked, false);
  assert.equal(reloadedRoot.querySelector('[data-printer-copy-output="cardCopies"]').textContent, '2');
  assert.equal(reloadedRoot.querySelector('[data-printer-action="save-settings"]').disabled, true);
});

test('Safari Test Print reports only the latest PassPRNT result with date and time', async () => {
  const { dom, root, api } = runtimeHarness('safari');
  api.init(root, { runtime: 'safari' });

  const testPrint = root.querySelector('[data-printer-action="test-print"]');
  testPrint.click();
  assert.equal(root.querySelector('[data-printer-action="test-print"]').disabled, true);
  assert.match(root.querySelector('[data-printer-action="test-print"]').textContent, /Opening PassPRNT/i);

  await new Promise((resolve) => dom.window.setTimeout(resolve, 700));

  const result = root.querySelector('[data-printer-last-test]');
  assert.ok(result, 'PassPRNT callback should create a latest-test result');
  assert.match(result.textContent, /Test successful/);
  assert.match(result.textContent, /PassPRNT returned to POS/);
  const date = result.querySelector('.credits-history-date');
  assert.ok(date);
  assert.ok(date.querySelector('small'), 'The time should render on the second line');
  assert.equal(root.querySelector('[data-printer-action="test-print"]').disabled, false);
});

test('Native Test Print prevents duplicate requests until the current print finishes', async () => {
  const { dom, root, api } = runtimeHarness();
  api.init(root, { runtime: 'native' });

  root.querySelector('[data-printer-action="test-print"]').click();
  const pendingButton = root.querySelector('[data-printer-action="test-print"]');
  assert.equal(pendingButton.disabled, true);
  assert.match(pendingButton.textContent, /Printing/i);

  await new Promise((resolve) => dom.window.setTimeout(resolve, 700));
  assert.equal(root.querySelector('[data-printer-action="test-print"]').disabled, false);
  assert.match(root.querySelector('[data-printer-feedback]').textContent, /printed successfully/i);
});

test('Printer Settings chooses the integration workflow from the available runtime bridge', () => {
  const safariHarness = runtimeHarness();
  safariHarness.api.init(safariHarness.root);
  assert.match(safariHarness.root.textContent, /PassPRNT/);

  const nativeDom = new JSDOM('<!doctype html><body></body>', {
    runScripts: 'outside-only',
    url: 'https://pos.example.test/'
  });
  nativeDom.window.webkit = { messageHandlers: { starPrinter: {} } };
  nativeDom.window.eval(fs.readFileSync(runtimePath, 'utf8'));
  const nativeRoot = nativeDom.window.document.createElement('main');
  nativeRoot.setAttribute('data-printer-settings-root', '');
  nativeDom.window.document.body.append(nativeRoot);
  nativeDom.window.NEXORA_POS_PRINTER_SETTINGS.init(nativeRoot);
  assert.match(nativeRoot.textContent, /Star SDK/);
});

test('Native mode remembers the selected default printer and clears it on Disconnect', async () => {
  const { dom, root, api } = runtimeHarness();
  api.init(root, { runtime: 'native' });

  root.querySelector('[data-printer-action="change-printer"]').click();
  root.querySelector('[data-printer-id="mcprint3"]').click();
  await new Promise((resolve) => dom.window.setTimeout(resolve, 700));

  const reloadedRoot = dom.window.document.createElement('main');
  reloadedRoot.setAttribute('data-printer-settings-root', '');
  dom.window.document.body.append(reloadedRoot);
  api.init(reloadedRoot, { runtime: 'native' });
  assert.match(reloadedRoot.textContent, /Star mC-Print3/);

  reloadedRoot.querySelector('[data-printer-action="disconnect"]').click();
  const disconnectedRoot = dom.window.document.createElement('main');
  disconnectedRoot.setAttribute('data-printer-settings-root', '');
  dom.window.document.body.append(disconnectedRoot);
  api.init(disconnectedRoot, { runtime: 'native' });
  assert.match(disconnectedRoot.textContent, /No printer connected/);
});
