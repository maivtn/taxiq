# Staff App Jobs Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the staff mobile showcase to `staff-app.html` and add a source-aligned, interactive Jobs screen under `Community → Jobs`.

**Architecture:** Keep the existing standalone HTML showcase and its design system intact. Add one self-contained Jobs phone screen plus a dedicated inline Jobs script that exposes a pure reducer for tests and binds DOM interactions only when the page initializes. Reuse the existing staff sidebar template and bottom-navigation pattern rather than creating another shell.

**Tech Stack:** Static HTML, Tailwind CDN classes, Lucide icons, vanilla JavaScript, Node.js `node:test`, `node:vm`.

## Global Constraints

- Business rules come from `html/customer/18072026/NEXORA_Spec_AI_Matching_Tho_Tiem.md`.
- Jobs examples and mutual accept come from `html/customer/18072026/NEXORA_AI_Matching_Tho_Tiem_Mockup.html`.
- Shared AI presentation comes from `html/customer/18072026/NEXORA_Business_AI_Offer_Mockup.html`.
- Use the existing Staff App visual system; do not copy standalone mockup shells or CSS.
- Jobs lives at `Community → Jobs`; do not add a sixth bottom-navigation item.
- AI only suggests and explains; the tech makes every decision.
- Identity stays anonymous until the tech explicitly shares contact information.
- The current salon never sees the profile.
- License information is labeled `self-reported — not verified by NEXORA`.
- NEXORA does not hire, pay, recruit, guarantee work, or advise on 1099/W-2.
- Demo behavior is local-only, makes no network calls, and does not persist after reload.
- Preserve unrelated W-9 modifications and untracked W-9 documents.

---

## File map

- Rename: `html/pages/mobile-two-account-tailwind-lucide.html` → `html/pages/staff-app.html`
  - Remains the complete multi-screen Staff App showcase.
  - Receives the Jobs markup, sidebar link behavior, and dedicated Jobs script.
- Create: `html/pages/staff-app.test.mjs`
  - Owns rename, source-contract, reducer, state-transition, and guardrail tests.
- Reference only: `html/customer/18072026/NEXORA_AI_Matching_Tho_Tiem_Mockup.html`
- Reference only: `html/customer/18072026/NEXORA_Spec_AI_Matching_Tho_Tiem.md`
- Reference only: `html/customer/18072026/NEXORA_Business_AI_Offer_Mockup.html`

### Task 1: Rename the Staff App file safely

**Files:**
- Create: `html/pages/staff-app.test.mjs`
- Rename: `html/pages/mobile-two-account-tailwind-lucide.html` → `html/pages/staff-app.html`

**Interfaces:**
- Consumes: the existing standalone Staff App HTML.
- Produces: stable page URL `html/pages/staff-app.html` for every later task.

- [ ] **Step 1: Write the failing rename contract**

Create `html/pages/staff-app.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const STAFF_APP_URL = new URL('./staff-app.html', import.meta.url);
const LEGACY_URL = new URL('./mobile-two-account-tailwind-lucide.html', import.meta.url);

function source() {
  assert.ok(existsSync(STAFF_APP_URL), 'staff-app.html must exist');
  return readFileSync(STAFF_APP_URL, 'utf8');
}

test('uses the canonical Staff App filename', () => {
  assert.equal(existsSync(STAFF_APP_URL), true);
  assert.equal(existsSync(LEGACY_URL), false);
});
```

- [ ] **Step 2: Run the rename test and verify RED**

Run:

```bash
node --test html/pages/staff-app.test.mjs
```

Expected: FAIL because `staff-app.html` does not exist and the legacy file still exists.

- [ ] **Step 3: Move the file without changing its contents**

Use an `apply_patch` move from
`html/pages/mobile-two-account-tailwind-lucide.html` to
`html/pages/staff-app.html`. Do not touch historical plan/spec references that
record the old filename at the time those documents were written.

- [ ] **Step 4: Run the rename test and verify GREEN**

Run:

```bash
node --test html/pages/staff-app.test.mjs
```

Expected: 1 test passes.

- [ ] **Step 5: Commit the isolated rename**

```bash
git add html/pages/staff-app.html html/pages/staff-app.test.mjs
git add -u html/pages/mobile-two-account-tailwind-lucide.html
git commit -m "refactor: rename staff mobile showcase"
```

### Task 2: Add the source-aligned Jobs screen and navigation contract

**Files:**
- Modify: `html/pages/staff-app.html`
- Modify: `html/pages/staff-app.test.mjs`

