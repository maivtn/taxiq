(() => {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1101px)');
  const reset = link => {
    link.style.removeProperty('--nav-tilt-x');
    link.style.removeProperty('--nav-tilt-y');
  };

  nav.querySelectorAll('.nav-trigger').forEach(link => {
    link.addEventListener('pointermove', event => {
      if (reduceMotion.matches || !desktop.matches || event.pointerType !== 'mouse') return;
      const bounds = link.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      link.style.setProperty('--nav-tilt-x', `${(-y * 10).toFixed(1)}deg`);
      link.style.setProperty('--nav-tilt-y', `${(x * 12).toFixed(1)}deg`);
    });
    link.addEventListener('pointerleave', () => reset(link));
    link.addEventListener('blur', () => reset(link));
  });
})();
