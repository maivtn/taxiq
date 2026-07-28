(function () {
  'use strict';

  const SMS_STARTING_CREDITS = 847;
  const SMS_CREDIT_CAPACITY = 2000;
  const VOICE_USED_MINUTES = 487;
  const VOICE_TOTAL_MINUTES = 1000;
  const SMS_STORAGE_KEY = 'taxiq:sms-credits';

  const CREDITS_HISTORY = [
    { product: 'SMS', activity: 'All customers campaign', amount: '−1,284 SMS', date: 'Jul 28, 2026', balance: '847 SMS' },
    { product: 'Voice', activity: 'Incoming call', phone: '+1 (713) 555-0182', amount: '−18 min', date: 'Jul 28, 2026 · 10:42 AM', balance: '571 min' },
    { product: 'Voice', activity: 'Incoming call', phone: '+1 (832) 555-0104', amount: '−27 min', date: 'Jul 28, 2026 · 9:18 AM', balance: '544 min' },
    { product: 'Voice', activity: 'Incoming call', phone: '+1 (281) 555-0199', amount: '−31 min', date: 'Jul 27, 2026 · 5:50 PM', balance: '513 min' },
    { product: 'SMS', activity: 'VIP comeback campaign', amount: '−320 SMS', date: 'Jul 26, 2026', balance: '2,131 SMS' }
  ];

  function readSmsCredits() {
    try {
      const stored = Number.parseInt(window.localStorage.getItem(SMS_STORAGE_KEY), 10);
      return Number.isFinite(stored) && stored >= 0 ? stored : SMS_STARTING_CREDITS;
    } catch (error) {
      return SMS_STARTING_CREDITS;
    }
  }

  function writeSmsCredits(value) {
    const numericValue = Number(value);
    const normalizedValue = Number.isFinite(numericValue) ? Math.max(0, Math.round(numericValue)) : SMS_STARTING_CREDITS;
    try {
      window.localStorage.setItem(SMS_STORAGE_KEY, String(normalizedValue));
    } catch (error) {
      // Keep the in-memory value usable when storage is unavailable.
    }
    return normalizedValue;
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function formatNumber(value) {
    return Number(value).toLocaleString('en-US');
  }

  function setProgress(target, percentage, value, max) {
    if (!target) return;
    const bounded = Math.max(0, Math.min(100, percentage));
    target.style.width = bounded.toFixed(1) + '%';
    target.setAttribute('aria-valuenow', String(value));
    target.setAttribute('aria-valuemax', String(max));
  }

  function renderHistory() {
    const target = document.querySelector('[data-credits-history]');
    if (!target) return;
    target.innerHTML = CREDITS_HISTORY.map(function (item) {
      const badgeClass = item.product === 'Voice' ? 'credits-product-badge-voice' : 'credits-product-badge-sms';
      const amount = escapeHTML(item.amount);
      const activity = item.phone
        ? '<span class="credits-history-activity"><strong>' + escapeHTML(item.phone) + '</strong><small>' + escapeHTML(item.activity) + '</small></span>'
        : escapeHTML(item.activity);
      return '<tr>' +
        '<td><span class="credits-product-badge ' + badgeClass + '">' + escapeHTML(item.product) + '</span></td>' +
        '<td>' + activity + '</td>' +
        '<td class="credits-amount-negative">' + amount + '</td>' +
        '<td>' + escapeHTML(item.date) + '</td>' +
        '<td>' + escapeHTML(item.balance) + '</td>' +
      '</tr>';
    }).join('');
  }

  function renderCreditsPage() {
    if (!document.querySelector('[data-credits-page]')) return;

    const smsBalance = readSmsCredits();
    const smsPercentage = (smsBalance / SMS_CREDIT_CAPACITY) * 100;
    const voiceRemaining = VOICE_TOTAL_MINUTES - VOICE_USED_MINUTES;
    const voicePercentage = (VOICE_USED_MINUTES / VOICE_TOTAL_MINUTES) * 100;
    const smsBalanceTarget = document.querySelector('[data-credits-sms-balance]');
    const smsValueTarget = document.querySelector('[data-credits-sms-value]');
    const smsProgressLabel = document.querySelector('[data-credits-sms-progress-label]');
    const smsStatus = document.querySelector('[data-credits-sms-status]');
    const voiceBalanceTarget = document.querySelector('[data-credits-voice-balance]');
    const voiceProgressLabel = document.querySelector('[data-credits-voice-progress-label]');
    const smsProgress = document.querySelector('[data-credits-sms-progress]');
    const voiceProgress = document.querySelector('[data-credits-voice-progress]');

    if (smsBalanceTarget) smsBalanceTarget.textContent = formatNumber(smsBalance);
    if (smsValueTarget) smsValueTarget.textContent = '≈ $' + (smsBalance * 0.025).toFixed(2);
    if (smsProgressLabel) smsProgressLabel.textContent = smsPercentage.toFixed(1) + '%';
    if (smsStatus) {
      const low = smsBalance < 250;
      smsStatus.textContent = low ? 'Low balance' : 'Healthy';
      smsStatus.classList.toggle('is-healthy', !low);
      smsStatus.classList.toggle('is-warning', low);
    }
    if (voiceBalanceTarget) voiceBalanceTarget.textContent = formatNumber(voiceRemaining);
    if (voiceProgressLabel) voiceProgressLabel.textContent = voicePercentage.toFixed(1) + '%';
    setProgress(smsProgress, smsPercentage, smsBalance, SMS_CREDIT_CAPACITY);
    setProgress(voiceProgress, voicePercentage, VOICE_USED_MINUTES, VOICE_TOTAL_MINUTES);
    renderHistory();
  }

  window.NEXORA_CREDITS = {
    readSmsCredits,
    writeSmsCredits,
    renderCreditsPage
  };

  renderCreditsPage();
}());
