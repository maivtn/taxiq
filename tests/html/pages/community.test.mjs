import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const pages = new URL('../../../html/pages/', import.meta.url);
const read = path => readFileSync(new URL(path, pages), 'utf8');
const controller = read('../assets/community-v2-integration.js');
const settle = async () => { for (let i = 0; i < 6; i += 1) await Promise.resolve(); };

async function boot(t, {page = 'community.html', query = '', pending = false, language, profileName, failMount = false, initialState, headerSearch = false} = {}) {
  const dom = new JSDOM(read(page), {
    url: 'https://demo.test/html/pages/' + page + query,
    runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  if (initialState !== undefined) w.history.replaceState(initialState, '', w.location.href);
  if (language) w.localStorage.setItem('nexora-community-language', language);
  if (page === 'frame-personal.html' || page === 'frame-staff.html') {
    w.eval(read('../assets/personal-oneqr-store.js'));
  }
  for (const script of w.document.scripts) if (!script.src) w.eval(script.textContent);
  if (profileName) w.NEXORA_SHELL.profileName = profileName;
  if (page === 'frame-personal.html' || page === 'frame-staff.html') {
    w.eval(read('../assets/personal-oneqr.js'));
  }
  const selected = [];
  w.NEXORA_SHELL.setActiveTab = tab => selected.push(tab);
  w.document.querySelector('.sidebar').innerHTML = '<label class="sidebar-account-language"><select aria-label="Language"><option value="en">English</option></select></label>';
  let searchFixture = null;
  if (headerSearch) {
    const header = w.document.querySelector('.app-area > header.header');
    header.insertAdjacentHTML('afterbegin', '<form class="shell-workspace-search" action="dashboard.html"><label class="search"><i data-lucide="search" aria-hidden="true"></i><input name="q" type="search" aria-label="Search products" placeholder="Search products or features…" autocomplete="off" value="Gel-X"></label><div class="shell-function-results" hidden></div></form>');
    searchFixture = {form: header.querySelector('.shell-workspace-search'), input: header.querySelector('input[type="search"]')};
  }
  const calls = {mounts: [], routes: [], languages: [], closed: 0};
  const api = {
    navigate(route) { calls.routes.push(route); },
    setLanguage(value) { calls.languages.push(value); },
    closeDetail() { calls.closed += 1; }
  };
  let finishMount;
  const mounting = pending ? new Promise(resolve => { finishMount = resolve; }) : Promise.resolve(api);
  w.NEXORA_COMMUNITY_HUB = {
    mount(host, options) {
      calls.mounts.push({host, options});
      return failMount ? Promise.reject(new Error('Content is unavailable')) : mounting;
    }
  };
  // The adapter resolves its local component relative to the running script.
  const script = [...w.document.scripts].find(node => node.src.includes('/community-v2-integration.js'));
  assert.ok(script, page + ' must load the native Community controller');
  Object.defineProperty(w.document, 'currentScript', {configurable: true, value: script});
  if (failMount) w.console.error = () => {};
  const pushState = w.history.pushState;
  w.eval(controller);
  await settle();
  return {
    w, calls, selected, api, pushState, searchFixture,
    host: w.document.querySelector('#community-staging, #community-hub, [data-community-v2]'),
    notify(data) { calls.mounts[0].options.notify(data); },
    async finish() { finishMount(api); await settle(); }
  };
}

const tab = w => new URL(w.location.href).searchParams.get('tab');
const changeLanguage = (w, language) => {
  const select = w.document.querySelector('.sidebar-account-language select');
  select.value = language;
  select.dispatchEvent(new w.Event('change', {bubbles: true}));
};
const goBack = w => new Promise(resolve => {
  w.addEventListener('popstate', resolve, {once: true});
  w.history.back();
});

test('owner Community opens its native content inside the shared dashboard shell', async t => {
  const {w, calls, host} = await boot(t);
  assert.equal(w.document.title, 'Nexora Touch - Community');
  assert.ok(w.document.querySelector('aside.sidebar'));
  assert.ok(w.document.querySelector('.app-area > header.header'));
  assert.equal(host.tagName, 'DIV');
  assert.equal(host.closest('main').getAttribute('aria-label'), 'Community content');
  assert.equal(host.getAttribute('aria-label'), 'Nexora Community');
  assert.equal(host.hidden, false);
  assert.equal(calls.mounts.length, 1);
  assert.equal(calls.mounts[0].host, host);
  assert.equal(w.document.body.classList.contains('community-hub-active'), true);
  assert.deepEqual(calls.routes, ['feed']);
});

test('the Community header search expands and closes without replacing its form or losing the query', async t => {
  const {w, searchFixture: {form, input}} = await boot(t, {headerSearch: true});
  const toggle = w.document.querySelector('.community-search-toggle');
  assert.ok(toggle, 'Community needs a control to reveal the existing header search');
  assert.equal(w.document.querySelector('.shell-workspace-search'), form);
  assert.equal(form.querySelector('input[type="search"]'), input);
  assert.equal(form.classList.contains('community-shell-search'), true);
  assert.equal(form.getAttribute('action'), 'dashboard.html');
  assert.equal(new w.FormData(form).get('q'), 'Gel-X');
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(w.document.body.classList.contains('community-search-open'), false);

  toggle.click();
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(w.document.body.classList.contains('community-search-open'), true);
  assert.equal(w.document.activeElement, input);
  input.value = 'Gel-X Houston';
  input.dispatchEvent(new w.Event('input', {bubbles: true}));
  input.dispatchEvent(new w.KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true}));
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(w.document.body.classList.contains('community-search-open'), false);
  assert.equal(w.document.activeElement, toggle);
  assert.equal(new w.FormData(form).get('q'), 'Gel-X Houston');

  toggle.click();
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(w.document.body.classList.contains('community-search-open'), true);
  assert.equal(w.document.activeElement, input);
  assert.equal(input.value, 'Gel-X Houston');
  assert.equal(form.getAttribute('action'), 'dashboard.html');
});

