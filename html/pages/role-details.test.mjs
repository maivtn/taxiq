import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const PAGE_URL = new URL('./role-details.html', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'role-details.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
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

function roleDetailsRuntime(search = '?roleId=ROLE-002') {
  const html = source();
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  const runtimeScript = scripts.at(-1)?.[1] || '';
  const textNodes = new Map();
  const saveStatus = { textContent: '' };
  const saveButton = {
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    }
  };
  const nameInput = { value: '' };
  const groups = [];
  const modules = {};

  function createInput(moduleId) {
    return {
      checked: false,
      indeterminate: false,
      listeners: {},
      attributes: { 'data-module': moduleId },
      getAttribute(name) {
        return this.attributes[name] || '';
      },
      setAttribute(name, value) {
        this.attributes[name] = String(value);
      },
      addEventListener(type, handler) {
        this.listeners[type] = handler;
      },
      dispatch(type) {
        if (this.listeners[type]) this.listeners[type]({ target: this });
      },
      closest(selector) {
        return selector === '[data-permission-parent]' ? this.group : null;
      }
    };
  }

  function createGroup(parentId, childIds = []) {
    const parent = modules[parentId] || createInput(parentId);
    modules[parentId] = parent;
    const children = childIds.map((childId) => {
      const child = modules[childId] || createInput(childId);
      modules[childId] = child;
      return child;
    });
    const group = {
      parent,
      children,
      getAttribute(name) {
        return name === 'data-permission-parent' ? parentId : '';
      },
      querySelector(selector) {
        if (selector === '.permission-parent-row [data-module]') return parent;
        return null;
      },
      querySelectorAll(selector) {
        if (selector === '.permission-child-list [data-module]') return children;
        if (selector === '[data-module]') return [parent, ...children];
        return [];
      }
    };
    parent.group = group;
    children.forEach((child) => {
      child.group = group;
    });
    groups.push(group);
  }

  createGroup('payments', ['paymentsOverview', 'paymentsCustomerPayments', 'paymentsTips', 'paymentsPayroll', 'paymentsDirectSavings']);
  createGroup('booking', ['bookingBook', 'bookingCustomers', 'bookingCallLog', 'bookingSmsCampaigns', 'bookingQrCodes', 'bookingPlans', 'bookingSalonSettings']);
  createGroup('settings', ['settingsAccount', 'settingsBusinessVerification', 'settingsSubAccount', 'settingsAffiliateLink', 'settingsTermsPrivacy']);
  createGroup('dashboard');

  const document = {
    querySelector(selector) {
      if (selector === '[data-role-name]' || selector === '[data-role-id]') {
        if (!textNodes.has(selector)) textNodes.set(selector, { textContent: '' });
        return textNodes.get(selector);
      }
      if (selector === '[data-role-name-input]') return nameInput;
      if (selector === '[data-save-button]') return saveButton;
      if (selector === '[data-save-status]') return saveStatus;
      const moduleMatch = selector.match(/^\[data-module="([^"]+)"\]$/);
      if (moduleMatch) return modules[moduleMatch[1]] || null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-module]') return Object.values(modules);
      if (selector === '[data-permission-parent]') return groups;
      return [];
    }
  };

  const context = {
    window: { location: { search } },
    document,
    URLSearchParams
  };
  vm.runInNewContext(runtimeScript, context);
  return { modules, saveButton, saveStatus, textNodes, nameInput };
}

test('creates the Role Details page from the shared merchant shell', () => {
  const html = source();

  assert.match(html, /<title>Nexora Touch - Role Details<\/title>/);
  assert.match(html, /<div class="shell">/);
  assert.match(html, /<aside class="sidebar"[^>]*><\/aside>/);
  assert.match(html, /<header class="header"><\/header>/);
  assert.match(html, /<main class="content" aria-label="Role Details content">/);
  assert.match(html, /<link rel="stylesheet" href="\.\.\/assets\/nexora-shell\.css">/);
  assert.match(html, /<script src="\.\.\/assets\/nexora-shell\.js"><\/script>/);
  assert.match(html, /window\.NEXORA_SHELL = \{[\s\S]*?activePage: 'owner-settings',[\s\S]*?activeTab: 'sub-account',[\s\S]*?onNavigate: function \(tabId\) \{[\s\S]*?window\.location\.href = 'owner-setting\.html\?tab=' \+ encodeURIComponent\(tabId\);[\s\S]*?\}[\s\S]*?\};/);
});

