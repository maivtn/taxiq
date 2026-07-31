(function (root, factory) {
  'use strict';

  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NEXORA_APPOINTMENT_SERVICE_CATALOG = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function asString(value, fallback) {
    var result = value == null ? '' : String(value).trim();
    return result || (fallback || '');
  }

  function finiteNumber(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function slug(value) {
    return asString(value, 'service')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'service';
  }

  function priceFromLabel(value) {
    var match = asString(value).replace(/,/g, '').match(/\d+(?:\.\d+)?/);
    return match ? finiteNumber(match[0], null) : null;
  }

  function menuSectionsToCategories(sections) {
    return sections.filter(function (section) {
      return section && (section.kind === 'service' || section.kind === 'add-on');
    }).map(function (section) {
      section = section || {};
      return {
        id: section.id,
        name: section.title,
        kind: section.kind,
        services: (Array.isArray(section.items) ? section.items : []).map(function (item) {
          item = item || {};
          return {
            id: item.id,
            name: item.name,
            description: item.description,
            includes: item.includes,
            type: item.type,
            priceLabel: item.priceLabel,
            price: item.price == null ? priceFromLabel(item.priceLabel) : item.price,
            durationMin: item.durationMin == null ? item.durationMinutes : item.durationMin,
            requiredSkill: item.requiredSkill,
            icon: item.icon
          };
        })
      };
    });
  }

  function normalize(input) {
    input = input || {};
    var inputCategories = Array.isArray(input.categories)
      ? input.categories
      : (Array.isArray(input.sections) ? menuSectionsToCategories(input.sections) : []);
    var seenCategoryIds = {};
    var categories = inputCategories.map(function (category, categoryIndex) {
      category = category || {};
      var name = asString(category.name, 'Other services');
      var baseId = asString(category.id, 'category-' + slug(name) + '-' + categoryIndex);
      var id = baseId;
      var suffix = 1;
      while (seenCategoryIds[id]) id = baseId + '-' + suffix++;
      seenCategoryIds[id] = true;
      return {
        id: id,
        name: name,
        kind: asString(category.kind),
        services: Array.isArray(category.services) ? category.services : []
      };
    });
    var seenServiceIds = {};
    var services = [];

    categories.forEach(function (category) {
      category.services = category.services.map(function (service, serviceIndex) {
        service = service || {};
        var name = asString(service.name, 'Unnamed service');
        var baseId = asString(service.id, category.id + '-' + slug(name) + '-' + serviceIndex);
        var id = baseId;
        var suffix = 1;
        while (seenServiceIds[id]) id = baseId + '-' + suffix++;
        seenServiceIds[id] = true;
        var priceLabel = asString(service.priceLabel);
        if (!priceLabel && typeof service.price === 'string') priceLabel = asString(service.price);
        var numericPrice = service.price == null || service.price === ''
          ? priceFromLabel(priceLabel)
          : finiteNumber(service.price, priceFromLabel(service.price));
        var durationMin = service.durationMin == null || service.durationMin === ''
          ? null
          : finiteNumber(service.durationMin, null);
        var normalized = {
          id: id,
          name: name,
          categoryId: category.id,
          categoryName: category.name,
          description: asString(service.description),
          includes: Array.isArray(service.includes) ? service.includes.map(function (entry) {
            return asString(entry);
          }).filter(Boolean) : [],
          type: asString(service.type),
          priceLabel: priceLabel,
          price: numericPrice,
          durationMin: durationMin,
          requiredSkill: asString(service.requiredSkill),
          icon: asString(service.icon, '✨')
        };
        if (!(normalized.durationMin > 0)) normalized.durationMin = null;
        services.push(normalized);
        return normalized;
      });
    });

    return {
      source: input.source || {},
      categories: categories,
      services: services,
      notes: Array.isArray(input.notes) ? input.notes.map(function (entry) {
        return asString(entry);
      }).filter(Boolean) : []
    };
  }

  function load(url, fetchImpl) {
    var request = fetchImpl;
    if (!request && typeof fetch === 'function') request = fetch;
    if (typeof request !== 'function') return Promise.reject(new Error('Fetch is not available.'));
    return Promise.resolve(request(url)).then(function (response) {
      if (!response || response.ok === false) throw new Error('Unable to load appointment service catalog.');
      return response.json();
    }).then(normalize);
  }

  return {
    normalize: normalize,
    load: load
  };
});
