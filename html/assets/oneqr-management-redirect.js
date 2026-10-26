(function () {
  'use strict';
  const kind = document.currentScript.dataset.oneqrLegacy;
  const target = new URL('qr-advertising.html', location.href);
  const hash = location.hash.slice(1);
  const earningsViews = new Set(['overview', 'activity', 'reserves', 'payouts', 'settings', 'advertising']);
  target.search = location.search;
  if (kind === 'policy') {
    target.hash = hash.startsWith('policy/') ? hash : hash && hash !== 'policy' ? 'policy/' + hash : 'policy';
  } else if (kind === 'earnings') {
    target.hash = earningsViews.has(hash) ? hash : hash.startsWith('policy') ? hash : 'activity';
  } else {
    target.hash = 'advertising';
  }
  document.querySelector('[data-oneqr-destination]').href = target.href;
  location.replace(target.href);
})();
