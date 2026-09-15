import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const SOURCE_DIR = new URL('../../../html/pages/', import.meta.url);

const PAGE_URL = new URL('./booking-book-phase-1.html', SOURCE_DIR);
const RUNTIME_URL = new URL('../assets/booking-knowledge.js', SOURCE_DIR);

async function loadFeature(t, { holdProcessing = false, samples = false } = {}) {
  const dom = new JSDOM(readFileSync(PAGE_URL, 'utf8'), {
    pretendToBeVisual: true,
    runScripts: 'outside-only',
    url: 'https://merchant.nexora.test/html/pages/booking-book-phase-1.html',
  });
  t.after(() => dom.window.close());
  const { window } = dom;
  const { document } = window;
  const root = document.querySelector('[data-settings-knowledge]');
  assert.ok(root, 'Salon Settings must contain the Knowledge feature');
  assert.ok(existsSync(RUNTIME_URL), 'booking-knowledge.js must exist');
  window.fetch = async (resource) => {
    if (!samples) throw new Error('Sample download unavailable');
    const request = new URL(resource, window.location.href);
    assert.match(request.pathname, /\/assets\/ai-knowledge\/[^/]+$/);
    const file = new URL(`./assets/ai-knowledge/${request.pathname.split('/').at(-1)}`, SOURCE_DIR);
    return {
      ok: true,
      status: 200,
      blob: async () => new window.Blob([readFileSync(file)]),
    };
  };
  window.confirm = () => true;
  const processing = [];
  const schedule = window.setTimeout.bind(window);
  window.setTimeout = (callback, delay, ...args) => {
    if (holdProcessing && delay === 1800) {
      processing.push(() => callback(...args));
      return processing.length;
    }
    return schedule(callback, delay === 1800 ? 0 : delay, ...args);
  };
  window.eval(readFileSync(RUNTIME_URL, 'utf8'));
  assert.ok(window.NEXORA_KNOWLEDGE, 'Knowledge runtime must expose its initializer');
  const controller = window.NEXORA_KNOWLEDGE.initialize(document, window);
  await controller.ready;
  return { window, document, root, controller, finishProcessing: () => processing.splice(0).forEach((run) => run()) };
}

function names(root) {
  return [...root.querySelectorAll('[data-knowledge-name]')].map((element) => element.textContent);
}

function click(window, element) {
  assert.ok(element, 'Expected clickable element');
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 10));
}

