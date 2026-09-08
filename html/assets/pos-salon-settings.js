(function(){
  'use strict';
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let page=1;const pageSize=10;
  const baseRender=window.renderStaffRoster;
  function table(headers,rows){return '<table><thead><tr>'+headers.map(h=>'<th scope="col">'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>';}
  function drawStaff(){
    const staff=salonData.loadCatalog().technicians.filter(t=>t.active&&t.name.toLowerCase().includes($('#salon-staff-search').value.trim().toLowerCase()));
    const pages=Math.max(1,Math.ceil(staff.length/pageSize));page=Math.min(page,pages);
    const visible=staff.slice((page-1)*pageSize,page*pageSize);
    $('[data-staff-grid]').innerHTML=visible.length?table(['Staff','Position','Level','Contact','Actions'],visible.map(t=>'<tr><td><div class="salon-person"><span class="salon-avatar">'+esc(t.name.charAt(0).toUpperCase())+'</span>'+esc(t.name)+'</div></td><td>'+esc(ROLE_LABELS[t.posProfile?.posRole]||'Nail Technician')+'</td><td>Level '+esc(t.posProfile?.level||1)+'</td><td>'+esc(t.phone||t.email||'—')+'</td><td><button type="button" data-tech-detail-open="'+esc(t.id)+'">View &amp; Edit</button></td></tr>')):'<p class="salon-empty">No staff match your search.</p>';
    let buttons='<button type="button" data-staff-page="'+(page-1)+'" aria-label="Previous page"'+(page===1?' disabled':'')+'>‹</button>';
    const wanted=[...new Set([1,page-1,page,page+1,pages])].filter(n=>n>0&&n<=pages).sort((a,b)=>a-b);let previous=0;
    wanted.forEach(n=>{if(previous&&n>previous+1)buttons+='<span>…</span>';buttons+='<button type="button" data-staff-page="'+n+'"'+(n===page?' aria-current="page"':'')+'>'+n+'</button>';previous=n;});
    buttons+='<button type="button" data-staff-page="'+(page+1)+'" aria-label="Next page"'+(page===pages?' disabled':'')+'>›</button>';
    $('#salon-staff-pagination').innerHTML='<span>Showing <strong>'+(staff.length?(page-1)*pageSize+1:0)+'</strong> to <strong>'+Math.min(page*pageSize,staff.length)+'</strong> of <strong>'+staff.length+'</strong> results</span><nav aria-label="Staff pagination">'+buttons+'</nav>';
  }
  window.renderStaffRoster=function(){baseRender();drawStaff();};
  function selectTab(tab){
    if(!['information','staff','services','roles'].includes(tab))tab='staff';
    document.querySelectorAll('[data-settings-tab]').forEach(b=>{const on=b.dataset.settingsTab===tab;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    document.querySelectorAll('[data-settings-panel]').forEach(p=>p.hidden=p.dataset.settingsPanel!==tab);
    const url=new URL(location.href);url.searchParams.set('section',tab);history.replaceState(null,'',url);
  }
  $('#salon-staff-search').addEventListener('input',()=>{page=1;drawStaff();});
  $('#salon-staff-pagination').addEventListener('click',e=>{const b=e.target.closest('[data-staff-page]');if(b&&!b.disabled){page=Number(b.dataset.staffPage);drawStaff();}});
  document.querySelectorAll('[data-settings-tab]').forEach(b=>b.addEventListener('click',()=>selectTab(b.dataset.settingsTab)));
  const approvalSettings = window.NEXORA_SERVICE_APPROVAL_SETTINGS;
  const servicePanel = $('[data-settings-panel="services"]');
  const currentSalon = salonData.loadCatalog().salon;
  const approvalSalons = [currentSalon, {id:'golden',name:'Golden Nails & Spa'}, {id:'elite',name:'Elite Beauty Lounge'}];
  servicePanel.innerHTML = '<div class="salon-approval-settings"><h2>Service approval</h2><p>Choose which services require customer approval when a technician adds them to a Work Order. No services are selected by default.</p><p>Changing a service always requires the customer’s last 4 phone digits. Removing a service does not require approval.</p><label>Salon <select data-approval-salon>'+approvalSalons.map(salon=>'<option value="'+esc(salon.id)+'">'+esc(salon.name)+'</option>').join('')+'</select></label><div data-approval-services>Loading services…</div><p role="status" data-approval-status></p></div>';
  let approvalCategories = [];
  function renderApprovalServices() {
    const checked = approvalSettings.load($('[data-approval-salon]').value);
    $('[data-approval-services]').innerHTML = approvalCategories.map(category=>'<fieldset><legend>'+esc(category.name)+'</legend>'+category.services.map(service=>'<label class="salon-approval-option"><input type="checkbox" data-service-approval="'+esc(service.id)+'"'+(checked.includes(service.id)?' checked':'')+'> '+esc(service.name)+'</label>').join('')+'</fieldset>').join('');
  }
  $('[data-approval-salon]').addEventListener('change',()=>{renderApprovalServices();$('[data-approval-status]').textContent='';});
  servicePanel.addEventListener('change',event=>{
    const checkbox=event.target.closest('[data-service-approval]');
    if(!checkbox)return;
    const salonId=$('[data-approval-salon]').value;
    const ids=new Set(approvalSettings.load(salonId));
    if(checkbox.checked)ids.add(checkbox.dataset.serviceApproval);else ids.delete(checkbox.dataset.serviceApproval);
    try {approvalSettings.save(salonId,Array.from(ids));$('[data-approval-status]').textContent='Saved.';}
    catch(error){checkbox.checked=!checkbox.checked;$('[data-approval-status]').textContent='Unable to save. Please try again.';}
  });
  appointmentServiceCatalogLoader.load('../menu/menu.json').then(catalog=>{
    approvalCategories=catalog.categories.map(category=>({name:category.name,services:category.services.filter(service=>service.type!=='add-on')})).filter(category=>category.services.length);
    approvalCategories.push({name:'Other services',services:[{id:'__custom__',name:'Custom service'}]});
    renderApprovalServices();
  }).catch(()=>{$('[data-approval-services]').textContent='Unable to load services. Reload to try again.';});
  drawStaff();selectTab(new URLSearchParams(location.search).get('section')||'staff');
})();
