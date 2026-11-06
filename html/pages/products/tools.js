/* Shared display helpers; PO draft keys and stored ISO dates stay intact. */
(function () {
  'use strict';
  var icons = window.NEXORA_ICONS;
  var uiPaths = {
    plus:'<path d="M12 5v14M5 12h14"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    chart:'<path d="M3 3v18h18M7 14l4-4 4 3 5-7"/>',
    save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2Z"/><path d="M7 3v6h10V3M7 21v-8h10v8"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/>',
    edit:'<path d="m16 3 5 5-12 12-6 1 1-6L16 3Zm-2 2 5 5"/>',
    copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>'
  };
  function uiIcon(kind) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + uiPaths[kind] + '</svg>'; }
  function decorateAction(node, kind) {
    if (!node) return;
    node.classList.add('tool-icon-action');
    node.style.setProperty('--tool-action-icon', 'url("data:image/svg+xml,' + encodeURIComponent(uiIcon(kind)) + '")');
  }
  function numberedArt(node, kind) {
    var number = document.createElement('span'); number.className = 'tool-step-index'; number.textContent = node.textContent;
    node.classList.add('tool-step-art'); node.replaceChildren(icons.contentNode(kind, {size:36}), number);
  }
  var studio = !!document.getElementById('campaign-type');
  var title = document.querySelector('h1');
  if (title) title.prepend(icons.contentNode(studio ? 'marketing' : 'wheel', {size:48, className:'tool-title-art'}));
  document.querySelectorAll('.step b, .card-head > .step').forEach(function (node, index) { numberedArt(node, (studio ? ['users','document'] : ['calendar','gift','shield'])[index]); });
  document.querySelectorAll('.tabs [data-tab] span').forEach(function (node, index) { node.innerHTML = uiIcon(['plus','list','chart'][index]); });
  document.querySelectorAll('.metric').forEach(function (node, index) { node.prepend(icons.contentNode(['users','calendar','chart'][index], {size:32, className:'tool-metric-art'})); });
  decorateAction(document.querySelector('#save-button, .actions button[type="submit"]'), 'save');
  decorateAction(document.querySelector('#export-button, #download-draft'), 'download');
  decorateAction(document.getElementById('clear-button'), 'plus');
  function prizeArt(name) {
    var kinds = {'10% off':'percent', '$5 reward':'income', 'Hand care':'hand-care', '5% off':'percent', 'Small gift':'gift', 'Nail polish':'nail-polish', 'Next-visit offer':'calendar', 'Good luck':'sparkle'};
    return icons.contentNode(kinds[name] || 'gift', {size:24, className:'tool-prize-art'});
  }
  var dateFields = Array.from(document.querySelectorAll('input[type="date"]'));
  function date(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return '';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z'));
  }
  function refreshDates() {
    dateFields.forEach(function (input) { input.nextElementSibling.textContent = date(input.value); });
  }
  function validate(form) {
    form.querySelectorAll('input[required]:not([type="number"]), textarea[required]').forEach(function (input) {
      input.setCustomValidity(input.value.trim() ? '' : input.getAttribute('aria-label') || input.closest('label')?.firstChild.textContent.trim() || 'Campaign name');
    });
    return form.reportValidity();
  }
  dateFields.forEach(function (input) {
    var wrap = document.createElement('span'); wrap.className = 'tool-date';
    var label = document.createElement('output'); label.setAttribute('aria-hidden', 'true');
    input.before(wrap); wrap.append(input, label);
    input.addEventListener('input', refreshDates);
    input.addEventListener('change', refreshDates);
  });
  var form = document.getElementById('campaign-form');
  if (form) {
    form.addEventListener('reset', function () {
      form.querySelectorAll('input, textarea').forEach(function (input) { input.setCustomValidity(''); });
      requestAnimationFrame(refreshDates);
    });
    form.addEventListener('input', function (event) {
      if (event.target.matches('input[type="text"], input:not([type]), textarea') && event.target.required) {
        event.target.setCustomValidity(event.target.value.trim() ? '' : event.target.closest('label')?.firstChild.textContent.trim() || event.target.getAttribute('aria-label') || 'Campaign name');
      }
    });
  }
  window.NEXORA_PO_TOOLS = { date: date, refreshDates: refreshDates, validate: validate, decorateAction:decorateAction, prizeArt:prizeArt };
  refreshDates();
})();
