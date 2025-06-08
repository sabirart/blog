// Share Button Initialization
    window.initializeShareButtons = () => {
        document.querySelectorAll('.share-btn').forEach(button => {
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