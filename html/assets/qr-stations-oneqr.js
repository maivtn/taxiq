/* ==========================================================================
   QR Stations page — in-page workflow tab switching plus the
   OneQR Configuration module list + live preview.
   ========================================================================== */
(function () {
  'use strict';

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-qr-tab]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-qr-panel]'));
  var defaultTab = 'one-qr';
  var validTabIds = {};
  tabs.forEach(function (tab) { validTabIds[tab.getAttribute('data-qr-tab')] = true; });

  if (!tabs.length || !panels.length) return;

  function getTabFromURL() {
    try {
      var tabId = new URL(window.location.href).searchParams.get('tab');
      return validTabIds[tabId] ? tabId : defaultTab;
    } catch (error) {
      return defaultTab;
    }
  }

  function updateTabURL(tabId, method) {
    if (!window.history || typeof window.history[method] !== 'function') return;
    var url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history[method]({ qrTab: tabId }, '', url.href);
  }

  function activateTab(tabId, shouldFocus, shouldUpdateURL) {
    var activeTabId = validTabIds[tabId] ? tabId : defaultTab;
    tabs.forEach(function (tab) {
      var active = tab.getAttribute('data-qr-tab') === activeTabId;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (shouldFocus && active) tab.focus();
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-qr-panel') !== activeTabId;
    });
    if (window.NEXORA_SHELL && typeof window.NEXORA_SHELL.setActiveTab === 'function') {
      window.NEXORA_SHELL.setActiveTab(activeTabId);
    }
    if (shouldUpdateURL) updateTabURL(activeTabId, 'pushState');
    return activeTabId;
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { activateTab(tab.getAttribute('data-qr-tab'), false, true); });
    tab.addEventListener('keydown', function (event) {
      if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].indexOf(event.key) === -1) return;
      event.preventDefault();
      var nextIndex = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      activateTab(tabs[nextIndex].getAttribute('data-qr-tab'), true, true);
    });
  });

  window.NEXORA_QR_SELECT_TAB = function (tabId, options) {
    options = options || {};
    activateTab(tabId, Boolean(options.focus), options.updateURL !== false);
  };

  window.addEventListener('popstate', function () { activateTab(getTabFromURL(), false, false); });

  activateTab(getTabFromURL(), false, false);
})();

