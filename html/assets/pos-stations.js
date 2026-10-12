(function () {
  'use strict';
  const key='nexora:pos-stations:v1', demo=window.NEXORA_POS_DEMO, esc=demo.esc;
  const kinds={pedi:{label:'Spa chairs',prefix:'P',minutes:10},mani:{label:'Nail tables',prefix:'A',minutes:5},room:{label:'Private rooms',prefix:'R',minutes:8}};
  const labels={free:'Free',held:'Held',occupied:'In service',cleaning:'Cleaning',blocked:'Blocked'};
  const checklist=['Drain & disinfect basin','Wipe chair and surfaces','Replace liner','Prepare sealed tools'];
  const ticketKey=t=>String(t.bookingId || t.id);
  const minutes=value=>Math.max(0,Math.floor((Date.now()-new Date(value).getTime())/60000));
  function seed() {
    const now=new Date().toISOString(),data={settings:{counts:{pedi:6,mani:6,room:2},mode:'auto',cleaner:'tech',checklist:true,cleanMin:{pedi:10,mani:5,room:8},holdMin:15,allowOverride:true,beep:true,neighbors:true},stations:[],log:[],events:[]};
    Object.entries(data.settings.counts).forEach(([kind,count])=>{for(let n=1;n<=count;n++)data.stations.push({code:kinds[kind].prefix+'.'+n,kind,enabled:true,state:'free',since:now,zone:'Main floor',capacity:1,neighbor:'',ticketId:null,tech:'',override:null});});
    Object.assign(data.stations.find(s=>s.code==='P.1'),{state:'occupied',ticketId:'1',tech:'Chloe'});
    Object.assign(data.stations.find(s=>s.code==='P.3'),{state:'cleaning',ticketId:'sample-p3',tech:'Kayla Bui',since:new Date(Date.now()-22*60000).toISOString(),dueAt:new Date(Date.now()-12*60000).toISOString()});
    Object.assign(data.stations.find(s=>s.code==='A.2'),{state:'cleaning',ticketId:'sample-a2',tech:'Lana VMM',since:new Date(Date.now()-2*60000).toISOString(),dueAt:new Date(Date.now()+3*60000).toISOString()});
    Object.assign(data.stations.find(s=>s.code==='R.2'),{state:'blocked',blockedNote:'AC repair'});
    return data;
  }
  let memory=seed();
  function load(){try{const data=JSON.parse(localStorage.getItem(key));if(data?.settings&&Array.isArray(data.stations))return data;}catch(_){}return JSON.parse(JSON.stringify(memory));}
  function save(data){try{localStorage.setItem(key,JSON.stringify(data));}catch(_){return false;}memory=data;window.dispatchEvent(new CustomEvent('nexora:stations-changed'));return true;}
  function event(data,type,station,extra={}){data.events.unshift({type,station:station.code,at:new Date().toISOString(),by:demo.account().name,...extra});data.events=data.events.slice(0,100);}
  function update(change){const data=load();const result=change(data);if(!save(data))throw new Error('Unable to save stations locally.');return result;}
  function configure(settings) {
    return update(data=>{
      for(const [kind,count] of Object.entries(settings.counts)){
        const active=data.stations.filter(s=>s.kind===kind&&s.enabled);
        if(active.some(s=>Number(s.code.split('.').pop())>count&&['held','occupied','cleaning'].includes(s.state)))throw new Error('Finish or release active '+kinds[kind].label.toLowerCase()+' before reducing the count.');
        data.stations.filter(s=>s.kind===kind).forEach(s=>s.enabled=Number(s.code.split('.').pop())<=count);
        for(let n=1;n<=count;n++){const code=kinds[kind].prefix+'.'+n;if(!data.stations.some(s=>s.code===code))data.stations.push({code,kind,enabled:true,state:'free',since:new Date().toISOString(),zone:'Main floor',capacity:1,neighbor:'',ticketId:null,tech:'',override:null});}
      }
      data.settings=settings;
      event(data,'station.settings',{code:'Salon'});
    });
  }
  function expire() {
    const data=load();let changed=false;
    data.stations.forEach(s=>{
      if(s.state==='held'&&minutes(s.since)>=data.settings.holdMin){
        event(data,'station.hold-expired',s,{ticketId:s.ticketId});Object.assign(s,{state:'free',ticketId:null,tech:'',override:null,since:new Date().toISOString()});changed=true;
      }
      if(s.state==='cleaning'&&Date.now()>new Date(s.dueAt).getTime()){
        const overdue=minutes(s.dueAt),stage=overdue>=10?'manager':overdue>=5?'reminder':'cleaner';
        if(s.escalation!==stage){s.escalation=stage;event(data,'station.overdue-'+stage,s,{to:!data.settings.beep?'Front Desk':stage==='manager'?'Manager':data.settings.cleaner==='cleaner'?'Salon Cleaner':s.tech});changed=true;}
      }
    });
    if(changed)save(data);
  }
  function fittingKind(t) {const names=(t.lines || t.services || []).map(l=>typeof l==='string'?l:l.name || l.serviceName || '').join(' ');return /pedicure|pedi/i.test(names)?'pedi':/wax|lash/i.test(names)?'room':'mani';}
  function assigned(t){return load().stations.find(s=>s.enabled&&s.ticketId===ticketKey(t)&&['held','occupied'].includes(s.state));}
  function free(t) {const data=load(),kind=fittingKind(t),capacity=Number(t.guestCount || 1),near=data.settings.neighbors&&t.checkIn?.id?data.stations.filter(s=>s.familyId===t.checkIn.id&&s.state!=='free').map(s=>s.neighbor):[];return data.stations.filter(s=>s.enabled&&s.state==='free'&&s.capacity>=capacity).sort((a,b)=>(a.kind===kind?0:2)-(b.kind===kind?0:2)+(near.includes(a.code)?0:1)-(near.includes(b.code)?0:1));}
  function hold(t,code,tech,override=null) {
    if(load().settings.mode==='off')return;
    return update(data=>{
      const current=data.stations.find(s=>s.enabled&&s.ticketId===ticketKey(t)&&['held','occupied'].includes(s.state));
      if(!code){if(data.settings.mode==='auto')throw new Error('Select an available station before Review & Send.');if(current&&current.state==='held'){Object.assign(current,{state:'free',ticketId:null,tech:'',override:null});event(data,'station.release',current);}t.stationCode='';return;}
      const s=data.stations.find(s=>s.code===code&&s.enabled);
      if(!s || s.capacity<Number(t.guestCount || 1))throw new Error('This station cannot fit the guest group.');
      if(s!==current&&s.state!=='free'&&!override)throw new Error('This station is unavailable. Choose a free station.');
      if(current&&s!==current&&current.state==='occupied')throw new Error('Complete the current station before moving this guest.');
      if(current&&s!==current)Object.assign(current,{state:'free',ticketId:null,tech:'',override:null});
      if(s!==current)Object.assign(s,{state:'held',since:new Date().toISOString()});
      Object.assign(s,{ticketId:ticketKey(t),tech:tech || t.tech || '',familyId:t.checkIn?.id || null,override});
      t.stationCode=code;t.stationOverride=override;
      event(data,override?'station.override':'station.hold',s,{ticketId:ticketKey(t)});
    });
  }
  function start(t) {
    if(load().settings.mode==='off')return;
    const s=assigned(t);
    if(!s&&load().settings.mode==='auto')throw new Error('The station hold is missing or expired. Review & Send again.');
    if(s)update(data=>{const row=data.stations.find(x=>x.code===s.code);row.state='occupied';row.since=new Date().toISOString();row.tech=t.tech || row.tech;event(data,'station.start',row);});
  }
  function release(t,clean=true) {
    const station=assigned(t);if(!station)return;
    update(data=>{const s=data.stations.find(x=>x.code===station.code);s.state=clean?'cleaning':'free';s.since=new Date().toISOString();s.escalation=null;
      s.dueAt=clean?new Date(Date.now()+data.settings.cleanMin[s.kind]*60000).toISOString():null;
      if(!clean){s.ticketId=null;s.tech='';s.override=null;}event(data,clean?'station.cleaning':'station.release',s);});
  }
  function gate(tech) {const data=load();return data.settings.mode!=='off'&&data.settings.cleaner==='tech'?data.stations.find(s=>s.enabled&&s.state==='cleaning'&&String(s.tech).split(',').map(n=>n.trim()).includes(tech)):null;}
  function pickerHtml(t,name='stationCode') {
    const data=load();if(data.settings.mode==='off')return '';
    const current=assigned(t),list=free(t),selected=current?.code || (data.settings.mode==='auto'?list[0]?.code:'') || '';
    const ordered=[...new Set(list.map(s=>s.kind))];if(current&&!ordered.includes(current.kind))ordered.unshift(current.kind);
    return `<label class="pos-station-field">Station · ${data.settings.mode}<select class="pos-station-select" name="${esc(name)}" data-pos-station ${data.settings.mode==='auto'?'required':''}><option value="">${data.settings.mode==='manual'?'No station · optional':'Choose a free station'}</option>${ordered.map(kind=>`<optgroup label="${esc(kinds[kind].label)}">${[...(current?.kind===kind?[current]:[]),...list.filter(s=>s.kind===kind)].map(s=>`<option value="${esc(s.code)}" ${s.code===selected?'selected':''}>${esc(s.code)} · ${esc(s.zone)} · capacity ${s.capacity}${s===current?' · current hold':''}</option>`).join('')}</optgroup>`).join('')}</select><small class="pos-muted">${data.settings.mode==='auto'?'Suggested only. Review & Send to hold this station.':'You may skip a station in Manual mode.'} Cleaning and blocked stations cannot be selected.</small></label>`;
  }
  function chip(t) {const data=load();if(data.settings.mode==='off')return '';const code=assigned(t)?.code || t.stationCode;return code?`<span class="pos-station-chip ${t.stationOverride?'flagged':''}">${t.stationOverride?'⚑ ':''}${esc(code)}</span>`:'';}
  function stripHtml(selected='') {
    const data=load();if(data.settings.mode==='off')return '';
    const stations=data.stations.filter(s=>s.enabled),overdue=stations.filter(s=>s.state==='cleaning'&&Date.now()>new Date(s.dueAt).getTime());
    return `<div class="pos-operation-head"><strong>Stations <small class="pos-muted">${stations.filter(s=>s.state==='free').length} free · ${overdue.length} overdue</small></strong><a href="pos-salon-settings.html?section=stations">Station settings</a></div><div class="pos-station-strip" aria-label="Station filter">${stations.map(s=>`<button type="button" class="pos-station-tile ${s.state} ${overdue.includes(s)?'overdue':''}" data-pos-station-filter="${esc(s.code)}" aria-pressed="${selected===s.code}"><strong>${esc(s.code)}</strong><span>${labels[s.state]}</span><small>${s.state==='cleaning'?(overdue.includes(s)?'Overdue '+minutes(s.dueAt)+'m':Math.max(0,Math.ceil((new Date(s.dueAt)-Date.now())/60000))+'m left'):esc(s.tech || s.blockedNote || s.zone)}</small></button>`).join('')}</div>${data.events.filter(e=>e.type==='station.hold-expired').slice(0,3).map(e=>`<div class="pos-warning">${esc(e.station)} hold expired · ticket ${esc(e.ticketId)} · choose a station before Start.</div>`).join('')}${overdue.map(s=>`<div class="pos-warning overdue">${esc(s.code)} cleaning overdue ${minutes(s.dueAt)}m · ${esc(s.tech || 'Salon Cleaner')} · ${!data.settings.beep?'Desk reminder':s.escalation==='manager'?'Manager notified':s.escalation==='reminder'?'Reminder queued':'Cleaning Beep queued'} <button type="button" data-pos-clean="${esc(s.code)}">Mark clean</button></div>`).join('')}`;
  }
  async function clean(code) {
    const s=load().stations.find(s=>s.code===code);if(!s||s.state!=='cleaning'||!window.Swal)return;
    const a=demo.account(),settings=load().settings;
    const manager=['owner','manager'].includes(a.role),technician=a.role==='technician'&&String(s.tech).split(',').map(n=>n.trim()).includes(a.name),cleaner=a.role==='cleaner';
    if(!manager && !(settings.cleaner==='tech'?technician:settings.cleaner==='cleaner'?cleaner:technician||cleaner)){await Swal.fire({icon:'info',title:'Assigned cleaner required',text:'Switch to the responsible technician, cleaner or manager account.',customClass:{popup:'pos-swal'}});return;}
    const required=s.kind==='pedi'&&settings.checklist;
    const result=await Swal.fire({title:'Confirm '+code+' clean',html:`<p class="pos-muted">Confirmed by ${esc(a.name)}${manager?' · on behalf of the cleaner':''}</p><div class="pos-sanitation-checks">${checklist.map((item,i)=>`<label class="pos-check"><input type="checkbox" id="pos-clean-${i}">${esc(item)}</label>`).join('')}</div><p class="pos-muted">${required?'Every checklist item is required.':'Checklist is optional for this station.'} Timer expiry never confirms a station clean.</p>`,showCancelButton:true,confirmButtonText:'Confirm clean',confirmButtonColor:'#17825d',customClass:{popup:'pos-swal'},preConfirm:()=>{
      const items=checklist.map((item,i)=>({item,checked:document.getElementById('pos-clean-'+i).checked}));
      if(required&&items.some(i=>!i.checked)){Swal.showValidationMessage('Complete every required checklist item.');return false;}
      return items;
    }});
    if(!result.isConfirmed)return;
    update(data=>{const row=data.stations.find(x=>x.code===code);if(row.state!=='cleaning'||row.since!==s.since)throw new Error('Station changed. Open the checklist again.');
      data.log.unshift({id:crypto.randomUUID(),station:code,ticketId:row.ticketId,by:a.name,at:new Date().toISOString(),checklist:result.value,overdueMin:minutes(row.dueAt),flagged:!!row.override,reason:row.override?.reason || '',onBehalf:manager});
      Object.assign(row,{state:'free',since:new Date().toISOString(),ticketId:null,tech:'',dueAt:null,override:null,escalation:null});event(data,'station.clean-confirmed',row);
    });
  }
  async function override(t,code,tech) {
    if(!load().settings.allowOverride)throw new Error('Manager overrides are disabled.');
    const s=load().stations.find(s=>s.code===code);if(!s||!['cleaning','blocked'].includes(s.state))throw new Error('Choose a cleaning or blocked station.');
    const approval=await demo.approve('override',code+' · Ticket '+t.id,{force:true,reason:true,label:'Station not confirmed clean'});if(!approval)return false;
    const data=load(),latest=data.stations.find(x=>x.code===code);
    if(latest.state!==s.state||latest.since!==s.since)throw new Error('Station changed. Review it again.');
    const mark={by:approval.approver.name,reason:approval.reason,at:new Date().toISOString()};
    hold(t,code,tech,mark);
    update(value=>value.log.unshift({id:crypto.randomUUID(),station:code,ticketId:ticketKey(t),by:mark.by,at:mark.at,checklist:[],overdueMin:minutes(s.dueAt || s.since),flagged:true,reason:mark.reason}));
    return true;
  }
  function beep(code){update(data=>{const s=data.stations.find(s=>s.code===code);if(s?.state==='cleaning')event(data,'station.beep',s,{to:data.settings.cleaner==='cleaner'?'Salon Cleaner':s.tech});});}
  document.addEventListener('click',async e=>{const b=e.target.closest('[data-pos-clean],[data-pos-beep]');if(!b)return;try{if(b.dataset.posClean)await clean(b.dataset.posClean);else beep(b.dataset.posBeep);}catch(error){if(window.Swal)Swal.fire({icon:'error',title:'Station not updated',text:error.message,customClass:{popup:'pos-swal'}});}});
  window.addEventListener('storage',e=>{if(e.key===key)window.dispatchEvent(new CustomEvent('nexora:stations-changed'));});
  window.NEXORA_STATIONS={load,save,configure,assigned,free,hold,start,release,gate,pickerHtml,chip,stripHtml,clean,override,beep,kinds,labels};
  expire();setInterval(()=>{expire();window.dispatchEvent(new CustomEvent('nexora:stations-tick'));},30000);
})();
