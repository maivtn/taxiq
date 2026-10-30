import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source=readFileSync(new URL('../../../html/assets/community-v2/community-page-ads.js',import.meta.url),'utf8');
const key='nexora:ads-credit:v1';
function setup(t,wallet={balanceCents:35000,holdCents:3000,history:[]}){
  const dom=new JSDOM('<div id="modalRoot"></div>',{url:'https://nexora.test/html/assets/community-v2/nexora-community-prototype.html',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const w=dom.window;if(wallet)w.localStorage.setItem(key,JSON.stringify(wallet));w.eval(source);
  const saves=[];
  w.NEXORA_COMMUNITY_PAGE_ADS.open({id:'p1',title:'BITCOIN NAIL BAR',city:'Houston, TX'},null,record=>{saves.push(record);return true;});
  const form=w.document.querySelector('form');
  return {w,form,saves,submit:value=>form.requestSubmit(form.querySelector('[value="'+value+'"]'))};
}

test('Page promotion reads the shared Ads Credit balance less holds, including an empty wallet',t=>{
  const {w}=setup(t,{balanceCents:8500,holdCents:3000,history:[]});
  assert.equal(w.NEXORA_COMMUNITY_PAGE_ADS.readCredit().availableCents,5500);
  assert.equal(w.document.getElementById('pageAdsAvailable').textContent,'$55.00');
  const topup=w.document.querySelector('a');
  assert.equal(topup.href,'https://nexora.test/html/pages/nexora-packages.html?tab=ads-credit');
  w.localStorage.setItem(key,JSON.stringify({balanceCents:0,holdCents:0,history:[]}));
  w.dispatchEvent(new w.StorageEvent('storage',{key}));
  assert.equal(w.document.getElementById('pageAdsAvailable').textContent,'$0.00');
  assert.equal(w.document.getElementById('pageAdsCreditStatus').textContent,'Out of credit');
});

test('Insufficient Ads Credit blocks activation while allowing a draft without changing the wallet',t=>{
  const {w,form,saves,submit}=setup(t,{balanceCents:5000,holdCents:3000,history:[]});
  const before=w.localStorage.getItem(key);
  form.elements.budget.value='50';submit('activate');
  assert.equal(saves.length,0);assert.equal(w.document.getElementById('pageAdsError').textContent,'Insufficient credit');
  submit('draft');
  assert.equal(saves.length,1);assert.equal(saves[0].status,'draft');assert.equal(saves[0].budgetCents,5000);
  assert.equal(w.localStorage.getItem(key),before);
});

test('Owner activation records a pending paid campaign with the selected budget, dates, and placements',t=>{
  const {w,form,saves,submit}=setup(t);
  const before=w.localStorage.getItem(key);
  form.elements.budget.value='75.50';form.elements.start.value='2026-10-30';form.elements.end.value='2026-11-06';
  form.querySelector('[name="placement"][value="pages"]').checked=false;
  submit('activate');
  assert.equal(saves.length,1);
  const saved=JSON.parse(JSON.stringify(saves[0]));
  assert.deepEqual(saved,{status:'pending',fundingSource:'ads-credit',paidEnabled:true,budget:75.5,budgetCents:7550,startsOn:'2026-10-30',endsOn:'2026-11-06',placements:['feed'],area:'Houston, TX'});
  assert.equal(w.localStorage.getItem(key),before);
});

test('Missing placements and reversed dates cannot submit a Page campaign',t=>{
  const {w,form,saves,submit}=setup(t);
  form.querySelectorAll('[name="placement"]').forEach(input=>input.checked=false);submit('activate');
  assert.equal(saves.length,0);assert.match(w.document.getElementById('pageAdsError').textContent,/placement/);
  form.querySelector('[name="placement"]').checked=true;
  form.elements.start.value='2026-11-06';form.elements.end.value='2026-10-30';submit('activate');
  assert.equal(saves.length,0);assert.match(w.document.getElementById('pageAdsError').textContent,/end date/);
});

test('Opening a legacy preview does not turn its old fixed price into a paid campaign',t=>{
  const {w}=setup(t);let saved;
  w.NEXORA_COMMUNITY_PAGE_ADS.open({id:'p1',title:'BITCOIN NAIL BAR',city:'Houston, TX'},{status:'preview',price:19,startsOn:'2026-10-30',endsOn:'2026-11-06'},record=>{saved=record;});
  const form=w.document.querySelector('form');form.elements.budget.value='30';form.requestSubmit(form.querySelector('[value="draft"]'));
  assert.equal(saved.status,'draft');assert.equal(saved.price,undefined);assert.equal(saved.fundingSource,'ads-credit');
});
