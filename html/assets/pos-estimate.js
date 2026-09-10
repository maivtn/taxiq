(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = cents => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(cents / 100);
  function calculate(lines, type, value) {
    if (!lines.length) return {error:'Choose at least one service.'};
    if (lines.some(line => line.price == null || line.price === '' || !Number.isFinite(Number(line.price)) || Number(line.price) < 0)) return {error:'Enter a valid price for every selected service.'};
    const amount = Number(value);
    if (!['percent','fixed'].includes(type) || value === '' || !Number.isFinite(amount) || amount < 0 || (type === 'percent' && amount > 100)) return {error:'Enter a valid discount (0–100% or a positive dollar amount).'};
    const subtotalCents = lines.reduce((sum,line) => sum + Math.round(Number(line.price) * 100),0);
    const discountCents = Math.min(subtotalCents, Math.round(type === 'percent' ? subtotalCents * amount / 100 : amount * 100));
    return {subtotalCents,discountCents,totalCents:subtotalCents-discountCents,type,value:amount};
  }
  function mount(root, options) {
    let lines = [], pending = false;
    root.innerHTML = `<div class="estimate-heading"><div><h2>Service Estimate</h2><p>Help your guest choose services and see the estimated total.</p></div><button type="button" class="pos-btn" data-est-reset>Clear estimate</button></div>
    <div class="estimate-layout"><div class="pos-card"><h3>Choose services</h3><input class="pos-input" type="search" data-est-search aria-label="Search services" placeholder="Search services…"><div class="estimate-catalog" data-est-catalog></div></div>
    <div class="pos-card estimate-summary"><h3>Your estimate</h3><div data-est-lines></div><fieldset><legend>Discount on all services</legend><div class="estimate-discount"><select class="pos-input" data-est-type aria-label="Discount type"><option value="percent">Percentage (%)</option><option value="fixed">Amount ($)</option></select><input class="pos-input" data-est-value aria-label="Discount value" type="number" min="0" max="100" step="0.01" value="0"></div><div class="estimate-presets">${[0,5,10,15,20].map(n=>`<button type="button" class="pos-btn pos-btn-sm" data-est-preset="${n}">${n}%</button>`).join('')}</div></fieldset>
    <div class="estimate-totals" aria-live="polite"><p><span>Subtotal</span><strong data-est-subtotal>$0.00</strong></p><p><span>Discount</span><strong data-est-discount>$0.00</strong></p><p class="estimate-grand"><span>Estimated total</span><strong data-est-total>$0.00</strong></p></div><p class="pos-muted">Service estimate only. Tax and tip are not included. Confirm the final discount at checkout.</p><p data-est-error role="status"></p><button class="pos-btn pos-btn-primary" type="button" data-est-checkin disabled>Check in with these services</button></div></div>
    <dialog class="estimate-dialog"><form><h2>Check in guest</h2><p data-est-confirm></p><label>Customer name<input class="pos-input" name="customerName" required autocomplete="name"></label><label>Phone<input class="pos-input" name="phone" type="tel" required autocomplete="tel"></label><p data-est-submit-error role="alert"></p><div class="estimate-discount"><button class="pos-btn" type="button" data-est-cancel>Back to estimate</button><button class="pos-btn pos-btn-primary" type="submit">Confirm check-in</button></div></form></dialog>`;
    const $ = selector => root.querySelector(selector);
    function catalog() {
      const query = $('[data-est-search]').value.trim().toLowerCase();
      const services = options.getServices().filter(s=>s.active !== false && s.name.toLowerCase().includes(query));
      $('[data-est-catalog]').innerHTML = services.map(s=>`<button class="estimate-service" type="button" data-est-add="${esc(s.id)}" ${lines.some(l=>l.serviceId===s.id)?'disabled':''}><span><strong>${esc(s.name)}</strong><small>${esc(s.durationMin || 0)} min</small></span><b>${s.price == null?'Enter price':money(Math.round(s.price*100))}</b><span aria-hidden="true">＋</span></button>`).join('') || '<p>No services found.</p>';
    }
    function totals() {
      const result = calculate(lines,$('[data-est-type]').value,$('[data-est-value]').value);
      $('[data-est-error]').textContent = result.error || '';
      for (const [hook,key] of [['subtotal','subtotalCents'],['discount','discountCents'],['total','totalCents']]) $('[data-est-'+hook+']').textContent = result.error ? '—' : money(result[key]);
      $('[data-est-checkin]').disabled = !!result.error;
      return result;
    }
    function render() {
      catalog();
      $('[data-est-lines]').innerHTML = lines.map((l,i)=>`<div class="estimate-line"><div><strong>${esc(l.serviceName)}</strong>${l.customPrice?`<label>Service price ($)<input class="pos-input" type="number" min="0" step="0.01" data-est-price="${i}" value="${esc(l.price ?? '')}"></label>`:`<small>${money(Math.round(l.price*100))}</small>`}</div><button class="pos-btn pos-btn-sm" type="button" data-est-remove="${i}" aria-label="Remove ${esc(l.serviceName)}">×</button></div>`).join('') || '<p class="pos-muted">Select services to start an estimate.</p>';
      totals();
    }
    root.addEventListener('input', e=>{
      if(e.target.matches('[data-est-search]')) catalog();
      if(e.target.matches('[data-est-price]')) {lines[Number(e.target.dataset.estPrice)].price=e.target.value;totals();}
      if(e.target.matches('[data-est-value]')) totals();
    });
    $('[data-est-type]').addEventListener('change',()=>{
      const percent=$('[data-est-type]').value==='percent';
      if(percent)$('[data-est-value]').max='100';else $('[data-est-value]').removeAttribute('max');
      root.querySelectorAll('[data-est-preset]').forEach(b=>b.textContent=percent?b.dataset.estPreset+'%':'$'+b.dataset.estPreset);
      totals();
    });
    root.addEventListener('click',e=>{
      const add=e.target.closest('[data-est-add]'),remove=e.target.closest('[data-est-remove]'),preset=e.target.closest('[data-est-preset]');
      if(add){const s=options.getServices().find(s=>s.id===add.dataset.estAdd && s.active!==false);if(s&&!lines.some(l=>l.serviceId===s.id)){lines.push({serviceId:s.id,serviceName:s.name,price:s.price,customPrice:s.price==null,durationMin:s.durationMin || 30,technicianId:null,technicianName:'Anyone'});render();}}
      if(remove){lines.splice(Number(remove.dataset.estRemove),1);render();}
      if(preset){$('[data-est-value]').value=preset.dataset.estPreset;totals();}
      if(e.target.closest('[data-est-reset]')){lines=[];$('[data-est-value]').value='0';render();}
      if(e.target.closest('[data-est-checkin]')){const result=totals();if(result.error)return;$('[data-est-confirm]').textContent=lines.map(l=>l.serviceName).join(' + ')+' · '+money(result.totalCents);$('[data-est-submit-error]').textContent='';$('dialog').showModal();}
      if(e.target.closest('[data-est-cancel]'))$('dialog').close();
    });
    $('form').addEventListener('submit',e=>{
      e.preventDefault();if(pending || !$('dialog').open)return;
      const name=$('[name="customerName"]').value.trim(),phone=$('[name="phone"]').value.trim(),estimate=totals();
      if(!name||!phone||estimate.error){$('[data-est-submit-error]').textContent=estimate.error || 'Enter customer name and phone.';return;}
      pending=true;
      try {
        const result=options.checkIn({customerName:name,phone,tickets:lines.map(l=>({...l,price:Number(l.price)})),estimate});
        if(!result || !result.ok){$('[data-est-submit-error]').textContent=result?.error?.message || 'Unable to check in. Please try again.';return;}
        $('dialog').close();$('form').reset();lines=[];$('[data-est-value]').value='0';render();
      } catch(error){$('[data-est-submit-error]').textContent='Unable to check in. Please try again.';} finally {pending=false;}
    });
    render();
    return {refresh:catalog};
  }
  window.NEXORA_POS_ESTIMATE={calculate,mount};
})();
