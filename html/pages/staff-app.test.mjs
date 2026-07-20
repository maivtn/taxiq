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
