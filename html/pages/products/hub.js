(() => {
  const supported = new Set(['vi', 'en', 'zh', 'ko', 'es', 'ja', 'th', 'ar', 'fr']);
  let language = 'vi';
  try {
    const saved = localStorage.getItem('nexora-dashboard-language-v1');
    if (supported.has(saved)) language = saved;
  } catch (_) { /* The local preview may block storage. */ }

  const catalog = window.NEXORA_PRODUCT_LOCALES || {};
  const translate = english => catalog[english]?.[language] || english;
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-vi][data-en]').forEach(node => {
    const vietnamese = node.getAttribute('data-vi');
    const english = node.getAttribute('data-en');
    node.textContent = language === 'vi' ? vietnamese : language === 'en' ? english : translate(english);
  });

  const titles = {
    vi: '12 sản phẩm cho vận hành và tăng trưởng salon | Nexora Touch',
    en: '12 salon operations and growth products | Nexora Touch'
  };
  const descriptions = {
    vi: 'Khám phá 12 sản phẩm Nexora Touch theo ba nhóm: vận hành, kết nối khách hàng và tăng trưởng. Xem trang riêng, tính năng và trạng thái của từng sản phẩm.',
    en: 'Explore 12 Nexora Touch products across daily operations, customer connection and growth. Each product has its own page, features and availability notes.'
  };
  document.title = language === 'vi' ? titles.vi : language === 'en' ? titles.en : translate(titles.en);
  document.querySelector('meta[name="description"]').content = language === 'vi' ? descriptions.vi : language === 'en' ? descriptions.en : translate(descriptions.en);

  const labels = [
    ['.skip', 'Bỏ qua điều hướng', 'Skip navigation'],
    ['.top nav', 'Điều hướng', 'Navigation'],
    ['.breadcrumb', 'Đường dẫn trang', 'Breadcrumb'],
    ['.product-footer-bottom nav', 'Liên kết pháp lý và hệ sinh thái', 'Legal and ecosystem links']
  ];
  labels.forEach(([selector, vietnamese, english]) => {
    const node = document.querySelector(selector);
    if (!node) return;
    const value = language === 'vi' ? vietnamese : language === 'en' ? english : translate(english);
    if (node.matches('.skip')) node.textContent = value;
    else node.setAttribute('aria-label', value);
  });
})();
