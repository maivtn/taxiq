/* Tickets content adapted from the supplied Front Desk prototype. Demo state stays on this page. */
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
 let nextId=Math.max(...tickets.map(t=>t.id));
 appointmentStore.loadAll().filter(r=>r.status==='checked-in'&&r.metadata?.estimate).forEach(r=>{
  tickets.push({id:++nextId,bookingId:r.id,customer:r.customerName,phone:r.phone,
   time:new Date(r.metadata.checkedInAt || r.startAt).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),
   status:'waiting',tech:'',services:r.serviceNames,lines:r.tickets.map(l=>({id:l.id,serviceId:l.serviceId,name:l.serviceName,price:l.price,tech:l.technicianName==='Anyone'?'':l.technicianName,status:l.technicianId?'assigned':'unassigned'})),
   wait:Math.max(0,Math.floor((Date.now()-new Date(r.metadata.checkedInAt || r.startAt).getTime())/60000)),estimateNote:r.note});
 });
}
const technicians=[
 {name:'Kayla Bui',level:2,status:'available',turns:4,serviceCount:6,sales:180,minutes:205,codes:['PED','GEL','WAX'],commission:.6,dailyIncomeGoal:150,detail:'Available now · Nails & pedicure'},
 {name:'Lana VMM',level:3,status:'available',turns:4,serviceCount:4,sales:430,minutes:278,codes:['ACR-FS','REF','DIP'],commission:.6,dailyIncomeGoal:220,detail:'Available now · All services'},
 {name:'Chloe',level:3,status:'busy',turns:3,serviceCount:5,sales:365,minutes:250,codes:['MANI','GEL','PED'],commission:.6,dailyIncomeGoal:240,detail:'Busy · About 18 min remaining'},
 {name:'Mia',level:1,status:'clocked-out',turns:2,serviceCount:3,sales:155,minutes:120,codes:['MANI','WAX'],commission:.55,dailyIncomeGoal:120,detail:'Clocked out'}
];
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={'not-arrived':'Not Arrived',waiting:'Waiting','in-service':'In Service'};
let filter='all',selected=null,action='';
const feedback=message=>{$('#feedback').textContent=message;};
function button(label,kind,id,extra=''){return '<button type="button" data-action="'+kind+'" data-id="'+id+'" class="'+extra+'">'+label+'</button>';}
function render(){
  $('#ticket-nav-count').textContent=tickets.length;
  $('#ticket-filters').innerHTML=[['all','All'],...Object.entries(labels)].map(([key,label])=>'<button type="button" data-filter="'+key+'" class="'+(filter===key?'active':'')+'" aria-pressed="'+(filter===key)+'">'+label+' ('+tickets.filter(t=>key==='all'||t.status===key).length+')</button>').join('');
  const waiting=tickets.filter(t=>t.status==='waiting'&&!t.tech).length;
  $('#assignment-alert').hidden=!waiting;$('#assignment-alert').textContent='● '+waiting+' '+(waiting===1?'guest':'guests')+' awaiting technician assignment';
  const rows=tickets.filter(t=>filter==='all'||t.status===filter);
  $('#ticket-empty').hidden=rows.length>0;
  $('#ticket-body').innerHTML=rows.map(t=>{
    let actions=button('Edit','edit',t.id);
    if(!t.services.length)actions+=button('Add Service','edit',t.id)+button('Consultation','assign',t.id)+button('Cancel','cancel',t.id,'cancel');
    else if(t.status==='in-service')actions+=(t.splitBills?'':button('Reassign','assign',t.id))+button('Checkout','checkout',t.id,'checkin');
    else actions+=(t.tech?button('Reassign','assign',t.id)+button('Start Service','start',t.id,'checkin'):button('Assign Tech','assign',t.id))+button('Cancel','cancel',t.id,'cancel');
    return '<tr><td><span class="ticket-number">#'+t.id+'</span></td><td><strong>'+esc(t.customer)+'</strong><small>'+esc(t.phone)+'</small></td><td>'+esc(t.time)+'</td><td><span class="chip status '+t.status+'">'+labels[t.status]+'</span>'+(t.splitBills?'<small>'+t.splitBills.bills.filter(b=>b.payment).length+'/'+t.splitBills.bills.length+' bills paid</small>':'')+(!t.services.length?'<span class="ticket-needed">● NEEDS SERVICE</span>':t.status==='waiting'&&!t.tech?'<span class="ticket-needed">● NEEDS TECHNICIAN</span>':'')+'</td><td>'+esc(t.tech||'—')+(t.location?'<small>'+esc(t.location)+'</small>':'')+(t.techNote?'<small title="'+esc(t.techNote)+'">Tech note</small>':'')+'</td><td>'+t.services.map(s=>'<span class="chip">'+esc(s)+'</span>').join(' ')+(t.estimateNote?'<small>'+esc(t.estimateNote)+'</small>':'')+'</td><td>'+(t.status==='waiting'?'<span class="wait-time">'+t.wait+' min</span>':'—')+'</td><td><div class="actions">'+actions+'</div></td></tr>';
  }).join('');
}
const workspace=window.NEXORA_TICKET_WORKSPACE.mount($('#ticket-workspace'),{
 catalog:()=>window.NEXORA_SALON_DATA ? window.NEXORA_SALON_DATA.loadCatalog().services : [],
 technicians:()=>technicians,
 onChange(t){if(t.payment)tickets=tickets.filter(row=>row!==t);render();},
 onBack(){$('#tickets-view').hidden=false;render();}
});
function field(label,name,value='',type='text',required=false){return '<label>'+label+'<input name="'+name+'" type="'+type+'" value="'+esc(value)+'"'+(required?' required':'')+'></label>';}
function open(kind,ticket){
 if(ticket.splitBills&&!['edit','checkout'].includes(kind))return;
 if(['edit','checkout'].includes(kind)){$('#tickets-view').hidden=true;workspace.open(ticket,kind);return;}
 selected=ticket;action=kind;$('#ticket-form').reset();$('#ticket-error').textContent='';$('#ticket-submit').hidden=false;$('#ticket-submit').textContent='Save';
 let title='',content='';
 if(kind==='cancel'){
  title='Cancel this ticket?';content='<p>'+esc(ticket.customer)+' will be removed from the active service queue.</p>';$('#ticket-submit').textContent='Cancel ticket';
 }else if(kind==='assign'){
  title=ticket.tech?'Reassign technician':'Assign technician';
  content='<p class="ticket-detail-copy">#'+ticket.id+' '+esc(ticket.customer)+' · Choose an available technician. The first available technician is next in rotation.</p>';
  content+=technicians.map(t=>'<label class="ticket-choice"><input type="radio" name="technician" value="'+esc(t.name)+'" required'+(ticket.tech===t.name?' checked':'')+(t.status!=='available'&&ticket.tech!==t.name?' disabled':'')+'><span><strong>'+esc(t.name)+'</strong><small>'+esc(t.detail)+'</small></span></label>').join('');
  content+='<label>Reason for skipping the next turn<select name="reason"><option value="">Select a reason if needed</option><option>Customer request</option><option>Skill match</option><option>Technician unavailable</option><option>Consultation</option></select></label><label>Service location<select name="locationType"><option>Spa Chair</option><option>Nail Table</option><option>Room</option><option>Other</option></select></label>'+field('Chair / table number','locationNumber','','text',true)+'<label>Note for technician<textarea name="note">'+esc(ticket.techNote||'')+'</textarea></label><label class="ticket-choice"><input type="checkbox" name="print">Print service ticket after assigning</label>';
  $('#ticket-submit').textContent='Assign technician';

 }
 $('#ticket-dialog-title').textContent=title;$('#ticket-dialog-content').innerHTML=content;$('#ticket-dialog').showModal();
}
$('#ticket-filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b){filter=b.dataset.filter;render();}});
$('#ticket-body').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const t=tickets.find(t=>t.id===Number(b.dataset.id));if(!t)return;if(b.dataset.action==='start'){t.status='in-service';if(t.lines)t.lines.forEach(l=>{if(l.status!=='completed')l.status='in-service';});render();feedback('Service started for '+t.customer);return;}open(b.dataset.action,t);});
document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>$('#ticket-dialog').close()));
$('#ticket-form').addEventListener('submit',e=>{
 e.preventDefault();const data=new FormData(e.currentTarget),t=selected;if(!t)return;

 if(action==='cancel')tickets=tickets.filter(row=>row.id!==t.id);
 if(action==='assign'){
  const name=data.get('technician'),tech=technicians.find(tech=>tech.name===name),first=technicians.find(tech=>tech.status==='available');
  if(!tech){$('#ticket-error').textContent='Choose a technician.';return;}
  if(first&&name!==first.name&&!data.get('reason')){$('#ticket-error').textContent='Select a reason for skipping the next turn.';return;}
  const location=data.get('locationType')+' #'+data.get('locationNumber').trim();
  if(!data.get('locationNumber').trim()){$('#ticket-error').textContent='Enter a chair or table number.';return;}
  if(tickets.some(row=>row.id!==t.id&&row.status==='in-service'&&row.location===location)){$('#ticket-error').textContent='This service location is occupied.';return;}
  t.tech=name;t.location=location;t.techNote=data.get('note').trim();if(t.lines)t.lines.forEach(l=>{l.tech=name;if(l.status==='unassigned')l.status='assigned';});
  if(data.get('print')){
   const popup=window.open('','_blank','width=440,height=640');
   if(popup){popup.document.write('<!doctype html><title>Service Ticket</title><h1>Ticket #'+t.id+'</h1><p>'+esc(t.customer)+'</p><p>'+esc(t.tech)+' · '+esc(t.location)+'</p><p>'+t.services.map(esc).join('<br>')+'</p><p>'+esc(t.techNote)+'</p>');popup.document.close();popup.print();}
   else feedback('Technician assigned. Allow popups to print the service ticket.');
  }
 }
 if(action!=='assign'||!data.get('print'))feedback(action==='cancel'?'Ticket removed from queue.':'Ticket updated.');
 $('#ticket-dialog').close();render();
});
render();
})();
