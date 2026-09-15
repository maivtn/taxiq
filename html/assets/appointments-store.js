(function (root, factory) {
  'use strict';

  var salonData = root && root.NEXORA_SALON_DATA;
  if (!salonData && typeof require === 'function') {
    try { salonData = require('./salon-data.js'); } catch (error) { salonData = null; }
  }

  var ticketUtils = root && root.NEXORA_APPOINTMENT_TICKETS;
  if (!ticketUtils && typeof require === 'function') {
    try { ticketUtils = require('./appointment-tickets.js'); } catch (error) { ticketUtils = null; }
  }

  var api = factory(salonData, ticketUtils);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NEXORA_APPOINTMENTS_STORE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (salonData, ticketUtils) {
  'use strict';

  var SALON_ID = salonData && salonData.SALON_ID ? salonData.SALON_ID : 'bitcoin-nail-bar-houston';
  var STORAGE_KEY = 'nexora:appointments:v1:' + SALON_ID;
  var MEMORY_STATES = {};
  var SUBSCRIBERS = [];
  var VALID_STATUSES = ['pending', 'confirmed', 'checked-in', 'completed', 'no-show', 'cancelled'];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function formatLocalDateTime(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  function normalizeDateTime(value) {
    if (value instanceof Date && Number.isFinite(value.getTime())) return formatLocalDateTime(value);
    var raw = String(value == null ? '' : value).trim();
    if (!raw) return '';
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) return raw.length >= 19 ? raw.slice(0, 19) : raw + ':00';
    var date = new Date(raw);
    return Number.isFinite(date.getTime()) ? formatLocalDateTime(date) : '';
  }

  function dateFromLocal(value) {
    var normalized = normalizeDateTime(value);
    var date = normalized ? new Date(normalized) : new Date(NaN);
    return { value: normalized, date: date, time: date.getTime() };
  }

  function uniqueStrings(values) {
    var seen = {};
    return (Array.isArray(values) ? values : []).map(function (value) {
      return String(value == null ? '' : value).trim();
    }).filter(function (value) {
      if (!value) return false;
      var key = value.toLowerCase();
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function catalogFor(catalog) {
    if (catalog) return catalog;
    if (salonData && typeof salonData.loadCatalog === 'function') return salonData.loadCatalog();
    return { salon: { id: SALON_ID }, services: [], technicians: [] };
  }

  function findService(catalog, value) {
    return salonData && typeof salonData.findService === 'function'
      ? salonData.findService(catalogFor(catalog), value)
      : null;
  }

  function findTechnician(catalog, value) {
    return salonData && typeof salonData.findTechnician === 'function'
      ? salonData.findTechnician(catalogFor(catalog), value)
      : null;
  }

  function stripServiceIcon(value) {
    return String(value == null ? '' : value).replace(/^\s*[^\wÀ-ỹ]+/i, '').trim();
  }

  function splitServiceLabels(value) {
    if (Array.isArray(value)) return value;
    return String(value == null ? '' : value).split(/\s+\+\s+/).map(stripServiceIcon).filter(Boolean);
  }

  function serviceParts(input) {
    var catalog = catalogFor(input.catalog);
    var explicitIds = uniqueStrings(input.serviceIds || []);
    var sourceNames = input.serviceNames;
    if (!Array.isArray(sourceNames)) {
      if (Array.isArray(input.tickets)) {
        sourceNames = input.tickets.map(function (ticket) {
          return ticket && typeof ticket === 'object' ? (ticket.serviceName || ticket.name || ticket.serviceId) : ticket;
        });
      } else if (Array.isArray(input.services)) {
        sourceNames = input.services.map(function (service) {
          return service && typeof service === 'object' ? (service.name || service.label || service.id) : service;
        });
      } else if (Array.isArray(input.serviceDetails)) {
        sourceNames = input.serviceDetails.map(function (service) {
          return service && typeof service === 'object' ? (service.name || service.label || service.id) : service;
        });
      } else {
        sourceNames = splitServiceLabels(input.svc || input.service);
      }
    }
    sourceNames = uniqueStrings(sourceNames.map(stripServiceIcon));

    if (Array.isArray(input.tickets)) {
      input.tickets.forEach(function (ticket) {
        var ticketId = ticket && typeof ticket === 'object' ? ticket.serviceId : '';
        if (ticketId && findService(catalog, ticketId) && explicitIds.indexOf(String(ticketId)) === -1) {
          explicitIds.push(String(ticketId));
        }
      });
    }

    var ids = explicitIds.filter(function (id) { return !!findService(catalog, id); });
    sourceNames.forEach(function (name) {
      var service = findService(catalog, name);
      if (service && ids.indexOf(service.id) === -1) ids.push(service.id);
    });

    var names = sourceNames.slice();
    if (!names.length) {
      names = ids.map(function (id) {
        var service = findService(catalog, id);
        return service ? service.name : id;
      });
    }

    return { ids: uniqueStrings(ids), names: uniqueStrings(names) };
  }

  function serviceDetailsPart(input, catalog, parts) {
    var supplied = Array.isArray(input.serviceDetails) ? input.serviceDetails : [];
    return parts.names.map(function (name) {
      var service = findService(catalog, name);
      var suppliedDetail = supplied.find(function (detail) {
        if (!detail || typeof detail !== 'object') return false;
        return stripServiceIcon(detail.name || detail.label || '').toLowerCase() === String(name).trim().toLowerCase() ||
          (service && String(detail.id || '').trim() === String(service.id));
      });
      var id = service ? service.id : (suppliedDetail && suppliedDetail.id ? String(suppliedDetail.id) : '');
      var priceValue = suppliedDetail && suppliedDetail.price != null ? suppliedDetail.price : service && service.price;
      var durationValue = suppliedDetail && suppliedDetail.durationMin != null ? suppliedDetail.durationMin : service && service.durationMin;
      var price = priceValue == null || priceValue === '' || !Number.isFinite(Number(priceValue)) ? null : Number(priceValue);
      var durationMin = durationValue == null || durationValue === '' || !Number.isFinite(Number(durationValue)) ? null : Number(durationValue);
      return {
        id: id,
        name: service ? service.name : String(name),
        price: price,
        durationMin: durationMin,
        icon: service ? service.icon : (suppliedDetail && suppliedDetail.icon ? String(suppliedDetail.icon) : '✨'),
      };
    });
  }

  function technicianPart(input, catalog) {
    var hasExplicitTechnicianId = Object.prototype.hasOwnProperty.call(input, 'technicianId') && input.technicianId !== undefined;
    var raw = hasExplicitTechnicianId ? input.technicianId : (input.techId || input.technicianName || input.tech || '');
    if (!raw || String(raw).toLowerCase() === 'unassigned' || String(raw).toLowerCase() === 'anyone') {
      return { id: null, name: '' };
    }
    var technician = findTechnician(catalog, raw);
    return technician
      ? { id: technician.id, name: technician.name }
      : { id: null, name: String(raw).trim() };
  }

  function mapBookingStatus(status) {
    if (status === 'sms-sent') return { status: 'pending', smsStatus: 'sent' };
    if (status === 'done') return { status: 'completed', smsStatus: 'not-sent' };
    if (status === 'noshow' || status === 'no-show') return { status: 'no-show', smsStatus: 'not-sent' };
    if (VALID_STATUSES.indexOf(status) >= 0) return { status: status, smsStatus: 'not-sent' };
    return { status: 'pending', smsStatus: 'not-sent' };
  }

  function mapCanonicalToBookingStatus(record) {
    if (record && record.status === 'completed') return 'done';
    if (record && record.status === 'no-show') return 'noshow';
    if (record && record.status === 'cancelled') return 'cancelled';
    if (record && record.smsStatus === 'sent') return 'sms-sent';
    return 'new';
  }

  function ticketCatalog(catalog) {
    return {
      services: catalog && Array.isArray(catalog.services) ? catalog.services : [],
      technicians: catalog && Array.isArray(catalog.technicians) ? catalog.technicians : [],
    };
  }

  function rawTicketsFor(input, catalog, parts, serviceDetails, technician) {
    if (Array.isArray(input.tickets)) {
      var hasExplicitTechnician = Object.prototype.hasOwnProperty.call(input, 'technicianId') && input.technicianId !== undefined;
      var ticketTechnicianIds = input.tickets.map(function (ticket) {
        return ticket && ticket.technicianId ? String(ticket.technicianId) : '';
      });
      var sharedTicketTechnician = ticketTechnicianIds.length && ticketTechnicianIds.every(function (id) {
        return id === ticketTechnicianIds[0];
      });
      if (hasExplicitTechnician && sharedTicketTechnician) {
        return input.tickets.map(function (ticket) {
          return Object.assign({}, ticket, {
            technicianId: technician.id,
            technicianName: technician.name || 'Anyone',
          });
        });
      }
      return input.tickets;
    }
    return parts.names.map(function (name, index) {
      var detail = serviceDetails[index] || {};
      return {
        id: 'ticket-' + (index + 1),
        serviceId: detail.id || parts.ids[index] || '',
        serviceName: detail.name || name,
        price: detail.price,
        durationMin: detail.durationMin,
        technicianId: technician.id,
        technicianName: technician.name || 'Anyone',
        status: input.status,
      };
    });
  }

  function normalizeTicketSet(input, catalog, parts, serviceDetails, technician, start) {
    if (!ticketUtils || typeof ticketUtils.normalizeTickets !== 'function') return [];
    var normalized = ticketUtils.normalizeTickets(
      rawTicketsFor(input, catalog, parts, serviceDetails, technician),
      ticketCatalog(catalog)
    );
    normalized.forEach(function (ticket) {
      if (ticket.startAt) ticket.startAt = normalizeDateTime(ticket.startAt);
      if (ticket.endAt) ticket.endAt = normalizeDateTime(ticket.endAt);
    });
    var hasCompleteTiming = normalized.length && normalized.every(function (ticket) {
      return ticket.startAt && ticket.endAt;
    });
    if (!hasCompleteTiming && start.value && typeof ticketUtils.scheduleTickets === 'function') {
      normalized = ticketUtils.scheduleTickets(normalized, start.value);
    }
    return normalized;
  }

  function serviceDetailsFromTickets(tickets, catalog, fallback) {
    if (!tickets.length) return fallback;
    return tickets.map(function (ticket) {
      var service = findService(catalog, ticket.serviceId) || findService(catalog, ticket.serviceName);
      return {
        id: ticket.serviceId || (service && service.id) || '',
        name: ticket.serviceName || (service && service.name) || '',
        price: ticket.price,
        durationMin: ticket.durationMin,
        icon: service ? service.icon : '✨',
      };
    });
  }

  function ticketSpan(tickets, start) {
    if (!tickets.length || !start.value) return 0;
    var latestEnd = start.time;
    tickets.forEach(function (ticket) {
      var end = dateFromLocal(ticket.endAt);
      if (end.time > latestEnd) latestEnd = end.time;
    });
    return latestEnd > start.time ? Math.round((latestEnd - start.time) / 60000) : 0;
  }

  function normalizeAppointment(input, catalog, now) {
    input = input || {};
    catalog = catalogFor(catalog);
    var parts = serviceParts(Object.assign({}, input, { catalog: catalog }));
    var serviceDetails = serviceDetailsPart(input, catalog, parts);
    var technician = technicianPart(input, catalog);
    var start = dateFromLocal(input.startAt || input.start || (input.date && input.time ? input.date + 'T' + input.time + ':00' : ''));
    var explicitDuration = Number(input.durationMin || input.duration);
    var end = dateFromLocal(input.endAt || input.end);
    if (!Number.isFinite(explicitDuration) || explicitDuration <= 0) {
      explicitDuration = end.time > start.time ? Math.round((end.time - start.time) / 60000) : 0;
    }
    if (!explicitDuration) {
      explicitDuration = serviceDetails.reduce(function (total, detail) {
        return total + (detail && Number(detail.durationMin) > 0 ? Number(detail.durationMin) : 0);
      }, 0) || 60;
    }
    if (!end.value && start.value) {
      var calculatedEnd = new Date(start.time + explicitDuration * 60000);
      end = dateFromLocal(calculatedEnd);
    }
    var tickets = normalizeTicketSet(input, catalog, parts, serviceDetails, technician, start);
    serviceDetails = serviceDetailsFromTickets(tickets, catalog, serviceDetails);
    var scheduledSpan = ticketSpan(tickets, start);
    if (scheduledSpan) {
      explicitDuration = scheduledSpan;
      if (!input.endAt && !input.end && start.value) {
        end = dateFromLocal(new Date(start.time + scheduledSpan * 60000));
      }
    }
    var ticketParentId = ticketUtils && typeof ticketUtils.parentTechnicianId === 'function'
      ? ticketUtils.parentTechnicianId(tickets)
      : null;
    if (Array.isArray(input.tickets)) {
      technician = ticketParentId ? {
        id: ticketParentId,
        name: tickets[0].technicianName || '',
      } : { id: null, name: '' };
    }
    var statusMapping = mapBookingStatus(input.status);
    var status = VALID_STATUSES.indexOf(input.status) >= 0 ? input.status : statusMapping.status;
    var smsStatus = input.smsStatus === 'sent' || statusMapping.smsStatus === 'sent' ? 'sent' : 'not-sent';
    var timestamp = now || new Date().toISOString();
    var metadata = Object.assign({}, input.metadata || {});
    if (input.eta && !metadata.eta) metadata.eta = clone(input.eta);

    return {
      id: String(input.id || 'apt-' + Date.now()),
      salonId: SALON_ID,
      customerName: String(input.customerName || input.name || 'Guest').trim(),
      phone: String(input.phone || '').trim(),
      email: String(input.email || '').trim(),
      serviceIds: parts.ids,
      serviceNames: parts.names,
      serviceDetails: serviceDetails,
      tickets: tickets,
      technicianId: technician.id,
      technicianName: technician.name,
      startAt: start.value,
      endAt: end.value,
      durationMin: explicitDuration,
      status: status,
      smsStatus: smsStatus,
      source: String(input.source || input.migrationSource || 'front-desk'),
      note: String(input.note || '').trim(),
      metadata: metadata,
      createdAt: String(input.createdAt || timestamp),
      updatedAt: String(input.updatedAt || timestamp),
    };
  }

  function validateRecord(record) {
    if (!record.phone) return { code: 'phone-required', field: 'phone', message: 'Enter the phone number.' };
    if (!record.startAt || !record.endAt) return { code: 'time-required', field: 'startAt', message: 'Pick a valid date and time.' };
    if (!Number.isFinite(new Date(record.startAt).getTime()) || !Number.isFinite(new Date(record.endAt).getTime())) {
      return { code: 'time-invalid', field: 'startAt', message: 'Pick a valid date and time.' };
    }
    if (new Date(record.endAt).getTime() <= new Date(record.startAt).getTime()) {
      return { code: 'time-order', field: 'endAt', message: 'The appointment must end after it starts.' };
    }
    return null;
  }

  function hasConflict(records, candidate, excludeId) {
    if (!candidate) return false;
    if (candidate.metadata && candidate.metadata.checkIn) return false;
    var candidateIntervals = Array.isArray(candidate.tickets) && candidate.tickets.length
      ? candidate.tickets.map(function (ticket) {
        return {
          technicianId: ticket && ticket.technicianId,
          start: new Date(ticket && ticket.startAt).getTime(),
          end: new Date(ticket && ticket.endAt).getTime(),
        };
      })
      : [{
        technicianId: candidate.technicianId,
        start: new Date(candidate.startAt || candidate.start).getTime(),
        end: new Date(candidate.endAt || candidate.end).getTime(),
      }];
    candidateIntervals = candidateIntervals.filter(function (interval) {
      return interval.technicianId && Number.isFinite(interval.start) && Number.isFinite(interval.end);
    });
    if (!candidateIntervals.length) return false;
    return records.some(function (record) {
      if (!record) return false;
      if (excludeId != null && String(record.id) === String(excludeId)) return false;
      if (record.status === 'cancelled') return false;
      if (record.metadata && record.metadata.checkIn) return false;
      var recordIntervals = Array.isArray(record.tickets) && record.tickets.length
        ? record.tickets.map(function (ticket) {
          return {
            technicianId: ticket && ticket.technicianId,
            start: new Date(ticket && ticket.startAt).getTime(),
            end: new Date(ticket && ticket.endAt).getTime(),
          };
        })
        : [{
          technicianId: record.technicianId,
          start: new Date(record.startAt || record.start).getTime(),
          end: new Date(record.endAt || record.end).getTime(),
        }];
      return candidateIntervals.some(function (candidateInterval) {
        return recordIntervals.some(function (recordInterval) {
          return recordInterval.technicianId === candidateInterval.technicianId &&
            Number.isFinite(recordInterval.start) && Number.isFinite(recordInterval.end) &&
            candidateInterval.start < recordInterval.end && candidateInterval.end > recordInterval.start;
        });
      });
    });
  }

  function storageFor(storage) {
    if (storage) return storage;
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch (error) {
      return null;
    }
  }

  function emptyState() {
    return { version: 1, sources: {}, records: [] };
  }

  function stateForKey(key, storage) {
    if (!MEMORY_STATES[key]) MEMORY_STATES[key] = emptyState();
    return MEMORY_STATES[key];
  }

  function readState(storage, catalog) {
    var target = storageFor(storage);
    if (!target) return clone(stateForKey(STORAGE_KEY, storage));
    try {
      var raw = target.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.records)) return emptyState();
      return {
        version: 1,
        sources: parsed.sources && typeof parsed.sources === 'object' ? parsed.sources : {},
        records: parsed.records.map(function (record) { return normalizeAppointment(record, catalog, record.updatedAt); }).filter(function (record) {
          return !!record.id;
        }),
      };
    } catch (error) {
      return emptyState();
    }
  }

  function writeState(state, storage) {
    var normalized = {
      version: 1,
      sources: Object.assign({}, state.sources || {}),
      records: state.records.map(function (record) { return clone(record); }),
    };
    var target = storageFor(storage);
    if (!target) {
      MEMORY_STATES[STORAGE_KEY] = normalized;
      return normalized;
    }
    try {
      target.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      MEMORY_STATES[STORAGE_KEY] = normalized;
    }
    return normalized;
  }

  function notifySubscribers() {
    SUBSCRIBERS.slice().forEach(function (subscriber) {
      try { subscriber.listener(); } catch (error) { setTimeout(function () { throw error; }, 0); }
    });
  }

  function loadAll(storage, catalog) {
    return readState(storage, catalog).records.map(clone);
  }

  function ensureSource(sourceKey, records, storage, catalog, now) {
    var state = readState(storage, catalog);
    var existingIds = {};
    state.records.forEach(function (record) { existingIds[String(record.id)] = true; });
    var inserted = 0;
    var skipped = 0;
    (Array.isArray(records) ? records : []).forEach(function (input) {
      var record = normalizeAppointment(input, catalog, now);
      if (!record.id || existingIds[record.id]) {
        skipped += 1;
        return;
      }
      record.source = record.source || sourceKey;
      state.records.push(record);
      existingIds[record.id] = true;
      inserted += 1;
    });
    var markerChanged = state.sources[sourceKey] !== true;
    state.sources[sourceKey] = true;
    if (inserted || markerChanged) {
      writeState(state, storage);
      if (inserted) notifySubscribers();
    }
    return { inserted: inserted, skipped: skipped, records: loadAll(storage, catalog) };
  }

  function findRecordIndex(records, id) {
    return records.findIndex(function (record) { return String(record.id) === String(id); });
  }

  function writeMutation(state, storage, result) {
    writeState(state, storage);
    notifySubscribers();
    return { ok: true, record: clone(result) };
  }

  function create(input, storage, catalog, now) {
    var state = readState(storage, catalog);
    var createInput = Object.assign({}, input || {});
    if (!createInput.startAt && !createInput.start && !(createInput.date && createInput.time)) {
      createInput.startAt = new Date(now || Date.now());
    }
    var record = normalizeAppointment(createInput, catalog, now);
    if (findRecordIndex(state.records, record.id) >= 0) {
      return { ok: false, error: { code: 'duplicate-id', field: 'id', message: 'An appointment with this ID already exists.' } };
    }
    var validation = validateRecord(record);
    if (validation) return { ok: false, error: validation };
    if (hasConflict(state.records, record, null)) {
      return { ok: false, error: { code: 'technician-conflict', field: 'technicianId', message: 'Technician already has an overlapping appointment.' } };
    }
    state.records.push(record);
    return writeMutation(state, storage, record);
  }

  function checkInPhone(value) {
    var digits = String(value == null ? '' : value).replace(/\D/g, '');
    if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1);
    return digits.length === 10 ? digits : '';
  }

  function checkIn(input, storage, catalog, now) {
    input = input || {};
    function error(code, field, message) {
      return { ok: false, error: { code: code, field: field, message: message } };
    }
    var sessionId = String(input.id || '').trim();
    if (!sessionId) return error('checkin-id-required', 'id', 'Start a new check-in and try again.');
    var target = storageFor(storage);
    if (!target) return error('storage-unavailable', 'storage', 'Browser storage is unavailable. Enable local storage and try again.');
    var state;
    try {
      var raw = target.getItem(STORAGE_KEY);
      state = raw == null ? emptyState() : JSON.parse(raw);
      if (!state || state.version !== 1 || !Array.isArray(state.records) ||
          !state.records.every(function (record) { return record && typeof record === 'object' && String(record.id || '').trim(); })) {
        return error('storage-invalid', 'storage', 'Saved appointments cannot be read. Restore the saved data before checking in.');
      }
    } catch (readError) {
      return error('storage-unavailable', 'storage', 'Saved appointments cannot be read. Check browser storage and try again.');
    }
    var existing = state.records.filter(function (record) {
      return record.metadata && record.metadata.checkIn && record.metadata.checkIn.id === sessionId;
    });
    if (existing.length) return { ok: true, records: clone(existing), replayed: true };

    var mode = input.mode;
    var contact = {
      name: String(input.contact && input.contact.name || '').trim(),
      phone: checkInPhone(input.contact && input.contact.phone),
    };
    if (!contact.name) return error('name-required', 'contact.name', 'Enter the main guest name.');
    if (!contact.phone) return error('phone-invalid', 'contact.phone', 'Enter a valid 10-digit phone number.');
    var members = input.members;
    if ((mode !== 'single' && mode !== 'family') || !Array.isArray(members) ||
        (mode === 'single' ? members.length !== 1 : members.length < 1)) {
      return error('members-invalid', 'members', 'Add at least one guest to check in.');
    }
    var date = new Date(now == null ? Date.now() : now);
    if (!Number.isFinite(date.getTime())) return error('time-invalid', 'startAt', 'The check-in time is invalid. Try again.');
    var timestamp = date.toISOString();
    catalog = catalogFor(catalog);
    var appointment = null;
    if (input.appointmentId) {
      appointment = state.records.find(function (record) { return String(record.id) === String(input.appointmentId); });
      if (!appointment || ['pending', 'confirmed'].indexOf(appointment.status) < 0 || checkInPhone(appointment.phone) !== contact.phone) {
        return error('appointment-unavailable', 'appointmentId', 'This appointment changed or no longer matches the phone. Choose the appointment again.');
      }
    }
    var nextNumber = state.records.reduce(function (max, record) {
      var number = Number(record.metadata && record.metadata.checkIn && record.metadata.checkIn.ticketNumber);
      return Number.isSafeInteger(number) && number > max ? number : max;
    }, 9);
    nextNumber += state.records.filter(function (record) {
      return record.metadata && record.metadata.estimate && !record.metadata.checkIn;
    }).length;
    var usedMembers = Object.create(null);
    var records = [];
    for (var index = 0; index < members.length; index += 1) {
      var member = members[index] || {};
      var memberId = String(member.id || '').trim();
      if (!memberId || usedMembers[memberId] || !Array.isArray(member.tickets)) {
        return error('member-invalid', 'members', 'Each guest needs a unique check-in entry and a valid service selection.');
      }
      usedMembers[memberId] = true;
      var current = index === 0 ? appointment : null;
      var recordId = current ? current.id : 'checkin:' + encodeURIComponent(sessionId) + ':' + encodeURIComponent(memberId);
      if (!current && state.records.some(function (record) { return String(record.id) === recordId; })) {
        return error('duplicate-id', 'id', 'This check-in entry already exists. Start a new check-in.');
      }
      var tickets = [];
      for (var lineIndex = 0; lineIndex < member.tickets.length; lineIndex += 1) {
        var line = member.tickets[lineIndex] || {};
        var service = (catalog.services || []).find(function (item) { return item.id === line.serviceId && item.active !== false; });
        if (!service) return error('service-unavailable', 'members', 'A selected service is no longer available. Choose services again.');
        var technicianId = String(line.technicianId || '').trim();
        var technician = technicianId ? (catalog.technicians || []).find(function (item) { return item.id === technicianId && item.active !== false; }) : null;
        if (technicianId && !technician) return error('technician-unavailable', 'members', 'A selected technician is no longer available. Choose a technician again.');
        var bookedLine = current && Array.isArray(current.tickets) && current.tickets.find(function (savedLine) {
          return line.id && savedLine.id === line.id && savedLine.serviceId === service.id;
        });
        tickets.push({
          id: String(line.id || recordId + ':service:' + (lineIndex + 1)),
          serviceId: service.id, serviceName: service.name,
          price: bookedLine ? bookedLine.price : service.price,
          durationMin: bookedLine ? bookedLine.durationMin : service.durationMin,
          technicianId: technician ? technician.id : null, technicianName: technician ? technician.name : 'Anyone',
          status: 'checked-in',
        });
      }
      var metadata = Object.assign({}, current && current.metadata || {}, {
        checkedInAt: timestamp,
        checkIn: {
          id: sessionId, mode: mode, contact: clone(contact), memberId: memberId,
          relationship: String(member.relationship || (index === 0 ? 'self' : 'other')).trim(),
          ticketNumber: ++nextNumber, smsConsent: input.smsConsent === true,
        },
      });
      var candidate = normalizeAppointment(Object.assign({}, current || {}, {
        id: recordId, customerName: index === 0 ? contact.name : String(member.name || '').trim() || 'Guest ' + (index + 1),
        phone: contact.phone, tickets: tickets,
        serviceNames: tickets.map(function (ticket) { return ticket.serviceName; }),
        serviceIds: tickets.map(function (ticket) { return ticket.serviceId; }), serviceDetails: [],
        technicianId: undefined, technicianName: '', techId: undefined, tech: '',
        startAt: date, endAt: '', end: '', durationMin: undefined, duration: undefined,
        status: 'checked-in', source: 'front-desk', metadata: metadata,
        createdAt: current ? current.createdAt : timestamp, updatedAt: timestamp,
      }), catalog, timestamp);
      var validation = validateRecord(candidate);
      if (validation) return { ok: false, error: validation };
      records.push(candidate);
    }
    var nextRecords = state.records.filter(function (record) { return !appointment || record.id !== appointment.id; }).concat(records);
    try {
      target.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sources: Object.assign({}, state.sources || {}), records: nextRecords }));
    } catch (writeError) {
      return error('storage-write-failed', 'storage', 'Unable to save the check-in. Check browser storage and try again.');
    }
    notifySubscribers();
    return { ok: true, records: clone(records) };
  }

  function update(id, patch, storage, catalog, now) {
    var state = readState(storage, catalog);
    var index = findRecordIndex(state.records, id);
    if (index < 0) return { ok: false, error: { code: 'not-found', message: 'Appointment not found.' } };
    var current = state.records[index];
    var candidate = normalizeAppointment(Object.assign({}, current, patch, { id: current.id, createdAt: current.createdAt }), catalog, now);
    var validation = validateRecord(candidate);
    if (validation) return { ok: false, error: validation };
    if (hasConflict(state.records, candidate, id)) {
      return { ok: false, error: { code: 'technician-conflict', field: 'technicianId', message: 'Technician already has an overlapping appointment.' } };
    }
    candidate.updatedAt = now || new Date().toISOString();
    state.records[index] = candidate;
    return writeMutation(state, storage, candidate);
  }

  function upsert(input, storage, catalog, now) {
    var state = readState(storage, catalog);
    var candidate = normalizeAppointment(input, catalog, now);
    var index = findRecordIndex(state.records, candidate.id);
    if (index >= 0) {
      var existingTime = new Date(state.records[index].updatedAt).getTime();
      var candidateTime = new Date(candidate.updatedAt).getTime();
      if (Number.isFinite(existingTime) && Number.isFinite(candidateTime) && candidateTime < existingTime) {
        return { ok: true, record: clone(state.records[index]), skipped: true };
      }
      var validation = validateRecord(candidate);
      if (validation) return { ok: false, error: validation };
      if (hasConflict(state.records, candidate, candidate.id)) {
        return { ok: false, error: { code: 'technician-conflict', field: 'technicianId', message: 'Technician already has an overlapping appointment.' } };
      }
      state.records[index] = candidate;
      return writeMutation(state, storage, candidate);
    }
    var createValidation = validateRecord(candidate);
    if (createValidation) return { ok: false, error: createValidation };
    if (hasConflict(state.records, candidate, null)) {
      return { ok: false, error: { code: 'technician-conflict', field: 'technicianId', message: 'Technician already has an overlapping appointment.' } };
    }
    state.records.push(candidate);
    return writeMutation(state, storage, candidate);
  }

  function cancel(id, storage, catalog, now) {
    return update(id, { status: 'cancelled' }, storage, catalog, now);
  }

  function subscribe(listener, windowObject) {
    var targetWindow = windowObject || (typeof window !== 'undefined' ? window : null);
    var subscriber = { listener: listener, windowObject: targetWindow, handler: null };
    subscriber.handler = function (event) {
      if (!event || event.key === STORAGE_KEY) listener(event);
    };
    SUBSCRIBERS.push(subscriber);
    if (targetWindow && typeof targetWindow.addEventListener === 'function') {
      targetWindow.addEventListener('storage', subscriber.handler);
    }
    return function unsubscribe() {
      var index = SUBSCRIBERS.indexOf(subscriber);
      if (index >= 0) SUBSCRIBERS.splice(index, 1);
      if (targetWindow && typeof targetWindow.removeEventListener === 'function') {
        targetWindow.removeEventListener('storage', subscriber.handler);
      }
    };
  }

  return {
    SALON_ID: SALON_ID,
    STORAGE_KEY: STORAGE_KEY,
    normalizeAppointment: normalizeAppointment,
    mapBookingStatus: mapBookingStatus,
    mapCanonicalToBookingStatus: mapCanonicalToBookingStatus,
    loadAll: loadAll,
    ensureSource: ensureSource,
    create: create,
    checkIn: checkIn,
    update: update,
    upsert: upsert,
    cancel: cancel,
    hasConflict: hasConflict,
    subscribe: subscribe,
  };
});
