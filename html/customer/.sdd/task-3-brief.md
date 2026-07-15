### Task 3: Auth, Onboarding, Profile và Consent Persistence

**Files:**
- Modify: `html/customer/cutomer-reward.test.mjs`
- Modify: `html/customer/cutomer-reward.html:161-166,194-205,220-233,243-end`

**Interfaces:**
- Consumes: versioned state and action registry from Tasks 1–2.
- Produces: `normalizeUsPhone(value: string): string`
- Produces: `requestOtp(appState, phone, now): Result`
- Produces: `verifyOtp(appState, code, now): Result`
- Produces: `recordConsent(appState, scope, action, method, now): ConsentRecord`
- Produces: `setPreference(appState, key, value, now): Result`
- Produces: `setBusinessMarketing(appState, businessId, value, now): Result`
- Produces: `claimWelcomeGift(appState, phone, now): Result`
- Produces: `renderProfile(): void`, `renderPreferences(): void`.

- [ ] **Step 1: Add domain tests for validation, cooldown, lockout and consent**

Append:

```js
test('validates US phone and enforces OTP cooldown plus lockout', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  assert.equal(api.normalizeUsPhone('(832) 555-0148'), '8325550148');
  assert.equal(api.requestOtp(app, '123', 1000).ok, false);
  assert.equal(api.requestOtp(app, '(832) 555-0148', 1000).ok, true);
  assert.equal(api.requestOtp(app, '(832) 555-0148', 2000).code, 'cooldown');
  for (let attempt = 0; attempt < 5; attempt += 1) api.verifyOtp(app, '111111', 31000 + attempt);
  assert.ok(app.session.lockedUntil > 31004);
  assert.equal(api.verifyOtp(app, '246810', 32000).code, 'locked');
});

test('records consent decisions without making marketing a condition of points', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  api.recordConsent(app, 'business:bitcoin-nail-bar', 'revoke', 'onboarding_skip', 1000);
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(app.consents.at(-1).action, 'revoke');
  api.setBusinessMarketing(app, 'bitcoin-nail-bar', true, 1500);
  assert.equal(app.preferences.businessMarketing['bitcoin-nail-bar'], true);
  api.setPreference(app, 'aiSuggestions', false, 2000);
  assert.equal(app.preferences.aiSuggestions, false);
  assert.equal(app.consents.at(-1).scope, 'aiSuggestions');
});

test('prevents a welcome gift from being claimed twice or by an existing account', () => {
  const { api } = testApi();
  const app = api.createDefaultState();
  const before = app.balances['bitcoin-nail-bar'].points;
  assert.equal(api.claimWelcomeGift(app, '(832) 555-0148', 40000).code, 'existing_account');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before);
  assert.equal(api.claimWelcomeGift(app, '(713) 555-0199', 80000).ok, true);
  assert.equal(api.claimWelcomeGift(app, '(713) 555-0199', 120000).code, 'already_claimed');
  assert.equal(app.balances['bitcoin-nail-bar'].points, before + 25);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
node --test --test-name-pattern="OTP cooldown|consent decisions" html/customer/cutomer-reward.test.mjs
```

Expected: FAIL because auth and consent domain functions are absent.

- [ ] **Step 3: Implement auth/onboarding domain functions and replace the four onboarding screens**

Add these pure functions before UI renderers and export them through `NEXORA_TEST_API`:

