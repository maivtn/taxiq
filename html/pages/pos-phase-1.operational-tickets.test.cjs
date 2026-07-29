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
  assert.match(html, /function waitlistGroups\(\) \{/);
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
