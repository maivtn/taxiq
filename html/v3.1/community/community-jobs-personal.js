/* Personal Jobs entry copied from the PO jobs.html worker hero, editor and paths. */
(() => {
  'use strict';
  function create({member, role, language, po, esc, toast}) {
    const key = 'nexora-v31:jobs-page-copy:' + encodeURIComponent(member());
    let saved;
    try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch { saved = {}; }
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
    let root, shiftsNav, hero, view, tab, editing = false, draft = null;
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
      const value = (editing ? draft : saved)?.[language()]?.[name];
      return `<${tag} data-community-authored data-jobs-copy="${name}"${editing ? ' contenteditable="true" spellcheck="true"' : ''}>${esc(typeof value === 'string' && value ? value : po(...defaults[name]))}</${tag}>`;
    }
    function sectionNav(shifts = false) {
      return `<nav class="jobs-personal-sections" aria-label="${esc(po('Việc làm & Ca làm thêm', 'Jobs & Extra Shifts'))}"><button type="button" ${shifts ? 'data-view="jobs"' : 'data-jobs-tab="browse" class="active" aria-current="page"'}>${esc(po('Tất cả việc làm', 'All jobs'))}</button><button type="button" data-view="daywork"${shifts ? ' class="active" aria-current="page"' : ''}>${esc(po('Ca làm thêm', 'Extra shifts'))}</button></nav>`;
    }
    function paint() {
      if (!root) return;
      const actions = editing
        ? `<button type="button" class="btn" data-jobs-copy-action="cancel">${esc(po('Hủy', 'Cancel'))}</button><button type="button" class="btn primary" data-jobs-copy-action="save">${esc(po('Lưu thay đổi', 'Save changes'))}</button>`
        : `<button type="button" class="btn primary" data-jobs-copy-action="edit">✎ ${esc(po('Chỉnh sửa', 'Edit'))}</button>`;
      root.innerHTML = `${sectionNav()}<section class="jobs-personal-panel"${tab !== 'browse' ? ' hidden' : ''}><div class="jobs-personal-demo">✦ ${esc(po('Bản mẫu · Tin đăng và hồ sơ lưu trên máy này.', 'Demo · Posts and profiles stay in this browser.'))}</div><div class="jobs-personal-editbar" role="toolbar" aria-label="${esc(po('Thanh chỉnh sửa nội dung', 'Content editing toolbar'))}"><strong>✎ ${esc(po('Chỉnh sửa nội dung trực tiếp', 'Edit page content directly'))}</strong><div>${actions}</div></div><div class="jobs-personal-start">${field('h2', 'startTitle')}${field('p', 'startDesc')}</div><section class="jobs-personal-paths">${[
        ['career', '◉', 'data-template="seeking"', 'Đăng hồ sơ tìm việc', 'Post job search'],
        ['shift', '◷', 'data-jobs-extra="availability-new"', 'Đăng lịch rảnh', 'Post availability'],
        ['service', '✦', 'data-jobs-extra="new-service-offer"', 'Đăng dịch vụ của tôi', 'Post my services']
      ].map(([id, symbol, action, vi, en]) => `<article class="jobs-personal-path" data-jobs-path="${id}"><span class="jobs-personal-symbol" aria-hidden="true">${symbol}</span>${field('h3', id + 'Title')}${field('p', id + 'Desc')}<button type="button" class="btn soft" ${action}>${esc(po(vi, en))} →</button></article>`).join('')}</section></section>`;
      hero.innerHTML = `<div>${field('h2', 'heroTitle')}${field('p', 'heroDesc')}</div><div class="community-po-hero-actions"><button type="button" class="btn primary" data-template="seeking">＋ ${esc(po('Đăng nhu cầu làm việc', 'Post your availability'))}</button><button type="button" class="btn" data-jobs-tab="matched">✧ ${esc(po('Xem việc phù hợp', 'See my matches'))}</button></div>`;
      root.querySelector('.jobs-personal-start').before(hero);
    }
    function capture() {
      draft[language()] ||= {};
      root.querySelectorAll('[data-jobs-copy]').forEach(node => {
        const value = node.textContent.trim();
        if (value) draft[language()][node.dataset.jobsCopy] = value;
      });
    }
    function onClick(event) {
      const action = event.target.closest('[data-jobs-copy-action]')?.dataset.jobsCopyAction;
      if (!action || role() !== 'staff') return;
      if (action === 'edit') { draft = JSON.parse(JSON.stringify(saved)); editing = true; }
      if (action === 'cancel') { editing = false; draft = null; toast(po('Đã hủy thay đổi chưa lưu.', 'Unsaved changes discarded.')); }
      if (action === 'save') {
        capture();
        try { localStorage.setItem(key, JSON.stringify(draft)); }
        catch { toast(po('Đã có lỗi xảy ra. Vui lòng thử lại.', 'Something went wrong. Please try again.')); return; }
        saved = draft; editing = false; draft = null;
        toast(po('Đã lưu nội dung giao diện trên trình duyệt này.', 'Page content saved in this browser.'));
      }
      paint();
      root.querySelector(editing ? '[contenteditable]' : '[data-jobs-copy-action="edit"]')?.focus();
    }
    function render(nextView, nextTab, nextHero, navigation) {
      view = nextView; tab = nextTab; hero = nextHero;
      const personal = role() === 'staff';
      view.classList.toggle('jobs-personal-entry', personal);
      if (!personal) {
        if (root?.contains(hero)) navigation.before(hero);
        root?.remove(); shiftsNav?.remove(); root = null; shiftsNav = null; editing = false; return;
      }
      if (editing && root) capture();
      if (!root) {
        root = document.createElement('section'); root.className = 'jobs-personal-entry-content';
        root.addEventListener('click', onClick); view.prepend(root);
      }
      if (!shiftsNav && document.getElementById('dayworkView')) {
        shiftsNav = document.createElement('div'); shiftsNav.className = 'jobs-personal-shifts-nav';
        shiftsNav.innerHTML = sectionNav(true); document.getElementById('dayworkView').prepend(shiftsNav);
      }
      paint();
    }
    return {render, destroy() { root?.remove(); shiftsNav?.remove(); }};
  }
  window.NEXORA_COMMUNITY_JOBS_PERSONAL = {create};
})();
