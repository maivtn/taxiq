import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM,VirtualConsole} from 'jsdom';
const SOURCE_DIR=new URL('../../../html/pages/',import.meta.url);
function boot(query='',setup){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const html=readFileSync(new URL('./pos-calendar.html',SOURCE_DIR),'utf8');
 const dom=new JSDOM(html,{url:'https://staff.test/html/pages/pos-calendar.html'+query,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window;
 const dependencies=['salon-data.js','appointment-tickets.js','appointments-store.js','staff-schedule-store.js'];
 for(const file of dependencies.filter(file=>html.includes(`../assets/${file}`)))w.eval(readFileSync(new URL('../assets/'+file,SOURCE_DIR),'utf8'));
 setup?.(w);
 w.eval(readFileSync(new URL('../assets/staff-calendar.js',SOURCE_DIR),'utf8'));
 return {dom,w,d:w.document,errors};
}
test('My Calendar keeps personal IA with salon, tabs and booking sync',()=>{
 const {dom,d,errors}=boot('?salon=bitcoin-nail-bar-houston&staff=t1');
 assert.equal(d.querySelector('h1').textContent,'My Calendar');
 assert.deepEqual(Array.from(d.querySelectorAll('[data-calendar-tab]'),n=>n.dataset.calendarTab),['appointments','work-schedule','requests']);
 assert.ok(d.querySelector('[data-calendar-salon]'));assert.match(d.querySelector('[data-calendar-sync]').textContent,/Booking/);
 assert.equal(d.querySelectorAll('[data-calendar-day]').length,7);assert.equal(d.querySelector('[data-calendar]').dataset.staffId,'t1');
 assert.deepEqual(errors,[]);dom.window.close();
});
test('three tabs render distinct staff workflows',()=>{
 const {dom,d}=boot('?staff=t1&date=2026-09-28');
 assert.equal(d.querySelector('[data-calendar-heading]').textContent,'Sep 28, 2026');
 assert.equal(d.querySelector('[data-date="2026-09-28"]').getAttribute('aria-label'),'Sep 28, 2026');
 assert.match(d.querySelector('[data-calendar-panel]').textContent,/Mary Smith/);assert.match(d.querySelector('[data-calendar-panel]').textContent,/Work starts/);
 d.querySelector('[data-calendar-tab="work-schedule"]').click();assert.match(d.querySelector('[data-calendar-panel]').textContent,/Salon schedule/);assert.doesNotMatch(d.querySelector('[data-calendar-panel]').textContent,/Mary Smith/);
 d.querySelector('[data-calendar-tab="requests"]').click();assert.match(d.querySelector('[data-calendar-panel]').textContent,/Request day off/);assert.match(d.querySelector('[data-calendar-panel]').textContent,/Change hours/);assert.match(d.querySelector('[data-calendar-panel]').textContent,/Take break/);dom.window.close();
});
test('empty personal calendar shows one clearly labelled demo booking',()=>{
 const {dom,d}=boot('?staff=t1&date=2026-09-28');const demo=d.querySelector('[data-demo-booking]');
 assert.ok(demo);assert.match(demo.textContent,/Mary Smith/);assert.match(demo.textContent,/Demo booking/);
 assert.equal(d.querySelector('[data-calendar-duration]').textContent,'1 appointment');dom.window.close();
});
test('real personal appointment replaces the demo booking',()=>{
 const {dom,d}=boot('?staff=t1&date=2026-09-28',w=>{
  const result=w.NEXORA_APPOINTMENTS_STORE.create({id:'real-calendar-booking',customerName:'Jessica Nguyen',phone:'8325550188',serviceNames:['Gel Manicure'],technicianId:'t1',date:'2026-09-28',time:'10:30',status:'confirmed',tickets:[{id:'ticket-real-calendar-booking',serviceId:'gel',serviceName:'Gel Manicure',technicianId:'t1',technicianName:'Tina',durationMin:60}]});
  assert.equal(result.ok,true);
 });
 assert.equal(d.querySelector('[data-demo-booking]'),null);assert.match(d.querySelector('[data-calendar-timeline]').textContent,/Jessica Nguyen/);
 assert.ok(d.querySelector('[data-calendar-appointment]'));dom.window.close();
});
test('invalid staff falls back to personal scope and preserves salon in back link',()=>{
 const {dom,w,d}=boot('?salon=missing&staff=missing&date=2030-02-14');
 assert.equal(d.querySelector('[data-calendar]').dataset.staffId,'t1');assert.equal(new URL(w.location.href).searchParams.get('staff'),'t1');
 assert.match(d.querySelector('[data-work-orders-link]').href,/salon=bitcoin-nail-bar-houston/);dom.window.close();
});
test('staff submits and cancels a pending day-off request without changing published schedule',()=>{
 const {dom,w,d}=boot('?staff=t1&date=2026-10-02');d.querySelector('[data-calendar-tab="requests"]').click();d.querySelector('[data-request-day-off]').click();
 d.querySelector('[data-request-date]').value='2026-10-02';d.querySelector('[data-request-reason]').value='Personal';d.querySelector('[data-request-form]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 let state=w.NEXORA_STAFF_SCHEDULE_STORE.loadState();assert.equal(state.requests.at(-1).status,'pending');assert.equal(state.salons['bitcoin-nail-bar-houston'].staff.t1.exceptions['2026-10-02'],undefined);assert.match(d.querySelector('[data-request-list]').textContent,/Pending/);
 assert.equal(state.requests.at(-1).date,'2026-10-02');
 assert.match(d.querySelector('[data-request-list]').textContent,/Oct 2, 2026/);
 d.querySelector('[data-request-cancel]').click();state=w.NEXORA_STAFF_SCHEDULE_STORE.loadState();assert.equal(state.requests.at(-1).status,'cancelled');dom.window.close();
});

test('staff submits change-hours and break requests without changing published schedule',()=>{
 const {dom,w,d}=boot('?staff=t1&date=2026-09-28');const before=w.NEXORA_STAFF_SCHEDULE_STORE.getStaffSchedule('bitcoin-nail-bar-houston','t1');
 d.querySelector('[data-calendar-tab="requests"]').click();d.querySelector('[data-request-change-hours]').click();
 d.querySelector('[data-request-start]').value='10:00';d.querySelector('[data-request-end]').value='17:00';d.querySelector('[data-request-form]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 d.querySelector('[data-request-break]').click();d.querySelector('[data-request-start]').value='15:00';d.querySelector('[data-request-end]').value='15:30';d.querySelector('[data-request-form]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const state=w.NEXORA_STAFF_SCHEDULE_STORE.loadState();assert.deepEqual(Array.from(state.requests,item=>item.type),['change-hours','break']);assert.deepEqual(JSON.parse(JSON.stringify(w.NEXORA_STAFF_SCHEDULE_STORE.getStaffSchedule('bitcoin-nail-bar-houston','t1'))),JSON.parse(JSON.stringify(before)));dom.window.close();
});
