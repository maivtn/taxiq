import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script, runInNewContext } from 'node:vm';
import { JSDOM } from 'jsdom';

const pages = new URL('../../../html/pages/', import.meta.url);
const read = path => readFileSync(new URL(path, pages), 'utf8');
const hub = read('community-hub.html');
const shell = read('../assets/nexora-shell.js');

function compileHTML(html, label) {
  const dom = new JSDOM(html);
  for (const [index, script] of [...dom.window.document.scripts].entries()) {
    if (!script.src) assert.doesNotThrow(() => new Script(script.textContent), `${label}: script ${index}`);
  }
  const leaked = [...dom.window.document.body.childNodes].filter(node => node.nodeType === 3).map(node => node.textContent).join('');
  assert.doesNotMatch(leaked, /function dl|window\.ANN|badge\(\)/, `${label}: script must not leak into the page`);
  dom.window.close();
}

test('Community hub remains valid when Live Server injects before the first closing body tag', () => {
  compileHTML(hub.replace(/<\/body>/i, '<script>/* live reload */</script></body>'), 'Live Server hub');
});

test('all bundled Community modules have valid inline JavaScript', () => {
  const json = hub.match(/const MODS=(\{[^\n]+\});/)[1];
  const modules = JSON.parse(json);
  for (const [name, base64] of Object.entries(modules)) compileHTML(Buffer.from(base64, 'base64').toString('utf8'), name);
});

test('opening the module directly preserves role and route in the account shell', () => {
  const dom = new JSDOM(hub);
  const entry = dom.window.document.querySelector('script[data-community-entry]');
  assert.ok(entry, 'standalone module needs an account-shell entry handler');
  for (const role of ['owner', 'tech']) {
    let destination;
    const location = {href: `https://demo.test/html/pages/community-hub.html?role=${role}&tab=jobs`, replace: value => { destination = String(value); }};
    const window = {location};
    window.parent = window;
    runInNewContext(entry.textContent, {window, location, URL});
    assert.equal(destination, `https://demo.test/html/pages/${role === 'tech' ? 'staff-community.html' : 'community.html'}?role=${role}&tab=jobs`);
    destination = undefined;
    window.parent = {};
    runInNewContext(entry.textContent, {window, location, URL});
    assert.equal(destination, undefined, 'embedded module must not redirect');
  }
  dom.window.close();
});

for (const role of ['owner', 'tech']) {
  test(`${role} Community renders header, submenu, navigation and mobile drawer`, () => {
    const dom = new JSDOM('<aside class="sidebar"></aside><header class="header"></header>', {url:`https://demo.test/html/pages/community.html?role=${role}&tab=jobs`, runScripts:'outside-only'});
    const {window} = dom;
    const navigated = [];
    window.NEXORA_SHELL = {activePage:role === 'tech' ? 'staff' : 'community', activeTab:'feed', isCommunity:true, onNavigate: tab => navigated.push(tab)};
    window.eval(shell);
    window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
    for (const tab of ['feed','groups','jobs','shift','deals','connect','learning','events']) {
      const button = window.document.querySelector(`[data-shell-tab="${tab}"]`);
      assert.ok(button, `${role}: ${tab} submenu`);
      button.click();
      assert.equal(navigated.at(-1), tab);
      assert.equal(button.classList.contains('is-active'), true);
    }
    const opener = window.document.querySelector('[data-shell-drawer-open]');
    assert.ok(opener, 'header contains mobile navigation');
    opener.click();
    assert.equal(window.document.querySelector('.sidebar').classList.contains('is-open'), true);
    window.document.querySelector('[data-shell-tab="feed"]').click();
    assert.equal(window.document.querySelector('.sidebar').classList.contains('is-open'), false);
    dom.window.close();
  });
}

test('Learning and Events keep the new hub visible and preserve the staff role', () => {
  const dom = new JSDOM('<iframe id="community-hub" hidden></iframe><section class="blank-stage"></section>', {url:'https://demo.test/html/pages/community.html?role=tech&tab=learning',runScripts:'outside-only'});
  const {window} = dom;
  window.NEXORA_SHELL = {setActiveTab() {}};
  window.activateCommunityTab = tab => window.navigateCommunityHub(tab);
  window.eval(read('../assets/community-integration.js'));
  const frame = window.document.getElementById('community-hub');
  const initialSource = frame.src;
  assert.equal(frame.hidden, false);
  assert.equal(new URL(frame.src).searchParams.get('role'), 'tech');
  assert.equal(new URL(frame.src).searchParams.get('tab'), 'learning');
  for (const tab of ['events', 'jobs', 'learning']) {
    window.activateCommunityTab(tab);
    assert.equal(frame.hidden, false);
    assert.equal(frame.src, initialSource, 'switching sections must retain the same hub');
    assert.equal(window.document.body.classList.contains('community-hub-active'), true);
    assert.equal(new URL(window.location.href).searchParams.get('tab'), tab);
  }
  frame.dispatchEvent(new window.Event('load'));
  window.dispatchEvent(new window.MessageEvent('message', {source:frame.contentWindow, origin:window.location.origin, data:{type:'nexora-community-route',route:'learn'}}));
  assert.equal(new URL(window.location.href).searchParams.get('tab'), 'learning');
  dom.window.close();
});

