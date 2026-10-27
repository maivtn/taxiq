import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const pages = new URL('../../../html/pages/', import.meta.url);
const assets = new URL('../assets/', pages);
function boot(query = '?section=clock', saved = {}) {
  const dom = new JSDOM(readFileSync(new URL('pos-front-desk.html', pages), 'utf8'), {
    url: 'https://example.test/pages/pos-front-desk.html' + query, runScripts: 'outside-only'
  });
  const w = dom.window;
  w.structuredClone = structuredClone;
  w.matchMedia = () => ({matches: false});
  w.confirm = () => true;
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  w.QRCode = function (node, options) { node.dataset.qrValue = options.text; };
  w.QRCode.CorrectLevel = {M: 0};
  Object.entries(saved).forEach(([key, value]) => w.localStorage.setItem(key, value));
  for (const name of ['front-desk-tabs', 'salon-data', 'appointment-tickets', 'appointments-store', 'front-desk-data',
    'pos-turn-settings', 'team-calendar-content', 'pos-front-desk', 'service-assignments', 'front-desk-assignments',
    'pos-estimate', 'front-desk-estimate', 'front-desk-checkin', 'front-desk-waitlist', 'front-desk-clock']) {
    w.eval(readFileSync(new URL(name + '.js', assets), 'utf8'));
  }
  return dom;
}
const savedFrom = w => Object.fromEntries(Object.keys(w.localStorage).map(key => [key, w.localStorage.getItem(key)]));
const row = (d, name) => [...d.querySelectorAll('[data-clock-person]')].find(node => node.dataset.clockPerson === name);
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