```js
function normalizeUsPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

function requestOtp(appState, rawPhone, now = Date.now()) {
  const phone = normalizeUsPhone(rawPhone);
  if (phone.length !== 10) return { ok: false, code: 'invalid_phone' };
  if (appState.session.otpRequestedAt && now - appState.session.otpRequestedAt < 30000) return { ok: false, code: 'cooldown', retryAt: appState.session.otpRequestedAt + 30000 };
  appState.session.phone = phone;
  appState.session.otpCode = '246810';
  appState.session.otpRequestedAt = now;
  appState.session.otpAttempts = 0;
  return { ok: true, code: 'sent', demoCode: '246810' };
}

function verifyOtp(appState, code, now = Date.now()) {
  if (appState.session.lockedUntil > now) return { ok: false, code: 'locked', retryAt: appState.session.lockedUntil };
  if (!/^\d{6}$/.test(String(code)) || String(code) !== appState.session.otpCode) {
    appState.session.otpAttempts += 1;
    if (appState.session.otpAttempts >= 5) appState.session.lockedUntil = now + 15 * 60 * 1000;
    return { ok: false, code: appState.session.lockedUntil > now ? 'locked' : 'invalid_code' };
  }
  appState.session.authenticated = true;
  appState.session.otpAttempts = 0;
  appState.session.lockedUntil = 0;
  return { ok: true, code: 'verified' };
}

function recordConsent(appState, scope, action, method, now = Date.now()) {
  const record = { id: `consent-${crypto.randomUUID()}`, scope, action, method, createdAt: new Date(now).toISOString(), confirmedAt: action === 'grant' ? new Date(now).toISOString() : null };
  appState.consents.push(record);
  return record;
}

function setPreference(appState, key, value, now = Date.now()) {
  if (!(key in appState.preferences)) return { ok: false, code: 'unknown_preference' };
  appState.preferences[key] = Boolean(value);
  recordConsent(appState, key, value ? 'grant' : 'revoke', 'preferences', now);
  return { ok: true };
}

function setBusinessMarketing(appState, businessId, value, now = Date.now()) {
  appState.preferences.businessMarketing[businessId] = Boolean(value);
  recordConsent(appState, `business:${businessId}`, value ? 'grant' : 'revoke', 'preferences', now);
  return { ok: true };
}

function claimWelcomeGift(appState, rawPhone, now = Date.now()) {
  const phone = normalizeUsPhone(rawPhone);
  if (phone.length !== 10) return { ok: false, code: 'invalid_phone' };
  const otp = requestOtp(appState, phone, now);
  if (!otp.ok) return otp;
  if (phone === appState.profile.phone) return { ok: false, code: 'existing_account' };
  if (appState.welcomeClaims.includes(phone)) return { ok: false, code: 'already_claimed' };
  appState.welcomeClaims.push(phone);
  appState.balances[BUSINESS_ID].points += 25;
  appState.ledger.unshift({ id: `ledger-${crypto.randomUUID()}`, businessId: BUSINESS_ID, type: 'welcome', pointsDelta: 25, refType: 'onboarding', refId: `welcome-${phone}`, createdAt: new Date(now).toISOString() });
  return { ok: true, code: 'claimed', points: 25 };
}
```

Replace the login country prefix with `+1`, use placeholder `(832) 555-0148`, change login buttons to `request-otp` and `verify-otp`, and add inline error containers:

```html
<span class="grid min-h-11 place-items-center rounded-xl border border-app-line bg-app-panel px-3 text-sm font-bold">+1</span>
<input id="login-phone" class="app-input" type="tel" inputmode="tel" autocomplete="tel" placeholder="(832) 555-0148">
<p id="login-phone-error" class="field-error hidden" role="alert"></p>
<button class="app-button mt-5 w-full" type="button" data-action="request-otp"><span data-en="Continue" data-vi="Tiếp tục">Tiếp tục</span></button>
```

```html
<p class="mt-2 rounded-xl bg-app-cyan/5 p-3 text-xs text-app-cyan" data-en="Prototype code: 246810" data-vi="Mã dùng thử: 246810">Mã dùng thử: 246810</p>
<p id="otp-error" class="field-error hidden" role="alert"></p>
<button class="app-button mt-5 w-full" type="button" data-action="verify-otp"><span data-en="Verify & sign in" data-vi="Xác thực & đăng nhập">Xác thực & đăng nhập</span></button>
<button id="otp-resend" class="mt-4 min-h-11 w-full text-sm font-bold text-app-cyan" type="button" data-action="resend-code" data-en="Resend code" data-vi="Gửi lại mã">Gửi lại mã</button>
```

Replace `onb1`–`onb4` content while keeping the section elements and titles:

```html
<!-- onb1 body -->
<div class="mx-auto max-w-xl"><p class="eyebrow" data-en="Welcome gift" data-vi="Quà chào mừng">Quà chào mừng</p><h1 id="onb1-title" class="mt-2 text-3xl font-black" data-en="25 points are waiting" data-vi="25 điểm đang chờ bạn">25 điểm đang chờ bạn</h1><p class="mt-3 text-sm text-app-muted" data-en="Gifted by Bitcoin Nail Bar. Enter your phone to claim it." data-vi="Bitcoin Nail Bar tặng bạn. Nhập số điện thoại để nhận.">Bitcoin Nail Bar tặng bạn. Nhập số điện thoại để nhận.</p><input id="onb-phone" class="app-input mt-6" type="tel" placeholder="(832) 555-0148"><p id="onb-phone-error" class="field-error hidden" role="alert"></p><button class="app-button mt-5 w-full" type="button" data-action="claim-welcome" data-en="Claim 25 points" data-vi="Nhận 25 điểm">Nhận 25 điểm</button></div>
```

```html
<!-- onb2 body -->
<div class="mx-auto max-w-xl"><p class="eyebrow" data-en="Optional messages" data-vi="Tin nhắn tùy chọn">Tin nhắn tùy chọn</p><h1 id="onb2-title" class="mt-2 text-3xl font-black" data-en="Choose what to receive" data-vi="Chọn nội dung muốn nhận">Chọn nội dung muốn nhận</h1><label class="app-card mt-6 flex items-start gap-3"><input class="mt-1 size-5 accent-app-purple" type="checkbox" data-consent-choice="business"><span><strong data-en="Rewards & offers from Bitcoin Nail Bar" data-vi="Điểm và ưu đãi từ Bitcoin Nail Bar">Điểm và ưu đãi từ Bitcoin Nail Bar</strong><small class="block text-app-muted" data-en="Up to 4 marketing messages per month." data-vi="Tối đa 4 tin tiếp thị mỗi tháng.">Tối đa 4 tin tiếp thị mỗi tháng.</small></span></label><label class="app-card mt-3 flex items-start gap-3"><input class="mt-1 size-5 accent-app-purple" type="checkbox" data-consent-choice="network"><span><strong data-en="Nearby partner offers" data-vi="Ưu đãi từ đối tác gần bạn">Ưu đãi từ đối tác gần bạn</strong></span></label><p id="consent-error" class="field-error hidden" role="alert"></p><button class="app-button mt-5 w-full" type="button" data-action="accept-consent" data-en="Agree & continue" data-vi="Đồng ý & tiếp tục">Đồng ý & tiếp tục</button><button class="app-button-secondary mt-3 w-full" type="button" data-action="skip-consent" data-en="Skip — points only" data-vi="Bỏ qua — chỉ nhận điểm">Bỏ qua — chỉ nhận điểm</button><p class="mt-4 text-xs leading-5 text-app-muted" data-en="Consent is not required to receive points. STOP/HELP supported." data-vi="Không bắt buộc đồng ý để nhận điểm. Hỗ trợ STOP/HELP.">Không bắt buộc đồng ý để nhận điểm. Hỗ trợ STOP/HELP.</p></div>
```

```html
<!-- onb3 body -->
<div class="mx-auto max-w-xl"><p class="eyebrow" data-en="Double opt-in" data-vi="Xác nhận hai bước">Xác nhận hai bước</p><h1 id="onb3-title" class="mt-2 text-3xl font-black" data-en="Confirm your number" data-vi="Xác nhận số điện thoại">Xác nhận số điện thoại</h1><div class="app-card mt-6 text-sm leading-6 text-app-muted">Nexora: Bitcoin Nail Bar added 25 pts. Reply Y to confirm messages. STOP=cancel HELP=help.</div><button class="app-button mt-5 w-full" type="button" data-action="confirm-double-opt-in" data-en="Reply Y (demo)" data-vi="Trả lời Y (mô phỏng)">Trả lời Y (mô phỏng)</button></div>
```

```html
<!-- onb4 body -->
<div class="mx-auto grid min-h-[65vh] max-w-xl place-items-center text-center"><div class="w-full"><span class="mx-auto grid size-20 place-items-center rounded-3xl bg-app-green/10 text-app-green"><i data-lucide="party-popper" class="size-10" aria-hidden="true"></i></span><h1 id="onb4-title" class="mt-6 text-3xl font-black" data-en="25 points are waiting" data-vi="25 điểm đã sẵn sàng">25 điểm đã sẵn sàng</h1><p class="mt-3 text-sm text-app-muted" data-en="Stored in your Bitcoin Nail Bar balance." data-vi="Đã lưu trong số dư Bitcoin Nail Bar của bạn.">Đã lưu trong số dư Bitcoin Nail Bar của bạn.</p><button class="app-button mt-5 w-full" type="button" data-action="finish-onboarding" data-en="Enter app" data-vi="Vào ứng dụng">Vào ứng dụng</button></div></div>
```

