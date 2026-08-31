import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');
const SERVICES_PANEL_START = SOURCE.indexOf('Services & Pricing');
const SERVICES_PANEL_END = SOURCE.indexOf('AI Voice', SERVICES_PANEL_START);
const SERVICES_PANEL = SOURCE.slice(SERVICES_PANEL_START, SERVICES_PANEL_END);

function functionSource(name) {
  const start = SOURCE.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `Expected function ${name} to exist`);
  const bodyStart = SOURCE.indexOf('{', start);
  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let index = bodyStart; index < SOURCE.length; index += 1) {
    const char = SOURCE[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quote && char === '\\') {
      escaped = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = '';
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return SOURCE.slice(start, index + 1);
    }
  }

  assert.fail(`Could not read function ${name}`);
}

function loadSettingsServicesFeature() {
  const dom = new JSDOM('<main data-settings-service-catalog></main>', {
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  const { window } = dom;
  window.eval(`
    var settingsManagedCategories = [];
    var settingsServiceDraftSequence = 0;
    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    function renderSettingsCategoryManager() {}
    function setSettingsStatus() {}
    ${functionSource('settingsEnsureManagedCategory')}
    ${functionSource('settingsServiceRowMarkup')}
    ${functionSource('settingsServiceCategoryMarkup')}
    ${functionSource('updateSettingsServiceCategoryCount')}
    ${functionSource('addSettingsServiceDraft')}
    window.settingsServicesFeature = {
      categoryMarkup: settingsServiceCategoryMarkup,
      addDraft: addSettingsServiceDraft,
      managedCategories: settingsManagedCategories
    };
  `);
  return { dom, window, feature: window.settingsServicesFeature };
}

test('Settings Services & Pricing renders from the shared JSON catalog', () => {
  assert.match(SOURCE, /data-settings-service-catalog/);
  assert.match(SOURCE, /appointmentServiceCatalogLoader\.load/);
  assert.match(SOURCE, /function renderSettingsServiceCatalog\(/);
  assert.match(SOURCE, /function settingsServiceRowMarkup\(/);
  assert.match(SOURCE, /service\.durationMin/);
  assert.match(SOURCE, /service\.price/);
});

test('Settings service markup is category-based and keeps dynamic row hooks', () => {
  assert.match(SOURCE, /function settingsServiceCategoryMarkup\(/);
  assert.match(SOURCE, /data-service-category/);
  assert.match(SOURCE, /CUSTOM SERVICES/);
  assert.match(SOURCE, /data-service-row/);
  assert.match(SOURCE, /data-service-remove/);
  assert.doesNotMatch(SERVICES_PANEL, /value="Gel Manicure"/);
  assert.doesNotMatch(SERVICES_PANEL, /value="Classic Manicure"/);
});

test('service category expand control uses the Lucide chevron icon', () => {
  assert.match(SOURCE, /function settingsServiceCategoryMarkup\([\s\S]*data-lucide="chevron-down"/);
  assert.doesNotMatch(SOURCE, /\.settings-service-category-head::after[\s\S]*content:\s*'⌄'/);
});

test('Settings has loading and catalog fallback behavior', () => {
  assert.match(SOURCE, /Loading services/);
  assert.match(SOURCE, /catalog\.services/);
  assert.match(SOURCE, /renderSettingsServiceCatalog\([\s\S]*fallback/);
});

test('manual and industry services are added to CUSTOM SERVICES', () => {
  assert.match(SOURCE, /function settingsEnsureCustomCategory\(/);
  assert.match(SOURCE, /settingsEnsureCustomCategory\(\)/);
  assert.match(SOURCE, /data-service-suggest-add/);
  assert.match(SOURCE, /data-service-remove/);
});

test('service edit modal keeps name, price, and minutes fields', () => {
  assert.match(SOURCE, /data-service-modal/);
  assert.match(SOURCE, /data-service-modal-field="name"/);
  assert.match(SOURCE, /data-service-modal-field="price"/);
  assert.match(SOURCE, /data-service-modal-field="duration"/);
  assert.match(SOURCE, /function openSettingsServiceModalForEdit\(/);
  assert.match(SOURCE, /function saveSettingsServiceModal\(/);
});

test('manual service modal lets the user choose a catalog category', () => {
  assert.match(SOURCE, /data-service-modal-field="category"/);
  assert.match(SOURCE, /function populateSettingsServiceModalCategories\(/);
  assert.match(SOURCE, /function settingsEnsureCategory\(/);
  assert.match(SOURCE, /addSettingsServiceRow\(name, price, duration, categoryId/);
});

test('manual service modal places category before the service name', () => {
  const modalStart = SOURCE.indexOf('data-service-modal');
  const categoryPosition = SOURCE.indexOf('data-service-modal-field="category"', modalStart);
  const namePosition = SOURCE.indexOf('data-service-modal-field="name"', modalStart);
  assert.ok(categoryPosition >= 0);
  assert.ok(namePosition >= 0);
  assert.ok(categoryPosition < namePosition);
});

test('Settings exposes category management controls', () => {
  assert.match(SOURCE, /data-settings-category-manager/);
  assert.match(SOURCE, /data-settings-category-list/);
  assert.match(SOURCE, /data-settings-category-action="open"/);
  assert.match(SOURCE, /data-settings-category-action="add"/);
  assert.match(SOURCE, /data-settings-category-modal/);
  assert.match(SOURCE, /data-settings-category-remove/);
  assert.doesNotMatch(SOURCE, /data-settings-category-save/);
  assert.match(SOURCE, /function renderSettingsCategoryManager\(/);
  assert.match(SOURCE, /function addSettingsCategoryDraft\(/);
  assert.match(SOURCE, /data-settings-category-new/);
  assert.match(SOURCE, /data-settings-category-modal-save[^>]*>[\s\S]*Save/);
  assert.match(SOURCE, /function saveSettingsCategoryModal\(/);
  assert.match(SOURCE, /row\.dataset\.settingsCategoryNew/);
  assert.match(SOURCE, /saveSettingsCategoryModal\([\s\S]*settings-category-row/);
});

test('Services & Pricing actions share a wrapping flex row', () => {
  assert.match(SERVICES_PANEL, /<div class="settings-actions settings-service-actions"[^>]*>[\s\S]*data-settings-category-action="open"[\s\S]*data-settings-action="photo"[\s\S]*<\/div>/);
  assert.doesNotMatch(SERVICES_PANEL, /data-settings-action="suggest"/);
  assert.doesNotMatch(SERVICES_PANEL, /data-settings-action="add-service"/);
  assert.doesNotMatch(SERVICES_PANEL, /Enter Manually/i);

  const rowRule = SOURCE.match(/\.settings-service-actions\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
  assert.match(rowRule, /display:\s*flex/);
  assert.match(rowRule, /flex-wrap:\s*wrap/);

  const buttonRule = SOURCE.match(/\.settings-service-actions\s*>\s*button\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
  assert.match(buttonRule, /flex:\s*0\s+1\s+auto/);
  assert.match(buttonRule, /min-width:\s*0/);
});

test('each service category renders its own Add services action', () => {
  const { feature, window } = loadSettingsServicesFeature();
  const catalog = window.document.querySelector('[data-settings-service-catalog]');
  catalog.innerHTML = [
    feature.categoryMarkup({ id: 'manicure', name: 'Manicure', services: [{ id: 'gel', name: 'Gel Manicure', price: 35, durationMin: 45 }] }, 0),
    feature.categoryMarkup({ id: 'pedicure', name: 'Pedicure', services: [{ id: 'spa', name: 'Spa Pedicure', price: 50, durationMin: 60 }] }, 1),
  ].join('');

  const categories = [...catalog.querySelectorAll('[data-service-category]')];
  assert.equal(categories.length, 2);
  categories.forEach((category) => {
    const actions = category.querySelectorAll('[data-settings-service-draft-add]');
    assert.equal(actions.length, 1);
    assert.equal(actions[0].textContent.trim(), 'Add services');
  });
});

test('Add services appends and focuses a blank draft in the selected category', () => {
  const { feature, window } = loadSettingsServicesFeature();
  const catalog = window.document.querySelector('[data-settings-service-catalog]');
  catalog.innerHTML = [
    feature.categoryMarkup({ id: 'manicure', name: 'Manicure', services: [{ id: 'gel', name: 'Gel Manicure', price: 35, durationMin: 45 }] }, 0),
    feature.categoryMarkup({ id: 'pedicure', name: 'Pedicure', services: [{ id: 'spa', name: 'Spa Pedicure', price: 50, durationMin: 60 }] }, 1),
  ].join('');

  const categories = [...catalog.querySelectorAll('[data-service-category]')];
  const addButton = categories[1].querySelector('[data-settings-service-draft-add]');
  feature.addDraft(addButton);

  assert.equal(categories[0].querySelectorAll('[data-service-row]').length, 1);
  assert.equal(categories[1].querySelectorAll('[data-service-row]').length, 2);
  const draft = categories[1].querySelector('[data-service-draft]');
  assert.ok(draft);
  assert.equal(draft.nextElementSibling, addButton);
  assert.deepEqual(
    [...draft.querySelectorAll('.settings-service-input')].map((input) => input.value),
    ['', '', ''],
  );
  assert.equal(window.document.activeElement, draft.querySelector('[aria-label="Service name"]'));
  assert.equal(categories[1].querySelector('.settings-service-category-count').textContent, '2');
  assert.equal(feature.managedCategories[0].id, 'pedicure');
  assert.equal(feature.managedCategories[0].services.length, 1);
  assert.equal(feature.managedCategories[0].services[0].isDraft, true);
});

test('service modal validates required values before adding a custom service', () => {
  assert.match(SOURCE, /setSettingsServiceModalError\(/);
  assert.match(SOURCE, /Service name is required/);
  assert.match(SOURCE, /Price must be a valid number/);
  assert.match(SOURCE, /Minutes must be greater than 0/);
  assert.match(SOURCE, /addSettingsServiceRow\(name, price, duration, categoryId/);
});

test('Settings service catalog body removes the outer chrome while keeping scrolling', () => {
  const rule = SOURCE.match(/\.settings-service-list\.settings-service-body\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
  assert.match(rule, /max-height:\s*540px/);
  assert.match(rule, /overflow-y:\s*auto/);
  assert.doesNotMatch(rule, /padding:/);
  assert.doesNotMatch(rule, /border:/);
  assert.doesNotMatch(rule, /background:/);
});

test('manual service modal includes an optional multiline description field', () => {
  assert.match(SOURCE, /<textarea[^>]*class="settings-input"[^>]*data-service-modal-field="description"[^>]*><\/textarea>/);
  assert.match(SOURCE, /data-service-modal-field="description"[^>]*rows="4"/);
  assert.match(SOURCE, /\['name', 'description', 'price', 'duration'\]\.forEach/);
});

test('manual service modal places description after minutes', () => {
  const modalStart = SOURCE.indexOf('data-service-modal');
  const minutesPosition = SOURCE.indexOf('data-service-modal-field="duration"', modalStart);
  const descriptionPosition = SOURCE.indexOf('data-service-modal-field="description"', modalStart);
  assert.ok(minutesPosition >= 0);
  assert.ok(descriptionPosition >= 0);
  assert.ok(minutesPosition < descriptionPosition);
});

test('Services & Pricing spans the full Settings grid width', () => {
  assert.ok(
    /<div class="settings-two-grid">\s*<article class="settings-card settings-service-pricing-card">[\s\S]*?Services & Pricing/.test(SOURCE),
    'Services & Pricing must be the full-width card inside settings-two-grid'
  );

  const cardRule = SOURCE.match(/\.settings-two-grid\s*>\s*\.settings-service-pricing-card\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
  assert.match(cardRule, /grid-column:\s*1\s*\/\s*-1/);
});
