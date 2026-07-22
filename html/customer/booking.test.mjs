import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SOURCE = readFileSync(new URL('./booking.html', import.meta.url), 'utf8');

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function getApi() {
  const script = SOURCE.match(/<script id="booking-app-script">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'booking runtime script must exist');
  const storage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  };
  const window = { localStorage: storage, NEXORA_BOOKING_SKIP_INIT: true };
  const context = vm.createContext({ window, localStorage: storage, console, Date });
  window.window = window;
  vm.runInContext(script, context);
  assert.ok(window.NEXORA_BOOKING_TEST_API, 'booking test API must exist');
  return window.NEXORA_BOOKING_TEST_API;
}

const services = [
  { id: 'gel', name: 'Gel Manicure', priceCents: 4500, durationMinutes: 45 },
  { id: 'pedi', name: 'Signature Pedicure', priceCents: 5500, durationMinutes: 60 }
];
const catalog = {
  services,
  staff: [{ id: 'any', name: 'Bất kỳ thợ nào', available: true }],
  slots: [{ date: '2026-07-24', time: '14:00' }]
};

test('normalizes phone and recognizes returning customer', () => {
  const api = getApi();
  assert.equal(api.normalizePhone('(832) 555-0198'), '8325550198');
  assert.deepEqual(plain(api.findCustomerByPhone('8325550198', [{ phone: '8325550198', name: 'Mary Smith' }])), {
    phone: '8325550198', name: 'Mary Smith'
  });
});

test('toggles multiple services and calculates combined total', () => {
  const api = getApi();
  let selected = api.toggleSelection([], 'gel');
  selected = api.toggleSelection(selected, 'pedi');
  assert.deepEqual(plain(selected), ['gel', 'pedi']);
  assert.deepEqual(plain(api.calculateBookingTotal(selected, services)), { totalCents: 10000, durationMinutes: 105 });
});

test('rejects an incomplete booking draft', () => {
  const api = getApi();
  const result = api.validateBookingDraft({
    customer: { phone: '123', name: '' }, selectedServiceIds: [], selectedStaffId: '', selectedDate: '', selectedTime: ''
  }, catalog);
  assert.equal(result.ok, false);
  assert.deepEqual(plain(result.errors), ['phone', 'services', 'staff', 'slot']);
});

test('allows a new customer to continue without entering a name', () => {
  const api = getApi();
  const result = api.validateBookingDraft({
    customer: { phone: '8325550198', name: '' }, selectedServiceIds: ['gel'], selectedStaffId: 'any', selectedDate: '2026-07-24', selectedTime: '14:00'
  }, catalog);
  assert.equal(result.ok, true);
});

test('creates a canonical booking request with consent and service summary', () => {
  const api = getApi();
  const result = api.createBookingRequest({
    customer: { phone: '8325550198', name: 'Mary Smith', isReturning: true, smsOptIn: true },
    selectedServiceIds: ['gel', 'pedi'], selectedStaffId: 'any', selectedDate: '2026-07-24', selectedTime: '14:00', note: 'First visit'
  }, catalog, '2026-07-22T04:00:00.000Z', 'book-1');
  assert.equal(result.ok, true);
  assert.deepEqual(plain(result.booking), {
    id: 'book-1', customer: { phone: '8325550198', name: 'Mary Smith', isReturning: true, smsOptIn: true },
    serviceIds: ['gel', 'pedi'], staffId: 'any', date: '2026-07-24', time: '14:00',
    totalCents: 10000, durationMinutes: 105, note: 'First visit', status: 'requested', createdAt: '2026-07-22T04:00:00.000Z'
  });
});

test('page includes booking controls and removes check-in copy', () => {
  assert.match(SOURCE, /id="booking-phone"/);
  assert.match(SOURCE, /data-service-id="gel"/);
  assert.match(SOURCE, /data-staff-id="any"/);
  assert.match(SOURCE, /data-booking-date/);
  assert.match(SOURCE, /data-booking-time/);
  assert.match(SOURCE, /Booking|Đặt lịch/);
  assert.match(SOURCE, /Họ và tên/);
  assert.doesNotMatch(SOURCE, /Không bắt buộc/);
  assert.doesNotMatch(SOURCE, /Tùy chọn, bạn có thể bỏ qua/);
  assert.match(SOURCE, /Vui lòng nhập số điện thoại/);
  assert.match(SOURCE, /Quý khách/);
  assert.doesNotMatch(SOURCE, /chúng mình|Bạn muốn làm gì hôm nay|Cho chúng mình xin số điện thoại/);
  assert.doesNotMatch(SOURCE, /Check me in/i);
});