In Profile, add renderer hooks to the existing name, phone and avatar elements:

```html
<img data-profile-avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" alt="Ảnh hồ sơ Jessica" class="size-24 rounded-3xl object-cover">
<h2 data-profile-name class="mt-4 text-xl font-black">Jessica Nguyen</h2>
<p data-profile-phone class="mt-1 text-sm text-app-muted">(832) 555-0148</p>
```

Replace the preferences controls so transactional messages cannot be disabled, business marketing is per business, and every editable toggle saves immediately. Remove the old Save button and use this explanatory line instead:

```html
<label class="mt-4 flex min-h-14 items-center justify-between gap-4 border-t border-app-line pt-4"><span><strong class="block text-sm" data-en="Booking and receipt messages" data-vi="Tin lịch hẹn và biên nhận">Tin lịch hẹn và biên nhận</strong><small class="text-app-muted" data-en="Transactional messages are always delivered" data-vi="Tin giao dịch luôn được gửi">Tin giao dịch luôn được gửi</small></span><input class="size-5 accent-app-purple" type="checkbox" checked disabled aria-disabled="true"></label>
<label class="flex min-h-16 items-center justify-between gap-4"><span><strong class="block text-sm">Bitcoin Nail Bar</strong><small class="text-app-muted" data-en="Marketing offers from this business" data-vi="Ưu đãi tiếp thị từ doanh nghiệp này">Ưu đãi tiếp thị từ doanh nghiệp này</small></span><input class="size-5 accent-app-purple" type="checkbox" data-business-pref="bitcoin-nail-bar"></label>
<label class="flex min-h-16 items-center justify-between gap-4"><span><strong class="block text-sm" data-en="Nearby partner offers" data-vi="Ưu đãi đối tác gần bạn">Ưu đãi đối tác gần bạn</strong></span><input class="size-5 accent-app-purple" type="checkbox" data-pref="networkOffers"></label>
<label class="flex min-h-16 items-center justify-between gap-4"><span><strong class="block text-sm" data-en="Booking reminders" data-vi="Nhắc lịch hẹn">Nhắc lịch hẹn</strong></span><input class="size-5 accent-app-purple" type="checkbox" data-pref="bookingReminders"></label>
<label class="flex min-h-16 items-center justify-between gap-4"><span><strong class="block text-sm" data-en="Nearby deal notifications" data-vi="Thông báo ưu đãi gần bạn">Thông báo ưu đãi gần bạn</strong></span><input class="size-5 accent-app-purple" type="checkbox" data-pref="nearbyDeals"></label>
<label class="flex min-h-16 items-center justify-between gap-4"><span><strong class="block text-sm" data-en="AI suggestions from history" data-vi="Gợi ý AI từ lịch sử">Gợi ý AI từ lịch sử</strong></span><input class="size-5 accent-app-purple" type="checkbox" data-pref="aiSuggestions"></label>
<p class="text-center text-xs text-app-muted" data-en="Each change is saved immediately on this device." data-vi="Mỗi thay đổi được lưu ngay trên thiết bị này.">Mỗi thay đổi được lưu ngay trên thiết bị này.</p>
```

Register handlers and profile/preferences renderers:

