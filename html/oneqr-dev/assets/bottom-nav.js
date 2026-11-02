(() => {
  const copy = {
    en: { label: 'One QR navigation', home: 'Main Menu', nearby: 'Nearby', booking: 'Booking' },
    vi: { label: 'Điều hướng One QR', home: 'Menu chính', nearby: 'Khám phá quanh đây', booking: 'Đặt lịch' }
  };
  const icons = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    nearby: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    booking: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-12 5 2 2 4-4"/>'
  };
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
    link.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[item.key]}</svg><span></span>`;
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
