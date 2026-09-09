import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM, VirtualConsole} from 'jsdom';

const html = readFileSync(new URL('./pos-operating-standards.html', import.meta.url), 'utf8');
const script = name => readFileSync(new URL('../assets/' + name + '.js', import.meta.url), 'utf8');
function boot(t, {url = 'https://example.test/pages/pos-operating-standards.html', storage = {}} = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, {url, runScripts: 'outside-only', virtualConsole});
  const w = dom.window, d = w.document;
  w.structuredClone = structuredClone;
  w.HTMLDialogElement.prototype.showModal = function () {this.open = true;};
  w.HTMLDialogElement.prototype.close = function () {this.open = false;};
  let printCalls = 0;
  w.print = () => {printCalls += 1;};
  for (const [key, value] of Object.entries(storage)) w.localStorage.setItem(key, value);
  for (const name of ['salon-data', 'pos-turn-settings', 'operating-standards-data', 'operating-standards']) w.eval(script(name));
  t.after(() => {assert.deepEqual(errors, []); dom.window.close();});
  return {w, d, docs: w.NEXORA_OPERATING_STANDARDS_DATA.documents,
    get printCalls() {return printCalls;},
    storageKey: 'nexora:operating-standards:v1:' + w.NEXORA_SALON_DATA.loadCatalog().salon.id};
}
const cards = page => [...page.d.querySelectorAll('#standards-grid [data-standard-id]')];
const versions = page => [...page.d.querySelectorAll('#standard-version option')].map(option => option.value);
function input(page, element, value) {
  element.value = value;
  element.dispatchEvent(new page.w.Event('input', {bubbles: true}));
}
function submit(page) {
  page.d.querySelector('#standard-form').dispatchEvent(new page.w.Event('submit', {bubbles: true, cancelable: true}));
}
function stored(page) {
  return Object.fromEntries(Array.from({length: page.w.localStorage.length}, (_, i) => {
    const key = page.w.localStorage.key(i);
    return [key, page.w.localStorage.getItem(key)];
  }));
}
function selectVersion(page, value) {
  const select = page.d.querySelector('#standard-version');
  select.value = value;
  select.dispatchEvent(new page.w.Event('change', {bubbles: true}));
}
async function historyMove(page, direction) {
  const changed = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('History navigation did not emit popstate')), 1000);
    page.w.addEventListener('popstate', () => {clearTimeout(timer); resolve();}, {once: true});
  });
  page.w.history[direction]();
  await changed;
}

test('library keeps all nine source documents and every one of the 173 static rules', t => {
  const page = boot(t);
  assert.equal(page.docs.length, 9);
  assert.equal(page.docs.reduce((total, doc) => total + doc.sections.reduce((count, section) => count + section.rules.length, 0), 0), 173);
  assert.equal(cards(page).length, 9);
  for (const doc of page.docs) {
    const card = page.d.querySelector('#standards-grid [data-standard-id="' + doc.id + '"]');
    assert.equal(new URL(card.href).searchParams.get('doc'), doc.id);
    assert.ok(card.textContent.includes(doc.title));
    card.click();
    const detail = page.d.querySelector('#standard-detail');
    assert.equal(detail.hidden, false);
    assert.equal(page.d.querySelector('#standard-title').textContent, doc.title);
    for (const section of doc.sections) {
      assert.ok(detail.textContent.includes(section.title));
      for (const rule of section.rules) assert.ok(detail.textContent.includes(rule), 'Missing source rule: ' + rule);
    }
    if (doc.id === 'noiquy') {
      assert.equal(detail.querySelectorAll('.standard-section').length, 10);
      assert.equal(detail.querySelectorAll('.standard-section li').length, 54);
      assert.equal(detail.querySelectorAll('[data-live-turn-rules] li').length, 7);
    } else {
      assert.equal(detail.querySelectorAll('.standard-section').length, doc.sections.length);
      assert.equal(detail.querySelector('[data-live-turn-rules]'), null);
    }
    page.d.querySelector('[data-standard-back]').click();
  }
});

