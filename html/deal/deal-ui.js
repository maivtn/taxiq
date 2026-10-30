/* Presentation only: shared industry artwork, Lucide actions, and U.S. English. */
(() => {
  'use strict';

  const copy = window.NEXORA_DEAL_EN_US;
  const patterns = [
    [/^1 active coupons$/, '1 active coupon'],
    [/^1 stars$/, '1 star'],
    [/^([2-9]\d*|1\d+) coupon$/, '$1 coupons'],
    [/^(.+ min) · từ (\$[\d.]+)$/, '$1 · From $2'],
    [/^LÀM ĐẸP › NAIL › TẤT CẢ DỊCH VỤ · TRONG (\d+) MILES$/, 'BEAUTY › NAIL › ALL SERVICES · WITHIN $1 MILES'],
    [/^Còn (\d+) ngày$/, '$1 days left'],
    [/^Còn (\d+) (?:suất|lượt|mã)$/, '$1 left'],
    [/^còn (\d+) (?:suất|lượt|mã)$/, '$1 left'],
    [/^Còn (\d+) suất tuần này$/, '$1 slots left this week'],
    [/^Hôm nay · (\d+) suất$/, 'Today · $1 slots'],
    [/^Đồng bộ vừa xong · (\d+) suất$/, 'Just synced · $1 slots'],
    [/^(\d+) lượt có sẵn$/, '$1 available'],
    [/^Có (\d+) lượt để khách lấy coupon; hết lượt hệ thống tự dừng\.$/, '$1 coupons available; the offer stops automatically when they run out.'],
    [/^(\d+) deal đang mở$/, '$1 open deals'],
    [/^(\d+) nhu cầu$/, '$1 requests'],
    [/^(\d+) deal trong vòng (\d+) miles$/, '$1 deals within $2 miles'],
    [/^Tiết kiệm (\$[\d.]+)$/, 'Save $1'],
    [/^Giảm (\d+)%$/, '$1% off'],
    [/^Lưu (.+)$/, 'Save $1'],
    [/^Bỏ lưu (.+)$/, 'Unsave $1'],
    [/^🎟️ Coupon · (\d+) lượt$/, '🎟️ Coupon · $1 available'],
    [/^Biên lợi nhuận tốt\. Upgrade (\$[\d.]+) có thể tăng order value mà không cần giảm sâu hơn\.$/, 'Healthy margin. A $1 upgrade can increase order value without a deeper discount.'],
    [/^Đã ghép nhu cầu tại (\d+) khu vực\.$/, 'Matched your request across $1 areas.'],
    [/^Chạy đến (\d{4}-\d{2}-\d{2}) · không giới hạn lượt$/, 'Runs through $1 · Unlimited availability'],
    [/^Đến (\d{4}-\d{2}-\d{2})$/, 'Through $1'],
  ];

  function translate(value) {
    const text = String(value || '').trim();
    if (copy[text]) return copy[text];
    for (const [pattern, replacement] of patterns) {
      if (pattern.test(text)) return text.replace(pattern, replacement);
    }
    return null;
  }

  window.NEXORA_DEAL_PRESENTATION = Object.freeze({ translate, positionMatchSelect });

  function artwork(key, size = 24) {
    const holder = document.createElement('span');
    holder.innerHTML = window.NEXORA_INDUSTRY_ICONS.image(key, { size, className: 'deal-industry-icon' });
    return holder.firstElementChild;
  }

  function replaceIndustry(element, key, size = 24) {
    if (element.querySelector('.deal-industry-icon')) return;
    const first = element.firstElementChild;
    if (first?.tagName === 'SPAN' && (element.matches('.industry-grid [data-industry]') || /^[^\p{L}\p{N}]+$/u.test(first.textContent.trim()))) {
      first.replaceChildren(artwork(key, size));
    } else {
      const node = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
      if (node) node.nodeValue = node.nodeValue.replace(/^[^\p{L}\p{N}]+/u, '');
      element.prepend(artwork(key, size), document.createTextNode(' '));
    }
  }

  const industrySelectors = [
    ['[data-last-industry="all"],.service-chip[data-service="all"]', () => 'other'],
    ['[data-last-industry]:not([data-last-industry="all"])', element => ({ beauty: 'nail', services: 'other' }[element.dataset.lastIndustry] || element.dataset.lastIndustry)],
    ['[data-business-category]', element => element.dataset.businessCategory],
    ['[data-industry-root]', element => 'group:' + element.dataset.industryRoot],
    ['.service-chip:not([data-service="all"])', element => element.dataset.service === 'pedicure' ? 'pedi' : 'nail'],
    ['[data-nail-kind]', element => ({all:'other',massage:'spa',lashes:'lash'}[element.dataset.nailKind] || element.dataset.nailKind)],
    ['.industry-grid [data-industry]', element => ({ 'Hair & Barber': 'hair', 'Lash & Brow': 'lash', 'Spa & Massage': 'spa', 'Home & Auto': 'group:houseauto' }[element.dataset.industry])],
    ['[data-dw-match-suggestion]', element => {
      const value = element.dataset.dwMatchSuggestion.toLowerCase();
      return Object.entries({ pedicure: 'pedi', 'gel-x': 'nail', massage: 'spa', eyelash: 'lash', haircut: 'hair', lunch: 'food', powder: 'supply', 'car wash': 'carwash', dental: 'dental', airport: 'ride' }).find(([word]) => value.includes(word))?.[1];
    }],
  ];

  const actionRules = [
    ['.dialog-close,.bc-close,.drawer-header [data-dialog-close],[data-ai-close],[data-nudge-dismiss]', 'X', 'neutral'],
    ['[data-save],[data-coupon-save],#saveDetailButton,[data-nail-save],[data-nail-saved-toggle]', 'Heart', 'rose'],
    ['[data-open],[data-coupon-claim],[data-dw-nail-menu],#claimDealButton', 'Ticket', 'violet'],
    ['[data-opening-hold],[data-last-claim],[data-dw-save-wish]', 'CalendarCheck', 'teal'],
    ['[data-dw-remove-wish],[data-dw-remove-area],[data-nail-remove-filter]', 'X', 'neutral'],
    ['[data-dw-add-area]', 'MapPinPlus', 'blue'],
    ['[data-nail-gps],.locate-button', 'LocateFixed', 'blue'],
    ['[data-nail-filter-toggle],.filter-button', 'SlidersHorizontal', 'blue'],
    ['[data-beauty-review]', 'Star', 'amber'],
    ['[data-beauty-list]', 'Store', 'violet'],
    ['[data-beauty-clip]', 'Play', 'violet'],
    ['[data-ai-generate],.copilot-button', 'Sparkles', 'violet'],
    ['[data-copy-link],#copyOneqrLink', 'Copy', 'blue'],
    ['[data-nail-prev]', 'ChevronLeft', 'neutral'],
    ['[data-nail-next]', 'ChevronRight', 'neutral'],
    ['[data-hero-prev]', 'ChevronLeft', 'neutral'],
    ['[data-hero-next]', 'ChevronRight', 'neutral'],
    ['#aiOptimizeButton,.ai-guide-fab', 'Sparkles', 'violet'],
    ['.business-button', 'Megaphone', 'violet'],
    ['.footer-store-buttons a[href*="apps.apple.com"]', 'Smartphone', 'blue'],
    ['.footer-store-buttons a[href*="play.google.com"]', 'Play', 'blue'],
    ['button[type="reset"],[data-nail-reset],[data-nail-clear-recent]', 'RotateCcw', 'neutral'],
    ['#searchForm button[type="submit"],#quickMatchForm button[type="submit"],#aiGuideForm button[type="submit"],[data-dw-match-form] button[type="submit"],[data-dw-nearby-search] button[type="submit"],[data-nail-search] button[type="submit"],[data-mobile-global-search] button[type="submit"]', 'Search', 'violet'],
    ['#couponClaimForm button[type="submit"],#openingHoldForm button[type="submit"]', 'Check', 'teal'],
    ['#requestForm button[type="submit"]', 'Send', 'violet'],
    ['#merchantDealForm button[type="submit"]', 'Megaphone', 'violet'],
    ['.bc-form button[type="submit"]', 'Eye', 'violet'],
    ['#businessStartForm button[type="submit"]', 'ArrowRight', 'violet'],
    ['#filterForm button[type="submit"]', 'Check', 'blue'],
    ['[data-dw-lm-checkin-form] button[type="submit"]', 'UserCheck', 'teal'],
  ];
  const labelRules = [
    [/^Create.*with AI/i, 'Sparkles', 'violet'],
    [/^(?:Get started|Start growing|Grow business|Grow with Nexora)/i, 'TrendingUp', 'violet'],
    [/^Tell Nexora/i, 'MessageCircle', 'violet'],
    [/^Log in/i, 'LogIn', 'violet'],
    [/^(?:Copy|Copy link)/i, 'Copy', 'blue'],
    [/^(?:Approve|Confirm|Apply)/i, 'Check', 'teal'],
    [/^(?:Reject|Decline|Remove)/i, 'X', 'rose'],
    [/^(?:Invite|Share)/i, 'Share2', 'blue'],
    [/^Directions/i, 'Navigation', 'blue'],
    [/^(?:Close|Dismiss)$/i, 'X', 'neutral'],
    [/^Preview/i, 'Eye', 'violet'],
    [/^(?:Get coupon|Claim|View deal)/i, 'Ticket', 'violet'],
    [/^(?:Book|Reserve|Register early)/i, 'CalendarCheck', 'teal'],
    [/^(?:Search|Find|View results)/i, 'Search', 'violet'],
    [/^(?:Reset|Start over)/i, 'RotateCcw', 'neutral'],
    [/^(?:Create|Publish)/i, 'Plus', 'violet'],
  ];

  function decorateAction(element, name, color) {
    const foreground = getComputedStyle(element).color.match(/[\d.]+/g)?.map(Number) || [];
    element.classList.toggle('deal-action-on-fill', foreground.slice(0, 3).length === 3 && foreground.slice(0, 3).every(value => value >= 220));
    if (element.querySelector('.deal-action-icon') || element.querySelector('.deal-industry-icon')) return;
    const nodes = window.NEXORA_DEAL_LUCIDE?.icons[name];
    if (!nodes) return;
    const icon = window.NEXORA_DEAL_LUCIDE.createElement(nodes, {
      width: 16, height: 16, 'stroke-width': 1.8, 'aria-hidden': 'true', focusable: 'false',
      class: 'deal-action-icon deal-action-' + color,
    });
    const existing = element.querySelector('svg');
    const leading = element.firstElementChild;
    if (element.matches('[data-beauty-clip]') && element.querySelector('span')) {
      const caption = element.querySelector('span');
      caption.textContent = caption.textContent.replace(/^[^\p{L}\p{N}]+/u, '');
      caption.prepend(icon);
    } else if (element.matches('[data-dw-remove-area]') && element.querySelector('b')) element.querySelector('b').replaceChildren(icon);
    else if (existing) existing.replaceWith(icon);
    else if (leading?.tagName === 'SPAN' && /^[^\p{L}\p{N}]+$/u.test(leading.textContent.trim())) leading.replaceChildren(icon);
    else {
      const text = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
      if (text) text.nodeValue = text.nodeValue.replace(/^[^\p{L}\p{N}]+/u, '').replace(/\s*[→↗]$/u, '');
      element.prepend(icon);
    }
    const heart = name === 'Heart' && (element.classList.contains('saved') || element.getAttribute('aria-pressed') === 'true');
    if (heart) icon.classList.add('is-filled');
  }

  function translateAttributes(root) {
    root.querySelectorAll('[placeholder],[aria-label],[title],[alt],option,textarea').forEach(element => {
      for (const name of ['placeholder', 'aria-label', 'title', 'alt']) {
        const current = element.getAttribute(name);
        const next = current && translate(current);
        if (next && next !== current) element.setAttribute(name, next);
      }
      if (element.tagName === 'OPTION' && !element.hasAttribute('value')) element.setAttribute('value', element.textContent);
      if (element.tagName === 'TEXTAREA' && element.value === element.defaultValue) {
        const next = translate(element.defaultValue);
        if (next && next !== element.defaultValue) element.value = element.defaultValue = next;
      }
    });
  }

  const industryGlyphs = {
    '💅':'nail','🦶':'pedi','💆':'spa','🧖':'skin','💇':'hair','💈':'barber','👁':'lash',
    '🦷':'dental','🩺':'clinic','💊':'pharm','🦴':'chiro','💉':'medspa','🪒':'wax',
    '🏋':'fitness','🧘':'yoga','🧋':'drink','🍜':'food','🍲':'hotpot','🦞':'seafood',
    '🥬':'vegan','🥡':'homefood','☕':'drink','🥖':'bakery','🥐':'bakery','🎂':'bakery',
    '🍻':'bar','👗':'fashion','👜':'shoes','🕶':'eyewear','👓':'eyewear','💍':'jewelry',
    '🛋':'furniture','💐':'flower','🛞':'tire','🚕':'ride','🚗':'dealer','🚌':'bus',
    '🚚':'moving','👶':'daycare','🐶':'pet','🐾':'pet','👴':'senior','👰':'bridal',
    '⛪':'temple','🛍':'retail','🛒':'market','🏨':'hotel','🏠':'home','✈':'flight',
    '⛵':'tour','🎓':'vietschool','🏢':'professional','💼':'professional','📦':'supply',
    '🧽':'carwash','🧑‍💼':'professional','🪑':'rentalevent','✂':'hair',
  };
  const actionGlyphs = {
    '🔥':['Flame','rose'],'🏷':['Tags','violet'],'🎟':['Ticket','violet'],'🎫':['Ticket','violet'],
    '⚡':['Zap','amber'],'✨':['Sparkles','violet'],'✦':['Sparkles','violet'],
    '♡':['Heart','rose'],'♥':['Heart','rose'],'💛':['Heart','amber'],'🤲':['HandHeart','teal'],
    '📍':['MapPin','blue'],'🏙':['MapPin','blue'],'🏛':['MapPin','blue'],'⌖':['LocateFixed','blue'],'⌕':['Search','violet'],
    '📡':['Radar','blue'],'🗺':['Map','blue'],'🌐':['Globe','blue'],'🌍':['Globe','blue'],
    '⌂':['House','violet'],'▤':['Ticket','violet'],'☷':['ListFilter','blue'],
    '🎊':['PartyPopper','violet'],'🎉':['PartyPopper','violet'],'⏳':['Hourglass','amber'],
    '⏱':['Timer','amber'],'◷':['Clock','blue'],'📅':['CalendarDays','blue'],
    '📨':['Send','blue'],'✉':['Mail','blue'],'📱':['Smartphone','blue'],'📲':['Smartphone','blue'],
    '📞':['Phone','teal'],'☎':['Phone','teal'],'💳':['CreditCard','blue'],'💵':['Banknote','teal'],
    '💰':['Wallet','teal'],'🔒':['Lock','blue'],'⚠':['TriangleAlert','amber'],
    '✓':['Check','teal'],'✅':['CircleCheck','teal'],'🙋':['Hand','violet'],
    '⌄':['ChevronDown','neutral'],'×':['X','neutral'],'✕':['X','neutral'],
    '◎':['Globe','blue'],'☰':['Menu','violet'],'↻':['RotateCcw','blue'],
    '▦':['LayoutGrid','violet'],'◉':['CircleDot','blue'],'⌗':['QrCode','violet'],
    '＋':['Plus','violet'],'◌':['Circle','violet'],'⭐':['Star','amber'],
    '↶':['History','blue'],'↗':['ExternalLink','blue'],'←':['ArrowLeft','violet'],
    '⇄':['ArrowLeftRight','blue'],'Ⅱ':['Pause','neutral'],
    '▣':['MonitorSmartphone','violet'],'◫':['ContactRound','violet'],'✧':['Sparkles','violet'],
    '✿':['Flower2','violet'],'♨':['Flame','amber'],'◒':['Circle','violet'],'◐':['Circle','violet'],
    '◇':['Gem','violet'],'✣':['Sparkles','violet'],'◈':['Gem','violet'],'▶':['Play','violet'],
    '⌁':['Headset','blue'],'⌾':['ShieldCheck','teal'],
  };
  const glyphPattern = new RegExp(Object.keys({ ...industryGlyphs, ...actionGlyphs }).sort((a,b) => b.length-a.length).map(key => key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\uFE0F?').join('|'),'gu');
  const industryNavigationIcons = {
    nail:'Sparkles',pedi:'Footprints',spa:'Flower2',skin:'Sparkles',hair:'Scissors',barber:'Scissors',
    lash:'Eye',dental:'Cross',clinic:'HeartPulse',pharm:'Pill',chiro:'Activity',medspa:'Sparkles',
    wax:'Sparkles',fitness:'Dumbbell',yoga:'Activity',drink:'Coffee',food:'Utensils',hotpot:'CookingPot',
    seafood:'Fish',vegan:'Leaf',homefood:'Utensils',bakery:'Croissant',bar:'Wine',fashion:'Shirt',
    shoes:'ShoppingBag',eyewear:'Glasses',jewelry:'Gem',furniture:'Sofa',flower:'Flower2',tire:'Circle',
    ride:'Car',dealer:'Car',bus:'Bus',moving:'Truck',daycare:'Baby',pet:'PawPrint',senior:'UserRound',
    bridal:'Heart',temple:'Church',retail:'ShoppingBag',market:'ShoppingBasket',hotel:'Hotel',
    home:'House',flight:'Plane',tour:'Sailboat',vietschool:'GraduationCap',professional:'Briefcase',
    supply:'Package',carwash:'Car',rentalevent:'Armchair',
  };

  function replaceGlyphs(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest('script,style,noscript,svg,textarea,option,[contenteditable],.deal-action-icon,.deal-industry-icon')) continue;
      glyphPattern.lastIndex = 0;
      if (glyphPattern.test(node.nodeValue)) texts.push(node);
    }
    for (const node of texts) {
      const fragment = document.createDocumentFragment();
      let position = 0;
      glyphPattern.lastIndex = 0;
      for (const match of node.nodeValue.matchAll(glyphPattern)) {
        fragment.append(node.nodeValue.slice(position, match.index));
        const key = match[0].replace(/\uFE0F/g,'');
        const industry = industryGlyphs[key];
        const navigation = node.parentElement.closest('nav,.header-actions,button:not([data-dw-industry-id])');
        if (industry && !navigation) {
          const icon = artwork(industryGlyphs[key]);
          icon.classList.add('deal-inline-industry');
          fragment.append(icon);
        } else {
          const [name, color] = industry ? [industryNavigationIcons[industry] || 'Briefcase','violet'] : actionGlyphs[key];
          const icon = window.NEXORA_DEAL_LUCIDE.createElement(window.NEXORA_DEAL_LUCIDE.icons[name], {
            width: 18, height: 18, 'stroke-width': 1.8, 'aria-hidden': 'true', focusable: 'false',
            class: 'deal-inline-icon deal-action-' + color,
          });
          fragment.append(icon);
        }
        position = match.index + match[0].length;
      }
      fragment.append(node.nodeValue.slice(position));
      node.replaceWith(fragment);
    }
  }

  function getVisibleViewport() {
    const viewport = window.visualViewport;
    const top = viewport?.offsetTop || 0;
    const keyboard = navigator.virtualKeyboard?.boundingRect;
    const bottom = Math.min(top + (viewport?.height || innerHeight), keyboard?.height ? keyboard.top : Infinity);
    return { top, bottom, height: Math.max(120, bottom - top) };
  }

  function getVisibleDockTop(bottom) {
    const nav = document.querySelector('.mobile-nav');
    if (!nav?.getClientRects().length || getComputedStyle(nav).visibility !== 'visible') return bottom;
    const create = nav.querySelector('.mobile-create .deal-mobile-nav-icon');
    return Math.min(bottom, nav.getBoundingClientRect().top, create?.getBoundingClientRect().top ?? bottom);
  }

  function positionMatchSelect(wrapper) {
    const bounds = wrapper.querySelector('.ts-control').getBoundingClientRect();
    const viewport = getVisibleViewport();
    const bottom = getVisibleDockTop(viewport.bottom);
    const header = document.querySelector('[data-mobile-directory-nav]');
    const top = Math.max(viewport.top + 16, header?.getBoundingClientRect().bottom || 0);
    const below = Math.max(0, bottom - bounds.bottom - 26);
    const above = Math.max(0, bounds.top - top - 26);
    const up = below < 264 && above > below;
    wrapper.classList.toggle('dw-select-opens-up', up);
    wrapper.style.setProperty('--dw-select-available', `${Math.max(44, up ? above : below)}px`);
  }

  function syncPhoneFilterPopover(top, bottom, touch) {
    const picker = document.querySelector('[data-nearby-picker]');
    if (!picker) return;
    picker.classList.remove('deal-popover-up', 'deal-popover-fixed');
    if (!touch || !picker.open) return;
    const anchor = picker.querySelector('summary').getBoundingClientRect();
    const limit = getVisibleDockTop(bottom);
    const header = document.querySelector('[data-mobile-directory-nav]');
    const start = Math.min(limit - 112, Math.max(top + 8, (header?.getBoundingClientRect().bottom || top) + 8));
    const below = Math.max(0, limit - anchor.bottom - 16);
    const above = Math.max(0, anchor.top - start - 8);
    const fixed = Math.max(below, above) < 220;
    const up = !fixed && below < 260 && above > below;
    picker.classList.toggle('deal-popover-fixed', fixed);
    picker.classList.toggle('deal-popover-up', up);
    picker.style.setProperty('--deal-popover-top', `${start}px`);
    picker.style.setProperty('--deal-popover-height', `${Math.max(96, fixed ? limit - start - 8 : up ? above : below)}px`);
  }

  function syncPhoneOverlays() {
    const { top, bottom, height } = getVisibleViewport();
    document.documentElement.style.setProperty('--deal-visual-top', `${top}px`);
    document.documentElement.style.setProperty('--deal-visual-height', `${height}px`);
    document.documentElement.style.setProperty('--deal-keyboard-inset', `${Math.max(0, innerHeight - bottom)}px`);
    const touch = matchMedia('(pointer: coarse)').matches;
    document.body.classList.toggle('deal-phone-keyboard-open', touch && height < innerHeight - 80);
    syncPhoneFilterPopover(top, top + height, touch);
    document.querySelectorAll('.dw-match-select .ts-wrapper.dropdown-active').forEach(positionMatchSelect);
    const assistant = document.querySelector('.ai-guide-fab');
    if (!assistant) return;
    if (!touch || document.querySelector('dialog[open]')) {
      assistant.classList.remove('deal-ai-obstructs-control');
      return;
    }
    const bounds = assistant.getBoundingClientRect();
    const blocked = Array.from(document.querySelectorAll('a,button,input,select,textarea,summary,[role="combobox"]')).some(control => {
      if (control === assistant || assistant.contains(control) || control.disabled) return false;
      if (control.checkVisibility && !control.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
      const closedDetails = control.closest('details:not([open])');
      if (closedDetails && !closedDetails.querySelector('summary')?.contains(control)) return false;
      const rect = control.getBoundingClientRect();
      if (rect.width < 20 || rect.height < 20) return false;
      const left = Math.max(bounds.left, rect.left), right = Math.min(bounds.right, rect.right);
      const top = Math.max(bounds.top, rect.top), bottom = Math.min(bounds.bottom, rect.bottom);
      if (left >= right || top >= bottom) return false;
      return document.elementsFromPoint((left + right) / 2, (top + bottom) / 2).some(element => control === element || control.contains(element));
    });
    assistant.classList.toggle('deal-ai-obstructs-control', blocked);
  }

  function refresh() {
    const root = document.body;
    if (!root) return;
    translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest('script,style,noscript,svg,textarea,option,[contenteditable]')) continue;
      const next = translate(node.nodeValue);
      if (next && next !== node.nodeValue.trim()) node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), next);
    }
    for (const [selector, resolve] of industrySelectors) {
      root.querySelectorAll(selector).forEach(element => {
        const key = resolve(element);
        if (key) replaceIndustry(element, key);
      });
    }
    root.querySelectorAll('[data-deal-nav-icon]').forEach(element => {
      if (element.querySelector('svg')) return;
      const nodes = window.NEXORA_DEAL_LUCIDE?.icons[element.dataset.dealNavIcon];
      if (!nodes) return;
      element.replaceChildren(window.NEXORA_DEAL_LUCIDE.createElement(nodes, {
        width: 24, height: 24, 'stroke-width': 1.8,
        'aria-hidden': 'true', focusable: 'false', class: 'deal-mobile-nav-svg',
      }));
    });
    const entryIcons = { '#nearby':'MapPin', '#last-minute':'Zap', '#coupons':'Ticket' };
    root.querySelectorAll('.discover-entry').forEach(entry => {
      const name = entryIcons[entry.getAttribute('href')];
      const library = window.NEXORA_DEAL_LUCIDE;
      if (!name || !library) return;
      for (const [target, icon, className, size] of [
        [entry.querySelector('.discover-entry-icon'), name, 'deal-entry-svg', 22],
        [entry.querySelector(':scope > b'), 'ArrowRight', 'deal-entry-arrow', 16],
      ]) {
        if (!target || target.querySelector(`.${className}`)) continue;
        target.replaceChildren(library.createElement(library.icons[icon], {
          width:size, height:size, 'stroke-width':1.75, 'aria-hidden':'true',
          focusable:'false', class:className,
        }));
      }
    });
    const businessIcons = { overview:'LayoutDashboard', campaigns:'Megaphone', oneqr:'QrCode', ads:'Wallet', earnings:'Banknote', crm:'ContactRound', verification:'BadgeCheck' };
    root.querySelectorAll('.business-tabs [data-business-view]').forEach(element => {
      decorateAction(element, businessIcons[element.dataset.businessView], 'violet');
    });
    const oneqrViews = { menu:'PanelsTopLeft', deals:'MapPin', search:'Search' };
    root.querySelectorAll('nav[aria-label="OneQR navigation"] [data-oneqr-view]').forEach(element => {
      decorateAction(element, oneqrViews[element.dataset.oneqrView], 'violet');
    });
    const utilityIcons = { 'Check-in':'ListOrdered', 'Đặt lịch':'CalendarDays', Rewards:'Gift', 'Gọi hỗ trợ':'Headset' };
    root.querySelectorAll('[data-oneqr-utility]').forEach(element => {
      decorateAction(element, utilityIcons[element.dataset.oneqrUtility], 'violet');
    });
    const channelIcons = { pos:'MonitorSmartphone', booking:'CalendarDays', crmSms:'MessagesSquare', marketplace:'Store', oneqrRevenue:'HandCoins' };
    root.querySelectorAll('.channel-icon').forEach(element => {
      if (element.querySelector('.deal-channel-icon')) return;
      const name = channelIcons[element.closest('label')?.querySelector('input')?.name];
      if (!name) return;
      element.replaceChildren(window.NEXORA_DEAL_LUCIDE.createElement(window.NEXORA_DEAL_LUCIDE.icons[name], {
        width: 22, height: 22, 'stroke-width': 1.8, 'aria-hidden': 'true', focusable: 'false',
        class: 'deal-inline-icon deal-channel-icon deal-action-violet',
      }));
    });
    for (const [selector, name, color] of actionRules) root.querySelectorAll(selector).forEach(element => decorateAction(element, name, color));
    root.querySelectorAll('button').forEach(element => {
      if (element.closest('.hero-carousel-controls') || element.matches('[data-dw-group],.service-chip,.taxonomy-chip,.br-stars button')) return;
      const label = element.textContent.trim().replace(/^[^\p{L}\p{N}]+/u, '');
      const rule = labelRules.find(([pattern]) => pattern.test(label));
      if (rule) decorateAction(element, rule[1], rule[2]);
    });
    replaceGlyphs(root);
    syncPhoneOverlays();
  }

  function start() {
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; refresh(); });
    };
    new MutationObserver(schedule).observe(document.body, { childList: true, characterData: true, subtree: true });
    document.addEventListener('change', schedule);
    let overlayScheduled = false;
    const scheduleOverlays = () => {
      if (overlayScheduled) return;
      overlayScheduled = true;
      requestAnimationFrame(() => { overlayScheduled = false; syncPhoneOverlays(); });
    };
    document.addEventListener('scroll', scheduleOverlays, { capture: true, passive: true });
    document.addEventListener('toggle', scheduleOverlays, true);
    window.addEventListener('resize', scheduleOverlays);
    window.visualViewport?.addEventListener('resize', scheduleOverlays);
    window.visualViewport?.addEventListener('scroll', scheduleOverlays, { passive: true });
    navigator.virtualKeyboard?.addEventListener('geometrychange', scheduleOverlays);
    new ResizeObserver(scheduleOverlays).observe(document.body);
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
