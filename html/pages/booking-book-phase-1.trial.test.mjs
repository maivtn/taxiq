import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');

function trialGridSource() {
  const gridStart = SOURCE.indexOf('<div class="trial-grid">');
  const gridEnd = SOURCE.indexOf('<div class="trial-form-error"', gridStart);
  return SOURCE.slice(gridStart, gridEnd);
}

test('Plans trial form collects owner phone and price list upload', () => {
  assert.match(SOURCE, /data-trial-owner-phone/);
  assert.match(SOURCE, /Owner phone number/);
  assert.match(SOURCE, /data-trial-price-list/);
  assert.match(SOURCE, /type="file"[^>]*accept="[^"]*(pdf|xlsx)/);
  assert.match(SOURCE, /data-trial-price-list-name/);
});

test('Trial desktop form puts salon and owner contact fields into two-column rows', () => {
  const grid = trialGridSource();
  const positions = [
    grid.indexOf('data-trial-salon'),
    grid.indexOf('data-trial-phone'),
    grid.indexOf('data-trial-owner'),
    grid.indexOf('data-trial-owner-phone')
  ];
  assert.ok(positions.every((position) => position >= 0));
  assert.ok(positions[0] < positions[1]);
  assert.ok(positions[1] < positions[2]);
  assert.ok(positions[2] < positions[3]);
  assert.doesNotMatch(grid, /<div class="trial-field trial-span-2">\s*<label class="trial-label" for="trial-salon"/);
});

test('Services section contains the optional price list upload', () => {
  const grid = trialGridSource();
  const servicesStart = grid.indexOf('Services your salon offers');
  const hoursStart = grid.indexOf('Working hours', servicesStart);
  const servicesSection = grid.slice(servicesStart, hoursStart);
  assert.match(servicesSection, /data-trial-price-list/);
  assert.match(servicesSection, /Price list\s*<span class="trial-optional">\(optional\)/);
  assert.ok(servicesSection.indexOf('data-trial-chip') < servicesSection.indexOf('data-trial-price-list'));
});

test('Plans trial form exposes selectable working days and hours', () => {
  assert.match(SOURCE, /data-trial-hour-row="sun"/);
  assert.match(SOURCE, /data-trial-hour-row="mon"/);
  assert.match(SOURCE, /data-trial-hours/);
});

test('Trial form uses Salon Settings-style working hours for all seven days', () => {
  const days = [...SOURCE.matchAll(/data-trial-hour-row="(sun|mon|tue|wed|thu|fri|sat)"/g)].map((match) => match[1]);
  assert.deepEqual(days, ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  assert.match(SOURCE, /data-trial-hour-toggle/);
  assert.match(SOURCE, /data-trial-hour-start/);
  assert.match(SOURCE, /data-trial-hour-end/);
  assert.match(SOURCE, /function syncTrialHourRow\(/);
  assert.doesNotMatch(SOURCE, /data-trial-hours-start/);
  assert.doesNotMatch(SOURCE, /data-trial-hours-end/);
});

test('Trial submit validates and stores owner phone, price list, and working hours', () => {
  assert.match(SOURCE, /function collectTrialHours\(/);
  assert.match(SOURCE, /function validateTrialForm\(/);
  assert.match(SOURCE, /data-trial-owner-phone/);
  assert.match(SOURCE, /priceList:/);
  assert.match(SOURCE, /hours:\s*collectTrialHours\(\)/);
  assert.match(SOURCE, /data-trial-hour-row/);
  assert.match(SOURCE, /modal.dataset.trialSubmission/);
});

test('Trial form wires price list changes and hour selection into the existing modal flow', () => {
  assert.match(SOURCE, /function handleTrialPriceListChange\(/);
  assert.match(SOURCE, /data-trial-price-list-name/);
  assert.match(SOURCE, /trialPriceList.addEventListener\('change'/);
  assert.match(SOURCE, /data-trial-hour-toggle/);
  assert.match(SOURCE, /syncTrialHourRow\(toggle\)/);
  assert.match(SOURCE, /data-trial-hour-start/);
  assert.match(SOURCE, /data-trial-hour-end/);
});
