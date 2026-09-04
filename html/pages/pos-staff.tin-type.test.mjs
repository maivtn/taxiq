import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const PAGE_URL = new URL('./pos-staff.html', import.meta.url);
const POS_BOOKING_CSS_URL = new URL('../assets/pos-booking.css', import.meta.url);
const PAGE_HTML = readFileSync(PAGE_URL, 'utf8');
const PAGE_SOURCE = PAGE_HTML.replace('<style>', `<style>${readFileSync(POS_BOOKING_CSS_URL, 'utf8')}</style><style>`);

function catalogFixture({ ssn = '', ein = '' } = {}) {
  return {
    technicians: [{
      id: 'tech-1',
      name: 'Avery Nguyen',
      phone: '(713) 555-0100',
      email: 'avery@example.com',
      active: true,
      services: [],
      skills: [],
      schedule: '',
      posProfile: {
        posRole: 'tech',
        payModel: 'comm',
        comm: 0.6,
        tipsEnabled: true,
        contractType: 'w2',
        ssn,
        ein,
      },
    }],
    services: [],
  };
}

function loadPage(initialCatalog = catalogFixture()) {
  let savedCatalog = null;
  const dom = new JSDOM(PAGE_SOURCE, {
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: 'https://merchant.nexora.test/html/pages/pos-staff.html',
    beforeParse(window) {
      window.NEXORA_SALON_DATA = {
        findService() { return null; },
        findTechnician(catalog, id) {
          return catalog.technicians.find((technician) => technician.id === id) || null;
        },
        loadCatalog() { return savedCatalog || initialCatalog; },
        saveCatalog(catalog) { savedCatalog = catalog; },
      };
      window.NEXORA_APPOINTMENT_SERVICE_CATALOG = {
        load() { return new Promise(() => {}); },
      };
    },
  });

  return {
    dom,
    getSavedCatalog() { return savedCatalog; },
    window: dom.window,
  };
}

function change(window, element) {
  element.dispatchEvent(new window.Event('change', { bubbles: true }));
}

function click(window, selector) {
  const element = window.document.querySelector(selector);
  assert.ok(element, `Expected ${selector} to exist`);
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  return element;
}

test('Tax Filing starts with one optional SSN input controlled by an accessible TIN type radio group', () => {
  const { dom, window } = loadPage();
  const { document } = window;
  const radios = [...document.querySelectorAll('[data-tech-tin-type]')];

  assert.equal(document.querySelector('[data-tech-tin-options]')?.getAttribute('role'), 'radiogroup');
  assert.deepEqual(radios.map((radio) => radio.value), ['ssn', 'ein']);
  assert.equal(radios.filter((radio) => radio.checked).length, 1);
  assert.equal(radios.some((radio) => radio.required), false);
  assert.equal(document.querySelector('[data-tech-tin-type][value="ssn"]')?.checked, true);
  assert.equal(document.querySelectorAll('[data-tech-tin-input]').length, 1);
  assert.equal(document.querySelector('[data-tech-tin-input]')?.required, false);
  assert.equal(document.querySelectorAll('[data-tech-tax-section] .tech-tin-required').length, 0);
  assert.equal(document.querySelector('[data-tech-tin-label]')?.textContent.trim(), 'Social security number');
  assert.equal(document.querySelector('[data-tech-tin-input]')?.placeholder, '000-00-0000');
  assert.equal(document.querySelector('[data-tech-tin-help]')?.textContent.trim(), 'For individuals, this is generally your SSN.');

  dom.window.close();
});

test('choosing EIN updates the single TIN field content', () => {
  const { dom, window } = loadPage();
  const { document } = window;
  const ein = document.querySelector('[data-tech-tin-type][value="ein"]');

  assert.ok(ein, 'EIN radio must exist');
  ein.checked = true;
  change(window, ein);

  assert.equal(document.querySelector('[data-tech-tin-label]')?.textContent.trim(), 'Employer identification number');
  assert.equal(document.querySelector('[data-tech-tin-input]')?.placeholder, '00-0000000');
  assert.equal(document.querySelector('[data-tech-tin-help]')?.textContent.trim(), 'For entities, this is generally the EIN.');

  dom.window.close();
});

test('desktop Tax Filing keeps both auto-width TIN choices and both fields in one flex row', () => {
  const { dom, window } = loadPage();
  const row = window.document.querySelector('[data-tech-tin-row]');
  const fieldset = window.document.querySelector('.tech-tin-fieldset');
  const options = window.document.querySelector('[data-tech-tin-options]');
  const choice = window.document.querySelector('.tech-tin-choice');
  const contractField = window.document.querySelector('[data-tech-field="contractType"]')?.closest('.settings-field');

  assert.ok(row, 'Tax Filing desktop row must exist');
  assert.ok(fieldset, 'TIN type fieldset must exist');
  assert.ok(options, 'TIN chooser must exist');
  assert.ok(choice, 'TIN choice must exist');
  assert.ok(contractField, 'Contract Type field must exist');
  assert.equal(window.getComputedStyle(row).display, 'flex');
  assert.equal(window.getComputedStyle(row).flexWrap, 'wrap');
  assert.equal(window.getComputedStyle(fieldset).flex, '0 0 auto');
  assert.equal(window.getComputedStyle(options).display, 'flex');
  assert.equal(window.getComputedStyle(choice).width, 'auto');
  assert.equal(window.getComputedStyle(choice).flex, '0 0 auto');

  dom.window.close();
});

test('editing and saving an EIN profile keeps the selected TIN type in the existing data model', () => {
  const { dom, getSavedCatalog, window } = loadPage(catalogFixture({ ein: '12-3456789' }));
  const { document } = window;

  click(window, '[data-tech-detail-open="tech-1"]');
  assert.equal(document.querySelector('[data-tech-tin-type][value="ein"]')?.checked, true);
  assert.equal(document.querySelector('[data-tech-tin-input]')?.value, '12-3456789');

  document.querySelector('[data-tech-tin-input]').value = '98-7654321';
  click(window, '[data-tech-modal-save]');

  const savedProfile = getSavedCatalog().technicians.find((technician) => technician.id === 'tech-1').posProfile;
  assert.equal(savedProfile.ssn, '');
  assert.equal(savedProfile.ein, '98-7654321');

  dom.window.close();
});