test('a Personal header rendered after Community boot receives one working search toggle', async t => {
  const {w} = await boot(t, {page: 'frame-personal.html', query: '?view=community&tab=feed'});
  const header = w.document.querySelector('.app-area > header.header');
  assert.equal(header.querySelectorAll('.community-search-toggle').length, 0);
  header.insertAdjacentHTML('beforeend', '<label class="search"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg><input type="search" placeholder="Search tech, station, review..."></label>');
  const input = header.querySelector('input[type="search"]');
  await settle();
  assert.equal(header.querySelectorAll('.community-search-toggle').length, 1);

  input.parentElement.appendChild(w.document.createElement('span'));
  await settle();
  assert.equal(header.querySelectorAll('.community-search-toggle').length, 1, 'later header mutations must not install duplicate toggles');
  const toggle = header.querySelector('.community-search-toggle');
  toggle.click();
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(w.document.body.classList.contains('community-search-open'), true);
  assert.equal(w.document.activeElement, input);
});

test('opening a deep link retains its group context while selecting the containing sidebar section', async t => {
  const {w, calls, selected} = await boot(t, {query: '?tab=market&group=houston-nails#listing'});
  assert.equal(tab(w), 'market');
  assert.equal(new URL(w.location.href).searchParams.get('group'), 'houston-nails');
  assert.equal(w.location.hash, '#listing');
  assert.equal(calls.mounts[0].options.params.get('group'), 'houston-nails');
  assert.deepEqual(calls.routes, ['market']);
  assert.equal(selected.at(-1), 'groups');
  assert.equal(w.history.length, 1, 'opening a direct link must not create a phantom Back destination');
});

