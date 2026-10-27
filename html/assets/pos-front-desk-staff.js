/* Staff workspace copy and layout adapted from the PO technician workspace. */
(function () {
  'use strict';
  const root=document.querySelector('[data-front-staff]'),data=window.NEXORA_FRONT_DESK_DATA;
  const esc=value=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=value=>'$'+Number(value || 0).toFixed(2);
  const phoneDisplay=value=>{const phone=data.digits(value).slice(0,10);return phone.length>6?'('+phone.slice(0,3)+') '+phone.slice(3,6)+'-'+phone.slice(6):phone.length>3?'('+phone.slice(0,3)+') '+phone.slice(3):phone?'('+phone:'';};
  const contentIcons={users:'users-round','user-round':'user-round',ticket:'ticket',clock:'clock',sparkles:'sparkles'};
  const icon=name=>contentIcons[name]&&window.ONEQR_ACTION_APPEARANCE
    ?window.ONEQR_ACTION_APPEARANCE.image(contentIcons[name],24)
    :'<i data-lucide="'+name+'" aria-hidden="true"></i>';
  let rows=[],techRows=[],techs=[],fullCatalog=[],saving=false,openCustomer=null;
  const state={staffSearch:'',staffFilter:'all',selectedTech:'',techMode:'new',techNewPhone:'',techNewName:'',techNewStatus:'idle',techNewCategory:'',techNewServiceIndex:'',techCoTech:'',techNewNotice:'',assignCategory:'',assignServiceIndex:'',assignTicketId:'',assignmentNotice:''};
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
    const eligibleCategories=categories.filter(category=>catalogChoices(category).length);
    const firstEligible=eligibleCategories[0] || '';
    if(!eligibleCategories.includes(state.techNewCategory))state.techNewCategory=firstEligible;
    if(!eligibleCategories.includes(state.assignCategory))state.assignCategory=firstEligible;
    ['techNewServiceIndex','assignServiceIndex'].forEach(key=>{if(state[key]!==''&&!data.canAssign(state.selectedTech,fullCatalog[Number(state[key])]))state[key]='';});
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
  const technicianStatus=name=>data.statusFor(techRows.find(tech=>tech.name===name),rows);
  const rosterStatus=name=>['clocked-out','paused'].includes(technicianStatus(name))?'offshift':technicianStatus(name);
  const rosterLabels={all:'All staff',busy:'Working',assigned:'Assigned',available:'Available',offshift:'Off shift'};
  const avatarColors=[['#f1eaff','#7754b2'],['#ffeef0','#b5687b'],['#e5f3f0','#367e72'],['#e8f0fd','#5077ae'],['#fff1df','#a87934'],['#eceff4','#727e94']];
  function technicianAvatar(name,large=false){
    const colors=avatarColors[Math.max(0,techs.indexOf(name))%avatarColors.length];
    return `<span class="tech-avatar${large?' large':''}" style="--avatar-bg:${colors[0]};--avatar-ink:${colors[1]}" aria-hidden="true">${esc(name.trim().split(/\s+/).map(part=>part[0]).join('').slice(0,2))}</span>`;
  }
  function staffCounts(){
    const counts={all:techs.length,busy:0,assigned:0,available:0,offshift:0};
    techs.forEach(tech=>counts[rosterStatus(tech)]++);
    return counts;
  }
  function staffSummaryHtml(){
    const counts=staffCounts();
    return ['busy','assigned','available','offshift'].map(status=>`<span class="tech-summary-item ${status}"><i class="tech-status-dot" aria-hidden="true"></i><strong>${counts[status]}</strong>${rosterLabels[status]}</span>`).join('');
  }
  function staffFiltersHtml(){
    const counts=staffCounts();
    return Object.keys(counts).map(status=>`<option value="${status}"${state.staffFilter===status?' selected':''}>${rosterLabels[status]} (${counts[status]})</option>`).join('');
  }
  function staffRosterHtml(){
    const visible=techs.filter(tech=>(state.staffFilter==='all'||rosterStatus(tech)===state.staffFilter)&&tech.toLowerCase().includes(state.staffSearch.trim().toLowerCase()));
    return visible.length?visible.map(tech=>{
      const jobs=ticketWorkForTech(tech).filter(job=>job.service.status!=='completed'),selected=state.selectedTech===tech,status=rosterStatus(tech);
      return `<button type="button" class="tech-roster-card${selected?' selected':''}" data-action="select-tech" data-id="${esc(tech)}" aria-pressed="${selected}" title="${esc(tech)}">
        <span class="tech-selection-tick" aria-hidden="true">${icon('check')}</span>${technicianAvatar(tech)}
        <span class="tech-card-copy"><strong>${esc(tech)}</strong><small>${jobs.length?`${jobs.length} service${jobs.length===1?'':'s'} to finish`:status==='available'?'Ready for work':statusLabel(tech)}</small></span>
        <span class="tech-status ${status}"><i class="tech-status-dot" aria-hidden="true"></i>${rosterLabels[status]}</span>
      </button>`;
    }).join(''):'<div class="tech-roster-empty">No technicians match your search. Try a different name or filter.</div>';
  }
  function renderRoster(){
    const roster=root.querySelector('[data-staff-roster]');
    roster.innerHTML=staffRosterHtml();
    roster.scrollTop=0;
    root.querySelector('[data-staff-filters]').innerHTML=staffFiltersHtml();
    window.lucide?.createIcons();
  }
  function servicePickerHtml(categories,existing=false){
    const category=existing?state.assignCategory:state.techNewCategory,index=existing?state.assignServiceIndex:state.techNewServiceIndex,mode=existing?'existing':'new';
    return `<div class="tech-flow-section tech-service-section">
      <h4 class="tech-step-title"><b>2</b>Service by ${esc(state.selectedTech)}</h4>
      <span class="tech-field-label">Service category</span>
      <div class="tech-category-chips" role="group" aria-label="Service category">${categories.map(value=>`<button type="button" class="tech-category-chip${category===value?' selected':''}" data-action="tech-category" data-mode="${mode}" data-value="${esc(value)}" aria-pressed="${category===value}">${esc(value)}</button>`).join('')}</div>
      <div class="tech-services-grid" role="group" aria-label="Choose a service">${catalogChoices(category).map(({item,index:serviceIndex})=>`<button type="button" class="tech-service-card${String(index)===String(serviceIndex)?' selected':''}" data-action="tech-service" data-mode="${mode}" data-value="${serviceIndex}" aria-pressed="${String(index)===String(serviceIndex)}">
        <span class="tech-service-radio" aria-hidden="true"></span><span class="tech-service-name">${esc(item.name)}</span>
        <span class="tech-service-meta"><span>${Number(item.duration)>0?esc(item.duration)+' min':''}</span><strong>${money(item.price)}</strong></span>
      </button>`).join('')}</div>
    </div>`;
  }
  function ticketPreviewHtml(service,existing=false){
    const ticket=existing?activeTickets().find(ticket=>data.keyOf(ticket)===state.assignTicketId):null;
    return `<div class="tech-new-preview"><div><small>TICKET PREVIEW</small><strong id="${existing?'tech-ticket-preview':'tech-guest-preview'}">${esc(existing?ticket?.name||'Ticket not selected':state.techNewName||'Customer not selected')}</strong><span>${esc(state.selectedTech)}${!existing&&state.techCoTech?` + ${esc(state.techCoTech)}`:''} · ${service?esc(service.name):'Choose a service'}</span></div><b>${service?money(service.price):'$0.00'}</b></div>`;
  }
  function techNewTicketHtml(categories){
    const service=state.techNewServiceIndex!==''?fullCatalog[Number(state.techNewServiceIndex)]:null;
    return `<div class="tech-form-body">
      <section class="tech-flow-section tech-customer-section">
        <h4 class="tech-step-title"><b>1</b>Who’s the customer?</h4>
        <label for="tech-guest-phone">Phone number · required</label>
        <div class="tech-phone-row"><input class="input" id="tech-guest-phone" type="tel" inputmode="tel" autocomplete="off" value="${esc(phoneDisplay(state.techNewPhone))}" placeholder="(000) 000-0000"><button type="button" class="btn btn-secondary" data-action="tech-lookup-guest">Find customer${icon('chevron-right')}</button></div>
        <div id="tech-guest-result" aria-live="polite">${technicianGuestResultHtml()}</div>
      </section>
      ${servicePickerHtml(categories)}
      <div class="form-field tech-team-field"><label for="tech-co-worker">Working together with</label>
        <select class="select" id="tech-co-worker"><option value="">No second technician</option>${techs.filter(tech=>tech!==state.selectedTech&&service&&data.canAssign(tech,service)).map(tech=>`<option value="${esc(tech)}" ${state.techCoTech===tech?'selected':''}>${esc(tech)} · same service</option>`).join('')}</select>
        <p class="hint tech-team-hint">${icon('users')}Same service, one charge. Both technicians appear on the ticket.</p>
      </div>
    </div>
    <div class="tech-checkout-footer">${ticketPreviewHtml(service)}
      <div class="tech-checkout-actions"><p class="tech-assign-feedback" role="status">${esc(state.techNewNotice)}</p>
        <div class="tech-new-actions"><button type="button" class="btn btn-secondary" data-action="tech-create-ticket">Create ticket</button><button type="button" class="btn btn-primary" data-action="tech-create-checkout">Create ticket & checkout${icon('arrow-right')}</button></div>
        <p class="tech-prototype-note">No check-in is required. Discounts, add-ons, tip, and payment choice remain editable at checkout.</p>
      </div>
    </div>`;
  }
  function techExistingTicketHtml(categories){
    const service=state.assignServiceIndex!==''?fullCatalog[Number(state.assignServiceIndex)]:null;
    return `<div class="tech-form-body">
      <section class="tech-flow-section tech-customer-section"><h4 class="tech-step-title"><b>1</b>Choose an open ticket</h4>
        <label for="assign-ticket">Customer ticket</label>
        <select class="select" id="assign-ticket"><option value="">Choose open ticket</option>${activeTickets().map(ticket=>`<option value="${esc(data.keyOf(ticket))}" ${String(state.assignTicketId)===data.keyOf(ticket)?'selected':''}>#${esc(ticket.id)} · ${esc(ticket.name)}</option>`).join('')}</select>
        ${existingServicesHtml()}
      </section>${servicePickerHtml(categories,true)}
    </div>
    <div class="tech-checkout-footer">${ticketPreviewHtml(service,true)}
      <p class="tech-assign-feedback" role="status">${esc(state.assignmentNotice)}</p>
      <div class="tech-assign-footer"><button type="button" class="btn btn-primary" data-action="assign-tech-service">${icon('plus')} Assign to ${esc(state.selectedTech)}</button><p class="tech-assign-note">Uses the salon's standard menu price. Add-ons and discounts can be edited on the checkout ticket.</p></div>
    </div>`;
  }
  function currentWorkHtml(work){
    const status=rosterStatus(state.selectedTech);
    return `<section class="panel tech-current" aria-label="Selected technician work">
      <div class="tech-panel-head"><span class="tech-panel-kicker">SELECTED TECHNICIAN</span><div class="tech-selected-identity">${technicianAvatar(state.selectedTech,true)}<div><h3>${esc(state.selectedTech)}</h3><p>${work.length} service${work.length===1?'':'s'} assigned on open tickets</p></div></div></div>
      ${status==='offshift'?`<div class="tech-off-notice">${icon('clock')}<span>This technician is off shift. Choose an on-shift technician to assign new work.</span></div>`:''}
      ${work.length?`<div class="tech-work-heading"><span>CURRENT WORK</span><b>${work.length}</b></div><div class="tech-work-list">${work.map(({ticket,service,role})=>{
        const item=fullCatalog.find(item=>item.id===service.serviceId),status=service.status==='completed'?'completed':service.status==='in-service'?'busy':'assigned';
        return `<article class="tech-work-row"><div class="tech-job-heading"><strong>${esc(service.name||item?.name||'Service')}</strong>${service.price!=null||item?.price!=null?`<span>${money(service.price??item.price)}</span>`:''}</div>
          <div class="tech-job-customer">${icon('user-round')}<span>${esc(ticket.name)}</span></div><div class="tech-job-meta"><span>Ticket #${esc(ticket.id)}</span><span class="tech-status ${status}"><i class="tech-status-dot" aria-hidden="true"></i>${service.status==='completed'?'Completed':service.status==='in-service'?'In service':'Waiting'}</span></div>
          ${role==='lead'?'':`<p class="tech-job-team">${esc(role)}</p>`}<button type="button" class="tech-ticket-link" data-action="open-ticket" data-id="${esc(data.keyOf(ticket))}">Open ticket ${icon('arrow-right')}</button></article>`;
      }).join('')}</div>`:`<div class="tech-empty"><span class="tech-empty-icon">${icon(status==='offshift'?'clock':'sparkles')}</span><div><h4>${status==='offshift'?'Currently off shift':'Ready for the next guest'}</h4><p>${status==='offshift'?'Existing tickets remain accessible. New work requires an active shift.':'No services assigned yet. Start a ticket or add work to an existing one.'}</p></div></div>`}
      <div class="tech-work-foot">${icon('info')}<span>Completed services stay here until the customer’s ticket is closed.</span></div>
    </section>`;
  }
  function techniciansHtml(){
    const categories=[...new Set(fullCatalog.filter(service=>data.canAssign(state.selectedTech,service)).map(item=>item.category))],work=ticketWorkForTech(state.selectedTech);
    return `<section class="tech-screen-head"><div><p class="tech-screen-eyebrow">FRONT DESK · STAFF WORKSPACE</p><h2>Salon Technicians</h2><p class="muted">Tap a technician to assign work, make a ticket, or start checkout for a customer.</p></div><div class="tech-summary" aria-label="Technician status summary">${staffSummaryHtml()}</div></section>
      <div class="tech-staff-layout"><section class="panel tech-roster-panel" aria-label="Salon Technicians">
        <div class="tech-toolbar"><label class="tech-search">${icon('search')}<span class="tech-sr-only">Search technicians</span><input id="staff-search" type="search" placeholder="Search technicians…" autocomplete="off" value="${esc(state.staffSearch)}"></label><select class="select tech-status-filter" id="staff-status" data-staff-filters aria-label="Technician status">${staffFiltersHtml()}</select></div>
        <div class="tech-roster" data-staff-roster role="group" aria-label="Select technician">${staffRosterHtml()}</div>
      </section><div class="tech-workspace">${currentWorkHtml(work)}<section class="panel tech-assign" aria-label="Assign work"><div class="tech-mode-tabs" role="group" aria-label="Technician work mode"><button type="button" class="${state.techMode==='new'?'selected':''}" data-action="tech-mode" data-value="new" aria-pressed="${state.techMode==='new'}">${icon('plus')}New ticket & checkout</button><button type="button" class="${state.techMode==='existing'?'selected':''}" data-action="tech-mode" data-value="existing" aria-pressed="${state.techMode==='existing'}">${icon('ticket')}Add to existing ticket</button></div>${state.techMode==='new'?techNewTicketHtml(categories):techExistingTicketHtml(categories)}</section></div></div>`;
  }
  function existingServicesHtml(){
    const ticket=rows.find(ticket=>data.keyOf(ticket)===state.assignTicketId);if(!ticket)return '';
    const service=state.assignServiceIndex!==''?fullCatalog[Number(state.assignServiceIndex)]:null;
    return '<div class="tech-existing-services"><small>Services</small>'+ticket.lines.filter(line=>!line.parentLineId).map(line=>'<div class="'+(service?.id===line.serviceId?'same-service':'')+'"><strong>'+esc(line.name)+'</strong><span>'+esc(line.tech)+'</span></div>').join('')+'</div>';
  }
  function render(){
    const focused=document.activeElement;
    const previousFocus=root.contains(focused)?{id:focused.id,action:focused.dataset.action,value:focused.dataset.value,tech:focused.dataset.id,mode:focused.dataset.mode}:null;
    const rosterScroll=root.querySelector('[data-staff-roster]')?.scrollTop;
    root.innerHTML=techniciansHtml();
    const newNotice=root.querySelector('.tech-new-actions')?.parentElement.querySelector('[role="status"]');
    if(openCustomer&&data.active(openCustomer)&&newNotice){
      const link=document.createElement('a');link.className='tech-ticket-link';link.textContent='Open ticket →';link.href=data.url(openCustomer,'edit','staff');newNotice.append(' ',link);
    }
    root.querySelectorAll('[data-action="tech-create-ticket"],[data-action="tech-create-checkout"],[data-action="assign-tech-service"]').forEach(button=>{button.disabled=saving||!data.canOperate()||!state.selectedTech||!fullCatalog.some(service=>data.canAssign(state.selectedTech,service))||(button.dataset.action!=='assign-tech-service'&&!!openCustomer&&data.active(openCustomer));});
    if(!data.canOperate())root.querySelector('.tech-assign').hidden=true;
    window.lucide?.createIcons();
    if(previousFocus){
      const next=previousFocus.id?document.getElementById(previousFocus.id):Array.from(root.querySelectorAll('[data-action]')).find(button=>button.dataset.action===previousFocus.action&&button.dataset.value===previousFocus.value&&button.dataset.id===previousFocus.tech&&button.dataset.mode===previousFocus.mode);
      next?.focus({preventScroll:true});
    }
    const roster=root.querySelector('[data-staff-roster]');
    if(rosterScroll!==undefined)roster.scrollTop=rosterScroll;
    else{
      const selected=roster.querySelector('.selected');
      if(selected)roster.scrollTop=Math.max(0,selected.offsetTop-(roster.clientHeight-selected.offsetHeight)/2);
    }
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
    if(action==='tech-category'){
      if(button.dataset.mode==='existing'){state.assignCategory=button.dataset.value;state.assignServiceIndex='';}
      else{state.techNewCategory=button.dataset.value;state.techNewServiceIndex='';state.techCoTech='';}
      render();return;
    }
    if(action==='tech-service'){
      if(button.dataset.mode==='existing')state.assignServiceIndex=button.dataset.value;
      else{state.techNewServiceIndex=button.dataset.value;state.techCoTech='';}
      render();return;
    }
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
    if(event.target.id==='staff-search'){state.staffSearch=event.target.value;renderRoster();return;}
    if(event.target.id==='tech-guest-phone'){
      const input=event.target,cursor=input.selectionStart,before=data.digits(input.value.slice(0,cursor)).length;
      state.techNewPhone=data.digits(input.value).slice(0,10);input.value=phoneDisplay(state.techNewPhone);
      let position=0,count=0;while(position<input.value.length&&count<before){if(/\d/.test(input.value[position]))count++;position++;}input.setSelectionRange(position,position);
      state.techNewStatus='idle';state.techNewName='';state.techNewNotice='';openCustomer=null;
      const result=root.querySelector('#tech-guest-result');if(result)result.innerHTML=technicianGuestResultHtml();
      root.querySelector('#tech-guest-preview').textContent='Customer not selected';
      root.querySelector('.tech-checkout-actions [role="status"]').textContent='';
      root.querySelectorAll('[data-action="tech-create-ticket"],[data-action="tech-create-checkout"]').forEach(button=>{button.disabled=saving||!data.canOperate()||!fullCatalog.some(service=>data.canAssign(state.selectedTech,service));});
    }
    if(event.target.id==='tech-guest-name'){
      state.techNewName=event.target.value.toUpperCase();root.querySelector('#tech-guest-preview').textContent=state.techNewName || 'Customer not selected';
    }
  });
  root.addEventListener('change',event=>{
    if(event.target.id==='staff-status'){state.staffFilter=event.target.value;renderRoster();return;}
    const fields={'tech-co-worker':'techCoTech','assign-ticket':'assignTicketId'};
    const field=fields[event.target.id];if(!field)return;state[field]=event.target.value;
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