test('keeps booking data in memory only', () => {
  assert.doesNotMatch(SOURCE, /localStorage/);
  assert.doesNotMatch(SOURCE, /BOOKING_STORAGE_KEY|readState|persistState|clearState/);
});

test('allows booking dates beyond the previous seven-day window', () => {
  const api = getApi();
  const result = api.validateBookingDraft({
    customer: { phone: '8325550198', name: '' },
    selectedServiceIds: ['gel'],
    selectedStaffId: 'any',
    selectedDate: '2099-01-15',
    selectedTime: '14:00'
  }, { ...catalog, slots: [] });
  assert.equal(result.ok, true);
});

test('removes the fixed seven-day date picker limit', () => {
  assert.doesNotMatch(SOURCE, /Array\.from\(\{ length: 7/);
  assert.doesNotMatch(SOURCE, /maxDate:|dateOptions\.max/);
  assert.match(SOURCE, /minDate: defaultBookingDate/);
});

test('hides optional SMS consent and returning-customer helper from step 1', () => {
  const stepOne = SOURCE.match(/data-step-panel="1"[\s\S]*?<\/section>/)?.[0] || '';
  assert.doesNotMatch(stepOne, /id="sms-opt-in"/);
  assert.doesNotMatch(stepOne, /id="phone-helper"/);
  assert.doesNotMatch(stepOne, /Quý khách đã từng sử dụng dịch vụ tại tiệm/);
});

test('combines customer details and service selection into step 1', () => {
  const stepOne = SOURCE.match(/data-step-panel="1"[\s\S]*?<\/section>/)?.[0] || '';
  const confirmationStep = SOURCE.match(/data-step-panel="2"[\s\S]*?<\/section>/)?.[0] || '';
  assert.match(stepOne, /Vui lòng nhập số điện thoại/);
  assert.match(stepOne, /Quý khách muốn sử dụng dịch vụ nào\?/);
  assert.match(stepOne, /data-service-id="gel"/);
  assert.match(stepOne, /data-staff-id="any"/);
  assert.match(stepOne, /data-booking-date/);
  assert.match(stepOne, /data-booking-time/);
  assert.match(confirmationStep, /Xác nhận thông tin đặt lịch/);
  assert.match(confirmationStep, /review-customer/);
  assert.doesNotMatch(SOURCE, /data-step-indicator="3"/);
  assert.doesNotMatch(SOURCE, /data-step-panel="4"/);
});

test('shows a separate customer name row only when a name is available', () => {
  const confirmationStep = SOURCE.match(/data-step-panel="2"[\s\S]*?<\/section>/)?.[0] || '';
  assert.match(confirmationStep, /<div class="review-row" id="review-customer-name-row" hidden>\s*<dt>Tên khách hàng<\/dt>\s*<dd id="review-customer-name"><\/dd>/);
  assert.match(SOURCE, /customerNameRow\.hidden = !customerName/);
  assert.match(SOURCE, /setText\('#review-customer-name', customerName\)/);
  assert.match(SOURCE, /setText\('#review-customer', customerPhone\)/);
});

test('removes the redundant service step label', () => {
  const stepOne = SOURCE.match(/data-step-panel="1"[\s\S]*?<\/section>/)?.[0] || '';
  assert.doesNotMatch(stepOne, /Bước 1 · Dịch vụ &amp; lịch hẹn/);
  assert.match(stepOne, /Quý khách muốn sử dụng dịch vụ nào\?/);
});

test('removes the step 1 information label', () => {
  const stepOne = SOURCE.match(/data-step-panel="1"[\s\S]*?<\/section>/)?.[0] || '';
  assert.doesNotMatch(stepOne, /Bước 1 · Thông tin &amp; lịch hẹn/);
  assert.match(stepOne, /Vui lòng nhập số điện thoại/);
});

test('removes the step 2 confirmation label', () => {
  const confirmationStep = SOURCE.match(/data-step-panel="2"[\s\S]*?<\/section>/)?.[0] || '';
  assert.doesNotMatch(confirmationStep, /Bước 2 · Xác nhận/);
  assert.match(confirmationStep, /Xác nhận thông tin đặt lịch/);
});

test('removes the booking stepper', () => {
  assert.doesNotMatch(SOURCE, /<nav class="stepper"/);
  assert.doesNotMatch(SOURCE, /data-step-indicator=/);
  assert.doesNotMatch(SOURCE, /\.stepper\s*\{/);
});

test('labels and centers the step 1 continue button', () => {
  const stepOne = SOURCE.match(/data-step-panel="1"[\s\S]*?<\/section>/)?.[0] || '';
  assert.match(stepOne, /data-next-step="2">Tiếp tục/);
  assert.doesNotMatch(stepOne, /Xem lại thông tin/);
  assert.match(SOURCE, /\.sticky-action\s*\{[^}]*display: flex/);
  assert.match(SOURCE, /\.sticky-action\s*\{[^}]*justify-content: center/);
});

test('removes the section divider from step 1', () => {
  assert.doesNotMatch(SOURCE, /section-divider/);
});

test('keeps the brand header frameless', () => {
  const brandStyle = SOURCE.match(/\.brand-card \{([^}]*)\}/)?.[1] || '';

  assert.match(brandStyle, /background: transparent/);
  assert.match(brandStyle, /border: 0/);
  assert.match(brandStyle, /box-shadow: none/);
  assert.match(brandStyle, /padding-bottom: 16px/);
});

test('removes decorative card emoji icons from section headers', () => {
  assert.doesNotMatch(SOURCE, /class="card-emoji"/);
  assert.doesNotMatch(SOURCE, /\.card-emoji\s*\{/);
});

test('renders choice icons as visible text avatars', () => {
  const icons = [...SOURCE.matchAll(/<span class="choice-icon" aria-hidden="true">([^<]+)<\/span>/g)].map((match) => match[1]);
  assert.equal(icons.length, 6);
  assert.equal(icons.filter((icon) => /^[A-Z]{1,3}$/.test(icon)).length, 5);
});

test('keeps choice icons only on staff cards', () => {
  const serviceGrid = SOURCE.match(/<div class="service-grid" id="service-options">([\s\S]*?)<\/div>\s*<div class="selection-summary"[^>]*>/)?.[1] || '';
  const staffGrid = SOURCE.match(/<div class="staff-grid" id="staff-options">([\s\S]*?)<\/div>\s*<p class="field-error" id="staff-error"/)?.[1] || '';
  assert.doesNotMatch(serviceGrid, /choice-icon/);
  assert.equal([...staffGrid.matchAll(/<span class="choice-icon" aria-hidden="true">([^<]+)<\/span>/g)].length, 6);
});

test('uses an icon for the any-staff option', () => {
  const anyStaff = SOURCE.match(/<button class="choice-card staff-card"[^>]*data-staff-id="any"[^>]*>[\s\S]*?<\/button>/)?.[0] || '';
  assert.match(anyStaff, /<span class="choice-icon" aria-hidden="true">✨<\/span>/);
});

test('uses a thin border for active choice cards', () => {
  const activeChoiceStyle = SOURCE.match(/\.choice-card\[aria-pressed="true"\] \{([^}]*)\}/)?.[1] || '';
  assert.match(activeChoiceStyle, /border: 1px solid var\(--pink\)/);
  assert.doesNotMatch(activeChoiceStyle, /border: 2px/);
});

test('removes divider borders from confirmation review rows', () => {
  const reviewRowStyle = SOURCE.match(/\.review-row \{([^}]*)\}/)?.[1] || '';
  assert.doesNotMatch(reviewRowStyle, /border-bottom/);
});

test('uses readable text sizes in the confirmation content', () => {
  assert.match(SOURCE, /\.step-panel\[data-step-panel='2'\] \.card-heading p\s*\{[^}]*font-size: 14px/);
  assert.match(SOURCE, /\.review-row \{[^}]*font-size: 14px/);
  assert.match(SOURCE, /\.service-chip \{[^}]*font-size: 12px/);
});

test('keeps confirmation review rows compact for scanning', () => {
  const reviewListStyle = SOURCE.match(/\.review-list \{([^}]*)\}/)?.[1] || '';
  const reviewRowStyle = SOURCE.match(/\.review-row \{([^}]*)\}/)?.[1] || '';
  assert.match(reviewListStyle, /gap: 4px/);
  assert.match(reviewRowStyle, /padding: 8px 12px/);
});

