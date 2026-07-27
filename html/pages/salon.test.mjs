import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE_URL = new URL('./salon.html', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'salon.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

test('creates the empty Salon page from the shared merchant shell', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Salon<\/title>/);
  assert.match(html, /<div class="shell">/);
  assert.match(html, /<aside class="sidebar"[^>]*><\/aside>/);
  assert.match(html, /<div class="app-area">/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content" aria-label="Salon content"><\/main>/);
});

test('loads the shared shell assets for the Salon page', () => {
  const html = source();
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-shell\.js"><\/script>/);
});
