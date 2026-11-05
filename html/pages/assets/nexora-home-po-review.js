/* Shared semantic icons; original navigation and business behavior stay intact. */
(() => {
  'use strict';
  if (!document.body.classList.contains('nexora-icon-upgrade')) return;

  const products = {
    'si-pos': 'pos',
    'one-qr': 'qr-code',
    'payments-payouts': 'payments',
    'ai-hub': 'bot',
    reviews: 'star',
    'gift-card-center': 'gift-card',
    analytics: 'analytics',
    community: 'users-round',
    'tax-iq': 'tax-iq',
    'ai-voice-sms': 'voice-sms',
    'ai-marketing': 'megaphone',
    'spin-wheel': 'spin-wheel'
  };
  const specificImages = {
    pos: '../icons/3d-fluency/pos.png',
    payments: '../icons/3d-fluency/payments.png',
    'gift-card': '../icons/pos-front-desk/gift-card-center.svg',
    'tax-iq': '../icons/3d-fluency/taxiq.png',
    'voice-sms': 'issue-2040-oneqr-phone-3d.png',
    'check-in': '../icons/pos-front-desk/check-in.svg',
    'turn-board': '../icons/pos-front-desk/turn-board.svg',
    'vlinkpay-wallet': 'vlinkpay-wallet-show-wallet.png',
    charity: 'charity-gift-card-payment.png',
    'merchant-atm': 'merchant-atm-icons8-3d.png',
    'mobile-atm': 'mobile-atm-payment-10647002.png',
    'payment-gateway': 'payment-gateway-secure-9506497.png',
    'exchange-hub': 'industry/remit.png',
    'program-hub': 'program-hub-icons8-3d.png',
    analytics: '../icons/3d-fluency/analytics.png',
    'spin-wheel': '../icons/iconscout/prize-wheel-10862879.webp',
    nail: 'salon-nail-polish-iconscout-10843584.png',
    hair: 'salon-hair-barber-iconscout-13377568.png',
    spa: 'salon-spa-wellness-iconscout-9099883.png'
  };
  function decorate(element, name) {
    if (!element || !name || element.dataset.reviewIcon === name) return;
    const file = specificImages[name] || `issue-2040-oneqr-${name}-3d.png`;
    const image = new URL(`../assets/icon-oneqr/${file}`, document.baseURI);
    element.classList.add('review-icon');
    element.dataset.reviewIcon = name;
    element.setAttribute('aria-hidden', 'true');
    element.style.setProperty('--review-icon-image', `url("${image.href}")`);
    if (name === 'voice-sms') {
      const message = new URL('../assets/icon-oneqr/issue-2040-oneqr-message-circle-3d.png', document.baseURI);
      element.style.setProperty('--review-icon-secondary', `url("${message.href}")`);
    } else {
      element.style.removeProperty('--review-icon-secondary');
    }
  }

  const retainedAppIcons = new Set(['one-qr', 'payments-payouts', 'reviews', 'analytics']);
  Object.entries(products).forEach(([product, name]) => {
    decorate(document.querySelector(`.ecosystem-item[href="products/${product}/index.html"] .product-icon`), name);
    decorate(document.querySelector(`.eco-nexora-item[data-product="${product}"] .eco-nexora-icon`), name);
    if (!retainedAppIcons.has(product)) {
      const appIcon = document.querySelector(`.apps-grid a[href="products/${product}/index.html"] > span[aria-hidden="true"]`);
      if (appIcon) appIcon.classList.add('app-product-icon');
      decorate(appIcon, name);
    }
  });
  const journey = ['check-in', 'turn-board', 'hand-coins', 'heart'];
  document.querySelectorAll('.journey-icon').forEach((element, index) => decorate(element, journey[index]));
  const pillars = ['layout-list', 'users-round', 'rocket'];
  document.querySelectorAll('.about-pillar-icon').forEach((element, index) => decorate(element, pillars[index]));
  decorate(document.querySelector('#start-merchant .start-path-icon'), 'store');
  decorate(document.querySelector('#start-individual .start-path-icon'), 'user-round');
  document.querySelectorAll('.contact-detail').forEach(link => {
    const href = link.getAttribute('href') || '';
    const name = href.startsWith('mailto:') ? 'mail' : href.startsWith('sms:') ? 'message-circle' : href.startsWith('tel:') ? 'phone' : 'map-pin';
    decorate(link.querySelector('.contact-detail-icon'), name);
  });
  const nodes = {
    tokenization: 'badge-dollar-sign', wallet: 'vlinkpay-wallet', 'crypto-card': 'credit-card',
    merchant: 'store', charity: 'charity', gift: 'gift', 'merchant-atm': 'merchant-atm',
    'mobile-atm': 'mobile-atm', exchange: 'exchange-hub', gateway: 'payment-gateway', program: 'program-hub'
  };
  Object.entries(nodes).forEach(([node, name]) => decorate(document.querySelector(`.eco-node[data-id="${node}"] .eco-node-icon`), name));

  const heroLink = document.querySelector('.hero-buttons a');
  function decorateHero() {
    const product = heroLink?.getAttribute('href')?.match(/^products\/([^/]+)\/index\.html/)?.[1];
    decorate(document.getElementById('hero-poster-icon'), products[product]);
  }
  decorateHero();
  if (heroLink) new MutationObserver(decorateHero).observe(heroLink, { attributes: true, attributeFilter: ['href'] });

  const tabs = document.getElementById('industry-tabs');
  const industries = ['nail', 'hair', 'spa', 'utensils', 'briefcase'];
  function decorateIndustries() {
    tabs?.querySelectorAll('button').forEach((button, index) => {
      if (button.querySelector('.review-industry-icon')) return;
      const text = button.textContent;
      const separator = text.indexOf('  ');
      if (separator < 0) return;
      const icon = document.createElement('span');
      icon.className = 'review-industry-icon';
      icon.textContent = text.slice(0, separator);
      decorate(icon, industries[index]);
      button.replaceChildren(icon, document.createTextNode(text.slice(separator)));
    });
  }
  decorateIndustries();
  if (tabs) new MutationObserver(decorateIndustries).observe(tabs, { childList: true });

  // Attribution required by the reused Icons8 3D Fluency asset collection.
  const footer = document.querySelector('.footer-legal');
  if (footer && !footer.querySelector('[data-icon-credit]')) {
    const credit = document.createElement('a');
    credit.href = 'https://icons8.com/';
    credit.textContent = 'Icons8';
    credit.dataset.iconCredit = '';
    credit.target = '_blank';
    credit.rel = 'noopener noreferrer';
    footer.append(credit);
  }
})();
