/* Feed discovery uses the retained Connect directory and its existing chat/call behavior. */
(() => {
  'use strict';
  function create(frame,baseURL,params){
    let ready;
    async function engine(){if(frame.contentWindow?.NEXORA_COMMUNITY_CONNECT)return frame.contentWindow.NEXORA_COMMUNITY_CONNECT;if(ready)return ready;ready=new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{ready=null;reject(Error('Could not load contacts.'));},15000);const loaded=()=>{const value=frame.contentWindow?.NEXORA_COMMUNITY_CONNECT;if(value){clearTimeout(timeout);resolve(value);}};frame.addEventListener('load',loaded);if(!frame.hasAttribute('src')){const url=new URL(frame.dataset.src,baseURL);for(const key of ['member','role','account'])if(params.get(key))url.searchParams.set(key,params.get(key));frame.src=url.href;}loaded();});return ready;}
    const shared=window.NEXORA_COMMUNITY_SHARED;
    function core(){return frame.contentWindow.NEXORA_CONNECT_CORE;}
    function list(){return frame.contentWindow.NEXORA_COMMUNITY_CONNECT?.directory()||[];}
    function state(){const data=shared.read(),me=shared.member,rows=data.friendRequests||[];return {sent:rows.filter(row=>row.from===me&&row.status==='pending').map(row=>shared.identity(row.to).id),received:rows.filter(row=>row.to===me&&row.status==='pending').map(row=>shared.identity(row.from).id),friends:shared.connectedPeople(me).map(name=>shared.identity(name).id)};}
    function peer(id){return list().find(person=>person.id===id);}
    function request(id){const target=peer(id);if(!target)return false;const me=shared.member;return shared.change(data=>{data.friendRequests||=[];const existing=data.friendRequests.find(row=>row.from===me&&row.to===target.name&&row.status==='pending');if(existing){existing.status='cancelled';return true;}if(shared.connectedPeople(me).includes(target.name))return false;data.friendRequests.push({id:crypto.randomUUID(),from:me,to:target.name,status:'pending',createdAt:new Date().toISOString()});return true;});}
    function respond(id,accept){const target=peer(id);if(!target)return false;const result=shared.change(data=>{const row=data.friendRequests?.find(row=>row.from===target.name&&row.to===shared.member&&row.status==='pending');if(!row)return false;row.status=accept?'accepted':'declined';row.respondedAt=new Date().toISOString();return true;});if(result&&accept){core().mutate(data=>{data.connections=Array.from(new Set([...data.connections,target.id]));});core().renderMessages();}return result;}
    return {ready:engine,list,state,request,respond,placeholder:()=>frame.contentDocument.getElementById('memberQuery')?.placeholder||'',search:query=>frame.contentWindow.NEXORA_COMMUNITY_CONNECT.search(query),open(name){return frame.contentWindow.NEXORA_COMMUNITY_CONNECT.openDirect(name);}};
  }
  window.NEXORA_COMMUNITY_DIRECTORY={create};
})();
