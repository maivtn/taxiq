import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');

test('Booking Book loads shared catalog and appointment store before its runtime', () => {
  assert.match(SOURCE, /\.\.\/assets\/salon-data\.js/);
  assert.match(SOURCE, /\.\.\/assets\/appointments-store\.js/);
  assert.match(SOURCE, /\.\.\/assets\/appointment-service-catalog\.js/);
});

test('Booking Book loads the approved category service JSON for appointment pickers', () => {
  assert.match(SOURCE, /booking-service-catalog-draft\.json/);
  assert.match(SOURCE, /appointmentServiceCatalogLoader\.load/);
  assert.match(SOURCE, /data-booking-service-search/);
  assert.match(SOURCE, /data-booking-service-category/);
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

test('Booking Book keeps legacy source badges when table rows are re-rendered', () => {
  assert.match(SOURCE, /function bookingSourceBadgesFromText\(/);
  assert.match(SOURCE, /bookingSourceBadgesFromText\([\s\S]*booking-source-voice/);
  assert.match(SOURCE, /bookingSourceBadgesFromText\([\s\S]*booking-source-lp/);
  assert.match(SOURCE, /bookingSourceBadgesFromText\([\s\S]*booking-source-sms/);
  assert.match(SOURCE, /bookingSourceBadgesFromText\([\s\S]*booking-source-qr/);
  assert.match(SOURCE, /createBookingTableRow\([\s\S]*bookingSourceBadgesFromText/);
});

test('Booking Book marks newly created appointments as manual add', () => {
  assert.match(SOURCE, /'manual add': 'Manual add'/);
  assert.match(SOURCE, /source:\s*'manual-add'/);
});

test('Booking Book appointment details render source badges like the table', () => {
  assert.match(SOURCE, /Nguồn:[\s\S]*bookingSourceBadgesFromText\(bookingPanelDraft\.source/);
  assert.match(SOURCE, /booking-panel-source-list/);
});

test('Booking Book appointment details show selected service totals', () => {
  assert.match(SOURCE, /appointment-service-summary/);
  assert.match(SOURCE, /Total price:/);
  assert.match(SOURCE, /Total time:/);
  assert.match(SOURCE, /function bookingPanelSelectedServiceTotals\([\s\S]*bookingServicePriceTotal/);
});

test('Booking Book appointment card has a structured header with title spacing', () => {
  assert.match(SOURCE, /booking-panel-title-icon/);
  assert.match(SOURCE, /\.booking-panel-title \{[\s\S]*display: flex/);
  assert.match(SOURCE, /\.booking-panel-head \{[\s\S]*border-bottom/);
});

test('Booking Book repairs generic legacy sources from the original table rows', () => {
  assert.match(SOURCE, /function bookingSourceNeedsRepair\(/);
  assert.match(SOURCE, /function repairBookingStaticSources\(/);
  assert.match(SOURCE, /bookingSourceNeedsRepair\([\s\S]*booking book[\s\S]*front desk/);
  assert.match(SOURCE, /appointmentStore\.update\(record\.id, \{ source: source \}/);
  assert.match(SOURCE, /repairBookingStaticSources\(initialBookingRows\)/);
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
  assert.match(SOURCE, /booking-appointment-layout[^>]*data-booking-view-mode="calendar"/);
  assert.match(SOURCE, /booking-appointment-layout\[data-booking-view-mode="calendar"\]/);
  assert.match(SOURCE, /booking-appointment-layout:not\(\[data-booking-view-mode="calendar"\]\)[\s\S]*booking-appointment-panel/);
  assert.match(SOURCE, /appointmentLayout\.dataset\.bookingViewMode\s*=\s*nextMode/);
});

test('Booking Book opens the legacy create modal outside calendar mode', () => {
  assert.match(SOURCE, /function openBookingNewAppointment\(/);
  assert.match(SOURCE, /openBookingNewAppointment\([\s\S]*nextMode === 'calendar'[\s\S]*openBookingAppointmentPanelForNew[\s\S]*openBookingCreateModal/);
  assert.match(SOURCE, /bookingCalendarAdd\.addEventListener\('click', function\(\) \{\s*openBookingNewAppointment\(\);/);
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

test('Booking Book uses the approved category picker and keeps the panel field order', () => {
  assert.match(SOURCE, /data-booking-service-search/);
  assert.match(SOURCE, /data-booking-service-category/);
  assert.match(SOURCE, /data-booking-panel-ticket-service-search/);
  assert.match(SOURCE, /data-booking-panel-ticket-tech-search/);
  assert.match(SOURCE, /data-booking-panel-ticket-add/);
  assert.match(SOURCE, /data-booking-panel-ticket-remove/);
  assert.match(SOURCE, /data-booking-create-ticket-service-search/);
  assert.match(SOURCE, /data-booking-create-ticket-tech-search/);
  assert.match(SOURCE, /data-booking-create-ticket-add/);
  assert.doesNotMatch(SOURCE, /data-booking-panel-field="duration"/);
  assert.match(SOURCE, /t8: \{ bg: '#e9f7df', border: '#5c9e2e', text: '#31591c' \}/);
});

test('Booking Book service and technician dropdowns stay hidden until the user types', () => {
  for (const selector of [
    'data-booking-panel-ticket-service-results',
    'data-booking-panel-ticket-tech-results',
    'data-booking-create-ticket-service-results',
    'data-booking-create-ticket-tech-results'
  ]) assert.match(SOURCE, new RegExp(selector + '[^>]*hidden'));
  assert.match(SOURCE, /function filterBookingPanelTicketServices\([\s\S]*if \(!query\)[\s\S]*results\.hidden = true/);
  assert.match(SOURCE, /function filterBookingPanelTicketTechs\([\s\S]*if \(!query\)[\s\S]*results\.hidden = true/);
  assert.match(SOURCE, /function filterBookingCreateTicketServices\([\s\S]*if \(!query\)[\s\S]*results\.hidden = true/);
  assert.match(SOURCE, /function filterBookingCreateTicketTechs\([\s\S]*if \(!query\)[\s\S]*results\.hidden = true/);
});

test('Booking Book service and technician search fields use the full picker width', () => {
  const builderRule = SOURCE.match(/\.booking-ticket-builder-grid\s*\{([^}]*)\}/)?.[1] || '';
  assert.match(builderRule, /grid-template-columns:\s*1fr/);
  assert.match(SOURCE, /\.booking-ticket-add\s*\{[^}]*width:\s*100%/);
});

test('Booking Book opens the booking tab in calendar mode by default', () => {
  assert.match(SOURCE, /function activateMainTabFromUrl\(\)[\s\S]*activateMainTab\(tab, \{ syncUrl: false \}\)[\s\S]*requestedTab !== tab/);
  assert.match(SOURCE, /if \(activeTarget === 'booking'\) setBookingViewMode\('calendar'\)/);
  assert.match(SOURCE, /function initBookingViewMode\(\)[\s\S]*setBookingViewMode\('calendar'\)/);
});

test('Booking Book hides the duplicate duration field beside status', () => {
  assert.doesNotMatch(SOURCE, /<select class="booking-select" data-booking-panel-field="duration">/);
  assert.doesNotMatch(SOURCE, /class="booking-duration-label" data-booking-panel-field="duration"/);
  assert.match(SOURCE, /data-booking-panel-total-duration/);
  assert.match(SOURCE, /function bookingPanelSelectedServiceDuration\(/);
  assert.match(SOURCE, /bookingPanelDraft\.duration = bookingPanelSelectedServiceDuration\(\)/);
});

test('Booking Book service options show name, price, and duration without decorative icons', () => {
  assert.match(SOURCE, /booking-service-option-name[\s\S]*escapeHtml\(option\.name\)/);
  assert.match(SOURCE, /booking-service-option-meta[\s\S]*option\.duration \+ ' min/);
});

test('Booking Book removes decorative icons from imported service names', () => {
  assert.match(SOURCE, /function bookingServiceDisplayName\(/);
  assert.match(SOURCE, /bookingPanelExternalServices\.push\(displayName\)/);
  assert.doesNotMatch(SOURCE, /title="Imported service">↗ /);
});

test('Booking Book sanitizes legacy service labels in table and card details', () => {
  assert.match(SOURCE, /function getBookingServiceText\([\s\S]*bookingServiceDisplayName\(/);
  assert.match(SOURCE, /function setBookingDetailServices\([\s\S]*bookingServiceDisplayName\(/);
  assert.match(SOURCE, /renderBookingCards\([\s\S]*bookingServiceDisplayName\(/);
});

test('Booking Book calendar supports the same drag and resize actions as POS', () => {
  assert.match(SOURCE, /eventMoveHandling:\s*'Update'/);
  assert.match(SOURCE, /eventResizeHandling:\s*'Update'/);
  assert.match(SOURCE, /function bookingCalendarApplyMove[\s\S]*appointmentStore\.update/);
  assert.match(SOURCE, /onEventMoved:[\s\S]*bookingCalendarApplyMove/);
  assert.match(SOURCE, /onEventResized:[\s\S]*bookingCalendarApplyMove/);
});
