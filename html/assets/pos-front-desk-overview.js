/* Overview sample data and layout follow tmp/front-desk-prototype.html. */
(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names = ['Anna','Brian','Sophia','Emily','Ava','Mia','Quan','Leo','Olivia','Isabella','Camila','Luna'];
  const services = ['Deluxe Pedicure','Dipping Powder','Gel Manicure','Acrylic Full Set','Express Pedicure'];
  const techs = ['Kayla Bui','Lana VMM','Chloe','HUU','Michael'];
  const statuses = ['completed','completed','in-service','waiting','completed','cancelled'];
  const guests = Array.from({length:48}, (_,index) => {
    const sequence=index+1,isNew=sequence%4===0,hour=9+Math.floor(index/6),minute=(index%6)*10;
    return {sequence,time:`${hour>12?hour-12:hour}:${String(minute).padStart(2,'0')} ${hour>=12?'PM':'AM'}`,
      name:names[index%names.length]+(sequence>12?` ${sequence}`:''),phone:`(555) 010-${String(1000+sequence).slice(-4)}`,
      type:isNew?'NEW GUEST':'RETURNING',source:isNew?['Google Maps','Customer Referral','Instagram','Facebook'][index%4]:'Original: Customer Profile',
      service:services[index%services.length],tech:techs[index%techs.length],status:statuses[index%statuses.length]};
  });
  const sources = [['Google Search/Maps',5],['Customer Referral',3],['Instagram',2],['Walk-in',1],['TikTok',1]];
  $('#source-breakdown').innerHTML=sources.map(([name,count])=>'<div class="source-row"><span>'+esc(name)+'</span><div class="source-bar" aria-hidden="true"><span style="width:'+count/5*100+'%"></span></div><strong>'+count+'</strong></div>').join('');
  function renderGuests() {
    const status=$('#overview-filter').value,query=$('#overview-search').value.trim().toLowerCase(),digits=query.replace(/\D/g,'');
    const rows=guests.filter(guest=>(status==='all'||guest.status===status)&&(!query||guest.name.toLowerCase().includes(query)||guest.phone.includes(query)||(digits&&/^[\d\s()+.-]+$/.test(query)&&guest.phone.replace(/\D/g,'').includes(digits))));
    $('#overview-result-count').textContent=rows.length;
    $('#overview-empty').hidden=rows.length>0;
    $('#overview-guests').innerHTML=rows.map(g=>'<tr><td><strong>#'+g.sequence+'</strong></td><td>'+esc(g.time)+'</td><td><strong>'+esc(g.name)+'</strong><small class="phone">'+esc(g.phone)+'</small></td><td><span class="guest-tag '+(g.type==='RETURNING'?'returning':'')+'">'+g.type+'</span></td><td>'+esc(g.source)+'</td><td>'+esc(g.service)+'</td><td>'+esc(g.tech)+'</td><td><span class="status-text '+g.status+'">'+g.status.replace('-',' ')+'</span></td><td class="overview-detail-action"><button type="button" data-checkin-detail="'+g.sequence+'" aria-label="View Detail for check-in #'+g.sequence+' · '+esc(g.name)+'">View Detail</button></td></tr>').join('');
  }
  const detailDialog=$('#checkin-detail-dialog');
  let detailTrigger=null;
  $('#overview-guests').addEventListener('click',event=>{
    const button=event.target.closest('[data-checkin-detail]');if(!button)return;
    const guest=guests.find(guest=>guest.sequence===Number(button.dataset.checkinDetail));if(!guest)return;
    detailTrigger=button;
    $('#checkin-detail-title').textContent='Check-in #'+guest.sequence;
    const statusLabels={waiting:'Waiting','in-service':'In Service',completed:'Completed',cancelled:'Cancelled'};
    const fields=[['Customer',guest.name],['Phone',guest.phone],['Check-in time',guest.time],['Guest type',guest.type==='RETURNING'?'Returning Guest':'New Guest'],['Source',guest.source],['Service',guest.service],['Technician',guest.tech],['Status',statusLabels[guest.status]]];
    $('#checkin-detail-content').innerHTML=fields.map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+esc(value)+'</dd></div>').join('');
    detailDialog.showModal();
  });
  function restoreDetailFocus(){if(detailTrigger&&detailTrigger.isConnected)detailTrigger.focus();}
  detailDialog.addEventListener('close',restoreDetailFocus);
  detailDialog.querySelectorAll('[data-close-checkin-detail]').forEach(button=>button.addEventListener('click',()=>{detailDialog.close();restoreDetailFocus();}));
  function showView(overview,focus=false) {
    if(detailDialog.open)detailDialog.close();
    if(overview)renderGuests();
    $('#tickets-view').hidden=overview;$('#overview-view').hidden=!overview;
    if(focus)$(overview?'#overview-title':'#checkin-summary').focus();
  }
  function navigate(overview) {
    const url=new URL(window.location.href);
    if(overview)url.searchParams.set('view','overview');else url.searchParams.delete('view');
    if(url.href!==window.location.href)window.history.pushState(window.history.state,'',url.href);
    showView(overview,true);
  }
  function overviewFromUrl(){return new URL(window.location.href).searchParams.get('view')==='overview';}
  $('#checkin-summary').addEventListener('click',()=>navigate(true));
  $('[data-overview-back]').addEventListener('click',()=>navigate(false));
  window.addEventListener('popstate',()=>showView(overviewFromUrl(),true));
  showView(overviewFromUrl());
  $('#overview-filter').addEventListener('change',renderGuests);
  $('#overview-search').addEventListener('input',renderGuests);
})();
