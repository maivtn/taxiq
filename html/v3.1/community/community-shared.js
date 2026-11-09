/* Local prototype identity, point ledger and notifications shared by every Community region. */
(() => {
  'use strict';
  const KEY='nexora-v31:community-shared-v31', DAY=86400000;
  const empty=()=>({version:1,identities:{},wallets:{},notifications:[],meetings:[],recordings:[],spins:{},claims:[]});
  const copy=value=>JSON.parse(JSON.stringify(value));
  function read(){try{return {...empty(),...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{return empty();}}
  function change(operation){const data=read(),result=operation(data);if(result===false)return false;try{localStorage.setItem(KEY,JSON.stringify(data));window.dispatchEvent(new CustomEvent('nexora-community-shared-changed'));return result===undefined?true:result;}catch{return false;}}
  const query=new URLSearchParams(location.search);
  const role=window.NEXORA_SHELL?.activePage==='staff'||['staff','tech'].includes(query.get('role'))||query.get('account')==='personal'?'staff':'owner';
  const businessFeatures=new Set(['shop','transfer','workers','services','hiring','posRecruitment']);
  // Storefront and salon tools belong to the Salon demo account.
  const canAccessFeature=feature=>!businessFeatures.has(feature)||role==='owner';
  const member=query.get('member')||window.NEXORA_SHELL?.profileName||(role==='staff'?document.querySelector('.staff-profile-name')?.textContent.trim():null)||(role==='staff'?'David Le':'BITCOIN NAIL BAR');
  function identity(name=member,alias){
    let legacyId;try{legacyId=JSON.parse(localStorage.getItem('nexora-connect-workflow-v1')||'{}').profiles?.[name]?.id;}catch{}
    const aliases=[...new Set([legacyId,alias].filter(Boolean))];
    let found=read().identities[name];if(found&&name===member&&!found.kind){change(data=>{data.identities[name].kind=role==='owner'?'business':'personal';});found=read().identities[name];}if(found&&name==='BITCOIN NAIL BAR'&&!found.v2DemoRestored){change(data=>{Object.assign(data.identities[name],{verified:true,v2DemoRestored:true});});found=read().identities[name];}if(found){if(aliases.some(id=>id!==found.id&&!found.legacyIds?.includes(id))){change(data=>{const row=data.identities[name];row.legacyIds=[...new Set([...(row.legacyIds||[]),...aliases])].filter(id=>id!==row.id);});found=read().identities[name];}return copy(found);}
    const saved=change(data=>{
      let hash=2166136261;for(const char of name.normalize('NFC'))hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
      let suffix=hash.toString(36).toUpperCase().padStart(8,'0');
      while(Object.values(data.identities).some(row=>row.id==='NX-'+suffix.slice(0,4)+'-'+suffix.slice(4)))suffix=((parseInt(suffix,36)+1)%2821109907456).toString(36).toUpperCase().padStart(8,'0');
      const row={id:'NX-'+suffix.slice(0,4)+'-'+suffix.slice(4),name,nickname:name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'.').replace(/^\.+|\.+$/g,'').slice(0,20),verified:name==='BITCOIN NAIL BAR',...(name===member?{kind:role==='owner'?'business':'personal'}:{}),v2DemoRestored:name==='BITCOIN NAIL BAR'};
      row.legacyIds=aliases.filter(id=>id!==row.id);data.identities[name]=row;return copy(row);
    });
    return saved||{id:'',name,nickname:'',verified:false};
  }
  const wallet=(name=member)=>copy(read().wallets[identity(name).id]||{balance:0,ledger:[]});
  function points(amount,reason,reference,name=member){
    const id=identity(name).id;if(!id||!Number.isInteger(amount)||amount===0)return false;
    return change(data=>{const account=data.wallets[id]||={balance:0,ledger:[]};if(account.ledger.some(row=>row.reference===reference)||reason!=='activity:removed'&&account.balance+amount<0)return false;account.balance+=amount;account.ledger.unshift({id:crypto.randomUUID(),time:new Date().toISOString(),amount,reason,reference,balance:account.balance});return true;});
  }
  function activity(kind,reference,name=member){
    const account=wallet(name),today=new Date().toISOString().slice(0,10),rows=account.ledger.filter(row=>row.time.startsWith(today)&&row.reason.startsWith('activity:')&&row.amount>0);
    const rules={post:[20,2],comment:[5,5],engagement:[30,Number.MAX_SAFE_INTEGER]},rule=rules[kind];if(!rule)return false;
    if(rows.filter(row=>row.reason==='activity:'+kind).length>=rule[1]||rows.reduce((sum,row)=>sum+row.amount,0)+rule[0]>100)return false;
    return points(rule[0],'activity:'+kind,'activity:'+kind+':'+reference,name);
  }
  function revoke(reference,name=member){const original=wallet(name).ledger.filter(row=>row.reference.endsWith(':'+reference)&&row.amount>0);for(const row of original){points(-row.amount,'activity:removed','revoke:'+row.id,name);}}
  function notify(title,route,context={},recipient=member){return change(data=>{data.notifications.unshift({id:crypto.randomUUID(),recipient,title,route,context,read:false,time:new Date().toISOString()});data.notifications=data.notifications.slice(0,200);});}
  function friendRemoved(name,peer,data=read()){return (data.friendRemovals||[]).some(row=>row.from===name&&row.to===peer||row.from===peer&&row.to===name);}
  function friendNames(name=member){
    const data=read(),names=new Set();
    for(const row of data.friendRequests||[])if(row.status==='accepted'&&(row.from===name||row.to===name))names.add(row.from===name?row.to:row.from);
    try{const key='nexora-connect-preview-v2'+(name==='BITCOIN NAIL BAR'?'':':'+encodeURIComponent(name)),stored=JSON.parse(localStorage.getItem(key)||'{}');for(const peer of Object.values(data.identities))if((stored.connections||[]).some(id=>id===peer.id||peer.legacyIds?.includes(id)))names.add(peer.name);}catch{}
    return [...names].filter(peer=>peer!==name&&!friendRemoved(name,peer,data));
  }
  function connectedPeople(name=member){const data=read(),names=new Set(friendNames(name));for(const row of data.customerContacts||[])if(row.customer===name&&(row.savedContact===true||row.isCustomer===true))names.add(row.business);return [...names];}
  function customerContact(customer,business,field){if(!customer||!business||customer===business)return false;identity(customer);identity(business);return change(data=>{data.customerContacts||=[];let row=data.customerContacts.find(row=>row.customer===customer&&row.business===business);if(!row){row={customer,business};data.customerContacts.push(row);}row[field]=true;data.identities[business].kind='business';});}
  const me=()=>identity(member);

  window.NEXORA_COMMUNITY_SHARED={KEY,DAY,read,change,copy,member,role,canAccessFeature,identity,me,friendNames,friendRemoved,connectedPeople,saveBusinessContact:(customer,business)=>customerContact(customer,business,'savedContact'),registerCustomer:(customer,business)=>customerContact(customer,business,'isCustomer'),wallet,points,activity,revoke,notify};
  window.addEventListener('storage',event=>{if(event.key===KEY)window.dispatchEvent(new CustomEvent('nexora-community-shared-changed'));});
  identity();
})();
