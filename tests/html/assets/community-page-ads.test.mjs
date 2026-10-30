import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source=readFileSync(new URL('../../../html/assets/community-v2/community-page-ads.js',import.meta.url),'utf8');
const key='nexora:ads-credit:v1';
function setup(t,wallet={balanceCents:35000,holdCents:3000,history:[]},promotion=null,enable=true){
  const dom=new JSDOM('<div id="modalRoot"></div>',{url:'https://nexora.test/html/assets/community-v2/nexora-community-prototype.html',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const w=dom.window;if(wallet)w.localStorage.setItem(key,JSON.stringify(wallet));w.eval(source);
  const saves=[];
  w.NEXORA_COMMUNITY_PAGE_ADS.open({id:'p1',title:'BITCOIN NAIL BAR',city:'Houston, TX'},promotion,record=>{saves.push(record);return true;});
  const form=w.document.querySelector('form');
  const toggle=checked=>{form.elements.paidEnabled.checked=checked;form.elements.paidEnabled.dispatchEvent(new w.Event('change',{bubbles:true}));};
  if(enable)toggle(true);
  return {w,form,saves,toggle,submit:value=>form.requestSubmit(form.querySelector('[value="'+value+'"]'))};
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
  const form=w.document.querySelector('form');form.elements.paidEnabled.checked=true;form.elements.paidEnabled.dispatchEvent(new w.Event('change'));form.elements.budget.value='30';form.requestSubmit(form.querySelector('[value="draft"]'));
  assert.equal(saved.status,'draft');assert.equal(saved.price,undefined);assert.equal(saved.fundingSource,'ads-credit');
});

const campaign={status:'running',fundingSource:'ads-credit',paidEnabled:true,budget:75,budgetCents:7500,startsOn:'2026-10-30',endsOn:'2026-11-06',placements:['feed','pages'],area:'Houston, TX'};

test('New Page advertising starts off and saves without requiring disabled campaign fields',t=>{
  const {w,form,saves,submit}=setup(t,undefined,null,false);
  assert.equal(form.elements.paidEnabled.checked,false);assert.equal(form.elements.paidEnabled.getAttribute('aria-checked'),'false');
  assert.equal(form.querySelector('#pageAdsSettings').hidden,true);
  form.elements.budget.value='';form.elements.start.value='';form.elements.end.value='';
  form.querySelectorAll('[name="placement"]').forEach(input=>input.checked=false);
  const before=w.localStorage.getItem(key);submit('activate');
  assert.equal(saves[0].status,'off');assert.equal(saves[0].paidEnabled,false);assert.equal(w.localStorage.getItem(key),before);
});

test('Running Page advertising can pause with an empty wallet while keeping its configuration',t=>{
  const {w,form,saves,toggle,submit}=setup(t,{balanceCents:0,holdCents:0,history:[]},campaign);
  const before=w.localStorage.getItem(key);toggle(false);submit('activate');
  assert.equal(saves.length,1);assert.equal(saves[0].status,'paused');assert.equal(saves[0].paidEnabled,false);assert.equal(saves[0].pausedFrom,'running');
  for(const field of ['budget','budgetCents','startsOn','endsOn','area'])assert.equal(saves[0][field],campaign[field]);
  assert.deepEqual(Array.from(saves[0].placements),campaign.placements);assert.equal(w.localStorage.getItem(key),before);
  w.NEXORA_COMMUNITY_PAGE_ADS.open({id:'p1',title:'BITCOIN NAIL BAR',city:'Houston, TX'},saves[0],()=>true);
  const reopened=w.document.querySelector('form');assert.equal(reopened.elements.paidEnabled.checked,false);assert.equal(reopened.elements.budget.value,'75');
  assert.equal(form.querySelector('#pageAdsSettings').disabled,true);
});

test('Re-enabling an approved paused campaign resumes only if its configuration is unchanged',t=>{
  const {form,saves,submit}=setup(t,undefined,{...campaign,status:'paused',paidEnabled:false,pausedFrom:'running'});
  submit('activate');assert.equal(saves[0].status,'running');assert.equal(saves[0].paidEnabled,true);
  form.elements.budget.value='90';submit('activate');assert.equal(saves[1].status,'pending');
});

test('Re-enabling a paused pending campaign cannot bypass review',t=>{
  const {saves,submit}=setup(t,undefined,{...campaign,status:'paused',paidEnabled:false,pausedFrom:'pending'});
  submit('activate');assert.equal(saves[0].status,'pending');assert.equal(saves[0].paidEnabled,true);
});

test('Changing a running campaign before pausing cannot retain approval for the changed setup',t=>{
  const {form,saves,toggle,submit}=setup(t,undefined,campaign);
  form.elements.budget.value='90';toggle(false);submit('activate');
  assert.equal(saves[0].status,'paused');assert.equal(saves[0].pausedFrom,'pending');
});
