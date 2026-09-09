import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM, VirtualConsole} from 'jsdom';

function boot(t, {url = 'https://example.test/pages/pos-operating-standards.html', storage = {}} = {}) {
  const errors = [], virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(readFileSync(new URL('./pos-operating-standards.html', import.meta.url),'utf8'), {url,runScripts:'outside-only',virtualConsole});
  const w = dom.window, d = w.document;
  w.structuredClone = structuredClone;
  w.HTMLDialogElement.prototype.showModal = function () {this.open = true;};
  w.HTMLDialogElement.prototype.close = function () {this.open = false;};
  w.print = () => {};
  Object.entries(storage).forEach(([key,value]) => w.localStorage.setItem(key,value));
  for (const name of ['salon-data','pos-turn-settings','operating-standards-data','operating-standards-generator-data','operating-standards']) {
    w.eval(readFileSync(new URL('../assets/' + name + '.js',import.meta.url),'utf8'));
  }
  t.after(() => {assert.deepEqual(errors,[]); dom.window.close();});
  return {w,d,key:'nexora:operating-standards:v1:' + w.NEXORA_SALON_DATA.loadCatalog().salon.id};
}
const editor = page => page.d.querySelector('#standard-editor');
const generator = page => page.d.querySelector('#standard-generator');
const draftSections = page => [...page.d.querySelectorAll('[data-edit-section]')].map(section => ({
  title:section.querySelector('[data-section-title]').value,
  rules:section.querySelector('[data-section-rules]').value.split('\n').filter(rule => rule.trim())
}));
const draftRuleCount = page => draftSections(page).reduce((count,section) => count + section.rules.length,0);
const draftText = page => draftSections(page).flatMap(section => section.rules).join('\n');
function submit(page) {page.d.querySelector('#standard-form').dispatchEvent(new page.w.Event('submit',{bubbles:true,cancelable:true}));}
function preset(page,id) {
  page.d.querySelector('#create-standard-rules').click();
  page.d.querySelector('[data-generator-step="templates"]').click();
  page.d.querySelector('[data-generator-preset="' + id + '"]').click();
}
function answers(page) {
  return Object.fromEntries(['size','flow','en','svc','strict'].map(name => [name,name === 'svc'
    ? [...generator(page).querySelectorAll('input[name="svc"]:checked')].map(input => input.value)
    : generator(page).querySelector('input[name="' + name + '"]:checked')?.value]));
}
function stored(page) {
  return Object.fromEntries(Array.from({length:page.w.localStorage.length},(_,i) => {
    const key = page.w.localStorage.key(i); return [key,page.w.localStorage.getItem(key)];
  }));
}
const currentDocument = page => JSON.parse(page.w.localStorage.getItem(page.key)).documents.find(doc => doc.id === 'noiquy');

test('generator offers templates, questions and a blank draft, with Back and Cancel leaving current documents untouched', t => {
  const page = boot(t);
  page.d.querySelector('#create-standard-rules').click();
  assert.equal(generator(page).open,true);
  assert.ok(page.d.querySelector('[data-generator-step="templates"]'));
  assert.ok(page.d.querySelector('[data-generator-step="questions"]'));
  assert.ok(page.d.querySelector('#generator-blank'));
  page.d.querySelector('[data-generator-step="templates"]').click();
  assert.deepEqual([...generator(page).querySelectorAll('[data-generator-preset]')].map(button => button.dataset.generatorPreset).sort(),['lg','sm','spa','std']);
  page.d.querySelector('#generator-back').click();
  page.d.querySelector('[data-generator-step="questions"]').click();
  assert.deepEqual(answers(page),{size:'md',flow:'both',en:'high',svc:[],strict:'mid'});
  page.d.querySelector('#generator-back').click();
  page.d.querySelector('[data-close-standard-generator]').click();
  assert.equal(generator(page).open,false);
  assert.equal(editor(page).open,false);
  assert.equal(page.w.localStorage.getItem(page.key),null);
  assert.equal(page.d.querySelectorAll('#standards-grid [data-standard-id]').length,9);
});

