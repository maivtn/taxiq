(function () {
  'use strict';
  const root=document.querySelector('[data-printer-setup]');if(!root)return;
  const key='nexora:pos:printer-setup:v1',receiptKey='nexora.pos.printer.receipt-settings.v1';
  const defaults={method:'airprint',paperWidth:'80',printerMode:'star-desktop',printProducts:false,sortServices:false,cardCopies:1,otherCopies:0,lastTest:null};
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value)||0);
  const formatDate=value=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(value));
  const copyCount=(value,fallback)=>Number.isFinite(Number(value))?Math.max(0,Math.min(3,Math.round(Number(value)))):fallback;
  function read(){
    let saved={},receipt={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(_){}try{receipt=JSON.parse(localStorage.getItem(receiptKey)||'{}')||{};}catch(_){}
    return {method:saved.method==='star'?'star':'airprint',paperWidth:saved.paperWidth==='58'?'58':'80',printerMode:['star-desktop','starprnt','portable-escpos','bsc10-escpos'].includes(saved.printerMode)?saved.printerMode:defaults.printerMode,printProducts:typeof receipt.printProducts==='boolean'?receipt.printProducts:defaults.printProducts,sortServices:typeof receipt.sortServices==='boolean'?receipt.sortServices:defaults.sortServices,cardCopies:copyCount(receipt.cardCopies,defaults.cardCopies),otherCopies:copyCount(receipt.otherCopies,defaults.otherCopies),lastTest:saved.lastTest&&!Number.isNaN(Date.parse(saved.lastTest))?saved.lastTest:null};
  }
  let saved=read(),draft={...saved};
  const preview=document.querySelector('[data-printer-preview]'),receipt=preview.querySelector('[data-printer-receipt]');
  const configValues=value=>JSON.stringify([value.printProducts,value.sortServices,value.cardCopies,value.otherCopies]);
  function saveDevice(){try{localStorage.setItem(key,JSON.stringify({method:draft.method,paperWidth:draft.paperWidth,printerMode:draft.printerMode,lastTest:draft.lastTest}));return true;}catch(_){return false;}}
  function render(){
    root.querySelectorAll('[name="pps-print-method"]').forEach(input=>input.checked=input.value===draft.method);
    root.querySelector('[data-printer-airprint]').hidden=draft.method!=='airprint';root.querySelector('[data-printer-star]').hidden=draft.method!=='star';
    root.querySelector('[name="pps-paper-width"]').value=draft.paperWidth;root.querySelector('[name="pps-printer-mode"]').value=draft.printerMode;
    root.querySelectorAll('[data-printer-toggle]').forEach(button=>button.setAttribute('aria-checked',String(draft[button.dataset.printerToggle])));
    root.querySelectorAll('[data-printer-count]').forEach(output=>output.value=draft[output.dataset.printerCount]);
    root.querySelectorAll('[data-printer-copy]').forEach(button=>button.disabled=Number(button.dataset.delta)<0?draft[button.dataset.printerCopy]<=0:draft[button.dataset.printerCopy]>=3);
    const dirty=configValues(draft)!==configValues(saved);
    root.querySelector('[data-printer-save]').disabled=!dirty;root.querySelector('[data-printer-save-status]').textContent=dirty?'':'All changes saved';
    root.querySelector('[data-printer-last-test]').textContent=draft.lastTest?formatDate(draft.lastTest)+' · '+new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit'}).format(new Date(draft.lastTest)):'Choose “Print test receipt” above to check your printer.';
  }
  function showTest(){
    const catalog=window.NEXORA_SALON_DATA.loadCatalog(),services=catalog.services.filter(service=>service.active!==false&&Number(service.price)>0).slice(0,2).reverse().map(service=>({name:service.name,price:Number(service.price)}));
    if(draft.sortServices)services.sort((a,b)=>a.name.localeCompare(b.name));
    const product=catalog.salon.products?.find(item=>item.active!==false&&Number(item.price)>0)||{name:'Cuticle Oil',price:12};
    const items=[...services,...(draft.printProducts?[product]:[])],now=new Date();
    receipt.dataset.paperWidth=draft.method==='star'?draft.paperWidth:'80';
    receipt.innerHTML=`<h3>${esc(catalog.salon.name)}</h3><p>Print test receipt</p><p class="pps-receipt-date">${formatDate(now)}<br>${new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit'}).format(now)}</p><hr>${items.map(item=>`<div class="pps-receipt-row"><span>${esc(item.name)}</span><strong>${money(item.price)}</strong></div>`).join('')}<hr><div class="pps-receipt-row"><strong>Total</strong><strong>${money(items.reduce((sum,item)=>sum+Number(item.price),0))}</strong></div>`;
    preview.showModal();
  }
  root.addEventListener('change',event=>{
    const name=event.target.name;
    if(name==='pps-print-method')draft.method=event.target.value;
    if(name==='pps-paper-width')draft.paperWidth=event.target.value;
    if(name==='pps-printer-mode')draft.printerMode=event.target.value;
    if(['pps-print-method','pps-paper-width','pps-printer-mode'].includes(name)){saveDevice();render();}
  });
  root.addEventListener('click',event=>{
    const toggle=event.target.closest('[data-printer-toggle]');if(toggle){draft[toggle.dataset.printerToggle]=!draft[toggle.dataset.printerToggle];render();return;}
    const stepper=event.target.closest('[data-printer-copy]');if(stepper){const name=stepper.dataset.printerCopy;draft[name]=copyCount(draft[name]+Number(stepper.dataset.delta),draft[name]);render();return;}
    if(event.target.closest('[data-printer-test]'))showTest();
    if(event.target.closest('[data-printer-save]')){try{localStorage.setItem(receiptKey,JSON.stringify({printProducts:draft.printProducts,sortServices:draft.sortServices,cardCopies:draft.cardCopies,otherCopies:draft.otherCopies}));if(saveDevice()){saved={...draft};render();window.dispatchEvent(new CustomEvent('nexora:printer-settings-changed'));}}catch(_){}}
  });
  preview.querySelectorAll('[data-printer-close]').forEach(button=>button.addEventListener('click',()=>preview.close()));
  preview.addEventListener('click',event=>{if(event.target===preview){const rect=preview.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)preview.close();}});
  preview.querySelector('[data-printer-print]').addEventListener('click',()=>{document.body.classList.add('pps-printing');try{window.print();draft.lastTest=new Date().toISOString();saveDevice();render();}finally{document.body.classList.remove('pps-printing');}});
  window.addEventListener('storage',event=>{if(event.key===key||event.key===receiptKey){saved=read();draft={...saved};render();}});
  render();
})();
