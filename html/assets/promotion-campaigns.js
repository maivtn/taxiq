(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const {esc,today} = window.NEXORA_STUDIO;
  const CREDIT_KEY = 'nexora:ads-credit:v1';
  let api, current = null, initial = '', promotionRevision = '', opener, activeTab = 'offers';
  const t = key => api.t(key);
  const tr = key => '<span data-campaign-text="'+key+'">'+esc(t(key))+'</span>';
  const options = pairs => pairs.map(([value,key,disabled]) => '<option value="'+value+'" data-campaign-text="'+key+'"'+(disabled?' disabled':'')+'>'+esc(t(key))+'</option>').join('');
  const input = (name,label,type = 'text',attrs = '') => '<label class="promo-field">'+tr(label)+'<input name="'+name+'" type="'+type+'" '+attrs+'></label>';
  const select = (name,label,choices) => '<label class="promo-field">'+tr(label)+'<select name="'+name+'">'+options(choices)+'</select></label>';
  const money = value => '$'+Number(value).toFixed(2);
  const campaigns = () => api.getState().campaigns || [];
  const offerById = id => api.getState().offers.find(offer => offer.id === id);
  const field = name => $('#campaign-form').elements.namedItem(name);
  const statusKey = status => ({pending:'pendingCampaign',approved:'approvedCampaign',rejected:'rejectedCampaign','paused-credit':'pausedCredit'}[status] || status);
  function availableCredit() {
    try {
      const saved = JSON.parse(localStorage.getItem(CREDIT_KEY));
      if (saved && Number.isFinite(saved.balanceCents) && Number.isFinite(saved.holdCents)) return Math.max(0,(saved.balanceCents-saved.holdCents)/100);
    } catch (_) {}
    return 320;
  }
  const navigate = href => typeof window.NEXORA_NAVIGATE === 'function' ? window.NEXORA_NAVIGATE(href) : window.location.assign(href);
  function init(bridge) {
    api = bridge;
    $('#studio-campaigns').innerHTML = '<header class="studio-section-heading"><div><p class="promo-eyebrow">Promotion Studio / Paid Boost</p><h2>'+tr('campaignTitle')+'</h2><p>'+tr('campaignIntro')+'</p></div><button type="button" class="promo-button primary" id="create-campaign">'+tr('createCampaign')+'</button></header><div class="studio-setup-links"><a class="promo-button" href="nexora-packages.html?tab=ads-credit" target="_blank" rel="noopener">'+tr('creditLink')+' ↗</a><a class="promo-button" href="owner-setting.html?tab=business-verification" target="_blank" rel="noopener">'+tr('kybLink')+' ↗</a><span class="promo-note">'+tr('noLiveAds')+'</span></div><div class="promo-toolbar"><label class="promo-search"><input type="search" id="campaign-search" aria-label="'+esc(t('campaignSearch'))+'" placeholder="'+esc(t('campaignSearch'))+'"></label><select id="campaign-filter" aria-label="'+esc(t('allCampaigns'))+'">'+options([['all','allCampaigns'],['draft','draft'],['pending','pendingCampaign'],['paused','paused'],['rejected','rejectedCampaign'],['approved','approvedCampaign'],['ended','ended']])+'</select></div><div id="campaign-list" class="studio-campaign-list"></div><p id="campaign-empty" class="promo-empty">'+tr('noCampaigns')+'</p>';
    const dialog = document.createElement('dialog'); dialog.id = 'campaign-editor'; dialog.className = 'promo-dialog studio-campaign-dialog'; dialog.setAttribute('aria-labelledby','campaign-editor-title');
    dialog.innerHTML = '<form id="campaign-form" novalidate><header class="editor-header"><div><p class="promo-eyebrow">Promotion Studio / Paid Boost</p><h2 id="campaign-editor-title">'+tr('createCampaign')+'</h2></div><button class="promo-close" id="close-campaign" type="button" aria-label="'+esc(t('cancel'))+'">×</button></header><div class="editor-help"><strong>'+tr('noLiveAds')+'</strong><small>'+tr('revisionNotice')+'</small></div><div class="editor-body"><div class="editor-fields">'+
      '<section class="editor-section"><h3 class="section-number">01 / '+tr('campaignName')+'</h3>'+input('name','campaignName','text','maxlength="100" required')+select('promotionId','promotion',[])+select('objective','objective',[['traffic','traffic'],['lead','leadUnavailable',true],['booking','bookingUnavailable',true]])+'</section>'+
      '<section class="editor-section"><h3 class="section-number">02 / '+tr('audience')+'</h3><div class="promo-field-row">'+input('area','area','text','maxlength="150"')+input('radius','radius','number','min="1" max="100" step="1"')+'</div>'+select('category','category',[['beauty','beauty']])+select('audience','audience',[['local','localCustomers']])+'<fieldset class="studio-placements"><legend>'+tr('placement')+'</legend>'+[['search','searchDeals'],['explore','explore'],['banner','bannerPlacement']].map(([val,label]) => '<label><input type="checkbox" name="placements" value="'+val+'">'+tr(label)+'</label>').join('')+'</fieldset><p class="promo-note">'+tr('targetingHint')+'</p></section>'+
      '<section class="editor-section"><h3 class="section-number">03 / '+tr('campaignSchedule')+'</h3><div class="promo-field-row">'+input('startDate','campaignStart','date')+input('endDate','campaignEnd','date')+'</div><div class="promo-field-row">'+input('dailyBudget','dailyBudget','number','min="0.01" step="0.01"')+input('totalBudget','totalBudget','number','min="0.01" step="0.01"')+'</div>'+select('billing','billingModel',[['cpc','cpc'],['cpl','cpl',true],['cpa','cpa',true],['sponsored','sponsored',true]])+'<p class="studio-notice">'+tr('priceNote')+'</p>'+select('source','source',[['ads-credit','adsCredit']])+'<p class="promo-note">'+tr('creditHint')+'</p></section></div>'+
      '<aside class="editor-preview"><h3 class="section-number">04 / '+tr('creative')+'</h3>'+select('creativeId','creative',[])+'<div class="studio-sponsored-label">Sponsored · '+tr('preview')+'</div><div id="campaign-preview"></div><div class="studio-preview-terms" id="campaign-offer-terms"></div><section class="studio-eligibility"><h3>'+tr('eligibility')+'</h3><ul id="campaign-eligibility"></ul><a href="owner-setting.html?tab=business-verification" target="_blank" rel="noopener">'+tr('kybLink')+' ↗</a><a href="nexora-packages.html?tab=ads-credit" target="_blank" rel="noopener">'+tr('creditLink')+' ↗</a></section><div class="studio-budget-summary" id="campaign-budget-summary" aria-live="polite"></div><label class="promo-check-card"><input name="consent" type="checkbox"><span>'+tr('consent')+'</span></label><details class="studio-history"><summary>'+tr('campaignHistory')+'</summary><ol id="campaign-history"></ol></details></aside></div>'+
      '<footer class="editor-footer"><p class="promo-error" id="campaign-error" role="alert"></p><div class="editor-footer-actions"><button class="promo-button" type="button" id="campaign-add-credit">'+tr('saveAddCredit')+'</button><button class="promo-button" type="submit" id="save-campaign" value="draft">'+tr('saveDraft')+'</button><button class="promo-button primary" type="submit" id="submit-campaign" value="pending">'+tr('requestReview')+'</button></div></footer></form>';
    document.body.append(dialog);
    $('[data-studio-tab="offers"]').parentElement.addEventListener('click', event => {
      const button = event.target.closest('[data-studio-tab]'); if (button) tab(button.dataset.studioTab);
    });
    $('#create-campaign').addEventListener('click', () => open());
    $('#close-campaign').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { current = null; (opener?.isConnected ? opener : $('#create-campaign')).focus(); });
    $('#campaign-form').addEventListener('input', () => { if (current) { $('#campaign-error').textContent = ''; preview(); } });
    $('#campaign-form').addEventListener('change', event => { if (event.target.name === 'promotionId') { promotionRevision = JSON.stringify(offerById(field('promotionId').value)); populateCreative(); } preview(); });
    $('#campaign-form').addEventListener('submit', event => { event.preventDefault(); save(event.submitter?.value || 'draft'); });
    $('#campaign-add-credit').addEventListener('click', () => {
      const record = save('draft',{close:false});
      if (!record) return;
      const returnTo = 'reward-promotions.html?tab=campaigns&campaignId=' + encodeURIComponent(record.id);
      navigate('nexora-packages.html?tab=ads-credit&campaignId=' + encodeURIComponent(record.id) + '&returnTo=' + encodeURIComponent(returnTo));
    });
    $('#campaign-search').addEventListener('input',refresh); $('#campaign-filter').addEventListener('change',refresh);
    $('#campaign-list').addEventListener('click', event => {
      const button = event.target.closest('[data-campaign-action]'); if (!button) return;
      const campaign = campaigns().find(item => item.id === button.dataset.id); if (!campaign) return;
      const action = button.dataset.campaignAction;
      if (action === 'edit' || action === 'view') open(campaign);
      if (action === 'pause' && campaign.status !== 'ended') update(campaign,{status:'paused'});
      if (action === 'resume' && campaign.status !== 'ended') update(campaign,{status:availableCredit() >= Number(campaign.totalBudget || 0) ? (campaign.approvedAt ? 'approved' : 'pending') : 'paused-credit'});
      if (action === 'end' && window.confirm(t('endConfirm'))) update(campaign,{status:'ended'});
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'campaigns') tab('campaigns');
    const returned = campaigns().find(campaign => campaign.id === params.get('campaignId'));
    if (returned) open(returned);
  }
  function tab(name) {
    activeTab = name;
    ['offers','campaigns'].forEach(key => { $('#studio-'+key).hidden = key !== name; const button = $('[data-studio-tab="'+key+'"]'); button.classList.toggle('active',key === name); button.setAttribute('aria-pressed',String(key === name)); });
    $('#create-promotion').hidden = name !== 'offers';
  }
  function translate() {
    if (!api) return;
    document.querySelectorAll('[data-campaign-text]').forEach(el => { el.textContent = t(el.dataset.campaignText); });
    $('#campaign-search').placeholder = t('campaignSearch'); $('#campaign-search').setAttribute('aria-label',t('campaignSearch')); $('#campaign-filter').setAttribute('aria-label',t('allCampaigns')); $('#close-campaign').setAttribute('aria-label',t('cancel'));
    if (current) preview(); refresh(); tab(activeTab);
  }
  function blockers(offer) {
    const result = [];
    if (!offer || offer.public !== 'approved') result.push('publicRequired');
    if (!offer || offer.paused) result.push('promotionRequired');
    if (offer?.endDate && offer.endDate < today()) result.push('expired');
    if (current && Number(current.totalBudget || field('totalBudget')?.value || 0) > availableCredit()) result.push('creditRequired');
    result.push('backendRequired','campaignApproval'); return result;
  }
  function refresh() {
    if (!api) return;
    $('#create-campaign').disabled = !api.available() || !api.getState().offers.length;
    const query = $('#campaign-search').value.trim().toLocaleLowerCase(), filter = $('#campaign-filter').value;
    const visible = api.available() ? campaigns().filter(campaign => campaign.name.toLocaleLowerCase().includes(query) && (filter === 'all' || campaign.status === filter)) : [];
    $('#campaign-empty').hidden = visible.length > 0;
    $('#campaign-list').innerHTML = visible.map(campaign => {
      const offer = offerById(campaign.promotionId);
      const button = (action,label) => '<button type="button" class="promo-button" data-campaign-action="'+action+'" data-id="'+esc(campaign.id)+'">'+esc(t(label))+'</button>';
      const status = campaign.status === 'approved' && availableCredit() < Number(campaign.totalBudget || 0) ? 'paused-credit' : campaign.status;
      const reason = status === 'ended' ? t('ended') : status === 'paused' ? t('paused') : status === 'paused-credit' ? t('creditRequired') : (campaign.rejectionReason ? campaign.rejectionReason + ' ' : '') + blockers(offer).map(t).join(' ');
      const primary = ['paused','paused-credit'].includes(status) ? button('resume','resumeCampaign')+button('edit','editCampaign') : button('edit','editCampaign');
      return '<article class="studio-campaign-card"><div class="studio-campaign-header"><div><p class="promo-eyebrow">Paid Boost · CPC</p><h3>'+esc(campaign.name)+'</h3><p>'+esc(offer?.title || t('promotion'))+'</p></div><span class="promo-chip">'+esc(t(statusKey(status)))+'</span></div><dl class="studio-campaign-facts"><div><dt>'+esc(t('campaignStart'))+'</dt><dd>'+esc(campaign.startDate || '—')+' → '+esc(campaign.endDate || '—')+'</dd></div><div><dt>'+esc(t('dailyBudget'))+'</dt><dd>'+money(campaign.dailyBudget)+'</dd></div><div><dt>'+esc(t('totalBudget'))+'</dt><dd>'+money(campaign.totalBudget)+'</dd></div><div><dt>'+esc(t('spend'))+'</dt><dd>'+money(campaign.spent || 0)+'</dd></div></dl><p class="studio-campaign-reason">'+esc(reason)+'</p><div class="promotion-actions">'+(status !== 'ended' ? primary+(status === 'pending' || status === 'approved' ? button('pause','pauseCampaign') : '')+button('end','endCampaign') : button('view','viewCampaign'))+'<a class="promo-button" href="promotion-performance.html?promotionId='+encodeURIComponent(campaign.promotionId)+'&campaignId='+encodeURIComponent(campaign.id)+'">'+esc(t('performance'))+'</a></div></article>';
    }).join('');
  }
  function populateCreative(selected) {
    const offer = offerById(field('promotionId').value);
    field('creativeId').innerHTML = (offer?.banners || []).map((banner,index) => '<option value="'+esc(banner.id)+'">'+(index+1)+'. '+esc(banner.name || banner.theme)+'</option>').join('');
    if (selected && (offer?.banners || []).some(banner => banner.id === selected)) field('creativeId').value = selected;
  }
  function open(campaign) {
    if (!api.available()) return;
    opener = document.activeElement;
    const first = api.getState().offers[0];
    if (!first) return;
    current = campaign ? JSON.parse(JSON.stringify(campaign)) : {id:null,name:'',promotionId:first.id,objective:'traffic',area:'',radius:10,category:'beauty',audience:'local',placements:['search'],startDate:'',endDate:'',dailyBudget:10,totalBudget:100,billing:'cpc',source:'ads-credit',status:'draft'};
    initial = campaign ? JSON.stringify(campaign) : '';
    $('#campaign-form').reset();
    field('promotionId').innerHTML = api.getState().offers.map(offer => '<option value="'+esc(offer.id)+'">'+esc(offer.title)+'</option>').join('');
    ['name','promotionId','objective','area','radius','category','audience','startDate','endDate','dailyBudget','totalBudget','billing','source'].forEach(key => { field(key).value = current[key] ?? ''; });
    promotionRevision = JSON.stringify(offerById(current.promotionId));
    $('#campaign-form').querySelectorAll('[name="placements"]').forEach(el => { el.checked = current.placements.includes(el.value); });
    field('consent').checked = false;
    const ended = current.status === 'ended';
    $('#campaign-form').querySelectorAll('input,select').forEach(el => { el.disabled = ended; });
    $('#save-campaign').hidden = $('#submit-campaign').hidden = $('#campaign-add-credit').hidden = ended;
    populateCreative(current.creativeId); $('#campaign-error').textContent = ''; preview();
    $('#campaign-editor').showModal(); $('#campaign-editor .editor-body').scrollTop = 0; field('name').focus();
  }
  function preview() {
    if (!current) return;
    $('#campaign-history').innerHTML = (current.history || []).slice().reverse().map(item => '<li>'+esc(t(statusKey(item.status)))+' · '+esc(new Date(item.at).toLocaleString())+'</li>').join('') || '<li>'+esc(t('noHistory'))+'</li>';
    const offer = offerById(field('promotionId').value), banner = offer?.banners.find(item => item.id === field('creativeId').value);
    $('#campaign-preview').innerHTML = offer && banner ? api.artwork(offer,banner) : '';
    api.hydrateImages($('#campaign-preview'));
    $('#campaign-offer-terms').innerHTML = offer ? window.NEXORA_STUDIO.terms(offer,t).map(term => '<p>'+esc(term)+'</p>').join('') : '';
    $('#campaign-eligibility').innerHTML = blockers(offer).map(key => '<li>'+esc(t(key))+'</li>').join('');
    const daily = Number(field('dailyBudget').value), total = Number(field('totalBudget').value);
    $('#campaign-budget-summary').innerHTML = '<span>'+esc(t('dailyBudget'))+'<strong>'+(Number.isFinite(daily)?money(daily):'—')+'</strong></span><span>'+esc(t('totalBudget'))+'<strong>'+(Number.isFinite(total)?money(total):'—')+'</strong></span><small>Ads Credit · USD · CPC $0.50 · '+esc(t('preview'))+'</small>';
  }
  function error(key,name) { $('#campaign-error').textContent = t(key); if (name) field(name).focus(); }
  function save(status,options = {}) {
    if (!current || current.status === 'ended' || !api.available()) return;
    const record = {...current};
    ['name','promotionId','objective','area','category','audience','startDate','endDate','billing','source','creativeId'].forEach(key => { record[key] = field(key).value.trim(); });
    ['dailyBudget','totalBudget','radius'].forEach(key => { record[key] = Number(field(key).value); });
    record.placements = [...$('#campaign-form').querySelectorAll('[name="placements"]:checked')].map(el => el.value);
    const offer = offerById(record.promotionId);
    if (!record.name || record.name.length > 100 || !offer) return error('campaignNameError','name');
    if (!record.startDate || !record.endDate || record.endDate < record.startDate || (offer.startDate && record.startDate < offer.startDate) || (offer.endDate && record.endDate > offer.endDate)) return error('campaignDateError','endDate');
    const validAmount = name => /^\d+(\.\d{1,2})?$/.test(field(name).value) && Number.isFinite(record[name]) && record[name] > 0;
    if (!validAmount('dailyBudget') || !validAmount('totalBudget') || record.dailyBudget > record.totalBudget || record.totalBudget < Number(current.spent || 0)+Number(current.held || 0)) return error('budgetError','dailyBudget');
    if (!record.area || record.area.length > 150 || !Number.isInteger(record.radius) || record.radius < 1 || record.radius > 100 || !record.placements.length) return error('targetingError','area');
    if (!offer.banners.some(banner => banner.id === record.creativeId)) return error('creativeError','creativeId');
    if (record.billing !== 'cpc' || record.objective !== 'traffic' || record.source !== 'ads-credit') return error('campaignStale');
    if (status === 'pending' && !field('consent').checked) return error('consentError','consent');
    if (current.id && JSON.stringify(campaigns().find(item => item.id === current.id)) !== initial || JSON.stringify(offer) !== promotionRevision) return error('campaignStale');
    record.id ||= 'campaign-'+crypto.randomUUID(); record.status = status; record.updatedAt = Date.now();
    record.promotionVersion = offer.publicationVersion || 0;
    record.policy = {version:'prototype-cpc-1',unitPrice:0.5,currency:'USD',billing:'cpc'};
    record.consent = status === 'pending' ? {at:Date.now(),policyVersion:record.policy.version,dailyBudget:record.dailyBudget,totalBudget:record.totalBudget} : null;
    record.history = [...(current.history || []),{at:Date.now(),status,policy:record.policy,consent:record.consent}];
    const next = {...api.getState(),campaigns:current.id ? campaigns().map(item => item.id === current.id ? record : item) : [...campaigns(),record]};
    if (!api.persist(next)) { error('saveError'); return null; }
    if (options.close !== false) $('#campaign-editor').close();
    else { current = JSON.parse(JSON.stringify(record)); initial = JSON.stringify(record); }
    tab('campaigns'); api.feedback(t('campaignSaved')); return record;
  }
  function update(campaign,patch) {
    if (!api.available()) return;
    const next = {...campaign,...patch,updatedAt:Date.now(),history:[...(campaign.history || []),{at:Date.now(),status:patch.status}]};
    if (api.persist({...api.getState(),campaigns:campaigns().map(item => item.id === campaign.id ? next : item)})) api.feedback(t('campaignSaved'));
  }
  function validSaved(items) {
    return Array.isArray(items) && new Set(items.map(item => item?.id)).size === items.length && items.every(item => item &&
      ['id','name','promotionId','creativeId','area','startDate','endDate'].every(key => typeof item[key] === 'string') &&
      ['draft','pending','paused','paused-credit','ended','approved','rejected'].includes(item.status) &&
      Array.isArray(item.placements) && item.placements.every(value => ['search','explore','banner'].includes(value)) &&
      ['dailyBudget','totalBudget','radius'].every(key => typeof item[key] === 'number' && Number.isFinite(item[key])) &&
      (!item.history || Array.isArray(item.history)));
  }
  window.NEXORA_CAMPAIGNS = {init,refresh,translate,validSaved};
})();
