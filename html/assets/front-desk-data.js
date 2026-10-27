/* Shared access to existing Front Desk and direct-checkout demo records. */
(function () {
  'use strict';
  const keys={tickets:'nexora:front-desk-ticket-workspaces:v1',direct:'nexora:direct-checkouts:v1',technicians:'nexora:front-desk-technicians:v1'};
  const keyOf=t=>String(t.bookingId || t.id);
  const digits=value=>String(value || '').replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'');
  const names=line=>String(line.tech || '').split(',').map(name=>name.trim()).filter(Boolean);
  function initialTickets(){
    let tickets=[
     {id:7,customer:'Quan',phone:'(555) 012-2807',time:'8:49 AM',status:'waiting',tech:'',services:['Milk and Honey Pedicure'],wait:28},
     {id:9,customer:'Brian',phone:'(555) 016-1092',time:'9:16 AM',status:'waiting',tech:'',services:['Milk and Honey Pedicure'],wait:17},
     {id:1,customer:'DJ',phone:'(555) 019-5421',time:'10:56 AM',status:'in-service',tech:'Chloe',services:['Acrylic with Polish (Full Set)','Paris Pearl Pedicure'],wait:0},
     {id:8,customer:'Leo',phone:'(555) 017-8804',time:'9:07 AM',status:'waiting',tech:'Kayla Bui, Lana VMM',services:['Paris Pearl Pedicure','Eyebrow Waxing','Dipping Powder'],wait:25}
    ];
    const appointmentStore=window.NEXORA_APPOINTMENTS_STORE;
    if(appointmentStore){
     const records=appointmentStore.loadAll();
     const reservedNumbers=new Set([...tickets.map(t=>t.id),...Object.values(read(keys.tickets,{})).map(ticket=>ticket.id),...records.map(r=>r.metadata?.checkIn?.ticketNumber).filter(Number.isSafeInteger)]);
     let nextId=Math.max(...tickets.map(t=>t.id));
     records.filter(r=>r.status==='checked-in'&&(r.metadata?.estimate||r.metadata?.checkIn)).forEach(r=>{
      const checkIn=r.metadata?.checkIn;
      let number=checkIn?.ticketNumber;
      if(!Number.isSafeInteger(number)){do{nextId++;}while(reservedNumbers.has(nextId));number=nextId;reservedNumbers.add(number);}
      const lines=r.tickets.map(l=>({id:l.id,serviceId:l.serviceId,name:l.serviceName,price:l.price,tech:l.technicianName==='Anyone'?'':l.technicianName,status:l.technicianId?'assigned':'unassigned'}));
      tickets.push({id:number,bookingId:r.id,customer:r.customerName,phone:r.phone,
       time:new Date(r.metadata.checkedInAt || r.startAt).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),
       status:'waiting',tech:[...new Set(lines.map(l=>l.tech).filter(Boolean))].join(', '),services:lines.map(l=>l.name),lines,checkIn,
       wait:Math.max(0,Math.floor((Date.now()-new Date(r.metadata.checkedInAt || r.startAt).getTime())/60000)),estimateNote:r.note});
     });
    }
    return tickets;
  }
  const seedTechnicians=[
   {name:'Kayla Bui',level:2,status:'available',turns:4,serviceCount:6,sales:180,minutes:205,codes:['PED','GEL','WAX'],commission:.6,dailyIncomeGoal:150,detail:'Available now · Nails & pedicure'},
   {name:'Lana VMM',level:3,status:'available',turns:4,serviceCount:4,sales:430,minutes:278,codes:['ACR-FS','REF','DIP'],commission:.6,dailyIncomeGoal:220,detail:'Available now · All services'},
   {name:'Chloe',level:3,status:'busy',turns:3,serviceCount:5,sales:365,minutes:250,codes:['MANI','GEL','PED'],commission:.6,dailyIncomeGoal:240,detail:'Busy · About 18 min remaining'},
   {name:'Mia',level:1,status:'clocked-out',turns:2,serviceCount:3,sales:155,minutes:120,codes:['MANI','WAX'],commission:.55,dailyIncomeGoal:120,detail:'Clocked out'}
  ];

  function read(key,fallback){
    const value=JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    if(!value || typeof value!=='object' || Array.isArray(value)!==Array.isArray(fallback))throw new TypeError();
    return value;
  }
  function normalize(ticket){
    const catalog=window.NEXORA_SALON_DATA.loadCatalog().services;
    if(!ticket.lines)ticket.lines=(ticket.services || []).map((name,index)=>{
      const match=catalog.find(s=>s.name.toLowerCase()===name.toLowerCase() || s.aliases?.some(a=>a.toLowerCase()===name.toLowerCase()));
      return {id:'line-'+ticket.id+'-'+index,serviceId:match?.id,name,price:match?.price ?? null,tech:ticket.tech || '',status:ticket.status==='in-service'?'in-service':ticket.tech?'assigned':'unassigned'};
    });
    ticket.services=ticket.lines.map(line=>line.name);
    ticket.tech=[...new Set(ticket.lines.flatMap(names))].join(', ');
    if(!ticket.payment && ticket.lines.length && ticket.lines.every(line=>line.status==='completed') && !ticket.directCheckout)ticket.status='ready-to-pay';
    return ticket;
  }
  function all(){
    const saved=read(keys.tickets,{}),rows=new Map();
    initialTickets().forEach(ticket=>rows.set(keyOf(ticket),{...ticket,...saved[keyOf(ticket)]}));
    Object.values(saved).filter(ticket=>ticket?.id!=null).forEach(ticket=>rows.set(keyOf(ticket),ticket));
    read(keys.direct,[]).filter(ticket=>ticket?.id!=null).forEach(ticket=>rows.set(keyOf(ticket),ticket));
    return [...rows.values()].map(normalize);
  }
  const active=ticket=>!ticket.payment&&!ticket.cancelled&&!['cancelled','completed'].includes(ticket.status);
  const editable=ticket=>active(ticket)&&!ticket.splitBills;
  function save(ticket){
    normalize(ticket);
    if(ticket.directCheckout){
      const saved=read(keys.direct,[]),index=saved.findIndex(row=>keyOf(row)===keyOf(ticket));
      if(index<0)saved.unshift(ticket);else saved[index]=ticket;
      localStorage.setItem(keys.direct,JSON.stringify(saved));
    }else{
      const saved=read(keys.tickets,{});saved[keyOf(ticket)]=ticket;
      localStorage.setItem(keys.tickets,JSON.stringify(saved));
    }
    window.dispatchEvent(new CustomEvent('nexora:front-desk-data-changed',{detail:{ticketId:keyOf(ticket)}}));
    return ticket;
  }
  function technicians(){
    const catalog=window.NEXORA_SALON_DATA.loadCatalog().technicians,saved=read(keys.technicians,[]);
    const rows=new Map(seedTechnicians.map(tech=>[tech.name,{...tech}]));
    catalog.forEach(tech=>rows.set(tech.name,{...(rows.get(tech.name)||{}),...tech,status:tech.active?'available':'clocked-out'}));
    saved.forEach(tech=>{const profile=catalog.find(row=>row.name===tech.name);rows.set(tech.name,{...rows.get(tech.name),...tech,...(profile?{active:profile.active,skills:profile.skills}:{}),...(profile?.active===false?{status:'clocked-out'}:{})});});
    return [...rows.values()];
  }
  function saveTechnicians(rows){localStorage.setItem(keys.technicians,JSON.stringify(rows));}
  // Patch only the selected saved profile. The returned compensation rereads
  // current data and restores only fields that still contain this write's value.
  function patchTechnician(name,changes){
    const hadSaved=localStorage.getItem(keys.technicians)!==null,rows=read(keys.technicians,[]),index=rows.findIndex(row=>row.name===name),before=index<0?{name}:{...rows[index]},next={...before,...changes};
    if(index<0)rows.push(next);else rows[index]=next;
    saveTechnicians(rows);
    return function compensate(){
      const latest=read(keys.technicians,[]),at=latest.findIndex(row=>row.name===name);
      if(at<0)return;
      const current={...latest[at]};let changed=false;
      Object.keys(changes).forEach(field=>{
        if(current[field]!==changes[field])return;
        if(Object.hasOwn(before,field))current[field]=before[field];else delete current[field];
        changed=true;
      });
      if(!changed)return;
      if(index<0&&Object.keys(current).every(field=>field==='name'))latest.splice(at,1);else latest[at]=current;
      if(!latest.length&&!hadSaved)localStorage.removeItem(keys.technicians);else saveTechnicians(latest);
    };
  }
  function workFor(name,rows=all()){
    return rows.filter(active).flatMap(ticket=>ticket.lines.filter(line=>!line.parentLineId&&names(line).includes(name)).map(line=>({ticket,line})));
  }
  function statusFor(tech,rows=all()){
    if(!tech)return 'clocked-out';
    const work=workFor(tech.name,rows);
    if(work.some(({line})=>line.status==='in-service'))return 'busy';
    if(['clocked-out','paused'].includes(tech.status))return tech.status;
    return work.some(({line})=>line.status!=='completed')?'assigned':'available';
  }
  const canOperate=()=>!window.NEXORA_POS_DEMO || ['owner','manager','cashier'].includes(window.NEXORA_POS_DEMO.account().role);
  function visible(ticket){return canOperate() || ticket.lines.some(line=>names(line).includes(window.NEXORA_POS_DEMO.account().name));}
  function canAssign(name,service){
    const tech=technicians().find(tech=>tech.name===name);
    if(!service || !tech || tech.active===false || ['clocked-out','paused'].includes(tech.status))return false;
    const approved=tech.approvedServiceCodes || tech.codes;
    const skill=String(service?.requiredSkill || '').toLowerCase();
    const codes={pedicure:'PED',manicure:'MANI',gel:'GEL',dip:'DIP',acrylic:'ACR-FS',waxing:'WAX'};
    if(approved?.length)return !!approved.includes(codes[skill]);
    return !!tech.skills?.some(value=>value.toLowerCase()===skill);
  }
  function openForPhone(phone){return all().find(ticket=>active(ticket)&&digits(ticket.phone)===digits(phone));}
  function serviceLine(service,tech,coTech=''){
    return {id:crypto.randomUUID(),serviceId:service.id,name:service.name,price:service.price,originalPrice:service.price,tech:[tech,coTech].filter(Boolean).join(', '),coTech,status:'assigned'};
  }
  function create({customer,phone,serviceId,tech,coTech}){
    if(!canOperate())throw new TypeError();
    if(digits(phone).length!==10)throw new Error('Enter a 10-digit customer phone number.');
    if(!customer.trim())throw new Error('Enter the new customer name.');
    const existing=openForPhone(phone);if(existing)return {ticket:existing,existing:true};
    const service=window.NEXORA_SALON_DATA.loadCatalog().services.find(row=>row.id===serviceId&&row.active!==false);
    if(!service)throw new Error('Choose a salon service.');
    if(!canAssign(tech,service) || coTech&&(!canAssign(coTech,service)||coTech===tech))throw new Error('For a checked-in guest, this technician must be on shift and qualified for the service.');
    const id=Math.max(100,...all().map(ticket=>Number(ticket.id)).filter(Number.isSafeInteger))+1;
    const ticket={id,customer:customer.trim().toUpperCase(),phone:digits(phone),checkedIn:false,source:'staff',createdAt:new Date().toISOString(),time:new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),wait:0,status:'waiting',lines:[serviceLine(service,tech,coTech)]};
    return {ticket:save(ticket),existing:false};
  }
  function addService(id,serviceId,tech){
    if(!canOperate())throw new TypeError();
    const ticket=all().find(row=>keyOf(row)===String(id));
    const service=window.NEXORA_SALON_DATA.loadCatalog().services.find(row=>row.id===serviceId&&row.active!==false);
    if(!ticket||!editable(ticket)||!service)throw new Error('Select a customer ticket and salon service first.');
    if(!canAssign(tech,service))throw new Error('For a checked-in guest, this technician must be on shift and qualified for the service.');
    const line=serviceLine(service,tech);
    if(ticket.directCheckout){
      ticket.poGroups=ticket.poGroups || [...new Set(ticket.lines.map(row=>names(row)[0] || ''))].map(name=>({id:crypto.randomUUID(),tech:name}));
      ticket.lines.forEach(row=>{if(!row.groupId)row.groupId=ticket.poGroups.find(group=>group.tech===(names(row)[0] || ''))?.id;});
      let group=ticket.poGroups.find(group=>group.tech===tech);
      if(!group){group={id:crypto.randomUUID(),tech};ticket.poGroups.push(group);}
      line.groupId=group.id;
    }
    ticket.lines.push(line);if(!ticket.directCheckout && ticket.status==='ready-to-pay')ticket.status='waiting';
    return save(ticket);
  }
  function url(ticket,mode='edit',returnTo=''){
    const target=new URL('pos-front-desk-tickets.html',location.href);
    target.searchParams.set('ticketId',keyOf(ticket));target.searchParams.set('mode',mode);
    if(returnTo)target.searchParams.set('returnTo',returnTo);
    return target.href;
  }
  window.NEXORA_FRONT_DESK_DATA={keys,keyOf,digits,names,all,active,editable,save,technicians,saveTechnicians,patchTechnician,workFor,statusFor,canOperate,visible,canAssign,openForPhone,create,addService,url};
})();
