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

test('styles Jobs tabs with the same underline pattern as Community', () => {
  const html = source();
  assert.match(
    html,
    /class="sticky top-\[58px\] z-20 grid grid-cols-3 border-b border-nailBlush bg-white\/95 px-3 text-center backdrop-blur-xl" role="tablist" aria-label="Jobs views"/,
  );
  assert.match(
    html,
    /data-job-tab="matches"[^>]*class="[^"]*border-b-2 border-nexoraBrand[^"]*py-3[^"]*text-\[11px\][^"]*font-semibold[^"]*text-nexoraBrandDark/,
  );
  assert.match(
    html,
    /data-job-tab="profile"[^>]*class="[^"]*border-b-2 border-transparent[^"]*py-3[^"]*text-\[11px\][^"]*font-semibold[^"]*text-nexoraMuted/,
  );
  assert.match(html, /tab\.classList\.toggle\('border-transparent', !selected\)/);
  assert.match(html, /tab\.classList\.toggle\('text-nexoraMuted', !selected\)/);
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
  assert.match(html, /Employment terms are between you and the salon\. Consult a professional for tax\/legal questions\./);
});

function jobsScript() {
  const html = source();
  const script = html.match(/<script id="staff-jobs-script">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'dedicated staff Jobs script must exist');
  return script;
}

function jobsApi() {
  const window = { NEXORA_STAFF_JOBS_SKIP_INIT: true };
  window.window = window;
  const context = vm.createContext({ window, console, structuredClone });
  vm.runInContext(jobsScript(), context);
  assert.ok(window.NEXORA_STAFF_JOBS_TEST_API);
  return window.NEXORA_STAFF_JOBS_TEST_API;
}

function classList() {
  const classes = new Set();
  return {
    contains: (name) => classes.has(name),
    add: (...names) => names.forEach((name) => classes.add(name)),
    remove: (...names) => names.forEach((name) => classes.delete(name)),
    toggle(name, force) {
      if (force === undefined ? !classes.has(name) : force) classes.add(name);
      else classes.delete(name);
    }
  };
}

