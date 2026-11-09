/* Explicit demo account navigation; each view retains its normal role restrictions. */
(() => {
  'use strict';
  const host=document.querySelector('#community-staging,#community-hub');if(!host)return;
  const personal=location.pathname.endsWith('/staff-community.html'),main=host.closest('main');
  const style=document.createElement('style');style.textContent=`
    main.community-has-demo-toolbar{display:flex!important;flex-direction:column;min-height:0}
    main.community-has-demo-toolbar>#community-staging,main.community-has-demo-toolbar>#community-hub{flex:1;min-height:0;height:auto!important}
    .community-demo-toolbar{position:relative;z-index:100;display:flex;align-items:center;justify-content:space-between;gap:8px;flex:none;min-height:52px;padding:4px 12px;border-bottom:1px solid #dde5ef;background:#fff;box-shadow:0 2px 8px #1024500a;font-family:Inter,Arial,sans-serif}
    .community-demo-role-button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:8px 12px;border:1px solid #aba8ff;border-radius:10px;background:#eeedff;color:#3730a3;font:800 12px Inter,Arial,sans-serif;white-space:nowrap;cursor:pointer}
    .community-demo-role-menu{position:absolute;top:calc(100% + 4px);left:12px;z-index:101;display:grid;gap:4px;width:220px;padding:8px;border:1px solid #c7c9ed;border-radius:12px;background:#fff;box-shadow:0 10px 30px #10245030}
    .community-demo-role-menu[hidden]{display:none}.community-demo-role-menu a{display:flex;align-items:center;min-height:44px;padding:10px;border-radius:8px;color:#17213b;text-decoration:none;font-size:13px;font-weight:700}.community-demo-role-menu a[aria-current="true"]{background:#eeedff;color:#3730a3}
    .community-demo-toolbar .community-version-switch{position:static!important;z-index:auto;gap:5px;padding:0;border:0;max-width:none;background:transparent;box-shadow:none}
    .community-demo-toolbar .community-version-badge{min-width:38px;min-height:36px;padding:4px 6px;font-size:12px;border-color:#dbe0ef;background:#102450;color:#fff}
    .community-demo-toolbar .community-version-button{min-height:44px;padding:7px 10px;font-size:11px;box-shadow:0 2px 0 #bf7f00}
    .community-demo-toolbar .community-version-more{min-height:44px;padding:7px 10px;font-size:11px}
    .community-demo-toolbar :is(button,a):focus-visible{outline:3px solid #7b70ff;outline-offset:2px}
    @media(max-width:420px){.community-demo-toolbar{padding-inline:8px;gap:5px}.community-demo-role-button{padding-inline:8px;font-size:11px;gap:5px}.community-demo-toolbar .community-version-button{padding-inline:7px}.community-demo-toolbar .community-version-more{padding-inline:8px}.community-demo-toolbar .community-version-badge{min-width:32px;padding-inline:4px}}
  `;document.head.append(style);
  const bar=document.createElement('nav');bar.className='community-demo-toolbar';bar.setAttribute('aria-label','Community demo accounts');
  const button=document.createElement('button');button.id='communityDemoRoleButton';button.className='community-demo-role-button';button.type='button';button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');button.innerHTML='<span>Demo · '+(personal?'Personal':'Salon')+'</span><span aria-hidden="true">↕</span>';
  const menu=document.createElement('div');menu.id='communityDemoRoleMenu';menu.className='community-demo-role-menu';menu.setAttribute('role','menu');menu.hidden=true;
  function target(role){const url=new URL(role==='personal'?'staff-community.html':'community.html',location.href);url.search=location.search;url.hash=location.hash;for(const key of ['member','role','account','pageId','pageMode','pageTab','pageScope','groupId','groupTab','jobsTab','jobId','profileRequired','shiftTab','shiftId','assignmentId','settlementId','invitationId','meetingId','recordId','composeKind','marketType'])url.searchParams.delete(key);const current=url.searchParams.get('tab');if(current==='page-tools')url.searchParams.set('tab','pages');if(current==='group-tools')url.searchParams.set('tab','groups');url.searchParams.set('account',role==='personal'?'personal':'business');if(role==='personal')url.searchParams.set('role','tech');return url.href;}
  for(const [role,label]of [['salon','Salon account'],['personal','Personal (staff)']]){const link=document.createElement('a');link.dataset.demoAccount=role;link.setAttribute('role','menuitem');link.setAttribute('aria-current',String((role==='personal')===personal));link.textContent=label;link.href=target(role);link.addEventListener('click',()=>{link.href=target(role);});menu.append(link);}
  button.setAttribute('aria-controls',menu.id);button.addEventListener('click',()=>{menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)menu.querySelector('[aria-current="false"]')?.focus();});
  document.addEventListener('click',event=>{if(!event.composedPath().includes(bar)){menu.hidden=true;button.setAttribute('aria-expanded','false');}});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){menu.hidden=true;button.setAttribute('aria-expanded','false');button.focus();}});
  bar.append(button,menu);const versions=document.getElementById('communityVersionSwitch');if(versions)bar.append(versions);main.classList.add('community-has-demo-toolbar');main.insertBefore(bar,host);
})();
