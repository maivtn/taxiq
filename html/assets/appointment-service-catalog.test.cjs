const test = require('node:test');
const assert = require('node:assert/strict');
const serviceCatalog = require('./appointment-service-catalog.js');
const menu = require('../menu/menu.json');

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
      description: '',
      includes: [],
      type: '',
      priceLabel: '',
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
      description: '',
      includes: [],
      type: '',
      priceLabel: '',
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
  assert.equal(catalog.services[0].description, '');
  assert.deepEqual(catalog.services[0].includes, []);
  assert.equal(catalog.services[0].type, '');
  assert.equal(catalog.services[0].priceLabel, '');
  assert.equal(catalog.services[0].price, null);
  assert.equal(catalog.services[0].durationMin, null);
});

test('preserves menu price labels and leaves missing durations empty', () => {
  const catalog = serviceCatalog.normalize(menu);
  const surcharge = catalog.services.find((service) => service.name === 'Surcharge for A removal Gel or Power');
  const addOn = catalog.services.find((service) => service.name === 'Add Gel Polish On Any Pedicure');

  assert.equal(surcharge.priceLabel, '$10+');
  assert.equal(surcharge.price, 10);
  assert.equal(surcharge.durationMin, null);
  assert.equal(addOn.priceLabel, '$20');
  assert.equal(addOn.durationMin, null);
});

test('normalizes the shared menu into bookable service categories', () => {
  const catalog = serviceCatalog.normalize(menu);

  assert.equal(catalog.categories.length, 11);
  assert.equal(catalog.services.length, 96);
  assert.equal(catalog.categories[0].name, 'Pedicure');
  assert.deepEqual(catalog.services[0], {
    id: 'pedicure-president-7-star-0',
    name: 'President 7 Star',
    categoryId: 'pedicure',
    categoryName: 'Pedicure',
    description: 'The ultimate royal treatment: an elite, head-to-toe pampering experience with an exclusive royal soak, advanced skincare, and a 70-minute combination of hot stone, reflexology, and therapeutic massage.',
    includes: [
      'Your choice of any premium manicure or full set nail enhancement (Gel-X, dip, acrylic, etc.)',
      'Simultaneous collagen hand treatment and double paraffin wax for hands and feet',
      'Premium champagne or wine'
    ],
    type: '',
    priceLabel: '$499',
    price: 499,
    durationMin: 70,
    requiredSkill: '',
    icon: '✨'
  });
  assert.equal(catalog.services.find((service) => service.name === 'Add Gel Polish On Any Pedicure').type, 'add-on');
  assert.deepEqual(catalog.notes, menu.notes);
  assert.doesNotMatch(JSON.stringify(catalog.categories), /Complimentary|Drinks|Alcohol/);
});
