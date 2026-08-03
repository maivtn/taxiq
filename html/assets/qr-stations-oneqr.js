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

  var MODULES = ['Check-in', 'Booking', 'Services', 'Payment', 'Tip', 'Review', 'Rewards', 'Membership', 'AI Assistant', 'Staff Portal'];

  var MODULE_ICONS = {
    'Check-in': 'check-circle-2',
    'Booking': 'calendar-clock',
    'Services': 'sparkles',
    'Payment': 'credit-card',
    'Tip': 'heart',
    'Review': 'star',
    'Rewards': 'gift',
    'Membership': 'crown',
    'AI Assistant': 'bot',
    'Staff Portal': 'user-cog'
  };

  var ROLE_DATA = {
    customer: {
      welcome: '<strong>Welcome back, Brian 👋</strong><small>Your booking starts at 3:00 PM</small>',
      modules: ['Check-in', 'Booking', 'Rewards', 'Membership', 'Tip', 'Review']
    },
    staff: {
      welcome: '<strong>Hi Chloe</strong><small>Shift 10:00 AM–7:00 PM</small>',
      modules: ['Staff Portal', 'Check-in', 'Services', 'Tip']
    },
    owner: {
      welcome: '<strong>Good afternoon, Brian</strong><small>3 requests pending approval</small>',
      modules: ['Staff Portal', 'Payment', 'AI Assistant', 'Booking']
    }
  };

  var enabled = new Set(MODULES);
  var currentRole = 'customer';

  var moduleListEl = document.getElementById('oneqrModuleList');
  var welcomeEl = document.getElementById('oneqrWelcomeText');
  var tilesEl = document.getElementById('oneqrPreviewTiles');
  var addModuleBtn = document.getElementById('oneqrAddModule');

  if (!moduleListEl || !welcomeEl || !tilesEl) return;

  function iconHtml(name) {
    return '<i data-lucide="' + (MODULE_ICONS[name] || 'square') + '" aria-hidden="true"></i>';
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function renderModules() {
    moduleListEl.innerHTML = MODULES.map(function (name) {
      var on = enabled.has(name);
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
    var data = ROLE_DATA[currentRole] || ROLE_DATA.customer;
    welcomeEl.innerHTML = data.welcome;
    var orderedModules = MODULES.filter(function (name) {
      return enabled.has(name) && data.modules.indexOf(name) !== -1;
    });
    tilesEl.innerHTML = orderedModules.slice(0, 6).map(function (name) {
      return '<div class="oneqr-phone-tile">' + iconHtml(name) + '<b>' + name + '</b></div>';
    }).join('');
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
    var fromIndex = MODULES.indexOf(draggedModuleName);
    MODULES.splice(fromIndex, 1);
    var toIndex = MODULES.indexOf(targetName);
    MODULES.splice(isAfter ? toIndex + 1 : toIndex, 0, draggedModuleName);
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
    if (enabled.has(name)) {
      enabled.delete(name);
    } else {
      enabled.add(name);
    }
    btn.classList.toggle('is-on');
    btn.setAttribute('aria-pressed', enabled.has(name));
    renderPreview();
  });

  document.querySelectorAll('.oneqr-role-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      currentRole = tab.getAttribute('data-role');
      document.querySelectorAll('.oneqr-role-tab').forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      renderPreview();
    });
  });

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
    var label = button.querySelector('span');
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

  function openViewModal(opener) {
    if (!viewModal) return;
    viewModalOpener = opener;
    viewModalPreviousOverflow = document.body.style.overflow;
    viewModal.hidden = false;
    viewModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var closeButton = viewModal.querySelector('[data-oneqr-view-close]');
    if (closeButton) closeButton.focus();
  }

  function closeViewModal() {
    if (!viewModal || viewModal.hidden) return;
    viewModal.hidden = true;
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
      if (event.target === viewModal || event.target.closest('[data-oneqr-view-close]')) closeViewModal();
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && viewModal && !viewModal.hidden) closeViewModal();
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
    if (viewModal && viewModal.hidden) {
      openViewModal(opener);
      modalOpenedForPrint = true;
    }
    window.print();
  }

  window.addEventListener('afterprint', function () {
    if (modalOpenedForPrint) {
      closeViewModal();
      modalOpenedForPrint = false;
    }
  });

  function buildPrintableCard() {
    if (!viewModal) return null;
    var printCardSource = viewModal.querySelector('[data-oneqr-print-card]');
    if (!printCardSource) return null;
    var card = printCardSource.cloneNode(true);
    var closeButton = card.querySelector('[data-oneqr-view-close]');
    if (closeButton) closeButton.remove();

    var sourceCanvases = printCardSource.querySelectorAll('canvas');
    var cardCanvases = card.querySelectorAll('canvas');
    sourceCanvases.forEach(function (sourceCanvas, index) {
      var cardCanvas = cardCanvases[index];
      if (!cardCanvas) return;
      var container = cardCanvas.parentNode;
      if (container && container.querySelector('img')) {
        cardCanvas.remove();
        return;
      }
      var image = document.createElement('img');
      image.src = sourceCanvas.toDataURL('image/png');
      image.alt = 'Bitcoin Nail Bar OneQR code';
      image.style.width = '100%';
      image.style.height = '100%';
      image.style.display = 'block';
      cardCanvas.replaceWith(image);
    });

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
      'body { display: grid; min-height: 100vh; place-items: center; }' +
      '.oneqr-view-print-card { box-sizing: border-box !important; width: 5in !important; height: 7in !important; max-width: 5in !important; max-height: 7in !important; aspect-ratio: 5 / 7 !important; overflow: hidden !important; box-shadow: none !important; animation: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }' +
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
    document.body.appendChild(printCard);

    window.html2canvas(printCard, {
      backgroundColor: '#050505',
      scale: 2,
      useCORS: true,
      ignoreElements: function (el) {
        return el.classList && el.classList.contains('oneqr-view-dots');
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

  renderModules();
  renderPreview();
})();
