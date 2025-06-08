document.addEventListener('DOMContentLoaded', () => {
    // Search Functionality
    window.populateSearchResults = () => {
        const searchResultsGrid = document.querySelector('.search-results-grid');
        const searchInput = document.querySelector('.search-form input');
        const searchSuggestions = document.querySelector('.search-suggestions');

        if (!searchInput || !searchResultsGrid || !searchSuggestions) {
            console.error('Search elements missing');
            return;
        }

        searchResultsGrid.innerHTML = '';
        searchResultsGrid.classList.remove('active');
        const query = searchInput.value.trim().toLowerCase();
        const filteredArticles = blogPosts.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.category.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query)
        );

        const suggestions = blogPosts.slice(0, 3).map(post => post.title);
        searchSuggestions.innerText = suggestions.length ? `Try: ${suggestions.join(', ')}` : '';

        filteredArticles.forEach(post => {
            const articleCard = document.createElement('div');
            articleCard.className = 'article-card';
            articleCard.setAttribute('data-post-id', post.id);
            articleCard.innerHTML = window.renderArticleCard(post);
            searchResultsGrid.appendChild(articleCard);
        });

        if (filteredArticles.length > 0) {
            setTimeout(() => searchResultsGrid.classList.add('active'), 10);
        }

        searchResultsGrid.querySelectorAll('.article-card').forEach(card => {
            card.removeEventListener('click', card._clickHandler);
            card._clickHandler = (e) => {
                if (!e.target.closest('.save-btn, .share-btn')) {
                    const postId = card.getAttribute('data-post-id');
                    window.renderPostOverlay(postId);
                }
            };
            card.addEventListener('click', card._clickHandler);
        });
    };

    const searchBtn = document.querySelector('.search-btn');
    const searchOverlay = document.querySelector('.search-overlay');
    const closeSearch = document.querySelector('.close-search');
    const searchInput = document.querySelector('.search-form input');
    const searchForm = document.querySelector('.search-form');

    if (!searchBtn || !searchOverlay || !searchInput || !closeSearch || !searchForm) {
        console.error('Search elements missing');
        return;
    }

    searchBtn.removeEventListener('click', searchBtn._searchHandler);
    searchBtn._searchHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.resetOverlays(searchOverlay);
        window.overlays.overlayStack.push(searchOverlay);
        searchOverlay.classList.toggle('active');
        toggleClass(searchBtn, 'active');
        if (searchOverlay.classList.contains('active')) {
            setTimeout(() => searchInput.focus(), 100);
            populateSearchResults();
            window.disableBackgroundScroll(searchOverlay);
            const closeButton = searchOverlay.querySelector('.close-search');
            const outsideClickHandler = window.handleOutsideClick(searchOverlay, closeButton, ['.search-form', '.close-search', '.search-suggestions', '.search-results-grid']);
            searchOverlay.addEventListener('click', outsideClickHandler);
            searchOverlay._outsideClickHandler = outsideClickHandler;
        } else {
            searchBtn.classList.remove('active');
            window.restoreBackgroundScroll();
            if (searchOverlay._outsideClickHandler) {
                searchOverlay.removeEventListener('click', searchOverlay._outsideClickHandler);
                delete searchOverlay._outsideClickHandler;
            }
        }
    };
    searchBtn.addEventListener('click', searchBtn._searchHandler);

    closeSearch.removeEventListener('click', closeSearch._closeHandler);
    closeSearch._closeHandler = () => {
        searchOverlay.classList.remove('active');
        searchBtn.classList.remove('active');
        window.overlays.overlayStack.pop();
        window.restoreBackgroundScroll();
        if (searchOverlay._outsideClickHandler) {
            searchOverlay.removeEventListener('click', searchOverlay._outsideClickHandler);
            delete searchOverlay._outsideClickHandler;
        }
        // Remove the logic that re-activates the previous overlay
        // if (window.overlays.overlayStack.length) {
        //     const previousOverlay = window.overlays.overlayStack[window.overlays.overlayStack.length - 1];
        //     previousOverlay.classList.add('active');
        //     window.disableBackgroundScroll(previousOverlay);
        //     const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
        //     const firstFocusable = focusableElements[0];
        //     firstFocusable?.focus();
        // }
    };
    closeSearch.addEventListener('click', closeSearch._closeHandler);

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        populateSearchResults();
    });

    const focusableElements = searchOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    searchOverlay.removeEventListener('keydown', searchOverlay._focusTrap);
    searchOverlay._focusTrap = (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    };
    searchOverlay.addEventListener('keydown', searchOverlay._focusTrap);

    const debouncedSearch = window.debounce(populateSearchResults, 200);
    searchInput.removeEventListener('input', debouncedSearch);
    searchInput.addEventListener('input', debouncedSearch);
});