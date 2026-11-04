(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const map = document.querySelector('.about-vlinkpay .ecosystem-map');
  if (map && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      map.classList.add('is-arriving');
      observer.disconnect();
    }, { threshold: 0.16 });
    observer.observe(map);
  }

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const scene = document.querySelector('.vlinkpay-hero-scene');
  const card = scene?.querySelector('.hero-logo-card-vlinkpay');
  if (scene && card) {
    scene.addEventListener('pointermove', (event) => {
      const bounds = scene.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty('--pointer-x', `${(x * 14).toFixed(2)}deg`);
      card.style.setProperty('--pointer-y', `${(-y * 12).toFixed(2)}deg`);
      scene.classList.add('is-interacting');
    });

    scene.addEventListener('pointerleave', () => {
      scene.classList.remove('is-interacting');
      card.style.removeProperty('--pointer-x');
      card.style.removeProperty('--pointer-y');
    });
  }

  if (!map) return;
  let spotlightFrame = 0;
  let spotlightX = 50;
  let spotlightY = 36;
  map.addEventListener('pointermove', (event) => {
    const bounds = map.getBoundingClientRect();
    spotlightX = (100 * (event.clientX - bounds.left) / bounds.width).toFixed(1);
    spotlightY = (100 * (event.clientY - bounds.top) / bounds.height).toFixed(1);
    if (spotlightFrame) return;
    spotlightFrame = requestAnimationFrame(() => {
      map.style.setProperty('--spot-x', `${spotlightX}%`);
      map.style.setProperty('--spot-y', `${spotlightY}%`);
      spotlightFrame = 0;
    });
  });
  map.addEventListener('pointerleave', () => {
    cancelAnimationFrame(spotlightFrame);
    spotlightFrame = 0;
    map.style.removeProperty('--spot-x');
    map.style.removeProperty('--spot-y');
  });

  const core = map.querySelector('.map-node-vlinkpay');
  if (!core) return;
  core.addEventListener('pointermove', (event) => {
    const bounds = core.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    core.style.setProperty('--core-tilt-x', `${(-y * 8).toFixed(2)}deg`);
    core.style.setProperty('--core-tilt-y', `${(x * 10).toFixed(2)}deg`);
  });
  core.addEventListener('pointerleave', () => {
    core.style.removeProperty('--core-tilt-x');
    core.style.removeProperty('--core-tilt-y');
  });
})();
