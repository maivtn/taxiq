(() => {
  // Match richDisc/startTick in the PO's nexora-oneqr-tai-tiem.html:
  // a new preview every 2,600 ms, replaced after a 350 ms fade.
  const nearby = document.querySelector('.explore-nearby .discovery-preview');
  const search = document.querySelector('.explore-deals .discovery-preview');
  if (!nearby || !search) return;

  const deals = [
    'Khám + cạo vôi $79 · 2.1 mi',
    'Trà sữa mua 1 tặng 1 · 0.4 mi',
    'Giảm 15% bánh sinh nhật · 1.0 mi',
    'Tối nay: 2 lb tôm hùm đất giá $25 · 0.7 mi',
    'Rửa xe + hút bụi $12 · 1.5 mi',
    'Tắm & cắt lông chó giảm $10 · 2.9 mi',
    'Combo phở + nước $9 · 3.0 mi'
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