test('renders Role Details content and back link to Roles tab', () => {
  const html = source();
  const pageHead = html.match(/<div class="page-head">([\s\S]*?)<\/div>\s*<section class="role-detail-shell"/)?.[1] || '';

  assert.match(html, /<h1 class="page-title">Role Details<\/h1>/);
  assert.match(html, /Configure permissions for this role and control which merchant dashboard modules assigned Sub Accounts can access\./);
  assert.match(html, /href="owner-setting\.html\?tab=sub-account&amp;view=roles"/);
  assert.match(pageHead, /^([\s\S]*?)<a class="owner-button" href="owner-setting\.html\?tab=sub-account&amp;view=roles"><i data-lucide="arrow-left" aria-hidden="true"><\/i><span>Back<\/span><\/a>[\s\S]*?<h1 class="page-title">Role Details<\/h1>/);
  assert.doesNotMatch(pageHead, /Back to Roles/);
  const pageHeadRule = styleRule(html, '.page-head');
  assertCssDeclaration(pageHeadRule, 'justify-content', 'flex-start');
  assert.match(html, /<span data-role-name>Front Desk<\/span>/);
  assert.match(html, /<span data-role-id>ROLE-002<\/span>/);
  assert.match(html, /<input class="field-input" type="text" value="Front Desk" maxlength="100" data-role-name-input>/);
  assert.doesNotMatch(html, /role-detail-head/);
  assert.doesNotMatch(html, /assigned staff|<span class="permission-title">Staff<\/span>|Staff directory|Toggle Staff access/);
});

test('reads roleId URL parameter and includes role fixtures', () => {
  const html = source();

  assert.match(html, /new URLSearchParams\(window\.location\.search\)\.get\('roleId'\)/);
  assert.match(html, /new URLSearchParams\(window\.location\.search\)\.get\('roleName'\)/);
  assert.match(html, /var customRoleName = \(requestedRoleName \|\| ''\)\.trim\(\)\.slice\(0, 100\);/);
  assert.match(html, /var roleId = requestedRoleId && \(roles\[requestedRoleId\] \|\| customRoleName\) \? requestedRoleId : 'ROLE-002';/);
  assert.match(html, /var role = roles\[roleId\] \|\| \{ name: customRoleName \|\| 'New Role', modules: moduleMap\(\[\]\) \};/);

  for (const [roleId, roleName] of [['ROLE-001', 'Owner Manager'], ['ROLE-002', 'Front Desk'], ['ROLE-003', 'Technician Lead']]) {
    assert.match(html, new RegExp(`'${roleId}': \\{[\\s\\S]*?name: '${roleName}'`));
  }
});

test('renders module permissions as sidebar parent and child menus', () => {
  const html = source();

  assert.match(html, /<div class="permission-menu" aria-label="Sidebar module permissions">/);

  assert.doesNotMatch(html, /data-permission-parent="home"|data-module="home"|Toggle Home access|<span class="permission-title">Home<\/span>|'home'/);

  for (const [parent, label] of [['dashboard', 'Dashboard'], ['staff', 'Sub Account'], ['payments', 'Payments &amp; Payouts'], ['packages', 'Package Management'], ['stations', 'Stations &amp; QR Codes'], ['booking', 'Ai Hub'], ['community', 'Community'], ['reward', 'Reward'], ['pos', 'POS'], ['settings', 'Settings'], ['support', 'Support']]) {
    assert.match(html, new RegExp(`<section class="permission-group[^"]*" data-permission-parent="${parent}"[\\s\\S]*?<span class="permission-title">${label}<\\/span>`));
  }

  for (const [parent, children] of [
    ['payments', ['Overview', 'Customer Payments', 'Tips', 'Payroll', 'Direct Savings']],
    ['booking', ['Booking Book', 'Customers', 'Call Log', 'SMS Campaigns', 'QR Codes', 'Plans', 'Salon Settings']],
    ['reward', ['Overview', 'Earn Rules', 'Reward Catalog', 'Customers', 'Loyalty Activity', 'Analytics']],
    ['pos', ['Check-in', 'Tickets', 'Booking', 'Customers', 'Time Clock', 'Management']],
    ['settings', ['Account', 'Business Verification', 'Sub Account', 'Affiliate Link', 'Terms &amp; Privacy']]
  ]) {
    const group = html.match(new RegExp(`<section class="permission-group" data-permission-parent="${parent}">([\\s\\S]*?)<\\/section>`))?.[1] || '';
    assert.ok(group, `${parent} permission group should render`);
    for (const child of children) {
      assert.match(group, new RegExp(`<span class="permission-child-title">${child}<\\/span>`));
    }
  }

  assert.doesNotMatch(html, /<section class="permission-group is-flat" data-permission-parent="settings">/);
  assert.doesNotMatch(html, /module-group-grid|module-group-title|module-switch/);
});

