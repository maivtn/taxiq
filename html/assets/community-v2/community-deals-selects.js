/* Shared illustrated selects for the Community Deals screens. */
(() => {
  'use strict';
  const BASE=new URL('../icon-oneqr/',document.currentScript.src);
  window.NEXORA_DEAL_INDUSTRY_FILES=["acupuncture", "arts", "association", "bakery", "banquet", "bar", "barber", "beautyschool", "bodyshop", "bridal", "bus", "cargo", "carrental", "carwash", "catering", "charity", "chiro", "clean", "clinic", "commercialclean", "convenience", "cosmetic", "daycare", "dealer", "dental", "diet", "drink", "driving", "electronics", "entertain", "equipment", "esl", "eye", "eyewear", "fashion", "fastfood", "fitness", "flight", "floor", "flower", "food", "foodtruck", "furniture", "garage", "hair", "homefood", "homehealth", "hotel", "hotpot", "hvac", "immigration", "import", "injury", "inspection", "insurance", "invest", "jewelry", "kids", "lab", "landscape", "lash", "laundry", "lawyer", "lease", "loan", "locksmith", "market", "marketing", "mechanic", "media", "medspa", "mental", "moving", "music", "nail", "notary", "paint", "pedi", "pest", "pet", "pharm", "photo", "planner", "plumbing", "pmu", "pool", "print", "realtor", "remit", "remodel", "rental", "rentalevent", "ride", "roof", "seafood", "security", "senior", "shoes", "skin", "software", "spa", "specialist", "staffing", "supply", "tax", "techrepair", "telecom", "temple", "tint", "tire", "tour", "tutor", "vegan", "vet", "vietschool", "visa", "vocational", "wax", "yoga"];
  const GROUPS={beauty:'nail',food:'food',shop:'market',health:'clinic',auto:'dealer',home:'remodel',finance:'tax',travel:'tour',edu:'vietschool',event:'planner',family:'pet',biz:'software',community:'association'};
  const esc=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=text=>String(text||'').replace(/^[^\p{L}\p{N}]+/u,'').replace(/\s+/g,' ').trim();
  const label=text=>window.NEXORA_DEAL_PHRASES?.[text]||window.NEXORA_COMMUNITY_I18N?.translateDomain(text)||text;
  const iconFor=(value,text,group=false)=>{
    let key=group?GROUPS[value]:value;
    if(/_other$/.test(key))key=GROUPS[key.slice(0,-6)];
    if(!window.NEXORA_DEAL_INDUSTRY_FILES?.includes(key))key=/nail|làm đẹp|beauty/i.test(text)?'nail':/food|ăn uống|restaurant/i.test(text)?'food':/dịch vụ|services/i.test(text)?'software':'';
    return key&&window.NEXORA_DEAL_INDUSTRY_FILES?.includes(key)?new URL('industry/'+key+'.png',BASE).href:new URL('issue-2040-oneqr-store-3d.png',BASE).href;
  };
  function enhance(select,options={}){
    if(!select||!window.TomSelect)return;
    const rows=[...select.options].map(option=>({value:option.value,text:clean(label(option.textContent)),disabled:option.disabled,icon:option.dataset.dealIcon||iconFor(option.value,option.textContent,options.group)}));
    const signature=JSON.stringify(rows),value=select.value;
    if(select.tomselect){
      select.tomselect.wrapper.classList.remove('in','select','field','demo-input');
      select.tomselect.wrapper.style.maxWidth='';
      if(select.dataset.dealSelectOptions!==signature){const control=select.tomselect;control.clear(true);control.clearOptions();control.addOptions(rows);control.setValue(value,true);control.refreshOptions(false);select.dataset.dealSelectOptions=signature;}
      else if(String(select.tomselect.getValue())!==value)select.tomselect.setValue(value,true);
      select.tomselect.wrapper.hidden=select.hidden||select.classList.contains('hidden')||select.classList.contains('hide');
      return select.tomselect;
    }
    const render=data=>`<div class="deal-select-choice">${options.industry?`<img src="${esc(data.icon||iconFor(data.value,data.text,options.group))}" alt="" width="24" height="24">`:''}<span>${esc(data.text)}</span></div>`;
    select.dataset.dealSelectOptions=signature;
    const control=new window.TomSelect(select,{create:false,maxItems:1,maxOptions:null,allowEmptyOption:true,hideSelected:false,closeAfterSelect:true,options:rows,searchField:['text'],render:{option:render,item:render}});
    control.wrapper.classList.remove('in','select','field','demo-input');
    control.wrapper.style.maxWidth='';
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
  window.NEXORA_DEAL_SELECTS={enhance,chips,data,iconFor};
})();
