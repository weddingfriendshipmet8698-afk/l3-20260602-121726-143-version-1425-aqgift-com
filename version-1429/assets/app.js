(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    restart();
  }

  function setupRail() {
    document.querySelectorAll(".rail-section").forEach(function (section) {
      var rail = section.querySelector(".movie-rail");
      var prev = section.querySelector(".rail-prev");
      var next = section.querySelector(".rail-next");
      if (!rail || !prev || !next) {
        return;
      }
      prev.addEventListener("click", function () {
        rail.scrollBy({ left: -360, behavior: "smooth" });
      });
      next.addEventListener("click", function () {
        rail.scrollBy({ left: 360, behavior: "smooth" });
      });
    });
  }

  function setupFilters() {
    document.querySelectorAll(".filter-scope").forEach(function (scope) {
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-type-filter]"));
      var select = scope.querySelector(".year-select");
      var typeValue = "all";
      var yearValue = "all";

      function apply() {
        cards.forEach(function (card) {
          var okType = typeValue === "all" || card.getAttribute("data-type") === typeValue;
          var okYear = yearValue === "all" || card.getAttribute("data-year") === yearValue;
          card.style.display = okType && okYear ? "" : "none";
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          typeValue = button.getAttribute("data-type-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });

      if (select) {
        select.addEventListener("change", function () {
          yearValue = select.value || "all";
          apply();
        });
      }
    });
  }

  function streamEngine() {
    return window.Hls || window.SiteHls || null;
  }

  function setupPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      if (!video || !button || shell.getAttribute("data-ready") === "1") {
        return;
      }
      shell.setAttribute("data-ready", "1");
      var attached = false;
      var player = null;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        var streamUrl = video.getAttribute("data-stream");
        var HlsEngine = streamEngine();
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (HlsEngine && HlsEngine.isSupported()) {
          player = new HlsEngine();
          player.loadSource(streamUrl);
          player.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        attach();
        shell.classList.add("is-playing");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!attached) {
          play();
        }
      });
      window.addEventListener("site-hls-ready", function () {
        if (attached && !player && !video.canPlayType("application/vnd.apple.mpegurl")) {
          attached = false;
          attach();
        }
      });
    });
  }

  function movieCardHtml(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + item.link + "\" aria-label=\"" + escapeHtml(item.title) + "\">",
      "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-badge\">" + escapeHtml(item.year) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-meta-row\"><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.region) + "</span></div>",
      "<h3><a href=\"" + item.link + "\">" + escapeHtml(item.title) + "</a></h3>",
      "<p>" + escapeHtml(item.description) + "</p>",
      "<div class=\"tag-list\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupSearch() {
    var resultBox = document.querySelector(".search-results");
    if (!resultBox || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var input = document.querySelector(".search-large input[name='q']");
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.MOVIE_SEARCH_DATA.filter(function (item) {
      if (!words.length) {
        return true;
      }
      var haystack = [item.title, item.description, item.year, item.region, item.type, item.genre, item.tags.join(" ")].join(" ").toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    resultBox.innerHTML = results.map(movieCardHtml).join("");
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupRail();
    setupFilters();
    setupPlayers();
    setupSearch();
  });
})();
