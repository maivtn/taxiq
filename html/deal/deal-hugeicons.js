/* Deal industry and interface icons: free Hugeicons rendered locally with Iconify. */
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
  let sequence = 0;

  function resolve(key, catalog = 'default') {
    key = String(key || 'other');
    if (Object.hasOwn(data.industries, key)) return key;
    if (key.startsWith('group:')) key = groups[key.slice(6)] || 'other';
    else if (key.endsWith('_other')) return resolve('group:' + key.slice(0, -6), catalog);
    key = previous?.catalogs?.[catalog]?.[key] || aliases[key] || key;
    return Object.hasOwn(data.industries, key) ? key : previous?.resolve(key, catalog) || 'other';
  }

  function graphic(value, attributes = {}) {
    const [name, badge] = Array.isArray(value) ? value : [value];
    const built = IconifyIcon.buildIcon({ width:24, height:24, ...data.collection.icons[name] });
    let body = built.body;
    if (badge) {
      // Combine original Hugeicons for trades without a dedicated free pictogram.
      const mask = 'deal-hugeicon-' + (++sequence);
      const detail = IconifyIcon.buildIcon({ width:24, height:24, ...data.collection.icons[badge] });
      body = `<defs><mask id="${mask}" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="white"/><circle cx="19" cy="19" r="8" fill="black"/></mask></defs><g mask="url(#${mask})">${body}</g><g transform="translate(12 12) scale(.5)">${detail.body.replace(/stroke-width="1.5"/g, 'stroke-width="2"')}</g>`;
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const values = { xmlns:'http://www.w3.org/2000/svg', ...built.attributes, width:24, height:24, 'aria-hidden':'true', focusable:'false', ...attributes, 'data-icon':'hugeicons:' + name };
    if (badge) values['data-badge-icon'] = 'hugeicons:' + badge;
    for (const [attribute, value] of Object.entries(values)) svg.setAttribute(attribute, value);
    svg.innerHTML = body;
    return svg;
  }

  function image(key, options = {}) {
    const canonical = resolve(key, options.catalog);
    const name = data.industries[canonical];
    // Keep dedicated artwork when the free collection has no suitable trade icon.
    if (!name && previous) return previous.image(key, options);
    const size = Math.max(16, Math.min(96, Number(options.size) || 24));
    return graphic(name || data.industries.other, {
      width:size, height:size,
      class:['industry-flat-icon', 'deal-hugeicon', ...String(options.className || '').split(/\s+/)].filter((value, index, values) => value && values.indexOf(value) === index).join(' '),
      'data-hugeicon-key':canonical,
    }).outerHTML;
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

  // Existing presentation rules keep their selectors, labels, and state handling.
  const presentation = window.NEXORA_DEAL_LUCIDE;
  if (presentation) {
    const names = new Map(Object.entries(presentation.icons).map(([name, nodes]) => [nodes, name]));
    window.NEXORA_DEAL_LUCIDE = Object.freeze({
      ...presentation,
      createElement(nodes, attributes = {}) {
        const name = names.get(nodes);
        if (!data.actions[name]) return presentation.createElement(nodes, attributes);
        return graphic(data.actions[name], { ...attributes, class:(attributes.class || '') + ' deal-ui-icon' });
      },
    });
  }

  const style = document.createElement('style');
  style.id = 'deal-hugeicons-style';
  style.textContent = `
    .deal-hugeicon{display:inline-block;flex-shrink:0;vertical-align:middle;pointer-events:none}
    .deal-ui-icon{display:inline-block;flex-shrink:0;vertical-align:-.15em;pointer-events:none}
    .deal-ui-icon.is-filled path{fill:currentColor}
    :is(.dw-primary,.primary-cta,.dw-chip.active,.dw-area-mode.active,.discover-entry,.discover-hero-actions button,.dw-lm-customer-hero,.deal-subnav a,.deal-subnav a.active) .deal-ui-icon{color:inherit}
    .dw-lm-bolt .deal-ui-icon{width:28px;height:28px;color:white}
    .dw-ticket-art .deal-ui-icon{width:26px;height:26px;color:white}
    .dw-nearby-controls h1 .deal-ui-icon{color:#7153db}
    .dw-area-tag b .deal-ui-icon{width:14px;height:14px;margin:0;vertical-align:middle;color:inherit}
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

  function semantic(element, name, add = true) {
    if (!element || !name) return;
    const existing = element.querySelector('svg');
    if (existing?.getAttribute('data-icon') === 'hugeicons:' + name) return;
    if (!existing && !add) return;
    const attributes = existing ? Object.fromEntries(Array.from(existing.attributes, attribute => [attribute.name, attribute.value])) : { width:18, height:18, class:'deal-inline-icon' };
    attributes.class = (attributes.class || '') + ' deal-ui-icon';
    const icon = graphic(name, attributes);
    if (existing) existing.replaceWith(icon);
    else {
      const text = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
      if (text) text.nodeValue = text.nodeValue.replace(/^\s*[🔥✦✨⚡🏷🎟🎫💅🎊🎉🏙🗺📍⌖▤\uFE0F]+\s*/u, '');
      element.prepend(icon, document.createTextNode(' '));
    }
  }

  function refreshSemantics() {
    document.querySelectorAll('[data-deal-subroute]').forEach(element => semantic(element, data.routes[element.dataset.dealSubroute]));
    document.querySelectorAll('.discover-entry').forEach(element => semantic(element.querySelector('.discover-entry-icon'), data.routes[element.getAttribute('href')?.slice(1)]));
    document.querySelectorAll('.dw-nearby-controls h1').forEach(element => semantic(element, data.routes.nearby));
    document.querySelectorAll('.dw-match-hero h1,.dw-match-top h1').forEach(element => semantic(element, data.routes.requests));
    document.querySelectorAll('h1').forEach(element => {
      if (element.textContent.replace(/^[^\p{L}\p{N}]+/u, '').trim() === 'Deal Match') semantic(element, data.routes.requests);
    });
    document.querySelectorAll('.dw-directory-head h1').forEach(element => semantic(element, data.routes.coupons));
    document.querySelectorAll('.dw-opening-page h1').forEach(element => semantic(element, data.routes.openings));
    document.querySelectorAll('.dw-lm-bolt').forEach(element => semantic(element, data.routes['last-minute']));
    document.querySelectorAll('.dw-lm-card-time>span').forEach(element => semantic(element, 'clock-01'));
    document.querySelectorAll('.dw-ticket-art span').forEach(element => semantic(element, 'discount-tag-01'));
    document.querySelectorAll('.dw-ticket-meta>span:nth-child(2)').forEach(element => {
      const countdown = /\bdays? left\b|\bends?\b|\bleft\b|còn|hết hạn/i.test(element.textContent);
      semantic(element, countdown ? 'hourglass' : 'calendar-03');
    });
    document.querySelectorAll('a[data-open]').forEach(element => semantic(element, 'store-01'));
    document.querySelectorAll('button[data-open]').forEach(element => {
      const label = element.textContent.trim();
      const name = /^(Get coupon|Claim|Lấy coupon|Nhận coupon)/i.test(label) ? 'coupon-01'
        : /^(Reserve this|Giữ phần|Giữ món)/i.test(label) ? 'shopping-basket-check-in-01'
        : /^(Book|Reserve a spot|Đặt|Giữ chỗ)/i.test(label) ? 'calendar-check-01' : 'view';
      semantic(element, name);
    });
    document.querySelectorAll('[data-coupon-claim],#claimDealButton').forEach(element => semantic(element, 'coupon-01'));
    document.querySelectorAll('[data-dw-nail-menu]:not([data-dw-industry-id])').forEach(element => semantic(element, 'menu-restaurant'));
    document.querySelectorAll('[data-ai-generate],.ai-guide-fab,.ai-guide-launch,.copilot-button,#aiOptimizeButton').forEach(element => semantic(element, 'ai-sparkles', false));
    document.querySelectorAll('[data-dw-remove-area]').forEach(element => {
      element.querySelector(':scope>svg.deal-action-icon')?.remove();
      semantic(element.querySelector(':scope>span'), 'location-01');
      const close = element.querySelector(':scope>b');
      semantic(close, 'cancel-01');
      close?.querySelector('svg')?.classList.add('deal-action-icon');
    });
  }

  function refresh() {
    replaceArtwork();
    replaceIndustryGlyphs();
    refreshSelects();
    refreshSemantics();
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
