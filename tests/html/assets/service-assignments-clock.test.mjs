import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source = readFileSync(new URL('../../../html/assets/service-assignments.js', import.meta.url), 'utf8');
test('setClockedIn preserves saved tickets, turn credits and technician metadata, and updates queue eligibility', async () => {
  const dom=new JSDOM('', {url:'https://example.test/',runScripts:'outside-only'}), w=dom.window;
  try {
    w.eval(source);
    const api=w.NEXORA_SERVICE_ASSIGNMENTS, state=api.load();
    state.technicians.find(tech=>tech.id==='lana').lastCompletedAt='2026-10-20T16:30:00Z';
    state.turnEntries.push({serviceId:'saved-turn',techId:'lana',credit:1.5,amount:75,completedAt:'2026-10-20T16:30:00Z'});
    w.localStorage.setItem('nexora-service-assignments-v1',JSON.stringify(state));
    let notifications=0;api.subscribe(()=>notifications++);
    await api.setClockedIn('lana',false);
    const out=api.load(), expected=JSON.parse(JSON.stringify(state));
    expected.technicians.find(tech=>tech.id==='lana').clockedIn=false;
    assert.equal(JSON.stringify(out),JSON.stringify(expected));
    assert.equal(api.queue().some(tech=>tech.id==='lana'),false);
    await api.setClockedIn('lana',true);
    assert.equal(JSON.stringify(api.load()),JSON.stringify(state));
    assert.equal(api.queue().find(tech=>tech.id==='lana').turns,1.5);
    assert.equal(notifications,2);
    await assert.rejects(api.setClockedIn('missing',false));
    await assert.rejects(api.setClockedIn('lana','true'));
    assert.equal(JSON.stringify(api.load()),JSON.stringify(state));
    await assert.rejects(api.setClockedIn('lana',false,false));
    assert.equal(JSON.stringify(api.load()),JSON.stringify(state));
    await api.setStation('huu',8);
    const expectedStation=JSON.parse(JSON.stringify(state));expectedStation.technicians.find(tech=>tech.id==='huu').station=8;
    assert.equal(JSON.stringify(api.load()),JSON.stringify(expectedStation));
  } finally { w.close(); }
});
