import { H as Hls } from './hls-vendor-dru42stk.js';

var video = document.getElementById('movie-player');
var button = document.getElementById('movie-play');

function attachStream() {
  if (!video) {
    return Promise.resolve();
  }

  var stream = video.getAttribute('data-stream') || '';
  if (!stream) {
    return Promise.resolve();
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    if (!video.getAttribute('src')) {
      video.setAttribute('src', stream);
    }
    return Promise.resolve();
  }

  if (Hls && Hls.isSupported()) {
    if (!video.__hlsReady) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.__hlsReady = true;
    }
    return Promise.resolve();
  }

  if (!video.getAttribute('src')) {
    video.setAttribute('src', stream);
  }
  return Promise.resolve();
}

function playVideo() {
  attachStream().then(function () {
    if (button) {
      button.classList.add('hide');
    }
    var result = video.play();
    if (result && result.catch) {
      result.catch(function () {
        if (button) {
          button.classList.remove('hide');
        }
      });
    }
  });
}

if (button && video) {
  button.addEventListener('click', playVideo);
  video.addEventListener('play', function () {
    button.classList.add('hide');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('hide');
    }
  });
}
