/* The PO's eight-segment demo. It does not change campaign inventory or drafts. */
(function () {
  'use strict';
  var base = new URL('.', document.currentScript.src);
  var dialog, disc, result, spin, opener, timer, rotation = 0, busy = false;
  var prizes = [
    ['10% off', 'percent'], ['$5 reward', 'ticket'], ['Hand care', 'hand-coins'], ['5% off', 'percent'],
    ['Small gift', 'gift'], ['Nail polish', 'paintbrush'], ['Next-visit offer', 'calendar-days'], ['Good luck', 'sparkles']
  ];
  function icon(kind) {
    var img = document.createElement('img');
    img.src = new URL('icon-oneqr/issue-2040-oneqr-' + kind + '-3d.png', base).href;
    img.alt = ''; img.setAttribute('aria-hidden', 'true');
    return img;
  }
  function draw() {
    disc.replaceChildren();
    prizes.forEach(function (prize, index) {
      var label = document.createElement('span'), angle = index * 45 + 22.5;
      label.className = 'wheel-label';
      label.style.transform = 'translate(-50%, -50%) rotate(' + angle + 'deg) translateY(calc(var(--wheel-radius) * -1)) rotate(' + -angle + 'deg)';
      var image = document.createElement('span'); image.className = 'wheel-label-icon'; image.append(icon(prize[1]));
      var text = document.createElement('span'); text.className = 'wheel-label-text'; text.textContent = prize[0];
      label.append(image, text); disc.append(label);
    });
    disc.setAttribute('aria-label', 'Digital sample wheel with eight segments: ' + prizes.map(function (p) { return p[0]; }).join(', '));
  }
  function finish() {
    busy = false; spin.disabled = false;
    dialog.querySelectorAll('.wheel-prize-field input').forEach(function (input) { input.disabled = false; });
  }
  function create() {
    dialog = document.createElement('dialog'); dialog.className = 'wheel-dialog'; dialog.setAttribute('aria-labelledby', 'wheel-demo-title');
    dialog.innerHTML = '<div class="wheel-dialog-head"><div><h2 id="wheel-demo-title">Spin Wheel · preview</h2><p>Try the wheel, then open the campaign draft tool in NEXORA.</p></div><button class="wheel-close" type="button" aria-label="Close prize wheel">×</button></div>' +
      '<div class="wheel-demo-body"><div class="wheel-config"><label>Campaign name<input id="wheel-campaign-name" type="text" maxlength="45" value="Spin today, see you next time"></label><div class="wheel-prize-head"><strong>Eight sample prize segments</strong><small>Rename prizes to see them on the wheel</small></div><div class="wheel-prize-grid"></div><div class="wheel-explainer"><strong>Create a draft in NEXORA</strong><p>Choose the segment count; set each prize name, quantity and probability. Then set dates, spins and entry conditions in the campaign tool. These icons illustrate prize images chosen by the salon. Each of the eight segments has an equal chance in this preview.</p></div></div>' +
      '<div class="wheel-preview"><small>ON-SCREEN EXPERIENCE · PREVIEW</small><h3 id="wheel-preview-name">Spin today, see you next time</h3><div class="wheel-frame"><span class="wheel-pointer" aria-hidden="true"></span><div class="wheel-disc" role="img"></div></div><p class="wheel-result" role="status" aria-live="polite">Press Spin to see a result</p><button class="button wheel-spin-button" type="button">Spin</button></div></div>' +
      '<div class="wheel-dialog-foot"><p>This spin is a preview. The NEXORA creation tool saves local drafts and does not issue real rewards.</p><a class="button">Create a campaign in NEXORA →</a></div>';
    dialog.querySelector('.wheel-dialog-foot a').href = new URL('../pages/products/spin-wheel/create.html', base).href;
    disc = dialog.querySelector('.wheel-disc'); result = dialog.querySelector('.wheel-result'); spin = dialog.querySelector('.wheel-spin-button');
    prizes.forEach(function (prize, index) {
      var label = document.createElement('label'); label.className = 'wheel-prize-field' + (index === 7 ? ' no-prize' : '');
      var number = document.createElement('small'); number.textContent = String(index + 1);
      var image = document.createElement('span'); image.className = 'wheel-prize-icon'; image.append(icon(prize[1]));
      var input = document.createElement('input'); input.type = 'text'; input.maxLength = 18; input.value = prize[0]; input.setAttribute('aria-label', 'Prize segment ' + (index + 1));
      input.addEventListener('input', function () { prize[0] = input.value.trim() || (index === 7 ? 'Good luck' : 'Offer'); draw(); result.textContent = 'Press Spin to see a result'; });
      label.append(number, image, input); dialog.querySelector('.wheel-prize-grid').append(label);
    });
    dialog.querySelector('#wheel-campaign-name').addEventListener('input', function (event) { dialog.querySelector('#wheel-preview-name').textContent = event.target.value.trim() || 'Campaign name'; });
    spin.addEventListener('click', function () {
      if (busy) return;
      busy = true; spin.disabled = true;
      dialog.querySelectorAll('.wheel-prize-field input').forEach(function (input) { input.disabled = true; });
      result.textContent = 'Spinning…';
      var winner = Math.floor(Math.random() * prizes.length), target = (360 - (winner * 45 + 22.5)) % 360;
      rotation += 1440 + (target - rotation % 360 + 360) % 360;
      disc.style.transform = 'rotate(' + rotation + 'deg)';
      timer = setTimeout(function () { result.textContent = 'Demo result: ' + (winner === 7 ? 'no prize this spin' : prizes[winner][0]); finish(); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 3000);
    });
    dialog.querySelector('.wheel-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('close', function () { clearTimeout(timer); finish(); result.textContent = 'Press Spin to see a result'; if (opener && opener.isConnected) opener.focus({ preventScroll: true }); });
    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog) return;
      var rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    document.body.append(dialog); draw();
  }
  window.NEXORA_WHEEL_DEMO = { open: function () { if (!dialog) create(); if (!dialog.open) { opener = document.activeElement; dialog.showModal(); } } };
  document.addEventListener('click', function (event) { if (event.target.closest('[data-open-wheel-demo]')) window.NEXORA_WHEEL_DEMO.open(); });
})();
