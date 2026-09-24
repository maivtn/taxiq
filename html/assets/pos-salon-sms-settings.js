(function () {
  'use strict';
  var panel = document.querySelector('[data-settings-panel="sms"]');
  if (!panel) return;

  var esc = function (value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var $ = function (selector) { return panel.querySelector(selector); };
  var $$ = function (selector) { return Array.from(panel.querySelectorAll(selector)); };

  var TOKENS = {
    '[Customer Name]': 'Sarah',
    '[Salon Name]': 'Bitcoin Nail Bar',
    '[OneQR Link]': 'nexora.app/q/••••',
    '[Ticket Number]': '#12',
    '[Ticket Total]': '$45.00',
    '[Review Link]': 'nexora.app/review/••••',
    '[Tip Link]': 'nexora.app/tip/••••',
    '[Feedback Link]': 'nexora.app/feedback/••••',
    '[Rewards Link]': 'nexora.app/rewards/••••',
    '[Booking Link]': 'nexora.app/book/••••',
    '[Receipt Link]': 'nexora.app/r/••••',
    '[Salon Phone]': '(713) 555-0123',
    '[Wait Time]': '15–20 minutes',
    '[Wait Care Benefit]': 'a complimentary hot-stone upgrade',
    '[Return Notice]': '15 minutes'
  };
  function renderTokens(text) {
    return Object.keys(TOKENS).reduce(function (out, token) {
      return out.split(token).join(TOKENS[token]);
    }, text || '');
  }

  var WELCOME_TEMPLATES = {
    welcome: 'Hi [Customer Name], welcome to [Salon Name]! You’re checked in. View your visit: [OneQR Link]',
    'check-in': 'Hi [Customer Name], you’re checked in at [Salon Name]. Follow your visit: [OneQR Link]'
  };
  var WELCOME_TEMPLATE_OPTIONS = [
    { key: 'welcome', label: 'Welcome message' },
    { key: 'check-in', label: 'Check-in confirmed' }
  ];
  var AFTER_CHECKOUT_TEMPLATES = {
    'ticket-receipt': 'Thanks for visiting [Salon Name]! Ticket [Ticket Number]: [Ticket Total]. Receipt: [Receipt Link]',
    review: 'Thanks for visiting [Salon Name]! How was your visit? Leave a review: [Review Link]',
    tip: 'Thanks for visiting [Salon Name]! If you haven’t tipped yet, add one here: [Tip Link]',
    feedback: 'Thanks for visiting [Salon Name]! Share private feedback: [Feedback Link]',
    rewards: 'Thanks for visiting [Salon Name]! View rewards earned today: [Rewards Link]',
    booking: 'Thanks for visiting [Salon Name]! Book your next visit: [Booking Link]'
  };
  var AFTER_CHECKOUT_TEMPLATE_OPTIONS = [
    { key: 'ticket-receipt', label: 'Ticket & receipt' },
    { key: 'review', label: 'Review request' },
    { key: 'tip', label: 'Tip follow-up · no tip yet' },
    { key: 'feedback', label: 'Private feedback' },
    { key: 'rewards', label: 'Rewards earned' },
    { key: 'booking', label: 'Book next visit' }
  ];
  var AFTER_CHECKOUT_DEFAULT = AFTER_CHECKOUT_TEMPLATES['ticket-receipt'];
  var WAIT_CARE_TEMPLATES = {
    'delay-update': 'Hi [Customer Name], we’re sorry for the wait at [Salon Name]. Current estimate: [Wait Time]. Track your visit: [OneQR Link]',
    'care-benefit': 'Hi [Customer Name], thanks for your patience. [Salon Name] added [Wait Care Benefit] to your visit. Details: [OneQR Link]',
    'comfort-check-in': 'Hi [Customer Name], we’re checking in while you wait at [Salon Name]. Need anything to feel more comfortable? Please let our team know.',
    'visit-preparation': 'Hi [Customer Name], thanks for waiting. The [Salon Name] team is preparing for your visit. Current estimate: [Wait Time]. Updates: [OneQR Link]'
  };
  var WAIT_CARE_TEMPLATE_OPTIONS = [
    { key: 'delay-update', label: 'Delay update' },
    { key: 'care-benefit', label: 'Wait Care benefit' },
    { key: 'comfort-check-in', label: 'Comfort check-in' },
    { key: 'visit-preparation', label: 'Preparing your visit' }
  ];
  var WAIT_CARE_DEFAULT = WAIT_CARE_TEMPLATES['care-benefit'];
  var RETURN_SOON_TEMPLATES = {
    'return-reminder': 'Hi [Customer Name], your turn at [Salon Name] is coming up in [Return Notice]. Please return soon: [OneQR Link]',
    'head-back': 'Hi [Customer Name], please head back to [Salon Name]. Your estimated turn is in [Return Notice]. Details: [OneQR Link]'
  };
  var RETURN_SOON_TEMPLATE_OPTIONS = [
    { key: 'return-reminder', label: 'Return reminder' },
    { key: 'head-back', label: 'Head back now' }
  ];
  var READY_NOW_TEMPLATES = {
    'ready-now': 'Hi [Customer Name], we’re ready for you at [Salon Name]. Please come to the front desk now. Details: [OneQR Link]',
    'your-turn': 'Hi [Customer Name], it’s your turn at [Salon Name]. Please come to the front desk now: [OneQR Link]'
  };
  var READY_NOW_TEMPLATE_OPTIONS = [
    { key: 'ready-now', label: 'Ready now' },
    { key: 'your-turn', label: 'Your turn' }
  ];
  var LIVE_LINK_VALIDITY_OPTIONS = ['Until checkout + 24 hours', 'Until checkout', 'Until checkout + 48 hours', '7 days after check-in'];
  var AFTER_LINK_VALIDITY_OPTIONS = ['30 days after checkout', '7 days after checkout', '14 days after checkout', '90 days after checkout'];
  var LINK_VALIDITY_CAPTIONS = {
    'Until checkout': 'Link remains active until checkout is completed.',
    'Until checkout + 24 hours': 'Link remains active until 24 hours after checkout.',
    'Until checkout + 48 hours': 'Link remains active until 48 hours after checkout.',
    '7 days after check-in': 'Link remains active for 7 days after check-in.',
    '7 days after checkout': 'Link remains active for 7 days after checkout.',
    '14 days after checkout': 'Link remains active for 14 days after checkout.',
    '30 days after checkout': 'Link remains active for 30 days after checkout.',
    '90 days after checkout': 'Link remains active for 90 days after checkout.'
  };

  var AFTER_CHECKOUT_TOKENS = [
    { token: '[Salon Name]', label: 'Shop name', icon: 'bi-shop' },
    { token: '[Ticket Number]', label: 'Ticket number', icon: 'bi-receipt' },
    { token: '[Ticket Total]', label: 'Ticket total', icon: 'bi-currency-dollar' },
    { token: '[Review Link]', label: 'Review link', icon: 'bi-star' },
    { token: '[Tip Link]', label: 'Tip link', icon: 'bi-cash-coin' },
    { token: '[Feedback Link]', label: 'Feedback link', icon: 'bi-chat-left-text' },
    { token: '[Rewards Link]', label: 'Rewards link', icon: 'bi-gift' },
    { token: '[Booking Link]', label: 'Booking link', icon: 'bi-calendar-check' },
    { token: '[Receipt Link]', label: 'Receipt link', icon: 'bi-receipt-cutoff' }
  ];
  var GENERAL_MESSAGE_TOKENS = [
    { token: '[Customer Name]', label: 'Customer name', icon: 'bi-person' },
    { token: '[Salon Name]', label: 'Shop name', icon: 'bi-shop' },
    { token: '[OneQR Link]', label: 'Offer link', icon: 'bi-link-45deg' }
  ];
  var WELCOME_MESSAGE_TOKENS = GENERAL_MESSAGE_TOKENS.concat([
    { token: '[Salon Phone]', label: 'Phone number', icon: 'bi-telephone' }
  ]);
  var WAIT_CARE_TOKENS = [
    { token: '[Customer Name]', label: 'Customer name', icon: 'bi-person' },
    { token: '[Salon Name]', label: 'Shop name', icon: 'bi-shop' },
    { token: '[Wait Time]', label: 'Wait time', icon: 'bi-clock' },
    { token: '[Wait Care Benefit]', label: 'Wait Care benefit', icon: 'bi-gift' },
    { token: '[OneQR Link]', label: 'Smart link', icon: 'bi-link-45deg' }
  ];
  var RETURN_SOON_TOKENS = GENERAL_MESSAGE_TOKENS.concat([
    { token: '[Return Notice]', label: 'Return notice', icon: 'bi-clock' }
  ]);

  function smsComposerMarkup(field, value, tokens) {
    var buttons = tokens.map(function (item) {
      return '<button type="button" class="sms-insert-chip" data-sms-insert-token="' + esc(item.token) + '" data-sms-target="' + esc(field) + '">' +
        '<i class="bi ' + esc(item.icon) + '" aria-hidden="true"></i>' + esc(item.label) + '</button>';
    }).join('');
    return '<div class="sms-composer" data-sms-composer>' +
      '<div class="sms-composer-toolbar"><span>Insert:</span><div class="sms-insert-list">' + buttons + '</div></div>' +
      '<textarea class="settings-input sms-textarea" data-sms-field="' + esc(field) + '" rows="4">' + esc(value) + '</textarea>' +
      '<div class="sms-composer-footer"><span>Dynamic fields fill automatically when sent</span><strong data-sms-count="' + esc(field) + '">' + value.length + ' chars — ' + Math.max(1, Math.ceil(value.length / 160)) + ' SMS</strong></div>' +
    '</div>';
  }

  function quickTemplateMarkup(group, options, messages, selectedKey) {
    var cards = options.map(function (option) {
      var selected = option.key === selectedKey;
      return '<button type="button" class="sms-template-card' + (selected ? ' is-selected' : '') + '" data-sms-template="' + esc(group) + '" data-template-key="' + esc(option.key) + '" aria-pressed="' + selected + '">' +
        '<span class="sms-template-card-title"><i class="bi bi-stars" aria-hidden="true"></i>' + esc(option.label) + '</span>' +
        '<span class="sms-template-card-copy">' + esc(messages[option.key]) + '</span>' +
      '</button>';
    }).join('');
    return '<div class="settings-field sms-field-full sms-template-picker"><span class="settings-label">Quick template</span>' +
      '<div class="sms-template-card-grid">' + cards + '</div></div>';
  }

  function testSendMarkup(action, primary) {
    return '<div class="sms-test-send">' +
      '<div class="sms-test-phone-control"><span>Test phone number</span><div class="sms-test-phone-fields">' +
        '<select class="settings-select" aria-label="Country code" data-sms-test-country="' + esc(action) + '">' +
          '<option value="+1">US +1</option><option value="+84">VN +84</option></select>' +
        '<input class="settings-input" aria-label="Test phone number" type="tel" inputmode="tel" autocomplete="tel" placeholder="(713) 555-0123" data-sms-test-phone="' + esc(action) + '">' +
      '</div></div>' +
      '<button type="button" class="' + (primary ? 'booking-primary-button' : 'booking-secondary-button') + '" data-sms-action="' + esc(action) + '">' +
        (primary ? '<i class="bi bi-send" aria-hidden="true"></i>' : '') + 'Send Test</button>' +
    '</div>';
  }

  function selectField(label, dataField, options, selectedIndex) {
    var optionsHtml = options.map(function (option, index) {
      return '<option' + (index === (selectedIndex || 0) ? ' selected' : '') + '>' + esc(option) + '</option>';
    }).join('');
    return '<label class="settings-field"><span class="settings-label">' + esc(label) + '</span>' +
      '<select class="settings-select"' + (dataField ? ' data-sms-field="' + esc(dataField) + '"' : '') + '>' + optionsHtml + '</select></label>';
  }

  panel.innerHTML =
    '<div class="sms-settings">' +
      '<div class="sms-settings-topbar">' +
        '<nav class="sms-subtabs" aria-label="SMS setting sections">' +
          '<button type="button" data-sms-tab="welcome" class="active" aria-current="page">Welcome SMS</button>' +
          '<button type="button" data-sms-tab="after">After Checkout</button>' +
          '<button type="button" data-sms-tab="wait-care">Wait Care</button>' +
          '<button type="button" data-sms-tab="automation">Automation Settings</button>' +
        '</nav>' +
        '<span class="salon-status-pill" data-sms-automation-pill>Automation ON</span>' +
      '</div>' +
      '<p class="settings-help sms-settings-status" data-sms-status role="status" aria-live="polite"></p>' +

      '<section data-sms-panel="automation" hidden>' +
        '<div class="sms-columns">' +
          '<div class="sms-col sms-card"><h3>Waitlist Automation Setup</h3>' +
          '<h4 class="sms-section-title">Waitlist timing</h4><div class="settings-field-grid">' +
            selectField('Return notice', 'returnNotice', ['15 minutes before', '10 minutes before', '20 minutes before']) +
            selectField('No response grace', null, ['10 minutes', '5 minutes', '15 minutes']) +
            selectField('Internal ETA threshold', null, ['10 minutes', '5 minutes', '15 minutes']) +
          '</div>' +
          '<h4 class="sms-section-title">Return Soon SMS</h4><div class="settings-field-grid">' +
            selectField('Send mode', 'returnSoonSendMode', ['Automatic at return notice', 'Manager approval', 'Manual']) +
            quickTemplateMarkup('return-soon', RETURN_SOON_TEMPLATE_OPTIONS, RETURN_SOON_TEMPLATES, 'return-reminder') +
            '<label class="settings-field sms-field-full"><span class="settings-label">Message</span>' + smsComposerMarkup('returnSoonMessage', RETURN_SOON_TEMPLATES['return-reminder'], RETURN_SOON_TOKENS) + '</label>' +
          '</div><div class="sms-message-test">' + testSendMarkup('send-test-return-soon', false) + '</div>' +
          '<h4 class="sms-section-title">Ready Now SMS</h4><div class="settings-field-grid">' +
            selectField('Send mode', 'readyNowSendMode', ['Manual', 'Automatic', 'Manager approval']) +
            quickTemplateMarkup('ready-now', READY_NOW_TEMPLATE_OPTIONS, READY_NOW_TEMPLATES, 'ready-now') +
            '<label class="settings-field sms-field-full"><span class="settings-label">Message</span>' + smsComposerMarkup('readyNowMessage', READY_NOW_TEMPLATES['ready-now'], GENERAL_MESSAGE_TOKENS) + '</label>' +
          '</div><div class="sms-message-test">' + testSendMarkup('send-test-ready-now', false) + '</div>' +
          '<div class="sms-actions">' +
            '<button type="button" class="booking-primary-button" data-sms-action="save-automation"><i class="bi bi-check2" aria-hidden="true"></i>Save Automation Settings</button>' +
            '<button type="button" class="booking-secondary-button" data-sms-action="pause-automation">Pause automation</button>' +
          '</div></div>' +
          '<div class="sms-col-side sms-card"><h3>Waitlist previews</h3><div class="sms-preview-stack">' +
            '<div><h4 class="sms-section-title">Return Soon</h4><div class="sms-phone"><div class="sms-phone-screen"><div class="sms-phone-bar"></div>' +
              '<div class="sms-phone-title">Messages</div>' +
              '<div class="sms-phone-bubble" data-sms-preview="returnSoonMessage">' + esc(renderTokens(RETURN_SOON_TEMPLATES['return-reminder'])) + '</div>' +
            '</div></div></div>' +
            '<div><h4 class="sms-section-title">Ready Now</h4><div class="sms-phone"><div class="sms-phone-screen"><div class="sms-phone-bar"></div>' +
              '<div class="sms-phone-title">Messages</div>' +
              '<div class="sms-phone-bubble" data-sms-preview="readyNowMessage">' + esc(renderTokens(READY_NOW_TEMPLATES['ready-now'])) + '</div>' +
            '</div></div></div>' +
          '</div></div>' +
        '</div>' +
      '</section>' +

      '<section data-sms-panel="wait-care" hidden>' +
        '<div class="sms-columns">' +
          '<div class="sms-col sms-card"><h3>Wait Care Setup</h3>' +
            '<div class="settings-toggle-row"><span>Send Wait Care messages when a delay threshold is reached</span>' +
            '<button class="toggle-pill is-on" type="button" role="switch" aria-checked="true" aria-label="Toggle Wait Care SMS" data-sms-wait-care-enabled></button></div>' +
            '<h4 class="sms-section-title">Wait Care rules</h4><div class="settings-field-grid">' +
            selectField('10–19 min delay', null, ['Auto · 50 points', 'Approval required']) +
            selectField('20–29 min delay', null, ['Auto · Free add-on', 'Approval required']) +
            selectField('30–44 min delay', null, ['Approval · $5 voucher', 'Automatic']) +
            selectField('45+ min delay', null, ['Manager selects benefit', 'Auto · $10 voucher']) +
          '</div>' +
            '<h4 class="sms-section-title">Wait Care SMS</h4>' +
            '<div class="settings-field-grid">' +
              selectField('Send mode', 'waitCareSendMode', ['Manager approval', 'Automatic', 'Manual']) +
              selectField('Link availability', 'waitCareLinkValidity', LIVE_LINK_VALIDITY_OPTIONS) +
              quickTemplateMarkup('wait-care', WAIT_CARE_TEMPLATE_OPTIONS, WAIT_CARE_TEMPLATES, 'care-benefit') +
              '<label class="settings-field sms-field-full"><span class="settings-label">Message</span>' + smsComposerMarkup('waitCareMessage', WAIT_CARE_DEFAULT, WAIT_CARE_TOKENS) + '</label>' +
            '</div>' +
            '<div class="sms-actions">' +
              '<button type="button" class="booking-primary-button" data-sms-action="save-wait-care"><i class="bi bi-check2" aria-hidden="true"></i>Save Wait Care Settings</button>' +
              testSendMarkup('send-test-wait-care', false) +
            '</div>' +
          '</div>' +
          '<div class="sms-col-side sms-card"><h3>Wait Care preview</h3>' +
            '<div class="sms-phone"><div class="sms-phone-screen"><div class="sms-phone-bar"></div>' +
              '<div class="sms-phone-title">Messages</div>' +
              '<div class="sms-phone-bubble" data-sms-preview="waitCareMessage">' + esc(renderTokens(WAIT_CARE_DEFAULT)) + '</div>' +
              '<p class="sms-phone-caption" data-sms-link-validity-preview="waitCareLinkValidity">' + esc(LINK_VALIDITY_CAPTIONS[LIVE_LINK_VALIDITY_OPTIONS[0]]) + '</p>' +
            '</div></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section data-sms-panel="after" hidden>' +
        '<div class="sms-columns">' +
          '<div class="sms-col sms-card"><h3>Thank You SMS Setup</h3>' +
            '<div class="settings-toggle-row"><span>Send after checkout is completed</span>' +
            '<button class="toggle-pill is-on" type="button" role="switch" aria-checked="true" aria-label="Toggle Thank You SMS after checkout"></button></div>' +
            '<div class="settings-field-grid">' +
              selectField('Send mode', null, ['Automatic after checkout', 'Manual review before sending']) +
              selectField('Smart Link destination', null, ['After-visit page', 'OneQR Main Menu']) +
              selectField('Link availability', 'afterLinkValidity', AFTER_LINK_VALIDITY_OPTIONS) +
              quickTemplateMarkup('after', AFTER_CHECKOUT_TEMPLATE_OPTIONS, AFTER_CHECKOUT_TEMPLATES, 'ticket-receipt') +
              '<label class="settings-field sms-field-full"><span class="settings-label">Message</span>' + smsComposerMarkup('afterMessage', AFTER_CHECKOUT_DEFAULT, AFTER_CHECKOUT_TOKENS) + '</label>' +
              selectField('Review', null, ['Show to every customer', 'Hide']) +
              selectField('Tip', null, ['Show only when no tip was completed', 'Hide tip after checkout']) +
              selectField('Private feedback', null, ['Show to every customer', 'Hide']) +
              selectField('Promotion', null, ['Show only with marketing consent', 'Hide promotion']) +
            '</div>' +
            '<p class="sms-notice"><strong>Customer protection:</strong> Never ask for a second tip when one was already completed. Do not reward only positive public reviews. Promotion visibility requires valid marketing consent.</p>' +
            '<div class="sms-actions">' +
              '<button type="button" class="booking-primary-button" data-sms-action="save-after"><i class="bi bi-check2" aria-hidden="true"></i>Save After Checkout Setup</button>' +
              testSendMarkup('send-test-after', false) +
            '</div>' +
          '</div>' +
          '<div class="sms-col-side sms-card"><h3>After Checkout preview</h3>' +
            '<div class="sms-phone"><div class="sms-phone-screen"><div class="sms-phone-bar"></div>' +
              '<div class="sms-phone-title">Messages</div>' +
              '<div class="sms-phone-bubble" data-sms-preview="afterMessage">' + esc(renderTokens(AFTER_CHECKOUT_DEFAULT)) + '</div>' +
              '<p class="sms-phone-caption" data-sms-link-validity-preview="afterLinkValidity">' + esc(LINK_VALIDITY_CAPTIONS[AFTER_LINK_VALIDITY_OPTIONS[0]]) + '</p>' +
            '</div></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section data-sms-panel="welcome">' +
        '<div class="sms-columns">' +
          '<div class="sms-col sms-card"><h3>Welcome SMS Setup</h3>' +
            '<div class="settings-toggle-row"><span>Enable welcome message after check-in</span>' +
            '<button class="toggle-pill is-on" type="button" role="switch" aria-checked="true" aria-label="Toggle welcome message after check-in"></button></div>' +
            '<div class="settings-field-grid">' +
              selectField('Send mode', null, ['Automatic after check-in', 'Manual review before sending']) +
              selectField('Wait-time visibility', null, ['Do not show wait time', 'Show estimated range', 'Staff decides per customer']) +
              selectField('Smart Link destination', null, ['Personalized OneQR Menu', 'OneQR Main Menu', 'Service Menu', 'Rewards & Benefits']) +
              selectField('Link availability', 'welcomeLinkValidity', LIVE_LINK_VALIDITY_OPTIONS) +
              quickTemplateMarkup('welcome', WELCOME_TEMPLATE_OPTIONS, WELCOME_TEMPLATES, 'welcome') +
              '<label class="settings-field sms-field-full"><span class="settings-label">Message</span>' + smsComposerMarkup('welcomeMessage', WELCOME_TEMPLATES.welcome, WELCOME_MESSAGE_TOKENS) + '</label>' +
            '</div>' +
            '<p class="sms-notice"><strong>Marketing consent required:</strong> If OneQR highlights a promotional offer, the customer must have valid marketing consent. Without consent, the same link opens the standard OneQR menu and existing customer benefits only.</p>' +
            '<div class="sms-actions">' +
              '<button type="button" class="booking-primary-button" data-sms-action="save-welcome"><i class="bi bi-check2" aria-hidden="true"></i>Save Welcome Setup</button>' +
              testSendMarkup('send-test-welcome', false) +
            '</div>' +
          '</div>' +
          '<div class="sms-col-side sms-card"><h3>Customer preview</h3>' +
            '<div class="sms-phone"><div class="sms-phone-screen"><div class="sms-phone-bar"></div>' +
              '<div class="sms-phone-title">Messages</div>' +
              '<div class="sms-phone-bubble" data-sms-preview="welcomeMessage">' + esc(renderTokens(WELCOME_TEMPLATES.welcome)) + '</div>' +
              '<p class="sms-phone-caption" data-sms-link-validity-preview="welcomeLinkValidity">' + esc(LINK_VALIDITY_CAPTIONS[LIVE_LINK_VALIDITY_OPTIONS[0]]) + '</p>' +
            '</div></div>' +
          '</div>' +
        '</div>' +
      '</section>' +
    '</div>';

  /* ── Sub-tab switching ── */
  function selectSmsTab(tab) {
    $$('[data-sms-tab]').forEach(function (button) {
      var on = button.dataset.smsTab === tab;
      button.classList.toggle('active', on);
      if (on) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    $$('[data-sms-panel]').forEach(function (section) {
      section.hidden = section.dataset.smsPanel !== tab;
    });
  }
  $$('[data-sms-tab]').forEach(function (button) {
    button.addEventListener('click', function () { selectSmsTab(button.dataset.smsTab); });
  });

  /* ── Status message ── */
  var statusTimer = null;
  function setSmsStatus(message) {
    var status = $('[data-sms-status]');
    if (!status) return;
    status.textContent = message;
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { status.textContent = ''; }, 3200);
  }

  /* ── Live message previews ── */
  function refreshPreview(field) {
    var textarea = $('[data-sms-field="' + field + '"]');
    var preview = $('[data-sms-preview="' + field + '"]');
    if (textarea && preview) preview.textContent = renderTokens(textarea.value);
    var count = $('[data-sms-count="' + field + '"]');
    if (textarea && count) {
      var length = textarea.value.length;
      count.textContent = length + ' chars — ' + Math.max(1, Math.ceil(length / 160)) + ' SMS';
    }
  }
  $$('[data-sms-field="afterMessage"], [data-sms-field="welcomeMessage"], [data-sms-field="waitCareMessage"], [data-sms-field="returnSoonMessage"], [data-sms-field="readyNowMessage"]').forEach(function (textarea) {
    textarea.addEventListener('input', function () { refreshPreview(textarea.dataset.smsField); });
  });

  var returnNotice = $('[data-sms-field="returnNotice"]');
  if (returnNotice) returnNotice.addEventListener('change', function () {
    TOKENS['[Return Notice]'] = returnNotice.value.replace(/\s+before$/, '');
    refreshPreview('returnSoonMessage');
  });

  $$('[data-sms-link-validity-preview]').forEach(function (preview) {
    var field = preview.dataset.smsLinkValidityPreview;
    var select = $('[data-sms-field="' + field + '"]');
    if (!select) return;
    select.addEventListener('change', function () {
      preview.textContent = LINK_VALIDITY_CAPTIONS[select.value] || '';
    });
  });

  $$('[data-sms-template]').forEach(function (button) {
    button.addEventListener('click', function () {
      var group = button.dataset.smsTemplate;
      var config = {
        after: { messages: AFTER_CHECKOUT_TEMPLATES, field: 'afterMessage' },
        'wait-care': { messages: WAIT_CARE_TEMPLATES, field: 'waitCareMessage' },
        'return-soon': { messages: RETURN_SOON_TEMPLATES, field: 'returnSoonMessage' },
        'ready-now': { messages: READY_NOW_TEMPLATES, field: 'readyNowMessage' },
        welcome: { messages: WELCOME_TEMPLATES, field: 'welcomeMessage' }
      }[group];
      if (!config) return;
      var messages = config.messages;
      var field = config.field;
      var textarea = $('[data-sms-field="' + field + '"]');
      if (!textarea || !messages[button.dataset.templateKey]) return;
      $$('[data-sms-template="' + group + '"]').forEach(function (card) {
        var selected = card === button;
        card.classList.toggle('is-selected', selected);
        card.setAttribute('aria-pressed', String(selected));
      });
      textarea.value = messages[button.dataset.templateKey];
      refreshPreview(field);
    });
  });

  var waitCareEnabled = $('[data-sms-wait-care-enabled]');
  if (waitCareEnabled) {
    waitCareEnabled.addEventListener('click', function (event) {
      event.stopPropagation();
      var enabled = waitCareEnabled.getAttribute('aria-checked') !== 'true';
      waitCareEnabled.setAttribute('aria-checked', String(enabled));
      waitCareEnabled.classList.toggle('is-on', enabled);
      setSmsStatus(enabled ? 'Wait Care SMS enabled.' : 'Wait Care SMS paused.');
    });
  }

  $$('[data-sms-insert-token]').forEach(function (button) {
    button.addEventListener('click', function () {
      var field = button.dataset.smsTarget || 'welcomeMessage';
      var textarea = $('[data-sms-field="' + field + '"]');
      if (!textarea) return;
      var token = button.dataset.smsInsertToken;
      var start = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : textarea.value.length;
      var end = typeof textarea.selectionEnd === 'number' ? textarea.selectionEnd : start;
      var insertText = token;
      if (start === end && start > 0 && !/\s/.test(textarea.value.charAt(start - 1))) insertText = ' ' + insertText;
      textarea.value = textarea.value.slice(0, start) + insertText + textarea.value.slice(end);
      textarea.focus();
      textarea.setSelectionRange(start + insertText.length, start + insertText.length);
      refreshPreview(field);
    });
  });

  /* ── Automation pill / pause toggle ── */
  var automationOn = true;
  $('[data-sms-action="pause-automation"]').addEventListener('click', function (event) {
    automationOn = !automationOn;
    var pill = $('[data-sms-automation-pill]');
    pill.textContent = automationOn ? 'Automation ON' : 'Automation OFF';
    pill.classList.toggle('is-inactive', !automationOn);
    event.currentTarget.textContent = automationOn ? 'Pause automation' : 'Resume automation';
    setSmsStatus(automationOn ? 'Automation resumed.' : 'Automation paused.');
  });

  /* ── Save / send test actions ── */
  var ACTION_MESSAGES = {
    'save-automation': 'Automation settings saved.',
    'save-wait-care': 'Wait Care settings saved.',
    'save-after': 'After Checkout settings saved.',
    'send-test-after': 'Thank You test SMS queued.',
    'save-welcome': 'Welcome SMS settings saved.',
    'send-test-welcome': 'Test SMS queued.',
    'send-test-wait-care': 'Wait Care test SMS queued.',
    'send-test-return-soon': 'Return Soon test SMS queued.',
    'send-test-ready-now': 'Ready Now test SMS queued.'
  };
  function formatTestPhone(value, country) {
    var digits = String(value || '').replace(/\D/g, '');
    if (country === '+84') {
      if (digits.slice(0, 2) === '84') digits = digits.slice(2);
      if (digits.charAt(0) === '0') digits = digits.slice(1);
      if (digits.length !== 9) return null;
      var vietnam = digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6);
      return { input: vietnam, full: '+84 ' + vietnam };
    }
    if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1);
    if (digits.length !== 10) return null;
    var us = '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
    return { input: us, full: '+1 ' + us };
  }
  Object.keys(ACTION_MESSAGES).forEach(function (action) {
    var button = $('[data-sms-action="' + action + '"]');
    if (button) button.addEventListener('click', function () {
      if (action.indexOf('send-test-') === 0) {
        var phone = $('[data-sms-test-phone="' + action + '"]');
        var country = $('[data-sms-test-country="' + action + '"]');
        var formatted = phone ? formatTestPhone(phone.value, country ? country.value : '+1') : null;
        if (!formatted) {
          setSmsStatus('Enter a valid test phone number.');
          if (phone) phone.focus();
          return;
        }
        phone.value = formatted.input;
        setSmsStatus('Test SMS queued for ' + formatted.full + '.');
        return;
      }
      setSmsStatus(ACTION_MESSAGES[action]);
    });
  });
})();
