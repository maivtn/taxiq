/* Shared industry artwork. Change files here to update every industry surface.
 * Source and author details: html/assets/flaticon-flat/sources.json. */
(function () {
  'use strict';
  const base = new URL('flaticon-flat/', document.currentScript.src);
  const files = Object.freeze({
    "cosmetics": "industry-cosmetics-3194619.png",
    "medspa": "industry-skin-5732655.png",
    "market": "industry-market-2203239.png",
    "convenience": "industry-convenience-3733204.png",
    "import": "industry-import-5827730.png",
    "fashion": "industry-fashion-2682165.png",
    "shoes": "industry-shoes-1785340.png",
    "jewelry": "industry-jewelry-4259798.png",
    "electronics": "industry-electronics-186239.png",
    "furniture": "industry-furniture-1698721.png",
    "flower": "industry-flower-1940885.png",
    "eyewear": "industry-eyewear-1785384.png",
    "dental": "industry-dental-4702160.png",
    "eye": "industry-eye-2824893.png",
    "clinic": "industry-clinic-1021592.png",
    "specialist": "industry-specialist-3953004.png",
    "chiro": "industry-chiro-8123360.png",
    "acupuncture": "industry-acupuncture-1683193.png",
    "pharm": "industry-pharm-1529570.png",
    "lab": "industry-lab-9803099.png",
    "mental": "industry-mental-3999869.png",
    "homehealth": "industry-homehealth-5255978.png",
    "carwash": "industry-carwash-12988453.png",
    "mechanic": "industry-mechanic-4259392.png",
    "tire": "industry-tire-1768096.png",
    "bodyshop": "industry-bodyshop-465088.png",
    "tint": "industry-tint-2061940.png",
    "dealer": "industry-dealer-171239.png",
    "carrental": "industry-carrental-14022958.png",
    "ride": "industry-ride-619006.png",
    "bus": "industry-bus-1068580.png",
    "moving": "industry-moving-602201.png",
    "cargo": "industry-cargo-870158.png",
    "inspection": "industry-inspection-12988548.png",
    "clean": "industry-clean-3899392.png",
    "remodel": "industry-remodel-2991398.png",
    "plumbing": "industry-plumbing-313022.png",
    "hvac": "industry-hvac-911409.png",
    "roof": "industry-roof-6758832.png",
    "floor": "industry-floor-2470426.png",
    "paint": "industry-paint-681531.png",
    "landscape": "industry-landscape-1518914.png",
    "pool": "industry-pool-1925978.png",
    "pest": "industry-pest-5580014.png",
    "garage": "industry-garage-4261174.png",
    "security": "industry-security-394620.png",
    "laundry": "industry-laundry-698703.png",
    "locksmith": "industry-locksmith-7484470.png",
    "insurance": "industry-insurance-9200592.png",
    "loan": "industry-loan-3190513.png",
    "lawyer": "industry-lawyer-3122333.png",
    "notary": "industry-notary-4807939.png",
    "realtor": "industry-realtor-3458096.png",
    "rental": "industry-rental-5336261.png",
    "invest": "industry-invest-7656491.png",
    "flight": "industry-flight-870194.png",
    "tour": "industry-tour-1663017.png",
    "hotel": "industry-hotel-1926407.png",
    "visa": "industry-visa-3073704.png",
    "vietschool": "industry-vietschool-167707.png",
    "tutor": "industry-tutor-3449694.png",
    "beautyschool": "industry-beautyschool-913425.png",
    "driving": "industry-driving-3410351.png",
    "esl": "industry-esl-7819009.png",
    "arts": "industry-arts-2400597.png",
    "vocational": "industry-vocational-2795113.png",
    "photo": "industry-photo-1042339.png",
    "bridal": "industry-bridal-3074097.png",
    "planner": "industry-planner-3656845.png",
    "music": "industry-music-6454466.png",
    "rentalevent": "industry-rentalevent-3034068.png",
    "entertain": "industry-entertain-8360791.png",
    "daycare": "industry-daycare-14257541.png",
    "kids": "industry-kids-5620471.png",
    "pet": "industry-pet-14257544.png",
    "vet": "industry-vet-2930697.png",
    "senior": "industry-senior-4561052.png",
    "print": "industry-print-3233446.png",
    "staffing": "industry-staffing-11319970.png",
    "lease": "industry-lease-869432.png",
    "commercialclean": "industry-commercialclean-2829848.png",
    "telecom": "industry-telecom-550381.png",
    "techrepair": "industry-techrepair-1652207.png",
    "equipment": "industry-equipment-7220695.png",
    "temple": "industry-temple-3336130.png",
    "charity": "industry-charity-10880437.png",
    "retail": "industry-retail-9368624.png",
    "home": "industry-home-619032.png",
    "lifestyle": "industry-lifestyle-6749680.png",
    "pedi": "industry-pedi-9097368.png",
    "lash": "industry-lash-10203181.png",
    "skin": "industry-skin-5732655.png",
    "pmu": "../promotions/industry-icons/tattoo.png",
    "wax": "industry-wax-4614237.png",
    "fitness": "industry-fitness-2446353.png",
    "yoga": "industry-yoga-625434.png",
    "diet": "industry-diet-4721146.png",
    "food": "industry-food-433087.png",
    "fastfood": "industry-fastfood-3075929.png",
    "drink": "industry-drink-1047503.png",
    "bakery": "industry-bakery-4293097.png",
    "hotpot": "industry-hotpot-9126561.png",
    "seafood": "industry-seafood-1652075.png",
    "vegan": "industry-vegan-5581173.png",
    "foodtruck": "industry-foodtruck-499552.png",
    "bar": "industry-bar-473811.png",
    "banquet": "industry-banquet-4521038.png",
    "catering": "industry-catering-11477836.png",
    "homefood": "industry-homefood-2702578.png",
    "professional": "industry-professional-476852.png",
    "microphone": "industry-microphone-2611416.png",
    "music-school": "industry-music-school-8332390.png",
    "butcher": "industry-butcher-2224259.png",
    "boba": "industry-boba-3361204.png",
    "icecream": "industry-icecream-938114.png",
    "package": "industry-package-595472.png",
    "gems": "industry-gems-408472.png",
    "wig": "industry-wig-3461883.png",
    "towing": "industry-towing-7071380.png",
    "electric": "industry-electric-7215374.png",
    "solar": "industry-solar-649853.png",
    "gas": "industry-gas-3361315.png",
    "alteration": "industry-alteration-2175777.png",
    "funeral": "industry-funeral-4582429.png",
    "computer": "industry-computer-874728.png",
    "martial": "industry-martial-8581495.png",
    "dance": "industry-dance-4424826.png",
    "family": "industry-family-547612.png",
    "security-guard": "industry-security-guard-4009139.png",
    "nail": "nail-1658222.png",
    "hair": "industry-hair-11376639.png",
    "hair-comb": "industry-hair-comb-11376653.png",
    "barber": "industry-barber-11376660.png",
    "spa": "spa-1057315.png",
    "tax": "taxiq-1651909.png",
    "remit": "payouts-9405882.png",
    "association": "community-6576105.png",
    "marketing": "marketing-1378593.png",
    "software": "pos-9423135.png",
    "media": "news-1968737.png",
    "gift": "gift-1651898.png",
    "calendar": "calendar-3652191.png",
    "other": "services-3326644.png"
});
  // Catalog IDs stay unchanged; aliases only choose their artwork.
  const aliases = Object.freeze({
    pedicure:'pedi', tattoo:'pmu', nutrition:'diet', restaurant:'food',
    'fast-food':'fastfood', coffee:'drink', 'hot-pot':'hotpot', 'food-truck':'foodtruck',
    apparel:'fashion', flowers:'flower', repair:'mechanic', cosmetics:'cosmetics',
    takeaway:'homefood', supply:'nail', cosmetic:'cosmetics',
    immigration:'lawyer', injury:'lawyer', entertainment:'entertain',
    nails:'nail', massage:'spa', cafe:'drink', truck:'foodtruck',
    solo:'professional', trainer:'fitness', mua:'cosmetics', makeup:'cosmetics',
    coach:'mental', kol:'photo', freelance:'professional', artist:'microphone',
    songwriter:'music', band:'microphone', model:'photo', actor:'microphone', mc:'microphone',
    gym:'fitness', shopvn:'convenience', grocery:'market', foodsupply:'package',
    beautyproducts:'cosmetics', beautyretail:'cosmetics', supplement:'pharm',
    goldshop:'jewelry', florist:'flower', printing:'print', boutique:'fashion',
    thrift:'fashion', petstore:'pet', auto:'mechanic', autorepair:'mechanic',
    tires:'tire', autoglass:'tint', autoparts:'mechanic', lawn:'landscape',
    construction:'remodel', plumber:'plumbing', electrical:'electric', roofing:'roof',
    appliance:'equipment', flooring:'floor', painting:'paint', phonerepair:'techrepair',
    medical:'clinic', therapy:'chiro', optical:'eye', pharmacy:'pharm', wellness:'spa',
    childcare:'daycare', school:'vietschool', tutoring:'tutor', wedding:'bridal',
    venue:'banquet', partyrental:'rentalevent', photobooth:'photo',
    moneytransfer:'remit', translation:'esl', mortgage:'loan', legal:'lawyer',
    realestate:'realtor', bizbroker:'lease', taxservice:'tax', accounting:'tax',
    travel:'tour', travelagency:'tour', itservice:'computer', it:'computer',
    agency:'marketing', worship:'temple', nonprofit:'charity', karaoke:'microphone',
    petgroom:'pet', petgrooming:'pet', petboard:'pet', petcare:'pet',
    cleaning:'clean', handyman:'remodel', photography:'photo', event:'planner',
    finance:'tax'
  });
  const groups = Object.freeze({
    beauty:'cosmetics', food:'food', shop:'retail', health:'clinic', auto:'dealer',
    home:'home', finance:'tax', travel:'tour', edu:'vietschool', event:'planner',
    family:'family', biz:'professional', community:'association', personal:'professional',
    showbiz:'microphone', service:'professional', store:'retail', houseauto:'mechanic',
    events:'planner', pro:'professional', professional:'professional', retail:'retail', other:'other'
  });
  const catalogs = Object.freeze({
    oneqr:Object.freeze({supply:'package', music:'music-school', security:'security-guard'})
  });
  const emoji = Object.freeze({
    '💅':'nail','🦶':'pedi','💆':'spa','🧖':'skin','💇':'hair','💈':'barber','👁':'eye',
    '🦷':'dental','🩺':'clinic','🧠':'mental','💊':'pharm','🔬':'lab','🦴':'chiro',
    '💉':'medspa','🪒':'wax','🏋':'fitness','🧘':'yoga','🥗':'vegan','🧋':'boba',
    '🍽':'food','🍜':'food','🍲':'hotpot','🦞':'seafood','🥬':'vegan','🥡':'homefood',
    '☕':'drink','🥖':'bakery','🍻':'bar','👗':'fashion','👜':'shoes','🕶':'eyewear',
    '👓':'eyewear','💍':'jewelry','🛋':'furniture','💐':'flower','🛞':'tire','🚕':'ride',
    '🚌':'bus','🚚':'moving','👶':'daycare','🍼':'kids','🐶':'pet','🐾':'pet',
    '👴':'senior','👰':'bridal','🛕':'temple','⛪':'temple'
  });
  function resolve(key, catalog = 'default') {
    key = String(key || 'other');
    if (key.startsWith('group:')) key = groups[key.slice(6)] || 'other';
    else if (key.endsWith('_other')) key = groups[key.slice(0,-6)] || 'other';
    key = catalogs[catalog]?.[key] || aliases[key] || key;
    return Object.hasOwn(files,key) ? key : 'other';
  }
  function path(key, catalog) { return new URL(files[resolve(key,catalog)],base).href; }
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function image(key, options = {}) {
    const size = Math.max(16,Math.min(96,Number(options.size) || 24));
    return '<img class="industry-flat-icon '+escape(options.className || '')+'" src="'+escape(path(key,options.catalog))+'" alt="" aria-hidden="true" width="'+size+'" height="'+size+'" decoding="async" draggable="false">';
  }
  const normalize = value => String(value || '').replace(/^[^\p{L}\p{N}]+/u,'').trim().toLocaleLowerCase();
  const labels = {
    'nail & làm đẹp':'nail', 'nail & beauty':'nail', 'nails & beauty':'nail',
    'nhà hàng & ăn uống':'food', 'restaurants & dining':'food', 'restaurant & dining':'food',
    'bán lẻ & dịch vụ':'retail', 'retail & services':'retail', 'food & beverage':'food',
    'làm đẹp':'cosmetics', 'beauty':'cosmetics', 'ăn uống':'food', 'food & drink':'food',
    'bán lẻ':'retail', 'retail':'retail', 'khác':'other', 'other':'other',
    'hair & barber':'hair', 'spa & wellness':'spa', 'food shop':'food',
    'nail':'nail', 'nail salon':'nail', 'nail salon / personal care':'nail',
    'spa & massage':'spa', 'hair salon':'hair', 'personal care':'cosmetics',
    'professional services':'professional', 'other services':'other',
    'nail & beauty community':'nail', 'cộng đồng nail':'nail', 'nail community':'nail',
    'cộng đồng spa & massage':'spa', 'spa & massage community':'spa',
    'cộng đồng tóc & salon':'hair', 'hair & salon community':'hair',
    'cộng đồng mi & chân mày':'lash', 'lash & brow community':'lash'
  };
  function keyForLabel(value) {
    const name = normalize(value);
    for (const data of [window.POS_PROMOTIONS_DEMO_DATA,window.NEXORA_PROMOTION_CREATE_DATA]) {
      const item = data?.industries.find(item => [item.en,item.vi].some(label => normalize(label) === name));
      if (item) return item.id;
      const group = data?.groups.find(item => [item.en,item.vi].some(label => normalize(label) === name));
      if (group) return 'group:'+group.id;
    }
    const oneqr = window.ONEQR_INDUSTRIES?.industries.find(item => [item.en,item.vi].some(label => normalize(label) === name));
    if (oneqr) return catalogs.oneqr[oneqr.id] || oneqr.id;
    for (const group of window.ONEQR_ADVERTISING_PO?.categories || []) {
      const item = group[3].find(item => [item[1],item[2]].some(label => normalize(label) === name));
      if (item) return item[0];
    }
    return labels[name] || null;
  }
  const icons = Object.freeze(Object.fromEntries(
    [...new Set([...Object.keys(files),...Object.keys(aliases),...Object.keys(groups).map(key=>'group:'+key)])]
      .map(key => [key,files[resolve(key)]])
  ));
  window.NEXORA_INDUSTRY_ICONS = Object.freeze({files,aliases,groups,catalogs,emoji,icons,resolve,path,image,keyForLabel});

  // Native selects keep their values and events; custom pickers render the same registry.
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('industry-icons.css?v=20261030-flat',document.currentScript.src).href;
  document.head.append(stylesheet);
  function decorateOption(element, key, catalog) {
    if (!key) return;
    const existing = element.querySelector('.industry-choice-icon');
    if (existing) {
      const source = path(key,catalog);
      if (existing.src !== source) existing.src = source;
      return;
    }
    element.insertAdjacentHTML('afterbegin',image(key,{size:20,catalog,className:'industry-choice-icon'}));
  }
  function refresh() {
    document.querySelectorAll('img[data-industry-artwork]').forEach(element => {
      const source = path(element.dataset.industryArtwork,element.dataset.industryCatalog);
      if (element.src !== source) element.src = source;
    });
    document.querySelectorAll('select').forEach(select => {
      const isIndustry = select.hasAttribute('data-industry-select') || /industry|ngành/i.test(
        [select.id,select.name,select.getAttribute('aria-label')].join(' '));
      if (!isIndustry) return;
      const catalog = select.dataset.industryCatalog || 'default';
      const option = select.selectedOptions[0];
      const key = option?.value ? option.dataset.industryIcon || keyForLabel(option.textContent) || option.value : null;
      if (select.tomselect) {
        for (const host of [select.tomselect.wrapper,select.tomselect.dropdown]) {
          host?.querySelectorAll('.item[data-value],.option[data-value]').forEach(element => {
            const item = Array.from(select.options).find(option => option.value === element.dataset.value);
            if (item?.value) decorateOption(element,item.dataset.industryIcon || keyForLabel(item.textContent) || item.value,catalog);
          });
        }
        return;
      }
      const custom = select.dataset.imagePicker || select.nextElementSibling?.matches('.po-select,.promotion-industry-picker');
      select.classList.toggle('industry-icon-select',Boolean(key && !select.multiple && !custom));
      if (key && !custom) select.style.setProperty('--industry-select-icon','url("'+path(key,catalog)+'")');
      else select.style.removeProperty('--industry-select-icon');
    });
    document.querySelectorAll('[data-job-industry],.chip,.filter-chip,.pill,.tag').forEach(element => {
      if (element.matches('select,option') || element.querySelector('img:not(.industry-choice-icon),svg') || element.closest('[contenteditable],.post,.message,.comment')) return;
      const key = keyForLabel(element.dataset.jobIndustry || element.textContent);
      if (key) decorateOption(element,key);
    });
  }
  function start() {
    let scheduled = false;
    const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(() => {scheduled=false;refresh();}); } };
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
    document.addEventListener('change',schedule);
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
