import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');
const SETTINGS_START = SOURCE.indexOf('<section class="tab-panel" id="panel-settings"');
const SETTINGS_END = SOURCE.indexOf('<section class="tab-panel" id="panel-customers"');
const SETTINGS_PANEL = SOURCE.slice(SETTINGS_START, SETTINGS_END);
const BOOKING_SMS_CARD = SETTINGS_PANEL.match(/<article class="settings-card" data-settings-booking-sms-card>[\s\S]*?<\/article>/)?.[0] || '';

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
