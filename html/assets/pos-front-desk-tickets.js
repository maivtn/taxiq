/* Tickets content adapted from the supplied Front Desk prototype. Demo state stays on this page. */
(function () {
'use strict';
let tickets=[
 {id:7,customer:'Quan',phone:'(555) 012-2807',time:'8:49 AM',status:'waiting',tech:'',services:['Milk and Honey Pedicure'],wait:28},
 {id:9,customer:'Brian',phone:'(555) 016-1092',time:'9:16 AM',status:'waiting',tech:'',services:['Milk and Honey Pedicure'],wait:17},
 {id:1,customer:'DJ',phone:'(555) 019-5421',time:'10:56 AM',status:'in-service',tech:'Chloe',services:['Acrylic with Polish (Full Set)','Paris Pearl Pedicure'],wait:0},
 {id:8,customer:'Leo',phone:'(555) 017-8804',time:'9:07 AM',status:'waiting',tech:'Kayla Bui, Lana VMM',services:['Paris Pearl Pedicure','Eyebrow Waxing','Dipping Powder'],wait:25}
];
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
    else if(t.status==='in-service')actions+=button('Reassign','assign',t.id)+button('Checkout','checkout',t.id,'checkin');
    else actions+=(t.tech?button('Reassign','assign',t.id)+button('Start Service','start',t.id,'checkin'):button('Assign Tech','assign',t.id))+button('Cancel','cancel',t.id,'cancel');
    return '<tr><td><span class="ticket-number">#'+t.id+'</span></td><td><strong>'+esc(t.customer)+'</strong><small>'+esc(t.phone)+'</small></td><td>'+esc(t.time)+'</td><td><span class="chip status '+t.status+'">'+labels[t.status]+'</span>'+(!t.services.length?'<span class="ticket-needed">● NEEDS SERVICE</span>':t.status==='waiting'&&!t.tech?'<span class="ticket-needed">● NEEDS TECHNICIAN</span>':'')+'</td><td>'+esc(t.tech||'—')+(t.location?'<small>'+esc(t.location)+'</small>':'')+(t.techNote?'<small title="'+esc(t.techNote)+'">Tech note</small>':'')+'</td><td>'+t.services.map(s=>'<span class="chip">'+esc(s)+'</span>').join(' ')+'</td><td>'+(t.status==='waiting'?'<span class="wait-time">'+t.wait+' min</span>':'—')+'</td><td><div class="actions">'+actions+'</div></td></tr>';
  }).join('');
}
function field(label,name,value='',type='text',required=false){return '<label>'+label+'<input name="'+name+'" type="'+type+'" value="'+esc(value)+'"'+(required?' required':'')+'></label>';}
function open(kind,ticket){
 selected=ticket;action=kind;$('#ticket-form').reset();$('#ticket-error').textContent='';$('#ticket-submit').hidden=false;$('#ticket-submit').textContent='Save';
 let title='',content='';
 if(kind==='cancel'){
  title='Cancel this ticket?';content='<p>'+esc(ticket.customer)+' will be removed from the active service queue.</p>';$('#ticket-submit').textContent='Cancel ticket';
 }else if(kind==='edit'){
  title='Edit ticket #'+ticket.id;content=field('Customer','customer',ticket.customer,'text',true)+field('Phone','phone',ticket.phone,'tel',true)+'<label>Services — one per line<textarea name="services">'+esc(ticket.services.join('\n'))+'</textarea></label>';
 }else if(kind==='assign'){
  title=ticket.tech?'Reassign technician':'Assign technician';
  content='<p class="ticket-detail-copy">#'+ticket.id+' '+esc(ticket.customer)+' · Choose an available technician. The first available technician is next in rotation.</p>';
  content+=technicians.map(t=>'<label class="ticket-choice"><input type="radio" name="technician" value="'+esc(t.name)+'" required'+(ticket.tech===t.name?' checked':'')+(t.status!=='available'&&ticket.tech!==t.name?' disabled':'')+'><span><strong>'+esc(t.name)+'</strong><small>'+esc(t.detail)+'</small></span></label>').join('');
  content+='<label>Reason for skipping the next turn<select name="reason"><option value="">Select a reason if needed</option><option>Customer request</option><option>Skill match</option><option>Technician unavailable</option><option>Consultation</option></select></label><label>Service location<select name="locationType"><option>Spa Chair</option><option>Nail Table</option><option>Room</option><option>Other</option></select></label>'+field('Chair / table number','locationNumber','','text',true)+'<label>Note for technician<textarea name="note">'+esc(ticket.techNote||'')+'</textarea></label><label class="ticket-choice"><input type="checkbox" name="print">Print service ticket after assigning</label>';
  $('#ticket-submit').textContent='Assign technician';
 }else if(kind==='checkout'){
  title='Complete service details';content='<p class="ticket-detail-copy">#'+ticket.id+' '+esc(ticket.customer)+' · '+esc(ticket.tech)+'<br>Save what was used before taking payment.</p>'+field('Product photo','photo','','file')+field('Brand','brand','','text',true)+field('Color name','colorName')+field('Color code','colorCode','','text',true)+'<label>Powder type<select name="powder"><option>Not used</option><option>SNS Clear</option><option>SNS Pink</option><option>Acrylic Clear</option><option>Acrylic Pink</option></select></label><label>Shape<select name="shape"><option>Not applicable</option><option>Almond</option><option>Square</option><option>Coffin</option><option>Oval</option></select></label><label>Length<select name="length"><option>Not applicable</option><option>Short</option><option>Medium</option><option>Long</option></select></label><label>Technician notes<textarea name="notes"></textarea></label>';
  $('#ticket-submit').textContent='Save service details';
 }
 $('#ticket-dialog-title').textContent=title;$('#ticket-dialog-content').innerHTML=content;$('#ticket-dialog').showModal();
}
$('#ticket-filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b){filter=b.dataset.filter;render();}});
$('#ticket-body').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const t=tickets.find(t=>t.id===Number(b.dataset.id));if(!t)return;if(b.dataset.action==='start'){t.status='in-service';render();feedback('Service started for '+t.customer);return;}open(b.dataset.action,t);});
document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>$('#ticket-dialog').close()));
$('#ticket-form').addEventListener('submit',e=>{
 e.preventDefault();const data=new FormData(e.currentTarget),t=selected;if(!t)return;
 if(action==='edit'){if(!data.get('customer').trim()||!data.get('phone').trim()){ $('#ticket-error').textContent='Customer and phone are required.';return;}t.customer=data.get('customer').trim();t.phone=data.get('phone').trim();t.services=data.get('services').split('\n').map(s=>s.trim()).filter(Boolean);}
 if(action==='cancel')tickets=tickets.filter(row=>row.id!==t.id);
 if(action==='assign'){
  const name=data.get('technician'),tech=technicians.find(tech=>tech.name===name),first=technicians.find(tech=>tech.status==='available');
  if(!tech){$('#ticket-error').textContent='Choose a technician.';return;}
  if(first&&name!==first.name&&!data.get('reason')){$('#ticket-error').textContent='Select a reason for skipping the next turn.';return;}
  const location=data.get('locationType')+' #'+data.get('locationNumber').trim();
  if(!data.get('locationNumber').trim()){$('#ticket-error').textContent='Enter a chair or table number.';return;}
  if(tickets.some(row=>row.id!==t.id&&row.status==='in-service'&&row.location===location)){$('#ticket-error').textContent='This service location is occupied.';return;}
  t.tech=name;t.location=location;t.techNote=data.get('note').trim();
  if(data.get('print')){
   const popup=window.open('','_blank','width=440,height=640');
   if(popup){popup.document.write('<!doctype html><title>Service Ticket</title><h1>Ticket #'+t.id+'</h1><p>'+esc(t.customer)+'</p><p>'+esc(t.tech)+' · '+esc(t.location)+'</p><p>'+t.services.map(esc).join('<br>')+'</p><p>'+esc(t.techNote)+'</p>');popup.document.close();popup.print();}
   else feedback('Technician assigned. Allow popups to print the service ticket.');
  }
 }
 if(action==='checkout'){
  if(!data.get('brand').trim()||!data.get('colorCode').trim()){$('#ticket-error').textContent='Brand and color code are required.';return;}
  t.serviceRecord=Object.fromEntries(data);feedback('Service details saved for '+t.customer+'. Payment is not processed in this prototype.');
 }else if(action!=='assign'||!data.get('print'))feedback(action==='cancel'?'Ticket removed from queue.':'Ticket updated.');
 $('#ticket-dialog').close();render();
});
render();
})();
