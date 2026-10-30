import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const vendor=read('../../../html/assets/vendor/sweetalert2.all.min.js');
const source=read('../../../html/assets/community-v2/community-page-photos.js');
const settle=()=>new Promise(resolve=>setTimeout(resolve,30));
function setup(t,photos=['one.jpg','two.jpg','three.jpg']){
  const dom=new JSDOM('<div id="modalRoot"></div><section data-page-detail-id="p1"><h3 id="pageDetailTitle">BITCOIN NAIL BAR</h3><div class="page-photo-grid">'+photos.map((src,index)=>'<button type="button" class="page-photo-trigger" aria-haspopup="dialog"><img '+(src?'src="'+src+'"':'data-page-media-id="pending"')+' alt="Photo '+(index+1)+'"></button>').join('')+'</div></section><div class="page-photo-grid"><button class="page-photo-trigger"><img src="other-page.jpg" alt="Other Page"></button></div>',{url:'https://nexora.test/html/assets/community-v2/nexora-community-prototype.html',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  w.scrollTo=()=>{};
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  w.eval(vendor);w.eval(source);
  t.after(()=>{w.Swal.close();w.close();});
  const thumbnails=[...w.document.querySelector('[data-page-detail-id] .page-photo-grid').querySelectorAll('button')];
  return {w,thumbnails,popup:()=>w.Swal.getPopup(),image:()=>w.document.querySelector('.page-photo-viewer-image'),count:()=>w.document.querySelector('.page-photo-viewer-count').textContent};
}

test('Page viewer opens the clicked photo and cycles only through that Page gallery',async t=>{
  const {w,thumbnails,popup,image,count}=setup(t);
  thumbnails[1].click();await settle();
  assert.ok(popup());assert.match(image().src,/two\.jpg$/);assert.equal(count(),'2 / 3');
  popup().querySelector('.is-next').click();assert.match(image().src,/three\.jpg$/);assert.equal(count(),'3 / 3');
  popup().querySelector('.is-next').click();assert.match(image().src,/one\.jpg$/);
  popup().querySelector('.is-previous').click();assert.match(image().src,/three\.jpg$/);
  popup().dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));assert.match(image().src,/two\.jpg$/);
  popup().dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.match(image().src,/three\.jpg$/);
  const title=popup().querySelector('.swal2-title');
  assert.equal(title.innerText||title.textContent,'BITCOIN NAIL BAR');
});

test('Single photo hides navigation; Escape closes without reaching the legacy handler and restores focus',async t=>{
  const {w,thumbnails,popup}=setup(t,['only.jpg']);let legacyEscapes=0;
  w.document.addEventListener('keydown',event=>{if(event.key==='Escape')legacyEscapes++;});
  thumbnails[0].click();await settle();
  assert.ok([...popup().querySelectorAll('.page-photo-viewer-nav')].every(button=>button.hidden));
  popup().dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await settle();
  assert.equal(popup(),null);assert.equal(legacyEscapes,0);assert.equal(w.document.activeElement,thumbnails[0]);
});

test('Uploaded photos join after hydration; missing sources never open an empty viewer',async t=>{
  const {w,thumbnails,popup,image,count}=setup(t,['cover.jpg','']);
  thumbnails[1].click();await settle();assert.equal(popup(),null);
  thumbnails[1].querySelector('img').src='blob:https://nexora.test/uploaded-photo';
  thumbnails[1].click();await settle();
  assert.equal(image().src,'blob:https://nexora.test/uploaded-photo');assert.equal(image().alt,'Photo 2');assert.equal(count(),'2 / 2');
  w.dispatchEvent(new w.MessageEvent('message',{source:w,origin:'https://untrusted.test',data:{type:'nexora-close-modal'}}));assert.ok(popup());
  w.dispatchEvent(new w.MessageEvent('message',{source:w,origin:w.location.origin,data:{type:'nexora-close-modal'}}));await settle();assert.equal(popup(),null);
});

test('Phone swipes move horizontally while vertical scrolling and pinch gestures keep the photo',async t=>{
  const {w,thumbnails,popup,image}=setup(t);
  thumbnails[0].click();await settle();
  const stage=popup().querySelector('.page-photo-viewer-stage');
  function touch(type,points){const event=new w.Event(type,{bubbles:true});Object.defineProperty(event,type==='touchstart'?'touches':'changedTouches',{value:points.map(([clientX,clientY])=>({clientX,clientY}))});stage.dispatchEvent(event);}
  touch('touchstart',[[180,90]]);touch('touchend',[[70,95]]);assert.match(image().src,/two\.jpg$/);
  touch('touchstart',[[70,90]]);touch('touchend',[[180,95]]);assert.match(image().src,/one\.jpg$/);
  touch('touchstart',[[180,90]]);touch('touchend',[[130,220]]);assert.match(image().src,/one\.jpg$/);
  touch('touchstart',[[180,90],[200,90]]);touch('touchend',[[70,95]]);assert.match(image().src,/one\.jpg$/);
});