function readBytes(window, file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onload = () => resolve(Buffer.from(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

test('uploads a selected TXT file and updates its visible status and capacity', async (t) => {
  const { window, root, controller } = await loadFeature(t);
  const file = new window.File(['Hours: 9 AM–7 PM'], 'Salon hours.txt', { type: 'text/plain' });

  await controller.addFiles([file]);

  const rows = root.querySelectorAll('[data-knowledge-file]');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].querySelector('[data-knowledge-name]').textContent, 'Salon hours.txt');
  assert.match(rows[0].textContent, /Uploaded/);
  assert.match(root.querySelector('[data-knowledge-count]').textContent, /1\s*(?:of|\/)\s*5/);
  assert.match(root.querySelector('[data-knowledge-availability]').textContent, /4/);
  assert.equal(root.querySelector('[data-knowledge-empty]').hidden, true);
});

test('reserves capacity while processing and shows Uploaded only when processing finishes', async (t) => {
  const { window, root, controller, finishProcessing } = await loadFeature(t, { holdProcessing: true });
  const pending = controller.addFiles(Array.from({ length: 5 }, (_, index) => new window.File(['FAQ'], `FAQ ${index}.txt`)));

  assert.equal(root.querySelectorAll('[data-knowledge-file]').length, 5);
  assert.match(root.querySelector('[data-knowledge-file]').textContent, /Processing/);
  assert.equal(root.querySelector('[data-knowledge-upload]').disabled, true);
  await controller.addFiles([new window.File(['Extra'], 'Extra.txt')]);
  assert.equal(root.querySelectorAll('[data-knowledge-file]').length, 5);
  assert.ok(root.querySelector('[data-knowledge-errors]').textContent.trim());

  finishProcessing();
  await pending;
  for (const row of root.querySelectorAll('[data-knowledge-file]')) {
    assert.match(row.textContent, /Uploaded/);
    assert.doesNotMatch(row.textContent, /Processing/);
  }
});

test('accepts supported uppercase extensions while rejecting unsupported, empty and oversize files individually', async (t) => {
  const { window, root, controller } = await loadFeature(t);
  await controller.addFiles([
    new window.File(['Service descriptions'], 'Services.DOCX'),
    new window.File(['Hours'], 'Hours.TXT'),
    new window.File(['Unsupported'], 'unsupported.exe'),
    new window.File([], 'empty.pdf'),
    new window.File([new Uint8Array(5_000_001)], 'oversize.pdf'),
  ]);

  assert.deepEqual(names(root), ['Services.DOCX', 'Hours.TXT']);
  const errors = root.querySelector('[data-knowledge-errors]').textContent;
  assert.match(errors, /unsupported\.exe/);
  assert.match(errors, /empty\.pdf/);
  assert.match(errors, /oversize\.pdf/);
  assert.equal(root.querySelector('[data-knowledge-errors]').hidden, false);
});

test('accepts a PDF at the exact five-million-byte limit', async (t) => {
  const { window, root, controller } = await loadFeature(t);
  await controller.addFiles([new window.File([new Uint8Array(5_000_000)], 'Full menu.PDF', { type: 'application/pdf' })]);

  assert.deepEqual(names(root), ['Full menu.PDF']);
  assert.match(root.querySelector('[data-knowledge-file]').textContent, /Uploaded/);
});

test('rejects duplicate names ignoring case within the current list and the same selection', async (t) => {
  const { window, root, controller } = await loadFeature(t);
  await controller.addFiles([new window.File(['Menu'], 'Service menu.pdf')]);
  await controller.addFiles([
    new window.File(['Changed menu'], 'SERVICE MENU.PDF'),
    new window.File(['Specials'], 'Specials.txt'),
    new window.File(['Changed specials'], 'specials.TXT'),
  ]);

  assert.deepEqual(names(root), ['Service menu.pdf', 'Specials.txt']);
  const errors = root.querySelector('[data-knowledge-errors]').textContent;
  assert.match(errors, /SERVICE MENU\.PDF/);
  assert.match(errors, /specials\.TXT/);
});

test('rejects the whole selected batch when it exceeds the remaining file slots', async (t) => {
  const { window, root, controller } = await loadFeature(t);
  await controller.addFiles(['Hours', 'Menu', 'Policies'].map((name) => new window.File([name], `${name}.txt`)));
  await controller.addFiles(['Offers', 'Parking', 'Contacts'].map((name) => new window.File([name], `${name}.txt`)));

  assert.deepEqual(names(root), ['Hours.txt', 'Menu.txt', 'Policies.txt']);
  assert.match(root.querySelector('[data-knowledge-count]').textContent, /3\s*(?:of|\/)\s*5/);
  assert.match(root.querySelector('[data-knowledge-availability]').textContent, /2/);
  assert.ok(root.querySelector('[data-knowledge-errors]').textContent.trim());
});

test('binds file selection and drag-and-drop once when initialized repeatedly', async (t) => {
  const { window, document, root } = await loadFeature(t);
  window.NEXORA_KNOWLEDGE.initialize(document, window);
  const input = root.querySelector('[data-knowledge-input]');
  assert.equal(input.type, 'file');
  assert.equal(input.multiple, true);
  assert.deepEqual(input.accept.split(',').map((value) => value.trim()).sort(), ['.docx', '.pdf', '.txt']);
  let pickerClicks = 0;
  input.addEventListener('click', () => { pickerClicks += 1; });
  click(window, root.querySelector('[data-knowledge-upload]'));
  click(window, root.querySelector('[data-knowledge-browse]'));
  assert.equal(pickerClicks, 2);
  Object.defineProperty(input, 'files', { configurable: true, value: [new window.File(['Hours'], 'Hours.txt')] });
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
  await settle();
  assert.deepEqual(names(root), ['Hours.txt']);

  const drop = new window.Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(drop, 'dataTransfer', { value: { files: [new window.File(['Menu'], 'Menu.pdf')] } });
  root.querySelector('[data-knowledge-dropzone]').dispatchEvent(drop);
  await settle();

  assert.equal(drop.defaultPrevented, true);
  assert.deepEqual(names(root), ['Hours.txt', 'Menu.pdf']);
  assert.equal(root.querySelector('[data-knowledge-errors]').textContent.trim(), '');
});

test('keeps a file when deletion is cancelled and frees the slot after confirmation', async (t) => {
  const { window, root, controller } = await loadFeature(t);
  await controller.addFiles(Array.from({ length: 5 }, (_, index) => new window.File(['Policy'], `Policy ${index}.txt`)));
  let confirmed = false;
  window.Swal = { fire: async () => ({ isConfirmed: confirmed }) };
  click(window, root.querySelector('[data-knowledge-delete]'));
  await settle();
  assert.equal(root.querySelectorAll('[data-knowledge-file]').length, 5);

  confirmed = true;
  click(window, root.querySelector('[data-knowledge-delete]'));
  await settle();
  assert.equal(root.querySelectorAll('[data-knowledge-file]').length, 4);
  assert.equal(root.querySelector('[data-knowledge-upload]').disabled, false);
  await controller.addFiles([new window.File(['Replacement'], 'Replacement.txt')]);
  assert.equal(root.querySelectorAll('[data-knowledge-file]').length, 5);
  assert.ok(names(root).includes('Replacement.txt'));
});

test('falls back to browser confirmation and restores the empty state after deleting the last file', async (t) => {
  const { window, root, controller } = await loadFeature(t);
  await controller.addFiles([new window.File(['FAQ'], 'FAQ.txt')]);
  window.confirm = () => false;
  click(window, root.querySelector('[data-knowledge-delete]'));
  await settle();
  assert.deepEqual(names(root), ['FAQ.txt']);

  window.confirm = () => true;
  click(window, root.querySelector('[data-knowledge-delete]'));
  await settle();
  assert.equal(root.querySelectorAll('[data-knowledge-file]').length, 0);
  assert.equal(root.querySelector('[data-knowledge-empty]').hidden, false);
  assert.match(root.querySelector('[data-knowledge-count]').textContent, /0\s*(?:of|\/)\s*5/);
  assert.equal(root.querySelector('[data-knowledge-upload]').disabled, false);
});

test('downloads the exact original File bytes under the original filename', async (t) => {
  const { window, root, controller } = await loadFeature(t);
  const bytes = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0xff, 0x80, 0x0a]);
  const file = new window.File([bytes], 'Original menu.PDF', { type: 'application/pdf' });
  await controller.addFiles([file]);
  let downloadedFile;
  const downloads = [];
  window.URL.createObjectURL = (blob) => {
    downloadedFile = blob;
    return 'blob:https://merchant.nexora.test/original-menu';
  };
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = function () {
    downloads.push({ name: this.download, href: this.href });
  };

  click(window, root.querySelector('[data-knowledge-download]'));

  assert.equal(downloadedFile, file);
  assert.deepEqual(await readBytes(window, downloadedFile), bytes);
  assert.deepEqual(downloads, [{ name: 'Original menu.PDF', href: 'blob:https://merchant.nexora.test/original-menu' }]);
});

