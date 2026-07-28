(function (root, factory) {
  'use strict';

  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NEXORA_APPOINTMENT_TICKETS = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var ANYONE = 'Anyone';

  function asString(value, fallback) {
    var result = value == null ? '' : String(value).trim();
    return result || (fallback || '');
  }

  function numberOr(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function positiveDuration(value) {
    var duration = numberOr(value, 60);
    return duration > 0 ? duration : 60;
  }

  function priceOrNull(value) {
    if (value == null || value === '') return null;
    var price = numberOr(value, null);
    return price == null ? null : price;
  }

  function listFrom(catalog, key) {
    if (!catalog || !catalog[key]) return [];
    if (Array.isArray(catalog[key])) return catalog[key];
    return Object.keys(catalog[key]).map(function (id) {
      var value = catalog[key][id] || {};
      return Object.assign({ id: id }, value);
    });
  }

  function findById(list, id) {
    id = asString(id);
    if (!id) return null;
    for (var index = 0; index < list.length; index += 1) {
      if (asString(list[index] && list[index].id) === id) return list[index];
    }
    return null;
  }

  function uniqueId(value, used, fallback) {
    var base = asString(value, fallback);
    var id = base;
    var suffix = 2;
    while (used[id]) id = base + '-' + suffix++;
    used[id] = true;
    return id;
  }

  function normalizeTickets(input, catalog) {
    var source = Array.isArray(input) ? input : (input && Array.isArray(input.tickets) ? input.tickets : []);
    var services = listFrom(catalog, 'services');
    var technicians = listFrom(catalog, 'technicians');
    var usedIds = {};

    return source.map(function (raw, index) {
      raw = raw || {};
      var service = findById(services, raw.serviceId);
      var technician = findById(technicians, raw.technicianId);
      var serviceId = asString(raw.serviceId, service && service.id);
      var technicianId = asString(raw.technicianId, technician && technician.id) || null;
      var result = {
        id: uniqueId(raw.id, usedIds, 'ticket-' + (index + 1)),
        serviceId: serviceId,
        serviceName: asString(raw.serviceName, service && service.name),
        price: priceOrNull(raw.price == null ? service && service.price : raw.price),
        durationMin: positiveDuration(raw.durationMin == null ? service && service.durationMin : raw.durationMin),
        technicianId: technicianId,
        technicianName: asString(raw.technicianName, technician && technician.name) || ANYONE,
        status: asString(raw.status, 'confirmed')
      };

      if (raw.startAt != null && raw.startAt !== '') result.startAt = String(raw.startAt);
      if (raw.endAt != null && raw.endAt !== '') result.endAt = String(raw.endAt);
      return result;
    });
  }

  function ticketTotals(input) {
    var tickets = normalizeTickets(input);
    return tickets.reduce(function (totals, ticket) {
      if (ticket.price != null) totals.price += ticket.price;
      totals.duration += ticket.durationMin;
      return totals;
    }, { price: 0, duration: 0 });
  }

  function parentTechnicianId(input) {
    var tickets = normalizeTickets(input);
    if (!tickets.length) return null;
    var id = tickets[0].technicianId || null;
    if (!id) return null;
    for (var index = 1; index < tickets.length; index += 1) {
      if ((tickets[index].technicianId || null) !== id) return null;
    }
    return id;
  }

  function parseDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return new Date(value.getTime());
    var text = asString(value);
    if (!text) return null;
    var date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function localDateTime(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  function scheduleTickets(input, startAt) {
    var tickets = normalizeTickets(input);
    var base = parseDate(startAt) || new Date();
    var laneCursors = {};

    return tickets.map(function (ticket) {
      var lane = ticket.technicianId || '__anyone__';
      var start = laneCursors[lane] ? new Date(laneCursors[lane].getTime()) : new Date(base.getTime());
      var end = new Date(start.getTime() + ticket.durationMin * 60000);
      laneCursors[lane] = end;
      ticket.startAt = localDateTime(start);
      ticket.endAt = localDateTime(end);
      return ticket;
    });
  }

  return {
    ANYONE: ANYONE,
    normalizeTickets: normalizeTickets,
    ticketTotals: ticketTotals,
    parentTechnicianId: parentTechnicianId,
    scheduleTickets: scheduleTickets
  };
});
