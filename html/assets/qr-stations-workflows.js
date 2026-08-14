/* ==========================================================================
   QR Stations secondary workflows: direct payment, referral, and staff invite.
   ========================================================================== */
(function (root, factory) {
  'use strict';

  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (!root) return;
  root.NEXORA_QR_WORKFLOWS = api;
  if (root.document) api.init(root.document, root);
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  var PAYMENT_URL = 'https://staging-web.nexoratouch.com/pay/3d1d5426-4a7d-476b-9a0d-b651b3020327';
  var STAFF_INVITE_URL = 'https://staging-web.nexoratouch.com/invite/public/blnexora?ref=71C25492&source=public_link';

  function normalizeReferralLeg(leg) {
    return leg === 'right' ? 'right' : 'left';
  }

  function buildReferralUrl(leg) {
    return 'https://staging-web.nexoratouch.com/?ref=71C25492&leg=' + normalizeReferralLeg(leg);
  }

  function payoutSlug(method) {
    return String(method || 'payment').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function renderQr(container, value, rootObject) {
    if (!container) return;
    container.replaceChildren();
    container.setAttribute('data-qr-value', value);
    if (!rootObject || typeof rootObject.QRCode !== 'function') return;
    var size = parseInt(container.getAttribute('data-qr-size'), 10) || 232;
    new rootObject.QRCode(container, {
      text: value,
      width: size,
      height: size,
      colorDark: '#111827',
      colorLight: '#ffffff',
      correctLevel: rootObject.QRCode.CorrectLevel.M
    });
  }

  function copyText(text, documentObject, navigatorObject) {
    if (navigatorObject && navigatorObject.clipboard && navigatorObject.clipboard.writeText) {
      return navigatorObject.clipboard.writeText(text);
    }
    var textarea = documentObject.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    documentObject.body.appendChild(textarea);
    textarea.select();
    try { documentObject.execCommand('copy'); } catch (error) { /* clipboard may be unavailable */ }
    textarea.remove();
    return Promise.resolve();
  }

  function flashButton(button, message) {
    if (!button) return;
    var label = button.querySelector('span');
    if (!label) return;
    var original = label.textContent;
    label.textContent = message;
    button.disabled = true;
    setTimeout(function () {
      label.textContent = original;
      button.disabled = false;
    }, 1500);
  }

  function showToast(documentObject, message) {
    var toast = documentObject.querySelector('[data-workflow-toast]');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toast._workflowTimer);
    toast._workflowTimer = setTimeout(function () { toast.hidden = true; }, 2200);
  }

  function qrImageUrl(container) {
    if (!container) return '';
    var canvas = container.querySelector('canvas');
    if (canvas && typeof canvas.toDataURL === 'function') return canvas.toDataURL('image/png');
    var image = container.querySelector('img:not(.qr-logo-img)');
    return image ? image.src : '';
  }

  function downloadQr(container, fileName, documentObject) {
    var imageUrl = qrImageUrl(container);
    if (!imageUrl) return false;
    var link = documentObject.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    documentObject.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  }

  function openModal(modal, opener, documentObject) {
    if (!modal) return;
    modal._workflowOpener = opener || null;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    documentObject.body.style.overflow = 'hidden';
    var closeButton = modal.querySelector('.workflow-dialog-close');
    if (closeButton) closeButton.focus();
  }

  function closeModal(modal, documentObject) {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    if (!documentObject.querySelector('.workflow-dialog-shell:not([hidden])')) documentObject.body.style.overflow = '';
    if (modal._workflowOpener && typeof modal._workflowOpener.focus === 'function') modal._workflowOpener.focus();
    modal._workflowOpener = null;
  }

  function init(documentObject, rootObject) {
    if (!documentObject || documentObject.documentElement.hasAttribute('data-qr-workflows-ready')) return;
    documentObject.documentElement.setAttribute('data-qr-workflows-ready', 'true');

    var navigatorObject = rootObject.navigator || {};
    var paymentModal = documentObject.querySelector('[data-payment-qr-modal]');
    var payoutModal = documentObject.querySelector('[data-payout-modal]');
    var referralQr = documentObject.querySelector('[data-referral-qr]');
    var referralLink = documentObject.querySelector('[data-referral-link]');

    function copyAndConfirm(text, button, successMessage) {
      copyText(text, documentObject, navigatorObject).then(function () {
        flashButton(button, 'Copied!');
        showToast(documentObject, successMessage);
      }, function () {
        showToast(documentObject, 'Copy is unavailable in this browser.');
      });
    }

    function updateReferral(leg) {
      var normalizedLeg = normalizeReferralLeg(leg);
      var url = buildReferralUrl(normalizedLeg);
      if (referralLink) {
        referralLink.href = url;
        referralLink.textContent = url;
      }
      if (referralQr) {
        referralQr.setAttribute('aria-label', 'Referral QR code for the ' + normalizedLeg + ' leg');
        renderQr(referralQr, url, rootObject);
      }
    }

    documentObject.querySelectorAll('input[name="referral-placement"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (radio.checked) updateReferral(radio.value);
      });
    });

    documentObject.addEventListener('click', function (event) {
      var closeControl = event.target.closest('[data-workflow-modal-close]');
      if (closeControl) {
        var modalToClose = closeControl.closest('.workflow-dialog-shell');
        if (modalToClose) {
          closeModal(modalToClose, documentObject);
          return;
        }
      }

      var toggle = event.target.closest('[data-payout-toggle]');
      if (toggle) {
        var enabled = toggle.getAttribute('aria-checked') !== 'true';
        toggle.setAttribute('aria-checked', String(enabled));
        toggle.classList.toggle('is-on', enabled);
        showToast(documentObject, enabled ? 'Payout method enabled.' : 'Payout method disabled.');
        return;
      }

      var payoutControl = event.target.closest('[data-payout-view], [data-payout-edit]');
      if (payoutControl) {
        var row = payoutControl.closest('[data-payout-method]');
        if (!row || !payoutModal) return;
        var method = row.getAttribute('data-payout-method');
        var name = row.getAttribute('data-payout-name');
        var account = row.getAttribute('data-payout-account');
        var icon = row.getAttribute('data-payout-icon');
        var isEdit = payoutControl.hasAttribute('data-payout-edit');
        payoutModal.querySelector('[data-payout-modal-method]').textContent = method;
        payoutModal.querySelector('[data-payout-modal-name]').textContent = name;
        payoutModal.querySelector('[data-payout-modal-account]').textContent = account;
        var iconElement = payoutModal.querySelector('[data-payout-modal-icon]');
        iconElement.className = 'payout-dialog-icon is-' + payoutSlug(method).replace('-wallet', '');
        iconElement.textContent = icon;
        payoutModal.querySelector('[data-payout-modal-close-label]').textContent = isEdit ? 'Save Changes' : 'Close';
        payoutModal.classList.toggle('is-editing', isEdit);
        var payoutQr = payoutModal.querySelector('[data-payout-modal-qr]');
        payoutQr.setAttribute('aria-label', method + ' payment QR code');
        renderQr(payoutQr, PAYMENT_URL + '?method=' + payoutSlug(method), rootObject);
        openModal(payoutModal, payoutControl, documentObject);
        return;
      }

      var actionButton = event.target.closest('[data-workflow-action]');
      if (!actionButton) return;
      var action = actionButton.getAttribute('data-workflow-action');

      if (action === 'view-payment-qr') {
        openModal(paymentModal, actionButton, documentObject);
      } else if (action === 'copy-payment-link') {
        copyAndConfirm(PAYMENT_URL, actionButton, 'Payment link copied.');
      } else if (action === 'download-payment-qr') {
        var paymentQr = documentObject.querySelector('[data-payment-qr]');
        showToast(documentObject, downloadQr(paymentQr, 'nexora-direct-payment-qr.png', documentObject) ? 'Payment QR downloaded.' : 'QR image is not ready yet.');
      } else if (action === 'print-payment-qr') {
        if (paymentModal) paymentModal.classList.add('is-printing-payment-qr');
        rootObject.print();
        if (paymentModal) paymentModal.classList.remove('is-printing-payment-qr');
      } else if (action === 'payment-history') {
        showToast(documentObject, 'No payment history is available in this demo.');
      } else if (action === 'download-referral-qr') {
        var checkedLeg = documentObject.querySelector('input[name="referral-placement"]:checked');
        var leg = normalizeReferralLeg(checkedLeg && checkedLeg.value);
        showToast(documentObject, downloadQr(referralQr, 'nexora-referral-' + leg + '-qr.png', documentObject) ? 'Referral QR downloaded.' : 'QR image is not ready yet.');
      } else if (action === 'copy-referral-link') {
        copyAndConfirm(referralLink ? referralLink.href : buildReferralUrl('left'), actionButton, 'Referral link copied.');
      } else if (action === 'copy-staff-invite') {
        copyAndConfirm(STAFF_INVITE_URL, actionButton, 'Staff invite link copied.');
      } else if (action === 'share-staff-invite') {
        if (navigatorObject.share) {
          navigatorObject.share({ title: 'Join our salon on Nexora', text: 'Use this link to create your staff account.', url: STAFF_INVITE_URL })
            .then(function () { showToast(documentObject, 'Staff invite shared.'); })
            .catch(function () { /* user cancelled the share sheet */ });
        } else {
          copyAndConfirm(STAFF_INVITE_URL, actionButton, 'Sharing is unavailable, so the invite link was copied.');
        }
      }
    });

    documentObject.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      var openModalElement = documentObject.querySelector('.workflow-dialog-shell:not([hidden])');
      if (openModalElement) closeModal(openModalElement, documentObject);
    });
  }

  return {
    PAYMENT_URL: PAYMENT_URL,
    STAFF_INVITE_URL: STAFF_INVITE_URL,
    normalizeReferralLeg: normalizeReferralLeg,
    buildReferralUrl: buildReferralUrl,
    init: init
  };
});
