(function (root, factory) {
  'use strict';

  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NEXORA_SALON_DATA = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SALON_ID = 'bitcoin-nail-bar-houston';
  var STORAGE_KEY = 'nexora:salon-data:v1:' + SALON_ID;
  var MENU_SERVICE_SOURCE = 'html/menu/menu.json';
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
    categories: [
      { id: 'pedicure', name: 'Pedicure', kind: 'service', active: true },
      { id: 'manicure', name: 'Manicure', kind: 'service', active: true },
      { id: 'acrylic', name: 'Acrylic', kind: 'service', active: true },
      { id: 'dipping-nail', name: 'Dipping Nail', kind: 'service', active: true },
      { id: 'gel-service', name: 'Gel Service', kind: 'service', active: true },
      { id: 'waxing', name: 'Waxing', kind: 'service', active: true },
      { id: 'add-on-extra', name: 'Add-on & Extra', kind: 'add-on', active: true },
      { id: 'kids-menu', name: "Kid's Menu", kind: 'service', active: true },
      { id: 'eyelash', name: 'Eyelash', kind: 'service', active: true },
    ],
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

  function slug(value) {
    return asString(value, 'category')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'category';
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
    var price = service.price == null || service.price === '' ? null : Number(service.price);
    return {
      id: asString(service.id, 'service-' + Date.now()),
      name: asString(service.name, asString(service.id, 'Service')),
      aliases: uniqueStrings(service.aliases),
      price: Number.isFinite(price) ? price : null,
      durationMin: Number.isFinite(duration) && duration > 0 ? duration : 60,
      requiredSkill: asString(service.requiredSkill),
      icon: asString(service.icon, '✨'),
      active: service.active !== false,
      categoryId: asString(service.categoryId),
      categoryName: asString(service.categoryName),
      kind: asString(service.kind),
      priceLabel: asString(service.priceLabel),
      description: asString(service.description),
      includes: uniqueStrings(service.includes),
      type: asString(service.type),
      source: asString(service.source),
    };
  }

  function serviceCategoryName(service) {
    return asString(service && service.categoryName, asString(service && service.requiredSkill, 'Other services'));
  }

  function categoryKey(value) {
    return asString(value).toLowerCase();
  }

  function normalizeCategories(categories, services) {
    var seenIds = {};
    var seenNames = {};
    var result = [];

    function addCategory(category, index) {
      category = category || {};
      var name = asString(category.name || category.title, 'Other services');
      var baseId = asString(category.id, slug(name) + '-' + index);
      var id = baseId;
      var suffix = 1;
      while (seenIds[id]) id = baseId + '-' + suffix++;
      var key = categoryKey(name);
      if (seenNames[key]) return;
      seenIds[id] = true;
      seenNames[key] = true;
      result.push({
        id: id,
        name: name,
        kind: asString(category.kind, 'service'),
        active: category.active !== false,
        source: asString(category.source),
      });
    }

    (Array.isArray(categories) ? categories : []).forEach(addCategory);
    (Array.isArray(services) ? services : []).forEach(function (service, index) {
      var name = serviceCategoryName(service);
      if (!seenNames[categoryKey(name)]) {
        addCategory({
          id: asString(service && service.categoryId, slug(name)),
          name: name,
          kind: service && service.type === 'add-on' ? 'add-on' : 'service',
          active: true,
          source: service && service.source
        }, result.length + index);
      }
    });
    return result;
  }

  function normalizeTechnician(technician) {
    technician = technician || {};
    return {
      id: asString(technician.id, 'tech-' + Date.now()),
      name: asString(technician.name, 'New technician'),
      aliases: uniqueStrings(technician.aliases),
      active: technician.active !== false,
      phone: asString(technician.phone),
      email: asString(technician.email),
      schedule: asString(technician.schedule),
      services: uniqueStrings(technician.services || technician.serviceNames || technician.skills),
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
    var services = uniqueById(
      Array.isArray(input.services) && input.services.length ? input.services : DEFAULT_CATALOG.services,
      normalizeService
    );
    var sourceCategories = Array.isArray(input.categories) && input.categories.length
      ? input.categories
      : DEFAULT_CATALOG.categories;
    return {
      salon: {
        id: SALON_ID,
        name: asString(salon.name, DEFAULT_CATALOG.salon.name),
        location: asString(salon.location, DEFAULT_CATALOG.salon.location),
      },
      categories: normalizeCategories(sourceCategories, services),
      services: services,
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

  function requiredSkillFromMenuService(service) {
    var explicit = asString(service && service.requiredSkill);
    if (explicit) return explicit;
    var text = asString(service && service.categoryName, asString(service && service.name)).toLowerCase();
    if (/pedicure/.test(text)) return 'Pedicure';
    if (/manicure/.test(text)) return 'Manicure';
    if (/acrylic|full set|fill-in|fill in/.test(text)) return 'Acrylic';
    if (/dipping|dip powder|dip\b/.test(text)) return 'Dip';
    if (/gel|shellac|builder/.test(text)) return 'Gel';
    if (/wax/.test(text)) return 'Waxing';
    if (/design|chrome|art|add-on|additional/.test(text)) return 'Design';
    return '';
  }

  function salonServiceFromMenuService(service) {
    service = service || {};
    return normalizeService({
      id: service.id,
      name: service.name,
      aliases: service.aliases,
      price: service.price,
      durationMin: service.durationMin,
      requiredSkill: requiredSkillFromMenuService(service),
      icon: service.icon,
      active: service.active !== false,
      categoryId: service.categoryId,
      categoryName: service.categoryName,
      kind: service.kind,
      priceLabel: service.priceLabel,
      description: service.description,
      includes: service.includes,
      type: service.type,
      source: MENU_SERVICE_SOURCE
    });
  }

  function salonCategoryFromMenuCategory(category) {
    category = category || {};
    return {
      id: category.id,
      name: category.name,
      kind: category.kind,
      active: true,
      source: MENU_SERVICE_SOURCE
    };
  }

  function catalogUsesMenuServices(catalog) {
    return !!((catalog && catalog.services) || []).some(function (service) {
      return service && service.source === MENU_SERVICE_SOURCE;
    });
  }

  function seedServicesFromMenuCatalog(catalog, serviceCatalog, options) {
    var normalized = normalizeCatalog(catalog);
    var menuServices = (serviceCatalog && Array.isArray(serviceCatalog.services)) ? serviceCatalog.services : [];
    if (!menuServices.length) return { catalog: cloneCatalog(normalized), seeded: false };
    if (!(options && options.force) && catalogUsesMenuServices(normalized)) {
      return { catalog: cloneCatalog(normalized), seeded: false };
    }
    return {
      catalog: normalizeCatalog(Object.assign({}, normalized, {
        categories: (Array.isArray(serviceCatalog.categories) ? serviceCatalog.categories : []).map(salonCategoryFromMenuCategory),
        services: menuServices.map(salonServiceFromMenuService)
      })),
      seeded: true
    };
  }

  function resolveStorage(storage) {
    if (storage) return storage;
    try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (error) { return null; }
  }

  function loadCatalog(storage) {
    var target = resolveStorage(storage);
    if (!target) return cloneCatalog(normalizeCatalog(DEFAULT_CATALOG));
    try {
      var raw = target.getItem(STORAGE_KEY);
      return raw ? normalizeCatalog(JSON.parse(raw)) : cloneCatalog(normalizeCatalog(DEFAULT_CATALOG));
    } catch (error) {
      return cloneCatalog(normalizeCatalog(DEFAULT_CATALOG));
    }
  }

  function storageAvailable(storage) {
    var target = storage;
    if (!target) {
      try { target = typeof localStorage !== 'undefined' ? localStorage : null; } catch (error) { return false; }
    }
    if (!target) return false;
    try {
      target.getItem(STORAGE_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  function saveCatalog(catalog, storage) {
    var normalized = normalizeCatalog(catalog);
    var target = resolveStorage(storage);
    try {
      if (target) target.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      // Keep the normalized in-memory result usable when browser storage is blocked.
    }
    return cloneCatalog(normalized);
  }

  return {
    SALON_ID: SALON_ID,
    STORAGE_KEY: STORAGE_KEY,
    MENU_SERVICE_SOURCE: MENU_SERVICE_SOURCE,
    DEFAULT_CATALOG: cloneCatalog(DEFAULT_CATALOG),
    cloneCatalog: cloneCatalog,
    normalizeCatalog: normalizeCatalog,
    catalogUsesMenuServices: catalogUsesMenuServices,
    seedServicesFromMenuCatalog: seedServicesFromMenuCatalog,
    findService: findService,
    findTechnician: findTechnician,
    loadCatalog: loadCatalog,
    saveCatalog: saveCatalog,
    storageAvailable: storageAvailable,
  };
});
