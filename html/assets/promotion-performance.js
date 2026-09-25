(function () {
  'use strict';
  const STORAGE_KEY = 'nexora:reward-promotions:v1';
  const CHANNEL_LABELS = {checkout:'POS checkout',oneqr:'OneQR Hero',search:'Search Deals',checkin:'Check-in screen'};
  const CHANNEL_KEYS = Object.keys(CHANNEL_LABELS);
  const METRICS = ['views','clicks','bookingTaps','redeems','revenue','newCustomers'];
  const PERIOD_MULTIPLIERS = {'7':0.31,'30':1,'90':2.36};
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const number = value => new Intl.NumberFormat('en-US').format(Number(value) || 0);
  const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(value) || 0);
  const metricValue = (metric,value) => metric === 'revenue' ? money(value) : number(value);
  const params = new URLSearchParams(window.location.search);

  function demoPerformance() {
    return {
      demo:true,
      updatedAt:'2026-09-25T08:45:00-05:00',
      channels:{
        checkout:{views:860,clicks:48,bookingTaps:6,redeems:28,revenue:2940,newCustomers:6,cost:0},
        oneqr:{views:2340,clicks:398,bookingTaps:58,redeems:17,revenue:1860,newCustomers:7,cost:0},
        search:{views:1120,clicks:172,bookingTaps:22,redeems:10,revenue:1040,newCustomers:4,cost:null},
        checkin:{views:662,clicks:56,bookingTaps:6,redeems:6,revenue:560,newCustomers:1,cost:0}
      }
    };
  }
  function fallbackState() {
    return {version:2,offers:[{id:'add-on-upgrade',title:'Add-On Upgrade · Sample',badge:'UPGRADE',performance:demoPerformance()}]};
  }
  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && Array.isArray(parsed.offers)) {
        const offers = parsed.offers.map((offer,index) => {
          const supportsPhaseOneTracking = offer.performance && offer.performance.channels;
          return !supportsPhaseOneTracking && (index === 0 || ['add-on-upgrade','rebook-save','weekday-glow'].includes(offer.id)) ? {...offer,performance:demoPerformance()} : offer;
        });
        return {...parsed,offers};
      }
    } catch (_) {}
    return fallbackState();
  }
  const state = load();
  const promotionSelect = $('#performance-promotion');
  const channelSelect = $('#performance-channel');
  const periodSelect = $('#performance-period');

  function selectedOffer() { return state.offers.find(offer => offer.id === promotionSelect.value); }
  function multiplier(performance) { return performance.demo ? PERIOD_MULTIPLIERS[periodSelect.value] || 1 : 1; }
  function scaled(value,factor) { return Math.round((Number(value) || 0) * factor); }
  function sumChannels(performance,channel) {
    const keys = channel === 'all' ? CHANNEL_KEYS : [channel];
    const factor = multiplier(performance);
    return Object.fromEntries(METRICS.map(metric => [metric,keys.reduce((total,key) => total + scaled(performance.channels?.[key]?.[metric],factor),0)]));
  }
  function updateURL() {
    const next = new URLSearchParams(window.location.search);
    next.set('promotionId',promotionSelect.value);
    next.set('period',periodSelect.value);
    if (channelSelect.value === 'all') next.delete('channel'); else next.set('channel',channelSelect.value);
    next.delete('source');
    window.history.replaceState({},'',window.location.pathname + '?' + next.toString());
  }
  function renderChannels(performance) {
    const factor = multiplier(performance);
    const visibleKeys = channelSelect.value === 'all' ? CHANNEL_KEYS : [channelSelect.value];
    $('#performance-channel-body').innerHTML = visibleKeys.map(key => {
      const row = performance.channels?.[key];
      if (!row) return '';
      const cost = row.cost == null ? 'Not available' : money(scaled(row.cost,factor));
      return '<tr'+(channelSelect.value === key ? ' class="is-selected"' : '')+'><th scope="row">'+CHANNEL_LABELS[key]+'</th><td>'+number(scaled(row.views,factor))+'</td><td>'+number(scaled(row.clicks,factor))+'</td><td>'+number(scaled(row.redeems,factor))+'</td><td>'+money(scaled(row.revenue,factor))+'</td><td>'+cost+'</td></tr>';
    }).join('') || '<tr><td colspan="6">No channel data for this selection.</td></tr>';
  }
  function renderInsights(performance,totals) {
    const factor = multiplier(performance);
    const available = (channelSelect.value === 'all' ? CHANNEL_KEYS : [channelSelect.value]).filter(key => performance.channels?.[key]);
    const strongest = available.reduce((best,key) => !best || scaled(performance.channels[key].redeems,factor) > scaled(performance.channels[best].redeems,factor) ? key : best,null);
    const items = [];
    if (!totals.redeems) {
      items.push(['No redemptions yet','Review placement visibility and confirm that the promotion is enabled for the selected period.']);
    } else if (strongest) {
      items.push(['Top redemption channel',CHANNEL_LABELS[strongest]+' generated '+number(scaled(performance.channels[strongest].redeems,factor))+' successful POS redemptions.']);
    }
    const tapRate = totals.views ? totals.bookingTaps / totals.views * 100 : 0;
    items.push(['Booking interest',number(totals.bookingTaps)+' booking taps from '+number(totals.views)+' views ('+tapRate.toFixed(1)+'%). Booking taps do not mean completed bookings.']);
    items.push(['Revenue context',money(totals.revenue)+' comes from completed orders that used this promotion.']);
    $('#performance-insights').innerHTML = items.map((item,index) => '<article><span>'+(index+1)+'</span><div><strong>'+esc(item[0])+'</strong><p>'+esc(item[1])+'</p></div></article>').join('');
  }
  function render() {
    const offer = selectedOffer();
    if (!offer) return;
    const performance = offer.performance;
    const empty = !performance || !performance.channels;
    $('#performance-empty').hidden = !empty;
    if (empty) {
      document.querySelectorAll('[data-metric]').forEach(element => { element.textContent = 'No data'; });
      $('#performance-channel-body').innerHTML = '<tr><td colspan="6">No channel data for this period.</td></tr>';
      $('#performance-insights').innerHTML = '<p class="performance-footnote">Insights appear after valid tracking activity is received.</p>';
      $('#performance-updated').textContent = 'No collection timestamp';
      updateURL();
      return;
    }
    const totals = sumChannels(performance,channelSelect.value);
    METRICS.forEach(metric => { $('[data-metric="'+metric+'"]').textContent = metricValue(metric,totals[metric]); });
    renderChannels(performance);
    renderInsights(performance,totals);
    $('#performance-updated').textContent = 'Updated ' + new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short'}).format(new Date(performance.updatedAt)) + (performance.demo ? ' · Sample' : '');
    updateURL();
  }
  promotionSelect.innerHTML = state.offers.map(offer => '<option value="'+esc(offer.id)+'">'+esc(offer.title || 'Untitled promotion')+'</option>').join('');
  const requested = params.get('promotionId');
  if (state.offers.some(offer => offer.id === requested)) promotionSelect.value = requested;
  if (['7','30','90'].includes(params.get('period'))) periodSelect.value = params.get('period');
  if (CHANNEL_KEYS.includes(params.get('channel'))) channelSelect.value = params.get('channel');
  [promotionSelect,channelSelect,periodSelect].forEach(control => control.addEventListener('change',render));
  render();
}());
