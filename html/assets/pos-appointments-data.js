(function (root, factory) {
  'use strict';

  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NEXORA_APPOINTMENTS_DATA = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SERVICES = {
    pedi: { icon: '🦶', label: 'Pedicure' },
    mani: { icon: '🤲', label: 'Manicure' },
    full: { icon: '✨', label: 'Acrylic — Full Set' },
    fill: { icon: '🔁', label: 'Acrylic — Fill-in' },
    dip: { icon: '🌸', label: 'Dipping Nail' },
    gel: { icon: '💅', label: 'Gel Service' },
    wax: { icon: '🕯️', label: 'Waxing' },
    addon: { icon: '🎨', label: 'Add-on & Extra' },
  };

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function formatLocalDateTime(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  function formatClock(date) {
    var hour = date.getHours();
    var suffix = hour >= 12 ? 'PM' : 'AM';
    var displayHour = hour % 12 || 12;
    return displayHour + ':' + pad(date.getMinutes()) + ' ' + suffix;
  }

  function relativeDay(offset) {
    if (offset === 0) return 'today';
    if (offset === 1) return 'tomorrow';
    return 'future';
  }

  function serviceLabel(serviceIds) {
    return serviceIds.map(function (id) {
      var service = SERVICES[id];
      return service ? service.icon + ' ' + service.label : id;
    }).join(' + ');
  }

  function createSeedBookings(anchorDate) {
    var anchor = new Date(anchorDate || Date.now());
    anchor.setHours(0, 0, 0, 0);

    var rows = [
      ['apt-2401', 0, 9, 0, 60, 'Sophia Martinez', '(832) 555-0124', 't5', ['mani', 'gel'], 'confirmed', 'Online'],
      ['apt-2402', 0, 10, 15, 75, 'Emily Torres', '(832) 555-0198', 't1', ['pedi'], 'checked-in', 'Front desk'],
      ['apt-2403', 0, 11, 30, 90, 'Linh Trần', '(832) 431-8827', 't3', ['full', 'addon'], 'confirmed', 'Mobile app'],
      ['apt-2404', 0, 13, 15, 60, 'Olivia Wilson', '(713) 555-0166', 't4', ['fill'], 'pending', 'Phone'],
      ['apt-2405', 0, 14, 30, 75, 'Mai Nguyễn', '(713) 552-0194', 't2', ['gel', 'addon'], 'confirmed', 'Online'],
      ['apt-2406', 0, 16, 0, 60, 'Hằng Phạm', '(281) 774-3358', null, ['pedi'], 'pending', 'Walk-in request'],
      ['apt-2407', 0, 17, 15, 45, 'Ava Thompson', '(346) 555-0140', 't1', ['dip'], 'confirmed', 'Online'],
      ['apt-2408', 1, 9, 30, 60, 'Sarah Johnson', '(713) 225-7809', 't3', ['full'], 'confirmed', 'Mobile app'],
      ['apt-2409', 1, 11, 0, 60, 'Jessica Kim', '(832) 906-4471', null, ['mani', 'gel'], 'pending', 'Online'],
      ['apt-2410', 1, 12, 45, 75, 'Isabella Moore', '(713) 555-0182', 't5', ['pedi'], 'confirmed', 'Phone'],
      ['apt-2411', 1, 15, 0, 90, 'Mia Anderson', '(832) 555-0119', 't2', ['full', 'addon'], 'confirmed', 'Online'],
      ['apt-2412', 2, 10, 0, 60, 'Charlotte Lee', '(281) 555-0173', 't1', ['pedi'], 'confirmed', 'Online'],
      ['apt-2413', 2, 13, 30, 45, 'Amelia Clark', '(713) 555-0154', 't4', ['wax'], 'confirmed', 'Mobile app'],
      ['apt-2414', 3, 11, 15, 75, 'Harper Lewis', '(346) 555-0105', 't3', ['dip', 'addon'], 'confirmed', 'Online'],
      ['apt-2415', 3, 16, 30, 60, 'Evelyn Hall', '(832) 555-0137', null, ['gel'], 'pending', 'Phone'],
      ['apt-2416', 4, 9, 45, 90, 'Abigail Young', '(281) 555-0191', 't2', ['full'], 'confirmed', 'Online'],
      ['apt-2417', 4, 14, 15, 60, 'Camila King', '(713) 555-0128', 't5', ['pedi'], 'confirmed', 'Mobile app'],
      ['apt-2418', 5, 12, 0, 75, 'Sofia Wright', '(832) 555-0178', 't1', ['mani', 'gel', 'addon'], 'confirmed', 'Online'],
    ];

    return rows.map(function (row) {
      var start = new Date(anchor);
      start.setDate(anchor.getDate() + row[1]);
      start.setHours(row[2], row[3], 0, 0);
      var end = new Date(start.getTime() + row[4] * 60000);
      return {
        id: row[0],
        name: row[5],
        phone: row[6],
        techId: row[7],
        serviceIds: row[8].slice(),
        svc: serviceLabel(row[8]),
        status: row[9],
        source: row[10],
        start: formatLocalDateTime(start),
        end: formatLocalDateTime(end),
        time: formatClock(start),
        day: relativeDay(row[1]),
        eta: row[0] === 'apt-2405' ? { st: 'otw', min: 18, at: Date.now(), share: true } : null,
      };
    });
  }

  function hasTechConflict(bookings, candidate, excludeId) {
    if (!candidate || !candidate.techId) return false;
    var candidateStart = new Date(candidate.start).getTime();
    var candidateEnd = new Date(candidate.end).getTime();
    if (!Number.isFinite(candidateStart) || !Number.isFinite(candidateEnd)) return false;

    return bookings.some(function (booking) {
      if (!booking || booking.techId !== candidate.techId) return false;
      if (excludeId != null && String(booking.id) === String(excludeId)) return false;
      var start = new Date(booking.start).getTime();
      var end = new Date(booking.end).getTime();
      return Number.isFinite(start) && Number.isFinite(end) && candidateStart < end && candidateEnd > start;
    });
  }

  function createMigrationSeed(anchorDate) {
    return createSeedBookings(anchorDate).map(function (booking) {
      return Object.assign({}, booking, { migrationSource: 'pos-seed-v1' });
    });
  }

  return {
    createSeedBookings: createSeedBookings,
    createMigrationSeed: createMigrationSeed,
    formatLocalDateTime: formatLocalDateTime,
    hasTechConflict: hasTechConflict,
  };
});
