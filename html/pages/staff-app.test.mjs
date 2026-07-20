import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const STAFF_APP_URL = new URL('./staff-app.html', import.meta.url);
const LEGACY_URL = new URL('./mobile-two-account-tailwind-lucide.html', import.meta.url);

function source() {
  assert.ok(existsSync(STAFF_APP_URL), 'staff-app.html must exist');
  return readFileSync(STAFF_APP_URL, 'utf8');
}

test('uses the canonical Staff App filename', () => {
  assert.equal(existsSync(STAFF_APP_URL), true);
  assert.equal(existsSync(LEGACY_URL), false);
});

test('renders Jobs inside the existing Staff App shell', () => {
  const html = source();
  assert.match(html, /id="staff-jobs-screen"/);
  assert.match(html, /data-jobs-root/);
  assert.match(html, /data-staff-shell[^>]*data-staff-menu-active="jobs"/);
  assert.match(html, /data-menu-key="jobs"[^>]*>Jobs<\/a>/);
  assert.match(html, /href="#staff-jobs-screen"/);
  assert.match(html, /Community<\/a>/);
});

test('contains the complete three-view Jobs contract', () => {
  const html = source();
  for (const view of ['matches', 'profile', 'activity']) {
    assert.match(html, new RegExp(`data-job-tab="${view}"`));
    assert.match(html, new RegExp(`data-job-panel="${view}"`));
  }
  assert.match(html, /Rose Nails &amp; Spa/);
  assert.match(html, /94% match/i);
  assert.match(html, /Golden Glow Spa/);
  assert.match(html, /76% match/i);
  assert.match(html, /data-job-match="rose"/);
  assert.match(html, /data-job-match="golden"/);
  for (const action of ['interest', 'dismiss', 'report']) {
    assert.match(html, new RegExp(`data-job-action="${action}"`));
  }
});

test('renders job profile, activity, consent, and guardrail content', () => {
  const html = source();
  for (const field of ['skills', 'experience', 'license', 'radius', 'compensation', 'schedule']) {
    assert.match(html, new RegExp(`data-job-profile-field="${field}"`));
  }
  for (const status of ['active', 'paused', 'deleted']) {
    assert.match(html, new RegExp(`data-job-profile-status="${status}"`));
  }
  for (const state of ['interested', 'contact-requested', 'contact-shared', 'declined']) {
    assert.match(html, new RegExp(`data-job-activity-state="${state}"`));
  }
  assert.match(html, /data-job-dialog="contact"[^>]*role="dialog"/);
  assert.match(html, /data-job-dialog="report"[^>]*role="dialog"/);
  assert.match(html, /data-job-dialog="delete"[^>]*role="dialog"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /current salon[^.]*never/i);
  assert.match(html, /self-reported[^.]*not verified by NEXORA/i);
  assert.match(html, /does not hire, pay, recruit/i);
  assert.match(html, /AI only suggests/i);
  assert.match(html, /1099\/W-2/i);
});
