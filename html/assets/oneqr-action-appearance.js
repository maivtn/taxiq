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
    'link-2', 'globe-2', 'external-link', 'qr-code', 'mouse-pointer-click',
    'calendar-check', 'calendar-check-2', 'calendar-days', 'calendar-range', 'clock-3',
    'phone', 'phone-call', 'mail', 'message-circle', 'message-square',
    'messages-square', 'send', 'navigation', 'map-pin', 'map-pinned',
    'home', 'building-2', 'store', 'briefcase-business', 'user',
    'users', 'contact-round', 'id-card', 'user-check', 'user-plus',
    'star', 'heart', 'gift', 'crown', 'gem',
    'sparkles', 'badge-check', 'shield-check', 'check-circle', 'circle-plus',
    'shopping-bag', 'credit-card', 'wallet', 'wallet-cards', 'coins',
    'dollar-sign', 'circle-dollar-sign', 'receipt', 'receipt-text', 'hand-coins',
    'image', 'video', 'play', 'monitor', 'smartphone',
    'tablet', 'radio', 'menu', 'list', 'tags',
    'ticket-percent', 'megaphone', 'bell', 'book-open', 'graduation-cap',
    'file-text', 'folder', 'clipboard-list', 'calculator', 'code-2',
    'printer', 'newspaper', 'rocket', 'zap', 'settings',
    'activity', 'bar-chart-3', 'chart-no-axes-combined', 'trending-up', 'sprout', 'infinity',
    'badge', 'badge-dollar-sign', 'blocks', 'apple', 'list-checks',
    'utensils', 'heart-handshake', 'ticket', 'images', 'file-check-2',
    'clipboard-check', 'clipboard-x', 'file-question', 'folder-tree', 'notebook-pen',
    'pencil', 'square-pen', 'save', 'download', 'upload-cloud',
    'copy', 'eye', 'search', 'scan-line', 'share-2',
    'refresh-cw', 'rotate-ccw', 'undo-2', 'sliders-horizontal', 'settings-2',
    'shield', 'shield-plus', 'info', 'circle-help', 'circle-question-mark',
    'alert-triangle', 'triangle-alert', 'octagon-alert', 'check', 'circle-check',
    'circle-check-big', 'x-circle', 'trash-2', 'inbox', 'voicemail',
    'phone-forwarded', 'phone-off', 'message-circle-question', 'message-circle-off', 'users-round',
    'user-circle', 'user-round-check', 'user-x', 'key-round', 'languages',
    'layers', 'layers-2', 'layers-3', 'layout-dashboard', 'layout-grid',
    'layout-template', 'list-filter', 'panel-left', 'panel-top', 'arrow-left-right'
  ];
  // Freepik / Flaticon Special Lineal Color PNGs, stored locally for the demo.
  const FLATICON_IDS = {
    'link-2': 2128313, 'globe-2': 3976437, 'qr-code': 7380606,
    'mouse-pointer-click': 4001233, 'clock-3': 3094796, phone: 4298187,
    mail: 912125, 'message-circle': 8604427, 'message-square': 1698588,
    'map-pin': 4259455, user: 1698618, star: 276049, heart: 4763016,
    crown: 616067, 'shield-check': 7514105, 'check-circle': 6889473,
    'circle-plus': 10435127, 'credit-card': 6725363, wallet: 1163373,
    coins: 3898135, receipt: 679871, video: 9967241,
    smartphone: 999434, menu: 2828899, list: 2041794,
    tags: 543135, 'ticket-percent': 2016358, bell: 1069867,
    'book-open': 1156964, 'file-text': 3940079, megaphone: 3100336,
    folder: 3305653, calculator: 191110, printer: 3286223,
    rocket: 619175, pencil: 4277236, settings: 4403451,
    search: 3286250, 'key-round': 3062553, 'trash-2': 14018849,
    'upload-cloud': 3663257, info: 3930246, 'alert-triangle': 4081557,
    'bar-chart-3': 559144, 'circle-help': 2194227, badge: 2583447,
    zap: 11016041, radio: 1527104, eye: 10608532,
    'share-2': 3175949, layers: 4263797, bot: 8616562,
    save: 4176381, 'clipboard-list': 2795007, 'refresh-cw': 12388462,
    monitor: 2285656, send: 7989068, 'layout-dashboard': 1881517,
    languages: 5273888, download: 5261869
  };
  const SHARED_ICON_FILES = {
    'calendar-check': 'promotions/industry-icons/calendar.png',
    home: 'promotions/industry-icons/home.png',
    store: 'promotions/industry-icons/retail.png',
    'briefcase-business': 'oneqr/industry-icons/professional-12692369.png',
    users: 'oneqr/industry-icons/teamwork-1865736.png',
    gift: 'promotions/industry-icons/gift.png',
    gem: 'promotions/industry-icons/jewelry.png',
    sparkles: 'promotions/industry-icons/spa.png',
    image: 'oneqr/industry-icons/camera-7640413.png',
    'graduation-cap': 'oneqr/industry-icons/education-306846.png',
    activity: 'oneqr/industry-icons/medical-5256176.png',
    sprout: 'oneqr/industry-icons/garden-842870.png',
    blocks: 'oneqr/industry-icons/puzzle-4406319.png',
    apple: 'promotions/industry-icons/nutrition.png',
    utensils: 'promotions/industry-icons/restaurant.png'
  };
  // Keep the existing icon keys so saved module appearances remain compatible.
  const ICON_ALIASES = {
    'external-link': 'send', 'calendar-check-2': 'calendar-check',
    'calendar-days': 'calendar-check', 'calendar-range': 'calendar-check',
    'calendar-clock': 'calendar-check', 'phone-call': 'phone',
    'messages-square': 'message-circle', navigation: 'map-pin', 'map-pinned': 'map-pin',
    'building-2': 'home', 'contact-round': 'user', 'id-card': 'user',
    'user-check': 'user', 'user-plus': 'user', 'badge-check': 'badge',
    'shopping-bag': 'store', 'wallet-cards': 'wallet', 'dollar-sign': 'coins',
    'circle-dollar-sign': 'coins', 'receipt-text': 'receipt', 'hand-coins': 'coins',
    play: 'video', tablet: 'smartphone', 'code-2': 'monitor', newspaper: 'file-text',
    'chart-no-axes-combined': 'bar-chart-3', 'trending-up': 'bar-chart-3',
    infinity: 'link-2', 'badge-dollar-sign': 'coins', 'list-checks': 'list',
    'heart-handshake': 'users', ticket: 'ticket-percent', images: 'image',
    'file-check-2': 'file-text', 'clipboard-check': 'clipboard-list',
    'clipboard-x': 'clipboard-list', 'file-question': 'file-text', 'folder-tree': 'folder',
    'notebook-pen': 'pencil', 'square-pen': 'pencil', copy: 'file-text',
    'scan-line': 'qr-code', 'rotate-ccw': 'refresh-cw', 'undo-2': 'refresh-cw',
    'sliders-horizontal': 'settings', 'settings-2': 'settings', shield: 'shield-check',
    'shield-plus': 'shield-check', 'circle-question-mark': 'circle-help',
    'triangle-alert': 'alert-triangle', 'octagon-alert': 'alert-triangle',
    check: 'check-circle', 'circle-check': 'check-circle', 'circle-check-big': 'check-circle',
    'check-circle-2': 'check-circle', 'x-circle': 'trash-2', inbox: 'mail', voicemail: 'phone',
    'phone-forwarded': 'phone', 'phone-off': 'phone', 'message-circle-question': 'message-circle',
    'message-circle-off': 'message-circle', 'users-round': 'users', 'user-circle': 'user',
    'user-round-check': 'user', 'user-x': 'user', 'user-cog': 'user',
    'layers-2': 'layers', 'layers-3': 'layers', 'layout-grid': 'layout-dashboard',
    'layout-template': 'layout-dashboard', 'list-filter': 'list',
    'panel-left': 'layout-dashboard', 'panel-top': 'layout-dashboard',
    'arrow-left-right': 'refresh-cw', square: 'layout-dashboard', percent: 'tags'
  };
  function iconPath(name) {
    const key = ICON_ALIASES[name] || name;
    if (Object.hasOwn(SHARED_ICON_FILES, key)) return '../assets/' + SHARED_ICON_FILES[key];
    const icon = Object.hasOwn(FLATICON_IDS, key) ? key : 'link-2';
    return '../assets/oneqr/action-icons/' + icon + '-' + FLATICON_IDS[icon] + '.png';
  }
  function image(name) {
    return '<img class="oneqr-flat-icon" src="' + iconPath(name) + '" alt="" width="24" height="24" decoding="async">';
  }
  window.ONEQR_ACTION_APPEARANCE = Object.freeze({
    backgrounds: Object.freeze(TILE_BACKGROUNDS),
    icons: Object.freeze(ACTION_ICON_CHOICES),
    iconPath: iconPath,
    image: image
  });
})();
