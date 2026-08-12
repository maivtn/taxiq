const OWNED_PACKAGES = [
  {
    id: 'nexora-pro',
    product: 'NEXORA',
    name: 'Professional Pro',
    description: 'Owner dashboard and growth tools for a growing salon team.',
    activatedAt: '2026-08-01T00:00:00+07:00',
    expiresAt: '2026-08-31T23:59:59+07:00',
    features: ['Owner Dashboard', 'Auto Google Review', 'Landing Pages + AI Design'],
    autoRenew: true
  },
  {
    id: 'voice-pro',
    product: 'Voice + SMS',
    name: 'Pro',
    description: 'AI voice and SMS campaigns for missed calls and follow-ups.',
    activatedAt: '2026-08-01T00:00:00+07:00',
    expiresAt: '2026-08-31T23:59:59+07:00',
    features: ['AI Voice + SMS Campaigns', '1,000 min + 1,000 SMS', 'Auto Google Review'],
    autoRenew: false
  }
];

const PURCHASE_HISTORY = Array.isArray(window.NEXORA_PACKAGE_BILLING_RECORDS)
  ? window.NEXORA_PACKAGE_BILLING_RECORDS
  : [];

const PACKAGE_PAYMENT_METHODS = [
  { id: 'USDV', label: 'USDV', balance: '$79,000.00', asset: 'assets/usdv.png' },
  { id: 'USDT', label: 'USDT', balance: '$79,000.00', asset: 'assets/usdt.png' },
  { id: 'USD', label: 'USD', balance: '$79,000.00', asset: 'assets/usd.png' },
  { id: 'BTC', label: 'BTC', balance: '100,000.25', asset: 'assets/btc.png' },
  { id: 'VND', label: 'VND', balance: '$50,000,000.00', asset: 'assets/vnd.png' },
  { id: 'CARD', label: 'Credit or Debit Card' }
];

const PACKAGE_PLAN_DETAILS = {
  nexora: {
    Starter: { product: 'NEXPRA TOUCH', monthlyAmount: 29, totalLabel: '$29/mo' },
    Pro: { product: 'NEXPRA TOUCH', monthlyAmount: 79, totalLabel: '$79/mo' },
    Enterprise: { product: 'NEXPRA TOUCH', monthlyAmount: null, totalLabel: 'Custom quote' }
  },
  voice: {
    Starter: { product: 'AI Voice Plans', monthlyAmount: 99, totalLabel: '$99/mo' },
    Pro: { product: 'AI Voice Plans', monthlyAmount: 199, totalLabel: '$199/mo', trial: true },
    Elite: { product: 'AI Voice Plans', monthlyAmount: 349, totalLabel: '$349/mo' }
  }
};

