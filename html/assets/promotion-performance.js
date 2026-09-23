(function () {
  'use strict';
  const STORAGE_KEY = 'nexora:reward-promotions:v1';
  const SOURCE_LABELS = {internal: 'Internal', organic: 'Public organic', paid: 'Paid Boost', unknown: 'Unknown source'};
  const SOURCE_KEYS = Object.keys(SOURCE_LABELS);
  const METRICS = ['impressions', 'clicks', 'bookings', 'posUses', 'discount', 'revenue'];
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const number = value => new Intl.NumberFormat('en-US').format(Number(value) || 0);
  const money = value => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(Number(value) || 0);
  const metricValue = (metric, value) => ['discount', 'revenue'].includes(metric) ? money(value) : number(value);
  const params = new URLSearchParams(window.location.search);

  function demoPerformance() {
    return {
      demo: true, updatedAt: '2026-09-23T10:30:00-05:00',
      sources: {
        internal:{impressions:820,clicks:124,bookings:16,posUses:9,discount:74,revenue:612},
        organic:{impressions:470,clicks:62,bookings:7,posUses:3,discount:22,revenue:184},
        paid:{impressions:960,clicks:138,bookings:11,posUses:4,discount:31,revenue:278,spend:69,held:8,adjustments:-2},
        unknown:{impressions:0,clicks:0,bookings:0,posUses:2,discount:15,revenue:96}
      },
      events:[
        {id:'demo-1',at:'2026-09-23T09:10:00-05:00',campaignId:'demo-campaign',type:'Click',placement:'Search Deals',cost:.5,status:'Recorded',result:'Offer detail opened',ledgerId:'ADS-DEMO-101'},
        {id:'demo-2',at:'2026-09-23T09:12:00-05:00',campaignId:'demo-campaign',type:'Click',placement:'Search Deals',cost:0,status:'Rejected',result:'Duplicate click',reason:'Duplicate within validation window'}
      ]
    };
  }
  function fallbackState() {
    return {version:2,offers:[{id:'weekday-glow',title:'Weekday Glow — Giờ Vàng Trong Tuần',badge:'HAPPY HOURS',performance:demoPerformance()}],campaigns:[{id:'demo-campaign',promotionId:'weekday-glow',name:'Houston quiet-hours traffic',status:'approved',dailyBudget:15,totalBudget:150,spent:69,held:8,impressions:960,clicks:138,bookings:11,attributedRevenue:278}]};
  }
  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && Array.isArray(parsed.offers)) {
        const offers = parsed.offers.map((offer,index) => !offer.performance && index === 0 && ['add-on-upgrade','rebook-save','weekday-glow'].includes(offer.id) ? {...offer,performance:demoPerformance()} : offer);
        return {...parsed,offers,campaigns:Array.isArray(parsed.campaigns) ? parsed.campaigns : []};
      }
    } catch (_) {}
    return fallbackState();
  }
  const state = load();
  const promotionSelect = $('#performance-promotion');
  const sourceSelect = $('#performance-source');
  const periodSelect = $('#performance-period');

  function selectedOffer() { return state.offers.find(offer => offer.id === promotionSelect.value); }
  function sumSources(performance, source) {
    const keys = source === 'all' ? SOURCE_KEYS : [source];
    return Object.fromEntries(METRICS.map(metric => [metric, keys.reduce((total,key) => total + (Number(performance.sources?.[key]?.[metric]) || 0), 0)]));
  }
  function updateURL() {
    const next = new URLSearchParams(window.location.search);
    next.set('promotionId', promotionSelect.value);
    next.set('period', periodSelect.value);
    if (sourceSelect.value === 'all') next.delete('source'); else next.set('source', sourceSelect.value);
    window.history.replaceState({}, '', window.location.pathname + '?' + next.toString());
  }
  function renderSources(performance) {
    $('#performance-source-body').innerHTML = SOURCE_KEYS.map(key => {
      const row = performance.sources?.[key] || {};
      return '<tr'+(sourceSelect.value === key ? ' class="is-selected"' : '')+'><th scope="row">'+SOURCE_LABELS[key]+'</th>'+METRICS.map(metric => '<td>'+metricValue(metric,row[metric])+'</td>').join('')+'</tr>';
    }).join('');
  }
  function renderCampaigns(offer) {
    const campaigns = state.campaigns.filter(campaign => campaign.promotionId === offer.id);
    $('#performance-campaigns').innerHTML = campaigns.length ? campaigns.map(campaign => {
      const impressions = Number(campaign.impressions) || 0, clicks = Number(campaign.clicks) || 0, spent = Number(campaign.spent) || 0, revenue = Number(campaign.attributedRevenue) || 0;
      const ctr = impressions ? (clicks / impressions * 100).toFixed(1) + '%' : 'Not enough data';
      const cpc = clicks ? money(spent / clicks) : 'Not enough data';
      const roas = spent ? (revenue / spent).toFixed(1) + 'x' : 'Not enough data';
      return '<article class="performance-campaign"><header><h3>'+esc(campaign.name)+'</h3><span class="performance-status">'+esc(campaign.status || 'draft')+'</span></header><dl><div><dt>Spend</dt><dd>'+money(spent)+'</dd></div><div><dt>Held</dt><dd>'+money(campaign.held)+'</dd></div><div><dt>CTR</dt><dd>'+ctr+'</dd></div><div><dt>Avg CPC</dt><dd>'+cpc+'</dd></div><div><dt>Bookings</dt><dd>'+number(campaign.bookings)+'</dd></div><div><dt>ROAS</dt><dd>'+roas+'</dd></div></dl><a class="performance-link" href="reward-promotions.html?tab=campaigns&amp;campaignId='+encodeURIComponent(campaign.id)+'">Open campaign</a></article>';
    }).join('') : '<p class="performance-footnote">This promotion has not run a Paid Boost campaign.</p>';
  }
  function renderEvents(performance) {
    const campaigns = new Map(state.campaigns.map(campaign => [campaign.id,campaign.name]));
    const events = Array.isArray(performance.events) ? performance.events : [];
    $('#performance-events').innerHTML = events.length ? events.map(event => {
      const statusClass = String(event.status || '').toLowerCase();
      const when = event.at ? new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(event.at)) : '—';
      return '<tr><td>'+esc(when)+'</td><td>'+esc(event.type)+'</td><td>'+esc(campaigns.get(event.campaignId) || event.campaignId || '—')+'</td><td>'+esc(event.placement || '—')+'</td><td><span class="activity-result">'+esc(event.result || '—')+(event.reason ? '<span class="activity-reason">'+esc(event.reason)+'</span>' : '')+'</span></td><td>'+money(event.cost)+'</td><td><span class="activity-status '+esc(statusClass)+'">'+esc(event.status || '—')+'</span>'+(event.ledgerId ? '<span class="activity-ledger">'+esc(event.ledgerId)+'</span>' : '')+'</td></tr>';
    }).join('') : '<tr><td colspan="7">No billable activity for this period.</td></tr>';
  }
  function render() {
    const offer = selectedOffer();
    if (!offer) return;
    const performance = offer.performance;
    const empty = !performance || !performance.sources;
    $('#performance-empty').hidden = !empty;
    if (empty) {
      document.querySelectorAll('[data-metric]').forEach(element => { element.textContent = 'No data'; });
      $('#performance-source-body').innerHTML = '<tr><td colspan="7">No source data for this period.</td></tr>';
      renderCampaigns(offer); renderEvents({events:[]}); $('#performance-updated').textContent = 'No collection timestamp'; updateURL(); return;
    }
    const totals = sumSources(performance,sourceSelect.value);
    METRICS.forEach(metric => { $('[data-metric="'+metric+'"]').textContent = metricValue(metric,totals[metric]); });
    renderSources(performance); renderCampaigns(offer); renderEvents(performance);
    $('#performance-updated').textContent = 'Updated ' + new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short'}).format(new Date(performance.updatedAt)) + (performance.demo ? ' · Sample' : '');
    updateURL();
  }
  promotionSelect.innerHTML = state.offers.map(offer => '<option value="'+esc(offer.id)+'">'+esc(offer.title || 'Untitled promotion')+'</option>').join('');
  const requested = params.get('promotionId');
  if (state.offers.some(offer => offer.id === requested)) promotionSelect.value = requested;
  if (['7','30','90'].includes(params.get('period'))) periodSelect.value = params.get('period');
  if (['internal','organic','paid','unknown'].includes(params.get('source'))) sourceSelect.value = params.get('source');
  [promotionSelect,sourceSelect,periodSelect].forEach(control => control.addEventListener('change',render));
  render();
}());
