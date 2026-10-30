import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const read=name=>readFileSync(new URL('../../../html/assets/community-v2/'+name,import.meta.url),'utf8');
function boot(t,body=''){
  const dom=new JSDOM('<html lang="en"><body>'+body+'</body></html>',{url:'https://nexora.test/html/assets/community-v2/nexora-community-prototype.html',runScripts:'outside-only'});
  t.after(()=>dom.window.close());return dom.window;
}

test('English seed upgrades update untouched samples while preserving member edits and domain values',t=>{
  const w=boot(t);w.eval(read('community-demo-data.js'));
  const rows=JSON.parse(JSON.stringify(w.NEXORA_COMMUNITY_DEMO.extra.pages.slice(0,2)));
  rows[0].description='Tiệm nail tại Houston.';rows[1].description='Nhà hàng tại Houston.';
  w.localStorage.setItem('nexora-community-demo-baselines-v2',JSON.stringify({'extra-pages':rows}));
  const saved=JSON.parse(JSON.stringify(rows));saved[0].description='Nội dung riêng do chủ tiệm viết.';
  w.eval(read('community-demo-data.js'));
  const catalog=w.NEXORA_COMMUNITY_DEMO;
  const merged=catalog.merge(saved,catalog.extra.pages,[],'extra-pages');
  assert.equal(merged.find(row=>row.id==='p1').description,'Nội dung riêng do chủ tiệm viết.');
  assert.equal(merged.find(row=>row.id==='p2').description,catalog.extra.pages.find(row=>row.id==='p2').description);
  assert.equal(merged.find(row=>row.id==='p1').industry,'Nail & làm đẹp');
  assert.equal(new Set(merged.map(row=>row.id)).size,merged.length);
});

test('English Page summaries and labels leave authored text and stored select values intact',t=>{
  const w=boot(t,'<p id="summary">3 bài đã đăng · 2 bài đã lên lịch · 16 người theo dõi. Đăng bài và ưu đãi miễn phí; quảng bá nổi bật là lựa chọn riêng.</p><button id="edit">Chỉnh sửa Fanpage</button><select id="industry"><option>Nail & làm đẹp</option></select><p data-community-authored id="authored">Đây là bài tôi tự viết.</p><textarea id="body">Nội dung cá nhân.</textarea>');
  w.localStorage.setItem('nexora-community-language','en');w.eval(read('nexora-community-i18n.js'));
  assert.match(w.document.getElementById('summary').textContent,/published|posts/);
  assert.match(w.document.getElementById('summary').textContent,/scheduled/);
  assert.match(w.document.getElementById('summary').textContent,/followers/);
  assert.equal(w.document.getElementById('edit').textContent,'Edit Page');
  assert.equal(w.document.getElementById('industry').value,'Nail & làm đẹp');
  assert.equal(w.document.querySelector('option').textContent,'Nail & beauty');
  assert.equal(w.document.getElementById('authored').textContent,'Đây là bài tôi tự viết.');
  assert.equal(w.document.getElementById('body').value,'Nội dung cá nhân.');
});

test('English entry initialization replaces the old language preference without changing saved content',t=>{
  const w=boot(t);w.localStorage.setItem('nexora-community-language','vi');
  w.localStorage.setItem('nexora-community-templates-v1',JSON.stringify({feed:[{id:'member-post',description:'Bài của tôi.'}]}));
  const before=w.localStorage.getItem('nexora-community-templates-v1');
  const markup=new JSDOM(read('nexora-community-prototype.html'));
  const bootstrap=markup.window.document.querySelector('head script:not([src])').textContent;markup.window.close();
  w.eval(bootstrap);
  assert.equal(w.localStorage.getItem('nexora-community-language'),'en');
  assert.equal(w.localStorage.getItem('nexora-community-templates-v1'),before);
});