test('sidebar navigation reaches every supported PO section without remounting Community', async t => {
  const {w, calls, selected, host} = await boot(t);
  const destinations = [
    ['groups', 'groups'], ['market', 'groups'], ['pages', 'pages'],
    ['jobs', 'jobs'], ['shift', 'shift'], ['deals', 'deals'], ['blog', 'blog'],
    ['connect', 'connect'], ['chatgroups', 'connect'], ['calls', 'connect'],
    ['privacy', 'connect'], ['feed', 'feed']
  ];
  for (const [route, sidebar] of destinations) {
    w.NEXORA_SHELL.onNavigate(route);
    assert.equal(tab(w), route);
    assert.equal(calls.routes.at(-1), route);
    assert.equal(selected.at(-1), sidebar);
    assert.equal(w.NEXORA_SHELL.activeTab, sidebar);
  }
  assert.equal(calls.mounts.length, 1);
  assert.equal(calls.mounts[0].host, host);
});

test('old section links resolve to their supported PO destination', async t => {
  const {w, calls} = await boot(t);
  for (const [link, destination] of [
    ['mkt', 'market'], ['fanpage', 'pages'], ['daywork', 'shift'],
    ['shifts', 'shift'], ['profile', 'jobs'], ['jobs-my-posts', 'jobs'],
    ['shift-payments', 'shift'], ['dlastt', 'deals'], ['dcreate', 'deals'],
    ['learning', 'feed'], ['events', 'feed']
  ]) {
    w.navigateCommunityHub(link);
    assert.equal(tab(w), destination, link);
    assert.equal(calls.routes.at(-1), destination, link);
  }
});

test('an unsupported initial section opens Feed without dropping unrelated URL parameters', async t => {
  const {w, calls} = await boot(t, {query: '?tab=missing-section&source=sidebar'});
  assert.equal(tab(w), 'feed');
  assert.equal(new URL(w.location.href).searchParams.get('source'), 'sidebar');
  assert.deepEqual(calls.routes, ['feed']);
  assert.equal(calls.mounts[0].options.params.get('tab'), 'feed');
});

test('rapid section changes made while native content loads open the latest choice', async t => {
  const {w, calls, finish, host} = await boot(t, {query: '?tab=jobs', pending: true});
  w.NEXORA_SHELL.onNavigate('pages');
  w.NEXORA_SHELL.onNavigate('groups');
  w.NEXORA_SHELL.onNavigate('calls');
  assert.equal(tab(w), 'calls');
  assert.deepEqual(calls.routes, [], 'a pending component must not receive calls before its API is ready');
  await finish();
  assert.deepEqual(calls.routes, ['calls']);
  assert.equal(calls.mounts.length, 1);
  assert.equal(calls.mounts[0].host, host);
});

test('a language change made during loading is applied when the content becomes ready', async t => {
  const {w, calls, finish} = await boot(t, {pending: true, language: 'vi'});
  const select = w.document.querySelector('.sidebar-account-language select');
  assert.equal(select.value, 'vi');
  assert.equal(select.querySelectorAll('option[value="vi"]').length, 1);
  changeLanguage(w, 'en');
  assert.equal(w.localStorage.getItem('nexora-community-language'), 'en');
  assert.deepEqual(calls.languages, []);
  await finish();
  assert.deepEqual(calls.languages, ['en']);
});

test('changing the account language updates current content without changing its route or history', async t => {
  const {w, calls} = await boot(t, {query: '?tab=blog', language: 'vi'});
  const length = w.history.length;
  assert.deepEqual(calls.languages, ['vi']);
  changeLanguage(w, 'en');
  assert.deepEqual(calls.languages, ['vi', 'en']);
  assert.equal(w.localStorage.getItem('nexora-community-language'), 'en');
  assert.equal(tab(w), 'blog');
  assert.equal(w.history.length, length);
});

test('navigation inside native content updates the URL and sidebar without echoing back into the component', async t => {
  const {w, calls, notify, selected} = await boot(t);
  const before = calls.routes.length;
  notify({type: 'nexora-community-route', route: 'chatgroups'});
  assert.equal(tab(w), 'chatgroups');
  assert.equal(selected.at(-1), 'connect');
  assert.equal(calls.routes.length, before, 'route notifications must not trigger a navigation loop');
  const length = w.history.length;
  notify({type: 'nexora-community-route', route: 'privacy', replace: true});
  assert.equal(tab(w), 'privacy');
  assert.equal(w.history.length, length);
});

