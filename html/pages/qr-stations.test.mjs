import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const PAGE_URL = new URL('./qr-stations.html', import.meta.url);
const SHELL_URL = new URL('../assets/nexora-shell.js', import.meta.url);
const CSS_URL = new URL('../assets/qr-stations.css', import.meta.url);
const ONEQR_URL = new URL('../assets/qr-stations-oneqr.js', import.meta.url);
const QRCODE_URL = new URL('../assets/qr-stations-qrcode.js', import.meta.url);
const WORKFLOWS_URL = new URL('../assets/qr-stations-workflows.js', import.meta.url);
const require = createRequire(import.meta.url);

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

function workflowPanel(html, id) {
  const start = html.indexOf(`<section id="qr-panel-${id}"`);
  assert.notEqual(start, -1, `${id} panel must exist`);
  const nextPanel = html.indexOf('<section id="qr-panel-', start + 1);
  return html.slice(start, nextPanel === -1 ? html.length : nextPanel);
}

function workflowApi() {
  assert.ok(existsSync(WORKFLOWS_URL), 'qr-stations-workflows.js must exist');
  const path = fileURLToPath(WORKFLOWS_URL);
  delete require.cache[path];
  return require(path);
}

test('creates the QR Stations page from the shared merchant shell', () => {
  const html = source();

  assert.match(html, /<title>Nexora Touch - QR Stations<\/title>/);
  assert.match(html, /window\.NEXORA_SHELL\s*=\s*\{[\s\S]*activePage:\s*'stations'[\s\S]*activeTab:\s*'one-qr'/);
  assert.match(html, /<aside class="sidebar"[^>]*><\/aside>/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content qr-stations-page" aria-label="QR Stations content">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-shell\.js"><\/script>/);
});

test('opens OneQR first and exposes every requested QR workflow as a working tab', () => {
  const html = source();
  const oneqr = oneqrSource();
  const tablist = /<div class="qr-tabs"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/.exec(html)?.[1] || '';
  const tabs = Array.from(tablist.matchAll(/<button\b([^>]*)>[\s\S]*?<span>([^<]+)<\/span>\s*<\/button>/g)).map((match) => ({
    attributes: match[1],
    id: /data-qr-tab="([^"]+)"/.exec(match[1])?.[1] || '',
    label: match[2]
  }));
  const expectedTabs = [
    ['one-qr', 'OneQR'],
    ['qr-stations', 'Receive Tips'],
    ['accept-payment', 'Accept Payment'],
    ['referral-link', 'Referral Link'],
    ['staff-invite-qr', 'Staff Invite QR']
  ];

  assert.deepEqual(tabs.map(({ id, label }) => [id, label]), expectedTabs);
  assert.match(tabs[0].attributes, /class="qr-tab is-active"/);
  assert.match(tabs[0].attributes, /aria-selected="true"/);
  for (const tab of tabs.slice(1)) {
    assert.match(tab.attributes, /aria-selected="false"/);
    assert.match(tab.attributes, /tabindex="-1"/);
  }

  for (const [id] of expectedTabs) {
    const panel = new RegExp(`<section id="qr-panel-${id}"[^>]*data-qr-panel="${id}"[^>]*>`).exec(html)?.[0] || '';
    assert.ok(panel, `${id} must control a matching panel`);
    if (id === 'one-qr') assert.doesNotMatch(panel, /\shidden(?:\s|>)/);
    else assert.match(panel, /\shidden(?:\s|>)/);
  }
  assert.match(oneqr, /var defaultTab = 'one-qr'/);
});

test('uses the Lucide hand-coins icon for Receive Tips', () => {
  const html = source();
  const receiveTipsTab = /<button[^>]*data-qr-tab="qr-stations"[^>]*>[\s\S]*?<\/button>/.exec(html)?.[0] || '';

  assert.match(receiveTipsTab, /data-lucide="hand-coins"/);
});

test('fills the Accept Payment tab with its QR card and payout methods', () => {
  const html = source();
  const panel = workflowPanel(html, 'accept-payment');

  assert.doesNotMatch(panel, /qr-workflow-placeholder/);
  assert.match(panel, /Use your direct payment QR and manage the payout methods available to customers\./);
  assert.match(panel, /data-payment-qr-card[\s\S]*?<h2>aaa<\/h2>/);
  assert.match(panel, /data-qr-value="https:\/\/staging-web\.nexoratouch\.com\/pay\/3d1d5426-4a7d-476b-9a0d-b651b3020327"/);
  for (const action of ['view-payment-qr', 'copy-payment-link', 'download-payment-qr', 'payment-history']) {
    assert.match(panel, new RegExp(`data-workflow-action="${action}"`));
  }
  assert.match(panel, /<h2[^>]*>[\s\S]*Payout Methods[\s\S]*<\/h2>/i);
  for (const method of ['Zelle', 'Cash App', 'Venmo', 'VLINKPAY Wallet', 'Apple Cash', 'PayPal']) {
    assert.match(panel, new RegExp(`data-payout-method="${method}"`));
  }
  assert.equal((panel.match(/data-payout-toggle/g) || []).length, 6);
  assert.equal((panel.match(/data-payout-view/g) || []).length, 6);
  assert.equal((panel.match(/data-payout-edit/g) || []).length, 6);
});

