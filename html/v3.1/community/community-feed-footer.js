/* PO discovery cards copied into the main Feed; all actions use existing routes. */
(() => {
  'use strict';
  const base=new URL('./',document.currentScript.src);
  const pages=[
    ['sample-food','Bếp Việt Houston','Restaurant','Houston, TX','dbaf5871be9452a3.jpg'],
    ['sample-cafe','Mây Cafe & Bakery','Cafe & bakery','Katy, TX','b22d0f1e982c5559.jpg'],
    ['sample-nail','Hoa Nail Studio','Nail salon','Sugar Land, TX','5cecfe52c32c201a.jpg']
  ];
  function mount(){
    const feed=document.getElementById('feedView');if(!feed||document.getElementById('communityFeedFooter'))return;
    const footer=document.createElement('div');footer.id='communityFeedFooter';footer.setAttribute('translate','no');
    footer.innerHTML=`<section class="page-discovery-feed" aria-label="Explore sample pages">
      <div class="page-discovery-head"><div><span>DISCOVER COMMUNITY</span><h3>Pages near you</h3></div><button type="button" data-footer-route="pages">See all →</button></div>
      <div class="page-discovery-rail" role="region" tabindex="0" aria-label="Swipe sample pages">${pages.map(([id,name,category,area,cover])=>`<button type="button" class="page-discovery-card" data-footer-page="${id}" aria-label="View Page ${name.replaceAll('&','&amp;')}"><span class="page-discovery-photo" style="background-image:url('${new URL('modules/hub-tools/media/'+cover,base).href}')"><b>SAMPLE PAGE</b></span><span class="page-discovery-info"><strong>${name.replaceAll('&','&amp;')}</strong><small>${category} · ${area}</small><em>View Page →</em></span></button>`).join('')}</div>
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
