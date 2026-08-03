import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE_URL = new URL('./qr-stations.html', import.meta.url);
const SHELL_URL = new URL('../assets/nexora-shell.js', import.meta.url);
const CSS_URL = new URL('../assets/qr-stations.css', import.meta.url);
const ONEQR_URL = new URL('../assets/qr-stations-oneqr.js', import.meta.url);
const QRCODE_URL = new URL('../assets/qr-stations-qrcode.js', import.meta.url);

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

function oneqrSource() {
  assert.ok(existsSync(ONEQR_URL), 'qr-stations-oneqr.js must exist');
  return readFileSync(ONEQR_URL, 'utf8');
}

function qrCodeSource() {
  assert.ok(existsSync(QRCODE_URL), 'qr-stations-qrcode.js must exist');
  return readFileSync(QRCODE_URL, 'utf8');
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

test('keeps the OneQR print card in a 5 by 7 portrait ratio', () => {
  const html = source();
  const css = cssSource();
  const oneqr = oneqrSource();

  assert.match(html, /data-oneqr-print-card[^>]*data-salon-print-card/);
  assert.match(css, /@page\s*\{[\s\S]*?size:\s*5in 7in/);
  assert.match(oneqr, /width:\s*5in !important/);
  assert.match(oneqr, /height:\s*7in !important/);
  assert.doesNotMatch(oneqr, /printCard\.style\.width\s*=\s*'380px'/);
});

test('copies the Staff App salon QR modal and QR rendering contract', () => {
  const html = source();
  const css = cssSource();
  const oneqr = oneqrSource();
  const qrcode = qrCodeSource();

  assert.match(html, /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/);
  assert.match(html, /tailwind\.config\s*=\s*\{[\s\S]*nexoraInk:\s*'#050505'[\s\S]*boxShadow:\s*\{[\s\S]*phone:\s*'0 24px 68px rgba\(5, 5, 5, 0\.36\)'/);
  assert.match(html, /class="absolute inset-0 z-50 hidden items-center justify-center bg-nexoraInk\/45 px-3 backdrop-blur-sm"[^>]*data-oneqr-view-modal[^>]*data-salon-qr-modal/);
  assert.match(html, /class="relative min-h-\[720px\] w-full overflow-hidden bg-\[radial-gradient\(circle_at_50%_-4%,rgba\(255,255,255,0\.16\)_0,transparent_19%\),radial-gradient\(circle_at_14%_22%,rgba\(236,72,153,0\.34\)_0,transparent_25%\),radial-gradient\(circle_at_91%_58%,rgba\(34,211,238,0\.32\)_0,transparent_26%\),linear-gradient\(160deg,#050505_0%,#0B0F1A_46%,#111056_100%\)\] px-4 py-4"[^>]*data-oneqr-print-card[^>]*data-salon-print-card/);
  assert.match(html, /src="https:\/\/i\.ibb\.co\/mCt5J2dK\/Xexora-TOUCH-USPTO-03\.png"[^>]*class="h-auto w-\[118px\] object-contain drop-shadow-\[0_0_20px_rgba\(34,211,238,0\.48\)\]"[^>]*data-print-logo/);
  assert.match(html, /class="qr-code aspect-square w-\[255px\] rounded-\[18px\] border-\[9px\] border-white bg-white shadow-\[0_0_24px_rgba\(255,255,255,0\.18\)\]"[\s\S]*data-salon-modal-qr/);
  assert.match(html, /data-print-headline[\s\S]*?data-print-rewarded[\s\S]*?Pay, Tip, Review<br \/>&amp; Earn Rewards/);
  assert.match(html, /data-print-panel data-print-rewards-panel/);
  assert.match(html, /data-print-benefits/);
  assert.match(css, /\[data-salon-qr-modal\]\s+\[data-salon-print-card\]\s*\{[^}]*transform:\s*scale\(0\.84\);[^}]*margin-bottom:\s*-145px/);
  assert.match(oneqr, /printContent\.setAttribute\('data-print-content',\s*'salon-qr'\)/);
  assert.match(oneqr, /\[data-print-content="salon-qr"\][\s\S]*--print-scale:\s*0\.70/);
  assert.match(qrcode, /container\.classList\.contains\('qr-code'\)/);
  assert.match(qrcode, /logoBadge\.className\s*=\s*'qr-logo-mark'/);
});

test('prints the salon QR headline with the modal gradient colors', () => {
  const css = cssSource();
  const oneqr = oneqrSource();

  assert.match(css, /body\.is-printing-salon-qr \[data-print-rewarded\]\s*\{[\s\S]*background:\s*linear-gradient\(90deg, #F472B6 0%, #C084FC 50%, #67E8F9 100%\) !important;[\s\S]*-webkit-text-fill-color:\s*transparent !important/);
  assert.doesNotMatch(css, /body\.is-printing-salon-qr \[data-print-rewarded\]\s*\{[^}]*color:\s*#67E8F9/);
  assert.match(oneqr, /\[data-print-rewarded\] \{ background:\s*linear-gradient\(90deg, #F472B6 0%, #C084FC 50%, #67E8F9 100%\) !important;[\s\S]*-webkit-text-fill-color:\s*transparent !important/);
  assert.doesNotMatch(oneqr, /\[data-print-rewarded\] \{ background: none !important; color: #67E8F9/);
});

test('prints the salon QR lower cluster at a compact matching width', () => {
  const css = cssSource();
  const oneqr = oneqrSource();

  for (const selector of ['data-print-panel', 'data-print-benefits', 'data-print-steps', 'data-print-rewards-panel']) {
    assert.match(css, new RegExp(`body\\.is-printing-salon-qr \\[${selector}\\]\\s*\\{[\\s\\S]*width:\\s*70% !important`));
    assert.match(oneqr, new RegExp(`\\[${selector}\\] \\{ width:\\s*70% !important;`));
  }
  for (const selector of ['data-print-panel', 'data-print-benefits', 'data-print-steps', 'data-print-rewards-panel']) {
    assert.doesNotMatch(css, new RegExp(`body\\.is-printing-salon-qr \\[${selector}\\]\\s*\\{[^}]*width:\\s*8[048]%`));
    assert.doesNotMatch(oneqr, new RegExp(`\\[${selector}\\] \\{ width:\\s*8[048]%`));
  }
});

test('lets the OneQR Live Preview View All button show every enabled module', () => {
  const html = source();
  const oneqr = oneqrSource();

  assert.match(html, /id="oneqrPreviewTiles"[\s\S]*<button class="oneqr-phone-viewall" type="button" id="oneqrPreviewViewAll" aria-controls="oneqrPreviewTiles" aria-expanded="false">View All<\/button>/);
  assert.match(oneqr, /var PREVIEW_COLLAPSED_MODULE_LIMIT = 6/);
  assert.match(oneqr, /var previewExpanded = false/);
  assert.match(oneqr, /var previewViewAllBtn = document\.getElementById\('oneqrPreviewViewAll'\)/);
  assert.match(oneqr, /var allEnabledModules = MODULES\.filter\(function \(name\) \{[\s\S]*return enabled\.has\(name\);[\s\S]*\}\)/);
  assert.match(oneqr, /var previewModules = previewExpanded \? allEnabledModules : roleModules\.slice\(0, PREVIEW_COLLAPSED_MODULE_LIMIT\)/);
  assert.match(oneqr, /previewViewAllBtn\.setAttribute\('aria-expanded', String\(previewExpanded\)\)/);
  assert.match(oneqr, /previewViewAllBtn\.addEventListener\('click', function \(\) \{[\s\S]*previewExpanded = !previewExpanded;[\s\S]*renderPreview\(\);[\s\S]*\}\)/);
});
