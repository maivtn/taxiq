### Task 6: Booking Request và Compliant Feedback

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:144-160,243-end`

**Interfaces:**
- Consumes: `appendLedger()`, action registry and `state.ui.bookingDraft`.
- Produces: `createBookingRequest(appState, input, now): Result`
- Produces: `confirmBookingRequest(appState, bookingId, now): Result`
- Produces: `submitFeedback(appState, input, now): Result`
- Produces: `renderBooking(): void`, `renderAppointment(): void`, `renderFeedback(): void`.

- [ ] **Step 1: Add booking and review compliance tests**

Append:

```js
test('keeps booking bonus pending until business confirmation', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  const result = api.createBookingRequest(app, { businessId: 'bitcoin-nail-bar', service: 'Gel manicure', staff: 'Anna', day: 'Thu 16 Jul', time: '2:00 PM', note: 'Màu hồng sữa' }, 1000);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(result.booking.status, 'requested');
  api.confirmBookingRequest(app, result.booking.id, 2000);
  api.confirmBookingRequest(app, result.booking.id, 3000);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 25);
  assert.equal(app.appointments.length, 1);
});

test('awards 15 points for one-star private feedback and blocks duplicates', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  const first = api.submitFeedback(app, { visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 1, text: 'Cần cải thiện' }, 1000);
  const second = api.submitFeedback(app, { visitId: 'visit-1001', businessId: 'bitcoin-nail-bar', stars: 5, text: 'Lặp' }, 2000);
  assert.equal(first.ok, true);
  assert.equal(second.code, 'already_submitted');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 15);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
node --test --test-name-pattern="booking bonus|one-star private" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because booking and feedback domain functions are absent.

- [ ] **Step 3: Implement booking and feedback domains plus confirmed UI**

Add pure functions:

```js
function createBookingRequest(appState, input, now = Date.now()) {
  if (![input.service, input.staff, input.day, input.time].every(Boolean)) return { ok: false, code: 'missing_selection' };
  const booking = { id: `book-${crypto.randomUUID()}`, businessId: input.businessId, service: input.service, staff: input.staff, day: input.day, time: input.time, note: input.note ?? '', status: 'requested', createdAt: new Date(now).toISOString(), confirmedAt: null };
  appState.bookingRequests.push(booking);
  appState.ui.pendingContext.bookingId = booking.id;
  return { ok: true, booking };
}

function confirmBookingRequest(appState, bookingId, now = Date.now()) {
  const booking = appState.bookingRequests.find((item) => item.id === bookingId);
  if (!booking) return { ok: false, code: 'not_found' };
  const points = appState.businesses[booking.businessId].bookingBonus;
  if (booking.status === 'confirmed') return { ok: true, booking, points, idempotent: true };
  booking.status = 'confirmed';
  booking.confirmedAt = new Date(now).toISOString();
  appState.appointments.push({ id: `appt-${booking.id}`, bookingId: booking.id, businessId: booking.businessId, service: booking.service, staff: booking.staff, day: booking.day, time: booking.time, status: 'confirmed' });
  if (points > 0) appendLedger(appState, { businessId: booking.businessId, type: 'booking_bonus', pointsDelta: points, refType: 'booking', refId: booking.id, now });
  return { ok: true, booking, points, idempotent: false };
}

function submitFeedback(appState, input, now = Date.now()) {
  if (!Number.isInteger(input.stars) || input.stars < 1 || input.stars > 5) return { ok: false, code: 'invalid_rating' };
  if (appState.feedback.some((item) => item.visitId === input.visitId)) return { ok: false, code: 'already_submitted' };
  const feedback = { id: `feedback-${crypto.randomUUID()}`, visitId: input.visitId, businessId: input.businessId, stars: input.stars, text: input.text ?? '', createdAt: new Date(now).toISOString() };
  appState.feedback.push(feedback);
  appendLedger(appState, { businessId: input.businessId, type: 'feedback', pointsDelta: 15, refType: 'feedback', refId: feedback.id, now });
  return { ok: true, feedback, points: 15 };
}
```

