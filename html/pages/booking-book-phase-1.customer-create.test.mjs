import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync(new URL('./booking-book-phase-1.html', import.meta.url), 'utf8');

test('Customers panel exposes a create customer action', () => {
  assert.match(SOURCE, /data-cust-create/);
  assert.match(SOURCE, /Create customer/);
});

test('Customer modal includes phone, create title, and inline validation hooks', () => {
  assert.match(SOURCE, /data-cust-modal-title/);
  assert.match(SOURCE, /data-cf-phone/);
  assert.match(SOURCE, /data-cust-modal-error/);
});

test('Customer runtime opens the existing modal in create mode', () => {
  assert.match(SOURCE, /function openCustCreateModal\(/);
  assert.match(SOURCE, /custEditIndex\s*=\s*-1/);
  assert.match(SOURCE, /data-cust-create/);
});

test('Customer runtime validates name and phone before creating', () => {
  assert.match(SOURCE, /function setCustModalError\(/);
  assert.match(SOURCE, /if \(custEditIndex === -1 && \(!name \|\| !phone\)\)/);
  assert.match(SOURCE, /setCustModalError\(/);
});

test('Customer runtime adds manual customers with initial visit data', () => {
  assert.match(SOURCE, /CUSTOMERS\.push\(/);
  assert.match(SOURCE, /src:\s*'manual'/);
  assert.match(SOURCE, /visits:\s*0/);
  assert.match(SOURCE, /last:\s*'—'/);
  assert.match(SOURCE, /seg:\s*'new'/);
});

test('Customer edit action remains wired to the existing modal', () => {
  assert.match(SOURCE, /data-cust-edit/);
  assert.match(SOURCE, /function openCustModal\(/);
  assert.match(SOURCE, /openCustModal\(parseInt\(custEditBtn\.dataset\.custEdit, 10\)\)/);
});
