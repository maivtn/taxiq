import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE_URL = new URL('./nexora-review.html', import.meta.url);
const CSS_URL = new URL('../assets/nexora-review.css', import.meta.url);
const SHELL_CSS_URL = new URL('../assets/nexora-shell.css', import.meta.url);
const JS_URL = new URL('../assets/nexora-review.js', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'nexora-review.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

test('creates the Nexora Review page from the shared merchant shell', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Reviews<\/title>/);
  assert.match(html, /<aside class="sidebar"/);
  assert.match(html, /<header class="header">/);
  assert.match(html, /<main class="content" aria-label="Reviews content">/);
  assert.match(html, /<h1[^>]*class="page-title"[^>]*>Reviews<\/h1>/);
  assert.match(html, /activePage:\s*'review'/);
});

test('renders store source cards and review workspace controls', () => {
  const html = source();
  const runtime = readFileSync(JS_URL, 'utf8');
  const page = html + runtime;
  assert.match(page, /data-review-source/);
  for (const sourceName of ['nexora', 'google', 'yelp']) {
    assert.match(page, new RegExp(`source:\\s*'${sourceName}'`));
  }
  for (const tab of ['store', 'technician']) {
    assert.match(page, new RegExp(`data-review-tab="${tab}"`));
  }
  assert.match(page, /data-review-search/);
  assert.match(page, /data-rating-filter/);
  assert.match(page, /data-period-filter/);
  assert.match(page, /data-review-list/);
  assert.match(page, /data-technician-list/);
});

test('keeps source scope and initials-only avatar contracts explicit', () => {
  const html = source();
  const runtime = readFileSync(JS_URL, 'utf8');
  const page = html + runtime;
  assert.match(page, /Store reviews/);
  assert.match(page, /Technician reviews/);
  assert.match(page, /data-avatar-initials/);
  assert.match(page, /Google/);
  assert.match(page, /Yelp/);
  assert.match(runtime, /source === 'nexora'/);
});

test('loads page-scoped review assets after shared shell assets', () => {
  const html = source();
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-review\.css">/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-review\.js"><\/script>/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-shell\.js"><\/script>/);
  assert.match(readFileSync(JS_URL, 'utf8'), /const REVIEW_DATA/);
});

test('provides accessible active states and a live empty state', () => {
  const html = source();
  assert.match(html, /role="tablist"/);
  assert.match(html, /role="tab"[^>]*aria-selected="true"/);
  assert.match(html, /role="tabpanel"/);
  assert.match(html, /data-review-empty[^>]*role="status"[^>]*aria-live="polite"/);
});

test('contains responsive review styles with visible focus treatment', () => {
  const css = readFileSync(CSS_URL, 'utf8');
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*2px\s+solid/);
  assert.match(css, /\.review-source-grid/);
  assert.match(css, /\.review-technician-layout/);
});

test('keeps search and filter controls at the same toolbar height', () => {
  const css = readFileSync(CSS_URL, 'utf8');
  assert.match(css, /\.review-toolbar\s*\{[\s\S]*?align-items:\s*end/);
  assert.match(css, /\.review-search-field\s*\{[\s\S]*?align-self:\s*end/);
  assert.match(css, /\.review-search-field input,\s*\.review-filter-field select\s*\{[\s\S]*?height:\s*42px/);
});

test('defines the three review sources and technician-only scope', () => {
  const runtime = readFileSync(JS_URL, 'utf8');
  for (const source of ['nexora', 'google', 'yelp']) assert.match(runtime, new RegExp(`source:\\s*'${source}'`));
  assert.match(runtime, /source === 'nexora'/);
  assert.match(runtime, /technicianId/);
  assert.match(runtime, /REFERENCE_DATE/);
  assert.match(runtime, /function getFilteredReviews/);
  assert.match(runtime, /function renderTechnicianList/);
  assert.match(runtime, /data-avatar-initials/);
  assert.doesNotMatch(runtime, /<img[^>]+avatar/i);
});

test('supports required filters and client-side interaction hooks', () => {
  const html = source();
  const runtime = readFileSync(JS_URL, 'utf8');
  for (const value of ['30', '90', '365', 'all', '5', '4', '3', '2', '1']) assert.match(html + runtime, new RegExp(`['"]${value}['"]`));
  assert.match(runtime, /addEventListener\('input'/);
  assert.match(runtime, /addEventListener\('change'/);
  assert.match(runtime, /renderAll\(\)/);
});

test('loads and applies the Inter font used by the Nexora shell', () => {
  const html = source();
  const css = readFileSync(CSS_URL, 'utf8');
  assert.match(html, /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">/);
  assert.match(css, /html,\s*body\s*\{[\s\S]*?font-family:\s*["']Inter["']/);
});

test('keeps the fixed sidebar width aligned with the desktop content offset', () => {
  const shellCss = readFileSync(SHELL_CSS_URL, 'utf8');
  assert.match(shellCss, /\*,\s*\*::before,\s*\*::after\s*\{[\s\S]*?box-sizing:\s*border-box/);
  assert.match(shellCss, /@media\s*\(min-width:\s*1024px\)[\s\S]*?\.app-area\s*\{[\s\S]*?padding-left:\s*288px/);
});

test('matches booking shell content spacing across responsive breakpoints', () => {
  const shellCss = readFileSync(SHELL_CSS_URL, 'utf8');
  assert.match(shellCss, /\.content\s*\{[\s\S]*?min-height:\s*calc\(100vh\s*-\s*64px\)[\s\S]*?padding:\s*16px\s+16px\s+96px/);
  assert.match(shellCss, /@media\s*\(min-width:\s*640px\)[\s\S]*?\.content\s*\{[\s\S]*?padding:\s*24px\s+24px\s+96px/);
  assert.match(shellCss, /@media\s*\(min-width:\s*1024px\)[\s\S]*?\.content\s*\{[\s\S]*?padding:\s*28px/);
});
