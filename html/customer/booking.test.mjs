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
  assert.match(SOURCE, /id="service-options"[^>]*data-service-catalog/);
  assert.match(SOURCE, /\.\.\/menu\/menu\.json/);
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

test('renders customer services under visible categories from the shared catalog', () => {
  assert.match(SOURCE, /unpkg\.com\/lucide@[^/]+\/dist\/umd\/lucide\.min\.js/);
  assert.match(SOURCE, /appointment-service-catalog\.js/);
  assert.match(SOURCE, /function renderServiceCatalog\(/);
  assert.match(SOURCE, /data-service-category/);
  assert.match(SOURCE, /data-service-category-name/);
  assert.match(SOURCE, /data-service-category-count/);
  assert.match(SOURCE, /data-lucide="chevron-down"/);
  assert.match(SOURCE, /window\.lucide\?\.createIcons\(\)/);
  assert.doesNotMatch(SOURCE, /content: "⌄"/);
  assert.doesNotMatch(SOURCE, /data-service-category="\$\{escapeHtml\(category\.id\)\}" open/);
  assert.match(SOURCE, /SERVICE_CATALOG_URL/);
});

test('keeps only one service category expanded at a time', () => {
  assert.match(SOURCE, /category\.addEventListener\('toggle'/);
  assert.match(SOURCE, /if \(other !== category\) other\.open = false/);
});

test('loads booking services from the shared menu JSON', () => {
  assert.match(SOURCE, /const SERVICE_CATALOG_URL = '\.\.\/menu\/menu\.json';/);
  assert.doesNotMatch(SOURCE, /booking-service-catalog-draft\.json/);
});

test('opens service descriptions in a modal with a separate view action', () => {
  assert.match(SOURCE, /description: String\(service\.description \|\| ''\)\.trim\(\)/);
  assert.match(SOURCE, /service\.description \?/);
  assert.match(SOURCE, /id="service-description-modal"/);
  assert.match(SOURCE, /role="dialog"/);
  assert.match(SOURCE, /data-service-view-id/);
  assert.match(SOURCE, /function openServiceDescription\(/);
  assert.match(SOURCE, /data-service-modal-close/);
  assert.match(SOURCE, />View details</);
  assert.doesNotMatch(SOURCE, /data-service-select-id/);
  assert.doesNotMatch(SOURCE, /service-action-select/);
  assert.doesNotMatch(SOURCE, />Chọn</);
  assert.doesNotMatch(SOURCE, /\.choice-card\[aria-pressed="true"\] \.choice-description/);
});

test('keeps the service view button at its content width', () => {
  const actionStyle = SOURCE.match(/\.service-action \{([^}]*)\}/)?.[1] || '';
  assert.match(actionStyle, /width: auto/);
  assert.match(actionStyle, /flex: 0 0 auto/);
  assert.doesNotMatch(actionStyle, /flex: 1/);
});

test('uses readable typography for service descriptions', () => {
  const descriptionStyle = SOURCE.match(/\.service-description-content \{([^}]*)\}/)?.[1] || '';
  assert.match(descriptionStyle, /color: #4d4968/);
  assert.match(descriptionStyle, /font-size: 15px/);
  assert.match(descriptionStyle, /line-height: 1\.75/);
});

test('shows optional service includes in the description modal', () => {
  assert.match(SOURCE, /includes: Array\.isArray\(service\.includes\)/);
  assert.match(SOURCE, /id="service-description-includes"/);
  assert.match(SOURCE, /id="service-description-includes-list"/);
  assert.match(SOURCE, /service\.includes\.map/);
  assert.match(SOURCE, /setText\('#service-description-content', service\.description\)/);
});

test('shows service price and duration in the description modal', () => {
  assert.match(SOURCE, /id="service-description-price"/);
  assert.match(SOURCE, /id="service-description-duration"/);
  assert.match(SOURCE, /setText\('#service-description-price'/);
  assert.match(SOURCE, /setText\('#service-description-duration'/);
  assert.match(SOURCE, /service-description-meta/);
});

test('selects services when clicking the item while keeping view details separate', () => {
  assert.match(SOURCE, /role="button" tabindex="0"/);
  assert.match(SOURCE, /const serviceCard = event\.target\.closest\?\.\('\[data-service-id\]'\)/);
  assert.match(SOURCE, /if \(serviceCard\) \{ chooseService\(serviceCard\.dataset\.serviceId\); return; \}/);
  assert.match(SOURCE, /event\.key === 'Enter' \|\| event\.key === ' '/);
  assert.ok(SOURCE.indexOf('if (viewService)') < SOURCE.indexOf('if (serviceCard)'));
});

test('shows optional service type tags next to service names', () => {
  assert.match(SOURCE, /type: String\(service\.type \|\| ''\)\.trim\(\)/);
  assert.match(SOURCE, /service\.type \?/);
  assert.match(SOURCE, /class="service-type-tag"/);
});

test('shows shared menu notes below the service catalog', () => {
  assert.match(SOURCE, /<details class="service-notes" id="service-notes"/);
  assert.match(SOURCE, /<summary><span class="service-notes-label">Lưu ý<\/span>/);
  assert.match(SOURCE, /id="service-notes-list"/);
  assert.match(SOURCE, /data-lucide="chevron-down"/);
  assert.match(SOURCE, /notes: Array\.isArray\(catalog\.notes\)/);
  assert.match(SOURCE, /notes\.map/);
  assert.ok(SOURCE.indexOf('<details class="service-notes"') > SOURCE.indexOf('<div class="selection-summary"'));
});

test('keeps shared menu note text compact', () => {
  const notesSummaryStyle = SOURCE.match(/\.service-notes > summary \{([^}]*)\}/)?.[1] || '';
  const notesStyle = SOURCE.match(/\.service-notes ul \{([^}]*)\}/)?.[1] || '';
  assert.match(notesSummaryStyle, /padding: 9px 11px/);
  assert.match(notesSummaryStyle, /gap: 5px/);
  assert.match(notesStyle, /font-size: 11px/);
  assert.match(notesStyle, /line-height: 1\.25/);
  assert.match(notesStyle, /gap: 3px/);
});

test('keeps the selected-service trash icon small and light', () => {
  const chipStyle = SOURCE.match(/\.selected-service-chip \{([^}]*)\}/)?.[1] || '';
  const removeButtonStyle = SOURCE.match(/\.selected-service-remove \{([^}]*)\}/)?.[1] || '';
  assert.match(chipStyle, /padding: 4px 5px 4px 8px/);
  assert.match(removeButtonStyle, /width: 26px/);
  assert.match(removeButtonStyle, /height: 26px/);
  assert.match(removeButtonStyle, /flex: 0 0 26px/);
  const trashStyle = SOURCE.match(/\.selected-service-remove svg \{([^}]*)\}/)?.[1] || '';
  assert.match(trashStyle, /width: 13px/);
  assert.match(trashStyle, /height: 13px/);
  assert.match(trashStyle, /stroke-width: 2/);
});

