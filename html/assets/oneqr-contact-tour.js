(() => {
  'use strict';
  // Tour copy and controls: from-po/OneQR-prototype-v25.html, AI Smart Tour.
  const trigger = document.getElementById('oneqrAiTour');
  if (!trigger || !document.querySelector('[data-qr-panel]')) return;
  const contactDialog = document.getElementById('contact-card-modal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tour = document.createElement('section');
  tour.className = 'oneqr-ai-tour';
  tour.id = 'oneqrAiTourPanel';
  tour.hidden = true;
  tour.setAttribute('aria-label', 'AI SMART TOUR');
  tour.dataset.poSource = 'from-po/OneQR-prototype-v25.html:1709';
  if (typeof tour.showPopover === 'function') tour.setAttribute('popover', 'manual');
  tour.innerHTML = '<div class="oneqr-tour-card"><div class="oneqr-tour-head"><b>✦ AI SMART TOUR</b><span class="oneqr-tour-step"></span>' +
    '<button type="button" data-tour-pause aria-label="Pause" aria-pressed="false">⏸</button>' +
    '<button type="button" data-tour-next aria-label="Next">⏭</button>' +
    '<button type="button" data-tour-close aria-label="Close tour">✕</button></div>' +
    '<div class="oneqr-tour-progress" role="progressbar" aria-label="AI SMART TOUR" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>' +
    '<div class="oneqr-tour-body" aria-live="polite" aria-atomic="true"></div></div>';
  document.body.append(tour);
  const pause = tour.querySelector('[data-tour-pause]');
  const progress = tour.querySelector('.oneqr-tour-progress');
  const bar = progress.querySelector('i');
  const duration = 4000;
  let running = false;
  let paused = false;
  let index = 0;
  let elapsed = 0;
  let lastTime = null;
  let frame;
  let ownedDialog = null;
  let highlighted = null;
  let inputSnapshot = null;
  let opener;
  let interacted = false;
  let automaticStart;
  let steps = [];

  function openContact(tab) {
    window.NEXORA_CONTACT_CARD.open(tab);
    ownedDialog = contactDialog;
  }
  const oneqrSteps = [
    {
      selector: '#qr-panel-one-qr .oneqr-qrcard',
      textFrom: '#qr-panel-one-qr .oneqr-qrcard-detail > p'
    },
    {
      selector: '[data-oneqr-editor-link]',
      text: 'Pick an industry — the buttons are built for it.'
    },
    {
      selector: '#oneqrModuleLinkForm',
      text: 'Paste any link — we detect the platform.',
      enter() {
        const input = document.getElementById('oneqrModuleLinkInput');
        inputSnapshot = { input, value: input.value };
      },
      animate(time) {
        const text = 'https://instagram.com/bitcoinnailbar';
        // Show the PO typing example without submitting a module or changing its draft.
        inputSnapshot.input.value = text.slice(0, reducedMotion.matches ? text.length : Math.floor(time / 32));
      }
    },
    {
      selector: '#oneqrModuleList',
      text: 'Each button: a name, a status, a switch.'
    },
    {
      selector: '.oneqr-preview',
      text: 'Preview exactly what a customer sees after scanning.'
    },
    {
      selector: '#contact-card-preview',
      text: 'Everything reads from the Business Profile. Edit it once in Contact card.',
      enter() { openContact('shop'); }
    },
    {
      selector: '#contact-team-list',
      text: 'Multi-tech shops: one code per person, the owner sees the roll-up.',
      enter() { openContact('team'); }
    },
    {
      selector: '#oneqrLeadList',
      text: 'After saving, the visitor can send their own contact back — it lands here.'
    },
    {
      selector: '#oneqrProfileOutputs',
      text: 'Fill the profile once — QR page, vCard, Wallet, SEO and AI Voice all read from it.'
    },
    {
      selector: '#oneqrSaveSettings',
      text: 'Save Settings to keep your module changes.'
    }
  ];
  // Other QR Stations use their own existing UI copy, including its selected language.
  const stationSteps = {
    'qr-stations': [
      { selector: '.tip-qr-heading', textFrom: '[data-tip-copy="tipDescription"]' },
      { selector: '.tip-qr-business', textFrom: '.tip-qr-business-copy > p' },
      { selector: '.tip-qr-activity', textFrom: '[data-tip-copy="activityDesc"]' },
      { selector: '.tip-qr-steps', textFrom: '.tip-qr-steps p' },
      { selector: '[data-tip-copy="sameQR"]', textFrom: '[data-tip-copy="sameQR"]' }
    ],
    'accept-payment': [
      { selector: '.qr-workflow-intro', textFrom: '.qr-workflow-intro' },
      { selector: '[data-payment-qr-card]', textFrom: '.direct-payment-detail > p' },
      { selector: '.payout-methods-card', textFrom: '#payout-methods-title' }
    ],
    'check-in': [
      { selector: '.oneqr-checkin-heading', textFrom: '.oneqr-checkin-heading p' },
      { selector: '[data-checkin-option="qr"]', textFrom: '[data-checkin-option="qr"] p' },
      { selector: '[data-checkin-option="device"]', textFrom: '[data-checkin-option="device"] p' }
    ],
    'referral-link': [
      { selector: '.referral-card', textFrom: '.qr-workflow-intro' },
      { selector: '.referral-card fieldset', textFrom: '.referral-card legend' },
      { selector: '.referral-actions', textFrom: '.referral-actions button span' }
    ],
    'staff-invite-qr': [
      { selector: '.staff-invite-card', textFrom: '.qr-workflow-intro' },
      { selector: '.staff-invite-qr-frame', textFrom: '.staff-invite-card > p' },
      { selector: '.staff-invite-actions', textFrom: '.staff-invite-actions button span' }
    ]
  };
  function stepsFor(panel) {
    const tab = panel.dataset.qrPanel;
    if (tab === 'one-qr') return oneqrSteps.filter(step => document.querySelector(step.selector));
    return (stationSteps[tab] || []).map(step => {
      const target = panel.querySelector(step.selector);
      return {
        target,
        text: [...panel.querySelectorAll(step.textFrom)].filter(node => node.getClientRects().length).map(node => node.textContent.trim()).filter(Boolean).join(' ')
      };
    }).filter(step => step.target?.getClientRects().length && step.text);
  }

  function detachTour() {
    if (typeof tour.hidePopover === 'function') {
      try { tour.hidePopover(); } catch { /* A hidden tour has no popover to close. */ }
    }
    document.body.append(tour);
  }
  function cleanupStep(keepDialog = false) {
    highlighted?.classList.remove('oneqr-tour-spot');
    highlighted = null;
    if (inputSnapshot) {
      inputSnapshot.input.value = inputSnapshot.value;
      inputSnapshot = null;
    }
    detachTour();
    const modal = ownedDialog;
    ownedDialog = null;
    if (!keepDialog && modal?.open) modal.close();
  }
  function showTour() {
    // Keep controls above, and inside, the active native modal's focus boundary.
    const modal = document.querySelector('dialog[open]');
    (modal || document.body).append(tour);
    tour.hidden = false;
    if (typeof tour.showPopover === 'function') {
      try { tour.showPopover(); } catch { /* Fixed positioning also supports browsers without popovers. */ }
    }
  }
  function showStep() {
    const focusedControl = tour.contains(document.activeElement) ? document.activeElement : null;
    cleanupStep();
    elapsed = 0;
    lastTime = null;
    bar.style.width = '0%';
    progress.setAttribute('aria-valuenow', '0');
    const step = steps[index];
    step.enter?.();
    highlighted = step.target || document.querySelector(step.selector);
    if (highlighted?.getClientRects().length) {
      highlighted.classList.add('oneqr-tour-spot');
      highlighted.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center', inline: 'nearest' });
    }
    tour.querySelector('.oneqr-tour-step').textContent = (index + 1) + '/' + steps.length;
    const text = step.textFrom ? document.querySelector(step.textFrom)?.textContent.trim() : step.text;
    tour.querySelector('.oneqr-tour-body').textContent = text || '';
    showTour();
    focusedControl?.focus({ preventScroll: true });
  }
  function setPaused(value) {
    paused = value;
    pause.textContent = value ? '▶' : '⏸';
    pause.setAttribute('aria-pressed', String(value));
    lastTime = null;
  }
  function next() {
    if (!running) return;
    setPaused(false);
    index = (index + 1) % steps.length;
    showStep();
  }
  function tick(time) {
    if (!running) return;
    if (!paused && !document.hidden) {
      if (lastTime !== null) elapsed += Math.min(time - lastTime, 100);
      lastTime = time;
      steps[index].animate?.(elapsed);
      const percent = Math.min(100, elapsed / duration * 100);
      bar.style.width = percent + '%';
      progress.setAttribute('aria-valuenow', String(Math.floor(percent)));
      if (elapsed >= duration) next();
    } else lastTime = null;
    frame = requestAnimationFrame(tick);
  }
  function stop({ handoff = false, restoreFocus = false } = {}) {
    running = false;
    trigger.setAttribute('aria-expanded', 'false');
    cancelAnimationFrame(frame);
    cleanupStep(handoff);
    tour.hidden = true;
    if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
  }
  function start(manual = true) {
    clearTimeout(automaticStart);
    const panel = document.querySelector('[data-qr-panel]:not([hidden])');
    if (document.querySelector('dialog[open]') || !panel) return;
    stop();
    steps = stepsFor(panel);
    if (!steps.length) return;
    opener = document.activeElement;
    running = true;
    trigger.setAttribute('aria-expanded', 'true');
    index = 0;
    setPaused(false);
    showStep();
    frame = requestAnimationFrame(tick);
    if (manual) pause.focus({ preventScroll: true });
  }
  pause.addEventListener('click', () => setPaused(!paused));
  tour.querySelector('[data-tour-next]').addEventListener('click', next);
  tour.querySelector('[data-tour-close]').addEventListener('click', () => stop({ restoreFocus: true }));
  trigger.addEventListener('click', () => start());
  function manualControl(event) {
    if (!event.isTrusted) return;
    if (tour.contains(event.target)) {
      if (event.type === 'keydown' && event.key === 'Escape') {
        event.preventDefault();
        stop({ restoreFocus: true });
      }
      return;
    }
    interacted = true;
    clearTimeout(automaticStart);
    if (running) stop({ handoff: Boolean(ownedDialog?.contains(event.target)) });
  }
  document.addEventListener('pointerdown', manualControl, true);
  document.addEventListener('keydown', manualControl, true);
  window.addEventListener('nexora:qr-tab-changed', () => {
    if (running) stop();
  });
  window.addEventListener('pagehide', () => stop());
  // Match the PO's automatic introduction, unless the user has already started working.
  automaticStart = setTimeout(() => {
    if (!interacted && !document.hidden) start(false);
  }, 1200);
})();