function createJobsHarness() {
  let clickHandler;
  let keydownHandler;
  let matchCards;
  const document = {
    activeElement: null,
    querySelectorAll: () => [root]
  };
  const matchesTab = {
    dataset: { jobTab: 'matches' },
    classList: classList(),
    setAttribute() {},
    focus() { document.activeElement = this; }
  };
  const createControl = (action, matchId) => ({
    dataset: { jobAction: action, jobMatchId: matchId },
    disabled: false,
    focusCount: 0,
    focus() {
      this.focusCount += 1;
      const card = matchId
        ? matchCards.find((candidate) => candidate.dataset.jobMatch === matchId)
        : null;
      if (!this.disabled && !card?.classList.contains('hidden')) document.activeElement = this;
    },
    closest(selector) {
      if (selector === '[data-job-tab]') return null;
      if (selector === '[data-job-action]') return this;
      return null;
    }
  });
  matchCards = ['rose', 'golden'].map((matchId) => {
    const controls = ['interest', 'dismiss', 'report'].map((action) => createControl(action, matchId));
    return {
      dataset: { jobMatch: matchId },
      classList: classList(),
      controls,
      statusLabel: { textContent: '' },
      querySelectorAll(selector) {
        return controls.filter((control) => selector.includes(`[data-job-action="${control.dataset.jobAction}"]`));
      },
      querySelector() { return this.statusLabel; }
    };
  });
  const contactReview = createControl('open-contact');
  const saveProfile = createControl('save-profile');
  const profileFields = Array.from({ length: 6 }, () => ({ disabled: false }));
  const profileControls = [
    ['profile-active', 'active'],
    ['profile-paused', 'paused'],
    ['open-delete', 'deleted']
  ].map(([action, status]) => {
    const control = createControl(action);
    control.dataset.jobProfileStatus = status;
    control.setAttribute = () => {};
    return control;
  });
  const dialogControls = {
    report: [createControl(null), createControl('close-dialog'), createControl('submit-report')],
    contact: [createControl('share-contact'), createControl('decline-contact'), createControl('close-dialog')],
    delete: [createControl('close-dialog'), createControl('confirm-delete')]
  };
  const dialogs = ['report', 'contact', 'delete'].map((name) => ({
    dataset: { jobDialog: name },
    classList: classList(),
    controls: dialogControls[name],
    focus() { document.activeElement = this; },
    querySelectorAll() { return this.controls; }
  }));
  const pausedExplanation = { classList: classList() };
  pausedExplanation.classList.add('hidden');
  const contactRows = [
    ['requested', 'Contact requested', 'Rose Nails & Spa wants to talk.', 'requested'],
    ['shared', 'Contact shared', 'You shared your contact. Both sides can now talk directly.', 'shared'],
    ['declined', 'Contact declined', 'You stayed anonymous. The salon learned nothing about your identity.', 'declined']
  ].map(([status, title, description, label], index) => {
    const row = {
      dataset: { jobContactState: status },
      classList: classList(),
      title: { textContent: title },
      description: { textContent: description },
      status: { textContent: label },
      attributes: {},
      setAttribute(name, value) { this.attributes[name] = value; },
      querySelector(selector) {
        if (selector === '[data-job-contact-title]') return this.title;
        if (selector === '[data-job-contact-description]') return this.description;
        if (selector === '[data-job-contact-current]') return this.status;
        return null;
      }
    };
    if (index > 0) row.classList.add('hidden');
    return row;
  });
  const notice = { textContent: '', classList: classList() };
  const root = {
    addEventListener(type, handler) {
      if (type === 'click') clickHandler = handler;
      if (type === 'keydown') keydownHandler = handler;
    },
    querySelector(selector) {
      if (selector === '[data-jobs-notice]') return notice;
      if (selector === '[data-job-paused-explanation]') return pausedExplanation;
      if (selector === '[data-job-profile-current]') return { textContent: '' };
      if (selector === '[data-job-contact-current]') return contactRows[0].status;
      if (selector === '[data-job-tab="matches"]') return matchesTab;
      const dialogName = selector.match(/^\[data-job-dialog="([^"]+)"\]$/)?.[1];
      if (dialogName) return dialogs.find((dialog) => dialog.dataset.jobDialog === dialogName);
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-job-tab]') return [matchesTab];
      if (selector === '[data-job-match]') return matchCards;
      if (selector === '[data-job-dialog]') return dialogs;
      if (selector === '[data-job-contact-state]') return contactRows;
      if (selector === '[data-job-profile-status]') return profileControls;
      if (selector === '[data-job-action="open-contact"]') return [contactReview];
      if (selector === '[data-job-profile-field] input, [data-job-action="save-profile"]') {
        return [...profileFields, saveProfile];
      }
      return [];
    }
  };
  const window = {
    clearTimeout() {},
    setTimeout() { return 1; }
  };
  window.window = window;
  const context = vm.createContext({ window, document, console, structuredClone });
  vm.runInContext(jobsScript(), context);

  return {
    card(matchId) {
      return matchCards.find((card) => card.dataset.jobMatch === matchId);
    },
    button(matchId, action) {
      return this.card(matchId).controls.find((control) => control.dataset.jobAction === action);
    },
    profileButton(action) {
      return profileControls.find((control) => control.dataset.jobAction === action);
    },
    contactReview,
    profileFields,
    saveProfile,
    notice,
    dialog(name) {
      return dialogs.find((dialog) => dialog.dataset.jobDialog === name);
    },
    dialogControl(name, actionOrIndex) {
      const controls = this.dialog(name).controls;
      return typeof actionOrIndex === 'number'
        ? controls[actionOrIndex]
        : controls.find((control) => control.dataset.jobAction === actionOrIndex);
    },
    pausedExplanation,
    contactRow(status) {
      return contactRows.find((row) => row.dataset.jobContactState === status);
    },
    visibleContactRows() {
      return contactRows.filter((row) => !row.classList.contains('hidden'));
    },
    activeElement() { return document.activeElement; },
    matchesTab,
    click(action, matchId) {
      const control = matchId
        ? this.button(matchId, action)
        : action === 'open-contact'
          ? contactReview
          : action === 'save-profile'
            ? saveProfile
          : profileControls.find((candidate) => candidate.dataset.jobAction === action)
            || dialogs.find((dialog) => !dialog.classList.contains('hidden'))
              ?.controls.find((candidate) => candidate.dataset.jobAction === action)
            || createControl(action);
      if (control.disabled) return control;
      document.activeElement = control;
      clickHandler({ target: control });
      return control;
    },
    delegateClick(control) {
      clickHandler({ target: control });
    },
    pressKey(key, { shiftKey = false } = {}) {
      const event = {
        key,
        shiftKey,
        defaultPrevented: false,
        preventDefault() { this.defaultPrevented = true; }
      };
      keydownHandler?.(event);
      return event;
    }
  };
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

