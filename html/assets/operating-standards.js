(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const source = window.NEXORA_OPERATING_STANDARDS_DATA;
  if (!source || !$('#standards-library')) return;
  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const types = {rules:'Quy định', agreement:'Thỏa thuận', checklist:'Danh sách kiểm tra'};
  const key = 'nexora:operating-standards:v1:' + window.NEXORA_SALON_DATA.loadCatalog().salon.id;
  const editor = $('#standard-editor'), form = $('#standard-form');
  const generator = $('#standard-generator'), generatorData = window.NEXORA_STANDARD_GENERATOR;
  let generatorAnswers = null;
  let query = '', filter = 'all', editing = null, shown = null, selectedId = '', historical = false;
  const today = () => { const d = new Date(); return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-'); };
  const dateLabel = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value.split('-').reverse().join('/') : '—';
  const validDoc = doc => doc && typeof doc.id === 'string' && typeof doc.title === 'string' && Object.hasOwn(types,doc.type) && Number.isInteger(doc.version) && doc.version > 0 && Array.isArray(doc.sections) && doc.sections.length && doc.sections.every(section => section && typeof section.id === 'string' && typeof section.title === 'string' && Array.isArray(section.rules) && section.rules.every(rule => typeof rule === 'string'));
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved?.version === 1 && Array.isArray(saved.documents) && saved.documents.length && saved.documents.every(doc => validDoc(doc) && (!doc.history || Array.isArray(doc.history) && doc.history.every(validDoc)))) return saved;
    } catch (_) {}
    return {version:1, documents:clone(source.documents)};
  }
  let state = load();
  function liveTurnRules() {
    const config = window.NEXORA_TURN_SETTINGS.load();
    const ranges = ['$0–29.99', '$30–69.99', '$70–109.99', '$110 trở lên'];
    return ranges.map((range,i) => 'Giá trị dịch vụ ' + range + ': ' + config.serviceWeights[i] + ' turn.').concat([
      'Booking: ' + config.bookingTurnCredit + ' turn theo Booking Incentive Policy; áp dụng mức riêng của thợ nếu có cấu hình.',
      'Giá trị tính turn đã trừ giảm giá; không bao gồm tip, thuế, sản phẩm và thanh toán gift card.',
      'Thay đổi cấu hình chỉ áp dụng cho lượt mới. Các lượt đã ghi nhận giữ nguyên số turn.'
    ]);
  }
  function sectionsFor(doc, isHistory = false) {
    const sections = clone(doc.sections);
    if (doc.autoTurnRules) sections.splice(2,0,{id:'turn-rules', title:'Luật tính turn của tiệm', rules:isHistory ? (doc.turnRules || []) : liveTurnRules(), synced:true});
    return sections;
  }
  function documentUrl(id = '', version = '') {
    const url = new URL(location.href); url.hash = '';
    url.searchParams.delete('doc'); url.searchParams.delete('version');
    if (id) url.searchParams.set('doc',id);
    if (version) url.searchParams.set('version',version);
    return url.pathname + url.search;
  }
  function navigate(id = '', version = '') {
    history.pushState(null,'',documentUrl(id,version)); renderRoute();
    document.documentElement.scrollTop = 0; document.body.scrollTop = 0;
  }
  const badge = doc => '<span class="standard-tag ' + doc.type + '">' + types[doc.type] + '</span>';
  function refreshIcons() { if (window.lucide) window.lucide.createIcons(); }
  function renderLibrary() {
    const updated = state.documents.map(doc => doc.updatedAt).filter(Boolean).sort().at(-1) || source.sourceUpdatedAt;
    $('#library-meta').textContent = state.documents.length + ' tài liệu · Cập nhật ' + dateLabel(updated) + ' · Chọn tài liệu để đọc hoặc chỉnh sửa.';
    $('[data-filter-count="all"]').textContent = state.documents.length;
    document.querySelectorAll('[data-standard-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.standardFilter === filter)));
    const search = query.trim().toLocaleLowerCase('vi');
    const docs = state.documents.filter(doc => (filter === 'all' || doc.type === filter) && [doc.title,doc.description,...sectionsFor(doc).flatMap(section => [section.title,...section.rules])].join(' ').toLocaleLowerCase('vi').includes(search));
    $('#standards-grid').innerHTML = docs.map(doc => {
      const sections = sectionsFor(doc), count = sections.reduce((n,section) => n + section.rules.length,0);
      return '<a class="standard-card" data-standard-id="' + esc(doc.id) + '" href="' + esc(documentUrl(doc.id)) + '"><div class="standard-card-top"><span class="standard-icon" aria-hidden="true">' + esc(doc.icon || '📄') + '</span><span class="standard-open-icon" aria-hidden="true">↗</span></div><h3>' + esc(doc.title) + '</h3><p>' + esc(doc.description) + '</p><div class="standard-card-footer"><div class="standard-tags">' + badge(doc) + (doc.autoTurnRules ? '<span class="standard-tag sync">Turn tự đồng bộ</span>' : '') + '</div><div class="standard-card-count"><span>' + sections.length + ' mục · ' + count + ' điều</span><span>Bản ' + doc.version + '</span></div></div></a>';
    }).join('');
    $('#standards-empty').hidden = docs.length > 0;
  }
  function renderDetail(doc, current, isHistory) {
    const sections = sectionsFor(doc,isHistory);
    const versions = [current,...(current.history || [])].sort((a,b) => b.version - a.version);
    $('#standard-detail').innerHTML = '<a class="standard-back" data-standard-back href="' + esc(documentUrl()) + '">← Bộ tiêu chuẩn vận hành</a><header class="standards-heading standard-detail-heading"><div><p class="standards-eyebrow">Tài liệu của tiệm</p><h2 id="standard-title">' + esc(doc.title) + '</h2><div class="standard-detail-meta">' + badge(doc) + '<span>Bản ' + doc.version + ' · Cập nhật ' + dateLabel(doc.updatedAt) + '</span><span>· ' + sections.length + ' mục · ' + sections.reduce((n,section) => n + section.rules.length,0) + ' điều</span></div><p>' + esc(doc.description) + '</p></div><div class="standards-actions"><button class="standard-button" data-print-standard><i data-lucide="printer" aria-hidden="true"></i>In tài liệu</button>' + (!isHistory && doc.id === 'noiquy' ? '<button class="standard-button" data-generate-standard><i data-lucide="sparkles" aria-hidden="true"></i>Tạo lại / đổi mẫu</button>' : '') + (!isHistory ? '<button class="standard-button primary" data-edit-standard><i data-lucide="pencil" aria-hidden="true"></i>Sửa tài liệu</button>' : '') + '</div></header>' + (isHistory ? '<p class="standard-history-note">Bạn đang xem bản ' + doc.version + '. <a href="' + esc(documentUrl(current.id)) + '" data-standard-id="' + esc(current.id) + '">Xem bản mới nhất →</a></p>' : '') + '<div class="standard-detail-layout"><aside class="standard-toc"><h3>Trong tài liệu này</h3><nav aria-label="Mục lục">' + sections.map((section,i) => '<a href="#standard-section-' + esc(section.id) + '"><span>' + (i+1) + '</span>' + esc(section.title) + '</a>').join('') + '</nav><label>Phiên bản<select id="standard-version" aria-label="Phiên bản tài liệu">' + versions.map(version => '<option value="' + version.version + '"' + (version.version === doc.version ? ' selected' : '') + '>Bản ' + version.version + (version.version === current.version ? ' · Hiện tại' : ' · ' + dateLabel(version.updatedAt)) + '</option>').join('') + '</select></label></aside><div class="standard-sections">' + sections.map((section,i) => '<section class="standard-section" id="standard-section-' + esc(section.id) + '"' + (section.synced && !isHistory ? ' data-live-turn-rules' : '') + '><div class="standard-section-heading"><span class="standard-section-number">' + (i+1) + '</span><h3>' + esc(section.title) + '</h3>' + (section.synced ? '<span class="standard-tag sync">' + (isHistory ? 'Cấu hình lúc lưu bản' : 'Theo cấu hình hiện tại') + '</span>' : '') + '</div><ul class="standard-rules' + (doc.type === 'checklist' ? ' is-checklist' : '') + '">' + section.rules.map(rule => '<li><span>' + esc(rule) + '</span></li>').join('') + '</ul>' + (section.synced ? '<p class="standard-sync-note">' + (isHistory ? 'Số turn được lưu cùng phiên bản tài liệu này.' : 'Đọc trực tiếp từ Weighted Turn Settings. Khi thay đổi mức turn, nội dung này cập nhật theo. <a href="pos-front-desk-turn-board.html">Mở Turn Board →</a>') + '</p>' : '') + '</section>').join('') + '</div></div>';
    refreshIcons();
  }
  function renderRoute() {
    const params = new URLSearchParams(location.search); selectedId = params.get('doc') || '';
    const current = state.documents.find(doc => doc.id === selectedId), version = params.get('version');
    historical = !!(current && version && Number(version) !== current.version);
    shown = current && (historical ? current.history?.find(doc => doc.version === Number(version)) : current);
    $('#standards-library').hidden = !!selectedId; $('#standard-detail').hidden = !selectedId;
    renderLibrary();
    if (!selectedId) return;
    if (!shown) { $('#standard-detail').innerHTML = '<a class="standard-back" data-standard-back href="' + esc(documentUrl()) + '">← Bộ tiêu chuẩn vận hành</a><div class="standards-empty"><h2 id="standard-title">Không tìm thấy tài liệu hoặc phiên bản</h2><p>Về bộ tài liệu để chọn một nội dung khác.</p></div>'; return; }
    renderDetail(shown,current,historical);
  }
  function editSection(section,index) {
    return '<div class="standard-edit-section" data-edit-section="' + esc(section.id) + '"><div class="standard-edit-section-top"><span>Mục <span data-section-number>' + (index+1) + '</span></span><button type="button" data-remove-section>Xóa mục</button></div><label class="standard-field">Tên mục<input data-section-title maxlength="140" value="' + esc(section.title) + '" required></label><label class="standard-field">Nội dung · mỗi dòng một điều<textarea data-section-rules rows="' + Math.min(10,Math.max(4,section.rules.length+1)) + '" required>' + esc(section.rules.join('\n')) + '</textarea></label></div>';
  }
  function openEditor(doc, generated = false) {
    editing = doc ? clone(doc) : {id:null,title:'',description:'',type:'rules',icon:'📄',version:0,sections:[{id:'section-1',title:'',rules:[]}]};
    $('#standard-editor-title').textContent = generated ? 'Bản nháp nội quy tiệm' : doc ? 'Sửa tài liệu' : 'Thêm tài liệu';
    form.elements.title.value = editing.title; form.elements.type.value = editing.type; form.elements.description.value = editing.description;
    $('#standard-editor-sections').innerHTML = editing.sections.map(editSection).join('');
    $('#standard-edit-sync').hidden = !editing.autoTurnRules; $('#standard-error').textContent = '';
    editor.showModal(); $('.standard-editor-body').scrollTop = 0;
  }
  function generatorCount(sections) {
    return sections.length + ' mục · ' + sections.reduce((total, section) => total + section.rules.length, 0) + ' điều';
  }
  function openGenerator() {
    const current = state.documents.find(doc => doc.id === 'noiquy');
    generatorAnswers = clone(generatorData.validateAnswers(current?.generatorAnswers) ? current.generatorAnswers : generatorData.defaultAnswers);
    renderGenerator('pick');
    generator.showModal();
  }
  function renderGenerator(step) {
    generator.dataset.step = step;
    const content = $('#standard-generator-content'), footer = $('#standard-generator-footer');
    const back = '<button class="standard-button" type="button" id="generator-back">← Quay lại</button>';
    $('#standard-generator-description').textContent = step === 'questions'
      ? 'Trả lời 5 câu để chọn các điều phù hợp với cách vận hành của tiệm.'
      : 'Chọn một trong ba cách. Sau đó vẫn sửa và bổ sung thoải mái.';
    if (step === 'pick') {
      content.innerHTML = '<div class="generator-choices">'
        + '<button class="generator-choice" type="button" data-generator-step="templates"><span class="generator-choice-icon" aria-hidden="true">📋</span><span><strong>Dùng mẫu có sẵn</strong><span>4 mẫu viết sẵn cho tiệm nail: nhỏ, tiêu chuẩn, đông walk-in, spa cao cấp.</span></span><span class="generator-chevron" aria-hidden="true">›</span></button>'
        + '<button class="generator-choice" type="button" data-generator-step="questions"><span class="generator-choice-icon" aria-hidden="true">✨</span><span><strong>Tạo riêng cho tiệm của bạn</strong><span>Trả lời 5 câu, hệ thống lắp bản nội quy hợp quy mô và cách vận hành của tiệm.</span></span><span class="generator-chevron" aria-hidden="true">›</span></button>'
        + '<button class="generator-choice" type="button" id="generator-blank"><span class="generator-choice-icon" aria-hidden="true">✎</span><span><strong>Tự viết từ đầu</strong><span>Trang trắng, tự thêm mục và từng điều.</span></span><span class="generator-chevron" aria-hidden="true">›</span></button></div>';
      footer.innerHTML = '<button class="standard-button" type="button" data-close-standard-generator>Đóng</button>';
    } else if (step === 'templates') {
      content.innerHTML = '<div class="generator-choices">' + generatorData.presets.map(preset =>
        '<button class="generator-choice generator-template" type="button" data-generator-preset="' + esc(preset.id) + '"><span><strong>' + esc(preset.title) + '</strong><span>' + esc(preset.description) + '</span><small>' + generatorCount(generatorData.generate(preset.answers)) + '</small></span><span class="generator-chevron" aria-hidden="true">›</span></button>'
      ).join('') + '</div><p class="generator-note">Chọn mẫu để xem và chỉnh sửa bản nháp. Luật tính turn sẽ tự đồng bộ theo cấu hình tiệm.</p>';
      footer.innerHTML = back;
    } else {
      content.innerHTML = '<div class="generator-questions">' + generatorData.questions.map((question, index) =>
        '<fieldset><legend><span>' + (index + 1) + '</span>' + esc(question.title) + '</legend><div class="generator-options">' + question.options.map(option => {
          const checked = question.multiple ? generatorAnswers[question.id].includes(option.value) : generatorAnswers[question.id] === option.value;
          return '<label><input type="' + (question.multiple ? 'checkbox' : 'radio') + '" name="' + esc(question.id) + '" value="' + esc(option.value) + '"' + (checked ? ' checked' : '') + '><span>' + esc(option.label) + '</span></label>';
        }).join('') + '</div></fieldset>'
      ).join('') + '</div><div class="generator-preview" role="status" aria-live="polite"><span>Bản sẽ tạo</span><strong id="generator-summary">' + generatorCount(generatorData.generate(generatorAnswers)) + '</strong><p>Có thể sửa từng điều trước khi lưu. Luật turn tự đồng bộ theo cấu hình tiệm.</p></div>';
      footer.innerHTML = back + '<button class="standard-button primary" type="button" id="generator-generate">Tạo nội quy</button>';
    }
    content.scrollTop = 0;
    if (generator.open) content.querySelector('button,input')?.focus();
  }
  function openGeneratedDraft(sections, answers) {
    const current = state.documents.find(doc => doc.id === 'noiquy');
    const doc = current ? clone(current) : {id:'noiquy',title:'Nội quy lao động',description:'Điều thợ phải tuân thủ. Có mục luật turn tự đồng bộ với hệ thống.',type:'rules',icon:'📋',version:0};
    doc.sections = sections;
    doc.autoTurnRules = true;
    doc.generatorAnswers = clone(answers);
    generator.close();
    openEditor(doc, true);
  }
  generator.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.matches('[data-close-standard-generator]')) generator.close();
    else if (target.id === 'generator-back') renderGenerator('pick');
    else if (target.dataset.generatorStep) renderGenerator(target.dataset.generatorStep);
    else if (target.dataset.generatorPreset) {
      const preset = generatorData.presets.find(item => item.id === target.dataset.generatorPreset);
      if (preset) openGeneratedDraft(generatorData.generate(preset.answers), preset.answers);
    } else if (target.id === 'generator-generate') openGeneratedDraft(generatorData.generate(generatorAnswers), generatorAnswers);
    else if (target.id === 'generator-blank') openGeneratedDraft([{id:'section-1',title:'',rules:[]}], generatorAnswers);
  });
  generator.addEventListener('change', event => {
    const question = generatorData.questions.find(item => item.id === event.target.name);
    if (!question) return;
    generatorAnswers[question.id] = question.multiple
      ? [...generator.querySelectorAll('input[name="' + question.id + '"]:checked')].map(input => input.value)
      : event.target.value;
    $('#generator-summary').textContent = generatorCount(generatorData.generate(generatorAnswers));
  });
  function readDraft() {
    return {title:form.elements.title.value.trim(),type:form.elements.type.value,description:form.elements.description.value.trim(),sections:Array.from(document.querySelectorAll('[data-edit-section]'),section => ({id:section.dataset.editSection,title:section.querySelector('[data-section-title]').value.trim(),rules:section.querySelector('[data-section-rules]').value.split('\n').map(rule => rule.trim()).filter(Boolean)}))};
  }
  const editable = doc => ({title:doc.title,type:doc.type,description:doc.description,sections:doc.sections});
  function saveDocument() {
    const draft = readDraft();
    if (!draft.title) { $('#standard-error').textContent = 'Nhập tên tài liệu.'; form.elements.title.focus(); return; }
    if (!draft.sections.length || draft.sections.some(section => !section.title || !section.rules.length)) { $('#standard-error').textContent = 'Mỗi mục cần có tên và ít nhất một điều.'; return; }
    const current = state.documents.find(doc => doc.id === editing.id);
    if (editing.id && (editing.version ? !current || current.version !== editing.version : current)) { $('#standard-error').textContent = 'Tài liệu đã thay đổi ở cửa sổ khác. Đóng và mở lại bản mới trước khi sửa.'; return; }
    if (current && JSON.stringify(editable(current)) === JSON.stringify(draft)) { editor.close(); $('#standards-feedback').textContent = 'Nội dung không thay đổi.'; return; }
    const archived = current ? clone(current) : null;
    if (archived) { delete archived.history; if (archived.autoTurnRules) archived.turnRules = liveTurnRules(); }
    const id = editing.id || 'doc-' + (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36));
    const nextDoc = {...editing,...draft,id,version:(current?.version || 0)+1,updatedAt:today(),history:current ? [...(current.history || []),archived] : []};
    const next = {version:1,documents:current ? state.documents.map(doc => doc.id === id ? nextDoc : doc) : [...state.documents,nextDoc]};
    try { localStorage.setItem(key,JSON.stringify(next)); }
    catch (_) { $('#standard-error').textContent = 'Chưa lưu được tài liệu. Bộ nhớ trình duyệt không khả dụng hoặc đã đầy. Vui lòng thử lại.'; return; }
    state = next; editor.close(); navigate(id); $('#standards-feedback').textContent = 'Đã lưu ' + nextDoc.title + ' · Bản ' + nextDoc.version + '.';
  }
  function preparePrint(docs, isHistory = false) {
    $('#standards-print').innerHTML = docs.map(doc => '<article class="print-document"><h1>' + esc(doc.title) + '</h1><p class="print-meta">' + types[doc.type] + ' · Bản ' + doc.version + ' · ' + dateLabel(doc.updatedAt) + '</p><p class="print-description">' + esc(doc.description) + '</p>' + sectionsFor(doc,isHistory).map((section,i) => '<section><h2>' + (i+1) + '. ' + esc(section.title) + '</h2><ul' + (doc.type === 'checklist' ? ' class="print-checklist"' : '') + '>' + section.rules.map(rule => '<li>' + esc(rule) + '</li>').join('') + '</ul>' + (section.synced ? '<p class="print-sync-note">' + (isHistory ? 'Cấu hình đã lưu cùng phiên bản tài liệu.' : 'Theo cấu hình turn tại thời điểm in: ' + dateLabel(today()) + '.') + '</p>' : '') + '</section>').join('') + '</article>').join('');
  }
  function printDocuments(docs,isHistory = false) { preparePrint(docs,isHistory); window.print(); }
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-standard-id], [data-standard-back]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
    event.preventDefault(); navigate(link.dataset.standardId || '');
  });
  $('#standards-search').addEventListener('input', event => { query = event.target.value; renderLibrary(); });
  document.querySelectorAll('[data-standard-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.standardFilter; renderLibrary(); }));
  $('#reset-standards-filter').addEventListener('click', () => { filter = 'all'; query = ''; $('#standards-search').value = ''; renderLibrary(); });
  $('#add-standard').addEventListener('click', () => openEditor());
  $('#create-standard-rules').addEventListener('click', openGenerator);
  $('#print-library').addEventListener('click', () => printDocuments(state.documents));
  $('#standard-detail').addEventListener('click', event => {
    if (event.target.closest('[data-generate-standard]') && shown?.id === 'noiquy' && !historical) openGenerator();
    if (event.target.closest('[data-edit-standard]') && shown && !historical) openEditor(shown);
    if (event.target.closest('[data-print-standard]') && shown) printDocuments([shown],historical);
  });
  $('#standard-detail').addEventListener('change', event => { if (event.target.id === 'standard-version') navigate(selectedId,event.target.value); });
  document.querySelectorAll('[data-close-standard-editor]').forEach(button => button.addEventListener('click', () => editor.close()));
  $('#add-standard-section').addEventListener('click', () => {
    const count = document.querySelectorAll('[data-edit-section]').length;
    const id = 'section-' + Date.now().toString(36) + '-' + count;
    $('#standard-editor-sections').insertAdjacentHTML('beforeend',editSection({id,title:'',rules:[]},count));
    document.querySelector('[data-edit-section="' + id + '"] [data-section-title]').focus();
  });
  $('#standard-editor-sections').addEventListener('click', event => {
    const button = event.target.closest('[data-remove-section]'); if (!button) return;
    button.closest('[data-edit-section]').remove();
    document.querySelectorAll('[data-section-number]').forEach((number,i) => { number.textContent = i+1; });
  });
  form.addEventListener('submit', event => { event.preventDefault(); saveDocument(); });
  window.addEventListener('popstate', () => { if (editor.open) editor.close(); if (generator.open) generator.close(); renderRoute(); });
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) { state = load(); renderRoute(); } });
  window.NEXORA_TURN_SETTINGS.subscribe(() => { renderRoute(); });
  window.addEventListener('beforeprint', () => { preparePrint(shown ? [shown] : state.documents,historical); });
  function revealActiveSettingsTab() {
    const nav = $('.salon-tabs'), active = nav.querySelector('[aria-current="page"]');
    if (nav.scrollWidth > nav.clientWidth && active) nav.scrollLeft = active.offsetLeft - nav.offsetLeft;
  }
  window.addEventListener('resize', revealActiveSettingsTab);
  renderRoute(); revealActiveSettingsTab();
})();
