/* Feed discovery and Friends share the retained Connect directory and relationship store. */
(() => {
  'use strict';
  function create(frame,baseURL,params){
    let ready;
    const shared=window.NEXORA_COMMUNITY_SHARED,me=shared.member;
    const pair=(row,name)=>row.from===me&&row.to===name||row.from===name&&row.to===me;
    function core(){return frame.contentWindow?.NEXORA_CONNECT_CORE;}
    function list(){return frame.contentWindow?.NEXORA_COMMUNITY_CONNECT?.directory()||[];}
    function peer(id){return list().find(person=>person.id===id&&person.name!==me);}
    function seedDemo(){
      if(!['BITCOIN NAIL BAR','David Le'].includes(me)||shared.read().friendDemoMembers?.includes(me))return;
      const names=new Set(list().map(person=>person.name)),friends=new Set(shared.friendNames(me));
      shared.change(data=>{
        data.friendRequests||=[];
        for(const [name,incoming] of [['Thảo Lê',true],['Hà Nguyễn',true],['Jessica Nguyen',false]]){
          if(!names.has(name)||friends.has(name)||data.friendRequests.some(row=>pair(row,name)))continue;
          data.friendRequests.push({id:'demo-friend-'+encodeURIComponent(me)+'-'+encodeURIComponent(name),from:incoming?name:me,to:incoming?me:name,status:'pending',createdAt:new Date().toISOString(),isSample:true});
        }
        data.friendDemoMembers=[...new Set([...(data.friendDemoMembers||[]),me])];
      });
    }
    async function engine(){
      if(frame.contentWindow?.NEXORA_COMMUNITY_CONNECT){seedDemo();return frame.contentWindow.NEXORA_COMMUNITY_CONNECT;}
      if(!ready)ready=new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>{frame.removeEventListener('load',loaded);ready=null;reject(Error('Could not load friends.'));},15000);
        const loaded=()=>{const value=frame.contentWindow?.NEXORA_COMMUNITY_CONNECT;if(value){clearTimeout(timeout);frame.removeEventListener('load',loaded);resolve(value);}};
        frame.addEventListener('load',loaded);
        if(!frame.src){const url=new URL(frame.dataset.communityCode||'nexora-privacy-qr-layout.html',baseURL);url.searchParams.set('embedded','1');for(const key of ['member','role','account'])if(params.get(key))url.searchParams.set(key,params.get(key));frame.src=url.href;}
        loaded();
      });
      const value=await ready;seedDemo();return value;
    }
    function state(){
      const data=shared.read(),rows=data.friendRequests||[],friends=shared.friendNames(me),ids=names=>[...new Set(names.map(name=>shared.identity(name).id))];
      return {sent:ids(rows.filter(row=>row.from===me&&row.status==='pending'&&!friends.includes(row.to)).map(row=>row.to)),received:ids(rows.filter(row=>row.to===me&&row.status==='pending'&&!friends.includes(row.from)).map(row=>row.from)),friends:ids(friends)};
    }
    function respond(id,accept){
      const target=peer(id);if(!target)return false;
      const result=shared.change(data=>{
        const row=data.friendRequests?.find(row=>row.from===target.name&&row.to===me&&row.status==='pending');if(!row)return false;
        row.status=accept?'accepted':'declined';row.respondedAt=new Date().toISOString();
        if(accept){
          data.friendRemovals=(data.friendRemovals||[]).filter(row=>!pair(row,target.name));
          for(const other of data.friendRequests)if(other!==row&&pair(other,target.name)&&other.status==='pending')other.status='cancelled';
        }
        return true;
      });
      if(result)core()?.refresh();return result;
    }
    function addFriend(id){
      const target=peer(id);if(!target)return false;
      if(state().received.includes(id))return respond(id,true);
      if(shared.friendNames(me).includes(target.name))return false;
      return shared.change(data=>{
        data.friendRequests||=[];
        if(data.friendRequests.some(row=>row.from===me&&row.to===target.name&&row.status==='pending'))return false;
        data.friendRequests.push({id:crypto.randomUUID(),from:me,to:target.name,status:'pending',createdAt:new Date().toISOString()});return true;
      });
    }
    function cancelRequest(id){
      const target=peer(id);if(!target)return false;
      return shared.change(data=>{const row=data.friendRequests?.find(row=>row.from===me&&row.to===target.name&&row.status==='pending');if(!row)return false;row.status='cancelled';row.respondedAt=new Date().toISOString();return true;});
    }
    function unfriend(id){
      const target=peer(id);if(!target||!shared.friendNames(me).includes(target.name))return false;
      const result=shared.change(data=>{
        for(const row of data.friendRequests||[])if(pair(row,target.name)&&['accepted','pending'].includes(row.status)){row.status='unfriended';row.respondedAt=new Date().toISOString();}
        data.friendRemovals||=[];
        if(!data.friendRemovals.some(row=>pair(row,target.name)))data.friendRemovals.push({from:me,to:target.name,createdAt:new Date().toISOString()});
        return true;
      });
      if(result)core()?.refresh();return result;
    }
    function subscribe(listener){window.addEventListener('nexora-community-shared-changed',listener);return ()=>window.removeEventListener('nexora-community-shared-changed',listener);}
    async function sendPost(name,post){
      const connect=await engine();if(!list().some(person=>person.name===name)||!connect.openDirect(name))return false;
      const thread=core().getContext().currentDetail;if(!thread)return false;
      return core().appendChatMessage(thread,{type:'community-card',text:post.caption||post.title||'',contextCard:{kind:'post',id:post.id,title:post.title||'',owner:post.owner||'',body:post.body||'',photo:post.photo||'',url:post.url}});
    }
    return {ready:engine,list,state,addFriend,cancelRequest,unfriend,respond,subscribe,sendPost,request:id=>state().sent.includes(id)?cancelRequest(id):addFriend(id),placeholder:()=>frame.contentDocument?.getElementById('memberQuery')?.placeholder||'',search:query=>frame.contentWindow.NEXORA_COMMUNITY_CONNECT.search(query),open(name){return frame.contentWindow.NEXORA_COMMUNITY_CONNECT.openDirect(name);}};
  }
  window.NEXORA_COMMUNITY_DIRECTORY={create};
})();
