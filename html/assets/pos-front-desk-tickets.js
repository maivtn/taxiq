/* Tickets content adapted from the supplied Front Desk prototype. Ticket workspaces are saved locally between visits. */
(function () {
'use strict';
let tickets=[
 {id:7,customer:'Quan',phone:'(555) 012-2807',time:'8:49 AM',status:'waiting',tech:'',services:['Milk and Honey Pedicure'],wait:28},
 {id:9,customer:'Brian',phone:'(555) 016-1092',time:'9:16 AM',status:'waiting',tech:'',services:['Milk and Honey Pedicure'],wait:17},
 {id:1,customer:'DJ',phone:'(555) 019-5421',time:'10:56 AM',status:'in-service',tech:'Chloe',services:['Acrylic with Polish (Full Set)','Paris Pearl Pedicure'],wait:0},
 {id:8,customer:'Leo',phone:'(555) 017-8804',time:'9:07 AM',status:'waiting',tech:'Kayla Bui, Lana VMM',services:['Paris Pearl Pedicure','Eyebrow Waxing','Dipping Powder'],wait:25}
];
const appointmentStore=window.NEXORA_APPOINTMENTS_STORE;
if(appointmentStore){
 const records=appointmentStore.loadAll();
 const reservedNumbers=new Set([...tickets.map(t=>t.id),...records.map(r=>r.metadata?.checkIn?.ticketNumber).filter(Number.isSafeInteger)]);
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
const workspaceStorageKey='nexora:front-desk-ticket-workspaces:v1';
let savedWorkspaces={};
try{
 const stored=JSON.parse(localStorage.getItem(workspaceStorageKey)||'{}');
 if(stored&&typeof stored==='object'&&!Array.isArray(stored))savedWorkspaces=stored;
}catch(_){}
const ticketKey=t=>t.bookingId || String(t.id);
const ticketRecords=tickets.map(t=>({...t,...savedWorkspaces[ticketKey(t)],id:t.id,bookingId:t.bookingId}));
Object.entries(savedWorkspaces).forEach(([id,ticket])=>{
 if(ticket?.payment&&!ticketRecords.some(t=>ticketKey(t)===id))ticketRecords.push({...ticket});
});
tickets=ticketRecords.filter(t=>!t.payment&&!t.cancelled);
function persistWorkspace(t){
 savedWorkspaces[ticketKey(t)]={...t};
 try{localStorage.setItem(workspaceStorageKey,JSON.stringify(savedWorkspaces));}
 catch(_){feedback('Unable to save this ticket locally. Keep this page open and try again.');}
}
const technicians=[
 {name:'Kayla Bui',level:2,status:'available',turns:4,serviceCount:6,sales:180,minutes:205,codes:['PED','GEL','WAX'],commission:.6,dailyIncomeGoal:150,detail:'Available now · Nails & pedicure'},
 {name:'Lana VMM',level:3,status:'available',turns:4,serviceCount:4,sales:430,minutes:278,codes:['ACR-FS','REF','DIP'],commission:.6,dailyIncomeGoal:220,detail:'Available now · All services'},
 {name:'Chloe',level:3,status:'busy',turns:3,serviceCount:5,sales:365,minutes:250,codes:['MANI','GEL','PED'],commission:.6,dailyIncomeGoal:240,detail:'Busy · About 18 min remaining'},
 {name:'Mia',level:1,status:'clocked-out',turns:2,serviceCount:3,sales:155,minutes:120,codes:['MANI','WAX'],commission:.55,dailyIncomeGoal:120,detail:'Clocked out'}
];
const salonTechnicians=window.NEXORA_SALON_DATA?.loadCatalog().technicians || [];
salonTechnicians.forEach(t=>{if(!technicians.some(existing=>existing.name===t.name))technicians.push({name:t.name,status:t.active?'available':'clocked-out',detail:t.active?'Available for service':'Clocked out'});});
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const demo=window.NEXORA_POS_DEMO,stations=window.NEXORA_STATIONS;
const labels={'not-arrived':'Not Arrived',waiting:'Waiting','in-service':'In Service','ready-to-pay':'Ready to pay'};
const visibleFor=t=>!demo||['owner','manager','cashier'].includes(demo.account().role)||(demo.account().role==='technician'&&String(t.tech || '').split(',').map(n=>n.trim()).includes(demo.account().name));
let filter='all',stationFilter='',selected=null,action='',openedTicket=null;
const ticketViewKey='nexora:front-desk-ticket-view:v1';
function preferredTicketView(){try{return localStorage.getItem(ticketViewKey)==='board'?'board':'table';}catch(_){return 'table';}}
function ticketViewFromUrl(){const value=new URL(window.location.href).searchParams.get('ticketView');return ['table','board'].includes(value)?value:preferredTicketView();}
let ticketView=ticketViewFromUrl();
function applyTicketView(){
 $('#ticket-table-view').hidden=ticketView!=='table';$('#ticket-board-view').hidden=ticketView!=='board';
 document.querySelectorAll('[data-ticket-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ticketView===ticketView)));
}
const matchesStation=t=>!stationFilter||(stations.assigned(t)?.code || t.stationCode)===stationFilter;
const filteredTickets=()=>tickets.filter(t=>visibleFor(t)&&matchesStation(t)&&(filter==='all'||t.status===filter));
const feedback=message=>{$('#feedback').textContent=message;};
function button(label,kind,id,extra=''){return '<button type="button" data-action="'+kind+'" data-id="'+id+'" class="'+extra+'">'+label+'</button>';}
function needsTechnician(t){return t.lines?t.lines.some(l=>!l.tech):!t.tech;}
function ticketStatus(t){return t.cancelled?'Cancelled':t.payment?'Paid':labels[t.status] || 'Completed';}
function renderFamilyGroups(){
 const groups=new Map();
 ticketRecords.filter(t=>visibleFor(t)&&t.checkIn?.mode==='family').forEach(t=>{
  const id=t.checkIn.id;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(t);
 });
 const host=$('#family-checkin-groups');host.hidden=!groups.size;
 host.innerHTML=Array.from(groups,([id,members])=>{
  const contact=members[0].checkIn.contact || {},paid=members.filter(t=>t.payment).length,cancelled=members.filter(t=>t.cancelled).length;
  const reference='FG-'+String(Math.min(...members.map(t=>t.id))).padStart(4,'0');
  return '<article class="family-checkin-group"><div class="family-checkin-heading"><div><h3>Family · '+esc(contact.name)+'</h3><p>Primary contact · '+esc('•••• '+String(contact.phone || '').replace(/\D/g,'').slice(-4))+'</p></div><p class="family-checkin-progress">'+members.length+' member tickets · '+paid+'/'+members.length+' paid · '+cancelled+' cancelled</p></div><p class="family-checkin-id">Group '+reference+'</p><ul>'+members.map(t=>{
   const relationship=t.checkIn.relationship==='self'?'Primary guest':t.checkIn.relationship==='other'?'':t.checkIn.relationship;
   const text='<strong>#'+t.id+' '+esc(t.customer)+'</strong><span>'+(relationship?esc(relationship)+' · ':'')+ticketStatus(t)+'</span>';
   const url=new URL(window.location.href);url.searchParams.set('ticketId',ticketKey(t));url.searchParams.set('mode',t.payment?'checkout':'edit');url.searchParams.delete('view');
   return '<li>'+(t.cancelled?'<span class="family-member cancelled">'+text+'</span>':'<a class="family-member" data-family-ticket="'+esc(ticketKey(t))+'" href="'+esc(url.href)+'">'+text+'</a>')+'</li>';
  }).join('')+'</ul></article>';
 }).join('');
}
function syncNavigation(){
 const active=openedTicket?.payment?'completed':new URL(window.location.href).searchParams.get('view')==='overview'?'overview':'tickets';
 document.querySelectorAll('[data-front-view],[data-front-completed]').forEach(link=>{
  const selected=(link.hasAttribute('data-front-completed')?'completed':link.dataset.frontView)===active;
  link.classList.toggle('active',selected);if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
 });
}
function render(){
  syncNavigation();
  tickets.forEach(t=>{if(t.lines?.length&&t.lines.every(l=>l.status==='completed'))t.status='ready-to-pay';const st=stations?.assigned(t);if(st){t.stationCode=st.code;t.stationOverride=st.override;}});
  applyTicketView();
  renderFamilyGroups();
  const active=tickets.filter(visibleFor),stationRows=active.filter(matchesStation);
  $('#ticket-nav-count').textContent=active.length;
  $('#ticket-filters').innerHTML=[['all','All'],...Object.entries(labels)].map(([key,label])=>'<button type="button" data-filter="'+key+'" class="'+(filter===key?'active':'')+'" aria-pressed="'+(filter===key)+'">'+label+' ('+stationRows.filter(t=>key==='all'||t.status===key).length+')</button>').join('');
  const waiting=stationRows.filter(t=>t.status==='waiting'&&needsTechnician(t)).length;
  $('#assignment-alert').hidden=!waiting;$('#assignment-alert').textContent='● '+waiting+' '+(waiting===1?'guest':'guests')+' awaiting technician assignment';
  const rows=filteredTickets();
  $('#ticket-empty').hidden=rows.length>0;
  $('#ticket-body').innerHTML=rows.map(t=>{
    let actions=button('Edit','edit',t.id);
    if(!t.services.length)actions+=button('Add Service','edit',t.id)+button('Consultation','assign',t.id)+button('Cancel','cancel',t.id,'cancel');
    else if(['in-service','ready-to-pay'].includes(t.status))actions+=(t.splitBills?'':button('Reassign','assign',t.id))+button('Checkout','checkout',t.id,'checkin')+button('Cancel','cancel',t.id,'cancel');
    else actions+=(t.tech?button('Reassign','assign',t.id)+button('Start Service','start',t.id,'checkin'):button('Assign Tech','assign',t.id))+button('Cancel','cancel',t.id,'cancel');
    const family=t.checkIn?.mode==='family'?'<small class="family-ticket-marker">Family · '+esc(t.checkIn.contact?.name)+'</small>':'';
    return '<tr><td><span class="ticket-number">#'+t.id+'</span></td><td><strong>'+esc(t.customer)+'</strong><small>'+esc('•••• '+String(t.phone || '').replace(/\D/g,'').slice(-4))+'</small>'+family+'</td><td>'+esc(t.time)+'</td><td><span class="chip status '+t.status+'">'+labels[t.status]+'</span>'+(t.splitBills?'<small>'+t.splitBills.bills.filter(b=>b.payment).length+'/'+t.splitBills.bills.length+' bills paid</small>':'')+(!t.services.length?'<span class="ticket-needed">● NEEDS SERVICE</span>':needsTechnician(t)?'<span class="ticket-needed">● NEEDS TECHNICIAN</span>':'')+'</td><td>'+esc(t.tech||'—')+stations.chip(t)+(stations.load().settings.mode==='off'&&t.location?'<small>'+esc(t.location)+'</small>':'')+(t.techNote?'<small>Private tech note</small>':'')+'</td><td>'+t.services.map(s=>'<span class="chip">'+esc(s)+'</span>').join(' ')+(t.estimateNote?'<small>Private estimate note</small>':'')+'</td><td>'+(t.status==='waiting'?'<span class="wait-time">'+t.wait+' min</span>':'—')+'</td><td><div class="actions">'+actions+'</div></td></tr>';
  }).join('');
  window.dispatchEvent(new CustomEvent('nexora:tickets-changed'));
}
const workspace=window.NEXORA_TICKET_WORKSPACE.mount($('#ticket-workspace'),{
 catalog:()=>window.NEXORA_SALON_DATA ? window.NEXORA_SALON_DATA.loadCatalog().services : [],
 technicians:()=>technicians,
 onChange(t){persistWorkspace(t);if(t.payment)tickets=tickets.filter(row=>row!==t);render();},
 onModeChange(kind){if(openedTicket)updateTicketUrl(openedTicket,kind);},
 onBack(){if(openedTicket?.payment){location.href='pos-completed-services.html';return;}openedTicket=null;updateTicketUrl(null);$('#tickets-view').hidden=false;render();}
});
function updateTicketUrl(ticket,kind,historyMode='push'){
 const url=new URL(window.location.href);
 if(ticket){url.searchParams.set('ticketId',ticketKey(ticket));url.searchParams.set('mode',kind);url.searchParams.delete('view');}
 else{url.searchParams.delete('ticketId');url.searchParams.delete('mode');}
 if(url.href!==window.location.href)window.history[historyMode==='replace'?'replaceState':'pushState'](window.history.state,'',url.href);
}
function restoreTicketUrl(){
 const url=new URL(window.location.href),id=url.searchParams.get('ticketId'),kind=url.searchParams.get('mode');
 ticketView=ticketViewFromUrl();applyTicketView();
 const dialog=$('#ticket-workspace dialog');if(dialog?.open)dialog.close();
 $('#ticket-workspace').hidden=true;openedTicket=null;
 $('#tickets-view').hidden=url.searchParams.get('view')==='overview';
 if(!id&&!kind)return;
 const ticket=ticketRecords.find(t=>ticketKey(t)===id&&!t.cancelled);
 if(ticket&&['edit','checkout'].includes(kind)){open(kind,ticket,'replace');return;}
 updateTicketUrl(null,undefined,'replace');$('#tickets-view').hidden=false;$('#overview-view').hidden=true;
 feedback('This ticket is not available or the ticket link is invalid.');
}
function field(label,name,value='',type='text',required=false){return '<label>'+label+'<input name="'+name+'" type="'+type+'" value="'+esc(value)+'"'+(required?' required':'')+'></label>';}
async function open(kind,ticket,historyMode='push'){
 if(!visibleFor(ticket))return;
 if(kind==='cancel'){
  if(!['owner','manager','cashier'].includes(demo.account().role))return;
  const confirmation=await Swal.fire({title:'Cancel ticket #'+ticket.id+'?',text:ticket.customer+' will be removed from the active queue. The ticket history is retained.',input:'text',inputLabel:'Required reason',inputPlaceholder:'Why is this ticket cancelled?',showCancelButton:true,confirmButtonText:'Yes, cancel ticket',confirmButtonColor:'#b42318',customClass:{popup:'pos-swal'},preConfirm:value=>{if(value.trim().length<5){Swal.showValidationMessage('Enter a reason of at least 5 characters.');return false;}return value.trim();}});
  if(!confirmation.isConfirmed||!await demo.approve('cancel','Ticket '+ticket.id,{force:ticket.status!=='waiting',label:'Cancel ticket'}))return;
  const started=ticket.status!=='waiting';ticket.cancelled=true;ticket.cancelReason=confirmation.value;ticket.cancelledAt=new Date().toISOString();stations.release(ticket,started);tickets=tickets.filter(t=>t!==ticket);persistWorkspace(ticket);render();feedback('Ticket cancelled. History retained.');return;
 }
 if(ticket.splitBills&&!['edit','checkout'].includes(kind))return;
 if(['edit','checkout'].includes(kind)){
  kind=ticket.splitBills||ticket.payment?'checkout':kind;
  openedTicket=ticket;updateTicketUrl(ticket,kind,historyMode);
  $('#tickets-view').hidden=true;$('#overview-view').hidden=true;workspace.open(ticket,kind);syncNavigation();return;
 }
 selected=ticket;action=kind;$('#ticket-form').reset();$('#ticket-error').textContent='';$('#ticket-submit').hidden=false;$('#ticket-submit').textContent='Save';
 let title='',content='';
 if(kind==='assign'){
  title=ticket.tech?'Reassign technician':'Assign technician';
  content='<p class="ticket-detail-copy">#'+ticket.id+' '+esc(ticket.customer)+' · Choose an available technician. The first available technician is next in rotation.</p>';
  content+=technicians.map(t=>'<label class="ticket-choice"><input type="radio" name="technician" value="'+esc(t.name)+'" required'+(ticket.tech===t.name?' checked':'')+(t.status!=='available'&&ticket.tech!==t.name?' disabled':'')+'><span><strong>'+esc(t.name)+'</strong><small>'+esc(t.detail)+'</small></span></label>').join('');
  content+='<label>Reason for skipping the next turn<select name="reason"><option value="">Select a reason if needed</option><option>Customer request</option><option>Skill match</option><option>Technician unavailable</option><option>Consultation</option></select></label>'+stations.pickerHtml(ticket)+'<label>Note for technician<textarea name="note" placeholder="Add an assignment note"></textarea></label><label class="ticket-choice"><input type="checkbox" name="print">Print service ticket after assigning</label>';
  $('#ticket-submit').textContent='Review & Send';

 }
 $('#ticket-dialog-title').textContent=title;$('#ticket-dialog-content').innerHTML=content;$('#ticket-dialog').showModal();
}
$('#ticket-filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b){filter=b.dataset.filter;render();}});
document.querySelector('.ticket-view-switch').addEventListener('click',e=>{
 const button=e.target.closest('[data-ticket-view]');if(!button||button.dataset.ticketView===ticketView)return;
 ticketView=button.dataset.ticketView;
 try{localStorage.setItem(ticketViewKey,ticketView);}catch(_){}
 const url=new URL(window.location.href);url.searchParams.set('ticketView',ticketView);window.history.replaceState(window.history.state,'',url.href);
 applyTicketView();
});
$('#family-checkin-groups').addEventListener('click',e=>{const link=e.target.closest('[data-family-ticket]');if(!link)return;const t=ticketRecords.find(t=>ticketKey(t)===link.dataset.familyTicket&&!t.cancelled);if(t){e.preventDefault();open(t.payment?'checkout':'edit',t);}});
$('#ticket-body').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const t=tickets.find(t=>t.id===Number(b.dataset.id));if(!t)return;if(b.dataset.action==='start'){try{const gate=String(t.tech).split(',').map(n=>stations.gate(n.trim())).find(Boolean);if(gate)throw new Error('Confirm '+gate.code+' clean before the next Beep.');stations.start(t);}catch(error){feedback(error.message);return;}t.status='in-service';if(t.lines)t.lines.forEach(l=>{if(l.tech&&l.status!=='completed')l.status='in-service';});persistWorkspace(t);render();feedback('Service started for '+t.customer);return;}open(b.dataset.action,t);});
document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>$('#ticket-dialog').close()));
$('#ticket-form').addEventListener('submit',e=>{
 e.preventDefault();const data=new FormData(e.currentTarget),t=selected;if(!t)return;

 if(action==='assign'){
  const name=data.get('technician'),tech=technicians.find(tech=>tech.name===name),first=technicians.find(tech=>tech.status==='available');
  if(!tech){$('#ticket-error').textContent='Choose a technician.';return;}
  if(first&&name!==first.name&&!data.get('reason')){$('#ticket-error').textContent='Select a reason for skipping the next turn.';return;}
  const gate=stations.gate(name);if(gate){$('#ticket-error').textContent='Confirm '+gate.code+' clean before sending the next Beep.';return;}
  try{stations.hold(t,String(data.get('stationCode') || ''),name);}catch(error){$('#ticket-error').textContent=error.message;return;}
  t.tech=name;t.location=t.stationCode || '';if(data.get('note').trim())t.techNote=data.get('note').trim();if(t.lines)t.lines.forEach(l=>{l.tech=name;if(l.status==='unassigned')l.status='assigned';});
  if(data.get('print')){
   const popup=window.open('','_blank','width=440,height=640');
   if(popup){popup.document.write('<!doctype html><title>Service Ticket</title><h1>Ticket #'+t.id+'</h1><p>'+esc(t.customer)+'</p><p>'+esc(t.tech)+' · '+esc(t.location)+'</p><p>'+t.services.map(esc).join('<br>')+'</p><p>'+esc(t.techNote)+'</p>');popup.document.close();popup.print();}
   else feedback('Technician assigned. Allow popups to print the service ticket.');
  }
 }
 if(action!=='assign'||!data.get('print'))feedback('Ticket updated.');
 persistWorkspace(t);$('#ticket-dialog').close();render();
});
window.NEXORA_FRONT_DESK_TICKETS={active:()=>tickets.filter(visibleFor),rows:filteredTickets,syncNavigation,filters:()=>({status:filter,station:stationFilter}),setStationFilter(code){stationFilter=code;render();},open,save(t){persistWorkspace(t);render();},feedback};
window.addEventListener('nexora:stations-changed',render);
window.addEventListener('nexora:pos-account-changed',()=>{if(openedTicket){openedTicket=null;$('#ticket-workspace').hidden=true;$('#tickets-view').hidden=false;updateTicketUrl(null);}if($('#ticket-dialog').open)$('#ticket-dialog').close();render();});
render();restoreTicketUrl();
window.addEventListener('popstate',restoreTicketUrl);
window.addEventListener('storage',e=>{
 if(e.key!==workspaceStorageKey)return;
 try{savedWorkspaces=JSON.parse(e.newValue || '{}');ticketRecords.forEach(t=>{const saved=savedWorkspaces[ticketKey(t)];if(saved)Object.assign(t,saved);});tickets=ticketRecords.filter(t=>!t.payment&&!t.cancelled);if(openedTicket){if(openedTicket.cancelled){openedTicket=null;$('#ticket-workspace').hidden=true;$('#tickets-view').hidden=false;}else workspace.open(openedTicket,openedTicket.payment?'checkout':'edit');}render();feedback('Ticket progress updated from the staff app.');}catch(_){feedback('Unable to read the latest ticket progress.');}
});
})();
