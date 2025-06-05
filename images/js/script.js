// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // === Utility Functions ===
    // Toggle a CSS class on an element
    const toggleClass = (element, className) => {
        if (element) element.classList.toggle(className);
    };

    // Debounce function to limit the rate of function execution
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    };

    // === Main Content Setup ===
    // Get the main content container
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error('Main content container not found');
        return;
    }

    // === Article Card Rendering ===
    // Generate HTML for an article card
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

    // === Overlay Creation ===
    // Create article overlay for displaying full post content
    const articleOverlay = document.createElement('div');
    articleOverlay.className = 'article-overlay';
    articleOverlay.innerHTML = `
        <div class="article-overlay-container">
            <button class="close-article-overlay" aria-label="Close article"><i class="fas fa-times"></i></button>
            <div class="article-overlay-content"></div>
        </div>
    `;
    document.body.appendChild(articleOverlay);

    // Create saved articles overlay for displaying saved posts
    const savedArticlesOverlay = document.createElement('div');
    savedArticlesOverlay.className = 'saved-articles-overlay';
    savedArticlesOverlay.innerHTML = `
        <div class="saved-articles-container">
            <button class="close-saved-overlay" aria-label="Close saved articles"><i class="fas fa-times"></i></button>
            <div class="saved-articles-content"></div>
        </div>
    `;
    document.body.appendChild(savedArticlesOverlay);

    // Create share overlay for sharing articles
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

    // Track active overlays to manage nested overlay states
    const overlayStack = [];

    // === Overlay Management ===
    // Close all overlays except the specified one
    const resetOverlays = (excludeOverlay = null) => {
        const overlays = [articleOverlay, savedArticlesOverlay, shareOverlay, document.querySelector('.search-overlay')].filter(o => o && o !== excludeOverlay);
        overlays.forEach(overlay => overlay?.classList.remove('active'));
        
        // Close mobile navigation
        const mainNav = document.querySelector('.main-nav');
        const menuToggle = document.querySelector('.menu-toggle');
        if (mainNav) mainNav.classList.remove('active');
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    };

    // === Page Rendering Functions ===
    // Render the home page with hero, featured posts, and article grid
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

    // Render individual post in an overlay
    const renderPostOverlay = (postId) => {
        const post = blogPosts.find(p => p.id === postId);
        if (!post) {
            articleOverlay.classList.remove('active');
            mainContent.innerHTML = '<h2>Post not found</h2>';
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
        initializeSaveButtons();
        initializeShareButtons();

        // Implement focus trap for accessibility
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
    };

    // Render posts filtered by category
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

    // Render saved articles overlay
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
        initializeSaveButtons();
        initializeShareButtons();

        // Implement focus trap for accessibility
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
    };

    // Render about page
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

    // === Client-Side Routing ===
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

        // Smooth transition for page changes
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
            } catch (error) {
                console.error('Routing error:', error);
                mainContent.innerHTML = '<h2>Error loading page</h2>';
            }
        }, 400);
    };

    // === Save Button Initialization ===
    const initializeSaveButtons = () => {
        const saveButtons = document.querySelectorAll('.save-btn');
        saveButtons.forEach(button => {
            const articleId = button.getAttribute('data-post-id');
            if (!articleId) {
                console.warn('Save button missing data-post-id:', button);
                return;
            }

            // Update button state based on localStorage
            if (localStorage.getItem(`saved-${articleId}`)) {
                button.classList.add('saved');
                button.innerHTML = '<i class="fas fa-bookmark"></i>';
            } else {
                button.classList.remove('saved');
                button.innerHTML = '<i class="far fa-bookmark"></i>';
            }

            // Remove existing listener to prevent duplicates
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

                // Sync all save buttons for the same article
                document.querySelectorAll(`.save-btn[data-post-id="${articleId}"]`).forEach(otherButton => {
                    otherButton.classList.toggle('saved', isSaved);
                    otherButton.innerHTML = isSaved ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
                });
            };
            button.addEventListener('click', button._saveHandler);
        });
    };

    // === Share Button Initialization ===
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
            };
            button.addEventListener('click', button._shareHandler);
        });

        const closeShare = shareOverlay.querySelector('.close-share');
        if (closeShare) {
            closeShare.removeEventListener('click', closeShare._closeHandler);
            closeShare._closeHandler = () => {
                shareOverlay.classList.remove('active');
                overlayStack.pop();
                if (overlayStack.length > 0) {
                    const previousOverlay = overlayStack[overlayStack.length - 1];
                    previousOverlay.classList.add('active');
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

    // === Notification System ===
    // Display temporary notification messages
    const showMessage = (message) => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed; bottom: 20px; left: 20px; background: #10b981; color: white; padding: 10px 20px;
            border-radius: 8px; z-index: 3000; opacity: 0; transition: opacity 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    // === Feature Initialization ===
    const initializeFeatures = () => {
        // Mobile Menu Toggle
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

        // === Search Functionality ===
        const searchBtn = document.querySelector('.search-btn');
        const searchOverlay = document.querySelector('.search-overlay');
        const closeSearch = document.querySelector('.close-search');
        const searchInput = document.querySelector('.search-form input');
        const searchForm = document.querySelector('.search-form');
        const searchResultsGrid = document.querySelector('.search-results-grid');
        const searchSuggestions = document.querySelector('.search-suggestions');

        // Validate search elements
        if (!searchBtn || !searchOverlay || !searchInput || !closeSearch) {
            console.error('Search elements missing:', {
                searchBtn: !!searchBtn,
                searchOverlay: !!searchOverlay,
                searchInput: !!searchInput,
                closeSearch: !!closeSearch
            });
            return;
        }

        // Toggle search overlay
        if (searchBtn && searchOverlay) {
            searchBtn.removeEventListener('click', searchBtn._searchHandler);
            searchBtn._searchHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Search button clicked');
                resetOverlays(searchOverlay);
                overlayStack.push(searchOverlay);
                searchOverlay.classList.toggle('active');
                searchBtn.classList.toggle('active');
                if (searchOverlay.classList.contains('active')) {
                    console.log('Focusing search input');
                    setTimeout(() => searchInput.focus(), 100);
                    populateSearchResults();
                } else {
                    searchBtn.classList.remove('active');
                }
            };
            searchBtn.addEventListener('click', searchBtn._searchHandler);
        }

        // Close search overlay
        if (closeSearch) {
            closeSearch.removeEventListener('click', closeSearch._closeHandler);
            closeSearch._closeHandler = () => {
                console.log('Close search clicked');
                searchOverlay.classList.remove('active');
                searchBtn.classList.remove('active');
                overlayStack.pop();
                if (overlayStack.length > 0) {
                    const previousOverlay = overlayStack[overlayStack.length - 1];
                    previousOverlay.classList.add('active');
                    const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                    const firstFocusable = focusableElements[0];
                    firstFocusable?.focus();
                }
            };
            closeSearch.addEventListener('click', closeSearch._closeHandler);
        }

        // Handle search form submission
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Search form submitted');
                populateSearchResults();
            });
        }

        // Focus trap for search overlay
        if (searchOverlay) {
            const focusableElements = searchOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            console.log('Focusable elements:', Array.from(focusableElements).map(el => el.outerHTML));
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
        }

        // Debounced search input
        const debouncedSearch = debounce(populateSearchResults, 200);
        if (searchInput) {
            searchInput.removeEventListener('input', debouncedSearch);
            searchInput.addEventListener('input', (e) => {
                console.log('Search input changed:', e.target.value);
                debouncedSearch();
            });
        }

        // Populate search results based on query
        function populateSearchResults() {
            if (!searchResultsGrid || !searchSuggestions) {
                console.error('Search results grid or suggestions missing');
                return;
            }
            searchResultsGrid.innerHTML = '';
            searchResultsGrid.classList.remove('active');
            const query = searchInput?.value.toLowerCase().trim() || '';
            console.log('Search query:', query);
            const filteredArticles = blogPosts.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.category.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query)
            );

            // Generate search suggestions
            const suggestions = blogPosts.slice(0, 3).map(post => post.title);
            searchSuggestions.innerHTML = suggestions.length > 0 ? `Try: ${suggestions.join(', ')}` : '';

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
                        console.log('Article card clicked:', postId);
                        renderPostOverlay(postId);
                    }
                };
                card.addEventListener('click', card._clickHandler);
            });

            initializeSaveButtons();
            initializeShareButtons();
        }

        // === Featured Posts Slider ===
        const slider = document.querySelector('.slider');
        const prevBtn = document.querySelector('.slider-nav.prev');
        const nextBtn = document.querySelector('.slider-nav.next');

        if (slider) {
            let isDragging = false;
            let startX, scrollLeft;

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

        // Initialize save and share buttons
        initializeSaveButtons();
        initializeShareButtons();

        // Close article overlay
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
                if (overlayStack.length > 0) {
                    const previousOverlay = overlayStack[overlayStack.length - 1];
                    previousOverlay.classList.add('active');
                    const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                    const firstFocusable = focusableElements[0];
                    firstFocusable?.focus();
                } else {
                    lastFocusedElement.focus();
                }
            };
            closeArticleOverlay.addEventListener('click', closeArticleOverlay._closeHandler);
        }


        // Handle article card clicks
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

        // Saved articles button in header
        const saveBtnHeader = document.querySelector('.save-btn-header');
        if (saveBtnHeader) {
            saveBtnHeader.removeEventListener('click', saveBtnHeader._saveHandler);
            saveBtnHeader._saveHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Toggle saved articles overlay
                if (savedArticlesOverlay.classList.contains('active')) {
                    closeSavedOverlay.click(); // Trigger close handler
                } else {
                    renderSavedArticles();
                }
            };
            saveBtnHeader.addEventListener('click', saveBtnHeader._saveHandler);
        }

        // Close saved articles overlay
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
                if (overlayStack.length > 0) {
                    const previousOverlay = overlayStack[overlayStack.length - 1];
                    previousOverlay.classList.add('active');
                    const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                    const firstFocusable = focusableElements[0];
                    firstFocusable?.focus();
                } else {
                    lastFocusedElement.focus();
                }
            };
            closeSavedOverlay.addEventListener('click', closeSavedOverlay._closeHandler);
        }
        
        // Smooth scrolling for anchor links
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

        // Scroll to top button
        const scrollTop = document.querySelector('.scroll-top');
        if (scrollTop) {
            window.addEventListener('scroll', () => {
                scrollTop.classList.toggle('show', window.scrollY > 300);
            });
            scrollTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // === Pagination ===
        const articlesPerPage = 6;
        let currentPage = 1;

        const showPage = (page) => {
            const articleCards = Array.from(document.querySelectorAll('.articles-grid .article-card'));
            const totalPages = Math.ceil(articleCards.length / articlesPerPage);
            currentPage = Math.max(1, Math.min(page, totalPages));
            const start = (currentPage - 1) * articlesPerPage;
            const end = start + articlesPerPage;

            // Animate article grid transition
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
                            window.scrollTo({ 
                                top: offsetTop - 100,
                                behavior: 'smooth' 
                            });
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

    // Listen for hash changes to handle routing
    window.addEventListener('hashchange', handleRouting);
    handleRouting();
});