/* Local interactions for the captured Merchant AI Ads views. No provider requests. */
(function () {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const screens = $$('.screen-section');
  const nav = $$('.nav-btn');
  let previousFocus;
  let page = 1;
  const rows = $$('#screen-manage tbody tr');
  const cards = $$('#screen-manage article');
  const previewNames = ['preview', 'preview-1', 'preview-2', 'preview-3', 'preview-4', 'preview-expired', 'preview-rejected'];
  const activeNav = 'bg-transparent text-indigo-600 border-indigo-600';
  const inactiveNav = 'bg-transparent text-slate-500 border-transparent hover:text-indigo-600 hover:border-indigo-200';

  function closeModal() {
    $('#local-modal-host')?.remove();
    document.body.style.overflow = '';
    previousFocus?.focus();
  }

  function openModal(name) {
    closeModal();
    previousFocus = document.activeElement;
    const host = document.createElement('div');
    host.id = 'local-modal-host';
    host.append($('#template-' + name).content.cloneNode(true));
    const dialog = host.firstElementChild;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    const title = $('h3', dialog);
    if (title) { title.id = 'local-dialog-title'; dialog.setAttribute('aria-labelledby', title.id); }
    document.body.append(host);
    document.body.style.overflow = 'hidden';
    $$('button', host).filter(b => ['Close', 'Cancel'].includes(b.getAttribute('aria-label') || b.textContent.trim())).forEach(b => b.addEventListener('click', closeModal));
    $('button:not(:disabled)', host)?.focus();
    return host;
  }

  function showScreen(name, updateHash = true) {
    if (!$('#screen-' + name)) name = 'hub';
    screens.forEach(screen => screen.classList.toggle('hidden', screen.id !== 'screen-' + name));
    nav.forEach(button => {
      const selected = button.dataset.screen === (['upload','create-ai'].includes(name) ? 'create-ad' : name);
      const common = button.className.replace(activeNav, '').replace(inactiveNav, '').replace(/\s+/g, ' ').trim();
      button.className = common + ' ' + (selected ? activeNav : inactiveNav);
      button.setAttribute('aria-current', selected ? 'page' : 'false');
    });
    if (updateHash) history.replaceState(null, '', '#' + name);
    window.scrollTo(0, 0);
    updateNavArrows();
  }

  function showHistory(kind) {
    ['credit', 'package'].forEach(key => {
      const selected = kind === key;
      const button = $('#transactions-' + key + '-tab');
      const panel = $('#transactions-' + key + '-panel');
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.classList.toggle('bg-white', selected);
      button.classList.toggle('text-slate-950', selected);
      button.classList.toggle('shadow-sm', selected);
      button.classList.toggle('text-slate-500', !selected);
      panel.classList.toggle('hidden', !selected);
      panel.hidden = !selected;
    });
  }

  function renderBanners(resetPage) {
    if (resetPage) page = 1;
    const query = $('#filter-search').value.trim().toLowerCase();
    const status = $('#filter-status').selectedOptions[0].textContent;
    const source = $('#filter-source').selectedOptions[0].textContent;
    const matches = rows.filter(row => {
      const cells = row.cells;
      return (!query || cells[0].textContent.toLowerCase().includes(query)) &&
        (status === 'All statuses' || cells[2].textContent.trim() === status) &&
        (source === 'All sources' || cells[1].textContent.trim() === source);
    });
    const pages = Math.max(1, Math.ceil(matches.length / 5));
    page = Math.min(page, pages);
    const visible = new Set(matches.slice((page - 1) * 5, page * 5).map(row => row.dataset.bannerIndex));
    [...rows, ...cards].forEach(item => { item.hidden = !visible.has(item.dataset.bannerIndex); });
    const paging = $('[data-pagination]');
    const numberGroup = $$('button', paging).find(button => /^\d+$/.test(button.textContent.trim())).parentElement;
    const numberTemplate = $('button', numberGroup).cloneNode(true);
    numberGroup.replaceChildren();
    for (let number = 1; number <= pages; number += 1) {
      const button = numberTemplate.cloneNode(true); button.textContent = String(number); numberGroup.append(button);
    }
    const buttons = $$('button', paging);
    buttons[0].disabled = page === 1;
    buttons[buttons.length - 1].disabled = page === pages;
    buttons.filter(button => /^\d+$/.test(button.textContent.trim())).forEach(button => {
      const selected = Number(button.textContent) === page;
      button.hidden = Number(button.textContent) > pages;
      button.classList.toggle('bg-indigo-600', selected);
      button.classList.toggle('text-white', selected);
      button.classList.toggle('border', !selected);
      button.classList.toggle('text-slate-500', !selected);
      button.setAttribute('aria-current', selected ? 'page' : 'false');
    });
  }

  function openPayment(plan) {
    const host = openModal('package-payment');
    const summary = $('#pm-invoice-total', host);
    const price = { Basic: 29, Premium: 59, Platinum: 129 }[plan];
    const labels = $$('p,span', host);
    labels.filter(label => label.children.length === 0 && label.textContent.trim() === 'Basic').forEach(label => { label.textContent = plan; });
    summary.textContent = '$' + price + ' / month';
    $$('#pm-method-list button', host).forEach(button => button.addEventListener('click', function () {
      $$('#pm-method-list button', host).forEach(item => {
        const selected = item === button;
        item.classList.toggle('border-indigo-500', selected);
        item.classList.toggle('bg-indigo-50', selected);
        item.setAttribute('aria-pressed', String(selected));
        const radio = item.querySelector('.border-2');
        if (radio) {
          radio.replaceChildren();
          radio.classList.toggle('border-indigo-600', selected);
          radio.classList.toggle('border-slate-300', !selected);
          if (selected) {
            const dot = document.createElement('span');
            dot.className = 'h-1.5 w-1.5 rounded-full bg-indigo-600';
            radio.append(dot);
          }
        }
      });
    }));
  }

  const prompts = JSON.parse($('#ai-ads-prompts').textContent);
  let editingIndex = null;
  let uploadImage = null;
  const formatDate = value => value ? new Date(value + 'T12:00:00').toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : '';
  const uploadSave = $('#screen-upload [data-save-draft]');
  const uploadSubmit = $$('#screen-upload button').find(button => button.textContent.trim() === 'Submit for review');
  const sourceScheduleNote = $$('#screen-upload p').find(el => el.textContent.includes('Target URL and schedule are optional.')).textContent;

  function setImage(kind, image) {
    const isUpload = kind === 'upload';
    const prefix = isUpload ? 'upload' : 'ai-ref';
    $('#' + prefix + '-dropzone').classList.toggle('hidden', !!image);
    $('#' + (isUpload ? 'upload-preview-card' : 'ai-ref-preview-card')).classList.toggle('hidden', !image);
    if (image) {
      $('#' + (isUpload ? 'upload-preview-img' : 'ai-ref-preview-img')).src = image.src;
      $('#' + (isUpload ? 'upload-file-name' : 'ai-ref-preview-name')).textContent = image.name;
    }
    if (isUpload) uploadImage = image;
    else $('#ai-ref-history-picker').classList.add('hidden');
  }

  function prepareUpload(index = null) {
    editingIndex = index;
    const template = index === null ? null : $('#template-' + previewNames[index]).content;
    const field = label => $$('#modal-body span', template).find(el => el.textContent.trim() === label)?.parentElement.querySelector('p')?.textContent || '';
    $('#upload-name-input').value = template ? field('Banner name:') : '';
    $('#upload-target-url').value = template && field('Target URL:') !== 'Not set' ? field('Target URL:') : '';
    const schedule = template ? $('#modal-body', template).textContent.match(/Schedule:\s*(.+)/) : null;
    const dates = schedule ? schedule[1].match(/[A-Z][a-z]{2} \d{1,2}, \d{4}/g) || [] : [];
    ['start', 'end'].forEach((key, i) => {
      const input = $('#upload-' + key + '-date');
      if (index !== null) input.removeAttribute('min');
      const date = dates[i] && new Date(dates[i]);
      input.value = date ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}` : '';
      input.dispatchEvent(new Event('change'));
    });
    const image = template && $('#modal-body img', template);
    setImage('upload', image ? {src:image.getAttribute('src'), name:field('Banner name:') + '.png'} : null);
    uploadSave.disabled = index !== null;
    uploadSubmit.textContent = index === null ? 'Submit for review' : 'Save changes';
    uploadSubmit.disabled = index === null;
    uploadSubmit.classList.toggle('local-unavailable', index === null);
    showScreen('upload');
  }

  function setBannerImage(scope, source, name) {
    let image = $('img', scope);
    if (!image) {
      image = document.createElement('img');
      image.className = 'w-full h-full object-cover';
      const placeholder = $('.currency-token', scope);
      if (placeholder) placeholder.replaceWith(image);
      else scope.prepend(image);
    }
    image.src = source;
    image.alt = name;
    return image;
  }

  function updatePreview(template, name, target, start, end, image) {
    const content = template.content;
    const field = label => $$('#modal-body span', content).find(el => el.textContent.trim() === label)?.parentElement.querySelector('p');
    field('Banner name:').textContent = name;
    const url = field('Target URL:'); if (url) url.textContent = target || 'Not set';
    setBannerImage($('#modal-body', content), image.src, name);
    const schedule = $$('#modal-body div', content).reverse().find(el => el.textContent.trim().startsWith('Schedule:'));
    if (schedule) schedule.textContent = 'Schedule: ' + (start && end ? formatDate(start) + ' to ' + formatDate(end) : 'No schedule set');
  }

  function saveLocalBanner() {
    const name = $('#upload-name-input');
    name.required = true;
    if (!name.reportValidity()) return;
    if (!uploadImage) { $('#upload-dropzone').focus(); return; }
    const start = $('#upload-start-date'), end = $('#upload-end-date');
    end.setCustomValidity((!!start.value !== !!end.value || (start.value && end.value < start.value)) ? sourceScheduleNote : '');
    if (!end.reportValidity()) return;
    let index = editingIndex;
    if (index === null) {
      index = rows.length;
      const row = rows[0].cloneNode(true), card = cards[0].cloneNode(true);
      row.dataset.bannerIndex = card.dataset.bannerIndex = String(index);
      $('#screen-manage tbody').prepend(row); cards[0].parentElement.prepend(card);
      rows.unshift(row); cards.unshift(card);
      const template = $('#template-preview').cloneNode(true);
      template.id = 'template-local-' + index; document.body.append(template); previewNames.push('local-' + index);
      $('#manage-stat-total').textContent = String(rows.length);
    }
    const itemNodes = [...$$(`[data-banner-index="${index}"]`)].filter(el => el.closest('#screen-manage') || el.closest('#screen-hub'));
    itemNodes.forEach(item => {
      setBannerImage(item, uploadImage.src, name.value.trim());
      const nameNode = $('.font-bold', item); nameNode.textContent = name.value.trim();
      if (editingIndex === null) $$('*', item).filter(el => el.children.length === 0 && el.textContent.startsWith('Created:')).forEach(el => {el.textContent = 'Created: ' + new Date().toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'});});
    });
    updatePreview($('#template-' + previewNames[index]), name.value.trim(), $('#upload-target-url').value.trim(), start.value, end.value, uploadImage);
    $('#filter-search').value = ''; $('#filter-status').value = 'all'; $('#filter-source').value = 'all';
    renderBanners(true); showScreen('manage');
  }

  function chooseLocalFile(kind) { $('#' + (kind === 'upload' ? 'upload-file-input' : 'ai-ref-file-input')).click(); }
  ['upload', 'ai-ref'].forEach(prefix => {
    const input = $('#' + prefix + '-file-input');
    const zone = $('#' + prefix + '-dropzone');
    input.accept = 'image/jpeg,image/png,image/webp';
    const read = file => {
      if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.addEventListener('load', () => setImage(prefix === 'upload' ? 'upload' : 'ai', {src:reader.result, name:file.name}));
      reader.readAsDataURL(file);
    };
    input.addEventListener('change', () => read(input.files[0]));
    zone.addEventListener('click', event => { if (event.target !== input) input.click(); });
    zone.addEventListener('keydown', event => {if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();input.click();}});
    zone.addEventListener('dragover', event => event.preventDefault());
    zone.addEventListener('drop', event => {event.preventDefault();read(event.dataTransfer.files[0]);});
  });
  $$('input[type=date]').forEach(input => {
    const wrapper = document.createElement('div'); wrapper.className = 'local-date-picker';
    input.before(wrapper); wrapper.append(input);
    const value = document.createElement('span'); value.className = 'local-date-value'; wrapper.append(value);
    const icon = document.createElement('span'); icon.className = 'local-date-calendar'; icon.setAttribute('aria-hidden', 'true'); const calendar = $('#screen-hub .lucide-calendar')?.cloneNode(true); if (calendar) icon.append(calendar); wrapper.append(icon);
    input.addEventListener('change', () => {value.textContent = formatDate(input.value);input.setCustomValidity('');});
    input.addEventListener('click', () => { try { input.showPicker(); } catch (_) {} });
    input.dispatchEvent(new Event('change'));
  });
  function setEffort(button) {
    const quality = button.dataset.quality;
    const cost = {low:1,medium:2,high:3}[quality];
    $('#quality-trigger-label').textContent = quality[0].toUpperCase() + quality.slice(1);
    $$('#quality-dropdown button').forEach(item => {
      const selected = item === button;
      item.classList.toggle('bg-indigo-50', selected);item.classList.toggle('text-indigo-700', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    const costLabel = $$('#ai-generator-before span').find(el => el.textContent.trim() === 'Cost for this generation:');
    costLabel.nextElementSibling.textContent = cost + ' credit';
    $('#quality-dropdown').classList.add('hidden'); $('#quality-trigger').setAttribute('aria-expanded','false');
  }
  $('#quality-trigger').setAttribute('aria-expanded','false');
  $('#quality-trigger').addEventListener('click', () => {
    const open = $('#quality-dropdown').classList.toggle('hidden');$('#quality-trigger').setAttribute('aria-expanded',String(!open));
  });
  $$('#quality-dropdown [data-quality]').forEach(button => button.addEventListener('click', () => setEffort(button)));
  $$('#suggested-prompts-container button').forEach(button => button.addEventListener('click', () => {
    const name = button.textContent.replace(/^#\s*/, '').trim();$('#ai-prompt-input').value = prompts.design[name];
  }));
  $$('#screen-upload button').filter(button => $('img', button)).forEach(button => button.addEventListener('click', () => {
    const image = $('img', button);setImage('upload', {src:image.getAttribute('src'),name:image.alt});
  }));
  $$('#ai-ref-history-grid button').forEach(button => button.addEventListener('click', () => {
    const image = $('img', button);setImage('ai', {src:image.getAttribute('src'),name:image.alt});
  }));
  function openRedesign() {
    const host = openModal('redesign');
    $('img', host).src = uploadImage.src;
    $$('#upload-redesign-suggested-prompts button', host).forEach(button => button.addEventListener('click', () => {
      $('#upload-redesign-prompt', host).value = prompts.redesign[button.textContent.replace(/^#\s*/, '').trim()];
    }));
    $$('button', host).filter(button => /^(Low|Medium|High) ·/.test(button.textContent.trim())).forEach(button => button.addEventListener('click', () => {
      const name = button.textContent.split(' ·')[0].trim();
      $$('button', host).filter(item => /^(Low|Medium|High) ·/.test(item.textContent.trim())).forEach(item => {
        const selected = item === button;item.classList.toggle('bg-indigo-50',selected);item.classList.toggle('text-indigo-700',selected);item.classList.toggle('border-indigo-200',selected);item.setAttribute('aria-pressed',String(selected));
      });
      const costLabel = $$('span,p', host).find(el => el.children.length === 0 && el.textContent.trim() === 'Cost for this generation');
      if (costLabel) costLabel.nextElementSibling.textContent = {Low:1,Medium:2,High:3}[name] + ' credit';
    }));
  }

  document.addEventListener('click', function (event) {
    const button = event.target.closest('button');
    if (!button || button.disabled || button.closest('#local-modal-host')) return;
    if (button.dataset.screen) return showScreen(button.dataset.screen);
    const label = button.getAttribute('title') || button.getAttribute('aria-label') || button.textContent.trim();
    if (label === 'View') {
      const item = button.closest('[data-banner-index]');
      if (item) openModal(previewNames[Number(item.dataset.bannerIndex)]);
    } else if (label === 'Edit') prepareUpload(Number(button.closest('[data-banner-index]').dataset.bannerIndex));
    else if (label === 'Upload Banner' || label === 'Upload banner now') prepareUpload();
    else if (label === 'Create with AI' || label === 'Design with AI now') showScreen('create-ai');
    else if (label === 'Choose Plan' || label === 'Upgrade Plan') showScreen('buy-package');
    else if (label === 'Choose from generated images') $('#ai-ref-history-picker').classList.toggle('hidden');
    else if (label === 'Remove image') setImage(button.closest('#screen-upload') ? 'upload' : 'ai', null);
    else if (label === 'Change image') chooseLocalFile(button.closest('#screen-upload') ? 'upload' : 'ai');
    else if (label === 'Redesign with AI') openRedesign();
    else if (label === 'Save draft' || label === 'Save changes') saveLocalBanner();
    else if (label === 'Manage all') showScreen('manage');
    else if (/^Choose (Basic|Premium|Platinum) plan$/.test(label)) openPayment(label.split(' ')[1]);
    else if (button.id === 'transactions-credit-tab') showHistory('credit');
    else if (button.id === 'transactions-package-tab') showHistory('package');
    else if (button.closest('[data-pagination]')) {
      if (/^\d+$/.test(label)) page = Number(label);
      else page += button.querySelector('.lucide-chevron-left') ? -1 : 1;
      renderBanners(false);
    } else if (button.closest('#screen-notifications')) {
      if (label === 'Mark all as read') {
        button.hidden = true;
        $('.nav-btn[data-screen=notifications] span')?.remove();
      } else showScreen('manage');
    }
  });

  $$('#screen-hub p').filter(p => ['View usage history', 'View banner details'].includes(p.textContent.trim())).forEach(link => {
    link.setAttribute('role', 'button'); link.tabIndex = 0;
    const activate = function () { showScreen(link.textContent.trim() === 'View usage history' ? 'transactions' : 'manage'); };
    link.addEventListener('click', activate);
    link.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
  });
  ['filter-search', 'filter-status', 'filter-source'].forEach(id => $('#' + id).addEventListener(id === 'filter-search' ? 'input' : 'change', () => renderBanners(true)));
  $('#filter-search').setAttribute('aria-label', 'Banner');
  $('#filter-status').setAttribute('aria-label', 'Status');
  $('#filter-source').setAttribute('aria-label', 'Source');

  const tabScroller = $('#tab-scroll-container');
  function updateNavArrows() {
    $('#tab-arrow-left').disabled = tabScroller.scrollLeft < 1;
    $('#tab-arrow-right').disabled = tabScroller.scrollLeft + tabScroller.clientWidth >= tabScroller.scrollWidth - 1;
  }
  $('#tab-arrow-left').setAttribute('aria-label', 'Overview');
  $('#tab-arrow-right').setAttribute('aria-label', 'Transaction History');
  $('#tab-arrow-left').addEventListener('click', () => tabScroller.scrollBy({ left: -250, behavior: 'smooth' }));
  $('#tab-arrow-right').addEventListener('click', () => tabScroller.scrollBy({ left: 250, behavior: 'smooth' }));
  tabScroller.addEventListener('scroll', updateNavArrows);
  window.addEventListener('resize', updateNavArrows);
  window.addEventListener('hashchange', () => showScreen(location.hash.slice(1), false));
  document.addEventListener('keydown', event => {
    const host = $('#local-modal-host');
    if (!host) return;
    if (event.key === 'Escape') closeModal();
    if (event.key !== 'Tab') return;
    const items = $$('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),[tabindex="0"]', host).filter(item => !item.hidden);
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  renderBanners(false);
  showHistory('credit');
  showScreen(location.hash.slice(1) || 'hub', false);
}());
