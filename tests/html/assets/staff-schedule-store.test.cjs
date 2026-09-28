const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../../../html/assets/staff-schedule-store.js');

function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

test('loads defaults from missing or corrupt storage and isolates drafts', () => {
  const target = storage();
  assert.equal(store.loadState(target).version, 1);
  assert.equal(store.loadState(storage({[store.STORAGE_KEY]: '{bad'})).version, 1);
  const published = store.getStaffSchedule(store.SALON_ID, 't1', {}, target);
  store.saveDraft(store.SALON_ID, 't1', {weekly: {...published.weekly, mon:{working:true,start:'10:00',end:'18:00',breaks:[]}}}, target);
  assert.equal(store.getStaffSchedule(store.SALON_ID, 't1', {}, target).weekly.mon.start, '09:00');
  assert.equal(store.getStaffSchedule(store.SALON_ID, 't1', {includeDraft:true}, target).weekly.mon.start, '10:00');
});

test('validates shifts and breaks', () => {
  assert.deepEqual(store.validateSchedule({weekly:{mon:{working:true,start:'18:00',end:'09:00',breaks:[]}}}).errors.map(e=>e.code), ['invalid-shift']);
  assert.deepEqual(store.validateSchedule({weekly:{mon:{working:true,start:'09:00',end:'18:00',breaks:[{start:'08:00',end:'09:30'}]}}}).errors.map(e=>e.code), ['break-outside-shift']);
  assert.deepEqual(store.validateSchedule({weekly:{mon:{working:true,start:'09:00',end:'18:00',breaks:[{start:'12:00',end:'13:00'},{start:'12:30',end:'13:30'}]}}}).errors.map(e=>e.code), ['break-overlap']);
});

test('finds booking impacts in appointment and ticket lanes', () => {
  const schedule={weekly:{mon:{working:true,start:'09:00',end:'17:30',breaks:[]}},exceptions:{}};
  const rows=[
    {id:'a1',technicianId:'t1',startAt:'2026-09-28T17:00:00',endAt:'2026-09-28T18:00:00',status:'confirmed'},
    {id:'a2',tickets:[{technicianId:'t1',startAt:'2026-09-28T18:00:00',endAt:'2026-09-28T19:00:00'}],status:'confirmed'}
  ];
  assert.deepEqual(store.findBookingImpacts('t1',schedule,rows).map(x=>x.appointmentId),['a1','a2']);
});

test('availability removes breaks and appointments', () => {
  const schedule={weekly:{mon:{working:true,start:'09:00',end:'12:00',breaks:[{start:'10:00',end:'10:30'}]}},exceptions:{}};
  const result=store.availabilityForDay({staffSchedule:schedule,technicianId:'t1',date:'2026-09-28',slotMinutes:30,appointments:[{id:'a',technicianId:'t1',startAt:'2026-09-28T11:00:00',endAt:'2026-09-28T11:30:00',status:'confirmed'}]});
  assert.deepEqual(result.openSlots.map(x=>x.time),['09:00','09:30','10:30','11:30']);
});

test('publish blocks impacts and applies resolved draft', () => {
  const target=storage();
  const schedule=store.getStaffSchedule(store.SALON_ID,'t1',{},target);
  schedule.weekly.mon={working:false,start:'',end:'',breaks:[]};
  store.saveDraft(store.SALON_ID,'t1',schedule,target);
  const rows=[{id:'a1',technicianId:'t1',startAt:'2026-09-28T10:00:00',endAt:'2026-09-28T11:00:00',status:'confirmed'}];
  assert.equal(store.publishDraft(store.SALON_ID,'t1',rows,[],target).error.code,'booking-impact');
  assert.equal(store.publishDraft(store.SALON_ID,'t1',rows,['a1'],target,'2026-09-28T10:00:00.000Z').ok,true);
  assert.equal(store.getStaffSchedule(store.SALON_ID,'t1',{},target).weekly.mon.working,false);
});

test('day-off request changes schedule only after approval and supports rejection or cancel', () => {
  const target=storage();
  const first=store.createRequest({salonId:store.SALON_ID,staffId:'t1',type:'day-off',date:'2026-10-02',reason:'Personal'},target).request;
  assert.equal(first.status,'pending');
  assert.equal(store.getStaffSchedule(store.SALON_ID,'t1',{},target).exceptions['2026-10-02'],undefined);
  assert.equal(store.reviewRequest(first.id,'approve',[],target).request.status,'applied');
  assert.equal(store.getStaffSchedule(store.SALON_ID,'t1',{},target).exceptions['2026-10-02'].type,'day-off');
  const rejected=store.createRequest({salonId:store.SALON_ID,staffId:'t1',type:'day-off',date:'2026-10-03',reason:'Sick'},target).request;
  assert.equal(store.reviewRequest(rejected.id,'reject',[],target).request.status,'rejected');
  const cancelled=store.createRequest({salonId:store.SALON_ID,staffId:'t1',type:'day-off',date:'2026-10-04',reason:'Vacation'},target).request;
  assert.equal(store.cancelRequest(cancelled.id,'t1',target).request.status,'cancelled');
});

test('rejects malformed schedule requests instead of reporting a lost success', () => {
  const target=storage();
  const result=store.createRequest({salonId:store.SALON_ID,staffId:'t1',type:'day-off',date:'not-a-date',reason:'Personal'},target);
  assert.equal(result.ok,false);assert.equal(result.error.code,'invalid-request');
  assert.equal(store.loadState(target).requests.length,0);
});
