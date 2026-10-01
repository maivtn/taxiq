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
  var actionMessage = '';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];
    });
  }
  function dateKey(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }
  function time(value) { return value ? value.slice(11, 16) : ''; }
  function titleDate(value) { return new Date(value + 'T12:00:00').toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}); }
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
    return [{id:'calendar-demo-appointment',customerName:'Mary Smith', serviceNames:['Gel Manicure'], startAt:selectedDate + 'T10:30:00', endAt:selectedDate + 'T11:30:00', status:'Demo booking', demo:true}];
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
  function schedulePermission() { return store.getStaffSchedule(salonId, staffId, {}).permission; }
  function permissionNote() {
    var permission = schedulePermission();
    return permission === 'none' ? 'View only. Your salon manages changes to your work schedule.' : permission === 'self' ? 'You can edit your own schedule without approval. Existing bookings stay protected.' : 'You can edit your own schedule. Changes need manager approval, as set by your salon.';
  }
  function scheduleActions() {
    if (schedulePermission() === 'none') return '<section class="request-options"><h3>Need a schedule change?</h3><div class="quick-action-grid"><button type="button" data-chat-salon>Chat with salon</button></div></section>';
    return '<section class="request-options"><h3>Edit my schedule</h3><div class="quick-action-grid"><button type="button" data-request-day-off>Day off</button><button type="button" data-request-change-hours>Change hours</button><button type="button" data-request-break>Take break</button><button type="button" data-chat-salon>Chat with salon</button></div></section>';
  }
  function approvalNotice() {
    var permission = schedulePermission();
    var mode = permission === 'none' ? 'readonly' : permission === 'self' ? 'direct' : 'approval';
    var title = mode === 'readonly' ? 'View only' : mode === 'direct' ? 'No approval needed' : 'Approval required';
    var detail = mode === 'readonly' ? 'Contact your manager to change your schedule.' : mode === 'direct' ? 'Save → applies immediately. Booking conflicts still need manager review.' : 'Submit → pending review → manager approves. Your current schedule stays active until approval.';
    return '<div class="schedule-approval-notice is-' + mode + '"><strong>' + title + '</strong><p>' + detail + '</p><small>Permission set by your salon.</small></div>';
  }
  function personalScheduleCard() {
    var schedule = store.getStaffSchedule(salonId, staffId, {});
    var monday = new Date(selectedDate + 'T12:00:00');
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
    var days = Array.from({length:7}, function (_, index) { var date = new Date(monday); date.setDate(date.getDate() + index); return date; });
    var rows = days.map(function (date) {
      var key = dateKey(date), day = store.scheduleForDate(schedule, key), selected = key === selectedDate;
      return '<li class="personal-week-row' + (day.working ? '' : ' is-off') + (selected ? ' is-selected' : '') + '"' + (selected ? ' aria-current="date"' : '') + '><div class="personal-week-day"><strong>' + esc(date.toLocaleDateString('en-US', {weekday:'short'})) + '</strong><small>' + esc(titleDate(key)) + '</small></div><div class="personal-week-hours"><strong>' + esc(day.working ? day.start + '–' + day.end : 'Day off') + '</strong>' + '</div>' + (day.working && day.breaks.length ? '<p class="personal-week-breaks">Break: ' + day.breaks.map(function (pause) { return esc(pause.start + '–' + pause.end); }).join(' · ') + '</p>' : '') + (day.source === 'exception' ? '<small class="personal-week-exception">Changed</small>' : '') + '</li>';
    }).join('');
    return '<section class="schedule-source personal-week-card"><strong>My schedule</strong><small class="personal-week-range">' + esc(titleDate(dateKey(days[0])) + ' – ' + titleDate(dateKey(days[6]))) + '</small><ul class="personal-week-list" aria-label="My work schedule for this week">' + rows + '</ul></section>';
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
      return '<div class="timeline-item ' + esc(item.kind) + '"' + (item.demo ? ' data-demo-booking' : '') + '><span>' + esc(item.at) + '</span>' + (item.id ? '<button type="button" class="calendar-appointment-trigger" data-calendar-appointment="' + esc(item.id) + '" aria-haspopup="dialog">' + body + '</button>' : body) + '</div>';
    }).join('') + '</div>';
  }
  function requestLabel(type) {
    return {'day-off':'Day off', 'change-hours':'Change hours', 'break':'Take break', 'weekly-schedule':'Weekly schedule'}[type] || 'Schedule request';
  }
  function requestList() {
    var list = store.loadState().requests.filter(function (item) { return item.salonId === salonId && item.staffId === staffId; }).sort(function (left, right) { return String(right.createdAt).localeCompare(String(left.createdAt)); });
    if (!list.length) return '<div class="calendar-empty"><strong>No requests yet</strong><p>Your schedule requests and manager decisions appear here.</p></div>';
    return '<div class="request-list" data-request-list>' + list.map(function (item) {
      var detail = item.type === 'day-off' ? item.reason : item.start + '–' + item.end + (item.reason ? ' · ' + item.reason : '');
      if (item.type === 'weekly-schedule') detail = ['mon','tue','wed','thu','fri','sat','sun'].map(function (key) { var day = item.weekly[key]; return key[0].toUpperCase() + key.slice(1) + ': ' + (day.working ? day.start + '–' + day.end : 'Day off'); }).join(' · ');
      var cancellable = ['pending', 'adjusted'].includes(item.status);
      return '<article class="request-card"><header><div><strong>' + esc(requestLabel(item.type)) + '</strong><small>' + esc(titleDate(item.date)) + '</small></div><span class="request-status is-' + esc(item.status) + '">' + esc(item.status[0].toUpperCase() + item.status.slice(1)) + '</span></header><p>' + esc(detail) + '</p>' + (item.status === 'blocked' ? '<small>Manager must resolve affected bookings before approval.</small>' : '') + (item.status === 'rejected' && item.rejectionReason ? '<p class="request-rejection-reason"><strong>Rejection reason:</strong> ' + esc(item.rejectionReason) + '</p>' : '') + (cancellable ? '<button type="button" data-request-cancel="' + esc(item.id) + '">Cancel request</button>' : '') + '</article>';
    }).join('') + '</div>';
  }
  function requestForm() {
    if (!requestType) return '';
    var direct = schedulePermission() === 'self';
    var timed = requestType !== 'day-off';
    var day = currentDay();
    var defaults = requestType === 'break' ? ['13:00','13:30'] : [day.start || '09:00',day.end || '19:00'];
    return '<form class="request-form ' + (direct ? 'is-direct' : 'is-approval') + '" data-request-form><header><div><strong>' + esc(requestLabel(requestType)) + '</strong><p>' + (direct ? 'Save changes to your own schedule. No approval is needed unless existing bookings are affected.' : 'Send your schedule change for approval. Your current hours stay unchanged until approved.') + '</p></div><button type="button" data-request-form-close aria-label="Close">×</button></header>' + approvalNotice() + '<label>Date<input type="date" data-request-date value="' + esc(selectedDate) + '" required></label>' + (timed ? '<div class="request-time-fields"><label>Start time<input type="time" data-request-start value="' + defaults[0] + '" required></label><label>End time<input type="time" data-request-end value="' + defaults[1] + '" required></label></div>' : '') + (requestType === 'day-off' ? '<label>Reason for day off (optional)<textarea data-request-reason rows="3" maxlength="500" placeholder="Enter your reason, e.g. family appointment or personal day"></textarea></label>' : '<label>Reason<select class="staff-calendar-select" data-request-reason><option>Personal</option><option>Sick</option><option>Vacation</option><option>Appointment</option><option>Other</option></select></label>') + '<p class="request-feedback" data-request-feedback>' + esc(feedback) + '</p><button class="staff-primary-button" type="submit">' + (direct ? 'Save changes' : 'Send for approval') + '</button></form>';
  }
  function requestsPanel() {
    var permission = store.getStaffSchedule(salonId, staffId, {}).permission;
    if (permission === 'none') return '<div class="calendar-view">' + (actionMessage ? '<div class="schedule-action-message" role="status">' + esc(actionMessage) + '</div>' : '') + '<div class="calendar-empty"><strong>Requests disabled</strong><p>Contact your manager to change availability.</p></div>' + scheduleActions() + requestList() + '</div>';
    return '<div class="calendar-view">' + (actionMessage ? '<div class="schedule-action-message" role="status">' + esc(actionMessage) + '</div>' : '') + scheduleActions() + requestForm() + '<section class="calendar-section"><h3>Schedule change history</h3>' + requestList() + '</section></div>';
  }
  function mySchedulePanel() {
    return '<div class="calendar-view">' + approvalNotice() + personalScheduleCard() + (schedulePermission() === 'none' ? '' : '<button type="button" class="schedule-edit-button" data-edit-weekly-schedule>Edit my schedule</button>') + '</div>';
  }
  function availabilityCard() {
    var today = dateKey(new Date());
    var day = store.scheduleForDate(store.getStaffSchedule(salonId, staffId, {}), today);
    var permission = schedulePermission();
    var disabled = permission === 'none';
    return '<section class="availability-card"><div><strong>' + (day.working ? 'Available today' : 'Unavailable today') + '</strong><p>' + (day.working ? esc(day.start + '–' + day.end) + ' · Online booking visible' : 'Hidden from new online bookings') + '</p></div><button type="button" class="availability-toggle' + (day.working ? ' is-on' : '') + '" role="switch" aria-checked="' + (day.working ? 'true' : 'false') + '" aria-label="' + (day.working ? 'Make unavailable today' : 'Make available today') + '" data-availability-toggle ' + (disabled ? 'disabled' : '') + '><span></span></button><span class="sync-pill">Synced to Booking</span></section>';
  }
  function availabilityWarning() {
    var bookings = personalAppointments().length;
    var bookingLabel = bookings + ' existing booking' + (bookings === 1 ? '' : 's');
    return '<section class="calendar-warning"><strong>Booking protection on</strong><p>' + esc(bookingLabel) + '. Availability changes that affect booked appointments require manager review; the current schedule stays active until resolved.</p></section>';
  }
  function contextualSide() {
    var day = currentDay();
    var staff = catalog.technicians.find(function (item) { return item.id === staffId; }) || {};
    if (activeTab === 'appointments') return '<section class="calendar-side-summary"><h3>Work Schedule</h3><p><strong>' + (day.working ? esc(day.start + '–' + day.end) : 'Day off') + '</strong></p><p>' + (day.breaks || []).length + ' break · ' + visibleAppointments().length + ' appointment' + (visibleAppointments().length === 1 ? '' : 's') + '</p><p>Eligible services: ' + esc((staff.skills || []).join(', ') || 'Set by salon') + '</p></section>' + availabilityWarning();
    return '<section class="calendar-side-summary"><h3>My schedule permissions</h3><p>' + esc(permissionNote()) + '</p><p>Changes apply only to your hours, days off and breaks at this salon — not the salon’s opening hours or other staff schedules.</p></section>';
  }
  function render() {
    syncUrl();
    document.querySelector('[data-calendar-salon]').innerHTML = '<option value="' + esc(salonId) + '">' + esc(catalog.salon.name) + '</option>';
    document.querySelector('[data-today-availability]').innerHTML = availabilityCard();
    document.querySelector('[data-calendar-week]').innerHTML = week().map(function (date) {
      var key = dateKey(date);
      return '<button type="button" class="calendar-day' + (key === selectedDate ? ' is-selected' : '') + '" aria-label="' + esc(titleDate(key)) + '" data-calendar-day data-date="' + key + '"><span>' + date.toLocaleDateString('en-US', {weekday:'short'}) + '</span><strong>' + date.getDate() + '</strong></button>';
    }).join('');
    document.querySelectorAll('[data-calendar-tab]').forEach(function (button) {
      var active = button.dataset.calendarTab === activeTab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    var panel = document.querySelector('[data-calendar-panel]');
    var count = visibleAppointments().length;
    panel.querySelector('[data-calendar-heading]').textContent = activeTab === 'requests' ? 'My schedule changes' : activeTab === 'my-schedule' ? 'My schedule' : titleDate(selectedDate);
    panel.querySelector('[data-calendar-duration]').textContent = activeTab === 'appointments' ? count + ' appointment' + (count === 1 ? '' : 's') : activeTab === 'my-schedule' ? '' : (schedulePermission() === 'none' ? 'View only' : schedulePermission() === 'self' ? 'No approval needed' : 'Approval required');
    panel.querySelector('[data-calendar-timeline]').innerHTML = activeTab === 'appointments' ? appointmentsPanel() : activeTab === 'my-schedule' ? mySchedulePanel() : requestsPanel();
    var side = document.querySelector('[data-calendar-side]');
    side.innerHTML = contextualSide();
  }
  function openRequest(type) {
    if (schedulePermission() === 'none') return;
    activeTab = 'requests';
    requestType = type;
    feedback = '';
    actionMessage = '';
    render();
    root.querySelector('[data-request-date]')?.focus();
  }
  function showToast(message) {
    var toast = document.querySelector('[data-staff-calendar-toast]');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'staff-calendar-toast';
      toast.setAttribute('data-staff-calendar-toast', '');
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(function () { toast.hidden = true; }, 2400);
  }
  function toggleAvailability() {
    var schedule = store.getStaffSchedule(salonId, staffId, {});
    if (schedule.permission === 'none') return;
    var today = dateKey(new Date());
    var day = store.scheduleForDate(schedule, today);
    var input = {salonId:salonId, staffId:staffId, date:today, reason:day.working ? 'Availability turned off by staff' : 'Availability turned on by staff'};
    if (day.working) input.type = 'day-off';
    else {
      var weekday = ['sun','mon','tue','wed','thu','fri','sat'][new Date(today + 'T12:00:00').getDay()];
      var regular = schedule.weekly[weekday] || {};
      input.type = 'change-hours';
      input.start = regular.start || '09:00';
      input.end = regular.end || '19:00';
    }
    var result = store.createRequest(input);
    if (!result.ok) {
      actionMessage = 'Availability could not be changed. Contact your manager for help.';
    } else if (schedule.permission === 'self') {
      var applied = store.reviewRequest(result.request.id, 'approve', appointmentRows());
      actionMessage = applied.ok ? 'Availability updated and synced to Booking.' : applied.error.code === 'booking-impact' ? 'Manager review needed: existing bookings are protected and your current availability has not changed.' : 'Availability could not be changed. Your current schedule has not changed.';
    } else {
      actionMessage = 'Availability request sent — pending manager approval. Your current schedule has not changed.';
    }
    activeTab = 'requests';
    requestType = '';
    feedback = '';
    render();
  }

  function openAppointment(id) {
    var appointment = visibleAppointments().find(function (item) { return item.id === id; });
    if (!appointment) return;
    var staff = catalog.technicians.find(function (item) { return item.id === (appointment.technicianId || staffId); }) || {};
    var status = String(appointment.status || 'Confirmed').replace(/-/g, ' ');
    var dialog = document.querySelector('[data-calendar-detail]');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'calendar-appointment-detail';
      dialog.setAttribute('data-calendar-detail', '');
      dialog.setAttribute('aria-labelledby', 'calendar-detail-title');
      document.body.appendChild(dialog);
    }
    dialog.innerHTML = '<header><div><span class="calendar-detail-eyebrow">BOOKING PREVIEW · DEMO</span><h2 id="calendar-detail-title">Appointment details</h2></div><form method="dialog"><button class="calendar-detail-close" aria-label="Close appointment details" autofocus>×</button></form></header>' +
      '<section class="calendar-detail-customer"><span>Customer</span><h3>' + esc(appointment.customerName || 'Guest') + '</h3><span class="request-status">' + esc(status[0].toUpperCase() + status.slice(1)) + '</span></section>' +
      '<dl><div><dt>Date</dt><dd>' + esc(titleDate(appointment.startAt.slice(0,10))) + '</dd></div><div><dt>Time</dt><dd>' + esc(time(appointment.startAt) + (appointment.endAt ? '–' + time(appointment.endAt) : '')) + '</dd></div><div><dt>Staff</dt><dd>' + esc(staff.name || 'Assigned staff') + '</dd></div><div><dt>Salon</dt><dd>' + esc(catalog.salon.name) + '</dd></div></dl>' +
      '<section class="calendar-detail-services"><h3>Services</h3><ul>' + (appointment.serviceNames || []).map(function (name) { return '<li>' + esc(name) + '</li>'; }).join('') + '</ul></section>' +
      '<p class="calendar-detail-note">Demo preview only. No booking changes are made here.</p><footer><form method="dialog"><button>Back to calendar</button></form></footer>';
    dialog.showModal();
  }

  function openWeeklySchedule() {
    if (schedulePermission() === 'none') return;
    var schedule = store.getStaffSchedule(salonId, staffId, {});
    var staff = catalog.technicians.find(function (person) { return person.id === staffId; }) || {};
    var days = [['mon','Monday'],['tue','Tuesday'],['wed','Wednesday'],['thu','Thursday'],['fri','Friday'],['sat','Saturday'],['sun','Sunday']];
    var dialog = document.querySelector('[data-staff-weekly-dialog]');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'staff-weekly-dialog';
      dialog.setAttribute('data-staff-weekly-dialog', '');
      dialog.setAttribute('aria-labelledby', 'staff-weekly-title');
      document.body.appendChild(dialog);
      dialog.addEventListener('click', function (event) { if (event.target.closest('[data-weekly-close]')) dialog.close(); });
      dialog.addEventListener('change', function (event) {
        if (!event.target.matches('[data-weekly-off]')) return;
        var row = event.target.closest('[data-weekly-day]');
        row.classList.toggle('is-off', event.target.checked);
        row.querySelectorAll('input[type="time"]').forEach(function (input) {
          input.disabled = event.target.checked;
          if (!input.disabled && !input.value) input.value = input.hasAttribute('data-weekly-start') ? '09:00' : '19:00';
        });
      });
      dialog.addEventListener('submit', saveWeeklySchedule);
    }
    dialog.innerHTML = '<form data-staff-weekly-form><header><div><span>' + esc(staff.name || 'My schedule') + '</span><h2 id="staff-weekly-title">Edit my weekly schedule</h2></div><button type="button" data-weekly-close aria-label="Close weekly schedule" autofocus>×</button></header><p class="staff-weekly-help">Regular hours, repeated every week. One-date changes stay unchanged.</p>' + approvalNotice() + '<section class="staff-weekly-rows" aria-label="Weekly schedule">' + days.map(function (entry) {
      var key = entry[0], name = entry[1], day = schedule.weekly[key];
      return '<div class="staff-weekly-row' + (day.working ? '' : ' is-off') + '" data-weekly-day="' + key + '"><strong>' + name + '</strong><label class="staff-weekly-off"><input type="checkbox" data-weekly-off ' + (day.working ? '' : 'checked') + '>Day off</label><div class="staff-weekly-times"><input type="time" data-weekly-start aria-label="' + name + ' start time" value="' + esc(day.start) + '" required ' + (day.working ? '' : 'disabled') + '><span>TO</span><input type="time" data-weekly-end aria-label="' + name + ' end time" value="' + esc(day.end) + '" required ' + (day.working ? '' : 'disabled') + '></div>' + ((day.breaks || []).length ? '<small>Breaks: ' + day.breaks.map(function (pause) { return esc(pause.start + '–' + pause.end); }).join(', ') + '</small>' : '') + '</div>';
    }).join('') + '</section><p class="request-feedback" data-weekly-error role="alert"></p><footer><button type="button" data-weekly-close>Cancel</button><button class="staff-primary-button ' + (schedule.permission === 'self' ? 'is-direct' : 'is-approval') + '" type="submit">' + (schedule.permission === 'self' ? 'Save changes' : 'Send for approval') + '</button></footer></form>';
    dialog.showModal();
  }
  function saveWeeklySchedule(event) {
    event.preventDefault();
    var form = event.target;
    var schedule = store.getStaffSchedule(salonId, staffId, {});
    var next = JSON.parse(JSON.stringify(schedule));
    form.querySelectorAll('[data-weekly-day]').forEach(function (row) {
      var key = row.dataset.weeklyDay, working = !row.querySelector('[data-weekly-off]').checked;
      next.weekly[key] = {working:working,start:working ? row.querySelector('[data-weekly-start]').value : '',end:working ? row.querySelector('[data-weekly-end]').value : '',breaks:working ? schedule.weekly[key].breaks : []};
    });
    var error = form.querySelector('[data-weekly-error]');
    if (!store.validateSchedule(next).ok) { error.textContent = 'Check each working day: end time must be after start time, and existing breaks must fit within the shift.'; return; }
    var result = store.createRequest({salonId:salonId,staffId:staffId,type:'weekly-schedule',date:selectedDate,weekly:next.weekly,reason:'Update my regular weekly schedule'});
    if (!result.ok) { error.textContent = 'Unable to save. Check your schedule permission and try again.'; return; }
    if (schedule.permission === 'self') {
      var applied = store.reviewRequest(result.request.id,'approve',appointmentRows());
      if (!applied.ok && applied.error.code !== 'booking-impact') {
        store.cancelRequest(result.request.id,staffId);
        error.textContent = 'Unable to apply this weekly schedule. Your current hours have not changed. Please try again.';
        return;
      }
      actionMessage = applied.ok ? 'Weekly schedule saved — no approval needed.' : 'Weekly schedule sent for manager review because existing bookings are affected. Current hours stay unchanged.';
    } else actionMessage = 'Weekly schedule sent — pending manager approval. Current hours stay unchanged.';
    form.closest('dialog').close();
    activeTab = 'requests'; requestType = ''; feedback = ''; render();
  }

  root.addEventListener('click', function (event) {
    var appointment = event.target.closest('[data-calendar-appointment]');
    if (appointment) { openAppointment(appointment.dataset.calendarAppointment); return; }
    var day = event.target.closest('[data-calendar-day]');
    if (day) { selectedDate = day.dataset.date; requestType = ''; render(); return; }
    var tab = event.target.closest('[data-calendar-tab]');
    if (tab) { activeTab = tab.dataset.calendarTab; requestType = ''; feedback = ''; render(); return; }
    if (event.target.closest('[data-calendar-today]')) { selectedDate = dateKey(new Date()); render(); return; }
    if (event.target.closest('[data-edit-weekly-schedule]')) { openWeeklySchedule(); return; }
    if (event.target.closest('[data-availability-toggle]')) { toggleAvailability(); return; }
    if (event.target.closest('[data-request-day-off]')) { openRequest('day-off'); return; }
    if (event.target.closest('[data-request-change-hours]')) { openRequest('change-hours'); return; }
    if (event.target.closest('[data-request-break]')) { openRequest('break'); return; }
    if (event.target.closest('[data-request-form-close]')) { requestType = ''; feedback = ''; render(); return; }
    if (event.target.closest('[data-chat-salon]')) { showToast('Chat with salon opened.'); return; }
    var cancel = event.target.closest('[data-request-cancel]');
    if (cancel) { store.cancelRequest(cancel.dataset.requestCancel, staffId); render(); }
  });
  root.addEventListener('submit', function (event) {
    if (!event.target.matches('[data-request-form]')) return;
    event.preventDefault();
    var form = event.target;
    var result = store.createRequest({salonId:salonId, staffId:staffId, type:requestType, date:form.querySelector('[data-request-date]').value, reason:form.querySelector('[data-request-reason]').value, start:form.querySelector('[data-request-start]') ? form.querySelector('[data-request-start]').value : '', end:form.querySelector('[data-request-end]') ? form.querySelector('[data-request-end]').value : ''});
    if (result.ok && schedulePermission() === 'self') {
      var applied = store.reviewRequest(result.request.id, 'approve', appointmentRows());
      if (!applied.ok && applied.error.code !== 'booking-impact') {
        store.cancelRequest(result.request.id, staffId);
        feedback = 'Check your hours and breaks, then try again.';
        render(); return;
      }
    }
    if (result.ok) {
      actionMessage = applied ? (applied.ok ? 'Changes saved. Your personal schedule is updated — no approval needed.' : 'Manager review needed: existing bookings are affected. Your schedule has not changed.') : 'Request sent — pending manager approval. Your current schedule has not changed.';
      requestType = ''; feedback = ''; render(); return;
    }
    feedback = result.error.code === 'request-not-allowed' ? 'Salon policy does not allow requests.' : 'Check the date and time, then try again.';
    render();
  });

  var unsubscribe = store.subscribe(function () { render(); });
  window.addEventListener('pagehide', unsubscribe, {once:true});
  render();
})();
