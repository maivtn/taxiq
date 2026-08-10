import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SOURCE = readFileSync(new URL('./oneqr-staff.html', import.meta.url), 'utf8');

function staffScript() {
  const scripts = [...SOURCE.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  const script = scripts.at(-1)?.[1];
  assert.ok(script, 'staff runtime script must exist');
  return script;
}

function createElement({ id = '', action = '', choice = '', text = '' } = {}) {
  const listeners = new Map();
  const classes = new Set();
  const attributes = new Map();
  const element = {
    id,
    dataset: {},
    hidden: false,
    disabled: false,
    style: {},
    textContent: text,
    children: [],
    scrollCount: 0,
    classList: {
      add(...names) { names.forEach((name) => classes.add(name)); },
      remove(...names) { names.forEach((name) => classes.delete(name)); },
      contains(name) { return classes.has(name); },
      toggle(name, force) {
        const next = force === undefined ? !classes.has(name) : Boolean(force);
        if (next) classes.add(name);
        else classes.delete(name);
        return next;
      }
    },
    addEventListener(type, handler) {
      const values = listeners.get(type) || [];
      values.push(handler);
      listeners.set(type, values);
    },
    dispatch(type) {
      const event = {
        type,
        currentTarget: element,
        target: element,
        defaultPrevented: false,
        preventDefault() { event.defaultPrevented = true; }
      };
      for (const handler of listeners.get(type) || []) handler(event);
      return event;
    },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.has(name) ? attributes.get(name) : null; },
    removeAttribute(name) { attributes.delete(name); },
    append(...items) { element.children.push(...items); },
    replaceChildren(...items) { element.children = [...items]; },
    scrollIntoView() { element.scrollCount += 1; }
  };
  if (action) element.dataset.staffAction = action;
  if (choice) element.dataset.choice = choice;
  return element;
}

function createStaffPage() {
  const actions = ['clock-in', 'turn', 'receive-customer', 'complete-service', 'tip', 'request-approval']
    .map((action) => createElement({
      id: action === 'receive-customer' ? 'oneqrReceiveCustomerBtn' : '',
      action
    }));
  const choices = ['Appointment', 'Walk-in'].map((choice) => createElement({ choice }));
  const nodes = [
    createElement({ id: 'oneqrStaffName', text: 'Hi Chloe' }),
    createElement({ id: 'oneqrStaffStatus' }),
    createElement({ id: 'oneqrStaffActionTitle' }),
    createElement({ id: 'oneqrStaffActionMessage' }),
    createElement({ id: 'oneqrStaffActivityList' }),
    createElement({ id: 'oneqrReceiveCustomerPanel' }),
    ...actions,
    ...choices
  ];
  const byId = new Map(nodes.filter((node) => node.id).map((node) => [node.id, node]));
  byId.get('oneqrReceiveCustomerPanel').hidden = true;
  byId.get('oneqrReceiveCustomerBtn').setAttribute('aria-expanded', 'false');

  const document = {
    getElementById(id) { return byId.get(id) || null; },
    querySelectorAll(selector) {
      if (selector === '[data-staff-action]') return actions;
      if (selector === '.oneqr-staff-choice') return choices;
      return [];
    },
    createElement(tagName) {
      return createElement({ text: tagName === 'time' ? '10:30 AM' : '' });
    }
  };
  const storage = {
    values: new Map(),
    getItem(key) { return this.values.has(key) ? this.values.get(key) : null; },
    setItem(key, value) { this.values.set(key, String(value)); },
    removeItem(key) { this.values.delete(key); }
  };
  const window = {
    localStorage: storage,
    lucide: { createIcons() {} }
  };
  window.window = window;
  const context = vm.createContext({
    window,
    document,
    localStorage: storage,
    lucide: window.lucide,
    console,
    Date
  });
  vm.runInContext(staffScript(), context);
  return { actions, choices, byId, storage };
}

test('declares every staff quick action as a wired button instead of a placeholder link', () => {
  assert.doesNotMatch(SOURCE, /<a class="oneqr-scan-item" href="#"/);
  const declared = [...SOURCE.matchAll(/data-staff-action="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(declared, [
    'clock-in',
    'turn',
    'receive-customer',
    'complete-service',
    'tip',
    'request-approval'
  ]);
});

test('dispatches staff actions into visible status and saved state', () => {
  const { actions, choices, byId, storage } = createStaffPage();
  const byAction = new Map(actions.map((button) => [button.dataset.staffAction, button]));

  byAction.get('clock-in').dispatch('click');
  assert.equal(byId.get('oneqrStaffActionTitle').textContent, 'Clocked in');

  byAction.get('turn').dispatch('click');
  assert.match(byId.get('oneqrStaffActionMessage').textContent, /turn 3/i);

  byAction.get('receive-customer').dispatch('click');
  assert.equal(byId.get('oneqrReceiveCustomerPanel').hidden, false);
  assert.equal(byAction.get('receive-customer').getAttribute('aria-expanded'), 'true');

  choices[0].dispatch('click');
  assert.equal(choices[0].getAttribute('aria-pressed'), 'true');
  assert.match(byId.get('oneqrStaffActionMessage').textContent, /Appointment/);

  byAction.get('complete-service').dispatch('click');
  assert.equal(byId.get('oneqrStaffActionTitle').textContent, 'Service completed');

  byAction.get('request-approval').dispatch('click');
  assert.equal(byId.get('oneqrStaffActionTitle').textContent, 'Approval requested');
  assert.match(storage.getItem('taxiq:oneqr-staff-state'), /"approvalStatus":"pending"/);
});
