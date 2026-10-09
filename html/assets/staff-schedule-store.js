(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NEXORA_STAFF_SCHEDULE_STORE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  var SALON_ID = 'bitcoin-nail-bar-houston';
  var STORAGE_KEY = 'nexora:staff-schedule:v1';
  var EVENT_NAME = 'nexora:staff-schedule-change';
  var DAYS = ['sun','mon','tue','wed','thu','fri','sat'];
  var REQUEST_TYPES = ['day-off','change-hours','break','weekly-schedule','availability-today'];

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function defaultDay(day) { return {working: day !== 'sun', start: day === 'sun' ? '' : '09:00', end: day === 'sun' ? '' : '19:00', breaks: day === 'sun' ? [] : [{start:'13:00',end:'13:30'}]}; }
  function defaultStaff() { return {permission:'request',weekly:Object.fromEntries(DAYS.map(function(day){return [day,{working:false,start:'',end:'',breaks:[]}];})),exceptions:{}}; }
  function demoStaff() { return Object.assign(defaultStaff(),{weekly:Object.fromEntries(DAYS.map(function(day){return [day,defaultDay(day)];}))}); }
  function defaultState() { return {version:1,salons:{[SALON_ID]:{publishedAt:'',syncedAt:'',staff:{t1:demoStaff(),t2:demoStaff(),t3:demoStaff(),t4:demoStaff(),t5:demoStaff()}}},drafts:{},requests:[],audit:[]}; }
  function resolveStorage(target) { if (target) return target; try { return root && root.localStorage || null; } catch (_) { return null; } }
  function validTime(value) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || '')); }
  function normalizeBreak(item) { return {start:validTime(item && item.start)?item.start:'',end:validTime(item && item.end)?item.end:''}; }
  function normalizeDay(value, day) { value=value||{}; var working=value.working!==false && validTime(value.start) && validTime(value.end); return {working:working,start:working?value.start:'',end:working?value.end:'',breaks:working?(Array.isArray(value.breaks)?value.breaks.map(normalizeBreak):[]):[]}; }
  function normalizeStaff(value) {
    value=value||{};
    var weekly={};
    DAYS.forEach(function(day){weekly[day]=normalizeDay(value.weekly&&value.weekly[day]);});
    var permission=['none','request','same-day','self'].includes(value.permission)?value.permission:'request';
    return {
      permission:permission, weekly:weekly,
      exceptions:value.exceptions&&typeof value.exceptions==='object'?clone(value.exceptions):{},
      sameDayMode:['allowed','request','none'].includes(value.sameDayMode)?value.sameDayMode:(permission==='none'?'none':['self','same-day'].includes(permission)?'allowed':'request'),
      bookedDayMode:value.bookedDayMode==='block'?'block':'review',
      serviceIds:Array.isArray(value.serviceIds)?Array.from(new Set(value.serviceIds.map(String))):null,
      availableToday:value.availableToday&&typeof value.availableToday==='object'?clone(value.availableToday):{}
    };
  }
  function normalizeState(value) {
    var base=defaultState(); if(!value||typeof value!=='object') return base;
    var state={version:1,salons:{},drafts:{},requests:[],audit:[]};
    var salons=value.salons&&typeof value.salons==='object'?value.salons:{};
    Object.keys(Object.assign({},base.salons,salons)).forEach(function(salonId){var source=salons[salonId]||base.salons[salonId]||{};var staff={};Object.keys(source.staff||{}).forEach(function(id){staff[id]=normalizeStaff(source.staff[id]);});state.salons[salonId]={publishedAt:String(source.publishedAt||''),syncedAt:String(source.syncedAt||''),staff:staff,rules:normalizeRules(source.rules)};});
    Object.keys(value.drafts||{}).forEach(function(salonId){state.drafts[salonId]={};Object.keys(value.drafts[salonId]||{}).forEach(function(id){state.drafts[salonId][id]=normalizeStaff(value.drafts[salonId][id]);});});
    state.requests=(Array.isArray(value.requests)?value.requests:[]).filter(function(item){return item&&item.id&&item.salonId&&item.staffId&&REQUEST_TYPES.includes(item.type)&&/^\d{4}-\d{2}-\d{2}$/.test(item.date||'');}).map(function(item){return Object.assign({},item);});
    state.audit=Array.isArray(value.audit)?value.audit.slice(-200):[];
    return state;
  }
  function loadState(target) { var storage=resolveStorage(target); try{return normalizeState(JSON.parse(storage&&storage.getItem(STORAGE_KEY)||'null'));}catch(_){return defaultState();} }
  function emit(state) { try { if(root&&root.dispatchEvent&&root.CustomEvent) root.dispatchEvent(new root.CustomEvent(EVENT_NAME,{detail:{state:clone(state)}})); } catch(_){} }
  function persist(state,target) { var storage=resolveStorage(target); if(!storage)return {ok:false,error:{code:'storage-unavailable'}};try{storage.setItem(STORAGE_KEY,JSON.stringify(state));emit(state);return {ok:true,state:clone(state)};}catch(_){return {ok:false,error:{code:'storage-failed'}};} }
  function getStaffSchedule(salonId,staffId,options,target){var state=loadState(target);var salon=state.salons[salonId]||{staff:{}};var schedule=salon.staff[staffId]||defaultStaff();if(options&&options.includeDraft&&state.drafts[salonId]&&state.drafts[salonId][staffId])schedule=state.drafts[salonId][staffId];return clone(normalizeStaff(schedule));}
  function saveDraft(salonId,staffId,patch,target){var state=loadState(target);state.drafts[salonId]=state.drafts[salonId]||{};var current=getStaffSchedule(salonId,staffId,{includeDraft:true},target);state.drafts[salonId][staffId]=normalizeStaff(Object.assign(current,patch||{}));return persist(state,target);}
  function discardDraft(salonId,staffId,target){var state=loadState(target);if(state.drafts[salonId]){delete state.drafts[salonId][staffId];if(!Object.keys(state.drafts[salonId]).length)delete state.drafts[salonId];}return persist(state,target);}
  function minutes(value){var p=String(value).split(':').map(Number);return p[0]*60+p[1];}
  function validateDay(day,key,errors){if(!day.working)return;if(!validTime(day.start)||!validTime(day.end)||minutes(day.end)<=minutes(day.start)){errors.push({code:'invalid-shift',day:key});return;}var sorted=(day.breaks||[]).map(function(item,index){return {start:item.start,end:item.end,index:index};}).sort(function(a,b){return minutes(a.start)-minutes(b.start);});sorted.forEach(function(item,index){if(!validTime(item.start)||!validTime(item.end)||minutes(item.start)<minutes(day.start)||minutes(item.end)>minutes(day.end)||minutes(item.end)<=minutes(item.start))errors.push({code:'break-outside-shift',day:key,index:item.index});else if(index&&minutes(item.start)<minutes(sorted[index-1].end))errors.push({code:'break-overlap',day:key,index:item.index});});}
  function validateSchedule(schedule){var errors=[];DAYS.forEach(function(day){if(schedule.weekly&&schedule.weekly[day])validateDay(schedule.weekly[day],day,errors);});Object.keys(schedule.exceptions||{}).forEach(function(date){var item=schedule.exceptions[date];if(item.type!=='day-off')validateDay(normalizeDay(Object.assign({working:true},item)),date,errors);});return {ok:errors.length===0,errors:errors};}
  function dateParts(dateKey){return new Date(dateKey+'T12:00:00');}
  function scheduleForDate(schedule,dateKey){var exception=schedule.exceptions&&schedule.exceptions[dateKey];if(exception){if(exception.type==='day-off')return {working:false,start:'',end:'',breaks:[],source:'exception'};return Object.assign(normalizeDay(Object.assign({working:true},exception)),{source:'exception'});}var day=DAYS[dateParts(dateKey).getDay()];return Object.assign(normalizeDay(schedule.weekly&&schedule.weekly[day],day),{source:'weekly'});}
  function appointmentLanes(row){if(Array.isArray(row.tickets)&&row.tickets.length)return row.tickets.map(function(ticket){return {technicianId:ticket.technicianId,serviceId:ticket.serviceId,startAt:ticket.startAt||row.startAt,endAt:ticket.endAt||row.endAt};});return [{technicianId:row.technicianId,serviceId:(row.serviceIds||[])[0],startAt:row.startAt,endAt:row.endAt}];}
  function activeAppointment(row){return !['cancelled','no-show','completed'].includes(row.status);}
  function laneFits(lane,day){if(!day.working)return false;var start=lane.startAt.slice(11,16),end=lane.endAt.slice(11,16);if(start<day.start||end>day.end)return false;return !(day.breaks||[]).some(function(item){return start<item.end&&end>item.start;});}
  function findBookingImpacts(staffId,schedule,appointments,suppliedRules) {
    var seen={},rules=suppliedRules||salonRules(SALON_ID);
    return (appointments||[]).filter(activeAppointment).flatMap(function(row){
      return appointmentLanes(row).filter(function(lane){
        if(!lane.startAt||!lane.endAt||lane.technicianId!==staffId)return false;
        var date=lane.startAt.slice(0,10);
        return !laneFits(lane,scheduleForDate(schedule,date))||!laneFits(lane,businessDay(date,rules))||
          (schedule.availableToday&&schedule.availableToday[date]===false)||
          (Array.isArray(schedule.serviceIds)&&lane.serviceId&&!schedule.serviceIds.includes(lane.serviceId));
      }).map(function(lane){return {appointmentId:row.id,customerName:row.customerName||'Guest',startAt:lane.startAt,endAt:lane.endAt,reason:Array.isArray(schedule.serviceIds)&&lane.serviceId&&!schedule.serviceIds.includes(lane.serviceId)?'service-not-approved':'outside-availability'};});
    }).filter(function(item){if(seen[item.appointmentId])return false;seen[item.appointmentId]=true;return true;});
  }
  function overlaps(start,end,rangeStart,rangeEnd){return start<rangeEnd&&end>rangeStart;}
  function availabilityForDay(input) {
    var date=input.date, schedule=input.staffSchedule, day=scheduleForDate(schedule,date);
    var rules=input.rules||salonRules(input.salonId||SALON_ID), open=businessDay(date,rules);
    var service=input.service, person=input.technician;
    var serviceCatalog=input.catalog||(root.NEXORA_SALON_DATA&&root.NEXORA_SALON_DATA.loadCatalog());
    var eligible=!service||isEligible(person,service,schedule);
    var start=day.working&&open.working?(day.start>open.start?day.start:open.start):'';
    var end=day.working&&open.working?(day.end<open.end?day.end:open.end):'';
    var working=!!start&&start<end;
    var available=working&&!(schedule.availableToday&&schedule.availableToday[date]===false);
    var rows=(input.appointments||[]).filter(activeAppointment), relevant=[];
    rows.forEach(function(row){appointmentLanes(row).forEach(function(lane){
      if(lane.technicianId===input.technicianId&&lane.startAt&&lane.endAt&&lane.startAt.slice(0,10)===date)relevant.push(Object.assign({appointmentId:row.id},lane));
    });});
    var slots=[], step=Number(input.slotIncrementMin)||Number(rules.slotIncrementMin)||30;
    var duration=Number(service&&service.durationMin)||Number(input.durationMin)||Number(input.slotMinutes)||30;
    var before=Math.max(0,Number(service&&service.bufferBeforeMin)||0), after=Math.max(0,Number(service&&service.bufferAfterMin)||0);
    var clock=input.ignorePast?null:salonClock(rules.timezone);
    if(available&&eligible&&(!person||person.active!==false)) {
      for(var at=Math.ceil((minutes(start)+before)/step)*step;at+duration+after<=minutes(end);at+=step) {
        if(clock&&(date<clock.date||(date===clock.date&&at<clock.minutes)))continue;
        var serviceStart=minuteTime(at), serviceEnd=minuteTime(at+duration), occupiedStart=minuteTime(at-before), occupiedEnd=minuteTime(at+duration+after);
        var blocked=(day.breaks||[]).some(function(b){return overlaps(occupiedStart,occupiedEnd,b.start,b.end);})||relevant.some(function(a){
          var bookedService=serviceCatalog&&(serviceCatalog.services||[]).find(function(item){return item.id===a.serviceId;});
          var bookedBefore=Math.max(0,Number(bookedService&&bookedService.bufferBeforeMin)||0),bookedAfter=Math.max(0,Number(bookedService&&bookedService.bufferAfterMin)||0);
          var bookingStart=minutes(a.startAt.slice(11,16))-bookedBefore,bookingEnd=minutes(a.endAt.slice(11,16))+bookedAfter;
          return at-before<bookingEnd&&at+duration+after>bookingStart;
        });
        if(!blocked)slots.push({time:serviceStart,startAt:date+'T'+serviceStart+':00',endAt:date+'T'+serviceEnd+':00'});
      }
    }
    return {date:date,working:working,available:available,eligible:eligible,start:start,end:end,breaks:day.breaks,appointments:relevant,openSlots:slots,closed:!open.working,source:day.source,conflicts:findBookingImpacts(input.technicianId,schedule,rows)};
  }
  function changeImpacts(staffId,before,after,appointments,target) {
    var prior=new Set(findBookingImpacts(staffId,before,appointments).map(function(item){return item.appointmentId;}));
    return findBookingImpacts(staffId,after,appointments).filter(function(item){return !prior.has(item.appointmentId)&&item.startAt.slice(0,10)>=salonToday(SALON_ID,target);});
  }
  function publishDraft(salonId,staffId,appointments,resolved,target,now) {
    var state=loadState(target),draft=state.drafts[salonId]&&state.drafts[salonId][staffId];
    if(!draft)return {ok:false,error:{code:'draft-missing'}};
    var valid=validateSchedule(draft);
    if(!valid.ok)return {ok:false,error:{code:'invalid-schedule',details:valid.errors}};
    var current=getStaffSchedule(salonId,staffId,{},target);
    var impacts=changeImpacts(staffId,current,draft,appointments,target);
    if(impacts.length)return {ok:false,error:{code:'booking-impact',impacts:impacts}};
    state.salons[salonId]=state.salons[salonId]||{staff:{}};
    auditEvent(state,salonId,staffId,'Schedule published','Manager',current,draft,now);
    state.salons[salonId].staff[staffId]=draft;
    state.salons[salonId].publishedAt=now||new Date().toISOString();
    state.salons[salonId].syncedAt=state.salons[salonId].publishedAt;
    delete state.drafts[salonId][staffId];
    if(!Object.keys(state.drafts[salonId]).length)delete state.drafts[salonId];
    return persist(state,target);
  }
  function requestId(now){return 'schedule-request-'+String(now||Date.now())+'-'+Math.random().toString(36).slice(2,7);}
  function validRequest(input){
    if(!input||!input.salonId||!input.staffId||!REQUEST_TYPES.includes(input.type)||!/^\d{4}-\d{2}-\d{2}$/.test(input.date||''))return false;
    if(dateParts(input.date).getFullYear()+'-'+String(dateParts(input.date).getMonth()+1).padStart(2,'0')+'-'+String(dateParts(input.date).getDate()).padStart(2,'0')!==input.date)return false;
    if(input.type==='weekly-schedule')return !!input.weekly&&DAYS.every(function(day){return input.weekly[day]&&typeof input.weekly[day].working==='boolean';})&&validateSchedule({weekly:input.weekly}).ok;
    if(input.type==='availability-today')return typeof input.available==='boolean';
    if(input.type==='day-off')return true;
    return validTime(input.start)&&validTime(input.end)&&minutes(input.end)>minutes(input.start);
  }
  function createRequest(input,target,now){input=input||{};if(!validRequest(input))return {ok:false,error:{code:'invalid-request'}};var state=loadState(target),schedule=getStaffSchedule(input.salonId,input.staffId,{},target);if((input.type==='availability-today'&&schedule.sameDayMode==='none')||(input.type!=='availability-today'&&schedule.permission==='none'))return {ok:false,error:{code:'request-not-allowed'}};var proposed=requestSchedule(input,schedule);if(input.type!=='availability-today'&&!validateSchedule(proposed).ok)return {ok:false,error:{code:'invalid-schedule'}};if(input.type==='break'){var shift=scheduleForDate(schedule,input.date);if(!shift.working||input.start<shift.start||input.end>shift.end)return {ok:false,error:{code:'break-outside-shift'}};}if(state.requests.some(function(row){return row.salonId===input.salonId&&row.staffId===input.staffId&&row.date===input.date&&['pending','adjusted','blocked'].includes(row.status)&&(row.type!=='availability-today'||input.type==='availability-today');}))return {ok:false,error:{code:'duplicate-request'}};var item={id:requestId(now),salonId:input.salonId,staffId:input.staffId,type:input.type,date:input.date,reason:String(input.reason||'').trim(),start:input.start||'',end:input.end||'',status:'pending',createdAt:now||new Date().toISOString(),bookingImpactIds:[]};if(input.type==='weekly-schedule')item.weekly=clone(input.weekly);if(input.type==='availability-today')item.available=input.available;auditEvent(state,input.salonId,input.staffId,'Request submitted','Staff',null,item,now);state.requests.push(item);var result=persist(state,target);return result.ok?{ok:true,request:clone(item)}:result;}
  function requestSchedule(request,current){var next=clone(current);if(request.type==='availability-today'){next.availableToday=next.availableToday||{};next.availableToday[request.date]=request.available;return next;}if(request.type==='weekly-schedule'){next.weekly=clone(request.weekly);return next;}if(request.type==='day-off')next.exceptions[request.date]={type:'day-off',start:'',end:'',breaks:[]};else if(request.type==='change-hours'){var currentDay=scheduleForDate(next,request.date);var kept=(currentDay.breaks||[]).filter(function(item){return item.start>=request.start&&item.end<=request.end;});next.exceptions[request.date]={type:'custom-hours',start:request.start,end:request.end,breaks:kept};}else {var day=scheduleForDate(next,request.date);next.exceptions[request.date]={type:'custom-hours',start:day.start,end:day.end,breaks:(day.breaks||[]).concat([{start:request.start,end:request.end}])};}return next;}
  function reviewRequest(id,decision,appointments,target,now,rejectionReason){var state=loadState(target),item=state.requests.find(function(row){return row.id===id;});if(!item||!['pending','adjusted','blocked'].includes(item.status))return {ok:false,error:{code:'request-unavailable'}};if(decision==='reject'){var reason=String(rejectionReason||'').trim();if(!reason||reason.length>500)return {ok:false,error:{code:'rejection-reason-required'}};auditEvent(state,item.salonId,item.staffId,'Request rejected','Manager',null,Object.assign({},item,{rejectionReason:reason}),now);item.rejectionReason=reason;item.status='rejected';item.reviewedAt=now||new Date().toISOString();item.bookingImpactIds=[];var rejected=persist(state,target);return rejected.ok?{ok:true,request:clone(item)}:rejected;}if(item.type==='availability-today'&&item.date!==salonToday(item.salonId,target))return {ok:false,error:{code:'request-expired'}};var current=getStaffSchedule(item.salonId,item.staffId,{},target);if(item.type==='availability-today'&&item.available&&!scheduleForDate(current,item.date).working)return {ok:false,error:{code:'no-shift'}};var next=requestSchedule(item,current),valid=validateSchedule(next);if(!valid.ok)return {ok:false,error:{code:'invalid-schedule',details:valid.errors}};var impacts=changeImpacts(item.staffId,current,next,appointments||[],target);if(impacts.length){item.status='blocked';item.reviewedAt=now||new Date().toISOString();item.bookingImpactIds=impacts.map(function(impact){return impact.appointmentId;});var blocked=persist(state,target);if(!blocked.ok)return blocked;return {ok:false,error:{code:'booking-impact',impacts:impacts},request:clone(item)};}state.salons[item.salonId]=state.salons[item.salonId]||{staff:{}};auditEvent(state,item.salonId,item.staffId,'Request approved','Manager',current,next,now);state.salons[item.salonId].staff[item.staffId]=next;state.salons[item.salonId].publishedAt=now||new Date().toISOString();state.salons[item.salonId].syncedAt=state.salons[item.salonId].publishedAt;item.status='applied';item.reviewedAt=state.salons[item.salonId].publishedAt;item.bookingImpactIds=[];var approved=persist(state,target);return approved.ok?{ok:true,request:clone(item)}:approved;}
  function adjustRequest(id,patch,reviewedBy,target,now){var state=loadState(target),item=state.requests.find(function(row){return row.id===id;});if(!item||!['pending','adjusted','blocked'].includes(item.status))return {ok:false,error:{code:'request-unavailable'}};var proposed=Object.assign({},item,patch||{});if(!validRequest(proposed))return {ok:false,error:{code:'invalid-request'}};item.date=proposed.date;item.start=proposed.start||'';item.end=proposed.end||'';item.reason=String(proposed.reason||'').trim();item.status='adjusted';item.adjustedBy=reviewedBy||'manager';item.adjustedAt=now||new Date().toISOString();item.bookingImpactIds=[];var result=persist(state,target);return result.ok?{ok:true,request:clone(item)}:result;}
  function cancelRequest(id,staffId,target,now){var state=loadState(target),item=state.requests.find(function(row){return row.id===id&&row.staffId===staffId;});if(!item||!['pending','adjusted','blocked'].includes(item.status))return {ok:false,error:{code:'request-unavailable'}};auditEvent(state,item.salonId,item.staffId,'Request cancelled','Staff',null,item,now);item.status='cancelled';item.reviewedAt=now||new Date().toISOString();var result=persist(state,target);return result.ok?{ok:true,request:clone(item)}:result;}
  function minuteTime(value){return String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');}
  function normalizeRules(value){
    value=value||{};
    var timezone=value.timezone||'America/Chicago';
    try{new Intl.DateTimeFormat('en-US',{timeZone:timezone});}catch(_){timezone='America/Chicago';}
    var hours={};
    DAYS.forEach(function(day){hours[day]=normalizeDay(value.businessHours&&value.businessHours[day]||{working:true,start:day==='sun'?'10:00':'07:00',end:day==='sun'?'18:00':'21:00',breaks:[]});});
    return {timezone:timezone,businessHours:hours,slotIncrementMin:[15,30,60].includes(Number(value.slotIncrementMin))?Number(value.slotIncrementMin):30,coverageMinimums:value.coverageMinimums||{Pedicure:3,Manicure:2,Gel:2,Acrylic:1,Dip:1,Waxing:1}};
  }
  function salonRules(salonId,target){return normalizeRules((loadState(target).salons[salonId]||{}).rules);}
  function salonClock(timezone){
    var parts=new Intl.DateTimeFormat('en-US',{timeZone:timezone||'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
    var fields=Object.fromEntries(parts.map(function(part){return [part.type,part.value];}));
    return {date:fields.year+'-'+fields.month+'-'+fields.day,minutes:Number(fields.hour)*60+Number(fields.minute)};
  }
  function salonToday(salonId,target){return salonClock(salonRules(salonId||SALON_ID,target).timezone).date;}
  function parseClock(value){
    if(validTime(value))return value;
    var match=String(value||'').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    return match?minuteTime((Number(match[1])%12+(match[3].toUpperCase()==='PM'?12:0))*60+Number(match[2])):'';
  }
  function businessDay(date,rules){
    var day=clone(rules.businessHours[DAYS[dateParts(date).getDay()]]||{working:false,start:'',end:'',breaks:[]});
    try {
      var closures=JSON.parse(root.localStorage.getItem('nexora:holiday-closures:v2:'+SALON_ID)||'[]');
      var closure=closures.find(function(item){return item.date===date;});
      if(closure)day=closure.status==='closed'?{working:false,start:'',end:'',breaks:[]}:{working:true,start:parseClock(closure.open),end:parseClock(closure.close),breaks:[]};
    }catch(_){}
    return day;
  }
  function isEligible(person,service,schedule){
    if(!person||person.active===false||!service||service.active===false)return false;
    if(Array.isArray(schedule&&schedule.serviceIds))return schedule.serviceIds.includes(service.id);
    if(service.requiredSkill)return (person.skills||[]).includes(service.requiredSkill);
    return (person.services||[]).some(function(name){return [service.id,service.name].concat(service.aliases||[]).includes(name);});
  }
  function auditEvent(state,salonId,staffId,action,actor,before,after,now){
    state.audit=state.audit||[];
    state.audit.push({id:requestId(),salonId:salonId,staffId:staffId,action:action,actor:actor,occurredAt:now||new Date().toISOString(),before:before?clone(before):null,after:after?clone(after):null});
    state.audit=state.audit.slice(-200);
  }
  function saveRules(salonId,rules,target,appointments){
    var normalized=normalizeRules(rules),valid=validateSchedule({weekly:rules.businessHours});
    if(!valid.ok)return {ok:false,error:{code:'invalid-schedule'}};
    if(Object.values(normalized.coverageMinimums).some(function(value){return !Number.isInteger(Number(value))||Number(value)<0;}))return {ok:false,error:{code:'invalid-coverage'}};
    var state=loadState(target);state.salons[salonId]=state.salons[salonId]||{staff:{}};
    var oldRules=salonRules(salonId,target),today=salonToday(salonId,target);
    var impacts=Object.keys(state.salons[salonId].staff).flatMap(function(staffId){
      var schedule=getStaffSchedule(salonId,staffId,{},target);
      var existing=new Set(findBookingImpacts(staffId,schedule,appointments||[],oldRules).map(function(item){return item.appointmentId;}));
      return findBookingImpacts(staffId,schedule,appointments||[],normalized).filter(function(item){return item.startAt.slice(0,10)>=today&&!existing.has(item.appointmentId);});
    });
    if(impacts.length)return {ok:false,error:{code:'booking-impact',impacts:impacts}};
    auditEvent(state,salonId,'','Booking & coverage rules updated','Manager',state.salons[salonId].rules||null,normalized);
    state.salons[salonId].rules=normalized;
    return persist(state,target);
  }
  function toggleToday(salonId,staffId,appointments,target){
    var schedule=getStaffSchedule(salonId,staffId,{},target),date=salonToday(salonId,target),day=scheduleForDate(schedule,date);
    if(schedule.sameDayMode==='none')return {ok:false,error:{code:'request-not-allowed'}};
    if(!day.working||!businessDay(date,salonRules(salonId,target)).working)return {ok:false,error:{code:'no-shift'}};
    var available=schedule.availableToday[date]===false;
    var proposed=requestSchedule({type:'availability-today',date:date,available:available},schedule);
    var impacts=findBookingImpacts(staffId,proposed,appointments||[]).filter(function(item){return item.startAt.slice(0,10)===date;});
    if(impacts.length&&schedule.bookedDayMode==='block')return {ok:false,error:{code:'booking-impact',impacts:impacts}};
    var result=createRequest({salonId:salonId,staffId:staffId,type:'availability-today',date:date,available:available,reason:available?'Turn on new bookings today':'Turn off new bookings today'},target);
    if(!result.ok)return result;
    if(schedule.sameDayMode==='allowed'&&!impacts.length)return reviewRequest(result.request.id,'approve',appointments,target);
    return result;
  }
  function saveStaffSetup(salonId,staffId,schedule,catalog,appointments,target) {
    var storage=resolveStorage(target),catalogApi=root.NEXORA_SALON_DATA;
    if(!storage||!catalogApi)return {ok:false,error:{code:'storage-unavailable'}};
    var valid=validateSchedule(schedule);
    if(!valid.ok)return {ok:false,error:{code:'invalid-schedule',details:valid.errors}};
    var current=getStaffSchedule(salonId,staffId,{},target);
    var impacts=changeImpacts(staffId,current,schedule,appointments||[],target);
    if(impacts.length)return {ok:false,error:{code:'booking-impact',impacts:impacts}};
    var state=loadState(target),normalized=normalizeStaff(schedule);
    state.salons[salonId]=state.salons[salonId]||{staff:{}};
    auditEvent(state,salonId,staffId,'Staff setup saved','Manager',current,normalized);
    state.salons[salonId].staff[staffId]=normalized;
    state.salons[salonId].publishedAt=new Date().toISOString();
    state.salons[salonId].syncedAt=state.salons[salonId].publishedAt;
    var previousCatalog,previousSchedules,backupsRead=false;
    try {
      previousCatalog=storage.getItem(catalogApi.STORAGE_KEY);
      previousSchedules=storage.getItem(STORAGE_KEY);
      backupsRead=true;
      storage.setItem(catalogApi.STORAGE_KEY,JSON.stringify(catalogApi.normalizeCatalog(catalog)));
      storage.setItem(STORAGE_KEY,JSON.stringify(state));
    }catch(_) {
      try {
        if(!backupsRead)return {ok:false,error:{code:'storage-failed'}};
        if(previousCatalog==null)storage.removeItem(catalogApi.STORAGE_KEY);else storage.setItem(catalogApi.STORAGE_KEY,previousCatalog);
        if(previousSchedules==null)storage.removeItem(STORAGE_KEY);else storage.setItem(STORAGE_KEY,previousSchedules);
      }catch(_){}
      return {ok:false,error:{code:'storage-failed'}};
    }
    emit(state);
    return {ok:true,state:clone(state)};
  }
  function subscribe(listener,targetWindow){var win=targetWindow||root;if(!win||!win.addEventListener)return function(){};function storageHandler(event){if(event.key===STORAGE_KEY)listener(loadState(win.localStorage));}function localHandler(event){listener(event.detail&&event.detail.state||loadState(win.localStorage));}win.addEventListener('storage',storageHandler);win.addEventListener(EVENT_NAME,localHandler);return function(){win.removeEventListener('storage',storageHandler);win.removeEventListener(EVENT_NAME,localHandler);};}
  return {SALON_ID:SALON_ID,STORAGE_KEY:STORAGE_KEY,EVENT_NAME:EVENT_NAME,DEFAULT_STATE:defaultState(),loadState:loadState,getStaffSchedule:getStaffSchedule,saveDraft:saveDraft,discardDraft:discardDraft,validateSchedule:validateSchedule,scheduleForDate:scheduleForDate,appointmentLanes:appointmentLanes,findBookingImpacts:findBookingImpacts,availabilityForDay:availabilityForDay,publishDraft:publishDraft,createRequest:createRequest,reviewRequest:reviewRequest,adjustRequest:adjustRequest,cancelRequest:cancelRequest,subscribe:subscribe,salonRules:salonRules,salonToday:salonToday,salonClock:salonClock,businessDay:businessDay,isEligible:isEligible,saveRules:saveRules,toggleToday:toggleToday,saveStaffSetup:saveStaffSetup,changeImpacts:changeImpacts,requestSchedule:requestSchedule};
});
