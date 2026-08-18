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

test('Queue Checkout opens the shared checkout page instead of charging in place', () => {
  const checkoutHelper = html.match(/function openQueueCheckout\(orderKey\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const pay = html.match(/\/\* 💳 checkout the order[\s\S]*?\/\* ✕ remove/)?.[0] || '';

  assert.match(checkoutHelper, /WAITLIST\.filter\(function \(x\) \{ return x\.orderId === orderKey && ticketOpen\(x\); \}\)/);
  assert.match(checkoutHelper, /persistQueueCheckoutSnapshot\(snapshot\)/);
  assert.match(checkoutHelper, /window\.location\.href = queueCheckoutUrl\(snapshot\)/);
  assert.match(pay, /openQueueCheckout\(pw\.getAttribute\('data-wpay'\)\)/);
  assert.doesNotMatch(pay, /SALES\.push/);
  assert.doesNotMatch(pay, /x\.status = 'completed'/);
  assert.doesNotMatch(pay, /No items on this order yet/);
});

test('Queue tickets with a service name hydrate billable line items before Checkout', () => {
  const helper = html.match(/function queueItemsForService\(svc, techId\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const waitlistInit = html.match(/WAITLIST\.forEach\(function \(w\) \{[\s\S]*?\n      \}\);/)?.[0] || '';
  const acceptHandler = html.match(/\/\* check-in requests \*\/[\s\S]*?\/\* access requests \*\//)?.[0] || '';

  assert.match(html, /name: 'Lisa Trương'[\s\S]*svc: 'Acrylic — Full Set'/);
  assert.match(helper, /salonData\.findService\(salonCatalog, svc\)/);
  assert.match(helper, /return \[\{ name: name, price: price, techId: techId \|\| null, cat: cat \}\]/);
  assert.match(waitlistInit, /if \(!Array\.isArray\(w\.items\)\) w\.items = \[\]/);
  assert.match(waitlistInit, /if \(!w\.items\.length && w\.svc\) w\.items = queueItemsForService\(w\.svc, w\.techId \|\| w\.reqTech \|\| null\)/);
  assert.match(waitlistInit, /if \(!w\.durationMin && w\.svc\) w\.durationMin = queueDurationForService\(w\.svc\)/);
  assert.match(acceptHandler, /durationMin: queueDurationForService\(r\.svc\)/);
  assert.match(acceptHandler, /items: queueItemsForService\(r\.svc, r\.reqTech \|\| null\)/);
});

test('Queue payment actions are labelled Checkout while retaining the payment action hook', () => {
  const singleCard = html.match(/function renderSingleTicketCard\(w, now, selW\) \{[\s\S]*?\n      \}\n      \/\/ Multi-ticket order card/)?.[0] || '';
  const groupCard = html.match(/function renderTicketGroupCard\(g, now, selW\) \{[\s\S]*?\n      \}\n      function renderFloor/)?.[0] || '';

  assert.match(singleCard, /perf-cta-btn-success-fill" data-wpay="' \+ esc\(w\.orderId\)[\s\S]{0,160}Checkout<\/button>/);
  assert.match(singleCard, /perf-cta-btn-success" data-wpay="' \+ esc\(w\.orderId\)[\s\S]{0,160}Checkout<\/button>/);
  assert.match(groupCard, /queue-action-pay" data-wpay="' \+ esc\(g\.orderId\)[\s\S]{0,160}Checkout<\/button>/);
  assert.doesNotMatch(singleCard, /data-wpay="' \+ esc\(w\.orderId\)[\s\S]{0,160}Charge<\/button>/);
  assert.doesNotMatch(groupCard, /data-wpay="' \+ esc\(g\.orderId\)[\s\S]{0,160}Charge<\/button>/);
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

test('Queue service tickets label the swap action as Change tech', () => {
  const ticketActions = html.match(/function ticketActionsHtml\(w\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const singleCard = html.match(/function renderSingleTicketCard\(w, now, selW\) \{[\s\S]*?\n      \}\n      \/\/ Multi-ticket order card/)?.[0] || '';

  assert.match(ticketActions, /data-wswap[\s\S]{0,140}title="Change tech"[\s\S]{0,80}Change tech<\/button>/);
  assert.match(singleCard, /data-wswap[\s\S]{0,140}title="Change tech"[\s\S]{0,80}Change tech<\/button>/);
  assert.doesNotMatch(ticketActions, /> Swap<\/button>/);
  assert.doesNotMatch(singleCard, /> Swap<\/button>/);
});

test('Queue waiting tickets with a technician also expose Change tech before service starts', () => {
  const ticketActions = html.match(/function ticketActionsHtml\(w\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const singleCard = html.match(/function renderSingleTicketCard\(w, now, selW\) \{[\s\S]*?\n      \}\n      \/\/ Multi-ticket order card/)?.[0] || '';

  assert.match(ticketActions, /data-wstart[\s\S]*?<\/button>' \+\n\s*'<button class="pos-btn pos-btn-sm queue-action-muted" data-wswap[\s\S]*?title="Change tech"[\s\S]*?Change tech<\/button>' \+\n\s*'<button class="pos-btn pos-btn-sm queue-action-danger" data-wcancel/);
  assert.match(singleCard, /class="perf-cta-btn perf-cta-btn-primary" data-wstart/);
  assert.doesNotMatch(singleCard, /class="perf-cta-btn perf-cta-btn-primary" data-wswap[\s\S]{0,120}Assign tech/);
  assert.match(singleCard, /data-wstart[\s\S]*?<\/button>'\) \+\n\s*\(needsTechPicker \? '' : '<button class="perf-cta-btn perf-cta-btn-muted" data-wswap[\s\S]*?title="Change tech"[\s\S]*?Change tech<\/button>'\) \+\n\s*'<button class="perf-cta-btn perf-cta-btn-danger" data-wcancel/);
});

test('Assign tech keeps the ticket waiting and makes Start use the assigned technician', () => {
  const assignWaiting = html.match(/function assignWaitingTech\(w, tid\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const waitingStart = html.match(/function waitingStartTech\(w\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const ticketActions = html.match(/function ticketActionsHtml\(w\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const singleCard = html.match(/function renderSingleTicketCard\(w, now, selW\) \{[\s\S]*?\n      \}\n      \/\/ Multi-ticket order card/)?.[0] || '';
  const chooseSwap = html.match(/function chooseSwapTech\(tid\) \{[\s\S]*?\n      \}\n\n      document\.addEventListener/)?.[0] || '';
  const startHandler = html.match(/\/\* ▶ one-tap assign \*\/[\s\S]*?\/\* ⇄ swap tech \*\//)?.[0] || '';

  assert.match(assignWaiting, /w\.techId = tid/);
  assert.doesNotMatch(assignWaiting, /w\.status = 'service'/);
  assert.doesNotMatch(assignWaiting, /pageTech/);
  assert.match(waitingStart, /if \(w\.techId\) return techById\(w\.techId\)/);
  assert.match(waitingStart, /var requested = w\.reqTech && techById\(w\.reqTech\)/);
  assert.match(waitingStart, /if \(requested\) return requested/);
  assert.match(waitingStart, /return fAutoTech\(w\)/);
  assert.match(ticketActions, /var startTech = waitingStartTech\(w\)/);
  assert.match(ticketActions, /startTech \? esc\(startTech\.name\) : 'No tech'/);
  assert.match(singleCard, /var startTech = waitingStartTech\(w\)/);
  assert.match(singleCard, /startTech \? esc\(startTech\.name\) : 'No tech'/);
  assert.match(chooseSwap, /if \(w\.status === 'waiting'\) \{[\s\S]*assignWaitingTech\(w, tid\);[\s\S]*return;/);
  assert.match(startHandler, /var stech = sw && waitingStartTech\(sw\)/);
  assert.match(startHandler, /fAssign\(sw, stech\.id\)/);
});

test('Start button click is isolated from the change-tech modal route', () => {
  const modalHelper = html.match(/function serviceStartedModal\(w, t\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const startHandler = html.match(/\/\* ▶ one-tap assign \*\/[\s\S]*?\/\* ⇄ swap tech \*\//)?.[0] || '';
  const startIndex = html.indexOf("var st = e.target.closest('[data-wstart]')");
  const swapIndex = html.indexOf("var sp = e.target.closest('[data-wswap]')");
  const tapIndex = html.indexOf("var tap = e.target.closest('[data-wtap]')");

  assert.match(modalHelper, /Swal\.fire\(\{[\s\S]*title: 'Service started'/);
  assert.match(modalHelper, /text: escPlain\(w\.name\) \+ ' is now in service with ' \+ escPlain\(t\.name\)/);
  assert.ok(startIndex !== -1 && swapIndex !== -1 && startIndex < swapIndex, 'expected start route before change-tech route');
  assert.ok(tapIndex === -1 || startIndex < tapIndex, 'expected start route before card tap route');
  assert.match(startHandler, /if \(st\) \{[\s\S]*e\.preventDefault\(\);[\s\S]*e\.stopImmediatePropagation\(\);[\s\S]*fAssign\(sw, stech\.id\);[\s\S]*serviceStartedModal\(sw, stech\)/);
  assert.doesNotMatch(startHandler, /toast\(sw\.name \+ ' → ' \+ stech\.name\)/);
  assert.doesNotMatch(startHandler, /openSwapTechModal/);
});

test('Queue actions keep All selected and switch only specific filters before scrolling', () => {
  const followHelper = html.match(/function followQueueTicketAfterAction\(w, fallbackFilter\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const scrollHelper = html.match(/function scrollQueueTicketIntoView\(wid\) \{[\s\S]*?\n      \}/)?.[0] || '';
  const startHandler = html.match(/\/\* ▶ one-tap assign \*\/[\s\S]*?\/\* ⇄ swap tech \*\//)?.[0] || '';
  const doneHandler = html.match(/\/\* ✋ done \*\/[\s\S]*?\/\* 💳 charge/)?.[0] || '';
  const spotlight = html.match(/function spotlightQueueTicket\(wid\) \{[\s\S]*?\n      \}/)?.[0] || '';

  assert.match(followHelper, /if \(ticketsFilter !== 'all' && !ticketsMatchesFilter\(w\) && fallbackFilter\) ticketsFilter = fallbackFilter/);
  assert.match(followHelper, /fSel = w\.id/);
  assert.match(followHelper, /renderFloor\(\); renderManagement\(\);/);
  assert.match(followHelper, /if \(ticketsMatchesFilter\(w\)\) scrollQueueTicketIntoView\(w\.id\)/);
  assert.match(html, /\{ id: 'cancelled', label: 'Cancelled' \}/);
  assert.match(scrollHelper, /document\.querySelector\('\[data-queue-ticket-id="' \+ wid \+ '"\]'\)/);
  assert.match(scrollHelper, /scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\)/);
  assert.match(startHandler, /fAssign\(sw, stech\.id\);[\s\S]*followQueueTicketAfterAction\(sw, 'service'\)/);
  assert.match(doneHandler, /dw\.status = 'ready'/);
  assert.match(doneHandler, /followQueueTicketAfterAction\(dw, 'ready'\)/);
  assert.doesNotMatch(doneHandler, /ticketsFilter = 'ready'/);
  assert.match(spotlight, /scrollQueueTicketIntoView\(wid\)/);
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

test('Queue shows App/QR Anyone requests as unassigned tickets with an Assign tech action', () => {
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
  assert.match(ticketActions, /Assign tech/);
  assert.doesNotMatch(ticketActions, />Choose tech<\/button>/);
  assert.match(singleCard, /ticketNeedsTechPicker\(w\)/);
  assert.match(singleCard, /data-queue-ticket-id/);
  assert.match(table, /data-queue-ticket-id/);
  assert.match(groupCard, /data-queue-ticket-id/);
  assert.match(singleCard, /data-wswap/);
  assert.match(singleCard, /Assign tech/);
  assert.doesNotMatch(singleCard, />Choose tech<\/button>/);
  assert.match(spotlight, /fSel = wid/);
  assert.match(spotlight, /ticketsFilter = 'waiting'/);
  assert.match(spotlight, /activateTab\('tickets'\)/);
  assert.match(spotlight, /scrollQueueTicketIntoView\(wid\)/);
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

test('Tech access requests render below the Queue in Dispatch tab', () => {
  const ticketsPanel = html.match(/<section class="pos-panel" data-pos-panel="tickets"[\s\S]*?<!-- Quick note/)?.[0] || '';
  const queueIndex = ticketsPanel.indexOf('data-wait-list');
  const accessIndex = ticketsPanel.indexOf('data-arq-panel');

  assert.ok(queueIndex !== -1, 'expected Queue list in Dispatch tab');
  assert.ok(accessIndex > queueIndex, 'expected Tech access requests below Queue');
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

test('Management renders every section on one page without subtabs', () => {
  const managementPanel = html.match(/<section class="pos-panel" data-pos-panel="management"[\s\S]*?<\/section>/)?.[0] || '';
  const renderManagementSource = html.match(/function renderManagement\(\) \{[\s\S]*?\n {6}\}/)?.[0] || '';
  let rendered = '';
  const renderManagement = new Function(
    'payStats',
    'html',
    'mgKpisHtml',
    'mgRevenueHtml',
    'mgPayrollHtml',
    'mgPerfHtml',
    'mgOwnerHtml',
    'mgSmartHtml',
    'mgPayoutHtml',
    'mgServicesHtml',
    'mgStaffHtml',
    'mgRolesHtml',
    'mgLogHtml',
    'mgSkillsHtml',
    'mgSvcSkillHtml',
    renderManagementSource + '\nreturn renderManagement;'
  )(
    () => 'pay-stats',
    (selector, value) => { assert.equal(selector, '[data-mgmt-body]'); rendered = value; },
    (ps) => `kpis:${ps}|`,
    () => 'revenue|',
    (ps) => `payroll:${ps}|`,
    (ps) => `performance:${ps}|`,
    (ps) => `owner:${ps}|`,
    (ps) => `smart:${ps}|`,
    (ps) => `payout:${ps}|`,
    () => 'services|',
    () => 'staff|',
    () => 'roles|',
    () => 'log|',
    () => 'skills|',
    () => 'service-skills|'
  );

  renderManagement();

  assert.doesNotMatch(managementPanel, /data-mg-subtab|mg-subtabs/);
  assert.doesNotMatch(html, /\.mg-subtabs?\b|MG_SUBTABS|mgSubtabSections|var mgSubtab\b/);
  assert.equal(
    rendered,
    '<div class="pos-stack">kpis:pay-stats|<div class="mg-split">revenue|payroll:pay-stats|</div>performance:pay-stats|owner:pay-stats|smart:pay-stats|payout:pay-stats|services|staff|roles|log|skills|service-skills|</div>'
  );
  assert.doesNotMatch(html, /function mgCustHtml\(\)/);
});

function payrollFunctionSource(name) {
  const source = html.match(new RegExp('function ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n {6}\\}'))?.[0] || '';
  assert.ok(source, `expected ${name}() in the POS runtime`);
  return source;
}

function loadPayrollRuntime({ techs, history, todayKey, clockHours = () => 0 }) {
  return new Function(
    'TECHS',
    'MG_PAYROLL_HISTORY',
    'mgPayrollToday',
    'clockHours',
    payrollFunctionSource('payrollDateKey') + '\n' +
      payrollFunctionSource('buildDemoPayrollHistory') + '\n' +
      payrollFunctionSource('payrollStatsForDate') + '\n' +
      'return { payrollDateKey, buildDemoPayrollHistory, payrollStatsForDate };'
  )(techs, history, todayKey, clockHours);
}

function renderPayrollForDate({ selectedDate, history, todayKey, viewMode = 'card' }) {
  const techs = [
    { id: 't1', name: 'Kim', turns: 6, comm: 0.5, guar: 400 },
    { id: 't2', name: 'Andy', turns: 2, comm: 0.6, guar: 300 }
  ];
  return new Function(
    'TECHS',
    'MG_PAYROLL_HISTORY',
    'mgPayrollToday',
    'mgPayrollDate',
    'clockHours',
    'isOnShift',
    'mgPayrollViewMode',
    'money',
    'initials',
    'esc',
    payrollFunctionSource('payrollDateKey') + '\n' +
      payrollFunctionSource('payrollDateLabel') + '\n' +
      payrollFunctionSource('payrollStatsForDate') + '\n' +
      payrollFunctionSource('mgPayrollHtml') + '\n' +
      'return mgPayrollHtml;'
  )(
    techs,
    history,
    todayKey,
    selectedDate,
    (id) => id === 't1' ? 6.25 : 0,
    (id) => id === 't1',
    viewMode,
    (value) => '$' + Number(value).toFixed(2),
    (name) => name.slice(0, 1),
    (value) => String(value)
  )({ t1: { svc: 120, tip: 20 }, t2: { svc: 80, tip: 10 } });
}

test('Techs and pay seeds six prior dates with varying historical payroll totals', () => {
  const runtime = loadPayrollRuntime({ techs: [], history: {}, todayKey: '2026-08-18' });
  const history = runtime.buildDemoPayrollHistory(new Date(2026, 7, 18, 12, 0, 0));
  const keys = Object.keys(history).sort();
  const serviceTotals = keys.map((key) => Object.values(history[key]).reduce((sum, row) => sum + row.svc, 0));

  assert.deepEqual(keys, ['2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16', '2026-08-17']);
  assert.ok(new Set(serviceTotals).size > 1, 'expected historical dates to show different service totals');
});

test('Techs and pay uses live turns, hours, sales, and tips for today', () => {
  const runtime = loadPayrollRuntime({
    techs: [{ id: 't1', turns: 6 }, { id: 't2', turns: 2 }],
    history: {},
    todayKey: '2026-08-18',
    clockHours: (id) => id === 't1' ? 6.25 : 0
  });

  assert.deepEqual(runtime.payrollStatsForDate('2026-08-18', {
    t1: { svc: 120, tip: 20 },
    t2: { svc: 80, tip: 10 }
  }), {
    rows: {
      t1: { turns: 6, hours: 6.25, svc: 120, tip: 20 },
      t2: { turns: 2, hours: 0, svc: 80, tip: 10 }
    },
    hasActivity: true
  });
});

test('Techs and pay renders the selected historical date and its payroll metrics', () => {
  const output = renderPayrollForDate({
    selectedDate: '2026-08-17',
    todayKey: '2026-08-18',
    history: {
      '2026-08-17': {
        t1: { turns: 3, hours: 7.5, svc: 240, tip: 30 },
        t2: { turns: 1, hours: 4, svc: 90, tip: 12 }
      }
    }
  });

  assert.match(output, /Techs &amp; pay — Aug 17, 2026/);
  assert.match(output, /type="date" data-mg-payroll-date value="2026-08-17" max="2026-08-18"/);
  assert.match(output, />3 turns</);
  assert.match(output, />7\.5h</);
  assert.match(output, /Service \$<\/span><span class="perf-stat-value">\$240\.00/);
  assert.match(output, /Commission<\/span><span class="perf-stat-value">\$120\.00/);
  assert.match(output, /Tip<\/span><span class="perf-stat-value pos-good-text">\$30\.00/);
  assert.match(output, /Tech takes<\/span><span class="perf-stat-value">\$150\.00/);
  assert.match(html, /data-mg-payroll-date[\s\S]{0,240}renderManagement\(\)/);
});

test('Techs and pay shows an empty state for a date without payroll activity', () => {
  const output = renderPayrollForDate({ selectedDate: '2026-08-10', todayKey: '2026-08-18', history: {} });

  assert.match(output, /No payroll activity for this date/);
  assert.match(output, /Service \$<\/span><span class="perf-stat-value">\$0\.00/);
});

function performanceFunctionSource(name) {
  const source = html.match(new RegExp('function ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n {6}\\}'))?.[0] || '';
  assert.ok(source, `expected ${name}() in the POS runtime`);
  return source;
}

function loadPerformanceRuntime({
  techs = [],
  sales = [],
  techPerf = {},
  rebook = {},
  rework = {},
  history = {},
  currentWeek = '2026-08-16',
  daysDone = 5,
  daysWeek = 6
} = {}) {
  return new Function(
    'TECHS',
    'SALES',
    'TECH_PERF',
    'REBOOK',
    'REWORK',
    'MG_PERF_WEEK_HISTORY',
    'mgPerfCurrentWeek',
    'AD_DAYS_DONE',
    'AD_DAYS_WEEK',
    payrollFunctionSource('payrollDateKey') + '\n' +
      performanceFunctionSource('performanceWeekStartKey') + '\n' +
      performanceFunctionSource('performanceWeekRangeLabel') + '\n' +
      performanceFunctionSource('buildDemoPerformanceHistory') + '\n' +
      performanceFunctionSource('performanceWeekData') + '\n' +
      'return { performanceWeekStartKey, performanceWeekRangeLabel, buildDemoPerformanceHistory, performanceWeekData };'
  )(techs, sales, techPerf, rebook, rework, history, currentWeek, daysDone, daysWeek);
}

function renderPerformanceWeek(weekData, selectedWeek = '2025-12-28', viewMode = 'card') {
  const techs = [{ id: 't1', name: 'Kim Nguyen', guar: 900, comm: 0.6 }];
  return new Function(
    'TECHS',
    'TECH_PERF',
    'SALES',
    'REBOOK',
    'REWORK',
    'AD_DAYS_DONE',
    'AD_DAYS_WEEK',
    'mgPerfWeek',
    'mgPerfViewMode',
    'performanceWeekData',
    'performanceWeekRangeLabel',
    'money0',
    'pct',
    'initials',
    'esc',
    'weekDone',
    performanceFunctionSource('mgPerfHtml') + '\nreturn mgPerfHtml;'
  )(
    techs,
    {},
    [],
    {},
    {},
    5,
    6,
    selectedWeek,
    viewMode,
    () => weekData,
    () => 'Dec 28, 2025–Jan 3, 2026',
    (value) => '$' + Math.round(Number(value) || 0).toLocaleString('en-US'),
    (value) => Math.round((Number(value) || 0) * 100) + '%',
    () => 'KN',
    (value) => String(value),
    () => 0
  )({});
}

function renderOwnerWeek(weekData, selectedWeek = '2025-12-28', viewMode = 'card') {
  const techs = [{ id: 't1', name: 'Kim Nguyen', guar: 900, comm: 0.6, payModel: 'max' }];
  return new Function(
    'TECHS',
    'AD_DAYS_DONE',
    'AD_DAYS_WEEK',
    'mgPerfWeek',
    'mgOwnerViewMode',
    'performanceWeekData',
    'performanceWeekRangeLabel',
    'PAY_MODELS',
    'effComm',
    'money0',
    'money',
    'pct',
    'initials',
    'esc',
    'weekDone',
    performanceFunctionSource('techPayWeek') + '\n' +
      performanceFunctionSource('mgOwnerHtml') + '\nreturn mgOwnerHtml;'
  )(
    techs,
    5,
    6,
    selectedWeek,
    viewMode,
    () => weekData,
    () => 'Dec 28, 2025–Jan 3, 2026',
    { max: 'Guarantee ↔ commission (max)', baoshare: 'Guarantee + split over target', comm: 'Straight commission' },
    (tech) => tech.comm,
    (value) => '$' + Math.round(Number(value) || 0).toLocaleString('en-US'),
    (value) => '$' + Number(value || 0).toFixed(2),
    (value) => Math.round((Number(value) || 0) * 100) + '%',
    () => 'KN',
    (value) => String(value),
    () => 0
  )({});
}

test('Guarantee performance normalizes any selected date to a Sunday-start week, including across years', () => {
  const runtime = loadPerformanceRuntime();

  assert.equal(runtime.performanceWeekStartKey('2026-08-18'), '2026-08-16');
  assert.equal(runtime.performanceWeekStartKey('2026-01-01'), '2025-12-28');
  assert.equal(runtime.performanceWeekRangeLabel('2026-08-16'), 'Aug 16–22, 2026');
  assert.equal(runtime.performanceWeekRangeLabel('2025-12-28'), 'Dec 28, 2025–Jan 3, 2026');
});

test('Guarantee performance history spans years and changes the selected week metrics', () => {
  const runtime = loadPerformanceRuntime();
  const history = runtime.buildDemoPerformanceHistory();
  const keys = Object.keys(history);

  assert.ok(keys.some((key) => key.startsWith('2025-')), 'expected at least one 2025 sample week');
  assert.ok(keys.some((key) => key.startsWith('2026-')), 'expected at least one 2026 sample week');
  assert.notEqual(history['2025-01-05'].tech.t1.done, history['2026-08-09'].tech.t1.done);
});

test('Guarantee performance uses live data for the current week and snapshots for historical weeks', () => {
  const history = {
    '2025-12-28': {
      daysDone: 6,
      tech: {
        t1: { done: 1234, rating: 4.6, reviews: 31, bills: 28, upsBills: 7, rebookEligible: 24, rebooked: 12, rework: 2 }
      }
    }
  };
  const runtime = loadPerformanceRuntime({
    techs: [{ id: 't1' }],
    sales: [{ items: [{ techId: 't1', cat: 'addon' }] }],
    techPerf: { t1: { wtd: 100, rating: 4.9, rev: 8, bills: 2, upsBills: 0 } },
    rebook: { t1: { elig: 7, rb: 4 } },
    rework: { t1: 1 },
    history
  });

  const current = runtime.performanceWeekData('2026-08-18', { t1: { svc: 25 } });
  const historical = runtime.performanceWeekData('2026-01-01', { t1: { svc: 999 } });
  const empty = runtime.performanceWeekData('2024-04-17', { t1: { svc: 999 } });

  assert.deepEqual(current.tech.t1, {
    done: 125,
    rating: 4.9,
    reviews: 8,
    bills: 3,
    upsBills: 1,
    rebookEligible: 7,
    rebooked: 4,
    rework: 1
  });
  assert.equal(current.hasActivity, true);
  assert.equal(historical.weekStart, '2025-12-28');
  assert.equal(historical.tech.t1.done, 1234);
  assert.equal(historical.daysDone, 6);
  assert.equal(empty.hasActivity, false);
});

test('Guarantee performance renders the selected week picker, date range, history, and empty state', () => {
  const output = renderPerformanceWeek({
    daysDone: 6,
    daysWeek: 6,
    hasActivity: true,
    tech: {
      t1: { done: 1234, rating: 4.6, reviews: 31, bills: 28, upsBills: 7, rebookEligible: 24, rebooked: 12, rework: 2 }
    }
  });
  const empty = renderPerformanceWeek({ daysDone: 6, daysWeek: 6, hasActivity: false, tech: {} }, '2024-04-14');

  assert.match(output, /Guarantee &amp; performance — Dec 28, 2025–Jan 3, 2026 \(day 6\/6\)/);
  assert.match(output, /type="date" data-mg-perf-week value="2025-12-28"/);
  assert.match(output, /Current sales<\/span>[\s\S]{0,100}\$1,234/);
  assert.match(output, /4\.6/);
  assert.match(output, /12 of 24/);
  assert.match(output, /25%/);
  assert.match(output, /Week closed — guarantee top-up applies/);
  assert.doesNotMatch(output, /last 0 day\(s\)/);
  assert.match(empty, /No performance data for this week/);
});

test('Pay model renders the shared selected week and recalculates the split from historical production', () => {
  const output = renderOwnerWeek({
    daysDone: 6,
    daysWeek: 6,
    hasActivity: true,
    tech: {
      t1: { done: 1234, rating: 4.6, reviews: 31, bills: 28, upsBills: 7, rebookEligible: 24, rebooked: 12, rework: 2 }
    }
  });
  const empty = renderOwnerWeek({ daysDone: 6, daysWeek: 6, hasActivity: false, tech: {} }, '2024-04-14');

  assert.match(output, /Pay model &amp; real split — Dec 28, 2025–Jan 3, 2026 \(day 6\/6\)/);
  assert.match(output, /type="date" data-mg-week data-mg-owner-week value="2025-12-28"/);
  assert.match(output, /Produced this week<\/span><span class="perf-stat-value">\$1,234/);
  assert.match(output, /Tech takes<\/span><span class="perf-stat-value">\$900\.00/);
  assert.match(output, /Salon keeps<\/span><span class="perf-stat-value">\$334\.00/);
  assert.match(output, /40% → <span class="pos-warn-text">27%/);
  assert.match(output, /Week closed — finished \$266 below the service target/);
  assert.doesNotMatch(output, /0 day\(s\) left/);
  assert.match(empty, /No pay model data for this week/);
});

test('Guarantee performance loads and initializes Flatpickr weekSelect for Sunday-first weeks', () => {
  assert.match(html, /flatpickr@4\.6\.13\/dist\/flatpickr\.min\.css/);
  assert.match(html, /flatpickr@4\.6\.13\/dist\/flatpickr\.min\.js/);
  assert.match(html, /flatpickr@4\.6\.13\/dist\/plugins\/weekSelect\/weekSelect\.js/);
  const init = performanceFunctionSource('initMgWeekPickers');
  assert.match(init, /document\.querySelectorAll\('\[data-mg-week\]'\)/);
  assert.match(init, /plugins:\s*\[new window\.weekSelect\(\)\]/);
  assert.match(init, /firstDayOfWeek:\s*0/);
  assert.match(html, /data-mg-week data-mg-perf-week[\s\S]{0,260}data-mg-week data-mg-owner-week/);
  assert.match(html, /data-mg-perf-week\], \[data-mg-owner-week\][\s\S]{0,260}performanceWeekStartKey[\s\S]{0,160}renderManagement\(\)/);
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
