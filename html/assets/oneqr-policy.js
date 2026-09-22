(function () {
  'use strict';
  const selector = document.getElementById('policy-language');
  if (!selector) return;
  const contents = document.querySelector('.policy-contents');
  const phone = window.matchMedia ? window.matchMedia('(max-width: 650px)') : null;
  if (contents && phone) {
    const syncContents = () => { contents.open = !phone.matches; };
    syncContents();
    phone.addEventListener('change', syncContents);
  }
  document.querySelectorAll('.policy-table table').forEach(table => {
    table.setAttribute('role', 'table');
    const headers = Array.from(table.querySelectorAll('th'), th => th.textContent.trim());
    table.querySelectorAll('tr').forEach(row => row.setAttribute('role', 'row'));
    table.querySelectorAll('th').forEach(th => th.setAttribute('role', 'columnheader'));
    table.querySelectorAll('tbody tr').forEach(row => Array.from(row.cells).forEach((cell, i) => {
      cell.setAttribute('role', 'cell');
      cell.dataset.label = headers[i];
    }));
  });
  function setLanguage(value) {
    const lang = value === 'en' ? 'en' : 'vi';
    selector.value = lang;
    document.documentElement.lang = lang;
    document.title = (lang === 'vi' ? 'Chính sách kiếm tiền OneQR' : 'OneQR Monetization Policy') + ' · Nexora Touch';
    document.querySelectorAll('[data-policy-lang]').forEach(node => { node.hidden = node.dataset.policyLang !== lang; });
    document.querySelector('.policy-toc').setAttribute('aria-label', lang === 'vi' ? 'Mục lục' : 'Contents');
    document.querySelectorAll('[data-back-to-earnings]').forEach(link => { link.href = 'oneqr-earnings.html?lang=' + lang + '#settings'; });
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  }
  selector.addEventListener('change', () => setLanguage(selector.value));
  setLanguage(new URLSearchParams(location.search).get('lang'));
})();
