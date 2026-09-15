const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const source = readFileSync(path.join(__dirname, 'service-assignments.js'), 'utf8');
const key = 'nexora-service-assignments-v1';
const code = expected => error => error.code === expected;
const clone = value => JSON.parse(JSON.stringify(value));
function boot(t, instant) {
  const dom = new JSDOM('', {url: 'https://demo.test', runScripts: 'outside-only'});
  t.after(() => dom.window.close());
  if (instant) {
    const RealDate = dom.window.Date;
    dom.window.Date = class extends RealDate {constructor(...args) {super(...(args.length ? args : [instant]));} static now() {return new RealDate(instant).getTime();}};
  }
  dom.window.eval(source);
  const api = dom.window.NEXORA_SERVICE_ASSIGNMENTS;
  assert.equal(typeof api.staffScope, 'function', 'The existing assignment store must provide staff-scoped access');
  let actor = 'kayla';
  const scope = api.staffScope(() => actor);
  const save = state => dom.window.localStorage.setItem(key, JSON.stringify(state));
  return {w: dom.window, api, scope, save, setActor(value) {actor = value;}};
}

test('new seed uses the golden salon date at a UTC midnight boundary and preserves saved dates', t => {
  const {api, save} = boot(t, '2026-09-16T01:00:00Z');
  const state = api.load();
  assert.equal(state.date, '2026-09-15');
  state.date = '2026-09-01';
  save(state);
  assert.equal(api.load().date, '2026-09-01');
});

test('legacy clock-in records recover the unique assigned salon or the only existing salon without rewriting storage', t => {
  const {api, save, w} = boot(t);
  const state = api.load();
  state.date = '2026-09-01';
  state.technicians.forEach(tech => {delete tech.clockedInSalonId;});
  save(state);
  const before = w.localStorage.getItem(key);
  const loaded = api.load();
  assert.equal(loaded.technicians.find(tech => tech.id === 'kayla').clockedInSalonId, 'golden');
  assert.equal(loaded.technicians.find(tech => tech.id === 'lana').clockedInSalonId, 'golden', 'An idle technician can use the only salon in a legacy snapshot');
  assert.equal(loaded.date, '2026-09-01');
  assert.equal(w.localStorage.getItem(key), before);
  state.tickets.find(ticket => ticket.id === 'jojo').salonId = 'elite';
  save(state);
  assert.equal(api.load().technicians.find(tech => tech.id === 'kayla').clockedInSalonId, 'elite');
  assert.equal(api.load().technicians.find(tech => tech.id === 'lana').clockedInSalonId, undefined, 'Multiple salons cannot establish an idle technician clock-in');
});

test('legacy clock-in inference preserves explicit unset values and rejects ambiguous assignments', t => {
  const {api, save} = boot(t);
  const state = api.load();
  state.technicians.find(tech => tech.id === 'lana').clockedInSalonId = null;
  state.technicians.find(tech => tech.id === 'huu').clockedInSalonId = '';
  const michael = state.technicians.find(tech => tech.id === 'michael');
  michael.clockedIn = false;
  delete michael.clockedInSalonId;
  const kayla = state.technicians.find(tech => tech.id === 'kayla');
  delete kayla.clockedInSalonId;
  state.tickets.push({id: 'elite-ticket', salonId: 'elite', services: [{id: 'elite-kayla', techId: 'kayla'}]});
  save(state);
  const loaded = api.load();
  assert.equal(loaded.technicians.find(tech => tech.id === 'kayla').clockedInSalonId, undefined);
  assert.equal(loaded.technicians.find(tech => tech.id === 'lana').clockedInSalonId, null);
  assert.equal(loaded.technicians.find(tech => tech.id === 'huu').clockedInSalonId, '');
  assert.equal(loaded.technicians.find(tech => tech.id === 'michael').clockedInSalonId, undefined);
});

