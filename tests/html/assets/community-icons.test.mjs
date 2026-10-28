import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const source = readFileSync(new URL('../../../html/assets/community-icons.js',import.meta.url),'utf8');
const settle = () => new Promise(resolve=>setTimeout(resolve,30));

async function boot(t,html,before) {
  const dom=new JSDOM('<!doctype html><html><head></head><body>'+html+'</body></html>',{url:'https://nexora.test/html/pages/community-hub.html',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  before?.(dom.window);
  dom.window.eval(source);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  await settle();
  return dom.window;
}

test('Community UI glyphs use local images while preserving text used by existing handlers',async t=>{
  const w=await boot(t,'<button id="compose">📷 Khoe mẫu</button><h3>👥 Groups</h3>');
  const button=w.document.querySelector('#compose');
  assert.equal(button.textContent,'📷 Khoe mẫu');
  assert.equal(button.querySelector('.community-icon-original').hidden,true);
  assert.match(button.querySelector('img').src,/\/assets\/icon-oneqr\/issue-2040-oneqr-camera-3d\.png$/);
  for(const img of w.document.querySelectorAll('.community-icon-glyph img')){
    assert.equal(img.alt,'');
    assert.ok(existsSync(new URL('../../../html/assets/icon-oneqr/'+img.src.split('/').pop(),import.meta.url)));
  }
});

test('member posts, messages, photo placeholders and editors keep their original content',async t=>{
  const w=await boot(t,'<p class="tx">My nails 💅 ✨</p><div class="bub"><div class="body">Hello ❤️</div></div><div class="photos">💅 ✨</div><textarea>📷 draft</textarea><p contenteditable="true">🛍 draft</p><h2 id="community-action-title">💅 Nail artist</h2><div class="community-action-summary"><strong>❤️ Bella</strong></div>');
  assert.equal(w.document.querySelectorAll('.community-icon-glyph').length,0);
  assert.equal(w.document.querySelector('.tx').textContent,'My nails 💅 ✨');
  assert.equal(w.document.querySelector('textarea').value,'📷 draft');
});

test('English pseudo-element chips keep their original value carrier and replace only the displayed prefix',async t=>{
  const w=await boot(t,'<b id="urgent" class="chip i18n-a" data-en="🔥 Urgent">🔥 Cần gấp</b>',w=>{
    const computed=w.getComputedStyle.bind(w);w.getComputedStyle=element=>computed(element);
  });
  const chip=w.document.querySelector('#urgent');
  assert.equal(chip.textContent,'🔥 Cần gấp');assert.equal(chip.getAttribute('data-en'),'🔥 Urgent');
  assert.equal(chip.querySelectorAll('img').length,0);
  assert.equal(chip.dataset.communityIconLabel,' Urgent');
  assert.match(chip.style.getPropertyValue('--community-translated-icon'),/issue-2040-oneqr-zap-3d\.png/);
  chip.classList.remove('i18n-a');await settle();
  assert.equal(chip.classList.contains('community-icon-translated'),false);
  assert.equal(chip.textContent,'🔥 Cần gấp');assert.equal(chip.querySelectorAll('img').length,1);
});

test('dynamic controls and repeated refreshes do not duplicate icons',async t=>{
  const w=await boot(t,'<div id="controls"></div>');
  w.document.querySelector('#controls').innerHTML='<button>♡ Lưu tin</button>';
  await settle();
  assert.equal(w.document.querySelectorAll('.community-icon-glyph').length,1);
  w.NEXORA_COMMUNITY_ICONS.refresh();await settle();
  assert.equal(w.document.querySelectorAll('.community-icon-glyph').length,1);
  w.document.querySelector('button').textContent='★ Đã lưu';await settle();
  assert.equal(w.document.querySelectorAll('.community-icon-glyph').length,1);
  assert.equal(w.document.querySelector('button').textContent,'★ Đã lưu');
});

test('language changes restore original text nodes before the existing translator runs',async t=>{
  const received=[];
  const w=await boot(t,'<button id="compose">📷 Khoe mẫu</button>',w=>{
    w.__setLang=lang=>{const b=w.document.querySelector('#compose');received.push(b.firstChild.nodeType);b.textContent=lang==='en'?'📷 Show work':'📷 Khoe mẫu';};
  });
  w.__setLang('en');await settle();
  assert.equal(w.document.querySelector('#compose').textContent,'📷 Show work');
  assert.equal(w.document.querySelectorAll('#compose img').length,1);
  w.__setLang('vi');await settle();
  assert.deepEqual(received,[3,3]);
  assert.equal(w.document.querySelector('#compose').textContent,'📷 Khoe mẫu');
});

test('local embedded Community documents receive one shared icon loader',async t=>{
  const w=await boot(t,'<iframe title="Feed"></iframe>');
  const child=w.document.querySelector('iframe').contentDocument;
  assert.equal(child.querySelectorAll('script[data-community-icons]').length,1);
  assert.match(child.querySelector('script').src,/\/assets\/community-icons\.js/);
  w.NEXORA_COMMUNITY_ICONS.refresh();await settle();
  assert.equal(child.querySelectorAll('script[data-community-icons]').length,1);
});