test('Back closes an open detail before leaving its Community section', {timeout: 3000}, async t => {
  const {w, calls, notify} = await boot(t, {query: '?tab=groups'});
  const length = w.history.length;
  notify({type: 'nexora-community-detail', open: true});
  notify({type: 'nexora-community-detail', open: true});
  assert.equal(w.history.length, length + 1, 'duplicate detail notifications must not add Back steps');
  assert.equal(w.history.state.communityDetail, true);
  await goBack(w);
  assert.equal(tab(w), 'groups');
  assert.equal(calls.closed, 1);
  assert.equal(Boolean(w.history.state.communityDetail), false);
});

test('a detail opened while the previous detail returns through history keeps its own Back step', {timeout: 3000}, async t => {
  const {w, calls, notify} = await boot(t, {query: '?tab=groups'});
  notify({type: 'nexora-community-detail', open: true});
  const reopened = new Promise(resolve => w.addEventListener('popstate', resolve, {once: true}));
  notify({type: 'nexora-community-detail', open: false});
  // A gallery can open before the browser finishes removing the previous
  // detail's history entry. That traversal must not close the new gallery.
  notify({type: 'nexora-community-detail', open: true});
  await reopened;
  await settle();
  assert.equal(tab(w), 'groups');
  assert.equal(w.document.body.classList.contains('community-detail-open'), true);
  assert.equal(w.history.state.communityDetail, true, 'the new detail needs its own Back destination');
  assert.equal(calls.closed, 0, 'finishing an earlier close must not close the new detail');

  const closed = new Promise(resolve => w.addEventListener('popstate', resolve, {once: true}));
  notify({type: 'nexora-community-detail', open: false});
  await closed;
  await settle();
  assert.equal(tab(w), 'groups');
  assert.equal(Boolean(w.history.state.communityDetail), false);
  assert.equal(w.document.body.classList.contains('community-detail-open'), false);
  assert.equal(calls.closed, 0);
});

test('a section selected during detail closing retains the previous section for browser Back', {timeout: 3000}, async t => {
  const {w, calls, notify} = await boot(t, {query: '?tab=groups'});
  notify({type: 'nexora-community-detail', open: true});
  const returned = new Promise(resolve => w.addEventListener('popstate', resolve, {once: true}));
  notify({type: 'nexora-community-detail', open: false});
  w.navigateCommunityHub('jobs');
  await returned;
  await settle();
  assert.equal(tab(w), 'jobs');
  assert.equal(Boolean(w.history.state.communityDetail), false);
  assert.equal(calls.closed, 0);
  await goBack(w);
  assert.equal(tab(w), 'groups', 'the deferred Jobs route must not replace its Groups origin');
  assert.equal(calls.routes.at(-1), 'groups');
  assert.equal(Boolean(w.history.state.communityDetail), false);
  assert.equal(calls.closed, 0);
});

test('reloading with a stale detail history marker allows the next detail to close normally', {timeout: 3000}, async t => {
  const {w, calls, notify} = await boot(t, {
    query: '?tab=groups',
    initialState: {community: 'groups', communityDetail: true, communityPrevious: true, externalMarker: 'retained'}
  });
  assert.equal(Boolean(w.history.state.communityDetail), false, 'a reloaded page has no restored modal');
  assert.equal(w.history.state.externalMarker, 'retained');
  assert.equal(tab(w), 'groups');
  notify({type: 'nexora-community-detail', open: true});
  const closed = new Promise(resolve => w.addEventListener('popstate', resolve, {once: true}));
  notify({type: 'nexora-community-detail', open: false});
  await closed;
  await settle();
  assert.equal(tab(w), 'groups');
  assert.equal(Boolean(w.history.state.communityDetail), false, 'closing a fresh detail must not restore the stale marker');
  assert.equal(w.history.state.externalMarker, 'retained');
  assert.equal(w.document.body.classList.contains('community-detail-open'), false);
  assert.equal(calls.closed, 0);
});

