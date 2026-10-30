/* Local Home, Salon Home and Getting started. Business copy comes from the PO data asset. */
(function () {
  'use strict';
  var data = window.NEXORA_WELCOME_DATA;
  var main = document.getElementById('nxw-main');
  if (!data || !main) return;
  var view = document.body.dataset.welcomeView;
  var carouselSlides = view === 'public' ? data.publicGroups.reduce(function(all, group) { return all.concat(group.products.map(function(product) { var source = data.slides.find(function(p) { return p.key === product.key; }) || data.slides.find(function(p) { return p.key === 'aihub'; }); return Object.assign({}, product, {features: source.features}); })); }, []) : data.slides;
  var copy = data.library.copy;
  var setupCopy = Object.assign({}, data.setup.copy, data.flow.copy);
  var salonCopy = data.salonSetup.copy;
  var homeCopy = data.homeCopy;
  // Structured business fields and labels follow the referenced Salon Information screen.
  var businessAddressFields = [
    ['street', 'Street Address', 'e.g. 123 Main St, Suite 100', 'street-address'],
    ['city', 'City', 'e.g. Austin', 'address-level2'],
    ['region', 'State or Province', 'e.g. Texas', 'address-level1'],
    ['zip', 'ZIP Code', 'e.g. 78701', 'postal-code'],
    ['country', 'Country', 'e.g. United States', 'country-name']
  ];
  var businessCountries = [['US','United States','1'],['CA','Canada','1'],['VN','Vietnam','84'],['GB','United Kingdom','44'],['AU','Australia','61'],['SG','Singapore','65'],['JP','Japan','81'],['KR','South Korea','82'],['DE','Germany','49'],['FR','France','33'],['IN','India','91'],['CN','China','86'],['BR','Brazil','55'],['MX','Mexico','52'],['HK','Hong Kong','852'],['TW','Taiwan','886'],['MY','Malaysia','60'],['TH','Thailand','66'],['PH','Philippines','63'],['ID','Indonesia','62']];
  var businessTimeZones = ['America/Los_Angeles','America/Denver','America/Chicago','America/New_York','America/Anchorage','Pacific/Honolulu','America/Toronto','America/Vancouver','America/Edmonton','America/Winnipeg','America/Mexico_City','America/Tijuana','Asia/Ho_Chi_Minh'];
  var businessDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var voicePhones = [
    ['voiceSalonPhone','Salon phone number','The number customers currently call; it will be forwarded to the AI number.'],
    ['voiceAnsweringPhone','AI answering number','Provided by NEXORA; AI answers 24/7 on this number.'],
    ['voiceBookingPhone','Booking notification number','Gets booking SMS notifications and AI forwards calls to this phone number when a customer asks to speak with a real person.']
  ];
  var voiceSms = [
    ['voiceSmsCustomer','Send to customer','Confirm that the booking request was received.'],
    ['voiceSmsBusiness','Send to business',"Notify the business's booking notification number."],
    ['voiceSmsStaff','Send to assigned staff','Alert the staff member(s) assigned to the appointment.']
  ];
  var storageKey = 'nexora.local-onboarding.v1';
  var state = { industry: 'nail', drafts: {} };
  try {
    var saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      if (data.library.guides.some(function (g) { return g.key === saved.industry; })) state.industry = saved.industry;
      if (saved.drafts && typeof saved.drafts === 'object' && !Array.isArray(saved.drafts)) state.drafts = saved.drafts;
    }
  } catch (_) {}
  var selectedStep = 0;
  var serviceWorkspace = null;
  var staffWorkspace = null;
  var qrWorkspace = null;
  var activeOnboardTab = 'journey';
  var helpProduct = '';
  var helpSearch = '';
  var selectedHelp = 'voice';
  var selectedProduct = 'pos';
  var slideIndex = 0;
  var slideTimer = null;
  var playing = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var explorerProduct = 'pos';
  var explorerFeature = 0;
  var persist = function () { try { window.localStorage.setItem(storageKey, JSON.stringify(state)); return true; } catch (_) { return false; } };
  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function icon(key, size) { return window.NEXORA_ICONS ? window.NEXORA_ICONS.image(key, {size: size || 38}) : ''; }
  function iconFrame(key, size) { return '<span class="nxw-icon" aria-hidden="true">' + icon(key, size) + '</span>'; }
  function button(label, action, secondary) { return '<button class="nxw-btn' + (secondary ? ' secondary' : '') + '" type="button" data-action="' + escape(action) + '">' + escape(label) + '</button>'; }
  function link(label, href, secondary) { return '<a class="nxw-btn' + (secondary ? ' secondary' : '') + '" href="' + escape(href) + '">' + escape(label) + '</a>'; }
  function moduleRoute(key) {
    var routes = {gift:'gift-card-center.html','ai-voice':'pos-ai-voice.html','aihub-marketing':'dashboard.html?module=aihub&section=marketing','aihub-marketing-campaign':'nexora-sms-dashboard.html','aimarketing':'dashboard.html?module=aihub&section=marketing','spin-wheel':'dashboard.html?module=spinwheel',spin:'dashboard.html?module=spinwheel',deals:'pos-deal-coupon.html'};
    return routes[key] || 'dashboard.html?module=' + encodeURIComponent(key);
  }
  function featureRoute(product, feature, index) {
    var exact = {
      checkin:'pos-front-desk.html?section=checkin',queue:'pos-front-desk-turn-board.html',calendar:'pos-front-desk.html?section=appointments&bookingView=appointment&view=calendar',chart:'pos-technician-report.html?tab=store',
      qrCheckin:'pos-qr-checkin.html',qrBooking:'pos-front-desk.html?section=appointments&bookingView=booking',qrServices:'pos-salon-settings.html?section=services',qrReviews:'nexora-review.html',qrTips:'qr-stations.html?tab=qr-stations',qrPayment:'qr-stations.html?tab=accept-payment',qrReferral:'qr-stations.html?tab=referral-link',qrStaff:'qr-stations.html?tab=staff-invite-qr',
      aihubAppointments:'booking-book-phase-1.html?tab=booking&view=today',aihubCalendar:'booking-book-phase-1.html?tab=booking&view=calendar',aihubCustomers:'booking-book-phase-1.html?tab=customers',aihubCalls:'booking-book-phase-1.html?tab=calllog',aihubPlans:'booking-book-phase-1.html?tab=plans',aihubSettings:'booking-book-phase-1.html?tab=settings',aihubVoice:'salon-guide-ai-voice.html',aihubSms:'nexora-sms-dashboard.html',aihubCampaigns:'vlinkpay-campaigns.html',aihubOffers:'reward-promotions.html',marketingSms:'nexora-sms-dashboard.html',marketingCampaign:'vlinkpay-campaigns.html',marketingPos:'reward-promotions.html',marketingWheel:'dashboard.html?module=spinwheel',marketingReviews:'nexora-review.html',marketingCustomers:'booking-book-phase-1.html?tab=customers',marketingAnalytics:'nexora-analytics.html'
    };
    if (exact[feature]) return exact[feature];
    if (product === 'oneqr') return 'qr-stations.html?tab=one-qr';
    if (product === 'reviews') return 'nexora-review.html';
    if (product === 'community') return feature === 'communityContent' ? moduleRoute('community') : 'community.html?tab=' + ({communityFeed:'feed',communityGroups:'groups',communityJobs:'jobs',communityShifts:'shift',communityDeals:'deals',communityMessages:'connect',communityCalls:'calls'}[feature] || 'feed');
    if (product === 'payments') return ['payment-income.html','tip-list.html','staff-payouts.html','payment-activity.html'][index] || moduleRoute(product);
    if (product === 'analytics') return 'nexora-analytics.html';
    return moduleRoute(product);
  }
  function stepRoute(kind) {
    return {business:'pos-salon-settings.html?section=information',services:'pos-salon-settings.html?section=services',staff:'pos-salon-settings.html?section=staff',qr:'qr-stations.html?tab=one-qr',voice:'salon-guide-ai-voice.html',catalog:'qr-stations.html?tab=one-qr',menu:'qr-stations.html?tab=one-qr',payment:'qr-stations.html?tab=accept-payment',deal:'pos-deal-coupon.html',review:'nexora-review.html'}[kind] || 'dashboard.html';
  }
  function slideData(key) { return data.slides.find(function (p) { return p.key === key; }) || data.slides[0]; }
  function productIcon(key) { return {aimarketing:'marketing',spin:'spinwheel',deals:'rewards'}[key] || slideData(key).icon; }
  function productsHTML(products) {
    return '<div class="nxw-cards">' + (products || data.slides).map(function (product) {
      return '<a class="nxw-card" href="' + escape(moduleRoute(product.key)) + '"><img src="' + escape(product.image) + '" alt="" loading="lazy" decoding="async"><div class="nxw-card-body"><div class="nxw-card-top">' + iconFrame(product.icon, 39) + '<div><strong>' + escape(product.name) + '</strong><small>' + escape(product.status) + '</small></div></div><p>' + escape(product.description) + '</p><ul class="nxw-card-features">' + product.features.map(function (s) { return '<li>' + escape(s) + '</li>'; }).join('') + '</ul><span class="nxw-card-link">View details →</span></div></a>';
    }).join('') + '</div>';
  }
  function carouselHTML() {
    return '<section class="nxw-hero" id="nxw-carousel" aria-roledescription="carousel" aria-label="NEXORA TOUCH products"><div class="nxw-hero-copy" id="nxw-slide-copy"></div><div class="nxw-hero-visual"><img id="nxw-slide-image" src="' + carouselSlides[0].image + '" alt="" decoding="async"><div class="nxw-journey"><span class="nxw-kicker">HOW IT WORKS</span><ol id="nxw-slide-flow"></ol></div></div><div class="nxw-carousel-controls"><button type="button" data-action="slide-prev" aria-label="Previous product">←</button><button type="button" data-action="slide-next" aria-label="Next product">→</button><div class="nxw-dots" aria-label="NEXORA TOUCH products">' + carouselSlides.map(function (p, i) { return '<button type="button" data-slide="' + i + '" aria-label="' + escape(p.name) + '" aria-pressed="' + (i === 0) + '"></button>'; }).join('') + '</div><span class="nxw-count" id="nxw-slide-count"></span><button type="button" data-action="slide-play" id="nxw-slide-play"></button></div></section>';
  }
  function renderSlide(index) {
    slideIndex = (index + carouselSlides.length) % carouselSlides.length;
    var product = carouselSlides[slideIndex];
    var detail = data.previewDetails[product.key] || data.previewDetails.aihub;
    document.getElementById('nxw-slide-copy').innerHTML = '<div class="nxw-hero-top"><span class="nxw-kicker">NEXORA TOUCH' + (view === 'salon' ? ' / BITCOIN NAIL BAR' : '') + '</span><span class="nxw-badge">' + escape(product.status) + '</span></div><h1 id="nxw-slide-title">' + escape(product.name) + '</h1><p>' + escape(product.description) + '</p><div class="nxw-tour"><span class="nxw-kicker">AI TOUR · AUTOMATIC INTRO</span><p>' + escape(data.tours[product.key] || data.tours.aihub) + '</p></div><ul class="nxw-tags" aria-label="KEY FEATURES">' + product.features.map(function (label) { return '<li>' + escape(label) + '</li>'; }).join('') + '</ul><div class="nxw-actions">' + link(product.key === 'spin-wheel' ? 'Try Spin Wheel →' : product.key === 'aihub-marketing-campaign' ? 'Explore campaign preview →' : 'Explore product →', moduleRoute(product.key)) + (view === 'salon' ? '<a class="nxw-btn secondary" href="#salon-feature-explorer" data-preview-product="' + escape(product.key) + '">Preview features →</a>' : link(homeCopy.openDashboard, 'dashboard.html', true)) + '</div>';
    document.getElementById('nxw-slide-image').src = product.image;
    document.getElementById('nxw-slide-flow').innerHTML = detail.flow.split(' → ').map(function (label, i) { return '<li><b>' + (i + 1) + '</b><span>' + escape(label) + '</span></li>'; }).join('');
    document.getElementById('nxw-slide-count').textContent = (slideIndex + 1) + ' / ' + carouselSlides.length;
    main.querySelectorAll('[data-slide]').forEach(function (el) { el.setAttribute('aria-pressed', String(Number(el.dataset.slide) === slideIndex)); });
  }
  function syncSlideshow() {
    if (slideTimer) window.clearInterval(slideTimer);
    slideTimer = null;
    var play = document.getElementById('nxw-slide-play');
    if (!play) return;
    play.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
    play.textContent = playing ? 'Ⅱ' : '▶';
    if (playing && !document.hidden) slideTimer = window.setInterval(function () { renderSlide(slideIndex + 1); }, 7000);
  }
  function renderExplorer() {
    var current = data.explorer[explorerProduct] || data.explorer.pos;
    var feature = current.features[explorerFeature] || current.features[0];
    var picture = slideData(explorerProduct === 'aimarketing' ? 'aihub-marketing' : explorerProduct);
    document.getElementById('nxw-explorer-products').innerHTML = Object.keys(data.explorer).map(function (key) { return '<button type="button" data-explorer-product="' + key + '" aria-pressed="' + (key === explorerProduct) + '">' + icon(productIcon(key), 23) + escape(data.explorer[key].name) + '</button>'; }).join('');
    document.getElementById('nxw-feature-list').innerHTML = current.features.map(function (item, i) { return '<button type="button" data-explorer-feature="' + i + '" aria-pressed="' + (i === explorerFeature) + '">' + escape(item.title) + '</button>'; }).join('');
    document.getElementById('nxw-feature-detail').innerHTML = '<img src="' + picture.image + '" alt="" loading="lazy"><div class="nxw-feature-content"><span class="nxw-kicker">' + escape(current.name) + '</span><h3>' + escape(feature.title) + '</h3><p>' + escape(feature.description) + '</p><ol>' + data.previewDetails[picture.key].descriptions.map(function (s) { return '<li>' + escape(s) + '</li>'; }).join('') + '</ol><div class="nxw-actions">' + link('View details →', featureRoute(explorerProduct, feature.key, explorerFeature)) + '</div></div>';
  }
  function renderHome() {
    var publicPage = view === 'public';
    main.innerHTML = (publicPage ? '<section class="nxw-public-intro"><div><span class="nxw-kicker">' + escape(homeCopy.eyebrow) + '</span><h1>' + escape(homeCopy.suiteTitle) + '</h1></div><p>' + escape(homeCopy.heroBody) + '</p></section>' : '<div class="nxw-head"><div><span class="nxw-kicker">Home</span><h1>Salon Home</h1></div>' + link(copy.pageTitle, 'nexora-getting-started.html') + '</div>') + carouselHTML() + '<nav class="nxw-jump" aria-label="Salon Home"><a href="#nxw-products">Products</a>' + (!publicPage ? '<a href="#salon-feature-explorer">Explore UI</a><a href="#nxw-daily">Daily work</a><a href="#nxw-owner">Salon owner</a>' : '<a href="#nxw-start">' + escape(homeCopy.navStart) + '</a><a href="salon-home.html">Salon Home</a>') + '</nav><section class="nxw-section" id="nxw-products"><div class="nxw-section-head"><div><span class="nxw-kicker">' + escape(publicPage ? homeCopy.suiteKicker : 'NEXORA TOUCH') + '</span><h2>' + escape(publicPage ? homeCopy.suiteTitle : 'The Nexora ecosystem for businesses') + '</h2><p>' + escape(publicPage ? homeCopy.suiteBody : 'Product screens and features across Nexora, including AI Marketing') + '</p></div><span class="nxw-badge">' + (publicPage ? '12 products' : '12 product showcases') + '</span></div>' + (publicPage ? data.publicGroups.map(function(group){return '<div class="nxw-section"><div class="nxw-section-head"><div><h3>'+escape(group.title)+'</h3><p>'+escape(group.description)+'</p></div><span class="nxw-badge">4</span></div>'+productsHTML(group.products)+'</div>';}).join('') : productsHTML()) + '</section>';
    if (publicPage) {
      main.insertAdjacentHTML('beforeend', '<section class="nxw-section nxw-owner" id="nxw-start"><div><span class="nxw-kicker">' + escape(homeCopy.closingKicker) + '</span><h2>' + escape(homeCopy.closingTitle) + '</h2><p>' + escape(homeCopy.closingBody) + '</p></div><div class="nxw-actions">' + link(homeCopy.closingExplore, '#nxw-products', true) + link(copy.pageTitle, 'nexora-getting-started.html') + '</div></section><footer class="nxw-public-footer"><p>' + escape(homeCopy.footerCopyright) + '</p><a href="dashboard.html">' + escape(homeCopy.openDashboard) + '</a></footer>');
    } else {
      main.insertAdjacentHTML('beforeend', '<section class="nxw-section nxw-explorer" id="salon-feature-explorer"><div class="nxw-section-head"><div><span class="nxw-kicker">NEXORA PRODUCT STUDIO</span><h2>Explore UI</h2><p>' + escape(copy.productIntro) + '</p></div><span class="nxw-badge">' + escape(setupCopy.previewTag) + '</span></div><div class="nxw-product-tabs" id="nxw-explorer-products" aria-label="All products"></div><div class="nxw-explorer-body"><div class="nxw-feature-list" id="nxw-feature-list" aria-label="KEY FEATURES"></div><article class="nxw-feature-detail" id="nxw-feature-detail" aria-live="polite"></article></div></section><section class="nxw-section" id="nxw-daily"><div class="nxw-section-head"><h2>Daily work</h2></div><div class="nxw-tools">' + [{title:'Check-in',icon:'pos',url:'pos-front-desk.html?section=checkin'},{title:'Turn Board',icon:'staff',url:'pos-front-desk-turn-board.html'},{title:'Appointments',icon:'booking',url:'pos-front-desk.html?section=appointments&bookingView=appointment&view=calendar'},{title:'Sales',icon:'report',url:'pos-technician-report.html?tab=store'}].map(function (tool) { return '<a class="nxw-tool" href="' + tool.url + '">' + iconFrame(tool.icon) + '<strong>' + tool.title + ' →</strong></a>'; }).join('') + '</div></section><section class="nxw-section nxw-owner" id="nxw-owner"><div><span class="nxw-kicker">Salon owner</span><h2>' + escape(salonCopy.heading) + '</h2><p>' + escape(salonCopy.intro) + '</p></div><div class="nxw-actions">' + link(copy.pageTitle, 'nexora-getting-started.html') + link('Salon Settings', 'pos-salon-settings.html', true) + '</div></section>');
      renderExplorer();
    }
    renderSlide(0);
    syncSlideshow();
    var carousel = document.getElementById('nxw-carousel');
    carousel.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault(); playing = false; renderSlide(slideIndex + (event.key === 'ArrowLeft' ? -1 : 1)); syncSlideshow();
    });
    carousel.addEventListener('focusin', function (event) { if (event.target.closest('[data-action="slide-play"]')) return; playing = false; syncSlideshow(); });
    document.addEventListener('visibilitychange', syncSlideshow);
  }
  function guide() { return data.library.guides.find(function (item) { return item.key === state.industry; }) || data.library.guides[0]; }
  function path() { return data.setup.paths[guide().key]; }
  function isSalon() { return ['nail','hair','spa'].indexOf(guide().key) !== -1; }
  function stepTitle(index) { return path()[index] === 'voice' ? setupCopy.voiceStep : isSalon() ? salonCopy['step' + (index + 1)] : index === 0 ? setupCopy.businessStep : copy[guide().steps[index][0]]; }
  function readStep(kind) {
    var value = state.drafts[guide().key] && state.drafts[guide().key][kind];
    var fields = value && value.fields && typeof value.fields === 'object' ? value.fields : {};
    return {fields:fields, completed:!!(value && value.completed) && (kind !== 'business' || businessComplete(fields)) && (kind !== 'services' || servicesComplete(fields)) && (kind !== 'staff' || (fields.staffMode==='invite' ? fields.inviteConfirmed==='true' : staffComplete(fields))) && (kind !== 'qr' || window.NEXORA_QR_SETUP.complete(fields))};
  }
  function destroyQrWorkspace(){if(qrWorkspace){qrWorkspace.destroy();qrWorkspace=null;}}
  function mountQrWorkspace(fields){
    var industry=guide().key;
    qrWorkspace=window.NEXORA_QR_SETUP.mount(main.querySelector('[data-onboarding-qr]'),{
      fields:fields,business:readStep('business').fields,legacyTiles:data.flow.qrTiles,
      chooseAtLeastOne:setupCopy.chooseAtLeastOne,requiredMessage:setupCopy.requiredMessage,saveFailed:setupCopy.saveFailed,
      onChange:function(snapshot){var saved=savePreparationDraft(industry,'qr',snapshot);renderEnteredPreview();return saved;},
      onBusy:function(busy){var submit=main.querySelector('#nxw-setup-form [type="submit"]');if(submit)submit.disabled=busy;}
    });
    renderEnteredPreview();
  }
  function staffComplete(fields) {return window.NEXORA_STAFF_SETUP&&window.NEXORA_STAFF_SETUP.complete(fields);}
  function savePreparationDraft(industry,kind,patch) {
    if(!state.drafts[industry])state.drafts[industry]={};
    var value=state.drafts[industry][kind]||{fields:{},completed:false};
    var next=Object.assign({},value.fields,JSON.parse(JSON.stringify(patch)));
    state.drafts[industry][kind]={fields:next,completed:!!value.completed&&JSON.stringify(next)===JSON.stringify(value.fields)};
    var saved=persist();
    if(industry===guide().key&&path()[selectedStep]===kind){
      document.getElementById('nxw-save-status').textContent=saved?setupCopy.draftSaved:setupCopy.saveFailed;updateProgress();
    }
    return saved;
  }
  function destroyStaffWorkspace() {if(staffWorkspace){staffWorkspace.destroy();staffWorkspace=null;}}
  function mountStaffWorkspace(fields) {
    var industry=guide().key;
    staffWorkspace=window.NEXORA_STAFF_SETUP.mount(main.querySelector('[data-onboarding-staff]'),{
      fields:fields,business:readStep('business').fields,categories:readStep('services').fields.serviceCatalog,
      requiredMessage:setupCopy.requiredMessage,saveFailed:setupCopy.saveFailed,legacyServicesLabel:setupCopy.fieldStaffServices,
      onChange:function(snapshot){return savePreparationDraft(industry,'staff',snapshot);}
    });
  }
  function servicesComplete(fields) {
    var categories=fields.serviceCatalog;
    if(!Array.isArray(categories)||!categories.length)return false;
    var services=categories.reduce(function(all,category){return all.concat(category.services||[]);},[]).filter(function(service){return service.id!=='__custom__';});
    return services.length>0&&categories.every(function(category){return String(category.name||'').trim();})&&services.every(function(service){return String(service.name||'').trim()&&service.price!==''&&service.price!=null&&Number.isFinite(Number(service.price))&&Number(service.price)>=0&&Number.isInteger(Number(service.durationMin))&&Number(service.durationMin)>0;});
  }
  function destroyServiceWorkspace() {if(serviceWorkspace){serviceWorkspace.destroy();serviceWorkspace=null;}}
  function mountServiceWorkspace(fields) {
    var industry=guide().key, panel=main.querySelector('[data-onboarding-services]');
    var categories=Array.isArray(fields.serviceCatalog)?fields.serviceCatalog:undefined;
    if(!categories&&[1,2].some(function(index){return fields['item'+index+'Name'];})){
      categories=[{id:'onboarding-services',name:'Services',services:[1,2].filter(function(index){return fields['item'+index+'Name'];}).map(function(index){return {id:'onboarding-service-'+index,name:fields['item'+index+'Name'],price:fields['item'+index+'Price']||'',durationMin:parseFloat(fields['item'+index+'Duration'])||'',description:fields['item'+index+'Detail']||'',active:true};})}];
    }
    var approvals=Array.isArray(fields.serviceApprovals)?fields.serviceApprovals.slice():[];
    function saveDraft(snapshot) {
      return savePreparationDraft(industry,'services',{serviceCatalog:snapshot.categories,serviceApprovals:snapshot.approvals});
    }
    serviceWorkspace=window.NEXORA_SALON_SERVICES.mount(panel,{
      onboarding:true, salon:{id:'onboarding-'+industry}, categories:categories,
      api:{
        load:function(){return approvals.slice();},
        requiresApproval:function(_,id){return approvals.indexOf(id)!==-1;},
        loadCatalog:function(_,fallback){return JSON.parse(JSON.stringify(categories||fallback));},
        saveCatalog:function(_,next,ids){var nextApprovals=ids||approvals;if(!saveDraft({categories:next,approvals:nextApprovals}))throw new Error(setupCopy.saveFailed);categories=next;approvals=nextApprovals.slice();}
      },
      onChange:function(snapshot){categories=snapshot.categories;saveDraft(snapshot);}
    });
  }
  function businessComplete(fields) {
    return ['name','phone','phoneCountry','timeZone'].concat(businessAddressFields.map(function (field) { return field[0]; })).every(function (name) { return String(fields[name] || '').trim(); }) && businessTimeZones.indexOf(fields.timeZone) !== -1 && businessDays.every(function (_, index) {
      return fields['hoursOpen' + index] === 'false' || (fields['hoursOpen' + index] === 'true' && /^([01]\d|2[0-3]):[0-5]\d$/.test(fields['hoursFrom' + index] || '') && /^([01]\d|2[0-3]):[0-5]\d$/.test(fields['hoursTo' + index] || ''));
    });
  }
  function writeStep(kind, patch) {
    var value = readStep(kind);
    var changed = Object.keys(patch).some(function (key) { return String(value.fields[key] == null ? '' : value.fields[key]) !== String(patch[key]); });
    if (!state.drafts[guide().key]) state.drafts[guide().key] = {};
    state.drafts[guide().key][kind] = {fields:Object.assign({}, value.fields, patch),completed:changed ? false : value.completed};
    return persist();
  }
  function firstUnfinished() { var next = path().findIndex(function (kind) { return !readStep(kind).completed; }); return next < 0 ? 0 : next; }
  function updateProgress() {
    var steps = path().filter(function (kind) { return kind !== 'voice'; });
    var done = steps.filter(function (kind) { return readStep(kind).completed; }).length;
    document.getElementById('nxw-progress-label').textContent = setupCopy.progressLabel.replace('{done}', done).replace('{total}', steps.length) + (isSalon() ? ' · AI Voice: ' + setupCopy.optionalStep : '');
    var progress = document.getElementById('nxw-progress'); progress.max = steps.length; progress.value = done;
    main.querySelectorAll('[data-setup-step]').forEach(function (el) { var i = Number(el.dataset.setupStep), completed = readStep(path()[i]).completed; el.dataset.completed = String(completed); el.querySelector('b').textContent = completed ? '✓' : String(i + 1); });
  }
  function renderOnboarding() {
    destroyServiceWorkspace();
    destroyStaffWorkspace();
    destroyQrWorkspace();
    main.innerHTML = '<div class="nxw-head"><div><span class="nxw-kicker">' + escape(copy.libraryEyebrow) + '</span><h1>' + escape(copy.pageTitle) + '</h1><p>' + escape(copy.pageIntro) + '</p></div>' + link('← Dashboard', 'dashboard.html', true) + '</div><section class="nxw-industry-picker"><div class="nxw-section-head"><div><h3>' + escape(copy.libraryHeading) + '</h3><p>' + escape(copy.libraryIntro) + '</p></div><span class="nxw-badge">' + escape(copy.counts) + '</span></div><div class="nxw-industries" role="group" aria-label="' + escape(copy.chooseIndustry) + '">' + data.library.guides.map(function (g) { return '<button class="nxw-industry" type="button" data-industry="' + g.key + '" aria-pressed="' + (g.key === state.industry) + '"><img src="' + g.sampleImage + '" alt="" loading="lazy"><span>' + escape(copy[g.name]) + '</span></button>'; }).join('') + '</div></section><div class="nxw-tabs" role="tablist" aria-label="' + escape(copy.pageTitle) + '">' + [['journey','tabJourney'],['docs','tabDocs'],['reception','tabReception'],['help','tabHelp'],['products','tabProducts']].map(function (entry, i) { return '<button type="button" role="tab" id="nxw-tab-' + entry[0] + '" data-onboard-tab="' + entry[0] + '" aria-controls="nxw-panel-' + entry[0] + '" aria-selected="' + (activeOnboardTab === entry[0]) + '" tabindex="' + (activeOnboardTab === entry[0] ? 0 : -1) + '"><b>' + (i + 1) + '</b>' + escape(copy[entry[1]]) + '</button>'; }).join('') + '</div>' + ['journey','docs','reception','help','products'].map(function (tab) { return '<section class="nxw-panel" id="nxw-panel-' + tab + '" role="tabpanel" aria-labelledby="nxw-tab-' + tab + '"' + (tab !== activeOnboardTab ? ' hidden' : '') + '></section>'; }).join('');
    renderJourney(); renderDocs(); renderReception(); renderHelp(); renderProductGuides();
    main.querySelector('[role=tablist]').addEventListener('keydown', function (event) {
      var tabs = Array.from(main.querySelectorAll('[data-onboard-tab]'));
      var i = tabs.indexOf(document.activeElement);
      var next = event.key === 'ArrowRight' ? i + 1 : event.key === 'ArrowLeft' ? i - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next === null) return; event.preventDefault(); var tab = tabs[(next + tabs.length) % tabs.length]; openTab(tab.dataset.onboardTab); tab.focus();
    });
  }
  function openTab(tab) {
    activeOnboardTab = tab;
    main.querySelectorAll('[data-onboard-tab]').forEach(function (el) { var active = el.dataset.onboardTab === tab; el.setAttribute('aria-selected', String(active)); el.tabIndex = active ? 0 : -1; });
    main.querySelectorAll('[role=tabpanel]').forEach(function (el) { el.hidden = el.id !== 'nxw-panel-' + tab; });
    var url = new URL(window.location.href); url.searchParams.set('view', tab); window.history.replaceState(null, '', url);
  }
  function renderJourney() {
    var g = guide();
    document.getElementById('nxw-panel-journey').innerHTML = '<span class="nxw-kicker">' + escape(copy[g.name]) + '</span><h2>' + escape(isSalon() ? salonCopy.heading : setupCopy.pathHeading) + '</h2><p>' + escape(isSalon() ? salonCopy.intro : setupCopy.pathIntro) + '</p><div class="nxw-actions">' + button(copy.startFirstStep,'start-first') + button(copy.viewIndustryDocs,'open-docs',true) + '</div><div class="nxw-progress"><strong id="nxw-progress-label" role="status"></strong><progress id="nxw-progress" aria-label="' + escape(setupCopy.progressLabel.replace('{done}','').replace('{total}','')) + '"></progress></div><div class="nxw-setup-layout"><div class="nxw-step-list" aria-label="' + escape(setupCopy.pathHeading) + '">' + path().map(function (kind,i) { return '<button type="button" data-setup-step="' + i + '" aria-current="' + (i === selectedStep ? 'step' : 'false') + '"><b>' + (i + 1) + '</b><span>' + escape(stepTitle(i)) + (kind === 'voice' ? ' · ' + escape(setupCopy.optionalStep) : '') + '</span></button>'; }).join('') + '</div><article class="nxw-setup-detail" id="nxw-setup-detail"></article></div><p class="nxw-note">' + escape(setupCopy.saveScope) + '</p>';
    renderSetupStep(); updateProgress();
  }
  function fieldHTML(field, fields) {
    var name=field[0], label=setupCopy[field[1]] || copy[field[1]], required=field[2], repeat=field[3];
    var examples = {name:guide().exampleName,phone:'(312) 555-0148',address:'123 Main St · Chicago, IL',hours:'09:00–18:00',item1Name:copy[guide().exampleOffering].split(' · ')[0],qrLabel:guide().exampleName,qrLocation:copy[guide().exampleTouchpoint],paymentMethod:setupCopy.methodExample,inviteText:setupCopy.defaultInvite,replyText:setupCopy.replyText};
    return '<label class="nxw-field"><span>' + escape(label) + (repeat ? ' ' + repeat : '') + (required ? ' *' : '') + '</span><input name="' + name + '" value="' + escape(fields[name] || '') + '" placeholder="' + escape(examples[name] || '') + '" maxlength="' + (name === 'address' ? 120 : name === 'replyText' || name === 'inviteText' ? 180 : 90) + '"' + (required ? ' required' : '') + (name === 'phone' ? ' inputmode="tel"' : /Price|amount|Percent|Amount/.test(name) ? ' inputmode="decimal"' : '') + ' autocomplete="off"></label>';
  }
  function businessPhone(fields, name) {
    var value = String(fields[name] || ''), country = businessCountries.find(function (item) { return item[0] === fields[name + 'Country']; });
    if (!country && value.charAt(0) === '+') country = businessCountries.slice().sort(function (a, b) { return b[2].length - a[2].length; }).find(function (item) { return value.indexOf('+' + item[2]) === 0; });
    country = country || businessCountries[0];
    if (value.indexOf('+' + country[2]) === 0) value = value.slice(country[2].length + 1).trim();
    return {country:country, value:value};
  }
  function businessPhoneHTML(fields, name, label, required, options) {
    options=options||{};
    var phone = businessPhone(fields, name);
    var labelHTML='<label for="nxw-'+name+'">'+label+(required?' *':'')+'</label>';
    if(options.help)labelHTML='<div class="nxw-voice-label">'+labelHTML+'<span class="nxw-voice-help"><button type="button" aria-label="'+label+' info" aria-describedby="nxw-'+name+'-help"><i class="bi bi-info-circle" aria-hidden="true"></i></button><span role="tooltip" id="nxw-'+name+'-help">'+escape(options.help)+'</span></span></div>';
    return '<div class="nxw-field">'+labelHTML+'<div class="nxw-phone"><select name="' + name + 'Country" aria-label="' + label + ' · Country"'+(options.readOnly?' disabled':'')+'>' + businessCountries.map(function (country) { return '<option value="' + country[0] + '" title="' + country[1] + '"' + (country[0] === phone.country[0] ? ' selected' : '') + '>' + country[0] + ' +' + country[2] + '</option>'; }).join('') + '</select><input id="nxw-' + name + '" name="' + name + '" type="tel" inputmode="tel" autocomplete="tel-national" value="' + escape(phone.value) + '" placeholder="(555) 555-5555" maxlength="25"' + (required ? ' required' : '') +(options.readOnly?' readonly':'')+ '></div></div>';
  }
  function voiceValues(fields) {
    var business=readStep('business').fields,salon=businessPhone(business,'phone'),booking=businessPhone(business,'bookingPhone');
    // The answering number is the supplied screenshot's NEXORA demo number.
    return Object.assign({voiceSalonPhone:salon.value,voiceSalonPhoneCountry:salon.country[0],voiceAnsweringPhone:'(346) 680-2333',voiceAnsweringPhoneCountry:'US',voiceBookingPhone:booking.value,voiceBookingPhoneCountry:booking.country[0],voiceSmsCustomer:'true',voiceSmsBusiness:'true',voiceSmsStaff:'true'},fields);
  }
  function voiceSettingsHTML(fields) {
    var values=voiceValues(fields);
    return '<div class="nxw-voice-settings nxw-business-form" data-voice-settings><details class="nxw-voice-card" data-voice-card="salon" open><summary><div><h3><i class="bi bi-shop" aria-hidden="true"></i>Salon information</h3><p>Core data for AI Voice, SMS, landing page, and review requests.</p></div><span class="nxw-voice-chevron" aria-hidden="true"><i class="bi bi-chevron-up"></i></span></summary><div class="nxw-voice-phones">'+voicePhones.map(function(entry){return businessPhoneHTML(values,entry[0],entry[1],false,{help:entry[2],readOnly:entry[0]==='voiceAnsweringPhone'});}).join('')+'</div></details><details class="nxw-voice-card" data-voice-card="sms" open><summary><div><h3><i class="bi bi-chat-square" aria-hidden="true"></i>Booking SMS Notifications</h3><p>Choose who receives an SMS when a booking is created.</p></div><span class="nxw-voice-chevron" aria-hidden="true"><i class="bi bi-chevron-up"></i></span></summary><div class="nxw-voice-sms">'+voiceSms.map(function(entry){var enabled=values[entry[0]]!=='false';return '<div class="nxw-voice-sms-row"><div><strong>'+entry[1]+'</strong><p>'+entry[2]+'</p></div><div class="nxw-voice-sms-control"><span data-voice-sms-status class="'+(enabled?'is-on':'')+'" aria-live="polite">'+(enabled?'On':'Off')+'</span><button type="button" class="nxw-voice-switch'+(enabled?' is-on':'')+'" data-voice-sms="'+entry[0]+'" role="switch" aria-checked="'+enabled+'" aria-label="'+entry[1]+'"></button></div></div>';}).join('')+'</div></details></div>';
  }
  function voiceFormPatch(form) {
    var patch={};
    Array.from(form.elements).forEach(function(input){if(!input.name||input.type==='radio'&&!input.checked)return;patch[input.name]=input.type==='checkbox'?String(input.checked):input.value;});
    form.querySelectorAll('[data-voice-sms]').forEach(function(toggle){patch[toggle.dataset.voiceSms]=toggle.getAttribute('aria-checked');});
    return patch;
  }
  function voicePreview(fields) {
    var values=voiceValues(fields);
    var rows=voicePhones.map(function(entry){var phone=businessPhone(values,entry[0]);return [entry[1],phone.value?'+'+phone.country[2]+' '+phone.value:''];}).concat(voiceSms.map(function(entry){return [entry[1],values[entry[0]]==='false'?'Off':'On'];}));
    return '<dl>'+rows.filter(function(entry){return entry[1];}).map(function(entry){return '<div><dt>'+entry[0]+'</dt><dd>'+escape(entry[1])+'</dd></div>';}).join('')+'</dl>';
  }
  function businessHoursHTML(fields) {
    return '<fieldset class="nxw-business-group"><legend>Business Hours</legend>' + (fields.hours ? '<p class="nxw-note">' + escape(setupCopy.fieldHours) + ': ' + escape(fields.hours) + '</p>' : '') + '<label class="nxw-field nxw-time-zone"><span>Time zone *</span><select name="timeZone" required><option value="">Select a time zone</option>' + businessTimeZones.map(function (zone) { return '<option' + (fields.timeZone === zone ? ' selected' : '') + '>' + zone + '</option>'; }).join('') + '</select></label><div class="nxw-business-hours">' + businessDays.map(function (day, index) {
      var open = fields['hoursOpen' + index] !== 'false';
      return '<div class="nxw-business-day" data-business-day="' + index + '"><label class="nxw-day-toggle"><input type="checkbox" role="switch" name="hoursOpen' + index + '" aria-label="Toggle ' + day + ' open"' + (open ? ' checked' : '') + '><span aria-hidden="true"></span><b>' + day + '</b></label><div class="nxw-day-times"' + (!open ? ' hidden' : '') + '><input type="time" name="hoursFrom' + index + '" aria-label="' + day + ' open time" value="' + escape(fields['hoursFrom' + index] || '') + '" required' + (!open ? ' disabled' : '') + '><span aria-hidden="true">–</span><input type="time" name="hoursTo' + index + '" aria-label="' + day + ' close time" value="' + escape(fields['hoursTo' + index] || '') + '" required' + (!open ? ' disabled' : '') + '></div><span class="nxw-day-closed"' + (open ? ' hidden' : '') + '>Closed</span></div>';
    }).join('') + '</div></fieldset>';
  }
  function businessFieldsHTML(fields) {
    return '<div class="nxw-business-form"><div class="nxw-fields">' + fieldHTML(data.setup.fields.business[0], fields) + '</div><div class="nxw-fields">' + businessPhoneHTML(fields, 'phone', 'Business Phone', true) + businessPhoneHTML(fields, 'bookingPhone', 'Booking Notification Phone', false) + '</div><fieldset class="nxw-business-group"><legend>Business Address</legend>' + (fields.address ? '<p class="nxw-note">' + escape(setupCopy.fieldAddress) + ': ' + escape(fields.address) + '</p>' : '') + '<div class="nxw-address-fields">' + businessAddressFields.map(function (field) {
      return '<label class="nxw-field' + (field[0] === 'street' ? ' nxw-field-wide' : '') + '"><span>' + field[1] + ' *</span><input name="' + field[0] + '" value="' + escape(fields[field[0]] || '') + '" placeholder="' + field[2] + '" autocomplete="' + field[3] + '" maxlength="' + (field[0] === 'street' ? 180 : 90) + '" required></label>';
    }).join('') + '</div></fieldset>' + businessHoursHTML(fields) + '</div>';
  }
  function businessPatch(form) {
    var patch = {};
    Array.from(form.elements).forEach(function (input) {
      if (input.name && !input.disabled) patch[input.name] = input.type === 'checkbox' ? String(input.checked) : input.value;
    });
    return patch;
  }
  function businessPreview(fields) {
    var rows = [[setupCopy.fieldBusiness, fields.name]], address = businessAddressFields.map(function (field) { return fields[field[0]]; }).filter(Boolean).join(', ');
    rows.push(['Business Address', address || fields.address]);
    [['phone','Business Phone'],['bookingPhone','Booking Notification Phone']].forEach(function (entry) {
      var phone = businessPhone(fields, entry[0]);
      if (phone.value.trim()) rows.push([entry[1], '+' + phone.country[2] + ' ' + phone.value]);
    });
    rows.push(['Time zone', fields.timeZone]);
    var html = '<dl>' + rows.filter(function (row) { return String(row[1] || '').trim(); }).map(function (row) { return '<div><dt>' + escape(row[0]) + '</dt><dd>' + escape(row[1]) + '</dd></div>'; }).join('') + '</dl>';
    if (businessDays.some(function (_, index) { return fields['hoursOpen' + index] !== undefined; })) {
      html += '<div class="nxw-hours-preview"><strong>Business Hours</strong><dl>' + businessDays.map(function (day, index) {
        var value = fields['hoursOpen' + index] === 'false' ? 'Closed' : [fields['hoursFrom' + index], fields['hoursTo' + index]].filter(Boolean).join(' – ');
        return value ? '<div><dt>' + day + '</dt><dd>' + escape(value) + '</dd></div>' : '';
      }).join('') + '</dl></div>';
    } else if (fields.hours) html += '<p class="nxw-note">' + escape(setupCopy.fieldHours) + ': ' + escape(fields.hours) + '</p>';
    return html;
  }
  function choicesHTML(items, fields, radioName) {
    return '<div class="nxw-choices">' + items.map(function (item) { var checked = radioName ? (fields[radioName] || item.defaultValue) === item.key : fields[item.key] === undefined ? !!item.defaultOn : fields[item.key] === 'true'; return '<label class="nxw-choice"><input type="' + (radioName ? 'radio' : 'checkbox') + '" name="' + escape(radioName || item.key) + '" value="' + escape(item.key) + '"' + (checked ? ' checked' : '') + '><span>' + escape(setupCopy[item.label]) + '</span></label>'; }).join('') + '</div>';
  }
  function renderSetupStep() {
    destroyServiceWorkspace();
    destroyStaffWorkspace();
    destroyQrWorkspace();
    var kind=path()[selectedStep], fields=readStep(kind).fields;
    var tasks=(kind==='voice'?setupCopy.voiceTask:isSalon()?salonCopy['task'+(selectedStep+1)]:selectedStep===0?setupCopy.businessTask:setupCopy[guide().key+'Task'+selectedStep]) || '';
    var mode=fields.staffMode==='invite'?'invite':'manual';
    var html='<div class="nxw-setup-intro"><img src="' + data.setup.images[kind] + '" alt="' + escape(setupCopy.illustration) + '"><div><span class="nxw-kicker">' + (selectedStep+1) + ' / ' + path().length + '</span><h3 id="nxw-step-title">' + escape(stepTitle(selectedStep)) + '</h3><ul>' + tasks.split('|').filter(Boolean).map(function (task) { return '<li>' + escape(task) + '</li>'; }).join('') + '</ul></div></div>';
    var formHeading='<strong>' + escape(setupCopy.formTitle) + '</strong><p class="nxw-note">' + escape(setupCopy.autoSaveNote) + '</p>';
    if(kind==='services')html+='<div class="nxw-services-preparation">'+formHeading+'<div data-settings-panel="services" data-onboarding-services></div></div>';
    if(kind==='qr')html+='<div class="nxw-qr-preparation">'+formHeading+'<div data-onboarding-qr></div></div>';
    if(kind==='staff')html+='<div class="nxw-staff-preparation">'+formHeading+'<div class="nxw-subsection" data-staff-mode><strong>'+escape(setupCopy.staffMethodTitle)+'</strong>'+choicesHTML([{key:'manual',label:'staffManual',defaultValue:'manual'},{key:'invite',label:'staffInvite',defaultValue:'manual'}],fields,'staffMode')+'</div>'+(mode==='manual'?'<div data-onboarding-staff></div>':'')+'</div>';
    html+='<form id="nxw-setup-form" aria-labelledby="nxw-step-title">'+(kind==='services'||kind==='staff'||kind==='qr'?'':formHeading);
    if(kind!=='services'&&kind!=='staff'&&kind!=='qr')html+=kind==='business'?businessFieldsHTML(fields):'<div class="nxw-fields">' + (data.setup.fields[kind]||[]).map(function (field) { return fieldHTML(field,fields); }).join('') + '</div>';
    if(kind==='staff'&&mode==='invite')html+='<div class="nxw-inline-preview"><p>' + escape(setupCopy.staffInviteIntro) + '</p><ol>' + ['staffInvite1','staffInvite2','staffInvite3'].map(function (key) { return '<li>' + escape(setupCopy[key]) + '</li>'; }).join('') + '</ol><div class="nxw-actions">' + link(setupCopy.staffInviteOpen,'qr-stations.html?tab=staff-invite-qr',true) + '</div><div class="nxw-choices">' + choicesHTML([{key:'inviteConfirmed',label:'staffInviteConfirm'}],fields) + '</div><p class="nxw-note">' + escape(setupCopy.staffInviteNotice) + '</p></div>';
    if(kind==='voice')html+='<div class="nxw-subsection"><strong>' + escape(setupCopy.voiceModeTitle) + '</strong>' + choicesHTML([{key:'off',label:'voiceSkip',defaultValue:'off'},{key:'on',label:'voiceUse',defaultValue:'off'}],fields,'voiceMode') + '</div>' + (fields.voiceMode==='on'?voiceSettingsHTML(fields)+choicesHTML(data.flow.voiceFeatures,fields):'<p class="nxw-note">'+escape(setupCopy.voicePreviewOff)+'</p>') + '<p class="nxw-note">' + escape(setupCopy.voicePreviewNotice) + '</p>';
    html+='<div id="nxw-entered-preview" class="nxw-inline-preview"></div><div class="nxw-saved" id="nxw-save-status" role="status"></div><div class="nxw-actions"><button type="submit" class="nxw-btn">' + escape(setupCopy.saveStep) + '</button>' + (selectedStep<path().length-1?button(salonCopy.next,'next-step',true):button(copy.viewIndustryDocs,'open-docs',true)) + link(setupCopy.relatedScreen,stepRoute(kind),true) + '</div></form>';
    document.getElementById('nxw-setup-detail').innerHTML=html;
    var form=document.getElementById('nxw-setup-form');
    if(kind==='staff'&&mode==='invite')form.querySelectorAll('.nxw-fields input').forEach(function (input) { input.disabled=true; });
    form.addEventListener('input',function(event){if(event.target.type==='radio'||event.target.type==='checkbox')return;saveInput(event.target);});
    form.addEventListener('change',function(event){
      if(kind==='business'){
        var row=event.target.closest('[data-business-day]');
        if(row&&event.target.type==='checkbox'){
          row.querySelector('.nxw-day-times').hidden=!event.target.checked;
          row.querySelector('.nxw-day-closed').hidden=event.target.checked;
          row.querySelectorAll('input[type="time"]').forEach(function(input){input.disabled=!event.target.checked;});
        }
        saveInput(event.target);return;
      }
      if(kind==='voice'&&event.target.tagName==='SELECT'){saveInput(event.target);return;}
      if(event.target.type!=='radio'&&event.target.type!=='checkbox')return;saveInput(event.target);if(event.target.name==='staffMode'||event.target.name==='voiceMode')renderSetupStep();
    });
    form.addEventListener('submit',completeStep);
    form.addEventListener('click',function(event){
      var toggle=event.target.closest('[data-voice-sms]');if(!toggle)return;
      var enabled=toggle.getAttribute('aria-checked')!=='true';toggle.setAttribute('aria-checked',String(enabled));toggle.classList.toggle('is-on',enabled);
      var status=toggle.parentElement.querySelector('[data-voice-sms-status]');status.textContent=enabled?'On':'Off';status.classList.toggle('is-on',enabled);
      saveInput(toggle);
    });
    main.querySelectorAll('[data-setup-step]').forEach(function(el){el.setAttribute('aria-current',Number(el.dataset.setupStep)===selectedStep?'step':'false');});
    renderEnteredPreview();
    if(kind==='services')mountServiceWorkspace(fields);
    if(kind==='qr')mountQrWorkspace(fields);
    if(kind==='staff'){
      main.querySelector('[data-staff-mode]').addEventListener('change',function(event){saveInput(event.target);renderSetupStep();});
      if(mode==='manual')mountStaffWorkspace(fields);
    }
  }
  function saveInput(input){
    var patch={};if(path()[selectedStep]==='business')patch=businessPatch(input.form);else if(path()[selectedStep]==='voice')patch=voiceFormPatch(input.form);else patch[input.name]=input.type==='checkbox'?String(input.checked):input.value;
    var saved=writeStep(path()[selectedStep],patch);document.getElementById('nxw-save-status').textContent=saved?setupCopy.draftSaved:setupCopy.saveFailed;
    renderEnteredPreview();updateProgress();
  }
  function renderEnteredPreview(){
    var kind=path()[selectedStep],fields=readStep(kind).fields;
    document.getElementById('nxw-entered-preview').hidden=kind==='services'||kind==='staff'&&fields.staffMode!=='invite';
    if(kind==='services'||kind==='staff'&&fields.staffMode!=='invite')return;
    var html='<span class="nxw-kicker">' + escape(setupCopy.yourPreview) + '</span>';
    if(kind==='qr'){
      document.getElementById('nxw-entered-preview').innerHTML=html+(qrWorkspace?qrWorkspace.preview():'')+'<p class="nxw-note">'+escape(setupCopy.qrPreviewNotice)+'</p>';return;
    }
    if(kind==='voice')html+='<p>' + escape(fields.voiceMode==='on'?setupCopy.voicePreviewOn:setupCopy.voicePreviewOff) + '</p>'+(fields.voiceMode==='on'?voicePreview(fields):'');
    else if(kind==='business')html+=businessPreview(fields);
    else html+='<dl>' + (data.setup.fields[kind]||[]).filter(function(f){return String(fields[f[0]]||'').trim();}).map(function(f){return '<div><dt>' + escape(setupCopy[f[1]]||copy[f[1]]) + '</dt><dd>' + escape(fields[f[0]]) + '</dd></div>';}).join('') + '</dl>';
    if(kind==='staff'&&fields.staffMode==='invite')html+='<p>' + escape(setupCopy.staffInvitePreview) + '</p>';
    if(kind!=='qr')html+='<p class="nxw-note">' + escape(setupCopy.exampleNotice) + '</p>';
    document.getElementById('nxw-entered-preview').innerHTML=html;
  }
  function completeStep(event){
    event.preventDefault();var form=event.currentTarget,kind=path()[selectedStep];
    if(kind==='services'){
      try{serviceWorkspace.save();}catch(failure){document.getElementById('nxw-save-status').textContent=failure.message;return;}
    }
    if(kind==='qr'){
      try{qrWorkspace.validate();}catch(failure){document.getElementById('nxw-save-status').textContent=failure.message;return;}
    }
    if(kind==='staff'&&readStep(kind).fields.staffMode!=='invite'){
      try{staffWorkspace.validate();}catch(failure){document.getElementById('nxw-save-status').textContent=failure.message;return;}
    }
    if(kind==='business')writeStep(kind,businessPatch(form));
    if(kind==='voice')writeStep(kind,voiceFormPatch(form));
    var value=readStep(kind),valid=form.reportValidity()&&(kind!=='business'||businessComplete(value.fields))&&(kind!=='services'||servicesComplete(value.fields));
    var special='';
    if(kind==='staff'&&value.fields.staffMode==='invite'&&value.fields.inviteConfirmed!=='true')special=setupCopy.staffInviteNeeded;
    if(kind==='voice'&&value.fields.voiceMode==='on'&&!data.flow.voiceFeatures.some(function(item){return value.fields[item.key]==='true';}))special=setupCopy.chooseAtLeastOne;
    if(!valid||special){document.getElementById('nxw-save-status').textContent=special||setupCopy.requiredMessage;return;}
    if(!state.drafts[guide().key])state.drafts[guide().key]={};state.drafts[guide().key][kind]={fields:value.fields,completed:true};
    var stored=persist();if(!stored)state.drafts[guide().key][kind]=value;
    document.getElementById('nxw-save-status').textContent=stored?setupCopy.savedDone:setupCopy.saveFailed;updateProgress();
  }
  function guideAssistant(){return copy.docAgentTemplate.replace('{business}',guide().exampleName).replace('{step}',stepTitle(0)).replace('{tool}',data.products.find(function(p){return p.key===guide().tools[0];}).name);}
  function renderDocs(){
    var values=[[copy.docFieldBusiness,guide().exampleName],[copy.docFieldOffering,copy[guide().exampleOffering]],[copy.docFieldTouchpoint,copy[guide().exampleTouchpoint]]];
    document.getElementById('nxw-panel-docs').innerHTML='<span class="nxw-kicker">' + escape(copy.docsEyebrow) + '</span><h2>' + escape(copy.docsTitle) + '</h2><p>' + escape(copy.docsIntro) + '</p><div class="nxw-docs"><article class="nxw-doc">' + iconFrame('setup-checklist') + '<h3>' + escape(copy.docChecklistTitle) + '</h3><ol>' + path().map(function(kind,i){return '<li>'+escape(stepTitle(i))+'</li>';}).join('') + '</ol>' + button(copy.docDownload,'download-checklist',true) + '</article><article class="nxw-doc">' + iconFrame('configuration') + '<h3>' + escape(copy.docExampleTitle) + '</h3><dl>' + values.map(function(pair){return '<dt>'+escape(pair[0])+'</dt><dd>'+escape(pair[1])+'</dd>';}).join('') + '</dl>' + button(copy.docDownload,'download-example',true) + '</article><article class="nxw-doc">' + iconFrame('aihub') + '<h3>' + escape(copy.docAgentTitle) + '</h3><p>' + escape(guideAssistant()) + '</p><p class="nxw-note">' + escape(copy.agentNote) + '</p>' + button(copy.docDownload,'download-assistant',true) + '</article></div><p class="nxw-note">' + escape(copy.docSampleNote) + '</p>';
  }
  function receptionText(key){
    return String(data.reception.copy[key]||'').replace(/\{business\}/g,guide().exampleName).replace(/\{offering\}/g,copy[guide().exampleOffering].split(' · ')[0]).replace(/\{touchpoint\}/g,copy[guide().exampleTouchpoint]);
  }
  function renderReception(){
    var c=data.reception.copy;
    var questionHTML=data.reception.questions.map(function(q){var question=q.question,answer=q.answer;if(question==='booking')question=isSalon()?'bookSalonQ':guide().key==='restaurant'?'bookRestaurantQ':'bookOrderQ';if(question==='policy'){question=isSalon()?'policySalonQ':guide().key==='retail'?'policyRetailQ':'policyFoodQ';answer=(guide().key==='food'||guide().key==='restaurant')?'allergyA':'policyA';}var doc=data.reception.documents.find(function(doc){return doc.id===q.source;});return '<details class="nxw-details"><summary>'+escape(receptionText(question))+'</summary><p>'+escape(receptionText(answer))+'</p><small>'+escape(c.source)+'</small><p>'+escape(receptionText(doc.title))+'</p></details>';}).join('');
    document.getElementById('nxw-panel-reception').innerHTML='<span class="nxw-kicker">'+escape(c.eyebrow)+'</span><h2>'+escape(c.title)+'</h2><p>'+escape(c.intro)+'</p><div class="nxw-reception-columns"><section><h3>'+escape(c.questionsTitle)+'</h3><p>'+escape(c.questionsIntro)+'</p>'+questionHTML+'</section><section><h3>'+escape(c.docsTitle)+'</h3><p>'+escape(c.docsIntro)+'</p>'+data.reception.documents.map(function(doc){return '<details class="nxw-details"><summary>'+escape(receptionText(doc.title))+'</summary><p>'+escape(receptionText(doc.example))+'</p><small>'+escape(c.needs)+'</small><p>'+escape(receptionText(doc.needs))+'</p></details>';}).join('')+'</section></div><p class="nxw-note">'+escape(c.note)+'</p><div class="nxw-actions">'+button(c.download,'download-reception',true)+link(c.setup,'salon-guide-ai-voice.html')+'</div>';
  }
  function helpEntries(){return data.help.workflows.map(function(w){return {id:w.id,product:w.product,title:w.title,steps:w.steps,sample:w.sample,route:{voice:'salon-guide-ai-voice.html',sms:'nexora-sms-dashboard.html',promotion:'reward-promotions.html',deal:'pos-deal-coupon.html'}[w.id]||moduleRoute(w.product)};}).concat(data.products.map(function(p){return {id:'product-'+p.key,product:p.key,title:p.name,steps:data.presentation[p.key].steps,sample:data.presentation[p.key].summary,route:moduleRoute(p.key)};}));}
  function renderHelp(){
    var c=data.help.ui;
    document.getElementById('nxw-panel-help').innerHTML='<span class="nxw-kicker">'+escape(c.eyebrow)+'</span><h2>'+escape(c.title)+'</h2><p>'+escape(c.intro)+'</p><div class="nxw-toolbar"><input id="nxw-help-search" type="search" placeholder="'+escape(c.search)+'" aria-label="'+escape(c.search)+'" value="'+escape(helpSearch)+'"><select id="nxw-help-filter" aria-label="'+escape(c.allProducts)+'"><option value="">'+escape(c.allProducts)+'</option>'+data.products.map(function(p){return '<option value="'+p.key+'"'+(helpProduct===p.key?' selected':'')+'>'+escape(p.name)+'</option>';}).join('')+'</select></div><div class="nxw-help-layout"><div class="nxw-help-list" id="nxw-help-list" role="group" aria-label="'+escape(c.directory)+'"></div><article class="nxw-help-detail" id="nxw-help-detail" aria-live="polite"></article></div><div class="nxw-subsection"><h3>'+escape(c.faq)+'</h3><p>'+escape(c.faqIntro)+'</p>'+data.help.faq.map(function(f){return '<details class="nxw-details"><summary>'+escape(f.q||f.question)+'</summary><p>'+escape(f.a||f.answer)+'</p></details>';}).join('')+'</div>';
    document.getElementById('nxw-help-search').addEventListener('input',function(event){helpSearch=event.target.value;renderHelpResults();});
    document.getElementById('nxw-help-filter').addEventListener('change',function(event){helpProduct=event.target.value;renderHelpResults();});
    renderHelpResults();
  }
  function renderHelpResults(){
    var c=data.help.ui,entries=helpEntries().filter(function(entry){return (!helpProduct||entry.product===helpProduct)&&(!helpSearch||(entry.title+' '+entry.sample+' '+entry.steps.join(' ')).toLowerCase().indexOf(helpSearch.trim().toLowerCase())!==-1);});
    if(!entries.some(function(entry){return entry.id===selectedHelp;}))selectedHelp=entries[0]?entries[0].id:'';
    document.getElementById('nxw-help-list').innerHTML=entries.length?entries.map(function(entry){return '<button type="button" data-help-entry="'+entry.id+'" aria-pressed="'+(entry.id===selectedHelp)+'">'+escape(entry.title)+'<small>'+escape(data.products.find(function(p){return p.key===entry.product;}).name)+'</small></button>';}).join(''):'<p class="nxw-empty" role="status">'+escape(c.noResults)+'</p>';
    var entry=entries.find(function(item){return item.id===selectedHelp;});
    document.getElementById('nxw-help-detail').innerHTML=entry?'<span class="nxw-kicker">'+escape(c.steps)+'</span><h3>'+escape(entry.title)+'</h3><ol>'+entry.steps.map(function(step){return '<li>'+escape(step)+'</li>';}).join('')+'</ol><span class="nxw-kicker">'+escape(c.sample)+'</span><blockquote>'+escape(entry.sample)+'</blockquote><p class="nxw-note">'+escape(c.sampleNote)+'</p><div class="nxw-actions">'+link(setupCopy.relatedScreen,entry.route)+'</div>':'<p>'+escape(c.noResults)+'</p>';
  }
  function productSteps(key){var routes={pos:['pos-salon-settings.html?section=services','pos-front-desk.html?section=checkin','pos-technician-report.html?tab=store'],oneqr:['qr-stations.html?tab=one-qr','qr-stations.html?tab=qr-stations','qr-stations.html?tab=accept-payment'],payments:['payment-income.html','tip-list.html','staff-payouts.html'],aihub:['booking-book-phase-1.html?tab=booking&view=today','booking-book-phase-1.html?tab=customers','booking-book-phase-1.html?tab=calllog'],aimarketing:['booking-book-phase-1.html?tab=customers','nexora-sms-dashboard.html','vlinkpay-campaigns.html'],analytics:['nexora-analytics.html','nexora-analytics.html'],reviews:['nexora-review.html','nexora-review.html'],community:['community.html?tab=feed','community.html?tab=groups','community.html?tab=connect']};return routes[key]||[];}
  function renderProductGuides(){
    var product=data.products.find(function(p){return p.key===selectedProduct;})||data.products[0],presentation=data.presentation[product.key];
    document.getElementById('nxw-panel-products').innerHTML='<span class="nxw-kicker">'+escape(copy.productEyebrow)+'</span><h2>'+escape(copy.productHeading)+'</h2><p>'+escape(copy.productIntro)+'</p><div class="nxw-product-tabs" aria-label="'+escape(copy.tabProducts)+'">'+data.products.map(function(p){return '<button type="button" data-guide-product="'+p.key+'" aria-pressed="'+(p.key===product.key)+'">'+icon(productIcon(p.key),24)+escape(p.name)+'</button>';}).join('')+'</div><article class="nxw-inline-preview"><h3>'+escape(product.name)+'</h3><p>'+escape(presentation.summary)+'</p><div class="nxw-docs">'+product.steps.map(function(step,i){return '<a class="nxw-doc" href="'+escape(productSteps(product.key)[i]||moduleRoute(product.key))+'"><span class="nxw-kicker">STEP '+(i+1)+'</span><h3>'+escape(step.title)+'</h3><p>'+escape(presentation.steps[i])+'</p><span class="nxw-card-link">'+escape(setupCopy.relatedScreen)+'</span></a>';}).join('')+'</div></article>';
  }
  function download(kind){
    var c=copy,text='',title='';
    if(kind==='checklist'){title=c.docChecklistTitle;text=path().map(function(key,i){return (i+1)+'. '+stepTitle(i);}).join('\n');}
    if(kind==='example'){title=c.docExampleTitle;text=c.docFieldBusiness+': '+guide().exampleName+'\n'+c.docFieldOffering+': '+c[guide().exampleOffering]+'\n'+c.docFieldTouchpoint+': '+c[guide().exampleTouchpoint];}
    if(kind==='assistant'){title=c.docAgentTitle;text=guideAssistant();}
    if(kind==='reception'){title=data.reception.copy.title;text=data.reception.documents.map(function(doc){return receptionText(doc.title)+'\n'+receptionText(doc.example)+'\n'+receptionText(doc.needs);}).join('\n\n');}
    var blob=new Blob([title+'\n'+c[guide().name]+'\n\n'+text+'\n\n'+c.docSampleNote],{type:'text/plain;charset=utf-8'});var url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download='nexora-'+guide().key+'-'+kind+'.txt';document.body.append(anchor);anchor.click();anchor.remove();window.setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  main.addEventListener('click',function(event){
    var preview=event.target.closest('[data-preview-product]');if(preview){var key=preview.dataset.previewProduct;explorerProduct=key==='aihub-marketing'||key==='aihub-marketing-campaign'||key==='spin-wheel'?'aimarketing':key;explorerFeature=0;renderExplorer();}
    var target=event.target.closest('button');if(!target)return;
    if(target.dataset.slide!==undefined){playing=false;renderSlide(Number(target.dataset.slide));syncSlideshow();}
    if(target.dataset.explorerProduct){explorerProduct=target.dataset.explorerProduct;explorerFeature=0;renderExplorer();main.querySelector('[data-explorer-product="'+explorerProduct+'"]').focus();}
    if(target.dataset.explorerFeature!==undefined){explorerFeature=Number(target.dataset.explorerFeature);renderExplorer();main.querySelector('[data-explorer-feature="'+explorerFeature+'"]').focus();}
    if(target.dataset.industry){state.industry=target.dataset.industry;persist();selectedStep=firstUnfinished();renderOnboarding();main.querySelector('[data-industry="'+state.industry+'"]').focus();}
    if(target.dataset.onboardTab)openTab(target.dataset.onboardTab);
    if(target.dataset.setupStep!==undefined){selectedStep=Number(target.dataset.setupStep);renderSetupStep();}
    if(target.dataset.helpEntry){selectedHelp=target.dataset.helpEntry;renderHelpResults();main.querySelector('[data-help-entry="'+selectedHelp+'"]').focus();}
    if(target.dataset.guideProduct){selectedProduct=target.dataset.guideProduct;renderProductGuides();main.querySelector('[data-guide-product="'+selectedProduct+'"]').focus();}
    var action=target.dataset.action;if(!action)return;
    if(action==='slide-prev'||action==='slide-next'){playing=false;renderSlide(slideIndex+(action==='slide-prev'?-1:1));syncSlideshow();}
    if(action==='slide-play'){playing=!playing;syncSlideshow();}
    if(action==='open-docs')openTab('docs');
    if(action==='start-first'){selectedStep=firstUnfinished();renderSetupStep();document.getElementById('nxw-step-title').tabIndex=-1;document.getElementById('nxw-step-title').focus();}
    if(action==='next-step'){selectedStep=Math.min(path().length-1,selectedStep+1);renderSetupStep();}
    if(action.indexOf('download-')===0)download(action.slice(9));
  });
  if(view==='onboarding'){
    var params=new URLSearchParams(window.location.search);if(data.library.guides.some(function(g){return g.key===params.get('industry');}))state.industry=params.get('industry');
    if(['journey','docs','reception','help','products'].indexOf(params.get('view'))!==-1)activeOnboardTab=params.get('view');
    selectedStep=firstUnfinished();renderOnboarding();
  }else renderHome();
  window.NEXORA_WELCOME={moduleRoute:moduleRoute,featureRoute:featureRoute,storageKey:storageKey};
})();
