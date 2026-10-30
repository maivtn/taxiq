(function () {
  'use strict';
  const catalog = window.ONEQR_INDUSTRIES;
  const GROUPS = catalog.groups;
  const industries = catalog.industries;
  const TILE_BACKGROUNDS = window.ONEQR_ACTION_APPEARANCE.backgrounds;
  const industryIcons = window.NEXORA_INDUSTRY_ICONS;
  function industryImage(key, size = 36) {
    return industryIcons.image(key,{size,catalog:'oneqr',className:'oneqr-flat-icon'});
  }
  function industryIcon(industry) { return industryImage(industry.id); }
  function mount(root, options = {}) {
    const $ = selector => root.querySelector(selector);
    const controller = new AbortController();
    root.classList.add('oneqr-industry-picker');
    root.innerHTML = `<div class="library-heading"><div>${options.embedded ? '' : '<span class="section-step">Industry templates</span><div class="picker-title-row"><a class="picker-back-link" href="qr-stations.html?tab=one-qr"><span aria-hidden="true">←</span>Back</a><h2>Choose your business industry</h2></div>'}<p>Select the closest match. Your current custom modules stay in place when you switch templates.</p></div><div class="picker-heading-actions"><div class="language-switch" role="group" aria-label="Template language"><button type="button" class="is-active" data-language="en" aria-pressed="true">EN</button><button type="button" data-language="vi" aria-pressed="false">VI</button></div></div></div><label class="industry-search" for="industry-search-input"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input id="industry-search-input" type="search" placeholder="Search by industry, service, or keyword" aria-label="Search by industry, service, or keyword" autocomplete="off"><kbd>/</kbd></label><div class="group-tabs-wrap"><div class="group-tabs" role="tablist" aria-label="Industry groups" id="industry-group-tabs"></div></div><div class="library-result-row"><p id="industry-result-count" aria-live="polite"></p><button type="button" class="clear-filter" id="clear-industry-filter" hidden>Clear filters</button></div><div class="industry-grid" id="industry-grid" aria-live="polite"></div>`;
    const state = { group: 'all', query: '', language: 'en', selected: options.selected || 'nails' };
    const groupById = id => GROUPS.find(group => group.id === id);
    const label = record => record[state.language] || record.en;
    const actionIds = catalog.recommended;
    const refreshIcons = () => window.lucide?.createIcons();
    function renderGroups() {
      const tabs = $('#industry-group-tabs');
      const allLabel = state.language === 'vi' ? 'Tất cả' : 'All industries';
      tabs.innerHTML = [`<button class="group-tab ${state.group === 'all' ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.group === 'all'}" data-group="all">${industryImage('retail', 20)}${allLabel}<span>${industries.length}</span></button>`]
        .concat(GROUPS.map((group) => `<button class="group-tab ${state.group === group.id ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.group === group.id}" data-group="${group.id}">${industryImage('group:'+group.id, 20)}${label(group)}<span>${group.items.split('|').length}</span></button>`)).join('');
      tabs.querySelectorAll('[data-group]').forEach((button) => button.addEventListener('click', () => {
        state.group = button.dataset.group;
        renderGroups();
        renderIndustries();
      }, { signal: controller.signal }));
    }

    function filteredIndustries() {
      const query = state.query.trim().toLocaleLowerCase();
      return industries.filter((industry) => {
        const matchesGroup = state.group === 'all' || industry.groupId === state.group;
        const group = groupById(industry.groupId);
        const haystack = `${industry.en} ${industry.vi} ${group.en} ${group.vi}`.toLocaleLowerCase();
        return matchesGroup && (!query || haystack.includes(query));
      });
    }

    function renderIndustries() {
      const matches = filteredIndustries();
      const grid = $('#industry-grid');
      const noun = state.language === 'vi' ? 'mẫu ngành phù hợp' : `matching ${matches.length === 1 ? 'template' : 'templates'}`;
      $('#industry-result-count').textContent = state.language === 'vi' ? `${matches.length} ${noun}` : `${matches.length} ${noun}`;
      $('#clear-industry-filter').hidden = state.group === 'all' && !state.query;
      if (!matches.length) {
        grid.innerHTML = `<div class="no-results"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M8 8l6 6m0-6-6 6"/></svg></span><h3>${state.language === 'vi' ? 'Không tìm thấy ngành phù hợp' : 'No matching industry found'}</h3><p>${state.language === 'vi' ? 'Thử từ khóa ngắn hơn hoặc xem tất cả nhóm.' : 'Try a shorter keyword or browse all groups.'}</p></div>`;
        refreshIcons();
        return;
      }
      grid.innerHTML = matches.map((industry) => {
        const group = groupById(industry.groupId);
        const selected = state.selected === industry.id;
        const actionCount = actionIds(industry).length;
        const actionCopy = state.language === 'vi' ? `${actionCount} hành động sẵn có` : `${actionCount} actions ready`;
        const tileBackground = TILE_BACKGROUNDS[industries.indexOf(industry) % TILE_BACKGROUNDS.length];
        return `<button class="industry-card ${selected ? 'is-selected' : ''}" type="button" data-industry="${industry.id}" aria-pressed="${selected}" style="--card-gradient:${tileBackground}"><span class="industry-card-icon" aria-hidden="true">${industryIcon(industry)}</span><div><strong>${label(industry)}</strong><small>${label(group)} · ${actionCopy}</small></div><span class="selected-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></span></button>`;
      }).join('');
      grid.querySelectorAll('[data-industry]').forEach((button) => button.addEventListener('click', () => selectIndustry(button.dataset.industry), { signal: controller.signal }));
      refreshIcons();
    }


    function selectIndustry(id) {
      const industry = industries.find(item => item.id === id);
      if (industry) options.onSelect?.(industry);
    }
    $('#industry-search-input').addEventListener('input', event => { state.query = event.target.value; renderIndustries(); }, { signal: controller.signal });
    $('#clear-industry-filter').addEventListener('click', () => {
      state.group = 'all'; state.query = ''; $('#industry-search-input').value = '';
      renderGroups(); renderIndustries();
    }, { signal: controller.signal });
    root.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
      state.language = button.dataset.language;
      root.querySelectorAll('[data-language]').forEach(item => {
        item.classList.toggle('is-active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      renderGroups(); renderIndustries();
    }, { signal: controller.signal }));
    (options.embedded ? root : document).addEventListener('keydown', event => {
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        event.preventDefault(); $('#industry-search-input').focus();
      }
    }, { signal: controller.signal });
    renderGroups(); renderIndustries(); refreshIcons();
    return { destroy() { controller.abort(); } };
  }
  window.ONEQR_INDUSTRY_PICKER = { mount };
  const standalone = document.getElementById('industry-picker-view');
  if (!standalone) return;
  let selected = 'nails';
  try {
    const draft = JSON.parse(sessionStorage.getItem('taxiq:oneqr-editor-draft') || 'null');
    const saved = JSON.parse(localStorage.getItem('taxiq:oneqr-config') || 'null');
    const applied = draft?.industrySelection || saved?.industrySelection || JSON.parse(localStorage.getItem('taxiq:oneqr-industry-template') || 'null');
    selected = applied?.industryId || selected;
  } catch (error) { /* Use the default selection. */ }
  mount(standalone, { selected, onSelect(industry) {
    try { sessionStorage.setItem('taxiq:oneqr-pending-industry', industry.id); }
    catch (error) { standalone.querySelector('#industry-result-count').textContent = 'Could not keep your selection. Please try again.'; return; }
    window.location.href = 'qr-stations.html?tab=one-qr';
  } });
})();
