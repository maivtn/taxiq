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

test('combines service, date, time, and technician selection into the same step', () => {
  const serviceStep = SOURCE.match(/data-step-panel="2"[\s\S]*?<\/section>/)?.[0] || '';
  const reviewStep = SOURCE.match(/data-step-panel="3"[\s\S]*?<\/section>/)?.[0] || '';
  assert.match(serviceStep, /Dịch vụ &amp; lịch hẹn/);
  assert.match(serviceStep, /data-service-id="gel"/);
  assert.match(serviceStep, /data-staff-id="any"/);
  assert.match(serviceStep, /data-booking-date/);
  assert.match(serviceStep, /data-booking-time/);
  assert.match(reviewStep, /review-customer/);
  assert.doesNotMatch(SOURCE, /data-step-panel="5"/);
});

test('keeps brand header and progress steps frameless', () => {
  const brandStyle = SOURCE.match(/\.brand-card \{([^}]*)\}/)?.[1] || '';
  const stepperStyle = SOURCE.match(/\.stepper \{([^}]*)\}/)?.[1] || '';

  assert.match(brandStyle, /background: transparent/);
  assert.match(brandStyle, /border: 0/);
  assert.match(brandStyle, /box-shadow: none/);
  assert.match(stepperStyle, /background: transparent/);
  assert.match(stepperStyle, /border: 0/);
  assert.match(stepperStyle, /box-shadow: none/);
});

test('removes decorative card emoji icons from section headers', () => {
  assert.doesNotMatch(SOURCE, /class="card-emoji"/);
  assert.doesNotMatch(SOURCE, /\.card-emoji\s*\{/);
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
