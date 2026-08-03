import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE_URL = new URL('./qr-stations.html', import.meta.url);
const SHELL_URL = new URL('../assets/nexora-shell.js', import.meta.url);
const CSS_URL = new URL('../assets/qr-stations.css', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'qr-stations.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

function shellSource() {
  assert.ok(existsSync(SHELL_URL), 'nexora-shell.js must exist');
  return readFileSync(SHELL_URL, 'utf8');
}

function cssSource() {
  assert.ok(existsSync(CSS_URL), 'qr-stations.css must exist');
  return readFileSync(CSS_URL, 'utf8');
}

test('creates the QR Stations page from the shared merchant shell', () => {
  const html = source();

  assert.match(html, /<title>Nexora Touch - QR Stations<\/title>/);
  assert.match(html, /window\.NEXORA_SHELL\s*=\s*\{[\s\S]*activePage:\s*'stations'[\s\S]*activeTab:\s*'qr-stations'/);
  assert.match(html, /<aside class="sidebar"[^>]*><\/aside>/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content qr-stations-page" aria-label="QR Stations content">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-shell\.js"><\/script>/);
});

test('renders the salon QR station dashboard shown in the mockup', () => {
  const html = source();

  assert.match(html, /<h1[^>]*>Stations &amp; QR Codes<\/h1>/);
  for (const [label, value] of [
    ['Total Stations', '3'],
    ['Active NFC Stands', '0'],
    ['Total Scans', '272'],
    ['Device Issues', '0']
  ]) {
    assert.match(html, new RegExp(`<span class="qr-stat-label">${label}<\\/span>[\\s\\S]*?<strong>${value}<\\/strong>`));
  }
  assert.match(html, /class="qr-add-station"[\s\S]*data-lucide="plus"[\s\S]*<span>Add Station<\/span>/);

  for (const [name, scans, revenue] of [
    ['332332', '11', '\\$0\\.00'],
    ['Front Desk', '5', '\\$0\\.00'],
    ['Master Store', '256', '\\$11,217\\.36']
  ]) {
    assert.match(html, new RegExp(`<article class="qr-station-card"[\\s\\S]*?<h2>${name}<\\/h2>[\\s\\S]*?Scans:<\\/span>\\s*<strong>${scans}<\\/strong>[\\s\\S]*?Revenue:<\\/span>\\s*<strong class="qr-revenue">(?:${revenue})<\\/strong>`));
  }
  assert.equal((html.match(/class="qr-code-frame"/g) || []).length, 3);
  assert.equal((html.match(/class="qr-link-device"/g) || []).length, 3);
});

test('links Stations & QR Codes sidebar items to the QR Stations page', () => {
  const shell = shellSource();

  assert.match(shell, /stations:\s*'qr-stations\.html'/);
  assert.match(shell, /key:\s*'stations'[\s\S]*page:\s*'stations'[\s\S]*label:\s*'QR Stations',\s*tab:\s*'qr-stations'/);
});

test('keeps QR Stations dense on tablet and phone viewports', () => {
  const css = cssSource();

  const tabletMedia = /@media \(max-width: 900px\) \{[\s\S]*?\n\}/.exec(css)?.[0] || '';
  assert.match(tabletMedia, /\.qr-stats-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(tabletMedia, /\.qr-station-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);

  const phoneMedia = /@media \(max-width: 520px\) \{[\s\S]*$/.exec(css)?.[0] || '';
  assert.match(phoneMedia, /\.qr-stations-shell\s*\{[^}]*gap:\s*12px/);
  assert.match(phoneMedia, /\.qr-stats-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(phoneMedia, /\.qr-stat-card\s*\{[^}]*min-height:\s*58px;[^}]*padding:\s*10px 12px/);
  assert.match(phoneMedia, /\.qr-station-grid\s*\{[^}]*gap:\s*10px/);
  assert.match(phoneMedia, /\.qr-station-card\s*\{[^}]*grid-template-columns:\s*76px minmax\(0, 1fr\);[^}]*padding:\s*18px 10px 10px/);
  assert.match(phoneMedia, /\.qr-code-frame\s*\{[^}]*width:\s*68px;[^}]*height:\s*68px/);
  assert.match(phoneMedia, /\.qr-code-art\s*\{[^}]*width:\s*52px;[^}]*height:\s*52px/);
  assert.match(phoneMedia, /\.qr-link-device\s*\{[^}]*min-height:\s*30px/);
});
