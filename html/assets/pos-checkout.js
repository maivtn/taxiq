/* Checkout page runtime — charges a single "Ready to pay" booking ticket. */
(function () {
  'use strict';

  var salonData = window.NEXORA_SALON_DATA;
  var appointmentStore = window.NEXORA_APPOINTMENTS_STORE;
  var catalog = salonData.loadCatalog();

  var params = new URLSearchParams(window.location.search);
  var bookingId = params.get('bookingId') || '';

  var root = document.querySelector('[data-checkout-root]');
  var empty = document.querySelector('[data-checkout-empty]');

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function money(value) {
    return '$' + (Number(value) || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function findRecord() {
    return appointmentStore.loadAll(null, catalog).find(function (r) {
      return String(r.id) === String(bookingId);
    }) || null;
  }

  var record = findRecord();

  if (!bookingId || !record) {
    if (root) root.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }

  if (root) root.hidden = false;
  if (empty) empty.hidden = true;

  function lineItems() {
    var details = Array.isArray(record.serviceDetails) ? record.serviceDetails.filter(Boolean) : [];
    if (!details.length && Array.isArray(record.tickets) && record.tickets.length) {
      details = record.tickets.map(function (ticket) {
        return {
          name: ticket.serviceName,
          price: ticket.price,
          technicianName: ticket.technicianName
        };
      });
    }
    if (!details.length) {
      details = (record.serviceNames || []).map(function (name) {
        return { name: name, price: null, technicianName: record.technicianName };
      });
    }
    return details;
  }

  var items = lineItems();

  function subtotal() {
    return items.reduce(function (sum, item) {
      return sum + (Number(item.price) || 0);
    }, 0);
  }

  var alreadyCheckedOut = Boolean(record.metadata && record.metadata.checkedOut);
  var tipState = { mode: 'fixed', value: 15 };
  var discountState = null;
  var paymentMethods = ['Card', 'Cash', 'Gift Card', 'Split pay'];
  var selectedMethod = paymentMethods[0];
  var primaryTechName = record.technicianName || (items[0] && items[0].technicianName) || 'Technician';

  function computeTip() {
    return tipState.mode === 'percent' ? Math.round(subtotal() * tipState.value) / 100 : tipState.value;
  }

  function computeDiscount() {
    if (!discountState || !discountState.value) return 0;
    var base = subtotal();
    var amount = discountState.mode === 'percent' ? base * discountState.value / 100 : discountState.value;
    return Math.min(Math.max(amount, 0), base);
  }

  function formatStart() {
    var start = new Date(record.startAt);
    if (!Number.isFinite(start.getTime())) return '';
    return start.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  function renderMeta() {
    var serviceLabel = items.map(function (item) { return item.name; }).filter(Boolean).join(' + ') || 'Service to confirm';
    var meta = document.querySelector('[data-checkout-meta]');
    if (meta) meta.textContent = (record.customerName || 'Customer') + ' · ' + formatStart() + ' · ' + serviceLabel + ' · ' + primaryTechName;
    var customerBadge = document.querySelector('[data-checkout-customer-badge]');
    if (customerBadge) customerBadge.textContent = record.customerName || 'Customer';
    var statusBadge = document.querySelector('[data-checkout-status-badge]');
    if (statusBadge && alreadyCheckedOut) {
      statusBadge.textContent = 'Checked out';
      statusBadge.className = 'badge booking-status booking-status-checkedout';
    }
  }

  function renderLines() {
    var host = document.querySelector('[data-checkout-lines]');
    if (!host) return;
    host.innerHTML = items.map(function (item) {
      return '<div class="checkout-line">' +
        '<div><div class="checkout-line-title">' + esc(item.name || 'Service') + '</div></div>' +
        '<div class="checkout-line-sub">' + (item.isProduct ? '—' : esc(item.technicianName || primaryTechName)) + '</div>' +
        '<div>' + (item.price == null ? '—' : money(item.price)) + '</div>' +
        '</div>';
    }).join('');
  }

  function renderTip() {
    var techEl = document.querySelector('[data-checkout-tip-tech]');
    if (techEl) techEl.textContent = primaryTechName;
    var amountEl = document.querySelector('[data-checkout-tip-amount]');
    if (amountEl) amountEl.textContent = money(computeTip());
  }

  function renderPaymentMethods() {
    var host = document.querySelector('[data-checkout-pay-methods]');
    if (!host) return;
    var icons = { 'Card': 'bi-credit-card', 'Cash': 'bi-cash-coin', 'Gift Card': 'bi-gift', 'Split pay': 'bi-layers' };
    host.innerHTML = paymentMethods.map(function (method) {
      return '<button class="pay-method-card' + (method === selectedMethod ? ' is-active' : '') + '" type="button" data-checkout-pay="' + esc(method) + '">' +
        '<i class="bi ' + (icons[method] || 'bi-credit-card') + '" aria-hidden="true"></i><span>' + esc(method) + '</span></button>';
    }).join('');
  }

  function renderSummary() {
    var tip = computeTip();
    var discount = computeDiscount();
    var total = subtotal() - discount + tip;
    var setText = function (selector, text) {
      var el = document.querySelector(selector);
      if (el) el.textContent = text;
    };
    setText('[data-checkout-subtotal]', money(subtotal()));
    setText('[data-checkout-tip-total]', money(tip));
    var discountRow = document.querySelector('[data-checkout-discount-row]');
    if (discountRow) discountRow.hidden = discount <= 0;
    setText('[data-checkout-discount-amount]', '-' + money(discount));
    setText('[data-checkout-method-label]', selectedMethod);
    setText('[data-checkout-total]', money(total));
    var chargeButton = document.querySelector('[data-checkout-charge]');
    if (chargeButton && !chargeButton.classList.contains('is-paid')) {
      chargeButton.textContent = 'Charge ' + money(total);
    }
  }

  function populateAddServiceOptions() {
    var serviceSelect = document.querySelector('[data-checkout-add-service-select]');
    if (serviceSelect) {
      var services = (catalog.services || []).filter(function (s) { return s.active !== false; });
      serviceSelect.innerHTML = services.map(function (s) {
        return '<option value="' + esc(s.id) + '">' + esc(s.name) + (s.price == null ? '' : ' — ' + money(s.price)) + '</option>';
      }).join('');
    }
    var techSelect = document.querySelector('[data-checkout-add-service-tech]');
    if (techSelect) {
      var technicians = (catalog.technicians || []).filter(function (t) { return t.active !== false; });
      techSelect.innerHTML = '<option value="">' + esc(primaryTechName) + '</option>' + technicians.map(function (t) {
        return '<option value="' + esc(t.name) + '">' + esc(t.name) + '</option>';
      }).join('');
    }
  }

  var drinkProducts = [];

  function loadDrinkProducts() {
    if (typeof fetch !== 'function') return;
    fetch('../menu/menu.json').then(function (response) {
      if (!response || response.ok === false) throw new Error('menu unavailable');
      return response.json();
    }).then(function (data) {
      var sections = Array.isArray(data.sections) ? data.sections : [];
      sections.filter(function (section) {
        return section && section.kind === 'beverage';
      }).forEach(function (section) {
        (Array.isArray(section.items) ? section.items : []).forEach(function (item) {
          var label = item && item.priceLabel ? String(item.priceLabel) : 'Complimentary';
          var match = label.replace(/,/g, '').match(/\d+(?:\.\d+)?/);
          drinkProducts.push({
            name: item.name,
            price: match ? Number(match[0]) : 0,
            priceLabel: label,
            category: section.title
          });
        });
      });
      populateAddProductOptions();
    }).catch(function () {
      var select = document.querySelector('[data-checkout-add-product-select]');
      if (select) select.innerHTML = '<option value="">Menu unavailable</option>';
    });
  }

  function populateAddProductOptions() {
    var select = document.querySelector('[data-checkout-add-product-select]');
    if (!select) return;
    if (!drinkProducts.length) {
      select.innerHTML = '<option value="">No drinks available</option>';
      return;
    }
    var groups = {};
    var order = [];
    drinkProducts.forEach(function (product, index) {
      if (!groups[product.category]) { groups[product.category] = []; order.push(product.category); }
      groups[product.category].push(index);
    });
    select.innerHTML = order.map(function (category) {
      return '<optgroup label="' + esc(category) + '">' + groups[category].map(function (index) {
        var product = drinkProducts[index];
        return '<option value="' + index + '">' + esc(product.name) + ' — ' + esc(product.priceLabel) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
    syncProductPriceField();
  }

  function syncProductPriceField() {
    var select = document.querySelector('[data-checkout-add-product-select]');
    var priceInput = document.querySelector('[data-checkout-add-product-price]');
    if (!select || !priceInput) return;
    var product = drinkProducts[Number(select.value)];
    priceInput.value = product ? product.price.toFixed(2) : '0.00';
  }

  function openCheckoutModal(name) {
    var modal = document.querySelector('[data-checkout-modal="' + name + '"]');
    if (!modal) return;
    if (name === 'discount') fillDiscountModal();
    modal.hidden = false;
  }

  function closeCheckoutModal(modal) {
    if (modal) modal.hidden = true;
  }

  function fillDiscountModal() {
    var mode = (discountState && discountState.mode) || 'percent';
    document.querySelectorAll('[data-discount-mode]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.discountMode === mode);
    });
    var label = document.querySelector('[data-checkout-discount-label]');
    if (label) label.textContent = 'Discount (' + (mode === 'percent' ? '%' : '$') + ')';
    var input = document.querySelector('[data-checkout-discount-value]');
    if (input) input.value = discountState ? discountState.value : '';
  }

  function renderAll() {
    renderMeta();
    renderLines();
    renderTip();
    renderPaymentMethods();
    renderSummary();
    populateAddServiceOptions();
    loadDrinkProducts();
    if (alreadyCheckedOut) markPaid(false);
  }

  function markPaid(persist) {
    var tip = computeTip();
    var discount = computeDiscount();
    var total = subtotal() - discount + tip;
    if (persist) {
      var result = appointmentStore.update(record.id, {
        metadata: Object.assign({}, record.metadata, {
          checkedOut: true,
          checkoutTotal: total,
          checkoutTip: tip,
          checkoutDiscount: discount,
          checkoutMethod: selectedMethod,
          checkoutAt: new Date().toISOString()
        })
      }, null, catalog);
      if (!result.ok) return;
      record = result.record;
    }
    var chargeButton = document.querySelector('[data-checkout-charge]');
    if (chargeButton) {
      chargeButton.disabled = true;
      chargeButton.classList.add('is-paid');
      chargeButton.textContent = 'Paid · ' + money(total);
    }
    ['receipt', 'tip', 'status'].forEach(function (key) {
      var item = document.querySelector('[data-checkout-sync-item="' + key + '"]');
      if (item) item.classList.add('is-complete');
    });
    var statusBadge = document.querySelector('[data-checkout-status-badge]');
    if (statusBadge) {
      statusBadge.textContent = 'Checked out';
      statusBadge.className = 'badge booking-status booking-status-checkedout';
    }
  }

  document.addEventListener('click', function (event) {
    var tipChip = event.target.closest('[data-tip-mode]');
    if (tipChip) {
      tipState = { mode: tipChip.dataset.tipMode, value: Number(tipChip.dataset.tipValue) };
      document.querySelectorAll('.tip-chip').forEach(function (chip) { chip.classList.toggle('is-active', chip === tipChip); });
      renderTip();
      renderSummary();
      return;
    }

    var payMethod = event.target.closest('[data-checkout-pay]');
    if (payMethod) {
      selectedMethod = payMethod.dataset.checkoutPay;
      renderPaymentMethods();
      renderSummary();
      return;
    }

    var chargeButton = event.target.closest('[data-checkout-charge]');
    if (chargeButton && !chargeButton.classList.contains('is-paid')) {
      markPaid(true);
      return;
    }

    var openModalTrigger = event.target.closest('[data-checkout-open-modal]');
    if (openModalTrigger) {
      openCheckoutModal(openModalTrigger.dataset.checkoutOpenModal);
      return;
    }

    var modalCloseTrigger = event.target.closest('[data-checkout-modal-close]');
    if (modalCloseTrigger) {
      closeCheckoutModal(modalCloseTrigger.closest('[data-checkout-modal]'));
      return;
    }

    var modalBackdrop = event.target.closest('[data-checkout-modal]');
    if (modalBackdrop && event.target === modalBackdrop) {
      closeCheckoutModal(modalBackdrop);
      return;
    }

    var discountModeBtn = event.target.closest('[data-discount-mode]');
    if (discountModeBtn) {
      document.querySelectorAll('[data-discount-mode]').forEach(function (btn) { btn.classList.toggle('is-active', btn === discountModeBtn); });
      var label = document.querySelector('[data-checkout-discount-label]');
      if (label) label.textContent = 'Discount (' + (discountModeBtn.dataset.discountMode === 'percent' ? '%' : '$') + ')';
      return;
    }

    var discountConfirm = event.target.closest('[data-checkout-discount-confirm]');
    if (discountConfirm) {
      var activeModeBtn = document.querySelector('[data-discount-mode].is-active');
      var mode = activeModeBtn ? activeModeBtn.dataset.discountMode : 'percent';
      var valueInput = document.querySelector('[data-checkout-discount-value]');
      var value = Number(valueInput && valueInput.value) || 0;
      discountState = value > 0 ? { mode: mode, value: value } : null;
      renderSummary();
      closeCheckoutModal(discountConfirm.closest('[data-checkout-modal]'));
      return;
    }

    var discountRemove = event.target.closest('[data-checkout-discount-remove]');
    if (discountRemove) {
      discountState = null;
      renderSummary();
      closeCheckoutModal(discountRemove.closest('[data-checkout-modal]'));
      return;
    }

    var addServiceConfirm = event.target.closest('[data-checkout-add-service-confirm]');
    if (addServiceConfirm) {
      var serviceSelect = document.querySelector('[data-checkout-add-service-select]');
      var techSelect = document.querySelector('[data-checkout-add-service-tech]');
      var service = serviceSelect && serviceSelect.value ? salonData.findService(catalog, serviceSelect.value) : null;
      if (service) {
        items.push({
          name: service.name,
          price: service.price,
          durationMin: service.durationMin,
          technicianName: (techSelect && techSelect.value) || primaryTechName
        });
        renderLines();
        renderSummary();
      }
      closeCheckoutModal(addServiceConfirm.closest('[data-checkout-modal]'));
      return;
    }

    var addProductConfirm = event.target.closest('[data-checkout-add-product-confirm]');
    if (addProductConfirm) {
      var productSelect = document.querySelector('[data-checkout-add-product-select]');
      var priceInput = document.querySelector('[data-checkout-add-product-price]');
      var product = productSelect ? drinkProducts[Number(productSelect.value)] : null;
      var priceValue = Number(priceInput && priceInput.value);
      if (product) {
        items.push({ name: product.name, price: Number.isFinite(priceValue) ? priceValue : product.price, isProduct: true });
        renderLines();
        renderSummary();
      }
      closeCheckoutModal(addProductConfirm.closest('[data-checkout-modal]'));
      return;
    }
  });

  document.addEventListener('change', function (event) {
    if (event.target.matches('[data-checkout-add-product-select]')) {
      syncProductPriceField();
    }
  });

  renderAll();
})();
