(function(){
'use strict';
if(window.NEXORA_FRONT_DESK_REDIRECTING)return;
const store=window.NEXORA_SERVICE_ASSIGNMENTS,root=document.querySelector('#service-assignments');
if(!store||!root)return;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'$'+Number(n).toFixed(2);
let selected=new URLSearchParams(location.search).get('ticket')||'',busy=false;
let mode=new URLSearchParams(location.search).get('section')||'tickets',category='All',search='';
const drafts=new Map(),checkoutDrafts=new Map();
const list=root.querySelector('[data-assignment-list]'),detail=root.querySelector('[data-assignment-detail]'),feedback=root.querySelector('[data-assignment-feedback]');
function render(){
 const state=store.load();
 const ticket=state.tickets.find(t=>t.id===selected);
 if(selected&&!ticket){list.hidden=true;detail.hidden=false;detail.innerHTML='<a class="assignment-back" href="pos-front-desk-tickets.html" data-assignment-back>← Back to tickets</a><h2>Ticket not found</h2><p>This ticket is not available in this browser.</p>';return;}
 list.hidden=!!ticket;detail.hidden=!ticket;
 const queue=store.queue(state);
 root.querySelector('[data-assignment-turns]').innerHTML=queue.length?queue.map((tech,i)=>'<span class="assignment-turn"><strong>#'+(i+1)+' '+esc(tech.name)+'</strong><small>'+tech.turns+'T'+(i===0?' · Next':'')+'</small></span>').join(''):'<span>No available technician — waiting for services to complete.</span>';
 if(!ticket){
 list.innerHTML='<div class="assignment-heading"><div><h2>Tickets</h2><p>Assign services and follow your team’s progress.</p></div><span>'+state.tickets.length+' tickets</span></div><div class="assignment-table"><table><thead><tr><th>#</th><th>Customer</th><th>Check-in</th><th>Services</th><th>Status</th><th>Action</th></tr></thead><tbody>'+state.tickets.map(t=>{
   const status=store.ticketStatus(t),assigned=t.services.filter(s=>s.techId).length,techs=new Set(t.services.map(s=>s.techId).filter(Boolean)).size;
   const action=status==='Needs service'?'Add services':status==='Needs assignment'?'Assign':status==='Ready to send'?'Review & Send':status==='Checkout pending'?'Checkout':status==='Completed'?'View receipt':'View progress';
   const summary=!t.services.length?'No services selected':t.services.length+' service'+(t.services.length===1?'':'s')+' · '+(t.services.some(s=>s.status!=='not-sent')?techs+' techs':assigned+'/'+t.services.length+' assigned');
   return '<tr><td><strong>'+t.number+'</strong></td><td><strong>'+esc(t.customer)+'</strong><small class="assignment-customer">'+(t.newCustomer?'New Customer':'Returning Customer')+'</small></td><td>'+t.time+'</td><td>'+summary+'</td><td><span class="assignment-status">'+status+'</span></td><td><button class="primary" data-open-assignment="'+t.id+'">'+esc(action)+'</button></td></tr>';
 }).join('')+'</tbody></table></div>';return;
 }
 const paid=!!ticket.payment,checkout=mode==='checkout';
 const subtotal=ticket.services.reduce((n,s)=>n+s.price,0);
 const canSend=ticket.services.length&&!ticket.services.some(s=>!s.techId)&&ticket.services.some(s=>s.status==='not-sent');
 const draft=checkoutDrafts.get(ticket.id)||{tip:0,method:'cash',cash:'',receipt:'none'};
 checkoutDrafts.set(ticket.id,draft);
 const total=Math.round((subtotal+Number(draft.tip||0))*100)/100;
 const catalogHtml='<section class="assignment-card assignment-catalog" data-service-catalog><h3>SERVICES</h3><input data-catalog-search type="search" placeholder="Search services…" aria-label="Search services" value="'+esc(search)+'"><div class="assignment-categories">'+['All',...new Set(store.catalog.map(s=>s.category))].map(c=>'<button data-catalog-category="'+esc(c)+'" class="'+(category===c?'selected':'')+'">'+esc(c)+'</button>').join('')+'</div><div class="assignment-catalog-list">'+store.catalog.filter(s=>(category==='All'||s.category===category)&&s.name.toLowerCase().includes(search.toLowerCase())).map(s=>'<button class="assignment-catalog-item" data-catalog-add="'+s.id+'" '+(paid||store.ticketStatus(ticket)==='Checkout pending'?'disabled':'')+'><small>'+esc(s.category)+'</small><strong>'+esc(s.name)+'</strong><span>'+money(s.price)+' <b>＋</b></span></button>').join('')+'</div></section>';
 const lines=ticket.services.map(s=>{
   const locked=['in-service','completed'].includes(s.status),tech=state.technicians.find(t=>t.id===s.techId),values=drafts.get(s.id)||{technician:s.techId,location:s.location,note:s.note};
   const stamps=[['sentAt','Sent'],['viewedAt','Viewed in app'],['acceptedAt','Accepted'],['startedAt','Started'],['completedAt','Completed']].filter(([key])=>s[key]).map(([key,label])=>label+' · '+new Date(s[key]).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})).join(' → ');
   return '<article class="assignment-line"><div class="assignment-heading"><div><h3>'+esc(s.name)+' <span class="assignment-status is-'+s.status+'">'+store.labels[s.status]+'</span></h3><p>Tech. <strong>'+esc(tech?.name||'Unassigned')+'</strong>'+(s.location?' · '+esc(s.location):'')+'</p></div><strong>'+money(s.price)+'</strong></div>'+(!locked&&!paid?'<details '+(!s.techId||drafts.has(s.id)?'open':'')+'><summary>'+(tech?'Change tech / location':'Assign technician')+'</summary><form data-assign-service="'+s.id+'"><div class="assignment-fields"><label>Technician<select name="technician"><option value="">Select technician</option>'+state.technicians.map(t=>'<option value="'+t.id+'" '+(t.id===values.technician?'selected':'')+'>'+esc(t.name)+'</option>').join('')+'</select></label><label>Customer location<input name="location" placeholder="e.g. Pedicure Chair #4" value="'+esc(values.location)+'"></label><label class="assignment-note">Private note for technician<textarea name="note">'+esc(values.note)+'</textarea></label></div><button type="submit">Save assignment</button></form></details>':'')+'<div class="assignment-line-actions">'+(['sent','viewed'].includes(s.status)?'<button data-resend-assignment="'+s.id+'">Resend</button>':'')+(s.status==='not-sent'?'<details class="assignment-change-service"><summary>Change service</summary><select data-change-service-select="'+s.id+'">'+store.catalog.map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('')+'</select><button data-change-service="'+s.id+'">Apply</button></details><button data-remove-service="'+s.id+'">Remove</button>':'')+(tech&&s.status!=='not-sent'&&!paid?'<a target="_blank" href="staff-work-orders.html?technician='+tech.id+'&assignment='+s.id+'">'+(s.status==='accepted'?'Start Service in app':s.status==='in-service'?'Complete in app':'View in technician app')+' ↗</a>':'')+'</div><small class="assignment-timestamps">'+esc(stamps)+'</small></article>';
 }).join('');
 const note='<form class="assignment-card assignment-ticket-note" data-ticket-note-form><label>NOTE<textarea name="ticketNote" placeholder="Seat, customer preferences, color/powder used…" '+(paid?'disabled':'')+'>'+esc(ticket.note||'')+'</textarea></label>'+(!paid?'<button type="submit">Save note</button>':'')+'</form>';
 const payment=paid?'<section class="assignment-card"><h3>Demo receipt</h3><p>Payment recorded · '+esc(ticket.payment.method)+'</p><p>Tip '+money(ticket.payment.tip)+' · Total <strong>'+money(ticket.payment.total)+'</strong></p><p>Change due '+money(ticket.payment.change)+'</p><p class="assignment-prototype-note">No money was charged. Receipt delivery is simulated.</p></section>':'<section class="assignment-card"><h3>TIP</h3><div class="assignment-tip-options">'+[[0,'No Tip'],[10,'$10'],[15,'$15'],[Math.round(subtotal*10)/100,'10%'],[Math.round(subtotal*20)/100,'20%']].map(([amount,label])=>'<button data-tip="'+amount+'" class="'+(Number(draft.tip)===amount?'selected':'')+'">'+label+'</button>').join('')+'</div><label>Custom tip ($)<input data-payment-field="tip" type="number" min="0" step="0.01" value="'+esc(draft.tip)+'"></label></section><section class="assignment-card"><h3>PAYMENT METHOD</h3><div class="assignment-tip-options">'+[['cash','💵 Cash'],['card','💳 Card'],['gift-card','Gift Card'],['split','Split Pay']].map(([id,label])=>'<button data-payment-method="'+id+'" class="'+(draft.method===id?'selected':'')+'">'+label+'</button>').join('')+'</div>'+(draft.method==='cash'?'<label>Cash received ($)<input data-payment-field="cash" type="number" min="0" step="0.01" value="'+esc(draft.cash)+'" placeholder="'+total.toFixed(2)+'"></label><p>Change due <strong data-change-due>'+money(Math.max(0,Number(draft.cash||0)-total))+'</strong></p>':'<p class="assignment-prototype-note">Demo '+esc(draft.method)+' payment. No payment details are collected or charged.</p>')+'<label>RECEIPT<select data-payment-field="receipt"><option value="none" '+(draft.receipt==='none'?'selected':'')+'>No Receipt</option><option value="sms" '+(draft.receipt==='sms'?'selected':'')+'>Send SMS (demo)</option><option value="print" '+(draft.receipt==='print'?'selected':'')+'>Print</option></select></label></section><section class="assignment-card"><h3>PAYMENT SUMMARY</h3>'+ticket.services.map(s=>'<div class="assignment-total-row"><span>'+esc(s.name)+'</span><span>'+money(s.price)+'</span></div>').join('')+'<div class="assignment-total-row"><span>Tip</span><strong data-tip-summary>'+money(draft.tip)+'</strong></div><div class="assignment-total-row"><strong>TOTAL</strong><strong data-payment-total>'+money(total)+'</strong></div></section><button class="primary assignment-pay" data-demo-pay '+(store.ticketStatus(ticket)!=='Checkout pending'?'disabled':'')+'>Pay · '+money(total)+'</button>'+(store.ticketStatus(ticket)!=='Checkout pending'?'<p class="assignment-help">Complete all services in the technician app before payment.</p>':'');
 detail.innerHTML='<div class="assignment-ticket-title"><a class="assignment-back" href="pos-front-desk-tickets.html" data-assignment-back>← Back</a><h2>Ticket #'+ticket.number+' · '+esc(ticket.customer)+'</h2><span>'+ (checkout?'Checkout':'Assign services')+'</span></div><div class="assignment-workspace">'+catalogHtml+'<div class="assignment-ticket-side"><section class="assignment-card"><h3>TICKET DETAIL ('+ticket.services.length+' services)</h3>'+ (lines||'<p>No services selected. Add a service from the catalog.</p>')+'<div class="assignment-total-row"><strong>ESTIMATED TOTAL</strong><strong>'+money(subtotal)+'</strong></div></section>'+note+(checkout?payment:'<div class="assignment-bottom-actions"><button data-print-assignment>Print Ticket</button><button class="primary" data-send-assignments '+(!canSend?'disabled':'')+'>Assign &amp; Send to App</button></div><button data-open-checkout class="assignment-checkout-link">'+(paid?'View receipt':'Checkout Customer')+' →</button>')+'</div></div>';
 if(checkout&&paid)detail.querySelector('.assignment-ticket-side').insertAdjacentHTML('beforeend','<button data-print-assignment>Print receipt</button>');
}
function section(){
 const params=new URLSearchParams(location.search),requested=params.get('section'),appointments=requested==='appointments'||(!['tickets','assign','checkout'].includes(requested)&&params.has('view'));
 mode=requested||'tickets';
 if(['tickets','assign','checkout'].includes(mode)){const url=new URL(location.href);url.searchParams.delete('view');url.searchParams.delete('tab');history.replaceState(null,'',url);}
 root.hidden=appointments;document.querySelector('#appointments').hidden=!appointments;
 document.querySelectorAll('[data-front-section]').forEach(a=>{const active=(a.dataset.frontSection==='appointments')===appointments;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
}
function navigate(next,id=''){const url=new URL(location.href);url.searchParams.set('section',next);url.searchParams.delete('view');url.searchParams.delete('tab');if(id)url.searchParams.set('ticket',id);else url.searchParams.delete('ticket');history.pushState(null,'',url);selected=id;section();render();}
async function run(task,message){if(busy)return;busy=true;root.setAttribute('aria-busy','true');try{await task();feedback.textContent=message;render();}catch(error){feedback.textContent=error.message;}finally{busy=false;root.removeAttribute('aria-busy');}}
root.addEventListener('submit',event=>{
 const form=event.target.closest('form');if(!form)return;event.preventDefault();const data=new FormData(form);
 if(form.hasAttribute('data-ticket-note-form')){run(()=>store.saveNote(selected,data.get('ticketNote')),'Ticket note saved.');return;}
 if(form.hasAttribute('data-assign-service'))run(async()=>{await store.assign(form.dataset.assignService,data.get('technician'),data.get('location'),data.get('note'));drafts.delete(form.dataset.assignService);},'Assignment saved.');
});
root.addEventListener('input',event=>{
 const input=event.target,form=input.closest('[data-assign-service]');
 if(form)drafts.set(form.dataset.assignService,Object.fromEntries(new FormData(form)));
 if(input.hasAttribute('data-catalog-search')){search=input.value;const position=input.selectionStart;render();const next=root.querySelector('[data-catalog-search]');next.focus();try{next.setSelectionRange(position,position);}catch(_){};}
 if(input.hasAttribute('data-payment-field')){
   const draft=checkoutDrafts.get(selected);draft[input.dataset.paymentField]=input.value;
   if(['tip','cash'].includes(input.dataset.paymentField)){
     const ticket=store.load().tickets.find(t=>t.id===selected),total=Math.round((ticket.services.reduce((n,s)=>n+s.price,0)+Number(draft.tip||0))*100)/100;
     root.querySelector('[data-payment-total]').textContent=money(total);root.querySelector('[data-tip-summary]').textContent=money(draft.tip);
     root.querySelector('[data-demo-pay]').textContent='Pay · '+money(total);
     const change=root.querySelector('[data-change-due]');if(change)change.textContent=money(Math.max(0,Number(draft.cash||0)-total));
   }
 }
});
root.addEventListener('change',event=>{if(event.target.dataset.paymentField==='receipt')checkoutDrafts.get(selected).receipt=event.target.value;});
root.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b||b.disabled||busy)return;
 if(b.hasAttribute('data-open-assignment')){const t=store.load().tickets.find(t=>t.id===b.dataset.openAssignment);navigate(['Checkout pending','Completed'].includes(store.ticketStatus(t))?'checkout':'assign',t.id);}
 if(b.hasAttribute('data-open-checkout'))navigate('checkout',selected);
 if(b.hasAttribute('data-catalog-category')){category=b.dataset.catalogCategory;render();}
 if(b.hasAttribute('data-catalog-add'))run(()=>store.addService(selected,b.dataset.catalogAdd),'Service added. Choose a technician.');
 if(b.hasAttribute('data-send-assignments')){
   if(store.load().tickets.find(t=>t.id===selected).services.some(s=>drafts.has(s.id))){feedback.textContent='Save your assignment changes before sending.';return;}
   run(()=>store.send(selected),'Notifications sent to the assigned technicians.');
 }
 if(b.hasAttribute('data-resend-assignment'))run(()=>store.resend(b.dataset.resendAssignment),'Reminder sent. Service progress is unchanged.');
 if(b.hasAttribute('data-remove-service'))run(async()=>{await store.editService(b.dataset.removeService,'remove');drafts.delete(b.dataset.removeService);},'Service removed.');
 if(b.hasAttribute('data-change-service'))run(()=>store.editService(b.dataset.changeService,'change',root.querySelector('[data-change-service-select="'+b.dataset.changeService+'"]').value),'Service changed. Assign a technician.');
 if(b.hasAttribute('data-tip')){checkoutDrafts.get(selected).tip=Number(b.dataset.tip);render();}
 if(b.hasAttribute('data-payment-method')){checkoutDrafts.get(selected).method=b.dataset.paymentMethod;render();}
 if(b.hasAttribute('data-demo-pay'))run(async()=>{await store.pay(selected,checkoutDrafts.get(selected));if(checkoutDrafts.get(selected).receipt==='print')window.print();},'Demo payment recorded. No money was charged.');
 if(b.hasAttribute('data-print-assignment'))window.print();
});
window.addEventListener('popstate',()=>{selected=new URLSearchParams(location.search).get('ticket')||'';section();render();});
store.subscribe(()=>{try{render();}catch(error){feedback.textContent=error.message;}});
window.addEventListener('focus',()=>{try{render();}catch(error){feedback.textContent=error.message;}});
try{section();render();}catch(error){feedback.textContent=error.message;}
})();
