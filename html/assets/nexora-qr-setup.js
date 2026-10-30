/* OneQR onboarding follows the supplied screenshots and reuses the OneQR action catalog. */
(function () {
  'use strict';
  var esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  var clone=value=>JSON.parse(JSON.stringify(value));
  var icon=name=>'<i class="bi bi-'+name+'" aria-hidden="true"></i>';
  var imagePattern=/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/i;
  var oldIcons={checkin:['check'],tip:['phone'],payment:['camera','scan-line']};
  function url(value) {
    var raw=String(value||'').trim();if(!raw)return '';
    if(!/^[a-z][a-z\d+.-]*:/i.test(raw))raw='https://'+raw;
    try{var parsed=new URL(raw);return ['http:','https:','mailto:','tel:','sms:'].includes(parsed.protocol)?parsed.href:'';}catch(_){return '';}
  }
  function defaults(industryId) {
    var catalog=window.ONEQR_INDUSTRIES,industry=catalog.industries.find(item=>item.id===industryId);
    if(industry)return catalog.recommended(industry).map(id=>({id:id,title:catalog.modules[id].en,icon:catalog.modules[id].icon,url:catalog.actionUrl(id),enabled:true}));
    return [
      ['booking','Book Appointment','calendar-check','../customer/booking.html'],
      ['review','Leave a Review','star','../tip-flow/review.html'],
      ['checkin','Smart Check-in','scan-line','../customer/check-in-mobile.html'],
      ['tip','Tip & Pay','hand-coins','../tip-flow/select-staff.html'],
      ['payment','Pay Now','credit-card','qr-stations.html?tab=accept-payment']
    ].map(item=>({id:item[0],title:item[1],icon:item[2],url:new URL(item[3],window.location.href).href,enabled:true}));
  }
  function complete(fields) {
    var modules=enteredModules(fields);
    return !!String(fields.qrName||'').trim()&&modules.some(item=>item.enabled)&&modules.filter(item=>item.enabled).every(item=>String(item.title||'').trim()&&url(item.url));
  }
  function enteredModules(fields) {
    var saved=Array.isArray(fields.qrModules)?fields.qrModules:[];
    if(fields.qrIndustryId)return saved;
    var samples=defaults().concat({id:'services',title:'Services & prices',icon:'list',url:new URL('../menu/menu.html',location.href).href});
    return saved.filter(item=>{
      var sample=samples.find(base=>base.id===item.id&&base.title===item.title);
      if(!sample||item.iconCustomized||![sample.icon].concat(oldIcons[item.id]||[]).includes(item.icon))return true;
      try{
        var link=new URL(item.url,location.href),original=new URL(sample.url);
        var prototype=link.origin===original.origin||['localhost','127.0.0.1','taxiq-nexora-touch.vercel.app'].includes(link.hostname);
        return !(prototype&&link.pathname===original.pathname&&link.search===original.search&&link.hash===original.hash);
      }catch(_){return true;}
    });
  }
  function mount(panel,options) {
    var fields=options.fields||{}, business=options.business||{}, appearance=window.ONEQR_ACTION_APPEARANCE;
    var allowIndustry=!!options.allowIndustry,catalog=window.ONEQR_INDUSTRIES;
    var industryId=allowIndustry?(catalog.industries.some(item=>item.id===fields.qrIndustryId)?fields.qrIndustryId:options.industry):'';
    function recommended(){return defaults(industryId);}
    var modules=clone(enteredModules(fields));
    // Replace earlier demo icons while retaining uploaded and other custom icons.
    var salonDefaults=defaults();
    modules.forEach(item=>{
      var matching=salonDefaults.find(base=>base.id===item.id&&base.title===item.title);
      if(matching&&!item.iconCustomized&&oldIcons[item.id]?.includes(item.icon))item.icon=matching.icon;
    });
    var state={qrName:fields.qrName==null?(fields.qrLabel||business.name||''):fields.qrName,welcomeMessage:fields.welcomeMessage||'',qrModules:modules};
    if(allowIndustry)state.qrIndustryId=industryId;
    var controller=new AbortController(), reads=new Map(), destroyed=false, targetId='', dragged='', returnFocus=null, priorOverflow='', industryPicker=null;
    var $=selector=>panel.querySelector(selector);
    function button(label,attributes,cls){return '<button type="button" '+attributes+' class="nxqr-button '+(cls||'')+'">'+label+'</button>';}
    function picture(value){return imagePattern.test(value||'')?'<img src="'+esc(value)+'" alt="">':appearance.image(value,28);}
    function snapshot(){return clone(state);}
    function notify(){return options.onChange(snapshot())!==false;}
    function busy(){options.onBusy?.(reads.size>0);}
    function status(message){$('[data-qr-status]').textContent=message;}
    panel.classList.add('nxqr');
    panel.innerHTML=(allowIndustry?'<div class="nxqr-industry-bar"><div><span>Industry templates</span><strong data-qr-industry-label></strong></div>'+button(icon('arrow-repeat')+'Change industry','data-qr-change-industry')+'</div>':'')+'<div class="nxqr-details"><label class="nxqr-field"><span>OneQR name</span><input name="qrName" data-qr-name value="'+esc(state.qrName)+'" maxlength="120" required autocomplete="off"><small>Internal name only. Customers never see it.</small></label><label class="nxqr-field"><span>Welcome message</span><input name="welcomeMessage" data-qr-welcome value="'+esc(state.welcomeMessage)+'" maxlength="180" placeholder="'+esc('e.g. Welcome to '+(business.name||'Bitcoin Nail Bar'))+'"><small>This message and the identity rule apply to the Customer view only.</small></label></div><form class="nxqr-link-form" data-qr-link-form>'+icon('link-45deg')+'<input name="destination" data-qr-link-input type="text" inputmode="url" placeholder="Paste any link — website, Google review, YouTube, Instagram..." aria-label="Paste a link to add a module" autocomplete="off" required><button type="submit" disabled>Add</button></form><p class="nxqr-hint">Add a destination first, then choose what customers will see this action as.</p><div class="nxqr-modules" data-qr-modules></div><p class="nxqr-status" data-qr-status role="status"></p><input type="file" data-qr-icon-upload accept="image/png,image/jpeg,image/webp,image/gif" hidden><div class="nxqr-overlay" data-qr-overlay hidden><section class="nxqr-dialog" role="dialog" aria-modal="true" aria-labelledby="nxqr-dialog-title"><header><h3 id="nxqr-dialog-title"></h3>'+button(icon('x-lg'),'data-qr-dialog-close aria-label="Close"')+'</header><div data-qr-dialog-body></div><footer>'+button('Done','data-qr-dialog-close')+'</footer></section></div>';
    function renderRows(focusId,focusAction) {
      $('[data-qr-modules]').innerHTML=modules.map((item,index)=>'<div class="nxqr-module" data-qr-row="'+esc(item.id)+'">'+button(icon('grip-vertical'),'data-qr-drag draggable="true" aria-label="Drag to reorder '+esc(item.title)+'" title="Drag to reorder"','nxqr-drag')+'<div class="nxqr-icon-tools"><span class="nxqr-module-icon">'+picture(item.icon)+'</span>'+button('Change icon','data-qr-action="icon"')+button('Upload','data-qr-action="upload"')+'</div><div class="nxqr-module-fields"><input data-qr-module-title value="'+esc(item.title)+'" aria-label="Module title: '+esc(item.title)+'" maxlength="120"'+(item.enabled?' required':'')+'><div class="nxqr-module-url">'+icon('link-45deg')+'<input data-qr-module-url value="'+esc(item.url)+'" aria-label="Link for '+esc(item.title)+'" inputmode="url" maxlength="2000" spellcheck="false">'+button(icon('copy'),'data-qr-action="copy" aria-label="Copy link for '+esc(item.title)+'" title="Copy link"')+'<a data-qr-open'+(url(item.url)?' href="'+esc(url(item.url))+'"':' aria-disabled="true" tabindex="-1"')+' target="_blank" rel="noopener noreferrer" aria-label="Open link for '+esc(item.title)+' in a new tab" title="Open link">'+icon('box-arrow-up-right')+'</a></div></div><div class="nxqr-module-side">'+button('','data-qr-action="toggle" role="switch" aria-checked="'+!!item.enabled+'" aria-label="Toggle '+esc(item.title)+' module"','nxqr-switch'+(item.enabled?' is-on':''))+'<div class="nxqr-order">'+button(icon('arrow-up'),'data-qr-action="up" aria-label="Move '+esc(item.title)+' up"'+(!index?' disabled':''))+button(icon('arrow-down'),'data-qr-action="down" aria-label="Move '+esc(item.title)+' down"'+(index===modules.length-1?' disabled':''))+'</div>'+button('Remove','data-qr-action="remove" aria-label="Remove '+esc(item.title)+'"','nxqr-remove')+'</div></div>').join('');
      if(focusId){var row=Array.from(panel.querySelectorAll('[data-qr-row]')).find(row=>row.dataset.qrRow===focusId);row?.querySelector(focusAction||'[data-qr-module-title]')?.focus();}
    }
    function update(){state.qrModules=modules;notify();}
    function move(id,to){var from=modules.findIndex(item=>item.id===id);if(from<0||to<0||to>=modules.length)return;modules.splice(to,0,modules.splice(from,1)[0]);renderRows(id,'[data-qr-drag]');update();}
    function renderIndustry(){
      if(allowIndustry)$('[data-qr-industry-label]').textContent='Template: '+catalog.industries.find(item=>item.id===industryId).en;
    }
    function selectIndustry(industry){
      var previousIds=recommended().map(item=>item.id),retained=modules.filter(item=>!previousIds.includes(item.id));
      reads.forEach(reader=>reader.abort());reads.clear();busy();
      industryId=industry.id;state.qrIndustryId=industryId;
      var next=recommended().map(item=>modules.find(existing=>existing.id===item.id)||item);
      modules=next.concat(retained.filter(item=>!next.some(action=>action.id===item.id)));
      closeDialog();renderIndustry();renderRows();update();
    }
    function openDialog(kind,id,trigger){
      targetId=id||'';returnFocus=trigger;priorOverflow=document.body.style.overflow;
      $('.nxqr-dialog').classList.toggle('is-industry',kind==='industry');
      $('#nxqr-dialog-title').textContent=kind==='industry'?'Choose your business industry':'Choose an icon';
      if(kind==='industry'){
        industryPicker=window.ONEQR_INDUSTRY_PICKER.mount($('[data-qr-dialog-body]'),{selected:industryId,embedded:true,onSelect:selectIndustry});
      }else{
        var item=modules.find(item=>item.id===id);
        $('[data-qr-dialog-body]').innerHTML='<div class="nxqr-icon-grid">'+appearance.icons.map(value=>button(picture(value),'data-qr-icon="'+value+'" aria-label="Use '+value+' icon" aria-pressed="'+(!imagePattern.test(item.icon)&&value===appearance.resolveIcon(item.icon))+'"')).join('')+'</div>';
      }
      $('[data-qr-overlay]').hidden=false;document.body.style.overflow='hidden';(kind==='industry'?$('[data-qr-dialog-body] input'):$('[data-qr-dialog-body]').querySelector('input,button'))?.focus();
    }
    function closeDialog(){if(industryPicker){industryPicker.destroy();industryPicker=null;}$('[data-qr-dialog-body]').classList.remove('oneqr-industry-picker');$('[data-qr-overlay]').hidden=true;document.body.style.overflow=priorOverflow;if(returnFocus?.isConnected)returnFocus.focus();}
    panel.addEventListener('input',event=>{
      var input=event.target;
      if(input.matches('[data-qr-name],[data-qr-welcome]')){state[input.name]=input.value;input.setCustomValidity('');notify();return;}
      if(input.matches('[data-qr-link-input]')){input.setCustomValidity('');$('[data-qr-link-form] [type=submit]').disabled=!input.value.trim();return;}
      var row=input.closest('[data-qr-row]');if(!row)return;
      var item=modules.find(item=>item.id===row.dataset.qrRow);
      if(input.hasAttribute('data-qr-module-title'))item.title=input.value;
      else if(input.hasAttribute('data-qr-module-url')){item.url=input.value;input.setCustomValidity('');var link=row.querySelector('[data-qr-open]');var href=url(input.value);if(href){link.href=href;link.removeAttribute('aria-disabled');link.removeAttribute('tabindex');}else{link.removeAttribute('href');link.setAttribute('aria-disabled','true');link.tabIndex=-1;}}
      else return;
      update();
    },{signal:controller.signal});
    $('[data-qr-link-form]').addEventListener('submit',event=>{
      event.preventDefault();var input=$('[data-qr-link-input]'),destination=url(input.value);
      if(!destination){input.setCustomValidity('Enter a valid website, email, or phone link.');input.reportValidity();return;}
      var id='custom-'+(window.crypto.randomUUID?window.crypto.randomUUID():Date.now());
      modules.push({id:id,title:new URL(destination).hostname.replace(/^www\./,'')||'New link',url:destination,icon:'link',enabled:true});input.value='';event.currentTarget.querySelector('[type=submit]').disabled=true;renderRows(id);update();
    },{signal:controller.signal});
    panel.addEventListener('click',async event=>{
      if(event.target.matches('[data-qr-overlay]')){closeDialog();return;}
      var control=event.target.closest('button');if(!control)return;
      if(control.hasAttribute('data-qr-dialog-close')){closeDialog();return;}
      if(control.hasAttribute('data-qr-change-industry')){openDialog('industry','',control);return;}
      if(control.hasAttribute('data-qr-icon')){var item=modules.find(item=>item.id===targetId);if(item){if(reads.has(item.id)){reads.get(item.id).abort();reads.delete(item.id);busy();}item.icon=control.dataset.qrIcon;item.iconCustomized=true;closeDialog();renderRows(item.id,'[data-qr-action="icon"]');update();}return;}
      var row=control.closest('[data-qr-row]');if(!row)return;
      var item=modules.find(item=>item.id===row.dataset.qrRow),index=modules.indexOf(item),action=control.dataset.qrAction;
      if(action==='up'||action==='down'){move(item.id,index+(action==='up'?-1:1));return;}
      if(action==='toggle'){item.enabled=!item.enabled;renderRows(item.id,'[data-qr-action="toggle"]');update();}
      if(action==='remove'){if(reads.has(item.id)){reads.get(item.id).abort();reads.delete(item.id);busy();}modules.splice(index,1);renderRows();update();}
      if(action==='icon')openDialog('icon',item.id,control);
      if(action==='upload'){var upload=$('[data-qr-icon-upload]');upload.dataset.moduleId=item.id;upload.click();}
      if(action==='copy'){
        var destination=url(item.url);
        if(!destination){row.querySelector('[data-qr-module-url]').focus();return;}
        try{await navigator.clipboard.writeText(destination);if(!destroyed)status('Module link copied.');}catch(_){if(!destroyed){row.querySelector('[data-qr-module-url]').select();status('Could not copy. Select the link and copy it manually.');}}
      }
    },{signal:controller.signal});
    $('[data-qr-icon-upload]').addEventListener('change',event=>{
      var input=event.target,file=input.files[0],id=input.dataset.moduleId;input.value='';if(!file||!modules.some(item=>item.id===id))return;
      if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>1024*1024){status('Use a PNG, JPG, WebP, or GIF image smaller than 1 MB.');return;}
      if(reads.has(id))reads.get(id).abort();
      var reader=new FileReader();reads.set(id,reader);busy();
      function finish(){if(reads.get(id)===reader){reads.delete(id);busy();}}
      reader.onload=()=>{var item=modules.find(item=>item.id===id);if(!destroyed&&reads.get(id)===reader&&item&&imagePattern.test(reader.result)){item.icon=reader.result;item.iconCustomized=true;renderRows(id,'[data-qr-action="upload"]');update();}finish();};
      reader.onerror=()=>{if(!destroyed)status('Could not read this image. Please try another file.');finish();};reader.onabort=finish;reader.readAsDataURL(file);
    },{signal:controller.signal});
    $('[data-qr-modules]').addEventListener('keydown',event=>{var handle=event.target.closest('[data-qr-drag]');if(handle&&['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();move(handle.closest('[data-qr-row]').dataset.qrRow,modules.findIndex(item=>item.id===handle.closest('[data-qr-row]').dataset.qrRow)+(event.key==='ArrowUp'?-1:1));}},{signal:controller.signal});
    $('[data-qr-modules]').addEventListener('dragstart',event=>{var handle=event.target.closest('[data-qr-drag]');if(!handle){event.preventDefault();return;}dragged=handle.closest('[data-qr-row]').dataset.qrRow;event.dataTransfer?.setData('text/plain',dragged);handle.closest('[data-qr-row]').classList.add('is-dragging');},{signal:controller.signal});
    $('[data-qr-modules]').addEventListener('dragover',event=>{if(dragged&&event.target.closest('[data-qr-row]'))event.preventDefault();},{signal:controller.signal});
    $('[data-qr-modules]').addEventListener('drop',event=>{var row=event.target.closest('[data-qr-row]');if(!dragged||!row)return;event.preventDefault();var to=modules.findIndex(item=>item.id===row.dataset.qrRow);move(dragged,to);dragged='';},{signal:controller.signal});
    $('[data-qr-modules]').addEventListener('dragend',()=>{dragged='';panel.querySelectorAll('.is-dragging').forEach(row=>row.classList.remove('is-dragging'));},{signal:controller.signal});
    $('[data-qr-overlay]').addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();closeDialog();return;}
      if(event.key!=='Tab')return;
      var controls=Array.from($('[data-qr-overlay]').querySelectorAll('button,input')).filter(control=>!control.disabled),first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    },{signal:controller.signal});
    renderIndustry();renderRows();
    return {snapshot,validate(){
      var name=$('[data-qr-name]');name.setCustomValidity(state.qrName.trim()?'':'Enter a OneQR name.');if(!name.reportValidity())throw new Error('Enter a OneQR name.');
      if(!modules.some(item=>item.enabled))throw new Error(options.chooseAtLeastOne);
      for(var item of modules.filter(item=>item.enabled)){
        var row=Array.from(panel.querySelectorAll('[data-qr-row]')).find(row=>row.dataset.qrRow===item.id),title=row.querySelector('[data-qr-module-title]'),link=row.querySelector('[data-qr-module-url]');
        title.setCustomValidity(item.title.trim()?'':options.requiredMessage);if(!title.reportValidity())throw new Error(options.requiredMessage);
        link.setCustomValidity(url(item.url)?'':'Enter a valid website, email, or phone link.');if(!link.reportValidity())throw new Error('Enter a valid website, email, or phone link.');
      }
      if(reads.size)throw new Error(options.requiredMessage);if(!notify())throw new Error(options.saveFailed);
    },destroy(){destroyed=true;controller.abort();if(industryPicker)industryPicker.destroy();reads.forEach(reader=>reader.abort());reads.clear();busy();if(!$('[data-qr-overlay]').hidden)document.body.style.overflow=priorOverflow;}};
  }
  window.NEXORA_QR_SETUP={mount,complete};
})();
