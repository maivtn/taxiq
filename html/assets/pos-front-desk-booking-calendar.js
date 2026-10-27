/* Booking calendar presentation; the existing calendar still owns reward settings. */
(function () {
  'use strict';
  window.NEXORA_BOOKING_CALENDAR = {
    enhance(host) {
      if(host.bookingCalendar){host.bookingCalendar.refresh();return;}
      const shadow=host.shadowRoot;if(!shadow)return;
      const legacy=shadow.querySelector('.page-content');legacy.classList.add('booking-legacy-content');
      const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('../assets/pos-front-desk-booking-calendar.css',location.href).href;shadow.appendChild(style);
      const surface=document.createElement('section');surface.className='booking-live-calendar';surface.setAttribute('aria-label','Team Calendar');legacy.before(surface);
      const store=window.NEXORA_APPOINTMENTS_STORE,catalog=window.NEXORA_SALON_DATA.loadCatalog();
      const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const dayKey=date=>date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
      const today=()=>window.NEXORA_STAFF_SCHEDULE_STORE?.salonToday(window.NEXORA_STAFF_SCHEDULE_STORE.SALON_ID)||dayKey(new Date());
      const dateLabel=date=>date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
      const state={date:new Date(today()+'T12:00:00'),view:'day',status:'all',scope:'working'};
      const views={day:'Day',week:'Week',twoWeeks:'2 Weeks',threeWeeks:'3 Weeks',month:'Month'};
      const startHour=1,slotCount=92;
      const statusOf=row=>row.status==='completed'?'completed':row.status==='cancelled'||row.status==='no-show'?'cancelled':row.status==='pending'?'pending':'upcoming';
      function range(){
        if(state.view==='day')return [new Date(state.date)];
        const first=new Date(state.date);if(state.view==='month')first.setDate(1);first.setDate(first.getDate()-first.getDay());
        return Array.from({length:{week:7,twoWeeks:14,threeWeeks:21,month:42}[state.view]},(_,index)=>{const date=new Date(first);date.setDate(date.getDate()+index);return date;});
      }
      function rowsFor(date){return store.loadAll().filter(row=>row.startAt.slice(0,10)===dayKey(date));}
      function rangeRows(){const dates=range().map(dayKey);return store.loadAll().filter(row=>dates.includes(row.startAt.slice(0,10)));}
      function summary(rows){
        const counts={all:rows.length,completed:0,upcoming:0,pending:0,cancelled:0};rows.forEach(row=>counts[statusOf(row)]++);
        const labels={all:'Appointments',completed:'Completed',upcoming:'Upcoming',pending:'Pending',cancelled:'Cancelled'},icons={all:'↗',completed:'✓',upcoming:'→',pending:'…',cancelled:'×'};
        return '<div class="pb-summary" role="group" aria-label="Appointment status summary">'+Object.entries(labels).map(([key,label])=>'<button type="button" class="pb-summary-card '+key+(state.status===key?' selected':'')+'" data-pb-status="'+key+'" aria-pressed="'+(state.status===key)+'"><strong>'+counts[key]+'</strong><span>'+label+'</span>'+(key==='all'?'<small>New vs last '+state.date.toLocaleDateString('en-US',{weekday:'long'})+'</small>':'')+'<i aria-hidden="true">'+icons[key]+'</i></button>').join('')+'</div>';
      }
      function dayGrid(){
        const schedule=window.NEXORA_STAFF_SCHEDULE_STORE;
        const techs=catalog.technicians.filter(tech=>tech.active!==false).map(tech=>({...tech,working:schedule?schedule.availabilityForDay({salonId:catalog.salon.id,technicianId:tech.id,date:dayKey(state.date),staffSchedule:schedule.getStaffSchedule(catalog.salon.id,tech.id,{})}).working:true})).filter(tech=>state.scope==='all'||tech.working);
        const columns=[...techs,{id:'unassigned',name:'Unassigned'}],items=rowsFor(state.date).filter(row=>state.status==='all'||statusOf(row)===state.status);
        const header=columns.map((tech,index)=>'<div class="pb-technician" style="grid-column:'+(index+2)+';grid-row:1">'+(tech.id==='unassigned'?'<strong>Unassigned</strong>':'<span class="pb-avatar">'+esc(tech.name.split(/\s+/).map(part=>part[0]).join('').slice(0,2))+'</span><div><strong>'+esc(tech.name)+'</strong><small><i></i>'+(tech.working?'Working today':'Not working today')+'</small></div>')+'</div>').join('');
        const slots=Array.from({length:slotCount},(_,slot)=>{
          const hour=startHour+Math.floor(slot/4),label=slot%4===0?(hour>12?hour-12:hour)+' '+(hour>=12?'PM':'AM'):slot%4===2?':30':'';
          return '<div class="pb-time" style="grid-column:1;grid-row:'+(slot+2)+'">'+label+'</div>'+columns.map((tech,index)=>'<button type="button" class="pb-slot" data-pb-slot="'+slot+'" data-pb-technician="'+esc(tech.id)+'" style="grid-column:'+(index+2)+';grid-row:'+(slot+2)+'" aria-label="'+esc(dateLabel(state.date)+' · '+tech.name+' · '+String(hour).padStart(2,'0')+':'+String(slot%4*15).padStart(2,'0'))+'"><span aria-hidden="true">+</span></button>').join('');
        }).join('');
        const appointments=items.flatMap(row=>{
          const ticketTechs=[...new Set((row.tickets||[]).map(ticket=>ticket.technicianId).filter(Boolean))],ids=row.technicianId?[row.technicianId]:ticketTechs.length?ticketTechs:['unassigned'];
          return ids.map(id=>{
            const column=columns.findIndex(tech=>tech.id===id);if(column<0)return '';
            const [hour,minute]=row.startAt.slice(11,16).split(':').map(Number),offset=(hour-startHour)*4+Math.floor(minute/15),end=offset+Math.max(1,Math.ceil((Number(row.durationMin)||30)/15));
            if(offset>=slotCount||end<=0)return '';
            return '<button type="button" class="pb-appointment '+statusOf(row)+'" data-pb-record="'+esc(row.id)+'" style="grid-column:'+(column+2)+';grid-row:'+(Math.max(0,offset)+2)+' / '+(Math.min(slotCount,end)+2)+'"><strong>'+esc(row.customerName)+'</strong><span>'+esc((row.serviceNames||[]).join(', '))+'</span><small>'+esc(row.durationMin)+' min · '+esc(row.status==='confirmed'?'Confirmed':row.status==='checked-in'?'Checked In':row.status==='completed'?'Completed':row.status==='cancelled'?'Cancelled':'Pending')+'</small></button>';
          });
        }).join('');
        return '<div class="pb-scope-row"><select data-pb-scope aria-label="Technician scope"><option value="working" '+(state.scope==='working'?'selected':'')+'>Working today</option><option value="all" '+(state.scope==='all'?'selected':'')+'>All technicians</option></select><div class="pb-legend" aria-label="Booking status legend">'+['Completed','Upcoming','Pending','Cancelled'].map(label=>'<span class="'+label.toLowerCase()+'"><i></i>'+label+'</span>').join('')+'</div></div><div class="pb-grid-scroll"><div class="pb-grid" style="--pb-columns:'+columns.length+'"><div class="pb-corner"></div>'+header+slots+appointments+'</div></div>';
      }
      function overviewGrid(){
        return '<div class="pb-overview"><div class="pb-weekdays">'+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=>'<span>'+day+'</span>').join('')+'</div><div class="pb-days">'+range().map(date=>{
          const rows=rowsFor(date).filter(row=>state.status==='all'||statusOf(row)===state.status);
          return '<button type="button" class="pb-day" data-pb-date="'+dayKey(date)+'" aria-label="'+dateLabel(date)+'"><strong>'+date.getDate()+'</strong><span>'+rows.length+' bookings</span>'+rows.slice(0,3).map(row=>'<small class="'+statusOf(row)+'">'+esc(row.startAt.slice(11,16)+' '+row.customerName)+'</small>').join('')+'</button>';
        }).join('')+'</div></div>';
      }
      function render(){
        const dates=range(),rows=rangeRows(),label=state.view==='day'?dateLabel(state.date):dateLabel(dates[0])+' – '+dateLabel(dates.at(-1));
        surface.innerHTML='<div class="pb-datebar"><div class="pb-date-controls"><button type="button" data-pb-shift="-1" aria-label="Previous">‹</button><button type="button" data-pb-today>Today</button><button type="button" data-pb-shift="1" aria-label="Next">›</button></div><strong>'+label+'</strong><div class="pb-view-switch" role="group" aria-label="Calendar view">'+Object.entries(views).map(([key,label])=>'<button type="button" data-pb-view="'+key+'" class="'+(state.view===key?'selected':'')+'" aria-pressed="'+(state.view===key)+'">'+label+'</button>').join('')+'</div></div>'+summary(rows)+(state.view==='day'?dayGrid():overviewGrid());
        host.dispatchEvent(new CustomEvent('booking-calendar-date-change',{detail:{date:dayKey(state.date),count:rows.length}}));
      }
      function restore(){const requested=new URLSearchParams(location.search).get('calendarView');state.view=Object.hasOwn(views,requested)?requested:'day';render();}
      surface.addEventListener('click',event=>{
        const record=event.target.closest('[data-pb-record]');if(record){host.dispatchEvent(new CustomEvent('booking-open-record',{detail:{id:record.dataset.pbRecord}}));return;}
        const slot=event.target.closest('[data-pb-slot]');if(slot){host.dispatchEvent(new CustomEvent('booking-new-slot',{detail:{date:dayKey(state.date),time:String(startHour+Math.floor(Number(slot.dataset.pbSlot)/4)).padStart(2,'0')+':'+String(Number(slot.dataset.pbSlot)%4*15).padStart(2,'0'),technicianId:slot.dataset.pbTechnician==='unassigned'?'':slot.dataset.pbTechnician}}));return;}
        const status=event.target.closest('[data-pb-status]');if(status)state.status=status.dataset.pbStatus;
        const view=event.target.closest('[data-pb-view]');if(view){state.view=view.dataset.pbView;state.status='all';host.dispatchEvent(new CustomEvent('calendar-view-change',{detail:{view:state.view}}));}
        const shift=event.target.closest('[data-pb-shift]');if(shift){const direction=Number(shift.dataset.pbShift);if(state.view==='month'){state.date.setDate(1);state.date.setMonth(state.date.getMonth()+direction);}else state.date.setDate(state.date.getDate()+direction*({day:1,week:7,twoWeeks:14,threeWeeks:21}[state.view]));}
        if(event.target.closest('[data-pb-today]'))state.date=new Date(today()+'T12:00:00');
        const day=event.target.closest('[data-pb-date]');if(day){state.date=new Date(day.dataset.pbDate+'T12:00:00');state.view='day';host.dispatchEvent(new CustomEvent('calendar-view-change',{detail:{view:'day'}}));}
        render();
      });
      surface.addEventListener('change',event=>{if(event.target.matches('[data-pb-scope]')){state.scope=event.target.value;render();}});
      const policy=shadow.querySelector('#reward-settings-drawer');
      new MutationObserver(()=>{if(policy.getAttribute('aria-hidden')==='true')host.dispatchEvent(new Event('booking-policy-closed'));}).observe(policy,{attributes:true,attributeFilter:['aria-hidden']});
      shadow.addEventListener('keydown',event=>{if(event.key==='Escape'&&policy.getAttribute('aria-hidden')==='false')policy.querySelector('.close-policy')?.click();});
      host.bookingCalendar={refresh:restore};restore();
    }
  };
})();
