const test = require('node:test');
const assert = require('node:assert/strict');

let promotions = null;
try {
  promotions = require('./promotions-store.js');
} catch (_error) {
  promotions = null;
}

function requirePromotions() {
  assert.ok(promotions, 'shared promotions store must exist');
  return promotions;
}

function memoryStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem() { return value; },
    setItem(_key, nextValue) { value = String(nextValue); },
    removeItem() { value = null; },
    snapshot() { return value; }
  };
}

test('seeds structured booking promotions for a new salon', () => {
  const api = requirePromotions();
  const storage = memoryStorage();

  const offers = api.load(storage);

  assert.equal(offers.length, 5);
  assert.deepEqual(
    offers.map(({ id, type, eligibility, status, image }) => ({ id, type, eligibility, status, image })),
    [
      { id: 'happy-hours', type: 'percent', eligibility: 'weekday', status: 'active', image: '' },
      { id: 'mani-pedi-combo', type: 'fixed', eligibility: 'combo', status: 'active', image: '' },
      { id: 'quiet-day-savings', type: 'percent', eligibility: 'quiet-days', status: 'active', image: '' },
      { id: 'first-visit', type: 'percent', eligibility: 'first-visit', status: 'active', image: '' },
      { id: 'group-savings', type: 'custom', eligibility: 'group', status: 'active', image: '' }
    ]
  );
  assert.ok(storage.snapshot(), 'seeding must persist the initial offers');
});

test('normalizes salon input and rejects unsafe image sources', () => {
  const api = requirePromotions();
  const normalized = api.normalize({
    id: ' Summer Special ',
    title: '  Summer Special  ',
    badge: '  LIMITED TIME  ',
    type: 'unknown',
    eligibility: 'unknown',
    value: '  20% OFF  ',
    description: '  Book any service.  ',
    image: 'javascript:alert(1)',
    status: 'other'
  });

  assert.deepEqual(
    {
      id: normalized.id,
      title: normalized.title,
      badge: normalized.badge,
      type: normalized.type,
      eligibility: normalized.eligibility,
      value: normalized.value,
      description: normalized.description,
      image: normalized.image,
      status: normalized.status
    },
    {
      id: 'summer-special',
      title: 'Summer Special',
      badge: 'LIMITED TIME',
      type: 'custom',
      eligibility: 'all',
      value: '20% OFF',
      description: 'Book any service.',
      image: '',
      status: 'paused'
    }
  );
});

test('persists create, edit, pause, and delete operations', () => {
  const api = requirePromotions();
  const storage = memoryStorage(JSON.stringify({ version: 1, offers: [] }));

  const created = api.upsert({
    title: 'First Visit', type: 'percent', eligibility: 'first-visit', value: '10% OFF',
    description: 'Applied automatically.', status: 'active'
  }, storage);
  assert.equal(created.id, 'first-visit');
  assert.equal(api.load(storage)[0].value, '10% OFF');

  api.upsert({ ...created, value: '15% OFF' }, storage);
  assert.equal(api.load(storage)[0].value, '15% OFF');

  api.setStatus(created.id, 'paused', storage);
  assert.equal(api.load(storage)[0].status, 'paused');

  assert.equal(api.remove(created.id, storage), true);
  assert.deepEqual(api.load(storage), []);
});

test('returns only active offers inside their optional date window', () => {
  const api = requirePromotions();
  const storage = memoryStorage(JSON.stringify({
    version: 1,
    offers: [
      { id: 'ongoing', title: 'Ongoing', value: '10% OFF', status: 'active' },
      { id: 'current', title: 'Current', value: '$10 OFF', status: 'active', startDate: '2026-08-01', endDate: '2026-08-31' },
      { id: 'paused', title: 'Paused', value: '20% OFF', status: 'paused' },
      { id: 'expired', title: 'Expired', value: '5% OFF', status: 'active', endDate: '2026-07-31' },
      { id: 'future', title: 'Future', value: '30% OFF', status: 'active', startDate: '2026-09-01' }
    ]
  }));

  assert.deepEqual(api.listActive(storage, new Date('2026-08-21T10:00:00')).map((offer) => offer.id), ['ongoing', 'current']);
});

test('uses uploaded art when present and an automatic visual when absent', () => {
  const api = requirePromotions();
  const withImage = api.presentation(api.normalize({
    title: 'Photo Offer', value: '10% OFF', eligibility: 'all', image: 'data:image/png;base64,AAAA'
  }));
  const automatic = api.presentation(api.normalize({
    title: 'Bring Friends', value: '15% OFF', eligibility: 'group'
  }));

  assert.deepEqual(withImage, { image: 'data:image/png;base64,AAAA', icon: '', theme: 'image' });
  assert.deepEqual(automatic, { image: '', icon: '👥', theme: 'group' });
});

test('accepts only supported images within the prototype storage limit', () => {
  const api = requirePromotions();

  assert.deepEqual(api.validateImage({ type: 'image/jpeg', size: 450000 }), { ok: true, error: '' });
  assert.deepEqual(api.validateImage({ type: 'application/pdf', size: 2000 }), { ok: false, error: 'type' });
  assert.deepEqual(api.validateImage({ type: 'image/png', size: api.MAX_IMAGE_BYTES + 1 }), { ok: false, error: 'size' });
});

test('reports a failed promotion write when browser storage is full', () => {
  const api = requirePromotions();
  const storage = {
    getItem() { return JSON.stringify({ version: 1, offers: [] }); },
    setItem() { throw new Error('QuotaExceededError'); }
  };

  assert.equal(api.upsert({ title: 'Large image offer', value: '10% OFF', status: 'active' }, storage), null);
});
