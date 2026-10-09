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
  var opener = null;

  var selectedStaff = '';
  var selectedDate = '';
  var boardDate = store.salonToday(store.SALON_ID);
  var workspaceTab = 'team';
  var searchValue = '';
  var previewService = '';
  var previewStaff = '';
  var previewTime = '';
  var rulesOpen = false;
  var boardView = 'staff';
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
  function formatEditorDateFields(scope) {
    (scope || modalHost).querySelectorAll('input[type="date"]').forEach(function (native) {
      if (native.closest('.schedule-formatted-date')) return;
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
    host.querySelector(focusSelector === '[data-schedule-week-date]' ? '[data-date-display]' : focusSelector)?.focus();
  }
  function appointments() { try { return appointmentStore ? appointmentStore.loadAll() : []; } catch (_) { return []; } }
  function statusLabel(status) { return {pending:'Pending review', adjusted:'Adjusted by manager', blocked:'Booking conflict', applied:'Approved & synced', rejected:'Rejected', cancelled:'Cancelled'}[status] || status; }
  function typeLabel(type) { return {'day-off':'Day off', 'change-hours':'Change hours', 'break':'Extra break', 'weekly-schedule':'Weekly schedule', 'availability-today':'Today’s availability'}[type] || type; }
  function weeklySummary(weekly) { return ['mon','tue','wed','thu','fri','sat','sun'].map(function (key) { var day = weekly[key]; return key[0].toUpperCase() + key.slice(1) + ': ' + (day.working ? day.start + '–' + day.end : 'Day off'); }).join(' · '); }
  function requestProposal(request) { if (request.type === 'availability-today') return request.available ? 'Receive new bookings today' : 'Stop new bookings today'; if (request.type === 'weekly-schedule') return weeklySummary(request.weekly); return request.type === 'day-off' ? 'Not working' : request.start + '–' + request.end; }
  function coverageAfterChange(staffId,next,date,catalog) {
    var rules=store.salonRules(store.SALON_ID),open=store.businessDay(date,rules);
    if(!open.working)return [];
    var roster=catalog.technicians.filter(function(person){return person.active!==false;}).map(function(person){
      var schedule=person.id===staffId?next:store.getStaffSchedule(store.SALON_ID,person.id,{});
      var day=store.scheduleForDate(schedule,date),start=day.start>open.start?day.start:open.start,end=day.end<open.end?day.end:open.end;
      return {person:person,schedule:schedule,working:day.working&&start<end&&schedule.availableToday[date]!==false};
    });
    return skillsFor(catalog).filter(function (skill) {
      var minimum=Number(rules.coverageMinimums[skill])||0;
      var count=roster.filter(function(entry){return entry.working&&qualifiedForSkill(entry.person,skill,catalog,entry.schedule);}).length;
      return count<minimum;
    });
  }
  function requestImpactSummary(request,current,catalog) {
    if(!['pending','adjusted','blocked'].includes(request.status))return '';
    var next=store.requestSchedule(request,current);
    var impacts=store.changeImpacts(request.staffId,current,next,appointments());
    var gaps=request.type==='weekly-schedule'?Array.from(new Set(week().flatMap(function(date){return coverageAfterChange(request.staffId,next,dateKey(date),catalog);} ))):coverageAfterChange(request.staffId,next,request.date,catalog);
    return '<div class="schedule-request-impact"><span>'+impacts.length+' existing booking(s) affected</span><span'+(gaps.length?' class="is-warning"':'')+'>'+(gaps.length?esc(gaps.join(', '))+' below minimum':'Coverage minimums met')+'</span></div>';
  }
  function requestQueue(state, catalog) {
    var names = Object.fromEntries(catalog.technicians.map(function (person) { return [person.id, person.name]; }));
    var items = state.requests.filter(function (item) { return item.salonId === store.SALON_ID && matchesRequestFilter(item, requestFilter); }).sort(function (left, right) { return String(right.createdAt).localeCompare(String(left.createdAt)); });
    if (!items.length) return '<div class="schedule-empty">No requests in this view. Choose All requests or add demo requests.</div>';
    return items.map(function (request) {
      var active = ['pending','adjusted','blocked'].includes(request.status);
      var schedule = store.getStaffSchedule(request.salonId, request.staffId, {});
      var current = store.scheduleForDate(schedule, request.date);
      var rejection = active && rejectId === request.id ? '<form class="schedule-reject-form" data-request-reject-form="' + esc(request.id) + '"><label>Reason for rejection (required)<textarea data-rejection-reason rows="3" maxlength="500" required placeholder="Explain why this request cannot be approved">' + esc(rejectionReason) + '</textarea></label><small>The staff member will see this reason. Their schedule will stay unchanged.</small><div><button type="submit" class="schedule-reject-confirm">Confirm rejection</button><button type="button" data-reject-cancel>Cancel</button></div></form>' : '';
      return '<article class="schedule-request"><div class="schedule-request-main"><header><div><strong class="schedule-request-staff-name">' + esc(names[request.staffId] || request.staffId) + '</strong><div class="schedule-request-meta"><span class="schedule-request-type is-' + esc(request.type) + '">' + esc(typeLabel(request.type)) + '</span><small>' + esc(displayDate(request.date)) + '</small></div></div><span class="request-status is-' + esc(request.status) + '">' + esc(statusLabel(request.status)) + '</span></header><div class="schedule-request-compare"><p><small>Current</small><strong>' + esc(request.type === 'availability-today' ? (schedule.availableToday[request.date]===false?'New bookings off':'New bookings enabled') : request.type === 'weekly-schedule' ? weeklySummary(schedule.weekly) : current.working ? current.start + '–' + current.end : 'Day off') + '</strong></p><span>→</span><p><small>Requested</small><strong>' + esc(requestProposal(request)) + '</strong></p></div><p>' + esc(request.reason || 'No reason provided') + '</p>' + requestImpactSummary(request,schedule,catalog) + (request.status === 'blocked' ? '<small class="schedule-conflict-note">' + (request.bookingImpactIds || []).length + ' booking(s) must be resolved before approval.</small>' : '') + (request.status === 'rejected' && request.rejectionReason ? '<p class="schedule-rejection-note"><strong>Rejection reason:</strong> ' + esc(request.rejectionReason) + '</p>' : '') + rejection + '</div>' + (active && rejectId !== request.id ? '<div class="schedule-request-actions"><button type="button" data-request-reject="' + esc(request.id) + '">Reject</button><button type="button" class="booking-primary-button" data-request-approve="' + esc(request.id) + '">' + (request.status === 'blocked' ? 'Check & approve again' : 'Approve & sync') + '</button></div>' : '') + '</article>';
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
      var person = people[index % people.length], date = new Date(store.salonToday(store.SALON_ID) + 'T12:00:00'); date.setHours(12,0,0,0); date.setDate(date.getDate() + 14 + index);
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
    if (!drawerOpen) return '';
    var source = editorValues;
    var staff = salonData.loadCatalog().technicians.find(function (person) { return person.id === selectedStaff; });
    var tabs = {weekly:'Weekly schedule',date:'Date changes',permissions:'Staff permissions'};
    var content = editorScope === 'weekly' ? '<div class="schedule-explainer"><strong>Regular hours, repeated every week</strong><p>Set working days, hours and breaks. Use Date changes for a vacation or a late start on one date.</p></div><section class="tech-modal-section">' + weeklyEditor() + '</section><p class="schedule-help">Date changes override the weekly hours.</p>' : editorScope === 'date' ? datePanel() : permissionPanel(source,staff);
    return '<div class="schedule-backdrop" data-schedule-close></div><aside class="schedule-drawer" data-schedule-drawer role="dialog" aria-modal="true" aria-labelledby="schedule-drawer-title" ' + (breakForm || impactReview || rulesOpen ? 'inert' : '') + '><header><div class="schedule-editor-heading"><div class="schedule-staff-identity"><strong class="schedule-staff-name">' + esc(staff ? staff.name : selectedStaff) + '</strong><span class="schedule-staff-salon">' + esc(salonData.loadCatalog().salon.name) + '</span></div><h2 id="schedule-drawer-title" tabindex="-1">Edit staff schedule</h2></div><button type="button" data-schedule-close aria-label="Close schedule editor">×</button></header><div class="schedule-editor-tabs" role="tablist" aria-label="Schedule settings">' + Object.keys(tabs).map(function (key) { return '<button type="button" role="tab" id="schedule-tab-' + key + '" aria-controls="schedule-editor-panel" aria-selected="' + (editorScope === key) + '" data-schedule-scope="' + key + '">' + tabs[key] + '</button>'; }).join('') + '</div><section id="schedule-editor-panel" role="tabpanel" aria-labelledby="schedule-tab-' + editorScope + '">' + content + '</section><p class="schedule-form-error" data-schedule-error role="alert">' + esc(editorError) + '</p><p class="schedule-editor-message" role="status">' + esc(editorMessage) + '</p><footer><small>Save draft keeps edits private. Publish applies all three sections to Booking (demo).</small><div><button type="button" data-schedule-preview-impact>Review impact</button><button type="button" data-schedule-close>Cancel</button><button type="button" data-schedule-save-draft>Save draft</button><button type="button" class="booking-primary-button" data-schedule-publish>Publish schedule</button></div></footer></aside>' + breakDialog();
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
    return '<div class="schedule-impact-backdrop"></div><section class="schedule-impact" data-request-impact role="dialog" aria-modal="true"><header><div><small>Approval paused</small><h2>Resolve affected bookings</h2></div><button type="button" data-impact-close aria-label="Close">×</button></header><p>This change has not been published. Resolve these appointments in Booking Book, then save or approve again.</p><div class="schedule-impact-list">' + rows.map(function (item) { return '<a href="booking-book-phase-1.html?tab=booking&appointment=' + encodeURIComponent(item.appointmentId) + '"><strong>' + esc(item.customerName) + '</strong><span>' + esc(displayDate(item.startAt.slice(0, 10)) + ' · ' + item.startAt.slice(11, 16)) + '</span><small>Open booking →</small></a>'; }).join('') + '</div><footer><button type="button" data-impact-close>Keep current schedule</button><a class="booking-primary-button" href="booking-book-phase-1.html?tab=booking">Open Booking Book</a></footer></section>';
  }
  function boardHeader(label, days) {
    return '<div class="schedule-row"><span>' + esc(label) + '</span>' + days.map(function (date) { return '<span>' + date.toLocaleDateString('en-US', {weekday:'short'}) + '<br>' + displayDate(dateKey(date)) + '</span>'; }).join('') + '</div>';
  }
  function staffBoard(people, days, availabilityByStaff) {
    var rows = people.map(function (person) {
      var cells = days.map(function (date) {
        var key = dateKey(date);
        var item = availabilityByStaff[person.id][key];
        var availability = item.availability;
        return '<button type="button" class="schedule-day' + (!availability.working ? ' is-off' : '') + (item.conflicts.length ? ' has-conflict' : '') + '" data-schedule-day data-schedule-staff="' + esc(person.id) + '" data-schedule-date="' + key + '" aria-label="' + esc(person.name + ', ' + displayDate(key) + ', ' + shiftLabel(availability)) + '"><strong>' + (availability.working ? esc(availability.start + '–' + availability.end) : 'Day off') + '</strong><small>' + availability.openSlots.length + ' open starts · ' + availability.appointments.length + ' booked</small>' + (availability.source === 'exception' ? '<span class="schedule-cell-note">Date change</span>' : '') + (!availability.available && availability.working ? '<span class="schedule-cell-note">New bookings off</span>' : '') + (item.conflicts.length ? '<span class="schedule-cell-note is-conflict">' + item.conflicts.length + ' conflict(s)</span>' : '') + '</button>';
      }).join('');
      return '<div class="schedule-row" data-schedule-staff="' + esc(person.id) + '"><strong><button type="button" class="schedule-staff-row-button" data-schedule-edit-staff="' + esc(person.id) + '"><span class="schedule-avatar">' + esc(person.name.charAt(0)) + '</span><span>' + esc(person.name) + '<small>Edit weekly schedule</small></span></button></strong>' + cells + '</div>';
    }).join('');
    return '<div class="schedule-week" data-schedule-week>' + boardHeader('Staff', days) + rows + '</div>';
  }
  function skillBoard(catalog, people, days, availabilityByStaff) {
    var skills = [];
    function addSkill(skill) {
      skill = String(skill || '').trim();
      if (skill && skills.indexOf(skill) < 0) skills.push(skill);
    }
    (catalog.services || []).forEach(function (service) { if (service.active !== false) addSkill(service.requiredSkill); });

    skills.sort(function (a, b) { return a.localeCompare(b); });
    var rows = skills.map(function (skill) {
      var qualified = people.filter(function (person) { return qualifiedForSkill(person,skill,catalog); });
      var cells = days.map(function (date) {
        var key = dateKey(date);
        var available = qualified.filter(function (person) { return availabilityByStaff[person.id][key].availability.available; });
        var chips = qualified.map(function (person) {
          var day = availabilityByStaff[person.id][key].availability;
          return '<button type="button" class="schedule-skill-chip' + (!day.working ? ' is-off' : '') + '" data-schedule-day data-schedule-staff="' + esc(person.id) + '" data-schedule-date="' + key + '" aria-label="Open ' + esc(person.name) + ' schedule for ' + esc(displayDate(key)) + '"><strong>' + esc(person.name) + '</strong><small>' + (day.working ? esc(day.start + '–' + day.end) : 'Off') + '</small></button>';
        }).join('');
        var minimum = Number(store.salonRules(store.SALON_ID).coverageMinimums[skill]) || 0;
        var warning = !store.businessDay(key,store.salonRules(store.SALON_ID)).working ? '<span class="schedule-coverage-warning">Salon closed</span>' : available.length < minimum ? '<span class="schedule-coverage-warning is-empty">Needs ' + (minimum-available.length) + ' more</span>' : '';
        return '<div class="schedule-skill-cell"><div class="schedule-skill-count"><strong>' + available.length + '</strong><small>working / ' + minimum + ' minimum</small></div>' + chips + warning + '</div>';
      }).join('');
      return '<div class="schedule-row schedule-skill-row"><strong>' + esc(skill) + '</strong>' + cells + '</div>';
    }).join('');
    var totals = days.map(function (date) {
      var key = dateKey(date);
      var count = people.filter(function (person) { return availabilityByStaff[person.id][key].availability.working; }).length;
      return '<div class="schedule-skill-total"><strong>' + count + '</strong><small>techs</small></div>';
    }).join('');
    return '<div class="schedule-coverage-intro"><p class="schedule-coverage-help">Coverage uses approved services and published hours. Select a staff chip to edit the schedule.</p></div><div class="schedule-week schedule-skill-week" data-schedule-week>' + boardHeader('Skill / Day', days) + (rows || '<div class="schedule-empty">Assign skills to staff to see coverage.</div>') + '<div class="schedule-row schedule-skill-row schedule-total-row"><strong>Total working</strong>' + totals + '</div></div>';
  }
  function qualifiedForSkill(person, skill, catalog, suppliedSchedule) {
    var schedule = suppliedSchedule || store.getStaffSchedule(store.SALON_ID, person.id, {});
    return catalog.services.some(function (service) { return service.requiredSkill === skill && store.isEligible(person, service, schedule); });
  }
  function skillsFor(catalog) {
    return Array.from(new Set(catalog.services.filter(function (service) { return service.active !== false && service.requiredSkill; }).map(function (service) { return service.requiredSkill; }))).sort();
  }
  function coverageRisks(catalog, people, days, availabilityByStaff) {
    var minimums = store.salonRules(store.SALON_ID).coverageMinimums;
    var risks = [];
    skillsFor(catalog).forEach(function (skill) {
      var qualified=people.filter(function(person){return qualifiedForSkill(person,skill,catalog);});
      days.forEach(function (date) {
        var key = dateKey(date), minimum = Number(minimums[skill]) || 0;
        if (!store.businessDay(key, store.salonRules(store.SALON_ID)).working) return;
        var count = qualified.filter(function (person) { return availabilityByStaff[person.id][key].availability.available; }).length;
        if (count < minimum) risks.push({skill:skill,date:key,count:count,minimum:minimum});
      });
    });
    return risks;
  }
  function coverageBanner(risks) {
    if (!risks.length) return '<div class="schedule-coverage-banner is-good"><span class="schedule-status-dot"></span><div><strong>Team coverage meets your minimums</strong><p>Working staff are counted by their approved services.</p></div><button type="button" data-schedule-rules-open>Set minimums</button></div>';
    return '<div class="schedule-coverage-banner"><span class="schedule-status-dot"></span><div><strong>' + risks.length + ' coverage gap' + (risks.length === 1 ? '' : 's') + ' this week</strong><p>' + risks.slice(0,3).map(function (risk) { return esc(risk.skill + ' · ' + displayDate(risk.date) + ': ' + risk.count + '/' + risk.minimum + ' staff'); }).join(' &nbsp; • &nbsp; ') + '</p></div><button type="button" data-schedule-rules-open>Set minimums</button></div>';
  }
  function staffAccessPanel(catalog, people) {
    return '<div class="schedule-staff-cards">' + people.map(function (person) {
      var schedule = store.getStaffSchedule(store.SALON_ID, person.id, {});
      var day = store.scheduleForDate(schedule, boardDate);
      var services = catalog.services.filter(function (service) { return store.isEligible(person, service, schedule); });
      var weeklyCount = Object.values(schedule.weekly).filter(function (day) { return day.working; }).length;
      return '<article class="schedule-staff-card"><header><span class="schedule-avatar">' + esc(person.name.charAt(0)) + '</span><div><h3>' + esc(person.name) + '</h3><small>' + esc(({tech:'Technician',manager:'Manager',frontdesk:'Front desk'})[person.posProfile?.posRole] || 'Technician') + ' · Level ' + esc(person.posProfile?.level || 1) + '</small></div><span class="schedule-badge ' + (day.working ? 'is-good' : '') + '">' + (day.working ? 'Scheduled' : 'Off') + '</span></header><div class="schedule-staff-card-hours"><strong>' + esc(shiftLabel(day)) + '</strong><span>' + weeklyCount + ' working days / week</span></div><div class="schedule-service-tags">' + services.slice(0,4).map(function (service) { return '<span>' + esc(service.name) + '</span>'; }).join('') + (services.length > 4 ? '<span>+' + (services.length - 4) + ' more</span>' : '') + (!services.length ? '<span class="is-empty">No approved services</span>' : '') + '</div><dl><div><dt>Today toggle</dt><dd>' + esc({allowed:'Allowed',request:'Approval required',none:'Not allowed'}[schedule.sameDayMode]) + '</dd></div><div><dt>Schedule requests</dt><dd>' + esc(schedule.permission === 'none' ? 'Disabled' : schedule.permission === 'self' ? 'Apply directly' : 'Manager approval') + '</dd></div><div><dt>Existing bookings</dt><dd>' + (schedule.bookedDayMode === 'block' ? 'Block off toggle' : 'Manager review') + '</dd></div></dl><footer><button type="button" data-schedule-edit-staff="' + esc(person.id) + '">Edit schedule &amp; access</button><a href="pos-calendar.html?staff=' + encodeURIComponent(person.id) + '&amp;date=' + boardDate + '">View staff calendar ↗</a></footer></article>';
    }).join('') + (people.length ? '' : '<div class="schedule-empty">No staff match your search.</div>') + '</div>';
  }
  function bookingPreview(catalog, people, appointmentList) {
    var services = catalog.services.filter(function (service) { return service.active !== false; });
    if (!services.some(function (service) { return service.id === previewService; })) previewService = services[0]?.id || '';
    var service = services.find(function (item) { return item.id === previewService; });
    if (!service) return '<div class="schedule-empty">Add a service to preview booking availability.</div>';
    var options = people.map(function (person) {
      var schedule = store.getStaffSchedule(store.SALON_ID, person.id, {});
      var result = store.availabilityForDay({staffSchedule:schedule,technician:person,technicianId:person.id,service:service,date:boardDate,appointments:appointmentList});
      return {person:person,result:result};
    }).filter(function (entry) { return entry.result.openSlots.length; });
    if (!options.some(function (entry) { return entry.person.id === previewStaff; })) { previewStaff = options[0]?.person.id || ''; previewTime = ''; }
    var selected = options.find(function (entry) { return entry.person.id === previewStaff; });
    if (previewTime && !selected?.result.openSlots.some(function (slot) { return slot.time === previewTime; })) previewTime = '';
    return '<section class="schedule-preview"><header><div><h3>Booking availability preview</h3><p>See the staff and start times customers can choose.</p></div><a href="booking-book-phase-1.html?tab=booking">Open Booking Book ↗</a></header><div class="schedule-preview-filters"><label>Service<select class="schedule-select" data-preview-service>' + services.map(function (item) { return '<option value="' + esc(item.id) + '" ' + (item.id === previewService ? 'selected' : '') + '>' + esc(item.name) + '</option>'; }).join('') + '</select></label><div><small>Selected date · Salon time</small><strong>' + esc(displayDate(boardDate)) + '</strong></div><div><small>Appointment length</small><strong>' + service.durationMin + ' min' + (service.bufferBeforeMin || service.bufferAfterMin ? ' + ' + ((service.bufferBeforeMin || 0) + (service.bufferAfterMin || 0)) + ' min buffer' : '') + '</strong></div></div><div class="schedule-preview-layout"><div class="schedule-preview-staff"><h4>Bookable staff <span>' + options.length + '</span></h4>' + options.map(function (entry) { return '<button type="button" data-preview-staff="' + esc(entry.person.id) + '" aria-pressed="' + (previewStaff === entry.person.id) + '"><span class="schedule-avatar">' + esc(entry.person.name.charAt(0)) + '</span><span><strong>' + esc(entry.person.name) + '</strong><small>' + entry.result.openSlots.length + ' start times · ' + esc(displayTime(entry.result.start) + '–' + displayTime(entry.result.end)) + '</small></span></button>'; }).join('') + (!options.length ? '<div class="schedule-empty">No available staff for this service and date. Choose another date or service.</div>' : '') + '</div><div class="schedule-preview-slots"><h4>' + (selected ? 'Available starts for ' + esc(selected.person.name) : 'Available start times') + '</h4><div class="schedule-slot-grid">' + (selected ? selected.result.openSlots.map(function (slot) { return '<button type="button" data-preview-time="' + slot.time + '" aria-pressed="' + (previewTime === slot.time) + '">' + esc(displayTime(slot.time)) + '</button>'; }).join('') : '') + '</div><p class="schedule-help">Includes salon hours, approved services, staff hours, breaks and existing bookings. Today’s unavailable toggle closes new slots only.</p>' + (previewTime ? '<div class="schedule-preview-selection"><strong>' + esc(selected.person.name + ' · ' + displayTime(previewTime)) + '</strong><button type="button" data-preview-check>Check selected slot</button><small>Preview only. No appointment is created.</small></div>' : '') + '</div></div></section>';
  }
  function activityDetails(entry,catalog) {
    var before=entry.before||{},after=entry.after||{},lines=[];
    if(after.weekly)Object.keys(names).forEach(function(key){if(JSON.stringify(before.weekly?.[key])!==JSON.stringify(after.weekly[key])){var previous=before.weekly?.[key];lines.push(names[key]+': '+(previous?shiftLabel(previous):'Not configured')+' → '+shiftLabel(after.weekly[key])+'; breaks: '+after.weekly[key].breaks.map(function(pause){return pause.start+'–'+pause.end;}).join(', '));}});
    if(after.weekly){
      var dates=Array.from(new Set(Object.keys(before.exceptions||{}).concat(Object.keys(after.exceptions||{}))));
      dates.forEach(function(date){if(JSON.stringify(before.exceptions?.[date])!==JSON.stringify(after.exceptions?.[date]))lines.push(displayDate(date)+': '+(after.exceptions?.[date]?shiftLabel(store.scheduleForDate(after,date)):'Use weekly hours'));});
      ['permission','sameDayMode','bookedDayMode'].forEach(function(key){if(before[key]!==after[key])lines.push(({permission:'Schedule requests',sameDayMode:'Today toggle',bookedDayMode:'Booking protection'})[key]+': '+(before[key]||'Default')+' → '+after[key]);});
      if(JSON.stringify(before.serviceIds)!==JSON.stringify(after.serviceIds))lines.push('Approved services: '+(after.serviceIds===null?'From staff skills':after.serviceIds.map(function(id){return catalog.services.find(function(service){return service.id===id;})?.name||id;}).join(', ')||'None'));
      Object.keys(after.availableToday||{}).forEach(function(date){if(before.availableToday?.[date]!==after.availableToday[date])lines.push(displayDate(date)+': new bookings '+(after.availableToday[date]?'enabled':'off'));});
    }
    if(after.type)lines.push(typeLabel(after.type)+' · '+displayDate(after.date)+' · '+requestProposal(after));
    if(after.reason)lines.push(after.reason);
    if(after.rejectionReason)lines.push('Rejection reason: '+after.rejectionReason);
    if(after.businessHours){lines.push('Time zone: '+after.timezone+' · Booking grid: '+after.slotIncrementMin+' min');lines.push(Object.keys(names).map(function(key){return names[key]+': '+shiftLabel(after.businessHours[key]);}).join(' · '));lines.push('Minimums: '+Object.keys(after.coverageMinimums).map(function(skill){return skill+' '+after.coverageMinimums[skill];}).join(', '));}
    return lines.length?'<ul>'+lines.map(function(line){return '<li>'+esc(line)+'</li>';}).join('')+'</ul>':'<p>Saved with the current schedule.</p>';
  }
  function activityPanel(state, catalog) {
    var logs = (state.audit || []).filter(function (item) { return item.salonId === store.SALON_ID; }).slice().reverse();
    return '<section class="schedule-activity"><header><h3>Schedule activity</h3><p>Changes and decisions saved in this browser.</p></header>' + (logs.length ? '<div class="schedule-activity-list">' + logs.map(function (entry) {
      var person = catalog.technicians.find(function (person) { return person.id === entry.staffId; });
      var date = new Date(entry.occurredAt);
      var rules = store.salonRules(store.SALON_ID);
      var when = date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:rules.timezone}) + ' · ' + date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:rules.timezone});
      return '<article><span class="schedule-activity-icon" aria-hidden="true">↻</span><div><strong>' + esc(entry.action) + '</strong><p>' + esc((person?.name || 'Salon') + ' · ' + entry.actor) + '</p><details><summary>View change</summary>' + activityDetails(entry,catalog) + '</details></div><time datetime="' + esc(entry.occurredAt) + '">' + esc(when) + '</time></article>';
    }).join('') + '</div>' : '<div class="schedule-empty">No schedule activity yet. Publish a schedule or review a request to see it here.</div>') + '</section>';
  }
  function approvedServicePicker(source, staff, catalog) {
    var services = catalog.services.filter(function (service) { return service.active !== false; });
    var categories = catalog.categories.map(function (category) { return {id:category.id,name:category.name,services:[]}; });
    services.forEach(function (service) {
      var name = service.categoryName || service.requiredSkill || 'Other services';
      var category = categories.find(function (item) { return item.id === service.categoryId; }) || categories.find(function (item) { return item.name.toLowerCase() === name.toLowerCase(); });
      if (!category) { category = {id:service.categoryId || 'schedule-category-' + categories.length,name:name,services:[]}; categories.push(category); }
      category.services.push(service);
    });
    categories = categories.filter(function (category) { return category.services.length; });
    return '<div class="tech-service-checks tech-service-picker" data-schedule-service-picker><div class="tech-service-picker-toolbar"><label><input type="checkbox" data-schedule-service-all>Check all services</label><span class="tech-service-picker-summary"><span class="tech-service-picker-count">' + services.length + '</span><i class="bi bi-chevron-down tech-service-picker-chevron" aria-hidden="true"></i></span></div>' + (categories.length ? categories.map(function (category, index) {
      return '<details class="tech-service-category"' + (index === 0 ? ' open' : '') + '><summary class="tech-service-category-head"><label class="tech-service-category-all"><input type="checkbox" data-schedule-service-category-all="' + esc(category.id) + '" aria-label="Check all ' + esc(category.name) + ' services">Check all</label><span class="tech-service-category-title">' + esc(category.name) + '</span><span class="tech-service-category-count">' + category.services.length + '</span></summary><div class="tech-service-category-body">' + category.services.map(function (service) {
        return '<label class="tech-service-check"><input type="checkbox" data-schedule-service="' + esc(service.id) + '" data-schedule-service-category="' + esc(category.id) + '" ' + (store.isEligible(staff,service,source) ? 'checked' : '') + '>' + esc(service.name) + '</label>';
      }).join('') + '</div></details>';
    }).join('') : '<div class="tech-service-catalog-state">No services available.</div>') + '</div>';
  }
  function syncApprovedServiceCheckAll() {
    var services = Array.from(modalHost.querySelectorAll('[data-schedule-service]'));
    function sync(input, options) {
      if (!input) return;
      var checkedCount = options.filter(function (option) { return option.checked; }).length;
      input.disabled = options.length === 0;
      input.checked = options.length > 0 && checkedCount === options.length;
      input.indeterminate = checkedCount > 0 && checkedCount < options.length;
    }
    sync(modalHost.querySelector('[data-schedule-service-all]'), services);
    modalHost.querySelectorAll('[data-schedule-service-category-all]').forEach(function (input) {
      sync(input, services.filter(function (service) { return service.dataset.scheduleServiceCategory === input.dataset.scheduleServiceCategoryAll; }));
    });
  }
  function permissionPanel(source, staff) {
    var catalog = salonData.loadCatalog();
    return '<div class="schedule-explainer"><strong>Staff app access</strong><p>Set today’s toggle separately from requests to change hours, breaks or future days.</p></div><label>Same-day availability toggle<select class="schedule-select" data-schedule-same-day><option value="allowed" ' + (source.sameDayMode === 'allowed' ? 'selected' : '') + '>Allowed</option><option value="request" ' + (source.sameDayMode === 'request' ? 'selected' : '') + '>Request manager approval</option><option value="none" ' + (source.sameDayMode === 'none' ? 'selected' : '') + '>Not allowed</option></select></label><label>Schedule change requests<select class="schedule-select" data-schedule-permission><option value="none" ' + (source.permission === 'none' ? 'selected' : '') + '>View only — requests disabled</option><option value="request" ' + (!['none','self'].includes(source.permission) ? 'selected' : '') + '>Manager approval required</option><option value="self" ' + (source.permission === 'self' ? 'selected' : '') + '>Apply directly when bookings are unaffected</option></select></label><label>Off toggle when appointments exist<select class="schedule-select" data-schedule-booked-day><option value="block" ' + (source.bookedDayMode === 'block' ? 'selected' : '') + '>Block the off toggle</option><option value="review" ' + (source.bookedDayMode === 'review' ? 'selected' : '') + '>Send for manager review</option></select></label><div class="schedule-permission-note"><strong>Confirmed appointments stay protected</strong><p>Changes that close booked times wait for manager resolution. The app never cancels or reassigns an appointment automatically.</p></div><fieldset class="schedule-eligibility"><legend>Approved booking services</legend><p>Choose the services this staff member can perform. Staff level is shown separately in their profile.</p>' + approvedServicePicker(source,staff,catalog) + '</fieldset>';
  }
  function rulesDialog(catalog) {
    if (!rulesOpen) return '';
    var rules = store.salonRules(store.SALON_ID);
    return '<div class="schedule-break-backdrop" data-schedule-rules-close></div><form class="schedule-rules-dialog" data-schedule-rules-form role="dialog" aria-modal="true" aria-labelledby="schedule-rules-title"><header><div><h2 id="schedule-rules-title">Booking &amp; coverage rules</h2><p>Demo rules used by Schedule and My Calendar.</p></div><button type="button" data-schedule-rules-close aria-label="Close rules">×</button></header><div class="schedule-rules-top"><label>Salon time zone<select class="schedule-select" data-rule-timezone>' + ['America/Chicago','America/New_York','America/Denver','America/Los_Angeles','Asia/Ho_Chi_Minh'].map(function (zone) { return '<option ' + (rules.timezone === zone ? 'selected' : '') + '>' + zone + '</option>'; }).join('') + '</select></label><label>Booking grid<select class="schedule-select" data-rule-grid>' + [15,30,60].map(function (step) { return '<option value="' + step + '" ' + (rules.slotIncrementMin === step ? 'selected' : '') + '>' + step + ' minutes</option>'; }).join('') + '</select></label></div><h3>Salon opening hours</h3><p class="schedule-help">Staff slots stay within these hours. Saved holidays and closures also apply.</p><div class="schedule-rule-hours">' + Object.keys(names).map(function (key) { var day=rules.businessHours[key]; return '<div data-rule-day="' + key + '"><label><input type="checkbox" data-rule-working ' + (day.working ? 'checked' : '') + '>' + names[key] + '</label><input type="time" data-rule-start value="' + (day.start || '09:00') + '" aria-label="' + names[key] + ' open time"><span>to</span><input type="time" data-rule-end value="' + (day.end || '19:00') + '" aria-label="' + names[key] + ' close time"></div>'; }).join('') + '</div><h3>Minimum staff by skill</h3><p class="schedule-help">Count scheduled staff with approved services. Minimums are demo settings and can be changed.</p><div class="schedule-rule-minimums">' + skillsFor(catalog).map(function (skill) { return '<label>' + esc(skill) + '<input type="number" min="0" max="50" step="1" data-rule-skill="' + esc(skill) + '" value="' + (Number(rules.coverageMinimums[skill]) || 0) + '" required></label>'; }).join('') + '</div><p data-rule-error class="schedule-form-error" role="alert"></p><footer><button type="button" data-schedule-rules-close>Cancel</button><button type="submit" class="booking-primary-button">Save rules</button></footer></form>';
  }
  function previewImpact() {
    snapshotEditor();
    var next = editorSchedule(), current = store.getStaffSchedule(store.SALON_ID,selectedStaff,{});
    var validation = store.validateSchedule(next);
    if (!validation.ok) { showError('Check working hours and breaks before reviewing the impact.'); return; }
    var added=0, removed=0, rows=appointments();
    week().forEach(function (date) {
      var key=dateKey(date), before=store.availabilityForDay({staffSchedule:current,technicianId:selectedStaff,date:key,appointments:rows,ignorePast:true}).openSlots;
      var after=store.availabilityForDay({staffSchedule:next,technicianId:selectedStaff,date:key,appointments:rows,ignorePast:true}).openSlots;
      added += after.filter(function (slot) { return !before.some(function (item) { return item.time===slot.time; }); }).length;
      removed += before.filter(function (slot) { return !after.some(function (item) { return item.time===slot.time; }); }).length;
    });
    var impacts=store.changeImpacts(selectedStaff,current,next,rows);
    var gaps=week().reduce(function (count,date) { return count+coverageAfterChange(selectedStaff,next,dateKey(date),salonData.loadCatalog()).length; },0);
    var catalog=salonData.loadCatalog(), person=catalog.technicians.find(function (person) { return person.id===selectedStaff; });
    var serviceCount=catalog.services.filter(function (service) { return store.isEligible(person,service,next); }).length;
    editorMessage='Selected week: '+added+' open time blocks added, '+removed+' removed. '+impacts.length+' existing booking(s) affected. '+serviceCount+' services approved. '+gaps+' skill/day coverage gap(s) after this change.';
    editorError='';
    render(selectedStaff);
  }
  function render(preselect) {
    if (preselect) selectedStaff = preselect;
    var catalog = salonData.loadCatalog();
    var people = catalog.technicians.filter(function (person) { return person.active !== false; });
    var days = week();
    var appointmentList = appointments();
    var state = store.loadState();
    var working = 0, slots = 0, conflicts = 0;
    var availabilityByStaff = {};
    people.forEach(function (person) {
      var schedule = store.getStaffSchedule(store.SALON_ID, person.id, {});
      availabilityByStaff[person.id] = {};
      days.forEach(function (date) {
        var key = dateKey(date);
        var availability = store.availabilityForDay({staffSchedule:schedule, technicianId:person.id, date:key, appointments:appointmentList});
        var dayConflicts = availability.conflicts.filter(function (item) { return item.startAt.slice(0, 10) === key; });
        if (key === boardDate) { if (availability.available) working++; slots += availability.openSlots.length; }
        conflicts += dayConflicts.length;
        availabilityByStaff[person.id][key] = {availability:availability, conflicts:dayConflicts};
      });
    });
    var openRequests = state.requests.filter(function (item) { return item.salonId === store.SALON_ID && matchesRequestFilter(item,'open'); }).length;
    var rules = store.salonRules(store.SALON_ID);
    var filtered = people.filter(function (person) { return (person.name + ' ' + (person.skills || []).join(' ')).toLowerCase().includes(searchValue.toLowerCase()); });
    var tabs = {team:'Team schedule',staff:'Staff & app access',booking:'Booking preview',activity:'Activity'};
    var viewControls = '<div class="schedule-view-toolbar">' + (workspaceTab==='team'?'<div class="schedule-view-toggle" role="group" aria-label="Group schedule by"><button type="button" data-schedule-view="staff" aria-pressed="' + (boardView === 'staff') + '">By staff</button><button type="button" data-schedule-view="skill" aria-pressed="' + (boardView === 'skill') + '">By skill</button></div>':'<p>Manage staff schedules, approved services and app permissions.</p>') + '<label class="schedule-search"><span>Find staff or skill</span><input type="search" data-schedule-search value="' + esc(searchValue) + '" placeholder="Search staff or skill"></label></div>';
    var board = boardView === 'skill' ? skillBoard(catalog,filtered,days,availabilityByStaff) : staffBoard(filtered,days,availabilityByStaff);
    var content = workspaceTab === 'team' ? coverageBanner(coverageRisks(catalog,people,days,availabilityByStaff)) + viewControls + board + '<p class="schedule-board-help">Select a day to add a date change. Select a staff name to edit the weekly schedule. Open starts use a 30-minute duration; Booking preview uses the selected service.</p>' : workspaceTab === 'staff' ? viewControls + staffAccessPanel(catalog,filtered) : workspaceTab === 'booking' ? bookingPreview(catalog,people,appointmentList) : activityPanel(state,catalog);
    host.innerHTML = '<header class="schedule-heading"><div><span class="schedule-eyebrow">STAFF &amp; BOOKING</span><h2>Schedule</h2><p>Plan the team, review changes and keep booking availability in sync.</p></div><div class="schedule-actions"><button type="button" data-schedule-rules-open>Booking rules</button><button type="button" class="booking-primary-button" data-schedule-add-staff>+ Add staff</button></div></header><div class="schedule-context"><span>' + esc(catalog.salon.name) + ' · ' + esc(rules.timezone) + '</span><span data-schedule-sync-status>' + (state.salons[store.SALON_ID]?.syncedAt ? 'Saved & synced in this browser' : 'Demo · saved in this browser') + '</span></div><div class="schedule-summary"><div class="schedule-card"><span>Available · ' + esc(displayDate(boardDate)) + '</span><strong>' + working + '<small> / ' + people.length + ' staff</small></strong></div><div class="schedule-card"><span>30-minute start times</span><strong>' + slots + '</strong></div><div class="schedule-card"><span>Requests to review</span><strong>' + openRequests + '</strong><button type="button" data-schedule-show-requests>Review requests →</button></div><div class="schedule-card' + (conflicts ? ' is-warning' : '') + '"><span>Booking conflicts · this week</span><strong>' + conflicts + '</strong></div></div><nav class="schedule-workspace-tabs" aria-label="Schedule views">' + Object.keys(tabs).map(function (key) { return '<button type="button" data-schedule-workspace="' + key + '" aria-pressed="' + (workspaceTab === key) + '">' + tabs[key] + '</button>'; }).join('') + '</nav>' + (workspaceTab === 'activity' ? '' : weekControls(days)) + '<section class="schedule-workspace-panel" aria-label="' + tabs[workspaceTab] + '">' + content + '</section>' + requestInbox(state,catalog) + editor() + impactDialog() + rulesDialog(catalog);
    var openCount = state.requests.filter(function (item) { return item.salonId === store.SALON_ID && matchesRequestFilter(item,'open'); }).length;
    document.querySelectorAll('[data-staff-requests-count]').forEach(function (badge) { badge.textContent = openCount; badge.setAttribute('aria-label',openCount + ' requests need review'); });
    if (requestsHost) {
      requestsHost.replaceChildren(host.querySelector('[data-schedule-requests]'));
    }
    modalHost.replaceChildren();
    Array.from(host.querySelectorAll('.schedule-backdrop,.schedule-drawer,.schedule-impact-backdrop,[data-request-impact],.schedule-break-backdrop,[data-break-form],.schedule-rules-dialog')).forEach(function (node) { modalHost.appendChild(node); });
    formatEditorDateFields();
    formatEditorDateFields(host);
    syncApprovedServiceCheckAll();
    modalHost.querySelectorAll('.tech-service-category-all').forEach(function (label) {
      label.addEventListener('click', function (event) { event.stopPropagation(); });
    });
    if (drawerOpen && store.loadState().drafts[store.SALON_ID]?.[selectedStaff]) {
      modalHost.querySelector('[data-schedule-save-draft]').insertAdjacentHTML('beforebegin', '<button type="button" data-schedule-discard>Discard saved draft</button>');
    }
    if (boardMessage) modalHost.insertAdjacentHTML('beforeend', '<div class="schedule-toast" role="status">' + esc(boardMessage) + '<button type="button" data-schedule-toast-close aria-label="Dismiss message">×</button></div>');
    // The editor lives outside hidden settings panels so Staff can open it directly.
    if (rulesOpen) modalHost.querySelector('[data-rule-timezone]')?.focus();
    else if (breakForm) modalHost.querySelector('[data-break-form] input:not(:disabled),[data-break-form] select:not(:disabled)')?.focus();
    else if (impactReview) modalHost.querySelector('[data-impact-close]')?.focus();
    else if (drawerOpen) modalHost.querySelector('#schedule-drawer-title')?.focus();
  }
  function snapshotEditor() {
    if (!drawerOpen || !editorValues) return;
    modalHost.querySelectorAll('[data-schedule-edit-day]').forEach(function (row) {
      if (editorScope === 'date' && dateMode !== 'custom-hours') return;
      var day = editorScope === 'weekly' ? editorValues.weekly[row.dataset.scheduleEditDay] : dateDraft;
      var off = row.querySelector('[data-schedule-off]');
      day.working = off ? !off.checked : true;
      day.start = row.querySelector('[data-schedule-start]').value;
      day.end = row.querySelector('[data-schedule-end]').value;
    });
    var permission = modalHost.querySelector('[data-schedule-permission]');
    if (permission) editorValues.permission = permission.value;
    var sameDay = modalHost.querySelector('[data-schedule-same-day]');
    if (sameDay) editorValues.sameDayMode = sameDay.value;
    var protection = modalHost.querySelector('[data-schedule-booked-day]');
    if (protection) editorValues.bookedDayMode = protection.value;
    var services = modalHost.querySelectorAll('[data-schedule-service]');
    if (services.length) editorValues.serviceIds = Array.from(services).filter(function (input) { return input.checked; }).map(function (input) { return input.dataset.scheduleService; });
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
  function showError(text) { editorError = text; var target = modalHost.querySelector('[data-schedule-error]'); if (target) { target.textContent = text; target.scrollIntoView?.({block:'nearest'}); } }
  function markEditorChanged() {
    editorMessage = 'Unsaved changes. Save draft or publish when ready.';
    editorError = '';
    var message = modalHost.querySelector('.schedule-editor-message');
    var error = modalHost.querySelector('[data-schedule-error]');
    if (message) message.textContent = editorMessage;
    if (error) error.textContent = '';
  }
  function saveDraft() {
    var invalidDate = modalHost.querySelector('[data-date-display]:invalid');
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
    if (result.ok) { drawerOpen = false; impactReview = null; editorValues = null; boardMessage = 'Schedule published. Staff calendar and Booking availability updated in this demo.'; render(selectedStaff); return; }
    if (result.error.code === 'booking-impact') { showImpacts('publish', selectedStaff, result.error.impacts); return; }
    showError('Schedule could not be published.');
  }
  function review(id, decision, reason) {
    var result = store.reviewRequest(id, decision, appointments(), undefined, undefined, reason);
    if (!result.ok && result.error.code === 'booking-impact') { showImpacts('request', id, result.error.impacts); return; }
    boardMessage = result.ok ? (decision === 'reject' ? 'Request rejected. The staff schedule is unchanged.' : 'Request approved. The staff schedule is updated in this demo.') : result.error.code==='request-expired'?'This same-day request has expired. Reject it and ask the staff member to submit a new request.':'Unable to review this request. Please check its hours, breaks and current status.';
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

  modalHost.addEventListener('input', function (event) {
    if (event.target.matches('[data-date-display]')) {
      event.target.setCustomValidity(parseDisplayDate(event.target.value) ? '' : 'Enter a valid date, for example Sep 29, 2026.');
    }
  });
  modalHost.addEventListener('change', function (event) {
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
    if (event.target.matches('[data-schedule-service-all],[data-schedule-service-category-all]')) {
      modalHost.querySelectorAll('[data-schedule-service]').forEach(function (input) {
        if (event.target.hasAttribute('data-schedule-service-all') || input.dataset.scheduleServiceCategory === event.target.dataset.scheduleServiceCategoryAll) input.checked = event.target.checked;
      });
    }
    if (event.target.matches('[data-schedule-service],[data-schedule-service-all],[data-schedule-service-category-all]')) syncApprovedServiceCheckAll();
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
  modalHost.addEventListener('submit', function (event) { if (event.target.matches('[data-break-form]')) { event.preventDefault(); saveBreak(event.target); } });
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
    var workspace = event.target.closest('[data-schedule-workspace]');
    if (workspace) { workspaceTab=workspace.dataset.scheduleWorkspace; render(selectedStaff); host.querySelector('[data-schedule-workspace="'+workspaceTab+'"]')?.focus(); return; }
    if (event.target.closest('[data-schedule-add-staff]')) { document.querySelector('[data-tech-modal-open]')?.click(); return; }
    if (event.target.closest('[data-schedule-show-requests]')) { (requestsHost || host).querySelector('[data-schedule-requests]')?.scrollIntoView({block:'start',behavior:'smooth'}); return; }
    if (event.target.closest('[data-schedule-rules-open]')) { rulesOpen=true; render(selectedStaff); return; }
    if (event.target.closest('[data-schedule-rules-close]')) { rulesOpen=false; render(selectedStaff); return; }
    var editStaff=event.target.closest('[data-schedule-edit-staff]');
    if (editStaff) { openEditor(editStaff.dataset.scheduleEditStaff,editStaff); return; }
    if (event.target.closest('[data-schedule-preview-impact]')) { previewImpact(); return; }
    var previewPerson=event.target.closest('[data-preview-staff]');
    if (previewPerson) { previewStaff=previewPerson.dataset.previewStaff; previewTime=''; render(selectedStaff); return; }
    var previewSlot=event.target.closest('[data-preview-time]');
    if (previewSlot) { previewTime=previewSlot.dataset.previewTime; render(selectedStaff); return; }
    if (event.target.closest('[data-preview-check]')) {
      var catalog=salonData.loadCatalog(), service=catalog.services.find(function (service) { return service.id===previewService; }), person=catalog.technicians.find(function (person) { return person.id===previewStaff; });
      var latest=store.availabilityForDay({staffSchedule:store.getStaffSchedule(store.SALON_ID,previewStaff,{}),technician:person,technicianId:previewStaff,service:service,date:boardDate,appointments:appointments()});
      boardMessage=latest.openSlots.some(function (slot) { return slot.time===previewTime; })?'This start time is still available. Open Booking Book to create an appointment.':'This start time is no longer available. Choose another slot.';
      render(selectedStaff); return;
    }

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
    if (event.target.closest('[data-schedule-this-week]')) { changeWeek(store.salonToday(store.SALON_ID), '[data-schedule-this-week]'); return; }
    if (event.target.closest('[data-schedule-toast-close]')) { boardMessage = ''; modalHost.querySelector('.schedule-toast')?.remove(); return; }
    var view = event.target.closest('[data-schedule-view]');
    if (view) { boardView = view.dataset.scheduleView; render(selectedStaff); host.querySelector('[data-schedule-view="' + boardView + '"]')?.focus(); return; }
    var day = event.target.closest('[data-schedule-day]');
    if (day) { opener = day; selectedStaff = day.dataset.scheduleStaff; selectedDate = day.dataset.scheduleDate; editorScope = 'date'; drawerOpen = true; loadEditorDay(); render(selectedStaff); return; }
    var tab = event.target.closest('[data-schedule-scope]');
    if (tab) { snapshotEditor(); editorScope = tab.dataset.scheduleScope; if (editorScope === 'date') loadDate(); render(selectedStaff); modalHost.querySelector('[data-schedule-scope="' + editorScope + '"]')?.focus(); return; }
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
  host.addEventListener('click', handleClick);
  if (requestsHost) requestsHost.addEventListener('click', handleClick);
  host.addEventListener('change', function (event) {
    if (event.target.matches('[data-date-display]')) {
      var iso=parseDisplayDate(event.target.value);
      event.target.setCustomValidity(iso?'':'Enter a valid date, for example Oct 9, 2026.');
      if(!iso){event.target.reportValidity();return;}
      var native=event.target.parentElement.querySelector('input[type="date"]'); native.value=iso; native.dispatchEvent(new Event('change',{bubbles:true})); return;
    }
    if (event.target.matches('[data-preview-service]')) { previewService=event.target.value; previewTime=''; render(selectedStaff); return; }
    if (event.target.matches('[data-schedule-week-date]')) changeWeek(event.target.value, '[data-schedule-week-date]');
  });
  host.addEventListener('input', function (event) {
    if(event.target.matches('[data-date-display]')){event.target.setCustomValidity(parseDisplayDate(event.target.value)?'':'Enter a valid date, for example Oct 9, 2026.');return;}
    if (!event.target.matches('[data-schedule-search]')) return;
    searchValue=event.target.value;
    var caret=event.target.selectionStart;
    render(selectedStaff);
    var input=host.querySelector('[data-schedule-search]'); input.focus(); input.setSelectionRange(caret,caret);
  });
  modalHost.addEventListener('submit', function (event) {
    if (!event.target.matches('[data-schedule-rules-form]')) return;
    event.preventDefault();
    var form=event.target, rules=store.salonRules(store.SALON_ID);
    rules.timezone=form.querySelector('[data-rule-timezone]').value;
    rules.slotIncrementMin=Number(form.querySelector('[data-rule-grid]').value);
    form.querySelectorAll('[data-rule-day]').forEach(function (row) { rules.businessHours[row.dataset.ruleDay]={working:row.querySelector('[data-rule-working]').checked,start:row.querySelector('[data-rule-start]').value,end:row.querySelector('[data-rule-end]').value,breaks:[]}; });
    form.querySelectorAll('[data-rule-skill]').forEach(function (input) { rules.coverageMinimums[input.dataset.ruleSkill]=Number(input.value); });
    var result=store.saveRules(store.SALON_ID,rules,undefined,appointments());
    if(!result.ok&&result.error.code==='booking-impact'){rulesOpen=false;showImpacts('rules',store.SALON_ID,result.error.impacts);return;}
    if (!result.ok) { form.querySelector('[data-rule-error]').textContent='Check opening hours and coverage minimums. Close time must follow open time.'; return; }
    rulesOpen=false; boardMessage='Booking rules and coverage minimums saved in this browser.'; render(selectedStaff);
  });
  modalHost.addEventListener('click', handleClick);
  function closeEditor() {
    drawerOpen = false;
    editorValues = null;
    breakForm = null;
    impactReview = null;
    render(selectedStaff);
    if (opener && opener.isConnected) opener.focus();
  }
  function openEditor(staffId, trigger) {
    selectedStaff = staffId;
    selectedDate = boardDate;
    editorScope = 'weekly';
    drawerOpen = true;
    opener = trigger;
    loadEditorDay();
    render(selectedStaff);
  }
  modalHost.addEventListener('keydown', function (event) {
    if (event.target.matches('[data-schedule-scope]') && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      event.preventDefault();
      var tabs = Array.from(modalHost.querySelectorAll('[data-schedule-scope]'));
      var index = tabs.indexOf(event.target);
      var next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      tabs[next].click(); return;
    }
    if (event.key === 'Escape') { event.preventDefault(); if (rulesOpen) { rulesOpen=false; render(selectedStaff); } else if (breakForm) { breakForm = null; render(selectedStaff); } else if (impactReview) { impactReview = null; render(selectedStaff); } else closeEditor(); }
    if (event.key !== 'Tab') return;
    var dialog = modalHost.querySelector('[data-schedule-rules-form]') || modalHost.querySelector('[data-break-form]') || modalHost.querySelector('[data-request-impact]:not([hidden])') || modalHost.querySelector('[data-schedule-drawer]');
    if (!dialog) return;
    var controls = Array.from(dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],summary'));
    var first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement.id === 'schedule-drawer-title')) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  if (appointmentStore?.subscribe) appointmentStore.subscribe(function () { render(selectedStaff); });
  var unsubscribe = store.subscribe(function () { render(selectedStaff); });
  window.addEventListener('storage',function(event){if(event.key===salonData.STORAGE_KEY||event.key==='nexora:holiday-closures:v2:'+store.SALON_ID)render(selectedStaff);});
  window.addEventListener('pagehide', unsubscribe, {once:true});
  window.NEXORA_STAFF_SCHEDULE_SETTINGS = {refresh:render,open:openEditor};
  render(new URLSearchParams(location.search).get('staff') || '');
})();
