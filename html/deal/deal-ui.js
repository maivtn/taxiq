/* Presentation only: shared industry artwork, Lucide actions, and U.S. English. */
(() => {
  'use strict';

  const copy = window.NEXORA_DEAL_EN_US;
  const patterns = [
    [/^(Check-in|Đặt lịch|Rewards|Gọi hỗ trợ) mở ngay trong OneQR · không cần app\.$/, (_, label) => `${({ 'Đặt lịch':'Booking', 'Gọi hỗ trợ':'Support' }[label] || label)} opens in OneQR · No app required.`],
    [/^1 kết quả$/, '1 result'],
    [/^(\d+) kết quả$/, '$1 results'],
    [/^(.+) đã nằm trong lộ trình mở rộng sau nail\.$/, '$1 is planned after the nail launch.'],
    [/^(Tất cả đã lưu|Deal đã lưu|Coupon đã lưu|Last Minute đã lưu|Khai trương đang theo dõi) · (\d+)$/, (_, label, count) => `${copy[label]} · ${count}`],
    [/^1 active coupons$/, '1 active coupon'],
    [/^1 stars$/, '1 star'],
    [/^([2-9]\d*|1\d+) coupon$/, '$1 coupons'],
    [/^(.+ min) · từ (\$[\d.]+)$/, '$1 · From $2'],
    [/^LÀM ĐẸP › NAIL › TẤT CẢ DỊCH VỤ · TRONG (\d+) MILES$/, 'BEAUTY › NAIL › ALL SERVICES · WITHIN $1 MILES'],
    [/^LÀM ĐẸP › NAIL › (MANICURE|PEDICURE|GEL-X|NAIL ART) · TRONG (\d+) MILES$/, 'BEAUTY › NAIL › $1 · WITHIN $2 MILES'],
    [/^Deal nổi bật quanh (.+)$/, 'Featured deals around $1'],
    [/^Deal gần Gần bạn$/, 'Deals Nearby'],
    [/^Deal gần (.+)$/, 'Deals near $1'],
    [/^Kết quả đang khớp với (.+)\.$/, 'Results match $1.'],
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
    ['[data-dw-match-suggestion]', element => {
      const value = element.dataset.dwMatchSuggestion.toLowerCase();
      return Object.entries({ pedicure: 'pedi', 'gel-x': 'nail', massage: 'spa', eyelash: 'lash', haircut: 'hair', lunch: 'food', powder: 'supply', 'car wash': 'carwash', dental: 'dental', airport: 'ride' }).find(([word]) => value.includes(word))?.[1];
    }],
  ];

  const actionRules = [
    ['#searchForm .landing-location-button', 'LocateFixed', 'blue'],
    ['.platform-network-stats article:nth-child(1) > span', 'Store', 'blue'],
    ['.platform-network-stats article:nth-child(2) > span', 'Tags', 'violet'],
    ['.platform-network-stats article:nth-child(3) > span', 'Eye', 'blue'],
    ['.platform-network-stats article:nth-child(4) > span', 'Ticket', 'teal'],
    ['.deal-card.deal-offer .deal-open', 'ArrowRight', 'blue'],
    ['.deal-card.coupon-offer .deal-open', 'Ticket', 'violet'],
    ['.discover-trust-row > span:nth-child(1)', 'ShieldCheck', 'teal'],
    ['.discover-trust-row > span:nth-child(2)', 'Globe', 'blue'],
    ['.discover-trust-row > span:nth-child(3)', 'Sparkles', 'violet'],
    ['.discover-connection-strip .function-bridge-launch', 'ArrowLeftRight', 'blue'],
    ['.discover-connection-strip .oneqr-launch', 'QrCode', 'teal'],
    ['.discover-connection-strip .utility-business', 'Store', 'violet'],
    ['.discover-connection-strip button .connection-action-hint', 'ArrowRight', 'blue'],
    ['.discover-connection-strip a .connection-action-hint', 'ExternalLink', 'violet'],
    ['.dialog-close,.bc-close,.drawer-header [data-dialog-close],[data-ai-close],[data-nudge-dismiss]', 'X', 'neutral'],
    ['#openingHoldSuccess [data-dialog-close]', 'Check', 'teal'],
    ['dialog [data-dialog-close]:not(.dialog-close)', 'X', 'neutral'],
    ['#bookDealLink[data-demo-profile]', 'Store', 'blue'],
    ['#bookDealLink', 'CalendarCheck', 'teal'],
    ['#useLocationButton', 'LocateFixed', 'blue'],
    ['#simulatePurchaseButton', 'Banknote', 'teal'],
    ['#demoTopupButton', 'Wallet', 'amber'],
    ['#businessDialog .oneqr-launch', 'QrCode', 'blue'],
    ['#aiGuideResultAction', 'ArrowRight', 'blue'],
    ['#aiGuideForm button[type="submit"]', 'Sparkles', 'violet'],
    ['[data-voice-end]', 'X', 'rose'],
    ['[data-save],[data-coupon-save],#saveDetailButton,[data-nail-save],[data-nail-saved-toggle]', 'Heart', 'rose'],
    ['[data-open],[data-coupon-claim],[data-dw-nail-menu],[data-oneqr-banner],#claimDealButton', 'Ticket', 'violet'],
    ['[data-opening-hold],[data-last-claim],[data-dw-save-wish]', 'CalendarCheck', 'teal'],
    ['[data-dw-remove-wish],[data-dw-remove-area],[data-nail-remove-filter]', 'X', 'neutral'],
    ['[data-dw-add-area]', 'MapPinPlus', 'blue'],
    ['[data-nail-gps],.locate-button', 'LocateFixed', 'blue'],
    ['[data-nail-filter-toggle],.filter-button', 'SlidersHorizontal', 'blue'],
    ['[data-beauty-review]', 'Star', 'amber'],
    ['[data-beauty-list]', 'Store', 'violet'],
    ['[data-beauty-clip]', 'Play', 'violet'],
    ['[data-ai-generate],.copilot-button', 'Sparkles', 'violet'],
    ['[data-copy-link],#copyOneqrLink,#copyOneQRLink', 'Copy', 'blue'],
    ['[data-nail-prev]', 'ChevronLeft', 'neutral'],
    ['[data-nail-next]', 'ChevronRight', 'neutral'],
    ['[data-hero-prev]', 'ChevronLeft', 'neutral'],
    ['[data-hero-next]', 'ChevronRight', 'neutral'],
    ['#aiOptimizeButton,.ai-guide-fab', 'Sparkles', 'violet'],
    ['.business-button', 'Megaphone', 'violet'],
    ['.footer-store-buttons a[href*="apps.apple.com"]', 'Smartphone', 'blue'],
    ['.footer-store-buttons a[href*="play.google.com"]', 'Play', 'blue'],
    ['button[type="reset"],[data-nail-reset],[data-nail-clear-recent]', 'RotateCcw', 'neutral'],
    ['#searchForm button[type="submit"],#quickMatchForm button[type="submit"],[data-dw-match-form] button[type="submit"],[data-dw-nearby-search] button[type="submit"],[data-nail-search] button[type="submit"],[data-mobile-global-search] button[type="submit"]', 'Search', 'violet'],
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
    const style = getComputedStyle(element);
    const foreground = style.color.match(/[\d.]+/g)?.map(Number) || [];
    element.classList.toggle('deal-action-on-fill', foreground.slice(0, 3).length === 3 && foreground.slice(0, 3).every(value => value >= 220));
    const modalAction = !!element.closest('dialog')
      && !element.closest('.business-tabs,.oneqr-stage-nav,.ai-guide-options')
      && !element.matches('.dialog-close,.bc-close,[data-oneqr-utility],[data-oneqr-view],.drawer-header [data-dialog-close]');
    element.classList.toggle('deal-modal-action', modalAction);
    element.classList.toggle('deal-modal-action-flex', modalAction && ['flex','inline-flex'].includes(style.display));
    if (element.querySelector('.deal-action-icon,.deal-industry-icon,.deal-utility-art')) return;
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
    } else if (element.matches('.publish-button') && leading?.tagName === 'SPAN') {
      leading.prepend(icon);
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
        if (industry && (!navigation || industry === 'lash')) {
          const icon = artwork(industryGlyphs[key], navigation ? 18 : 24);
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

  const mobileIndustryControls = new Map();
  let mobileIndustryId = 0;
  const mobileIndustryGroups = [
    ['.last-minute-industries', '[data-last-industry]', 'data-last-industry'],
    ['.taxonomy-options:has([data-industry-root])', '[data-industry-root]', 'data-industry-root'],
    ['.taxonomy-options:has([data-business-category])', '[data-business-category]', 'data-business-category'],
    ['.taxonomy-filter .category-row', '[data-service]', 'data-service'],
    ['.nd-services', '[data-nail-kind]', 'data-nail-kind'],
    ['[data-dw-category-picker]', '[data-dw-group="directory-industry"]', 'data-dw-value'],
  ];

  function refreshMobileIndustrySelects() {
    for (const [group, adapter] of mobileIndustryControls) {
      if (!group.isConnected) {
        adapter.select.tomselect?.destroy();
        adapter.wrapper.remove();
        mobileIndustryControls.delete(group);
      }
    }
    if (!matchMedia('(max-width:720px)').matches) {
      for (const adapter of mobileIndustryControls.values()) adapter.select.tomselect?.close();
      return;
    }
    const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    for (const [selector, buttonSelector, valueAttribute] of mobileIndustryGroups) {
      document.querySelectorAll(selector).forEach(group => {
        const buttons = () => [...group.querySelectorAll(buttonSelector)];
        const readChoice = button => {
          const clone = button.cloneNode(true);
          clone.querySelectorAll('img,svg,small,[aria-hidden="true"]').forEach(element => element.remove());
          const baseLabel = button.dataset.baseLabel;
          const label = (baseLabel || clone.textContent).trim().replace(/^[^\p{L}\p{N}]+/u, '').replace(/\s+/g, ' ');
          const badge = baseLabel ? (button.textContent.match(/\s(\d+)\s*$/)?.[1] || '') : (button.querySelector('small')?.textContent.trim() || '');
          return {value:button.getAttribute(valueAttribute),label,badge,art:button.querySelector('img')?.getAttribute('src') || '',disabled:button.disabled};
        };
        const choices = buttons().map(readChoice);
        const active = buttons().find(button => button.classList.contains('active') || button.getAttribute('aria-pressed') === 'true') || buttons()[0];
        if (!active) return;
        let adapter = mobileIndustryControls.get(group);
        if (!adapter) {
          const wrapper = document.createElement('div');
          wrapper.className = 'dw-match-select mobile-industry-select';
          const label = document.createElement('label');
          const directory = group.matches('[data-dw-category-picker]');
          label.className = directory ? 'mobile-industry-label' : 'sr-only';
          label.textContent = group.getAttribute('aria-label') || group.querySelector('summary small')?.textContent || '';
          const select = document.createElement('select');
          select.id = `deal-mobile-filter-${++mobileIndustryId}`;
          label.htmlFor = select.id;
          label.id = `${select.id}-label`;
          select.addEventListener('change', () => buttons().find(button => button.getAttribute(valueAttribute) === select.value)?.click());
          wrapper.append(label, select);
          group.after(wrapper);
          group.setAttribute('data-mobile-industry-original', '');
          adapter = {wrapper,select};
          mobileIndustryControls.set(group, adapter);
        }
        const {select} = adapter;
        const signature = JSON.stringify(choices);
        const activeValue = active.getAttribute(valueAttribute);
        if (!select.tomselect && select.dataset.choiceSignature !== signature) {
          select.replaceChildren(...choices.map(item => {
            const option = new Option(item.label + (item.badge ? ` · ${item.badge}` : ''), item.value, false, item.value === activeValue);
            option.disabled = item.disabled;
            return option;
          }));
        }
        if (!select.tomselect && window.TomSelect) {
          const render = data => {
            const button = buttons().find(button => button.getAttribute(valueAttribute) === String(data.value));
            if (!button) return '<div></div>';
            const item = readChoice(button);
            return `<div class="dw-match-select-choice industry-select-choice">${item.art ? `<span class="dw-match-select-icon"><img src="${escape(item.art)}" width="20" height="20" alt="" aria-hidden="true"></span>` : ''}<span class="industry-select-text">${escape(item.label)}</span>${item.badge ? `<span class="industry-select-badge">${escape(item.badge)}</span>` : ''}</div>`;
          };
          const control = new window.TomSelect(select, {
            create:false, maxItems:1, maxOptions:null, controlInput:null,
            hideSelected:false, closeAfterSelect:true, searchField:[],
            render:{option:render,item:render},
          });
          control.control.setAttribute('aria-labelledby', `${select.id}-label`);
          select.setAttribute('aria-hidden', 'true');
          control.on('dropdown_open', () => positionMatchSelect(control.wrapper));
        }
        const control = select.tomselect;
        if (control && select.dataset.choiceSignature !== signature) {
          choices.forEach(item => control.updateOption(item.value, {value:item.value,text:item.label,disabled:item.disabled}));
        }
        select.dataset.choiceSignature = signature;
        if (control) {
          if (control.getValue() !== activeValue) control.setValue(activeValue, true);
        } else select.value = activeValue;
      });
    }
  }

  function refreshSavedFilterSelect() {
    const nav = document.querySelector('.wishlist-subnav');
    if (!nav) return;
    let select = nav.querySelector('[data-saved-filter]');
    if (nav.hidden || !matchMedia('(max-width:720px)').matches) {
      select?.tomselect?.close();
      return;
    }
    const buttons = [...nav.querySelectorAll(':scope > [data-wishlist-view]')];
    const readChoice = button => ({
      value: button.dataset.wishlistView,
      label: [...button.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.nodeValue).join(' ').trim(),
      count: button.querySelector('[data-wishlist-count]')?.textContent.trim() || '0',
      art: button.querySelector('img')?.getAttribute('src') || '',
    });
    const choices = buttons.map(readChoice);
    const active = buttons.find(button => button.classList.contains('active')) || buttons[0];
    if (!active) return;
    if (!select) {
      const wrapper = document.createElement('div');
      wrapper.className = 'dw-match-select wishlist-mobile-select';
      const label = document.createElement('label');
      label.className = 'sr-only';
      label.id = 'dwSavedFilterLabel';
      label.htmlFor = 'dwSavedFilter';
      label.textContent = 'Saved';
      select = document.createElement('select');
      select.id = 'dwSavedFilter';
      select.dataset.savedFilter = '';
      select.addEventListener('change', () => buttons.find(button => button.dataset.wishlistView === select.value)?.click());
      wrapper.append(label, select);
      nav.append(wrapper);
    }
    const signature = JSON.stringify(choices.map(item => [item.value,item.label,item.count]));
    if (!select.tomselect && select.dataset.savedSignature !== signature) {
      select.replaceChildren(...choices.map(item => new Option(`${item.label} · ${item.count}`, item.value, false, item.value === active.dataset.wishlistView)));
    }
    if (!select.tomselect && window.TomSelect) {
      const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
      const render = data => {
        const button = buttons.find(item => item.dataset.wishlistView === String(data.value));
        if (!button) return '<div></div>';
        const item = readChoice(button);
        return `<div class="dw-match-select-choice saved-filter-choice" data-saved-kind="${escape(item.value)}"><span class="dw-match-select-icon"><img class="saved-filter-art" src="${escape(item.art)}" alt="" aria-hidden="true" width="24" height="24"></span><span class="saved-filter-label">${escape(item.label)}</span><small>${escape(item.count)}</small></div>`;
      };
      const control = new window.TomSelect(select, {
        create:false, maxItems:1, maxOptions:null, controlInput:null,
        hideSelected:false, closeAfterSelect:true, searchField:[],
        render:{option:render,item:render},
      });
      control.control.setAttribute('aria-labelledby','dwSavedFilterLabel');
      control.on('dropdown_open', () => positionMatchSelect(control.wrapper));
    }
    const control = select.tomselect;
    if (control && select.dataset.savedSignature !== signature) {
      choices.forEach(item => control.updateOption(item.value, {value:item.value,text:`${item.label} · ${item.count}`}));
    }
    select.dataset.savedSignature = signature;
    if (control) {
      if (control.getValue() !== active.dataset.wishlistView) control.setValue(active.dataset.wishlistView, true);
    } else select.value = active.dataset.wishlistView;
    for (const name of ['accent','tint','edge']) {
      const value = getComputedStyle(active).getPropertyValue('--section-' + name).trim();
      if (value) select.parentElement.style.setProperty('--saved-' + name,value);
    }
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
    const expansionIcons = { 'Hair & Barber':'Scissors', 'Spa & Massage':'Flower2', 'Home & Auto':'Wrench' };
    root.querySelectorAll('.industry-expansion [data-industry] > span').forEach(element => {
      if (element.parentElement.dataset.industry === 'Lash & Brow') {
        if (!element.querySelector('.deal-industry-icon')) element.replaceChildren(artwork('lash', 24));
        return;
      }
      if (element.querySelector('.deal-expansion-svg')) return;
      const library = window.NEXORA_DEAL_LUCIDE;
      const name = expansionIcons[element.parentElement.dataset.industry];
      if (!library?.icons[name]) return;
      element.replaceChildren(library.createElement(library.icons[name], {
        width:22, height:22, 'stroke-width':2, 'aria-hidden':'true', focusable:'false', class:'deal-expansion-svg',
      }));
    });
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
    const modalRoutes = { deals:['MapPin','blue'], dcats:['Ticket','amber'], dmatch:['MessagesSquare','violet'], dopen:['Store','teal'], dlast:['Zap','amber'] };
    root.querySelectorAll('dialog [data-function-route]').forEach(element => {
      const icon = modalRoutes[element.dataset.functionRoute];
      if (icon) decorateAction(element, ...icon);
    });
    const touchRoutes = { promotion:['Megaphone','violet'], oneqr:['QrCode','blue'], redeem:['Check','teal'] };
    root.querySelectorAll('dialog [data-touch-route]').forEach(element => {
      const icon = touchRoutes[element.dataset.touchRoute];
      if (icon) decorateAction(element, ...icon);
    });
    const aiIntents = { nearby:'MapPin', today:'Zap', request:'MessageCircle', coupon:'Ticket', business:'Store' };
    root.querySelectorAll('#aiGuideDialog [data-ai-intent] > span').forEach(element => {
      if (element.querySelector('.deal-modal-choice-icon')) return;
      const icon = aiIntents[element.parentElement.dataset.aiIntent];
      if (!icon) return;
      element.replaceChildren(window.NEXORA_DEAL_LUCIDE.createElement(window.NEXORA_DEAL_LUCIDE.icons[icon], {
        width:22, height:22, 'stroke-width':1.75, 'aria-hidden':'true', focusable:'false', class:'deal-modal-choice-icon',
      }));
    });
    root.querySelectorAll('#oneqrDialog [data-oneqr-stage]').forEach(element => {
      if (element.closest('.oneqr-stage-nav')) return;
      const icon = element.dataset.oneqrStage === 'performance' ? 'TrendingUp' : 'BadgeCheck';
      decorateAction(element, icon, 'blue');
    });
    root.querySelectorAll('[data-voice-mute]').forEach(element => {
      const muted = element.getAttribute('aria-pressed') === 'true';
      decorateAction(element, muted ? 'Mic' : 'MicOff', muted ? 'teal' : 'blue');
    });
    const oneqrViews = { menu:'PanelsTopLeft', deals:'MapPin', search:'Search' };
    root.querySelectorAll('nav[aria-label="OneQR navigation"] [data-oneqr-view]').forEach(element => {
      decorateAction(element, oneqrViews[element.dataset.oneqrView], 'violet');
    });
    const utilityIcons = {
      'Check-in':['../assets/icon-oneqr/issue-2040-oneqr-scan-line-3d.png','checkin'],
      'Đặt lịch':['../assets/icon-oneqr/issue-2040-oneqr-calendar-check-3d.png','booking'],
      Rewards:['../assets/icon-oneqr/issue-2040-oneqr-gift-3d.png','rewards'],
      'Gọi hỗ trợ':['../assets/icon-oneqr/issue-2040-oneqr-phone-3d.png','support'],
    };
    root.querySelectorAll('[data-oneqr-utility]').forEach(element => {
      const item = utilityIcons[element.dataset.oneqrUtility];
      if (!item) return;
      element.dataset.utilityTone = item[1];
      const slot = element.querySelector(':scope > span');
      if (!slot || slot.querySelector('.deal-utility-art')) return;
      const icon = document.createElement('img');
      icon.className = 'deal-utility-art';
      icon.src = item[0];
      icon.alt = '';
      icon.setAttribute('aria-hidden','true');
      icon.width = 32;
      icon.height = 32;
      icon.draggable = false;
      slot.replaceChildren(icon);
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
    root.querySelectorAll('#searchForm .landing-location-button').forEach(element => {
      const label = element.textContent.trim();
      element.setAttribute('aria-label', label);
      element.setAttribute('title', label);
    });
    root.querySelectorAll('button').forEach(element => {
      if (element.closest('.hero-carousel-controls') || element.matches('[data-ai-intent],[data-dw-group],.service-chip,.taxonomy-chip,.br-stars button')) return;
      const label = element.textContent.trim().replace(/^[^\p{L}\p{N}]+/u, '');
      const rule = labelRules.find(([pattern]) => pattern.test(label));
      if (rule) decorateAction(element, rule[1], rule[2]);
    });
    refreshMobileIndustrySelects();
    refreshSavedFilterSelect();
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
    document.addEventListener('click', schedule);
    matchMedia('(max-width:720px)').addEventListener('change', schedule);
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
