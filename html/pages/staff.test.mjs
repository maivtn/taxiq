import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE_URL = new URL('./staff.html', import.meta.url);
const CSS_URL = new URL('../assets/staff-shell.css', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'staff.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

test('creates the Staff page from the Salon shell with an empty content area', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Staff<\/title>/);
  assert.match(html, /<div class="shell">/);
  assert.match(html, /<aside class="sidebar staff-sidebar"[^>]*><\/aside>/);
  assert.match(html, /<div class="app-area">/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content" aria-label="Staff content"><\/main>/);
  assert.match(html, /activePage:\s*'staff'/);
});

test('loads staff shell styling after the shared shell styling', () => {
  const html = source();
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/staff-shell\.css">/);
  assert.match(html, /<script src="https:\/\/unpkg\.com\/lucide@1\.23\.0\/dist\/umd\/lucide\.min\.js"><\/script>/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-shell\.js"><\/script>/);
  const css = readFileSync(CSS_URL, 'utf8');
  assert.match(css, /\.staff-sidebar/);
  assert.match(css, /\.staff-sidebar \.staff-profile-panel/);
});

