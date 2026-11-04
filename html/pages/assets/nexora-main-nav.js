(() => {
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('menu-toggle');
  if (!nav || !toggle) return;

  const groups = [...nav.querySelectorAll('.nav-group')];
  const mobile = window.matchMedia('(max-width: 1100px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const navLabels = { vi:'Điều hướng trang chủ', en:'Home navigation', zh:'首页导航', ko:'홈 탐색', es:'Navegación de inicio', ja:'ホームのナビゲーション', th:'เมนูนำทางหน้าหลัก', ar:'التنقل في الصفحة الرئيسية', fr:'Navigation de l’accueil' };
  const openLabels = { vi:'Mở menu', en:'Open menu', zh:'打开菜单', ko:'메뉴 열기', es:'Abrir menú', ja:'メニューを開く', th:'เปิดเมนู', ar:'افتح القائمة', fr:'Ouvrir le menu' };
  const closeLabels = { vi:'Đóng menu', en:'Close menu', zh:'关闭菜单', ko:'메뉴 닫기', es:'Cerrar menú', ja:'メニューを閉じる', th:'ปิดเมนู', ar:'إغلاق القائمة', fr:'Fermer le menu' };
  let lastTrigger = null;
  function updateLanguage() {
    const language = document.documentElement.lang;
    nav.setAttribute('aria-label', navLabels[language] || navLabels.vi);
    toggle.setAttribute('aria-label', nav.classList.contains('open') ? (closeLabels[language] || closeLabels.vi) : (openLabels[language] || openLabels.vi));
  }

  function setGroup(group, open) {
    group.querySelector('.nav-trigger').setAttribute('aria-expanded', String(open));
    group.querySelector('.nav-panel').hidden = !open;
  }
  function closeGroups() { groups.forEach(group => setGroup(group, false)); }
  function closeAll(restoreFocus = false) {
    closeGroups();
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', openLabels[document.documentElement.lang] || openLabels.vi);
    if (restoreFocus) (mobile.matches ? toggle : lastTrigger)?.focus();
  }
  function closeAppMenu() {
    const apps = document.getElementById('apps-menu');
    const appTrigger = document.getElementById('apps-trigger');
    if (apps && appTrigger) {
      apps.hidden = true;
      appTrigger.setAttribute('aria-expanded', 'false');
    }
  }

  toggle.addEventListener('click', () => {
    const opening = !nav.classList.contains('open');
    closeAppMenu();
    nav.classList.toggle('open', opening);
    document.body.classList.toggle('nav-open', opening && mobile.matches);
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.setAttribute('aria-label', opening ? (closeLabels[document.documentElement.lang] || closeLabels.vi) : (openLabels[document.documentElement.lang] || openLabels.vi));
    closeGroups();
  });

  groups.forEach(group => {
    const trigger = group.querySelector('.nav-trigger');
    trigger.addEventListener('click', () => {
      const opening = trigger.getAttribute('aria-expanded') !== 'true';
      lastTrigger = trigger;
      closeAppMenu();
      closeGroups();
      setGroup(group, opening);
    });
  });

  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || !nav.contains(link)) return;
    const industry = link.dataset.industry;
    if (industry !== undefined) {
      document.querySelectorAll('#industry-tabs button')[Number(industry)]?.click();
    }
    const href = link.getAttribute('href');
    closeAll();
    if (href?.startsWith('#')) {
      const target = document.getElementById(href.slice(1));
      if (target) {
        event.preventDefault();
        if (location.hash !== href) location.hash = href;
        requestAnimationFrame(() => target.scrollIntoView({
          behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start'
        }));
      }
    }
  });

  document.addEventListener('pointerdown', event => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) closeAll();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeAll(true);
  });
  mobile.addEventListener('change', () => closeAll());
  document.addEventListener('nexora:nav-close', () => closeAll());
  document.addEventListener('nexora:language-change', updateLanguage);
  updateLanguage();
})();
