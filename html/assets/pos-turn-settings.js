/* Shared salon turn configuration for the local POS prototype. */
(function (root) {
  'use strict';
  const salonId = root.NEXORA_SALON_DATA.loadCatalog().salon.id;
  const key = 'nexora:turn-settings:v1:' + salonId;
  const defaults = { bookingTurnCredit: 0.5, serviceWeights: [0.5, 1, 1.5, 2] };
  const labels = ['$0–29.99', '$30–69.99', '$70–109.99', '$110+'];
  const listeners = new Set();
  const copy = value => JSON.parse(JSON.stringify(value));

  function validate(value) {
    const validCredit = credit => typeof credit === 'number' && Number.isFinite(credit) && credit >= 0;
    return value && validCredit(value.bookingTurnCredit) &&
      Array.isArray(value.serviceWeights) && value.serviceWeights.length === 4 && value.serviceWeights.every(validCredit)
      ? '' : 'Enter a non-negative number for every turn credit.';
  }

  function load() {
    try {
      const value = JSON.parse(root.localStorage.getItem(key));
      if (!validate(value)) return {bookingTurnCredit: value.bookingTurnCredit, serviceWeights: [...value.serviceWeights]};
    } catch (_) { /* Missing or damaged settings use the salon defaults. */ }
    return copy(defaults);
  }

  function save(value) {
    const error = validate(value);
    if (error) return {ok: false, error};
    try {
      root.localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      return {ok: false, error: 'Could not save turn settings. Check browser storage and try again.'};
    }
    listeners.forEach(listener => listener(load()));
    return {ok: true};
  }

  function serviceCredit(amount) {
    if (!Number.isFinite(amount) || amount < 0) return 0;
    return load().serviceWeights[amount < 30 ? 0 : amount < 70 ? 1 : amount < 110 ? 2 : 3];
  }

  function numberFrom(input) {
    return !input || input.value.trim() === '' ? NaN : Number(input.value);
  }

  root.addEventListener('storage', event => {
    if ((event.key === key || event.key === null) && event.storageArea === root.localStorage) {
      listeners.forEach(listener => listener(load()));
    }
  });
  root.NEXORA_TURN_SETTINGS = {load, save, validate, serviceCredit, numberFrom, labels,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
  };
})(window);
