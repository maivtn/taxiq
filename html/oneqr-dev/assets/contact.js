(() => {
  // Contact actions from OneQR-prototype-v25.html and the existing customer contact component.
  // The phone is the PO demo number, not a verified live business contact.
  const card = { name: 'Bitcoin Nail Bar', phone: '+1 (346) 555-0100', website: 'https://bitcoinnailbar.com/' };
  const publicUrl = 'https://test-web.nexoratouch.com/o/bitcoin-nail-bar-3?as=customer';
  const copy = {
    en: {
      contact: 'Contact', actions: 'Business contact actions', call: 'Call', text: 'Text', save: 'Save contact',
      wallet: 'Add to Wallet', directions: 'Directions', exchange: 'Send yours', share: 'Share card',
      exchangeTitle: 'Send your contact', name: 'Your name', phone: 'Phone', email: 'Email (optional)',
      consent: 'I agree to receive SMS from this business. Reply STOP to opt out. You can send your contact without agreeing.',
      close: 'Close', cancel: 'Cancel', send: 'Send my contact', required: 'Enter your name and a phone number.',
      saved: 'vCard downloaded. Open the file to save this contact.',
      walletPreview: 'Wallet preview: Bitcoin Nail Bar. Adding a pass is simulated in this prototype.',
      copied: 'Customer page link copied.', shareFallback: 'Share this page:', sent: 'Contact sent (demo).'
    },
    vi: {
      contact: 'Liên hệ', actions: 'Liên hệ doanh nghiệp', call: 'Gọi', text: 'Nhắn tin', save: 'Lưu liên hệ',
      wallet: 'Thêm vào Ví', directions: 'Chỉ đường', exchange: 'Gửi lại', share: 'Chia sẻ thẻ',
      exchangeTitle: 'Gửi liên hệ của bạn', name: 'Tên bạn', phone: 'Điện thoại', email: 'Email (không bắt buộc)',
      consent: 'Tôi đồng ý nhận tin nhắn từ doanh nghiệp này. Nhắn STOP để ngưng. Không tick vẫn gửi được liên hệ.',
      close: 'Đóng', cancel: 'Bỏ qua', send: 'Gửi liên hệ', required: 'Nhập tên và số điện thoại giúp em.',
      saved: 'Đã tải vCard. Mở file để lưu liên hệ vào danh bạ.',
      walletPreview: 'Xem trước Ví: Bitcoin Nail Bar. Thao tác thêm thẻ được mô phỏng trong bản demo.',
      copied: 'Đã sao chép link trang của tiệm.', shareFallback: 'Chia sẻ trang này:', sent: 'Đã gửi lại liên hệ (demo).'
    }
  };
  const get = id => document.getElementById(id);
  const dialog = get('contactExchange');
  const form = get('contactExchangeForm');
  const requests = [];
  let language;
  let feedbackKey;
  let errorKey;

  function feedback(key) {
    feedbackKey = key;
    get('contactFeedback').hidden = !key;
    get('contactFeedback').textContent = key ? copy[language][key] + (key === 'shareFallback' ? ` ${publicUrl}` : '') : '';
  }

  function setLanguage(next) {
    language = next === 'vi' ? 'vi' : 'en';
    document.querySelectorAll('[data-contact-copy]').forEach(element => { element.textContent = copy[language][element.dataset.contactCopy]; });
    document.querySelectorAll('[data-contact-aria]').forEach(element => { element.setAttribute('aria-label', copy[language][element.dataset.contactAria]); });
    get('contactExchangeError').textContent = errorKey ? copy[language][errorKey] : '';
    feedback(feedbackKey);
  }

  function saveContact() {
    const value = text => text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const content = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${value(card.name)}`, `ORG:${value(card.name)}`, `TEL;TYPE=WORK:${value(card.phone)}`, `URL:${value(card.website)}`, 'END:VCARD', ''].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/vcard;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bitcoin-nail-bar.vcf';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    feedback('saved');
  }

  get('contactSection').addEventListener('click', async event => {
    const button = event.target.closest('[data-contact-action]');
    if (!button) return;
    const action = button.dataset.contactAction;
    if (action === 'save') saveContact();
    if (action === 'wallet') feedback('walletPreview');
    if (action === 'exchange') {
      form.reset();
      errorKey = null;
      get('contactExchangeError').hidden = true;
      feedback(null);
      dialog.showModal();
    }
    if (action === 'share') {
      try {
        if (navigator.share) await navigator.share({ title: card.name, url: publicUrl });
        else {
          await navigator.clipboard.writeText(publicUrl);
          feedback('copied');
        }
      } catch (error) {
        if (error.name !== 'AbortError') feedback('shareFallback');
      }
    }
  });
  document.querySelectorAll('[data-close-contact]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  form.addEventListener('input', () => {
    errorKey = null;
    get('contactExchangeError').hidden = true;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const digits = phone.replace(/\D/g, '');
    if (!name || digits.length < 7 || digits.length > 15) {
      errorKey = 'required';
      get('contactExchangeError').textContent = copy[language][errorKey];
      get('contactExchangeError').hidden = false;
      get(!name ? 'contactName' : 'contactPhone').focus();
      return;
    }
    if (!form.reportValidity()) return;
    // PO demo exchange: memory only; no contact or SMS is sent to a server.
    requests.push({ name, phone, email: form.elements.email.value.trim(), smsConsent: form.elements.consent.checked });
    form.reset();
    dialog.close();
    feedback('sent');
  });
  document.addEventListener('oneqr-dev:language-change', event => setLanguage(event.detail));
  setLanguage(document.documentElement.lang);
})();
