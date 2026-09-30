(function () {
  'use strict';

  var source = window.NEXORA_OPERATING_STANDARDS_DATA;
  var list = document.querySelector('[data-handbook-list]');
  var reader = document.querySelector('[data-handbook-reader]');
  if (!source || !list || !reader) return;

  var types = {rules: 'Rules', agreement: 'Agreement', checklist: 'Checklist'};
  var searchInput = document.querySelector('[data-handbook-search]');
  var typeSelect = document.querySelector('[data-handbook-type]');
  var salonSelect = document.querySelector('[data-handbook-salon]');
  var page = document.querySelector('.handbook-page');
  var layout = document.querySelector('.handbook-layout');
  var selectedId = '';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character];
    });
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function linkedSalons() {
    return [
      {id:'bitcoin-nail-bar-houston', name:'Bitcoin Nail Bar'},
      {id:'golden-nails-spa', name:'Golden Nails & Spa'},
      {id:'elite-beauty-lounge', name:'Elite Beauty Lounge'}
    ];
  }

  function storedDocuments(salonId) {
    try {
      var saved = JSON.parse(localStorage.getItem('nexora:operating-standards:v2:' + salonId));
      if (saved && Array.isArray(saved.documents)) return saved.documents;
    } catch (error) {}
    var demoPublishedIds = {
      'bitcoin-nail-bar-houston':['noiquy', 'vesinh'],
      'golden-nails-spa':['noiquy', 'khan', 'vesinh', 'donban', 'mocua'],
      'elite-beauty-lounge':['noiquy', 'vesinh', 'phannan', 'thomoi']
    };
    var allowed = demoPublishedIds[salonId];
    return clone((source.documents || []).filter(function (document) {
      return !allowed || allowed.indexOf(document.id) !== -1;
    }));
  }

  function publishedDocument(document) {
    if (!document || document.deletedAt || document.status === 'deleted') return null;
    if (document.publishedSnapshot) return Object.assign({}, clone(document), clone(document.publishedSnapshot), {status:'published'});
    if (document.publishedDocument) return Object.assign({}, clone(document), clone(document.publishedDocument), {status:'published'});
    if (document.status && document.status !== 'published') return null;
    if (document.published === false) return null;
    return Object.assign({}, clone(document), {status:'published'});
  }

  function documentsForSalon(salonId) {
    return storedDocuments(salonId).map(publishedDocument).filter(function (document) {
      return document && document.title && Array.isArray(document.sections) && document.sections.length;
    });
  }

  var salons = linkedSalons();
  var activeSalonId = salons[0].id;
  try {
    var savedSalonId = sessionStorage.getItem('nexora:staff-handbook:salon');
    if (salons.some(function (salon) { return salon.id === savedSalonId; })) activeSalonId = savedSalonId;
  } catch (error) {}
  var documents = documentsForSalon(activeSalonId);

  function formatDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return '—';
    var parts = value.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric', year:'numeric'}).format(new Date(parts[0], parts[1] - 1, parts[2]));
  }

  function searchableText(document) {
    return [document.title, document.description].concat(document.sections.reduce(function (items, section) {
      return items.concat(section.title, section.rules || []);
    }, [])).join(' ').toLocaleLowerCase('vi');
  }

  function filteredDocuments() {
    var query = searchInput.value.trim().toLocaleLowerCase('vi');
    var type = typeSelect.value;
    return documents.filter(function (document) {
      return (type === 'all' || document.type === type) && (!query || searchableText(document).includes(query));
    });
  }

  function typeBadge(document) {
    return '<span class="handbook-type is-' + escapeHtml(document.type) + '">' + escapeHtml(types[document.type] || 'Document') + '</span>';
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  function setMobileReading(reading) {
    page.classList.toggle('is-reading', reading);
    layout.classList.toggle('is-reading', reading);
  }

  function renderList() {
    var filtered = filteredDocuments();
    if (selectedId && !filtered.some(function (document) { return document.id === selectedId; })) {
      selectedId = '';
      setMobileReading(false);
    }
    document.querySelector('[data-handbook-count]').textContent = documents.length;
    document.querySelector('[data-handbook-result-count]').textContent = filtered.length;
    document.querySelector('[data-handbook-empty]').hidden = filtered.length > 0;
    list.hidden = filtered.length === 0;
    list.innerHTML = filtered.map(function (document) {
      return '<button class="handbook-card' + (selectedId === document.id ? ' is-active' : '') + '" type="button" data-handbook-document="' + escapeHtml(document.id) + '">' +
        '<span class="handbook-card-icon" aria-hidden="true">' + escapeHtml(document.icon || '📄') + '</span>' +
        '<span class="handbook-card-copy"><strong>' + escapeHtml(document.title) + '</strong><span class="handbook-card-meta">' + typeBadge(document) + '<span>' + document.sections.length + ' sections</span></span></span>' +
        '<i data-lucide="chevron-right" aria-hidden="true"></i></button>';
    }).join('');
    renderReader();
    refreshIcons();
  }

  function renderReader() {
    var document = documents.find(function (item) { return item.id === selectedId; });
    if (!document) {
      reader.innerHTML = '<div class="handbook-reader-empty"><span><i data-lucide="book-open" aria-hidden="true"></i></span><h2>Select a handbook document</h2><p>Choose a published document to read the current content.</p></div>';
      refreshIcons();
      return;
    }

    var sectionCount = document.sections.length;
    var itemCount = document.sections.reduce(function (total, section) { return total + (section.rules || []).length; }, 0);
    var toc = document.sections.map(function (section, index) {
      return '<a href="#handbook-section-' + escapeHtml(document.id) + '-' + index + '">' + (index + 1) + '. ' + escapeHtml(section.title) + '</a>';
    }).join('');
    var sections = document.sections.map(function (section, index) {
      var rules = (section.rules || []).map(function (rule) { return '<li>' + escapeHtml(rule) + '</li>'; }).join('');
      return '<section class="handbook-section" id="handbook-section-' + escapeHtml(document.id) + '-' + index + '"><h3><span class="handbook-section-number">' + (index + 1) + '</span>' + escapeHtml(section.title) + '</h3><ul class="handbook-rules' + (document.type === 'checklist' ? ' is-checklist' : '') + '">' + rules + '</ul></section>';
    }).join('');

    reader.innerHTML = '<button class="handbook-reader-back" type="button" data-handbook-back><i data-lucide="arrow-left" aria-hidden="true"></i>All documents</button><header class="handbook-reader-head"><div class="handbook-reader-title"><span class="handbook-reader-icon" aria-hidden="true">' + escapeHtml(document.icon || '📄') + '</span><div><h2>' + escapeHtml(document.title) + '</h2><p>' + escapeHtml(document.description || '') + '</p><div class="handbook-reader-meta"><span class="handbook-published"><i data-lucide="badge-check" aria-hidden="true"></i>Published</span>' + typeBadge(document) + '<span>Updated ' + escapeHtml(formatDate(document.updatedAt)) + '</span><span>' + sectionCount + ' sections · ' + itemCount + ' items</span></div></div></div><button class="handbook-print" type="button" data-handbook-print><i data-lucide="printer" aria-hidden="true"></i>Print</button></header><div class="handbook-reader-body"><div class="handbook-toc"><strong>In this document</strong><nav aria-label="Document sections">' + toc + '</nav></div>' + sections + '</div>';
    refreshIcons();
  }

  list.addEventListener('click', function (event) {
    var button = event.target.closest('[data-handbook-document]');
    if (!button) return;
    selectedId = button.dataset.handbookDocument;
    setMobileReading(true);
    renderList();
    if (window.matchMedia('(max-width: 760px)').matches) window.scrollTo({top:0, behavior:'smooth'});
  });

  searchInput.addEventListener('input', renderList);
  typeSelect.addEventListener('change', renderList);
  document.querySelector('[data-handbook-reset]').addEventListener('click', function () {
    searchInput.value = '';
    typeSelect.value = 'all';
    renderList();
    searchInput.focus();
  });
  reader.addEventListener('click', function (event) {
    if (event.target.closest('[data-handbook-print]')) window.print();
    if (event.target.closest('[data-handbook-back]')) {
      setMobileReading(false);
      window.scrollTo({top:0, behavior:'smooth'});
    }
  });

  salonSelect.innerHTML = salons.map(function (salon) {
    return '<option value="' + escapeHtml(salon.id) + '"' + (salon.id === activeSalonId ? ' selected' : '') + '>' + escapeHtml(salon.name) + '</option>';
  }).join('');
  salonSelect.addEventListener('change', function () {
    activeSalonId = salonSelect.value;
    try { sessionStorage.setItem('nexora:staff-handbook:salon', activeSalonId); } catch (error) {}
    documents = documentsForSalon(activeSalonId);
    selectedId = documents.length ? documents[0].id : '';
    searchInput.value = '';
    typeSelect.value = 'all';
    setMobileReading(false);
    renderList();
  });
  var params = new URLSearchParams(window.location.search);
  var requestedDocument = params.get('doc');
  if (documents.some(function (document) { return document.id === requestedDocument; })) {
    selectedId = requestedDocument;
    setMobileReading(true);
  }
  else if (documents.length) selectedId = documents[0].id;
  renderList();
})();