test('staff scope lists assigned services including unsent work without exposing another technician service', t => {
  const {api, scope, save} = boot(t);
  const state = api.load();
  state.tickets.find(ticket => ticket.id === 'jojo').services.push({...state.tickets[1].services[0], id: 'jojo-other', techId: 'lana'});
  save(state);
  const items = scope.list();
  assert.equal(items.length, 1);
  assert.equal(items[0].line.id, 'jojo-1');
  assert.equal(items[0].line.status, 'not-sent');
  assert.deepEqual(clone(items[0].ticket.services.map(line => line.id)), ['jojo-1']);
  assert.equal(api.load().technicians.find(tech => tech.id === 'kayla').clockedInSalonId, 'golden');
  items[0].line.note = 'External mutation';
  assert.equal(scope.get('jojo-1').line.note, '');
});

test('foreign and missing IDs reject read, edit, delete and transition without changing stored data', async t => {
  const {api, scope, save, w} = boot(t);
  save(api.load());
  const before = w.localStorage.getItem(key);
  for (const id of ['jj-1', 'missing']) {
    assert.throws(() => scope.get(id), code('forbidden'));
    await assert.rejects(scope.edit(id, {note: 'Changed'}, 1), code('forbidden'));
    await assert.rejects(scope.remove(id, 1), code('forbidden'));
    await assert.rejects(scope.transition(id, 'complete', 'Done', 1), code('forbidden'));
  }
  assert.equal(w.localStorage.getItem(key), before);
});

test('identity is reread per operation and missing, unknown or malformed identities fail closed', async t => {
  const {scope, setActor} = boot(t);
  assert.equal(scope.list().length, 1);
  setActor('huu');
  assert.equal(scope.list()[0].line.id, 'jj-1');
  assert.throws(() => scope.get('jojo-1'), code('forbidden'));
  for (const actor of [null, undefined, '', ' ', 'missing', {id: 'kayla'}, ['kayla']]) {
    setActor(actor);
    assert.throws(() => scope.list(), code('session'));
    assert.throws(() => scope.get('jojo-1'), code('session'));
    await assert.rejects(scope.edit('jojo-1', {note: 'Denied'}, 1), code('session'));
    await assert.rejects(scope.remove('jojo-1', 1), code('session'));
    await assert.rejects(scope.transition('jojo-1', 'view', '', 1), code('session'));
  }
});

test('reassignment revokes a cached service before reads and every mutation', async t => {
  const {api, scope} = boot(t);
  const opened = scope.get('jojo-1');
  await api.assign('jojo-1', 'lana', '', 'Reassigned');
  assert.equal(scope.list().length, 0);
  assert.throws(() => scope.get(opened.line.id), code('forbidden'));
  await assert.rejects(scope.edit(opened.line.id, {note: 'Stale'}, opened.line.revision), code('forbidden'));
  await assert.rejects(scope.remove(opened.line.id, opened.line.revision), code('forbidden'));
  await assert.rejects(scope.transition(opened.line.id, 'view', '', opened.line.revision), code('forbidden'));
});

test('editing only notes and location persists revisions and rejects stale or immutable changes', async t => {
  const {scope} = boot(t);
  const current = scope.get('jojo-1');
  const updated = await scope.edit(current.line.id, {note: '  Gentle pressure  ', location: '  Chair #4  '}, current.line.revision);
  assert.equal(updated.line.note, 'Gentle pressure');
  assert.equal(scope.get(current.line.id).line.location, 'Chair #4');
  assert.equal(updated.line.revision, current.line.revision + 1);
  for (const revision of [undefined, 1]) {
    await assert.rejects(scope.edit(current.line.id, {note: 'Stale'}, revision), code('conflict'));
    await assert.rejects(scope.remove(current.line.id, revision), code('conflict'));
    await assert.rejects(scope.transition(current.line.id, 'view', '', revision), code('conflict'));
  }
  for (const patch of [{techId: 'lana'}, {id: 'changed'}, {price: 0}, {status: 'completed'}, {revision: 10}, {note: {}}, {location: 'x'.repeat(81)}, {note: 'x'.repeat(2001)}, null, []]) {
    await assert.rejects(scope.edit(current.line.id, patch, updated.line.revision), code('validation'));
  }
});

