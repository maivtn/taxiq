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

test('service modal validates required values before adding a custom service', () => {
  assert.match(SOURCE, /setSettingsServiceModalError\(/);
  assert.match(SOURCE, /Service name is required/);
  assert.match(SOURCE, /Price must be a valid number/);
  assert.match(SOURCE, /Minutes must be greater than 0/);
  assert.match(SOURCE, /addSettingsServiceRow\(name, price, duration\)/);
});

test('Settings service catalog body removes the outer chrome while keeping scrolling', () => {
  const rule = SOURCE.match(/\.settings-service-list\.settings-service-body\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
  assert.match(rule, /max-height:\s*540px/);
  assert.match(rule, /overflow-y:\s*auto/);
  assert.doesNotMatch(rule, /padding:/);
  assert.doesNotMatch(rule, /border:/);
  assert.doesNotMatch(rule, /background:/);
});
