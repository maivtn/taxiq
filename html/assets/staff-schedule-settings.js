(function () {
  'use strict';

  var host = document.querySelector('[data-staff-schedule-settings]');
  var store = window.NEXORA_STAFF_SCHEDULE_STORE;
  var salonData = window.NEXORA_SALON_DATA;
  var appointmentStore = window.NEXORA_APPOINTMENTS_STORE;
  if (!host || !store || !salonData) return;
  var modalHost = document.createElement('div');
  modalHost.setAttribute('data-schedule-modal-host', '');
  document.body.appendChild(modalHost);
  var opener = null;

  var selectedStaff = '';
  var selectedDate = '';
  var drawerOpen = false;
  var editorScope = 'weekly';
  var breakDay = 'mon';
  var editorBreaks = [];
  var editorValues = null;
  var impactReview = null;
  var adjustId = '';
  var dayKeys = ['sun','mon','tue','wed','thu','fri','sat'];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];
    });
  }
  function dateKey(date) { return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0'); }
  function selectedDayKey() { return dayKeys[new Date(selectedDate + 'T12:00:00').getDay()]; }
  function week() {
    var anchor = new Date();
    anchor.setHours(12, 0, 0, 0);
    anchor.setDate(anchor.getDate() - anchor.getDay());
    return Array.from({length:7}, function (_, index) { var day = new Date(anchor); day.setDate(anchor.getDate() + index); return day; });
  }
  function appointments() { try { return appointmentStore ? appointmentStore.loadAll() : []; } catch (_) { return []; } }
  function statusLabel(status) { return {pending:'Pending review', adjusted:'Adjusted by manager', blocked:'Booking conflict', applied:'Approved & synced', rejected:'Rejected', cancelled:'Cancelled'}[status] || status; }
  function typeLabel(type) { return {'day-off':'Day off', 'change-hours':'Change hours', 'break':'Extra break'}[type] || type; }
  function requestProposal(request) { return request.type === 'day-off' ? 'Not working' : request.start + '–' + request.end; }
  function requestQueue(state, catalog) {
    var names = Object.fromEntries(catalog.technicians.map(function (person) { return [person.id, person.name]; }));
    var items = state.requests.slice().sort(function (left, right) { return String(right.createdAt).localeCompare(String(left.createdAt)); });
    if (!items.length) return '<div class="schedule-empty">No schedule requests.</div>';
    return items.map(function (request) {
      var active = ['pending','adjusted','blocked'].includes(request.status);
      var schedule = store.getStaffSchedule(request.salonId, request.staffId, {});
      var current = store.scheduleForDate(schedule, request.date);
      var adjust = adjustId === request.id ? '<form class="schedule-adjust-form" data-request-adjust-form="' + esc(request.id) + '"><label>Date<input type="date" data-adjust-date value="' + esc(request.date) + '" required></label>' + (request.type === 'day-off' ? '' : '<label>Start<input type="time" data-adjust-start value="' + esc(request.start) + '" required></label><label>End<input type="time" data-adjust-end value="' + esc(request.end) + '" required></label>') + '<label>Manager note<input type="text" data-adjust-reason value="' + esc(request.reason) + '"></label><button type="submit">Save adjustment</button><button type="button" data-adjust-close>Cancel</button></form>' : '';
      return '<article class="schedule-request"><div class="schedule-request-main"><header><div><strong>' + esc(names[request.staffId] || request.staffId) + '</strong><small>' + esc(typeLabel(request.type)) + ' · ' + esc(request.date) + '</small></div><span class="request-status is-' + esc(request.status) + '">' + esc(statusLabel(request.status)) + '</span></header><div class="schedule-request-compare"><p><small>Current</small><strong>' + esc(current.working ? current.start + '–' + current.end : 'Day off') + '</strong></p><span>→</span><p><small>Requested</small><strong>' + esc(requestProposal(request)) + '</strong></p></div><p>' + esc(request.reason || 'No reason provided') + '</p>' + (request.status === 'blocked' ? '<small class="schedule-conflict-note">' + (request.bookingImpactIds || []).length + ' booking(s) must be resolved before approval.</small>' : '') + adjust + '</div>' + (active ? '<div class="schedule-request-actions"><button type="button" data-request-adjust="' + esc(request.id) + '">Adjust</button><button type="button" data-request-reject="' + esc(request.id) + '">Reject</button><button type="button" class="booking-primary-button" data-request-approve="' + esc(request.id) + '">' + (request.status === 'blocked' ? 'Check & approve again' : 'Approve & sync') + '</button></div>' : '') + '</article>';
    }).join('');
  }
  function breakRows() {
    if (!editorBreaks.length) return '<p class="schedule-no-breaks">No breaks for this shift.</p>';
    return editorBreaks.map(function (item, index) {
      return '<div class="schedule-break-row" data-schedule-break-row><label>Start<input type="time" data-break-start value="' + esc(item.start) + '"></label><label>End<input type="time" data-break-end value="' + esc(item.end) + '"></label><button type="button" data-break-remove="' + index + '" aria-label="Remove break">Remove</button></div>';
    }).join('');
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
      var day = editorScope === 'weekly' ? editorValues.weekly[key] : editorValues.date;
      var name = row.querySelector('.tech-schedule-day').textContent;
      row.dataset.scheduleEditDay = key;
      if (editorScope === 'date') row.querySelector('.tech-schedule-day').textContent = selectedDate;
      off.removeAttribute('data-tech-day-off');
      off.setAttribute('data-schedule-off', key);
      off.setAttribute('aria-label', name + ' day off');
      off.checked = !day.working;
      if (off.checked) off.setAttribute('checked', ''); else off.removeAttribute('checked');
      row.classList.toggle('is-day-off', off.checked);
      ['start', 'end'].forEach(function (field) {
        var input = row.querySelector('[data-tech-schedule-' + field + ']');
        input.removeAttribute('data-tech-schedule-' + field);
        input.setAttribute('data-schedule-' + field, key);
        input.setAttribute('aria-label', name + ' ' + field + ' time');
        input.setAttribute('value', day[field]);
        input.disabled = off.checked;
      });
    });
    return calendar.outerHTML;
  }
  function editor() {
    if (!drawerOpen) return '';
    var source = editorValues;
    var staff = salonData.loadCatalog().technicians.find(function (person) { return person.id === selectedStaff; });
    var names = {mon:'Monday',tue:'Tuesday',wed:'Wednesday',thu:'Thursday',fri:'Friday',sat:'Saturday',sun:'Sunday'};
    var breakShift = editorScope === 'weekly' ? source.weekly[breakDay] : source.date;
    return '<div class="schedule-backdrop" data-schedule-close></div><aside class="schedule-drawer" data-schedule-drawer role="dialog" aria-modal="true" aria-labelledby="schedule-drawer-title"><header><div><small>' + esc(staff ? staff.name : selectedStaff) + '</small><h2 id="schedule-drawer-title" tabindex="-1">Edit staff schedule</h2></div><button type="button" data-schedule-close aria-label="Close schedule editor">×</button></header>' +
      '<fieldset class="schedule-scope"><legend>Apply change to</legend><label><input type="radio" name="schedule-scope" value="weekly" data-schedule-scope="weekly" ' + (editorScope === 'weekly' ? 'checked' : '') + '> Weekly schedule</label><label><input type="radio" name="schedule-scope" value="date" data-schedule-scope="date" ' + (editorScope === 'date' ? 'checked' : '') + '> ' + esc(selectedDate) + ' only</label></fieldset>' +
      '<section class="tech-modal-section"><div class="tech-modal-section-title"><i class="bi bi-calendar-week" aria-hidden="true"></i>' + (editorScope === 'weekly' ? 'Weekly schedule' : 'Date exception') + '</div>' + weeklyEditor() + '</section>' +
      '<section class="schedule-break-editor"><header><div><strong>Breaks</strong><small>Break time is hidden from Booking.</small></div><button type="button" data-break-add ' + (!breakShift.working ? 'disabled' : '') + '>+ Add break</button></header>' + (editorScope === 'weekly' ? '<label>Day<select class="schedule-select" data-break-day>' + Object.keys(names).map(function (key) { return '<option value="' + key + '" ' + (key === breakDay ? 'selected' : '') + '>' + names[key] + '</option>'; }).join('') + '</select></label>' : '') + '<div data-break-list>' + (breakShift.working ? breakRows() : '<p class="schedule-no-breaks">Day off — no breaks.</p>') + '</div></section>' +
      '<label>Staff availability permission<select class="schedule-select" data-schedule-permission><option value="none" ' + (source.permission === 'none' ? 'selected' : '') + '>Not allowed</option><option value="request" ' + (source.permission !== 'none' ? 'selected' : '') + '>Manager approval required</option></select></label><p class="schedule-form-error" data-schedule-error role="alert"></p><footer><button type="button" data-schedule-discard>Discard draft</button><button type="button" data-schedule-save-draft>Save draft</button><button type="button" class="booking-primary-button" data-schedule-publish>Publish &amp; Sync Booking</button></footer></aside>';
  }
  function impactDialog() {
    if (!impactReview) return '<div data-request-impact hidden></div>';
    var rows = impactReview.impacts || [];
    return '<div class="schedule-impact-backdrop"></div><section class="schedule-impact" data-request-impact role="dialog" aria-modal="true"><header><div><small>Approval paused</small><h2>Resolve affected bookings</h2></div><button type="button" data-impact-close aria-label="Close">×</button></header><p>This change has not been published. Reassign or reschedule these bookings, then approve again.</p><div class="schedule-impact-list">' + rows.map(function (item) { return '<a href="booking-book-phase-1.html?tab=booking&appointment=' + encodeURIComponent(item.appointmentId) + '"><strong>' + esc(item.customerName) + '</strong><span>' + esc(item.startAt.slice(0, 10) + ' · ' + item.startAt.slice(11, 16)) + '</span><small>Open booking →</small></a>'; }).join('') + '</div><footer><button type="button" data-impact-close>Keep request blocked</button><a class="booking-primary-button" href="booking-book-phase-1.html?tab=booking">Open Booking Book</a></footer></section>';
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
        if (availability.working) working++;
        slots += availability.openSlots.length;
        conflicts += availability.conflicts.length;
        return '<button type="button" class="schedule-day' + (!availability.working ? ' is-off' : '') + (availability.conflicts.length ? ' has-conflict' : '') + '" data-schedule-day data-schedule-staff="' + esc(person.id) + '" data-schedule-date="' + key + '"><strong>' + (availability.working ? esc(availability.start + '–' + availability.end) : 'Day off') + '</strong><small>' + availability.openSlots.length + ' open · ' + availability.appointments.length + ' booked</small></button>';
      }).join('');
      return '<div class="schedule-row" data-schedule-staff="' + esc(person.id) + '"><strong>' + esc(person.name) + '</strong>' + cells + '</div>';
    }).join('');
    host.innerHTML = '<header class="schedule-heading"><div><h2>Staff Schedule &amp; Booking Availability</h2><p>Manager publishes working hours. Staff changes arrive as requests.</p></div><div class="schedule-actions"><select class="schedule-select" aria-label="Salon"><option>Bitcoin Nail Bar</option></select><span data-schedule-sync-status>' + (state.salons[store.SALON_ID]?.syncedAt ? 'Synced to Booking' : 'Ready to sync') + '</span></div></header><div class="schedule-summary"><div class="schedule-card" data-schedule-summary="working"><strong>' + working + '</strong><span>Working staff-days</span></div><div class="schedule-card"><strong>' + slots + '</strong><span>Open slots</span></div><div class="schedule-card"><strong>' + conflicts + '</strong><span>Booking conflicts</span></div><div class="schedule-card"><strong>' + people.length + '</strong><span>Staff members</span></div></div><div class="schedule-week" data-schedule-week><div class="schedule-row"><span>Staff</span>' + days.map(function (date) { return '<span>' + date.toLocaleDateString('en-US', {weekday:'short', day:'numeric'}) + '</span>'; }).join('') + '</div>' + body + '</div><aside class="schedule-request-queue" data-schedule-requests><header><div><h3>Schedule requests</h3><p>Compare, adjust, approve and sync staff availability.</p></div><span>' + state.requests.filter(function (request) { return ['pending','adjusted','blocked'].includes(request.status); }).length + ' open</span></header>' + requestQueue(state, catalog) + '</aside>' + editor() + impactDialog();
    modalHost.replaceChildren();
    Array.from(host.querySelectorAll('.schedule-backdrop,.schedule-drawer,.schedule-impact-backdrop,[data-request-impact]')).forEach(function (node) { modalHost.appendChild(node); });
    // The editor lives outside hidden settings panels so Staff can open it directly.
    if (drawerOpen) modalHost.querySelector('#schedule-drawer-title')?.focus();
  }
  function readBreaks() {
    return Array.from(modalHost.querySelectorAll('[data-schedule-break-row]')).map(function (row) { return {start:row.querySelector('[data-break-start]').value, end:row.querySelector('[data-break-end]').value}; });
  }
  function snapshotEditor() {
    if (!drawerOpen || !modalHost.querySelector('[data-schedule-calendar]')) return;
    modalHost.querySelectorAll('[data-schedule-edit-day]').forEach(function (row) {
      var day = editorScope === 'weekly' ? editorValues.weekly[row.dataset.scheduleEditDay] : editorValues.date;
      day.working = !row.querySelector('[data-schedule-off]').checked;
      day.start = row.querySelector('[data-schedule-start]').value;
      day.end = row.querySelector('[data-schedule-end]').value;
    });
    editorValues.permission = modalHost.querySelector('[data-schedule-permission]').value;
    editorBreaks = readBreaks();
    (editorScope === 'weekly' ? editorValues.weekly[breakDay] : editorValues.date).breaks = editorBreaks;
  }
  function editorSchedule() {
    var schedule = store.getStaffSchedule(store.SALON_ID, selectedStaff, {includeDraft:true});
    schedule.permission = editorValues.permission;
    if (editorScope === 'weekly') {
      dayKeys.forEach(function (key) {
        var day = editorValues.weekly[key];
        schedule.weekly[key] = day.working ? JSON.parse(JSON.stringify(day)) : {working:false,start:'',end:'',breaks:[]};
      });
    } else {
      var day = editorValues.date;
      schedule.exceptions[selectedDate] = day.working ? {type:'custom-hours', start:day.start, end:day.end, breaks:day.breaks} : {type:'day-off', start:'', end:'', breaks:[]};
    }
    return schedule;
  }
  function showError(text) { var target = modalHost.querySelector('[data-schedule-error]'); if (target) target.textContent = text; }
  function saveDraft() {
    snapshotEditor();
    var schedule = editorSchedule();
    var check = store.validateSchedule(schedule);
    if (!check.ok) { showError('End time must be after start time. Breaks must be valid, inside the shift and cannot overlap.'); return false; }
    var result = store.saveDraft(store.SALON_ID, selectedStaff, schedule);
    if (!result.ok) { showError('Unable to save draft.'); return false; }
    return true;
  }
  function showImpacts(kind, id, impacts) { impactReview = {kind:kind, id:id, impacts:impacts}; render(selectedStaff); }
  function publish() {
    var result = store.publishDraft(store.SALON_ID, selectedStaff, appointments(), []);
    if (result.ok) { drawerOpen = false; impactReview = null; render(selectedStaff); return; }
    if (result.error.code === 'booking-impact') { showImpacts('publish', selectedStaff, result.error.impacts); return; }
    showError('Schedule could not be published.');
  }
  function review(id, decision) {
    var result = store.reviewRequest(id, decision, appointments());
    if (!result.ok && result.error.code === 'booking-impact') { showImpacts('request', id, result.error.impacts); return; }
    impactReview = null;
    adjustId = '';
    render(selectedStaff);
  }
  function loadEditorDay() {
    var schedule = store.getStaffSchedule(store.SALON_ID, selectedStaff, {includeDraft:true});
    editorValues = {weekly:schedule.weekly,date:store.scheduleForDate(schedule, selectedDate),permission:schedule.permission};
    breakDay = selectedDayKey();
    editorBreaks = editorValues.weekly[breakDay].breaks;
  }

  modalHost.addEventListener('change', function (event) {
    var scope = event.target.closest('[data-schedule-scope]');
    if (scope) {
      snapshotEditor();
      editorScope = scope.value;
      editorBreaks = (editorScope === 'weekly' ? editorValues.weekly[breakDay] : editorValues.date).breaks;
      render(selectedStaff);
      return;
    }
    if (event.target.matches('[data-break-day]')) {
      var nextDay = event.target.value;
      snapshotEditor();
      breakDay = nextDay;
      editorBreaks = editorValues.weekly[breakDay].breaks;
      render(selectedStaff);
      return;
    }
    if (event.target.matches('[data-schedule-off]')) { snapshotEditor(); render(selectedStaff); }
  });
  host.addEventListener('submit', function (event) {
    var form = event.target.closest('[data-request-adjust-form]');
    if (!form) return;
    event.preventDefault();
    var patch = {date:form.querySelector('[data-adjust-date]').value, reason:form.querySelector('[data-adjust-reason]').value};
    if (form.querySelector('[data-adjust-start]')) { patch.start = form.querySelector('[data-adjust-start]').value; patch.end = form.querySelector('[data-adjust-end]').value; }
    var result = store.adjustRequest(form.dataset.requestAdjustForm, patch, 'manager');
    if (result.ok) adjustId = '';
    render(selectedStaff);
  });
  function handleClick(event) {
    var day = event.target.closest('[data-schedule-day]');
    if (day) { selectedStaff = day.dataset.scheduleStaff; selectedDate = day.dataset.scheduleDate; editorScope = 'weekly'; drawerOpen = true; loadEditorDay(); render(selectedStaff); return; }
    if (event.target.closest('[data-schedule-close]')) { closeEditor(); return; }
    if (event.target.closest('[data-schedule-save-draft]')) { saveDraft(); return; }
    if (event.target.closest('[data-schedule-publish]')) { if (saveDraft()) publish(); return; }
    if (event.target.closest('[data-schedule-discard]')) { store.discardDraft(store.SALON_ID, selectedStaff); drawerOpen = false; editorValues = null; render(selectedStaff); return; }
    if (event.target.closest('[data-break-add]')) { snapshotEditor(); editorBreaks.push({start:'13:00', end:'13:30'}); render(selectedStaff); return; }
    var remove = event.target.closest('[data-break-remove]');
    if (remove) { snapshotEditor(); editorBreaks.splice(Number(remove.dataset.breakRemove), 1); render(selectedStaff); return; }
    if (event.target.closest('[data-impact-close]')) { impactReview = null; render(selectedStaff); return; }
    var adjust = event.target.closest('[data-request-adjust]');
    if (adjust) { adjustId = adjust.dataset.requestAdjust; render(selectedStaff); return; }
    if (event.target.closest('[data-adjust-close]')) { adjustId = ''; render(selectedStaff); return; }
    var reject = event.target.closest('[data-request-reject]');
    if (reject) { review(reject.dataset.requestReject, 'reject'); return; }
    var approve = event.target.closest('[data-request-approve]');
    if (approve) review(approve.dataset.requestApprove, 'approve');
  }
  host.addEventListener('click', handleClick);
  modalHost.addEventListener('click', handleClick);
  function closeEditor() {
    drawerOpen = false;
    editorValues = null;
    render(selectedStaff);
    if (opener && opener.isConnected) opener.focus();
  }
  function openEditor(staffId, trigger) {
    selectedStaff = staffId;
    selectedDate = dateKey(new Date());
    editorScope = 'weekly';
    drawerOpen = true;
    opener = trigger;
    loadEditorDay();
    render(selectedStaff);
  }
  modalHost.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { event.preventDefault(); if (impactReview) { impactReview = null; render(selectedStaff); } else closeEditor(); }
    if (event.key !== 'Tab') return;
    var dialog = modalHost.querySelector('[data-request-impact]:not([hidden])') || modalHost.querySelector('[data-schedule-drawer]');
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