test('four presets generate the distinct source rule sets as unsaved editable drafts', t => {
  const page = boot(t);
  const expected = {std:47,sm:38,lg:50,spa:52};
  for (const [id,count] of Object.entries(expected)) {
    preset(page,id);
    assert.equal(generator(page).open,false);
    assert.equal(editor(page).open,true);
    assert.equal(draftSections(page).length,9);
    assert.equal(draftRuleCount(page),count);
    assert.equal(page.d.querySelector('#standard-edit-sync').hidden,false);
    const text = draftText(page);
    if (id === 'sm') {
      assert.equal(text.includes('Thợ mới có thợ kèm trong tháng đầu'),false);
      assert.equal(text.includes('Nói tiếng Anh khi phục vụ khách nước ngoài'),false);
    }
    if (id === 'lg') {
      assert.ok(text.includes('Có mặt trước giờ mở cửa 20 phút'));
      assert.ok(text.includes('tối đa 2 thợ đi ăn cùng lúc'));
      assert.equal(text.includes('Khách có hẹn được ưu tiên đúng giờ hẹn'),false);
    }
    if (id === 'spa') {
      assert.ok(text.includes('Đồng phục và bảng tên bắt buộc'));
      assert.ok(text.includes('Giữ không gian yên tĩnh'));
      assert.ok(text.includes('Giới thiệu sản phẩm bán lẻ đúng nhu cầu khách'));
    }
    assert.equal(page.w.localStorage.getItem(page.key),null);
    editor(page).querySelector('[data-close-standard-editor]').click();
  }
});

test('question answers change the summary and conditional rules, then persist only when the draft is saved', t => {
  const page = boot(t);
  page.d.querySelector('#create-standard-rules').click();
  page.d.querySelector('[data-generator-step="questions"]').click();
  const chosen = {size:'sm',flow:'appt',en:'low',svc:['kid','wax'],strict:'soft'};
  for (const [name,value] of Object.entries(chosen)) {
    for (const option of Array.isArray(value) ? value : [value]) generator(page).querySelector('input[name="' + name + '"][value="' + option + '"]').click();
  }
  const summary = page.d.querySelector('#generator-summary').textContent;
  assert.match(summary,/9\s*mục/); assert.match(summary,/38\s*điều/);
  page.d.querySelector('#generator-generate').click();
  assert.equal(draftRuleCount(page),38);
  assert.ok(draftText(page).includes('Trẻ em phải có người lớn đi kèm'));
  assert.ok(draftText(page).includes('Kiểm tra dị ứng và tình trạng móng'));
  assert.equal(draftText(page).includes('Khách walk-in đông'),false);
  assert.equal(draftText(page).includes('Nói tiếng Anh khi phục vụ khách nước ngoài'),false);
  assert.equal(page.w.localStorage.getItem(page.key),null);
  submit(page);
  assert.equal(editor(page).open,false);
  assert.deepEqual(currentDocument(page).generatorAnswers,chosen);
  assert.equal(currentDocument(page).version,2);
  const reload = boot(t,{url:page.w.location.href,storage:stored(page)});
  reload.d.querySelector('[data-generate-standard]').click();
  reload.d.querySelector('[data-generator-step="questions"]').click();
  assert.deepEqual(answers(reload),chosen);
});

