const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'pos-phase-1.html'), 'utf8');

test('POS gives every WAITLIST row operational-ticket links back to the booking/order', () => {
  assert.match(html, /if \(w\.orderId == null\) w\.orderId = 'walkin-' \+ w\.id;/);
  assert.match(html, /if \(w\.bookingId === undefined\) w\.bookingId = null;/);
  assert.match(html, /if \(w\.serviceTicketId === undefined\) w\.serviceTicketId = null;/);
  assert.match(html, /if \(w\.customerId === undefined\) w\.customerId = w\.name;/);
});

test('POS treats "open" as not completed and not cancelled, and never lets two open tickets share a serviceTicketId', () => {
  assert.match(html, /function ticketOpen\(w\) \{ return w\.status !== 'completed' && w\.status !== 'cancelled'; \}/);
  assert.match(html, /function hasOpenTicketForServiceTicket\(serviceTicketId\) \{/);
});

test('POS groups WAITLIST by orderId for the Tickets card view', () => {
  assert.match(html, /function waitlistGroups\(predicate\) \{/);
  assert.match(html, /function renderSingleTicketCard\(w, now, selW\) \{/);
  assert.match(html, /function renderTicketGroupCard\(g, now, selW\) \{/);
  assert.match(html, /g\.tickets\.length === 1 \? renderSingleTicketCard\(g\.tickets\[0\], now, selW\) : renderTicketGroupCard\(g, now, selW\)/);
});

test('POS check-in is atomic: one operational ticket per service ticket, never a flattened row, never a duplicate', () => {
  assert.match(html, /function createOperationalTicket\(booking, ticket\) \{/);
  assert.match(html, /function checkInBooking\(eb\) \{/);
  const checkIn = html.match(/function checkInBooking\(eb\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(checkIn, /if \(eb\.status === 'completed' \|\| eb\.status === 'no-show'\)/);
  assert.match(checkIn, /status: 'checked-in'/);
  assert.match(checkIn, /\(booking && booking\.tickets \|\| \[\]\)\.forEach\(function \(ticket\) \{/);
  assert.match(checkIn, /if \(WAITLIST\.some\(function \(w\) \{ return w\.serviceTicketId === ticket\.id; \}\)\) return;/);
  assert.match(checkIn, /WAITLIST\.push\(createOperationalTicket\(booking, ticket\)\);/);
  assert.match(html, /checkInBooking\(posBookingById\(ei\.getAttribute\('data-eta-in'\)\)\);/);
});

test('POS rehydrates operational tickets from checked-in bookings after every store reload, so a page refresh cannot drop a guest', () => {
  assert.match(html, /function rehydrateOperationalTickets\(\) \{/);
  const rehydrate = html.match(/function rehydrateOperationalTickets\(\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(rehydrate, /if \(b\.status !== 'checked-in'\) return;/);
  assert.match(rehydrate, /WAITLIST\.push\(createOperationalTicket\(b, ticket\)\);/);

  assert.match(html, /reloadAppointmentSnapshot\(\);\s*\n\s*rehydrateOperationalTickets\(\);\s*\n\s*appointmentStore\.subscribe/);
  assert.match(html, /reloadAppointmentSnapshot\(\);\s*\n\s*rehydrateOperationalTickets\(\);\s*\n\s*renderFloor\(\);\s*\n\s*\}, window\);/);
  assert.match(html, /reloadAppointmentSnapshot\(\);\s*\n\s*rehydrateOperationalTickets\(\);\s*\n\s*renderManagement\(\);/);
});

test('POS charges the whole order at once: every open ticket must be ready, turns credit each ticket\'s own tech', () => {
  const pay = html.match(/\/\* 💳 charge the whole order[\s\S]*?\n {8}\}/)?.[0] || '';
  assert.match(pay, /var groupTickets = WAITLIST\.filter\(function \(x\) \{ return x\.orderId === orderKey && ticketOpen\(x\); \}\);/);
  assert.match(pay, /if \(groupTickets\.some\(function \(x\) \{ return x\.status !== 'ready'; \}\)\) \{/);
  assert.match(pay, /SALES\.push\(\{ name: groupTickets\[0\]\.name, method: 'card', tip: tip, total: sub \+ tip, items: allItems, orderId: orderKey, bookingId: bookingId \}\);/);
  assert.match(pay, /x\.status = 'completed';/);
  assert.match(pay, /if \(tt\) \{ tt\.turns \+= 1;/);
  assert.match(pay, /if \(bookingId\) checkBookingOrderComplete\(bookingId\);/);
});

test('POS completes a booking only once every non-cancelled service ticket has been paid', () => {
  assert.match(html, /function checkBookingOrderComplete\(bookingId\) \{/);
  const complete = html.match(/function checkBookingOrderComplete\(bookingId\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(complete, /var relevantTickets = \(booking\.tickets \|\| \[\]\)\.filter\(function \(t\) \{ return t\.status !== 'cancelled'; \}\);/);
  assert.match(complete, /return w && w\.status === 'completed';/);
  assert.match(complete, /appointmentStore\.update\(bookingId, \{ status: 'completed' \}, null, salonCatalog\);/);
});

test('POS marks a removed ticket cancelled instead of deleting it, so rehydrate never resurrects a duplicate', () => {
  assert.match(html, /xw\.status = 'cancelled';/);
  assert.doesNotMatch(html, /WAITLIST = WAITLIST\.filter\(function \(x\) \{ return x\.id !== xw\.id; \}\);/);
});

test('POS Customers "New booking" prefill can actually open the Booking create form', () => {
  const runtime = fs.readFileSync(path.join(__dirname, '..', 'assets', 'pos-booking-runtime.js'), 'utf8');
  assert.match(runtime, /window\.openBookingNewAppointment = openBookingNewAppointment;/);
});

test('POS Customers profile surfaces upcoming bookings, visit history, and payment history from real data (no fabricated balance field)', () => {
  assert.match(html, /function custUpcomingBookings\(c\) \{/);
  assert.match(html, /function custUpcomingCardHtml\(c\) \{/);
  assert.match(html, /function custVisitHistoryTableHtml\(name\) \{/);
  assert.match(html, /function custPaymentHistoryTableHtml\(name\) \{/);
  const visitFn = html.match(/function custVisitHistoryTableHtml\(name\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(visitFn, /var h = CUSTHIST\[name\];/);
  const payFn = html.match(/function custPaymentHistoryTableHtml\(name\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(payFn, /var rows = SALES\.filter\(function \(s\) \{ return s\.name === name; \}\);/);
  assert.match(html, /money0\(c\.spent \|\| 0\)/);
  assert.doesNotMatch(html, /\bbalance\b/i);
});

test('Customer profile modal: compact horizontal stats row, an upcoming-booking highlight card, a Customer insights card, Preferences & care tags, and label+input Notes/Visit/Payment tables like the table view', () => {
  assert.match(html, /\.cust-profile-stats \{ display: flex; border: 1px solid var\(--nexora-border\)/);
  assert.match(html, /function custInsightsCardHtml\(c, ci\) \{/);
  assert.match(html, /function custPrefsCardHtml\(c, ci\) \{/);
  assert.match(html, /var TAG_ICONS = \{/);
  const profileFn = html.match(/function renderCustProfileModal\(c\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(profileFn, /custUpcomingCardHtml\(c\) \+/);
  assert.match(profileFn, /custInsightsCardHtml\(c, ci\) \+/);
  assert.match(profileFn, /custPrefsCardHtml\(c, ci\) \+/);
  assert.match(profileFn, /<div class="cust-section-title">Notes by visibility<\/div>' \+ custNoteLevelsHtml\(c, ci\)/);
  assert.match(profileFn, /<div class="cust-section-title" style="margin-top:14px">Visit history<\/div>' \+ custVisitHistoryTableHtml\(c\.name\)/);
  assert.match(profileFn, /<div class="cust-section-title" style="margin-top:14px">Payment history<\/div>' \+ custPaymentHistoryTableHtml\(c\.name\)/);
  assert.doesNotMatch(profileFn, /cust-usual">🧠 Usual:/);
  // Dead code from earlier redesign passes (old full-width history tables, then the tab switcher and
  // card-based notes) should be gone, not left behind.
  assert.doesNotMatch(html, /function custBookingsHtml\(/);
  assert.doesNotMatch(html, /function custHistTabsHtml\(/);
  assert.doesNotMatch(html, /function custNotesCardHtml\(/);
  assert.doesNotMatch(html, /var custProfileHistTab/);
  assert.doesNotMatch(html, /data-cust-hist-tab/);
  assert.doesNotMatch(html, /data-cust-notes-reveal/);
  // The staff-note-only "insights" box duplicated what Notes by visibility already shows — removed.
  assert.doesNotMatch(profileFn, /cust-profile-insights/);
  assert.doesNotMatch(html, /\.cust-profile-insights \{/);
});

test('Profile modal tag/prefTech edits refresh the open modal in place, guarded to the currently-open customer', () => {
  assert.match(html, /var custProfileOpenIndex = -1;/);
  assert.match(html, /function refreshOpenCustProfile\(ci\) \{/);
  const refreshFn = html.match(/function refreshOpenCustProfile\(ci\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(refreshFn, /if \(ci !== undefined && ci !== custProfileOpenIndex\) return;/);
  assert.match(html, /custProfileOpenIndex = CUSTOMERS\.indexOf\(c\);/);
});

test('Tickets (Queue) has a status-chip filter and a table/card view switch, and the table carries the same info as the card', () => {
  assert.match(html, /data-tix-status-chips/);
  assert.match(html, /data-tix-view-target="card"/);
  assert.match(html, /data-tix-view-target="table"/);
  assert.match(html, /var TICKETS_STATUS_CHIPS = \[/);
  assert.match(html, /function ticketsMatchesFilter\(w\) \{/);
  assert.match(html, /function renderTicketsStatusChips\(\) \{/);
  const table = html.match(/function renderTicketsTable\(groups, now\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(table, /var badge = w\.badgeTxt \?/);
  assert.match(table, /var itemsTot = \(w\.items \|\| \[\]\)\.reduce/);
  assert.match(table, /custTagsHtml\(w\.name\)/);
  assert.match(table, /<th scope="col">Phone<\/th>/);
  assert.match(table, /<th scope="col">Total<\/th>/);
  assert.match(html, /if \(ticketsViewMode === 'table'\) \{\s*\n\s*html\('\[data-wait-list\]', renderTicketsTable\(groups, now\)\);/);
});

test('Check-in has a table/card view switch on Bookings today, and Add opens a phone-search modal that checks in a match or adds a walk-in', () => {
  assert.match(html, /data-eta-view-target="card"/);
  assert.match(html, /data-eta-view-target="table"/);
  assert.match(html, /function renderEtaTable\(items\) \{/);
  assert.match(html, /data-ci-modal/);
  assert.match(html, /function ciMatchesForPhone\(phone\) \{/);
  assert.match(html, /function addWalkIn\(name, phone, tickets\) \{/);
  assert.match(html, /if \(e\.target\.closest\('\[data-wl-add\]'\)\) \{\s*\n\s*var nEl = \$\('\[data-wl-name\]'\), pEl = \$\('\[data-wl-phone\]'\);\s*\n\s*openCheckinModal\(nEl\.value\.trim\(\), pEl\.value\.trim\(\)\);/);
  assert.match(html, /checkInBooking\(posBookingById\(ciCheckin\.getAttribute\('data-ci-checkin'\)\)\);/);
  assert.match(html, /addWalkIn\(ciNameEl \? ciNameEl\.value : '', ciPhoneEl \? ciPhoneEl\.value : '', ciTickets\);/);
});

test('Check-in "no booking found" path has a service/technician ticket picker like the Booking create form, with no date/time fields (a walk-in is always now)', () => {
  assert.match(html, /var ciTickets = \[\];/);
  assert.match(html, /function ciTicketRowHtml\(t, idx\) \{/);
  assert.match(html, /function renderCiTickets\(\) \{/);
  assert.match(html, /data-ci-svc-select/);
  assert.match(html, /data-ci-tech-select/);
  assert.match(html, /data-ci-ticket-add/);
  assert.match(html, /data-ci-ticket-remove/);
  const addWalkInFn = html.match(/function addWalkIn\(name, phone, tickets\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(addWalkInFn, /var list = \(tickets && tickets\.length\) \? tickets : \[null\];/);
});

test('Tech access requests panel has a card/table view switch that carries the same info both ways', () => {
  assert.match(html, /data-arq-view-target="card"/);
  assert.match(html, /data-arq-view-target="table"/);
  assert.match(html, /function renderArqTable\(rows\) \{/);
  assert.match(html, /function arqCardHtml\(row\) \{/);
  const table = html.match(/function renderArqTable\(rows\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(table, /<th scope="col">Tech<\/th><th scope="col">Ticket<\/th><th scope="col">Currently<\/th><th scope="col">Skill<\/th><th scope="col">Actions<\/th>/);
  assert.match(html, /html\('\[data-arq-list\]', arqViewMode === 'table' \? renderArqTable\(rows\) : rows\.map\(arqCardHtml\)\.join\(''\)\);/);
});

test('Customers table is collapsed to 7 columns (Customer/Status/Activity/Technician/Tags/Notes/Action) so it stays usable on an iPad landscape width, and Card mode mirrors the same summaries as a flat card', () => {
  assert.match(html, /var CUST_SEG_META = \{/);
  assert.match(html, /var CUST_SRC_META = \{/);
  assert.match(html, /var CUST_TYPES = \[/);
  assert.match(html, /<th scope="col">Customer<\/th><th scope="col">Status<\/th><th scope="col">Activity<\/th><th scope="col">Technician<\/th>' \+\s*\n\s*'<th scope="col">Tags<\/th><th scope="col">Notes<\/th><th scope="col">Action<\/th>/);
  assert.match(html, /function custTechSummaryHtml\(c\) \{/);
  assert.match(html, /function custTagsSummaryHtml\(c\) \{/);
  assert.match(html, /function custNotesSummaryHtml\(c\) \{/);
  const tableRow = html.match(/function custTableRowHtml\(c\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(tableRow, /var seg = CUST_SEG_META\[c\.seg\];/);
  assert.match(tableRow, /'<td>' \+ custTechSummaryHtml\(c\) \+ '<\/td>' \+/);
  assert.match(tableRow, /'<td>' \+ custTagsSummaryHtml\(c\) \+ '<\/td>' \+/);
  assert.match(tableRow, /'<td>' \+ custNotesSummaryHtml\(c\) \+ '<\/td>' \+/);
  // Tag/note/regular-tech editing is no longer inline in the table row — it moved to the profile
  // modal (View) once the table collapsed from 11 columns to 7.
  assert.doesNotMatch(tableRow, /custTagsEditorHtml\(c, ci\)/);
  assert.doesNotMatch(tableRow, /custNoteLevelsHtml\(c, ci\)/);
  assert.doesNotMatch(tableRow, /custPrefTechHtml\(c, ci\)/);
  const cardRow = html.match(/function custResultRowHtml\(c\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(cardRow, /class="cust-card-name"/);
  assert.match(cardRow, /custTagsSummaryHtml\(c\)/);
  assert.match(cardRow, /custNotesSummaryHtml\(c\)/);
  assert.match(cardRow, /Regular tech: ' \+ \(c\.prefTech \? esc\(techName\(c\.prefTech\)\) : '—'\)/);
  assert.match(html, /function custSrcBadgeHtml\(c\) \{/);
  assert.match(html, /function custFitTechs\(c\) \{/);
  const fitFn = html.match(/function custFitTechs\(c\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(fitFn, /\(t\.fit \|\| \[\]\)\.some\(function \(f\) \{ return \(c\.tags \|\| \[\]\)\.indexOf\(f\) !== -1 \|\| \(f === 'VIP' && c\.seg === 'vip'\); \}\);/);
  assert.match(html, /function renderCustSegChips\(\) \{/);
});

test('Management is split into subtabs (Overview/Pay & Payroll/Staff & Roles/Skills & Catalog/Customers) instead of one long scroll', () => {
  assert.match(html, /data-mg-subtab="overview"/);
  assert.match(html, /data-mg-subtab="payroll"/);
  assert.match(html, /data-mg-subtab="staff"/);
  assert.match(html, /data-mg-subtab="catalog"/);
  assert.match(html, /data-mg-subtab="customers"/);
  assert.match(html, /var MG_SUBTABS = \['overview', 'payroll', 'staff', 'catalog', 'customers'\];/);
  const sections = html.match(/function mgSubtabSections\(ps\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(sections, /overview: function \(\) \{ return mgKpisHtml\(ps\) \+ '<div class="mg-split">' \+ mgRevenueHtml\(\) \+ mgPayrollHtml\(ps\) \+ '<\/div>' \+ mgPerfHtml\(ps\); \}/);
  assert.match(sections, /payroll: function \(\) \{ return mgOwnerHtml\(ps\) \+ mgSmartHtml\(ps\) \+ mgPayoutHtml\(ps\); \}/);
  assert.match(sections, /staff: function \(\) \{ return mgStaffHtml\(\) \+ mgRolesHtml\(\) \+ mgLogHtml\(\); \}/);
  assert.match(sections, /catalog: function \(\) \{ return mgSkillsHtml\(\) \+ mgSvcSkillHtml\(\); \}/);
  assert.match(sections, /customers: function \(\) \{ return mgCustHtml\(\); \}/);
  assert.match(html, /var mgTab = e\.target\.closest\('\[data-mg-subtab\]'\);/);
});

test('Tag/note/prefTech editors are shared functions used by Management (mgCustHtml) and the profile modal, so both surfaces mutate the exact same data', () => {
  assert.match(html, /function toggleCustTag\(ci, tag\) \{/);
  assert.match(html, /function saveCustNoteLevel\(ci, level, value\) \{/);
  assert.match(html, /function setCustPrefTech\(ci, techId\) \{/);
  assert.match(html, /function custTagsEditorHtml\(c, ci\) \{/);
  assert.match(html, /function custNoteLevelsHtml\(c, ci\) \{/);
  assert.match(html, /function custPrefTechHtml\(c, ci\) \{/);
  const tagsFn = html.match(/function custTagsEditorHtml\(c, ci\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(tagsFn, /TAG_LIB\.map\(function \(tag\) \{/);
  assert.match(tagsFn, /data-mg-tag="' \+ ci \+ '\|' \+ tag \+ '"/);
  const notesFn = html.match(/function custNoteLevelsHtml\(c, ci\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(notesFn, /NOTE_LEVELS\.map\(function \(l\) \{/);
  assert.match(notesFn, /data-mg-note="' \+ ci \+ '\|' \+ l\[0\] \+ '"/);
  // Note-level labels and the Fit chip use the bi- icon library instead of raw emoji.
  assert.match(html, /var NOTE_LEVELS = \[\s*\n\s*\['owner', '<i class="bi bi-lock-fill" aria-hidden="true"><\/i> Owner only', 'var\(--nexora-danger\)'\],\s*\n\s*\['staff', '<i class="bi bi-people-fill" aria-hidden="true"><\/i> Techs \/ front desk', 'var\(--nexora-warning\)'\],\s*\n\s*\['customer', '<i class="bi bi-phone" aria-hidden="true"><\/i> Guest sees', 'var\(--nexora-success\)'\]/);
  const fitHtmlFn = html.match(/function custFitHtml\(c\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(fitHtmlFn, /<i class="bi bi-person-check-fill" aria-hidden="true"><\/i>/);
  assert.doesNotMatch(fitHtmlFn, /🤝/);
  // Management's own handlers, and mgCustHtml's own rendering, now call the shared functions/renderers.
  assert.match(html, /if \(tg\) \{\s*\n\s*var pt = tg\.getAttribute\('data-mg-tag'\)\.split\('\|'\);\s*\n\s*toggleCustTag\(\+pt\[0\], pt\[1\]\);\s*\n\s*renderManagement\(\); return;/);
  assert.match(html, /if \(nt\) \{\s*\n\s*var pn = nt\.getAttribute\('data-mg-note'\)\.split\('\|'\);\s*\n\s*saveCustNoteLevel\(\+pn\[0\], pn\[1\], nt\.value\);/);
  assert.match(html, /if \(pf2\) \{ setCustPrefTech\(\+pf2\.getAttribute\('data-mg-pref'\), pf2\.value\); renderManagement\(\); return; \}/);
  const mgCustFn = html.match(/function mgCustHtml\(\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(mgCustFn, /'<td>' \+ custPrefTechHtml\(c, ci\) \+ '<\/td>' \+/);
  assert.match(mgCustFn, /'<td class="wrap">' \+ custTagsEditorHtml\(c, ci\) \+ '<\/td>' \+/);
  assert.match(mgCustFn, /'<td class="wrap" style="min-width:300px">' \+ custNoteLevelsHtml\(c, ci\) \+ '<\/td>' \+/);
  // Customers-panel handlers are guarded so a Management tag/note/pref change doesn't double-fire
  // here — and the guard also covers the profile modal, which lives outside the panel section.
  assert.match(html, /var custTag = e\.target\.closest\('\[data-mg-tag\]'\);\s*\n\s*if \(custTag && e\.target\.closest\('\[data-pos-panel="customers"\], \[data-cust-profile-modal\]'\)\) \{/);
  assert.match(html, /var custNote = e\.target\.closest\('\[data-mg-note\]'\);\s*\n\s*if \(custNote && e\.target\.closest\('\[data-pos-panel="customers"\], \[data-cust-profile-modal\]'\)\) \{/);
  assert.match(html, /var custPref = e\.target\.closest\('\[data-mg-pref\]'\);\s*\n\s*if \(custPref && e\.target\.closest\('\[data-pos-panel="customers"\], \[data-cust-profile-modal\]'\)\) \{/);
});

test('Customer profile modal (View) still edits Regular tech, Tags, and Notes in place — via the Customer insights / Preferences & care cards and the same label+input Notes by visibility as the table', () => {
  const profileFn = html.match(/function renderCustProfileModal\(c\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(profileFn, /segBadge \+ ' ' \+ custSrcBadgeHtml\(c\) \+ ' ' \+ inactiveBadge/);
  assert.match(profileFn, /custNoteLevelsHtml\(c, ci\)/);
  const insightsFn = html.match(/function custInsightsCardHtml\(c, ci\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(insightsFn, /custPrefTechHtml\(c, ci\)/);
  const prefsFn = html.match(/function custPrefsCardHtml\(c, ci\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(prefsFn, /data-mg-tag="' \+ ci \+ '\|' \+ tag \+ '"/);
  const notesFn = html.match(/function custNoteLevelsHtml\(c, ci\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(notesFn, /data-mg-note="' \+ ci \+ '\|' \+ l\[0\] \+ '"/);
  assert.match(html, /toggleCustTag\(\+ctPt\[0\], ctPt\[1\]\);\s*\n\s*renderCustomersTab\(\);\s*\n\s*refreshOpenCustProfile\(\+ctPt\[0\]\);/);
  assert.match(html, /setCustPrefTech\(cpCi, custPref\.value\);\s*\n\s*renderCustomersTab\(\);\s*\n\s*refreshOpenCustProfile\(cpCi\);/);
});
