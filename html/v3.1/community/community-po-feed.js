/* Render the PO Story and People components inside the retained Community Feed. */
(() => {
  'use strict';
  const shortcutAssets=new URL('../../assets/icon-oneqr/',document.currentScript.src);
  const route=(name,context={})=>parent.postMessage({type:'nexora-community-route',route:name,context},location.origin);
  let timer,revision=0,disposed=false;
  function slots(){
    const feed=document.getElementById('feedView'),composer=document.getElementById('feedComposerCard');
    if(!feed||!composer)return null;
    let shortcuts=document.getElementById('communityPOShortcuts');
    if(!shortcuts){
      shortcuts=document.createElement('nav');shortcuts.id='communityPOShortcuts';shortcuts.className='community-po-shortcuts';shortcuts.setAttribute('aria-label','Community features');
      const items=[['shop','store','My storefront','Manage your storefront'],['transfer','hand-coins','Salon transfers','Buy or sell a salon'],['realestate','home','Real Estate','Property listings'],['food','utensils','Food & Restaurants','Food · deals · fanpages']];
      for(const [name,icon,title,description] of items){const button=document.createElement('button');button.type='button';button.dataset.communityShortcut=name;button.className='community-po-shortcut'+(name==='food'?' community-po-shortcut-food':'');button.innerHTML='<span class="community-po-shortcut-icon" aria-hidden="true"><img src="'+new URL('issue-2040-oneqr-'+icon+'-3d.png',shortcutAssets).href+'" width="30" height="30" alt="" draggable="false"></span><span class="community-po-shortcut-copy"><strong>'+title+'</strong><small>'+description+'</small></span><span class="community-po-shortcut-arrow" aria-hidden="true">→</span>'+(name==='food'?'<span class="community-po-shortcut-badge">FEATURED</span>':'');shortcuts.append(button);}
      composer.before(shortcuts);
    }
    let stories=document.getElementById('communityPOStories'),people=document.getElementById('communityPOPeople');
    if(!stories){stories=document.createElement('div');stories.id='communityPOStories';stories.className='community-po-feed';stories.hidden=true;composer.after(stories);}
    if(!people){people=document.createElement('div');people.id='communityPOPeople';people.className='community-po-feed';people.hidden=true;}
    if(people.previousElementSibling!==stories)stories.after(people);
    const visible=!feed.classList.contains('hide')&&!feed.classList.contains('deal-mode');
    shortcuts.hidden=!visible;
    stories.hidden=!visible||!stories.firstElementChild;people.hidden=!visible||!people.firstElementChild;
    return {feed,stories,people,visible};
  }
  async function refresh(){
    const elements=slots(),broker=parent.NEXORA_COMMUNITY_FEED;
    if(!elements?.visible||!broker||disposed)return;
    const current=++revision;
    try{
      const preview=await broker.preview();if(!preview||current!==revision||disposed)return;
      for(const key of ['stories','people']){
        const node=elements[key],markup=preview[key]||'';
        if(node.dataset.markup!==markup){const rail=node.querySelector('[role="region"]'),offset=rail?.scrollLeft||0;node.innerHTML=markup;node.dataset.markup=markup;const next=node.querySelector('[role="region"]');if(next)next.scrollLeft=offset;}
        node.hidden=!markup||!slots().visible;
      }
    }catch(error){console.error('Community PO Feed',error);}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(refresh,80);}
  document.addEventListener('click',async event=>{
    const shortcut=event.target.closest('[data-community-shortcut]');if(shortcut){event.preventDefault();route(shortcut.dataset.communityShortcut);return;}
    const root=event.target.closest('#communityPOStories,#communityPOPeople');if(!root)return;
    const button=event.target.closest('button');if(!button)return;
    event.preventDefault();event.stopPropagation();
    if(button.dataset.action==='story-compose')route('stories',{composeStory:'1'});
    else if(button.dataset.storyOpen)route('stories',{storyId:button.dataset.storyOpen});
    else if(button.dataset.action==='people-all')route('people',{peopleView:'all'});
    else if(button.dataset.personView)route('people',{personId:button.dataset.personView});
    else if(button.dataset.friendInbox)route('people',{peopleView:'received'});
    else if(button.dataset.personConnect){button.disabled=true;try{parent.NEXORA_COMMUNITY_FEED.request(button.dataset.personConnect);}finally{button.disabled=false;schedule();}}
  });
  window.addEventListener('nexora-po-feed-refresh',schedule);
  window.addEventListener('storage',event=>{if(!event.key||event.key.startsWith('nexora-'))schedule();});
  window.addEventListener('pagehide',()=>{disposed=true;clearTimeout(timer);});
  function start(){const feed=document.getElementById('feedView');if(!feed)return;new MutationObserver(schedule).observe(feed,{attributes:true,attributeFilter:['class']});schedule();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