test('fills the Referral Link tab with working left and right placement choices', () => {
  const html = source();
  const panel = workflowPanel(html, 'referral-link');

  assert.doesNotMatch(panel, /qr-workflow-placeholder/);
  assert.match(panel, /Share your affiliate link and choose where new members are placed in your network\./);
  assert.match(panel, /name="referral-placement"[^>]*value="left"[^>]*checked/);
  assert.match(panel, /name="referral-placement"[^>]*value="right"/);
  assert.match(panel, /data-referral-qr[^>]*data-qr-value="https:\/\/staging-web\.nexoratouch\.com\/\?ref=71C25492&amp;leg=left"/);
  assert.match(panel, /data-referral-link/);
  assert.match(panel, /data-workflow-action="download-referral-qr"/);
  assert.match(panel, /data-workflow-action="copy-referral-link"/);
});

test('fills the Staff Invite QR tab with an invite code and sharing actions', () => {
  const html = source();
  const panel = workflowPanel(html, 'staff-invite-qr');

  assert.doesNotMatch(panel, /qr-workflow-placeholder/);
  assert.match(panel, /Share this QR or join link to invite staff to your business\./);
  assert.match(panel, /Staff Invite Link/i);
  assert.match(panel, /data-staff-invite-qr[^>]*data-qr-value="https:\/\/staging-web\.nexoratouch\.com\/invite\/public\/blnexora\?ref=71C25492&amp;source=public_link"/);
  assert.match(panel, /data-staff-invite-link/);
  assert.match(panel, /data-workflow-action="copy-staff-invite"/);
  assert.match(panel, /data-workflow-action="share-staff-invite"/);
});

test('centers the Referral and Staff Invite cards in their flex panels', () => {
  const css = cssSource();
  const referralRule = /\.referral-card\s*\{([^}]*)\}/.exec(css)?.[1] || '';
  const staffRule = /\.staff-invite-card\s*\{([^}]*)\}/.exec(css)?.[1] || '';

  assert.match(referralRule, /align-self:\s*center/);
  assert.match(staffRule, /align-self:\s*center/);
});

test('builds deterministic referral URLs for both placement legs', () => {
  const workflows = workflowApi();

  assert.equal(workflows.buildReferralUrl('left'), 'https://staging-web.nexoratouch.com/?ref=71C25492&leg=left');
  assert.equal(workflows.buildReferralUrl('right'), 'https://staging-web.nexoratouch.com/?ref=71C25492&leg=right');
  assert.equal(workflows.buildReferralUrl('unexpected'), 'https://staging-web.nexoratouch.com/?ref=71C25492&leg=left');
});

test('includes the two workflow preview dialogs shown in the references', () => {
  const html = source();

  assert.match(html, /data-payment-qr-modal[^>]*aria-hidden="true"/);
  assert.match(html, /Customers scan to pay/i);
  assert.match(html, /Secure redirect by VLINKPAY/i);
  assert.match(html, /data-payout-modal[^>]*aria-hidden="true"/);
  assert.match(html, /data-payout-modal-method>Zelle</);
  assert.match(html, /data-payout-modal-name>David Nguyen</);
  assert.match(html, /data-payout-modal-account>jadepham290798@gmail\.com</);
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

test('uses the reference action hierarchy on station cards without changing station data', () => {
  const html = source();
  const cards = Array.from(html.matchAll(/<article class="qr-station-card">([\s\S]*?)<\/article>/g), (match) => match[1]);
  const expectedStations = [
    ['332332', '11', '$0.00'],
    ['Front Desk', '5', '$0.00'],
    ['Master Store', '256', '$11,217.36']
  ];

  assert.equal(cards.length, 3);
  cards.forEach((card, index) => {
    const [name, scans, revenue] = expectedStations[index];
    assert.match(card, new RegExp(`<div class="qr-station-main">[\\s\\S]*?<h2>${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/h2>`));
    assert.match(card, new RegExp(`Scans:<\\/span>\\s*<strong>${scans}<\\/strong>`));
    assert.match(card, new RegExp(`Revenue:<\\/span>\\s*<strong class="qr-revenue">${revenue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/strong>`));
    assert.match(card, /class="qr-station-quick-actions/);
    assert.match(card, /class="qr-station-action is-view"[\s\S]*?<span>View QR<\/span>/);
    assert.match(card, /class="qr-station-action is-copy"[\s\S]*?<span>Copy link<\/span>/);
    assert.match(card, /class="qr-station-footer"[\s\S]*?Paper QR Only[\s\S]*?class="qr-link-device"/);
  });
  assert.match(cards[0], /class="qr-station-action is-remove"[\s\S]*?<span>Remove<\/span>/);
  assert.doesNotMatch(cards[1], /is-remove/);
  assert.doesNotMatch(cards[2], /is-remove/);
});

test('lays station cards out in compact main, action, and footer rows', () => {
  const css = cssSource();
  const cardRule = /\.qr-station-card\s*\{([^}]*)\}/.exec(css)?.[1] || '';
  const mainRule = /\.qr-station-main\s*\{([^}]*)\}/.exec(css)?.[1] || '';
  const actionsRule = /\.qr-station-quick-actions\s*\{([^}]*)\}/.exec(css)?.[1] || '';
  const footerRule = /\.qr-station-footer\s*\{([^}]*)\}/.exec(css)?.[1] || '';

  assert.match(cardRule, /display:\s*flex/);
  assert.match(cardRule, /flex-direction:\s*column/);
  assert.match(mainRule, /display:\s*grid/);
  assert.match(mainRule, /grid-template-columns:\s*96px minmax\(0, 1fr\)/);
  assert.match(actionsRule, /display:\s*grid/);
  assert.match(actionsRule, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(footerRule, /justify-content:\s*space-between/);
});

