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

const PURCHASE_HISTORY = [
  {
    transactionId: 'NXR-20260801-0003',
    purchasedAt: '2026-08-01T09:30:00+07:00',
    product: 'NEXORA',
    packageName: 'Professional Pro',
    billing: 'Monthly subscription',
    term: '1 month',
    validUntil: '2026-08-31T23:59:59+07:00',
    amount: 79,
    currency: 'USD'
  },
  {
    transactionId: 'NXR-20260701-0001',
    purchasedAt: '2026-07-01T09:30:00+07:00',
    product: 'NEXORA',
    packageName: 'Professional Pro',
    billing: 'Monthly subscription',
    term: '1 month',
    validUntil: '2026-07-31T23:59:59+07:00',
    amount: 79,
    currency: 'USD'
  },
  {
    transactionId: 'VMS-20260701-0002',
    purchasedAt: '2026-07-01T09:35:00+07:00',
    product: 'Voice + SMS',
    packageName: 'Pro',
    billing: 'Monthly subscription',
    term: '1 month',
    validUntil: '2026-07-31T23:59:59+07:00',
    amount: 199,
    currency: 'USD'
  }
];

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

  function getPackageHistoryStatus(validUntil, reference = new Date()) {
    const end = new Date(validUntil);
    const active = Number.isFinite(end.getTime()) && end >= new Date(reference);
    return active
      ? { label: 'Active', className: 'is-active', icon: 'circle-check' }
      : { label: 'Expired', className: 'is-expired', icon: 'circle-x' };
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
      <section class="products-billing-page package-products-overview" aria-labelledby="package-products-overview-title">
        <div class="products-billing-heading">
          <div class="products-billing-heading-copy">
            <span class="products-billing-kicker">Products &amp; Billing</span>
            <h1 id="package-products-overview-title">Manage every NEXORA product in one place.</h1>
            <p>Plans, usage and billing stay separate from daily operations.</p>
          </div>
        </div>

        <div class="products-summary-grid" aria-label="Products and billing summary">
          <article class="products-summary-card">
            <span>Active services</span>
            <strong>3</strong>
            <small>Across this salon</small>
          </article>
          <article class="products-summary-card">
            <span>Estimated monthly total</span>
            <strong>$377</strong>
            <small>Before taxes and usage</small>
          </article>
          <article class="products-summary-card">
            <span>Next invoice</span>
            <strong>Aug 17</strong>
            <small>Consolidated invoice</small>
          </article>
        </div>

        <div class="product-card-grid" aria-label="NEXORA products">
          <article class="product-card">
            <div class="product-card-top">
              <span class="product-icon"><i data-lucide="phone-call" aria-hidden="true"></i></span>
              <span class="product-status is-active">Active</span>
            </div>
            <h2>AI Phone</h2>
            <p>24/7 AI calls, appointment requests and SMS follow-up.</p>
            <div class="product-price">$199<span>/month</span></div>
            <div class="product-plan">Pro &middot; Aug 17, 2026</div>
            <div class="product-meter" aria-label="Voice minutes 842 of 1000">
              <span style="width: 84.2%"></span>
            </div>
            <div class="product-usage"><span>Voice minutes</span><strong>842 / 1,000</strong></div>
            <div class="product-actions">
              <button type="button">View usage</button>
              <button type="button">Manage plan</button>
            </div>
          </article>

          <article class="product-card">
            <div class="product-card-top">
              <span class="product-icon"><i data-lucide="percent" aria-hidden="true"></i></span>
              <span class="product-status is-trial">Trial</span>
            </div>
            <h2>Tax IQ</h2>
            <p>Automated sales-tax insights and filing preparation.</p>
            <div class="product-price">$0<span> during trial</span></div>
            <div class="product-plan">14-day trial &middot; Ends Jul 26, 2026</div>
            <div class="product-meter" aria-label="Reports analyzed 8 of 20">
              <span style="width: 40%"></span>
            </div>
            <div class="product-usage"><span>Reports analyzed</span><strong>8 / 20</strong></div>
            <div class="product-actions">
              <button type="button">View usage</button>
              <button type="button">Manage plan</button>
            </div>
          </article>

          <article class="product-card">
            <div class="product-card-top">
              <span class="product-icon"><i data-lucide="corner-up-left" aria-hidden="true"></i></span>
              <span class="product-status is-active">Active</span>
            </div>
            <h2>QR Tips &amp; Reviews</h2>
            <p>Collect tips and route happy guests to Google reviews.</p>
            <div class="product-price">$79<span>/month</span></div>
            <div class="product-plan">Growth &middot; Aug 17, 2026</div>
            <div class="product-meter" aria-label="QR scans 684 of 1000">
              <span style="width: 68.4%"></span>
            </div>
            <div class="product-usage"><span>QR scans</span><strong>684 / 1,000</strong></div>
            <div class="product-actions">
              <button type="button">View usage</button>
              <button type="button">Manage plan</button>
            </div>
          </article>

          <article class="product-card">
            <div class="product-card-top">
              <span class="product-icon"><i data-lucide="star" aria-hidden="true"></i></span>
              <span class="product-status is-muted">Not Activated</span>
            </div>
            <h2>Rewards</h2>
            <p>Bring customers back with points and targeted rewards.</p>
            <div class="product-price">$49<span>/month</span></div>
            <div class="product-plan">Not activated &middot; Available now</div>
            <div class="product-meter is-empty" aria-label="Members 0 of 500">
              <span style="width: 0%"></span>
            </div>
            <div class="product-usage"><span>Members</span><strong>0 / 500</strong></div>
            <div class="product-actions">
              <button type="button">View usage</button>
              <button class="is-primary" type="button">Explore product</button>
            </div>
          </article>

          <article class="product-card">
            <div class="product-card-top">
              <span class="product-icon"><i data-lucide="calendar-days" aria-hidden="true"></i></span>
              <span class="product-status is-active">Active</span>
            </div>
            <h2>Booking</h2>
            <p>Calendar, customer records and booking automation.</p>
            <div class="product-price">$99<span>/month</span></div>
            <div class="product-plan">Starter &middot; Aug 17, 2026</div>
            <div class="product-meter" aria-label="Appointments 286 of 500">
              <span style="width: 57.2%"></span>
            </div>
            <div class="product-usage"><span>Appointments</span><strong>286 / 500</strong></div>
            <div class="product-actions">
              <button type="button">View usage</button>
              <button type="button">Manage plan</button>
            </div>
          </article>
        </div>
      </section>
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
              <th scope="col">Valid Until</th>
              <th scope="col">Status</th>
              <th scope="col">Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            ${PURCHASE_HISTORY.map((item) => {
              const status = getPackageHistoryStatus(item.validUntil);
              return `
                <tr>
                  <td data-label="Date &amp; time">
                    <strong>${formatPurchaseDate(item.purchasedAt)}</strong>
                    <span>${formatPurchaseTime(item.purchasedAt)}</span>
                  </td>
                  <td class="package-history-amount" data-label="Amount">${formatAmount(item.amount, item.currency)}</td>
                  <td data-label="Package">
                    <div class="package-history-package">
                      <strong>${escapeHTML(`${item.product} ${item.packageName}`)}</strong>
                      <span>${escapeHTML(item.billing)}</span>
                    </div>
                  </td>
                  <td data-label="Term"><span class="package-history-term">${escapeHTML(item.term)}</span></td>
                  <td class="package-history-valid-until" data-label="Valid Until"><strong>${formatPurchaseDate(item.validUntil)}</strong></td>
                  <td class="package-history-status" data-label="Status">
                    <span class="package-history-status-badge ${status.className}"><i data-lucide="${status.icon}" aria-hidden="true"></i>${status.label}</span>
                  </td>
                  <td data-label="Transaction ID">
                    <code>${escapeHTML(item.transactionId)}</code>
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