Add a separate confirmation action and calendar action to `book3`, plus a Google Review action on Feedback:

```html
<button id="booking-demo-confirm" class="app-button mt-5 w-full" type="button" data-action="confirm-booking-demo" data-en="Simulate salon confirmation" data-vi="Mô phỏng tiệm xác nhận">Mô phỏng tiệm xác nhận</button>
<button id="booking-calendar" class="app-button-secondary mt-3 hidden w-full" type="button" data-action="add-calendar" data-en="Add to calendar" data-vi="Thêm vào lịch">Thêm vào lịch</button>
```

```html
<p class="mt-4 rounded-xl bg-app-green/5 p-3 text-xs leading-5 text-app-muted" data-en="Earn 15 points for private feedback at any rating. Google sharing is optional and never rewarded." data-vi="Nhận 15 điểm cho phản hồi riêng ở mọi mức sao. Chia sẻ Google là tùy chọn và không được thưởng.">Nhận 15 điểm cho phản hồi riêng ở mọi mức sao. Chia sẻ Google là tùy chọn và không được thưởng.</p>
<button type="button" class="app-button-secondary mt-3 w-full" data-action="open-google-review" data-en="Share on Google (optional · no points)" data-vi="Chia sẻ lên Google (tùy chọn · không điểm)">Chia sẻ lên Google (tùy chọn · không điểm)</button>
```

Replace booking/review handlers:

```js
function setRating(rating) {
  state.ui.rating = Number(rating);
  saveState(state);
  document.querySelectorAll('[data-action="set-rating"]').forEach((button) => {
    const active = Number(button.dataset.rating) <= state.ui.rating;
    button.setAttribute('aria-pressed', String(active));
    button.querySelector('svg, i')?.classList.toggle('fill-current', active);
  });
}

registerAction('set-rating', (control) => setRating(control.dataset.rating));
registerAction('review-booking', () => {
  renderBooking();
  navigateTo('book2');
});
registerAction('confirm-booking', () => {
  state.ui.bookingDraft.note = document.getElementById('booking-note').value.trim();
  const result = commitState((draft) => createBookingRequest(draft, draft.ui.bookingDraft));
  if (!result.ok) return showToast(state.profile.language === 'vi' ? 'Chọn đủ dịch vụ, thợ, ngày và giờ.' : 'Choose service, technician, day and time.', 'error');
  renderBooking();
  navigateTo('book3');
});
registerAction('confirm-booking-demo', () => {
  commitState((draft) => confirmBookingRequest(draft, draft.ui.pendingContext.bookingId));
  renderApp();
  renderBooking();
});
registerAction('add-calendar', () => {
  const booking = state.bookingRequests.find((item) => item.id === state.ui.pendingContext.bookingId);
  const content = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${booking.service} at ${state.businesses[booking.businessId].name}\nDESCRIPTION:${booking.note}\nEND:VEVENT\nEND:VCALENDAR`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/calendar' }));
  link.download = 'nexora-booking.ics';
  link.click();
  URL.revokeObjectURL(link.href);
});
registerAction('submit-review', () => {
  const result = commitState((draft) => submitFeedback(draft, { visitId: 'visit-1001', businessId: BUSINESS_ID, stars: draft.ui.rating, text: document.getElementById('review-notes').value.trim() }));
  if (!result.ok) return showToast(result.code === 'already_submitted' ? (state.profile.language === 'vi' ? 'Lượt ghé này đã gửi phản hồi.' : 'Feedback was already sent for this visit.') : (state.profile.language === 'vi' ? 'Hãy chọn từ 1 đến 5 sao.' : 'Choose 1 to 5 stars.'), 'error');
  renderApp();
  navigateTo('home');
  showToast(state.profile.language === 'vi' ? 'Đã gửi phản hồi riêng và cộng 15 điểm.' : 'Private feedback sent and 15 points added.');
});
registerAction('open-google-review', () => window.open('https://www.google.com/search?q=Bitcoin+Nail+Bar+reviews', '_blank', 'noopener,noreferrer'));
```

Before resolving a generic `data-action` in `handleAction`, persist booking-chip choices with this exact branch:

```js
for (const field of ['service', 'staff', 'day', 'time']) {
  const bookingControl = event.target.closest(`[data-book-${field}]`);
  if (bookingControl) {
    const datasetKey = `book${field[0].toUpperCase()}${field.slice(1)}`;
    commitState((draft) => { draft.ui.bookingDraft[field] = bookingControl.dataset[datasetKey]; });
    selectExclusive(bookingControl, `[data-book-${field}]`);
    return;
  }
}
```

Implement booking renderers and call them from `renderDomainViews()`:

```js
function renderBooking() {
  const draft = state.ui.bookingDraft;
  document.getElementById('booking-service-summary').textContent = draft.service;
  document.getElementById('booking-staff-summary').textContent = draft.staff;
  document.getElementById('booking-time-summary').textContent = `${draft.day} · ${draft.time}`;
  const booking = state.bookingRequests.find((item) => item.id === state.ui.pendingContext.bookingId);
  if (!booking) return;
  const confirmed = booking.status === 'confirmed';
  document.getElementById('booking-pending').classList.toggle('hidden', confirmed);
  document.getElementById('booking-confirmed').classList.toggle('hidden', !confirmed);
  document.getElementById('booking-confirmed').classList.toggle('flex', confirmed);
  document.getElementById('booking-demo-confirm').classList.toggle('hidden', confirmed);
  document.getElementById('booking-calendar').classList.toggle('hidden', !confirmed);
}

