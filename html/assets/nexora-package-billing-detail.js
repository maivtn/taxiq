(function () {
  'use strict';

  const billingRecords = Array.isArray(window.NEXORA_PACKAGE_BILLING_RECORDS)
    ? window.NEXORA_PACKAGE_BILLING_RECORDS
    : [];
  const root = document.querySelector('[data-billing-detail-root]');
  const paymentModal = document.querySelector('[data-billing-payment-modal]');
  const shell = document.querySelector('.shell');
  let paymentOpener = null;
  let paymentPreviousOverflow = '';
  let shellHadInert = false;

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character]));
  }

  function formatMoney(value, currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(value));
  }

  function formatDateTime(value) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  function downloadName(path) {
    return String(path || '').split('/').pop();
  }

  function findBillingRecord(transactionId) {
    return billingRecords.find((record) => record.transactionId === transactionId) || null;
  }

  function statusDetails(record) {
    if (record.paymentStatus === 'paid') return { label: 'Paid', className: 'is-paid' };
    if (record.paymentStatus === 'overdue') return { label: 'Overdue', className: 'is-overdue' };
    return { label: 'Payment due', className: 'is-payment-due' };
  }

  function renderDownloadAction(path, label, icon) {
    if (!path) {
      return `
        <span class="billing-detail-action-group">
          <span class="billing-detail-action is-disabled" role="link" aria-disabled="true">
            <i data-lucide="${icon}" aria-hidden="true"></i>
            <span>${escapeHTML(label)}</span>
          </span>
          <span class="billing-detail-action-note" role="status">Document is not available yet</span>
        </span>
      `;
    }
    const filename = downloadName(path);
    return `
      <a class="billing-detail-action" href="${escapeHTML(path)}" download="${escapeHTML(filename)}" aria-label="${escapeHTML(`${label} ${filename}`)}">
        <i data-lucide="${icon}" aria-hidden="true"></i>
        <span>${label}</span>
      </a>
    `;
  }

  function renderEmailAction(record) {
    const paid = record.paymentStatus === 'paid';
    const action = paid ? 'resend' : 'reminder';
    const label = paid ? 'Resend email' : 'Send reminder';
    const icon = paid ? 'mail' : 'bell-ring';
    return `
      <button class="billing-detail-action" type="button" data-billing-email-action="${action}" data-billing-transaction="${escapeHTML(record.transactionId)}" aria-label="${escapeHTML(`${label} for invoice ${record.invoiceNumber}`)}">
        <i data-lucide="${icon}" aria-hidden="true"></i>
        <span>${label}</span>
      </button>
    `;
  }

  function renderLineItems(record) {
    return `
      <div class="billing-detail-table-wrap">
        <table class="billing-detail-table">
          <caption class="visually-hidden">Billing line items</caption>
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col">Qty</th>
              <th scope="col">Unit price</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${record.lineItems.map((item) => `
              <tr>
                <td data-label="Description"><strong>${escapeHTML(item.description)}</strong>${item.period ? `<span>${escapeHTML(item.period)}</span>` : ''}</td>
                <td data-label="Qty">${escapeHTML(item.quantity)}</td>
                <td data-label="Unit price">${formatMoney(item.unitPrice, record.currency)}</td>
                <td data-label="Amount"><strong>${formatMoney(item.amount, record.currency)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderTotals(record, paid) {
    const hasTaxRate = record.taxRate !== null && record.taxRate !== undefined;
    return `
      <dl class="billing-detail-totals">
        <div><dt>Subtotal</dt><dd>${formatMoney(record.subtotal, record.currency)}</dd></div>
        <div><dt>Total excluding tax</dt><dd>${formatMoney(record.subtotal, record.currency)}</dd></div>
        <div class="is-muted"><dt>${escapeHTML(record.taxLabel)}${hasTaxRate ? ` (${escapeHTML(record.taxRate)}%)` : ''}</dt><dd>${formatMoney(record.taxAmount, record.currency)}</dd></div>
        <div class="is-total"><dt>Total</dt><dd>${formatMoney(record.total, record.currency)}</dd></div>
        <div class="is-final"><dt>${paid ? 'Amount paid' : 'Amount due'}</dt><dd>${formatMoney(record.total, record.currency)}</dd></div>
      </dl>
    `;
  }

  function renderPaidBillingDetail(record) {
    const status = statusDetails(record);
    const method = record.paymentMethod || { brand: '', last4: '' };
    return `
      <article class="billing-detail-summary" aria-labelledby="billing-summary-title">
        <div class="billing-detail-summary-head">
          <span class="billing-detail-brand">NEXORA TOUCH</span>
          <span class="billing-detail-status ${status.className}">${status.label}</span>
        </div>
        <div class="billing-detail-summary-main">
          <div>
            <p class="billing-detail-eyebrow">Receipt from ${escapeHTML(record.seller.name)}</p>
            <h2 id="billing-summary-title">${formatMoney(record.total, record.currency)}</h2>
            <p class="billing-detail-date">Paid ${formatDateTime(record.datePaid)}</p>
          </div>
          <span class="billing-detail-document-icon" aria-hidden="true"><i data-lucide="receipt-text"></i></span>
        </div>
        <div class="billing-detail-actions" aria-label="Billing document actions">
          ${renderDownloadAction(record.invoiceFile, 'Download invoice', 'download')}
          ${renderDownloadAction(record.receiptFile, 'Download receipt', 'download')}
          ${renderEmailAction(record)}
        </div>
        <dl class="billing-detail-meta">
          <div><dt>Receipt number</dt><dd>${escapeHTML(record.receiptNumber)}</dd></div>
          <div><dt>Invoice number</dt><dd>${escapeHTML(record.invoiceNumber)}</dd></div>
          <div><dt>Payment method</dt><dd>${escapeHTML(method.brand)} <span class="billing-detail-card-dots">••••</span> ${escapeHTML(method.last4)}</dd></div>
          <div><dt>Processor</dt><dd>${escapeHTML(record.processor)}</dd></div>
          <div><dt>Transaction ID</dt><dd>${escapeHTML(record.transactionId)}</dd></div>
          <div><dt>Processor transaction ID</dt><dd>${escapeHTML(record.processorTransactionId)}</dd></div>
          <div><dt>Bill to</dt><dd>${escapeHTML(record.billTo.name)}<span>${escapeHTML(record.billTo.email)}</span></dd></div>
        </dl>
      </article>

      <article class="billing-detail-document" aria-labelledby="billing-document-title">
        <div class="billing-detail-document-head">
          <div>
            <span class="billing-detail-document-kicker">Paid document</span>
            <h2 id="billing-document-title">Receipt #${escapeHTML(record.receiptNumber)}</h2>
          </div>
          <span class="billing-detail-status ${status.className}">${status.label}</span>
        </div>
        ${renderLineItems(record)}
        ${renderTotals(record, true)}
        <p class="billing-detail-support">Questions? Contact <a href="mailto:${escapeHTML(record.seller.email)}">${escapeHTML(record.seller.email)}</a>.</p>
      </article>
    `;
  }

  function renderUnpaidBillingDetail(record) {
    const status = statusDetails(record);
    const overdueNotice = record.paymentStatus === 'overdue'
      ? '<div class="billing-detail-overdue-notice"><i data-lucide="triangle-alert" aria-hidden="true"></i><span>This invoice is overdue. Please complete payment to keep your services uninterrupted.</span></div>'
      : '';
    return `
      <article class="billing-detail-summary" aria-labelledby="billing-summary-title">
        <div class="billing-detail-summary-head">
          <span class="billing-detail-brand">NEXORA TOUCH</span>
          <span class="billing-detail-status ${status.className}">${status.label}</span>
        </div>
        <div class="billing-detail-summary-main">
          <div>
            <p class="billing-detail-eyebrow">Invoice from ${escapeHTML(record.seller.name)}</p>
            <h2 id="billing-summary-title">${formatMoney(record.total, record.currency)} due</h2>
            <p class="billing-detail-date">Due ${formatDate(record.dateDue)}</p>
          </div>
          <span class="billing-detail-document-icon" aria-hidden="true"><i data-lucide="file-text"></i></span>
        </div>
        ${overdueNotice}
        <div class="billing-detail-actions" aria-label="Invoice actions">
          ${renderDownloadAction(record.invoiceFile, 'Download invoice', 'download')}
          ${renderEmailAction(record)}
          <button class="billing-detail-action is-primary" type="button" data-billing-pay-now="${escapeHTML(record.transactionId)}"><i data-lucide="credit-card" aria-hidden="true"></i><span>Pay now</span></button>
        </div>
        <dl class="billing-detail-meta">
          <div><dt>Invoice number</dt><dd>${escapeHTML(record.invoiceNumber)}</dd></div>
          <div><dt>Date of issue</dt><dd>${formatDate(record.dateIssued)}</dd></div>
          <div><dt>Due date</dt><dd>${formatDate(record.dateDue)}</dd></div>
          <div><dt>Seller</dt><dd>${escapeHTML(record.seller.name)}<span>${escapeHTML(record.seller.email)}</span></dd></div>
          <div><dt>Bill to</dt><dd>${escapeHTML(record.billTo.name)}<span>${escapeHTML(record.billTo.email)}</span></dd></div>
          <div><dt>Billing term</dt><dd>${escapeHTML(record.billingTerm)}</dd></div>
        </dl>
      </article>

      <article class="billing-detail-document" aria-labelledby="billing-document-title">
        <div class="billing-detail-document-head">
          <div>
            <span class="billing-detail-document-kicker">Unpaid document</span>
            <h2 id="billing-document-title">Invoice #${escapeHTML(record.invoiceNumber)}</h2>
          </div>
          <span class="billing-detail-status ${status.className}">${status.label}</span>
        </div>
        ${renderLineItems(record)}
        ${renderTotals(record, false)}
      </article>
    `;
  }

  function renderNotFound() {
    return `
      <article class="billing-detail-empty" role="status">
        <span class="billing-detail-empty-icon"><i data-lucide="file-question" aria-hidden="true"></i></span>
        <h2>Billing record not found</h2>
        <p>The transaction link may be invalid or the billing record is no longer available.</p>
        <a class="billing-detail-action is-primary" href="nexora-packages.html?tab=history">Back to Package History</a>
      </article>
    `;
  }

  function renderBillingDetail(record) {
    if (!record) return renderNotFound();
    return record.paymentStatus === 'paid'
      ? renderPaidBillingDetail(record)
      : renderUnpaidBillingDetail(record);
  }

  function openBillingPayment(record, opener) {
    if (!paymentModal || !record || record.paymentStatus === 'paid') return;
    const summary = paymentModal.querySelector('[data-billing-payment-summary]');
    const closeButton = paymentModal.querySelector('[data-billing-payment-close]');
    paymentOpener = opener || null;
    paymentPreviousOverflow = document.body.style.overflow;
    if (summary) {
      summary.innerHTML = `
        <div>
          <span>Invoice</span>
          <strong>${escapeHTML(record.invoiceNumber)}</strong>
        </div>
        <div>
          <span>Package</span>
          <strong>${escapeHTML(record.packageName)}</strong>
        </div>
        <div class="is-total">
          <span>Amount due</span>
          <strong>${formatMoney(record.total, record.currency)}</strong>
        </div>
      `;
    }
    paymentModal.hidden = false;
    paymentModal.setAttribute('aria-hidden', 'false');
    if (shell) {
      shellHadInert = shell.hasAttribute('inert');
      shell.setAttribute('inert', '');
    }
    document.body.classList.add('billing-payment-open');
    document.body.style.overflow = 'hidden';
    if (closeButton) closeButton.focus();
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  function closeBillingPayment() {
    if (!paymentModal || paymentModal.hidden) return;
    paymentModal.hidden = true;
    paymentModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('billing-payment-open');
    document.body.style.overflow = paymentPreviousOverflow;
    if (shell && !shellHadInert) shell.removeAttribute('inert');
    shellHadInert = false;
    if (paymentOpener && typeof paymentOpener.focus === 'function') paymentOpener.focus();
    paymentOpener = null;
  }

  function trapBillingPaymentFocus(event) {
    if (!paymentModal || paymentModal.hidden || event.key !== 'Tab') return;
    const focusable = Array.from(paymentModal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (!paymentModal.contains || !paymentModal.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  }

  function showEmailActionConfirmation(record) {
    if (!record) return;
    const paid = record.paymentStatus === 'paid';
    const options = {
      icon: 'success',
      title: paid ? 'Email resent successfully' : 'Payment reminder sent successfully',
      text: paid
        ? `Billing documents were sent to ${record.billTo.email}.`
        : `A payment reminder was sent to ${record.billTo.email}.`,
      confirmButtonText: 'Done'
    };
    if (window.Swal && typeof window.Swal.fire === 'function') {
      window.Swal.fire(options);
      return;
    }
    if (typeof window.alert === 'function') window.alert(`${options.title}\n${options.text}`);
  }

  if (!root) return;
  const transactionId = new URLSearchParams(window.location.search).get('transaction') || '';
  root.innerHTML = renderBillingDetail(findBillingRecord(transactionId));

  root.addEventListener('click', (event) => {
    const target = event.target && typeof event.target.closest === 'function' ? event.target : null;
    const emailAction = target ? target.closest('[data-billing-email-action]') : null;
    if (emailAction) {
      showEmailActionConfirmation(findBillingRecord(emailAction.dataset.billingTransaction));
      return;
    }
    const opener = target ? target.closest('[data-billing-pay-now]') : null;
    if (opener) openBillingPayment(findBillingRecord(opener.dataset.billingPayNow), opener);
  });

  if (paymentModal) {
    paymentModal.addEventListener('click', (event) => {
      const closeControl = event.target && typeof event.target.closest === 'function'
        ? event.target.closest('[data-billing-payment-close]')
        : null;
      if (event.target === paymentModal || closeControl) closeBillingPayment();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && paymentModal && !paymentModal.hidden) {
      closeBillingPayment();
      return;
    }
    trapBillingPaymentFocus(event);
  });

  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
})();
