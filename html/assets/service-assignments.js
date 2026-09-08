/* Shared browser-only state for the Front Desk / Technician App prototype. */
(function (root) {
  'use strict';
  const key = 'nexora-service-assignments-v1';
  const listeners = new Set();
  const labels = {'not-sent':'Not sent',sent:'Sent',viewed:'Viewed',accepted:'Accepted','in-service':'In Service',completed:'Completed'};
  const catalog = [
    {id:'ped',name:'Paris Pearl Pedicure',category:'Pedicure',price:75,duration:60},
    {id:'gel',name:'Full Set Shellac',category:'Acrylic',price:60,duration:50},
    {id:'dip',name:'Dipping Powder',category:'Dipping',price:52,duration:45},
    {id:'wax',name:'Eyebrow Waxing',category:'Waxing',price:15,duration:15}
  ];
  function seed() {
    const line = (id,service,techId='') => ({...catalog[service],id,techId,status:'not-sent',location:'',note:'',revision:1});
    const today = new Date();
    const date = [today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
    return {version:1,date,tickets:[
      {id:'dj',number:1,customer:'DJ',phone:'(555) 019-5421',newCustomer:true,time:'10:56',salonId:'golden',services:[]},
      {id:'brian',number:2,customer:'Brian',phone:'(555) 016-1092',time:'10:57',salonId:'golden',services:[line('brian-1',0),line('brian-2',1)]},
      {id:'jojo',number:3,customer:'Jojo',phone:'(555) 017-8804',time:'10:57',salonId:'golden',services:[line('jojo-1',2,'kayla')]},
      {id:'jj',number:4,customer:'Jj',phone:'(555) 012-2807',time:'10:58',salonId:'golden',services:[{...line('jj-1',0,'huu'),status:'in-service',sentAt:today.toISOString(),viewedAt:today.toISOString(),acceptedAt:today.toISOString(),startedAt:today.toISOString(),credit:1.5},{...line('jj-2',3,'michael'),status:'in-service',sentAt:today.toISOString(),viewedAt:today.toISOString(),acceptedAt:today.toISOString(),startedAt:today.toISOString(),credit:.5}]}
    ],technicians:[{id:'kayla',name:'Kayla Bui',clockedIn:true,paused:false},{id:'lana',name:'Lana VMM',clockedIn:true,paused:false},{id:'huu',name:'HUU',clockedIn:true,paused:false},{id:'michael',name:'Michael',clockedIn:true,paused:false}],turnEntries:[]};
  }
  // Read the latest snapshot before every mutation; never silently overwrite damaged data.
  function load() {
    const raw = root.localStorage.getItem(key);
    if (!raw) return seed();
    const state = JSON.parse(raw);
    if (state.version !== 1 || !Array.isArray(state.tickets) || !Array.isArray(state.technicians) || !Array.isArray(state.turnEntries)) throw new Error('Saved assignments cannot be read.');
    return state;
  }
  function publish(){listeners.forEach(fn=>fn());}
  let pending = Promise.resolve();
  function mutate(change) {
    const operation = () => {
      const state = load();
      change(state);
      try { root.localStorage.setItem(key,JSON.stringify(state)); }
      catch (_) { throw new Error('Unable to save. Check browser storage and try again.'); }
      publish();
      return state;
    };
    const run = () => root.navigator.locks ? root.navigator.locks.request(key,operation) : operation();
    const result = pending.then(run);
    pending = result.catch(()=>{});
    return result;
  }
  function find(state,id) {
    for (const ticket of state.tickets) {const line=ticket.services.find(s=>s.id===id);if(line)return {ticket,line};}
    throw new Error('Service no longer exists. Refresh the list.');
  }
  const active = line => ['sent','viewed','accepted','in-service'].includes(line.status);
  function queue(state=load()) {
    return state.technicians.filter(t=>t.clockedIn&&!t.paused&&!state.tickets.some(ticket=>ticket.services.some(s=>s.techId===t.id&&active(s))))
      .map(t=>({...t,turns:state.turnEntries.filter(e=>e.techId===t.id).reduce((sum,e)=>sum+e.credit,0)}))
      .sort((a,b)=>a.turns-b.turns || (a.lastCompletedAt||'').localeCompare(b.lastCompletedAt||''));
  }
  function ticketStatus(ticket) {
    if(ticket.payment)return 'Completed';
    const lines=ticket.services;
    if(!lines.length)return 'Needs service';
    if(lines.every(s=>s.status==='completed'))return 'Checkout pending';
    if(lines.some(s=>s.status==='in-service'))return 'In service';
    if(lines.some(s=>s.status==='completed'))return 'Partially completed';
    if(lines.some(s=>!s.techId))return 'Needs assignment';
    if(lines.some(s=>s.status==='not-sent'))return 'Ready to send';
    return lines.every(s=>s.status===lines[0].status)?labels[lines[0].status]:'Awaiting start';
  }
  function inbox(techId,state=load()) {
    return state.tickets.flatMap(ticket=>ticket.services.filter(s=>s.techId===techId&&s.status!=='not-sent').map(line=>({ticket,line})))
      .sort((a,b)=>(b.line.sentAt||'').localeCompare(a.line.sentAt||''));
  }
  function assign(id,techId,location,note) {return mutate(state=>{
    const {ticket,line}=find(state,id);
    if(['in-service','completed'].includes(line.status))throw new Error('This service has already started.');
    const tech=state.technicians.find(t=>t.id===techId);
    if(!tech||!tech.clockedIn||tech.paused)throw new Error('Choose an available technician.');
    const changed=line.techId!==techId;
    if(changed && state.tickets.some(t=>t.id!==ticket.id&&t.services.some(s=>s.techId===techId&&active(s))))throw new Error('This technician already has active work.');
    if(changed){
      line.revision+=1;line.status='not-sent';
      for(const field of ['sentAt','viewedAt','acceptedAt','startedAt','completedAt','lastReminderAt','completionNote','credit'])delete line[field];
    }
    line.techId=techId;line.location=String(location||'').trim();line.note=String(note||'').trim();
  });}
  function send(ticketId){return mutate(state=>{
    const ticket=state.tickets.find(t=>t.id===ticketId);
    if(!ticket?.services.length||ticket.services.some(s=>!s.techId))throw new Error('Assign a technician to every service first.');
    const unsent=ticket.services.filter(s=>s.status==='not-sent');
    for(const line of unsent){
      const tech=state.technicians.find(t=>t.id===line.techId);
      if(!tech?.clockedIn||tech.paused||state.tickets.some(t=>t.id!==ticketId&&t.services.some(s=>s.techId===line.techId&&active(s))))throw new Error('A selected technician is no longer available.');
    }
    for(const line of unsent){line.status='sent';line.sentAt=new Date().toISOString();line.credit=root.NEXORA_TURN_SETTINGS?.serviceCredit(line.price) ?? (line.price<30?.5:line.price<70?1:line.price<110?1.5:2);}
  });}
  function transition(id,techId,action,note,revision){return mutate(state=>{
    const {line}=find(state,id);
    if(line.techId!==techId)throw new Error('Only the assigned technician can update this service.');
    if(revision!==undefined&&line.revision!==revision)throw new Error('Assignment changed. Open the latest notification.');
    const steps={view:['sent','viewed','viewedAt'],accept:['viewed','accepted','acceptedAt'],start:['accepted','in-service','startedAt'],complete:['in-service','completed','completedAt']};
    const step=steps[action];if(!step)throw new Error('Unknown action.');
    const sequence=['not-sent','sent','viewed','accepted','in-service','completed'];
    if(sequence.indexOf(line.status)>=sequence.indexOf(step[1]))return;
    if(line.status!==step[0])throw new Error(action==='start'?'Accept this service before starting.':'Open the assignment and follow the next step.');
    if(action==='complete'&&!String(note||'').trim())throw new Error('Enter a completion note.');
    line.status=step[1];line[step[2]]=new Date().toISOString();
    if(action==='complete'){
      line.completionNote=String(note).trim();
      if(!state.turnEntries.some(e=>e.serviceId===line.id))state.turnEntries.push({serviceId:line.id,techId,credit:line.credit,amount:line.price,completedAt:line.completedAt});
      state.technicians.find(t=>t.id===techId).lastCompletedAt=line.completedAt;
    }
  });}
  function resend(id){return mutate(state=>{const {line}=find(state,id);if(!['sent','viewed'].includes(line.status))throw new Error('Only pending assignments can be resent.');line.lastReminderAt=new Date().toISOString();});}
  function addService(ticketId,catalogId){return mutate(state=>{
    const ticket=state.tickets.find(t=>t.id===ticketId),service=catalog.find(s=>s.id===catalogId);
    if(!ticket||!service)throw new Error('Choose a service.');
    if(ticket.services.length&&ticket.services.every(s=>s.status==='completed'))throw new Error('This ticket is ready for checkout.');
    ticket.services.push({...service,id:root.crypto.randomUUID(),techId:'',status:'not-sent',location:'',note:'',revision:1});
  });}
  function pay(ticketId,options){return mutate(state=>{
    const ticket=state.tickets.find(t=>t.id===ticketId);
    if(!ticket)throw new Error('Ticket not found.');
    if(ticket.payment)return;
    if(!ticket.services.length||ticket.services.some(s=>s.status!=='completed'))throw new Error('Complete all services before checkout.');
    const tip=Number(options.tip),cash=Number(options.cash),method=options.method;
    if(!Number.isFinite(tip)||tip<0||!['cash','card','gift-card','split'].includes(method))throw new Error('Choose a payment method and a valid tip.');
    const subtotal=Math.round(ticket.services.reduce((sum,s)=>sum+s.price,0)*100);
    const total=(subtotal+Math.round(tip*100))/100;
    if(method==='cash'&&(!Number.isFinite(cash)||cash<total))throw new Error('Cash received must cover the total.');
    ticket.payment={id:root.crypto.randomUUID(),subtotal:subtotal/100,tip:Math.round(tip*100)/100,total,method,
      cash:method==='cash'?cash:null,change:method==='cash'?Math.round((cash-total)*100)/100:0,
      receipt:options.receipt||'none',paidAt:new Date().toISOString(),demo:true};
  });}
  function editService(id,action,value){return mutate(state=>{
    const {ticket,line}=find(state,id);
    if(line.status!=='not-sent'||ticket.payment)throw new Error('Only unsent services can be edited or removed.');
    if(action==='remove'){ticket.services=ticket.services.filter(s=>s.id!==id);return;}
    if(action==='change'){
      const service=catalog.find(s=>s.id===value);if(!service)throw new Error('Choose a service.');
      Object.assign(line,{name:service.name,category:service.category,price:service.price,duration:service.duration,techId:'',revision:line.revision+1});
    }
  });}
  function saveNote(ticketId,note){return mutate(state=>{
    const ticket=state.tickets.find(t=>t.id===ticketId);if(!ticket||ticket.payment)throw new Error('Ticket is closed.');
    ticket.note=String(note).trim();
  });}
  root.addEventListener('storage',event=>{if(event.key===key||event.key===null)publish();});
  root.NEXORA_SERVICE_ASSIGNMENTS={load,assign,send,transition,resend,addService,editService,saveNote,pay,queue,inbox,ticketStatus,labels,catalog,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
})(window);