test('Staffs Clock opens in the Front Desk and navigates through sections and history without clearing a check-in draft', async () => {
  const dom = boot(), w = dom.window, d = w.document;
  try {
    assert.equal(d.querySelector('#front-desk-clock').hidden, false);
    for (const id of ['appointments', 'service-assignments', 'front-desk-checkin', 'front-desk-estimate', 'front-desk-waitlist']) assert.equal(d.getElementById(id).hidden, true, id);
    const link = d.querySelector('[data-front-desk-tab="staffs-clock"]');
    assert.equal(link.getAttribute('aria-current'), 'page');
    assert.equal(link.getAttribute('href'), 'pos-front-desk.html?section=clock');
    assert.equal(d.querySelector('#front-desk-clock iframe'), null);
    assert.match(d.querySelector('[data-clk-date]').textContent, /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    d.querySelector('[data-front-section="checkin"]').click();
    d.querySelector('#ci-contact-name').value = 'Clock navigation draft';
    link.click();
    assert.equal(d.querySelector('#front-desk-clock').hidden, false);
    d.querySelector('[data-front-section="appointments"]').click();
    assert.equal(d.querySelector('#front-desk-clock').hidden, true);
    assert.equal(d.querySelector('#appointments').hidden, false);
    await new Promise(resolve => {w.addEventListener('popstate', resolve, {once:true});w.history.back();});
    assert.equal(d.querySelector('#appointments').hidden, true);
    assert.equal(d.querySelector('#front-desk-clock').hidden, false);
    d.querySelector('[data-front-section="checkin"]').click();
    assert.equal(d.querySelector('#ci-contact-name').value, 'Clock navigation draft');
  } finally { w.close(); }
});

test('Clock respects existing assignment shifts and changes only the chosen shift while keeping work and turns', async () => {
  const initial = boot(), state = initial.window.NEXORA_SERVICE_ASSIGNMENTS.load();
  initial.window.close();
  state.technicians.find(tech => tech.id === 'kayla').clockedIn = false;
  const dom = boot('?section=clock', {'nexora-service-assignments-v1': JSON.stringify(state)}), w = dom.window, d = w.document;
  try {
    assert.equal(row(d, 'Kayla Bui').querySelector('[data-clk]').textContent.trim(), 'Clock in');
    const token = d.querySelector('[data-clk-token]').textContent;
    row(d, 'Kayla Bui').querySelector('[data-clk]').click(); await settle();
    const changed = w.NEXORA_SERVICE_ASSIGNMENTS.load();
    assert.equal(changed.technicians.find(tech => tech.id === 'kayla').clockedIn, true);
    assert.equal(JSON.stringify(changed.tickets), JSON.stringify(state.tickets));
    assert.equal(JSON.stringify(changed.turnEntries), JSON.stringify(state.turnEntries));
    assert.equal(JSON.stringify(changed.technicians.filter(tech => tech.id !== 'kayla')), JSON.stringify(state.technicians.filter(tech => tech.id !== 'kayla')));
    assert.equal(w.NEXORA_FRONT_DESK_DATA.technicians().find(tech => tech.name === 'Kayla Bui').status, 'available');
    assert.notEqual(d.querySelector('[data-clk-token]').textContent, token);
    assert.match(d.querySelector('[data-clk-log]').textContent, /Kayla Bui.*on shift/);
    row(d, 'Kayla Bui').querySelector('[data-clock-beep]').click(); await settle();
    assert.match(d.querySelector('[data-clk-notif]').textContent, /Beeper #1/);
    const input = row(d, 'Kayla Bui').querySelector('[data-clk-bnum]');
    input.value = '18'; input.dispatchEvent(new w.FocusEvent('focusout', {bubbles: true})); await settle();
    row(d, 'Kayla Bui').querySelector('[data-clk]').click(); await settle();
    assert.equal(w.NEXORA_SERVICE_ASSIGNMENTS.load().technicians.find(tech => tech.id === 'kayla').clockedIn, false);
    assert.equal(w.NEXORA_FRONT_DESK_DATA.technicians().find(tech => tech.name === 'Kayla Bui').status, 'clocked-out');
    const restored = boot('?section=clock', savedFrom(w));
    try {
      const r = restored.window.document;
      assert.equal(row(r, 'Kayla Bui').querySelector('[data-clk]').textContent.trim(), 'Clock in');
      assert.equal(row(r, 'Kayla Bui').querySelector('[data-clk-bnum]').value, '18');
      assert.match(r.querySelector('[data-clk-log]').textContent, /Kayla Bui.*out/);
      assert.match(r.querySelector('[data-clk-notif]').textContent, /Beeper #1/);
    } finally { restored.window.close(); }
  } finally { w.close(); }
});

test('Cancel clock out leaves shifts untouched and card view keeps clock actions available', async () => {
  const dom = boot(), w = dom.window, d = w.document;
  try {
    const before = savedFrom(w);
    w.confirm = () => false;
    row(d, 'Tina').querySelector('[data-clk]').click(); await settle();
    assert.deepEqual(savedFrom(w), before);
    d.querySelector('[data-tech-roster-view-target="card"]').click();
    assert.equal(d.querySelector('[data-tech-roster-view-target="card"]').getAttribute('aria-pressed'), 'true');
    assert.equal(row(d, 'Tina').tagName, 'ARTICLE');
    assert.ok(row(d, 'Tina').querySelector('[data-clk]'));
    assert.equal(d.querySelector('table[data-clock-roster]'), null);
  } finally { w.close(); }
});

test('Saved clock history is preserved and a readonly render never rewrites existing saved records', () => {
  const dom = boot(), w = dom.window;
  try {
    assert.equal(w.localStorage.getItem('nexora:front-desk-clock:v1'), null);
    const saved = savedFrom(w);
    w.dispatchEvent(new w.PopStateEvent('popstate'));
    assert.deepEqual(savedFrom(w), saved);
  } finally { w.close(); }
});

const clockKey='nexora:front-desk-clock:v1', frontKey='nexora:front-desk-technicians:v1', assignmentKey='nexora-service-assignments-v1';
function seedClockedOutKayla(w) {
  const state=w.NEXORA_SERVICE_ASSIGNMENTS.load();
  state.technicians.find(tech=>tech.id==='kayla').clockedIn=false;
  w.localStorage.setItem(assignmentKey,JSON.stringify(state));
  w.localStorage.setItem(frontKey,JSON.stringify([{name:'Kayla Bui',status:'clocked-out',note:'Keep this profile'},{name:'Lana VMM',turns:9}]));
  w.dispatchEvent(new w.PopStateEvent('popstate'));
}
function interceptStorage(w,callback) {
  const prototype=Object.getPrototypeOf(w.localStorage),original=prototype.setItem;
  prototype.setItem=function(key,value){return callback.call(this,key,value,original);};
  return ()=>{prototype.setItem=original;};
}
for(const failureKey of [clockKey,frontKey])test(`Clock save failure in ${failureKey} leaves shifts and history unchanged`,async()=>{
  const dom=boot(),w=dom.window,d=w.document;let restore=()=>{};
  try {
    seedClockedOutKayla(w);
    const before=savedFrom(w),token=d.querySelector('[data-clk-token]').textContent;
    restore=interceptStorage(w,function(key,value,original){
      if(key===failureKey)throw new Error('Unable to save. Check browser storage and try again.');
      return original.call(this,key,value);
    });
    row(d,'Kayla Bui').querySelector('[data-clk]').click();await settle();
    assert.deepEqual(savedFrom(w),before);
    assert.equal(row(d,'Kayla Bui').querySelector('[data-clk]').textContent,'Clock in');
    assert.equal(d.querySelector('[data-clk-token]').textContent,token);
    assert.match(d.querySelector('[data-clock-feedback]').textContent,/Unable to save/);
  } finally {restore();w.close();}
});

test('A failed clock out restores the existing open session without changing the current shift',async()=>{
  const dom=boot(),w=dom.window,d=w.document;let restore=()=>{};
  try {
    seedClockedOutKayla(w);
    row(d,'Kayla Bui').querySelector('[data-clk]').click();await settle();
    const before=savedFrom(w);
    restore=interceptStorage(w,function(key,value,original){
      if(key===frontKey)throw new Error('Unable to save. Check browser storage and try again.');
      return original.call(this,key,value);
    });
    row(d,'Kayla Bui').querySelector('[data-clk]').click();await settle();
    assert.deepEqual(savedFrom(w),before);
    assert.equal(row(d,'Kayla Bui').querySelector('[data-clk]').textContent,'Clock out');
    assert.match(d.querySelector('[data-clk-log]').textContent,/Kayla Bui.*on shift/);
  } finally {restore();w.close();}
});

test('Final assignment failure compensates only the selected status and its history, preserving concurrent edits',async()=>{
  const dom=boot(),w=dom.window,d=w.document;let restore=()=>{};
  try {
    seedClockedOutKayla(w);
    let fail=true;
    restore=interceptStorage(w,function(key,value,original){
      if(key===assignmentKey&&fail){
        fail=false;
        const assignments=JSON.parse(this.getItem(assignmentKey));assignments.tickets[0].note='Concurrent ticket note';
        assignments.turnEntries.push({serviceId:'concurrent-credit',techId:'lana',credit:2});
        original.call(this,assignmentKey,JSON.stringify(assignments));
        const front=JSON.parse(this.getItem(frontKey));front.find(tech=>tech.name==='Lana VMM').turns=12;
        front.find(tech=>tech.name==='Kayla Bui').note='Concurrent profile note';
        original.call(this,frontKey,JSON.stringify(front));
        const history=JSON.parse(this.getItem(clockKey)),date=Object.keys(history.days)[0];
        history.days[date].notifications.push({name:'Lana VMM',at:Date.now(),msg:'Concurrent notification'});
        original.call(this,clockKey,JSON.stringify(history));
        throw new Error('Unable to save. Check browser storage and try again.');
      }
      return original.call(this,key,value);
    });
    row(d,'Kayla Bui').querySelector('[data-clk]').click();await settle();
    const assignments=w.NEXORA_SERVICE_ASSIGNMENTS.load(),front=JSON.parse(w.localStorage.getItem(frontKey)),history=JSON.parse(w.localStorage.getItem(clockKey));
    assert.equal(assignments.technicians.find(tech=>tech.id==='kayla').clockedIn,false);
    assert.equal(assignments.tickets[0].note,'Concurrent ticket note');
    assert.equal(assignments.turnEntries.at(-1).credit,2);
    assert.equal(front.find(tech=>tech.name==='Kayla Bui').status,'clocked-out');
    assert.equal(front.find(tech=>tech.name==='Kayla Bui').note,'Concurrent profile note');
    assert.equal(front.find(tech=>tech.name==='Lana VMM').turns,12);
    const day=Object.values(history.days)[0];
    assert.equal(day.sessions.length,0);assert.equal(day.beepers.length,0);
    assert.equal(day.notifications.length,1);assert.equal(day.notifications[0].msg,'Concurrent notification');
  } finally {restore();w.close();}
});

test('Station keyboard navigation skips unchanged writes and preserves the next control after saves and refresh',async()=>{
  const dom=boot(),w=dom.window,d=w.document;
  try {
    let input=row(d,'Tina').querySelector('[data-clk-bnum]'),next=row(d,'Tina').querySelector('[data-clk]');
    const before=savedFrom(w);
    input.focus();next.focus();await settle();
    assert.equal(d.activeElement,next);
    assert.deepEqual(savedFrom(w),before);
    input.focus();input.value='21';next.focus();await settle();
    assert.equal(d.activeElement.getAttribute('data-clk'),'Tina');
    assert.equal(row(d,'Tina').querySelector('[data-clk-bnum]').value,'21');
    w.dispatchEvent(new w.Event('focus'));
    assert.equal(d.activeElement.getAttribute('data-clk'),'Tina');
    assert.equal(w.NEXORA_FRONT_DESK_DATA.technicians().find(tech=>tech.name==='Tina').station,21);
  } finally {w.close();}
});

test('Assignment-only station edits persist in the existing shared technician profile',async()=>{
  const dom=boot(),w=dom.window,d=w.document;
  try {
    // Seed once into storage so the before/after snapshots refer to the same
    // existing records, rather than fresh demo timestamps from separate reads.
    w.localStorage.setItem(assignmentKey,JSON.stringify(w.NEXORA_SERVICE_ASSIGNMENTS.load()));
    const before=w.NEXORA_SERVICE_ASSIGNMENTS.load(),input=row(d,'HUU').querySelector('[data-clk-bnum]');
    input.value='8';input.dispatchEvent(new w.FocusEvent('focusout',{bubbles:true}));await settle();
    const after=w.NEXORA_SERVICE_ASSIGNMENTS.load();
    assert.equal(after.technicians.find(tech=>tech.id==='huu').station,8);
    assert.equal(JSON.stringify(after.tickets),JSON.stringify(before.tickets));
    assert.equal(JSON.stringify(after.turnEntries),JSON.stringify(before.turnEntries));
    assert.equal(w.localStorage.getItem(clockKey),null);
  } finally {w.close();}
});

for(const initiallyOnShift of [true,false])test(`A queued ${initiallyOnShift?'clock out':'clock in'} aborts when another tab changes that shift before its lock is acquired`,async()=>{
  const dom=boot(),w=dom.window,d=w.document;
  try {
    if(!initiallyOnShift)seedClockedOutKayla(w);
    let releaseClockLock,confirmations=0;
    w.confirm=()=>{confirmations++;return true;};
    Object.defineProperty(w.navigator,'locks',{configurable:true,value:{
      request(name,action){
        if(name!==clockKey)return Promise.resolve().then(action);
        return new Promise((resolve,reject)=>{releaseClockLock=()=>Promise.resolve().then(action).then(resolve,reject);});
      }
    }});
    const button=row(d,'Kayla Bui').querySelector('[data-clk]');
    assert.equal(button.textContent,initiallyOnShift?'Clock out':'Clock in');
    button.click();
    assert.equal(typeof releaseClockLock,'function');
    // Another tab finishes the requested shift change while this tab is queued.
    await w.NEXORA_SERVICE_ASSIGNMENTS.setClockedIn('kayla',!initiallyOnShift);
    const afterOtherTab=savedFrom(w);
    await releaseClockLock();await settle();
    assert.deepEqual(savedFrom(w),afterOtherTab);
    assert.equal(w.NEXORA_SERVICE_ASSIGNMENTS.load().technicians.find(tech=>tech.id==='kayla').clockedIn,!initiallyOnShift);
    assert.equal(confirmations,0);
    assert.equal(row(d,'Kayla Bui').querySelector('[data-clk]').textContent,initiallyOnShift?'Clock in':'Clock out');
  } finally {w.close();}
});

test('A stale rendered Clock out button never becomes an unrequested clock in',async()=>{
  const dom=boot(),w=dom.window,d=w.document;
  try {
    const button=row(d,'Kayla Bui').querySelector('[data-clk]'),changed=w.NEXORA_SERVICE_ASSIGNMENTS.load();
    assert.equal(button.textContent,'Clock out');
    changed.technicians.find(tech=>tech.id==='kayla').clockedIn=false;
    w.localStorage.setItem(assignmentKey,JSON.stringify(changed));
    const afterOtherTab=savedFrom(w);
    button.click();await settle();
    assert.deepEqual(savedFrom(w),afterOtherTab);
    assert.equal(row(d,'Kayla Bui').querySelector('[data-clk]').textContent,'Clock in');
  } finally {w.close();}
});