test('hides reported matches while only de-emphasizing dismissed matches', () => {
  const jobs = createJobsHarness();
  jobs.click('dismiss', 'golden');
  const reportTrigger = jobs.click('report', 'rose');
  jobs.click('submit-report');

  assert.equal(jobs.card('rose').classList.contains('hidden'), true);
  assert.equal(jobs.card('golden').classList.contains('hidden'), false);
  assert.equal(jobs.card('golden').classList.contains('opacity-50'), true);
  assert.equal(reportTrigger.focusCount, 1);
});

test('restores the dialog trigger after every dialog-closing outcome', () => {
  for (const [openAction, closeAction, matchId] of [
    ['report', 'submit-report', 'rose'],
    ['open-delete', 'confirm-delete'],
    ['open-contact', 'share-contact'],
    ['open-contact', 'decline-contact'],
    ['open-contact', 'close-dialog']
  ]) {
    const jobs = createJobsHarness();
    const trigger = jobs.click(openAction, matchId);
    jobs.click(closeAction);
    assert.equal(trigger.focusCount, 1, `${closeAction} must restore focus`);
  }
});

test('moves focus to the visible Matches tab when reporting hides the trigger', () => {
  const jobs = createJobsHarness();
  jobs.click('report', 'rose');
  jobs.click('submit-report');

  assert.equal(jobs.activeElement(), jobs.matchesTab);
});

test('makes profile deletion destructive and terminal', () => {
  const jobs = jobsApi();
  let state = jobs.reduceJobsState(jobs.createJobsState(), { type: 'profile-status', status: 'deleted' });
  assert.equal(state.profileStatus, 'deleted');
  assert.equal(state.matches.rose, 'deleted');
  assert.equal(state.matches.golden, 'deleted');

  state = jobs.reduceJobsState(state, { type: 'profile-status', status: 'active' });
  assert.equal(state.profileStatus, 'deleted');
  assert.equal(state.matches.rose, 'deleted');
  state = jobs.reduceJobsState(state, { type: 'profile-status', status: 'paused' });
  assert.equal(state.profileStatus, 'deleted');
  assert.equal(state.matches.golden, 'deleted');
  state = jobs.reduceJobsState(state, { type: 'open-contact' });
  assert.equal(state.dialog, null);
});

test('hides deleted matches and does not restore them after profile activation', () => {
  const jobs = createJobsHarness();
  jobs.click('open-delete');
  jobs.click('confirm-delete');
  assert.equal(jobs.card('rose').classList.contains('hidden'), true);
  assert.equal(jobs.card('golden').classList.contains('hidden'), true);
  assert.equal(jobs.profileButton('profile-active').disabled, true);
  assert.equal(jobs.profileButton('profile-paused').disabled, true);
  assert.equal(jobs.profileFields.every((field) => field.disabled), true);
  assert.equal(jobs.saveProfile.disabled, true);
  assert.equal(jobs.contactReview.disabled, true);
  assert.equal(jobs.activeElement(), jobs.matchesTab);
  const deletionNotice = jobs.notice.textContent;

  jobs.click('profile-active');
  jobs.delegateClick(jobs.saveProfile);
  jobs.delegateClick(jobs.contactReview);
  assert.equal(jobs.card('rose').classList.contains('hidden'), true);
  assert.equal(jobs.card('golden').classList.contains('hidden'), true);
  assert.equal(jobs.notice.textContent, deletionNotice);
  assert.equal(jobs.dialog('contact').classList.contains('hidden'), true);
});