test('Staff frame expands Community with links to every section of the new staff page', () => {
  const dom = new JSDOM(read('frame-staff.html'), {url:'https://demo.test/html/pages/frame-staff.html', runScripts:'outside-only'});
  const {window} = dom;
  for (const script of window.document.scripts) if (!script.src) window.eval(script.textContent);
  window.eval(shell);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  const toggle = window.document.querySelector('[aria-controls="staff-subnav-community"]');
  const menu = window.document.getElementById('staff-subnav-community');
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(menu.classList.contains('is-collapsed'), false);
  const tabs = ['feed','groups','jobs','profile','shift','deals','connect','learning','events'];
  assert.deepEqual([...menu.querySelectorAll('a')].map(link => {
    const url = new URL(link.href);
    assert.equal(url.pathname, '/html/pages/staff-community.html');
    assert.equal(url.searchParams.get('role'), 'tech');
    return url.searchParams.get('tab');
  }), tabs);
  dom.window.close();
});

test('the new Staff Community page retains queued navigation and always loads the tech hub', () => {
  const dom = new JSDOM(read('staff-community.html'), {url:'https://demo.test/html/pages/staff-community.html?role=owner&tab=jobs', runScripts:'outside-only'});
  const {window} = dom;
  for (const script of window.document.scripts) if (!script.src) window.eval(script.textContent);
  window.eval(shell);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  window.eval(read('../assets/community-integration.js'));
  const frame = window.document.getElementById('community-hub');
  const initialSource = frame.src;
  assert.equal(new URL(initialSource).searchParams.get('role'), 'tech');
  assert.equal(new URL(initialSource).searchParams.get('tab'), 'jobs');
  window.document.querySelector('[data-shell-tab="profile"]').click();
  window.dispatchEvent(new window.MessageEvent('message', {source:frame.contentWindow, origin:window.location.origin, data:{type:'nexora-community-route',route:'jobs'}}));
  assert.equal(new URL(window.location.href).searchParams.get('tab'), 'profile');
  const sent = [];
  frame.contentWindow.postMessage = data => sent.push(data);
  frame.dispatchEvent(new window.Event('load'));
  assert.equal(sent.at(-1).route, 'profile');
  window.document.querySelector('[data-shell-tab="groups"]').click();
  assert.equal(frame.src, initialSource);
  assert.equal(sent.at(-1).route, 'groups');
  assert.equal(window.document.querySelector('[data-shell-tab="groups"]').classList.contains('is-active'), true);
  assert.equal(new URL(window.location.href).searchParams.get('role'), 'tech');
  dom.window.close();
});

test('the embedded Learning and Events module retains course progress across section changes', () => {
  const dom = new JSDOM(read('community-learning-events.html'), {url:'https://demo.test/html/pages/community-learning-events.html?role=tech&view=learning',runScripts:'outside-only'});
  const {window} = dom;
  window.NEXORA_COMMUNITY_MODULE = 'learning-events';
  window.eval(read('../assets/community-page.js'));
  window.eval(read('../assets/community-learning-events.js'));
  const learning = window.document.getElementById('panel-learning');
  const events = window.document.getElementById('panel-events');
  assert.equal(learning.hidden, false);
  assert.equal(events.hidden, true);
  assert.match(learning.textContent, /Career development/);
  const progress = () => Number(learning.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'));
  const before = progress();
  learning.querySelector('[data-course-grid] [data-course-continue]').click();
  assert.equal(progress(), Math.min(100, before + 10));
  function show(view) {
    window.dispatchEvent(new window.MessageEvent('message', {source:window.parent, origin:window.location.origin, data:{cmd:'view',v:view}}));
  }
  show('events');
  assert.equal(learning.hidden, true);
  assert.equal(events.hidden, false);
  assert.ok(events.querySelector('[data-event-select]'));
  show('learning');
  assert.equal(learning.hidden, false);
  assert.equal(progress(), Math.min(100, before + 10));
  dom.window.close();
});
