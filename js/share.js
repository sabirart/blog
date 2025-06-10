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


window.initializeShareButtons = () => {
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.removeEventListener('click', btn._shareHandler);
        btn._shareHandler = (e) => {
            e.stopPropagation();
            const postId = btn.closest('.article-card')?.getAttribute('data-post-id');
            if (!postId) return;
            const post = blogPosts.find(p => p.id === postId);
            if (!post) return;
            
            window.overlays.shareOverlay.querySelector('.share-overlay-content').innerHTML = `
                <h3>Share "${sanitize(post.title)}"</h3>
                <div class="share-options">
                    <button class="share-option" data-share="twitter">Twitter <i class="fab fa-twitter"></i></button>
                    <button class="share-option" data-share="facebook">Facebook <i class="fab fa-facebook"></i></button>
                    <button class="share-option" data-share="linkedin">LinkedIn <i class="fab fa-linkedin"></i></button>
                    <button class="share-option" data-share="copy">Copy Link <i class="fas fa-link"></i></button>
                </div>
            `;
            window.resetOverlays(window.overlays.shareOverlay);
            window.overlays.overlayStack.push(window.overlays.shareOverlay);
            window.overlays.shareOverlay.classList.add('active');
            window.disableBackgroundScroll(window.overlays.shareOverlay);
            
            const closeShareOverlay = window.overlays.shareOverlay.querySelector('.close-share-overlay');
            closeShareOverlay.onclick = () => {
                window.overlays.shareOverlay.classList.remove('active');
                window.overlays.shareOverlay.addEventListener('transitionend', function handler(e) {
                    if (e.propertyName !== 'opacity') return;
                    window.overlays.overlayStack.pop();
                    window.restoreBackgroundScroll();
                    window.overlays.shareOverlay.removeEventListener('transitionend', handler);
                }, { once: true });
            };
            
            const shareOptions = window.overlays.shareOverlay.querySelectorAll('.share-option');
            shareOptions.forEach(option => {
                option.onclick = () => {
                    const platform = option.getAttribute('data-share');
                    const url = `${window.location.origin}/#post/${postId}`;
                    const text = encodeURIComponent(post.title);
                    let shareUrl;
                    switch (platform) {
                        case 'twitter':
                            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                            break;
                        case 'facebook':
                            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                            break;
                        case 'linkedin':
                            shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`;
                            break;
                        case 'copy':
                            navigator.clipboard.write(url).then(() => window.showMessage('Link copied to clipboard!'));
                            return;
                    }
                    window.open(shareUrl, '_blank');
                };
            });
        };
        btn.addEventListener('click', btn._shareHandler);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Share Button Initialization
    window.initializeShareButtons = () => {
        // Function to bind share button handlers
        const bindShareButtons = () => {
            const shareButtons = document.querySelectorAll('.share-btn, .article-overlay .article-card .share-btn');
            shareButtons.forEach(button => {
                // Remove existing handler to prevent duplicates
                button.removeEventListener('click', button._shareHandler);
                button._shareHandler = (e) => {
                    e.stopPropagation();
                    const articleCard = button.closest('.article-card');
                    const postId = articleCard.getAttribute('data-post-id');
                    const post = blogPosts.find(p => p.id === postId);
                    const articleLink = `https://sabirblog.com/post/${postId}`;
                    const articleTitle = post?.title || document.title;
                    window.overlays.shareOverlay.querySelector('.facebook-share').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleLink)}`;
                    window.overlays.shareOverlay.querySelector('.twitter-share').href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleLink)}&text=${encodeURIComponent(articleTitle)}`;
                    window.overlays.shareOverlay.querySelector('.linkedin-share').href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(articleLink)}&title=${encodeURIComponent(articleTitle)}`;
                    window.overlays.shareOverlay.querySelector('.whatsapp-share').href = `https://wa.me/?text=${encodeURIComponent(`${articleTitle} ${articleLink}`)}`;
                    window.overlays.shareOverlay.querySelector('.share-url input').value = articleLink;
                    window.resetOverlays(window.overlays.shareOverlay);
                    window.overlays.overlayStack.push(window.overlays.shareOverlay);
                    window.overlays.shareOverlay.classList.add('active');
                    window.disableBackgroundScroll(window.overlays.shareOverlay);

                    const closeButton = window.overlays.shareOverlay.querySelector('.close-share');
                    const outsideClickHandler = window.handleOutsideClick(window.overlays.shareOverlay, closeButton, ['.share-container']);
                    window.overlays.shareOverlay.addEventListener('click', outsideClickHandler);
                    window.overlays.shareOverlay._outsideClickHandler = outsideClickHandler;
                };
                button.addEventListener('click', button._shareHandler);
            });
        };

        // Initial binding
        bindShareButtons();

        // Observe article overlay for dynamic button additions
        const articleOverlay = document.querySelector('.article-overlay');
        if (articleOverlay) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length) {
                        bindShareButtons();
                    }
                });
            });
            observer.observe(articleOverlay, { childList: true, subtree: true });
        }

        const closeShare = window.overlays.shareOverlay.querySelector('.close-share');
        if (closeShare) {
            closeShare.removeEventListener('click', closeShare._closeHandler);
            closeShare._closeHandler = () => {
                window.overlays.shareOverlay.classList.remove('active');
                window.overlays.overlayStack.pop();
                window.restoreBackgroundScroll();
                if (window.overlays.shareOverlay._outsideClickHandler) {
                    window.overlays.shareOverlay.removeEventListener('click', window.overlays.shareOverlay._outsideClickHandler);
                    delete window.overlays.shareOverlay._outsideClickHandler;
                }
                if (window.overlays.overlayStack.length > 0) {
                    const previousOverlay = window.overlays.overlayStack[window.overlays.overlayStack.length - 1];
                    previousOverlay.classList.add('active');
                    window.disableBackgroundScroll(previousOverlay);
                    const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                    const firstFocusable = focusableElements[0];
                    firstFocusable?.focus();
                }
            };
            closeShare.addEventListener('click', closeShare._closeHandler);
        }

        const copyUrl = window.overlays.shareOverlay.querySelector('.copy-url');
        if (copyUrl) {
            copyUrl.removeEventListener('click', copyUrl._copyHandler);
            copyUrl._copyHandler = () => {
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
            copyUrl.addEventListener('click', copyUrl._copyHandler);
        }
    };
});