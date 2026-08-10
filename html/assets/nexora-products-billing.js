(function () {
  'use strict';

  function activateTab(tabId) {
    const tabs = [...document.querySelectorAll('[data-products-billing-tab]')];
    const panels = [...document.querySelectorAll('[data-products-billing-panel]')];
    const knownTab = tabs.some((tab) => tab.dataset.productsBillingTab === tabId);
    const nextTab = knownTab ? tabId : 'overview';

    tabs.forEach((tab) => {
      const active = tab.dataset.productsBillingTab === nextTab;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.productsBillingPanel !== nextTab;
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function initProductsBillingTabs() {
    const tabs = [...document.querySelectorAll('[data-products-billing-tab]')];
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activateTab(tab.dataset.productsBillingTab));
      tab.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const currentIndex = tabs.indexOf(tab);
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
        const next = tabs[nextIndex];
        activateTab(next.dataset.productsBillingTab);
        next.focus();
      });
    });

    activateTab('overview');
  }

  window.NEXORA_PRODUCTS_BILLING_SELECT_TAB = activateTab;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductsBillingTabs);
  } else {
    initProductsBillingTabs();
  }
})();