test('makes shared and declined contact decisions terminal for the request', () => {
  const jobs = jobsApi();
  let state = jobs.reduceJobsState(jobs.createJobsState(), { type: 'contact-decision', decision: 'shared' });
  state = jobs.reduceJobsState(state, { type: 'contact-decision', decision: 'declined' });
  assert.equal(state.contactStatus, 'shared');
  assert.equal(state.identityRevealed, true);
  state = jobs.reduceJobsState(state, { type: 'open-contact' });
  assert.equal(state.dialog, null);

  state = jobs.reduceJobsState(jobs.createJobsState(), { type: 'contact-decision', decision: 'declined' });
  state = jobs.reduceJobsState(state, { type: 'contact-decision', decision: 'shared' });
  assert.equal(state.contactStatus, 'declined');
  assert.equal(state.identityRevealed, false);
  state = jobs.reduceJobsState(state, { type: 'open-contact' });
  assert.equal(state.dialog, null);
});

test('disables Contact Review after either terminal decision', () => {
  for (const decision of ['share-contact', 'decline-contact']) {
    const jobs = createJobsHarness();
    jobs.click('open-contact');
    jobs.click(decision);
    assert.equal(jobs.contactReview.disabled, true);
    jobs.click('open-contact');
    assert.equal(jobs.dialog('contact').classList.contains('hidden'), true);
  }
});

test('keeps rendered Report controls enabled after interest and dismiss', () => {
  const jobs = createJobsHarness();
  jobs.click('interest', 'rose');
  assert.equal(jobs.button('rose', 'interest').disabled, true);
  assert.equal(jobs.button('rose', 'dismiss').disabled, true);
  assert.equal(jobs.button('rose', 'report').disabled, false);
  jobs.click('report', 'rose');
  assert.equal(jobs.dialog('report').classList.contains('hidden'), false);
  jobs.click('close-dialog');

  jobs.click('dismiss', 'golden');
  assert.equal(jobs.button('golden', 'interest').disabled, true);
  assert.equal(jobs.button('golden', 'dismiss').disabled, true);
  assert.equal(jobs.button('golden', 'report').disabled, false);
  jobs.click('report', 'golden');
  assert.equal(jobs.dialog('report').classList.contains('hidden'), false);
});

test('rejects interest while matching is paused', () => {
  const jobs = jobsApi();
  let state = jobs.reduceJobsState(jobs.createJobsState(), { type: 'profile-status', status: 'paused' });
  state = jobs.reduceJobsState(state, { type: 'interest', matchId: 'rose' });

  assert.equal(state.profileStatus, 'paused');
  assert.equal(state.matches.rose, 'available');
  assert.equal(state.identityRevealed, false);
});

test('explains paused matching while disabling Interest and retaining Report', () => {
  assert.match(
    source(),
    /data-job-paused-explanation>\s*Matching is paused\. Salons cannot receive your anonymous profile until you reactivate it\.\s*<\/div>/
  );
  const jobs = createJobsHarness();
  jobs.click('profile-paused');

  assert.equal(jobs.pausedExplanation.classList.contains('hidden'), false);
  assert.equal(jobs.button('rose', 'interest').disabled, true);
  assert.equal(jobs.button('golden', 'interest').disabled, true);
  assert.equal(jobs.button('rose', 'report').disabled, false);
  assert.equal(jobs.button('golden', 'report').disabled, false);
});

test('rejects both contact decisions after profile deletion', () => {
  const jobs = jobsApi();
  for (const decision of ['shared', 'declined']) {
    const deleted = jobs.reduceJobsState(jobs.createJobsState(), { type: 'profile-status', status: 'deleted' });
    const next = jobs.reduceJobsState(deleted, { type: 'contact-decision', decision });

    assert.equal(next.contactStatus, deleted.contactStatus);
    assert.equal(next.identityRevealed, deleted.identityRevealed);
  }
});

