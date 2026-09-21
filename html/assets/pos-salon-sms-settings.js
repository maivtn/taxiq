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
    '[Benefits Status]': 'Benefits available.'
  };
  function renderTokens(text) {
    return Object.keys(TOKENS).reduce(function (out, token) {
      return out.split(token).join(TOKENS[token]);
    }, text || '');
  }

  var WELCOME_TEMPLATES = {
    new: 'Hi [Customer Name], welcome to [Salon Name]! Your check-in is confirmed. Benefits available. Tap here: [OneQR Link]',
    returning: 'Welcome back, [Customer Name]! Your check-in is confirmed. Benefits available. Tap here: [OneQR Link]',
    member: 'Welcome back, [Customer Name]! Your check-in is confirmed. Member benefits available. Tap here: [OneQR Link]',
    birthday: 'Happy Birthday, [Customer Name]! Your check-in is confirmed. Birthday benefits available. Tap here: [OneQR Link]'
  };
  var AFTER_CHECKOUT_DEFAULT = 'Thank you for visiting [Salon Name], [Customer Name]! Tap here: [OneQR Link]';

  var SMS_JOURNEY = [
    { label: 'Welcome with benefits', mode: 'Auto', text: 'Welcome back, Sarah! Your check-in is confirmed. Benefits available. Tap here: nexora.app/q/••••' },
    { label: 'Return soon', mode: 'Auto at 15 min', text: 'Your turn is getting close. Reply 1 or tap I’m Coming to confirm your return.' },
    { label: 'Wait Care', mode: 'Manager approval', text: 'We’re sorry your wait is taking longer than expected. To thank you for your patience, Bitcoin Nail Bar is offering a complimentary hot-stone upgrade.' },
    { label: 'Ready now', mode: 'Manual', text: 'We’re ready for you now! Please return within 10 minutes and tap I’m Here when you arrive.' },
    { label: 'Thank you', mode: 'Auto after checkout', text: 'Thank you for visiting Bitcoin Nail Bar, Sarah! Tap here: nexora.app/q/••••' }
  ];

  function selectField(label, dataField, options, selectedIndex) {
    var optionsHtml = options.map(function (option, index) {
      return '<option' + (index === (selectedIndex || 0) ? ' selected' : '') + '>' + esc(option) + '</option>';
    }).join('');
    return '<label class="settings-field"><span class="settings-label">' + esc(label) + '</span>' +
      '<select class="settings-select"' + (dataField ? ' data-sms-field="' + esc(dataField) + '"' : '') + '>' + optionsHtml + '</select></label>';
  }

  function journeyItemMarkup(item) {
    return '<div class="sms-journey-item">' +
      '<div class="sms-journey-label">' + esc(item.label) + '<span class="sms-journey-mode">' + esc(item.mode) + '</span></div>' +
      '<p>' + esc(item.text) + '</p></div>';
  }

  function afterCheckoutMenuMarkup() {
    return [
      ['Leave a Review', 'Share your visit experience', 'Open'],
      ['Add a Tip', 'Visible only when no tip was completed', 'Add'],
      ['Private Feedback', 'Send a private note to the salon', 'Send'],
      ['Rewards Earned', 'View points from today’s visit', 'View'],
      ['Book Your Next Visit', 'Reserve your next service', 'Book'],
      ['Receipt', 'View today’s receipt', 'View']
    ].map(function (row) {
      return '<div class="sms-phone-menu"><span><strong>' + esc(row[0]) + '</strong><span>' + esc(row[1]) + '</span></span><button type="button">' + esc(row[2]) + '</button></div>';
    }).join('');
  }

  panel.innerHTML =
    '<div class="sms-settings">' +
      '<div class="sms-settings-topbar">' +
        '<nav class="salon-tabs sms-subtabs" aria-label="SMS setting sections">' +
          '<button type="button" data-sms-tab="automation" class="active" aria-current="page">Automation Settings</button>' +
          '<button type="button" data-sms-tab="templates">SMS Templates</button>' +
          '<button type="button" data-sms-tab="after">After Checkout Setup</button>' +
          '<button type="button" data-sms-tab="welcome">Welcome SMS Setup</button>' +
        '</nav>' +
        '<span class="salon-status-pill" data-sms-automation-pill>Automation ON</span>' +
      '</div>' +
      '<p class="settings-help sms-settings-status" data-sms-status role="status" aria-live="polite"></p>' +

      '<section data-sms-panel="automation">' +
        '<div class="sms-columns">' +
          '<div class="sms-col sms-card"><h3>Waitlist communication</h3><div class="settings-field-grid">' +
            selectField('Welcome SMS', null, ['Automatic', 'Manual']) +
            selectField('Welcome wait time', null, ['Do not show wait time', 'Show estimated range', 'Staff decides per customer']) +
            selectField('Return notice', null, ['15 minutes before', '10 minutes before', '20 minutes before']) +
            selectField('No response grace', null, ['10 minutes', '5 minutes', '15 minutes']) +
            selectField('Internal ETA threshold', null, ['10 minutes', '5 minutes', '15 minutes']) +
          '</div></div>' +
          '<div class="sms-col sms-card"><h3>Wait Care</h3><div class="settings-field-grid">' +
            selectField('10–19 min delay', null, ['Auto · 50 points', 'Approval required']) +
            selectField('20–29 min delay', null, ['Auto · Free add-on', 'Approval required']) +
            selectField('30–44 min delay', null, ['Approval · $5 voucher', 'Automatic']) +
            selectField('45+ min delay', null, ['Manager selects benefit', 'Auto · $10 voucher']) +
          '</div>' +
          '<div class="sms-actions">' +
            '<button type="button" class="booking-primary-button" data-sms-action="save-automation"><i class="bi bi-check2" aria-hidden="true"></i>Save settings</button>' +
            '<button type="button" class="booking-secondary-button" data-sms-action="pause-automation">Pause automation</button>' +
          '</div></div>' +
        '</div>' +
      '</section>' +

      '<section data-sms-panel="templates" hidden>' +
        '<div class="sms-columns">' +
          '<div class="sms-col sms-card"><h3>SMS journey</h3><div class="sms-journey">' + SMS_JOURNEY.map(journeyItemMarkup).join('') + '</div></div>' +
          '<div class="sms-col-side sms-card"><h3>Template controls</h3><div class="settings-field-grid">' +
            selectField('Language', null, ['English', 'Vietnamese', 'Spanish']) +
            selectField('Send mode', null, ['Automatic', 'Manager approval', 'Manual']) +
            '<label class="settings-field sms-field-full"><span class="settings-label">Preview customer</span><input class="settings-input" type="text" value="Sarah Nguyen"></label>' +
          '</div>' +
          '<div class="sms-actions">' +
            '<button type="button" class="booking-primary-button" data-sms-action="send-test-template"><i class="bi bi-send" aria-hidden="true"></i>Send test</button>' +
            '<button type="button" class="booking-secondary-button" data-sms-action="save-template">Save template</button>' +
          '</div></div>' +
        '</div>' +
      '</section>' +

      '<section data-sms-panel="after" hidden>' +
        '<div class="sms-columns">' +
          '<div class="sms-col sms-card"><h3>Thank You SMS Setup</h3>' +
            '<div class="settings-toggle-row"><span>Send after checkout is completed</span>' +
            '<button class="toggle-pill is-on" type="button" role="switch" aria-checked="true" aria-label="Toggle Thank You SMS after checkout"></button></div>' +
            '<div class="settings-field-grid">' +
              selectField('Send mode', null, ['Automatic after checkout', 'Manual review before sending']) +
              selectField('Smart Link destination', null, ['Personalized OneQR After Visit', 'OneQR Main Menu']) +
              '<label class="settings-field sms-field-full"><span class="settings-label">Message</span><textarea class="settings-input sms-textarea" data-sms-field="afterMessage" rows="3">' + esc(AFTER_CHECKOUT_DEFAULT) + '</textarea></label>' +
              selectField('Review', null, ['Show to every customer', 'Hide']) +
              selectField('Tip', null, ['Show only when no tip was completed', 'Hide tip after checkout']) +
              selectField('Private feedback', null, ['Show to every customer', 'Hide']) +
              selectField('Promotion', null, ['Show only with marketing consent', 'Hide promotion']) +
            '</div>' +
            '<p class="sms-notice"><strong>Customer protection:</strong> Never ask for a second tip when one was already completed. Do not reward only positive public reviews. Promotion visibility requires valid marketing consent.</p>' +
            '<div class="sms-actions">' +
              '<button type="button" class="booking-primary-button" data-sms-action="save-after"><i class="bi bi-check2" aria-hidden="true"></i>Save After Checkout Setup</button>' +
              '<button type="button" class="booking-secondary-button" data-sms-action="send-test-after">Send Test</button>' +
            '</div>' +
          '</div>' +
          '<div class="sms-col-side sms-card"><h3>After Checkout preview</h3>' +
            '<div class="sms-phone"><div class="sms-phone-screen"><div class="sms-phone-bar"></div>' +
              '<div class="sms-phone-title">Messages</div>' +
              '<div class="sms-phone-bubble" data-sms-preview="afterMessage">' + esc(renderTokens(AFTER_CHECKOUT_DEFAULT)) + '</div>' +
              '<div class="sms-phone-body">' + afterCheckoutMenuMarkup() + '<button type="button" class="sms-phone-back">← Back to Main Menu</button></div>' +
            '</div></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section data-sms-panel="welcome" hidden>' +
        '<div class="sms-columns">' +
          '<div class="sms-col sms-card"><h3>Welcome SMS Setup</h3>' +
            '<div class="settings-toggle-row"><span>Enable welcome message after check-in</span>' +
            '<button class="toggle-pill is-on" type="button" role="switch" aria-checked="true" aria-label="Toggle welcome message after check-in"></button></div>' +
            '<div class="settings-field-grid">' +
              '<label class="settings-field"><span class="settings-label">Customer template</span><select class="settings-select" data-sms-field="welcomeTemplate">' +
                '<option value="new">New Customer</option><option value="returning" selected>Returning Customer</option><option value="member">Member</option><option value="birthday">Birthday Customer</option>' +
              '</select></label>' +
              selectField('Send mode', null, ['Automatic after check-in', 'Manual review before sending']) +
              selectField('Wait-time visibility', null, ['Do not show wait time', 'Show estimated range', 'Staff decides per customer']) +
              selectField('Smart Link destination', null, ['Personalized OneQR Menu', 'OneQR Main Menu', 'Service Menu', 'Rewards & Benefits']) +
              '<label class="settings-field sms-field-full"><span class="settings-label">Message</span><textarea class="settings-input sms-textarea" data-sms-field="welcomeMessage" rows="3">' + esc(WELCOME_TEMPLATES.returning) + '</textarea></label>' +
            '</div>' +
            '<div class="sms-tokens"><span class="settings-help">Insert a dynamic field</span><div class="sms-token-row">' +
              Object.keys(TOKENS).map(function (token) {
                return '<button type="button" class="sms-token" data-sms-insert-token="' + esc(token) + '">' + esc(token.replace(/[\[\]]/g, '')) + '</button>';
              }).join('') +
            '</div></div>' +
            '<p class="sms-notice"><strong>Marketing consent required:</strong> If OneQR highlights a promotional offer, the customer must have valid marketing consent. Without consent, the same link opens the standard OneQR menu and existing customer benefits only.</p>' +
            '<div class="sms-actions">' +
              '<button type="button" class="booking-primary-button" data-sms-action="save-welcome"><i class="bi bi-check2" aria-hidden="true"></i>Save Welcome Setup</button>' +
              '<button type="button" class="booking-secondary-button" data-sms-action="send-test-welcome">Send Test</button>' +
            '</div>' +
          '</div>' +
          '<div class="sms-col-side sms-card"><h3>Customer preview</h3>' +
            '<div class="sms-phone"><div class="sms-phone-screen"><div class="sms-phone-bar"></div>' +
              '<div class="sms-phone-title">Messages</div>' +
              '<div class="sms-phone-bubble" data-sms-preview="welcomeMessage">' + esc(renderTokens(WELCOME_TEMPLATES.returning)) + '</div>' +
              '<p class="sms-phone-caption">One short message. One smart link. No wait time shown.</p>' +
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
  }
  $$('[data-sms-field="afterMessage"], [data-sms-field="welcomeMessage"]').forEach(function (textarea) {
    textarea.addEventListener('input', function () { refreshPreview(textarea.dataset.smsField); });
  });

  var welcomeTemplateSelect = $('[data-sms-field="welcomeTemplate"]');
  if (welcomeTemplateSelect) {
    welcomeTemplateSelect.addEventListener('change', function () {
      var textarea = $('[data-sms-field="welcomeMessage"]');
      if (textarea) {
        textarea.value = WELCOME_TEMPLATES[welcomeTemplateSelect.value] || WELCOME_TEMPLATES.returning;
        refreshPreview('welcomeMessage');
      }
    });
  }

  $$('[data-sms-insert-token]').forEach(function (button) {
    button.addEventListener('click', function () {
      var textarea = $('[data-sms-field="welcomeMessage"]');
      if (!textarea) return;
      var token = button.dataset.smsInsertToken;
      textarea.value += (textarea.value && !/\s$/.test(textarea.value) ? ' ' : '') + token;
      refreshPreview('welcomeMessage');
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
    'save-template': 'Template saved.',
    'send-test-template': 'Test SMS queued.',
    'save-after': 'After Checkout settings saved.',
    'send-test-after': 'Thank You test SMS queued.',
    'save-welcome': 'Welcome SMS settings saved.',
    'send-test-welcome': 'Test SMS queued.'
  };
  Object.keys(ACTION_MESSAGES).forEach(function (action) {
    var button = $('[data-sms-action="' + action + '"]');
    if (button) button.addEventListener('click', function () { setSmsStatus(ACTION_MESSAGES[action]); });
  });
})();
