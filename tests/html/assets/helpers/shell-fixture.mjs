import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
export const assets = new URL('../../../../html/assets/', import.meta.url);
export function boot(t, {page='dashboard.html',activePage='dashboard',activeTab='',before,html}={}) {
  const dom=new JSDOM(html || '<!doctype html><body><aside class="sidebar"></aside><header class="header"></header></body>',{url:'https://nexora.test/html/pages/'+page,runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const w=dom.window; w.NEXORA_SHELL={activePage,activeTab}; before?.(w);
  for(const file of ['nexora-icons.js','nexora-shell-nav.js','nexora-shell.js']) w.eval(readFileSync(new URL(file,assets),'utf8'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));return w;
}
export function group(w,key){return w.document.querySelector('[data-sidebar-key="'+key+'"]');}
export function leaf(w,label){return Array.from(w.document.querySelectorAll('.sidebar a, .sidebar [data-shell-tab]')).find(x=>x.textContent.trim()===label);}
