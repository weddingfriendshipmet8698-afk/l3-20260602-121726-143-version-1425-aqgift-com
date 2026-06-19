(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function() {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 6500);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function(form) {
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var target = form.getAttribute("data-search-target") || "search.html";
                var value = input ? input.value.trim() : "";
                var url = target;
                if (value) {
                    url += (target.indexOf("?") === -1 ? "?" : "&") + "q=" + encodeURIComponent(value);
                }
                window.location.href = url;
            });
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase();
    }

    function initFilters() {
        var scope = document.querySelector("[data-filter-page]");
        var grid = document.querySelector("[data-card-grid]");
        if (!scope || !grid) {
            return;
        }
        var input = scope.querySelector("[data-filter-input]");
        var type = scope.querySelector("[data-filter-type]");
        var year = scope.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty-message]");
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        if (input && q) {
            input.value = q;
        }

        function apply() {
            var query = normalize(input ? input.value.trim() : "");
            var typeValue = type ? type.value : "";
            var yearValue = year ? year.value : "";
            var visible = 0;
            cards.forEach(function(card) {
                var text = normalize(card.getAttribute("data-text"));
                var cardType = card.getAttribute("data-type") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var ok = true;
                if (query && text.indexOf(query) === -1) {
                    ok = false;
                }
                if (typeValue && cardType !== typeValue) {
                    ok = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    ok = false;
                }
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, type, year].forEach(function(control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });
        apply();
    }

    function initPlayers() {
        document.querySelectorAll("[data-movie-player]").forEach(function(shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector("[data-play]");
            if (!video) {
                return;
            }
            var url = video.getAttribute("data-src") || "";
            var loaded = false;

            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function() {});
                }
            }

            function start() {
                if (!url) {
                    return;
                }
                shell.classList.add("is-playing");
                video.controls = true;
                if (loaded) {
                    playVideo();
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                    playVideo();
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                        playVideo();
                    });
                    video.hlsInstance = hls;
                } else {
                    video.src = url;
                    playVideo();
                }
            }

            if (button) {
                button.addEventListener("click", start);
            }
            video.addEventListener("click", function() {
                if (!loaded || video.paused) {
                    start();
                }
            });
        });
    }

    ready(function() {
        initMenu();
        initHero();
        initSearchForms();
        initFilters();
        initPlayers();
    });
})();
