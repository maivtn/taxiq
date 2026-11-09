/* PO discovery cards copied into the main Feed; all actions use existing routes. */
(() => {
  'use strict';
  const base=new URL('./',document.currentScript.src);
  const featuredPageIds=['sample-nail','p1','p3','sample-community','sample-food','sample-cafe'];
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function featuredPages(){
    let saved=window.NEXORA_COMMUNITY_PAGES?.records().pages;
    // The direct Feed runs this script before its Page API is initialized.
    if(!Array.isArray(saved)){try{saved=JSON.parse(localStorage.getItem('nexora-community-templates-v1')||'{}').pages;}catch{}}
    if(!Array.isArray(saved))saved=[];
    const seeds=window.NEXORA_COMMUNITY_DEMO?.extra.pages||[];
    return featuredPageIds.map(id=>saved.find(page=>page.id===id)||seeds.find(page=>page.id===id)).filter(Boolean);
  }
  function pageCategory(page){
    if(page.id==='sample-cafe')return 'Cafe & bakery';
    return ({salon:'Nail salon',community:'Community',food:'Restaurant'})[page.poCategory]||({'Nail & làm đẹp':'Nail salon','Nhà hàng & ăn uống':'Restaurant','Dịch vụ khác':'Business'})[page.industry]||page.industry||'';
  }
  function pageCover(page){
    return page.cover?"background-image:url('"+new URL(page.cover,base).href.replaceAll("'","%27")+"')":'';
  }
  function mount(){
    const feed=document.getElementById('feedView');if(!feed||document.getElementById('communityFeedFooter'))return;
    const pages=featuredPages();
    const footer=document.createElement('div');footer.id='communityFeedFooter';footer.setAttribute('translate','no');
    footer.innerHTML=`<section class="page-discovery-feed" aria-label="Explore sample pages">
      <div class="page-discovery-head"><div><span>DISCOVER COMMUNITY</span><h3>Pages near you</h3></div><button type="button" data-footer-route="pages">See all →</button></div>
      <div class="page-discovery-rail" role="region" tabindex="0" aria-label="Swipe sample pages">${pages.map(page=>`<button type="button" class="page-discovery-card" data-footer-page="${esc(page.id)}" aria-label="View Page ${esc(page.title)}"><span class="page-discovery-photo" style="${esc(pageCover(page))}">${page.isSample?'<b>SAMPLE PAGE</b>':''}</span><span class="page-discovery-info"><strong>${esc(page.title)}</strong><small>${esc(pageCategory(page))} · ${esc(page.city)}</small><em>View Page →</em></span></button>`).join('')}</div>
      <button type="button" class="page-discovery-food-link" data-footer-route="food">🍜 Explore Food &amp; Restaurants →</button>
    </section>
    <section class="live-home"><div><h3>🔴 Livestream in Community</h3><p>Show products, share tips or talk with others.</p></div><button type="button" class="btn primary" data-footer-route="live">Explore livestream →</button></section>
    <button type="button" class="news-teaser" data-footer-route="news"><span class="news-teaser-icon" aria-hidden="true">🗞️</span><span class="news-teaser-copy"><span class="news-kicker">NEWS &amp; UPDATES · SAMPLE</span><strong>Explore the sections in NEXORA Community</strong><small>Read news</small></span><span class="news-teaser-arrow" aria-hidden="true">→</span></button>`;
    footer.addEventListener('click',event=>{
      const button=event.target.closest('[data-footer-route],[data-footer-page]');if(!button)return;
      if(button.dataset.footerPage||button.dataset.footerRoute==='pages'){
        parent.postMessage({type:'nexora-community-page-navigate',pageId:button.dataset.footerPage||'',pageMode:'view',pageScope:'discover'},location.origin);
      }else parent.postMessage({type:'nexora-community-route',route:button.dataset.footerRoute},location.origin);
    });
    const sidebar=feed.querySelector('.feed-posting-tip');
    if(!sidebar){feed.append(footer);return;}
    const desktop=window.matchMedia('(min-width:1024px)');
    function placeFooter(){
      const container=desktop.matches?sidebar:feed;
      if(footer.parentElement!==container)container.append(footer);
    }
    placeFooter();
    window.addEventListener('resize',placeFooter);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
