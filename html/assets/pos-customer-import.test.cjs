const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const importPath = path.join(__dirname, 'pos-customer-import.js');

test('customer Excel import parses rows, updates matching phones, adds new customers, and skips nameless rows', () => {
  assert.ok(fs.existsSync(importPath), 'customer import helper should exist');
  const customerImport = require(importPath);
  const rows = customerImport.parseDelimited([
    'Name,Phone,Email,Group,Source,Visits,Spent,Tags,Regular Tech,Staff note',
    'Jessica Kim,(832) 906-4471,jessica@example.com,Returning,Excel,9,$720,Sensitive Skin;Likes Warm Water,Helen,Confirm unscented lotion',
    'Nina Park,(713) 000-0101,nina@example.com,VIP,Excel,3,$260,Prefers Female Tech,Tina,Offer tea',
    ',(713) 000-9999,missing-name@example.com,New,Excel,1,$40,,,'
  ].join('\n'));
  const customers = [
    { name: 'Jessica Kim', phone: '(832) 906-4471', email: '', seg: 'rtn', visits: 8, spent: 640, tags: ['Sensitive Skin'], prefTech: null, notes: { owner: '', staff: '', customer: '' }, src: 'call', type: 'Individual', status: 'active' }
  ];

  const result = customerImport.mergeCustomers(customers, rows, {
    techs: [{ id: 't3', name: 'Helen' }, { id: 't1', name: 'Tina' }]
  });

  assert.equal(result.updated, 1);
  assert.equal(result.imported, 1);
  assert.equal(result.skipped, 1);
  assert.equal(customers.length, 2);
  assert.equal(customers[0].email, 'jessica@example.com');
  assert.equal(customers[0].visits, 9);
  assert.equal(customers[0].spent, 720);
  assert.equal(customers[0].prefTech, 't3');
  assert.deepEqual(customers[0].tags, ['Sensitive Skin', 'Likes Warm Water']);
  assert.equal(customers[0].notes.staff, 'Confirm unscented lotion');
  assert.equal(customers[0].src, 'excel');
  assert.deepEqual(customers[1], {
    name: 'Nina Park',
    phone: '(713) 000-0101',
    email: 'nina@example.com',
    birthday: '',
    address: '',
    type: 'VIP',
    status: 'active',
    seg: 'vip',
    visits: 3,
    spent: 260,
    tags: ['Prefers Female Tech'],
    prefTech: 't1',
    notes: { owner: '', staff: 'Offer tea', customer: '' },
    src: 'excel'
  });
});
