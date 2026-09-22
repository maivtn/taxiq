(function () {
  'use strict';
  // Same demo catalog and checkout presentation as AI Hub.
      const SMS_CREDIT_PACKAGES = [
        { id: 'sms-500', credits: 500, price: 12, name: 'SMS Starter', note: 'Phù hợp để thử campaign' },
        { id: 'sms-1500', credits: 1500, price: 29, name: 'SMS Plus', note: 'Cho các campaign định kỳ' },
        { id: 'sms-3000', credits: 3000, price: 49, name: 'SMS Pro', note: 'Mở rộng tệp khách hàng' },
        { id: 'sms-6000', credits: 6000, price: 89, name: 'SMS Business', note: 'Tiết kiệm nhất', featured: true }
      ];

      const VOICE_CREDIT_PACKAGES = [
        { id: 'voice-100', credits: 100, price: 19, name: 'Voice Mini', note: 'Phù hợp để dùng thử' },
        { id: 'voice-300', credits: 300, price: 49, name: 'Voice Starter', note: 'Cho salon quy mô nhỏ' },
        { id: 'voice-500', credits: 500, price: 79, name: 'Voice Plus', note: 'Cho nhu cầu hằng tháng' },
        { id: 'voice-1000', credits: 1000, price: 149, name: 'Voice Pro', note: 'Tiết kiệm nhất', featured: true }
      ];

      const SMS_CREDIT_PAYMENT_METHODS = [
        { id: 'USDV', label: 'USDV', balance: '$79,000.00', asset: 'assets/usdv.png' },
        { id: 'USDT', label: 'USDT', balance: '$79,000.00', asset: 'assets/usdt.png' },
        { id: 'USD', label: 'USD', balance: '$79,000.00', asset: 'assets/usd.png' },
        { id: 'BTC', label: 'BTC', balance: '100,000.25', asset: 'assets/btc.png' },
        { id: 'VND', label: 'VND', balance: '$50,000,000.00', asset: 'assets/vnd.png' },
        { id: 'CARD', label: 'Credit or Debit Card' }
      ];

  const root = document.querySelector('#package-credit-checkout');
  if (!root || !window.NEXORA_CREDITS) return;
  const money = amount => '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const refreshIcons = () => window.lucide?.createIcons();
  for (const kind of ['sms', 'voice']) {
    const modal = root.querySelector(`[data-${kind}-credit-modal]`);
    const catalog = kind === 'sms' ? SMS_CREDIT_PACKAGES : VOICE_CREDIT_PACKAGES;
    const unit = kind === 'sms' ? 'SMS' : 'phút';
    const find = suffix => modal.querySelector(`[data-${kind}-credit-${suffix}]`);
    let selected = catalog.find(item => item.featured) || catalog[0];
    let payment = SMS_CREDIT_PAYMENT_METHODS[0];
    let opener;
    let previousOverflow = '';

    function render() {
      find('package-list').innerHTML = catalog.map(item => `<button class="sms-credit-package${item.id === selected.id ? ' is-selected' : ''}${item.featured ? ' is-featured' : ''}" type="button" data-${kind}-credit-package="${item.id}" aria-pressed="${item.id === selected.id}">
        <span class="sms-credit-package-check" aria-hidden="true">✓</span><span class="sms-credit-package-name">${item.name}</span><span class="sms-credit-package-amount">${item.credits.toLocaleString()} ${unit}</span><span class="sms-credit-package-price">${money(item.price)}</span><span class="sms-credit-package-note">${item.note}</span></button>`).join('');
      find('payment-list').innerHTML = SMS_CREDIT_PAYMENT_METHODS.map(method => `<button class="sms-credit-payment${method.id === payment.id ? ' is-selected' : ''}" type="button" data-${kind}-credit-payment="${method.id}" aria-pressed="${method.id === payment.id}"><span class="sms-credit-payment-main"><span class="sms-credit-radio" aria-hidden="true"></span>${method.id === 'CARD' ? '<i class="marketing-icon sms-credit-card-method-icon" data-lucide="credit-card" aria-hidden="true"></i>' : `<img class="sms-credit-token" src="${method.asset}" alt="" aria-hidden="true">`}<span class="sms-credit-payment-name">${method.label}</span></span>${method.balance ? `<span class="sms-credit-payment-balance"><span>Số dư</span><strong>${method.balance}</strong></span>` : ''}</button>`).join('');
      find('card-form').hidden = payment.id !== 'CARD';
      find('card-error').textContent = '';
      find('invoice-package').textContent = `${selected.credits.toLocaleString()} ${unit}`;
      find('invoice-payment').textContent = payment.label;
      find('invoice-total').textContent = money(selected.price);
      find('checkout-status').textContent = `${selected.credits.toLocaleString()} ${unit}, thanh toán bằng ${payment.label}.`;
      refreshIcons();
    }
    function close() {
      if (modal.hidden) return;
      modal.hidden = true;
      document.body.style.overflow = previousOverflow;
      modal.querySelectorAll('input').forEach(field => { field.value = ''; field.removeAttribute('aria-invalid'); });
      if (opener) opener.focus();
    }
    document.querySelector(`[data-credits-action="${kind}-buy"]`).addEventListener('click', event => {
      opener = event.currentTarget;
      render();
      modal.hidden = false;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      find('close').focus();
    });
    modal.addEventListener('click', event => {
      if (event.target === modal || event.target.closest(`[data-${kind}-credit-close]`)) { close(); return; }
      const packageButton = event.target.closest(`[data-${kind}-credit-package]`);
      if (packageButton) {
        selected = catalog.find(item => item.id === packageButton.getAttribute(`data-${kind}-credit-package`));
        render();
        modal.querySelector(`[data-${kind}-credit-package="${selected.id}"]`).focus();
        return;
      }
      const paymentButton = event.target.closest(`[data-${kind}-credit-payment]`);
      if (paymentButton) {
        payment = SMS_CREDIT_PAYMENT_METHODS.find(item => item.id === paymentButton.getAttribute(`data-${kind}-credit-payment`));
        render();
        modal.querySelector(`[data-${kind}-credit-payment="${payment.id}"]`).focus();
        return;
      }
      if (!event.target.closest(`[data-${kind}-credit-confirm]`) || modal.hidden) return;
      if (payment.id === 'CARD') {
        const required = [...modal.querySelectorAll(`[data-${kind}-credit-card-required]`)];
        required.forEach(field => field.removeAttribute('aria-invalid'));
        const missing = required.find(field => !field.value.trim());
        if (missing) {
          find('card-error').textContent = 'Please complete all required card details.';
          missing.setAttribute('aria-invalid', 'true');
          missing.focus();
          return;
        }
      }
      const credits = window.NEXORA_CREDITS;
      const balance = kind === 'sms' ? credits.addSmsTopupCredits(selected.credits) : credits.addVoiceTopupCredits(selected.credits);
      const record = kind === 'sms' ? credits.recordSmsCreditPurchase : credits.recordVoiceCreditPurchase;
      record({ credits: selected.credits, balance, packageName: selected.name, paymentMethod: payment.label });
      credits.renderCreditsPage();
      close();
    });
    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key === 'Tab') {
        const focusable = [...modal.querySelectorAll('button, input, select')].filter(item => !item.disabled && !item.closest('[hidden]'));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    modal.querySelector(`[data-${kind}-credit-card-field="number"]`).addEventListener('input', event => {
      event.target.value = event.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    });
    modal.querySelector(`[data-${kind}-credit-card-field="expiry"]`).addEventListener('input', event => {
      const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
      event.target.value = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
    });
  }
}());
