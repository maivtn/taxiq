/* Local Turn Board demo actions. Catalog, shared turn rules and handbooks have separate stores. */
(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const menu = $('#board-menu');
  const trigger = $('#board-menu-toggle');
  const storeKey = 'nexora:turn-board-demo:v1:' + window.NEXORA_SALON_DATA.loadCatalog().salon.id;
  let lastAction = null;
  let pendingChange = null;
  let changing = false;
  let demoMode = $('#peak-mode-toggle').value;

  function snapshot() {
    return structuredClone({tickets, technicians, nextTurnIndex, manualTurnAudit, turnEditAudit, demoMode});
  }
  function validSnapshot(value) {
    return value && Array.isArray(value.tickets) && Array.isArray(value.technicians)
      && Number.isInteger(value.nextTurnIndex) && ['normal', 'peak'].includes(value.demoMode)
      && Array.isArray(value.manualTurnAudit) && Array.isArray(value.turnEditAudit)
      && value.technicians.every(t => typeof t.name === 'string' && Array.isArray(t.codes)
        && t.codes.every(c => typeof c === 'string') && ['available','busy','paused','clocked-out'].includes(t.status)
        && ['turns','serviceCount','sales','minutes'].every(k => Number.isFinite(t[k]) && t[k] >= 0))
      && value.tickets.every(t => Number.isFinite(t.id) && typeof t.customer === 'string'
        && typeof t.tech === 'string' && Array.isArray(t.services) && t.services.every(s => typeof s === 'string')
        && (!t.boardServices || (Array.isArray(t.boardServices) && t.boardServices.every(s =>
          typeof s.id === 'string' && Number.isFinite(s.amount) && s.amount >= 0))));
  }
  function restore(value) {
    const data = structuredClone(value);
    tickets = data.tickets;
    technicians.splice(0, technicians.length, ...data.technicians);
    nextTurnIndex = data.nextTurnIndex;
    manualTurnAudit.splice(0, manualTurnAudit.length, ...data.manualTurnAudit);
    turnEditAudit.splice(0, turnEditAudit.length, ...data.turnEditAudit);
    demoMode = data.demoMode;
    $('#peak-mode-toggle').value = demoMode;
    clearFilters();
  }
  function persist() {
    try { localStorage.setItem(storeKey, JSON.stringify({state:snapshot(), lastAction})); }
    catch (_) { toast('Changes are available for this visit; browser storage is unavailable.'); }
  }
  function updateUndo() {
    $('[data-board-action="undo"]').disabled = !lastAction;
    $('#board-undo-label').textContent = lastAction ? lastAction.label : 'No changes yet';
  }
  function change(label, action) {
    if (changing) return action();
    const before = snapshot();
    changing = true;
    try {
      const result = action();
      if (JSON.stringify(snapshot()) !== JSON.stringify(before)) {
        lastAction = {label, before};
        persist();
        updateUndo();
      }
      return result;
    } finally { changing = false; }
  }
  function clearFilters() {
    $('#tech-search').value = '';
    $('#tech-status-filter').value = 'all';
  }
  function closeMenu(focus = false) {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (focus) trigger.focus();
  }
  trigger.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    trigger.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', event => {
    if (!event.target.closest?.('.board-menu-wrap')) closeMenu();
    const modal = event.target.closest?.('.modal-wrap');
    if (modal && !modal.classList.contains('show') && !document.querySelector('.modal-wrap.show')) trigger.focus();
  });
  menu.addEventListener('click', event => {
    const button = event.target.closest('[data-board-action]');
    if (!button || button.disabled) return;
    closeMenu(true);
    const action = button.dataset.boardAction;
    if (action === 'services') window.openBoardServices();
    else if (action === 'rules') { openTurnRules(); $('#booking-turn-credit').focus(); }
    else if (action === 'guest') window.openDemoGuest();
    else if (action === 'undo') window.undoBoardAction();
    else window.requestBoardChange(action);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!menu.hidden) closeMenu(true);
      if (pendingChange) window.closeBoardDialog('board-confirm-modal');
      if (event.target.closest?.('.modal-wrap')) trigger.focus();
    }
    const modal = event.target.closest?.('.modal-wrap.show');
    if (event.key !== 'Tab' || !modal || modal.id === 'board-services-modal') return;
    const focusable = [...modal.querySelectorAll('button:not([disabled]),input,select,a[href],textarea')];
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && event.target === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && event.target === last) { event.preventDefault(); first.focus(); }
  });
  window.closeBoardDialog = function (id) {
    document.getElementById(id).classList.remove('show');
    if (id === 'board-confirm-modal') pendingChange = null;
    trigger.focus();
  };
  $('#board-confirm-modal').addEventListener('click', event => {
    if (event.target === event.currentTarget) window.closeBoardDialog('board-confirm-modal');
  });

  const changes = {
    sample: {title:'Load sample data?', copy:'Replace the current board with the sample technicians, guests and recorded turns.', label:'Load sample data'},
    clear: {title:'Clear the demo salon?', copy:'Remove all demo technicians, guests and recorded turns from this board.', label:'Clear salon'},
    reset: {title:'Reset today to 0?', copy:'Keep technician profiles, clear guests and recorded turns, reset totals to 0, and clock everyone out for a new day.', label:'Reset day to 0'}
  };
  window.requestBoardChange = function (action) {
    const item = changes[action];
    if (!item) return;
    pendingChange = action;
    $('#board-confirm-title').textContent = item.title;
    $('#board-confirm-copy').textContent = item.copy;
    $('#board-confirm-submit').textContent = item.label;
    $('#board-confirm-submit').classList.toggle('board-danger-button', action !== 'sample');
    $('#board-confirm-modal').classList.add('show');
    $('#board-confirm-modal .modal-actions button').focus();
  };
  window.confirmBoardChange = function () {
    const action = pendingChange;
    if (!changes[action]) return;
    change(changes[action].label, () => {
      if (action === 'sample') setDemoMode('normal');
      else {
        tickets = [];
        if (action === 'clear') technicians.splice(0);
        else technicians.forEach(tech => Object.assign(tech, {
          turns:0, serviceCount:0, sales:0, minutes:0, codes:[], turnDetails:[],
          status:'clocked-out', detail:'Clocked out'
        }));
        nextTurnIndex = -1;
        manualTurnAudit.splice(0);
        turnEditAudit.splice(0);
        clearFilters();
        renderTurnBoard();
      }
    });
    window.closeBoardDialog('board-confirm-modal');
    toast(changes[action].label + ' completed. Undo is available in Board menu.');
  };
  window.undoBoardAction = function () {
    if (!lastAction) return;
    const previous = lastAction;
    document.querySelectorAll('.modal-wrap.show').forEach(modal => modal.classList.remove('show'));
    pendingChange = null;
    closeAddTurn();
    restore(previous.before);
    lastAction = null;
    renderTurnBoard();
    persist();
    updateUndo();
    toast('Undone: ' + previous.label);
  };
  window.openDemoGuest = function () {
    $('#demo-guest-form').reset();
    $('#demo-guest-error').textContent = '';
    $('#demo-guest-service').replaceChildren(...window.NEXORA_BOARD_SERVICES.list().map(service => {
      const option = document.createElement('option');
      option.value = service.id;
      option.textContent = service.name + ' · $' + service.price.toFixed(2);
      return option;
    }));
    $('#demo-guest-modal').classList.add('show');
    $('#demo-guest-name').focus();
  };
  window.saveDemoGuest = function () {
    const name = $('#demo-guest-name').value.trim();
    const service = window.NEXORA_BOARD_SERVICES.get($('#demo-guest-service').value);
    if (!name || !service) { $('#demo-guest-error').textContent = 'Enter a customer name and select a service.'; return; }
    change('Add demo guest: ' + name, () => {
      tickets.unshift({id:Math.max(0,...tickets.map(t => t.id)) + 1,customer:name,phone:'',
        time:new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),
        status:'waiting',tech:'',services:[service.name],boardServices:[{id:service.id,amount:service.price}],wait:0,isNew:true});
      renderTurnBoard();
    });
    window.closeBoardDialog('demo-guest-modal');
    toast(name + ' added to the waiting guests.');
  };
  $('#demo-guest-form').addEventListener('submit', event => { event.preventDefault(); window.saveDemoGuest(); });
  window.checkInBoardTech = function (index) {
    const tech = technicians[index];
    if (!tech || tech.status !== 'clocked-out') return;
    change('Check in: ' + tech.name, () => {
      tech.status = 'available'; tech.detail = 'Available now';
      renderTurnBoard(); toast(tech.name + ' checked in.');
    });
  };
  // Record successful board mutations only. Failed validation leaves Undo untouched.
  for (const [name, label] of Object.entries({assignGuestFromBoard:'Assign guest',saveAddedTurn:'Add turn',
    saveTurnEdit:'Edit turn',skipTurn:'Skip turn',togglePause:'Change availability'})) {
    const original = window[name];
    window[name] = function (...args) { return change(label, () => original(...args)); };
  }
  const originalDemoMode = window.setDemoMode;
  window.setDemoMode = function (mode) {
    return change(mode === 'peak' ? 'Load large salon demo' : 'Load sample data', () => {
      demoMode = mode === 'peak' ? 'peak' : 'normal';
      $('#peak-mode-toggle').value = demoMode;
      manualTurnAudit.splice(0); turnEditAudit.splice(0);
      clearFilters(); originalDemoMode(demoMode);
    });
  };
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey));
    if (validSnapshot(saved?.state)) {
      restore(saved.state);
      if (typeof saved.lastAction?.label === 'string' && validSnapshot(saved.lastAction.before)) lastAction = saved.lastAction;
    }
  } catch (_) { /* Keep the original sample if browser storage cannot be read. */ }
  renderTurnBoard();
  updateUndo();
})();
