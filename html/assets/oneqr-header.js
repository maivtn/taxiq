/* ==========================================================================
   Shared OneQR customer header — renders into any [data-oneqr-header] mount.
   Pair with oneqr-header.css. Runs synchronously so lucide.createIcons()
   (called later by each page) picks up the injected back-arrow icon.

   Usage: <div data-oneqr-header></div>
          <div data-oneqr-header data-back-href="oneqr-landing.html"></div>
   ========================================================================== */
(function () {
  'use strict';

  var BITCOIN_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1280px-Bitcoin.svg.png';

  document.querySelectorAll('[data-oneqr-header]').forEach(function (mount) {
    var backHref = mount.getAttribute('data-back-href');
    var backHtml = backHref
      ? '<a class="oneqr-scan-back" id="oneqrHeaderBack" href="' + backHref + '" aria-label="Back"><i data-lucide="arrow-left" aria-hidden="true"></i></a>'
      : '';

    var header = document.createElement('header');
    header.className = 'oneqr-scan-top';
    header.innerHTML =
      '<div class="oneqr-scan-brand">' +
        '<span class="oneqr-scan-mark"><img src="' + BITCOIN_LOGO_URL + '" alt="Bitcoin Nail Bar logo"></span>' +
        '<span class="oneqr-scan-brand-name"><span class="is-bitcoin">Bitcoin</span> Nail Bar</span>' +
      '</div>' +
      backHtml;

    mount.replaceWith(header);
  });
})();
