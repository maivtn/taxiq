/* ==========================================================================
   Real, scannable QR codes for qr-stations.html — renders the qrcodejs
   library (loaded from a CDN script tag) into every [data-qr-value] element.
   ========================================================================== */
(function () {
  'use strict';

  if (typeof window.QRCode !== 'function') return;

  document.querySelectorAll('[data-qr-value]').forEach(function (container) {
    var value = container.getAttribute('data-qr-value');
    if (!value) return;
    try {
      value = new URL(value, window.location.href).href;
    } catch (error) {
      /* keep the raw value if it cannot be resolved to a URL */
    }
    var size = parseInt(container.getAttribute('data-qr-size'), 10) || 256;
    new window.QRCode(container, {
      text: value,
      width: size,
      height: size,
      colorDark: '#111827',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.M
    });

    if (container.classList.contains('qr-code')) {
      var logoSize = Math.max(16, Math.round(size * 0.18));
      var logoPadding = Math.max(3, Math.round(size * 0.035));
      var logoBadge = document.createElement('span');
      var logoImage = document.createElement('img');
      logoBadge.className = 'qr-logo-mark';
      logoBadge.style.width = logoSize + 'px';
      logoBadge.style.height = logoSize + 'px';
      logoBadge.style.padding = logoPadding + 'px';
      logoImage.className = 'qr-logo-img';
      logoImage.src = 'https://test-web.nexoratouch.com/assets/nexora-logo.png';
      logoImage.alt = 'Nexora';
      logoImage.style.width = '100%';
      logoImage.style.height = '100%';
      logoBadge.appendChild(logoImage);
      container.appendChild(logoBadge);
    }
  });
})();