**Interfaces:**
- Consumes: existing `data-staff-shell`, `data-staff-sidebar-template`, `data-menu-key`, Tailwind tokens, and Lucide initialization.
- Produces: `#staff-jobs-screen`, `[data-jobs-root]`, three tab panels, two match cards, profile controls, activity rows, and accessible dialogs for Task 3.

- [ ] **Step 1: Add failing source-contract tests**

Append:

```js
test('renders Jobs inside the existing Staff App shell', () => {
  const html = source();
  assert.match(html, /id="staff-jobs-screen"/);
  assert.match(html, /data-jobs-root/);
  assert.match(html, /data-staff-shell[^>]*data-staff-menu-active="jobs"/);
  assert.match(html, /data-menu-key="jobs"[^>]*>Jobs<\/a>/);
  assert.match(html, /href="#staff-jobs-screen"/);
  assert.match(html, /Community<\/a>/);
});

test('contains the complete three-view Jobs contract', () => {
  const html = source();
  for (const view of ['matches', 'profile', 'activity']) {
    assert.match(html, new RegExp(`data-job-tab="${view}"`));
    assert.match(html, new RegExp(`data-job-panel="${view}"`));
  }
  assert.match(html, /Rose Nails &amp; Spa/);
  assert.match(html, /94% match/i);
  assert.match(html, /Golden Glow Spa/);
  assert.match(html, /76% match/i);
  assert.match(html, /data-job-match="rose"/);
  assert.match(html, /data-job-match="golden"/);
  for (const action of ['interest', 'dismiss', 'report']) {
    assert.match(html, new RegExp(`data-job-action="${action}"`));
  }
});

test('renders job profile, activity, consent, and guardrail content', () => {
  const html = source();
  for (const field of ['skills', 'experience', 'license', 'radius', 'compensation', 'schedule']) {
    assert.match(html, new RegExp(`data-job-profile-field="${field}"`));
  }
  for (const status of ['active', 'paused', 'deleted']) {
    assert.match(html, new RegExp(`data-job-profile-status="${status}"`));
  }
  for (const state of ['interested', 'contact-requested', 'contact-shared', 'declined']) {
    assert.match(html, new RegExp(`data-job-activity-state="${state}"`));
  }
  assert.match(html, /data-job-dialog="contact"[^>]*role="dialog"/);
  assert.match(html, /data-job-dialog="report"[^>]*role="dialog"/);
  assert.match(html, /data-job-dialog="delete"[^>]*role="dialog"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /current salon[^.]*never/i);
  assert.match(html, /self-reported[^.]*not verified by NEXORA/i);
  assert.match(html, /does not hire, pay, recruit/i);
  assert.match(html, /AI only suggests/i);
  assert.match(html, /1099\/W-2/i);
});
```

- [ ] **Step 2: Run the source-contract tests and verify RED**

Run:

```bash
node --test html/pages/staff-app.test.mjs
```

Expected: rename test passes; the three new Jobs contract tests fail because the screen is absent.

- [ ] **Step 3: Add the Jobs article to the existing screen grid**

Insert one `<article>` after the existing Community screen and before AI Assistant. The outer contract is:

