(function () {
    var navButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('open');
            navButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dotsWrap = document.querySelector('[data-hero-dots]');
    var current = 0;
    var timer = null;

    function renderHero(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        if (dotsWrap) {
            Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }
    }

    function nextHero() {
        renderHero(current + 1);
    }

    if (slides.length && dotsWrap) {
        slides.forEach(function (_, index) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', '切换焦点');
            dot.addEventListener('click', function () {
                renderHero(index);
                if (timer) {
                    clearInterval(timer);
                    timer = setInterval(nextHero, 5200);
                }
            });
            dotsWrap.appendChild(dot);
        });
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        if (prev) {
            prev.addEventListener('click', function () {
                renderHero(current - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                renderHero(current + 1);
            });
        }
        renderHero(0);
        timer = setInterval(nextHero, 5200);
    }

    var searchInput = document.getElementById('siteSearch');
    var yearFilter = document.getElementById('yearFilter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function runFilter() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ').toLowerCase();
            var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchYear = !year || card.getAttribute('data-year') === year;
            card.classList.toggle('is-hidden', !(matchKeyword && matchYear));
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', runFilter);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', runFilter);
    }
})();
