(function() {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function() {
                showSlide(index + 1);
            }, 5800);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function() {
                showSlide(index - 1);
                startTimer();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                showSlide(index + 1);
                startTimer();
            });
        }
        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                showSlide(dotIndex);
                startTimer();
            });
        });
        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    const searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
        const params = new URLSearchParams(window.location.search);
        const input = searchPage.querySelector('#searchInput');
        const yearFilter = searchPage.querySelector('#yearFilter');
        const regionFilter = searchPage.querySelector('#regionFilter');
        const typeFilter = searchPage.querySelector('#typeFilter');
        const resetButton = searchPage.querySelector('#searchReset');
        const cards = Array.from(searchPage.querySelectorAll('[data-movie-card]'));
        const empty = searchPage.querySelector('[data-empty-result]');

        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            const keyword = normalize(input && input.value);
            const year = normalize(yearFilter && yearFilter.value);
            const region = normalize(regionFilter && regionFilter.value);
            const type = normalize(typeFilter && typeFilter.value);
            let visible = 0;

            cards.forEach(function(card) {
                const text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.category
                ].join(' '));
                const matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                const matchedYear = !year || normalize(card.dataset.year) === year;
                const matchedRegion = !region || normalize(card.dataset.region) === region;
                const matchedType = !type || normalize(card.dataset.type) === type;
                const matched = matchedKeyword && matchedYear && matchedRegion && matchedType;
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, yearFilter, regionFilter, typeFilter].forEach(function(control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function() {
                if (input) {
                    input.value = '';
                }
                if (yearFilter) {
                    yearFilter.value = '';
                }
                if (regionFilter) {
                    regionFilter.value = '';
                }
                if (typeFilter) {
                    typeFilter.value = '';
                }
                applyFilter();
            });
        }

        applyFilter();
    }
})();
