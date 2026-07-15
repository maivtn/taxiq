### Task 8: Action Audit, Bilingual Dynamic Copy và Final Responsive Verification

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:1-end`

**Interfaces:**
- Consumes: every action and renderer from Tasks 1–7.
- Produces: a complete action registry with no enabled silent controls.
- Produces: final verified mobile bottom navigation and desktop sidebar behavior.
- Produces: `parseNexoraQr(payload): Result`, `submitCheckin(appState, payload, online, now): Result`, `retryQueuedCheckins(appState, online, now): Result`.

- [ ] **Step 1: Add final cross-screen contract tests**

Append:

```js
test('maps every declared data-action to a registered handler', () => {
  const source = html();
  const declared = new Set([...source.matchAll(/data-action="([^"]+)"/g)].map((match) => match[1]));
  const registered = new Set([...source.matchAll(/registerAction\('([^']+)'/g)].map((match) => match[1]));
  const missing = [...declared].filter((name) => !registered.has(name));
  assert.deepEqual(missing, []);
});

test('keeps all screen and back targets valid', () => {
  const source = html();
  const ids = new Set([...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const [, target] of source.matchAll(/data-(?:target|back-target)="([^"]+)"/g)) {
    assert.ok(ids.has(target), `missing target #${target}`);
  }
});

test('contains persistence, transaction and customer marketplace contracts', () => {
  const source = html();
  for (const token of ['nexora.customer.prototype.v1', 'confirmTipRecord', 'confirmDirectPayment', 'confirmBookingRequest', 'submitFeedback', 'toggleFollowTech']) assert.match(source, new RegExp(token));
  assert.doesNotMatch(source, /followerCount|followerList|Interview Invite|Find Work/);
  assert.doesNotMatch(source, /const state = \{\s*activeScreen/);
  assert.doesNotMatch(source, /state\.(?:language|activeScreen|activeModule|pointBalance|savedOffers|booking|rating)\b/);
});

test('removes obsolete pre-localStorage action functions', () => {
  const source = html();
  for (const name of ['startScan', 'selectTip', 'sendTip', 'confirmTip', 'sendPayment', 'confirmPayment', 'confirmReward', 'saveOffer', 'addWish', 'saveLook', 'submitReview', 'reviewBooking', 'confirmBooking']) {
    assert.doesNotMatch(source, new RegExp(`function ${name}\\(`));
  }
});

test('keeps platform stubs responsive instead of silently succeeding', () => {
  const source = html();
  for (const action of ['start-scan', 'enter-code', 'scan-receipt', 'show-directions', 'open-google-review', 'payment-methods', 'privacy-details']) {
    assert.match(source, new RegExp(`registerAction\\('${action}'`));
  }
  assert.match(source, /catch\s*\{/);
});

test('queues offline QR check-in and awards points after retry with scan timestamp', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  const queued = api.submitCheckin(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', false, 1000);
  assert.equal(queued.checkin.status, 'queued');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  api.retryQueuedCheckins(app, true, 5000);
  assert.equal(queued.checkin.status, 'confirmed');
  assert.equal(queued.checkin.scannedAt, new Date(1000).toISOString());
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 120);
  assert.equal(api.submitCheckin(app, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', true, 6000).code, 'duplicate_checkin');
});
```

- [ ] **Step 2: Run the final suite and fix every reported contract gap**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected before the cleanup: FAIL only for action names still present in markup but not registered. Do not weaken the test; register each missing action or disable the control with a visible explanation.

- [ ] **Step 3: Complete remaining external-integration actions and bilingual render pass**

Add production-format QR parsing and offline queue functions, then expose `parseNexoraQr`, `submitCheckin` and `retryQueuedCheckins` through `window.NEXORA_TEST_API`:

```js
function parseNexoraQr(payload) {
  try {
    const url = new URL(payload);
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname !== 'nexoratouch.com' || parts[0] !== 'touch' || parts.length < 3) return { ok: false, code: 'invalid_qr' };
    return { ok: true, businessId: parts[1], station: parts[2], staffProfileId: url.searchParams.get('staffProfileId') || null };
  } catch {
    return { ok: false, code: 'invalid_qr' };
  }
}

function completeCheckin(appState, checkin, now = Date.now()) {
  if (checkin.status === 'confirmed') return { ok: true, checkin, idempotent: true };
  checkin.status = 'confirmed';
  checkin.confirmedAt = new Date(now).toISOString();
  const business = appState.businesses[checkin.businessId];
  appendLedger(appState, { businessId: checkin.businessId, type: 'visit', pointsDelta: business.checkinPoints, refType: 'checkin', refId: checkin.id, now: new Date(checkin.scannedAt).getTime() });
  return { ok: true, checkin, points: business.checkinPoints, idempotent: false };
}

function submitCheckin(appState, payload, online = true, now = Date.now()) {
  const parsed = parseNexoraQr(payload);
  if (!parsed.ok || !appState.businesses[parsed.businessId]) return { ok: false, code: 'invalid_qr' };
  const duplicate = appState.checkins.some((item) => item.businessId === parsed.businessId && now - new Date(item.scannedAt).getTime() < 120 * 60 * 1000);
  if (duplicate) return { ok: false, code: 'duplicate_checkin' };
  const checkin = { id: `checkin-${crypto.randomUUID()}`, businessId: parsed.businessId, station: parsed.station, staffProfileId: parsed.staffProfileId, sourceQr: payload, scannedAt: new Date(now).toISOString(), status: online ? 'sending' : 'queued', confirmedAt: null };
  appState.checkins.push(checkin);
  if (!online) { appState.offlineQueue.push(checkin.id); return { ok: true, checkin, queued: true }; }
  return completeCheckin(appState, checkin, now);
}

function retryQueuedCheckins(appState, online = true, now = Date.now()) {
  if (!online) return { ok: false, code: 'offline', retried: 0 };
  const ids = [...appState.offlineQueue];
  let retried = 0;
  for (const id of ids) {
    const checkin = appState.checkins.find((item) => item.id === id);
    if (checkin && checkin.status === 'queued') { completeCheckin(appState, checkin, now); retried += 1; }
  }
  appState.offlineQueue = appState.offlineQueue.filter((id) => !ids.includes(id));
  return { ok: true, retried };
}
```

Add these properties to `window.NEXORA_TEST_API`:

```js
parseNexoraQr,
submitCheckin,
retryQueuedCheckins,
```

Register the remaining prototype integrations with explicit feedback:

```js
registerAction('start-scan', () => {
  const line = document.getElementById('scan-line');
  const loading = document.getElementById('scan-loading-state');
  line.classList.remove('hidden');
  loading.classList.remove('hidden');
  window.setTimeout(() => {
    line.classList.add('hidden');
    loading.classList.add('hidden');
    const result = commitState((draft) => submitCheckin(draft, 'https://nexoratouch.com/touch/bitcoin-nail-bar/front?staffProfileId=staff-anna', navigator.onLine));
    if (!result.ok) return showToast(result.code === 'duplicate_checkin' ? (state.profile.language === 'vi' ? 'Bạn vừa check-in tại đây; vui lòng thử lại sau.' : 'You recently checked in here; try again later.') : (state.profile.language === 'vi' ? 'Mã QR không hợp lệ.' : 'Invalid QR code.'), 'error');
    renderApp();
    if (result.queued) showToast(state.profile.language === 'vi' ? 'Mạng yếu — check-in đang chờ gửi lại.' : 'Weak connection — check-in queued for retry.');
    else showToast(state.profile.language === 'vi' ? 'Check-in thành công và đã cộng điểm.' : 'Check-in complete and points added.');
    navigateTo('home');
  }, 900);
});
registerAction('enter-code', () => navigateTo('onb1'));
registerAction('simulate-geo-push', () => { commitState((draft) => draft.notifications.unshift({ id: `note-${crypto.randomUUID()}`, type: 'nearby', title: { vi: 'Golden Glow Spa ở gần bạn', en: 'Golden Glow Spa is nearby' }, target: 'business', businessId: 'golden-glow-spa', read: false, createdAt: new Date().toISOString() })); renderGlobalState(); showToast(state.profile.language === 'vi' ? 'Đã tạo thông báo ưu đãi gần bạn.' : 'Nearby-offer notification created.'); });
registerAction('simulate-wish-push', () => { commitState((draft) => draft.notifications.unshift({ id: `note-${crypto.randomUUID()}`, type: 'wish_match', title: { vi: 'Có ưu đãi mới khớp mong muốn', en: 'A new offer matches your wish' }, target: 'offers', read: false, createdAt: new Date().toISOString() })); renderGlobalState(); showToast(state.profile.language === 'vi' ? 'Đã mô phỏng ưu đãi phù hợp.' : 'Matching offer simulated.'); });
registerAction('copy-referral', async () => {
  const url = `https://nexora.example/invite/${state.profile.referralCode}`;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
    else {
      const input = document.createElement('textarea'); input.value = url; document.body.append(input); input.select();
      if (!document.execCommand('copy')) throw new Error('copy_failed');
      input.remove();
    }
    showToast(state.profile.language === 'vi' ? 'Đã sao chép liên kết.' : 'Invite link copied.');
  } catch {
    showToast(state.profile.language === 'vi' ? 'Không thể sao chép. Hãy chọn và sao chép thủ công.' : 'Could not copy. Please copy it manually.', 'error');
  }
});
```

Delete the obsolete function declarations named by the `removes obsolete pre-localStorage action functions` test. Replace the old three-argument `selectExclusive` with this stateless helper, because domain state is already committed in the filter, payment and booking branches:

```js
function selectExclusive(control, selector) {
  document.querySelectorAll(selector).forEach((button) => button.setAttribute('aria-pressed', String(button === control)));
}
```

In the existing `implements delegated interactions for the complete prototype` test, replace its old function-name array with the final architecture list:

```js
const functions = [
  'createDefaultState', 'migrateState', 'loadState', 'saveState',
  'navigateTo', 'setLanguage', 'showToast', 'openOverlay', 'closeOverlay',
  'renderApp', 'requestOtp', 'verifyOtp', 'recordConsent',
  'appendLedger', 'redeemReward', 'createTip', 'confirmTipRecord',
  'createDirectPayment', 'confirmDirectPayment', 'createBookingRequest',
  'confirmBookingRequest', 'submitFeedback', 'saveLookRecord',
  'toggleSavedOffer', 'addWishRecord', 'toggleFollowTech', 'submitCheckin'
];
```

Add the online retry listener inside `initializeApp()` after the document listeners:

```js
window.addEventListener('online', () => {
  const result = commitState((draft) => retryQueuedCheckins(draft, true));
  if (result.retried > 0) {
    renderApp();
    showToast(state.profile.language === 'vi' ? `Đã gửi lại ${result.retried} check-in.` : `${result.retried} queued check-in(s) sent.`);
  }
});
```

Update `setLanguage` to persist `state.profile.language`, then call `renderApp()` and restore the active screen:

```js
function setLanguage(language) {
  commitState((draft) => { draft.profile.language = language === 'en' ? 'en' : 'vi'; });
  document.querySelectorAll('[data-en][data-vi]').forEach((element) => { element.textContent = element.dataset[state.profile.language]; });
  document.querySelectorAll('[data-en-ph][data-vi-ph]').forEach((element) => { element.placeholder = element.dataset[`${state.profile.language}Ph`]; });
  renderApp();
  navigateTo(state.ui.activeScreen, { focus: false });
}
```

Update `navigateTo` to persist `ui.activeScreen` and `ui.activeModule`, and ensure `renderActivity()` routes notification taps through their saved target:

```js
function navigateTo(screenId, options = {}) {
  const next = document.getElementById(screenId) || document.getElementById('home');
  document.querySelectorAll('.app-screen').forEach((screen) => { const active = screen === next; screen.classList.toggle('hidden', !active); screen.classList.toggle('is-active', active); });
  state.ui.activeScreen = next.id;
  state.ui.activeModule = SCREEN_MODULE[next.id] || 'home';
  saveState(state);
  updateNavigation();
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (options.focus !== false) document.getElementById('screen-region').focus({ preventScroll: true });
}
```

Add `data-action="enter-code"` to the manual-code Scan button, and add explicit simulate buttons to Explore/Offers using `simulate-geo-push` and `simulate-wish-push`. Ensure every generated dynamic button uses an action already registered before re-running the contract test.

Update the Referral explanatory copy to the paid-visit rule:

```html
<p class="mx-auto mt-2 max-w-md text-sm leading-6 text-white/75" data-en="Your friend receives points from the first business they check in at. Your reward is released after their first paid visit." data-vi="Bạn bè nhận điểm từ doanh nghiệp đầu tiên họ check-in. Điểm của bạn chỉ được cộng sau lượt ghé có thanh toán đầu tiên của họ.">Bạn bè nhận điểm từ doanh nghiệp đầu tiên họ check-in. Điểm của bạn chỉ được cộng sau lượt ghé có thanh toán đầu tiên của họ.</p>
```

- [ ] **Step 4: Run automated and browser smoke verification**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: all tests PASS with exit code 0.

Run:

```bash
git diff --check -- html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
```

Expected: no output and exit code 0.

Start the static server:

```bash
python3 -m http.server 8124 --directory html
```

Open `http://127.0.0.1:8124/customer/cutomer-reward.html` and verify:

- Mobile 390×844: Scan button is raised and does not cover content; bottom safe-area padding is visible.
- Desktop 1440×900: bottom nav is hidden, sidebar is visible, all five roots navigate.
- Console: no JavaScript, Tailwind unknown-utility or Lucide errors.
- Reload after saving a wish, offer and preference: changes remain.
- Tip/pay/booking: pending balance is unchanged; demo confirmation updates the correct business balance exactly once.
- Feedback at 1 star: adds 15 points exactly once.
- Logout: returns to `login1` while wallet data remains.

Stop the server with `Ctrl-C` after verification.

- [ ] **Step 5: Commit the verified complete prototype**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "test: verify complete customer reward prototype"
```

---

## Completion Checklist

- [ ] `node --test html/customer/cutomer-reward.test.mjs` exits 0.
- [ ] `git diff --check` exits 0 for both implementation files.
- [ ] Exactly 31 `.app-screen` sections remain.
- [ ] Every enabled button has a real handler or valid navigation target.
- [ ] `localStorage` reload preserves all approved state categories.
- [ ] No transaction adds points while pending.
- [ ] No cross-business balance is accidentally mutated.
- [ ] No owner/staff hiring marketplace UI appears in customer app.
- [ ] Mobile and desktop navigation both pass visual smoke verification.
