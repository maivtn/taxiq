(function () {
  'use strict';

  var root = document.querySelector('[data-calendar]');
  var store = window.NEXORA_STAFF_SCHEDULE_STORE;
  var salonData = window.NEXORA_SALON_DATA;
  var appointmentStore = window.NEXORA_APPOINTMENTS_STORE;
  if (!root || !store || !salonData) return;

  var params = new URLSearchParams(location.search);
  var catalog = salonData.loadCatalog();
  var salonId = params.get('salon') === salonData.SALON_ID ? params.get('salon') : salonData.SALON_ID;
  var requestedStaff = params.get('staff');
  var staffId = catalog.technicians.some(function (item) { return item.id === requestedStaff; }) ? requestedStaff : 't1';
  var selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : dateKey(new Date());
  var activeTab = 'appointments';
  var requestType = '';
  var feedback = '';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];
    });
  }
  function dateKey(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }
  function time(value) { return value ? value.slice(11, 16) : ''; }
  function titleDate(value) { return new Date(value + 'T12:00:00').toLocaleDateString('en-US', {weekday:'long', month:'short', day:'numeric'}); }
  function appointmentRows() {
    try { return appointmentStore ? appointmentStore.loadAll() : []; } catch (_) { return []; }
  }
  function personalAppointments() {
    return appointmentRows().filter(function (row) {
      if (!row.startAt || row.startAt.slice(0, 10) !== selectedDate || ['cancelled', 'no-show'].includes(row.status)) return false;
      return row.technicianId === staffId || (row.tickets || []).some(function (ticket) { return ticket.technicianId === staffId; });
    });
  }
  function visibleAppointments() {
    var appointments = personalAppointments();
    if (appointments.length) return appointments;
    return [{customerName:'Mary Smith', serviceNames:['Gel Manicure'], startAt:selectedDate + 'T10:30:00', endAt:selectedDate + 'T11:30:00', status:'Demo booking', demo:true}];
  }
  function week() {
    var active = new Date(selectedDate + 'T12:00:00');
    var start = new Date(active);
    start.setDate(active.getDate() - active.getDay());
    return Array.from({length:7}, function (_, index) { var day = new Date(start); day.setDate(start.getDate() + index); return day; });
  }
  function currentDay() {
    return store.scheduleForDate(store.getStaffSchedule(salonId, staffId, {}), selectedDate);
  }
  function syncUrl() {
    var url = new URL(location.href);
    url.searchParams.set('salon', salonId);
    url.searchParams.set('staff', staffId);
    url.searchParams.set('date', selectedDate);
    history.replaceState(null, '', url);
    root.dataset.staffId = staffId;
    root.dataset.selectedDate = selectedDate;
    document.querySelector('[data-work-orders-link]').href = 'staff-work-orders.html?salon=' + encodeURIComponent(salonId);
  }
  function appointmentsPanel() {
    var schedule = store.getStaffSchedule(salonId, staffId, {});
    var availability = store.availabilityForDay({staffSchedule:schedule, technicianId:staffId, date:selectedDate, appointments:appointmentRows()});
    if (!availability.working) return '<div class="calendar-empty"><strong>Day off</strong><p>No published working hours.</p></div>';
    var items = [{at:availability.start, title:'Work starts', meta:'Published by salon', kind:'boundary'}];
    availability.breaks.forEach(function (item) { items.push({at:item.start, title:'Break', meta:item.start + '–' + item.end + ' · Not bookable', kind:'break'}); });
    visibleAppointments().forEach(function (item) {
      items.push({at:time(item.startAt), title:(item.customerName || 'Guest') + ' · ' + (item.serviceNames || []).join(', '), meta:item.status || 'Appointment', kind:item.demo ? 'appointment demo' : 'appointment', id:item.id, demo:item.demo});
    });
    availability.openSlots.slice(0, 8).forEach(function (item) { items.push({at:item.time, title:'Open slot', meta:'Customer can book eligible services', kind:'open'}); });
    items.push({at:availability.end, title:'Work ends', meta:'Hidden from Booking after this time', kind:'boundary'});
    items.sort(function (left, right) { return left.at.localeCompare(right.at); });
    return '<div class="timeline">' + items.map(function (item) {
      var body = '<div class="timeline-card"><strong>' + esc(item.title) + '</strong><small>' + esc(item.meta) + '</small></div>';
      return '<div class="timeline-item ' + esc(item.kind) + '"' + (item.demo ? ' data-demo-booking' : '') + '><span>' + esc(item.at) + '</span>' + (item.id ? '<a href="staff-work-orders.html?salon=' + encodeURIComponent(salonId) + '&ticket=' + encodeURIComponent(item.id) + '" data-calendar-appointment>' + body + '</a>' : body) + '</div>';
    }).join('') + '</div>';
  }
  function workSchedulePanel() {
    var schedule = store.getStaffSchedule(salonId, staffId, {});
    var availability = store.availabilityForDay({staffSchedule:schedule, technicianId:staffId, date:selectedDate, appointments:appointmentRows()});
    if (!availability.working) return '<div class="calendar-empty"><strong>Day off</strong><p>The salon has not published working hours for this date.</p><button type="button" data-request-change-hours>Request working hours</button></div>';
    var items = [{at:availability.start, title:'Work starts', meta:'Published by salon', kind:'boundary'}];
    availability.breaks.forEach(function (item) { items.push({at:item.start, title:'Break', meta:item.start + '–' + item.end + ' · Not bookable', kind:'break'}); });
    availability.openSlots.slice(0, 8).forEach(function (item) { items.push({at:item.time, title:'Open slot', meta:'Customer can book eligible services', kind:'open'}); });
    items.push({at:availability.end, title:'Work ends', meta:'Hidden from Booking after this time', kind:'boundary'});
    items.sort(function (left, right) { return left.at.localeCompare(right.at); });
    return '<div class="calendar-view"><section class="schedule-source"><strong>Salon schedule</strong><span>' + esc(availability.start + '–' + availability.end) + '</span><small>Changes require manager approval.</small></section><div class="timeline">' + items.map(function (item) {
      return '<div class="timeline-item ' + item.kind + '"><span>' + esc(item.at) + '</span><div class="timeline-card"><strong>' + esc(item.title) + '</strong><small>' + esc(item.meta) + '</small></div></div>';
    }).join('') + '</div></div>';
  }
  function requestLabel(type) {
    return {'day-off':'Day off', 'change-hours':'Change hours', 'break':'Take break'}[type] || 'Schedule request';
  }
  function requestList() {
    var list = store.loadState().requests.filter(function (item) { return item.salonId === salonId && item.staffId === staffId; }).sort(function (left, right) { return String(right.createdAt).localeCompare(String(left.createdAt)); });
    if (!list.length) return '<div class="calendar-empty"><strong>No requests yet</strong><p>Your schedule requests and manager decisions appear here.</p></div>';
    return '<div class="request-list" data-request-list>' + list.map(function (item) {
      var detail = item.type === 'day-off' ? item.reason : item.start + '–' + item.end + (item.reason ? ' · ' + item.reason : '');
      var cancellable = ['pending', 'adjusted'].includes(item.status);
      return '<article class="request-card"><header><div><strong>' + esc(requestLabel(item.type)) + '</strong><small>' + esc(item.date) + '</small></div><span class="request-status is-' + esc(item.status) + '">' + esc(item.status[0].toUpperCase() + item.status.slice(1)) + '</span></header><p>' + esc(detail) + '</p>' + (item.status === 'blocked' ? '<small>Manager must resolve affected bookings before approval.</small>' : '') + (cancellable ? '<button type="button" data-request-cancel="' + esc(item.id) + '">Cancel request</button>' : '') + '</article>';
    }).join('') + '</div>';
  }
  function requestForm() {
    if (!requestType) return '';
    var timed = requestType !== 'day-off';
    var defaults = requestType === 'break' ? ['13:00','13:30'] : ['09:00','19:00'];
    return '<form class="request-form" data-request-form><header><div><strong>' + esc(requestLabel(requestType)) + '</strong><p>This sends a request. Your published availability will not change yet.</p></div><button type="button" data-request-form-close aria-label="Close">×</button></header><label>Date<input type="date" data-request-date value="' + esc(selectedDate) + '" required></label>' + (timed ? '<div class="request-time-fields"><label>Start time<input type="time" data-request-start value="' + defaults[0] + '" required></label><label>End time<input type="time" data-request-end value="' + defaults[1] + '" required></label></div>' : '') + '<label>Reason<select class="staff-calendar-select" data-request-reason><option>Personal</option><option>Sick</option><option>Vacation</option><option>Appointment</option><option>Other</option></select></label><p class="request-feedback" data-request-feedback>' + esc(feedback) + '</p><button class="staff-primary-button" type="submit">Send to manager</button></form>';
  }
  function requestsPanel() {
    var permission = store.getStaffSchedule(salonId, staffId, {}).permission;
    if (permission === 'none') return '<div class="calendar-empty"><strong>Requests disabled</strong><p>Contact your manager to change availability.</p></div>' + requestList();
    return '<div class="calendar-view"><section class="request-options"><h3>New request</h3><div class="quick-action-grid"><button type="button" data-request-day-off>Request day off</button><button type="button" data-request-change-hours>Change hours</button><button type="button" data-request-break>Take break</button></div></section>' + requestForm() + '<section class="calendar-section"><h3>Request history</h3>' + requestList() + '</section></div>';
  }
  function contextualSide() {
    var day = currentDay();
    var staff = catalog.technicians.find(function (item) { return item.id === staffId; }) || {};
    if (activeTab === 'appointments') return '<h3>Work Schedule</h3><p><strong>' + (day.working ? esc(day.start + '–' + day.end) : 'Day off') + '</strong></p><p>' + (day.breaks || []).length + ' break · ' + visibleAppointments().length + ' appointment' + (visibleAppointments().length === 1 ? '' : 's') + '</p><p>Eligible services: ' + esc((staff.skills || []).join(', ') || 'Set by salon') + '</p>';
    if (activeTab === 'work-schedule') return '<h3>Published by salon</h3><p>This is the schedule customers see through Booking.</p><p>Use Requests if you need a day off, different hours or an extra break.</p>';
    return '<h3>How approval works</h3><ol><li>You send a request.</li><li>Manager reviews booking impact.</li><li>Approved hours sync to Booking.</li></ol>';
  }
  function render() {
    syncUrl();
    document.querySelector('[data-calendar-salon]').innerHTML = '<option value="' + esc(salonId) + '">' + esc(catalog.salon.name) + '</option>';
    document.querySelector('[data-calendar-week]').innerHTML = week().map(function (date) {
      var key = dateKey(date);
      return '<button type="button" class="calendar-day' + (key === selectedDate ? ' is-selected' : '') + '" data-calendar-day data-date="' + key + '"><span>' + date.toLocaleDateString('en-US', {weekday:'short'}) + '</span><strong>' + date.getDate() + '</strong></button>';
    }).join('');
    document.querySelectorAll('[data-calendar-tab]').forEach(function (button) {
      var active = button.dataset.calendarTab === activeTab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    var panel = document.querySelector('[data-calendar-panel]');
    var count = visibleAppointments().length;
    panel.querySelector('[data-calendar-heading]').textContent = activeTab === 'requests' ? 'Schedule requests' : titleDate(selectedDate);
    panel.querySelector('[data-calendar-duration]').textContent = activeTab === 'appointments' ? count + ' appointment' + (count === 1 ? '' : 's') : (activeTab === 'work-schedule' ? 'Published schedule' : 'Manager approval');
    panel.querySelector('[data-calendar-timeline]').innerHTML = activeTab === 'appointments' ? appointmentsPanel() : (activeTab === 'work-schedule' ? workSchedulePanel() : requestsPanel());
    document.querySelector('[data-calendar-side]').innerHTML = contextualSide();
  }
  function openRequest(type) {
    activeTab = 'requests';
    requestType = type;
    feedback = '';
    render();
  }

  root.addEventListener('click', function (event) {
    var day = event.target.closest('[data-calendar-day]');
    if (day) { selectedDate = day.dataset.date; requestType = ''; render(); return; }
    var tab = event.target.closest('[data-calendar-tab]');
    if (tab) { activeTab = tab.dataset.calendarTab; requestType = ''; feedback = ''; render(); return; }
    if (event.target.closest('[data-calendar-today]')) { selectedDate = dateKey(new Date()); render(); return; }
    if (event.target.closest('[data-request-day-off]')) { openRequest('day-off'); return; }
    if (event.target.closest('[data-request-change-hours]')) { openRequest('change-hours'); return; }
    if (event.target.closest('[data-request-break]')) { openRequest('break'); return; }
    if (event.target.closest('[data-request-form-close]')) { requestType = ''; feedback = ''; render(); return; }
    if (event.target.closest('[data-message-manager]')) { feedback = 'Demo: manager notified.'; activeTab = 'requests'; render(); return; }
    var cancel = event.target.closest('[data-request-cancel]');
    if (cancel) { store.cancelRequest(cancel.dataset.requestCancel, staffId); render(); }
  });
  root.addEventListener('submit', function (event) {
    if (!event.target.matches('[data-request-form]')) return;
    event.preventDefault();
    var form = event.target;
    var result = store.createRequest({salonId:salonId, staffId:staffId, type:requestType, date:form.querySelector('[data-request-date]').value, reason:form.querySelector('[data-request-reason]').value, start:form.querySelector('[data-request-start]') ? form.querySelector('[data-request-start]').value : '', end:form.querySelector('[data-request-end]') ? form.querySelector('[data-request-end]').value : ''});
    if (result.ok) { requestType = ''; feedback = ''; render(); return; }
    feedback = result.error.code === 'request-not-allowed' ? 'Salon policy does not allow requests.' : 'Check the date and time, then try again.';
    render();
  });

  var unsubscribe = store.subscribe(function () { render(); });
  window.addEventListener('pagehide', unsubscribe, {once:true});
  render();
})();
