import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE_URL = new URL('./owner-setting.html', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'owner-setting.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

function panelContent(html, panelId) {
  const escaped = panelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(new RegExp(`<section class="settings-panel" id="panel-${escaped}"[^>]*>([\\s\\S]*?)<\\/section>`));
  assert.ok(match, `panel-${panelId} must exist`);
  return match[1];
}

function styleRule(html, selector) {
  const style = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] || '';
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const match = style.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `CSS rule for "${selector}" must exist`);
  return match[1];
}

function assertCssDeclaration(rule, property, value) {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(rule, new RegExp(`${escapedProperty}\\s*:\\s*${escapedValue}\\s*;`));
}

function iconActionControls(html) {
  return html.match(/<(?:button|a) class="icon-action"[\s\S]*?<\/(?:button|a)>/g) || [];
}

test('creates the Owner Settings page from the shared merchant shell', () => {
  const html = source();
  assert.match(html, /<title>Nexora Touch - Account Settings<\/title>/);
  assert.match(html, /<div class="shell">/);
  assert.match(html, /<aside class="sidebar"[^>]*><\/aside>/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content" aria-label="Account Settings content">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-shell\.js"><\/script>/);
});

test('renders the requested Account Settings headline and tabs', () => {
  const html = source();
  assert.match(html, /<h1 class="page-title">Account Settings<\/h1>/);
  assert.match(html, /Manage your account info, payout methods, business details, and compliance verification\./);
  assert.match(html, /<div class="page-tabs" role="tablist" aria-label="Account settings sections">/);

  for (const tab of ['ACCOUNT', 'BUSINESS VERIFICATION', 'SUB ACCOUNT', 'AFFILIATE LINK', 'TERMS &amp; PRIVACY']) {
    assert.match(html, new RegExp(`<button class="page-tab[^"]*"[^>]*role="tab"[\\s\\S]*?<span class="page-tab-icon">[\\s\\S]*?<\\/span>[\\s\\S]*?<span>${tab}<\\/span>[\\s\\S]*?<\\/button>`));
  }
});

test('renders the Sub Account settings tab and management sections', () => {
  const html = source();
  assert.match(html, /<button class="page-tab[^"]*"[^>]*role="tab"[^>]*data-settings-tab="sub-account"[\s\S]*?<span>SUB ACCOUNT<\/span>[\s\S]*?<\/button>/);
  assert.match(html, /id="panel-sub-account"[\s\S]*?role="tabpanel"/);
  assert.match(html, /Manage Sub Account login accounts, role permissions, and activity logs under this owner account\./);

  const switcher = html.match(/<div class="booking-view-switch" role="group" aria-label="Sub account management views">([\s\S]*?)<\/div>/)?.[1] || '';
  assert.ok(switcher, 'Sub Account subtabs should use the booking view switch UI');

  for (const [view, label] of [['accounts', 'Sub Accounts'], ['roles', 'Roles'], ['logs', 'Activity Logs']]) {
    assert.match(switcher, new RegExp(`<button class="booking-view-button[^"]*"[^>]*aria-pressed="(?:true|false)"[^>]*data-sub-account-view="${view}"[\\s\\S]*?<span>${label}<\\/span>`));
  }
});

test('renders Sub Account tab content from the product design document', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');

  for (const label of ['Account', 'Role', 'Status', 'Last Login', 'Actions']) {
    assert.match(html, new RegExp(label));
  }

  for (const label of ['Active', 'Disabled', 'Pending', 'Activate', 'Deactivate', 'Reset password', 'Resend login email']) {
    assert.match(html, new RegExp(label));
  }

  for (const label of ['Add New Sub Account', 'Password', 'Display name', 'Login link', 'Create Sub Account']) {
    assert.match(html, new RegExp(label));
  }

  for (const label of ['Daily Limit', 'Owner Manager', 'Front Desk', 'Technician Lead']) {
    assert.match(html, new RegExp(label));
  }

  for (const label of ['Date range', 'Login success', 'Viewed transactions', 'Role changed']) {
    assert.match(html, new RegExp(label));
  }

  assert.doesNotMatch(panel, /\b[Ss]taff\b/);
});

