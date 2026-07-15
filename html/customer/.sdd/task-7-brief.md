### Task 7: Looks, Offers, Explore và Follow-Tech Persistence

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:119-152,206-219,229-231,243-end`

**Interfaces:**
- Consumes: state store, visits, action registry and shared modal.
- Produces: `saveLookRecord(appState, input, now): Result`
- Produces: `toggleSavedOffer(appState, offerId): boolean`
- Produces: `addWishRecord(appState, text): Result`
- Produces: `removeWishRecord(appState, text): boolean`
- Produces: `canFollowTech(appState, staffProfileId): boolean`
- Produces: `toggleFollowTech(appState, staffProfileId): Result`
- Produces: `createTechMoveNotification(appState, staffProfileId, newBusinessId, now): Result`
- Produces: `renderLooks()`, `renderOffers()`, `renderWishes()`, `renderExplore()`, `renderActivity()`.

- [ ] **Step 1: Add persistence and eligibility tests**

Append:

```js
test('persists looks, saved offers and unique wishes', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  assert.equal(api.saveLookRecord(app, { businessId: 'bitcoin-nail-bar', visitId: 'visit-1001', staffProfileId: 'staff-anna', staffName: 'Anna', service: 'Pedicure', color: '#710 Sea Glass', note: 'Da nhạy cảm', photoDataUrl: '' }, 1000).ok, true);
  assert.equal(api.toggleSavedOffer(app, 'offer-glow'), true);
  assert.equal(api.toggleSavedOffer(app, 'offer-glow'), false);
  assert.equal(api.addWishRecord(app, 'Pedicure deal').ok, true);
  assert.equal(api.addWishRecord(app, 'pedicure deal').code, 'duplicate');
  assert.equal(app.looks.at(-1).note, 'Da nhạy cảm');
});

