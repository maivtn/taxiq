(() => {
  // Match richDisc/startTick in the PO's nexora-oneqr-tai-tiem.html:
  // a new preview every 2,600 ms, replaced after a 350 ms fade.
  const nearby = document.querySelector('.explore-nearby .discovery-preview');
  const search = document.querySelector('.explore-deals .discovery-preview');
  if (!nearby || !search) return;

  const deals = [
    'Dental exam + cleaning $79 · 2.1 mi',
    'Buy one milk tea, get one free · 0.4 mi',
    '15% off birthday cakes · 1.0 mi',
    'Tonight: 2 lb crawfish for $25 · 0.7 mi',
    'Car wash + vacuum $12 · 1.5 mi',
    '$10 off dog bath & grooming · 2.9 mi',
    'Pho + drink combo $9 · 3.0 mi'
  ];
  const queries = [...document.querySelectorAll('.discovery-query')].map(link => link.dataset.devQuery);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let interval;
  let fade;

  function updatePreviews() {
    nearby.textContent = deals[index % deals.length];
    search.textContent = `“${queries[index % queries.length]}”`;
    nearby.classList.remove('is-fading');
    search.classList.remove('is-fading');
  }

  function stop() {
    window.clearInterval(interval);
    window.clearTimeout(fade);
    nearby.classList.remove('is-fading');
    search.classList.remove('is-fading');
  }

  function start() {
    stop();
    if (document.hidden || reducedMotion.matches || !queries.length) return;
    interval = window.setInterval(() => {
      nearby.classList.add('is-fading');
      search.classList.add('is-fading');
      fade = window.setTimeout(() => {
        index += 1;
        updatePreviews();
      }, 350);
    }, 2600);
  }

  updatePreviews();
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener('change', start);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', start);
  start();
})();
