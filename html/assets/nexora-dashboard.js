/* Catalog browsing only. Operational data remains owned by the existing stores. */
(function () {
  'use strict';
  var catalog = window.NEXORA_PRODUCT_CATALOG;
  var routes = window.NEXORA_SHELL_NAV;
  var browser = document.getElementById('module-browser');
  var detail = document.getElementById('module-detail');
  if (!catalog || !browser || !detail) return;
  var search = document.getElementById('search'), category = document.getElementById('category');
  var cards = Array.from(document.querySelectorAll('#cards [data-module]'));
  var lastModule = '';
  function normalize(value) { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase(); }
  function params() { return new URLSearchParams(window.location.search); }
  function updateURL(next, replace) {
    var url = new URL(window.location.href); url.search = next.toString();
    window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
  }
  function filterCards() {
    var query = normalize(search.value.trim()), count = 0;
    cards.forEach(function (card) {
      card.hidden = !((category.value === 'all' || card.dataset.category.split(/\s+/).includes(category.value)) && (!query || normalize(card.textContent + ' ' + card.dataset.search).includes(query)));
      if (!card.hidden) count++;
    });
    document.getElementById('result-count').textContent = count + ' products';
    document.getElementById('empty').hidden = count > 0;
    document.getElementById('clear-filter').hidden = !query && category.value === 'all';
  }
  function saveFilters() {
    var next = params();
    if (search.value) next.set('q', search.value); else next.delete('q');
    if (category.value !== 'all') next.set('category', category.value); else next.delete('category');
    updateURL(next, true); filterCards();
  }
  function reset() { search.value = ''; category.value = 'all'; saveFilters(); search.focus(); }
  function link(item) {
    var href = item.demo === 'wheel' ? 'vlinkpay-campaigns.html?view=create' : item.url ? routes.resolve(item.url) : '';
    var node = document.createElement(href && !item.unavailable ? 'a' : 'div');
    node.className = 'detail-link' + (item.unavailable || !href ? ' unavailable' : '');
    var copy = document.createElement('span'); copy.textContent = item.label + (item.unavailable || !href ? ' · unavailable' : ''); node.appendChild(copy);
    if (item.description) { var description = document.createElement('small'); description.textContent = item.description; copy.appendChild(description); }
    if (href && !item.unavailable) {
      node.href = href;
      if (item.newTab) { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
      var arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true'); node.appendChild(arrow);
    }
    return node;
  }
  function renderGroup(product, index) {
    var group = product.groups[index], host = document.getElementById('detail-links');
    host.replaceChildren(); host.setAttribute('aria-labelledby', 'module-group-' + index);
    host.id = 'detail-links';
    Array.from(document.querySelectorAll('#detail-tabs button')).forEach(function (tab, i) { tab.setAttribute('aria-selected', String(index === i)); tab.tabIndex = index === i ? 0 : -1; });
    if (group.upcoming) { var note = document.createElement('p'); note.className = 'detail-upcoming'; note.textContent = group.upcoming; host.appendChild(note); }
    (group.sections || [group]).forEach(function (section) {
      var wrap = document.createElement('section'); wrap.className = 'detail-section';
      if (group.sections) { var heading = document.createElement('h3'); heading.textContent = section.name; wrap.appendChild(heading); }
      var list = document.createElement('div'); list.className = 'detail-link-list';
      (section.items || []).forEach(function (item) { list.appendChild(link(item)); });
      wrap.appendChild(list); host.appendChild(wrap);
    });
    var marketing = document.getElementById('detail-marketing-preview');
    if (marketing) marketing.hidden = product.key !== 'aihub' || group.name !== 'Marketing Assistant';
  }
  function renderRoute(focus) {
    var state = params(), key = state.get('module'), product = Object.prototype.hasOwnProperty.call(catalog, key) ? catalog[key] : null;
    search.value = state.get('q') || '';
    category.value = Array.from(category.options).some(function (o) { return o.value === state.get('category'); }) ? state.get('category') : 'all';
    filterCards();
    browser.hidden = !!product; detail.hidden = !product;
    window.NEXORA_SHELL?.refreshSidebar?.();
    if (!product) { if (focus && lastModule) document.querySelector('[data-module="' + lastModule + '"]')?.focus(); return; }
    lastModule = product.key;
    document.getElementById('detail-title').textContent = product.title;
    document.getElementById('detail-description').textContent = product.description;
    document.getElementById('detail-status').textContent = product.status;
    document.getElementById('detail-status').classList.toggle('pending', product.availability === 'preview');
    var tax = document.getElementById('detail-tax-preview'); if (tax) tax.hidden = product.key !== 'taxiq';
    var tabs = document.getElementById('detail-tabs'); tabs.replaceChildren();
    var index = state.get('section') === 'marketing' && product.key === 'aihub' ? 1 : Number(state.get('group')) || 0;
    if (!product.groups[index]) index = 0;
    product.groups.forEach(function (group, i) {
      var tab = document.createElement('button'); tab.type = 'button'; tab.role = 'tab'; tab.id = 'module-group-' + i; tab.textContent = group.name; tab.setAttribute('aria-controls','detail-links');
      function choose() { var next = params(); next.set('group', String(i)); if (product.key === 'aihub' && i === 1) next.set('section', 'marketing'); else next.delete('section'); updateURL(next, true); renderGroup(product, i); window.NEXORA_SHELL?.refreshSidebar?.(); }
      tab.addEventListener('click', choose);
      tab.addEventListener('keydown', function (event) {
        var count = product.groups.length, target = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : event.key === 'ArrowRight' ? (i + 1) % count : event.key === 'ArrowLeft' ? (i + count - 1) % count : -1;
        if (target < 0) return; event.preventDefault(); tabs.children[target].click(); tabs.children[target].focus();
      });
      tabs.appendChild(tab);
    });
    renderGroup(product, index);
    if (focus) detail.focus();
  }
  cards.forEach(function (card) {
    var key = card.dataset.module;
    card.querySelector('.card-icon').innerHTML = window.NEXORA_ICONS.image(key, {size: 48});
    card.addEventListener('click', function () { var next = params(); next.set('module', key); next.delete('section'); next.delete('group'); updateURL(next); renderRoute(true); });
  });
  document.getElementById('detail-back').addEventListener('click', function () { var next = params(); ['module','section','group'].forEach(function (key) { next.delete(key); }); updateURL(next); renderRoute(true); });
  document.querySelector('.detail-pos-back').href = 'pos-front-desk.html';
  search.addEventListener('input', saveFilters); category.addEventListener('change', saveFilters);
  document.getElementById('clear-filter').addEventListener('click', reset);
  document.getElementById('empty-reset').addEventListener('click', reset);
  window.addEventListener('popstate', function () { renderRoute(false); });
  renderRoute(false);
})();
