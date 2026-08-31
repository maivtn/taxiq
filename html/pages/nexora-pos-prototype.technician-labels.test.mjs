import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SOURCE = readFileSync(new URL('./nexora-pos-prototype.html', import.meta.url), 'utf8');

function sourceBetween(start, end) {
  const startIndex = SOURCE.indexOf(start);
  const endIndex = SOURCE.indexOf(end, startIndex);
  assert.notEqual(startIndex, -1, `${start} must exist`);
  assert.notEqual(endIndex, -1, `${end} must exist after ${start}`);
  return SOURCE.slice(startIndex, endIndex);
}

test('renders Anyone for the kiosk no-preference technician choice', () => {
  const context = {
    WAITLIST: [],
    kSvcSel: new Set(),
    kTechSel: null,
    MENU: [],
    TECHS: [],
    reqSkill() { return null; },
    avaHtml() { return ''; },
    escapeHtml(value) { return String(value); }
  };
  const runtime = sourceBetween('function kTechChips()', 'function renderKiosk()');

  vm.runInNewContext(`${runtime}\nresult = kTechChips();`, context);

  assert.match(context.result, />Anyone<div/);
  assert.doesNotMatch(context.result, /First available/i);
});

test('describes Anyone as the fastest kiosk technician choice', () => {
  const elements = {
    kDisp: { innerHTML: '' },
    kRight: { innerHTML: '' }
  };
  const context = {
    kDigits: '7135550100',
    kBooking: null,
    kSkipAppt: false,
    kMatch: { name: 'Mia', seg: 'member', visits: 2 },
    kSvcSel: new Set(),
    kFmt(value) { return value; },
    kCanGo() { return false; },
    kCard(value) { return value; },
    kSvcChips() { return ''; },
    kTechChips() { return ''; },
    escapeHtml(value) { return String(value); },
    $(id) { return elements[id]; }
  };
  const runtime = sourceBetween('function renderKiosk()', 'function kLookup()');

  vm.runInNewContext(`${runtime}\nrenderKiosk();`, context);

  assert.match(elements.kRight.innerHTML, /"Anyone" is fastest/);
  assert.doesNotMatch(elements.kRight.innerHTML, /First available/i);
});

test('renders Anyone for online booking without a technician preference', () => {
  const techPicker = { innerHTML: '' };
  const context = {
    bTechSel: null,
    TECHS: [],
    avaHtml() { return ''; },
    escapeHtml(value) { return String(value); },
    $() { return techPicker; }
  };
  const runtime = sourceBetween('function bRenderTech()', 'function bRenderTime()');

  vm.runInNewContext(`${runtime}\nbRenderTech();`, context);

  assert.match(techPicker.innerHTML, />Anyone<div/);
  assert.doesNotMatch(techPicker.innerHTML, /First available/i);
});

test('renders Anyone for an unassigned appointment technician', () => {
  const appointmentPanel = { innerHTML: '' };
  const context = {
    apMode: 'new',
    apDraft: {},
    apSvcSel: new Set(),
    TECHS: [],
    B_SLOTS: ['10:00 AM'],
    MENU_SVC() { return []; },
    escapeHtml(value) { return String(value); },
    $() { return appointmentPanel; }
  };
  const runtime = sourceBetween('function renderApPanel()', 'function apSyncDraft()');

  vm.runInNewContext(`${runtime}\nrenderApPanel();`, context);

  assert.match(appointmentPanel.innerHTML, /Chưa gán — Anyone/);
  assert.doesNotMatch(appointmentPanel.innerHTML, /First available/i);
});
