import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');
const SETTINGS_START = SOURCE.indexOf('<section class="tab-panel" id="panel-settings"');
const SETTINGS_END = SOURCE.indexOf('<section class="tab-panel" id="panel-customers"');
const SETTINGS_PANEL = SOURCE.slice(SETTINGS_START, SETTINGS_END);
const SALON_INFO_CARD = SETTINGS_PANEL.match(/<article class="settings-card">[\s\S]*?>Salon Info<\/div>[\s\S]*?<\/article>/)?.[0] || '';
const BOOKING_SMS_CARD = SETTINGS_PANEL.match(/<article class="settings-card" data-settings-booking-sms-card>[\s\S]*?<\/article>/)?.[0] || '';
const BOOKING_POLICIES_CARD = SETTINGS_PANEL.match(/<article class="settings-card" data-settings-booking-policies-card>[\s\S]*?<\/article>/)?.[0] || '';
const BOOKING_POLICY_GRID_RULE = SOURCE.match(/\.settings-booking-policy-grid\s*\{([^}]*)\}/)?.[1] || '';
const BOOKING_POLICY_DESKTOP_GRID_RULE = SOURCE.match(/@media \(min-width:\s*640px\) \{[\s\S]*?\.settings-booking-policy-grid\s*\{([^}]*)\}/)?.[1] || '';
const SALON_NAME_FIELD_RULE = SOURCE.match(/\.settings-business-grid\s*>\s*\.settings-salon-name-field\s*\{([\s\S]*?)\n\s*\}/)?.[1] || '';
const SETTINGS_BUSINESS_DESKTOP_GRID_RULE = SOURCE.match(/@media \(min-width:\s*640px\) \{[\s\S]*?\.settings-business-grid\s*\{([^}]*)\}/)?.[1] || '';

test('Salon Info uses Booking notification number for live-person call forwarding', () => {
  assert.match(SALON_INFO_CARD, />Salon Info<\/div>/);
  assert.doesNotMatch(SALON_INFO_CARD, /Cell Phone/);
  assert.doesNotMatch(SALON_INFO_CARD, /cell-phone-help/);
  assert.match(SALON_INFO_CARD, /<span class="settings-label settings-label-with-tooltip">[\s\S]*Booking notification number[\s\S]*<\/span>/);
  assert.match(SALON_INFO_CARD, /id="booking-notification-number-help" role="tooltip">Gets booking SMS notifications and AI forwards calls to this phone number when a customer asks to speak with a real person\.<\/span>/);
  assert.match(SALON_INFO_CARD, /Booking notification number[\s\S]*<input class="settings-input phone-mask-input" type="tel"[^>]*autocomplete="tel-national"[^>]*data-phone-mask/);

  const salonPhonePosition = SALON_INFO_CARD.indexOf('Salon phone number');
  const aiNumberPosition = SALON_INFO_CARD.indexOf('AI answering number');
  const notificationNumberPosition = SALON_INFO_CARD.indexOf('Booking notification number');
  assert.ok(notificationNumberPosition > salonPhonePosition, 'Booking notification number should follow Salon phone number');
  assert.ok(notificationNumberPosition > aiNumberPosition, 'Booking notification number should follow AI answering number');
});

