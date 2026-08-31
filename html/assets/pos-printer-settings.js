(function (global) {
  'use strict';

  var PRINTERS = [
    { id: 'tsp100', model: 'Star TSP100III', interface: 'Bluetooth', identifier: 'STAR-45A8' },
    { id: 'mcprint3', model: 'Star mC-Print3', interface: 'LAN', identifier: '192.168.1.42' }
  ];
  var RECEIPT_STORAGE_KEY = 'nexora.pos.printer.receipt-settings.v1';
  var PRINTER_STORAGE_KEY = 'nexora.pos.printer.profile.v1';
  var DEFAULT_PREFERENCES = { printProducts: true, sortServices: true, cardCopies: 1, otherCopies: 1 };

  function selectedPrinter(state) {
    return PRINTERS.find(function (printer) { return printer.id === state.connectedPrinterId; }) || null;
  }

  function statusDetails(status) {
    var statuses = {
      ready: { label: 'Ready', className: 'is-ready', note: 'The POS reconnects to this printer automatically before each print.' },
      connecting: { label: 'Connecting', className: 'is-neutral', note: 'Establishing a secure connection with the selected printer.' },
      paperLow: { label: 'Paper low', className: 'is-warning', note: 'Printing is available, but the paper roll should be replaced soon.' },
      paperEmpty: { label: 'Out of paper', className: 'is-error', note: 'Replace the paper roll, close the cover, then try printing again.' },
      coverOpen: { label: 'Cover open', className: 'is-error', note: 'Close the printer cover securely before trying again.' },
      connectionLost: { label: 'Connection lost', className: 'is-error', note: 'Check printer power and Bluetooth or network availability.' }
    };
    return statuses[status] || statuses.ready;
  }

  function detectRuntime() {
    var messageHandlers = global.webkit && global.webkit.messageHandlers;
    return messageHandlers && messageHandlers.starPrinter ? 'native' : 'safari';
  }

  function modeControls(state) {
    return '<div class="printer-runtime" role="group" aria-label="Demo printer runtime">' +
      '<span class="printer-runtime-label">Preview as</span>' +
      '<button class="printer-runtime-button' + (state.runtime === 'native' ? ' is-active' : '') + '" type="button" data-printer-mode="native" aria-pressed="' + (state.runtime === 'native') + '">iPad App</button>' +
      '<button class="printer-runtime-button' + (state.runtime === 'safari' ? ' is-active' : '') + '" type="button" data-printer-mode="safari" aria-pressed="' + (state.runtime === 'safari') + '">Safari</button>' +
    '</div>';
  }

  function formatTestDate(timestamp) {
    var date = new Date(timestamp);
    return {
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date),
      time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date)
    };
  }

  function notify(message, icon) {
    if (global.Swal && typeof global.Swal.fire === 'function') {
      global.Swal.fire({ icon: icon || 'info', title: message, timer: 1600, showConfirmButton: false });
    }
  }

  function nativePrinterMarkup(state) {
    var printer = selectedPrinter(state);
    if (!printer) {
      return '<section class="printer-card" aria-labelledby="printer-connection-title">' +
        '<div class="printer-card-head"><div><h2 id="printer-connection-title">Receipt printer</h2><p>Connect and print directly from the POS app.</p></div><span class="printer-method">Star SDK</span></div>' +
        '<div class="printer-empty"><span class="printer-device-icon" aria-hidden="true"><i class="bi bi-printer"></i></span><h3>No printer connected</h3><p>Find a nearby Star printer using Bluetooth or your local network.</p><button class="pos-btn pos-btn-primary" type="button" data-printer-action="find-printer"><i class="bi bi-search" aria-hidden="true"></i> Find printer</button></div>' +
      '</section>';
    }

    var detail = statusDetails(state.printerStatus);
    var canPrint = state.printerStatus === 'ready' || state.printerStatus === 'paperLow';
    var connecting = state.printerStatus === 'connecting';

    return '<section class="printer-card" aria-labelledby="printer-connection-title">' +
      '<div class="printer-card-head"><div><h2 id="printer-connection-title">Receipt printer</h2><p>Connect and print directly from the POS app.</p></div><span class="printer-method">Star SDK</span></div>' +
      '<div class="printer-card-body"><div class="printer-device"><span class="printer-device-icon" aria-hidden="true"><i class="bi bi-printer"></i></span><div class="printer-device-copy"><strong>' + printer.model + '</strong><span>' + printer.interface + ' · ' + printer.identifier + '</span></div><span class="printer-status ' + detail.className + '" role="status" aria-live="polite">' + detail.label + '</span></div>' +
      '<div class="printer-help"><i class="bi bi-info-circle" aria-hidden="true"></i><span>' + detail.note + '</span></div>' +
      '<div class="printer-actions"><button class="pos-btn pos-btn-primary" type="button" data-printer-action="test-print"' + (canPrint && !state.printInProgress ? '' : ' disabled') + '><i class="bi bi-file-earmark-check" aria-hidden="true"></i> ' + (state.printInProgress ? 'Printing…' : 'Test print') + '</button><button class="pos-btn" type="button" data-printer-action="change-printer"' + (connecting ? ' disabled' : '') + '><i class="bi bi-arrow-repeat" aria-hidden="true"></i> Change printer</button><button class="pos-btn printer-danger-button" type="button" data-printer-action="disconnect"' + (connecting ? ' disabled' : '') + '><i class="bi bi-plug" aria-hidden="true"></i> Disconnect</button></div>' +
      '<div class="printer-demo-tools"><label for="printer-status-simulator">Prototype: device status</label><select class="pos-input" id="printer-status-simulator" data-printer-status-simulator aria-label="Simulate printer status">' +
        '<option value="ready"' + (state.printerStatus === 'ready' ? ' selected' : '') + '>Ready</option><option value="paperLow"' + (state.printerStatus === 'paperLow' ? ' selected' : '') + '>Paper low</option><option value="paperEmpty"' + (state.printerStatus === 'paperEmpty' ? ' selected' : '') + '>Out of paper</option><option value="coverOpen"' + (state.printerStatus === 'coverOpen' ? ' selected' : '') + '>Cover open</option><option value="connectionLost"' + (state.printerStatus === 'connectionLost' ? ' selected' : '') + '>Connection lost</option>' +
      '</select></div></div>' +
    '</section>';
  }

  function safariPrinterMarkup(state) {
    var lastTest = '';
    if (state.lastSafariTest) {
      var when = formatTestDate(state.lastSafariTest);
      lastTest = '<div class="printer-last-test" data-printer-last-test><span><strong>Test successful</strong><small>PassPRNT returned to POS</small></span><span class="credits-history-date">' + when.date + '<small>' + when.time + '</small></span></div>';
    }
    return '<section class="printer-card" aria-labelledby="printer-connection-title">' +
      '<div class="printer-card-head"><div><h2 id="printer-connection-title">Receipt printer</h2><p>Print from Safari through the Star companion app.</p></div><span class="printer-method">PassPRNT</span></div>' +
      '<div class="printer-card-body"><div class="printer-help"><i class="bi bi-browser-safari" aria-hidden="true"></i><span><strong>Star PassPRNT is required.</strong> Safari sends receipts to PassPRNT, which communicates with the printer.</span></div>' +
      '<div class="printer-steps"><div class="printer-step"><span>1</span><div><strong>Install Star PassPRNT</strong><small>Required once on this iPad.</small></div><button class="pos-btn" type="button" data-printer-action="install-passprnt"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Install</button></div>' +
      '<div class="printer-step"><span>2</span><div><strong>Choose your printer</strong><small>Configure Bluetooth or LAN inside PassPRNT.</small></div><button class="pos-btn" type="button" data-printer-action="open-passprnt"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Open PassPRNT</button></div>' +
      '<div class="printer-step"><span>3</span><div><strong>Verify printing</strong><small>Send a sample receipt and return to POS.</small></div><button class="pos-btn pos-btn-primary" type="button" data-printer-action="test-print"' + (state.printInProgress ? ' disabled' : '') + '><i class="bi bi-file-earmark-check" aria-hidden="true"></i> ' + (state.printInProgress ? 'Opening PassPRNT…' : 'Test print') + '</button></div></div>' + lastTest + '</div>' +
    '</section>';
  }

  function clonePreferences(preferences) {
    return {
      printProducts: !!preferences.printProducts,
      sortServices: !!preferences.sortServices,
      cardCopies: preferences.cardCopies,
      otherCopies: preferences.otherCopies
    };
  }

  function normalizeCopies(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.min(3, Math.round(number))) : fallback;
  }

  function loadPreferences() {
    try {
      var stored = JSON.parse(global.localStorage.getItem(RECEIPT_STORAGE_KEY) || 'null');
      if (!stored || typeof stored !== 'object') return clonePreferences(DEFAULT_PREFERENCES);
      return {
        printProducts: typeof stored.printProducts === 'boolean' ? stored.printProducts : DEFAULT_PREFERENCES.printProducts,
        sortServices: typeof stored.sortServices === 'boolean' ? stored.sortServices : DEFAULT_PREFERENCES.sortServices,
        cardCopies: normalizeCopies(stored.cardCopies, DEFAULT_PREFERENCES.cardCopies),
        otherCopies: normalizeCopies(stored.otherCopies, DEFAULT_PREFERENCES.otherCopies)
      };
    } catch (error) {
      return clonePreferences(DEFAULT_PREFERENCES);
    }
  }

  function savePreferences(preferences) {
    try {
      global.localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {}
  }

  function loadPrinterId() {
    try {
      var raw = global.localStorage.getItem(PRINTER_STORAGE_KEY);
      if (raw === null) return 'tsp100';
      var profile = JSON.parse(raw);
      if (profile && profile.connectedPrinterId === null) return null;
      var printerId = profile && profile.connectedPrinterId;
      return PRINTERS.some(function (printer) { return printer.id === printerId; }) ? printerId : 'tsp100';
    } catch (error) {
      return 'tsp100';
    }
  }

  function savePrinterId(printerId) {
    try {
      global.localStorage.setItem(PRINTER_STORAGE_KEY, JSON.stringify({ connectedPrinterId: printerId }));
    } catch (error) {}
  }

  function isDirty(state) {
    return JSON.stringify(state.preferences) !== JSON.stringify(state.savedPreferences);
  }

  function preferenceToggle(key, label, description, checked) {
    return '<div class="printer-setting-row"><div><strong>' + label + '</strong><small>' + description + '</small></div>' +
      '<label class="printer-switch"><input type="checkbox" data-printer-preference="' + key + '" aria-label="' + label + '"' + (checked ? ' checked' : '') + '><span aria-hidden="true"></span></label></div>';
  }

  function copyStepper(key, label, description, value) {
    return '<div class="printer-setting-row"><div><strong>' + label + '</strong><small>' + description + '</small></div>' +
      '<div class="printer-stepper" role="group" aria-label="' + label + '">' +
        '<button type="button" data-printer-adjust="' + key + '" data-delta="-1" aria-label="Decrease ' + label.toLowerCase() + '"' + (value === 0 ? ' disabled' : '') + '>−</button>' +
        '<output data-printer-copy-output="' + key + '" aria-live="polite">' + value + '</output>' +
        '<button type="button" data-printer-adjust="' + key + '" data-delta="1" aria-label="Increase ' + label.toLowerCase() + '"' + (value === 3 ? ' disabled' : '') + '>+</button>' +
      '</div></div>';
  }

  function receiptSettingsMarkup(state) {
    var dirty = isDirty(state);
    return '<section class="printer-card" aria-labelledby="printer-receipt-title">' +
      '<div class="printer-card-head"><div><h2 id="printer-receipt-title">Receipt settings</h2><p>Choose what prints and how many copies.</p></div></div>' +
      '<div class="printer-card-body"><div class="printer-setting-list">' +
        preferenceToggle('printProducts', 'Print products', 'Include retail products on the receipt.', state.preferences.printProducts) +
        preferenceToggle('sortServices', 'Sort services', 'Group services in a consistent order.', state.preferences.sortServices) +
        copyStepper('cardCopies', 'Card payment copies', 'Number of receipts after card payment.', state.preferences.cardCopies) +
        copyStepper('otherCopies', 'Other payment copies', 'Number of receipts for cash or other methods.', state.preferences.otherCopies) +
      '</div><div class="printer-save-bar"><span data-printer-save-state>' + (dirty ? 'Unsaved changes' : 'All changes saved') + '</span>' +
      '<button class="pos-btn pos-btn-primary" type="button" data-printer-action="save-settings"' + (dirty ? '' : ' disabled') + '><i class="bi bi-floppy" aria-hidden="true"></i> Save settings</button></div></div>' +
    '</section>';
  }

  function discoveryMarkup(state) {
    if (!state.discoveryOpen) return '';
    return '<div class="sms-modal printer-discovery-modal open" data-printer-discovery-modal role="dialog" aria-modal="true" aria-hidden="false" aria-labelledby="printer-discovery-title">' +
      '<div class="sms-dialog printer-discovery-dialog"><div class="sms-mhead"><div><h3 id="printer-discovery-title"><i class="bi bi-search" aria-hidden="true"></i> Choose a printer</h3><p>Printers discovered by the Star SDK appear here.</p></div><button class="pos-icon-btn" type="button" data-printer-action="close-discovery" aria-label="Close printer list"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>' +
      '<div class="sms-mbody"><div class="printer-discovery-list">' + PRINTERS.map(function (printer) {
        return '<button class="printer-discovery-option" type="button" data-printer-id="' + printer.id + '"><span class="printer-device-icon" aria-hidden="true"><i class="bi bi-printer"></i></span><span><strong>' + printer.model + '</strong><small>' + printer.interface + ' · ' + printer.identifier + '</small></span><i class="bi bi-chevron-right" aria-hidden="true"></i></button>';
      }).join('') + '</div></div></div></div>';
  }

  function render(controller) {
    var state = controller.state;
    controller.root.innerHTML = '<div class="printer-settings">' +
      '<div class="printer-settings-toolbar"><div><span class="printer-kicker">Hardware</span><h2>Printer setup</h2><p>Configure a Star receipt printer for this POS.</p></div>' + modeControls(state) + '</div>' +
      '<div class="printer-demo-note"><i class="bi bi-info-circle" aria-hidden="true"></i> Demo control only — production detects the runtime automatically.</div>' +
      '<div class="printer-settings-columns">' + (state.runtime === 'native' ? nativePrinterMarkup(state) : safariPrinterMarkup(state)) + receiptSettingsMarkup(state) + '</div>' +
      '<div class="printer-feedback" data-printer-feedback role="status" aria-live="polite">' + (state.feedback || '') + '</div>' + discoveryMarkup(state) +
    '</div>';
  }

  function init(root, options) {
    if (!root) return null;
    options = options || {};
    var savedPreferences = loadPreferences();
    var controller = {
      root: root,
      state: {
        runtime: options.runtime === 'native' || options.runtime === 'safari' ? options.runtime : detectRuntime(),
        connectedPrinterId: loadPrinterId(),
        printerStatus: 'ready',
        discoveryOpen: false,
        printInProgress: false,
        lastSafariTest: null,
        feedback: '',
        preferences: clonePreferences(savedPreferences),
        savedPreferences: clonePreferences(savedPreferences)
      }
    };

    root.addEventListener('click', function (event) {
      var modeButton = event.target.closest('[data-printer-mode]');
      if (modeButton) {
        controller.state.runtime = modeButton.getAttribute('data-printer-mode') === 'safari' ? 'safari' : 'native';
        render(controller);
        return;
      }

      var printerButton = event.target.closest('[data-printer-id]');
      if (printerButton) {
        global.clearTimeout(controller.connectionTimer);
        controller.state.connectedPrinterId = printerButton.getAttribute('data-printer-id');
        controller.state.printerStatus = 'connecting';
        controller.state.discoveryOpen = false;
        render(controller);
        controller.connectionTimer = global.setTimeout(function () {
          controller.state.printerStatus = 'ready';
          savePrinterId(controller.state.connectedPrinterId);
          render(controller);
        }, 600);
        return;
      }

      var adjustButton = event.target.closest('[data-printer-adjust]');
      if (adjustButton) {
        var key = adjustButton.getAttribute('data-printer-adjust');
        var delta = Number(adjustButton.getAttribute('data-delta')) || 0;
        if (key === 'cardCopies' || key === 'otherCopies') {
          controller.state.preferences[key] = Math.max(0, Math.min(3, controller.state.preferences[key] + delta));
          render(controller);
        }
        return;
      }

      var actionButton = event.target.closest('[data-printer-action]');
      if (!actionButton) return;
      var action = actionButton.getAttribute('data-printer-action');
      if (action === 'save-settings') {
        controller.state.savedPreferences = clonePreferences(controller.state.preferences);
        savePreferences(controller.state.savedPreferences);
        controller.state.feedback = 'Receipt settings saved.';
        render(controller);
        notify('Receipt settings saved.', 'success');
      } else if (action === 'disconnect') {
        global.clearTimeout(controller.connectionTimer);
        controller.state.connectedPrinterId = null;
        controller.state.printerStatus = 'disconnected';
        savePrinterId(null);
        render(controller);
      } else if (action === 'find-printer' || action === 'change-printer') {
        controller.state.discoveryOpen = true;
        render(controller);
      } else if (action === 'close-discovery') {
        controller.state.discoveryOpen = false;
        render(controller);
      } else if (action === 'test-print') {
        var nativeCanPrint = controller.state.printerStatus === 'ready' || controller.state.printerStatus === 'paperLow';
        if (controller.state.printInProgress || (controller.state.runtime === 'native' && !nativeCanPrint)) return;
        controller.state.printInProgress = true;
        controller.state.feedback = controller.state.runtime === 'safari' ? 'Sending a sample receipt to PassPRNT…' : 'Sending a sample receipt…';
        render(controller);
        global.setTimeout(function () {
          if (controller.state.runtime === 'safari') controller.state.lastSafariTest = Date.now();
          controller.state.printInProgress = false;
          controller.state.feedback = 'Test receipt printed successfully.';
          render(controller);
          notify('Test receipt printed successfully.', 'success');
        }, 600);
      } else if (action === 'install-passprnt') {
        controller.state.feedback = 'App Store launch simulated for this prototype.';
        render(controller);
        notify(controller.state.feedback, 'info');
      } else if (action === 'open-passprnt') {
        controller.state.feedback = 'PassPRNT launch simulated. Configure the printer there.';
        render(controller);
        notify(controller.state.feedback, 'info');
      }
    });

    root.addEventListener('change', function (event) {
      var preference = event.target.closest('[data-printer-preference]');
      if (preference) {
        var key = preference.getAttribute('data-printer-preference');
        if (key !== 'printProducts' && key !== 'sortServices') return;
        controller.state.preferences[key] = preference.checked;
        render(controller);
        return;
      }

      var statusSelect = event.target.closest('[data-printer-status-simulator]');
      if (statusSelect) {
        controller.state.printerStatus = statusSelect.value;
        render(controller);
      }
    });

    render(controller);
    return controller;
  }

  global.NEXORA_POS_PRINTER_SETTINGS = { init: init };

  if (global.document) {
    var root = global.document.querySelector('[data-printer-settings-root]');
    if (root) {
      var demoRuntime = root.getAttribute('data-printer-demo-runtime');
      init(root, demoRuntime ? { runtime: demoRuntime } : {});
    }
  }
}(typeof window !== 'undefined' ? window : this));
