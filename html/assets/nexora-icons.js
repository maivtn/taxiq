/* Local 3D PNGs from Icons8 and the selected IconScout assets. */
(function () {
  'use strict';
  var script = document.currentScript;
  var base = script && script.src ? new URL('icons/3d-fluency/', script.src).href : '../assets/icons/3d-fluency/';
  var files = {
  "home": "home.png",
  "dashboard": "dashboard.png",
  "pos": "../iconscout/pos-project-management-6578282.png",
  "oneqr": "../iconscout/oneqr-14843205.png",
  "community": "../iconscout/community-5487791.png",
  "aihub": "../iconscout/ai-hub-10852467.png",
  "marketing": "../iconscout/ai-marketing-13327169.png",
  "sms": "sms.png",
  "gift": "../iconscout/gift-card-7705322.png",
  "reviews": "reviews.png",
  "analytics": "analytics.png",
  "taxiq": "../iconscout/tax-iq-10411198.png",
  "booking": "booking.png",
  "staff": "staff.png",
  "tickets": "tickets.png",
  "checkout": "checkout.png",
  "settings": "settings.png",
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
  window.NEXORA_ICONS = {files: files, image: function(key, options) {
    options = options || {};
    if (!files[key]) return '';
    var size = Math.max(16, Math.min(94, Number(options.size) || 28));
    return '<img class="nexora-3d-icon ' + escape(options.className || '') + '" src="' + escape(base + files[key]) + '" width="' + size + '" height="' + size + '" alt="" aria-hidden="true" draggable="false">';
  }};
})();