test('search finds body content and combines with document type filters and reset', t => {
  const page = boot(t);
  input(page, page.d.querySelector('#standards-search'), 'Không gợi ý hay xin tip');
  assert.deepEqual(cards(page).map(card => card.dataset.standardId), ['noiquy']);
  page.d.querySelector('[data-standard-filter="checklist"]').click();
  assert.equal(cards(page).length, 0);
  assert.equal(page.d.querySelector('#standards-empty').hidden, false);
  page.d.querySelector('#reset-standards-filter').click();
  assert.equal(cards(page).length, 9);
  assert.equal(page.d.querySelector('#standards-empty').hidden, true);
  page.d.querySelector('[data-standard-filter="agreement"]').click();
  assert.deepEqual(cards(page).map(card => card.dataset.standardId), ['thoathuan']);
});

test('detail URLs reload directly and browser back and forward restore the library and selected document', async t => {
  const page = boot(t, {url: 'https://example.test/pages/pos-operating-standards.html?doc=noiquy'});
  assert.equal(page.d.querySelector('#standard-title').textContent, 'Nội quy lao động');
  assert.equal(page.d.querySelector('#standards-library').hidden, true);
  page.d.querySelector('[data-standard-back]').click();
  assert.equal(page.d.querySelector('#standards-library').hidden, false);
  assert.equal(new URL(page.w.location.href).searchParams.get('doc'), null);
  page.d.querySelector('[data-standard-id="thoathuan"]').click();
  assert.equal(new URL(page.w.location.href).searchParams.get('doc'), 'thoathuan');
  await historyMove(page, 'back');
  assert.equal(page.d.querySelector('#standards-library').hidden, false);
  assert.equal(page.d.querySelector('#standard-detail').hidden, true);
  await historyMove(page, 'forward');
  assert.equal(page.d.querySelector('#standard-title').textContent, 'Bản thỏa thuận làm việc');
  const reloaded = boot(t, {url: page.w.location.href});
  assert.equal(reloaded.d.querySelector('#standard-title').textContent, 'Bản thỏa thuận làm việc');
});

test('editing persists a new version, keeps the previous content, and treats entered HTML as literal text', t => {
  const page = boot(t, {url: 'https://example.test/pages/pos-operating-standards.html?doc=donban'});
  const original = page.docs.find(doc => doc.id === 'donban');
  const title = 'Dọn bàn <img src=x onerror="window.injected=true">';
  const description = 'Mô tả <b>giữ nguyên văn bản</b>';
  const rule = '<script>window.injected=true</script>\nLau sạch bàn trước khi đón khách.';
  page.d.querySelector('[data-edit-standard]').click();
  assert.equal(page.d.querySelector('#standard-editor').open, true);
  input(page, page.d.querySelector('#standard-form [name="title"]'), title);
  input(page, page.d.querySelector('#standard-form [name="description"]'), description);
  input(page, page.d.querySelector('[data-edit-section] [data-section-rules]'), rule);
  submit(page);
  assert.equal(page.d.querySelector('#standard-editor').open, false);
  assert.equal(page.d.querySelector('#standard-title').textContent, title);
  assert.ok(page.d.querySelector('#standard-detail').textContent.includes(description));
  assert.ok(page.d.querySelector('#standard-detail').textContent.includes('<script>window.injected=true</script>'));
  assert.equal(page.d.querySelector('#standard-detail img[src="x"], #standard-detail script'), null);
  assert.equal(page.w.injected, undefined);
  assert.deepEqual(versions(page).sort(), ['1', '2']);
  assert.ok(page.w.localStorage.getItem(page.storageKey));
  selectVersion(page, '1');
  assert.equal(page.d.querySelector('#standard-title').textContent, original.title);
  assert.ok(page.d.querySelector('#standard-detail').textContent.includes(original.sections[0].rules[0]));
  selectVersion(page, '2');
  assert.equal(page.d.querySelector('#standard-title').textContent, title);
  const reloaded = boot(t, {url: page.w.location.href, storage: stored(page)});
  assert.equal(reloaded.d.querySelector('#standard-title').textContent, title);
  assert.deepEqual(versions(reloaded).sort(), ['1', '2']);
});

