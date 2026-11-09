/* Copy the PO markup into both Community entry pages; extract CSS/JS as local assets. */
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const parse=source=>new JSDOM(source,{virtualConsole:new VirtualConsole()}).window.document;
const repo=path.resolve(__dirname,'..');
const base='/html/v3.1/community/';
const read=file=>fs.readFileSync(path.join(repo,file),'utf8');
const local=(value,from)=>new URL(value,'https://community.local'+from).pathname;
const files=['nexora-community-prototype.html','nexora-privacy-qr-layout.html','modules/hub-tools/index.html','modules/friends/index.html','modules/wheel/index.html','modules/meet/index.html','deals/nearby.html','deals/deal-match.html','deals/campaigns.html','deals/grand-opening.html'];
const definitions={},bodies={};
function extract(file){
  const doc=parse(read(file));
  const styles=[...doc.querySelectorAll('style,link[rel="stylesheet"]')].filter(n=>!n.href?.startsWith('https://fonts.')).map(n=>({url:n.tagName==='STYLE'?file:local(n.getAttribute('href'),file),text:n.tagName==='STYLE'?n.textContent:read(local(n.getAttribute('href'),file))}));
  const scripts=[...doc.querySelectorAll('script')].filter(n=>!n.type||/javascript|module/.test(n.type)).map(n=>({url:n.src?local(n.getAttribute('src'),file):file,code:n.src?read(local(n.getAttribute('src'),file)):n.textContent}));
  doc.querySelectorAll('script,style,link[rel="stylesheet"]').forEach(n=>n.remove());
  for(const n of doc.body.querySelectorAll('[src],[href],[poster]'))for(const a of ['src','href','poster']){const v=n.getAttribute(a);if(v&&!/^(?:#|data:|blob:|https?:|javascript:|mailto:|tel:)/.test(v))n.setAttribute(a,local(v,file));}
  return {doc,styles,scripts};
}
for(const file of files){
  const source=base+file,{doc,styles,scripts}=extract(source);
  definitions[source]={styles,scripts,attributes:Object.fromEntries([...doc.body.attributes].map(a=>[a.name,a.value])),lang:doc.documentElement.lang||'en'};
  bodies[source]=doc.body.innerHTML;
}
const shellFile=base+'nexora-community-complete.html',shell=extract(shellFile);
for(const [id,file]of [['communityPane',files[0]],['connectPane',files[1]]]){
  const pane=shell.doc.getElementById(id);pane.removeAttribute('data-src');pane.removeAttribute('src');
  pane.dataset.communityRegion=id;pane.removeAttribute('data-community-code');
  pane.innerHTML='<div class="native-html" lang="en"><div class="native-head"></div><div class="native-body '+(definitions[base+file].attributes.class||'')+'">'+bodies[base+file]+'</div></div>';
}
const templates=files.slice(2).map(file=>'<template data-community-template="'+base+file+'">'+bodies[base+file]+'</template>').join('\n');
const shellCSS=shell.styles.map(s=>s.text.replace(/url\((['"]?)([^)'"\s]+)\1\)/g,(all,q,v)=>/^(?:data:|https?:|#)/.test(v)?all:'url("'+local(v,s.url)+'")')).join('\n');
fs.writeFileSync(path.join(repo,'html/v3.1/community/community-direct-code.js'),'/* Copied Community scripts and styles. Regenerate with scripts/build-community-direct.cjs. */\nwindow.NEXORA_COMMUNITY_CODE='+JSON.stringify(definitions)+';\nwindow.NEXORA_COMMUNITY_SHELL_CSS='+JSON.stringify(shellCSS)+';\n');
for(const name of ['community.html','staff-community.html']){
  const file='html/v3.1/'+name,doc=parse(read(file));
  const host=doc.querySelector('#community-staging,#community-hub');host.dataset.communityRegion='shell';host.innerHTML=shell.doc.body.innerHTML;
  doc.querySelectorAll('template[data-community-template]').forEach(n=>n.remove());
  host.insertAdjacentHTML('afterend',templates);
  doc.querySelectorAll('script[data-community-code]').forEach(n=>n.remove());
  const bundle=doc.createElement('script');bundle.src='community/community-direct-code.js?v=20261109-inline1';bundle.dataset.communityCode='';
  doc.querySelector('script[src*="community-native.js"]').before(bundle);
  for(const script of doc.querySelectorAll('script[src*="community-native.js"],script[src*="community-integration.js"]'))script.src=script.getAttribute('src').replace(/\?v=.*/,'?v=20261109-inline1');
  // Keep the outer sidebar styles outside the copied Community sections.
  for(const style of doc.head.querySelectorAll('style[data-outer-style]')){const link=doc.createElement('link');link.rel='stylesheet';link.href=style.dataset.outerStyle;style.replaceWith(link);}
  for(const link of [...doc.head.querySelectorAll('link[rel="stylesheet"]')].filter(n=>!n.href.startsWith('https:'))){
    const style=doc.createElement('style');style.dataset.outerStyle=link.getAttribute('href');
    const source=local(link.getAttribute('href'),'/'+file);
    const css=read(source).replace(/url\((['"]?)([^)'"\s]+)\1\)/g,(all,q,v)=>/^(?:data:|https?:|#)/.test(v)?all:'url("'+local(v,source)+'")');
    style.textContent='@scope (:root) to ([data-community-region] > *) {\n'+css+'\n}';link.replaceWith(style);
  }
  fs.writeFileSync(path.join(repo,file),('<!doctype html>\n'+doc.documentElement.outerHTML+'\n').replace(/[ \t]+$/gm,''));
}
