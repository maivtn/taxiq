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
    $('#overview-guests').innerHTML=rows.map(g=>'<tr><td><strong>#'+g.sequence+'</strong></td><td>'+esc(g.time)+'</td><td><strong>'+esc(g.name)+'</strong><small class="phone">'+esc(g.phone)+'</small></td><td><span class="guest-tag '+(g.type==='RETURNING'?'returning':'')+'">'+g.type+'</span></td><td>'+esc(g.source)+'</td><td>'+esc(g.service)+'</td><td>'+esc(g.tech)+'</td><td><span class="status-text '+g.status+'">'+g.status.replace('-',' ')+'</span></td></tr>').join('');
  }
  $('#checkin-summary').addEventListener('click',()=>{
    renderGuests();$('#tickets-view').hidden=true;$('#overview-view').hidden=false;$('#overview-title').focus();
  });
  $('[data-overview-back]').addEventListener('click',()=>{
    $('#overview-view').hidden=true;$('#tickets-view').hidden=false;$('#checkin-summary').focus();
  });
  $('#overview-filter').addEventListener('change',renderGuests);
  $('#overview-search').addEventListener('input',renderGuests);
})();
