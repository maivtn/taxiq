(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const key = 'nexora:reward-promotions:v1';
  const form = $('#promotion-form');
  if (!form) return;
  const editor = $('#promotion-editor');
  const posterDialog = $('#promotion-poster-dialog');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const themes = ['gold', 'teal', 'glow', 'ocean', 'rose', 'spring'];
  const money = value => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2}).format(value).replace(/\.00$/, '');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const localDate = (offset = 0) => { const date = new Date(); date.setDate(date.getDate() + offset); return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-'); };
  const dateLabel = date => date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {month:'short', day:'numeric', year: new Date(date + 'T12:00:00').getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined}) : 'No end date';
  const templates = [
    {id:'weekend', title:'Weekend Special', type:'percent', value:20, badge:'WEEKEND', description:'Enjoy 20% off your favorite services this weekend.', theme:'gold', category:'Weekend', hint:'Fri–Sat', days:['Fri','Sat']},
    {id:'happy-hour', title:'Happy Hour', type:'percent', value:15, badge:'GLOW', description:'Make time for yourself with 15% off weekday services.', theme:'glow', category:'Happy hour', hint:'Weekday slow hours', days:['Mon','Tue','Wed','Thu'], allDay:false},
    {id:'new-customer', title:'New Customer', type:'fixed', value:10, badge:'WELCOME', description:'Save $10 on your first visit.', theme:'teal', posterTheme:'gold', category:'Welcome', hint:'First visit', audience:'First-time customers'},
    {id:'rebook', title:'Rebook & Save', type:'fixed', value:5, badge:'REBOOK', description:'Save $5 when customers schedule their next visit at checkout.', theme:'ocean', category:'Rebook', hint:'Next appointment', redemption:'checkout'},
    {id:'birthday', title:'Birthday Reward', type:'free', value:'', badge:'CELEBRATE', description:'A complimentary add-on to celebrate your birthday month.', theme:'rose', category:'Birthday', hint:'Birthday month', services:'Selected add-ons'},
    {id:'seasonal', title:'Seasonal Offer', type:'custom', value:'SPRING', badge:'A FRESH START', description:'Refresh your look with our seasonal service special.', theme:'spring', category:'Seasonal', hint:'Limited time'},
    {id:'upgrade', title:'Add-On Upgrade', type:'percent', value:20, badge:'UPGRADE', description:'20% off selected nail-art and premium add-ons.', theme:'gold', category:'Upgrade', hint:'Selected add-ons', services:'Selected add-ons'},
    {id:'friends', title:'Bring a Friend', type:'fixed', value:10, badge:'BETTER TOGETHER', description:'Enjoy $10 off when you book a visit with a friend.', theme:'teal', category:'Referral', hint:'Share the experience'},
    {id:'loyalty', title:'A Little Thank You', type:'percent', value:10, badge:'JUST FOR YOU', description:'Our returning customers enjoy 10% off their next service.', theme:'rose', category:'Loyalty', hint:'Returning customers', audience:'Returning customers'}
  ];
  function baseOffer() {
    return {title:'', type:'fixed', value:10, badge:'SPECIAL OFFER', description:'', checkout:true, timing:'now', startDate:localDate(), endDate:'', days:[...days], allDay:true, startTime:'10:00', endTime:'14:00', services:'All services', audience:'All customers', redemption:'auto', code:'', paused:false, theme:'gold', category:'Special offer', uses:0, revenue:0};
  }
  function sampleOffer(sample) { return {...baseOffer(), ...sample, id:null, theme:sample.posterTheme || sample.theme}; }
  function seed() {
    return {version:1, pastRevenue:220, pastUses:8, offers:[
      {...sampleOffer(templates[6]), id:'add-on-upgrade', uses:48, revenue:620, createdAt:1},
      {...sampleOffer(templates[3]), id:'rebook-save', theme:'teal', uses:31, revenue:405, createdAt:2},
      {...sampleOffer(templates[1]), id:'weekday-glow', title:'Weekday Glow', description:'Fill quiet hours with 15% off weekday services.', startDate:localDate(6), timing:'scheduled', days:['Tue','Wed','Thu'], redemption:'code', code:'GLOW15', createdAt:3}
    ]};
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved?.version === 1 && Array.isArray(saved.offers) && saved.offers.every(item => item && typeof item.id === 'string' && typeof item.title === 'string' && Array.isArray(item.days))) {
        return {...saved, pastRevenue:Number(saved.pastRevenue) || 0, pastUses:Number(saved.pastUses) || 0, offers:saved.offers.map(item => ({...baseOffer(), ...item}))};
      }
    } catch (_) { /* Demo data remains available when browser storage is unavailable. */ }
    const fresh = seed();
    try { localStorage.setItem(key, JSON.stringify(fresh)); } catch (_) {}
    return fresh;
  }
  let state = load(), filter = 'all', query = '', sort = 'performance', step = 1, current = null, expandedSamples = false, selectedSample = '', feedbackTimer;
  const field = name => form.elements.namedItem(name);
  const status = offer => offer.paused ? 'paused' : offer.startDate > localDate() ? 'scheduled' : offer.endDate && offer.endDate < localDate() ? 'ended' : 'active';
  const theme = offer => themes.includes(offer.theme) ? offer.theme : 'gold';
  const discount = offer => offer.type === 'percent' ? Number(offer.value) + '% OFF' : offer.type === 'fixed' ? money(Number(offer.value)) + ' OFF' : offer.type === 'free' ? 'FREE' : String(offer.value || 'SPECIAL');
  function dayLabel(offer) {
    if (offer.days.length === 7) return 'Sun–Sat';
    if (offer.days.length > 2 && offer.days.every((day, i) => i === 0 || days.indexOf(day) === days.indexOf(offer.days[i - 1]) + 1)) return offer.days[0] + '–' + offer.days.at(-1);
    return offer.days.join(', ');
  }
  function timeLabel(time) { const [h,m] = (time || '00:00').split(':').map(Number); return (h % 12 || 12) + (m ? ':' + String(m).padStart(2,'0') : '') + (h < 12 ? ' AM' : ' PM'); }
  const hours = offer => offer.allDay ? 'All day' : timeLabel(offer.startTime) + '–' + timeLabel(offer.endTime);
  const redemptionLabel = offer => offer.redemption === 'code' ? 'Code: ' + offer.code : offer.redemption === 'checkout' ? 'At checkout' : 'Auto-applied';
  function feedback(message) {
    clearTimeout(feedbackTimer); $('#promotion-feedback').textContent = message;
    feedbackTimer = setTimeout(() => { $('#promotion-feedback').textContent = ''; }, 5000);
  }
  function persist(next, inEditor = false) {
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch (_) {
      const message = 'Could not save. Browser storage is unavailable or full. Please try again.';
      if (inEditor) $('#promotion-error').textContent = message; else feedback(message);
      return false;
    }
    state = next; render(); return true;
  }
  function render() {
    const counts = {all:state.offers.length, active:0, scheduled:0, paused:0};
    state.offers.forEach(offer => { const s = status(offer); if (s in counts) counts[s]++; });
    document.querySelectorAll('[data-count]').forEach(el => { const count = counts[el.dataset.count]; el.textContent = count || (el.dataset.count === 'all' ? '0' : ''); });
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    $('#stat-active').textContent = counts.active;
    $('#stat-scheduled').textContent = counts.scheduled;
    const nextScheduled = state.offers.filter(offer => status(offer) === 'scheduled').sort((a,b) => a.startDate.localeCompare(b.startDate))[0];
    $('#schedule-caption').textContent = nextScheduled ? 'Next: ' + dateLabel(nextScheduled.startDate) : 'No upcoming offers';
    $('#stat-revenue').textContent = money(state.pastRevenue + state.offers.reduce((sum,o) => sum + Number(o.revenue),0));
    $('#stat-redemptions').textContent = (state.pastUses + state.offers.reduce((sum,o) => sum + Number(o.uses),0)).toLocaleString('en-US');
    const visible = state.offers.filter(offer => (filter === 'all' || status(offer) === filter) && (offer.title + ' ' + offer.description + ' ' + offer.category).toLowerCase().includes(query.trim().toLowerCase()));
    visible.sort(sort === 'name' ? (a,b) => a.title.localeCompare(b.title) : sort === 'newest' ? (a,b) => b.createdAt - a.createdAt : (a,b) => b.revenue - a.revenue);
    $('#promotion-list').innerHTML = visible.map(offer => {
      const s = status(offer), amount = discount(offer).replace(/ OFF$/, '');
      const action = (name,label) => '<button class="promo-button" data-action="' + name + '" data-id="' + esc(offer.id) + '">' + label + '</button>';
      return '<article class="promotion-row" data-promotion-id="' + esc(offer.id) + '"><div class="promo-thumb' + (offer.type === 'custom' ? ' is-custom' : '') + ' theme-' + theme(offer) + '" aria-hidden="true"><small>' + esc(offer.badge) + '</small><strong>' + esc(amount) + '</strong><span>' + (['fixed','percent'].includes(offer.type) ? 'OFF' : '') + '</span></div><div class="promotion-copy"><div class="promo-badges"><span class="promo-status ' + s + '">' + s[0].toUpperCase() + s.slice(1) + '</span><span class="promo-category">' + esc(offer.category) + '</span></div><h2>' + esc(offer.title) + '</h2><p>' + esc(offer.description) + '</p><div class="promotion-meta"><span>' + esc(dayLabel(offer)) + ' · ' + esc(hours(offer)) + '</span><span>' + esc(offer.services) + '</span><span>' + esc(redemptionLabel(offer)) + '</span></div></div><div class="promotion-results"><small>' + (s === 'scheduled' ? 'Starts ' + esc(dateLabel(offer.startDate)) : Number(offer.uses) + ' uses') + '</small><strong>' + (s === 'scheduled' && !offer.revenue ? '—' : money(offer.revenue)) + '</strong><p>' + (s === 'scheduled' && !offer.revenue ? 'Not started' : 'Revenue generated') + '</p><div class="promo-progress" aria-hidden="true"><span style="width:' + Math.min(100, Math.max(0, Number(offer.revenue) / 850 * 100)) + '%"></span></div></div><div class="promotion-actions">' + action('edit','Edit') + action('duplicate','Duplicate') + action('poster','Create poster') + '<details class="promo-more"><summary class="promo-button" aria-label="More actions for ' + esc(offer.title) + '">•••</summary><div class="promo-more-menu"><button data-action="toggle" data-id="' + esc(offer.id) + '">' + (offer.paused ? 'Resume promotion' : 'Pause promotion') + '</button><button class="danger" data-action="delete" data-id="' + esc(offer.id) + '">Delete promotion</button></div></details></div></article>';
    }).join('');
    $('#promotion-empty').hidden = visible.length > 0;
  }
  function renderSamples() {
    $('#promotion-samples').innerHTML = templates.slice(0, expandedSamples ? templates.length : 6).map(sample => '<button type="button" class="promo-sample theme-' + sample.theme + '" data-sample="' + sample.id + '" aria-pressed="' + (selectedSample === sample.id) + '"><strong>' + esc(discount(sample)) + '</strong><span>' + esc(sample.title) + '</span><small>' + esc(sample.hint) + '</small></button>').join('');
    $('#toggle-samples').textContent = expandedSamples ? 'Show less' : 'View all';
    $('#toggle-samples').setAttribute('aria-expanded', String(expandedSamples));
  }
  function populate(offer) {
    field('type').value = offer.type;
    updateConditional();
    ['title','type','value','badge','description','timing','startDate','endDate','startTime','endTime','services','audience','redemption','code'].forEach(name => { field(name).value = offer[name] ?? ''; });
    ['checkout','allDay','paused'].forEach(name => { field(name).checked = !!offer[name]; });
    document.querySelectorAll('[name="days"]').forEach(input => { input.checked = offer.days.includes(input.value); });
    updateConditional(); updatePreview();
  }
  function readOffer() {
    const result = {...current};
    ['title','type','value','badge','description','timing','startDate','endDate','startTime','endTime','services','audience','redemption','code'].forEach(name => { result[name] = field(name).value.trim(); });
    ['checkout','allDay','paused'].forEach(name => { result[name] = field(name).checked; });
    result.days = Array.from(document.querySelectorAll('[name="days"]:checked'), input => input.value);
    if (['fixed','percent'].includes(result.type)) result.value = Number(result.value);
    result.code = result.code.toUpperCase();
    return result;
  }
  function updateConditional() {
    const type = field('type').value, numeric = ['fixed','percent'].includes(type);
    field('value').type = numeric ? 'number' : 'text';
    field('value').required = type !== 'free';
    field('value').maxLength = 24;
    field('value').max = type === 'percent' ? '100' : '';
    $('#discount-field').hidden = type === 'free';
    $('#discount-prefix').textContent = type === 'fixed' ? '$' : type === 'percent' ? '%' : '';
    $('#discount-label').textContent = type === 'custom' ? 'Offer headline' : 'Discount value';
    $('#promotion-hours').hidden = field('allDay').checked;
    $('#promotion-code-field').hidden = field('redemption').value !== 'code';
    field('startDate').disabled = field('timing').value === 'now';
  }
  function updatePreview() {
    if (!current) return;
    const offer = readOffer();
    $('#promotion-preview').className = 'promo-poster theme-' + theme(offer);
    $('[data-preview-badge]').textContent = offer.badge || 'SPECIAL OFFER';
    $('[data-preview-title]').textContent = offer.title || 'Your promotion';
    $('[data-preview-value]').textContent = discount(offer);
    $('[data-preview-description]').textContent = offer.description;
  }
  function review(offer) {
    const details = [['Promotion',offer.title], ['Offer',discount(offer)], ['Description',offer.description || '—'], ['Schedule',(offer.timing === 'now' ? 'Starts now' : dateLabel(offer.startDate)) + (offer.endDate ? ' – ' + dateLabel(offer.endDate) : ' · No end date')], ['Available',dayLabel(offer) + ' · ' + hours(offer)], ['Services',offer.services], ['Customers',offer.audience], ['Redemption',redemptionLabel(offer)], ['At checkout',offer.checkout ? 'Available to staff' : 'Not offered at checkout']];
    $('#promotion-review').innerHTML = '<dl class="review-summary">' + details.map(([label,value]) => '<div><dt>' + label + '</dt><dd>' + esc(value) + '</dd></div>').join('') + '</dl>';
  }
  function showStep(next) {
    step = next;
    document.querySelectorAll('[data-editor-step]').forEach(section => { section.hidden = Number(section.dataset.editorStep) !== step; });
    document.querySelectorAll('[data-step-label]').forEach(label => {
      const number = Number(label.dataset.stepLabel);
      if (number === step) label.setAttribute('aria-current','step'); else label.removeAttribute('aria-current');
      label.classList.toggle('done', number < step);
    });
    $('#editor-back').textContent = step === 1 ? 'Cancel' : 'Back';
    $('#editor-step-caption').textContent = 'Step ' + step + ' of 3';
    $('#editor-next').textContent = step < 3 ? 'Continue →' : current.id ? 'Save changes' : field('paused').checked ? 'Save promotion' : field('timing').value === 'scheduled' ? 'Schedule promotion' : 'Create promotion';
    $('#promotion-error').textContent = '';
    if (step === 3) review(readOffer());
    $('.editor-body').scrollTop = 0;
  }
  function openEditor(offer, duplicate = false) {
    current = offer ? JSON.parse(JSON.stringify(offer)) : sampleOffer(templates[2]);
    if (duplicate) current = {...current, id:null, title:current.title.slice(0,73) + ' (copy)', createdAt:0, uses:0, revenue:0, paused:false};
    selectedSample = offer ? '' : 'new-customer'; expandedSamples = false;
    $('#editor-title').textContent = duplicate ? 'Duplicate promotion' : offer ? 'Edit promotion' : 'Create promotion';
    renderSamples(); populate(current); showStep(1); editor.showModal();
  }
  function validate(offer, targetStep) {
    let message = '', invalidField;
    const fail = (text, name) => { message = text; invalidField = name; };
    if (targetStep === 1) {
      if (!offer.title) fail('Enter a promotion name.','title');
      else if (['fixed','percent'].includes(offer.type) && (!Number.isFinite(offer.value) || offer.value <= 0)) fail('Enter a discount greater than zero.','value');
      else if (offer.type === 'percent' && offer.value > 100) fail('Percentage discounts must be between 0 and 100%.','value');
      else if (offer.type === 'custom' && !offer.value) fail('Enter an offer headline.','value');
    } else {
      if (!offer.startDate || !Number.isFinite(Date.parse(offer.startDate))) fail('Choose a valid start date.','startDate');
      else if (offer.timing === 'scheduled' && offer.startDate < localDate() && (!current.id || offer.startDate !== current.startDate)) fail('Choose today or a future date to schedule your promotion.','startDate');
      else if (offer.endDate && offer.endDate < offer.startDate) fail('End date must be on or after the start date.','endDate');
      else if (!offer.days.length) fail('Choose at least one available day.','days');
      else if (!offer.allDay && (!offer.startTime || !offer.endTime || offer.endTime <= offer.startTime)) fail('End time must be later than start time.','endTime');
      else if (offer.redemption === 'code' && !/^[A-Z0-9_-]{2,24}$/.test(offer.code)) fail('Enter a code with 2–24 letters, numbers, hyphens or underscores.','code');
    }
    if (!message) return true;
    if (step !== targetStep) showStep(targetStep);
    $('#promotion-error').textContent = message;
    const target = invalidField === 'days' ? $('[name="days"]') : field(invalidField);
    target.focus(); return false;
  }
  function saveOffer() {
    const offer = readOffer();
    if (!validate(offer,1) || !validate(offer,2)) return;
    if (offer.id && !state.offers.some(item => item.id === offer.id)) { $('#promotion-error').textContent = 'This promotion was deleted in another tab. Close this editor and create a new offer.'; return; }
    const id = offer.id || ('promotion-' + (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)));
    const record = {...offer, id, createdAt:offer.createdAt || Date.now()};
    const next = {...state, offers:offer.id ? state.offers.map(item => item.id === id ? record : item) : [...state.offers,record]};
    if (persist(next,true)) {
      editor.close(); filter = 'all'; query = ''; $('#promotion-search').value = ''; render();
      feedback(offer.id ? 'Promotion updated.' : offer.paused ? 'Promotion saved as paused.' : status(offer) === 'scheduled' ? 'Promotion scheduled.' : 'Promotion created.');
    }
  }
  function openPoster(offer) {
    $('#poster-output').innerHTML = '<div class="promo-poster theme-' + theme(offer) + '"><p>' + esc(offer.badge) + '</p><h3>' + esc(offer.title) + '</h3><strong>' + esc(discount(offer)) + '</strong><p class="poster-description">' + esc(offer.description) + '</p><span class="poster-cta">' + (offer.redemption === 'code' ? 'Use code ' + esc(offer.code) : 'Ask us about this offer') + '</span></div>';
    posterDialog.showModal();
  }
  $('#promotion-days').innerHTML = days.map(day => '<label class="promo-day"><input type="checkbox" name="days" value="' + day + '" checked><span>' + day + '</span></label>').join('');
  $('#create-promotion').addEventListener('click', () => openEditor());
  $('#promotion-search').addEventListener('input', event => { query = event.target.value; render(); });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; render(); }));
  $('#promotion-sort').addEventListener('change', event => { sort = event.target.value; render(); });
  $('#clear-filters').addEventListener('click', () => { query = ''; filter = 'all'; $('#promotion-search').value = ''; render(); });
  $('#promotion-list').addEventListener('click', event => {
    const button = event.target.closest('[data-action]'); if (!button) return;
    const offer = state.offers.find(item => item.id === button.dataset.id); if (!offer) return;
    const action = button.dataset.action;
    if (action === 'edit' || action === 'duplicate') openEditor(offer, action === 'duplicate');
    if (action === 'poster') openPoster(offer);
    if (action === 'toggle') {
      if (persist({...state, offers:state.offers.map(item => item.id === offer.id ? {...item, paused:!item.paused} : item)})) feedback(offer.paused ? 'Promotion resumed.' : 'Promotion paused.');
    }
    if (action === 'delete' && window.confirm('Delete “' + offer.title + '”? This promotion will be removed from your list.')) {
      if (persist({...state, pastRevenue:state.pastRevenue + Number(offer.revenue), pastUses:state.pastUses + Number(offer.uses), offers:state.offers.filter(item => item.id !== offer.id)})) feedback('Promotion deleted. Past results are retained in the overview.');
    }
  });
  $('#promotion-samples').addEventListener('click', event => {
    const button = event.target.closest('[data-sample]'); if (!button) return;
    const sample = templates.find(item => item.id === button.dataset.sample);
    const previous = readOffer();
    current = {...sampleOffer(sample), id:previous.id, uses:previous.uses, revenue:previous.revenue, createdAt:previous.createdAt};
    selectedSample = sample.id; renderSamples(); populate(current);
  });
  $('#toggle-samples').addEventListener('click', () => { expandedSamples = !expandedSamples; renderSamples(); });
  form.addEventListener('input', () => { updatePreview(); $('#promotion-error').textContent = ''; });
  form.addEventListener('change', event => {
    if (event.target.name === 'timing' && field('timing').value === 'now') field('startDate').value = localDate();
    if (event.target.name === 'type') { const value = field('value').value; if (['percent','fixed'].includes(field('type').value) && !Number.isFinite(Number(value))) field('value').value = 10; }
    updateConditional(); updatePreview();
    if (step === 3) showStep(3);
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (step < 3) { if (validate(readOffer(),step)) showStep(step + 1); }
    else saveOffer();
  });
  $('#editor-back').addEventListener('click', () => { if (step === 1) editor.close(); else showStep(step - 1); });
  $('[data-close-editor]').addEventListener('click', () => editor.close());
  $('#close-poster').addEventListener('click', () => posterDialog.close());
  $('#print-poster').addEventListener('click', () => window.print());
  document.addEventListener('click', event => { document.querySelectorAll('.promo-more[open]').forEach(menu => { if (!menu.contains(event.target)) menu.open = false; }); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') document.querySelectorAll('.promo-more[open]').forEach(menu => { menu.open = false; }); });
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) { state = load(); render(); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  render();
})();
