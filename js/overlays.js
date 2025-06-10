document.addEventListener('DOMContentLoaded', () => {
    // CSS for smooth transitions
    const style = document.createElement('style');
    style.textContent = `
        .article-overlay, .saved-articles-overlay, .share-overlay {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
            visibility: hidden;
            pointer-events: none;
        }
        .article-overlay.active, .saved-articles-overlay.active, .share-overlay.active {
            opacity: 1;
            transform: translateY(0);
            visibility: visible;
            pointer-events: auto;
        }
    `;
    document.head.appendChild(style);

    // Check for existing overlays to avoid duplicates
    if (!window.overlays) {
        window.overlays = {};
    }
    if (!window.overlays.articleOverlay) {
        const articleOverlay = document.createElement('div');
        articleOverlay.className = 'article-overlay';
        articleOverlay.innerHTML = `
            <div class="article-overlay-container">
                <button class="close-btn close-article-overlay" aria-label="Close article"><i class="fas fa-times"></i></button>
                <div class="article-overlay-content"></div>
            </div>
        `;
        document.body.appendChild(articleOverlay);
        window.overlays.articleOverlay = articleOverlay;
    }
    if (!window.overlays.savedArticlesOverlay) {
        const savedArticlesOverlay = document.createElement('div');
        savedArticlesOverlay.className = 'saved-articles-overlay';
        savedArticlesOverlay.innerHTML = `
            <div class="saved-articles-container">
                <button class="close-btn close-saved-overlay" aria-label="Close saved articles"><i class="fas fa-times"></i></button>
                <div class="saved-articles-content"></div>
            </div>
        `;
        document.body.appendChild(savedArticlesOverlay);
        window.overlays.savedArticlesOverlay = savedArticlesOverlay;
    }
    if (!window.overlays.shareOverlay) {
        const shareOverlay = document.createElement('div');
        shareOverlay.className = 'share-overlay';
        shareOverlay.innerHTML = `
            <div class="share-container">
                <button class="close-btn close-share" aria-label="Close share"><i class="fas fa-times"></i></button>
                <h3>Share this article</h3>
                <div class="share-links">
                    <a href="#" target="_blank" class="facebook-share" aria-label="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" target="_blank" class="twitter-share" aria-label="Share on Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="#" target="_blank" class="linkedin-share" aria-label="Share on LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                    <a href="#" target="_blank" class="whatsapp-share" aria-label="Share on WhatsApp"><i class="fab fa-whatsapp"></i></a>
                </div>
                <div class="share-url">
                    <input type="text" readonly>
                    <button class="copy-url">Copy</button>
                </div>
            </div>
        `;
        document.body.appendChild(shareOverlay);
        window.overlays.shareOverlay = shareOverlay;
    }
    window.overlays.overlayStack = window.overlays.overlayStack || [];

    // Reusable Trap Focus
    const trapFocus = (overlay) => {
        const focusableElements = overlay.querySelectorAll('button, a, input, [tabindex="0"]');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        firstFocusable?.focus();

        const handler = (e) => {
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
        overlay.addEventListener('keydown', handler);
        overlay._trapFocus = handler;
        return firstFocusable;
    };

// Reusable Close Handler
    let lastFocusedElement = null;
    const closeOverlay = (overlay, closeButton, contentSelector) => {
    return () => {
        overlay.classList.remove('active');
        overlay.addEventListener('transitionend', function handler(e) {
            if (e.propertyName !== 'opacity') return;
            window.overlays.overlayStack.pop();
            if (overlay._trapFocus) {
                overlay.removeEventListener('keydown', overlay._trapFocus);
                delete overlay._trapFocus;
            }
            if (overlay._outsideClickHandler) {
                overlay.removeEventListener('click', overlay._outsideClickHandler);
                delete overlay._outsideClickHandler;
            }
            window.restoreBackgroundScroll();
            // Only reactivate previous overlay if the closed overlay is not the share overlay
            if (overlay !== window.overlays.shareOverlay && window.overlays.overlayStack.length) {
                const previousOverlay = window.overlays.overlayStack[window.overlays.overlayStack.length - 1];
                previousOverlay.classList.add('active');
                window.disableBackgroundScroll();
                trapFocus(previousOverlay);
            } else {
                lastFocusedElement?.focus();
            }
            overlay.removeEventListener('transitionend', handler);
        }, { once: true });
    };
};

    // Render Post Overlay
    window.renderPostOverlay = (postId) => {
        lastFocusedElement = document.activeElement;
        const post = blogPosts.find(p => p.id === postId);
        if (!post) {
            window.overlays.articleOverlay.classList.remove('active');
            document.getElementById('main-content').innerHTML = '<h2>Post not found</h2>';
            window.restoreBackgroundScroll();
            return;
        }
        window.overlays.articleOverlay.querySelector('.article-overlay-content').innerHTML = `
            <article class="article-card">
                <div class="article-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                </div>
                <div class="article-content">
                    <span class="category">${post.category}</span>
                    <h1>${post.title}</h1>
                    <p class="excerpt">${post.excerpt}</p>
                    <div class="meta">
                        <span><i class="fas fa-clock"></i> ${post.readTime}</span>
                        <span><i class="fas fa-calendar-alt"></i> ${post.date}</span>
                    </div>
                    ${post.content}
                    <div class="article-actions">
                        <button class="save-btn" data-post-id="${post.id}" aria-label="Save article"><i class="${localStorage.getItem(`saved-${post.id}`) ? 'fas' : 'far'} fa-bookmark"></i></button>
                        <button class="share-btn" aria-label="Share article"><i class="fas fa-share-alt"></i></button>
                    </div>
                </div>
            </article>
        `;
        window.resetOverlays(window.overlays.articleOverlay);
        window.overlays.overlayStack.push(window.overlays.articleOverlay);
        window.overlays.articleOverlay.classList.add('active');
        window.disableBackgroundScroll(window.overlays.articleOverlay);
        trapFocus(window.overlays.articleOverlay);

        const closeButton = window.overlays.articleOverlay.querySelector('.close-article-overlay');
        closeButton.onclick = () => {
            window.overlays.articleOverlay.classList.remove('active');
            window.overlays.articleOverlay.addEventListener('transitionend', function handler(e) {
                if (e.propertyName !== 'opacity') return;
                window.overlays.overlayStack.pop();
                if (window.overlays.articleOverlay._trapFocus) {
                    window.overlays.articleOverlay.removeEventListener('keydown', window.overlays.articleOverlay._trapFocus);
                    delete window.overlays.articleOverlay._trapFocus;
                }
                if (window.overlays.articleOverlay._outsideClickHandler) {
                    window.overlays.articleOverlay.removeEventListener('click', window.overlays.articleOverlay._outsideClickHandler);
                    delete window.overlays.articleOverlay._outsideClickHandler;
                }
                window.restoreBackgroundScroll();
                if (window.overlays.overlayStack.length) {
                    const previousOverlay = window.overlays.overlayStack[window.overlays.overlayStack.length - 1];
                    previousOverlay.classList.add('active');
                    window.disableBackgroundScroll(previousOverlay);
                    trapFocus(previousOverlay);
                } else {
                    lastFocusedElement?.focus();
                }
                window.overlays.articleOverlay.removeEventListener('transitionend', handler);
            }, { once: true });
        };
        const outsideClickHandler = window.handleOutsideClick(window.overlays.articleOverlay, closeButton, ['.article-overlay-container']);
        window.overlays.articleOverlay.addEventListener('click', outsideClickHandler);
        window.overlays.articleOverlay._outsideClickHandler = outsideClickHandler;
    };

    // Render Saved Articles Overlay
    window.renderSavedArticles = () => {
        lastFocusedElement = document.activeElement;
        const savedPosts = blogPosts
            .filter(post => localStorage.getItem(`saved-${post.id}`))
            .sort((a, b) => (localStorage.getItem(`saveTime-${b.id}`) || 0) - (localStorage.getItem(`saveTime-${a.id}`) || 0));
        window.overlays.savedArticlesOverlay.querySelector('.saved-articles-content').innerHTML = savedPosts.length > 0 ? `
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
        window.resetOverlays(window.overlays.savedArticlesOverlay);
        window.overlays.overlayStack.push(window.overlays.savedArticlesOverlay);
        window.overlays.savedArticlesOverlay.classList.add('active');
        window.disableBackgroundScroll(window.overlays.savedArticlesOverlay);
        trapFocus(window.overlays.savedArticlesOverlay);

        const closeButton = window.overlays.savedArticlesOverlay.querySelector('.close-saved-overlay');
        closeButton.onclick = closeOverlay(window.overlays.savedArticlesOverlay, closeButton, '.saved-articles-container');
        const outsideClickHandler = window.handleOutsideClick(window.overlays.savedArticlesOverlay, closeButton, ['.saved-articles-container']);
        window.overlays.savedArticlesOverlay.addEventListener('click', outsideClickHandler);
        window.overlays.savedArticlesOverlay._outsideClickHandler = outsideClickHandler;
    };

    // Share Overlay Close Handler
    const closeShareButton = window.overlays.shareOverlay.querySelector('.close-share');
    closeShareButton.onclick = closeOverlay(window.overlays.shareOverlay, closeShareButton, '.share-container');

    // Copy URL Handler for Share Overlay
    const copyUrl = window.overlays.shareOverlay.querySelector('.copy-url');
    if (copyUrl) {
        copyUrl.onclick = () => {
            const urlInput = window.overlays.shareOverlay.querySelector('.share-url input');
            urlInput.select();
            try {
                document.execCommand('copy');
                copyUrl.textContent = 'Copied!';
                setTimeout(() => copyUrl.textContent = 'Copy', 2000);
            } catch (err) {
                console.error('Copy failed:', err);
            }
        };
    }
});