function renderAppointment() {
  const container = document.getElementById('home-appointment');
  if (!container) return;
  const appointment = state.appointments.at(-1);
  container.classList.toggle('hidden', !appointment);
  if (appointment) container.querySelector('[data-appointment-copy]').textContent = `${appointment.service} · ${appointment.staff} · ${appointment.day} ${appointment.time}`;
}

function renderFeedback() {
  const alreadySubmitted = state.feedback.some((item) => item.visitId === 'visit-1001');
  const submit = document.querySelector('[data-action="submit-review"]');
  if (!submit) return;
  submit.disabled = alreadySubmitted;
  submit.setAttribute('aria-disabled', String(alreadySubmitted));
  submit.querySelector('span').textContent = alreadySubmitted ? (state.profile.language === 'vi' ? 'Đã gửi phản hồi' : 'Feedback sent') : (state.profile.language === 'vi' ? 'Gửi phản hồi + nhận 15 điểm' : 'Send feedback + earn 15 points');
  setRating(state.ui.rating);
}
```

Add a Home appointment target:

```html
<article id="home-appointment" class="app-card hidden"><p class="eyebrow" data-en="Upcoming appointment" data-vi="Lịch hẹn sắp tới">Lịch hẹn sắp tới</p><strong class="mt-2 block" data-appointment-copy></strong><span class="mt-2 inline-flex rounded-full bg-app-green/10 px-2 py-1 text-xs font-bold text-app-green" data-en="Confirmed" data-vi="Đã xác nhận">Đã xác nhận</span></article>
```

Replace `renderDomainViews()` with the current accumulated list and keep the 31 screen inventory unchanged:

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
}
```

Add these properties to `window.NEXORA_TEST_API`:

```js
createBookingRequest,
confirmBookingRequest,
submitFeedback,
```

- [ ] **Step 4: Run all tests**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: all tests PASS; 1-star feedback awards 15 and Google action has no ledger mutation.

- [ ] **Step 5: Commit booking and feedback**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: add confirmed bookings and compliant feedback"
```

---

