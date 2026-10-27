/* Local kiosk/pairing demo. All tabs reread the same local store before a write. */
(function () {
  'use strict';
  var key='nexora.checkin-devices.demo.v1',state,filter='All',drawn='',rotating=false;
  var params=new URLSearchParams(location.search),kiosk=new URL('../customer/check-in-mobile.html?mode=kiosk',location.href).href;
  function defaults(){return {rows:[{name:'ipad',status:'Expired',by:'NEXORA TOUCH',paired:'2026-09-16T17:55:00',activity:'2026-09-16T17:55:00',device:'Mozilla/5.0'},{name:'phone',status:'Revoked',by:'NEXORA TOUCH',paired:'2026-08-27T09:52:00',activity:'2026-08-31T14:01:00',device:'Mozilla/5.0'}]};}
  function read(){var value=JSON.parse(localStorage.getItem(key)||'null');return value&&Array.isArray(value.rows)?value:defaults();}
  function rotate(value){value.code='DEMO'+Math.random().toString(36).slice(2,14).toUpperCase();value.expires=Date.now()+15*60000;value.rotation=(value.rotation||0)+1;}
  function notice(text){var el=document.querySelector('.nxa-pair-state');if(!el){el=document.createElement('p');el.className='nxa-pair-state';el.setAttribute('role','status');document.querySelector('.nx-admin').prepend(el);}el.textContent=text;}
  function mutate(change){var action=function(){var latest=read();if(change(latest)!==false)localStorage.setItem(key,JSON.stringify(latest));state=latest;render();};return (navigator.locks?navigator.locks.request(key,action):Promise.resolve().then(action)).catch(error=>notice(error.message));}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function date(v){var d=new Date(v);return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+' '+d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});}
  function render(){
    if(!state)return;
    document.querySelector('.nxa-section-head h2').textContent='Paired tablets ('+state.rows.filter(r=>r.status==='Active').length+' active)';
    document.getElementById('device-rows').innerHTML=state.rows.filter(r=>filter==='All'||r.status===filter).map(r=>'<tr><td>'+esc(r.name)+'</td><td><span class="nxa-pill '+(r.status==='Active'?'active':'')+'">'+esc(r.status)+'</span></td><td>'+esc(r.by)+'</td><td>'+date(r.paired)+'</td><td>'+date(r.activity)+'</td><td>'+esc(r.device)+'</td><td>—</td></tr>').join('');
    if(drawn!==state.code){drawn=state.code;var el=document.getElementById('device-qr');el.replaceChildren();var url=new URL(location.pathname,location.origin);url.searchParams.set('pair',state.code);if(window.QRCode)new QRCode(el,{text:url.href,width:140,height:140,correctLevel:QRCode.CorrectLevel.M});}
    document.getElementById('device-code').textContent='Code '+state.code+' · rotation '+state.rotation;countdown();
  }
  function countdown(){if(!state)return;var left=Math.max(0,Math.ceil((state.expires-Date.now())/1000));document.getElementById('device-expires').textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');if(!left&&!rotating){rotating=true;mutate(latest=>{if(latest.expires>Date.now())return false;rotate(latest);}).finally(()=>{rotating=false;});}}
  document.getElementById('device-kiosk').href=kiosk;document.getElementById('device-kiosk-text').textContent=kiosk;
  document.getElementById('device-copy').addEventListener('click',async function(){try{await navigator.clipboard.writeText(kiosk);}catch(_){var r=document.createRange();r.selectNodeContents(document.getElementById('device-kiosk-text'));var s=getSelection();s.removeAllRanges();s.addRange(r);}});
  document.getElementById('device-new-code').addEventListener('click',()=>mutate(rotate));
  document.querySelectorAll('[data-device-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.deviceFilter;document.querySelectorAll('[data-device-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();}));
  window.addEventListener('storage',event=>{if(event.key!==key&&event.key!==null)return;try{state=read();render();}catch(error){notice(error.message);}});
  mutate(latest=>{
    if(params.has('pair')){
      var valid=params.get('pair')===latest.code&&latest.expires>Date.now();notice(valid?'Active':'Expired');
      if(valid){latest.rows.unshift({name:'Device',status:'Active',by:'NEXORA TOUCH',paired:new Date().toISOString(),activity:new Date().toISOString(),device:'Mozilla/5.0'});rotate(latest);}
      history.replaceState(null,'',location.pathname);if(!valid&&latest.code&&latest.expires>Date.now())return false;
    }
    if(!latest.code||!Number.isFinite(latest.expires)||latest.expires<=Date.now())rotate(latest);
  });
  window.setInterval(countdown,1000);
})();
