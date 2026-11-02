(() => {
  // Contact actions from OneQR-prototype-v25.html and the existing customer contact component.
  // The phone is the PO demo number, not a verified live business contact.
  const card = { name: 'Bitcoin Nail Bar', phone: '+1 (346) 555-0100', website: 'https://bitcoinnailbar.com/', street: '5444 Westheimer Rd, Suite 1000', city: 'Houston', region: 'Texas' };
  // Mary is the requested manager example; Kim and Chloe come from the PO team demo.
  // Every contact inherits the same shop details; only the name and title vary.
  // Demo portraits reuse Unsplash images from the customer prototype; these are not actual staff photos.
  // Mary: photo-1494790108377-be9c29b29330; Kim: photo-1487412947147-5cebf100ffc2.
  const contactGroups = [
    { key: 'shop', people: [{ id: 'shop', name: card.name, title: 'shopTitle', avatar: 'assets/avatars/bitcoin-nail-bar-logo.png' }] },
    { key: 'manager', people: [{ id: 'mary-nguyen', name: 'Mary Nguyen', title: 'manager', avatar: 'assets/avatars/mary-demo.jpg' }] },
    { key: 'tech', people: [
      { id: 'kim-nguyen', name: 'Kim Nguyen', title: 'tech', avatar: 'assets/avatars/kim-demo.jpg' },
      { id: 'chloe', name: 'Chloe', title: 'tech', avatar: '' }
    ] }
  ];
  const publicUrl = 'https://test-web.nexoratouch.com/o/bitcoin-nail-bar-3?as=customer';
  const copy = {
    en: {
      contact: 'Contact', actions: 'Business contact actions', call: 'Call', text: 'Text', save: 'Save contact',
      shop: 'Shop', shopTitle: 'Nail salon · Houston', manager: 'Manager', tech: 'Technician',
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
      shop: 'Tiệm', shopTitle: 'Tiệm nail · Houston', manager: 'Quản lý', tech: 'Thợ',
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
  const contactMenu = get('contactSection');
  const dialog = get('contactExchange');
  const form = get('contactExchangeForm');
  const picker = get('contactPicker');
  const pickerForm = get('contactPickerForm');
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
    renderContactPicker();
    feedback(feedbackKey);
  }

  function renderContactPicker(selectedId = pickerForm.elements.namedItem('contact')?.value || 'shop') {
    get('contactPickerGroups').replaceChildren(...contactGroups.map(group => {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'contact-picker-group';
      const legend = document.createElement('legend');
      legend.textContent = copy[language][group.key];
      fieldset.append(legend);
      group.people.forEach(person => {
        const option = document.createElement('label');
        option.className = 'contact-picker-option';
        const avatar = document.createElement('span');
        avatar.className = 'contact-picker-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        avatar.textContent = Array.from(person.name.trim())[0]?.toUpperCase() || '';
        if (person.avatar) {
          const photo = document.createElement('img');
          photo.alt = '';
          photo.addEventListener('error', () => photo.remove(), { once: true });
          photo.src = person.avatar;
          avatar.append(photo);
        }
        const identity = document.createElement('span');
        identity.className = 'contact-picker-identity';
        const name = document.createElement('strong');
        name.textContent = person.name;
        const title = document.createElement('small');
        title.textContent = copy[language][person.title];
        identity.append(name, title);
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'contact';
        input.value = person.id;
        input.checked = person.id === selectedId;
        option.append(avatar, identity, input);
        fieldset.append(option);
      });
      return fieldset;
    }));
  }

  function saveContact(person) {
    const value = text => text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const content = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${value(person.name)}`, `TITLE:${value(copy[language][person.title])}`, `ORG:${value(card.name)}`, `TEL;TYPE=WORK:${value(card.phone)}`, `URL:${value(card.website)}`, `ADR;TYPE=WORK:;;${value(card.street)};${value(card.city)};${value(card.region)};;`, 'END:VCARD', ''].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/vcard;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = person.id === 'shop' ? 'bitcoin-nail-bar.vcf' : `bitcoin-nail-bar-${person.id}.vcf`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    feedback('saved');
  }

  get('contactMenuTrigger').addEventListener('click', () => {
    feedback(null);
    contactMenu.showModal();
  });
  contactMenu.addEventListener('click', async event => {
    const button = event.target.closest('[data-contact-action]');
    if (!button) return;
    const action = button.dataset.contactAction;
    if (action === 'save') {
      feedback(null);
      renderContactPicker('shop');
      picker.showModal();
    }
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
  get('contactPickerPhone').textContent = card.phone;
  get('contactPickerPhone').href = `tel:${card.phone.replace(/[^\d+]/g, '')}`;
  get('contactPickerWebsite').textContent = card.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
  get('contactPickerWebsite').href = card.website;
  get('contactPickerAddress').textContent = `${card.street}, ${card.city}, ${card.region}`;
  pickerForm.addEventListener('submit', event => {
    event.preventDefault();
    const person = contactGroups.flatMap(group => group.people).find(item => item.id === pickerForm.elements.namedItem('contact').value);
    if (!person) return;
    saveContact(person);
    picker.close();
  });
  document.querySelectorAll('[data-close-contact-picker]').forEach(button => button.addEventListener('click', () => picker.close()));
  document.querySelectorAll('[data-close-contact]').forEach(button => button.addEventListener('click', () => dialog.close()));
  document.querySelectorAll('[data-close-contact-menu]').forEach(button => button.addEventListener('click', () => contactMenu.close()));
  [contactMenu, dialog, picker].forEach(modal => modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const bounds = modal.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) modal.close();
  }));
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
