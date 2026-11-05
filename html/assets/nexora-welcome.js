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
  // Restore structured address drafts in the PO's single Address field.
  var businessAddressFields = ['street','city','region','zip','country'];
  var businessCountries = [['US','United States','1'],['CA','Canada','1'],['VN','Vietnam','84'],['GB','United Kingdom','44'],['AU','Australia','61'],['SG','Singapore','65'],['JP','Japan','81'],['KR','South Korea','82'],['DE','Germany','49'],['FR','France','33'],['IN','India','91'],['CN','China','86'],['BR','Brazil','55'],['MX','Mexico','52'],['HK','Hong Kong','852'],['TW','Taiwan','886'],['MY','Malaysia','60'],['TH','Thailand','66'],['PH','Philippines','63'],['ID','Indonesia','62']];
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
  var assistantIntent = 'overview';
  var assistantSpeaking = false;
  var assistantSpeechToken = 0;
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
  function useSalonLabels() { return ['nail','hair'].indexOf(guide().key) !== -1; }
  function stepTitle(index) { return path()[index] === 'voice' ? setupCopy.voiceStep : isSalon() ? salonCopy['step' + (index + 1)] : index === 0 ? setupCopy.businessStep : copy[guide().steps[index][0]]; }
  function readStep(kind) {
    var value = state.drafts[guide().key] && state.drafts[guide().key][kind];
    var fields = value && value.fields && typeof value.fields === 'object' ? value.fields : {};
    return {fields:fields, completed:!!(value && value.completed) && (kind !== 'business' || businessComplete(fields)) && (!['services','menu'].includes(kind) || servicesComplete(fields,kind)) && (kind !== 'staff' || (fields.staffMode==='invite' ? window.NEXORA_QR_WORKFLOWS.completeStaffInvite(fields) : staffComplete(fields))) && (kind !== 'qr' || window.NEXORA_QR_SETUP.complete(fields))};
  }
  function destroyQrWorkspace(){if(qrWorkspace){qrWorkspace.destroy();qrWorkspace=null;}}
  function mountQrWorkspace(fields){
    var industry=guide().key;
    qrWorkspace=window.NEXORA_QR_SETUP.mount(main.querySelector('[data-onboarding-qr]'),{
      fields:fields,business:readStep('business').fields,
      allowIndustry:industry==='restaurant',industry:industry,
      chooseAtLeastOne:setupCopy.chooseAtLeastOne,requiredMessage:setupCopy.requiredMessage,saveFailed:setupCopy.saveFailed,
      onChange:function(snapshot){return savePreparationDraft(industry,'qr',snapshot);},
      onBusy:function(busy){var submit=main.querySelector('#nxw-setup-form [type="submit"]');if(submit)submit.disabled=busy;}
    });
  }
  function staffComplete(fields) {return window.NEXORA_STAFF_SETUP&&window.NEXORA_STAFF_SETUP.complete(fields);}
  function savePreparationDraft(industry,kind,patch) {
    if(!state.drafts[industry])state.drafts[industry]={};
    var value=state.drafts[industry][kind]||{fields:{},completed:false};
    var next=Object.assign({},value.fields,JSON.parse(JSON.stringify(patch)));
    state.drafts[industry][kind]={fields:next,completed:!!value.completed&&JSON.stringify(next)===JSON.stringify(value.fields)};
    var saved=persist();
    if(industry===guide().key&&path()[selectedStep]===kind){
      document.getElementById('nxw-save-status').textContent=saved?setupCopy.draftSaved:setupCopy.saveFailed;updateProgress();renderEnteredPreview();
    }
    return saved;
  }
  function destroyStaffWorkspace() {if(staffWorkspace){staffWorkspace.destroy();staffWorkspace=null;}}
  function mountStaffWorkspace(fields) {
    var industry=guide().key;
    if(fields.staffMode==='invite'){
      staffWorkspace=window.NEXORA_QR_WORKFLOWS.mountStaffInvite(main.querySelector('[data-onboarding-staff-invite]'),{
        requiredMessage:setupCopy.requiredMessage,saveFailed:setupCopy.saveFailed,
        onChange:function(snapshot){return savePreparationDraft(industry,'staff',snapshot);}
      });return;
    }
    staffWorkspace=window.NEXORA_STAFF_SETUP.mount(main.querySelector('[data-onboarding-staff]'),{
      fields:fields,business:readStep('business').fields,categories:readStep('services').fields.serviceCatalog,
      requiredMessage:setupCopy.requiredMessage,saveFailed:setupCopy.saveFailed,legacyServicesLabel:setupCopy.fieldStaffServices,
      onChange:function(snapshot){return savePreparationDraft(industry,'staff',snapshot);}
    });
  }
  function servicesComplete(fields,kind) {
    var menu=kind==='menu',categories=menu?fields.menuCatalog:fields.serviceCatalog;
    if(!Array.isArray(categories)||!categories.length)return false;
    var services=categories.reduce(function(all,category){return all.concat(category.services||[]);},[]).filter(function(service){return service.id!=='__custom__';});
    return services.length>0&&categories.every(function(category){return String(category.name||'').trim();})&&services.every(function(service){return String(service.name||'').trim()&&service.price!==''&&service.price!=null&&Number.isFinite(Number(service.price))&&Number(service.price)>=0&&(menu||Number.isInteger(Number(service.durationMin))&&Number(service.durationMin)>0);});
  }
  function destroyServiceWorkspace() {if(serviceWorkspace){serviceWorkspace.destroy();serviceWorkspace=null;}}
  function mountServiceWorkspace(fields,kind) {
    kind=kind||'services';
    var menu=kind==='menu';
    var industry=guide().key, panel=main.querySelector('[data-onboarding-services]');
    var savedCatalog=menu?fields.menuCatalog:fields.serviceCatalog;
    var categories=Array.isArray(savedCatalog)?savedCatalog:undefined;
    if(menu&&!categories){
      categories=(industry==='restaurant'?['Dishes','Drinks','Extras']:['Food','Drinks']).map(function(name){return {id:'menu-'+name.toLowerCase(),name:name,services:[]};});
      categories[0].services=[1,2].filter(function(index){return fields['item'+index+'Name'];}).map(function(index){return {id:'onboarding-menu-item-'+index,name:fields['item'+index+'Name'],price:fields['item'+index+'Price']??'',description:fields['item'+index+'Detail']||'',active:true};});
    }
    if(!menu&&!categories&&[1,2].some(function(index){return fields['item'+index+'Name'];})){
      categories=[{id:'onboarding-services',name:'Services',services:[1,2].filter(function(index){return fields['item'+index+'Name'];}).map(function(index){return {id:'onboarding-service-'+index,name:fields['item'+index+'Name'],price:fields['item'+index+'Price']||'',durationMin:parseFloat(fields['item'+index+'Duration'])||'',description:fields['item'+index+'Detail']||'',active:true};})}];
    }
    var approvals=Array.isArray(fields.serviceApprovals)?fields.serviceApprovals.slice():[];
    function saveDraft(snapshot) {
      return savePreparationDraft(industry,kind,menu?{menuCatalog:snapshot.categories}:{serviceCatalog:snapshot.categories,serviceApprovals:snapshot.approvals});
    }
    serviceWorkspace=window.NEXORA_SALON_SERVICES.mount(panel,{
      onboarding:true, catalogType:menu?'menu':'services',salon:{id:'onboarding-'+industry}, categories:categories||[],
      api:{
        load:function(){return approvals.slice();},
        requiresApproval:function(_,id){return approvals.indexOf(id)!==-1;},
        loadCatalog:function(_,fallback){return JSON.parse(JSON.stringify(categories||fallback));},
        saveCatalog:function(_,next,ids){var nextApprovals=ids||approvals;if(!saveDraft({categories:next,approvals:nextApprovals}))throw new Error(setupCopy.saveFailed);categories=next;approvals=nextApprovals.slice();}
      },
      onChange:function(snapshot){categories=snapshot.categories;saveDraft(snapshot);}
    });
  }
  function businessValues(fields) {
    var address = fields.address == null ? businessAddressFields.map(function(name){return fields[name];}).filter(Boolean).join(', ') : fields.address;
    return Object.assign({}, fields, {address:address || ''});
  }
  function businessComplete(fields) {
    var values = businessValues(fields);
    return ['name','address','phone'].every(function(name){return String(values[name] || '').trim();});
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
    stopSetupSpeech();
    destroyServiceWorkspace();
    destroyStaffWorkspace();
    destroyQrWorkspace();
    main.innerHTML = '<div class="nxw-head"><div><span class="nxw-kicker">' + escape(copy.libraryEyebrow) + '</span><h1>' + escape(copy.pageTitle) + '</h1><p>' + escape(copy.pageIntro) + '</p></div>' + link('← Dashboard', 'dashboard.html', true) + '</div><section class="nxw-industry-picker"><div class="nxw-section-head"><div><h3>' + escape(copy.libraryHeading) + '</h3><p>' + escape(copy.libraryIntro) + '</p></div><span class="nxw-badge">' + escape(copy.counts) + '</span></div><div class="nxw-industries" role="group" aria-label="' + escape(copy.chooseIndustry) + '">' + data.library.guides.map(function (g) { return '<button class="nxw-industry" type="button" data-industry="' + g.key + '" aria-pressed="' + (g.key === state.industry) + '">' + window.NEXORA_INDUSTRY_ICONS.image(g.key==='food'?'cafe':g.key,{size:32}) + '<span>' + escape(copy[g.name]) + '</span></button>'; }).join('') + '</div></section><div class="nxw-tabs" role="tablist" aria-label="' + escape(copy.pageTitle) + '">' + [['journey','tabJourney'],['docs','tabDocs'],['reception','tabReception'],['help','tabHelp'],['products','tabProducts']].map(function (entry, i) { return '<button type="button" role="tab" id="nxw-tab-' + entry[0] + '" data-onboard-tab="' + entry[0] + '" aria-controls="nxw-panel-' + entry[0] + '" aria-selected="' + (activeOnboardTab === entry[0]) + '" tabindex="' + (activeOnboardTab === entry[0] ? 0 : -1) + '"><b>' + (i + 1) + '</b>' + escape(copy[entry[1]]) + '</button>'; }).join('') + '</div>' + ['journey','docs','reception','help','products'].map(function (tab) { return '<section class="nxw-panel" id="nxw-panel-' + tab + '" role="tabpanel" aria-labelledby="nxw-tab-' + tab + '"' + (tab !== activeOnboardTab ? ' hidden' : '') + '></section>'; }).join('');
    renderJourney(); renderDocs(); renderReception(); renderHelp(); renderProductGuides();
    main.querySelector('[role=tablist]').addEventListener('keydown', function (event) {
      var tabs = Array.from(main.querySelectorAll('[data-onboard-tab]'));
      var i = tabs.indexOf(document.activeElement);
      var next = event.key === 'ArrowRight' ? i + 1 : event.key === 'ArrowLeft' ? i - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next === null) return; event.preventDefault(); var tab = tabs[(next + tabs.length) % tabs.length]; openTab(tab.dataset.onboardTab); tab.focus();
    });
  }
  function openTab(tab) {
    if(tab !== 'journey')stopSetupSpeech();
    activeOnboardTab = tab;
    main.querySelectorAll('[data-onboard-tab]').forEach(function (el) { var active = el.dataset.onboardTab === tab; el.setAttribute('aria-selected', String(active)); el.tabIndex = active ? 0 : -1; });
    main.querySelectorAll('[role=tabpanel]').forEach(function (el) { el.hidden = el.id !== 'nxw-panel-' + tab; });
    var url = new URL(window.location.href); url.searchParams.set('view', tab); window.history.replaceState(null, '', url);
  }
  function renderJourney() {
    var g=guide(), feature=data.onboardingFeature, story=feature.stories[g.key];
    var steps=path().map(function(kind,i){
      return '<button type="button" data-setup-step="'+i+'" aria-current="'+(i===selectedStep?'step':'false')+'"><img src="'+escape(data.setup.images[kind])+'" alt="" loading="lazy"><b>'+(i+1)+'</b><span>'+escape(stepTitle(i))+'</span></button>';
    }).join('');
    document.getElementById('nxw-panel-journey').innerHTML=
      '<div class="nxw-journey-head"><div class="nxw-journey-lead"><span class="nxw-kicker">'+escape(copy.libraryEyebrow)+'</span><h2>'+escape(useSalonLabels()?salonCopy.heading:setupCopy.pathHeading)+'</h2><p>'+escape(useSalonLabels()?salonCopy.intro:setupCopy.pathIntro)+'</p><div class="nxw-actions">'+button(copy.startFirstStep,'start-first')+button(g.key==='nail'?data.businessGuide.copy.viewGuide:copy.viewIndustryDocs,'open-docs',true)+'</div></div>'+
      '<aside class="nxw-spotlight" aria-labelledby="nxw-spotlight-title"><div class="nxw-spotlight-photo"><img src="'+escape(g.sampleImage)+'" alt="" loading="lazy" decoding="async"><span>'+escape(copy[g.name])+'</span></div><div class="nxw-spotlight-copy"><small>'+escape(feature.label)+'</small><h3 id="nxw-spotlight-title">'+escape(story.title)+'</h3><p>'+escape(story.summary)+'</p>'+button(feature.action,'open-docs',true)+'</div></aside></div>'+
      '<div class="nxw-journey-columns"><section class="nxw-setup-workspace"><div class="nxw-progress"><strong id="nxw-progress-label" role="status"></strong><progress id="nxw-progress" aria-label="'+escape(setupCopy.progressLabel.replace('{done}','').replace('{total}',''))+'"></progress></div><div class="nxw-step-list" role="group" aria-label="'+escape(setupCopy.pathHeading)+'">'+steps+'</div><article class="nxw-setup-detail" id="nxw-setup-detail"></article></section>'+
      '<aside class="nxw-guide-panel"><div id="nxw-preview-slot" aria-live="polite"></div><div id="nxw-setup-assistant"></div></aside></div>';
    renderSetupStep(); updateProgress(); renderSetupAssistant();
  }
  function stopSetupSpeech() {
    assistantSpeechToken++;
    if(assistantSpeaking && window.speechSynthesis)window.speechSynthesis.cancel();
    assistantSpeaking=false;
    var control=document.getElementById('nxw-assistant-speak');
    if(control)control.textContent=copy.speakButton;
  }
  function renderSetupAssistant() {
    stopSetupSpeech();
    var panel=document.getElementById('nxw-setup-assistant');
    if(!panel)return;
    var titles={overview:copy.agentOverviewTitle,setup:copy.agentSetupTitle,tools:copy.agentToolsTitle,help:copy.agentHelpTitle};
    var tools=guide().tools.map(function(key){var product=data.products.find(function(item){return item.key===key;});return product?product.name:key;}).join(' · ');
    var response=assistantIntent==='setup'?setupCopy.pathIntro+' '+path().map(function(kind,index){return (index+1)+'. '+stepTitle(index);}).join('; ')+'.':assistantIntent==='tools'?copy.toolsHint+': '+tools+'.':assistantIntent==='help'?copy.helpHint:copy[guide().summary];
    panel.innerHTML='<div class="nxw-assistant-label"><span aria-hidden="true">✦</span>'+escape(copy.agentLabel)+'</div><h3 id="nxw-assistant-title">'+escape(titles[assistantIntent])+'</h3><p id="nxw-assistant-response" aria-live="polite">'+escape(response)+'</p><div class="nxw-assistant-prompts" role="group" aria-label="'+escape(copy.promptGroup)+'">'+[['overview','overviewPrompt'],['setup','setupPrompt'],['tools','toolsPrompt']].map(function(item){return '<button type="button" data-assistant-intent="'+item[0]+'" aria-pressed="'+(assistantIntent===item[0])+'">'+escape(copy[item[1]])+'</button>';}).join('')+'</div><form id="nxw-assistant-form"><input aria-label="'+escape(copy.askAria)+'" placeholder="'+escape(copy.askPlaceholder)+'" maxlength="160" autocomplete="off"><button type="submit">'+escape(copy.askButton)+'</button></form><div class="nxw-assistant-footer"><small>'+escape(copy.agentNote)+'</small><button type="button" id="nxw-assistant-speak"'+(!window.speechSynthesis||!window.SpeechSynthesisUtterance?' disabled':'')+'>'+escape(copy.speakButton)+'</button></div>';
    panel.querySelector('form').addEventListener('submit',function(event){
      event.preventDefault();var input=event.currentTarget.querySelector('input'),query=input.value.trim().toLowerCase();
      if(!query){input.focus();return;}
      assistantIntent=/setup|set up|start|book|config/.test(query)?'setup':/tool|product|feature/.test(query)?'tools':'help';
      renderSetupAssistant();document.querySelector('#nxw-assistant-form input').focus();
    });
    panel.querySelector('#nxw-assistant-speak').addEventListener('click',function(){
      if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
      if(assistantSpeaking){stopSetupSpeech();return;}
      var utterance=new window.SpeechSynthesisUtterance(titles[assistantIntent]+'. '+response),token=++assistantSpeechToken;
      utterance.lang='en-US';utterance.rate=.92;
      utterance.onend=utterance.onerror=function(){if(token===assistantSpeechToken){assistantSpeaking=false;document.getElementById('nxw-assistant-speak').textContent=copy.speakButton;}};
      assistantSpeaking=true;this.textContent=copy.stopButton;window.speechSynthesis.speak(utterance);
    });
  }
  function fieldHTML(field, fields) {
    var name=field[0], label=setupCopy[field[1]] || copy[field[1]], required=field[2], repeat=field[3];
    var first=copy[guide().exampleOffering].split(' · '), second=setupCopy[guide().key+'Second'].split(' · ');
    var examples = {name:guide().exampleName,phone:'(312) 555-0148',address:'123 Main St · Chicago, IL',hours:'09:00–18:00',item1Name:first[0],item1Duration:first[1],item1Price:first[first.length-1],item2Name:second[0],item2Duration:second[1],item2Price:second[second.length-1],qrLabel:readStep('business').fields.name||guide().exampleName,qrLocation:copy[guide().exampleTouchpoint],paymentMethod:setupCopy.methodExample,amount:first[first.length-1],tipAmount:'$3.00',offerTitle:setupCopy.retailDealSample,discountCode:'SAVE10',discountPercent:'10',inviteText:setupCopy.defaultInvite,replyText:setupCopy.replyText};
    return '<label class="nxw-field"><span>' + escape(label) + (repeat ? ' ' + repeat : '') + (required ? ' *' : '') + '</span><input name="' + name + '" type="' + (name==='phone'?'tel':name==='discountPercent'?'number':'text') + '"' + (name==='discountPercent'?' min="1" max="100"':'') + ' value="' + escape(fields[name] || '') + '" placeholder="' + escape(examples[name] || '') + '" maxlength="' + (name === 'address' ? 120 : name === 'replyText' || name === 'inviteText' ? 180 : 90) + '"' + (required ? ' required' : '') + (name === 'phone' ? ' inputmode="tel"' : /Price|amount|tipAmount/.test(name) ? ' inputmode="decimal"' : '') + ' autocomplete="off"></label>';
  }
  function catalogItemIndexes(fields) {
    var indexes=[1,2];
    Object.keys(fields).forEach(function(key){
      var match=/^item([1-9]\d*)(?:Name|Price)$/.exec(key);
      if(match&&indexes.indexOf(Number(match[1]))===-1)indexes.push(Number(match[1]));
    });
    return indexes.sort(function(a,b){return a-b;});
  }
  function catalogItemHTML(index,fields) {
    return fieldHTML(['item'+index+'Name','fieldItem',index===1,index],fields)+fieldHTML(['item'+index+'Price','fieldPrice',index===1,index],fields);
  }
  function catalogFieldsHTML(fields) {
    return '<div class="nxw-fields" data-catalog-items>'+catalogItemIndexes(fields).map(function(index){return catalogItemHTML(index,fields);}).join('')+'</div>'+button('Add product','add-catalog-item',true);
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
  function businessFieldsHTML(fields) {
    var values=businessValues(fields);
    return '<div class="nxw-fields">'+data.setup.fields.business.map(function(field){return fieldHTML(field,values);}).join('')+'</div>';
  }
  function businessPatch(form) {
    var patch = {};
    Array.from(form.elements).forEach(function (input) {
      if (input.name && !input.disabled) patch[input.name] = input.type === 'checkbox' ? String(input.checked) : input.value;
    });
    return patch;
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
    var html='<div class="nxw-setup-intro"><h3 id="nxw-step-title">'+(selectedStep+1)+' · '+escape(stepTitle(selectedStep))+'</h3><strong class="nxw-task-label">'+escape(salonCopy.doThis)+'</strong><ul>'+tasks.split('|').filter(Boolean).map(function(task){return '<li>'+escape(task)+'</li>';}).join('')+'</ul></div>';
    var formHeading='<strong class="nxw-form-title">'+escape(setupCopy.formTitle)+'</strong>';
    if(kind==='services'||kind==='menu')html+='<div class="nxw-services-preparation">'+formHeading+'<div data-settings-panel="services" data-onboarding-services></div></div>';
    if(kind==='qr')html+='<div class="nxw-qr-preparation">'+formHeading+'<div data-onboarding-qr></div></div>';
    if(kind==='staff')html+='<div class="nxw-staff-preparation">'+formHeading+'<div class="nxw-subsection" data-staff-mode><strong>'+escape(setupCopy.staffMethodTitle)+'</strong>'+choicesHTML([{key:'manual',label:'staffManual',defaultValue:'manual'},{key:'invite',label:'staffInvite',defaultValue:'manual'}],fields,'staffMode')+'</div>'+(mode==='manual'?'<div data-onboarding-staff></div>':'<div data-onboarding-staff-invite></div>')+'</div>';
    html+='<form id="nxw-setup-form" aria-labelledby="nxw-step-title" novalidate>'+(['services','menu','staff','qr'].includes(kind)?'':formHeading);
    if(!['services','menu','staff','qr'].includes(kind))html+=kind==='business'?businessFieldsHTML(fields):kind==='catalog'?catalogFieldsHTML(fields):'<div class="nxw-fields">'+(data.setup.fields[kind]||[]).filter(function(field){return field[0]!=='tipAmount'||guide().key==='restaurant';}).map(function(field){return fieldHTML(field,fields);}).join('')+'</div>';
    if(kind==='voice')html+='<div class="nxw-subsection"><strong>'+escape(setupCopy.voiceModeTitle)+'</strong>'+choicesHTML([{key:'off',label:'voiceSkip',defaultValue:'off'},{key:'on',label:'voiceUse',defaultValue:'off'}],fields,'voiceMode')+'</div>'+(fields.voiceMode==='on'?voiceSettingsHTML(fields)+choicesHTML(data.flow.voiceFeatures,fields):'<p class="nxw-note">'+escape(setupCopy.voicePreviewOff)+'</p>')+'<p class="nxw-note">'+escape(setupCopy.voicePreviewNotice)+'</p>';
    html+='<button type="submit" class="nxw-btn">'+escape(setupCopy.saveStep)+'</button><div class="nxw-saved" id="nxw-save-status" role="status">'+escape(readStep(kind).completed?setupCopy.savedDone:Object.values(fields).some(function(value){return String(value).trim();})?setupCopy.draftSaved:setupCopy.autoSaveNote)+'</div><p class="nxw-note nxw-save-scope">'+escape(setupCopy.saveScope)+'</p></form>';
    if(!['staff','qr','voice'].includes(kind)){
      var sample=kind==='business'?guide().exampleName:kind==='services'||kind==='catalog'||kind==='menu'?copy[guide().exampleOffering]:setupCopy[guide().key+(kind==='payment'?'PaymentSample':kind==='deal'?'DealSample':'ReviewSample')];
      html+='<div class="nxw-step-example"><strong>'+escape(salonCopy.example)+'</strong><p>'+escape(sample)+'</p></div>';
    }
    if(kind!=='qr')html+='<div class="nxw-actions nxw-step-actions">'+link(kind==='voice'?'View AI Voice in SI POS':kind==='business'||isSalon()?salonCopy.openScreen:setupCopy.relatedScreen,stepRoute(kind))+(kind==='voice'?button(setupCopy.voiceLibrary,'open-reception',true):'')+(selectedStep<path().length-1?button(salonCopy.next,'next-step',true):button(salonCopy.viewGuides,'open-docs',true))+'</div>';
    document.getElementById('nxw-setup-detail').innerHTML=html;
    var form=document.getElementById('nxw-setup-form');
    if(kind==='voice')form.querySelector('.nxw-fields').hidden=true;
    if(kind==='staff'&&mode==='invite')form.querySelectorAll('.nxw-fields input').forEach(function (input) { input.disabled=true; });
    form.addEventListener('input',function(event){
      if(event.target.type==='radio'||event.target.type==='checkbox')return;saveInput(event.target);
    });
    form.addEventListener('change',function(event){
      if(kind==='business'){
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
    if(kind==='services'||kind==='menu')mountServiceWorkspace(fields,kind);
    if(kind==='qr')mountQrWorkspace(fields);
    if(kind==='staff'){
      main.querySelector('[data-staff-mode]').addEventListener('change',function(event){saveInput(event.target);renderSetupStep();});
      mountStaffWorkspace(fields);
    }
  }
  function saveInput(input){
    var patch={};if(path()[selectedStep]==='business')patch=businessPatch(input.form);else if(path()[selectedStep]==='voice')patch=voiceFormPatch(input.form);else patch[input.name]=input.type==='checkbox'?String(input.checked):input.value;
    var saved=writeStep(path()[selectedStep],patch);document.getElementById('nxw-save-status').textContent=saved?setupCopy.draftSaved:setupCopy.saveFailed;
    renderEnteredPreview();updateProgress();
  }
  function renderEnteredPreview(){
    var slot=document.getElementById('nxw-preview-slot');
    if(!slot)return;
    var kind=path()[selectedStep],fields=Object.assign({},readStep(kind).fields),business=businessValues(readStep('business').fields);
    slot.replaceChildren();
    slot.hidden=kind==='qr'||kind==='staff'&&fields.staffMode==='invite';
    if(slot.hidden)return;
    if(kind==='business')fields=businessValues(fields);
    if(kind==='services'||kind==='menu'){
      var categories=kind==='menu'?fields.menuCatalog:fields.serviceCatalog;
      if(Array.isArray(categories))categories.reduce(function(all,category){return all.concat(category.services||[]);},[]).filter(function(item){return item.id!=='__custom__';}).slice(0,2).forEach(function(item,index){fields['item'+(index+1)+'Name']=item.name;fields['item'+(index+1)+'Price']=item.price==null?'':'$'+Number(item.price).toFixed(2);fields['item'+(index+1)+'Duration']=item.durationMin?item.durationMin+' min':'';fields['item'+(index+1)+'Detail']=item.description||'';});
    }
    if(kind==='staff'&&Array.isArray(fields.staffMembers))fields.staffMembers.slice(0,2).forEach(function(member,index){fields['staff'+(index+1)+'Name']=member.name;fields['staff'+(index+1)+'Hours']=(member.weekly||[]).filter(function(day){return !day.off&&day.start&&day.end;}).map(function(day){return day.start+'–'+day.end;}).filter(function(value,index,all){return all.indexOf(value)===index;}).join(' · ');});
    var preview=window.NEXORA_RENDER_ONBOARDING_PREVIEW(guide(),kind,stepTitle(selectedStep),function(key){return copy[key]||salonCopy[key];},function(key){return setupCopy[key];},{fields:fields,businessName:business.name});
    preview.id='nxw-entered-preview';slot.append(preview);
  }
  function completeStep(event){
    event.preventDefault();var form=event.currentTarget,kind=path()[selectedStep];
    if(kind==='services'||kind==='menu'){
      try{serviceWorkspace.save();}catch(failure){document.getElementById('nxw-save-status').textContent=failure.message;return;}
    }
    if(kind==='qr'){
      try{qrWorkspace.validate();}catch(failure){document.getElementById('nxw-save-status').textContent=failure.message;return;}
    }
    if(kind==='staff'){
      try{staffWorkspace.validate();}catch(failure){document.getElementById('nxw-save-status').textContent=failure.message;return;}
    }
    if(kind==='business')writeStep(kind,businessPatch(form));
    if(kind==='voice')writeStep(kind,voiceFormPatch(form));
    var value=readStep(kind),valid=form.reportValidity()&&(kind!=='business'||businessComplete(value.fields))&&(!['services','menu'].includes(kind)||servicesComplete(value.fields,kind));
    var special='';
    if(kind==='voice'&&value.fields.voiceMode==='on'&&!data.flow.voiceFeatures.some(function(item){return value.fields[item.key]==='true';}))special=setupCopy.chooseAtLeastOne;
    if(!valid||special){document.getElementById('nxw-save-status').textContent=special||setupCopy.requiredMessage;return;}
    if(!state.drafts[guide().key])state.drafts[guide().key]={};state.drafts[guide().key][kind]={fields:value.fields,completed:true};
    var stored=persist();if(!stored)state.drafts[guide().key][kind]=value;
    document.getElementById('nxw-save-status').textContent=stored?setupCopy.savedDone:setupCopy.saveFailed;updateProgress();
  }
  function guideAssistant(){return copy.docAgentTemplate.replace('{business}',guide().exampleName).replace('{step}',stepTitle(0)).replace('{tool}',data.products.find(function(p){return p.key===guide().tools[0];}).name);}
  function businessGuideTitle(step){return step.id==='voice'?setupCopy[step.title]:step.id==='daily'?data.businessGuide.copy[step.title]:salonCopy[step.title];}
  function businessGuideTasks(step){return (step.id==='voice'?setupCopy[step.tasks]:step.id==='daily'?data.businessGuide.copy[step.tasks]:salonCopy[step.tasks]).split('|');}
  function businessGuideHTML(){
    if(guide().key!=='nail')return '';
    var c=data.businessGuide.copy;
    return '<section class="business-guide"><div class="business-guide-head"><div><span>'+escape(c.eyebrow)+'</span><h4>'+escape(c.heading)+'</h4><p>'+escape(c.intro)+'</p></div><div class="business-guide-head-actions"><span class="business-guide-count">6</span>'+button(copy.docDownload,'download-business',true)+'</div></div><div class="business-guide-list">'+data.businessGuide.steps.map(function(step,index){
      var payment=step.id==='qr'?'<aside class="business-guide-payment"><strong>'+escape(c.paymentTitle)+'</strong><p>'+escape(c.paymentCondition)+'</p><ul>'+c.paymentTasks.split('|').map(function(task){return '<li>'+escape(task)+'</li>';}).join('')+'</ul>'+link(c.paymentLink,moduleRoute('payments'),true)+'</aside>':'';
      var action=step.wizard?'<button type="button" data-guide-step="'+step.wizard+'">'+escape(c.openIllustration)+'</button>':link(c.relatedScreen,'pos-front-desk.html',true);
      return '<details class="business-guide-step"'+(index===0?' open':'')+'><summary><span class="business-guide-number">'+(index+1)+'</span><strong>'+escape(businessGuideTitle(step))+'</strong><span class="business-guide-arrow" aria-hidden="true">⌄</span></summary><div class="business-guide-step-body"><figure class="business-guide-figure"><img src="'+escape(step.image)+'" alt="'+escape(businessGuideTitle(step))+'" loading="lazy"></figure><div class="business-guide-step-content"><ol>'+businessGuideTasks(step).map(function(task){return '<li>'+escape(task)+'</li>';}).join('')+'</ol>'+(step.extra?'<p>'+escape(c[step.extra])+'</p>':'')+payment+action+'</div></div></details>';
    }).join('')+'</div><p class="business-guide-note">'+escape(c.sourceNote)+'</p></section>';
  }
  function renderDocs(){
    var values=[[copy.docFieldBusiness,guide().exampleName],[copy.docFieldOffering,copy[guide().exampleOffering]],[copy.docFieldTouchpoint,copy[guide().exampleTouchpoint]]];
    var checklist=path().filter(function(kind){return kind!=='voice';}).map(function(kind,index){return '<li><b>✓</b><span>'+(index+1)+'. '+escape(stepTitle(index))+'</span></li>';}).join('');
    var cards=[{title:copy.docChecklistTitle,paper:'<ul>'+checklist+'</ul>',action:'checklist'},{title:copy.docExampleTitle,paper:'<dl>'+values.map(function(pair){return '<div><dt>'+escape(pair[0])+'</dt><dd>'+escape(pair[1])+'</dd></div>';}).join('')+'</dl><em>'+escape(copy.docSampleNote)+'</em>',action:'example'},{title:copy.docAgentTitle,paper:'<blockquote>'+escape(guideAssistant())+'</blockquote><em>'+escape(copy.docSampleNote)+'</em>',action:'assistant'}];
    document.getElementById('nxw-panel-docs').innerHTML='<div class="industry-docs-head"><div><span>'+escape(copy.docsEyebrow)+'</span><h3>'+escape(copy.docsTitle)+'</h3><p>'+escape(copy.docsIntro)+'</p></div><small>'+escape(guide().key==='nail'?data.businessGuide.copy.badge:copy[guide().name]+' · '+copy.docsCount)+'</small></div>'+businessGuideHTML()+'<div class="industry-doc-grid">'+cards.map(function(card,index){return '<article class="industry-doc-card"><small>'+(index+1)+'</small><h4>'+escape(card.title)+'</h4>'+(index===1?'<figure class="industry-doc-figure"><img src="'+escape(guide().sampleImage)+'" alt="" loading="lazy"><figcaption>'+escape(copy.docImageLabel)+' · '+escape(copy[guide().name])+'</figcaption></figure>':'')+'<div class="industry-doc-paper">'+card.paper+'</div>'+button(copy.docDownload,'download-'+card.action,true)+'</article>';}).join('')+'</div>';
  }
  function receptionText(key){
    return String(data.reception.copy[key]||'').replace(/\{business\}/g,guide().exampleName).replace(/\{offering\}/g,copy[guide().exampleOffering].split(' · ')[0]).replace(/\{touchpoint\}/g,copy[guide().exampleTouchpoint]);
  }
  function renderReception(){
    var c=data.reception.copy;
    var questions=data.reception.questions.map(function(q,index){var question=q.question,answer=q.answer;if(question==='booking')question=isSalon()?'bookSalonQ':guide().key==='restaurant'?'bookRestaurantQ':'bookOrderQ';if(question==='policy'){question=isSalon()?'policySalonQ':guide().key==='retail'?'policyRetailQ':'policyFoodQ';answer=(guide().key==='food'||guide().key==='restaurant')?'allergyA':'policyA';}var doc=data.reception.documents.find(function(doc){return doc.id===q.source;});return '<details'+(index===0?' open':'')+'><summary>'+escape(receptionText(question))+'</summary><div class="reception-answer"><small>'+escape(c.exampleAnswer)+'</small><p>'+escape(receptionText(answer))+'</p><small>'+escape(c.source)+': '+escape(receptionText(doc.title))+'</small></div></details>';}).join('');
    var documents=data.reception.documents.map(function(doc){return '<details'+(doc.id==='catalog'?' open':'')+'><summary>'+escape(receptionText(doc.title))+'</summary><div class="reception-doc-preview"><p>'+escape(receptionText(doc.example))+'</p><small>'+escape(c.needs)+'</small><p>'+escape(receptionText(doc.needs))+'</p></div></details>';}).join('');
    document.getElementById('nxw-panel-reception').innerHTML='<div class="reception-head"><div><span>'+escape(c.eyebrow)+'</span><h3>'+escape(c.title)+'</h3><p>'+escape(c.intro)+'</p></div><small>'+escape(copy[guide().name])+'</small></div><div class="reception-layout"><section class="reception-column"><h4>'+escape(c.questionsTitle)+'</h4><p>'+escape(c.questionsIntro)+'</p><div class="reception-list">'+questions+'</div></section><section class="reception-column"><h4>'+escape(c.docsTitle)+'</h4><p>'+escape(c.docsIntro)+'</p><div class="reception-list">'+documents+'</div></section></div><div class="reception-footer"><p>'+escape(c.note)+'</p><div class="reception-actions">'+button(c.download,'download-reception',true)+button(c.setup,'help-voice',true)+'</div></div>';
  }
  function helpPriorityScore(entry){
    var related={nail:['aihub','aimarketing'],hair:['aimarketing'],spa:['aihub','deals'],retail:['aimarketing'],food:['deals','aimarketing'],restaurant:['deals','aimarketing']};
    var products=Array.from(new Set(guide().tools.concat(related[guide().key]||[]))),index=products.indexOf(entry.product);
    return index<0?entry.kind==='product'?30:entry.kind==='feature'?0:20:(entry.kind==='product'?100:entry.kind==='feature'?50:75)-index*4;
  }
  function helpSample(entry){return String(data.help.samples[entry.id]||entry.sample||'').replace(/\{business\}/g,guide().exampleName).replace(/\{offering\}/g,copy[guide().exampleOffering].split(' · ')[0]);}
  function helpEntries(){
    var entries=data.help.workflows.map(function(w){return {id:w.id,kind:'workflow',product:w.product,title:w.title,steps:w.steps,sample:w.sample,route:{voice:'salon-guide-ai-voice.html',sms:'nexora-sms-dashboard.html',promotion:'reward-promotions.html',deal:'pos-deal-coupon.html'}[w.id]||moduleRoute(w.product)};});
    data.products.forEach(function(product){
      entries.push({id:'product-'+product.key,kind:'product',product:product.key,title:product.name,steps:data.presentation[product.key].steps,sample:data.presentation[product.key].summary,route:moduleRoute(product.key)});
      var explorer=data.explorer[product.key];
      if(explorer)explorer.features.forEach(function(feature,index){entries.push({id:'feature-'+product.key+'-'+index,kind:'feature',product:product.key,title:feature.title,steps:[data.help.ui.featurePrep,data.help.ui.featureOpen,data.help.ui.featureVerify],sample:feature.description,route:featureRoute(product.key,feature.key,index)});});
    });
    return entries.sort(function(a,b){return helpPriorityScore(b)-helpPriorityScore(a);});
  }
  function renderHelp(){
    var c=data.help.ui;
    var workflows=data.help.workflows.slice().sort(function(a,b){return helpPriorityScore(b)-helpPriorityScore(a);});
    var faq=data.help.faq.concat(guide().key==='nail'?data.businessGuide.faq.map(function(item){return Object.assign({},item,{businessGuide:true});}):[]);
    document.getElementById('nxw-panel-help').innerHTML='<div class="help-head"><span>'+escape(c.eyebrow)+'</span><h3>'+escape(c.title)+'</h3><p>'+escape(c.intro)+'</p><div class="help-industry-priority">'+escape(c.industryPriority)+' '+escape(copy[guide().name])+'</div><button type="button" class="help-download-all" data-action="download-help">'+escape(c.downloadAll)+'</button></div><strong class="help-subtitle">'+escape(c.featured)+'</strong><div class="help-featured">'+workflows.map(function(entry){return '<button type="button" data-help-task="'+entry.id+'">'+escape(entry.title)+'</button>';}).join('')+'</div><div class="nxw-toolbar"><input id="nxw-help-search" type="search" placeholder="'+escape(c.search)+'" aria-label="'+escape(c.search)+'" value="'+escape(helpSearch)+'"><select id="nxw-help-filter" aria-label="'+escape(c.allProducts)+'"><option value="">'+escape(c.allProducts)+'</option>'+data.products.map(function(p){return '<option value="'+p.key+'"'+(helpProduct===p.key?' selected':'')+'>'+escape(p.name)+'</option>';}).join('')+'</select></div><div class="nxw-help-layout"><section class="nxw-help-directory"><h3>'+escape(c.directory)+'</h3><p>'+escape(c.directoryHint)+'</p><div class="nxw-help-list" id="nxw-help-list" role="group" aria-label="'+escape(c.directory)+'"></div></section><article class="nxw-help-detail" id="nxw-help-detail" aria-live="polite"></article></div><section class="help-faq"><h4>'+escape(c.faq)+'</h4><p>'+escape(c.faqIntro)+'</p><div class="help-faq-list">'+faq.map(function(f){return '<details><summary>'+escape(f.q||f.question)+'</summary><p>'+escape(f.a||f.answer)+'</p>'+(f.guide?'<button type="button" data-help-task="'+f.guide+'">'+escape(c.steps)+'</button>':f.businessGuide?'<button type="button" data-action="open-docs">'+escape(c.steps)+'</button>':'')+'</details>';}).join('')+'</div></section>';
    document.getElementById('nxw-help-search').addEventListener('input',function(event){helpSearch=event.target.value;renderHelpResults();});
    document.getElementById('nxw-help-filter').addEventListener('change',function(event){helpProduct=event.target.value;renderHelpResults();});
    renderHelpResults();
  }
  function renderHelpResults(){
    var c=data.help.ui,entries=helpEntries().filter(function(entry){return (!helpProduct||entry.product===helpProduct)&&(!helpSearch||(entry.title+' '+entry.sample+' '+entry.steps.join(' ')).toLowerCase().indexOf(helpSearch.trim().toLowerCase())!==-1);});
    main.querySelector('.nxw-help-directory>h3').textContent=c.directory+' ('+entries.length+')';
    if(!entries.some(function(entry){return entry.id===selectedHelp;}))selectedHelp=entries[0]?entries[0].id:'';
    document.getElementById('nxw-help-list').innerHTML=entries.length?entries.map(function(entry){return '<button type="button" data-help-entry="'+entry.id+'" aria-pressed="'+(entry.id===selectedHelp)+'">'+escape(entry.title)+'<small>'+escape(data.products.find(function(p){return p.key===entry.product;}).name)+'</small></button>';}).join(''):'<p class="nxw-empty" role="status">'+escape(c.noResults)+'</p>';
    var entry=entries.find(function(item){return item.id===selectedHelp;});
    document.getElementById('nxw-help-detail').innerHTML=entry?'<span class="nxw-kicker">'+escape(c.steps)+'</span><h3>'+escape(entry.title)+'</h3><ol>'+entry.steps.map(function(step){return '<li>'+escape(step)+'</li>';}).join('')+'</ol><span class="nxw-kicker">'+escape(c.sample)+'</span><blockquote>'+escape(helpSample(entry))+'</blockquote><p class="nxw-note">'+escape(c.sampleNote)+'</p><div class="nxw-actions">'+link(setupCopy.relatedScreen,entry.route)+'</div>':'<p>'+escape(c.noResults)+'</p>';
  }
  function productSteps(key){var routes={pos:['pos-salon-settings.html?section=services','pos-front-desk.html?section=checkin','pos-technician-report.html?tab=store'],oneqr:['qr-stations.html?tab=one-qr','qr-stations.html?tab=qr-stations','qr-stations.html?tab=accept-payment'],payments:['payment-income.html','tip-list.html','staff-payouts.html'],aihub:['booking-book-phase-1.html?tab=booking&view=today','booking-book-phase-1.html?tab=customers','booking-book-phase-1.html?tab=calllog'],aimarketing:['booking-book-phase-1.html?tab=customers','nexora-sms-dashboard.html','vlinkpay-campaigns.html'],analytics:['nexora-analytics.html','nexora-analytics.html'],reviews:['nexora-review.html','nexora-review.html'],community:['community.html?tab=feed','community.html?tab=groups','community.html?tab=connect']};return routes[key]||[];}
  function setupPathHintHTML(){
    return '<section class="nxw-path-hint"><p>'+escape(useSalonLabels()?salonCopy.productHint:setupCopy.pathHint)+'</p>'+button(useSalonLabels()?salonCopy.seeSetup:setupCopy.pathButton,'open-journey',true)+'<div>'+path().map(function(kind,index){return '<button type="button" data-guide-step="'+kind+'">'+(index+1)+' · '+escape(stepTitle(index))+(kind==='voice'?' ('+escape(setupCopy.optionalStep)+')':'')+'</button>';}).join('')+'</div></section>';
  }
  function guideIcon(key){return '<i class="bi bi-'+({pos:'credit-card-2-front',oneqr:'qr-code',reviews:'star',payments:'wallet2',aihub:'stars',aimarketing:'megaphone',spin:'disc',gift:'gift',analytics:'graph-up-arrow',community:'people',deals:'gift'}[key]||'grid')+'" aria-hidden="true"></i>';}
  function renderProductGuides(){
    var product=data.products.find(function(p){return p.key===selectedProduct;})||data.products[0],presentation=data.presentation[product.key];
    var products=data.products.slice().sort(function(a,b){var rank=function(p){var i=guide().tools.indexOf(p.key);return i<0?data.products.indexOf(p)+data.products.length:i;};return rank(a)-rank(b);});
    var steps=product.steps.map(function(step,index){return '<li'+(product.preview?' class="is-preview"':'')+'><div class="onboard-step-top"><span class="onboard-step-stage">STEP '+(index+1)+'</span><span class="onboard-step-icon"><i class="bi bi-'+(['gear','credit-card-2-front','graph-up-arrow'][index]||'grid')+'" aria-hidden="true"></i></span></div><strong>'+escape(step.title)+'</strong><p class="onboard-step-copy">'+escape(presentation.steps[index])+'</p><a href="'+escape(productSteps(product.key)[index]||moduleRoute(product.key))+'">'+(product.preview?'View preview':'Open screen')+'<i class="bi bi-box-arrow-up-right" aria-hidden="true"></i></a></li>';}).join('');
    document.getElementById('nxw-panel-products').innerHTML=setupPathHintHTML()+'<div class="industry-product-heading"><span>'+escape(copy.productEyebrow)+'</span><h3>'+escape(copy.productHeading)+'</h3><p>'+escape(copy.productIntro)+'</p></div><div class="onboard-products" role="group" aria-label="'+escape(copy.tabProducts)+'">'+products.map(function(p){return '<button type="button" data-guide-product="'+p.key+'" aria-pressed="'+(p.key===product.key)+'">'+guideIcon(p.key)+'<span>'+escape(p.name)+'</span></button>';}).join('')+'</div><div class="onboard-panel"><article class="onboard-intro"><div class="onboard-intro-top"><span class="onboard-intro-icon">'+guideIcon(product.key)+'</span><span class="onboard-status">'+(product.preview?'Preview':product.steps.length+' starting steps')+'</span></div><span class="onboard-intro-label">SELECTED PRODUCT</span><h3>'+escape(product.name)+'</h3><p>'+escape(presentation.summary)+'</p><a href="'+escape(moduleRoute(product.key))+'">'+(product.key==='spin'?'View prize-wheel demo':'View all features')+' <span aria-hidden="true">→</span></a></article><ol class="onboard-steps" style="--step-count:'+product.steps.length+'">'+steps+'</ol></div>';
  }
  function selectHelpTask(id){
    selectedHelp=id;helpSearch='';helpProduct='';renderHelp();openTab('help');document.getElementById('nxw-help-detail').scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  function download(kind){
    var c=copy,text='',title='';
    if(kind==='business'){var business=data.businessGuide;title=business.copy.heading;text=business.copy.intro+'\n\n'+business.steps.map(function(step,index){return (index+1)+'. '+businessGuideTitle(step)+'\n'+businessGuideTasks(step).join('\n')+(step.extra?'\n'+business.copy[step.extra]:'')+(step.id==='qr'?'\n'+business.copy.paymentTitle+'\n'+business.copy.paymentCondition+'\n'+business.copy.paymentTasks.split('|').join('\n'):'');}).join('\n\n')+'\n\n'+business.copy.sourceNote;}
    if(kind==='help'){title=data.help.ui.title;text=data.help.ui.intro+'\n\n'+copy.docChecklistTitle+'\n'+path().filter(function(key){return key!=='voice';}).map(function(key,index){return (index+1)+'. '+stepTitle(index);}).join('\n')+'\n\n'+copy.docExampleTitle+'\n'+guide().exampleName+'\n'+copy[guide().exampleOffering]+'\n'+copy[guide().exampleTouchpoint]+'\n\n'+copy.docAgentTitle+'\n'+guideAssistant()+'\n\n'+data.help.workflows.map(function(entry){return entry.title+'\n'+entry.steps.map(function(step,index){return (index+1)+'. '+step;}).join('\n')+'\n'+helpSample(entry);}).join('\n\n')+'\n\n'+data.products.map(function(product){return product.name+'\n'+product.steps.map(function(step,index){return (index+1)+'. '+step.title+' — '+data.presentation[product.key].steps[index];}).join('\n');}).join('\n\n')+'\n\n'+data.help.faq.concat(guide().key==='nail'?data.businessGuide.faq:[]).map(function(item){return item.q+'\n'+item.a;}).join('\n\n');}
    if(kind==='checklist'){title=c.docChecklistTitle;text=path().filter(function(key){return key!=='voice';}).map(function(key,i){return (i+1)+'. '+stepTitle(i);}).join('\n');}
    if(kind==='example'){title=c.docExampleTitle;text=c.docFieldBusiness+': '+guide().exampleName+'\n'+c.docFieldOffering+': '+c[guide().exampleOffering]+'\n'+c.docFieldTouchpoint+': '+c[guide().exampleTouchpoint];}
    if(kind==='assistant'){title=c.docAgentTitle;text=guideAssistant();}
    if(kind==='reception'){title=data.reception.copy.title;text=data.reception.copy.note+'\n\n'+data.reception.documents.map(function(doc){return receptionText(doc.title)+'\n'+receptionText(doc.example)+'\n'+receptionText(doc.needs);}).join('\n\n')+'\n\n'+Array.from(document.querySelectorAll('#nxw-panel-reception .reception-column:first-child details')).map(function(item){return item.textContent;}).join('\n\n');}
    var blob=new Blob([title+'\n'+c[guide().name]+'\n\n'+text+'\n\n'+c.docSampleNote],{type:'text/plain;charset=utf-8'});var url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download='nexora-'+guide().key+'-'+kind+'.txt';document.body.append(anchor);anchor.click();anchor.remove();window.setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  main.addEventListener('click',function(event){
    var preview=event.target.closest('[data-preview-product]');if(preview){var key=preview.dataset.previewProduct;explorerProduct=key==='aihub-marketing'||key==='aihub-marketing-campaign'||key==='spin-wheel'?'aimarketing':key;explorerFeature=0;renderExplorer();}
    var target=event.target.closest('button');if(!target)return;
    if(target.dataset.slide!==undefined){playing=false;renderSlide(Number(target.dataset.slide));syncSlideshow();}
    if(target.dataset.explorerProduct){explorerProduct=target.dataset.explorerProduct;explorerFeature=0;renderExplorer();main.querySelector('[data-explorer-product="'+explorerProduct+'"]').focus();}
    if(target.dataset.explorerFeature!==undefined){explorerFeature=Number(target.dataset.explorerFeature);renderExplorer();main.querySelector('[data-explorer-feature="'+explorerFeature+'"]').focus();}
    if(target.matches('.nxw-industry[data-industry]')){assistantIntent='overview';state.industry=target.dataset.industry;persist();selectedStep=firstUnfinished();selectedProduct=guide().tools[0];selectedHelp='product-'+selectedProduct;helpSearch='';helpProduct='';activeOnboardTab='journey';renderOnboarding();openTab('journey');main.querySelector('.nxw-industry[data-industry="'+state.industry+'"]').focus();}
    if(target.dataset.guideStep){var stepIndex=path().indexOf(target.dataset.guideStep);if(stepIndex>=0){selectedStep=stepIndex;renderSetupStep();openTab('journey');document.getElementById('nxw-setup-detail').scrollIntoView({block:'nearest',behavior:'smooth'});}}
    if(target.dataset.helpTask)selectHelpTask(target.dataset.helpTask);
    if(target.dataset.onboardTab)openTab(target.dataset.onboardTab);
    if(target.dataset.setupStep!==undefined){selectedStep=Number(target.dataset.setupStep);renderSetupStep();}
    if(target.dataset.helpEntry){selectedHelp=target.dataset.helpEntry;renderHelpResults();main.querySelector('[data-help-entry="'+selectedHelp+'"]').focus();}
    if(target.dataset.assistantIntent){assistantIntent=target.dataset.assistantIntent;renderSetupAssistant();main.querySelector('[data-assistant-intent="'+assistantIntent+'"]').focus();}
    if(target.dataset.guideProduct){selectedProduct=target.dataset.guideProduct;renderProductGuides();main.querySelector('[data-guide-product="'+selectedProduct+'"]').focus();}
    var action=target.dataset.action;if(!action)return;
    if(action==='slide-prev'||action==='slide-next'){playing=false;renderSlide(slideIndex+(action==='slide-prev'?-1:1));syncSlideshow();}
    if(action==='slide-play'){playing=!playing;syncSlideshow();}
    if(action==='open-docs')openTab('docs');
    if(action==='open-reception')openTab('reception');
    if(action==='open-journey')openTab('journey');
    if(action==='help-voice')selectHelpTask('voice');
    if(action==='start-first'){selectedStep=0;renderSetupStep();document.getElementById('nxw-step-title').tabIndex=-1;document.getElementById('nxw-step-title').focus();}
    if(action==='next-step'){selectedStep=Math.min(path().length-1,selectedStep+1);renderSetupStep();}
    if(action==='add-catalog-item'&&path()[selectedStep]==='catalog'){
      var fields=readStep('catalog').fields,index=catalogItemIndexes(fields).pop()+1,patch={};
      patch['item'+index+'Name']='';patch['item'+index+'Price']='';
      var stored=writeStep('catalog',patch);
      main.querySelector('[data-catalog-items]').insertAdjacentHTML('beforeend',catalogItemHTML(index,patch));
      main.querySelector('[name="item'+index+'Name"]').focus();
      document.getElementById('nxw-save-status').textContent=stored?setupCopy.draftSaved:setupCopy.saveFailed;
      renderEnteredPreview();updateProgress();
    }
    if(action.indexOf('download-')===0)download(action.slice(9));
  });
  if(view==='onboarding'){
    var params=new URLSearchParams(window.location.search);if(data.library.guides.some(function(g){return g.key===params.get('industry');}))state.industry=params.get('industry');
    if(['journey','docs','reception','help','products'].indexOf(params.get('view'))!==-1)activeOnboardTab=params.get('view');
    selectedProduct=guide().tools[0];selectedHelp='product-'+selectedProduct;
    selectedStep=firstUnfinished();renderOnboarding();
  }else renderHome();
  window.addEventListener('pagehide',stopSetupSpeech);
  window.NEXORA_WELCOME={moduleRoute:moduleRoute,featureRoute:featureRoute,storageKey:storageKey};
})();