test('renders hostile filenames as plain text instead of injecting HTML', async (t) => {
  const { window, root, controller } = await loadFeature(t);
  const name = '\"><img src=x onerror=alert(1)>.TXT';
  await controller.addFiles([new window.File(['Hours'], name)]);

  const label = root.querySelector('[data-knowledge-name]');
  assert.equal(label.textContent, name);
  assert.equal(label.childElementCount, 0);
  assert.equal(root.querySelector('img[onerror]'), null);
});

test('loads three real sample documents and downloads their complete source bytes', async (t) => {
  const { window, root } = await loadFeature(t, { samples: true });
  assert.deepEqual(names(root).sort(), ['Frequently asked questions.txt', 'Salon policies.pdf', 'Services & aftercare.docx']);
  assert.match(root.querySelector('[data-knowledge-count]').textContent, /3\s*(?:of|\/)\s*5/);
  assert.match(root.querySelector('[data-knowledge-availability]').textContent, /2/);
  let downloadBlob;
  let downloadName;
  window.URL.createObjectURL = (blob) => {
    downloadBlob = blob;
    return 'blob:https://merchant.nexora.test/sample';
  };
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = function () { downloadName = this.download; };

  for (const row of root.querySelectorAll('[data-knowledge-file]')) {
    const name = row.querySelector('[data-knowledge-name]').textContent;
    assert.match(row.textContent, /Uploaded/);
    click(window, row.querySelector('[data-knowledge-download]'));
    assert.equal(downloadName, name);
    assert.deepEqual(
      await readBytes(window, downloadBlob),
      readFileSync(new URL(`./assets/ai-knowledge/${name}`, SOURCE_DIR)),
    );
  }
});