```html
<article class="w-full max-w-[430px]" id="staff-jobs-screen">
  <div class="mb-3 flex items-end justify-between gap-4 px-1">
    <div>
      <h2 class="text-lg font-semibold text-white">Staff Account</h2>
      <p class="text-[13px] font-semibold text-white/60">AI job matching screen</p>
    </div>
    <span class="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-xl">Jobs</span>
  </div>
  <div class="phone-frame relative h-[844px] overflow-hidden rounded-[32px] border border-nailBlush bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_46%,#F1F5F9_100%)] shadow-phone"
       data-staff-shell data-staff-menu-active="jobs" data-jobs-root>
    <div class="phone-scroll h-full overflow-y-auto pb-20">
      <header class="sticky top-0 z-30 flex min-h-[58px] items-center justify-between border-b border-nailBlush/80 bg-white/95 px-3 backdrop-blur-xl">
        <button type="button" class="grid h-9 w-9 place-items-center rounded-lg border border-nailBlush bg-white text-nexoraText shadow-sm" aria-label="Open staff menu" data-staff-menu-open><i data-lucide="menu" class="h-4 w-4"></i></button>
        <h3 class="text-[15px] font-semibold">Jobs</h3>
        <button type="button" class="grid h-9 w-9 place-items-center rounded-lg text-nexoraSubtle" aria-label="Jobs help"><i data-lucide="circle-help" class="h-4 w-4"></i></button>
      </header>
      <div class="grid grid-cols-3 border-b border-nailBlush bg-white" role="tablist" aria-label="Jobs views">
        <button type="button" role="tab" aria-selected="true" aria-controls="job-panel-matches" data-job-tab="matches">Matches</button>
        <button type="button" role="tab" aria-selected="false" aria-controls="job-panel-profile" data-job-tab="profile">My Job Profile</button>
        <button type="button" role="tab" aria-selected="false" aria-controls="job-panel-activity" data-job-tab="activity">Activity</button>
      </div>
      <section id="job-panel-matches" class="space-y-3 px-3 py-4" data-job-panel="matches">
        <div class="rounded-lg border border-nexoraSuccess/20 bg-nexoraSuccess/10 p-3 text-[11px] font-semibold leading-4 text-nexoraSuccess">
          Your current salon can never see this profile. Salons see skills and expectations, never your name, photo, phone, or current salon.
        </div>
        <article class="rounded-xl border border-nailBlush border-l-4 border-l-nexoraBrand bg-white p-3 shadow-card" data-job-match="rose">
          <div class="flex items-start justify-between gap-2"><h4 class="text-[12px] font-semibold">Rose Nails &amp; Spa</h4><span class="rounded-full bg-nexoraSuccess/10 px-2 py-1 text-[9px] font-semibold text-nexoraSuccess">94% match</span></div>
          <p class="mt-1 text-[10px] font-semibold text-nexoraMuted">Needs Gel-X + Design · 4.2 miles · Split 6/4 · guarantee first 2 weeks</p>
          <p class="mt-2 text-[10px] font-medium leading-4 text-nexoraMuted"><strong class="text-nexoraText">Why:</strong> Matches your 2 strongest skills, split expectation, and available schedule.</p>
          <p class="mt-1 text-[9px] font-semibold uppercase text-nexoraBrandDark" data-job-match-status></p>
          <div class="mt-3 grid grid-cols-[1fr_auto_auto] gap-1.5">
            <button type="button" class="rounded-lg bg-nexoraBrand px-2 py-2 text-[10px] font-semibold text-white" data-job-action="interest" data-job-match-id="rose">I'm interested</button>
            <button type="button" class="rounded-lg border border-nailBlush px-2 py-2 text-[10px] font-semibold text-nexoraMuted" data-job-action="dismiss" data-job-match-id="rose">Dismiss</button>
            <button type="button" class="rounded-lg border border-nailBlush px-2 py-2 text-[10px] font-semibold text-nexoraDanger" data-job-action="report" data-job-match-id="rose">Report</button>
          </div>
        </article>
        <article class="rounded-xl border border-nailBlush border-l-4 border-l-nexoraBrand bg-white p-3 shadow-card" data-job-match="golden">
          <div class="flex items-start justify-between gap-2"><h4 class="text-[12px] font-semibold">Golden Glow Spa</h4><span class="rounded-full bg-nexoraWarning/10 px-2 py-1 text-[9px] font-semibold text-nexoraWarning">76% match</span></div>
          <p class="mt-1 text-[10px] font-semibold text-nexoraMuted">Needs Pedicure + Waxing · 9.8 miles · Weekly pay offered</p>
          <p class="mt-2 text-[10px] font-medium leading-4 text-nexoraMuted"><strong class="text-nexoraText">Why:</strong> Pedicure matches, but waxing is not in your profile and the salon is outside your usual range.</p>
          <p class="mt-1 text-[9px] font-semibold uppercase text-nexoraBrandDark" data-job-match-status></p>
          <div class="mt-3 grid grid-cols-[1fr_auto_auto] gap-1.5">
            <button type="button" class="rounded-lg bg-nexoraBrand px-2 py-2 text-[10px] font-semibold text-white" data-job-action="interest" data-job-match-id="golden">I'm interested</button>
            <button type="button" class="rounded-lg border border-nailBlush px-2 py-2 text-[10px] font-semibold text-nexoraMuted" data-job-action="dismiss" data-job-match-id="golden">Dismiss</button>
            <button type="button" class="rounded-lg border border-nailBlush px-2 py-2 text-[10px] font-semibold text-nexoraDanger" data-job-action="report" data-job-match-id="golden">Report</button>
          </div>
        </article>
      </section>
      <section id="job-panel-profile" class="hidden space-y-3 px-3 py-4" data-job-panel="profile">
        <div class="flex items-center justify-between rounded-lg border border-nailBlush bg-white p-3 shadow-card"><div><p class="text-[10px] font-semibold uppercase text-nexoraMuted">Profile status</p><p class="text-[13px] font-semibold capitalize" data-job-profile-current>active</p></div><span class="rounded-full bg-nexoraSuccess/10 px-2 py-1 text-[9px] font-semibold text-nexoraSuccess">Anonymous always on</span></div>
        <div class="space-y-2 rounded-lg border border-nailBlush bg-white p-3 shadow-card">
          <label class="block text-[10px] font-semibold text-nexoraMuted" data-job-profile-field="skills">Skills<input class="mt-1 h-9 w-full rounded-lg bg-nailPearl px-3 text-[11px] text-nexoraText" value="Gel-X, Design, Pedicure"></label>
          <label class="block text-[10px] font-semibold text-nexoraMuted" data-job-profile-field="experience">Experience<input class="mt-1 h-9 w-full rounded-lg bg-nailPearl px-3 text-[11px] text-nexoraText" value="5 years"></label>
          <label class="block text-[10px] font-semibold text-nexoraMuted" data-job-profile-field="license">License<input class="mt-1 h-9 w-full rounded-lg bg-nailPearl px-3 text-[11px] text-nexoraText" value="Texas · self-reported — not verified by NEXORA"></label>
          <label class="block text-[10px] font-semibold text-nexoraMuted" data-job-profile-field="radius">Area &amp; radius<input class="mt-1 h-9 w-full rounded-lg bg-nailPearl px-3 text-[11px] text-nexoraText" value="Houston · 25 miles"></label>
          <label class="block text-[10px] font-semibold text-nexoraMuted" data-job-profile-field="compensation">Compensation expectation<input class="mt-1 h-9 w-full rounded-lg bg-nailPearl px-3 text-[11px] text-nexoraText" value="Split 6/4 · guarantee preferred"></label>
          <label class="block text-[10px] font-semibold text-nexoraMuted" data-job-profile-field="schedule">Available schedule<input class="mt-1 h-9 w-full rounded-lg bg-nailPearl px-3 text-[11px] text-nexoraText" value="Fri–Sun · 9:00 AM–7:00 PM"></label>
          <button type="button" class="h-9 w-full rounded-lg bg-nexoraBrand text-[11px] font-semibold text-white" data-job-action="save-profile">Save profile</button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button type="button" class="rounded-lg border border-nexoraSuccess/30 bg-nexoraSuccess/10 px-2 py-2 text-[10px] font-semibold text-nexoraSuccess" data-job-profile-status="active" data-job-action="profile-active">Active</button>
          <button type="button" class="rounded-lg border border-nexoraWarning/30 bg-nexoraWarning/10 px-2 py-2 text-[10px] font-semibold text-nexoraWarning" data-job-profile-status="paused" data-job-action="profile-paused">Pause</button>
          <button type="button" class="rounded-lg border border-nexoraDanger/30 bg-nexoraDanger/10 px-2 py-2 text-[10px] font-semibold text-nexoraDanger" data-job-profile-status="deleted" data-job-action="open-delete">Delete</button>
        </div>
      </section>
      <section id="job-panel-activity" class="hidden space-y-2 px-3 py-4" data-job-panel="activity">
        <div class="rounded-lg border border-nailBlush bg-white p-3 shadow-card" data-job-activity-state="interested"><p class="text-[12px] font-semibold">Interested</p><p class="text-[10px] text-nexoraMuted">Rose Nails &amp; Spa received your anonymous profile.</p></div>
        <div class="rounded-lg border border-nexoraBrand/30 bg-white p-3 shadow-card" data-job-activity-state="contact-requested"><div class="flex items-center justify-between gap-2"><div><p class="text-[12px] font-semibold">Contact requested</p><p class="text-[10px] text-nexoraMuted">Rose Nails &amp; Spa wants to talk.</p></div><button type="button" class="rounded-lg bg-nexoraBrand px-2 py-2 text-[10px] font-semibold text-white" data-job-action="open-contact">Review</button></div><p class="mt-2 text-[9px] font-semibold uppercase text-nexoraBrandDark" data-job-contact-current>requested</p></div>
        <div class="rounded-lg border border-nailBlush bg-white p-3 shadow-card" data-job-activity-state="contact-shared"><p class="text-[12px] font-semibold">Contact shared</p><p class="text-[10px] text-nexoraMuted">Both sides can now talk directly.</p></div>
        <div class="rounded-lg border border-nailBlush bg-white p-3 shadow-card" data-job-activity-state="declined"><p class="text-[12px] font-semibold">Declined</p><p class="text-[10px] text-nexoraMuted">The salon learned nothing about your identity.</p></div>
        <div class="rounded-lg bg-nailBlush p-3 text-[10px] font-medium leading-4 text-nexoraText"><strong>AI only suggests.</strong> You decide every connection. NEXORA does not hire, pay, recruit, guarantee work, or advise on 1099/W-2. Employment terms stay between you and the salon.</div>
      </section>
    </div>
    <nav class="absolute inset-x-0 bottom-0 z-30 grid h-[66px] grid-cols-5 border-t border-nailBlush bg-white/95 px-1 backdrop-blur-xl">
      <a class="grid place-items-center content-center gap-1 text-[10px] font-semibold text-nexoraSubtle" href="#"><i data-lucide="home" class="h-5 w-5"></i>Home</a>
      <a class="grid place-items-center content-center gap-1 text-[10px] font-semibold text-nexoraSubtle" href="#"><i data-lucide="qr-code" class="h-5 w-5"></i>My QR</a>
      <a class="grid place-items-center content-center gap-1 text-[10px] font-semibold text-nexoraSubtle" href="#"><i data-lucide="wallet" class="h-5 w-5"></i>Wallet</a>
      <a class="grid place-items-center content-center gap-1 text-[10px] font-semibold text-nexoraBrandDark" href="#"><i data-lucide="users-round" class="h-5 w-5"></i>Community</a>
      <a class="grid place-items-center content-center gap-1 text-[10px] font-semibold text-nexoraSubtle" href="#"><i data-lucide="user-circle" class="h-5 w-5"></i>Profile</a>
    </nav>
    <div class="pointer-events-none absolute inset-x-3 bottom-20 z-40 hidden rounded-lg bg-nexoraInk px-3 py-2 text-[11px] font-semibold text-white shadow-phone" aria-live="polite" data-jobs-notice></div>
    <div class="absolute inset-0 z-50 hidden items-center bg-nexoraInk/50 p-5" data-job-dialog="report" role="dialog" aria-modal="true" aria-labelledby="job-report-title"><div class="w-full rounded-xl bg-white p-4"><h4 id="job-report-title" class="text-[14px] font-semibold">Report this match</h4><label class="mt-3 block text-[10px] font-semibold text-nexoraMuted">Reason<select class="mt-1 h-9 w-full rounded-lg border border-nailBlush px-2 text-[11px]"><option>False or misleading post</option><option>Harassment</option><option>Unsafe working conditions</option></select></label><div class="mt-3 grid grid-cols-2 gap-2"><button type="button" class="rounded-lg border border-nailBlush py-2 text-[10px] font-semibold" data-job-action="close-dialog">Cancel</button><button type="button" class="rounded-lg bg-nexoraDanger py-2 text-[10px] font-semibold text-white" data-job-action="submit-report">Submit report</button></div></div></div>
    <div class="absolute inset-0 z-50 hidden items-center bg-nexoraInk/50 p-5" data-job-dialog="contact" role="dialog" aria-modal="true" aria-labelledby="job-contact-title"><div class="w-full rounded-xl bg-white p-4"><h4 id="job-contact-title" class="text-[14px] font-semibold">Rose Nails &amp; Spa wants to talk</h4><p class="mt-2 text-[11px] leading-4 text-nexoraMuted">Share your name and phone number? Until you agree, the salon sees only your anonymous profile.</p><div class="mt-3 space-y-2"><button type="button" class="w-full rounded-lg bg-nexoraBrand py-2 text-[10px] font-semibold text-white" data-job-action="share-contact">Share contact</button><button type="button" class="w-full rounded-lg border border-nailBlush py-2 text-[10px] font-semibold" data-job-action="decline-contact">Stay anonymous</button><button type="button" class="w-full py-1 text-[10px] font-semibold text-nexoraMuted" data-job-action="close-dialog">Cancel</button></div></div></div>
    <div class="absolute inset-0 z-50 hidden items-center bg-nexoraInk/50 p-5" data-job-dialog="delete" role="dialog" aria-modal="true" aria-labelledby="job-delete-title"><div class="w-full rounded-xl bg-white p-4"><h4 id="job-delete-title" class="text-[14px] font-semibold">Delete job profile?</h4><p class="mt-2 text-[11px] leading-4 text-nexoraMuted">This removes all matches and cannot be undone in the real product.</p><div class="mt-3 grid grid-cols-2 gap-2"><button type="button" class="rounded-lg border border-nailBlush py-2 text-[10px] font-semibold" data-job-action="close-dialog">Cancel</button><button type="button" class="rounded-lg bg-nexoraDanger py-2 text-[10px] font-semibold text-white" data-job-action="confirm-delete">Delete profile</button></div></div></div>
  </div>
</article>
```

