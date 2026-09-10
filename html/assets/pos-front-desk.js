(function () {
  'use strict';
  if (window.NEXORA_FRONT_DESK_REDIRECTING) return;
  const $ = selector => document.querySelector(selector);
  const store = window.NEXORA_APPOINTMENTS_STORE;
  const catalog = window.NEXORA_SALON_DATA.loadCatalog();
  const labels = {pending:'Pending', confirmed:'Confirmed', 'checked-in':'Checked In', completed:'Completed', cancelled:'Cancelled', 'no-show':'No Show'};
  const validViews = ['table', 'cards', 'calendar'];
  let view = 'table';
  function syncNavigation(push) {
    const url = new URL(window.location.href);
    if ((url.searchParams.get('section') || url.searchParams.get('tab')) === 'estimate') return;
    url.searchParams.set('tab', 'appointments');
    url.searchParams.set('view', view);
    if (view === 'calendar' && !['day','week','twoWeeks','threeWeeks','month'].includes(url.searchParams.get('calendarView'))) url.searchParams.set('calendarView', 'day');
    if (url.href !== window.location.href) window.history[push ? 'pushState' : 'replaceState'](null, '', url);
    document.querySelectorAll('.views [data-view]').forEach(button => {
      const active = button.dataset.view === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function restoreNavigation() {
    const requested = new URLSearchParams(window.location.search).get('view');
    view = validViews.includes(requested) ? requested : 'table';
    syncNavigation(false);
    render();
  }
  let editing = null;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = value => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}) : '—';
  const time = value => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) : '';
  const records = () => store.loadAll();
  const services = row => (row.serviceNames || []).map(name => '<span class="chip">'+esc(name)+'</span>').join(' ');
  const status = row => '<span class="chip status '+esc(row.status)+'">'+esc(labels[row.status] || row.status)+'</span>';
  const technician = row => '<span class="chip tech">'+esc(row.technicianName || 'Unassigned')+'</span>';
  function actions(row) {
    const available = ['pending','confirmed'].includes(row.status);
    return '<div class="actions">'+(available ? '<button class="checkin" data-action="checkin" data-id="'+esc(row.id)+'">✓ Check In</button><button data-action="reschedule" data-id="'+esc(row.id)+'">Reschedule</button><button class="cancel" data-action="cancel" data-id="'+esc(row.id)+'">× Cancel</button>' : '')+'<button data-action="view" data-id="'+esc(row.id)+'">⊙ View</button></div>';
  }
  function card(row) {
    return '<article class="appointment-card"><h3>'+esc(row.customerName)+'</h3><p>'+esc(row.phone)+'</p><p>'+date(row.startAt)+' · '+time(row.startAt)+'</p><p>'+services(row)+'</p>'+technician(row)+' '+status(row)+actions(row)+'</article>';
  }
  function render() {
    const isCalendar = view === 'calendar';
    const calendar = $('#team-calendar');
    $('#appointments').classList.toggle('calendar-view', isCalendar);
    $('#booking-results').hidden = isCalendar;
    calendar.hidden = !isCalendar;
    $('#calendar-reward-settings').hidden = !isCalendar;
    if (isCalendar) {
      window.NEXORA_TEAM_CALENDAR.mount(calendar);
      return;
    }
    const from = $('#from-date').value, to = $('#to-date').value;
    if (from && to && from > to) { $('#booking-results').innerHTML='<p class="empty">The end date must be on or after the start date.</p>'; $('#booking-count').textContent=''; return; }
    const rows = records().filter(row => (!$('#status-filter').value || row.status === $('#status-filter').value) && (!$('#tech-filter').value || row.technicianId === $('#tech-filter').value) && (!from || row.startAt.slice(0,10) >= from) && (!to || row.startAt.slice(0,10) <= to)).sort((a,b) => b.startAt.localeCompare(a.startAt));
    $('#booking-count').textContent = rows.length+' booking'+(rows.length === 1 ? '' : 's');
    if (!rows.length) { $('#booking-results').innerHTML='<p class="empty">No appointments found. Adjust the filters or create a new booking.</p>'; return; }
    if (view === 'table') {
      $('#booking-results').innerHTML='<div class="table-wrap"><table><thead><tr>'+['Customer','Created','Date & Time','Services','Technician','Status','Actions'].map(x => '<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row => '<tr><td><strong>'+esc(row.customerName)+'</strong><small>'+esc(row.phone)+'</small></td><td>'+date(row.createdAt)+'<br>'+time(row.createdAt)+'</td><td>'+date(row.startAt)+'<br>'+time(row.startAt)+'</td><td>'+services(row)+'</td><td>'+technician(row)+'</td><td>'+status(row)+'</td><td>'+actions(row)+'</td></tr>').join('')+'</tbody></table></div>';
    } else if (view === 'cards') $('#booking-results').innerHTML='<div class="cards">'+rows.map(card).join('')+'</div>';

  }
  catalog.technicians.filter(t=>t.active).forEach(t => {
    const option='<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>';
    $('#tech-filter').insertAdjacentHTML('beforeend',option);
    $('[name="technicianId"]').insertAdjacentHTML('beforeend',option);
  });
  catalog.services.filter(s=>s.active).forEach(s => $('[name="service"]').insertAdjacentHTML('beforeend','<option value="'+esc(s.id)+'">'+esc(s.name)+'</option>'));
  ['#status-filter','#tech-filter','#from-date','#to-date'].forEach(selector => $(selector).addEventListener('change',render));
  document.querySelectorAll('.views [data-view]').forEach(button => button.addEventListener('click',()=>{
    view = button.dataset.view;
    syncNavigation(true);
    render();
  }));
  $('#team-calendar').addEventListener('calendar-view-change', event => {
    const url = new URL(window.location.href);
    url.searchParams.set('calendarView', event.detail.view);
    if (url.href !== window.location.href) window.history.pushState(null, '', url);
  });
  window.addEventListener('popstate', restoreNavigation);
  function openDialog(row, readonly) {
    editing=row || null;
    $('#booking-form').reset(); $('#form-error').textContent='';
    $('#dialog-title').textContent=readonly ? 'Appointment Details' : row ? 'Reschedule Appointment' : 'New Booking';
    $('#save-booking').hidden=!!readonly;
    document.querySelectorAll('#booking-fields input, #booking-fields select').forEach(input=>{input.disabled=!!readonly || (!!row && input.name!=='startAt');});
    if(row) { ['customerName','phone','technicianId'].forEach(key=>{$('#booking-fields [name="'+key+'"]').value=row[key] || '';}); $('[name="startAt"]').value=row.startAt.slice(0,16); $('[name="service"]').value=row.serviceIds[0] || ''; }
    $('#booking-dialog').showModal();
  }
  $('#calendar-reward-settings').addEventListener('click', () => {
    $('#team-calendar').dispatchEvent(new Event('calendar-reward-settings'));
  });
  $('#new-booking').addEventListener('click',()=>openDialog(null,false));
  $('#close-dialog').addEventListener('click',()=>$('#booking-dialog').close());
  $('#booking-form').addEventListener('submit',event=>{
    event.preventDefault();
    const fields=new FormData(event.currentTarget);
    const startAt=fields.get('startAt');
    let result;
    if(editing) {
      const shift=new Date(startAt).getTime()-new Date(editing.startAt).getTime();
      const local=value=>{const d=new Date(new Date(value).getTime()+shift);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,19);};
      result=store.update(editing.id,{startAt,endAt:local(editing.endAt),tickets:(editing.tickets || []).map(ticket=>({...ticket,startAt:local(ticket.startAt),endAt:local(ticket.endAt)}))});
    } else result=store.create({id:'front-desk-'+crypto.randomUUID(),customerName:fields.get('customerName'),phone:fields.get('phone'),startAt,serviceIds:[fields.get('service')],technicianId:fields.get('technicianId') || null,status:'confirmed',source:'front-desk'});
    if(!result.ok){$('#form-error').textContent=result.error.message;return;}
    $('#booking-dialog').close(); $('#feedback').textContent='Appointment saved.'; render();
  });
  $('#booking-results').addEventListener('click',event=>{
    const button=event.target.closest('[data-action]'); if(!button)return;
    const row=records().find(r=>r.id===button.dataset.id); if(!row)return;
    const action=button.dataset.action;
    if(action==='view' || action==='reschedule'){openDialog(row,action==='view');return;}
    if(action==='cancel' && !window.confirm('Cancel this appointment for '+row.customerName+'?'))return;
    const result=action==='cancel' ? store.cancel(row.id) : store.update(row.id,{status:'checked-in'});
    $('#feedback').textContent=result.ok ? (action==='cancel' ? 'Appointment cancelled.' : 'Appointment marked as checked in.') : result.error.message;
    render();
  });
  const bookingUrl=new URL('../customer/booking.html',window.location.href).href;
  $('#booking-url').href=bookingUrl;$('#booking-url').textContent=bookingUrl;
  $('#copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(bookingUrl);$('#feedback').textContent='Booking link copied.';}catch(error){$('#feedback').textContent='Select and copy the booking link above.';}});
  store.subscribe(render);restoreNavigation();
})();