test('Salon Info places salon name and salon phone number on the same row', () => {
  assert.match(SALON_INFO_CARD, /<label class="settings-field settings-salon-name-field">[\s\S]*<span class="settings-label">Salon name<\/span>/);
  assert.doesNotMatch(SALON_NAME_FIELD_RULE, /grid-column:\s*1\s*\/\s*-1/);
  assert.match(SETTINGS_BUSINESS_DESKTOP_GRID_RULE, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);

  const addressPosition = SALON_INFO_CARD.indexOf('settings-location-grid');
  const phoneFieldsArea = SALON_INFO_CARD.slice(0, addressPosition);
  assert.equal((phoneFieldsArea.match(/type="tel"/g) || []).length, 3);

  const positions = [
    SALON_INFO_CARD.indexOf('Salon name'),
    SALON_INFO_CARD.indexOf('Salon phone number'),
    SALON_INFO_CARD.indexOf('AI answering number'),
    SALON_INFO_CARD.indexOf('Booking notification number')
  ];
  assert.ok(positions.every((position) => position >= 0), 'all Salon Info name and phone labels must exist');
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test('Salon Info places Google Review Link and Website on the same grid row', () => {
  const googleField = SALON_INFO_CARD.match(/<label class="[^"]*"[^>]*>\s*<span class="settings-label">Google Review Link<\/span>[\s\S]*?<\/label>/)?.[0] || '';
  const websiteField = SALON_INFO_CARD.match(/<label class="[^"]*"[^>]*>\s*<span class="settings-label">Website<\/span>[\s\S]*?<\/label>/)?.[0] || '';
  assert.match(googleField, /<label class="settings-field">/);
  assert.match(websiteField, /<label class="settings-field">/);
  assert.doesNotMatch(googleField, /settings-span-full/);
  assert.doesNotMatch(websiteField, /settings-span-full/);
  assert.doesNotMatch(googleField, /style="grid-column:\s*1\s*\/\s*-1;"/);
  assert.doesNotMatch(websiteField, /style="grid-column:\s*1\s*\/\s*-1;"/);

  const googlePosition = SALON_INFO_CARD.indexOf('Google Review Link');
  const websitePosition = SALON_INFO_CARD.indexOf('Website');
  const socialLinksPosition = SALON_INFO_CARD.indexOf('Social Links');
  assert.ok(googlePosition >= 0);
  assert.ok(websitePosition > googlePosition, 'Website should sit immediately after Google Review Link in the two-column grid');
  assert.ok(socialLinksPosition > websitePosition, 'Social Links should remain below the link fields');
});

test('adds three booking SMS recipient switches to Settings', () => {
  assert.match(BOOKING_SMS_CARD, /data-settings-booking-sms-card/);
  assert.match(BOOKING_SMS_CARD, /Booking SMS Notifications/);
  for (const label of ['Send to customer', 'Send to salon', 'Send to assigned staff']) {
    assert.match(BOOKING_SMS_CARD, new RegExp(label));
  }
  assert.equal((BOOKING_SMS_CARD.match(/data-settings-booking-sms-toggle="[^"]+"/g) || []).length, 3);
  assert.equal((BOOKING_SMS_CARD.match(/role="switch" aria-checked="true"/g) || []).length, 3);
});

test('synchronizes booking SMS switch accessibility and visible status', () => {
  assert.match(SOURCE, /function syncBookingSmsNotificationToggle\(toggle\)/);
  assert.match(SOURCE, /data-settings-booking-sms-status/);
  assert.match(SOURCE, /toggle\.setAttribute\('aria-checked', enabled \? 'true' : 'false'\)/);
  assert.match(SOURCE, /Disable .*booking SMS/);
  assert.match(SOURCE, /Enable .*booking SMS/);
  assert.match(SOURCE, /querySelectorAll\('\[data-settings-booking-sms-toggle\]'\)/);
  assert.match(SOURCE, /setSettingsStatus\([^\n]*booking SMS/);
});

test('keeps the existing first-call SMS switch intact', () => {
  assert.match(SOURCE, /data-settings-first-call-sms-toggle/);
  assert.match(SOURCE, /function syncFirstCallSmsToggle\(toggle\)/);
});

test('adds Booking Policies card for deposits cancellations and no-show fees', () => {
  assert.match(BOOKING_POLICIES_CARD, /Booking Policies/);
  assert.match(BOOKING_POLICIES_CARD, /Deposits, cancellations, and no-show rules\./);
  assert.doesNotMatch(BOOKING_POLICIES_CARD, /NEW CARD/);
  assert.doesNotMatch(BOOKING_POLICIES_CARD, /settings-new-card-badge/);
  assert.doesNotMatch(BOOKING_POLICIES_CARD, /data-settings-booking-policies-new-card/);
  assert.match(BOOKING_POLICIES_CARD, /data-settings-booking-policy-toggle/);
  assert.match(BOOKING_POLICIES_CARD, /Require deposit/);
  assert.match(BOOKING_POLICIES_CARD, /DEPOSIT[\s\S]*20% of service price/);
  assert.match(BOOKING_POLICIES_CARD, /NO-SHOW FEE[\s\S]*\$20/);
  assert.match(BOOKING_POLICIES_CARD, /data-settings-booking-policy-preview/);
  assert.match(BOOKING_POLICY_GRID_RULE, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(SOURCE, /function syncBookingPoliciesPreview\(/);
  assert.match(SOURCE, /querySelectorAll\('\[data-settings-booking-policy-input\]'\)/);
  assert.match(SOURCE, /querySelectorAll\('\[data-settings-booking-policy-toggle\]'\)/);
});

test('lays out Booking Policies fields in two mobile columns and four desktop columns', () => {
  assert.match(BOOKING_POLICY_GRID_RULE, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(BOOKING_POLICY_DESKTOP_GRID_RULE, /grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
});

test('groups related Settings cards in the requested desktop order', () => {
  const positions = [
    SETTINGS_PANEL.indexOf('>Salon Info</div>'),
    SETTINGS_PANEL.indexOf('>Operating Hours</div>'),
    SETTINGS_PANEL.indexOf('data-settings-holiday-card'),
    SETTINGS_PANEL.indexOf('data-settings-booking-policies-card'),
    SETTINGS_PANEL.indexOf('>AI Voice</div>'),
    SETTINGS_PANEL.indexOf('data-settings-booking-sms-card')
  ];

  assert.ok(positions.every((position) => position >= 0), 'all Settings card markers must exist');
  assert.ok(positions[0] < positions[1], 'Salon Info should appear before Operating Hours');
  assert.ok(positions[1] < positions[2], 'Operating Hours should appear before Holiday & Closures');
  assert.ok(positions[2] < positions[3], 'Holiday & Closures should appear before Booking Policies');
  assert.ok(positions[3] < positions[4], 'Booking Policies should appear before AI Voice');
  assert.ok(positions[4] < positions[5], 'AI Voice should appear before Booking SMS Notifications');
});
