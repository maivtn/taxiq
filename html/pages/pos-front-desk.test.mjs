import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
function boot(query = '') {
  const dom=new JSDOM(readFileSync(new URL('./pos-front-desk.html',import.meta.url),'utf8'),{url:'https://example.test/pages/pos-front-desk.html'+query,runScripts:'outside-only'});
  const w=dom.window;
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  w.confirm=()=>true;
  w.structuredClone=structuredClone;
  w.matchMedia=()=>({matches:false});
  for(const name of ['salon-data','pos-turn-settings','appointment-tickets','appointments-store']) w.eval(readFileSync(new URL('../assets/'+name+'.js',import.meta.url),'utf8'));
  w.NEXORA_APPOINTMENTS_STORE.create({id:'test-1',customerName:'Jade <test>',phone:'1234567890',startAt:'2026-09-08T10:00:00',serviceNames:['Gel Manicure'],status:'confirmed'});
  w.eval(readFileSync(new URL('../assets/team-calendar-content.js',import.meta.url),'utf8'));
  w.eval(readFileSync(new URL('../assets/pos-front-desk.js',import.meta.url),'utf8'));
  return dom;
}
test('Front Desk filters shared appointments and switches views without losing records',()=>{
  const dom=boot(),d=dom.window.document;
  assert.match(d.querySelector('tbody').textContent,/Jade <test>/);
  assert.equal(d.querySelector('tbody test'),null);
  const filter=d.querySelector('#status-filter');filter.value='cancelled';filter.dispatchEvent(new dom.window.Event('change'));
  assert.match(d.querySelector('#booking-results').textContent,/No appointments/);
  filter.value='';filter.dispatchEvent(new dom.window.Event('change'));
  d.querySelector('[data-view="cards"]').click();assert.equal(d.querySelectorAll('.appointment-card').length,1);
  // Calendar opens even when the appointment filters have no results.
  filter.value='cancelled';filter.dispatchEvent(new dom.window.Event('change'));
  d.querySelector('[data-view="calendar"]').click();
  assert.equal(d.querySelector('iframe'),null);
  const calendarRoot=d.querySelector('#team-calendar').shadowRoot;
  assert.ok(calendarRoot.querySelector('.calendar-grid'));
  assert.equal(d.querySelector('#calendar-reward-settings').hidden,false);
  assert.equal(calendarRoot.querySelector('#reward-settings-button'),null);
  d.querySelector('#calendar-reward-settings').click();
  assert.ok(calendarRoot.querySelector('#reward-settings-drawer').innerHTML.length);
  calendarRoot.querySelector('[data-view="week"]').click();
  assert.ok(calendarRoot.querySelector('.overview-grid'));
  assert.equal(d.querySelector('[data-view="calendar"]').getAttribute('aria-pressed'),'true');
  assert.equal(d.querySelector('#team-calendar').hidden,false);
  assert.equal(d.querySelector('#booking-results').hidden,true);
  d.querySelector('[data-view="table"]').click();
  assert.equal(d.querySelector('#team-calendar').hidden,true);
  d.querySelector('[data-view="calendar"]').click();
  assert.equal(d.querySelector('#team-calendar').shadowRoot,calendarRoot);
  assert.ok(calendarRoot.querySelector('.overview-grid'));
  d.querySelector('[data-view="table"]').click();
  assert.equal(d.querySelector('#booking-results').hidden,false);
  filter.value='';filter.dispatchEvent(new dom.window.Event('change'));
  assert.match(d.querySelector('tbody').textContent,/Jade <test>/);
  dom.window.close();
});
test('Front Desk creates, reschedules, checks in, and cancels appointments through the shared store',()=>{
  const dom=boot(),w=dom.window,d=w.document,store=w.NEXORA_APPOINTMENTS_STORE;
  d.querySelector('[data-action="reschedule"]').click();
  d.querySelector('[name="startAt"]').value='2026-09-09T11:00';
  d.querySelector('#booking-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
  assert.equal(store.loadAll()[0].startAt,'2026-09-09T11:00:00');
  assert.equal(store.loadAll()[0].endAt,'2026-09-09T12:00:00');
  d.querySelector('[data-action="checkin"]').click();assert.equal(store.loadAll()[0].status,'checked-in');
  d.querySelector('#new-booking').click();
  d.querySelector('[name="customerName"]').value='New guest';d.querySelector('[name="phone"]').value='5551234567';d.querySelector('[name="startAt"]').value='2026-09-10T12:00';
  d.querySelector('#booking-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
  assert.equal(store.loadAll().length,2);
  d.querySelector('[data-action="cancel"]').click();assert.equal(store.loadAll().find(r=>r.customerName==='New guest').status,'cancelled');
  dom.window.close();
});

test('Front Desk deep links and browser history restore outer and calendar subtabs',async()=>{
 const dom=boot('?tab=appointments&view=calendar&calendarView=week&source=salon'),w=dom.window,d=w.document;
 assert.equal(d.querySelector('[data-view="calendar"]').getAttribute('aria-pressed'),'true');
 const root=d.querySelector('#team-calendar').shadowRoot;
 assert.ok(root.querySelector('[data-view="week"]').classList.contains('active'));
 d.querySelector('[data-view="cards"]').click();
 assert.equal(new URL(w.location.href).searchParams.get('view'),'cards');
 d.querySelector('[data-view="calendar"]').click();root.querySelector('[data-view="month"]').click();
 assert.equal(new URL(w.location.href).searchParams.get('calendarView'),'month');
 const move=method=>new Promise(resolve=>{w.addEventListener('popstate',()=>resolve(),{once:true});w.history[method]();});
 await move('back');assert.ok(root.querySelector('[data-view="week"]').classList.contains('active'));
 await move('back');assert.equal(d.querySelector('#team-calendar').hidden,true);
 assert.equal(d.querySelector('[data-view="cards"]').getAttribute('aria-pressed'),'true');
 await move('forward');assert.equal(d.querySelector('#team-calendar').hidden,false);
 assert.equal(new URL(w.location.href).searchParams.get('source'),'salon');
 dom.window.close();
});

test('invalid Front Desk view falls back to Table with a canonical URL',()=>{
 const dom=boot('?view=missing'),w=dom.window;
 assert.equal(new URL(w.location.href).searchParams.get('view'),'table');
 assert.equal(new URL(w.location.href).searchParams.get('tab'),'appointments');
 assert.equal(w.document.querySelector('[data-view="table"]').getAttribute('aria-pressed'),'true');
 dom.window.close();
});
