/* Shared narration for Salon Home. Keep speech state separate from the showcase. */
(function () {
  'use strict';

  const synthesis = window.speechSynthesis;
  const supported = !!synthesis && typeof window.SpeechSynthesisUtterance === 'function';
  const tracks = {
    tour: {
      button: document.getElementById('salon-ai-tour-voice'),
      ids: ['salon-home-title', 'salon-ai-tour-copy'],
      idle: '▶ Listen', playing: '■ Stop',
      idleLabel: 'Listen to slide introduction', playingLabel: 'Stop slide introduction'
    },
    feature: {
      button: document.getElementById('explorer-speak'),
      ids: ['explorer-feature-name', 'explorer-ai-summary', 'explorer-ai-how', 'explorer-ai-value', 'explorer-ai-state'],
      idle: '▶ Listen to intro', playing: '■ Stop audio',
      idleLabel: 'Listen to feature introduction', playingLabel: 'Stop feature introduction'
    }
  };
  let active = null;
  let voiceTimer = null;

  function render() {
    Object.entries(tracks).forEach(([id, track]) => {
      if (!track.button) return;
      const playing = active?.id === id;
      track.button.hidden = !supported;
      track.button.textContent = playing ? track.playing : track.idle;
      track.button.setAttribute('aria-label', playing ? track.playingLabel : track.idleLabel);
      track.button.setAttribute('aria-pressed', String(playing));
      track.button.setAttribute('aria-busy', String(playing && !active.utterance));
    });
  }

  function stop(id) {
    if (!active || (id && active.id !== id)) return;
    active = null;
    window.clearTimeout(voiceTimer);
    voiceTimer = null;
    // Clear state before cancel: browsers may dispatch the old error callback synchronously.
    synthesis.cancel();
    render();
  }

  function chooseVoice() {
    const voices = synthesis.getVoices().filter(voice => /^en(?:[-_]|$)/i.test(voice.lang));
    const preferred = ['Google UK English Female', 'Microsoft Sonia', 'Daniel', 'Karen', 'Google US English'];
    return preferred.map(name => voices.find(voice => voice.name.includes(name))).find(Boolean)
      || voices.find(voice => /^en[-_]GB$/i.test(voice.lang) && !voice.default)
      || voices.find(voice => !voice.default) || voices[0] || null;
  }

  function speak(request) {
    if (active !== request || request.utterance) return;
    window.clearTimeout(voiceTimer);
    voiceTimer = null;
    const utterance = new window.SpeechSynthesisUtterance(request.text);
    const voice = chooseVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'en-GB';
    utterance.rate = .96;
    utterance.pitch = 1;
    utterance.onend = utterance.onerror = () => {
      if (active === request) stop(request.id);
    };
    request.utterance = utterance;
    render();
    try {
      synthesis.speak(utterance);
    } catch {
      stop(request.id);
    }
  }

  function toggle(id) {
    if (!supported) return;
    if (active?.id === id) { stop(id); return; }
    stop();
    const text = tracks[id].ids.map(key => document.getElementById(key)?.textContent.trim()).filter(Boolean).join('. ');
    if (!text) return;
    const request = { id, text, utterance: null };
    active = request;
    render();
    if (chooseVoice()) speak(request);
    else voiceTimer = window.setTimeout(() => speak(request), 1200);
  }

  Object.entries(tracks).forEach(([id, track]) => {
    track.button?.addEventListener('click', () => toggle(id));
  });
  if (supported) synthesis.addEventListener('voiceschanged', () => {
    if (active && !active.utterance && chooseVoice()) speak(active);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', () => stop());
  window.NexoraSalonAudio = Object.freeze({ stop, isPlaying: id => active?.id === id });
  render();
})();
