(function () {
  'use strict';
  if (window.NEXORA_FRONT_DESK_REDIRECTING) return;
  const $ = selector => document.querySelector(selector);
  const store = window.NEXORA_APPOINTMENTS_STORE;
  const catalog = window.NEXORA_SALON_DATA.loadCatalog();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => '<i data-lucide="'+name+'" aria-hidden="true"></i>';
  const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value)||0);
  const date = value => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
  const time = value => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) : '';
  const labels = {pending:'Pending',confirmed:'Confirmed','checked-in':'Checked In','in-service':'In Service',completed:'Completed',cancelled:'Cancelled','no-show':'No Show'};
  const records = () => store.loadAll();
  const activeServices = catalog.services.filter(service=>service.active!==false);
  const categoryOf = service => service.categoryName || service.requiredSkill || 'Uncategorized';
  let mode='booking',view='calendar',editing=null,readOnly=false,selectedServices=[],serviceCategory='All';
  const localToday=new Date();
  let calendarDate=window.NEXORA_STAFF_SCHEDULE_STORE?.salonToday(window.NEXORA_STAFF_SCHEDULE_STORE.SALON_ID) || localToday.getFullYear()+'-'+String(localToday.getMonth()+1).padStart(2,'0')+'-'+String(localToday.getDate()).padStart(2,'0');
  function isBookingSection() {
    const params=new URLSearchParams(location.search),section=params.get('section') || params.get('tab');
    return ['appointments','booking'].includes(section) || (!section&&params.has('view'));
  }
  function syncNavigation(push) {
    if(!isBookingSection())return;
    const url=new URL(location.href);
    url.searchParams.set('section','appointments');url.searchParams.set('tab','booking');
    url.searchParams.set('bookingView',mode);
    if(mode==='appointment')url.searchParams.set('view',view);else url.searchParams.delete('view');
    if(mode==='appointment'&&view==='calendar'&&!['day','week','twoWeeks','threeWeeks','month'].includes(url.searchParams.get('calendarView')))url.searchParams.set('calendarView','day');
    if(url.href!==location.href)history[push?'pushState':'replaceState'](history.state,'',url);
  }
  function restoreNavigation() {
    const params=new URLSearchParams(location.search);
    mode=params.get('bookingView')==='appointment'||(!params.has('bookingView')&&['table','cards','calendar'].includes(params.get('view')))?'appointment':'booking';
    view=['table','cards','calendar'].includes(params.get('view'))?params.get('view'):'calendar';
    syncNavigation(false);render();
  }
  function sourceOf(row) {
    const source=String(row.source||'').toLowerCase();
    if(/^(ai(?:[-_\s]|$)|voice|phone|call)|booking-book/.test(source))return {id:'ai',label:'AI Voice'};
    if(/website|online|oneqr|qr|customer/.test(source))return {id:'website',label:'Website / OneQR'};
    return {id:'front-desk',label:'Front Desk'};
  }
  const services = row => (row.serviceNames || []).map(name=>'<span class="chip">'+esc(name)+'</span>').join('');
  const status = row => '<span class="chip status '+esc(row.status)+'">'+esc(labels[row.status]||row.status)+'</span>';
  const technician = row => '<span class="chip tech">'+esc(row.technicianName||'Unassigned')+'</span>';
  function actions(row) {
    const available=['pending','confirmed'].includes(row.status);
    const button=(label,action,symbol,cls='')=>'<button type="button" class="'+cls+'" data-action="'+action+'" data-id="'+esc(row.id)+'">'+icon(symbol)+label+'</button>';
    return '<div class="actions">'+(available?button('Check In','checkin','check','checkin')+button('Reschedule','reschedule','calendar-clock','reschedule')+button('Cancel','cancel','x','cancel'):'')+button('View','view','eye')+'</div>';
  }
  function customer(row) {
    const number=row.metadata?.checkIn?.ticketNumber;
    return '<div class="booking-customer-name"><strong>'+esc(row.customerName)+'</strong>'+(number?'<span>#'+esc(number)+'</span>':'')+'</div><small>'+esc(row.phone)+'</small>';
  }
  function card(row) {
    return '<article class="appointment-card"><h3>'+esc(row.customerName)+'</h3><p>'+esc(row.phone)+'</p><p>'+date(row.startAt)+' · '+time(row.startAt)+'</p><div class="booking-service-tags">'+services(row)+'</div>'+technician(row)+' '+status(row)+actions(row)+'</article>';
  }
  function filteredRecords() {
    const query=$('#booking-search').value.trim().toLowerCase(),digits=query.replace(/\D/g,''),from=$('#from-date').value,to=$('#to-date').value;
    return records().filter(row=>(!query||row.customerName.toLowerCase().includes(query)||(digits&&row.phone.replace(/\D/g,'').includes(digits)))&&
      (!$('#status-filter').value||row.status===$('#status-filter').value)&&(!$('#source-filter').value||sourceOf(row).id===$('#source-filter').value)&&
      (!$('#tech-filter').value||row.technicianId===$('#tech-filter').value||row.tickets?.some(ticket=>ticket.technicianId===$('#tech-filter').value))&&
      (!from||row.startAt.slice(0,10)>=from)&&(!to||row.startAt.slice(0,10)<=to)&&
      (mode==='booking'||row.startAt.slice(0,10)===calendarDate)).sort((a,b)=>(b.createdAt||b.startAt).localeCompare(a.createdAt||a.startAt));
  }
  function render() {
    if(!isBookingSection())return;
    $('#appointments').dataset.bookingMode=mode;
    document.querySelectorAll('[data-booking-view]').forEach(button=>{const selected=button.dataset.bookingView===mode;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
    document.querySelectorAll('#appointments .views [data-view]').forEach(button=>{const selected=button.dataset.view===view;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
    $('[data-booking-list-tools]').hidden=mode!=='booking';$('#appointments .views').hidden=mode!=='appointment';
    const isCalendar=mode==='appointment'&&view==='calendar',calendar=$('#team-calendar');
    $('#booking-results').hidden=isCalendar;calendar.hidden=!isCalendar;
    $('#appointments').classList.toggle('calendar-view',isCalendar);
    if(isCalendar){window.NEXORA_TEAM_CALENDAR.mount(calendar);window.NEXORA_BOOKING_CALENDAR.enhance(calendar);return;}
    const from=$('#from-date').value,to=$('#to-date').value;
    if(from&&to&&from>to){$('#booking-results').innerHTML='<p class="empty">The end date must be on or after the start date.</p>';$('#booking-count').textContent='';return;}
    const rows=filteredRecords();$('#booking-count').textContent=rows.length+' booking'+(rows.length===1?'':'s');
    if(!rows.length){$('#booking-results').innerHTML='<p class="empty">No appointments found. Adjust the filters or create a new booking.</p>';return;}
    if(mode==='appointment'&&view==='cards')$('#booking-results').innerHTML='<div class="cards">'+rows.map(card).join('')+'</div>';
    else $('#booking-results').innerHTML='<div class="table-wrap"><table class="booking-table"><thead><tr>'+['Customer','Created','Date & Time','Services','Technician','Source','Status','Actions'].map(label=>'<th scope="col">'+label+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>{
      const source=sourceOf(row);
      return '<tr class="booking-row status-'+esc(row.status)+'"><td>'+customer(row)+'</td><td>'+date(row.createdAt)+'<small>'+time(row.createdAt)+'</small></td><td>'+date(row.startAt)+'<small>'+time(row.startAt)+'</small></td><td><div class="booking-service-tags">'+services(row)+'</div></td><td>'+technician(row)+'</td><td><span class="chip booking-source source-'+source.id+'">'+source.label+'</span></td><td>'+status(row)+'</td><td>'+actions(row)+'</td></tr>';
    }).join('')+'</tbody></table></div>';
    window.lucide?.createIcons();
  }
  catalog.technicians.filter(tech=>tech.active!==false).forEach(tech=>{
    const option='<option value="'+esc(tech.id)+'">'+esc(tech.name)+'</option>';
    $('#tech-filter').insertAdjacentHTML('beforeend',option);$('#booking-fields [name="technicianId"]').insertAdjacentHTML('beforeend',option);
  });
  ['#status-filter','#source-filter','#tech-filter','#from-date','#to-date'].forEach(selector=>$(selector).addEventListener('change',render));
  $('#booking-search').addEventListener('input',render);
  document.querySelectorAll('[data-booking-view]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.bookingView;closeFilters();syncNavigation(true);render();}));
  document.querySelectorAll('#appointments .views [data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;syncNavigation(true);render();}));
  $('#team-calendar').addEventListener('calendar-view-change',event=>{if(!isBookingSection())return;const url=new URL(location.href);url.searchParams.set('calendarView',event.detail.view);if(url.href!==location.href)history.replaceState(history.state,'',url);});
  $('#team-calendar').addEventListener('booking-calendar-date-change',event=>{calendarDate=event.detail.date;if(mode==='appointment'&&view==='calendar')$('#booking-count').textContent=event.detail.count+' booking'+(event.detail.count===1?'':'s');});
  $('#team-calendar').addEventListener('booking-open-record',event=>{const row=records().find(row=>row.id===event.detail.id);if(row)openDialog(row,true);});
  $('#team-calendar').addEventListener('booking-new-slot',event=>{openDialog(null,false);$('#booking-fields [name="date"]').value=event.detail.date;$('#booking-fields [name="time"]').value=event.detail.time;$('#booking-fields [name="technicianId"]').value=event.detail.technicianId;});
  window.addEventListener('popstate',restoreNavigation);
  function closeFilters(){$('#booking-filter-panel').hidden=true;$('#booking-filter-toggle').setAttribute('aria-expanded','false');}
  $('#booking-filter-toggle').addEventListener('click',()=>{const open=$('#booking-filter-panel').hidden;$('#booking-filter-panel').hidden=!open;$('#booking-filter-toggle').setAttribute('aria-expanded',String(open));});
  $('#clear-booking-filters').addEventListener('click',()=>{['source-filter','status-filter','tech-filter','from-date','to-date'].forEach(id=>$('#'+id).value='');render();});
  document.addEventListener('click',event=>{if(!event.target.closest('.booking-filter-anchor'))closeFilters();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeFilters();});
  function renderServicePicker() {
    const query=$('#booking-service-search').value.trim().toLowerCase(),categories=['All',...new Set(activeServices.map(categoryOf))];
    $('[data-booking-service-categories]').innerHTML=categories.map(category=>'<button type="button" data-booking-category="'+esc(category)+'" aria-pressed="'+(category===serviceCategory)+'" class="'+(category===serviceCategory?'active':'')+'">'+esc(category)+'</button>').join('');
    const rows=activeServices.filter(service=>(serviceCategory==='All'||categoryOf(service)===serviceCategory)&&service.name.toLowerCase().includes(query));
    $('[data-booking-service-list]').innerHTML=[...new Set(rows.map(categoryOf))].map(category=>'<section><h4>'+esc(category)+'</h4>'+rows.filter(service=>categoryOf(service)===category).map(service=>'<div class="booking-picker-row"><span>'+esc(service.name)+' — '+(service.price==null?'—':money(service.price))+'</span><button type="button" data-booking-add="'+esc(service.id)+'" '+(readOnly||editing||service.price==null?'disabled':'')+'>+ Add</button></div>').join('')+'</section>').join('');
  }
  function renderSelectedServices() {
    $('[data-booking-selected-count]').textContent=selectedServices.length;
    $('[data-booking-selected-list]').innerHTML=selectedServices.length?selectedServices.map((service,index)=>'<div class="booking-selected-row"><span>'+esc(service.name||service.serviceName)+'</span><strong>'+money(service.price)+'</strong>'+(!readOnly&&!editing?'<button type="button" data-booking-remove="'+index+'" aria-label="Remove '+esc(service.name||service.serviceName)+'">×</button>':'')+'</div>').join(''):'<p>No services selected yet.</p>';
    $('[data-booking-total]').textContent=money(selectedServices.reduce((sum,service)=>sum+Number(service.price||0),0));
  }
  function openDialog(row,readonly) {
    editing=row||null;readOnly=!!readonly;selectedServices=row?(row.tickets?.length?row.tickets.map(ticket=>({...ticket,name:ticket.serviceName})):row.serviceIds.map(id=>activeServices.find(service=>service.id===id)).filter(Boolean)):[];
    serviceCategory='All';$('#booking-form').reset();$('#form-error').textContent='';
    $('#dialog-title').textContent=readOnly?'Appointment Details':row?'Reschedule Appointment':'New Booking';
    $('#booking-dialog').dataset.readonly=String(readOnly);$('#save-booking').hidden=readOnly;
    $('#save-booking').textContent=row?'Save Booking':'Create Booking';
    $('#booking-fields').querySelectorAll('input,select').forEach(input=>{input.disabled=readOnly||(!!row&&!['date','time'].includes(input.name));});
    if(row){['customerName','phone','technicianId'].forEach(key=>$('#booking-fields [name="'+key+'"]').value=row[key]||'');$('#booking-fields [name="date"]').value=row.startAt.slice(0,10);$('#booking-fields [name="time"]').value=row.startAt.slice(11,16);}
    renderServicePicker();renderSelectedServices();$('#booking-dialog').showModal();
  }
  $('#new-booking').addEventListener('click',()=>openDialog(null,false));
  $('#close-dialog').addEventListener('click',()=>$('#booking-dialog').close());
  $('[data-close-booking]').addEventListener('click',()=>$('#booking-dialog').close());
  $('#booking-service-search').addEventListener('input',renderServicePicker);
  $('#booking-dialog').addEventListener('click',event=>{
    const category=event.target.closest('[data-booking-category]'),add=event.target.closest('[data-booking-add]'),remove=event.target.closest('[data-booking-remove]');
    if(category){serviceCategory=category.dataset.bookingCategory;renderServicePicker();}
    if(add&&!readOnly&&!editing){const service=activeServices.find(service=>service.id===add.dataset.bookingAdd&&service.price!=null);if(service){selectedServices.push(service);renderSelectedServices();}}
    if(remove&&!readOnly&&!editing){selectedServices.splice(Number(remove.dataset.bookingRemove),1);renderSelectedServices();}
  });
  $('#booking-form').addEventListener('submit',event=>{
    event.preventDefault();if(readOnly)return;
    const fields=new FormData(event.currentTarget),startAt=fields.get('date')+'T'+fields.get('time');
    if(!selectedServices.length){$('#form-error').textContent='Choose at least one service.';return;}
    const technicianId=editing?.technicianId||fields.get('technicianId')||null;
    const durationMin=selectedServices.reduce((sum,service)=>sum+(Number(service.durationMin)||30),0);
    const availability=window.NEXORA_FRONT_DESK_SCHEDULE?.validateBooking({salonId:catalog.salon.id,appointmentId:editing?.id,technicianId,startAt,durationMin});
    if(availability&&!availability.ok){$('#form-error').textContent=availability.error.message;return;}
    let result;
    if(editing){const shift=new Date(startAt).getTime()-new Date(editing.startAt).getTime();const local=value=>{const d=new Date(new Date(value).getTime()+shift);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,19);};result=store.update(editing.id,{startAt,endAt:local(editing.endAt),tickets:(editing.tickets||[]).map(ticket=>({...ticket,startAt:local(ticket.startAt),endAt:local(ticket.endAt)}))});}
    else result=store.create({id:'front-desk-'+crypto.randomUUID(),customerName:fields.get('customerName'),phone:fields.get('phone'),startAt,tickets:selectedServices.map(service=>({serviceId:service.id,serviceName:service.name,price:service.price,durationMin:service.durationMin,technicianId})),technicianId,status:'confirmed',source:'front-desk'});
    if(!result.ok){$('#form-error').textContent=result.error.message;return;}
    $('#booking-dialog').close();$('#feedback').textContent='Appointment saved.';render();
  });
  $('#booking-results').addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button)return;
    const row=records().find(row=>row.id===button.dataset.id);if(!row)return;
    if(['view','reschedule'].includes(button.dataset.action)){openDialog(row,button.dataset.action==='view');return;}
    if(button.dataset.action==='cancel'&&!window.confirm('Cancel this appointment for '+row.customerName+'?'))return;
    const result=button.dataset.action==='cancel'?store.cancel(row.id):store.update(row.id,{status:'checked-in'});
    $('#feedback').textContent=result.ok?(button.dataset.action==='cancel'?'Appointment cancelled.':'Appointment marked as checked in.'):result.error.message;render();
  });
  const bookingUrl=new URL('../customer/booking.html',location.href).href;
  $('#booking-url').href=bookingUrl;$('#booking-url').textContent=bookingUrl.replace(/^https?:\/\//,'');$('#booking-open-link').href=bookingUrl;
  $('#copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(bookingUrl);$('#feedback').textContent='Booking link copied.';}catch(_){$('#feedback').textContent='Select and copy the booking link above.';}});
  $('#calendar-reward-settings').addEventListener('click',()=>{const host=$('#team-calendar');window.NEXORA_TEAM_CALENDAR.mount(host);window.NEXORA_BOOKING_CALENDAR.enhance(host);host.dataset.policyOnly=String(host.hidden);host.hidden=false;host.dispatchEvent(new Event('calendar-reward-settings'));});
  $('#team-calendar').addEventListener('booking-policy-closed',()=>{delete $('#team-calendar').dataset.policyOnly;$('#team-calendar').hidden=!(mode==='appointment'&&view==='calendar');});
  const turnDialog=$('#booking-turn-dialog');
  let turnDraft;
  function renderTurnRanges(){
    $('[data-booking-turn-range-count]').textContent=turnDraft.serviceWeights.length+' ranges';
    $('[data-booking-turn-ranges]').innerHTML=turnDraft.serviceWeights.map((weight,index)=>{
      const from=index?turnDraft.serviceThresholds[index-1]:0,last=index===turnDraft.serviceWeights.length-1;
      return '<tr><td><b>'+ (index+1) +'</b></td><td>'+money(from)+'</td><td>'+(last?'<span class="booking-no-limit">∞ No limit</span>':'<span class="booking-turn-amount"><span>$</span><input type="number" min="0" step="0.01" data-booking-turn-up-to="'+index+'" aria-label="Up to '+(index+1)+'" value="'+((turnDraft.serviceThresholds[index]*100-1)/100).toFixed(2)+'" required></span>')+'</td><td><span class="booking-turn-weight"><input type="number" min="0" step="any" data-booking-turn-weight="'+index+'" aria-label="Turn credit '+(index+1)+'" value="'+weight+'" required><span>turns</span></span></td><td><button type="button" data-booking-turn-remove="'+index+'" aria-label="Remove range '+(index+1)+'" '+(turnDraft.serviceWeights.length===1?'disabled':'')+'>×</button></td></tr>';
    }).join('');
  }
  $('#booking-turn-settings').addEventListener('click',()=>{
    turnDraft=window.NEXORA_TURN_SETTINGS.load();renderTurnRanges();
    $('#booking-turn-form [name="bookingTurnCredit"]').value=turnDraft.bookingTurnCredit;$('[data-booking-turn-error]').textContent='';turnDialog.showModal();
  });
  document.querySelectorAll('[data-close-turn]').forEach(button=>button.addEventListener('click',()=>turnDialog.close()));
  $('[data-booking-incentive-policy]').addEventListener('click',()=>{turnDialog.close();$('#calendar-reward-settings').click();});
  $('#booking-turn-form').addEventListener('input',event=>{
    if(event.target.hasAttribute('data-booking-turn-weight'))turnDraft.serviceWeights[Number(event.target.dataset.bookingTurnWeight)]=window.NEXORA_TURN_SETTINGS.numberFrom(event.target);
    if(event.target.hasAttribute('data-booking-turn-up-to'))turnDraft.serviceThresholds[Number(event.target.dataset.bookingTurnUpTo)]=Math.round((window.NEXORA_TURN_SETTINGS.numberFrom(event.target)+0.01)*100)/100;
  });
  $('#booking-turn-form').addEventListener('change',event=>{if(event.target.hasAttribute('data-booking-turn-up-to'))renderTurnRanges();});
  $('#booking-turn-form').addEventListener('click',event=>{
    const remove=event.target.closest('[data-booking-turn-remove]');
    if(remove&&turnDraft.serviceWeights.length>1){const index=Number(remove.dataset.bookingTurnRemove);turnDraft.serviceWeights.splice(index,1);turnDraft.serviceThresholds.splice(Math.min(index,turnDraft.serviceThresholds.length-1),1);renderTurnRanges();}
    if(event.target.closest('[data-booking-turn-add]')){turnDraft.serviceThresholds.push(Math.round(((turnDraft.serviceThresholds.at(-1)||0)+40)*100)/100);turnDraft.serviceWeights.push(turnDraft.serviceWeights.at(-1));renderTurnRanges();}
  });
  $('#booking-turn-form').addEventListener('submit',event=>{event.preventDefault();const result=window.NEXORA_TURN_SETTINGS.save({...turnDraft,bookingTurnCredit:window.NEXORA_TURN_SETTINGS.numberFrom($('#booking-turn-form [name="bookingTurnCredit"]'))});if(result.ok)turnDialog.close();else $('[data-booking-turn-error]').textContent=result.error;});
  store.subscribe(render);restoreNavigation();
})();