test('remove deletes only the owned service line and preserves the parent and other technician work', async t => {
  const {api, scope, save} = boot(t);
  const state = api.load();
  const parent = state.tickets.find(ticket => ticket.id === 'jojo');
  parent.services.push({...state.tickets[1].services[0], id: 'jojo-other', techId: 'lana'});
  save(state);
  const other = clone(parent.services[1]);
  assert.deepEqual(clone(await scope.remove('jojo-1', 1)), {id: 'jojo-1'});
  const remaining = api.load().tickets.find(ticket => ticket.id === 'jojo');
  assert.deepEqual(clone(remaining.services), [other]);
  assert.equal(remaining.customer, 'Jojo');
  assert.equal(scope.list().length, 0);
});

test('completed and paid services remain visible but cannot be edited or removed', async t => {
  const {api, scope, save} = boot(t);
  for (const paid of [false, true]) {
    const state = api.load();
    const ticket = state.tickets.find(item => item.id === 'jojo');
    ticket.services[0].status = paid ? 'accepted' : 'completed';
    if (paid) ticket.payment = {total: 52};
    save(state);
    assert.equal(scope.get('jojo-1').line.id, 'jojo-1');
    await assert.rejects(scope.edit('jojo-1', {note: 'Changed'}, 1), code('closed'));
    await assert.rejects(scope.remove('jojo-1', 1), code('closed'));
  }
});

test('scoped lifecycle keeps view, accept, start and completion rules with one turn credit', async t => {
  const {api, scope} = boot(t);
  await api.send('jojo');
  await assert.rejects(scope.transition('jojo-1', 'start', '', 1), /Accept/);
  for (const action of ['view', 'accept', 'start', 'complete']) {
    const current = scope.get('jojo-1');
    const result = await scope.transition('jojo-1', action, 'Done', current.line.revision);
    assert.equal(result.line.revision, current.line.revision + 1);
  }
  const completed = scope.get('jojo-1');
  assert.equal(completed.line.status, 'completed');
  await scope.transition('jojo-1', 'complete', 'Done', completed.line.revision);
  assert.equal(api.load().turnEntries.filter(entry => entry.serviceId === 'jojo-1').length, 1);
});

test('queued mutations recheck both assignment and session after the browser lock is acquired', async t => {
  const {api, scope, save, setActor, w} = boot(t);
  let release;
  w.navigator.locks = {request(_key, run) {return new Promise((resolve, reject) => {release = () => {try {resolve(run());} catch (error) {reject(error);}};});}};
  const edit = scope.edit('jojo-1', {note: 'Waiting'}, 1);
  await Promise.resolve();
  setActor('lana');
  release();
  await assert.rejects(edit, code('session'));
  setActor('kayla');
  const remove = scope.remove('jojo-1', 1);
  await Promise.resolve();
  const state = api.load();
  state.tickets.find(ticket => ticket.id === 'jojo').services[0].techId = 'lana';
  save(state);
  release();
  await assert.rejects(remove, code('forbidden'));
});

test('storage write failures preserve the service and cannot report a successful edit or deletion', async t => {
  const {api, scope, save, w} = boot(t);
  save(api.load());
  const before = w.localStorage.getItem(key);
  w.Storage.prototype.setItem = () => {throw new Error('Full');};
  await assert.rejects(scope.edit('jojo-1', {note: 'Unwritten'}, 1), /Unable to save/);
  await assert.rejects(scope.remove('jojo-1', 1), /Unable to save/);
  assert.equal(w.localStorage.getItem(key), before);
});