test('saving unchanged content does not create another document version', t => {
  const page = boot(t, {url: 'https://example.test/pages/pos-operating-standards.html?doc=khan'});
  const before = versions(page);
  assert.deepEqual(before, ['1']);
  for (let i = 0; i < 2; i += 1) {
    page.d.querySelector('[data-edit-standard]').click();
    submit(page);
    assert.deepEqual(versions(page), before);
    assert.equal(page.d.querySelector('#standard-version').value, '1');
  }
});

test('editor adds and removes sections without losing the remaining rules', t => {
  const page = boot(t, {url: 'https://example.test/pages/pos-operating-standards.html?doc=donban'});
  const original = page.docs.find(doc => doc.id === 'donban');
  page.d.querySelector('[data-edit-standard]').click();
  page.d.querySelector('#add-standard-section').click();
  let sections = page.d.querySelectorAll('[data-edit-section]');
  assert.equal(sections.length, original.sections.length + 1);
  sections[sections.length - 1].querySelector('[data-remove-section]').click();
  assert.equal(page.d.querySelectorAll('[data-edit-section]').length, original.sections.length);
  page.d.querySelector('#add-standard-section').click();
  sections = page.d.querySelectorAll('[data-edit-section]');
  const last = sections[sections.length - 1];
  input(page, last.querySelector('[data-section-title]'), 'Kiểm tra sau cùng');
  input(page, last.querySelector('[data-section-rules]'), 'Báo lễ tân khi bàn sẵn sàng.\nCất dụng cụ vào đúng nơi.');
  submit(page);
  const rendered = page.d.querySelectorAll('#standard-detail .standard-section');
  assert.equal(rendered.length, original.sections.length + 1);
  assert.ok(rendered[rendered.length - 1].textContent.includes('Kiểm tra sau cùng'));
  assert.equal(rendered[rendered.length - 1].querySelectorAll('li').length, 2);
  assert.ok(page.d.querySelector('#standard-detail').textContent.includes(original.sections[0].rules[0]));
});

test('shared turn settings update live rules without changing the document version or static source', t => {
  const page = boot(t, {url: 'https://example.test/pages/pos-operating-standards.html?doc=noiquy'});
  const live = () => page.d.querySelector('[data-live-turn-rules]');
  const before = live().textContent;
  assert.equal(live().querySelectorAll('li').length, 7);
  assert.equal(page.w.NEXORA_TURN_SETTINGS.save({bookingTurnCredit: 3.25, serviceWeights: [0.25, 1.75, 2.5, 4.5]}).ok, true);
  assert.notEqual(live().textContent, before);
  for (const value of ['3.25', '0.25', '1.75', '2.5', '4.5']) assert.ok(live().textContent.includes(value), 'Missing live credit ' + value);
  assert.deepEqual(versions(page), ['1']);
  assert.equal(page.docs[0].sections.length, 9);
  assert.equal(page.docs[0].sections.reduce((total, section) => total + section.rules.length, 0), 47);
  page.d.querySelector('[data-edit-standard]').click();
  assert.equal(page.d.querySelectorAll('[data-edit-section]').length, 9);
  assert.equal(page.d.querySelector('#standard-edit-sync').hidden, false);
});

test('print builds the complete library or the selected document with current live turn settings', t => {
  const page = boot(t);
  page.d.querySelector('#print-library').click();
  assert.equal(page.printCalls, 1);
  const printed = () => page.d.querySelector('#standards-print').textContent;
  for (const doc of page.docs) {
    assert.ok(printed().includes(doc.title));
    for (const section of doc.sections) for (const rule of section.rules) assert.ok(printed().includes(rule));
  }
  page.d.querySelector('[data-standard-id="noiquy"]').click();
  page.w.NEXORA_TURN_SETTINGS.save({bookingTurnCredit: 3.25, serviceWeights: [0.25, 1.75, 2.5, 4.5]});
  page.d.querySelector('[data-print-standard]').click();
  assert.equal(page.printCalls, 2);
  assert.ok(printed().includes('Nội quy lao động'));
  assert.ok(printed().includes('3.25'));
  assert.equal(printed().includes('Bản thỏa thuận làm việc'), false);
});

