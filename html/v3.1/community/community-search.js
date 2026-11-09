/* Community's header search uses the existing directory and friend relationships. */
(() => {
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normal=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const icons={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',clock:'<circle cx="12" cy="12" r="8" fill="currentColor" stroke="none"/><path d="M12 7v5l3 2" stroke="white"/>',more:'<circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/>',like:'<path d="M7 10v11H3V10Zm0 1 5-8c2 0 3 2 2 5l-1 2h6a2 2 0 0 1 2 2l-2 7a3 3 0 0 1-3 2H7"/>',check:'<path d="m5 12 4 4L19 6"/>'};
  const svg=name=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[name]+'</svg>';
  function mount({directory,baseURL,navigate,feed}) {
    if(window.NEXORA_COMMUNITY_SEARCH.instance)return window.NEXORA_COMMUNITY_SEARCH.instance;
    const shared=window.NEXORA_COMMUNITY_SHARED,key='nexora-community-search-v1:'+encodeURIComponent(shared.member);
    let stored;
    try{stored=JSON.parse(localStorage.getItem(key)||'null');}catch{}
    const state={recent:Array.isArray(stored?.recent)?stored.recent.filter(value=>typeof value==='string').slice(0,20):['blog','setting'],hidden:Array.isArray(stored?.hidden)?stored.hidden:[],hideLiked:stored?.hideLiked===true};
    let ready=false,failed=false,likedOnly=false,opener=null,suppressFocus=false,scrollPositions=[],scrollMode='auto';
    const dialog=document.createElement('dialog');dialog.id='community-search-dialog';dialog.className='community-search-dialog';dialog.setAttribute('aria-label','Search Community');
    dialog.innerHTML='<form class="community-search-head" role="search"><button type="button" data-search-close aria-label="Close">'+svg('close')+'</button><input name="query" type="search" placeholder="Search..." aria-label="Search Community" autocomplete="off" maxlength="120"><button type="submit" aria-label="Search">'+svg('search')+'</button></form><div class="community-search-body"></div><p class="community-search-status" role="status" aria-live="polite"></p>';
    document.body.append(dialog);
    const input=dialog.querySelector('input'),body=dialog.querySelector('.community-search-body'),status=dialog.querySelector('[role="status"]');
    const sections=[['feed','Feed'],['groups','Groups & Market'],['pages','Pages'],['friends','Friends'],['jobs','Jobs'],['shift','Extra shifts'],['deals','Deals & Coupons'],['blog','Blog'],['connect','Messages & Calls'],['privacy','Settings'],['food','Food Community'],['realestate','Real Estate'],['shop','My storefront'],['reels','Reels'],['news','News & Blog']];
    function save(){try{localStorage.setItem(key,JSON.stringify(state));return true;}catch{status.textContent='Something went wrong. Please try again.';return false;}}
    function remember(query){if(!query)return;state.recent=[query,...state.recent.filter(value=>normal(value)!==normal(query))].slice(0,20);save();}
    function relationships(){return directory.state();}
    function suggestions(){const social=relationships();return directory.list().filter(person=>person.name!==shared.member&&!state.hidden.includes(person.id)&&!social.friends.includes(person.id)&&!social.sent.includes(person.id)&&!social.received.includes(person.id));}
    function photo(person,index){
      let image='';try{const url=new URL(person.avatar,baseURL);if(person.avatar&&['http:','https:'].includes(url.protocol))image=url.href;}catch{}
      if(image)return '<img src="'+esc(image)+'" alt="" loading="lazy">';
      return '<span class="community-search-photo" style="--avatar-x:'+((index%3)*50)+'%;--avatar-y:'+(index%2?100:0)+'%" aria-hidden="true"></span>';
    }
    function personCard(person,index){return '<article class="community-search-person"><button type="button" class="community-search-profile" data-search-person="'+esc(person.id)+'" aria-label="'+esc(person.name)+'">'+photo(person,index)+'<strong>'+esc(person.name)+(person.verified?'<span class="community-search-verified" aria-label="Verified">'+svg('check')+'</span>':'')+'</strong><small>'+esc(person.city||person.area||person.handle||'')+'</small></button><div class="community-search-person-actions"><button type="button" data-search-add="'+esc(person.id)+'">Add friend</button><button type="button" data-search-hide="'+esc(person.id)+'">Remove</button></div></article>';}
    function renderHome(){
      body.innerHTML='<section class="community-search-section"><div class="community-search-section-head"><h2>Recent</h2></div>'+state.recent.map(query=>'<div class="community-search-recent"><button type="button" data-search-recent="'+esc(query)+'"><span class="community-search-clock">'+svg('clock')+'</span><span>'+esc(query)+'</span></button><button type="button" class="community-search-more" data-search-options="'+esc(query)+'" aria-label="More actions: '+esc(query)+'" aria-expanded="false">'+svg('more')+'</button><button type="button" class="community-search-remove" data-search-remove="'+esc(query)+'" hidden>Remove</button></div>').join('')+(!state.hideLiked?'<div class="community-search-recent"><button type="button" data-search-liked><span class="community-search-liked">'+svg('like')+'</span><span>Your liked posts<small>See posts you\'ve liked</small></span></button><button type="button" class="community-search-more" data-search-options-liked aria-label="More actions: Your liked posts" aria-expanded="false">'+svg('more')+'</button><button type="button" class="community-search-remove" data-search-remove-liked hidden>Remove</button></div>':'')+'</section><section class="community-search-section"><h2>People you may know</h2><div class="community-search-people">'+(ready?suggestions().slice(0,12).map(personCard).join(''):'')+'</div></section>';
      status.textContent=failed?'Something went wrong. Please try again.':ready?'':'Loading…';
      if(failed)body.insertAdjacentHTML('beforeend','<button type="button" data-search-retry>Try again</button>');
    }
    function posts(query){return feed.contentWindow?.NEXORA_COMMUNITY_FEED_SOCIAL?.findPosts?.(query,likedOnly)||[];}
    function renderResults(){
      const query=input.value.trim(),people=ready&&!likedOnly?directory.search(query):[];
      const matches=likedOnly?[]:sections.filter(([route,label])=>shared.canAccessFeature(route)&&normal(label).includes(normal(query)));
      const foundPosts=posts(query);
      body.innerHTML=(likedOnly?'<h2>Your liked posts</h2>':'')+(people.length?'<section class="community-search-section"><h2>People</h2>'+people.map((person,index)=>{const social=relationships(),friend=social.friends.includes(person.id),sent=social.sent.includes(person.id);return '<div class="community-search-hit"><button type="button" class="community-search-hit-person" data-search-person="'+esc(person.id)+'">'+photo(person,index)+'<span><strong>'+esc(person.name)+'</strong><small>'+esc(person.handle||'')+'</small></span></button>'+(!friend?'<button type="button" data-search-add="'+esc(person.id)+'"'+(sent?' data-sent="true"':'')+'>'+(sent?'Cancel request':social.received.includes(person.id)?'Accept':'Add friend')+'</button>':'')+'</div>';}).join('')+'</section>':'')+(matches.length?'<section class="community-search-section"><h2>Community</h2>'+matches.map(([route,label])=>'<button type="button" class="community-search-result" data-search-route="'+route+'">'+svg('search')+'<strong>'+esc(label)+'</strong></button>').join('')+'</section>':'')+(foundPosts.length?'<section class="community-search-section">'+(!likedOnly?'<h2>Posts</h2>':'')+foundPosts.map(post=>'<button type="button" class="community-search-result community-search-post" data-search-post="'+esc(post.id)+'"><strong>'+esc(post.owner)+'</strong><span>'+esc(post.title||post.body)+'</span></button>').join('')+'</section>':'');
      status.textContent=failed?'Something went wrong. Please try again.':!ready?'Loading…':!people.length&&!matches.length&&!foundPosts.length?'No results found.':'';
    }
    function render(){if(likedOnly||input.value.trim())renderResults();else renderHome();}
    async function load(){failed=false;render();try{await directory.ready();ready=true;}catch{failed=true;}if(dialog.open)render();}
    function focusOpener(){suppressFocus=true;opener?.focus({preventScroll:true});queueMicrotask(()=>{suppressFocus=false;});}
    function release(){
      dialog.close();document.querySelectorAll('.shell-search-toggle').forEach(button=>button.setAttribute('aria-expanded','false'));focusOpener();
      const restore=()=>{for(const [element,left,top]of scrollPositions)element.scrollTo({left,top,behavior:'instant'});};
      restore();requestAnimationFrame(()=>{if(!dialog.open){restore();history.scrollRestoration=scrollMode;}});
    }
    function close(){if(history.state?.communitySearch){history.back();}else release();}
    function leave(){const value={...history.state};delete value.communitySearch;history.replaceState(value,'',location.href);release();}
    function open(query=''){
      if(suppressFocus||dialog.open)return;
      opener=document.activeElement;input.value=String(query).slice(0,120);likedOnly=false;
      scrollPositions=[document.scrollingElement,...document.querySelectorAll('.community-v2-content .native-body,.community-v2-content .workspace,.community-v2-content .community-extra-pane')].filter(Boolean).map(element=>[element,element.scrollLeft,element.scrollTop]);
      scrollMode=history.scrollRestoration;history.scrollRestoration='manual';
      history.pushState({...history.state,communitySearch:true},'',location.href);render();dialog.showModal();input.focus();
      document.querySelectorAll('.shell-search-toggle').forEach(button=>button.setAttribute('aria-expanded','true'));
      load();
    }
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    window.addEventListener('popstate',event=>{if(dialog.open&&!history.state?.communitySearch){event.stopImmediatePropagation();release();}},true);
    dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();likedOnly=false;remember(input.value.trim());render();});
    input.addEventListener('input',()=>{likedOnly=false;render();});
    dialog.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button)return;
      const data=button.dataset;
      if('searchClose' in data){close();return;}
      if('searchRetry' in data){load();return;}
      if('searchRecent' in data){input.value=data.searchRecent;remember(input.value);render();input.focus();return;}
      if('searchLiked' in data){likedOnly=true;input.value='';render();return;}
      if('searchOptions' in data||'searchOptionsLiked' in data){const remove=button.parentElement.querySelector('.community-search-remove');remove.hidden=!remove.hidden;button.setAttribute('aria-expanded',String(!remove.hidden));return;}
      if('searchRemove' in data||'searchRemoveLiked' in data){const previous={...state,recent:[...state.recent]};if('searchRemoveLiked' in data)state.hideLiked=true;else state.recent=state.recent.filter(value=>value!==data.searchRemove);if(!save())Object.assign(state,previous);else render();return;}
      if(data.searchHide){state.hidden.push(data.searchHide);if(save())render();else state.hidden.pop();return;}
      if(data.searchAdd){button.disabled=true;const success=data.sent?directory.cancelRequest(data.searchAdd):directory.addFriend(data.searchAdd);button.disabled=false;if(success){render();status.textContent=data.sent?'Request cancelled.':'Friend request sent.';}else status.textContent='Something went wrong. Please try again.';return;}
      if(data.searchPerson){leave();navigate('people',{personId:data.searchPerson});return;}
      if(data.searchRoute){remember(input.value.trim());leave();navigate(data.searchRoute);return;}
      if(data.searchPost){const id=data.searchPost;leave();navigate('feed');feed.contentWindow?.NEXORA_COMMUNITY_FEED_SOCIAL?.openPost(id);}
    });
    directory.subscribe(()=>{if(dialog.open&&ready)render();});
    feed.addEventListener('load',()=>{if(dialog.open)render();});
    const api={open,isOpen:()=>dialog.open};window.NEXORA_COMMUNITY_SEARCH.instance=api;return api;
  }
  window.NEXORA_COMMUNITY_SEARCH={mount};
})();
