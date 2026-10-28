/* Completed Services UI observed on Nexora staging, Oct 28, 2026. All changes stay in the existing local demo stores. */
(function () {
  'use strict';
  const root = document.querySelector('[data-completed-root]');
  if (!root) return;
  const demo = window.NEXORA_POS_DEMO, data = window.NEXORA_FRONT_DESK_DATA, esc = demo.esc;
  const keys = {direct:'nexora:direct-checkouts:v1',tickets:'nexora:front-desk-ticket-workspaces:v1'};
  const $ = selector => root.querySelector(selector);
  const detail = document.getElementById('completed-detail'), actionDialog = document.getElementById('completed-action');
  const actionForm = actionDialog.querySelector('form');
  const money = value => '$' + (Number(value || 0) / 100).toFixed(2);
  const icon = name => '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  const customerName = value => value === 'Demo customer A' ? 'Customer A' : String(value || '');
  const isPaid = t => !!t.payment && !t.cancelled && t.status !== 'cancelled' && (!t.splitBills?.bills?.length || t.splitBills.bills.every(b => b.payment));
  const canEdit = () => ['owner','manager','cashier'].includes(demo.account().role);
  let page = 1, rows = [], selected = null, activeTab = 'details', action = '', actionLine = -1, readError = false;
  let applied = {from:'',to:'',customer:'',phone:''};
  let trigger = null;
  const historyOpen = new Set();
  function load(source) {
    try {
      const saved = JSON.parse(localStorage.getItem(keys[source]) || (source === 'direct' ? '[]' : '{}'));
      if (source === 'direct') return Array.isArray(saved) ? saved.map(ticket => ({source,key:String(ticket.id),ticket})) : [];
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? Object.entries(saved).map(([key,ticket]) => ({source,key,ticket})) : [];
    } catch (_) { readError = true; return []; }
  }
  function visible(t) {
    const account = demo.account();
    return ['owner','manager','cashier'].includes(account.role) || account.role === 'technician' && [t.tech,...(t.lines || []).map(line => line.tech)].flatMap(value => String(value || '').split(',')).some(name => name.trim() === account.name);
  }
  const identity = record => record.source + ':' + record.key;
  function receiptUrl(record) {
    const url = new URL(record.source === 'direct' ? 'pos-direct-checkout.html' : 'pos-front-desk-tickets.html',location.href);
    url.searchParams.set(record.source === 'direct' ? 'checkoutId' : 'ticketId',record.key);
    if (record.source === 'tickets') url.searchParams.set('mode','checkout');
    return url.href;
  }
  const paidAt = ticket => ticket.payment.paidAt || ticket.completedAt || ticket.createdAt;
  function localDay(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function dateHTML(value) { return value && !Number.isNaN(new Date(value).getTime()) ? demo.timeHtml(value) : '—'; }
  function method(ticket) {
    const p = ticket.payment;
    return p.method === 'split-bills' ? 'Split bills' : demo.load().payment.methods.find(m => m.id === p.method)?.label || p.otherMethod || p.method || '—';
  }
  function serviceLines(ticket) { return ticket.lines?.length ? ticket.lines : (ticket.services || []).map(name => ({name,tech:ticket.tech,price:0})); }
  function technicians(ticket) { return Array.from(new Set([ticket.tech,...serviceLines(ticket).map(line => line.tech)].flatMap(value => String(value || '').split(',')).map(name => name.trim()).filter(Boolean))); }
  function render() {
    readError = false;
    const records = [...load('direct'),...load('tickets')].filter(record => record.ticket && isPaid(record.ticket) && visible(record.ticket));
    const query = applied.customer.toLowerCase(), phone = applied.phone.replace(/\D/g,'');
    rows = records.filter(({ticket}) => {
      const date = localDay(paidAt(ticket));
      return (!applied.from || date >= applied.from) && (!applied.to || date <= applied.to) && (!query || customerName(ticket.customer).toLowerCase().includes(query)) && (!phone || String(ticket.phone || '').replace(/\D/g,'').includes(phone));
    }).sort((a,b) => (Date.parse(paidAt(b.ticket)) || 0) - (Date.parse(paidAt(a.ticket)) || 0));
    page = Math.max(1,Math.min(page,Math.ceil(rows.length/10) || 1));
    $('[data-completed-error]').hidden = !readError;
    $('[data-completed-error]').textContent = readError ? 'Unable to read some saved checkouts. Reload this page to try again.' : '';
    $('[data-completed-empty]').hidden = rows.length > 0;
    $('[data-completed-results]').hidden = rows.length === 0;
    $('[data-completed-list]').innerHTML = rows.slice((page-1)*10,page*10).map(record => {
      const t = record.ticket;
      return '<tr><td><span class="cs-number">#' + esc(t.id) + '</span></td><td class="cs-customer">' + esc(customerName(t.customer)) + '</td><td class="cs-phone">' + esc(t.phone || '—') + '</td><td class="cs-completed-at">' + dateHTML(paidAt(t)) + '</td><td><div class="cs-chips">' + technicians(t).map(name => '<span class="cs-tech">' + esc(name) + '</span>').join('') + '</div></td><td><div class="cs-chips">' + serviceLines(t).map(line => '<span class="cs-service">' + esc(line.name) + '</span>').join('') + '</div></td><td><span class="cs-method">' + esc(method(t)) + '</span></td><td><strong class="cs-total">' + money(t.payment.totalCents) + '</strong></td><td><button type="button" class="cs-view" data-completed-view="' + esc(identity(record)) + '">' + icon('eye') + 'View</button></td></tr>';
    }).join('');
    $('[data-completed-pagination]').textContent = 'Page ' + page + ' of ' + (Math.ceil(rows.length/10) || 1) + ' — ' + rows.length + ' tickets';
    $('[data-completed-page="previous"]').disabled = page === 1;
    $('[data-completed-page="next"]').disabled = page*10 >= rows.length;
    window.lucide?.createIcons();
  }
  function setTab(next, focus = false) {
    activeTab = next;
    detail.querySelectorAll('[data-completed-tab]').forEach(button => {
      const active = button.dataset.completedTab === activeTab;
      button.setAttribute('aria-selected',String(active)); button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus();
    });
    document.getElementById('completed-details').hidden = activeTab !== 'details';
    document.getElementById('completed-history').hidden = activeTab !== 'history';
  }
  function editHistory(edits, empty) {
    return edits.length ? '<ol class="cs-history">' + edits.slice().reverse().map(edit => '<li><strong>' + esc(edit.label) + '</strong><p>' + esc(edit.reason || '') + '</p><small>' + dateHTML(edit.at) + ' · ' + esc(edit.by) + '</small>' + (edit.amountCents != null ? '<b>' + money(edit.amountCents) + '</b>' : '') + (edit.from ? '<p>' + esc(edit.from) + ' → ' + esc(edit.to) + '</p>' : '') + '</li>').join('') + '</ol>' : '<p class="cs-history-empty">' + empty + '</p>';
  }
  function detailHTML() {
    if (!selected) return;
    const t = selected.ticket, p = t.payment, edits = t.completedEdits || [];
    const fields = [['CUSTOMER',esc(customerName(t.customer))],['PHONE',esc(t.phone || 'Not provided')],['EMAIL',esc(t.email || 'Not provided')],['TICKET NUMBER','#' + esc(t.id)],['COMPLETED',dateHTML(paidAt(t))],['STATUS','<span class="cs-status">Completed</span>'],['PAYMENT METHOD',esc(method(t))]];
    detail.querySelector('[data-completed-details]').innerHTML = '<dl class="cs-detail-fields">' + fields.map(([label,value]) => '<div><dt>' + label + '</dt><dd>' + value + '</dd></div>').join('') + '</dl><div class="cs-ticket-actions">' + [['refund','Refund','rotate-ccw','cs-red'],['adjustment','Manual Adjustment (+)','plus','cs-green'],['tip','Edit Tip','hand-coins','cs-blue']].map(([id,label,symbol,color]) => '<button type="button" class="' + color + '" data-completed-action="' + id + '"' + (canEdit() && (id !== 'refund' || refundLimit(t) > 0) ? '' : ' disabled') + '>' + icon(symbol) + label + '</button>').join('') + '</div><h3 class="cs-section-label">SERVICES</h3><div class="cs-detail-services">' + serviceLines(t).map((line,index) => '<article class="cs-detail-service"><div class="cs-service-heading"><strong>' + esc(line.name) + '</strong><b>' + money(Math.round(Number(line.price || 0)*100)) + '</b></div><div class="cs-service-tech"><span>' + esc(line.tech || t.tech || '—') + '</span><button type="button" data-completed-action="technician" data-line="' + index + '"' + (canEdit() && t.lines?.[index] && !t.splitBills ? '' : ' disabled') + '>' + icon('user-round-cog') + 'Change technician</button></div><button type="button" class="cs-history-toggle" data-service-history="' + index + '" aria-expanded="' + historyOpen.has(index) + '">' + icon('history') + (historyOpen.has(index) ? 'Hide history' : 'Reassignment history') + '</button>' + (historyOpen.has(index) ? editHistory(edits.filter(edit => edit.action === 'technician' && edit.line === index),'This service has never been reassigned.') : '') + '</article>').join('') + '</div><div class="cs-totals">' + [['Services',p.netCents ?? p.subtotalCents ?? Number(p.totalCents)-Number(p.tipCents || 0)-Number(p.taxCents || 0)],['Sales tax',p.taxCents || 0],['Tip',p.tipCents || 0],['TOTAL',p.totalCents]].map(([label,value]) => '<div><span>' + label + '</span><strong>' + money(value) + '</strong></div>').join('') + '</div>';
    document.getElementById('completed-history').innerHTML = editHistory(edits,'This ticket has not been edited.');
    setTab(activeTab);
    window.lucide?.createIcons();
  }
  function openRecord(record, button) {
    selected = record; trigger = button; activeTab = 'details'; historyOpen.clear();
    detailHTML(); detail.showModal();
  }
  function input(label, name, value = '', extra = '') { return '<label class="cs-field"><span>' + label + '</span><input name="' + name + '" value="' + esc(value) + '" ' + extra + '></label>'; }
  const reason = () => '<label class="cs-field"><span>REASON (REQUIRED)</span><textarea name="reason" required></textarea></label>';
  const note = text => '<p class="cs-action-note">' + text + '</p>';
  function refundLimit(t) { return Math.max(0,Number(t.payment.totalCents || 0)-Number(t.payment.tipCents || 0)-(t.completedEdits || []).filter(edit => edit.action === 'refund').reduce((sum,edit) => sum + Number(edit.amountCents || 0),0)); }
  function amountField(max) { return input('AMOUNT','amount','','type="number" inputmode="decimal" min="0.01" step="0.01" required' + (max != null ? ' max="' + (max/100).toFixed(2) + '"' : '')); }
  function renderRefundFields() {
    const limit = refundLimit(selected.ticket);
    actionDialog.querySelector('[data-refund-fields]').innerHTML = amountField(limit) + note('Enter the amount to refund, up to ' + money(limit) + '. A partial refund is allowed — for example, when the service quality was poor.') + '<label class="cs-field"><span>REASON</span><select name="reason" required><option value="">Select a reason</option>' + ['Requested by customer','Duplicate payment','Service issue','Other'].map(value => '<option>' + value + '</option>').join('') + '</select></label><label class="cs-field"><span>NOTE (OPTIONAL)</span><textarea name="note"></textarea></label>' + note('Tip is never refunded. To change a tip, use Edit Tip.');
  }
  function openAction(next, line = -1) {
    if (!selected || !['sms','print'].includes(next) && !canEdit()) return;
    if (next === 'print') { window.print(); return; }
    if (next === 'refund' && refundLimit(selected.ticket) <= 0) return;
    action = next; actionLine = line;
    const t = selected.ticket, p = t.payment;
    let title = '', intro = '', body = '', submit = 'Continue';
    if (next === 'refund') {
      title = 'Refund'; intro = 'Card and gift card refunds go back automatically. Cash and wallet refunds are only recorded — the salon pays the customer back.';
      body = '<fieldset class="cs-refund-method"><legend>REFUND FROM</legend><label><input type="radio" name="refundMethod" value="' + esc(p.method) + '" required><span><strong>' + esc(method(t)) + '</strong><small>Record only — the salon pays the customer back</small><b>Up to ' + money(refundLimit(t)) + '</b></span></label></fieldset><div data-refund-fields></div>';
    } else if (next === 'adjustment') {
      title = 'Manual Adjustment (+)'; intro = 'Record extra money the salon has already collected from the customer.';
      body = amountField() + '<label class="cs-field"><span>COLLECTED VIA</span><select name="method" required><option value="">Select a method</option>' + ['Cash','Zelle','Cash App','Venmo','Apple Cash','PayPal'].map(value => '<option>' + value + '</option>').join('') + '</select></label>' + reason() + note('POS only records this amount — it does not charge the customer. Technician pay is not affected.');
    } else if (next === 'tip') {
      title = 'Edit Tip'; intro = 'Current tip: ' + money(p.tipCents);
      const names = technicians(t);
      body = input('TOTAL TIP','tip',(Number(p.tipCents || 0)/100).toFixed(2),'type="number" inputmode="decimal" min="0" step="0.01" required') + '<fieldset class="cs-tip-technicians"><legend>TIP PER TECHNICIAN</legend>' + names.map((name,index) => input(esc(name),'techTip'+index,(Number(p.tipAllocations?.[name] || 0)/100).toFixed(2),'type="number" inputmode="decimal" min="0" step="0.01" data-tip-name="' + esc(name) + '"' + (names.length === 1 ? ' readonly' : '') )).join('') + '</fieldset>' + reason() + note('Technician pay and tip records update to the new amounts.');
    } else if (next === 'technician') {
      const service = t.lines?.[line]; if (!service || t.splitBills) return;
      title = 'Change technician'; intro = service.name + ' — currently credited to ' + (service.tech || t.tech || '—'); submit = 'Confirm change';
      body = '<label class="cs-field"><span>NEW TECHNICIAN</span><select name="technician" required><option value=""></option>' + data.technicians().filter(tech => tech.active !== false && tech.name !== service.tech).map(tech => '<option>' + esc(tech.name) + '</option>').join('') + '</select></label>' + reason() + note('Service revenue, the tip for this service and any discount cost move to the new technician. Weekly pay and reports update immediately.');
    } else if (next === 'sms') {
      const digits = String(t.phone || '').replace(/\D/g,'');
      title = 'Send receipt to (•••) •••-' + digits.slice(-4); intro = 'Review the message and phone number before sending.'; submit = 'Send receipt';
      const url = receiptUrl(selected);
      body = '<p>' + esc(customerName(t.customer)) + '</p><div class="cs-message-preview"><strong>Message preview</strong><p>Thanks for visiting Bitcoin Nail Bar! Ticket #' + esc(t.id) + ': ' + (Number(p.totalCents || 0)/100).toFixed(2) + ' USD. Receipt: <a href="' + esc(url) + '">' + esc(url) + '</a></p></div>';
    }
    actionDialog.querySelector('#completed-action-title').textContent = title;
    actionDialog.querySelector('[data-completed-action-intro]').textContent = intro;
    actionDialog.querySelector('[data-completed-action-body]').innerHTML = body;
    actionDialog.querySelector('[data-action-submit]').textContent = submit;
    actionDialog.querySelector('.cs-action-footer [data-action-close]').textContent = next === 'sms' ? 'Back to receipt' : 'Cancel';
    actionDialog.showModal();
    if (next === 'tip') balanceTip();
    updateSubmit(); window.lucide?.createIcons();
  }
  function balanceTip() {
    const inputs = Array.from(actionForm.querySelectorAll('[data-tip-name]'));
    const total = Math.round(Number(actionForm.elements.tip.value)*100), previous = inputs.map(input => Number(selected.ticket.payment.tipAllocations?.[input.dataset.tipName] || 0)), weight = previous.reduce((sum,value) => sum+value,0);
    let assigned = 0, running = 0;
    inputs.forEach((input,index) => { running += weight ? previous[index] : 1; const next = Math.round(total*running/(weight || inputs.length)); input.value = ((next-assigned)/100).toFixed(2); assigned = next; });
  }
  function updateSubmit() {
    const fields = Array.from(actionForm.querySelectorAll('input,select,textarea'));
    const tipInputs = Array.from(actionForm.querySelectorAll('[data-tip-name]'));
    const balanced = action !== 'tip' || !tipInputs.length || tipInputs.reduce((sum,input) => sum+Math.round(Number(input.value)*100),0) === Math.round(Number(actionForm.elements.tip.value)*100);
    actionForm.querySelector('[data-action-submit]').disabled = !fields.every(field => field.checkValidity() && (!field.required || field.type === 'radio' || field.value.trim())) || !balanced || action === 'refund' && !actionForm.querySelector('[name="amount"]');
  }
  function persistEdit(values) {
    const latest = load(selected.source).find(record => record.key === selected.key);
    if (!latest || !isPaid(latest.ticket) || !visible(latest.ticket)) { actionDialog.close(); detail.close(); render(); return; }
    const t = structuredClone(latest.ticket), p = t.payment;
    const edit = {action,label:actionDialog.querySelector('h2').textContent,reason:String(values.get('reason') || values.get('note') || ''),by:demo.account().name,at:new Date().toISOString(),simulated:true};
    if (action === 'refund' || action === 'adjustment') {
      const amount = Math.round(Number(values.get('amount'))*100);
      if (!Number.isSafeInteger(amount) || amount <= 0 || action === 'refund' && amount > refundLimit(t)) return;
      edit.amountCents = amount; edit.method = values.get('method') || values.get('refundMethod'); edit.note = values.get('note') || '';
    } else if (action === 'tip') {
      const tip = Math.round(Number(values.get('tip'))*100);
      if (!Number.isSafeInteger(tip) || tip < 0) return;
      const allocations = Object.fromEntries(Array.from(actionForm.querySelectorAll('[data-tip-name]')).map(input => [input.dataset.tipName,Math.round(Number(input.value)*100)]));
      if (Object.keys(allocations).length && Object.values(allocations).reduce((sum,value) => sum+value,0) !== tip) return;
      edit.amountCents = tip; p.totalCents = Number(p.totalCents) - Number(p.tipCents || 0) + tip; p.tipCents = tip; p.tipAllocations = allocations;
      if (t.splitBills?.bills?.length) {
        const bills = t.splitBills.bills, oldTips = bills.map(bill => Number(bill.payment.tipCents || 0)), totalTips = oldTips.reduce((sum,value) => sum+value,0);
        let running = 0, allocated = 0;
        bills.forEach((bill,index) => {
          running += totalTips ? oldTips[index] : 1;
          const next = Math.round(tip*running/(totalTips || bills.length)), amount = next-allocated;
          allocated = next;
          bill.payment.totalCents = Number(bill.payment.totalCents)-oldTips[index]+amount;
          bill.payment.tipCents = amount;
          const lines = (t.lines || []).filter(line => t.splitBills.mode === 'amount' || t.splitBills.assignments?.[line.id] === bill.id);
          bill.payment.tipAllocations = demo.allocateTip(lines,amount,'equal');
        });
      }
    } else if (action === 'technician') {
      const line = t.lines?.[actionLine], name = String(values.get('technician') || '');
      if (!line || !data.technicians().some(tech => tech.name === name && tech.active !== false)) return;
      edit.line = actionLine; edit.from = line.tech || ''; edit.to = name;
      const previous = line.tech, oldLines = t.lines.filter(row => row.tech === previous), total = oldLines.reduce((sum,row) => sum+Number(row.price || 0),0);
      if (p.tipAllocations?.[previous]) { const share = Math.round(p.tipAllocations[previous]*(total ? Number(line.price || 0)/total : 1/oldLines.length)); p.tipAllocations[previous] -= share; p.tipAllocations[name] = Number(p.tipAllocations[name] || 0)+share; }
      line.tech = name; t.tech = Array.from(new Set(t.lines.flatMap(row => String(row.tech || '').split(',').map(value => value.trim()).filter(Boolean)))).join(', ');
    } else if (action === 'sms') { edit.label = 'SMS'; }
    t.completedEdits = [...(t.completedEdits || []),edit];
    const saved = JSON.parse(localStorage.getItem(keys[latest.source]) || (latest.source === 'direct' ? '[]' : '{}'));
    if (latest.source === 'direct') { const index = saved.findIndex(row => String(row.id) === latest.key); if (index < 0) return; saved[index] = t; }
    else saved[latest.key] = t;
    localStorage.setItem(keys[latest.source],JSON.stringify(saved));
    selected = {...latest,ticket:t}; actionDialog.close(); render(); detailHTML();
    window.dispatchEvent(new CustomEvent('nexora:front-desk-data-changed',{detail:{ticketId:data.keyOf(t)}}));
  }
  $('[data-completed-filters]').addEventListener('submit',event => { event.preventDefault(); applied = Object.fromEntries(new FormData(event.currentTarget)); page = 1; render(); });
  root.addEventListener('change',event => {
    if (event.target.type !== 'date') return;
    const input = event.target, value = input.value;
    root.querySelector('[data-date-display="' + input.name + '"]').textContent = value ? new Date(value+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : input.name === 'from' ? 'From' : 'To';
    const form = $('[data-completed-filters]'); form.elements.to.min = form.elements.from.value; form.elements.from.max = form.elements.to.value;
  });
  root.addEventListener('click',event => {
    const view = event.target.closest('[data-completed-view]'), pager = event.target.closest('[data-completed-page]');
    if (view) { const record = rows.find(record => identity(record) === view.dataset.completedView); if (record) openRecord(record,view); }
    if (pager && !pager.disabled) { page += pager.dataset.completedPage === 'next' ? 1 : -1; render(); }
  });
  detail.addEventListener('click',event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.hasAttribute('data-completed-close')) detail.close();
    if (button.dataset.completedTab) setTab(button.dataset.completedTab);
    if (button.dataset.completedAction) openAction(button.dataset.completedAction,Number(button.dataset.line ?? -1));
    if (button.hasAttribute('data-service-history')) { const index = Number(button.dataset.serviceHistory); historyOpen.has(index) ? historyOpen.delete(index) : historyOpen.add(index); detailHTML(); detail.querySelector('[data-service-history="'+index+'"]').focus(); }
  });
  detail.querySelector('.cs-tabs').addEventListener('keydown',event => { if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); setTab(event.key === 'Home' ? 'details' : event.key === 'End' ? 'history' : activeTab === 'details' ? 'history' : 'details',true); });
  detail.addEventListener('close',() => {
    if (actionDialog.open) actionDialog.close();
    const key = selected && identity(selected); selected = null;
    const target = trigger?.isConnected ? trigger : Array.from(root.querySelectorAll('[data-completed-view]')).find(button => button.dataset.completedView === key);
    target?.focus();
  });
  actionDialog.querySelectorAll('[data-action-close]').forEach(button => button.addEventListener('click',() => actionDialog.close()));
  actionForm.addEventListener('change',event => { if (event.target.name === 'refundMethod') renderRefundFields(); updateSubmit(); });
  actionForm.addEventListener('input',event => { if (event.target.name === 'tip') balanceTip(); updateSubmit(); });
  actionForm.addEventListener('submit',event => { event.preventDefault(); if (!actionForm.reportValidity() || !selected || action !== 'sms' && !canEdit()) return; try { persistEdit(new FormData(actionForm)); } catch (_) { actionDialog.close(); $('[data-completed-error]').hidden = false; $('[data-completed-error]').textContent = 'Unable to read some saved checkouts. Reload this page to try again.'; } });
  function refresh() {
    render();
    if (!selected) return;
    const current = load(selected.source).find(record => record.key === selected.key && visible(record.ticket) && isPaid(record.ticket));
    if (!current) { detail.close(); return; }
    selected = current; detailHTML();
  }
  window.addEventListener('storage',event => { if (!event.key || Object.values(keys).includes(event.key)) refresh(); });
  window.addEventListener('focus',refresh);
  window.addEventListener('pageshow',event => { if (event.persisted) refresh(); });
  window.addEventListener('nexora:pos-account-changed',() => { if (actionDialog.open) actionDialog.close(); if (detail.open) detail.close(); render(); });
  window.addEventListener('nexora:pos-settings-changed',refresh);
  render();
})();
