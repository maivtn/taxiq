/* A visible shortcut between the two Community prototypes. */
(() => {
  'use strict';
  const script=document.currentScript,version=script.dataset.communityVersion;
  if(!['v2','v3.1'].includes(version)||document.getElementById('communityVersionSwitch'))return;
  const next=version==='v2'?'v3.1':'v2';
  const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('community-version-switch.css?v=20261106-v1',script.src).href;document.head.append(style);
  const panel=document.createElement('nav');panel.id='communityVersionSwitch';panel.className='community-version-switch';panel.setAttribute('aria-label','Community versions');
  const badge=document.createElement('strong');badge.className='community-version-badge';badge.textContent=version;
  const link=document.createElement('a');link.className='community-version-button';link.textContent='Switch to '+next+' →';
  function updateLink(){
    const staff=location.pathname.endsWith('/staff-community.html');
    const target=new URL((version==='v2'?'../v3.1/':'../pages/')+(staff?'staff-community.html':'community.html'),location.href);
    target.search=location.search;target.hash=location.hash;
    if(next==='v2'&&!['feed','groups','market','pages','deals','jobs','shift','blog','connect','chatgroups','calls','privacy'].includes(target.searchParams.get('tab')||'feed'))target.searchParams.set('tab','feed');
    link.href=target.href;
  }
  link.addEventListener('pointerdown',updateLink);link.addEventListener('focus',updateLink);link.addEventListener('click',updateLink);window.addEventListener('popstate',updateLink);
  panel.append(badge,link);document.body.append(panel);updateLink();
})();
