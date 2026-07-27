const test = require('node:test');
const assert = require('node:assert/strict');
const {
  SALON_ID,
  DEFAULT_CATALOG,
  STORAGE_KEY,
  findService,
  findTechnician,
  normalizeCatalog,
  loadCatalog,
  saveCatalog,
  storageAvailable,
} = require('./salon-data.js');

function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

test('default catalog is scoped to one salon with unique services and technicians', () => {
  assert.equal(SALON_ID, 'bitcoin-nail-bar-houston');
  assert.equal(STORAGE_KEY, 'nexora:salon-data:v1:bitcoin-nail-bar-houston');
  assert.equal(DEFAULT_CATALOG.salon.id, SALON_ID);
  assert.equal(new Set(DEFAULT_CATALOG.services.map((item) => item.id)).size, DEFAULT_CATALOG.services.length);
  assert.equal(new Set(DEFAULT_CATALOG.technicians.map((item) => item.id)).size, DEFAULT_CATALOG.technicians.length);
  assert.ok(DEFAULT_CATALOG.services.some((item) => item.name === 'Eyelash'));
  assert.ok(DEFAULT_CATALOG.technicians.some((item) => item.name === 'Mai P.'));
});

test('lookup resolves canonical IDs, names, and aliases', () => {
  assert.equal(findTechnician(DEFAULT_CATALOG, 'Kim N.').id, 't2');
  assert.equal(findTechnician(DEFAULT_CATALOG, 't8').name, 'Mai P.');
  assert.equal(findService(DEFAULT_CATALOG, 'Classic Pedicure').id, 'pedi');
  assert.equal(findService(DEFAULT_CATALOG, 'missing-service'), null);
});

test('normalizeCatalog removes duplicate IDs and supplies safe defaults', () => {
  const catalog = normalizeCatalog({
    salon: { id: SALON_ID, name: 'Test Salon', location: 'Houston, TX' },
    services: [{ id: 'pedi', name: 'Pedicure' }, { id: 'pedi', name: 'Duplicate' }],
    technicians: [{ id: 't1', name: 'Tina' }, { id: 't1', name: 'Duplicate' }],
  });
  assert.equal(catalog.services.length, 1);
  assert.equal(catalog.technicians.length, 1);
  assert.equal(catalog.services[0].active, true);
  assert.deepEqual(catalog.technicians[0].skills, []);
});

test('catalog persistence falls back to defaults for missing or invalid JSON', () => {
  const missing = loadCatalog(storage());
  assert.equal(missing.salon.id, SALON_ID);

  const invalid = loadCatalog(storage({
    ['nexora:salon-data:v1:' + SALON_ID]: '{bad json',
  }));
  assert.equal(invalid.salon.id, SALON_ID);
});

test('saveCatalog writes a normalized clone under the salon-scoped key', () => {
  const target = storage();
  const result = saveCatalog({
    salon: { id: SALON_ID, name: 'Saved Salon', location: 'Houston, TX' },
    services: [], technicians: [],
  }, target);
  assert.equal(result.salon.name, 'Saved Salon');
  assert.match(target.getItem('nexora:salon-data:v1:' + SALON_ID), /Saved Salon/);
});

test('technician roster changes persist and inactive technicians stay resolvable', () => {
  const target = storage();
  const catalog = saveCatalog({
    salon: DEFAULT_CATALOG.salon,
    services: DEFAULT_CATALOG.services,
    technicians: DEFAULT_CATALOG.technicians.map((technician) => technician.id === 't8'
      ? { ...technician, name: 'Mai Updated', phone: '(832) 555-0188' }
      : technician.id === 't7'
        ? { ...technician, active: false }
        : technician),
  }, target);
  const loaded = loadCatalog(target);
  assert.equal(findTechnician(loaded, 't8').name, 'Mai Updated');
  assert.equal(findTechnician(loaded, 't8').phone, '(832) 555-0188');
  assert.equal(findTechnician(loaded, 't7').active, false);
  assert.deepEqual(loaded.technicians.filter((technician) => technician.active).map((technician) => technician.id).includes('t7'), false);
  assert.equal(catalog.technicians.length, DEFAULT_CATALOG.technicians.length);
});

test('catalog storage failures fall back without throwing', () => {
  const blocked = {
    getItem() { throw new Error('storage blocked'); },
    setItem() { throw new Error('storage blocked'); },
  };
  assert.equal(storageAvailable(blocked), false);
  assert.equal(loadCatalog(blocked).salon.id, SALON_ID);
  assert.equal(saveCatalog(DEFAULT_CATALOG, blocked).salon.id, SALON_ID);
});
