(function () {
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(parseInt(dot.getAttribute('data-target'), 10) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filter = document.querySelector('.filter-input');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));

  function applyFilter(value) {
    var q = String(value || '').trim().toLowerCase();
    cards.forEach(function (card) {
      var hay = String(card.getAttribute('data-search') || '').toLowerCase();
      card.classList.toggle('hidden-card', q && hay.indexOf(q) === -1);
    });
  }

  if (filter && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (filter.classList.contains('auto-query') && q) {
      filter.value = q;
      applyFilter(q);
    }
    filter.addEventListener('input', function () {
      applyFilter(filter.value);
    });
  }
})();
