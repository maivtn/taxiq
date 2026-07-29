/* Booking workspace runtime ported from the canonical Booking Book surface. */

var DEFAULT_MAIN_TAB = 'booking';
    var BOOKING_TODAY_DATE = '2026-07-09';
    var BOOKING_SEARCH_PLACEHOLDERS = {
      name: 'Enter customer name',
      phone: 'Enter phone number',
      email: 'Enter email',
      service: 'Enter service name'
    };

    var BOOKING_STATUS_CLASS = {
      'new': 'is-new',
      'sms-sent': 'is-sms-sent',
      'done': 'is-done',
      'noshow': 'is-noshow'
    };
    var bookingStatusFilter = 'all';
    var bookingFilterOpen = null;
    var bookingDateFromPicker = null;
    var bookingDateToPicker = null;
    var bookingTeamCalendar = null;
    var bookingCalendarDate = BOOKING_TODAY_DATE;
    var salonData = window.NEXORA_SALON_DATA;
    var appointmentStore = window.NEXORA_APPOINTMENTS_STORE;
    var appointmentTicketUtils = window.NEXORA_APPOINTMENT_TICKETS;
    var appointmentServiceCatalogLoader = window.NEXORA_APPOINTMENT_SERVICE_CATALOG;
    var appointmentServiceCatalog = null;
    var APPOINTMENT_SERVICE_CATALOG_URL = '../assets/booking-service-catalog-draft.json';
    var catalog = salonData.loadCatalog();
    var BOOKING_CALENDAR_SERVICE_OPTIONS = [];
    var BOOKING_CALENDAR_COLORS = {
      t1: { bg: '#ebe6ff', border: '#7456e9', text: '#272343' },
      t2: { bg: '#e0f3f8', border: '#2b96ba', text: '#173a47' },
      t3: { bg: '#e5f7f1', border: '#158a69', text: '#163d34' },
      t4: { bg: '#fff1d6', border: '#d97706', text: '#654003' },
      t5: { bg: '#fde7f0', border: '#c24182', text: '#5e203f' },
      t6: { bg: '#e8f4ff', border: '#2879c7', text: '#1d4267' },
      t7: { bg: '#f5eaff', border: '#9a50c7', text: '#4c2764' },
      t8: { bg: '#e9f7df', border: '#5c9e2e', text: '#31591c' },
      unassigned: { bg: '#fff1d6', border: '#d97706', text: '#654003' }
    };
    var BOOKING_CALENDAR_TECHNICIANS = null;
    var BOOKING_CALENDAR_SERVICE_DURATIONS = null;

    function rebuildBookingCatalogViews() {
      catalog = salonData.loadCatalog();
      BOOKING_CALENDAR_SERVICE_OPTIONS = [];
      BOOKING_CALENDAR_SERVICE_DURATIONS = {};
      var serviceSource = appointmentServiceCatalog && appointmentServiceCatalog.services.length
        ? appointmentServiceCatalog.services
        : catalog.services.filter(function(service) { return service.active; });
      serviceSource.forEach(function(service) {
        var salonService = salonData.findService(catalog, service.id) || salonData.findService(catalog, service.name);
        BOOKING_CALENDAR_SERVICE_OPTIONS.push({
          name: service.name,
          price: service.price,
          duration: service.durationMin || 60,
          serviceId: service.id,
          icon: service.icon || '✨',
          requiredSkill: service.requiredSkill || (salonService ? salonService.requiredSkill : '') || '',
          categoryId: service.categoryId || 'category-other',
          categoryName: service.categoryName || service.requiredSkill || 'Other services'
        });
        [service.name].concat(service.aliases || []).forEach(function(label) {
          BOOKING_CALENDAR_SERVICE_DURATIONS[label] = service.durationMin || 60;
        });
      });
      BOOKING_CALENDAR_TECHNICIANS = catalog.technicians.filter(function(technician) { return technician.active; }).map(function(technician) { return technician.id; });
    }

    function bookingTechByValue(value) {
      return salonData.findTechnician(catalog, value);
    }

    function bookingTechName(value) {
      if (!value || value === 'unassigned' || value === 'Anyone') return 'Unassigned';
      var technician = bookingTechByValue(value);
      return technician ? technician.name : String(value);
    }

    function bookingCalendarTechLabel(value) {
      return bookingCalendarResourceTech(value) === 'unassigned' ? 'Anyone / Unassigned' : bookingTechName(value);
    }

    rebuildBookingCatalogViews();

    function loadBookingAppointmentServiceCatalog() {
      if (!appointmentServiceCatalogLoader || typeof appointmentServiceCatalogLoader.load !== 'function') return;
      appointmentServiceCatalogLoader.load(APPOINTMENT_SERVICE_CATALOG_URL).then(function(nextCatalog) {
        appointmentServiceCatalog = nextCatalog;
        rebuildBookingCatalogViews();
        if (bookingPanelMode) renderBookingAppointmentPanel();
        var createModal = document.querySelector('[data-booking-create-modal]');
        if (createModal && !createModal.hidden) populateBookingCreateForm();
      }).catch(function() {
        // Keep the salon catalog fallback when the JSON is unavailable in file-only previews.
      });
    }

    function renderLucideIcons() {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    function formatUsPhoneInput(value) {
      var raw = value || '';
      var digits = raw.replace(/\D/g, '');
      if (/^\s*\+1/.test(raw) && digits.charAt(0) === '1') {
        digits = digits.slice(1);
      }
      if (!digits) return '';
      if (digits.length <= 3) return '(' + digits;
      if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
      return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
    }

    function maskPhoneInput(input) {
      if (!input) return;
      input.value = formatUsPhoneInput(input.value);
    }

    function initPhoneMasks() {
      document.querySelectorAll('[data-phone-mask]').forEach(function(input) {
        maskPhoneInput(input);
        input.addEventListener('input', function() {
          maskPhoneInput(input);
        });
      });
    }

    renderLucideIcons();
    initPhoneMasks();
    function activateSubTab(target) {
      document.querySelectorAll('[data-subtab-target]').forEach(function(tab) {
        tab.classList.toggle('is-active', tab.dataset.subtabTarget === target);
      });

      document.querySelectorAll('[data-sub-panel]').forEach(function(panel) {
        panel.classList.toggle('is-active', panel.dataset.subPanel === target);
      });
    }

    function activateBookingSubTab(target) {
      document.querySelectorAll('[data-booking-subtab-target]').forEach(function(tab) {
        var isActive = tab.dataset.bookingSubtabTarget === target;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      document.querySelectorAll('[data-booking-sub-panel]').forEach(function(panel) {
        panel.classList.toggle('is-active', panel.dataset.bookingSubPanel === target);
      });
    }

    function updateBookingKpis() {
      var panel = document.getElementById('panel-booking');
      if (!panel) return;

      var items = Array.from(panel.querySelectorAll('[data-booking-item]')).filter(function(item) {
        return !item.hidden;
      });
      var todayCount = items.filter(function(item) {
        return item.dataset.bookingDate === BOOKING_TODAY_DATE;
      }).length;
      var done = items.filter(function(item) {
        return item.classList.contains('is-done');
      }).length;
      var noshow = items.filter(function(item) {
        return item.classList.contains('is-noshow');
      }).length;

      var todayEl = panel.querySelector('[data-booking-kpi="today"]');
      var doneEl = panel.querySelector('[data-booking-kpi="done"]');
      var noshowEl = panel.querySelector('[data-booking-kpi="noshow"]');

      if (todayEl) todayEl.textContent = todayCount;
      if (doneEl) doneEl.textContent = done;
      if (noshowEl) noshowEl.textContent = noshow;

      var emptyState = panel.querySelector('[data-booking-empty]');
      if (emptyState) emptyState.hidden = items.length > 0;

      updateBookingStatusChips();
    }

    function updateBookingStatusChips() {
      var subpanel = document.getElementById('booking-subpanel-today');
      if (!subpanel) return;

      var allItems = Array.from(subpanel.querySelectorAll('[data-booking-item]'));
      var counts = { all: allItems.length, 'new': 0, 'sms-sent': 0, 'done': 0, 'noshow': 0 };
      allItems.forEach(function(item) {
        Object.keys(BOOKING_STATUS_CLASS).forEach(function(key) {
          if (item.classList.contains(BOOKING_STATUS_CLASS[key])) counts[key]++;
        });
      });

      subpanel.querySelectorAll('[data-booking-status-count]').forEach(function(el) {
        var key = el.dataset.bookingStatusCount;
        if (counts[key] !== undefined) el.textContent = counts[key];
      });

      subpanel.querySelectorAll('[data-booking-status-chip]').forEach(function(chip) {
        var isActive = chip.dataset.bookingStatusChip === bookingStatusFilter;
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    function setBookingStatusFilter(status) {
      var isValid = status === 'all' || BOOKING_STATUS_CLASS[status];
      bookingStatusFilter = isValid ? status : 'all';
      filterBookingItems();
    }

    function setBookingFilterOpen(scope) {
      bookingFilterOpen = scope || null;

      document.querySelectorAll('[data-booking-filter-menu]').forEach(function(menu) {
        var isOpen = bookingFilterOpen && menu.dataset.bookingFilterMenu === bookingFilterOpen;
        menu.hidden = !isOpen;
      });

      document.querySelectorAll('[data-booking-filter-toggle]').forEach(function(toggle) {
        var isOpen = bookingFilterOpen && toggle.dataset.bookingFilterToggle === bookingFilterOpen;
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        toggle.classList.toggle('is-active', isOpen);
      });
    }

    function bookingCalendarPad(value) { return String(value).padStart(2, '0'); }

    function formatBookingCalendarDate(date) {
      return date.getFullYear() + '-' + bookingCalendarPad(date.getMonth() + 1) + '-' + bookingCalendarPad(date.getDate());
    }

    function formatBookingCalendarDateTime(date) {
      return formatBookingCalendarDate(date) + 'T' + bookingCalendarPad(date.getHours()) + ':' + bookingCalendarPad(date.getMinutes()) + ':00';
    }

    function parseBookingCalendarTime(label) {
      var match = String(label || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return '09:00';
      var hour = Number(match[1]) % 12;
      if (String(match[3]).toUpperCase() === 'PM') hour += 12;
      return String(hour).padStart(2, '0') + ':' + match[2];
    }

    function statusKeyFromItem(item) {
      if (item.classList.contains('is-sms-sent')) return 'sms-sent';
      if (item.classList.contains('is-done')) return 'done';
      if (item.classList.contains('is-noshow')) return 'noshow';
      return 'new';
    }

    function bookingRecordFromItem(item) {
      var services = Array.from(item.querySelectorAll('.booking-service-chip')).map(function(chip) {
        return chip.textContent.trim();
      }).filter(Boolean);
      var time = item.querySelector('.booking-time-main:not(.booking-callstart-main)');
      return {
        id: item.dataset.bookingId,
        name: item.dataset.bookingName,
        phone: item.dataset.bookingPhone,
        email: item.dataset.bookingEmail,
        services: services.length ? services : [item.dataset.bookingService],
        tech: item.dataset.bookingTech,
        date: item.dataset.bookingDate,
        time: time ? parseBookingCalendarTime(time.textContent) : '09:00',
        duration: Number(item.dataset.bookingDuration || bookingCalendarDurationMinutes(item)),
        status: statusKeyFromItem(item),
        note: item.dataset.bookingNote || '',
        source: getBookingSourceText(item)
      };
    }

    function bookingServiceDisplayName(value) {
      return String(value == null ? '' : value).replace(/^\s*[^\wÀ-ỹ]+/i, '').trim();
    }

    function bookingRecordServiceNames(record) {
      var names = Array.isArray(record.serviceNames) ? record.serviceNames.slice() : [];
      if (!names.length) names = (record.serviceIds || []).slice();
      return names.map(function(name, index) {
        var service = salonData.findService(catalog, (record.serviceIds || [])[index] || name);
        return bookingServiceDisplayName(service ? service.name : name);
      }).filter(Boolean);
    }

    function bookingRecordToRowData(record) {
      var start = new Date(record.startAt);
      var names = bookingRecordServiceNames(record);
      return {
        id: record.id,
        name: record.customerName,
        phone: record.phone,
        email: record.email,
        service: names.join(' '),
        services: names,
        tech: record.technicianId || 'unassigned',
        techName: record.technicianName || '',
        date: record.startAt.slice(0, 10),
        time: record.startAt.slice(11, 16),
        duration: record.durationMin,
        status: appointmentStore.mapCanonicalToBookingStatus(record),
        note: record.note || '',
        source: record.source || 'booking-book'
      };
    }

    var bookingPanelMode = null;
    var bookingPanelAppointmentId = null;
    var bookingPanelDraft = null;
    var bookingPanelTickets = [];
    var bookingPanelSelectedServiceId = '';
    var bookingPanelSelectedTechId = null;
    var bookingPanelSelectedTechName = 'Anyone';
    var bookingPanelServices = {};
    var bookingPanelExternalServices = [];
    var bookingPanelWarning = '';
    var bookingCreateTickets = [];
    var bookingCreateSelectedServiceId = '';
    var bookingCreateSelectedTechId = null;
    var bookingCreateSelectedTechName = 'Anyone';

    function bookingPanelRecordById(id) {
      return appointmentStore.loadAll(null, catalog).find(function(record) {
        return String(record.id) === String(id) && record.status !== 'cancelled';
      }) || null;
    }

    function bookingPanelServiceNames(record) {
      return bookingRecordServiceNames(record).map(function(name) {
        return String(name || '').trim();
      }).filter(Boolean);
    }

    function bookingPanelServiceOption(name) {
      var needle = String(name || '').trim().toLowerCase();
      return BOOKING_CALENDAR_SERVICE_OPTIONS.find(function(option) {
        return option.name.toLowerCase() === needle;
      }) || null;
    }

    function bookingPanelTicketCatalog() {
      return {
        services: BOOKING_CALENDAR_SERVICE_OPTIONS.map(function(option) {
          return { id: option.serviceId, name: option.name, price: option.price, durationMin: option.duration };
        }),
        technicians: BOOKING_CALENDAR_TECHNICIANS.map(function(id) {
          var technician = bookingTechByValue(id);
          return { id: id, name: technician ? technician.name : id };
        })
      };
    }

    function bookingPanelTicketRowsMarkup() {
      return bookingPanelTickets.map(function(ticket, index) {
        var price = ticket.price == null ? '—' : '$' + Number(ticket.price).toFixed(2).replace(/\.00$/, '');
        return '<div class="booking-ticket-row"><div class="booking-ticket-row-main"><strong>' + escapeHtml(ticket.serviceName || 'Service') + '</strong><span>' + escapeHtml(ticket.technicianName || 'Anyone') + '</span></div><div class="booking-ticket-row-meta">' + price + ' · ' + ticket.durationMin + ' min</div><button class="booking-ticket-remove" type="button" data-booking-panel-ticket-remove="' + index + '" aria-label="Remove ' + escapeHtml(ticket.serviceName || 'service') + '"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>';
      }).join('') || '<div class="booking-ticket-empty">Add one service and assign a technician. Anyone is used by default.</div>';
    }

    function bookingPanelTicketTotals() {
      return appointmentTicketUtils && appointmentTicketUtils.ticketTotals
        ? appointmentTicketUtils.ticketTotals(bookingPanelTickets)
        : { price: 0, duration: 0 };
    }

    function bookingPanelTicketPickerMarkup() {
      var services = BOOKING_CALENDAR_SERVICE_OPTIONS.map(function(option) {
        var price = option.price == null ? '—' : option.price;
        return '<button class="booking-service-chip-button" type="button" data-booking-panel-ticket-service="' + escapeHtml(option.serviceId) + '" data-service-name="' + escapeHtml(option.name) + '" data-category-name="' + escapeHtml(option.categoryName || 'Other services') + '"><span class="booking-service-option-name">' + escapeHtml(option.name) + '</span><span class="booking-service-option-meta">$' + price + ' · ' + option.duration + ' min</span></button>';
      }).join('');
      var technicians = '<button class="booking-ticket-option is-selected" type="button" data-booking-panel-ticket-tech="" data-tech-name="Anyone"><span>Anyone</span><span class="booking-service-option-meta">No technician assigned</span></button>' +
        BOOKING_CALENDAR_TECHNICIANS.map(function(id) {
          return '<button class="booking-ticket-option" type="button" data-booking-panel-ticket-tech="' + escapeHtml(id) + '" data-tech-name="' + escapeHtml(bookingTechName(id)) + '"><span>' + escapeHtml(bookingTechName(id)) + '</span></button>';
        }).join('');
      return '<div class="booking-ticket-builder-grid" data-booking-ticket-picker>' +
        '<div class="booking-ticket-field"><label>Service</label><div class="booking-service-search-shell"><i class="bi bi-search" aria-hidden="true"></i><input class="booking-service-search" type="search" placeholder="Search service..." aria-label="Search service" data-booking-service-search data-booking-panel-ticket-service-search autocomplete="off"><div class="booking-ticket-dropdown" data-booking-panel-ticket-service-results data-booking-service-category hidden>' + services + '<div class="booking-service-empty" data-booking-panel-ticket-empty hidden>No matching services found.</div></div></div></div>' +
        '<div class="booking-ticket-field"><label>Technician</label><div class="booking-service-search-shell"><i class="bi bi-person-badge" aria-hidden="true"></i><input class="booking-service-search" type="search" value="Anyone" placeholder="Search technician..." aria-label="Search technician" data-booking-panel-ticket-tech-search autocomplete="off"><div class="booking-ticket-dropdown" data-booking-panel-ticket-tech-results hidden>' + technicians + '</div></div></div>' +
        '<button class="booking-primary-button booking-ticket-add" type="button" data-booking-panel-ticket-add><i class="bi bi-plus-lg" aria-hidden="true"></i>Add</button></div>';
    }

    function filterBookingPanelTicketServices(input) {
      var picker = input && input.closest('[data-booking-ticket-picker]');
      if (!picker) return;
      var query = String(input.value || '').trim().toLowerCase();
      var count = 0;
      picker.querySelectorAll('[data-booking-panel-ticket-service]').forEach(function(button) {
        var haystack = (button.dataset.serviceName || '') + ' ' + (button.dataset.categoryName || '');
        var visible = !query || haystack.toLowerCase().indexOf(query) !== -1;
        button.hidden = !visible;
        if (visible) count++;
      });
      var empty = picker.querySelector('[data-booking-panel-ticket-empty]');
      var results = picker.querySelector('[data-booking-panel-ticket-service-results]');
      if (!query) {
        picker.querySelectorAll('[data-booking-panel-ticket-service]').forEach(function(button) { button.hidden = false; });
        if (empty) empty.hidden = true;
        if (results) results.hidden = true;
        return;
      }
      if (empty) empty.hidden = count !== 0;
      if (results) results.hidden = false;
    }

    function filterBookingPanelTicketTechs(input) {
      var picker = input && input.closest('[data-booking-ticket-picker]');
      var results = picker && picker.querySelector('[data-booking-panel-ticket-tech-results]');
      if (!results) return;
      var query = String(input.value || '').trim().toLowerCase();
      if (!query) {
        results.querySelectorAll('[data-booking-panel-ticket-tech]').forEach(function(button) { button.hidden = false; });
        results.hidden = true;
        return;
      }
      results.hidden = false;
      results.querySelectorAll('[data-booking-panel-ticket-tech]').forEach(function(button) {
        button.hidden = !query || String(button.dataset.techName || '').toLowerCase().indexOf(query) !== -1;
      });
    }

    function bookingPanelDraftFromRecord(record) {
      var start = record && record.startAt ? record.startAt : bookingCalendarDate + 'T10:00:00';
      var names = bookingPanelServiceNames(record || {});
      var rawTickets = record && Array.isArray(record.tickets) && record.tickets.length ? record.tickets : names.map(function(name, index) {
        var detail = record && record.serviceDetails ? record.serviceDetails[index] : {};
        return { id: 'ticket-' + (index + 1), serviceId: detail && detail.id, serviceName: name, price: detail && detail.price, durationMin: detail && detail.durationMin, technicianId: record && record.technicianId, technicianName: record && record.technicianName };
      });
      bookingPanelTickets = appointmentTicketUtils && appointmentTicketUtils.normalizeTickets
        ? appointmentTicketUtils.normalizeTickets(rawTickets, bookingPanelTicketCatalog())
        : rawTickets;
      bookingPanelSelectedServiceId = '';
      bookingPanelSelectedTechId = null;
      bookingPanelSelectedTechName = 'Anyone';
      bookingPanelServices = {};
      bookingPanelExternalServices = [];
      names.forEach(function(name) {
        var option = bookingPanelServiceOption(name);
        var displayName = bookingServiceDisplayName(name);
        if (option) bookingPanelServices[option.name] = 1;
        else if (displayName && bookingPanelExternalServices.indexOf(displayName) === -1) bookingPanelExternalServices.push(displayName);
      });
      return {
        name: record ? record.customerName : '',
        phone: record ? record.phone : '',
        tech: record && record.technicianId ? record.technicianId : 'unassigned',
        date: start.slice(0, 10),
        time: start.slice(11, 16),
        duration: record && record.durationMin ? record.durationMin : 60,
        status: record ? record.status : 'pending',
        note: record ? record.note : '',
        source: record ? record.source : 'booking-book'
      };
    }

    function bookingPanelSelectedServiceNames() {
      return BOOKING_CALENDAR_SERVICE_OPTIONS.filter(function(option) {
        return bookingPanelServices[option.name];
      }).map(function(option) { return option.name; }).concat(bookingPanelExternalServices);
    }

    function bookingPanelSelectedServiceTotals() {
      if (bookingPanelTickets.length) return bookingPanelTicketTotals();
      var services = bookingPanelSelectedServiceNames();
      return {
        price: bookingServicePriceTotal(services),
        duration: services.length ? bookingServiceDurationMinutes(services) : 0
      };
    }

    function bookingPanelField(name) {
      return document.querySelector('[data-booking-panel-field="' + name + '"]');
    }

    function bookingPanelSelectedServiceDuration() {
      if (bookingPanelTickets.length) return bookingPanelTicketTotals().duration || 60;
      var services = bookingPanelSelectedServiceNames();
      if (!services.length) return Number(bookingPanelDraft && bookingPanelDraft.duration) || 60;
      return bookingServiceDurationMinutes(services) || 60;
    }

    function bookingServicePickerCategories() {
      var categories = [];
      BOOKING_CALENDAR_SERVICE_OPTIONS.forEach(function(option) {
        var category = categories.find(function(item) { return item.id === option.categoryId; });
        if (!category) {
          category = { id: option.categoryId, name: option.categoryName || 'Other services', services: [] };
          categories.push(category);
        }
        category.services.push(option);
      });
      return categories;
    }

    function bookingServicePickerMarkup(mode, selectedNames) {
      var selected = {};
      (selectedNames || []).forEach(function(name) { selected[String(name).toLowerCase()] = true; });
      var categories = bookingServicePickerCategories();
      var buttons = categories.map(function(category) {
        var serviceButtons = category.services.map(function(option) {
          var isSelected = Boolean(selected[option.name.toLowerCase()]);
          var price = option.price == null ? '—' : option.price;
          var buttonAttributes = mode === 'create'
            ? 'data-booking-create-service="' + escapeHtml(option.name) + '"'
            : 'data-booking-panel-select="service" data-service-name="' + escapeHtml(option.name) + '"';
          return '<button class="booking-service-chip-button' + (isSelected ? ' is-selected' : '') + '" type="button" ' + buttonAttributes + ' data-service-category="' + escapeHtml(category.name) + '" aria-pressed="' + (isSelected ? 'true' : 'false') + '">' +
            '<span class="booking-service-option-name">' + escapeHtml(option.name) + '</span><span class="booking-service-option-meta">$' + price + ' · ' + option.duration + ' min</span></button>';
        }).join('');
        var categoryOpen = category.services.some(function(option) { return selected[option.name.toLowerCase()]; });
        return '<details class="booking-service-category" data-booking-service-category data-category-name="' + escapeHtml(category.name) + '"' + (categoryOpen ? ' open' : '') + '>' +
          '<summary class="booking-service-category-head"><span class="booking-service-category-name">' + escapeHtml(category.name) + '</span><span class="booking-service-category-count">' + category.services.length + '</span></summary>' +
          '<div class="booking-service-category-options">' + serviceButtons + '</div></details>';
      }).join('');
      return '<div class="booking-service-picker" data-booking-service-picker data-booking-service-picker-mode="' + mode + '">' +
        '<div class="booking-service-search-shell"><i class="bi bi-search" aria-hidden="true"></i><input class="booking-service-search" type="search" placeholder="Search services..." aria-label="Search services" data-booking-service-search></div>' +
        '<div class="booking-service-categories" data-booking-service-results>' + buttons + '<div class="booking-service-empty" data-booking-service-empty hidden>No matching services found.</div></div></div>';
    }

    function filterBookingServicePicker(input) {
      var picker = input && input.closest('[data-booking-service-picker]');
      if (!picker) return;
      var query = String(input.value || '').trim().toLowerCase();
      var visibleCount = 0;
      picker.querySelectorAll('[data-booking-service-category]').forEach(function(category) {
        var categoryName = String(category.dataset.categoryName || '').toLowerCase();
        var categoryVisible = 0;
        category.querySelectorAll('[data-booking-create-service], [data-booking-panel-select="service"]').forEach(function(button) {
          var haystack = (button.dataset.serviceName || button.dataset.bookingCreateService || '') + ' ' + categoryName;
          var visible = !query || haystack.toLowerCase().indexOf(query) !== -1;
          button.hidden = !visible;
          if (visible) categoryVisible++;
        });
        category.hidden = categoryVisible === 0;
        if (query && categoryVisible) category.open = true;
        visibleCount += categoryVisible;
      });
      var empty = picker.querySelector('[data-booking-service-empty]');
      if (empty) empty.hidden = visibleCount !== 0;
    }

    function bookingPanelSyncDraft() {
      if (!bookingPanelDraft) return;
      var value = function(name) {
        var field = bookingPanelField(name);
        return field ? field.value : '';
      };
      bookingPanelDraft.name = value('name').trim();
      bookingPanelDraft.phone = value('phone').trim();
      bookingPanelDraft.tech = 'unassigned';
      bookingPanelDraft.date = value('date');
      bookingPanelDraft.time = value('time');
      bookingPanelDraft.duration = bookingPanelSelectedServiceDuration();
      bookingPanelDraft.status = value('status') || 'pending';
      bookingPanelDraft.note = value('note').trim();
    }

    function renderBookingAppointmentPanel() {
      var host = document.querySelector('[data-booking-appointment-panel]');
      if (!host) return;
      if (!bookingPanelMode || !bookingPanelDraft) {
        host.innerHTML = '<div data-booking-panel-state="empty">' +
          '<i class="bi bi-calendar2-week" aria-hidden="true"></i>' +
          '<strong>Select an appointment</strong>' +
          '<span>Click an event to edit it, or select a time in a technician column to create a booking.<br><br>Drag events to reschedule · drag an edge to change duration</span>' +
          '</div>';
        return;
      }

      var editing = bookingPanelMode === 'edit';
      bookingPanelDraft.duration = bookingPanelSelectedServiceDuration();
      var panelServiceTotals = bookingPanelSelectedServiceTotals();
      var ticketPicker = bookingPanelTicketPickerMarkup();
      var statusOptions = [
        { id: 'pending', label: 'Pending' },
        { id: 'confirmed', label: 'Confirmed' },
        { id: 'checked-in', label: 'Checked in' },
        { id: 'completed', label: 'Completed' },
        { id: 'no-show', label: 'No show' }
      ].map(function(status) {
        return '<option value="' + status.id + '"' + (bookingPanelDraft.status === status.id ? ' selected' : '') + '>' + status.label + '</option>';
      }).join('');
      var meta = editing ? '<div class="booking-panel-meta">' +
        '<span class="booking-panel-meta-item"><span class="booking-panel-meta-label">Status:</span><strong class="booking-panel-chip booking-panel-chip-status">' + escapeHtml(bookingCalendarStatusLabel(bookingPanelDraft.status)) + '</strong></span>' +
        '<span class="booking-panel-meta-item"><span class="booking-panel-meta-label">Nguồn:</span><span class="booking-source-list booking-panel-source-list">' + bookingSourceBadgesFromText(bookingPanelDraft.source || 'booking-book') + '</span></span>' +
        '</div>' : '';
      host.innerHTML = '<div data-booking-panel-state="' + (editing ? 'edit' : 'new') + '" data-booking-panel-select>' +
        '<div class="booking-panel-head"><div><div class="booking-panel-title"><i class="bi ' + (editing ? 'bi-card-text' : 'bi-calendar-plus') + ' booking-panel-title-icon" aria-hidden="true"></i><span>' + (editing ? 'Appointment details' : 'New appointment') + '</span></div>' + meta + '</div></div>' +
        '<div class="booking-panel-form">' +
        '<label class="booking-create-field"><span class="booking-create-label">Customer</span><input class="booking-input" type="text" maxlength="60" data-booking-panel-field="name" value="' + escapeHtml(bookingPanelDraft.name) + '"></label>' +
        '<label class="booking-create-field"><span class="booking-create-label">Phone</span><input class="booking-input" type="tel" maxlength="20" data-booking-panel-field="phone" value="' + escapeHtml(bookingPanelDraft.phone) + '"></label>' +
        '<div class="booking-create-field booking-panel-field-full"><span class="booking-create-label">Service — Technician</span>' + ticketPicker + '<div class="booking-ticket-list" data-booking-panel-ticket-list>' + bookingPanelTicketRowsMarkup() + '</div><div class="appointment-service-summary" aria-live="polite"><span class="appointment-service-summary-item"><span class="appointment-service-summary-label">Total price:</span> <strong class="appointment-service-summary-value" data-booking-panel-total-price>$' + panelServiceTotals.price + '</strong></span><span class="appointment-service-summary-item"><span class="appointment-service-summary-label">Total time:</span> <strong class="appointment-service-summary-value" data-booking-panel-total-duration>' + panelServiceTotals.duration + ' min</strong></span></div></div>' +
        '<div class="booking-panel-form-grid"><label class="booking-create-field"><span class="booking-create-label">Date</span><input class="booking-input" type="date" data-booking-panel-field="date" value="' + escapeHtml(bookingPanelDraft.date) + '"></label>' +
        '<label class="booking-create-field"><span class="booking-create-label">Time</span><input class="booking-input" type="time" step="900" data-booking-panel-field="time" value="' + escapeHtml(bookingPanelDraft.time) + '"></label></div>' +
        '<label class="booking-create-field booking-panel-field-full"><span class="booking-create-label">Status</span><select class="booking-select" data-booking-panel-field="status">' + statusOptions + '</select></label>' +
        '<label class="booking-create-field"><span class="booking-create-label">Note</span><textarea class="booking-input" maxlength="240" data-booking-panel-field="note">' + escapeHtml(bookingPanelDraft.note || '') + '</textarea></label>' +
        '<div class="booking-create-error" data-booking-panel-warning role="alert" aria-live="polite">' + escapeHtml(bookingPanelWarning) + '</div>' +
        '<button class="booking-primary-button" type="button" data-booking-panel-action="save" style="width:100%;justify-content:center"><i class="bi bi-check-lg" aria-hidden="true"></i>Save appointment</button>' +
        (editing ? '<div class="booking-panel-actions" data-booking-panel-action-group="operational">' +
        '<button class="booking-mini-button booking-sms-action" type="button" data-booking-panel-action="send-sms"><i class="bi bi-send" aria-hidden="true"></i>Send SMS</button>' +
        '<button class="booking-mini-button primary booking-done-action" type="button" data-booking-panel-action="done"><i class="bi bi-check-lg" aria-hidden="true"></i>Done</button>' +
        '<button class="booking-mini-button booking-noshow-action" type="button" data-booking-panel-action="noshow"><i class="bi bi-x-lg" aria-hidden="true"></i>No-show</button></div>' : '') +
        (editing ? '<div class="booking-panel-destructive" data-booking-panel-action-group="destructive"><button class="booking-secondary-button booking-panel-cancel-button" type="button" data-booking-panel-action="cancel"><i class="bi bi-trash" aria-hidden="true"></i>Cancel this appointment</button></div>' : '') +
        '<div class="booking-panel-close" data-booking-panel-action-group="close"><button class="booking-secondary-button" type="button" data-booking-panel-action="close">Close</button></div>' +
        '</div></div>';
    }

    function openBookingAppointmentPanel(item) {
      if (!item) return;
      var record = bookingPanelRecordById(item.dataset.bookingId);
      if (!record) return;
      bookingPanelAppointmentId = record.id;
      bookingPanelMode = 'edit';
      bookingPanelWarning = '';
      bookingPanelDraft = bookingPanelDraftFromRecord(record);
      renderBookingAppointmentPanel();
    }

    function openBookingAppointmentPanelForNew(start, end, tech) {
      var startDate = start instanceof Date && Number.isFinite(start.getTime()) ? new Date(start) : new Date(bookingCalendarDate + 'T10:00:00');
      var endDate = end instanceof Date && Number.isFinite(end.getTime()) ? new Date(end) : new Date(startDate.getTime() + 60 * 60000);
      bookingPanelAppointmentId = null;
      bookingPanelMode = 'new';
      bookingPanelWarning = '';
      bookingPanelTickets = [];
      bookingPanelSelectedServiceId = '';
      bookingPanelSelectedTechId = null;
      bookingPanelSelectedTechName = 'Anyone';
      bookingPanelServices = {};
      bookingPanelExternalServices = [];
      bookingPanelDraft = {
        name: '', phone: '', tech: bookingCalendarResourceTech(tech), date: bookingCalendarInputDate(startDate),
        time: bookingCalendarInputTime(startDate), duration: Math.max(15, Math.round((endDate - startDate) / 60000)),
        status: 'confirmed', note: '', source: 'manual-add'
      };
      renderBookingAppointmentPanel();
    }

    function closeBookingAppointmentPanel() {
      bookingPanelMode = null;
      bookingPanelAppointmentId = null;
      bookingPanelDraft = null;
      bookingPanelWarning = '';
      if (bookingTeamCalendar) bookingTeamCalendar.clearSelection();
      renderBookingAppointmentPanel();
    }

    function bookingPanelSetWarning(message) {
      bookingPanelWarning = message || '';
      renderBookingAppointmentPanel();
    }

    function bookingPanelRefreshAfterWrite(record) {
      if (record && record.status !== 'cancelled') {
        bookingPanelAppointmentId = record.id;
        bookingPanelMode = 'edit';
        bookingPanelDraft = bookingPanelDraftFromRecord(record);
      }
      renderBookingStoreRows();
      filterBookingItems();
      renderBookingCalendar();
    }

    function bookingPanelCanonicalPayload() {
      bookingPanelSyncDraft();
      var services = bookingPanelTickets.map(function(ticket) { return ticket.serviceName; });
      if (!bookingPanelDraft.phone) return { error: 'Enter the phone number.' };
      if (!bookingPanelDraft.name) return { error: 'Enter the customer name.' };
      if (!bookingPanelTickets.length) return { error: 'Add at least one service.' };
      if (!bookingPanelDraft.date || !bookingPanelDraft.time) return { error: 'Pick a valid date and start time.' };

      var start = new Date(bookingPanelDraft.date + 'T' + bookingPanelDraft.time + ':00');
      if (!Number.isFinite(start.getTime())) return { error: 'Pick a valid date and start time.' };
      var scheduledTickets = appointmentTicketUtils && appointmentTicketUtils.scheduleTickets
        ? appointmentTicketUtils.scheduleTickets(bookingPanelTickets, formatBookingCalendarDateTime(start))
        : bookingPanelTickets;
      var end = new Date(start.getTime() + (bookingPanelDraft.duration || 60) * 60000);
      scheduledTickets.forEach(function(ticket) { var ticketEnd = new Date(ticket.endAt); if (ticketEnd > end) end = ticketEnd; });
      var startAt = formatBookingCalendarDateTime(start);
      var endAt = formatBookingCalendarDateTime(end);
      var conflict = scheduledTickets.some(function(ticket) {
        return ticket.technicianId && appointmentStore.hasConflict(appointmentStore.loadAll(null, catalog), { technicianId: ticket.technicianId, startAt: ticket.startAt, endAt: ticket.endAt }, bookingPanelAppointmentId);
      });
      if (conflict) {
        return { error: 'A technician already has an overlapping ticket. Change the time or technician.' };
      }

      var status = appointmentStore.mapBookingStatus(bookingPanelDraft.status);
      var parentTechId = appointmentTicketUtils && appointmentTicketUtils.parentTechnicianId ? appointmentTicketUtils.parentTechnicianId(scheduledTickets) : null;
      var existing = bookingPanelAppointmentId ? bookingPanelRecordById(bookingPanelAppointmentId) : null;
      return {
        payload: {
          id: existing ? existing.id : 'booking-frontdesk-' + Date.now(),
          customerName: bookingPanelDraft.name,
          phone: bookingPanelDraft.phone,
          serviceIds: scheduledTickets.map(function(ticket) { return ticket.serviceId; }),
          serviceNames: services,
          serviceDetails: scheduledTickets.map(function(ticket) { return { id: ticket.serviceId, name: ticket.serviceName, price: ticket.price, durationMin: ticket.durationMin, icon: '✨' }; }),
          tickets: scheduledTickets,
          technicianId: parentTechId,
          technicianName: parentTechId ? bookingTechName(parentTechId) : '',
          startAt: startAt,
          endAt: endAt,
          durationMin: Math.max(15, Math.round((end - start) / 60000)),
          status: status.status,
          smsStatus: status.smsStatus,
          source: existing ? existing.source : 'manual-add',
          note: bookingPanelDraft.note,
          metadata: existing ? existing.metadata : {}
        }
      };
    }

    function saveBookingAppointmentPanel() {
      var prepared = bookingPanelCanonicalPayload();
      if (prepared.error) { bookingPanelSetWarning(prepared.error); return; }
      var result = bookingPanelMode === 'edit'
        ? appointmentStore.update(bookingPanelAppointmentId, prepared.payload, null, catalog)
        : appointmentStore.create(prepared.payload, null, catalog);
      if (!result.ok) { bookingPanelSetWarning(result.error.message); return; }
      bookingCalendarDate = prepared.payload.startAt.slice(0, 10);
      bookingPanelWarning = '';
      bookingPanelRefreshAfterWrite(result.record);
    }

    function setBookingPanelStatus(status) {
      if (!bookingPanelAppointmentId) return;
      var result = appointmentStore.update(bookingPanelAppointmentId, appointmentStore.mapBookingStatus(status), null, catalog);
      if (!result.ok) { bookingPanelSetWarning(result.error.message); return; }
      bookingPanelWarning = '';
      bookingPanelRefreshAfterWrite(result.record);
    }

    function sendBookingPanelSms() {
      if (!bookingPanelAppointmentId) return;
      var result = appointmentStore.update(bookingPanelAppointmentId, { smsStatus: 'sent' }, null, catalog);
      if (!result.ok) { bookingPanelSetWarning(result.error.message); return; }
      bookingPanelWarning = '';
      bookingPanelRefreshAfterWrite(result.record);
    }

    function cancelBookingPanelAppointment() {
      if (!bookingPanelAppointmentId) return;
      var record = bookingPanelRecordById(bookingPanelAppointmentId);
      if (!record) { closeBookingAppointmentPanel(); return; }
      var confirmPromise = window.Swal
        ? Swal.fire({ icon: 'warning', title: 'Cancel ' + record.customerName + "'s appointment?", text: 'The appointment will be removed from active views.', showCancelButton: true, confirmButtonText: 'Confirm', cancelButtonText: 'Cancel' }).then(function(result) { return result.isConfirmed; })
        : Promise.resolve(window.confirm('Cancel ' + record.customerName + "'s appointment?"));
      confirmPromise.then(function(confirmed) {
        if (!confirmed) return;
        var result = appointmentStore.cancel(record.id, null, catalog);
        if (!result.ok) { bookingPanelSetWarning(result.error.message); return; }
        closeBookingAppointmentPanel();
        renderBookingStoreRows();
        filterBookingItems();
        renderBookingCalendar();
      });
    }

    function renderBookingStoreRows() {
      var tbody = document.querySelector('[data-booking-table] tbody');
      if (!tbody) return;
      var records = appointmentStore.loadAll(null, catalog).filter(function(record) {
        return record.status !== 'cancelled' && record.startAt && record.endAt;
      }).sort(function(a, b) { return String(a.startAt).localeCompare(String(b.startAt)); });
      tbody.innerHTML = records.map(function(record) {
        return createBookingTableRow(bookingRecordToRowData(record));
      }).join('');
      tbody.querySelectorAll('[data-booking-item]').forEach(function(item) {
        var actions = item.querySelector('.booking-actions');
        if (actions) actions.innerHTML = renderBookingActionButtons(item);
        item.classList.toggle('is-panel-selected', String(item.dataset.bookingId) === String(bookingPanelAppointmentId));
      });
      renderBookingAppointmentPanel();
    }

    function bookingCalendarRows() {
      var panel = document.getElementById('booking-subpanel-today');
      return panel ? Array.from(panel.querySelectorAll('[data-booking-item]')) : [];
    }

    function bookingCalendarColumns() {
      var columns = [];
      BOOKING_CALENDAR_TECHNICIANS.forEach(function(tech) {
        columns.push({ id: tech, name: bookingTechName(tech), toolTip: bookingTechName(tech) });
      });
      columns.push({ id: 'unassigned', name: 'Anyone', toolTip: 'Unassigned appointment' });
      return columns;
    }

    function bookingCalendarResourceTech(resource) {
      var value = String(resource || '').trim();
      return !value || value.toLowerCase() === 'unassigned' || value.toLowerCase() === 'anyone' ? 'unassigned' : value;
    }

    function bookingCalendarColor(tech, columns) {
      return BOOKING_CALENDAR_COLORS[tech] || BOOKING_CALENDAR_COLORS.unassigned;
    }

    function bookingCalendarAppointmentStart(item) {
      var blocks = item.querySelectorAll('.booking-time-block');
      var appointmentBlock = blocks.length > 1 ? blocks[1] : blocks[0];
      var rawTime = appointmentBlock ? (appointmentBlock.querySelector('.booking-time-main') || {}).textContent || '' : '';
      var match = rawTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      var hour = 9, minute = 0;
      if (match) {
        hour = +match[1] % 12;
        if (String(match[3]).toUpperCase() === 'PM') hour += 12;
        minute = +match[2];
      }
      return (item.dataset.bookingDate || BOOKING_TODAY_DATE) + 'T' + bookingCalendarPad(hour) + ':' + bookingCalendarPad(minute) + ':00';
    }

    function bookingCalendarDurationMinutes(item) {
      var service = (item.dataset.bookingService || '').trim();
      return +(item.dataset.bookingDuration || BOOKING_CALENDAR_SERVICE_DURATIONS[service] || 60);
    }

    function bookingCalendarServiceSummary(record) {
      var details = record && Array.isArray(record.serviceDetails) ? record.serviceDetails : [];
      if (!details.length && record) {
        details = bookingRecordServiceNames(record).map(function(name) {
          var service = salonData.findService(catalog, name);
          return service ? { name: service.name, price: service.price, durationMin: service.durationMin } : { name: name };
        });
      }
      return details.map(function(detail) {
        var price = detail.price == null ? '' : ' · $' + Number(detail.price).toFixed(2).replace(/\.00$/, '');
        var duration = detail.durationMin ? ' · ' + detail.durationMin + ' min' : '';
        return bookingServiceDisplayName(detail.name || 'Service') + price + duration;
      }).join(' + ') || 'Service to confirm';
    }

    function bookingCalendarStatusLabel(status) {
      return {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'checked-in': 'Checked in',
        'completed': 'Completed',
        'no-show': 'No show',
        'cancelled': 'Cancelled',
        'new': 'Pending',
        'sms-sent': 'Pending',
        'done': 'Completed',
        'noshow': 'No show'
      }[status] || 'Pending';
    }

    function bookingCalendarSourceLabel(source) {
      var raw = String(source || '').trim();
      var normalized = raw.toLowerCase().replace(/[_-]+/g, ' ');
      return {
        'booking book': 'Booking Hub',
        'manual add': 'Manual add',
        'front desk': 'Front desk',
        'online': 'Online',
        'mobile app': 'Mobile app',
        'phone': 'Phone',
        'walk in request': 'Walk-in',
        'landing page': 'Landing Page',
        'voice': 'Voice',
        'sms': 'SMS',
        'qr': 'QR'
      }[normalized] || raw || 'Front desk';
    }

    function bookingSourceBadgesFromText(source) {
      var parts = String(source || '').split(/\s*[·|,]\s*/).map(function(part) {
        return part.trim();
      }).filter(Boolean);
      if (!parts.length) parts = ['front desk'];
      var sourceClasses = {
        'voice': 'booking-source-voice',
        'landing page': 'booking-source-lp',
        'sms': 'booking-source-sms',
        'qr': 'booking-source-qr',
        'manual add': 'booking-source-manual',
        'request': 'badge-warning'
      };
      return parts.map(function(part) {
        var normalized = part.toLowerCase().replace(/[_-]+/g, ' ');
        var label = bookingCalendarSourceLabel(part);
        var className = sourceClasses[normalized] || 'badge-soft';
        return '<span class="badge ' + className + '">' + escapeHtml(label) + '</span>';
      }).join(' ');
    }

    function bookingCalendarEnd(start, minutes) {
      var end = new Date(start);
      end.setMinutes(end.getMinutes() + minutes);
      return formatBookingCalendarDateTime(end);
    }

    function bookingCalendarEvent(item, columns, ticket) {
      var booking = bookingPanelRecordById(item.dataset.bookingId) || {
        customerName: item.dataset.bookingName || 'Guest',
        phone: item.dataset.bookingPhone || '',
        source: item.dataset.bookingSource || 'booking-book',
        note: item.dataset.bookingNote || '',
        technicianName: bookingCalendarTechLabel(item.dataset.bookingTech),
        serviceNames: [getBookingServiceText(item)]
      };
      var tech = bookingCalendarResourceTech(ticket ? ticket.technicianId : item.dataset.bookingTech);
      var color = bookingCalendarColor(tech, columns);
      var start = ticket && ticket.startAt ? ticket.startAt : bookingCalendarAppointmentStart(item);
      var minutes = ticket && ticket.durationMin ? Number(ticket.durationMin) : bookingCalendarDurationMinutes(item);
      var service = ticket ? bookingCalendarServiceSummary({ serviceDetails: [{ name: ticket.serviceName, price: ticket.price, durationMin: ticket.durationMin }] }) : bookingCalendarServiceSummary(booking);
      var status = booking.status || getBookingStatusText(item);
      var source = bookingCalendarSourceLabel(booking.source || item.dataset.bookingSource || 'booking-book');
      var phone = booking.phone || item.dataset.bookingPhone || '';
      var note = booking.note || item.dataset.bookingNote || '';
      var techLabel = ticket ? (ticket.technicianName || bookingCalendarTechLabel(tech)) : (booking.technicianName || bookingCalendarTechLabel(tech));
      var dateLabel = bookingCalendarDisplayDate(new Date(start));
      var timeLabel = bookingCalendarDisplayTime(new Date(start));
      var tooltip = [
        booking.customerName || item.dataset.bookingName || 'Guest',
        phone ? 'Phone: ' + phone : '',
        service,
        'Tech: ' + techLabel,
        'Date: ' + dateLabel,
        'Time: ' + timeLabel,
        'Duration: ' + minutes + ' min',
        'Status: ' + bookingCalendarStatusLabel(status),
        'Nguồn: ' + source,
        note ? 'Note: ' + note : ''
      ].filter(Boolean).join(' · ');
      return {
        id: item.dataset.bookingId + '::' + (ticket ? ticket.id : 'ticket-1'),
        orderId: item.dataset.bookingId,
        ticketId: ticket ? ticket.id : 'ticket-1',
        text: booking.customerName || item.dataset.bookingName || 'Guest',
        start: start,
        end: bookingCalendarEnd(start, minutes),
        resource: tech,
        backColor: color.bg,
        borderColor: color.border,
        barColor: color.border,
        fontColor: color.text,
        borderRadius: 8,
        padding: 7,
        cssClass: 'booking-calendar-event',
        html: '<div class="booking-calendar-event"><div class="booking-calendar-event-name">' + escapeHtml(booking.customerName || item.dataset.bookingName || 'Guest') + '</div>' +
          '<div class="booking-calendar-event-service">' + escapeHtml(service) + '</div>' +
          '<div class="booking-calendar-event-meta">' + escapeHtml(bookingCalendarStatusLabel(status)) + ' · ' + escapeHtml(source) + '</div></div>',
        toolTip: tooltip
      };
    }

    function updateBookingCalendarDateLabel() {
      var label = document.querySelector('[data-booking-calendar-date]');
      if (!label) return;
      label.textContent = new Date(bookingCalendarDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    function renderBookingCalendar() {
      if (!bookingTeamCalendar) return;
      var rows = bookingCalendarRows();
      var columns = bookingCalendarColumns(rows);
      var events = [];
      rows.filter(function(item) {
        return !item.hidden && item.dataset.bookingDate === bookingCalendarDate;
      }).forEach(function(item) {
        var record = bookingPanelRecordById(item.dataset.bookingId);
        var tickets = record && Array.isArray(record.tickets) && record.tickets.length ? record.tickets : [null];
        tickets.forEach(function(ticket) {
          if (ticket && String(ticket.startAt || '').slice(0, 10) !== bookingCalendarDate) return;
          events.push(bookingCalendarEvent(item, columns, ticket));
        });
      });
      bookingTeamCalendar.update({ startDate: bookingCalendarDate, columns: columns, events: events });
      updateBookingCalendarDateLabel();
    }

    function bookingCalendarDayPilotTime(value) {
      if (value && value.toStringSortable) return value.toStringSortable();
      if (value && value.toString) return value.toString('yyyy-MM-ddTHH:mm:ss');
      return String(value || '');
    }

    function bookingCalendarInputDate(date) {
      return formatBookingCalendarDate(date);
    }

    function bookingCalendarInputTime(date) {
      return bookingCalendarPad(date.getHours()) + ':' + bookingCalendarPad(date.getMinutes());
    }

    function bookingCalendarDisplayTime(date) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    function bookingCalendarDisplayDate(date) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function bookingCalendarDurationLabel(minutes) {
      var hours = Math.floor(minutes / 60);
      var rest = minutes % 60;
      return hours + ':' + bookingCalendarPad(rest);
    }

    function bookingCreateField(name) {
      return document.querySelector('[data-booking-create-field="' + name + '"]');
    }

    function setBookingCreateError(message) {
      var error = document.querySelector('[data-booking-create-error]');
      if (error) error.textContent = message || '';
    }

    function setBookingCreateServiceSelected(button, selected) {
      if (!button) return;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    }

    function bookingCreateTicketMarkup() {
      var services = BOOKING_CALENDAR_SERVICE_OPTIONS.map(function(option) {
        var price = option.price == null ? '—' : option.price;
        return '<button class="booking-service-chip-button" type="button" data-booking-create-ticket-service="' + escapeHtml(option.serviceId) + '" data-service-name="' + escapeHtml(option.name) + '" data-category-name="' + escapeHtml(option.categoryName || 'Other services') + '"><span class="booking-service-option-name">' + escapeHtml(option.name) + '</span><span class="booking-service-option-meta">$' + price + ' · ' + option.duration + ' min</span></button>';
      }).join('');
      var technicians = '<button class="booking-ticket-option is-selected" type="button" data-booking-create-ticket-tech="" data-tech-name="Anyone"><span>Anyone</span><span class="booking-service-option-meta">No technician assigned</span></button>' + BOOKING_CALENDAR_TECHNICIANS.map(function(id) {
        return '<button class="booking-ticket-option" type="button" data-booking-create-ticket-tech="' + escapeHtml(id) + '" data-tech-name="' + escapeHtml(bookingTechName(id)) + '"><span>' + escapeHtml(bookingTechName(id)) + '</span></button>';
      }).join('');
      var rows = bookingCreateTickets.map(function(ticket, index) {
        var price = ticket.price == null ? '—' : '$' + Number(ticket.price).toFixed(2).replace(/\.00$/, '');
        return '<div class="booking-ticket-row"><div class="booking-ticket-row-main"><strong>' + escapeHtml(ticket.serviceName) + '</strong><span>' + escapeHtml(ticket.technicianName || 'Anyone') + '</span></div><div class="booking-ticket-row-meta">' + price + ' · ' + ticket.durationMin + ' min</div><button class="booking-ticket-remove" type="button" data-booking-create-ticket-remove="' + index + '" aria-label="Remove service"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>';
      }).join('') || '<div class="booking-ticket-empty">Add one service and assign a technician. Anyone is used by default.</div>';
      return '<div class="booking-ticket-builder-grid" data-booking-create-ticket-picker>' +
        '<div class="booking-ticket-field"><label>Service</label><div class="booking-service-search-shell"><i class="bi bi-search" aria-hidden="true"></i><input class="booking-service-search" type="search" placeholder="Search service..." data-booking-create-ticket-service-search autocomplete="off"><div class="booking-ticket-dropdown" data-booking-create-ticket-service-results data-booking-service-category hidden>' + services + '<div class="booking-service-empty" data-booking-create-ticket-empty hidden>No matching services found.</div></div></div></div>' +
        '<div class="booking-ticket-field"><label>Technician</label><div class="booking-service-search-shell"><i class="bi bi-person-badge" aria-hidden="true"></i><input class="booking-service-search" type="search" value="Anyone" placeholder="Search technician..." data-booking-create-ticket-tech-search autocomplete="off"><div class="booking-ticket-dropdown" data-booking-create-ticket-tech-results hidden>' + technicians + '</div></div></div>' +
        '<button class="booking-primary-button booking-ticket-add" type="button" data-booking-create-ticket-add><i class="bi bi-plus-lg" aria-hidden="true"></i>Add</button></div>' +
        '<div class="booking-ticket-list" data-booking-create-ticket-list>' + rows + '</div>';
    }

    function renderBookingCreateTicketPicker() {
      var host = document.querySelector('[data-booking-create-ticket-host]');
      if (host) host.innerHTML = bookingCreateTicketMarkup();
      var totals = appointmentTicketUtils && appointmentTicketUtils.ticketTotals ? appointmentTicketUtils.ticketTotals(bookingCreateTickets) : { price: 0, duration: 0 };
      var price = document.querySelector('[data-booking-create-total-price]');
      var duration = document.querySelector('[data-booking-create-total-duration]');
      if (price) price.textContent = '$' + totals.price;
      if (duration) duration.textContent = totals.duration + ' min';
    }

    function filterBookingCreateTicketServices(input) {
      var picker = input && input.closest('[data-booking-create-ticket-picker]');
      if (!picker) return;
      var query = String(input.value || '').trim().toLowerCase();
      var count = 0;
      picker.querySelectorAll('[data-booking-create-ticket-service]').forEach(function(button) {
        var visible = !query || ((button.dataset.serviceName || '') + ' ' + (button.dataset.categoryName || '')).toLowerCase().indexOf(query) !== -1;
        button.hidden = !visible;
        if (visible) count++;
      });
      var empty = picker.querySelector('[data-booking-create-ticket-empty]');
      var results = picker.querySelector('[data-booking-create-ticket-service-results]');
      if (!query) {
        picker.querySelectorAll('[data-booking-create-ticket-service]').forEach(function(button) { button.hidden = false; });
        if (empty) empty.hidden = true;
        if (results) results.hidden = true;
        return;
      }
      if (empty) empty.hidden = count !== 0;
      if (results) results.hidden = false;
    }

    function filterBookingCreateTicketTechs(input) {
      var picker = input && input.closest('[data-booking-create-ticket-picker]');
      var results = picker && picker.querySelector('[data-booking-create-ticket-tech-results]');
      if (!results) return;
      var query = String(input.value || '').trim().toLowerCase();
      if (!query) {
        results.querySelectorAll('[data-booking-create-ticket-tech]').forEach(function(button) { button.hidden = false; });
        results.hidden = true;
        return;
      }
      results.hidden = false;
      results.querySelectorAll('[data-booking-create-ticket-tech]').forEach(function(button) {
        button.hidden = !query || String(button.dataset.techName || '').toLowerCase().indexOf(query) !== -1;
      });
    }

    function getBookingCreateServices() {
      if (bookingCreateTickets.length) return bookingCreateTickets.map(function(ticket) { return ticket.serviceName; });
      var field = bookingCreateField('service');
      if (!field) return [];

      return Array.from(field.querySelectorAll('[data-booking-create-service].is-selected')).map(function(button) {
        return button.dataset.bookingCreateService || '';
      }).filter(Boolean);
    }

    function bookingServiceDurationMinutes(services) {
      return (services || []).reduce(function(total, serviceName) {
        var option = BOOKING_CALENDAR_SERVICE_OPTIONS.find(function(service) {
          return service.name === serviceName;
        });
        var duration = option ? +option.duration : +(BOOKING_CALENDAR_SERVICE_DURATIONS[serviceName] || 0);
        return total + (duration || 60);
      }, 0);
    }

    function bookingServicePriceTotal(services) {
      return (services || []).reduce(function(total, serviceName) {
        var option = BOOKING_CALENDAR_SERVICE_OPTIONS.find(function(service) {
          return service.name === serviceName;
        });
        return total + (option ? +option.price : 0);
      }, 0);
    }

    function bookingServiceIds(services) {
      return (services || []).map(function(serviceName) {
        var option = BOOKING_CALENDAR_SERVICE_OPTIONS.find(function(service) { return service.name === serviceName; });
        return option ? option.serviceId : '';
      }).filter(Boolean);
    }

    function bookingServiceDetails(services) {
      return (services || []).map(function(serviceName) {
        var option = BOOKING_CALENDAR_SERVICE_OPTIONS.find(function(service) { return service.name === serviceName; });
        return option
          ? { id: option.serviceId, name: option.name, price: option.price, durationMin: option.duration, icon: option.icon }
          : { name: serviceName, price: null, durationMin: null, icon: '✨' };
      });
    }

    function updateBookingCreateServiceSummary() {
      var services = getBookingCreateServices();
      var totalPrice = bookingServicePriceTotal(services);
      var totalDuration = bookingServiceDurationMinutes(services);
      var price = document.querySelector('[data-booking-create-total-price]');
      var duration = document.querySelector('[data-booking-create-total-duration]');
      if (price) price.textContent = '$' + totalPrice;
      if (duration) duration.textContent = totalDuration + ' min';
    }

    function populateBookingCreateForm() {
      bookingCreateTickets = [];
      bookingCreateSelectedServiceId = '';
      bookingCreateSelectedTechId = null;
      bookingCreateSelectedTechName = 'Anyone';
      renderBookingCreateTicketPicker();
      updateBookingCreateServiceSummary();
    }

    function openBookingCreateModal(start, end, tech) {
      var modal = document.querySelector('[data-booking-create-modal]');
      if (!modal) return;

      var startDate = start instanceof Date && Number.isFinite(start.getTime()) ? new Date(start) : new Date(bookingCalendarDate + 'T10:00:00');

      populateBookingCreateForm();
      var name = bookingCreateField('name');
      var phone = bookingCreateField('phone');
      var techField = bookingCreateField('tech');
      var date = bookingCreateField('date');
      var time = bookingCreateField('time');
      var status = bookingCreateField('status');
      var note = bookingCreateField('note');
      if (name) name.value = '';
      if (phone) phone.value = '';
      if (techField) techField.value = bookingCalendarResourceTech(tech);
      if (date) date.value = bookingCalendarInputDate(startDate);
      if (time) time.value = bookingCalendarInputTime(startDate);
      if (status) status.value = 'new';
      if (note) note.value = '';
      setBookingCreateError('');

      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      if (name) name.focus();
    }

    function closeBookingCreateModal() {
      var modal = document.querySelector('[data-booking-create-modal]');
      if (!modal) return;
      modal.hidden = true;
      document.body.style.overflow = '';
      if (bookingTeamCalendar) bookingTeamCalendar.clearSelection();
    }

    function openBookingNewAppointment() {
      var panel = document.getElementById('booking-subpanel-today');
      var nextMode = panel && panel.dataset.bookingViewMode ? panel.dataset.bookingViewMode : 'table';
      if (nextMode === 'calendar') {
        closeBookingCreateModal();
        openBookingAppointmentPanelForNew(null, null, 'unassigned');
        return;
      }
      closeBookingAppointmentPanel();
      openBookingCreateModal(null, null, 'unassigned');
    }

    function bookingCalendarHasConflict(start, end, tech) {
      var normalizedTech = bookingCalendarResourceTech(tech);
      if (normalizedTech === 'unassigned') return false;
      return appointmentStore.hasConflict(
        appointmentStore.loadAll(null, catalog),
        { technicianId: normalizedTech, startAt: formatBookingCalendarDateTime(start), endAt: formatBookingCalendarDateTime(end) },
        null
      );
    }

    function bookingCalendarCanPlace(id, start, end, tech) {
      var normalizedTech = bookingCalendarResourceTech(tech);
      return !appointmentStore.hasConflict(
        appointmentStore.loadAll(null, catalog),
        { technicianId: normalizedTech === 'unassigned' ? null : normalizedTech, startAt: start, endAt: end },
        id
      );
    }

    function bookingCalendarEventMeta(event) {
      var data = event && event.data ? event.data : {};
      if (data.orderId) return { orderId: String(data.orderId), ticketId: String(data.ticketId || '') };
      var raw = event && typeof event.id === 'function' ? event.id() : String(event || '');
      var parts = raw.split('::');
      return { orderId: parts[0], ticketId: parts[1] || '' };
    }

    function bookingCalendarTicket(record, ticketId) {
      return record && Array.isArray(record.tickets) ? record.tickets.find(function(ticket) { return String(ticket.id) === String(ticketId); }) : null;
    }

    function bookingCalendarUpdateTicket(orderId, ticketId, start, end, tech) {
      var record = bookingPanelRecordById(orderId);
      var ticket = bookingCalendarTicket(record, ticketId);
      if (!record || !ticket) return;
      var nextTickets = record.tickets.map(function(current) {
        if (String(current.id) !== String(ticketId)) return current;
        return Object.assign({}, current, { startAt: start, endAt: end, technicianId: tech === 'unassigned' ? null : tech, technicianName: tech === 'unassigned' ? 'Anyone' : bookingTechName(tech) });
      });
      var starts = nextTickets.map(function(current) { return new Date(current.startAt).getTime(); }).filter(Number.isFinite);
      var ends = nextTickets.map(function(current) { return new Date(current.endAt).getTime(); }).filter(Number.isFinite);
      var orderStart = new Date(Math.min.apply(Math, starts));
      var orderEnd = new Date(Math.max.apply(Math, ends));
      var parentTech = appointmentTicketUtils && appointmentTicketUtils.parentTechnicianId ? appointmentTicketUtils.parentTechnicianId(nextTickets) : null;
      var result = appointmentStore.update(orderId, {
        tickets: nextTickets,
        technicianId: parentTech,
        technicianName: parentTech ? bookingTechName(parentTech) : '',
        startAt: formatBookingCalendarDateTime(orderStart),
        endAt: formatBookingCalendarDateTime(orderEnd),
        durationMin: Math.max(15, Math.round((orderEnd - orderStart) / 60000))
      }, null, catalog);
      if (!result.ok) return;
      renderBookingStoreRows();
      filterBookingItems();
      renderBookingCalendar();
    }

    function bookingCalendarValidateMove(args, resize) {
      var meta = bookingCalendarEventMeta(args.e);
      var record = bookingPanelRecordById(meta.orderId);
      if (!record) { args.preventDefault(); return; }
      var ticket = bookingCalendarTicket(record, meta.ticketId);
      var tech = resize ? (ticket ? (ticket.technicianId || 'unassigned') : (record.technicianId || 'unassigned')) : bookingCalendarResourceTech(args.newResource);
      var start = bookingCalendarDayPilotTime(args.newStart);
      var end = bookingCalendarDayPilotTime(args.newEnd);
      if (!bookingCalendarCanPlace(record.id, start, end, tech === 'unassigned' ? 'unassigned' : tech)) {
        args.preventDefault();
      }
    }

    function bookingCalendarApplyMove(args, resize) {
      var meta = bookingCalendarEventMeta(args.e);
      var record = bookingPanelRecordById(meta.orderId);
      if (!record) return;
      var ticket = bookingCalendarTicket(record, meta.ticketId);
      var tech = resize ? (ticket ? (ticket.technicianId || 'unassigned') : (record.technicianId || 'unassigned')) : bookingCalendarResourceTech(args.newResource);
      var start = bookingCalendarDayPilotTime(args.newStart);
      var end = bookingCalendarDayPilotTime(args.newEnd);
      if (ticket) {
        bookingCalendarUpdateTicket(record.id, meta.ticketId, start, end, tech);
        return;
      }
      var result = appointmentStore.update(record.id, {
        technicianId: tech === 'unassigned' ? null : tech,
        startAt: start,
        endAt: end
      }, null, catalog);
      if (!result.ok) return;
      var selected = bookingPanelMode === 'edit' && String(bookingPanelAppointmentId) === String(record.id);
      if (selected) {
        bookingPanelRefreshAfterWrite(result.record);
      } else {
        renderBookingStoreRows();
        filterBookingItems();
        renderBookingCalendar();
      }
    }

    function bookingCalendarStatusClass(status) {
      return BOOKING_STATUS_CLASS[status] || BOOKING_STATUS_CLASS.new;
    }

    function bookingCalendarStatusMarkup(status) {
      var labels = { 'new': 'New', 'sms-sent': 'SMS Sent', 'done': 'Completed', 'noshow': 'No-show' };
      var classes = { 'new': 'booking-status-new', 'sms-sent': 'booking-status-sms', 'done': 'booking-status-done', 'noshow': 'booking-status-noshow' };
      var value = labels[status] ? status : 'new';
      return '<span class="badge booking-status ' + classes[value] + '">' + labels[value] + '</span>';
    }

    function createBookingTableRow(data) {
      var status = BOOKING_STATUS_CLASS[data.status] ? data.status : 'new';
      var tech = bookingCalendarResourceTech(data.tech);
      var techLabel = data.techName || bookingTechName(tech);
      var services = (Array.isArray(data.services) ? data.services : [data.service]).map(function(service) {
        return String(service || '').trim();
      }).filter(Boolean);
      var serviceLabel = services.join(' ');
      var start = new Date(data.date + 'T' + data.time + ':00');
      var timeLabel = bookingCalendarDisplayTime(start);
      var dateLabel = bookingCalendarDisplayDate(start);
      var phoneLabel = formatBookingPhone(data.phone);
      var sourceValue = data.source || 'front-desk';
      return '<tr class="booking-table-row ' + bookingCalendarStatusClass(status) + '" data-booking-item data-booking-id="' + escapeHtml(data.id) + '" data-booking-name="' + escapeHtml(data.name) + '" data-booking-phone="' + escapeHtml(data.phone) + '" data-booking-email="' + escapeHtml(data.email || '') + '" data-booking-service="' + escapeHtml(serviceLabel) + '" data-booking-tech="' + escapeHtml(tech) + '" data-booking-date="' + escapeHtml(data.date) + '" data-booking-duration="' + data.duration + '" data-booking-source="' + escapeHtml(sourceValue) + '" data-booking-note="' + escapeHtml(data.note || '') + '">' +
        '<td><div class="booking-time-block"><div class="booking-time-main booking-callstart-main">' + escapeHtml(timeLabel) + '</div><div class="booking-time-date booking-callstart-date">' + escapeHtml(dateLabel) + '</div></div></td>' +
        '<td><div class="booking-customer"><div class="booking-customer-name">' + escapeHtml(data.name) + ' ' + bookingSourceBadgesFromText(sourceValue) + '</div><div class="booking-customer-meta">' + escapeHtml(phoneLabel) + '</div></div></td>' +
        '<td><div class="booking-service"><div class="booking-service-list">' + services.map(function(service) {
          return '<span class="booking-service-chip">' + escapeHtml(service) + '</span>';
        }).join('') + '</div></div></td>' +
        '<td><div class="booking-tech"><span class="booking-tech-name">' + escapeHtml(techLabel) + '</span></div></td>' +
        '<td><div class="booking-time-block"><div class="booking-time-main">' + escapeHtml(timeLabel) + '</div><div class="booking-time-date">' + escapeHtml(dateLabel) + '</div></div></td>' +
        '<td><span class="booking-duration"><i class="bi bi-stopwatch" aria-hidden="true"></i> <span class="booking-duration-value">' + bookingCalendarDurationLabel(data.duration) + '</span></span></td>' +
        '<td class="booking-status-cell">' + bookingCalendarStatusMarkup(status) + '</td>' +
        '<td><div class="booking-actions"></div></td>' +
        '</tr>';
    }

    function saveBookingFromCalendar() {
      var get = function(name) {
        var field = bookingCreateField(name);
        return field ? field.value : '';
      };
      var name = get('name').trim();
      var services = getBookingCreateServices();
      var date = get('date');
      var time = get('time');
      var phone = get('phone').trim();
      var duration = (appointmentTicketUtils && appointmentTicketUtils.ticketTotals ? appointmentTicketUtils.ticketTotals(bookingCreateTickets).duration : 0) || 60;
      var status = get('status') || 'new';
      var note = get('note').trim();

      if (!phone) { setBookingCreateError('Enter the phone number.'); return; }
      if (!name) { setBookingCreateError('Enter the customer name.'); return; }
      if (!services.length) { setBookingCreateError('Select at least one service.'); return; }
      if (!date || !time) { setBookingCreateError('Pick a valid date and start time.'); return; }

      var start = new Date(date + 'T' + time + ':00');
      if (!Number.isFinite(start.getTime())) { setBookingCreateError('Pick a valid date and start time.'); return; }
      var scheduledTickets = appointmentTicketUtils && appointmentTicketUtils.scheduleTickets ? appointmentTicketUtils.scheduleTickets(bookingCreateTickets, formatBookingCalendarDateTime(start)) : bookingCreateTickets;
      var end = new Date(start.getTime() + duration * 60000);
      scheduledTickets.forEach(function(ticket) { var ticketEnd = new Date(ticket.endAt); if (ticketEnd > end) end = ticketEnd; });
      var conflict = scheduledTickets.some(function(ticket) {
        return ticket.technicianId && appointmentStore.hasConflict(appointmentStore.loadAll(null, catalog), { technicianId: ticket.technicianId, startAt: ticket.startAt, endAt: ticket.endAt }, null);
      });
      if (conflict) {
        setBookingCreateError('A technician already has an overlapping ticket. Change the time or technician.');
        return;
      }
      var parentTechId = appointmentTicketUtils && appointmentTicketUtils.parentTechnicianId ? appointmentTicketUtils.parentTechnicianId(scheduledTickets) : null;

      var result = appointmentStore.create({
        id: 'booking-frontdesk-' + Date.now(),
        customerName: name,
        phone: phone,
        serviceIds: scheduledTickets.map(function(ticket) { return ticket.serviceId; }),
        serviceNames: services,
        serviceDetails: scheduledTickets.map(function(ticket) { return { id: ticket.serviceId, name: ticket.serviceName, price: ticket.price, durationMin: ticket.durationMin, icon: '✨' }; }),
        tickets: scheduledTickets,
        technicianId: parentTechId,
        technicianName: parentTechId ? bookingTechName(parentTechId) : '',
        startAt: formatBookingCalendarDateTime(start),
        endAt: formatBookingCalendarDateTime(end),
        durationMin: Math.max(15, Math.round((end - start) / 60000)),
        status: status,
        note: note,
        source: 'manual-add'
      }, null, catalog);
      if (!result.ok) { setBookingCreateError(result.error.message); return; }

      bookingCalendarDate = date;
      closeBookingCreateModal();
      renderBookingStoreRows();
      filterBookingItems();
      renderBookingCalendar();
      if (window.Swal) {
        var techLabel = parentTechId ? bookingTechName(parentTechId) : 'Anyone';
        var statusLabels = { 'new': 'New', 'sms-sent': 'SMS Sent', 'done': 'Completed', 'noshow': 'No-show' };
        var bookingSuccessHtml = [
          '<div class="booking-save-summary">',
          '<div class="booking-save-summary-row"><span class="booking-save-summary-label">Customer</span><strong class="booking-save-summary-value">' + escapeHtml(name) + '</strong></div>',
          '<div class="booking-save-summary-row"><span class="booking-save-summary-label">Phone</span><strong class="booking-save-summary-value">' + escapeHtml(formatBookingPhone(phone)) + '</strong></div>',
          '<div class="booking-save-summary-row"><span class="booking-save-summary-label">Services</span><strong class="booking-save-summary-value">' + escapeHtml(services.join(', ')) + '</strong></div>',
          '<div class="booking-save-summary-row"><span class="booking-save-summary-label">Date</span><strong class="booking-save-summary-value">' + escapeHtml(bookingCalendarDisplayDate(start)) + '</strong></div>',
          '<div class="booking-save-summary-row"><span class="booking-save-summary-label">Time</span><strong class="booking-save-summary-value">' + escapeHtml(bookingCalendarDisplayTime(start)) + '</strong></div>',
          '<div class="booking-save-summary-row"><span class="booking-save-summary-label">Duration</span><strong class="booking-save-summary-value">' + duration + ' min</strong></div>',
          '<div class="booking-save-summary-row"><span class="booking-save-summary-label">Technician</span><strong class="booking-save-summary-value">' + escapeHtml(techLabel) + '</strong></div>',
          '<div class="booking-save-summary-row"><span class="booking-save-summary-label">Status</span><strong class="booking-save-summary-value">' + escapeHtml(statusLabels[status] || status) + '</strong></div>',
          '</div>'
        ].join('');
        Swal.fire({
          icon: 'success',
          title: 'Appointment created',
          html: bookingSuccessHtml,
          confirmButtonText: 'Close',
          showConfirmButton: true,
          allowOutsideClick: false,
          allowEscapeKey: false
        });
      }
    }

    function initBookingCalendar() {
      var el = document.querySelector('[data-booking-team-calendar]');
      if (!el || bookingTeamCalendar) return;
      if (!window.DayPilot) {
        el.innerHTML = '<div class="booking-calendar-empty">The calendar library could not load.<br>Check the internet connection and refresh this page.</div>';
        return;
      }
      bookingTeamCalendar = new DayPilot.Calendar(el, {
        viewType: 'Resources',
        startDate: bookingCalendarDate,
        columns: bookingCalendarColumns(bookingCalendarRows()),
        businessBeginsHour: 9,
        businessEndsHour: 19,
        heightSpec: 'BusinessHoursNoScroll',
        cellDuration: 15,
        cellHeight: 28,
        hourWidth: 64,
        headerHeight: 44,
        timeFormat: 'Clock12Hours',
        onBeforeCellRender: function(args) {
          args.cell.properties.html = '<span class="booking-cell-add" aria-hidden="true"><span>+</span></span>';
        },
        eventMoveHandling: 'Update',
        eventResizeHandling: 'Update',
        timeRangeSelectedHandling: 'Enabled',
        onTimeRangeSelected: function(args) {
          var start = new Date(bookingCalendarDayPilotTime(args.start));
          var end = new Date(bookingCalendarDayPilotTime(args.end));
          openBookingAppointmentPanelForNew(start, end, bookingCalendarResourceTech(args.resource));
        },
        onEventClick: function(args) { openBookingAppointmentPanel(findBookingItemById(bookingCalendarEventMeta(args.e).orderId)); },
        onEventMove: function(args) { bookingCalendarValidateMove(args, false); },
        onEventMoved: function(args) { bookingCalendarApplyMove(args, false); },
        onEventResize: function(args) { bookingCalendarValidateMove(args, true); },
        onEventResized: function(args) { bookingCalendarApplyMove(args, true); }
      });
      bookingTeamCalendar.init();
      renderBookingCalendar();
    }

    function setBookingCalendarDate(date) {
      bookingCalendarDate = formatBookingCalendarDate(date);
      renderBookingCalendar();
    }

    function setBookingViewMode(mode) {
      var panel = document.getElementById('booking-subpanel-today');
      if (!panel) return;

      var nextMode = mode === 'card' || mode === 'calendar' ? mode : 'table';
      panel.dataset.bookingViewMode = nextMode;
      var appointmentLayout = panel.querySelector('.booking-appointment-layout');
      if (appointmentLayout) appointmentLayout.dataset.bookingViewMode = nextMode;

      panel.querySelectorAll('[data-booking-view-panel]').forEach(function(viewPanel) {
        viewPanel.hidden = viewPanel.dataset.bookingViewPanel !== nextMode;
      });

      panel.querySelectorAll('[data-booking-view-target]').forEach(function(button) {
        var isActive = button.dataset.bookingViewTarget === nextMode;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      var statusChips = panel.querySelector('[data-booking-status-chips]');
      if (statusChips) statusChips.hidden = nextMode === 'calendar';

      if (nextMode === 'calendar') { initBookingCalendar(); renderBookingCalendar(); }
    }

    function findBookingItemById(id) {
      return Array.from(document.querySelectorAll('[data-booking-item]')).find(function(item) {
        return item.dataset.bookingId === id;
      }) || null;
    }

    function findBookingItemFromAction(action) {
      if (!action) return null;
      var item = action.closest('[data-booking-item]');
      if (item) return item;

      var card = action.closest('[data-booking-card-id]');
      if (card) return findBookingItemById(card.dataset.bookingCardId);

      var modal = action.closest('[data-booking-detail-modal]');
      return modal ? findBookingItemById(modal.dataset.bookingDetailItemId) : null;
    }

    function getBookingStatusText(item) {
      var status = item.querySelector('.booking-status');
      return status ? status.textContent.trim() : '-';
    }

    function getBookingTimeText(item) {
      var time = item.querySelector('.booking-time-main');
      return time ? time.textContent.trim() : '-';
    }

    function getBookingDateText(item) {
      var date = item.querySelector('.booking-time-date');
      return date ? date.textContent.trim() : '-';
    }

    function getBookingCardTimeText(item) {
      var time = getBookingTimeText(item);
      var date = getBookingDateText(item);
      if (time === '-') return date;
      if (date === '-') return time;
      return time + ' · ' + date;
    }

    function renderBookingOperationalActionButtons(item) {
      var actions = '';
      if (item && item.classList.contains('is-new')) {
        actions += '<button class="booking-mini-button primary booking-sms-action" type="button" data-booking-action="send-sms" aria-label="Send SMS" title="Send SMS"><i class="bi bi-send" aria-hidden="true"></i><span class="booking-mini-label">Send SMS</span></button>';
      } else if (item && item.classList.contains('is-sms-sent')) {
        actions += '<button class="booking-mini-button primary booking-done-action" type="button" data-booking-action="done" aria-label="Done" title="Done"><i class="bi bi-check-lg" aria-hidden="true"></i><span class="booking-mini-label">Done</span></button>';
      }
      if (item && (item.classList.contains('is-new') || item.classList.contains('is-sms-sent'))) {
        actions += '<button class="booking-mini-button booking-noshow-action" type="button" data-booking-action="noshow" aria-label="No-show" title="No-show"><i class="bi bi-x-lg" aria-hidden="true"></i><span class="booking-mini-label">No-show</span></button>';
      }
      return actions;
    }

    function renderBookingActionButtons(item) {
      var actions = renderBookingOperationalActionButtons(item);
      actions += '<button class="booking-mini-button" type="button" data-booking-action="detail" aria-label="View" title="View"><i class="bi bi-eye" aria-hidden="true"></i><span class="booking-mini-label">View</span></button>';
      return actions;
    }

    function renderBookingDetailActions(item) {
      return renderBookingOperationalActionButtons(item);
    }

function getBookingCardCallStart(item) {
      var main = item.querySelector('.booking-callstart-main');
      var date = item.querySelector('.booking-callstart-date');
      var m = main ? main.textContent.trim() : '';
      var d = date ? date.textContent.trim() : '';
      return (m + (d ? ' · ' + d : '')).trim() || '-';
    }

    function getBookingCardDuration(item) {
      var v = item.querySelector('.booking-duration-value');
      return v ? v.textContent.trim() : '-';
    }

    function renderBookingCards() {
      var panel = document.getElementById('booking-subpanel-today');
      if (!panel) return;

      var list = panel.querySelector('[data-booking-card-list]');
      if (!list) return;

      var rows = Array.from(panel.querySelectorAll('[data-booking-item]')).filter(function(item) {
        return !item.hidden;
      });

      list.innerHTML = rows.map(function(item) {
        var statusBadge = item.querySelector('.booking-status');
        var statusClass = statusBadge ? statusBadge.className : 'badge booking-status';
        var services = Array.from(item.querySelectorAll('.booking-service-chip')).map(function(service) {
          return '<span class="booking-service-chip">' + escapeHtml(bookingServiceDisplayName(service.textContent.trim())) + '</span>';
        }).join('');

        return '<article class="booking-appointment-card" data-booking-card-id="' + escapeHtml(item.dataset.bookingId) + '">' +
          '<div class="booking-card-top">' +
            '<div><div class="booking-card-name">' + escapeHtml(item.dataset.bookingName || '-') + '</div>' +
            '<div class="booking-card-contact">' + escapeHtml(formatBookingPhone(item.dataset.bookingPhone)) + ' · ' + escapeHtml(item.dataset.bookingEmail || '-') + '</div></div>' +
            '<span class="' + escapeHtml(statusClass) + '">' + escapeHtml(getBookingStatusText(item)) + '</span>' +
          '</div>' +
          '<div class="booking-service-list">' + services + '</div>' +
          '<div class="booking-card-info-list">' +
            '<div class="booking-card-info-row"><span class="booking-card-label">Time</span><span class="booking-card-value">' + escapeHtml(getBookingCardCallStart(item)) + '</span></div>' +
            '<div class="booking-card-info-row"><span class="booking-card-label">Technician</span><span class="booking-card-value">' + escapeHtml(bookingTechName(item.dataset.bookingTech)) + '</span></div>' +
            '<div class="booking-card-info-row"><span class="booking-card-label">Appointment</span><span class="booking-card-value">' + escapeHtml(getBookingCardTimeText(item)) + '</span></div>' +
            '<div class="booking-card-info-row"><span class="booking-card-label">Duration</span><span class="booking-card-value">' + escapeHtml(getBookingCardDuration(item)) + '</span></div>' +
            '<div class="booking-card-info-row"><span class="booking-card-label">Source</span><span class="booking-card-value booking-source-list">' + renderBookingSourceBadges(item) + '</span></div>' +
          '</div>' +
          '<div class="booking-card-actions">' + renderBookingActionButtons(item) + '</div>' +
        '</article>';
      }).join('');
    }

    function initBookingViewMode() {
      renderBookingCards();
      setBookingViewMode('calendar');
    }

    function setBookingStatus(item, status) {
      if (!item) return;
      var result = appointmentStore.update(item.dataset.bookingId, appointmentStore.mapBookingStatus(status), null, catalog);
      if (!result.ok) { setBookingCreateError(result.error.message); return; }
      renderBookingStoreRows();
      filterBookingItems();
    }

    function sendBookingSms(item) {
      if (!item) return;
      var result = appointmentStore.update(item.dataset.bookingId, { smsStatus: 'sent' }, null, catalog);
      if (!result.ok) { setBookingCreateError(result.error.message); return; }
      renderBookingStoreRows();
      filterBookingItems();
    }

    function completeBookingItem(item) {
      setBookingStatus(item, 'done');
    }

    function markBookingNoShow(item) {
      setBookingStatus(item, 'noshow');
    }

    function getBookingSearchValue(item, field) {
      var key = 'booking' + field.charAt(0).toUpperCase() + field.slice(1);
      return (item.dataset[key] || '').toLowerCase();
    }

    function updateBookingSearchPlaceholder() {
      var panel = document.getElementById('booking-subpanel-today');
      if (!panel) return;

      var fieldControl = panel.querySelector('[data-booking-search-field]');
      var searchInput = panel.querySelector('[data-booking-search-input]');
      if (!searchInput) return;

      var field = fieldControl ? fieldControl.value : 'name';
      searchInput.placeholder = BOOKING_SEARCH_PLACEHOLDERS[field] || BOOKING_SEARCH_PLACEHOLDERS.name;
    }

    function filterBookingItems() {
      var panel = document.getElementById('booking-subpanel-today');
      if (!panel) return;

      var fieldControl = panel.querySelector('[data-booking-search-field]');
      var searchInput = panel.querySelector('[data-booking-search-input]');
      var dateFromInput = panel.querySelector('[data-booking-date-from]');
      var dateToInput = panel.querySelector('[data-booking-date-to]');
      var field = fieldControl ? fieldControl.value : 'name';
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var dateFrom = dateFromInput ? dateFromInput.value : '';
      var dateTo = dateToInput ? dateToInput.value : '';

      var statusClass = BOOKING_STATUS_CLASS[bookingStatusFilter];

      Array.from(panel.querySelectorAll('[data-booking-item]')).forEach(function(item) {
        var searchValue = getBookingSearchValue(item, field);
        var itemDate = item.dataset.bookingDate || '';
        var matchesSearch = !query || searchValue.indexOf(query) !== -1;
        var matchesDateFrom = !dateFrom || itemDate >= dateFrom;
        var matchesDateTo = !dateTo || itemDate <= dateTo;
        var matchesStatus = bookingStatusFilter === 'all' || item.classList.contains(statusClass);
        item.hidden = !(matchesSearch && matchesDateFrom && matchesDateTo && matchesStatus);
      });

      updateBookingKpis();
      renderBookingCards();
      renderBookingCalendar();
    }

    function clearBookingFilters() {
      var panel = document.getElementById('booking-subpanel-today');
      if (!panel) return;

      var fieldControl = panel.querySelector('[data-booking-search-field]');
      var searchInput = panel.querySelector('[data-booking-search-input]');
      var dateFromInput = panel.querySelector('[data-booking-date-from]');
      var dateToInput = panel.querySelector('[data-booking-date-to]');

      if (fieldControl) fieldControl.value = 'name';
      if (searchInput) searchInput.value = '';
      if (bookingDateFromPicker) {
        bookingDateFromPicker.clear();
      } else if (dateFromInput) {
        dateFromInput.value = '';
      }
      if (bookingDateToPicker) {
        bookingDateToPicker.clear();
      } else if (dateToInput) {
        dateToInput.value = '';
      }
      bookingStatusFilter = 'all';

      updateBookingSearchPlaceholder();
      filterBookingItems();
    }

    function setBookingDetailText(selector, value) {
      var target = document.querySelector(selector);
      if (target) target.textContent = value || '-';
    }

    function formatBookingPhone(phone) {
      var digits = (phone || '').replace(/\D/g, '');
      if (digits.length === 10) {
        return '+1 (' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
      }
      if (digits.length === 11) {
        return '+' + digits.slice(0, 1) + ' (' + digits.slice(1, 4) + ') ' + digits.slice(4, 7) + '-' + digits.slice(7);
      }
      return phone || '-';
    }

    function getBookingServiceText(item) {
      var services = Array.from(item.querySelectorAll('.booking-service-chip')).map(function(service) {
        return bookingServiceDisplayName(service.textContent.trim());
      }).filter(Boolean);
      return services.length ? services.join(', ') : bookingServiceDisplayName(item.dataset.bookingService || '-');
    }

    function getBookingCustomerInitials(name) {
      return (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function(part) {
        return part.charAt(0).toUpperCase();
      }).join('') || 'BK';
    }

    function setBookingDetailServices(item) {
      var target = document.querySelector('[data-booking-detail-services]');
      if (!target) return;

      var services = Array.from(item.querySelectorAll('.booking-service-chip')).map(function(service) {
        return bookingServiceDisplayName(service.textContent.trim());
      }).filter(Boolean);

      target.innerHTML = services.map(function(service) {
        return '<span class="booking-service-chip">' + escapeHtml(service) + '</span>';
      }).join('');

      if (!target.innerHTML) {
        target.textContent = bookingServiceDisplayName(item.dataset.bookingService || '-');
      }
    }

    function getBookingSourceBadges(item) {
      return Array.from(item.querySelectorAll('.booking-customer-name .badge')).map(function(badge) {
        return {
          className: badge.className,
          text: badge.textContent.trim()
        };
      }).filter(function(source) {
        return source.text;
      });
    }

    function renderBookingSourceBadges(item) {
      var badges = getBookingSourceBadges(item);
      if (!badges.length) return '-';

      return badges.map(function(source) {
        return '<span class="' + escapeHtml(source.className) + '">' + escapeHtml(source.text) + '</span>';
      }).join('');
    }

    function getBookingSourceText(item) {
      var badges = getBookingSourceBadges(item).map(function(source) {
        return source.text;
      });
      return badges.length ? badges.join(' · ') : '-';
    }

    function bookingSourceNeedsRepair(source) {
      var normalized = String(source || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
      return !normalized || normalized === '-' || normalized === 'booking book' || normalized === 'booking book static v1' || normalized === 'front desk';
    }

    function repairBookingStaticSources(items) {
      var sourceById = {};
      (items || []).forEach(function(item) {
        var source = getBookingSourceText(item);
        if (source && source !== '-') sourceById[String(item.dataset.bookingId)] = source;
      });

      appointmentStore.loadAll(null, catalog).forEach(function(record) {
        var source = sourceById[String(record.id)];
        if (!source || !bookingSourceNeedsRepair(record.source) || record.source === source) return;
        appointmentStore.update(record.id, { source: source }, null, catalog);
      });
    }

    function setBookingDetailSource(item) {
      var target = document.querySelector('[data-booking-detail-source]');
      if (target) target.innerHTML = renderBookingSourceBadges(item);
    }

    function openBookingDetailModal(item) {
      var modal = document.querySelector('[data-booking-detail-modal]');
      if (!modal || !item) return;

      var status = item.querySelector('.booking-status');
      var phone = formatBookingPhone(item.dataset.bookingPhone);

      setBookingDetailText('[data-booking-detail-initials]', getBookingCustomerInitials(item.dataset.bookingName));
      setBookingDetailText('[data-booking-detail-name]', item.dataset.bookingName);
      setBookingDetailText('[data-booking-detail-phone]', phone);
      setBookingDetailText('[data-booking-detail-email]', item.dataset.bookingEmail);
      setBookingDetailSource(item);
      setBookingDetailServices(item);
      setBookingDetailText('[data-booking-detail-tech]', bookingTechName(item.dataset.bookingTech));
      setBookingDetailText('[data-booking-detail-status]', status ? status.textContent.trim() : '-');
      setBookingDetailText('[data-booking-detail-time]', getBookingCardTimeText(item));
      setBookingDetailText('[data-booking-detail-note]', item.dataset.bookingNote);
      var actionTarget = modal.querySelector('[data-booking-detail-actions]');
      if (actionTarget) actionTarget.innerHTML = renderBookingDetailActions(item);
      modal.dataset.bookingDetailItemId = item.dataset.bookingId;

      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      var closeButton = modal.querySelector('[data-booking-detail-close]');
      if (closeButton) closeButton.focus();
    }

    function closeBookingDetailModal() {
      var modal = document.querySelector('[data-booking-detail-modal]');
      if (!modal) return;

      modal.hidden = true;
      document.body.style.overflow = '';
    }

    function parseTechSchedule(value) {
      var schedule = {};
      (value || '').split(';').forEach(function(entry) {
        var parts = entry.split('=');
        if (parts.length !== 2) return;

        var day = parts[0].trim();
        var range = parts[1].split('-');
        if (!day || range.length !== 2) return;

        schedule[day] = {
          start: range[0].trim(),
          end: range[1].trim()
        };
      });
      return schedule;
    }

    function syncTechDayOffRow(dayOff) {
      if (!dayOff) return;

      var day = dayOff.dataset.techDayOff;
      var row = dayOff.closest('.tech-schedule-row');
      var start = document.querySelector('[data-tech-schedule-start="' + day + '"]');
      var end = document.querySelector('[data-tech-schedule-end="' + day + '"]');
      var isDayOff = Boolean(dayOff.checked);

      if (row) row.classList.toggle('is-day-off', isDayOff);
      [start, end].forEach(function(input) {
        if (!input) return;
        input.disabled = isDayOff;
        if (isDayOff) input.value = '';
      });
    }

    function setTechScheduleValue(value, options) {
      var schedule = parseTechSchedule(value);
      document.querySelectorAll('[data-tech-day-off]').forEach(function(dayOff) {
        var day = dayOff.dataset.techDayOff;
        var daySchedule = schedule[day];
        var start = document.querySelector('[data-tech-schedule-start="' + day + '"]');
        var end = document.querySelector('[data-tech-schedule-end="' + day + '"]');

        dayOff.checked = options && options.blank ? false : !daySchedule;
        if (start) start.value = daySchedule ? daySchedule.start : '';
        if (end) end.value = daySchedule ? daySchedule.end : '';
        syncTechDayOffRow(dayOff);
      });
    }

    function getTechScheduleValue() {
      return Array.from(document.querySelectorAll('[data-tech-day-off]')).map(function(dayOff) {
        if (dayOff.checked) return '';

        var day = dayOff.dataset.techDayOff;
        var start = document.querySelector('[data-tech-schedule-start="' + day + '"]');
        var end = document.querySelector('[data-tech-schedule-end="' + day + '"]');
        var startValue = start ? start.value : '';
        var endValue = end ? end.value : '';
        return startValue && endValue ? day + '=' + startValue + '-' + endValue : '';
      }).filter(Boolean).join(';');
    }

    function setTechField(name, value, options) {
      if (name === 'services') {
        var selectedServices = (value || '').split(',').map(function(service) {
          return service.trim().toLowerCase();
        }).filter(Boolean);

        document.querySelectorAll('[data-tech-service]').forEach(function(option) {
          option.checked = selectedServices.indexOf(option.value.toLowerCase()) !== -1;
        });
        syncTechServiceCheckAll();
        return;
      }

      if (name === 'schedule') {
        setTechScheduleValue(value, options);
        return;
      }

      var field = document.querySelector('[data-tech-field="' + name + '"]');
      if (field && field.matches('[data-phone-mask]')) {
        field.value = formatUsPhoneInput(value);
      } else if (field) {
        field.value = value || '';
      }
    }

    function syncTechServiceCheckAll() {
      var services = Array.from(document.querySelectorAll('[data-tech-service]'));
      var checkAll = document.querySelector('[data-tech-service-all]');
      if (!checkAll) return;
      var checkedCount = services.filter(function(option) { return option.checked; }).length;
      checkAll.checked = services.length > 0 && checkedCount === services.length;
      checkAll.indeterminate = checkedCount > 0 && checkedCount < services.length;
    }

    function getTechField(name) {
      if (name === 'services') {
        return Array.from(document.querySelectorAll('[data-tech-service]:checked')).map(function(option) {
          return option.value;
        }).join(', ');
      }

      if (name === 'schedule') {
        return getTechScheduleValue();
      }

      var field = document.querySelector('[data-tech-field="' + name + '"]');
      return field ? field.value.trim() : '';
    }

    function escapeHtml(value) {
      var div = document.createElement('div');
      div.textContent = value || '';
      return div.innerHTML;
    }

    function filterTechChoices(query) {
      var normalized = (query || '').trim().toLowerCase();
      var visibleCount = 0;

      document.querySelectorAll('[data-tech-choice]').forEach(function(choice) {
        var haystack = [
          choice.dataset.name,
          choice.dataset.phone,
          choice.dataset.email,
          choice.dataset.services,
          choice.textContent
        ].join(' ').toLowerCase();
        var visible = !normalized || haystack.indexOf(normalized) !== -1;
        choice.hidden = !visible;
        if (visible) visibleCount++;
      });

      var empty = document.querySelector('[data-tech-empty]');
      if (empty) empty.classList.toggle('is-visible', Boolean(normalized) && visibleCount === 0);
    }

    function setTechSelectOpen(open) {
      var menu = document.querySelector('[data-tech-select-menu]');
      var input = document.querySelector('[data-tech-select-input]');
      var combobox = document.querySelector('[data-tech-combobox]');

      if (menu) menu.hidden = !open;
      if (input) input.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (combobox) combobox.classList.toggle('is-open', Boolean(open));
    }

    function updateTechModalCopy(mode, choice) {
      var title = document.querySelector('[data-tech-modal-title]');
      var sub = document.querySelector('[data-tech-modal-sub]');
      var isCreate = mode === 'create';
      var techName = choice && choice.dataset.name ? choice.dataset.name : 'the selected technician';

      if (title) title.textContent = isCreate ? 'Technician Info' : 'Edit Technician Info';
      if (sub) sub.textContent = isCreate ? 'Enter new technician info, services and weekly schedule.' : ('Update profile, services and schedule for ' + techName + '.');
    }

    function fillTechModalFromChoice(choice) {
      if (!choice) return;

      document.querySelectorAll('[data-tech-choice], [data-tech-create]').forEach(function(button) {
        button.classList.toggle('is-active', button === choice);
      });

      var isCreate = choice.hasAttribute('data-tech-create');
      var modal = document.querySelector('[data-tech-modal]');
      var selectInput = document.querySelector('[data-tech-select-input]');
      if (modal) modal.dataset.techMode = isCreate ? 'create' : 'edit';
      if (selectInput) selectInput.value = isCreate ? '' : (choice.dataset.name || '');
      updateTechModalCopy(isCreate ? 'create' : 'edit', choice);

      setTechField('name', isCreate ? '' : choice.dataset.name);
      setTechField('phone', isCreate ? '' : choice.dataset.phone);
      setTechField('email', isCreate ? '' : choice.dataset.email);
      setTechField('services', isCreate ? '' : choice.dataset.services);
      setTechField('schedule', choice.dataset.schedule, { blank: isCreate });

      var nameField = document.querySelector('[data-tech-field="name"]');
      setTechSelectOpen(false);
      if (nameField) nameField.focus();
    }

    function openTechModal(initialChoice, mode) {
      var modal = document.querySelector('[data-tech-modal]');
      if (!modal) return;

      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      var search = document.querySelector('[data-tech-search]');
      if (search) search.value = '';
      filterTechChoices('');
      var createButton = document.querySelector('[data-tech-create]');
      var fallbackChoice = mode === 'create'
        ? createButton
        : document.querySelector('[data-tech-choice].is-active') || document.querySelector('[data-tech-choice]');
      fillTechModalFromChoice(initialChoice || fallbackChoice);
      if (mode === 'detail') {
        modal.dataset.techMode = 'detail';
        updateTechModalCopy('edit', initialChoice || fallbackChoice);
      }
      setTechSelectOpen(false);
    }

    function openNewTechModal() {
      var createButton = document.querySelector('[data-tech-create]');
      openTechModal(createButton, 'create');
    }

    function openTechDetailFromCard(button) {
      if (!button) return;

      var choice = document.querySelector('[data-tech-choice="' + button.dataset.techDetailOpen + '"]');
      openTechModal(choice, 'detail');
    }

    function closeTechModal() {
      var modal = document.querySelector('[data-tech-modal]');
      if (!modal) return;

      modal.hidden = true;
      setTechSelectOpen(false);
      document.body.style.overflow = '';
    }

    function renderTechBadges(services) {
      var list = Array.isArray(services) ? services : String(services || 'Gel').split(',');
      return list.map(function(service) {
        return service.trim();
      }).filter(Boolean).map(function(service) {
        return '<span class="badge badge-plan">' + escapeHtml(service) + '</span>';
      }).join('');
    }

    function updateTechCard(card, data) {
      if (!card) return;

      var initial = (data.name || 'T').charAt(0).toUpperCase();
      var avatar = card.querySelector('.tech-avatar');
      var name = card.querySelector('.tech-name');
      var phone = card.querySelector('.tech-phone');
      var services = card.querySelector('.tech-services');

      if (avatar) avatar.textContent = initial;
      if (name) name.textContent = data.name || 'New technician';
      if (phone) phone.textContent = data.phone || 'No phone yet';
      if (services) services.innerHTML = renderTechBadges(data.services);
    }

    function createTechCard(data) {
      var card = document.createElement('article');
      var initial = (data.name || 'T').charAt(0).toUpperCase();
      card.className = 'tech-card';
      card.dataset.techId = data.id || ('tech-' + Date.now());
      card.dataset.email = data.email || '';
      card.dataset.schedule = data.schedule || '';
      card.dataset.services = Array.isArray(data.services) ? data.services.join(', ') : (data.services || '');
      card.innerHTML = '' +
        '<div class="tech-top">' +
          '<div class="tech-avatar">' + escapeHtml(initial) + '</div>' +
          '<div class="tech-profile">' +
            '<div class="tech-name">' + escapeHtml(data.name || 'New technician') + '</div>' +
            '<div class="tech-phone">' + escapeHtml(data.phone || 'No phone yet') + '</div>' +
          '</div>' +
          '<button class="toggle-pill is-on" type="button" aria-label="Toggle tech SMS notify"></button>' +
        '</div>' +
        '<div class="tech-card-footer">' +
          '<div class="tech-stats">' +
            '<div class="tech-stat"><strong>0</strong><span>Clients today</span></div>' +
          '</div>' +
          '<div class="tech-card-actions"><button class="booking-secondary-button" type="button" data-tech-detail-open="' + escapeHtml(card.dataset.techId) + '" aria-label="Edit" title="Edit"><i class="bi bi-pencil" aria-hidden="true"></i><span class="booking-mini-label">Edit</span></button></div>' +
        '</div>' +
        '<div class="tech-services">' + renderTechBadges(data.services) + '</div>';
      return card;
    }

    function renderBookingTechnicianRoster() {
      var activeTechnicians = catalog.technicians.filter(function(technician) { return technician.active; });
      var choices = document.querySelector('.tech-choice-grid');
      if (choices) {
        choices.innerHTML = activeTechnicians.map(function(technician) {
          var services = technician.services && technician.services.length ? technician.services : technician.skills;
          return '<button class="tech-choice-card" type="button" role="option" data-tech-choice="' + escapeHtml(technician.id) + '" data-name="' + escapeHtml(technician.name) + '" data-phone="' + escapeHtml(technician.phone) + '" data-email="' + escapeHtml(technician.email) + '" data-services="' + escapeHtml(services.join(', ')) + '" data-schedule="' + escapeHtml(technician.schedule) + '">' +
            '<span class="tech-avatar">' + escapeHtml((technician.name || 'T').charAt(0).toUpperCase()) + '</span>' +
            '<span><span class="tech-choice-name">' + escapeHtml(technician.name) + '</span><span class="tech-choice-meta">' + escapeHtml([technician.email, technician.phone].filter(Boolean).join(' · ') || services.join(' · ')) + '</span></span>' +
          '</button>';
        }).join('');
      }
      var grid = document.querySelector('.tech-grid');
      if (grid) {
        grid.innerHTML = '';
        activeTechnicians.forEach(function(technician) {
          var services = technician.services && technician.services.length ? technician.services : technician.skills;
          grid.appendChild(createTechCard({
            id: technician.id,
            name: technician.name,
            phone: technician.phone,
            email: technician.email,
            schedule: technician.schedule,
            services: services
          }));
        });
      }
    }

    function saveTechModal() {
      var modal = document.querySelector('[data-tech-modal]');
      var active = document.querySelector('.tech-choice-card.is-active');
      var mode = modal ? modal.dataset.techMode : 'edit';
      var id = mode === 'create' ? 'tech-' + Date.now() : (active ? active.dataset.techChoice : '');
      var data = {
        id: id,
        name: getTechField('name') || 'New technician',
        phone: getTechField('phone'),
        email: getTechField('email'),
        services: getTechField('services') || 'Gel',
        schedule: getTechField('schedule')
      };

      var nextCatalog = salonData.loadCatalog();
      var existing = id ? salonData.findTechnician(nextCatalog, id) : null;
      var services = String(data.services || '').split(',').map(function(service) { return service.trim(); }).filter(Boolean);
      var skills = services.map(function(serviceName) {
        var service = salonData.findService(nextCatalog, serviceName);
        return service && service.requiredSkill ? service.requiredSkill : serviceName;
      });
      var nextTechnicians = nextCatalog.technicians.filter(function(technician) { return technician.id !== id; });
      nextTechnicians.push(Object.assign({}, existing || {}, data, {
        active: true,
        services: services,
        skills: Array.from(new Set(skills))
      }));
      salonData.saveCatalog(Object.assign({}, nextCatalog, { technicians: nextTechnicians }));
      catalog = salonData.loadCatalog();
      rebuildBookingCatalogViews();
      renderBookingTechnicianRoster();
      renderBookingStoreRows();
      filterBookingItems();

      setSettingsStatus('Saved technician info: ' + data.name + '.');
      closeTechModal();
    }

    function simulateVoiceScenario(type) {
      var bubbles = document.querySelector('[data-voice-bubbles]');
      if (!bubbles) return;

      var scenarios = {
        book: [
          ['Hi! This is Bitcoin Nail Bar, I\'m the AI assistant. Would you like to book an appointment?', false],
          ['I\'d like a gel manicure Thursday at 2pm.', true],
          ['Got it! I\'ve reserved a Gel Manicure Thursday at 2pm with Kim. A confirmation text is on its way.', false]
        ],
        price: [
          ['Hi! This is Bitcoin Nail Bar, I can help with pricing.', false],
          ['How much is a gel manicure?', true],
          ['A Gel Manicure is $35 and takes about 60 minutes. If you\'d like to add nail art, your tech will quote it before starting.', false]
        ],
        hours: [
          ['Bitcoin Nail Bar, how can I help you today?', false],
          ['What time are you open until today?', true],
          ['We\'re open today from 9:30 AM to 7:00 PM. I can book you right now if you\'d like.', false]
        ],
        miss: [
          ['A customer calls while the salon is busy.', true],
          ['The AI logs the missed call and automatically sends a text: "Sorry we missed your call! Tap here to book in seconds."', false]
        ],
        human: [
          ['I\'d like to talk to the owner about a party for 6.', true],
          ['Of course! I\'ll brief the owner before connecting you, so you won\'t have to explain it all over again.', false]
        ]
      };

      bubbles.innerHTML = scenarios[type].map(function(item) {
        return '<div class="voice-bubble' + (item[1] ? ' in' : '') + '">' + item[0] + '</div>';
      }).join('');

      document.querySelectorAll('[data-voice-scenario]').forEach(function(button) {
        button.classList.toggle('is-active', button.dataset.voiceScenario === type);
      });
    }

    function selectServicePlan(plan) {
      var labels = {
        Starter: 'Choose Starter',
        Pro: 'Start 14-Day Free Trial',
        Elite: 'Choose Elite'
      };

      document.querySelectorAll('[data-plan-card]').forEach(function(card) {
        card.classList.toggle('is-selected', card.dataset.planCard === plan.toLowerCase());
      });

      document.querySelectorAll('[data-plan-select]').forEach(function(button) {
        var selected = button.dataset.planSelect === plan;
        button.classList.toggle('is-primary', selected);
        button.textContent = selected ? plan + ' selected' : labels[button.dataset.planSelect];
      });
    }

    function openTrialModal() {
      var modal = document.querySelector('[data-trial-modal]');
      if (!modal) return;

      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      showTrialStep('form');

      var email = modal.querySelector('[data-trial-email]');
      if (email) email.focus();
    }

    function closeTrialModal() {
      var modal = document.querySelector('[data-trial-modal]');
      if (!modal) return;

      modal.hidden = true;
      document.body.style.overflow = '';
    }

    function showTrialStep(stepName) {
      document.querySelectorAll('[data-trial-step]').forEach(function(step) {
        step.hidden = step.dataset.trialStep !== stepName;
      });
    }

    function submitTrialForm() {
      var modal = document.querySelector('[data-trial-modal]');
      if (!modal) return;

      var email = modal.querySelector('[data-trial-email]');
      var emailValue = email ? email.value.trim() : '';
      if (!emailValue || emailValue.indexOf('@') < 0) {
        if (email) email.focus();
        return;
      }

      var emailShow = modal.querySelector('[data-trial-email-show]');
      if (emailShow) emailShow.textContent = emailValue;
      showTrialStep('email');
    }

    function activateTrialAccount() {
      var status = document.querySelector('[data-trial-status]');
      if (status) {
        status.innerHTML = '<span style="color: var(--nexora-success); font-weight: 700;">Account activated. Your 14-day trial has started.</span>';
      }
    }

    function setSettingsStatus(message) {
      var status = document.querySelector('[data-settings-status]');
      if (status) {
        status.textContent = message;
      }
    }

    var PROMO_TEMPLATES = {
      'reward-yourself': {
        label: 'Promotion 1: Reward Yourself',
        text: [
          'Promotion 1: Reward Yourself',
          'Offer: Free $25 e-gift card.',
          'Eligibility: Book any pedicure service of $55 or more.',
          'Availability: Monday–Saturday, by appointment only.',
          'Rules: One free $25 e-gift card per qualifying visit. For future services only, not redeemable for cash, and cannot be used for gratuity. Cannot combine with other promotions, discounts, coupons, rewards, or special offers. One promotional offer per customer per visit.',
          'General rule: The salon may modify or end any promotion at any time.'
        ].join('\n')
      }
    };

    function updatePromoCount() {
      var textarea = document.querySelector('[data-settings-promo]');
      var counter = document.querySelector('[data-promo-count]');
      if (!textarea || !counter) return;

      var max = parseInt(textarea.getAttribute('maxlength'), 10) || 1000;
      var len = textarea.value.length;
      counter.textContent = len;
      var wrap = counter.closest('.settings-promo-count');
      if (wrap) wrap.classList.toggle('is-max', len >= max);
    }

    function fillPromoTemplate(key) {
      var template = PROMO_TEMPLATES[key];
      var textarea = document.querySelector('[data-settings-promo]');
      if (!template || !textarea) return;

      var max = parseInt(textarea.getAttribute('maxlength'), 10) || 1000;
      textarea.value = template.text.slice(0, max);
      textarea.focus();
      updatePromoCount();
      setSettingsStatus('Promotion template filled in: ' + template.label + '. Edit it for your salon, then click Save.');
    }

    function addSettingsServiceRow(name, price, duration) {
      var list = document.querySelector('.settings-service-list');
      if (!list) return;

      var row = document.createElement('div');
      row.className = 'settings-service-row';
      row.setAttribute('data-service-row', '');
      row.innerHTML = '' +
        '<div class="settings-service-edit-grid">' +
          '<span class="settings-service-visual tone-violet" aria-hidden="true">✨</span>' +
          '<input class="settings-service-input" type="text" value="' + name + '" aria-label="Service name">' +
          '<div class="settings-service-input-wrap">' +
            '<span class="settings-service-prefix">$</span>' +
            '<input class="settings-service-input price" type="number" value="' + price + '" aria-label="Service price">' +
          '</div>' +
          '<div class="settings-service-input-wrap">' +
            '<input class="settings-service-input duration" type="number" value="' + duration + '" aria-label="Service duration">' +
            '<span class="settings-service-suffix">min</span>' +
          '</div>' +
          '<button class="settings-service-remove" type="button" data-service-remove aria-label="Remove service">×</button>' +
        '</div>';
      list.appendChild(row);
      setSettingsStatus('Service added: ' + name + '.');
    }

    function showServiceScanPanel() {
      var panel = document.querySelector('[data-service-scan]');
      var progress = document.querySelector('[data-service-scan-progress]');
      if (!panel || !progress) return;

      panel.hidden = false;
      progress.innerHTML = '✓ Open camera / upload menu photo<br>✓ AI reads the menu photo<br>✓ Detects service names, prices, and durations<br>✓ Adds new services to the list below';
      setSettingsStatus('Menu scan flow ready.');
    }

    function toggleServiceSuggestPanel() {
      var panel = document.querySelector('[data-service-suggest]');
      if (!panel) return;

      panel.hidden = !panel.hidden;
      setSettingsStatus(panel.hidden ? 'Industry suggestions hidden.' : 'Industry suggestions opened.');
    }

    function runSettingsAction(action) {
      if (action === 'photo') {
        showServiceScanPanel();
        return;
      }

      if (action === 'suggest') {
        toggleServiceSuggestPanel();
        return;
      }

      if (action === 'add-service') {
        addSettingsServiceRow('New service', 30, 45);
        return;
      }

      if (action === 'preview') {
        setSettingsStatus('Playing an AI Voice greeting preview.');
        return;
      }

      if (action === 'save') {
        setSettingsStatus('Settings saved. AI Voice, SMS, LP, Schema, and Booking Book are all in sync.');
      }
    }

    function filterSettingsTemplates(filter, activeButton) {
      document.querySelectorAll('[data-template-filter]').forEach(function(button) {
        button.classList.toggle('is-active', button === activeButton);
      });

      document.querySelectorAll('[data-template-cat]').forEach(function(card) {
        card.hidden = filter !== 'all' && card.dataset.templateCat !== filter;
      });

      setSettingsStatus(filter === 'all' ? 'Showing all promotion templates.' : 'Filtered templates: ' + activeButton.textContent.trim() + '.');
    }

    function toggleSettingsCollapse(button) {
      if (!button) return;

      var section = button.closest('.settings-card, .settings-template-library, .settings-subsection');
      if (!section) return;

      var isCollapsed = section.classList.toggle('is-collapsed');
      button.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      button.setAttribute('aria-label', isCollapsed ? 'Expand this section' : 'Collapse this section');
    }

    function syncFirstCallSmsToggle(toggle) {
      if (!toggle) return;

      var enabled = toggle.classList.contains('is-on');
      toggle.setAttribute('aria-checked', enabled ? 'true' : 'false');
      toggle.setAttribute('aria-label', enabled ? 'Disable first-call SMS' : 'Enable first-call SMS');
      var label = document.querySelector('[data-settings-first-call-sms-toggle-label]');
      if (label) {
        label.textContent = enabled ? 'On · Auto send' : 'Off';
        label.classList.toggle('is-off', !enabled);
      }
    }

    var settingsLanguageGreetings = {
      auto: 'Hi! Thanks for calling Bitcoin Nail Bar. I\'m your bilingual AI assistant — I can help you book an appointment, check pricing, or answer questions in English or Vietnamese. How can I help today?',
      vi: 'Hi! Thanks for calling Bitcoin Nail Bar. I\'m your AI assistant — I can help you book an appointment, check pricing, or answer questions. How can I help today?',
      en: 'Hello! Thank you for calling Bitcoin Nail Bar. This is the AI assistant. I can help you book an appointment, check prices, or answer questions. How can I help today?'
    };

    var settingsLanguageStatusText = {
      auto: 'Auto is on: the AI automatically detects Vietnamese or English when a customer calls.',
      vi: 'Vietnamese is active: the AI greets and answers customers in Vietnamese first.',
      en: 'English is active: AI greets and answers customers in English.'
    };

    var settingsLanguageLabels = {
      auto: 'VI + EN Auto',
      vi: 'VI',
      en: 'EN'
    };

    function selectSettingsLanguage(button) {
      if (!button) return;

      var language = button.dataset.settingsLanguage || 'auto';
      document.querySelectorAll('[data-settings-language]').forEach(function(item) {
        var active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      var greeting = document.querySelector('[data-settings-greeting]');
      if (greeting && settingsLanguageGreetings[language]) {
        greeting.value = settingsLanguageGreetings[language];
      }

      var status = document.querySelector('[data-settings-language-status]');
      if (status && settingsLanguageStatusText[language]) {
        status.textContent = settingsLanguageStatusText[language];
      }

      setSettingsStatus('AI language set to: ' + (settingsLanguageLabels[language] || button.textContent.trim()) + '.');
    }

    function textFrom(root, selector) {
      var element = root ? root.querySelector(selector) : null;
      return element ? element.textContent.trim() : '';
    }

    function setOfferField(name, value) {
      var field = document.querySelector('[data-offer-field="' + name + '"]');
      if (field) field.value = value || '';
    }

    function getOfferField(name) {
      var field = document.querySelector('[data-offer-field="' + name + '"]');
      return field ? field.value.trim() : '';
    }

    function categoryLabel(category) {
      var labels = {
        holiday: 'Holiday',
        fill: 'Fill Slots',
        growth: 'Grow Traffic',
        group: 'Group'
      };
      return labels[category] || category || 'Custom';
    }

    function parseSettingsTemplateCard(card) {
      var codeLine = textFrom(card, '.settings-template-code');
      var codeParts = codeLine.split('·').map(function(part) {
        return part.trim();
      });
      var category = card.dataset.templateCat || '';

      return {
        name: textFrom(card, '.settings-template-name'),
        code: codeParts[0] || '',
        value: codeParts.slice(1).join(' · '),
        category: categoryLabel(category),
        channel: category === 'fill' ? 'SMS Campaign' : 'QR, SMS Journey, Campaign',
        status: 'Template',
        used: '-',
        expiry: 'Set on save',
        description: textFrom(card, '.settings-template-desc'),
        result: textFrom(card, '.settings-template-effect').replace(/^🎯\s*/, '')
      };
    }

    function parseSettingsOfferCard(card) {
      var nameEl = card ? card.querySelector('.settings-offer-name') : null;
      var value = textFrom(nameEl, 'span');
      var name = '';
      var desc = textFrom(card, '.settings-offer-desc');
      var usedMatch = desc.match(/Used:\s*([^·]+)/);
      var expiryMatch = desc.match(/Expires:\s*(.+)$/);
      var channels = Array.from(card ? card.querySelectorAll('.settings-offer-tags .badge') : []).map(function(tag) {
        return tag.textContent.trim();
      }).filter(Boolean).join(', ');
      var toggle = card ? card.querySelector('.toggle-pill') : null;

      if (nameEl) {
        Array.from(nameEl.childNodes).forEach(function(node) {
          if (node.nodeType === Node.TEXT_NODE) name += node.textContent;
        });
      }

      return {
        name: name.trim(),
        code: name.trim().toUpperCase().replace(/\s+/g, ''),
        value: value,
        category: channels || 'Offer',
        channel: channels,
        status: toggle && toggle.classList.contains('is-on') ? 'Active' : 'Paused',
        used: usedMatch ? usedMatch[1].trim() : '',
        expiry: expiryMatch ? expiryMatch[1].trim() : '',
        description: desc.replace(/\s*·\s*Used:.*/, ''),
        result: card && card.classList.contains('is-muted') ? 'Paused' : 'Running on the selected channels'
      };
    }

    function openSettingsOfferModal(source, mode) {
      var modal = document.querySelector('[data-offer-modal]');
      if (!modal) return;

      var data = source && source.nodeType === 1
        ? (mode === 'edit' ? parseSettingsOfferCard(source) : parseSettingsTemplateCard(source))
        : (source || {});
      var title = document.querySelector('[data-offer-modal-title]');
      var sub = document.querySelector('[data-offer-modal-sub]');
      var saveButton = document.querySelector('[data-offer-modal-save]');

      modal.dataset.offerMode = mode || 'template';
      modal.hidden = false;

      if (title) {
        title.textContent = mode === 'edit'
          ? 'Edit running offer'
          : (mode === 'create' ? 'Create new offer' : 'Auto-fill from promotion template');
      }
      if (sub) {
        sub.textContent = mode === 'edit'
          ? 'Offer details filled from the running item.'
          : (mode === 'create' ? 'Enter the new offer details, then Save.' : 'Template details are pre-filled. Make quick edits, then Save.');
      }
      if (saveButton) saveButton.textContent = mode === 'edit' ? 'Save Changes' : 'Save';

      setOfferField('name', data.name);
      setOfferField('code', data.code);
      setOfferField('value', data.value);
      setOfferField('category', data.category);
      setOfferField('channel', data.channel);
      setOfferField('status', data.status);
      setOfferField('used', data.used);
      setOfferField('expiry', data.expiry);
      setOfferField('description', data.description);
      setOfferField('result', data.result);

      var firstField = document.querySelector('[data-offer-field="name"]');
      if (firstField) firstField.focus();
    }

    function closeSettingsOfferModal() {
      var modal = document.querySelector('[data-offer-modal]');
      if (modal) modal.hidden = true;
    }

    function saveSettingsOfferModal() {
      var modal = document.querySelector('[data-offer-modal]');
      var mode = modal ? modal.dataset.offerMode : 'template';
      var name = getOfferField('name') || 'Offer';
      setSettingsStatus(mode === 'edit' ? 'Changes saved: ' + name + '.' : 'Offer saved from template: ' + name + '.');
      closeSettingsOfferModal();
    }

    function settingsAddressValue(name) {
      var field = document.querySelector('[data-settings-address-field="' + name + '"]');
      return field ? field.value.trim().toUpperCase() : '';
    }

    function detectSettingsTimeZone() {
      var country = settingsAddressValue('country');
      var state = settingsAddressValue('state');
      var city = settingsAddressValue('city');

      if (country === 'VN') return 'Asia/Ho_Chi_Minh';

      if (country === 'CA') {
        if (/^(BC|BRITISH COLUMBIA)$/.test(state)) return 'America/Vancouver';
        if (/^(AB|ALBERTA|SK|SASKATCHEWAN)$/.test(state)) return 'America/Edmonton';
        if (/^(MB|MANITOBA)$/.test(state)) return 'America/Winnipeg';
        return 'America/Toronto';
      }

      if (country === 'MX') {
        if (/TIJUANA|BAJA CALIFORNIA/.test(city + ' ' + state)) return 'America/Tijuana';
        return 'America/Mexico_City';
      }

      var stateTimeZones = [
        { timeZone: 'America/Los_Angeles', states: ['CA', 'CALIFORNIA', 'NV', 'NEVADA', 'OR', 'OREGON', 'WA', 'WASHINGTON'] },
        { timeZone: 'America/Denver', states: ['AZ', 'ARIZONA', 'CO', 'COLORADO', 'ID', 'IDAHO', 'MT', 'MONTANA', 'NM', 'NEW MEXICO', 'UT', 'UTAH', 'WY', 'WYOMING'] },
        { timeZone: 'America/New_York', states: ['CT', 'CONNECTICUT', 'DE', 'DELAWARE', 'FL', 'FLORIDA', 'GA', 'GEORGIA', 'ME', 'MAINE', 'MD', 'MARYLAND', 'MA', 'MASSACHUSETTS', 'NH', 'NEW HAMPSHIRE', 'NJ', 'NEW JERSEY', 'NY', 'NEW YORK', 'NC', 'NORTH CAROLINA', 'OH', 'OHIO', 'PA', 'PENNSYLVANIA', 'RI', 'RHODE ISLAND', 'SC', 'SOUTH CAROLINA', 'VT', 'VERMONT', 'VA', 'VIRGINIA', 'WV', 'WEST VIRGINIA'] },
        { timeZone: 'America/Chicago', states: ['AL', 'ALABAMA', 'AR', 'ARKANSAS', 'IA', 'IOWA', 'IL', 'ILLINOIS', 'KS', 'KANSAS', 'KY', 'KENTUCKY', 'LA', 'LOUISIANA', 'MN', 'MINNESOTA', 'MS', 'MISSISSIPPI', 'MO', 'MISSOURI', 'NE', 'NEBRASKA', 'ND', 'NORTH DAKOTA', 'OK', 'OKLAHOMA', 'SD', 'SOUTH DAKOTA', 'TN', 'TENNESSEE', 'TX', 'TEXAS', 'WI', 'WISCONSIN'] }
      ];

      for (var index = 0; index < stateTimeZones.length; index += 1) {
        if (stateTimeZones[index].states.indexOf(state) !== -1) return stateTimeZones[index].timeZone;
      }

      return 'America/Chicago';
    }

    function syncSettingsTimeZoneFromAddress() {
      var timeZoneSelect = document.querySelector('[data-settings-timezone]');
      if (!timeZoneSelect || timeZoneSelect.dataset.timezoneManual === 'true') return;

      var detectedTimeZone = detectSettingsTimeZone();
      var hasOption = Array.from(timeZoneSelect.options).some(function(option) {
        return option.value === detectedTimeZone;
      });
      if (!hasOption) return;

      timeZoneSelect.value = detectedTimeZone;
      timeZoneSelect.dataset.timezoneAuto = 'true';
      var status = document.querySelector('[data-settings-timezone-status]');
      if (status) status.textContent = 'Auto-detected from salon address';
    }

    function syncSettingsHourRow(toggle) {
      var row = toggle.closest('.settings-hour-row');
      if (!row) return;

      var isOpen = toggle.checked;
      row.classList.toggle('is-closed', !isOpen);
      row.querySelectorAll('.settings-hour-input').forEach(function(input) {
        input.disabled = !isOpen;
      });

      setSettingsStatus('Updated hours for ' + row.querySelector('.settings-hour-toggle span').textContent + '.');
    }
    document.querySelectorAll('[data-subtab-target]').forEach(function(tab) {
      tab.addEventListener('click', function() {
        activateSubTab(tab.dataset.subtabTarget);
      });
    });

    document.querySelectorAll('[data-booking-subtab-target]').forEach(function(tab) {
      tab.addEventListener('click', function() {
        activateBookingSubTab(tab.dataset.bookingSubtabTarget);
      });
    });

    var bookingSearchField = document.querySelector('[data-booking-search-field]');
    if (bookingSearchField) {
      bookingSearchField.addEventListener('change', function() {
        updateBookingSearchPlaceholder();
        filterBookingItems();
      });
    }

    var bookingSearchInput = document.querySelector('[data-booking-search-input]');
    if (bookingSearchInput) {
      bookingSearchInput.addEventListener('input', filterBookingItems);
    }

    var bookingDatePickerConfig = {
      altInput: true,
      altFormat: 'M j, Y',
      dateFormat: 'Y-m-d',
      altInputClass: 'booking-input',
      disableMobile: true,
      onChange: filterBookingItems
    };

    var bookingDateFrom = document.querySelector('[data-booking-date-from]');
    if (bookingDateFrom) {
      if (window.flatpickr) {
        bookingDateFromPicker = flatpickr(bookingDateFrom, bookingDatePickerConfig);
      } else {
        bookingDateFrom.addEventListener('change', filterBookingItems);
      }
    }

    var bookingDateTo = document.querySelector('[data-booking-date-to]');
    if (bookingDateTo) {
      if (window.flatpickr) {
        bookingDateToPicker = flatpickr(bookingDateTo, bookingDatePickerConfig);
      } else {
        bookingDateTo.addEventListener('change', filterBookingItems);
      }
    }

    var custBirthdayInput = document.querySelector('[data-cf-birthday]');
    var custBirthdayPicker = null;
    if (custBirthdayInput && window.flatpickr) {
      custBirthdayPicker = flatpickr(custBirthdayInput, {
        altInput: true,
        altFormat: 'M j, Y',
        dateFormat: 'Y-m-d',
        altInputClass: 'booking-input',
        disableMobile: true
      });
    }

    var bookingClearFilters = document.querySelector('[data-booking-clear-filters]');
    if (bookingClearFilters) {
      bookingClearFilters.addEventListener('click', clearBookingFilters);
    }

    document.querySelectorAll('[data-booking-status-chip]').forEach(function(chip) {
      chip.addEventListener('click', function() {
        setBookingStatusFilter(chip.dataset.bookingStatusChip);
      });
    });

    document.querySelectorAll('[data-tech-day-off]').forEach(function(dayOff) {
      syncTechDayOffRow(dayOff);
      dayOff.addEventListener('change', function() {
        syncTechDayOffRow(dayOff);
      });
    });

    document.addEventListener('change', function(event) {
      if (event.target.matches('[data-tech-service-all]')) {
        document.querySelectorAll('[data-tech-service]').forEach(function(option) {
          option.checked = event.target.checked;
        });
        syncTechServiceCheckAll();
      } else if (event.target.matches('[data-tech-service]')) {
        syncTechServiceCheckAll();
      }
    });

    document.querySelectorAll('[data-booking-view-target]').forEach(function(button) {
      button.addEventListener('click', function() {
        setBookingViewMode(button.dataset.bookingViewTarget);
      });
    });

    var bookingCalendarPrev = document.querySelector('[data-booking-calendar-prev]');
    var bookingCalendarNext = document.querySelector('[data-booking-calendar-next]');
    var bookingCalendarToday = document.querySelector('[data-booking-calendar-today]');
    var bookingCalendarAdd = document.querySelector('[data-booking-calendar-add]');
    if (bookingCalendarAdd) bookingCalendarAdd.addEventListener('click', function() {
      openBookingNewAppointment();
    });
    if (bookingCalendarPrev) bookingCalendarPrev.addEventListener('click', function() {
      var previous = new Date(bookingCalendarDate + 'T12:00:00'); previous.setDate(previous.getDate() - 1);
      setBookingCalendarDate(previous);
    });
    if (bookingCalendarNext) bookingCalendarNext.addEventListener('click', function() {
      var next = new Date(bookingCalendarDate + 'T12:00:00'); next.setDate(next.getDate() + 1);
      setBookingCalendarDate(next);
    });
    if (bookingCalendarToday) bookingCalendarToday.addEventListener('click', function() {
      setBookingCalendarDate(new Date(BOOKING_TODAY_DATE + 'T12:00:00'));
    });

    var bookingCreateSave = document.querySelector('[data-booking-create-save]');
    if (bookingCreateSave) bookingCreateSave.addEventListener('click', saveBookingFromCalendar);

    document.addEventListener('click', function(event) {
      var bookingServiceCategorySummary = event.target.closest('summary.booking-service-category-head');
      if (bookingServiceCategorySummary) {
        event.preventDefault();
        var bookingServiceCategory = bookingServiceCategorySummary.parentElement;
        bookingServiceCategory.open = !bookingServiceCategory.open;
        return;
      }

      var bookingServiceChip = event.target.closest('[data-booking-create-service]');
      if (bookingServiceChip) {
        var bookingServiceField = bookingCreateField('service');
        if (bookingServiceField && bookingServiceField.contains(bookingServiceChip)) {
          setBookingCreateServiceSelected(bookingServiceChip, !bookingServiceChip.classList.contains('is-selected'));
          updateBookingCreateServiceSummary();
          setBookingCreateError('');
        }
        return;
      }

      var bookingPanelTicketService = event.target.closest('[data-booking-panel-ticket-service]');
      if (bookingPanelTicketService) {
        bookingPanelSelectedServiceId = bookingPanelTicketService.getAttribute('data-booking-panel-ticket-service') || '';
        var ticketPicker = bookingPanelTicketService.closest('[data-booking-ticket-picker]');
        var serviceInput = ticketPicker && ticketPicker.querySelector('[data-booking-panel-ticket-service-search]');
        if (serviceInput) serviceInput.value = bookingPanelTicketService.dataset.serviceName || '';
        var serviceResults = ticketPicker && ticketPicker.querySelector('[data-booking-panel-ticket-service-results]');
        if (serviceResults) serviceResults.hidden = true;
        return;
      }

      var bookingPanelTicketTech = event.target.closest('[data-booking-panel-ticket-tech]');
      if (bookingPanelTicketTech) {
        bookingPanelSelectedTechId = bookingPanelTicketTech.getAttribute('data-booking-panel-ticket-tech') || null;
        bookingPanelSelectedTechName = bookingPanelTicketTech.dataset.techName || 'Anyone';
        var techPicker = bookingPanelTicketTech.closest('[data-booking-ticket-picker]');
        var techInput = techPicker && techPicker.querySelector('[data-booking-panel-ticket-tech-search]');
        if (techInput) techInput.value = bookingPanelSelectedTechName;
        if (techPicker) {
          techPicker.querySelectorAll('[data-booking-panel-ticket-tech]').forEach(function(button) { button.classList.toggle('is-selected', button === bookingPanelTicketTech); });
          var techResults = techPicker.querySelector('[data-booking-panel-ticket-tech-results]');
          if (techResults) techResults.hidden = true;
        }
        return;
      }

      if (event.target.closest('[data-booking-panel-ticket-add]')) {
        var option = BOOKING_CALENDAR_SERVICE_OPTIONS.find(function(service) { return String(service.serviceId) === String(bookingPanelSelectedServiceId); });
        if (!option) { bookingPanelSetWarning('Search and select a service first.'); return; }
        if (bookingPanelTickets.some(function(ticket) { return String(ticket.serviceId) === String(option.serviceId); })) { bookingPanelSetWarning('This service is already in the order.'); return; }
        bookingPanelTickets.push({ id: 'ticket-' + (bookingPanelTickets.length + 1), serviceId: option.serviceId, serviceName: option.name, price: option.price, durationMin: option.duration, technicianId: bookingPanelSelectedTechId, technicianName: bookingPanelSelectedTechName, status: bookingPanelDraft ? bookingPanelDraft.status : 'confirmed' });
        bookingPanelSelectedServiceId = ''; bookingPanelSelectedTechId = null; bookingPanelSelectedTechName = 'Anyone'; bookingPanelWarning = '';
        renderBookingAppointmentPanel();
        return;
      }

      var removeBookingPanelTicket = event.target.closest('[data-booking-panel-ticket-remove]');
      if (removeBookingPanelTicket) {
        bookingPanelTickets.splice(Number(removeBookingPanelTicket.getAttribute('data-booking-panel-ticket-remove')), 1);
        renderBookingAppointmentPanel();
        return;
      }

      var bookingCreateTicketService = event.target.closest('[data-booking-create-ticket-service]');
      if (bookingCreateTicketService) {
        bookingCreateSelectedServiceId = bookingCreateTicketService.getAttribute('data-booking-create-ticket-service') || '';
        var createPicker = bookingCreateTicketService.closest('[data-booking-create-ticket-picker]');
        var createServiceInput = createPicker && createPicker.querySelector('[data-booking-create-ticket-service-search]');
        if (createServiceInput) createServiceInput.value = bookingCreateTicketService.dataset.serviceName || '';
        var createServiceResults = createPicker && createPicker.querySelector('[data-booking-create-ticket-service-results]');
        if (createServiceResults) createServiceResults.hidden = true;
        return;
      }

      var bookingCreateTicketTech = event.target.closest('[data-booking-create-ticket-tech]');
      if (bookingCreateTicketTech) {
        bookingCreateSelectedTechId = bookingCreateTicketTech.getAttribute('data-booking-create-ticket-tech') || null;
        bookingCreateSelectedTechName = bookingCreateTicketTech.dataset.techName || 'Anyone';
        var createTechPicker = bookingCreateTicketTech.closest('[data-booking-create-ticket-picker]');
        var createTechInput = createTechPicker && createTechPicker.querySelector('[data-booking-create-ticket-tech-search]');
        if (createTechInput) createTechInput.value = bookingCreateSelectedTechName;
        if (createTechPicker) {
          createTechPicker.querySelectorAll('[data-booking-create-ticket-tech]').forEach(function(button) { button.classList.toggle('is-selected', button === bookingCreateTicketTech); });
          var createTechResults = createTechPicker.querySelector('[data-booking-create-ticket-tech-results]');
          if (createTechResults) createTechResults.hidden = true;
        }
        return;
      }

      if (event.target.closest('[data-booking-create-ticket-add]')) {
        var createOption = BOOKING_CALENDAR_SERVICE_OPTIONS.find(function(service) { return String(service.serviceId) === String(bookingCreateSelectedServiceId); });
        if (!createOption) { setBookingCreateError('Search and select a service first.'); return; }
        if (bookingCreateTickets.some(function(ticket) { return String(ticket.serviceId) === String(createOption.serviceId); })) { setBookingCreateError('This service is already in the order.'); return; }
        bookingCreateTickets.push({ id: 'ticket-' + (bookingCreateTickets.length + 1), serviceId: createOption.serviceId, serviceName: createOption.name, price: createOption.price, durationMin: createOption.duration, technicianId: bookingCreateSelectedTechId, technicianName: bookingCreateSelectedTechName, status: 'confirmed' });
        bookingCreateSelectedServiceId = ''; bookingCreateSelectedTechId = null; bookingCreateSelectedTechName = 'Anyone';
        setBookingCreateError('');
        renderBookingCreateTicketPicker();
        updateBookingCreateServiceSummary();
        return;
      }

      var bookingCreateTicketRemove = event.target.closest('[data-booking-create-ticket-remove]');
      if (bookingCreateTicketRemove) {
        bookingCreateTickets.splice(Number(bookingCreateTicketRemove.getAttribute('data-booking-create-ticket-remove')), 1);
        renderBookingCreateTicketPicker();
        updateBookingCreateServiceSummary();
        return;
      }

      var bookingFilterToggle = event.target.closest('[data-booking-filter-toggle]');
      if (bookingFilterToggle) {
        var filterScope = bookingFilterToggle.dataset.bookingFilterToggle;
        setBookingFilterOpen(bookingFilterOpen === filterScope ? null : filterScope);
        return;
      }

      if (!event.target.closest('[data-booking-filter-menu]')) {
        setBookingFilterOpen(null);
      }

      var bookingPanelService = event.target.closest('[data-booking-panel-select="service"]');
      if (bookingPanelService) {
        bookingPanelSyncDraft();
        var serviceName = bookingPanelService.dataset.serviceName;
        if (bookingPanelServices[serviceName]) delete bookingPanelServices[serviceName];
        else bookingPanelServices[serviceName] = 1;
        bookingPanelWarning = '';
        renderBookingAppointmentPanel();
        return;
      }

      var bookingPanelAction = event.target.closest('[data-booking-panel-action]');
      if (bookingPanelAction) {
        var panelActionName = bookingPanelAction.dataset.bookingPanelAction;
        if (panelActionName === 'close') closeBookingAppointmentPanel();
        else if (panelActionName === 'save') saveBookingAppointmentPanel();
        else if (panelActionName === 'send-sms') sendBookingPanelSms();
        else if (panelActionName === 'done') setBookingPanelStatus('done');
        else if (panelActionName === 'noshow') setBookingPanelStatus('noshow');
        else if (panelActionName === 'cancel') cancelBookingPanelAppointment();
        return;
      }

      var bookingAction = event.target.closest('[data-booking-action]');
      if (bookingAction) {
        var item = findBookingItemFromAction(bookingAction);
        var detailModal = bookingAction.closest('[data-booking-detail-modal]');
        if (bookingAction.dataset.bookingAction === 'send-sms') {
          sendBookingSms(item);
        } else if (bookingAction.dataset.bookingAction === 'done') {
          completeBookingItem(item);
        } else if (bookingAction.dataset.bookingAction === 'noshow') {
          markBookingNoShow(item);
        } else if (bookingAction.dataset.bookingAction === 'detail') {
          openBookingAppointmentPanel(item);
        }
        if (detailModal && item && (bookingAction.dataset.bookingAction === 'done' || bookingAction.dataset.bookingAction === 'noshow')) {
          openBookingDetailModal(item);
        }
      }

      var jump = event.target.closest('[data-tab-jump]');
      if (jump) {
        activateMainTab(jump.dataset.tabJump);
      }

      var techModalOpen = event.target.closest('[data-tech-modal-open]');
      if (techModalOpen) {
        openNewTechModal();
        return;
      }

      var techDetailOpen = event.target.closest('[data-tech-detail-open]');
      if (techDetailOpen) {
        openTechDetailFromCard(techDetailOpen);
        return;
      }

      var techCombobox = event.target.closest('[data-tech-combobox]');
      if (techCombobox && !event.target.closest('[data-tech-choice]')) {
        setTechSelectOpen(true);
      }

      var techChoice = event.target.closest('[data-tech-choice], [data-tech-create]');
      if (techChoice) {
        fillTechModalFromChoice(techChoice);
        return;
      }

      var techModalSave = event.target.closest('[data-tech-modal-save]');
      if (techModalSave) {
        saveTechModal();
        return;
      }

      var bookingDetailClose = event.target.closest('[data-booking-detail-close]');
      if (bookingDetailClose || event.target.matches('[data-booking-detail-modal]')) {
        closeBookingDetailModal();
        return;
      }

      var bookingCreateClose = event.target.closest('[data-booking-create-close]');
      if (bookingCreateClose) {
        closeBookingCreateModal();
        return;
      }

      var techModalClose = event.target.closest('[data-tech-modal-close]');
      if (techModalClose || event.target.matches('[data-tech-modal]')) {
        closeTechModal();
        return;
      }

      var techModal = document.querySelector('[data-tech-modal]');
      if (techModal && !techModal.hidden && !event.target.closest('[data-tech-combobox]')) {
        setTechSelectOpen(false);
      }

      var promoFill = event.target.closest('[data-promo-fill]');
      if (promoFill) {
        fillPromoTemplate(promoFill.dataset.promoFill);
        return;
      }

      var settingsAction = event.target.closest('[data-settings-action]');
      if (settingsAction) {
        runSettingsAction(settingsAction.dataset.settingsAction, settingsAction);
      }

      var settingsCollapse = event.target.closest('[data-settings-collapse]');
      if (settingsCollapse) {
        toggleSettingsCollapse(settingsCollapse);
        return;
      }

      var settingsFilter = event.target.closest('[data-template-filter]');
      if (settingsFilter) {
        filterSettingsTemplates(settingsFilter.dataset.templateFilter, settingsFilter);
      }

      var offerTemplate = event.target.closest('[data-offer-template-open]');
      if (offerTemplate) {
        openSettingsOfferModal(offerTemplate, 'template');
        return;
      }

      var offerEdit = event.target.closest('[data-offer-edit-open]');
      if (offerEdit) {
        openSettingsOfferModal(offerEdit.closest('.settings-offer-card'), 'edit');
        return;
      }

      var offerModalSave = event.target.closest('[data-offer-modal-save]');
      if (offerModalSave) {
        saveSettingsOfferModal();
        return;
      }

      var offerModalClose = event.target.closest('[data-offer-modal-close]');
      if (offerModalClose || event.target.matches('[data-offer-modal]')) {
        closeSettingsOfferModal();
        return;
      }

      var settingsLanguage = event.target.closest('[data-settings-language]');
      if (settingsLanguage) {
        selectSettingsLanguage(settingsLanguage);
      }

      var serviceSuggest = event.target.closest('[data-service-suggest-add]');
      if (serviceSuggest) {
        addSettingsServiceRow(serviceSuggest.dataset.name, serviceSuggest.dataset.price, serviceSuggest.dataset.duration);
        serviceSuggest.hidden = true;
      }

      var serviceRemove = event.target.closest('[data-service-remove]');
      if (serviceRemove) {
        var serviceRow = serviceRemove.closest('[data-service-row]');
        if (serviceRow) serviceRow.remove();
        setSettingsStatus('Removed the service from the list.');
      }

      var trialChip = event.target.closest('[data-trial-chip], [data-trial-day]');
      if (trialChip) {
        trialChip.classList.toggle('is-active');
      }
    });

    document.addEventListener('input', function(event) {
      var createTicketServiceSearch = event.target.closest('[data-booking-create-ticket-service-search]');
      if (createTicketServiceSearch) {
        filterBookingCreateTicketServices(createTicketServiceSearch);
        return;
      }
      var createTicketTechSearch = event.target.closest('[data-booking-create-ticket-tech-search]');
      if (createTicketTechSearch) {
        filterBookingCreateTicketTechs(createTicketTechSearch);
        return;
      }
      var panelTicketServiceSearch = event.target.closest('[data-booking-panel-ticket-service-search]');
      if (panelTicketServiceSearch) {
        filterBookingPanelTicketServices(panelTicketServiceSearch);
        return;
      }
      var panelTicketTechSearch = event.target.closest('[data-booking-panel-ticket-tech-search]');
      if (panelTicketTechSearch) {
        filterBookingPanelTicketTechs(panelTicketTechSearch);
        return;
      }
      var bookingServiceSearch = event.target.closest('[data-booking-service-search]');
      if (bookingServiceSearch) {
        filterBookingServicePicker(bookingServiceSearch);
        return;
      }
      var techSearch = event.target.closest('[data-tech-search]');
      if (techSearch) {
        filterTechChoices(techSearch.value);
        setTechSelectOpen(true);
      }
    });

    document.addEventListener('focusin', function(event) {
      var createTicketServiceSearch = event.target.closest('[data-booking-create-ticket-service-search]');
      if (createTicketServiceSearch) {
        createTicketServiceSearch.select();
        return;
      }
      var createTicketTechSearch = event.target.closest('[data-booking-create-ticket-tech-search]');
      if (createTicketTechSearch) {
        createTicketTechSearch.select();
        return;
      }
      var panelTicketServiceSearch = event.target.closest('[data-booking-panel-ticket-service-search]');
      if (panelTicketServiceSearch) {
        panelTicketServiceSearch.select();
        return;
      }
      var panelTicketTechSearch = event.target.closest('[data-booking-panel-ticket-tech-search]');
      if (panelTicketTechSearch) {
        panelTicketTechSearch.select();
        return;
      }
      var techSelectInput = event.target.closest('[data-tech-select-input]');
      if (techSelectInput) {
        setTechSelectOpen(true);
      }
    });

    document.addEventListener('keydown', function(event) {
      var modal = document.querySelector('[data-offer-modal]');
      var techModal = document.querySelector('[data-tech-modal]');
      var bookingDetailModal = document.querySelector('[data-booking-detail-modal]');
      var bookingCreateModal = document.querySelector('[data-booking-create-modal]');
      var techSelectMenu = document.querySelector('[data-tech-select-menu]');

      if (event.key === 'Escape' && bookingFilterOpen) {
        setBookingFilterOpen(null);
        return;
      }

      if (event.key === 'Escape' && techSelectMenu && !techSelectMenu.hidden) {
        setTechSelectOpen(false);
        return;
      }

      if (event.key === 'Escape' && bookingDetailModal && !bookingDetailModal.hidden) {
        closeBookingDetailModal();
        return;
      }

      if (event.key === 'Escape' && bookingCreateModal && !bookingCreateModal.hidden) {
        closeBookingCreateModal();
        return;
      }

      if (event.key === 'Escape' && techModal && !techModal.hidden) {
        closeTechModal();
        return;
      }

      if (event.key === 'Escape' && modal && !modal.hidden) {
        closeSettingsOfferModal();
        return;
      }

      if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-offer-template-open]')) {
        event.preventDefault();
        openSettingsOfferModal(event.target, 'template');
      }
    });

    document.querySelectorAll('[data-voice-scenario]').forEach(function(button) {
      button.addEventListener('click', function() {
        simulateVoiceScenario(button.dataset.voiceScenario);
      });
    });

    document.querySelectorAll('[data-plan-select]').forEach(function(button) {
      button.addEventListener('click', function() {
        if (button.hasAttribute('data-trial-open')) {
          openTrialModal();
          return;
        }

        if ((button.dataset.planSelect === 'Starter' || button.dataset.planSelect === 'Elite') && typeof window.openServicePlanPaymentModal === 'function') {
          window.openServicePlanPaymentModal(button.dataset.planSelect);
          return;
        }

        selectServicePlan(button.dataset.planSelect);
      });
    });

    document.querySelectorAll('[data-trial-close]').forEach(function(button) {
      button.addEventListener('click', closeTrialModal);
    });

    document.querySelectorAll('[data-settings-hour-toggle]').forEach(function(toggle) {
      toggle.addEventListener('change', function() {
        syncSettingsHourRow(toggle);
      });
    });

    document.querySelectorAll('[data-settings-address-field]').forEach(function(field) {
      field.addEventListener('input', syncSettingsTimeZoneFromAddress);
      field.addEventListener('change', syncSettingsTimeZoneFromAddress);
    });

    var settingsTimeZone = document.querySelector('[data-settings-timezone]');
    if (settingsTimeZone) {
      settingsTimeZone.addEventListener('change', function() {
        settingsTimeZone.dataset.timezoneManual = 'true';
        settingsTimeZone.dataset.timezoneAuto = 'false';
        var status = document.querySelector('[data-settings-timezone-status]');
        if (status) status.textContent = 'Manually selected';
        setSettingsStatus('Operating hours time zone set to ' + settingsTimeZone.options[settingsTimeZone.selectedIndex].text + '.');
      });
      syncSettingsTimeZoneFromAddress();
    }

    var trialModal = document.querySelector('[data-trial-modal]');
    if (trialModal) {
      trialModal.addEventListener('click', function(event) {
        if (event.target === trialModal) {
          closeTrialModal();
        }
      });
    }

    var trialSubmit = document.querySelector('[data-trial-submit]');
    if (trialSubmit) {
      trialSubmit.addEventListener('click', submitTrialForm);
    }

    var trialActivate = document.querySelector('[data-trial-activate]');
    if (trialActivate) {
      trialActivate.addEventListener('click', activateTrialAccount);
    }

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeTrialModal();
      }
    });

    document.querySelectorAll('.toggle-pill').forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        toggle.classList.toggle('is-on');
      });
    });

    document.querySelectorAll('[data-settings-first-call-sms-toggle]').forEach(function(toggle) {
      syncFirstCallSmsToggle(toggle);
      toggle.addEventListener('click', function() {
        syncFirstCallSmsToggle(toggle);
        setSettingsStatus('First-call SMS ' + (toggle.classList.contains('is-on') ? 'enabled' : 'disabled') + '.');
      });
    });

    /* ===== Customers (data ported from SMS dashboard) ===== */
    var CUSTOMERS = [
      { name: 'Linh Tran',      phone: '(832) 431-8827', seg: 'vip',   visits: 24, last: '05/07/2026', src: 'qr' },
      { name: 'Mai Nguyen',     phone: '(713) 552-0194', seg: 'vip',   visits: 31, last: '03/07/2026', src: 'receipt' },
      { name: 'Jessica Kim',    phone: '(832) 906-4471', seg: 'day15', visits: 8,  last: '22/06/2026', src: 'call' },
      { name: 'Hang Pham',      phone: '(281) 774-3358', seg: 'new',   visits: 1,  last: '01/07/2026', src: 'qr' },
      { name: 'Ashley Brown',   phone: '(832) 118-9902', seg: 'day30', visits: 5,  last: '06/06/2026', src: 'receipt' },
      { name: 'Thao Le',        phone: '(713) 662-8815', seg: 'day60', visits: 12, last: '02/05/2026', src: 'receipt' },
      { name: 'Maria Gonzalez', phone: '(832) 340-2276', seg: '',      visits: 9,  last: '18/06/2026', src: 'qr' },
      { name: 'Kim Dang',       phone: '(281) 907-5541', seg: 'day15', visits: 6,  last: '21/06/2026', src: 'call' },
      { name: 'Sarah Johnson',  phone: '(713) 225-7809', seg: 'new',   visits: 1,  last: '04/07/2026', src: 'qr' },
      { name: 'Ngoc Vu',        phone: '(832) 543-1120', seg: 'vip',   visits: 19, last: '30/06/2026', src: 'receipt' },
      { name: 'Emily Chen',     phone: '(281) 660-3387', seg: 'day30', visits: 4,  last: '04/06/2026', src: 'call' },
      { name: 'Trang Hoang',    phone: '(713) 889-4462', seg: 'day60', visits: 7,  last: '25/04/2026', src: 'receipt' },
      { name: 'Amanda Davis',   phone: '(832) 271-6693', seg: '',      visits: 11, last: '15/06/2026', src: 'qr' },
      { name: 'Quynh Bui',      phone: '(281) 435-9078', seg: 'new',   visits: 1,  last: '06/07/2026', src: 'call' },
      { name: 'Tiffany Vo',     phone: '(713) 508-2214', seg: 'day15', visits: 14, last: '23/06/2026', src: 'qr' }
    ];

    var CUST_SEGMENTS = [
      { id: 'new',      icon: 'bi-stars',          label: 'New',      color: '#2b59ff' },
      { id: 'day15',    icon: 'bi-calendar-event', label: '15 Days',  color: '#00b873' },
      { id: 'day30',    icon: 'bi-clock-history',  label: '30 Days',  color: '#7c3aed' },
      { id: 'day60',    icon: 'bi-fire',           label: '60 Days',  color: '#f59e0b' },
      { id: 'vip',      icon: 'bi-gem',            label: 'VIP',      color: '#db2777' }
    ];
    var CUST_SEG_MAP = {};
    CUST_SEGMENTS.forEach(function(s) { CUST_SEG_MAP[s.id] = s; });

    var CUST_SRC = {
      qr:      { icon: 'bi-qr-code',           label: 'QR' },
      receipt: { icon: 'bi-receipt',           label: 'Receipt' },
      call:    { icon: 'bi-telephone',         label: 'Incoming' },
      pos:     { icon: 'bi-box-arrow-in-down', label: 'Import' }
    };

    var custFilter = { search: '', seg: 'all' };

    function renderCustSegChips() {
      var wrap = document.querySelector('[data-cust-seg-filter]');
      if (!wrap) return;

      var counts = { all: CUSTOMERS.length };
      CUST_SEGMENTS.forEach(function(s) {
        counts[s.id] = CUSTOMERS.filter(function(c) { return c.seg === s.id; }).length;
      });

      var chips = [{ id: 'all', icon: '', label: 'All' }].concat(CUST_SEGMENTS);
      wrap.innerHTML = chips.map(function(s) {
        var isActive = custFilter.seg === s.id;
        var iconHtml = s.icon ? '<i class="bi ' + s.icon + '" aria-hidden="true" style="color:' + s.color + '"></i> ' : '';
        return '<button class="booking-status-chip' + (isActive ? ' is-active' : '') + '" type="button" data-cust-seg="' + s.id + '" aria-pressed="' + (isActive ? 'true' : 'false') + '">' +
          iconHtml + escapeHtml(s.label) + ' <span class="booking-status-chip-count">' + (counts[s.id] || 0) + '</span></button>';
      }).join('');
    }

    function renderCustomers() {
      var tbody = document.querySelector('[data-cust-tbody]');
      if (!tbody) return;

      var q = (custFilter.search || '').toLowerCase();
      var qDigits = q.replace(/\D/g, '');
      var rows = CUSTOMERS.filter(function(c) {
        var segOk = custFilter.seg === 'all' || c.seg === custFilter.seg;
        var searchOk = !q || c.name.toLowerCase().indexOf(q) !== -1 ||
          (qDigits && c.phone.replace(/\D/g, '').indexOf(qDigits) !== -1);
        return segOk && searchOk;
      });

      var countEl = document.querySelector('[data-cust-count]');
      if (countEl) countEl.textContent = rows.length + '/' + CUSTOMERS.length + ' customers';

      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="booking-empty-cell">No customers found</td></tr>';
        renderCustSegChips();
        return;
      }

      tbody.innerHTML = rows.map(function(c) {
        var seg = CUST_SEG_MAP[c.seg];
        var segHtml = seg
          ? '<span class="badge seg-badge" style="--seg:' + seg.color + '"><i class="bi ' + seg.icon + '" aria-hidden="true"></i> ' + escapeHtml(seg.label) + '</span>'
          : '—';
        var src = CUST_SRC[c.src];
        var srcHtml = src ? '<i class="bi ' + src.icon + '" aria-hidden="true"></i> ' + escapeHtml(src.label) : '—';
        var inactiveTag = (c.status === 'inactive')
          ? ' <span class="badge badge-soft cust-inactive-tag">Inactive</span>'
          : '';
        return '<tr class="booking-table-row">' +
          '<td><div class="booking-customer-name">' + escapeHtml(c.name) + inactiveTag + '</div></td>' +
          '<td>+1 ' + escapeHtml(c.phone) + '</td>' +
          '<td>' + segHtml + '</td>' +
          '<td><span class="badge badge-soft">' + srcHtml + '</span></td>' +
          '<td>' + c.visits + '</td>' +
          '<td>' + escapeHtml(c.last) + '</td>' +
          '<td><div class="booking-actions">' +
            '<button class="booking-mini-button" type="button" data-cust-edit="' + CUSTOMERS.indexOf(c) + '" title="Edit" aria-label="Edit customer"><i class="bi bi-pencil" aria-hidden="true"></i><span class="booking-mini-label">Edit</span></button>' +
            '<button class="booking-mini-button sms-temp-hidden" type="button" title="Send SMS" aria-label="Send SMS"><i class="bi bi-chat-dots" aria-hidden="true"></i><span class="booking-mini-label">Send SMS</span></button>' +
          '</div></td>' +
        '</tr>';
      }).join('');

      renderCustSegChips();
    }

    /* ===== Call Log (data ported from SMS dashboard) ===== */
    var CALLS = [
      { time: 'Today 14:32', name: 'Linh Tran',     phone: '(832) 431-8827', status: 'booked',    dur: 154, note: 'Booked full set gel — Fri 15:00' },
      { time: 'Today 13:05', name: 'Unknown',        phone: '(346) 220-1187', status: 'missed',    dur: 0,   note: 'Called twice in a row' },
      { time: 'Today 11:48', name: 'Jessica Kim',    phone: '(832) 906-4471', status: 'answered',  dur: 132, note: 'Asked about dip powder pricing' },
      { time: 'Today 09:15', name: 'Mai Nguyen',     phone: '(713) 552-0194', status: 'booked',    dur: 148, note: 'Booked pedicure combo — Sun 11:00' },
      { time: 'Yesterday 18:47', name: 'Unknown',    phone: '(832) 605-7731', status: 'missed',    dur: 0,   note: 'After closing time' },
      { time: 'Yesterday 16:30', name: 'Ashley Brown',   phone: '(832) 118-9902', status: 'answered',  dur: 166, note: 'Asked about nail art design' },
      { time: 'Yesterday 15:12', name: 'Unknown',    phone: '(281) 344-2209', status: 'missed',    dur: 0,   note: 'Peak hours — salon full' },
      { time: 'Yesterday 12:58', name: 'Ngoc Vu',        phone: '(832) 543-1120', status: 'booked',    dur: 126, note: 'Booked 2 slots with a friend — Sat' },
      { time: 'Yesterday 10:03', name: 'Maria Gonzalez', phone: '(832) 340-2276', status: 'answered',  dur: 138, note: 'Rescheduled from Wed to Thu' }
    ];

    var CALL_STATUS_META = {
      answered:  { cls: 'booking-status-sms',    icon: 'bi-telephone-inbound', label: 'Answered' },
      missed:    { cls: 'booking-status-noshow', icon: 'bi-telephone-x',       label: 'Missed' },
      booked:    { cls: 'booking-status-done',   icon: 'bi-calendar-check',    label: 'Booked' }
    };

    var CALL_STATUS_CHIPS = [
      { id: 'all',       icon: '',                     label: 'All' },
      { id: 'missed',    icon: 'bi-telephone-x',       label: 'Missed' },
      { id: 'answered',  icon: 'bi-telephone-inbound', label: 'Answered' },
      { id: 'booked',    icon: 'bi-calendar-check',    label: 'Booked' }
    ];

    var callFilter = 'all';
    var callSearch = '';

    function formatCallDur(sec) {
      if (!sec) return '—';
      return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
    }

    function renderCallStats() {
      var host = document.querySelector('[data-call-stats]');
      if (!host) return;

      var today = CALLS.filter(function(c) { return c.time.indexOf('Today') === 0; });
      var missed = today.filter(function(c) { return c.status === 'missed'; }).length;
      var booked = today.filter(function(c) { return c.status === 'booked'; }).length;
      var answeredRate = today.length ? Math.round((today.length - missed) / today.length * 100) : 0;

      host.innerHTML =
        '<article class="overview-card kpi-card" style="--kpi-accent: var(--nexora-electric);">' +
          '<div class="kpi-top"><div class="kpi-icon"><i class="bi bi-telephone-inbound" aria-hidden="true"></i></div></div>' +
          '<div class="kpi-label">Calls today</div><div class="kpi-value">' + today.length + '</div>' +
          '<div class="kpi-trend">so far today</div></article>' +
        '<article class="overview-card kpi-card" style="--kpi-accent: #ef4444;">' +
          '<div class="kpi-top"><div class="kpi-icon"><i class="bi bi-telephone-x" aria-hidden="true"></i></div><span class="badge booking-status booking-status-noshow">Follow-up</span></div>' +
          '<div class="kpi-label">Missed calls</div><div class="kpi-value">' + missed + '</div>' +
          '<div class="kpi-trend">need follow-up SMS</div></article>' +
        '<article class="overview-card kpi-card" style="--kpi-accent: var(--nexora-success);">' +
          '<div class="kpi-top"><div class="kpi-icon"><i class="bi bi-calendar-check" aria-hidden="true"></i></div><span class="badge booking-status booking-status-done">Booking</span></div>' +
          '<div class="kpi-label">Booked by phone</div><div class="kpi-value">' + booked + '</div>' +
          '<div class="kpi-trend">↑ bookings today</div></article>' +
        '<article class="overview-card kpi-card" style="--kpi-accent: var(--nexora-brand);">' +
          '<div class="kpi-top"><div class="kpi-icon"><i class="bi bi-graph-up-arrow" aria-hidden="true"></i></div></div>' +
          '<div class="kpi-label">Answer rate</div><div class="kpi-value">' + answeredRate + '%</div>' +
          '<div class="kpi-trend">' + (answeredRate >= 80 ? '↑ good' : '⚠️ needs improvement') + '</div></article>';
    }

    function renderCallStatusChips() {
      var wrap = document.querySelector('[data-call-status-filter]');
      if (!wrap) return;

      var counts = { all: CALLS.length };
      ['missed', 'answered', 'booked'].forEach(function(id) {
        counts[id] = CALLS.filter(function(c) { return c.status === id; }).length;
      });

      wrap.innerHTML = CALL_STATUS_CHIPS.map(function(s) {
        var isActive = callFilter === s.id;
        var iconHtml = s.icon ? '<i class="bi ' + s.icon + '" aria-hidden="true"></i> ' : '';
        return '<button class="booking-status-chip' + (isActive ? ' is-active' : '') + '" type="button" data-call-status="' + s.id + '" aria-pressed="' + (isActive ? 'true' : 'false') + '">' +
          iconHtml + escapeHtml(s.label) + ' <span class="booking-status-chip-count">' + (counts[s.id] || 0) + '</span></button>';
      }).join('');
    }

    function renderCalls() {
      var tbody = document.querySelector('[data-call-tbody]');
      if (!tbody) return;

      var q = (callSearch || '').toLowerCase();
      var qDigits = q.replace(/\D/g, '');
      var rows = CALLS.filter(function(c) {
        var statusOk = callFilter === 'all' || c.status === callFilter;
        var searchOk = !q || c.name.toLowerCase().indexOf(q) !== -1 ||
          (qDigits && c.phone.replace(/\D/g, '').indexOf(qDigits) !== -1);
        return statusOk && searchOk;
      });

      var countEl = document.querySelector('[data-call-count]');
      if (countEl) countEl.textContent = rows.length + '/' + CALLS.length + ' calls';

      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="booking-empty-cell">No calls found</td></tr>';
        renderCallStatusChips();
        return;
      }

      tbody.innerHTML = rows.map(function(c) {
        var meta = CALL_STATUS_META[c.status] || { cls: 'booking-status-new', icon: '', label: c.status };
        var metaIcon = meta.icon ? '<i class="bi ' + meta.icon + '" aria-hidden="true"></i> ' : '';
        var action = c.status === 'missed'
          ? '<button class="booking-mini-button primary" type="button" data-call-sms="' + CALLS.indexOf(c) + '" title="Follow-up SMS" aria-label="Follow-up SMS"><i class="bi bi-reply" aria-hidden="true"></i><span class="booking-mini-label">Follow-up SMS</span></button>'
          : '';
        return '<tr class="booking-table-row">' +
          '<td>' + escapeHtml(c.time) + '</td>' +
          '<td><div class="booking-customer-name">' + escapeHtml(c.name) + '</div></td>' +
          '<td>+1 ' + escapeHtml(c.phone) + '</td>' +
          '<td><span class="badge booking-status ' + meta.cls + '">' + metaIcon + escapeHtml(meta.label) + '</span></td>' +
          '<td>' + formatCallDur(c.dur) + '</td>' +
          '<td>' + escapeHtml(c.note) + '</td>' +
          '<td><div class="booking-actions">' + action + '</div></td>' +
        '</tr>';
      }).join('');

      renderCallStatusChips();
    }

    var custSearchInput = document.querySelector('[data-cust-search]');
    if (custSearchInput) {
      custSearchInput.addEventListener('input', function() {
        custFilter.search = custSearchInput.value;
        renderCustomers();
      });
    }

    var callSearchInput = document.querySelector('[data-call-search]');
    if (callSearchInput) {
      callSearchInput.addEventListener('input', function() {
        callSearch = callSearchInput.value;
        renderCalls();
      });
    }

    var promoTextarea = document.querySelector('[data-settings-promo]');
    if (promoTextarea) {
      promoTextarea.addEventListener('input', updatePromoCount);
      updatePromoCount();
    }

    var custEditIndex = -1;

    function custTypeOf(c) { return c.type || (c.seg === 'vip' ? 'VIP' : 'Individual'); }
    function custStatusOf(c) { return c.status || 'active'; }

    function setCustStatusToggle(on) {
      var btn = document.querySelector('[data-cf-status]');
      var lbl = document.querySelector('[data-cf-status-label]');
      if (btn) { btn.classList.toggle('is-on', on); btn.setAttribute('aria-checked', on ? 'true' : 'false'); }
      if (lbl) lbl.textContent = on ? 'Active' : 'Inactive';
    }

    function openCustModal(index) {
      var c = CUSTOMERS[index];
      var modal = document.querySelector('[data-cust-modal]');
      if (!c || !modal) return;
      custEditIndex = index;
      modal.querySelector('[data-cf-name]').value = c.name || '';
      modal.querySelector('[data-cf-email]').value = c.email || '';
      modal.querySelector('[data-cf-address]').value = c.address || '';
      if (custBirthdayPicker) {
        if (c.birthday) custBirthdayPicker.setDate(c.birthday, false);
        else custBirthdayPicker.clear();
      } else {
        modal.querySelector('[data-cf-birthday]').value = c.birthday || '';
      }
      modal.querySelector('[data-cf-type]').value = custTypeOf(c);
      setCustStatusToggle(custStatusOf(c) === 'active');
      modal.hidden = false;
    }

    function closeCustModal() {
      var modal = document.querySelector('[data-cust-modal]');
      if (modal) modal.hidden = true;
      custEditIndex = -1;
    }

    function saveCustModal() {
      var modal = document.querySelector('[data-cust-modal]');
      var c = CUSTOMERS[custEditIndex];
      if (!modal || !c) { closeCustModal(); return; }
      c.name = (modal.querySelector('[data-cf-name]').value || '').trim() || c.name;
      c.email = (modal.querySelector('[data-cf-email]').value || '').trim();
      c.address = (modal.querySelector('[data-cf-address]').value || '').trim();
      c.birthday = modal.querySelector('[data-cf-birthday]').value || '';
      c.type = modal.querySelector('[data-cf-type]').value;
      c.status = modal.querySelector('[data-cf-status]').classList.contains('is-on') ? 'active' : 'inactive';
      var savedName = c.name;
      closeCustModal();
      renderCustomers();
      if (window.Swal) {
        Swal.fire({
          icon: 'success',
          title: 'Customer updated',
          text: savedName,
          timer: 1600,
          showConfirmButton: false
        });
      }
    }

    document.addEventListener('keydown', function(event) {
      if (event.key !== 'Escape') return;
      var modal = document.querySelector('[data-cust-modal]');
      if (modal && !modal.hidden) closeCustModal();
    });

    document.addEventListener('click', function(event) {
      var custEditBtn = event.target.closest('[data-cust-edit]');
      if (custEditBtn) {
        openCustModal(parseInt(custEditBtn.dataset.custEdit, 10));
        return;
      }

      var custStatusBtn = event.target.closest('[data-cf-status]');
      if (custStatusBtn) {
        setCustStatusToggle(!custStatusBtn.classList.contains('is-on'));
        return;
      }

      var custSaveBtn = event.target.closest('[data-cust-save]');
      if (custSaveBtn) {
        saveCustModal();
        return;
      }

      if (event.target.closest('[data-cust-modal-close]') || event.target.matches('[data-cust-modal]')) {
        closeCustModal();
        return;
      }

      var segChip = event.target.closest('[data-cust-seg]');
      if (segChip) {
        custFilter.seg = segChip.dataset.custSeg;
        renderCustomers();
        return;
      }

      var callChip = event.target.closest('[data-call-status]');
      if (callChip) {
        callFilter = callChip.dataset.callStatus;
        renderCalls();
        return;
      }

      var callSmsBtn = event.target.closest('[data-call-sms]');
      if (callSmsBtn) {
        if (window.openSmsCampaignComposer) window.openSmsCampaignComposer({ segment: 'new' });
        return;
      }
    });
    var initialBookingRows = Array.from(document.querySelectorAll('[data-booking-item]'));
    appointmentStore.ensureSource('booking-book-static-v1', initialBookingRows.map(bookingRecordFromItem), null, catalog);
    repairBookingStaticSources(initialBookingRows);
    renderBookingTechnicianRoster();
    renderBookingStoreRows();
    appointmentStore.subscribe(function() {
      catalog = salonData.loadCatalog();
      rebuildBookingCatalogViews();
      renderBookingTechnicianRoster();
      renderBookingStoreRows();
      filterBookingItems();
      renderBookingCalendar();
      renderBookingCards();
    }, window);
    window.addEventListener('storage', function(event) {
      if (!event || event.key !== salonData.STORAGE_KEY) return;
      catalog = salonData.loadCatalog();
      rebuildBookingCatalogViews();
      renderBookingTechnicianRoster();
      renderBookingStoreRows();
      filterBookingItems();
      renderBookingCalendar();
    });
    updateBookingSearchPlaceholder();
    initBookingViewMode();
    updateBookingKpis();
    loadBookingAppointmentServiceCatalog();
    window.NEXORA_POS_BOOKING = {
      init: function() {},
      render: function() {
        renderBookingStoreRows();
        filterBookingItems();
        renderBookingCalendar();
        renderBookingCards();
      }
    };

    if (salonData.storageAvailable && !salonData.storageAvailable()) {
      setTimeout(function() {
        if (window.Swal) {
          Swal.fire({ icon: 'info', title: 'Local-only mode', text: 'Local changes are available in this tab; cross-tab sync is unavailable.', timer: 2600, showConfirmButton: false });
        } else {
          setSettingsStatus('Local changes are available in this tab; cross-tab sync is unavailable.');
        }
      }, 0);
    }
