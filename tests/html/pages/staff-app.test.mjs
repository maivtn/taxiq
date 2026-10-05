import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const pages = new URL('../../../html/pages/', import.meta.url);
const staffApp = new URL('staff-app.html', pages);
const source = () => readFileSync(staffApp, 'utf8');
const bridge = readFileSync(new URL('../assets/staff-community.js', pages), 'utf8');
const tabs = ['feed', 'groups', 'shift', 'profile', 'deals', 'connect', 'learning', 'jobs', 'events'];

function harness() {
  const dom = new JSDOM(source(), {url: 'https://demo.test/html/pages/staff-app.html', runScripts: 'outside-only'});
  const {window} = dom;
  const template = window.document.querySelector('[data-staff-sidebar-template]');
  const previews = [...window.document.querySelectorAll('[data-staff-community-shell]')].map(shell => {
    shell.appendChild(template.content.firstElementChild.cloneNode(true));
    const frame = shell.querySelector('[data-staff-community-frame]');
    const sent = [];
    frame.contentWindow.postMessage = (data, origin) => sent.push({data, origin});
    return {shell, frame, sent};
  });
  window.eval(bridge);
  return {dom, window, previews};
}

function notify(window, preview, route, origin = window.location.origin, sender = preview.frame.contentWindow) {
  window.dispatchEvent(new window.MessageEvent('message', {
    source: sender, origin, data: {type: 'nexora-community-route', route}
  }));
}

function select(preview, tab) {
  preview.shell.querySelector('[data-staff-sidebar] [data-staff-community-tab="' + tab + '"]').click();
}

test('uses the canonical Staff App filename', () => {
  assert.equal(existsSync(staffApp), true);
  assert.equal(existsSync(new URL('mobile-two-account-tailwind-lucide.html', pages)), false);
});

test('Community and Jobs previews load the shared hub as a tech', () => {
  const dom = new JSDOM(source(), {url: 'https://demo.test/html/pages/staff-app.html'});
  for (const [screen, tab] of [['staff-community-screen', 'feed'], ['staff-jobs-screen', 'jobs']]) {
    const shell = dom.window.document.getElementById(screen).querySelector('[data-staff-community-shell]');
    const frame = shell.querySelector('[data-staff-community-frame]');
    const url = new URL(frame.src);
    assert.equal(url.pathname, '/html/pages/community-hub.html');
    assert.equal(url.searchParams.get('role'), 'tech');
    assert.equal(url.searchParams.get('tab'), tab);
    assert.ok(shell.querySelector('[data-staff-menu-open]'));
    assert.ok(shell.querySelector('[data-staff-community-fullscreen]'));
  }
  assert.equal(dom.window.document.querySelector('[data-jobs-root]'), null);
  assert.equal(dom.window.document.getElementById('staff-jobs-script'), null);
  dom.window.close();
});

test('every staff Community menu destination preserves the tech role', () => {
  const dom = new JSDOM(source(), {url: 'https://demo.test/html/pages/staff-app.html'});
  const menu = dom.window.document.querySelector('[data-staff-sidebar-template]').content;
  for (const tab of tabs) {
    const link = menu.querySelector('[data-staff-community-tab="' + tab + '"]');
    assert.ok(link, 'missing menu destination: ' + tab);
    const url = new URL(link.getAttribute('href'), dom.window.location.href);
    assert.equal(url.pathname, '/html/pages/staff-community.html');
    assert.equal(url.searchParams.get('role'), 'tech');
    assert.equal(url.searchParams.get('tab'), tab);
  }
  dom.window.close();
});

test('switches all staff sections inside one hub without replacing the iframe', () => {
  const {dom, window, previews} = harness();
  const preview = previews[0];
  preview.frame.dispatchEvent(new window.Event('load'));
  const initialSource = preview.frame.src;
  for (const tab of tabs) {
    select(preview, tab);
    assert.equal(preview.frame.src, initialSource);
    assert.equal(preview.shell.dataset.staffMenuActive, tab);
    assert.equal(preview.sent.at(-1).data.type, 'nexora-community-navigate');
    assert.equal(preview.sent.at(-1).data.route, tab);
    assert.equal(preview.sent.at(-1).origin, window.location.origin);
    assert.equal(preview.shell.querySelector('[aria-current="page"]').dataset.staffCommunityTab, tab);
    const fullscreen = new URL(preview.shell.querySelector('[data-staff-community-fullscreen]').href);
    assert.equal(fullscreen.searchParams.get('role'), 'tech');
    assert.equal(fullscreen.searchParams.get('tab'), tab);
  }
  dom.window.close();
});

test('retains a menu choice made before a lazy hub finishes loading', () => {
  const {dom, window, previews} = harness();
  const preview = previews[0];
  select(preview, 'profile');
  notify(window, preview, 'feed');
  assert.equal(preview.shell.dataset.staffMenuActive, 'profile');
  preview.frame.dispatchEvent(new window.Event('load'));
  assert.equal(preview.sent.at(-1).data.route, 'profile');
  dom.window.close();
});

test('hub navigation updates only its own phone and preserves nested destinations', () => {
  const {dom, window, previews} = harness();
  previews.forEach(preview => preview.frame.dispatchEvent(new window.Event('load')));
  const [community, jobs] = previews;
  for (const [route, menu] of [['mkt', 'groups'], ['calls', 'connect'], ['dlastt', 'deals'], ['learn', 'learning']]) {
    notify(window, community, route);
    assert.equal(community.shell.dataset.staffMenuActive, menu);
    assert.equal(jobs.shell.dataset.staffMenuActive, 'jobs');
    const href = community.shell.querySelector('[data-staff-community-fullscreen]').href;
    assert.equal(new URL(href).searchParams.get('tab'), route === 'learn' ? 'learning' : route);
  }
  dom.window.close();
});

test('ignores unsupported, foreign-origin, and unrelated-window route messages', () => {
  const {dom, window, previews} = harness();
  const preview = previews[0];
  preview.frame.dispatchEvent(new window.Event('load'));
  notify(window, preview, 'jobs', 'https://unrelated.test');
  notify(window, preview, 'jobs', window.location.origin, window);
  notify(window, preview, 'unknown');
  notify(window, preview, 'dcamp');
  assert.equal(preview.shell.dataset.staffMenuActive, 'feed');
  dom.window.close();
});
