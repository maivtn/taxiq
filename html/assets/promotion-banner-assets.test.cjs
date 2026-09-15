const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync, existsSync} = require('node:fs');
const {File} = require('node:buffer');
const vm = require('node:vm');
const path = require('node:path');

const sourcePath = path.join(__dirname, 'promotion-banner-assets.js');
const source = existsSync(sourcePath) ? readFileSync(sourcePath, 'utf8') : '';

function database(options = {}) {
  const records = new Map();
  const db = {
    objectStoreNames: {contains() {return true;}},
    close() {},
    transaction(_name, mode) {
      const transaction = {error: null};
      const store = {};
      for (const action of ['put', 'get', 'delete']) store[action] = value => {
        const request = {};
        setImmediate(() => {
          if (action === 'get') request.result = records.get(value);
          request.onsuccess?.();
          setImmediate(() => {
            if (mode === 'readwrite' && options.failWrite) {
              transaction.error = new Error('Quota exceeded');
              transaction.onabort?.();
              return;
            }
            if (action === 'put') records.set(value.id, structuredClone(value));
            if (action === 'delete') records.delete(value);
            transaction.oncomplete?.();
          });
        });
        return request;
      };
      transaction.objectStore = () => store;
      return transaction;
    }
  };
  return {records, open() {
    if (options.throwOpen) throw new Error('Storage blocked');
    const request = {};
    setImmediate(() => {
      if (options.failOpen) {request.error = new Error('Storage blocked');request.onerror?.();}
      else {request.result = db;request.onsuccess?.();}
    });
    return request;
  }};
}

function boot(options = {}) {
  const indexedDB = options.database || database(options);
  const liveUrls = new Map();
  let sequence = 0;
  class Image {
    constructor() {this.naturalWidth = 1200;this.naturalHeight = 600;}
    set src(value) {
      if (!value) return;
      setImmediate(() => options.decodeFails ? this.onerror?.() : this.onload?.());
    }
  }
  const context = vm.createContext({Blob, File, Image, indexedDB, setTimeout, clearTimeout,
    crypto: {randomUUID: () => 'asset-' + (++sequence)},
    URL: {
      createObjectURL(blob) {const url = 'blob:local/' + (++sequence);liveUrls.set(url, blob);return url;},
      revokeObjectURL(url) {liveUrls.delete(url);}
    }
  });
  vm.runInContext(source, context);
  const api = context.NEXORA_PROMOTION_ASSETS;
  assert.ok(api, 'the banner asset API is available');
  return {api, indexedDB, liveUrls};
}

test('only nonempty PNG, JPEG and WebP files up to 8 MiB are accepted', async () => {
  const {api} = boot();
  for (const type of ['image/png', 'image/jpeg', 'image/webp']) {
    assert.equal(api.validateFile(new File(['image'], 'banner', {type})).ok, true);
  }
  const inputs = [
    [new File(['svg'], 'banner.svg', {type: 'image/svg+xml'}), 'type'],
    [new File(['html'], 'banner.png', {type: 'text/html'}), 'type'],
    [new File([], 'banner.png', {type: 'image/png'}), 'empty'],
    [new File([new Uint8Array(8 * 1024 * 1024 + 1)], 'banner.png', {type: 'image/png'}), 'size']
  ];
  for (const [file, code] of inputs) {
    assert.equal(api.validateFile(file).code, code);
    await assert.rejects(api.importFile(file), error => error.code === code);
  }
  assert.equal(api.validateFile(new File([new Uint8Array(8 * 1024 * 1024)], 'limit.webp', {type: 'image/webp'})).ok, true);
});

test('an image decode failure rejects the upload and revokes its temporary URL', async () => {
  const {api, indexedDB, liveUrls} = boot({decodeFails: true});
  await assert.rejects(api.importFile(new File(['corrupt'], 'fake.png', {type: 'image/png'})), error => error.code === 'decode');
  assert.equal(indexedDB.records.size, 0);
  assert.equal(liveUrls.size, 0);
});

test('a saved upload survives a new page instance with its full original Blob', async () => {
  const first = boot();
  const file = new File(['full-original-image'], 'My banner.webp', {type: 'image/webp'});
  const asset = await first.api.importFile(file);
  assert.ok(asset.id);
  assert.equal(asset.name, 'My banner.webp');
  assert.equal(await first.liveUrls.get(asset.url).text(), 'full-original-image');
  assert.equal(await first.api.getUrl(asset.id), asset.url);
  const restored = boot({database: first.indexedDB});
  const restoredUrl = await restored.api.getUrl(asset.id);
  assert.equal(await restored.liveUrls.get(restoredUrl).text(), 'full-original-image');
  assert.equal(restored.liveUrls.get(restoredUrl).type, 'image/webp');
});

test('a transaction abort never reports an upload as saved and leaves no URL behind', async () => {
  const {api, indexedDB, liveUrls} = boot({failWrite: true});
  await assert.rejects(api.importFile(new File(['image'], 'banner.png', {type: 'image/png'})), error => error.code === 'storage');
  assert.equal(indexedDB.records.size, 0);
  assert.equal(liveUrls.size, 0);
});

test('unavailable IndexedDB rejects upload and can be retried after access recovers', async () => {
  const options = {throwOpen: true};
  const db = database(options);
  const {api} = boot({database: db});
  const file = new File(['image'], 'banner.jpg', {type: 'image/jpeg'});
  await assert.rejects(api.importFile(file), error => error.code === 'storage');
  options.throwOpen = false;
  const asset = await api.importFile(file);
  assert.ok(await api.getUrl(asset.id));
});

test('releasing URLs keeps stored assets while discarding removes them', async () => {
  const {api, liveUrls} = boot();
  const asset = await api.importFile(new File(['image'], 'banner.png', {type: 'image/png'}));
  api.release(asset.id);
  assert.equal(liveUrls.has(asset.url), false);
  const nextUrl = await api.getUrl(asset.id);
  assert.notEqual(nextUrl, asset.url);
  await api.discard(asset.id);
  assert.equal(liveUrls.has(nextUrl), false);
  await assert.rejects(api.getUrl(asset.id), error => error.code === 'missing');
});

test('releasing all preview URLs does not remove persisted banner data', async () => {
  const {api, liveUrls} = boot();
  const file = new File(['image'], 'banner.png', {type: 'image/png'});
  const first = await api.importFile(file), second = await api.importFile(file);
  api.release();
  assert.equal(liveUrls.size, 0);
  assert.ok(await api.getUrl(first.id));
  assert.ok(await api.getUrl(second.id));
});
