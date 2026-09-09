import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM, VirtualConsole} from 'jsdom';

function boot(t, storage = {}) {
  const errors = [], virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(readFileSync(new URL('./pos-front-desk-turn-board.html', import.meta.url), 'utf8'), {
    url:'https://example.test/pages/pos-front-desk-turn-board.html', runScripts:'outside-only', virtualConsole
  });
  const w = dom.window, d = w.document;
  w.structuredClone = structuredClone;
  Object.entries(storage).forEach(([key,value]) => w.localStorage.setItem(key,value));
  w.eval(['salon-data','pos-turn-settings','pos-front-desk-turn-board','pos-turn-board-services','pos-turn-board-tools']
    .map(name => readFileSync(new URL('../assets/' + name + '.js',import.meta.url),'utf8')).join('\n'));
  const salonId = w.NEXORA_SALON_DATA.loadCatalog().salon.id;
  t.after(() => {assert.deepEqual(errors,[]); dom.window.close();});
  return {w,d,key:'nexora:turn-board-services:v1:' + salonId,boardKey:'nexora:turn-board-demo:v1:' + salonId};
}
function field(page,id,name) {return page.d.querySelector('[data-board-service-id="' + id + '"] [data-service-field="' + name + '"]');}
function setField(page,id,name,value) {
  const control = field(page,id,name); control.value = value;
  control.dispatchEvent(new page.w.Event('input',{bubbles:true}));
}
function save(page) {page.d.querySelector('#board-services-form').dispatchEvent(new page.w.Event('submit',{bubbles:true,cancelable:true}));}
function stored(page) {
  return Object.fromEntries(Array.from({length:page.w.localStorage.length},(_,i) => {
    const key = page.w.localStorage.key(i); return [key,page.w.localStorage.getItem(key)];
  }));
}

test('Cancel discards service edits and reopening restores the saved catalog', t => {
  const page = boot(t), original = JSON.stringify(page.w.NEXORA_BOARD_SERVICES.list());
  page.w.openBoardServices();
  setField(page,'PED','code','SPA'); setField(page,'PED','name','New pedicure'); setField(page,'PED','price','99');
  page.d.querySelector('#board-services-modal [data-close-board-services]').click();
  assert.equal(page.d.querySelector('#board-services-modal').classList.contains('show'),false);
  assert.equal(JSON.stringify(page.w.NEXORA_BOARD_SERVICES.list()),original);
  assert.equal(page.w.localStorage.getItem(page.key),null);
  page.w.openBoardServices();
  assert.equal(field(page,'PED','code').value,'PED');
  assert.equal(field(page,'PED','price').value,'45');
});

test('duplicate symbols, missing names and blank or negative prices cannot replace the catalog', t => {
  const page = boot(t), original = JSON.stringify(page.w.NEXORA_BOARD_SERVICES.list());
  for (const [name,value] of [['code','mani'],['name','   '],['price',''],['price','-1']]) {
    page.w.openBoardServices(); setField(page,'PED',name,value); save(page);
    assert.equal(page.d.querySelector('#board-services-modal').classList.contains('show'),true);
    assert.ok(page.d.querySelector('#board-services-error').textContent.trim());
    assert.equal(JSON.stringify(page.w.NEXORA_BOARD_SERVICES.list()),original);
    assert.equal(page.w.localStorage.getItem(page.key),null);
  }
});

test('new turn amounts use the selected service price and credits follow the shared weighted policy', t => {
  const page = boot(t);
  page.w.openBoardServices(); setField(page,'PED','price','120'); save(page);
  page.w.openAddTurn(0);
  assert.equal(page.d.querySelector('#add-turn-amount').value,'120');
  assert.equal(page.d.querySelector('#add-turn-credit').value,'2');
  assert.equal(page.w.NEXORA_TURN_SETTINGS.save({bookingTurnCredit:.5,serviceWeights:[.25,.75,1.25,3.5]}).ok,true);
  assert.equal(page.d.querySelector('#add-turn-credit').value,'3.5');
  const select = page.d.querySelector('#add-turn-service'); select.value = 'WAX';
  select.dispatchEvent(new page.w.Event('change',{bubbles:true}));
  assert.equal(page.d.querySelector('#add-turn-amount').value,'15');
  assert.equal(page.d.querySelector('#add-turn-credit').value,'0.25');
  page.w.closeAddTurn(); page.w.openBoardServices();
  assert.equal(page.d.querySelector('[data-board-service-id="PED"] [data-service-turn]').textContent,'3.5T');
  setField(page,'PED','price','50');
  assert.equal(page.d.querySelector('[data-board-service-id="PED"] [data-service-turn]').textContent,'0.75T');
});

