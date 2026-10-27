/* Local-only VLINKPAY campaign demo. No merchant API or reward delivery. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NEXORA_VLINKPAY_CAMPAIGNS=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const STORAGE_KEY='nexora:vlinkpay:campaigns:v1';
  const COUNTS=[2,3,4,5,6,7,8,10,12,14,16];
  const TEMPLATES=['Template 3','Template 1','Template 2','Template 4','Treasure Spin'];
  const PALETTES=[['#0fa7dd','#1ac4a4','#7e45d8','#ee57a5','#f59c38','#e74b64','#44a5ed','#6a70dc'],['#2da4d0','#2bc67f','#fdc435','#e35d6a','#8e5de8','#27beb8','#ee8851','#417bdd'],['#f4b122','#c23b38','#e89635','#b3233b','#e4bb62','#b83532','#f7d474','#bf4740'],['#39b8ad','#328bd4','#8f65cd','#df68a3','#edaa39','#ec6855','#42a78b','#9ebc3c'],['#e7b747','#287b4e','#d4a437','#1c6749','#f4cc65','#388556','#e4b345','#16563e']];
  const clone=value=>JSON.parse(JSON.stringify(value));
  const iso=date=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  const displayDate=value=>{if(!value)return '-';const date=new Date(String(value).slice(0,10)+'T12:00:00');return Number.isNaN(date.getTime())?'-':new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(date);};
  function equalize(prizes){const portion=Math.floor(10000/prizes.length);return prizes.map((prize,index)=>({...prize,percent:(portion+(index<10000%prizes.length?1:0))/100}));}
  function blankPrize(index){return {id:'prize-'+(index+1),name:'',quantity:10,percent:0,textColor:'#ffffff',noPrize:false,image:'',imageName:''};}
  function resize(prizes,count,reservedIds=[]){count=Math.max(2,Math.min(16,Math.round(Number(count)||8)));const used=new Set([...prizes.slice(0,count).map(prize=>prize.id),...reservedIds]);return equalize(Array.from({length:count},(_,index)=>{if(prizes[index])return clone(prizes[index]);const prize=blankPrize(index);let suffix=index+1;while(used.has(prize.id))prize.id='prize-'+(++suffix);used.add(prize.id);return prize;}));}
  function create(){return {id:'',name:'',status:'Active',template:0,random:false,prizes:resize([],8),timeRange:false,start:'',end:'',spinCredit:false,requirement:'none',centerMode:'logo',centerText:'',centerLogo:'',centerLogoName:'',centerColor:'#ffee58',spins:0,winners:[]};}
  function normalize(value){
    const base=create(),source=value&&typeof value==='object'?value:{},count=Array.isArray(source.prizes)?Math.max(2,Math.min(16,source.prizes.length)):8;
    const result={...base,...source};result.name=String(source.name||'').slice(0,100);result.id=String(source.id||'');result.status=source.status==='Inactive'?'Inactive':'Active';result.template=Math.max(0,Math.min(4,Math.floor(Number(source.template)||0)));result.requirement=['none','join','claim'].includes(source.requirement)?source.requirement:'none';result.centerColor=/^#[\da-f]{6}$/i.test(source.centerColor||'')?source.centerColor:base.centerColor;
    result.prizes=Array.from({length:count},(_,index)=>{const prize=source.prizes?.[index]||blankPrize(index);return {...blankPrize(index),...prize,name:String(prize.name||'').slice(0,64),quantity:Math.max(0,Math.floor(Number(prize.quantity)||0)),percent:Math.max(0,Math.min(100,Number(prize.percent)||0)),textColor:/^#[\da-f]{6}$/i.test(prize.textColor||'')?prize.textColor:'#ffffff',image:/^data:image\/(png|jpeg|webp|gif);base64,/i.test(prize.image||'')?prize.image:''};});
    const usedPrizeIds=new Set();result.prizes.forEach((prize,index)=>{let id=String(prize.id||'prize-'+(index+1)),suffix=index+1;while(usedPrizeIds.has(id))id='prize-'+(++suffix);prize.id=id;usedPrizeIds.add(id);});
    result.centerLogo=/^data:(image\/(png|jpeg|webp|gif)|application\/pdf);base64,/i.test(source.centerLogo||'')?source.centerLogo:'';
    result.spins=Math.max(0,Math.floor(Number(source.spins)||0));result.winners=Array.isArray(source.winners)?source.winners.filter(row=>row&&typeof row==='object'):[];
    result.start=/^\d{4}-\d{2}-\d{2}$/.test(source.start||'')?source.start:'';result.end=/^\d{4}-\d{2}-\d{2}$/.test(source.end||'')?source.end:'';
    return result;
  }
  function seed(){const first=create(),second=create();first.id='DEMO-CAMPAIGN-001';first.name='Campaign 1';first.prizes.forEach((prize,index)=>{prize.name='Prize '+(index+1);});first.prizes[7].name='No Prize';first.prizes[7].noPrize=true;second.id='DEMO-CAMPAIGN-002';second.name='Summer 2025';second.status='Inactive';second.template=3;second.timeRange=true;second.start='2025-06-01';second.end='2025-08-31';second.prizes=resize([],4).map((prize,index)=>({...prize,name:'Prize '+(index+1)}));return [first,second];}
  function load(storage){try{const raw=storage.getItem(STORAGE_KEY);if(!raw)return seed();const rows=JSON.parse(raw);return Array.isArray(rows)?rows.map(normalize).filter(row=>row.id):seed();}catch(_){return seed();}}
  function save(storage,rows){storage.setItem(STORAGE_KEY,JSON.stringify(rows.map(normalize)));}
  function filter(rows,query,status){const text=String(query||'').trim().toLowerCase();return rows.filter(row=>(!text||(row.id+' '+row.name).toLowerCase().includes(text))&&(status==='all'||row.status===status));}
  function paginate(rows,page,size){size=[5,10,20,25,50,100].includes(Number(size))?Number(size):10;const pages=Math.max(1,Math.ceil(rows.length/size));page=Math.max(1,Math.min(pages,Math.floor(Number(page)||1)));return {rows:rows.slice((page-1)*size,page*size),page,pages,size,total:rows.length};}
  function validPercent(campaign){return campaign.random||Math.abs(campaign.prizes.reduce((sum,prize)=>sum+Number(prize.percent||0),0)-100)<0.011;}
  function canSpin(campaign,today=iso(new Date())){return !!campaign&&campaign.status==='Active'&&(!campaign.timeRange||(!campaign.start||today>=campaign.start)&&(!campaign.end||today<=campaign.end))&&campaign.prizes.some(prize=>(prize.noPrize||prize.quantity>0)&&(campaign.random||prize.percent>0));}
  function choosePrize(campaign,random=Math.random){
    const available=campaign.prizes.map((prize,index)=>({prize,index,weight:campaign.random?1:Number(prize.percent)||0})).filter(entry=>(entry.prize.noPrize||entry.prize.quantity>0)&&entry.weight>0);
    const total=available.reduce((sum,entry)=>sum+entry.weight,0);if(!total)return null;let target=Math.max(0,Math.min(0.999999999,random()))*total;
    for(const entry of available){target-=entry.weight;if(target<0)return entry.index;}return available[available.length-1].index;
  }
  function spin(campaign,random=Math.random,now=new Date(),contact=''){
    if(!canSpin(campaign,iso(now)))return null;const index=choosePrize(campaign,random);if(index===null)return null;
    const result=clone(campaign),prize=result.prizes[index];result.spins++;
    let winner=null;if(!prize.noPrize){prize.quantity--;winner={id:'DEMO-'+String(result.spins).padStart(5,'0'),date:now.toISOString(),prize:prize.name||'Prize '+(index+1),phone:contact.includes('@')?'':contact,email:contact.includes('@')?contact:'',status:'Pending'};result.winners.unshift(winner);}
    return {campaign:result,index,prize:clone(prize),winner};
  }
  const CONFIG_FIELDS=['name','status','template','random','timeRange','start','end','spinCredit','requirement','centerMode','centerText','centerLogo','centerLogoName','centerColor'];
  const PRIZE_FIELDS=['name','percent','textColor','noPrize','image','imageName'];
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  // Apply only the editor's changes; spins, winners and consumed inventory come from current storage.
  function mergeConfiguration(current,edited,base){
    if(!current||!base||current.id!==base.id)return null;
    const latest=normalize(current),desired=normalize(edited),original=normalize(base),merged=clone(latest);
    for(const field of CONFIG_FIELDS){if(same(desired[field],original[field]))continue;if(!same(latest[field],original[field])&&!same(latest[field],desired[field]))return null;merged[field]=desired[field];}
    const originalIds=original.prizes.map(prize=>prize.id),desiredIds=desired.prizes.map(prize=>prize.id),latestIds=latest.prizes.map(prize=>prize.id),structureChanged=!same(originalIds,desiredIds);
    if(structureChanged&&!same(originalIds,latestIds))return null;
    const bases=new Map(original.prizes.map(prize=>[prize.id,prize])),latestById=new Map(latest.prizes.map(prize=>[prize.id,prize]));
    if(structureChanged){for(const prize of original.prizes){if(desiredIds.includes(prize.id))continue;const now=latestById.get(prize.id);if(now&&PRIZE_FIELDS.some(field=>!same(now[field],prize[field])))return null;}}
    const edits=new Map(desired.prizes.map(prize=>[prize.id,prize]));
    const targets=structureChanged?desired.prizes:latest.prizes;
    merged.prizes=[];
    for(const prize of targets){
      const before=bases.get(prize.id),change=edits.get(prize.id),now=latestById.get(prize.id);
      if(!before){merged.prizes.push(clone(now||change||prize));continue;}
      if(!now){if(change&&(['quantity',...PRIZE_FIELDS].some(field=>!same(change[field],before[field]))))return null;continue;}
      if(!change){merged.prizes.push(clone(now));continue;}
      const next=clone(now);
      for(const field of PRIZE_FIELDS){if(same(change[field],before[field]))continue;if(!same(now[field],before[field])&&!same(now[field],change[field]))return null;next[field]=change[field];}
      // Editing Quantity adjusts remaining stock by the requested delta, retaining spins already consumed.
      next.quantity=Math.max(0,now.quantity+(change.quantity-before.quantity));merged.prizes.push(next);
    }
    for(const before of original.prizes){if(!latestById.has(before.id)){const change=edits.get(before.id);if(change&&(['quantity',...PRIZE_FIELDS].some(field=>!same(change[field],before[field]))))return null;}}
    return validPercent(merged)?merged:null;
  }
  return {STORAGE_KEY,COUNTS,TEMPLATES,PALETTES,clone,iso,displayDate,equalize,resize,create,normalize,seed,load,save,filter,paginate,validPercent,canSpin,choosePrize,spin,mergeConfiguration};
});
