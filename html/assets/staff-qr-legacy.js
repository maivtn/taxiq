/* Preserve bookmarked Staff QR entry points after moving the tools into One QR. */
(function () {
  'use strict';
  function redirect() {
    const url = new URL(location.href);
    const previous = url.searchParams.get('tab');
    const tab = location.hash === '#staff-my-qr-screen' || previous === 'my-qr' ? 'tip-qr' : previous === 'payout-methods' ? 'accept-payment' : '';
    if (tab) location.replace('oneqr-personal.html?account=staff&tab=' + tab);
  }
  redirect(); window.addEventListener('hashchange', redirect);
})();