test('allows follow-tech only after a shared visit and never stores follower counts', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  assert.equal(api.canFollowTech(app, 'staff-anna'), true);
  assert.equal(api.canFollowTech(app, 'staff-stranger'), false);
  assert.equal(api.toggleFollowTech(app, 'staff-stranger').code, 'no_shared_visit');
  assert.equal(api.toggleFollowTech(app, 'staff-anna').following, true);
  const before = app.notifications.length;
  assert.equal(api.createTechMoveNotification(app, 'staff-anna', 'golden-glow-spa', 1000).code, 'tech_opted_out');
  app.staffProfiles['staff-anna'].followNotifyOptIn = true;
  assert.equal(api.createTechMoveNotification(app, 'staff-anna', 'golden-glow-spa', 2000).ok, true);
  assert.equal(api.createTechMoveNotification(app, 'staff-anna', 'golden-glow-spa', 3000).code, 'already_notified');
  assert.equal(app.notifications.length, before + 1);
  assert.equal('followerCount' in app, false);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
node --test --test-name-pattern="persists looks|follow-tech only" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because content persistence and follow-tech functions are absent.

- [ ] **Step 3: Implement content domains, photo selection and dynamic cards**

Add pure functions:

```js
function saveLookRecord(appState, input, now = Date.now()) {
  if (![input.service, input.color, input.note, input.photoDataUrl].some((value) => String(value ?? '').trim())) return { ok: false, code: 'empty_look' };
  const look = { id: `look-${crypto.randomUUID()}`, businessId: input.businessId, visitId: input.visitId ?? null, staffProfileId: input.staffProfileId ?? null, staffName: input.staffName ?? '', service: input.service ?? '', color: input.color ?? '', note: input.note ?? '', photoDataUrl: input.photoDataUrl ?? '', createdAt: new Date(now).toISOString() };
  appState.looks.unshift(look);
  return { ok: true, look };
}

function toggleSavedOffer(appState, offerId) {
  const index = appState.savedOfferIds.indexOf(offerId);
  if (index >= 0) { appState.savedOfferIds.splice(index, 1); return false; }
  appState.savedOfferIds.push(offerId);
  return true;
}

function addWishRecord(appState, text) {
  const value = String(text ?? '').trim();
  if (!value) return { ok: false, code: 'empty' };
  if (appState.wishes.some((wish) => wish.toLocaleLowerCase() === value.toLocaleLowerCase())) return { ok: false, code: 'duplicate' };
  appState.wishes.push(value);
  return { ok: true, value };
}

function removeWishRecord(appState, text) {
  const index = appState.wishes.indexOf(text);
  if (index < 0) return false;
  appState.wishes.splice(index, 1);
  return true;
}

function canFollowTech(appState, staffProfileId) {
  return appState.visits.some((visit) => visit.staffProfileId === staffProfileId);
}

function toggleFollowTech(appState, staffProfileId) {
  if (!canFollowTech(appState, staffProfileId)) return { ok: false, code: 'no_shared_visit' };
  const index = appState.followedTechIds.indexOf(staffProfileId);
  if (index >= 0) { appState.followedTechIds.splice(index, 1); return { ok: true, following: false }; }
  appState.followedTechIds.push(staffProfileId);
  return { ok: true, following: true };
}

function createTechMoveNotification(appState, staffProfileId, newBusinessId, now = Date.now()) {
  const staff = appState.staffProfiles[staffProfileId];
  if (!staff) return { ok: false, code: 'unknown_staff' };
  if (!appState.followedTechIds.includes(staffProfileId)) return { ok: false, code: 'not_following' };
  if (!staff.followNotifyOptIn) return { ok: false, code: 'tech_opted_out' };
  const dedupeKey = `tech-move:${staffProfileId}:${newBusinessId}`;
  if (appState.notifications.some((item) => item.dedupeKey === dedupeKey)) return { ok: false, code: 'already_notified' };
  const business = appState.businesses[newBusinessId];
  const notification = { id: `note-${crypto.randomUUID()}`, dedupeKey, type: 'tech_move', title: { vi: `${staff.name} giờ làm tại ${business.name}`, en: `${staff.name} now works at ${business.name}` }, target: 'business', businessId: newBusinessId, read: false, createdAt: new Date(now).toISOString() };
  appState.notifications.unshift(notification);
  return { ok: true, notification };
}
```

Add a hidden file input and preview inside Add Look:

```html
<input id="look-photo-input" class="sr-only" type="file" accept="image/jpeg,image/png" data-look-photo>
<img id="look-photo-preview" class="mt-3 hidden max-h-48 w-full rounded-2xl object-cover" alt="Ảnh kiểu đã chọn">
```

Add an explicit receipt-scanning prototype control to My Looks:

```html
<button type="button" class="app-button-secondary" data-action="scan-receipt"><i data-lucide="scan-text" class="size-4" aria-hidden="true"></i><span data-en="Scan receipt" data-vi="Quét hóa đơn">Quét hóa đơn</span></button>
```

Give offers and businesses stable IDs and actions:

```html
<article class="app-card" data-offer-card data-offer-id="offer-glow" data-category="beauty" data-search="golden glow facial spa">
  <button type="button" class="app-button-secondary" data-action="view-offer" data-offer-id="offer-glow">Xem</button>
  <button type="button" class="app-button-secondary" data-action="save-offer" data-offer-id="offer-glow"><span data-en="Save offer" data-vi="Lưu ưu đãi">Lưu ưu đãi</span></button>
  <button type="button" class="app-button" data-action="use-offer" data-reward-key="glow" data-en="Use offer" data-vi="Dùng ưu đãi">Dùng ưu đãi</button>
</article>
<button class="app-chip" type="button" aria-pressed="false" data-offer-filter="saved" data-en="Saved" data-vi="Đã lưu">Đã lưu</button>
```

```html
<article class="app-card" data-business-card data-business-id="bitcoin-nail-bar" data-category="nail" data-search="bitcoin nail bar gel manicure">
  <button type="button" class="app-button-secondary" data-action="view-business" data-business-id="bitcoin-nail-bar">Xem doanh nghiệp</button>
</article>
<button type="button" class="app-button-secondary" data-action="toggle-favorite" data-favorite-business="bitcoin-nail-bar" aria-pressed="true"><i data-lucide="heart" class="size-4" aria-hidden="true"></i><span data-en="Favorite" data-vi="Yêu thích">Yêu thích</span></button>
```

Replace Activity's static cards with a render target so visit actions and notifications reflect persisted state:

```html
<div id="activity-list" class="space-y-3"></div>
```

Implement image compression and renderers:

```js
function compressImage(file, maxEdge = 720, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_failed'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('decode_failed'));
      image.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderLooks() {
  const grid = document.getElementById('looks-grid');
  if (!grid) return;
  grid.innerHTML = state.looks.map((look) => {
    const following = state.followedTechIds.includes(look.staffProfileId);
    return `<article class="app-card overflow-hidden p-0">${look.photoDataUrl ? `<img src="${look.photoDataUrl}" alt="${look.color || look.service}" class="aspect-square w-full object-cover">` : '<div class="grid aspect-square place-items-center bg-app-panel"><i data-lucide="image" class="size-8 text-app-muted"></i></div>'}<div class="p-3"><strong class="block text-sm">${look.color || look.service}</strong><p class="mt-1 text-xs text-app-muted">${look.service} · ${look.staffName}</p><div class="mt-3 grid grid-cols-2 gap-2"><button type="button" class="app-button-secondary" data-action="view-look" data-look-id="${look.id}">${state.profile.language === 'vi' ? 'Xem' : 'View'}</button><button type="button" class="app-button-secondary" data-action="rebook-look" data-look-id="${look.id}">${state.profile.language === 'vi' ? 'Đặt lại' : 'Rebook'}</button><button type="button" class="app-button-secondary" data-action="toggle-follow-tech" data-staff-id="${look.staffProfileId}">${following ? (state.profile.language === 'vi' ? 'Đang theo dõi' : 'Following') : (state.profile.language === 'vi' ? 'Theo thợ' : 'Follow tech')}</button><button type="button" class="app-button-secondary" data-action="tip-look" data-look-id="${look.id}">${state.profile.language === 'vi' ? 'Gửi tip' : 'Tip'}</button><button type="button" class="app-button-secondary border-app-red/30 text-app-red" data-action="delete-look" data-look-id="${look.id}">${state.profile.language === 'vi' ? 'Xóa' : 'Delete'}</button></div></div></article>`;
  }).join('');
}

function renderOffers() {
  document.querySelectorAll('[data-offer-id]').forEach((element) => {
    const saved = state.savedOfferIds.includes(element.dataset.offerId);
    if (element.matches('[data-action="save-offer"]')) {
      element.setAttribute('aria-pressed', String(saved));
      element.querySelector('span').textContent = saved ? (state.profile.language === 'vi' ? 'Đã lưu' : 'Saved') : (state.profile.language === 'vi' ? 'Lưu ưu đãi' : 'Save offer');
    }
  });
  filterOffers(document.getElementById('offer-search')?.value ?? '');
}

function renderWishes() {
  const list = document.getElementById('wish-list');
  if (!list) return;
  list.innerHTML = state.wishes.map((wish) => `<li class="flex items-center justify-between gap-3 rounded-xl bg-app-panel p-3"><span>${wish}</span><button type="button" class="icon-button" data-action="remove-wish" data-wish="${wish.replaceAll('"', '&quot;')}" aria-label="${state.profile.language === 'vi' ? 'Xóa mong muốn' : 'Remove wish'}"><i data-lucide="x" class="size-4"></i></button></li>`).join('');
}

