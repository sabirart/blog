const settings = {
  // Supported blog categories
  blogCategories: [
    "Artificial Intelligence",
    "Programming",
    "Graphic Design",
    "Mobile Apps",
    "Gadgets & Tech",
    "Other"
  ],

  // Default image for posts without a thumbnail
  defaultPostImage: "https://via.placeholder.com/800x400?text=No+Image",

  // Maximum file size for uploaded images (5MB)
  maxImageSize: 5 * 1024 * 1024,

  // Allowed image file types
  allowedImageTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],

  // Content sanitization configuration (for DOMPurify, if available)
  sanitizationConfig: {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "a",
      "strong", "em", "blockquote", "img", "iframe", "br", "div", "span"
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "width", "height", "frameborder", "allowfullscreen",
      "target", "class", "style"
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):\/\/)?[^\s/$.?#].[^\s]*$/i
  },

  // Validation rules for blog post fields
  validationRules: {
    title: {
      maxLength: 100,
      required: true
    },
    content: {
      minLength: 50,
      required: true
    },
    category: {
      required: true,
      validValues: () => settings.blogCategories
    },
    creatorName: {
      maxLength: 50,
      required: true
    },
    creatorEmail: {
      maxLength: 100,
      pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      required: false
    },
    creatorSocial: {
      maxLength: 200,
      pattern: /^https?:\/\/[^\s]+$/,
      required: false
    },
    links: {
      pattern: /^https?:\/\/[^\s]+$/,
      maxCount: 10
    }
  },

  // Function to validate a blog post
  validatePost(post) {
    const errors = [];

    // Title validation
    if (this.validationRules.title.required && !post.title) {
      errors.push("Blog title is required");
    } else if (post.title.length > this.validationRules.title.maxLength) {
      errors.push(`Blog title must be less than ${this.validationRules.title.maxLength} characters`);
    }

    // Content validation
    if (this.validationRules.content.required && (!post.content || post.content.trim() === "")) {
      errors.push("Blog content is required");
    } else {
      const textContent = post.content.replace(/<[^>]*>/g, "").trim();
      if (textContent.length < this.validationRules.content.minLength) {
        errors.push(`Blog content must be at least ${this.validationRules.content.minLength} characters`);
      }
    }

    // Category validation
    if (this.validationRules.category.required && !post.category) {
      errors.push("Blog category is required");
    } else if (!this.validationRules.category.validValues().includes(post.category)) {
      errors.push("Invalid blog category");
    }

    // Creator name validation
    if (this.validationRules.creatorName.required && !post.creator.name) {
      errors.push("Creator name is required");
    } else if (post.creator.name.length > this.validationRules.creatorName.maxLength) {
      errors.push(`Creator name must be less than ${this.validationRules.creatorName.maxLength} characters`);
    }

    // Creator email validation
    if (post.creator.email && !this.validationRules.creatorEmail.pattern.test(post.creator.email)) {
      errors.push("Invalid email format");
    }

    // Creator social validation
    if (post.creator.social && !this.validationRules.creatorSocial.pattern.test(post.creator.social)) {
      errors.push("Invalid social media URL");
    }

    // Links validation
    if (post.links && post.links.length > this.validationRules.links.maxCount) {
      errors.push(`Cannot have more than ${this.validationRules.links.maxCount} reference links`);
    }
    if (post.links) {
      post.links.forEach((link, index) => {
        if (!this.validationRules.links.pattern.test(link)) {
          errors.push(`Invalid URL in reference link ${index + 1}`);
        }
      });
    }

    return errors;
  },

  // Function to sanitize content (requires DOMPurify to be loaded)
  sanitizeContent(content) {
    if (typeof DOMPurify !== "undefined") {
      return DOMPurify.sanitize(content, this.sanitizationConfig);
    }
    return content; // Fallback if DOMPurify is not available
  },

  // Function to generate a unique ID for posts
  generatePostId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  // Function to calculate read time
  calculateReadTime(content) {
    const text = this.sanitizeContent(content).replace(/<[^>]*>/g, "").trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    const minutes = Math.ceil(wordCount / 200) || 1;
    return `${minutes} min read`;
  },

  // Function to generate excerpt
  generateExcerpt(content) {
    const text = this.sanitizeContent(content).replace(/<[^>]*>/g, "").substring(0, 150);
    return text + (text.length >= 150 ? "..." : "");
  }
};

// Export settings for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = settings;
} else {
  window.settings = settings;
}