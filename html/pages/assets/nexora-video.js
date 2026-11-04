(() => {
  const play = document.getElementById('video-play');
  const cover = document.getElementById('video-cover');
  const frame = document.getElementById('video-frame');
  if (!play || !cover || !frame) return;

  play.addEventListener('click', () => {
    frame.src = 'https://www.youtube-nocookie.com/embed/ghegM-w3NAM?autoplay=1&rel=0';
    frame.hidden = false;
    cover.hidden = true;
  }, { once: true });
})();
