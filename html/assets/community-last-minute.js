(function () {
  'use strict';

  const settings = document.currentScript.dataset;
  const allowedViews = new Set(settings.communityRole === 'tech' ? ['cust', 'ind'] : ['cust', 'biz']);

  // The account hub provides navigation; this module does not switch personas.
  document.getElementById('tabs').style.display = 'none';
  document.querySelector('.clock').style.display = 'none';
  document.querySelectorAll('main > section[data-v]').forEach(section => {
    if (!allowedViews.has(section.dataset.v)) section.style.display = 'none';
  });

  const originalGo = go;
  go = function (view) {
    return originalGo(allowedViews.has(view) ? view : 'cust');
  };
  go(settings.communityView);
})();
