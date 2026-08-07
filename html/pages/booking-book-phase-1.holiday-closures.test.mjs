import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');
const SETTINGS_START = SOURCE.indexOf('<section class="tab-panel" id="panel-settings"');
const SETTINGS_END = SOURCE.indexOf('<section class="tab-panel" id="panel-customers"');
const SETTINGS_PANEL = SOURCE.slice(SETTINGS_START, SETTINGS_END);
const HOLIDAY_CARD = SETTINGS_PANEL.match(/<article class="settings-card" data-settings-holiday-card>[\s\S]*?<\/article>/)?.[0] || '';
const HOLIDAY_MODAL_START = SETTINGS_PANEL.indexOf('data-settings-holiday-modal');
const HOLIDAY_MODAL_END = SETTINGS_PANEL.indexOf('>AI Voice</div>');
const HOLIDAY_MODAL = HOLIDAY_MODAL_START >= 0 && HOLIDAY_MODAL_END > HOLIDAY_MODAL_START
  ? SETTINGS_PANEL.slice(HOLIDAY_MODAL_START, HOLIDAY_MODAL_END)
  : '';
const HOLIDAY_LOGIC_START = SOURCE.indexOf('var SETTINGS_HOLIDAY_STORAGE_KEY');
const HOLIDAY_LOGIC_END = SOURCE.indexOf('function settingsServiceCategoriesFromCatalog');
const HOLIDAY_LOGIC = SOURCE.slice(HOLIDAY_LOGIC_START, HOLIDAY_LOGIC_END);

test('Settings adds Holiday & Closures after regular operating hours', () => {
  assert.match(HOLIDAY_CARD, /Holiday &amp; Closures/);
  assert.match(HOLIDAY_CARD, /Set dates when the salon is closed or has adjusted hours\./);
  assert.match(HOLIDAY_CARD, /data-settings-holiday-add/);
  assert.match(HOLIDAY_CARD, /\+ Add date/);
  assert.match(HOLIDAY_CARD, /settings-holiday-table/);
  assert.match(HOLIDAY_CARD, /DATE[\s\S]*REASON[\s\S]*TYPE/);
  assert.match(HOLIDAY_CARD, /data-settings-holiday-list/);
  assert.doesNotMatch(HOLIDAY_CARD, /data-settings-holiday-form/);
  assert.doesNotMatch(HOLIDAY_CARD, /data-settings-holiday-date/);

  const listPosition = HOLIDAY_CARD.indexOf('data-settings-holiday-list');
  const notifyPosition = HOLIDAY_CARD.indexOf('data-settings-holiday-auto-notify-toggle');
  assert.ok(listPosition >= 0);
  assert.ok(notifyPosition > listPosition, 'Auto-notify toggle should sit below the compact holiday list');

  const operatingHoursPosition = SETTINGS_PANEL.indexOf('>Operating Hours</div>');
  const holidayPosition = SETTINGS_PANEL.indexOf('data-settings-holiday-card');
  const aiVoicePosition = SETTINGS_PANEL.indexOf('>AI Voice</div>');
  assert.ok(operatingHoursPosition >= 0);
  assert.ok(holidayPosition > operatingHoursPosition, 'Holiday & Closures should follow Operating Hours');
  assert.ok(aiVoicePosition > holidayPosition, 'Holiday & Closures should appear before AI Voice');
});

test('Add date opens a Holiday & Closures modal with the date form', () => {
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-modal hidden/);
  assert.match(HOLIDAY_MODAL, /role="dialog"/);
  assert.match(HOLIDAY_MODAL, /Add Holiday &amp; Closure/);
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-form/);
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-date/);
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-status/);
  assert.match(HOLIDAY_MODAL, /value="closed"[\s\S]*Closed/);
  assert.match(HOLIDAY_MODAL, /value="adjusted"[\s\S]*Adjusted/);
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-open/);
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-close/);
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-reason/);
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-save/);
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-cancel/);
  assert.match(HOLIDAY_LOGIC, /function openSettingsHolidayModal\(/);
  assert.match(HOLIDAY_LOGIC, /function closeSettingsHolidayModal\(/);
  assert.match(HOLIDAY_LOGIC, /data-settings-holiday-add[\s\S]*openSettingsHolidayForm\(defaultSettingsHolidayClosure\(\)\)/);
});

