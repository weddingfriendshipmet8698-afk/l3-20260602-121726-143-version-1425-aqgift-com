(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector(".hero-slider");
    if (!root) {
      return;
    }
    var slides = selectAll(".hero-slide", root);
    var backs = selectAll(".hero-bg", root);
    var dots = selectAll(".hero-dots button", root);
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      backs.forEach(function (back, i) {
        back.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function matchValue(card, field, value) {
    if (!value) {
      return true;
    }
    var current = (card.getAttribute("data-" + field) || "").toLowerCase();
    return current.indexOf(value.toLowerCase()) !== -1;
  }

  function applyFilters(scopeSelector) {
    var scope = document.querySelector(scopeSelector);
    if (!scope) {
      return;
    }
    var cards = selectAll(".searchable-card", scope);
    var inputs = selectAll(".site-search[data-scope='" + scopeSelector + "']");
    var filters = selectAll(".site-filter[data-scope='" + scopeSelector + "']");
    var query = inputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).join(" ").trim();
    var shown = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-type") || "",
        card.getAttribute("data-category") || "",
        card.getAttribute("data-keywords") || ""
      ].join(" ").toLowerCase();
      var ok = !query || haystack.indexOf(query) !== -1;
      filters.forEach(function (filter) {
        ok = ok && matchValue(card, filter.getAttribute("data-field"), filter.value);
      });
      card.style.display = ok ? "" : "none";
      if (ok) {
        shown += 1;
      }
    });

    var empty = scope.parentElement ? scope.parentElement.querySelector(".empty-state") : null;
    if (empty) {
      empty.style.display = shown ? "none" : "block";
    }
  }

  function setupFilters() {
    var controls = selectAll(".site-search, .site-filter");
    controls.forEach(function (control) {
      var scope = control.getAttribute("data-scope");
      if (!scope) {
        return;
      }
      var eventName = control.tagName === "SELECT" ? "change" : "input";
      control.addEventListener(eventName, function () {
        applyFilters(scope);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(streamUrl) {
  document.addEventListener("DOMContentLoaded", function () {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("movie-play-button");
    var hls = null;
    var ready = false;

    if (!video || !button || !streamUrl) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (window.Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            ready = false;
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
    }

    function begin() {
      prepare();
      button.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", begin);
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}
