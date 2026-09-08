(function (root) {
  'use strict';
  var prefix = 'nexora:service-approval:v1:';
  function load(salonId) {
    try {
      var ids = JSON.parse(root.localStorage.getItem(prefix + salonId) || '[]');
      return Array.isArray(ids) ? ids.filter(function (id) { return typeof id === 'string'; }) : [];
    } catch (error) { return []; }
  }
  function save(salonId, ids) {
    root.localStorage.setItem(prefix + salonId, JSON.stringify(Array.from(new Set(ids))));
  }
  root.NEXORA_SERVICE_APPROVAL_SETTINGS = {
    load: load,
    save: save,
    requiresApproval: function (salonId, serviceId) { return load(salonId).indexOf(serviceId) !== -1; }
  };
})(window);
