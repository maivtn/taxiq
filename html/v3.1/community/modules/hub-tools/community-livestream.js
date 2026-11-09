/* PO LV-01–20. The room, preview, and interactions run on this device. */
(() => {
  'use strict';
  const shared=window.NEXORA_COMMUNITY_SHARED;
  const recordKey='nexora-community-templates-v1';
  const artwork='/html/assets/icon-oneqr/';
  const pageRecord=id=>records().pages?.find(row=>row.id===id);
  const rooms=()=>[...state.liveRooms,...sampleLiveRooms];
  const own=room=>!room.sample&&(!room.owner||room.owner===shared.member);
  const person=()=>shared.me().displayName||shared.member;
  const encode=value=>encodeURIComponent(value);
  const clock=seconds=>[Math.floor(Math.max(0,seconds)/60),Math.max(0,seconds)%60].map(n=>String(n).padStart(2,'0')).join(':');
  const elapsed=room=>Math.floor((Date.now()-(room.startedAt||Date.now()))/1000);
  const dateLabel=value=>new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const timeLabel=value=>new Date(value).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  const inputTime=value=>{const date=new Date(value);date.setMinutes(date.getMinutes()-date.getTimezoneOffset());return date.toISOString().slice(0,16);};
  const route=(name,context)=>parent.postMessage({type:'nexora-community-route',route:name,context},location.origin);
  const liveLink=room=>new URL((shared.role==='staff'?'/html/v3.1/staff-community.html':'/html/v3.1/community.html')+'?tab=live&liveView=viewer&liveId='+encode(room.seriesId||room.id)+(room.ownerId?'&liveOwner='+encode(room.ownerId):''),location.origin).href;
  const t=tx;
  const action=(key,label,{value='',icon='',style='',pressed,disabled=false}={})=>
    '<button type="button" class="lv-btn '+style+'" data-live-po="'+key+'"'+(value?' data-live-value="'+esc(value)+'"':'')+(pressed===undefined?'':' aria-pressed="'+pressed+'"')+(disabled?' disabled':'')+'>'+icon+esc(label)+'</button>';
  const icon=name=>socialControlIcon(name,16);
  const art=(name,size=32)=>'<img class="lv-art" width="'+size+'" height="'+size+'" src="'+artwork+'issue-2040-oneqr-'+name+'-3d.png" alt="">';
  const card=(body,extra='')=>'<section class="lv-card '+extra+'">'+body+'</section>';
  const chip=(text,style='')=>'<span class="lv-chip '+style+'">'+esc(text)+'</span>';
  const head=(heading,help='')=>'<h3>'+esc(heading)+'</h3>'+(help?'<p class="lv-note">'+esc(help)+'</p>':'');
  const row=(name,help='',control='',mark='')=>'<div class="lv-row">'+mark+'<div class="lv-grow"><strong>'+esc(name)+'</strong>'+(help?'<small>'+esc(help)+'</small>':'')+'</div>'+control+'</div>';
  const field=(label,name,value='',attrs='')=>'<label class="lv-field">'+esc(label)+'<input name="'+name+'" value="'+esc(value)+'" '+attrs+'></label>';
  const textarea=(label,name,value='',attrs='')=>'<label class="lv-field">'+esc(label)+'<textarea name="'+name+'" rows="2" '+attrs+'>'+esc(value)+'</textarea></label>';
  const toggle=(name,label,checked,help='')=>'<label class="lv-row lv-toggle"><span class="lv-grow"><strong>'+esc(label)+'</strong>'+(help?'<small>'+esc(help)+'</small>':'')+'</span><input name="'+name+'" type="checkbox" role="switch" '+(checked?'checked':'')+'></label>';
  const submit=(label,style='primary')=>'<button type="submit" class="lv-btn '+style+'">'+esc(label)+'</button>';
  const form=(name,body,label)=>'<form data-live-po-form="'+name+'">'+body+(label?'<div class="lv-actions">'+submit(label)+'</div>':'')+'</form>';
  const personBadge=name=>'<span class="lv-avatar" aria-hidden="true">'+esc(Array.from(name||'N')[0])+'</span>';
  const empty=()=>'<p class="lv-note">'+t('Chưa có dữ liệu.','No entries yet.')+'</p>';
  const purposes={
    none:['Không có','None','Circle',[]],
    explore:['Khám phá / Du lịch / Ẩm thực','Discovery / Travel / Food','Compass',['place','map','chapter']],
    tutorial:['Hướng dẫn / Dạy nghề','Tutorial / Training','GraduationCap',['pip','draw','qa','chapter']],
    music:['Biểu diễn / Giải trí','Performance / Entertainment','Mic',['music','songs','library']],
    community:['Cộng đồng / Họp mặt','Community / Gathering','HandHeart',['hands','moderation','guest']],
  };
  const toolLabels={
    guest:['Mời lên sóng','Invite on stage','UserRoundPlus'],poll:['Tạo Poll','Create poll','ChartNoAxesColumn'],qa:['Hộp Q&A','Q&A inbox','CircleHelp'],hands:['Giơ tay','Raise hand','Hand'],
    services:['Kệ dịch vụ','Service shelf','PanelsTopLeft'],flash:['Flash Deal','Flash deal','Zap'],deals:['Gắn deal/coupon','Pin deal / coupon','Ticket'],wheel:['Quay thưởng','Lucky Wheel','Gift'],
    oneqr:['Hiện OneQR','Show OneQR','QrCode'],leads:['Khách đã chốt','Live leads','ClipboardList'],overlay:['Overlay chữ','Text overlay','Tag'],title:['Sửa tiêu đề','Edit title','Pencil'],
    place:['Thẻ địa điểm','Place card','MapPin'],map:['Thẻ bản đồ','Map card','Map'],chapter:['Đánh dấu chương','Mark chapter','Bookmark'],pip:['Camera phụ PiP','Second camera (PiP)','Video'],
    draw:['Vẽ chú thích','Draw annotation','Paintbrush'],music:['Chế độ âm thanh nhạc','Music mode','Music'],library:['Nhạc được phép','Licensed music','ListMusic'],songs:['Yêu cầu bài hát','Song requests','AudioLines'],
    moderation:['Kiểm duyệt & an toàn','Moderation & safety','Shield'],report:['Báo cáo chuyển đổi','Conversion report','ChartNoAxesCombined'],
    recap:['Tổng kết buổi live','Live recap','Sparkles'],replay:['Bản ghi buổi live','Live recording','Clapperboard'],
    share:['Chia sẻ Zalo / Facebook','Share to Zalo / Facebook','Share2'],contacts:['Mời bạn từ danh bạ','Invite contacts','ContactRound'],
    notify:['Thông báo','Notifications','Bell'],schedule:['Lên lịch buổi live','Schedule live','CalendarDays'],
  };
  const label=key=>t(...toolLabels[key].slice(0,2));
  const purposeLabel=key=>t(...(purposes[key]||purposes.none).slice(0,2));
  const tile=key=>action('panel',label(key),{value:key,icon:icon(toolLabels[key][2]),style:'tool'});
  const categories=[['all','Tất cả','All',''],['salon','Nail & làm đẹp','Nail & beauty','paintbrush'],['food','Ẩm thực','Food','store'],['travel','Du lịch','Travel','map'],['houston','Houston','Houston','map']];
  const demoRooms=[
    {id:'po-live-bitcoin',title:['Tư vấn mẫu nail Tết + ưu đãi khách mới','Lunar New Year nail ideas + new guest offer'],host:'BITCOIN NAIL BAR',category:'salon',pageId:'p1',city:'Houston, TX',viewers:248,art:'paintbrush',cover:'/html/v3.1/community/live-photos/nails.jpg',dealId:'extra-po-new-guest',serviceId:'gel-manicure',oneqr:true,purpose:'none'},
    {id:'po-live-pho',title:['Vào bếp: phở gia truyền cuối tuần','In the kitchen: weekend family pho'],host:'Phở Gà Houston',category:'food',city:'Houston, TX',viewers:96,art:'store',cover:'/html/v3.1/community/modules/hub-tools/media/dbaf5871be9452a3.jpg',purpose:'explore'},
    {id:'po-live-brian',title:['Hát theo yêu cầu — tối thứ Bảy','Song requests on Saturday night'],host:'BrianNguyenAI',category:'music',city:'Houston, TX',viewers:57,art:'music',cover:'/html/v3.1/community/live-photos/music.jpg',purpose:'music'},
  ].map(room=>({...room,sample:true,poLive:true,status:'live',description:''}));
  sampleLiveRooms.unshift(...demoRooms);
  for(const room of sampleLiveRooms){
    if(['sample-live-shop','sample-live-talk','sample-live-nails','sample-live-community'].includes(room.id))room.cover='/html/v3.1/community/live-photos/nails.jpg';
  }
  const demoChat=[
    {author:'Lan P.',text:['Cho em hỏi giá bộ này ạ?','How much is this set?']},
    {author:'Hùng T.',text:['Mình comment "GEL20" là chốt đơn đúng không shop?','Do I comment "GEL20" to order?']},
  ];
  const demoGuests=['Lan Phạm','Kevin Trần','Mai Anh'];
  const samplePoll={question:['Bộ nail tiếp theo mọi người muốn xem mẫu nào?','Which nail set would you like to see next?'],choices:[['Mẫu Tết đỏ vàng','Red and gold Lunar New Year set'],['Mẫu French thanh lịch','Classic French set'],['Mẫu đính đá','Gemstone set']],counts:[104,58,24],votes:{}};
  const sampleQA=[{id:'sample-qa',author:'Kevin T.',text:['Gel có bền hơn bột không ạ?','Does gel last longer than acrylic?']}];
  let category='all',directoryPageId='',viewer=false,setup=null,dialogPanel='',dialogRoom='',cameraFacing='user',cameraRequest=0,pipStream=null,caption='en',quality='720p',ageAccepted=new Set(),flashClock,recording=null,downloadUrl='',replayUrl='',foreignRoom=null,cancelTrim=null;
  state.livePOViewer||={};
  state.livePONotifications||=[];
  state.livePOChannels||={};

  function records(){try{return JSON.parse(localStorage.getItem(recordKey)||'{}');}catch{return {};}}
  const previousLookup=liveRoomById;
  liveRoomById=function(id){return previousLookup(id)||(foreignRoom?.id===id?foreignRoom:undefined);};
  function resolveLink(entries,id){
    const series=entries.filter(room=>room.seriesId===id);
    if(!series.length)return entries.find(room=>room.id===id);
    return series.find(room=>room.status==='live')||
      series.filter(room=>room.status==='scheduled').sort((a,b)=>a.scheduledAt-b.scheduledAt)[0]||
      series.sort((a,b)=>b.scheduledAt-a.scheduledAt)[0];
  }
  function loadForeignRoom(id,ownerId){
    if(!/^NX-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(ownerId||''))return null;
    try{
      const saved=JSON.parse(localStorage.getItem('nexora-v31:community-hub-tools:'+ownerId)||'{}');
      return resolveLink((saved.liveRooms||[]).filter(room=>room.ownerId===ownerId&&canWatchRoom(room)&&
        (room.status!=='ended'||room.summary?.published===true)),id)||null;
    }catch{return null;}
  }
  function getRoom(id=activeLiveRoom){
    const room=liveRoomById(id);
    return room&&!own(room)?{...room,...state.livePOViewer[id]?.room}:room;
  }
  function prefs(id){return state.livePOViewer[id]||{};}
  function saveViewer(id,patch){
    const before=state.livePOViewer[id];
    state.livePOViewer[id]={...before,...patch};
    if(save())return true;
    if(before)state.livePOViewer[id]=before;else delete state.livePOViewer[id];
    return false;
  }
  function updateRoom(room,patch){
    if(!own(room))return saveViewer(room.id,{room:{...prefs(room.id).room,...patch}});
    const index=state.liveRooms.findIndex(row=>row.id===room.id);
    if(index<0)return false;
    const before=state.liveRooms[index];
    state.liveRooms[index]={...before,...patch};
    if(save())return true;
    state.liveRooms[index]=before;
    return false;
  }
  function directory(){
    return window.NEXORA_COMMUNITY_PEOPLE?.list?.()||[];
  }
  function destinations(){
    const pages=state.fanpages.filter(page=>!page.sample&&(!page.bridgeOwner||page.bridgeOwner===shared.member));
    const groups=state.customGroups.filter(group=>group.owned&&!group.archived&&(!group.bridgeOwner||group.bridgeOwner===shared.member));
    return [{id:'feed',name:t('Bảng tin chính','Main Feed')},
      ...pages.map(page=>({id:'page:'+page.id,name:'Page '+page.name,info:t('Page của bạn','Your Page')})),
      ...groups.map(group=>({id:'group:'+group.id,name:group.name,info:t('Nhóm của bạn','Your group')}))];
  }
  function dealsFor(room){
    const data=records();
    return (data.feed||[]).filter(row=>row.kind==='deal'&&(!row.status||row.status==='published')&&(room.pageId?row.pageId===room.pageId:row.owner===shared.member)&&
      (row.expiresAt?Number(row.expiresAt)>Date.now():!row.expires||Date.parse(row.expires+'T23:59:59')>Date.now()));
  }
  function servicesFor(room){
    const page=pageRecord(room.pageId),services=page?.poSupplement?.services||state.pageServices[room.pageId]||[];
    return services.filter(service=>service.name);
  }
  function roomHost(room){return room.host||pageRecord(room.pageId)?.title||(own(room)?person():t('Thành viên Community','Community member'));}
  function roomMark(room){return art(room.art||(room.category==='salon'?'paintbrush':'tv'),56);}
  function roomName(room){return newsText(room.title)||t('Buổi live','Livestream');}
  function hostMode(room){return own(room)&&!viewer;}
  function canOpenReplay(room){return room.sample||hostMode(room)||room.summary?.published===true;}
  function isPrivate(room){return room.rehearsal===true;}
  function canWatchRoom(room){
    return !isPrivate(room)||own(room)||room.guests?.some(guest=>guest.nxId===shared.me().id||guest.name===shared.member||guest.name===person());
  }
  function openRoom(id,view=false){
    if(!liveRoomById(id))return;
    stopAllMedia();closeDialog();
    activeLiveRoom=id;viewer=view;caption='en';quality='720p';current='live';
    render();
  }
  function closeDialog(){cancelTrim?.();if($('editor').open)$('editor').close();}
  function showDialog(heading,body,key,room=''){
    const dialog=$('editor');
    if(dialogPanel==='trim')cancelTrim?.();
    if(replayUrl){URL.revokeObjectURL(replayUrl);replayUrl='';}
    dialog.classList.remove('social-dialog');
    dialog.classList.add('lv-dialog');
    dialog.setAttribute('aria-labelledby','lv-dialog-title');
    $('dialog-content').innerHTML='<div class="lv-dialog-head"><h2 id="lv-dialog-title">'+esc(heading)+'</h2>'+action('close','×',{style:'close'})+'</div><div class="lv-dialog-body">'+body+'<p class="lv-feedback" role="alert"></p></div>';
    const closer=dialog.querySelector('[data-live-po="close"]');
    closer.setAttribute('aria-label',t('Đóng','Close'));
    dialogPanel=key;dialogRoom=room;
    if(!dialog.open)dialog.showModal();
  }
  function feedback(message){const dialog=$('editor'),slot=dialog.open&&dialog.querySelector('.lv-feedback');if(slot)slot.textContent=message;else notice(message);}
  $('editor').addEventListener('close',()=>{
    const dialog=$('editor');
    if(dialog.open||!dialog.classList.contains('lv-dialog'))return;
    if(replayUrl){URL.revokeObjectURL(replayUrl);replayUrl='';}
    cancelTrim?.();
    if(['setup','purpose','schedule'].includes(dialogPanel))stopAllMedia();
    dialog.classList.remove('lv-dialog');
    dialog.removeAttribute('aria-labelledby');dialogPanel='';dialogRoom='';
  });
  function baseSetup(room){
    return room?{...room,editing:room.id}:{title:'',description:'',purpose:'none',destinations:destinations().map(row=>row.id),rehearsal:false,beauty:true,dealId:'',scheduledAt:'',weekly:false,remind:true};
  }
  function destinationPage(destinations,preferredId){
    if(preferredId&&destinations.includes('page:'+preferredId))return preferredId;
    return destinations.find(id=>id.startsWith('page:'))?.slice(5)||'';
  }
  function setupPage(room){
    if(room||!setup)setup=baseSetup(room);
    const chosen=new Set(setup.destinations||[]),pageId=destinationPage([...chosen],setup.pageId);
    const deal=dealsFor({pageId}).find(row=>row.id===setup.dealId);
    const dealRows=dealsFor({pageId}).map(row=>'<option value="'+esc(row.id)+'" '+(row.id===setup.dealId?'selected':'')+'>'+esc(row.title)+'</option>').join('');
    const setupCamera='<div class="lv-preview"><video id="live-camera" autoplay muted playsinline class="'+(setup.beauty?'lv-beauty':'')+'"></video><div id="camera-placeholder">'+art('camera',50)+'</div><div class="lv-preview-actions">'+action('camera',t('Xem trước camera','Preview camera'),{icon:icon('Camera')})+action('beauty',t('Filter làm đẹp','Beauty filter'),{icon:icon('Sparkles'),pressed:setup.beauty,style:'soft'})+'</div></div>';
    const fields=card(setupCamera+field(t('Tiêu đề buổi live','Live title'),'title',setup.title,'required maxlength="100"')+textarea(t('Mô tả','Description'),'description',setup.description,'maxlength="800"')+row(t('Mục đích buổi live','Live purpose'),purposeLabel(setup.purpose),action('purpose',t('Chọn','Choose'),{style:'soft'}),icon('Compass')));
    const destinationFields=card(head(t('Nơi đăng','Destinations'),t('Mặc định chọn tất cả. Bỏ chọn nơi không nhận buổi live.','All selected by default. Uncheck any destination you want to leave out.'))+destinations().map(row=>'<label class="lv-row lv-destination"><input type="checkbox" name="destinations" value="'+esc(row.id)+'" '+(chosen.has(row.id)?'checked':'')+'><span class="lv-grow"><strong>'+esc(row.name)+'</strong>'+(row.info?'<small>'+esc(row.info)+'</small>':'')+'</span>'+chip(t('Đã chọn','Selected'),'green')+'</label>').join(''));
    const settings=card(toggle('rehearsal',t('Phát thử riêng tư','Private rehearsal'),setup.rehearsal,t('Chỉ bạn và người được mời xem được.','Only you and invited guests can view.'))+
      row(t('Phát qua OBS / Stream key','OBS / Stream key'),t('Khóa phát cần kết nối dịch vụ live.','Stream keys require the livestream service.'),action('obs',t('Sao chép','Copy'),{disabled:true}),icon('Monitor'))+
      row(t('Phát đồng thời FB / TikTok / YouTube','Simulcast to Facebook / TikTok / YouTube'),t('Bình luận không đồng bộ giữa nền tảng.','Comments are separate across platforms.'),chip(t('Chờ quyết định','Awaiting decision'),'amber'),icon('Globe'))+
      '<label class="lv-field">'+t('Gắn deal của tiệm vào live','Pin a deal to the live')+'<select name="dealId"><option value="">'+t('Không gắn deal','No pinned deal')+'</option>'+dealRows+'</select></label>'+(deal?'<small class="lv-note">'+esc(deal.title)+'</small>':''));
    showDialog(t('Tạo buổi live','Create livestream'),form('setup',fields+destinationFields+settings+'<p class="lv-demo">'+t('Bản mẫu · camera chỉ xem trên thiết bị này.','Demo · camera preview stays on this device.')+'</p><div class="lv-actions">'+action('schedule',t('Lên lịch sau','Schedule for later'),{icon:icon('CalendarDays')})+submit(t('Phát live ngay','Go live now'))+'</div>'),'setup');
    syncCamera();
  }
  function readSetup(){
    const editor=$('editor').querySelector('[data-live-po-form="setup"]');
    if(!editor)return;
    const values=new FormData(editor);
    Object.assign(setup,{title:values.get('title').trim(),description:values.get('description').trim(),destinations:values.getAll('destinations'),rehearsal:values.has('rehearsal'),dealId:values.get('dealId')});
  }
  function purposePage(){
    readSetup();stopAllMedia();
    showDialog(t('Buổi live này để làm gì?','What is this livestream for?'),'<p class="lv-note">'+t('Chọn mục đích để nạp bộ công cụ phù hợp. Chat, kiểm duyệt, bản ghi và thống kê dùng chung.','Choose a purpose to load its tools. Chat, moderation, recording and stats are available in every room.')+'</p>'+
      Object.entries(purposes).sort(([a],[b])=>(a==='none')-(b==='none')).map(([id,info])=>card(row(purposeLabel(id),'',action('pick-purpose',setup.purpose===id?t('Đang chọn','Selected'):t('Chọn','Select'),{value:id,pressed:setup.purpose===id,style:'soft'}),icon(info[2]))+
      (info[3].length?'<div class="lv-chips">'+info[3].map(key=>chip(label(key),'violet')).join('')+'</div>':''))).join('')+
      '<div class="lv-actions">'+action('return-setup',t('Tiếp tục thiết lập','Continue setup'),{style:'primary',icon:icon('ArrowRight')})+'</div>','purpose');
  }
  function schedulePage(room){
    if(room)setup=baseSetup(room);else readSetup();
    stopAllMedia();
    const localTime=setup.scheduledAt?inputTime(setup.scheduledAt):'';
    const upcoming=state.liveRooms.filter(row=>row.status==='scheduled'&&own(row)).sort((a,b)=>a.scheduledAt-b.scheduledAt);
    const scheduleFields=card(field(t('Tiêu đề buổi live','Live title'),'title',setup.title,'required maxlength="100"')+
      '<div class="lv-grid2">'+field(t('Ngày','Date'),'date',localTime.slice(0,10),'type="date" required')+field(t('Giờ bắt đầu','Start time'),'time',localTime.slice(11,16),'type="time" required')+'</div>'+
      toggle('weekly',t('Lặp lại hằng tuần','Repeat weekly'),setup.weekly,t('Mỗi buổi có một trang chờ và link riêng.','Each session has its own waiting room and stable link.'))+
      toggle('remind',t('Nhắc người theo dõi','Remind followers'),setup.remind,t('Gửi nhắc qua trung tâm thông báo.','Use in-app notifications for reminders.')));
    const waiting=upcoming.length?card(head(t('Trang chờ của buổi đã lên lịch','Scheduled waiting rooms'))+upcoming.map(rowData=>row(roomName(rowData),dateLabel(rowData.scheduledAt)+' · '+timeLabel(rowData.scheduledAt),'<div class="lv-actions">'+action('copy',t('Sao chép link','Copy link'),{value:rowData.id})+action('edit-schedule',t('Sửa buổi này','Edit session'),{value:rowData.id})+'</div>',icon('CalendarDays'))).join('')):'';
    showDialog(label('schedule'),form('schedule',scheduleFields+waiting,t('Lưu lịch live','Save schedule')),'schedule');
  }
  function nextWeek(room){
    const date=new Date(room.scheduledAt);date.setDate(date.getDate()+7);
    return {...room,id:'live-'+crypto.randomUUID(),scheduledAt:date.getTime(),seriesId:room.seriesId||room.id};
  }
  function announce(room){
    if(isPrivate(room))return;
    const existing=new Set(state.feedPosts.map(post=>post.id)),url=liveLink(room);
    const rows=(room.destinations||[]).map(destination=>{
      const [kind,ref]=destination.split(':'),pageId=kind==='page'?ref:'',groupId=kind==='group'?ref:'';
      return {id:room.id+'-'+destination,kind:'post',status:'published',title:roomName(room),
        body:[room.description,url].filter(Boolean).join('\n'),author:roomHost(room),initials:roomHost(room).slice(0,2),
        pageId,groupId,groupStatus:'approved',visibility:'public',language:state.lang==='vi'?'vi':'en',
        area:room.city,createdAt:new Date().toISOString(),date:dateLabel(Date.now()),
        bridgeSource:pageId?'pagePosts':'feed',bridgeOwner:shared.member};
    });
    state.feedPosts=[...rows.filter(post=>!existing.has(post.id)),...state.feedPosts];
  }
  function persistSetup(scheduledAt=0){
    const editing=setup.editing&&getRoom(setup.editing),dest=setup.destinations||[];
    if(!setup.title.trim())throw Error(t('Nhập tiêu đề buổi live.','Enter a live title.'));
    if(!dest.length&&!setup.rehearsal)throw Error(t('Chọn ít nhất một nơi đăng.','Select at least one destination.'));
    const pageId=destinationPage(dest,setup.pageId);
    const page=pageRecord(pageId),bitcoin=pageId==='p1';
    const room={...editing,id:editing?.id||'live-'+crypto.randomUUID(),title:setup.title,description:setup.description,
      purpose:setup.purpose,destinations:dest,rehearsal:setup.rehearsal,beauty:setup.beauty,
      status:scheduledAt?'scheduled':'live',owner:shared.member,ownerId:shared.me().id,city:page?.city||state.feedArea,
      host:page?.title||person(),pageId,category:bitcoin?'salon':setup.purpose==='explore'?'travel':setup.purpose,
      dealId:dealsFor({pageId}).some(deal=>deal.id===setup.dealId)?setup.dealId:'',
      oneqr:bitcoin||editing?.oneqr,overlay:editing?.overlay||null,scheduledAt,weekly:setup.weekly,remind:setup.remind,
      startedAt:scheduledAt?null:Date.now()};
    const before=state.liveRooms,beforePosts=state.feedPosts;
    state.liveRooms=[room,...before.filter(row=>row.id!==room.id)];
    if(scheduledAt&&room.weekly&&!editing){
      room.seriesId=room.id;
      state.liveRooms.push(nextWeek(room));
    }
    if(!scheduledAt)announce(room);
    if(!save()){state.liveRooms=before;state.feedPosts=beforePosts;throw Error(t('Không thể lưu. Vui lòng thử lại.','Unable to save. Please try again.'));}
    stopAllMedia();closeDialog();setup=null;
    if(scheduledAt){activeLiveRoom=room.id;viewer=false;current='live';render();}
    else{pushRoomNotice(room,'live',t('Buổi live bắt đầu','Livestream started'),roomName(room));openRoom(room.id);}
  }
  openSocialLiveComposer=openLiveComposer=function(pageId=directoryPageId){
    setup=baseSetup();
    setup.pageId=destinationPage(setup.destinations,pageId);
    setupPage();
  };

  const originalLivePage=livePage;
  function originalLiveHero(){
    // Reuse the original PO hero markup and its existing action hooks.
    return originalLivePage().match(/<section class="live-hero">[\s\S]*?<\/section>/)?.[0]||'';
  }
  function listPage(){
    const visible=rooms().filter(room=>!isPrivate(room)||own(room))
      .filter(room=>!directoryPageId||room.pageId===directoryPageId||room.destinations?.includes('page:'+directoryPageId))
      .filter(room=>category==='all'||(category==='houston'?room.city?.includes('Houston'):room.category===category));
    const live=visible.filter(room=>!['ended','scheduled','sample'].includes(room.status));
    const schedule=visible.filter(room=>room.status==='scheduled');
    const replays=visible.filter(room=>['ended','sample'].includes(room.status)&&canOpenReplay(room));
    const cardMarkup=room=>{
      const running=!['ended','scheduled','sample'].includes(room.status);
      return '<article class="lv-card lv-directory-card"><button type="button" class="lv-room-link" data-live-po="open" data-live-value="'+esc(room.id)+'"><div class="lv-cover lv-cover-'+esc(room.category||'none')+'">'+
        (room.cover?'<img class="lv-cover-image" src="'+esc(room.cover)+'" alt="">':roomMark(room))+
        chip(running?'LIVE':room.status==='scheduled'?t('Lên lịch','Scheduled'):t('Xem lại','Replay'),running?'red':'violet')+
        (running&&room.viewers?'<span class="lv-watch">'+icon('Eye')+room.viewers+'</span>':'')+'</div><div class="lv-room-card-copy">'+personBadge(roomHost(room))+
        '<div><strong>'+esc(roomName(room))+'</strong><small>'+esc(roomHost(room))+' · '+esc(room.status==='scheduled'?dateLabel(room.scheduledAt)+' · '+timeLabel(room.scheduledAt):room.city||'')+(room.sample?' · '+t('Mẫu','Sample'):'')+'</small></div></div></button></article>';
    };
    const group=(name,rows)=>rows.length?'<h2 class="lv-subhead">'+esc(name)+'</h2><div class="lv-directory-grid">'+rows.map(cardMarkup).join('')+'</div>':'';
    return originalLiveHero()+'<section class="lv-surface"><header class="lv-top live-hero"><div class="lv-actions">'+action('panel',label('notify'),{value:'notify',icon:icon('Bell')})+'</div></header>'+
      '<div class="lv-filter"><select data-live-category aria-label="'+esc(t('Bộ lọc','Filters'))+'">'+categories.map(([id,vi,en])=>'<option value="'+id+'"'+(category===id?' selected':'')+'>'+esc(t(vi,en))+'</option>').join('')+'</select></div>'+
      (live.length?'<div class="lv-directory-grid">'+live.map(cardMarkup).join('')+'</div>':card(empty()))+
      group(t('Đã lên lịch','Scheduled'),schedule)+group(t('Bản xem lại','Replays'),replays)+'</section>';
  }
  livePage=function(){const room=getRoom();return room?liveRoomPage(room.id):listPage();};

  function oneQrUrl(room){
    const page=pageRecord(room.pageId);
    const url=page?.poSupplement?.oneQr||page?.oneQr;
    if(typeof url==='string'&&/^https?:\/\//i.test(url))return url;
    return room.pageId==='p1'?new URL('/html/oneqr-dev/index.html',location.origin).href:'';
  }
  function overlay(room){
    const page=pageRecord(room.pageId);
    return room.overlay||{
      name:roomHost(room),phone:page?.phone||(room.pageId==='p1'?'(346) 802-4906':''),
      address:page?.address||(room.pageId==='p1'?'9793 Westheimer Rd, Houston, TX 77042':''),
    };
  }
  function flashMarkup(room){
    if(!room.flash||room.flash.expiresAt<=Date.now())return '';
    return '<span class="lv-chip amber" data-lv-flash="'+room.flash.expiresAt+'">'+icon('Zap')+esc(room.flash.name)+' · <time>'+clock(Math.ceil((room.flash.expiresAt-Date.now())/1000))+'</time></span>';
  }
  function pinned(room){
    const deal=dealsFor(room).find(row=>row.id===room.dealId);
    const service=servicesFor(room).find(row=>row.id===room.serviceId)||state.shop.items.find(item=>item.id===room.productId);
    const getDeal=deal?row(deal.title,t('Deal của '+roomHost(room),'Offer from '+roomHost(room)),action('coupon',t('Nhận','Get coupon'),{value:deal.id,style:'soft'}),art('ticket',32)):'';
    const getService=service?row(service.name||service.title,service.price?'$'+service.price:t('Giá theo thực đơn SIPOS của tiệm','Price from the salon’s SIPOS menu'),action('service-link',t('Xem','View'),{style:'soft'}),art('paintbrush',32)):'';
    const getFlash=flashMarkup(room)?row(room.flash.name,t('Số lượng có hạn','Limited quantity'),action('claim-flash',t('Nhận','Claim'),{style:'soft',disabled:!room.flash.dealId}),art('ticket',32)):'';
    return (getDeal||getService||getFlash)?'<div class="lv-pins">'+getService+getDeal+(getFlash?'<div data-lv-flash-card>'+getFlash+'</div>':'')+'</div>':'';
  }
  function chat(room){return [...(room.id==='po-live-bitcoin'?demoChat:[]),...(state.liveChats[room.id]||[])];}
  function chatRows(room,host){
    return chat(room).slice(-8).map((message,index)=>'<div class="lv-comment">'+personBadge(message.author)+'<div class="lv-grow"><strong>'+esc(message.author)+'</strong> '+esc(newsText(message.text))+'</div>'+
      (host&&message.id?action('pin-comment',t('Ghim','Pin'),{value:message.id,style:'soft',pressed:room.pinnedComment===message.id}):'')+'</div>').join('');
  }
  function stageButton(key,label,mark,pressed){
    return action(key,label,{style:'stage-button',icon:icon(mark),pressed});
  }
  function waitingRoom(room){
    return '<section class="lv-surface"><header class="lv-top">'+action('back',t('Đang live','Live Now'),{icon:icon('ArrowLeft')})+'</header>'+
      card('<div class="lv-cover">'+roomMark(room)+chip(t('Đã lên lịch','Scheduled'),'violet')+'</div>'+head(roomName(room),roomHost(room))+'<p>'+esc(newsText(room.description)||'')+'</p><p>'+dateLabel(room.scheduledAt)+' · '+timeLabel(room.scheduledAt)+'</p><div class="lv-actions">'+
      action('copy',t('Sao chép link','Copy link'),{value:room.id,icon:icon('Copy')})+
      (hostMode(room)?action('edit-schedule',t('Sửa buổi này','Edit session'),{value:room.id})+action('start-scheduled',t('Phát live ngay','Go live now'),{style:'primary',icon:icon('Video')})
        :action('remind',prefs(room.id).remind?t('Đã đặt nhắc lịch','Reminder set'):t('Nhắc tôi','Remind me'),{pressed:!!prefs(room.id).remind,style:'primary',icon:icon('Bell')}))+'</div>')+'</section>';
  }
  function gate(room){
    const blocked=!canWatchRoom(room);
    return '<section class="lv-surface"><header class="lv-top">'+action('back',t('Đang live','Live Now'),{icon:icon('ArrowLeft')})+'</header>'+card(head(blocked?t('Phát thử riêng tư','Private rehearsal'):t('Giới hạn độ tuổi 18+','Ages 18 and over'),blocked?t('Chỉ bạn và người được mời xem được.','Only the host and invited guests can view.'):'')+(blocked&&own(room)?action('host',t('Chủ buổi','Host'),{style:'primary'}):blocked?'':action('age',t('Tôi đủ 18 tuổi','I am 18 or over'),{style:'primary'})))+'</section>';
  }
  function replayView(room){
    if(!canOpenReplay(room)){
      return '<section class="lv-surface"><header class="lv-top">'+action('back',t('Đang live','Live Now'),{icon:icon('ArrowLeft')})+'</header>'+
        card(head(t('Bản xem lại chờ duyệt','Replay pending review'))+(own(room)?action('host',t('Góc chủ buổi','Host view'),{style:'soft'}):''))+'</section>';
    }
    const recording=room.videoId?'<video class="lv-replay" data-video-id="'+esc(room.videoId)+'" controls playsinline></video>':'<div class="lv-cover">'+roomMark(room)+chip(t('Bản xem lại','Replay'),'violet')+'</div>';
    return '<section class="lv-surface"><header class="lv-top"><div><h1>'+esc(roomName(room))+'</h1><p class="lv-note">'+esc(roomHost(room))+'</p></div>'+action('back',t('Đang live','Live Now'),{icon:icon('ArrowLeft')})+'</header>'+
      card(recording+(room.summary?.published?'<p class="lv-recap"><b>NEXI (AI)</b> '+esc(room.summary.body)+'</p>':'')+
      '<div class="lv-actions">'+tile('replay')+(own(room)?tile('recap')+tile('report'):'')+'</div>')+'</section>';
  }
  liveRoomPage=function(id){
    const room=getRoom(id);
    if(!room)return listPage();
    if(!canWatchRoom(room)||(!hostMode(room)&&room.safety?.age&&!ageAccepted.has(room.id)))return gate(room);
    if(room.status==='scheduled')return waitingRoom(room);
    if(['ended','sample'].includes(room.status))return replayView(room);
    const host=hostMode(room),who=roomHost(room),name=roomName(room),info=overlay(room),follows=!!prefs(id).follow;
    const participants=room.guests||[],mods=room.safety||{},tools=(purposes[room.purpose]||purposes.none)[3];
    const titleText=host?'<div class="lv-chips">'+chip('LIVE','red')+chip(room.viewers?room.viewers+' '+t('đang xem','watching'):t('Xem thử','Preview'))+
      '<span class="lv-chip" data-lv-elapsed="'+(room.startedAt||Date.now())+'">'+clock(elapsed(room))+'</span>'+action('panel',t('Cảnh báo nhạc','Music warning'),{value:'library',style:'amber',icon:icon('TriangleAlert')})+'</div>'
      :'<div class="lv-viewer-id">'+personBadge(who)+'<div class="lv-grow"><strong>'+esc(who)+'</strong><small>'+esc(room.viewers?room.viewers+' '+t('đang xem','watching'):name)+'</small></div>'+action('follow',follows?t('Đang theo dõi','Following'):t('+ Theo dõi','+ Follow'),{style:'primary',pressed:follows})+chip('LIVE','red')+(mods.age?chip('18+'):'')+'</div>';
    const controls=host?'<div class="lv-stage-controls">'+stageButton('mute',room.muted?t('Bật tiếng','Unmute'):t('Tắt tiếng','Mute'),room.muted?'MicOff':'Mic',!!room.muted)+
      stageButton('switch-camera',t('Đổi camera','Flip camera'),'SwitchCamera')+stageButton('beauty',t('Làm đẹp','Beauty'),'Sparkles',!!room.beauty)+
      action('panel',t('Công cụ','Tools'),{style:'stage-button',value:'tools',icon:icon('BriefcaseBusiness')})+stageButton('end',t('Kết thúc','End'),'Square')+'</div>':'';
    const captions=caption==='off'?'':'<span class="lv-caption">CC · '+caption.toUpperCase()+': '+esc(room.id==='po-live-bitcoin'?(caption==='vi'?'“…mẫu này giữ được 3 tuần…”':'“…this set lasts three weeks…”'):t('Phụ đề','Captions'))+'</span>';
    const options=host?'':action('caption','VI | EN',{style:'stage-pill'})+
      '<label class="lv-quality"><span class="lv-sr">'+t('Chất lượng phát','Playback quality')+'</span><select data-live-quality><option '+(quality==='720p'?'selected':'')+'>720p</option><option '+(quality==='480p'?'selected':'')+'>480p</option><option '+(quality==='360p'?'selected':'')+'>360p</option></select></label>';
    const viewerChat=host?'':'<div class="lv-viewer-chat">'+chatRows(room,false)+'</div>'+commentForm(room);
    const pinnedComment=chat(room).find(row=>row.id===room.pinnedComment);
    const linkedPlace=room.place?'<a class="lv-place" href="'+mapLink(room.place.address)+'" target="_blank" rel="noopener noreferrer">'+icon('MapPin')+esc(room.place.name)+'</a>':'';
    const qrUrl=oneQrUrl(room);
    const showQr=room.oneqr&&qrUrl?'<a class="lv-oneqr" href="'+esc(qrUrl)+'" target="_blank" rel="noopener noreferrer" aria-label="OneQR">'+icon('QrCode')+'<small>OneQR</small></a>':'';
    const side=host?card(head(t('Trò chuyện trong phòng','Room chat'))+'<div class="lv-room-chat">'+chatRows(room,true)+'</div>'+commentForm(room))+
      (tools.length?card(head(t('Theo mục đích buổi live','Purpose tools'))+'<div class="lv-tool-grid">'+tools.map(tile).join('')+'</div>'):'')
      :'<div class="lv-actions">'+tile('share')+tile('contacts')+tile('qa')+tile('hands')+(room.purpose==='music'?tile('songs'):'')+'</div><p class="lv-note">'+t('Quà tặng / Tip: chờ quyết định.','Gifts / Tips: awaiting decision.')+'</p>';
    return '<section class="lv-surface"><header class="lv-top"><div><h1>'+esc(name)+'</h1><p class="lv-note">'+t('Bản mẫu · camera chỉ xem trên thiết bị này.','Demo · camera preview stays on this device.')+'</p></div><div class="lv-actions">'+action('back',t('Đang live','Live Now'),{icon:icon('ArrowLeft')})+
      (own(room)?action(host?'viewer':'host',host?t('Góc người xem','Viewer view'):t('Góc chủ buổi','Host view'),{style:'soft'}):'')+'</div></header>'+
      '<div class="lv-room-layout"><section class="lv-stage" aria-label="'+esc(name)+'"><div class="lv-stage-picture">'+
      (host?'<video id="live-camera" autoplay muted playsinline class="'+(room.beauty?'lv-beauty':'')+'"></video>':'')+
      '<div class="lv-stage-placeholder" id="camera-placeholder">'+roomMark(room)+(host?action('camera',t('Xem trước camera','Preview camera'),{style:'stage-pill',icon:icon('Camera')}):'')+'</div>'+
      '<div class="lv-stage-top">'+titleText+(host&&info.name?'<div class="lv-overlay"><strong>'+esc(info.name)+'</strong>'+(info.phone?' · '+esc(info.phone):'')+(info.address?'<br>'+esc(info.address):'')+'</div>':'')+'</div>'+
      showQr+(participants.filter(row=>row.accepted).length?'<div class="lv-guests">'+participants.filter(row=>row.accepted).map(row=>'<span>'+personBadge(row.name)+esc(row.name)+(row.muted?icon('MicOff'):'')+'</span>').join('')+'</div>':'')+
      (room.pip&&host?'<div class="lv-pip"><video id="lv-pip-camera" autoplay muted playsinline></video><span>'+t('Camera phụ','Second camera')+'</span></div>':'')+
      (room.drawing?'<canvas id="lv-annotation" aria-label="'+t('Vẽ chú thích','Draw annotation')+'"></canvas>':'')+
      '<div class="lv-stage-bottom">'+linkedPlace+pinned(room)+flashMarkup(room)+(pinnedComment?'<div class="lv-caption">'+icon('Pin')+esc(pinnedComment.author+': '+pinnedComment.text)+'</div>':'')+
      '<div class="lv-caption-row">'+captions+options+'</div>'+viewerChat+'</div></div>'+controls+'</section>'+
      '<aside class="lv-room-side">'+(room.poll||room.id==='po-live-bitcoin'?card(pollMarkup(room,host)):'')+side+'</aside></div></section>';
  };
  function commentForm(room){
    return form('comment','<input type="hidden" name="roomId" value="'+esc(room.id)+'"><div class="lv-comment-form"><input name="message" required maxlength="400" aria-label="'+t('Bình luận','Comment')+'" placeholder="'+t('Bình luận…','Comment…')+'">'+
      '<button class="lv-btn primary" aria-label="'+t('Gửi','Send')+'" type="submit">'+icon('Send')+'</button>'+
      action('react','♥',{style:'reaction',pressed:!!prefs(room.id).reacted})+'</div>','');
  }
  function pollFor(room){return room.poll||(room.id==='po-live-bitcoin'?samplePoll:null);}
  function pollMarkup(room,host){
    const poll=pollFor(room);
    if(!poll)return head(t('Poll đang chạy','Active poll'))+empty();
    const vote=poll.votes?.[shared.member],total=poll.counts.reduce((sum,value)=>sum+value,0);
    return head(t('Poll đang chạy','Active poll'))+'<p><strong>'+esc(newsText(poll.question))+'</strong></p>'+poll.choices.map((choice,index)=>{
      const share=total?Math.round(poll.counts[index]*100/total):0;
      return '<div class="lv-poll-choice"><button type="button" class="lv-poll-row" data-live-po="vote" data-live-value="'+index+'" aria-pressed="'+(vote===index)+'" '+(host||vote!==undefined?'disabled':'')+'><span>'+esc(newsText(choice))+'</span><b>'+share+'%</b></button><div class="lv-meter" aria-hidden="true"><i style="width:'+share+'%"></i></div></div>';
    }).join('')+'<p class="lv-note">'+total+' '+t('lượt bình chọn','votes')+'</p>';
  }
  function mapLink(address){return 'https://www.google.com/maps/search/?api=1&query='+encode(address);}
  function toolsPanel(room){
    const packs=[
      [t('Khách & tương tác','Guests & engagement'),['guest','poll','qa','hands']],
      [t('Bán hàng','Selling'),['services','flash','deals','wheel','oneqr','leads','overlay','title']],
      [t('Theo mục đích buổi live','Purpose tools'),[...new Set([...(purposes[room.purpose]||purposes.none)[3],'moderation','library','report','replay','recap'])]],
    ];
    return packs.map(([title,keys])=>'<h3 class="lv-eyebrow">'+esc(title)+'</h3><div class="lv-tool-grid">'+keys.map(tile).join('')+'</div>').join('');
  }
  function guestPanel(room,mode='guest'){
    const guests=room.guests||[],members=directory(),added=mode==='moderator'?room.safety?.moderators||[]:guests.map(row=>row.name);
    const entries=[...new Set([...demoGuests,...members.map(member=>member.name)])].filter(name=>name!==shared.member);
    const nameLabel=mode==='moderator'?t('Thêm người kiểm duyệt','Add moderator'):mode==='contacts'?t('Mời bạn','Invite friend'):t('Mời lên sóng','Invite on stage');
    const stage=mode==='guest'?card(head(t('Sân khấu','Stage'),t('Khách được mời hiện cạnh chủ buổi.','Accepted guests appear next to the host.'))+
      row(roomHost(room),t('Chủ buổi','Host'),'',personBadge(roomHost(room)))+guests.map(guest=>row(guest.name,guest.accepted?t('Khách','Guest'):t('Đã mời','Invited'),'<div class="lv-actions">'+
      (guest.accepted?action('guest-mute',guest.muted?t('Bật mic','Unmute'):t('Tắt mic','Mute'),{value:guest.name}):action('guest-accept',t('Chấp nhận (mẫu)','Accept (demo)'),{value:guest.name,style:'soft'}))+
      action('guest-remove',t('Mời xuống','Remove'),{value:guest.name})+'</div>',personBadge(guest.name))).join('')):'';
    return stage+card(head(mode==='guest'?t('Người xem đang online','Online viewers'):t('Danh bạ','Contacts'))+
      field(t('Tìm người xem hoặc số điện thoại','Find a viewer or phone number'),'guestSearch','','type="search" data-live-person-search')+
      '<div class="lv-person-list">'+entries.map(name=>{
        const contact=members.find(row=>row.name===name);
        return '<div data-live-person="'+esc((name+' '+(contact?.phone||'')).toLowerCase())+'">'+row(name,demoGuests.includes(name)?t('Đang xem · mẫu','Watching · sample'):t('Từ danh bạ','From contacts'),
          action('invite',nameLabel,{value:name,style:'soft',disabled:added.includes(name)}),personBadge(name))+'</div>';
      }).join('')+'</div>');
  }
  function qaPanel(room){
    const questions=[...(room.id==='po-live-bitcoin'?sampleQA:[]),...(room.questions||[])],host=hostMode(room);
    return card(head(t('Hộp hỏi đáp','Q&A inbox'),t('Câu hỏi tách khỏi trò chuyện.','Questions are kept separate from chat.'))+
      (questions.length?questions.map(question=>row(question.author+': '+newsText(question.text),room.answering===question.id?t('Đang trả lời','Answering now'):'',
        host?action('answer',t('Ghim','Pin'),{value:question.id,pressed:room.answering===question.id,style:'soft'}):'',personBadge(question.author))).join(''):empty()))+
      (!host?card(form('question',field(t('Câu hỏi','Question'),'text','','required maxlength="300"'),t('Gửi câu hỏi','Send question'))):'');
  }
  function shelfPanel(room){
    const deals=dealsFor(room),services=servicesFor(room),host=hostMode(room);
    return '<p class="lv-note">'+t('Dịch vụ và deal lấy từ dữ liệu hiện có của tiệm.','Services and deals use the salon’s existing records.')+'</p>'+
      card(head(t('Dịch vụ của tiệm','Salon services'))+(services.length?services.map(service=>row(service.name,service.price?'$'+service.price:t('Giá theo thực đơn SIPOS của tiệm','Price from the salon’s SIPOS menu'),
        action(host?'pin-service':'service-link',host?(room.serviceId===service.id?t('Đang ghim','Pinned'):t('Ghim','Pin')):t('Xem','View'),{value:service.id,style:'soft'}),art('paintbrush'))).join(''):empty()))+
      card(head(t('Deal / coupon đang có','Available deals / coupons'))+(deals.length?deals.map(deal=>row(deal.title,t('Deal & Coupon','Deals & Coupons'),
        action(host?'pin-deal':'coupon',host?(room.dealId===deal.id?t('Đang gắn','Pinned'):t('Gắn vào live','Pin to live')):t('Nhận','Get coupon'),{value:deal.id,style:'soft'}),art('ticket'))).join(''):empty()));
  }
  function safetyPanel(room){
    const safety=room.safety||{};
    return card(head(t('Cài đặt chat','Chat settings'))+form('safety',
      toggle('slow',t('Chế độ chat chậm','Slow mode'),safety.slow,t('10 giây giữa hai bình luận.','10 seconds between comments.'))+
      toggle('followers',t('Chỉ người theo dõi mới bình luận','Followers-only chat'),safety.followers)+
      field(t('Bộ lọc từ khóa','Keyword filter'),'keywords',safety.keywords||'','maxlength="300"')+
      toggle('age',t('Giới hạn độ tuổi 18+','Ages 18 and over'),safety.age),
      t('Lưu thay đổi','Save changes')))+
      card(head(t('An toàn buổi live','Livestream safety'))+
      row(t('AI rà soát hình ảnh live','AI image screening'),t('Cần kết nối dịch vụ live.','Requires the livestream service.'),'',icon('Shield'))+
      row(t('Cảnh báo nhạc bản quyền','Music copyright warning'),'',tile('library'),icon('Music')))+
      card(head(t('Đồng kiểm duyệt','Co-moderators'))+(safety.moderators||[]).map(name=>row(name,t('Đồng kiểm duyệt','Co-moderator'),action('moderator-remove',t('Gỡ','Remove'),{value:name}),personBadge(name))).join('')+
      action('panel',t('+ Thêm người kiểm duyệt','+ Add moderator'),{value:'moderator',style:'soft'}));
  }

  function listPanel(room,key){
    const rows=room[key]||[],host=hostMode(room),hands=key==='hands';
    return card(head(label(key))+(rows.length?rows.map(item=>row(item.name,item.text,
      host?action('queue-remove',t('Tiếp theo','Next'),{value:item.id,style:'soft'}):'',personBadge(item.name))).join(''):empty()))+
      (!host?card(hands?action('raise',t('Giơ tay phát biểu','Raise hand to speak'),{style:'primary',icon:icon('Hand')}):form('song',field(t('Tên bài hát','Song title'),'text','','required maxlength="100"'),t('Gửi yêu cầu','Send request'))):'');
  }
  function leadsPanel(room){
    return card(head(t('Bình luận đúng cú pháp','Recognized comments'),t('GEL20 hoặc BOOK GEL · yêu cầu được lưu trong bản mẫu.','GEL20 or BOOK GEL · requests stay in this demo.'))+
      (room.leads?.length?room.leads.map(item=>row(item.name,item.text,chip(t('Khách tiềm năng','Lead'),'green'),personBadge(item.name))).join(''):empty()));
  }
  function reportPanel(room){
    const stats=room.stats||{},statsRows=[
      [t('Người xem đỉnh','Peak viewers'),room.viewers||stats.views||0],
      [t('Bấm thẻ / deal','Card / deal clicks'),stats.clicks||0],
      [t('Nhận coupon mẫu','Demo coupons claimed'),room.flash?.claimed?.length||0],
      [t('Yêu cầu đặt lịch','Booking requests'),(room.leads||[]).filter(lead=>lead.kind==='booking').length],
    ];
    return '<p class="lv-demo">'+t('Dữ liệu mẫu trong trình duyệt.','Demo data from this browser.')+'</p><div class="lv-grid2">'+statsRows.map(([name,value])=>card('<small>'+esc(name)+'</small><h3>'+value+'</h3>')).join('')+'</div>'+
      card(head(t('Phễu từ live đến POS','Livestream-to-POS funnel'))+
        row(t('Xem live','Live views'),'',chip(String(stats.views||room.viewers||0)))+
        row(t('Bấm deal / thẻ dịch vụ','Deal / service clicks'),'',chip(String(stats.clicks||0)))+
        row(t('Đặt lịch thành công','Confirmed bookings'),'',chip(t('Theo SIPOS','From SIPOS'),'violet'))+
        row(t('Doanh thu ghi nhận tại POS','POS revenue'),'',chip(t('Theo SIPOS','From SIPOS'),'violet'))+
        tile('leads'));
  }
  function notificationPanel(){
    const types=[['live',t('Buổi live bắt đầu / nhắc lịch','Live starts / reminders')],['sales',t('Tin nhắn & đơn bán hàng','Messages & sales')],['replay',t('Đặt lịch & bản xem lại','Bookings & replays')],['activity',t('Tương tác trong live của tôi','Activity in my live')]];
    const entries=state.livePONotifications.filter(entry=>liveRoomById(entry.id)).slice(0,18);
    return card(head(label('notify'))+(entries.length?entries.map(entry=>row(entry.title,entry.text,action('notice-open',t('Mở','Open'),{value:entry.key,style:'soft'}),icon('Bell'))).join(''):empty()))+
      card(head(t('Cài đặt theo loại & kênh','Settings by type and channel'),t('Kênh trong app khả dụng trong bản mẫu.','In-app notifications are available in this demo.'))+
      form('channels',types.map(([key,text])=>'<div class="lv-channel"><strong>'+esc(text)+'</strong><div class="lv-chips">'+
      [['app',t('Trong app','In app')],['push',t('Đẩy (push)','Push')],['email','Email'],['sms','SMS']].map(([channel,caption])=>'<label><input type="checkbox" name="'+key+':'+channel+'" '+(state.livePOChannels[key+':'+channel]??(channel==='app')?'checked':'')+'>'+esc(caption)+'</label>').join('')+'</div></div>').join(''),t('Lưu thay đổi','Save changes')));
  }
  function pushRoomNotice(room,type,heading,body,target=''){
    if(state.livePOChannels[type+':app']===false||state.livePONotifications.some(entry=>entry.id===room.id&&entry.title===heading))return;
    const before=state.livePONotifications;
    state.livePONotifications=[{key:crypto.randomUUID(),id:room.id,type,title:heading,text:body,target},...before].slice(0,60);
    if(!save())state.livePONotifications=before;
  }
  function summaryDraft(room){
    const count=chat(room).length,leads=(room.leads||[]).length;
    return [newsText(room.description),count+' '+t('bình luận','comments'),leads+' '+t('khách tiềm năng','leads')].filter(Boolean).join('\n');
  }
  function recapPanel(room){
    return card(head('NEXI (AI)',t('Bản nháp · chủ buổi duyệt trước khi đăng bản xem lại.','Draft · the host reviews before publishing the replay.'))+
      form('summary',field(t('Tiêu đề bản xem lại','Replay title'),'title',room.summary?.title||roomName(room),'required maxlength="100"')+
      textarea(t('Tóm tắt nội dung chính','Summary'),'body',room.summary?.body||summaryDraft(room),'required maxlength="1600"')+
      '<div class="lv-actions"><button class="lv-btn" type="submit" name="result" value="draft">'+t('Lưu nháp','Save draft')+'</button><button class="lv-btn primary" type="submit" name="result" value="publish" '+(room.status!=='ended'?'disabled':'')+'>'+t('Duyệt & đăng bản xem lại','Approve & publish replay')+'</button></div>',''))+
      leadsPanel(room);
  }
  function replayPanel(room){
    const host=hostMode(room),media=room.videoId?'<video class="lv-replay" data-live-replay="'+esc(room.videoId)+'" controls playsinline></video>':'';
    const currentRecord=recording?.roomId===room.id;
    return card(media+head(label('replay'))+
      (host&&room.status==='live'?action('record',currentRecord?t('Dừng ghi','Stop recording'):t('Ghi bản xem thử','Record camera preview'),{style:'soft',icon:icon('CircleDot')}):'')+
      (room.videoId?'<div class="lv-actions">'+action('download',t('Tải bản ghi','Download recording'),{icon:icon('Download')})+
      (host?action('panel',t('Cắt clip ngắn','Trim short clip'),{value:'trim',icon:icon('Scissors')}):'')+'</div>':'')+
      (host?form('recording', '<label class="lv-field">'+t('Tệp bản ghi','Recording file')+'<input type="file" name="video" accept="video/*"></label><label class="lv-field">'+t('Đổi ảnh bìa','Change cover')+'<input type="file" name="cover" accept="image/*"></label>',t('Lưu bản ghi','Save recording')):'')+
      (!room.videoId&&!currentRecord?'<p class="lv-note">'+t('Chưa có bản ghi.','No recording yet.')+'</p>':''))+
      card(head(t('Mục lục chương','Chapters'))+(room.chapters?.length?room.chapters.map(item=>row(clock(item.time)+' · '+item.title,'',action('seek',t('Phát','Play'),{value:String(item.time),disabled:!room.videoId,icon:icon('Play')}))).join(''):empty())+
      (room.purpose==='tutorial'?'<p class="lv-note">'+t('Replay chia chương có thể đưa vào thư viện OneAcademy.','Chaptered replay can be added to the OneAcademy library.')+'</p>':''))+
      (room.place?card(head(t('Địa điểm đã ghé','Places visited'))+row(room.place.name,room.place.address,'<a class="lv-btn soft" href="'+mapLink(room.place.address)+'" target="_blank" rel="noopener noreferrer">'+t('Bản đồ','Map')+'</a>',icon('MapPin'))):'');
  }
  function openPanel(key,room=getRoom()){
    if(key==='notify'){showDialog(label(key),notificationPanel(),key);return;}
    if(!room)return;
    if(['replay','trim'].includes(key)&&room.status==='ended'&&!canOpenReplay(room))return;
    const heading=toolLabels[key]?label(key):({tools:t('Công cụ buổi live','Live tools'),moderator:t('Thêm người kiểm duyệt','Add moderator'),trim:t('Cắt clip ngắn','Trim short clip')})[key];
    let body='';
    switch(key){
      case 'tools':body=toolsPanel(room);break;
      case 'guest':case 'moderator':case 'contacts':body=guestPanel(room,key);break;
      case 'poll':body=card(pollMarkup(room,true))+card(form('poll',field(t('Câu hỏi','Question'),'question','','required maxlength="120"')+
        field(t('Lựa chọn 1','Option 1'),'choice','','required maxlength="80"')+field(t('Lựa chọn 2','Option 2'),'choice','','required maxlength="80"')+
        field(t('Lựa chọn 3','Option 3'),'choice','','maxlength="80"'),t('Tạo poll mới','Create poll')));break;
      case 'qa':body=qaPanel(room);break;
      case 'services':case 'deals':body=shelfPanel(room);break;
      case 'flash':body=card(head(t('Tạo deal giới hạn ngay trong live','Create a limited offer during the live'))+
        form('flash',field(t('Nội dung ưu đãi','Offer'),'name',room.flash?.name||'','required maxlength="100"')+
        field(t('Thời gian chạy (phút)','Duration (minutes)'),'minutes','10','type="number" min="1" max="180" required')+
        field(t('Số lượng tối đa','Coupon limit'),'limit','30','type="number" min="1" max="1000" required'),t('Kích hoạt Flash Deal','Activate flash deal')))+
        (flashMarkup(room)?card(flashMarkup(room)+'<p>'+room.flash.limit+' '+t('coupon tối đa','coupon limit')+'</p>'):'');break;
      case 'wheel':body=card(head(t('Vòng quay chung của nền tảng','Shared Lucky Wheel'),t('Dùng chung engine Lucky Wheel của nền tảng.','Uses the platform’s shared Lucky Wheel.'))+action('wheel',t('Mở Lucky Wheel','Open Lucky Wheel'),{style:'primary',icon:icon('Gift')}));break;
      case 'oneqr':{const url=oneQrUrl(room);body=card(row('OneQR',url?t('Hiện ở góc màn hình live.','Shown in the corner of the live screen.'):t('Page chưa có OneQR.','No OneQR is configured for this Page.'),action('toggle-qr',room.oneqr?t('Ẩn OneQR','Hide OneQR'):t('Hiện OneQR','Show OneQR'),{style:'soft',pressed:!!room.oneqr,disabled:!url}),icon('QrCode'))+
        (url?'<a class="lv-btn" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">OneQR</a>':''));break;}
      case 'overlay':{const info=overlay(room);body=card(form('overlay',field(t('Tên tiệm','Business name'),'name',info.name,'maxlength="100"')+
        field(t('Số điện thoại','Phone number'),'phone',info.phone,'type="tel" maxlength="35"')+field(t('Địa chỉ','Address'),'address',info.address,'maxlength="200"'),t('Lưu thay đổi','Save changes')));break;}
      case 'title':body=card(form('title',field(t('Tiêu đề buổi live','Live title'),'title',roomName(room),'required maxlength="100"'),t('Lưu thay đổi','Save changes')));break;
      case 'place':case 'map':{const info=room.place||overlay(room);body=card(form('place',field(t('Tên địa điểm','Place name'),'name',info.name,'required maxlength="100"')+
        field(t('Địa chỉ','Address'),'address',info.address,'required maxlength="200"'),t('Gắn địa điểm','Pin place')))+(info.address?card('<a class="lv-btn soft" href="'+mapLink(info.address)+'" target="_blank" rel="noopener noreferrer">'+icon('Map')+t('Bản đồ','Map')+'</a>'):'');break;}
      case 'chapter':body=card(form('chapter',field(t('Tiêu đề chương','Chapter title'),'title','','required maxlength="100"'),t('Đánh dấu chương','Mark chapter')))+
        card((room.chapters||[]).map(item=>row(item.title,clock(item.time))).join('')||empty());break;
      case 'pip':body=card(row(label(key),t('Camera phụ cận tay','Second camera close-up'),action('toggle-pip',room.pip?t('Tắt','Turn off'):t('Bật','Turn on'),{style:'soft',pressed:!!room.pip}),icon('Video')));break;
      case 'draw':body=card(row(label(key),'',action('toggle-draw',room.drawing?t('Xóa vẽ','Clear drawing'):t('Vẽ','Draw'),{style:'soft',pressed:!!room.drawing}),icon('Paintbrush')));break;
      case 'music':body=card(row(label(key),t('Chế độ cho buổi biểu diễn mẫu.','Preview mode for performances.'),action('toggle-music',room.music?t('Tắt','Turn off'):t('Bật','Turn on'),{style:'soft',pressed:!!room.music}),icon('Music'))+tile('library')+tile('songs'));break;
      case 'library':body=card(head(t('Cảnh báo nhạc bản quyền','Music copyright warning'),t('Chỉ dùng nhạc được phép. Thư viện cần kết nối dịch vụ live.','Use licensed music. The library requires the livestream service.')));break;
      case 'hands':case 'songs':body=listPanel(room,key);break;
      case 'moderation':body=safetyPanel(room);break;
      case 'leads':body=leadsPanel(room);break;
      case 'report':body=reportPanel(room);break;
      case 'recap':body=recapPanel(room);break;
      case 'replay':body=replayPanel(room);break;
      case 'trim':body=card(form('trim',field(t('Bắt đầu (giây)','Start (seconds)'),'from','0','type="number" min="0" step="0.1" required')+
        field(t('Kết thúc (giây)','End (seconds)'),'to','','type="number" min="0.1" step="0.1" required'),t('Tải clip ngắn','Download clip')));break;
      case 'share':{const url=liveLink(room);body=card(field(t('Link buổi live','Livestream link'),'url',url,'readonly')+
        '<div class="lv-actions">'+action('copy',t('Sao chép link','Copy link'),{value:room.id,icon:icon('Copy')})+
        '<a class="lv-btn" href="https://www.facebook.com/sharer/sharer.php?u='+encode(url)+'" target="_blank" rel="noopener noreferrer">Facebook</a>'+
        action('zalo','Zalo',{value:room.id})+'</div>');break;}
      default:return;
    }
    const back=hostMode(room)&&!['tools','notify','replay','recap','report'].includes(key)?'<div class="lv-actions">'+action('panel',t('Công cụ buổi live','Live tools'),{value:'tools',icon:icon('ArrowLeft')})+'</div>':'';
    showDialog(heading,back+body,key,room.id);
    if(key==='guest'||key==='contacts'||key==='moderator')window.NEXORA_COMMUNITY_PEOPLE?.ready?.().then(()=>{
      if(dialogRoom===room.id&&dialogPanel===key&&$('editor').open&&!$('editor').querySelector('[data-live-person-search]')?.value){
        const area=$('editor').querySelector('.lv-person-list');if(area&&area.children.length===demoGuests.length){
          const replacement=document.createElement('div');replacement.innerHTML=guestPanel(getRoom(room.id),key);
          area.replaceChildren(...replacement.querySelector('.lv-person-list').children);
        }
      }
    }).catch(()=>{});
    if(key==='replay'&&room.videoId)mountReplay(room.videoId);
  }

  async function mountReplay(id){
    const video=$('editor').querySelector('[data-live-replay]');
    if(!video)return;
    try{
      const blob=await loadVideo(id);
      if(!blob||!video.isConnected)return;
      replayUrl=URL.createObjectURL(blob);video.src=replayUrl;
    }catch{feedback(t('Không tải được bản ghi.','Could not load the recording.'));}
  }
  function syncCamera(){
    const video=$('live-camera'),placeholder=$('camera-placeholder');
    if(video&&cameraStream){video.srcObject=cameraStream;video.play().catch(()=>{});if(placeholder)placeholder.hidden=true;}
    const pip=$('lv-pip-camera');
    if(pip&&pipStream){pip.srcObject=pipStream;pip.play().catch(()=>{});}
  }
  function stopAllMedia(){
    cameraRequest++;
    if(recording&&recording.recorder.state!=='inactive')recording.recorder.stop();
    stopCamera();
    pipStream?.getTracks().forEach(track=>track.stop());pipStream=null;
  }
  async function preview(second=false){
    if(!navigator.mediaDevices?.getUserMedia){feedback(t('Không hỗ trợ xem thử camera.','Camera preview is unavailable in this browser.'));return;}
    const video=second?$('lv-pip-camera'):$('live-camera'),request=++cameraRequest;
    if(!video)return;
    try{
      if(!second&&cameraStream)stopCamera();
      if(second&&pipStream)pipStream.getTracks().forEach(track=>track.stop());
      let camera=true;
      if(second){
        const currentId=cameraStream?.getVideoTracks()[0]?.getSettings().deviceId;
        const cameras=(await navigator.mediaDevices.enumerateDevices()).filter(item=>item.kind==='videoinput'&&item.deviceId!==currentId);
        if(!cameras.length)throw Error('No second camera');
        camera={deviceId:{exact:cameras[0].deviceId}};
      }else camera={facingMode:{ideal:cameraFacing}};
      const stream=await navigator.mediaDevices.getUserMedia({video:camera,audio:false});
      if(request!==cameraRequest||!video.isConnected){stream.getTracks().forEach(track=>track.stop());return;}
      if(second)pipStream=stream;else cameraStream=stream;
      syncCamera();
    }catch{if(request===cameraRequest)feedback(t('Không mở được camera. Kiểm tra quyền hoặc thiết bị camera.','Could not open the camera. Check permissions and connected cameras.'));}
  }
  function startRecording(room){
    if(recording){if(recording.recorder.state!=='inactive')recording.recorder.stop();return;}
    if(!cameraStream||!window.MediaRecorder){feedback(t('Bật camera xem thử trước khi ghi.','Start camera preview before recording.'));return;}
    const recorder=new MediaRecorder(cameraStream),chunks=[];
    recording={recorder,roomId:room.id};recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
    recorder.onstop=async()=>{
      recording=null;
      if(!chunks.length)return;
      let id;
      try{
        id=await storeVideo(new Blob(chunks,{type:recorder.mimeType||'video/webm'}));
        const currentRoom=getRoom(room.id);if(!currentRoom||!updateRoom(currentRoom,{videoId:id})){await removeVideo(id);return;}
        if(currentRoom.videoId)await removeVideo(currentRoom.videoId);
        if(dialogPanel==='replay'&&dialogRoom===room.id)openPanel('replay',getRoom(room.id));
      }catch{feedback(t('Không lưu được bản ghi.','Could not save the recording.'));}
    };
    recorder.start();openPanel('replay',room);
  }
  async function download(blob,name){
    if(!blob)throw Error(t('Không tìm thấy bản ghi.','Recording unavailable.'));
    if(downloadUrl)URL.revokeObjectURL(downloadUrl);
    downloadUrl=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=downloadUrl;link.download=name;link.click();
  }
  async function trimClip(room,start,end){
    const video=document.createElement('video');
    if(!window.MediaRecorder||!video.captureStream)throw Error(t('Trình duyệt không hỗ trợ cắt clip.','Clip trimming is unavailable in this browser.'));
    const controller=new AbortController();
    const cancel=()=>controller.abort();
    const stopped=new Promise((_,reject)=>controller.signal.addEventListener('abort',()=>reject(controller.signal.reason),{once:true}));
    const duringTrim=async task=>{
      const result=await Promise.race([task,stopped]);
      controller.signal.throwIfAborted();
      return result;
    };
    let url='',tracks=[],recorder;
    cancelTrim=cancel;
    try{
      const blob=await duringTrim(loadVideo(room.videoId));
      if(!blob)throw Error(t('Không tìm thấy bản ghi.','Recording unavailable.'));
      url=URL.createObjectURL(blob);
      video.muted=true;
      await duringTrim(new Promise((resolve,reject)=>{
        video.onloadedmetadata=resolve;
        video.onerror=()=>reject(Error(t('Không tải được bản ghi.','Could not load the recording.')));
        video.src=url;
      }));
      if(end<=start||end>video.duration)throw Error(t('Chọn thời gian hợp lệ trong bản ghi.','Choose a valid range within the recording.'));
      if(start)await duringTrim(new Promise(resolve=>{video.onseeked=resolve;video.currentTime=start;}));
      await duringTrim(video.play());
      const stream=video.captureStream(),parts=[];
      tracks=stream.getTracks();
      recorder=new MediaRecorder(stream);
      const completed=new Promise((resolve,reject)=>{recorder.ondataavailable=event=>parts.push(event.data);recorder.onstop=()=>resolve(new Blob(parts,{type:recorder.mimeType||'video/webm'}));recorder.onerror=reject;});
      recorder.start();
      const range=new Promise(resolve=>{
        video.ontimeupdate=()=>{if(video.currentTime>=end)resolve();};
        video.onended=resolve;
      });
      await duringTrim(Promise.race([range,completed]));
      video.pause();if(recorder.state!=='inactive')recorder.stop();
      const clip=await duringTrim(completed);
      await download(clip,'livestream-clip.webm');
    }catch(error){if(!controller.signal.aborted)throw error;}
    finally{
      if(cancelTrim===cancel)cancelTrim=null;
      if(recorder&&recorder.state!=='inactive')recorder.stop();
      video.pause();video.removeAttribute('src');video.load();
      tracks.forEach(track=>track.stop());
      if(url)URL.revokeObjectURL(url);
    }
  }

  function refresh(room,panel=''){
    render();syncCamera();bindDrawing();
    if(panel)openPanel(panel,getRoom(room.id));
  }
  function patch(room,changes,panel=''){
    if(!updateRoom(room,changes)){feedback(t('Không thể lưu. Vui lòng thử lại.','Unable to save. Please try again.'));return false;}
    refresh(room,panel);return true;
  }
  function bindDrawing(){
    const canvas=$('lv-annotation');
    if(!canvas||canvas.dataset.ready)return;
    canvas.dataset.ready='1';
    const context=canvas.getContext('2d');
    if(!context)return;
    canvas.width=canvas.clientWidth;canvas.height=canvas.clientHeight;
    context.lineWidth=3;context.lineCap='round';context.strokeStyle='#f8cf65';
    let pointer=null;
    canvas.addEventListener('pointerdown',event=>{
      pointer=event.pointerId;canvas.setPointerCapture(pointer);context.beginPath();context.moveTo(event.offsetX,event.offsetY);
    });
    canvas.addEventListener('pointermove',event=>{
      if(event.pointerId!==pointer)return;
      context.lineTo(event.offsetX,event.offsetY);context.stroke();
    });
    for(const key of ['pointerup','pointercancel'])canvas.addEventListener(key,()=>{pointer=null;});
  }
  function tick(){
    for(const node of document.querySelectorAll('[data-lv-flash]')){
      const remaining=Math.ceil((Number(node.dataset.lvFlash)-Date.now())/1000);
      node.hidden=remaining<=0;
      if(remaining>0)node.querySelector('time').textContent=clock(remaining);
      else node.closest('.lv-stage')?.querySelector('[data-lv-flash-card]')?.remove();
    }
    const time=document.querySelector('[data-lv-elapsed]');
    if(time)time.textContent=clock(Math.floor((Date.now()-Number(time.dataset.lvElapsed))/1000));
  }
  function openCoupon(room,id){
    if(!dealsFor(room).some(deal=>deal.id===id))return;
    updateRoom(room,{stats:{...room.stats,clicks:(room.stats?.clicks||0)+1}});
    closeDialog();
    if(room.pageId)route('pages',{pageId:room.pageId,pageTab:'offers',pageMode:'view'});
    else route('deals');
  }
  function openService(room){
    updateRoom(room,{stats:{...room.stats,clicks:(room.stats?.clicks||0)+1}});
    closeDialog();
    if(room.pageId)route('pages',{pageId:room.pageId,pageTab:'services',pageMode:'view'});
    else route('shop');
  }
  async function copyLink(room){
    const url=liveLink(room);
    if(navigator.clipboard?.writeText){
      try{await navigator.clipboard.writeText(url);feedback(t('Đã sao chép link.','Link copied.'));return;}
      catch{}
    }
    showDialog(t('Link buổi live','Livestream link'),card(field(t('Link buổi live','Livestream link'),'url',url,'readonly')),'copy',room.id);
    $('editor').querySelector('[name="url"]').select();
  }
  function launchScheduled(room){
    if(!own(room)||room.status!=='scheduled')return;
    const before=state.liveRooms,beforePosts=state.feedPosts;
    if(room.weekly&&!before.some(row=>row.seriesId===(room.seriesId||room.id)&&row.scheduledAt>room.scheduledAt)){
      state.liveRooms=[...before,nextWeek(room)];
    }
    announce(room);
    if(!updateRoom(room,{status:'live',startedAt:Date.now()})){state.liveRooms=before;state.feedPosts=beforePosts;return;}
    pushRoomNotice(room,'live',t('Buổi live bắt đầu','Livestream started'),roomName(room));
    openRoom(room.id);
  }
  function endRoom(room){
    stopAllMedia();
    if(!updateRoom(room,{status:'ended',endedAt:Date.now(),summary:room.summary||{title:roomName(room),body:summaryDraft(room),published:false}}))return;
    pushRoomNotice(room,'replay',t('Bản xem lại chờ duyệt','Replay pending review'),roomName(room),'recap');
    render();openPanel('recap',getRoom(room.id));
  }
  function follow(room){
    const next=!prefs(room.id).follow;
    if(saveViewer(room.id,{follow:next,remind:next}))refresh(room);
  }
  function vote(room,value){
    const source=pollFor(room),index=Number(value);
    if(!source||hostMode(room)||source.votes?.[shared.member]!==undefined||!Object.hasOwn(source.choices,index))return;
    const poll=structuredClone(source);
    poll.counts[index]++;
    poll.votes[shared.member]=index;
    patch(room,{poll});
  }
  function claimFlash(room){
    const flash=room.flash;
    if(!flash?.dealId||flash.expiresAt<=Date.now())return;
    closeDialog();route('deals',{claimOffer:flash.dealId,pageId:room.pageId});
  }
  function activateFlash(room,name,minutes,limit){
    const data=records(),before=localStorage.getItem(recordKey),prefix='extra-live-flash-'+room.id;
    data.feed||=[];
    const id=data.feed.some(row=>row.id===prefix)?prefix+'-'+crypto.randomUUID():prefix;
    const expiresAt=Date.now()+minutes*60000;
    const discount=name.match(/\d+(?:\.\d+)?\s*%|\$\s*\d+(?:\.\d+)?/)?.[0]||'';
    data.feed.unshift({
      id,kind:'deal',status:'published',owner:shared.member,pageId:room.pageId,title:name,discount,
      expires:inputTime(expiresAt).slice(0,10),expiresAt,quantity:limit,location:room.city,
      industry:pageRecord(room.pageId)?.industry||'',channels:{community:false,page:false},createdAt:new Date().toISOString(),
    });
    localStorage.setItem(recordKey,JSON.stringify(data));
    if(!updateRoom(room,{flash:{name,expiresAt,limit,dealId:id}})){
      if(before===null)localStorage.removeItem(recordKey);else localStorage.setItem(recordKey,before);
      return;
    }
    refresh(room,'flash');
  }
  function changeGuests(room,key,name){
    const guests=room.guests||[],row=guests.find(item=>item.name===name);
    if(key==='invite'&&!row){
      const contact=directory().find(item=>item.name===name);
      return patch(room,{guests:[...guests,{name,nxId:contact?.nxId||contact?.id,accepted:false,muted:false}]},'guest');
    }
    if(!row)return;
    const next=key==='guest-remove'?guests.filter(item=>item!==row):guests.map(item=>item===row?{...item,...(key==='guest-accept'?{accepted:true}:{muted:!row.muted})}:item);
    patch(room,{guests:next},'guest');
  }
  function trackQueue(room,key,text=''){
    const items=room[key]||[];
    if(key==='hands'&&items.some(row=>row.member===shared.member))return false;
    return patch(room,{[key]:[...items,{id:crypto.randomUUID(),member:shared.member,name:person(),text}]},key);
  }
  function handleComment(form,room){
    const message=new FormData(form).get('message').trim();
    if(!message)return;
    const safety=room.safety||{},previous=state.liveChats[room.id]||[],recent=previous.findLast(row=>row.member===shared.member);
    if(!hostMode(room)&&safety.followers&&!prefs(room.id).follow)throw Error(t('Theo dõi để bình luận.','Follow to comment.'));
    if(safety.slow&&recent&&Date.now()-recent.time<10000)throw Error(t('Chờ 10 giây trước khi bình luận tiếp.','Wait 10 seconds before commenting again.'));
    if((safety.keywords||'').split(',').some(word=>word.trim()&&message.toLowerCase().includes(word.trim().toLowerCase())))throw Error(t('Bình luận bị bộ lọc từ khóa chặn.','Comment blocked by the keyword filter.'));
    const next=[...previous,{id:crypto.randomUUID(),member:shared.member,author:person(),text:message,time:Date.now()}];
    const sale=/(^|\s)GEL20(\s|$)/i.test(message),booking=/(^|\s)BOOK\s+GEL(\s|$)/i.test(message);
    state.liveChats[room.id]=next;
    if((sale||booking)&&room.pageId==='p1'){
      next.push({author:'NEXI (AI)',text:booking?t('Đã ghi nhận yêu cầu đặt lịch mẫu.','Demo booking request received.'):t('Đã ghi nhận yêu cầu GEL20 mẫu.','Demo GEL20 request received.'),time:Date.now()});
      if(!updateRoom(room,{leads:[...(room.leads||[]),{name:person(),text:message,kind:booking?'booking':'order'}]})){state.liveChats[room.id]=previous;return;}
      pushRoomNotice(room,'sales',t('Có yêu cầu mới từ bình luận','New request from live chat'),message,'leads');
    }else if(!save()){state.liveChats[room.id]=previous;return;}
    refresh(room);
  }
  function liveSubmit(event){
    const form=event.target,key=form.dataset.livePoForm;
    if(!key)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(form.dataset.saving)return;
    form.dataset.saving='1';
    const data=new FormData(form),read=name=>String(data.get(name)||'').trim();
    const room=getRoom(dialogRoom||activeLiveRoom);
    const run=async()=>{
      if(key==='setup'){readSetup();persistSetup();return;}
      if(key==='schedule'){
        const when=new Date(read('date')+'T'+read('time')).getTime();
        if(!Number.isFinite(when)||when<=Date.now())throw Error(t('Chọn giờ bắt đầu trong tương lai.','Choose a future start time.'));
        Object.assign(setup,{title:read('title'),weekly:data.has('weekly'),remind:data.has('remind')});
        persistSetup(when);return;
      }
      if(key==='channels'){
        const before=state.livePOChannels;
        state.livePOChannels=Object.fromEntries([...form.querySelectorAll('input')].map(input=>[input.name,input.checked]));
        if(!save()){state.livePOChannels=before;return;}
        feedback(t('Đã lưu thay đổi.','Changes saved.'));return;
      }
      if(!room)return;
      if(key==='comment'){handleComment(form,getRoom(read('roomId')));return;}
      if(key==='question'){if(read('text'))patch(room,{questions:[...(room.questions||[]),{id:crypto.randomUUID(),author:person(),text:read('text')}]},'qa');return;}
      if(key==='song'){if(read('text'))trackQueue(room,'songs',read('text'));return;}
      if(!hostMode(room))return;
      if(key==='poll'){
        const choices=data.getAll('choice').map(choice=>choice.trim()).filter(Boolean);
        if(choices.length<2||!read('question'))throw Error(t('Nhập câu hỏi và ít nhất hai lựa chọn.','Enter a question and at least two options.'));
        patch(room,{poll:{question:read('question'),choices,counts:choices.map(()=>0),votes:{}}},'poll');return;
      }
      if(key==='safety'){patch(room,{safety:{...room.safety,slow:data.has('slow'),followers:data.has('followers'),age:data.has('age'),keywords:read('keywords')}},'moderation');return;}
      if(key==='flash'){
        const minutes=Number(read('minutes')),limit=Number(read('limit'));
        if(!read('name')||minutes<1||minutes>180||!Number.isInteger(limit)||limit<1||limit>1000)return;
        activateFlash(room,read('name'),minutes,limit);return;
      }
      if(key==='overlay'){patch(room,{overlay:{name:read('name'),phone:read('phone'),address:read('address')}},'overlay');return;}
      if(key==='title'){if(read('title'))patch(room,{title:read('title')},'title');return;}
      if(key==='place'){if(read('name')&&read('address'))patch(room,{place:{name:read('name'),address:read('address')}},'place');return;}
      if(key==='chapter'){if(read('title'))patch(room,{chapters:[...(room.chapters||[]),{title:read('title'),time:Math.max(0,elapsed(room))}]},'chapter');return;}
      if(key==='summary'){
        if(!read('title')||!read('body'))return;
        const published=event.submitter?.value==='publish'&&room.status==='ended';
        if(patch(room,{summary:{title:read('title'),body:read('body'),published}},'recap'))feedback(published?t('Đã lưu bản xem lại trong bản mẫu.','Replay saved in the demo.'):t('Đã lưu nháp.','Draft saved.'));
        return;
      }
      if(key==='recording'){
        const video=data.get('video'),cover=data.get('cover'),update={};
        if(cover?.size)update.cover=await imageFrom(cover);
        if(video?.size)update.videoId=await storeVideo(video);
        const latest=getRoom(room.id);
        if(!latest||!Object.keys(update).length||!patch(latest,update,'replay')){if(update.videoId)await removeVideo(update.videoId);return;}
        if(update.videoId&&latest.videoId)await removeVideo(latest.videoId);
        return;
      }
      if(key==='trim'){await trimClip(room,Number(read('from')),Number(read('to')));return;}
    };
    run().catch(error=>feedback(error.message)).finally(()=>{delete form.dataset.saving;});
  }
  document.addEventListener('submit',liveSubmit,true);

  async function liveClick(event){
    const button=event.target.closest('[data-live-po]');
    if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();
    const key=button.dataset.livePo,value=button.dataset.liveValue||'';
    const room=getRoom(dialogRoom||activeLiveRoom),host=room&&hostMode(room);
    try{
      if(key==='close'){closeDialog();return;}
      if(key==='start'){openLiveComposer();return;}
      if(key==='filter'){category=value;render();return;}
      if(key==='open'){openRoom(value);return;}
      if(key==='back'){stopAllMedia();closeDialog();activeLiveRoom=null;viewer=false;render();return;}
      if(key==='panel'){openPanel(value,room);return;}
      if(key==='purpose'){purposePage();return;}
      if(key==='pick-purpose'){setup.purpose=value;purposePage();return;}
      if(key==='return-setup'){setupPage();return;}
      if(key==='schedule'){schedulePage();return;}
      if(key==='edit-schedule'){const row=getRoom(value);if(row&&own(row))schedulePage(row);return;}
      if(key==='camera'){await preview();return;}
      if(key==='beauty'&&dialogPanel==='setup'){readSetup();setup.beauty=!setup.beauty;setupPage();return;}
      if(key==='copy'){const row=getRoom(value)||room;if(row)await copyLink(row);return;}
      if(key==='zalo'){const row=getRoom(value)||room;if(row){if(navigator.share)await navigator.share({url:liveLink(row)});else await copyLink(row);}return;}
      if(key==='notice-open'){
        const item=state.livePONotifications.find(row=>row.key===value);
        if(item){openRoom(item.id);if(item.target)openPanel(item.target,getRoom(item.id));}return;
      }
      if(!room)return;
      if(key==='viewer'||key==='host'){openRoom(room.id,key==='viewer');return;}
      if(key==='age'){ageAccepted.add(room.id);refresh(room);return;}
      if(key==='start-scheduled'){launchScheduled(room);return;}
      if(key==='remind'){
        const remind=!prefs(room.id).remind;
        if(saveViewer(room.id,{remind})){if(remind)pushRoomNotice(room,'live',t('Đã đặt nhắc lịch','Livestream reminder set'),roomName(room));refresh(room);}return;
      }
      if(key==='follow'){follow(room);return;}
      if(key==='caption'){caption={en:'vi',vi:'off',off:'en'}[caption];refresh(room);return;}
      if(key==='react'){if(saveViewer(room.id,{reacted:!prefs(room.id).reacted}))refresh(room);return;}
      if(key==='vote'){vote(room,value);return;}
      if(key==='coupon'){openCoupon(room,value);return;}
      if(key==='service-link'){openService(room);return;}
      if(key==='claim-flash'){claimFlash(room);return;}
      if(key==='raise'){trackQueue(room,'hands',t('Muốn phát biểu','Wants to speak'));return;}
      if(key==='wheel'){stopAllMedia();closeDialog();route('wheel');return;}
      if(key==='download'){
        if(room.status!=='ended'||canOpenReplay(room))await download(await loadVideo(room.videoId),'livestream-recording');
        return;
      }
      if(key==='seek'){const video=$('editor').querySelector('[data-live-replay]');if(video){video.currentTime=Number(value);await video.play();}return;}
      if(key==='invite'&&dialogPanel==='contacts'){
        if(shared.notify(t('Lời mời xem live','Livestream invitation'),'live',{liveId:room.id,liveOwner:room.ownerId,liveView:'viewer'},value))feedback(t('Đã gửi lời mời mẫu.','Demo invitation saved.'));
        return;
      }
      if(!host)return;
      if(key==='mute'){patch(room,{muted:!room.muted});return;}
      if(key==='switch-camera'){cameraFacing=cameraFacing==='user'?'environment':'user';await preview();return;}
      if(key==='beauty'){patch(room,{beauty:!room.beauty});return;}
      if(key==='end'){endRoom(room);return;}
      if(key==='toggle-qr'){patch(room,{oneqr:!room.oneqr},'oneqr');return;}
      if(key==='pin-service'){if(servicesFor(room).some(item=>item.id===value))patch(room,{serviceId:room.serviceId===value?'':value},dialogPanel);return;}
      if(key==='pin-deal'){if(dealsFor(room).some(item=>item.id===value))patch(room,{dealId:room.dealId===value?'':value},dialogPanel);return;}
      if(key==='pin-comment'){patch(room,{pinnedComment:room.pinnedComment===value?'':value});return;}
      if(key==='answer'){patch(room,{answering:room.answering===value?'':value},'qa');return;}
      if(key==='toggle-pip'){
        if(room.pip){pipStream?.getTracks().forEach(track=>track.stop());pipStream=null;}
        if(patch(room,{pip:!room.pip},'pip')&&!room.pip)await preview(true);return;
      }
      if(key==='toggle-draw'){closeDialog();patch(room,{drawing:!room.drawing});return;}
      if(key==='toggle-music'){patch(room,{music:!room.music},'music');return;}
      if(key==='record'){startRecording(room);return;}
      if(key==='queue-remove'){
        const panel=dialogPanel;if(['hands','songs'].includes(panel))patch(room,{[panel]:(room[panel]||[]).filter(item=>item.id!==value)},panel);return;
      }
      if((key==='invite'&&dialogPanel==='moderator')||key==='moderator-remove'){
        const mods=room.safety?.moderators||[];
        const moderators=key==='invite'?[...new Set([...mods,value])]:mods.filter(name=>name!==value);
        patch(room,{safety:{...room.safety,moderators}},'moderation');return;
      }
      if(['invite','guest-remove','guest-accept','guest-mute'].includes(key))changeGuests(room,key,value);
    }catch(error){if(error.name!=='AbortError')feedback(error.message);}
  }
  document.addEventListener('click',liveClick,true);
  document.addEventListener('input',event=>{
    if(!event.target.matches('[data-live-person-search]'))return;
    const query=event.target.value.toLowerCase().trim();
    $('editor').querySelectorAll('[data-live-person]').forEach(node=>{node.hidden=!node.dataset.livePerson.includes(query);});
  });
  document.addEventListener('change',event=>{
    if(event.target.matches('[data-live-category]')){category=event.target.value;render();return;}
    if(event.target.matches('[data-live-quality]')){quality=event.target.value;return;}
    if(event.target.matches('[data-live-po-form="setup"] [name="destinations"]')){
      readSetup();
      const pageId=destinationPage(setup.destinations,setup.pageId);
      const options=event.target.form.elements.dealId;
      const selected=setup.dealId;
      options.replaceChildren(new Option(t('Không gắn deal','No pinned deal'),''),...dealsFor({pageId}).map(deal=>new Option(deal.title,deal.id,false,deal.id===selected)));
    }
  });

  const beforeRender=render;
  render=function(){
    beforeRender();syncCamera();bindDrawing();tick();
    const filter=document.querySelector('[data-live-category]');
    if(filter&&window.TomSelect&&!filter.tomselect)new window.TomSelect(filter,{create:false,maxItems:1,controlInput:null,hideSelected:false,closeAfterSelect:true});
    const oneQr=document.querySelector('.lv-oneqr');
    if(oneQr&&window.QRCode){
      const art=oneQr.querySelector('svg'),code=document.createElement('span');
      try{new window.QRCode(code,{text:oneQr.href,width:38,height:38});art?.replaceWith(code);}catch{}
    }
    if(flashClock){clearInterval(flashClock);flashClock=null;}
    if(current==='live'&&activeLiveRoom)flashClock=setInterval(tick,1000);
  };
  const beforeNavigate=navigate;
  navigate=function(section,...args){if(section!=='live'){stopAllMedia();if(flashClock){clearInterval(flashClock);flashClock=null;}}return beforeNavigate(section,...args);};
  const module=window.NEXORA_COMMUNITY_MODULE;
  window.NEXORA_COMMUNITY_MODULE={
    ...module,
    async navigate(section,context={}){
      if(section==='live'){directoryPageId=context.pageId||'';category='all';}
      const result=await module.navigate(section,context);
      if(section==='live'&&context.liveId){
        foreignRoom=loadForeignRoom(context.liveId,context.liveOwner);
        const room=resolveLink(rooms(),context.liveId)||foreignRoom;
        if(room)openRoom(room.id,context.liveView==='viewer');
      }
      if(section==='live'&&context.composeLive==='1')openLiveComposer(context.pageId);
      return result;
    },
    deactivate(){
      stopAllMedia();if(flashClock){clearInterval(flashClock);flashClock=null;}
      cancelTrim?.();
      closeDialog();module.deactivate?.();
    },
  };
  window.addEventListener('pagehide',()=>{
    stopAllMedia();cancelTrim?.();if(flashClock)clearInterval(flashClock);if(downloadUrl)URL.revokeObjectURL(downloadUrl);if(replayUrl)URL.revokeObjectURL(replayUrl);
  });
  if(current==='live')render();
})();