- [ ] **Step 4: Wire Jobs into the reusable sidebar shell**

Change the template Jobs anchor to:

```html
<a href="#staff-jobs-screen" class="flex h-8 items-center rounded-lg px-2 text-[11px] font-semibold" data-menu-key="jobs">Jobs</a>
```

Inside the existing sidebar-cloning loop, after `shell.append(sidebar)`, add:

```js
const activeMenuKey = shell.dataset.staffMenuActive;
const activeMenuItem = activeMenuKey
  ? sidebar.querySelector(`[data-menu-key="${activeMenuKey}"]`)
  : null;
if (activeMenuItem) {
  activeMenuItem.setAttribute('aria-current', 'page');
  activeMenuItem.classList.add('bg-white/10', 'text-white');
  activeMenuItem.closest('details')?.setAttribute('open', '');
}
sidebar.querySelector('[data-menu-key="jobs"]')?.addEventListener('click', closeMenu);
```

Place this block after `closeMenu` is declared so its listener does not reference
the function before initialization. Keep Home and My QR active states working.

- [ ] **Step 5: Run the source-contract tests and verify GREEN**

Run:

```bash
node --test html/pages/staff-app.test.mjs
```

Expected: all four tests pass.

- [ ] **Step 6: Commit the Jobs UI contract**