```js
function setFieldError(id, message = '') {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message;
  element.classList.toggle('hidden', !message);
}

function renderProfile() {
  document.querySelectorAll('[data-profile-name]').forEach((element) => { element.textContent = state.profile.name; });
  document.querySelectorAll('[data-profile-phone]').forEach((element) => { element.textContent = `(${state.profile.phone.slice(0, 3)}) ${state.profile.phone.slice(3, 6)}-${state.profile.phone.slice(6)}`; });
  document.querySelectorAll('[data-profile-avatar]').forEach((element) => { element.src = state.profile.avatar; });
  renderPreferences();
}

function renderPreferences() {
  document.querySelectorAll('[data-pref]').forEach((input) => {
    input.checked = Boolean(state.preferences[input.dataset.pref]);
  });
  document.querySelectorAll('[data-business-pref]').forEach((input) => { input.checked = Boolean(state.preferences.businessMarketing[input.dataset.businessPref]); });
  document.querySelector('[data-for-you]')?.classList.toggle('hidden', !state.preferences.aiSuggestions);
}

function renderDomainViews() {
  renderProfile();
}

function handleChange(event) {
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

registerAction('request-otp', () => {
  const result = commitState((draft) => requestOtp(draft, document.getElementById('login-phone').value));
  if (!result.ok) return setFieldError('login-phone-error', state.profile.language === 'vi' ? 'Nhập số điện thoại US gồm 10 số.' : 'Enter a 10-digit US phone number.');
  setFieldError('login-phone-error');
  navigateTo('login2');
});
registerAction('verify-otp', () => {
  const result = commitState((draft) => verifyOtp(draft, document.getElementById('otp-code').value));
  if (!result.ok) return setFieldError('otp-error', result.code === 'locked' ? (state.profile.language === 'vi' ? 'Đã khóa 15 phút do nhập sai nhiều lần.' : 'Locked for 15 minutes after too many attempts.') : (state.profile.language === 'vi' ? 'Mã phải đúng 6 số.' : 'Enter the valid 6-digit code.'));
  setFieldError('otp-error');
  navigateTo('home');
});
registerAction('resend-code', () => {
  const result = commitState((draft) => requestOtp(draft, draft.session.phone));
  showToast(result.ok ? (state.profile.language === 'vi' ? 'Đã gửi lại mã 246810' : 'Code 246810 resent') : (state.profile.language === 'vi' ? 'Vui lòng chờ đủ 30 giây.' : 'Please wait for the 30-second cooldown'), result.ok ? 'success' : 'error');
});
registerAction('claim-welcome', () => {
  const result = commitState((draft) => claimWelcomeGift(draft, document.getElementById('onb-phone').value));
  if (result.code === 'existing_account') { showToast(state.profile.language === 'vi' ? 'Số này đã có tài khoản; hãy xác thực để đăng nhập.' : 'This number already has an account; verify to sign in.'); return navigateTo('login2'); }
  if (!result.ok) return setFieldError('onb-phone-error', result.code === 'already_claimed' ? (state.profile.language === 'vi' ? 'Số này đã nhận quà chào mừng.' : 'This number already claimed the welcome gift.') : (state.profile.language === 'vi' ? 'Nhập số điện thoại US hợp lệ.' : 'Enter a valid US phone number.'));
  navigateTo('onb2');
});
registerAction('accept-consent', () => {
  const choices = [...document.querySelectorAll('[data-consent-choice]:checked')].map((input) => input.dataset.consentChoice);
  if (!choices.length) return setFieldError('consent-error', state.profile.language === 'vi' ? 'Chọn ít nhất một mục hoặc dùng Bỏ qua.' : 'Choose at least one option or Skip.');
  commitState((draft) => choices.forEach((choice) => {
    if (choice === 'business') { draft.preferences.businessMarketing[BUSINESS_ID] = true; recordConsent(draft, `business:${BUSINESS_ID}`, 'grant', 'onboarding'); }
    else { draft.preferences.networkOffers = true; recordConsent(draft, 'network', 'grant', 'onboarding'); }
  }));
  navigateTo('onb3');
});
registerAction('skip-consent', () => {
  commitState((draft) => { draft.preferences.businessMarketing[BUSINESS_ID] = false; draft.preferences.networkOffers = false; recordConsent(draft, `business:${BUSINESS_ID}`, 'revoke', 'onboarding_skip'); recordConsent(draft, 'network', 'revoke', 'onboarding_skip'); });
  navigateTo('onb4');
});
registerAction('confirm-double-opt-in', () => { commitState((draft) => recordConsent(draft, `business:${BUSINESS_ID}`, 'grant', 'sms_y')); navigateTo('onb4'); });
registerAction('finish-onboarding', () => {
  openOverlay({ title: state.profile.language === 'vi' ? 'Bật thông báo?' : 'Turn on notifications?', html: state.profile.language === 'vi' ? 'Nhận xác nhận lịch, thanh toán và cảnh báo điểm sắp hết hạn.' : 'Get booking, payment and point-expiry updates.', confirmLabel: state.profile.language === 'vi' ? 'Bật thông báo' : 'Turn on', cancelLabel: state.profile.language === 'vi' ? 'Để sau' : 'Maybe later', onConfirm: () => { commitState((draft) => { draft.preferences.pushPermission = 'granted'; }); navigateTo('home'); }, onCancel: () => { commitState((draft) => { draft.preferences.pushPermission = 'later'; draft.ui.pushPromptCount += 1; }); navigateTo('home'); } });
});
registerAction('edit-profile', () => openOverlay({
  title: state.profile.language === 'vi' ? 'Chỉnh sửa hồ sơ' : 'Edit profile',
  html: `<label class="block font-bold">${state.profile.language === 'vi' ? 'Họ tên' : 'Name'}<input id="profile-name-input" class="app-input mt-2" value="${state.profile.name.replaceAll('"', '&quot;')}"></label><label class="mt-4 block font-bold">${state.profile.language === 'vi' ? 'Điện thoại' : 'Phone'}<input id="profile-phone-input" class="app-input mt-2" value="${state.profile.phone}"></label><label class="mt-4 block font-bold">${state.profile.language === 'vi' ? 'URL ảnh đại diện' : 'Avatar URL'}<input id="profile-avatar-input" class="app-input mt-2" value="${state.profile.avatar.replaceAll('"', '&quot;')}"></label><p id="profile-edit-error" class="field-error hidden" role="alert"></p>`,
  onConfirm: () => {
    const phone = normalizeUsPhone(document.getElementById('profile-phone-input').value);
    const name = document.getElementById('profile-name-input').value.trim();
    if (!name || phone.length !== 10) return showToast(state.profile.language === 'vi' ? 'Tên và số điện thoại chưa hợp lệ.' : 'Name and phone are invalid.', 'error');
    const avatar = document.getElementById('profile-avatar-input').value.trim();
    commitState((draft) => { draft.profile.name = name; draft.profile.phone = phone; draft.profile.avatar = avatar || draft.profile.avatar; }); renderApp();
  }
}));
registerAction('payment-methods', () => openOverlay({
  title: state.profile.language === 'vi' ? 'Phương thức thanh toán' : 'Payment methods',
  html: ['Zelle', 'Venmo', 'Cash App'].map((method) => `<label class="flex items-center justify-between rounded-xl bg-app-panel p-3"><span>${method}</span><input type="checkbox" data-customer-method="${method}" ${state.profile.paymentMethods.includes(method) ? 'checked' : ''}></label>`).join(''),
  onConfirm: () => { const methods = [...document.querySelectorAll('[data-customer-method]:checked')].map((input) => input.dataset.customerMethod); commitState((draft) => { draft.profile.paymentMethods = methods; }); showToast(state.profile.language === 'vi' ? 'Đã lưu phương thức.' : 'Payment methods saved.'); }
}));
registerAction('privacy-details', () => openOverlay({ title: state.profile.language === 'vi' ? 'Quyền riêng tư' : 'Privacy', html: state.profile.language === 'vi' ? 'Dữ liệu mẫu chỉ lưu trong trình duyệt này. Looks chỉ dành cho bạn và business của visit.' : 'Demo data stays in this browser. Looks are visible only to you and the visit business.', hideCancel: true }));
```

Add these exact properties to the existing `window.NEXORA_TEST_API` object literal:

```js
normalizeUsPhone,
requestOtp,
verifyOtp,
recordConsent,
setPreference,
setBusinessMarketing,
claimWelcomeGift,
```

- [ ] **Step 4: Run the suite and verify pass**

Run:

```bash
node --test html/customer/cutomer-reward.test.mjs
```

Expected: all tests PASS; Vietnamese remains the new-state default.

- [ ] **Step 5: Commit auth and consent flows**

```bash
git add html/customer/cutomer-reward.html html/customer/cutomer-reward.test.mjs
git commit -m "feat: persist customer auth consent and profile"
```

---

