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

test('Booking Book does not render the shared appointment workspace handoff card', () => {
  assert.doesNotMatch(SOURCE, /data-booking-appointments-handoff/);
  assert.doesNotMatch(SOURCE, /Shared appointment workspace/);
});

test('Booking Book keeps its appointment table, calendar, and action workspace visible', () => {
  assert.match(SOURCE, /<div class="booking-legacy-appointments" data-booking-legacy-appointments>/);
  assert.match(SOURCE, /data-booking-table/);
  assert.match(SOURCE, /data-booking-view-target="calendar"/);
  assert.match(SOURCE, /data-booking-action=/);
});

test('Booking Book exposes its appointment workspace', () => {
  assert.match(SOURCE, /<aside class="booking-appointment-panel overview-card" data-booking-appointment-panel/);
  assert.match(SOURCE, /<div class="booking-legacy-appointments" data-booking-legacy-appointments>/);
  assert.match(SOURCE, /booking-appointment-layout/);
});

test('Booking Book calendar layout includes a right-side appointment detail panel', () => {
  assert.match(SOURCE, /<div class="booking-appointment-layout"[^>]*>[\s\S]*<div class="booking-appointment-main">[\s\S]*<aside class="booking-appointment-panel overview-card" data-booking-appointment-panel/);
  assert.match(SOURCE, /data-booking-panel-state="empty"/);
});

test('Booking Book shows the right detail panel only in calendar mode', () => {
  assert.match(SOURCE, /booking-appointment-layout[^>]*data-booking-view-mode="table"/);
  assert.match(SOURCE, /booking-appointment-layout\[data-booking-view-mode="calendar"\]/);
  assert.match(SOURCE, /booking-appointment-layout:not\(\[data-booking-view-mode="calendar"\]\)[\s\S]*booking-appointment-panel/);
  assert.match(SOURCE, /appointmentLayout\.dataset\.bookingViewMode\s*=\s*nextMode/);
});

test('Booking Book calendar events use the shared appointment fields', () => {
  assert.match(SOURCE, /function bookingCalendarServiceSummary\(/);
  assert.match(SOURCE, /bookingCalendarServiceSummary\([\s\S]*serviceDetails/);
  assert.match(SOURCE, /data-booking-source/);
  assert.match(SOURCE, /bookingCalendarEvent[\s\S]*bookingCalendarServiceSummary/);
  assert.match(SOURCE, /bookingCalendarEvent[\s\S]*booking\.phone/);
  assert.match(SOURCE, /bookingCalendarEvent[\s\S]*booking\.note/);
});

test('Booking Book calendar uses the shared calendar status and action contract', () => {
  assert.match(SOURCE, /9:00 AM – 7:00 PM · appointments grouped by technician/);
  assert.match(SOURCE, /'pending': 'Pending'/);
  assert.match(SOURCE, /'confirmed': 'Confirmed'/);
  assert.match(SOURCE, /'checked-in': 'Checked in'/);
  assert.match(SOURCE, /Appointment details/);
  assert.match(SOURCE, /data-booking-panel-action-group="operational"/);
  assert.match(SOURCE, /data-booking-panel-action-group="destructive"/);
  assert.match(SOURCE, /data-booking-panel-action-group="close"/);
});

test('Booking Book uses the same catalog-driven service chips and panel field order as POS', () => {
  assert.match(SOURCE, /BOOKING_CALENDAR_SERVICE_OPTIONS\.push\([\s\S]*icon: service\.icon[\s\S]*requiredSkill/);
  assert.match(SOURCE, /data-booking-panel-select="service"[\s\S]*escapeHtml\(option\.name\) \+ ' · \$'/);
  assert.match(SOURCE, /data-booking-panel-field="tech"[\s\S]*data-booking-panel-field="date"[\s\S]*data-booking-panel-field="duration"[\s\S]*data-booking-panel-field="status"[\s\S]*data-booking-panel-field="note"/);
  assert.match(SOURCE, /t8: \{ bg: '#e9f7df', border: '#5c9e2e', text: '#31591c' \}/);
});

test('Booking Book duration is read-only text derived from selected services', () => {
  assert.doesNotMatch(SOURCE, /<select class="booking-select" data-booking-panel-field="duration">/);
  assert.match(SOURCE, /class="booking-duration-label" data-booking-panel-field="duration"/);
  assert.match(SOURCE, /function bookingPanelSelectedServiceDuration\(/);
  assert.match(SOURCE, /bookingPanelDraft\.duration = bookingPanelSelectedServiceDuration\(\)/);
});

test('Booking Book service chips use the shared name-price-duration format without icons', () => {
  assert.match(SOURCE, /data-booking-panel-select="service"[\s\S]*escapeHtml\(option\.name\) \+ ' · \$'/);
  assert.doesNotMatch(SOURCE, /data-booking-panel-select="service"[\s\S]*option\.icon/);
});

test('Booking Book calendar supports the same drag and resize actions as POS', () => {
  assert.match(SOURCE, /eventMoveHandling:\s*'Update'/);
  assert.match(SOURCE, /eventResizeHandling:\s*'Update'/);
  assert.match(SOURCE, /function bookingCalendarApplyMove[\s\S]*appointmentStore\.update/);
  assert.match(SOURCE, /onEventMoved:[\s\S]*bookingCalendarApplyMove/);
  assert.match(SOURCE, /onEventResized:[\s\S]*bookingCalendarApplyMove/);
});