test('shows selected services as removable chips below the catalog', () => {
  assert.match(SOURCE, /id="selected-services"/);
  assert.match(SOURCE, /id="selected-service-chips"/);
  assert.match(SOURCE, /function renderSelectedServices\(/);
  assert.match(SOURCE, /data-remove-service-id/);
  assert.match(SOURCE, /data-lucide="trash-2"/);
  assert.doesNotMatch(SOURCE, /data-lucide="x"/);
  assert.match(SOURCE, /class="selected-service-remove"/);
  assert.match(SOURCE, /\.selected-service-remove svg/);
  assert.doesNotMatch(SOURCE, /<button class="selected-service-chip"/);
  assert.match(SOURCE, /service\.categoryName \|\| 'Dịch vụ khác'/);
  assert.match(SOURCE, /selectedLabel = `\$\{service\.categoryName \|\| 'Dịch vụ khác'\} - \$\{service\.name\}`/);
  assert.match(SOURCE, /closest\?\.\('\[data-remove-service-id\]'\)/);
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
  assert.match(SOURCE, /dateOptions\.min = defaultBookingDate/);
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
  assert.match(stepOne, /id="service-options"[^>]*data-service-catalog/);
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

test('removes decorative choice icons from staff cards', () => {
  assert.doesNotMatch(SOURCE, /class="choice-icon"/);
  assert.doesNotMatch(SOURCE, /\.choice-icon\s*\{/);
  assert.doesNotMatch(SOURCE, /\.staff-card \.choice-icon/);
});

test('keeps staff cards compact without a minimum height', () => {
  const staffStyles = [...SOURCE.matchAll(/\.staff-card \{([^}]*)\}/g)].map((match) => match[1]);
  assert.ok(staffStyles.length >= 2);
  staffStyles.forEach((style) => assert.doesNotMatch(style, /min-height/));
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
  assert.match(reviewTotalStyle, /margin: 0;/);
  assert.match(reviewTotalStyle, /padding: 8px 12px 0/);
  assert.match(reviewTotalStyle, /align-items: center/);
});

test('separates review details from the total with a dashed divider', () => {
  const confirmationStep = SOURCE.match(/data-step-panel="2"[\s\S]*?<\/section>/)?.[0] || '';
  const reviewDividerStyle = SOURCE.match(/\.review-divider \{([^}]*)\}/)?.[1] || '';
  const reviewTotalStyle = SOURCE.match(/\.review-total \{([^}]*)\}/)?.[1] || '';
  assert.match(confirmationStep, /<\/dl>\s*<div class="review-divider" aria-hidden="true"><\/div>\s*<div class="review-total">/);
  assert.match(reviewDividerStyle, /margin: 4px 0 0/);
  assert.match(reviewDividerStyle, /border-top: 1px dashed/);
  assert.match(reviewTotalStyle, /margin: 0;/);
  assert.doesNotMatch(reviewTotalStyle, /border-top/);
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

test('uses native date and time inputs without picker libraries', () => {
  assert.match(SOURCE, /id="date-options" type="date"/);
  assert.match(SOURCE, /id="time-options" type="time"/);
  assert.match(SOURCE, /timeOptions\.step = '900'/);
  assert.doesNotMatch(SOURCE, /flatpickr/i);
  assert.doesNotMatch(SOURCE, /timepicker/i);
  assert.doesNotMatch(SOURCE, /jquery/i);
});

test('normalizes native and 12-hour booking time values', () => {
  const api = getApi();
  assert.equal(api.parseBookingTime('15:30'), '15:30');
  assert.equal(api.parseBookingTime('3:45 PM'), '15:45');
  assert.equal(api.parseBookingTime('12:05 AM'), '00:05');
  assert.equal(api.parseBookingTime('12:30 PM'), '12:30');
  assert.equal(api.parseBookingTime('invalid'), '');
});
