/* The staging One QR Check-in tab combines QR artwork and tablet setup in exclusive detail panels. */
(function(){
  'use strict';
  var root=document.querySelector('[data-oneqr-checkin]');if(!root)return;
  var details=root.querySelector('#oneqr-checkin-details'),opened='';
  var link=new URL('../customer/check-in-mobile.html',location.href).href;
  function count(){var active=window.NEXORA_CHECKIN_DEVICES?.activeCount()||0;root.querySelector('[data-checkin-device-count]').textContent=active+' active '+(active===1?'device':'devices');}
  function show(kind,focus,updateURL){
    opened=['qr','device'].includes(kind)?kind:'';
    details.hidden=!opened;details.setAttribute('aria-label',opened==='device'?'Self Check-in Device':'QR Self Check-in');
    root.querySelector('[data-oneqr-qr-detail]').hidden=opened!=='qr';root.querySelector('[data-oneqr-device-detail]').hidden=opened!=='device';
    root.querySelectorAll('[data-checkin-expand]').forEach(button=>button.setAttribute('aria-expanded',String(button.dataset.checkinExpand===opened)));
    root.querySelectorAll('[data-checkin-option]').forEach(card=>card.classList.toggle('is-expanded',card.dataset.checkinOption===opened));
    if(updateURL){var url=new URL(location.href);if(opened)url.searchParams.set('setup',opened);else url.searchParams.delete('setup');history.replaceState(history.state,'',url.href);}
    if(focus&&opened)details.focus();
  }
  root.querySelectorAll('[data-checkin-expand]').forEach(button=>button.addEventListener('click',()=>show(opened===button.dataset.checkinExpand?'':button.dataset.checkinExpand,true,true)));
  root.querySelector('[data-checkin-close]').addEventListener('click',()=>{var previous=opened;show('',false,true);root.querySelector('[data-checkin-expand="'+previous+'"]')?.focus({preventScroll:true});});
  root.querySelector('[data-checkin-copy]').addEventListener('click',()=>root.querySelector('#qr-copy').click());
  if(window.QRCode)new QRCode(root.querySelector('#checkin-summary-qr'),{text:link,width:72,height:72,correctLevel:QRCode.CorrectLevel.M});
  function sync(tab){if(tab==='check-in'){var query=new URLSearchParams(location.search);show(query.get('setup')||(query.has('pair')?'device':''),false,false);}else show('',false,false);}
  window.addEventListener('nexora:qr-tab-changed',event=>sync(event.detail.tab));
  window.addEventListener('nexora:checkin-devices-changed',count);
  sync(new URLSearchParams(location.search).get('tab'));count();
})();