```bash
git add html/pages/staff-app.html html/pages/staff-app.test.mjs
git commit -m "feat: add staff Jobs screen"
```

### Task 3: Implement and test local Jobs behavior

**Files:**
- Modify: `html/pages/staff-app.html`
- Modify: `html/pages/staff-app.test.mjs`

**Interfaces:**
- Consumes: Task 2 selectors and dialog markup.
- Produces: `window.NEXORA_STAFF_JOBS_TEST_API`, `createJobsState()`, `reduceJobsState(state, action)`, and initialized local UI behavior.

- [ ] **Step 1: Add failing reducer tests**

Append:

```js
function jobsApi() {
  const html = source();
  const script = html.match(/<script id="staff-jobs-script">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'dedicated staff Jobs script must exist');
  const window = { NEXORA_STAFF_JOBS_SKIP_INIT: true };
  window.window = window;
  const context = vm.createContext({ window, console, structuredClone });
  vm.runInContext(script, context);
  assert.ok(window.NEXORA_STAFF_JOBS_TEST_API);
  return window.NEXORA_STAFF_JOBS_TEST_API;
}

test('models match actions without exposing identity', () => {
  const jobs = jobsApi();
  let state = jobs.createJobsState();
  assert.equal(state.identityRevealed, false);
  state = jobs.reduceJobsState(state, { type: 'interest', matchId: 'rose' });
  assert.equal(state.matches.rose, 'interested');
  assert.equal(state.identityRevealed, false);
  state = jobs.reduceJobsState(state, { type: 'dismiss', matchId: 'golden' });
  assert.equal(state.matches.golden, 'dismissed');
  state = jobs.reduceJobsState(state, { type: 'report', matchId: 'rose' });
  assert.equal(state.matches.rose, 'reported');
});

test('models profile lifecycle and mutual contact consent', () => {
  const jobs = jobsApi();
  let state = jobs.createJobsState();
  state = jobs.reduceJobsState(state, { type: 'profile-status', status: 'paused' });
  assert.equal(state.profileStatus, 'paused');
  state = jobs.reduceJobsState(state, { type: 'profile-status', status: 'active' });
  assert.equal(state.profileStatus, 'active');
  state = jobs.reduceJobsState(state, { type: 'contact-decision', decision: 'declined' });
  assert.equal(state.contactStatus, 'declined');
  assert.equal(state.identityRevealed, false);

  state = jobs.createJobsState();
  state = jobs.reduceJobsState(state, { type: 'contact-decision', decision: 'shared' });
  assert.equal(state.contactStatus, 'shared');
  assert.equal(state.identityRevealed, true);
  state = jobs.reduceJobsState(state, { type: 'profile-status', status: 'deleted' });
  assert.equal(state.profileStatus, 'deleted');
});

test('switches only to supported Jobs views', () => {
  const jobs = jobsApi();
  let state = jobs.reduceJobsState(jobs.createJobsState(), { type: 'view', view: 'activity' });
  assert.equal(state.view, 'activity');
  state = jobs.reduceJobsState(state, { type: 'view', view: 'unknown' });
  assert.equal(state.view, 'activity');
});
```

