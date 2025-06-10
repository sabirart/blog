document.addEventListener('DOMContentLoaded', () => {
    // Ensure DOMPurify is available
    const sanitize = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize : (input) => input;

    // Utility Functions (reused from script.js)
    window.toggleClass = (element, className) => element?.classList.toggle(className);

    window.showMessage = (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed; bottom: 20px; left: 20px; 
            background: ${type === 'success' ? '#10b981' : '#dc3545'}; 
            color: white; padding: 10px 20px; border-radius: 8px; 
            z-index: 3000; opacity: 0; transition: opacity 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.style.opacity = '1', 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    // My Blog Rendering Function
    window.renderMyBlog = () => {
        // Placeholder for current user ID (replace with actual authentication logic)
        const currentUserId = window.currentUserId || localStorage.getItem('userId') || 'user-id-placeholder';
        
        // Filter posts by current user
        const userPosts = blogPosts.filter(post => post.creator.id === currentUserId);
        
        // Get main content container
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('Main content container not found');
            showMessage('Error loading your blog. Please try again.', 'error');
            return;
        }

        // Render My Blog section
        mainContent.innerHTML = `
            <section class="my-blog-section">
                <div class="container">
                    <div class="my-blog-header">
                        <h1 class="section-title">My Blog</h1>
                        <p class="section-subtitle">Manage and view all your created articles</p>
                        <a href="/blog-creator.html" class="create-blog-btn" aria-label="Create a new blog post">
                            <i class="fas fa-plus"></i> Create New Post
                        </a>
                    </div>
                    <div class="articles-grid" id="articles-grid">
                        ${userPosts.length > 0 ? 
                            userPosts.map(post => renderUserArticleCard(post)).join('') : 
                            `
                            <div class="no-posts-message">
                                <i class="fas fa-file-alt"></i>
                                <p>You haven't created any blog posts yet.</p>
                                <a href="/blog-creator.html" class="create-blog-btn">Start Writing Now</a>
                            </div>
                        `}
                    </div>
                    <aside class="sidebar">
                        <div class="ad-image">
                            ${ads.length > 0 ? 
                                `<img src="${sanitize(ads[0].image)}" alt="${sanitize(ads[0].alt)}" loading="lazy">` : 
                                '<p>No ads available.</p>'
                            }
                        </div>
                    </aside>
                </div>
                <div class="pagination-wrapper">
                    <div class="pagination" id="pagination"></div>
                </div>
            </section>
            <div class="search-overlay">
                <form class="search-form">
                    <input type="text" placeholder="Search your posts..." aria-label="Search your posts">
                    <button type="submit" aria-label="Search"><i class="fas fa-search"></i></button>
                </form>
                <button class="close-search" aria-label="Close search"><i class="fas fa-times"></i></button>
                <div class="search-suggestions"></div>
                <div class="search-results-grid"></div>
            </div>
        `;

        // Initialize features
        initializeMyBlogFeatures();
        reinitializePagination();
    };

    // Render individual user article card with edit and delete options
    const renderUserArticleCard = (post) => `
        <div class="article-card user-article-card" data-post-id="${post.id}">
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
                    <button class="edit-btn" data-post-id="${post.id}" aria-label="Edit article"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-post-id="${post.id}" aria-label="Delete article"><i class="fas fa-trash"></i></button>
                    <button class="save-btn" data-post-id="${post.id}" aria-label="Save article"><i class="${localStorage.getItem(`saved-${post.id}`) ? 'fas' : 'far'} fa-bookmark"></i></button>
                    <button class="share-btn" aria-label="Share article"><i class="fas fa-share-alt"></i></button>
                </div>
            </div>
        </div>
    `;

    // Initialize My Blog features
    const initializeMyBlogFeatures = () => {
        // Initialize edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const postId = e.currentTarget.getAttribute('data-post-id');
                // Redirect to blog-creator.html with postId for editing
                window.location.href = `/blog-creator.html#edit/${postId}`;
            });
        });

        // Initialize delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const postId = e.currentTarget.getAttribute('data-post-id');
                if (confirm('Are you sure you want to delete this post?')) {
                    deletePost(postId);
                }
            });
        });

        // Initialize search functionality for user posts
        const searchForm = document.querySelector('.search-form');
        const searchInput = searchForm?.querySelector('input');
        const searchResultsGrid = document.querySelector('.search-results-grid');

        if (searchForm && searchInput && searchResultsGrid) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchInput.value.toLowerCase().trim();
                const currentUserId = window.currentUserId || localStorage.getItem('userId') || 'user-id-placeholder';
                const filteredPosts = blogPosts
                    .filter(post => post.creator.id === currentUserId)
                    .filter(post => 
                        post.title.toLowerCase().includes(query) || 
                        post.category.toLowerCase().includes(query) ||
                        post.content.toLowerCase().includes(query)
                    );

                searchResultsGrid.innerHTML = filteredPosts.length > 0 
                    ? filteredPosts.map(post => renderUserArticleCard(post)).join('')
                    : '<p>No posts match your search.</p>';

                window.reinitializePagination();
            });
        }

        // Initialize save and share buttons (reused from script.js)
        window.initializeSaveButtons();
        window.initializeShareButtons();

        // Initialize article card click handling
        document.querySelectorAll('.user-article-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.edit-btn, .delete-btn, .save-btn, .share-btn')) {
                    const postId = card.getAttribute('data-post-id');
                    window.renderPostOverlay(postId);
                }
            });
        });

        // Initialize create blog button
        const createBlogBtn = document.querySelector('.create-blog-btn');
        if (createBlogBtn) {
            createBlogBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/blog-creator.html';
            });
        }
    };

    // Delete post function
    const deletePost = (postId) => {
        const index = blogPosts.findIndex(post => post.id === postId);
        if (index !== -1) {
            blogPosts.splice(index, 1);
            showMessage('Post deleted successfully!', 'success');
            window.renderMyBlog(); // Re-render My Blog section
        } else {
            showMessage('Failed to delete post.', 'error');
        }
    };

    // Pagination (reused from script.js with minor adjustments)
    const reinitializePagination = () => {
        const articlesPerPage = 6;
        let currentPage = 1;

        const getElements = () => {
            const articlesGrid = document.querySelector('.articles-grid');
            const pagination = document.getElementById('pagination');
            return { articlesGrid, pagination };
        };

        const showPage = (page, articlesGrid, pagination) => {
            const articleCards = Array.from(articlesGrid.querySelectorAll('.article-card'));
            if (articleCards.length === 0) {
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
                    card.style.display = (index >= start && index < end) ? 'block' : 'none';
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

        const { articlesGrid, pagination } = getElements();
        if (articlesGrid && pagination) {
            const articleCards = articlesGrid.querySelectorAll('.article-card');
            if (articleCards.length > articlesPerPage) {
                showPage(1, articlesGrid, pagination);
            } else {
                pagination.innerHTML = '';
            }
        }
    };

    // Update routing to use the new renderMyBlog
    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#my-blog') {
            window.renderMyBlog();
        }
    });

    // Initial render if on My Blog page
    if (window.location.hash === '#my-blog') {
        window.renderMyBlog();
    }
});