test('uses Account as the first Sub Accounts list column', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');
  const tableMatch = panel.match(/<table class="owner-table is-account-table">([\s\S]*?)<\/table>/);

  assert.ok(tableMatch, 'Sub Accounts table should render');

  const accountTable = tableMatch[1];
  assert.match(accountTable, /<thead><tr><th>Account<\/th><th>Role<\/th><th>Status<\/th><th>Last Login<\/th><th>Actions<\/th><\/tr><\/thead>/);
  assert.doesNotMatch(accountTable, /<th>Email<\/th>|<th>Display Name<\/th>|class="identity-cell"|<span class="mini-avatar">/);

  for (const [email, name, phone] of [
    ['mai@nexoratouch.com', 'Mai Tran', '+1 832 555 0182'],
    ['amy.le@nexoratouch.com', 'Amy Le', '+1 713 555 0144'],
    ['jordan.reyes@nexoratouch.com', 'Jordan Reyes', '+1 281 555 0129']
  ]) {
    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedPhone = phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(accountTable, new RegExp(`<td><div class="cell-title">${escapedEmail}<\\/div><div class="cell-meta">${name}<\\/div><div class="cell-meta">${escapedPhone}<\\/div><\\/td>`));
  }
});

test('omits the Sub Accounts summary metrics', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');

  assert.doesNotMatch(panel, /class="subtab-metrics"/);
  assert.doesNotMatch(panel, /aria-label="Sub account summary"/);
  assert.doesNotMatch(panel, /Active staff/);
  assert.doesNotMatch(panel, /Pending invites/);
});

test('formats Sub Account dates with the shared two-line date time style', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');
  const tableMatch = panel.match(/<table class="owner-table is-account-table">([\s\S]*?)<\/table>/);
  const logTableMatch = panel.match(/<table class="owner-table is-log-table">([\s\S]*?)<\/table>/);

  assert.ok(tableMatch, 'Sub Accounts table should render');
  assert.ok(logTableMatch, 'Activity Logs table should render');

  const accountTable = tableMatch[1];
  assert.match(accountTable, /<th>Last Login<\/th>/);
  assert.match(accountTable, /<td><span class="credits-history-date">Aug 07, 2026<small>9:42 AM<\/small><\/span><\/td>/);
  assert.match(accountTable, /<td><div class="cell-title">Never<\/div><\/td>/);
  assert.match(accountTable, /<td><span class="credits-history-date">Aug 05, 2026<small>5:12 PM<\/small><\/span><\/td>/);
  assert.doesNotMatch(accountTable, /Chrome on Mac|Safari on iPad|Login email sent/);
  assert.doesNotMatch(accountTable, /Today 9:42 AM|Aug 7 &middot; 9:42 AM|Aug 5 &middot; 5:12 PM|Aug 5, 2026 5:12 PM/);

  const logTable = logTableMatch[1];
  const logTimeCells = logTable.match(/<td><span class="credits-history-date">[A-Z][a-z]{2} \d{2}, 2026<small>\d{1,2}:\d{2} [AP]M<\/small><\/span><\/td>/g) || [];
  assert.equal(logTimeCells.length, 5, 'Every Activity Logs Time cell should use date line plus small time line');
  assert.match(logTable, /<td><span class="credits-history-date">Aug 07, 2026<small>10:15 AM<\/small><\/span><\/td>/);
  assert.match(logTable, /<td><span class="credits-history-date">Aug 06, 2026<small>4:18 PM<\/small><\/span><\/td>/);
  assert.doesNotMatch(logTable, /Today 10:15 AM|Yesterday 4:18 PM|Aug 6, 2026 2:26 PM/);

  assert.match(html, /<div class="detail-row"><span>Last login<\/span><span class="detail-value"><span class="credits-history-date">Aug 07, 2026<small>9:42 AM<\/small><\/span><\/span><\/div>/);
});

test('uses Email as the Activity Logs account identifier', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');
  const logTableMatch = panel.match(/<table class="owner-table is-log-table">([\s\S]*?)<\/table>/);

  assert.ok(logTableMatch, 'Activity Logs table should render');

  const logTable = logTableMatch[1];
  assert.match(logTable, /<thead><tr><th>Time<\/th><th>Email<\/th><th>Role<\/th><th>Action<\/th><th>Module<\/th><th>Status<\/th><\/tr><\/thead>/);
  assert.doesNotMatch(logTable, /<th>Sub Account<\/th>|<th>IP Address<\/th>|<th>Device \/ Browser<\/th>/);
  assert.doesNotMatch(logTable, /104\.28\.32\.14|172\.56\.41\.18|198\.51\.100\.42|Chrome on Mac|Safari on iPhone|Edge on Windows/);

  for (const name of ['Mai Tran', 'Amy Le', 'Jordan Reyes']) {
    assert.doesNotMatch(logTable, new RegExp(`<td>${name}<\\/td>`));
  }

  assert.match(logTable, /<tr><td><span class="credits-history-date">Aug 07, 2026<small>10:15 AM<\/small><\/span><\/td><td>mai@nexoratouch\.com<\/td><td><span class="role-badge">Owner Manager<\/span><\/td>/);
});

