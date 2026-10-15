(function () {
  'use strict';
  var panel = document.getElementById('qr-panel-one-qr');
  if (!panel) return;
  var profile = window.NEXORA_ONEQR_PROFILE;
  var esc = profile.escapeText;
  var leadFeedback = document.getElementById('oneqrLeadFeedback');

  function renderOutputs() {
    var card = profile.read();
    var phone = card.showPhone && card.phone ? card.phone : 'Phone hidden';
    var address = profile.address(card) || 'Address hidden';
    var outputs = [
      ['Customer QR page', profile.pageUrl()],
      ['Contact card + vCard', card.name + ' · ' + phone],
      ['Apple / Google Wallet', card.name + ' · ' + card.title + ' · Demo preview'],
      ['Call · Text buttons', phone],
      ['Directions button', card.addressMode === 'full' ? address : 'Hidden — full address required'],
      ['Landing page', card.website || profile.pageUrl()],
      ['Google SEO schema', [address, profile.hours(card)].filter(Boolean).join(' · ') + ' · Preview'],
      ['AI Voice greeting', '“Thanks for calling ' + card.name + '…” · Preview']
    ];
    document.getElementById('oneqrProfileOutputs').innerHTML = outputs.map(function (item) {
      return '<div class="oneqr-profile-output"><b>' + esc(item[0]) + '</b><span>' + esc(item[1]) + '</span></div>';
    }).join('');
    document.getElementById('oneqrProfileState').textContent = card.configured ? 'Profile saved' : 'Business profile';
  }

  function renderLeads() {
    var leads = profile.readLeads();
    document.getElementById('oneqrLeadCount').textContent = leads.length;
    document.getElementById('oneqrLeadList').innerHTML = leads.length ? leads.map(function (lead) {
      var date = new Date(lead.createdAt);
      var captured = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return '<div class="oneqr-lead-row"><span class="oneqr-lead-avatar" aria-hidden="true">' + esc(lead.name.charAt(0).toUpperCase()) + '</span>' +
        '<div class="oneqr-lead-details"><strong>' + esc(lead.name) + '</strong><small>' + esc([lead.phone, lead.email].filter(Boolean).join(' · ')) + '</small><small>' + esc(captured + ' · Customer QR page') + '</small></div>' +
        '<span class="' + (lead.smsConsent ? 'oneqr-badge' : 'oneqr-pill') + '">' + (lead.smsConsent ? 'SMS consent given' : 'Contact only') + '</span>' +
        '<button type="button" data-delete-oneqr-lead="' + esc(lead.id) + '" aria-label="Delete contact for ' + esc(lead.name) + '">Delete</button></div>';
    }).join('') : '<p class="oneqr-info-note">No contacts yet. Try “Send yours” in the customer preview.</p>';
  }

  document.querySelector('[data-edit-oneqr-profile]').addEventListener('click', function () { window.NEXORA_CONTACT_CARD.open(); });
  document.addEventListener('oneqr:contact-saved', function () { renderOutputs(); startTimer(); });
  document.addEventListener('oneqr:leads-changed', renderLeads);
  window.addEventListener('storage', function (event) { if (event.key === 'taxiq:oneqr-contact-card' || event.key === null) renderOutputs(); });
  document.getElementById('oneqrLeadList').addEventListener('click', function (event) {
    var button = event.target.closest('[data-delete-oneqr-lead]');
    if (!button) return;
    try {
      profile.saveLeads(profile.readLeads().filter(function (lead) { return lead.id !== button.dataset.deleteOneqrLead; }));
      leadFeedback.textContent = 'Contact deleted from this browser.';
    } catch (error) { leadFeedback.textContent = 'Could not delete this contact. Browser storage is unavailable.'; }
  });
  document.getElementById('oneqrExportLeads').addEventListener('click', function () {
    var leads = profile.readLeads();
    if (!leads.length) { leadFeedback.textContent = 'No contacts to export yet.'; return; }
    var rows = [['name', 'phone', 'email', 'sms_consent', 'consent_at', 'captured_at', 'source']].concat(leads.map(function (lead) {
      return [lead.name, lead.phone, lead.email, lead.smsConsent ? 'yes' : 'no', lead.consentAt, lead.createdAt, lead.source];
    }));
    var csv = rows.map(function (row) {
      return row.map(function (value) {
        var safe = String(value || '');
        if (/^[\s]*[=+@-]/.test(safe) || /^[\t\r]/.test(safe)) safe = "'" + safe;
        return '"' + safe.replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\r\n');
    profile.download('\uFEFF' + csv, 'text/csv;charset=utf-8', 'oneqr-contacts.csv');
    leadFeedback.textContent = leads.length + ' contacts exported with SMS consent and source.';
  });
  document.getElementById('oneqrSendToCrm').addEventListener('click', function () {
    var count = profile.readLeads().length;
    leadFeedback.textContent = count ? 'Demo: ' + count + ' contacts ready for HubSpot / Salesforce / Zapier. No CRM is connected.' : 'No contacts to send yet.';
  });
  document.getElementById('oneqrResetTemplate').addEventListener('click', function () { document.getElementById('oneqrResetModules').click(); });

  var timer = {};
  try { timer = JSON.parse(sessionStorage.getItem('taxiq:oneqr-setup-time') || '{}') || {}; } catch (error) { /* Keep an in-memory timer. */ }
  function storeTimer() {
    try { sessionStorage.setItem('taxiq:oneqr-setup-time', JSON.stringify(timer)); } catch (error) { /* The timer can run without storage. */ }
  }
  function renderTimer() {
    var seconds = timer.startedAt ? Math.max(0, Math.floor(((timer.finishedAt || Date.now()) - timer.startedAt) / 1000)) : 0;
    document.getElementById('oneqrSetupTime').textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
    document.getElementById('oneqrSetupState').textContent = timer.finishedAt ? (seconds < 120 ? 'Saved · Under 2 minutes' : 'Saved') : 'Not saved yet';
  }
  function startTimer() {
    if (timer.startedAt || timer.finishedAt) return;
    timer.startedAt = Date.now();
    storeTimer();
    renderTimer();
  }
  panel.addEventListener('input', startTimer);
  panel.addEventListener('change', startTimer);
  panel.addEventListener('click', function (event) {
    if (event.target.closest('.oneqr-modules button, #oneqrSaveSettings, #oneqrResetTemplate')) startTimer();
  }, true);
  document.addEventListener('oneqr:settings-saved', function () {
    startTimer();
    if (!timer.finishedAt) timer.finishedAt = Date.now();
    storeTimer();
    renderTimer();
  });
  setInterval(function () { if (timer.startedAt && !timer.finishedAt) renderTimer(); }, 1000);

  var flowStep = 0;
  var selectedTip = '18%';
  var flow = document.createElement('dialog');
  flow.className = 'oneqr-experience-dialog';
  flow.setAttribute('aria-labelledby', 'oneqrFlowTitle');
  flow.innerHTML = '<div class="oneqr-dialog-heading"><h2 id="oneqrFlowTitle">Post-service journey</h2><button type="button" data-close-flow aria-label="Close">×</button></div>' +
    '<p>Sample salon journey · <span id="oneqrFlowStep"></span> · Demo</p><div id="oneqrFlowBody"></div><p id="oneqrFlowFeedback" role="status" aria-live="polite"></p>' +
    '<div class="oneqr-dialog-actions"><button type="button" id="oneqrFlowBack">Back</button><button class="is-primary" type="button" id="oneqrFlowNext">Next</button></div>';
  document.body.appendChild(flow);
  function renderFlow() {
    var card = profile.read();
    var screens = [
      '<p>Thanks for visiting</p><h3>' + esc(card.name) + '</h3><p>Your tech today: <strong>Kim Nguyen</strong></p><div class="oneqr-flow-tips">' + ['15%', '18%', '20%'].map(function (tip) {
        return '<button type="button" data-flow-tip="' + tip + '" aria-pressed="' + (tip === selectedTip) + '">' + tip + '</button>';
      }).join('') + '</div><button class="is-primary" type="button" data-flow-demo="Tip preview selected. No payment is processed.">Tip Kim · Demo</button><small>The tip stays attributed to the tech who served you.</small>',
      '<h3>How did Kim do?</h3><p>Share your experience with ' + esc(card.name) + '.</p><button class="is-primary" type="button" data-flow-demo="Google review preview. No review is posted.">Review on Google</button><button type="button" data-flow-demo="Private feedback preview for the business.">Private feedback to the business</button><small>Both options are available to every guest.</small>',
      '<p>' + esc(card.name) + '</p><h3>Kim Nguyen</h3><p>Nail artist · Shop staff</p>' + (card.showPhone && card.phone ? '<p>' + esc(card.phone) + ' · Shop line</p>' : '') +
      '<button class="is-primary" type="button" data-flow-save>Save Kim’s card</button><button type="button" data-flow-demo="Wallet pass preview. Adding a pass is simulated.">Add to Wallet · Demo</button><button type="button" data-flow-demo="Next appointment preview with Kim Nguyen.">Book Kim next time</button><small>The staff card uses the business branding and shop phone.</small>'
    ];
    flow.querySelector('#oneqrFlowStep').textContent = 'Step ' + (flowStep + 1) + ' of 3';
    flow.querySelector('#oneqrFlowBody').innerHTML = '<div class="oneqr-flow-screen">' + screens[flowStep] + '</div>';
    flow.querySelector('#oneqrFlowBack').disabled = flowStep === 0;
    flow.querySelector('#oneqrFlowNext').textContent = flowStep === 2 ? 'Done' : 'Next →';
    flow.querySelector('#oneqrFlowFeedback').textContent = '';
  }
  document.getElementById('oneqrPostService').addEventListener('click', function () { flowStep = 0; selectedTip = '18%'; renderFlow(); flow.showModal(); });
  flow.querySelector('[data-close-flow]').addEventListener('click', function () { flow.close(); });
  flow.querySelector('#oneqrFlowBack').addEventListener('click', function () { if (flowStep > 0) { flowStep--; renderFlow(); } });
  flow.querySelector('#oneqrFlowNext').addEventListener('click', function () { if (flowStep < 2) { flowStep++; renderFlow(); } else flow.close(); });
  flow.addEventListener('click', function (event) {
    if (event.target === flow) flow.close();
    var tip = event.target.closest('[data-flow-tip]');
    if (tip) { selectedTip = tip.dataset.flowTip; renderFlow(); }
    var demo = event.target.closest('[data-flow-demo]');
    if (demo) flow.querySelector('#oneqrFlowFeedback').textContent = demo.dataset.flowDemo;
    if (event.target.closest('[data-flow-save]')) {
      profile.downloadVCard(Object.assign({}, profile.read(), { name: 'Kim Nguyen', title: 'Nail artist · ' + profile.read().name }));
      flow.querySelector('#oneqrFlowFeedback').textContent = 'Kim’s vCard downloaded with the shop contact details.';
    }
  });

  renderOutputs();
  renderLeads();
  renderTimer();
})();
