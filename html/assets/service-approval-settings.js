(function (root) {
  'use strict';
  var prefix = 'nexora:service-approval:v1:';
  function read(salonId) {
    try {
      var stored = JSON.parse(root.localStorage.getItem(prefix + salonId) || '[]');
      if (Array.isArray(stored)) return { requiredIds: stored };
      if (stored && Array.isArray(stored.requiredIds)) return stored;
    } catch (error) { /* New settings start with no approval required. */ }
    return { requiredIds: [] };
  }
  function write(salonId, settings) { root.localStorage.setItem(prefix + salonId, JSON.stringify(settings)); }
  function load(salonId) { return read(salonId).requiredIds.filter(function (id) { return typeof id === 'string'; }); }
  function save(salonId, ids) {
    var settings = read(salonId);
    settings.requiredIds = Array.from(new Set(ids));
    write(salonId, settings);
  }
  function loadCatalog(salonId, fallback) {
    var stored = read(salonId);
    var categories = Array.isArray(stored.categories) ? stored.categories : fallback;
    return JSON.parse(JSON.stringify(categories));
  }
  function saveCatalog(salonId, categories, approvals) {
    var stored = read(salonId);
    stored.categories = categories;
    if (approvals) stored.requiredIds = Array.from(new Set(approvals));
    write(salonId, stored);
  }
  root.NEXORA_SERVICE_APPROVAL_SETTINGS = {
    load: load, save: save, loadCatalog: loadCatalog, saveCatalog: saveCatalog,
    requiresApproval: function (salonId, serviceId) { return load(salonId).indexOf(serviceId) !== -1; }
  };
})(window);
