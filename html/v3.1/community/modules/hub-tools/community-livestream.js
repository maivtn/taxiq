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
  const liveLink=room=>new URL((shared.role==='staff'?'/html/v3.1/staff-community.html':'/html/v3.1/community.html')+'?tab=live&liveView=viewer&liveId='+encode(room.id)+(room.ownerId?'&liveOwner='+encode(room.ownerId):''),location.origin).href;
  const liveBase=()=>window.NEXORA_COMMUNITY_LANGUAGE?.base()||state.lang;
  const t=(vi,en)=>liveBase()==='vi'?vi:en;
  const action=(key,label,{value='',icon='',style='',pressed,disabled=false}={})=>
    '<button type="button" class="lv-btn '+style+'" data-live-po="'+key+'"'+(icon?' data-icon="live-po"':'')+(value?' data-live-value="'+esc(value)+'"':'')+(pressed===undefined?'':' aria-pressed="'+pressed+'"')+(disabled?' disabled':'')+'>'+icon+esc(label)+'</button>';
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
    sales:['Bán hàng / Giới thiệu dịch vụ','Selling / Service introduction','ShoppingBag',['services','flash','deals','oneqr','leads','wheel']],
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
  const toolArt={guest:'users-round',poll:'layout-dashboard',qa:'layout-list',hands:'hand-coins',services:'paintbrush',flash:'zap',deals:'ticket',wheel:'gift',oneqr:'scan-line',leads:'layout-list',overlay:'tag',title:'paintbrush',place:'map-pin',map:'map',chapter:'layout-list',pip:'video',draw:'paintbrush',music:'music',library:'music',songs:'music',moderation:'users-round',report:'layout-dashboard',recap:'sparkles',replay:'video',share:'share-2',contacts:'users-round',notify:'bell',schedule:'calendar-days'};
  const tile=key=>action('panel',label(key),{value:key,icon:art(toolArt[key]||'layout-list',28),style:'tool'});
  const categories=[['all','Tất cả','All',''],['salon','Nail & làm đẹp','Nail & beauty','paintbrush'],['food','Ẩm thực','Food','store'],['travel','Du lịch','Travel','map'],['houston','Houston','Houston','map']];
  const demoRooms=[
    {id:'po-live-bitcoin',title:['Tư vấn mẫu nail Tết + ưu đãi khách mới','Lunar New Year nail ideas + new guest offer'],host:'BITCOIN NAIL BAR',category:'salon',pageId:'p1',city:'Houston, TX',viewers:248,art:'paintbrush',cover:'/html/v3.1/community/live-photos/nails.jpg',dealId:'extra-po-new-guest',serviceId:'gel-manicure',oneqr:true,purpose:'sales'},
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
  let category='all',directoryPageId='',viewer=false,setup=null,dialogPanel='',dialogRoom='',cameraFacing='user',cameraRequest=0,pipStream=null,caption='en',quality='720p',ageAccepted=new Set(),flashClock,recording=null,downloadUrl='',replayUrl='',foreignRoom=null,foreignChats=[],cancelTrim=null;
  state.livePOViewer||={};
  state.livePONotifications||=[];
  state.livePOChannels||={};

  function seedLiveDemo(){
    if(state.livePNGDemoVersion)return;
    const pageId=shared.role==='owner'?'p1':'',stamp=Date.now(),prefix='po-studio-'+shared.me().id;
    const common={poLive:true,demo:true,owner:shared.member,ownerId:shared.me().id,host:pageId?'BITCOIN NAIL BAR':person(),pageId,city:'Houston, TX',destinations:['feed',...(pageId?['page:'+pageId]:[])],oneqr:!!pageId,startedAt:stamp-1456000,cover:'/html/v3.1/community/live-photos/nails.jpg',description:['Giới thiệu mẫu Gel mới và ưu đãi khách mới','New gel styles and new guest offer'],stats:{peak:312,views:1240,clicks:186,coupons:74,bookings:23},viewers:248};
    const poll={question:samplePoll.question,choices:samplePoll.choices,counts:[104,58,24],votes:{}};
    const leads=[{name:'Lan Phạm',text:'GEL20',kind:'order',status:'booked',note:['Đã đặt lịch · 10:00 AM','Appointment · 10:00 AM']},{name:'Kevin Trần',text:'BOOK GEL',kind:'booking',status:'lead'},{name:'Mai Anh',text:['Nhận Flash Deal −20%','Claimed Flash Deal −20%'],kind:'coupon',status:'lead'}];
    const chapters=[{title:['Mở đầu + giới thiệu tiệm','Opening + salon introduction'],time:0},{title:['Trình diễn mẫu Gel','Gel demonstration'],time:2},{title:['Flash Deal + hỏi đáp','Flash Deal + Q&A'],time:5}];
    const rows=[
      {...common,id:prefix+'-sales',title:['Tư vấn mẫu nail Tết + ưu đãi khách mới','Lunar New Year nail ideas + new guest offer'],status:'live',purpose:'sales',category:'salon',poll,questions:[...sampleQA,{id:'qa-walkin',author:'Lan P.',text:['Tiệm có nhận walk-in cuối tuần không?','Do you accept weekend walk-ins?']}],guests:[{name:'Lan Phạm',accepted:true,muted:false}],leads,dealId:pageId?'extra-po-new-guest':'',serviceId:pageId?'gel-manicure':''},
      {...common,id:prefix+'-tutorial',title:['Dạy nghề · Lớp Gel cơ bản','Tutorial · Basic Gel class'],status:'live',purpose:'tutorial',category:'salon',viewers:84,pip:true,questions:[{id:'qa-base',author:'Kevin T.',text:['Lớp base coat để bao lâu thì sơn màu?','How long should the base coat set before color?']},{id:'qa-form',author:'Lan P.',text:['Tay khách run thì giữ form thế nào?','How do you hold the form when a client’s hand shakes?']}],chapters},
      {...common,id:prefix+'-music',title:['Khám phá Houston · Yêu cầu bài hát','Explore Houston · Song requests'],status:'live',purpose:'music',category:'music',cover:'/html/v3.1/community/live-photos/music.jpg',viewers:132,music:true,place:{name:'BITCOIN NAIL BAR',address:'9793 Westheimer Rd, Houston, TX 77042'},songs:[{id:'song1',name:'Thảo N.',text:'Mưa trên phố Huế'},{id:'song2',name:'Hùng T.',text:'Nối vòng tay lớn'}],hands:[{id:'hand1',name:'Phương L.',text:['Đang giơ tay','Hand raised']}],chapters},
      {...common,id:prefix+'-replay',title:['Trình diễn mẫu Gel Tết + ưu đãi khách mới −20%','Lunar New Year Gel demonstration + new guest offer −20%'],status:'ended',purpose:'tutorial',category:'salon',videoSrc:'/html/v3.1/community/page-videos/nail-weekend.mp4',chapters,leads,places:[{name:'BITCOIN NAIL BAR',address:'9793 Westheimer Rd, Houston, TX 77042'}],timedComments:[{time:0,text:['Chào mừng tới BITCOIN NAIL BAR','Welcome to BITCOIN NAIL BAR']},{time:2,text:['Mẫu Gel mới của tiệm','The salon’s new gel styles']}],highlights:[{from:0,to:3,title:['Trình diễn mẫu','Style demonstration']},{from:3,to:6,title:['Flash Deal','Flash Deal']}],summary:{title:'BITCOIN NAIL BAR',body:'',published:false}},
      {...common,id:prefix+'-schedule',title:['Live thứ Bảy — mẫu mới & ưu đãi tuần','Saturday live — new styles & weekly offers'],status:'scheduled',scheduledAt:stamp+3*86400000,purpose:'sales',category:'salon',weekly:true,remind:true,seriesId:prefix+'-weekly'}
    ];
    state.liveRooms.push(...rows.filter(row=>!state.liveRooms.some(saved=>saved.id===row.id)));
    const next={...rows[4],id:prefix+'-schedule-next',scheduledAt:rows[4].scheduledAt+7*86400000};state.liveRooms.push(next);
    state.livePONotifications.push(...[
      {key:prefix+'-notice-live',id:rows[0].id,type:'live',title:['BITCOIN NAIL BAR đang live','BITCOIN NAIL BAR is live'],text:rows[0].title,target:''},
      {key:prefix+'-notice-sales',id:rows[0].id,type:'sales',title:['Đơn chốt mới trong buổi live của bạn','New order in your livestream'],text:['Lan P. đã đặt lịch qua live','Lan P. requested an appointment through live'],target:'leads'},
      {key:prefix+'-notice-replay',id:rows[3].id,type:'replay',title:['Bản xem lại đã sẵn sàng','Replay is ready'],text:['Bản tóm tắt NEXI chờ duyệt','NEXI summary awaiting review'],target:'recap'}
    ].map(row=>({...row,time:stamp})));
    state.livePNGDemoVersion=1;save();
  }
  seedLiveDemo();
  if(!state.liveSafetyDemoVersion){
    const sample=state.liveRooms.find(room=>room.demo&&room.id.endsWith('-sales')&&own(room));
    if(sample){sample.safety||={moderators:['Mai Anh']};state.liveChats[sample.id]||=[{id:'po-live-chat-lan',member:'Lan Phạm',author:'Lan P.',text:['Cho em hỏi giá bộ này ạ?','How much is this set?'],time:Date.now()-60000},{id:'po-live-chat-kevin',member:'Kevin Trần',author:'Kevin T.',text:['Tiệm có nhận walk-in không?','Do you accept walk-ins?'],time:Date.now()-30000}];}
    state.liveSafetyDemoVersion=1;save();
  }

  if(!state.liveNoticePOVersion){const room=state.liveRooms.find(item=>item.demo&&item.id.endsWith('-sales'));if(room){state.livePONotifications.push({key:room.id+'-notice-message',id:room.id,type:'sales',title:['Tin nhắn mới từ khách','New customer message'],text:['Mai A.: Shop ơi còn lịch chiều nay không?','Mai A.: Do you have availability this afternoon?'],peer:'Mai Anh',unread:2,time:Date.now()});if(room.stats&&!room.stats.peak)room.stats.peak=312;}state.liveNoticePOVersion=1;save();}
  const wheelPrizes=[{key:'gift25',vi:'Gift card $25',en:'$25 gift card',probability:5},{key:'gift10',vi:'Gift card $10',en:'$10 gift card',probability:15},{key:'discount',vi:'Giảm 20%',en:'20% off',probability:30},{key:'service',vi:'Tặng dịch vụ',en:'Service gift',probability:10},{key:'none',vi:'Chúc may mắn',en:'Better luck next time',probability:40}];
  function records(){try{return JSON.parse(localStorage.getItem(recordKey)||'{}');}catch{return {};}}
  const previousLookup=liveRoomById;
  liveRoomById=function(id){return previousLookup(id)||(foreignRoom?.id===id?foreignRoom:undefined);};
  function resolveLink(entries,id){
    const exact=entries.find(room=>room.id===id);if(exact)return exact;
    const series=entries.filter(room=>room.seriesId===id&&room.status!=='cancelled');
    if(!series.length)return entries.find(room=>room.id===id);
    return series.find(room=>room.status==='live')||
      series.filter(room=>room.status==='scheduled').sort((a,b)=>a.scheduledAt-b.scheduledAt)[0]||
      series.sort((a,b)=>b.scheduledAt-a.scheduledAt)[0];
  }
  function loadForeignRoom(id,ownerId){
    if(!/^NX-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(ownerId||''))return null;
    try{
      const saved=JSON.parse(localStorage.getItem('nexora-v31:community-hub-tools:'+ownerId)||'{}');
      const found=resolveLink((saved.liveRooms||[]).filter(room=>room.ownerId===ownerId&&
        (room.status!=='ended'||room.summary?.published===true)),id)||null;foreignChats=found?(saved.liveChats?.[found.id]||[]):[];return found;
    }catch{return null;}
  }
  function getRoom(id=activeLiveRoom){
    let room=liveRoomById(id);if(room&&!own(room)&&room.ownerId){room=loadForeignRoom(room.id,room.ownerId)||room;foreignRoom=room;}
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
  function canModerate(room){return hostMode(room)||(room.safety?.moderators||[]).includes(shared.member);}
  function canOpenReplay(room){return room.sample||hostMode(room)||room.summary?.published===true;}
  function isPrivate(room){return room.rehearsal===true;}
  function canWatchRoom(room){
    if((room.safety?.blocked||[]).includes(shared.member)&&!own(room))return false;
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
    if(['trim','trim-ends'].includes(dialogPanel))cancelTrim?.();
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
    return room?{...room,title:newsText(room.title),description:newsText(room.description),editing:room.id}:{title:'',description:'',purpose:'sales',destinations:destinations().map(row=>row.id),rehearsal:false,beauty:true,dealId:'',scheduledAt:'',weekly:false,remind:true};
  }
  function destinationPage(destinations,preferredId){
    if(preferredId&&destinations.includes('page:'+preferredId))return preferredId;
    return destinations.find(id=>id.startsWith('page:')&&pageRecord(id.slice(5))?.pageType!=='personal')?.slice(5)||destinations.find(id=>id.startsWith('page:'))?.slice(5)||'';
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
      row(t('Phát qua OBS / Stream key','OBS / Stream key'),'RTMP: rtmp://live.nexoratouch.com/app · Key: •••••••• · '+t('Bản mẫu','Demo'),action('obs',t('Sao chép','Copy')),icon('Monitor'))+
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
      Object.entries(purposes).sort(([a],[b])=>(a==='none')-(b==='none')).map(([id,info])=>'<div class="lv-purpose '+(setup.purpose===id?'selected':'')+'">'+card(row(purposeLabel(id),({sales:t('Cho tiệm và người bán cá nhân','For salons and personal sellers'),explore:'Food Community · NAILHUB.AI',tutorial:t('Nối thư viện OneAcademy','Connected to OneAcademy')})[id]||'',action('pick-purpose',setup.purpose===id?t('Đang chọn','Selected'):t('Chọn','Select'),{value:id,pressed:setup.purpose===id,style:'soft'}),art({sales:'gift',explore:'map',tutorial:'video',music:'music',community:'users-round',none:'layout-list'}[id],40))+
      (info[3].length?'<div class="lv-chips">'+info[3].map(key=>chip(id==='tutorial'&&key==='chapter'?t('Replay chia chương','Chaptered replay'):id==='tutorial'&&key==='qa'?t('Hàng đợi câu hỏi','Student question queue'):label(key),'violet')).join('')+(id==='explore'?chip(t('Danh sách nơi đã ghé','Visited places'),'violet'):'')+'</div>':''))+'</div>').join('')+
      '<div class="lv-actions">'+action('return-setup',t('Tiếp tục thiết lập','Continue setup'),{style:'primary',icon:icon('ArrowRight')})+'</div>','purpose');
  }
  function schedulePage(room){
    if(room)setup=baseSetup(room);else readSetup();
    stopAllMedia();
    const localTime=setup.scheduledAt?inputTime(setup.scheduledAt):'';
    const upcoming=state.liveRooms.filter(row=>row.status==='scheduled'&&own(row)).sort((a,b)=>a.scheduledAt-b.scheduledAt);
    const scheduleFields=card(field(t('Tiêu đề buổi live','Live title'),'title',setup.title,'required maxlength="100"')+
      '<div class="lv-grid2">'+field(t('Ngày','Date'),'date',localTime.slice(0,10),'type="date" required')+field(t('Giờ bắt đầu','Start time'),'time',localTime.slice(11,16),'type="time" required')+'</div>'+
      toggle('weekly',t('Lặp lại hằng tuần','Repeat weekly'),setup.weekly,t('Mỗi buổi tự sinh trang chờ + link riêng; sửa/hủy từng buổi không ảnh hưởng buổi khác','Each session has its own waiting room and link; editing or cancelling one does not affect the others'))+
      toggle('remind',t('Nhắc người theo dõi','Remind followers'),setup.remind,t('Gửi nhắc qua trung tâm thông báo.','Use in-app notifications for reminders.')));
    const waiting=upcoming.length?card(head(t('Trang chờ của buổi đã lên lịch','Scheduled waiting rooms'))+upcoming.map(rowData=>row(roomName(rowData),dateLabel(rowData.scheduledAt)+' · '+timeLabel(rowData.scheduledAt),'<div class="lv-actions">'+action('copy',t('Sao chép link','Copy link'),{value:rowData.id})+action('edit-schedule',t('Sửa buổi này','Edit session'),{value:rowData.id})+action('cancel-schedule',t('Hủy buổi này','Cancel session'),{value:rowData.id})+'</div>',icon('CalendarDays'))).join('')):'';
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
      room.seriesId='series-'+crypto.randomUUID();
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
    const visible=rooms().filter(room=>room.status!=='cancelled'&&(!isPrivate(room)||own(room)))
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
        '<div><strong>'+esc(roomName(room))+'</strong><small>'+esc(roomHost(room))+' · '+esc(room.status==='scheduled'?dateLabel(room.scheduledAt)+' · '+timeLabel(room.scheduledAt):room.city||'')+(room.sample||room.demo?' · '+t('Mẫu','Sample'):'')+'</small></div></div></button></article>';
    };
    const group=(name,rows)=>rows.length?'<h2 class="lv-subhead">'+esc(name)+'</h2><div class="lv-directory-grid">'+rows.map(cardMarkup).join('')+'</div>':'';
    return originalLiveHero()+'<section class="lv-surface"><div class="lv-directory-toolbar"><header class="lv-top live-hero"><div class="lv-actions">'+action('panel',label('notify'),{value:'notify',icon:icon('Bell')})+'</div></header>'+
      '<label class="lv-filter"><span class="lv-filter-label">'+esc(t('Lọc:','Filter:'))+'</span><select data-live-category aria-label="'+esc(t('Bộ lọc','Filters'))+'">'+categories.map(([id,vi,en])=>'<option value="'+id+'"'+(category===id?' selected':'')+'>'+esc(t(vi,en))+'</option>').join('')+'</select></label></div>'+
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
  function flashProgress(room){
    const flash=room.flash;if(!flash)return {claimed:0,limit:0,active:false};let claimed=Number(flash.sampleClaimed)||0;
    for(const key of Object.keys(localStorage).filter(key=>key.startsWith('nexora-community-deals-po-v1:deals:'))){try{const deal=JSON.parse(localStorage.getItem(key)||'{}').D?.find(row=>row.sourceId===flash.dealId);claimed+=Number(deal?.got)||0;}catch{}}
    const limit=Number(flash.limit)||0;return {claimed,limit,active:flash.expiresAt>Date.now()&&claimed<limit};
  }
  function flashMarkup(room){
    if(!flashProgress(room).active)return '';
    return '<span class="lv-chip amber" data-lv-flash="'+room.flash.expiresAt+'" data-flash-room="'+esc(room.id)+'">'+icon('Zap')+esc(room.flash.name)+' · <time>'+clock(Math.ceil((room.flash.expiresAt-Date.now())/1000))+'</time></span>';
  }
  function pinned(room){
    const deal=dealsFor(room).find(row=>row.id===room.dealId);
    const service=servicesFor(room).find(row=>row.id===room.serviceId)||state.shop.items.find(item=>item.id===room.productId);
    const getDeal=deal?row(deal.title,t('Deal của '+roomHost(room),'Offer from '+roomHost(room)),action('coupon',t('Nhận','Get coupon'),{value:deal.id,style:'soft'}),art('ticket',32)):'';
    const getService=service?row(service.name||service.title,service.price?'$'+service.price:t('Giá theo thực đơn SIPOS của tiệm','Price from the salon’s SIPOS menu'),action('service-link',t('Xem','View'),{style:'soft'}),art('paintbrush',32)):'';
    const getFlash=flashMarkup(room)?row(room.flash.name,t('Số lượng có hạn','Limited quantity'),action('claim-flash',t('Nhận','Claim'),{style:'soft',disabled:!room.flash.dealId}),art('ticket',32)):'';
    return (getDeal||getService||getFlash)?'<div class="lv-pins">'+getService+getDeal+(getFlash?'<div data-lv-flash-card>'+getFlash+'</div>':'')+'</div>':'';
  }
  function chat(room){return [...(room.id==='po-live-bitcoin'?demoChat:[]),...(own(room)?state.liveChats[room.id]||[]:foreignRoom?.id===room.id?foreignChats:state.liveChats[room.id]||[])];}
  function chatRows(room,host){
    return chat(room).slice(-8).map((message,index)=>'<div class="lv-comment">'+personBadge(message.author)+'<div class="lv-grow"><strong>'+esc(message.author)+'</strong> '+esc(newsText(message.text))+'</div>'+
      (canModerate(room)&&message.id?action('moderate-message',t('Kiểm duyệt','Moderate'),{value:message.id,style:'soft'}):'')+
      (host&&message.id?action('pin-comment',t('Ghim','Pin'),{value:message.id,style:'soft',pressed:room.pinnedComment===message.id}):'')+'</div>').join('');
  }
  function stageButton(key,label,mark,pressed){
    return action(key,label,{style:'stage-button',icon:icon(mark),pressed});
  }
  function waitingRoom(room){
    return '<section class="lv-surface"><header class="lv-top">'+action('back',t('Đang live','Live Now'),{icon:icon('ArrowLeft')})+'</header>'+
      card('<div class="lv-cover">'+roomMark(room)+chip(t('Đã lên lịch','Scheduled'),'violet')+'</div>'+head(roomName(room),roomHost(room))+'<p>'+esc(newsText(room.description)||'')+'</p><p>'+dateLabel(room.scheduledAt)+' · '+timeLabel(room.scheduledAt)+'</p><div class="lv-actions">'+
      action('copy',t('Sao chép link','Copy link'),{value:room.id,icon:icon('Copy')})+
      (hostMode(room)?action('edit-schedule',t('Sửa buổi này','Edit session'),{value:room.id})+action('cancel-schedule',t('Hủy buổi này','Cancel session'),{value:room.id})+action('start-scheduled',t('Phát live ngay','Go live now'),{style:'primary',icon:icon('Video')})
        :action('remind',prefs(room.id).remind?t('Đã đặt nhắc lịch','Reminder set'):t('Nhắc tôi','Remind me'),{pressed:!!prefs(room.id).remind,style:'primary',icon:icon('Bell')}))+'</div>')+'</section>';
  }
  function gate(room){
    const blocked=!canWatchRoom(room),banned=(room.safety?.blocked||[]).includes(shared.member)&&!own(room);
    return '<section class="lv-surface"><header class="lv-top">'+action('back',t('Đang live','Live Now'),{icon:icon('ArrowLeft')})+'</header>'+card(head(banned?t('Bị chặn','Blocked'):blocked?t('Phát thử riêng tư','Private rehearsal'):t('Giới hạn độ tuổi 18+','Ages 18 and over'),banned?'':blocked?t('Chỉ bạn và người được mời xem được.','Only the host and invited guests can view.'):'')+(blocked&&own(room)?action('host',t('Chủ buổi','Host'),{style:'primary'}):blocked?'':action('age',t('Tôi đủ 18 tuổi','I am 18 or over'),{style:'primary'})))+'</section>';
  }
  function replayView(room){
    if(!canOpenReplay(room)){
      return '<section class="lv-surface"><header class="lv-top">'+action('back',t('Đang live','Live Now'),{icon:icon('ArrowLeft')})+'</header>'+
        card(head(t('Bản xem lại chờ duyệt','Replay pending review'))+(own(room)?action('host',t('Góc chủ buổi','Host view'),{style:'soft'}):''))+'</section>';
    }
    const recording=hasRecording(room)?'<video class="lv-replay" '+(room.videoId?'data-video-id="'+esc(room.videoId)+'"':'src="'+esc(room.videoSrc)+'"')+' controls playsinline></video>':'<div class="lv-cover">'+roomMark(room)+chip(t('Bản xem lại','Replay'),'violet')+'</div>';
    return '<section class="lv-surface"><header class="lv-top"><div><h1>'+esc(roomName(room))+'</h1><p class="lv-note">'+esc(roomHost(room))+'</p></div>'+action('back',t('Đang live','Live Now'),{icon:icon('ArrowLeft')})+'</header>'+
      card(recording+(room.summary?.published?'<p class="lv-recap"><b>NEXI (AI)</b> '+esc(room.summary.body)+'</p>':'')+
      '<div class="lv-actions">'+tile('replay')+(own(room)?tile('recap')+tile('report'):'')+'</div>')+'</section>';
  }
  liveRoomPage=function(id){
    const room=getRoom(id);
    if(!room)return listPage();
    if(!canWatchRoom(room)||(!hostMode(room)&&room.safety?.age&&!ageAccepted.has(room.id)))return gate(room);
    if(room.status==='cancelled')return '<section class="lv-surface">'+card(head(t('Buổi live đã hủy','Livestream cancelled'))+action('back',t('Đang live','Live Now')))+'</section>';
    if(room.status==='scheduled')return waitingRoom(room);
    if(['ended','sample'].includes(room.status))return replayView(room);
    const host=hostMode(room),who=roomHost(room),name=roomName(room),info=overlay(room),follows=!!prefs(id).follow;
    const participants=room.guests||[],mods=room.safety||{},tools=(purposes[room.purpose]||purposes.none)[3];
    const titleText=host?'<div class="lv-chips">'+chip('LIVE','red')+chip(room.viewers?room.viewers+' '+t('đang xem','watching'):t('Xem thử','Preview'))+
      '<span class="lv-chip" data-lv-elapsed="'+(room.startedAt||Date.now())+'">'+clock(elapsed(room))+'</span>'+action('panel',t('Cảnh báo nhạc','Music warning'),{value:'library',style:'amber',icon:icon('TriangleAlert')})+'</div>'
      :'<div class="lv-viewer-id">'+personBadge(who)+'<div class="lv-grow"><strong>'+esc(who)+'</strong><small>'+esc(room.viewers?room.viewers+' '+t('đang xem','watching'):name)+'</small></div>'+action('follow',follows?t('Đang theo dõi','Following'):t('+ Theo dõi','+ Follow'),{style:'primary',pressed:follows})+chip('LIVE','red')+(mods.age?chip('18+'):'')+'</div>';
    const controls=host?'<div class="lv-stage-controls">'+stageButton('mute',room.muted?t('Bật tiếng','Unmute'):t('Tắt tiếng','Mute'),room.muted?'MicOff':'Mic',!!room.muted)+
      stageButton('switch-camera',t('Đổi camera','Flip camera'),'SwitchCamera')+stageButton('beauty',t('Làm đẹp','Beauty'),'Sparkles',!!room.beauty)+
      action('panel',t('Công cụ','Tools'),{style:'stage-button',value:'tools',icon:icon('BriefcaseBusiness')})+stageButton('end',t('Kết thúc','End'),'Square')+'</div>'+(['tutorial','explore','music','community'].includes(room.purpose)?'<div class="lv-purpose-controls">'+tools.map(key=>action('panel',label(key),{value:key,style:'stage-button',icon:art(toolArt[key]||'layout-list',24)})).join('')+'</div>':''):'';
    const captions=caption==='off'?'':'<span class="lv-caption">CC · '+caption.toUpperCase()+': '+esc((room.id==='po-live-bitcoin'||room.demo&&room.purpose==='sales')?(caption==='vi'?'“…mẫu này giữ được 3 tuần…”':'“…this set lasts three weeks…”'):t('Phụ đề','Captions'))+'</span>';
    const options=host?'':action('caption','VI | EN',{style:'stage-pill'})+
      '<label class="lv-quality"><span class="lv-sr">'+t('Chất lượng phát','Playback quality')+'</span><select data-live-quality><option '+(quality==='720p'?'selected':'')+'>720p</option><option '+(quality==='480p'?'selected':'')+'>480p</option><option '+(quality==='360p'?'selected':'')+'>360p</option></select></label>';
    const viewerChat=host?'':'<div class="lv-viewer-chat">'+chatRows(room,false)+'</div>'+commentForm(room);
    const pinnedComment=chat(room).find(row=>row.id===room.pinnedComment);
    const answering=(room.questions||[]).find(row=>row.id===room.answering);
    const questionOverlay=answering?'<div class="lv-question-overlay">'+icon('Pin')+'<span><strong>'+esc(answering.author)+'</strong>: '+esc(newsText(answering.text))+'</span></div>':'';
    const musicOverlay=room.music?'<div class="lv-music-status">'+icon('Music')+t('Chế độ âm thanh nhạc · Bản mẫu','Music mode · Demo')+(room.currentSong?' · '+esc(newsText(room.currentSong.text||room.currentSong)):'')+'</div>':'';
    const linkedPlace=room.place?'<a class="lv-place" href="'+mapLink(room.place.address)+'" target="_blank" rel="noopener noreferrer">'+icon('MapPin')+esc(room.place.name)+'</a>':'';
    const qrUrl=oneQrUrl(room);
    const showQr=room.oneqr&&qrUrl?'<a class="lv-oneqr" href="'+esc(qrUrl)+'" target="_blank" rel="noopener noreferrer" aria-label="OneQR">'+icon('QrCode')+'<small>OneQR</small></a>':'';
    const myInvite=!host?(room.guests||[]).find(guest=>!guest.accepted&&(guest.nxId===shared.me().id||guest.name===shared.member)):null;
    const inviteResponse=myInvite?card(head(t('Mời lên sóng','Invite on stage'),roomHost(room))+'<div class="lv-actions">'+action('accept-stage',t('Chấp nhận','Accept'),{style:'primary'})+action('decline-stage',t('Từ chối','Decline'),{style:'soft'})+'</div>'):'';
    const side=host?card(head(t('Trò chuyện trong phòng','Room chat'))+'<div class="lv-room-chat">'+chatRows(room,true)+'</div>'+commentForm(room))+
      (room.purpose==='tutorial'?qaPanel(room):room.purpose==='music'?listPanel(room,'songs')+listPanel(room,'hands'):['explore','community'].includes(room.purpose)?listPanel(room,'hands'):'')+(tools.length&&!['tutorial','explore','music','community'].includes(room.purpose)?card(head(t('Theo mục đích buổi live','Purpose tools'))+'<div class="lv-tool-grid">'+tools.map(tile).join('')+'</div>'):'')
      :inviteResponse+'<div class="lv-actions">'+tile('share')+tile('contacts')+tile('qa')+tile('hands')+(room.purpose==='music'?tile('songs'):'')+(room.wheelOpen?tile('wheel'):'')+'</div><p class="lv-note">'+t('Quà tặng / Tip: chờ quyết định.','Gifts / Tips: awaiting decision.')+'</p>';
    return '<section class="lv-surface lv-active-room"><header class="lv-top lv-live-top"><div><h1>'+esc(name)+'</h1><p class="lv-note">'+t('Bản mẫu · camera chỉ xem trên thiết bị này.','Demo · camera preview stays on this device.')+'</p></div><div class="lv-actions">'+action('back',t('Đang live','Live Now'),{icon:icon('ArrowLeft')})+
      (own(room)?action(host?'viewer':'host',host?t('Góc người xem','Viewer view'):t('Góc chủ buổi','Host view'),{style:'soft'}):'')+'</div></header>'+
      '<div class="lv-room-layout"><section class="lv-stage" aria-label="'+esc(name)+'"><div class="lv-stage-picture">'+
      (host?'<video id="live-camera" autoplay muted playsinline class="'+(room.beauty?'lv-beauty':'')+'"></video>':'')+
      '<div class="lv-stage-placeholder" id="camera-placeholder">'+roomMark(room)+(host?action('camera',t('Xem trước camera','Preview camera'),{style:'stage-pill',icon:icon('Camera')}):'')+'</div>'+
      '<div class="lv-stage-top">'+titleText+(host&&info.name?'<div class="lv-overlay"><strong>'+esc(info.name)+'</strong>'+(info.phone?' · '+esc(info.phone):'')+(info.address?'<br>'+esc(info.address):'')+'</div>':'')+'</div>'+
      showQr+((room.demo||prefs(id).reacted)?'<div class="lv-stage-hearts" aria-hidden="true"><span>♥</span><span>♥</span><span>♥</span></div>':'')+(participants.filter(row=>row.accepted).length?'<div class="lv-guests">'+participants.filter(row=>row.accepted).map(row=>'<span>'+personBadge(row.name)+esc(row.name)+(row.muted?icon('MicOff'):'')+'</span>').join('')+'</div>':'')+
      (room.pip&&host?'<div class="lv-pip">'+art('hand-coins',30)+'<video id="lv-pip-camera" autoplay muted playsinline></video><span>'+t('Camera phụ','Second camera')+'</span></div>':'')+
      (room.drawing?'<div class="lv-draw-note">'+t('Đang vẽ chú thích','Drawing annotation')+' '+action('toggle-draw',t('Xóa vẽ','Clear drawing'),{style:'stage-pill'})+'</div><canvas id="lv-annotation" aria-label="'+t('Vẽ chú thích','Draw annotation')+'"></canvas>':'')+
      '<div class="lv-stage-bottom">'+linkedPlace+musicOverlay+questionOverlay+pinned(room)+flashMarkup(room)+(pinnedComment?'<div class="lv-caption">'+icon('Pin')+esc(pinnedComment.author+': '+newsText(pinnedComment.text))+'</div>':'')+
      '<div class="lv-caption-row">'+captions+options+(host?'<span class="lv-donation-badge">'+art('gift',16)+t('Quyên góp VLINKPAY FOUNDATION','Donate to VLINKPAY FOUNDATION')+'</span>':'')+'</div>'+viewerChat+'</div></div>'+controls+'</section>'+
      '<aside class="lv-room-side">'+(room.poll||room.id==='po-live-bitcoin'?card(pollMarkup(room,host)):'')+side+'</aside></div></section>';
  };
  function commentForm(room){
    return form('comment','<input type="hidden" name="roomId" value="'+esc(room.id)+'"><div class="lv-comment-form"><input name="message" required maxlength="400" aria-label="'+t('Bình luận','Comment')+'" placeholder="'+t('Bình luận…','Comment…')+'">'+
      '<button class="lv-btn primary" aria-label="'+t('Gửi','Send')+'" type="submit">'+icon('Send')+'</button>'+
      action('react','♥',{style:'reaction',pressed:!!prefs(room.id).reacted})+'</div>','');
  }
  function pollFor(room){if(!own(room)&&room.ownerId){try{const data=JSON.parse(localStorage.getItem('nexora-v31:community-hub-tools:'+room.ownerId)||'{}'),saved=data.liveRooms?.find(row=>row.id===room.id);if(saved?.poll)return saved.poll;}catch{}}return room.poll||(room.id==='po-live-bitcoin'?samplePoll:null);}
  function pollMarkup(room,host){
    const poll=pollFor(room);
    if(!poll)return '<div data-live-poll="'+esc(room.id)+'">'+head(t('Poll đang chạy','Active poll'))+empty()+'</div>';
    const vote=poll.votes?.[shared.member],total=poll.counts.reduce((sum,value)=>sum+value,0);
    return '<div data-live-poll="'+esc(room.id)+'">'+head(t('Poll đang chạy','Active poll'))+'<p><strong>'+esc(newsText(poll.question))+'</strong></p>'+poll.choices.map((choice,index)=>{
      const share=total?Math.round(poll.counts[index]*100/total):0;
      return '<div class="lv-poll-choice"><button type="button" class="lv-poll-row" data-live-po="vote" data-live-value="'+index+'" aria-pressed="'+(vote===index)+'" '+(host||vote!==undefined?'disabled':'')+'><span>'+esc(newsText(choice))+'</span><b>'+share+'%</b></button><div class="lv-meter" aria-hidden="true"><i style="width:'+share+'%"></i></div></div>';
    }).join('')+'<p class="lv-note">'+total+' '+t('lượt bình chọn','votes')+'</p></div>';
  }
  function mapLink(address){return 'https://www.google.com/maps/search/?api=1&query='+encode(address);}
  function toolsPanel(room){
    const packs=[
      [t('Khách & tương tác','Guests & engagement'),['guest','poll','qa','hands']],
      [t('Bán hàng','Selling'),['services','flash','deals','wheel','oneqr','leads','overlay','title']],
      [t('Theo mục đích buổi live','Purpose tools'),['place','map','chapter','pip','draw','library','songs','moderation']],
      [t('Bản ghi & thống kê','Recording & stats'),['music','report','replay','recap']],
    ];
    return packs.map(([title,keys])=>'<h3 class="lv-eyebrow">'+esc(title)+'</h3><div class="lv-tool-grid">'+keys.map(tile).join('')+'</div>').join('');
  }
  function guestPanel(room,mode='guest'){
    const guests=room.guests||[],members=directory(),added=mode==='moderator'?room.safety?.moderators||[]:guests.map(row=>row.name);
    const entries=[...new Set([...demoGuests,...members.map(member=>member.name)])].filter(name=>name!==shared.member);
    const nameLabel=mode==='moderator'?t('Thêm người kiểm duyệt','Add moderator'):mode==='contacts'?t('Mời bạn','Invite friend'):t('Mời lên sóng','Invite on stage');
    const stage=mode==='guest'?card(head(t('Sân khấu','Stage'),t('Khách được mời hiện cạnh chủ buổi.','Accepted guests appear next to the host.'))+
      '<div class="lv-stage-preview"><div>'+art('video',40)+'<strong>'+esc(roomHost(room))+'</strong><small>'+t('Chủ buổi · Bạn','Host · You')+'</small></div>'+guests.filter(guest=>guest.accepted).map(guest=>'<div>'+personBadge(guest.name)+'<strong>'+esc(guest.name)+'</strong><small>'+t('Khách','Guest')+'</small></div>').join('')+'</div>'+guests.map(guest=>row(guest.name,guest.accepted?t('Khách','Guest'):t('Đã mời','Invited'),'<div class="lv-actions">'+
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
    return card(head(room.purpose==='tutorial'?t('Hàng đợi câu hỏi của học viên','Student question queue'):t('Hộp hỏi đáp','Q&A inbox'),t('Câu hỏi tách khỏi trò chuyện.','Questions are kept separate from chat.'))+(host&&questions.length?action('answer-next',t('Tiếp theo','Next'),{style:'soft'}):'')+
      (questions.length?questions.map(question=>row(question.author+': '+newsText(question.text),room.answering===question.id?t('Đang trả lời','Answering now'):'',
        host?action('answer',t('Ghim','Pin'),{value:question.id,pressed:room.answering===question.id,style:'soft'}):'',personBadge(question.author))).join(''):empty()))+
      (!host?card(form('question',field(t('Câu hỏi','Question'),'text','','required maxlength="300"'),t('Gửi câu hỏi','Send question'))):'');
  }
  function shelfPanel(room){
    const deals=dealsFor(room),services=servicesFor(room),host=hostMode(room);
    return '<p class="lv-sync-note">'+t('Tự đồng bộ từ SIPOS — chủ buổi không nhập lại dịch vụ hay deal.','Synced from SIPOS — the host does not re-enter services or deals.')+'</p>'+
      card(head(t('Dịch vụ của tiệm (từ thực đơn SIPOS)','Salon services (SIPOS menu)'))+(services.length?services.map((service,index)=>row(service.name,service.price?'$'+service.price:t('Giá hiển thị theo cấu hình của tiệm trên SIPOS','Price follows the salon’s SIPOS configuration'),
        action(host?'pin-service':'service-link',host?(room.serviceId===service.id?t('Đang ghim ✓','Pinned ✓'):t('Ghim lên live','Pin to live')):t('Xem','View'),{value:service.id,style:room.serviceId===service.id?'primary':'soft'}),art(['paintbrush','hand-coins','sparkles'][index%3]))).join(''):empty()))+
      card(head(t('Deal / coupon đang có của tiệm — chọn để gắn','Salon deals / coupons — select to attach'))+(deals.length?deals.map(deal=>row(deal.title+(deal.discount&&!deal.title.includes(deal.discount)?' −'+deal.discount:''),deal.id==='extra-po-crypto'?t('Khách bấm thẻ → tới mục coupon của tiệm để nhận','Tap the card to claim from the salon’s coupons'):t('Đang chạy trên Deal & Coupon của tiệm','Available in the salon’s Deals & Coupons'),
        action(host?'pin-deal':'coupon',host?(room.dealId===deal.id?t('Đang gắn ✓','Attached ✓'):t('Gắn vào live','Pin to live')):t('Nhận','Get coupon'),{value:deal.id,style:room.dealId===deal.id?'attached':'soft'}),art(deal.id==='extra-po-crypto'?'wallet':'ticket'))).join(''):empty()))+
      '<p class="lv-note">'+t('Coupon nhận trong live nằm trong ví coupon của khách và dùng tại POS của tiệm. Lượt bấm, nhận và đặt lịch được ghi vào báo cáo buổi live.','Coupons claimed during the live go to the customer’s coupon wallet for use at the salon’s POS. Clicks, claims and bookings appear in the livestream report.')+'</p>';
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
      row(t('AI rà soát hình ảnh live','AI image screening'),t('Cần kết nối dịch vụ live.','Requires the livestream service.'),chip(t('Mẫu','Demo'),'violet'),icon('Shield'))+
      row(t('Cảnh báo nhạc bản quyền','Music copyright warning'),'',tile('library'),icon('Music')))+
      card(head(t('Đồng kiểm duyệt','Co-moderators'))+(safety.moderators||[]).map(name=>row(name,t('Xóa / tắt tiếng / chặn người xem — không thể kết thúc buổi live','Delete / mute / block viewers — cannot end the livestream'),action('moderator-remove',t('Gỡ','Remove'),{value:name}),personBadge(name))).join('')+
      action('panel',t('+ Thêm người kiểm duyệt','+ Add moderator'),{value:'moderator',style:'soft'}));
  }

  function listPanel(room,key){
    const rows=room[key]||[],host=hostMode(room),hands=key==='hands';
    return card(head(label(key))+(rows.length?rows.map((item,index)=>row(item.name,newsText(item.text),
      host?action(hands?'queue-invite':index===0?'song-next':'song-rank',hands?t('Mời phát biểu','Invite to speak'):index===0?t('Tiếp theo','Next'):t('Xếp hạng','Rank'),{value:item.id,style:'soft'}):'',personBadge(item.name))).join(''):empty()))+
      (!host?card(hands?action('raise',t('Giơ tay phát biểu','Raise hand to speak'),{style:'primary',icon:icon('Hand')}):form('song',field(t('Tên bài hát','Song title'),'text','','required maxlength="100"'),t('Gửi yêu cầu','Send request'))):'');
  }
  function leadsPanel(room){
    const rows=room.leads||[];
    return card(head(t('Bình luận đúng cú pháp → tự thành đơn','Recognized comments → order requests'))+(rows.length?rows.filter(item=>item.kind!=='coupon').map(item=>row(item.name+': '+newsText(item.text),'NEXI (AI): '+(item.kind==='booking'?t('Đã nhận yêu cầu đặt lịch, mời bạn chọn giờ trống…','Booking request received. Please choose an available time…'):t('Đã ghi nhận đơn GEL20 — tiệm sẽ liên hệ xác nhận lịch 💜','GEL20 request received — the salon will contact you to confirm 💜')),chip(t('Đã bắt đơn','Captured'),'green'),personBadge(item.name))).join(''):empty()))+
      card(head(t('Danh sách khách (leads) của buổi live','Livestream leads'),t('Khách nhận deal và yêu cầu đặt lịch để tiệm chăm sóc tiếp.','Customers who claimed offers or requested appointments.'))+(rows.length?rows.map(item=>row(item.name,room.demo&&item.name==='Lan Phạm'?t('Nhận coupon New Guest Offer · Đã đặt lịch T7 10:00 AM','Claimed New Guest Offer · Booked Saturday 10:00 AM'):room.demo&&item.name==='Kevin Trần'?t('Bấm thẻ Gel Manicure · Chốt đơn GEL20','Tapped Gel Manicure · GEL20 order request'):newsText(item.note||item.text),chip(item.status==='booked'?t('Đã book','Booked'):t('Khách tiềm năng','Lead'),item.status==='booked'?'green':'violet'),personBadge(item.name))).join(''):empty()))+
      (hostMode(room)?'<div class="lv-actions lv-actions-wide">'+action('export-leads',t('Xuất danh sách','Export list'),{icon:icon('Download'),disabled:!rows.length,style:'primary'})+action('followup-leads',t('Nhắn tin chăm sóc','Follow up'),{icon:icon('MessageCircle'),disabled:!rows.length})+'</div>':'');
  }
  const rowMarkup=item=>row(item.name,newsText(item.text),action('lead-message',t('Nhắn tin','Message'),{value:item.name,style:'soft'}),personBadge(item.name));
  function wheelPanel(room){
    const results=(shared.read().wheelCampaignResults||[]).filter(row=>row.campaign===room.id),mine=results.find(row=>row.account===shared.me().id);
    const prizes=wheelPrizes.map(prize=>({...prize,pageTitle:roomHost(room),pageId:room.pageId}));
    return card('<div class="lv-wheel-preview"><div class="lv-wheel-disc" aria-hidden="true">'+art('gift',60)+'</div></div>'+head(t('Vòng quay chung của nền tảng','Shared Lucky Wheel'),t('Kết quả do máy quyết định. Quà khóa theo số điện thoại người trúng.','The engine selects the result. Rewards are locked to the winner’s phone number.'))+
      '<div class="lv-chips lv-wheel-odds">'+prizes.map((p,index)=>chip(t(p.vi,p.en)+' · '+p.probability+'%',['violet','blue','green','amber','pink'][index%5])).join('')+'</div><p class="lv-note">'+t('Tỷ lệ hiển thị trước khi quay · tổng = 100%.','Odds are shown before spinning · total = 100%.')+'</p>'+
      (hostMode(room)?action('wheel-open',room.wheelOpen?t('Đang mở cho người xem','Open to viewers'):t('Mở quay cho người xem','Open wheel to viewers'),{style:'primary',pressed:!!room.wheelOpen}):room.wheelOpen?mine?'':form('wheel',field(t('Số điện thoại','Phone number'),'phone',shared.me().phone||'','type="tel" required inputmode="tel" autocomplete="tel"')+action('follow',prefs(room.id).follow?t('Đang theo dõi','Following'):t('Theo dõi Page','Follow Page'),{pressed:!!prefs(room.id).follow}),t('Quay','Spin')):chip(t('Chưa mở quay','Not open yet'),'amber')))+
      card(head(t('Kết quả vừa quay','Latest results'))+(results.length?results.slice(-5).reverse().map(result=>row(result.name,t(result.prize.vi,result.prize.en)+' · ••••'+result.phone.slice(-4),chip(result.prize.key==='none'?t('Chúc may mắn','Better luck next time'):t('Đã lưu ví','Saved to wallet'),'green'),personBadge(result.name))).join(''):room.demo?'<div class="lv-wheel-sample">'+row(t('Lan Phạm — trúng Gift card $10','Lan Phạm — won a $10 gift card'),t('Mẫu: quà khóa theo số điện thoại · dùng tại POS của tiệm','Sample: phone-locked reward · redeem at the salon’s POS'),chip(t('Đã lưu ví · mẫu','Saved to wallet · sample'),'green'),personBadge('Lan Phạm'))+'</div>':empty())+action('wheel-wallet',t('Ví quà của tôi','My rewards'),{style:'soft'}));
  }
  function reportPanel(room){
    const stats=room.stats||{},statsRows=[
      [t('Người xem đỉnh','Peak viewers'),stats.peak||room.viewers||0],
      [t('Bấm thẻ / deal','Card / deal clicks'),stats.clicks||0],
      [t('Nhận coupon mẫu','Demo coupons claimed'),room.stats?.coupons||room.flash?.claimed?.length||0],
      [t('Yêu cầu đặt lịch','Booking requests'),room.stats?.bookings||(room.leads||[]).filter(lead=>lead.kind==='booking').length],
    ];
    return '<p class="lv-demo">'+t('Dữ liệu mẫu trong trình duyệt.','Demo data from this browser.')+'</p><div class="lv-grid2">'+statsRows.map(([name,value])=>card('<small>'+esc(name)+'</small><h3>'+value+'</h3>')).join('')+'</div>'+
      card(head(t('Phễu khép vòng live → POS','Livestream-to-POS funnel'))+
        [[t('Xem live','Live views'),stats.views||room.viewers||0],[t('Bấm deal / thẻ dịch vụ','Deal / service clicks'),stats.clicks||0],[t('Đặt lịch qua live','Bookings from live'),stats.bookings||(room.leads||[]).filter(row=>row.kind==='booking').length]].map(([name,count])=>'<div class="lv-funnel-step">'+row(name,'',chip(String(count)))+'<div class="lv-meter"><i style="width:'+Math.min(100,(count/Math.max(1,stats.views||room.viewers||0))*100)+'%"></i></div></div>').join('')+
        '<div class="lv-funnel-step">'+row(t('Doanh thu ghi nhận tại POS','POS revenue'),'',chip(t('Theo SIPOS','From SIPOS'),'violet'))+'<div class="lv-meter"><i style="width:23%;background:#24bd91"></i></div></div>'+action('panel',t('Xem danh sách khách của buổi này','View this session’s leads'),{value:'leads',style:'primary'}));
  }

  function notificationPanel(){
    const types=[['live',t('Buổi live bắt đầu / nhắc lịch','Live starts / reminders')],['sales',t('Tin nhắn & đơn bán hàng','Messages & sales')],['replay',t('Đặt lịch & bản xem lại','Bookings & replays')],['activity',t('Tương tác trong live của tôi','Activity in my live')]];
    const entries=state.livePONotifications.filter(entry=>liveRoomById(entry.id)).slice(0,18);
    return card(head(label('notify'))+(entries.length?entries.map(entry=>'<button class="lv-notice-row" type="button" data-live-po="notice-open" data-live-value="'+esc(entry.key)+'">'+art({live:'video',sales:'layout-list',replay:'video',activity:'bell'}[entry.type]||'bell',32)+'<span><strong>'+esc(newsText(entry.title))+'</strong><small>'+esc(newsText(entry.text))+'</small></span>'+chip(entry.unread?entry.unread+' '+t('chưa đọc','unread'):t('Mở','Open'),entry.unread?'red':'violet')+'</button>').join(''):empty()))+
      card(head(t('Cài đặt theo loại & kênh','Settings by type and channel'))+
      form('channels',types.map(([key,text])=>'<div class="lv-channel">'+toggle(key+':enabled',text,state.livePOChannels[key+':enabled']!==false)+
      '<div class="lv-chips">'+[['app',t('Trong app','In app')],['push',t('Đẩy (push)','Push')],['email','Email'],['sms','SMS']].map(([channel,caption])=>'<label><input type="checkbox" name="'+key+':'+channel+'" '+(state.livePOChannels[key+':'+channel]??(channel==='app'||channel==='push'||(key==='replay'&&channel==='email'))?'checked':'')+'>'+esc(caption)+'</label>').join('')+'</div></div>').join(''),t('Lưu thay đổi','Save changes')));
  }

  function pushRoomNotice(room,type,heading,body,target=''){
    if(state.livePOChannels[type+':enabled']===false||state.livePOChannels[type+':app']===false||state.livePONotifications.some(entry=>entry.id===room.id&&entry.title===heading))return;
    const before=state.livePONotifications;
    state.livePONotifications=[{key:crypto.randomUUID(),id:room.id,type,title:heading,text:body,target},...before].slice(0,60);
    if(!save())state.livePONotifications=before;
  }
  function summaryDraft(room){
    const count=chat(room).length,leads=(room.leads||[]).length;
    if(room.demo)return t('• Giới thiệu 3 mẫu Gel mới cho dịp Tết\n• Giải đáp: Gel bền hơn bột ở điểm nào\n• Flash Deal −20% trong 10 phút — 17 coupon đã được nhận\n• Hỏi đáp: lịch walk-in cuối tuần','• Introduced 3 new Gel styles for Lunar New Year\n• Q&A: Gel and acrylic durability\n• Flash Deal −20% for 10 minutes — 17 coupons claimed\n• Q&A: weekend walk-in appointments');
    return [newsText(room.description),count+' '+t('bình luận','comments'),leads+' '+t('khách tiềm năng','leads')].filter(Boolean).join('\n');
  }
  function recapPanel(room){
    const title=room.summary?.title&&!(room.demo&&room.summary.title==='BITCOIN NAIL BAR')?room.summary.title:roomName(room)+' | '+roomHost(room);
    return '<p class="lv-ai-notice"><strong>NEXI (AI)</strong> '+t('đã soạn bản nháp dưới đây. Nội dung chỉ đăng sau khi chủ buổi duyệt — luôn có nhãn AI.','prepared the draft below. It is published only after the host approves it and always keeps its AI label.')+'</p>'+card(
      form('summary',field(t('Tiêu đề gợi ý cho bản xem lại','Suggested replay title'),'title',title,'required maxlength="160"')+
      textarea(t('Tóm tắt nội dung chính','Summary'),'body',room.summary?.body||summaryDraft(room),'required maxlength="1600" rows="6"')+
      highlightMarkup(room)+'<div class="lv-actions"><button class="lv-btn" type="submit" name="result" value="draft">'+t('Sửa lại · Lưu nháp','Edit · Save draft')+'</button><button class="lv-btn primary" type="submit" name="result" value="publish" '+(room.status!=='ended'?'disabled':'')+'>'+t('Duyệt & đăng bản xem lại','Approve & publish replay')+'</button></div>',''));
  }
  function highlightMarkup(room){
    return room.highlights?.length?'<div class="lv-highlights">'+head(t('Điểm nổi bật nên cắt clip','Suggested clip highlights'))+'<div class="lv-chips">'+room.highlights.map((h,index)=>action('highlight',clock(h.from)+'–'+clock(h.to)+' '+newsText(h.title),{value:String(index),icon:icon('Scissors'),style:'soft'})).join('')+'</div></div>':'';
  }
  const hasRecording=room=>!!(room.videoId||room.videoSrc);
  async function recordingBlob(room){if(room.videoId)return loadVideo(room.videoId);if(room.videoSrc){const response=await fetch(room.videoSrc);if(!response.ok)throw Error(t('Không tải được bản ghi.','Could not load the recording.'));return response.blob();}return null;}
  function replayPanel(room){
    const host=hostMode(room),media=hasRecording(room)?'<video class="lv-replay" data-live-replay="'+esc(room.videoId||room.id)+'" '+(room.videoSrc&&!room.videoId?'src="'+esc(room.videoSrc)+'"':'')+' controls playsinline></video>':'';
    const currentRecord=recording?.roomId===room.id,saved=(state.savedLiveItineraries||[]).some(row=>row.roomId===room.id);
    return card(media+(host&&room.status==='live'?action('record',currentRecord?t('Dừng ghi','Stop recording'):t('Ghi bản xem thử','Record camera preview'),{style:'soft',icon:icon('CircleDot')}):'')+
      (!hasRecording(room)&&!currentRecord?'<p class="lv-note">'+t('Chưa có bản ghi.','No recording yet.')+'</p>':''))+
      card(head(t('Mục lục chương','Chapters'))+(room.chapters?.length?room.chapters.map(item=>row(clock(item.time)+' · '+newsText(item.title),'',action('seek',t('Phát','Play'),{value:String(item.time),disabled:!hasRecording(room),icon:icon('Play')}))).join(''):empty())+
      (room.purpose==='tutorial'?'<p class="lv-note">'+t('Replay chia chương có thể đưa vào thư viện OneAcademy.','Chaptered replay can be added to the OneAcademy library.')+'</p>'+action('academy-add',t('Đưa vào thư viện OneAcademy','Add to OneAcademy'),{style:'soft',disabled:!host||!hasRecording(room)})+action('academy','OneAcademy',{style:'soft'}):''))+
      ((room.places?.length||room.place)?card(head(t('Địa điểm đã ghé trong buổi','Places visited during the live'))+(room.places||[room.place]).map(place=>row(place.name,place.address,action('save-itinerary',saved?t('Đã lưu lịch trình','Itinerary saved'):t('Lưu lịch trình','Save itinerary'),{style:'soft',pressed:saved}),art('map-pin',30))).join('')):'')+
      '<div class="lv-replay-actions">'+(host?action('panel',t('Cắt clip ngắn','Trim short clip'),{value:'trim',icon:icon('Scissors'),disabled:!hasRecording(room)}):'')+
      action('download',t('Tải bản ghi','Download recording'),{icon:icon('Download'),disabled:!hasRecording(room)})+
      (host?action('panel',t('Cắt đầu/cuối','Trim start / end'),{value:'trim-ends',icon:icon('Scissors'),disabled:!hasRecording(room)})+action('change-cover',t('Đổi ảnh bìa','Change cover'),{icon:icon('Image')}):'')+'</div>'+
      (host?'<details class="lv-recording-files"><summary>'+t('Tệp bản ghi / ảnh bìa','Recording / cover files')+'</summary>'+card(form('recording','<label class="lv-field">'+t('Tệp bản ghi','Recording file')+'<input type="file" name="video" accept="video/*"></label><label class="lv-field">'+t('Đổi ảnh bìa','Change cover')+'<input type="file" name="cover" accept="image/*"></label>',t('Lưu bản ghi','Save recording')))+'</details>':'');
  }
  function openPanel(key,room=getRoom()){
    if(key==='notify'){showDialog(label(key),notificationPanel(),key);return;}
    if(!room)return;
    if(['replay','trim','trim-ends'].includes(key)&&room.status==='ended'&&!canOpenReplay(room))return;
    const heading=key==='poll'?t('Poll & Hỏi đáp','Poll & Q&A'):toolLabels[key]?label(key):({tools:t('Công cụ buổi live','Live tools'),moderator:t('Thêm người kiểm duyệt','Add moderator'),trim:t('Cắt clip ngắn','Trim short clip'),'trim-ends':t('Cắt đầu/cuối','Trim start / end')})[key];
    let body='';
    switch(key){
      case 'tools':body=toolsPanel(room);break;
      case 'guest':case 'moderator':case 'contacts':body=guestPanel(room,key);break;
      case 'poll':body=card(pollMarkup(room,hostMode(room)))+qaPanel(room)+card(form('poll',field(t('Câu hỏi','Question'),'question','','required maxlength="120"')+
        field(t('Lựa chọn 1','Option 1'),'choice','','required maxlength="80"')+field(t('Lựa chọn 2','Option 2'),'choice','','required maxlength="80"')+
        field(t('Lựa chọn 3','Option 3'),'choice','','maxlength="80"'),t('Tạo poll mới','Create poll')));break;
      case 'qa':body=qaPanel(room);break;
      case 'services':case 'deals':body=shelfPanel(room);break;
      case 'flash':{const progress=flashProgress(room);body=card(head(t('Tạo deal giới hạn ngay trong live','Create a limited offer during the live'),t('Deal sinh ra trong live nối thẳng kho Deal & Coupon và dùng tại POS.','Deals created during the live connect to Deals & Coupons for use at POS.'))+
        form('flash',field(t('Nội dung ưu đãi','Offer'),'name',room.flash?.name||(room.demo?t('Giảm 20% Gel Manicure — chỉ trong buổi live','20% off Gel Manicure — during this live only'):''),'required maxlength="100"')+
        '<div class="lv-flash-fields">'+field(t('Thời gian chạy (phút)','Duration (minutes)'),'minutes',room.flash?.durationMinutes||'10','type="number" min="1" max="180" required')+
        field(t('Số lượng tối đa','Coupon limit'),'limit',room.flash?.limit||'30','type="number" min="1" max="1000" required')+'</div>',t('Kích hoạt Flash Deal','Activate flash deal')))+
        (progress.active?card('<div class="lv-flash-heading">'+head(t('Đang chạy','Running'))+chip('LIVE DEAL','amber')+'</div>'+flashMarkup(room)+'<p><span data-flash-count>'+progress.claimed+'</span> / '+progress.limit+' '+t('coupon đã nhận · hết giờ hoặc hết suất, hệ thống tự tắt','coupons claimed · closes when time or stock runs out')+'</p><div class="lv-meter"><i data-flash-progress style="width:'+Math.min(100,progress.claimed/progress.limit*100)+'%"></i></div>','lv-flash-status'):'')+
        '<p class="lv-flash-note">'+t('Người xem thấy đồng hồ đếm ngược ngay trên màn hình live. Hết giờ, thẻ deal tự biến mất khỏi buổi live.','Viewers see the countdown on the live screen. When time runs out, the deal card disappears.')+'</p>';break;}
      case 'wheel':body=wheelPanel(room);break;
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
      case 'trim-ends':case 'trim':body=card(form(key,field(t('Bắt đầu (giây)','Start (seconds)'),'from','0','type="number" min="0" step="0.1" required')+
        field(t('Kết thúc (giây)','End (seconds)'),'to','','type="number" min="0.1" step="0.1" required'),key==='trim-ends'?t('Lưu bản ghi đã cắt','Save trimmed recording'):t('Tải clip ngắn','Download clip')));break;
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
    if(key==='replay'){if(room.videoId)mountReplay(room.videoId);bindReplayComments(room);}
  }

  function bindReplayComments(room){
    const video=$('editor').querySelector('[data-live-replay]');if(!video||!room.timedComments?.length)return;
    const caption=document.createElement('p');caption.className='lv-replay-comment';video.after(caption);
    const sync=()=>{const row=[...room.timedComments].reverse().find(row=>row.time<=video.currentTime);caption.textContent=row?clock(row.time)+' · '+newsText(row.text):'';};video.addEventListener('timeupdate',sync);sync();
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
  async function trimClip(room,start,end,replaceRecording=false){
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
      const blob=await duringTrim(recordingBlob(room));
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
      if(replaceRecording){const id=await storeVideo(clip);if(!updateRoom(room,{videoId:id,videoSrc:'',chapters:(room.chapters||[]).filter(row=>row.time>=start&&row.time<end).map(row=>({...row,time:row.time-start})),timedComments:(room.timedComments||[]).filter(row=>row.time>=start&&row.time<end).map(row=>({...row,time:row.time-start})),highlights:(room.highlights||[]).filter(row=>row.to>start&&row.from<end).map(row=>({...row,from:Math.max(0,row.from-start),to:Math.min(end,row.to)-start}))})){await removeVideo(id);throw Error(t('Không thể lưu. Vui lòng thử lại.','Unable to save. Please try again.'));}if(room.videoId)await removeVideo(room.videoId);cancelTrim=null;refresh(getRoom(room.id),'replay');}else await download(clip,'livestream-clip.webm');
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
      const remaining=Math.ceil((Number(node.dataset.lvFlash)-Date.now())/1000),room=getRoom(node.dataset.flashRoom),progress=room?flashProgress(room):{active:remaining>0};
      node.hidden=!progress.active;
      if(progress.active){node.querySelector('time').textContent=clock(remaining);const status=node.closest('.lv-flash-status');if(status){status.querySelector('[data-flash-count]').textContent=progress.claimed;status.querySelector('[data-flash-progress]').style.width=Math.min(100,progress.claimed/progress.limit*100)+'%';}}
      else {node.closest('[data-lv-flash-card]')?.remove();node.closest('.lv-stage')?.querySelector('[data-lv-flash-card]')?.remove();node.closest('.lv-flash-status')?.remove();}
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
    const index=Number(value);if(hostMode(room)||!canWatchRoom(room))return;
    if(!own(room)&&room.ownerId){
      const key='nexora-v31:community-hub-tools:'+room.ownerId;
      try{const data=JSON.parse(localStorage.getItem(key)||'{}'),saved=data.liveRooms?.find(row=>row.id===room.id),poll=saved?.poll;
        if(!poll||poll.votes?.[shared.member]!==undefined||!Object.hasOwn(poll.choices,index))return;
        poll.votes||={};poll.counts[index]++;poll.votes[shared.member]=index;localStorage.setItem(key,JSON.stringify(data));
        foreignRoom=saved;const overlay=state.livePOViewer[room.id]?.room;if(overlay)delete overlay.poll;refresh(getRoom(room.id));
      }catch{feedback(t('Không thể lưu. Vui lòng thử lại.','Could not save. Please try again.'));}return;
    }
    const source=pollFor(room);if(!source||source.votes?.[shared.member]!==undefined||!Object.hasOwn(source.choices,index))return;
    const poll=structuredClone(source);poll.votes||={};poll.counts[index]++;poll.votes[shared.member]=index;patch(room,{poll});
  }
  function claimFlash(room){
    const flash=room.flash;
    if(!flash?.dealId||!flashProgress(room).active)return;
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
    if(!updateRoom(room,{flash:{name,expiresAt,limit,durationMinutes:minutes,dealId:id}})){
      if(before===null)localStorage.removeItem(recordKey);else localStorage.setItem(recordKey,before);
      return;
    }
    refresh(room,'flash');
  }
  function changeGuests(room,key,name){
    const guests=room.guests||[],row=guests.find(item=>item.name===name);
    if(key==='invite'&&!row){
      const contact=directory().find(item=>item.name===name);
      const result=patch(room,{guests:[...guests,{name,nxId:contact?.nxId||contact?.id,accepted:false,muted:false}]},'guest');if(result)shared.notify(t('Mời lên sóng','Invite on stage'),'live',{liveId:room.id,liveOwner:room.ownerId,liveView:'viewer'},name);return result;
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
    const safety=room.safety||{},previous=own(room)?state.liveChats[room.id]||[]:foreignRoom?.id===room.id?foreignChats:state.liveChats[room.id]||[],recent=previous.findLast(row=>row.member===shared.member);
    if((safety.blocked||[]).includes(shared.member)||(safety.muted||[]).includes(shared.member))throw Error(t('Bạn không thể bình luận trong buổi live này.','You cannot comment in this livestream.'));
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
    if(!own(room)&&foreignRoom?.id===room.id){const key='nexora-v31:community-hub-tools:'+room.ownerId;try{const data=JSON.parse(localStorage.getItem(key)||'{}');data.liveChats||={};data.liveChats[room.id]=next;if((sale||booking)&&room.pageId==='p1'){const hostRoom=data.liveRooms?.find(item=>item.id===room.id);if(hostRoom)hostRoom.leads=[...(hostRoom.leads||[]),{name:person(),text:message,kind:booking?'booking':'order'}];}localStorage.setItem(key,JSON.stringify(data));foreignChats=next;}catch{state.liveChats[room.id]=previous;return;}}
    refresh(room);
  }
  function moderateLiveChat(room,id,kind){
    if(!canModerate(room))return;
    const key='nexora-v31:community-hub-tools:'+room.ownerId;
    const data=own(room)?state:JSON.parse(localStorage.getItem(key)||'{}');
    const target=data.liveRooms?.find(item=>item.id===room.id),messages=data.liveChats?.[room.id]||[],message=messages.find(item=>item.id===id);
    if(!target||!message)return;
    const participant=message.member||message.author;
    if(kind!=='delete-live-comment'&&(participant===room.owner||participant===shared.member))return;
    const before=JSON.stringify(data);
    if(kind==='delete-live-comment')data.liveChats[room.id]=messages.filter(item=>item.id!==id);
    else {target.safety||={};const field=kind==='mute-live-viewer'?'muted':'blocked';target.safety[field]=[...new Set([...(target.safety[field]||[]),participant])];}
    if(own(room)){if(!save()){Object.assign(state,JSON.parse(before));return;}}
    else{try{localStorage.setItem(key,JSON.stringify(data));foreignRoom=target;foreignChats=data.liveChats[room.id];}catch{return;}}
    closeDialog();refresh(getRoom(room.id));
  }
  function academyPanel(){
    const entries=state.academyReplays||[];
    showDialog('OneAcademy',card(head('OneAcademy')+(entries.length?entries.map(item=>row(newsText(item.title),t('Bản xem lại · Mục lục chương','Replay · Chapters'),action('academy-open',t('Phát','Play'),{value:item.id,style:'soft'}),art('video',32))).join(''):empty())),'academy');
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
      if(key==='question'){const text=read('text');if(!text||!canWatchRoom(room))return;const question={id:crypto.randomUUID(),author:person(),member:shared.member,text};if(!own(room)&&room.ownerId){const storageKey='nexora-v31:community-hub-tools:'+room.ownerId,data=JSON.parse(localStorage.getItem(storageKey)||'{}'),target=data.liveRooms?.find(row=>row.id===room.id);if(!target)return;target.questions=[...(target.questions||[]),question];localStorage.setItem(storageKey,JSON.stringify(data));foreignRoom=target;if(state.livePOViewer[room.id]?.room)delete state.livePOViewer[room.id].room.questions;refresh(getRoom(room.id),'qa');}else patch(room,{questions:[...(room.questions||[]),question]},'qa');return;}
      if(key==='song'){if(read('text'))trackQueue(room,'songs',read('text'));return;}
      if(key==='wheel'){
        if(!room.wheelOpen||hostMode(room)||!prefs(room.id).follow)throw Error(t('Theo dõi Page trước khi quay.','Follow the Page before spinning.'));
        const result=shared.drawCampaign(room.id,wheelPrizes.map(prize=>({...prize,pageId:room.pageId,pageTitle:roomHost(room)})),read('phone'));
        if(!result)throw Error(t('Nhập số điện thoại hợp lệ.','Enter a valid phone number.'));
        openPanel('wheel',room);return;
      }
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
      if(key==='trim'||key==='trim-ends'){await trimClip(room,Number(read('from')),Number(read('to')),key==='trim-ends');return;}
    };
    run().catch(error=>feedback(error.message)).finally(()=>{delete form.dataset.saving;});
  }
  document.addEventListener('submit',liveSubmit,true);
  window.addEventListener('storage',event=>{if(!event.key?.startsWith('nexora-v31:community-hub-tools:')||!activeLiveRoom)return;let data;try{data=JSON.parse(event.newValue||'{}');}catch{return;}const saved=data.liveRooms?.find(row=>row.id===activeLiveRoom);if(!saved)return;const ownRoom=state.liveRooms.find(row=>row.id===saved.id);if(ownRoom&&saved.ownerId===shared.me().id){if(saved.poll)ownRoom.poll=saved.poll;ownRoom.questions=saved.questions||[];ownRoom.guests=saved.guests||[];}const room=getRoom(saved.id);if(!room)return;for(const node of document.querySelectorAll('[data-live-poll]'))if(node.dataset.livePoll===saved.id)node.outerHTML=pollMarkup({...room,poll:saved.poll},hostMode(room));});

  async function liveClick(event){
    const button=event.target.closest('[data-live-po]');
    if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();
    const key=button.dataset.livePo,value=button.dataset.liveValue||'';
    const room=getRoom(dialogRoom||activeLiveRoom),host=room&&hostMode(room);
    try{
      if(key==='close'){closeDialog();return;}
      if(key==='academy'){academyPanel();return;}
      if(key==='academy-open'){closeDialog();const entry=getRoom(value);if(entry){openRoom(value);openPanel('replay',entry);}return;}
      if(key==='academy-add'){if(!room||!hostMode(room)||!hasRecording(room))return;state.academyReplays||=[];if(!state.academyReplays.some(item=>item.id===room.id)){state.academyReplays.push({id:room.id,title:room.title,chapters:room.chapters||[]});if(!save()){state.academyReplays.pop();return;}}academyPanel();return;}
      if(key==='moderate-message'){if(!room||!canModerate(room))return;const item=chat(room).find(row=>row.id===value);if(item)showDialog(t('Kiểm duyệt & an toàn','Moderation & safety'),card(head(item.author,newsText(item.text))+'<div class="lv-actions">'+action('delete-live-comment',t('Xóa','Delete'),{value})+action('mute-live-viewer',t('Tắt tiếng','Mute'),{value})+action('block-live-viewer',t('Chặn người xem','Block viewer'),{value})+'</div>'),'message-moderation',room.id);return;}
      if(['delete-live-comment','mute-live-viewer','block-live-viewer'].includes(key)){if(room)moderateLiveChat(room,value,key);return;}

      if(key==='start'){openLiveComposer();return;}
      if(key==='filter'){category=value;render();return;}
      if(key==='open'){openRoom(value);return;}
      if(key==='back'){stopAllMedia();closeDialog();activeLiveRoom=null;viewer=false;render();return;}
      if(key==='panel'){openPanel(value,room);return;}
      if(key==='obs'){const value='RTMP: rtmp://live.nexoratouch.com/app · Key: ••••••••';if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);feedback(t('Đã sao chép.','Copied.'));}else showDialog('OBS / Stream key',field('RTMP / Stream key','stream',value,'readonly'));return;}
      if(key==='purpose'){purposePage();return;}
      if(key==='pick-purpose'){setup.purpose=value;purposePage();return;}
      if(key==='return-setup'){setupPage();return;}
      if(key==='schedule'){schedulePage();return;}
      if(key==='cancel-schedule'){const selected=getRoom(value);if(!selected||!own(selected)||selected.status!=='scheduled')return;if(!updateRoom(selected,{status:'cancelled',cancelledAt:Date.now()}))return;setup=null;activeLiveRoom=null;closeDialog();render();return;}
      if(key==='edit-schedule'){const row=getRoom(value);if(row&&own(row))schedulePage(row);return;}
      if(key==='camera'){await preview();return;}
      if(key==='beauty'&&dialogPanel==='setup'){readSetup();setup.beauty=!setup.beauty;setupPage();return;}
      if(key==='copy'){const row=getRoom(value)||room;if(row)await copyLink(row);return;}
      if(key==='zalo'){const row=getRoom(value)||room;if(row){if(navigator.share)await navigator.share({url:liveLink(row)});else await copyLink(row);}return;}
      if(key==='notice-open'){
        const item=state.livePONotifications.find(row=>row.key===value);
        if(item?.peer){closeDialog();route('connect',{peer:item.peer,recipient:item.peer});return;}
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
      if(key==='accept-stage'||key==='decline-stage'){
        if(own(room)||!room.ownerId||!canWatchRoom(room))return;const storageKey='nexora-v31:community-hub-tools:'+room.ownerId,data=JSON.parse(localStorage.getItem(storageKey)||'{}'),target=data.liveRooms?.find(row=>row.id===room.id),invite=target?.guests?.find(guest=>!guest.accepted&&(guest.nxId===shared.me().id||guest.name===shared.member));if(!invite)return;
        if(key==='accept-stage')invite.accepted=true;else target.guests=target.guests.filter(guest=>guest!==invite);localStorage.setItem(storageKey,JSON.stringify(data));foreignRoom=target;refresh(getRoom(room.id));return;
      }
      if(key==='follow'){follow(room);return;}
      if(key==='caption'){caption={en:'vi',vi:'off',off:'en'}[caption];refresh(room);return;}
      if(key==='react'){if(saveViewer(room.id,{reacted:!prefs(room.id).reacted}))refresh(room);return;}
      if(key==='vote'){vote(room,value);return;}
      if(key==='coupon'){openCoupon(room,value);return;}
      if(key==='service-link'){openService(room);return;}
      if(key==='claim-flash'){claimFlash(room);return;}
      if(key==='raise'){trackQueue(room,'hands',t('Muốn phát biểu','Wants to speak'));return;}
      if(key==='wheel'||key==='wheel-wallet'){stopAllMedia();closeDialog();route('wheel',{wheelTab:'wallet'});return;}
      if(key==='highlight'){
        const highlight=room.highlights?.[Number(value)];if(highlight&&host){openPanel('trim',room);const form=$('editor').querySelector('[data-live-po-form=trim]');form.elements.from.value=highlight.from;form.elements.to.value=highlight.to;}return;
      }
      if(key==='download'){
        if(room.status!=='ended'||canOpenReplay(room))await download(await recordingBlob(room),'livestream-recording.mp4');
        return;
      }
      if(key==='seek'){const video=$('editor').querySelector('[data-live-replay]');if(video){video.currentTime=Number(value);await video.play();}return;}
      if(key==='invite'&&dialogPanel==='contacts'){
        if(shared.notify(t('Lời mời xem live','Livestream invitation'),'live',{liveId:room.id,liveOwner:room.ownerId,liveView:'viewer'},value))feedback(t('Đã gửi lời mời mẫu.','Demo invitation saved.'));
        return;
      }
      if(!host)return;
      if(key==='wheel-open'){patch(room,{wheelOpen:!room.wheelOpen},'wheel');return;}
      if(key==='export-leads'){
        const cell=value=>'"'+String(value??'').replace(/^[=+@-]/,"'").replace(/"/g,'""')+'"';
        const csv=[['Name','Request','Status'],...(room.leads||[]).map(row=>[row.name,newsText(row.text),row.status||'lead'])].map(row=>row.map(cell).join(',')).join('\r\n');await download(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),'livestream-leads.csv');return;
      }
      if(key==='save-itinerary'){const before=structuredClone(state.savedLiveItineraries||[]);state.savedLiveItineraries||=[];if(!state.savedLiveItineraries.some(row=>row.roomId===room.id))state.savedLiveItineraries.push({roomId:room.id,title:roomName(room),places:structuredClone(room.places||[room.place].filter(Boolean)),savedAt:new Date().toISOString()});if(!save()){state.savedLiveItineraries=before;return;}openPanel('replay',room);return;}
      if(key==='change-cover'){const details=$('editor').querySelector('.lv-recording-files');if(details){details.open=true;details.querySelector('[name=cover]').click();}return;}
      if(key==='followup-leads'){
        showDialog(t('Nhắn tin chăm sóc','Follow up'),card(head(t('Danh sách khách của buổi live','Livestream leads'))+(room.leads||[]).map(row=>rowMarkup(row)).join('')),'followup',room.id);return;
      }
      if(key==='lead-message'){closeDialog();route('connect',{peer:value,recipient:value});return;}
      if(key==='queue-invite'){
        const item=room.hands?.find(row=>row.id===value);if(item)patch(room,{hands:room.hands.filter(row=>row.id!==value),guests:[...(room.guests||[]).filter(row=>row.name!==item.name),{name:item.name,accepted:false,muted:false}]},'guest');return;
      }
      if(key==='mute'){patch(room,{muted:!room.muted});return;}
      if(key==='switch-camera'){cameraFacing=cameraFacing==='user'?'environment':'user';await preview();return;}
      if(key==='beauty'){patch(room,{beauty:!room.beauty});return;}
      if(key==='end'){endRoom(room);return;}
      if(key==='toggle-qr'){patch(room,{oneqr:!room.oneqr},'oneqr');return;}
      if(key==='pin-service'){if(servicesFor(room).some(item=>item.id===value))patch(room,{serviceId:room.serviceId===value?'':value},dialogPanel);return;}
      if(key==='pin-deal'){if(dealsFor(room).some(item=>item.id===value))patch(room,{dealId:room.dealId===value?'':value},dialogPanel);return;}
      if(key==='pin-comment'){patch(room,{pinnedComment:room.pinnedComment===value?'':value});return;}
      if(key==='answer-next'){const questions=room.questions||[];if(questions.length){const index=questions.findIndex(item=>item.id===room.answering);patch(room,{answering:questions[(index+1)%questions.length].id},'qa');}return;}
      if(key==='answer'){patch(room,{answering:room.answering===value?'':value},'qa');return;}
      if(key==='toggle-pip'){
        if(room.pip){pipStream?.getTracks().forEach(track=>track.stop());pipStream=null;}
        if(patch(room,{pip:!room.pip},'pip')&&!room.pip)await preview(true);return;
      }
      if(key==='toggle-draw'){closeDialog();patch(room,{drawing:!room.drawing});return;}
      if(key==='toggle-music'){patch(room,{music:!room.music},'music');return;}
      if(key==='record'){startRecording(room);return;}
      if(key==='song-next'||key==='song-rank'){const song=(room.songs||[]).find(item=>item.id===value);if(song){const rest=room.songs.filter(item=>item.id!==value);patch(room,{songs:key==='song-next'?rest:[song,...rest],...(key==='song-next'?{currentSong:song}: {})},dialogPanel==='songs'?'songs':'');}return;}
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
    if(current==='live')state.lang=liveBase();
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
  // The shell forwards locale changes to this native module's event target.
  window.addEventListener('nexora-community-locale',()=>{
    if(current!=='live')return;
    const editor=$('editor'),panel=editor.open?dialogPanel:'',room=getRoom(dialogRoom),form=editor.open?editor.querySelector('form'):null;
    const values=form?[...form.elements].filter(field=>field.name&&field.type!=='file').map(field=>({name:field.name,type:field.type,value:field.value,checked:field.checked})):[];
    readSetup();state.lang=liveBase();render();
    if(panel==='setup')setupPage();else if(panel==='purpose')purposePage();else if(panel==='schedule')schedulePage(room);else if(panel==='academy')academyPanel();else if(panel&&room)openPanel(panel,room);
    const next=editor.querySelector('form'),used={};
    if(next)for(const item of values){const fields=[...next.elements].filter(field=>field.name===item.name),index=used[item.name]||0,field=fields[index];used[item.name]=index+1;if(!field)continue;if(item.type==='checkbox'||item.type==='radio')field.checked=item.checked;else field.value=item.value;}
  });
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
