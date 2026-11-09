/* Shared account, points and contextual assistant surfaces. */
(() => {
  'use strict';
  const componentStyles=new URL('community-po-feed.css',document.currentScript.src).href;
  const shared=()=>window.NEXORA_COMMUNITY_SHARED;
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const mediaIcon=(name)=>'<img class="platform-profile-icon" src="/html/assets/icon-oneqr/issue-2040-oneqr-'+name+'-3d.png" alt="">';
  const profileMedia=['avatar','cover'];

  async function readProfileImage(file,kind){
    if(!file.type.startsWith('image/'))throw new Error('Expected an image');
    const source=await new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=reader.onabort=reject;
      reader.readAsDataURL(file);
    });
    const image=new Image();
    image.src=source;
    if(image.decode)await image.decode();
    if(file.size<=500*1024)return source;
    const limit=kind==='avatar'?384:1200;
    const scale=Math.min(1,limit/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    const context=canvas.getContext('2d');
    context.fillStyle='#fff';
    context.fillRect(0,0,canvas.width,canvas.height);
    context.drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',0.82);
  }

  function mount(root,options){
    const vi=options.language==='vi',t=(vn,en)=>vi?vn:en,s=shared(),identity=s.me();
    const icon=name=>window.lucide?.icons[name]?window.lucide.createElement(window.lucide.icons[name],{width:18,height:18,'aria-hidden':'true',focusable:'false'}).outerHTML:'';
    const button=(action,vn,en,primary=false)=>'<button type="button" class="platform-button'+(primary?' primary':'')+'" data-platform-action="'+action+'">'+icon(action==='mic'?'Mic':action==='privacy'?'Shield':action==='wheel'?'CircleDot':action==='wallet'?'WalletCards':'ArrowRight')+t(vn,en)+'</button>';
    const date=value=>new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    function wallet(){const account=s.wallet();root.innerHTML='<div class="platform-heading"><div><h2>'+t('Ví điểm NEXORA','NEXORA Points')+'</h2><p>'+esc(identity.id)+'</p></div></div><div class="platform-card"><span>'+t('Số dư','Balance')+'</span><div class="platform-balance">'+account.balance.toLocaleString('en-US')+'</div><div class="platform-actions">'+button('wheel','Vòng quay may mắn','Lucky Wheel',true)+button('earn','Cách kiếm điểm','How to earn points')+'</div></div><div class="platform-card"><h3>'+t('Lịch sử giao dịch','Transaction history')+'</h3>'+(account.ledger.length?'<div class="platform-table-scroll"><table class="platform-table"><thead><tr>'+['Time','Type','Points','Reason','Balance'].map((name,i)=>'<th>'+t(['Thời gian','Loại','Số điểm','Lý do','Số dư'][i],name)+'</th>').join('')+'</tr></thead><tbody>'+account.ledger.map(row=>'<tr><td>'+date(row.time)+'</td><td>'+t(row.amount>0?'Cộng':'Trừ',row.amount>0?'Credit':'Debit')+'</td><td>'+(row.amount>0?'+':'')+row.amount.toLocaleString('en-US')+'</td><td>'+esc(reason(row.reason))+'</td><td>'+row.balance.toLocaleString('en-US')+'</td></tr>').join('')+'</tbody></table></div>':'<div class="platform-empty">'+t('Chưa có giao dịch. Kiếm điểm từ OneQR, Lucky Wheel và hoạt động cộng đồng.','No transactions yet. Earn points through OneQR, Lucky Wheel and community activity.')+'</div>')+'</div>';}
    function reason(key){return ({'activity:post':t('Đăng bài Feed','Feed post'),'activity:comment':t('Bình luận','Comment'),'activity:engagement':t('Tương tác cộng đồng','Community engagement'),'activity:removed':t('Nội dung đã gỡ','Content removed'),profile:t('Hoàn thành hồ sơ','Complete your profile'),review:t('Viết review','Write a review'),'wheel:points':'Lucky Wheel','wheel:exchange':t('Đổi lượt quay','Exchange spins'),checkin:t('Điểm danh','Daily check-in')})[key]||key;}
    async function notifications(){const rows=s.read().notifications.filter(row=>row.recipient===s.member);root.innerHTML='<div class="platform-heading"><h2>'+t('Thông báo','Notifications')+'</h2></div><div class="platform-card">'+(rows.length?rows.map(row=>'<button type="button" class="platform-button" data-platform-notification="'+esc(row.id)+'"><span>'+esc(row.title)+'</span><time>'+date(row.time)+'</time></button>').join(''):'<p class="platform-empty">'+t('Chưa có thông báo mới.','No new notifications.')+'</p>')+'</div>';const slot=document.createElement('section');slot.className='platform-card community-po-feed';slot.dataset.poRequests='';root.insertBefore(slot,root.lastElementChild);try{const preview=await window.NEXORA_COMMUNITY_FEED?.preview();if(preview&&slot.isConnected)slot.innerHTML=preview.requests;}catch{} }
    function account(){
      let jobs={};
      try{jobs=JSON.parse(localStorage.getItem('nexora-community-jobs-workflow-v1')||'{}').profiles?.[s.member]||{};}catch{}
      const preview=kind=>'<img data-profile-preview="'+kind+'" alt=""'+(identity[kind]?' src="'+esc(identity[kind])+'"':' hidden')+'>';
      const upload=(kind,art,label)=>'<button type="button" class="platform-button" data-profile-pick="'+kind+'">'+mediaIcon(art)+label+'</button><input type="file" name="'+kind+'" accept="image/*" hidden>';
      const failure=t('Đã có lỗi xảy ra. Vui lòng thử lại.','Something went wrong. Please try again.');
      root.classList.add('platform-profile');
      root.innerHTML=`
        <div class="platform-heading"><h2>${t('Sửa hồ sơ cá nhân','Edit personal profile')}</h2></div>
        <form data-platform-profile>
          <fieldset class="platform-profile-editor">
            <div class="platform-profile-card platform-profile-media">
              <div class="platform-profile-avatar-row">
                <div class="platform-profile-avatar">
                  <span data-profile-initial>${esc(Array.from(identity.displayName)[0]?.toUpperCase()||'')}</span>
                  ${preview('avatar')}
                </div>
                <div>
                  ${upload('avatar','camera',t('THAY avatar','CHANGE avatar'))}
                  <p class="platform-profile-note">${t('Mở cửa sổ chọn file trên thiết bị.','Choose a file from your device.')}</p>
                </div>
              </div>
              ${upload('cover','image',t('Tải ảnh bìa cho hồ sơ','Upload profile cover photo'))}
              ${preview('cover')}
            </div>
            <div class="platform-profile-card platform-profile-fields">
              <label>${t('Họ tên đầy đủ (Bắt buộc) *','Full name (Required) *')}
                <input name="name" autocomplete="name" value="${esc(identity.name)}" required maxlength="100">
              </label>
              <label>${t('Nickname (Tùy chọn)','Nickname (Optional)')}
                <input name="displayNickname" autocomplete="nickname" value="${esc(identity.displayNickname)}" maxlength="100" aria-describedby="platformProfileNicknameHint">
              </label>
              <p class="platform-profile-note" id="platformProfileNicknameHint">${t('Để trống để dùng họ tên đầy đủ làm tên hiển thị. Nickname khác với @handle bên dưới.','Leave blank to use your full name as your display name. Your nickname is separate from your @handle below.')}</p>
              <label>${t('Số điện thoại','Phone number')}
                <input name="phone" type="tel" autocomplete="tel" value="${esc(identity.phone??jobs.phone)}">
              </label>
              <label>${t('Giới thiệu','Bio')}
                <textarea name="bio" rows="2">${esc(identity.bio)}</textarea>
              </label>
              <label>${t('@handle (đổi ở mục riêng)','@handle (change separately)')}
                <input value="@${esc(identity.nickname)}" readonly>
              </label>
            </div>
            <details class="platform-profile-card platform-profile-fields">
              <summary>${t('Email và khu vực','Email and area')}</summary>
              <label>Email<input name="email" type="email" autocomplete="email" value="${esc(identity.email)}"></label>
              <label>${t('Khu vực','Area')}<input name="city" value="${esc(identity.city??jobs.cityName)}"></label>
            </details>
            <p class="platform-profile-guidance">${icon('Check')}${t('Bấm Lưu để giữ lại thay đổi khi mở lại biểu mẫu hoặc tải lại trang.','Save your changes to keep them when you reopen this form or reload the page.')}</p>
            <button type="submit" class="platform-button primary">${t('Lưu thay đổi','Save changes')}</button>
          </fieldset>
          <p class="platform-profile-status" role="status"></p>
        </form>
        <div class="platform-profile-card platform-profile-summary">
          <h3 data-profile-name>${esc(identity.displayName)}</h3>
          <p>@${esc(identity.nickname)}</p>
          <p data-profile-bio${identity.bio?'':' hidden'}>${esc(identity.bio)}</p>
          <p><strong>NEXORA ID · ${esc(identity.id)}</strong></p>
          <span class="platform-status">${t(identity.verified?'Đã xác minh':'Chưa xác minh',identity.verified?'Verified':'Not verified')}</span>
          <div class="platform-actions">
            ${button('privacy','Privacy & NEXORA ID','Privacy & NEXORA ID')}
            ${s.role==='staff'?button('jobs-profile','Hồ sơ thợ','Tech Profile'):''}
            ${button('wallet','Ví điểm NEXORA','NEXORA Points')}
          </div>
        </div>`;
      const form=root.querySelector('[data-platform-profile]');
      const fields=form.querySelector('fieldset'),status=form.querySelector('[role="status"]');
      const pending={};
      const report=(message='',error=false)=>{
        status.classList.toggle('is-error',error);
        status.textContent=message;
      };
      form.addEventListener('input',()=>report());
      form.elements.email.addEventListener('invalid',()=>{form.elements.email.closest('details').open=true;});
      form.addEventListener('click',event=>{
        const kind=event.target.closest('[data-profile-pick]')?.dataset.profilePick;
        if(kind)form.elements[kind].click();
      });
      for(const kind of profileMedia){
        const input=form.elements[kind];
        input.addEventListener('change',async()=>{
          const file=input.files[0];
          if(!file)return;
          report();
          const selection=readProfileImage(file,kind).catch(()=>null);
          pending[kind]=selection;
          const source=await selection;
          if(pending[kind]!==selection)return;
          if(!source){
            input.value='';
            report(failure,true);
            return;
          }
          const image=form.querySelector('[data-profile-preview="'+kind+'"]');
          image.src=source;
          image.hidden=false;
        });
      }
      form.addEventListener('submit',async event=>{
        event.preventDefault();
        if(fields.disabled)return;
        report();
        const values=new FormData(form);
        const update=Object.fromEntries(['name','displayNickname','phone','bio','email','city'].map(key=>[key,values.get(key).trim()]));
        if(!update.name){
          report(t('Họ tên đầy đủ là bắt buộc.','Full name is required.'),true);
          form.elements.name.focus();
          return;
        }
        fields.disabled=true;
        try{
          for(const [kind,selection] of Object.entries(pending)){
            const source=await selection;
            if(!source){report(failure,true);return;}
            update[kind]=source;
          }
          if(!form.isConnected)return;
          const saved=s.change(store=>{
            const row=store.identities[s.member];
            if(!row)return false;
            Object.assign(row,update);
          });
          if(!saved){report(failure,true);return;}
          for(const kind of profileMedia){
            delete pending[kind];
            form.elements[kind].value='';
          }
          const displayName=update.displayNickname||update.name;
          root.querySelector('[data-profile-name]').textContent=displayName;
          root.querySelector('[data-profile-initial]').textContent=Array.from(displayName)[0].toUpperCase();
          const bio=root.querySelector('[data-profile-bio]');
          bio.textContent=update.bio;
          bio.hidden=!update.bio;
          report(t('Đã lưu hồ sơ.','Profile saved.'));
          if(update.email)s.points(50,'profile','profile:complete');
        }finally{
          fields.disabled=false;
        }
      });
    }
    function assistant(){root.innerHTML='<div class="platform-heading"><div><h2>'+t('Trợ lý AI','AI assistant')+'</h2><p>'+t('Bạn muốn hỏi hoặc đăng gì?','What would you like to ask or post?')+'</p></div></div><form class="platform-card platform-form" data-platform-assistant><label class="platform-wide">'+t('Nội dung','Message')+'<textarea name="prompt" rows="4" required maxlength="2000"></textarea></label><div class="platform-actions platform-wide">'+button('mic','Micro','Microphone')+'<button type="submit" class="platform-button primary">'+icon('Send')+t('Gửi','Send')+'</button></div><div class="platform-wide" data-platform-answer aria-live="polite"></div></form>';}
    root.addEventListener('submit',event=>{
      if(event.target.matches('[data-platform-assistant]')){event.preventDefault();const query=new FormData(event.target).get('prompt').trim(),normalized=query.toLowerCase(),targets=[];if(/job|work|tuyển|việc|thợ/.test(normalized))targets.push(['jobs','Việc làm','Jobs']);if(/house|rent|property|nhà|thuê|địa ốc/.test(normalized))targets.push(['realestate','Địa ốc','Real Estate']);if(/food|eat|restaurant|ăn|món|quán/.test(normalized))targets.push(['food','Nhà hàng món ngon','Food & Restaurants']);if(/meet|call|họp|gọi/.test(normalized))targets.push(['meet','NEXORA Meet','NEXORA Meet']);if(!targets.length)targets.push(['feed','Bảng tin','Feed'],['groups','Nhóm & Chợ','Groups & Market']);event.target.querySelector('[data-platform-answer]').innerHTML='<div class="platform-actions">'+targets.map(([route,vn,en])=>button('navigate:'+route,vn,en)).join('')+'</div>';}
    });
    root.addEventListener('click',async event=>{const friend=event.target.closest('[data-friend-accept],[data-friend-decline]');if(friend){event.preventDefault();const directory=window.NEXORA_COMMUNITY_PEOPLE;await directory.ready();if(directory.respond(friend.dataset.friendAccept||friend.dataset.friendDecline,!!friend.dataset.friendAccept))notifications();return;}const notification=event.target.closest('[data-platform-notification]')?.dataset.platformNotification;if(notification){const row=s.read().notifications.find(row=>row.id===notification&&row.recipient===s.member);if(row){s.change(data=>{data.notifications.find(item=>item.id===row.id).read=true;});options.navigate(row.route,row.context);}return;}const action=event.target.closest('[data-platform-action]')?.dataset.platformAction;if(!action)return;if(action==='privacy')options.navigate('privacy');else if(action==='jobs-profile')options.navigate('jobs',{jobsTab:'profile'});else if(['wheel','wallet'].includes(action))options.navigate(action);else if(action==='earn')options.navigate('wheel',{wheelTab:'tasks'});else if(action.startsWith('navigate:'))options.navigate(action.slice(9));else if(action==='mic'){const Voice=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Voice){root.querySelector('textarea')?.focus();return;}const recognition=new Voice();recognition.lang=vi?'vi-VN':'en-US';recognition.onresult=e=>{const field=root.querySelector('textarea');field.value=e.results[0][0].transcript;};recognition.start();}});
    if(options.route==='wallet')wallet();else if(options.route==='account')account();else if(options.route==='notifications'){const style=document.createElement('style');Promise.all([window.NEXORA_NATIVE.read(componentStyles),window.NEXORA_NATIVE.read(new URL('community-po-theme.css?v=20261107-ui-sync1',componentStyles).href)]).then(([css,theme])=>{style.textContent=css+'\n'+theme.slice(theme.indexOf('/* The same Story/People'));style.className='community-po-feed-style';const tree=root.getRootNode();if(!tree.querySelector('.community-po-feed-style'))tree.append(style);}).catch(()=>{});notifications();}else assistant();
  }
  window.NEXORA_COMMUNITY_PLATFORM={mount};
})();
