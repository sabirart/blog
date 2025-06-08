document.addEventListener('DOMContentLoaded', () => {
    // Saved Articles Overlay Creation
    const savedArticlesOverlay = document.createElement('div');
    savedArticlesOverlay.className = 'saved-articles-overlay';
    savedArticlesOverlay.innerHTML = `
        <div class="saved-articles-container">
            <button class="close-saved-overlay" aria-label="Close saved articles"><i class="fas fa-times"></i></button>
            <div class="saved-articles-content"></div>
        </div>
    `;
    document.body.appendChild(savedArticlesOverlay);

    // Expose overlay for use in other scripts
    window.overlays = window.overlays || {};
    window.overlays.savedArticlesOverlay = savedArticlesOverlay;
    window.overlays.overlayStack = window.overlays.overlayStack || [];

    // Save Button Initialization
    window.initializeSaveButtons = () => {
        document.querySelectorAll('.save-btn').forEach(button => {
            const articleId = button.getAttribute('data-post-id');
            if (!articleId) return;

            if (localStorage.getItem(`saved-${articleId}`)) {
                button.classList.add('saved');
                button.innerHTML = '<i class="fas fa-bookmark"></i>';
            } else {
                button.classList.remove('saved');
                button.innerHTML = '<i class="far fa-bookmark"></i>';
            }

            button.removeEventListener('click', button._saveHandler);
            button._saveHandler = (e) => {
                e.stopPropagation();
                const savedCount = Object.keys(localStorage).filter(key => key.startsWith('saved-')).length;
                if (savedCount >= 50 && !localStorage.getItem(`saved-${articleId}`)) {
                    window.showMessage('Maximum saved articles limit reached.');
                    return;
                }
                const isSaved = button.classList.toggle('saved');
                button.innerHTML = isSaved ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
                if (isSaved) {
                    localStorage.setItem(`saved-${articleId}`, 'true');
                    localStorage.setItem(`saveTime-${articleId}`, Date.now());
                    window.showMessage('Article saved!');
                } else {
                    localStorage.removeItem(`saved-${articleId}`);
                    localStorage.removeItem(`saveTime-${articleId}`);
                    window.showMessage('Article removed from saved.');
                }
                button.style.transform = 'scale(1.3)';
                setTimeout(() => button.style.transform = 'scale(1)', 300);
                document.querySelectorAll(`.save-btn[data-post-id="${articleId}"]`).forEach(otherButton => {
                    otherButton.classList.toggle('saved', isSaved);
                    otherButton.innerHTML = isSaved ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
                });
            };
            button.addEventListener('click', button._saveHandler);
        });
    };

    // Render Saved Articles Overlay
    window.renderSavedArticles = () => {
        let lastFocusedElement = document.activeElement; // Capture focus before opening
        const savedPosts = blogPosts
            .filter(post => localStorage.getItem(`saved-${post.id}`))
            .sort((a, b) => (localStorage.getItem(`saveTime-${b.id}`) || 0) - (localStorage.getItem(`saveTime-${a.id}`) || 0));
        savedArticlesOverlay.querySelector('.saved-articles-content').innerHTML = savedPosts.length > 0 ? `
            <h2 class="section-title">Saved Articles</h2>
            <div class="articles-grid">
                ${savedPosts.map(post => window.renderArticleCard(post)).join('')}
            </div>
        ` : `
            <div class="empty-state">
                <h3>No Saved Articles</h3>
                <p>You haven't saved any articles yet. Click the bookmark icon on any article to save it here.</p>
            </div>
        `;
        window.resetOverlays(savedArticlesOverlay);
        window.overlays.overlayStack.push(savedArticlesOverlay);
        savedArticlesOverlay.classList.add('active');
        window.disableBackgroundScroll(savedArticlesOverlay);

        const focusableElements = savedArticlesOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        firstFocusable?.focus();

        const trapFocus = (e) => {
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
        savedArticlesOverlay.addEventListener('keydown', trapFocus);
        savedArticlesOverlay._trapFocus = trapFocus;

        const closeButton = savedArticlesOverlay.querySelector('.close-saved-overlay');
        closeButton.onclick = () => {
            savedArticlesOverlay.classList.remove('active');
            savedArticlesOverlay.addEventListener('transitionend', function handler(e) {
                if (e.propertyName !== 'opacity') return;
                window.overlays.overlayStack.pop();
                if (savedArticlesOverlay._trapFocus) {
                    savedArticlesOverlay.removeEventListener('keydown', savedArticlesOverlay._trapFocus);
                    delete savedArticlesOverlay._trapFocus;
                }
                if (savedArticlesOverlay._outsideClickHandler) {
                    savedArticlesOverlay.removeEventListener('click', savedArticlesOverlay._outsideClickHandler);
                    delete savedArticlesOverlay._outsideClickHandler;
                }
                window.restoreBackgroundScroll();
                if (window.overlays.overlayStack.length) {
                    const previousOverlay = window.overlays.overlayStack[window.overlays.overlayStack.length - 1];
                    previousOverlay.classList.add('active');
                    window.disableBackgroundScroll(previousOverlay);
                    const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                    const firstFocusable = focusableElements[0];
                    firstFocusable?.focus();
                } else {
                    lastFocusedElement?.focus();
                }
                savedArticlesOverlay.removeEventListener('transitionend', handler);
            }, { once: true });
        };
        const outsideClickHandler = window.handleOutsideClick(savedArticlesOverlay, closeButton, ['.saved-articles-container']);
        savedArticlesOverlay.addEventListener('click', outsideClickHandler);
        savedArticlesOverlay._outsideClickHandler = outsideClickHandler;

        // Add click handler for article cards
        savedArticlesOverlay.querySelectorAll('.article-card').forEach(card => {
            card.removeEventListener('click', card._clickHandler);
            card._clickHandler = (e) => {
                if (!e.target.closest('.save-btn, .share-btn')) {
                    const postId = card.getAttribute('data-post-id');
                    window.renderPostOverlay(postId);
                }
            };
            card.addEventListener('click', card._clickHandler);
        });

        window.initializeSaveButtons();
        window.initializeShareButtons();
    };

    // Saved Articles Overlay Close Handler
    const closeSavedOverlay = document.querySelector('.close-saved-overlay');
    if (closeSavedOverlay) {
        closeSavedOverlay.removeEventListener('click', closeSavedOverlay._closeHandler);
        closeSavedOverlay._closeHandler = () => {
            savedArticlesOverlay.classList.remove('active');
            savedArticlesOverlay.addEventListener('transitionend', function handler(e) {
                if (e.propertyName !== 'opacity') return;
                window.overlays.overlayStack.pop();
                if (savedArticlesOverlay._trapFocus) {
                    savedArticlesOverlay.removeEventListener('keydown', savedArticlesOverlay._trapFocus);
                    delete savedArticlesOverlay._trapFocus;
                }
                if (savedArticlesOverlay._outsideClickHandler) {
                    savedArticlesOverlay.removeEventListener('click', savedArticlesOverlay._outsideClickHandler);
                    delete savedArticlesOverlay._outsideClickHandler;
                }
                window.restoreBackgroundScroll();
                if (window.overlays.overlayStack.length) {
                    const previousOverlay = window.overlays.overlayStack[window.overlays.overlayStack.length - 1];
                    previousOverlay.classList.add('active');
                    window.disableBackgroundScroll(previousOverlay);
                    const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                    const firstFocusable = focusableElements[0];
                    firstFocusable?.focus();
                } else {
                    lastFocusedElement?.focus();
                }
                savedArticlesOverlay.removeEventListener('transitionend', handler);
            }, { once: true });
        };
        closeSavedOverlay.addEventListener('click', closeSavedOverlay._closeHandler);
    }

    // Save Button Header Handler
    const saveBtnHeader = document.querySelector('.save-btn-header');
    if (saveBtnHeader) {
        saveBtnHeader.removeEventListener('click', saveBtnHeader._saveHandler);
        saveBtnHeader._saveHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (savedArticlesOverlay.classList.contains('active')) {
                document.querySelector('.close-saved-overlay').click();
            } else {
                window.renderSavedArticles();
            }
        };
        saveBtnHeader.addEventListener('click', saveBtnHeader._saveHandler);
    }
});