(function () {
  'use strict';

  var TEMPLATE_PRESETS = {
    'Beauty & Salon': {
      modules: ['Check-in', 'Booking', 'Services', 'Payment', 'Tip', 'Review', 'Rewards', 'Membership', 'Staff Portal', 'AI Assistant', 'Clock-in', 'Turn', 'Receive Customer', 'Complete Service', 'Request Approval'],
      icons: {
        'Book Appointment': 'calendar-check',
        'Smart Check-in': 'check',
        'Services & Prices': 'list',
        "Today's Promotion": 'percent',
        'Tip & Pay': 'dollar-sign',
        'Leave a Google Review': 'star',
        'Check-in': 'check',
        'Booking': 'calendar-check',
        'Services': 'list',
        'Payment': 'dollar-sign',
        'Tip': 'heart',
        'Review': 'star',
        'Rewards': 'gift',
        'Membership': 'crown',
        'Staff Portal': 'user-cog',
        'AI Assistant': 'bot',
        'Clock-in': 'check-circle-2',
        'Turn': 'user-cog',
        'Receive Customer': 'check',
        'Appointment': 'calendar-clock',
        'Walk-in': 'check',
        'Complete Service': 'star',
        'Request Approval': 'external-link'
      },
      roles: {
        customer: ['Check-in', 'Booking', 'Services', 'Payment', 'Tip', 'Review', 'Rewards', 'Membership', 'Staff Portal', 'AI Assistant'],
        staff: ['Clock-in', 'Turn', 'Receive Customer', 'Complete Service', 'Tip', 'Request Approval'],
        owner: ['Booking', 'Services', 'Payment', 'Staff Portal']
      }
    },
    'Business': {
      modules: ['Book Appointment', 'Check-in', 'Catalog & Pricing', "Today's Promotion", 'Tip & Pay', 'Leave a Review', 'Rewards', 'Membership', 'Clock-in', 'Turn', 'Appointment', 'Walk-in', 'Complete Service', 'Request Approval'],
      icons: {
        'Book Appointment': 'calendar-check',
        'Check-in': 'check',
        'Catalog & Pricing': 'list',
        "Today's Promotion": 'percent',
        'Tip & Pay': 'dollar-sign',
        'Leave a Review': 'star',
        'Rewards': 'gift',
        'Membership': 'crown',
        'Clock-in': 'check-circle-2',
        'Turn': 'user-cog',
        'Appointment': 'calendar-clock',
        'Walk-in': 'check',
        'Complete Service': 'star',
        'Request Approval': 'external-link'
      },
      roles: {
        customer: ['Book Appointment', 'Check-in', 'Catalog & Pricing', "Today's Promotion", 'Tip & Pay', 'Leave a Review', 'Rewards', 'Membership'],
        staff: ['Clock-in', 'Turn', 'Appointment', 'Walk-in', 'Complete Service', 'Catalog & Pricing', 'Tip & Pay', 'Request Approval'],
        owner: ['Book Appointment', 'Catalog & Pricing', "Today's Promotion"]
      }
    },
    'Organization': {
      modules: ['Membership', 'Events', 'Donation', 'Volunteer', 'Voting', 'Announcements', 'Committees', 'Chapters'],
      icons: {
        'Membership': 'crown',
        'Events': 'calendar-clock',
        'Donation': 'heart',
        'Volunteer': 'user-cog',
        'Voting': 'check-circle-2',
        'Announcements': 'star',
        'Committees': 'list',
        'Chapters': 'share-2'
      },
      roles: {
        customer: ['Membership', 'Events', 'Donation', 'Volunteer', 'Voting', 'Announcements', 'Committees', 'Chapters'],
        staff: ['Events', 'Volunteer'],
        owner: ['Membership', 'Donation', 'Announcements']
      }
    },
    'Government Service': {
      modules: ['Citizen Services', 'Appointment', 'Permit & License', 'Case Tracking', 'Public Notices', 'Complaint Submission', 'Fee Payment', 'Document Upload'],
      icons: {
        'Citizen Services': 'user-cog',
        'Appointment': 'calendar-clock',
        'Permit & License': 'check-circle-2',
        'Case Tracking': 'list',
        'Public Notices': 'star',
        'Complaint Submission': 'share-2',
        'Fee Payment': 'dollar-sign',
        'Document Upload': 'square'
      },
      roles: {
        customer: ['Citizen Services', 'Appointment', 'Permit & License', 'Case Tracking', 'Public Notices', 'Complaint Submission', 'Fee Payment', 'Document Upload'],
        staff: ['Appointment', 'Case Tracking'],
        owner: ['Citizen Services', 'Public Notices', 'Complaint Submission']
      }
    }
  };

  var DEFAULT_TEMPLATE = 'Beauty & Salon';
  var ROLES = ['customer', 'staff', 'owner'];

  var ROLE_WELCOME = {
    customer: '<strong>Welcome back, Brian 👋</strong><small>Your booking starts at 3:00 PM</small>',
    staff: '<strong>Hi Chloe</strong><small>Shift 10:00 AM–7:00 PM</small>',
    owner: '<strong>Good afternoon, Brian</strong><small>3 requests pending approval</small>'
  };

  var MODULE_ICONS = TEMPLATE_PRESETS[DEFAULT_TEMPLATE].icons;

  // Each role (Customer, Staff, Owner) owns its own module list — switching
  // roles never leaks another role's modules. Adding a module (once wired up)
  // adds to whichever role list is currently active, not a shared pool.
  var moduleOrderByRole = {};
  var recommendedModulesByRole = {};
  var enabledByRole = {};
  var moduleDetailsByRole = { customer: {}, staff: {}, owner: {} };

  // Configuration (Welcome Message, Landing View, Identity) is also
  // role-specific — switching the active role swaps these field values too.
  // OneQR Name stays global: it names the single Master QR, not a role view.
  var ROLE_CONFIG_DEFAULTS = {
    customer: { welcome: 'Welcome to Bitcoin Nail Bar', identity: 'Public first, verify when needed' },
    staff: { welcome: 'Welcome to the Staff Portal', identity: 'Always sign in' },
    owner: { welcome: 'Welcome to the Owner Dashboard', identity: 'Always sign in' }
  };
  var roleConfig = {
    customer: Object.assign({}, ROLE_CONFIG_DEFAULTS.customer),
    staff: Object.assign({}, ROLE_CONFIG_DEFAULTS.staff),
    owner: Object.assign({}, ROLE_CONFIG_DEFAULTS.owner)
  };

  var currentRole = 'customer';

  var moduleListEl = document.getElementById('oneqrModuleList');
  var welcomeEl = document.getElementById('oneqrWelcomeText');
  var tilesEl = document.getElementById('oneqrPreviewTiles');
  var customerActionsEl = document.getElementById('oneqrCustomerActions');
  var addModuleBtn = document.getElementById('oneqrAddModule');
  var resetModulesBtn = document.getElementById('oneqrResetModules');
  var previewViewAllBtn = document.getElementById('oneqrPreviewViewAll');
  var performanceActionListEl = document.getElementById('oneqrPerformanceActionList');
  var moduleLinkForm = document.getElementById('oneqrModuleLinkForm');
  var moduleLinkInput = document.getElementById('oneqrModuleLinkInput');
  var moduleStatusEl = document.getElementById('oneqrModuleStatus');
  var appearanceDialog = document.getElementById('oneqrAppearanceDialog');
  var appearanceGrid = document.getElementById('oneqrAppearanceGrid');
  var appearanceReset = document.getElementById('oneqrAppearanceReset');
  var moduleIconUpload = document.getElementById('oneqrModuleIconUpload');
  var appearanceTarget = null;
  var uploadTarget = null;
  var appearanceChoices = window.ONEQR_ACTION_APPEARANCE;
  var PREVIEW_COLLAPSED_MODULE_LIMIT = 6;
  var previewExpanded = false;

  var nameInput = document.getElementById('oneqr-name');
  var welcomeInput = document.getElementById('oneqr-welcome');
  var templateSelect = document.getElementById('oneqr-template');
  var identitySelect = document.getElementById('oneqr-identity');
  var cardTitleEl = document.getElementById('oneqrCardTitle');
  var heroNameEl = document.getElementById('oneqrHeroName');
  var heroTaglineEl = document.getElementById('oneqrHeroTagline');
  var saveSettingsBtn = document.getElementById('oneqrSaveSettings');
  var ONEQR_CONFIG_STORAGE_KEY = 'taxiq:oneqr-config';
  var ONEQR_EDITOR_DRAFT_KEY = 'taxiq:oneqr-editor-draft';

  var addModuleModal = document.getElementById('oneqrAddModuleModal');
  var addModuleListEl = document.getElementById('oneqrAddModuleList');
  var currentPreset = null;
  var currentIndustry = null;
  var industryCatalog = window.ONEQR_INDUSTRIES;

  if (!moduleListEl || !welcomeEl || !tilesEl) return;

  function applyTemplate(templateName) {
    var preset = TEMPLATE_PRESETS[templateName] || TEMPLATE_PRESETS[DEFAULT_TEMPLATE];
    currentPreset = preset;
    MODULE_ICONS = preset.icons;
    Object.values(industryCatalog.modules).forEach(function (action) {
      if (!currentPreset.modules.includes(action.en)) currentPreset.modules.push(action.en);
      if (!MODULE_ICONS[action.en]) MODULE_ICONS[action.en] = action.icon;
    });
    ROLES.forEach(function (role) {
      var roleModules = (preset.roles[role] || []).slice();
      recommendedModulesByRole[role] = roleModules.slice();
      moduleOrderByRole[role] = roleModules;
      enabledByRole[role] = new Set(roleModules);
    });
    previewExpanded = false;
    renderModules();
    renderPreview();
  }

  function iconHtml(name) {
    var icon = moduleDetails(name).icon || MODULE_ICONS[name] || 'link-2';
    return isModuleImage(icon)
      ? '<img src="' + escapeModuleText(icon) + '" alt="">'
      : '<i data-lucide="' + escapeModuleText(icon) + '" aria-hidden="true"></i>';
  }

  function isModuleImage(value) {
    return /^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(value || '');
  }

  function moduleBackground(name) {
    var background = moduleDetails(name).background;
    return appearanceChoices.backgrounds.includes(background) ? background : '';
  }

  function openModuleAppearance(name, mode) {
    appearanceTarget = { name: name, role: currentRole, mode: mode };
    var isIcon = mode === 'icon';
    var selected = isIcon ? (moduleDetails(name).icon || MODULE_ICONS[name]) : moduleBackground(name);
    document.getElementById('oneqrAppearanceTitle').textContent = isIcon ? 'Choose an icon' : 'Choose a card background';
    document.getElementById('oneqrAppearanceDescription').textContent = (isIcon ? 'Choose an icon for ' : 'Choose an industry-style gradient for ') + moduleTitle(name) + '.';
    appearanceGrid.classList.toggle('is-backgrounds', !isIcon);
    appearanceGrid.innerHTML = (isIcon ? appearanceChoices.icons : appearanceChoices.backgrounds).map(function (value, index) {
      return '<button type="button" data-appearance-choice="' + index + '" class="' + (value === selected ? 'is-selected' : '') + '" aria-pressed="' + (value === selected) + '" aria-label="' + (isIcon ? 'Use ' + value + ' icon' : 'Use gradient ' + (index + 1)) + '">' +
        (isIcon ? '<i data-lucide="' + value + '" aria-hidden="true"></i>' : '<span style="background:' + value + '"></span>') + '</button>';
    }).join('');
    appearanceReset.querySelector('span').textContent = isIcon ? 'Use default' : 'Use white';
    refreshIcons();
    appearanceDialog.showModal();
  }

  function updateModuleAppearance(target, value) {
    if (!target || !moduleOrderByRole[target.role].includes(target.name)) return;
    moduleDetails(target.name, target.role)[target.mode] = value;
    renderModules();
    renderPreview();
    moduleStatusEl.textContent = 'Module appearance updated. Select Save Settings to keep it.';
  }

  appearanceGrid.addEventListener('click', function (event) {
    var choice = event.target.closest('[data-appearance-choice]');
    if (!choice || !appearanceTarget) return;
    var values = appearanceTarget.mode === 'icon' ? appearanceChoices.icons : appearanceChoices.backgrounds;
    updateModuleAppearance(appearanceTarget, values[Number(choice.dataset.appearanceChoice)]);
    appearanceDialog.close();
  });
  appearanceReset.addEventListener('click', function () {
    updateModuleAppearance(appearanceTarget, '');
    appearanceDialog.close();
  });
  appearanceDialog.addEventListener('click', function (event) {
    if (event.target === appearanceDialog) {
      var bounds = appearanceDialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) appearanceDialog.close();
    }
  });
  appearanceDialog.addEventListener('close', function () {
    if (!appearanceTarget || appearanceTarget.role !== currentRole) return;
    var index = moduleOrderByRole[currentRole].indexOf(appearanceTarget.name);
    var row = moduleListEl.children[index];
    if (row) row.querySelector(appearanceTarget.mode === 'icon' ? '[data-module-icon]' : '[data-module-background]').focus();
  });
  moduleIconUpload.addEventListener('change', function () {
    var file = moduleIconUpload.files[0];
    var target = uploadTarget;
    moduleIconUpload.value = '';
    if (!file || !target) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 1024 * 1024) {
      moduleStatusEl.textContent = 'Use a PNG, JPG, WebP, or GIF image smaller than 1 MB.';
      return;
    }
    var reader = new FileReader();
    reader.addEventListener('load', function () {
      if (isModuleImage(reader.result)) updateModuleAppearance(target, reader.result);
    });
    reader.addEventListener('error', function () { moduleStatusEl.textContent = 'Could not read this image. Please try another file.'; });
    reader.readAsDataURL(file);
  });

  function escapeModuleText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function moduleDetails(name, role) {
    var details = moduleDetailsByRole[role || currentRole];
    if (!Object.prototype.hasOwnProperty.call(details, name)) {
      Object.defineProperty(details, name, { enumerable: true, configurable: true, writable: true, value: {
        title: name,
        url: defaultModuleUrl(name)
      } });
    }
    return details[name];
  }

  function defaultModuleUrl(name) {
    var entry = Object.entries(industryCatalog.modules).find(function (entry) { return entry[1].en === name; });
    return entry ? industryCatalog.actionUrl(entry[0]) : 'https://nexoratouch.com/o/bitcoin-nail-bar/' + encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
  }

  function moduleTitle(name, role) {
    return moduleDetails(name, role).title.trim() || (name.indexOf('custom-') === 0 ? 'New link' : name);
  }

  function normalizedModuleUrl(value) {
    var raw = value.trim();
    if (!raw) return '';
    if (!/^[a-z][a-z\d+.-]*:/i.test(raw)) raw = 'https://' + raw;
    try {
      var url = new URL(raw);
      return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href : '';
    } catch (error) { return ''; }
  }

  if (moduleLinkForm && moduleLinkInput) {
    moduleLinkInput.addEventListener('input', function () { moduleLinkInput.setCustomValidity(''); });
    moduleLinkForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = normalizedModuleUrl(moduleLinkInput.value);
      if (!url) {
        moduleLinkInput.setCustomValidity('Enter a valid website, email, or phone link.');
        moduleLinkInput.reportValidity();
        return;
      }
      var parsed = new URL(url);
      var name = 'custom-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      moduleDetailsByRole[currentRole][name] = { title: parsed.hostname.replace(/^www\./, '') || 'New link', url: url };
      moduleOrderByRole[currentRole].push(name);
      enabledByRole[currentRole].add(name);
      MODULE_ICONS[name] = 'link-2';
      moduleLinkInput.value = '';
      renderModules();
      renderPreview();
      var titleInput = moduleListEl.lastElementChild.querySelector('[data-module-title]');
      titleInput.focus();
      titleInput.select();
      moduleStatusEl.textContent = 'Module added. Edit its title, then Save Settings.';
    });
  }

  moduleListEl.addEventListener('input', function (event) {
    var input = event.target;
    var row = input.closest('[data-module-row]');
    if (!row) return;
    var details = moduleDetails(row.dataset.moduleRow);
    if (input.matches('[data-module-title]')) details.title = input.value;
    else if (input.matches('[data-module-url]')) {
      details.url = input.value;
      input.setCustomValidity('');
    } else return;
    renderPreview();
    moduleStatusEl.textContent = 'Unsaved module changes. Select Save Settings to keep them.';
  });

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function renderModules() {
    var order = moduleOrderByRole[currentRole] || [];
    var enabledSet = enabledByRole[currentRole] || new Set();
    moduleListEl.innerHTML = order.map(function (name, index) {
      var on = enabledSet.has(name);
      var key = escapeModuleText(name);
      var details = moduleDetails(name);
      var title = escapeModuleText(moduleTitle(name));
      var background = moduleBackground(name);
      return '<div class="oneqr-module" data-module-row="' + key + '" draggable="false">' +
        '<button class="oneqr-module-drag" type="button" aria-label="Drag to reorder ' + title + '" title="Drag to reorder"><i data-lucide="grip-vertical" aria-hidden="true"></i></button>' +
        '<div class="oneqr-module-icon-tools"><span class="oneqr-module-icon">' + iconHtml(name) + '</span><button class="oneqr-module-background' + (background ? ' has-color' : '') + '" type="button" data-module-background aria-label="Choose card background for ' + title + '" title="Card background"' + (background ? ' style="--action-swatch:' + escapeModuleText(background) + '"' : '') + '><span></span></button><span><button type="button" data-module-icon aria-label="Choose icon for ' + title + '">Change icon</button><button type="button" data-module-upload aria-label="Upload icon for ' + title + '">Upload</button></span></div>' +
        '<div class="oneqr-module-fields"><input class="oneqr-module-title-input" data-module-title value="' + escapeModuleText(details.title) + '" aria-label="Module title: ' + title + '"><label class="oneqr-module-url-field"><i data-lucide="link-2" aria-hidden="true"></i><input data-module-url type="text" inputmode="url" value="' + escapeModuleText(details.url) + '" aria-label="Link for ' + title + '" spellcheck="false"></label></div>' +
        '<span class="oneqr-module-moves"><button type="button" data-move="up" aria-label="Move ' + title + ' up"' + (index === 0 ? ' disabled' : '') + '><i data-lucide="chevron-up" aria-hidden="true"></i></button><button type="button" data-move="down" aria-label="Move ' + title + ' down"' + (index === order.length - 1 ? ' disabled' : '') + '><i data-lucide="chevron-down" aria-hidden="true"></i></button><button type="button" data-remove-module aria-label="Remove ' + title + '"><i data-lucide="x" aria-hidden="true"></i></button></span>' +
        '<button type="button" class="oneqr-switch' + (on ? ' is-on' : '') + '" data-module="' + key + '" aria-pressed="' + on + '" aria-label="Toggle ' + title + ' module"></button>' +
        '</div>';
    }).join('');
    refreshIcons();
  }

  function renderPerformance() {
    if (!performanceActionListEl) return;
    var order = moduleOrderByRole.customer || [];
    var enabledSet = enabledByRole.customer || new Set();
    var activeModules = order.filter(function (name) { return enabledSet.has(name); }).slice(0, 4);
    var demoClicks = [68, 52, 29, 14];
    var maximum = demoClicks[0];
    performanceActionListEl.innerHTML = activeModules.map(function (name, index) {
      var clicks = demoClicks[index];
      var width = Math.max(10, Math.round((clicks / maximum) * 100));
      var title = escapeModuleText(moduleTitle(name, 'customer'));
      return '<div class="oneqr-performance-action-row"><span title="' + title + '">' + title + '</span><i style="--performance-width:' + width + '%" aria-hidden="true"></i><strong>' + clicks + '</strong></div>';
    }).join('');
  }

  function renderPreview() {
    var order = moduleOrderByRole[currentRole] || [];
    var enabledSet = enabledByRole[currentRole] || new Set();
    var identityValue = identitySelect ? identitySelect.value : 'Public first, verify when needed';
    customerActionsEl.hidden = currentRole !== 'customer';
    welcomeEl.hidden = currentRole === 'customer' && identityValue !== 'Always sign in';
    if (identityValue === 'Always sign in') {
      welcomeEl.innerHTML = '<strong>🔒 Sign in required</strong><small>Verify your identity to continue</small>';
    } else {
      welcomeEl.innerHTML = ROLE_WELCOME[currentRole] || ROLE_WELCOME.customer;
    }

    var allEnabledModules = order.filter(function (name) {
      return enabledSet.has(name);
    });

    var previewModules = previewExpanded ? allEnabledModules : allEnabledModules.slice(0, PREVIEW_COLLAPSED_MODULE_LIMIT);
    var canExpand = allEnabledModules.length > PREVIEW_COLLAPSED_MODULE_LIMIT;

    tilesEl.innerHTML = previewModules.map(function (name) {
      var url = normalizedModuleUrl(moduleDetails(name).url);
      var background = moduleBackground(name);
      return '<a class="oneqr-phone-tile' + (background ? ' has-custom-background' : '') + '"' + (background ? ' style="background:' + escapeModuleText(background) + '"' : '') + (url ? ' href="' + escapeModuleText(url) + '" target="_blank" rel="noopener noreferrer"' : ' aria-disabled="true"') + '>' + iconHtml(name) + '<b>' + escapeModuleText(moduleTitle(name)) + '</b></a>';
    }).join('');
    if (previewViewAllBtn) {
      previewViewAllBtn.hidden = !canExpand;
      previewViewAllBtn.textContent = previewExpanded ? 'View Less' : 'View All';
      previewViewAllBtn.setAttribute('aria-expanded', String(previewExpanded));
    }
    renderPreviewBusinessInfo();
    renderPerformance();
    refreshIcons();
  }

  function renderPreviewBusinessInfo() {
    var card = { address: '9793 Westheimer Rd, Suite A', city: 'Houston', region: 'TX', addressMode: 'full', phone: '(346) 802-4906', showPhone: true, showHours: true, openTime: '09:30', closeTime: '19:00' };
    try {
      var saved = JSON.parse(window.localStorage.getItem('taxiq:oneqr-contact-card') || 'null');
      if (saved && typeof saved === 'object') card = Object.assign(card, saved);
    } catch (error) { /* Use the default business profile if storage is unavailable. */ }
    if (card.configured && card.name) heroNameEl.textContent = card.name;
    var address = card.addressMode === 'hidden' ? '' : [card.addressMode === 'area' ? '' : card.address, card.city, card.region].filter(Boolean).join(', ');
    function displayTime(value) {
      var match = /^(\d{2}):(\d{2})$/.exec(value || '');
      if (!match) return '';
      var hour = Number(match[1]);
      return (hour % 12 || 12) + ':' + match[2] + (hour >= 12 ? ' PM' : ' AM');
    }
    var hours = card.showHours && card.openTime && card.closeTime ? 'Open daily · ' + displayTime(card.openTime) + '–' + displayTime(card.closeTime) : '';
    var addressEl = document.getElementById('oneqrPreviewAddress');
    var hoursEl = document.getElementById('oneqrPreviewHours');
    addressEl.querySelector('b').textContent = address;
    addressEl.hidden = !address;
    hoursEl.querySelector('b').textContent = hours;
    hoursEl.hidden = !hours;
    document.getElementById('oneqrPreviewBusinessInfo').hidden = !address && !hours;
    document.getElementById('oneqrPreviewCall').hidden = !card.showPhone || !card.phone;
    document.getElementById('oneqrPreviewText').hidden = !card.showPhone || !card.phone;
    document.getElementById('oneqrPreviewDirections').hidden = !address;
  }

  document.getElementById('oneqrContactCard').addEventListener('click', function () { window.NEXORA_CONTACT_CARD.open(); });
  document.addEventListener('oneqr:contact-saved', function (event) {
    if (event.detail.addAction) {
      var name = 'Save contact';
      if (!moduleOrderByRole.customer.includes(name)) moduleOrderByRole.customer.push(name);
      enabledByRole.customer.add(name);
      MODULE_ICONS[name] = 'contact-round';
      moduleDetails(name, 'customer').url = industryCatalog.actionUrl('contactcard');
    }
    renderModules();
    renderPreview();
    moduleStatusEl.textContent = event.detail.addAction ? 'Contact card saved. Select Save Settings to keep the Save contact module.' : 'Contact card saved.';
  });

  function clearDragOverMarkers() {
    moduleListEl.querySelectorAll('.oneqr-module').forEach(function (row) {
      row.classList.remove('is-drag-over-top', 'is-drag-over-bottom');
    });
  }

  var draggedModuleName = null;

  moduleListEl.addEventListener('mousedown', function (event) {
    var handle = event.target.closest('.oneqr-module-drag');
    if (!handle) return;
    var row = handle.closest('.oneqr-module');
    if (row) row.setAttribute('draggable', 'true');
  });

  moduleListEl.addEventListener('mouseup', function () {
    moduleListEl.querySelectorAll('.oneqr-module').forEach(function (row) { row.setAttribute('draggable', 'false'); });
  });

  moduleListEl.addEventListener('dragstart', function (event) {
    var row = event.target.closest('.oneqr-module');
    if (!row || row.getAttribute('draggable') !== 'true') return;
    draggedModuleName = row.getAttribute('data-module-row');
    row.classList.add('is-dragging');
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', draggedModuleName);
    }
  });

  moduleListEl.addEventListener('dragover', function (event) {
    if (!draggedModuleName) return;
    event.preventDefault();
    var row = event.target.closest('.oneqr-module');
    if (!row || row.getAttribute('data-module-row') === draggedModuleName) return;
    var rect = row.getBoundingClientRect();
    var isAfter = (event.clientY - rect.top) > rect.height / 2;
    clearDragOverMarkers();
    row.classList.add(isAfter ? 'is-drag-over-bottom' : 'is-drag-over-top');
  });

  moduleListEl.addEventListener('drop', function (event) {
    if (!draggedModuleName) return;
    event.preventDefault();
    var row = event.target.closest('.oneqr-module');
    clearDragOverMarkers();
    if (!row) return;
    var targetName = row.getAttribute('data-module-row');
    if (targetName === draggedModuleName) return;
    var rect = row.getBoundingClientRect();
    var isAfter = (event.clientY - rect.top) > rect.height / 2;
    var order = moduleOrderByRole[currentRole];
    var fromIndex = order.indexOf(draggedModuleName);
    order.splice(fromIndex, 1);
    var toIndex = order.indexOf(targetName);
    order.splice(isAfter ? toIndex + 1 : toIndex, 0, draggedModuleName);
    renderModules();
    renderPreview();
    moduleStatusEl.textContent = 'Module order changed. Select Save Settings to keep it.';
  });

  moduleListEl.addEventListener('dragend', function (event) {
    var row = event.target.closest('.oneqr-module');
    if (row) {
      row.classList.remove('is-dragging');
      row.setAttribute('draggable', 'false');
    }
    clearDragOverMarkers();
    draggedModuleName = null;
  });

  moduleListEl.addEventListener('click', function (event) {
    var appearanceButton = event.target.closest('[data-module-icon], [data-module-background], [data-module-upload]');
    if (appearanceButton) {
      var appearanceName = appearanceButton.closest('[data-module-row]').dataset.moduleRow;
      if (appearanceButton.hasAttribute('data-module-upload')) {
        uploadTarget = { name: appearanceName, role: currentRole, mode: 'icon' };
        moduleIconUpload.click();
      } else {
        openModuleAppearance(appearanceName, appearanceButton.hasAttribute('data-module-icon') ? 'icon' : 'background');
      }
      return;
    }
    var remove = event.target.closest('[data-remove-module]');
    if (remove) {
      var removedName = remove.closest('[data-module-row]').dataset.moduleRow;
      moduleOrderByRole[currentRole] = moduleOrderByRole[currentRole].filter(function (name) { return name !== removedName; });
      enabledByRole[currentRole].delete(removedName);
      renderModules();
      renderPreview();
      moduleStatusEl.textContent = 'Module removed. Select Save Settings to keep this change.';
      return;
    }
    var move = event.target.closest('[data-move]');
    if (move) {
      var row = move.closest('[data-module-row]');
      var order = moduleOrderByRole[currentRole];
      var from = order.indexOf(row.getAttribute('data-module-row'));
      var to = from + (move.dataset.move === 'up' ? -1 : 1);
      if (from < 0 || to < 0 || to >= order.length) return;
      var direction = move.dataset.move;
      order.splice(to, 0, order.splice(from, 1)[0]);
      renderModules();
      renderPreview();
      moduleStatusEl.textContent = 'Module order changed. Select Save Settings to keep it.';
      var movedRow = moduleListEl.children[to];
      var nextFocus = movedRow.querySelector('[data-move="' + direction + '"]');
      if (nextFocus.disabled) nextFocus = movedRow.querySelector('[data-move]:not(:disabled)');
      nextFocus.focus();
      return;
    }
    var btn = event.target.closest('.oneqr-switch');
    if (!btn) return;
    var name = btn.getAttribute('data-module');
    var enabledSet = enabledByRole[currentRole];
    if (enabledSet.has(name)) {
      enabledSet.delete(name);
    } else {
      enabledSet.add(name);
    }
    btn.classList.toggle('is-on');
    btn.setAttribute('aria-pressed', enabledSet.has(name));
    renderPreview();
    moduleStatusEl.textContent = 'Unsaved module changes. Select Save Settings to keep them.';
  });

  function syncConfigFieldsToRole(role) {
    var config = roleConfig[role] || roleConfig.customer;
    if (welcomeInput) welcomeInput.value = config.welcome;
    if (heroTaglineEl) heroTaglineEl.textContent = config.welcome || 'One QR. Everything Connected.';
    if (identitySelect) identitySelect.value = config.identity;
  }

  function setActiveRole(role) {
    currentRole = role;
    previewExpanded = false;
    document.querySelectorAll('.oneqr-role-tab').forEach(function (t) {
      t.classList.toggle('is-active', t.getAttribute('data-role') === role);
    });
    syncConfigFieldsToRole(role);
    renderModules();
    renderPreview();
  }

  document.querySelectorAll('.oneqr-role-tab').forEach(function (tab) {
    tab.addEventListener('click', function () { setActiveRole(tab.getAttribute('data-role')); });
  });

  if (previewViewAllBtn) {
    previewViewAllBtn.addEventListener('click', function () {
      previewExpanded = !previewExpanded;
      renderPreview();
    });
  }

  function renderAddModuleList() {
    if (!addModuleListEl || !currentPreset) return;
    var order = moduleOrderByRole[currentRole] || [];
    var catalog = Array.from(new Set(currentPreset.modules || []));
    addModuleListEl.innerHTML = catalog.map(function (name) {
      var checked = order.indexOf(name) !== -1;
      return '<button type="button" class="oneqr-modal-item' + (checked ? ' is-checked' : '') + '" data-add-module="' + escapeModuleText(name) + '">' +
        '<span class="oneqr-modal-item-check">' + (checked ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>' : '') + '</span>' +
        '<span class="oneqr-modal-item-icon">' + iconHtml(name) + '</span>' +
        '<span>' + escapeModuleText(moduleTitle(name)) + '</span>' +
        '</button>';
    }).join('');
    refreshIcons();
  }

  function openAddModuleModal() {
    if (!addModuleModal) return;
    renderAddModuleList();
    addModuleModal.hidden = false;
    addModuleModal.setAttribute('aria-hidden', 'false');
  }

  function closeAddModuleModal() {
    if (!addModuleModal) return;
    addModuleModal.hidden = true;
    addModuleModal.setAttribute('aria-hidden', 'true');
  }

  if (addModuleBtn) {
    addModuleBtn.addEventListener('click', openAddModuleModal);
  }

  if (resetModulesBtn) {
    resetModulesBtn.addEventListener('click', function () {
      var recommended = recommendedModulesByRole[currentRole] || [];
      var customModules = moduleOrderByRole[currentRole].filter(function (name) { return recommended.indexOf(name) === -1; });
      var enabledCustomModules = customModules.filter(function (name) { return enabledByRole[currentRole].has(name); });
      moduleOrderByRole[currentRole] = recommended.concat(customModules);
      enabledByRole[currentRole] = new Set(recommended.concat(enabledCustomModules));
      previewExpanded = false;
      renderModules();
      renderPreview();
      moduleStatusEl.textContent = 'Recommendations restored. Your added modules and edits were kept. Select Save Settings to keep this change.';
    });
  }

  if (addModuleModal) {
    addModuleModal.addEventListener('click', function (event) {
      if (event.target.closest('[data-oneqr-add-module-close]')) closeAddModuleModal();
    });

    addModuleListEl.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-add-module]');
      if (!btn) return;
      var name = btn.getAttribute('data-add-module');
      var order = moduleOrderByRole[currentRole];
      var enabledSet = enabledByRole[currentRole];
      var index = order.indexOf(name);
      if (index === -1) {
        order.push(name);
        enabledSet.add(name);
      } else {
        order.splice(index, 1);
        enabledSet.delete(name);
      }
      renderAddModuleList();
      renderModules();
      renderPreview();
      moduleStatusEl.textContent = 'Unsaved module changes. Select Save Settings to keep them.';
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !addModuleModal.hidden) closeAddModuleModal();
    });
  }

  var shareUrlEl = document.getElementById('oneqrShareUrl');
  var copyUrlBtn = document.getElementById('oneqrCopyUrl');
  var printQrBtn = document.getElementById('oneqrPrintQr');

  function resolveUrl(value) {
    try {
      return new URL(value, window.location.href).href;
    } catch (error) {
      return value;
    }
  }

  // Every relative OneQR path in the markup gets swapped for the real,
  // currently-running absolute URL — never shown or copied as "../…".
  if (shareUrlEl) shareUrlEl.textContent = resolveUrl(shareUrlEl.textContent.trim());

  var salonModalLinkEl = document.querySelector('[data-salon-modal-link]');
  if (salonModalLinkEl) salonModalLinkEl.textContent = resolveUrl(salonModalLinkEl.textContent.trim());

  var viewCopyBtnForLink = document.getElementById('oneqrViewCopy');
  if (viewCopyBtnForLink && viewCopyBtnForLink.hasAttribute('data-copy-link')) {
    viewCopyBtnForLink.setAttribute('data-copy-link', resolveUrl(viewCopyBtnForLink.getAttribute('data-copy-link')));
  }

  function flashButtonLabel(button, text) {
    var label = button.querySelector('span') || Array.prototype.find.call(button.childNodes, function (node) {
      return node.nodeType === 3 && node.textContent.trim();
    });
    if (!label) return;
    var original = label.textContent;
    button.disabled = true;
    label.textContent = text;
    setTimeout(function () {
      label.textContent = original;
      button.disabled = false;
    }, 1800);
  }

  if (copyUrlBtn && shareUrlEl) {
    copyUrlBtn.addEventListener('click', function () {
      var url = new URL(shareUrlEl.textContent.trim(), window.location.href).href;
      var onCopied = function () { flashButtonLabel(copyUrlBtn, 'Copied!'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(onCopied, onCopied);
      } else {
        var textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand('copy'); } catch (error) { /* clipboard unavailable */ }
        document.body.removeChild(textarea);
        onCopied();
      }
    });
  }

  var viewQrBtn = document.getElementById('oneqrViewQr');
  var viewModal = document.querySelector('[data-oneqr-view-modal]');
  var viewModalOpener = null;
  var viewModalPreviousOverflow = '';
  var modalOpenedForPrint = false;

  function isViewModalOpen() {
    return Boolean(viewModal && !viewModal.classList.contains('hidden'));
  }

  function openViewModal(opener) {
    if (!viewModal) return;
    viewModalOpener = opener;
    viewModalPreviousOverflow = document.body.style.overflow;
    viewModal.classList.remove('hidden');
    viewModal.classList.add('flex');
    viewModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var closeButton = viewModal.querySelector('[data-oneqr-view-close], [data-salon-modal-close]');
    if (closeButton) closeButton.focus();
  }

  function closeViewModal() {
    if (!isViewModalOpen()) return;
    viewModal.classList.add('hidden');
    viewModal.classList.remove('flex');
    viewModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = viewModalPreviousOverflow;
    if (viewModalOpener && typeof viewModalOpener.focus === 'function') viewModalOpener.focus();
    viewModalOpener = null;
  }

  if (viewQrBtn) {
    viewQrBtn.addEventListener('click', function () { openViewModal(viewQrBtn); });
  }

  if (viewModal) {
    viewModal.addEventListener('click', function (event) {
      if (event.target === viewModal || event.target.closest('[data-oneqr-view-close], [data-salon-modal-close]')) closeViewModal();
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isViewModalOpen()) closeViewModal();
  });

  var viewCopyBtn = document.getElementById('oneqrViewCopy');
  var viewPrintBtn = document.getElementById('oneqrViewPrint');
  var viewDownloadBtn = document.getElementById('oneqrViewDownload');

  if (viewCopyBtn && shareUrlEl) {
    viewCopyBtn.addEventListener('click', function () {
      var url = new URL(shareUrlEl.textContent.trim(), window.location.href).href;
      var onCopied = function () { flashButtonLabel(viewCopyBtn, 'Copied!'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(onCopied, onCopied);
      } else {
        var textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand('copy'); } catch (error) { /* clipboard unavailable */ }
        document.body.removeChild(textarea);
        onCopied();
      }
    });
  }

  function fallbackPrint(opener) {
    if (viewModal && !isViewModalOpen()) {
      openViewModal(opener);
      modalOpenedForPrint = true;
    }
    document.body.classList.add('is-printing-salon-qr');
    window.print();
  }

  window.addEventListener('afterprint', function () {
    document.body.classList.remove('is-printing-salon-qr');
    if (modalOpenedForPrint) {
      closeViewModal();
      modalOpenedForPrint = false;
    }
  });

  function pruneDuplicatePrintableQrBitmaps(card) {
    if (!card) return;
    card.querySelectorAll('.qr-code').forEach(function (qrCode) {
      var primaryBitmap = qrCode.querySelector('canvas, img:not(.qr-logo-img)');
      qrCode.querySelectorAll('img:not(.qr-logo-img)').forEach(function (duplicate) {
        if (duplicate !== primaryBitmap) duplicate.remove();
      });
      qrCode.querySelectorAll('canvas').forEach(function (duplicate) {
        if (duplicate !== primaryBitmap) duplicate.remove();
      });
    });
  }

  function buildPrintableCard() {
    if (!viewModal) return null;
    var printCardSource = viewModal.querySelector('[data-oneqr-print-card], [data-salon-print-card]');
    if (!printCardSource) return null;
    var card = printCardSource.cloneNode(true);
    var closeButton = card.querySelector('[data-oneqr-view-close], [data-salon-modal-close]');
    if (closeButton) closeButton.remove();
    var actions = card.querySelector('[data-oneqr-modal-actions], [data-salon-modal-actions]');
    if (actions) actions.remove();
    pruneDuplicatePrintableQrBitmaps(card);

    var sourceCanvases = printCardSource.querySelectorAll('canvas');
    var cardCanvases = card.querySelectorAll('canvas');
    sourceCanvases.forEach(function (sourceCanvas, index) {
      var cardCanvas = cardCanvases[index];
      if (!cardCanvas) return;
      var image = document.createElement('img');
      var qrLabelSource = sourceCanvas.closest('.qr-code, .qr-code-art');
      image.src = sourceCanvas.toDataURL('image/png');
      image.alt = (qrLabelSource && qrLabelSource.getAttribute('aria-label')) || 'Bitcoin Nail Bar OneQR code';
      image.style.width = '100%';
      image.style.height = '100%';
      image.style.display = 'block';
      image.style.borderRadius = '6px';
      image.style.imageRendering = 'pixelated';
      cardCanvas.replaceWith(image);
    });

    var printContent = document.createElement('div');
    printContent.setAttribute('data-print-content', 'salon-qr');
    printContent.style.setProperty('--print-scale', '0.70');
    printContent.style.setProperty('--print-side-gutter', '0.24in');
    printContent.style.setProperty('--print-top-offset', '0.16in');
    printContent.style.position = 'relative';
    printContent.style.zIndex = '2';
    printContent.style.width = 'calc((100% - (var(--print-side-gutter) * 2)) / var(--print-scale))';
    printContent.style.margin = 'var(--print-top-offset) 0 0 var(--print-side-gutter)';
    printContent.style.transform = 'scale(var(--print-scale))';
    printContent.style.transformOrigin = 'top left';
    while (card.firstChild) {
      printContent.appendChild(card.firstChild);
    }
    card.appendChild(printContent);

    return card;
  }

  function printOneQrCard(opener) {
    var printCard = buildPrintableCard();
    if (!printCard) {
      fallbackPrint(opener);
      return;
    }

    var printFrame = document.createElement('iframe');
    printFrame.setAttribute('aria-hidden', 'true');
    printFrame.dataset.printFrame = 'salon-qr';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '1px';
    printFrame.style.height = '1px';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    var headMarkup = Array.prototype.slice.call(document.head.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(function (node) { return node.outerHTML; })
      .join('\n');

    var printDocument = printFrame.contentDocument || printFrame.contentWindow.document;
    printDocument.open();
    printDocument.write(
      '<!doctype html><html><head><base href="' + document.baseURI + '">' +
      '<title>OneQR Print</title>' + headMarkup +
      '<style>' +
      '@page { size: 5in 7in; margin: 0; }' +
      'html, body { margin: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
      'body { display: grid; min-height: 100vh; place-items: start center; }' +
      '[data-salon-print-card] { position: relative !important; width: 5in !important; height: 7in !important; min-height: 7in !important; max-width: 5in !important; max-height: 7in !important; overflow: hidden !important; border-radius: 0 !important; box-shadow: none !important; background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.12) 0, transparent 20%), radial-gradient(circle at 12% 24%, rgba(244, 114, 182, 0.32) 0, transparent 26%), radial-gradient(circle at 90% 58%, rgba(34, 211, 238, 0.3) 0, transparent 27%), linear-gradient(160deg, #050505 0%, #0B0F1A 45%, #111056 100%) !important; color: #ffffff !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }' +
      '[data-salon-print-card]::before { content: "" !important; position: absolute !important; inset: 0 !important; z-index: 1 !important; pointer-events: none !important; opacity: 0.16 !important; background-image: radial-gradient(circle, rgba(255, 255, 255, 0.52) 0.55px, transparent 0.8px) !important; background-size: 3px 3px !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }' +
      '[data-print-dot-overlay] { display: none !important; }' +
      '[data-print-content="salon-qr"] { --print-scale: 0.70; --print-side-gutter: 0.24in; --print-top-offset: 0.16in; position: relative !important; z-index: 2 !important; width: calc((100% - (var(--print-side-gutter) * 2)) / var(--print-scale)); margin: var(--print-top-offset) 0 0 var(--print-side-gutter); transform: scale(var(--print-scale)); transform-origin: top left; }' +
      '[data-salon-modal-qr] { width: 285px !important; height: 285px !important; aspect-ratio: 1 / 1 !important; }' +
      '[data-salon-modal-qr] > img:not(.qr-logo-img), [data-salon-modal-qr] > canvas { width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important; }' +
      '[data-print-logo] { width: 196px !important; max-width: 196px !important; height: auto !important; object-fit: contain !important; object-position: center !important; margin-top: -0.2in !important; margin-bottom: -0.34in !important; }' +
      '[data-print-headline] { margin-top: 0 !important; }' +
      '[data-print-rewarded] { background: linear-gradient(90deg, #F472B6 0%, #C084FC 50%, #67E8F9 100%) !important; -webkit-background-clip: text !important; background-clip: text !important; color: transparent !important; -webkit-text-fill-color: transparent !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }' +
      '[data-print-accent] { background: none !important; color: #F0ABFC !important; -webkit-text-fill-color: #F0ABFC !important; }' +
      '[data-print-body], [data-print-benefit-label], [data-print-powered] { background: none !important; color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }' +
      '[data-print-powered] { display: block !important; margin-top: 0.06in !important; }' +
      '[data-print-panel] { width: 62% !important; margin-left: auto !important; margin-right: auto !important; background: rgba(11, 16, 36, 0.92) !important; border-color: rgba(103, 232, 249, 0.72) !important; box-shadow: inset 0 0 18px rgba(244, 114, 182, 0.12), 0 0 18px rgba(34, 211, 238, 0.18) !important; }' +
      '[data-print-benefits] { width: 62% !important; margin-left: auto !important; margin-right: auto !important; }' +
      '[data-print-steps] { width: 62% !important; margin-left: auto !important; margin-right: auto !important; }' +
      '[data-print-rewards-panel] { width: 62% !important; }' +
      '</style>' +
      '</head><body>' + printCard.outerHTML + '</body></html>'
    );
    printDocument.close();

    var cleanupFrame = function () { printFrame.remove(); };

    window.setTimeout(function () {
      try {
        printFrame.contentWindow.addEventListener('afterprint', cleanupFrame, { once: true });
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        window.setTimeout(cleanupFrame, 15000);
      } catch (error) {
        cleanupFrame();
        fallbackPrint(opener);
      }
    }, 80);
  }

  if (printQrBtn) {
    printQrBtn.addEventListener('click', function () { printOneQrCard(printQrBtn); });
  }

  if (viewPrintBtn) {
    viewPrintBtn.addEventListener('click', function () { printOneQrCard(viewPrintBtn); });
  }

  var DOWNLOAD_SOLID_COLORS = {
    'oneqr-view-logo-sub': '#67e8f9',
    'oneqr-view-title-gradient': '#f472b6',
    'oneqr-view-rewards-title': '#f472b6',
    'oneqr-view-thanks-text': '#22d3ee'
  };

  function flattenGradientTextForCapture(root) {
    Object.keys(DOWNLOAD_SOLID_COLORS).forEach(function (className) {
      var el = root.querySelector('.' + className);
      if (!el) return;
      el.style.background = 'none';
      el.style.webkitBackgroundClip = 'unset';
      el.style.backgroundClip = 'unset';
      el.style.webkitTextFillColor = DOWNLOAD_SOLID_COLORS[className];
      el.style.color = DOWNLOAD_SOLID_COLORS[className];
    });
  }

  function downloadOneQrCard(button) {
    if (typeof window.html2canvas !== 'function') return;
    var printCard = buildPrintableCard();
    if (!printCard) return;
    flashButtonLabel(button, 'Preparing…');

    flattenGradientTextForCapture(printCard);
    printCard.style.position = 'fixed';
    printCard.style.top = '0';
    printCard.style.left = '-9999px';
    printCard.style.boxSizing = 'border-box';
    printCard.style.width = '5in';
    printCard.style.height = '7in';
    printCard.style.maxWidth = 'none';
    printCard.style.maxHeight = 'none';
    printCard.style.aspectRatio = '5 / 7';
    printCard.style.overflow = 'hidden';
    printCard.style.padding = '0';
    printCard.style.borderRadius = '0';
    document.body.appendChild(printCard);

    window.html2canvas(printCard, {
      backgroundColor: '#050505',
      scale: 2,
      useCORS: true,
      ignoreElements: function (el) {
        return (el.classList && el.classList.contains('oneqr-view-dots')) || el.hasAttribute('data-print-dot-overlay');
      }
    }).then(function (canvas) {
      document.body.removeChild(printCard);
      var link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'bitcoin-nail-bar-oneqr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(function () {
      if (printCard.parentNode) document.body.removeChild(printCard);
    });
  }

  if (viewDownloadBtn) {
    viewDownloadBtn.addEventListener('click', function () { downloadOneQrCard(viewDownloadBtn); });
  }

  if (nameInput && cardTitleEl && heroNameEl) {
    nameInput.addEventListener('input', function () {
      var value = nameInput.value.trim() || 'Untitled OneQR';
      cardTitleEl.textContent = value;
      heroNameEl.textContent = value;
    });
  }

  if (welcomeInput && heroTaglineEl) {
    welcomeInput.addEventListener('input', function () {
      var value = welcomeInput.value.trim() || 'One QR. Everything Connected.';
      heroTaglineEl.textContent = value;
      roleConfig[currentRole].welcome = welcomeInput.value.trim();
    });
  }

  if (templateSelect) {
    templateSelect.addEventListener('change', function () {
      applyTemplate(templateSelect.value);
    });
  }

  if (identitySelect) {
    identitySelect.addEventListener('change', function () {
      roleConfig[currentRole].identity = identitySelect.value;
      renderPreview();
    });
  }

  function loadSavedConfig() {
    try {
      var raw = window.localStorage.getItem(ONEQR_CONFIG_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function loadIndustryTemplateConfig() {
    try {
      var raw = window.localStorage.getItem('taxiq:oneqr-industry-template');
      var saved = raw ? JSON.parse(raw) : null;
      return saved && Array.isArray(saved.actions) ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function applySavedIndustryTemplate() {
    var savedIndustryTemplate = savedConfig && savedConfig.industrySelection || loadIndustryTemplateConfig();
    currentIndustry = savedIndustryTemplate;
    if (!savedIndustryTemplate || !Array.isArray(savedIndustryTemplate.actions)) return;
    var savedActions = savedIndustryTemplate.actions;
    if (Array.isArray(savedIndustryTemplate.reviewIds)) {
      savedActions = savedIndustryTemplate.reviewIds.map(function (id) {
        var activeAction = savedIndustryTemplate.actions.find(function (action) { return action.id === id; }) || {};
        var base = industryCatalog.modules[id] || { en: 'New link', icon: 'link-2' };
        var title = savedIndustryTemplate.actionTitles && savedIndustryTemplate.actionTitles[id];
        return {
          id: id, label: typeof title === 'string' && title.trim() ? title.trim() : activeAction.label || base.en,
          icon: savedIndustryTemplate.actionIcons && savedIndustryTemplate.actionIcons[id] || activeAction.icon || base.icon,
          url: savedIndustryTemplate.actionLinks && savedIndustryTemplate.actionLinks[id] || activeAction.url || industryCatalog.actionUrl(id),
          background: savedIndustryTemplate.actionBackgrounds && savedIndustryTemplate.actionBackgrounds[id] || activeAction.background || ''
        };
      });
    }
    var customerModules = [];
    var enabledModules = [];
    savedActions.forEach(function (action) {
      if (!action || !action.label) return;
      customerModules.push(action.label);
      if (!Array.isArray(savedIndustryTemplate.actionIds) || savedIndustryTemplate.actionIds.includes(action.id)) enabledModules.push(action.label);
      MODULE_ICONS[action.label] = action.icon || 'square';
      var details = moduleDetails(action.label, 'customer');
      details.title = action.label;
      if (typeof action.icon === 'string') details.icon = action.icon;
      if (action.url) details.url = action.url;
      if (appearanceChoices.backgrounds.includes(action.background)) details.background = action.background;
    });
    currentPreset.modules = Array.from(new Set((currentPreset.modules || []).concat(customerModules)));
    moduleOrderByRole.customer = Array.from(new Set(customerModules));
    var industry = industryCatalog.industries.find(function (item) { return item.id === savedIndustryTemplate.industryId; });
    recommendedModulesByRole.customer = industry ? industryCatalog.recommended(industry).map(function (id) {
      var action = savedActions.find(function (item) { return item.id === id; });
      return action ? action.label : industryCatalog.modules[id].en;
    }) : customerModules.slice();
    enabledByRole.customer = new Set(enabledModules);

    renderIndustryStatus();
  }

  function renderIndustryStatus() {
    if (!currentIndustry) return;
    var heading = document.querySelector('.oneqr-heading-copy');
    var status = heading.querySelector('[data-industry-template-status]');
    if (!status) {
      status = document.createElement('span');
      status.className = 'oneqr-pill';
      status.setAttribute('data-industry-template-status', '');
      heading.appendChild(status);
    }
    status.textContent = 'Template: ' + (currentIndustry.industryLabel || 'Industry');
  }

  function currentOneQRConfig() {
    var industryTemplate = currentIndustry;
    return {
      name: nameInput ? nameInput.value.trim() : '',
      template: templateSelect ? templateSelect.value : DEFAULT_TEMPLATE,
      roleConfig: roleConfig,
      moduleOrderByRole: moduleOrderByRole,
      enabledByRole: Object.fromEntries(ROLES.map(function (role) { return [role, Array.from(enabledByRole[role])]; })),
      moduleDetailsByRole: moduleDetailsByRole,
      industryAppliedAt: industryTemplate ? industryTemplate.appliedAt : null,
      industrySelection: currentIndustry,
      currentRole: currentRole
    };
  }

  document.querySelectorAll('[data-oneqr-editor-link]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      try {
        window.sessionStorage.setItem(ONEQR_EDITOR_DRAFT_KEY, JSON.stringify(currentOneQRConfig()));
      } catch (error) {
        event.preventDefault();
        moduleStatusEl.textContent = 'Could not keep your draft while opening this editor. Save Settings before continuing.';
      }
    });
  });

  var savedConfig = loadSavedConfig();
  try {
    var editorDraft = JSON.parse(window.sessionStorage.getItem(ONEQR_EDITOR_DRAFT_KEY) || 'null');
    if (editorDraft && editorDraft.moduleOrderByRole) savedConfig = editorDraft;
    window.sessionStorage.removeItem(ONEQR_EDITOR_DRAFT_KEY);
  } catch (error) { /* Keep the saved configuration when draft storage is unavailable. */ }
  var initialTemplate = DEFAULT_TEMPLATE;
  if (savedConfig) {
    if (savedConfig.name && nameInput) { nameInput.value = savedConfig.name; if (cardTitleEl) cardTitleEl.textContent = savedConfig.name; if (heroNameEl) heroNameEl.textContent = savedConfig.name; }
    if (savedConfig.template && templateSelect && TEMPLATE_PRESETS[savedConfig.template]) { templateSelect.value = savedConfig.template; initialTemplate = savedConfig.template; }
    if (savedConfig.roleConfig) {
      ROLES.forEach(function (role) {
        if (savedConfig.roleConfig[role]) roleConfig[role] = Object.assign({}, roleConfig[role], savedConfig.roleConfig[role]);
      });
    }
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function () {
      var invalidModule = null;
      ROLES.some(function (role) {
        return moduleOrderByRole[role].some(function (name) {
          var details = moduleDetails(name, role);
          var url = normalizedModuleUrl(details.url);
          if (!url) { invalidModule = { role: role, name: name }; return true; }
          details.url = url;
          return false;
        });
      });
      if (invalidModule) {
        setActiveRole(invalidModule.role);
        var rowIndex = moduleOrderByRole[invalidModule.role].indexOf(invalidModule.name);
        var input = moduleListEl.children[rowIndex].querySelector('[data-module-url]');
        input.setCustomValidity('Enter a valid website, email, or phone link.');
        input.reportValidity();
        return;
      }
      try {
        window.localStorage.setItem(ONEQR_CONFIG_STORAGE_KEY, JSON.stringify(currentOneQRConfig()));
      } catch (error) {
        moduleStatusEl.textContent = 'Could not save changes. Browser storage is unavailable.';
        return;
      }
      moduleStatusEl.textContent = 'Module changes saved.';
      renderModules();
      renderPreview();
      flashButtonLabel(saveSettingsBtn, 'Saved!');
    });
  }

  applyTemplate(initialTemplate);
  applySavedIndustryTemplate();
  var latestIndustryTemplate = currentIndustry;
  if (savedConfig && savedConfig.moduleOrderByRole) {
    ROLES.forEach(function (role) {
      if (role === 'customer' && latestIndustryTemplate && savedConfig.industryAppliedAt !== latestIndustryTemplate.appliedAt) return;
      if (!Array.isArray(savedConfig.moduleOrderByRole[role])) return;
      moduleOrderByRole[role] = savedConfig.moduleOrderByRole[role].filter(function (name) { return typeof name === 'string'; });
      enabledByRole[role] = new Set((savedConfig.enabledByRole && savedConfig.enabledByRole[role]) || moduleOrderByRole[role]);
      var savedDetails = savedConfig.moduleDetailsByRole && savedConfig.moduleDetailsByRole[role];
      moduleOrderByRole[role].forEach(function (name) {
        if (!savedDetails || !Object.prototype.hasOwnProperty.call(savedDetails, name) || !savedDetails[name]) return;
        var details = moduleDetails(name, role);
        if (typeof savedDetails[name].title === 'string') details.title = savedDetails[name].title;
        if (typeof savedDetails[name].url === 'string') details.url = savedDetails[name].url;
        if (typeof savedDetails[name].icon === 'string' && (/^[a-z0-9-]+$/.test(savedDetails[name].icon) || isModuleImage(savedDetails[name].icon))) details.icon = savedDetails[name].icon;
        if (appearanceChoices.backgrounds.includes(savedDetails[name].background)) details.background = savedDetails[name].background;
        else if (savedDetails[name].background === '') details.background = '';
      });
    });
  }
  try {
    var pendingIndustryId = window.sessionStorage.getItem('taxiq:oneqr-pending-industry');
    var selectedIndustry = industryCatalog.industries.find(function (industry) { return industry.id === pendingIndustryId; });
    if (selectedIndustry) {
      var retainedModules = moduleOrderByRole.customer.filter(function (name) { return !recommendedModulesByRole.customer.includes(name); });
      var retainedEnabled = retainedModules.filter(function (name) { return enabledByRole.customer.has(name); });
      var recommendedIds = industryCatalog.recommended(selectedIndustry);
      var recommended = recommendedIds.map(function (id) {
        var action = industryCatalog.modules[id];
        MODULE_ICONS[action.en] = action.icon;
        moduleDetails(action.en, 'customer');
        return action.en;
      });
      retainedModules = retainedModules.filter(function (name) { return !recommended.includes(name); });
      moduleOrderByRole.customer = recommended.concat(retainedModules);
      enabledByRole.customer = new Set(recommended.concat(retainedEnabled));
      recommendedModulesByRole.customer = recommended.slice();
      currentIndustry = {
        industryId: selectedIndustry.id, industryLabel: selectedIndustry.en, groupId: selectedIndustry.groupId,
        appliedAt: new Date().toISOString(), actionIds: recommendedIds,
        actions: recommendedIds.map(function (id) {
          var action = industryCatalog.modules[id];
          return { id: id, label: action.en, icon: action.icon, url: industryCatalog.actionUrl(id) };
        })
      };
      renderIndustryStatus();
      currentRole = 'customer';
      if (savedConfig) savedConfig.currentRole = 'customer';
      moduleStatusEl.textContent = 'Industry updated. Your added modules were kept. Select Save Settings to apply.';
    }
    window.sessionStorage.removeItem('taxiq:oneqr-pending-industry');
  } catch (error) { /* Keep the current modules if selection storage is unavailable. */ }
  setActiveRole(savedConfig && ROLES.includes(savedConfig.currentRole) ? savedConfig.currentRole : currentRole);
  if (window.location.hash === '#contact-card') window.NEXORA_CONTACT_CARD.open();
})();
