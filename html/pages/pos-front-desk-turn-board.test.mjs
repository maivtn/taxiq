import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
function boot(){
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(readFileSync(new URL('./pos-front-desk-turn-board.html',import.meta.url),'utf8'),{url:'https://example.test/pages/pos-front-desk-turn-board.html',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.structuredClone=structuredClone;}});
 dom.window.eval(['salon-data','pos-turn-settings','pos-front-desk-turn-board','pos-turn-board-services','pos-turn-board-tools'].map(name=>readFileSync(new URL('../assets/'+name+'.js',import.meta.url),'utf8')).join('\n'));
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
 d.querySelectorAll('[data-service-weight]')[1].value='1.5';w.saveTurnRules();
 w.openAddTurn(0);assert.equal(d.querySelector('#add-turn-credit').value,'1.5');
 w.saveAddedTurn();assert.match(d.querySelector('#toast').textContent,/required/);
 d.querySelector('#add-turn-reason').value='Missing service';w.saveAddedTurn();
 assert.match(d.querySelector('.compact-row:not(.header)').textContent,/5.5T/);
 assert.deepEqual(errors,[]);dom.window.close();
});

test('board menu opens settings and closes with Escape or an outside click',()=>{
 const {dom,d,errors}=boot();
 const trigger=d.querySelector('#board-menu-toggle');trigger.click();
 assert.equal(trigger.getAttribute('aria-expanded'),'true');
 d.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 assert.equal(trigger.getAttribute('aria-expanded'),'false');
 trigger.click();d.querySelector('h2').click();assert.equal(trigger.getAttribute('aria-expanded'),'false');
 trigger.click();d.querySelector('[data-board-action="rules"]').click();
 assert.ok(d.querySelector('#turn-rules-modal').classList.contains('show'));
 assert.deepEqual(errors,[]);dom.window.close();
});

test('demo guest can be assigned and undo restores both guest and technician',()=>{
 const {dom,w,d,errors}=boot();
 w.openDemoGuest();d.querySelector('#demo-guest-name').value='<b>Demo guest</b>';
 d.querySelector('#demo-guest-service').value='PED';w.saveDemoGuest();
 assert.equal(d.querySelector('#stat-waiting-guests').textContent,'3');
 w.openNextGuest();const guest=[...d.querySelectorAll('.guest-choice')].find(b=>b.textContent.includes('<b>Demo guest</b>'));
 assert.ok(guest);assert.equal(guest.querySelector('b'),null);guest.click();
 assert.equal(d.querySelector('#next-turn-name').textContent,'Lana VMM');
 w.undoBoardAction();assert.equal(d.querySelector('#next-turn-name').textContent,'Kayla Bui');
 assert.equal(d.querySelector('#stat-waiting-guests').textContent,'3');
 w.openNextGuest();assert.ok([...d.querySelectorAll('.guest-choice')].some(b=>b.textContent.includes('<b>Demo guest</b>')));
 assert.deepEqual(errors,[]);dom.window.close();
});

test('clear salon requires confirmation, handles every empty board mode and can be undone',()=>{
 const {dom,w,d,errors}=boot();
 const settings=JSON.stringify(w.NEXORA_TURN_SETTINGS.load());
 w.requestBoardChange('clear');w.closeBoardDialog('board-confirm-modal');
 assert.equal(d.querySelector('#stat-total-techs').textContent,'4');
 w.requestBoardChange('clear');w.confirmBoardChange();
 for(const mode of ['compact','cards','grid']){w.setBoardMode(mode);assert.match(d.querySelector('#turn-board-grid').textContent,/No technicians/);}
 assert.equal(d.querySelector('#stat-total-techs').textContent,'0');
 assert.equal(d.querySelector('.turn-hero button').disabled,true);
 assert.equal(JSON.stringify(w.NEXORA_TURN_SETTINGS.load()),settings);
 w.undoBoardAction();assert.equal(d.querySelector('#stat-total-techs').textContent,'4');
 assert.equal(d.querySelector('#stat-waiting-guests').textContent,'2');
 assert.deepEqual(errors,[]);dom.window.close();
});

test('reset day preserves staff, zeros totals, and staff can check in again',()=>{
 const {dom,w,d,errors}=boot();w.requestBoardChange('reset');w.confirmBoardChange();
 assert.equal(d.querySelector('#stat-total-techs').textContent,'4');
 assert.equal(d.querySelector('#stat-waiting-guests').textContent,'0');
 assert.equal(d.querySelector('#stat-available-techs').textContent,'0');
 assert.ok([...d.querySelectorAll('.compact-row:not(.header)')].every(row=>row.textContent.includes('0T')));
 w.checkInBoardTech(0);assert.equal(d.querySelector('#next-turn-name').textContent,'Kayla Bui');
 assert.equal(d.querySelector('#stat-available-techs').textContent,'1');
 w.undoBoardAction();assert.equal(d.querySelector('#stat-available-techs').textContent,'0');
 assert.deepEqual(errors,[]);dom.window.close();
});

test('loading sample clears filters, replaces demo data and supports undo',()=>{
 const {dom,w,d,errors}=boot();w.setDemoMode('peak');
 d.querySelector('#tech-search').value='missing';d.querySelector('#tech-status-filter').value='paused';
 w.requestBoardChange('sample');w.confirmBoardChange();
 assert.equal(d.querySelector('#stat-total-techs').textContent,'4');
 assert.equal(d.querySelector('#tech-search').value,'');assert.equal(d.querySelector('#tech-status-filter').value,'all');
 w.undoBoardAction();assert.equal(d.querySelector('#stat-total-techs').textContent,'50');
 assert.equal(d.querySelector('#peak-mode-toggle').value,'peak');
 assert.deepEqual(errors,[]);dom.window.close();
});

test('assigning a demo service records its price and weighted turns, and undo restores totals',()=>{
 const {dom,w,d,errors}=boot();
 w.openDemoGuest();d.querySelector('#demo-guest-name').value='Wax guest';
 d.querySelector('#demo-guest-service').value='WAX';w.saveDemoGuest();
 w.openNextGuest();[...d.querySelectorAll('.guest-choice')].find(b=>b.textContent.includes('Wax guest')).click();
 w.setBoardMode('grid');let row=[...d.querySelectorAll('.turn-grid tr')].find(r=>r.textContent.includes('Kayla Bui'));
 assert.match(row.textContent,/4.5T · \$195/);assert.match(row.textContent,/\$15 · \+0.5T/);
 w.undoBoardAction();row=[...d.querySelectorAll('.turn-grid tr')].find(r=>r.textContent.includes('Kayla Bui'));
 assert.match(row.textContent,/4T · \$180/);assert.equal(d.querySelector('#stat-waiting-guests').textContent,'3');
 assert.deepEqual(errors,[]);dom.window.close();
});
