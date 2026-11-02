(() => {
  const sections = [...document.querySelectorAll('.promotion-half')];
  if (sections.length !== 2) return;
  const { ownOffers, offers } = window.OneQrDealCatalog;
  const { image, line } = window.OneQrIcons;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const copy = {
    vi: {
      own: 'CỦA BITCOIN NAIL BAR', nearby: 'GẦN TIỆM', view: 'Xem', viewDetails: 'Xem chi tiết ưu đãi',
      promotion: 'Ưu đãi', close: 'Đóng', booking: 'Cần đặt lịch', viewBooking: 'Đặt lịch để dùng ưu đãi này',
      directions: 'Chỉ đường', applies: 'Áp dụng:', service: 'Dịch vụ:', coupon: 'COUPON · còn {left}/{quantity}',
      ownDays: 'T3–T5 · 10AM–3PM', pedicureDays: 'T2–T7 · 10AM–7PM',
      bookingHint: 'Phải đặt lịch trước để dùng ưu đãi này', newOnly: 'Chỉ khách mới — hệ thống kiểm tra bằng SĐT'
    },
    en: {
      own: 'FROM BITCOIN NAIL BAR', nearby: 'NEARBY', view: 'View', viewDetails: 'View offer details',
      promotion: 'Promotion', close: 'Close', booking: 'Booking required', viewBooking: 'Book to use this offer',
      directions: 'Directions', applies: 'Available:', service: 'Service:', coupon: 'COUPON · {left}/{quantity} left',
      ownDays: 'Tue–Thu · 10AM–3PM', pedicureDays: 'Mon–Sat · 10AM–7PM',
      bookingHint: 'Booking is required to use this offer', newOnly: 'New customers only — verified by phone number'
    }
  };
  const own = ['own2', 'own1'].map(id => ownOffers.find(offer => offer.id === id));
  const partner = ['f3', 'f2', 'f4'].map(id => offers.find(offer => offer.id === id));
  const bookingUrl = 'https://test-web.nexoratouch.com/booking/bitcoin-nail-bar-3?oneQrAs=customer&oneQrReturnTo=%2Fo%2Fbitcoin-nail-bar-3%3Fas%3Dcustomer';
  let language = document.documentElement.lang === 'vi' ? 'vi' : 'en';
  const text = value => Array.isArray(value) ? value[language === 'vi' ? 0 : 1] : value;
  const t = key => copy[language][key];
  const discount = offer => offer.id === 'own2' ? '−20%' : offer.value;
  const title = offer => offer.id === 'own1' ? (language === 'vi' ? 'Nâng cấp trải nghiệm pedicure' : 'Upgrade your pedicure experience') : text(offer.title);
  const distances = { f3: '1.0', f2: '0.4', f4: '0.7' };
  const selectedDialogs = new Map();
  const controllers = [];

  function renderDialog(dialog, offer) {
    dialog.lang = language;
    const headingId = dialog.id === 'ownPromotionDialog' ? 'ownPromotionDetailTitle' : 'partnerPromotionDetailTitle';
    const ownOffer = Boolean(offer.own);
    const notes = [];
    if (ownOffer) notes.push(`${image('calendar')} ${t('applies')} <strong>${offer.id === 'own2' ? t('ownDays') : t('pedicureDays')}</strong>`);
    if (offer.rule === 'booking') notes.push(`${image('calendar')} <strong>${t('bookingHint')}</strong>`);
    if (offer.id === 'own2') notes.push(`${image('customer')} ${t('newOnly')}`);
    if (ownOffer) notes.push(`${image('nail')} ${t('service')} <strong>${offer.id === 'own2' ? 'Gel-X' : 'Pedicure'}</strong>`);
    notes.push(`${image('note')} ${escape(text(offer.condition))}`);
    if (offer.rule === 'time') notes.push(`${image('clock')} ${escape(text(offer.ruleText))}`);
    const coupon = offer.quantity ? `<span>${image('coupon')} ${t('coupon').replace('{left}', offer.left).replace('{quantity}', offer.quantity)}</span>` : '';
    const destination = `https://www.google.com/maps/dir/?api=1&destination=${offer.latitude},${offer.longitude}`;
    dialog.innerHTML = `<div class="promotion-detail-header">
      <div class="promotion-detail-value" style="background:${offer.color}"><span>${escape(discount(offer))}</span><small>${escape(text(offer.valueLabel))}</small></div>
      <div><h2 id="${headingId}">${escape(text(offer.title))}</h2><p class="promotion-detail-meta">${escape(offer.business)}${ownOffer ? '' : ` · ${distances[offer.id]} mi`}</p><p class="promotion-carousel-meta">${escape(text(offer.condition))}</p></div>
    </div>${coupon ? `<div class="promotion-carousel-badges">${coupon}</div>` : ''}
    <div class="promotion-detail-conditions">${notes.map(note => `<p>${note}</p>`).join('')}</div>
    <a class="promotion-detail-action" href="${escape(ownOffer ? bookingUrl : destination)}"${ownOffer ? '' : ' target="_blank" rel="noopener noreferrer"'}>${line(ownOffer ? 'calendar-check' : 'navigation')} ${ownOffer ? t('viewBooking') : t('directions') + ` · ${distances[offer.id]} mi`}</a>
    <button class="promotion-close" type="button" data-close-promotion>${t('close')}</button>`;
  }

  function openDialog(id, offer) {
    const dialog = document.getElementById(id);
    if (dialog.open) return;
    selectedDialogs.set(dialog, offer);
    renderDialog(dialog, offer);
    controllers.forEach(controller => controller.pauses.add('dialog'));
    dialog.showModal();
  }

  // PO splitStart uses independent 5s shop and 4s partner loops.
  function createCarousel(element, slides, duration, kind) {
    const headingId = kind === 'own' ? 'ownPromotionTitle' : 'partnerPromotionTitle';
    const dialogId = kind === 'own' ? 'ownPromotionDialog' : 'partnerPromotionDialog';
    element.innerHTML = `<button class="promotion-trigger" type="button" aria-haspopup="dialog" aria-controls="${dialogId}"></button><div class="promotion-progress" role="tablist"></div><p class="sr-only" role="status" aria-live="polite"></p>`;
    const trigger = element.querySelector('.promotion-trigger');
    const progress = element.querySelector('.promotion-progress');
    progress.innerHTML = slides.map((offer, index) => `<button class="promotion-progress-button" type="button" role="tab" data-promotion-index="${index}"><span class="promotion-progress-track"><span class="promotion-progress-fill"></span></span></button>`).join('');
    const tabs = [...progress.children];
    const controller = { index: 0, elapsed: 0, pauses: new Set(), duration, animation: null, gesture: null, clickOffer: null, suppressUntil: 0 };
    function render(animate = false, announce = false) {
      const offer = slides[controller.index];
      element.lang = language;
      element.dataset.offerId = offer.id;
      element.style.background = kind === 'own' ? (offer.id === 'own1' ? 'linear-gradient(135deg,#4c1d95,#7c3aed 60%,#c4b5fd)' : 'linear-gradient(135deg,#9d174d,#db2777 60%,#f9a8d4)') : `linear-gradient(135deg,${offer.color},${offer.color}cc 60%,#ffffff55)`;
      trigger.setAttribute('aria-label', `${t('viewDetails')}: ${title(offer)}`);
      const condition = kind === 'own' ? `<span class="promotion-condition">${image(offer.rule === 'booking' ? 'calendar' : 'nail')} ${escape(offer.rule === 'booking' ? t('booking') : text(offer.condition))}</span>` : '';
      trigger.innerHTML = `${kind === 'own' ? '' : `<span class="promotion-kind">${image('partner')} ${t('nearby')}</span>`}<span class="promotion-kicker">${kind === 'own' ? t('own') : `${escape(offer.business.toUpperCase())} · ${distances[offer.id]} MI`}</span><span class="promotion-title" id="${headingId}">${escape(title(offer))}</span>${condition}<span class="promotion-actions"><span class="promotion-view">${t('view')} ${line('arrow-right')}</span><span class="promotion-discount">${escape(discount(offer))}</span></span>`;
      progress.setAttribute('aria-label', kind === 'own' ? t('own') : t('nearby'));
      tabs.forEach((tab, index) => {
        tab.setAttribute('aria-label', `${t('promotion')} ${index + 1} / ${slides.length}`);
        tab.setAttribute('aria-selected', String(index === controller.index));
        tab.tabIndex = index === controller.index ? 0 : -1;
        tab.querySelector('.promotion-progress-fill').style.transform = `scaleX(${index < controller.index ? 1 : index === controller.index ? controller.elapsed / duration : 0})`;
      });
      if (announce) element.querySelector('[role="status"]').textContent = `${title(offer)} · ${controller.index + 1}/${slides.length}`;
      controller.animation?.cancel();
      if (animate && !reducedMotion.matches && trigger.animate) controller.animation = trigger.animate([{ opacity: .15, transform: 'translateX(8px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 250, easing: 'ease-out' });
    }
    function go(index, manual = false) {
      controller.index = (index + slides.length) % slides.length;
      controller.elapsed = 0;
      controller.clickOffer = null;
      render(true, manual);
    }
    controller.render = render;
    controller.tick = delta => {
      if (controller.pauses.size || reducedMotion.matches) return;
      controller.elapsed += delta;
      if (controller.elapsed >= duration) go(controller.index + 1);
      else tabs[controller.index].querySelector('.promotion-progress-fill').style.transform = `scaleX(${controller.elapsed / duration})`;
    };
    element.addEventListener('click', event => {
      if (performance.now() < controller.suppressUntil) { event.preventDefault(); return; }
      const tab = event.target.closest('[data-promotion-index]');
      if (tab) { go(Number(tab.dataset.promotionIndex), true); return; }
      if (event.target.closest('.promotion-trigger')) {
        const offer = controller.clickOffer || slides[controller.index];
        controller.clickOffer = null;
        openDialog(dialogId, offer);
      }
    });
    element.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : controller.index + (event.key === 'ArrowLeft' ? -1 : 1);
      go(next, true);
      if (event.target.closest('[role="tab"]')) tabs[controller.index].focus();
    });
    element.addEventListener('focusin', event => { if (event.target.matches(':focus-visible')) controller.pauses.add('focus'); });
    element.addEventListener('focusout', event => { if (!element.contains(event.relatedTarget)) controller.pauses.delete('focus'); });
    element.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('[role="tab"]')) return;
      controller.gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, offer: slides[controller.index] };
      controller.pauses.add('gesture');
    });
    window.addEventListener('pointerup', event => {
      const gesture = controller.gesture;
      if (!gesture || gesture.id !== event.pointerId) return;
      controller.gesture = null;
      const dx = event.clientX - gesture.x;
      if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(event.clientY - gesture.y)) {
        go(controller.index + (dx < 0 ? 1 : -1), true);
        controller.suppressUntil = performance.now() + 350;
      } else controller.clickOffer = gesture.offer;
      controller.pauses.delete('gesture');
    });
    window.addEventListener('pointercancel', () => { controller.gesture = null; controller.clickOffer = null; controller.pauses.delete('gesture'); });
    render();
    return controller;
  }

  controllers.push(createCarousel(sections[0], own, 5000, 'own'), createCarousel(sections[1], partner, 4000, 'partner'));
  document.querySelectorAll('.promotion-dialog').forEach(dialog => {
    dialog.addEventListener('click', event => { if (event.target.closest('[data-close-promotion]')) dialog.close(); });
    dialog.addEventListener('close', () => {
      selectedDialogs.delete(dialog);
      if (!document.querySelector('.promotion-dialog[open]')) controllers.forEach(controller => controller.pauses.delete('dialog'));
    });
  });
  document.addEventListener('oneqr-dev:language-change', event => {
    language = event.detail === 'vi' ? 'vi' : 'en';
    controllers.forEach(controller => controller.render());
    selectedDialogs.forEach((offer, dialog) => renderDialog(dialog, offer));
  });
  let frame;
  let previous;
  function tick(now) {
    const delta = previous === undefined ? 0 : Math.min(now - previous, 200);
    previous = now;
    controllers.forEach(controller => controller.tick(delta));
    frame = requestAnimationFrame(tick);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = undefined;
    previous = undefined;
    controllers.forEach(controller => { controller.gesture = null; controller.clickOffer = null; controller.pauses.delete('gesture'); });
  }
  function start() { stop(); if (!document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(tick); }
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener('change', start);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', start);
  start();
})();
