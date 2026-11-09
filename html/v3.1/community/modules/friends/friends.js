/* Friends management uses the same identities and requests as Feed and Find people. */
(() => {
  'use strict';
  const directory=window.NEXORA_COMMUNITY_PEOPLE;
  const $=id=>document.getElementById(id),grid=$('friendsGrid'),empty=$('friendsEmpty'),search=$('friendsSearch'),dialog=$('unfriendDialog');
  const sampleAvatars=new Map([['Kim Tuyen',['0%','0%']],['Sally Thanh Hoang',['50%','0%']],['Linh Nguyễn',['100%','0%']],['Thảo Lê',['0%','100%']],['Hà Nguyễn',['50%','100%']],['Jessica Nguyen',['100%','100%']]]);
  const tabs={all:'All friends',received:'Friend requests',suggestions:'People you may know',sent:'Sent requests',following:'Following',followers:'Followers'};
  const emptyText={all:'No friends yet.',received:'No new friend requests.',suggestions:'No suggestions right now.',sent:'No sent requests.',following:'No following yet.',followers:'No followers yet.'};
  let tab='all',query='',active=false,unsubscribe,toastTimer,unfriendId='',returnFocusId='',generation=0;
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const icon=name=>window.lucide?.icons[name]?window.lucide.createElement(window.lucide.icons[name],{width:18,height:18,'aria-hidden':'true',focusable:'false'}).outerHTML:'';
  const route=(route,context={})=>parent.postMessage({type:'nexora-community-route',route,context},location.origin);
  function notice(message){clearTimeout(toastTimer);$('friendsStatus').textContent=message;$('friendsStatus').hidden=false;toastTimer=setTimeout(()=>{$('friendsStatus').hidden=true;},3500);}
  function lists(){
    const state=directory.state(),people=directory.list(),pick=ids=>people.filter(person=>ids.includes(person.id));
    const shared=window.NEXORA_COMMUNITY_SHARED,follows=shared.read().personalFollows||{};
    return {following:people.filter(p=>(follows[shared.member]||[]).includes(p.name)),followers:people.filter(p=>(follows[p.name]||[]).includes(shared.member)),all:pick(state.friends),received:pick(state.received),sent:pick(state.sent),suggestions:people.filter(person=>![...state.friends,...state.received,...state.sent].includes(person.id))};
  }
  function button(action,id,label,primary=true,glyph=''){
    return '<button type="button" class="friends-button'+(primary?'':' secondary')+'" data-friend-action="'+action+'" data-person-id="'+esc(id)+'">'+icon(glyph)+'<span>'+label+'</span></button>';
  }
  function card(person){
    const name=esc(person.name),id=esc(person.id),initials=esc(person.name.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase());
    const sample=sampleAvatars.get(person.name);
    const avatar=person.avatar&&/^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(person.avatar)?'<img src="'+esc(person.avatar)+'" alt="" loading="lazy">':sample?'<span class="friends-sample-avatar" style="background-position:'+sample.join(' ')+'"></span>':initials;
    if(tab==='received'){
      const shared=window.NEXORA_COMMUNITY_SHARED,sampleRequest=(shared.read().friendRequests||[]).some(row=>row.from===person.name&&row.to===shared.member&&row.status==='pending'&&row.isSample);
      const detail=[person.roleEn||(person.kind==='business'?'Business':'Member'),person.city||person.area].filter(Boolean).join(' · ');
      return '<article class="friends-card friend-request-card" data-friend-card="'+id+'"><div class="friends-avatar" aria-hidden="true">'+avatar+'</div><div class="friend-request-info"><h3 data-user-text><a href="#" data-friend-action="profile" data-person-id="'+id+'">'+name+'</a></h3><p class="friends-handle" data-user-text>'+esc(person.handle||'')+'</p><p class="friends-detail" data-user-text>'+esc(detail)+'</p><div class="friends-actions friend-request-actions">'+button('accept',id,'Confirm')+button('decline',id,'Delete',false)+'</div></div>'+(sampleRequest?'<span class="friend-sample">SAMPLE</span>':'')+'</article>';
    }
    let actions='',menu='';
    if(tab==='following'||tab==='followers'){actions=button('message',id,'Message',true,'MessageCircle')+button('follow',id,(window.NEXORA_COMMUNITY_SHARED.read().personalFollows?.[window.NEXORA_COMMUNITY_SHARED.member]||[]).includes(person.name)?'Following':'Follow back',false);}
    else if(tab==='all'){
      actions=button('message',id,'Message',true,'MessageCircle');
      menu='<div class="friends-menu-wrap"><button type="button" class="friends-icon-button" data-friend-action="menu" data-person-id="'+id+'" aria-label="Options for '+name+'" aria-expanded="false" aria-controls="friend-menu-'+id+'">'+icon('Ellipsis')+'</button><div id="friend-menu-'+id+'" class="friends-card-menu" hidden><button type="button" data-friend-action="unfriend" data-person-id="'+id+'">'+icon('UserRoundMinus')+'<span>Unfriend</span></button></div></div>';
    }else if(tab==='received')actions=button('accept',id,'Confirm',true,'Check')+button('decline',id,'Delete',false,'X');
    else if(tab==='sent')actions=button('cancel',id,'Cancel request',false,'X');
    else actions=button('add',id,'Add friend',true,'UserRoundPlus');
    return '<article class="friends-card" data-friend-card="'+id+'">'+menu+'<div class="friends-avatar" aria-hidden="true">'+avatar+'</div><h3 data-user-text><a href="#" data-friend-action="profile" data-person-id="'+id+'">'+name+'</a></h3><p class="friends-handle" data-user-text>'+esc(person.handle||'')+'</p><p class="friends-detail" data-user-text>'+esc(person.city||person.area||'')+'</p><div class="friends-actions">'+actions+'</div></article>';
  }
  function render(){
    if(!active)return;
    document.querySelector('.friends-content').dataset.friendsView=tab;
    $('findFriends').hidden=tab!=='received';
    const groups=lists(),rows=groups[tab].filter(person=>[person.name,person.handle,person.id].some(value=>String(value||'').toLocaleLowerCase().includes(query.toLocaleLowerCase()))).sort((a,b)=>a.name.localeCompare(b.name));
    $('friendsTitle').textContent=tabs[tab];$('friendsSummary').textContent=query?rows.length+' results':tab==='all'?groups.all.length+(groups.all.length===1?' friend':' friends'):groups[tab].length+(tab==='suggestions'?' suggestions':tab==='following'?' following':tab==='followers'?' followers':' requests');
    search.placeholder=tab==='all'?'Search friends':tab==='suggestions'?'Search suggestions':'Search requests';document.querySelector('label[for=friendsSearch]').textContent=search.placeholder;
    $('clearFriendsSearch').hidden=!query;
    for(const button of document.querySelectorAll('[data-friends-tab]')){
      if(button.dataset.friendsTab===tab)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
      const count=button.querySelector('[data-count]');if(count){const n=groups[count.dataset.count].length;count.textContent=n;count.toggleAttribute('data-zero',!n);}
    }
    grid.innerHTML=rows.map(card).join('');empty.hidden=rows.length>0;
    empty.innerHTML=rows.length?'':'<img src="../../../../assets/icon-oneqr/issue-2040-oneqr-users-round-3d.png" alt=""><p>'+esc(query?'No matching people found.':emptyText[tab])+'</p>'+(!query&&tab==='all'?'<button type="button" class="friends-button" data-friends-tab="suggestions">'+icon('UserRoundPlus')+'<span>Find friends</span></button>':'');
    for(const img of grid.querySelectorAll('.friends-avatar img'))img.addEventListener('error',()=>{img.replaceWith(document.createTextNode(img.closest('.friends-card').querySelector('h3').textContent.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()));},{once:true});
    document.querySelector('.friends-content').setAttribute('aria-busy','false');
  }
  function closeMenus(){for(const menu of document.querySelectorAll('.friends-card-menu'))menu.hidden=true;for(const button of document.querySelectorAll('[data-friend-action=menu]'))button.setAttribute('aria-expanded','false');}
  function focusAfterChange(index){const cards=[...grid.querySelectorAll('.friends-card')];(cards[Math.min(index,cards.length-1)]?.querySelector('[data-friend-action]')||document.querySelector('[data-friends-tab="'+tab+'"]'))?.focus({preventScroll:true});}
  function run(action,id){
    const target=directory.list().find(person=>person.id===id);if(!target)return;
    const index=[...grid.children].findIndex(card=>card.dataset.friendCard===id);
    const operations={follow:()=>{const s=window.NEXORA_COMMUNITY_SHARED;return s.change(data=>{data.personalFollows||={};const names=data.personalFollows[s.member]||[];data.personalFollows[s.member]=names.includes(target.name)?names.filter(name=>name!==target.name):[...names,target.name];});},accept:()=>directory.respond(id,true),decline:()=>directory.respond(id,false),cancel:()=>directory.cancelRequest(id),add:()=>directory.addFriend(id),unfriend:()=>directory.unfriend(id)};
    const result=operations[action]?.();
    render();focusAfterChange(index);
    notice(result?{follow:'Updated.',accept:'Friend request accepted.',decline:'Friend request deleted.',cancel:'Friend request cancelled.',add:'Friend request sent.',unfriend:'Friend removed.'}[action]:'Could not update this request. Please try again.');
  }
  document.addEventListener('click',event=>{
    const section=event.target.closest('[data-friends-tab]');if(section){event.preventDefault();route('friends',{friendsView:section.dataset.friendsTab});return;}
    const button=event.target.closest('[data-friend-action]');if(!button){closeMenus();return;}
    event.preventDefault();
    const {friendAction:action,personId:id}=button.dataset,target=directory.list().find(person=>person.id===id);if(!target)return;
    if(action==='menu'){const menu=button.nextElementSibling,open=menu.hidden;closeMenus();menu.hidden=!open;button.setAttribute('aria-expanded',String(open));if(open)menu.querySelector('button')?.focus();return;}
    closeMenus();
    if(action==='profile'){route('personal-profile',{memberId:id});return;}
    if(action==='message'){route('connect');directory.open(target.name);return;}
    if(action==='unfriend'){
      unfriendId=id;returnFocusId=id;$('unfriendTitle').textContent='Unfriend '+target.name+'?';$('unfriendDescription').textContent='Remove '+target.name+' from your friends list?';dialog.returnValue='';dialog.showModal();dialog.querySelector('.friends-button[value=cancel]')?.focus();return;
    }
    run(action,id);
  });
  dialog.addEventListener('close',()=>{
    const id=unfriendId;unfriendId='';if(dialog.returnValue==='confirm'&&id&&active)run('unfriend',id);
    else grid.querySelector('[data-friend-action=menu][data-person-id="'+CSS.escape(returnFocusId)+'"]')?.focus({preventScroll:true});
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const open=document.querySelector('.friends-card-menu:not([hidden])');if(open){const button=open.previousElementSibling;closeMenus();button.focus();}}});
  search.addEventListener('input',()=>{query=search.value.trim();render();});
  $('clearFriendsSearch').addEventListener('click',()=>{query='';search.value='';render();search.focus();});
  for(const button of document.querySelectorAll('[data-icon]'))if(!button.querySelector('svg'))button.insertAdjacentHTML('afterbegin',icon(button.dataset.icon));
  document.querySelector('[data-search-icon]').innerHTML=icon('Search');
  async function navigate(routeName,context={}){
    const request=++generation,next=Object.hasOwn(tabs,context.friendsView)?context.friendsView:'all';active=true;
    if(next!==tab){query='';search.value='';}tab=next;
    unsubscribe?.();unsubscribe=directory.subscribe(render);
    try{await directory.ready();if(active&&request===generation)render();}
    catch(error){if(!active||request!==generation)return;document.querySelector('.friends-content').setAttribute('aria-busy','false');grid.innerHTML='';empty.hidden=false;empty.innerHTML='<p>Could not load friends.</p><button type="button" class="friends-button" id="retryFriends">Try again</button>';$('retryFriends').addEventListener('click',()=>navigate('friends',{friendsView:tab}));}
  }
  function deactivate(){active=false;generation++;unsubscribe?.();unsubscribe=null;closeMenus();if(dialog.open)dialog.close('cancel');clearTimeout(toastTimer);$('friendsStatus').hidden=true;}
  window.NEXORA_COMMUNITY_MODULE={navigate,deactivate,setLanguage(){}};
})();
