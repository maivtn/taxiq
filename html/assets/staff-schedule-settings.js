(function () {
  'use strict';

  var host = document.querySelector('[data-staff-schedule-settings]');
  var requestsHost = document.querySelector('[data-staff-requests-settings]');
  var requestFilter = 'open';
  var store = window.NEXORA_STAFF_SCHEDULE_STORE;
  var salonData = window.NEXORA_SALON_DATA;
  var appointmentStore = window.NEXORA_APPOINTMENTS_STORE;
  if (!host || !store || !salonData) return;
  var modalHost = document.createElement('div');
  modalHost.setAttribute('data-schedule-modal-host', '');
  document.body.appendChild(modalHost);
  var inlineHost = document.createElement('div');
  inlineHost.setAttribute('data-schedule-inline-host', '');
  var editorUi = {
    querySelector:function (selector) { return inlineHost.querySelector(selector) || modalHost.querySelector(selector); },
    querySelectorAll:function (selector) { return Array.from(inlineHost.querySelectorAll(selector)).concat(Array.from(modalHost.querySelectorAll(selector))); }
  };
  function onEditorEvent(type, listener) { inlineHost.addEventListener(type,listener); modalHost.addEventListener(type,listener); }
  var opener = null;

  var selectedStaff = '';
  var selectedDate = '';
  var boardDate = dateKey(new Date());
  var drawerOpen = false;
  var editorScope = 'weekly';
  var editorValues = null;
  var dateMode = 'inherit';
  var dateDraft = null;
  var breakForm = null;
  var editorMessage = '';
  var editorError = '';
  var boardMessage = '';
  var names = {mon:'Monday',tue:'Tuesday',wed:'Wednesday',thu:'Thursday',fri:'Friday',sat:'Saturday',sun:'Sunday'};
  var impactReview = null;
  var rejectId = '';
  var rejectionReason = '';
  var dayKeys = ['sun','mon','tue','wed','thu','fri','sat'];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];
    });
  }
  function dateKey(date) { return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0'); }
  function displayDate(value) { return new Date(value + 'T12:00:00').toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}); }
  function parseDisplayDate(value) {
    var match = value.trim().match(/^([a-z]{3})\s+(\d{1,2}),\s*(\d{4})$/i);
    if (!match) return '';
    var month = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(match[1].toLowerCase());
    if (month < 0) return '';
    var iso = match[3] + '-' + String(month + 1).padStart(2, '0') + '-' + match[2].padStart(2, '0');
    var date = new Date(iso + 'T12:00:00');
    return !Number.isNaN(date.getTime()) && dateKey(date) === iso ? iso : '';
  }
  function formatEditorDateFields() {
    editorUi.querySelectorAll('input[type="date"]').forEach(function (native) {
      var field = document.createElement('span');
      field.className = 'schedule-formatted-date';
      var text = document.createElement('input');
      text.type = 'text';
      text.setAttribute('data-date-display', '');
      text.setAttribute('aria-label', 'Date, for example Sep 29, 2026');
      text.placeholder = 'Sep 29, 2026';
      text.autocomplete = 'off';
      text.spellcheck = false;
      text.required = native.required;
      text.disabled = native.disabled;
      text.value = native.value ? displayDate(native.value) : '';
      native.before(field);
      field.appendChild(text);
      field.insertAdjacentHTML('beforeend', '<svg class="schedule-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>');
      native.classList.add('schedule-native-date');
      native.setAttribute('aria-label', 'Open date picker');
      field.appendChild(native);
    });
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function displayTime(value) { if (!value) return '—'; var parts = value.split(':'); var hour = Number(parts[0]); return (hour % 12 || 12) + ':' + parts[1] + (hour < 12 ? ' AM' : ' PM'); }
  function shiftLabel(day) { return day.working ? displayTime(day.start) + '–' + displayTime(day.end) : 'Day off'; }
  function selectedDayKey() { return dayKeys[new Date(selectedDate + 'T12:00:00').getDay()]; }
  function week() {
    var anchor = new Date(boardDate + 'T12:00:00');
    anchor.setDate(anchor.getDate() - (anchor.getDay() + 6) % 7);
    return Array.from({length:7}, function (_, index) { var day = new Date(anchor); day.setDate(anchor.getDate() + index); return day; });
  }
  function weekControls(days) {
    var range = displayDate(dateKey(days[0])) + ' – ' + displayDate(dateKey(days[6]));
    return '<section class="schedule-week-toolbar" aria-label="Choose schedule week"><div class="schedule-week-navigation"><span class="schedule-week-mode">Weekly</span><button type="button" data-schedule-week-step="-1" aria-label="Previous week"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6"/></svg></button><label class="schedule-week-picker"><span class="schedule-week-picker-label">Choose a date</span><input type="date" data-schedule-week-date value="' + esc(boardDate) + '" aria-label="Choose a date to view its week" aria-describedby="schedule-week-help" required></label><button type="button" data-schedule-week-step="1" aria-label="Next week"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6"/></svg></button><button type="button" data-schedule-this-week>This week</button></div><div class="schedule-week-caption"><strong data-schedule-week-range aria-live="polite">' + esc(range) + '</strong><small id="schedule-week-help">Pick any date to view its Monday–Sunday week.</small></div></section>';
  }
  function changeWeek(value, focusSelector) {
    var date = new Date(value + 'T12:00:00');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime()) || dateKey(date) !== value) {
      host.querySelector('[data-schedule-week-date]').value = boardDate;
      return;
    }
    boardDate = value;
    boardMessage = '';
    render(selectedStaff);
    host.querySelector(focusSelector)?.focus();
  }
  function appointments() { try { return appointmentStore ? appointmentStore.loadAll() : []; } catch (_) { return []; } }
  function statusLabel(status) { return {pending:'Pending review', adjusted:'Adjusted by manager', blocked:'Booking conflict', applied:'Approved & synced', rejected:'Rejected', cancelled:'Cancelled'}[status] || status; }
  function typeLabel(type) { return {'day-off':'Day off', 'change-hours':'Change hours', 'break':'Extra break', 'weekly-schedule':'Weekly schedule'}[type] || type; }
  function weeklySummary(weekly) { return ['mon','tue','wed','thu','fri','sat','sun'].map(function (key) { var day = weekly[key]; return key[0].toUpperCase() + key.slice(1) + ': ' + (day.working ? day.start + '–' + day.end : 'Day off'); }).join(' · '); }
  function requestProposal(request) { if (request.type === 'weekly-schedule') return weeklySummary(request.weekly); return request.type === 'day-off' ? 'Not working' : request.start + '–' + request.end; }
  function requestQueue(state, catalog) {
    var names = Object.fromEntries(catalog.technicians.map(function (person) { return [person.id, person.name]; }));
    var items = state.requests.filter(function (item) { return item.salonId === store.SALON_ID && matchesRequestFilter(item, requestFilter); }).sort(function (left, right) { return String(right.createdAt).localeCompare(String(left.createdAt)); });
    if (!items.length) return '<div class="schedule-empty">No requests in this view. Choose All requests or add demo requests.</div>';
    return items.map(function (request) {
      var active = ['pending','adjusted','blocked'].includes(request.status);
      var schedule = store.getStaffSchedule(request.salonId, request.staffId, {});
      var current = store.scheduleForDate(schedule, request.date);
      var rejection = active && rejectId === request.id ? '<form class="schedule-reject-form" data-request-reject-form="' + esc(request.id) + '"><label>Reason for rejection (required)<textarea data-rejection-reason rows="3" maxlength="500" required placeholder="Explain why this request cannot be approved">' + esc(rejectionReason) + '</textarea></label><small>The staff member will see this reason. Their schedule will stay unchanged.</small><div><button type="submit" class="schedule-reject-confirm">Confirm rejection</button><button type="button" data-reject-cancel>Cancel</button></div></form>' : '';
      return '<article class="schedule-request"><div class="schedule-request-main"><header><div><strong>' + esc(names[request.staffId] || request.staffId) + '</strong><small>' + esc(typeLabel(request.type)) + ' · ' + esc(displayDate(request.date)) + '</small></div><span class="request-status is-' + esc(request.status) + '">' + esc(statusLabel(request.status)) + '</span></header><div class="schedule-request-compare"><p><small>Current</small><strong>' + esc(request.type === 'weekly-schedule' ? weeklySummary(schedule.weekly) : current.working ? current.start + '–' + current.end : 'Day off') + '</strong></p><span>→</span><p><small>Requested</small><strong>' + esc(requestProposal(request)) + '</strong></p></div><p>' + esc(request.reason || 'No reason provided') + '</p>' + (request.status === 'blocked' ? '<small class="schedule-conflict-note">' + (request.bookingImpactIds || []).length + ' booking(s) must be resolved before approval.</small>' : '') + (request.status === 'rejected' && request.rejectionReason ? '<p class="schedule-rejection-note"><strong>Rejection reason:</strong> ' + esc(request.rejectionReason) + '</p>' : '') + rejection + '</div>' + (active && rejectId !== request.id ? '<div class="schedule-request-actions"><button type="button" data-request-reject="' + esc(request.id) + '">Reject</button><button type="button" class="booking-primary-button" data-request-approve="' + esc(request.id) + '">' + (request.status === 'blocked' ? 'Check & approve again' : 'Approve & sync') + '</button></div>' : '') + '</article>';
    }).join('');
  }
  function matchesRequestFilter(item, filter) {
    return filter === 'all' || (filter === 'open' ? ['pending','adjusted','blocked'].includes(item.status) : item.status === filter);
  }
  function requestInbox(state, catalog) {
    var requests = state.requests.filter(function (item) { return item.salonId === store.SALON_ID; });
    var filters = {open:'Needs review',applied:'Approved',rejected:'Rejected',all:'All requests'};
    return '<aside class="schedule-request-queue" data-schedule-requests><header><div><h2>Staff Requests</h2><p>Review staff days off, hours, breaks and weekly schedules.</p></div><button type="button" data-add-request-demo>Add 3 demo requests</button></header><nav class="staff-request-filters" aria-label="Filter staff requests">' + Object.keys(filters).map(function (key) { var count = requests.filter(function (item) { return matchesRequestFilter(item,key); }).length; return '<button type="button" data-request-filter="' + key + '" aria-pressed="' + (key === requestFilter) + '">' + filters[key] + ' <span>' + count + '</span></button>'; }).join('') + '</nav><p class="staff-request-help">Approve applies the change. Reject keeps the current schedule. Booking conflicts need review before approval. Demo data is saved in this browser.</p>' + requestQueue(state,catalog) + '</aside>';
  }
  function addRequestDemo() {
    var people = salonData.loadCatalog().technicians.filter(function (person) { return person.active !== false && store.getStaffSchedule(store.SALON_ID,person.id,{}).permission !== 'none'; });
    if (!people.length) { boardMessage = 'No staff with schedule request permission. Enable requests for a staff member first.'; render(selectedStaff); return; }
    var samples = [{type:'day-off',reason:'Demo · Family appointment — requesting a day off.'},{type:'change-hours',start:'09:00',end:'18:00',reason:'Demo · Need to leave early for a school appointment.'},{type:'break',start:'15:00',end:'15:15',reason:'Demo · Short personal appointment.'}];
    var added = 0;
    requestFilter = 'open';
    samples.forEach(function (sample,index) {
      var person = people[index % people.length], date = new Date(); date.setHours(12,0,0,0); date.setDate(date.getDate() + 14 + index);
      var schedule = store.getStaffSchedule(store.SALON_ID,person.id,{});
      if (sample.type !== 'day-off') { for (var offset = 0; offset < 7 && !store.scheduleForDate(schedule,dateKey(date)).working; offset++) date.setDate(date.getDate() + 1); }
      var result = store.createRequest(Object.assign({salonId:store.SALON_ID,staffId:person.id,date:dateKey(date)},sample));
      if (result.ok) added++;
    });
    boardMessage = added + ' demo requests added. Select Approve or Reject to demo a decision.';
    render(selectedStaff);
  }
  function breakRows(day, key, readOnly) {
    if (!day.working) return '';
    return '<div class="schedule-shift-breaks"><span>Breaks</span>' + (day.breaks || []).map(function (item, index) {
      return '<span class="schedule-break-chip"><span>' + esc(displayTime(item.start) + '–' + displayTime(item.end)) + '</span>' + (readOnly ? '' : '<button type="button" data-break-edit="' + index + '" data-break-key="' + esc(key) + '" aria-label="Edit break for ' + esc(key === 'date' ? displayDate(selectedDate) : names[key]) + '">Edit</button><button type="button" data-break-remove="' + index + '" data-break-key="' + esc(key) + '" aria-label="Remove break">×</button>') + '</span>';
    }).join('') + (!day.breaks.length ? '<small>No breaks</small>' : '') + (readOnly ? '' : '<button type="button" data-break-add="' + esc(key) + '">+ Add break</button>') + '</div>';
  }
  function weeklyEditor() {
    var template = document.querySelector('[data-tech-modal] .tech-schedule');
    var calendar = template.cloneNode(true);
    calendar.removeAttribute('data-tech-field');
    calendar.setAttribute('data-schedule-calendar', '');
    calendar.querySelectorAll('.tech-schedule-row').forEach(function (row) {
      var off = row.querySelector('[data-tech-day-off]');
      var key = off.dataset.techDayOff;
      if (editorScope === 'date' && key !== selectedDayKey()) { row.remove(); return; }
      var day = editorScope === 'weekly' ? editorValues.weekly[key] : dateDraft;
      var name = row.querySelector('.tech-schedule-day').textContent;
      row.dataset.scheduleEditDay = key;
      if (editorScope === 'date') row.querySelector('.tech-schedule-day').textContent = displayDate(selectedDate);
      off.removeAttribute('data-tech-day-off');
      off.setAttribute('data-schedule-off', key);
      off.setAttribute('aria-label', name + ' day off');
      off.checked = !day.working;
      if (editorScope === 'date') off.closest('label').remove();
      if (off.checked) off.setAttribute('checked', ''); else off.removeAttribute('checked');
      row.classList.toggle('is-day-off', off.checked);
      ['start', 'end'].forEach(function (field) {
        var input = row.querySelector('[data-tech-schedule-' + field + ']');
        input.removeAttribute('data-tech-schedule-' + field);
        input.setAttribute('data-schedule-' + field, key);
        input.setAttribute('aria-label', name + ' ' + field + ' time');
        input.setAttribute('value', day[field]);
        input.disabled = !day.working || (editorScope === 'date' && dateMode !== 'custom-hours');
      });
      var breaks = document.createElement('div');
      breaks.className = 'schedule-row-breaks';
      breaks.innerHTML = breakRows(day, editorScope === 'weekly' ? key : 'date', editorScope === 'date' && dateMode !== 'custom-hours');
      row.appendChild(breaks);
    });
    return calendar.outerHTML;
  }
  function editor() {
    if (!drawerOpen) return '<section class="schedule-editor-empty" data-schedule-inline aria-label="Edit staff schedule"><h2>Edit staff schedule</h2><p>Choose a staff member below, or select a day in the weekly schedule above.</p><div>' + salonData.loadCatalog().technicians.filter(function (person) { return person.active !== false; }).map(function (person) { return '<button type="button" data-inline-staff="' + esc(person.id) + '">' + esc(person.name) + '</button>'; }).join('') + '</div></section>';
    var source = editorValues;
    var staff = salonData.loadCatalog().technicians.find(function (person) { return person.id === selectedStaff; });
    var tabs = {weekly:'Weekly schedule',date:'Date changes',permissions:'Staff permissions'};
    var content = editorScope === 'weekly' ? '<div class="schedule-explainer"><strong>Regular hours, repeated every week</strong><p>Set each working day and its breaks. For a vacation, late start or extra break on one date, use Date changes.</p></div><section class="tech-modal-section">' + weeklyEditor() + '</section><p class="schedule-help">Date changes override these hours on their selected dates.</p>' : (editorScope === 'date' ? datePanel() : '<div class="schedule-explainer"><strong>Who can change this staff member’s availability?</strong><p>This controls changes to this staff member’s own hours, days off and breaks — not the salon’s opening hours or other staff schedules.</p></div><label>Staff availability permission<select class="schedule-select" data-schedule-permission><option value="none" ' + (source.permission === 'none' ? 'selected' : '') + '>View only — manager edits staff schedule</option><option value="request" ' + (source.permission !== 'none' && source.permission !== 'self' ? 'selected' : '') + '>Edit own schedule — approval required</option><option value="self" ' + (source.permission === 'self' ? 'selected' : '') + '>Edit own schedule — no approval needed</option></select></label><div class="schedule-permission-note"><strong>Your salon sets the approval rule</strong><p>Approval required: changes stay pending until a manager approves. No approval needed: staff changes apply directly. Changes affecting existing bookings still need manager resolution; bookings are never automatically cancelled or reassigned.</p></div>');
    return '<aside class="schedule-drawer schedule-inline-editor" data-schedule-inline data-schedule-drawer role="region" aria-labelledby="schedule-drawer-title" ' + (breakForm || impactReview ? 'inert' : '') + '><header><div class="schedule-editor-heading"><div class="schedule-staff-identity"><strong class="schedule-staff-name">' + esc(staff ? staff.name : selectedStaff) + '</strong><span class="schedule-staff-salon">' + esc(salonData.loadCatalog().salon.name) + '</span></div><h2 id="schedule-drawer-title" tabindex="-1">Edit staff schedule</h2></div><button type="button" data-schedule-close aria-label="Close schedule editor">×</button></header><div class="schedule-editor-tabs" role="tablist" aria-label="Schedule settings">' + Object.keys(tabs).map(function (key) { return '<button type="button" role="tab" id="schedule-tab-' + key + '" aria-controls="schedule-editor-panel" aria-selected="' + (editorScope === key) + '" data-schedule-scope="' + key + '">' + tabs[key] + '</button>'; }).join('') + '</div><section id="schedule-editor-panel" role="tabpanel" aria-labelledby="schedule-tab-' + editorScope + '">' + content + '</section><p class="schedule-form-error" data-schedule-error role="alert">' + esc(editorError) + '</p><p class="schedule-editor-message" role="status">' + esc(editorMessage) + '</p><footer><small>Save draft keeps edits private. Publish applies all three sections to Booking (demo).</small><div><button type="button" data-schedule-close>Cancel</button><button type="button" data-schedule-save-draft>Save draft</button><button type="button" class="booking-primary-button" data-schedule-publish>Publish schedule</button></div></footer></aside>' + breakDialog();
  }
  function datePanel() {
    var dates = Object.keys(editorValues.exceptions).sort();
    var inherited = editorValues.weekly[selectedDayKey()];
    return '<div class="schedule-explainer"><strong>Change one date, keep the weekly schedule</strong><p>Use for a day off, different hours or an extra break. The selected date’s hours and breaks replace its weekly schedule.</p></div><div class="schedule-date-controls"><label>Date<input type="date" data-schedule-edit-date value="' + esc(selectedDate) + '"></label><label>Schedule for this date<select class="schedule-select" data-date-mode><option value="inherit" ' + (dateMode === 'inherit' ? 'selected' : '') + '>Use weekly schedule</option><option value="day-off" ' + (dateMode === 'day-off' ? 'selected' : '') + '>Day off — all day</option><option value="custom-hours" ' + (dateMode === 'custom-hours' ? 'selected' : '') + '>Custom hours & breaks</option></select></label></div><p class="schedule-help">Regular ' + names[selectedDayKey()] + ': ' + esc(shiftLabel(inherited)) + '.</p>' + (dateMode === 'day-off' ? '<div class="schedule-permission-note">Not available for new bookings on ' + esc(displayDate(selectedDate)) + '. Existing appointments will be checked when you publish.</div>' : weeklyEditor()) + (dateMode === 'inherit' && inherited.working ? '<button type="button" data-break-add="date">+ Add break for this date only</button>' : '') + '<div class="schedule-date-list"><h3>Date changes in this schedule (' + dates.length + ')</h3>' + (dates.length ? dates.map(function (date) { var day = store.scheduleForDate(editorValues, date); return '<div><span><strong>' + esc(displayDate(date)) + '</strong><small>' + esc(shiftLabel(day)) + (day.working ? ' · ' + day.breaks.length + ' break(s)' : '') + '</small></span><button type="button" data-date-edit="' + esc(date) + '">Edit</button><button type="button" data-date-reset="' + esc(date) + '">Use weekly</button></div>'; }).join('') : '<p>No date changes. Weekly hours apply to every date.</p>') + '</div>';
  }
  function breakDialog() {
    if (!breakForm) return '';
    var weekly = breakForm.scope === 'weekly';
    return '<div class="schedule-break-backdrop" data-break-cancel></div><form class="schedule-break-dialog" data-break-form role="dialog" aria-modal="true" aria-labelledby="schedule-break-title"><header><div><h2 id="schedule-break-title">' + (breakForm.index === null ? 'Add break' : 'Edit break') + '</h2><p>' + (weekly ? 'Repeats every week on the selected weekday.' : 'Applies to one date only. Weekly breaks stay unchanged.') + '</p></div><button type="button" data-break-cancel aria-label="Close break form">×</button></header><div class="schedule-break-fields"><label class="schedule-break-target">' + (weekly ? 'Weekday<select class="schedule-select" data-break-target ' + (breakForm.index !== null ? 'disabled' : '') + '>' + Object.keys(names).map(function (key) { return '<option value="' + key + '" ' + (key === breakForm.key ? 'selected' : '') + '>' + names[key] + '</option>'; }).join('') + '</select>' : 'Date<input type="date" data-break-target value="' + esc(breakForm.key) + '" ' + (breakForm.index !== null ? 'disabled' : '') + ' required>') + '</label><label>Start time<input type="time" data-break-start value="' + esc(breakForm.start) + '" required></label><label>End time<input type="time" data-break-end value="' + esc(breakForm.end) + '" required></label></div><p class="schedule-form-error" data-break-error role="alert"></p><footer><button type="button" data-break-cancel>Cancel</button><button type="submit" class="booking-primary-button">Save break</button></footer><small>Added to this edit. Booking changes only after Publish schedule.</small></form>';
  }
  function impactDialog() {
    if (!impactReview) return '<div data-request-impact hidden></div>';
    var rows = impactReview.impacts || [];
    return '<div class="schedule-impact-backdrop"></div><section class="schedule-impact" data-request-impact role="dialog" aria-modal="true"><header><div><small>Approval paused</small><h2>Resolve affected bookings</h2></div><button type="button" data-impact-close aria-label="Close">×</button></header><p>This change has not been published. Reassign or reschedule these bookings, then approve again.</p><div class="schedule-impact-list">' + rows.map(function (item) { return '<a href="booking-book-phase-1.html?tab=booking&appointment=' + encodeURIComponent(item.appointmentId) + '"><strong>' + esc(item.customerName) + '</strong><span>' + esc(displayDate(item.startAt.slice(0, 10)) + ' · ' + item.startAt.slice(11, 16)) + '</span><small>Open booking →</small></a>'; }).join('') + '</div><footer><button type="button" data-impact-close>Keep request blocked</button><a class="booking-primary-button" href="booking-book-phase-1.html?tab=booking">Open Booking Book</a></footer></section>';
  }
  function render(preselect) {
    if (preselect) selectedStaff = preselect;
    var catalog = salonData.loadCatalog();
    var people = catalog.technicians.filter(function (person) { return person.active !== false; });
    var days = week();
    var appointmentList = appointments();
    var state = store.loadState();
    var working = 0, slots = 0, conflicts = 0;
    var body = people.map(function (person) {
      var schedule = store.getStaffSchedule(store.SALON_ID, person.id, {});
      var cells = days.map(function (date) {
        var key = dateKey(date);
        var availability = store.availabilityForDay({staffSchedule:schedule, technicianId:person.id, date:key, appointments:appointmentList});
        var dayConflicts = availability.conflicts.filter(function (item) { return item.startAt.slice(0, 10) === key; });
        if (availability.working) working++;
        slots += availability.openSlots.length;
        conflicts += dayConflicts.length;
        return '<button type="button" class="schedule-day' + (!availability.working ? ' is-off' : '') + (dayConflicts.length ? ' has-conflict' : '') + '" data-schedule-day data-schedule-staff="' + esc(person.id) + '" data-schedule-date="' + key + '"><strong>' + (availability.working ? esc(availability.start + '–' + availability.end) : 'Day off') + '</strong><small>' + availability.openSlots.length + ' open · ' + availability.appointments.length + ' booked</small></button>';
      }).join('');
      return '<div class="schedule-row" data-schedule-staff="' + esc(person.id) + '"><strong>' + esc(person.name) + '</strong>' + cells + '</div>';
    }).join('');
    host.innerHTML = '<header class="schedule-heading"><div><h2>Staff Schedule &amp; Booking Availability</h2><p>Manager publishes working hours. Staff changes arrive as requests.</p></div><div class="schedule-actions"><select class="schedule-select" aria-label="Salon"><option>Bitcoin Nail Bar</option></select><span data-schedule-sync-status>' + (state.salons[store.SALON_ID]?.syncedAt ? 'Synced to Booking' : 'Ready to sync') + '</span></div></header>' + weekControls(days) + '<div class="schedule-summary"><div class="schedule-card" data-schedule-summary="working"><strong>' + working + '</strong><span>Working staff-days</span></div><div class="schedule-card"><strong>' + slots + '</strong><span>Open slots</span></div><div class="schedule-card"><strong>' + conflicts + '</strong><span>Booking conflicts</span></div><div class="schedule-card"><strong>' + people.length + '</strong><span>Staff members</span></div></div><div class="schedule-week" data-schedule-week><div class="schedule-row"><span>Staff</span>' + days.map(function (date) { return '<span>' + date.toLocaleDateString('en-US', {weekday:'short'}) + '<br>' + displayDate(dateKey(date)) + '</span>'; }).join('') + '</div>' + body + '</div>' + requestInbox(state,catalog) + editor() + impactDialog();
    var openCount = state.requests.filter(function (item) { return item.salonId === store.SALON_ID && matchesRequestFilter(item,'open'); }).length;
    document.querySelectorAll('[data-staff-requests-count]').forEach(function (badge) { badge.textContent = openCount; badge.setAttribute('aria-label',openCount + ' requests need review'); });
    if (requestsHost) {
      requestsHost.replaceChildren(host.querySelector('[data-schedule-requests]'));
    }
    inlineHost.replaceChildren(host.querySelector('[data-schedule-inline]'));
    modalHost.replaceChildren();
    Array.from(host.querySelectorAll('.schedule-impact-backdrop,[data-request-impact],.schedule-break-backdrop,[data-break-form]')).forEach(function (node) { modalHost.appendChild(node); });
    host.appendChild(inlineHost);
    formatEditorDateFields();
    if (drawerOpen && store.loadState().drafts[store.SALON_ID]?.[selectedStaff]) {
      editorUi.querySelector('[data-schedule-save-draft]').insertAdjacentHTML('beforebegin', '<button type="button" data-schedule-discard>Discard saved draft</button>');
    }
    if (boardMessage) modalHost.insertAdjacentHTML('beforeend', '<div class="schedule-toast" role="status">' + esc(boardMessage) + '<button type="button" data-schedule-toast-close aria-label="Dismiss message">×</button></div>');
    // The editor is inline; only break and booking-impact dialogs live outside the panel.
    if (breakForm) editorUi.querySelector('[data-break-form] input:not(:disabled),[data-break-form] select:not(:disabled)')?.focus();
    else if (impactReview) editorUi.querySelector('[data-impact-close]')?.focus();
    else if (drawerOpen) editorUi.querySelector('#schedule-drawer-title')?.focus({preventScroll:true});
  }
  function snapshotEditor() {
    if (!drawerOpen || !editorValues) return;
    editorUi.querySelectorAll('[data-schedule-edit-day]').forEach(function (row) {
      if (editorScope === 'date' && dateMode !== 'custom-hours') return;
      var day = editorScope === 'weekly' ? editorValues.weekly[row.dataset.scheduleEditDay] : dateDraft;
      var off = row.querySelector('[data-schedule-off]');
      day.working = off ? !off.checked : true;
      day.start = row.querySelector('[data-schedule-start]').value;
      day.end = row.querySelector('[data-schedule-end]').value;
    });
    var permission = editorUi.querySelector('[data-schedule-permission]');
    if (permission) editorValues.permission = permission.value;
    if (editorScope === 'date') updateDateDraft();
  }
  function updateDateDraft() {
    if (dateMode === 'inherit') return;
    editorValues.exceptions[selectedDate] = dateMode === 'day-off' ? {type:'day-off',start:'',end:'',breaks:[]} : {type:'custom-hours',start:dateDraft.start,end:dateDraft.end,breaks:clone(dateDraft.breaks)};
  }
  function loadDate() {
    var exception = editorValues.exceptions[selectedDate];
    dateMode = exception ? exception.type : 'inherit';
    dateDraft = store.scheduleForDate(editorValues, selectedDate);
  }
  function editorSchedule() {
    var schedule = clone(editorValues);
    dayKeys.forEach(function (key) { if (!schedule.weekly[key].working) schedule.weekly[key] = {working:false,start:'',end:'',breaks:[]}; });
    return schedule;
  }
  function showError(text) { editorError = text; var target = editorUi.querySelector('[data-schedule-error]'); if (target) { target.textContent = text; target.scrollIntoView?.({block:'nearest'}); } }
  function markEditorChanged() {
    editorMessage = 'Unsaved changes. Save draft or publish when ready.';
    editorError = '';
    var message = editorUi.querySelector('.schedule-editor-message');
    var error = editorUi.querySelector('[data-schedule-error]');
    if (message) message.textContent = editorMessage;
    if (error) error.textContent = '';
  }
  function saveDraft() {
    var invalidDate = editorUi.querySelector('[data-date-display]:invalid');
    if (invalidDate) { invalidDate.reportValidity(); return false; }
    snapshotEditor();
    var schedule = editorSchedule();
    var check = store.validateSchedule(schedule);
    Object.keys(schedule.exceptions).forEach(function (date) {
      var item = schedule.exceptions[date];
      if (item.type === 'day-off') return;
      var result = store.validateSchedule({weekly:{mon:Object.assign({working:true},item)},exceptions:{}});
      result.errors.forEach(function (error) { check.errors.push(Object.assign({},error,{day:date})); });
      if (!result.ok) check.ok = false;
    });
    if (!check.ok) { var error = check.errors[0]; showError((names[error.day] || displayDate(error.day)) + ': end time must follow start time; breaks must fit inside the shift and not overlap.'); return false; }
    var result = store.saveDraft(store.SALON_ID, selectedStaff, schedule);
    if (!result.ok) { showError('Unable to save draft.'); return false; }
    editorError = '';
    editorMessage = 'Draft saved. Booking still uses the published schedule.';
    render(selectedStaff);
    return true;
  }
  function showImpacts(kind, id, impacts) { impactReview = {kind:kind, id:id, impacts:impacts}; render(selectedStaff); }
  function publish() {
    var result = store.publishDraft(store.SALON_ID, selectedStaff, appointments(), []);
    if (result.ok) { drawerOpen = false; impactReview = null; boardMessage = 'Schedule published. Staff calendar and Booking availability updated in this demo.'; render(selectedStaff); return; }
    if (result.error.code === 'booking-impact') { showImpacts('publish', selectedStaff, result.error.impacts); return; }
    showError('Schedule could not be published.');
  }
  function review(id, decision, reason) {
    var result = store.reviewRequest(id, decision, appointments(), undefined, undefined, reason);
    if (!result.ok && result.error.code === 'booking-impact') { showImpacts('request', id, result.error.impacts); return; }
    boardMessage = result.ok ? (decision === 'reject' ? 'Request rejected. The staff schedule is unchanged.' : 'Request approved. The staff schedule is updated in this demo.') : 'Unable to review this request. Please check its current status.';
    impactReview = null;
    if (result.ok) { rejectId = ''; rejectionReason = ''; if (decision === 'reject') requestFilter = 'rejected'; }
    render(selectedStaff);
  }
  function loadEditorDay() {
    boardMessage = '';
    editorValues = store.getStaffSchedule(store.SALON_ID, selectedStaff, {includeDraft:true});
    breakForm = null;
    editorError = '';
    editorMessage = store.loadState().drafts[store.SALON_ID]?.[selectedStaff] ? 'Saved draft loaded. Not published to Booking yet.' : '';
    loadDate();
  }

  onEditorEvent('input', function (event) {
    if (event.target.matches('[data-date-display]')) {
      event.target.setCustomValidity(parseDisplayDate(event.target.value) ? '' : 'Enter a valid date, for example Sep 29, 2026.');
    }
  });
  onEditorEvent('change', function (event) {
    if (event.target.matches('[data-date-display]')) {
      var iso = parseDisplayDate(event.target.value);
      event.target.setCustomValidity(iso ? '' : 'Enter a valid date, for example Sep 29, 2026.');
      if (!iso) { event.target.reportValidity(); return; }
      var native = event.target.parentElement.querySelector('input[type="date"]');
      native.value = iso;
      event.target.value = displayDate(iso);
      native.dispatchEvent(new Event('change', {bubbles:true}));
      return;
    }
    if (event.target.matches('input[type="date"]')) {
      var display = event.target.parentElement.querySelector('[data-date-display]');
      if (display) { display.value = event.target.value ? displayDate(event.target.value) : ''; display.setCustomValidity(''); }
    }
    if (event.target.closest('[data-break-form]')) {
      var form = event.target.closest('[data-break-form]');
      breakForm.key = form.querySelector('[data-break-target]').value;
      breakForm.start = form.querySelector('[data-break-start]').value;
      breakForm.end = form.querySelector('[data-break-end]').value;
      form.querySelector('[data-break-error]').textContent = '';
      return;
    }
    if (event.target.matches('[data-schedule-edit-date]')) {
      if (!event.target.value) {
        event.target.value = selectedDate;
        event.target.parentElement.querySelector('[data-date-display]').value = displayDate(selectedDate);
        return;
      }
      snapshotEditor();
      selectedDate = event.target.value;
      loadDate();
      render(selectedStaff);
      return;
    }
    if (event.target.matches('[data-date-mode]')) {
      snapshotEditor();
      dateMode = event.target.value;
      if (dateMode === 'inherit') { delete editorValues.exceptions[selectedDate]; loadDate(); }
      else if (dateMode === 'custom-hours') {
        if (!dateDraft.working) dateDraft = {working:true,start:'09:00',end:'19:00',breaks:[]};
        updateDateDraft();
      } else updateDateDraft();
      markEditorChanged();
      render(selectedStaff);
      return;
    }
    snapshotEditor();
    if (event.target.matches('[data-schedule-off]') && !event.target.checked) {
      var day = editorValues.weekly[event.target.dataset.scheduleOff];
      day.start = day.start || '09:00'; day.end = day.end || '19:00';
    }
    markEditorChanged();
    if (event.target.matches('[data-schedule-off]')) render(selectedStaff);
  });
  function saveBreak(form) {
    var key = form.querySelector('[data-break-target]').value;
    var start = form.querySelector('[data-break-start]').value;
    var end = form.querySelector('[data-break-end]').value;
    var error = form.querySelector('[data-break-error]');
    if (!key || !start || !end) { error.textContent = 'Choose the day and both times.'; return; }
    var day = clone(breakForm.scope === 'weekly' ? editorValues.weekly[key] : store.scheduleForDate(editorValues, key));
    if (!day.working) { error.textContent = 'This is a day off. Choose a working day or change its hours first.'; return; }
    if (breakForm.index === null) day.breaks.push({start:start,end:end});
    else day.breaks[breakForm.index] = {start:start,end:end};
    var check = store.validateSchedule({weekly:{mon:day},exceptions:{}});
    if (!check.ok) { error.textContent = 'Break must fit inside ' + shiftLabel(day) + ', end after it starts and not overlap another break.'; return; }
    day.breaks.sort(function (a, b) { return a.start.localeCompare(b.start); });
    if (breakForm.scope === 'weekly') editorValues.weekly[key] = day;
    else {
      selectedDate = key;
      editorValues.exceptions[key] = {type:'custom-hours',start:day.start,end:day.end,breaks:day.breaks};
      loadDate();
    }
    breakForm = null;
    editorMessage = 'Break saved in this edit. Publish to update Booking.';
    render(selectedStaff);
  }
  onEditorEvent('submit', function (event) { if (event.target.matches('[data-break-form]')) { event.preventDefault(); saveBreak(event.target); } });
  function handleRequestSubmit(event) {
    var rejectionForm = event.target.closest('[data-request-reject-form]');
    if (rejectionForm) {
      event.preventDefault();
      var reasonInput = rejectionForm.querySelector('[data-rejection-reason]');
      rejectionReason = reasonInput.value;
      reasonInput.setCustomValidity(rejectionReason.trim() ? '' : 'Enter a reason for rejection.');
      if (!rejectionForm.reportValidity()) return;
      review(rejectionForm.dataset.requestRejectForm, 'reject', rejectionReason.trim());
      return;
    }
  }
  function handleRejectionInput(event) {
    if (!event.target.matches('[data-rejection-reason]')) return;
    rejectionReason = event.target.value;
    event.target.setCustomValidity('');
  }
  host.addEventListener('input', handleRejectionInput);
  if (requestsHost) requestsHost.addEventListener('input', handleRejectionInput);
  host.addEventListener('submit', handleRequestSubmit);
  if (requestsHost) requestsHost.addEventListener('submit', handleRequestSubmit);
  function handleClick(event) {
    var inlineStaff = event.target.closest('[data-inline-staff]');
    if (inlineStaff) { openEditor(inlineStaff.dataset.inlineStaff,inlineStaff); return; }
    if (event.target.closest('[data-add-request-demo]')) { addRequestDemo(); return; }
    var filter = event.target.closest('[data-request-filter]');
    if (filter) { requestFilter = filter.dataset.requestFilter; rejectId = ''; rejectionReason = ''; render(selectedStaff); requestsHost?.querySelector('[data-request-filter="' + requestFilter + '"]')?.focus(); return; }
    var picker = event.target.closest('.schedule-native-date');
    if (picker && typeof picker.showPicker === 'function') {
      try { picker.showPicker(); event.preventDefault(); } catch (_) { /* Keep the native picker fallback. */ }
      return;
    }
    var weekStep = event.target.closest('[data-schedule-week-step]');
    if (weekStep) {
      var nextWeek = new Date(boardDate + 'T12:00:00');
      nextWeek.setDate(nextWeek.getDate() + Number(weekStep.dataset.scheduleWeekStep) * 7);
      changeWeek(dateKey(nextWeek), '[data-schedule-week-step="' + weekStep.dataset.scheduleWeekStep + '"]');
      return;
    }
    if (event.target.closest('[data-schedule-this-week]')) { changeWeek(dateKey(new Date()), '[data-schedule-this-week]'); return; }
    if (event.target.closest('[data-schedule-toast-close]')) { boardMessage = ''; editorUi.querySelector('.schedule-toast')?.remove(); return; }
    var day = event.target.closest('[data-schedule-day]');
    if (day) { opener = day; selectedStaff = day.dataset.scheduleStaff; selectedDate = day.dataset.scheduleDate; editorScope = 'date'; drawerOpen = true; loadEditorDay(); render(selectedStaff); inlineHost.scrollIntoView({block:'start',behavior:'smooth'}); return; }
    var tab = event.target.closest('[data-schedule-scope]');
    if (tab) { snapshotEditor(); editorScope = tab.dataset.scheduleScope; if (editorScope === 'date') loadDate(); render(selectedStaff); editorUi.querySelector('[data-schedule-scope="' + editorScope + '"]')?.focus(); return; }
    var dateAction = event.target.closest('[data-date-edit],[data-date-reset]');
    if (dateAction) {
      snapshotEditor();
      selectedDate = dateAction.dataset.dateEdit || dateAction.dataset.dateReset;
      if (dateAction.hasAttribute('data-date-reset')) { delete editorValues.exceptions[selectedDate]; markEditorChanged(); }
      loadDate(); render(selectedStaff); return;
    }
    if (event.target.closest('[data-schedule-close]')) { closeEditor(); return; }
    if (event.target.closest('[data-schedule-save-draft]')) { saveDraft(); return; }
    if (event.target.closest('[data-schedule-publish]')) { if (saveDraft()) publish(); return; }
    if (event.target.closest('[data-schedule-discard]')) {
      var discarded = store.discardDraft(store.SALON_ID, selectedStaff);
      if (!discarded.ok) { showError('Unable to discard the saved draft.'); return; }
      loadEditorDay(); editorMessage = 'Draft discarded. Showing the published schedule.'; render(selectedStaff); return;
    }
    var breakAction = event.target.closest('[data-break-add],[data-break-edit]');
    if (breakAction) {
      snapshotEditor();
      var key = breakAction.hasAttribute('data-break-add') ? breakAction.dataset.breakAdd : breakAction.dataset.breakKey;
      var index = breakAction.hasAttribute('data-break-edit') ? Number(breakAction.dataset.breakEdit) : null;
      var targetDay = key === 'date' ? dateDraft : editorValues.weekly[key];
      var item = index === null ? {start:'',end:''} : targetDay.breaks[index];
      breakForm = {scope:key === 'date' ? 'date' : 'weekly',key:key === 'date' ? selectedDate : key,index:index,start:item.start,end:item.end};
      render(selectedStaff); return;
    }
    if (event.target.closest('[data-break-cancel]')) { breakForm = null; render(selectedStaff); return; }
    var remove = event.target.closest('[data-break-remove]');
    if (remove) {
      snapshotEditor();
      var target = remove.dataset.breakKey === 'date' ? dateDraft : editorValues.weekly[remove.dataset.breakKey];
      target.breaks.splice(Number(remove.dataset.breakRemove), 1);
      if (remove.dataset.breakKey === 'date') updateDateDraft();
      editorMessage = 'Break removed in this edit. Publish to update Booking.';
      render(selectedStaff); return;
    }
    if (event.target.closest('[data-impact-close]')) { impactReview = null; render(selectedStaff); return; }
    var reject = event.target.closest('[data-request-reject]');
    if (reject) { rejectId = reject.dataset.requestReject; rejectionReason = ''; render(selectedStaff); (requestsHost || host).querySelector('[data-rejection-reason]')?.focus(); return; }
    if (event.target.closest('[data-reject-cancel]')) { rejectId = ''; rejectionReason = ''; render(selectedStaff); return; }
    var approve = event.target.closest('[data-request-approve]');
    if (approve) review(approve.dataset.requestApprove, 'approve');
  }
  host.addEventListener('click', function (event) { if (!event.composedPath().includes(inlineHost)) handleClick(event); });
  if (requestsHost) requestsHost.addEventListener('click', handleClick);
  host.addEventListener('change', function (event) {
    if (event.target.matches('[data-schedule-week-date]')) changeWeek(event.target.value, '[data-schedule-week-date]');
  });
  onEditorEvent('click', handleClick);
  function closeEditor() {
    drawerOpen = false;
    editorValues = null;
    breakForm = null;
    impactReview = null;
    render(selectedStaff);
    if (opener && opener.isConnected) opener.focus();
  }
  function openEditor(staffId, trigger) {
    document.querySelector('[data-settings-tab="staff-schedule"]')?.click();
    selectedStaff = staffId;
    selectedDate = dateKey(new Date());
    editorScope = 'weekly';
    drawerOpen = true;
    opener = trigger;
    loadEditorDay();
    render(selectedStaff);
    inlineHost.scrollIntoView({block:'start',behavior:'smooth'});
  }
  onEditorEvent('keydown', function (event) {
    if (event.target.matches('[data-schedule-scope]') && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      event.preventDefault();
      var tabs = Array.from(editorUi.querySelectorAll('[data-schedule-scope]'));
      var index = tabs.indexOf(event.target);
      var next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      tabs[next].click(); return;
    }
    if (event.key === 'Escape') { event.preventDefault(); if (breakForm) { breakForm = null; render(selectedStaff); } else if (impactReview) { impactReview = null; render(selectedStaff); } else closeEditor(); }
    if (event.key !== 'Tab') return;
    var dialog = editorUi.querySelector('[data-break-form]') || editorUi.querySelector('[data-request-impact]:not([hidden])');
    if (!dialog) return;
    var controls = Array.from(dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]'));
    var first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement.id === 'schedule-drawer-title')) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  var unsubscribe = store.subscribe(function () { render(selectedStaff); });
  window.addEventListener('pagehide', unsubscribe, {once:true});
  window.NEXORA_STAFF_SCHEDULE_SETTINGS = {refresh:render,open:openEditor};
  render(new URLSearchParams(location.search).get('staff') || '');
})();
