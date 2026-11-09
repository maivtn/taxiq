import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../../../html/v3.1/community/community-native.js',import.meta.url),'utf8');
function scopeCSS(value){
  const window={};
  runInNewContext(source,{window,URL});
  return window.NEXORA_NATIVE.css(value,new URL('https://community.test/html/v3.1/community/module.css'));
}

test('native CSS scopes document selectors while preserving the avatar asset URL',()=>{
  const result=scopeCSS(':root{--avatar:url("/html/v3.1/community/avatar.jpg")}html,body{background:var(--avatar)}');
  assert.ok(result.includes(':host{--avatar:url("https://community.test/html/v3.1/community/avatar.jpg")}'));
  assert.ok(result.includes('.native-html,.native-body{background:var(--avatar)}'));
});

test('native CSS resolves relative images named after document elements',()=>{
  const result=scopeCSS('body{background:url(html.png)}html{mask:url(body.svg#mask)}');
  assert.ok(result.includes('url("https://community.test/html/v3.1/community/html.png")'));
  assert.ok(result.includes('url("https://community.test/html/v3.1/community/body.svg#mask")'));
});

test('native CSS preserves external and embedded SVG URLs during selector scoping',()=>{
  const asset='https://cdn.example/html/body.png';
  const embedded="data:image/svg+xml,%3Csvg%3Ehtml%20body%20:root%3C/svg%3E";
  const result=scopeCSS('html{background:url("'+asset+'");mask:url("'+embedded+'")}');
  assert.ok(result.includes('url("'+asset+'")'));
  assert.ok(result.includes('url("'+embedded+'")'));
});
