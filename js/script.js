document.addEventListener('DOMContentLoaded', () => {
    // Ensure DOMPurify is available
    const sanitize = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize : (input) => input;

    // Load blogPosts from window.blogData.blogPosts and sort by date (newest first)
    let blogPosts = window.blogData.blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Utility Functions
    window.toggleClass = (element, className) => element?.classList.toggle(className);

    window.debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    };

    // Overlay Management
    window.resetOverlays = (excludeOverlay = null) => {
        const overlays = [window.overlays.articleOverlay, window.overlays.savedArticlesOverlay, window.overlays.shareOverlay, document.querySelector('.search-overlay')].filter(o => o && o !== excludeOverlay);
        overlays.forEach(overlay => overlay?.classList.remove('active'));
        window.restoreBackgroundScroll();

        const mainNav = document.querySelector('.main-nav');
        const menuToggle = document.querySelector('.menu-toggle');
        if (mainNav) mainNav.classList.remove('active');
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    };

    window.disableBackgroundScroll = (overlay) => {
        if (overlay && overlay.classList.contains('search-overlay')) {
            document.body.classList.add('search-overlay-active');
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        }
    };

    window.restoreBackgroundScroll = () => {
        const overlays = [window.overlays.articleOverlay, window.overlays.savedArticlesOverlay, window.overlays.shareOverlay, document.querySelector('.search-overlay')].filter(o => o);
        if (!overlays.some(o => o.classList.contains('active') && o.classList.contains('search-overlay'))) {
            document.body.classList.remove('search-overlay-active');
            document.body.style.overflow = 'auto';
            document.body.style.height = 'auto';
        }
    };

    window.handleOutsideClick = (overlay, closeButton, contentSelectors) => {
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
    window.renderArticleCard = (post) => `
        <div class="article-card" data-post-id="${post.id}">
            <div class="article-image">
                <img src="${sanitize(post.image)}" alt="${sanitize(post.title)}" loading="lazy">
            </div>
            <div class="article-content">
                <span class="category">${sanitize(post.category)}</span>
                <h3><a href="#post/${post.id}">${sanitize(post.title)}</a></h3>
                <div class="creator-info">
                    <p><strong>Author:</strong> ${sanitize(post.creator.name)}</p>
                    ${post.creator.email ? `<p><strong>Email:</strong> <a href="mailto:${sanitize(post.creator.email)}">${sanitize(post.creator.email)}</a></p>` : ''}
                    ${post.creator.social ? `<p><strong>Social:</strong> <a href="${sanitize(post.creator.social)}" target="_blank">${sanitize(post.creator.social)}</a></p>` : ''}
                </div>
                <div class="meta">
                    <span><i class="fas fa-clock"></i> ${sanitize(post.readTime)}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${sanitize(post.date)}</span>
                </div>
                <div class="article-actions">
                    <button class="save-btn" data-post-id="${post.id}" aria-label="Save article"><i class="${localStorage.getItem(`saved-${post.id}`) ? 'fas' : 'far'} fa-bookmark"></i></button>
                    <button class="share-btn" aria-label="Share article"><i class="fas fa-share-alt"></i></button>
                    <button class="delete-btn" data-post-id="${post.id}" aria-label="Delete article"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        </div>
    `;

    // Render Post Overlay
    window.renderPostOverlay = (postId) => {
        const post = blogPosts.find(p => p.id === postId);
        if (!post) {
            window.overlays.articleOverlay.classList.remove('active');
            mainContent.innerHTML = '<h2>Post not found</h2>';
            window.restoreBackgroundScroll();
            return;
        }
        window.overlays.articleOverlay.querySelector('.article-overlay-content').innerHTML = `
            <article class="article-card">
                <div class="article-image">
                    <img src="${sanitize(post.image)}" alt="${sanitize(post.title)}" loading="lazy">
                </div>
                <div class="article-content">
                    <span class="category">${sanitize(post.category)}</span>
                    <h1>${sanitize(post.title)}</h1>
                    <div class="creator-info">
                        <p><strong>Author:</strong> ${sanitize(post.creator.name)}</p>
                        ${post.creator.email ? `<p><strong>Email:</strong> <a href="mailto:${sanitize(post.creator.email)}">${sanitize(post.creator.email)}</a></p>` : ''}
                        ${post.creator.social ? `<p><strong>Social:</strong> <a href="${sanitize(post.creator.social)}" target="_blank">${sanitize(post.creator.social)}</a></p>` : ''}
                    </div>
                    <p class="excerpt">${sanitize(post.excerpt)}</p>
                    <div class="meta">
                        <span><i class="fas fa-clock"></i> ${sanitize(post.readTime)}</span>
                        <span><i class="fas fa-calendar-alt"></i> ${sanitize(post.date)}</span>
                    </div>
                    ${sanitize(post.content)}
                    <div class="article-actions">
                        <button class="save-btn" data-post-id="${post.id}" aria-label="Save article"><i class="${localStorage.getItem(`saved-${post.id}`) ? 'fas' : 'far'} fa-bookmark"></i></button>
                        <button class="share-btn" aria-label="Share article"><i class="fas fa-share-alt"></i></button>
                        ${post.category.toLowerCase() === 'myblog' ? `<button class="delete-btn" data-post-id="${post.id}" aria-label="Delete article"><i class="fas fa-trash-alt"></i></button>` : ''}
                    </div>
                </div>
            </article>
        `;
        window.resetOverlays(window.overlays.articleOverlay);
        window.overlays.overlayStack.push(window.overlays.articleOverlay);
        window.overlays.articleOverlay.classList.add('active');
        window.disableBackgroundScroll(window.overlays.articleOverlay);

        localStorage.setItem(`lastRead-${postId}`, Date.now());

        const focusableElements = window.overlays.articleOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
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
        window.overlays.articleOverlay.addEventListener('keydown', trapFocus);
        window.overlays.articleOverlay._trapFocus = trapFocus;

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
                    const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                    const firstFocusable = focusableElements[0];
                    firstFocusable?.focus();
                }
                window.overlays.articleOverlay.removeEventListener('transitionend', handler);
            }, {once: true});
        };
        const outsideClickHandler = window.handleOutsideClick(window.overlays.articleOverlay, closeButton, ['.article-overlay-container']);
        window.overlays.articleOverlay.addEventListener('click', outsideClickHandler);
        window.overlays.articleOverlay._outsideClickHandler = outsideClickHandler;

        window.initializeSaveButtons();
        window.initializeShareButtons();
        window.initializeDeleteButtons();
    };

    // Initialize Delete Buttons
    window.initializeDeleteButtons = () => {
        document.querySelectorAll('.delete-btn[data-post-id]').forEach(button => {
            button.removeEventListener('click', button._handle);
            button._handle = (e) => {
                e.preventDefault();
                const postId = button.getAttribute('data-post-id');
                if (!postId) return;
                if (window.confirm('Delete this post?')) {
                    blogPosts = blogPosts.filter(p => p.id !== postId);
                    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
                    localStorage.removeItem(`saved-${postId}`);
                    localStorage.removeItem(`saveTime-${postId}`);
                    localStorage.removeItem(`lastRead-${postId}`);
                    window.showMessage('Post deleted');
                    window.resetOverlays();
                    window.handleRouting();
                }
            };
            button.addEventListener('click', button._handle);
        });
    };

    // Page Rendering Functions
    window.renderHome = () => {
        mainContent.innerHTML = `
            <section class="hero" id="hero">
                <div class="container">
                    <div class="hero-content">
                            <span class="category-badge" aria-label="Featured Content">Featured</span>
                            <h1>Explore the Future of Technology</h1>
                            <p class="excerpt">Discover cutting-edge AI innovations, programming tutorials, and in-depth gadget reviews.</p>
                            <a href="blog-creator.html" class="create-blog-btn" target="_blank" aria-label="Create a Blog for Free">Create a Blog</a>
                            <a href="#posts" class="read-more" aria-label="Read more about technology innovations">Read Blogs <i class="fas fa-arrow-right"></i></a>
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
                                    <img src="${sanitize(post.image)}" alt="${sanitize(post.title)}" loading="lazy">
                                    <div class="slide-content">
                                        <span class="category">${sanitize(post.category)}</span>
                                        <h3><a href="#post/${post.id}">${sanitize(post.title)}</a></h3>
                                        <div class="meta">
                                            <span><i class="fas fa-clock"></i> ${sanitize(post.readTime)}</span>
                                            <span><i class="fas fa-calendar-alt"></i> ${sanitize(post.date)}</span>
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
                        ${blogPosts.map(post => window.renderArticleCard(post)).join('')}
                    </div>
                    <aside class="sidebar">
                        <div class="ad-image">
                            ${ads.length > 0 ? `<img src="${sanitize(ads[0].image)}" alt="${sanitize(ads[0].alt)}" loading="lazy">` : '<p>No ads available.</p>'}
                        </div>
                    </div>
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

    window.renderCategory = (category) => {
        let filteredPosts = [];
        if (category.toLowerCase() === 'myblog') {
            // Show all user-created posts (all posts in blogPosts are user-created)
            filteredPosts = blogPosts;
        } else {
            filteredPosts = blogPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
        }
        mainContent.innerHTML = `
            <section class="main-content">
                <div class="container">
                    <h2 class="section-title">${sanitize(category)}</h2>
                    <div class="articles-grid" id="articles-grid">
                        ${filteredPosts.length > 0 ? filteredPosts.map(post => window.renderArticleCard(post)).join('') : '<p>No posts found in this category.</p>'}
                    </div>
                    <aside class="sidebar">
                        <div class="ad-image">
                            ${ads.length > 0 ? `<img src="${sanitize(ads[0].image)}" alt="${sanitize(ads[0].alt)}" loading="lazy">` : '<p>No ads available.</p>'}
                        </div>
                    </div>
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

    window.renderAbout = () => {
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
    window.handleRouting = () => {
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
                window.resetOverlays();
                if (hash === '#home') {
                    window.renderHome();
                } else if (hash.startsWith('#post/')) {
                    const postId = hash.split('/')[1];
                    window.renderPostOverlay(postId);
                } else if (hash.startsWith('#category/')) {
                    const category = decodeURIComponent(hash.split('/')[1]);
                    window.renderCategory(category);
                } else if (hash === '#about') {
                    window.renderAbout();
                } else if (hash === '#save') {
                    window.renderSavedArticles();
                } else {
                    window.renderHome();
                }
                mainContent.style.opacity = '1';
                mainContent.style.transform = 'translateY(0)';
                window.scrollTo({top: 0, behavior: 'smooth'});
            } catch (error) {
                console.error('Routing error:', error);
                mainContent.innerHTML = '<h2>Error loading page</h2>';
                window.restoreBackgroundScroll();
            }
        }, 400);
    };

    // Pagination Logic
    const initializePagination = () => {
        const articlesPerPage = 6;
        let currentPage = 1;

        const getElements = () => {
            const articlesGrid = document.querySelector('.articles-grid');
            const pagination = document.getElementById('pagination');
            return {articlesGrid, pagination};
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
                        const {articlesGrid} = getElements();
                        if (articlesGrid) {
                            showPage(page, articlesGrid, pagination);
                            const offsetTop = articlesGrid.getBoundingClientRect().top + window.pageYOffset;
                            window.scrollTo({top: offsetTop - 100, behavior: 'smooth'});
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

        const tryInitialize = () => {
            const {articlesGrid, pagination} = getElements();
            if (!articlesGrid || !pagination) {
                console.warn('Pagination elements (.articles-grid or #pagination) not found, retrying...');
                setTimeout(tryInitialize, 100);
                return;
            }

            const articleCards = articlesGrid.querySelectorAll('.article-card');
            if (articleCards.length > articlesPerPage) {
                showPage(1, articlesGrid, pagination);
            } else {
                pagination.innerHTML = '';
            }
        };

        window.reinitializePagination = () => {
            const {articlesGrid, pagination} = getElements();
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

    // Feature Initialization
    window.initializeFeatures = () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        if (menuToggle && mainNav) {
            menuToggle.removeEventListener('click', menuToggle._toggleHandler);
            menuToggle._toggleHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                window.toggleClass(mainNav, 'active');
                window.toggleClass(menuToggle, 'active');
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
                    featuredPosts.scrollIntoView({block: 'center', behavior: 'smooth'});
                }
            };
            readMoreBtn.addEventListener('click', readMoreBtn._clickHandler);
        }

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
                    <img src="${sanitize(post.image)}" alt="${sanitize(post.title)}" loading="lazy">
                    <div class="slide-content">
                        <span class="category">${sanitize(post.category)}</span>
                        <h3><a href="#post/${post.id}">${sanitize(post.title)}</a></h3>
                        <div class="meta">
                            <span><i class="fas fa-clock"></i> ${sanitize(post.readTime)}</span>
                            <span><i class="fas fa-calendar-alt"></i> ${sanitize(post.date)}</span>
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

            if (prevBtn) prevBtn.addEventListener('click', () => slider.scrollBy({left: -300, behavior: 'smooth'}));
            if (nextBtn) nextBtn.addEventListener('click', () => slider.scrollBy({left: 300, behavior: 'smooth'}));

            slider.querySelectorAll('.slide').forEach(slide => {
                slide.removeEventListener('click', slide._clickHandler);
                slide._clickHandler = (e) => {
                    if (!e.target.closest('.save-btn, .share-btn, .delete-btn')) {
                        const postId = slide.getAttribute('data-post-id');
                        window.renderPostOverlay(postId);
                    }
                };
                slide.addEventListener('click', slide._clickHandler);
            });
        }

        window.initializeSaveButtons();
        window.initializeShareButtons();
        window.initializeDeleteButtons();

        let lastFocusedElement = null;
        const closeArticleOverlay = document.querySelector('.close-article-overlay');
        if (closeArticleOverlay) {
            closeArticleOverlay.removeEventListener('click', closeArticleOverlay._closeHandler);
            closeArticleOverlay._closeHandler = () => {
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
                        const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                        const firstFocusable = focusableElements[0];
                        firstFocusable?.focus();
                    } else {
                        lastFocusedElement?.focus();
                    }
                    window.overlays.articleOverlay.removeEventListener('transitionend', handler);
                }, {once: true});
            };
            closeArticleOverlay.addEventListener('click', closeArticleOverlay._closeHandler);
        }

        document.querySelectorAll('.article-card').forEach(card => {
            card.removeEventListener('click', card._clickHandler);
            card._clickHandler = (e) => {
                if (!e.target.closest('.save-btn, .share-btn, .delete-btn')) {
                    lastFocusedElement = document.activeElement;
                    const postId = card.getAttribute('data-post-id');
                    window.renderPostOverlay(postId);
                }
            };
            card.addEventListener('click', card._clickHandler);
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({behavior: 'smooth'});
                }
            });
        });

        const scrollTop = document.querySelector('.scroll-top');
        if (scrollTop) {
            window.addEventListener('scroll', () => {
                scrollTop.classList.toggle('show', window.scrollY > 0);
            });
            scrollTop.addEventListener('click', () => {
                window.scrollTo({top: 0, behavior: 'smooth'});
            });
        }

        initializePagination();
    };

    window.addEventListener('hashchange', window.handleRouting);
    window.handleRouting();
});
