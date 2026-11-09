/* One Community locale, using only the copy extracted from the PO package. */
(() => {
  'use strict';
  const data=window.NEXORA_COMMUNITY_LOCALES;
  if(!data)return;
  const key='nexora-community-language',valid=new Set(data.languages.map(row=>row[0]));
  const read=()=>{try{return localStorage.getItem(key);}catch{return null;}};
  let language=valid.has(read())?read():'en';
  const canonical=new Map(),englishKeys=new Map(),originalText=new WeakMap(),originalAttrs=new WeakMap();
  for(const dictionary of Object.values(data.translations))for(const [en,value]of Object.entries(dictionary)){
    canonical.set(en,en);englishKeys.set(en.toLowerCase(),en);if(value&&!canonical.has(value))canonical.set(value,en);
  }
  // Current controls that correspond to the same named PO navigation entries.
  const aliases={'Deal & Coupon':'Deals & Coupons','Deals & Coupon':'Deals & Coupons','Photo video':'Photo/video','Search...':'Search'};
  const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const patterns=data.patterns.map(row=>({...row,re:new RegExp('^'+escape(row.en).replace(/\\\{\\\{(\d+)\\\}\\\}/g,'(.+?)')+'$')}));
  function translate(value,locale=language){
    if(typeof value!=='string'||!value.trim())return value;
    const [,before,core,after]=value.match(/^(\s*)(.*?)(\s*)$/s);
    const en=aliases[core]||canonical.get(core)||englishKeys.get(core.toLowerCase())||core;
    const translated=locale==='en'?(canonical.get(core)||core):data.translations[locale]?.[en];
    if(translated)return before+translated+after;
    const plain=core.replace(/^[＋+✧☷◉◷✦⚡\s]+/u,'').replace(/[\s\u00a0]*[→⌄↔]+$/u,'').trim();
    if(plain&&plain!==core){const next=translate(plain,locale);if(next!==plain)return before+core.replace(plain,next)+after;}
    const decorated=core.match(/^([＋+✦✧◈♧▣▤⌕✎☎•…⋯]\s*)(.+)$/u);
    if(decorated){const next=translate(decorated[2],locale);if(next!==decorated[2])return before+decorated[1]+next+after;}
    const parts=core.split(/(\s*·\s*)/);
    if(parts.length>1){const next=parts.map(part=>part.trim()==='·'?part:translate(part,locale)).join('');if(next!==core)return before+next+after;}
    const counted=core.match(/^([\d,.]+(?:\/[\d,.]+)?)\s+([A-Za-z][A-Za-z ]+)$/);
    if(counted){const next=translate(counted[2],locale);if(next!==counted[2])return before+counted[1]+' '+next+after;}
    if(locale==='vi')for(const pattern of patterns){const match=en.match(pattern.re);if(match)return before+pattern.vi.replace(/\{\{(\d+)\}\}/g,(_,i)=>match[Number(i)+1]||'')+after;}
    return value;
  }
  const protectedSelector='[data-nexora-language-ui],[data-user-text],[data-community-authored],[contenteditable="true"],.chat-message-body,.community-post-body,.community-comment-text,.staff-profile-name,.profile-name,.profile-email,.community-feed-post-author,.story-name,.page-card h3';
  const attributes=['placeholder','title','aria-label','alt'];
  function text(node){
    if(node.parentElement?.closest(protectedSelector))return;
    const current=node.nodeValue,previous=originalText.get(node);
    const source=previous&&current===previous.output?previous.source:current;
    const output=translate(source);
    originalText.set(node,{source,output});
    if(current!==output)node.nodeValue=output;
  }
  function element(node){
    if(node.nodeType===Node.TEXT_NODE){text(node);return;}
    if(node.nodeType!==Node.ELEMENT_NODE||['SCRIPT','STYLE','SVG','TEMPLATE','CODE','PRE'].includes(node.tagName)||node.closest(protectedSelector))return;
    let saved=originalAttrs.get(node);if(!saved){saved={};originalAttrs.set(node,saved);}
    for(const attribute of attributes){
      const current=node.getAttribute(attribute);if(current===null)continue;
      const previous=saved[attribute],source=previous&&current===previous.output?previous.source:current,output=translate(source);
      saved[attribute]={source,output};if(current!==output)node.setAttribute(attribute,output);
    }
    if(node.tagName==='OPTION'&&!node.hasAttribute('value'))node.setAttribute('value',node.textContent);
    if(node.tagName==='TEXTAREA')return;
    for(const child of node.childNodes)element(child);
  }
  const pending=new Set(),frames=new Map();let scheduled=false,observer;
  const regionLanguages=new WeakMap();
  function syncRegions(){
    const base=language==='vi'?'vi':'en';
    document.querySelectorAll('[data-community-region]').forEach(region=>{
      const api=region.communityModule,html=region.querySelector(':scope > .native-html'),previous=regionLanguages.get(region);
      if(!api||!html||previous?.api===api&&previous.base===base&&html.lang===base)return;
      regionLanguages.set(region,{api,base});
      html.lang=base;
      api.window.postMessage({type:'nexora-language',language:base},location.origin);
    });
  }
  function frame(iframe){
    try{
      const doc=iframe.contentDocument;if(!doc?.body)return;
      if(!frames.has(iframe)){
        const watcher=new MutationObserver(records=>{watcher.disconnect();for(const record of records){if(record.type==='childList')record.addedNodes.forEach(element);else element(record.target);}watcher.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});});
        frames.set(iframe,{doc,watcher});watcher.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
      }else if(frames.get(iframe).doc!==doc){frames.get(iframe).watcher.disconnect();frames.delete(iframe);frame(iframe);return;}
      doc.documentElement.dir=language==='ar'?'rtl':'ltr';element(doc.body);
    }catch{/* Cross-origin content keeps its own locale. */}
  }
  function flush(){
    scheduled=false;observer?.disconnect();
    syncRegions();
    for(const node of pending)if(node.isConnected)element(node);
    pending.clear();
    document.querySelectorAll('iframe').forEach(frame);
    observer?.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
  }
  function queue(node=document.body){if(!node)return;pending.add(node);if(!scheduled){scheduled=true;requestAnimationFrame(flush);}}
  function apply(){
    document.documentElement.lang=language;
    document.documentElement.dir=language==='ar'?'rtl':'ltr';
    document.querySelectorAll('[data-community-region]').forEach(region=>region.dir=language==='ar'?'rtl':'ltr');
    syncRegions();
    queue();
  }
  function set(next){
    if(!valid.has(next))return false;
    language=next;try{localStorage.setItem(key,next);}catch{}
    apply();window.dispatchEvent(new CustomEvent('nexora-community-locale',{detail:{language:next,base:next==='vi'?'vi':'en'}}));
    return true;
  }
  window.NEXORA_COMMUNITY_LANGUAGE={get:()=>language,base:()=>language==='vi'?'vi':'en',set,translate,apply:queue,languages:data.languages};
  document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
  function start(){
    observer=new MutationObserver(records=>{
      for(const record of records){
        if(record.type==='characterData')queue(record.target);
        else if(record.type==='attributes')queue(record.target);
        else for(const node of record.addedNodes)queue(node);
      }
    });
    document.addEventListener('load',event=>{if(event.target.tagName==='IFRAME')frame(event.target);},true);
    apply();
  }
  window.addEventListener('storage',event=>{if(event.key===key&&valid.has(event.newValue)&&language!==event.newValue)set(event.newValue);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
