(function () {
  'use strict';

  const dialog = document.querySelector('[data-ads-dialog]');
  if (!dialog) return;
  const form = dialog.querySelector('[data-ads-form]');
  const consent = dialog.querySelector('[data-ads-consent]');
  const custom = dialog.querySelector('[data-ads-custom]');
  const submit = dialog.querySelector('[data-ads-submit]');
  const error = dialog.querySelector('[data-ads-error]');
  const amountButtons = [...dialog.querySelectorAll('[data-ads-amount]')];
  const returnContext = document.querySelector('[data-ads-return-context]');
  const returnLink = document.querySelector('[data-ads-return]');
  const returnCampaign = document.querySelector('[data-ads-return-campaign]');
  const STORAGE_KEY = 'nexora:ads-credit:v1';
  const amountLimits = { minCents: 100, maxCents: 1000000 };
  let balanceCents = 35000;
  let holdCents = 3000;
  let selectedAmount = '100';
  let completed = false;
  let opener;
  let previousOverflow = '';
  let receiptNumber = 1;
  let history = [
    { activity: 'Weekend offer · CPA', date: 'Sep 21, 2026', cents: -5000, balance: 35000, detail: 'Campaign ADS-CPA-02 · Search Deals · Eligible transaction ADS-EVT-02 approved after the hold window.', status: 'Recorded' },
    { activity: 'New guest offer · CPC', date: 'Sep 20, 2026', cents: -10000, balance: 40000, detail: 'Campaign ADS-CPC-01 · Sponsored card in Explore · Approved click batch ADS-EVT-01.', status: 'Recorded' },
    { activity: 'Card top-up', date: 'Sep 18, 2026', cents: 50000, balance: 50000, detail: 'Receipt ADS-001 · Visa ending 4242 · Credit $500.00 · Fee $0.00 · Tax $0.00 · Total $500.00.', status: 'Completed' }
  ];
  const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

  function safeReturnContext() {
    const params = new URLSearchParams(window.location.search);
    const href = params.get('returnTo') || '';
    if (!/^reward-promotions\.html\?/.test(href) || href.includes('://') || href.includes('\\')) return null;
    return { href, campaignId: params.get('campaignId') || new URLSearchParams(href.split('?')[1] || '').get('campaignId') || 'saved draft' };
  }

  function loadSavedCredit() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || !Number.isFinite(saved.balanceCents) || !Number.isFinite(saved.holdCents) || !Array.isArray(saved.history)) return;
      balanceCents = saved.balanceCents;
      holdCents = saved.holdCents;
      history = saved.history;
      receiptNumber = Math.max(1, history.filter(item => Number(item.cents) > 0).length + 1);
    } catch (_) {}
  }

  function persistCredit() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ balanceCents, holdCents, history })); } catch (_) {}
  }

  function renderReturnContext() {
    const context = safeReturnContext();
    if (!returnContext || !returnLink || !returnCampaign || !context) {
      if (returnContext) returnContext.hidden = true;
      return;
    }
    returnContext.hidden = false;
    returnLink.hidden = false;
    returnLink.href = context.href;
    returnCampaign.textContent = context.campaignId;
  }

  function amountCents() {
    const value = selectedAmount === 'custom' ? custom.value.trim() : selectedAmount;
    if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
    const [whole, fractional = ''] = value.split('.');
    const cents = Number(whole) * 100 + Number(fractional.padEnd(2, '0'));
    return Number.isSafeInteger(cents) && cents >= amountLimits.minCents && cents <= amountLimits.maxCents ? cents : null;
  }

  function updateQuote(resetConsent) {
    if (resetConsent) consent.checked = false;
    const cents = amountCents();
    const invalid = cents === null;
    dialog.querySelector('[data-ads-custom-wrap]').hidden = selectedAmount !== 'custom';
    custom.setAttribute('aria-invalid', String(selectedAmount === 'custom' && invalid));
    error.textContent = selectedAmount === 'custom' && invalid ? 'Enter $1.00–$10,000.00 with no more than two decimal places.' : '';
    amountButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.adsAmount === selectedAmount)));
    dialog.querySelector('[data-ads-receive]').textContent = invalid ? '—' : money(cents);
    dialog.querySelector('[data-ads-total]').textContent = invalid ? '—' : money(cents);
    submit.disabled = invalid || !consent.checked || completed;
  }

  function renderBalanceAndHistory() {
    document.querySelector('[data-ads-balance]').textContent = money(balanceCents - holdCents);
    document.querySelector('[data-ads-history]').innerHTML = history.map(item => `<tr>
      <td><strong>${escapeHTML(item.activity)}</strong><span class="ads-row-status">${item.status}</span></td>
      <td>${escapeHTML(item.date)}</td>
      <td class="${item.cents > 0 ? 'ads-positive' : ''}">${item.cents > 0 ? '+' : '−'}${money(Math.abs(item.cents))}</td>
      <td>${money(item.balance)}</td>
      <td><details><summary>${item.cents > 0 ? 'View receipt' : 'View activity'}</summary><p>${escapeHTML(item.detail)}</p></details></td>
    </tr>`).join('');
  }

  document.querySelector('[data-ads-open]').addEventListener('click', event => {
    opener = event.currentTarget;
    completed = false;
    selectedAmount = '100';
    form.reset();
    updateQuote(true);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    amountButtons.find(button => button.dataset.adsAmount === selectedAmount).focus();
  });
  dialog.querySelectorAll('[data-ads-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    form.reset();
    if (opener) opener.focus();
  });
  // Keep the native dialog's Escape behavior independent of the page's other modal handlers.
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dialog.close(); }
  });
  amountButtons.forEach(button => button.addEventListener('click', () => {
    selectedAmount = button.dataset.adsAmount;
    updateQuote(true);
    if (selectedAmount === 'custom') custom.focus();
  }));
  custom.addEventListener('input', () => updateQuote(true));
  consent.addEventListener('change', () => updateQuote(false));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const cents = amountCents();
    if (!dialog.open || completed || cents === null || !consent.checked) return;
    completed = true;
    submit.disabled = true;
    balanceCents += cents;
    receiptNumber += 1;
    const receipt = `ADS-${String(receiptNumber).padStart(3, '0')}`;
    history.unshift({
      activity: 'Card top-up',
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
      cents, balance: balanceCents, status: 'Completed',
      detail: `Receipt ${receipt} · Visa ending 4242 · Credit ${money(cents)} · Fee $0.00 · Tax $0.00 · Total ${money(cents)}.`
    });
    persistCredit();
    renderBalanceAndHistory();
    dialog.close();
    document.querySelector('[data-ads-status]').textContent = `${money(cents)} Ads Credit added.${safeReturnContext() ? ' Return to campaign when ready.' : ''}`;
  });
  loadSavedCredit();
  renderReturnContext();
  renderBalanceAndHistory();
}());
