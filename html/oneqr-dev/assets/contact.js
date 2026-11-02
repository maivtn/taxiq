(() => {
  // Contact actions from OneQR-prototype-v25.html and the existing customer contact component.
  // The phone is the PO demo number, not a verified live business contact.
  const card = { name: 'Bitcoin Nail Bar', phone: '+1 (346) 555-0100', website: 'https://bitcoinnailbar.com/', street: '5444 Westheimer Rd, Suite 1000', city: 'Houston', region: 'Texas' };
  const publicUrl = 'https://test-web.nexoratouch.com/o/bitcoin-nail-bar-3?as=customer';
  const copy = {
    en: {
      contact: 'Contact', actions: 'Business contact actions', call: 'Call', text: 'Text', save: 'Save contact',
      wallet: 'Add to Wallet', directions: 'Directions', share: 'Share card',
      saved: 'vCard downloaded. Open the file to save this contact.',
      walletPreview: 'Wallet preview: Bitcoin Nail Bar. Adding a pass is simulated in this prototype.',
      copied: 'Customer page link copied.', shareFallback: 'Share this page:'
    },
    vi: {
      contact: 'Liên hệ', actions: 'Liên hệ doanh nghiệp', call: 'Gọi', text: 'Nhắn tin', save: 'Lưu liên hệ',
      wallet: 'Thêm vào Ví', directions: 'Chỉ đường', share: 'Chia sẻ thẻ',
      saved: 'Đã tải vCard. Mở file để lưu liên hệ vào danh bạ.',
      walletPreview: 'Xem trước Ví: Bitcoin Nail Bar. Thao tác thêm thẻ được mô phỏng trong bản demo.',
      copied: 'Đã sao chép link trang của tiệm.', shareFallback: 'Chia sẻ trang này:'
    }
  };
  const get = id => document.getElementById(id);
  let language;
  let feedbackKey;

  function feedback(key) {
    feedbackKey = key;
    get('contactFeedback').hidden = !key;
    get('contactFeedback').textContent = key ? copy[language][key] + (key === 'shareFallback' ? ` ${publicUrl}` : '') : '';
  }

  function setLanguage(next) {
    language = next === 'vi' ? 'vi' : 'en';
    document.querySelectorAll('[data-contact-copy]').forEach(element => { element.textContent = copy[language][element.dataset.contactCopy]; });
    document.querySelectorAll('[data-contact-aria]').forEach(element => { element.setAttribute('aria-label', copy[language][element.dataset.contactAria]); });
    feedback(feedbackKey);
  }

  function saveContact() {
    const value = text => text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const content = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${value(card.name)}`, `ORG:${value(card.name)}`, `TEL;TYPE=WORK:${value(card.phone)}`, `URL:${value(card.website)}`, `ADR;TYPE=WORK:;;${value(card.street)};${value(card.city)};${value(card.region)};;`, 'END:VCARD', ''].join('\r\n');
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
  document.addEventListener('oneqr-dev:language-change', event => setLanguage(event.detail));
  setLanguage(document.documentElement.lang);
})();