test('keeps the review total close to the review rows', () => {
  const reviewTotalStyle = SOURCE.match(/\.review-total \{([^}]*)\}/)?.[1] || '';
  assert.match(reviewTotalStyle, /margin: 4px 12px 0/);
  assert.match(reviewTotalStyle, /padding-top: 8px/);
});

test('separates review details from the total with a dashed divider', () => {
  const reviewTotalStyle = SOURCE.match(/\.review-total \{([^}]*)\}/)?.[1] || '';
  assert.match(reviewTotalStyle, /border-top: 1px dashed/);
});

test('groups review details and total in an attractive summary card', () => {
  const confirmationStep = SOURCE.match(/data-step-panel="2"[\s\S]*?<\/section>/)?.[0] || '';
  const summaryStyle = SOURCE.match(/\.review-summary \{([^}]*)\}/)?.[1] || '';
  assert.match(confirmationStep, /<div class="review-summary">[\s\S]*<dl class="review-list">[\s\S]*<\/dl>[\s\S]*<div class="review-total">[\s\S]*<\/div>\s*<\/div>/);
  assert.match(summaryStyle, /margin: 0 0 14px/);
  assert.match(summaryStyle, /padding: 10px 0 12px/);
  assert.match(summaryStyle, /border: 1px solid/);
  assert.match(summaryStyle, /border-radius: 18px/);
  assert.match(summaryStyle, /linear-gradient/);
  assert.match(summaryStyle, /box-shadow:/);
});