test('new documents require a title and complete sections before saving a persistent first version', t => {
  const page = boot(t);
  page.d.querySelector('#add-standard').click();
  submit(page);
  assert.equal(page.d.querySelector('#standard-editor').open, true);
  assert.ok(page.d.querySelector('#standard-error').textContent.trim());
  assert.equal(page.w.localStorage.getItem(page.storageKey), null);
  assert.equal(cards(page).length, 9);
  input(page, page.d.querySelector('#standard-form [name="title"]'), 'Kiểm tra kho cuối ngày');
  page.d.querySelector('#standard-form [name="type"]').value = 'checklist';
  submit(page);
  assert.equal(page.d.querySelector('#standard-editor').open, true);
  assert.equal(page.w.localStorage.getItem(page.storageKey), null);
  input(page, page.d.querySelector('[data-edit-section] [data-section-title]'), 'Trước khi đóng kho');
  input(page, page.d.querySelector('[data-edit-section] [data-section-rules]'), 'Kiểm tra số lượng khăn.\nKhóa tủ hóa chất.');
  submit(page);
  assert.equal(page.d.querySelector('#standard-editor').open, false);
  assert.equal(page.d.querySelector('#standard-title').textContent, 'Kiểm tra kho cuối ngày');
  assert.deepEqual(versions(page), ['1']);
  assert.equal(page.d.querySelectorAll('#standard-detail .standard-rules.is-checklist li').length, 2);
  const id = new URL(page.w.location.href).searchParams.get('doc');
  assert.ok(id && !page.docs.some(doc => doc.id === id));
  const reload = boot(t, {url: page.w.location.href, storage: stored(page)});
  assert.equal(reload.d.querySelector('#standard-title').textContent, 'Kiểm tra kho cuối ngày');
  reload.d.querySelector('[data-standard-back]').click();
  assert.equal(cards(reload).length, 10);
});

test('storage failure preserves the open draft and original version until a successful retry', t => {
  const page = boot(t, {url: 'https://example.test/pages/pos-operating-standards.html?doc=donban'});
  const originalTitle = page.d.querySelector('#standard-title').textContent;
  const originalStorage = page.w.localStorage.getItem(page.storageKey);
  page.d.querySelector('[data-edit-standard]').click();
  const titleInput = page.d.querySelector('#standard-form [name="title"]');
  input(page, titleInput, 'Dọn bàn và kiểm tra lần cuối');
  const setItem = page.w.Storage.prototype.setItem;
  page.w.Storage.prototype.setItem = function (key, value) {
    if (key === page.storageKey) throw new page.w.DOMException('Storage is full', 'QuotaExceededError');
    return setItem.call(this, key, value);
  };
  submit(page);
  assert.equal(page.d.querySelector('#standard-editor').open, true);
  assert.ok(page.d.querySelector('#standard-error').textContent.trim());
  assert.equal(titleInput.value, 'Dọn bàn và kiểm tra lần cuối');
  assert.equal(page.d.querySelector('#standard-title').textContent, originalTitle);
  assert.deepEqual(versions(page), ['1']);
  assert.equal(page.w.localStorage.getItem(page.storageKey), originalStorage);
  page.w.Storage.prototype.setItem = setItem;
  submit(page);
  assert.equal(page.d.querySelector('#standard-editor').open, false);
  assert.equal(page.d.querySelector('#standard-title').textContent, 'Dọn bàn và kiểm tra lần cuối');
  assert.deepEqual(versions(page).sort(), ['1', '2']);
  const reload = boot(t, {url: page.w.location.href, storage: stored(page)});
  assert.equal(reload.d.querySelector('#standard-title').textContent, 'Dọn bàn và kiểm tra lần cuối');
});