function renderExplore() {
  const business = state.businesses[state.ui.selectedBusinessId] ?? state.businesses[BUSINESS_ID];
  const title = document.getElementById('business-title');
  if (title) title.textContent = business.name;
  document.querySelectorAll('[data-favorite-business]').forEach((control) => {
    const favorite = Boolean(state.businesses[control.dataset.favoriteBusiness]?.favorite);
    control.setAttribute('aria-pressed', String(favorite));
    control.querySelector('span').textContent = favorite ? (state.profile.language === 'vi' ? 'Đã yêu thích' : 'Favorite') : (state.profile.language === 'vi' ? 'Thêm yêu thích' : 'Add favorite');
  });
  filterExplore(document.getElementById('explore-search')?.value ?? '');
}

function renderActivity() {
  const list = document.getElementById('activity-list');
  if (!list) return;
  const visitCards = state.visits.map((visit) => {
    const following = state.followedTechIds.includes(visit.staffProfileId);
    return `<article class="app-card"><p class="eyebrow">${state.profile.language === 'vi' ? 'Lượt ghé gần đây' : 'Recent visit'}</p><strong class="mt-2 block">${visit.service} · ${visit.staffName}</strong><button type="button" class="app-button-secondary mt-3" data-action="toggle-follow-tech" data-staff-id="${visit.staffProfileId}">${following ? (state.profile.language === 'vi' ? 'Đang theo dõi thợ' : 'Following tech') : (state.profile.language === 'vi' ? 'Theo dõi thợ này' : 'Follow this tech')}</button></article>`;
  });
  const notifications = state.notifications.map((item) => `<button type="button" class="app-card w-full text-left" data-action="open-notification" data-notification-id="${item.id}"><strong>${typeof item.title === 'object' ? item.title[state.profile.language] : item.title}</strong><p class="mt-1 text-xs text-app-muted">${new Date(item.createdAt).toLocaleString()}</p></button>`);
  list.innerHTML = [...visitCards, ...notifications].join('');
}
```

Update `filterOffers` so `saved` uses `state.savedOfferIds`, and register handlers:

```js
function filterOffers(query = '') {
  const term = query.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll('[data-offer-card]').forEach((card) => {
    const id = card.dataset.offerId;
    const categoryMatch = state.ui.offerFilter === 'all' || (state.ui.offerFilter === 'saved' ? state.savedOfferIds.includes(id) : card.dataset.category === state.ui.offerFilter);
    const show = categoryMatch && card.dataset.search.includes(term);
    card.classList.toggle('hidden', !show);
    if (show) visible += 1;
  });
  document.getElementById('offers-empty-state')?.classList.toggle('hidden', visible > 0);
}

