/* History and refund demo from the supplied card-report.html prototype. */
(function () {
  'use strict';
  const root = document.querySelector('[data-report-card]');
  if (!root) return;
  const $ = id => root.querySelector('#pcr-' + id);
  const PAGE_SIZE = 20;
  const BUSINESS_TIME_ZONE = 'America/Chicago';
  const money = cents => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(cents / 100);
  const dateOnly = new Intl.DateTimeFormat('en-CA', { timeZone:BUSINESS_TIME_ZONE, year:'numeric', month:'2-digit', day:'2-digit' });
  const dayLabel = new Intl.DateTimeFormat('en-US', { timeZone:BUSINESS_TIME_ZONE, month:'short', day:'numeric', year:'numeric' });
  const inputLabel = new Intl.DateTimeFormat('en-US', { month:'short', day:'numeric', year:'numeric' });
  const timeLabel = new Intl.DateTimeFormat('en-US', { timeZone:BUSINESS_TIME_ZONE, hour:'numeric', minute:'2-digit' });
  const dialog = $('refund-dialog');
  // Original fictional, completed orders. Amount includes tips; refunds exclude tips.
  const seedSpecs = [
    ['2026-10-28T00:45:00-05:00',1086,'Visa','4242',9600,1600,0,0],
    ['2026-10-27T18:12:00-05:00',1085,'Mastercard','5556',12500,2500,3000,0],
    ['2026-10-27T17:48:00-05:00',1084,'Amex','0005',7800,1300,6500,0],
    ['2026-10-27T17:22:00-05:00',1083,'Visa','1881',6000,1000,0,5000],
    ['2026-10-27T16:55:00-05:00',1082,'Discover','1117',10800,1800,0,0],
    ['2026-10-27T16:10:00-05:00',1081,'Visa','9021',5400,900,0,0],
    ['2026-10-27T15:40:00-05:00',1080,'Mastercard','8210',15000,2500,5000,0],
    ['2026-10-26T18:25:00-05:00',1079,'Visa','7788',8400,1400,0,0],
    ['2026-10-26T17:30:00-05:00',1078,'Amex','1009',7200,1200,6000,0],
    ['2026-10-26T16:45:00-05:00',1077,'Mastercard','5567',11400,1900,0,0],
    ['2026-10-26T15:20:00-05:00',1076,'Visa','3131',4800,800,0,0],
    ['2026-10-25T18:05:00-05:00',1075,'Discover','2226',9000,1500,0,0],
    ['2026-10-25T17:14:00-05:00',1074,'Visa','6124',6600,1100,2000,0],
    ['2026-10-25T15:50:00-05:00',1073,'Mastercard','0942',13200,2200,0,0],
    ['2026-10-24T18:32:00-05:00',1072,'Visa','4242',10200,1700,0,8500],
    ['2026-10-24T17:10:00-05:00',1071,'Amex','2014',18000,3000,0,0],
    ['2026-10-24T15:45:00-05:00',1070,'Visa','7734',4200,700,0,0],
    ['2026-10-23T18:00:00-05:00',1069,'Mastercard','9913',9600,1600,8000,0],
    ['2026-10-23T16:35:00-05:00',1068,'Discover','1221',12000,2000,0,0],
    ['2026-10-22T17:25:00-05:00',1067,'Visa','4242',7500,1250,0,0],
    ['2026-10-21T18:40:00-05:00',1066,'Mastercard','4189',14400,2400,4000,0],
    ['2026-10-20T17:10:00-05:00',1065,'Visa','2884',6000,1000,0,0],
    ['2026-10-18T16:55:00-05:00',1064,'Amex','0018',10800,1800,0,0],
    ['2026-10-15T17:15:00-05:00',1063,'Visa','3131',8400,1400,7000,0],
    ['2026-10-10T18:20:00-05:00',1062,'Discover','7783',13200,2200,0,0],
    ['2026-10-05T16:40:00-05:00',1061,'Mastercard','1108',5400,900,0,0]
  ];
  const payments = seedSpecs.map((s,i) => ({
    id:`demo-payment-${i+1}`, orderNumber:`POS-${s[1]}`, capturedAt:s[0],
    cardBrand:s[2], cardLast4:s[3], amountCents:s[4], tipAmountCents:s[5],
    refundedAmountCents:s[6], pendingCents:s[7]
  }));
  let pageNumber = 1, targetId = null, returnFocus = null, toastTimer = null;

  function salonDate(value) {
    const parts = Object.fromEntries(dateOnly.formatToParts(new Date(value)).map(part => [part.type,part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  function paymentDetails(payment) {
    const refundableCents = Math.max(0,payment.amountCents-payment.tipAmountCents-payment.refundedAmountCents-payment.pendingCents);
    const refundState = payment.pendingCents>0 ? 'Pending' : payment.refundedAmountCents>0 ? (refundableCents===0 ? 'Full' : 'Partial') : 'None';
    return { ...payment, refundableCents, refundState };
  }
  function filteredPayments() {
    return payments.map(paymentDetails).filter(payment => {
      const date = salonDate(payment.capturedAt);
      return date >= $('from').value && date <= $('to').value;
    }).sort((a,b) => new Date(b.capturedAt)-new Date(a.capturedAt));
  }
  function cardMarkup(payment) {
    const type = payment.cardBrand.toLowerCase();
    const label = type==='mastercard' ? '' : type==='amex' ? 'AMEX' : payment.cardBrand.toUpperCase();
    return `<div class="card-cell"><span class="card-mark ${type}" aria-hidden="true">${label}</span><span class="card-last" aria-label="${payment.cardBrand} ending in ${payment.cardLast4}">•••• ${payment.cardLast4}</span></div>`;
  }
  function statusMarkup(state) {
    const statuses = { Pending:['pending','Pending'], Partial:['partial','Partially refunded'], Full:['full','Fully refunded'] };
    if (state==='None') return '<span class="zero" aria-label="No refunds">—</span>';
    const [className,label] = statuses[state];
    return `<span class="badge ${className}">${label}</span>`;
  }
  function paymentRow(payment) {
    return `<tr>
      <td><div class="date-day">${dayLabel.format(new Date(payment.capturedAt))}</div><div class="date-time">${timeLabel.format(new Date(payment.capturedAt))}</div></td>
      <td class="order">${payment.orderNumber}</td><td>${cardMarkup(payment)}</td>
      <td class="num">${money(payment.amountCents)}</td>
      <td class="num ${payment.tipAmountCents?'':'zero'}">${money(payment.tipAmountCents)}</td>
      <td class="num ${payment.refundedAmountCents?'refund-value':'zero'}">${money(payment.refundedAmountCents)}</td>
      <td>${statusMarkup(payment.refundState)}</td>
      <td class="num">${payment.refundableCents>0 ? `<button type="button" class="btn refund-btn" data-refund="${payment.id}" aria-label="Refund ${payment.orderNumber}">Refund</button>` : '<span class="zero">—</span>'}</td>
    </tr>`;
  }
  function render() {
    root.querySelectorAll('[data-card-date-display]').forEach(display => {
      const value = $(display.dataset.cardDateDisplay).value;
      const [year,month,day] = value.split('-').map(Number);
      display.textContent = value ? inputLabel.format(new Date(year,month-1,day)) : '';
    });
    const valid = $('from').value && $('to').value && $('from').value <= $('to').value;
    $('range-error').hidden = !!valid;
    const items = valid ? filteredPayments() : [];
    $('count').textContent = items.length;
    const content = $('report-content');
    if (!valid) {
      content.innerHTML = '<div class="empty"><h2>Select a valid date range.</h2><p>Choose both dates, with From on or before To.</p></div>';
      return;
    }
    if (!items.length) {
      content.innerHTML = '<div class="empty"><div class="empty-icon"><img src="../assets/icon-oneqr/issue-2040-oneqr-credit-card-3d.png" alt="" aria-hidden="true"></div><h2>No card payments in this period.</h2><p>Try another date range to see more transactions.</p></div>';
      return;
    }
    const totalPages = Math.ceil(items.length/PAGE_SIZE);
    pageNumber = Math.max(1,Math.min(pageNumber,totalPages));
    const start = (pageNumber-1)*PAGE_SIZE, rows = items.slice(start,start+PAGE_SIZE);
    content.innerHTML = `<div class="table-scroll" tabindex="0" role="region" aria-label="Card payments, scroll horizontally on smaller screens">
      <table><caption>Captured card payments. Amounts are in US dollars.</caption>
        <thead><tr><th scope="col">Date</th><th scope="col">Order</th><th scope="col">Card</th><th scope="col" class="num">Amount</th><th scope="col" class="num">Tip</th><th scope="col" class="num">Refunded</th><th scope="col">Refund status</th><th scope="col" class="num">Actions</th></tr></thead>
        <tbody>${rows.map(paymentRow).join('')}</tbody>
      </table>
    </div><div class="table-foot">
      <span>Showing <strong>${start+1}–${start+rows.length}</strong> of <strong>${items.length}</strong> payments <span class="muted">· 20 per page</span></span>
      <nav class="pager" aria-label="Pagination">
        <button type="button" class="page-btn" data-card-page="${pageNumber-1}" aria-label="Previous page" ${pageNumber===1?'disabled':''}><svg aria-hidden="true" style="transform:rotate(180deg)"><use href="#pcr-i-chevron"/></svg></button>
        ${Array.from({length:totalPages},(_,i) => `<button type="button" class="page-btn ${i+1===pageNumber?'active':''}" data-card-page="${i+1}" aria-label="Page ${i+1}" ${i+1===pageNumber?'aria-current="page"':''}>${i+1}</button>`).join('')}
        <button type="button" class="page-btn" data-card-page="${pageNumber+1}" aria-label="Next page" ${pageNumber===totalPages?'disabled':''}><svg aria-hidden="true"><use href="#pcr-i-chevron"/></svg></button>
      </nav>
    </div>`;
  }
  function openRefund(id,button) {
    const original = payments.find(payment => payment.id===id);
    if (!original) return;
    const payment = paymentDetails(original);
    if (!payment.refundableCents) return;
    targetId = id; returnFocus = button;
    $('refund-form').reset();
    $('refund-error').hidden = true;
    $('note-label').textContent = 'Note (optional)';
    $('refund-note').required = false;
    $('refund-subtitle').textContent = `Order ${payment.orderNumber} · ${payment.cardBrand} •••• ${payment.cardLast4}`;
    $('original-amount').textContent = money(payment.amountCents);
    $('already-refunded').textContent = money(payment.refundedAmountCents);
    $('available-refund').textContent = money(payment.refundableCents);
    $('refund-amount').value = (payment.refundableCents/100).toFixed(2);
    $('refund-amount').max = (payment.refundableCents/100).toFixed(2);
    $('amount-help').textContent = `Up to ${money(payment.refundableCents)} can be refunded. The ${money(payment.tipAmountCents)} tip stays with the technician.`;
    dialog.showModal();
    $('refund-amount').focus(); $('refund-amount').select();
  }
  function closeRefund() { dialog.close(); targetId = null; }
  function toast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message; $('toast').hidden = false;
    toastTimer = setTimeout(() => { $('toast').hidden = true; },4500);
  }
  root.addEventListener('click',event => {
    const refund = event.target.closest('[data-refund]');
    if (refund) { openRefund(refund.dataset.refund,refund); return; }
    const page = event.target.closest('[data-card-page]');
    if (page && !page.disabled) {
      pageNumber = Number(page.dataset.cardPage); render();
      $('report-content').querySelector('[aria-current="page"]')?.focus({preventScroll:true});
    }
  });
  ['from','to'].forEach(id => $(id).addEventListener('change',() => { pageNumber = 1; render(); }));
  $('refund-form').addEventListener('submit',event => {
    event.preventDefault();
    const payment = payments.find(item => item.id===targetId);
    if (!payment) return;
    const amount = Number($('refund-amount').value), cents = Math.round(amount*100), max = paymentDetails(payment).refundableCents;
    let error = '';
    if (!Number.isFinite(amount) || cents<=0 || cents>max || Math.abs(amount*100-cents)>.000001) {
      error = `Enter an amount between $0.01 and ${money(max)}, with up to two decimal places.`;
    } else if ($('refund-reason').value==='Other' && !$('refund-note').value.trim()) {
      error = 'Add a note when the reason is Other.';
    }
    if (error) { $('refund-error').textContent = error; $('refund-error').hidden = false; return; }
    payment.refundedAmountCents += cents;
    const notify = $('notify-customer').checked, id = payment.id;
    closeRefund(); render();
    const replacement = $('report-content').querySelector(`[data-refund="${id}"]`);
    (replacement || $('report-content').querySelector('.table-scroll'))?.focus({preventScroll:true});
    toast(`Demo refund of ${money(cents)} completed.${notify?' Email notice simulated.':''}`);
  });
  $('refund-reason').addEventListener('change',() => {
    const other = $('refund-reason').value==='Other';
    $('note-label').textContent = other ? 'Note (required)' : 'Note (optional)';
    $('refund-note').required = other;
  });
  ['close-refund','cancel-refund'].forEach(id => $(id).addEventListener('click',closeRefund));
  dialog.addEventListener('click',event => {
    if (event.target!==dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom) closeRefund();
  });
  dialog.addEventListener('close',() => {
    targetId = null;
    if (!root.hidden && returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  });
  window.NEXORA_POS_CARD_REPORT = {
    show() { root.hidden = false; },
    hide() {
      root.hidden = true;
      if (dialog.open) closeRefund();
      clearTimeout(toastTimer); $('toast').hidden = true;
    }
  };
  render();
})();
