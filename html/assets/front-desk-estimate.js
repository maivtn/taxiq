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
      document.querySelector('#front-desk-waitlist').hidden = true;
      view.refresh();
    }
    if (estimate || section === 'appointments') {
      document.querySelector('#appointments').hidden = estimate;
    }
  }
  window.addEventListener('popstate',renderSection);
  renderSection();
})();
