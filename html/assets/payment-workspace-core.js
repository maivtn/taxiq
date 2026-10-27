/* Local payment draft rules, shared by the UI and its regression tests. */
(function (scope) {
  'use strict';
  var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MAX_IMAGE_BYTES=5*1024*1024;
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function parseDate(value) {
    if(typeof value!=='string')return null;
    var text=value.trim(),parts=/^(\d{4})-(\d{2})-(\d{2})$/.exec(text),year,month,day;
    if(parts){year=Number(parts[1]);month=Number(parts[2]);day=Number(parts[3]);}
    else{
      parts=/^([A-Za-z]{3}) (\d{1,2}), (\d{4})$/.exec(text);if(!parts)return null;
      month=months.findIndex(function(m){return m.toLowerCase()===parts[1].toLowerCase();})+1;day=Number(parts[2]);year=Number(parts[3]);
    }
    if(year<1000||year>9999||month<1||month>12||day<1)return null;
    var leap=year%4===0&&(year%100!==0||year%400===0),days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
    if(day>days[month-1])return null;
    return String(year)+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0');
  }
  function formatDate(value) {
    var iso=parseDate(value);if(!iso)return '—';
    return months[Number(iso.slice(5,7))-1]+' '+Number(iso.slice(8,10))+', '+iso.slice(0,4);
  }
  function period(start,end) {
    var from=parseDate(start),to=parseDate(end);
    return from&&to&&from<=to?{start:from,end:to}:null;
  }
  function payoutPeriod(record) {
    var result=period(record.periodStart,record.periodEnd);
    if(!result&&typeof record.period==='string'){
      var old=record.period.split(/\s+[–—]\s+/);if(old.length===2)result=period(old[0],old[1]);
    }
    return result?formatDate(result.start)+' – '+formatDate(result.end):'—';
  }
  function persist(current,mutate,storage,key) {
    var next=clone(current);mutate(next);
    storage.setItem(key,JSON.stringify(next));
    return next;
  }
  function categoryFor(state,id) {
    var tag=state.categoryTags[id];return state.categories.includes(tag)?tag:'Uncategorized';
  }
  function renameCategory(state,index,name) {
    var previous=state.categories[index];if(previous===undefined)return;
    state.categories[index]=name;
    state.categories=state.categories.filter(function(c,i,list){return c!=='Uncategorized'&&list.indexOf(c)===i;});
    Object.keys(state.categoryTags).forEach(function(id){if(state.categoryTags[id]===previous)state.categoryTags[id]=name;});
  }
  function deleteCategory(state,index) {
    var removed=state.categories[index];if(removed===undefined)return;
    state.categories.splice(index,1);
    Object.keys(state.categoryTags).forEach(function(id){if(state.categoryTags[id]===removed)state.categoryTags[id]='Uncategorized';});
  }
  function categoryTotals(state,records,range) {
    var totals=new Map([['Uncategorized',0]]);
    records.forEach(function(record){
      var date=parseDate(record.date);if(!date)return;
      if(range==='Week'&&(date<'2026-10-21'||date>'2026-10-27')||range==='Month'&&!date.startsWith('2026-10')||range==='Year'&&!date.startsWith('2026'))return;
      var amount=Number(record.amount);if(!Number.isFinite(amount))return;
      var name=categoryFor(state,record.id);totals.set(name,(totals.get(name)||0)+amount);
    });
    return Array.from(totals,function(row){return {name:row[0],amount:Math.round(row[1]*100)/100};});
  }
  function uploadError(code) { var error=new Error(code);error.code=code;return error; }
  function validateUploads(files,currentCount,maxCount) {
    var list=Array.from(files);
    if(currentCount+list.length>maxCount)throw uploadError('count');
    list.forEach(function(file){
      if(!/^image\//i.test(file.type||''))throw uploadError('type');
      if(!Number.isFinite(file.size)||file.size<=0||file.size>=MAX_IMAGE_BYTES)throw uploadError('size');
    });
    return list;
  }
  async function prepareUploads(files,currentCount,maxCount,processImage) {
    var list=validateUploads(files,currentCount,maxCount);
    return Promise.all(list.map(async function(file){
      var dataUrl=await processImage(file);
      if(typeof dataUrl!=='string'||!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl))throw uploadError('type');
      return {name:file.name,type:dataUrl.slice(5,dataUrl.indexOf(';')),size:file.size,dataUrl:dataUrl};
    }));
  }
  var api={parseDate:parseDate,formatDate:formatDate,period:period,payoutPeriod:payoutPeriod,persist:persist,categoryFor:categoryFor,renameCategory:renameCategory,deleteCategory:deleteCategory,categoryTotals:categoryTotals,validateUploads:validateUploads,prepareUploads:prepareUploads,MAX_IMAGE_BYTES:MAX_IMAGE_BYTES};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else scope.NEXORA_PAYMENT_MODEL=api;
})(typeof window==='undefined'?globalThis:window);
