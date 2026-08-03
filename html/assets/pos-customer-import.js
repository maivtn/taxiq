(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) {
    root.NEXORA_CUSTOMER_IMPORT = api;
    root.NexoraCustomerImport = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var ALIASES = {
    name: ['name', 'customer', 'customer name', 'full name', 'guest', 'guest name', 'ten khach'],
    phone: ['phone', 'mobile', 'phone number', 'telephone', 'tel', 'so dien thoai', 'sdt'],
    email: ['email', 'email address'],
    birthday: ['birthday', 'birth date', 'date of birth', 'dob'],
    address: ['address', 'street address'],
    type: ['type', 'customer type', 'loai khach'],
    status: ['status', 'active status'],
    segment: ['group', 'segment', 'customer group', 'status group', 'nhom khach'],
    source: ['source', 'lead source', 'import source'],
    visits: ['visits', 'visit count', 'total visits'],
    spent: ['spent', 'lifetime', 'lifetime spend', 'lifetime value', 'total spent', 'amount'],
    tags: ['tags', 'preferences', 'customer tags'],
    tech: ['regular tech', 'preferred tech', 'tech', 'technician', 'tho ruot'],
    staffNote: ['staff note', 'staff notes', 'note', 'notes', 'customer note']
  };

  function fold(value) {
    return String(value == null ? '' : value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function normalizeHeader(value) {
    return fold(value).replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function cleanCell(value) {
    return String(value == null ? '' : value).trim();
  }

  function guessDelimiter(text) {
    var firstLine = String(text || '').split(/\r?\n/)[0] || '';
    var tabs = (firstLine.match(/\t/g) || []).length;
    var commas = (firstLine.match(/,/g) || []).length;
    return tabs > commas ? '\t' : ',';
  }

  function parseDelimited(text, delimiter) {
    text = String(text || '').replace(/^\uFEFF/, '');
    delimiter = delimiter || guessDelimiter(text);
    var records = [];
    var row = [];
    var field = '';
    var inQuotes = false;
    for (var i = 0; i < text.length; i += 1) {
      var ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 1; } else { inQuotes = false; }
        } else {
          field += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        row.push(field);
        field = '';
      } else if (ch === '\n') {
        row.push(field);
        records.push(row);
        row = [];
        field = '';
      } else if (ch !== '\r') {
        field += ch;
      }
    }
    row.push(field);
    records.push(row);
    records = records.filter(function (record) {
      return record.some(function (cell) { return cleanCell(cell); });
    });
    if (!records.length) return [];
    var headers = records.shift().map(normalizeHeader);
    return records.map(function (record) {
      var out = {};
      headers.forEach(function (header, index) {
        if (header) out[header] = cleanCell(record[index]);
      });
      return out;
    });
  }

  function pick(row, aliases) {
    var wanted = aliases.map(normalizeHeader);
    var keys = Object.keys(row || {});
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (wanted.indexOf(normalizeHeader(key)) !== -1) return cleanCell(row[key]);
    }
    return '';
  }

  function moneyNumber(value) {
    var cleaned = cleanCell(value).replace(/[^0-9.-]/g, '');
    var n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  function integerNumber(value) {
    var n = parseInt(cleanCell(value).replace(/[^0-9-]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
  }

  function phoneDigits(value) {
    return cleanCell(value).replace(/\D/g, '');
  }

  function splitTags(value) {
    value = cleanCell(value);
    if (!value) return [];
    return value.split(/[;,|]/).map(cleanCell).filter(Boolean).filter(function (tag, index, all) {
      return all.map(fold).indexOf(fold(tag)) === index;
    });
  }

  function normalizeSource(value) {
    var src = fold(value);
    if (src.indexOf('qr') !== -1) return 'qr';
    if (src.indexOf('receipt') !== -1) return 'receipt';
    if (src.indexOf('call') !== -1 || src.indexOf('phone') !== -1) return 'call';
    if (src.indexOf('manual') !== -1 || src.indexOf('front desk') !== -1) return 'manual';
    return 'excel';
  }

  function normalizeStatus(value) {
    var status = fold(value);
    return status.indexOf('inactive') !== -1 || status.indexOf('disabled') !== -1 ? 'inactive' : 'active';
  }

  function normalizeType(value, segmentValue) {
    var type = fold(value || segmentValue);
    if (type.indexOf('vip') !== -1) return 'VIP';
    if (type.indexOf('business') !== -1) return 'Business';
    if (type.indexOf('partner') !== -1) return 'Partner';
    return 'Individual';
  }

  function normalizeSegment(value, type, visits) {
    var seg = fold(value);
    if (seg.indexOf('vip') !== -1 || type === 'VIP') return 'vip';
    if (seg.indexOf('return') !== -1 || seg.indexOf('repeat') !== -1 || seg === 'rtn') return 'rtn';
    if (seg.indexOf('new') !== -1) return 'new';
    return visits > 1 ? 'rtn' : 'new';
  }

  function techIdFromName(value, techs) {
    var target = fold(value);
    if (!target) return null;
    var match = (techs || []).find(function (tech) {
      return fold(tech.id) === target || fold(tech.name) === target;
    });
    return match ? match.id : null;
  }

  function normalizeRow(row, options) {
    options = options || {};
    var name = pick(row, ALIASES.name);
    if (!name) return { error: 'Missing name' };
    var visitsRaw = pick(row, ALIASES.visits);
    var spentRaw = pick(row, ALIASES.spent);
    var tagsRaw = pick(row, ALIASES.tags);
    var techRaw = pick(row, ALIASES.tech);
    var noteRaw = pick(row, ALIASES.staffNote);
    var segmentRaw = pick(row, ALIASES.segment);
    var typeRaw = pick(row, ALIASES.type);
    var sourceRaw = pick(row, ALIASES.source);
    var visits = visitsRaw ? integerNumber(visitsRaw) : 0;
    var type = normalizeType(typeRaw, segmentRaw);
    var customer = {
      name: name,
      phone: pick(row, ALIASES.phone),
      email: pick(row, ALIASES.email),
      birthday: pick(row, ALIASES.birthday),
      address: pick(row, ALIASES.address),
      type: type,
      status: normalizeStatus(pick(row, ALIASES.status)),
      seg: normalizeSegment(segmentRaw, type, visits),
      visits: visits,
      spent: spentRaw ? moneyNumber(spentRaw) : 0,
      tags: splitTags(tagsRaw),
      prefTech: techIdFromName(techRaw, options.techs),
      notes: { owner: '', staff: noteRaw, customer: '' },
      src: normalizeSource(sourceRaw)
    };
    return {
      customer: customer,
      provided: {
        phone: !!customer.phone,
        email: !!customer.email,
        birthday: !!customer.birthday,
        address: !!customer.address,
        type: !!typeRaw || !!segmentRaw,
        status: !!pick(row, ALIASES.status),
        seg: !!segmentRaw || !!typeRaw || !!visitsRaw,
        visits: !!visitsRaw,
        spent: !!spentRaw,
        tags: !!tagsRaw,
        prefTech: !!techRaw && !!customer.prefTech,
        staffNote: !!noteRaw,
        src: true
      }
    };
  }

  function mergeTags(existing, incoming) {
    var combined = (existing || []).concat(incoming || []);
    return combined.filter(Boolean).filter(function (tag, index, all) {
      return all.map(fold).indexOf(fold(tag)) === index;
    });
  }

  function findCustomerIndex(customers, imported) {
    var incomingPhone = phoneDigits(imported.phone);
    var incomingName = fold(imported.name);
    return customers.findIndex(function (customer) {
      var phoneHit = incomingPhone && phoneDigits(customer.phone) === incomingPhone;
      return phoneHit || fold(customer.name) === incomingName;
    });
  }

  function applyUpdate(existing, normalized) {
    var c = normalized.customer;
    var p = normalized.provided;
    existing.name = c.name || existing.name;
    if (p.phone) existing.phone = c.phone;
    if (p.email) existing.email = c.email;
    if (p.birthday) existing.birthday = c.birthday;
    if (p.address) existing.address = c.address;
    if (p.type) existing.type = c.type;
    if (p.status) existing.status = c.status;
    if (p.seg) existing.seg = c.seg;
    if (p.visits) existing.visits = c.visits;
    if (p.spent) existing.spent = c.spent;
    if (p.tags) existing.tags = mergeTags(existing.tags, c.tags);
    if (p.prefTech) existing.prefTech = c.prefTech;
    existing.notes = existing.notes || { owner: '', staff: '', customer: '' };
    if (p.staffNote) existing.notes.staff = c.notes.staff;
    if (p.src) existing.src = c.src;
  }

  function customerDefaults(customer) {
    return {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      birthday: customer.birthday,
      address: customer.address,
      type: customer.type,
      status: customer.status,
      seg: customer.seg,
      visits: customer.visits,
      spent: customer.spent,
      tags: customer.tags,
      prefTech: customer.prefTech,
      notes: customer.notes,
      src: customer.src
    };
  }

  function mergeCustomers(customers, rows, options) {
    var result = { imported: 0, updated: 0, skipped: 0, errors: [] };
    (rows || []).forEach(function (row, index) {
      var normalized = normalizeRow(row, options);
      if (normalized.error) {
        result.skipped += 1;
        result.errors.push({ row: index + 2, message: normalized.error });
        return;
      }
      var existingIndex = findCustomerIndex(customers, normalized.customer);
      if (existingIndex === -1) {
        customers.push(customerDefaults(normalized.customer));
        result.imported += 1;
      } else {
        applyUpdate(customers[existingIndex], normalized);
        result.updated += 1;
      }
    });
    return result;
  }

  return {
    parseDelimited: parseDelimited,
    mergeCustomers: mergeCustomers,
    normalizeRow: normalizeRow,
    phoneDigits: phoneDigits
  };
});
