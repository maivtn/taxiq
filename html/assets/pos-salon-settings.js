(function(){
  'use strict';
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function staffTable(staff,options={}) {
    const roles={tech:'Technician',frontdesk:'Front Desk',manager:'Manager'};
    if(options.onboarding)roles.owner='Owner';
    const levels={'1':'Level 1 · Basic services','2':'Level 2 · Advanced services','3':'Level 3 · Senior / all approved services'};
    return staff.length?table(['Staff','Position','Level','Contact','Actions'],staff.map(t=>{
      const profile=options.onboarding?t:(t.posProfile||{});
      return '<tr><td><div class="salon-person"><span class="salon-avatar">'+esc(t.name.charAt(0).toUpperCase())+'</span>'+esc(t.name)+'</div></td><td>'+esc(roles[profile.posRole]||'Nail Technician')+'</td><td>'+esc(options.onboarding?(levels[profile.level]||'—'):('Level '+(profile.level||1)))+'</td><td>'+esc(t.phone||t.email||'—')+'</td><td><button type="button" data-tech-detail-open="'+esc(t.id)+'">View &amp; Edit</button>'+(options.onboarding?'':' <button type="button" data-staff-schedule-open="'+esc(t.id)+'">Edit schedule</button>')+'</td></tr>';
    })):'<p class="salon-empty">No staff match your search.</p>';
  }
  window.NEXORA_STAFF_ROSTER={table:staffTable};
  if(!$('#salon-staff-search')||!$('[data-staff-grid]'))return;
  let page=1;const pageSize=10;
  const baseRender=window.renderStaffRoster;
  function table(headers,rows){return '<table><thead><tr>'+headers.map(h=>'<th scope="col">'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>';}
  function drawStaff(){
    const staff=salonData.loadCatalog().technicians.filter(t=>t.active&&t.name.toLowerCase().includes($('#salon-staff-search').value.trim().toLowerCase()));
    const pages=Math.max(1,Math.ceil(staff.length/pageSize));page=Math.min(page,pages);
    const visible=staff.slice((page-1)*pageSize,page*pageSize);
    $('[data-staff-grid]').innerHTML=staffTable(visible);
    let buttons='<button type="button" data-staff-page="'+(page-1)+'" aria-label="Previous page"'+(page===1?' disabled':'')+'>‹</button>';
    const wanted=[...new Set([1,page-1,page,page+1,pages])].filter(n=>n>0&&n<=pages).sort((a,b)=>a-b);let previous=0;
    wanted.forEach(n=>{if(previous&&n>previous+1)buttons+='<span>…</span>';buttons+='<button type="button" data-staff-page="'+n+'"'+(n===page?' aria-current="page"':'')+'>'+n+'</button>';previous=n;});
    buttons+='<button type="button" data-staff-page="'+(page+1)+'" aria-label="Next page"'+(page===pages?' disabled':'')+'>›</button>';
    $('#salon-staff-pagination').innerHTML='<span>Showing <strong>'+(staff.length?(page-1)*pageSize+1:0)+'</strong> to <strong>'+Math.min(page*pageSize,staff.length)+'</strong> of <strong>'+staff.length+'</strong> results</span><nav aria-label="Staff pagination">'+buttons+'</nav>';
  }
  window.renderStaffRoster=function(){baseRender();drawStaff();};
  function selectTab(tab){
    const showRequests=tab==='staff-requests';
    if(showRequests)tab='staff-schedule';
    if(!['information','staff','staff-schedule','services','roles','sms','access-pin','payment-fees','stations'].includes(tab))tab='staff';
    window.NEXORA_SALON_SETTINGS_TABS.sync(tab);
    document.querySelectorAll('[data-settings-panel]').forEach(p=>p.hidden=p.dataset.settingsPanel!==tab);
    document.querySelector('.content').dataset.settingsSection=tab;
    const url=new URL(location.href);url.searchParams.set('section',tab);history.replaceState(null,'',url);
    window.NEXORA_SHELL.refreshSidebar();
    if(showRequests)requestAnimationFrame(()=>$('[data-staff-requests-settings]')?.scrollIntoView({block:'start'}));
  }
  $('#salon-staff-search').addEventListener('input',()=>{page=1;drawStaff();});
  $('#salon-staff-pagination').addEventListener('click',e=>{const b=e.target.closest('[data-staff-page]');if(b&&!b.disabled){page=Number(b.dataset.staffPage);drawStaff();}});
  document.querySelectorAll('[data-settings-tab]').forEach(b=>b.addEventListener('click',()=>selectTab(b.dataset.settingsTab)));
  document.addEventListener('click',event=>{const button=event.target.closest('[data-staff-schedule-open]');if(!button)return;window.NEXORA_STAFF_SCHEDULE_SETTINGS?.open(button.dataset.staffScheduleOpen,button);});
  drawStaff();selectTab(new URLSearchParams(location.search).get('section')||'staff');
})();
