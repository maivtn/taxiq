(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NEXORA_BOOKING_DEMO_DATE = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function localDateKey(date) {
    var d = date ? new Date(date) : new Date();
    if (!Number.isFinite(d.getTime())) d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function dateAtNoon(dateKey) {
    return new Date(String(dateKey || localDateKey()) + 'T12:00:00');
  }

  function dayDiff(fromDateKey, toDateKey) {
    var from = dateAtNoon(fromDateKey);
    var to = dateAtNoon(toDateKey);
    if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime())) return 0;
    return Math.round((to.getTime() - from.getTime()) / 86400000);
  }

  function addDays(dateKey, days) {
    var d = dateAtNoon(dateKey);
    if (!Number.isFinite(d.getTime())) d = dateAtNoon(localDateKey());
    d.setDate(d.getDate() + (Number(days) || 0));
    return localDateKey(d);
  }

  function rollDateKey(dateKey, baseDateKey, targetDateKey) {
    return addDays(targetDateKey, dayDiff(baseDateKey, dateKey));
  }

  function shiftDateTime(dateTime, fromDateKey, toDateKey) {
    var value = String(dateTime || '');
    var d = new Date(value);
    if (!Number.isFinite(d.getTime())) return value;
    d.setDate(d.getDate() + dayDiff(fromDateKey, toDateKey));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  return {
    localDateKey: localDateKey,
    dayDiff: dayDiff,
    addDays: addDays,
    rollDateKey: rollDateKey,
    shiftDateTime: shiftDateTime
  };
});
