/* Staff preparation uses the Salon Settings roster and the staging technician form. */
(function () {
  'use strict';
  var days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var roles=[['tech','Technician'],['frontdesk','Front Desk'],['manager','Manager'],['owner','Owner']];
  var levels=[['','— None —'],['1','Level 1 · Basic services'],['2','Level 2 · Advanced services'],['3','Level 3 · Senior / all approved services']];
  var payModels=[['later','Set up later'],['commission','Commission (%)'],['weekly','Weekly Salary ($)'],['agreed','Agreed Amount ($)']];
  var countries=[['US','United States','1'],['CA','Canada','1'],['VN','Vietnam','84'],['GB','United Kingdom','44'],['AU','Australia','61'],['SG','Singapore','65'],['JP','Japan','81'],['KR','South Korea','82'],['DE','Germany','49'],['FR','France','33'],['IN','India','91'],['CN','China','86'],['BR','Brazil','55'],['MX','Mexico','52'],['HK','Hong Kong','852'],['TW','Taiwan','886'],['MY','Malaysia','60'],['TH','Thailand','66'],['PH','Philippines','63'],['ID','Indonesia','62']];
  var copy=value=>JSON.parse(JSON.stringify(value));
  var esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  var icon=name=>'<i class="bi bi-'+name+'" aria-hidden="true"></i>';
  var button=(label,attrs,primary)=>'<button type="button" '+attrs+' class="nxstaff-button'+(primary?' is-primary':'')+'">'+label+'</button>';
  function validWeek(weekly) {
    return Array.isArray(weekly)&&weekly.length===7&&weekly.every(day=>day.off||(/^([01]\d|2[0-3]):[0-5]\d$/.test(day.start)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(day.end)&&day.end>day.start));
  }
  function complete(fields) {
    return Array.isArray(fields.staffMembers)&&fields.staffMembers.length>0&&!Object.keys(fields.staffEdits||{}).length&&fields.staffMembers.every(staff=>String(staff.name||'').trim()&&validWeek(staff.weekly));
  }
  function mount(panel,options) {
    var fields=options.fields||{}, business=options.business||{}, members=copy(fields.staffMembers||[]), edits=copy(fields.staffEdits||{});
    var categories=[], loaded=false, destroyed=false, query='', page=1, editor=null, editorKey='', returnFocus=null, priorOverflow='';
    var pageSize=10, controller=new AbortController(), $=selector=>panel.querySelector(selector);
    if(!members.length&&!Array.isArray(fields.staffMembers)) [1,2].forEach(index=>{
      if(fields['staff'+index+'Name'])members.push(Object.assign(blank(),{id:'onboarding-staff-'+index,name:fields['staff'+index+'Name'],legacyHours:fields['staff'+index+'Hours']||'',legacyServices:index===1?fields.staff1Services||'':''}));
    });
    panel.classList.add('nxstaff');
    panel.innerHTML='<div class="nxstaff-toolbar"><p>Set a staff member\'s POS role, pay structure, and tip preference, and confirm their tax filing type.</p><div><input type="search" data-staff-search aria-label="Search staff by name" placeholder="Search staff by name...">'+button(icon('plus-lg')+'Add Staff','data-staff-add',true)+'</div></div><div class="salon-staff-table" data-staff-grid></div><div class="salon-pagination" data-staff-pagination></div><div class="nxstaff-overlay" data-staff-overlay hidden><section class="nxstaff-dialog" role="dialog" aria-modal="true" aria-labelledby="nxstaff-title"><header><div><h2 id="nxstaff-title">Technician Info</h2><p data-staff-subtitle></p></div>'+button(icon('x-lg'),'data-staff-close aria-label="Close"')+'</header><form data-staff-form><div class="nxstaff-body" data-staff-body></div><footer><span class="nxstaff-error" data-staff-error role="alert"></span>'+button('Close','data-staff-close')+'<button class="nxstaff-button is-primary" type="submit">'+icon('check-lg')+'Save technician</button></footer></form></section></div>';
    function blank() {
      return {id:'',name:'',phone:'',phoneCountry:'US',email:'',posRole:'tech',level:'1',payStructure:'later',commission:'',weeklySalary:'',agreedAmount:'',tipsEnabled:true,serviceIds:[],weekly:days.map((_,index)=>{var day=[1,2,3,4,5,6,0][index];return {off:business['hoursOpen'+day]==='false',start:business['hoursFrom'+day]||'',end:business['hoursTo'+day]||''};})};
    }
    function snapshot() {return {staffMembers:copy(members),staffEdits:copy(edits)};}
    function notify() {return options.onChange(snapshot())!==false;}
    function draw() {
      var filtered=members.filter(staff=>staff.name.toLowerCase().includes(query));
      var pages=Math.max(1,Math.ceil(filtered.length/pageSize));page=Math.min(page,pages);
      var visible=filtered.slice((page-1)*pageSize,page*pageSize).map(staff=>{
        var country=countries.find(item=>item[0]===staff.phoneCountry)||countries[0];
        return Object.assign({},staff,{phone:staff.phone&&!staff.phone.startsWith('+')?'+'+country[2]+' '+staff.phone:staff.phone});
      });
      $('[data-staff-grid]').innerHTML=window.NEXORA_STAFF_ROSTER.table(visible,{onboarding:true});
      var pagesHTML=button('‹','data-staff-page="'+(page-1)+'" aria-label="Previous page"'+(page===1?' disabled':''));
      var wanted=Array.from(new Set([1,page-1,page,page+1,pages])).filter(number=>number>0&&number<=pages).sort((a,b)=>a-b), previous=0;
      wanted.forEach(number=>{if(previous&&number>previous+1)pagesHTML+='<span>…</span>';pagesHTML+=button(String(number),'data-staff-page="'+number+'"'+(page===number?' aria-current="page"':''));previous=number;});
      pagesHTML+=button('›','data-staff-page="'+(page+1)+'" aria-label="Next page"'+(page===pages?' disabled':''));
      $('[data-staff-pagination]').innerHTML='<span>Showing <strong>'+(filtered.length?(page-1)*pageSize+1:0)+'</strong> to <strong>'+Math.min(page*pageSize,filtered.length)+'</strong> of <strong>'+filtered.length+'</strong> results</span><nav aria-label="Staff pagination">'+pagesHTML+'</nav>';
    }
    function input(name,label,type,extra) {return '<label class="nxstaff-field"><span>'+label+'</span><input name="'+name+'" type="'+(type||'text')+'" value="'+esc(editor[name])+'" '+(extra||'')+'></label>';}
    function select(name,label,values) {return '<label class="nxstaff-field"><span>'+label+'</span><select name="'+name+'" aria-label="'+label+'">'+values.map(value=>'<option value="'+esc(value[0])+'"'+(String(editor[name])===value[0]?' selected':'')+'>'+esc(value[1])+'</option>').join('')+'</select></label>';}
    function payField() {
      var definition={commission:['commission','Commission (%)','max="100"'],weekly:['weeklySalary','Weekly Salary ($)',''],agreed:['agreedAmount','Agreed Amount ($)','']}[editor.payStructure];
      return definition?input(definition[0],definition[1],'number','min="0" step="0.01" required '+definition[2]):'';
    }
    function servicePicker() {
      var selected=new Set(editor.serviceIds);
      return '<p class="nxstaff-service-note" data-staff-service-note'+(selected.size?' hidden':'')+'>No services selected — this technician will be offered for every service.</p><details class="nxstaff-service-picker" open><summary><label><input type="checkbox" data-staff-services-all>Check all services</label><span>'+categories.reduce((count,category)=>count+category.services.length,0)+'</span></summary><div>'+categories.map((category,index)=>'<details class="nxstaff-service-category"'+(!index?' open':'')+'><summary><label><input type="checkbox" data-staff-services-category="'+esc(category.id)+'">Check all <b>'+esc(category.name)+'</b></label><span>'+category.services.length+'</span></summary><div class="nxstaff-service-options">'+category.services.map(service=>'<label><input type="checkbox" data-staff-service="'+esc(service.id)+'" data-category="'+esc(category.id)+'"'+(selected.has(service.id)?' checked':'')+'>'+esc(service.name)+'</label>').join('')+'</div></details>').join('')+(loaded&&!categories.length?'<p class="nxstaff-help">No services available.</p>':!loaded?'<p class="nxstaff-help">Loading services…</p>':'')+'</div></details>';
    }
    function weeklyHTML() {
      return '<div class="nxstaff-section-heading"><h3>'+icon('calendar-week')+'Weekly schedule</h3><a href="pos-salon-settings.html?section=information#business-hours">'+esc(business.timeZone||'Time zone')+'</a></div>'+(editor.legacyHours?'<p class="nxstaff-help">Operating hours: '+esc(editor.legacyHours)+'</p>':'')+'<details class="nxstaff-bulk"><summary>Apply to multiple days</summary><div>'+input('bulkStart','Start time','time')+input('bulkEnd','End time','time')+button('Apply to all day','data-staff-apply-hours')+'</div></details><div class="nxstaff-week">'+days.map((day,index)=>'<div class="nxstaff-day"><b>'+day+'</b><label><input type="checkbox" data-staff-day-off="'+index+'"'+(editor.weekly[index].off?' checked':'')+'>Day off</label><div data-staff-day-times="'+index+'"><input type="time" data-staff-start="'+index+'" aria-label="'+day+' Start time" value="'+esc(editor.weekly[index].start)+'"'+(editor.weekly[index].off?' disabled':' required')+'><span>TO</span><input type="time" data-staff-end="'+index+'" aria-label="'+day+' End time" value="'+esc(editor.weekly[index].end)+'"'+(editor.weekly[index].off?' disabled':' required')+'></div></div>').join('')+'</div>';
    }
    function renderEditor() {
      $('[data-staff-subtitle]').textContent=editor.id?'Update profile, services and schedule for '+editor.name+'.':'Enter a new technician profile, services, and weekly schedule.';
      $('[data-staff-body]').innerHTML='<div class="nxstaff-draft"><span>Changes are saved as a draft on this device.</span>'+button('Discard draft','data-staff-discard')+'</div><section class="nxstaff-section"><h3>'+icon('person')+'Profile info</h3><div class="nxstaff-grid">'+input('name','Technician name (required)','text','required maxlength="120" placeholder="E.G. KIM NGUYEN" autocomplete="name"')+'<div class="nxstaff-field"><label for="nxstaff-phone">Phone number</label><div class="nxstaff-phone"><select name="phoneCountry" aria-label="Country code">'+countries.map(country=>'<option value="'+country[0]+'" title="'+country[1]+'"'+(editor.phoneCountry===country[0]?' selected':'')+'>'+country[0]+' +'+country[2]+'</option>').join('')+'</select><input id="nxstaff-phone" type="tel" name="phone" value="'+esc(editor.phone)+'" placeholder="(555) 555-5555" autocomplete="tel-national"></div></div>'+input('email','Email','email','placeholder="e.g. kim@nexoratouch.com" autocomplete="email"')+'</div></section><section class="nxstaff-section"><h3>'+icon('person-badge')+'Role, Pay &amp; Tips</h3><div class="nxstaff-grid">'+select('posRole','POS Role',roles)+select('level','Staff Level',levels)+select('payStructure','Pay Structure',payModels)+'</div><div class="nxstaff-pay-field" data-staff-pay-field>'+payField()+'</div><label class="nxstaff-tips"><input type="checkbox" name="tipsEnabled" role="switch"'+(editor.tipsEnabled?' checked':'')+'><span aria-hidden="true"></span><b>Tips Enabled at POS Checkout</b></label></section><section class="nxstaff-section"><h3>'+icon('list-check')+'Services</h3>'+(editor.legacyServices?'<p class="nxstaff-help">'+esc(options.legacyServicesLabel)+': '+esc(editor.legacyServices)+'</p>':'')+'<div data-staff-services>'+servicePicker()+'</div></section><section class="nxstaff-section">'+weeklyHTML()+'</section>';
      syncServices();
    }
    function open(id,trigger) {
      editorKey=id||'new';editor=copy(edits[editorKey]||members.find(staff=>staff.id===id)||blank());
      editor.weekly=editor.weekly||blank().weekly;editor.serviceIds=editor.serviceIds||[];
      editor.bulkStart=editor.bulkStart||'';editor.bulkEnd=editor.bulkEnd||'';
      returnFocus=trigger;priorOverflow=document.body.style.overflow;renderEditor();
      $('[data-staff-error]').textContent='';$('[data-staff-overlay]').hidden=false;document.body.style.overflow='hidden';$('[name="name"]').focus();
    }
    function close() {$('[data-staff-overlay]').hidden=true;document.body.style.overflow=priorOverflow;editor=null;if(returnFocus&&returnFocus.isConnected)returnFocus.focus();}
    function saveEdit() {edits[editorKey]=copy(editor);notify();}
    function syncServices() {
      var controls=Array.from(panel.querySelectorAll('[data-staff-service]'));
      function sync(control,items){var checked=items.filter(item=>item.checked).length;control.checked=!!items.length&&checked===items.length;control.indeterminate=checked>0&&checked<items.length;}
      sync($('[data-staff-services-all]'),controls);
      panel.querySelectorAll('[data-staff-services-category]').forEach(control=>sync(control,controls.filter(item=>item.dataset.category===control.dataset.staffServicesCategory)));
      $('[data-staff-service-note]').hidden=editor.serviceIds.length>0;
    }
    function handleField(target) {
      if(!editor)return;
      if(target.name)editor[target.name]=target.type==='checkbox'?target.checked:target.value;
      if(target.hasAttribute('data-staff-start'))editor.weekly[Number(target.dataset.staffStart)].start=target.value;
      if(target.hasAttribute('data-staff-end'))editor.weekly[Number(target.dataset.staffEnd)].end=target.value;
      if(target.hasAttribute('data-staff-day-off')){
        var index=Number(target.dataset.staffDayOff);editor.weekly[index].off=target.checked;
        $('[data-staff-day-times="'+index+'"]').querySelectorAll('input').forEach(input=>{input.disabled=target.checked;input.required=!target.checked;});
      }
      if(target.matches('[data-staff-services-all],[data-staff-services-category],[data-staff-service]')){
        var controls=Array.from(panel.querySelectorAll('[data-staff-service]'));
        if(!target.hasAttribute('data-staff-service'))controls.filter(input=>!target.hasAttribute('data-staff-services-category')||input.dataset.category===target.dataset.staffServicesCategory).forEach(input=>{input.checked=target.checked;});
        var visible=new Set(controls.map(input=>input.dataset.staffService));
        editor.serviceIds=editor.serviceIds.filter(id=>!visible.has(id)).concat(controls.filter(input=>input.checked).map(input=>input.dataset.staffService));syncServices();
      }
      if(target.name==='payStructure')$('[data-staff-pay-field]').innerHTML=payField();
      saveEdit();
    }
    panel.addEventListener('input',event=>{
      if(event.target.matches('[data-staff-search]')){query=event.target.value.trim().toLowerCase();page=1;draw();return;}
      if(event.target.type!=='checkbox'&&event.target.tagName!=='SELECT'&&event.target.closest('[data-staff-form]'))handleField(event.target);
    },{signal:controller.signal});
    panel.addEventListener('change',event=>{if((event.target.type==='checkbox'||event.target.tagName==='SELECT')&&event.target.closest('[data-staff-form]'))handleField(event.target);},{signal:controller.signal});
    panel.addEventListener('click',event=>{
      var target=event.target.closest('button');
      if(event.target.matches('[data-staff-overlay]')){close();return;}
      if(event.target.closest('.nxstaff-service-picker summary label,.nxstaff-service-category summary label'))event.stopPropagation();
      if(!target)return;
      if(target.hasAttribute('data-staff-add'))open('',target);
      if(target.hasAttribute('data-tech-detail-open'))open(target.dataset.techDetailOpen,target);
      if(target.hasAttribute('data-staff-close'))close();
      if(target.hasAttribute('data-staff-page')){page=Number(target.dataset.staffPage);draw();}
      if(target.hasAttribute('data-staff-discard')){delete edits[editorKey];editor=copy(members.find(staff=>staff.id===editorKey)||blank());renderEditor();notify();}
      if(target.hasAttribute('data-staff-apply-hours')){
        if(!editor.bulkStart||!editor.bulkEnd||editor.bulkEnd<=editor.bulkStart){$('[data-staff-error]').textContent='Check the working hours: end time must follow start time.';return;}
        editor.weekly.forEach(day=>{if(!day.off){day.start=editor.bulkStart;day.end=editor.bulkEnd;}});
        var bulk=$('.nxstaff-bulk');var wasOpen=bulk.open;renderEditor();$('.nxstaff-bulk').open=wasOpen;saveEdit();$('[data-staff-error]').textContent='';
      }
    },{signal:controller.signal});
    $('[data-staff-form]').addEventListener('submit',event=>{
      event.preventDefault();if(!editor||!event.currentTarget.reportValidity())return;
      if(!String(editor.name||'').trim()){$('[data-staff-error]').textContent='Enter the technician name before saving.';return;}
      if(!validWeek(editor.weekly)){$('[data-staff-error]').textContent='Check the working hours: end time must follow start time.';return;}
      var saved=copy(editor), previousMembers=copy(members), previousEdits=copy(edits);
      saved.name=saved.name.trim();saved.id=saved.id||'onboarding-staff-'+(window.crypto.randomUUID?window.crypto.randomUUID():Date.now());
      delete saved.bulkStart;delete saved.bulkEnd;delete saved.legacyHours;delete saved.legacyServices;
      members=members.filter(staff=>staff.id!==saved.id).concat(saved);delete edits[editorKey];
      if(!notify()){members=previousMembers;edits=previousEdits;$('[data-staff-error]').textContent=options.saveFailed;return;}
      draw();close();
    },{signal:controller.signal});
    $('[data-staff-overlay]').addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();close();return;}
      if(event.key!=='Tab')return;
      var controls=Array.from($('[data-staff-overlay]').querySelectorAll('button,input,select,a[href],summary')).filter(control=>!control.disabled&&!control.closest('[hidden]')&&!control.closest('details:not([open])>div'));
      var first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    },{signal:controller.signal});
    draw();
    var ready=(Array.isArray(options.categories)?Promise.resolve({categories:options.categories}):window.NEXORA_APPOINTMENT_SERVICE_CATALOG.load('../menu/menu.json')).then(catalog=>{
      if(destroyed)return;
      categories=catalog.categories.map(category=>({id:category.id,name:category.name,services:category.services.filter(service=>service.id!=='__custom__'&&service.active!==false&&service.type!=='add-on')})).filter(category=>category.services.length);loaded=true;
      if(editor){$('[data-staff-services]').innerHTML=servicePicker();syncServices();}
    }).catch(()=>{if(!destroyed&&editor)$('[data-staff-services]').textContent='Unable to load services. Reload to try again.';});
    return {ready,snapshot,validate(){if(!complete(snapshot()))throw new Error(options.requiredMessage);if(!notify())throw new Error(options.saveFailed);},destroy(){destroyed=true;controller.abort();if(!$('[data-staff-overlay]').hidden)document.body.style.overflow=priorOverflow;}};
  }
  window.NEXORA_STAFF_SETUP={mount,complete};
})();
