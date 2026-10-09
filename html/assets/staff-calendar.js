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
  var selectedDate = validDate(params.get('date')) ? params.get('date') : store.salonToday(salonId);
  var activeTab = 'appointments';
  var requestType = '';
  var calendarService = '';
  var showAllSlots = false;
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
  function validDate(value){var date=new Date(value+'T12:00:00');return /^\d{4}-\d{2}-\d{2}$/.test(value||'')&&!Number.isNaN(date.getTime())&&dateKey(date)===value;}
  function time(value) { return value ? value.slice(11, 16) : ''; }
  function titleDate(value) { return new Date(value + 'T12:00:00').toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}); }
  function appointmentRows() {
    try { return appointmentStore ? appointmentStore.loadAll() : []; } catch (_) { return []; }
  }
  function personalAppointments() {
    return appointmentRows().filter(function (row) { return !['cancelled','no-show'].includes(row.status); }).flatMap(function (row) {
      var tickets=(row.tickets||[]).filter(function (ticket) { return ticket.technicianId===staffId; });
      if(tickets.length)return tickets.filter(function (ticket) { return (ticket.startAt||row.startAt||'').slice(0,10)===selectedDate; }).map(function (ticket) { return Object.assign({},row,{startAt:ticket.startAt||row.startAt,endAt:ticket.endAt||row.endAt,serviceNames:[ticket.serviceName||'Service'],technicianId:staffId}); });
      return row.technicianId===staffId&&(row.startAt||'').slice(0,10)===selectedDate?[row]:[];
    });
  }
  function visibleAppointments() { return personalAppointments(); }
  function eligibleServices() {
    var person=catalog.technicians.find(function (person) { return person.id===staffId; });
    var schedule=store.getStaffSchedule(salonId,staffId,{});
    return catalog.services.filter(function (service) { return store.isEligible(person,service,schedule); });
  }
  function dayAvailability() {
    var services=eligibleServices();
    if(!services.some(function (service) { return service.id===calendarService; }))calendarService=services[0]?.id||'';
    return store.availabilityForDay({staffSchedule:store.getStaffSchedule(salonId,staffId,{}),technician:catalog.technicians.find(function (person) { return person.id===staffId; }),technicianId:staffId,service:services.find(function (service) { return service.id===calendarService; }),date:selectedDate,appointments:appointmentRows()});
  }
  function week() {
    var active = new Date(selectedDate + 'T12:00:00');
    var start = new Date(active);
    start.setDate(active.getDate() - (active.getDay() + 6) % 7);
    return Array.from({length:7}, function (_, index) { var day = new Date(start); day.setDate(start.getDate() + index); return day; });
  }
  function currentDay() {
    return store.scheduleForDate(store.getStaffSchedule(salonId, staffId, {}), selectedDate);
  }
  function schedulePermission() { return store.getStaffSchedule(salonId, staffId, {}).permission; }
  function scheduleActions() {
    if (schedulePermission() === 'none') return '<section class="request-options"><h3>Need a schedule change?</h3><div class="quick-action-grid"><button type="button" data-chat-salon>Contact manager</button></div></section>';
    return '<section class="request-options"><h3>Schedule changes</h3><div class="quick-action-grid"><button type="button" data-request-day-off>Day off</button><button type="button" data-request-change-hours>Change hours</button><button type="button" data-request-break>Take break</button><button type="button" data-chat-salon>Contact manager</button></div></section>';
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
    var availability=dayAvailability(), services=eligibleServices();
    var items=[];
    if(availability.working)items.push({at:availability.start,title:'Work starts',meta:'Published by salon · '+(availability.available?'New bookings enabled':'New bookings off today'),kind:'boundary',label:'Work Schedule'});
    availability.breaks.forEach(function (pause) { items.push({at:pause.start,title:'Break',meta:pause.start+'–'+pause.end+' · Not bookable',kind:'break',label:'Break'}); });
    visibleAppointments().forEach(function (appointment) { items.push({at:time(appointment.startAt),title:(appointment.customerName||'Guest')+' · '+(appointment.serviceNames||[]).join(', '),meta:time(appointment.startAt)+'–'+time(appointment.endAt)+' · '+(appointment.status||'Appointment'),kind:'appointment',id:appointment.id,label:'Appointment'}); });
    if(services.length)(showAllSlots?availability.openSlots:availability.openSlots.slice(0,6)).forEach(function (slot) { items.push({at:slot.time,title:'Open slot',meta:time(slot.startAt)+'–'+time(slot.endAt)+' · '+services.find(function (service) { return service.id===calendarService; }).name,kind:'open',label:'Bookable'}); });
    if(availability.working)items.push({at:availability.end,title:'Work ends',meta:'No new bookings after this time',kind:'boundary',label:'Work Schedule'});
    items.sort(function (left,right) { return left.at.localeCompare(right.at); });
    var notice=!availability.working?'<div class="calendar-empty"><strong>'+(availability.closed?'Salon closed':'Day off')+'</strong><p>No bookable working hours. Existing appointments stay visible below.</p></div>':'';
    if(!items.length)return notice||'<div class="calendar-empty"><strong>No appointments</strong><p>Your appointments and published hours appear here.</p></div>';
    return notice+'<div class="timeline">'+items.map(function (item) {
      var body='<div class="timeline-card"><div><strong>'+esc(item.title)+'</strong><small>'+esc(item.meta)+'</small></div><span class="timeline-label">'+item.label+'</span></div>';
      return '<div class="timeline-item '+item.kind+'"><time>'+esc(displayTime(item.at))+'</time>'+(item.id?'<button type="button" class="calendar-appointment-trigger" data-calendar-appointment="'+esc(item.id)+'" aria-haspopup="dialog">'+body+'</button>':body)+'</div>';
    }).join('')+'</div>'+(services.length&&availability.openSlots.length>6?'<button type="button" class="calendar-more-slots" data-calendar-more-slots>'+(showAllSlots?'Show fewer open slots':'Show all '+availability.openSlots.length+' open slots')+'</button>':'');
  }
  function displayTime(value) { if(!value)return '—';var parts=value.split(':'),hour=Number(parts[0]);return (hour%12||12)+':'+parts[1]+(hour<12?' AM':' PM'); }
  function requestLabel(type) {
    return {'day-off':'Day off', 'change-hours':'Change hours', 'break':'Take break', 'weekly-schedule':'Weekly schedule', 'availability-today':'Today’s availability'}[type] || 'Schedule request';
  }
  function requestList() {
    var list = store.loadState().requests.filter(function (item) { return item.salonId === salonId && item.staffId === staffId; }).sort(function (left, right) { return String(right.createdAt).localeCompare(String(left.createdAt)); });
    if (!list.length) return '<div class="calendar-empty"><strong>No requests yet</strong><p>Your schedule requests and manager decisions appear here.</p></div>';
    return '<div class="request-list" data-request-list>' + list.map(function (item) {
      var detail = item.type === 'day-off' ? item.reason : item.start + '–' + item.end + (item.reason ? ' · ' + item.reason : '');
      if (item.type === 'availability-today') detail = item.available ? 'Receive new bookings today' : 'Stop new bookings today';
      if (item.type === 'weekly-schedule') detail = ['mon','tue','wed','thu','fri','sat','sun'].map(function (key) { var day = item.weekly[key]; return key[0].toUpperCase() + key.slice(1) + ': ' + (day.working ? day.start + '–' + day.end : 'Day off'); }).join(' · ');
      var cancellable = ['pending', 'adjusted','blocked'].includes(item.status);
      return '<article class="request-card"><header><div><strong>' + esc(requestLabel(item.type)) + '</strong><small>' + esc(titleDate(item.date)) + '</small></div><span class="request-status is-' + esc(item.status) + '">' + esc({pending:'Pending review',adjusted:'Pending review',blocked:'Booking conflict',applied:'Approved',rejected:'Rejected',cancelled:'Cancelled'}[item.status] || item.status) + '</span></header><p>' + esc(detail) + '</p>' + (item.status === 'blocked' ? '<small>Manager must resolve affected bookings before approval.</small>' : '') + (item.status === 'rejected' && item.rejectionReason ? '<p class="request-rejection-reason"><strong>Rejection reason:</strong> ' + esc(item.rejectionReason) + '</p>' : '') + (cancellable ? '<button type="button" data-request-cancel="' + esc(item.id) + '">Cancel request</button>' : '') + '</article>';
    }).join('') + '</div>';
  }
  function requestForm() {
    if (!requestType) return '';
    var direct = schedulePermission() === 'self';
    var timed = requestType !== 'day-off';
    var day = currentDay();
    var defaults = requestType === 'break' ? ['13:00','13:30'] : [day.start || '09:00',day.end || '19:00'];
    return '<form class="request-form ' + (direct ? 'is-direct' : 'is-approval') + '" data-request-form><header><div><strong>' + esc(requestLabel(requestType)) + '</strong><p>' + (direct ? 'Save changes to your own schedule. No approval is needed unless existing bookings are affected.' : 'Send your schedule change for approval. Your current hours stay unchanged until approved.') + '</p></div><button type="button" data-request-form-close aria-label="Close">×</button></header>' + approvalNotice() + '<label>Date<span class="calendar-date-picker request-date-picker"><span data-request-date-label>' + esc(titleDate(selectedDate)) + '</span><input type="date" data-request-date value="' + esc(selectedDate) + '" required aria-label="Request date"></span></label>' + (timed ? '<div class="request-time-fields"><label>Start time<input type="time" data-request-start value="' + defaults[0] + '" required></label><label>End time<input type="time" data-request-end value="' + defaults[1] + '" required></label></div>' : '') + (requestType === 'day-off' ? '<label>Reason for day off (optional)<textarea data-request-reason rows="3" maxlength="500" placeholder="Enter your reason, e.g. family appointment or personal day"></textarea></label>' : '<label>Reason<select class="staff-calendar-select" data-request-reason><option>Personal</option><option>Sick</option><option>Vacation</option><option>Appointment</option><option>Other</option></select></label>') + '<p class="request-feedback" data-request-feedback>' + esc(feedback) + '</p><button class="staff-primary-button" type="submit">' + (direct ? 'Save changes' : 'Send for approval') + '</button></form>';
  }
  function requestsPanel() {
    var permission = store.getStaffSchedule(salonId, staffId, {}).permission;
    if (permission === 'none') return '<div class="calendar-view">' + (actionMessage ? '<div class="schedule-action-message" role="status">' + esc(actionMessage) + '</div>' : '') + '<div class="calendar-empty"><strong>Requests disabled</strong><p>Contact your manager to change availability.</p></div>' + scheduleActions() + requestList() + '</div>';
    return '<div class="calendar-view">' + (actionMessage ? '<div class="schedule-action-message" role="status">' + esc(actionMessage) + '</div>' : '') + scheduleActions() + requestForm() + '<section class="calendar-section"><h3>Schedule change history</h3>' + requestList() + '</section></div>';
  }
  function mySchedulePanel() {
    return '<div class="calendar-view"><div class="calendar-work-notice"><strong>Published by your salon</strong><p>Weekly hours and approved date changes make up this schedule. Use Requests for a change.</p></div>'+personalScheduleCard()+scheduleActions()+'</div>';
  }
  function availabilityCard() {
    var today=store.salonToday(salonId), schedule=store.getStaffSchedule(salonId,staffId,{}), rules=store.salonRules(salonId);
    var day=store.scheduleForDate(schedule,today), salonOpen=store.businessDay(today,rules).working;
    var on=day.working&&salonOpen&&schedule.availableToday[today]!==false;
    var pending=store.loadState().requests.some(function (request) { return request.salonId===salonId&&request.staffId===staffId&&request.type==='availability-today'&&request.date===today&&['pending','blocked'].includes(request.status); });
    var disabled=schedule.sameDayMode==='none'||!day.working||!salonOpen||pending;
    var caption=!day.working?'No published shift today':!salonOpen?'Salon closed today':pending?'Change pending manager review':schedule.sameDayMode==='none'?'Toggle disabled by salon':schedule.sameDayMode==='request'?'Changes need manager approval':'Applies to new bookings only';
    return '<section class="availability-card"><div><strong>'+(on?'Available today':'Unavailable today')+'</strong><p>'+esc(titleDate(today))+' · '+esc(caption)+'</p></div><button type="button" class="availability-toggle'+(on?' is-on':'')+'" role="switch" aria-checked="'+on+'" aria-label="'+(on?'Stop new bookings today':'Receive new bookings today')+'" data-availability-toggle '+(disabled?'disabled':'')+'><span></span></button><span class="sync-pill">'+(pending?'Pending review':'Salon time')+'</span></section>';
  }
  function availabilityWarning() {
    var bookings=personalAppointments().length;
    return '<section class="calendar-warning"><strong>Existing appointments are protected</strong><p>'+bookings+' appointment'+(bookings===1?'':'s')+' on '+esc(titleDate(selectedDate))+'. Changes that close booked times require manager resolution.</p></section>';
  }
  function contextualSide() {
    var services=eligibleServices();
    return '<section class="calendar-side-summary"><h3>Open slots for</h3><label class="calendar-service-label">Service<select class="staff-calendar-select" data-calendar-service>'+services.map(function (service) { return '<option value="'+esc(service.id)+'" '+(calendarService===service.id?'selected':'')+'>'+esc(service.name)+' · '+service.durationMin+' min</option>'; }).join('')+(!services.length?'<option>No approved services</option>':'')+'</select></label></section>'+personalScheduleCard()+scheduleActions()+availabilityWarning();
  }
  function render() {
    catalog=salonData.loadCatalog();
    syncUrl();
    var person=catalog.technicians.find(function (person) { return person.id===staffId; });
    root.querySelector('[data-calendar-person]').textContent=person?.name || 'My schedule';
    root.querySelector('[data-calendar-date-caption]').textContent=titleDate(selectedDate);
    root.querySelector('[data-calendar-date-picker]').value=selectedDate;
    var availability=dayAvailability();
    var serviceCount=eligibleServices().length;
    root.querySelector('[data-calendar-summary]').innerHTML='<div><span>Published hours</span><strong>'+esc(availability.working?displayTime(availability.start)+'–'+displayTime(availability.end):availability.closed?'Salon closed':'Day off')+'</strong></div><div><span>Appointments</span><strong>'+personalAppointments().length+'</strong></div><div><span>'+ (serviceCount?'Bookable start times':'Approved services')+'</span><strong>'+(serviceCount?availability.openSlots.length:0)+'</strong></div>';
    root.querySelector('[data-calendar-sync]').textContent='Saved in this browser · '+store.salonRules(salonId).timezone;
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
      button.tabIndex=active?0:-1;
    });
    var panel = document.querySelector('[data-calendar-panel]');
    var count = visibleAppointments().length;
    panel.setAttribute('aria-labelledby','calendar-tab-'+activeTab);
    panel.querySelector('[data-calendar-heading]').textContent = activeTab === 'requests' ? 'My schedule changes' : activeTab === 'my-schedule' ? 'Work Schedule' : titleDate(selectedDate);
    panel.querySelector('[data-calendar-duration]').textContent = activeTab === 'appointments' ? count + ' appointment' + (count === 1 ? '' : 's') : activeTab === 'my-schedule' ? '' : (schedulePermission() === 'none' ? 'View only' : schedulePermission() === 'self' ? 'No approval needed' : 'Approval required');
    panel.querySelector('[data-calendar-timeline]').innerHTML = activeTab === 'appointments' ? appointmentsPanel() : activeTab === 'my-schedule' ? mySchedulePanel() : requestsPanel();
    var side = document.querySelector('[data-calendar-side]');
    var showSide = activeTab === 'appointments';
    side.hidden = !showSide;
    side.innerHTML = showSide ? contextualSide() : '';
    root.querySelector('.calendar-layout').classList.toggle('is-single-column', !showSide);
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
    var result=store.toggleToday(salonId,staffId,appointmentRows());
    actionMessage=result.ok?(result.request?.status==='applied'?'Today’s availability updated. Existing appointments are kept.':'Availability request sent. Your published schedule stays active during manager review.'):{'booking-impact':'Your salon blocks the off toggle when appointments exist. Contact your manager.','no-shift':'A today toggle cannot create working hours. Request a schedule change.','duplicate-request':'A request for today is already waiting for review.','request-not-allowed':'Your salon disabled the today toggle.'}[result.error.code]||'Unable to save. Please try again.';
    activeTab='requests';requestType='';feedback='';render();
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

  root.addEventListener('click', function (event) {
    var appointment = event.target.closest('[data-calendar-appointment]');
    if (appointment) { openAppointment(appointment.dataset.calendarAppointment); return; }
    var day = event.target.closest('[data-calendar-day]');
    if (day) { selectedDate = day.dataset.date; requestType = ''; showAllSlots=false; render(); return; }
    var tab = event.target.closest('[data-calendar-tab]');
    if (tab) { activeTab = tab.dataset.calendarTab; requestType = ''; feedback = ''; render(); return; }
    if (event.target.closest('[data-calendar-today]')) { selectedDate = store.salonToday(salonId); render(); return; }
    var step=event.target.closest('[data-calendar-week-step]');
    if (step) { var date=new Date(selectedDate+'T12:00:00'); date.setDate(date.getDate()+Number(step.dataset.calendarWeekStep)*7); selectedDate=dateKey(date); requestType=''; showAllSlots=false; render(); return; }
    if (event.target.closest('[data-calendar-more-slots]')) { showAllSlots=!showAllSlots; render(); return; }
    if (event.target.closest('[data-availability-toggle]')) { toggleAvailability(); return; }
    if (event.target.closest('[data-request-day-off]')) { openRequest('day-off'); return; }
    if (event.target.closest('[data-request-change-hours]')) { openRequest('change-hours'); return; }
    if (event.target.closest('[data-request-break]')) { openRequest('break'); return; }
    if (event.target.closest('[data-request-form-close]')) { requestType = ''; feedback = ''; render(); return; }
    if (event.target.closest('[data-chat-salon]')) { showToast('Contact your salon manager to discuss this schedule change.'); return; }
    var cancel = event.target.closest('[data-request-cancel]');
    if (cancel) { var result=store.cancelRequest(cancel.dataset.requestCancel, staffId); actionMessage=result.ok?'Request cancelled. Your schedule is unchanged.':'Unable to cancel this request. Please check its current status.'; render(); }
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
    feedback = {'request-not-allowed':'Salon policy does not allow requests.','duplicate-request':'A conflicting request already needs review for this date. Cancel it before submitting another.','break-outside-shift':'Choose a break inside your published working hours.','invalid-schedule':'Check the hours and breaks. Breaks must fit inside the shift and cannot overlap.'}[result.error.code] || 'Check the date and time, then try again.';
    render();
  });

  root.addEventListener('keydown',function(event){
    if(!event.target.matches('[data-calendar-tab]')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();var tabs=Array.from(root.querySelectorAll('[data-calendar-tab]')),index=tabs.indexOf(event.target);
    var next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length;
    tabs[next].click();tabs[next].focus();
  });
  root.addEventListener('change', function (event) {
    if(event.target.matches('[data-request-date]')&&event.target.value)root.querySelector('[data-request-date-label]').textContent=titleDate(event.target.value);
    if(event.target.matches('[data-calendar-service]')) { calendarService=event.target.value;showAllSlots=false;render(); }
    if(event.target.matches('[data-calendar-date-picker]') && validDate(event.target.value)) { selectedDate=event.target.value;requestType='';showAllSlots=false;render(); }
  });
  if(appointmentStore?.subscribe)appointmentStore.subscribe(function () { render(); });
  var unsubscribe = store.subscribe(function () { render(); });
  window.addEventListener('storage',function(event){if(event.key===salonData.STORAGE_KEY||event.key==='nexora:holiday-closures:v2:'+salonId)render();});
  window.addEventListener('pagehide', unsubscribe, {once:true});
  render();
})();