- [ ] **Step 2: Run reducer tests and verify RED**

Run:

```bash
node --test html/pages/staff-app.test.mjs
```

Expected: the source-contract tests pass; reducer tests fail because
`staff-jobs-script` and the exported API are absent.

- [ ] **Step 3: Add the pure Jobs state model**

Before the existing general page script, add:

```html
<script id="staff-jobs-script">
  (() => {
    const VALID_VIEWS = new Set(['matches', 'profile', 'activity']);
    const VALID_PROFILE_STATUSES = new Set(['active', 'paused', 'deleted']);

    function createJobsState() {
      return {
        view: 'matches',
        profileStatus: 'active',
        contactStatus: 'requested',
        identityRevealed: false,
        dialog: null,
        reportMatchId: null,
        matches: { rose: 'available', golden: 'available' }
      };
    }

    function reduceJobsState(state, action) {
      const next = structuredClone(state);
      if (action.type === 'view' && VALID_VIEWS.has(action.view)) next.view = action.view;
      if (action.type === 'interest' && next.matches[action.matchId] === 'available') {
        next.matches[action.matchId] = 'interested';
      }
      if (action.type === 'dismiss' && next.matches[action.matchId] === 'available') {
        next.matches[action.matchId] = 'dismissed';
      }
      if (action.type === 'open-report' && next.matches[action.matchId]) {
        next.dialog = 'report';
        next.reportMatchId = action.matchId;
      }
      if (action.type === 'report' && next.matches[action.matchId]) {
        next.matches[action.matchId] = 'reported';
        next.dialog = null;
        next.reportMatchId = null;
      }
      if (action.type === 'profile-status' && VALID_PROFILE_STATUSES.has(action.status)) {
        next.profileStatus = action.status;
        next.dialog = null;
      }
      if (action.type === 'open-contact') next.dialog = 'contact';
      if (action.type === 'open-delete') next.dialog = 'delete';
      if (action.type === 'close-dialog') {
        next.dialog = null;
        next.reportMatchId = null;
      }
      if (action.type === 'contact-decision' && ['shared', 'declined'].includes(action.decision)) {
        next.contactStatus = action.decision;
        next.identityRevealed = action.decision === 'shared';
        next.dialog = null;
      }
      return next;
    }

    window.NEXORA_STAFF_JOBS_TEST_API = { createJobsState, reduceJobsState };
    if (window.NEXORA_STAFF_JOBS_SKIP_INIT) return;

    document.querySelectorAll('[data-jobs-root]').forEach(initJobsUI);

    function initJobsUI(root) {
      let state = createJobsState();
      let dialogTrigger = null;
      const notice = root.querySelector('[data-jobs-notice]');
      let noticeTimer = 0;

      const showNotice = (message) => {
        notice.textContent = message;
        notice.classList.remove('hidden');
        window.clearTimeout(noticeTimer);
        noticeTimer = window.setTimeout(() => notice.classList.add('hidden'), 2600);
      };

      const render = () => {
        root.querySelectorAll('[data-job-tab]').forEach((tab) => {
          const selected = tab.dataset.jobTab === state.view;
          tab.setAttribute('aria-selected', String(selected));
          tab.classList.toggle('text-nexoraBrandDark', selected);
          tab.classList.toggle('border-nexoraBrand', selected);
        });
        root.querySelectorAll('[data-job-panel]').forEach((panel) => {
          panel.classList.toggle('hidden', panel.dataset.jobPanel !== state.view);
        });
        root.querySelectorAll('[data-job-match]').forEach((card) => {
          const status = state.matches[card.dataset.jobMatch];
          card.dataset.jobMatchStatus = status;
          card.classList.toggle('opacity-50', ['dismissed', 'reported'].includes(status));
          card.querySelectorAll('[data-job-action="interest"], [data-job-action="dismiss"], [data-job-action="report"]').forEach((button) => {
            button.disabled = status !== 'available';
          });
          const label = card.querySelector('[data-job-match-status]');
          if (label) label.textContent = status === 'available' ? '' : status;
        });
        root.querySelectorAll('[data-job-profile-status]').forEach((button) => {
          button.setAttribute('aria-pressed', String(button.dataset.jobProfileStatus === state.profileStatus));
        });
        root.querySelector('[data-job-profile-current]').textContent = state.profileStatus;
        root.querySelector('[data-job-contact-current]').textContent = state.contactStatus;
        root.querySelectorAll('[data-job-dialog]').forEach((dialog) => {
          dialog.classList.toggle('hidden', dialog.dataset.jobDialog !== state.dialog);
          dialog.classList.toggle('flex', dialog.dataset.jobDialog === state.dialog);
        });
      };

      const dispatch = (action, message = '') => {
        state = reduceJobsState(state, action);
        render();
        if (message) showNotice(message);
      };

      root.addEventListener('click', (event) => {
        const tab = event.target.closest('[data-job-tab]');
        if (tab) return dispatch({ type: 'view', view: tab.dataset.jobTab });
        const control = event.target.closest('[data-job-action]');
        if (!control) return;
        const matchId = control.dataset.jobMatchId;
        const action = control.dataset.jobAction;
        if (action === 'interest') dispatch({ type: 'interest', matchId }, 'Anonymous profile sent.');
        if (action === 'dismiss') dispatch({ type: 'dismiss', matchId }, 'Match dismissed. Future suggestions will improve.');
        if (action === 'report') {
          dialogTrigger = control;
          dispatch({ type: 'open-report', matchId });
        }
        if (action === 'submit-report') dispatch({ type: 'report', matchId: state.reportMatchId }, 'Reported and hidden for review.');
        if (action === 'profile-active') dispatch({ type: 'profile-status', status: 'active' }, 'Job profile is active.');
        if (action === 'profile-paused') dispatch({ type: 'profile-status', status: 'paused' }, 'Matching is paused.');
        if (action === 'open-delete' || action === 'open-contact') {
          dialogTrigger = control;
          dispatch({ type: action });
        }
        if (action === 'confirm-delete') dispatch({ type: 'profile-status', status: 'deleted' }, 'Job profile deleted.');
        if (action === 'share-contact') dispatch({ type: 'contact-decision', decision: 'shared' }, 'Contact shared. You can talk directly now.');
        if (action === 'decline-contact') dispatch({ type: 'contact-decision', decision: 'declined' }, 'Declined. The salon learns nothing about your identity.');
        if (action === 'close-dialog') {
          dispatch({ type: 'close-dialog' });
          dialogTrigger?.focus();
        }
        if (action === 'save-profile') showNotice('Job profile saved for this demo.');
      });

      render();
    }
  })();
</script>
```

