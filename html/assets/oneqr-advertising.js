/* Demo behavior for the Oct 27 PO advertising and wallet handoff.
   Amounts are integer points. Credit balances use point units (100 = 1 credit).
   No live advertising events, payments, tax information or API requests. */
(function () {
  'use strict';

  const root = document.getElementById('oneqr-advertising');
  const PO = window.ONEQR_ADVERTISING_PO;
  if (!root || !PO) return;

  const VERSION = 'ONEQR-ADS-WALLET-2026-10-27';
  const STORE = 'nexora-oneqr-advertising-demo-20261027';
  const isReload = window.performance?.getEntriesByType?.('navigation')[0]?.type === 'reload';
  const $ = id => root.querySelector('#' + id);
  // UI changes explicitly requested after the PO handoff; keep the original PO copy intact.
  const UI_COPY = {
    vi: {
      adsOn: 'Quảng cáo đang bật', adsOff: 'Quảng cáo đã tắt',
      disableAds: 'Tắt quảng cáo', enableAds: 'Bật quảng cáo', removeIndustry: 'Bỏ ngành',
      clearSecondary: 'Bỏ chọn tất cả', closeSecondary: 'Đóng',
      secondaryPlaceholder: 'Select or search',
      secondaryHelp: 'Liệt kê những ngành doanh nghiệp thực sự cung cấp.',
      noAgree: 'Không đồng ý thì không kích hoạt OneQR theo gói hiện tại.',
      overviewIntro: 'Quét QR hoặc mở danh sách không tự tạo điểm.',
      available: 'Ví thu nhập khả dụng', pending: 'Điểm chờ duyệt',
      payoutText: 'Từ 10.000 điểm đã duyệt chưa dùng = $100. Khi yêu cầu rút, hoàn tất thông tin người nhận, mã số thuế, xác minh và phương thức nhận tiền theo yêu cầu.',
      convertText: '100 điểm đã duyệt = 1 credit = $1 giá trị sử dụng. Điểm đã đổi không còn trong số dư có thể rút.',
      receivedCredits: 'Credit nhận', ownCredits: 'Credit đổi từ điểm của mình',
      statusOff: 'Chưa kích hoạt', statusOn: 'Đã kích hoạt',
      errRecipient: 'Nhập tài khoản người nhận.', confirmDemo: 'Xác nhận chuyển',
      done: 'Đã chuyển điểm.',
      refSourceText: 'Chương trình giới thiệu chưa được kích hoạt.',
      testPayout: 'Yêu cầu rút tiền', convertAmount: 'Số điểm muốn đổi',
      convertConfirm: 'Xác nhận đổi', convertDone: 'Đã đổi điểm thành credit trong ví sử dụng.',
      payoutDone: 'Số dư đã đủ ngưỡng. Hoàn tất thông tin người nhận, thuế và xác minh để tiếp tục.',
      incomeHistory: 'Lịch sử thu nhập', transferHistory: 'Lịch sử chuyển và nhận điểm',
      payoutHistory: 'Lịch sử rút tiền', conversionHistory: 'Lịch sử đổi sang credit',
      historyId: 'Mã giao dịch', historyTime: 'Thời gian', historySource: 'Nguồn', historyStatus: 'Trạng thái',
      historyReview: 'Chờ đối soát', historySending: 'Đang chuyển', historyPaid: 'Đã trả',
      p4: '4. Quy đổi: 100 ONEQR Points = 1 credit = $1 giá trị quy đổi.'
    },
    en: {
      adsOn: 'Advertising is on', adsOff: 'Advertising is off',
      disableAds: 'Turn off advertising', enableAds: 'Turn on advertising', removeIndustry: 'Remove industry',
      clearSecondary: 'Clear all', closeSecondary: 'Close',
      secondaryPlaceholder: 'Select or search',
      secondaryHelp: 'List services your business actually offers.',
      noAgree: 'If you do not agree, OneQR cannot be activated under the current plan.',
      overviewIntro: 'Scanning a QR or opening a list does not itself earn points.',
      available: 'Available earnings', pending: 'Pending points',
      payoutText: 'At least 10,000 approved, unused points = $100. When requesting payout, complete recipient, tax, verification and payment details as required.',
      convertText: '100 approved points = 1 credit = $1 in spending value. Converted points are no longer available for withdrawal.',
      receivedCredits: 'Received credits', ownCredits: 'Credits converted from own points',
      statusOff: 'Not activated', statusOn: 'Activated',
      errRecipient: 'Enter the recipient account.', confirmDemo: 'Confirm transfer',
      done: 'Points transferred.',
      refSourceText: 'The referral program is not active yet.',
      testPayout: 'Request payout', convertAmount: 'Points to convert',
      convertConfirm: 'Confirm conversion', convertDone: 'Points converted to spending-wallet credits.',
      payoutDone: 'Your balance meets the minimum. Complete recipient, tax and verification details to continue.',
      incomeHistory: 'Earnings history', transferHistory: 'Points sent and received history',
      payoutHistory: 'Payout history', conversionHistory: 'Credit conversion history',
      historyId: 'Transaction ID', historyTime: 'Time', historySource: 'Source', historyStatus: 'Status',
      historyReview: 'Pending review', historySending: 'Processing', historyPaid: 'Paid',
      p4: '4. Conversion: 100 ONEQR Points = 1 credit = $1 in conversion value.'
    }
  };
  const state = {
    language: 'vi', activated: false, adsEnabled: false, group: '', industry: '', secondary: [], custom: '',
    balance: 12000, pending: 300, ownCreditPoints: 0, receivedCreditPoints: 0,
    recipientCreditPoints: 0, consent: null, ledger: [], audit: []
  };
  let reviewSnapshot = null;
  let view = 'setup';
  let busy = false;
  const messages = {};
  const t = key => UI_COPY[state.language][key] ?? PO[state.language][key];
  const number = value => new Intl.NumberFormat(state.language === 'vi' ? 'vi-VN' : 'en-US', { maximumFractionDigits: 2 }).format(value);
  const dollars = points => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(points / 100);
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const id = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);

  // A browser reload starts the demo over; ordinary navigation can resume it.
  try {
    if (isReload) sessionStorage.removeItem(STORE);
    const saved = isReload ? null : JSON.parse(sessionStorage.getItem(STORE));
    const amounts = ['balance', 'pending', 'ownCreditPoints', 'receivedCreditPoints', 'recipientCreditPoints'];
    if (saved?.version === VERSION && amounts.every(key => Number.isSafeInteger(saved[key]) && saved[key] >= 0)
      && Array.isArray(saved.secondary) && Array.isArray(saved.ledger) && Array.isArray(saved.audit)) {
      Object.keys(state).forEach(key => { if (Object.hasOwn(saved, key)) state[key] = saved[key]; });
      state.language = state.language === 'en' ? 'en' : 'vi';
      state.adsEnabled = state.activated && (typeof saved.adsEnabled === 'boolean' ? saved.adsEnabled : true);
    }
  } catch (_) { /* The demo also works when session storage is unavailable. */ }

  function save() {
    try { sessionStorage.setItem(STORE, JSON.stringify({ ...state, version: VERSION })); }
    catch (_) { /* Keep the current in-memory session usable. */ }
  }

  function report(target, key, error = false) {
    messages[target] = { key, error };
    $(target).textContent = key ? t(key) : '';
    $(target).classList.toggle('error', error);
    $(target).classList.toggle('ok', Boolean(key) && !error);
  }

  function renderGroups() {
    $('group').replaceChildren(new Option(t('chooseGroup'), ''));
    PO.categories.forEach(category => $('group').add(new Option(category[state.language === 'vi' ? 1 : 2], category[0])));
    $('group').value = state.group;
    renderIndustries();
    renderSecondaryIndustries();
  }

  function renderIndustries() {
    const index = state.language === 'vi' ? 1 : 2;
    const category = PO.categories.find(item => item[0] === state.group);
    $('industry').replaceChildren(new Option(t('chooseIndustry'), ''));
    category?.[3].forEach(item => $('industry').add(new Option(item[index], item[0])));
    $('industry').value = state.industry;
    updateIndustry();
  }

  function renderSecondaryIndustries() {
    const secondary = $('secondary');
    secondary.tomselect?.destroy();
    $('secondary-label').htmlFor = 'secondary';
    secondary.replaceChildren();
    const index = state.language === 'vi' ? 1 : 2;
    PO.categories.forEach(group => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = group[index];
      group[3].filter(item => item[0] !== 'other').forEach(item => {
        const option = new Option(item[index], item[0]);
        option.selected = state.secondary.includes(item[0]);
        optgroup.append(option);
      });
      if (optgroup.children.length) secondary.append(optgroup);
    });
    if (typeof window.TomSelect === 'function') {
      const select = new window.TomSelect(secondary, {
        plugins: { checkbox_options: {}, no_active_items: {}, no_backspace_delete: {} },
        create: false,
        maxItems: null,
        maxOptions: null,
        hideSelected: false,
        closeAfterSelect: false,
        clearAfterSelect: true,
        lockOptgroupOrder: true,
        placeholder: t('secondaryPlaceholder'),
        hidePlaceholder: false,
        render: { no_results: null }
      });
      select.control_input.setAttribute('aria-labelledby', 'secondary-label');
      select.control_input.setAttribute('aria-describedby', 'secondary-help');
      const actions = document.createElement('div');
      actions.className = 'qa-secondary-dropdown-actions';
      actions.innerHTML = `<button type="button" data-action="close-secondary">${escape(t('closeSecondary'))}</button>
        <button type="button" class="alt" data-action="clear-secondary">${escape(t('clearSecondary'))}</button>`;
      select.dropdown.append(actions);
      // Keep the composite control open while keyboard focus moves into its action buttons.
      const onBlur = select.onBlur.bind(select);
      select.onBlur = event => {
        if (event?.relatedTarget && select.dropdown.contains(event.relatedTarget)) return;
        onBlur(event);
      };
      actions.addEventListener('focusout', event => {
        if (event.relatedTarget !== select.control_input && !actions.contains(event.relatedTarget)) select.onBlur(event);
      });
      actions.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeSecondaryDropdown();
        }
      });
    } else {
      $('secondary-help').textContent = PO[state.language].secondaryHelp;
    }
    renderSelectedSecondary();
  }

  function renderSelectedSecondary() {
    const labels = new Map(PO.categories.flatMap(group => group[3]).map(industry => [industry[0], industry[state.language === 'vi' ? 1 : 2]]));
    const selected = state.secondary.filter(value => labels.has(value));
    $('secondary-selected').hidden = selected.length === 0;
    $('secondary-selected').innerHTML = selected.map(value => `<span class="qa-secondary-chip" role="listitem">
      <span>${escape(labels.get(value))}</span>
      <button type="button" data-action="remove-secondary" data-value="${escape(value)}" aria-label="${escape(t('removeIndustry') + ': ' + labels.get(value))}"><span aria-hidden="true">×</span></button>
    </span>`).join('');
  }

  function removeSecondaryIndustry(value) {
    const buttons = Array.from($('secondary-selected').querySelectorAll('button'));
    const index = buttons.findIndex(button => button.dataset.value === value);
    const secondary = $('secondary');
    if (secondary.tomselect) secondary.tomselect.removeItem(value);
    else {
      Array.from(secondary.options).forEach(option => { if (option.value === value) option.selected = false; });
      secondary.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const remaining = $('secondary-selected').querySelectorAll('button');
    const focusTarget = remaining[Math.min(index, remaining.length - 1)] || secondary.tomselect?.control_input || secondary;
    focusTarget.focus({ preventScroll: true });
  }

  function clearSecondaryIndustries() {
    const select = $('secondary').tomselect;
    if (!select) return;
    select.clear();
    select.setTextboxValue('');
    select.refreshOptions(false);
    select.open();
  }

  function closeSecondaryDropdown() {
    const select = $('secondary').tomselect;
    if (!select) return;
    select.control_input.focus({ preventScroll: true });
    select.close();
  }

  function canActivate() {
    const industry = PO.categories.find(category => category[0] === state.group)?.[3].find(item => item[0] === state.industry);
    return Boolean(industry) && $('agree').checked && (state.industry !== 'other' || Boolean(state.custom.trim()));
  }

  function reviewIndustryChange(reason = 'industry-change') {
    if (!state.activated) return;
    state.audit.push({ id: id(), type: reason, timestamp: new Date().toISOString(), previousConsent: state.consent });
    state.activated = false;
    state.adsEnabled = false;
    state.consent = null;
    $('agree').checked = false;
    refreshBalances();
  }

  function updateIndustry() {
    const category = PO.categories.find(group => group[0] === state.group);
    const classified = Boolean(category?.[3].some(industry => industry[0] === state.industry && industry[0] !== 'other'));
    // Older page markup may still include the PO's unconditional classification notes.
    root.querySelectorAll('[data-i="filterNote"], [data-i="failClosed"]').forEach(note => {
      note.hidden = classified;
    });
    const names = [state.industry, ...state.secondary.filter(key => key !== state.industry)].map(key => {
      const industry = PO.categories.flatMap(category => category[3]).find(item => item[0] === key);
      return industry?.[state.language === 'vi' ? 1 : 2];
    }).filter(Boolean);
    const label = state.industry ? names.join(' · ') : t('notChosen');
    $('customBlock').classList.toggle('hide', state.industry !== 'other');
    $('custom').required = state.industry === 'other';
    $('chosen').textContent = label;
    $('adIndustry').textContent = label;
  }

  function refreshBalances() {
    root.querySelectorAll('.balance').forEach(element => {
      element.textContent = number(state.balance);
      let equivalent = element.nextElementSibling;
      if (!equivalent?.classList.contains('equivalent')) {
        equivalent = document.createElement('small');
        equivalent.className = 'equivalent';
        element.after(equivalent);
      }
      equivalent.textContent = dollars(state.balance);
    });
    root.querySelectorAll('[data-pending]').forEach(element => { element.textContent = number(state.pending); });
    root.querySelectorAll('[data-minimum-payout]').forEach(element => { element.textContent = number(10000); });
    $('received').textContent = number(state.receivedCreditPoints / 100);
    $('ownCredits').textContent = number(state.ownCreditPoints / 100);
    const transfers = state.ledger.filter(entry => entry.kind === 'transfer');
    const latestTransfer = transfers[transfers.length - 1];
    const recipientPoints = transfers.filter(entry => entry.recipient === latestTransfer?.recipient).reduce((total, entry) => total + entry.points, 0);
    $('recipient-credits').textContent = number(recipientPoints / 100);
    $('recipient-wallet-name').textContent = latestTransfer?.recipient && latestTransfer.recipient !== 'DEMO' ? latestTransfer.recipient : t('recipient');
    $('recipient-wallet').classList.toggle('hide', !state.recipientCreditPoints);
    $('status').textContent = t(state.activated ? 'statusOn' : 'statusOff');
    $('status').classList.toggle('is-active', state.activated);
    $('oneqr-consent').hidden = state.activated;
    $('activate').hidden = state.activated;
    $('ads-status').classList.toggle('hide', !state.activated);
    $('ads-status').classList.toggle('is-active', state.adsEnabled);
    $('ads-status').textContent = t(state.adsEnabled ? 'adsOn' : 'adsOff');
    $('ads-toggle').classList.toggle('hide', !state.activated);
    $('ads-toggle').textContent = t(state.adsEnabled ? 'disableAds' : 'enableAds');
    if (messages.payoutResult?.key) report('payoutResult', state.balance >= 10000 ? 'payoutDone' : 'payoutLow', state.balance < 10000);
    renderHistories();
  }

  function seedIncomeHistory() {
    if (state.ledger.some(entry => entry.kind === 'income')) return;
    // Describe the PO's two opening sample balances, without inventing per-event rates.
    // Also preserve transactions from sessions created before the history tables existed.
    const used = state.ledger.filter(entry => ['transfer', 'conversion'].includes(entry.kind))
      .reduce((total, entry) => total + entry.points, 0);
    const opening = {
      kind: 'income', timestamp: '2026-10-27T00:00:00.000Z', source: 'advertising',
      program: 'oneqr-advertising-demo', businessId: 'bitcoin-nail-bar-demo',
      version: VERSION, adjustmentReason: null
    };
    state.ledger.unshift(
      { ...opening, id: 'ONEQR-INCOME-001', eventId: 'sample-approved-balance', points: state.balance + used, status: 'approved' },
      { ...opening, id: 'ONEQR-INCOME-002', eventId: 'sample-pending-balance', points: state.pending, status: 'pending' }
    );
  }

  function historyStatus(entry) {
    let key;
    let style = 'complete';
    if (entry.kind === 'income') {
      key = entry.status === 'pending' ? 'pending' : 'approved';
      if (entry.status === 'pending') style = 'pending';
    } else if (entry.kind === 'transfer') key = 'done';
    else if (entry.kind === 'conversion') key = 'convertDone';
    else {
      key = { pending: 'historyReview', processing: 'historySending', paid: 'historyPaid' }[entry.status];
      style = entry.status === 'paid' ? 'complete' : 'pending';
    }
    return `<span class="qa-history-status ${style}">${escape(key ? t(key) : entry.status)}</span>`;
  }

  function renderHistories() {
    const date = entry => {
      const formatted = new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh'
      }).format(new Date(entry.timestamp));
      return `<time datetime="${escape(entry.timestamp)}">${escape(formatted)}</time>`;
    };
    const transaction = ['historyId', entry => `<strong class="qa-history-id">${escape(entry.id)}</strong>`];
    const timestamp = ['historyTime', date];
    const amount = ['amount', entry => `<span class="qa-history-points${entry.kind === 'income' ? ' is-income' : ''}">${entry.kind === 'income' ? '+' : '−'}${number(entry.points)}</span>`];
    const value = ['$', entry => escape(dollars(entry.points))];
    const credits = ['credits', entry => escape(number(entry.points / 100))];
    const status = ['historyStatus', historyStatus];
    const numericClass = key => ['amount', '$', 'credits'].includes(key) ? ' class="qa-history-numeric"' : '';
    const columns = {
      income: [transaction, timestamp, ['historySource', () => escape(t('adsSource'))], amount, value, status],
      transfer: [transaction, timestamp, ['recipient', entry => escape(entry.recipient && entry.recipient !== 'DEMO' ? entry.recipient : t('recipient'))], amount, credits, status],
      payout: [transaction, timestamp, amount, value, status],
      conversion: [transaction, timestamp, amount, credits, status]
    };
    Object.entries(columns).forEach(([kind, fields]) => {
      const entries = state.ledger.filter(entry => entry.kind === kind)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      const label = key => key === '$' ? '$' : t(key);
      root.querySelector(`[data-history-count="${kind}"]`).textContent = number(entries.length);
      $(`${kind}-history`).innerHTML = `<table class="qa-history-table${fields.length > 5 ? ' qa-history-table-wide' : ''}" aria-labelledby="${kind}-history-heading" role="table">
        <thead role="rowgroup"><tr role="row">${fields.map(([key]) => `<th scope="col" role="columnheader"${numericClass(key)}>${escape(label(key))}</th>`).join('')}</tr></thead>
        <tbody role="rowgroup">${entries.length ? entries.map(entry => `<tr role="row" data-history-id="${escape(entry.id)}">${fields.map(([key, render]) => `<td role="cell" data-label="${escape(label(key))}"${numericClass(key)}><div class="qa-history-cell">${render(entry)}</div></td>`).join('')}</tr>`).join('')
          : `<tr role="row"><td role="cell" colspan="${fields.length}" class="qa-history-empty">—</td></tr>`}</tbody>
      </table>`;
    });
  }

  function transferPreview(points = Number($('amount').value)) {
    if (!Number.isSafeInteger(points) || points < 0) return '';
    return `${number(points)} ${t('points')} → ${number(points / 100)} ${t('credits')} · ${dollars(points)} ${t('equiv')}`;
  }

  function invalidateReview() {
    reviewSnapshot = null;
    $('review').classList.add('hide');
    $('preview').textContent = transferPreview();
    report('error', '');
    report('result', '');
  }

  function setLanguage(language) {
    state.language = language === 'en' ? 'en' : 'vi';
    document.documentElement.lang = state.language;
    document.title = t('title');
    root.querySelectorAll('[data-i]').forEach(element => { element.textContent = t(element.dataset.i); });
    root.querySelectorAll('[data-ph]').forEach(element => { element.placeholder = t(element.dataset.ph); });
    renderGroups();
    refreshBalances();
    $('preview').textContent = transferPreview();
    if (reviewSnapshot) $('reviewAmount').textContent = transferPreview(reviewSnapshot.points);
    Object.entries(messages).forEach(([target, message]) => report(target, message.key, message.error));
    save();
  }

  // Keep the six independent tabs and screen order from the PO prototype.
  const views = new Set(['setup', 'overview', 'earn', 'transfer', 'ads', 'policy']);
  const oldRoutes = { advertising: 'ads', activity: 'earn', reserves: 'earn', payouts: 'earn', settings: 'setup' };
  function navigate(requested, write = true, focus = false) {
    const route = oldRoutes[requested] || requested;
    view = views.has(route) ? route : 'setup';
    root.querySelectorAll('[data-screen]').forEach(section => {
      section.classList.toggle('hide', section.dataset.screen !== view);
    });
    root.querySelectorAll('#nav [data-view]').forEach(button => {
      button.classList.toggle('active', button.dataset.view === view);
      if (button.dataset.view === view) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    if (write && location.hash !== '#' + view) history.pushState(null, '', '#' + view);
    if (focus) {
      const heading = $(view)?.querySelector('h2');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
  }

  function activate() {
    state.custom = state.custom.trim();
    $('custom').value = state.custom;
    if (!canActivate()) {
      const invalid = ['group', 'industry', 'custom', 'agree'].map($).find(control => !control.checkValidity());
      if (invalid) {
        invalid.focus();
        invalid.reportValidity();
      }
      return;
    }
    state.activated = true;
    state.adsEnabled = true;
    state.consent = {
      businessId: 'bitcoin-nail-bar-demo', account: 'Business Owner', business: 'Bitcoin Nail Bar',
      timestamp: new Date().toISOString(), version: VERSION, language: state.language,
      primaryIndustry: state.industry, secondaryIndustries: [...state.secondary],
      description: state.custom, classification: state.industry === 'other' ? 'pending' : 'confirmed',
      placements: ['Deal Nearby', 'Search Deals', 'Explore'], earningsEnrolled: true
    };
    state.audit.push({ id: id(), type: 'activation', ...state.consent });
    save();
    refreshBalances();
    updateIndustry();
  }

  function toggleAdvertising() {
    if (!state.activated) return;
    state.adsEnabled = !state.adsEnabled;
    state.audit.push({
      id: id(), type: state.adsEnabled ? 'advertising-enabled' : 'advertising-disabled',
      timestamp: new Date().toISOString(), businessId: 'bitcoin-nail-bar-demo', version: VERSION
    });
    save();
    refreshBalances();
  }

  function reviewTransfer() {
    invalidateReview();
    const recipient = $('recipient').value.trim();
    if (!recipient) {
      report('error', 'errRecipient', true);
      $('recipient').focus();
      return;
    }
    const points = Number($('amount').value);
    if (!Number.isSafeInteger(points) || points < 1000 || points > state.balance) {
      report('error', 'errAmount', true);
      $('amount').focus();
      return;
    }
    reviewSnapshot = { id: id(), points, recipient };
    $('reviewRecipient').textContent = recipient;
    $('reviewAmount').textContent = transferPreview(points);
    $('review').classList.remove('hide');
    $('review').focus({ preventScroll: true });
  }

  function commit(kind, points, transactionId, recipient = null) {
    if (busy || !Number.isSafeInteger(points) || points <= 0 || points > state.balance
      || state.ledger.some(entry => entry.id === transactionId)) return false;
    busy = true;
    try {
      state.balance -= points;
      if (kind === 'transfer') state.recipientCreditPoints += points;
      else state.ownCreditPoints += points;
      state.ledger.push({ id: transactionId, kind, points, timestamp: new Date().toISOString(),
        status: 'spent', program: 'oneqr-advertising-demo', source: 'advertising', version: VERSION,
        businessId: 'bitcoin-nail-bar-demo', sender: 'bitcoin-nail-bar-demo',
        recipient: kind === 'transfer' ? recipient : 'bitcoin-nail-bar-demo',
        eventId: 'sample-approved-balance', idempotencyKey: transactionId, adjustmentReason: null });
      save();
      refreshBalances();
      return true;
    } finally { busy = false; }
  }

  function confirmTransfer() {
    const snapshot = reviewSnapshot;
    if (!snapshot) return;
    if ($('recipient').value.trim() !== snapshot.recipient || Number($('amount').value) !== snapshot.points) {
      invalidateReview();
      return;
    }
    reviewSnapshot = null;
    $('review').classList.add('hide');
    if (snapshot.points < 1000 || !commit('transfer', snapshot.points, snapshot.id, snapshot.recipient)) {
      report('error', 'errAmount', true);
      return;
    }
    report('result', 'done');
    $('result').focus({ preventScroll: true });
  }

  function convertPoints() {
    const points = Number($('convertAmount').value);
    if (!Number.isSafeInteger(points) || points <= 0 || points % 100 !== 0 || points > state.balance) {
      report('convertResult', 'errConvert', true);
      $('convertAmount').focus();
      return;
    }
    if (!commit('conversion', points, id())) return;
    // A completed conversion consumes the form amount, preventing an accidental repeated submission.
    $('convertAmount').value = '';
    root.querySelector('[data-action="convert-points"]').disabled = true;
    invalidateReview();
    report('convertResult', 'convertDone');
    $('convertResult').focus({ preventScroll: true });
  }

  root.addEventListener('click', event => {
    const destination = event.target.closest('[data-view]');
    if (destination) { event.preventDefault(); navigate(destination.dataset.view, true, !destination.closest('#nav')); return; }
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    if (action === 'activate') activate();
    if (action === 'toggle-ads') toggleAdvertising();
    if (action === 'remove-secondary') removeSecondaryIndustry(button.dataset.value);
    if (action === 'clear-secondary') clearSecondaryIndustries();
    if (action === 'close-secondary') closeSecondaryDropdown();
    if (action === 'review-transfer') reviewTransfer();
    if (action === 'confirm-transfer') confirmTransfer();
    if (action === 'cancel-transfer') { invalidateReview(); root.querySelector('[data-action="review-transfer"]').focus(); }
    if (action === 'convert-points') convertPoints();
    if (action === 'payout' || action === 'convert') {
      $(action).classList.toggle('hide');
      button.setAttribute('aria-expanded', String(!$(action).classList.contains('hide')));
    }
    if (action === 'request-payout') {
      // The PO prototype stops before real recipient, tax and payment-provider onboarding.
      // Checking eligibility neither submits a payout nor reserves or deducts points.
      report('payoutResult', state.balance >= 10000 ? 'payoutDone' : 'payoutLow', state.balance < 10000);
      $('payoutResult').focus({ preventScroll: true });
    }
  });

  root.addEventListener('change', event => {
    if (['group', 'industry', 'secondary'].includes(event.target.id)) reviewIndustryChange();
    if (event.target.id === 'group') {
      state.group = $('group').value;
      state.industry = '';
      renderIndustries();
    }
    if (event.target.id === 'industry') { state.industry = $('industry').value; updateIndustry(); }
    if (event.target.id === 'secondary') {
      state.secondary = Array.from($('secondary').selectedOptions, option => option.value);
      renderSelectedSecondary();
      updateIndustry();
    }
    if (event.target.id === 'agree') {
      if (!$('agree').checked) reviewIndustryChange('consent-change');
      updateIndustry();
    }
    save();
  });

  root.addEventListener('input', event => {
    if (['recipient', 'amount'].includes(event.target.id)) invalidateReview();
    if (event.target.id === 'convertAmount') {
      report('convertResult', '');
      root.querySelector('[data-action="convert-points"]').disabled = !$('convertAmount').value.trim();
    }
    if (event.target.id === 'custom') { reviewIndustryChange(); state.custom = $('custom').value; updateIndustry(); save(); }
  });

  window.addEventListener('popstate', () => navigate(location.hash.slice(1).split('/')[0], false));
  window.addEventListener('hashchange', () => navigate(location.hash.slice(1).split('/')[0], false));
  if (isReload) {
    root.querySelectorAll('input').forEach(input => {
      if (input.type === 'checkbox') input.checked = input.defaultChecked;
      else input.value = input.defaultValue;
    });
    history.replaceState(null, '', location.pathname + location.search);
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }
  $('custom').value = state.custom;
  $('agree').checked = Boolean(state.activated && state.consent);
  root.querySelectorAll('[data-action="payout"], [data-action="convert"]').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', button.dataset.action);
  });
  seedIncomeHistory();
  setLanguage('vi');
  navigate(location.hash.slice(1).split('/')[0], false);
})();
