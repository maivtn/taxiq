/* Shared decorative icons for the Community hub and its local iframe modules. */
(function () {
  'use strict';
  if (window.NEXORA_COMMUNITY_ICONS) return;

  const script = document.currentScript;
  const runtime = new URL(script && script.src || '../assets/community-icons.js?v=20261030-beauty', document.baseURI);
  const icons = {
    '📷':'camera', '📸':'camera', '🖼':'image', '💡':'sparkles', '✨':'sparkles', '✦':'sparkles',
    '❓':'message-circle', '💬':'message-circle', '🗨':'message-circle', '🗯':'message-circle',
    '🛍':'shopping-bag', '🛒':'shopping-bag', '🌐':'globe-2', '🌎':'globe-2', '🌍':'globe-2',
    '👥':'users-round', '🧑‍🤝‍🧑':'users-round', '🤝':'users-round', '👤':'user-round', '🙋':'user-round',
    '🧑':'user-round', '👨':'user-round', '👩':'user-round', '🪪':'user-round', '🧑‍🎨':'paintbrush',
    '🏠':'home', '🏡':'home', '🏪':'store', '🏬':'store', '🏢':'building-2', '💼':'briefcase',
    '💲':'dollar-sign', '💵':'dollar-sign', '💰':'hand-coins', '🪙':'badge-dollar-sign',
    '💳':'credit-card', '🧾':'receipt', '📜':'list', '📋':'layout-list', '📝':'paintbrush', '✏':'paintbrush',
    '⚙':'settings', '🛠':'wrench', '🔧':'wrench', '📦':'package', '🧩':'package', '🤖':'bot',
    '🎁':'gift', '🎉':'gift', '🎊':'gift', '🎟':'ticket', '🎫':'ticket', '🏷':'tag',
    '📍':'map-pin', '📌':'map-pin', '🗺':'map', '📡':'wifi', '📶':'wifi', '🔗':'link',
    '📱':'phone', '📲':'scan-line', '📞':'phone', '☎':'phone', '🎤':'phone', '🎥':'video',
    '✉':'mail', '📩':'mail', '📨':'mail', '📧':'mail', '📣':'megaphone', '📢':'megaphone',
    '📅':'calendar-days', '🗓':'calendar-days', '🗓️':'calendar-days', '📆':'calendar-check',
    '🕐':'clock', '🕒':'clock', '⏰':'clock', '⌛':'clock', '⏳':'clock', '⏱':'clock',
    '⚡':'zap', '🔥':'zap', '🚀':'rocket', '🎯':'award', '🏆':'trophy', '🎖':'award', '🏅':'award',
    '⭐':'star', '🌟':'star', '★':'star', '☆':'star', '♡':'heart', '♥':'heart', '❤':'heart',
    '💗':'heart', '💕':'heart', '👍':'thumbs-up', '✅':'circle-check', '✔':'check', '✓':'check',
    '📊':'layout-dashboard', '📈':'layout-dashboard', '🔍':'scan-line', '🔎':'scan-line',
    '💅':'paintbrush', '🎨':'paintbrush', '✂':'wrench', '💇':'user-round', '💆':'flower-2',
    '🦶':'flower-2', '👁':'user-round', '👀':'user-round', '🦷':'user-round',
    '🍽':'utensils', '🍜':'utensils', '🍴':'utensils', '☕':'coffee', '🧋':'coffee', '🍰':'cake',
    '🚗':'car', '🧽':'car', '🚚':'truck', '🚲':'bike', '📚':'layout-list', '📖':'layout-list',
    '🎓':'award', '🔔':'bell', '🔒':'user-cog', '🛡':'circle-check', '⚠':'bell'
  };
  const normalize = value => value.replace(/[\uFE0E\uFE0F\u{1F3FB}-\u{1F3FF}]/gu, '');
  const segmenter = new Intl.Segmenter('en', {granularity:'grapheme'});
  const hasIcon = /[\u2300-\u27BF\u{1F300}-\u{1FAFF}]/u;
  // Member-authored posts, messages, comments, photos and editable fields stay intact.
  const skip = 'script,style,title,textarea,input,select,option,svg,code,pre,[contenteditable],.sidebar,[data-noi18n],.community-icon-copy,.tx,.bub .body,.job p,.job h4,.shift h4,.cmt .b,.quote,.post .tx,.photos,#cmpPhotos,.community-action-photo,.community-action-comment p,.community-action-dialog-body > p:not(.community-action-meta),#community-action-title,.community-action-summary strong,.bio,.who,.bub .nm,.tr,.nhub,.terms,#pinTxt,.caps,.ex,#tVi,#tEn,.scam,.item .mid span,.disc b';
  const copies = new Set();
  const frames = new WeakSet();
  let scheduled = false;
  let originalSetLanguage;
  let languageWrapper;
  let observer;

  function registerIndustryEmoji() {
    Object.keys(window.NEXORA_INDUSTRY_ICONS?.emoji || {}).forEach(symbol => {
      if (!icons[symbol]) icons[symbol] = 'package';
    });
  }
  registerIndustryEmoji();
  function artworkPath(symbol, fallback, label) {
    const registry = window.NEXORA_INDUSTRY_ICONS;
    const key = registry?.keyForLabel(label) || registry?.emoji[normalize(symbol)];
    return registry && key ? registry.path(key) : new URL('icon-oneqr/issue-2040-oneqr-'+fallback+'-3d.png',runtime).href;
  }
  // The hub's PO screens also run in srcdoc iframes with their own globals.
  if (!window.NEXORA_INDUSTRY_ICONS && !document.querySelector('script[data-industry-icons]')) {
    const loader = document.createElement('script');
    loader.src = new URL('industry-icons.js?v=20261030-beauty',runtime).href;
    loader.dataset.industryIcons = '';
    loader.addEventListener('load',() => { registerIndustryEmoji(); observer?.disconnect(); restoreCopies(); schedule(); });
    document.head.append(loader);
  }

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('community-icons.css?v=20261028-community-ui-v2', runtime).href;
  document.head.appendChild(stylesheet);

  function observe() {
    observer.observe(document.body, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['class','data-en']});
  }

  function restoreCopies() {
    copies.forEach(record => {
      if (record.wrapper.isConnected) record.wrapper.replaceWith(record.original);
    });
    copies.clear();
    document.querySelectorAll('.community-icon-translated').forEach(clearTranslated);
  }

  function clearTranslated(element) {
    element.classList.remove('community-icon-translated');
    element.removeAttribute('data-community-icon-label');
    element.style.removeProperty('--community-translated-icon');
    element.style.removeProperty('--community-translated-size');
  }

  function decorateTranslated(element) {
    if (!element.classList.contains('i18n-a')) { clearTranslated(element); return; }
    if (element.closest(skip)) return;
    const label = element.getAttribute('data-en') || '';
    const parts = Array.from(segmenter.segment(label));
    const first = parts.find(part => part.segment.trim());
    const asset = first && icons[normalize(first.segment)];
    if (!asset) { clearTranslated(element); return; }
    const size = parseFloat(getComputedStyle(element, '::after').fontSize) || 14;
    element.classList.add('community-icon-translated');
    element.dataset.communityIconLabel = label.slice(first.index + first.segment.length);
    element.style.setProperty('--community-translated-icon', 'url("' + artworkPath(first.segment,asset,label) + '")');
    element.style.setProperty('--community-translated-size', Math.max(18, Math.min(64, Math.round(size * 1.35))) + 'px');
  }

  function hookLanguage() {
    if (typeof window.__setLang !== 'function' || window.__setLang === languageWrapper) return;
    originalSetLanguage = window.__setLang;
    languageWrapper = function () {
      observer.disconnect();
      restoreCopies();
      try { return originalSetLanguage.apply(this, arguments); }
      finally { observe(); schedule(); }
    };
    window.__setLang = languageWrapper;
  }

  function installFrame(frame) {
    function install() {
      try {
        const child = frame.contentDocument;
        if (!child || !child.head || child.querySelector('script[data-community-icons]')) return;
        const loader = child.createElement('script');
        loader.src = runtime.href;
        loader.dataset.communityIcons = '';
        child.head.appendChild(loader);
      } catch (_) { /* External embeds retain their own UI. */ }
    }
    if (!frames.has(frame)) {
      frames.add(frame);
      frame.addEventListener('load', install);
    }
    install();
  }

  function resizeCopy(record) {
    const size = Math.max(18, Math.min(64, Math.round((parseFloat(getComputedStyle(record.wrapper).fontSize) || 14) * 1.35)));
    record.wrapper.style.setProperty('--community-icon-size', size + 'px');
  }

  function decorate(node) {
    if (!node.parentElement || node.parentElement.closest(skip + ',.i18n-a') || !hasIcon.test(node.data)) return;
    const segments = Array.from(segmenter.segment(node.data), part => part.segment);
    if (!segments.some(segment => icons[normalize(segment)])) return;
    const wrapper = document.createElement('span');
    wrapper.className = 'community-icon-copy';
    wrapper.setAttribute('data-noi18n', '');
    let text = '';
    function flush() {
      if (text) { wrapper.appendChild(document.createTextNode(text)); text = ''; }
    }
    segments.forEach(segment => {
      const asset = icons[normalize(segment)];
      if (!asset) { text += segment; return; }
      flush();
      const glyph = document.createElement('span');
      glyph.className = 'community-icon-glyph';
      glyph.setAttribute('role', 'img');
      glyph.setAttribute('aria-label', segment);
      const image = document.createElement('img');
      image.src = artworkPath(segment,asset,node.data);
      image.alt = '';
      image.width = image.height = 20;
      image.draggable = false;
      image.setAttribute('aria-hidden', 'true');
      const original = document.createElement('span');
      original.className = 'community-icon-original';
      original.hidden = true;
      original.setAttribute('aria-hidden', 'true');
      original.textContent = segment;
      glyph.append(image, original);
      wrapper.appendChild(glyph);
    });
    flush();
    node.replaceWith(wrapper);
    const record = {wrapper, original:node};
    copies.add(record);
    resizeCopy(record);
  }

  function refresh() {
    scheduled = false;
    observer.disconnect();
    hookLanguage();
    copies.forEach(record => {
      if (!record.wrapper.isConnected) copies.delete(record);
      else resizeCopy(record);
    });
    // The PO translator displays data-en through ::after without changing its value carrier.
    document.querySelectorAll('.i18n-a,.community-icon-translated').forEach(decorateTranslated);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(decorate);
    document.querySelectorAll('iframe').forEach(installFrame);
    observe();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    (window.requestAnimationFrame || window.setTimeout)(refresh);
  }

  function start() {
    observer = new MutationObserver(schedule);
    window.NEXORA_COMMUNITY_ICONS = {refresh:schedule};
    window.addEventListener('resize', schedule);
    refresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
