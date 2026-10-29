/* Tip QR content and controls adapted from the PO Tip & Payment Methods layout. */
(function () {
  'use strict';

  var screen = document.querySelector('[data-tip-qr]');
  if (!screen) return;

  var copy = {
    vi: {
      tipTitle: 'Tạo mã QR nhận tip',
      tipDescription: 'Tạo một mã QR nhận tip của tiệm. Khách quét mã để chọn thợ và gửi tip.',
      qrText: 'Tạo một mã QR nhận tip cho tiệm; có thể in nhiều bản để khách sử dụng.',
      generateTip: 'Tạo mã QR nhận tip',
      viewQR: 'Xem mã QR',
      copyLink: 'Sao chép',
      copied: 'Đã sao chép',
      activity: 'Hoạt động của mã QR',
      activityDesc: 'Theo dõi tổng lượt quét của mã QR chính.',
      scans: 'Tổng lượt quét',
      tips: 'Tiền tip đã nhận',
      howTitle: 'Cách hoạt động',
      step1: 'Xem hoặc in mã QR của tiệm.',
      step2: 'Đặt nhiều bản ở nơi thuận tiện cho khách.',
      step3: 'Khách quét, chọn thợ và gửi tip.',
      sameQR: 'Các bản in cùng mã chỉ cho biết tổng lượt quét, không phân biệt vị trí quét.'
    },
    en: {
      tipTitle: 'Create a tip QR code',
      tipDescription: 'Create one tip QR code for your business. Customers scan it to select a technician and send a tip.',
      qrText: 'Create one business tip QR; print copies for customers to use.',
      generateTip: 'Generate tip QR',
      viewQR: 'View QR to Download',
      copyLink: 'Copy link',
      copied: 'Copied',
      activity: 'QR activity',
      activityDesc: 'See total scans of your main QR code.',
      scans: 'Total QR scans',
      tips: 'Tips received',
      howTitle: 'How it works',
      step1: 'View or print your business QR code.',
      step2: 'Place copies in convenient locations.',
      step3: 'Customers scan, choose a technician and send a tip.',
      sameQR: 'Copies of the same QR show total scans only; they cannot identify which location was scanned.'
    }
  };
  var language = 'en';
  var generateButton = screen.querySelector('[data-tip-action="generate"]');
  var copyButton = screen.querySelector('[data-tip-action="copy"]');
  var copyLabel = copyButton.querySelector('[data-tip-copy="copyLink"]');
  var qrCode = screen.querySelector('[data-tip-code] [data-qr-value]');
  var tipLink = screen.querySelector('[data-tip-link]');
  tipLink.href = new URL(qrCode.getAttribute('data-qr-value'), window.location.href).href;
  tipLink.textContent = tipLink.href;
  var copyTimer;
  var copied = false;

  function copyTipLink() {
    var url = new URL(qrCode.getAttribute('data-qr-value'), window.location.href).href;

    function fallbackCopy() {
      var textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.readOnly = true;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      var success = false;
      try { success = document.execCommand('copy'); } catch (error) { /* clipboard unavailable */ }
      textarea.remove();
      copyButton.focus();
      return success ? Promise.resolve() : Promise.reject();
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(url).catch(fallbackCopy);
    }
    return fallbackCopy();
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage;
    screen.lang = language;
    screen.querySelectorAll('[data-tip-copy]').forEach(function (element) {
      element.textContent = copy[language][element.getAttribute('data-tip-copy')];
    });
    screen.querySelector('[data-tip-code]').setAttribute('aria-label', copy[language].viewQR);
    if (copied) copyLabel.textContent = copy[language].copied;
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
      screen.querySelectorAll('[data-tip-created]').forEach(function (control) {
        control.hidden = false;
      });
      generateButton.hidden = true;
      screen.querySelector('[data-tip-action="view"]').focus();
      return;
    }
    if (action === 'copy') {
      copyTipLink().then(function () {
        copied = true;
        copyLabel.textContent = copy[language].copied;
        copyButton.classList.add('is-copied');
        clearTimeout(copyTimer);
        copyTimer = setTimeout(function () {
          copied = false;
          copyLabel.textContent = copy[language].copyLink;
          copyButton.classList.remove('is-copied');
        }, 1800);
      }, function () {
        screen.querySelector('.tip-qr-open-link').focus();
      });
    }
  });

  setLanguage(language);
})();
