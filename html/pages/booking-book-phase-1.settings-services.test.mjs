import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');
const SERVICES_PANEL_START = SOURCE.indexOf('Services & Pricing');
const SERVICES_PANEL_END = SOURCE.indexOf('AI Voice', SERVICES_PANEL_START);
const SERVICES_PANEL = SOURCE.slice(SERVICES_PANEL_START, SERVICES_PANEL_END);

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

test('Enter Manually opens a service modal with name, price, and minutes fields', () => {
  assert.match(SOURCE, /data-service-modal/);
  assert.match(SOURCE, /data-service-modal-field="name"/);
  assert.match(SOURCE, /data-service-modal-field="price"/);
  assert.match(SOURCE, /data-service-modal-field="duration"/);
  assert.match(SOURCE, /function openSettingsServiceModal\(/);
  assert.match(SOURCE, /function saveSettingsServiceModal\(/);
  assert.match(SOURCE, /if \(action === 'add-service'\) \{[\s\S]*openSettingsServiceModal\(\)/);
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
  assert.match(SERVICES_PANEL, /<div class="settings-actions settings-service-actions"[^>]*>[\s\S]*data-settings-category-action="open"[\s\S]*data-settings-action="photo"[\s\S]*data-settings-action="add-service"[\s\S]*<\/div>/);
  assert.doesNotMatch(SERVICES_PANEL, /data-settings-action="suggest"/);

  const rowRule = SOURCE.match(/\.settings-service-actions\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
  assert.match(rowRule, /display:\s*flex/);
  assert.match(rowRule, /flex-wrap:\s*wrap/);

  const buttonRule = SOURCE.match(/\.settings-service-actions\s*>\s*button\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
  assert.match(buttonRule, /flex:\s*0\s+1\s+auto/);
  assert.match(buttonRule, /min-width:\s*0/);
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

test('Services & Pricing spans the full Settings grid width', () => {
  assert.ok(
    /<div class="settings-two-grid">\s*<article class="settings-card settings-service-pricing-card">[\s\S]*?Services & Pricing/.test(SOURCE),
    'Services & Pricing must be the full-width card inside settings-two-grid'
  );

  const cardRule = SOURCE.match(/\.settings-two-grid\s*>\s*\.settings-service-pricing-card\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
  assert.match(cardRule, /grid-column:\s*1\s*\/\s*-1/);
});
