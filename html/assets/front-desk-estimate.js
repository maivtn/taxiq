(function () {
  'use strict';
  if (window.NEXORA_FRONT_DESK_REDIRECTING) return;
  const root = document.querySelector('#front-desk-estimate');
  const store = window.NEXORA_APPOINTMENTS_STORE;
  const view = window.NEXORA_POS_ESTIMATE.mount(root, {
    getServices: () => window.NEXORA_SALON_DATA.loadCatalog().services,
    checkIn(payload) {
      const result = store.create({
        id: 'estimate-' + crypto.randomUUID(),
        customerName: payload.customerName, phone: payload.phone,
        tickets: payload.tickets, status: 'checked-in', source: 'front-desk',
        metadata: {estimate: payload.estimate, checkedInAt: Date.now()},
        note: 'Estimated service total: $' + (payload.estimate.totalCents / 100).toFixed(2) +
          '. Discount: ' + payload.estimate.value + (payload.estimate.type === 'percent' ? '%' : ' USD') +
          '. Tax and tip excluded. Confirm discount at checkout.'
      });
      if (result.ok) document.querySelector('#feedback').textContent = payload.customerName + ' checked in with ' + payload.tickets.length + ' services. View the guest in Tickets.';
      return result;
    }
  });
  function renderSection() {
    const params = new URLSearchParams(location.search);
    const section = params.get('section') || params.get('tab');
    const estimate = section === 'estimate';
    root.hidden = !estimate;
    if (estimate) {
      document.querySelector('#appointments').hidden = true;
      document.querySelector('#service-assignments').hidden = true;
      view.refresh();
    }
    if (estimate || section === 'appointments') {
      document.querySelector('#appointments').hidden = estimate;
      document.querySelectorAll('[data-front-section]').forEach(link => {
        const active = link.dataset.frontSection === (estimate ? 'estimate' : 'appointments');
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
      });
    }
  }
  document.querySelectorAll('[data-front-section="estimate"], [data-front-section="appointments"]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const url = new URL(location.href);
    url.searchParams.set('section',link.dataset.frontSection);
    url.searchParams.set('tab',link.dataset.frontSection);
    url.searchParams.delete('ticket');
    history.pushState(null,'',url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }));
  window.addEventListener('popstate',renderSection);
  renderSection();
})();
