/* Tip QR copy and demo behavior from the PO Tip & Payment Methods prototype. */
(function () {
  'use strict';

  var screen = document.querySelector('[data-tip-qr]');
  var dialog = document.getElementById('tip-qr-dialog');
  if (!screen || !dialog) return;

  var copy = {
    vi: {
      tipTitle: 'Tạo mã QR nhận tip',
      tipDescription: 'Tạo một mã QR nhận tip của tiệm. Khách quét mã để chọn thợ và gửi tip.',
      demo: 'BẢN THỬ CHO DEV: số liệu và tài khoản là ví dụ. Không kết nối hệ thống, không tạo mã QR thật và không lưu thay đổi.',
      sample: 'Mã QR minh họa',
      qrText: 'Tạo một mã QR nhận tip cho tiệm; có thể in nhiều bản để khách sử dụng.',
      generateTip: 'Tạo mã QR nhận tip',
      generatedTip: 'Đã tạo mã minh họa. Không dùng để quét hoặc nhận tip thật.',
      viewQR: 'Xem mã QR',
      printQR: 'In mã QR',
      activity: 'Hoạt động của mã QR',
      activityDesc: 'Theo dõi tổng lượt quét của mã QR chính.',
      scans: 'Tổng lượt quét',
      tips: 'Tiền tip đã nhận',
      tipTracking: 'Chỉ hiển thị tiền tip nếu hệ thống xác nhận được giao dịch; không coi lượt bấm tip là tiền đã nhận.',
      howTitle: 'Cách hoạt động',
      step1: 'Xem hoặc in mã QR của tiệm.',
      step2: 'Đặt nhiều bản ở nơi thuận tiện cho khách.',
      step3: 'Khách quét, chọn thợ và gửi tip.',
      sameQR: 'Các bản in cùng mã chỉ cho biết tổng lượt quét, không phân biệt vị trí quét.',
      staffTitle: 'Khách chọn thợ như thế nào?',
      staffHelp: 'Trang tip cần hiển thị danh sách thợ đủ điều kiện để khách chọn đúng người trước khi gửi tip.',
      staffNote: 'Dev kiểm tra luồng chọn thợ và phương thức nhận tip hiện tại.',
      close: 'Đóng',
      qrModal: 'Mã QR minh họa',
      qrModalText: 'Hình QR trong bản thử chỉ để minh họa, không quét, in hay tải xuống để sử dụng thật.',
      generic: 'Đây là bản thử: thao tác này chưa thực hiện trên hệ thống thật.'
    },
    en: {
      tipTitle: 'Create a tip QR code',
      tipDescription: 'Create one tip QR code for your business. Customers scan it to select a technician and send a tip.',
      demo: 'DEV PROTOTYPE: sample data only. No account connection, real QR generation, or saved changes.',
      sample: 'Sample QR code',
      qrText: 'Create one business tip QR; print copies for customers to use.',
      generateTip: 'Generate tip QR',
      generatedTip: 'Sample QR generated. It cannot be scanned or used for real tipping.',
      viewQR: 'View QR code',
      printQR: 'Print QR code',
      activity: 'QR activity',
      activityDesc: 'See total scans of your main QR code.',
      scans: 'Total QR scans',
      tips: 'Tips received',
      tipTracking: 'Show tip amounts only when a transaction can be confirmed; a tip click is not a confirmed payment.',
      howTitle: 'How it works',
      step1: 'View or print your business QR code.',
      step2: 'Place copies in convenient locations.',
      step3: 'Customers scan, choose a technician and send a tip.',
      sameQR: 'Copies of the same QR show total scans only; they cannot identify which location was scanned.',
      staffTitle: 'How do customers select a technician?',
      staffHelp: 'The tip page should show eligible staff so customers can choose the right person before sending a tip.',
      staffNote: 'Dev: verify the existing staff selection and tip payout flow.',
      close: 'Close',
      qrModal: 'Sample QR code',
      qrModalText: 'The QR image in this prototype is illustrative; it cannot be scanned, printed or downloaded for real use.',
      generic: 'This is a prototype; the action has not been performed on the real system.'
    }
  };
  var language = 'en';
  var generated = false;
  var modalMessage = 'qrModalText';
  var generateButton = screen.querySelector('[data-tip-action="generate"]');
  var generatedMessage = screen.querySelector('[data-tip-generated]');

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
    generatedMessage.textContent = generated ? copy[language].generatedTip : '';
    dialog.querySelector('[data-tip-modal-text]').textContent = copy[language][modalMessage];
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
      generated = true;
      screen.querySelector('[data-tip-sample]').hidden = false;
      screen.querySelectorAll('[data-tip-action="view"], [data-tip-action="print"]').forEach(function (control) {
        control.hidden = false;
      });
      generateButton.hidden = true;
      generatedMessage.textContent = copy[language].generatedTip;
      screen.querySelector('[data-tip-action="view"]').focus();
      return;
    }
    modalMessage = action === 'print' ? 'generic' : 'qrModalText';
    dialog.querySelector('[data-tip-modal-text]').textContent = copy[language][modalMessage];
    dialog.showModal();
  });

  dialog.querySelector('[data-tip-close]').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  setLanguage(language);
})();