registerAction('upload-look', () => document.getElementById('look-photo-input').click());
registerAction('scan-receipt', () => openOverlay({ title: state.profile.language === 'vi' ? 'Quét hóa đơn' : 'Scan receipt', html: state.profile.language === 'vi' ? 'Prototype mô phỏng OCR. Bản thật sẽ mở camera, đọc dịch vụ và giá từ hóa đơn.' : 'This prototype simulates OCR. Production will open the camera and read service and price from the receipt.', hideCancel: true }));
registerAction('save-look', () => {
  const input = { businessId: BUSINESS_ID, visitId: 'visit-1001', staffProfileId: 'staff-anna', staffName: 'Anna', service: document.getElementById('look-service').value.trim(), color: document.getElementById('look-color').value.trim(), note: document.getElementById('look-notes').value.trim(), photoDataUrl: document.getElementById('look-photo-preview').dataset.photo ?? '' };
  let result;
  try {
    result = commitState((draft) => saveLookRecord(draft, input));
  } catch (error) {
    const quotaExceeded = error?.name === 'QuotaExceededError' || error?.code === 22;
    if (!quotaExceeded || !input.photoDataUrl) throw error;
    const savedLook = state.looks[0];
    savedLook.photoDataUrl = '';
    saveState(state);
    result = { ok: true, look: savedLook };
    showToast(state.profile.language === 'vi' ? 'Bộ nhớ ảnh đã đầy; đã lưu thông tin kiểu không kèm ảnh.' : 'Image storage is full; look details were saved without the photo.', 'error');
  }
  if (!result.ok) return showToast(state.profile.language === 'vi' ? 'Thêm ảnh, dịch vụ, màu hoặc ghi chú.' : 'Add a photo, service, color or note.', 'error');
  renderLooks(); navigateTo('looks');
});
registerAction('save-offer', (control) => { const saved = commitState((draft) => toggleSavedOffer(draft, control.dataset.offerId)); renderOffers(); showToast(saved ? (state.profile.language === 'vi' ? 'Đã lưu ưu đãi' : 'Offer saved') : (state.profile.language === 'vi' ? 'Đã bỏ lưu' : 'Offer removed')); });
registerAction('view-offer', (control) => openOverlay({ title: control.closest('[data-offer-card]').querySelector('h2').textContent, html: state.profile.language === 'vi' ? 'Xem điều kiện, thời hạn và business phát hành trước khi dùng.' : 'Review terms, expiry and issuing business before use.', hideCancel: true }));
registerAction('use-offer', (control) => openReward(control.dataset.rewardKey));
registerAction('add-wish', () => { const input = document.getElementById('wish-input'); const result = commitState((draft) => addWishRecord(draft, input.value)); if (!result.ok) return showToast(result.code === 'duplicate' ? (state.profile.language === 'vi' ? 'Mong muốn này đã tồn tại.' : 'This wish already exists.') : (state.profile.language === 'vi' ? 'Hãy nhập mong muốn.' : 'Enter a wish.'), 'error'); input.value = ''; renderWishes(); });
registerAction('remove-wish', (control) => { commitState((draft) => removeWishRecord(draft, control.dataset.wish)); renderWishes(); });
registerAction('toggle-follow-tech', (control) => { const result = commitState((draft) => toggleFollowTech(draft, control.dataset.staffId)); if (!result.ok) return showToast(state.profile.language === 'vi' ? 'Chỉ theo dõi thợ đã từng phục vụ bạn.' : 'You can only follow a tech from a shared visit.', 'error'); renderLooks(); renderActivity(); });
registerAction('view-look', (control) => { const look = state.looks.find((item) => item.id === control.dataset.lookId); openOverlay({ title: look.color || look.service, html: `<p><strong>${look.service}</strong></p><p class="mt-2">${look.note || (state.profile.language === 'vi' ? 'Không có ghi chú.' : 'No note.')}</p><p class="mt-2 text-app-muted">${look.staffName} · ${state.businesses[look.businessId].name}</p>`, hideCancel: true }); });
registerAction('rebook-look', (control) => { const look = state.looks.find((item) => item.id === control.dataset.lookId); state.ui.bookingDraft = { businessId: look.businessId, service: look.service, staff: look.staffName, day: 'Thu 16 Jul', time: '2:00 PM', note: `${look.color} ${look.note}`.trim() }; saveState(state); renderBooking(); navigateTo('book1'); });
registerAction('tip-look', (control) => { const look = state.looks.find((item) => item.id === control.dataset.lookId); state.ui.selectedStaffId = look.staffProfileId; saveState(state); navigateTo('tip'); });
registerAction('delete-look', (control) => openOverlay({ title: state.profile.language === 'vi' ? 'Xóa kiểu này?' : 'Delete this look?', html: state.profile.language === 'vi' ? 'Thao tác chỉ ảnh hưởng dữ liệu mẫu trên thiết bị.' : 'This only changes local demo data.', onConfirm: () => { commitState((draft) => { draft.looks = draft.looks.filter((item) => item.id !== control.dataset.lookId); }); renderLooks(); } }));
registerAction('view-business', (control) => { state.ui.selectedBusinessId = control.dataset.businessId; saveState(state); navigateTo('business'); });
registerAction('toggle-favorite', (control) => { commitState((draft) => { const business = draft.businesses[control.dataset.favoriteBusiness]; business.favorite = !business.favorite; }); renderExplore(); });
registerAction('show-directions', () => window.open('https://www.google.com/maps/search/?api=1&query=Bitcoin+Nail+Bar+Houston', '_blank', 'noopener,noreferrer'));
registerAction('open-notification', (control) => {
  const notification = state.notifications.find((item) => item.id === control.dataset.notificationId);
  if (!notification) return;
  commitState((draft) => { const current = draft.notifications.find((item) => item.id === notification.id); current.read = true; if (notification.businessId) draft.ui.selectedBusinessId = notification.businessId; });
  renderGlobalState();
  navigateTo(notification.target || 'activity');
});
```

Before generic `data-action` resolution in `handleAction`, restore filter behavior with exact state fields:

```js
const exploreFilter = event.target.closest('[data-explore-filter]');
if (exploreFilter) {
  commitState((draft) => { draft.ui.exploreFilter = exploreFilter.dataset.exploreFilter; });
  selectExclusive(exploreFilter, '[data-explore-filter]');
  filterExplore(document.getElementById('explore-search').value);
  return;
}
const offerFilter = event.target.closest('[data-offer-filter]');
if (offerFilter) {
  commitState((draft) => { draft.ui.offerFilter = offerFilter.dataset.offerFilter; });
  selectExclusive(offerFilter, '[data-offer-filter]');
  filterOffers(document.getElementById('offer-search').value);
  return;
}
```

Replace `filterExplore` state access with `state.ui.exploreFilter`:

```js
const categoryMatch = state.ui.exploreFilter === 'all' || card.dataset.category.split(' ').includes(state.ui.exploreFilter);
```

Make `handleChange` asynchronous and put this photo branch before the preference branches:

```js
async function handleChange(event) {
  if (event.target.matches('[data-look-photo]')) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      const preview = document.getElementById('look-photo-preview');
      preview.src = dataUrl;
      preview.dataset.photo = dataUrl;
      preview.classList.remove('hidden');
    } catch {
      showToast(state.profile.language === 'vi' ? 'Không thể đọc ảnh này.' : 'Could not read this image.', 'error');
    }
    return;
  }
  if (event.target.id === 'tip-recipient') {
    commitState((draft) => { draft.ui.selectedStaffId = event.target.value; });
    renderTipMethods();
    return;
  }
  const businessPref = event.target.closest('[data-business-pref]');
  if (businessPref) {
    commitState((draft) => setBusinessMarketing(draft, businessPref.dataset.businessPref, businessPref.checked));
    renderPreferences();
    showToast(state.profile.language === 'vi' ? 'Đã lưu tùy chọn doanh nghiệp.' : 'Business preference saved.');
    return;
  }
  const pref = event.target.closest('[data-pref]');
  if (!pref) return;
  commitState((draft) => setPreference(draft, pref.dataset.pref, pref.checked));
  renderPreferences();
  showToast(state.profile.language === 'vi' ? 'Đã lưu tùy chọn' : 'Preference saved');
}
```

Replace `renderDomainViews()` with the accumulated renderer list:

```js
function renderDomainViews() {
  renderProfile();
  renderBalances();
  renderLedger();
  renderRewards();
  renderTipMethods();
  renderTipResult();
  renderPaymentResult();
  renderBooking();
  renderAppointment();
  renderFeedback();
  renderLooks();
  renderOffers();
  renderWishes();
  renderExplore();
  renderActivity();
}
```

Add these properties to `window.NEXORA_TEST_API`:

```js
saveLookRecord,
toggleSavedOffer,
addWishRecord,
removeWishRecord,
canFollowTech,
toggleFollowTech,
createTechMoveNotification,
```

- [ ] **Step 4: Run all tests**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: all tests PASS; the customer side contains no hiring/profile marketplace data.

- [ ] **Step 5: Commit persisted content and follow-tech**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: persist customer looks offers and follows"
```

---

