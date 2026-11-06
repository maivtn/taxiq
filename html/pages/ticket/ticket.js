(() => {
  'use strict';

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
  const technicians = ['NEXORA_02', 'KIM', 'JADE', 'LEO', 'PHILIP', 'ANDY'];
  let nextId = 1;
  const line = (name, category, price, status = '', addons = [], custom = false) => ({ id: `line-${nextId++}`, name, category, price, status, addons: addons.map(([name, price]) => ({ name, price })), custom, discount: 0 });
  const state = {
    mode: new URLSearchParams(location.search).get('mode') === 'checkout' ? 'checkout' : 'edit',
    groups: [
      { id: 'unassigned', tech: '', lines: [line('Paris Pearl', 'Pedicure', 75)] },
      { id: 'nexora', tech: 'NEXORA_02', lines: [
        line('President 7 Star', 'Pedicure', 499, 'Completed', [['Hot Stone Massage Added on', 10]]),
        line('Paris Pearl', 'Pedicure', 75, 'Completed', [['Shellac Polish Change Hand', 25], ['Hot Stone Massage Added on', 10]]),
        line('President 7 Star', 'Pedicure', 499, 'In Service'),
        line('Bitcoin 24k Gold', 'Pedicure', 99, 'In Service'),
        line('test', '', 2, '', [], true),
      ] },
    ],
    activeGroup: 'unassigned', category: 'All', search: '', paymentMethod: null,
    receipt: 'No Receipt', tip: 0, tipType: 'amount', tipChoice: null,
    discountAll: false, showMore: false, collapsed: false, replacingLineId: null, addonTargetLineId: null,
  };
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = amount => `$${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const allLines = () => state.groups.flatMap(group => group.lines);
  const lineTotal = item => item.price + item.addons.reduce((sum, addon) => sum + addon.price, 0) - item.discount;
  const subtotal = () => allLines().reduce((sum, item) => sum + lineTotal(item), 0);
  const total = () => subtotal() + state.tip;
  const missingTech = () => state.groups.some(group => !group.tech && group.lines.length);
  const count = () => allLines().length + allLines().reduce((sum, item) => sum + item.addons.length, 0);
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

  function technicianOptions(selected) {
    return `<option value="">Select technician</option>${technicians.map(tech => `<option value="${escape(tech)}" ${selected === tech ? 'selected' : ''}>${escape(tech)}</option>`).join('')}`;
  }

  function renderGroups() {
    const serviceCount = allLines().filter(item => !item.custom).length;
    const customCount = allLines().filter(item => item.custom).length;
    const addons = allLines().reduce((sum, item) => sum + item.addons.length, 0);
    const techCount = state.groups.filter(group => group.tech && group.lines.length).length;
    $('service-count').textContent = `${techCount} tech · ${serviceCount} services${customCount ? ` · ${customCount} custom` : ''}${addons ? ` · ${addons} add-ons` : ''}`;
    $('technician-groups').hidden = state.collapsed;
    $('add-technician').hidden = state.collapsed;
    $('collapse-ticket').textContent = state.collapsed ? '⌄' : '⌃';
    $('collapse-ticket').setAttribute('aria-expanded', String(!state.collapsed));
    $('technician-groups').innerHTML = state.groups.map(group => {
      const groupTotal = group.lines.reduce((sum, item) => sum + lineTotal(item), 0);
      const rows = group.lines.map(item => {
        const status = item.status ? `<span class="status ${item.status === 'Completed' ? 'completed' : 'in-service'}">${escape(item.status)}</span>` : '';
        const name = item.custom ? `<div class="custom-inputs"><input aria-label="Custom service name" data-custom-name="${item.id}" value="${escape(item.name)}"><span>$</span><input aria-label="Custom service price" data-custom-price="${item.id}" inputmode="decimal" value="${item.price}"></div>` : `<span class="ticket-line-name">${escape(item.category)} · ${escape(item.name)}</span>${status}`;
        const change = item.custom ? '' : `<button type="button" class="purple" data-change-service="${item.id}">Change service</button><button type="button" class="purple" data-add-on="${item.id}">+ Add-On</button>`;
        return `<div class="ticket-line" data-line="${item.id}"><div class="ticket-line-head"><div><span class="main-badge">Main services</span>${name}</div><strong class="ticket-line-price">${money(item.price)}</strong></div><div class="line-actions"><select aria-label="Assign technician to ${escape(item.name)}" data-line-tech="${item.id}">${technicianOptions(group.tech)}</select>${change}<button type="button" class="purple" data-add-custom="${group.id}">+ Custom</button><button type="button" class="yellow" data-discount="${item.id}">${item.discount ? 'Undo discount' : 'Discount'}</button><button type="button" class="danger" data-remove-line="${item.id}">Remove</button></div>${item.addons.map((addon, index) => `<div class="add-on-line"><span>↳ ${escape(addon.name)}${item.discount ? '' : ''}</span><span>${money(addon.price)} <button type="button" data-remove-addon="${item.id}|${index}" aria-label="Remove ${escape(addon.name)}">×</button></span></div>`).join('')}</div>`;
      }).join('');
      return `<section class="technician-group ${state.activeGroup === group.id ? 'active' : ''}" data-group="${group.id}"><div class="group-heading"><label for="tech-${group.id}">Tech.</label><select id="tech-${group.id}" data-group-tech="${group.id}">${technicianOptions(group.tech)}</select><div class="group-subtotal">${group.lines.length} items<strong>${money(groupTotal)}</strong></div><button class="remove-group" type="button" data-remove-group="${group.id}" aria-label="Remove technician group">×</button></div><div class="group-body">${rows}<div class="group-actions"><button type="button" data-add-main="${group.id}">＋ Add main service</button><button type="button" data-add-custom="${group.id}">＋ Custom service</button></div></div></section>`;
    }).join('');
  }

  function previewSections() {
    return state.groups.filter(group => group.lines.length).map(group => `<div class="preview-group"><div class="preview-group-heading"><span>${group.tech ? `Tech. ${escape(group.tech)}` : 'Technician needed'}</span><span>${money(group.lines.reduce((sum, item) => sum + lineTotal(item), 0))}</span></div>${group.lines.map(item => `<div class="preview-item"><span>${item.custom ? escape(item.name) : `${escape(item.category)} · ${escape(item.name)}`}</span><strong>${money(item.price - item.discount)}</strong></div>${item.addons.map(addon => `<div class="preview-addon"><span>↳ ${escape(addon.name)}</span><strong>${money(addon.price)}</strong></div>`).join('')}`).join('')}</div>`).join('');
  }

  function renderPreview() {
    $('preview-count').textContent = `${count()} items · ${state.groups.filter(group => group.tech && group.lines.length).length} technician${state.groups.filter(group => group.tech && group.lines.length).length === 1 ? '' : 's'}`;
    $('preview-lines').innerHTML = previewSections();
    $('preview-total').textContent = money(subtotal());
  }

  const methods = [
    ['cash', 'Cash', 'cash.png'], ['card', 'Card', 'credit-debit-card-icon.png'],
    ['gift', 'Gift Card', 'gift_card.png'], ['crypto', 'Crypto', 'crypto.png'],
    ['split', 'Split Pay', 'split_pay.png'],
  ];
  function renderPayment() {
    $('payment-methods').innerHTML = methods.map(([id, label, icon]) => `<button type="button" data-method="${id}" class="${state.paymentMethod === id ? 'selected' : ''}" aria-pressed="${state.paymentMethod === id}"><img src="${asset}${icon}" alt="">${label}</button>`).join('') + `<button type="button" data-more="1" aria-expanded="${state.showMore}">··· More</button>`;
    $('payment-extra').hidden = !state.showMore;
    $('payment-extra').innerHTML = '<button type="button" data-method="other">Other</button>';
    $('receipt-choices').innerHTML = ['No Receipt', 'Send SMS', 'Print'].map(choice => `<button type="button" data-receipt="${choice}" class="${state.receipt === choice ? 'selected' : ''}" aria-pressed="${state.receipt === choice}">${choice}</button>`).join('');
    $('payment-lines').innerHTML = state.groups.filter(group => group.lines.length).map(group => `<div class="payment-group-label">${group.tech ? `Tech. ${escape(group.tech)}` : 'Technician needed'}</div>${group.lines.map(item => `<div class="payment-line"><span>${item.custom ? escape(item.name) : `${escape(item.category)} · ${escape(item.name)}`}</span><strong>${money(item.price - item.discount)}</strong></div>${item.addons.map(addon => `<div class="payment-line addon"><span>↳ ${escape(addon.name)}</span><strong>${money(addon.price)}</strong></div>`).join('')}`).join('')}`).join('');
    $('summary-tip').textContent = money(state.tip);
    $('summary-discount').textContent = money(allLines().reduce((sum, item) => sum + item.discount, 0));
    $('payment-total').textContent = money(total());
    $('discount-all').textContent = state.discountAll ? '↶ Undo discount all' : '◉ Discount all';
  }

  function renderAction() {
    const button = $('checkout-button');
    if (state.mode === 'edit') {
      button.textContent = `Checkout · ${money(subtotal())}`;
      button.disabled = !allLines().length;
      button.setAttribute('aria-disabled', String(missingTech()));
    } else {
      button.textContent = `Pay · ${money(total())}`;
      button.disabled = !state.paymentMethod || missingTech() || !allLines().length;
      button.setAttribute('aria-disabled', String(button.disabled));
    }
  }

  function render() {
    document.body.classList.toggle('checkout-mode', state.mode === 'checkout');
    $('back-button').querySelector('span').textContent = state.mode === 'checkout' ? 'Back to Edit' : 'Back';
    $('payment-area').hidden = state.mode !== 'checkout';
    renderCatalog(); renderGroups(); renderPreview(); renderPayment(); renderAction();
  }

  function setMode(mode) {
    state.mode = mode;
    if (mode === 'checkout') state.paymentMethod = null;
    const url = new URL(location.href); url.searchParams.set('mode', mode);
    history.replaceState({}, '', url);
    render();
    document.querySelector('.ticket-workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function addService(category, name) {
    const source = catalog.find(group => group.category === category);
    const item = source?.items.find(item => item[0] === name);
    if (!item) return;
    if (state.addonTargetLineId) {
      const found = findLine(state.addonTargetLineId);
      if (found) found.item.addons.push({ name, price: item[1] });
      state.addonTargetLineId = null; render(); return;
    }
    if (state.replacingLineId) {
      const found = findLine(state.replacingLineId);
      if (found) { found.item.name = name; found.item.category = category; found.item.price = item[1]; found.item.discount = 0; }
      state.replacingLineId = null; render(); return;
    }
    const group = findGroup(state.activeGroup) || state.groups[0];
    group.lines.push(line(name, category, item[1]));
    render();
  }
  function addCustom(groupId) {
    const group = findGroup(groupId); if (!group) return;
    const item = line('', '', 0, '', [], true);
    group.lines.push(item); state.activeGroup = groupId; render();
    document.querySelector(`[data-custom-name="${item.id}"]`)?.focus();
  }
  function assignGroup(groupId, tech) {
    const group = findGroup(groupId); if (!group) return;
    group.tech = tech; state.activeGroup = groupId; render();
  }
  function assignLine(id, tech) {
    const found = findLine(id); if (!found) return;
    const { group, item } = found;
    if (tech === group.tech) return;
    group.lines = group.lines.filter(line => line.id !== id);
    let target = state.groups.find(group => group.tech === tech);
    if (!target) { target = { id: `group-${nextId++}`, tech, lines: [] }; state.groups.push(target); }
    target.lines.push(item); state.activeGroup = target.id;
    if (!group.lines.length && group.id !== 'unassigned') state.groups = state.groups.filter(existing => existing.id !== group.id);
    render();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.category !== undefined) { state.category = button.dataset.category; renderCatalog(); return; }
    if (button.dataset.addService) { const [category, name] = button.dataset.addService.split('|'); addService(category, name); return; }
    if (button.dataset.addMain) { state.activeGroup = button.dataset.addMain; renderCatalog(); $('service-search').focus(); return; }
    if (button.dataset.addCustom) { addCustom(button.dataset.addCustom); return; }
    if (button.dataset.removeLine) { const found = findLine(button.dataset.removeLine); if (found) found.group.lines = found.group.lines.filter(line => line.id !== found.item.id); render(); return; }
    if (button.dataset.removeGroup) { state.groups = state.groups.filter(group => group.id !== button.dataset.removeGroup); if (!state.groups.length) state.groups.push({ id: `group-${nextId++}`, tech: '', lines: [] }); state.activeGroup = state.groups[0].id; render(); return; }
    if (button.dataset.removeAddon) { const [id, index] = button.dataset.removeAddon.split('|'); const found = findLine(id); if (found) found.item.addons.splice(Number(index), 1); render(); return; }
    if (button.dataset.addOn) { state.addonTargetLineId = button.dataset.addOn; state.replacingLineId = null; state.category = 'Additional'; renderCatalog(); $('service-search').focus(); return; }
    if (button.dataset.changeService) { state.replacingLineId = button.dataset.changeService; state.addonTargetLineId = null; state.category = 'All'; renderCatalog(); $('service-search').focus(); return; }
    if (button.dataset.method) { state.paymentMethod = button.dataset.method; renderPayment(); renderAction(); return; }
    if (button.dataset.more) { state.showMore = !state.showMore; renderPayment(); return; }
    if (button.dataset.receipt) { state.receipt = button.dataset.receipt; renderPayment(); return; }
    if (button.dataset.tipType) { state.tipType = button.dataset.tipType; state.tipChoice = null; renderTipValues(); return; }
    if (button.dataset.tipValue) { state.tipChoice = Number(button.dataset.tipValue); renderTipValues(); return; }
    if (button.id === 'add-technician') { const group = { id: `group-${nextId++}`, tech: '', lines: [] }; state.groups.push(group); state.activeGroup = group.id; render(); document.querySelector(`[data-group-tech="${group.id}"]`)?.focus(); return; }
    if (button.id === 'collapse-ticket') { state.collapsed = !state.collapsed; renderGroups(); return; }
    if (button.id === 'back-button') { if (state.mode === 'checkout') setMode('edit'); return; }
    if (button.id === 'checkout-button') { if (state.mode === 'edit') { if (missingTech()) { state.collapsed = false; renderGroups(); const group = state.groups.find(group => !group.tech && group.lines.length); document.querySelector(`[data-group-tech="${group.id}"]`)?.focus(); } else setMode('checkout'); } else if (!button.disabled) { $('confirm-method').textContent = `Payment method: ${methods.find(method => method[0] === state.paymentMethod)?.[1] || 'Other'}`; $('confirm-total').textContent = money(total()); $('confirm-dialog').showModal(); } return; }
    if (button.id === 'add-tip') { state.tipType = 'amount'; state.tipChoice = state.tip || null; renderTipValues(); $('tip-dialog').showModal(); return; }
    if (button.id === 'close-tip') { $('tip-dialog').close(); return; }
    if (button.id === 'hand-to-customer') { const facing = $('tip-dialog').classList.toggle('customer-facing'); button.textContent = facing ? 'Back to staff' : 'Hand to customer'; $('customer-tip-title').hidden = !facing; return; }
    if (button.id === 'save-tip') { const input = $('tip-values').querySelector('input'); const value = input?.value ? Number(input.value) : state.tipChoice; if (!Number.isFinite(value) || value < 0) return; state.tip = state.tipType === 'percent' ? Math.round(subtotal() * value) / 100 : value; $('tip-dialog').close(); render(); return; }
    if (button.id === 'remove-tip') { state.tip = 0; $('tip-dialog').close(); render(); return; }
    if (button.id === 'print-ticket') { window.print(); return; }
    if (button.id === 'confirm-pay') { $('confirm-dialog').close(); return; }
    if (button.classList.contains('close-confirm')) { $('confirm-dialog').close(); return; }
  });
  document.addEventListener('change', event => {
    const field = event.target;
    if (field.dataset.groupTech) assignGroup(field.dataset.groupTech, field.value);
    if (field.dataset.lineTech) assignLine(field.dataset.lineTech, field.value);
    if (field.dataset.customName) { const found = findLine(field.dataset.customName); if (found) found.item.name = field.value; renderPreview(); renderPayment(); }
    if (field.dataset.customPrice) { const found = findLine(field.dataset.customPrice); if (found) found.item.price = Math.max(0, Number(field.value) || 0); render(); }
  });
  $('service-search').addEventListener('input', event => { state.search = event.target.value; renderCatalog(); });
  $('tip-values').addEventListener('input', () => { state.tipChoice = null; updateTipSave(); });
  document.querySelectorAll('.front-tabs a').forEach(anchor => anchor.addEventListener('click', event => event.preventDefault()));
  document.querySelectorAll('.tab-arrow').forEach(button => button.addEventListener('click', () => document.querySelector('.front-tabs').scrollBy({ left: button.getAttribute('aria-label').startsWith('Next') ? 220 : -220, behavior: 'smooth' })));

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

  render();
})();
