(function () {
  'use strict';
  const host = document.getElementById('customer-promotion');
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = value => value ? new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z')) : 'No date limit';
  const params = new URLSearchParams(location.search);
  let offer;
  try { offer = JSON.parse(localStorage.getItem('nexora:reward-promotions:v1') || '{}').offers?.find(item => item.id === params.get('id')); } catch (_) { /* Display unavailable below. */ }
  if (!offer) { host.innerHTML = '<h1>Promotion unavailable</h1><p>This demo link needs the saved promotion in the same browser.</p>'; return; }
  const salon = window.NEXORA_SALON_DATA.loadCatalog().salon;
  const coupon = offer.offerType === 'coupon';
  const conditions = [];
  if (offer.serviceScope === 'groups') conditions.push('Eligible groups: '+(offer.serviceGroupLabels || offer.serviceGroupIds || []).join(', '));
  else if (offer.serviceScope === 'selected') conditions.push('Eligible services: '+(offer.serviceIds || []).map(id => offer.serviceLabels?.[id] || id).join(', '));
  else if (offer.serviceScope === 'all') conditions.push('All services');
  else if (offer.services) conditions.push(offer.services);
  const requirement = {online:'Online booking required',appt:'Appointment required',checkin:'Check-in required'}[offer.useRequirement];
  if (requirement) conditions.push(requirement);
  if (offer.customerGroup && !['all','legacy'].includes(offer.customerGroup)) conditions.push({new:'New customers only',returning:'Returning customers',inactive45:'No visit in 45+ days','oneqr-nearby':'OneQR customers near the shop'}[offer.customerGroup] || offer.customerGroup);
  else if (offer.audience) conditions.push(offer.audience);
  if (offer.minimumSpend) conditions.push('Minimum eligible spend: $'+Number(offer.minimumSpend).toFixed(2));
  if (offer.maximumDiscount) conditions.push('Maximum discount per use: $'+Number(offer.maximumDiscount).toFixed(2));
  if (offer.stacking === 'exclusive') conditions.push('Cannot be combined with other offers');
  if (coupon) {
    conditions.push('Claim a Coupon before use. Claim availability is not connected in this demo.');
    if (offer.totalSlots) conditions.push('Configured quantity: '+offer.totalSlots+' coupons · remaining inventory is not connected');
    if (offer.perPersonLimit) conditions.push('Completed uses per phone number: '+offer.perPersonLimit);
    conditions.push(offer.holdDays ? 'Hold after claim: '+offer.holdDays+' days, up to the promotion end date' : 'Hold after claim: until the promotion end date');
    if (offer.code) conditions.push('Coupon code: '+offer.code);
  } else {
    if (offer.dealFrequency) conditions.push({visit:'Once per visit',week:'Once per week',month:'Once per month'}[offer.dealFrequency]);
    if (offer.dealMonthlyCap) conditions.push('Total monthly discount cap for this Deal: $'+Number(offer.dealMonthlyCap).toFixed(2));
  }
  if (offer.exclusions) conditions.push(offer.exclusions);
  const discount = offer.type === 'percent' ? offer.value+'% OFF' : offer.type === 'fixed' ? '$'+Number(offer.value).toFixed(2)+' OFF' : offer.type === 'free' ? 'FREE' : offer.value;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(part => [part.type,part.value]));
  const now = parts.year+'-'+parts.month+'-'+parts.day;
  const status = offer.endDate && offer.endDate < now ? 'Expired' : offer.paused ? 'Draft / paused' : offer.startDate && offer.startDate > now ? 'Scheduled' : 'Enabled · local demo';
  host.innerHTML = '<p class="promo-eyebrow">'+esc(salon.name)+' · '+(coupon ? 'Coupon' : 'Deal')+'</p><h1>'+esc(offer.title)+'</h1><strong class="pc-customer-discount">'+esc(discount)+'</strong><p>'+esc(offer.description)+'</p><p>'+esc(date(offer.startDate))+' → '+esc(date(offer.endDate))+'</p><p>'+esc(offer.days.join(' · ')+' · '+offer.startTime+'–'+offer.endTime)+' · America/Chicago</p><ul>'+conditions.filter(Boolean).map(value => '<li>'+esc(value)+'</li>').join('')+'</ul><p class="pc-customer-status">'+esc(status)+(offer.public !== 'private' && offer.public !== 'approved' ? ' · Public review pending' : '')+'</p><p class="promo-note">Preview from saved browser data. Coupon claims, booking and customer distribution are not connected.</p>';
  const banner = offer.banners?.[0];
  if (banner?.assetId) window.NEXORA_PROMOTION_ASSETS.getUrl(banner.assetId).then(url => { if (!url) return; const image = document.createElement('img'); image.src = url; image.alt = banner.name || offer.title; host.prepend(image); }).catch(() => {});
})();
