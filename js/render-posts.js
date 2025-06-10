// settings.js
// Configuration and logic for handling blog post submissions and integration with posts.js

// Ensure blogPosts array exists, fallback to empty array if not defined
let blogPosts = window.blogPosts || [];

// Function to validate post data before saving
function validatePostData(post) {
    const requiredFields = ['id', 'title', 'category', 'date', 'readTime', 'image', 'content', 'excerpt'];
    for (const field of requiredFields) {
        if (!post[field]) {
            console.error(`Validation failed: Missing required field - ${field}`);
            return false;
        }
    }
    return true;
}

// Function to format date in the same style as posts.js (e.g., "Jan 15, 2025")
function formatDate(date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Function to calculate read time based on content (same logic as blog-creator.js)
function calculateReadTime(content) {
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
}

// Function to generate excerpt from content (same logic as blog-creator.js)
function generateExcerpt(content) {
    const text = content.replace(/<[^>]*>/g, '').substring(0, 150);
    return text + (text.length === 150 ? '...' : '');
}

// Function to get image URL or fallback to placeholder
function getImageUrl(fileInput) {
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        return URL.createObjectURL(fileInput.files[0]);
    }
    return 'https://via.placeholder.com/800x400?text=No+Image';
}

// Main function to handle blog post submission and save to blogPosts
function saveBlogPost(formData, creatorId) {
    // Extract form data
    const {
        creatorName,
        creatorEmail,
        creatorSocial,
        blogTitle,
        blogCategory,
        blogContent,
        blogImageInput,
        referenceLinks
    } = formData;

    // Validate required fields
    if (!creatorName || !blogTitle || !blogCategory) {
        return { success: false, message: 'Please fill in all required fields' };
    }

    // Create new post object in posts.js format
    const newPost = {
        id: Date.now().toString(), // Unique ID based on timestamp
        title: blogTitle,
        category: blogCategory,
        date: formatDate(new Date()),
        readTime: calculateReadTime(blogContent),
        image: getImageUrl(blogImageInput),
        content: blogContent,
        excerpt: generateExcerpt(blogContent),
        lastModified: new Date().toISOString(),
        creator: {
            name: creatorName,
            email: creatorEmail || '',
            social: creatorSocial || ''
        },
        creatorId: creatorId,
        links: referenceLinks.filter(link => link) // Filter out empty links
    };

    // Validate post data
    if (!validatePostData(newPost)) {
        return { success: false, message: 'Invalid post data. All required fields must be provided.' };
    }

    // Add post to blogPosts array
    blogPosts.unshift(newPost);

    // Save to localStorage for persistence
    try {
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    } catch (error) {
        console.error('Failed to save blog posts to localStorage:', error);
        return { success: false, message: 'Failed to save blog post due to storage error.' };
    }

    // Save user settings
    const userSettings = {
        name: creatorName,
        email: creatorEmail || '',
        social: creatorSocial || ''
    };
    try {
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
    } catch (error) {
        console.error('Failed to save user settings to localStorage:', error);
    }

    return { success: true, message: 'Blog post saved successfully!' };
}

// Function to initialize settings and sync with blog-creator.js
function initBlogSettings() {
    // Load existing blog posts from localStorage
    const storedPosts = localStorage.getItem('blogPosts');
    if (storedPosts) {
        blogPosts = JSON.parse(storedPosts);
    }

    // Ensure blogPosts is always an array
    if (!Array.isArray(blogPosts)) {
        blogPosts = [];
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    }

    // Add event listener for form submission
    const form = document.getElementById('blog-creator-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get creatorId from localStorage
            const creatorId = localStorage.getItem('creatorId') || Date.now().toString() + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('creatorId', creatorId);

            // Collect form data
            const formData = {
                creatorName: document.getElementById('creator-name').value,
                creatorEmail: document.getElementById('creator-email').value,
                creatorSocial: document.getElementById('creator-social').value,
                blogTitle: document.getElementById('blog-title').value,
                blogCategory: document.getElementById('blog-category').value,
                blogContent: document.getElementById('blog-content').innerHTML,
                blogImageInput: document.getElementById('blog-image'),
                referenceLinks: Array.from(document.querySelectorAll('.link-url')).map(input => input.value)
            };

            // Save the blog post
            const result = saveBlogPost(formData, creatorId);

            // Display result
            alert(result.message);

            if (result.success) {
                // Reset form
                form.reset();
                document.getElementById('blog-content').innerHTML = '';
                document.getElementById('image-preview').style.display = 'none';
                document.getElementById('links-container').innerHTML = '';

                // Redirect to home page
                window.location.href = 'index.html';
            }
        });
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', initBlogSettings);

// Export functions for potential use in other scripts
window.blogSettings = {
    saveBlogPost,
    validatePostData,
    calculateReadTime,
    generateExcerpt,
    formatDate
};