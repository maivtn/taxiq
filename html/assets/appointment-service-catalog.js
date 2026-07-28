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

  function normalize(input) {
    input = input || {};
    var seenCategoryIds = {};
    var categories = (Array.isArray(input.categories) ? input.categories : []).map(function (category, categoryIndex) {
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
        var normalized = {
          id: id,
          name: name,
          categoryId: category.id,
          categoryName: category.name,
          price: service.price == null || service.price === '' ? null : finiteNumber(service.price, null),
          durationMin: finiteNumber(service.durationMin, 60),
          requiredSkill: asString(service.requiredSkill),
          icon: asString(service.icon, '✨')
        };
        if (!(normalized.durationMin > 0)) normalized.durationMin = 60;
        services.push(normalized);
        return normalized;
      });
    });

    return {
      source: input.source || {},
      categories: categories,
      services: services
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
