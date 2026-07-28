const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'pos-phase-1.html'), 'utf8');

test('POS exposes a mode switch modal with the three selectable demo accounts', () => {
  assert.match(html, /data-pos-mode-open/);
  assert.match(html, /data-pos-mode-modal[^>]*role="dialog"/);
  assert.match(html, /data-pos-mode-pin/);
  assert.match(html, /data-pos-mode-submit/);
  assert.match(html, /data-pos-mode-close/);
  assert.match(html, /data-pos-mode-error[^>]*aria-live="polite"/);
  assert.match(html, /data-pos-role="owner"/);
  assert.match(html, /data-pos-role="manager"/);
  assert.match(html, /data-pos-role="frontdesk"/);
});

test('POS mode uses the demo PIN and applies Front Desk management visibility', () => {
  assert.match(html, /var POS_DEMO_PIN = ['"]1234['"]/);
  assert.match(html, /function applyPosModeAccess\(/);
  assert.match(html, /managementTab\.hidden = isFrontDesk/);
  assert.match(html, /managementPanel\.hidden = isFrontDesk/);
  assert.match(html, /if \(isFrontDesk && activeTabId === ['"]management['"]\) activateTab\(['"]dispatch['"]\)/);
});

test('POS rejects direct Management activation for Front Desk mode', () => {
  assert.match(html, /if \(id === ['"]management['"] && getActiveStaff\(\)\.role === ['"]frontdesk['"]\) id = ['"]dispatch['"]/);
});

test('POS mode UI exposes a labelled badge and keyboard-friendly PIN controls', () => {
  assert.match(html, /data-pos-mode-badge-text/);
  assert.match(html, /id="pos-mode-title"/);
  assert.match(html, /id="pos-mode-pin"[^>]*type="password"/);
  assert.match(html, /id="pos-mode-pin"[^>]*inputmode="numeric"/);
  assert.match(html, /aria-labelledby="pos-mode-title"/);
});
