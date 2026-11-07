/* Render the PO Story and People components inside the retained Community Feed. */
(() => {
  'use strict';
  const route=(name,context={})=>parent.postMessage({type:'nexora-community-route',route:name,context},location.origin);
  let timer,revision=0,disposed=false;
  function slots(){
    const feed=document.getElementById('feedView'),composer=document.getElementById('feedComposerCard');
    if(!feed||!composer)return null;
    let stories=document.getElementById('communityPOStories'),people=document.getElementById('communityPOPeople');
    if(!stories){stories=document.createElement('div');stories.id='communityPOStories';stories.className='community-po-feed';stories.hidden=true;composer.after(stories);}
    if(!people){people=document.createElement('div');people.id='communityPOPeople';people.className='community-po-feed';people.hidden=true;const posts=document.getElementById('feedPosts');(posts||stories).before(people);}
    const visible=!feed.classList.contains('hide')&&!feed.classList.contains('deal-mode');
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
