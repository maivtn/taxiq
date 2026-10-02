(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var role = params.get('role') === 'tech' ? 'tech' : 'owner';
  var learning = document.getElementById('panel-learning');

  function setRole(nextRole) {
    role = nextRole === 'tech' ? 'tech' : 'owner';
    learning.querySelector('.community-eyebrow').textContent = role === 'tech' ? 'Nexora · Career development' : 'Nexora · Salon growth';
    learning.querySelector('.community-panel-head h2').textContent = 'Học tập';
    learning.querySelector('.community-panel-head p').textContent = role === 'tech'
      ? 'Học kỹ năng mới, chăm sóc khách hàng và phát triển nghề nghiệp.'
      : 'Nâng cao vận hành, marketing và phát triển đội ngũ của tiệm.';
    learning.querySelector('.learning-hero span').textContent = role === 'tech' ? 'Recommended for you' : 'Recommended for your salon';
    document.querySelector('#panel-events .community-eyebrow').textContent = 'Nexora · Community calendar';
    document.querySelector('#panel-events .community-panel-head h2').textContent = 'Sự kiện';
  }

  function show(view) {
    window.activateCommunityTab(view === 'events' ? 'events' : 'learning');
  }

  window.addEventListener('message', function (event) {
    if (event.source !== window.parent || event.origin !== window.location.origin) return;
    var data = event.data || {};
    if (data.cmd === 'view') show(data.v);
    if (data.cmd === 'role') setRole(data.role);
  });
  setRole(role);
  show(params.get('view'));
})();
