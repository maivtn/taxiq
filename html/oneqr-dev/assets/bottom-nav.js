(() => {
  const copy = {
    en: { label: 'One QR navigation', home: 'Main Menu', nearby: 'Nearby', booking: 'Booking' },
    vi: { label: 'Điều hướng One QR', home: 'Menu chính', nearby: 'Khám phá quanh đây', booking: 'Đặt lịch' }
  };
  const icon = window.OneQrIcons.line;
  const icons = { home: 'house', nearby: 'map-pin', booking: 'calendar-check' };
  const nav = document.createElement('nav');
  nav.className = 'oneqr-bottom-nav';
  const discoveryPage = document.body.dataset.discoveryPage;
  const selected = discoveryPage ? 'nearby' : 'home';
  const items = [
    { key: 'home', href: 'index.html' },
    { key: 'nearby', href: 'nearby.html' },
    { key: 'booking' }
  ];
  const links = items.map(item => {
    const link = document.createElement('a');
    link.innerHTML = `${icon(icons[item.key])}<span></span>`;
    if (item.key === selected) link.setAttribute('aria-current', discoveryPage === 'deals' ? 'true' : 'page');
    nav.append(link);
    return { item, link };
  });

  function setLanguage(language) {
    const next = language === 'vi' ? 'vi' : 'en';
    nav.setAttribute('aria-label', copy[next].label);
    links.forEach(({ item, link }) => {
      link.querySelector('span').textContent = copy[next][item.key];
      if (item.href) link.href = `${item.href}?lang=${next}`;
    });
  }

  document.body.classList.add('has-oneqr-bottom-nav');
  document.body.append(nav);
  document.addEventListener('oneqr-dev:language-change', event => setLanguage(event.detail));
  setLanguage(document.documentElement.lang);
})();
