import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const pageSource = readFileSync(new URL('../../../html/pages/salon-home.html', import.meta.url), 'utf8');
const audioSource = readFileSync(new URL('../../../html/assets/nexora-salon-audio.js', import.meta.url), 'utf8');
const defaultVoice = { name: 'Samantha', lang: 'en-US', default: true };
const narrator = { name: 'Google UK English Female', lang: 'en-GB', default: false };

function setup(t, { voices = [defaultVoice, narrator], supported = true } = {}) {
  const dom = new JSDOM(pageSource, { runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { window } = dom;
  const spoken = [];
  const pending = new Map();
  const synthesis = new window.EventTarget();
  let available = voices;
  synthesis.getVoices = () => available;
  synthesis.speak = utterance => spoken.push(utterance);
  synthesis.cancel = () => spoken.at(-1)?.onerror?.();
  window.setTimeout = callback => { const id = Symbol(); pending.set(id, callback); return id; };
  window.clearTimeout = id => pending.delete(id);
  if (supported) {
    window.speechSynthesis = synthesis;
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  }
  window.eval(audioSource);
  const tour = window.document.getElementById('salon-ai-tour-voice');
  const feature = window.document.getElementById('explorer-speak');
  return {
    window, tour, feature, spoken, synthesis, pending,
    loadVoices(next) { available = next; synthesis.dispatchEvent(new window.Event('voiceschanged')); }
  };
}

test('narrates the current PO copy with the explicit UK voice instead of the default', t => {
  const { tour, spoken, window } = setup(t);
  tour.click();
  assert.equal(spoken.length, 1);
  assert.equal(spoken[0].voice, narrator);
  assert.equal(spoken[0].lang, 'en-GB');
  assert.equal(spoken[0].text, ['salon-home-title', 'salon-ai-tour-copy'].map(id => window.document.getElementById(id).textContent.trim()).join('. '));
  assert.equal(tour.getAttribute('aria-pressed'), 'true');
  tour.click();
  assert.equal(tour.getAttribute('aria-pressed'), 'false');
  assert.equal(tour.textContent, '▶ Listen');
});

test('switching narration resets the previous control and ignores stale speech callbacks', t => {
  const { tour, feature, spoken, window } = setup(t);
  tour.click();
  const previous = spoken[0];
  feature.click();
  assert.equal(spoken.length, 2);
  assert.equal(tour.getAttribute('aria-pressed'), 'false');
  assert.equal(feature.getAttribute('aria-pressed'), 'true');
  previous.onend();
  assert.equal(window.NexoraSalonAudio.isPlaying('feature'), true);
  spoken[1].onend();
  assert.equal(feature.getAttribute('aria-pressed'), 'false');
});

test('changing the other surface does not cancel the active narration', t => {
  const { tour, feature, window } = setup(t);
  tour.click();
  window.NexoraSalonAudio.stop('feature');
  assert.equal(window.NexoraSalonAudio.isPlaying('tour'), true);
  feature.click();
  window.NexoraSalonAudio.stop('tour');
  assert.equal(window.NexoraSalonAudio.isPlaying('feature'), true);
  window.NexoraSalonAudio.stop('feature');
  assert.equal(feature.getAttribute('aria-pressed'), 'false');
});

test('waits for delayed voices and cancels pending playback when stopped', t => {
  const { tour, spoken, loadVoices, pending } = setup(t, { voices: [] });
  tour.click();
  assert.equal(spoken.length, 0);
  assert.equal(tour.getAttribute('aria-busy'), 'true');
  loadVoices([narrator]);
  assert.equal(spoken[0].voice, narrator);
  assert.equal(pending.size, 0);
  tour.click();
  loadVoices([]);
  tour.click();
  const oldTimer = [...pending.values()][0];
  tour.click();
  oldTimer();
  loadVoices([narrator]);
  assert.equal(spoken.length, 1);
  assert.equal(tour.getAttribute('aria-pressed'), 'false');
});

test('falls back to English and restores controls after a speech error', t => {
  const { tour, spoken, pending } = setup(t, { voices: [] });
  tour.click();
  [...pending.values()][0]();
  assert.equal(spoken[0].lang, 'en-GB');
  spoken[0].onerror();
  assert.equal(tour.getAttribute('aria-busy'), 'false');
  assert.equal(tour.getAttribute('aria-pressed'), 'false');
});

test('stops narration when leaving the page and hides controls without speech support', t => {
  const supported = setup(t);
  supported.feature.click();
  supported.window.dispatchEvent(new supported.window.Event('pagehide'));
  assert.equal(supported.feature.getAttribute('aria-pressed'), 'false');
  const unsupported = setup(t, { supported: false });
  assert.equal(unsupported.tour.hidden, true);
  assert.equal(unsupported.feature.hidden, true);
});
