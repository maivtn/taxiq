(function () {
  'use strict';
  function mount(panel, options = {}) {
  const api = options.api || window.NEXORA_SERVICE_APPROVAL_SETTINGS;
  if (!panel || !api) return null;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $ = selector => panel.querySelector(selector);
  const clone = value => JSON.parse(JSON.stringify(value));
  const currentSalon = options.salon || window.NEXORA_SALON_DATA.loadCatalog().salon;
  const menu = options.catalogType === 'menu';
  const text = menu ? {
    search:'Search menu items...', loading:'Loading menu items…', noun:'item', count:'items', add:'Add item', newTitle:'New item', editTitle:'Edit item', addSave:'Add item', name:'Item name', image:'Item image', placeholder:'Item name', description:'Optional item description',
    newIntro:'Enter the item details, then choose one or more categories.', editIntro:'Update the item details and categories.', empty:'No items in this category yet.', noMatch:'No menu items match your search.', invalid:'Enter an item name and a valid price.', loadFailed:'Unable to load menu items. Reload to try again.'
  } : {
    search:'Search services...', loading:'Loading services…', noun:'service', count:'services', add:'Add Service', newTitle:'New Service', editTitle:'Edit Service', addSave:'Add service', name:'Service name', image:'Service image', placeholder:'e.g. Gel manicure', description:'Optional service description',
    newIntro:'Enter the service details, then choose one or more categories.', editIntro:'Update the service details and categories.', empty:'No services in this category yet.', noMatch:'No services match your search.', invalid:'Enter a service name, valid price, and duration of at least 1 minute.', loadFailed:'Unable to load services. Reload to try again.'
  };
  if(menu)panel.setAttribute('data-menu-catalog','');
  const lifecycle = new AbortController();
  let destroyed = false, loaded = false, query = '', categoryFilter = '', serviceView = 'list', priorOverflow = '';
  let base = [], categories = [], categoryDraft = [], editing = null, returnFocus = null, dragged = null, imageData = '', tags = [];
  const uid = () => 'custom-' + (window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));
  const icon = name => '<i class="bi bi-' + name + '" aria-hidden="true"></i>';
  const button = (attr, label, glyph, cls = '') => '<button type="button" '+attr+' class="'+cls+'">'+(glyph?icon(glyph):'')+label+'</button>';
  const richToolbar = label => '<div class="salon-rich-toolbar" role="group" aria-label="'+esc(label)+' formatting">'+[['bold','Bold','type-bold'],['italic','Italic','type-italic'],['underline','Underline','type-underline'],['insertOrderedList','Numbered list','list-ol'],['insertUnorderedList','Bulleted list','list-ul'],['removeFormat','Clear formatting','eraser']].map(([command,name,glyph])=>button('data-rich-command="'+command+'" aria-label="'+name+'" title="'+name+'"','',glyph)).join('')+'</div>';
  panel.innerHTML = `
    ${options.onboarding ? '<div class="salon-service-browser"><label class="salon-service-search">'+icon('search')+'<input type="search" data-service-search placeholder="'+text.search+'" aria-label="'+text.search+'"></label><div class="salon-service-view" role="group" aria-label="'+(menu?'Menu view':'Service view')+'">'+button('data-service-view="card" aria-pressed="false"','Card view','grid')+button('data-service-view="list" aria-pressed="true"','List view','list-ul')+'</div></div><div class="salon-service-filters" role="group" aria-label="Categories" data-service-filters></div>' : ''}
    <div class="salon-service-toolbar"><div>${button('data-categories-open disabled','Manage Categories','diagram-3')}</div>${button('data-services-save disabled','Save','check-circle-fill','is-primary')}</div>
    <p class="salon-service-status" role="status" data-approval-status></p>
    <div class="salon-services" data-approval-services><p class="salon-empty">${text.loading}</p></div>
    <div class="salon-service-overlay" data-category-editor hidden><section class="salon-service-dialog" role="dialog" aria-modal="true" aria-labelledby="category-editor-title">
      <header><div><h2 id="category-editor-title">Manage Categories</h2><p>Add, rename, delete, or reorder categories, then save all changes at once.</p></div>${button('data-category-close aria-label="Close categories"','×')}</header>
      <div class="salon-dialog-body"><section class="salon-category-manager"><div class="salon-category-toolbar"><strong>${icon('diagram-3')}Categories</strong>${button('data-category-add','Add Category','plus','is-small')}</div><p class="salon-help">Drag categories to change their display order. Use Alt + arrow keys to reorder.</p><div data-category-list></div></section><p role="alert" class="salon-service-error" data-category-error hidden></p></div>
      <footer>${button('data-category-close','Cancel')}${button('data-category-save','Save','check-circle-fill','is-primary')}</footer>
    </section></div>
    <div class="salon-service-overlay" data-service-editor hidden><section class="salon-service-dialog" role="dialog" aria-modal="true" aria-labelledby="service-editor-title">
      <header><div><h2 id="service-editor-title">${text.editTitle}</h2><p>${text.editIntro}</p></div>${button('data-service-editor-close aria-label="Close '+text.noun+' editor"','×')}</header>
      <form data-service-editor-form><div class="salon-dialog-body">
        <label for="service-edit-categories" class="salon-field-label">Categories <small>(required)</small></label><div class="salon-category-select"><select id="service-edit-categories" data-service-edit-categories multiple aria-required="true" placeholder="Select categories"></select></div><p class="salon-help">Select at least one category.</p>
        <div class="salon-service-overview">
          <div class="salon-service-overview-photo">
        <label class="salon-field-label">${text.image} <small>(optional)</small></label><div class="salon-service-photo-field"><div class="salon-service-image" data-image-preview>${icon('image')}</div>
        <div class="salon-service-photo-controls"><div class="salon-photo-actions"><label>${icon('camera')}Take photo<input type="file" data-service-photo accept="image/jpeg,image/png,image/webp" capture="environment"></label><label>${icon('folder2-open')}Choose image<input type="file" data-service-file accept="image/jpeg,image/png,image/webp"></label></div><p class="salon-help">JPG, PNG, WebP · Up to 10MB</p></div></div>
          </div>
          <div class="salon-service-overview-fields">
        <div class="salon-label-row"><label for="service-edit-name">${text.name} <small>(required)</small></label><label class="salon-active-toggle">Active<input type="checkbox" data-service-edit-active><span></span></label></div>
        <input id="service-edit-name" data-service-edit-name required maxlength="120">
        <div class="salon-service-fields"><label>Price <small>(required)</small><span class="salon-input-wrap"><span>$</span><input data-service-edit-price type="number" min="0" step="0.01" required></span></label><label>Minutes <small>(required)</small><span class="salon-input-wrap suffix"><input data-service-edit-duration type="number" min="1" step="1" required><span>min</span></span></label></div>
        <label class="salon-block-field">Supply Fee <small>(optional)</small><span class="salon-input-wrap"><span>$</span><input type="number" data-service-edit-fee min="0" step="0.01"></span></label>
          </div>
        </div>
        <label class="salon-block-field">Description <small>(optional)</small><textarea data-service-edit-description maxlength="1000" rows="3" placeholder="${text.description}"></textarea></label><div class="salon-description-count" data-description-count>0/1000</div>
        <label class="salon-block-field">Tags <small>(optional)</small><div class="salon-tag-list" data-tag-list></div><input data-service-edit-tags placeholder="Type a tag and press Enter" maxlength="60"></label>
        <label class="salon-service-approval"><input type="checkbox" data-service-approval><span><strong>Require approval when staff adds this service</strong><small>Customer enters the last 4 phone digits to approve. Off by default.</small></span></label>


        <section class="salon-service-steps" aria-labelledby="service-steps-label">
          <div class="salon-steps-heading"><h3 id="service-steps-label">Steps <small>(optional)</small></h3></div>
          <p class="salon-help">Add the steps in the order they should be performed. Each step has its own image, title, and description.</p>
          <div data-service-steps></div>
          ${button('data-step-add','Add step','plus','salon-step-add')}
        </section>
        <label id="service-materials-label" class="salon-block-field">Materials <small>(optional)</small></label>
        <div class="salon-rich-editor">${richToolbar('Materials')}<div class="salon-rich-content" data-service-materials data-rich-editor contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="service-materials-label" data-placeholder="List materials, quantities, and usage notes…"></div></div>
        <p class="salon-help">Materials apply to the whole service.</p>

        <p class="salon-service-error" role="alert" data-service-edit-error hidden></p>
      </div><footer>${button('data-service-editor-close','Cancel')}<button type="submit" class="is-primary">${icon('check-circle-fill')}Save changes</button></footer></form>
    </section></div>`;
  if (options.onboarding) {
    const body = $('[data-service-editor-form] .salon-dialog-body');
    const categoryLabel = body.querySelector('label[for="service-edit-categories"]');
    const categorySelect = body.querySelector('.salon-category-select');
    const categoryHelp = categorySelect.nextElementSibling;
    const fee = body.querySelector('[data-service-edit-fee]').closest('label');
    fee.before(categoryLabel, categorySelect, categoryHelp);
    body.querySelector('.salon-service-steps').hidden = true;
    body.querySelector('#service-materials-label').hidden = true;
    body.querySelector('.salon-rich-editor').hidden = true;
    body.querySelector('.salon-rich-editor').nextElementSibling.hidden = true;
  }
  if(menu){
    $('[data-service-edit-duration]').closest('label').hidden=true;
    $('[data-service-edit-duration]').required=false;
    $('[data-service-edit-fee]').closest('label').hidden=true;
    $('.salon-service-approval').hidden=true;
  }
  let richRanges = new WeakMap(), pendingStepImages = new Set(), coverLoading = false;
  function updateImageBusy() {
    $('[data-service-editor-form] [type=submit]').disabled=pendingStepImages.size>0||coverLoading;
  }
  function safeDetailImage(value) {
    if(typeof value!=='string'||value.length>14*1024*1024||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))return false;
    try {
      const bytes=atob(value.split(',')[1]);
      if(bytes.length>10*1024*1024)return false;
      return value.startsWith('data:image/png;')?bytes.startsWith('\x89PNG\r\n\x1a\n'):value.startsWith('data:image/jpeg;')?bytes.startsWith('\xff\xd8\xff'):bytes.startsWith('RIFF')&&bytes.slice(8,12)==='WEBP';
    }catch(failure){return false;}
  }
  function renumberSteps() {
    panel.querySelectorAll('[data-service-step]').forEach((card,index)=>{
      card.setAttribute('aria-label','Step '+(index+1));
      card.querySelector('[data-step-drag]').setAttribute('aria-label','Reorder step '+(index+1));
      card.querySelector('[data-step-remove]').setAttribute('aria-label','Remove step '+(index+1));
    });
  }
  function appendStep(step={}) {
    const card=document.createElement('section'),id=uid();card.className='salon-step-card';card.dataset.serviceStep=id;
    card.innerHTML=`<header>${button('data-step-drag draggable="true" title="Drag to reorder. Alt + arrow keys to move."','','grip-vertical','salon-step-drag')}${button('data-step-remove','Remove','trash','salon-step-remove')}</header>
      <div class="salon-step-layout"><div class="salon-step-photo"><label class="salon-field-label">Image</label><div data-step-image-preview></div>
      ${button('data-step-image-take','Take photo','camera')}${button('data-step-image-add','Choose image','folder2-open')}${button('data-step-image-remove hidden','Remove image')}
      <input type="file" data-step-image-camera accept="image/jpeg,image/png,image/webp" capture="environment" hidden><input type="file" data-step-image-file accept="image/jpeg,image/png,image/webp" hidden><p class="salon-help">JPG, PNG, WebP · Up to 10MB</p><p class="salon-help" role="status" data-step-image-status></p></div>
      <div class="salon-step-copy"><label class="salon-field-label" for="step-title-${id}">Title</label><input id="step-title-${id}" data-step-title maxlength="120" placeholder="e.g. Prepare the nails">
      <label for="step-description-${id}" class="salon-block-field">Description</label><textarea id="step-description-${id}" data-step-description rows="5" placeholder="Describe what to do in this step…"></textarea></div></div>`;
    card.querySelector('[data-step-title]').value=typeof step.title==='string'?step.title:'';
    const legacy=document.createElement('template');legacy.innerHTML=cleanDetails(step.descriptionHtml);
    card.dataset.legacyDescription=cleanDetails(step.legacyDescriptionHtml||step.descriptionHtml);
    legacy.content.querySelectorAll('br').forEach(node=>node.replaceWith('\n'));
    legacy.content.querySelectorAll('p,div,li').forEach(node=>node.append('\n'));
    card.querySelector('[data-step-description]').value=typeof step.description==='string'?step.description:legacy.content.textContent.trim();
    $('[data-service-steps]').appendChild(card);setStepImage(card,safeDetailImage(step.image)?step.image:'');renumberSteps();return card;
  }
  let draggedStep=null;
  function clearStepDrag() {
    panel.querySelectorAll('.is-step-dragging,.step-drop-before,.step-drop-after').forEach(card=>card.classList.remove('is-step-dragging','step-drop-before','step-drop-after'));
    draggedStep=null;
  }
  function stepDropTarget(event) {
    const card=event.target.closest('[data-service-step]');
    return draggedStep&&card&&card!==draggedStep&&card.parentElement===draggedStep.parentElement?card:null;
  }
  panel.addEventListener('dragstart',event=>{
    const handle=event.target.closest('[data-step-drag]');if(!handle)return;
    if(!editing||editing.id==='__custom__'||handle.disabled){event.preventDefault();return;}
    clearStepDrag();draggedStep=handle.closest('[data-service-step]');draggedStep.classList.add('is-step-dragging');
    if(event.dataTransfer){event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',draggedStep.dataset.serviceStep);event.dataTransfer.setDragImage?.(draggedStep,20,20);}
  });
  panel.addEventListener('dragover',event=>{
    const card=stepDropTarget(event);if(!card)return;event.preventDefault();
    panel.querySelectorAll('.step-drop-before,.step-drop-after').forEach(node=>node.classList.remove('step-drop-before','step-drop-after'));
    const rect=card.getBoundingClientRect();card.classList.add(event.clientY<rect.top+rect.height/2?'step-drop-before':'step-drop-after');
    if(event.dataTransfer)event.dataTransfer.dropEffect='move';
    const body=card.closest('.salon-dialog-body'),bounds=body.getBoundingClientRect();
    if(event.clientY<bounds.top+40)body.scrollTop-=12;else if(event.clientY>bounds.bottom-40)body.scrollTop+=12;
  });
  panel.addEventListener('drop',event=>{
    if(!draggedStep)return;event.preventDefault();
    const card=stepDropTarget(event),moving=draggedStep;
    if(card){const rect=card.getBoundingClientRect();card.parentElement.insertBefore(moving,event.clientY<rect.top+rect.height/2?card:card.nextSibling);renumberSteps();}
    clearStepDrag();moving.querySelector('[data-step-drag]').focus();
  });
  panel.addEventListener('dragend',clearStepDrag);
  panel.addEventListener('keydown',event=>{
    const handle=event.target.closest('[data-step-drag]');
    if(!handle||handle.disabled||!event.altKey||!['ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();const card=handle.closest('[data-service-step]'),up=event.key==='ArrowUp',neighbor=up?card.previousElementSibling:card.nextElementSibling;
    if(neighbor){card.parentElement.insertBefore(card,up?neighbor:neighbor.nextSibling);renumberSteps();handle.focus();}
  });
  function setStepImage(card,src) {
    card.dataset.image=src;card.querySelector('[data-step-image-preview]').innerHTML=src?'<img src="'+esc(src)+'" alt="Step illustration">':'<span class="salon-step-image-empty">'+icon('image')+'</span>';
    card.querySelector('[data-step-image-remove]').hidden=!src;
  }
  function collectSteps() {
    return Array.from(panel.querySelectorAll('[data-service-step]'),card=>({title:card.querySelector('[data-step-title]').value.trim(),description:card.querySelector('[data-step-description]').value,...(card.dataset.legacyDescription?{legacyDescriptionHtml:card.dataset.legacyDescription}:{}),image:safeDetailImage(card.dataset.image)?card.dataset.image:''}));
  }
  function readStepImage(card,file) {
    if(!editing||editing.id==='__custom__'||!file||card.dataset.loading==='true')return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){error('Choose a JPG, PNG, or WebP image up to 10MB.');return;}
    const token=editing.token,job={},reader=new FileReader();pendingStepImages.add(job);card.dataset.loading='true';
    card.querySelector('[data-step-image-status]').textContent='Adding image…';card.querySelector('[data-step-image-add]').disabled=true;card.querySelector('[data-step-image-take]').disabled=true;card.querySelector('[data-step-image-remove]').disabled=true;updateImageBusy();
    const active=()=>editing?.token===token&&card.isConnected;
    const finish=()=>{if(editing?.token!==token)return;pendingStepImages.delete(job);card.dataset.loading='false';card.querySelector('[data-step-image-status]').textContent='';card.querySelector('[data-step-image-add]').disabled=false;card.querySelector('[data-step-image-take]').disabled=false;card.querySelector('[data-step-image-remove]').disabled=false;updateImageBusy();};
    reader.onload=()=>{if(active()){if(safeDetailImage(reader.result)){setStepImage(card,reader.result);$('[data-service-edit-error]').hidden=true;}else error('This image could not be read. Choose a valid JPG, PNG, or WebP image.');}finish();};
    reader.onerror=()=>{if(active())error('Unable to read the image. Please try again.');finish();};reader.readAsDataURL(file);
  }
  panel.addEventListener('click',event=>{
    const control=event.target.closest('[data-step-add],[data-step-remove],[data-step-image-take],[data-step-image-add],[data-step-image-remove]');
    if(!control||!editing||editing.id==='__custom__')return;
    if(control.hasAttribute('data-step-add')){appendStep().querySelector('[data-step-title]').focus();return;}
    const card=control.closest('[data-service-step]');
    if(control.hasAttribute('data-step-remove')){card.remove();if(!$('[data-service-steps]').children.length)appendStep();renumberSteps();return;}
    if(control.hasAttribute('data-step-image-remove')){setStepImage(card,'');return;}
    const input=card.querySelector(control.hasAttribute('data-step-image-take')?'[data-step-image-camera]':'[data-step-image-file]');input.value='';input.click();
  });
  panel.addEventListener('change',event=>{if(event.target.matches('[data-step-image-file],[data-step-image-camera]'))readStepImage(event.target.closest('[data-service-step]'),event.target.files[0]);});
  function cleanDetails(html) {
    const template = document.createElement('template');
    template.innerHTML = typeof html === 'string' ? html : '';
    const allowed = new Set(['P','DIV','BR','B','STRONG','I','EM','U','OL','UL','LI','IMG']);
    function clean(parent) {
      Array.from(parent.childNodes).forEach(node => {
        if (node.nodeType === 3) return;
        if (node.nodeType !== 1 || ['SCRIPT','STYLE','IFRAME','OBJECT','SVG','MATH','TEMPLATE'].includes(node.nodeName)) { node.remove(); return; }
        if(node.nodeName==='IMG') {
          const src=node.getAttribute('src'),width=node.getAttribute('width'),alt=node.getAttribute('alt');
          if(!safeDetailImage(src)){node.remove();return;}
          Array.from(node.attributes).forEach(attr=>node.removeAttribute(attr.name));
          node.setAttribute('src',src);node.setAttribute('alt',alt||'Step / material illustration');node.setAttribute('width',['160','320','480'].includes(width)?width:'320');return;
        }
        clean(node);
        if (!allowed.has(node.nodeName)) { node.replaceWith(...node.childNodes); return; }
        Array.from(node.attributes).forEach(attr => node.removeAttribute(attr.name));
      });
    }
    clean(template.content);
    return template.content.textContent.trim()||template.content.querySelector('img') ? template.innerHTML : '';
  }
  document.addEventListener('selectionchange',()=>{
    const selection=window.getSelection();if(!selection.rangeCount)return;
    const node=selection.anchorNode,editor=(node?.nodeType===1?node:node?.parentElement)?.closest('[data-rich-editor]');
    if(editor&&editor.contains(selection.focusNode))richRanges.set(editor,selection.getRangeAt(0).cloneRange());
  }, {signal:lifecycle.signal});
  panel.addEventListener('mousedown',event=>{if(event.target.closest('[data-rich-command]'))event.preventDefault();});
  panel.addEventListener('click',event=>{
    const control=event.target.closest('[data-rich-command]');if(!control||editing?.id==='__custom__')return;
    const editor=control.closest('.salon-rich-editor').querySelector('[data-rich-editor]'),range=richRanges.get(editor);editor.focus();
    if(range&&editor.contains(range.commonAncestorContainer)){const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}
    document.execCommand(control.dataset.richCommand,false,null);
  });
  panel.addEventListener('paste',event=>{
    const editor=event.target.closest('[data-rich-editor]');if(!editor)return;event.preventDefault();if(editing?.id==='__custom__')return;
    const clipboard=event.clipboardData;if(!clipboard)return;
    if(clipboard.files?.length){const card=editor.closest('[data-service-step]');if(card)readStepImage(card,clipboard.files[0]);return;}
    const html=clipboard.getData('text/html');document.execCommand('insertHTML',false,html?cleanDetails(html):esc(clipboard.getData('text/plain')).replace(/\r?\n/g,'<br>'));
  });
  panel.addEventListener('drop',event=>{if(event.target.closest('[data-rich-editor]'))event.preventDefault();});
  const selectedSalon = currentSalon.id;
  function status(message) {$('[data-approval-status]').textContent=message;}
  function snapshot() {return {categories:clone(categories), approvals:api.load(selectedSalon).slice()};}
  function markDirty() {status('Unsaved changes');$('[data-services-save]').disabled=false;options.onChange?.(snapshot());}
  function serviceById(id) {for(const category of categories){const service=category.services.find(s=>s.id===id);if(service)return service;}}
  function eachService(id, change) {categories.forEach(c=>c.services.filter(s=>s.id===id).forEach(change));}
  function render() {
    if (options.onboarding) {
      if (!categories.some(c=>c.id===categoryFilter)) categoryFilter='';
      $('[data-service-filters]').innerHTML=button('data-service-filter="" aria-pressed="'+(!categoryFilter)+'"','All')+categories.map(c=>button('data-service-filter="'+esc(c.id)+'" aria-pressed="'+(categoryFilter===c.id)+'"',esc(c.name))).join('');
      panel.dataset.serviceView=serviceView;
      panel.querySelectorAll('[data-service-view]').forEach(control=>control.setAttribute('aria-pressed',String(control.dataset.serviceView===serviceView)));
    }
    const open = new Set(Array.from(panel.querySelectorAll('[data-service-category][open]')).map(c=>c.dataset.serviceCategory));
    const visible=categories.filter(c=>!categoryFilter||c.id===categoryFilter).map(c=>Object.assign({},c,{services:c.services.filter(s=>!query||[s.name,s.description,...(s.tags||[])].join(' ').toLowerCase().includes(query))})).filter(c=>!query||c.services.length);
    if (options.onboarding && serviceView==='card') {
      $('[data-approval-services]').innerHTML=visible.map(c=>`<section class="salon-card-category"><header><h3>${esc(c.name)} <small>${c.services.length} ${text.count}</small></h3>${button('data-service-add="'+esc(c.id)+'"',text.add,'plus')}</header><div class="salon-service-cards">${c.services.map(s=>`<article class="salon-service-card" data-salon-service-row="${esc(s.id)}" data-row-category="${esc(c.id)}"><header><h3>${esc(s.name)}</h3>${button('data-service-drag="'+esc(s.id)+'" draggable="true" aria-label="Reorder '+esc(s.name)+'"','','grip-vertical','salon-drag')}</header>${safeImage(s.image)?'<img src="'+esc(s.image)+'" alt="">':''}<div class="salon-card-price"><strong>$${Number(s.price||0).toFixed(2)}</strong>${menu?'':'<span>'+icon('clock')+' '+esc(s.durationMin)+' min</span>'}</div><footer><span class="salon-status-pill${s.active===false?' is-inactive':''}">${s.active===false?'Inactive':'Active'}</span>${button('data-salon-service-edit="'+esc(s.id)+'" aria-label="Edit '+text.noun+': '+esc(s.name)+'"','Edit')}${button('data-service-remove="'+esc(s.id)+'" aria-label="Delete '+text.noun+': '+esc(s.name)+'"','Delete')}</footer></article>`).join('')||'<p class="salon-empty">'+text.empty+'</p>'}</div></section>`).join('') || emptyServices();
      return;
    }
    $('[data-approval-services]').innerHTML=visible.map((c,index)=>`<details class="settings-service-category" data-service-category="${esc(c.id)}"${open.has(c.id)||!open.size?' open':''}>
      <summary class="settings-service-category-head"><span class="settings-service-category-name">${esc(c.name)}</span><span class="settings-service-category-count">${c.services.filter(s=>!s.isDraft).length} ${text.count}</span>${button('data-service-add="'+esc(c.id)+'"',text.add,'plus','salon-service-add')}<i class="bi bi-chevron-down settings-service-category-chevron" aria-hidden="true"></i></summary>
      <div class="settings-service-category-body"><div class="settings-service-header" aria-hidden="true"><span></span><span></span><span>${menu?'Item':'Service'}</span><span>Price</span>${menu?'':'<span>Duration</span>'}<span>Status</span>${options.onboarding&&!menu?'<span>Approval</span>':''}<span></span><span></span></div>${c.services.map(s=>`<div class="settings-service-row${s.isDraft?' is-draft':''}" data-salon-service-row="${esc(s.id)}" data-row-category="${esc(c.id)}">
        ${button('data-service-drag="'+esc(s.id)+'" draggable="true" aria-label="Reorder '+esc(s.name||text.noun)+'" title="Drag or use Alt + arrow keys"','', 'grip-vertical','salon-drag')}
        <span class="settings-service-visual">${safeImage(s.image)?'<img alt="" src="'+esc(s.image)+'">':icon('image')}</span>
        <input data-inline-field="name" aria-label="${text.name}" placeholder="${text.placeholder}" value="${esc(s.name)}"${s.id==='__custom__'?' disabled':''}>
        <span class="salon-input-wrap"><span>$</span><input data-inline-field="price" aria-label="${menu?'Item price':'Service price'}" type="number" min="0" step="0.01" placeholder="0.00" value="${esc(s.price??'')}"${s.id==='__custom__'?' disabled':''}></span>
        ${menu?'':'<span class="salon-input-wrap suffix"><input data-inline-field="durationMin" aria-label="Service duration" type="number" min="1" step="1" value="'+esc(s.durationMin??'')+'"'+(s.id==='__custom__'?' disabled':'')+'><span>min</span></span>'}
        <span class="salon-status-pill${s.active===false?' is-inactive':''}">${s.active===false?'Inactive':'Active'}</span>
        ${options.onboarding&&!menu?'<span class="salon-approval-state"'+(api.requiresApproval(selectedSalon,s.id)?' title="Require approval when staff adds this service" aria-label="Require approval when staff adds this service">'+icon('shield-check'):'>')+'</span>':''}
        ${button('data-salon-service-edit="'+esc(s.id)+'" aria-label="View / Edit '+esc(s.name||text.noun)+'" title="View / Edit"','','pencil','salon-row-action')}
        ${button('data-service-remove="'+esc(s.id)+'" aria-label="Remove '+esc(s.name||text.noun)+'"','','x-lg','salon-row-action')}
      </div>`).join('')}${options.onboarding&&!c.services.length?'<p class="salon-empty">'+text.empty+'</p>':''}</div></details>`).join('')||emptyServices();
  }
  function emptyServices() {return query||categoryFilter?'<p class="salon-empty">'+text.noMatch+'</p>'+button('data-service-clear','Clear filters'):'<p class="salon-empty">No categories yet. Use Manage Categories to add one.</p>';}
  function safeImage(value) {return typeof value==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(value);}
  function valid(list) {
    if(list.some(c=>!c.name.trim()))return 'Enter a name for every category.';
    const invalid=list.flatMap(c=>c.services).find(s=>s.id!=='__custom__'&&(!s.name.trim()||s.price==null||s.price===''||!Number.isFinite(Number(s.price))||Number(s.price)<0||!menu&&(!Number.isInteger(Number(s.durationMin))||Number(s.durationMin)<1)));
    return invalid?text.invalid:'';
  }
  function persist(next, approvals) {
    const message=valid(next);if(message)throw new Error(message);
    next.forEach(c=>{c.name=c.name.trim();c.services.forEach(s=>{delete s.isDraft;s.name=s.name.trim();if(s.id!=='__custom__'){s.price=Number(s.price);if(!menu)s.durationMin=Number(s.durationMin);}});});
    try {api.saveCatalog(selectedSalon,next,approvals);} catch(failure) {throw new Error('Unable to save changes. Please try again or use fewer or smaller images.');}categories=next;status('Saved.');render();if(options.onboarding)$('[data-services-save]').disabled=true;
  }
  function show(overlay, trigger) {returnFocus=trigger||document.activeElement;priorOverflow=document.body.style.overflow;overlay.hidden=false;document.body.style.overflow='hidden';const control=overlay.querySelector('input:not(:disabled),button');if(control)control.focus();}
  function close(overlay) {$('[data-service-edit-categories]').tomselect?.close();overlay.hidden=true;document.body.style.overflow=priorOverflow;if(returnFocus?.isConnected)returnFocus.focus();if(overlay===$('[data-service-editor]'))editing=null;}
  function renderCategories() {
    $('[data-category-list]').innerHTML=categoryDraft.map(c=>'<div class="salon-category-row'+(c.isDraft?' is-draft':'')+'" data-category-row="'+esc(c.id)+'">'+button('data-category-drag="'+esc(c.id)+'" draggable="true" aria-label="Reorder '+esc(c.name||'category')+'" title="Drag or use Alt + arrow keys"','','grip-vertical','salon-drag')+'<input data-category-name="'+esc(c.id)+'" aria-label="Category name" placeholder="Category name" value="'+esc(c.name)+'">'+(c.isDraft?'':'<span class="settings-service-category-count">'+c.services.length+' '+text.count+'</span>')+button('data-category-remove="'+esc(c.id)+'" aria-label="Remove '+esc(c.name||'category')+'"','','x-lg')+'</div>').join('');
  }
  function renderTags() {$('[data-tag-list]').innerHTML=tags.map((tag,index)=>'<span>'+esc(tag)+button('data-remove-tag="'+index+'" aria-label="Remove tag '+esc(tag)+'"','×')+'</span>').join('');}
  function renderImage() {$('[data-image-preview]').innerHTML=safeImage(imageData)?'<img src="'+esc(imageData)+'" alt="'+text.image+' preview">'+button('data-image-remove aria-label="Remove '+text.noun+' image"','×'):icon('image');}
  function openService(id,trigger) {
    const service=serviceById(id);if(!service)return;editing={id,token:uid()};
    if(options.onboarding){
      $('#service-editor-title').textContent=service.isDraft?text.newTitle:text.editTitle;
      $('[data-service-editor] header p').textContent=service.isDraft?text.newIntro:text.editIntro;
      $('[data-service-editor-form] [type="submit"]').textContent=service.isDraft?text.addSave:'Save changes';
      $('.salon-service-approval').hidden=menu||!!service.isDraft;
    }
    const categorySelect = $('[data-service-edit-categories]');
    categorySelect.tomselect?.destroy();
    categorySelect.innerHTML=categories.map(c=>'<option value="'+esc(c.id)+'"'+(c.services.some(s=>s.id===id)?' selected':'')+'>'+esc(c.name)+'</option>').join('');
    new window.TomSelect(categorySelect, {
      plugins: {checkbox_options: {}, remove_button: {title: 'Remove category'}},
      maxItems: null, hideSelected: false, closeAfterSelect: false,
      placeholder: 'Select categories', create: false,
      onInitialize() { this.control_input.setAttribute('aria-required','true'); }
    });
    for(const [field,key] of [['name','name'],['price','price'],['duration','durationMin'],['description','description'],['fee','supplyFee']]){$('[data-service-edit-'+field+']').value=service[key]??'';$('[data-service-edit-'+field+']').disabled=id==='__custom__'||menu&&['duration','fee'].includes(field);}
    clearStepDrag();pendingStepImages=new Set();coverLoading=false;richRanges=new WeakMap();$('[data-service-steps]').innerHTML='';
    const steps=Array.isArray(service.steps)?service.steps:[{title:'',image:'',descriptionHtml:service.detailsHtml||''}];
    (steps.length?steps:[{}]).forEach(step=>appendStep(step||{}));
    $('[data-service-materials]').innerHTML=cleanDetails(service.materialsHtml);
    panel.querySelectorAll('[data-step-add],[data-step-remove],[data-step-image-take],[data-step-image-add],[data-step-image-remove],[data-step-title],[data-step-description],[data-step-drag],[data-rich-command]').forEach(control=>{control.disabled=id==='__custom__';});
    panel.querySelectorAll('[data-rich-editor]').forEach(editor=>{editor.contentEditable=id==='__custom__'?'false':'true';});
    $('[data-service-edit-active]').checked=service.active!==false;
    $('[data-service-approval]').checked=api.requiresApproval(selectedSalon,id);
    $('[data-description-count]').textContent=(service.description||'').length+'/1000';
    updateImageBusy();
    $('[data-service-edit-error]').hidden=true;tags=(service.tags||[]).slice();imageData=service.image||'';
    $('[data-service-edit-tags]').value='';$('[data-service-photo]').value='';$('[data-service-file]').value='';renderTags();renderImage();show($('[data-service-editor]'),trigger);
  }
  function error(message) {$('[data-service-edit-error]').textContent=message;$('[data-service-edit-error]').hidden=false;}
  panel.addEventListener('input',event=>{
    const field=event.target;
    if(field.matches('[data-service-search]')){query=field.value.trim().toLowerCase();render();return;}
    if(field.matches('[data-inline-field]')){const id=field.closest('[data-salon-service-row]').dataset.salonServiceRow;eachService(id,s=>{s[field.dataset.inlineField]=field.value;});markDirty();}
    if(field.matches('[data-category-name]'))categoryDraft.find(c=>c.id===field.dataset.categoryName).name=field.value;
    if(field.matches('[data-service-edit-description]'))$('[data-description-count]').textContent=field.value.length+'/1000';
  });
  panel.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target)return;
    if(target.matches('[data-service-view]')){serviceView=target.dataset.serviceView;render();return;}
    if(target.matches('[data-service-filter],[data-service-clear]')){categoryFilter=target.dataset.serviceFilter||'';query='';$('[data-service-search]').value='';render();return;}
    if(target.matches('[data-services-save]')){try{persist(clone(categories));}catch(failure){status(failure.message);}return;}
    if(target.matches('[data-categories-open]')){categoryDraft=clone(categories);$('[data-category-error]').hidden=true;renderCategories();show($('[data-category-editor]'),target);return;}
    if(target.matches('[data-category-close]')){close($('[data-category-editor]'));return;}
    if(target.matches('[data-category-add]')){categoryDraft.push({id:uid(),name:'',services:[],isDraft:true});renderCategories();$('[data-category-list]').lastElementChild.querySelector('input').focus();return;}
    if(target.matches('[data-category-remove]')){const c=categoryDraft.find(c=>c.id===target.dataset.categoryRemove);if(c.services.length&&!window.confirm('Remove category "'+c.name+'" and its '+text.noun+' entries?'))return;categoryDraft=categoryDraft.filter(c=>c.id!==target.dataset.categoryRemove);renderCategories();return;}
    if(target.matches('[data-category-save]')){try{const next=clone(categoryDraft);next.forEach(c=>{c.name=c.name.trim();delete c.isDraft;});persist(next);close($('[data-category-editor]'));}catch(failure){$('[data-category-error]').textContent=failure.message;$('[data-category-error]').hidden=false;}return;}
    if(target.matches('[data-service-add]')){
      event.preventDefault();
      const c=categories.find(c=>c.id===target.dataset.serviceAdd),service=Object.assign({id:uid(),name:'',price:'',active:true,isDraft:true},menu?{}:{durationMin:options.onboarding?'':45});
      c.services.push(service);
      if(options.onboarding&&menu){openService(service.id,target);return;}
      if(options.onboarding){serviceView='list';query='';$('[data-service-search]').value='';}
      markDirty();render();
      const category=Array.from(panel.querySelectorAll('[data-service-category]')).find(el=>el.dataset.serviceCategory===c.id);
      category.open=true;category.querySelector('.settings-service-row:last-child [data-inline-field="name"]').focus();return;
    }
    if(target.matches('[data-salon-service-edit]')){openService(target.dataset.salonServiceEdit,target);return;}
    if(target.matches('[data-service-editor-close]')){cancelService();return;}
    if(target.matches('[data-service-remove]')){const id=target.dataset.serviceRemove,s=serviceById(id);if(!s.isDraft&&!window.confirm('Remove "'+s.name+'" from this category?'))return;const c=categories.find(c=>c.id===target.closest('[data-row-category]').dataset.rowCategory);c.services=c.services.filter(s=>s.id!==id);markDirty();render();return;}
    if(target.matches('[data-remove-tag]')){tags.splice(Number(target.dataset.removeTag),1);renderTags();return;}
    if(target.matches('[data-image-remove]')){imageData='';renderImage();}
  });
  function cancelService() {
    if(options.onboarding&&menu&&editing&&serviceById(editing.id)?.isDraft){const id=editing.id;categories.forEach(c=>{c.services=c.services.filter(s=>s.id!==id);});render();}
    close($('[data-service-editor]'));
  }
  $('[data-service-editor-form]').addEventListener('submit',event=>{
    event.preventDefault();if(!editing||pendingStepImages.size>0||coverLoading)return;
    if(!$('[data-service-editor-form]').reportValidity())return;
    const service=serviceById(editing.id),isCustom=editing.id==='__custom__';
    const categoryIds=Array.from($('[data-service-edit-categories]').selectedOptions, option=>option.value);
    if(!categoryIds.length){error('Select at least one category.');return;}
    const fee=$('[data-service-edit-fee]').value;
    if(!menu&&fee!==''&&(!Number.isFinite(Number(fee))||Number(fee)<0)){error('Supply fee must be zero or greater.');return;}
    const tag=$('[data-service-edit-tags]').value.trim();if(tag&&!tags.includes(tag))tags.push(tag);
    const details={name:$('[data-service-edit-name]').value.trim(),price:$('[data-service-edit-price]').value===''?'':Number($('[data-service-edit-price]').value),description:$('[data-service-edit-description]').value,tags:tags.slice(),image:imageData};
    if(!menu)Object.assign(details,{durationMin:Number($('[data-service-edit-duration]').value),steps:collectSteps(),materialsHtml:cleanDetails($('[data-service-materials]').innerHTML),supplyFee:fee===''?null:Number(fee)});
    const updated=Object.assign({},service,isCustom?{}:details,{active:$('[data-service-edit-active]').checked});
    if(!isCustom)delete updated.detailsHtml;
    const next=clone(categories).map(c=>{const index=c.services.findIndex(s=>s.id===service.id);c.services=c.services.filter(s=>s.id!==service.id);if(categoryIds.includes(c.id))c.services.splice(index<0?c.services.length:index,0,clone(updated));return c;});
    const approvals=new Set(api.load(selectedSalon));if($('[data-service-approval]').checked)approvals.add(service.id);else approvals.delete(service.id);
    try{persist(next,Array.from(approvals));close($('[data-service-editor]'));const trigger=Array.from(panel.querySelectorAll('[data-salon-service-edit]')).find(b=>b.dataset.salonServiceEdit===service.id);if(trigger){const category=trigger.closest('details');if(category)category.open=true;trigger.focus();}}catch(failure){error(failure.message);}
  });
  $('[data-service-edit-tags]').addEventListener('keydown',event=>{if(event.key!=='Enter')return;event.preventDefault();const tag=event.target.value.trim();if(tag&&!tags.includes(tag))tags.push(tag);event.target.value='';renderTags();});
  panel.addEventListener('change',event=>{
    if(!event.target.matches('[data-service-photo],[data-service-file]'))return;
    const file=event.target.files[0];if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){error('Choose a JPG, PNG, or WebP image up to 10MB.');return;}
    const token=editing?.token;const reader=new FileReader();
    coverLoading=true;updateImageBusy();
    reader.onload=()=>{if(editing?.token!==token)return;imageData=reader.result;renderImage();coverLoading=false;updateImageBusy();};reader.onerror=()=>{if(editing?.token!==token)return;coverLoading=false;updateImageBusy();error('Unable to read this image. Please try again.');};reader.readAsDataURL(file);
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
    overlay.addEventListener('click',event=>{if(event.target===overlay){if(overlay===$('[data-service-editor]'))cancelService();else close(overlay);}});
    overlay.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();const picker=$('[data-service-edit-categories]').tomselect;if(picker?.isOpen){picker.close();return;}if(overlay===$('[data-service-editor]'))cancelService();else close(overlay);return;}if(event.key!=='Tab')return;
      const controls=Array.from(overlay.querySelectorAll('button,input,textarea,select,a[href],[contenteditable="true"]')).filter(c=>!c.disabled&&c.type!=='file'&&c.tabIndex!==-1&&!c.closest('[hidden]'));const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
  });
  const ready=(options.categories ? Promise.resolve({categories:options.categories}) : window.NEXORA_APPOINTMENT_SERVICE_CATALOG.load('../menu/menu.json')).then(catalog=>{
    if(destroyed||!panel.isConnected)return;
    base=catalog.categories.map(c=>({id:c.id,name:c.name,services:c.services.filter(s=>menu||s.type!=='add-on').map(s=>Object.assign({},s,menu?{}:{durationMin:s.durationMin||45}))})).filter(c=>options.onboarding||c.services.length);
    if(!options.onboarding)base.push({id:'custom-service-settings',name:'Other services',services:[{id:'__custom__',name:'Custom service'}]});
    categories=api.loadCatalog(selectedSalon,base);loaded=true;render();$('[data-services-save]').disabled=!!options.onboarding;$('[data-categories-open]').disabled=false;
  }).catch(()=>{if(!destroyed&&panel.isConnected)$('[data-approval-services]').textContent=text.loadFailed;});
  return {ready, snapshot, save(){if(!loaded)throw new Error(text.loading);if(options.onboarding&&!categories.some(c=>c.services.some(s=>s.id!=='__custom__')))throw new Error(text.invalid);persist(clone(categories));return snapshot();}, destroy(){destroyed=true;editing=null;lifecycle.abort();$('[data-service-edit-categories]').tomselect?.destroy();if(panel.querySelector('.salon-service-overlay:not([hidden])'))document.body.style.overflow=priorOverflow;}};
  }
  window.NEXORA_SALON_SERVICES={mount};
  const panel=document.querySelector('[data-settings-panel="services"]');
  if(panel)mount(panel);
})();