test('saving generated rules replaces only noiquy, archives its prior version and preserves the other eight and custom documents', t => {
  const page = boot(t);
  page.d.querySelector('#add-standard').click();
  page.d.querySelector('#standard-form [name="title"]').value = 'Kiểm tra kho';
  page.d.querySelector('[data-section-title]').value = 'Cuối ngày';
  page.d.querySelector('[data-section-rules]').value = 'Khóa tủ hóa chất.';
  submit(page);
  const before = JSON.parse(page.w.localStorage.getItem(page.key));
  assert.equal(before.documents.length,10);
  page.d.querySelector('[data-standard-back]').click();
  preset(page,'lg');
  assert.deepEqual(JSON.parse(page.w.localStorage.getItem(page.key)),before);
  submit(page);
  const after = JSON.parse(page.w.localStorage.getItem(page.key));
  assert.equal(after.documents.length,10);
  assert.deepEqual(after.documents.filter(doc => doc.id !== 'noiquy'),before.documents.filter(doc => doc.id !== 'noiquy'));
  const noiquy = after.documents.find(doc => doc.id === 'noiquy');
  const previous = before.documents.find(doc => doc.id === 'noiquy');
  assert.equal(noiquy.version,2);
  assert.equal(noiquy.history.length,1);
  assert.equal(noiquy.history[0].version,1);
  assert.deepEqual(noiquy.history[0].sections,previous.sections);
  assert.equal(noiquy.autoTurnRules,true);
  assert.equal(page.d.querySelectorAll('#standard-detail [data-live-turn-rules] li').length,7);
  page.w.NEXORA_TURN_SETTINGS.save({bookingTurnCredit:3.25,serviceWeights:[.25,.75,1.25,3.5]});
  assert.ok(page.d.querySelector('[data-live-turn-rules]').textContent.includes('3.25'));
  assert.equal(page.d.querySelectorAll('#standard-detail .standard-section li').length,57);
  const version = page.d.querySelector('#standard-version'); version.value = '1';
  version.dispatchEvent(new page.w.Event('change',{bubbles:true}));
  assert.equal(page.d.querySelectorAll('#standard-detail .standard-section li').length,54);
  assert.equal(page.d.querySelector('[data-live-turn-rules]'),null);
});

test('blank generation starts with empty sections and saves a revised noiquy only after valid custom content is entered', t => {
  const page = boot(t);
  page.d.querySelector('#create-standard-rules').click(); page.d.querySelector('#generator-blank').click();
  assert.equal(generator(page).open,false); assert.equal(editor(page).open,true);
  assert.equal(draftRuleCount(page),0);
  submit(page);
  assert.equal(editor(page).open,true);
  assert.ok(page.d.querySelector('#standard-error').textContent.trim());
  assert.equal(page.w.localStorage.getItem(page.key),null);
  page.d.querySelector('#standard-form [name="title"]').value = 'Nội quy riêng của tiệm';
  page.d.querySelector('[data-section-title]').value = 'Bắt đầu ca';
  page.d.querySelector('[data-section-rules]').value = 'Kiểm tra bàn làm việc trước khi nhận khách.';
  submit(page);
  const saved = currentDocument(page);
  assert.equal(saved.title,'Nội quy riêng của tiệm'); assert.equal(saved.version,2);
  assert.equal(saved.sections.length,1); assert.equal(saved.sections[0].rules.length,1);
  assert.equal(saved.history[0].version,1);
  assert.equal(JSON.parse(page.w.localStorage.getItem(page.key)).documents.length,9);
  assert.equal(page.d.querySelectorAll('[data-live-turn-rules] li').length,7);
});

test('generator from detail keeps the existing document and generated draft intact when saving fails', t => {
  const page = boot(t,{url:'https://example.test/pages/pos-operating-standards.html?doc=noiquy'});
  page.d.querySelector('[data-generate-standard]').click();
  page.d.querySelector('[data-generator-step="templates"]').click();
  page.d.querySelector('[data-generator-preset="lg"]').click();
  const originalSetItem = page.w.Storage.prototype.setItem;
  page.w.Storage.prototype.setItem = function (key,value) {
    if (key === page.key) throw new page.w.DOMException('Full storage','QuotaExceededError');
    return originalSetItem.call(this,key,value);
  };
  submit(page);
  assert.equal(editor(page).open,true); assert.equal(draftRuleCount(page),50);
  assert.ok(page.d.querySelector('#standard-error').textContent.trim());
  assert.equal(page.w.localStorage.getItem(page.key),null);
  assert.equal(page.d.querySelectorAll('#standard-detail .standard-section li').length,54);
  assert.equal(page.d.querySelector('#standard-version').value,'1');
  page.w.Storage.prototype.setItem = originalSetItem;
  submit(page);
  assert.equal(editor(page).open,false); assert.equal(currentDocument(page).version,2);
  assert.equal(page.d.querySelectorAll('#standard-detail .standard-section li').length,57);
});
