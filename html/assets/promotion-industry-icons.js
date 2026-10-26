(function () {
  'use strict';
  const appearance = window.ONEQR_ACTION_APPEARANCE;
  const icons = Object.freeze({
    nail:'paintbrush', pedicure:'paintbrush', spa:'flower-2', hair:'wand-2', tattoo:'paintbrush',
    fitness:'trophy', yoga:'heart', nutrition:'heart', restaurant:'utensils',
    'fast-food':'chef-hat', coffee:'coffee', bakery:'cake', 'hot-pot':'utensils',
    seafood:'utensils', 'food-truck':'truck', bar:'music', retail:'shopping-bag',
    apparel:'shopping-bag', gift:'gift', jewelry:'crown', electronics:'phone',
    home:'home', furniture:'home', flowers:'flower-2', travel:'globe-2',
    entertainment:'gamepad-2', lifestyle:'heart', repair:'wrench', calendar:'calendar-check',
    cosmetics:'sparkles', takeaway:'shopping-bag'
  });
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const path = key => appearance.iconPath(icons[Object.hasOwn(icons,key) ? key : 'retail']);
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
      if (group.tagName === 'OPTGROUP') section.setAttribute('aria-label',group.label);
      const heading = document.createElement('div');
      heading.className = 'promotion-industry-group';
      heading.setAttribute('aria-hidden','true');
      heading.textContent = group.label;
      if (group.tagName === 'OPTGROUP') section.append(heading);
      for (const option of group.tagName === 'OPTION' ? [group] : group.children) {
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
      if (!selected) return;
      trigger.innerHTML = image(selected.dataset.industryIcon) + '<span id="' + select.id + '-value">' + escape(selected.textContent) + '</span><span class="promotion-industry-arrow" aria-hidden="true"></span>';
      buttons.forEach(button => {
        button.setAttribute('aria-selected',String(button.dataset.value === select.value));
        const option = Array.from(select.options).find(item => item.value === button.dataset.value);
        if (option) button.querySelector('span').textContent = option.textContent;
      });
      Array.from(list.children).forEach((section,index) => {
        const group = select.children[index];
        if (group?.tagName === 'OPTGROUP') { section.setAttribute('aria-label',group.label); section.querySelector('.promotion-industry-group').textContent = group.label; }
      });
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
