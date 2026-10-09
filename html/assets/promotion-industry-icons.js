(function () {
  'use strict';
  // Original Freepik / Flaticon Special Lineal Color PNGs. Author credit is in the page footer.
  const icons = Object.freeze({
    nail:307547, pedicure:8086132, spa:11015011, hair:3791216, tattoo:8057592,
    fitness:5109726, yoga:2963606, nutrition:5638581, restaurant:564022,
    'fast-food':2600470, coffee:1721407, bakery:4293088, 'hot-pot':1591533,
    seafood:5290730, 'food-truck':938071, bar:2957384, retail:2611215,
    apparel:7615058, gift:1040292, jewelry:391226, electronics:3930510,
    home:1365896, furniture:4540976, flowers:3314900, travel:10521422,
    entertainment:2991644, lifestyle:3208762, repair:560696, calendar:2964523,
    cosmetics:1658257, takeaway:5247756
  });
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const path = key => '../assets/promotions/industry-icons/' + (Object.hasOwn(icons,key) ? key : 'retail') + '.png';
  function image(key) {
    return '<img class="promotion-industry-icon" src="' + path(key) + '" alt="" width="32" height="32" decoding="async">';
  }

  function mountPicker(select) {
    if (!select || select.dataset.imagePicker) return;
    select.dataset.imagePicker = 'true';
    const picker = document.createElement('div');
    picker.className = 'promotion-industry-picker';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'promotion-industry-trigger';
    trigger.setAttribute('aria-haspopup','listbox');
    trigger.setAttribute('aria-expanded','false');
    trigger.setAttribute('aria-controls',select.id + '-options');
    trigger.setAttribute('aria-labelledby',select.getAttribute('aria-labelledby') + ' ' + select.id + '-value');
    const list = document.createElement('div');
    list.id = select.id + '-options';
    list.className = 'promotion-industry-options';
    list.setAttribute('role','listbox');
    list.setAttribute('aria-labelledby',select.getAttribute('aria-labelledby'));
    list.hidden = true;
    const buttons = [];
    for (const group of select.children) {
      const section = document.createElement('div');
      section.setAttribute('role','group');
      section.setAttribute('aria-label',group.label);
      const heading = document.createElement('div');
      heading.className = 'promotion-industry-group';
      heading.setAttribute('aria-hidden','true');
      heading.textContent = group.label;
      section.append(heading);
      for (const option of group.children) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'promotion-industry-option';
        button.setAttribute('role','option');
        button.tabIndex = -1;
        button.dataset.value = option.value;
        button.innerHTML = image(option.dataset.industryIcon) + '<span>' + escape(option.textContent) + '</span><span class="promotion-industry-selected" aria-hidden="true">✓</span>';
        button.addEventListener('click',() => {
          select.value = option.value;
          select.dispatchEvent(new Event('change',{bubbles:true}));
          close(true);
        });
        buttons.push(button);
        section.append(button);
      }
      list.append(section);
    }
    function sync() {
      const selected = select.selectedOptions[0];
      trigger.innerHTML = image(selected.dataset.industryIcon) + '<span id="' + select.id + '-value">' + escape(selected.textContent) + '</span><span class="promotion-industry-arrow" aria-hidden="true"></span>';
      buttons.forEach(button => button.setAttribute('aria-selected',String(button.dataset.value === select.value)));
    }
    function close(focus) {
      list.hidden = true;
      trigger.setAttribute('aria-expanded','false');
      if (focus) trigger.focus();
    }
    function open() {
      list.hidden = false;
      trigger.setAttribute('aria-expanded','true');
      (buttons.find(button => button.dataset.value === select.value) || buttons[0]).focus();
    }
    trigger.addEventListener('click',() => list.hidden ? open() : close(false));
    let typed = '', lastTyped = 0;
    picker.addEventListener('keydown',event => {
      if (event.key === 'Escape' && !list.hidden) {
        event.preventDefault(); event.stopPropagation(); close(true); return;
      }
      if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
        event.preventDefault();
        if (list.hidden) { open(); return; }
        const current = buttons.indexOf(document.activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus();
      } else if (event.key === 'Tab' && !list.hidden) close(true);
      else if (!list.hidden && event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        typed = Date.now() - lastTyped > 700 ? event.key : typed + event.key;
        lastTyped = Date.now();
        const match = buttons.find(button => button.querySelector('span').textContent.toLowerCase().startsWith(typed.toLowerCase()));
        if (match) match.focus();
      }
    });
    document.addEventListener('pointerdown',event => { if (!picker.contains(event.target)) close(false); });
    select.closest('dialog')?.addEventListener('close',() => close(false));
    select.addEventListener('change',sync);
    picker.append(trigger,list);
    select.after(picker);
    select.hidden = true;
    sync();
  }
  window.NEXORA_PROMOTION_ICONS = Object.freeze({icons,path,image,mountPicker});
})();
