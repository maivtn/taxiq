import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const PAGE_URL = new URL('./w9-form.html', import.meta.url);

function source() {
  assert.ok(existsSync(PAGE_URL), 'w9-form.html must exist');
  return readFileSync(PAGE_URL, 'utf8');
}

test('contains the complete editable W-9 page-one field contract in source order', () => {
  const html = source();
  const ids = [
    'taxpayer-name', 'business-name', 'classification-individual',
    'classification-c-corp', 'classification-s-corp', 'classification-partnership',
    'classification-trust', 'classification-llc', 'llc-code', 'classification-other',
    'foreign-owners', 'exempt-payee-code', 'fatca-code', 'street-address',
    'city', 'state', 'zip', 'requester-details', 'account-numbers',
    'tin-type-ssn', 'tin-type-ein', 'ssn', 'ein', 'certification-acknowledgment',
    'signature', 'signature-date'
  ];

  ids.forEach((id) => {
    assert.match(html, new RegExp(`id=["']${id}["']`), `${id} must exist`);
  });

  const ordered = [
    'taxpayer-section', 'classification-section', 'address-section',
    'tin-section', 'certification-section'
  ];
  let cursor = -1;
  ordered.forEach((id) => {
    const next = html.indexOf(`id="${id}"`);
    assert.ok(next > cursor, `${id} must follow the previous W-9 section`);
    cursor = next;
  });

  assert.match(html, /Do not send this form to the IRS/i);
  assert.match(html, /Không gửi trực tiếp[^.]*IRS/i);
});

test('declares mobile-first touch, safe-area, and US Letter print behavior', () => {
  const html = source();
  assert.match(html, /width=device-width,\s*initial-scale=1/);
  assert.match(html, /min-height:\s*44px/);
  assert.match(html, /env\(safe-area-inset-bottom/);
  assert.match(html, /@page\s*{[^}]*size:\s*Letter portrait/s);
  assert.match(html, /@media\s+print/);
  assert.match(html, /@media\s*\(min-width:\s*768px\)/);
});