test('registers the QR Stations page route in the shared shell', () => {
  const shell = shellSource();

  assert.match(shell, /stations:\s*'qr-stations\.html'/);
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
  assert.match(phoneMedia, /\.qr-station-main\s*\{[^}]*grid-template-columns:\s*76px minmax\(0, 1fr\)/);
  assert.match(phoneMedia, /\.qr-code-frame\s*\{[^}]*width:\s*68px;[^}]*height:\s*68px/);
  assert.match(phoneMedia, /\.qr-code-art\s*\{[^}]*width:\s*52px;[^}]*height:\s*52px/);
  assert.match(phoneMedia, /\.qr-link-device\s*\{[^}]*min-height:\s*30px/);
});

test('keeps Add Station compact like an AI Hub primary action', () => {
  const css = cssSource();
  const addStationRule = /\.qr-add-station\s*\{([^}]*)\}/.exec(css)?.[1] || '';

  assert.match(addStationRule, /align-self:\s*flex-start/);
  assert.match(addStationRule, /min-height:\s*38px/);
  assert.match(addStationRule, /gap:\s*7px/);
  assert.match(addStationRule, /padding:\s*0 14px/);
  assert.match(addStationRule, /font-size:\s*12px/);
  assert.match(addStationRule, /font-weight:\s*700/);
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
    assert.match(css, new RegExp(`body\\.is-printing-salon-qr \\[${selector}\\]\\s*\\{[\\s\\S]*width:\\s*62% !important`));
    assert.match(oneqr, new RegExp(`\\[${selector}\\] \\{ width:\\s*62% !important;`));
  }
  for (const selector of ['data-print-panel', 'data-print-benefits', 'data-print-steps', 'data-print-rewards-panel']) {
    assert.doesNotMatch(css, new RegExp(`body\\.is-printing-salon-qr \\[${selector}\\]\\s*\\{[^}]*width:\\s*8[048]%`));
    assert.doesNotMatch(oneqr, new RegExp(`\\[${selector}\\] \\{ width:\\s*8[048]%`));
  }
});

test('prints one OneQR bitmap in a square QR frame', () => {
  const oneqr = oneqrSource();

  assert.match(oneqr, /function pruneDuplicatePrintableQrBitmaps\(card\)/);
  assert.match(oneqr, /card\.querySelectorAll\('\.qr-code'\)\.forEach/);
  assert.match(oneqr, /querySelectorAll\('img:not\(\.qr-logo-img\)'\)/);
  assert.match(oneqr, /duplicate\.remove\(\);/);
  assert.match(oneqr, /\[data-salon-modal-qr\] \{ width:\s*285px !important; height:\s*285px !important; aspect-ratio:\s*1 \/ 1 !important;/);
  assert.match(oneqr, /\[data-salon-modal-qr\] > img:not\(\.qr-logo-img\), \[data-salon-modal-qr\] > canvas \{ width:\s*100% !important; height:\s*100% !important;/);
});

test('lets the OneQR Live Preview View All button show every enabled module', () => {
  const html = source();
  const oneqr = oneqrSource();

  assert.match(html, /id="oneqrPreviewTiles"[\s\S]*<button class="oneqr-phone-viewall" type="button" id="oneqrPreviewViewAll" aria-controls="oneqrPreviewTiles" aria-expanded="false">View All<\/button>/);
  assert.match(oneqr, /var PREVIEW_COLLAPSED_MODULE_LIMIT = 6/);
  assert.match(oneqr, /var previewExpanded = false/);
  assert.match(oneqr, /var previewViewAllBtn = document\.getElementById\('oneqrPreviewViewAll'\)/);
  assert.match(oneqr, /var allEnabledModules = order\.filter\(function \(name\) \{[\s\S]*return enabledSet\.has\(name\);[\s\S]*\}\)/);
  assert.match(oneqr, /previewModules = previewExpanded \? allEnabledModules : allEnabledModules\.slice\(0, PREVIEW_COLLAPSED_MODULE_LIMIT\)/);
  assert.match(oneqr, /previewViewAllBtn\.setAttribute\('aria-expanded', String\(previewExpanded\)\)/);
  assert.match(oneqr, /previewViewAllBtn\.addEventListener\('click', function \(\) \{[\s\S]*previewExpanded = !previewExpanded;[\s\S]*renderPreview\(\);[\s\S]*\}\)/);
});
