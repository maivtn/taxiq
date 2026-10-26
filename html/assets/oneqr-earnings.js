/* OneQR management. Business copy is copied from PO HTML in oneqr-po-content.js.
   Participation, earnings and payouts are session-only simulations; no payment integration is implied. */
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
  const state = { view: 'overview', policyOpen: false, policySection: '', consent: false, enabled: false, demoRefund: false };
  const copy = PO.demo;
  // Synthetic events, not production balances. Rates/splits follow the Sep 21 PO policy.
  // All amounts are calculated in 1/10,000 USD to preserve the policy's fractional-cent examples.
  // Settlement outcomes below are fixtures, not a rule imposing a 14-day wait on CPC.
  const demoEvents = [
    { id: 'DEMO-101', kind: 'service', date: '2026-10-25', baseCents: 8000, feePercent: 10, status: 'pending' },
    { id: 'DEMO-102', kind: 'banner', date: '2026-10-22', status: 'available' },
    { id: 'DEMO-103', kind: 'explore', date: '2026-10-23', status: 'available' },
    { id: 'DEMO-104', kind: 'search', date: '2026-10-24', status: 'pending' },
    { id: 'DEMO-105', kind: 'service', date: '2026-10-20', baseCents: 16000, feePercent: 10, status: 'hold' },
    { id: 'DEMO-106', kind: 'service', date: '2026-10-01', baseCents: 60000, feePercent: 10, status: 'sending', payoutId: 'DEMO-PAYOUT-102' },
    { id: 'DEMO-107', kind: 'service', date: '2026-09-25', baseCents: 8000, feePercent: 10, status: 'paid', payoutId: 'DEMO-PAYOUT-101' },
    { id: 'DEMO-108', kind: 'service', date: '2026-09-26', baseCents: 64000, feePercent: 10, status: 'paid', payoutId: 'DEMO-PAYOUT-101' },
    { id: 'DEMO-109', kind: 'service', date: '2026-10-05', baseCents: 58000, refundCents: 2000, adjustedAt: '2026-10-23', feePercent: 10, status: 'available' },
    { id: 'DEMO-110', kind: 'service', date: '2026-10-26', baseCents: 8000, feePercent: 5, status: 'pending' }
  ];
  const demoPayouts = [
    { id: 'DEMO-PAYOUT-102', date: '2026-10-20', status: 'sending' },
    { id: 'DEMO-PAYOUT-101', date: '2026-10-13', status: 'paid' }
  ];
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
  const money = units => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(units / 10000);
  const date = value => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z'));
  const badge = status => `<span class="eq-badge ${status}">${escape(copy[status])}</span>`;
  function entries() {
    return demoEvents.map(event => {
      const refundCents = event.refundCents || (event.id === 'DEMO-101' && state.demoRefund ? 2000 : 0);
      const fee = event.kind === 'service' ? (event.baseCents - refundCents) * event.feePercent : { banner: 4000, explore: 2500, search: 3000 }[event.kind];
      const share = event.kind === 'service' ? 50 : event.kind === 'banner' ? 40 : 35;
      const publisher = fee * share / 100;
      const sponsor = fee / 10;
      return { ...event, adjustedAt: event.adjustedAt || (refundCents ? '2026-10-26' : null), refundCents, fee, share, publisher, sponsor, platform: fee - publisher - sponsor, adjustment: -refundCents * (event.feePercent || 0) * share / 100 };
    });
  }
  function metrics(items) {
    return `<div class="eq-metrics eq-demo-metrics${items.length === 2 ? ' eq-demo-metrics-pair' : ''}">${items.map(([key, value]) => `<div class="eq-metric"><span class="eq-muted">${escape(copy[key])}</span><strong data-balance="${key}">${key === 'events' ? value : money(value)}</strong></div>`).join('')}</div>`;
  }
  function table(headers, rows) {
    return `<div class="eq-table-wrap"><table><thead><tr>${headers.map(header => `<th>${escape(header)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  }
  const detailButton = id => `<button type="button" class="eq-text-btn" data-detail="${id}">${copy.detail}</button>`;
  function activityTable(rows) {
    return table([copy.event, copy.source, copy.role, copy.amount, copy.status, copy.detail], rows.map(row => `<tr data-activity-row="${row.id}"><td><strong>${copy[row.kind]}</strong><small>${row.id} · ${date(row.date)}</small></td><td>${copy.sourceName}</td><td>${copy.publisher}</td><td class="eq-demo-money">${money(row.publisher)}${row.adjustment ? `<small>${copy.adjusted} ${money(row.adjustment)}</small>` : ''}</td><td>${badge(row.status)}</td><td>${detailButton(row.id)}</td></tr>`));
  }
  function demoContent(view) {
    if (!state.enabled) return `<section class="eq-card eq-demo-empty"><h2>${PO.stateOff}</h2><p>${PO.purpose}</p>${button('settings', PO.reviewAction)}</section>`;
    const rows = entries();
    const sum = status => rows.filter(row => row.status === status).reduce((total, row) => total + row.publisher, 0);
    const balances = [['pending', sum('pending')], ['available', sum('available')], ['paid', sum('paid')], ['events', rows.length]];
    let content;
    if (view === 'reserves') {
      const adjustments = rows.filter(row => row.adjustment);
      const held = rows.filter(row => row.status === 'hold');
      content = metrics([['hold', sum('hold')], ['adjusted', adjustments.reduce((total, row) => total + row.adjustment, 0)]]) +
        `<section class="eq-card"><h2>${copy.ledgerHeading}</h2>${table([copy.event, copy.refund, copy.amount, copy.status, copy.detail], [
          ...adjustments.map(row => `<tr data-adjustment-row="${row.id}"><td><strong>${row.id}</strong><small>${date(row.adjustedAt || row.date)}</small></td><td>${money(row.refundCents * 100)}</td><td class="eq-demo-money">${money(row.adjustment)}</td><td>${badge('adjusted')}</td><td>${detailButton(row.id)}</td></tr>`),
          ...held.map(row => `<tr data-adjustment-row="${row.id}"><td><strong>${row.id}</strong><small>${copy.risk} · ${date(row.date)}</small></td><td>—</td><td class="eq-demo-money">${money(row.publisher)}</td><td>${badge('hold')}</td><td>${detailButton(row.id)}</td></tr>`)
        ])}</section>`;
    } else if (view === 'payouts') {
      content = metrics([['available', sum('available')], ['pending', sum('pending')], ['sending', sum('sending')], ['paid', sum('paid')]]) +
        `<section class="eq-card"><h2>${copy.payoutHeading}</h2><p class="eq-muted">${copy.accountNote}</p>${table([copy.event, copy.amount, copy.status, copy.detail], demoPayouts.map(payout => {
          const amount = rows.filter(row => row.payoutId === payout.id).reduce((total, row) => total + row.publisher, 0);
          return `<tr data-payout-status="${payout.status}"><td><strong>${payout.id}</strong><small>${date(payout.date)}</small></td><td class="eq-demo-money">${money(amount)}</td><td>${badge(payout.status)}</td><td>${detailButton(payout.id)}</td></tr>`;
        }))}</section>`;
    } else {
      const visible = view === 'overview' ? [...rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4) : rows;
      content = metrics(balances) + `<section class="eq-card"><h2>${view === 'overview' ? copy.heading : copy.incomeHeading}</h2>${activityTable(visible)}${view === 'overview' ? button('activity', views.activity) : ''}</section>`;
    }
    return `<div class="eq-demo-data" data-demo-view="${view}" data-policy-version="${copy.policyVersion}">${content}</div>`;
  }
  function guidance(content) {
    return `<details class="eq-demo-guidance"><summary>${copy.guidance}</summary><div>${content}</div></details>`;
  }
  function overview() {
    return `<section class="eq-card eq-overview-advertising"><div><h2>Banner hero — quảng cáo chéo</h2><span class="eq-badge ${crossEnabled() ? 'enabled' : 'disabled'}" data-cross-promotion-status="${crossEnabled() ? 'enabled' : 'disabled'}">${crossLabel()}</span></div>${button('advertising', views.advertising)}</section>${demoContent('overview')}${guidance(PO.overview)}`;
  }
  function activity() {
    return `${demoContent('activity')}${guidance(PO.activity)}`;
  }
  function reserves() {
    return `${demoContent('reserves')}${guidance(PO.reserves)}`;
  }
  function settings() {
    const status = state.enabled ? PO.enabled : PO.stateOff;
    return `${PO.settings}<section class="eq-card" data-po-source="NEXORA-OneQR-Monetization-Sponsor-Terms.html:25;NEXORA-OneQR-Menu-Placement.html:37.integratedPages[NEXORA-Ads-Earnings-Dashboards.html]"><h2>${PO.termsHeading}</h2><p><span class="eq-badge ${state.enabled ? 'enabled' : 'pending'}">${status}</span></p><p>${PO.demoNote}</p><div class="eq-row"><a href="#policy" data-policy-link>${escape('Chính sách chia doanh thu')}</a></div><label class="eq-consent"><input type="checkbox" id="consent"${state.consent ? ' checked' : ''}${state.enabled ? ' disabled' : ''}><span><strong>${PO.consentTitle}</strong><span class="eq-consent-copy">${PO.consentText}</span></span></label><button type="button" class="eq-primary" data-action="toggle"${!state.enabled && !state.consent ? ' disabled' : ''}>${state.enabled ? PO.turnOff : PO.enableAction}</button></section>`;
  }
  function payouts() {
    return `${demoContent('payouts')}${guidance(PO.payouts)}<section class="eq-card"><button type="button" data-action="payout-guide">${PO.payoutGuideAction}</button></section>`;
  }
  let detailReturnSelector = null;
  const breakdown = items => `<dl class="eq-breakdown">${items.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
  function showDetail(id) {
    if (!state.enabled) return;
    const rows = entries();
    const row = rows.find(entry => entry.id === id);
    const payout = demoPayouts.find(entry => entry.id === id);
    if (!row && !payout) return;
    let content;
    if (row) {
      const service = row.kind === 'service';
      content = `<h2>${copy[row.kind]}</h2><p>${row.id} · <time datetime="${row.date}">${date(row.date)}</time></p>${badge(row.status)}${breakdown([
        [copy.source, copy.sourceName],
        ...(service ? [[copy.base, money(row.baseCents * 100)], [copy.refund, money(row.refundCents * 100)], [copy.eligible, money((row.baseCents - row.refundCents) * 100)]] : []),
        [copy.advertiser, money(row.fee) + (service ? ` · ${row.feePercent}%` : '')],
        [copy.host, `${money(row.publisher)} · ${row.share}%`],
        [copy.sponsor, `${money(row.sponsor)} · 10%`],
        [copy.platform, `${money(row.platform)} · ${100 - row.share - 10}%`],
        [copy.policy, copy.policyVersion]
      ])}${service ? `<p class="eq-muted">${row.feePercent === 5 ? copy.returningCustomer : copy.newCustomer}</p>` : ''}${row.status === 'hold' ? `<p class="eq-note warning">${copy.risk}</p>` : ''}`;
      if (row.adjustment) {
        const reversedFee = -row.refundCents * row.feePercent;
        content += `<h3>${copy.adjusted}</h3>${breakdown([
          [copy.advertiser, money(reversedFee)], [copy.host, money(row.adjustment)],
          [copy.sponsor, money(reversedFee / 10)], [copy.platform, money(reversedFee - row.adjustment - reversedFee / 10)]
        ])}`;
      }
      if (row.id === 'DEMO-101') content += `<div class="eq-demo-actions"><button type="button" class="eq-primary" data-action="demo-refund">${state.demoRefund ? copy.restoreRefund : copy.simulateRefund}</button><p class="eq-small eq-muted">${copy.sessionNote}</p></div>`;
    } else {
      const paidRows = rows.filter(entry => entry.payoutId === payout.id);
      content = `<h2>${copy.payoutHeading}</h2><p>${payout.id} · <time datetime="${payout.date}">${date(payout.date)}</time></p>${badge(payout.status)}<p class="eq-note">${copy.accountNote}</p>${breakdown([
        ...paidRows.map(entry => [entry.id, money(entry.publisher)]),
        [copy.amount, money(paidRows.reduce((total, entry) => total + entry.publisher, 0))]
      ])}`;
    }
    dialog.dataset.detailId = id;
    dialog.innerHTML = `<div class="eq-note warning">${PO.notice}</div>${content}<button type="button" data-action="close">${copy.back}</button>`;
    if (!dialog.open) dialog.showModal();
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
    const content = state.view === 'advertising' ? '' : ({ overview, activity, reserves, payouts, settings }[state.view])();
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
    const detail = event.target.closest('[data-detail]');
    if (detail) {
      detailReturnSelector = `[data-detail="${detail.dataset.detail}"]`;
      showDetail(detail.dataset.detail); return;
    }
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.view) navigate(target.dataset.view);
    if (target.dataset.action === 'toggle') {
      if (!state.enabled && !state.consent) return;
      state.enabled = !state.enabled;
      if (state.enabled) navigate('overview');
      else { render(); root.querySelector('[data-action="toggle"]').focus(); }
    }
    if (target.dataset.action === 'payout-guide') {
      detailReturnSelector = '[data-action="payout-guide"]';
      delete dialog.dataset.detailId;
      dialog.innerHTML = `${PO.payoutGuide}<button type="button" data-action="close">${copy.back}</button>`;
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
    if (event.target.closest('[data-action="demo-refund"]') && state.enabled && dialog.dataset.detailId === 'DEMO-101') {
      state.demoRefund = !state.demoRefund;
      render(); showDetail('DEMO-101');
      dialog.querySelector('[data-action="demo-refund"]').focus();
    }
  });
  dialog.addEventListener('close', () => {
    const returnTarget = detailReturnSelector && root.querySelector(detailReturnSelector);
    if (returnTarget) returnTarget.focus(); else focusNavigation();
  });
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
