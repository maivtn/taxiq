(() => {
  const selector = document.getElementById('language');
  const trigger = document.getElementById('language-trigger');
  const menu = document.getElementById('language-menu');
  if (!selector || !trigger || !menu) return;

  const picker = trigger.closest('.language-picker');
  const options = [...selector.options].map(source => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'language-option';
    button.setAttribute('role', 'menuitemradio');
    button.lang = source.value;
    button.dataset.language = source.value;
    button.textContent = source.textContent;
    button.tabIndex = -1;
    button.addEventListener('click', () => {
      selector.value = source.value;
      selector.dispatchEvent(new Event('change', { bubbles: true }));
      close(true);
    });
    return button;
  });
  menu.replaceChildren(...options);

  function sync() {
    const selected = selector.selectedOptions[0];
    trigger.setAttribute('aria-label', `${selector.getAttribute('aria-label')}: ${selected.textContent}`);
    options.forEach(option => {
      option.setAttribute('aria-checked', String(option.dataset.language === selector.value));
    });
  }

  function close(restoreFocus = false) {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  }

  function open(index = options.findIndex(option => option.dataset.language === selector.value)) {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    options[Math.max(0, index)]?.focus();
  }

  trigger.addEventListener('click', () => menu.hidden ? open() : close());
  trigger.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    open(event.key === 'ArrowUp' ? options.length - 1 : 0);
  });

  menu.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      close(true);
      return;
    }
    const index = options.indexOf(document.activeElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % options.length
      : event.key === 'ArrowUp' ? (index - 1 + options.length) % options.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? options.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    options[next].focus();
  });

  document.addEventListener('pointerdown', event => {
    if (!menu.hidden && !picker.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {
      event.preventDefault();
      close(true);
    }
  });
  picker.addEventListener('focusout', event => {
    if (!picker.contains(event.relatedTarget)) close();
  });
  document.addEventListener('nexora:language-change', sync);
  sync();
})();