(function () {
  'use strict';

  const tabs = [...document.querySelectorAll('[data-package-tab]')];
  const panels = [...document.querySelectorAll('[data-package-panel]')];
  const overview = document.querySelector('[data-package-overview]');
  const purchaseHistory = document.querySelector('[data-purchase-history]');
  const packagePaymentModal = document.querySelector('[data-package-payment-modal]');
  const packageTrialModal = document.querySelector('[data-package-trial-modal]');
  const billingCycleButtons = [...document.querySelectorAll('[data-package-billing-cycle]')];
  const billingPriceElements = [...document.querySelectorAll('[data-billing-price]')];
  const billingComparePriceElements = [...document.querySelectorAll('[data-billing-compare-price]')];
  const billingCompareLabel = document.querySelector('[data-billing-compare-label]');
  const defaultTab = 'overview';
  const defaultBillingCycle = 'monthly';
  const validTabIds = new Set(tabs.map((tab) => tab.dataset.packageTab));
  const validBillingCycles = new Set(['monthly', 'yearly']);
  let packagePaymentPlan = null;
  let packageBillingCycle = defaultBillingCycle;
  let packagePaymentId = PACKAGE_PAYMENT_METHODS[0].id;
  let packagePaymentModalOpener = null;
  let packagePaymentPreviousOverflow = '';
  let packageTrialModalOpener = null;
  let packageTrialPreviousOverflow = '';
  let freeTrialSubmitted = false;

  try {
    freeTrialSubmitted = window.localStorage.getItem('taxiq:nexora-ai-voice-free-trial') === 'submitted';
  } catch (error) {
    freeTrialSubmitted = false;
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character]));
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(new Date(value));
  }

  function formatPurchaseDate(value) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(new Date(value));
  }

  function formatPurchaseTime(value) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(value));
  }

  function formatAmount(value, currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value);
  }

  function formatWholeDollar(value) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatYearlyBillingAmount(monthlyAmount) {
    return Math.round(monthlyAmount * 12 * 0.8);
  }

  function billingAmountForCycle(monthlyAmount, cycle = packageBillingCycle) {
    return cycle === 'yearly' ? formatYearlyBillingAmount(monthlyAmount) : monthlyAmount;
  }

  function formatBillingTotalLabel(monthlyAmount, cycle = packageBillingCycle) {
    if (monthlyAmount === null) return 'Custom quote';
    const suffix = cycle === 'yearly' ? 'yr' : 'mo';
    return `$${formatWholeDollar(billingAmountForCycle(monthlyAmount, cycle))}/${suffix}`;
  }

  function formatBillingPriceHTML(monthlyAmount, periodFormat, cycle = packageBillingCycle) {
    const suffix = cycle === 'yearly' ? 'yr' : 'mo';
    const amount = formatWholeDollar(billingAmountForCycle(monthlyAmount, cycle));
    return periodFormat === 'spaced'
      ? `$${amount} <span>/ ${suffix}</span>`
      : `$${amount}<span>/${suffix}</span>`;
  }

  function getOwnedPackageStatus(validUntil, reference = new Date()) {
    const end = new Date(validUntil);
    const active = Number.isFinite(end.getTime()) && end >= new Date(reference);
    return active
      ? { label: 'Active', className: 'is-active', icon: 'circle-check' }
      : { label: 'Expired', className: 'is-expired', icon: 'circle-x' };
  }

  function getPackageBillingStatus(item) {
    if (item.paymentStatus === 'paid') {
      return { label: 'Paid', className: 'is-paid', icon: 'circle-check' };
    }
    if (item.paymentStatus === 'overdue') {
      return { label: 'Overdue', className: 'is-overdue', icon: 'circle-alert' };
    }
    return { label: 'Payment due', className: 'is-payment-due', icon: 'clock-3' };
  }

  function packageBillingDetailHref(item) {
    return `nexora-package-billing-detail.html?transaction=${encodeURIComponent(item.transactionId)}`;
  }

  function renderBillingPrices() {
    billingPriceElements.forEach((element) => {
      const monthlyAmount = Number(element.dataset.monthlyAmount);
      if (!Number.isFinite(monthlyAmount)) return;
      element.innerHTML = formatBillingPriceHTML(monthlyAmount, element.dataset.billingPeriodFormat || 'compact');
    });

    billingComparePriceElements.forEach((element) => {
      const monthlyAmount = Number(element.dataset.monthlyAmount);
      if (!Number.isFinite(monthlyAmount)) return;
      element.textContent = `$${formatWholeDollar(billingAmountForCycle(monthlyAmount))}`;
    });

    if (billingCompareLabel) {
      billingCompareLabel.textContent = packageBillingCycle === 'yearly' ? 'Yearly price' : 'Monthly price';
    }
  }

  function activateBillingCycle(cycle) {
    const nextCycle = validBillingCycles.has(cycle) ? cycle : defaultBillingCycle;
    packageBillingCycle = nextCycle;
    billingCycleButtons.forEach((button) => {
      const active = button.dataset.packageBillingCycle === nextCycle;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderBillingPrices();
  }

  function renderPackagePaymentOptions() {
    const target = packagePaymentModal?.querySelector('[data-package-payment-list]');
    if (!target) return;

    target.innerHTML = PACKAGE_PAYMENT_METHODS.map((method) => {
      const selected = method.id === packagePaymentId;
      const paymentAsset = method.id === 'CARD'
        ? '<i data-lucide="credit-card" aria-hidden="true"></i>'
        : `<img src="${method.asset}" alt="" aria-hidden="true">`;
      const paymentBalance = method.id === 'CARD'
        ? ''
        : `<span class="package-payment-balance"><span>Balance</span><strong>${method.balance}</strong></span>`;
      return `
        <button class="package-payment-option${selected ? ' is-selected' : ''}" type="button" data-package-payment="${method.id}" aria-pressed="${selected}">
          <span class="package-payment-option-main">
            <span class="package-payment-radio" aria-hidden="true"></span>
            <span class="package-payment-asset">${paymentAsset}</span>
            <span class="package-payment-name">${method.label}</span>
          </span>
          ${paymentBalance}
        </button>
      `;
    }).join('');
  }

  function renderPackagePayment() {
    if (!packagePaymentModal || !packagePaymentPlan) return;
    const title = packagePaymentModal.querySelector('[data-package-payment-title]');
    const invoiceProduct = packagePaymentModal.querySelector('[data-package-invoice-product]');
    const invoicePlan = packagePaymentModal.querySelector('[data-package-invoice-plan]');
    const invoicePayment = packagePaymentModal.querySelector('[data-package-invoice-payment]');
    const invoiceTotal = packagePaymentModal.querySelector('[data-package-invoice-total]');
    const confirmLabel = packagePaymentModal.querySelector('[data-package-payment-confirm-label]');
    const closeButton = packagePaymentModal.querySelector('[data-package-payment-close]');
    const status = packagePaymentModal.querySelector('[data-package-payment-status]');
    const cardForm = packagePaymentModal.querySelector('[data-package-card-form]');
    const selectedPayment = PACKAGE_PAYMENT_METHODS.find((method) => method.id === packagePaymentId) || PACKAGE_PAYMENT_METHODS[0];

    renderPackagePaymentOptions();
    if (title) title.textContent = `Choose ${packagePaymentPlan.plan}`;
    if (invoiceProduct) invoiceProduct.textContent = packagePaymentPlan.product;
    if (invoicePlan) invoicePlan.textContent = packagePaymentPlan.plan;
    if (invoicePayment) invoicePayment.textContent = selectedPayment.label;
    if (invoiceTotal) invoiceTotal.textContent = packagePaymentPlan.totalLabel;
    if (confirmLabel) {
      confirmLabel.textContent = packagePaymentPlan.monthlyAmount === null
        ? 'Request Sales Quote'
        : packagePaymentPlan.monthlyAmount === 0
          ? 'Continue with Free Plan'
          : packagePaymentPlan.trial
            ? 'Start Free Trial'
            : `Confirm ${packagePaymentPlan.plan}`;
    }
    if (closeButton) closeButton.setAttribute('aria-label', `Close payment for ${packagePaymentPlan.plan}`);
    if (status) status.textContent = `${packagePaymentPlan.plan}, paid with ${selectedPayment.label}.`;
    if (cardForm) cardForm.hidden = selectedPayment.id !== 'CARD';
    if (selectedPayment.id !== 'CARD') {
      const error = packagePaymentModal.querySelector('[data-package-card-error]');
      if (error) error.textContent = '';
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  function getPackagePlanDetails(button) {
    const nexoraPlan = button.dataset.nexoraSelect;
    const voiceTrialPlan = button.dataset.planTrial;
    const voicePlan = button.dataset.planSelect || voiceTrialPlan;
    const tabId = nexoraPlan ? 'nexora' : voicePlan ? 'voice' : '';
    const plan = nexoraPlan || voicePlan;
    const detail = plan && PACKAGE_PLAN_DETAILS[tabId] ? PACKAGE_PLAN_DETAILS[tabId][plan] : null;
    const trialAction = Boolean(voiceTrialPlan);
    return detail
      ? {
          ...detail,
          plan,
          tabId,
          billingCycle: packageBillingCycle,
          totalLabel: formatBillingTotalLabel(detail.monthlyAmount),
          trial: trialAction && Boolean(detail.trial)
        }
      : null;
  }

  function showPendingTrialAlert() {
    const message = 'Yêu cầu Free Trial đã được gửi và đang chờ xử lý.';
    if (window.Swal && typeof window.Swal.fire === 'function') {
      window.Swal.fire({
        icon: 'info',
        title: 'Free Trial đã được submit',
        text: message,
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }
    window.alert(message);
  }

  function showTrialSubmittedAlert() {
    const message = 'Thông tin của bạn đã được submit. NEXORA sẽ xử lý và liên hệ trong vòng 24 giờ.';
    if (window.Swal && typeof window.Swal.fire === 'function') {
      window.Swal.fire({
        icon: 'success',
        title: 'Đã gửi yêu cầu Free Trial',
        text: message,
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }
    window.alert(message);
  }

  function openPackageTrialModal(button) {
    const details = getPackagePlanDetails(button);
    if (!packageTrialModal || !details?.trial) return;
    if (details.trial && freeTrialSubmitted) {
      showPendingTrialAlert();
      return;
    }
    packageTrialModalOpener = button;
    packageTrialPreviousOverflow = document.body.style.overflow;
    packageTrialModal.hidden = false;
    packageTrialModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('package-trial-open');
    document.body.style.overflow = 'hidden';
    const firstField = packageTrialModal.querySelector('[data-trial-required]');
    if (firstField) firstField.focus();
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  function closePackageTrialModal() {
    if (!packageTrialModal || packageTrialModal.hidden) return;
    packageTrialModal.hidden = true;
    packageTrialModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('package-trial-open');
    document.body.style.overflow = packageTrialPreviousOverflow;
    if (packageTrialModalOpener && typeof packageTrialModalOpener.focus === 'function') packageTrialModalOpener.focus();
    packageTrialModalOpener = null;
  }

  function validatePackageTrialForm() {
    const form = packageTrialModal?.querySelector('[data-package-trial-form]');
    if (!form) return false;
    let firstInvalid = null;
    form.querySelectorAll('[data-trial-required]').forEach((field) => {
      field.removeAttribute('aria-invalid');
      const value = field.value.trim();
      const invalidEmail = field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!firstInvalid && (!value || invalidEmail)) firstInvalid = field;
    });
    const error = form.querySelector('[data-package-trial-error]');
    if (firstInvalid) {
      firstInvalid.setAttribute('aria-invalid', 'true');
      if (error) error.textContent = 'Please complete the required salon, owner, phone, and email fields.';
      firstInvalid.focus();
      return false;
    }
    const selectedServices = form.querySelectorAll('[data-trial-chip].is-active');
    if (!selectedServices.length) {
      if (error) error.textContent = 'Please select at least one salon service.';
      const firstChip = form.querySelector('[data-trial-chip]');
      if (firstChip) firstChip.focus();
      return false;
    }
    if (error) error.textContent = '';
    return true;
  }

  function submitPackageTrial() {
    if (freeTrialSubmitted) {
      showPendingTrialAlert();
      return;
    }
    if (!validatePackageTrialForm()) return;
    freeTrialSubmitted = true;
    try {
      window.localStorage.setItem('taxiq:nexora-ai-voice-free-trial', 'submitted');
    } catch (error) {
      // The in-page state still prevents duplicate submissions when storage is unavailable.
    }
    closePackageTrialModal();
    showTrialSubmittedAlert();
  }

  function openPackagePaymentModal(button) {
    const details = getPackagePlanDetails(button);
    if (!packagePaymentModal || !details) return;
    if (details.trial && freeTrialSubmitted) {
      showPendingTrialAlert();
      return;
    }
    packagePaymentModalOpener = button;
    packagePaymentPlan = details;
    packagePaymentId = PACKAGE_PAYMENT_METHODS[0].id;
    packagePaymentPreviousOverflow = document.body.style.overflow;
    renderPackagePayment();
    packagePaymentModal.hidden = false;
    packagePaymentModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('package-payment-open');
    document.body.style.overflow = 'hidden';
    const closeButton = packagePaymentModal.querySelector('[data-package-payment-close]');
    if (closeButton) closeButton.focus();
  }

  function closePackagePaymentModal() {
    if (!packagePaymentModal || packagePaymentModal.hidden) return;
    packagePaymentModal.hidden = true;
    packagePaymentModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('package-payment-open');
    document.body.style.overflow = packagePaymentPreviousOverflow;
    if (packagePaymentModalOpener && typeof packagePaymentModalOpener.focus === 'function') packagePaymentModalOpener.focus();
    packagePaymentModalOpener = null;
  }

  function validatePackageCardForm() {
    const form = packagePaymentModal?.querySelector('[data-package-card-form]');
    if (!form || form.hidden) return true;
    let firstMissing = null;
    form.querySelectorAll('[data-package-card-required]').forEach((field) => {
      field.removeAttribute('aria-invalid');
      if (!firstMissing && !field.value.trim()) firstMissing = field;
    });
    const error = form.querySelector('[data-package-card-error]');
    if (firstMissing) {
      firstMissing.setAttribute('aria-invalid', 'true');
      if (error) error.textContent = 'Please complete all required card details.';
      firstMissing.focus();
      return false;
    }
    if (error) error.textContent = '';
    return true;
  }

  function confirmPackagePayment() {
    const selectedPayment = PACKAGE_PAYMENT_METHODS.find((method) => method.id === packagePaymentId) || PACKAGE_PAYMENT_METHODS[0];
    if (selectedPayment.id === 'CARD' && !validatePackageCardForm()) return;
    closePackagePaymentModal();
  }

  function formatCountdownParts(value, reference = new Date()) {
    const end = new Date(value);
    const now = new Date(reference);
    const empty = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    if (!Number.isFinite(end.getTime()) || end <= now) return empty;

    let cursor = new Date(now);
    let years = 0;
    let months = 0;
    while (true) {
      const next = new Date(cursor);
      next.setFullYear(next.getFullYear() + 1);
      if (next > end) break;
      cursor = next;
      years += 1;
    }
    while (true) {
      const next = new Date(cursor);
      next.setMonth(next.getMonth() + 1);
      if (next > end) break;
      cursor = next;
      months += 1;
    }

    let remaining = end.getTime() - cursor.getTime();
    const days = Math.floor(remaining / 86400000);
    remaining -= days * 86400000;
    const hours = Math.floor(remaining / 3600000);
    remaining -= hours * 3600000;
    const minutes = Math.floor(remaining / 60000);
    remaining -= minutes * 60000;
    const seconds = Math.floor(remaining / 1000);

    return { years, months, days, hours, minutes, seconds };
  }

  function renderCountdownUnits(value) {
    const parts = formatCountdownParts(value);
    return [
      ['years', 'Years'],
      ['months', 'Months'],
      ['days', 'Days'],
      ['hours', 'Hours'],
      ['minutes', 'Minutes'],
      ['seconds', 'Seconds']
    ]
      .map(([unit, label]) => `
        <div class="package-countdown-unit" data-countdown-unit="${unit}">
          <strong data-countdown-number="${unit}">${String(parts[unit]).padStart(2, '0')}</strong>
          <span>${label}</span>
        </div>
      `)
      .join('');
  }

  function renderOverview() {
    if (!overview) return;
    overview.innerHTML = `
      <div class="package-overview-grid">
        ${OWNED_PACKAGES.map((item) => {
          const status = getOwnedPackageStatus(item.expiresAt);
          return `
          <article class="package-owned-card" data-owned-package="${escapeHTML(item.id)}">
            <div class="package-owned-card-top">
              <span class="package-product-badge">${escapeHTML(item.product)}</span>
              <span class="package-status ${status.className}"><i data-lucide="${status.icon}" aria-hidden="true"></i>${status.label}</span>
            </div>
            <div class="package-owned-title-row">
                <div class="package-owned-info">
                  <div class="package-owned-name-row">
                    <h3>${escapeHTML(item.name)}</h3>
                    <div class="package-autorenew-row">
                      <span class="package-autorenew-label">Auto Renew</span>
                      <label class="package-switch">
                        <input type="checkbox" data-autorenew-input data-owned-package-id="${escapeHTML(item.id)}" ${item.autoRenew ? 'checked' : ''} aria-label="Auto renew ${escapeHTML(item.name)}">
                        <span class="package-switch-track">
                          <span class="package-switch-thumb"></span>
                          <span class="package-autorenew-state" data-autorenew-state>${item.autoRenew ? 'ON' : 'OFF'}</span>
                        </span>
                      </label>
                    </div>
                  </div>
                  <p>${escapeHTML(item.description)}</p>
                </div>
            </div>
                <div class="package-date-grid">
                  <div><span>Activated</span><strong>${formatDate(item.activatedAt)}</strong></div>
                  <div><span>Expires</span><strong>${formatDate(item.expiresAt)}</strong></div>
                </div>
                <div class="package-countdown" data-countdown data-package-end="${escapeHTML(item.expiresAt)}">
                  <div class="package-countdown-heading"><span class="package-countdown-icon"><i data-lucide="clock-3" aria-hidden="true"></i></span><span class="package-countdown-label">Remaining Time</span></div>
                  <div class="package-countdown-units" role="group" aria-label="Remaining time">${renderCountdownUnits(item.expiresAt)}</div>
                </div>
          </article>
        `;
        }).join('')}
      </div>
    `;
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  function handleAutoRenewChange(event) {
    const input = event.target.closest('[data-autorenew-input]');
    if (!input) return;
    const item = OWNED_PACKAGES.find((packageItem) => packageItem.id === input.dataset.ownedPackageId);
    if (item) item.autoRenew = input.checked;
    const stateLabel = input.closest('.package-switch')?.querySelector('[data-autorenew-state]');
    if (stateLabel) stateLabel.textContent = input.checked ? 'ON' : 'OFF';
  }

  function updateCountdowns() {
    document.querySelectorAll('[data-countdown]').forEach((countdown) => {
      const parts = formatCountdownParts(countdown.dataset.packageEnd);
      countdown.querySelectorAll('[data-countdown-number]').forEach((number) => {
        const unit = number.dataset.countdownNumber;
        if (unit && Object.prototype.hasOwnProperty.call(parts, unit)) number.textContent = String(parts[unit]).padStart(2, '0');
      });
    });
  }

  function renderPurchaseHistory() {
    if (!purchaseHistory) return;
    purchaseHistory.innerHTML = `
      <div class="package-history-table-wrap">
        <table class="package-history-table">
          <caption class="visually-hidden">Package purchase history</caption>
          <thead>
            <tr>
              <th scope="col">Date &amp; time</th>
              <th scope="col">Amount</th>
              <th scope="col">Package</th>
              <th scope="col">Term</th>
              <th scope="col">Status</th>
              <th scope="col">Transaction ID</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            ${PURCHASE_HISTORY.map((item) => {
              const status = getPackageBillingStatus(item);
              const historyDate = item.datePaid || item.dateIssued;
              const actionLabel = item.paymentStatus === 'paid' ? 'View invoice' : 'Payment details';
              return `
                <tr>
                  <td data-label="Date &amp; time">
                    <strong>${formatPurchaseDate(historyDate)}</strong>
                    <span>${formatPurchaseTime(historyDate)}</span>
                  </td>
                  <td class="package-history-amount" data-label="Amount">${formatAmount(item.total, item.currency)}</td>
                  <td data-label="Package">
                    <div class="package-history-package">
                      <strong>${escapeHTML(`${item.product} ${item.packageName}`)}</strong>
                      <span>${escapeHTML(item.billing)}</span>
                    </div>
                  </td>
                  <td data-label="Term"><span class="package-history-term">${escapeHTML(item.billingTerm)}</span></td>
                  <td class="package-history-status" data-label="Status">
                    <span class="package-history-status-badge ${status.className}"><i data-lucide="${status.icon}" aria-hidden="true"></i>${status.label}</span>
                  </td>
                  <td data-label="Transaction ID">
                    <code>${escapeHTML(item.transactionId)}</code>
                  </td>
                  <td class="package-history-action" data-label="Action">
                    <a class="package-history-action-link" href="${escapeHTML(packageBillingDetailHref(item))}" aria-label="${escapeHTML(`${actionLabel} ${item.invoiceNumber}`)}"><i data-lucide="file-text" aria-hidden="true"></i><span>${actionLabel}</span></a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  function getTabFromURL() {
    try {
      const tabId = new URL(window.location.href).searchParams.get('tab');
      return validTabIds.has(tabId) ? tabId : defaultTab;
    } catch (error) {
      return defaultTab;
    }
  }

  function updateTabURL(tabId, method) {
    if (!window.history || typeof window.history[method] !== 'function') return;
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history[method]({ packageTab: tabId }, '', url.href);
  }

  function activateTab(tabId, shouldFocus, shouldUpdateURL) {
    const activeTabId = validTabIds.has(tabId) ? tabId : defaultTab;
    if (packagePaymentModal && !packagePaymentModal.hidden) closePackagePaymentModal();
    if (packageTrialModal && !packageTrialModal.hidden) closePackageTrialModal();
    tabs.forEach((tab) => {
      const active = tab.dataset.packageTab === activeTabId;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (shouldFocus && active) tab.focus();
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.packagePanel !== activeTabId;
    });
    if (window.NEXORA_SHELL && typeof window.NEXORA_SHELL.setActiveTab === 'function') {
      window.NEXORA_SHELL.setActiveTab(activeTabId);
    }
    if (shouldUpdateURL) updateTabURL(activeTabId, 'pushState');
    return activeTabId;
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.packageTab, false, true));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      activateTab(tabs[nextIndex].dataset.packageTab, true, true);
    });
  });

  billingCycleButtons.forEach((button) => {
    button.addEventListener('click', () => activateBillingCycle(button.dataset.packageBillingCycle));
  });

  document.querySelectorAll('[data-nexora-select], [data-plan-select], [data-plan-trial]').forEach((button) => {
    button.addEventListener('click', () => {
      const details = getPackagePlanDetails(button);
      if (details?.trial) {
        openPackageTrialModal(button);
        return;
      }
      openPackagePaymentModal(button);
    });
  });

  if (packagePaymentModal) {
    packagePaymentModal.addEventListener('click', (event) => {
      if (event.target === packagePaymentModal || event.target.closest('[data-package-payment-close]')) {
        closePackagePaymentModal();
        return;
      }
      const paymentButton = event.target.closest('[data-package-payment]');
      if (paymentButton) {
        packagePaymentId = paymentButton.dataset.packagePayment;
        renderPackagePayment();
        return;
      }
      if (event.target.closest('[data-package-payment-confirm]')) confirmPackagePayment();
    });
  }

  if (packageTrialModal) {
    packageTrialModal.addEventListener('click', (event) => {
      if (event.target === packageTrialModal || event.target.closest('[data-package-trial-close]')) {
        closePackageTrialModal();
        return;
      }
      const toggle = event.target.closest('[data-trial-chip], [data-trial-day]');
      if (toggle) {
        toggle.classList.toggle('is-active');
        const error = packageTrialModal.querySelector('[data-package-trial-error]');
        if (error) error.textContent = '';
      }
    });
    const form = packageTrialModal.querySelector('[data-package-trial-form]');
    if (form) form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitPackageTrial();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (packagePaymentModal && !packagePaymentModal.hidden) {
      closePackagePaymentModal();
      return;
    }
    if (packageTrialModal && !packageTrialModal.hidden) closePackageTrialModal();
  });

  window.NEXORA_PACKAGE_SELECT_TAB = (tabId, options = {}) => {
    activateTab(tabId, Boolean(options.focus), options.updateURL !== false);
  };

  window.addEventListener('popstate', () => activateTab(getTabFromURL(), false, false));
  if (overview) overview.addEventListener('change', handleAutoRenewChange);

  activateBillingCycle(defaultBillingCycle);
  renderOverview();
  renderPurchaseHistory();
  activateTab(getTabFromURL(), false, false);
  window.setInterval(updateCountdowns, 1000);
})();
