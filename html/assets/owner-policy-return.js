(function () {
  'use strict';
  const requested = new URL(location.href).searchParams.get('returnTo');
  if (!requested) return;
  const target = new URL(requested, location.href);
  const profile = new URL('staff-profile.html', location.href);
  if (target.origin !== profile.origin || target.pathname !== profile.pathname) return;
  const back = document.querySelector('.owner-policy nav a');
  if (back) back.href = target.href;
})();
