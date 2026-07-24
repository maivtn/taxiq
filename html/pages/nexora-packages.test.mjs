import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE_URL = new URL('./nexora-packages.html', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'nexora-packages.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

test('creates the empty Package Management page from the shared shell', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Quản lý gói<\/title>/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<aside class="sidebar" aria-label="Dashboard sidebar"><\/aside>/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content" aria-label="Package management content"><\/main>/);
  assert.match(html, /activePage:\s*'packages'/);
});

test('keeps package content intentionally empty', () => {
  const html = source();
  const main = html.match(/<main class="content" aria-label="Package management content">([\s\S]*?)<\/main>/);
  assert.ok(main, 'package content frame must exist');
  assert.equal(main[1].trim(), '', 'package content must stay empty for now');
  assert.doesNotMatch(html, /package-card|package-filter|data-package|Package data/i);
});
