import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
function boot(){
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(readFileSync(new URL('./pos-front-desk-turn-board.html',import.meta.url),'utf8'),{url:'https://example.test/pages/pos-front-desk-turn-board.html',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.structuredClone=structuredClone;}});
 dom.window.eval(readFileSync(new URL('../assets/pos-front-desk-turn-board.js',import.meta.url),'utf8'));
 return {dom,w:dom.window,d:dom.window.document,errors};
}
test('Turn Board renders all three modes, filtering and the large-salon sample',()=>{
 const {dom,w,d,errors}=boot();
 assert.equal(d.querySelector('#next-turn-name').textContent,'Kayla Bui');
 assert.equal(d.querySelectorAll('.compact-row:not(.header)').length,4);
 d.querySelector('#mode-cards').click();assert.equal(d.querySelectorAll('.board-card').length,4);
 d.querySelector('#mode-grid').click();assert.ok(d.querySelector('.turn-grid'));
 w.setDemoMode('peak');assert.equal(d.querySelector('#stat-total-techs').textContent,'50');assert.equal(d.querySelector('#stat-waiting-guests').textContent,'36');
 d.querySelector('#tech-search').value='Kayla';w.renderTurnBoard();assert.equal(d.querySelectorAll('.turn-grid tr').length,3);
 assert.deepEqual(errors,[]);dom.window.close();
});
test('assignment advances rotation and prevents assigning a busy technician',()=>{
 const {dom,w,d,errors}=boot();
 w.openNextGuest();assert.equal(d.querySelectorAll('.guest-choice').length,2);
 d.querySelector('.guest-choice').click();
 assert.equal(d.querySelector('#stat-waiting-guests').textContent,'1');assert.equal(d.querySelector('#next-turn-name').textContent,'Lana VMM');
 w.openNextGuest(0);assert.match(d.querySelector('#toast').textContent,/available/);
 w.togglePause(1);assert.equal(d.querySelector('#next-turn-name').textContent,'No available technician');assert.equal(d.querySelector('.turn-hero button').disabled,true);
 w.togglePause(1);assert.equal(d.querySelector('#next-turn-name').textContent,'Lana VMM');
 assert.deepEqual(errors,[]);dom.window.close();
});
test('manual turns require a reason and use the configured weighted credit',()=>{
 const {dom,w,d,errors}=boot();
 d.querySelectorAll('#turn-rules-modal input')[1].value='1.5';w.saveTurnRules();
 w.openAddTurn(0);assert.equal(d.querySelector('#add-turn-credit').value,'1.5');
 w.saveAddedTurn();assert.match(d.querySelector('#toast').textContent,/required/);
 d.querySelector('#add-turn-reason').value='Missing service';w.saveAddedTurn();
 assert.match(d.querySelector('.compact-row:not(.header)').textContent,/5.5T/);
 assert.deepEqual(errors,[]);dom.window.close();
});
