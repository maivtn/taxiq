/* Salon Information UI and edit states from nexoratouch.com, stored locally for the demo. */
(function () {
  'use strict';
  const panel = document.querySelector('[data-settings-panel="information"]');
  if (!panel) return;
  const catalog = window.NEXORA_SALON_DATA.loadCatalog();
  const storageKey = 'nexora:salon-information:v1:' + catalog.salon.id;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const zones = ['America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York', 'America/Anchorage', 'Pacific/Honolulu', 'America/Toronto', 'America/Vancouver', 'America/Edmonton', 'America/Winnipeg', 'America/Mexico_City', 'America/Tijuana', 'Asia/Ho_Chi_Minh'];
  const countries = [['US','United States','1'],['CA','Canada','1'],['VN','Vietnam','84'],['GB','United Kingdom','44'],['AU','Australia','61'],['SG','Singapore','65'],['JP','Japan','81'],['KR','South Korea','82'],['DE','Germany','49'],['FR','France','33'],['IN','India','91'],['CN','China','86'],['BR','Brazil','55'],['MX','Mexico','52'],['HK','Hong Kong','852'],['TW','Taiwan','886'],['MY','Malaysia','60'],['TH','Thailand','66'],['PH','Philippines','63'],['ID','Indonesia','62']];
  const copy = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const icon = name => '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  const defaults = {
    business: {name:catalog.salon.name, email:'vlinkpay.06@vlinkpay.ai', phone:'+1 (034) 668-0233', bookingPhone:'+1 (346) 680-2333', street:'5444 Westheimer Rd, Suite 1000', city:'Houston', region:'Texas', zip:'77056', country:'US', website:'https://bitcoinnailbar.com', google:'https://g.page/r/CRqDrFtIr-HtEBM/review123test', yelp:'https://www.google.com/123test', facebook:'https://www.facebook.com/123test', instagram:'https://www.facebook.com/123456test', tax:'', logo:'../assets/bitcoin-nailbar-logo.png'},
    hours:{zone:'America/Chicago', days:days.map((day, index) => ({open:true, from:index === 1 ? '07:00' : '01:00', to:'23:55'}))},
    week:2,
    holidays:[{id:'christmas-2026', date:'2026-12-25', reason:'Giáng sinh', status:'Closed', from:'00:00', to:'23:59'}],
    autoNotify:true,
    layout:{front:'One page', tablet:'One page'},
    rules:{accept:true, warn:true, change:true},
    booking:{autoConfirm:true, notice:15, advance:365, reminder:12, customer:true, business:true, staff:true}
  };
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (_) {}
  const state = Object.assign(copy(defaults), saved);
  ['business', 'hours', 'layout', 'rules', 'booking'].forEach(key => { state[key] = Object.assign(copy(defaults[key]), saved[key]); });
  if (!Array.isArray(state.holidays)) state.holidays = copy(defaults.holidays);
  if (!Array.isArray(state.hours.days) || state.hours.days.length !== 7) state.hours.days = copy(defaults.hours.days);
  const drafts = {};
  const modal = document.createElement('div');
  modal.className = 'salon-information si-modal';
  modal.hidden = true;
  document.body.appendChild(modal);
  let modalState = null;
  let returnFocus = null;

  function persist() { localStorage.setItem(storageKey, JSON.stringify(state)); }
  function icons() { if (window.lucide) window.lucide.createIcons(); }
  function button(text, attributes = '', primary = false) {
    return '<button type="button" class="si-button' + (primary ? ' si-button-primary' : '') + '" ' + attributes + '>' + text + '</button>';
  }
  function select(name, label, choices, value, disabled = false) {
    return '<label class="si-field"><span>' + label + '</span><span class="si-select"><select name="' + name + '" aria-label="' + label + '"' + (disabled ? ' disabled' : '') + '>' + choices.map((option, index) => {
      const id = name === 'week' ? index : option;
      return '<option value="' + esc(id) + '"' + (String(id) === String(value) ? ' selected' : '') + '>' + esc(option) + '</option>';
    }).join('') + '</select>' + icon('chevron-down') + '</span></label>';
  }
  function field(name, label, value, type = 'text', placeholder = '', extra = '') {
    return '<label class="si-field"><span>' + label + '</span><input name="' + name + '" aria-label="' + label + '" type="' + type + '" value="' + esc(value) + '"' + (placeholder ? ' placeholder="' + esc(placeholder) + '"' : '') + ' ' + extra + '></label>';
  }
  function toggle(label, checked, attributes, disabled = false) {
    return '<button type="button" class="si-switch" role="switch" aria-label="' + esc(label) + '" aria-checked="' + checked + '" ' + attributes + (disabled ? ' disabled' : '') + '></button>';
  }
  function phoneField(name, label, business) {
    const country = countries.find(item => item[0] === business[name + 'Country']) || countries[0];
    const value = business[name].replace(/^\+\d+\s*/, '');
    return '<div class="si-field"><label for="si-' + name + '">' + label + '</label><div class="si-phone"><button type="button" class="si-phone-prefix" data-si-country-toggle="' + name + '" aria-expanded="false">' + country[0] + ' +' + country[2] + icon('chevron-down') + '</button><input type="tel" id="si-' + name + '" name="' + name + '" aria-label="' + label + '" data-si-phone value="' + esc(value) + '" placeholder="(555) 555-5555"><div class="si-country-menu" data-si-country-menu="' + name + '" hidden><input type="search" data-si-country-search aria-label="Search country or code..." placeholder="Search country or code...">' + countries.map(item => '<button type="button" data-si-country="' + item[0] + '" data-phone="' + name + '">' + item[1] + ' <span>+' + item[2] + '</span></button>').join('') + '</div></div></div>';
  }
  function detail(label, value) { return '<div class="si-detail"><dt>' + label + '</dt><dd>' + value + '</dd></div>'; }
  function external(url, text) {
    if (!url) return '-';
    try { if (!['http:', 'https:'].includes(new URL(url).protocol)) return esc(url); } catch (_) { return esc(url); }
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(text || url) + icon('external-link') + '</a>';
  }
  function actions(key) { return '<div class="si-actions">' + button('CANCEL', 'data-si-cancel="' + key + '"') + '<button type="submit" class="si-button si-button-primary">SAVE</button></div>'; }
  function card(key, title, mark, body, editLabel = '', editText = 'Edit') {
    const editing = !!drafts[key];
    return '<section class="si-card" data-si-card="' + key + '"><header class="si-card-head"><h2>' + icon(mark) + title + '</h2>' + (!editing && editLabel ? '<button type="button" class="si-edit" data-si-edit="' + key + '" aria-label="' + editLabel + '">' + icon('pen') + '<span>' + editText + '</span></button>' : '') + (key === 'holidays' ? button(icon('plus') + 'Add date', 'data-si-holiday="add"', true) : '') + '</header>' + (editing ? '<form data-si-form="' + key + '">' + body + actions(key) + '</form>' : body) + '</section>';
  }
  function logo(business) {
    return '<div class="si-logo"><button type="button" class="si-logo-button" data-si-logo aria-label="Business Logo"><img src="' + esc(business.logo) + '" alt="Business Logo"></button><div><strong>Business Logo</strong><p>Shown to customers on tip and booking pages. Click to upload a new image.</p></div><input type="file" accept="image/*" data-si-logo-file hidden></div>';
  }
  function businessCard() {
    const b = drafts.business || state.business;
    let body = logo(b);
    if (drafts.business) {
      body += '<div class="si-fields">' + field('name', 'Business Name', b.name, 'text', '', 'required') + field('email', 'Business Email', b.email, 'email', 'e.g. contact@yoursalon.com') + phoneField('phone', 'Business Phone', b) + phoneField('bookingPhone', 'Booking Notification Phone', b) + '<fieldset class="si-fieldset si-field-full"><legend>Business Address</legend><div class="si-fields">' + field('street', 'Street Address', b.street, 'text', 'e.g. 123 Main St, Suite 100') + field('city', 'City', b.city, 'text', 'e.g. Austin') + field('region', 'State or Province', b.region, 'text', 'e.g. Texas') + field('zip', 'ZIP Code', b.zip, 'text', 'e.g. 78701') + field('country', 'Country', b.country, 'text', 'e.g. United States') + '</div></fieldset>' + field('website', 'Website', b.website, 'url', 'https://example.com') + field('google', 'Google Review Link', b.google, 'url', 'https://g.page/r/.../review') + field('yelp', 'Yelp Review Link', b.yelp, 'url', 'https://www.yelp.com/biz/...') + '<fieldset class="si-fieldset si-field-full"><legend>Social Links</legend><div class="si-fields">' + field('facebook', 'Facebook', b.facebook, 'url', 'https://facebook.com/your-salon') + field('instagram', 'Instagram', b.instagram, 'url', 'https://instagram.com/your-salon') + '</div></fieldset>' + field('tax', 'Sales Tax Rate (%)', b.tax, 'number', '', 'min="0" max="100" step="any"') + '</div>';
    } else {
      body += '<dl class="si-details">' + detail('Business Name', esc(b.name)) + detail('Business Phone', esc(b.phone) || '-') + detail('Booking Notification Phone', esc(b.bookingPhone) || '-') + detail('Business Address', esc([b.street, b.city, b.region, b.zip, b.country].filter(Boolean).join(', ')) || '-') + detail('Business Email', esc(b.email) || '-') + detail('Website', external(b.website, b.website.replace(/^https?:\/\//, ''))) + detail('Google Review Link', external(b.google)) + detail('Yelp Review Link', external(b.yelp)) + detail('Facebook', external(b.facebook)) + detail('Instagram', external(b.instagram)) + detail('Sales Tax Rate (%)', esc(b.tax) || '-') + '</dl>';
    }
    return card('business', 'Business Information', 'building-2', body, 'Edit Business Information');
  }
  function time(value) {
    const [hour, minute] = value.split(':').map(Number);
    return String(hour % 12 || 12).padStart(2, '0') + ':' + String(minute).padStart(2, '0') + (hour < 12 ? ' am' : ' pm');
  }
  function hoursCard() {
    const h = drafts.hours || state.hours;
    const body = select('zone', 'Time zone', ['Select a time zone', ...zones], h.zone, !drafts.hours) + '<div class="si-hours">' + days.map((day, index) => {
      const row = h.days[index];
      const times = drafts.hours ? '<div class="si-day-times"><input type="time" name="from-' + index + '" aria-label="' + day + ' open time" value="' + row.from + '"' + (!row.open ? ' disabled' : '') + ' required> – <input type="time" name="to-' + index + '" aria-label="' + day + ' close time" value="' + row.to + '"' + (!row.open ? ' disabled' : '') + ' required></div>' : '<strong>' + (row.open ? time(row.from) + ' – ' + time(row.to) : 'Closed') + '</strong>';
      return '<div class="si-day"><div class="si-day-name">' + (drafts.hours ? toggle('Toggle ' + day + ' open', row.open, 'data-si-day="' + index + '"') : '') + day + '</div>' + times + '</div>';
    }).join('') + '</div>';
    return card('hours', 'Business Hours', 'clock-3', body, 'Edit Business Hours', 'Edit hours');
  }
  function weekCard() {
    return card('week', 'Working week', 'calendar-days', '<p class="si-description">The day your salon’s week starts. Weekly booking incentive periods use it.</p><div class="si-week-select">' + select('week', 'Week starts on', days, state.week) + '</div><p class="si-help">Takes effect from the next saved incentive policy; weeks already running keep their start day.</p>');
  }
  function dateLabel(value) {
    const date = new Date(value + 'T12:00:00');
    return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric', year:'numeric'}).format(date) : '';
  }
  function holidayCard() {
    return card('holidays', 'Holiday & Closures', 'calendar-x', '<p class="si-description">Set dates when the salon is closed or has adjusted hours.</p><div class="si-table-wrap"><table class="si-table"><thead><tr><th>Date</th><th>Reason</th><th>Type</th><th>Actions</th></tr></thead><tbody>' + state.holidays.map(item => '<tr><td>' + dateLabel(item.date) + '</td><td>' + esc(item.reason) + '</td><td><span class="si-badge' + (item.status === 'Adjusted' ? ' si-badge-adjusted' : '') + '">' + item.status + '</span></td><td>' + ['Edit', 'View', 'Delete'].map(action => '<button type="button" class="si-text-button" data-si-holiday="' + action.toLowerCase() + '" data-id="' + esc(item.id) + '">' + action + '</button>').join('') + '</td></tr>').join('') + '</tbody></table></div><div class="si-auto-notify"><span>Auto-notify via AI Voice &amp; SMS</span>' + toggle('Auto-notify via AI Voice & SMS', state.autoNotify, 'data-si-notify') + '</div>');
  }
  function layoutCard() {
    const l = drafts.layout || state.layout;
    return card('layout', 'Check-in Layout', 'clipboard-check', [['front', 'Front desk', 'What staff see on the Check-in tab.'], ['tablet', 'Self check-in tablet', 'What customers see on the tablet by the door.']].map(([key, title, help]) => '<div class="si-setting"><div><p>' + title + '</p><p class="si-help">' + help + '</p>' + (drafts.layout ? '<div class="si-layout-choice">' + ['One page', 'Step by step'].map(value => '<button type="button" class="si-choice" data-si-layout="' + key + '" data-value="' + value + '" aria-pressed="' + (l[key] === value) + '">' + value + '</button>').join('') + '</div>' : '<strong class="si-layout-value">' + l[key] + '</strong>') + '</div></div>').join(''), 'Edit Check-in Layout');
  }
  const serviceRules = [
    ['accept', 'Technicians must accept assigned work', 'When on, a technician gets a notification and taps Accept before the service counts as theirs. Turning this off accepts every service currently waiting.'],
    ['warn', 'Warn when a ticket runs ahead of its services', 'Shows a confirmation when you start, check out or cancel a ticket whose services are not at the matching step. A service with no technician always blocks checkout, warning on or off.'],
    ['change', 'Technicians can change their own services', 'Lets a technician add, swap or remove the services assigned to them on a ticket they are working, once the customer approves with the last 4 digits of their phone. Turn this off to keep every change at the front desk.']
  ];
  function rulesCard() {
    const r = drafts.rules || state.rules;
    return card('rules', 'Service rules', 'list-checks', '<p class="si-description">How services on a ticket move from assigned to done.</p>' + serviceRules.map(([key, title, help]) => '<div class="si-setting"><div><p>' + title + '</p><p class="si-help">' + help + '</p></div>' + toggle(title, r[key], 'data-si-rule="' + key + '"', !drafts.rules) + '</div>').join(''), 'Service rules');
  }
  const money = value => '$' + Number(value).toFixed(2);
  function rangeName(settings, index) {
    const start = index ? settings.serviceThresholds[index - 1] : 0;
    return index === settings.serviceWeights.length - 1 ? money(start) + '+' : money(start) + '–' + money((Math.round(settings.serviceThresholds[index] * 100) - 1) / 100);
  }
  function turnsCard() {
    const settings = window.NEXORA_TURN_SETTINGS.load();
    return card('turns', 'Turn rules', 'repeat-2', '<p class="si-description">How much a service is worth in turns on the Turn Board, and the credit a booking earns.</p><dl class="si-details">' + detail('Booking turn credit', settings.bookingTurnCredit + ' turns') + '</dl><p class="si-range-label">Service ranges</p><dl class="si-details si-range">' + settings.serviceWeights.map((credit, index) => detail(rangeName(settings, index), credit + ' turns')).join('') + '</dl>', 'Edit turn rules');
  }
  const bookingFields = [['notice', 'Minimum notice (minutes)'], ['advance', 'Maximum advance (days)'], ['reminder', 'Reminder sent before appointment (hours)']];
  const bookingSms = [['customer', 'Send to customer', 'Confirm that the booking request was received.'], ['business', 'Send to business', "Notify the business's booking notification number."], ['staff', 'Send to assigned staff', 'Alert the staff member(s) assigned to the appointment.']];
  function bookingCard() {
    const b = drafts.booking || state.booking;
    let body = '<p class="si-description">Control how customers can book appointments online.</p><div class="si-booking-link" role="group" aria-label="Booking online"><span>Booking online:</span><a href="https://nexoratouch.com/b/bitcoin-nail-bar-vi" target="_blank" rel="noopener noreferrer">nexoratouch.com/b/bitcoin-nail-bar-vi</a>' + button(icon('copy') + 'Copy', 'data-si-copy') + '<a class="si-button" href="https://nexoratouch.com/b/bitcoin-nail-bar-vi" target="_blank" rel="noopener noreferrer" aria-label="Open booking page in a new tab">' + icon('external-link') + '</a></div>';
    if (drafts.booking) {
      body += '<div class="si-setting"><div><p>Auto-confirm online bookings</p><p class="si-help">When off, new online bookings stay Pending until you approve them.</p></div>' + toggle('Toggle Auto-Confirm', b.autoConfirm, 'data-si-booking="autoConfirm"') + '</div><div class="si-fields">' + bookingFields.map(([key, label]) => field(key, label, b[key], 'number', '', 'min="0" step="1" required')).join('') + '</div><p class="si-subtitle">Booking SMS Notifications</p><p class="si-help">Choose who receives an SMS when a booking is created.</p>' + bookingSms.map(([key, label, help]) => '<div class="si-setting"><div><p>' + label + '</p><p class="si-help">' + help + '</p></div>' + toggle('Toggle ' + (key === 'staff' ? 'assigned staff' : key) + ' booking SMS', b[key], 'data-si-booking="' + key + '"') + '</div>').join('');
    } else {
      body += '<dl class="si-details">' + detail('Auto-confirm online bookings', b.autoConfirm ? 'On' : 'Off') + bookingFields.map(([key, label]) => detail(label, b[key])).join('') + '</dl><p class="si-subtitle">Booking SMS Notifications</p><dl class="si-details">' + bookingSms.map(([key, label]) => detail(label, b[key] ? 'On' : 'Off')).join('') + '</dl>';
    }
    return card('booking', 'Booking Settings', 'calendar-clock', body, 'Edit Booking Settings');
  }
  const renderers = {business:businessCard, hours:hoursCard, week:weekCard, holidays:holidayCard, layout:layoutCard, rules:rulesCard, turns:turnsCard, booking:bookingCard};
  function renderCard(key) {
    const template = document.createElement('template');
    template.innerHTML = renderers[key]();
    panel.querySelector('[data-si-card="' + key + '"]').replaceWith(template.content);
    icons();
  }
  panel.classList.remove('pos-settings');
  panel.classList.add('salon-information');
  panel.innerHTML = '<div class="si-top">' + businessCard() + hoursCard() + '</div>' + weekCard() + holidayCard() + layoutCard() + rulesCard() + turnsCard() + bookingCard();
  icons();

  function closeModal() {
    modal.hidden = true;
    modal.innerHTML = '';
    modalState = null;
    document.removeEventListener('keydown', modalKeys);
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  }
  function modalKeys(event) {
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
    if (event.key !== 'Tab') return;
    const controls = [...modal.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]')].filter(el => el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  function showModal() {
    modal.hidden = false;
    icons();
    document.addEventListener('keydown', modalKeys);
    modal.querySelector('input:not(:disabled),button')?.focus();
  }
  function renderHolidayModal() {
    const {item, mode} = modalState;
    const view = mode === 'view';
    const disabled = view ? ' disabled' : '';
    const adjusted = item.status === 'Adjusted';
    const title = (view ? 'View' : mode === 'edit' ? 'Edit' : 'Add') + ' Holiday & Closure';
    modal.innerHTML = '<form class="si-dialog" data-si-holiday-form role="dialog" aria-modal="true" aria-labelledby="si-holiday-title"><header class="si-dialog-head"><div><h2 id="si-holiday-title">' + title + '</h2><p class="si-description">Choose the date, type, and reason. Adjusted days use custom hours for booking availability.</p></div><button type="button" class="si-dialog-close" data-si-modal-close aria-label="Close holiday form">' + icon('x') + '</button></header><div class="si-fields"><label class="si-field"><span>Date</span><span class="si-date-field"><input name="dateLabel" aria-label="Date" value="' + dateLabel(item.date) + '" required' + disabled + '>' + icon('calendar-days') + '<input class="si-date-picker" name="date" type="date" aria-label="Date" value="' + item.date + '"' + disabled + '></span></label>' + select('status', 'Status', ['Closed', 'Adjusted'], item.status, view) + field('from', 'Open', item.from, 'time', '', !adjusted || view ? 'disabled' : 'required') + field('to', 'Close', item.to, 'time', '', !adjusted || view ? 'disabled' : 'required') + '<div class="si-field-full">' + field('reason', 'Reason', item.reason, 'text', 'e.g. Christmas Day', disabled) + (view ? '' : '<div class="si-presets">' + ['Christmas Day', 'Thanksgiving', "New Year's Day", 'Independence Day', 'Staff training'].map(reason => button(esc(reason), 'data-si-reason="' + esc(reason) + '"')).join('') + '</div>') + '</div></div><div class="si-actions">' + button(view ? 'Close' : 'Cancel', 'data-si-modal-close') + (view ? '' : '<button type="submit" class="si-button si-button-primary">' + icon('check') + 'Save Closure</button>') + '</div></form>';
    icons();
  }
  function renderTurnModal() {
    const t = modalState.settings;
    modal.innerHTML = '<form class="si-dialog si-dialog-wide" data-si-turn-form role="dialog" aria-modal="true" aria-labelledby="si-turn-title"><header class="si-dialog-head"><div><span class="si-description">Turn board settings</span><h2 id="si-turn-title">Weighted Turn Settings</h2><p class="si-description">Set how service amounts convert into turns.</p></div><button type="button" class="si-dialog-close" data-si-modal-close aria-label="Close">' + icon('x') + '</button></header>' + field('bookingTurnCredit', 'Booking turn credit', t.bookingTurnCredit, 'number', 'e.g. 0.5', 'min="0" step="any" required') + '<p class="si-help">Replaces the range credits when a technician does the services a customer requested them for. Also set in Booking Incentive Policy — both screens use this one number.</p><p><a class="si-button" href="pos-front-desk.html?tab=appointments&amp;view=calendar&amp;settings=booking-incentive">' + icon('calendar-check') + 'Booking Incentive Policy</a></p><h3 class="si-subtitle">Service ranges <small>' + t.serviceWeights.length + ' ranges</small></h3><p class="si-help">Set an Up to amount for each range. The next range starts $0.01 above it.</p><div class="si-table-wrap"><table class="si-table si-turn-table"><thead><tr><th>Range</th><th>From <small>Auto</small></th><th>Up to</th><th>Turn credit</th><th></th></tr></thead><tbody>' + t.serviceWeights.map((credit, index) => '<tr><td>' + (index + 1) + '</td><td>' + money(index ? t.serviceThresholds[index - 1] : 0) + '</td><td>' + (index < t.serviceWeights.length - 1 ? '<input type="number" data-si-threshold="' + index + '" aria-label="Up to ' + (index + 1) + '" value="' + ((Math.round(t.serviceThresholds[index] * 100) - 1) / 100).toFixed(2) + '" min="0" step="0.01" placeholder="e.g. 29.99" required>' : 'No limit') + '</td><td><input type="number" data-si-credit="' + index + '" aria-label="Turn credit for ' + rangeName(t, index) + '" value="' + credit + '" min="0" step="any" required> turns</td><td><button type="button" class="si-text-button" data-si-range-remove="' + index + '" aria-label="Remove range ' + rangeName(t, index) + '"' + (t.serviceWeights.length === 1 ? ' disabled' : '') + '>' + icon('trash-2') + '</button></td></tr>').join('') + '</tbody></table></div>' + button(icon('plus') + 'Add range', 'data-si-range-add') + '<div class="si-turn-note">Service value after discounts.<br>Excludes tips, tax, products, and gift-card payments.</div><p class="si-error" data-si-turn-error role="alert"></p><div class="si-turn-note"><strong>Applies to new turns</strong>Existing recorded turns stay unchanged.</div><div class="si-actions">' + button('Cancel', 'data-si-modal-close') + '<button type="submit" class="si-button si-button-primary">' + icon('check') + 'Save Rules</button></div></form>';
    refreshTurnLabels();
    icons();
  }
  function refreshTurnLabels() {
    const settings = modalState.settings;
    modal.querySelectorAll('.si-turn-table tbody tr').forEach((row, index) => {
      const start = index ? settings.serviceThresholds[index - 1] : 0;
      row.cells[1].textContent = Number.isFinite(start) ? money(start) : '-';
      row.querySelector('[data-si-credit]').setAttribute('aria-label', 'Turn credit for ' + rangeName(settings, index));
      row.querySelector('[data-si-range-remove]').setAttribute('aria-label', 'Remove range ' + rangeName(settings, index));
    });
    let warning = modal.querySelector('[data-si-turn-warning]');
    if (!warning) {
      warning = document.createElement('p');
      warning.className = 'si-help';
      warning.dataset.siTurnWarning = '';
      warning.textContent = 'A more expensive range is worth fewer turns than a cheaper one. You can still save this.';
      modal.querySelector('[data-si-turn-error]').before(warning);
    }
    warning.hidden = !settings.serviceWeights.some((credit, index, values) => index > 0 && credit < values[index - 1]);
  }
  function input(event) {
    const target = event.target;
    if (target.matches('[data-si-country-search]')) {
      const query = target.value.trim().toLowerCase();
      target.parentElement.querySelectorAll('[data-si-country]').forEach(option => { option.hidden = !option.textContent.toLowerCase().includes(query); });
    }
    const key = target.closest('[data-si-form]')?.dataset.siForm;
    if (key && drafts[key]) {
      if (key === 'hours') {
        if (target.name === 'zone') drafts.hours.zone = target.value;
        else {
          const [part, index] = target.name.split('-');
          if (part === 'from' || part === 'to') drafts.hours.days[index][part] = target.value;
        }
      } else if (target.matches('[data-si-phone]')) {
        const country = countries.find(item => item[0] === drafts.business[target.name + 'Country']) || countries[0];
        drafts.business[target.name] = target.value.trim() ? '+' + country[2] + ' ' + target.value : '';
      } else if (target.name) drafts[key][target.name] = target.type === 'number' && target.value !== '' ? Number(target.value) : target.value;
    }
    if (modalState?.kind === 'turns') {
      if (target.name === 'bookingTurnCredit') modalState.settings.bookingTurnCredit = Number(target.value);
      if (target.hasAttribute('data-si-credit')) modalState.settings.serviceWeights[Number(target.dataset.siCredit)] = target.value === '' ? NaN : Number(target.value);
      if (target.hasAttribute('data-si-threshold')) modalState.settings.serviceThresholds[Number(target.dataset.siThreshold)] = target.value === '' ? NaN : Math.round((Number(target.value) + .01) * 100) / 100;
      refreshTurnLabels();
    }
    if (modalState?.kind === 'holiday' && target.name && !['date', 'dateLabel'].includes(target.name)) modalState.item[target.name] = target.value;
  }
  function change(event) {
    const target = event.target;
    if (target.name === 'week') { state.week = Number(target.value); persist(); }
    if (modalState?.kind === 'holiday') {
      if (target.name === 'date') {
        modalState.item.date = target.value;
        const dateField = modal.querySelector('[name="dateLabel"]');
        dateField.value = dateLabel(target.value);
        dateField.setCustomValidity('');
      }
      if (target.name === 'dateLabel') {
        const parsed = new Date(target.value);
        target.setCustomValidity(Number.isFinite(parsed.getTime()) ? '' : 'Date');
        if (Number.isFinite(parsed.getTime())) {
          modalState.item.date = parsed.getFullYear() + '-' + String(parsed.getMonth() + 1).padStart(2, '0') + '-' + String(parsed.getDate()).padStart(2, '0');
          target.value = dateLabel(modalState.item.date);
          modal.querySelector('[name="date"]').value = modalState.item.date;
        }
      }
      if (target.name === 'status') renderHolidayModal();
    }
    if (target.matches('[data-si-logo-file]') && target.files[0]?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const business = drafts.business || state.business;
        business.logo = reader.result;
        if (!drafts.business) persist();
        renderCard('business');
      };
      reader.readAsDataURL(target.files[0]);
    }
  }
  function click(event) {
    const target = event.target.closest('button,a');
    if (!target) return;
    if (target.hasAttribute('data-si-country-toggle')) {
      const menu = panel.querySelector('[data-si-country-menu="' + target.dataset.siCountryToggle + '"]');
      menu.hidden = !menu.hidden;
      target.setAttribute('aria-expanded', String(!menu.hidden));
      if (!menu.hidden) menu.querySelector('input').focus();
    }
    if (target.hasAttribute('data-si-country')) {
      const country = countries.find(item => item[0] === target.dataset.siCountry);
      const name = target.dataset.phone;
      drafts.business[name + 'Country'] = country[0];
      const value = drafts.business[name].replace(/^\+\d+\s*/, '');
      drafts.business[name] = value ? '+' + country[2] + ' ' + value : '';
      renderCard('business'); panel.querySelector('[name="' + name + '"]').focus();
    }
    if (target.hasAttribute('data-si-edit')) {
      const key = target.dataset.siEdit;
      if (key === 'turns') {
        returnFocus = target;
        modalState = {kind:'turns', settings:window.NEXORA_TURN_SETTINGS.load()};
        renderTurnModal(); showModal();
      } else { drafts[key] = copy(state[key]); renderCard(key); panel.querySelector('[data-si-form="' + key + '"] input:not(:disabled),[data-si-form="' + key + '"] button')?.focus(); }
    }
    if (target.hasAttribute('data-si-cancel')) { const key = target.dataset.siCancel; delete drafts[key]; renderCard(key); panel.querySelector('[data-si-edit="' + key + '"]')?.focus(); }
    if (target.hasAttribute('data-si-logo')) panel.querySelector('[data-si-logo-file]').click();
    if (target.hasAttribute('data-si-notify')) { state.autoNotify = !state.autoNotify; persist(); target.setAttribute('aria-checked', String(state.autoNotify)); }
    if (target.hasAttribute('data-si-day')) { const index = Number(target.dataset.siDay); drafts.hours.days[index].open = !drafts.hours.days[index].open; renderCard('hours'); panel.querySelector('[data-si-day="' + index + '"]').focus(); }
    if (target.hasAttribute('data-si-rule')) { const key = target.dataset.siRule; drafts.rules[key] = !drafts.rules[key]; target.setAttribute('aria-checked', String(drafts.rules[key])); }
    if (target.hasAttribute('data-si-booking')) { const key = target.dataset.siBooking; drafts.booking[key] = !drafts.booking[key]; target.setAttribute('aria-checked', String(drafts.booking[key])); }
    if (target.hasAttribute('data-si-layout')) { const key = target.dataset.siLayout; drafts.layout[key] = target.dataset.value; renderCard('layout'); panel.querySelector('[data-si-layout="' + key + '"][data-value="' + drafts.layout[key] + '"]').focus(); }
    if (target.hasAttribute('data-si-copy')) navigator.clipboard?.writeText('https://nexoratouch.com/b/bitcoin-nail-bar-vi').catch(() => {});
    if (target.hasAttribute('data-si-holiday')) {
      const action = target.dataset.siHoliday;
      if (action === 'delete') { state.holidays = state.holidays.filter(item => item.id !== target.dataset.id); persist(); renderCard('holidays'); return; }
      const item = state.holidays.find(item => item.id === target.dataset.id);
      returnFocus = target;
      modalState = {kind:'holiday', mode:action, item:copy(item || {id:'closure-' + Date.now(), date:'', status:'Closed', from:'00:00', to:'23:59', reason:''})};
      renderHolidayModal(); showModal();
    }
    if (target.hasAttribute('data-si-modal-close')) closeModal();
    if (target.hasAttribute('data-si-reason')) { modalState.item.reason = target.dataset.siReason; modal.querySelector('[name="reason"]').value = target.dataset.siReason; }
    if (target.hasAttribute('data-si-range-add')) {
      const t = modalState.settings;
      t.serviceThresholds.push(Math.round(((t.serviceThresholds.at(-1) || 0) + 30) * 100) / 100);
      t.serviceWeights.push(t.serviceWeights.at(-1));
      renderTurnModal();
    }
    if (target.hasAttribute('data-si-range-remove')) {
      const t = modalState.settings, index = Number(target.dataset.siRangeRemove);
      if (t.serviceWeights.length <= 1) return;
      t.serviceWeights.splice(index, 1);
      t.serviceThresholds.splice(Math.min(index, t.serviceThresholds.length - 1), 1);
      renderTurnModal();
    }
  }
  function submit(event) {
    const form = event.target;
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (form.hasAttribute('data-si-form')) {
      const key = form.dataset.siForm;
      state[key] = copy(drafts[key]); persist();
      if (key === 'business') {
        const updated = window.NEXORA_SALON_DATA.loadCatalog();
        updated.salon.name = state.business.name;
        window.NEXORA_SALON_DATA.saveCatalog(updated);
        window.NEXORA_SHELL.refreshSidebar();
      }
      delete drafts[key]; renderCard(key);
      panel.querySelector('[data-si-edit="' + key + '"]')?.focus();
    } else if (form.hasAttribute('data-si-holiday-form')) {
      if (!modalState.item.date) return;
      const index = state.holidays.findIndex(item => item.id === modalState.item.id);
      if (index < 0) state.holidays.push(copy(modalState.item));
      else state.holidays[index] = copy(modalState.item);
      state.holidays.sort((a, b) => a.date.localeCompare(b.date));
      persist(); closeModal(); renderCard('holidays');
      panel.querySelector('[data-si-holiday="add"]').focus();
    } else if (form.hasAttribute('data-si-turn-form')) {
      const result = window.NEXORA_TURN_SETTINGS.save(modalState.settings);
      if (!result.ok) { modal.querySelector('[data-si-turn-error]').textContent = result.error; return; }
      closeModal(); renderCard('turns'); panel.querySelector('[data-si-edit="turns"]').focus();
    }
  }
  [panel, modal].forEach(host => {
    host.addEventListener('input', input);
    host.addEventListener('change', change);
    host.addEventListener('click', click);
    host.addEventListener('submit', submit);
  });
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  window.NEXORA_TURN_SETTINGS.subscribe(() => renderCard('turns'));
})();
