import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE_URL = new URL('./nexora-packages.html', import.meta.url);
const SHELL_CSS_URL = new URL('../assets/nexora-shell.css', import.meta.url);
const PACKAGE_CSS_URL = new URL('../assets/nexora-packages.css', import.meta.url);

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
  assert.match(html, /<main class="content" aria-label="Package management content">/);
  assert.match(html, /activePage:\s*'packages'/);
});

test('adds the package heading and ordered management tabs', () => {
  const html = source();
  assert.match(html, /<h1 class="page-title"[^>]*>Quản lý gói<\/h1>/);
  assert.match(html, /<p class="page-description"[^>]*>Quản lý các gói NEXORA, Voice và SMS cho salon\.<\/p>/);
  const tabs = [...html.matchAll(/data-package-tab="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(tabs, ['nexora', 'voice', 'sms']);
  assert.match(html, /role="tablist"/);
  assert.match(html, /NEXORA Package/);
  assert.match(html, /Voice \+ SMS/);
  assert.match(html, /SMS Credit/);
});

test('keeps package tab panels empty for the next implementation phase', () => {
  const html = source();
  const panels = [...html.matchAll(/<section[^>]*class="package-panel"[^>]*>([\s\S]*?)<\/section>/g)];
  assert.equal(panels.length, 3, 'each package tab must have an empty panel');
  for (const panel of panels) assert.equal(panel[1].trim(), '');
  assert.doesNotMatch(html, /package-card|package-filter|data-package-card|Package data/i);
});

test('loads package-specific presentation styles', () => {
  const html = source();
  const css = readFileSync(PACKAGE_CSS_URL, 'utf8');
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-packages\.css">/);
  assert.match(css, /\.package-tabs/);
  assert.match(css, /\.package-tab\.is-active/);
});

test('matches the Booking Hub tab treatment', () => {
  const html = source();
  const css = readFileSync(PACKAGE_CSS_URL, 'utf8');
  assert.equal((html.match(/class="package-tab-icon"/g) || []).length, 3);
  assert.match(css, /\.package-tab\s*\{[\s\S]*?border:\s*1px\s+solid\s+var\(--nexora-border\)/);
  assert.match(css, /\.package-tab\s*\{[\s\S]*?border-radius:\s*12px/);
  assert.match(css, /\.package-tab-icon\s*\{[\s\S]*?width:\s*28px[\s\S]*?height:\s*28px/);
  assert.match(css, /\.package-tab\.is-active\s*\{[\s\S]*?linear-gradient\(90deg,\s*var\(--nexora-electric\),\s*var\(--nexora-violet\)\)/);
});

test('applies the Inter font through the shared shell', () => {
  const shellCss = readFileSync(SHELL_CSS_URL, 'utf8');
  assert.match(shellCss, /html,\s*body\s*\{[\s\S]*?font-family:\s*["']Inter["']/);
});
