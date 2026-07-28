const test = require('node:test');
const assert = require('node:assert/strict');
const serviceCatalog = require('./appointment-service-catalog.js');

test('normalizes category services into appointment picker options', () => {
  const catalog = serviceCatalog.normalize({
    categories: [
      {
        id: 'cat-pedi',
        name: 'PEDICURE SERVICE',
        services: [
          { id: 'svc-classic', name: 'CLASSIC', price: 35, durationMin: 60 },
          { id: 'svc-jelly', name: 'JELLY PEDICURE', price: 55, durationMin: 75 },
        ],
      },
    ],
  });

  assert.deepEqual(catalog.categories.map(({ id, name }) => ({ id, name })), [
    { id: 'cat-pedi', name: 'PEDICURE SERVICE' },
  ]);
  assert.deepEqual(catalog.services, [
    {
      id: 'svc-classic',
      name: 'CLASSIC',
      categoryId: 'cat-pedi',
      categoryName: 'PEDICURE SERVICE',
      price: 35,
      durationMin: 60,
      requiredSkill: '',
      icon: '✨',
    },
    {
      id: 'svc-jelly',
      name: 'JELLY PEDICURE',
      categoryId: 'cat-pedi',
      categoryName: 'PEDICURE SERVICE',
      price: 55,
      durationMin: 75,
      requiredSkill: '',
      icon: '✨',
    },
  ]);
});

test('normalizes missing values without dropping a category service', () => {
  const catalog = serviceCatalog.normalize({
    categories: [{ name: 'ADD-ONS', services: [{ name: 'NAIL ART' }] }],
  });

  assert.equal(catalog.services.length, 1);
  assert.equal(catalog.services[0].name, 'NAIL ART');
  assert.equal(catalog.services[0].categoryName, 'ADD-ONS');
  assert.equal(catalog.services[0].price, null);
  assert.equal(catalog.services[0].durationMin, 60);
});
