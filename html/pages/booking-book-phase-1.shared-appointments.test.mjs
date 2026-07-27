import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');

test('Booking Book loads shared catalog and appointment store before its runtime', () => {
  assert.match(SOURCE, /\.\.\/assets\/salon-data\.js/);
  assert.match(SOURCE, /\.\.\/assets\/appointments-store\.js/);
});

test('Booking Book still uses the shared catalog integration seam', () => {
  assert.match(SOURCE, /salon-data\.js/);
});

test('Booking Book imports static rows and renders from the shared store', () => {
  assert.match(SOURCE, /ensureSource\(['"]booking-book-static-v1/);
  assert.match(SOURCE, /loadAll\(/);
  assert.match(SOURCE, /renderBookingStoreRows/);
  assert.match(SOURCE, /appointmentStore\.(create|upsert|update)|store\.(create|upsert|update)/);
  assert.match(SOURCE, /appointmentStore\.subscribe|store\.subscribe/);
});

test('Booking Book sends SMS through the shared appointment store', () => {
  assert.match(SOURCE, /function sendBookingSms\(/);
  assert.match(SOURCE, /bookingAction\.dataset\.bookingAction === 'send-sms'[\s\S]{0,160}sendBookingSms\(item\)/);
});

test('Booking Book preserves the original booking source when importing rows', () => {
  assert.match(SOURCE, /source:\s*getBookingSourceText\(item\)/);
});

test('Booking Book does not append new appointments directly to the table', () => {
  assert.doesNotMatch(SOURCE, /tbody\.insertAdjacentHTML\(['"]beforeend['"]/);
});

test('Booking Book has no independent calendar catalog literals', () => {
  assert.doesNotMatch(SOURCE, /var BOOKING_CALENDAR_SERVICE_OPTIONS = \[\s*{/);
  assert.doesNotMatch(SOURCE, /var BOOKING_CALENDAR_TECHNICIANS = \[/);
});

test('technician save writes through the salon catalog API', () => {
  assert.match(SOURCE, /saveCatalog\(/);
  assert.match(SOURCE, /data-tech-modal-save/);
});

test('Booking Book retains salon-scoped storage and unknown-record safeguards', () => {
  assert.match(SOURCE, /NEXORA_APPOINTMENTS_STORE/);
  assert.match(SOURCE, /storage/);
  assert.match(SOURCE, /serviceNames/);
  assert.match(SOURCE, /cancelled/);
});

test('Booking Book links to the shared POS appointment workspace', () => {
  assert.match(SOURCE, /data-booking-appointments-handoff/);
  assert.match(SOURCE, /href="pos-phase-1\.html\?tab=appointments"/);
  assert.match(SOURCE, /Open POS Appointments/);
  assert.match(SOURCE, /Shared appointment workspace/);
});

test('Booking Book keeps its appointment table, calendar, and action workspace visible', () => {
  assert.match(SOURCE, /<div class="booking-legacy-appointments" data-booking-legacy-appointments>/);
  assert.match(SOURCE, /data-booking-table/);
  assert.match(SOURCE, /data-booking-view-target="calendar"/);
  assert.match(SOURCE, /data-booking-action=/);
});

test('Booking Book exposes its appointment workspace alongside the POS link', () => {
  assert.doesNotMatch(SOURCE, /<aside[^>]+data-booking-appointment-panel/);
  assert.match(SOURCE, /<div class="booking-legacy-appointments" data-booking-legacy-appointments>/);
  assert.match(SOURCE, /booking-appointment-layout/);
});
