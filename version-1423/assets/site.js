(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero-slider]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            function show(next) {
                if (!slides.length) {
                    return;
                }
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            show(0);
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var year = scope.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            function applyFilter() {
                var q = input ? input.value.trim().toLowerCase() : "";
                var y = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-tags") || ""
                    ].join(" ").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = (!q || text.indexOf(q) !== -1) && (!y || cardYear === y);
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }
            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (year) {
                year.addEventListener("change", applyFilter);
            }
            applyFilter();
        });
    });

    window.initMoviePlayer = function (source) {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        var button = document.querySelector("[data-player-button]");
        var loaded = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function loadStream() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function start() {
            loadStream();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var playTask = video.play();
            if (playTask && playTask.catch) {
                playTask.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