test('closing a notification post removes its deep link after returning to the initial history entry', {timeout: 3000}, async t => {
  const {w, calls, notify} = await boot(t, {
    query: '?tab=feed&postId=f5&commentId=comment-1&threadId=thread-1&group=houston&source=notification#discussion'
  });
  notify({type: 'nexora-community-detail', open: true});
  const returned = new Promise(resolve => w.addEventListener('popstate', resolve, {once: true}));
  // The content's X button reports the post closing before its modal observer
  // reports that the detail has closed and the adapter returns through history.
  notify({type: 'nexora-feed-post-close'});
  notify({type: 'nexora-community-detail', open: false});
  await returned;
  const url = new URL(w.location.href);
  for (const key of ['post', 'postId', 'comment', 'commentId', 'thread', 'threadId']) {
    assert.equal(url.searchParams.has(key), false, key + ' must not reopen the dismissed post after refresh');
  }
  assert.equal(url.searchParams.get('tab'), 'feed');
  assert.equal(url.searchParams.get('group'), 'houston');
  assert.equal(url.searchParams.get('source'), 'notification');
  assert.equal(url.hash, '#discussion');
  assert.equal(Boolean(w.history.state.communityDetail), false);
  assert.equal(w.document.body.classList.contains('community-detail-open'), false);
  assert.equal(calls.closed, 0, 'an already-closed detail must not receive a second close command');
});

test('browser Back clears a direct post link when native content acknowledges the detail closing', {timeout: 3000}, async t => {
  const {w, calls, api, notify} = await boot(t, {
    query: '?tab=feed&post=f5&comment=comment-1&thread=thread-1&source=notification'
  });
  api.closeDetail = () => {
    calls.closed += 1;
    // Native content acknowledges the close after the browser has restored the
    // initial entry, as messages from the embedded content do in the app.
    Promise.resolve().then(() => {
      notify({type: 'nexora-feed-post-close'});
      notify({type: 'nexora-community-detail', open: false});
    });
  };
  notify({type: 'nexora-community-detail', open: true});
  await goBack(w);
  await settle();
  const url = new URL(w.location.href);
  for (const key of ['post', 'postId', 'comment', 'commentId', 'thread', 'threadId']) {
    assert.equal(url.searchParams.has(key), false, key + ' must be cleared from the restored entry');
  }
  assert.equal(url.pathname, '/html/pages/community.html');
  assert.equal(url.searchParams.get('tab'), 'feed');
  assert.equal(url.searchParams.get('source'), 'notification');
  assert.equal(calls.closed, 1);
  assert.equal(Boolean(w.history.state.communityDetail), false);
  assert.equal(w.document.body.classList.contains('community-detail-open'), false);
});

test('browser Back restores the previous section using the existing mounted content', {timeout: 3000}, async t => {
  const {w, calls} = await boot(t);
  w.navigateCommunityHub('jobs');
  w.navigateCommunityHub('blog');
  await goBack(w);
  assert.equal(tab(w), 'jobs');
  assert.equal(calls.routes.at(-1), 'jobs');
  assert.equal(calls.mounts.length, 1);
});

test('the content Back action from a direct link returns to Feed without leaving Community', async t => {
  const {w, calls, notify} = await boot(t, {query: '?tab=jobs'});
  notify({type: 'nexora-community-back'});
  assert.equal(tab(w), 'feed');
  assert.equal(w.location.pathname, '/html/pages/community.html');
  assert.equal(w.history.length, 1);
  assert.deepEqual(calls.routes, ['jobs', 'feed']);
});

