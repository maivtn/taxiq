import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SCRIPT_URL = new URL('./community-page.js', import.meta.url);

function loadApi() {
  const document = {
    readyState: 'loading',
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    body: { appendChild() {} }
  };
  const window = {
    document,
    location: { search: '' },
    setTimeout,
    clearTimeout
  };
  vm.runInNewContext(readFileSync(SCRIPT_URL, 'utf8'), {
    window,
    document,
    URLSearchParams,
    setTimeout,
    clearTimeout,
    console
  });
  return window.NEXORA_COMMUNITY;
}

test('adds and filters owner Feed posts', () => {
  const api = loadApi();
  assert.equal(api.addFeedPost('  ', 'all').ok, false);
  const result = api.addFeedPost('Team meeting moves to 8:30 AM.', 'staff');
  assert.equal(result.ok, true);
  assert.equal(api.filterFeedPosts('staff')[0].body, 'Team meeting moves to 8:30 AM.');
  assert.ok(api.filterFeedPosts('announcements').every((post) => post.kind === 'announcement'));
  assert.equal(api.togglePostReaction('feed-announcement-1', '👍').ok, true);
  assert.equal(api.addFeedComment('feed-announcement-1', 'Confirmed.').ok, true);
  assert.equal(api.toggleSavedPost('feed-announcement-1').post.saved, true);
  assert.equal(api.togglePinnedPost('feed-announcement-1').post.pinned, true);
});

test('toggles the viewer reaction on a Feed post', () => {
  const api = loadApi();
  api.togglePostReaction('feed-announcement-1', '👍');
  assert.equal(api.togglePostReaction('feed-announcement-1', '👍').post.reactions['👍'], 4);
});

export { loadApi };
