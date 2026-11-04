(() => {
  document.querySelectorAll('.site-language a[data-language]').forEach(link => {
    link.addEventListener('click', () => {
      const hash = window.location.hash;
      if (hash) link.href = `${link.getAttribute('href').split('#')[0]}${hash}`;
      try { localStorage.setItem('nexora-dashboard-language-v1', link.dataset.language); } catch (_) {}
    });
  });
  const root = document.querySelector('[data-story-showcase]');
  if (!root) return;

  const choices = [...root.querySelectorAll('[data-story-slide]')];
  const panels = [...root.querySelectorAll('[data-story-panel]')];
  const counter = root.querySelector('[data-story-counter]');
  const previous = root.querySelector('[data-story-previous]');
  const next = root.querySelector('[data-story-next]');
  const stage = root.querySelector('.nexora-story-stage');
  if (!choices.length || choices.length !== panels.length || !counter || !previous || !next || !stage) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let timer = null;
  let inView = false;
  let hovered = false;
  let focused = false;
  let touchStartX = null;

  function show(index) {
    active = (index + panels.length) % panels.length;
    choices.forEach((choice, i) => choice.setAttribute('aria-pressed', String(i === active)));
    panels.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === active);
      panel.setAttribute('aria-hidden', String(i !== active));
    });
    counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
  }

  function updateAutoplay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    if (inView && !hovered && !focused && !document.hidden && !reducedMotion.matches) {
      timer = window.setInterval(() => show(active + 1), 6500);
    }
  }

  choices.forEach((choice, index) => choice.addEventListener('click', () => show(index)));
  previous.addEventListener('click', () => show(active - 1));
  next.addEventListener('click', () => show(active + 1));
  root.addEventListener('mouseenter', () => { hovered = true; updateAutoplay(); });
  root.addEventListener('mouseleave', () => { hovered = false; updateAutoplay(); });
  root.addEventListener('focusin', () => { focused = true; updateAutoplay(); });
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) {
      focused = false;
      updateAutoplay();
    }
  });
  stage.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  stage.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) > 45) show(active + (distance < 0 ? 1 : -1));
  }, { passive: true });
  document.addEventListener('visibilitychange', updateAutoplay);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', updateAutoplay);
  else reducedMotion.addListener(updateAutoplay);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateAutoplay();
    }, { threshold: 0.35 });
    observer.observe(root);
  } else {
    inView = true;
    updateAutoplay();
  }
})();
