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
    '[OneQR Link]': 'nexora.app/q/demo',
    '[Ticket Number]': '#12',
    '[Ticket Total]': '$45.00',
    '[Review Link]': 'nexora.app/review/demo',
    '[Tip Link]': 'nexora.app/tip/demo',
    '[Feedback Link]': 'nexora.app/feedback/demo',
    '[Rewards Link]': 'nexora.app/rewards/demo',
    '[Booking Link]': 'nexora.app/book/demo',
    '[Receipt Link]': 'nexora.app/r/demo',
    '[Salon Phone]': '(713) 555-0123',
    '[Wait Time]': '15-20 minutes'
  };
  function renderTokens(text) {
    return Object.keys(TOKENS).reduce(function (out, token) {
      return out.split(token).join(TOKENS[token]);
    }, text || '');
  }

  var WELCOME_TEMPLATES = {
    welcome: 'Hi [Customer Name], welcome to [Salon Name]! You\'re checked in. View your visit: [OneQR Link]',
    'check-in': 'Hi [Customer Name], you\'re checked in at [Salon Name]. Follow your visit: [OneQR Link]'
  };
  var WELCOME_TEMPLATE_OPTIONS = [
    { key: 'welcome', label: 'Welcome message' },
    { key: 'check-in', label: 'Check-in confirmed' }
  ];
  var AFTER_CHECKOUT_TEMPLATES = {
    'ticket-receipt': 'Thanks for visiting [Salon Name]! Ticket [Ticket Number]: [Ticket Total]. Receipt: [Receipt Link]',
    review: 'Thanks for visiting [Salon Name]! How was your visit? Leave a review: [Review Link]',
    tip: 'Thanks for visiting [Salon Name]! If you haven\'t tipped yet, add one here: [Tip Link]',
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
    'delay-update': 'Hi [Customer Name], we\'re sorry for the wait at [Salon Name]. Current estimate: [Wait Time]. Track your visit: [OneQR Link]',
    'wait-estimate': 'Hi [Customer Name], thanks for your patience at [Salon Name]. Estimated wait: [Wait Time]. Updates: [OneQR Link]'
  };
  var WAIT_CARE_TEMPLATE_OPTIONS = [
    { key: 'delay-update', label: 'Delay update' },
    { key: 'wait-estimate', label: 'Wait time update' }
  ];
  var WAIT_CARE_DEFAULT = WAIT_CARE_TEMPLATES['wait-estimate'];
  var RETURN_SOON_TEMPLATES = {
    'return-reminder': 'Hi [Customer Name], your turn at [Salon Name] is coming up. Please return soon: [OneQR Link]',
    'head-back': 'Hi [Customer Name], please head back to [Salon Name]. Your turn is coming up: [OneQR Link]'
  };
  var RETURN_SOON_TEMPLATE_OPTIONS = [
    { key: 'return-reminder', label: 'Return reminder' },
    { key: 'head-back', label: 'Head back now' }
  ];
  var READY_NOW_TEMPLATES = {
    'ready-now': 'Hi [Customer Name], we\'re ready for you at [Salon Name]. Please come to the front desk now. Details: [OneQR Link]',
    'your-turn': 'Hi [Customer Name], it\'s your turn at [Salon Name]. Please come to the front desk now: [OneQR Link]'
  };
  var READY_NOW_TEMPLATE_OPTIONS = [
    { key: 'ready-now', label: 'Ready now' },
    { key: 'your-turn', label: 'Your turn' }
  ];
  var VISIT_LINK_VALIDITY_OPTIONS = ['1 day after checkout', '2 days after checkout', '7 days after checkout', '30 days after checkout'];

  var AFTER_CHECKOUT_TOKENS = [
    { token: '[Salon Name]', label: 'Shop name', icon: 'bi-shop' },
    { token: '[Ticket Number]', label: 'Ticket number', icon: 'bi-receipt' },
    { token: '[Ticket Total]', label: 'Ticket total', icon: 'bi-currency-dollar' },
    { token: '[Review Link]', label: 'Review link', icon: 'bi-star' },
    { token: '[Tip Link]', label: 'Tip link', icon: 'bi-cash-coin' },
    { token: '[Feedback Link]', label: 'Feedback link', icon: 'bi-chat-left-text' },
    { token: '[Booking Link]', label: 'Booking link', icon: 'bi-calendar-check' },
    { token: '[Receipt Link]', label: 'Receipt link', icon: 'bi-receipt-cutoff' }
  ];
  var GENERAL_MESSAGE_TOKENS = [
    { token: '[Customer Name]', label: 'Customer name', icon: 'bi-person' },
    { token: '[Salon Name]', label: 'Shop name', icon: 'bi-shop' },
    { token: '[OneQR Link]', label: 'Visit link', icon: 'bi-link-45deg' }
  ];
  var WELCOME_MESSAGE_TOKENS = GENERAL_MESSAGE_TOKENS.concat([
    { token: '[Wait Time]', label: 'Wait time', icon: 'bi-clock' },
    { token: '[Salon Phone]', label: 'Phone number', icon: 'bi-telephone' }
  ]);
  var WAIT_CARE_TOKENS = [
    { token: '[Customer Name]', label: 'Customer name', icon: 'bi-person' },
    { token: '[Salon Name]', label: 'Shop name', icon: 'bi-shop' },
    { token: '[Wait Time]', label: 'Wait time', icon: 'bi-clock' },
    { token: '[OneQR Link]', label: 'Visit link', icon: 'bi-link-45deg' }
  ];
  var RETURN_SOON_TOKENS = GENERAL_MESSAGE_TOKENS;

  function smsComposerMarkup(field, value, tokens) {
    var buttons = tokens.map(function (item) {
      return '<button type="button" class="sms-insert-chip" data-sms-insert-token="' + esc(item.token) + '" data-sms-target="' + esc(field) + '">' +
        '<i class="bi ' + esc(item.icon) + '" aria-hidden="true"></i>' + esc(item.label) + '</button>';
    }).join('');
    return '<div class="sms-composer" data-sms-composer>' +
      '<div class="sms-composer-toolbar"><span>Insert:</span><div class="sms-insert-list">' + buttons + '</div></div>' +
      '<textarea aria-label="Message" class="settings-input sms-textarea" data-sms-field="' + esc(field) + '" rows="4">' + esc(value) + '</textarea>' +
      '<div class="sms-composer-footer"><span>Estimate uses sample customer details; actual length may vary</span><strong data-sms-count="' + esc(field) + '">—</strong></div>' +
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
          '<button type="button" data-sms-tab="automation">Waitlist SMS</button>' +
          '<button type="button" data-sms-tab="links">Link Settings</button>' +
        '</nav>' +
      '</div>' +
      '<p class="settings-help sms-settings-status" data-sms-status role="status" aria-live="polite"></p>' +

      '<p class="settings-help">Prototype: settings are saved in this browser. Send Test previews a message; no SMS is sent.</p>' +
      '<section class="sms-card sms-shared-links" data-sms-panel="links" data-sms-shared-links aria-labelledby="sms-link-settings-title" hidden>' +
        '<div><h3 id="sms-link-settings-title">Visit link settings</h3><p class="settings-help">One expiry for the OneQR visit link in every SMS. Active during the visit; the countdown starts at checkout. Sending the link again does not restart it.</p>' +
        '<p class="settings-help">After checkout, the same link opens the after-visit page. Receipt, review and other separate links follow their own expiry rules.</p></div>' +
        '<div class="sms-shared-link-controls">' + selectField('Link availability', 'visitLinkValidity', VISIT_LINK_VALIDITY_OPTIONS) +
          '<button type="button" class="booking-primary-button" data-sms-action="save-link-settings">Save link settings</button></div>' +
        '<p class="settings-help" data-sms-link-example></p><p class="settings-help" data-sms-local-status role="status"></p>' +
      '</section>' +
      '<section data-sms-panel="automation" hidden>' +
        '<div class="sms-columns">' +
          '<div class="sms-col sms-card"><h3>Waitlist SMS Templates</h3>' +
          '<p class="settings-help">Save templates for the front desk. Staff selects a customer in Live Waitlist, reviews the message and sends it manually.</p>' +
          '<p class="settings-help"><a href="pos-front-desk.html?section=waitlist&amp;tab=waitlist">Open Live Waitlist →</a></p>' +
          '<div data-sms-group="wait-care"><h4 class="sms-section-title">Wait Update SMS</h4>' +
            '<div class="settings-toggle-row"><span>Enable Wait Update SMS</span>' +
            '<button class="toggle-pill is-on" type="button" role="switch" aria-checked="true" aria-label="Toggle Wait Update SMS" data-sms-enabled="wait-care" data-sms-wait-care-enabled></button></div>' +
            '<p class="settings-help">Update customers who still need to wait. Confirm the current waiting estimate before sending.</p>' +
            '<p class="settings-help" data-sms-care-summary aria-live="polite"></p>' +
            '<div class="settings-field-grid">' +
              quickTemplateMarkup('wait-care', WAIT_CARE_TEMPLATE_OPTIONS, WAIT_CARE_TEMPLATES, 'wait-estimate') +
              '<div class="settings-field sms-field-full"><span class="settings-label">Message</span>' + smsComposerMarkup('waitCareMessage', WAIT_CARE_DEFAULT, WAIT_CARE_TOKENS) + '</div>' +
            '</div><div class="sms-message-test">' + testSendMarkup('send-test-wait-care', false) + '</div>' +
          '</div>' +
          '<h4 class="sms-section-title">Return Soon SMS</h4><div class="settings-field-grid">' +
            quickTemplateMarkup('return-soon', RETURN_SOON_TEMPLATE_OPTIONS, RETURN_SOON_TEMPLATES, 'return-reminder') +
            '<div class="settings-field sms-field-full"><span class="settings-label">Message</span>' + smsComposerMarkup('returnSoonMessage', RETURN_SOON_TEMPLATES['return-reminder'], RETURN_SOON_TOKENS) + '</div>' +
          '</div><div class="sms-message-test">' + testSendMarkup('send-test-return-soon', false) + '</div>' +
          '<h4 class="sms-section-title">Ready Now SMS</h4><div class="settings-field-grid">' +
            quickTemplateMarkup('ready-now', READY_NOW_TEMPLATE_OPTIONS, READY_NOW_TEMPLATES, 'ready-now') +
            '<div class="settings-field sms-field-full"><span class="settings-label">Message</span>' + smsComposerMarkup('readyNowMessage', READY_NOW_TEMPLATES['ready-now'], GENERAL_MESSAGE_TOKENS) + '</div>' +
          '</div><div class="sms-message-test">' + testSendMarkup('send-test-ready-now', false) + '</div>' +
          '<div class="sms-actions">' +
            '<button type="button" class="booking-primary-button" data-sms-action="save-automation"><i class="bi bi-check2" aria-hidden="true"></i>Save Templates</button>' +
          '</div></div>' +
          '<div class="sms-col-side sms-card"><h3>Waitlist previews</h3><div class="sms-preview-stack">' +
            '<div><h4 class="sms-section-title">Wait Update</h4><div class="sms-phone"><div class="sms-phone-screen"><div class="sms-phone-bar"></div>' +
              '<div class="sms-phone-title">Messages</div>' +
              '<div class="sms-phone-bubble" data-sms-preview="waitCareMessage">' + esc(renderTokens(WAIT_CARE_DEFAULT)) + '</div>' +
              '<p class="sms-phone-caption" data-sms-link-validity-preview="waitCareLinkValidity"></p>' +
            '</div></div></div>' +
            '<div><h4 class="sms-section-title">Return Soon</h4><div class="sms-phone"><div class="sms-phone-screen"><div class="sms-phone-bar"></div>' +
              '<div class="sms-phone-title">Messages</div>' +
              '<div class="sms-phone-bubble" data-sms-preview="returnSoonMessage">' + esc(renderTokens(RETURN_SOON_TEMPLATES['return-reminder'])) + '</div>' +
              '<p class="sms-phone-caption" data-sms-link-validity-preview="returnSoonLinkValidity"></p>' +
            '</div></div></div>' +
            '<div><h4 class="sms-section-title">Ready Now</h4><div class="sms-phone"><div class="sms-phone-screen"><div class="sms-phone-bar"></div>' +
              '<div class="sms-phone-title">Messages</div>' +
              '<div class="sms-phone-bubble" data-sms-preview="readyNowMessage">' + esc(renderTokens(READY_NOW_TEMPLATES['ready-now'])) + '</div>' +
              '<p class="sms-phone-caption" data-sms-link-validity-preview="readyNowLinkValidity"></p>' +
            '</div></div></div>' +
          '</div></div>' +
        '</div>' +
      '</section>' +

      '<section data-sms-panel="after" hidden>' +
        '<div class="sms-columns">' +
          '<div class="sms-col sms-card"><h3>Thank You SMS Setup</h3>' +
            '<div class="settings-toggle-row"><span>Send after checkout is completed</span>' +
            '<button class="toggle-pill is-on" type="button" role="switch" aria-checked="true" data-sms-enabled="after" aria-label="Toggle Thank You SMS after checkout"></button></div>' +
            '<div class="settings-field-grid">' +
              selectField('Send mode', 'afterSendMode', ['Automatic after checkout', 'Manual review before sending']) +
              quickTemplateMarkup('after', AFTER_CHECKOUT_TEMPLATE_OPTIONS, AFTER_CHECKOUT_TEMPLATES, 'ticket-receipt') +
              '<div class="settings-field sms-field-full"><span class="settings-label">Message</span>' + smsComposerMarkup('afterMessage', AFTER_CHECKOUT_DEFAULT, AFTER_CHECKOUT_TOKENS) + '</div>' +
            '</div>' +
            '<p class="sms-notice"><strong>Customer protection:</strong> Never ask for a second tip when one was already completed. Do not reward only positive public reviews. Marketing messages require valid consent.</p>' +
            '<div class="sms-actions">' +
              '<button type="button" class="booking-primary-button" data-sms-action="save-after"><i class="bi bi-check2" aria-hidden="true"></i>Save After Checkout Setup</button>' +
              testSendMarkup('send-test-after', false) +
            '</div>' +
          '</div>' +
          '<div class="sms-col-side sms-card"><h3>After Checkout preview</h3>' +
            '<div class="sms-phone"><div class="sms-phone-screen"><div class="sms-phone-bar"></div>' +
              '<div class="sms-phone-title">Messages</div>' +
              '<div class="sms-phone-bubble" data-sms-preview="afterMessage">' + esc(renderTokens(AFTER_CHECKOUT_DEFAULT)) + '</div>' +
              '<p class="sms-phone-caption" data-sms-link-validity-preview="afterLinkValidity"></p>' +
            '</div></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section data-sms-panel="welcome">' +
        '<div class="sms-columns">' +
          '<div class="sms-col sms-card"><h3>Welcome SMS Setup</h3>' +
            '<div class="settings-toggle-row"><span>Enable welcome message after check-in</span>' +
            '<button class="toggle-pill is-on" type="button" role="switch" aria-checked="true" data-sms-enabled="welcome" aria-label="Toggle welcome message after check-in"></button></div>' +
            '<div class="settings-field-grid">' +
              selectField('Send mode', 'welcomeSendMode', ['Automatic after check-in', 'Manual review before sending']) +
              quickTemplateMarkup('welcome', WELCOME_TEMPLATE_OPTIONS, WELCOME_TEMPLATES, 'welcome') +
              '<div class="settings-field sms-field-full"><span class="settings-label">Message</span>' + smsComposerMarkup('welcomeMessage', WELCOME_TEMPLATES.welcome, WELCOME_MESSAGE_TOKENS) + '</div>' +
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
              '<p class="sms-phone-caption" data-sms-link-validity-preview="welcomeLinkValidity"></p>' +
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
  function setSmsStatus(message, section) {
    $('[data-sms-status]').textContent = message;
    $$('[data-sms-local-status]').forEach(function (status) { status.textContent = ''; });
    var target = section || $('[data-sms-panel]:not([hidden])');
    if (target) target.querySelector('[data-sms-local-status]').textContent = message;
  }
  $$('[data-sms-panel]').forEach(function (section) {
    if (section.querySelector('[data-sms-local-status]')) return;
    var status = document.createElement('p');
    status.className = 'settings-help sms-local-status';
    status.setAttribute('data-sms-local-status', '');
    status.setAttribute('role', 'status');
    section.querySelector('.sms-actions').appendChild(status);
  });

  /* ── Live message previews ── */
  var templateGroups = {
    welcomeMessage: ['welcome', WELCOME_TEMPLATES], afterMessage: ['after', AFTER_CHECKOUT_TEMPLATES],
    waitCareMessage: ['wait-care', WAIT_CARE_TEMPLATES], returnSoonMessage: ['return-soon', RETURN_SOON_TEMPLATES],
    readyNowMessage: ['ready-now', READY_NOW_TEMPLATES]
  };
  // GSM-7 extension characters use two septets. Unicode uses UTF-16 units.
  var gsmBasic = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
  var gsmExtended = '^{}\\[~]|€\f';
  function messageEstimate(text) {
    var units = 0, unicode = false;
    Array.from(text).forEach(function (char) {
      if (gsmBasic.indexOf(char) >= 0) units++;
      else if (gsmExtended.indexOf(char) >= 0) units += 2;
      else unicode = true;
    });
    if (unicode) units = text.length;
    var single = unicode ? 70 : 160, multi = unicode ? 67 : 153;
    var parts = units === 0 ? 0 : 1;
    if (units > single) {
      var used = 0;
      Array.from(text).forEach(function (char) {
        var size = unicode ? char.length : gsmExtended.indexOf(char) >= 0 ? 2 : 1;
        if (used + size > multi) { parts++; used = 0; }
        used += size;
      });
    }
    return Array.from(text).length + ' chars — ~' + parts + ' SMS (' + (unicode ? 'Unicode' : 'GSM-7') + ')';
  }
  function refreshCareDelivery() {
    var enabled = $('[data-sms-wait-care-enabled]').getAttribute('aria-checked') === 'true';
    $('[data-sms-care-summary]').textContent = enabled
      ? 'Front desk staff can select Wait Update in Live Waitlist, review the message and send it manually. No timed trigger.'
      : 'Wait Update is unavailable to front desk staff. Save to apply changes.';
  }

  function refreshPreview(field) {
    var textarea = $('[data-sms-field="' + field + '"]');
    if (!textarea) return;
    var rendered = renderTokens(textarea.value);
    var preview = $('[data-sms-preview="' + field + '"]');
    if (preview) preview.textContent = rendered || 'Your message will appear here…';
    var count = $('[data-sms-count="' + field + '"]');
    if (count) count.textContent = messageEstimate(rendered);
    var group = templateGroups[field];
    if (group) $$('[data-sms-template="' + group[0] + '"]').forEach(function (button) {
      var selected = group[1][button.dataset.templateKey] === textarea.value;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    var caption = $('[data-sms-link-validity-preview="' + field.replace('Message', 'LinkValidity') + '"]');
    if (caption) {
      caption.hidden = textarea.value.indexOf('[OneQR Link]') < 0;
      caption.textContent = caption.hidden ? '' : 'Visit link remains active for ' + $('[data-sms-field="visitLinkValidity"]').value + '.';
    }
  }
  $$('[data-sms-field="afterMessage"], [data-sms-field="welcomeMessage"], [data-sms-field="waitCareMessage"], [data-sms-field="returnSoonMessage"], [data-sms-field="readyNowMessage"]').forEach(function (textarea) {
    textarea.addEventListener('input', function () { refreshPreview(textarea.dataset.smsField); });
  });

  function refreshLinkSettings() {
    var validity = $('[data-sms-field="visitLinkValidity"]').value;
    var days = parseInt(validity, 10);
    $('[data-sms-link-example]').textContent = 'Example: check in at 10:00, check out at 11:00 → the visit link expires at 11:00 ' + (days === 1 ? 'the next day.' : days + ' days later.');
    Object.keys(templateGroups).forEach(refreshPreview);
  }
  $('[data-sms-field="visitLinkValidity"]').addEventListener('change', refreshLinkSettings);

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

  $$('[data-sms-enabled]').forEach(function (toggle) {
    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      var enabled = toggle.getAttribute('aria-checked') !== 'true';
      toggle.setAttribute('aria-checked', String(enabled));
      toggle.classList.toggle('is-on', enabled);
      if (toggle.dataset.smsEnabled === 'wait-care') refreshCareDelivery();
      setSmsStatus((enabled ? 'SMS enabled.' : 'SMS paused.') + ' Save to apply changes.', toggle.closest('[data-sms-panel]'));
    });
  });

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

  /* ── Save / send test actions ── */
  var ACTION_MESSAGES = {
    'save-automation': 'Waitlist templates saved.',
    'save-after': 'After Checkout settings saved.',
    'send-test-after': '',
    'save-welcome': 'Welcome SMS settings saved.',
    'send-test-welcome': '',
    'send-test-wait-care': '',
    'send-test-return-soon': '',
    'send-test-ready-now': ''
  };
  function formatTestPhone(value, country) {
    var raw = String(value || '').trim();
    if (!/^\+?[\d\s().-]+$/.test(raw) || (raw.indexOf('+') >= 0 && !raw.startsWith(country))) return null;
    var digits = raw.replace(/\D/g, '');
    if (country === '+84') {
      if (digits.length === 11 && digits.slice(0, 2) === '84') digits = digits.slice(2);
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
  var storageKey = 'nexora:salon-sms-settings:v1:' + (window.NEXORA_SALON_DATA?.SALON_ID || 'bitcoin-nail-bar-houston');
  function readSettings() {
    var raw = localStorage.getItem(storageKey);
    if (!raw) return { version: 1, sections: {} };
    var value = JSON.parse(raw);
    if (!value || value.version !== 1 || !value.sections || typeof value.sections !== 'object' || Array.isArray(value.sections)) throw new Error('Invalid saved settings');
    if (value.visitLinkValidity !== undefined && !VISIT_LINK_VALIDITY_OPTIONS.includes(value.visitLinkValidity)) throw new Error('Invalid link expiry');
    Object.values(value.sections).forEach(function (section) {
      if (!section || !section.fields || typeof section.fields !== 'object' || Array.isArray(section.fields) || typeof section.enabled !== 'boolean' || Object.values(section.fields).some(function (field) { return typeof field !== 'string'; })) throw new Error('Invalid saved section');
    });
    return value;
  }
  function validateMessage(textarea, section) {
    var unknown = (textarea.value.match(/\[[^\]\n]+\]/g) || []).find(function (token) { return !Object.hasOwn(TOKENS, token); });
    var error = !textarea.value.trim() ? 'Enter a message before saving or testing.' : unknown ? 'Unsupported field: ' + unknown : '';
    textarea.setAttribute('aria-invalid', String(!!error));
    if (error) { setSmsStatus(error, section); textarea.focus(); return false; }
    return true;
  }
  function saveSection(section) {
    var isWaitlist = section.dataset.smsPanel === 'automation';
    var toggle = isWaitlist ? null : section.querySelector('[data-sms-enabled]');
    var enabled = toggle ? toggle.getAttribute('aria-checked') === 'true' : true;
    var careEnabled = $('[data-sms-wait-care-enabled]').getAttribute('aria-checked') === 'true';
    if (enabled && !Array.from(section.querySelectorAll('textarea[data-sms-field]')).every(function (textarea) {
      return isWaitlist && textarea.dataset.smsField === 'waitCareMessage' && !careEnabled || validateMessage(textarea, section);
    })) return false;
    try {
      var saved = readSettings(), fields = {};
      section.querySelectorAll('[data-sms-field]').forEach(function (field) {
        if (!isWaitlist || field.dataset.smsField !== 'waitCareMessage') fields[field.dataset.smsField] = field.value;
      });
      saved.sections[section.dataset.smsPanel] = { fields: fields, enabled: enabled };
      // Keep the existing storage keys so older saved templates still load in Front Desk.
      // Both groups are written together by the single Save Templates action.
      if (isWaitlist) saved.sections['wait-care'] = {
        fields: { waitCareMessage: $('[data-sms-field="waitCareMessage"]').value }, enabled: careEnabled
      };
      localStorage.setItem(storageKey, JSON.stringify(saved));
      return true;
    } catch (_) { setSmsStatus('Could not save settings. Your edits are still here; saved data has not been replaced.', section); return false; }
  }
  $$('[data-sms-test-country]').forEach(function (country) {
    country.addEventListener('change', function () {
      $('[data-sms-test-phone="' + country.dataset.smsTestCountry + '"]').placeholder = country.value === '+84' ? '0912 345 678' : '(713) 555-0123';
    });
  });
  $('[data-sms-action="save-link-settings"]').addEventListener('click', function () {
    var section = $('[data-sms-shared-links]');
    try {
      var saved = readSettings();
      var validity = $('[data-sms-field="visitLinkValidity"]').value;
      if (!VISIT_LINK_VALIDITY_OPTIONS.includes(validity)) throw new Error('Invalid link expiry');
      saved.visitLinkValidity = validity;
      localStorage.setItem(storageKey, JSON.stringify(saved));
      setSmsStatus('Visit link settings saved.', section);
    } catch (_) { setSmsStatus('Could not save link settings. Your edits are still here; saved data has not been replaced.', section); }
  });
  Object.keys(ACTION_MESSAGES).forEach(function (action) {
    var button = $('[data-sms-action="' + action + '"]');
    if (button) button.addEventListener('click', function () {
      var section = button.closest('[data-sms-panel]');
      if (action.indexOf('send-test-') === 0) {
        var messageField = { 'send-test-welcome':'welcomeMessage', 'send-test-after':'afterMessage', 'send-test-wait-care':'waitCareMessage', 'send-test-return-soon':'returnSoonMessage', 'send-test-ready-now':'readyNowMessage' }[action];
        if (!validateMessage($('[data-sms-field="' + messageField + '"]'), section)) return;
        var phone = $('[data-sms-test-phone="' + action + '"]');
        var country = $('[data-sms-test-country="' + action + '"]');
        var formatted = phone ? formatTestPhone(phone.value, country ? country.value : '+1') : null;
        if (!formatted) {
          setSmsStatus('Enter a valid test phone number.');
          if (phone) phone.focus();
          return;
        }
        phone.value = formatted.input;
        setSmsStatus('Preview only for ' + formatted.full + ' — no SMS was sent.', section);
        return;
      }
      if (saveSection(section)) setSmsStatus(ACTION_MESSAGES[action], section);
    });
  });
  try {
    var saved = readSettings();
    if (saved.visitLinkValidity) $('[data-sms-field="visitLinkValidity"]').value = saved.visitLinkValidity;
    else if (Object.values(saved.sections).some(function (section) { return Object.keys(section.fields).some(function (key) { return /LinkValidity$/.test(key); }); })) {
      setSmsStatus('Visit link expiry is now shared. Review and save the common setting; previous per-message expiry choices no longer apply.', $('[data-sms-shared-links]'));
    }
    $$('[data-sms-panel], [data-sms-group]').forEach(function (section) {
      var settings = saved.sections[section.dataset.smsGroup || section.dataset.smsPanel];
      if (!settings) return;
      if (!settings.fields || typeof settings.fields !== 'object' || typeof settings.enabled !== 'boolean') throw new Error('Invalid section');
      section.querySelectorAll('[data-sms-field]').forEach(function (field) {
        var value = settings.fields[field.dataset.smsField];
        if (typeof value !== 'string') return;
        if (field.tagName !== 'SELECT' || Array.from(field.options).some(function (option) { return option.value === value; })) field.value = value;
      });
      var toggle = section.dataset.smsPanel === 'automation' ? null : section.querySelector('[data-sms-enabled]');
      if (toggle) { toggle.setAttribute('aria-checked', String(settings.enabled)); toggle.classList.toggle('is-on', settings.enabled); }

    });
  } catch (_) { setSmsStatus('Could not load saved SMS settings. Stored data is preserved.'); }
  refreshCareDelivery();
  refreshLinkSettings();
})();
