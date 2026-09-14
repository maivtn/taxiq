(function(global) {
  'use strict';

  var MAX_FILES = 5;
  var MAX_BYTES = 5000000;
  var SAMPLE_FILES = ['Salon policies.pdf', 'Services & aftercare.docx', 'Frequently asked questions.txt'];

  function initialize(doc, host) {
    doc = doc || global.document;
    host = host || global;
    var root = doc && doc.querySelector('[data-settings-knowledge]');
    if (!root) return null;
    if (root.__knowledge) return root.__knowledge;

    var input = root.querySelector('[data-knowledge-input]');
    var upload = root.querySelector('[data-knowledge-upload]');
    var browse = root.querySelector('[data-knowledge-browse]');
    var dropzone = root.querySelector('[data-knowledge-dropzone]');
    var list = root.querySelector('[data-knowledge-list]');
    var errors = root.querySelector('[data-knowledge-errors]');
    var status = root.querySelector('[data-knowledge-status]');
    var files = [];
    var loading = true;
    var sequence = 0;
    var dragDepth = 0;
    var confirming = false;

    function element(tag, className, text) {
      var node = doc.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }

    function icon(name) {
      var node = element('i', 'bi bi-' + name);
      node.setAttribute('aria-hidden', 'true');
      return node;
    }

    function formatSize(size) {
      return size >= 1000000 ? (size / 1000000).toFixed(1) + ' MB' : Math.max(0.1, size / 1000).toFixed(1) + ' KB';
    }

    function showErrors(messages) {
      errors.replaceChildren();
      errors.hidden = messages.length === 0;
      if (!messages.length) return;
      errors.appendChild(element('strong', '', 'Some files could not be added'));
      var items = element('ul');
      messages.forEach(function(message) { items.appendChild(element('li', '', message)); });
      errors.appendChild(items);
      var dismiss = element('button', 'knowledge-text-button', 'Dismiss');
      dismiss.type = 'button';
      dismiss.addEventListener('click', function() { showErrors([]); upload.focus(); });
      errors.appendChild(dismiss);
    }

    function notify(message) {
      status.textContent = message;
      if (host.Swal && !confirming) {
        host.Swal.fire({
          toast: true, position: 'bottom-end', icon: 'success', titleText: message,
          showConfirmButton: false, timer: 3500, timerProgressBar: true,
          customClass: { popup: 'knowledge-swal' }
        });
      }
    }

    function rowFor(item) {
      var extension = item.file.name.split('.').pop().toLowerCase();
      var row = element('div', 'knowledge-file-row');
      row.setAttribute('role', 'row');
      row.setAttribute('data-knowledge-file', item.id);
      var info = element('div', 'knowledge-file-info');
      info.setAttribute('role', 'cell');
      var fileIcon = element('span', 'knowledge-file-icon file-' + extension);
      fileIcon.setAttribute('aria-hidden', 'true');
      fileIcon.append(icon('file-earmark-text'), element('span', '', extension.toUpperCase()));
      var copy = element('div', 'knowledge-file-copy');
      var name = element('strong', '', item.file.name);
      name.setAttribute('data-knowledge-name', '');
      name.title = item.file.name;
      var meta = element('div', 'knowledge-file-meta');
      meta.appendChild(element('span', '', formatSize(item.file.size)));
      if (item.sample) {
        var badge = element('span', 'knowledge-sample', 'Sample');
        badge.setAttribute('data-knowledge-sample', '');
        meta.appendChild(badge);
      }
      copy.append(name, meta);
      info.append(fileIcon, copy);
      var date = element('div', 'knowledge-file-date');
      date.setAttribute('role', 'cell');
      var timeZoneInput = doc.querySelector('[aria-label="Operating hours time zone"]');
      var dateOptions = { month: 'short', day: '2-digit', year: 'numeric' };
      if (timeZoneInput && timeZoneInput.value) dateOptions.timeZone = timeZoneInput.value;
      date.textContent = new Intl.DateTimeFormat('en-US', dateOptions).format(item.uploaded);
      var state = element('div', 'knowledge-file-state');
      state.setAttribute('role', 'cell');
      var pill = element('span', 'knowledge-status-pill' + (item.processing ? ' is-processing' : ''));
      pill.append(icon(item.processing ? 'hourglass-split' : 'check-circle'), doc.createTextNode(item.processing ? 'Processing…' : 'Uploaded'));
      state.appendChild(pill);
      var actions = element('div', 'knowledge-file-actions');
      actions.setAttribute('role', 'cell');
      [['download', 'Download', 'download'], ['delete', 'Delete', 'trash3']].forEach(function(action) {
        var button = element('button');
        button.type = 'button';
        button.setAttribute('data-knowledge-' + action[0], item.id);
        button.setAttribute('aria-label', action[1] + ' ' + item.file.name);
        button.append(icon(action[2]), doc.createTextNode(action[1]));
        actions.appendChild(button);
      });
      row.append(info, date, state, actions);
      return row;
    }

    function render() {
      var full = files.length >= MAX_FILES;
      var focused = doc.activeElement;
      var focusAction = focused && (focused.hasAttribute('data-knowledge-delete') ? 'delete' : focused.hasAttribute('data-knowledge-download') ? 'download' : null);
      var focusId = focusAction && focused.getAttribute('data-knowledge-' + focusAction);
      upload.disabled = browse.disabled = loading || full;
      input.disabled = loading || full;
      root.querySelector('[data-knowledge-count]').textContent = files.length + ' of 5 files';
      root.querySelector('[data-knowledge-availability]').textContent = loading ? 'Loading sample files…' : full ? 'File limit reached' : (MAX_FILES - files.length) + ' slots available';
      root.querySelectorAll('.knowledge-capacity-bars i').forEach(function(bar, index) { bar.classList.toggle('is-filled', index < files.length); });
      dropzone.classList.toggle('is-full', full);
      dropzone.setAttribute('aria-disabled', String(loading || full));
      root.querySelector('[data-knowledge-drop-title]').textContent = full ? 'File limit reached' : 'Drag and drop your files here';
      var help = root.querySelector('[data-knowledge-drop-help]');
      if (full) help.replaceChildren(doc.createTextNode('Delete a file below to add a new one.'));
      else help.replaceChildren(doc.createTextNode('or '), browse);
      root.querySelector('[data-knowledge-loading]').hidden = !loading;
      root.querySelector('[data-knowledge-empty]').hidden = loading || files.length > 0;
      root.querySelector('[data-knowledge-table]').hidden = files.length === 0;
      list.replaceChildren();
      files.forEach(function(item) { list.appendChild(rowFor(item)); });
      if (focusAction) {
        var replacement = list.querySelector('[data-knowledge-' + focusAction + '="' + focusId + '"]');
        if (replacement) replacement.focus();
      }
    }

    function entry(file, sample, uploaded) {
      return { id: 'knowledge-' + (++sequence), file: file, sample: !!sample, uploaded: uploaded || new Date(), processing: !sample };
    }

    async function addFiles(selected) {
      var incoming = Array.from(selected || []);
      if (loading || !incoming.length) return;
      var available = MAX_FILES - files.length;
      if (incoming.length > available) {
        showErrors(['You can add ' + available + ' more file' + (available === 1 ? '' : 's') + '. Maximum 5 files in total.']);
        return;
      }
      var names = new Set(files.map(function(item) { return item.file.name.toLowerCase(); }));
      var messages = [];
      var added = [];
      incoming.forEach(function(file) {
        var problem = '';
        if (!/\.(docx|txt|pdf)$/i.test(file.name)) problem = 'Only PDF, DOCX, and TXT files are supported.';
        else if (file.size > MAX_BYTES) problem = 'File exceeds the 5 MB limit.';
        else if (!file.size) problem = 'This file is empty.';
        else if (names.has(file.name.toLowerCase())) problem = 'A file with this name already exists.';
        if (problem) { messages.push(file.name + ': ' + problem); return; }
        names.add(file.name.toLowerCase());
        added.push(entry(file, false));
      });
      showErrors(messages);
      if (!added.length) return;
      files = files.concat(added);
      render();
      notify(added.length + ' file' + (added.length === 1 ? '' : 's') + ' added to this tab.');
      await new Promise(function(resolve) { host.setTimeout(resolve, 1800); });
      added.forEach(function(item) { item.processing = false; });
      render();
      status.textContent = 'File processing preview complete.';
    }

    function download(item) {
      if (!host.URL || !host.URL.createObjectURL) {
        showErrors(['Downloads are unavailable in this browser.']);
        return;
      }
      var url = host.URL.createObjectURL(item.file);
      var link = element('a');
      link.href = url;
      link.download = item.file.name;
      doc.body.appendChild(link);
      link.click();
      link.remove();
      host.setTimeout(function() { host.URL.revokeObjectURL(url); }, 30000);
      notify('Downloaded ' + item.file.name + '.');
    }

    async function remove(item) {
      if (confirming) return;
      confirming = true;
      var confirmed = false;
      try {
        if (host.Swal) {
          var result = await host.Swal.fire({
            icon: 'warning', titleText: 'Delete this file?',
            text: 'Remove ' + item.file.name + ' from this tab? You can upload it again later.',
            showCancelButton: true, confirmButtonText: 'Delete file', cancelButtonText: 'Cancel',
            focusCancel: true, confirmButtonColor: '#b42318', cancelButtonColor: '#526078',
            customClass: { popup: 'knowledge-swal' }
          });
          confirmed = result.isConfirmed;
        } else {
          confirmed = host.confirm('Delete ' + item.file.name + ' from this tab?');
        }
      } finally {
        confirming = false;
      }
      if (!confirmed) return;
      files = files.filter(function(file) { return file.id !== item.id; });
      showErrors([]);
      render();
      notify('Deleted ' + item.file.name + '.');
      upload.focus();
    }

    upload.addEventListener('click', function() { input.click(); });
    browse.addEventListener('click', function() { input.click(); });
    input.addEventListener('change', function() {
      var selected = Array.from(input.files || []);
      input.value = '';
      addFiles(selected);
    });
    dropzone.addEventListener('dragenter', function(event) {
      event.preventDefault();
      dragDepth++;
      if (!loading && files.length < MAX_FILES) dropzone.classList.add('is-dragging');
    });
    dropzone.addEventListener('dragover', function(event) {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = loading || files.length >= MAX_FILES ? 'none' : 'copy';
    });
    dropzone.addEventListener('dragleave', function(event) {
      event.preventDefault();
      dragDepth = Math.max(0, dragDepth - 1);
      if (!dragDepth) dropzone.classList.remove('is-dragging');
    });
    dropzone.addEventListener('drop', function(event) {
      event.preventDefault();
      dragDepth = 0;
      dropzone.classList.remove('is-dragging');
      if (event.dataTransfer) addFiles(event.dataTransfer.files);
    });
    list.addEventListener('click', function(event) {
      var button = event.target.closest('[data-knowledge-download], [data-knowledge-delete]');
      if (!button) return;
      var id = button.getAttribute('data-knowledge-download') || button.getAttribute('data-knowledge-delete');
      var item = files.find(function(file) { return file.id === id; });
      if (!item) return;
      if (button.hasAttribute('data-knowledge-download')) download(item);
      else remove(item);
    });

    async function loadSamples() {
      render();
      var results = await Promise.allSettled(SAMPLE_FILES.map(async function(name, index) {
        var response = await host.fetch('assets/ai-knowledge/' + encodeURIComponent(name));
        if (!response.ok) throw new Error('Sample unavailable');
        var blob = await response.blob();
        if (!blob.size) throw new Error('Empty sample');
        return entry(new host.File([blob], name, { type: blob.type }), true, new Date('2026-09-' + (12 - index) + 'T16:00:00-05:00'));
      }));
      files = results.filter(function(result) { return result.status === 'fulfilled'; }).map(function(result) { return result.value; });
      loading = false;
      render();
      if (files.length !== SAMPLE_FILES.length) showErrors(['Some sample files could not be loaded. You can still upload your own documents.']);
    }

    root.__knowledge = { addFiles: addFiles, ready: null };
    root.__knowledge.ready = loadSamples();
    return root.__knowledge;
  }

  global.NEXORA_KNOWLEDGE = { initialize: initialize };
  if (global.document) {
    if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', function() { initialize(); });
    else initialize();
  }
})(typeof window !== 'undefined' ? window : globalThis);
