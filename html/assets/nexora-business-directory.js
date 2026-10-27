/* Connected-business destination linked by Salon Home, from the PO public Home. */
(function(){'use strict';
const mount=document.getElementById('nxw-start');if(!mount)return;
mount.insertAdjacentHTML('beforebegin',"<section class=\"industry-section nxw-directory\" id=\"connected-businesses\" aria-labelledby=\"industry-title\">\n      <div class=\"industry-heading\"><div><span class=\"section-kicker\">EXPLORE BY INDUSTRY</span><h2 id=\"industry-title\">A home for connected businesses</h2><p>Explore business profiles by industry. Only verified profiles will appear in the public directory.</p></div><span class=\"industry-demo-note\">Directory preview</span></div>\n      <div class=\"industry-tabs\" id=\"industry-tabs\" role=\"group\" aria-label=\"Industry category\"></div>\n      <div class=\"industry-display\" id=\"industry-display\" aria-live=\"polite\"><div class=\"industry-overview\"><span class=\"industry-index\" id=\"industry-index\"></span><h3 id=\"industry-name\"></h3><p id=\"industry-description\"></p><div class=\"industry-tags\" id=\"industry-tags\"></div></div><div class=\"industry-profile\" id=\"industry-profile\"><div class=\"industry-profile-cover\"><small id=\"industry-profile-label\"></small><span class=\"industry-profile-location\" id=\"industry-profile-location\"></span></div><div class=\"industry-profile-body\"><div class=\"industry-profile-main\"><div class=\"industry-avatar\" aria-hidden=\"true\" id=\"industry-avatar\"></div><div class=\"industry-profile-identity\"><span id=\"industry-business-type\"></span><h4 id=\"industry-business-name\"></h4></div></div><p id=\"industry-business-description\"></p><a class=\"industry-profile-story\" id=\"industry-profile-story\" hidden=\"\"></a><div class=\"industry-profile-footer\" id=\"industry-profile-footer\"></div></div></div></div>\n      <div class=\"industry-directory\" aria-labelledby=\"industry-directory-title\"><div class=\"industry-directory-head\"><div><span id=\"industry-directory-kicker\">SAMPLE</span><h3 id=\"industry-directory-title\">Businesses in this industry</h3></div></div><div class=\"industry-directory-grid\" id=\"industry-directory-grid\" role=\"group\" aria-labelledby=\"industry-directory-title\"></div><p id=\"industry-directory-note\">Sample data · not a public customer list</p></div>\n    </section>");
const codes=['en'],current='en';
const dict={en:{"industryVisualKicker":"FOR SERVICE BUSINESSES","industryVisualTitle":"One platform, many ways to work","industryNail":"Nails & beauty","industryHair":"Hair & barber","industrySpa":"Spa & wellness","industryRestaurant":"Restaurants & dining","industryKicker":"EXPLORE BY INDUSTRY","industryTitle":"A home for connected businesses","industryBody":"Explore business profiles by industry. Only verified profiles will appear in the public directory.","industryDemo":"Directory preview","industrySector":"Industry category","industryProfileDemo":"SAMPLE PROFILE","industryProfileEmpty":"NO PUBLIC PROFILE YET","industrySampleBody":"Bitcoin Nail Bar is a sample profile in this design, not a confirmed public partner listing.","industryEmptyBody":"Profiles will appear here when businesses approve publication of their name, logo, and details.","industrySampleFooter":"Sample data · not a public customer list","industryEmptyFooter":"Ready for approved business profiles"}};
const industrySectors=[{"key":"nail","icon":"✦","monogram":"BN","sample":true,"photo":"../assets/nexora-welcome/pos.jpg","name":["Nail & beauty"],"description":["A place to present nail salons, the guest journey, and in-salon experiences."]},{"key":"hair","icon":"✂","monogram":"✂","sample":false,"photo":"../assets/nexora-welcome/community.jpg","name":["Hair & barber"],"description":["A category for hair salons and barbers to present their services and individual style."]},{"key":"spa","icon":"❋","monogram":"❋","sample":false,"photo":"../assets/nexora-welcome/industry-spa.jpg","name":["Spa & wellness"],"description":["A space for spas, skincare, and wellness services organized by business profile."]},{"key":"restaurant","icon":"🍽","monogram":"🍽","sample":false,"photo":"../assets/nexora-welcome/industry-restaurant.jpg","name":["Restaurants & dining"],"description":["Present restaurants, cafés and dining experiences through menus, ambience, hours and reservation details."]},{"key":"other","icon":"◇","monogram":"◇","sample":false,"photo":"../assets/nexora-welcome/aihub-marketing.jpg","name":["Other services"],"description":["Other service industries can receive their own categories when approved profiles are available."]}];
const directoryLabels={en:{"title":"Businesses in this industry","sample":"SAMPLE","verified":"VERIFIED","verifiedNote":"The business approved publication of its profile.","view":"View business profile ↗"}};
const industrySalonIntro={en:"BITCOIN NAIL BAR is the Houston salon operated by Brian Nguyen and NEXORA TOUCH’s first real-world pilot."};
const industrySalonStory={en:"Read the salon story ↗"};
    const previewBusinesses=Array.isArray(window.NEXORA_DIRECTORY_SAMPLES)?window.NEXORA_DIRECTORY_SAMPLES:[];
    const publicBusinesses=Array.isArray(window.NEXORA_CONNECTED_BUSINESSES)?window.NEXORA_CONNECTED_BUSINESSES.filter(record=>record&&record.connected===true&&record.verified===true&&record.publishConsent===true&&record.public===true&&typeof record.id==='string'&&record.id.trim()&&typeof record.name==='string'&&record.name.trim()):[];
    function businessesFor(sectorKey){
      const published=publicBusinesses.filter(record=>record.sector===sectorKey);
      return published.length?published:previewBusinesses.filter(record=>record.sector===sectorKey).map(record=>({...record,demo:true}));
    }
    function safeDirectoryLink(value){
      if(typeof value!=='string'||!value.trim())return '';
      const raw=value.trim();
      try{const url=new URL(raw,location.href);const absolute=/^[a-z][a-z\d+.-]*:/i.test(raw)||raw.startsWith('//');return url.protocol==='https:'||(!absolute&&url.origin===location.origin)?url.href:'';}catch{return '';}
    }
    const requestedParams=new URLSearchParams(location.search);
    const requestedIndustry=requestedParams.get('industry');
    let selectedBusinessId=requestedParams.get('business');
    let selectedIndustry = Math.max(0,industrySectors.findIndex(sector=>sector.key===requestedIndustry));
    function renderIndustry() {
      const index=codes.indexOf(current);
      const labels=directoryLabels[current];
      const tabs=document.getElementById('industry-tabs');
      tabs.setAttribute('aria-label',dict[current].industrySector);
      tabs.replaceChildren(...industrySectors.map((sector,sectorIndex)=>{
        const button=document.createElement('button'); button.type='button';
        button.textContent=`${sector.icon}  ${sector.name[index]}`;
        button.setAttribute('aria-pressed',String(sectorIndex===selectedIndustry));
        button.addEventListener('click',()=>{ selectedIndustry=sectorIndex; selectedBusinessId=null; renderIndustry(); });
        return button;
      }));
      const sector=industrySectors[selectedIndustry];
      const businesses=businessesFor(sector.key);
      const business=businesses.find(record=>record.id===selectedBusinessId)||businesses[0]||null;
      selectedBusinessId=business?.id||null;
      document.querySelector('#industry-display .industry-overview').style.setProperty('--industry-photo',`url("${sector.photo}")`);
      document.getElementById('industry-index').textContent=dict[current].industrySector;
      document.getElementById('industry-name').textContent=sector.name[index];
      document.getElementById('industry-description').textContent=sector.description[index];
      const tags=document.getElementById('industry-tags');
      const tag=document.createElement('span'); tag.textContent=dict[current].industryDemo;
      tags.replaceChildren(tag);
      const profile=document.getElementById('industry-profile');
      profile.dataset.sector=sector.key;
      profile.dataset.tone=business?.tone||'';
      profile.classList.toggle('has-logo',Boolean(business?.logo));
      document.getElementById('industry-profile-label').textContent=business?.demo?dict[current].industryProfileDemo:business?labels.verified:dict[current].industryProfileEmpty;
      document.getElementById('industry-profile-location').textContent=business?.location||'';
      const avatar=document.getElementById('industry-avatar');
      if(business?.logo){const logo=document.createElement('img');logo.src=business.logo;logo.alt='';logo.decoding='async';avatar.replaceChildren(logo);}else{avatar.textContent=business?.monogram||sector.monogram;}
      document.getElementById('industry-business-name').textContent=business?.name||sector.name[index];
      document.getElementById('industry-business-type').textContent=business?sector.name[index]:'';
      document.getElementById('industry-business-description').textContent=business?.id==='bitcoin-nail-bar'?industrySalonIntro[current]:business?.summary?(business.summary[current]||((current==='vi'||current==='en')?business.summary.en:sector.description[index])):dict[current].industryEmptyBody;
      const story=document.getElementById('industry-profile-story');
      const storyUrl=safeDirectoryLink(business?.story?(business.story[current]||business.story.en):business?.profileUrl);
      story.hidden=!storyUrl;
      if(!story.hidden){story.textContent=business.id==='bitcoin-nail-bar'?industrySalonStory[current]:labels.view;story.href=storyUrl;}
      document.getElementById('industry-profile-footer').textContent=business?.demo?dict[current].industrySampleFooter:business?labels.verifiedNote:dict[current].industryEmptyFooter;
      document.getElementById('industry-directory-kicker').textContent=business?.demo?dict[current].industryProfileDemo:labels.verified;
      document.getElementById('industry-directory-title').textContent=labels.title;
      document.getElementById('industry-directory-note').textContent=business?.demo?dict[current].industrySampleFooter:labels.verifiedNote;
      const grid=document.getElementById('industry-directory-grid');
      grid.replaceChildren(...businesses.map(record=>{
        const button=document.createElement('button');button.type='button';button.className='industry-directory-card';button.dataset.businessId=record.id;button.dataset.tone=record.tone||'';button.setAttribute('aria-pressed',String(record.id===selectedBusinessId));button.setAttribute('aria-label',record.name);
        const mark=document.createElement('span');mark.className='industry-directory-mark';mark.setAttribute('aria-hidden','true');
        if(record.logo){const img=document.createElement('img');img.src=record.logo;img.alt='';img.decoding='async';mark.append(img);}else{mark.textContent=record.monogram||'◇';}
        const copy=document.createElement('span');copy.className='industry-directory-copy';
        const badge=document.createElement('small');badge.textContent=record.demo?labels.sample:labels.verified;
        const name=document.createElement('strong');name.textContent=record.name;
        const type=document.createElement('span');type.textContent=sector.name[index];
        copy.append(badge,name,type);
        const arrow=document.createElement('span');arrow.className='industry-directory-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';
        button.append(mark,copy,arrow);
        button.addEventListener('click',()=>{selectedBusinessId=record.id;renderIndustry();[...document.querySelectorAll('.industry-directory-card')].find(item=>item.dataset.businessId===record.id)?.focus();});
        return button;
      }));
    }

renderIndustry();
if(location.hash==='#connected-businesses')document.getElementById('connected-businesses').scrollIntoView();
})();