test('Add Holiday & Closure modal has no Delete or Notify Affected buttons', () => {
  assert.doesNotMatch(HOLIDAY_MODAL, /data-settings-holiday-delete/);
  assert.doesNotMatch(HOLIDAY_MODAL, /data-settings-holiday-notify/);
  assert.doesNotMatch(SOURCE, /function sendSettingsHolidayNotifications\(/);
});

test('Holiday reason suggestions fill the reason input from chips', () => {
  assert.match(HOLIDAY_MODAL, /settings-holiday-reason-suggestions/);
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-reason-suggestion="Christmas Day"/);
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-reason-suggestion="Thanksgiving"/);
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-reason-suggestion="New Year's Day"/);
  assert.match(HOLIDAY_MODAL, /data-settings-holiday-reason-suggestion="Staff training"/);
  assert.match(HOLIDAY_LOGIC, /data-settings-holiday-reason-suggestion/);
  assert.match(HOLIDAY_LOGIC, /reason\.value = suggestion\.dataset\.settingsHolidayReasonSuggestion/);
  assert.match(HOLIDAY_LOGIC, /reason\.focus\(\)/);
});

test('Holiday & Closures explains booking impact and auto notify by AI Voice and SMS', () => {
  assert.match(HOLIDAY_CARD, /closed or has adjusted hours/i);
  assert.match(HOLIDAY_CARD, /data-settings-holiday-auto-notify-toggle/);
  assert.match(HOLIDAY_CARD, /AI Voice/);
  assert.match(HOLIDAY_CARD, /SMS/);
  assert.doesNotMatch(HOLIDAY_CARD, /settings-holiday-impact/);
  assert.doesNotMatch(HOLIDAY_CARD, /data-settings-holiday-message/);
  assert.doesNotMatch(HOLIDAY_CARD, /data-settings-holiday-affected-list/);
  assert.doesNotMatch(HOLIDAY_CARD, /data-settings-holiday-bookable-summary/);
  assert.doesNotMatch(SOURCE, /\.settings-holiday-impact/);
  assert.doesNotMatch(SOURCE, /function renderSettingsHolidayImpact\(/);
});

test('Holiday & Closures keeps one configuration per date', () => {
  assert.match(SOURCE, /var settingsHolidayClosures = \[/);
  assert.match(SOURCE, /function upsertSettingsHolidayClosure\(/);
  assert.match(SOURCE, /existingIndex[\s\S]*item\.date === form\.date/);
  assert.match(SOURCE, /settingsHolidayClosures\[existingIndex\] = form/);
  assert.match(SOURCE, /settingsHolidayClosures\.push\(form\)/);
});

test('Holiday & Closures starts with closed and adjusted demo rows', () => {
  assert.match(HOLIDAY_LOGIC, /date:\s*'2026-12-25'[\s\S]*status:\s*'closed'[\s\S]*reason:\s*'Christmas Day'/);
  assert.match(HOLIDAY_LOGIC, /date:\s*'2026-11-26'[\s\S]*status:\s*'adjusted'[\s\S]*open:\s*'10:00 AM'[\s\S]*close:\s*'3:00 PM'[\s\S]*reason:\s*'Thanksgiving'/);
  assert.match(HOLIDAY_LOGIC, /date:\s*'2026-07-04'[\s\S]*status:\s*'adjusted'[\s\S]*open:\s*'9:00 AM'[\s\S]*close:\s*'1:00 PM'[\s\S]*reason:\s*'Independence Day'/);
});

test('Holiday & Closures list exposes Edit, View, and Delete buttons', () => {
  assert.match(HOLIDAY_LOGIC, /data-settings-holiday-edit[\s\S]*aria-label="Edit closure"/);
  assert.match(HOLIDAY_LOGIC, /data-settings-holiday-view[\s\S]*aria-label="View closure"/);
  assert.match(HOLIDAY_LOGIC, /data-settings-holiday-remove[\s\S]*aria-label="Delete closure"/);
  assert.match(HOLIDAY_LOGIC, /data-settings-holiday-edit[\s\S]*data-settings-holiday-view[\s\S]*data-settings-holiday-remove/);
  assert.match(HOLIDAY_LOGIC, /function viewSettingsHolidayClosure\(date\)/);
  assert.match(HOLIDAY_LOGIC, /var view = event\.target\.closest\('\[data-settings-holiday-view\]'\);[\s\S]*viewSettingsHolidayClosure\(view\.dataset\.settingsHolidayView\)/);
  assert.match(HOLIDAY_LOGIC, /var isViewMode = settingsHolidayModalMode === 'view';[\s\S]*saveButton\.hidden = isViewMode/);
});

test('Holiday & Closures identifies appointments blocked by closed or adjusted hours', () => {
  assert.match(SOURCE, /function settingsHolidayImpactedAppointments\(/);
  assert.match(SOURCE, /appointmentStore\.loadAll\(null, catalog\)/);
  assert.match(SOURCE, /closure\.status === 'closed'/);
  assert.match(SOURCE, /startMinutes < openMinutes/);
  assert.match(SOURCE, /endMinutes > closeMinutes/);
});

test('Holiday & Closures updates status when saved, edited, deleted, or notified', () => {
  assert.match(SOURCE, /function renderSettingsHolidayClosures\(/);
  assert.match(SOURCE, /function openSettingsHolidayForm\(/);
  assert.match(SOURCE, /function editSettingsHolidayClosure\(/);
  assert.match(SOURCE, /function deleteSettingsHolidayClosure\(/);
  assert.match(SOURCE, /var status = 'Holiday & Closures saved/);
  assert.match(SOURCE, /setSettingsStatus\(status\);/);
  assert.match(SOURCE, /setSettingsStatus\('Holiday & Closures deleted/);
  assert.match(SOURCE, /AI Voice and SMS queued for ' \+ queuedCount/);
});

test('Holiday & Closures persists configs for reload and cross-tab sync', () => {
  assert.match(SOURCE, /SETTINGS_HOLIDAY_STORAGE_KEY/);
  assert.match(SOURCE, /var settingsHolidayClosures = \[/);
  assert.match(SOURCE, /function loadSettingsHolidayClosures\(/);
  assert.match(SOURCE, /function saveSettingsHolidayClosures\(/);
  assert.match(SOURCE, /localStorage\.getItem\(SETTINGS_HOLIDAY_STORAGE_KEY\)/);
  assert.match(SOURCE, /localStorage\.setItem\(SETTINGS_HOLIDAY_STORAGE_KEY, JSON\.stringify/);
  assert.match(SOURCE, /JSON\.parse\(raw\)/);
  assert.match(SOURCE, /event\.key === SETTINGS_HOLIDAY_STORAGE_KEY/);
});

test('Holiday & Closures blocks create, edit, drag, and calendar slot selection', () => {
  assert.match(SOURCE, /function settingsHolidayPlacementError\(/);
  assert.match(SOURCE, /function settingsHolidayCellIsBlocked\(/);
  assert.match(SOURCE, /function settingsHolidayScheduleForRange\(/);
  assert.match(SOURCE, /function bookingPanelCanonicalPayload\([\s\S]*settingsHolidayPlacementError/);
  assert.match(SOURCE, /function saveBookingFromCalendar\([\s\S]*settingsHolidayPlacementError/);
  assert.match(SOURCE, /function bookingCalendarValidateMove\([\s\S]*settingsHolidayPlacementError/);
  assert.match(SOURCE, /onBeforeCellRender:[\s\S]*settingsHolidayCellIsBlocked/);
  assert.match(SOURCE, /onTimeRangeSelected:[\s\S]*settingsHolidayPlacementError/);
});

test('Holiday & Closures notification queues are stored on affected appointments', () => {
  assert.match(HOLIDAY_LOGIC, /function queueSettingsHolidayNotifications\(/);
  assert.match(HOLIDAY_LOGIC, /function upsertSettingsHolidayClosure\([\s\S]*queueSettingsHolidayNotifications\(form/);
  assert.doesNotMatch(SOURCE, /settingsHolidayClosureByDate\(form\.date\) \|\| form/);
  assert.match(SOURCE, /appointmentStore\.update\(record\.id, \{/);
  assert.match(SOURCE, /holidayClosureNotification/);
  assert.match(HOLIDAY_LOGIC, /notificationStatus:\s*'queued'/);
  assert.match(SOURCE, /channel:\s*'AI Voice \+ SMS'/);
  assert.match(SOURCE, /message:\s*messageText/);
  assert.doesNotMatch(HOLIDAY_LOGIC, /smsStatus:\s*'sent'/);
  assert.match(SOURCE, /renderBookingStoreRows\(\);[\s\S]*renderSettingsHolidayClosures\(\);/);
});

test('Holiday & Closures rolls back when persistence fails', () => {
  assert.match(HOLIDAY_LOGIC, /var previousClosures = settingsHolidayClosures\.slice\(\);/);
  assert.match(HOLIDAY_LOGIC, /if \(!saveSettingsHolidayClosures\(\)\) \{[\s\S]*settingsHolidayClosures = previousClosures;[\s\S]*Could not save Holiday & Closures/);
  assert.match(HOLIDAY_LOGIC, /function deleteSettingsHolidayClosure\(date\) \{[\s\S]*if \(!saveSettingsHolidayClosures\(\)\) \{[\s\S]*settingsHolidayClosures = previousClosures;[\s\S]*Could not delete Holiday & Closures/);
});
