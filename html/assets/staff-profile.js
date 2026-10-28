/* UI and copy: staging-web.nexoratouch.com/staff/profile, Oct 28, 2026. */
(function () {
  'use strict';
  const host = document.querySelector('[data-staff-profile]');
  const api = window.NEXORA_PERSONAL_QR;
  if (!host || !api) return;
  const linked = window.NEXORA_SHELL.salonLinked;
  const key = 'nexora.staff-profile.v1';
  const source = 'https://staging-web.nexoratouch.com/staff/profile';
  const sourceAvatar = 'https://vlink-storages-test.sgp1.cdn.digitaloceanspaces.com/vlink-storages-test/Nexora/Staging/posting/9950449b-5939-464b-94a1-2ebb71545ad7/Screenshot_35.png';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = name => '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  const icons = () => window.lucide?.createIcons();
  const initialSalons = [
    ['Bitcoin Nail Bar test2109 Bitcoin Nail Bar test2109 Bitcoin Nail Bar test2109', 'nexora_02 role 12345'],
    ['Philip Salon 2', 'Director Manager'], ['Tomy 01 business name', 'Nail Technician'],
    ['nexora_b19', 'Nail Technician'], ['nguyen_merchant_staging', 'Nail Technician'], ['atm 01 store', 'Nail Technician']
  ];
  const countries = [
    ['US', 'United States', '+1'], ['CA', 'Canada', '+1'], ['VN', 'Vietnam', '+84'],
    ['GB', 'United Kingdom', '+44'], ['AU', 'Australia', '+61'], ['SG', 'Singapore', '+65'],
    ['JP', 'Japan', '+81'], ['KR', 'South Korea', '+82'], ['DE', 'Germany', '+49'],
    ['FR', 'France', '+33'], ['IN', 'India', '+91'], ['CN', 'China', '+86'],
    ['BR', 'Brazil', '+55'], ['MX', 'Mexico', '+52'], ['HK', 'Hong Kong', '+852'],
    ['TW', 'Taiwan', '+886'], ['MY', 'Malaysia', '+60'], ['TH', 'Thailand', '+66'],
    ['PH', 'Philippines', '+63'], ['ID', 'Indonesia', '+62']
  ];
  let details = {};
  try { details = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) {}
  const shared = api.read();
  const profile = {
    fullName: details.fullName || shared.profile.name || 'nexora 2',
    displayName: shared.profile.name || details.displayName || 'nexora_02',
    phone: shared.profile.phone || '', email: shared.profile.email || 'nexora_02@mailinator.com',
    bio: shared.profile.bio || '', avatar: shared.profile.avatar || '',
    salons: Array.isArray(details.salons) ? details.salons : initialSalons.map(([name, title]) => ({ name, title, displayName: shared.profile.name || 'nexora_02' })),
    language: details.language === 'vi' ? 'vi' : 'en',
    country: countries.some(item => item[0] === details.country) ? details.country : 'US'
  };
  let section = '';
  const dialog = document.createElement('dialog');
  dialog.className = 'sap-dialog';
  document.body.append(dialog);
  const avatar = () => '<span class="sap-avatar"><img src="' + esc(profile.avatar || sourceAvatar) + '" alt="' + esc(profile.displayName) + '"></span>';
  function saveDetails() {
    localStorage.setItem(key, JSON.stringify({ fullName: profile.fullName, displayName: profile.displayName, salons: profile.salons, language: profile.language, country: profile.country }));
  }
  function heading(title) {
    return '<div class="sap-heading"><button type="button" class="sap-back" data-sap-section="" aria-label="Back">' + icon('arrow-left') + '</button><h1 tabindex="-1">' + title + '</h1></div>';
  }
  function row(label, symbol, target, extra = '', description = '') {
    return '<button type="button" class="sap-row" data-sap-section="' + target + '"><span class="sap-row-icon' + (target === 'verification' ? ' is-verification' : '') + '">' + icon(symbol) + '</span><span class="sap-row-copy"><span>' + label + '</span>' + (description ? '<small>' + description + '</small>' : '') + '</span>' + extra + icon('chevron-right') + '</button>';
  }
  function home() {
    return '<section><h1 tabindex="-1">Profile</h1><div class="sap-card sap-identity">' + avatar() + '<div class="sap-identity-copy"><h2>' + esc(profile.displayName) + '</h2><p class="sap-meta">Nexora ID: ' + esc(shared.staffId) + '</p><p class="sap-meta">Member since Jun 2026</p><button type="button" class="sap-edit" data-sap-section="personal">Edit Profile</button></div></div></section>' +
      '<section class="sap-card sap-menu">' + row('Personal Information', 'circle-user', 'personal') +
      row('Verification', 'shield-check', 'verification', '<span class="sap-status">Not verified</span>') +
      row('Language', 'languages', 'language', '<span class="sap-language-label">' + (profile.language === 'vi' ? 'Tiếng Việt' : 'English') + '</span>') +
      row('Terms &amp; Privacy', 'lock', 'privacy') + '</section><a class="sap-signout" href="nexora-home.html">' + icon('log-out') + 'Sign out</a>';
  }
  function field(label, name, value, placeholder, required = false) {
    return '<label class="sap-field"><span>' + label + (required ? ' <em>*</em>' : '') + '</span><input name="' + name + '" value="' + esc(value) + '" placeholder="' + esc(placeholder) + '"' + (required ? ' required' : '') + '></label>';
  }
  function info(copy) {
    return '<span class="sap-info"><button type="button" aria-label="More information" aria-expanded="false">' + icon('info') + '</button><span role="tooltip" hidden>' + copy + '</span></span>';
  }
  function countryPicker() {
    const selected = countries.find(item => item[0] === profile.country);
    return '<details class="sap-country"><summary><span data-sap-country-label>' + selected[0] + ' ' + selected[2] + '</span>' + icon('chevron-down') + '</summary><div class="sap-country-menu"><input type="search" placeholder="Search country or code..." aria-label="Phone" data-sap-country-search><div class="sap-country-options">' + countries.map(item => '<button type="button" data-sap-country="' + item[0] + '"><span>' + item[1] + '</span><span>' + item[2] + '</span></button>').join('') + '</div></div></details>';
  }
  function personal() {
    return heading('Personal Information') + '<form class="sap-form-card" data-sap-account><h3>Personal Account ' + info('Full name, phone, and email identify your staff account. Your display name and bio are shown to customers on tip screens.') + '</h3>' +
      '<div class="sap-photo"><label>' + avatar() + '<span class="sap-photo-overlay">' + icon('camera') + 'Change</span><input type="file" accept="image/*" aria-label="Change" data-sap-avatar></label><strong data-sap-full-name>' + esc(profile.fullName) + '</strong><small>Staff ID: ' + esc(shared.staffId) + '</small></div>' +
      '<div class="sap-fields">' + field('Full Name', 'fullName', profile.fullName, 'e.g. Lisa Marie Tran', true) + field('Display Name', 'displayName', profile.displayName, 'e.g. Lisa T.', true) +
      '<div class="sap-field-grid"><div class="sap-field"><label class="sap-field-label" for="sap-phone">Phone <em>*</em></label><div class="sap-phone">' + countryPicker() + '<input type="tel" id="sap-phone" name="phone" value="' + esc(profile.phone) + '" placeholder="e.g. 408-555-1234" required></div></div>' +
      '<div class="sap-field"><span>Email</span><div class="sap-field-inline"><div class="sap-email">' + esc(profile.email) + '</div><a class="sap-secondary" href="' + source + '?section=personal" target="_blank" rel="noopener noreferrer">Change</a></div></div></div>' +
      '<div class="sap-field"><div class="sap-field-label"><label for="sap-bio">Bio</label> ' + info('Use a short intro customers can recognize: your specialty, style, or a friendly note. This helps customers pick the right technician before tipping.') + '</div><textarea id="sap-bio" name="bio" maxlength="300" placeholder="Welcome to my chair! I specialize in luxury nail art and spa treatments...">' + esc(profile.bio) + '</textarea></div><div class="sap-count"><span data-sap-bio-count>' + profile.bio.length + '</span>/300</div></div>' +
      '<p class="sap-hint">Full name, phone and email come from your business record. Update your display name and bio here.</p><button class="sap-primary" type="submit">Save Account</button></form>' +
      (linked ? '<section class="sap-form-card"><h3>Salon display settings</h3><p class="sap-hint">Customize your display name and job title for customers at each linked salon.</p><div class="sap-salons">' + profile.salons.map((salon, index) =>
        '<div class="sap-salon"><p>' + esc(salon.name) + '</p><label class="sap-field"><span>Display name</span><input value="' + esc(salon.displayName) + '" placeholder="Name shown to customers at this salon" data-sap-salon-name="' + index + '"></label><div class="sap-job"><div><span class="sap-field-label">Job title</span><p data-sap-job-label="' + index + '">' + esc(salon.title) + '</p></div><button class="sap-secondary" type="button" data-sap-job="' + index + '" aria-haspopup="dialog">' + icon('briefcase') + 'Set job title</button></div></div>'
      ).join('') + '</div></section>' : '');
  }
  function navigate(next, push = true) {
    // Verification uses the staging KYC service and its own authenticated session.
    if (next === 'verification' && push) { window.open(source + '?section=verification', '_blank', 'noopener,noreferrer'); return; }
    section = ['personal', 'language', 'privacy'].includes(next) ? next : '';
    if (push) {
      const url = new URL(location.href);
      if (section) url.searchParams.set('section', section); else url.searchParams.delete('section');
      history.pushState({}, '', url);
    }
    let body = home();
    if (section === 'personal') body = personal();
    if (section === 'language') body = heading('Language') + '<section class="sap-card sap-menu">' + [['en', 'English'], ['vi', 'Tiếng Việt']].map(([value, label]) => '<button class="sap-row sap-language-row" type="button" data-sap-language="' + value + '"><span>' + label + '</span><span class="sap-language-label">' + (value === profile.language ? 'Current' : '') + '</span></button>').join('') + '</section>';
    if (section === 'privacy') {
      const returnTo = 'staff-profile.html?account=' + (linked ? 'staff' : 'personal') + '&section=privacy';
      body = heading('Terms &amp; Privacy') + '<section class="sap-card sap-menu">' +
        '<a class="sap-row" href="owner-terms.html?returnTo=' + encodeURIComponent(returnTo) + '"><span class="sap-row-icon">' + icon('file-text') + '</span><span class="sap-row-copy"><span>Terms of Service</span><small>Rules for using Nexora Touch</small></span>' + icon('chevron-right') + '</a>' +
        '<a class="sap-row" href="owner-privacy.html?returnTo=' + encodeURIComponent(returnTo) + '"><span class="sap-row-icon">' + icon('lock') + '</span><span class="sap-row-copy"><span>Privacy Policy</span><small>How your information is handled</small></span>' + icon('chevron-right') + '</a></section>';
    }
    host.innerHTML = '<div class="sap-view">' + body + '</div>';
    icons();
    if (push) host.querySelector('h1')?.focus({ preventScroll: true });
  }
  host.addEventListener('click', event => {
    const information = event.target.closest('.sap-info button');
    if (information) {
      const tooltip = information.nextElementSibling;
      tooltip.hidden = !tooltip.hidden;
      information.setAttribute('aria-expanded', String(!tooltip.hidden));
    }
    const country = event.target.closest('[data-sap-country]');
    if (country) {
      profile.country = country.dataset.sapCountry;
      const selected = countries.find(item => item[0] === profile.country);
      host.querySelector('[data-sap-country-label]').textContent = selected[0] + ' ' + selected[2];
      host.querySelector('.sap-country').open = false;
    }
    const nav = event.target.closest('[data-sap-section]');
    if (nav) navigate(nav.dataset.sapSection);
    const language = event.target.closest('[data-sap-language]');
    if (language) {
      profile.language = language.dataset.sapLanguage;
      saveDetails(); navigate('language', false);
    }
    const job = event.target.closest('[data-sap-job]');
    if (!job) return;
    const index = Number(job.dataset.sapJob);
    const salon = profile.salons[index];
    if (!salon) return;
    dialog.innerHTML = '<header><h2 id="sap-job-title">Job title at your business</h2><button class="sap-dialog-close" type="button" aria-label="Close">' + icon('x') + '</button></header><form><label class="sap-field"><span>Job title</span><input name="title" maxlength="100" value="' + esc(salon.title) + '"></label><p>Shown to customers at this salon. Max 100 characters.</p><div class="sap-count" data-sap-job-count>' + salon.title.length + '/100</div><button class="sap-primary" type="submit" disabled>Save</button></form>';
    dialog.setAttribute('aria-labelledby', 'sap-job-title');
    dialog.querySelector('.sap-dialog-close').onclick = () => dialog.close();
    const form = dialog.querySelector('form');
    form.elements.title.oninput = () => {
      dialog.querySelector('[data-sap-job-count]').textContent = form.elements.title.value.length + '/100';
      form.querySelector('[type="submit"]').disabled = form.elements.title.value.trim() === salon.title;
    };
    form.onsubmit = event => {
      event.preventDefault();
      salon.title = form.elements.title.value.trim(); saveDetails();
      host.querySelector('[data-sap-job-label="' + index + '"]').textContent = salon.title;
      dialog.close(); job.focus();
    };
    dialog.showModal(); icons();
  });
  host.addEventListener('input', event => {
    if (event.target.name === 'bio') host.querySelector('[data-sap-bio-count]').textContent = event.target.value.length;
    if (event.target.matches('[data-sap-country-search]')) {
      const query = event.target.value.trim().toLowerCase();
      host.querySelectorAll('[data-sap-country]').forEach(button => { button.hidden = !countries.find(item => item[0] === button.dataset.sapCountry).join(' ').toLowerCase().includes(query); });
    }
  });
  host.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.matches('[data-sap-country-search]')) event.preventDefault();
    if (event.key !== 'Escape') return;
    const picker = host.querySelector('.sap-country[open]');
    if (picker) { picker.open = false; picker.querySelector('summary').focus(); }
    host.querySelectorAll('.sap-info button').forEach(button => { button.nextElementSibling.hidden = true; button.setAttribute('aria-expanded', 'false'); });
  });
  host.addEventListener('change', event => {
    const salon = event.target.dataset.sapSalonName;
    if (salon !== undefined && profile.salons[Number(salon)]) { profile.salons[Number(salon)].displayName = event.target.value.trim(); saveDetails(); }
    if (!event.target.matches('[data-sap-avatar]')) return;
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const size = Math.min(image.naturalWidth, image.naturalHeight);
        canvas.getContext('2d').drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 256, 256);
        profile.avatar = canvas.toDataURL('image/jpeg', .85);
        const photo = host.querySelector('.sap-photo img');
        if (photo) photo.src = profile.avatar;
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
  host.addEventListener('submit', event => {
    if (!event.target.matches('[data-sap-account]')) return;
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const fresh = api.read();
    profile.fullName = String(data.get('fullName')).trim();
    profile.displayName = String(data.get('displayName')).trim();
    profile.phone = String(data.get('phone')).trim();
    profile.bio = String(data.get('bio'));
    fresh.profile = { ...fresh.profile, name: profile.displayName, phone: profile.phone, bio: profile.bio, avatar: profile.avatar };
    api.save(fresh); saveDetails();
    host.querySelector('[data-sap-full-name]').textContent = profile.fullName;
    document.querySelectorAll('.staff-profile-name').forEach(node => { node.textContent = profile.displayName; });
  });
  window.addEventListener('popstate', () => navigate(new URL(location.href).searchParams.get('section'), false));
  navigate(new URL(location.href).searchParams.get('section'), false);
})();
