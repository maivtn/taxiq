(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.NEXORA_PROMOTION_ASSETS = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  var MAX_FILE_BYTES = 8 * 1024 * 1024;
  var DATABASE_NAME = 'nexora:promotion-banner-assets:v1';
  var STORE_NAME = 'banners';
  var MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
  var urls = new Map();
  var opening = null;
  var messages = {
    type: 'Choose a PNG, JPG or WebP image.',
    empty: 'This image file is empty. Choose another image.',
    size: 'Choose an image no larger than 8 MB.',
    decode: 'This file cannot be opened as an image. Choose another image.',
    storage: 'The image could not be saved or loaded. Check browser storage and try again.',
    missing: 'This banner image is no longer available. Upload it again.'
  };

  function failure(code) {
    var error = new Error(messages[code]);
    error.code = code;
    return error;
  }

  function validateFile(file) {
    var code = !file || MIME_TYPES.indexOf(file.type) < 0 ? 'type'
      : !Number.isFinite(file.size) || file.size <= 0 ? 'empty'
      : file.size > MAX_FILE_BYTES ? 'size' : '';
    return {ok: !code, code: code, message: messages[code] || ''};
  }

  function decodeImage(file) {
    return new Promise(function (resolve, reject) {
      var url = '', image;
      function finish(ok) {
        if (image) {image.onload = null; image.onerror = null;}
        if (url) root.URL.revokeObjectURL(url);
        if (ok) resolve(); else reject(failure('decode'));
      }
      try {
        image = new root.Image();
        url = root.URL.createObjectURL(file);
        image.onload = function () {finish(image.naturalWidth > 0 && image.naturalHeight > 0);};
        image.onerror = function () {finish(false);};
        image.src = url;
      } catch (_error) {finish(false);}
    });
  }

  function openDatabase() {
    if (opening) return opening;
    opening = new Promise(function (resolve, reject) {
      var request;
      var failed = false;
      function fail() {failed = true; reject(failure('storage'));}
      try {
        if (!root.indexedDB) {fail(); return;}
        request = root.indexedDB.open(DATABASE_NAME, 1);
        request.onupgradeneeded = function () {
          var db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, {keyPath: 'id'});
        };
        request.onerror = fail;
        request.onblocked = fail;
        request.onsuccess = function () {
          var db = request.result;
          if (failed) {db.close(); return;}
          db.onversionchange = function () {db.close(); opening = null;};
          resolve(db);
        };
      } catch (_error) {fail();}
    }).catch(function (error) {opening = null; throw error;});
    return opening;
  }

  async function transact(mode, action, value) {
    var db = await openDatabase();
    return new Promise(function (resolve, reject) {
      try {
        var transaction = db.transaction(STORE_NAME, mode);
        var request = transaction.objectStore(STORE_NAME)[action](value);
        transaction.oncomplete = function () {resolve(request.result);};
        transaction.onerror = transaction.onabort = function () {reject(failure('storage'));};
      } catch (_error) {reject(failure('storage'));}
    });
  }

  function cacheUrl(id, blob) {
    if (!urls.has(id)) urls.set(id, root.URL.createObjectURL(blob));
    return urls.get(id);
  }

  async function importFile(file) {
    var result = validateFile(file);
    if (!result.ok) throw failure(result.code);
    await decodeImage(file);
    var id = 'banner-' + (root.crypto && typeof root.crypto.randomUUID === 'function'
      ? root.crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
    var name = String(file.name || 'Banner image');
    await transact('readwrite', 'put', {id: id, name: name, blob: file});
    return {id: id, name: name, url: cacheUrl(id, file)};
  }

  async function getUrl(id) {
    id = String(id || '');
    if (urls.has(id)) return urls.get(id);
    if (!id) throw failure('missing');
    var record = await transact('readonly', 'get', id);
    if (!record || !record.blob) throw failure('missing');
    try {return cacheUrl(id, record.blob);} catch (_error) {throw failure('storage');}
  }

  function release(id) {
    if (id == null) {
      urls.forEach(function (url) {root.URL.revokeObjectURL(url);});
      urls.clear();
      return;
    }
    id = String(id);
    if (urls.has(id)) {root.URL.revokeObjectURL(urls.get(id)); urls.delete(id);}
  }

  async function discard(id) {
    id = String(id || '');
    if (!id) return;
    await transact('readwrite', 'delete', id);
    release(id);
  }

  return {
    MAX_FILE_BYTES: MAX_FILE_BYTES,
    validateFile: validateFile,
    importFile: importFile,
    getUrl: getUrl,
    release: release,
    discard: discard
  };
});
