// Smooth scroll untuk semua nav links dan tombol
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Navbar shadow saat scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(108,99,255,0.2)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Animasi card saat muncul di layar
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.game-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// Search dan filter kategori game
const gameSearch = document.getElementById('gameSearch');
const filterChips = document.querySelectorAll('.filter-chip');
const gameCards = document.querySelectorAll('.game-card');
const emptyGames = document.getElementById('emptyGames');
let activeCategory = 'all';

function normalizeText(text) {
    return text.toLowerCase().trim();
}

function updateGameList() {
    const keyword = normalizeText(gameSearch ? gameSearch.value : '');
    let visibleCount = 0;

    gameCards.forEach(card => {
        const gameName = normalizeText(card.dataset.gameName || card.textContent);
        const gameCategory = card.dataset.gameCategory || '';
        const matchesName = gameName.includes(keyword);
        const matchesCategory = activeCategory === 'all' || gameCategory === activeCategory;
        const shouldShow = matchesName && matchesCategory;

        card.classList.toggle('is-hidden', !shouldShow);

        if (shouldShow) {
            visibleCount += 1;
        }
    });

    if (emptyGames) {
        emptyGames.hidden = visibleCount > 0;
    }
}

if (gameSearch && gameCards.length > 0) {
    gameSearch.addEventListener('input', updateGameList);

    filterChips.forEach(chip => {
        chip.setAttribute('aria-pressed', chip.classList.contains('active') ? 'true' : 'false');

        chip.addEventListener('click', () => {
            activeCategory = chip.dataset.category || 'all';

            filterChips.forEach(item => {
                const isActive = item === chip;
                item.classList.toggle('active', isActive);
                item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });

            updateGameList();
        });
    });

    updateGameList();
}
