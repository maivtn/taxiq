/* Fictional examples for Community and Jobs views that otherwise start empty. */
(() => {
  'use strict';
  const demo=window.NEXORA_COMMUNITY_DEMO;
  if(!demo||demo.coverageVersion===1)return;
  const {images,date,at}=demo;
  const sample=(id,values)=>({id,isSample:true,createdAt:at(1),status:'open',...values});
  const transfer=(id,values)=>sample(id,{kind:'transfer',transferType:'sell',industry:'nail',contact:values.owner,photos:[images.salon],...values});
  demo.extra.jobs.push(
    transfer('demo-transfer-bellaire',{owner:'BITCOIN NAIL BAR',title:'Bellaire nail studio with 8 manicure stations',businessName:'Bellaire Nail Studio (sample)',city:'Houston, TX',address:'Bellaire area, Houston, TX',price:125000,size:1600,stations:8,rent:'$3,200/month',included:'Manicure tables, pedicure chairs, reception furniture and polish racks',reason:'The sample owner is relocating.',description:'Sample listing: a furnished nail studio with 8 manicure and 6 pedicure stations. Arrange a walkthrough to review equipment, lease terms and the proposed handover.',photos:[images.salon,images.reception]}),
    transfer('demo-transfer-katy',{owner:'Lotus Nails',title:'Neighborhood nail salon near Katy shopping center',businessName:'Katy Nail Corner (sample)',city:'Katy, TX',address:'West Katy, TX',price:98000,size:1250,stations:6,rent:'$2,650/month',included:'Six workstations, four pedicure chairs and a reception desk',description:'Sample listing: a compact salon in a neighborhood shopping center. Equipment inventory and landlord approval are reviewed during the handover.',photos:[images.reception]}),
    transfer('demo-transfer-richardson',{owner:'Mây Beauty Studio',title:'Private beauty studio with 3 treatment rooms',businessName:'Richardson Beauty Room (sample)',industry:'hair',city:'Richardson, TX',price:76000,size:1100,stations:3,rent:'$2,100/month',included:'Treatment beds, storage and reception furniture',description:'Sample listing for a beauty studio with separate treatment rooms. Discuss the space, equipment condition and lease arrangements in person.',photos:[images.spa]}),
    transfer('demo-transfer-austin-cafe',{owner:'Garden Cafe',title:'Small Austin cafe with a ready-to-use counter',businessName:'Morning Corner Cafe (sample)',industry:'restaurant',city:'Austin, TX',price:165000,size:1800,stations:22,rent:'$3,900/month',included:'Counter, display cabinet, tables and chairs',description:'Sample listing: a small cafe with seating and a prepared service counter. A viewing is available to review the equipment list and proposed transfer terms.',photos:[images.cafe]}),
    transfer('demo-transfer-dallas-supply',{owner:'Studio Supply Dallas',title:'Salon supply shop with shelving and stockroom',businessName:'Dallas Studio Supply (sample)',industry:'retail',city:'Dallas, TX',price:89000,size:1450,stations:2,rent:'$2,800/month',included:'Display shelving, checkout counter and stockroom racks',description:'Sample listing for a salon supply shop. Inventory can be discussed separately after checking the item list and condition.',photos:[images.retail]}),
    transfer('demo-transfer-buy-david',{owner:'David Le',transferType:'buy',title:'Looking for a small nail salon in Houston',businessName:'Nail salon purchase enquiry (sample)',city:'Houston, TX',price:110000,size:1200,stations:6,description:'Sample buying interest: looking for a nail salon with 4–6 stations around Bellaire or Westchase. Please share the size, asking price and viewing availability.',photos:[images.blue]}),
    transfer('demo-transfer-buy-dallas',{owner:'Thảo Lê',transferType:'buy',title:'Looking to buy a 4-station salon in Dallas',city:'Dallas, TX',price:80000,stations:4,description:'Sample buying interest: a small salon near Garland or Richardson. Prefer an existing fit-out and a clear equipment inventory.',photos:[images.blush]}),
    transfer('demo-transfer-buy-austin',{owner:'An Phạm',transferType:'buy',industry:'restaurant',title:'Looking for an Austin coffee kiosk or compact cafe',city:'Austin, TX',price:95000,description:'Sample buying interest: a small coffee business with a service counter and manageable seating area. Please send the area and proposed transfer terms.',photos:[images.cafe]}),
    transfer('demo-transfer-closed',{owner:'BITCOIN NAIL BAR',title:'Archived sample: compact nail studio transfer',city:'Houston, TX',price:65000,status:'closed',description:'This closed sample remains in My posts so the reopen and management actions can be reviewed.',photos:[images.workshop]}),
    ...[
      ['demo-service-electrical','BITCOIN NAIL BAR','Check lighting at 4 manicure stations','electrical','Houston, TX',480,images.salon,'Sample request: check flickering task lights and discuss replacement options before work starts.'],
      ['demo-service-plumbing','Lotus Nails','Inspect a slow-draining salon sink','plumbing','Katy, TX',350,images.reception,'Sample request: inspect a sink drain and provide an estimate for the work and materials.'],
      ['demo-service-cleaning','Mây Beauty Studio','Deep clean 3 treatment rooms after closing','cleaning','Richardson, TX',240,images.spa,'Sample request: clean treatment rooms, floors and reception after the last appointment.'],
      ['demo-service-construction','Garden Cafe','Build a compact storage shelf behind the counter','construction','Austin, TX',600,images.cafe,'Sample request: measure the counter area and propose a storage shelf that keeps the walkway clear.']
    ].map(([id,owner,title,serviceType,city,price,image,description],index)=>sample(id,{kind:'service-request',owner,title,serviceType,city,price,description,preferredTime:date(index+2)+'T18:30',contact:owner,photos:[image]})),
    ...[
      ['demo-offer-david','David Le','Weekend salon cleaning and workstation reset','cleaning','Houston, TX',140,images.workshop,'Sample service offer: help reset stations, organize supplies and clean shared salon areas after closing.'],
      ['demo-offer-alex','Alex Tran','Lighting and outlet checks for small businesses','electrical','Houston, TX',180,images.retail,'Sample service offer: arrange an initial visit to inspect the requested work and discuss a written estimate.'],
      ['demo-offer-kevin','Kevin Tran','Sink and water-line inspection appointments','plumbing','Dallas, TX',150,images.reception,'Sample service offer: inspect accessible fixtures and discuss the scope before agreeing to repairs.'],
      ['demo-offer-tina','Tina Pham','Evening cleaning for salons and beauty studios','cleaning','Richardson, TX',160,images.spa,'Sample service offer: recurring evening cleaning with a checklist agreed before the first visit.']
    ].map(([id,owner,title,serviceType,city,price,image,description])=>sample(id,{kind:'service-offer',owner,title,serviceType,city,price,description,schedule:'flexible',contact:owner,photos:[image]})),
    ...[
      ['demo-seeking-alex','Alex Tran','Electrician seeking scheduled small-business work','Electrician','Electrical, Lighting, Maintenance','Houston, TX',images.retail],
      ['demo-seeking-tina','Tina Pham','Cleaning technician available for evening salon work','Cleaning technician','Cleaning, Salon cleaning, Supplies','Richardson, TX',images.spa]
    ].map(([id,owner,title,role,skills,city,image])=>sample(id,{kind:'seeking',owner,title,role,skills,city,industry:'Trades & services',pay:'25',period:'Mỗi giờ',schedule:'Flexible appointments',workTypes:['PartTime'],description:'Sample profile: available for an introductory conversation to review the requested work, location and schedule.',photos:[image],availability:date(2)})),
    ...[['draft','Draft: weekday nail appointments in Houston'],['paused','Paused: weekend acrylic support'],['closed','Closed: short-term salon cover']].map(([status,title])=>sample('demo-david-seeking-'+status,{kind:'seeking',owner:'David Le',industry:'Nail & làm đẹp',role:'Thợ nail',title,status,skills:'Acrylic, Dipping, Pedicure, Gel-X',city:'Houston, TX',pay:'24',period:'Mỗi giờ',schedule:'Discuss available dates',description:'Sample personal listing for reviewing the '+status+' state in My posts.',photos:[images.blue]}))
  );

  demo.extra.feed.push(
    sample('demo-feed-transfer-question',{kind:'question',owner:'David Le',title:'What should I prepare before viewing a small nail salon?',location:'Houston, TX',details:'I am comparing a few sample salons around Bellaire. Which equipment and lease questions would you put on a viewing checklist?',resolved:false,destinations:{includeMainFeed:true,groupIds:['group-salon-owners']},likeCount:7}),
    sample('demo-feed-service-checklist',{kind:'tip',owner:'Alex Tran',title:'Send clear photos before arranging a lighting inspection',location:'Houston, TX',steps:'Photograph the light, the whole station and the label on the existing fitting. Note when the flicker started and arrange a suitable time to inspect the area.',photo:images.workshop,destinations:{includeMainFeed:true,groupIds:['group-supply']},likeCount:11}),
    sample('demo-feed-cleaning-poll',{kind:'poll',owner:'Tina Pham',title:'Which time works better for a salon deep clean?',location:'Dallas, TX',optionA:'After the last appointment',optionB:'Before opening',duration:'7 ngày',votesA:18,votesB:9,destinations:{includeMainFeed:true,groupIds:['group-salon-owners']},likeCount:5}),
    sample('demo-feed-portfolio-event',{kind:'event',owner:'Learn Gel-X & Nail Art',title:'Sample portfolio and job-profile review meetup',format:'Trực tiếp',date:date(5),city:'Houston, TX',details:'Bring three work photos and a short introduction. The sample group will review photo descriptions, skills and preferred schedules together.',destinations:{includeMainFeed:true,groupIds:['g2']},likeCount:12}),
    sample('demo-feed-coffee-handover',{kind:'general',owner:'Garden Cafe',title:'Our morning team now uses a short counter handover',location:'Austin, TX',description:'We note prepared supplies, items to restock and group bookings before the next shift arrives. A quick review together keeps the morning counter organized.',photo:images.cafe,destinations:{includeMainFeed:true,groupIds:['group-coffee']},likeCount:9}),
    sample('demo-feed-blue-portfolio',{kind:'showcase',owner:'David Le',title:'Adding a clean blue set to my sample portfolio',location:'Houston, TX',service:'Nail Art',description:'A short blue set photographed in natural light. I include the service and approximate appointment time when sharing work samples.',photo:images.blue,destinations:{includeMainFeed:true,groupIds:['group-new']},likeCount:14})
  );
  demo.extra.pagePosts.push(
    sample('demo-page-draft-weekend',{pageId:'p1',status:'draft',body:'Draft sample: weekend appointment times and services to review before publishing.',image:images.blush}),
    sample('demo-page-draft-team',{pageId:'p1',status:'draft',body:'Draft sample: introduce the afternoon team and confirm which photos can be published.',image:images.reception}),
    sample('demo-page-scheduled-blue',{pageId:'p1',status:'scheduled',body:'Scheduled sample: a blue nail design from this week, with service notes for clients.',image:images.blue,publishAt:new Date(date(2)+'T10:00:00').toISOString()}),
    sample('demo-page-scheduled-hours',{pageId:'p1',status:'scheduled',body:'Scheduled sample: a reminder to check available appointment times before visiting.',image:images.salon,publishAt:new Date(date(4)+'T09:00:00').toISOString()})
  );
  demo.connect.members.push(
    {name:'Alex Tran',id:'NX-2051',handle:'@alex.trades',detail:'chat-demo-alex'},
    {name:'Tina Pham',id:'NX-2052',handle:'@tina.cleaning',detail:'chat-demo-tina'},
    {name:'Kevin Tran',id:'NX-2053',handle:'@kevin.plumbing',detail:'chat-demo-kevin'}
  );
  demo.connect.chats.push(
    {id:'chat-demo-alex',recipient:'Alex Tran',reference:'Sample lighting inspection',messages:[{text:'Please send a photo of the task light and the fitting label.'},{text:'I will send the photos after the last appointment.',mine:true},{text:'Thank you. We can review the requested work before choosing a visit time.'}]},
    {id:'chat-demo-tina',recipient:'Tina Pham',reference:'Sample evening cleaning schedule',messages:[{text:'Which rooms should be included in the sample cleaning checklist?'},{text:'The reception area and three treatment rooms, after closing.',mine:true},{text:'I will prepare a draft checklist for us to review.'}]},
    {id:'chat-demo-kevin',recipient:'Kevin Tran',reference:'Sample sink inspection',messages:[{text:'Could you share the sink location and a short description of the drain issue?'},{text:'It is the handwashing sink near reception. I will send a photo.',mine:true},{text:'Thank you. We will discuss the inspection scope before booking a visit.'}]}
  );
  demo.connect.rooms.push(
    {id:'group-demo-service-planning',name:'Sample salon service planning',owner:'BITCOIN NAIL BAR',scope:'PrivateGroup',members:['BITCOIN NAIL BAR','David Le','Alex Tran','Tina Pham'],excluded:[],createdAt:at(2),messages:[{author:'BITCOIN NAIL BAR',text:'Let us list the station lighting and cleaning tasks before choosing a service time.'},{author:'Alex Tran',text:'Please add photos of the light fittings to the checklist.'},{author:'Tina Pham',text:'I can prepare the room cleaning checklist for review.'}]},
    {id:'group-demo-salon-viewings',name:'Sample salon viewing checklist',owner:'David Le',scope:'PrivateGroup',members:['David Le','BITCOIN NAIL BAR','Thảo Lê'],excluded:[],createdAt:at(1),messages:[{author:'David Le',text:'I am comparing the sample salon listings in Houston and Dallas.'},{author:'Thảo Lê',text:'I will note the stations, space and equipment included in each viewing.'},{author:'BITCOIN NAIL BAR',text:'Add lease questions and a handover checklist before arranging a viewing.'}]}
  );
  demo.feedDrafts=[
    {id:'demo-feed-draft-salon-update',owner:'BITCOIN NAIL BAR',kind:'general',isSample:true,draft:true,title:'Sample draft: an afternoon update from our salon',description:'Review the appointment times and service notes before publishing this sample update.',photos:[images.salon],imageRightsConfirmed:true,destinations:{includeMainFeed:true,groupIds:[]},createdAt:at(2),updatedAt:at(1)},
    {id:'demo-feed-draft-team-checklist',owner:'BITCOIN NAIL BAR',kind:'general',isSample:true,draft:true,title:'Sample draft: our team handover checklist',description:'Prepared stations, supplies to restock and appointment notes for the incoming team.',photos:[],destinations:{includeMainFeed:true,groupIds:['group-salon-owners']},createdAt:at(3),updatedAt:at(2)},
    {id:'demo-feed-draft-david-portfolio',owner:'David Le',kind:'general',isSample:true,draft:true,title:'Sample draft: a new photo for my portfolio',description:'Add the service, length and appointment time before sharing this work sample.',photos:[images.blue],imageRightsConfirmed:true,destinations:{includeMainFeed:true,groupIds:['g2']},createdAt:at(2),updatedAt:at(1)},
    {id:'demo-feed-draft-david-days',owner:'David Le',kind:'general',isSample:true,draft:true,title:'Sample draft: days I can help this month',description:'Check my available days and preferred areas before publishing this sample introduction.',photos:[],destinations:{includeMainFeed:true,groupIds:[]},createdAt:at(3),updatedAt:at(2)}
  ];
  demo.jobWorkflow={
    members:['BITCOIN NAIL BAR','David Le'],
    profiles:{'David Le':{exists:true,isSample:true,displayName:'David Le',basicSavedAt:at(4),cityName:'Houston',stateCode:'TX',experience:'FiveToTen',languages:['Vi','En'],bio:'Sample technician profile: acrylic, dipping and pedicure services, with weekday and weekend availability around Houston.',skills:['Acrylic','Dipping','Pedicure','Gel-X'],licenseType:'Studying',licenseStateCode:'TX',portfolioImageUrls:[images.blue,images.blush],jobTypes:['FullTime','PartTime','Weekend'],payTypes:['Salary','Negotiable'],expectedPay:'24',hidePhone:true,currentShopNames:[],completionPercent:85}},
    applications:[
      {id:'demo-personal-application-gel',postingId:'j1',applicantUserId:'David Le',status:'Submitted',note:'Sample application: available for a conversation about weekday appointments.',sharePhone:false,submittedAt:at(2)},
      {id:'demo-personal-application-reception',postingId:'job-lotus-reception',applicantUserId:'David Le',status:'Cancelled',note:'Sample cancelled application: the proposed hours no longer fit my schedule.',sharePhone:false,submittedAt:at(5),cancelledAt:at(3)}
    ],
    invites:[
      {id:'demo-invite-david-pending',from:'BITCOIN NAIL BAR',fromName:'BITCOIN NAIL BAR',to:'David Le',postingId:'j1',status:'pending',note:'Sample invitation: let us review your Gel-X portfolio and available days.',date:date(2),time:'10:30',createdAt:at(1)},
      {id:'demo-invite-david-accepted',from:'Lotus Nails',fromName:'Lotus Nails',to:'David Le',postingId:'job-lotus-reception',status:'accepted',note:'Sample accepted invitation for a short introductory conversation.',date:date(3),time:'14:00',createdAt:at(3),respondedAt:at(2)},
      {id:'demo-invite-david-declined',from:'Mây Beauty Studio',fromName:'Mây Beauty Studio',to:'David Le',postingId:'job-may-skincare',status:'declined',note:'Sample declined invitation: the required services do not fit my current skills.',date:date(4),time:'11:00',createdAt:at(4),respondedAt:at(3)},
      {id:'demo-invite-linh-pending',from:'BITCOIN NAIL BAR',fromName:'BITCOIN NAIL BAR',to:'Linh Nguyễn',postingId:'job-bitcoin-pedicure',status:'pending',note:'Sample invitation: please share your preferred days for an introductory meeting.',date:date(2),time:'15:00',createdAt:at(1)}
    ],
    availability:{'David Le':[
      {id:'demo-availability-monday',kind:'weekly',day:1,start:'09:00',end:'18:00',isSample:true},
      {id:'demo-availability-wednesday',kind:'weekly',day:3,start:'10:00',end:'18:00',isSample:true},
      {id:'demo-availability-saturday',kind:'weekly',day:6,start:'09:00',end:'17:00',isSample:true},
      {id:'demo-availability-once',kind:'once',date:date(2),day:new Date(date(2)+'T12:00:00').getDay(),start:'09:00',end:'15:00',isSample:true}
    ]},
    savedJobs:{'David Le':['j1','job-bitcoin-pedicure','job-lotus-reception']}
  };
  demo.coverageVersion=1;
})();
