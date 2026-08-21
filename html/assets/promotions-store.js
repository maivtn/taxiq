(function (root, factory) {
  'use strict';

  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NEXORA_PROMOTIONS = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  var SALON_ID = 'bitcoin-nail-bar-houston';
  var STORAGE_KEY = 'nexora:promotions:v1:' + SALON_ID;
  var VERSION = 1;
  var MAX_IMAGE_BYTES = 600000;
  var TYPES = ['percent', 'fixed', 'special-price', 'custom'];
  var ELIGIBILITY = ['all', 'weekday', 'quiet-days', 'first-visit', 'combo', 'group', 'custom'];
  var IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  var DEFAULT_PROMOTIONS = [
    {
      id: 'happy-hours',
      title: 'Ưu đãi Thứ 2–Thứ 6',
      badge: 'HAPPY HOURS',
      type: 'percent',
      eligibility: 'weekday',
      value: 'Giảm 15%',
      description: 'Khung giờ 10:00 AM–2:00 PM',
      startTime: '10:00',
      endTime: '14:00',
      status: 'active'
    },
    {
      id: 'mani-pedi-combo',
      title: 'Combo Manicure + Pedicure',
      badge: 'COMBO DEAL',
      type: 'fixed',
      eligibility: 'combo',
      value: 'Tiết kiệm $10',
      description: 'Đặt hai dịch vụ trong cùng một lịch hẹn',
      status: 'active'
    },
    {
      id: 'quiet-day-savings',
      title: 'Book on a quieter day and save!',
      badge: 'QUIET DAY SAVINGS',
      type: 'percent',
      eligibility: 'quiet-days',
      value: '-10% off everything',
      description: 'Monday · Tuesday · Wednesday',
      status: 'active'
    },
    {
      id: 'first-visit',
      title: '10% off your first visit!',
      badge: 'FIRST VISIT',
      type: 'percent',
      eligibility: 'first-visit',
      value: '10% off',
      description: 'Applied automatically on your first visit',
      status: 'active'
    },
    {
      id: 'group-savings',
      title: 'Bring your friends and save!',
      badge: 'GROUP SAVINGS',
      type: 'custom',
      eligibility: 'group',
      value: '2+: 10% · 3+: 15%',
      description: 'Book together and save more',
      status: 'active'
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function text(value, limit) {
    return String(value == null ? '' : value).trim().replace(/\s+/g, ' ').slice(0, limit);
  }

  function slug(value) {
    var result = text(value, 100).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return result || 'offer-' + Date.now();
  }

  function dateValue(value) {
    var result = text(value, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(result) ? result : '';
  }

  function timeValue(value) {
    var result = text(value, 5);
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(result) ? result : '';
  }

  function safeImage(value) {
    var result = String(value == null ? '' : value).trim();
    if (/^https:\/\//i.test(result)) return result;
    if (/^data:image\/(?:jpeg|png|webp);base64,/i.test(result)) return result;
    return '';
  }

  function normalize(input) {
    input = input || {};
    var title = text(input.title, 80) || 'Untitled offer';
    return {
      id: slug(input.id || title),
      title: title,
      badge: text(input.badge, 24) || 'SPECIAL OFFER',
      type: TYPES.indexOf(input.type) >= 0 ? input.type : 'custom',
      eligibility: ELIGIBILITY.indexOf(input.eligibility) >= 0 ? input.eligibility : 'all',
      value: text(input.value, 40),
      description: text(input.description, 140),
      startDate: dateValue(input.startDate),
      endDate: dateValue(input.endDate),
      startTime: timeValue(input.startTime),
      endTime: timeValue(input.endTime),
      status: input.status === 'active' ? 'active' : 'paused',
      image: safeImage(input.image)
    };
  }

  function storageOrDefault(storage) {
    if (storage) return storage;
    try {
      return root && root.localStorage ? root.localStorage : null;
    } catch (_error) {
      return null;
    }
  }

  function notify(offers) {
    if (!root || typeof root.dispatchEvent !== 'function') return;
    try {
      var event = typeof root.CustomEvent === 'function'
        ? new root.CustomEvent('nexora:promotions-changed', { detail: { offers: clone(offers) } })
        : null;
      if (event) root.dispatchEvent(event);
    } catch (_error) {}
  }

  function save(offers, storage) {
    var target = storageOrDefault(storage);
    var normalized = (Array.isArray(offers) ? offers : []).map(normalize);
    if (!target || typeof target.setItem !== 'function') return false;
    try {
      target.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, offers: normalized }));
      notify(normalized);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function load(storage) {
    var target = storageOrDefault(storage);
    if (!target || typeof target.getItem !== 'function') return clone(DEFAULT_PROMOTIONS).map(normalize);
    try {
      var raw = target.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.version === VERSION && Array.isArray(parsed.offers)) {
          return parsed.offers.map(normalize);
        }
      }
    } catch (_error) {}

    var seeded = clone(DEFAULT_PROMOTIONS).map(normalize);
    save(seeded, target);
    return seeded;
  }

  function uniqueId(baseId, offers) {
    var base = slug(baseId);
    if (!offers.some(function (offer) { return offer.id === base; })) return base;
    var suffix = 2;
    while (offers.some(function (offer) { return offer.id === base + '-' + suffix; })) suffix += 1;
    return base + '-' + suffix;
  }

  function upsert(input, storage) {
    var offers = load(storage);
    var hasId = Boolean(input && text(input.id, 100));
    var next = normalize(input);
    var index = hasId ? offers.findIndex(function (offer) { return offer.id === next.id; }) : -1;
    if (index >= 0) {
      offers[index] = next;
    } else {
      next.id = uniqueId(next.id, offers);
      offers.push(next);
    }
    return save(offers, storage) ? clone(next) : null;
  }

  function setStatus(id, status, storage) {
    var offers = load(storage);
    var offer = offers.find(function (item) { return item.id === id; });
    if (!offer) return false;
    offer.status = status === 'active' ? 'active' : 'paused';
    return save(offers, storage);
  }

  function remove(id, storage) {
    var offers = load(storage);
    var next = offers.filter(function (offer) { return offer.id !== id; });
    if (next.length === offers.length) return false;
    return save(next, storage);
  }

  function localIsoDate(now) {
    var date = now instanceof Date ? now : new Date(now || Date.now());
    function pad(value) { return String(value).padStart(2, '0'); }
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function listActive(storage, now) {
    var today = localIsoDate(now);
    return load(storage).filter(function (offer) {
      if (offer.status !== 'active') return false;
      if (offer.startDate && today < offer.startDate) return false;
      if (offer.endDate && today > offer.endDate) return false;
      return true;
    });
  }

  function presentation(offer) {
    var image = safeImage(offer && offer.image);
    if (image) return { image: image, icon: '', theme: 'image' };
    var eligibility = offer && ELIGIBILITY.indexOf(offer.eligibility) >= 0 ? offer.eligibility : 'all';
    var visual = {
      all: { icon: '✨', theme: 'special' },
      weekday: { icon: '🕒', theme: 'weekday' },
      'quiet-days': { icon: '🌿', theme: 'quiet-days' },
      'first-visit': { icon: '🎁', theme: 'first-visit' },
      combo: { icon: '💅', theme: 'combo' },
      group: { icon: '👥', theme: 'group' },
      custom: { icon: '✨', theme: 'special' }
    }[eligibility];
    return { image: '', icon: visual.icon, theme: visual.theme };
  }

  function validateImage(file) {
    if (!file || IMAGE_TYPES.indexOf(file.type) < 0) return { ok: false, error: 'type' };
    if (Number(file.size) > MAX_IMAGE_BYTES) return { ok: false, error: 'size' };
    return { ok: true, error: '' };
  }

  return {
    SALON_ID: SALON_ID,
    STORAGE_KEY: STORAGE_KEY,
    MAX_IMAGE_BYTES: MAX_IMAGE_BYTES,
    DEFAULT_PROMOTIONS: clone(DEFAULT_PROMOTIONS),
    normalize: normalize,
    load: load,
    save: save,
    upsert: upsert,
    setStatus: setStatus,
    remove: remove,
    listActive: listActive,
    presentation: presentation,
    validateImage: validateImage
  };
});
