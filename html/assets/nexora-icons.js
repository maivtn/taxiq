/* Local Icons8 3D Fluency PNGs. Attribution is rendered by the shared shell. */
(function () {
  'use strict';
  var script = document.currentScript;
  var base = script && script.src ? new URL('icons/3d-fluency/', script.src).href : '../assets/icons/3d-fluency/';
  var files = {
  "home": "home.png",
  "dashboard": "dashboard.png",
  "pos": "pos.png",
  "oneqr": "oneqr.png",
  "community": "community.png",
  "aihub": "aihub.png",
  "marketing": "marketing.png",
  "sms": "sms.png",
  "gift": "gift.png",
  "reviews": "reviews.png",
  "analytics": "analytics.png",
  "taxiq": "taxiq.png",
  "booking": "booking.png",
  "staff": "staff.png",
  "tickets": "tickets.png",
  "checkout": "checkout.png",
  "settings": "settings.png",
  "report": "report.png",
  "rewards": "rewards.png",
  "support": "support.png",
  "news": "news.png",
  "onboarding": "onboarding.png",
  "tools": "tools.png",
  "payments": "payments.png",
  "ai-voice": "ai-voice.png",
  "spinwheel": "spinwheel.png"
};
  function escape(value) { return String(value).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  window.NEXORA_ICONS = {files: files, image: function(key, options) {
    options = options || {};
    if (!files[key]) return '';
    var size = Math.max(16, Math.min(94, Number(options.size) || 28));
    return '<img class="nexora-3d-icon ' + escape(options.className || '') + '" src="' + escape(base + files[key]) + '" width="' + size + '" height="' + size + '" alt="" aria-hidden="true" draggable="false">';
  }};
})();
