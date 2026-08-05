/* ==========================================================================
   QR Stations page — in-page tab switching (QR Stations / OneQR) plus the
   OneQR Configuration module list + live preview.
   ========================================================================== */
(function () {
  'use strict';

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-qr-tab]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-qr-panel]'));
  var defaultTab = 'qr-stations';
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
      modules: ['Book Appointment', 'Smart Check-in', 'Services & Prices', "Today's Promotion", 'Tip & Pay', 'Leave a Google Review'],
      icons: {
        'Book Appointment': 'calendar-check',
        'Smart Check-in': 'check',
        'Services & Prices': 'list',
        "Today's Promotion": 'percent',
        'Tip & Pay': 'dollar-sign',
        'Leave a Google Review': 'star'
      },
      roles: {
        staff: ['Smart Check-in', 'Tip & Pay'],
        owner: ['Book Appointment', 'Services & Prices', "Today's Promotion"]
      }
    },
    'Business': {
      modules: ['Book Appointment', 'Check-in', 'Catalog & Pricing', "Today's Promotion", 'Tip & Pay', 'Leave a Review'],
      icons: {
        'Book Appointment': 'calendar-check',
        'Check-in': 'check',
        'Catalog & Pricing': 'list',
        "Today's Promotion": 'percent',
        'Tip & Pay': 'dollar-sign',
        'Leave a Review': 'star'
      },
      roles: {
        staff: ['Check-in', 'Tip & Pay'],
        owner: ['Book Appointment', 'Catalog & Pricing', "Today's Promotion"]
      }
    },
    'Organization': {
      modules: ['Membership', 'Events', 'Donation', 'Volunteer', 'Voting', 'Announcements'],
      icons: {
        'Membership': 'crown',
        'Events': 'calendar-clock',
        'Donation': 'heart',
        'Volunteer': 'user-cog',
        'Voting': 'check-circle-2',
        'Announcements': 'star'
      },
      roles: {
        staff: ['Events', 'Volunteer'],
        owner: ['Membership', 'Donation', 'Announcements']
      }
    },
    'Government Service': {
      modules: ['Citizen Services', 'Appointment', 'Permit & License', 'Case Tracking', 'Public Notices', 'Complaint Submission'],
      icons: {
        'Citizen Services': 'user-cog',
        'Appointment': 'calendar-clock',
        'Permit & License': 'check-circle-2',
        'Case Tracking': 'list',
        'Public Notices': 'star',
        'Complaint Submission': 'share-2'
      },
      roles: {
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

  // Each role keeps its own module order and enabled set — Staff and Owner
  // see a different slice of the same module pool than Customer does.
  var moduleOrderByRole = {};
  var enabledByRole = {};

  var currentRole = 'customer';

  var moduleListEl = document.getElementById('oneqrModuleList');
  var welcomeEl = document.getElementById('oneqrWelcomeText');
  var tilesEl = document.getElementById('oneqrPreviewTiles');
  var addModuleBtn = document.getElementById('oneqrAddModule');
  var previewViewAllBtn = document.getElementById('oneqrPreviewViewAll');
  var PREVIEW_COLLAPSED_MODULE_LIMIT = 6;
  var previewExpanded = false;

  var nameInput = document.getElementById('oneqr-name');
  var welcomeInput = document.getElementById('oneqr-welcome');
  var templateSelect = document.getElementById('oneqr-template');
  var landingViewSelect = document.getElementById('oneqr-landing');
  var identitySelect = document.getElementById('oneqr-identity');
  var cardTitleEl = document.getElementById('oneqrCardTitle');
  var heroNameEl = document.getElementById('oneqrHeroName');
  var heroTaglineEl = document.getElementById('oneqrHeroTagline');

  if (!moduleListEl || !welcomeEl || !tilesEl) return;

  function applyTemplate(templateName) {
    var preset = TEMPLATE_PRESETS[templateName] || TEMPLATE_PRESETS[DEFAULT_TEMPLATE];
    MODULE_ICONS = preset.icons;
    ROLES.forEach(function (role) {
      var defaultEnabled = role === 'customer' ? preset.modules : preset.roles[role];
      moduleOrderByRole[role] = preset.modules.slice();
      enabledByRole[role] = new Set(defaultEnabled);
    });
    previewExpanded = false;
    renderModules();
    renderPreview();
  }

  function iconHtml(name) {
    return '<i data-lucide="' + (MODULE_ICONS[name] || 'square') + '" aria-hidden="true"></i>';
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function renderModules() {
    var order = moduleOrderByRole[currentRole] || [];
    var enabledSet = enabledByRole[currentRole] || new Set();
    moduleListEl.innerHTML = order.map(function (name) {
      var on = enabledSet.has(name);
      return '<div class="oneqr-module" data-module-row="' + name + '" draggable="false">' +
        '<span class="oneqr-module-drag" aria-hidden="true" title="Drag to reorder"><i data-lucide="grip-vertical"></i></span>' +
        '<span class="oneqr-module-icon">' + iconHtml(name) + '</span>' +
        '<strong>' + name + '</strong>' +
        '<button type="button" class="oneqr-switch' + (on ? ' is-on' : '') + '" data-module="' + name + '" aria-pressed="' + on + '" aria-label="Toggle ' + name + ' module"></button>' +
        '</div>';
    }).join('');
    refreshIcons();
  }

  function renderPreview() {
    var order = moduleOrderByRole[currentRole] || [];
    var enabledSet = enabledByRole[currentRole] || new Set();
    var identityValue = identitySelect ? identitySelect.value : 'Public first, verify when needed';
    if (identityValue === 'Always sign in') {
      welcomeEl.innerHTML = '<strong>🔒 Sign in required</strong><small>Verify your identity to continue</small>';
    } else {
      welcomeEl.innerHTML = ROLE_WELCOME[currentRole] || ROLE_WELCOME.customer;
    }

    var allEnabledModules = order.filter(function (name) {
      return enabledSet.has(name);
    });

    var landingView = landingViewSelect ? landingViewSelect.value : 'Auto-suggest based on user';
    var previewModules;
    var canExpand;
    if (landingView === 'Full module list') {
      previewModules = allEnabledModules;
      canExpand = false;
    } else if (landingView === 'Intro page') {
      previewModules = previewExpanded ? allEnabledModules : [];
      canExpand = allEnabledModules.length > 0;
    } else {
      previewModules = previewExpanded ? allEnabledModules : allEnabledModules.slice(0, PREVIEW_COLLAPSED_MODULE_LIMIT);
      canExpand = allEnabledModules.length > PREVIEW_COLLAPSED_MODULE_LIMIT;
    }

    tilesEl.innerHTML = previewModules.map(function (name) {
      return '<div class="oneqr-phone-tile">' + iconHtml(name) + '<b>' + name + '</b></div>';
    }).join('');
    if (previewViewAllBtn) {
      previewViewAllBtn.hidden = !canExpand;
      previewViewAllBtn.textContent = previewExpanded ? 'View Less' : (landingView === 'Intro page' ? 'View Services' : 'View All');
      previewViewAllBtn.setAttribute('aria-expanded', String(previewExpanded));
    }
    refreshIcons();
  }

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
    if (!row) return;
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
  });

  function setActiveRole(role) {
    currentRole = role;
    previewExpanded = false;
    document.querySelectorAll('.oneqr-role-tab').forEach(function (t) {
      t.classList.toggle('is-active', t.getAttribute('data-role') === role);
    });
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

  if (addModuleBtn) {
    addModuleBtn.addEventListener('click', function () {
      addModuleBtn.disabled = true;
      var original = addModuleBtn.querySelector('span').textContent;
      addModuleBtn.querySelector('span').textContent = 'More modules coming soon';
      setTimeout(function () {
        addModuleBtn.querySelector('span').textContent = original;
        addModuleBtn.disabled = false;
      }, 2000);
    });
  }

  var shareUrlEl = document.getElementById('oneqrShareUrl');
  var copyUrlBtn = document.getElementById('oneqrCopyUrl');
  var printQrBtn = document.getElementById('oneqrPrintQr');

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

  function buildPrintableCard() {
    if (!viewModal) return null;
    var printCardSource = viewModal.querySelector('[data-oneqr-print-card], [data-salon-print-card]');
    if (!printCardSource) return null;
    var card = printCardSource.cloneNode(true);
    var closeButton = card.querySelector('[data-oneqr-view-close], [data-salon-modal-close]');
    if (closeButton) closeButton.remove();
    var actions = card.querySelector('[data-oneqr-modal-actions], [data-salon-modal-actions]');
    if (actions) actions.remove();

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
      '[data-salon-modal-qr] { width: 285px !important; }' +
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
      heroTaglineEl.textContent = welcomeInput.value.trim() || 'One QR. Everything Connected.';
    });
  }

  if (templateSelect) {
    templateSelect.addEventListener('change', function () {
      applyTemplate(templateSelect.value);
    });
  }

  if (landingViewSelect) {
    landingViewSelect.addEventListener('change', function () {
      previewExpanded = false;
      renderPreview();
    });
  }

  if (identitySelect) {
    identitySelect.addEventListener('change', renderPreview);
  }

  applyTemplate(DEFAULT_TEMPLATE);
})();
