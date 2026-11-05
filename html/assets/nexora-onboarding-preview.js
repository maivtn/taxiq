// Filled visual examples for each setup step. All values are illustrative.
window.NEXORA_RENDER_ONBOARDING_PREVIEW = function (guide, kind, stepTitle, industryT, setupT, context = {}) {
  const fields = context.fields || {};
  const pick = (key, fallback) => String(fields[key] ?? '').trim() || fallback;
  const businessName = String(context.businessName ?? '').trim() || guide.exampleName;
  const flow = window.NEXORA_WELCOME_DATA.flow;
  const enabled = (fields, item) => fields[item.key] === undefined ? Boolean(item.defaultOn) : fields[item.key] === 'true';
  const hasEntered = Object.values(fields).some(value => String(value).trim()) || businessName !== guide.exampleName;
  const previewLabel = setupT(hasEntered ? 'yourPreview' : 'completedExample');
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const itemParts = value => {
    const parts = value.split(' · ');
    return {name: parts[0], detail: parts.slice(1, -1).join(' · '), price: parts.at(-1)};
  };
  const qrArt = () => {
    const qr = el('div', 'setup-sample-qr-grid');
    qr.setAttribute('aria-hidden', 'true');
    const inFinder = (x, y, ox, oy) => {
      const dx = x - ox, dy = y - oy;
      if (dx < 0 || dx > 6 || dy < 0 || dy > 6) return null;
      return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    };
    for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
      const finder = inFinder(x,y,0,0) ?? inFinder(x,y,14,0) ?? inFinder(x,y,0,14);
      const cell = el('i');
      if (finder === true || (finder === null && (x * 7 + y * 11 + x * y) % 5 < 2)) cell.className = 'on';
      qr.append(cell);
    }
    return qr;
  };
  const figure = el('figure', 'setup-completed-preview');
  figure.append(el('figcaption', 'setup-completed-label', previewLabel));
  const windowCard = el('div', 'setup-sample-window');
  const head = el('div', 'setup-sample-head');
  const dots = el('span', 'setup-sample-dots');
  dots.append(el('i'), el('i'), el('i'));
  head.append(dots, el('strong', '', kind === 'business' ? pick('name', guide.exampleName) : businessName), el('small', '', setupT('previewTag')));
  const body = el('div', 'setup-sample-body');
  const offering = itemParts(industryT(guide.exampleOffering));
  const second = itemParts(setupT(guide.key + 'Second'));

  if (kind === 'business') {
    const hero = el('div', 'setup-sample-business-hero');
    const image = el('img');
    image.src = guide.sampleImage;
    image.alt = '';
    image.loading = 'lazy';
    hero.append(image);
    const identity = el('div', 'setup-sample-business-identity');
    const name = pick('name', guide.exampleName);
    identity.append(el('span', 'setup-sample-avatar', name.slice(0, 1)), el('div', 'setup-sample-business-name', name));
    const businessFields = el('div', 'setup-sample-fields');
    for (const [icon, value] of [['⌖', pick('address', '123 Main St · Chicago, IL')], ['◷', pick('hours', '09:00–18:00 · 6/7')], ['☎', pick('phone', '(312) 555-0148')]]) {
      const field = el('div', 'setup-sample-field');
      field.append(el('b', '', icon), el('span', '', value));
      businessFields.append(field);
    }
    body.append(hero, identity, businessFields);
  } else if (kind === 'services' || kind === 'catalog' || kind === 'menu') {
    body.append(el('div', 'setup-sample-section-title', setupT('itemLabel')));
    const list = el('div', 'setup-sample-list');
    const simpleItems = kind === 'services' && Array.isArray(context.items) ? context.items : null;
    const items = simpleItems ? new Map(simpleItems.map((item, index) => [index + 1, {name: item.name || '', detail: '', price: item.price === '' || item.price == null ? '' : '$' + Number(item.price).toFixed(2)}])) : new Map([[1, offering], [2, second]]);
    if (kind === 'catalog') for (const key of Object.keys(fields)) {
      const match = /^item([1-9]\d*)(?:Name|Price)$/.exec(key);
      if (match && Number(match[1]) > 2 && (String(fields[`item${match[1]}Name`] ?? '').trim() || String(fields[`item${match[1]}Price`] ?? '').trim())) {
        items.set(Number(match[1]), {name: '', detail: '', price: ''});
      }
    }
    for (const [number, item] of [...items].sort(([a], [b]) => a - b)) {
      const row = el('div', 'setup-sample-list-row');
      const icon = el('span', 'setup-sample-list-icon', kind === 'menu' ? '☕' : kind === 'catalog' ? '▣' : '✦');
      const info = el('div', 'setup-sample-list-info');
      const duration = String(fields[`item${number}Duration`] ?? '').trim();
      const description = String(fields[`item${number}Detail`] ?? '').trim();
      info.append(el('strong', '', simpleItems ? item.name : pick(`item${number}Name`, item.name)));
      if (!simpleItems) info.append(el('small', '', [duration, description].filter(Boolean).join(' · ') || item.detail));
      row.append(icon, info, el('b', 'setup-sample-price', simpleItems ? item.price : pick(`item${number}Price`, item.price)));
      list.append(row);
    }
    body.append(list);
  } else if (kind === 'staff') {
    if (fields.staffMode === 'invite') {
      body.append(el('div', 'setup-sample-section-title', setupT('staffInvitePreview')));
      const invite = el('div', 'setup-sample-invite');
      const inviteQr = el('div', 'setup-sample-invite-qr');
      inviteQr.append(qrArt());
      const flowSteps = el('div', 'setup-sample-invite-steps');
      for (const key of ['staffInvite1','staffInvite2','staffInvite3']) {
        const confirmed = key === 'staffInvite3' && fields.inviteConfirmed === 'true';
        flowSteps.append(el('div', confirmed ? 'confirmed' : '', (confirmed ? '✓ ' : '') + setupT(key)));
      }
      invite.append(inviteQr, flowSteps);
      body.append(invite);
    } else {
      body.append(el('div', 'setup-sample-section-title', setupT('teamLabel')));
      for (const [index, [initial, fallbackName, fallbackTime]] of [['M','Mia Nguyen','09:00–17:00'],['A','Alex Lee','11:00–19:00']].entries()) {
        const name = pick(`staff${index + 1}Name`, fallbackName);
        const time = pick(`staff${index + 1}Hours`, fallbackTime);
        const person = el('div', 'setup-sample-person');
        const identity = el('div');
        identity.append(el('strong', '', name), el('small', '', index === 0 ? pick('staff1Services', offering.name) : offering.name));
        person.append(el('span', 'setup-sample-person-avatar', name.slice(0, 1) || initial), identity, el('time', '', time));
        body.append(person);
      }
    }
  } else if (kind === 'qr') {
    body.append(el('div', 'setup-sample-section-title', setupT('qrLabel')));
    const row = el('div', 'setup-sample-qr-layout');
    const poster = el('div', 'setup-sample-qr-poster');
    poster.append(el('strong', '', pick('qrLabel', businessName)));
    poster.append(qrArt(), el('small', '', pick('qrLocation', industryT(guide.exampleTouchpoint))));
    const phone = el('div', 'setup-sample-qr-phone');
    phone.append(el('span', 'setup-sample-phone-bar'), el('strong', '', businessName));
    for (const tile of flow.qrTiles.filter(item => enabled(fields, item))) {
      phone.append(el('span', 'setup-sample-phone-item', setupT(tile.label)));
    }
    for (const name of context.services || []) if (enabled(fields, flow.qrTiles[1])) phone.append(el('small', 'setup-sample-phone-service', name));
    row.append(poster, phone);
    body.append(row);
  } else if (kind === 'voice') {
    body.append(el('div', 'setup-sample-section-title', setupT('voiceStep')));
    if (fields.voiceMode === 'on') {
      const voice = el('div', 'setup-sample-voice');
      voice.append(el('strong', '', setupT('voicePreviewOn')));
      for (const feature of flow.voiceFeatures.filter(item => enabled(fields, item))) voice.append(el('div', '', '✓ ' + setupT(feature.label)));
      body.append(voice);
    } else body.append(el('div', 'setup-sample-voice-off', setupT('voicePreviewOff')));
  } else if (kind === 'payment') {
    body.append(el('div', 'setup-sample-section-title', setupT('receiptLabel')));
    const receipt = el('div', 'setup-sample-receipt');
    const paid = el('div', 'setup-sample-paid');
    paid.append(el('span', '', '✓'), el('strong', '', setupT('paidLabel')));
    const line = el('div', 'setup-sample-receipt-line');
    const amount = pick('amount', offering.price);
    line.append(el('span', '', pick('paymentMethod', offering.name)), el('b', '', amount));
    const tip = el('div', 'setup-sample-receipt-line');
    const tipAmount = pick('tipAmount', '$3.00');
    if (guide.key === 'restaurant') tip.append(el('span', '', setupT('tipLabel')), el('b', '', tipAmount));
    const total = el('div', 'setup-sample-receipt-total');
    const amountNumber = Number(amount.replace(/[^0-9.,]/g, '').replace(',', '.'));
    const tipNumber = guide.key === 'restaurant' ? Number(tipAmount.replace(/[^0-9.,]/g, '').replace(',', '.')) : 0;
    const totalAmount = Number.isFinite(amountNumber + tipNumber) ? '$' + (amountNumber + tipNumber).toFixed(2) : amount;
    total.append(el('strong', '', setupT('totalLabel')), el('strong', '', totalAmount));
    receipt.append(paid, line);
    if (tip.children.length) receipt.append(tip);
    receipt.append(total);
    body.append(receipt);
  } else if (kind === 'deal') {
    body.append(el('div', 'setup-sample-section-title', setupT('offerLabel')));
    const coupon = el('div', 'setup-sample-coupon');
    const amount = el('div');
    amount.append(el('strong', '', '−' + pick('discountPercent', '10') + '%'), el('small', '', pick('offerTitle', offering.name)));
    coupon.append(amount, el('span', '', pick('discountCode', 'SAVE10')));
    body.append(coupon, el('div', 'setup-sample-status', setupT('previewTag')));
  } else if (kind === 'review') {
    body.append(el('div', 'setup-sample-review-invite', pick('inviteText', setupT('defaultInvite'))));
    const review = el('div', 'setup-sample-review');
    review.append(el('div', 'setup-sample-stars', '★★★★★'), el('strong', '', 'Jordan M.'), el('p', '', setupT('reviewText')));
    const reply = el('div', 'setup-sample-reply');
    reply.append(el('small', '', setupT('replyLabel')), el('p', '', businessName + ' · ' + pick('replyText', setupT('replyText'))));
    review.append(reply);
    body.append(review);
  }
  windowCard.append(head, body);
  const notice = kind === 'staff' && fields.staffMode === 'invite' ? 'staffInviteNotice' : kind === 'qr' ? 'qrPreviewNotice' : kind === 'voice' ? 'voicePreviewNotice' : hasEntered ? 'mixedPreviewNotice' : 'exampleNotice';
  figure.append(windowCard, el('small', 'setup-sample-notice', setupT(notice)));
  figure.setAttribute('aria-label', previewLabel + ': ' + stepTitle);
  return figure;
};
