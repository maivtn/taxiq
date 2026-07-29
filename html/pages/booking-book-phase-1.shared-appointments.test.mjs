import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');
const APP_SHELL_SOURCE = readFileSync(new URL('./booking-book-src-app-shell.html', import.meta.url), 'utf8');

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

test('Booking Book keeps Appointments and Calendar subtabs', () => {
  assert.match(SOURCE, /<div class="booking-legacy-appointments" data-booking-legacy-appointments>/);
  assert.match(SOURCE, /data-booking-subtab-target="today"[^>]*aria-controls="booking-subpanel-today"/);
  assert.match(SOURCE, /data-booking-subtab-target="calendar"[^>]*aria-controls="booking-subpanel-calendar"/);
  assert.match(SOURCE, /<span>Calendar<\/span>/);
  assert.doesNotMatch(SOURCE, /data-booking-subtab-target="team"/);
  assert.match(SOURCE, /id="booking-subpanel-calendar" data-booking-sub-panel="calendar"/);
});

test('Booking Book overview KPIs use flex wrapping instead of grid columns', () => {
  for (const source of [SOURCE, APP_SHELL_SOURCE]) {
    const overviewKpisBlock = source.match(/\.overview-kpis\s*\{[^}]*\}/)?.[0] || '';
    assert.match(overviewKpisBlock, /display:\s*flex;/);
    assert.match(overviewKpisBlock, /flex-wrap:\s*wrap;/);
    assert.doesNotMatch(overviewKpisBlock, /grid-template-columns/);
    assert.doesNotMatch(source, /#panel-overview \.overview-kpis\s*\{[^}]*grid-template-columns/);
    assert.doesNotMatch(source, /\.booking-sub-panel \.overview-kpis\s*\{[^}]*grid-template-columns/);
  }
});

test('Booking Book moves team management into Salon Settings', () => {
  assert.match(SOURCE, /data-settings-team-slot/);
  assert.match(SOURCE, /function moveTeamPanelToSettings\(/);
  assert.match(SOURCE, /panel\.removeAttribute\('data-booking-sub-panel'\)/);
  assert.match(SOURCE, /moveTeamPanelToSettings\(\);/);
  assert.doesNotMatch(SOURCE, /workspace\.hidden = target === 'team'/);
});

test('Booking Book exposes its appointment workspace', () => {
  assert.match(SOURCE, /data-booking-table/);
  assert.match(SOURCE, /data-booking-action=/);
  assert.match(SOURCE, /<aside class="booking-appointment-panel overview-card" data-booking-appointment-panel/);
  assert.match(SOURCE, /<div class="booking-legacy-appointments" data-booking-legacy-appointments>/);
  assert.match(SOURCE, /booking-appointment-layout/);
});

test('Booking Book keeps one detail panel for appointment and calendar workspaces', () => {
  assert.match(SOURCE, /data-booking-appointment-workspace/);
  assert.match(SOURCE, /id="booking-subpanel-calendar" data-booking-sub-panel="calendar"[\s\S]*data-booking-team-calendar/);
  assert.match(SOURCE, /<div class="booking-appointment-main">[\s\S]*<aside class="booking-appointment-panel overview-card" data-booking-appointment-panel/);
  assert.match(SOURCE, /\.booking-appointment-panel \{[\s\S]*position: sticky/);
  assert.match(SOURCE, /data-booking-panel-state="empty"/);
});

test('Booking Book hides the appointment detail panel outside the Calendar subtab', () => {
  assert.match(SOURCE, /data-booking-appointment-panel[^>]*hidden/);
  assert.match(SOURCE, /function activateBookingSubTab\([\s\S]*var appointmentPanel = document\.querySelector\('\[data-booking-appointment-panel\]'\)[\s\S]*appointmentPanel\.hidden = target !== 'calendar'/);
});

test('Booking Book View actions open the appointment detail modal', () => {
  assert.match(SOURCE, /bookingAction\.dataset\.bookingAction === 'detail'[\s\S]*?openBookingDetailModal\(item\)/);
});

test('Booking Book uses a responsive modal detail panel below 1400px', () => {
  assert.match(SOURCE, /data-booking-appointment-backdrop/);
  assert.match(SOURCE, /function syncBookingAppointmentPanelPresentation\(/);
  assert.match(SOURCE, /booking-appointment-panel-modal-open/);
  assert.match(SOURCE, /event\.key === 'Escape'[\s\S]*closeBookingAppointmentPanel\(\)/);
  assert.match(SOURCE, /@media\s*\(max-width:\s*1399px\)/);
  assert.match(SOURCE, /data-booking-panel-presentation="modal"/);
  assert.match(SOURCE, /\.booking-appointment-main\s*\{\s*overflow-x:\s*auto/);
  assert.match(SOURCE, /data-booking-panel-action="close"[^>]*aria-label="Close appointment details"/);
});

test('Booking Book gives Appointments the full workspace width and reserves a rail for Calendar', () => {
  assert.match(SOURCE, /\.booking-appointment-layout \{[\s\S]*grid-template-columns: 1fr/);
  assert.match(SOURCE, /\.booking-appointment-layout\[data-booking-layout="calendar"\] \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) 320px/);
  assert.match(SOURCE, /function activateBookingSubTab\([\s\S]*workspace\.dataset\.bookingLayout = target === 'calendar' \? 'calendar' : 'appointments'/);
});

test('Booking Book keeps Table and Card modes inside Appointments', () => {
  assert.match(SOURCE, /data-booking-view-target="table"/);
  assert.match(SOURCE, /data-booking-view-target="card"/);
  assert.doesNotMatch(SOURCE, /data-booking-view-target="calendar"/);
  assert.doesNotMatch(SOURCE, /data-booking-view-panel="calendar"/);
  assert.match(SOURCE, /function initBookingViewMode\(\)[\s\S]*setBookingViewMode\('table'\)/);
  assert.doesNotMatch(SOURCE, /setBookingViewMode\('calendar'\)/);
});

test('Booking Book keeps appointment create in modal and calendar create in panel', () => {
  assert.match(SOURCE, /function openBookingNewAppointment\(/);
  assert.match(SOURCE, /data-booking-appointments-add/);
  assert.match(SOURCE, /data-booking-calendar-add/);
  assert.match(SOURCE, /function openBookingNewAppointment\([\s\S]*closeBookingAppointmentPanel\(\)[\s\S]*openBookingCreateModal/);
  assert.match(SOURCE, /bookingCalendarAdd\.addEventListener\('click', function\(\) \{[\s\S]*activateBookingSubTab\('calendar'\)[\s\S]*openBookingAppointmentPanelForNew/);
  assert.doesNotMatch(SOURCE, /nextMode === 'calendar'/);
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

test('Booking Book opens Appointments in Table mode and initializes Calendar from its subtab', () => {
  assert.match(SOURCE, /function activateMainTabFromUrl\(\)[\s\S]*activateMainTab\(tab, \{ syncUrl: false \}\)[\s\S]*requestedTab !== tab/);
  assert.match(SOURCE, /function activateBookingSubTab\([\s\S]*target === 'calendar'[\s\S]*initBookingCalendar\(\)/);
  assert.match(SOURCE, /function initBookingViewMode\(\)[\s\S]*setBookingViewMode\('table'\)/);
  assert.doesNotMatch(SOURCE, /if \(activeTarget === 'booking'\) setBookingViewMode\('calendar'\)/);
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