test('renders permission controls as styled switches and keeps action labels visible', () => {
  const html = source();
  const switchControls = html.match(/<label class="role-switch"[\s\S]*?<\/label>/g) || [];

  assert.ok(switchControls.length >= 30, 'Role Details should render switches for parent and child permissions');
  assert.match(html, /<label class="role-switch" aria-label="Toggle Dashboard access"><input type="checkbox" role="switch" data-module="dashboard"[^>]*><span class="role-switch-track" aria-hidden="true"><span class="role-switch-thumb"><\/span><\/span><\/label>/);
  assert.match(html, /<label class="role-switch" aria-label="Toggle Booking Book access"><input type="checkbox" role="switch" data-module="bookingBook"[^>]*><span class="role-switch-track" aria-hidden="true"><span class="role-switch-thumb"><\/span><\/span><\/label>/);
  assert.match(html, /<label class="role-switch" aria-label="Toggle Terms &amp; Privacy access"><input type="checkbox" role="switch" data-module="settingsTermsPrivacy"[^>]*><span class="role-switch-track" aria-hidden="true"><span class="role-switch-thumb"><\/span><\/span><\/label>/);
  assert.match(html, /'settings', 'settingsAccount', 'settingsBusinessVerification', 'settingsSubAccount', 'settingsAffiliateLink', 'settingsTermsPrivacy', 'support'/);

  for (const label of ['Back', 'Delete role', 'Save changes']) {
    assert.match(html, new RegExp(`<span>${label}<\\/span>`));
  }

  assert.doesNotMatch(html, /<span>Back to Roles<\/span>/);

  const detailRule = styleRule(html, '.role-detail-shell');
  assertCssDeclaration(detailRule, 'border-radius', '8px');
  assertCssDeclaration(detailRule, 'background', '#fff');

  const switchInputRule = styleRule(html, '.role-switch input');
  assertCssDeclaration(switchInputRule, 'position', 'absolute');
  assertCssDeclaration(switchInputRule, 'opacity', '0');

  const switchTrackRule = styleRule(html, '.role-switch-track');
  assertCssDeclaration(switchTrackRule, 'border-radius', '999px');

  const checkedRule = styleRule(html, '.role-switch input:checked + .role-switch-track');
  assertCssDeclaration(checkedRule, 'background', 'var(--nexora-brand)');
});

test('syncs Role Details parent and child permission switches', () => {
  const { modules, saveStatus } = roleDetailsRuntime();

  assert.equal(modules.payments.checked, false);
  assert.equal(modules.paymentsOverview.checked, false);

  modules.payments.checked = true;
  modules.payments.dispatch('change');

  assert.equal(modules.paymentsOverview.checked, true);
  assert.equal(modules.paymentsCustomerPayments.checked, true);
  assert.equal(modules.paymentsTips.checked, true);
  assert.equal(modules.payments.indeterminate, false);
  assert.equal(modules.payments.attributes['aria-checked'], 'true');
  assert.equal(saveStatus.textContent, 'Unsaved changes.');

  modules.paymentsTips.checked = false;
  modules.paymentsTips.dispatch('change');

  assert.equal(modules.payments.checked, false);
  assert.equal(modules.payments.indeterminate, true);
  assert.equal(modules.payments.attributes['aria-checked'], 'mixed');

  modules.paymentsTips.checked = true;
  modules.paymentsTips.dispatch('change');

  assert.equal(modules.payments.checked, true);
  assert.equal(modules.payments.indeterminate, false);
  assert.equal(modules.payments.attributes['aria-checked'], 'true');
});
