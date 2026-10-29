/* Community groups for the local HTML demo. No network requests or real membership changes. */
(() => {
  'use strict';
  const STORAGE_KEY='nexora-community-group-workflow-v1';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  // Labels come from the PO Connect prototype and staging communityFeed translations.
  const words={
    vi:{all:'Tất cả',city:'Thành phố',topic:'Chủ đề',type:'Loại nhóm',community:'Cộng đồng ngành',marketplace:'Chợ mua bán',free:'Miễn phí',members:'{count} thành viên',view:'Xem nhóm',join:'Tham gia nhóm',leave:'Rời nhóm',joined:'Đã tham gia',notJoined:'Chưa tham gia',membership:'Trạng thái',rules:'Nội quy',defaultRules:'Chia sẻ đúng chủ đề, tôn trọng thành viên và không đăng spam.',posts:'Bài viết trong nhóm',noPosts:'Chưa có bài viết trong nhóm này.',viewPost:'Xem bài & bình luận',viewFeed:'Xem bảng tin nhóm',chat:'Mở trò chuyện nhóm',close:'Đóng',edit:'Sửa',remove:'Xóa',cancel:'Hủy',save:'Lưu thay đổi',editTitle:'Sửa nhóm',name:'Tên nhóm',description:'Mô tả',region:'Khu vực',deleteTitle:'Xoá nhóm',deleteConfirm:'Xoá nhóm này? Thành viên sẽ bị gỡ và các bài chỉ đăng trong nhóm này sẽ bị xoá.',deleted:'Đã xoá nhóm.',updated:'Đã cập nhật nhóm.',required:'Nhập tên nhóm.',error:'Đã có lỗi xảy ra. Vui lòng thử lại.',showMore:'Xem thêm',showLess:'Thu gọn',notFound:'Bài viết không còn tồn tại'},
    en:{all:'All',city:'City',topic:'Topic',type:'Group type',community:'Industry community',marketplace:'Industry marketplace',free:'Free',members:'{count} members',view:'View group',join:'Join group',leave:'Leave group',joined:'Joined',notJoined:'Not joined',membership:'Membership',rules:'Group rules',defaultRules:'Stay on topic, respect members, and avoid spam.',posts:'Group posts',noPosts:'This group has no posts yet.',viewPost:'View post & comments',viewFeed:'View group feed',chat:'Open group chat',close:'Close',edit:'Edit',remove:'Delete',cancel:'Cancel',save:'Save changes',editTitle:'Edit group',name:'Group name',description:'Description',region:'Region',deleteTitle:'Delete group',deleteConfirm:'Delete this group? Members will be removed and posts that only appear in this group will be deleted.',deleted:'Group deleted.',updated:'Group updated.',required:'Enter a group name.',error:'Something went wrong. Please try again.',showMore:'Show more',showLess:'Show less',notFound:'This post is no longer available'}
  };
  let mounted=null;
  function mount(adapter,options={}) {
    if(!options.storeOnly)mounted?.destroy();
    const current=String(adapter.currentMember||''),esc=adapter.escape||escapeHTML;
    const t=(key,values={})=>Object.entries(values).reduce((text,[name,value])=>text.replaceAll('{'+name+'}',String(value)),words[document.documentElement.lang==='en'?'en':'vi'][key]||key);
    const sourceGroups=()=>Array.isArray(adapter.getGroups?.())?adapter.getGroups():[];
    const sourceFeed=()=>Array.isArray(adapter.getFeed?.())?adapter.getFeed():[];
    const identifier=value=>String(typeof value==='object'?value?.id??value?.name??value?.member??'':value??'').trim();
    const unique=values=>[...new Set(values.map(identifier).filter(Boolean))];
    const groupOwner=group=>String(group?.owner||group?.ownerId||(group?.isOwner?current:''));
    const title=group=>group.title||group.name||'';
    const groupType=group=>String(group.groupType||group.type||(/chợ|market|mua bán/i.test(title(group))?'Marketplace':'Community')).toLowerCase()==='marketplace'?'Marketplace':'Community';
    const city=group=>String(group.city||group.region||'');
    const topic=group=>String(group.topic||group.industry||'');
    const notifyError=()=>adapter.toast?.(t('error'));
    let dialogGroup=null,dialogKind=null,returnFocus=null,destroyed=false,sequence=0,filtersOpen=false;
    const selections={city:'',topic:'',type:''};
    const fresh=()=>({version:1,groups:Object.create(null),invitations:[],deletedGroupIds:[]});
    function read() {
      let data;try{data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}catch{}
      if(!data||typeof data!=='object'||Array.isArray(data))return fresh();
      return {version:1,groups:Object.assign(Object.create(null),data.groups&&typeof data.groups==='object'&&!Array.isArray(data.groups)?data.groups:{}),invitations:Array.isArray(data.invitations)?data.invitations.filter(row=>row&&typeof row.id==='string'):[],deletedGroupIds:Array.isArray(data.deletedGroupIds)?data.deletedGroupIds.map(String):[]};
    }
    function groups(){const deleted=read().deletedGroupIds;return sourceGroups().filter(group=>!deleted.includes(String(group.id)));}
    const find=id=>groups().find(group=>String(group.id)===String(id))||null;
    const canManage=(groupId,actor=current)=>{const group=find(groupId);return !!group&&!!actor&&groupOwner(group)===String(actor);};
    function sourceJoined(group) {
      if(groupOwner(group)===current&&current)return true;
      const joined=adapter.getJoinedGroups?.();
      if(Array.isArray(joined))return joined.some(value=>identifier(value)===String(group.id));
      if(joined&&typeof joined==='object')return Boolean(joined[group.id]);
      return Boolean(group.joined??group.isMember);
    }
    function record(state,group) {
      const key=String(group.id),stored=Object.hasOwn(state.groups,key)?state.groups[key]:null;
      const base=stored&&typeof stored==='object'?stored:{};
      const members=unique(Array.isArray(base.members)?base.members:Array.isArray(group.memberNames)?group.memberNames:Array.isArray(group.members)?group.members:[]);
      const owner=groupOwner(group);if(owner&&!members.includes(owner))members.unshift(owner);
      const removed=unique(Array.isArray(base.removed)?base.removed:[]);
      if(current&&!removed.includes(current)&&sourceJoined(group)&&!members.includes(current))members.push(current);
      return {...base,members,removed};
    }
    function members(groupId) {const group=find(groupId);return group?record(read(),group).members:[];}
    const joined=(groupId,actor=current)=>!!actor&&members(groupId).includes(String(actor));
    function transaction(operation,writeSource) {
      let before;try{before=localStorage.getItem(STORAGE_KEY);}catch{notifyError();return false;}
      const next=read(),result=operation(next);if(result===false)return false;
      try {
        localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
        if(writeSource?.()===false)throw new Error('source rejected');
        window.dispatchEvent(new CustomEvent('nexora-community-groups-changed'));
        return result===undefined?true:result;
      } catch {
        try{if(before===null)localStorage.removeItem(STORAGE_KEY);else localStorage.setItem(STORAGE_KEY,before);}catch{}
        notifyError();return false;
      }
    }
    function membership(groupId,member,shouldJoin,actor=current) {
      const group=find(groupId);member=identifier(member);if(!group||!member)return false;
      if(!shouldJoin&&groupOwner(group)===member)return false;
      if(member!==actor&&!canManage(groupId,actor))return false;
      return transaction(state=>{
        const row=record(state,group);
        row.members=shouldJoin?unique([...row.members,member]):row.members.filter(name=>name!==member);
        row.removed=shouldJoin?row.removed.filter(name=>name!==member):unique([...row.removed,member]);
        state.groups[String(groupId)]=row;
      },()=>member===current?adapter.setMembership?.(String(groupId),shouldJoin):true);
    }
    function join(groupId,member=current){return membership(groupId,member,true,member);}
    function leave(groupId,member=current){return membership(groupId,member,false,member);}
    function remove(groupId,member,actor=current){if(!canManage(groupId,actor))return false;return membership(groupId,member,false,actor);}
    function invitations(member=current) {return clone(read().invitations.filter(row=>row.status==='pending'&&row.member===identifier(member)&&find(row.groupId)));}
    function invite(groupId,invitee,actor=current) {
      const group=find(groupId),member=identifier(invitee);if(!group||!member||!canManage(groupId,actor)||joined(groupId,member))return false;
      return transaction(state=>{
        const existing=state.invitations.find(row=>String(row.groupId)===String(groupId)&&row.member===member&&row.status==='pending');if(existing)return existing;
        const row={id:'group-invite-'+Date.now()+'-'+(++sequence)+'-'+Math.random().toString(36).slice(2,8),groupId:String(groupId),member,invitedBy:String(actor),status:'pending',createdAt:new Date().toISOString()};
        state.invitations.push(row);return row;
      });
    }
    function respond(invitationId,accept,member=current) {
      member=identifier(member);const pending=read().invitations.find(row=>row.id===invitationId&&row.member===member&&row.status==='pending'),group=pending&&find(pending.groupId);if(!group)return false;
      return transaction(state=>{
        const invitation=state.invitations.find(row=>row.id===invitationId&&row.member===member&&row.status==='pending');if(!invitation)return false;
        invitation.status=accept?'accepted':'declined';invitation.respondedAt=new Date().toISOString();
        if(accept){const row=record(state,group);row.members=unique([...row.members,member]);row.removed=row.removed.filter(name=>name!==member);state.groups[String(group.id)]=row;}
      },()=>accept&&member===current?adapter.setMembership?.(String(group.id),true):true);
    }
    function create(values) {
      if(!current||typeof adapter.saveGroups!=='function')return false;
      const group={...clone(values),id:values.id||'group-'+Date.now()+'-'+(++sequence),owner:current,createdAt:values.createdAt||new Date().toISOString()};
      if(!title(group).trim()||sourceGroups().some(row=>String(row.id)===String(group.id)))return false;
      return transaction(state=>{state.groups[String(group.id)]={members:[current],removed:[]};state.deletedGroupIds=state.deletedGroupIds.filter(id=>id!==String(group.id));return group;},()=>adapter.saveGroups([...clone(sourceGroups()),group]));
    }
    function update(groupId,values) {
      const group=find(groupId);if(!group||!canManage(groupId)||typeof adapter.saveGroups!=='function')return false;
      const allowed={};for(const key of ['title','name','description','rules','region','city'])if(typeof values[key]==='string')allowed[key]=values[key].trim();
      if(('title' in allowed&&!allowed.title)||('name' in allowed&&!allowed.name))return false;
      return transaction(()=>true,()=>adapter.saveGroups(sourceGroups().map(row=>String(row.id)===String(groupId)?{...clone(row),...allowed,lastEditedAt:new Date().toISOString()}:clone(row))));
    }
    function destinations(post) {
      const dest=post.destinations;
      if(Array.isArray(dest))return {main:dest.some(row=>row.isMainFeed||row.groupId===null),ids:unique(dest.filter(row=>row.groupId!==null&&row.groupId!==undefined).map(row=>row.groupId))};
      return {main:!dest||dest.includeMainFeed!==false,ids:unique(Array.isArray(dest?.groupIds)?dest.groupIds:post.groupId?[post.groupId]:[])};
    }
    function filter(posts,scope='all') {
      const valid=new Set(groups().map(group=>String(group.id))),myGroups=new Set(groups().filter(group=>joined(group.id)).map(group=>String(group.id)));
      return posts.filter(post=>{
        const dest=destinations(post),ids=dest.ids.filter(id=>valid.has(id));
        if(!dest.main&&dest.ids.length&&!ids.length)return false;
        if(String(scope).startsWith('group:'))return ids.includes(String(scope).slice(6));
        if(['main','scope:main'].includes(scope))return dest.main;
        if(['joined','scope:joined'].includes(scope))return ids.some(id=>myGroups.has(id));
        if(['market','scope:market','marketplace'].includes(scope))return post.kind==='market'||post.type==='sale'||post.type==='want';
        return dest.main||ids.some(id=>myGroups.has(id));
      }).filter((post,index,rows)=>rows.findIndex(row=>String(row.id)===String(post.id))===index);
    }
    function groupPosts(groupId){return filter(sourceFeed(),'group:'+groupId).filter(post=>post.status!=='draft'&&!post.isDraft).sort((a,b)=>new Date(b.createdAt||b.publishedAt||0)-new Date(a.createdAt||a.publishedAt||0));}
    function deleteGroup(groupId) {
      const group=find(groupId);if(!group||!canManage(groupId)||typeof adapter.saveGroups!=='function')return false;
      const original=clone(sourceGroups()),originalFeed=clone(sourceFeed());
      return transaction(state=>{
        state.deletedGroupIds=unique([...state.deletedGroupIds,String(groupId)]);delete state.groups[String(groupId)];
        state.invitations=state.invitations.filter(row=>String(row.groupId)!==String(groupId));
      },()=>{
        let postsChanged=false;
        try {
          if(adapter.deleteGroupPosts?.(String(groupId))===false)return false;
          postsChanged=typeof adapter.deleteGroupPosts==='function';
          if(adapter.saveGroups(original.filter(row=>String(row.id)!==String(groupId)))===false){if(postsChanged)adapter.saveFeed?.(originalFeed);return false;}
          return true;
        } catch {if(postsChanged)try{adapter.saveFeed?.(originalFeed);}catch{}return false;}
      });
    }
    function memberCount(group) {
      const known=members(group.id).length,stored=read().groups[String(group.id)],base=Number(group.memberCount||(typeof group.members==='number'?group.members:0))||0;
      return Math.max(known,base+(joined(group.id)&&!sourceJoined(group)?1:0)-(stored?.removed?.includes(current)&&sourceJoined(group)?1:0));
    }
    const button=(action,label,groupId,extra='',className='btn small')=>`<button type="button" class="${className}" data-community-group-action="${action}" data-community-group-id="${esc(groupId)}"${extra}>${esc(label)}</button>`;
    const membershipButton=group=>button('membership',t(joined(group.id)?'leave':'join'),group.id,` aria-pressed="${joined(group.id)}"${canManage(group.id)?' disabled':''}`,'btn small '+(joined(group.id)?'':'primary'));
    function directoryMarkup() {
      const rows=groups().filter(group=>(!selections.city||city(group)===selections.city)&&(!selections.topic||topic(group)===selections.topic)&&(!selections.type||groupType(group)===selections.type));
      return ['Community','Marketplace'].map(type=>{const matches=rows.filter(group=>groupType(group)===type);return matches.length?`<section class="community-group-section"><h3>${esc(t(type==='Community'?'community':'marketplace'))}</h3>${matches.map(group=>`<article class="panel content-card community-group-card" data-community-group-card="${esc(group.id)}"><div class="community-group-card-heading"><h3 data-community-authored>${esc(title(group))}</h3><span class="community-group-free">${esc(t('free'))}</span></div><div class="meta" data-community-authored>${esc([topic(group),city(group)].filter(Boolean).join(' · '))}</div>${group.description?`<p data-community-authored>${esc(group.description)}</p>`:''}${group.rules?`<p class="community-group-inline-rules"><strong>${esc(t('rules'))}:</strong> <span data-community-authored>${esc(group.rules)}</span></p>`:''}<div class="chips"><span class="chip">${esc(t('members',{count:memberCount(group).toLocaleString('en-US')}))}</span>${joined(group.id)?`<span class="chip">${esc(t('joined'))}</span>`:''}</div><div class="listing-actions">${button('detail',t('view'),group.id,'','btn small soft')}${membershipButton(group)}</div></article>`).join('')}</section>`:'';}).join('');
    }
    function filtersMarkup() {
      const options=(name,rows)=>`<label><span>${esc(t(name))}</span><select class="select" data-community-group-filter="${name}"><option value="">${esc(t('all'))}</option>${unique(rows).sort((a,b)=>a.localeCompare(b)).map(value=>`<option value="${esc(value)}"${selections[name]===value?' selected':''}>${esc(value)}</option>`).join('')}</select></label>`;
      return `<div class="community-group-filters" id="communityGroupFilters" data-community-group-filters>${options('city',groups().map(city))}${options('topic',groups().map(topic))}<label><span>${esc(t('type'))}</span><select class="select" data-community-group-filter="type"><option value="">${esc(t('all'))}</option>${['Community','Marketplace'].map(type=>`<option value="${type}"${selections.type===type?' selected':''}>${esc(t(type==='Community'?'community':'marketplace'))}</option>`).join('')}</select></label></div>`;
    }
    function enhance(root=document) {
      if(destroyed)return;
      const cards=root.querySelector?.('#groupCards')||(root.id==='groupCards'?root:null);if(!cards)return;
      // Filters belong to the list column, beside the existing PO sidebar.
      cards.parentElement.querySelector(':scope > [data-community-group-filters]')?.remove();
      cards.innerHTML=filtersMarkup()+directoryMarkup();cards.classList.add('community-group-directory');
      const toggle=document.querySelector('.community-group-filter-toggle'),count=document.querySelector('[data-group-filter-count]'),active=Object.values(selections).filter(Boolean).length;document.getElementById('groupsView')?.classList.toggle('group-filters-open',filtersOpen);toggle?.setAttribute('aria-expanded',String(filtersOpen));if(count){count.hidden=!active;count.textContent=String(active);}
    }
    function showDialog(group,body,footer,heading=title(group)) {
      if(!document.querySelector('[data-community-group-dialog]'))returnFocus=document.activeElement;
      adapter.openDialog?.(`<div class="overlay" data-community-group-overlay><section class="dialog community-group-dialog" data-community-group-dialog role="dialog" aria-modal="true" aria-labelledby="community-group-dialog-title" tabindex="-1"><div class="dialog-head"><h2 id="community-group-dialog-title" data-community-authored>${esc(heading)}</h2>${button('close','×',group.id,` aria-label="${esc(t('close'))}"`,'icon-btn')}</div>${body}<div class="dialog-footer">${footer}</div></section></div>`);
      document.querySelector('[data-community-group-dialog] button')?.focus({preventScroll:true});
    }
    function closeDialog(){dialogGroup=null;dialogKind=null;adapter.closeDialog?.();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;}
    function openGroup(groupId) {
      const group=find(groupId);if(!group)return false;dialogGroup=String(groupId);dialogKind='detail';
      const posts=groupPosts(groupId).slice(0,5),rules=group.rules||t('defaultRules');
      showDialog(group,`<div class="dialog-body"><p class="community-group-description" data-community-authored>${esc(group.description||'')}</p><dl class="community-group-facts"><div><dt>${esc(t('type'))}</dt><dd>${esc(t(groupType(group)==='Community'?'community':'marketplace'))}</dd></div><div><dt>${esc(t('membership'))}</dt><dd>${esc(t(joined(groupId)?'joined':'notJoined'))}</dd></div><div><dt>${esc(t('members',{count:memberCount(group).toLocaleString('en-US')}))}</dt><dd data-community-authored>${esc([topic(group),city(group)].filter(Boolean).join(' · '))}</dd></div></dl><section class="community-group-rules"><h3>${esc(t('rules'))}</h3><p data-community-authored>${esc(rules)}</p></section><section class="community-group-latest"><h3>${esc(t('posts'))}</h3>${posts.length?`<ul>${posts.map(post=>`<li><strong data-community-authored>${esc(post.owner||post.authorDisplayName||'')}</strong><p data-community-authored>${esc(post.title||post.content||post.description||post.details||post.steps||'')}</p>${button('post',t('viewPost'),group.id,` data-community-group-post="${esc(post.id)}"`,'btn small soft')}</li>`).join('')}</ul>`:`<p class="tip">${esc(t('noPosts'))}</p>`}</section></div>`,(canManage(groupId)?button('edit',t('edit'),groupId)+button('delete',t('remove'),groupId,'','btn small danger'):membershipButton(group))+button('feed',t('viewFeed'),groupId,'','btn soft')+(groupType(group)==='Community'?button('chat',t('chat'),groupId,joined(groupId)?'':' disabled','btn primary'):''));
      return true;
    }
    function navigate(scope){closeDialog();adapter.navigateFeed?.(scope);return scope;}
    function editDialog(group) {
      dialogGroup=String(group.id);dialogKind='edit';
      showDialog(group,`<form id="community-group-edit" data-community-group-edit="${esc(group.id)}" data-community-editing="true"><div class="dialog-body"><div class="form-group"><label for="community-group-name">${esc(t('name'))}</label><input class="field" id="community-group-name" name="title" required maxlength="120" value="${esc(title(group))}"></div><div class="form-group"><label for="community-group-description">${esc(t('description'))}</label><textarea class="field" id="community-group-description" name="description" maxlength="1500">${esc(group.description||'')}</textarea></div><div class="form-group"><label for="community-group-rules">${esc(t('rules'))}</label><textarea class="field" id="community-group-rules" name="rules" maxlength="5000">${esc(group.rules||'')}</textarea></div><p class="community-group-error" data-community-group-error role="alert"></p></div></form>`,button('detail',t('cancel'),group.id)+`<button type="submit" class="btn primary" form="community-group-edit">${esc(t('save'))}</button>`,t('editTitle'));
    }
    function refresh(){adapter.render?.();enhance();if(dialogGroup&&dialogKind==='detail')openGroup(dialogGroup);}
    function onClick(event) {
      const target=event.target.closest?.('[data-community-group-action]');
      if(!target){if(event.target.matches?.('[data-community-group-overlay]'))closeDialog();return;}
      event.preventDefault();event.stopPropagation();
      const action=target.dataset.communityGroupAction;if(action==='filters'){filtersOpen=!filtersOpen;enhance();return;}const group=find(target.dataset.communityGroupId);if(action==='close'){closeDialog();return;}if(!group)return;
      if(action==='detail')openGroup(group.id);
      else if(action==='membership'){if((joined(group.id)?leave(group.id):join(group.id))!==false)refresh();}
      else if(action==='feed')navigate('group:'+group.id);
      else if(action==='chat'&&joined(group.id)&&groupType(group)==='Community'){closeDialog();adapter.openChat?.(group);}
      else if(action==='post'){closeDialog();adapter.openPost?.(target.dataset.communityGroupPost,{groupId:group.id});}
      else if(action==='edit'&&canManage(group.id))editDialog(group);
      else if(action==='delete'&&canManage(group.id)){dialogGroup=String(group.id);dialogKind='delete';showDialog(group,`<div class="dialog-body"><p>${esc(t('deleteConfirm'))}</p><p class="community-group-error" data-community-group-error role="alert"></p></div>`,button('detail',t('cancel'),group.id)+button('confirm-delete',t('remove'),group.id,'','btn danger'),t('deleteTitle'));}
      else if(action==='confirm-delete'&&dialogKind==='delete'&&dialogGroup===String(group.id)){if(deleteGroup(group.id)!==false){closeDialog();adapter.toast?.(t('deleted'));adapter.navigateFeed?.('all');refresh();}else{const error=document.querySelector('[data-community-group-error]');if(error)error.textContent=t('error');}}
    }
    function onChange(event){const name=event.target.dataset?.communityGroupFilter;if(name&&Object.hasOwn(selections,name)){selections[name]=event.target.value;enhance();}}
    function onSubmit(event) {
      const form=event.target;if(!form.matches?.('[data-community-group-edit]'))return;event.preventDefault();
      const name=form.elements.title.value.trim(),error=form.querySelector('[data-community-group-error]');
      if(!name){error.textContent=t('required');return;}
      const group=find(form.dataset.communityGroupEdit),values={title:name,description:form.elements.description.value,rules:form.elements.rules.value};if(group?.name)values.name=name;
      if(update(form.dataset.communityGroupEdit,values)!==false){adapter.toast?.(t('updated'));openGroup(form.dataset.communityGroupEdit);refresh();}else error.textContent=t('error');
    }
    function onKeyDown(event) {
      const dialog=document.querySelector('[data-community-group-dialog]');if(!dialog)return;
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeDialog();return;}
      if(event.key!=='Tab')return;
      const nodes=[...dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href],[tabindex="0"]')].filter(node=>!node.closest('[hidden]')),first=nodes[0],last=nodes.at(-1);
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
    function onLanguage(){
      enhance();if(!dialogGroup)return;
      if(dialogKind==='detail'){openGroup(dialogGroup);return;}
      if(dialogKind==='edit'){const form=document.querySelector('[data-community-group-edit]'),values=form?[...form.elements].filter(field=>field.name).map(field=>[field.name,field.value]):[],group=find(dialogGroup);if(group){editDialog(group);const next=document.querySelector('[data-community-group-edit]');for(const [name,value] of values)if(next.elements[name])next.elements[name].value=value;}}
      else if(dialogKind==='delete'){const group=find(dialogGroup);if(group)showDialog(group,`<div class="dialog-body"><p>${esc(t('deleteConfirm'))}</p><p class="community-group-error" data-community-group-error role="alert"></p></div>`,button('detail',t('cancel'),group.id)+button('confirm-delete',t('remove'),group.id,'','btn danger'),t('deleteTitle'));}
    }
    const observer=new MutationObserver(onLanguage);
    function reset(){try{localStorage.removeItem(STORAGE_KEY);}catch{notifyError();return false;}dialogGroup=null;dialogKind=null;enhance();return true;}
    function destroy(){destroyed=true;document.removeEventListener('click',onClick);document.removeEventListener('change',onChange);document.removeEventListener('submit',onSubmit);document.removeEventListener('keydown',onKeyDown,true);window.removeEventListener('storage',onStorage);observer.disconnect();}
    function onStorage(event){if(event.key===STORAGE_KEY||event.key==='nexora-community-templates-v1')refresh();}
    if(!options.storeOnly){document.addEventListener('click',onClick);document.addEventListener('change',onChange);document.addEventListener('submit',onSubmit);document.addEventListener('keydown',onKeyDown,true);window.addEventListener('storage',onStorage);observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});}
    const store={groups,members,memberRecords:groupId=>members(groupId).map(name=>({id:name,name,role:canManage(groupId,name)?'owner':'member'})),invitations,invite,respond,remove,leave,join,joined,canManage,create,update,deleteGroup,groupType,read:()=>clone(read())};
    const instance={enhance,openGroup,navigate,filter,groupPosts,store,reset,destroy,onDialogClosed:()=>{dialogGroup=null;dialogKind=null;},isGroupVisible:group=>!!find(group.id)};
    if(!options.storeOnly)mounted=instance;return instance;
  }
  window.NEXORA_COMMUNITY_GROUPS={mount,createStore:adapter=>mount(adapter,{storeOnly:true}).store,enhance:root=>mounted?.enhance(root),openGroup:id=>mounted?.openGroup(id),navigate:scope=>mounted?.navigate(scope),get store(){return mounted?.store;}};
})();
