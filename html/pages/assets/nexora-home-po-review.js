/* Decorative icons for the separate PO review; original navigation stays intact. */
(() => {
  'use strict';
  if (!document.body.classList.contains('po-review')) return;

  const products = {
    'si-pos': 'pos',
    'one-qr': 'qr-code',
    'payments-payouts': 'wallet',
    'ai-hub': 'bot',
    reviews: 'star',
    'gift-card-center': 'gift',
    analytics: 'analytics',
    community: 'users-round',
    'tax-iq': 'receipt',
    'ai-voice-sms': 'phone',
    'ai-marketing': 'megaphone',
    'spin-wheel': 'spin-wheel'
  };
  const specificImages = {
    pos: '../icons/3d-fluency/pos.png',
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
  }

  Object.entries(products).forEach(([product, name]) => {
    decorate(document.querySelector(`.ecosystem-item[href="products/${product}/index.html"] .product-icon`), name);
    decorate(document.querySelector(`.eco-nexora-item[data-product="${product}"] .eco-nexora-icon`), name);
  });
  const journey = ['calendar-check', 'users-round', 'hand-coins', 'heart'];
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
    tokenization: 'badge-dollar-sign', wallet: 'wallet', 'crypto-card': 'credit-card',
    merchant: 'store', charity: 'heart', gift: 'gift', 'merchant-atm': 'hand-coins',
    'mobile-atm': 'phone', exchange: 'hand-coins', gateway: 'link', program: 'package'
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
})();
