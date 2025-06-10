const initializePagination = () => {
    const articlesPerPage = 6;
    let currentPage = 1;

    // Check if required elements exist
    const getElements = () => {
        const articlesGrid = document.querySelector('.articles-grid');
        const pagination = document.getElementById('pagination');
        return { articlesGrid, pagination };
    };

    const showPage = (page, articlesGrid, pagination) => {
        const articleCards = Array.from(articlesGrid.querySelectorAll('.article-card'));
        if (articleCards.length === 0) {
            console.warn('No article cards found for pagination');
            pagination.innerHTML = '';
            return;
        }

        const totalPages = Math.ceil(articleCards.length / articlesPerPage);
        currentPage = Math.max(1, Math.min(page, totalPages));
        const start = (currentPage - 1) * articlesPerPage;
        const end = start + articlesPerPage;

        articlesGrid.style.opacity = '0';
        articlesGrid.style.transform = 'translateY(20px)';
        articlesGrid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        setTimeout(() => {
            articleCards.forEach((card, index) => {
                card.style.display = index >= start && index < end ? 'block' : 'none';
            });
            articlesGrid.style.opacity = '1';
            articlesGrid.style.transform = 'translateY(0)';
            renderPagination(totalPages, pagination);
        }, 300);
    };

    const renderPagination = (totalPages, pagination) => {
        pagination.innerHTML = '';

        const createButton = (text, page, isDisabled = false, isActive = false) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.setAttribute('aria-label', text);
            if (isDisabled) btn.classList.add('disabled');
            if (isActive) btn.classList.add('active');
            if (!isDisabled) {
                btn.addEventListener('click', () => {
                    const { articlesGrid } = getElements();
                    if (articlesGrid) {
                        showPage(page, articlesGrid, pagination);
                        const offsetTop = articlesGrid.getBoundingClientRect().top + window.pageYOffset;
                        window.scrollTo({ top: offsetTop - 100, behavior: 'smooth' });
                    }
                });
            }
            return btn;
        };

        pagination.appendChild(createButton('« Prev', currentPage - 1, currentPage === 1));
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, startPage + 2);
        if (endPage - startPage < 2) {
            startPage = Math.max(1, endPage - 2);
        }
        for (let i = startPage; i <= endPage; i++) {
            pagination.appendChild(createButton(i, i, false, i === currentPage));
        }
        pagination.appendChild(createButton('Next »', currentPage + 1, currentPage === totalPages));
    };

    // Try to initialize pagination
    const tryInitialize = () => {
        const { articlesGrid, pagination } = getElements();
        if (!articlesGrid || !pagination) {
            console.warn('Pagination elements (.articles-grid or #pagination) not found, retrying...');
            setTimeout(tryInitialize, 100); // Retry after 100ms
            return;
        }

        const articleCards = articlesGrid.querySelectorAll('.article-card');
        if (articleCards.length > articlesPerPage) {
            showPage(1, articlesGrid, pagination);
        } else {
            pagination.innerHTML = '';
        }
    };

    // Expose reinitialize function for dynamic updates
    window.reinitializePagination = () => {
        const { articlesGrid, pagination } = getElements();
        if (!articlesGrid || !pagination) {
            console.warn('Pagination elements not found during reinitialization');
            return;
        }
        const articleCards = articlesGrid.querySelectorAll('.article-card');
        if (articleCards.length > articlesPerPage) {
            showPage(1, articlesGrid, pagination);
        } else {
            pagination.innerHTML = '';
        }
    };

    tryInitialize();
};

// Ensure DOM is loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePagination);
} else {
    initializePagination();
}