/* Country codes from the existing staff profile; masks follow the salon phone fields. */
(function () {
  'use strict';
  const codes = ['+1', '+84', '+44', '+61', '+65', '+81', '+82', '+49', '+33', '+91', '+86', '+55', '+52', '+852', '+886', '+60', '+66', '+63', '+62'];
  const prefixes = [...codes].sort((left, right) => right.length - left.length);
  function split(value, fallback = '+1') {
    const raw = String(value || '').trim().replace(/^00/, '+');
    const explicit = /^\+\d{1,3}(?=[\s(.-])/.exec(raw);
    const code = raw.startsWith('+') ? explicit?.[0] || prefixes.find(prefix => raw.startsWith(prefix)) || fallback : fallback;
    let digits = (raw.startsWith(code) ? raw.slice(code.length) : raw).replace(/\D/g, '');
    if (code === '+1' && digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
    if (code === '+84') digits = digits.replace(/^0/, '');
    return { code, digits };
  }
  function mask(digits, code) {
    if (!digits) return '';
    if (code === '+1') {
      if (digits.length <= 3) return '(' + digits;
      return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + (digits.length > 6 ? '-' + digits.slice(6) : '');
    }
    return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join(' ');
  }
  function format(value) {
    const { code, digits } = split(value);
    return digits ? code + ' ' + mask(digits, code) : '';
  }
  function markup(id, required = false) {
    return '<span class="oneqr-phone-control"><select name="phoneCode" aria-label="Country code" autocomplete="tel-country-code">' + codes.map(code => '<option value="' + code + '">' + code + '</option>').join('') + '</select><input id="' + id + '" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="(123) 456-7890"' + (required ? ' required' : '') + '></span>';
  }
  function mount(root, value = '') {
    const input = root.querySelector('input[name="phone"]');
    const select = root.querySelector('select[name="phoneCode"]');
    function normalize(raw = input.value) {
      const phone = split(raw, select.value);
      if (!Array.from(select.options).some(option => option.value === phone.code)) select.add(new Option(phone.code, phone.code));
      select.value = phone.code;
      input.value = mask(phone.digits, phone.code);
      input.placeholder = phone.code === '+1' ? '(123) 456-7890' : phone.code === '+84' ? '912 345 678' : '123 456 7890';
    }
    function set(value) {
      select.value = '+1';
      normalize(value);
    }
    function read() {
      normalize();
      return input.value ? select.value + ' ' + input.value : '';
    }
    input.addEventListener('input', event => {
      const raw = input.value;
      const cursor = input.selectionStart;
      const before = split(raw.slice(0, cursor), select.value).digits.length;
      normalize();
      if (cursor === null || cursor === raw.length) return;
      let position = 0, count = 0;
      while (position < input.value.length && count < before) {
        if (/\d/.test(input.value[position])) count++;
        position++;
      }
      if (event.inputType === 'deleteContentForward') {
        while (position < input.value.length && /\D/.test(input.value[position])) position++;
      }
      input.setSelectionRange(position, position);
    });
    input.addEventListener('beforeinput', event => {
      const cursor = input.selectionStart;
      if (cursor !== input.selectionEnd || !['deleteContentBackward', 'deleteContentForward'].includes(event.inputType)) return;
      const backward = event.inputType === 'deleteContentBackward';
      let index = backward ? cursor - 1 : cursor;
      if (index < 0 || index >= input.value.length || /\d/.test(input.value[index])) return;
      while (index >= 0 && index < input.value.length && /\D/.test(input.value[index])) index += backward ? -1 : 1;
      if (index < 0 || index >= input.value.length) return;
      event.preventDefault();
      input.value = input.value.slice(0, index) + input.value.slice(index + 1);
      input.setSelectionRange(index, index);
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: event.inputType }));
    });
    select.addEventListener('change', () => {
      normalize();
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    set(value);
    return { set, read };
  }
  window.NEXORA_ONEQR_PHONE = { markup, mount, format };
})();
