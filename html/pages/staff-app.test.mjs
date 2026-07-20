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
  const matchButtons = {
    rose: [{ disabled: false }, { disabled: false }, { disabled: false }],
    golden: [{ disabled: false }, { disabled: false }, { disabled: false }]
  };
  const matchCards = ['rose', 'golden'].map((matchId) => ({
    dataset: { jobMatch: matchId },
    classList: classList(),
    statusLabel: { textContent: '' },
    querySelectorAll: () => matchButtons[matchId],
    querySelector() { return this.statusLabel; }
  }));
  const dialogs = ['report', 'contact', 'delete'].map((name) => ({
    dataset: { jobDialog: name },
    classList: classList()
  }));
  const notice = { textContent: '', classList: classList() };
  const root = {
    addEventListener(type, handler) {
      if (type === 'click') clickHandler = handler;
    },
    querySelector(selector) {
      if (selector === '[data-jobs-notice]') return notice;
      if (selector === '[data-job-profile-current]') return { textContent: '' };
      if (selector === '[data-job-contact-current]') return { textContent: '' };
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-job-match]') return matchCards;
      if (selector === '[data-job-dialog]') return dialogs;
      return [];
    }
  };
  const window = {
    clearTimeout() {},
    setTimeout() { return 1; }
  };
  window.window = window;
  const document = { querySelectorAll: () => [root] };
  const context = vm.createContext({ window, document, console, structuredClone });
  vm.runInContext(jobsScript(), context);

  return {
    card(matchId) {
      return matchCards.find((card) => card.dataset.jobMatch === matchId);
    },
    click(action, matchId) {
      const control = {
        dataset: { jobAction: action, jobMatchId: matchId },
        focusCount: 0,
        focus() { this.focusCount += 1; },
        closest(selector) {
          if (selector === '[data-job-tab]') return null;
          if (selector === '[data-job-action]') return this;
          return null;
        }
      };
      clickHandler({ target: control });
      return control;
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
