import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const read=path=>readFileSync(new URL('../../../'+path,import.meta.url),'utf8');
const vendor=read('html/assets/vendor/tom-select/tom-select.complete.min.js');
const source=read('html/assets/community-v2/community-deals-selects.js');

function setup(t,body){
  const dom=new JSDOM('<!doctype html><html><body>'+body+'</body></html>',{url:'https://nexora.test/html/assets/community-v2/deals/nearby.html',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,observers=[],script=w.document.createElement('script');
  const Observer=w.MutationObserver;
  w.MutationObserver=class extends Observer{constructor(callback){super(callback);observers.push(this);}};
  t.after(()=>{observers.forEach(observer=>observer.disconnect());w.close();});
  script.src='https://nexora.test/html/assets/community-v2/community-deals-selects.js';
  Object.defineProperty(w.document,'currentScript',{value:script});
  w.eval(vendor);w.eval(source);
  return {w,api:w.NEXORA_DEAL_SELECTS};
}

test('Deals dropdown stays open and keeps the same options during repeated UI synchronization',t=>{
  const {w,api}=setup(t,'<select id="industry"><option value="">All industries</option><option value="food">Food & drink</option><option value="beauty">Beauty & personal care</option></select>');
  const select=w.document.getElementById('industry'),control=api.enhance(select,{industry:true,group:true});
  control.open();control.refreshOptions(false);
  const option=control.getOption('food');
  assert.ok(option);
  for(let n=0;n<12;n++)api.enhance(select,{industry:true,group:true});
  assert.equal(control.getOption('food'),option,'synchronization must not replace an option that the user is tapping');
  assert.equal(select.options.length,3,'empty options must not accumulate');
  assert.equal(control.isOpen,true);
});

test('Deals chip selects propagate a choice once and retain it through refresh, including All',t=>{
  const {w,api}=setup(t,'<div id="groups"><button class="on" data-group="">All industries</button><button data-group="food">Food & drink</button></div>');
  let calls=0;
  const buttons=[...w.document.querySelectorAll('button')];
  for(const button of buttons)button.addEventListener('click',()=>{calls++;buttons.forEach(row=>row.classList.toggle('on',row===button));});
  const sync=()=>api.chips('groups','data-group','Industry',{industry:true,group:true});
  sync();const select=w.document.getElementById('deal-select-groups'),control=select.tomselect;
  control.setValue('food');
  for(let n=0;n<6;n++)sync();
  assert.equal(calls,1);assert.equal(select.value,'food');assert.equal(control.getValue(),'food');
  control.setValue('');
  for(let n=0;n<6;n++)sync();
  assert.equal(calls,2);assert.equal(control.getValue(),'');
  assert.equal(select.options.length,2);
});

test('Deals data selects update dependent options without retaining the previous industry',t=>{
  const {w,api}=setup(t,'<div id="source"></div>');
  const source=w.document.getElementById('source'),changes=[];
  api.data('industry','Industry',source,[{value:'',text:'All industries'},{value:'nail',text:'Nail salon'}],'nail',value=>changes.push(value),{industry:true});
  const select=w.document.getElementById('deal-select-industry');
  api.data('industry','Industry',source,[{value:'',text:'All industries'},{value:'food',text:'Restaurant'}],'',value=>changes.push(value),{industry:true});
  assert.equal(select.tomselect.getValue(),'');assert.equal(select.tomselect.options.nail,undefined);
  select.tomselect.setValue('food');assert.deepEqual(changes,['food']);
});

test('Deals selects follow native disabled and visibility changes',t=>{
  const {w,api}=setup(t,'<select id="city" class="in hidden" disabled><option value="">City</option><option value="Houston">Houston</option></select>');
  const select=w.document.getElementById('city'),control=api.enhance(select);
  assert.equal(control.isDisabled,true);assert.equal(control.wrapper.hidden,true);
  select.disabled=false;select.classList.remove('hidden');api.enhance(select);
  assert.equal(control.isDisabled,false);assert.equal(control.wrapper.hidden,false);assert.equal(control.wrapper.classList.contains('hidden'),false);
  select.disabled=true;api.enhance(select);assert.equal(control.isDisabled,true);
});

test('Deals offer industry search and native form values survive option synchronization',t=>{
  const {w,api}=setup(t,'<form><select name="industry" required><option value="">Select</option><option value="Nail salon">Nail salon</option><option value="Hair salon">Hair salon</option></select><input name="title" value="A new offer"></form>');
  const select=w.document.querySelector('select'),control=api.enhance(select,{industry:true});
  control.open();control.setTextboxValue('Hair');control.refreshOptions(false);
  const option=control.getOption('Hair salon');
  for(let n=0;n<8;n++)api.enhance(select,{industry:true});
  assert.equal(control.control_input.value,'Hair');assert.equal(control.getOption('Hair salon'),option);
  control.setValue('Hair salon');
  assert.equal(new w.FormData(w.document.querySelector('form')).get('industry'),'Hair salon');
  assert.equal(w.document.querySelector('input[name="title"]').value,'A new offer');
});

test('Deals illustrated industry choices keep one OneQR icon when the shared registry refreshes',async t=>{
  const {w,api}=setup(t,'<form><select id="industry" name="industry"><option value="">Select</option><option value="Nail salon" selected>Nail salon</option></select></form>');
  const select=w.document.getElementById('industry'),control=api.enhance(select,{industry:true});
  w.document.currentScript.src='https://nexora.test/html/assets/industry-icons.js';
  w.eval(read('html/assets/industry-icons.js'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  await new Promise(resolve=>w.requestAnimationFrame(()=>w.requestAnimationFrame(resolve)));
  const item=control.control.querySelector('.item');
  assert.equal(item.querySelectorAll('img').length,1,'the generic registry must not add a second icon');
  assert.match(item.querySelector('img').src,/\/icon-oneqr\/industry\/nail\.png$/);
});
