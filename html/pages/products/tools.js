/* Shared display helpers; PO draft keys and stored ISO dates stay intact. */
(function () {
  'use strict';
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
  window.NEXORA_PO_TOOLS = { date: date, refreshDates: refreshDates, validate: validate };
  refreshDates();
})();
