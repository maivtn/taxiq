/* Salon Settings → AI Receptionist reuses the existing voice editor and dialogs. */
(function () {
  'use strict';

  if (document.documentElement.dataset.salonSettingsContext !== 'ai-receptionist') return;

  var root = document.getElementById('panel-settings');
  var tabs = document.querySelector('[data-salon-settings-tabs]');
  var voice = root.querySelector('[data-settings-tab-panel="voice"]');
  document.querySelector('.page-title').textContent = 'Salon Settings';
  document.querySelector('.page-description').textContent = 'Manage salon information, staff, services, roles, and permissions.';
  tabs.hidden = false;
  window.NEXORA_SALON_SETTINGS_TABS.sync('ai-receptionist');

  // AI setup keeps the existing phone fields and their listeners in the visible panel.
  var phones = root.querySelector('.settings-salon-name-field').closest('.settings-card');
  phones.classList.add('salon-ai-phone-card');
  phones.querySelectorAll('.settings-business-grid > *').forEach(function (field) {
    field.hidden = !field.querySelector('input[type="tel"]');
  });
  voice.insertBefore(phones, voice.firstChild);

  // Header and POS source links follow AiReceptionistPanel in the staging app source.
  var hero = root.querySelector('.settings-hero');
  var guide = document.querySelector('.page-guide-link').cloneNode(true);
  var aiNumber = phones.querySelector('input[type="tel"][readonly]').value;
  guide.href = 'salon-guide-ai-voice.html?' + new URLSearchParams({ai: aiNumber});
  hero.className = 'salon-ai-receptionist-intro';
  hero.innerHTML = '<h2>AI receptionist setup</h2><p>Salon information, business hours, technicians, and services come from your POS settings.</p>';
  hero.appendChild(guide);

  var rules = document.createElement('section');
  rules.className = 'settings-card salon-ai-booking-rules';
  rules.innerHTML = '<h3>Booking rules</h3>' + [
    ['services', 'Services & prices'],
    ['staff', 'Technicians & schedules'],
    ['information', 'Business hours']
  ].map(function (item) {
    return '<a href="pos-salon-settings.html?section=' + item[0] + '"><span>' + item[1] + '</span><span>From POS<i data-lucide="external-link" aria-hidden="true"></i></span></a>';
  }).join('');
  var saveBar = voice.querySelector('.settings-save-bar');
  voice.insertBefore(rules, saveBar);

  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
})();
