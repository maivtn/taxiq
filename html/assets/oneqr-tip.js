/* Tip QR content and controls adapted from the PO Tip & Payment Methods layout. */
(function () {
  'use strict';

  var screen = document.querySelector('[data-tip-qr]');
  var dialog = document.getElementById('tip-qr-dialog');
  if (!screen || !dialog) return;

  var copy = {
    vi: {
      tipTitle: 'Tạo mã QR nhận tip',
      tipDescription: 'Tạo một mã QR nhận tip của tiệm. Khách quét mã để chọn thợ và gửi tip.',
      qrText: 'Tạo một mã QR nhận tip cho tiệm; có thể in nhiều bản để khách sử dụng.',
      generateTip: 'Tạo mã QR nhận tip',
      viewQR: 'Xem mã QR',
      printQR: 'In mã QR',
      activity: 'Hoạt động của mã QR',
      activityDesc: 'Theo dõi tổng lượt quét của mã QR chính.',
      scans: 'Tổng lượt quét',
      tips: 'Tiền tip đã nhận',
      howTitle: 'Cách hoạt động',
      step1: 'Xem hoặc in mã QR của tiệm.',
      step2: 'Đặt nhiều bản ở nơi thuận tiện cho khách.',
      step3: 'Khách quét, chọn thợ và gửi tip.',
      sameQR: 'Các bản in cùng mã chỉ cho biết tổng lượt quét, không phân biệt vị trí quét.',
      close: 'Đóng'
    },
    en: {
      tipTitle: 'Create a tip QR code',
      tipDescription: 'Create one tip QR code for your business. Customers scan it to select a technician and send a tip.',
      qrText: 'Create one business tip QR; print copies for customers to use.',
      generateTip: 'Generate tip QR',
      viewQR: 'View QR code',
      printQR: 'Print QR code',
      activity: 'QR activity',
      activityDesc: 'See total scans of your main QR code.',
      scans: 'Total QR scans',
      tips: 'Tips received',
      howTitle: 'How it works',
      step1: 'View or print your business QR code.',
      step2: 'Place copies in convenient locations.',
      step3: 'Customers scan, choose a technician and send a tip.',
      sameQR: 'Copies of the same QR show total scans only; they cannot identify which location was scanned.',
      close: 'Close'
    }
  };
  var language = 'en';
  var generateButton = screen.querySelector('[data-tip-action="generate"]');

  function setLanguage(nextLanguage) {
    language = nextLanguage;
    screen.lang = language;
    dialog.lang = language;
    [screen, dialog].forEach(function (root) {
      root.querySelectorAll('[data-tip-copy]').forEach(function (element) {
        element.textContent = copy[language][element.getAttribute('data-tip-copy')];
      });
    });
    screen.querySelectorAll('[data-tip-language]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-tip-language') === language));
    });
  }

  screen.addEventListener('click', function (event) {
    var languageButton = event.target.closest('[data-tip-language]');
    if (languageButton) {
      setLanguage(languageButton.getAttribute('data-tip-language'));
      return;
    }
    var button = event.target.closest('[data-tip-action]');
    if (!button) return;
    var action = button.getAttribute('data-tip-action');
    if (action === 'generate') {
      screen.querySelector('[data-tip-code]').hidden = false;
      screen.querySelectorAll('[data-tip-action="view"], [data-tip-action="print"]').forEach(function (control) {
        control.hidden = false;
      });
      generateButton.hidden = true;
      screen.querySelector('[data-tip-action="view"]').focus();
      return;
    }
    dialog.showModal();
    if (action === 'print') printQr();
  });

  function printQr() {
    document.body.classList.add('is-printing-tip-qr');
    try { window.print(); }
    finally { document.body.classList.remove('is-printing-tip-qr'); }
  }

  dialog.querySelector('[data-tip-print]').addEventListener('click', printQr);
  dialog.querySelector('[data-tip-close]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  setLanguage(language);
})();