test('adds a subtle background to even confirmation review rows', () => {
  const evenReviewRowStyle = SOURCE.match(/\.review-row:nth-child\(even\)\s*\{([^}]*)\}/)?.[1] || '';
  assert.match(evenReviewRowStyle, /background: #faf8ff/);
  assert.doesNotMatch(evenReviewRowStyle, /border-radius/);
});

test('adds a small gap before service selection', () => {
  assert.match(SOURCE, /#returning-customer\s*\+\s*\.card-heading\s*\{[^}]*margin-top: 16px/);
});

test('uses compact mobile-first spacing as the base layout', () => {
  const baseStyles = SOURCE.split('@media (min-width: 640px)')[0];
  assert.doesNotMatch(SOURCE, /@media \(max-width: 430px\)/);
  assert.match(baseStyles, /\.field-error \{[^}]*min-height: 0/);
  assert.match(baseStyles, /\.form-field \{[^}]*margin-top: 12px/);
  assert.match(baseStyles, /\.app-card \{[^}]*padding: 17px/);
  assert.match(baseStyles, /\.staff-grid \{[^}]*grid-template-columns: repeat\(2/);
});

test('keeps the staff list synchronized before service selection', () => {
  assert.doesNotMatch(SOURCE, /\.staff-card:last-child/);
  assert.match(SOURCE, /if \(state\.selectedServiceIds\.length === 0\) return true;/);
});

test('uses a compact three-column time picker library instead of TOAST UI', () => {
  assert.match(SOURCE, /E-Kohei\/timepicker/);
  assert.match(SOURCE, /timepicker\.css/);
  assert.match(SOURCE, /timepicker\.js/);
  assert.doesNotMatch(SOURCE, /tui\.time-picker|tui-time-picker/);
  assert.match(SOURCE, /id="time-options" type="text"/);
  assert.doesNotMatch(SOURCE, /id="time-picker-container"/);
});

test('converts the library 12-hour value to the booking 24-hour value', () => {
  const api = getApi();
  assert.equal(api.parseBookingTime('3:45 PM'), '15:45');
  assert.equal(api.parseBookingTime('12:05 AM'), '00:05');
  assert.equal(api.parseBookingTime('12:30 PM'), '12:30');
  assert.equal(api.parseBookingTime('invalid'), '');
});
