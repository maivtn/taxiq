const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
function boot(saved){
 const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'pos-phase-1.html'),'utf8'),{url:'https://example.test/pages/pos-phase-1.html?tab=estimate',runScripts:'outside-only'}),w=dom.window;
 w.matchMedia=()=>({matches:false,addEventListener(){}});w.structuredClone=structuredClone;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 for(const [key,value] of Object.entries(saved||{}))w.localStorage.setItem(key,value);
 for(const script of w.document.scripts){
  if(script.src){const src=script.getAttribute('src');if(src.startsWith('../assets/'))w.eval(fs.readFileSync(path.join(__dirname,src),'utf8'));}
  else w.eval(script.textContent);
 }
 return dom;
}
test('POS estimate checks in all selected services and retains quote after reload',()=>{
 const dom=boot(),w=dom.window,d=w.document;
 assert.equal(d.querySelector('.pos-panel.is-active').dataset.posPanel,'estimate');
 d.querySelector('[data-est-add="pedi"]').click();d.querySelector('[data-est-add="mani"]').click();
 d.querySelector('[data-est-preset="10"]').click();d.querySelector('[data-est-checkin]').click();
 d.querySelector('.estimate-dialog [name="customerName"]').value='Estimate Guest';d.querySelector('.estimate-dialog [name="phone"]').value='5551112222';
 d.querySelector('.estimate-dialog form').dispatchEvent(new w.Event('submit',{cancelable:true}));
 assert.equal(d.querySelector('[data-est-submit-error]').textContent,'');
 assert.equal(d.querySelector('.pos-panel.is-active').dataset.posPanel,'tickets');
 const record=w.NEXORA_APPOINTMENTS_STORE.loadAll().find(x=>x.customerName==='Estimate Guest');
 assert.equal(record.status,'checked-in');assert.equal(record.tickets.length,2);assert.equal(record.metadata.estimate.totalCents,4680);
 assert.match(d.querySelector('[data-pos-panel="tickets"]').textContent,/Estimate Guest/);
 const saved={};for(let i=0;i<w.localStorage.length;i++){const key=w.localStorage.key(i);saved[key]=w.localStorage.getItem(key);}w.close();
 const restored=boot(saved);
 restored.window.activateMainTab('tickets');
 assert.match(restored.window.document.querySelector('[data-pos-panel="tickets"]').textContent,/Estimate Guest/);
 assert.equal(restored.window.NEXORA_APPOINTMENTS_STORE.loadAll().find(x=>x.id===record.id).metadata.estimate.totalCents,4680);
 restored.window.close();
});
