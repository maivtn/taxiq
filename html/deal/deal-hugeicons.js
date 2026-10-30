/* Deal industry icons: free Hugeicons rendered locally with Iconify. */
(() => {
  'use strict';

  const data = window.NEXORA_DEAL_HUGEICONS_DATA;
  const IconifyIcon = window.customElements.get('iconify-icon');
  if (!data || !IconifyIcon) return;

  IconifyIcon.addCollection(data.collection);
  const previous = window.NEXORA_INDUSTRY_ICONS;
  const aliases = { ...data.aliases, ...previous?.aliases };
  const groups = { ...data.groups, ...previous?.groups };
  const sourceKeys = new Map(Object.keys(previous?.files || {}).map(key => [previous.path(key), key]));
  const paths = new Map();
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));

  function resolve(key, catalog = 'default') {
    key = String(key || 'other');
    if (key.startsWith('group:')) key = groups[key.slice(6)] || 'other';
    else if (key.endsWith('_other')) key = groups[key.slice(0, -6)] || 'other';
    key = previous?.catalogs[catalog]?.[key] || aliases[key] || key;
    return Object.hasOwn(data.industries, key) ? key : previous?.resolve(key, catalog) || 'other';
  }

  function image(key, options = {}) {
    const canonical = resolve(key, options.catalog);
    const name = data.industries[canonical];
    // Keep dedicated artwork when the free collection has no suitable trade icon.
    if (!name && previous) return previous.image(key, options);
    const size = Math.max(16, Math.min(96, Number(options.size) || 24));
    const iconName = name || data.industries.other;
    const icon = IconifyIcon.buildIcon({ width:24, height:24, ...data.collection.icons[iconName] }, { width:size, height:size });
    const attributes = Object.entries(icon.attributes).map(([name, value]) => `${name}="${escape(value)}"`).join(' ');
    return `<svg xmlns="http://www.w3.org/2000/svg" ${attributes} class="industry-flat-icon deal-hugeicon ${escape(options.className || '')}" data-hugeicon-key="${escape(canonical)}" data-icon="hugeicons:${escape(iconName)}" aria-hidden="true" focusable="false">${icon.body}</svg>`;
  }

  function path(key, catalog) {
    const canonical = resolve(key, catalog);
    if (!data.industries[canonical] && previous) return previous.path(key, catalog);
    if (!paths.has(canonical)) {
      const svg = image(canonical).replace('<svg ', '<svg color="#7153db" ');
      paths.set(canonical, 'data:image/svg+xml,' + encodeURIComponent(svg));
    }
    return paths.get(canonical);
  }

  window.NEXORA_DEAL_HUGEICONS = Object.freeze({ image, path, resolve });
  if (previous) window.NEXORA_INDUSTRY_ICONS = Object.freeze({ ...previous, image, path, resolve });

  const style = document.createElement('style');
  style.id = 'deal-hugeicons-style';
  style.textContent = `
    .deal-hugeicon{display:inline-block;flex-shrink:0;vertical-align:middle;pointer-events:none}
    .dw-category-icon .deal-hugeicon{width:32px;height:32px}
    .dw-chip .deal-hugeicon,[data-dw-selected-group] .deal-hugeicon{width:20px;height:20px}
    .dw-category-group h2 .deal-hugeicon{width:24px;height:24px}
    .industry-grid button>span .deal-hugeicon{width:28px;height:28px}
    .industry-mobile-list .deal-hugeicon{margin-right:6px}
    select.deal-hugeicon-select{padding-left:44px!important;padding-right:44px!important;background-image:var(--deal-industry-icon),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='m4 6 4 4 4-4' stroke='%2364758b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")!important;background-position:left 12px center,right 16px center!important;background-size:24px 24px,16px 16px!important;background-repeat:no-repeat!important;appearance:none}
    @media(max-width:720px){.dw-chip .deal-hugeicon{width:18px;height:18px}.industry-mobile-list .deal-hugeicon{width:22px;height:22px}}
  `;
  document.head.append(style);

  function replaceArtwork() {
    document.querySelectorAll('img.industry-flat-icon').forEach(element => {
      const key = element.dataset.industryArtwork || sourceKeys.get(element.src);
      if (!key || !data.industries[resolve(key, element.dataset.industryCatalog)]) return;
      const holder = document.createElement('span');
      holder.innerHTML = image(key, { size:element.getAttribute('width'), catalog:element.dataset.industryCatalog, className:element.className });
      const icon = holder.firstElementChild;
      if (element.hasAttribute('style')) icon.setAttribute('style', element.getAttribute('style'));
      element.replaceWith(icon);
    });
  }

  function refreshSelects() {
    document.querySelectorAll('select').forEach(select => {
      const isIndustry = select.hasAttribute('data-industry-select') || /industry|ngành/i.test([select.id, select.name, select.getAttribute('aria-label')].join(' '));
      if (!isIndustry) return;
      const option = select.selectedOptions[0];
      const key = option?.value && (option.dataset.industryIcon || previous?.keyForLabel(option.textContent) || option.value);
      const custom = select.tomselect || select.dataset.imagePicker || select.nextElementSibling?.matches('.po-select,.promotion-industry-picker');
      const enabled = Boolean(key && data.industries[resolve(key, select.dataset.industryCatalog)] && !select.multiple && !custom);
      select.classList.toggle('deal-hugeicon-select', enabled);
      if (enabled) select.style.setProperty('--deal-industry-icon', `url("${path(key, select.dataset.industryCatalog)}")`);
      else select.style.removeProperty('--deal-industry-icon');
    });
  }

  const glyphs = { ...data.glyphs, ...previous?.emoji };
  const glyphPattern = new RegExp(Object.keys(glyphs).sort((a,b) => b.length - a.length).map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\uFE0F?').join('|'), 'gu');

  function contextualKey(element) {
    const industry = element.closest('[data-dw-industry-id],[data-business-category],[data-industry-root],[data-dw-group]');
    if (!industry) return null;
    if (industry.dataset.dwIndustryId) return industry.dataset.dwIndustryId;
    if (industry.dataset.businessCategory) return industry.dataset.businessCategory;
    if (industry.dataset.industryRoot) return 'group:' + industry.dataset.industryRoot;
    const group = industry.dataset.dwGroup;
    const value = industry.dataset.dwValue;
    if (value === 'all') return null;
    if (['directory-industry', 'match-industry', 'industry'].includes(group)) return 'group:' + ({ shopping:'shop', education:'edu' }[value] || value);
    if (group === 'match-service') return value;
    return null;
  }

  function replaceIndustryGlyphs() {
    const selector = '.dw-category-icon,.dw-category-group h2,.dw-chip,.service-chip,.industry-tabs button,.industry-grid button>span,.industry-mobile-list summary,.industry-mobile-list a,[data-industry-root],[data-business-category],[data-dw-selected-group]';
    document.querySelectorAll(selector).forEach(element => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.closest('svg,script,style,textarea,option,[contenteditable]')) continue;
        glyphPattern.lastIndex = 0;
        if (glyphPattern.test(node.nodeValue)) nodes.push(node);
      }
      for (const node of nodes) {
        const fragment = document.createDocumentFragment();
        let offset = 0;
        let changed = false;
        glyphPattern.lastIndex = 0;
        for (const match of node.nodeValue.matchAll(glyphPattern)) {
          fragment.append(node.nodeValue.slice(offset, match.index));
          const key = contextualKey(element) || glyphs[match[0].replace(/\uFE0F/g, '')];
          if (data.industries[resolve(key)]) {
            const holder = document.createElement('span');
            holder.innerHTML = image(key, { className:'deal-industry-icon' });
            fragment.append(holder.firstElementChild);
            changed = true;
          } else fragment.append(match[0]);
          offset = match.index + match[0].length;
        }
        fragment.append(node.nodeValue.slice(offset));
        if (changed) node.replaceWith(fragment);
      }
    });
  }

  function refresh() {
    replaceArtwork();
    replaceIndustryGlyphs();
    refreshSelects();
  }

  function start() {
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; refresh(); });
    };
    new MutationObserver(schedule).observe(document.body, { childList:true, subtree:true, characterData:true });
    document.addEventListener('change', schedule);
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();
