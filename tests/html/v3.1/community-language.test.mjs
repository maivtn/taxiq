import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const assets=new URL('../../../html/v3.1/community/',import.meta.url);
const pause=()=>new Promise(resolve=>setTimeout(resolve,45));
function boot(t,language='en'){
  const dom=new JSDOM('<!doctype html><body><button id="feed">Feed</button><span data-community-authored>Feed</span><input value="Feed" placeholder="Search"><select><option>Jobs</option></select></body>',{url:'https://demo.test/html/v3.1/community.html',runScripts:'outside-only',pretendToBeVisual:true});
  t.after(()=>dom.window.close());
  const w=dom.window;w.localStorage.setItem('nexora-community-language',language);
  for(const file of ['community-locales.js','community-language.js'])w.eval(readFileSync(new URL(file,assets),'utf8'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));return w;
}
test('Community exposes the seven PO locales and uses the PO navigation copy',async t=>{
  const w=boot(t),api=w.NEXORA_COMMUNITY_LANGUAGE,data=w.NEXORA_COMMUNITY_LOCALES;
  assert.deepEqual(Array.from(api.languages,row=>row[0]),['vi','en','es-MX','zh-Hans','fr','ar','pt']);
  const nav=JSON.parse(readFileSync(new URL('../../../from-po/goi-community-giao-dev/03-MA-NGUON/nexora-community/frontend/src/shared/i18n/nav.vi.json',import.meta.url),'utf8'));
  assert.equal(api.translate('Feed','vi'),nav.home);
  for(const locale of ['vi','en','es-MX','zh-Hans','fr','ar','pt']){
    api.set(locale);await pause();
    assert.equal(w.document.querySelector('#feed').textContent,locale==='en'?'Feed':data.translations[locale].Feed);
    assert.equal(w.localStorage.getItem('nexora-community-language'),locale);
    assert.equal(w.document.documentElement.lang,locale);
    assert.equal(w.document.documentElement.dir,locale==='ar'?'rtl':'ltr');
  }
  assert.equal(api.set('unknown'),false);
});
test('translation preserves authored content, input values and option identifiers',async t=>{
  const w=boot(t);w.NEXORA_COMMUNITY_LANGUAGE.set('vi');await pause();
  assert.equal(w.document.querySelector('[data-community-authored]').textContent,'Feed');
  assert.equal(w.document.querySelector('input').value,'Feed');
  assert.equal(w.document.querySelector('input').placeholder,w.NEXORA_COMMUNITY_LOCALES.translations.vi.Search);
  assert.equal(w.document.querySelector('option').value,'Jobs');
  assert.equal(w.document.querySelector('option').textContent,w.NEXORA_COMMUNITY_LOCALES.translations.vi.Jobs);
});
test('new and updated UI copy follows the selected locale and restores English',async t=>{
  const w=boot(t,'fr');await pause();
  const button=w.document.createElement('button');button.textContent='Jobs';w.document.body.append(button);await pause();
  assert.equal(button.textContent,w.NEXORA_COMMUNITY_LOCALES.translations.fr.Jobs);
  button.textContent='Groups & Market';await pause();
  assert.equal(button.textContent,w.NEXORA_COMMUNITY_LOCALES.translations.fr['Groups & Market']);
  w.NEXORA_COMMUNITY_LANGUAGE.set('en');await pause();assert.equal(button.textContent,'Groups & Market');
});
test('locale changes reach existing native regions and localize decorated PO labels',async t=>{
  const w=boot(t),region=w.document.createElement('section'),html=w.document.createElement('div'),messages=[];
  region.dataset.communityRegion='test';html.className='native-html';html.lang='en';region.append(html);
  region.communityModule={window:{postMessage:message=>messages.push(message)}};w.document.body.append(region);
  w.NEXORA_COMMUNITY_LANGUAGE.set('vi');
  assert.equal(html.lang,'vi');assert.equal(messages.at(-1).language,'vi');
  assert.equal(w.NEXORA_COMMUNITY_LANGUAGE.translate('Groups & Market →'),w.NEXORA_COMMUNITY_LOCALES.translations.vi['Groups & Market']+' →');
  w.NEXORA_COMMUNITY_LANGUAGE.set('fr');assert.equal(html.lang,'en');assert.equal(messages.at(-1).language,'en');
});
test('approved supplemental UI copy covers search, navigation and counted metadata',t=>{
  const w=boot(t),api=w.NEXORA_COMMUNITY_LANGUAGE,data=w.NEXORA_COMMUNITY_LOCALES;
  assert.equal(api.translate('Recent','vi'),'Gần đây');
  for(const locale of ['vi','es-MX','zh-Hans','fr','ar','pt']){
    assert.notEqual(api.translate('Dashboard',locale),'Dashboard');
    assert.equal(api.translate('16 followers',locale),'16 '+data.translations[locale].followers);
  }
});