- [ ] **Step 4: Ensure markup action names match the script**

Use these exact action values in Task 2 markup:

```text
interest, dismiss, report, submit-report, profile-active, profile-paused,
open-delete, confirm-delete, open-contact, share-contact, decline-contact,
close-dialog, save-profile
```

Every action button must have `type="button"`. Match actions also carry the
correct `data-job-match-id`.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
node --test html/pages/staff-app.test.mjs
```

Expected: all seven tests pass.

- [ ] **Step 6: Commit local Jobs behavior**

```bash
git add html/pages/staff-app.html html/pages/staff-app.test.mjs
git commit -m "feat: add interactive staff job matching"
```

### Task 4: Regression and visual verification

**Files:**
- Verify: `html/pages/staff-app.html`
- Verify: `html/pages/staff-app.test.mjs`

**Interfaces:**
- Consumes: completed renamed page, source contract, and Jobs reducer.
- Produces: evidence that the Jobs addition did not break the existing static prototypes.

- [ ] **Step 1: Run syntax and whitespace checks**

```bash
git diff --check
node --check html/pages/staff-app.test.mjs
```

Expected: both commands exit 0 with no output.

- [ ] **Step 2: Run all repository HTML prototype tests**

```bash
node --test html/pages/*.test.mjs html/customer/*.test.mjs
```

Expected: all tests pass. If an unrelated dirty W-9 test fails, record the exact
failure without modifying the user's W-9 files.

- [ ] **Step 3: Inspect the page at mobile and desktop showcase widths**

Start the repository's documented static server:

```bash
python3 -m http.server 8123
```

Open `http://localhost:8123/html/pages/staff-app.html` and verify:

```text
390×844: Jobs fits inside the phone frame; content scrolls; dialogs stay inside
the phone; no horizontal overflow; buttons remain readable.

1440×900: Staff showcase grid stays aligned; the new Jobs article follows
Community; the existing screens retain their sizing.
```

Exercise this sequence:

```text
Community → Jobs → Matches → Interested → Dismiss → Report → My Job Profile →
Pause → Active → Delete confirmation → Activity → Contact requested → Stay
anonymous; reload; repeat Contact requested → Share contact.
```

Expected: each transition updates visible text, disabled state, and temporary
feedback; no identity is shown before Share contact.

- [ ] **Step 4: Confirm scope and repository state**

```bash
git status --short
git diff --stat HEAD~3..HEAD
```

Expected: only the staff rename, Staff Jobs test/code, and the already approved
design/plan commits belong to this feature. Existing W-9 modifications remain
uncommitted and untouched.
