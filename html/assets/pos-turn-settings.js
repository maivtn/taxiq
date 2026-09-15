/* Shared salon turn configuration for the local POS prototype. */
(function (root) {
  'use strict';
  const salonId = root.NEXORA_SALON_DATA.loadCatalog().salon.id;
  const key = 'nexora:turn-settings:v1:' + salonId;
  const defaults = { bookingTurnCredit: 0.5, serviceWeights: [0.5, 1, 1.5, 2], serviceThresholds: [30, 70, 110] };
  const listeners = new Set();
  const copy = value => JSON.parse(JSON.stringify(value));

  function validate(value) {
    const validCredit = credit => typeof credit === 'number' && Number.isFinite(credit) && credit >= 0;
    if (!value || !validCredit(value.bookingTurnCredit) || !Array.isArray(value.serviceWeights) ||
      value.serviceWeights.length !== 4 || !value.serviceWeights.every(validCredit)) {
      return 'Enter a non-negative number for every turn credit.';
    }
    const thresholds = Object.hasOwn(value, 'serviceThresholds') ? value.serviceThresholds : defaults.serviceThresholds;
    if (!Array.isArray(thresholds) || thresholds.length !== 3 || [0, 1, 2].some(index => {
      const amount = thresholds[index];
      if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) return true;
      const cents = Math.round(amount * 100);
      return !Number.isSafeInteger(cents) || cents / 100 !== amount || (index > 0 && amount <= thresholds[index - 1]);
    })) return 'Enter three increasing service amounts greater than zero, with no more than two decimal places.';
    return '';
  }

  function load() {
    try {
      const value = JSON.parse(root.localStorage.getItem(key));
      if (!validate(value)) return {bookingTurnCredit: value.bookingTurnCredit, serviceWeights: [...value.serviceWeights],
        serviceThresholds: [...(value.serviceThresholds || defaults.serviceThresholds)]};
    } catch (_) { /* Missing or damaged settings use the salon defaults. */ }
    return copy(defaults);
  }

  function save(value) {
    const error = validate(value);
    if (error) return {ok: false, error};
    const settings = {bookingTurnCredit: value.bookingTurnCredit, serviceWeights: [...value.serviceWeights],
      serviceThresholds: [...(Object.hasOwn(value, 'serviceThresholds') ? value.serviceThresholds : load().serviceThresholds)]};
    try {
      root.localStorage.setItem(key, JSON.stringify(settings));
    } catch (_) {
      return {ok: false, error: 'Could not save turn settings. Check browser storage and try again.'};
    }
    listeners.forEach(listener => listener(load()));
    return {ok: true};
  }

  function serviceCredit(amount, settings = load()) {
    if (!Number.isFinite(amount) || amount < 0 || validate(settings)) return 0;
    const thresholds = settings.serviceThresholds || defaults.serviceThresholds;
    const index = thresholds.findIndex(threshold => amount < threshold);
    return settings.serviceWeights[index === -1 ? 3 : index];
  }

  function rangeLabels() {
    const thresholds = load().serviceThresholds;
    return [0, ...thresholds].map((start, index) => index === 3 ? '$' + start + '+' :
      '$' + start + '–' + ((Math.round(thresholds[index] * 100) - 1) / 100).toFixed(2));
  }

  function numberFrom(input) {
    return !input || input.value.trim() === '' ? NaN : Number(input.value);
  }

  root.addEventListener('storage', event => {
    if ((event.key === key || event.key === null) && event.storageArea === root.localStorage) {
      listeners.forEach(listener => listener(load()));
    }
  });
  root.NEXORA_TURN_SETTINGS = {load, save, validate, serviceCredit, numberFrom, get labels() { return rangeLabels(); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
  };
})(window);
