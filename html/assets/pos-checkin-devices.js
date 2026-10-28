/* Device controls from the merged staging Check-in screen; pairing and edits remain local demo data. */
(function () {
  'use strict';
  var root=document.querySelector('[data-oneqr-device-detail]');if(!root)return;
  var key='nexora.checkin-devices.demo.v1',state,filter='All',drawn='',rotating=false,editing=null;
  var params=new URLSearchParams(location.search),kiosk=new URL('../customer/check-in-mobile.html?mode=kiosk',location.href).href;
  var dialog=document.getElementById('checkin-device-edit'),form=document.getElementById('checkin-device-edit-form');
  var $=selector=>root.querySelector(selector);
  function defaults(){return {rows:[{id:'demo-ipad',name:'ipad',status:'Expired',by:'NEXORA TOUCH',paired:'2026-09-16T17:55:00',activity:'2026-09-16T17:55:00',device:'Mozilla/5.0'},{id:'demo-phone',name:'phone',status:'Revoked',by:'NEXORA TOUCH',paired:'2026-08-27T09:52:00',activity:'2026-08-31T14:01:00',device:'Mozilla/5.0'}]};}
  function read(){var value=JSON.parse(localStorage.getItem(key)||'null');return value&&Array.isArray(value.rows)?value:defaults();}
  function rotate(value){value.code='DEMO'+Math.random().toString(36).slice(2,14).toUpperCase();value.expires=Date.now()+15*60000;value.rotation=(value.rotation||0)+1;}
  function notice(text){var el=$('.nxa-pair-state');if(!el){el=document.createElement('p');el.className='nxa-pair-state';el.setAttribute('role','status');root.prepend(el);}el.textContent=text;}
  function mutate(change){var action=function(){var latest=read();if(change(latest)!==false)localStorage.setItem(key,JSON.stringify(latest));state=latest;render();};return (navigator.locks?navigator.locks.request(key,action):Promise.resolve().then(action)).catch(error=>notice(error.message));}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function date(v){var d=new Date(v);return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+' '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
  function activeCount(){try{return (state||read()).rows.filter(row=>row.status==='Active').length;}catch(_){return 0;}}
  function render(){
    if(!state)return;
    $('[data-device-heading]').textContent='Paired tablets ('+activeCount()+' active)';
    $('#device-rows').innerHTML=state.rows.filter(row=>filter==='All'||row.status===filter).map(row=>'<tr><td><strong>'+esc(row.name)+'</strong></td><td><span class="nxa-pill '+(row.status==='Active'?'active':'')+'">'+esc(row.status)+'</span></td><td>'+esc(row.by)+'</td><td>'+date(row.paired)+'</td><td>'+date(row.activity)+'</td><td>'+esc(row.device)+'</td><td>'+(row.status==='Active'?'<div class="oneqr-device-actions"><button type="button" class="nxa-button" data-device-edit="'+esc(row.id)+'"><i data-lucide="pencil" aria-hidden="true"></i>Edit</button><button type="button" class="nxa-button danger" data-device-revoke="'+esc(row.id)+'"><i data-lucide="shield-off" aria-hidden="true"></i>Revoke</button></div>':row.revokedAt?date(row.revokedAt):'—')+'</td></tr>').join('');
    if(drawn!==state.code){
      drawn=state.code;var el=$('#device-qr');el.replaceChildren();var url=new URL(location.href);url.search='';url.searchParams.set('tab','check-in');url.searchParams.set('setup','device');url.searchParams.set('pair',state.code);
      if(window.QRCode)new QRCode(el,{text:url.href,width:140,height:140,correctLevel:QRCode.CorrectLevel.M});
    }
    $('#device-code').textContent='Code '+state.code+' · rotation '+state.rotation;countdown();
    window.dispatchEvent(new CustomEvent('nexora:checkin-devices-changed',{detail:{active:activeCount()}}));
    window.lucide?.createIcons();
  }
  function countdown(){
    if(!state)return;var left=Math.max(0,Math.ceil((state.expires-Date.now())/1000));
    $('#device-expires').textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');$('#device-progress').value=Math.min(900,left);
    if(!left&&!rotating){rotating=true;mutate(latest=>{if(latest.expires>Date.now())return false;rotate(latest);}).finally(()=>{rotating=false;});}
  }
  function validateEdit(){
    var name=form.elements.name.value.trim(),pin=form.elements.pin.value,confirm=form.elements.confirmPin.value;
    var valid=!pin&&!confirm||/^[0-9]{4,6}$/.test(pin)&&pin===confirm;
    form.querySelector('[data-device-edit-save]').disabled=!editing||!name||!valid||name===editing.name&&!pin;
  }
  $('#device-kiosk').href=kiosk;$('#device-kiosk').target='_blank';$('#device-kiosk').rel='noopener';$('#device-kiosk-text').textContent=kiosk;
  $('#device-copy').addEventListener('click',async function(){try{await navigator.clipboard.writeText(kiosk);}catch(_){var r=document.createRange();r.selectNodeContents($('#device-kiosk-text'));var s=getSelection();s.removeAllRanges();s.addRange(r);}});
  $('#device-new-code').addEventListener('click',()=>mutate(rotate));
  root.querySelectorAll('[data-device-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.deviceFilter;root.querySelectorAll('[data-device-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));render();}));
  root.addEventListener('click',event=>{
    var edit=event.target.closest('[data-device-edit]'),revoke=event.target.closest('[data-device-revoke]');
    if(edit){editing=read().rows.find(row=>row.id===edit.dataset.deviceEdit&&row.status==='Active');if(!editing)return;form.reset();form.elements.name.value=editing.name;validateEdit();dialog.showModal();}
    if(revoke)mutate(latest=>{var row=latest.rows.find(row=>row.id===revoke.dataset.deviceRevoke);if(!row||row.status!=='Active')return false;row.status='Revoked';row.revokedAt=new Date().toISOString();});
  });
  form.addEventListener('input',validateEdit);
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!editing||!form.reportValidity()||form.querySelector('[data-device-edit-save]').disabled)return;
    var id=editing.id,name=form.elements.name.value.trim(),pin=form.elements.pin.value,pinHash='';
    if(pin){var digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(pin));pinHash=Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');}
    await mutate(latest=>{var row=latest.rows.find(row=>row.id===id&&row.status==='Active');if(!row)return false;row.name=name;if(pinHash)row.accessPinHash=pinHash;});
    dialog.close();
  });
  form.querySelectorAll('[data-device-edit-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('close',()=>{var id=editing?.id;editing=null;form.reset();Array.from(root.querySelectorAll('[data-device-edit]')).find(button=>button.dataset.deviceEdit===id)?.focus({preventScroll:true});});
  window.addEventListener('storage',event=>{if(event.key!==key&&event.key!==null)return;try{state=read();if(dialog.open)dialog.close();render();}catch(error){notice(error.message);}});
  window.NEXORA_CHECKIN_DEVICES={activeCount:activeCount};
  mutate(latest=>{
    latest.rows.forEach(row=>{if(!row.id)row.id=crypto.randomUUID();});
    if(params.has('pair')){
      var valid=params.get('pair')===latest.code&&latest.expires>Date.now();notice(valid?'Active':'Expired');
      if(valid){latest.rows.unshift({id:crypto.randomUUID(),name:'Device',status:'Active',by:'NEXORA TOUCH',paired:new Date().toISOString(),activity:new Date().toISOString(),device:'Mozilla/5.0'});rotate(latest);}
      var url=new URL(location.href);url.searchParams.delete('pair');history.replaceState(history.state,'',url.href);
    }
    if(!latest.code||!Number.isFinite(latest.expires)||latest.expires<=Date.now())rotate(latest);
  });
  window.setInterval(countdown,1000);
})();
