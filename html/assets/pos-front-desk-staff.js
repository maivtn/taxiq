/* Staff workspace copy and layout adapted from the PO technician workspace. */
(function () {
  'use strict';
  const root=document.querySelector('[data-front-staff]'),data=window.NEXORA_FRONT_DESK_DATA;
  const esc=value=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=value=>'$'+Number(value || 0).toFixed(2);
  const phoneDisplay=value=>{const phone=data.digits(value).slice(0,10);return phone.length>6?'('+phone.slice(0,3)+') '+phone.slice(3,6)+'-'+phone.slice(6):phone.length>3?'('+phone.slice(0,3)+') '+phone.slice(3):phone?'('+phone:'';};
  const icon=name=>'<i data-lucide="'+name+'" aria-hidden="true"></i>';
  let rows=[],techRows=[],techs=[],fullCatalog=[],saving=false,openCustomer=null;
  const state={selectedTech:'',techMode:'new',techNewPhone:'',techNewName:'',techNewStatus:'idle',techNewCategory:'',techNewServiceIndex:'',techCoTech:'',techNewNotice:'',assignCategory:'',assignServiceIndex:'',assignTicketId:'',assignmentNotice:''};
  const activeTickets=()=>rows.filter(ticket=>data.editable(ticket)&&data.visible(ticket)).map(ticket=>({...ticket,name:String(ticket.customer || '').toUpperCase()}));
  const ticketWorkForTech=name=>data.workFor(name,rows).filter(({ticket})=>data.visible(ticket)).map(({ticket,line})=>({ticket:{...ticket,name:String(ticket.customer || '').toUpperCase()},service:line,role:data.names(line)[0]===name?'lead':'with '+data.names(line)[0]}));
  const statusLabel=name=>({busy:'Working',assigned:'Assigned','clocked-out':'Clocked out',paused:'Paused',available:'Available'}[data.statusFor(techRows.find(tech=>tech.name===name),rows)]);
  const catalogChoices=category=>fullCatalog.map((item,index)=>({item,index})).filter(({item})=>item.category===category&&data.canAssign(state.selectedTech,item));
  function rememberTechnician(){
    const url=new URL(location.href);url.searchParams.set('technician',state.selectedTech);history.replaceState(null,'',url);
    try{sessionStorage.setItem('nexora:front-desk-staff-technician',state.selectedTech);}catch(_){}
  }
  function refreshData(){
    const newServiceId=fullCatalog[Number(state.techNewServiceIndex)]?.id,existingServiceId=fullCatalog[Number(state.assignServiceIndex)]?.id;
    rows=data.all();techRows=data.technicians();
    techs=techRows.filter(tech=>data.canOperate()||tech.name===window.NEXORA_POS_DEMO.account().name).map(tech=>tech.name);
    const catalog=window.NEXORA_SALON_DATA.loadCatalog();
    fullCatalog=catalog.services.filter(service=>service.active!==false&&service.type!=='add-on'&&catalog.categories.find(category=>category.id===service.categoryId)?.kind!=='add-on').map(service=>({...service,category:service.categoryName || service.requiredSkill,duration:service.durationMin}));
    if(state.techNewServiceIndex!==''){const index=fullCatalog.findIndex(service=>service.id===newServiceId);state.techNewServiceIndex=index<0?'':String(index);}
    if(state.assignServiceIndex!==''){const index=fullCatalog.findIndex(service=>service.id===existingServiceId);state.assignServiceIndex=index<0?'':String(index);}
    const categories=[...new Set(fullCatalog.map(service=>service.category))];
    if(!techs.includes(state.selectedTech))state.selectedTech=techs[0] || '';
    const firstEligible=fullCatalog.find(service=>data.canAssign(state.selectedTech,service))?.category || categories[0] || '';
    if(!categories.includes(state.techNewCategory))state.techNewCategory=firstEligible;
    if(!categories.includes(state.assignCategory))state.assignCategory=firstEligible;
    if(state.selectedTech)rememberTechnician();
    if(openCustomer)openCustomer=rows.find(ticket=>data.keyOf(ticket)===data.keyOf(openCustomer)) || null;
  }
  function technicianGuestResultHtml(){if(state.techNewStatus==='existing')return `<div class="tech-guest-result found">
      <strong>Returning customer: ${esc(state.techNewName)}</strong>
      <span>Name loaded from phone lookup.</span>
      </div>`;if(state.techNewStatus==='new')return `<div class="tech-guest-result new">
      <strong>New customer</strong>
      <span>Enter their name before creating the ticket.</span>
      <label for="tech-guest-name">Customer name · required</label>
      <input class="input" id="tech-guest-name" autocomplete="off" value="${esc(state.techNewName)}" placeholder="First and last name">
      </div>`;return `<p class="hint">Demo lookup: 202-555-0101 is a returning customer; another phone creates a new customer.</p>`}
  function techNewTicketHtml(categories){const service=state.techNewServiceIndex!==''?fullCatalog[Number(state.techNewServiceIndex)]:null;return `<div class="tech-flow-steps">
      <span>
      <b>1</b> Customer</span>
      <span>
      <b>2</b> Service & team</span>
      <span>
      <b>3</b> Ticket or checkout</span>
      </div>
      <div class="tech-flow-grid">
      <div class="tech-flow-section">
      <h4>Customer</h4>
      <label for="tech-guest-phone">Phone number · required</label>
      <div class="tech-phone-row">
      <input class="input" id="tech-guest-phone" inputmode="tel" autocomplete="off" value="${esc(phoneDisplay(state.techNewPhone))}" placeholder="(000) 000-0000">
      <button type="button" class="btn btn-secondary" data-action="tech-lookup-guest">Find customer</button>
      </div>
      <div id="tech-guest-result" aria-live="polite">${technicianGuestResultHtml()}</div>
      </div>
      <div class="tech-flow-section">
      <h4>Service by ${esc(state.selectedTech)}</h4>
      <div class="tech-field-pair">
      <div class="form-field">
      <label for="tech-new-category">Category</label>
      <select class="select" id="tech-new-category">${categories.map(category=>`<option value="${esc(category)}" ${state.techNewCategory===category?'selected':''}>${esc(category)}</option>`).join('')}</select>
      </div>
      <div class="form-field">
      <label for="tech-new-service">Service</label>
      <select class="select" id="tech-new-service">
      <option value="">Choose service</option>${catalogChoices(state.techNewCategory).map(({item,index})=>`<option value="${index}" ${String(state.techNewServiceIndex)===String(index)?'selected':''}>${esc(item.name)} · ${money(item.price)}</option>`).join('')}</select>
      </div>
      </div>
      <div class="form-field">
      <label for="tech-co-worker">Working together with</label>
      <select class="select" id="tech-co-worker">
      <option value="">No second technician</option>${techs.filter(tech=>tech!==state.selectedTech&&service&&data.canAssign(tech,service)).map(tech=>`<option value="${esc(tech)}" ${state.techCoTech===tech?'selected':''}>${esc(tech)} · same service</option>`).join('')}</select>
      <p class="hint">A shared service is charged once. Both technicians appear on the ticket and in tip allocation.</p>
      </div>
      </div>
      </div>
      <div class="tech-checkout-footer">
      <div class="tech-new-preview">
      <div>
      <small>TICKET PREVIEW</small>
      <strong id="tech-guest-preview">${esc(state.techNewName||'Customer not selected')}</strong>
      <span>${esc(state.selectedTech)}${state.techCoTech?` + ${esc(state.techCoTech)}`:''}</span>
      </div>
      <div>
      <strong>${service?esc(service.name):'Choose a service'}</strong>
      <b>${service?money(service.price):'$0.00'}</b>
      </div>
      </div>
      <div class="tech-checkout-actions">
      <p class="tech-assign-feedback" role="status">${esc(state.techNewNotice)}</p>
      <div class="tech-new-actions">
      <button type="button" class="btn btn-secondary" data-action="tech-create-ticket">Create ticket</button>
      <button type="button" class="btn btn-primary" data-action="tech-create-checkout">Create ticket & checkout →</button>
      </div>
      <p class="tech-prototype-note">No check-in is required. Discounts, add-ons, tip, and payment choice remain editable at checkout.</p>
      </div>
      </div>`}
  function techExistingTicketHtml(categories){const available=catalogChoices(state.assignCategory);return `<div class="tech-assign-title">
      <span class="tech-panel-kicker">EXISTING TICKET</span>
      <h3>Assign another service to ${esc(state.selectedTech)}</h3>
      <p>Choose an open ticket and a service. It will appear under this technician at checkout.</p>
      </div>
      <div class="tech-assign-fields">
      <div class="form-field">
      <label for="assign-ticket">Customer ticket</label>
      <select class="select" id="assign-ticket">
      <option value="">Choose open ticket</option>${activeTickets().map(ticket=>`<option value="${esc(data.keyOf(ticket))}" ${String(state.assignTicketId)===data.keyOf(ticket)?'selected':''}>#${esc(ticket.id)} · ${esc(ticket.name)}</option>`).join('')}</select>
      </div>${existingServicesHtml()}<div class="form-field">
      <label for="assign-category">Service category</label>
      <select class="select" id="assign-category">${categories.map(category=>`<option value="${esc(category)}" ${state.assignCategory===category?'selected':''}>${esc(category)}</option>`).join('')}</select>
      </div>
      <div class="form-field">
      <label for="assign-service">Salon service</label>
      <select class="select" id="assign-service">
      <option value="">Choose service</option>${available.map(({item,index})=>`<option value="${index}" ${String(state.assignServiceIndex)===String(index)?'selected':''}>${esc(item.name)} · ${money(item.price)}</option>`).join('')}</select>
      </div>
      </div>
      <div class="tech-assign-footer">
      <button type="button" class="btn btn-primary" data-action="assign-tech-service">${icon('plus')} Assign to ${esc(state.selectedTech)}</button>
      <p class="tech-assign-note">Uses the salon's standard menu price. Add-ons and discounts can be edited on the checkout ticket.</p>
      </div>
      <p class="tech-assign-feedback" role="status">${esc(state.assignmentNotice)}</p>`}
  function techniciansHtml(){const categories=[...new Set(fullCatalog.map(item=>item.category))],work=ticketWorkForTech(state.selectedTech),busy=techRows.filter(tech=>data.statusFor(tech,rows)==='busy').length;return `<section class="tech-screen-head">
      <div>
      <p class="tech-screen-eyebrow">FRONT DESK · STAFF WORKSPACE</p>
      <h2>Salon Technicians</h2>
      <p class="muted">Tap a technician to assign work, make a ticket, or start checkout for a customer.</p>
      </div>
      <div class="tech-head-actions">
      <span class="tech-count">${busy} working · ${techs.filter(tech=>data.statusFor(techRows.find(row=>row.name===tech),rows)==='available').length} available</span>
      </div>
      </section>
      <div class="tech-roster" role="group" aria-label="Select technician">${techs.map((tech,index,ordered)=>{const jobs=ticketWorkForTech(tech),selected=state.selectedTech===tech;return `<div class="tech-roster-item">
      <button type="button" class="tech-roster-card ${selected?'selected':''}" data-action="select-tech" data-id="${esc(tech)}" aria-pressed="${selected}">
      <span class="tech-avatar">${esc(tech.split(' ').map(part=>part[0]).join('').slice(0,2))}</span>
      <span class="tech-card-copy">
      <strong>${esc(tech)}</strong>
      <small>${jobs.some(job=>job.service.status!=='completed')?`${jobs.filter(job=>job.service.status!=='completed').length} assigned service${jobs.filter(job=>job.service.status!=='completed').length===1?'':'s'}`:data.statusFor(techRows.find(row=>row.name===tech),rows)==='available'?'Ready for work':statusLabel(tech)}</small>
      </span>
      <span class="tech-status ${data.statusFor(techRows.find(row=>row.name===tech),rows)}">${statusLabel(tech)}</span>
      </button>
      </div>`}).join('')}</div>
      <div class="tech-workspace">
      <section class="panel tech-current">
      <div class="tech-panel-head">
      <div>
      <span class="tech-panel-kicker">SELECTED TECHNICIAN</span>
      <h3>${esc(state.selectedTech)}</h3>
      <p>${work.length} service${work.length===1?'':'s'} assigned on open tickets</p>
      </div>
      <span class="tech-panel-icon">${icon('users')}</span>
      </div>${work.length?`<div class="tech-work-list">${work.map(({ticket,service,role})=>`<div class="tech-work-row">
      <div>
      <strong>${esc(service.name||fullCatalog.find(c=>c.id===service.serviceId)?.name||'Service')}</strong>
      <span>Ticket #${esc(ticket.id)} · ${esc(ticket.name)}${role==='lead'?'':` · ${esc(role)}`} · ${esc(service.status==='completed'?'Completed':service.status==='in-service'?'In service':'Waiting')}</span>
      </div>
      <button type="button" class="tech-ticket-link" data-action="open-ticket" data-id="${esc(data.keyOf(ticket))}">Open ticket →</button>
      </div>`).join('')}</div>`:`<div class="tech-empty">No services assigned yet. Start a ticket for this technician.</div>`}</section>
      <section class="panel tech-assign">
      <div class="tech-mode-tabs" role="group" aria-label="Technician work mode">
      <button type="button" class="${state.techMode==='new'?'selected':''}" data-action="tech-mode" data-value="new" aria-pressed="${state.techMode==='new'}">New ticket & checkout</button>
      <button type="button" class="${state.techMode==='existing'?'selected':''}" data-action="tech-mode" data-value="existing" aria-pressed="${state.techMode==='existing'}">Add to existing ticket</button>
      </div>${state.techMode==='new'?techNewTicketHtml(categories):techExistingTicketHtml(categories)}</section>
      </div>
      <p class="tech-prototype-note">Prototype data only. No live technician schedule, customer, ticket, or payment is changed.</p>`}
  function existingServicesHtml(){
    const ticket=rows.find(ticket=>data.keyOf(ticket)===state.assignTicketId);if(!ticket)return '';
    const service=state.assignServiceIndex!==''?fullCatalog[Number(state.assignServiceIndex)]:null;
    return '<div class="tech-existing-services"><small>Services</small>'+ticket.lines.filter(line=>!line.parentLineId).map(line=>'<div class="'+(service?.id===line.serviceId?'same-service':'')+'"><strong>'+esc(line.name)+'</strong><span>'+esc(line.tech)+'</span></div>').join('')+'</div>';
  }
  function render(){
    root.innerHTML=techniciansHtml();
    const newNotice=root.querySelector('.tech-new-actions')?.parentElement.querySelector('[role="status"]');
    if(openCustomer&&data.active(openCustomer)&&newNotice){
      const link=document.createElement('a');link.className='tech-ticket-link';link.textContent='Open ticket →';link.href=data.url(openCustomer,'edit','staff');newNotice.append(' ',link);
    }
    root.querySelectorAll('[data-action="tech-create-ticket"],[data-action="tech-create-checkout"],[data-action="assign-tech-service"]').forEach(button=>{button.disabled=saving||!data.canOperate()||!state.selectedTech||(button.dataset.action!=='assign-tech-service'&&!!openCustomer&&data.active(openCustomer));});
    if(!data.canOperate())root.querySelector('.tech-assign').hidden=true;
    window.lucide?.createIcons();
  }
  function refresh(){try{refreshData();clearError();render();}catch(error){showError(error);}}
  function showError(error){
    const feedback=document.querySelector('[data-staff-error]');feedback.hidden=false;feedback.textContent=error.message || String(error);
  }
  function clearError(){const feedback=document.querySelector('[data-staff-error]');feedback.hidden=true;feedback.textContent='';}
  function lookup(){
    const phone=data.digits(state.techNewPhone);
    if(phone.length!==10){state.techNewNotice='Enter a 10-digit customer phone number.';render();return;}
    refreshData();
    const appointments=window.NEXORA_APPOINTMENTS_STORE.loadAll().map(row=>({customer:row.customerName,phone:row.phone}));
    const customer=[...rows,...appointments,{customer:'Customer A',phone:'2025550101'}].find(row=>data.digits(row.phone)===phone);
    openCustomer=data.openForPhone(phone);
    state.techNewPhone=phone;state.techNewName=(customer?.customer || '').toUpperCase();state.techNewStatus=customer?'existing':'new';state.techNewNotice='';
    render();root.querySelector('#tech-guest-name')?.focus();
  }
  function create(checkout){
    if(saving||!data.canOperate())return;
    if(data.digits(state.techNewPhone).length!==10||!['existing','new'].includes(state.techNewStatus)){state.techNewNotice='Find the customer by a 10-digit phone number first.';render();return;}
    if(!state.techNewName.trim()){state.techNewNotice='Enter the new customer name.';render();return;}
    const service=state.techNewServiceIndex!==''?fullCatalog[Number(state.techNewServiceIndex)]:null;
    if(!service){state.techNewNotice='Choose a salon service.';render();return;}
    saving=true;clearError();
    try{
      const result=data.create({customer:state.techNewName,phone:state.techNewPhone,serviceId:service.id,tech:state.selectedTech,coTech:state.techCoTech});
      if(result.existing){openCustomer=result.ticket;state.techNewNotice='';return;}
      if(checkout){location.href=data.url(result.ticket,'checkout','staff');return;}
      state.techNewNotice=`Ticket #${result.ticket.id} created for ${result.ticket.customer}.`;
      state.techNewPhone='';state.techNewName='';state.techNewStatus='idle';state.techNewServiceIndex='';state.techCoTech='';openCustomer=null;
      refreshData();
    }catch(error){showError(error);}
    finally{saving=false;render();}
  }
  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
    const action=button.dataset.action;
    if(action==='select-tech'){
      state.selectedTech=button.dataset.id;state.techCoTech='';
      ['techNewServiceIndex','assignServiceIndex'].forEach(key=>{const service=fullCatalog[Number(state[key])];if(state[key]!==''&&!data.canAssign(state.selectedTech,service))state[key]='';});
      const eligible=fullCatalog.find(service=>data.canAssign(state.selectedTech,service));
      if(!catalogChoices(state.techNewCategory).length)state.techNewCategory=eligible?.category || state.techNewCategory;
      if(!catalogChoices(state.assignCategory).length)state.assignCategory=eligible?.category || state.assignCategory;
      rememberTechnician();render();
    }
    if(action==='open-ticket'){const ticket=rows.find(row=>data.keyOf(row)===button.dataset.id);if(ticket)location.href=data.url(ticket,'edit','staff');}
    if(action==='tech-mode'){state.techMode=button.dataset.value;render();}
    if(action==='tech-lookup-guest'){try{clearError();lookup();}catch(error){showError(error);}}
    if(action==='tech-create-ticket'||action==='tech-create-checkout')create(action==='tech-create-checkout');
    if(action==='assign-tech-service'){
      if(saving||!data.canOperate())return;
      const service=state.assignServiceIndex!==''?fullCatalog[Number(state.assignServiceIndex)]:null;
      if(!state.assignTicketId||!service){state.assignmentNotice='Select a customer ticket and salon service first.';render();return;}
      saving=true;clearError();
      try{
        const ticket=data.addService(state.assignTicketId,service.id,state.selectedTech);
        state.assignmentNotice=`Assigned ${service.name} to ${state.selectedTech} for ticket #${ticket.id}.`;state.assignServiceIndex='';refreshData();
      }catch(error){showError(error);}
      finally{saving=false;render();}
    }
  });
  root.addEventListener('input',event=>{
    if(event.target.id==='tech-guest-phone'){
      const input=event.target,cursor=input.selectionStart,before=data.digits(input.value.slice(0,cursor)).length;
      state.techNewPhone=data.digits(input.value).slice(0,10);input.value=phoneDisplay(state.techNewPhone);
      let position=0,count=0;while(position<input.value.length&&count<before){if(/\d/.test(input.value[position]))count++;position++;}input.setSelectionRange(position,position);
      state.techNewStatus='idle';state.techNewName='';state.techNewNotice='';openCustomer=null;
      const result=root.querySelector('#tech-guest-result');if(result)result.innerHTML=technicianGuestResultHtml();
      root.querySelector('#tech-guest-preview').textContent='Customer not selected';
      root.querySelector('.tech-checkout-actions [role="status"]').textContent='';
      root.querySelectorAll('[data-action="tech-create-ticket"],[data-action="tech-create-checkout"]').forEach(button=>{button.disabled=!data.canOperate();});
    }
    if(event.target.id==='tech-guest-name'){
      state.techNewName=event.target.value.toUpperCase();root.querySelector('#tech-guest-preview').textContent=state.techNewName || 'Customer not selected';
    }
  });
  root.addEventListener('change',event=>{
    const fields={'tech-new-category':'techNewCategory','tech-new-service':'techNewServiceIndex','tech-co-worker':'techCoTech','assign-ticket':'assignTicketId','assign-category':'assignCategory','assign-service':'assignServiceIndex'};
    const field=fields[event.target.id];if(!field)return;state[field]=event.target.value;
    if(field==='techNewCategory'){state.techNewServiceIndex='';state.techCoTech='';}
    if(field==='assignCategory')state.assignServiceIndex='';
    if(field==='techNewServiceIndex')state.techCoTech='';
    if(field==='assignTicketId')state.assignmentNotice='';
    render();
  });
  root.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.id==='tech-guest-phone'){event.preventDefault();try{lookup();}catch(error){showError(error);}}});
  window.addEventListener('storage',event=>{if(!event.key||Object.values(data.keys).includes(event.key)||event.key===window.NEXORA_SALON_DATA.STORAGE_KEY)refresh();});
  window.addEventListener('focus',refresh);
  window.addEventListener('pageshow',refresh);
  window.addEventListener('nexora:pos-account-changed',()=>{state.techNewPhone='';state.techNewName='';state.techNewStatus='idle';state.techNewNotice='';openCustomer=null;refresh();});
  try{state.selectedTech=new URLSearchParams(location.search).get('technician') || sessionStorage.getItem('nexora:front-desk-staff-technician') || '';}catch(_){}
  refresh();
})();
