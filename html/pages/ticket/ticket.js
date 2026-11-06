(() => {
  'use strict';

  const initialParams = new URLSearchParams(location.search);
  const initialMode = initialParams.get('orderMode') || initialParams.get('mode');
  const asset = '../../assets/pos-payment/';
  const catalog = [
    { category: 'Pedicure', items: [['President 7 Star', 499, 70], ['Bitcoin 24k Gold', 99, 75], ['Paris Pearl', 75, 60], ['Milk and Honey', 55, 45], ['Classic Pedicure', 40, 30]] },
    { category: 'Manicure', items: [['Milk & Honey', 50, 30], ['Gel Shellac Manicure', 45, 30], ['Deluxe Manicure', 35, 30], ['Classic Manicure', 25, 30]] },
    { category: "Kid's Menu", items: [['Pedicure', 25, 30], ['Manicure', 15, 30], ['Regular Polish on Nails', 10, 30], ['Regular Polish on Toes', 10, 30]] },
    { category: 'Acrylic Nail Service', items: [['Acrylic Full Set', 60, 60], ['Acrylic Fill', 45, 45]] },
    { category: 'Dipping Nail', items: [['Dipping Powder', 55, 45], ['Dipping with Tips', 65, 60]] },
    { category: 'Builder Gel Service', items: [['Builder Gel Full Set', 70, 60], ['Builder Gel Fill', 50, 45]] },
    { category: 'Additional', items: [['Hot Stone Massage Added on', 10, 10], ['Shellac Polish Change Hand', 25, 20]] },
    { category: 'Waxing Services', items: [['Eyebrow Wax', 15, 15], ['Lip Wax', 10, 10]] },
  ];
  const technicians = [
    { name: 'JADE', nextTurn: true },
    { name: 'ANDY', level: 'Level 1' },
    { name: 'KIM', level: 'Level 1' },
    { name: 'LEO' },
    { name: 'NEXORA_02' },
    { name: 'PHILIP' },
  ];
  const chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  let nextId = 1;
  const line = (name, category, price, status = '', addons = [], custom = false) => ({ id: `line-${nextId++}`, name, category, price, status, addons: addons.map(([name, price]) => ({ name, price, discount: 0, custom: false })), custom, discount: 0 });
  const state = {
    mode: initialMode === 'checkout' ? 'checkout' : 'edit',
    groups: [
      { id: 'andy', tech: 'ANDY', lines: [
        line('Paris Pearl', 'Pedicure', 75, '', [['Hot Stone Massage Added on', 10]]),
        line('test', '', 2, '', [], true),
      ] },
      { id: 'nexora', tech: 'NEXORA_02', lines: [
        line('President 7 Star', 'Pedicure', 499, 'Completed', [['Shellac Polish Change Hand', 25]]),
        line('test', '', 2, '', [], true),
      ] },
    ],
    activeGroup: 'andy', category: 'All', search: '', paymentMethod: null, hasPendingChanges: true,
    receipt: 'No Receipt', tip: 0, tipType: 'amount', tipChoice: null,
    discountAll: false, showMore: false, collapsed: false, replacingLineId: null, addonTargetLineId: null, pendingRemoveLineId: null,
    addServicesGroupId: null, addServicesTargetLineId: null, addServicesCategoryIndex: 0, addServicesSearch: '', addServicesQuantities: {},
    changeServiceId: null, changeServiceCategoryIndex: 0, changeServiceSearch: '',
    discountTarget: null, discountType: 'amount', discountValue: null,
  };
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = amount => `$${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const moneyCompact = amount => `$${Number(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  const allLines = () => state.groups.flatMap(group => group.lines);
  const filled = item => !item.custom || Boolean(item.name.trim());
  const visibleLines = group => group.lines.filter(filled);
  const visibleAddons = item => filled(item) ? item.addons.filter(filled) : [];
  const lineTotal = item => filled(item) ? item.price - item.discount + visibleAddons(item).reduce((sum, addon) => sum + addon.price - (addon.discount || 0), 0) : 0;
  const subtotal = () => allLines().reduce((sum, item) => sum + lineTotal(item), 0);
  const total = () => subtotal() + state.tip;
  const missingTech = () => state.groups.some(group => !group.tech && group.lines.some(filled));
  const count = () => allLines().filter(filled).length + allLines().reduce((sum, item) => sum + visibleAddons(item).length, 0);
  const findLine = id => { for (const group of state.groups) { const item = group.lines.find(line => line.id === id); if (item) return { group, item }; } return null; };
  const findGroup = id => state.groups.find(group => group.id === id);

  function renderCatalog() {
    document.querySelector('.catalog-card').classList.toggle('selecting-service', Boolean(state.replacingLineId || state.addonTargetLineId));
    $('category-list').innerHTML = ['All', ...catalog.map(group => group.category)].map(category => `<button type="button" data-category="${escape(category)}" class="${category === state.category ? 'active' : ''}" aria-pressed="${category === state.category}">${escape(category)}</button>`).join('');
    const query = state.search.trim().toLowerCase();
    const sections = catalog.filter(group => state.category === 'All' || group.category === state.category).map(group => {
      const items = group.items.filter(item => !query || item[0].toLowerCase().includes(query) || group.category.toLowerCase().includes(query));
      if (!items.length) return '';
      return `<section><div class="service-category-title">${escape(group.category.toUpperCase())}</div><div class="service-grid">${items.map(([name, price, duration]) => `<button class="service-tile" type="button" data-add-service="${escape(group.category)}|${escape(name)}"><strong>${escape(name)}</strong><em>${money(price)}</em><small>${duration} min</small><b aria-hidden="true">+</b></button>`).join('')}</div></section>`;
    }).join('');
    $('service-list').innerHTML = sections;
  }

  let techMenu = null;
  function closeTechMenu() {
    if (!techMenu) return;
    techMenu.trigger.setAttribute('aria-expanded', 'false');
    techMenu.element.remove();
    techMenu = null;
  }
  function openTechMenu(trigger, kind, id, selected) {
    closeTechMenu();
    const element = document.createElement('div');
    element.className = 'tech-option-menu';
    element.setAttribute('role', 'listbox');
    element.setAttribute('aria-label', 'Technicians');
    element.innerHTML = technicians.map(technician => `<button type="button" role="option" data-tech-choice="${technician.name}" aria-selected="${technician.name === selected}" class="${technician.name === selected ? 'selected' : ''} ${technician.nextTurn ? 'next-turn' : ''}"><span class="tech-option-top"><strong>${technician.name}</strong>${technician.nextTurn ? '<b>Next turn</b>' : ''}</span><span class="tech-option-meta">${technician.level ? `<em>${technician.level}</em>` : ''}<span>Today's Turns: 0T</span><span class="busy">busy now</span></span></button>`).join('');
    document.body.appendChild(element);
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 16);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    const above = window.innerHeight - rect.bottom < 330 && rect.top > 340;
    element.style.left = `${left}px`;
    element.style.top = `${above ? Math.max(8, rect.top - 324) : rect.bottom + 4}px`;
    element.style.width = `${width}px`;
    trigger.setAttribute('aria-expanded', 'true');
    techMenu = { element, trigger, kind, id };
  }

  function renderGroups() {
    closeTechMenu();
    const serviceCount = allLines().filter(filled).length;
    const addons = allLines().reduce((sum, item) => sum + visibleAddons(item).length, 0);
    const techCount = state.groups.filter(group => group.tech && visibleLines(group).length).length;
    $('service-count').textContent = `${techCount} tech${techCount === 1 ? '' : 's'} · ${serviceCount} services${addons ? ` · ${addons} add-ons` : ''}`;
    $('technician-groups').hidden = state.collapsed;
    $('add-technician').hidden = state.collapsed;
    $('collapse-ticket').textContent = state.collapsed ? '⌄' : '⌃';
    $('collapse-ticket').setAttribute('aria-expanded', String(!state.collapsed));
    $('technician-groups').innerHTML = state.groups.map(group => {
      const groupTotal = group.lines.reduce((sum, item) => sum + lineTotal(item), 0);
      const itemCount = group.lines.reduce((sum, item) => sum + (filled(item) ? 1 + visibleAddons(item).length : 0), 0);
      const rows = group.lines.map(item => {
        const status = item.status ? `<span class="status ${item.status === 'Completed' ? 'completed' : item.status === 'Unassigned' ? 'unassigned' : 'in-service'}">${escape(item.status)}</span>` : '';
        const head = item.custom
          ? `${status ? `<div class="ticket-line-head"><div>${status}</div></div>` : ''}<div class="custom-inputs"><input aria-label="Custom service name" data-custom-name="${item.id}" value="${escape(item.name)}"><label class="money-input"><span aria-hidden="true">$</span><input aria-label="Custom service price" data-custom-price="${item.id}" inputmode="decimal" placeholder="0" value="${item.price}"></label></div>`
          : `<div class="ticket-line-head"><div><span class="ticket-line-name">${escape(item.category)} · ${escape(item.name)}</span>${status}</div><strong class="ticket-line-price">${moneyCompact(item.price)}</strong></div>`;
        const change = `${item.status === 'Completed' ? '' : `<button type="button" class="purple" data-change-service="${item.id}">Edit</button>`}<button type="button" class="purple" data-add-on="${item.id}">+ Add-On</button>`;
        const needsTech = !group.tech || item.status === 'Unassigned';
        const techAction = `<button type="button" class="line-tech-trigger" data-line-tech="${item.id}" aria-haspopup="listbox" aria-expanded="false" aria-label="${needsTech ? 'Choose tech' : `Change technician for ${escape(group.tech)}`}">${needsTech ? 'Choose tech' : 'Change tech'}</button>`;
        return `<div class="ticket-line ${needsTech ? 'needs-tech' : ''}" data-line="${item.id}">${head}<div class="line-actions">${techAction}${change}<button type="button" class="purple" data-add-custom-addon="${item.id}">+ Custom</button><button type="button" class="yellow" data-discount="${item.id}">${item.discount ? 'Undo discount' : 'Discount'}</button><button type="button" class="danger" data-remove-line="${item.id}">Remove</button></div>${item.addons.map((addon, index) => `<div class="add-on-line ${addon.custom ? 'custom-addon' : ''}"><div>${addon.custom ? `<div class="custom-addon-inputs"><span>↳</span><input aria-label="Custom add-on name" data-custom-addon-name="${item.id}|${index}" value="${escape(addon.name)}"><label class="money-input"><span aria-hidden="true">$</span><input aria-label="Custom add-on price" data-custom-addon-price="${item.id}|${index}" inputmode="decimal" placeholder="0" value="${addon.price}"></label></div>` : `<span>↳ ${escape(addon.name)}</span>`}<button type="button" class="addon-discount" ${filled(addon) ? `data-discount-addon="${item.id}|${index}"` : 'disabled'}>${addon.discount ? 'Undo discount' : 'Discount'}</button></div><span>${addon.custom ? '' : moneyCompact(addon.price - (addon.discount || 0))} <button type="button" data-remove-addon="${item.id}|${index}" aria-label="Remove ${escape(addon.name || 'custom add-on')}">×</button></span></div>`).join('')}</div>`;
      }).join('');
      const groupActions = group.tech ? `<div class="group-actions"><button type="button" data-add-main="${group.id}">＋ Add main service</button><button type="button" data-add-custom="${group.id}">＋ Custom service</button></div>` : '';
      return `<section class="technician-group ${state.activeGroup === group.id ? 'active' : ''}" data-group="${group.id}"><div class="group-heading"><span class="tech-label">Tech.</span><button type="button" class="group-tech-trigger" data-group-tech="${group.id}" aria-haspopup="listbox" aria-expanded="false" aria-label="${group.tech ? `Change technician for ${escape(group.tech)}` : 'Select technician'}"><span>${escape(group.tech || 'Select technician')}</span>${chevron}</button><div class="group-subtotal">${itemCount} item${itemCount === 1 ? '' : 's'}<strong>${money(groupTotal)}</strong></div><button class="remove-group" type="button" data-remove-group="${group.id}" aria-label="Remove technician group">×</button></div><div class="group-body">${rows}${groupActions}</div></section>`;
    }).join('');
  }

  function previewSections() {
    return state.groups.filter(group => visibleLines(group).length).map(group => {
      const itemCount = visibleLines(group).reduce((sum, item) => sum + 1 + visibleAddons(item).length, 0);
      const groupTotal = group.lines.reduce((sum, item) => sum + lineTotal(item), 0);
      return `<div class="preview-group"><div class="preview-group-heading"><span>${group.tech ? `Tech. ${escape(group.tech)}` : 'Technician needed'}</span><small>${itemCount} item${itemCount === 1 ? '' : 's'} &nbsp;·&nbsp; ${money(groupTotal)}</small></div>${visibleLines(group).map(item => `<div class="preview-item"><span>${item.custom ? escape(item.name) : `${escape(item.category)} · ${escape(item.name)}`}</span><strong>${money(item.price - item.discount)}</strong></div>${visibleAddons(item).map(addon => `<div class="preview-addon"><span>↳ ${escape(addon.name)}</span><strong>${money(addon.price - (addon.discount || 0))}</strong></div>`).join('')}`).join('')}</div>`;
    }).join('');
  }

  function renderPreview() {
    const technicianCount = state.groups.filter(group => group.tech && visibleLines(group).length).length;
    $('preview-count').textContent = `${count()} items · ${technicianCount} technician${technicianCount === 1 ? '' : 's'}`;
    $('preview-lines').innerHTML = previewSections();
    $('preview-total').textContent = money(subtotal());
  }

  const methods = [
    ['cash', 'Cash', 'cash.png'], ['card', 'Card', 'credit-debit-card-icon.png'],
    ['gift', 'Gift Card', 'gift_card.png'], ['crypto', 'Crypto', 'crypto.png'],
    ['split', 'Split Pay', 'split_pay.png'],
  ];
  const extraMethods = [
    ['zelle', 'Zelle', 'zelle.png'], ['cashapp', 'Cash App', 'cash-app.svg'],
    ['venmo', 'Venmo', 'venmo.png'], ['vlinkpay', 'VLINKPAY Wallet', 'vlinkpay-logo.png'],
  ];
  const removeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  function renderPayment() {
    $('payment-methods').innerHTML = methods.map(([id, label, icon]) => `<button type="button" data-method="${id}" class="${state.paymentMethod === id ? 'selected' : ''}" aria-pressed="${state.paymentMethod === id}"><img src="${asset}${icon}" alt="">${label}</button>`).join('') + `<button type="button" data-more="1" aria-expanded="${state.showMore}">··· ${state.showMore ? 'Less' : 'More'}</button>`;
    $('payment-extra').hidden = !state.showMore;
    $('payment-extra').innerHTML = extraMethods.map(([id, label, icon]) => `<button type="button" data-method="${id}" class="${state.paymentMethod === id ? 'selected' : ''}" aria-pressed="${state.paymentMethod === id}"><img src="${asset}${icon}" alt="">${label}</button>`).join('');
    $('receipt-choices').innerHTML = ['No Receipt', 'Send SMS', 'Print'].map(choice => `<button type="button" data-receipt="${choice}" class="${state.receipt === choice ? 'selected' : ''}" aria-pressed="${state.receipt === choice}">${choice}</button>`).join('');
    $('payment-lines').innerHTML = state.groups.filter(group => visibleLines(group).length).map(group => {
      const itemCount = visibleLines(group).reduce((sum, item) => sum + 1 + visibleAddons(item).length, 0);
      const groupTotal = group.lines.reduce((sum, item) => sum + lineTotal(item), 0);
      const heading = group.tech ? `<div class="payment-group-label"><strong>Tech. ${escape(group.tech)}</strong><span>${itemCount} items <span aria-hidden="true">·</span> ${money(groupTotal)}</span></div>` : '';
      const lines = visibleLines(group).map(item => {
        const name = item.custom ? `<strong>${escape(item.name)}</strong>` : `<span class="payment-category">${escape(item.category)} · </span><strong>${escape(item.name)}</strong>`;
        const remove = state.pendingRemoveLineId === item.id
          ? `<span class="payment-remove-confirm"><button type="button" data-confirm-payment-remove="${item.id}">Confirm remove</button><button type="button" data-cancel-payment-remove="1">Cancel</button></span>`
          : `<button class="payment-remove" type="button" data-payment-remove-line="${item.id}" aria-label="Remove ${escape(item.name)}">${removeIcon}</button>`;
        const main = `<div class="payment-line"><span class="payment-item-label">${name}</span><span class="payment-line-end"><strong>${money(item.price - item.discount)}</strong>${remove}</span></div>`;
        const addons = item.addons.map((addon, index) => ({ addon, index })).filter(({ addon }) => filled(addon)).map(({ addon, index }) => `<div class="payment-line addon"><span class="payment-item-label"><span class="addon-arrow" aria-hidden="true">↳</span><strong>${escape(addon.name)}</strong></span><span class="payment-line-end"><strong>${money(addon.price - (addon.discount || 0))}</strong><button class="payment-remove" type="button" data-payment-remove-addon="${item.id}|${index}" aria-label="Remove ${escape(addon.name)}">${removeIcon}</button></span></div>`).join('');
        return main + addons;
      }).join('');
      return `<div class="payment-summary-group">${heading}${lines}</div>`;
    }).join('');
    $('summary-tip').textContent = money(state.tip);
    $('summary-discount').textContent = money(allLines().reduce((sum, item) => sum + item.discount + visibleAddons(item).reduce((addonSum, addon) => addonSum + (addon.discount || 0), 0), 0));
    $('payment-total').textContent = money(total());
    $('discount-all').querySelector('span').textContent = state.discountAll ? 'Undo discount all' : 'Discount all';
  }

  function renderAction() {
    const button = $('checkout-button');
    $('preview-actions').hidden = state.mode !== 'edit';
    $('action-area').hidden = state.mode !== 'checkout';
    if (state.mode === 'edit') {
      const editButton = $('edit-primary-action');
      editButton.querySelector('span').textContent = state.hasPendingChanges ? 'Assign Services' : 'Checkout';
      editButton.querySelector('.assign-icon').hidden = !state.hasPendingChanges;
      editButton.querySelector('.checkout-icon').hidden = state.hasPendingChanges;
      editButton.classList.toggle('checkout-ready', !state.hasPendingChanges);
      editButton.disabled = !allLines().some(filled);
      editButton.setAttribute('aria-disabled', String(editButton.disabled || missingTech()));
    } else {
      button.textContent = `Pay · ${money(total())}`;
      button.disabled = !state.paymentMethod || missingTech() || !allLines().some(filled);
      button.setAttribute('aria-disabled', String(button.disabled));
    }
  }

  function render() {
    document.body.classList.toggle('checkout-mode', state.mode === 'checkout');
    $('back-button').querySelector('span').textContent = state.mode === 'checkout' ? 'Back to Edit' : 'Back';
    $('back-button').hidden = state.mode !== 'checkout';
    $('payment-area').hidden = state.mode !== 'checkout';
    renderCatalog(); renderGroups(); renderPreview(); renderPayment(); renderAction();
  }

  function setMode(mode) {
    state.mode = mode;
    if (mode === 'checkout') state.paymentMethod = null;
    if (mode === 'edit') state.collapsed = false;
    const url = new URL(location.href);
    url.searchParams.delete('mode');
    url.searchParams.set('orderMode', mode);
    history.pushState({ mode }, '', url);
    render();
    document.querySelector('.ticket-workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function clearTicketData() {
    state.groups = [];
    state.activeGroup = null;
    state.category = 'All';
    state.search = '';
    state.hasPendingChanges = false;
    state.paymentMethod = null;
    state.receipt = 'No Receipt';
    state.tip = 0;
    state.tipType = 'amount';
    state.tipChoice = null;
    state.discountAll = false;
    state.showMore = false;
    state.collapsed = false;
    state.replacingLineId = null;
    state.addonTargetLineId = null;
    state.pendingRemoveLineId = null;
    state.addServicesGroupId = null;
    state.addServicesTargetLineId = null;
    state.addServicesSearch = '';
    state.addServicesQuantities = {};
    state.changeServiceId = null;
    state.changeServiceSearch = '';
    state.discountTarget = null;
    state.discountValue = null;
    $('service-search').value = '';
    document.querySelector('.note-card textarea').value = '';
    document.querySelector('.reward-card input').value = '';
    if (state.mode === 'checkout') setMode('edit');
    else render();
  }

  function renderPrintPreview() {
    $('print-dialog').classList.remove('receipt-preview');
    $('print-dialog').querySelector('.print-dialog-header small').hidden = false;
    $('print-dialog-title').textContent = 'Print Ticket';
    $('print-now').textContent = 'Print Ticket';
    const groups = state.groups.filter(group => visibleLines(group).length);
    const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date()).replace(' at ', ' ');
    $('print-pages').innerHTML = groups.map((group, index) => `<article class="print-page"><div class="print-title">Ticket #1</div><div class="print-date">${escape(date)}</div><div class="print-customer">Customer: <strong>Mai test Upload Image 1</strong></div><div class="print-tech">${escape(group.tech || 'Technician needed')}</div>${visibleLines(group).map(item => `<div class="print-item"><span>${item.custom ? escape(item.name) : `${escape(item.category)} · ${escape(item.name)}`}</span><strong>${money(item.price - item.discount)}</strong></div>${visibleAddons(item).map(addon => `<div class="print-item print-addon"><span>↳ ${escape(addon.name)}</span><strong>${money(addon.price - (addon.discount || 0))}</strong></div>`).join('')}`).join('')}${group.tech === 'NEXORA_02' ? '<div class="print-note"><strong>NOTE</strong><p><b>Pedicure · President 7 Star:</b> Client requested a shorter finish</p></div>' : ''}<div class="print-page-number">${index + 1} / ${groups.length}</div></article>`).join('');
  }

  function renderReceiptPreview() {
    $('print-dialog').classList.add('receipt-preview');
    $('print-dialog').querySelector('.print-dialog-header small').hidden = true;
    $('print-dialog-title').textContent = 'Print preview';
    $('print-now').textContent = 'Print';
    const dateParts = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).formatToParts(new Date());
    const datePart = type => dateParts.find(part => part.type === type)?.value || '';
    const date = `${datePart('month')} ${datePart('day')}, ${datePart('year')} ${datePart('hour')}:${datePart('minute')} ${datePart('dayPeriod').toLowerCase()}`;
    const discount = allLines().filter(filled).reduce((sum, item) => sum + item.discount + visibleAddons(item).reduce((addonSum, addon) => addonSum + (addon.discount || 0), 0), 0);
    const groups = state.groups.filter(group => visibleLines(group).length);
    const services = groups.map(group => `<section class="receipt-tech"><h3>${escape(group.tech || 'Technician needed')}</h3>${visibleLines(group).map(item => `<div class="receipt-item"><span>${item.custom ? escape(item.name) : `${escape(item.category)} · ${escape(item.name)}`}</span><strong>${money(item.price)}</strong></div>${visibleAddons(item).map(addon => `<div class="receipt-item receipt-addon"><span>↳ ${escape(addon.name)}</span><strong>${money(addon.price)}</strong></div>`).join('')}`).join('')}</section>`).join('');
    $('print-pages').innerHTML = `<article class="print-page checkout-receipt"><h2>Receipt #1</h2><p class="receipt-date">${escape(date)}</p><div class="receipt-salon"><strong>Quan Salon</strong><span>10401 LA VITA CT SAN DIEGO, Houston, Texas 300000, US</span><span>(111) 111-1111</span></div><div class="receipt-customer"><span>Customer: MAI TEST UPLOAD IMAGE 1</span><span>Phone: ***-***-1111</span></div>${services}<div class="receipt-totals"><div><span>Subtotal</span><strong>${money(subtotal() + discount)}</strong></div>${discount ? `<div><span>Discount</span><strong>-${money(discount)}</strong></div>` : ''}${state.tip ? `<div><span>Tip</span><strong>${money(state.tip)}</strong></div>` : ''}<div class="receipt-grand-total"><span>Total</span><strong>${money(total())}</strong></div></div><p class="receipt-thanks">Thank you for visiting!</p></article>`;
  }

  function markPending() { state.hasPendingChanges = true; }

  function renderAddServices() {
    $('add-services-categories').innerHTML = catalog.map((group, index) => `<button type="button" data-modal-category="${index}" class="${index === state.addServicesCategoryIndex ? 'active' : ''}" aria-pressed="${index === state.addServicesCategoryIndex}">${escape(group.category)}</button>`).join('');
    const query = state.addServicesSearch.trim().toLowerCase();
    const group = catalog[state.addServicesCategoryIndex];
    const items = group.items.map(([name, price, duration], index) => ({ name, price, duration, index })).filter(item => !query || item.name.toLowerCase().includes(query));
    $('add-services-list').innerHTML = `<h3>${escape(group.category.toUpperCase())}</h3>${items.map(item => {
      const key = `${state.addServicesCategoryIndex}:${item.index}`;
      const quantity = state.addServicesQuantities[key] || 0;
      return `<div class="add-services-item ${quantity ? 'selected' : ''}" data-modal-item="${key}" role="button" tabindex="0" aria-label="${escape(item.name)}"><div><strong>${escape(item.name)}</strong><span>${money(item.price)} <small>${item.duration} min</small></span></div><div class="add-services-stepper"><button type="button" data-modal-quantity="${key}" data-delta="-1" aria-label="Decrease quantity: ${escape(item.name)}" ${quantity ? '' : 'disabled'}>−</button><output>${quantity}</output><button type="button" data-modal-quantity="${key}" data-delta="1" aria-label="Increase quantity: ${escape(item.name)}">+</button></div></div>`;
    }).join('')}`;
    const selected = Object.values(state.addServicesQuantities).reduce((sum, quantity) => sum + quantity, 0);
    $('add-services-selected').textContent = selected ? `${selected} selected` : '';
  }

  function changeAddServicesQuantity(key, delta) {
    state.addServicesQuantities[key] = Math.max(0, (state.addServicesQuantities[key] || 0) + delta);
    renderAddServices();
  }

  function openAddServices(groupId, targetLineId = null) {
    const group = findGroup(groupId);
    if (!group) return;
    state.activeGroup = groupId;
    state.addServicesGroupId = groupId;
    state.addServicesTargetLineId = targetLineId;
    state.addServicesCategoryIndex = targetLineId ? catalog.findIndex(source => source.category === 'Additional') : 0;
    state.addServicesSearch = '';
    state.addServicesQuantities = {};
    $('add-services-title').textContent = targetLineId ? `Add-ons — ${findLine(targetLineId)?.item.name || ''}` : 'Add Services';
    $('add-services-instructions').hidden = Boolean(targetLineId);
    $('save-add-services').textContent = targetLineId ? 'Add-On' : 'Add Services';
    $('close-add-services').setAttribute('aria-label', targetLineId ? 'Close add-ons' : 'Close');
    $('add-services-technician').textContent = `Tech. ${group.tech || 'Select technician'}`;
    $('add-services-search').value = '';
    renderAddServices();
    $('add-services-dialog').showModal();
  }

  function saveAddServices() {
    const group = findGroup(state.addServicesGroupId);
    if (!group) return;
    const target = state.addServicesTargetLineId ? findLine(state.addServicesTargetLineId)?.item : null;
    let added = 0;
    for (const [key, quantity] of Object.entries(state.addServicesQuantities)) {
      const [categoryIndex, itemIndex] = key.split(':').map(Number);
      const source = catalog[categoryIndex];
      const item = source?.items[itemIndex];
      if (!item) continue;
      for (let index = 0; index < quantity; index++) {
        if (target) target.addons.push({ name: item[0], price: item[1], discount: 0, custom: false });
        else group.lines.push(line(item[0], source.category, item[1]));
        added++;
      }
    }
    if (!added) return;
    $('add-services-dialog').close();
    state.addServicesGroupId = null;
    state.addServicesTargetLineId = null;
    markPending();
    render();
  }

  function renderChangeServices() {
    $('change-service-categories').innerHTML = catalog.map((group, index) => `<button type="button" data-change-category="${index}" class="${index === state.changeServiceCategoryIndex ? 'active' : ''}" aria-pressed="${index === state.changeServiceCategoryIndex}">${escape(group.category)}</button>`).join('');
    const source = catalog[state.changeServiceCategoryIndex];
    const query = state.changeServiceSearch.trim().toLowerCase();
    $('change-service-list').innerHTML = source.items.map(([name, price], index) => ({ name, price, index })).filter(item => !query || item.name.toLowerCase().includes(query)).map(item => `<div><span>${escape(item.name)} — ${money(item.price)}</span><button type="button" data-select-service="${state.changeServiceCategoryIndex}:${item.index}">Select</button></div>`).join('');
  }

  function openChangeService(id) {
    const found = findLine(id);
    if (!found) return;
    state.changeServiceId = id;
    state.changeServiceCategoryIndex = Math.max(0, catalog.findIndex(group => group.category === found.item.category));
    state.changeServiceSearch = '';
    $('change-service-search').value = '';
    $('change-service-title').textContent = `Change Service · ${found.item.name}`;
    renderChangeServices();
    $('change-service-dialog').showModal();
  }

  function renderDiscountValues() {
    document.querySelectorAll('[data-discount-type]').forEach(button => { button.classList.toggle('active', button.dataset.discountType === state.discountType); button.setAttribute('aria-pressed', String(button.dataset.discountType === state.discountType)); });
    const values = [5, 10, 15, 20, 25];
    $('discount-values').innerHTML = values.map(value => `<button type="button" data-discount-value="${value}" class="${state.discountValue === value ? 'active' : ''}">${state.discountType === 'amount' ? `$${value}` : `${value}%`}</button>`).join('') + `<label><span>${state.discountType === 'amount' ? '$' : '%'}</span><input id="discount-custom-value" type="number" min="0" inputmode="decimal" placeholder="Custom" aria-label="Value"></label>`;
    $('save-discount').disabled = state.discountValue === null;
  }

  function openDiscount(id, addonIndex = null) {
    const item = findLine(id)?.item;
    const target = addonIndex === null ? item : item?.addons[addonIndex];
    if (!target) return;
    state.discountTarget = { id, addonIndex };
    state.discountType = 'amount';
    state.discountValue = null;
    $('discount-title').textContent = `Discount — ${target.name}`;
    $('discount-original').textContent = `Original price ${money(target.price)}`;
    $('discount-reason').value = '';
    renderDiscountValues();
    $('discount-dialog').showModal();
  }

  function saveDiscount() {
    const { id, addonIndex } = state.discountTarget || {};
    const item = findLine(id)?.item;
    const target = addonIndex === null ? item : item?.addons[addonIndex];
    if (!target || state.discountValue === null) return;
    const amount = state.discountType === 'percent' ? target.price * state.discountValue / 100 : state.discountValue;
    target.discount = Math.min(target.price, Math.max(0, Math.round(amount * 100) / 100));
    $('discount-dialog').close();
    markPending(); render();
  }

  function addService(category, name) {
    const source = catalog.find(group => group.category === category);
    const item = source?.items.find(item => item[0] === name);
    if (!item) return;
    if (state.addonTargetLineId) {
      const found = findLine(state.addonTargetLineId);
      if (found) found.item.addons.push({ name, price: item[1] });
      state.addonTargetLineId = null; markPending(); render(); return;
    }
    if (state.replacingLineId) {
      const found = findLine(state.replacingLineId);
      if (found) { found.item.name = name; found.item.category = category; found.item.price = item[1]; found.item.custom = false; found.item.discount = 0; }
      state.replacingLineId = null; markPending(); render(); return;
    }
    let group = findGroup('unassigned');
    if (!group) { group = { id: 'unassigned', tech: '', lines: [] }; state.groups.unshift(group); }
    const added = line(name, category, item[1], 'Unassigned');
    group.lines.unshift(added);
    state.activeGroup = group.id;
    markPending();
    render();
    document.querySelector(`[data-line-tech="${added.id}"]`)?.focus();
  }
  function addCustom(groupId) {
    const group = findGroup(groupId); if (!group) return;
    const item = line('', '', 0, '', [], true);
    group.lines.push(item); state.activeGroup = groupId; markPending(); render();
    document.querySelector(`[data-custom-name="${item.id}"]`)?.focus();
  }
  function assignGroup(groupId, tech) {
    const group = findGroup(groupId); if (!group) return;
    if (group.id === 'unassigned') {
      const target = state.groups.find(existing => existing.id !== group.id && existing.tech === tech);
      if (target) {
        group.lines.forEach(item => { if (item.status === 'Unassigned') item.status = ''; });
        target.lines.unshift(...group.lines);
        state.groups = state.groups.filter(existing => existing.id !== group.id);
        state.activeGroup = target.id; markPending(); render(); return;
      }
      group.id = `group-${nextId++}`;
    }
    group.tech = tech;
    group.lines.forEach(item => { if (item.status === 'Unassigned') item.status = ''; });
    state.activeGroup = group.id; markPending(); render();
  }
  function assignLine(id, tech) {
    const found = findLine(id); if (!found) return;
    const { group, item } = found;
    if (tech === group.tech) return;
    group.lines = group.lines.filter(line => line.id !== id);
    if (item.status === 'Unassigned') item.status = '';
    let target = state.groups.find(group => group.tech === tech);
    if (!target) { target = { id: `group-${nextId++}`, tech, lines: [] }; state.groups.push(target); }
    if (group.id === 'unassigned') target.lines.unshift(item);
    else target.lines.push(item);
    state.activeGroup = target.id; markPending();
    if (!group.lines.length) state.groups = state.groups.filter(existing => existing.id !== group.id);
    render();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button?.dataset.techChoice) {
      const selection = techMenu;
      closeTechMenu();
      if (selection?.kind === 'group') assignGroup(selection.id, button.dataset.techChoice);
      if (selection?.kind === 'line') assignLine(selection.id, button.dataset.techChoice);
      return;
    }
    if (button?.dataset.groupTech) { const group = findGroup(button.dataset.groupTech); if (group) openTechMenu(button, 'group', group.id, group.tech); return; }
    if (button?.dataset.lineTech) { const found = findLine(button.dataset.lineTech); if (found) openTechMenu(button, 'line', found.item.id, found.group.tech); return; }
    closeTechMenu();
    const modalItem = event.target.closest('[data-modal-item]');
    if (modalItem && !button?.dataset.modalQuantity) { changeAddServicesQuantity(modalItem.dataset.modalItem, 1); return; }
    if (!button) return;
    if (button.dataset.category !== undefined) { state.category = button.dataset.category; renderCatalog(); return; }
    if (button.dataset.addService) { const [category, name] = button.dataset.addService.split('|'); addService(category, name); return; }
    if (button.dataset.addMain) { openAddServices(button.dataset.addMain); return; }
    if (button.dataset.modalCategory !== undefined) { state.addServicesCategoryIndex = Number(button.dataset.modalCategory); renderAddServices(); return; }
    if (button.dataset.modalQuantity) { changeAddServicesQuantity(button.dataset.modalQuantity, Number(button.dataset.delta)); return; }
    if (button.id === 'close-add-services') { $('add-services-dialog').close(); return; }
    if (button.id === 'save-add-services') { saveAddServices(); return; }
    if (button.dataset.changeCategory !== undefined) { state.changeServiceCategoryIndex = Number(button.dataset.changeCategory); renderChangeServices(); return; }
    if (button.dataset.selectService) { const [categoryIndex, itemIndex] = button.dataset.selectService.split(':').map(Number); const source = catalog[categoryIndex]; const item = source?.items[itemIndex]; const found = findLine(state.changeServiceId); if (item && found) { Object.assign(found.item, { name: item[0], category: source.category, price: item[1], custom: false, discount: 0 }); $('change-service-dialog').close(); markPending(); render(); } return; }
    if (button.id === 'change-to-custom') { const found = findLine(state.changeServiceId); if (found) { Object.assign(found.item, { name: '', category: '', price: 0, custom: true, discount: 0 }); $('change-service-dialog').close(); markPending(); render(); document.querySelector(`[data-custom-name="${found.item.id}"]`)?.focus(); } return; }
    if (button.id === 'close-change-service') { $('change-service-dialog').close(); return; }
    if (button.dataset.discountType) { state.discountType = button.dataset.discountType; state.discountValue = null; renderDiscountValues(); return; }
    if (button.dataset.discountValue) { state.discountValue = Number(button.dataset.discountValue); renderDiscountValues(); return; }
    if (button.id === 'close-discount') { $('discount-dialog').close(); return; }
    if (button.id === 'save-discount') { saveDiscount(); return; }
    if (button.dataset.addCustomAddon) { const found = findLine(button.dataset.addCustomAddon); if (found) { const index = found.item.addons.push({ name: '', price: 0, discount: 0, custom: true }) - 1; renderGroups(); document.querySelector(`[data-custom-addon-name="${found.item.id}|${index}"]`)?.focus(); } return; }
    if (button.dataset.addCustom) { addCustom(button.dataset.addCustom); return; }
    if (button.dataset.removeLine) { const found = findLine(button.dataset.removeLine); if (found) { found.group.lines = found.group.lines.filter(line => line.id !== found.item.id); if (found.group.id === 'unassigned' && !found.group.lines.length) state.groups = state.groups.filter(group => group.id !== 'unassigned'); } markPending(); render(); return; }
    if (button.dataset.removeGroup) { state.groups = state.groups.filter(group => group.id !== button.dataset.removeGroup); state.activeGroup = state.groups[0]?.id ?? null; markPending(); render(); return; }
    if (button.dataset.removeAddon) { const [id, index] = button.dataset.removeAddon.split('|'); const found = findLine(id); if (found) found.item.addons.splice(Number(index), 1); markPending(); render(); return; }
    if (button.dataset.discountAddon) { const [id, index] = button.dataset.discountAddon.split('|'); const addon = findLine(id)?.item.addons[Number(index)]; if (addon?.discount) { addon.discount = 0; markPending(); render(); } else openDiscount(id, Number(index)); return; }
    if (button.dataset.discount) { const item = findLine(button.dataset.discount)?.item; if (item?.discount) { item.discount = 0; markPending(); render(); } else openDiscount(button.dataset.discount); return; }
    if (button.dataset.paymentRemoveLine) { state.pendingRemoveLineId = button.dataset.paymentRemoveLine; renderPayment(); return; }
    if (button.dataset.confirmPaymentRemove) { const found = findLine(button.dataset.confirmPaymentRemove); if (found) { found.group.lines = found.group.lines.filter(line => line.id !== found.item.id); if (found.group.id === 'unassigned' && !found.group.lines.length) state.groups = state.groups.filter(group => group.id !== 'unassigned'); } state.pendingRemoveLineId = null; render(); return; }
    if (button.dataset.cancelPaymentRemove) { state.pendingRemoveLineId = null; renderPayment(); return; }
    if (button.dataset.paymentRemoveAddon) { const [id, index] = button.dataset.paymentRemoveAddon.split('|'); const found = findLine(id); if (found) found.item.addons.splice(Number(index), 1); render(); return; }
    if (button.dataset.addOn) { const found = findLine(button.dataset.addOn); if (found) openAddServices(found.group.id, found.item.id); return; }
    if (button.dataset.changeService) { openChangeService(button.dataset.changeService); return; }
    if (button.dataset.method) { state.paymentMethod = button.dataset.method; renderPayment(); renderAction(); return; }
    if (button.dataset.more) { state.showMore = !state.showMore; renderPayment(); return; }
    if (button.dataset.receipt) { state.receipt = button.dataset.receipt; renderPayment(); return; }
    if (button.dataset.tipType) { state.tipType = button.dataset.tipType; state.tipChoice = null; renderTipValues(); return; }
    if (button.dataset.tipValue) { state.tipChoice = Number(button.dataset.tipValue); renderTipValues(); return; }
    if (button.id === 'add-technician') { const group = { id: `group-${nextId++}`, tech: '', lines: [] }; state.groups.push(group); state.activeGroup = group.id; markPending(); render(); document.querySelector(`[data-group-tech="${group.id}"]`)?.focus(); return; }
    if (button.id === 'collapse-ticket') { state.collapsed = !state.collapsed; renderGroups(); return; }
    if (button.id === 'clear-data') { clearTicketData(); return; }
    if (button.id === 'back-button') { if (state.mode === 'checkout') setMode('edit'); return; }
    if (button.id === 'edit-primary-action') { if (missingTech()) { state.collapsed = false; renderGroups(); const group = state.groups.find(group => !group.tech && group.lines.some(filled)); document.querySelector(`[data-line-tech="${group.lines.find(filled).id}"]`)?.focus(); } else if (state.hasPendingChanges) { state.hasPendingChanges = false; renderAction(); } else setMode('checkout'); return; }
    if (button.id === 'checkout-button') { if (!button.disabled) { $('confirm-method').textContent = `Payment method: ${[...methods, ...extraMethods].find(method => method[0] === state.paymentMethod)?.[1] || 'Other'}`; $('confirm-total').textContent = money(total()); $('confirm-dialog').showModal(); } return; }
    if (button.id === 'add-tip') { state.tipType = 'amount'; state.tipChoice = state.tip || null; renderTipValues(); $('tip-dialog').showModal(); return; }
    if (button.id === 'close-tip') { $('tip-dialog').close(); return; }
    if (button.id === 'hand-to-customer') { const facing = $('tip-dialog').classList.toggle('customer-facing'); button.textContent = facing ? 'Back to staff' : 'Hand to customer'; $('customer-tip-title').hidden = !facing; return; }
    if (button.id === 'save-tip') { const input = $('tip-values').querySelector('input'); const value = input?.value ? Number(input.value) : state.tipChoice; if (!Number.isFinite(value) || value < 0) return; state.tip = state.tipType === 'percent' ? Math.round(subtotal() * value) / 100 : value; $('tip-dialog').close(); render(); return; }
    if (button.id === 'remove-tip') { state.tip = 0; $('tip-dialog').close(); render(); return; }
    if (button.id === 'print-ticket') { renderPrintPreview(); $('print-dialog').showModal(); return; }
    if (button.id === 'receipt-print-preview') { renderReceiptPreview(); $('print-dialog').showModal(); return; }
    if (button.classList.contains('close-print')) { $('print-dialog').close(); return; }
    if (button.id === 'print-now') { window.print(); return; }
    if (button.id === 'confirm-pay') { $('confirm-dialog').close(); return; }
    if (button.classList.contains('close-confirm')) { $('confirm-dialog').close(); return; }
  });
  document.addEventListener('change', event => {
    const field = event.target;
    if (field.dataset.customName) { const found = findLine(field.dataset.customName); if (found) found.item.name = field.value; markPending(); renderPreview(); renderPayment(); renderAction(); }
    if (field.dataset.customPrice) { const found = findLine(field.dataset.customPrice); if (found) found.item.price = Math.max(0, Number(field.value) || 0); markPending(); render(); }
    if (field.dataset.customAddonName) { const [id, index] = field.dataset.customAddonName.split('|'); const addon = findLine(id)?.item.addons[Number(index)]; if (addon) addon.name = field.value; markPending(); renderGroups(); renderPreview(); renderPayment(); renderAction(); }
    if (field.dataset.customAddonPrice) { const [id, index] = field.dataset.customAddonPrice.split('|'); const addon = findLine(id)?.item.addons[Number(index)]; if (addon) addon.price = Math.max(0, Number(field.value) || 0); markPending(); render(); }
  });
  $('service-search').addEventListener('input', event => { state.search = event.target.value; renderCatalog(); });
  $('add-services-search').addEventListener('input', event => { state.addServicesSearch = event.target.value; renderAddServices(); });
  $('change-service-search').addEventListener('input', event => { state.changeServiceSearch = event.target.value; renderChangeServices(); });
  $('discount-values').addEventListener('input', event => { if (event.target.id === 'discount-custom-value') { const value = Number(event.target.value); state.discountValue = event.target.value === '' || !Number.isFinite(value) || value < 0 ? null : value; $('save-discount').disabled = state.discountValue === null; } });
  $('tip-values').addEventListener('input', () => { state.tipChoice = null; updateTipSave(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeTechMenu();
    const modalItem = event.target.closest('[data-modal-item]');
    if (event.target === modalItem && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      const key = modalItem.dataset.modalItem;
      changeAddServicesQuantity(key, 1);
      document.querySelector(`[data-modal-item="${key}"]`)?.focus();
    }
  });
  window.addEventListener('resize', closeTechMenu);
  window.addEventListener('scroll', closeTechMenu);

  function updateTipSave() {
    const input = $('tip-values').querySelector('input');
    const amount = input?.value ? Number(input.value) : state.tipChoice;
    $('save-tip').disabled = amount === null || !Number.isFinite(amount) || amount < 0;
    if (state.tipType === 'percent' && amount !== null && Number.isFinite(amount)) { $('tip-calculated').hidden = false; $('tip-calculated').textContent = `Tip amount: ${money(Math.round(subtotal() * amount) / 100)}`; } else $('tip-calculated').hidden = true;
  }
  function renderTipValues() {
    document.querySelectorAll('[data-tip-type]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tipType === state.tipType)));
    const values = state.tipType === 'amount' ? [5, 10, 15, 20] : [10, 15, 18, 20];
    $('tip-values').innerHTML = values.map(value => `<button type="button" data-tip-value="${value}" aria-pressed="${state.tipChoice === value}">${state.tipType === 'amount' ? money(value).replace('.00', '') : `${value}%`}</button>`).join('') + `<label><span>${state.tipType === 'amount' ? '$' : '%'}</span><input type="number" min="0" step="0.01" inputmode="decimal" placeholder="Custom" aria-label="Custom tip ${state.tipType}"></label>`;
    $('remove-tip').hidden = !state.tip;
    updateTipSave();
  }

  const canonicalUrl = new URL(location.href);
  if (canonicalUrl.searchParams.get('orderMode') !== state.mode || canonicalUrl.searchParams.has('mode')) {
    canonicalUrl.searchParams.delete('mode');
    canonicalUrl.searchParams.set('orderMode', state.mode);
    history.replaceState({ mode: state.mode }, '', canonicalUrl);
  }
  window.addEventListener('popstate', () => {
    state.mode = new URLSearchParams(location.search).get('orderMode') === 'checkout' ? 'checkout' : 'edit';
    if (state.mode === 'checkout') state.paymentMethod = null;
    if (state.mode === 'edit') state.collapsed = false;
    render();
  });
  render();
})();
