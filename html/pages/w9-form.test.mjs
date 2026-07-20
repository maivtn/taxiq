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

test('keeps fieldset legends within valid phrasing content', () => {
  const html = source();
  const legends = [...html.matchAll(/<legend\b[\s\S]*?<\/legend>/g)].map((match) => match[0]);
  assert.equal(legends.length, 5);
  legends.forEach((legend) => assert.doesNotMatch(legend, /<h[1-6]\b/i));
});

test('renders the clear-form action as a Reset text button', () => {
  const html = source();
  const button = html.match(/<button\b[^>]*id="clear-form"[^>]*>([\s\S]*?)<\/button>/);
  assert.ok(button, 'clear-form button must exist');
  assert.equal(button[1].replace(/<[^>]+>/g, '').trim(), 'Reset');
  assert.doesNotMatch(button[0], /\bbutton-icon\b/);
});

function api() {
  const html = source();
  const script = html.match(/<script id="w9-form-script">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'inline W-9 script must exist');
  const window = { W9_FORM_SKIP_INIT: true };
  window.window = window;
  const context = vm.createContext({ window, console, JSON, Date });
  vm.runInContext(script, context);
  assert.ok(window.W9_FORM_TEST_API, 'W-9 helper API must be exported');
  return window.W9_FORM_TEST_API;
}

test('formats and validates SSN and EIN by TIN type', () => {
  const form = api();
  assert.equal(form.formatTin('ssn', '123456789'), '123-45-6789');
  assert.equal(form.formatTin('ein', '123456789'), '12-3456789');
  assert.equal(form.isValidTin('ssn', '123-45-6789'), true);
  assert.equal(form.isValidTin('ein', '12-3456789'), true);
  assert.equal(form.isValidTin('ssn', '1234'), false);
});

test('shows line 3b only for flow-through classifications', () => {
  const form = api();
  assert.equal(form.line3bApplies('partnership', ''), true);
  assert.equal(form.line3bApplies('trust', ''), true);
  assert.equal(form.line3bApplies('llc', 'P'), true);
  assert.equal(form.line3bApplies('llc', 'S'), false);
  assert.equal(form.line3bApplies('individual', ''), false);
});

test('removes TIN and signature from the device-local draft', () => {
  const form = api();
  const draft = form.sanitizeDraft({
    taxpayerName: 'Amy Nguyen',
    businessName: 'Amy Nail Studio',
    ssn: '123-45-6789',
    ein: '12-3456789',
    signature: 'Amy Nguyen',
    signatureDate: '2026-07-20'
  });

  assert.equal(draft.taxpayerName, 'Amy Nguyen');
  assert.equal(draft.businessName, 'Amy Nail Studio');
  assert.equal('ssn' in draft, false);
  assert.equal('ein' in draft, false);
  assert.equal('signature' in draft, false);
  assert.equal('signatureDate' in draft, false);
});

test('returns field-specific errors for missing and conditional values', () => {
  const form = api();
  const errors = form.validateValues({
    classification: 'llc',
    llcCode: '',
    tinType: 'ssn',
    ssn: '123'
  });

  assert.equal(errors.taxpayerName, 'Enter the name shown on your tax return.');
  assert.equal(errors.llcCode, 'Choose C, S, or P for the LLC.');
  assert.equal(errors.streetAddress, 'Enter your street address.');
  assert.equal(errors.ssn, 'Enter a valid 9-digit SSN.');
  assert.equal(errors.certificationAcknowledgment, 'Accept the certification to continue.');
  assert.equal(errors.signature, 'Type your full legal name to sign.');
});

test('accepts a complete U.S. address and certification while rejecting invalid state and ZIP values', () => {
  const form = api();
  const valid = {
    taxpayerName: 'Amy Nguyen',
    classification: 'individual',
    streetAddress: '100 Main Street',
    city: 'Houston',
    state: 'TX',
    zip: '77002-1234',
    tinType: 'ssn',
    ssn: '123-45-6789',
    certificationAcknowledgment: true,
    signature: 'Amy Nguyen',
    signatureDate: '2026-07-20'
  };

  assert.deepEqual(Object.keys(form.validateValues(valid)), []);
  const invalid = form.validateValues({ ...valid, state: 'ZZ', zip: '1234' });
  assert.equal(invalid.state, 'Enter a valid 2-letter U.S. state or territory code.');
  assert.equal(invalid.zip, 'Enter a valid 5-digit ZIP or ZIP+4.');
});
