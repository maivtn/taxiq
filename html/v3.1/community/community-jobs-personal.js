/* Personal Jobs entry from the PO; prototype editing tools are omitted per Final Spec D4. */
(() => {
  'use strict';
  function create({member, role, language, po, esc, toast}) {
    const key = 'nexora-v31:jobs-page-copy:' + encodeURIComponent(member());
    let saved;
    try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch { saved = {}; }
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
    let root, jobsNav, shiftsNav, hero, view, tab;
    const isPersonal = () => role() === 'staff' && new URLSearchParams(location.search).get('account') === 'personal';
    const defaults = {
      heroTitle: ['Tôi muốn làm việc', 'I want to work'],
      heroDesc: ['Tìm việc phù hợp, đăng lịch rảnh nhận ca thêm hoặc giới thiệu dịch vụ bạn có thể làm. Kết nối trực tiếp với chủ tiệm và doanh nghiệp.', 'Find the right job, share when you are free for extra shifts, or show the services you offer. Connect directly with shops and businesses.'],
      startTitle: ['Bạn muốn bắt đầu như thế nào?', 'How would you like to start?'],
      startDesc: ['Chọn đúng nhu cầu, rồi đăng hoặc xem việc ngay.', 'Choose your path, then post or browse right away.'],
      careerTitle: ['Tôi đang tìm việc', 'I am looking for work'],
      careerDesc: ['Full-time hoặc part-time lâu dài. Giới thiệu hồ sơ và tay nghề của bạn.', 'Full-time or part-time work. Introduce your profile and skills.'],
      shiftTitle: ['Tôi rảnh, muốn nhận ca', 'I am free for a shift'],
      shiftDesc: ['Đăng ngày giờ rảnh để nhận ca gấp, nửa ngày hoặc nguyên ngày.', 'Share open hours for urgent, half-day or full-day shifts.'],
      serviceTitle: ['Tôi nhận làm dịch vụ', 'I offer services'],
      serviceDesc: ['Chọn nghề, nghề con và tự thêm mọi kỹ năng bạn có.', 'Choose a trade, subcategory and add your own skills.']
    };
    function field(tag, name) {
      const value = saved?.[language()]?.[name], authored = typeof value === 'string' && value;
      return `<${tag}${authored ? ' data-community-authored' : ''} data-jobs-copy="${name}">${esc(authored ? value : po(...defaults[name]))}</${tag}>`;
    }
    function sectionNav(shifts = false) {
      return `<nav class="jobs-personal-sections" aria-label="${esc(po('Việc làm & Ca làm thêm', 'Jobs & Extra Shifts'))}"><button type="button" ${shifts ? 'data-view="jobs"' : 'data-jobs-tab="browse" class="active" aria-current="page"'}>${esc(po('Tất cả việc làm', 'All jobs'))}</button><button type="button" data-view="daywork"${shifts ? ' class="active" aria-current="page"' : ''}>${esc(po('Ca làm thêm', 'Extra shifts'))}</button></nav>`;
    }
    function paint() {
      if (!root) return;
      root.hidden = tab !== 'browse';
      root.innerHTML = `<section class="jobs-personal-panel"><div class="jobs-personal-start">${field('h2', 'startTitle')}${field('p', 'startDesc')}</div><section class="jobs-personal-paths">${[
        ['career', 'briefcase', 'data-template="seeking"', 'Đăng hồ sơ tìm việc', 'Post job search'],
        ['shift', 'calendar-clock', 'data-jobs-extra="availability-new"', 'Đăng lịch rảnh', 'Post availability'],
        ['service', 'wrench', 'data-jobs-extra="new-service-offer"', 'Đăng dịch vụ của tôi', 'Post my services']
      ].map(([id, icon, action, vi, en]) => `<article class="jobs-personal-path" data-jobs-path="${id}"><span class="jobs-personal-symbol" aria-hidden="true"><img src="/html/assets/icon-oneqr/issue-2040-oneqr-${icon}-3d.png" alt=""></span>${field('h3', id + 'Title')}${field('p', id + 'Desc')}<button type="button" class="btn soft" ${action}>${esc(po(vi, en))} →</button></article>`).join('')}</section></section>`;
      hero.innerHTML = `<div>${field('h2', 'heroTitle')}${field('p', 'heroDesc')}</div><div class="community-po-hero-actions"><button type="button" class="btn primary" data-template="seeking">＋ ${esc(po('Đăng nhu cầu làm việc', 'Post your availability'))}</button><button type="button" class="btn" data-jobs-tab="matched">✧ ${esc(po('Xem việc phù hợp', 'See my matches'))}</button></div>`;
      root.querySelector('.jobs-personal-start').before(hero);
    }
    function render(nextView, nextTab, nextHero, navigation) {
      view = nextView; tab = nextTab; hero = nextHero;
      if (!jobsNav) {
        jobsNav = document.createElement('div'); jobsNav.className = 'jobs-section-nav'; view.prepend(jobsNav);
      }
      jobsNav.innerHTML = sectionNav();
      if (!shiftsNav && document.getElementById('dayworkView')) {
        shiftsNav = document.createElement('div'); shiftsNav.className = 'jobs-section-nav jobs-personal-shifts-nav';
        document.getElementById('dayworkView').prepend(shiftsNav);
      }
      if (shiftsNav) shiftsNav.innerHTML = sectionNav(true);
      const personal = isPersonal();
      view.classList.toggle('jobs-personal-entry', personal);
      if (!personal) {
        if (root?.contains(hero)) navigation.before(hero);
        root?.remove(); root = null; return;
      }
      if (!root) {
        root = document.createElement('section'); root.className = 'jobs-personal-entry-content';
      }
      navigation.querySelector('.jobs-workflow-head').after(root);
      paint();
    }
    return {render, destroy() { root?.remove(); jobsNav?.remove(); shiftsNav?.remove(); }};
  }
  window.NEXORA_COMMUNITY_JOBS_PERSONAL = {create};
})();
