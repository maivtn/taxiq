(function () {
  'use strict';
  const TILE_BACKGROUNDS = [
    'linear-gradient(135deg, #F472B6, #BE185D)',
    'linear-gradient(135deg, #60A5FA, #1D4ED8)',
    'linear-gradient(135deg, #34D399, #047857)',
    'linear-gradient(135deg, #FBBF24, #B45309)',
    'linear-gradient(135deg, #A78BFA, #6D28D9)',
    'linear-gradient(135deg, #FB923C, #C2410C)',
    'linear-gradient(135deg, #22D3EE, #0E7490)',
    'linear-gradient(135deg, #F87171, #B91C1C)',
    'linear-gradient(135deg, #EC4899, #7E22CE)',
    'linear-gradient(135deg, #6366F1, #312E81)',
    'linear-gradient(135deg, #14B8A6, #0F766E)',
    'linear-gradient(135deg, #06B6D4, #0369A1)',
    'linear-gradient(135deg, #84CC16, #3F6212)',
    'linear-gradient(135deg, #EAB308, #A16207)',
    'linear-gradient(135deg, #F97316, #9A3412)',
    'linear-gradient(135deg, #EF4444, #991B1B)',
    'linear-gradient(135deg, #D946EF, #86198F)',
    'linear-gradient(135deg, #8B5CF6, #5B21B6)',
    'linear-gradient(135deg, #0EA5E9, #075985)',
    'linear-gradient(135deg, #10B981, #065F46)',
    'linear-gradient(135deg, #F43F5E, #9F1239)',
    'linear-gradient(135deg, #64748B, #334155)',
    'linear-gradient(135deg, #A855F7, #4338CA)',
    'linear-gradient(135deg, #2DD4BF, #155E75)'
  ];
  const ACTION_ICON_CHOICES = [
    "award", "badge-dollar-sign", "bell", "bike", "bot", "briefcase",
    "building-2", "cake", "calendar-check", "calendar-clock", "calendar-days", "camera",
    "car", "check", "chef-hat", "circle-check", "clock", "coffee",
    "credit-card", "crown", "dollar-sign", "facebook", "flower-2", "gamepad-2",
    "gift", "globe-2", "hand-coins", "heart", "home", "image",
    "instagram", "layout-dashboard", "layout-list", "link", "linkedin", "list",
    "mail", "map", "map-pin", "megaphone", "message-circle", "music",
    "package", "paintbrush", "percent", "phone", "qr-code", "receipt",
    "rocket", "scan-line", "settings-2", "settings", "share-2", "shopping-bag",
    "sparkles", "square", "square-arrow-out-up-right", "star", "store", "tag",
    "thumbs-up", "ticket", "trophy", "truck", "tv", "user-cog",
    "user-round", "users-round", "utensils", "video", "wallet", "wand-2",
    "wifi", "wrench", "youtube", "zap"
  ];
  const ICON_KEYS = new Set(ACTION_ICON_CHOICES);
  // Older module keys resolve to the supplied 3D assets without rewriting saved settings.
  const ICON_ALIASES = {
    "link-2": "link",
    "globe": "globe-2",
    "external-link": "square-arrow-out-up-right",
    "mouse-pointer-click": "circle-check",
    "calendar-check-2": "calendar-check",
    "calendar-range": "calendar-days",
    "clock-3": "clock",
    "phone-call": "phone",
    "messages-square": "message-circle",
    "message-square": "message-circle",
    "send": "share-2",
    "navigation": "map-pin",
    "map-pinned": "map",
    "briefcase-business": "briefcase",
    "user": "user-round",
    "users": "users-round",
    "contact-round": "user-round",
    "id-card": "user-round",
    "user-check": "circle-check",
    "user-plus": "users-round",
    "gem": "sparkles",
    "badge-check": "award",
    "shield-check": "circle-check",
    "check-circle": "circle-check",
    "circle-plus": "circle-check",
    "wallet-cards": "wallet",
    "coins": "hand-coins",
    "circle-dollar-sign": "badge-dollar-sign",
    "receipt-text": "receipt",
    "play": "video",
    "monitor": "tv",
    "smartphone": "phone",
    "tablet": "tv",
    "radio": "music",
    "menu": "list",
    "tags": "tag",
    "ticket-percent": "percent",
    "book-open": "list",
    "graduation-cap": "award",
    "file-text": "receipt",
    "folder": "package",
    "clipboard-list": "list",
    "calculator": "receipt",
    "code-2": "settings-2",
    "printer": "receipt",
    "newspaper": "layout-list",
    "activity": "heart",
    "bar-chart-3": "layout-dashboard",
    "chart-no-axes-combined": "layout-dashboard",
    "trending-up": "rocket",
    "sprout": "flower-2",
    "infinity": "link",
    "badge": "award",
    "blocks": "package",
    "apple": "heart",
    "list-checks": "list",
    "heart-handshake": "heart",
    "images": "image",
    "file-check-2": "circle-check",
    "clipboard-check": "circle-check",
    "clipboard-x": "list",
    "file-question": "list",
    "folder-tree": "package",
    "notebook-pen": "paintbrush",
    "pencil": "paintbrush",
    "square-pen": "paintbrush",
    "save": "package",
    "download": "package",
    "upload-cloud": "image",
    "copy": "list",
    "eye": "image",
    "search": "map",
    "refresh-cw": "settings-2",
    "rotate-ccw": "clock",
    "undo-2": "clock",
    "sliders-horizontal": "settings-2",
    "shield": "circle-check",
    "shield-plus": "circle-check",
    "info": "list",
    "circle-help": "message-circle",
    "circle-question-mark": "message-circle",
    "alert-triangle": "bell",
    "triangle-alert": "bell",
    "octagon-alert": "bell",
    "circle-check-big": "circle-check",
    "check-circle-2": "circle-check",
    "x-circle": "square",
    "trash-2": "settings",
    "inbox": "mail",
    "voicemail": "phone",
    "phone-forwarded": "phone",
    "phone-off": "phone",
    "message-circle-question": "message-circle",
    "message-circle-off": "message-circle",
    "user-circle": "user-round",
    "user-round-check": "user-round",
    "user-x": "user-round",
    "key-round": "settings",
    "languages": "globe-2",
    "layers": "layout-dashboard",
    "layers-2": "layout-dashboard",
    "layers-3": "layout-dashboard",
    "layout-grid": "layout-dashboard",
    "layout-template": "layout-dashboard",
    "list-filter": "list",
    "panel-left": "layout-list",
    "panel-top": "layout-dashboard",
    "arrow-left-right": "share-2"
  };
  function resolveIcon(name) {
    if (ICON_KEYS.has(name)) return name;
    return Object.hasOwn(ICON_ALIASES, name) ? ICON_ALIASES[name] : 'link';
  }
  function iconPath(name) {
    return '../assets/icon-oneqr/issue-2040-oneqr-' + resolveIcon(name) + '-3d.png';
  }
  function image(name, size = 24) {
    return '<img class="oneqr-flat-icon" src="' + iconPath(name) + '" alt="" width="' + size + '" height="' + size + '" decoding="async">';
  }
  function mount() {
    if (typeof document === 'undefined') return;
    const containers = ['.oneqr-scan-icon', '.oneqr-scan-welcome-icon', '.qr-tab-icon', '.oneqr-phone-quick-actions', '.oneqr-public-actions', '.oneqr-about', '.oneqr-phone-featured'];
    const selectors = containers.map(selector => selector + ' [data-lucide], ' + selector + ' svg[class*="lucide-"]').join(', ');
    document.querySelectorAll(selectors).forEach(node => {
      const legacyName = Array.from(node.classList).filter(value => value.startsWith('lucide-')).map(value => value.slice(7).replace(/-icon$/, '')).find(value => ICON_KEYS.has(value) || Object.hasOwn(ICON_ALIASES, value));
      const name = node.getAttribute('data-lucide') || legacyName;
      if (!name) return;
      const compact = node.closest('.oneqr-phone-quick-actions, .oneqr-public-actions, .oneqr-about, .oneqr-phone-featured');
      const size = node.closest('.qr-tab-icon') ? 20 : compact ? 14 : 28;
      const icon = document.createElement('img');
      icon.className = 'oneqr-flat-icon';icon.src = iconPath(name);
      icon.alt = '';icon.width = size;icon.height = size;icon.decoding = 'async';
      node.replaceWith(icon);
    });
  }
  window.ONEQR_ACTION_APPEARANCE = Object.freeze({
    backgrounds: Object.freeze(TILE_BACKGROUNDS),
    icons: Object.freeze(ACTION_ICON_CHOICES),
    resolveIcon: resolveIcon,
    iconPath: iconPath,
    image: image,
    mount: mount
  });
  mount();
  if (typeof document !== 'undefined' && document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once: true});
})();
