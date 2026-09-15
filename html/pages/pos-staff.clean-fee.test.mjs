import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const salonSource = readFileSync(new URL('../assets/salon-data.js', import.meta.url), 'utf8');

function boot(page, storedCatalog) {
  const dom = new JSDOM(readFileSync(new URL(page, import.meta.url), 'utf8'), {
    url: 'https://example.test/pages/' + page,
    runScripts: 'dangerously',
    beforeParse(window) {
      window.eval(salonSource);
      if (storedCatalog) window.localStorage.setItem(window.NEXORA_SALON_DATA.STORAGE_KEY, storedCatalog);
      window.NEXORA_APPOINTMENT_SERVICE_CATALOG = { load: () => new Promise(() => {}) };
    },
  });
  if (page === 'pos-salon-settings.html') {
    dom.window.eval(readFileSync(new URL('../assets/pos-salon-settings.js', import.meta.url), 'utf8'));
  }
  const { window: w } = dom;
  const d = w.document;
  return {
    dom, w, d,
    fee: d.querySelector('[data-tech-field="cleanFee"]'),
    edit: id => d.querySelector('[data-tech-detail-open="' + id + '"]').click(),
    save: () => d.querySelector('[data-tech-modal-save]').click(),
    profile: id => w.NEXORA_SALON_DATA.loadCatalog().technicians.find(t => t.id === id).posProfile,
    stored: () => w.localStorage.getItem(w.NEXORA_SALON_DATA.STORAGE_KEY),
  };
}

for (const page of ['pos-staff.html', 'pos-salon-settings.html']) {
  test(page + ': clean fee persists for the edited technician across page reloads', t => {
    const app = boot(page);
    t.after(() => app.dom.window.close());
    app.edit('t1');
    assert.ok(app.fee, 'Edit technician exposes Clean Fee');
    assert.equal(app.fee.value, '0.00');
    const original = app.profile('t1');
    const other = app.profile('t2');
    app.fee.value = '12.35';
    app.save();
    assert.equal(app.d.querySelector('[data-tech-modal]').hidden, true);
    assert.equal(app.profile('t1').cleanFee, 12.35);
    assert.equal(app.profile('t1').comm, original.comm);
    assert.equal(app.profile('t1').guar, original.guar);
    assert.deepEqual(app.profile('t2'), other);

    const reloaded = boot(page, app.stored());
    t.after(() => reloaded.dom.window.close());
    reloaded.edit('t1');
    assert.equal(reloaded.fee.value, '12.35');
  });

  test(page + ': new technicians default to zero and clearing a fee removes the amount', t => {
    const app = boot(page);
    t.after(() => app.dom.window.close());
    app.edit('t1');
    assert.ok(app.fee, 'Edit technician exposes Clean Fee');
    app.fee.value = '8.50';
    app.save();
    app.d.querySelector('[data-tech-modal-open]').click();
    assert.equal(app.fee.value, '0.00');
    app.d.querySelector('[data-tech-field="name"]').value = 'New clean fee technician';
    app.save();
    const created = app.w.NEXORA_SALON_DATA.loadCatalog().technicians.find(t => t.name === 'New clean fee technician');
    assert.equal(created.posProfile.cleanFee, 0);

    app.edit('t1');
    app.fee.value = '';
    app.save();
    assert.equal(app.profile('t1').cleanFee, 0);
    app.edit('t1');
    assert.equal(app.fee.value, '0.00');
  });

  test(page + ': invalid clean fees keep the editor open and preserve the saved profile', t => {
    const app = boot(page);
    t.after(() => app.dom.window.close());
    app.edit('t1');
    assert.ok(app.fee, 'Edit technician exposes Clean Fee');
    app.fee.value = '5.25';
    app.save();
    app.edit('t1');
    for (const value of ['-1', '1.234']) {
      app.fee.value = value;
      app.save();
      assert.equal(app.d.querySelector('[data-tech-modal]').hidden, false);
      assert.equal(app.profile('t1').cleanFee, 5.25);
    }
    app.fee.value = '0';
    app.save();
    assert.equal(app.d.querySelector('[data-tech-modal]').hidden, true);
    assert.equal(app.profile('t1').cleanFee, 0);
  });
}