test('service edits and new weighted rules preserve recorded amounts, credits and technician totals', t => {
  const page = boot(t);
  page.w.openAddTurn(0);
  page.d.querySelector('#add-turn-reason').value = 'Missing completed pedicure';
  page.w.saveAddedTurn();
  const original = JSON.parse(page.w.localStorage.getItem(page.boardKey)).state.technicians[0];
  assert.equal(original.turnDetails.at(-1).amount,45);
  assert.equal(original.turnDetails.at(-1).credit,1);
  page.w.openBoardServices(); setField(page,'PED','price','120'); save(page);
  page.w.NEXORA_TURN_SETTINGS.save({bookingTurnCredit:.5,serviceWeights:[.25,.75,1.25,3.5]});
  const saved = JSON.parse(page.w.localStorage.getItem(page.boardKey)).state.technicians[0];
  assert.deepEqual(saved,original);
  page.w.setBoardMode('grid');
  const firstRow = page.d.querySelectorAll('.turn-grid tr')[1];
  assert.ok(firstRow.textContent.includes('$45 · +1T'));
  assert.ok(firstRow.querySelector('th').textContent.includes(original.turns + 'T'));
  page.w.openAddTurn(0);
  assert.equal(page.d.querySelector('#add-turn-amount').value,'120');
  assert.equal(page.d.querySelector('#add-turn-credit').value,'3.5');
});

test('saved symbols, names and prices reload for the same salon and still drive Add Turn', t => {
  const page = boot(t);
  page.w.openBoardServices();
  setField(page,'PED','code','SPA'); setField(page,'PED','name','Luxury Foot Care'); setField(page,'PED','price','88'); save(page);
  assert.ok(page.w.localStorage.getItem(page.key));
  const reload = boot(t,stored(page));
  assert.equal(reload.w.NEXORA_BOARD_SERVICES.code('PED'),'SPA');
  assert.equal(reload.w.NEXORA_BOARD_SERVICES.label('PED'),'Luxury Foot Care');
  assert.equal(reload.w.NEXORA_BOARD_SERVICES.get('PED').price,88);
  const result = reload.w.NEXORA_BOARD_SERVICES.list(); result[0].price = 1;
  assert.equal(reload.w.NEXORA_BOARD_SERVICES.get('PED').price,88);
  reload.w.openAddTurn(0);
  assert.equal(reload.d.querySelector('#add-turn-amount').value,'88');
  assert.equal(reload.d.querySelector('#add-turn-credit').value,'1.5');
  assert.ok(reload.d.querySelector('#add-turn-service option[value="PED"]').textContent.includes('SPA · Luxury Foot Care'));
});

test('service symbols and names render as literal text in the editor, picker and board', t => {
  const page = boot(t), symbol = '<b>SPA</b>', name = '<img src=x onerror="window.injected=true">';
  page.w.openBoardServices(); setField(page,'PED','code',symbol); setField(page,'PED','name',name); save(page);
  page.w.openBoardServices();
  assert.equal(field(page,'PED','code').value,symbol);
  assert.equal(field(page,'PED','name').value,name);
  assert.equal(page.d.querySelector('#board-services-modal img, #board-services-modal b'),null);
  page.d.querySelector('#board-services-modal [data-close-board-services]').click();
  page.w.openAddTurn(0);
  const option = page.d.querySelector('#add-turn-service option[value="PED"]');
  assert.ok(option.textContent.includes(symbol)); assert.ok(option.textContent.includes(name));
  assert.equal(option.querySelector('b, img'),null);
  page.w.closeAddTurn(); page.w.setBoardMode('grid');
  assert.ok(page.d.querySelector('.turn-grid').textContent.includes(symbol));
  assert.equal(page.d.querySelector('.turn-grid b, .turn-grid img'),null);
  assert.equal(page.w.injected,undefined);
});
