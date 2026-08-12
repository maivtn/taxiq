(function initBookingOnlineLink(global) {
  'use strict';

  var DEFAULT_BOOKING_PATH = '../customer/booking.html';

  function resolveBookingUrl(pageHref, bookingPath) {
    return new URL(bookingPath || DEFAULT_BOOKING_PATH, pageHref).href;
  }

  function copyTextWithTextarea(text, documentRef) {
    return Promise.resolve().then(function() {
      if (!documentRef || !documentRef.body || typeof documentRef.execCommand !== 'function') {
        throw new Error('Clipboard is unavailable');
      }

      var textarea = documentRef.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute && textarea.setAttribute('readonly', '');
      if (textarea.style) textarea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
      documentRef.body.appendChild(textarea);
      textarea.select();
      var copied = documentRef.execCommand('copy');
      textarea.remove();
      if (!copied) throw new Error('Copy command failed');
    });
  }

  function copyText(text, clipboard, documentRef) {
    if (clipboard && typeof clipboard.writeText === 'function') {
      return Promise.resolve().then(function() {
        return clipboard.writeText(text);
      }).catch(function() {
        return copyTextWithTextarea(text, documentRef);
      });
    }

    return copyTextWithTextarea(text, documentRef);
  }

  function renderBookingQr(container, url, QRCodeCtor) {
    container.replaceChildren();
    if (typeof QRCodeCtor !== 'function') return false;

    new QRCodeCtor(container, {
      text: url,
      width: 224,
      height: 224,
      colorDark: '#0b1220',
      colorLight: '#ffffff',
      correctLevel: QRCodeCtor.CorrectLevel && QRCodeCtor.CorrectLevel.M
    });
    return true;
  }

  function initialize(documentRef, environment) {
    var share = documentRef.querySelector('[data-booking-online-share]');
    if (!share || share.getAttribute('data-booking-online-ready') === 'true') return null;

    var bookingUrl = resolveBookingUrl(
      environment.location.href,
      share.getAttribute('data-booking-path') || DEFAULT_BOOKING_PATH
    );
    var urlNodes = share.querySelectorAll('[data-booking-online-url]');
    Array.prototype.forEach.call(urlNodes, function(node) {
      node.textContent = bookingUrl;
      if (node.tagName === 'A') node.setAttribute('href', bookingUrl);
    });

    var copyButton = share.querySelector('[data-booking-online-copy]');
    var copyStatus = share.querySelector('[data-booking-online-copy-status]');
    var qrButton = share.querySelector('[data-booking-online-qr-open]');
    var qrDialog = share.querySelector('[data-booking-online-qr-dialog]');
    var qrContainer = share.querySelector('[data-booking-online-qr]');
    var qrFallback = share.querySelector('[data-booking-online-qr-fallback]');
    var closeButton = share.querySelector('[data-booking-online-qr-close]');
    var qrRendered = false;

    if (copyButton) {
      copyButton.addEventListener('click', function() {
        copyText(
          bookingUrl,
          environment.navigator && environment.navigator.clipboard,
          documentRef
        ).then(function() {
          if (!copyStatus) return;
          copyStatus.textContent = 'Booking link copied';
          if (typeof environment.setTimeout === 'function') {
            environment.setTimeout(function() { copyStatus.textContent = ''; }, 2400);
          }
        }).catch(function() {
          if (copyStatus) copyStatus.textContent = 'Unable to copy. Select the link instead.';
        });
      });
    }

    if (qrButton && qrDialog && qrContainer) {
      qrButton.addEventListener('click', function() {
        if (!qrRendered) {
          qrRendered = renderBookingQr(qrContainer, bookingUrl, environment.QRCode);
          if (qrFallback) qrFallback.hidden = qrRendered;
        }
        if (typeof qrDialog.showModal === 'function') qrDialog.showModal();
        else qrDialog.setAttribute('open', '');
      });
    }

    if (closeButton && qrDialog) {
      closeButton.addEventListener('click', function() {
        if (typeof qrDialog.close === 'function') qrDialog.close();
        else qrDialog.removeAttribute('open');
      });
    }

    share.setAttribute('data-booking-online-ready', 'true');
    return { url: bookingUrl };
  }

  global.NEXORA_BOOKING_LINK = {
    resolveBookingUrl: resolveBookingUrl,
    copyText: copyText,
    renderBookingQr: renderBookingQr,
    initialize: initialize
  };

  if (global.document) initialize(global.document, global);
})(window);
