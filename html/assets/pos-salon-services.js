(function () {
  'use strict';
  const panel = document.querySelector('[data-settings-panel="services"]');
  const api = window.NEXORA_SERVICE_APPROVAL_SETTINGS;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $ = selector => panel.querySelector(selector);
  const clone = value => JSON.parse(JSON.stringify(value));
  const currentSalon = window.NEXORA_SALON_DATA.loadCatalog().salon;
  let base = [], categories = [], categoryDraft = [], editing = null, returnFocus = null, dragged = null, imageData = '', tags = [];
  const uid = () => 'custom-' + (window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));
  const icon = name => '<i class="bi bi-' + name + '" aria-hidden="true"></i>';
  const button = (attr, label, glyph, cls = '') => '<button type="button" '+attr+' class="'+cls+'">'+(glyph?icon(glyph):'')+label+'</button>';
  panel.innerHTML = `
    <div class="salon-service-toolbar"><div>${button('data-categories-open disabled','Manage Categories','diagram-3')}</div>${button('data-services-save disabled','Save','check-circle-fill','is-primary')}</div>
    <p class="salon-service-status" role="status" data-approval-status></p>
    <div class="salon-services" data-approval-services><p class="salon-empty">Loading services…</p></div>
    <div class="salon-service-overlay" data-category-editor hidden><section class="salon-service-dialog" role="dialog" aria-modal="true" aria-labelledby="category-editor-title">
      <header><div><h2 id="category-editor-title">Manage Categories</h2><p>Add, rename, delete, or reorder categories, then save all changes at once.</p></div>${button('data-category-close aria-label="Close categories"','×')}</header>
      <div class="salon-dialog-body"><section class="salon-category-manager"><div class="salon-category-toolbar"><strong>${icon('diagram-3')}Categories</strong>${button('data-category-add','Add Category','plus','is-small')}</div><p class="salon-help">Drag categories to change their display order. Use Alt + arrow keys to reorder.</p><div data-category-list></div></section><p role="alert" class="salon-service-error" data-category-error hidden></p></div>
      <footer>${button('data-category-close','Cancel')}${button('data-category-save','Save','check-circle-fill','is-primary')}</footer>
    </section></div>
    <div class="salon-service-overlay" data-service-editor hidden><section class="salon-service-dialog" role="dialog" aria-modal="true" aria-labelledby="service-editor-title">
      <header><div><h2 id="service-editor-title">Edit Service</h2><p>Update the service details and categories.</p></div>${button('data-service-editor-close aria-label="Close service editor"','×')}</header>
      <form data-service-editor-form><div class="salon-dialog-body">
        <label class="salon-field-label">Categories <small>(required)</small></label><div class="salon-category-choices" data-service-edit-categories></div><p class="salon-help">Select at least one category.</p>
        <div class="salon-label-row"><label for="service-edit-name">Service name <small>(required)</small></label><label class="salon-active-toggle">Active<input type="checkbox" data-service-edit-active><span></span></label></div>
        <input id="service-edit-name" data-service-edit-name required maxlength="120">
        <div class="salon-service-fields"><label>Price <small>(required)</small><span class="salon-input-wrap"><span>$</span><input data-service-edit-price type="number" min="0" step="0.01" required></span></label><label>Minutes <small>(required)</small><span class="salon-input-wrap suffix"><input data-service-edit-duration type="number" min="1" step="1" required><span>min</span></span></label></div>
        <label class="salon-block-field">Description <small>(optional)</small><textarea data-service-edit-description maxlength="1000" rows="3" placeholder="Optional service description"></textarea></label><div class="salon-description-count" data-description-count>0/1000</div>
        <label class="salon-block-field">Supply Fee <small>(optional)</small><span class="salon-input-wrap"><span>$</span><input type="number" data-service-edit-fee min="0" step="0.01"></span></label>
        <label class="salon-block-field">Tags <small>(optional)</small><div class="salon-tag-list" data-tag-list></div><input data-service-edit-tags placeholder="Type a tag and press Enter" maxlength="60"></label>
        <label class="salon-service-approval"><input type="checkbox" data-service-approval><span><strong>Require approval when staff adds this service</strong><small>Customer enters the last 4 phone digits to approve. Off by default.</small></span></label>
        <label class="salon-field-label">Service image <small>(optional)</small></label><div class="salon-service-image" data-image-preview>${icon('image')}</div>
        <div class="salon-photo-actions"><label>${icon('camera')}Take photo<input type="file" data-service-photo accept="image/jpeg,image/png,image/webp" capture="environment"></label><label>${icon('folder2-open')}Choose file<input type="file" data-service-file accept="image/jpeg,image/png,image/webp"></label></div><p class="salon-help">Upload a clear photo that represents this service.<br>JPG, JPEG, PNG, or WebP.<br>Maximum file size is 10MB.</p>

        <p class="salon-service-error" role="alert" data-service-edit-error hidden></p>
      </div><footer>${button('data-service-editor-close','Cancel')}<button type="submit" class="is-primary">${icon('check-circle-fill')}Save changes</button></footer></form>
    </section></div>`;
  const selectedSalon = currentSalon.id;
  function status(message) {$('[data-approval-status]').textContent=message;}
  function markDirty() {status('Unsaved changes');}
  function serviceById(id) {for(const category of categories){const service=category.services.find(s=>s.id===id);if(service)return service;}}
  function eachService(id, change) {categories.forEach(c=>c.services.filter(s=>s.id===id).forEach(change));}
  function render() {
    const open = new Set(Array.from(panel.querySelectorAll('[data-service-category][open]')).map(c=>c.dataset.serviceCategory));
    $('[data-approval-services]').innerHTML=categories.map((c,index)=>`<details class="settings-service-category" data-service-category="${esc(c.id)}"${open.has(c.id)||!open.size?' open':''}>
      <summary class="settings-service-category-head"><span class="settings-service-category-name">${esc(c.name)}</span><span class="settings-service-category-count">${c.services.filter(s=>!s.isDraft).length} services</span>${button('data-service-add="'+esc(c.id)+'"','Add Service','plus','salon-service-add')}<i class="bi bi-chevron-down settings-service-category-chevron" aria-hidden="true"></i></summary>
      <div class="settings-service-category-body"><div class="settings-service-header" aria-hidden="true"><span></span><span></span><span>Service</span><span>Price</span><span>Duration</span><span>Status</span><span></span><span></span></div>${c.services.map(s=>`<div class="settings-service-row${s.isDraft?' is-draft':''}" data-salon-service-row="${esc(s.id)}" data-row-category="${esc(c.id)}">
        ${button('data-service-drag="'+esc(s.id)+'" draggable="true" aria-label="Reorder '+esc(s.name||'service')+'" title="Drag or use Alt + arrow keys"','', 'grip-vertical','salon-drag')}
        <span class="settings-service-visual">${safeImage(s.image)?'<img alt="" src="'+esc(s.image)+'">':icon('image')}</span>
        <input data-inline-field="name" aria-label="Service name" placeholder="e.g. Gel manicure" value="${esc(s.name)}"${s.id==='__custom__'?' disabled':''}>
        <span class="salon-input-wrap"><span>$</span><input data-inline-field="price" aria-label="Service price" type="number" min="0" step="0.01" placeholder="0.00" value="${esc(s.price??'')}"${s.id==='__custom__'?' disabled':''}></span>
        <span class="salon-input-wrap suffix"><input data-inline-field="durationMin" aria-label="Service duration" type="number" min="1" step="1" value="${esc(s.durationMin??'')}"${s.id==='__custom__'?' disabled':''}><span>min</span></span>
        <span class="salon-status-pill${s.active===false?' is-inactive':''}">${s.active===false?'Inactive':'Active'}</span>
        ${button('data-salon-service-edit="'+esc(s.id)+'" aria-label="View / Edit '+esc(s.name||'service')+'" title="View / Edit"','','pencil','salon-row-action')}
        ${button('data-service-remove="'+esc(s.id)+'" aria-label="Remove '+esc(s.name||'service')+'"','','x-lg','salon-row-action')}
      </div>`).join('')}</div></details>`).join('')||'<p class="salon-empty">No categories yet. Use Manage Categories to add one.</p>';
  }
  function safeImage(value) {return typeof value==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(value);}
  function valid(list) {
    if(list.some(c=>!c.name.trim()))return 'Enter a name for every category.';
    const invalid=list.flatMap(c=>c.services).find(s=>s.id!=='__custom__'&&(!s.name.trim()||s.price==null||s.price===''||!Number.isFinite(Number(s.price))||Number(s.price)<0||!Number.isInteger(Number(s.durationMin))||Number(s.durationMin)<1));
    return invalid?'Enter a service name, valid price, and duration of at least 1 minute.':'';
  }
  function persist(next, approvals) {
    const message=valid(next);if(message)throw new Error(message);
    next.forEach(c=>{c.name=c.name.trim();c.services.forEach(s=>{delete s.isDraft;s.name=s.name.trim();if(s.id!=='__custom__'){s.price=Number(s.price);s.durationMin=Number(s.durationMin);}});});
    try {api.saveCatalog(selectedSalon,next,approvals);} catch(failure) {throw new Error('Unable to save changes. Please try again or use a smaller service image.');}categories=next;status('Saved.');render();
  }
  function show(overlay, trigger) {returnFocus=trigger||document.activeElement;overlay.hidden=false;document.body.style.overflow='hidden';const control=overlay.querySelector('input:not(:disabled),button');if(control)control.focus();}
  function close(overlay) {overlay.hidden=true;document.body.style.overflow='';if(returnFocus?.isConnected)returnFocus.focus();if(overlay===$('[data-service-editor]'))editing=null;}
  function renderCategories() {
    $('[data-category-list]').innerHTML=categoryDraft.map(c=>'<div class="salon-category-row'+(c.isDraft?' is-draft':'')+'" data-category-row="'+esc(c.id)+'">'+button('data-category-drag="'+esc(c.id)+'" draggable="true" aria-label="Reorder '+esc(c.name||'category')+'" title="Drag or use Alt + arrow keys"','','grip-vertical','salon-drag')+'<input data-category-name="'+esc(c.id)+'" aria-label="Category name" placeholder="Category name" value="'+esc(c.name)+'">'+(c.isDraft?'':'<span class="settings-service-category-count">'+c.services.length+' services</span>')+button('data-category-remove="'+esc(c.id)+'" aria-label="Remove '+esc(c.name||'category')+'"','','x-lg')+'</div>').join('');
  }
  function renderTags() {$('[data-tag-list]').innerHTML=tags.map((tag,index)=>'<span>'+esc(tag)+button('data-remove-tag="'+index+'" aria-label="Remove tag '+esc(tag)+'"','×')+'</span>').join('');}
  function renderImage() {$('[data-image-preview]').innerHTML=safeImage(imageData)?'<img src="'+esc(imageData)+'" alt="Service image preview">'+button('data-image-remove aria-label="Remove service image"','×'):icon('image');}
  function openService(id,trigger) {
    const service=serviceById(id);if(!service)return;editing={id,token:uid()};
    $('[data-service-edit-categories]').innerHTML=categories.map(c=>'<label><input type="checkbox" data-service-category-choice="'+esc(c.id)+'"'+(c.services.some(s=>s.id===id)?' checked':'')+'>'+esc(c.name)+'</label>').join('');
    for(const [field,key] of [['name','name'],['price','price'],['duration','durationMin'],['description','description'],['fee','supplyFee']]){$('[data-service-edit-'+field+']').value=service[key]??'';$('[data-service-edit-'+field+']').disabled=id==='__custom__';}
    $('[data-service-edit-active]').checked=service.active!==false;
    $('[data-service-approval]').checked=api.requiresApproval(selectedSalon,id);
    $('[data-description-count]').textContent=(service.description||'').length+'/1000';
    $('[data-service-editor-form] [type=submit]').disabled=false;
    $('[data-service-edit-error]').hidden=true;tags=(service.tags||[]).slice();imageData=service.image||'';
    $('[data-service-edit-tags]').value='';$('[data-service-photo]').value='';$('[data-service-file]').value='';renderTags();renderImage();show($('[data-service-editor]'),trigger);
  }
  function error(message) {$('[data-service-edit-error]').textContent=message;$('[data-service-edit-error]').hidden=false;}
  panel.addEventListener('input',event=>{
    const field=event.target;
    if(field.matches('[data-inline-field]')){const id=field.closest('[data-salon-service-row]').dataset.salonServiceRow;eachService(id,s=>{s[field.dataset.inlineField]=field.value;});markDirty();}
    if(field.matches('[data-category-name]'))categoryDraft.find(c=>c.id===field.dataset.categoryName).name=field.value;
    if(field.matches('[data-service-edit-description]'))$('[data-description-count]').textContent=field.value.length+'/1000';
  });
  panel.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target)return;
    if(target.matches('[data-services-save]')){try{persist(clone(categories));}catch(failure){status(failure.message);}return;}
    if(target.matches('[data-categories-open]')){categoryDraft=clone(categories);$('[data-category-error]').hidden=true;renderCategories();show($('[data-category-editor]'),target);return;}
    if(target.matches('[data-category-close]')){close($('[data-category-editor]'));return;}
    if(target.matches('[data-category-add]')){categoryDraft.push({id:uid(),name:'',services:[],isDraft:true});renderCategories();$('[data-category-list]').lastElementChild.querySelector('input').focus();return;}
    if(target.matches('[data-category-remove]')){const c=categoryDraft.find(c=>c.id===target.dataset.categoryRemove);if(c.services.length&&!window.confirm('Remove category "'+c.name+'" and its service entries?'))return;categoryDraft=categoryDraft.filter(c=>c.id!==target.dataset.categoryRemove);renderCategories();return;}
    if(target.matches('[data-category-save]')){try{const next=clone(categoryDraft);next.forEach(c=>{c.name=c.name.trim();delete c.isDraft;});persist(next);close($('[data-category-editor]'));}catch(failure){$('[data-category-error]').textContent=failure.message;$('[data-category-error]').hidden=false;}return;}
    if(target.matches('[data-service-add]')){event.preventDefault();const c=categories.find(c=>c.id===target.dataset.serviceAdd);c.services.push({id:uid(),name:'',price:'',durationMin:45,active:true,isDraft:true});markDirty();render();const category=Array.from(panel.querySelectorAll('[data-service-category]')).find(el=>el.dataset.serviceCategory===c.id);category.open=true;category.querySelector('.settings-service-row:last-child [data-inline-field="name"]').focus();return;}
    if(target.matches('[data-salon-service-edit]')){openService(target.dataset.salonServiceEdit,target);return;}
    if(target.matches('[data-service-editor-close]')){close($('[data-service-editor]'));return;}
    if(target.matches('[data-service-remove]')){const id=target.dataset.serviceRemove,s=serviceById(id);if(!s.isDraft&&!window.confirm('Remove "'+s.name+'" from this category?'))return;const c=categories.find(c=>c.id===target.closest('[data-row-category]').dataset.rowCategory);c.services=c.services.filter(s=>s.id!==id);markDirty();render();return;}
    if(target.matches('[data-remove-tag]')){tags.splice(Number(target.dataset.removeTag),1);renderTags();return;}
    if(target.matches('[data-image-remove]')){imageData='';renderImage();}
  });
  $('[data-service-editor-form]').addEventListener('submit',event=>{
    event.preventDefault();if(!editing)return;
    const service=serviceById(editing.id),isCustom=editing.id==='__custom__';
    const categoryIds=Array.from(panel.querySelectorAll('[data-service-category-choice]:checked')).map(c=>c.dataset.serviceCategoryChoice);
    if(!categoryIds.length){error('Select at least one category.');return;}
    const fee=$('[data-service-edit-fee]').value;
    if(fee!==''&&(!Number.isFinite(Number(fee))||Number(fee)<0)){error('Supply fee must be zero or greater.');return;}
    const tag=$('[data-service-edit-tags]').value.trim();if(tag&&!tags.includes(tag))tags.push(tag);
    const updated=Object.assign({},service,isCustom?{}:{name:$('[data-service-edit-name]').value.trim(),price:$('[data-service-edit-price]').value===''?'':Number($('[data-service-edit-price]').value),durationMin:Number($('[data-service-edit-duration]').value),description:$('[data-service-edit-description]').value,supplyFee:fee===''?null:Number(fee),tags:tags.slice(),image:imageData},{active:$('[data-service-edit-active]').checked});
    const next=clone(categories).map(c=>{const index=c.services.findIndex(s=>s.id===service.id);c.services=c.services.filter(s=>s.id!==service.id);if(categoryIds.includes(c.id))c.services.splice(index<0?c.services.length:index,0,clone(updated));return c;});
    const approvals=new Set(api.load(selectedSalon));if($('[data-service-approval]').checked)approvals.add(service.id);else approvals.delete(service.id);
    try{persist(next,Array.from(approvals));close($('[data-service-editor]'));const trigger=Array.from(panel.querySelectorAll('[data-salon-service-edit]')).find(b=>b.dataset.salonServiceEdit===service.id);if(trigger){trigger.closest('details').open=true;trigger.focus();}}catch(failure){error(failure.message);}
  });
  $('[data-service-edit-tags]').addEventListener('keydown',event=>{if(event.key!=='Enter')return;event.preventDefault();const tag=event.target.value.trim();if(tag&&!tags.includes(tag))tags.push(tag);event.target.value='';renderTags();});
  panel.addEventListener('change',event=>{
    if(!event.target.matches('[data-service-photo],[data-service-file]'))return;
    const file=event.target.files[0];if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){error('Choose a JPG, PNG, or WebP image up to 10MB.');return;}
    const token=editing?.token;const reader=new FileReader();
    $('[data-service-editor-form] [type=submit]').disabled=true;
    reader.onload=()=>{if(editing?.token!==token)return;imageData=reader.result;renderImage();$('[data-service-editor-form] [type=submit]').disabled=false;};reader.onerror=()=>{if(editing?.token!==token)return;$('[data-service-editor-form] [type=submit]').disabled=false;error('Unable to read this image. Please try again.');};reader.readAsDataURL(file);
  });
  function move(kind,id,offset,targetId,categoryId) {
    const list=kind==='category'?categoryDraft:categories.find(c=>c.id===categoryId)?.services;if(!list)return;
    const from=list.findIndex(item=>item.id===id),to=targetId?list.findIndex(item=>item.id===targetId):from+offset;
    if(from<0||to<0||to>=list.length)return;list.splice(to,0,list.splice(from,1)[0]);
    if(kind==='category')renderCategories();else{markDirty();render();}
  }
  panel.addEventListener('dragstart',event=>{const handle=event.target.closest('[data-category-drag],[data-service-drag]');if(!handle)return;dragged={kind:handle.hasAttribute('data-category-drag')?'category':'service',id:handle.dataset.categoryDrag||handle.dataset.serviceDrag,categoryId:handle.closest('[data-row-category]')?.dataset.rowCategory};event.dataTransfer?.setData('text/plain',dragged.id);});
  panel.addEventListener('dragover',event=>{if(dragged&&event.target.closest('[data-category-row],[data-salon-service-row]'))event.preventDefault();});
  panel.addEventListener('drop',event=>{if(!dragged)return;const row=event.target.closest(dragged.kind==='category'?'[data-category-row]':'[data-salon-service-row]');if(!row)return;event.preventDefault();if(dragged.kind==='category'||row.dataset.rowCategory===dragged.categoryId)move(dragged.kind,dragged.id,0,row.dataset.categoryRow||row.dataset.salonServiceRow,dragged.categoryId);dragged=null;});
  panel.addEventListener('dragend',()=>{dragged=null;});
  panel.addEventListener('keydown',event=>{
    const handle=event.target.closest('[data-category-drag],[data-service-drag]');
    if(handle&&event.altKey&&['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();const category=handle.hasAttribute('data-category-drag'),id=handle.dataset.categoryDrag||handle.dataset.serviceDrag;move(category?'category':'service',id,event.key==='ArrowUp'?-1:1,null,handle.closest('[data-row-category]')?.dataset.rowCategory);Array.from(panel.querySelectorAll(category?'[data-category-drag]':'[data-service-drag]')).find(b=>(b.dataset.categoryDrag||b.dataset.serviceDrag)===id)?.focus();}
  });
  panel.querySelectorAll('.salon-service-overlay').forEach(overlay=>{
    overlay.addEventListener('click',event=>{if(event.target===overlay)close(overlay);});
    overlay.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();close(overlay);return;}if(event.key!=='Tab')return;
      const controls=Array.from(overlay.querySelectorAll('button,input,textarea')).filter(c=>!c.disabled&&c.type!=='file');const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
  });
  window.NEXORA_APPOINTMENT_SERVICE_CATALOG.load('../menu/menu.json').then(catalog=>{
    base=catalog.categories.map(c=>({id:c.id,name:c.name,services:c.services.filter(s=>s.type!=='add-on').map(s=>Object.assign({},s,{durationMin:s.durationMin||45}))})).filter(c=>c.services.length);
    base.push({id:'custom-service-settings',name:'Other services',services:[{id:'__custom__',name:'Custom service'}]});
    categories=api.loadCatalog(selectedSalon,base);render();$('[data-services-save]').disabled=false;$('[data-categories-open]').disabled=false;
  }).catch(()=>{$('[data-approval-services]').textContent='Unable to load services. Reload to try again.';});
})();
