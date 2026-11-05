/* Shared illustrated selects for the Community Deals screens. */
(() => {
  'use strict';
  const BASE=new URL('../icon-oneqr/',document.currentScript.src);
  window.NEXORA_DEAL_INDUSTRY_FILES=["acupuncture", "arts", "association", "bakery", "banquet", "bar", "barber", "beautyschool", "bodyshop", "bridal", "bus", "cargo", "carrental", "carwash", "catering", "charity", "chiro", "clean", "clinic", "commercialclean", "convenience", "cosmetic", "daycare", "dealer", "dental", "diet", "drink", "driving", "electronics", "entertain", "equipment", "esl", "eye", "eyewear", "fashion", "fastfood", "fitness", "flight", "floor", "flower", "food", "foodtruck", "furniture", "garage", "hair", "homefood", "homehealth", "hotel", "hotpot", "hvac", "immigration", "import", "injury", "inspection", "insurance", "invest", "jewelry", "kids", "lab", "landscape", "lash", "laundry", "lawyer", "lease", "loan", "locksmith", "market", "marketing", "mechanic", "media", "medspa", "mental", "moving", "music", "nail", "notary", "paint", "pedi", "pest", "pet", "pharm", "photo", "planner", "plumbing", "pmu", "pool", "print", "realtor", "remit", "remodel", "rental", "rentalevent", "ride", "roof", "seafood", "security", "senior", "shoes", "skin", "software", "spa", "specialist", "staffing", "supply", "tax", "techrepair", "telecom", "temple", "tint", "tire", "tour", "tutor", "vegan", "vet", "vietschool", "visa", "vocational", "wax", "yoga"];
  const INDUSTRIES=[{"id":"nail","name":"Nail salon","group":"beauty"},{"id":"pedi","name":"Pedicure","group":"beauty"},{"id":"spa","name":"Spa & massage","group":"beauty"},{"id":"lash","name":"Lashes & brows","group":"beauty"},{"id":"hair","name":"Hair salon","group":"beauty"},{"id":"barber","name":"Barbershop","group":"beauty"},{"id":"skin","name":"Skin & facial","group":"beauty"},{"id":"pmu","name":"PMU & tattoo","group":"beauty"},{"id":"medspa","name":"Medspa & aesthetics","group":"beauty"},{"id":"wax","name":"Waxing","group":"beauty"},{"id":"fitness","name":"Gym & fitness","group":"beauty"},{"id":"yoga","name":"Yoga & pilates","group":"beauty"},{"id":"diet","name":"Weight loss & nutrition","group":"beauty"},{"id":"food","name":"Restaurant","group":"food"},{"id":"fastfood","name":"Fast food & sandwiches","group":"food"},{"id":"drink","name":"Coffee & bubble tea","group":"food"},{"id":"bakery","name":"Bakery & desserts","group":"food"},{"id":"hotpot","name":"Hotpot · BBQ · buffet","group":"food"},{"id":"seafood","name":"Seafood","group":"food"},{"id":"vegan","name":"Vegetarian & vegan","group":"food"},{"id":"foodtruck","name":"Food truck","group":"food"},{"id":"bar","name":"Bar · pub · karaoke","group":"food"},{"id":"banquet","name":"Wedding banquet hall","group":"food"},{"id":"catering","name":"Catering","group":"food"},{"id":"homefood","name":"Home-cooked & online food","group":"food"},{"id":"market","name":"Grocery & market","group":"shop"},{"id":"convenience","name":"Convenience store","group":"shop"},{"id":"supply","name":"Nail & spa supply","group":"shop"},{"id":"cosmetic","name":"Cosmetics & perfume","group":"shop"},{"id":"import","name":"Imported goods","group":"shop"},{"id":"fashion","name":"Fashion & áo dài","group":"shop"},{"id":"shoes","name":"Shoes & bags","group":"shop"},{"id":"jewelry","name":"Jewelry & gold","group":"shop"},{"id":"electronics","name":"Phones & electronics","group":"shop"},{"id":"furniture","name":"Furniture & appliances","group":"shop"},{"id":"flower","name":"Flowers & gifts","group":"shop"},{"id":"eyewear","name":"Eyewear store","group":"shop"},{"id":"dental","name":"Dentist","group":"health"},{"id":"eye","name":"Optometry","group":"health"},{"id":"clinic","name":"Family doctor & clinic","group":"health"},{"id":"specialist","name":"Medical specialist","group":"health"},{"id":"chiro","name":"Chiropractic & physical therapy","group":"health"},{"id":"acupuncture","name":"Acupuncture & herbal","group":"health"},{"id":"pharm","name":"Pharmacy & supplements","group":"health"},{"id":"lab","name":"Lab & imaging","group":"health"},{"id":"mental","name":"Mental health & counseling","group":"health"},{"id":"homehealth","name":"Home health & senior care","group":"health"},{"id":"carwash","name":"Car wash & detailing","group":"auto"},{"id":"mechanic","name":"Auto repair & oil change","group":"auto"},{"id":"tire","name":"Tires & brakes","group":"auto"},{"id":"bodyshop","name":"Body shop & paint","group":"auto"},{"id":"tint","name":"Tint · accessories · audio","group":"auto"},{"id":"dealer","name":"Car sales & dealer","group":"auto"},{"id":"carrental","name":"Car rental","group":"auto"},{"id":"ride","name":"Rides · taxi · airport","group":"auto"},{"id":"bus","name":"Intercity bus","group":"auto"},{"id":"moving","name":"Moving & hauling","group":"auto"},{"id":"cargo","name":"Cargo to Vietnam","group":"auto"},{"id":"inspection","name":"Inspection & registration","group":"auto"},{"id":"clean","name":"House cleaning","group":"home"},{"id":"remodel","name":"Remodeling & contractor","group":"home"},{"id":"plumbing","name":"Electrical & plumbing","group":"home"},{"id":"hvac","name":"HVAC","group":"home"},{"id":"roof","name":"Roofing","group":"home"},{"id":"floor","name":"Flooring & tile","group":"home"},{"id":"paint","name":"Painting","group":"home"},{"id":"landscape","name":"Landscaping","group":"home"},{"id":"pool","name":"Pool service","group":"home"},{"id":"pest","name":"Pest control","group":"home"},{"id":"garage","name":"Doors · garage · windows","group":"home"},{"id":"security","name":"Security & smart home","group":"home"},{"id":"laundry","name":"Laundry & dry cleaning","group":"home"},{"id":"locksmith","name":"Locksmith","group":"home"},{"id":"tax","name":"Tax & accounting","group":"finance"},{"id":"insurance","name":"Insurance","group":"finance"},{"id":"remit","name":"Money transfer & exchange","group":"finance"},{"id":"loan","name":"Loans & mortgage","group":"finance"},{"id":"immigration","name":"Immigration lawyer","group":"finance"},{"id":"injury","name":"Injury lawyer","group":"finance"},{"id":"lawyer","name":"Family & business lawyer","group":"finance"},{"id":"notary","name":"Notary & translation","group":"finance"},{"id":"realtor","name":"Real estate agent","group":"finance"},{"id":"rental","name":"Rental & property management","group":"finance"},{"id":"invest","name":"Investing & crypto","group":"finance"},{"id":"flight","name":"Flights","group":"travel"},{"id":"tour","name":"Tours","group":"travel"},{"id":"hotel","name":"Hotels & stays","group":"travel"},{"id":"visa","name":"Visa & passport services","group":"travel"},{"id":"vietschool","name":"Vietnamese language school","group":"edu"},{"id":"tutor","name":"Tutoring & test prep","group":"edu"},{"id":"beautyschool","name":"Beauty school & license","group":"edu"},{"id":"driving","name":"Driving school","group":"edu"},{"id":"esl","name":"English & citizenship classes","group":"edu"},{"id":"arts","name":"Music · art · martial arts","group":"edu"},{"id":"vocational","name":"Vocational & skills","group":"edu"},{"id":"photo","name":"Photo & video","group":"event"},{"id":"bridal","name":"Bridal & makeup","group":"event"},{"id":"planner","name":"Event planning","group":"event"},{"id":"music","name":"Live music · MC · DJ","group":"event"},{"id":"rentalevent","name":"Party rentals & decor","group":"event"},{"id":"entertain","name":"Entertainment & recreation","group":"event"},{"id":"daycare","name":"Daycare","group":"family"},{"id":"kids","name":"Kids & baby","group":"family"},{"id":"pet","name":"Pets & grooming","group":"family"},{"id":"vet","name":"Veterinary","group":"family"},{"id":"senior","name":"Senior living & adult daycare","group":"family"},{"id":"print","name":"Printing & signage","group":"biz"},{"id":"marketing","name":"Marketing · web · design","group":"biz"},{"id":"software","name":"POS & software","group":"biz"},{"id":"staffing","name":"Staffing & HR","group":"biz"},{"id":"lease","name":"Business for sale · lease · booth","group":"biz"},{"id":"commercialclean","name":"Commercial cleaning","group":"biz"},{"id":"telecom","name":"Telecom & internet","group":"biz"},{"id":"techrepair","name":"Phone & computer repair","group":"biz"},{"id":"equipment","name":"Commercial equipment","group":"biz"},{"id":"temple","name":"Temple & church","group":"community"},{"id":"association","name":"Associations","group":"community"},{"id":"charity","name":"Charity & fundraising","group":"community"},{"id":"media","name":"Media & press","group":"community"},{"id":"beauty_other","name":"Other","group":"beauty"},{"id":"food_other","name":"Other","group":"food"},{"id":"shop_other","name":"Other","group":"shop"},{"id":"health_other","name":"Other","group":"health"},{"id":"auto_other","name":"Other","group":"auto"},{"id":"home_other","name":"Other","group":"home"},{"id":"finance_other","name":"Other","group":"finance"},{"id":"travel_other","name":"Other","group":"travel"},{"id":"edu_other","name":"Other","group":"edu"},{"id":"event_other","name":"Other","group":"event"},{"id":"family_other","name":"Other","group":"family"},{"id":"biz_other","name":"Other","group":"biz"},{"id":"community_other","name":"Other","group":"community"}];
  const GROUPS={beauty:'nail',food:'food',shop:'market',health:'clinic',auto:'dealer',home:'remodel',finance:'tax',travel:'tour',edu:'vietschool',event:'planner',family:'pet',biz:'software',community:'association'};
  const esc=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=text=>String(text||'').replace(/^[^\p{L}\p{N}]+/u,'').replace(/\s+/g,' ').trim();
  const label=text=>text;
  const iconFor=(value,text,group=false)=>{
    let key=group?GROUPS[value]:value;
    if(!group&&!window.NEXORA_DEAL_INDUSTRY_FILES.includes(key))key=INDUSTRIES.find(row=>row.name.toLowerCase()===String(text).toLowerCase())?.id||key;
    if(/_other$/.test(key))key=GROUPS[key.slice(0,-6)];
    if(!window.NEXORA_DEAL_INDUSTRY_FILES?.includes(key))key=/nail|làm đẹp|beauty/i.test(text)?'nail':/food|ăn uống|restaurant/i.test(text)?'food':/dịch vụ|services/i.test(text)?'software':'';
    return key&&window.NEXORA_DEAL_INDUSTRY_FILES?.includes(key)?new URL('industry/'+key+'.png',BASE).href:new URL('issue-2040-oneqr-store-3d.png',BASE).href;
  };
  function syncState(select,control){
    control.wrapper.classList.remove('in','select','field','demo-input','hidden','hide');
    control.wrapper.style.maxWidth='';
    control.wrapper.hidden=select.hidden||select.classList.contains('hidden')||select.classList.contains('hide');
    if(control.isDisabled!==select.disabled){if(select.disabled)control.disable();else control.enable();}
  }
  function enhance(select,options={}){
    if(!select||!window.TomSelect)return;
    const value=select.value,seen=new Set(),rows=[];
    // TomSelect may append a second empty option. Canonicalize native options
    // before comparing, so opening or searching cannot trigger a rebuild loop.
    for(const option of [...select.options]){
      if(seen.has(option.value)){option.remove();continue;}
      seen.add(option.value);
      rows.push({value:option.value,text:clean(label(option.textContent)),disabled:option.disabled,icon:option.dataset.dealIcon||iconFor(option.value,option.textContent,options.group)});
    }
    if(select.value!==value)select.value=value;
    const signature=JSON.stringify(rows);
    if(select.tomselect){
      if(select.dataset.dealSelectOptions!==signature){const control=select.tomselect;control.clear(true);control.clearOptions();control.addOptions(rows);control.setValue(value,true);control.refreshOptions(false);select.dataset.dealSelectOptions=signature;}
      else if(String(select.tomselect.getValue())!==value)select.tomselect.setValue(value,true);
      syncState(select,select.tomselect);
      return select.tomselect;
    }
    const render=data=>`<div class="deal-select-choice">${options.industry&&data.value?`<img src="${esc(data.icon||iconFor(data.value,data.text,options.group))}" alt="" width="24" height="24">`:''}<span>${esc(data.text)}</span></div>`;
    select.dataset.dealSelectOptions=signature;
    const control=new window.TomSelect(select,{create:false,placeholder:options.placeholder||'Select',maxItems:1,maxOptions:null,allowEmptyOption:true,hideSelected:false,closeAfterSelect:true,options:rows,searchField:['text'],render:{option:render,item:render}});
    syncState(select,control);
    control.wrapper.classList.add('deal-library-select');
    control.control_input?.setAttribute('aria-label',options.label||select.getAttribute('aria-label')||'Search');
    return control;
  }
  function field(id,labelText,source){
    let wrapper=document.getElementById('deal-field-'+id);
    if(!wrapper){wrapper=document.createElement('label');wrapper.className='deal-select-field';wrapper.id='deal-field-'+id;const caption=document.createElement('span');caption.className='deal-select-label';caption.textContent=labelText;const select=document.createElement('select');select.id='deal-select-'+id;select.setAttribute('aria-label',labelText);wrapper.append(caption,select);source.before(wrapper);}
    return wrapper.querySelector('select');
  }
  function chips(id,attribute,labelText,options={}){
    const source=document.getElementById(id);if(!source)return;
    const buttons=[...source.querySelectorAll('button['+attribute+']')];if(!buttons.length){const old=document.getElementById('deal-field-'+id);if(old)old.hidden=true;return;}
    const select=field(id,labelText,source);
    select.parentElement.hidden=false;
    const rows=buttons.map(button=>{const copy=button.cloneNode(true);copy.querySelectorAll('.vi').forEach(el=>el.remove());return {value:button.getAttribute(attribute),text:clean(copy.textContent),selected:button.classList.contains('on')||button.classList.contains('active')};});
    const signature=JSON.stringify(rows.map(row=>[row.value,row.text]));
    if(select.dataset.sourceOptions!==signature){select.replaceChildren(...rows.map(row=>new Option(row.text,row.value)));select.dataset.sourceOptions=signature;}
    select.value=rows.find(row=>row.selected)?.value||rows[0].value;
    if(!select.dataset.dealChange){select.dataset.dealChange='1';select.addEventListener('change',()=>{const current=document.getElementById(id);const choice=[...current.querySelectorAll('button['+attribute+']')].find(button=>button.getAttribute(attribute)===select.value);choice?.click();});}
    if(options.buttonsOnly)buttons.forEach(button=>button.classList.add('deal-filter-source'));
    else source.classList.add('deal-filter-source');
    enhance(select,{...options,label:labelText});
  }
  function data(id,labelText,source,rows,value,onChange,options={}){
    if(!source)return;
    const select=field(id,labelText,source),signature=JSON.stringify(rows);
    if(select.dataset.sourceOptions!==signature){select.replaceChildren(...rows.map(row=>new Option(row.text,row.value)));select.dataset.sourceOptions=signature;}
    select.value=value||'';
    select.dealOnChange=onChange;
    if(!select.dataset.dealChange){select.dataset.dealChange='1';select.addEventListener('change',()=>select.dealOnChange(select.value));}
    enhance(select,{...options,label:labelText});
  }
  window.NEXORA_DEAL_SELECTS={enhance,chips,data,iconFor,industries:INDUSTRIES};
})();
