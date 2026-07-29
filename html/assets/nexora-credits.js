(function () {
  'use strict';

  const SMS_STARTING_CREDITS = 0;
  const SMS_STARTING_TOPUP_BALANCE = 450;
  const SMS_STARTING_TOPUP_TOTAL = 500;
  const SMS_PLAN_ALLOWANCE = 1000;
  const VOICE_USED_MINUTES = 620;
  const VOICE_TOTAL_MINUTES = 1000;

  const CREDITS_HISTORY = [
    { product: 'SMS', activity: 'All customers campaign', amount: '−1,284 SMS', date: 'Jul 28, 2026', balance: '847 SMS' },
    { product: 'Voice', activity: 'Incoming call', phone: '+1 (713) 555-0182', amount: '−18 min', date: 'Jul 28, 2026 · 10:42 AM', balance: '571 min' },
    { product: 'Voice', activity: 'Incoming call', phone: '+1 (832) 555-0104', amount: '−27 min', date: 'Jul 28, 2026 · 9:18 AM', balance: '544 min' },
    { product: 'Voice', activity: 'Incoming call', phone: '+1 (281) 555-0199', amount: '−31 min', date: 'Jul 27, 2026 · 5:50 PM', balance: '513 min' },
    { product: 'SMS', activity: 'VIP comeback campaign', amount: '−320 SMS', date: 'Jul 26, 2026', balance: '2,131 SMS' }
  ];
  let activeHistoryFilter = 'all';
  let smsWallet = null;
  let smsCreditHistory = [];

  function normalizeCreditValue(value, fallback) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? Math.max(0, Math.round(numericValue)) : fallback;
  }

  function getSmsCycleKey(date) {
    const currentDate = date || new Date();
    return currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1).padStart(2, '0');
  }

  function getSmsPlanExpiryDate(date) {
    const currentDate = date || new Date();
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }

  function formatLocalDateAttribute(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function renderPlanExpiryDate() {
    const expiryDate = getSmsPlanExpiryDate();
    const label = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(expiryDate);
    document.querySelectorAll('[data-credits-plan-expiry]').forEach(function (target) {
      target.textContent = label;
      target.setAttribute('datetime', formatLocalDateAttribute(expiryDate));
    });
  }

  function updateSmsWallet(wallet) {
    const topupBalance = normalizeCreditValue(wallet.topupBalance, 0);
    const topupTotal = normalizeCreditValue(wallet.topupTotal, topupBalance);
    smsWallet = {
      planRemaining: normalizeCreditValue(wallet.planRemaining, 0),
      topupBalance,
      topupTotal: Math.max(topupBalance, topupTotal),
      cycleKey: String(wallet.cycleKey || getSmsCycleKey())
    };
    return { ...smsWallet };
  }

  function readSmsWallet() {
    const cycleKey = getSmsCycleKey();
    if (!smsWallet) {
      return updateSmsWallet({
        planRemaining: SMS_STARTING_CREDITS,
        topupBalance: SMS_STARTING_TOPUP_BALANCE,
        topupTotal: SMS_STARTING_TOPUP_TOTAL,
        cycleKey
      });
    }

    if (smsWallet.cycleKey !== cycleKey) {
      return updateSmsWallet({
        planRemaining: SMS_PLAN_ALLOWANCE,
        topupBalance: smsWallet.topupBalance,
        topupTotal: smsWallet.topupTotal,
        cycleKey
      });
    }

    return { ...smsWallet };
  }

  function readSmsCredits() {
    const wallet = readSmsWallet();
    return wallet.planRemaining + wallet.topupBalance;
  }

  function writeSmsCredits(value) {
    const currentWallet = readSmsWallet();
    const currentBalance = currentWallet.planRemaining + currentWallet.topupBalance;
    const normalizedValue = normalizeCreditValue(value, SMS_STARTING_CREDITS);
    const delta = normalizedValue - currentBalance;
    const nextWallet = {
      planRemaining: currentWallet.planRemaining,
      topupBalance: currentWallet.topupBalance,
      topupTotal: currentWallet.topupTotal,
      cycleKey: currentWallet.cycleKey
    };

    if (delta > 0) {
      nextWallet.topupBalance += delta;
      nextWallet.topupTotal += delta;
    } else if (delta < 0) {
      const packageCreditsUsed = Math.min(nextWallet.planRemaining, Math.abs(delta));
      nextWallet.planRemaining -= packageCreditsUsed;
      nextWallet.topupBalance = Math.max(0, nextWallet.topupBalance - (Math.abs(delta) - packageCreditsUsed));
    }

    updateSmsWallet(nextWallet);
    return normalizedValue;
  }

  function addSmsTopupCredits(value) {
    const credits = normalizeCreditValue(value, 0);
    if (!credits) return readSmsCredits();
    const wallet = readSmsWallet();
    wallet.topupBalance += credits;
    wallet.topupTotal += credits;
    updateSmsWallet(wallet);
    return wallet.planRemaining + wallet.topupBalance;
  }

  function consumeSmsCredits(value) {
    const credits = normalizeCreditValue(value, 0);
    const wallet = readSmsWallet();
    const balance = wallet.planRemaining + wallet.topupBalance;
    if (credits > balance) return { success: false, balance };

    const packageCreditsUsed = Math.min(wallet.planRemaining, credits);
    wallet.planRemaining -= packageCreditsUsed;
    wallet.topupBalance = Math.max(0, wallet.topupBalance - (credits - packageCreditsUsed));
    updateSmsWallet(wallet);
    return { success: true, balance: wallet.planRemaining + wallet.topupBalance };
  }

  function readSmsCreditHistory() {
    return smsCreditHistory.filter(function (item) {
      return item && item.product === 'SMS' && item.direction === 'credit';
    }).slice(0, 20);
  }

  function recordSmsCreditPurchase(details) {
    const credits = Number(details && details.credits);
    const balance = Number(details && details.balance);
    if (!Number.isFinite(credits) || credits <= 0 || !Number.isFinite(balance) || balance < 0) return null;

    const packageName = String(details.packageName || 'SMS credits');
    const paymentMethod = details.paymentMethod ? ' via ' + String(details.paymentMethod) : '';
    const entry = {
      product: 'SMS',
      direction: 'credit',
      activity: packageName + ' top-up' + paymentMethod,
      amount: '+' + formatNumber(Math.round(credits)) + ' SMS',
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date()),
      balance: formatNumber(Math.round(balance)) + ' SMS'
    };

    smsCreditHistory = [entry].concat(readSmsCreditHistory()).slice(0, 20);
    return entry;
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function formatNumber(value) {
    return Number(value).toLocaleString('en-US');
  }

  function formatPercent(value) {
    return Math.round(value).toLocaleString('en-US') + '%';
  }

  function setText(selector, value) {
    const target = document.querySelector(selector);
    if (target) target.textContent = value;
  }

  function setProgress(fillSelector, trackSelector, used, total) {
    const normalizedUsed = Math.max(0, Number(used) || 0);
    const normalizedTotal = Math.max(0, Number(total) || 0);
    const percent = normalizedTotal ? Math.min(100, (normalizedUsed / normalizedTotal) * 100) : 0;
    const formattedPercent = formatPercent(percent);
    const fill = document.querySelector(fillSelector);
    const track = document.querySelector(trackSelector);

    if (fill) fill.style.width = formattedPercent;
    if (track) {
      track.setAttribute('aria-valuemax', String(normalizedTotal));
      track.setAttribute('aria-valuenow', String(normalizedUsed));
    }
    return formattedPercent;
  }

  function readSmsTopupTotal(wallet) {
    const purchasedCredits = readSmsCreditHistory().reduce(function (total, item) {
      const match = String(item.amount || '').match(/\+\s*([\d,]+)/);
      return total + (match ? Number.parseInt(match[1].replace(/,/g, ''), 10) : 0);
    }, 0);
    return Math.max(wallet.topupBalance, wallet.topupTotal, purchasedCredits);
  }

  function renderHistoryDate(value) {
    const parts = String(value == null ? '' : value).split(' · ');
    const date = escapeHTML(parts.shift());
    if (!parts.length) return date;
    return '<span class="credits-history-date">' + date + '<small>' + escapeHTML(parts.join(' · ')) + '</small></span>';
  }

  function renderHistory() {
    const target = document.querySelector('[data-credits-history]');
    if (!target) return;
    target.innerHTML = readSmsCreditHistory().concat(CREDITS_HISTORY).filter(function (item) {
      return activeHistoryFilter === 'all' || String(item.product).toLowerCase() === activeHistoryFilter;
    }).map(function (item) {
      const badgeClass = item.product === 'Voice' ? 'credits-product-badge-voice' : 'credits-product-badge-sms';
      const amount = escapeHTML(item.amount);
      const amountClass = item.direction === 'credit' ? 'credits-amount-positive' : 'credits-amount-negative';
      const activity = item.phone
        ? '<span class="credits-history-activity"><strong>' + escapeHTML(item.phone) + '</strong><small>' + escapeHTML(item.activity) + '</small></span>'
        : escapeHTML(item.activity);
      return '<tr>' +
        '<td><span class="credits-product-badge ' + badgeClass + '">' + escapeHTML(item.product) + '</span></td>' +
        '<td>' + activity + '</td>' +
        '<td class="' + amountClass + '">' + amount + '</td>' +
        '<td>' + renderHistoryDate(item.date) + '</td>' +
      '</tr>';
    }).join('');
  }

  function updateHistoryFilterControls() {
    document.querySelectorAll('[data-credits-history-filter]').forEach(function (button) {
      const isActive = button.dataset.creditsHistoryFilter === activeHistoryFilter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function setHistoryFilter(filter) {
    const requestedFilter = String(filter || 'all').toLowerCase();
    activeHistoryFilter = ['all', 'sms', 'voice'].includes(requestedFilter) ? requestedFilter : 'all';
    updateHistoryFilterControls();
    renderHistory();
  }

  function bindHistoryFilters() {
    document.querySelectorAll('[data-credits-history-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        setHistoryFilter(button.dataset.creditsHistoryFilter);
      });
    });
    updateHistoryFilterControls();
  }

  function renderCreditsPage() {
    if (!document.querySelector('[data-credits-page]')) return;

    renderPlanExpiryDate();
    const smsWallet = readSmsWallet();
    const smsTopupTotal = readSmsTopupTotal(smsWallet);
    const smsPlanUsed = SMS_PLAN_ALLOWANCE - smsWallet.planRemaining;
    const smsTopupBalanceTarget = document.querySelector('[data-credits-sms-topup-balance]');
    const smsTopupUsage = document.querySelector('[data-credits-sms-topup-usage]');

    setText('[data-credits-voice-used]', formatNumber(VOICE_USED_MINUTES));
    setText('[data-credits-voice-total]', formatNumber(VOICE_TOTAL_MINUTES));
    setText('[data-credits-voice-remaining]', formatNumber(Math.max(0, VOICE_TOTAL_MINUTES - VOICE_USED_MINUTES)));
    setProgress('[data-credits-voice-progress]', '[data-credits-voice-progress-track]', VOICE_USED_MINUTES, VOICE_TOTAL_MINUTES);

    setText('[data-credits-sms-plan-used]', formatNumber(smsPlanUsed));
    setText('[data-credits-sms-plan-total]', formatNumber(SMS_PLAN_ALLOWANCE));
    setText('[data-credits-sms-plan-remaining]', formatNumber(smsWallet.planRemaining));
    setProgress('[data-credits-sms-plan-progress]', '[data-credits-sms-plan-progress-track]', smsPlanUsed, SMS_PLAN_ALLOWANCE);

    if (smsTopupBalanceTarget) smsTopupBalanceTarget.textContent = formatNumber(smsWallet.topupBalance);
    setText('[data-credits-sms-topup-total]', formatNumber(smsTopupTotal) + ' SMS');

    const smsTopupUsed = Math.max(0, smsTopupTotal - smsWallet.topupBalance);
    setText('[data-credits-sms-topup-used]', formatNumber(smsTopupUsed));
    setText('[data-credits-sms-topup-usage-total]', formatNumber(smsTopupTotal));
    setProgress('[data-credits-sms-topup-progress]', '[data-credits-sms-topup-progress-track]', smsTopupUsed, smsTopupTotal);
    if (smsTopupUsage) smsTopupUsage.hidden = smsTopupUsed === 0;

    renderHistory();
  }

  window.NEXORA_CREDITS = {
    readSmsCredits,
    writeSmsCredits,
    readSmsWallet,
    addSmsTopupCredits,
    consumeSmsCredits,
    readSmsCreditHistory,
    recordSmsCreditPurchase,
    setHistoryFilter,
    renderCreditsPage
  };

  renderCreditsPage();
  bindHistoryFilters();
}());
