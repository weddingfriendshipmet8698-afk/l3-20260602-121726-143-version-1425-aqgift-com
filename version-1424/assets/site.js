const navToggle = document.querySelector("[data-nav-toggle]");
const mainNav = document.getElementById("main-nav");

if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
        mainNav.classList.toggle("open");
    });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let active = 0;

    const setActive = (next) => {
        active = (next + slides.length) % slides.length;
        slides.forEach((slide, index) => {
            slide.classList.toggle("active", index === active);
        });
        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === active);
        });
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => setActive(index));
    });

    setActive(0);
    window.setInterval(() => setActive(active + 1), 5200);
}

const normalize = (value) => String(value || "").toLowerCase().trim();

for (const root of document.querySelectorAll("[data-filter-root]")) {
    const input = root.querySelector("[data-filter-input]");
    const typeSelect = root.querySelector("[data-filter-type]");
    const yearSelect = root.querySelector("[data-filter-year]");
    const categorySelect = root.querySelector("[data-filter-category]");
    const empty = root.querySelector("[data-filter-empty]");
    const scope = root.parentElement || document;
    const cards = Array.from(scope.querySelectorAll("[data-search-card]"));

    const applyFilter = () => {
        const keyword = normalize(input ? input.value : "");
        const type = normalize(typeSelect ? typeSelect.value : "");
        const year = normalize(yearSelect ? yearSelect.value : "");
        const category = normalize(categorySelect ? categorySelect.value : "");
        let visible = 0;

        cards.forEach((card) => {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.category,
                card.textContent
            ].join(" "));
            const matched = (!keyword || haystack.includes(keyword))
                && (!type || normalize(card.dataset.type).includes(type))
                && (!year || normalize(card.dataset.year) === year)
                && (!category || normalize(card.dataset.category) === category);

            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("show", visible === 0);
        }
    };

    [input, typeSelect, yearSelect, categorySelect].forEach((control) => {
        if (control) {
            control.addEventListener("input", applyFilter);
            control.addEventListener("change", applyFilter);
        }
    });

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && input) {
        input.value = query;
    }

    applyFilter();
}
