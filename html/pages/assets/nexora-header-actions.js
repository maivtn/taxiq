(() => {
  const trigger = document.getElementById('apps-trigger');
  const popover = document.getElementById('apps-menu');
  if (!trigger || !popover) return;

  function close(returnFocus = false) {
    popover.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  }

  trigger.addEventListener('click', () => {
    const open = popover.hidden;
    popover.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('pointerdown', event => {
    if (!popover.hidden && !trigger.parentElement.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !popover.hidden) close(true);
  });
  popover.querySelectorAll('a').forEach(link => link.addEventListener('click', () => close()));

  document.querySelectorAll('#header-logout, #mobile-logout').forEach(button => {
    button.addEventListener('click', () => {
      document.documentElement.dataset.authState = 'guest';
      const url = new URL(location.href);
      url.searchParams.delete('header');
      try { history.replaceState(null, '', url.href); } catch (_) {}
      document.getElementById('main-nav')?.classList.remove('open');
      document.getElementById('menu-toggle')?.setAttribute('aria-expanded', 'false');
      document.dispatchEvent(new Event('nexora:nav-close'));
      close();
    });
  });
})();
