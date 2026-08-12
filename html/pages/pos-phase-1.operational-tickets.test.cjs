const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'pos-phase-1.html'), 'utf8');
const bookingCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'pos-booking.css'), 'utf8');

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
  const upcomingFn = html.match(/function custUpcomingCardHtml\(c\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(upcomingFn, /data-cust-upcoming-checkin="' \+ esc\(b\.id\)/);
  assert.match(upcomingFn, /data-cust-upcoming-detail="' \+ esc\(b\.id\)/);
  assert.match(upcomingFn, /data-cust-upcoming-collapse/);
  assert.match(upcomingFn, /Booked services/);
  assert.match(upcomingFn, /Technician/);
  assert.match(upcomingFn, /Source/);
  assert.match(upcomingFn, /Note:/);
  assert.match(upcomingFn, /b\.day \|\| 'Upcoming'/);
  assert.match(upcomingFn, /View detail/);
  assert.match(upcomingFn, /Check in/);
  assert.match(html, /var detailCollapse = detailCard && detailCard\.querySelector\('\[data-cust-upcoming-collapse\]'\);/);
  assert.match(html, /custUpcomingDetail\.setAttribute\('aria-expanded', String\(!expanded\)\);/);
  assert.match(html, /function custVisitHistoryTableHtml\(name\) \{/);
  assert.match(html, /function custPaymentHistoryTableHtml\(name\) \{/);
  const visitFn = html.match(/function custVisitHistoryTableHtml\(name\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(visitFn, /var h = CUSTHIST\[name\];/);
  const payFn = html.match(/function custPaymentHistoryTableHtml\(name\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(payFn, /var rows = SALES\.filter\(function \(s\) \{ return s\.name === name; \}\);/);
  assert.match(html, /money0\(c\.spent \|\| 0\)/);
  assert.doesNotMatch(html, /\bbalance\b/i);
});

test('POS money helper keeps cents and inserts comma thousands separators', () => {
  assert.match(html, /function money\(n\) \{ return '\$' \+ \(Math\.round\(\(n \|\| 0\) \* 100\) \/ 100\)\.toLocaleString\('en-US', \{ minimumFractionDigits: 2, maximumFractionDigits: 2 \}\); \}/);
  assert.doesNotMatch(html, /function money\(n\) \{ return '\$' \+ \(Math\.round\(\(n \|\| 0\) \* 100\) \/ 100\)\.toFixed\(2\); \}/);
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

test('Profile modal edits refresh the open modal in place, guarded to the currently-open customer', () => {
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
  assert.match(table, /var itemsTot = \(w\.items \|\| \[\]\)\.reduce/);
  assert.match(table, /ticketCustomerGroupHtml\(w\)/);
  assert.match(table, /ticketQueueNoteHtml\(w\)/);
  assert.match(table, /<th scope="col">Phone<\/th>/);
  assert.match(table, /<th scope="col">Total<\/th>/);
  assert.match(html, /if \(ticketsViewMode === 'table'\) \{\s*\n\s*html\('\[data-wait-list\]', renderTicketsTable\(groups, now\)\);/);
});

test('Queue table separates hour, customer group, note, technician, and elapsed time columns', () => {
  const table = html.match(/function renderTicketsTable\(groups, now\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(table, /<table class="booking-table queue-table">/);
  assert.match(table, /<th scope="col">Hour<\/th>/);
  assert.match(table, /<th scope="col">Customer group<\/th>/);
  assert.match(table, /<th scope="col">Service<\/th>/);
  assert.match(table, /<th scope="col">Tech<\/th>/);
  assert.match(table, /<th scope="col">Total<\/th><th scope="col">Note<\/th><th scope="col">Actions<\/th>/);
  assert.match(table, /<th scope="col">Elapsed<\/th>/);
  assert.match(table, /esc\(w\.bookingTime \|\| w\.at \|\| '—'\)/);
  assert.match(table, /ticketCustomerGroupHtml\(w\)/);
  assert.match(table, /ticketQueueNoteHtml\(w\)/);
  assert.match(table, /ticketTechHtml\(w\)/);
  assert.match(html, /function ticketCustomerGroupHtml\(w\) \{[\s\S]*var fallback = w\.customerGroup/);
  assert.match(html, /var visits = c \? c\.visits : w\.visits/);
  assert.match(html, /var visitTag = visits \? '<span class="pos-chip pos-chip-gray">' \+ visits \+ ' visits<\/span>' : ''/);
  assert.match(html, /class="queue-customer-group"/);
  assert.match(bookingCss, /\.queue-table \.queue-customer-group \{[\s\S]*gap:\s*4px/);
  assert.match(html, /name: 'Lisa Trương',[\s\S]*?customerGroup: 'New'/);
  assert.doesNotMatch(table, /esc\(w\.badgeTxt\)/);
  const createTicket = html.match(/function createOperationalTicket\(booking, ticket\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(createTicket, /note: booking\.note \|\| ''/);
  assert.match(createTicket, /bookingTime: booking\.time \|\| ''/);
  assert.match(createTicket, /badgeTxt: booking\.time \? 'Booking' : ''/);
  assert.match(bookingCss, /\.queue-table td:nth-child\(3\)::before \{ content: "Hour"; \}/);
  assert.match(bookingCss, /\.queue-table td:nth-child\(4\)::before \{ content: "Customer group"; \}/);
  assert.match(bookingCss, /\.queue-table td:nth-child\(6\)::before \{ content: "Tech"; \}/);
  assert.match(bookingCss, /\.queue-table td:nth-child\(8\)::before \{ content: "Elapsed"; \}/);
  assert.match(bookingCss, /\.queue-table td:nth-child\(10\)::before \{ content: "Note"; \}/);
});

test('Queue table mode stays full-width and is not constrained by the card row', () => {
  assert.match(html, /\[data-wait-list\]:has\(> \.wl-card\) \{[\s\S]*display: flex;[\s\S]*flex-wrap: wrap/);
  assert.match(html, /\[data-wait-list\] > \.booking-table-wrap \{[\s\S]*flex: 1 1 100%/);
  assert.doesNotMatch(html, /\[data-wait-list\][^{]*\{ display: grid/);
});

test('Queue single-ticket cards have a clear identity, details, note, status, and action hierarchy', () => {
  const card = html.match(/function renderSingleTicketCard\(w, now, selW\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(card, /class="wl-card queue-card/);
  assert.match(card, /ticketQueueCardHeadHtml\(w, badge/);
  assert.match(card, /ticketQueueCardDetailsHtml\(w/);
  assert.match(card, /ticketQueueCardNoteHtml\(w\)/);
  assert.match(html, /function ticketQueueCardIdentityHtml\(w, badge\) \{[\s\S]*queue-card-identity[\s\S]*queue-card-phone[\s\S]*ticketQueueCardGroupHtml\(w\)/);
  assert.match(html, /function ticketQueueCardDetailsHtml\(w, techExtra\) \{[\s\S]*queue-card-details[\s\S]*queue-card-service[\s\S]*queue-card-tech[\s\S]*ticketTechHtml\(w, 'card'\)/);
  assert.match(html, /function ticketQueueCardHeadHtml\(w, badge, timerLabel, timerIcon, timerBad\) \{[\s\S]*queue-card-head[\s\S]*queue-card-status[\s\S]*ticketStatusBadge\(w\.status\)[\s\S]*ticketQueueCardWaitHtml\(timerLabel, timerIcon, timerBad\)/);
  assert.match(card, /queue-card-actions/);
});

test('Queue single-ticket cards retain their status actions and state class hooks', () => {
  const card = html.match(/function renderSingleTicketCard\(w, now, selW\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(card, /class="wl-card queue-card tappable/);
  assert.match(card, /class="wl-card queue-card rdy/);
  assert.match(card, /class="wl-card queue-card svc/);
  assert.match(card, /data-wtap="' \+ w\.id/);
  assert.match(card, /data-wstart="' \+ w\.id/);
  assert.match(card, /data-wswap="' \+ w\.id/);
  assert.match(card, /data-wdone="' \+ w\.id/);
  assert.match(card, /data-wpay="' \+ esc\(w\.orderId\)/);
  assert.match(card, /data-wcancel="' \+ w\.id/);
  assert.match(card, /late/);
  assert.match(card, /appt/);
});

test('Ready and service queue cards do not add a heavy border accent', () => {
  const readyRule = html.match(/\.queue-card\.rdy \{[^}]*\}/)?.[0] || '';
  const serviceRule = html.match(/\.queue-card\.svc \{[^}]*\}/)?.[0] || '';
  assert.doesNotMatch(readyRule, /border/);
  assert.doesNotMatch(serviceRule, /border/);
});

test('Queue card CSS wraps content safely on narrow screens', () => {
  assert.match(html, /\.queue-card \{[\s\S]*min-width:\s*0/);
  assert.match(html, /\.queue-card-head \{[\s\S]*min-width:\s*0/);
  assert.match(html, /\.queue-card-note \{[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(html, /\.queue-card-actions \{[\s\S]*flex-wrap:\s*wrap/);
  assert.match(html, /@media \(max-width: 640px\) \{[\s\S]*\.queue-card-actions/);
});

test('Queue card identity stacks name, phone, and customer-group tags as three separate rows', () => {
  const identity = html.match(/function ticketQueueCardIdentityHtml\(w, badge\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(identity, /<div class="wl-name">' \+ esc\(w\.name\) \+ '<\/div>/);
  assert.match(identity, /<div class="queue-card-phone">[\s\S]*ticketQueueCardGroupHtml\(w\)/);
  assert.match(html, /function ticketQueueCardGroupHtml\(w\) \{[\s\S]*ticketCustomerGroupHtml\(w\)/);
  assert.match(html, /\.queue-card \.queue-customer-group \{[\s\S]*margin-top: 4px/);
});

test('Queue cards use a flexbox column layout (no CSS grid) with an unbordered actions row', () => {
  assert.match(html, /\.queue-card \{[\s\S]*display: flex;[\s\S]*flex-direction: column;[\s\S]*padding: 12px/);
  assert.doesNotMatch(html, /\.queue-card \{[^}]*display: grid/);
  assert.doesNotMatch(html, /\.queue-card-head \{[^}]*grid-column/);
  assert.doesNotMatch(html, /\.queue-card-note \{[^}]*grid-column/);
  assert.doesNotMatch(html, /\.queue-card-actions \{[^}]*grid-column/);
  const actionsRule = html.match(/\.queue-card-actions \{[^}]*\}/)?.[0] || '';
  assert.match(actionsRule, /justify-content: flex-start/);
  assert.doesNotMatch(actionsRule, /border/);
});

test('Queue card child rows fill the card and stay left-aligned', () => {
  const headRule = html.match(/\.queue-card-head \{[^}]*\}/)?.[0] || '';
  const identityRule = html.match(/\.queue-card-identity \{[^}]*\}/)?.[0] || '';
  const statusRule = html.match(/\.queue-card-status \{[^}]*\}/)?.[0] || '';
  const metaRule = html.match(/\.queue-card-meta \{[^}]*\}/)?.[0] || '';
  const metaItemRule = html.match(/\.queue-card-tech, \.queue-card-booking \{[^}]*\}/)?.[0] || '';
  const actionsRule = html.match(/\.queue-card-actions \{[^}]*\}/)?.[0] || '';

  assert.match(html, /\.queue-card > :not\(\.queue-card-note\) \{[\s\S]*width: 100%;[\s\S]*min-width: 0/);
  assert.match(headRule, /flex-direction: row/);
  assert.match(headRule, /flex-wrap: wrap/);
  assert.doesNotMatch(headRule, /flex-direction: column/);
  assert.match(headRule, /align-items: flex-start/);
  assert.match(headRule, /justify-content: flex-start/);
  assert.doesNotMatch(headRule, /space-between/);
  assert.match(identityRule, /flex: 1 1 0/);
  assert.match(identityRule, /min-width: 0/);
  assert.match(statusRule, /flex-direction: column/);
  assert.match(statusRule, /flex: 0 0 auto/);
  assert.match(statusRule, /max-width: 100%/);
  assert.match(statusRule, /align-items: flex-start/);
  assert.match(statusRule, /justify-content: flex-start/);
  assert.doesNotMatch(statusRule, /(?:^|[;{]\s*)width: 100%/);
  assert.doesNotMatch(statusRule, /flex-direction: row/);
  assert.doesNotMatch(statusRule, /align-items: flex-end/);
  assert.match(metaRule, /width: 100%/);
  assert.match(metaRule, /flex-direction: row/);
  assert.match(metaRule, /align-items: center/);
  assert.match(metaRule, /justify-content: space-between/);
  assert.match(metaRule, /flex-wrap: wrap/);
  assert.doesNotMatch(metaRule, /flex-direction: column/);
  assert.doesNotMatch(metaRule, /justify-content: flex-start/);
  assert.match(metaItemRule, /max-width: 100%/);
  assert.match(metaItemRule, /min-width: 0/);
  assert.doesNotMatch(metaItemRule, /(?:^|[;{]\s*)width: 100%/);
  assert.match(actionsRule, /width: 100%/);
  assert.match(actionsRule, /justify-content: flex-start/);
});

test('Queue card notes size to their content without overflowing the card', () => {
  assert.match(html, /\.queue-card-note \{[\s\S]*align-self: flex-start;[\s\S]*width: fit-content;[\s\S]*max-width: 100%/);
});

test('Queue card identity does not duplicate the combined customer-group badge', () => {
  const identity = html.match(/function ticketQueueCardIdentityHtml\(w, badge\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(identity, /ticketQueueCardGroupHtml\(w\)/);
  assert.doesNotMatch(identity, /badge \+ ticketQueueCardGroupHtml\(w\)/);
  assert.doesNotMatch(identity, /<div class="wl-name">[\s\S]*badge/);
});

test('Queue card status chip and elapsed time remain separate synchronized elements', () => {
  assert.match(html, /function ticketQueueCardWaitHtml\(timerLabel, timerIcon, timerBad\) \{[\s\S]*class="wl-wait/);
  assert.match(html, /function ticketQueueCardHeadHtml\(w, badge, timerLabel, timerIcon, timerBad\) \{[\s\S]*ticketStatusBadge\(w\.status\)[\s\S]*ticketQueueCardWaitHtml\(timerLabel, timerIcon, timerBad\)/);
  assert.match(html, /\.wl-wait \{[\s\S]*display: inline-flex/);
  assert.doesNotMatch(html, /queue-card-status-chip/);
});

test('Queue card mobile spacing remains compact after details CSS removal', () => {
  assert.match(html, /@media \(max-width: 640px\) \{[\s\S]*\.queue-card \{[\s\S]*padding: 8px/);
});

test('Queue card actions stay a single full-width row regardless of button count', () => {
  assert.match(html, /\.queue-card-actions \{[\s\S]*justify-content: flex-start;[\s\S]*flex-wrap: wrap/);
  assert.doesNotMatch(html, /\.queue-card:has\(\.queue-card-actions/);
  assert.doesNotMatch(html, /\.queue-card:not\(:has\(\.queue-card-note\)\)/);
});

test('Queue card action buttons keep intrinsic widths instead of stretching', () => {
  assert.match(html, /\.queue-card-actions \.pos-btn \{[\s\S]*flex: 0 0 auto;[\s\S]*width: auto/);
  assert.match(html, /\.queue-card-actions \.x-btn \{[\s\S]*width: auto;[\s\S]*min-width: 30px/);
  assert.doesNotMatch(html, /\.queue-card-actions \.pos-btn \{ flex: 1 1 auto/);
});

test('Queue cards keep responsive flex columns while their child rows fill each card', () => {
  assert.match(html, /\[data-wait-list\]:has\(> \.wl-card\) \{[\s\S]*display: flex;[\s\S]*flex-wrap: wrap/);
  assert.match(html, /\[data-wait-list\] > \.wl-card \{[\s\S]*flex: 0 0 calc\(25% - 9px\)[\s\S]*min-width: 0[\s\S]*margin-bottom: 0/);
  assert.match(html, /@media \(max-width: 1199px\) \{[\s\S]*\[data-wait-list\] > \.wl-card \{[\s\S]*flex-basis: calc\(33\.333% - 8px\)/);
  assert.match(html, /@media \(max-width: 900px\) \{[\s\S]*\[data-wait-list\] > \.wl-card \{[\s\S]*flex-basis: calc\(50% - 6px\)/);
  assert.match(html, /@media \(max-width: 640px\) \{[\s\S]*\[data-wait-list\] > \.wl-card \{[\s\S]*flex-basis: 100%/);
  assert.doesNotMatch(html, /\[data-wait-list\] > \.wl-card \{[^}]*flex: 1 1 100%/);
  const baseQueueCardRule = html.match(/^\s*\.queue-card \{[^}]*\}/m)?.[0] || '';
  assert.doesNotMatch(baseQueueCardRule, /(?:^|[;{]\s*)width:\s*100%/);
  assert.doesNotMatch(html, /\[data-wait-list\][^{]*\{ display: grid/);
});

test('Queue card details have no dedicated CSS rules', () => {
  const inlineCss = html.match(/<style[^>]*>[\s\S]*?<\/style>/)?.[0] || '';
  assert.doesNotMatch(inlineCss, /\.queue-card-details\b/);
});

test('Queue card notes stay on one line and truncate long text', () => {
  assert.match(html, /\.queue-card-note span \{[^}]*overflow: hidden;[^}]*white-space: nowrap;[^}]*text-overflow: ellipsis/);
});

test('Queue card status stays on one line for every item', () => {
  assert.match(html, /\.queue-card-status \{[\s\S]*flex-wrap: nowrap;[\s\S]*white-space: nowrap/);
  assert.match(html, /@media \(max-width: 640px\) \{[\s\S]*\.queue-card-status \{[\s\S]*flex-wrap: nowrap;[\s\S]*white-space: nowrap/);
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

test('Check-in request inbox has App/QR sample data and a Card/Table view switch', () => {
  assert.match(html, /var CHECKINQ = \[/);
  assert.match(html, /src: '📱 App/);
  assert.match(html, /src: '🌐 QR/);
  assert.match(html, /data-ciq-view-target="card"/);
  assert.match(html, /data-ciq-view-target="table"/);
  assert.match(html, /var ciqViewMode = 'card';/);
  assert.match(html, /function ciqCardHtml\(r\) \{/);
  assert.match(html, /function renderCiqTable\(items\) \{/);
  assert.match(html, /html\('\[data-ciq-list\]', ciqViewMode === 'table' \? renderCiqTable\(CHECKINQ\) : CHECKINQ\.map\(ciqCardHtml\)\.join\(''\)\);/);
});

test('Check-in request Card/Table renderers preserve the same request actions and clean service labels', () => {
  const actions = html.match(/function ciqActionsHtml\(r\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const card = html.match(/function ciqCardHtml\(r\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const table = html.match(/function renderCiqTable\(items\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(actions, /data-ciq-ok/);
  assert.match(actions, /data-ciq-no/);
  assert.match(card, /ciqActionsHtml\(r\)/);
  assert.match(table, /ciqActionsHtml\(r\)/);
  assert.match(html, /function posServiceDisplayName\(value\) \{/);
  assert.match(html, /posServiceDisplayName\(r\.svc\)/);
});

test('Queue shows App/QR Anyone requests as unassigned tickets with a Choose tech action', () => {
  const acceptHandler = html.match(/\/\* check-in requests \*\/[\s\S]*?\/\* access requests \*\//)?.[0] || '';
  const ticketTech = html.match(/function ticketTechHtml\(w, variant\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const ticketActions = html.match(/function ticketActionsHtml\(w\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const singleCard = html.match(/function renderSingleTicketCard\(w, now, selW\) \{[\s\S]*?if \(w\.status === 'ready'\)/)?.[0] || '';
  const table = html.match(/function renderTicketsTable\(groups, now\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const groupCard = html.match(/function renderTicketGroupCard\(g, now, selW\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const swapModal = html.match(/<div class="sms-modal" data-swap-tech-modal[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)?.[0] || '';
  const openSwap = html.match(/function openSwapTechModal\(wid\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const spotlight = html.match(/function spotlightQueueTicket\(wid\) \{[\s\S]*?\n      \}/)?.[0] || '';

  assert.match(html, /name: 'Olivia Park'[\s\S]{0,120}reqTech: null/);
  assert.match(acceptHandler, /WAITLIST\.unshift\(nw\);/);
  assert.match(acceptHandler, /techId: null, reqTech: r\.reqTech \|\| null/);
  assert.match(acceptHandler, /spotlightQueueTicket\(nw\.id\);/);
  assert.match(ticketTech, /is-anyone/);
  assert.match(ticketTech, />Anyone<\/span>/);
  assert.match(ticketActions, /ticketNeedsTechPicker\(w\)/);
  assert.match(ticketActions, /data-wswap/);
  assert.match(ticketActions, /Choose tech/);
  assert.match(singleCard, /ticketNeedsTechPicker\(w\)/);
  assert.match(singleCard, /data-queue-ticket-id/);
  assert.match(table, /data-queue-ticket-id/);
  assert.match(groupCard, /data-queue-ticket-id/);
  assert.match(singleCard, /data-wswap/);
  assert.match(singleCard, /Choose tech/);
  assert.match(spotlight, /fSel = wid/);
  assert.match(spotlight, /ticketsFilter = 'waiting'/);
  assert.match(spotlight, /activateTab\('tickets'\)/);
  assert.match(spotlight, /scrollIntoView/);
  assert.match(swapModal, /data-swap-tech-title-text/);
  assert.match(swapModal, /data-swap-tech-copy-text/);
  assert.match(openSwap, /w\.techId \? 'Swap technician' : 'Choose technician'/);
  assert.match(openSwap, /w\.techId \? 'Choose a free technician to take over' : 'Choose a free technician for'/);
});

test('Check-in request cards use the Queue card hierarchy with request content', () => {
  const card = html.match(/function ciqCardHtml\(r\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(card, /class="wl-card queue-card/);
  assert.match(card, /queue-card-head/);
  assert.match(card, /queue-card-identity/);
  assert.match(card, /queue-card-status/);
  assert.match(card, /queue-card-details/);
  assert.match(card, /queue-card-service/);
  assert.match(card, /queue-card-meta/);
  assert.match(card, /queue-card-tech/);
  assert.match(card, /queue-card-booking/);
  assert.match(card, /queue-card-note/);
  assert.match(card, /queue-card-actions/);
  assert.match(card, /ciqActionsHtml\(r\)/);
  assert.match(card, /esc\(r\.name\)/);
  assert.match(card, /esc\(r\.src\)/);
  assert.match(card, /posServiceDisplayName\(r\.svc\)/);
  assert.match(card, /techName\(r\.reqTech\)/);
  assert.match(card, /custProfHtml\(r\.name\)/);
  assert.doesNotMatch(card, /wl-info/);
  assert.doesNotMatch(card, /wl-actions/);
});

test('Check-in booking ETA cards use the Queue card hierarchy with booking content', () => {
  const card = html.match(/function etaCardHtml\(x\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(card, /class="wl-card queue-card/);
  assert.match(card, /queue-card-head/);
  assert.match(card, /queue-card-identity/);
  assert.match(card, /queue-card-status/);
  assert.match(card, /queue-card-details/);
  assert.match(card, /queue-card-service/);
  assert.match(card, /queue-card-meta/);
  assert.match(card, /queue-card-tech/);
  assert.match(card, /queue-card-booking/);
  assert.match(card, /queue-card-actions/);
  assert.match(card, /etaStatusChipHtml\(e\)/);
  assert.match(card, /etaActionHtml\(x\)/);
  assert.match(card, /esc\(b\.name\)/);
  assert.match(card, /esc\(b\.phone \|\| 'No phone'\)/);
  assert.match(card, /b\.time/);
  assert.match(card, /b\.source/);
  assert.match(card, /posServiceDisplayName\(b\.svc\)/);
  assert.match(card, /techName\(b\.techId\)/);
  assert.match(card, /custProfHtml\(b\.name\)/);
  assert.match(card, /live-map/);
  assert.doesNotMatch(card, /wl-info/);
  assert.doesNotMatch(card, /wl-actions/);
});

test('Check-in ETA booking view keeps appointment source data', () => {
  const bookingView = html.match(/function posBookingView\(record\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(bookingView, /source: record\.source \|\| 'front-desk'/);
});

test('Check-in card modes use the same responsive flex columns as Queue', () => {
  ['ciq', 'eta'].forEach((kind) => {
    assert.match(html, new RegExp('\\[data-' + kind + '-list\\]:has\\(> \\.queue-card\\) \\{[\\s\\S]*display: flex;[\\s\\S]*flex-wrap: wrap'));
    assert.match(html, new RegExp('\\[data-' + kind + '-list\\] > \\.queue-card \\{[\\s\\S]*flex: 0 0 calc\\(25% - 9px\\);[\\s\\S]*max-width: calc\\(25% - 9px\\);[\\s\\S]*margin-bottom: 0'));
    assert.match(html, new RegExp('\\[data-' + kind + '-list\\] > \\.booking-table-wrap \\{[\\s\\S]*flex: 1 1 100%;[\\s\\S]*width: 100%'));
    assert.match(html, new RegExp('@media \\(max-width: 1199px\\) \\{[\\s\\S]*\\[data-' + kind + '-list\\] > \\.queue-card \\{ flex-basis: calc\\(33\\.333% - 8px\\); max-width: calc\\(33\\.333% - 8px\\); \\}'));
    assert.match(html, new RegExp('@media \\(max-width: 900px\\) \\{[\\s\\S]*\\[data-' + kind + '-list\\] > \\.queue-card \\{ flex-basis: calc\\(50% - 6px\\); max-width: calc\\(50% - 6px\\); \\}'));
    assert.match(html, new RegExp('@media \\(max-width: 640px\\) \\{[\\s\\S]*\\[data-' + kind + '-list\\]:has\\(> \\.queue-card\\) \\{ gap: 8px; \\}[\\s\\S]*\\[data-' + kind + '-list\\] > \\.queue-card \\{ flex-basis: 100%; max-width: 100%; \\}'));
  });
});

test('POS normalizes service names in the check-in service picker too', () => {
  assert.match(html, /function posServiceDisplayName\(value\) \{/);
  assert.match(html, /esc\(posServiceDisplayName\(t\.serviceName\)\)/);
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

test('Tech access request cards use the Queue card hierarchy with access-request content', () => {
  const card = html.match(/function arqCardHtml\(row\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(card, /class="wl-card queue-card/);
  assert.match(card, /queue-card-head/);
  assert.match(card, /queue-card-identity/);
  assert.match(card, /queue-card-status/);
  assert.match(card, /queue-card-details/);
  assert.match(card, /queue-card-service/);
  assert.match(card, /queue-card-meta/);
  assert.match(card, /queue-card-tech/);
  assert.match(card, /queue-card-booking/);
  assert.match(card, /queue-card-actions/);
  assert.match(card, /arqActionsHtml\(r, t\)/);
  assert.match(card, /TECH/);
  assert.match(card, /esc\(t\.name\)/);
  assert.match(card, /w\.id/);
  assert.match(card, /esc\(w\.name\)/);
  assert.match(card, /posServiceDisplayName\(w\.svc \|\| ''\)/);
  assert.match(card, /techName\(w\.techId\)/);
  assert.match(card, /arqSkillHtml\(req, ok\)/);
  assert.doesNotMatch(card, /bi-brush/);
  assert.doesNotMatch(card, /wl-info/);
  assert.doesNotMatch(card, /wl-actions/);
});

test('Tech access request card mode uses the same responsive flex columns as Queue', () => {
  assert.match(html, /\[data-arq-list\]:has\(> \.queue-card\) \{[\s\S]*display: flex;[\s\S]*flex-wrap: wrap/);
  assert.match(html, /\[data-arq-list\] > \.queue-card \{[\s\S]*flex: 0 0 calc\(25% - 9px\);[\s\S]*max-width: calc\(25% - 9px\);[\s\S]*margin-bottom: 0/);
  assert.match(html, /\[data-arq-list\] > \.booking-table-wrap \{[\s\S]*flex: 1 1 100%;[\s\S]*width: 100%/);
  assert.match(html, /@media \(max-width: 1199px\) \{[\s\S]*\[data-arq-list\] > \.queue-card \{ flex-basis: calc\(33\.333% - 8px\); max-width: calc\(33\.333% - 8px\); \}/);
  assert.match(html, /@media \(max-width: 900px\) \{[\s\S]*\[data-arq-list\] > \.queue-card \{ flex-basis: calc\(50% - 6px\); max-width: calc\(50% - 6px\); \}/);
  assert.match(html, /@media \(max-width: 640px\) \{[\s\S]*\[data-arq-list\]:has\(> \.queue-card\) \{ gap: 8px; \}[\s\S]*\[data-arq-list\] > \.queue-card \{ flex-basis: 100%; max-width: 100%; \}/);
});

test('Customers table uses 7 focused columns with a separate Source chip, and Notes stay in the profile modal', () => {
  assert.match(html, /var CUST_SEG_META = \{/);
  assert.match(html, /var CUST_SRC_META = \{/);
  assert.match(html, /var CUST_TYPES = \[/);
  assert.match(html, /<th scope="col">Customer<\/th><th scope="col">Status<\/th><th scope="col">Source<\/th><th scope="col">Activity<\/th><th scope="col">regular tech \(thợ ruột\)<\/th>' \+\s*\n\s*'<th scope="col">Tags<\/th><th scope="col">Action<\/th>/);
  assert.match(html, /function custTechSummaryHtml\(c\) \{/);
  assert.match(html, /function custTagsSummaryHtml\(c\) \{/);
  const tableRow = html.match(/function custTableRowHtml\(c\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(tableRow, /var seg = CUST_SEG_META\[c\.seg\];/);
  assert.match(tableRow, /'<td>' \+ custSrcBadgeHtml\(c\) \+ '<\/td>' \+/);
  assert.match(tableRow, /'<td>' \+ custTechSummaryHtml\(c\) \+ '<\/td>' \+/);
  assert.match(tableRow, /'<td>' \+ custTagsSummaryHtml\(c\) \+ '<\/td>' \+/);
  assert.doesNotMatch(tableRow, /custNotesSummaryHtml\(c\)/);
  // Tag/note/regular-tech editing is no longer inline in the table row — it moved to the profile
  // modal (View) once the table was reduced to focused columns.
  assert.doesNotMatch(tableRow, /custTagsEditorHtml\(c, ci\)/);
  assert.doesNotMatch(tableRow, /custNoteLevelsHtml\(c, ci\)/);
  assert.doesNotMatch(tableRow, /custPrefTechHtml\(c, ci\)/);
  const cardRow = html.match(/function custResultRowHtml\(c\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(cardRow, /class="cust-card-name"/);
  assert.match(cardRow, /custTagsSummaryHtml\(c\)/);
  assert.doesNotMatch(cardRow, /custNotesSummaryHtml\(c\)/);
  assert.match(cardRow, /custSrcBadgeHtml\(c\)/);
  assert.doesNotMatch(cardRow, /custFitTechs\(c\)/);
  assert.match(cardRow, /Regular tech: ' \+ custTechSummaryHtml\(c\)/);
  assert.match(html, /function custSrcBadgeHtml\(c\) \{/);
  assert.match(html, /function custFitTechs\(c\) \{/);
  const fitFn = html.match(/function custFitTechs\(c\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(fitFn, /\(t\.fit \|\| \[\]\)\.some\(function \(f\) \{ return \(c\.tags \|\| \[\]\)\.indexOf\(f\) !== -1 \|\| \(f === 'VIP' && c\.seg === 'vip'\); \}\);/);
  assert.match(html, /function renderCustSegChips\(\) \{/);
});

test('POS title row opens the requested external kiosk HTML', () => {
  assert.match(html, /<a class="pos-btn pos-btn-sm" href="https:\/\/pos-nexoratouch\.vercel\.app\/mockups\/phase1\/kiosk\.html" target="_blank" rel="noopener noreferrer"><i class="bi bi-tablet" aria-hidden="true"><\/i> Kiosk<\/a>/);
});

test('Management keeps Customers out while adding a Services subtab for menu management', () => {
  assert.match(html, /data-mg-subtab="overview"/);
  assert.match(html, /data-mg-subtab="payroll"/);
  assert.match(html, /data-mg-subtab="services"/);
  assert.match(html, /data-mg-subtab="staff"/);
  assert.match(html, /data-mg-subtab="catalog"/);
  assert.doesNotMatch(html, /data-mg-subtab="customers"/);
  assert.match(html, /var MG_SUBTABS = \['overview', 'payroll', 'services', 'staff', 'catalog'\];/);
  const sections = html.match(/function mgSubtabSections\(ps\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(sections, /overview: function \(\) \{ return mgKpisHtml\(ps\) \+ '<div class="mg-split">' \+ mgRevenueHtml\(\) \+ mgPayrollHtml\(ps\) \+ '<\/div>' \+ mgPerfHtml\(ps\); \}/);
  assert.match(sections, /payroll: function \(\) \{ return mgOwnerHtml\(ps\) \+ mgSmartHtml\(ps\) \+ mgPayoutHtml\(ps\); \}/);
  assert.match(sections, /services: function \(\) \{ return mgServicesHtml\(\); \}/);
  assert.match(sections, /staff: function \(\) \{ return mgStaffHtml\(\) \+ mgRolesHtml\(\) \+ mgLogHtml\(\); \}/);
  assert.match(sections, /catalog: function \(\) \{ return mgSkillsHtml\(\) \+ mgSvcSkillHtml\(\); \}/);
  assert.doesNotMatch(sections, /customers:/);
  assert.doesNotMatch(html, /function mgCustHtml\(\)/);
  assert.match(html, /var mgTab = e\.target\.closest\('\[data-mg-subtab\]'\);/);
});

test('Customer profile keeps the shared tag/note/regular-tech editors after Management loses its duplicate Customers subtab', () => {
  assert.match(html, /function toggleCustTag\(ci, tag\) \{/);
  assert.match(html, /function saveCustNoteLevel\(ci, level, value\) \{/);
  assert.match(html, /function custNoteLevelsHtml\(c, ci\) \{/);
  const notesFn = html.match(/function custNoteLevelsHtml\(c, ci\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(notesFn, /NOTE_LEVELS\.map\(function \(l\) \{/);
  assert.match(notesFn, /data-mg-note="' \+ ci \+ '\|' \+ l\[0\] \+ '"/);
  // Note-level labels and the Fit chip use the bi- icon library instead of raw emoji.
  assert.match(html, /var NOTE_LEVELS = \[\s*\n\s*\['owner', '<i class="bi bi-lock-fill" aria-hidden="true"><\/i> Owner only', 'var\(--nexora-danger\)'\],\s*\n\s*\['staff', '<i class="bi bi-people-fill" aria-hidden="true"><\/i> Techs \/ front desk', 'var\(--nexora-warning\)'\],\s*\n\s*\['customer', '<i class="bi bi-phone" aria-hidden="true"><\/i> Guest sees', 'var\(--nexora-success\)'\]/);
  const fitHtmlFn = html.match(/function custFitHtml\(c\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(fitHtmlFn, /<i class="bi bi-person-check-fill" aria-hidden="true"><\/i>/);
  assert.doesNotMatch(fitHtmlFn, /🤝/);
  // Customer-panel handlers own the profile edits; Management has no duplicate customer surface.
  assert.match(html, /var custTag = e\.target\.closest\('\[data-mg-tag\]'\);\s*\n\s*if \(custTag && e\.target\.closest\('\[data-pos-panel="customers"\], \[data-cust-profile-modal\]'\)\) \{/);
  assert.match(html, /var custNote = e\.target\.closest\('\[data-mg-note\]'\);\s*\n\s*if \(custNote && e\.target\.closest\('\[data-pos-panel="customers"\], \[data-cust-profile-modal\]'\)\) \{/);
});

test('Customer profile modal (View) still edits Regular tech, Tags, and Notes in place', () => {
  const profileFn = html.match(/function renderCustProfileModal\(c\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(profileFn, /segBadge \+ ' ' \+ custSrcBadgeHtml\(c\) \+ ' ' \+ inactiveBadge/);
  assert.match(profileFn, /custNoteLevelsHtml\(c, ci\)/);
  const insightsFn = html.match(/function custInsightsCardHtml\(c, ci\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(insightsFn, /custPrefTechChipsHtml\(c, ci\)/);
  assert.match(html, /function custFrequentTechIds\(c\) \{/);
  const prefTechChipsFn = html.match(/function custPrefTechChipsHtml\(c, ci\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(prefTechChipsFn, /custFrequentTechIds\(c\)/);
  assert.match(prefTechChipsFn, /class="cust-pref-tech-chip/);
  assert.match(prefTechChipsFn, /<span class="cust-pref-tech-chip/);
  assert.doesNotMatch(prefTechChipsFn, /<button class="cust-pref-tech-chip/);
  assert.match(prefTechChipsFn, /bi-person/);
  const prefsFn = html.match(/function custPrefsCardHtml\(c, ci\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(prefsFn, /data-mg-tag="' \+ ci \+ '\|' \+ tag \+ '"/);
  const notesFn = html.match(/function custNoteLevelsHtml\(c, ci\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  assert.match(notesFn, /data-mg-note="' \+ ci \+ '\|' \+ l\[0\] \+ '"/);
  assert.match(html, /toggleCustTag\(\+ctPt\[0\], ctPt\[1\]\);\s*\n\s*renderCustomersTab\(\);\s*\n\s*refreshOpenCustProfile\(\+ctPt\[0\]\);/);
  assert.doesNotMatch(html, /data-mg-pref-chip/);
  assert.doesNotMatch(html, /setCustPrefTech\(/);
});
