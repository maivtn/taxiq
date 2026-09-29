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
    $('[data-staff-grid]').innerHTML=visible.length?table(['Staff','Position','Level','Contact','Actions'],visible.map(t=>'<tr><td><div class="salon-person"><span class="salon-avatar">'+esc(t.name.charAt(0).toUpperCase())+'</span>'+esc(t.name)+'</div></td><td>'+esc(ROLE_LABELS[t.posProfile?.posRole]||'Nail Technician')+'</td><td>Level '+esc(t.posProfile?.level||1)+'</td><td>'+esc(t.phone||t.email||'—')+'</td><td><button type="button" data-tech-detail-open="'+esc(t.id)+'">View &amp; Edit</button> <button type="button" data-staff-schedule-open="'+esc(t.id)+'">Edit schedule</button></td></tr>')):'<p class="salon-empty">No staff match your search.</p>';
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
    if(!['information','staff','staff-schedule','services','oneqr-ads','roles','sms'].includes(tab))tab='staff';
    document.querySelectorAll('[data-settings-tab]').forEach(b=>{const on=b.dataset.settingsTab===tab;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    document.querySelectorAll('[data-settings-panel]').forEach(p=>p.hidden=p.dataset.settingsPanel!==tab);
    const url=new URL(location.href);url.searchParams.set('section',tab);history.replaceState(null,'',url);
    if(showRequests)requestAnimationFrame(()=>$('[data-staff-requests-settings]')?.scrollIntoView({block:'start'}));
  }
  $('#salon-staff-search').addEventListener('input',()=>{page=1;drawStaff();});
  $('#salon-staff-pagination').addEventListener('click',e=>{const b=e.target.closest('[data-staff-page]');if(b&&!b.disabled){page=Number(b.dataset.staffPage);drawStaff();}});
  document.querySelectorAll('[data-settings-tab]').forEach(b=>b.addEventListener('click',()=>selectTab(b.dataset.settingsTab)));
  document.addEventListener('click',event=>{const button=event.target.closest('[data-staff-schedule-open]');if(!button)return;window.NEXORA_STAFF_SCHEDULE_SETTINGS?.open(button.dataset.staffScheduleOpen,button);});
  const adsPanel=$('[data-settings-panel="oneqr-ads"]');
  if(adsPanel){
    const storageKey='nexora_oneqr_ad_settings_v1';
    const defaults={enabled:false,crossPromo:true,placements:{hero:true,nearby:true,wait:true,complete:true},distribution:'split',radius:'auto',competitor:'group',discovery:'rich'};
    let adsState=defaults;
    try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved)adsState={...defaults,...saved,placements:{...defaults.placements,...saved.placements}};}catch(error){adsState=defaults;}
    const enabled=$('[data-oneqr-ads-enabled]');
    const crossPromo=$('[data-oneqr-cross-promo]');
    const message=$('[data-oneqr-ads-message]');
    function syncAds(){
      enabled.checked=adsState.enabled;crossPromo.checked=adsState.crossPromo;
      adsPanel.querySelectorAll('[data-oneqr-ad-placement]').forEach(input=>{input.checked=adsState.placements[input.dataset.oneqrAdPlacement]!==false;input.disabled=!adsState.enabled;});
      adsPanel.querySelectorAll('[data-oneqr-setting]').forEach(input=>{input.value=adsState[input.dataset.oneqrSetting];input.disabled=!adsState.enabled||(input.dataset.oneqrSetting==='distribution'&&!adsState.crossPromo)||(input.dataset.oneqrSetting==='radius'&&!adsState.crossPromo);});
      crossPromo.disabled=!adsState.enabled;
      const status=$('[data-oneqr-ads-status]');status.textContent=adsState.enabled?'Monetization on':'Monetization off';status.classList.toggle('is-off',!adsState.enabled);status.classList.toggle('is-on',adsState.enabled);
      $('[data-oneqr-preview-off]').hidden=adsState.enabled;
      $('[data-oneqr-preview-hero]').hidden=!adsState.enabled||!adsState.placements.hero;
      $('[data-oneqr-preview-partner]').hidden=!adsState.crossPromo;
      $('[data-oneqr-preview-sponsored]').hidden=!adsState.enabled||!adsState.placements.nearby;
      const discovery=$('[data-oneqr-preview-discovery]');discovery.classList.toggle('is-basic',adsState.discovery==='plain');
      discovery.querySelector('button:first-child strong').textContent=adsState.discovery==='plain'?'Deals Nearby':'12 Deals Nearby';
      discovery.querySelector('button:first-child small').textContent=adsState.discovery==='plain'?'Explore around you':'Lunch deals around here';
      message.textContent=adsState.enabled?'Ads are enabled. Save to keep these placement choices.':'Turn on monetization to configure sponsored placements.';
      if(window.lucide)window.lucide.createIcons();
    }
    enabled.addEventListener('change',()=>{adsState.enabled=enabled.checked;syncAds();});
    crossPromo.addEventListener('change',()=>{adsState.crossPromo=crossPromo.checked;syncAds();});
    adsPanel.addEventListener('change',event=>{const placement=event.target.dataset.oneqrAdPlacement;const setting=event.target.dataset.oneqrSetting;if(placement)adsState.placements[placement]=event.target.checked;if(setting)adsState[setting]=event.target.value;syncAds();});
    $('[data-oneqr-ads-save]').addEventListener('click',event=>{localStorage.setItem(storageKey,JSON.stringify(adsState));message.textContent='Ad settings saved for Bitcoin Nail Bar.';event.currentTarget.focus();});
    syncAds();
  }
  drawStaff();selectTab(new URLSearchParams(location.search).get('section')||'staff');
})();