test('keeps Activity Logs table typography balanced around 14px', () => {
  const html = source();

  const logCellRule = styleRule(html, '.owner-table.is-log-table td');
  assertCssDeclaration(logCellRule, 'font-size', '14px');
  assertCssDeclaration(logCellRule, 'line-height', '20px');

  const logDateRule = styleRule(html, '.owner-table.is-log-table .credits-history-date');
  assertCssDeclaration(logDateRule, 'font-size', '14px');
  assertCssDeclaration(logDateRule, 'line-height', '18px');

  const logTimeRule = styleRule(html, '.owner-table.is-log-table .credits-history-date small');
  assertCssDeclaration(logTimeRule, 'font-size', '11px');
  assertCssDeclaration(logTimeRule, 'line-height', '14px');

  const logRoleRule = styleRule(html, '.owner-table.is-log-table .role-badge');
  assertCssDeclaration(logRoleRule, 'font-size', '14px');
  assertCssDeclaration(logRoleRule, 'line-height', '20px');

  const logStatusRule = styleRule(html, '.owner-table.is-log-table .status-pill');
  assertCssDeclaration(logStatusRule, 'font-size', '14px');
  assertCssDeclaration(logStatusRule, 'line-height', '20px');
});

test('omits Sub Account pagination rows', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');

  assert.doesNotMatch(panel, /class="pagination-row"/);
  assert.doesNotMatch(panel, /Showing 1-10|Page 1 of 2|Rows per page: 25|Page 1 of 8|Go to page 1/);
  assert.doesNotMatch(html, /\.pagination-row\s*\{/);
});

test('links role actions to Role Details page with roleId parameters', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');

  for (const [roleId, roleName] of [['ROLE-001', 'Owner Manager'], ['ROLE-002', 'Front Desk'], ['ROLE-003', 'Technician Lead'], ['ROLE-004', 'Billing Auditor']]) {
    assert.match(panel, new RegExp(`<a class="icon-action" href="role-details\\.html\\?roleId=${roleId}" aria-label="View or Edit ${roleName} role">[\\s\\S]*?<span>View/Edit<\\/span><\\/a>`));
  }

  assert.doesNotMatch(panel, /<div class="role-detail-shell">/);
  assert.doesNotMatch(panel, /<h3 class="workflow-title">Role Detail<\/h3>/);
  assert.doesNotMatch(panel, /Configure permissions for this role/);
});

