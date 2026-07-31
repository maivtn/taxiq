import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');
const MODAL_START = SOURCE.indexOf('<div class="tech-modal" data-tech-modal');
const MODAL_END = SOURCE.indexOf('<article class="settings-card settings-team-card"', MODAL_START);
const TECH_MODAL = SOURCE.slice(MODAL_START, MODAL_END);

test('technician services load the shared menu JSON instead of hard-coded options', () => {
  assert.match(SOURCE, /TECHNICIAN_SERVICE_CATALOG_URL\s*=\s*['"]\.\.\/menu\/menu\.json['"]/);
  assert.match(SOURCE, /appointmentServiceCatalogLoader\.load\(TECHNICIAN_SERVICE_CATALOG_URL\)/);
  assert.match(TECH_MODAL, /data-tech-service-picker/);
  assert.doesNotMatch(TECH_MODAL, /data-tech-service="Gel"/);
  assert.doesNotMatch(TECH_MODAL, /data-tech-service="Classic Manicure"/);
});

test('technician picker renders global, category, and service selection hooks', () => {
  assert.match(SOURCE, /function renderTechServicePicker\(/);
  assert.match(SOURCE, /function techServiceCategoryMarkup\(/);
  assert.match(SOURCE, /data-tech-service-all/);
  assert.match(SOURCE, /data-tech-service-category-all/);
  assert.match(SOURCE, /data-tech-service-category=/);
  assert.match(SOURCE, /data-tech-service=/);
});

test('technician picker synchronizes checked and indeterminate states', () => {
  assert.match(SOURCE, /function syncTechServiceCheckAll\(/);
  assert.match(SOURCE, /indeterminate/);
  assert.match(SOURCE, /event\.target\.matches\('\[data-tech-service-category-all\]'\)/);
  assert.match(SOURCE, /event\.target\.matches\('\[data-tech-service-all\]'\)/);
  assert.match(SOURCE, /event\.target\.matches\('\[data-tech-service\]'\)/);
});

test('technician service picker has loading and error handling', () => {
  assert.match(SOURCE, /Loading services/);
  assert.match(SOURCE, /renderTechServicePicker\([\s\S]*error/);
  assert.match(SOURCE, /TECHNICIAN_SERVICE_CATALOG_URL/);
});

test('technician service selection survives menu loading and remains comma-separated', () => {
  assert.match(SOURCE, /pendingTechServices/);
  assert.match(SOURCE, /setTechField\('services'/);
  assert.match(SOURCE, /getTechField\('services'/);
  assert.match(SOURCE, /\.filter\(Boolean\)\.join\(', '\)/);
});
