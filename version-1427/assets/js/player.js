(function () {
    var player = document.getElementById('moviePlayer');
    var startButton = document.getElementById('startPlayer');
    if (!player) {
        return;
    }

    var source = player.getAttribute('data-src');
    var hlsLoaded = false;

    function bindSource() {
        if (!source || hlsLoaded) {
            return;
        }
        if (player.canPlayType('application/vnd.apple.mpegurl')) {
            player.src = source;
            hlsLoaded = true;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(player);
            hlsLoaded = true;
            return;
        }
        player.src = source;
        hlsLoaded = true;
    }

    function beginPlay() {
        bindSource();
        if (startButton) {
            startButton.classList.add('hidden');
        }
        var promise = player.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                player.controls = true;
            });
        }
    }

    player.addEventListener('click', function () {
        if (player.paused) {
            beginPlay();
        }
    });

    player.addEventListener('play', function () {
        if (startButton) {
            startButton.classList.add('hidden');
        }
    });

    if (startButton) {
        startButton.addEventListener('click', beginPlay);
    }

    bindSource();
})();
