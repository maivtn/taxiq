/* OneQR management. Business copy is copied from PO HTML in oneqr-po-content.js.
   The earnings controls simulate participation only; no payment integration is implied. */
(function () {
  'use strict';
  const root = document.getElementById('earnings-app');
  if (!root) return;
  const PO = window.ONEQR_PO_CONTENT;
  const dialog = document.getElementById('earning-detail');
  const panelStorage = document.getElementById('oneqr-panel-storage');
  const advertisingPanel = document.getElementById('advertising-panel');
  const policyPanel = document.getElementById('oneqr-policy-panel');
  const policyDetails = document.getElementById('oneqr-policy-full');
  const state = { view: 'overview', policyOpen: false, policySection: '', approved: false, consent: false, enabled: false };
  const views = {
    overview: 'Tổng quan', advertising: 'Cài đặt quảng cáo', activity: 'Thu nhập',
    reserves: 'Dự phòng & điều chỉnh', payouts: 'Nhận tiền', settings: 'Điều kiện & chính sách'
  };
  const policyAliases = {
    scope: 'muc-tieu', eligibility: 'khi-qr-host-b-nhan-tien', qualified: 'su-kien-nao-tinh-tien',
    rates: 'su-kien-nao-tinh-tien', attribution: 'dedupe-va-valid-click', settlement: 'khi-qr-host-b-nhan-tien',
    reserves: 'nghiem-thu-p0', recovery: 'nghiem-thu-p0', payouts: 'khi-qr-host-b-nhan-tien',
    responsibilities: 'khi-qr-host-b-nhan-tien', disable: 'khi-qr-host-b-nhan-tien', support: 'nghiem-thu-p0'
  };
  const crossEnabled = () => window.ONEQR_ADVERTISING.crossEnabled();
  const crossLabel = () => crossEnabled() ? 'Tiệm bật quảng cáo chéo' : 'Chỉ quảng cáo của tiệm';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const button = (view, text) => `<button type="button" data-view="${view}">${escape(text)}</button>`;
  function select() {
    return `<label for="earnings-view">Quảng cáo<select id="earnings-view">${Object.entries(views).map(([key, label]) => `<option value="${key}"${key === state.view ? ' selected' : ''}>${label}</option>`).join('')}</select></label>`;
  }
  function overview() {
    return `<section class="eq-card eq-overview-advertising"><div><h2>Banner hero — quảng cáo chéo</h2><span class="eq-badge ${crossEnabled() ? 'enabled' : 'disabled'}" data-cross-promotion-status="${crossEnabled() ? 'enabled' : 'disabled'}">${crossLabel()}</span></div>${button('advertising', views.advertising)}</section>${PO.overview}`;
  }
  function settings() {
    const status = state.enabled ? PO.enabled : state.approved ? PO.approved : PO.unapproved;
    return `${PO.settings}<section class="eq-card" data-po-source="NEXORA-OneQR-Monetization-Sponsor-Terms.html:25;NEXORA-OneQR-Menu-Placement.html:37.integratedPages[NEXORA-Ads-Earnings-Dashboards.html]"><h2>${PO.termsHeading}</h2><p><span class="eq-badge ${state.enabled ? 'enabled' : 'pending'}">${status}</span></p><p>${PO.demoNote}</p><div class="eq-row"><button type="button" data-action="approve">${PO.approveAction}</button><a href="#policy" data-policy-link>${escape('Chính sách chia doanh thu')}</a></div><label class="eq-consent"><input type="checkbox" id="consent"${state.consent ? ' checked' : ''}${state.enabled ? ' disabled' : ''}><span><strong>${PO.consentTitle}</strong><span class="eq-consent-copy">${PO.consentText}</span></span></label><button type="button" class="eq-primary" data-action="toggle"${!state.enabled && !(state.approved && state.consent) ? ' disabled' : ''}>${state.enabled ? PO.turnOff : PO.enableAction}</button></section>`;
  }
  function payouts() {
    return `${PO.payouts}<section class="eq-card"><button type="button" data-action="payout-guide">${PO.payoutGuideAction}</button></section>`;
  }
  function readRoute() {
    const [route, ...section] = location.hash.slice(1).split('/');
    state.view = route === 'policy' ? 'settings' : Object.hasOwn(views, route) ? route : 'overview';
    state.policyOpen = route === 'policy';
    const requested = section.join('/');
    state.policySection = state.policyOpen ? policyAliases[requested] || requested : '';
  }
  function writeRoute() {
    const hash = state.policyOpen ? 'policy' + (state.policySection ? '/' + state.policySection : '') : state.view;
    if (location.hash !== '#' + hash) history.pushState(null, '', '#' + hash);
  }
  function focusNavigation() {
    const mobile = root.querySelector('#earnings-view');
    (mobile.offsetParent ? mobile : root.querySelector('.eq-nav [aria-selected="true"]'))?.focus();
  }
  function scrollToPolicy() {
    if (!state.policyOpen) return;
    requestAnimationFrame(() => {
      const section = state.policySection && document.getElementById(state.policySection);
      (section && policyPanel.contains(section) ? section : policyDetails).scrollIntoView({ block: 'start' });
    });
  }
  function navigate(view, section = null) {
    if (!Object.hasOwn(views, view)) return;
    state.view = view;
    state.policyOpen = view === 'settings' && section !== null;
    state.policySection = state.policyOpen ? policyAliases[section] || section : '';
    writeRoute(); render();
    if (state.policyOpen) scrollToPolicy(); else focusNavigation();
  }
  let renderedView = null;
  function render() {
    const active = document.activeElement;
    const preserveFocus = (state.view === 'advertising' && advertisingPanel.contains(active)) || (state.view === 'settings' && policyPanel.contains(active));
    const enteringAdvertising = state.view === 'advertising' && renderedView !== 'advertising';
    if (state.view !== 'advertising') window.ONEQR_ADVERTISING.suspend();
    panelStorage.append(advertisingPanel, policyPanel);
    document.documentElement.lang = 'vi';
    const content = state.view === 'advertising' ? '' : ({ overview, activity: () => PO.activity, reserves: () => PO.reserves, payouts, settings }[state.view])();
    root.innerHTML = `<div class="earnings-page eq-management-chrome"><div class="eq-top"><div class="eq-business">Bitcoin Nail Bar · Business Owner</div></div><section class="eq-monetization-off eq-po-participation${state.enabled ? ' is-enabled' : ''}"><div><h2 data-monetization-status="${state.enabled ? 'enabled' : 'disabled'}">${state.enabled ? PO.stateOn : PO.stateOff}</h2><p>${PO.purpose}</p></div>${button('settings', PO.reviewAction)}</section><div class="eq-mobile-nav">${select()}</div><nav class="eq-nav eq-management-nav" role="tablist" aria-label="Quảng cáo">${Object.entries(views).map(([key, text]) => `<button type="button" id="management-tab-${key}" role="tab" data-view="${key}" aria-selected="${key === state.view}" aria-controls="earnings-content" tabindex="${key === state.view ? '0' : '-1'}"${key === state.view ? ' aria-current="page"' : ''}>${text}</button>`).join('')}</nav></div><div id="earnings-content" class="eq-management-content${state.view === 'advertising' ? '' : ' earnings-page eq-po-content'}" role="tabpanel" aria-labelledby="management-tab-${state.view}">${state.view === 'advertising' ? '' : `<div class="eq-note warning" data-po-source="NEXORA-OneQR-Menu-Placement.html:37.integratedPages[NEXORA-Ads-Earnings-Dashboards.html]">${PO.notice}</div>`}${content}</div>`;
    const panel = root.querySelector('#earnings-content');
    if (state.view === 'advertising') panel.append(advertisingPanel);
    if (state.view === 'settings') panel.append(policyPanel);
    policyDetails.open = state.policyOpen;
    root.querySelectorAll('.eq-po-content table').forEach(table => {
      const firstRow = table.querySelector('tr');
      if (!table.tHead && firstRow?.querySelector('th')) {
        const head = document.createElement('thead');
        head.append(firstRow); table.prepend(head);
      }
      table.setAttribute('role', 'table');
      const headers = Array.from(table.querySelectorAll('th'), th => th.textContent.trim());
      table.querySelectorAll('th').forEach(th => { th.setAttribute('role', 'columnheader'); th.setAttribute('scope', 'col'); });
      table.querySelectorAll('tbody tr').forEach(row => {
        row.setAttribute('role', 'row');
        Array.from(row.cells).forEach((cell, index) => {
          cell.setAttribute('role', 'cell');
          if (cell.colSpan === 1) cell.dataset.label = headers[index];
        });
      });
    });
    renderedView = state.view;
    if (enteringAdvertising) window.ONEQR_ADVERTISING.activate();
    if (preserveFocus && active.isConnected) active.focus({ preventScroll: true });
  }
  root.addEventListener('click', event => {
    const policySection = event.target.closest('a[href^="#policy/"]');
    if (policySection) {
      event.preventDefault(); navigate('settings', policySection.getAttribute('href').slice('#policy/'.length)); return;
    }
    if (event.target.closest('[data-policy-link]')) {
      event.preventDefault(); navigate('settings', ''); return;
    }
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.view) navigate(target.dataset.view);
    if (target.dataset.action === 'approve') { state.approved = true; render(); root.querySelector('[data-action="approve"]').focus(); }
    if (target.dataset.action === 'toggle') {
      if (!state.enabled && !(state.approved && state.consent)) return;
      state.enabled = !state.enabled;
      render(); root.querySelector('[data-action="toggle"]').focus();
    }
    if (target.dataset.action === 'payout-guide') {
      dialog.innerHTML = `${PO.payoutGuide}<button type="button" data-action="close">← Quay lại</button>`;
      dialog.showModal();
    }
  });
  root.addEventListener('change', event => {
    if (event.target.id === 'earnings-view') navigate(event.target.value);
    if (event.target.id === 'consent') {
      state.consent = event.target.checked; render(); root.querySelector('#consent').focus();
    }
  });
  root.addEventListener('keydown', event => {
    if (!event.target.matches('.eq-management-nav [role="tab"]')) return;
    const keys = Object.keys(views), current = keys.indexOf(state.view);
    let next;
    if (event.key === 'ArrowRight') next = (current + 1) % keys.length;
    else if (event.key === 'ArrowLeft') next = (current + keys.length - 1) % keys.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = keys.length - 1;
    else return;
    event.preventDefault(); navigate(keys[next]);
  });
  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-action="close"]')) dialog.close();
  });
  dialog.addEventListener('close', () => root.querySelector('[data-action="payout-guide"]')?.focus());
  policyDetails.addEventListener('toggle', () => {
    if (state.view !== 'settings' || policyDetails.open === state.policyOpen) return;
    state.policyOpen = policyDetails.open; state.policySection = ''; writeRoute();
  });
  const policyContents = policyPanel.querySelector('.policy-contents');
  const compact = window.matchMedia('(max-width: 650px)');
  const syncContents = () => { policyContents.open = !compact.matches; };
  syncContents(); compact.addEventListener('change', syncContents);
  window.addEventListener('hashchange', () => { readRoute(); render(); scrollToPolicy(); });
  document.addEventListener('oneqr-advertising-change', render);
  readRoute(); render(); scrollToPolicy();
})();
