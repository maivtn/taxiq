(function () {
  'use strict';

  var source = window.NEXORA_OPERATING_STANDARDS_DATA;
  var library = document.querySelector('#standards-library');
  if (!source || !library) return;

  var $ = function (selector) { return document.querySelector(selector); };
  var clone = function (value) { return JSON.parse(JSON.stringify(value)); };
  var DAY = 86400000;
  var types = {rules:'Rules', agreement:'Agreement', checklist:'Checklist'};
  var salonId = window.NEXORA_SALON_DATA.loadCatalog().salon.id;
  var storageKey = 'nexora:operating-standards:v2:' + salonId;
  var templates = clone(source.documents || []);
  var view = 'documents';
  var query = '';
  var statusFilter = 'all';
  var typeFilter = 'all';
  var editingId = '';
  var feedbackTimer = 0;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character];
    });
  }

  function today() {
    var date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  function dateLabel(value) {
    if (!value) return '—';
    var date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T12:00:00') : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric', year:'numeric'}).format(date);
  }

  function documentContent(document) {
    var clean = clone(document);
    delete clean.publishedSnapshot;
    delete clean.deletedAt;
    return clean;
  }

  function makeDocument(template, status) {
    var document = clone(template);
    document.id = 'salon-' + template.id + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    document.sourceTemplateId = template.id === 'custom' ? null : template.id;
    document.status = status || 'draft';
    document.createdAt = today();
    document.updatedAt = today();
    document.publishedAt = document.status === 'published' ? today() : '';
    document.publishedSnapshot = document.status === 'published' ? documentContent(document) : null;
    document.deletedAt = null;
    return document;
  }

  function templateById(id) {
    return templates.find(function (item) { return item.id === id; });
  }

  function seedState() {
    return {version:2, documents:[makeDocument(templateById('noiquy'), 'published'), makeDocument(templateById('vesinh'), 'published'), makeDocument(templateById('mocua'), 'draft')]};
  }

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && saved.version === 2 && Array.isArray(saved.documents)) return saved;
    } catch (error) {}
    return seedState();
  }

  var state = loadState();
  state.documents = state.documents.filter(function (document) { return !document.deletedAt || Date.now() - new Date(document.deletedAt).getTime() < 30 * DAY; });

  function saveState() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (error) {}
  }

  function notify(message) {
    clearTimeout(feedbackTimer);
    $('#standards-feedback').textContent = message;
    feedbackTimer = window.setTimeout(function () { $('#standards-feedback').textContent = ''; }, 3200);
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  function typeBadge(document) {
    return '<span class="standard-tag ' + esc(document.type) + '">' + esc(types[document.type] || 'Document') + '</span>';
  }

  function statusBadge(document) {
    return document.status === 'published'
      ? '<span class="standard-state published"><i data-lucide="badge-check" aria-hidden="true"></i>Published</span>'
      : '<span class="standard-state draft"><i data-lucide="pencil-line" aria-hidden="true"></i>Draft</span>';
  }

  function searchable(document) {
    return [document.title, document.description].concat((document.sections || []).reduce(function (items, section) { return items.concat(section.title, section.rules || []); }, [])).join(' ').toLocaleLowerCase('vi');
  }

  function activeItems() {
    if (view === 'templates') return templates;
    return state.documents.filter(function (document) { return view === 'deleted' ? !!document.deletedAt : !document.deletedAt; });
  }

  function filteredItems() {
    var normalizedQuery = query.trim().toLocaleLowerCase('vi');
    return activeItems().filter(function (document) {
      return (view !== 'documents' || statusFilter === 'all' || document.status === statusFilter) && (typeFilter === 'all' || document.type === typeFilter) && (!normalizedQuery || searchable(document).includes(normalizedQuery));
    });
  }

  function daysRemaining(document) {
    return Math.max(0, 30 - Math.floor((Date.now() - new Date(document.deletedAt).getTime()) / DAY));
  }

  function actionButton(action, id, label, icon, className) {
    return '<button type="button" class="standard-card-action ' + (className || '') + '" data-standard-action="' + action + '" data-standard-id="' + esc(id) + '"><i data-lucide="' + icon + '" aria-hidden="true"></i>' + label + '</button>';
  }

  function card(document) {
    var sections = document.sections || [];
    var itemCount = sections.reduce(function (total, section) { return total + (section.rules || []).length; }, 0);
    var topBadge = view === 'templates' ? '<span class="standard-state template">System template</span>' : view === 'deleted' ? '<span class="standard-state deleted">' + daysRemaining(document) + ' days left</span>' : statusBadge(document);
    var actions = view === 'templates'
      ? actionButton('preview-template', document.id, 'Preview', 'eye', '') + actionButton('use-template', document.id, 'Use template', 'copy-plus', 'primary')
      : view === 'deleted'
        ? actionButton('restore', document.id, 'Restore', 'rotate-ccw', '') + actionButton('delete-forever', document.id, 'Delete forever', 'trash-2', 'danger')
        : actionButton('open', document.id, 'View document', 'arrow-right', 'primary');
    return '<article class="standard-card"><div class="standard-card-top"><span class="standard-icon" aria-hidden="true">' + esc(document.icon || '📄') + '</span>' + topBadge + '</div><h3>' + esc(document.title) + '</h3><p>' + esc(document.description || '') + '</p><div class="standard-card-footer"><div class="standard-tags">' + typeBadge(document) + (document.sourceTemplateId ? '<span class="standard-tag sync">From template</span>' : '') + '</div><div class="standard-card-count"><span>' + sections.length + ' sections · ' + itemCount + ' items</span><span>' + (view === 'deleted' ? 'Deleted ' + esc(dateLabel(document.deletedAt)) : 'Updated ' + esc(dateLabel(document.updatedAt))) + '</span></div><div class="standard-card-actions">' + actions + '</div></div></article>';
  }

  function introCopy() {
    if (view === 'templates') return '<div><strong>Start with a proven salon template</strong><span>Templates are read-only. Using one creates a new Draft you can customize before publishing.</span></div><span class="standards-intro-count">9 templates from the reference handbook</span>';
    if (view === 'deleted') return '<div><strong>Recently Deleted</strong><span>Deleted documents are kept for 30 days. Restored documents always return as Draft.</span></div>';
    return '<div><strong>Your salon documents</strong><span>Only Published content is visible in Staff Handbook. Draft changes stay private until published.</span></div>';
  }

  function renderLibrary() {
    var active = state.documents.filter(function (document) { return !document.deletedAt; });
    var deleted = state.documents.filter(function (document) { return !!document.deletedAt; });
    $('[data-view-count="documents"]').textContent = active.length;
    $('[data-view-count="templates"]').textContent = templates.length;
    $('[data-view-count="deleted"]').textContent = deleted.length;
    document.querySelectorAll('[data-standards-view]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.standardsView === view)); });
    $('#standards-status').closest('label').hidden = view !== 'documents';
    $('#standards-section-intro').innerHTML = introCopy();
    var items = filteredItems();
    $('#standards-grid').innerHTML = items.map(card).join('');
    $('#standards-empty').hidden = items.length > 0;
    $('#standards-grid').hidden = items.length === 0;
    refreshIcons();
  }

  function sectionsHtml(document) {
    return (document.sections || []).map(function (section, index) {
      return '<section class="standard-section" id="standard-section-' + index + '"><div class="standard-section-heading"><span class="standard-section-number">' + (index + 1) + '</span><h3>' + esc(section.title) + '</h3></div><ul class="standard-rules' + (document.type === 'checklist' ? ' is-checklist' : '') + '">' + (section.rules || []).map(function (rule) { return '<li><span>' + esc(rule) + '</span></li>'; }).join('') + '</ul></section>';
    }).join('');
  }

  function detailActions(document, isTemplate) {
    if (isTemplate) return '<button class="standard-button primary" type="button" data-standard-action="use-template" data-standard-id="' + esc(document.id) + '"><i data-lucide="copy-plus" aria-hidden="true"></i>Use template</button>';
    var buttons = '<button class="standard-button" type="button" data-standard-action="print" data-standard-id="' + esc(document.id) + '"><i data-lucide="printer" aria-hidden="true"></i>Print</button><button class="standard-button" type="button" data-standard-action="edit" data-standard-id="' + esc(document.id) + '"><i data-lucide="pencil" aria-hidden="true"></i>Edit draft</button>';
    if (document.status === 'published') buttons += '<button class="standard-button" type="button" data-standard-action="unpublish" data-standard-id="' + esc(document.id) + '">Unpublish</button>';
    buttons += '<button class="standard-button primary" type="button" data-standard-action="publish" data-standard-id="' + esc(document.id) + '"><i data-lucide="send" aria-hidden="true"></i>' + (document.status === 'published' ? 'Publish changes' : 'Publish') + '</button><button class="standard-button danger" type="button" data-standard-action="delete" data-standard-id="' + esc(document.id) + '"><i data-lucide="trash-2" aria-hidden="true"></i>Delete</button>';
    return buttons;
  }

  function showDetail(document, isTemplate) {
    if (!document) return;
    library.hidden = true;
    $('#standard-detail').hidden = false;
    var snapshotNote = !isTemplate && document.status === 'published' && document.publishedSnapshot ? '<p class="standard-published-note"><i data-lucide="eye" aria-hidden="true"></i>Staff currently see the published copy. Saved edits stay private until you publish changes.</p>' : '';
    $('#standard-detail').innerHTML = '<button class="standard-back" type="button" data-standard-back><i data-lucide="arrow-left" aria-hidden="true"></i>Back to ' + (isTemplate ? 'System Templates' : 'Salon Documents') + '</button><header class="standards-heading standard-detail-heading"><div><p class="standards-eyebrow">' + (isTemplate ? 'Read-only system template' : 'Salon document') + '</p><h2 id="standard-title">' + esc(document.title) + '</h2><div class="standard-detail-meta">' + (isTemplate ? '<span class="standard-state template">System template</span>' : statusBadge(document)) + typeBadge(document) + '<span>Updated ' + esc(dateLabel(document.updatedAt)) + '</span></div><p>' + esc(document.description || '') + '</p></div><div class="standards-actions">' + detailActions(document, isTemplate) + '</div></header>' + snapshotNote + '<div class="standard-detail-layout"><aside class="standard-toc"><h3>In this document</h3><nav>' + (document.sections || []).map(function (section, index) { return '<a href="#standard-section-' + index + '"><span>' + (index + 1) + '</span>' + esc(section.title) + '</a>'; }).join('') + '</nav></aside><div class="standard-sections">' + sectionsHtml(document) + '</div></div>';
    refreshIcons();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function closeDetail() {
    $('#standard-detail').hidden = true;
    library.hidden = false;
    renderLibrary();
  }

  function editSection(section, index) {
    return '<div class="standard-edit-section" data-edit-section><div class="standard-edit-section-top"><span>Section <span data-section-number>' + (index + 1) + '</span></span><button type="button" data-remove-section>Remove</button></div><label class="standard-field">Section name<input data-section-title maxlength="140" value="' + esc(section.title || '') + '" required></label><label class="standard-field">Content · one item per line<textarea data-section-rules rows="' + Math.min(10, Math.max(4, (section.rules || []).length + 1)) + '" required>' + esc((section.rules || []).join('\n')) + '</textarea></label></div>';
  }

  function openEditor(document) {
    editingId = document ? document.id : '';
    var draft = document ? clone(document) : {title:'', description:'', type:'rules', sections:[{title:'', rules:[]}]};
    $('#standard-editor-title').textContent = document ? 'Edit draft' : 'New document';
    var form = $('#standard-form');
    form.elements.title.value = draft.title || '';
    form.elements.type.value = draft.type || 'rules';
    form.elements.description.value = draft.description || '';
    $('#standard-editor-sections').innerHTML = draft.sections.map(editSection).join('');
    $('#standard-error').textContent = '';
    $('#standard-editor').showModal();
  }

  function readEditor() {
    var form = $('#standard-form');
    var title = form.elements.title.value.trim();
    var sections = Array.from(document.querySelectorAll('[data-edit-section]')).map(function (row, index) {
      return {id:'section-' + (index + 1), title:row.querySelector('[data-section-title]').value.trim(), rules:row.querySelector('[data-section-rules]').value.split('\n').map(function (rule) { return rule.trim(); }).filter(Boolean)};
    });
    if (!title) throw new Error('Document name is required.');
    if (!sections.length) throw new Error('Add at least one section.');
    if (sections.some(function (section) { return !section.title || !section.rules.length; })) throw new Error('Every section needs a name and at least one content item.');
    return {title:title, description:form.elements.description.value.trim(), type:form.elements.type.value, sections:sections};
  }

  function useTemplate(id) {
    var template = templateById(id);
    if (!template) return;
    var document = makeDocument(template, 'draft');
    state.documents.unshift(document);
    saveState();
    view = 'documents';
    notify('Draft created from “' + template.title + '”.');
    showDetail(document, false);
  }

  function findDocument(id) {
    return state.documents.find(function (document) { return document.id === id; });
  }

  function publish(id) {
    var document = findDocument(id);
    if (!document) return;
    document.status = 'published';
    document.publishedAt = today();
    document.updatedAt = today();
    document.publishedSnapshot = documentContent(document);
    saveState();
    notify('Published to Staff Handbook.');
    showDetail(document, false);
  }

  function unpublish(id) {
    var document = findDocument(id);
    if (!document) return;
    document.status = 'draft';
    document.publishedSnapshot = null;
    document.publishedAt = '';
    document.updatedAt = today();
    saveState();
    notify('Unpublished. Staff can no longer see this document.');
    showDetail(document, false);
  }

  function softDelete(id) {
    var document = findDocument(id);
    if (!document) return;
    document.deletedAt = new Date().toISOString();
    saveState();
    closeDetail();
    notify('Moved to Recently Deleted.');
  }

  function restore(id) {
    var document = findDocument(id);
    if (!document) return;
    document.deletedAt = null;
    document.status = 'draft';
    document.publishedSnapshot = null;
    document.publishedAt = '';
    document.updatedAt = today();
    saveState();
    renderLibrary();
    notify('Document restored as Draft.');
  }

  function deleteForever(id) {
    var document = findDocument(id);
    if (!document || !window.confirm('Permanently delete “' + document.title + '”? This cannot be undone.')) return;
    state.documents = state.documents.filter(function (item) { return item.id !== id; });
    saveState();
    renderLibrary();
    notify('Document permanently deleted.');
  }

  function preparePrint(document) {
    $('#standards-print').innerHTML = '<article class="print-document"><h1>' + esc(document.title) + '</h1><p class="print-meta">' + esc(types[document.type]) + ' · Updated ' + esc(dateLabel(document.updatedAt)) + '</p><p class="print-description">' + esc(document.description || '') + '</p>' + (document.sections || []).map(function (section) { return '<section><h2>' + esc(section.title) + '</h2><ul class="' + (document.type === 'checklist' ? 'print-checklist' : '') + '">' + (section.rules || []).map(function (rule) { return '<li>' + esc(rule) + '</li>'; }).join('') + '</ul></section>'; }).join('') + '</article>';
  }

  function handleAction(action, id) {
    if (action === 'use-template') return useTemplate(id);
    if (action === 'preview-template') return showDetail(templateById(id), true);
    if (action === 'open') return showDetail(findDocument(id), false);
    if (action === 'edit') return openEditor(findDocument(id));
    if (action === 'publish') return publish(id);
    if (action === 'unpublish') return unpublish(id);
    if (action === 'delete') return softDelete(id);
    if (action === 'restore') return restore(id);
    if (action === 'delete-forever') return deleteForever(id);
    if (action === 'print') { preparePrint(findDocument(id)); window.print(); }
  }

  document.addEventListener('click', function (event) {
    var viewButton = event.target.closest('[data-standards-view]');
    if (viewButton) { view = viewButton.dataset.standardsView; renderLibrary(); return; }
    var action = event.target.closest('[data-standard-action]');
    if (action) { handleAction(action.dataset.standardAction, action.dataset.standardId); return; }
    if (event.target.closest('[data-standard-back]')) { closeDetail(); return; }
    if (event.target.closest('[data-close-standard-editor]')) { $('#standard-editor').close(); return; }
    var remove = event.target.closest('[data-remove-section]');
    if (remove) remove.closest('[data-edit-section]').remove();
  });

  $('#standards-search').addEventListener('input', function (event) { query = event.target.value; renderLibrary(); });
  $('#standards-status').addEventListener('change', function (event) { statusFilter = event.target.value; renderLibrary(); });
  $('#standards-type').addEventListener('change', function (event) { typeFilter = event.target.value; renderLibrary(); });
  $('#reset-standards-filter').addEventListener('click', function () { query = ''; statusFilter = 'all'; typeFilter = 'all'; $('#standards-search').value = ''; $('#standards-status').value = 'all'; $('#standards-type').value = 'all'; renderLibrary(); });
  $('#add-standard').addEventListener('click', function () { openEditor(null); });
  $('#add-standard-section').addEventListener('click', function () {
    var host = $('#standard-editor-sections');
    host.insertAdjacentHTML('beforeend', editSection({title:'', rules:[]}, host.children.length));
  });
  $('#standard-form').addEventListener('submit', function (event) {
    event.preventDefault();
    try {
      var values = readEditor();
      var document = editingId ? findDocument(editingId) : null;
      if (document) Object.assign(document, values, {updatedAt:today()});
      else {
        document = Object.assign(makeDocument({id:'custom', icon:'📄', title:values.title, description:values.description, type:values.type, sections:values.sections}, 'draft'), values);
        state.documents.unshift(document);
      }
      saveState();
      $('#standard-editor').close();
      view = 'documents';
      notify('Draft saved. Staff cannot see it until published.');
      showDetail(document, false);
    } catch (error) { $('#standard-error').textContent = error.message; }
  });

  saveState();
  renderLibrary();
})();
