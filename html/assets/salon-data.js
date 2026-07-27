(function (root, factory) {
  'use strict';

  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NEXORA_SALON_DATA = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SALON_ID = 'bitcoin-nail-bar-houston';
  var STORAGE_KEY = 'nexora:salon-data:v1:' + SALON_ID;
  var POS_PROFILE_DEFAULTS = {
    bnum: null,
    turns: 0,
    comm: 0,
    guar: 0,
    payModel: 'max',
    baoSplit: 0,
    vlink: null,
  };

  var DEFAULT_CATALOG = {
    salon: {
      id: SALON_ID,
      name: 'Bitcoin Nail Bar',
      location: 'Houston, TX',
    },
    services: [
      { id: 'pedi', name: 'Pedicure', aliases: ['Classic Pedicure', 'Pedicure Gel Polish'], price: 30, durationMin: 60, requiredSkill: 'Pedicure', icon: '🦶', active: true },
      { id: 'mani', name: 'Manicure', aliases: ['Classic Manicure'], price: 22, durationMin: 45, requiredSkill: 'Manicure', icon: '🤲', active: true },
      { id: 'full', name: 'Acrylic — Full Set', aliases: ['Full Set Acrylic', 'Full Set Acrylic French Tip', 'Gel Full Set Removal'], price: 45, durationMin: 90, requiredSkill: 'Acrylic', icon: '✨', active: true },
      { id: 'fill', name: 'Acrylic — Fill-in', aliases: ['Acrylic Fill-in'], price: 32, durationMin: 60, requiredSkill: 'Acrylic', icon: '🔁', active: true },
      { id: 'dip', name: 'Dipping Nail', aliases: ['Dip Powder', 'Dip Powder Chrome Design'], price: 40, durationMin: 75, requiredSkill: 'Dip', icon: '🌸', active: true },
      { id: 'gel', name: 'Gel Service', aliases: ['Gel Manicure', 'Gel Manicure Nail Art'], price: 35, durationMin: 60, requiredSkill: 'Gel', icon: '💅', active: true },
      { id: 'wax', name: 'Waxing', aliases: [], price: 25, durationMin: 30, requiredSkill: 'Waxing', icon: '🕯️', active: true },
      { id: 'addon', name: 'Add-on & Extra', aliases: ['Nail Art'], price: 5, durationMin: 30, requiredSkill: '', icon: '🎨', active: true },
      { id: 'kid', name: "Kid's Menu", aliases: [], price: null, durationMin: 60, requiredSkill: '', icon: '🧒', active: true },
      { id: 'eyelash', name: 'Eyelash', aliases: [], price: 45, durationMin: 60, requiredSkill: '', icon: '👁️', active: true },
    ],
    technicians: [
      { id: 't1', name: 'Tina', aliases: [], active: true, skills: ['Pedicure', 'Manicure', 'Gel', 'Dip', 'Acrylic', 'Design'], exp: ['Pedicure', 'Gel', 'Design'], fit: ['VIP'], posProfile: { bnum: 1, turns: 3, comm: 0.60, guar: 1000, payModel: 'max', baoSplit: 0.60, vlink: 'VL-20481' } },
      { id: 't2', name: 'Kim', aliases: ['Kim N.'], active: true, skills: ['Pedicure', 'Manicure', 'Gel', 'Design'], exp: ['Design'], fit: ['Prefers Female Tech'], posProfile: { bnum: 2, turns: 2, comm: 0.60, guar: 900, payModel: 'max', baoSplit: 0.60, vlink: null } },
      { id: 't3', name: 'Helen', aliases: [], active: true, skills: ['Pedicure', 'Manicure', 'Gel', 'Dip', 'Acrylic', 'Design', 'Waxing'], exp: ['Acrylic', 'Dip', 'Pedicure'], fit: ['VIP', 'Needs Extra Care'], posProfile: { bnum: 3, turns: 4, comm: 0.65, guar: 1100, payModel: 'max', baoSplit: 0.65, vlink: 'VL-33772' } },
      { id: 't4', name: 'Andy', aliases: [], active: true, skills: ['Pedicure', 'Acrylic', 'Waxing'], exp: ['Acrylic'], fit: [], posProfile: { bnum: 4, turns: 2, comm: 0.60, guar: 900, payModel: 'baoshare', baoSplit: 0.50, vlink: null } },
      { id: 't5', name: 'Vy', aliases: [], active: true, skills: ['Pedicure', 'Manicure', 'Gel'], exp: [], fit: ['New guest'], posProfile: { bnum: 5, turns: 1, comm: 0.55, guar: 800, payModel: 'max', baoSplit: 0.55, vlink: 'VL-90815' } },
      { id: 't6', name: 'Lan T.', aliases: [], active: true, skills: [], exp: [], fit: [], posProfile: {} },
      { id: 't7', name: 'Linda', aliases: [], active: true, skills: [], exp: [], fit: [], posProfile: {} },
      { id: 't8', name: 'Mai P.', aliases: [], active: true, skills: [], exp: [], fit: [], posProfile: {} },
    ],
  };

  function cloneCatalog(catalog) {
    return JSON.parse(JSON.stringify(catalog));
  }

  function asString(value, fallback) {
    var result = value == null ? '' : String(value).trim();
    return result || (fallback || '');
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

  function normalizeService(service) {
    service = service || {};
    var duration = Number(service.durationMin);
    return {
      id: asString(service.id, 'service-' + Date.now()),
      name: asString(service.name, asString(service.id, 'Service')),
      aliases: uniqueStrings(service.aliases),
      price: service.price == null || service.price === '' ? null : Number(service.price),
      durationMin: Number.isFinite(duration) && duration > 0 ? duration : 60,
      requiredSkill: asString(service.requiredSkill),
      icon: asString(service.icon, '✨'),
      active: service.active !== false,
    };
  }

  function normalizeTechnician(technician) {
    technician = technician || {};
    return {
      id: asString(technician.id, 'tech-' + Date.now()),
      name: asString(technician.name, 'New technician'),
      aliases: uniqueStrings(technician.aliases),
      active: technician.active !== false,
      skills: uniqueStrings(technician.skills),
      exp: uniqueStrings(technician.exp),
      fit: uniqueStrings(technician.fit),
      posProfile: Object.assign({}, POS_PROFILE_DEFAULTS, technician.posProfile || {}),
    };
  }

  function uniqueById(items, normalizer) {
    var seen = {};
    return (Array.isArray(items) ? items : []).map(normalizer).filter(function (item) {
      if (seen[item.id]) return false;
      seen[item.id] = true;
      return true;
    });
  }

  function normalizeCatalog(input) {
    input = input || {};
    var salon = input.salon || {};
    return {
      salon: {
        id: SALON_ID,
        name: asString(salon.name, DEFAULT_CATALOG.salon.name),
        location: asString(salon.location, DEFAULT_CATALOG.salon.location),
      },
      services: uniqueById(
        Array.isArray(input.services) && input.services.length ? input.services : DEFAULT_CATALOG.services,
        normalizeService
      ),
      technicians: uniqueById(
        Array.isArray(input.technicians) && input.technicians.length ? input.technicians : DEFAULT_CATALOG.technicians,
        normalizeTechnician
      ),
    };
  }

  function findByValue(items, value) {
    var query = String(value == null ? '' : value).trim().toLowerCase();
    if (!query) return null;
    return items.find(function (item) {
      return item.id.toLowerCase() === query ||
        item.name.toLowerCase() === query ||
        item.aliases.some(function (alias) { return alias.toLowerCase() === query; });
    }) || null;
  }

  function findService(catalog, value) {
    return findByValue((catalog && catalog.services) || [], value);
  }

  function findTechnician(catalog, value) {
    return findByValue((catalog && catalog.technicians) || [], value);
  }

  function loadCatalog(storage) {
    var target = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!target) return cloneCatalog(normalizeCatalog(DEFAULT_CATALOG));
    try {
      var raw = target.getItem(STORAGE_KEY);
      return raw ? normalizeCatalog(JSON.parse(raw)) : cloneCatalog(normalizeCatalog(DEFAULT_CATALOG));
    } catch (error) {
      return cloneCatalog(normalizeCatalog(DEFAULT_CATALOG));
    }
  }

  function saveCatalog(catalog, storage) {
    var normalized = normalizeCatalog(catalog);
    var target = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (target) target.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return cloneCatalog(normalized);
  }

  return {
    SALON_ID: SALON_ID,
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_CATALOG: cloneCatalog(DEFAULT_CATALOG),
    cloneCatalog: cloneCatalog,
    normalizeCatalog: normalizeCatalog,
    findService: findService,
    findTechnician: findTechnician,
    loadCatalog: loadCatalog,
    saveCatalog: saveCatalog,
  };
});
