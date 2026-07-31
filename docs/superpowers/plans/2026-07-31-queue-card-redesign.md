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
- Cards must remain full-width inside the Queue panel, wrap on narrow screens, and prevent long names, notes, or action groups from causing horizontal overflow.

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
test('Queue single-ticket cards retain their status actions and state accents', () => {
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
.queue-card { display: block; min-width: 0; padding: 14px; overflow: hidden; }
.queue-card-head { min-width: 0; }
.queue-card-details { min-width: 0; }
.queue-card-actions { min-width: 0; }
.queue-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.queue-card-identity { flex: 1 1 240px; min-width: 0; }
.queue-card-phone, .queue-card-booking, .queue-card-sub { color: var(--nexora-muted); font-size: 11.5px; font-weight: 650; margin-top: 4px; }
.queue-card-phone { overflow-wrap: anywhere; }
.queue-card-status { display: flex; align-items: flex-end; flex-direction: column; gap: 6px; flex: 0 0 auto; }
.queue-card-status .wl-wait { margin: 0; }
.queue-card-details { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(150px, .9fr) minmax(110px, .65fr); gap: 10px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--nexora-border); }
.queue-card-service, .queue-card-tech, .queue-card-booking { min-width: 0; }
.queue-card-label { display: block; color: var(--nexora-subtle); font-size: 9.5px; font-weight: 850; letter-spacing: .06em; text-transform: uppercase; }
.queue-card-service strong { display: block; color: var(--nexora-text); font-size: 13px; line-height: 1.35; margin-top: 3px; overflow-wrap: anywhere; }
.queue-card-tech-value { display: block; color: var(--nexora-text); font-size: 12px; font-weight: 800; line-height: 1.35; margin-top: 3px; overflow-wrap: anywhere; }
.queue-card-tech-value.is-requested { color: var(--nexora-warning); }
.queue-card-note { display: flex; align-items: flex-start; gap: 7px; min-width: 0; margin-top: 12px; padding: 8px 10px; border: 1px solid rgba(245, 158, 11, .24); border-radius: 9px; background: #fffaf0; color: #8a5a00; font-size: 11.5px; line-height: 1.45; overflow-wrap: anywhere; }
.queue-card-note i { flex: 0 0 auto; margin-top: 2px; }
.queue-card-note span { display: -webkit-box; min-width: 0; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.queue-card-actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; flex-wrap: wrap; margin-top: 14px; padding-top: 11px; border-top: 1px solid var(--nexora-border); }
.queue-card-actions .pos-btn-primary, .queue-card-actions .pos-btn-success { order: -1; }
~~~

Keep the existing `.wl-card.svc`, `.wl-card.rdy`, `.wl-card.late`, `.wl-card.appt`, and selection rules so state accents continue to work; the new `.queue-card` layout must not be applied to `.wl-group`.

- [ ] **Step 2: Add the narrow-screen rules**

Inside the existing inline `@media (max-width: 640px)` block, add:

~~~
.queue-card { padding: 12px; }
.queue-card-head { align-items: stretch; flex-direction: column; gap: 10px; }
.queue-card-identity { flex: 0 1 auto; }
.queue-card-status { align-items: flex-start; flex-direction: row; flex-wrap: wrap; }
.queue-card-details { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px 8px; }
.queue-card-service { grid-column: 1 / -1; }
.queue-card-actions { justify-content: flex-start; }
.queue-card-actions .pos-btn { flex: 1 1 auto; }
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