test('moves focus into each opened Jobs dialog', () => {
  for (const [openAction, matchId, dialogName, firstControl] of [
    ['report', 'rose', 'report', 0],
    ['open-contact', undefined, 'contact', 'share-contact'],
    ['open-delete', undefined, 'delete', 'close-dialog']
  ]) {
    const jobs = createJobsHarness();
    jobs.click(openAction, matchId);
    assert.equal(jobs.activeElement(), jobs.dialogControl(dialogName, firstControl), `${dialogName} initial focus`);
  }
});

test('Escape closes the active dialog and restores its trigger', () => {
  const jobs = createJobsHarness();
  const trigger = jobs.click('report', 'rose');
  jobs.dialogControl('report', 'submit-report').focus();
  const escape = jobs.pressKey('Escape');

  assert.equal(escape.defaultPrevented, true);
  assert.equal(jobs.dialog('report').classList.contains('hidden'), true);
  assert.equal(jobs.activeElement(), trigger);
});

test('forward Tab wraps to the first enabled control in the active dialog', () => {
  const jobs = createJobsHarness();
  jobs.click('open-contact');
  jobs.dialogControl('contact', 'close-dialog').focus();
  const tab = jobs.pressKey('Tab');

  assert.equal(tab.defaultPrevented, true);
  assert.equal(jobs.activeElement(), jobs.dialogControl('contact', 'share-contact'));
});

test('reverse Shift+Tab wraps to the last enabled control in the active dialog', () => {
  const jobs = createJobsHarness();
  jobs.click('open-contact');
  jobs.dialogControl('contact', 'share-contact').focus();
  const tab = jobs.pressKey('Tab', { shiftKey: true });

  assert.equal(tab.defaultPrevented, true);
  assert.equal(jobs.activeElement(), jobs.dialogControl('contact', 'close-dialog'));
});

test('shows truthful copy for each current contact state', () => {
  const html = source();
  for (const pattern of [
    /data-job-contact-state="requested"[^\n]*data-job-contact-title>Contact requested<\/p>[^\n]*data-job-contact-description>Rose Nails &amp; Spa wants to talk\.<\/p>[^\n]*data-job-contact-current>requested<\/p>/,
    /data-job-contact-state="shared"[^\n]*data-job-contact-title>Contact shared<\/p>[^\n]*data-job-contact-description>You shared your contact\. Both sides can now talk directly\.<\/p>[^\n]*data-job-contact-current>shared<\/p>/,
    /data-job-contact-state="declined"[^\n]*data-job-contact-title>Contact declined<\/p>[^\n]*data-job-contact-description>You stayed anonymous\. The salon learned nothing about your identity\.<\/p>[^\n]*data-job-contact-current>declined<\/p>/
  ]) assert.match(html, pattern);

  const requestedJobs = createJobsHarness();
  assert.deepEqual(requestedJobs.visibleContactRows().map((row) => [
    row.title.textContent,
    row.description.textContent,
    row.status.textContent
  ]), [['Contact requested', 'Rose Nails & Spa wants to talk.', 'requested']]);

  const sharedJobs = createJobsHarness();
  sharedJobs.click('open-contact');
  sharedJobs.click('share-contact');
  assert.deepEqual(sharedJobs.visibleContactRows().map((row) => [
    row.title.textContent,
    row.description.textContent,
    row.status.textContent
  ]), [['Contact shared', 'You shared your contact. Both sides can now talk directly.', 'shared']]);

  const declinedJobs = createJobsHarness();
  declinedJobs.click('open-contact');
  declinedJobs.click('decline-contact');
  assert.deepEqual(declinedJobs.visibleContactRows().map((row) => [
    row.title.textContent,
    row.description.textContent,
    row.status.textContent
  ]), [['Contact declined', 'You stayed anonymous. The salon learned nothing about your identity.', 'declined']]);
});

test('states current-salon insight exclusion and labels Matches AI visibly', () => {
  const html = source();
  assert.match(html, /Your current salon is excluded from grouped demand insights\./);
  assert.match(html, /data-job-ai-badge[^>]*>AI<\/span>/);
});
