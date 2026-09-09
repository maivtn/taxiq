(function () {
  'use strict';
  const host = document.querySelector('main.content.front-desk');
  if (!host || !window.NEXORA_TURN_SETTINGS) return;
  const defaults = [
    {id:'PED',code:'PED',name:'Pedicure',price:45},
    {id:'MANI',code:'MANI',name:'Manicure',price:28},
    {id:'GEL',code:'GEL',name:'Gel Polish',price:45},
    {id:'DIP',code:'DIP',name:'Dipping Powder',price:52},
    {id:'ACR-FS',code:'ACR-FS',name:'Acrylic Full Set',price:68},
    {id:'REF',code:'REF',name:'Refill',price:40},
    {id:'WAX',code:'WAX',name:'Waxing',price:15}
  ];
  const ids = defaults.map(service => service.id);
  const key = 'nexora:turn-board-services:v1:' + window.NEXORA_SALON_DATA.loadCatalog().salon.id;
  const copy = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  function validate(services) {
    if (!Array.isArray(services) || services.length !== ids.length || services.some((service,index) => !service || service.id !== ids[index])) return 'The service list is incomplete. Reopen Services and try again.';
    if (services.some(service => typeof service.code !== 'string' || !service.code.trim() || service.code.length > 12 || typeof service.name !== 'string' || !service.name.trim() || service.name.length > 80)) return 'Enter a symbol and name for every service.';
    if (new Set(services.map(service => service.code.trim().toUpperCase())).size !== services.length) return 'Use a different symbol for each service.';
    if (services.some(service => typeof service.price !== 'number' || !Number.isFinite(service.price) || service.price < 0)) return 'Enter a valid price of zero or greater for every service.';
    return '';
  }
  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem(key));
      if (stored?.version === 1 && !validate(stored.services)) return stored.services;
    } catch (_) {}
    return copy(defaults);
  }
  let services = load(), returnFocus = null;
  window.NEXORA_BOARD_SERVICES = {
    list: () => copy(services),
    get: id => {const service = services.find(item => item.id === id); return service ? copy(service) : null;},
    label: id => services.find(service => service.id === id)?.name || id,
    code: id => services.find(service => service.id === id)?.code || id
  };
  const styles = document.createElement('style');
  styles.textContent = '.board-services-modal .board-services-dialog{width:min(810px,100%)}.board-services-modal .board-services-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}.board-services-modal .board-services-heading h3{margin:0 0 6px}.board-services-modal .board-services-copy{margin:0 0 16px}.board-services-modal .board-services-close{padding:6px 10px;font-size:18px}.board-services-table-wrap{overflow:auto;border:1px solid #dbe4f3;border-radius:10px}.board-services-modal .board-services-table{min-width:620px;width:100%;border-collapse:collapse;white-space:normal}.board-services-modal .board-services-table th{padding:10px;font-size:10px;white-space:nowrap;text-align:left}.board-services-modal .board-services-table td{padding:9px;vertical-align:middle;text-align:left}.board-services-modal .board-services-table td:first-child{width:64px;color:#65738a;font-size:10px;font-weight:700}.board-services-modal .board-services-table td:nth-child(2){width:95px}.board-services-modal .board-services-table td:nth-child(4){width:110px}.board-services-modal .board-services-table td:last-child{width:75px;font-weight:700;color:#4c43df;white-space:nowrap}.board-services-modal .board-services-table input{width:100%;min-width:0;padding:9px 8px;font-size:12px;box-sizing:border-box}.board-services-modal .board-services-policy{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px;margin-top:14px;border:1px solid #e0dcfa;border-radius:9px;background:#f8f7ff}.board-services-modal .board-services-policy p{margin:0;flex:1;min-width:200px;font-size:11px}.board-services-modal .board-services-policy button{font-size:11px;white-space:nowrap}.board-services-modal .board-services-error{margin:12px 0 0;color:#bc3348;font-size:12px}.board-services-error:empty{display:none}.board-services-modal :focus-visible{outline:2px solid #8c80ee;outline-offset:2px}';
  document.head.append(styles);
  host.insertAdjacentHTML('beforeend', '<div class="modal-wrap board-services-modal" id="board-services-modal" role="dialog" aria-modal="true" aria-labelledby="board-services-title"><div class="modal board-services-dialog"><div class="board-services-heading"><div><h3 id="board-services-title">Services — symbols, turns &amp; prices</h3><p class="board-services-copy">Set service symbols and default prices for new turns.</p></div><button type="button" class="board-services-close" data-close-board-services aria-label="Close services">×</button></div><form id="board-services-form" novalidate><div class="board-services-table-wrap"><table class="board-services-table"><thead><tr><th>Service</th><th>Symbol</th><th>Name</th><th>Default price</th><th>Turns</th></tr></thead><tbody id="board-services-rows"></tbody></table></div><div class="board-services-policy"><p>Turns follow the shared weighted turn settings. Recorded turns keep their original credit.</p><button type="button" id="board-services-turn-settings">Weighted turn settings</button></div><p class="board-services-error" id="board-services-error" role="alert"></p><div class="modal-actions"><button type="button" data-close-board-services>Cancel</button><button class="btn primary" type="submit" id="board-services-save">Save services</button></div></form></div></div>');
  const modal = document.getElementById('board-services-modal');
  const rows = document.getElementById('board-services-rows');
  const error = document.getElementById('board-services-error');
  function refreshTurns() {
    rows.querySelectorAll('[data-board-service-id]').forEach(row => {
      const value = row.querySelector('[data-service-field="price"]').value.trim();
      const amount = value === '' ? NaN : Number(value);
      row.querySelector('[data-service-turn]').textContent = Number.isFinite(amount) && amount >= 0 ? window.NEXORA_TURN_SETTINGS.serviceCredit(amount) + 'T' : '—';
    });
  }
  function fillRows() {
    rows.innerHTML = services.map(service => '<tr data-board-service-id="' + service.id + '"><td>' + service.id + '</td><td><input data-service-field="code" aria-label="' + service.id + ' symbol" maxlength="12" value="' + esc(service.code) + '" required></td><td><input data-service-field="name" aria-label="' + service.id + ' name" maxlength="80" value="' + esc(service.name) + '" required></td><td><input data-service-field="price" aria-label="' + service.id + ' default price" type="number" min="0" step="0.01" value="' + service.price + '" required></td><td data-service-turn></td></tr>').join('');
    refreshTurns();
  }
  function populateAddTurn() {
    const select = document.getElementById('add-turn-service');
    if (!select) return;
    const selected = select.value;
    select.innerHTML = services.map(service => '<option value="' + service.id + '">' + esc(service.code) + ' · ' + esc(service.name) + '</option>').join('');
    select.value = ids.includes(selected) ? selected : 'PED';
  }
  function syncBoard() {
    if (typeof serviceLabels === 'object') services.forEach(service => {serviceLabels[service.id] = service.name;});
    populateAddTurn();
    if (typeof window.renderTurnBoard === 'function') window.renderTurnBoard();
  }
  function close() {modal.classList.remove('show'); error.textContent = ''; if (returnFocus?.isConnected) returnFocus.focus();}
  window.openBoardServices = function () {
    returnFocus = document.activeElement;
    fillRows(); error.textContent = ''; modal.classList.add('show');
    rows.querySelector('input').focus();
  };
  modal.querySelectorAll('[data-close-board-services]').forEach(button => button.addEventListener('click',close));
  rows.addEventListener('input', event => {if (event.target.matches('[data-service-field="price"]')) refreshTurns();});
  document.getElementById('board-services-form').addEventListener('submit', event => {
    event.preventDefault();
    const next = Array.from(rows.querySelectorAll('[data-board-service-id]'), row => ({
      id: row.dataset.boardServiceId,
      code: row.querySelector('[data-service-field="code"]').value.trim(),
      name: row.querySelector('[data-service-field="name"]').value.trim(),
      price: row.querySelector('[data-service-field="price"]').value.trim() === '' ? NaN : Number(row.querySelector('[data-service-field="price"]').value)
    }));
    error.textContent = validate(next); if (error.textContent) return;
    try {localStorage.setItem(key,JSON.stringify({version:1,services:next}));}
    catch (_) {error.textContent = 'Could not save services. Check browser storage and try again.'; return;}
    services = next; syncBoard(); close();
    if (typeof window.toast === 'function') window.toast('Service settings saved. New turns use the updated defaults.');
  });
  document.getElementById('board-services-turn-settings').addEventListener('click', () => {
    modal.classList.remove('show');
    if (typeof window.openTurnRules === 'function') {window.openTurnRules(); document.getElementById('booking-turn-credit')?.focus();}
  });
  modal.addEventListener('click', event => {if (event.target === modal) close();});
  modal.addEventListener('keydown', event => {
    if (event.key === 'Escape') {event.preventDefault(); close(); return;}
    if (event.key !== 'Tab') return;
    const controls = [...modal.querySelectorAll('button,input')].filter(control => !control.disabled), first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
  });
  function applyDefaultPrice() {
    const service = window.NEXORA_BOARD_SERVICES.get(document.getElementById('add-turn-service')?.value);
    if (!service) return;
    document.getElementById('add-turn-amount').value = String(service.price);
    if (typeof window.updateAddTurnPreview === 'function') window.updateAddTurnPreview();
  }
  const originalOpenAddTurn = window.openAddTurn;
  if (typeof originalOpenAddTurn === 'function') window.openAddTurn = function (...args) {
    populateAddTurn(); originalOpenAddTurn.apply(this,args); applyDefaultPrice();
  };
  document.getElementById('add-turn-service')?.addEventListener('change',applyDefaultPrice);
  window.NEXORA_TURN_SETTINGS.subscribe(refreshTurns);
  window.addEventListener('storage', event => {
    if ((event.key === key || event.key === null) && event.storageArea === localStorage) {services = load(); syncBoard();}
  });
  syncBoard();
})();
