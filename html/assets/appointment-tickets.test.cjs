const test = require('node:test');
const assert = require('node:assert/strict');
const tickets = require('./appointment-tickets.js');

test('normalizes one ticket and keeps Anyone unassigned', () => {
  const result = tickets.normalizeTickets([{
    serviceId: 'svc-dip',
    serviceName: 'DIP POWDER',
    price: 52,
    durationMin: 60,
    technicianId: null,
    technicianName: 'Anyone',
  }]);

  assert.deepEqual(result[0], {
    id: 'ticket-1',
    serviceId: 'svc-dip',
    serviceName: 'DIP POWDER',
    price: 52,
    durationMin: 60,
    technicianId: null,
    technicianName: 'Anyone',
    status: 'confirmed',
  });
});

test('enriches missing ticket metadata from the supplied catalogs', () => {
  const result = tickets.normalizeTickets([{
    serviceId: 'svc-gel',
    technicianId: 'tech-lan',
  }], {
    services: [{ id: 'svc-gel', name: 'GEL MANICURE', price: 35, durationMin: 45 }],
    technicians: [{ id: 'tech-lan', name: 'Lan T.' }],
  });

  assert.equal(result[0].serviceName, 'GEL MANICURE');
  assert.equal(result[0].price, 35);
  assert.equal(result[0].durationMin, 45);
  assert.equal(result[0].technicianName, 'Lan T.');
});

test('calculates ticket totals and keeps duplicate service rows out of the picker contract', () => {
  const result = tickets.normalizeTickets([
    { serviceId: 'svc-a', serviceName: 'A', price: 12, durationMin: 30 },
    { serviceId: 'svc-b', serviceName: 'B', price: 50, durationMin: 90 },
  ]);

  assert.deepEqual(tickets.ticketTotals(result), { price: 62, duration: 120 });
  assert.equal(tickets.parentTechnicianId(result), null);
  assert.equal(tickets.parentTechnicianId([
    { technicianId: 'tech-a', technicianName: 'A' },
    { technicianId: 'tech-a', technicianName: 'A' },
  ]), 'tech-a');
});

test('schedules same-tech tickets sequentially and different-tech tickets in parallel', () => {
  const scheduled = tickets.scheduleTickets([
    { id: 'ticket-1', serviceName: 'A', durationMin: 60, technicianId: 'tech-a', technicianName: 'A' },
    { id: 'ticket-2', serviceName: 'B', durationMin: 30, technicianId: 'tech-b', technicianName: 'B' },
    { id: 'ticket-3', serviceName: 'C', durationMin: 45, technicianId: 'tech-a', technicianName: 'A' },
    { id: 'ticket-4', serviceName: 'D', durationMin: 15, durationMin: 15, technicianId: null, technicianName: 'Anyone' },
  ], '2026-07-28T10:00:00');

  assert.equal(scheduled[0].startAt, '2026-07-28T10:00:00');
  assert.equal(scheduled[0].endAt, '2026-07-28T11:00:00');
  assert.equal(scheduled[1].startAt, '2026-07-28T10:00:00');
  assert.equal(scheduled[1].endAt, '2026-07-28T10:30:00');
  assert.equal(scheduled[2].startAt, '2026-07-28T11:00:00');
  assert.equal(scheduled[2].endAt, '2026-07-28T11:45:00');
  assert.equal(scheduled[3].startAt, '2026-07-28T10:00:00');
  assert.equal(scheduled[3].endAt, '2026-07-28T10:15:00');
});