test('unrelated window messages cannot navigate native content or insert detail history entries', async t => {
  const {w, calls} = await boot(t, {query: '?tab=pages'});
  for (const data of [
    {type: 'nexora-community-route', route: 'jobs'},
    {type: 'nexora-community-detail', open: true},
    {type: 'nexora-community-back'}
  ]) w.dispatchEvent(new w.MessageEvent('message', {source: w, origin: w.location.origin, data}));
  assert.equal(tab(w), 'pages');
  assert.equal(w.history.length, 1);
  assert.deepEqual(calls.routes, ['pages']);
});

test('staff Community passes the signed-in member to the native content and retains its deep link', async t => {
  const {w, calls, host} = await boot(t, {
    page: 'staff-community.html', query: '?tab=jobs&group=staff-houston', profileName: '  David Le  '
  });
  assert.equal(host.id, 'community-hub');
  assert.equal(host.tagName, 'DIV');
  assert.equal(host.hidden, false);
  assert.equal(w.NEXORA_SHELL.activePage, 'staff');
  assert.equal(calls.mounts[0].options.params.get('member'), 'David Le');
  assert.equal(calls.mounts[0].options.params.get('group'), 'staff-houston');
  assert.deepEqual(calls.routes, ['jobs']);
});

test('Personal One QR opens Community in its native host using the saved personal identity', async t => {
  const {w, calls, host} = await boot(t, {page: 'frame-personal.html', query: '?view=community&tab=feed'});
  assert.ok(host.matches('[data-community-v2]'));
  assert.equal(host.closest('main').hasAttribute('data-personal-oneqr-app'), true);
  assert.equal(w.NEXORA_SHELL.salonLinked, false);
  assert.equal(w.NEXORA_SHELL.isCommunity, true);
  assert.equal(calls.mounts[0].options.params.get('member'), 'Nguyễn Văn A');
  w.navigateCommunityHub('market');
  assert.equal(new URL(w.location.href).searchParams.get('view'), 'community');
  assert.equal(tab(w), 'market');
  assert.equal(calls.mounts.length, 1);
});

test('Community navigation keeps the browser history API available to other page features', async t => {
  const {w, pushState} = await boot(t);
  assert.equal(w.history.pushState, pushState);
  w.history.pushState({otherFeature: true}, '', '?tab=feed&source=other-feature');
  assert.equal(w.history.state.otherFeature, true);
  w.navigateCommunityHub('deals');
  assert.equal(new URL(w.location.href).searchParams.get('source'), 'other-feature');
  assert.equal(tab(w), 'deals');
});

test('a failed native mount falls back to the local content and only accepts messages from that frame', async t => {
  const {w, host} = await boot(t, {query: '?tab=market&group=houston', failMount: true});
  const frame = host.querySelector('iframe');
  assert.ok(frame, 'local fallback keeps Community usable when native content cannot mount');
  const url = new URL(frame.src);
  assert.equal(url.pathname, '/html/assets/community-v2/nexora-community-complete.html');
  assert.equal(url.searchParams.get('tab'), 'market');
  assert.equal(url.searchParams.get('group'), 'houston');
  assert.equal(url.searchParams.get('embedded'), '1');
  assert.equal(frame.title, 'Nexora Community');
  const sent = [];
  frame.contentWindow.postMessage = (data, origin) => sent.push({data, origin});
  const message = (source, origin, data) => w.dispatchEvent(new w.MessageEvent('message', {source, origin, data}));
  message(frame.contentWindow, w.location.origin, {type: 'nexora-community-ready'});
  assert.equal(sent.at(-1).data.route, 'market');
  assert.equal(sent.at(-1).origin, w.location.origin);
  message(frame.contentWindow, 'https://other.test', {type: 'nexora-community-route', route: 'jobs'});
  message(w, w.location.origin, {type: 'nexora-community-route', route: 'blog'});
  assert.equal(tab(w), 'market');
  message(frame.contentWindow, w.location.origin, {type: 'nexora-community-route', route: 'jobs'});
  assert.equal(tab(w), 'jobs');
});
