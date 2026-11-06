/* Local 3D PNGs from Icons8 and the selected IconScout assets. */
(function () {
  'use strict';
  var script = document.currentScript;
  var base = script && script.src ? new URL('icons/3d-fluency/', script.src).href : '../assets/icons/3d-fluency/';
  var files = {
  "home": "home.png",
  "dashboard": "dashboard.png",
  "pos": "../iconscout/pos-project-management-6578282.png",
  "oneqr": "../iconscout/oneqr-12692239.png",
  "community": "../iconscout/community-5487791.png",
  "aihub": "../iconscout/ai-hub-10852467.png",
  "marketing": "../iconscout/ai-marketing-13327169.png",
  "sms": "sms.png",
  "gift": "../iconscout/gift-card-7705322.png",
  "reviews": "../iconscout/reviews-feedback-13328881.png",
  "analytics": "analytics.png",
  "taxiq": "../iconscout/tax-iq-10411198.png",
  "booking": "booking.png",
  "staff": "staff.png",
  "tickets": "tickets.png",
  "checkout": "checkout.png",
  "settings": "settings.png",
  "configuration": "../iconscout/configuration-8363484.png",
  "setup-checklist": "../iconscout/setup-checklist-5242405.png",
  "report": "report.png",
  "rewards": "../iconscout/deal-coupon-13170797.png",
  "support": "support.png",
  "news": "news.png",
  "onboarding": "onboarding.png",
  "tools": "tools.png",
  "payments": "../iconscout/payment-14986609.png",
  "ai-voice": "ai-voice.png",
  "spinwheel": "../iconscout/prize-wheel-10862879.webp"
};
  function escape(value) { return String(value).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  // Content artwork uses the existing OneQR family; navigation keeps its own icons.
  var contentBase = script && script.src ? new URL('icon-oneqr/', script.src).href : '../assets/icon-oneqr/';
  var contentKinds = {
    pos:'store', oneqr:'qr-code', payments:'wallet', aihub:'bot', marketing:'megaphone',
    reviews:'star', gift:'gift', analytics:'layout-dashboard', community:'users-round', taxiq:'receipt',
    storefront:'store', qr:'qr-code', wallet:'wallet', coins:'hand-coins', send:'share-2',
    headset:'phone', sparkle:'sparkles', star:'star', message:'message-circle', palette:'paintbrush',
    badge:'award', bag:'shopping-bag', files:'receipt', clock:'clock', newspaper:'list',
    briefcase:'briefcase', tag:'tag', book:'list', phone:'phone', help:'message-circle',
    usercheck:'calendar-check', heart:'heart', target:'megaphone', edit:'receipt',
    calendar:'calendar-days', repeat:'layout-list', list:'list', users:'users-round',
    card:'credit-card', user:'user-round', chart:'layout-dashboard', sliders:'settings-2',
    touch:'scan-line', network:'link', play:'video', receipt:'receipt', shield:'circle-check',
    arrival:'user-round', ticket:'ticket', queue:'layout-list', done:'circle-check',
    estimate:'receipt', customer:'user-round', spark:'sparkles', team:'users-round',
    settings:'settings', staff:'users-round', membership:'crown', rewards:'trophy',
    savings:'hand-coins', income:'badge-dollar-sign', expense:'credit-card', percent:'percent',
    sms:'message-circle', design:'paintbrush', document:'receipt', tools:'settings-2'
  };
  var contentFiles = {};
  Object.keys(contentKinds).forEach(function (key) { contentFiles[key] = 'issue-2040-oneqr-' + contentKinds[key] + '-3d.png'; });
  contentFiles.spinwheel = contentFiles.wheel = '../icons/iconscout/prize-wheel-10862879.webp';
  contentFiles['hand-care'] = 'salon-spa-wellness-iconscout-9099883.png';
  contentFiles['nail-polish'] = 'salon-nail-polish-iconscout-10843584.png';
  function contentNode(key, options) {
    if (!contentFiles[key]) return null;
    options = options || {};
    var size = Math.max(16, Math.min(94, Number(options.size) || 32));
    var node = document.createElement('img');
    node.className = 'nexora-content-icon' + (options.className ? ' ' + options.className : '');
    node.src = new URL(contentFiles[key], contentBase).href;
    node.width = node.height = size; node.alt = ''; node.draggable = false;
    node.setAttribute('aria-hidden', 'true'); node.decoding = 'async';
    if (options.lazy) node.loading = 'lazy';
    return node;
  }
  window.NEXORA_ICONS = {files: files, image: function(key, options) {
    options = options || {};
    if (!files[key]) return '';
    var size = Math.max(16, Math.min(94, Number(options.size) || 28));
    return '<img class="nexora-3d-icon ' + escape(options.className || '') + '" src="' + escape(base + files[key]) + '" width="' + size + '" height="' + size + '" alt="" aria-hidden="true" draggable="false">';
  }, contentFiles: contentFiles, contentNode: contentNode, content: function (key, options) {
    var node = contentNode(key, options);
    return node ? node.outerHTML : '';
  }};
})();
