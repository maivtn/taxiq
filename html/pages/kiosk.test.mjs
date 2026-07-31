import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const pagesDir = path.dirname(new URL(import.meta.url).pathname);
const html = fs.readFileSync(path.join(pagesDir, 'kiosk.html'), 'utf8');
const posHtml = fs.readFileSync(path.join(pagesDir, 'pos-phase-1.html'), 'utf8');

test('kiosk exposes a wired check-in button and keeps it disabled until required input exists', () => {
  assert.match(html, /id="checkinBtn"[^>]*type="button"/);
  assert.match(html, /checkinBtn\.addEventListener\(['"]click['"],\s*checkIn\)/);
  assert.match(html, /function updateCheckinButton\(\)[\s\S]*?checkinBtn\.disabled\s*=\s*!\(/);
  assert.match(html, /nameInput\.addEventListener\(['"]input['"]\s*,\s*updateCheckinButton\)/);
  assert.match(html, /serviceList\.addEventListener\(['"]click['"]\s*,\s*toggleService\)/);
});

test('kiosk bootstraps the shared POS state before check-in when POS has not been opened', () => {
  assert.match(html, /function ensureSharedState\(\)[\s\S]*?NexoraPosData\.createState\(\)[\s\S]*?NexoraStore\.save\(state\)/);
  assert.match(html, /const state = ensureSharedState\(\);[\s\S]*?NexoraStore\.update\(/);
  assert.match(html, /pendingCheckins\.unshift\(/);
  assert.match(html, /customers\.some\(/);
});

test('kiosk loads its local menu and exposes a retry-safe submit flow', () => {
  assert.match(html, /const MENU_DATA_URL\s*=\s*['"]\.\.\/menu\/menu\.json['"]/);
  assert.match(html, /let submitting = false/);
  assert.match(html, /if \(submitting\) return/);
  assert.match(html, /finally\s*\{\s*submitting = false/);
  assert.match(html, /window\.checkIn\s*=\s*checkIn/);
});

test('POS opens the repository kiosk page instead of the stale external mockup', () => {
  assert.match(posHtml, /href="kiosk\.html"[^>]*target="_blank"/);
  assert.doesNotMatch(posHtml, /pos-nexoratouch\.vercel\.app\/mockups\/phase1\/kiosk\.html/);
});
