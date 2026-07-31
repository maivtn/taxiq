# POS Queue Card Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the single-ticket Queue cards in `pos-phase-1.html?tab=tickets` into a clear, responsive operations view without changing ticket actions, data flow, or the grouped-order card.

**Architecture:** Keep the existing `renderSingleTicketCard(w, now, selW)` entry point and delegated event attributes. Add small Queue-specific helpers for the shared identity/details/note markup, then wrap each existing status branch in the same card hierarchy while retaining its current status class and action buttons. Keep the redesign scoped to `.queue-card` so the existing table and multi-ticket `.wl-group` presentation remain stable.

**Tech Stack:** Inline JavaScript renderer and page-scoped CSS in `html/pages/pos-phase-1.html`, shared table CSS in `html/assets/pos-booking.css`, Node.js built-in `node:test` source-level tests.

## Global Constraints

- Preserve the existing `WAITLIST` records and current delegated action attributes (`data-wtap`, `data-wstart`, `data-wswap`, `data-wdone`, `data-wpay`, `data-wcancel`).
- Keep multi-ticket orders grouped and preserve the existing card-level charge behavior.
- Keep the existing table view unchanged except for shared styling helpers where needed.
- Do not add Queue actions, change the data model, change persistence, or redesign other POS tabs.
- Prefer Bootstrap-style flex row/col composition for Queue card layouts. Do not use CSS grid for Queue card/item layout unless a future spec gives a specific grid-only requirement.
- Queue card items must stay responsive by column count. Only the direct child rows inside each `.queue-card` should fill the card width, align left, and prevent long names, notes, or action groups from causing horizontal overflow.

---

### Task 1: Add failing source-level coverage for the new Queue card hierarchy

**Files:**
- Modify: `html/pages/pos-phase-1.operational-tickets.test.cjs` after the existing Queue table tests
- Test: `html/pages/pos-phase-1.operational-tickets.test.cjs`

**Interfaces:**
- Consumes: the current `renderSingleTicketCard(w, now, selW)` source and `bookingCss` source strings already loaded by the test file.
- Produces: explicit expectations for `.queue-card` structure, shared helpers, responsive CSS, and every existing single-ticket action attribute.

- [ ] **Step 1: Write the failing renderer-structure test**

Add this test after `Queue table separates hour...`:

~~~
test('Queue single-ticket cards have a clear identity, details, note, status, and action hierarchy', () => {
  const card = html.match(/function renderSingleTicketCard\(w, now, selW\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.match(card, /class="wl-card queue-card/);
  assert.match(card, /ticketQueueCardHeadHtml\(w, badge/);
  assert.match(card, /ticketQueueCardDetailsHtml\(w/);
  assert.match(card, /ticketQueueCardNoteHtml\(w\)/);
  assert.match(html, /function ticketQueueCardIdentityHtml\(w, badge\) \{[\s\S]*queue-card-identity[\s\S]*queue-card-phone[\s\S]*ticketCustomerGroupHtml\(w\)/);
  assert.match(html, /function ticketQueueCardDetailsHtml\(w, techExtra\) \{[\s\S]*queue-card-details[\s\S]*queue-card-service[\s\S]*queue-card-tech[\s\S]*ticketTechHtml\(w, 'card'\)/);
  assert.match(html, /function ticketQueueCardHeadHtml\(w, badge, timerHtml\) \{[\s\S]*queue-card-head[\s\S]*queue-card-status[\s\S]*ticketStatusBadge\(w\.status\)/);
  assert.match(card, /queue-card-actions/);
});
~~~

- [ ] **Step 2: Add failing action-preservation assertions**

Add this test immediately after the structure test:

~~~
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
~~~

- [ ] **Step 3: Add failing responsive CSS assertions**

Add this test after the action test:

~~~
test('Queue card CSS wraps content safely on narrow screens', () => {
  assert.match(html, /\.queue-card \{[\s\S]*min-width:\s*0/);
  assert.match(html, /\.queue-card-head \{[\s\S]*min-width:\s*0/);
  assert.match(html, /\.queue-card-details \{[\s\S]*min-width:\s*0/);
  assert.match(html, /\.queue-card-note \{[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(html, /\.queue-card-actions \{[\s\S]*flex-wrap:\s*wrap/);
  assert.match(html, /@media \(max-width: 640px\) \{[\s\S]*\.queue-card-actions/);
});
~~~

- [ ] **Step 4: Run the focused test file and verify it fails for the missing card classes**

Run:

~~~
node --test html/pages/pos-phase-1.operational-tickets.test.cjs
~~~

Expected: the existing Queue/data tests pass, and the three new tests fail because the current renderer/CSS do not yet emit the `queue-card-*` hierarchy.

### Task 2: Implement the shared Queue card markup while preserving behavior

**Files:**
- Modify: `html/pages/pos-phase-1.html` around `ticketTechHtml` and `renderSingleTicketCard`
- Test: `html/pages/pos-phase-1.operational-tickets.test.cjs`

**Interfaces:**
- Consumes: `custOf`, `ticketCustomerGroupHtml`, `ticketStatusBadge`, `techName`, `posServiceDisplayName`, `ticketActionsHtml`, and the existing status-specific action strings.
- Produces: `ticketQueueCardNoteHtml(w)`, a card-specific `ticketTechHtml(w, variant)` output, and a `renderSingleTicketCard` result with shared header/details/note/actions sections.

- [ ] **Step 1: Add the Queue note helper and card-aware tech helper**

Keep the current table call `ticketTechHtml(w)` valid, and add a `variant` argument only for the new card output:

~~~
function ticketTechHtml(w, variant) {
  var cls = variant === 'card' ? 'queue-card-tech-value' : 'queue-table-tech';
  if (w.techId) return '<span class="' + cls + '">' + esc(techName(w.techId)) + '</span>';
  if (w.reqTech) return '<span class="' + cls + ' is-requested">Requested: ' + esc(techName(w.reqTech)) + '</span>';
  return '<span class="pos-muted">Unassigned</span>';
}
function ticketQueueCardNoteHtml(w) {
  var c = custOf(w.name);
  var note = String(w.note || (c && c.notes && c.notes.staff) || '').trim();
  return note ? '<div class="queue-card-note" title="' + esc(note) + '"><i class="bi bi-sticky" aria-hidden="true"></i><span>' + esc(note) + '</span></div>' : '';
}
~~~

The table renderer must continue calling `ticketTechHtml(w)` so the existing `.queue-table-tech` styling and column behavior remain intact.

- [ ] **Step 2: Add shared identity/details/status markup helpers**

Add these helpers immediately before `renderSingleTicketCard`:

~~~
function ticketQueueCardIdentityHtml(w, badge) {
  return '<div class="queue-card-identity"><div class="wl-name">' + esc(w.name) + ' ' + badge + '</div>' +
    '<div class="queue-card-phone"><i class="bi bi-telephone" aria-hidden="true"></i> ' + esc(w.phone || 'No phone') + '</div>' +
    ticketCustomerGroupHtml(w) + '</div>';
}
function ticketQueueCardDetailsHtml(w) {
  return '<div class="queue-card-details"><div class="queue-card-service"><span class="queue-card-label">Service</span><strong>' +
    esc(posServiceDisplayName(w.svc || 'No service chosen')) + '</strong><span class="queue-card-sub">' + w.items.length + ' item(s) · ' + money(w.items.reduce(function (s, i) { return s + i.price; }, 0)) + '</span></div>' +
    '<div class="queue-card-tech"><span class="queue-card-label">Tech</span>' + ticketTechHtml(w, 'card') + '</div>' +
    '<div class="queue-card-booking"><span class="queue-card-label">Booked</span><span>' + esc(w.bookingTime || w.at || 'Walk-in') + '</span></div></div>';
}
function ticketQueueCardHeadHtml(w, badge, timerHtml) {
  return '<div class="queue-card-head">' + ticketQueueCardIdentityHtml(w, badge) +
    '<div class="queue-card-status">' + ticketStatusBadge(w.status) + timerHtml + '</div></div>';
}
~~~

The helpers must escape guest/contact/time values and use the existing `ticketCustomerGroupHtml(w)` so the separate customer-group and visit chips remain consistent with table mode.

- [ ] **Step 3: Wrap each status branch in the new hierarchy**

Update only `renderSingleTicketCard` so every single-ticket branch uses this shape:

~~~
return '<div class="wl-card queue-card tappable' + (late ? ' late' : (w.appt ? ' appt' : '')) + sel + '" data-wtap="' + w.id + '">' +
  ticketQueueCardHeadHtml(w, badge, timerHtml) +
  ticketQueueCardDetailsHtml(w) +
  ticketQueueCardNoteHtml(w) +
  '<div class="queue-card-actions">' + existingWaitingActions + '</div></div>';
~~~

Use the existing state classes exactly as follows:

- waiting: use the literal `class="wl-card queue-card tappable..."`, plus `late` or `appt`, plus the existing `is-sel` when selected, and retain `data-wtap`.
- ready: `queue-card rdy`, retaining `data-wpay` and `data-wcancel`.
- service: `queue-card svc`, retaining `data-wswap`, `data-wdone`, `data-wpay`, and `data-wcancel`.
- completed/cancelled: `queue-card`, with `ticketStatusBadge(w.status)` in the status area and no new actions.

Use the existing timers as the right side of `.queue-card-status`: waiting uses the hourglass and `waitMin`, service uses the stopwatch and `svcMin`, ready uses the cash icon and `rdyMin`. Keep the late threshold and requested-tech busy text unchanged. Keep `renderTicketGroupCard` unchanged so grouped orders continue using their current per-ticket actions and one order-level Charge button.

- [ ] **Step 4: Run the focused tests and confirm renderer coverage passes**

Run:

~~~
node --test html/pages/pos-phase-1.operational-tickets.test.cjs
~~~

Expected: the new hierarchy/action tests still report only CSS failures; all renderer and existing operational-ticket assertions pass.

### Task 3: Add modern responsive styling and verify the complete POS surface

**Files:**
- Modify: `html/pages/pos-phase-1.html` near the existing `.wl-card` Queue styles and the inline mobile pass
- Test: `html/pages/pos-phase-1.operational-tickets.test.cjs`

**Interfaces:**
- Consumes: the `queue-card-*` classes emitted by `renderSingleTicketCard`.
- Produces: inline desktop/mobile layout rules with visible status accents, readable hierarchy, safe note wrapping, and action wrapping without changing `.wl-group` or `.queue-table` behavior.

- [ ] **Step 1: Add desktop Queue card styles**

Add the following rules next to the existing `.wl-card` rules in the page's inline `<style>` block:

~~~
[data-wait-list]:has(> .wl-card) { display: flex; flex-wrap: wrap; gap: 12px; }
[data-wait-list] > .wl-card { flex: 0 0 calc(25% - 9px); max-width: calc(25% - 9px); min-width: 0; margin-bottom: 0; }
[data-wait-list] > .booking-table-wrap { flex: 1 1 100%; max-width: 100%; width: 100%; }
@media (max-width: 1199px) {
  [data-wait-list] > .wl-card { flex-basis: calc(33.333% - 8px); max-width: calc(33.333% - 8px); }
}
@media (max-width: 900px) {
  [data-wait-list] > .wl-card { flex-basis: calc(50% - 6px); max-width: calc(50% - 6px); }
}
.queue-card { display: flex; flex-direction: column; gap: 10px; min-width: 0; padding: 12px; overflow: hidden; }
.queue-card > :not(.queue-card-note) { width: 100%; min-width: 0; }
.queue-card-head { display: flex; flex-direction: row; flex-wrap: wrap; align-items: flex-start; justify-content: flex-start; gap: 8px; min-width: 0; }
.queue-card-identity { flex: 1 1 0; min-width: 0; }
.queue-card-phone, .queue-card-booking, .queue-card-sub { color: var(--nexora-muted); font-size: 11.5px; font-weight: 650; margin-top: 4px; }
.queue-card-phone { overflow-wrap: anywhere; }
.queue-card-status { display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; gap: 4px; flex: 0 0 auto; max-width: 100%; flex-wrap: nowrap; white-space: nowrap; }
.queue-card-service { min-width: 0; }
.queue-card-service strong { display: block; color: var(--nexora-text); font-size: 13px; line-height: 1.35; margin-top: 3px; overflow-wrap: anywhere; }
.queue-card-meta { display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 8px; width: 100%; margin-top: 6px; flex-wrap: wrap; }
.queue-card-tech, .queue-card-booking { display: inline-flex; align-items: center; gap: 4px; max-width: 100%; min-width: 0; overflow-wrap: anywhere; }
.queue-card-tech-value { overflow-wrap: anywhere; color: var(--nexora-text); font-size: 12px; font-weight: 800; line-height: 1.35; margin-top: 3px; }
.queue-card-tech-value.is-requested { color: var(--nexora-warning); }
.queue-card-note { align-self: flex-start; width: fit-content; max-width: 100%; overflow-wrap: anywhere; display: flex; align-items: center; gap: 5px; }
.queue-card-note span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.queue-card-actions { display: flex; align-items: center; justify-content: flex-start; gap: 5px; width: 100%; flex-wrap: wrap; padding-top: 8px; }
.queue-card-actions .pos-btn { flex: 0 0 auto; width: auto; }
~~~

Keep the existing `.wl-card.svc`, `.wl-card.rdy`, `.wl-card.late`, `.wl-card.appt`, and selection class hooks. Service and ready cards should not add heavy border accents; the new `.queue-card` layout must not be applied to `.wl-group`.

- [ ] **Step 2: Add the narrow-screen rules**

Inside the existing inline `@media (max-width: 640px)` block, add:

~~~
[data-wait-list]:has(> .wl-card) { gap: 8px; }
[data-wait-list] > .wl-card { flex-basis: 100%; max-width: 100%; }
.queue-card { padding: 8px; }
.queue-card-actions { justify-content: flex-start; }
.queue-card-status { flex-wrap: nowrap; white-space: nowrap; }
~~~

These rules must keep long guest names, phone numbers, service names, notes, and action groups inside the card width without introducing horizontal scrolling.

- [ ] **Step 3: Run the focused test file and the complete POS test suite**

Run:

~~~
node --test html/pages/pos-phase-1.operational-tickets.test.cjs
node --test html/pages/pos-phase-1*.test.cjs
~~~

Expected: the focused file and all POS phase tests pass, including the pre-existing queue-table, swap-tech, Time Clock, booking, customer, and operational-ticket assertions.

- [ ] **Step 4: Check the final diff for whitespace/errors and inspect the changed sections**

Run:

~~~
git diff --check
git diff --stat -- html/pages/pos-phase-1.html html/pages/pos-phase-1.operational-tickets.test.cjs
~~~

Expected: `git diff --check` returns no output, and the diff is limited to the Queue single-ticket renderer, Queue card CSS, and focused operational-ticket tests. Do not modify unrelated dirty-worktree files.
