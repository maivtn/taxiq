/* Demo behavior for the Oct 27 PO advertising and wallet handoff.
   Amounts are integer points. Credit balances use point units (100 = 1 credit).
   No live advertising events, payments, tax information or API requests. */
(function () {
  'use strict';

  const root = document.getElementById('oneqr-advertising');
  const PO = window.ONEQR_ADVERTISING_PO;
  if (!root || !PO) return;

  const VERSION = 'ONEQR-ADS-WALLET-2026-10-27';
  const STORE = 'nexora-oneqr-advertising-demo-20261027';
  const $ = id => root.querySelector('#' + id);
  const state = {
    language: 'vi', activated: false, group: '', industry: '', secondary: [], custom: '',
    balance: 12000, pending: 300, ownCreditPoints: 0, receivedCreditPoints: 0,
    recipientCreditPoints: 0, consent: null, ledger: [], audit: []
  };
  let reviewSnapshot = null;
  let view = 'setup';
  let busy = false;
  const messages = {};
  const t = key => PO[state.language][key];
  const number = value => new Intl.NumberFormat(state.language === 'vi' ? 'vi-VN' : 'en-US', { maximumFractionDigits: 2 }).format(value);
  const dollars = points => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(points / 100);
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const id = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);

  // Only this version's synthetic balances are restored; previous cash-based demos are separate.
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE));
    const amounts = ['balance', 'pending', 'ownCreditPoints', 'receivedCreditPoints', 'recipientCreditPoints'];
    if (saved?.version === VERSION && amounts.every(key => Number.isSafeInteger(saved[key]) && saved[key] >= 0)
      && Array.isArray(saved.secondary) && Array.isArray(saved.ledger) && Array.isArray(saved.audit)) {
      Object.keys(state).forEach(key => { if (Object.hasOwn(saved, key)) state[key] = saved[key]; });
      state.language = state.language === 'en' ? 'en' : 'vi';
    }
  } catch (_) { /* The demo also works when session storage is unavailable. */ }

  function save() {
    try { sessionStorage.setItem(STORE, JSON.stringify({ ...state, version: VERSION })); }
    catch (_) { /* Keep the current in-memory session usable. */ }
  }

  function report(target, key, error = false) {
    messages[target] = { key, error };
    $(target).textContent = key ? t(key) : '';
    $(target).classList.toggle('error', error);
    $(target).classList.toggle('ok', Boolean(key) && !error);
  }

  function renderGroups() {
    $('group').replaceChildren(new Option(t('chooseGroup'), ''));
    PO.categories.forEach(category => $('group').add(new Option(category[state.language === 'vi' ? 1 : 2], category[0])));
    $('group').value = state.group;
    renderIndustries();
  }

  function renderIndustries() {
    const index = state.language === 'vi' ? 1 : 2;
    const category = PO.categories.find(item => item[0] === state.group);
    $('industry').replaceChildren(new Option(t('chooseIndustry'), ''));
    category?.[3].forEach(item => $('industry').add(new Option(item[index], item[0])));
    $('industry').value = state.industry;
    $('secondary').replaceChildren();
    PO.categories.forEach(group => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = group[index];
      group[3].filter(item => item[0] !== 'other').forEach(item => {
        const option = new Option(item[index], item[0]);
        option.selected = state.secondary.includes(item[0]);
        optgroup.append(option);
      });
      if (optgroup.children.length) $('secondary').append(optgroup);
    });
    updateIndustry();
  }

  function canActivate() {
    const industry = PO.categories.find(category => category[0] === state.group)?.[3].find(item => item[0] === state.industry);
    return !state.activated && Boolean(industry) && $('agree').checked && (state.industry !== 'other' || Boolean(state.custom.trim()));
  }

  function updateIndustry() {
    const names = [state.industry, ...state.secondary.filter(key => key !== state.industry)].map(key => {
      const industry = PO.categories.flatMap(category => category[3]).find(item => item[0] === key);
      return industry?.[state.language === 'vi' ? 1 : 2];
    }).filter(Boolean);
    const label = state.industry ? names.join(' · ') : t('notChosen');
    $('customBlock').classList.toggle('hide', state.industry !== 'other');
    $('custom').required = state.industry === 'other';
    $('chosen').textContent = label;
    $('adIndustry').textContent = label;
    $('activate').disabled = !canActivate();
  }

  function refreshBalances() {
    root.querySelectorAll('.balance').forEach(element => {
      element.textContent = number(state.balance);
      let equivalent = element.nextElementSibling;
      if (!equivalent?.classList.contains('equivalent')) {
        equivalent = document.createElement('small');
        equivalent.className = 'equivalent';
        element.after(equivalent);
      }
      equivalent.textContent = dollars(state.balance);
    });
    root.querySelectorAll('[data-pending]').forEach(element => { element.textContent = number(state.pending); });
    root.querySelectorAll('[data-minimum-payout]').forEach(element => { element.textContent = number(10000); });
    $('received').textContent = number(state.receivedCreditPoints / 100);
    $('ownCredits').textContent = number(state.ownCreditPoints / 100);
    $('recipient-credits').textContent = number(state.recipientCreditPoints / 100);
    $('recipient-wallet').classList.toggle('hide', !state.recipientCreditPoints);
    $('status').textContent = t(state.activated ? 'statusOn' : 'statusOff');
    $('status').classList.toggle('is-active', state.activated);
    $('agree').disabled = state.activated;
    ['group', 'industry', 'secondary', 'custom'].forEach(key => { $(key).disabled = state.activated; });
    if (messages.payoutResult?.key) report('payoutResult', state.balance >= 10000 ? 'payoutDone' : 'payoutLow', state.balance < 10000);
    renderLedger();
  }

  function renderLedger() {
    $('ledger').innerHTML = [...state.ledger].reverse().map(entry => {
      const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(entry.timestamp));
      return `<article class="ledger-entry"><strong>${escape(t(entry.kind === 'transfer' ? 'transferTitle' : 'convert'))}</strong>
        <span>−${number(entry.points)} ${escape(t('points'))} → ${number(entry.points / 100)} ${escape(t('credits'))}</span>
        ${entry.kind === 'transfer' ? '<small>Demo Recipient</small>' : ''}
        <small>${escape(t('adsSource'))}</small><time datetime="${escape(entry.timestamp)}">${date}</time>
        <small>${escape(entry.id)}</small><small>${escape(t(entry.kind === 'transfer' ? 'done' : 'convertDone'))}</small></article>`;
    }).join('');
  }

  function transferPreview(points = Number($('amount').value)) {
    if (!Number.isSafeInteger(points) || points < 0) return '';
    return `${number(points)} ${t('points')} → ${number(points / 100)} ${t('credits')} · ${dollars(points)} ${t('equiv')}`;
  }

  function invalidateReview() {
    reviewSnapshot = null;
    $('review').classList.add('hide');
    $('preview').textContent = transferPreview();
    report('error', '');
    report('result', '');
  }

  function setLanguage(language) {
    state.language = language === 'en' ? 'en' : 'vi';
    document.documentElement.lang = state.language;
    document.title = t('title');
    root.querySelectorAll('[data-i]').forEach(element => { element.textContent = t(element.dataset.i); });
    root.querySelectorAll('[data-ph]').forEach(element => { element.placeholder = t(element.dataset.ph); });
    renderGroups();
    refreshBalances();
    $('preview').textContent = transferPreview();
    if (reviewSnapshot) $('reviewAmount').textContent = transferPreview(reviewSnapshot.points);
    Object.entries(messages).forEach(([target, message]) => report(target, message.key, message.error));
    save();
  }

  // Keep the six independent tabs and screen order from the PO prototype.
  const views = new Set(['setup', 'overview', 'earn', 'transfer', 'ads', 'policy']);
  const oldRoutes = { advertising: 'ads', activity: 'earn', reserves: 'earn', payouts: 'earn', settings: 'setup' };
  function navigate(requested, write = true, focus = false) {
    const route = oldRoutes[requested] || requested;
    view = views.has(route) ? route : 'setup';
    root.querySelectorAll('[data-screen]').forEach(section => {
      section.classList.toggle('hide', section.dataset.screen !== view);
    });
    root.querySelectorAll('#nav [data-view]').forEach(button => {
      button.classList.toggle('active', button.dataset.view === view);
      if (button.dataset.view === view) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    if (write && location.hash !== '#' + view) history.pushState(null, '', '#' + view);
    if (focus) {
      const heading = $(view)?.querySelector('h2');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
  }

  function activate() {
    if (!canActivate()) return;
    state.activated = true;
    state.consent = {
      businessId: 'bitcoin-nail-bar-demo', account: 'Business Owner', business: 'Bitcoin Nail Bar',
      timestamp: new Date().toISOString(), version: VERSION, language: state.language,
      primaryIndustry: state.industry, secondaryIndustries: [...state.secondary],
      description: state.custom, classification: state.industry === 'other' ? 'pending' : 'confirmed',
      placements: ['Deal Nearby', 'Search Deals', 'Explore'], earningsEnrolled: true
    };
    state.audit.push({ id: id(), type: 'activation', ...state.consent });
    save();
    refreshBalances();
    updateIndustry();
  }

  function reviewTransfer() {
    invalidateReview();
    if ($('recipient').value.trim() !== 'DEMO') {
      report('error', 'errRecipient', true);
      $('recipient').focus();
      return;
    }
    const points = Number($('amount').value);
    if (!Number.isSafeInteger(points) || points < 1000 || points > state.balance) {
      report('error', 'errAmount', true);
      $('amount').focus();
      return;
    }
    reviewSnapshot = { id: id(), points, recipient: 'DEMO' };
    $('reviewAmount').textContent = transferPreview(points);
    $('review').classList.remove('hide');
    $('review').focus({ preventScroll: true });
  }

  function commit(kind, points, transactionId) {
    if (busy || !Number.isSafeInteger(points) || points <= 0 || points > state.balance
      || state.ledger.some(entry => entry.id === transactionId)) return false;
    busy = true;
    try {
      state.balance -= points;
      if (kind === 'transfer') state.recipientCreditPoints += points;
      else state.ownCreditPoints += points;
      state.ledger.push({ id: transactionId, kind, points, timestamp: new Date().toISOString(),
        status: 'spent', program: 'oneqr-advertising-demo', source: 'advertising', version: VERSION,
        businessId: 'bitcoin-nail-bar-demo', sender: 'bitcoin-nail-bar-demo',
        recipient: kind === 'transfer' ? 'DEMO' : 'bitcoin-nail-bar-demo',
        eventId: 'sample-approved-balance', idempotencyKey: transactionId, adjustmentReason: null });
      save();
      refreshBalances();
      return true;
    } finally { busy = false; }
  }

  function confirmTransfer() {
    const snapshot = reviewSnapshot;
    if (!snapshot) return;
    if ($('recipient').value.trim() !== snapshot.recipient || Number($('amount').value) !== snapshot.points) {
      invalidateReview();
      return;
    }
    reviewSnapshot = null;
    $('review').classList.add('hide');
    if (snapshot.points < 1000 || !commit('transfer', snapshot.points, snapshot.id)) {
      report('error', 'errAmount', true);
      return;
    }
    report('result', 'done');
    $('result').focus({ preventScroll: true });
  }

  function convertPoints() {
    const points = Number($('convertAmount').value);
    if (!Number.isSafeInteger(points) || points <= 0 || points % 100 !== 0 || points > state.balance) {
      report('convertResult', 'errConvert', true);
      $('convertAmount').focus();
      return;
    }
    if (!commit('conversion', points, id())) return;
    // A completed conversion consumes the form amount, preventing an accidental repeated submission.
    $('convertAmount').value = '';
    root.querySelector('[data-action="convert-points"]').disabled = true;
    invalidateReview();
    report('convertResult', 'convertDone');
    $('convertResult').focus({ preventScroll: true });
  }

  root.addEventListener('click', event => {
    const destination = event.target.closest('[data-view]');
    if (destination) { event.preventDefault(); navigate(destination.dataset.view, true, !destination.closest('#nav')); return; }
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    if (action === 'activate') activate();
    if (action === 'review-transfer') reviewTransfer();
    if (action === 'confirm-transfer') confirmTransfer();
    if (action === 'cancel-transfer') { invalidateReview(); root.querySelector('[data-action="review-transfer"]').focus(); }
    if (action === 'convert-points') convertPoints();
    if (action === 'payout' || action === 'convert') {
      $(action).classList.toggle('hide');
      button.setAttribute('aria-expanded', String(!$(action).classList.contains('hide')));
    }
    if (action === 'request-payout') {
      // The PO prototype stops before real recipient, tax and payment-provider onboarding.
      // Checking eligibility neither submits a payout nor reserves or deducts points.
      report('payoutResult', state.balance >= 10000 ? 'payoutDone' : 'payoutLow', state.balance < 10000);
      $('payoutResult').focus({ preventScroll: true });
    }
  });

  root.addEventListener('change', event => {
    if (state.activated && ['group', 'industry', 'secondary', 'custom'].includes(event.target.id)) return;
    if (event.target.id === 'group') {
      state.group = $('group').value;
      state.industry = '';
      renderIndustries();
    }
    if (event.target.id === 'industry') { state.industry = $('industry').value; updateIndustry(); }
    if (event.target.id === 'secondary') { state.secondary = Array.from($('secondary').selectedOptions, option => option.value); updateIndustry(); }
    if (event.target.id === 'agree') updateIndustry();
    save();
  });

  root.addEventListener('input', event => {
    if (['recipient', 'amount'].includes(event.target.id)) invalidateReview();
    if (event.target.id === 'convertAmount') {
      report('convertResult', '');
      root.querySelector('[data-action="convert-points"]').disabled = !$('convertAmount').value.trim();
    }
    if (event.target.id === 'custom' && !state.activated) { state.custom = $('custom').value; updateIndustry(); save(); }
  });

  window.addEventListener('popstate', () => navigate(location.hash.slice(1).split('/')[0], false));
  window.addEventListener('hashchange', () => navigate(location.hash.slice(1).split('/')[0], false));
  $('custom').value = state.custom;
  $('agree').checked = Boolean(state.activated && state.consent);
  root.querySelectorAll('[data-action="payout"], [data-action="convert"]').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', button.dataset.action);
  });
  setLanguage('vi');
  navigate(location.hash.slice(1).split('/')[0], false);
})();
