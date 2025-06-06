document.addEventListener('DOMContentLoaded', () => {
    // Utility Functions
    const toggleClass = (element, className) => element?.classList.toggle(className);

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    };

    const disableBackgroundScroll = (overlay) => {
        if (overlay && overlay.classList.contains('search-overlay')) {
            document.body.classList.add('search-overlay-active');
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        }
        // Other overlays (article, saved, share) rely on CSS (fixed position, high z-index) to cover content without affecting header
    };

    const restoreBackgroundScroll = () => {
        const overlays = [articleOverlay, savedArticlesOverlay, shareOverlay, document.querySelector('.search-overlay')].filter(o => o);
        if (!overlays.some(o => o.classList.contains('active') && o.classList.contains('search-overlay'))) {
            document.body.classList.remove('search-overlay-active');
            document.body.style.overflow = 'auto';
            document.body.style.height = 'auto';
        }
    };

    const handleOutsideClick = (overlay, closeButton, contentSelectors) => {
        return (e) => {
            if (!contentSelectors.some(selector => e.target.closest(selector)) && overlay.classList.contains('active') && !e.target.closest('.chatbot-overlay')) {
                closeButton.click();
            }
        };
    };

    // Main Content Setup
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error('Main content container not found');
        return;
    }

    // Article Card Rendering
    const renderArticleCard = (post) => `
        <div class="article-card" data-post-id="${post.id}">
            <div class="article-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="article-content">
                <span class="category">${post.category}</span>
                <h3><a href="#post/${post.id}">${post.title}</a></h3>
                <div class="meta">
                    <span><i class="fas fa-clock"></i> ${post.readTime}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${post.date}</span>
                </div>
                <div class="article-actions">
                    <button class="save-btn" data-post-id="${post.id}" aria-label="Save article"><i class="${localStorage.getItem(`saved-${post.id}`) ? 'fas' : 'far'} fa-bookmark"></i></button>
                    <button class="share-btn" aria-label="Share article"><i class="fas fa-share-alt"></i></button>
                </div>
            </div>
        </div>
    `;

    // Overlay Creation
    const articleOverlay = document.createElement('div');
    articleOverlay.className = 'article-overlay';
    articleOverlay.innerHTML = `
        <div class="article-overlay-container">
            <button class="close-article-overlay" aria-label="Close article"><i class="fas fa-times"></i></button>
            <div class="article-overlay-content"></div>
        </div>
    `;
    document.body.appendChild(articleOverlay);

    const savedArticlesOverlay = document.createElement('div');
    savedArticlesOverlay.className = 'saved-articles-overlay';
    savedArticlesOverlay.innerHTML = `
        <div class="saved-articles-container">
            <button class="close-saved-overlay" aria-label="Close saved articles"><i class="fas fa-times"></i></button>
            <div class="saved-articles-content"></div>
        </div>
    `;
    document.body.appendChild(savedArticlesOverlay);

    const shareOverlay = document.createElement('div');
    shareOverlay.className = 'share-overlay';
    shareOverlay.innerHTML = `
        <div class="share-container">
            <button class="close-share" aria-label="Close share"><i class="fas fa-times"></i></button>
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

    const overlayStack = [];

    // Overlay Management
    const resetOverlays = (excludeOverlay = null) => {
        const overlays = [articleOverlay, savedArticlesOverlay, shareOverlay, document.querySelector('.search-overlay')].filter(o => o && o !== excludeOverlay);
        overlays.forEach(overlay => overlay?.classList.remove('active'));
        restoreBackgroundScroll();

        const mainNav = document.querySelector('.main-nav');
        const menuToggle = document.querySelector('.menu-toggle');
        if (mainNav) mainNav.classList.remove('active');
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    };

    // Page Rendering Functions
    const renderHome = () => {
        mainContent.innerHTML = `
            <section class="hero" id="hero">
                <div class="container">
                    <div class="hero-content">
                        <span class="category-badge" aria-label="Featured Content">Featured</span>
                        <h1>Explore the Future of Technology</h1>
                        <p class="excerpt">Discover cutting-edge AI innovations, programming tutorials, and in-depth gadget reviews.</p>
                        <a href="#posts" class="read-more" aria-label="Read more about technology innovations">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                    <div class="hero-image">
                        <img src="images/ai_image.png" alt="Illustration of futuristic technology and AI innovations" loading="lazy">
                    </div>
                </div>
            </section>
            <section class="featured-posts" id="posts">
                <div class="container">
                    <h2 class="section-title">Featured Posts</h2>
                    <div class="slider-container">
                        <div class="slider">
                            ${blogPosts.map(post => `
                                <div class="slide" data-post-id="${post.id}">
                                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                                    <div class="slide-content">
                                        <span class="category">${post.category}</span>
                                        <h3><a href="#post/${post.id}">${post.title}</a></h3>
                                        <div class="meta">
                                            <span><i class="fas fa-clock"></i> ${post.readTime}</span>
                                            <span><i class="fas fa-calendar-alt"></i> ${post.date}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <button class="slider-nav prev" aria-label="Previous slide"><i class="fas fa-chevron-left"></i></button>
                        <button class="slider-nav next" aria-label="Next slide"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
            </section>
            <section class="main-content">
                <div class="container">
                    <div class="articles-grid" id="articles-grid">
                        ${blogPosts.map(post => renderArticleCard(post)).join('')}
                    </div>
                    <aside class="sidebar">
                        <div class="ad-image">
                            ${ads.length > 0 ? `<img src="${ads[0].image}" alt="${ads[0].alt}" loading="lazy">` : '<p>No ads available.</p>'}
                        </div>
                    </aside>
                </div>
                <div class="pagination-wrapper">
                    <div class="pagination" id="pagination"></div>
                </div>
            </section>
            <div class="search-overlay">
                <form class="search-form">
                    <input type="text" placeholder="Search SabirBlog..." aria-label="Search">
                    <button type="submit" aria-label="Search"><i class="fas fa-search"></i></button>
                </form>
                <button class="close-search" aria-label="Close search"><i class="fas fa-times"></i></button>
                <div class="search-suggestions"></div>
                <div class="search-results-grid"></div>
            </div>
        `;
        initializeFeatures();
    };

    const renderPostOverlay = (postId) => {
        const post = blogPosts.find(p => p.id === postId);
        if (!post) {
            articleOverlay.classList.remove('active');
            mainContent.innerHTML = '<h2>Post not found</h2>';
            restoreBackgroundScroll();
            return;
        }
        articleOverlay.querySelector('.article-overlay-content').innerHTML = `
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
        resetOverlays(articleOverlay);
        overlayStack.push(articleOverlay);
        articleOverlay.classList.add('active');
        disableBackgroundScroll(articleOverlay);
        initializeSaveButtons();
        initializeShareButtons();

        localStorage.setItem(`lastRead-${postId}`, Date.now());

        const focusableElements = articleOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        firstFocusable.focus();

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
        articleOverlay.addEventListener('keydown', trapFocus);
        articleOverlay._trapFocus = trapFocus;

        const closeButton = articleOverlay.querySelector('.close-article-overlay');
        const outsideClickHandler = handleOutsideClick(articleOverlay, closeButton, ['.article-overlay-container']);
        articleOverlay.addEventListener('click', outsideClickHandler);
        articleOverlay._outsideClickHandler = outsideClickHandler;
    };

    const renderCategory = (category) => {
        const filteredPosts = blogPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
        mainContent.innerHTML = `
            <section class="main-content">
                <div class="container">
                    <h2 class="section-title">${category}</h2>
                    <div class="articles-grid" id="articles-grid">
                        ${filteredPosts.length > 0 ? filteredPosts.map(post => renderArticleCard(post)).join('') : '<p>No posts found in this category.</p>'}
                    </div>
                    <aside class="sidebar">
                        <div class="ad-image">
                            ${ads.length > 0 ? `<img src="${ads[0].image}" alt="${ads[0].alt}" loading="lazy">` : '<p>No ads available.</p>'}
                        </div>
                    </aside>
                </div>
                <div class="pagination-wrapper">
                    <div class="pagination" id="pagination"></div>
                </div>
            </section>
            <div class="search-overlay">
                <form class="search-form">
                    <input type="text" placeholder="Search SabirBlog..." aria-label="Search">
                    <button type="submit" aria-label="Search"><i class="fas fa-search"></i></button>
                </form>
                <button class="close-search" aria-label="Close search"><i class="fas fa-times"></i></button>
                <div class="search-suggestions"></div>
                <div class="search-results-grid"></div>
            </div>
        `;
        initializeFeatures();
    };

    const renderSavedArticles = () => {
        const savedPosts = blogPosts
            .filter(post => localStorage.getItem(`saved-${post.id}`))
            .sort((a, b) => (localStorage.getItem(`saveTime-${b.id}`) || 0) - (localStorage.getItem(`saveTime-${a.id}`) || 0));
        savedArticlesOverlay.querySelector('.saved-articles-content').innerHTML = savedPosts.length > 0 ? `
            <h2 class="section-title">Saved Articles</h2>
            <div class="articles-grid">
                ${savedPosts.map(post => renderArticleCard(post)).join('')}
            </div>
        ` : `
            <div class="empty-state">
                <h3>No Saved Articles</h3>
                <p>You haven't saved any articles yet. Click the bookmark icon on any article to save it here.</p>
            </div>
        `;
        resetOverlays(savedArticlesOverlay);
        overlayStack.push(savedArticlesOverlay);
        savedArticlesOverlay.classList.add('active');
        disableBackgroundScroll(savedArticlesOverlay);
        initializeSaveButtons();
        initializeShareButtons();

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
        const outsideClickHandler = handleOutsideClick(savedArticlesOverlay, closeButton, ['.saved-articles-container']);
        savedArticlesOverlay.addEventListener('click', outsideClickHandler);
        savedArticlesOverlay._outsideClickHandler = outsideClickHandler;
    };

    const renderAbout = () => {
        mainContent.innerHTML = `
            <section class="about-section">
                <div class="container">
                    <h1>About SabirBlog</h1>
                    <p>SabirBlog is your go-to source for cutting-edge insights on AI, programming, graphic design, and technology trends. We aim to empower our readers with practical tutorials, in-depth reviews, and the latest innovations in the tech world.</p>
                    <p>Founded in 2024, our mission is to make complex tech topics accessible to everyone, from beginners to seasoned professionals.</p>
                </div>
            </section>
        `;
        initializeFeatures();
    };

    // Client-Side Routing
    const handleRouting = () => {
        let hash = window.location.hash || '#home';
        if (!window.location.hash) {
            window.location.hash = '#home';
            hash = '#home';
        }
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.main-nav a[href="${hash}"]`);
        if (activeLink) activeLink.classList.add('active');

        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        setTimeout(() => {
            try {
                resetOverlays();
                if (hash === '#home') {
                    renderHome();
                } else if (hash.startsWith('#post/')) {
                    const postId = hash.split('/')[1];
                    renderPostOverlay(postId);
                } else if (hash.startsWith('#category/')) {
                    const category = decodeURIComponent(hash.split('/')[1]);
                    renderCategory(category);
                } else if (hash === '#about') {
                    renderAbout();
                } else if (hash === '#save') {
                    renderSavedArticles();
                } else {
                    renderHome();
                }
                mainContent.style.opacity = '1';
                mainContent.style.transform = 'translateY(0)';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                console.error('Routing error:', error);
                mainContent.innerHTML = '<h2>Error loading page</h2>';
                restoreBackgroundScroll();
            }
        }, 400);
    };

    // Save Button Initialization
    const initializeSaveButtons = () => {
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
                    showMessage('Maximum saved articles limit reached.');
                    return;
                }
                const isSaved = button.classList.toggle('saved');
                button.innerHTML = isSaved ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
                if (isSaved) {
                    localStorage.setItem(`saved-${articleId}`, 'true');
                    localStorage.setItem(`saveTime-${articleId}`, Date.now());
                    showMessage('Article saved!');
                } else {
                    localStorage.removeItem(`saved-${articleId}`);
                    localStorage.removeItem(`saveTime-${articleId}`);
                    showMessage('Article removed from saved.');
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

    // Share Button Initialization
    const initializeShareButtons = () => {
        document.querySelectorAll('.share-btn').forEach(button => {
            button.removeEventListener('click', button._shareHandler);
            button._shareHandler = (e) => {
                e.stopPropagation();
                const articleCard = button.closest('.article-card');
                const postId = articleCard.getAttribute('data-post-id');
                const post = blogPosts.find(p => p.id === postId);
                const articleLink = `https://sabirblog.com/post/${postId}`;
                const articleTitle = post?.title || document.title;
                shareOverlay.querySelector('.facebook-share').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleLink)}`;
                shareOverlay.querySelector('.twitter-share').href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleLink)}&text=${encodeURIComponent(articleTitle)}`;
                shareOverlay.querySelector('.linkedin-share').href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(articleLink)}&title=${encodeURIComponent(articleTitle)}`;
                shareOverlay.querySelector('.whatsapp-share').href = `https://wa.me/?text=${encodeURIComponent(`${articleTitle} ${articleLink}`)}`;
                shareOverlay.querySelector('.share-url input').value = articleLink;
                resetOverlays(shareOverlay);
                overlayStack.push(shareOverlay);
                shareOverlay.classList.add('active');
                disableBackgroundScroll(shareOverlay);

                const closeButton = shareOverlay.querySelector('.close-share');
                const outsideClickHandler = handleOutsideClick(shareOverlay, closeButton, ['.share-container']);
                shareOverlay.addEventListener('click', outsideClickHandler);
                shareOverlay._outsideClickHandler = outsideClickHandler;
            };
            button.addEventListener('click', button._shareHandler);
        });

        const closeShare = shareOverlay.querySelector('.close-share');
        if (closeShare) {
            closeShare.removeEventListener('click', closeShare._closeHandler);
            closeShare._closeHandler = () => {
                shareOverlay.classList.remove('active');
                overlayStack.pop();
                restoreBackgroundScroll();
                if (shareOverlay._outsideClickHandler) {
                    shareOverlay.removeEventListener('click', shareOverlay._outsideClickHandler);
                    delete shareOverlay._outsideClickHandler;
                }
                if (overlayStack.length > 0) {
                    const previousOverlay = overlayStack[overlayStack.length - 1];
                    previousOverlay.classList.add('active');
                    disableBackgroundScroll(previousOverlay);
                    const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                    const firstFocusable = focusableElements[0];
                    firstFocusable?.focus();
                }
            };
            closeShare.addEventListener('click', closeShare._closeHandler);
        }

        const copyUrl = shareOverlay.querySelector('.copy-url');
        if (copyUrl) {
            copyUrl.removeEventListener('click', copyUrl._copyHandler);
            copyUrl._copyHandler = () => {
                const urlInput = shareOverlay.querySelector('.share-url input');
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

    // Notification System
    const showMessage = (message) => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed; bottom: 20px; left: 20px; background: #10b981; color: white; padding: 10px 20px;
            border-radius: 8px; z-index: 3000; opacity: 0; transition: opacity 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.style.opacity = '1', 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    // Feature Initialization
    const initializeFeatures = () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        if (menuToggle && mainNav) {
            menuToggle.removeEventListener('click', menuToggle._toggleHandler);
            menuToggle._toggleHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleClass(mainNav, 'active');
                toggleClass(menuToggle, 'active');
                menuToggle.setAttribute('aria-expanded', mainNav.classList.contains('active'));
            };
            menuToggle.addEventListener('click', menuToggle._toggleHandler);

            mainNav.querySelectorAll('a').forEach(link => {
                link.removeEventListener('click', link._closeNav);
                link._closeNav = () => {
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                };
                link.addEventListener('click', link._closeNav);
            });
        }

        const readMoreBtn = document.querySelector('.read-more');
        if (readMoreBtn) {
            readMoreBtn.removeEventListener('click', readMoreBtn._clickHandler);
            readMoreBtn._clickHandler = (e) => {
                e.preventDefault();
                const featuredPosts = document.querySelector('#posts');
                if (featuredPosts) {
                    featuredPosts.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            };
            readMoreBtn.addEventListener('click', readMoreBtn._clickHandler);
        }

        // Search Functionality
        const searchBtn = document.querySelector('.search-btn');
        const searchOverlay = document.querySelector('.search-overlay');
        const closeSearch = document.querySelector('.close-search');
        const searchInput = document.querySelector('.search-form input');
        const searchForm = document.querySelector('.search-form');
        const searchResultsGrid = document.querySelector('.search-results-grid');
        const searchSuggestions = document.querySelector('.search-suggestions');

        if (!searchBtn || !searchOverlay || !searchInput || !closeSearch || !searchForm || !searchResultsGrid || !searchSuggestions) {
            console.error('Search elements missing');
            return;
        }

        searchBtn.removeEventListener('click', searchBtn._searchHandler);
        searchBtn._searchHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            resetOverlays(searchOverlay);
            overlayStack.push(searchOverlay);
            searchOverlay.classList.toggle('active');
            toggleClass(searchBtn, 'active');
            if (searchOverlay.classList.contains('active')) {
                setTimeout(() => searchInput.focus(), 100);
                populateSearchResults();
                disableBackgroundScroll(searchOverlay);
                const closeButton = searchOverlay.querySelector('.close-search');
                const outsideClickHandler = handleOutsideClick(searchOverlay, closeButton, ['.search-form', '.close-search', '.search-suggestions', '.search-results-grid']);
                searchOverlay.addEventListener('click', outsideClickHandler);
                searchOverlay._outsideClickHandler = outsideClickHandler;
            } else {
                searchBtn.classList.remove('active');
                restoreBackgroundScroll();
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
            overlayStack.pop();
            restoreBackgroundScroll();
            if (searchOverlay._outsideClickHandler) {
                searchOverlay.removeEventListener('click', searchOverlay._outsideClickHandler);
                delete searchOverlay._outsideClickHandler;
            }
            if (overlayStack.length) {
                const previousOverlay = overlayStack[overlayStack.length - 1];
                previousOverlay.classList.add('active');
                disableBackgroundScroll(previousOverlay);
                const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                const firstFocusable = focusableElements[0];
                firstFocusable?.focus();
            }
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

        const debouncedSearch = debounce(populateSearchResults, 200);
        searchInput.removeEventListener('input', debouncedSearch);
        searchInput.addEventListener('input', debouncedSearch);

        function populateSearchResults() {
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
                articleCard.innerHTML = renderArticleCard(post);
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
                        renderPostOverlay(postId);
                    }
                };
                card.addEventListener('click', card._clickHandler);
            });

            initializeSaveButtons();
            initializeShareButtons();
        }

        // Featured Posts Slider
        const slider = document.querySelector('.slider');
        const prevBtn = document.querySelector('.slider-nav.prev');
        const nextBtn = document.querySelector('.slider-nav.next');

        if (slider) {
            let isDragging = false;
            let startX, scrollLeft;

            const recentPosts = blogPosts
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10);
            const lastReadPosts = blogPosts
                .filter(post => localStorage.getItem(`lastRead-${post.id}`))
                .sort((a, b) => (localStorage.getItem(`lastRead-${b.id}`) || 0) - (localStorage.getItem(`lastRead-${a.id}`) || 0))
                .slice(0, 5);
            const featuredPosts = [...new Set([...recentPosts, ...lastReadPosts])];

            slider.innerHTML = featuredPosts.map(post => `
                <div class="slide" data-post-id="${post.id}">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <div class="slide-content">
                        <span class="category">${post.category}</span>
                        <h3><a href="#post/${post.id}">${post.title}</a></h3>
                        <div class="meta">
                            <span><i class="fas fa-clock"></i> ${post.readTime}</span>
                            <span><i class="fas fa-calendar-alt"></i> ${post.date}</span>
                        </div>
                        ${localStorage.getItem(`lastRead-${post.id}`) ? '<span class="recently-read">Recently Read</span>' : ''}
                    </div>
                </div>
            `).join('');

            slider.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.pageX - slider.offsetLeft;
                scrollLeft = slider.scrollLeft;
                slider.style.cursor = 'grabbing';
            });

            slider.addEventListener('mouseleave', () => {
                isDragging = false;
                slider.style.cursor = 'grab';
            });

            slider.addEventListener('mouseup', () => {
                isDragging = false;
                slider.style.cursor = 'grab';
            });

            slider.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                const x = e.pageX - slider.offsetLeft;
                const walk = (x - startX) * 2;
                slider.scrollLeft = scrollLeft - walk;
            });

            if (prevBtn) prevBtn.addEventListener('click', () => slider.scrollBy({ left: -300, behavior: 'smooth' }));
            if (nextBtn) nextBtn.addEventListener('click', () => slider.scrollBy({ left: 300, behavior: 'smooth' }));

            slider.querySelectorAll('.slide').forEach(slide => {
                slide.removeEventListener('click', slide._clickHandler);
                slide._clickHandler = (e) => {
                    if (!e.target.closest('.save-btn, .share-btn')) {
                        const postId = slide.getAttribute('data-post-id');
                        renderPostOverlay(postId);
                    }
                };
                slide.addEventListener('click', slide._clickHandler);
            });
        }

        initializeSaveButtons();
        initializeShareButtons();

        const closeArticleOverlay = document.querySelector('.close-article-overlay');
        let lastFocusedElement = document.activeElement;
        if (closeArticleOverlay) {
            closeArticleOverlay.removeEventListener('click', closeArticleOverlay._closeHandler);
            closeArticleOverlay._closeHandler = () => {
                articleOverlay.classList.remove('active');
                overlayStack.pop();
                if (articleOverlay._trapFocus) {
                    articleOverlay.removeEventListener('keydown', articleOverlay._trapFocus);
                    delete articleOverlay._trapFocus;
                }
                restoreBackgroundScroll();
                if (articleOverlay._outsideClickHandler) {
                    articleOverlay.removeEventListener('click', articleOverlay._outsideClickHandler);
                    delete articleOverlay._outsideClickHandler;
                }
                if (overlayStack.length) {
                    const previousOverlay = overlayStack[overlayStack.length - 1];
                    previousOverlay.classList.add('active');
                    disableBackgroundScroll(previousOverlay);
                    const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                    const firstFocusable = focusableElements[0];
                    firstFocusable?.focus();
                } else {
                    lastFocusedElement?.focus();
                }
            };
            closeArticleOverlay.addEventListener('click', closeArticleOverlay._closeHandler);
        }

        document.querySelectorAll('.article-card').forEach(card => {
            card.removeEventListener('click', card._clickHandler);
            card._clickHandler = (e) => {
                if (!e.target.closest('.save-btn, .share-btn')) {
                    lastFocusedElement = document.activeElement;
                    const postId = card.getAttribute('data-post-id');
                    renderPostOverlay(postId);
                }
            };
            card.addEventListener('click', card._clickHandler);
        });

        const saveBtnHeader = document.querySelector('.save-btn-header');
        if (saveBtnHeader) {
            saveBtnHeader.removeEventListener('click', saveBtnHeader._saveHandler);
            saveBtnHeader._saveHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (savedArticlesOverlay.classList.contains('active')) {
                    document.querySelector('.close-saved-overlay').click();
                } else {
                    renderSavedArticles();
                }
            };
            saveBtnHeader.addEventListener('click', saveBtnHeader._saveHandler);
        }

        const closeSavedOverlay = document.querySelector('.close-saved-overlay');
        if (closeSavedOverlay) {
            closeSavedOverlay.removeEventListener('click', closeSavedOverlay._closeHandler);
            closeSavedOverlay._closeHandler = () => {
                savedArticlesOverlay.classList.remove('active');
                overlayStack.pop();
                if (savedArticlesOverlay._trapFocus) {
                    savedArticlesOverlay.removeEventListener('keydown', savedArticlesOverlay._trapFocus);
                    delete savedArticlesOverlay._trapFocus;
                }
                restoreBackgroundScroll();
                if (savedArticlesOverlay._outsideClickHandler) {
                    savedArticlesOverlay.removeEventListener('click', savedArticlesOverlay._outsideClickHandler);
                    delete savedArticlesOverlay._outsideClickHandler;
                }
                if (overlayStack.length) {
                    const previousOverlay = overlayStack[overlayStack.length - 1];
                    previousOverlay.classList.add('active');
                    disableBackgroundScroll(previousOverlay);
                    const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                    const firstFocusable = focusableElements[0];
                    firstFocusable?.focus();
                } else {
                    lastFocusedElement.focus();
                }
            };
            closeSavedOverlay.addEventListener('click', closeSavedOverlay._closeHandler);
        }

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        const scrollTop = document.querySelector('.scroll-top');
        if (scrollTop) {
            window.addEventListener('scroll', () => {
                scrollTop.classList.toggle('show', window.scrollY > 300);
            });
            scrollTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Pagination
        const articlesPerPage = 6;
        let currentPage = 1;

        const showPage = (page) => {
            const articleCards = Array.from(document.querySelectorAll('.articles-grid .article-card'));
            const totalPages = Math.ceil(articleCards.length / articlesPerPage);
            currentPage = Math.max(1, Math.min(page, totalPages));
            const start = (currentPage - 1) * articlesPerPage;
            const end = start + articlesPerPage;

            const articlesGrid = document.querySelector('.articles-grid');
            articlesGrid.style.opacity = '0';
            articlesGrid.style.transform = 'translateY(20px)';
            articlesGrid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

            setTimeout(() => {
                articleCards.forEach((card, index) => {
                    card.style.display = index >= start && index < end ? 'block' : 'none';
                });
                articlesGrid.style.opacity = '1';
                articlesGrid.style.transform = 'translateY(0)';
                renderPagination(totalPages);
            }, 300);
        };

        const renderPagination = (totalPages) => {
            const pagination = document.getElementById('pagination');
            if (!pagination) return;
            pagination.innerHTML = '';

            const createButton = (text, page, isDisabled = false, isActive = false) => {
                const btn = document.createElement('button');
                btn.textContent = text;
                btn.setAttribute('aria-label', text);
                if (isDisabled) btn.classList.add('disabled');
                if (isActive) btn.classList.add('active');
                if (!isDisabled) {
                    btn.addEventListener('click', () => {
                        showPage(page);
                        const articlesGrid = document.querySelector('.articles-grid');
                        if (articlesGrid) {
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

        if (document.querySelectorAll('.articles-grid .article-card').length > articlesPerPage) {
            showPage(1);
        }
    };

    window.addEventListener('hashchange', handleRouting);
    handleRouting();
});