test('enables role delete only when no Sub Account is assigned and confirms delete', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');

  assert.match(panel, /<div class="cell-title">Billing Auditor<\/div><div class="cell-meta">ROLE-004<\/div>/);
  assert.match(panel, /<td>0 assigned<\/td>/);

  for (const [roleId, roleName, assignedCount] of [['ROLE-001', 'Owner Manager', '1'], ['ROLE-002', 'Front Desk', '6'], ['ROLE-003', 'Technician Lead', '3']]) {
    assert.match(panel, new RegExp(`<button class="icon-action" type="button" aria-label="Delete ${roleName} role" data-delete-role data-role-id="${roleId}" data-role-name="${roleName}" data-role-assigned-count="${assignedCount}" disabled aria-disabled="true">[\\s\\S]*?<span>Delete<\\/span><\\/button>`));
  }

  assert.match(panel, /<button class="icon-action" type="button" aria-label="Delete Billing Auditor role" data-delete-role data-role-id="ROLE-004" data-role-name="Billing Auditor" data-role-assigned-count="0"><i data-lucide="trash-2" aria-hidden="true"><\/i><span>Delete<\/span><\/button>/);
  assert.doesNotMatch(panel, /Delete Billing Auditor role"[^>]*disabled/);
  assert.match(html, /var roleDeleteButtons = Array\.prototype\.slice\.call\(document\.querySelectorAll\('\[data-delete-role\]'\)\);/);
  assert.match(html, /function assignedSubAccountCount\(button\)/);
  assert.match(html, /if \(assignedSubAccountCount\(button\) !== 0\) return;/);
  assert.match(html, /function showDeleteRoleConfirm\(button\)/);
  assert.match(html, /Swal\.fire\(\{[\s\S]*?title: 'Delete role\?'[\s\S]*?text: roleName \+ ' has no assigned Sub Accounts and will be removed\.'[\s\S]*?confirmButtonText: 'Delete Role'[\s\S]*?confirmButtonColor: '#dc2626'/);
  assert.match(html, /roleDeleteButtons\.forEach\(function \(button\) \{[\s\S]*?button\.addEventListener\('click', function \(\) \{[\s\S]*?showDeleteRoleConfirm\(button\);/);
});

test('creates a role with SweetAlert and routes to Role Details module settings', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');

  assert.match(panel, /<button class="owner-button is-primary" type="button" data-add-role><i data-lucide="shield-plus" aria-hidden="true"><\/i><span>Add Role<\/span><\/button>/);
  assert.match(html, /var addRoleButton = document\.querySelector\('\[data-add-role\]'\);/);
  assert.match(html, /function validateRoleName\(value\)/);
  assert.match(html, /trimmed\.length > 100/);
  assert.match(html, /Role name must be 100 characters or fewer\./);
  assert.match(html, /function roleIdFromName\(name\)/);
  assert.match(html, /function openRoleDetailsForNewRole\(roleName\)/);
  assert.match(html, /role-details\.html\?roleId=' \+ encodeURIComponent\(roleIdFromName\(roleName\)\) \+ '&roleName=' \+ encodeURIComponent\(roleName\)/);
  assert.match(html, /Swal\.fire\(\{[\s\S]*?title: 'Add Role'[\s\S]*?input: 'text'[\s\S]*?inputAttributes: \{ maxlength: '100'/);
  assert.match(html, /confirmButtonText: 'Add'/);
  assert.match(html, /inputValidator: function \(value\)/);
  assert.match(html, /title: 'Role added successfully'/);
  assert.match(html, /confirmButtonText: 'Set modules'/);
  assert.match(html, /addRoleButton\.addEventListener\('click', showAddRoleModal\)/);
});

test('defaults to the Sub Account settings tab on initial load', () => {
  const html = source();

  assert.match(html, /<button class="page-tab is-active"[^>]*id="tab-sub-account"[^>]*aria-selected="true"[^>]*tabindex="0"[^>]*data-settings-tab="sub-account"/);
  assert.match(html, /<button class="page-tab"[^>]*id="tab-account"[^>]*aria-selected="false"[^>]*tabindex="-1"[^>]*data-settings-tab="account"/);
  assert.match(html, /<section class="settings-panel" id="panel-account"[^>]*data-settings-panel="account" hidden>/);
  assert.match(html, /<section class="settings-panel" id="panel-sub-account"[^>]*data-settings-panel="sub-account">/);
  assert.match(html, /window\.NEXORA_SHELL = \{ activePage: 'owner-settings', activeTab: 'sub-account' \};/);
  assert.match(html, /var defaultTab = 'sub-account';/);
  assert.match(html, /function currentQueryView\(\)/);
  assert.match(html, /activateSubAccountView\(currentQueryView\(\), false\)/);
});

test('renders Sub Account content without the default settings-section chrome', () => {
  const html = source();

  assert.match(html, /<section class="settings-panel" id="panel-sub-account"[^>]*>\s*<article class="settings-section is-sub-account-frameless">/);

  const wrapperRule = styleRule(html, '.settings-section.is-sub-account-frameless');
  assertCssDeclaration(wrapperRule, 'border', '0');
  assertCssDeclaration(wrapperRule, 'border-radius', '0');
  assertCssDeclaration(wrapperRule, 'background', 'transparent');
  assertCssDeclaration(wrapperRule, 'box-shadow', 'none');
  assertCssDeclaration(wrapperRule, 'overflow', 'visible');

  const headRule = styleRule(html, '.settings-section.is-sub-account-frameless > .section-head');
  assertCssDeclaration(headRule, 'border-bottom', '0');
  assertCssDeclaration(headRule, 'padding', '0');

  const bodyRule = styleRule(html, '.settings-section.is-sub-account-frameless > .section-body');
  assertCssDeclaration(bodyRule, 'padding', '0');
});

test('renders the Sub Account header without the redundant title and section icon', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');
  const headerMatch = panel.match(/<div class="section-head">([\s\S]*?)<\/div>\s*<div class="section-body">/);

  assert.ok(headerMatch, 'Sub Account header should render before the tab body');
  assert.doesNotMatch(panel, /<span class="section-icon">/);
  assert.doesNotMatch(panel, /<h2 class="section-title">Sub account access<\/h2>/);
  assert.doesNotMatch(headerMatch[1], /Add New Sub Account/);
  assert.match(panel, /Manage Sub Account login accounts, role permissions, and activity logs under this owner account\./);
});

test('places Add New Sub Account beside the Sub Accounts search controls', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');
  const filterRowMatch = panel.match(/<div class="filter-row is-account-filters">([\s\S]*?)<\/div>\s*<button class="owner-button is-primary" type="button" data-open-modal="add-sub-account-modal"/);

  assert.ok(filterRowMatch, 'Sub Accounts filter row should render before the Add New Sub Account button');
  assert.match(panel, /<div class="sub-account-filter-bar">\s*<div class="filter-row is-account-filters">[\s\S]*?<span class="field-label">Search<\/span>[\s\S]*?<\/div>\s*<button class="owner-button is-primary" type="button" data-open-modal="add-sub-account-modal" aria-controls="add-sub-account-modal" aria-haspopup="dialog">[\s\S]*?<span>Add New Sub Account<\/span><\/button>\s*<\/div>/);
  assert.match(filterRowMatch[1], /<span class="field-label">Search<\/span>/);
  assert.match(filterRowMatch[1], /<span class="field-label">Status<\/span>/);
  assert.match(filterRowMatch[1], /<span class="field-label">Role<\/span>/);
  assert.doesNotMatch(filterRowMatch[1], /Rows per page|Go to page/);

  const filterBarRule = styleRule(html, '.sub-account-filter-bar');
  assertCssDeclaration(filterBarRule, 'grid-template-columns', 'minmax(0, 1fr) auto');
  const accountFilterRule = styleRule(html, '.filter-row.is-account-filters');
  assertCssDeclaration(accountFilterRule, 'grid-template-columns', 'minmax(220px, 1fr) repeat(2, minmax(120px, 160px))');
  assert.match(panel, /<span>Add New Sub Account<\/span>/);
});

test('renders Add New Sub Account and Sub Account Detail as modal dialogs', () => {
  const html = source();

  assert.match(html, /<button class="owner-button is-primary" type="button"[^>]*data-open-modal="add-sub-account-modal"[^>]*aria-controls="add-sub-account-modal"[^>]*aria-haspopup="dialog"/);
  assert.match(html, /aria-label="View mai@nexoratouch\.com"[^>]*data-open-modal="sub-account-detail-modal"[^>]*aria-controls="sub-account-detail-modal"/);
  for (const email of ['mai@nexoratouch.com', 'amy.le@nexoratouch.com', 'jordan.reyes@nexoratouch.com']) {
    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(html, new RegExp(`aria-label="Edit ${escapedEmail}"[^>]*data-open-modal="edit-sub-account-modal"[^>]*aria-controls="edit-sub-account-modal"`));
  }
  assert.match(html, /<div class="owner-modal" id="add-sub-account-modal" role="dialog" aria-modal="true" aria-labelledby="add-sub-account-modal-title" hidden>/);
  assert.match(html, /<div class="owner-modal" id="sub-account-detail-modal" role="dialog" aria-modal="true" aria-labelledby="sub-account-detail-modal-title" hidden>/);
  assert.match(html, /<div class="owner-modal" id="edit-sub-account-modal" role="dialog" aria-modal="true" aria-labelledby="edit-sub-account-modal-title" hidden>/);
  assert.match(html, /<h3 class="modal-title" id="add-sub-account-modal-title">Add New Sub Account<\/h3>/);
  assert.match(html, /<h3 class="modal-title" id="sub-account-detail-modal-title">Sub Account Detail<\/h3>/);
  assert.match(html, /<h3 class="modal-title" id="edit-sub-account-modal-title">Edit Sub Account<\/h3>/);
  assert.match(html, /data-close-modal="add-sub-account-modal"/);
  assert.match(html, /data-close-modal="sub-account-detail-modal"/);
  assert.match(html, /data-close-modal="edit-sub-account-modal"/);
  assert.doesNotMatch(html, /<div class="inline-workflow-grid">/);
  assert.doesNotMatch(html, /Add New Staff|Create Staff|Staff account created|staff login|staff is created|\/staff\/login/);
  assert.doesNotMatch(html, /Sub account detail preview/);

  const hiddenRule = styleRule(html, '.owner-modal[hidden]');
  assertCssDeclaration(hiddenRule, 'display', 'none');
  assert.match(html, /querySelectorAll\('\[data-open-modal\]'\)/);
  assert.match(html, /querySelectorAll\('\[data-close-modal\]'\)/);
  assert.match(html, /function openModal\(modalId\)/);
  assert.match(html, /function closeModal\(modalId\)/);
  assert.match(html, /function populateEditSubAccountModal\(button\)/);
});

test('opens Add New Sub Account with blank entry fields', () => {
  const html = source();
  const modalMatch = html.match(/<div class="owner-modal" id="add-sub-account-modal"[\s\S]*?<div class="owner-modal" id="edit-sub-account-modal"/);

  assert.ok(modalMatch, 'Add New Sub Account modal should render before Edit Sub Account modal');

  const modal = modalMatch[0];
  assert.match(modal, /<input class="field-input" type="email" placeholder="e\.g\. john@example\.com">/);
  assert.match(modal, /<input class="field-input" type="password" placeholder="At least 6 characters">/);
  assert.match(modal, /<select class="field-select">[\s\S]*?<option value="" selected>Select role<\/option>/);
  assert.match(modal, /<span class="field-label">Display name <span class="field-optional">\(optional\)<\/span><\/span>/);
  assert.match(modal, /<input class="field-input" type="text" placeholder="Defaults to the username">/);
  assert.match(modal, /<span class="field-label">Phone <span class="field-optional">\(optional\)<\/span><\/span>/);
  assert.match(modal, /<input class="field-input" type="tel" placeholder="Phone number">/);
  assert.match(html, /\.field-label \.field-optional\s*\{[\s\S]*?color:\s*var\(--nexora-subtle\);[\s\S]*?font-weight:\s*600;/);
  assert.match(modal, /<span>Email: --<\/span>/);
  assert.match(modal, /<span>Password: --<\/span>/);
  assert.match(modal, /<span>Login link: https:\/\/staging-merchant\.vlinkpay\.com\/sub-account\/login\?merchant=nt-houston<\/span>/);
  assert.doesNotMatch(modal, /<span>Login link: --<\/span>/);
  assert.doesNotMatch(modal, /value="[^"]+"/);
  assert.doesNotMatch(modal, /message-list|message-pill|Sub Account created and login email sent|login email could not be sent/);
  assert.doesNotMatch(modal, /Email <span class="field-optional"|Password <span class="field-optional"|Role <span class="field-optional"/);
  assert.doesNotMatch(modal, /mary\.smith@mailinator\.com|secret1|Mary Smith|832 555 0199/);
});

test('renders Sub Account Detail as read-only without workflow actions', () => {
  const html = source();
  const modalStart = html.indexOf('<div class="owner-modal" id="sub-account-detail-modal"');
  const modalEnd = html.indexOf('\n\n        </div>\n      </main>', modalStart);

  assert.notEqual(modalStart, -1, 'Sub Account Detail modal should render');
  assert.notEqual(modalEnd, -1, 'Sub Account Detail modal should end before the main content closes');

  const modal = html.slice(modalStart, modalEnd);
  assert.match(modal, /<h3 class="modal-title" id="sub-account-detail-modal-title">Sub Account Detail<\/h3>/);
  assert.match(modal, /aria-label="Effective module permissions"/);
  assert.doesNotMatch(modal, /<div class="owner-modal-footer">/);
  assert.doesNotMatch(modal, /Edit account info|Change role|Resend login email/);
  assert.doesNotMatch(modal, /data-open-resend-email-modal/);
});

test('renders Edit Sub Account modal and confirms reset password with SweetAlert', () => {
  const html = source();

  assert.match(html, /<div class="edit-account-form" aria-label="Edit Sub Account form">[\s\S]*?<span class="field-label">Name<\/span>[\s\S]*?<input class="field-input" type="text" value="Mai Tran" data-edit-account-name>[\s\S]*?<span class="field-label">ID<\/span>[\s\S]*?data-edit-account-id[\s\S]*?<span class="field-label">Email<\/span>[\s\S]*?data-edit-account-email[\s\S]*?<span class="field-label">Phone<\/span>[\s\S]*?data-edit-account-phone[\s\S]*?<span class="field-label">Role<\/span>[\s\S]*?<select class="field-select" data-edit-account-role>[\s\S]*?<span class="field-label">Status<\/span>[\s\S]*?<span class="status-pill" data-edit-account-status>Active<\/span>[\s\S]*?<\/div>/);
  assert.match(html, /<div class="phone-input-group">[\s\S]*?<select class="field-select is-country-code" aria-label="Country code" data-edit-account-country-code>[\s\S]*?<option>\+1<\/option>[\s\S]*?<\/select>[\s\S]*?<input class="field-input" type="tel" value="832 555 0182" data-edit-account-phone>[\s\S]*?<\/div>/);
  assert.match(html, /<button class="owner-button is-primary" type="button" data-save-edit-sub-account><i data-lucide="save" aria-hidden="true"><\/i><span>Save Changes<\/span><\/button>/);

  assert.match(html, /<button class="icon-action" type="button" aria-label="Reset password for mai@nexoratouch\.com"[^>]*data-open-reset-password-modal[^>]*data-account-email="mai@nexoratouch\.com"[^>]*data-account-name="Mai Tran"[\s\S]*?<span>Reset password<\/span><\/button>/);
  assert.match(html, /sweetalert2@11/);
  assert.match(html, /querySelectorAll\('\[data-open-reset-password-modal\]'\)/);
  assert.match(html, /function showSubAccountConfirm\(button, options\)/);
  assert.match(html, /window\.Swal && typeof window\.Swal\.fire === 'function'/);
  assert.match(html, /Swal\.fire\(\{/);
  assert.match(html, /showCancelButton: true/);
  assert.match(html, /title: 'Reset Sub Account password\?'/);
  assert.match(html, /text: 'A new password will be generated for ' \+ name \+ ' and sent through the Sub Account credential flow\.'/);
  assert.match(html, /confirmButtonText: 'Reset Password'/);
  assert.match(html, /action: 'reset-password'/);
  assert.match(html, /window\.confirm\(fallbackMessage\)/);
  assert.doesNotMatch(html, /id="reset-password-modal"/);
  assert.doesNotMatch(html, /owner-modal-card is-confirm/);

  const editFormRule = styleRule(html, '.edit-account-form');
  assertCssDeclaration(editFormRule, 'display', 'grid');
  const editRowRule = styleRule(html, '.edit-account-row');
  assertCssDeclaration(editRowRule, 'grid-template-columns', '140px minmax(0, 1fr)');
});

test('confirms resend login email before sending mail', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');
  const tableMatch = panel.match(/<table class="owner-table is-account-table">([\s\S]*?)<\/table>/);

  assert.ok(tableMatch, 'Sub Accounts table should render');

  const accountTable = tableMatch[1];
  assert.match(accountTable, /<button class="icon-action" type="button" aria-label="Resend login email to mai@nexoratouch\.com"[^>]*data-open-resend-email-modal[^>]*data-account-email="mai@nexoratouch\.com"[^>]*data-account-name="Mai Tran"[\s\S]*?<span>Resend email<\/span><\/button>/);
  assert.doesNotMatch(accountTable, /aria-label="Resend login email to mai@nexoratouch\.com"[^>]*data-sub-account-action="resend-login-email"/);

  assert.match(html, /querySelectorAll\('\[data-open-resend-email-modal\]'\)/);
  assert.match(html, /title: 'Send login email\?'/);
  assert.match(html, /text: 'A login email will be sent to ' \+ name \+ ' at ' \+ email \+ '\.'/);
  assert.match(html, /confirmButtonText: 'Send Mail'/);
  assert.match(html, /action: 'resend-login-email'/);
  assert.doesNotMatch(html, /id="resend-email-modal"/);
});

test('confirms deactivate before disabling a Sub Account', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');
  const tableMatch = panel.match(/<table class="owner-table is-account-table">([\s\S]*?)<\/table>/);

  assert.ok(tableMatch, 'Sub Accounts table should render');

  const accountTable = tableMatch[1];
  assert.match(accountTable, /<button class="icon-action" type="button" aria-label="Deactivate mai@nexoratouch\.com"[^>]*data-open-deactivate-modal[^>]*data-account-email="mai@nexoratouch\.com"[^>]*data-account-name="Mai Tran"[\s\S]*?<span>Deactivate<\/span><\/button>/);
  assert.doesNotMatch(accountTable, /aria-label="Deactivate mai@nexoratouch\.com"[^>]*data-sub-account-action="deactivate"/);

  assert.match(html, /querySelectorAll\('\[data-open-deactivate-modal\]'\)/);
  assert.match(html, /title: 'Deactivate Sub Account\?'/);
  assert.match(html, /text: name \+ ' will lose login access until this Sub Account is activated again\.'/);
  assert.match(html, /confirmButtonText: 'Deactivate'/);
  assert.match(html, /confirmButtonColor: '#dc2626'/);
  assert.match(html, /action: 'deactivate'/);
  assert.match(html, /var pendingDeactivateRow = null;/);
  assert.match(html, /pendingDeactivateRow = button\.closest\('tr'\);/);
  assert.doesNotMatch(html, /id="deactivate-sub-account-modal"/);
});

test('wires Sub Account account actions to visible status feedback', () => {
  const html = source();
  const panel = panelContent(html, 'sub-account');
  const tableMatch = panel.match(/<table class="owner-table is-account-table">([\s\S]*?)<\/table>/);

  assert.ok(tableMatch, 'Sub Accounts table should render');

  const accountTable = tableMatch[1];
  for (const [action, ariaLabel, visibleLabel, email] of [
    ['activate', 'Activate', 'Activate', 'jordan.reyes@nexoratouch.com']
  ]) {
    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(accountTable, new RegExp(`aria-label="${ariaLabel} ${escapedEmail}"[^>]*data-sub-account-action="${action}"[^>]*data-account-email="${escapedEmail}"[\\s\\S]*?<span>${visibleLabel}<\\/span>`));
  }

  assert.match(panel, /<div class="sub-account-action-status" role="status" aria-live="polite" data-sub-account-action-status><\/div>/);
  assert.match(html, /querySelectorAll\('\[data-sub-account-action\]'\)/);
  assert.match(html, /querySelectorAll\('\[data-open-reset-password-modal\]'\)/);
  assert.match(html, /querySelectorAll\('\[data-open-resend-email-modal\]'\)/);
  assert.match(html, /querySelectorAll\('\[data-open-deactivate-modal\]'\)/);
  assert.match(html, /function setSubAccountActionStatus\(button\)/);
  assert.match(html, /subAccountActionMessages\s*=\s*\{[\s\S]*?'reset-password': 'Password reset and a new login email was sent to \{email\}\.'[\s\S]*?'resend-login-email': 'Login email resent to \{email\}\.'/);
  assert.match(html, /var row = action === 'deactivate' && pendingDeactivateRow \? pendingDeactivateRow : button\.closest\('tr'\);/);
  assert.match(html, /statusPill\.textContent = action === 'activate' \? 'Active' : 'Disabled';/);

  const actionStatusRule = styleRule(html, '.sub-account-action-status:not(:empty)');
  assertCssDeclaration(actionStatusRule, 'display', 'flex');
});

test('renders all table action buttons with visible text labels', () => {
  const html = source();
  const buttons = iconActionControls(html);

  assert.ok(buttons.length > 0, 'Owner Settings should render table action controls');

  for (const button of buttons) {
    assert.match(button, /<span>[^<]+<\/span>/, `Action button must include a visible text label: ${button}`);
    assert.doesNotMatch(button, /<span class="sr-only">/, `Action button label must not be screen-reader-only: ${button}`);
  }
});

test('leaves unfinished account setting tabs empty except Sub Account', () => {
  const html = source();
  for (const panel of ['account', 'business-verification', 'affiliate-link', 'terms-privacy']) {
    assert.equal(panelContent(html, panel).trim(), '', `panel-${panel} should be empty until it is implemented`);
  }

  assert.match(panelContent(html, 'sub-account'), /data-sub-account-panel="accounts"/);
});

test('wires Owner Settings tabs with accessible tab panels', () => {
  const html = source();
  for (const panel of ['account', 'business-verification', 'affiliate-link', 'terms-privacy', 'sub-account']) {
    assert.match(html, new RegExp(`id="panel-${panel}"[\\s\\S]*?role="tabpanel"`));
  }

  assert.match(html, /window\.NEXORA_SHELL = \{ activePage: 'owner-settings', activeTab: 'sub-account' \};/);
  assert.match(html, /querySelectorAll\('\[data-settings-tab\]'\)/);
  assert.match(html, /querySelectorAll\('\[data-sub-account-view\]'\)/);
  assert.match(html, /window\.activateMainTab = function \(tabId\) \{[\s\S]*?activateTab\(tabId, true\);[\s\S]*?\};/);
  assert.match(html, /window\.NEXORA_SHELL\.setActiveTab\(nextTab\)/);
  assert.match(html, /window\.history\.replaceState/);
});
