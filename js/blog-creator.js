document.addEventListener('DOMContentLoaded', () => {
  // State management
  let currentStep = 1;
  const totalSteps = 4;
  let blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];

  // DOM Elements
  const form = document.getElementById('blog-creator-form');
  const steps = document.querySelectorAll('.form-section.step');
  const progressSteps = document.querySelectorAll('.progress-step');
  const nextButtons = document.querySelectorAll('.next-btn');
  const prevButtons = document.querySelectorAll('.prev-btn');
  const submitButton = document.querySelector('.submit-btn');
  const editor = document.getElementById('blog-content');
  const imageInput = document.getElementById('blog-image');
  const imagePreview = document.getElementById('image-preview');
  const linksContainer = document.getElementById('links-container');
  const addLinkBtn = document.getElementById('add-link-btn');
  const previewOverlay = document.getElementById('preview-overlay');
  const editBtn = document.getElementById('edit-btn');
  const publishBtn = document.getElementById('publish-btn');
  const closePreview = document.getElementById('close-preview');
  const alertOverlay = document.getElementById('alert-overlay');
  const alertMessage = document.getElementById('alert-message');
  const alertCloseBtn = document.querySelector('.alert-btn.close');
  const alertConfirmBtn = document.querySelector('.alert-btn.confirm');

  // Rich Text Editor Enhancements
  const formatButtons = document.querySelectorAll('.format-btn');
  const historyStack = [];
  const maxHistory = 50;

  // Save state for undo/redo
  function saveState() {
    historyStack.push(editor.innerHTML);
    if (historyStack.length > maxHistory) {
      historyStack.shift();
    }
    updateButtonStates();
  }

  // Restore state for undo/redo
  function restoreState(html) {
    editor.innerHTML = html;
    editor.focus();
    updatePreview();
    updateButtonStates();
  }

  // Normalize selection
  function normalizeSelection() {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return selection;
  }

  // Check if node is wrapped in a tag
  function isWrappedInTag(node, tagName) {
    return node.closest(tagName.toLowerCase());
  }

  // Toggle inline style (e.g., bold, italic)
  function toggleInlineStyle(tagName) {
    const selection = normalizeSelection();
    const range = selection.getRangeAt(0);
    const parent = range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
    const isWrapped = isWrappedInTag(parent, tagName);

    if (isWrapped) {
      // Unwrap
      const wrapper = parent.closest(tagName.toLowerCase());
      const fragment = document.createDocumentFragment();
      while (wrapper.firstChild) {
        fragment.appendChild(wrapper.firstChild);
      }
      wrapper.parentNode.replaceChild(fragment, wrapper);
    } else {
      // Wrap
      const wrapper = document.createElement(tagName);
      if (range.toString().trim()) {
        range.surroundContents(wrapper);
      } else {
        const textNode = document.createTextNode(' ');
        wrapper.appendChild(textNode);
        range.insertNode(wrapper);
        range.selectNodeContents(textNode);
      }
    }
    selection.removeAllRanges();
    selection.addRange(range);
    saveState();
  }

  // Toggle block element (e.g., h1, h2, p)
  function toggleBlockElement(tagName) {
    const selection = normalizeSelection();
    const range = selection.getRangeAt(0);
    let parent = range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
    parent = parent.closest('h1,h2,h3,p,ul,ol,li') || editor;

    const isCurrentBlock = parent.tagName.toLowerCase() === tagName.toLowerCase();
    const newElement = document.createElement(isCurrentBlock ? 'p' : tagName);

    if (parent === editor) {
      const content = range.toString().trim() || ' ';
      newElement.textContent = content;
      range.deleteContents();
      range.insertNode(newElement);
    } else {
      while (parent.firstChild) {
        newElement.appendChild(parent.firstChild);
      }
      parent.parentNode.replaceChild(newElement, parent);
    }

    range.selectNodeContents(newElement);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    saveState();
  }

  // Toggle list (ul or ol)
  function toggleList(listType) {
    const selection = normalizeSelection();
    const range = selection.getRangeAt(0);
    let parent = range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
    const isInList = parent.closest(listType);

    if (isInList) {
      // Unwrap list
      const list = isInList;
      const fragment = document.createDocumentFragment();
      Array.from(list.children).forEach(li => {
        const p = document.createElement('p');
        while (li.firstChild) {
          p.appendChild(li.firstChild);
        }
        fragment.appendChild(p);
      });
      list.parentNode.replaceChild(fragment, list);
    } else {
      // Create list
      const list = document.createElement(listType);
      list.style.margin = '1rem 0';
      list.style.paddingLeft = '2rem';
      const li = document.createElement('li');
      const content = range.toString().trim() || ' ';
      li.textContent = content;
      list.appendChild(li);
      range.deleteContents();
      range.insertNode(list);
      range.selectNodeContents(li);
    }

    selection.removeAllRanges();
    selection.addRange(range);
    saveState();
  }

  // Insert image
  function insertImage(src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'User-inserted image';
    img.style.maxWidth = '100%';
    img.style.margin = '0.5rem 0';
    const selection = normalizeSelection();
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(img);
    range.setStartAfter(img);
    selection.removeAllRanges();
    selection.addRange(range);
    editor.dispatchEvent(new Event('input'));
    saveState();
  }

  // Update button states (e.g., highlight active formatting)
  function updateButtonStates() {
    const selection = window.getSelection();
    if (!selection.rangeCount || !editor.contains(selection.anchorNode)) {
      formatButtons.forEach(btn => btn.classList.remove('active'));
      return;
    }

    const range = selection.getRangeAt(0);
    let parent = range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;

    formatButtons.forEach(button => {
      const command = button.dataset.command;
      const [cmd, value] = command.split(':');
      let isActive = false;

      if (cmd === 'bold') {
        isActive = isWrappedInTag(parent, 'strong');
      } else if (cmd === 'italic') {
        isActive = isWrappedInTag(parent, 'em');
      } else if (cmd === 'underline') {
        isActive = isWrappedInTag(parent, 'u');
      } else if (cmd === 'formatBlock') {
        isActive = parent.closest(value.toLowerCase());
      } else if (cmd === 'insertUnorderedList') {
        isActive = parent.closest('ul');
      } else if (cmd === 'insertOrderedList') {
        isActive = parent.closest('ol');
      } else if (cmd === 'undo' || cmd === 'redo') {
        isActive = false; // Handled separately
      }

      button.classList.toggle('active', isActive);
    });

    const undoBtn = document.querySelector('[data-command="undo"]');
    const redoBtn = document.querySelector('[data-command="redo"]');
    if (undoBtn) undoBtn.disabled = historyStack.length <= 1;
    if (redoBtn) redoBtn.disabled = true; // Redo not implemented for simplicity
  }

  // Initialize rich text editor
  formatButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const command = button.dataset.command;
      const [cmd, value] = command.split(':');

      editor.focus();
      normalizeSelection();

      try {
        if (cmd === 'createLink') {
          const url = prompt('Enter a valid URL (e.g., https://example.com):');
          if (url && /^https?:\/\/[^\s]+$/.test(url)) {
            const a = document.createElement('a');
            a.href = url;
            a.textContent = url;
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(a);
            range.setStartAfter(a);
            selection.removeAllRanges();
            selection.addRange(range);
            saveState();
          } else if (url) {
            showAlert('Please enter a valid URL starting with http:// or https://');
          }
        } else if (cmd === 'insertImage') {
          const url = prompt('Enter an image URL (e.g., https://example.com/image):');
          if (url && /^https?:\/\/[^\s]+$/.test(url)) {
            insertImage(url);
          } else if (url) {
            showAlert('Please enter a valid image URL starting with http:// or https://');
          }
        } else if (cmd === 'insertImageFile') {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
              const reader = new FileReader();
              reader.onload = (event) => {
                insertImage(event.target.result);
              };
              reader.readAsDataURL(file);
            } else {
              showAlert('Please select a valid image file (max 5MB).');
            }
          };
          input.click();
        } else if (cmd === 'bold') {
          toggleInlineStyle('strong');
        } else if (cmd === 'italic') {
          toggleInlineStyle('em');
        } else if (cmd === 'underline') {
          toggleInlineStyle('u');
        } else if (cmd === 'formatBlock') {
          toggleBlockElement(value);
        } else if (cmd === 'insertUnorderedList') {
          toggleList('ul');
        } else if (cmd === 'insertOrderedList') {
          toggleList('ol');
        } else if (cmd === 'undo') {
          if (historyStack.length > 1) {
            historyStack.pop(); // Remove current state
            restoreState(historyStack[historyStack.length - 1]);
          }
        }
      } catch (error) {
        console.error(`Error executing command ${cmd}:`, error);
        showAlert(`Failed to apply ${cmd} formatting. Please try again.`);
      }

      editor.focus();
      updatePreview();
      updateButtonStates();
    });

    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Space') {
        e.preventDefault();
        button.click();
      }
    });
  });

  // Editor event listeners
  editor.addEventListener('input', () => {
    saveState();
    updateButtonStates();
  });

  editor.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      const undoBtn = document.querySelector('[data-command="undo"]');
      if (undoBtn) undoBtn.click();
    }
  });

  editor.addEventListener('selectionchange', updateButtonStates);

  // Initial state
  saveState();

  // Alert system with focus management
  function showAlert(message, onConfirm = null) {
    alertMessage.textContent = message;
    alertOverlay.style.display = 'flex';
    alertConfirmBtn.focus();

    const closeAlert = () => {
      alertOverlay.style.display = 'none';
      alertConfirmBtn.removeEventListener('click', confirmHandler);
      alertCloseBtn.removeEventListener('click', closeAlert);
      editor.focus();
    };

    const confirmHandler = () => {
      closeAlert();
      if (onConfirm) onConfirm();
    };

    alertCloseBtn.addEventListener('click', closeAlert);
    alertConfirmBtn.addEventListener('click', confirmHandler);
  }

  // Image upload preview
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Image file size must be less than 5MB.');
        imageInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        imagePreview.innerHTML = `<img src="${event.target.result}" alt="Thumbnail Preview">`;
        imagePreview.style.display = 'block';
        updatePreview();
      };
      reader.readAsDataURL(file);
    } else if (file) {
      showAlert('Please select a valid image file (e.g., PNG, JPG, GIF).');
      imageInput.value = '';
    }
  });

  // Add reference links
  addLinkBtn.addEventListener('click', () => {
    const linkItem = document.createElement('div');
    linkItem.className = 'link-item';
    linkItem.innerHTML = `
      <input type="url" placeholder="e.g., https://example.com" class="link-url" aria-label="Reference link">
      <button type="button" class="remove-link" aria-label="Remove link"><i class="fas fa-trash"></i></button>
    `;
    linksContainer.appendChild(linkItem);

    linkItem.querySelector('.remove-link').addEventListener('click', () => {
      linkItem.remove();
      updatePreview();
    });

    linkItem.querySelector('.link-url').addEventListener('input', updatePreview);
  });

  // Step navigation
  function showStep(stepNumber) {
    steps.forEach((step, index) => {
      step.classList.toggle('active', parseInt(step.dataset.step) === stepNumber);
      step.setAttribute('aria-hidden', parseInt(step.dataset.step) !== stepNumber);
    });

    progressSteps.forEach(step => {
      step.classList.toggle('active', parseInt(step.dataset.step) === stepNumber);
      step.classList.toggle('completed', parseInt(step.dataset.step) < stepNumber);
      step.setAttribute('aria-current', parseInt(step.dataset.step) === stepNumber ? 'step' : 'false');
    });

    currentStep = stepNumber;
    previewOverlay.style.display = 'none';
    alertOverlay.style.display = 'none';
    steps[stepNumber - 1].querySelector('input, select, [contenteditable]')?.focus();
  }

  // Validate step
  function validateStep(stepNumber) {
    const currentForm = steps[stepNumber - 1];
    const requiredInputs = currentForm.querySelectorAll('[required]');
    let valid = true;

    requiredInputs.forEach(input => {
      const errorElement = document.getElementById(`${input.id}-error`);
      if (!input.value.trim()) {
        valid = false;
        input.classList.add('invalid');
        if (errorElement) {
          errorElement.textContent = 'This field is required';
          errorElement.style.display = 'block';
          errorElement.setAttribute('aria-live', 'polite');
        }
      } else if (input.type === 'email' && input.value && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(input.value)) {
        valid = false;
        input.classList.add('invalid');
        if (errorElement) {
          errorElement.textContent = 'Please enter a valid email address';
          errorElement.style.display = 'block';
          errorElement.setAttribute('aria-live', 'polite');
        }
      } else if (input.id === 'creator-social' && input.value && !/^https?:\/\/[^\s]+$/.test(input.value)) {
        valid = false;
        input.classList.add('invalid');
        if (errorElement) {
          errorElement.textContent = 'Please enter a valid URL';
          errorElement.style.display = 'block';
          errorElement.setAttribute('aria-live', 'polite');
        }
      } else {
        input.classList.remove('invalid');
        if (errorElement) errorElement.style.display = 'none';
      }
    });

    if (stepNumber === 3) {
      const contentText = editor.innerText.trim();
      const errorElement = document.getElementById('blog-content-error');
      if (!contentText || contentText === editor.getAttribute('placeholder')) {
        valid = false;
        editor.classList.add('invalid');
        if (errorElement) {
          errorElement.textContent = 'Please enter some content';
          errorElement.style.display = 'block';
          errorElement.setAttribute('aria-live', 'polite');
        }
      } else {
        editor.classList.remove('invalid');
        if (errorElement) errorElement.style.display = 'none';
      }
    }

    return stepNumber === 4 || valid;
  }

  // Navigation events
  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
          showStep(currentStep + 1);
        } else if (currentStep === totalSteps) {
          updatePreview();
          previewOverlay.style.display = 'block';
          const editButton = previewOverlay.querySelector('#edit-btn');
          if (editButton) {
            editButton.focus();
          } else {
            console.warn('Edit button not found in preview overlay');
          }
        }
      } else {
        showAlert('Please fill in all required fields correctly.');
      }
    });
  });

  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (currentStep > 1) {
        previewOverlay.style.display = 'none';
        showStep(currentStep - 1);
      }
    });
  });

  submitButton.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      updatePreview();
      previewOverlay.style.display = 'block';
      const editButton = previewOverlay.querySelector('#edit-btn');
      if (editButton) {
        editButton.focus();
      } else {
        console.warn('Edit button not found in preview overlay');
        showAlert('Unable to display preview. Please try again.');
      }
    } else {
      showAlert('Please fill in all required fields correctly.');
    }
  });

  progressSteps.forEach(step => {
    step.addEventListener('click', () => {
      const stepNumber = parseInt(step.dataset.step);
      if (stepNumber <= currentStep || validateStep(currentStep)) {
        previewOverlay.style.display = 'none';
        showStep(stepNumber);
      }
    });

    step.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        step.click();
      }
    });
  });

  // Update preview
  function updatePreview() {
    const sanitize = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize : (input) => input;

    try {
      document.getElementById('review-name').textContent = sanitize(document.getElementById('creator-name').value || 'Not provided');
      document.getElementById('review-email').textContent = sanitize(document.getElementById('creator-email').value || 'Not provided');
      document.getElementById('review-social').textContent = sanitize(document.getElementById('creator-social').value || 'Not provided');
      document.getElementById('review-title').textContent = sanitize(document.getElementById('blog-title').value || 'Not provided');
      document.getElementById('review-category').textContent = sanitize(
        document.getElementById('blog-category').options[document.getElementById('blog-category').selectedIndex]?.text || 'Not provided'
      );
      document.getElementById('review-image').innerHTML = sanitize(imagePreview.innerHTML || 'No image uploaded');
      document.getElementById('review-content').innerHTML = sanitize(editor.innerHTML || 'No content provided');

      const linksList = document.getElementById('review-links');
      linksList.innerHTML = '';
      const links = Array.from(document.querySelectorAll('.link-url')).map(input => input.value).filter(link => link && /^https?:\/\/[^\s]+$/.test(link));
      if (links.length === 0) {
        linksList.innerHTML = '<li>No references provided</li>';
      } else {
        links.forEach(link => {
          const li = document.createElement('li');
          li.innerHTML = sanitize(`<a href="${link}" target="_blank">${link}</a>`);
          linksList.appendChild(li);
        });
      }
    } catch (error) {
      console.error('Error updating preview:', error);
      showAlert('Failed to update preview. Please try again.');
    }
  }

  // Real-time input updates
  ['creator-name', 'creator-email', 'creator-social', 'blog-title', 'blog-category'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', updatePreview);
    } else {
      console.warn(`Element with ID ${id} not found`);
    }
  });

  editor.addEventListener('input', updatePreview);

  // Edit and publish
  editBtn.addEventListener('click', () => {
    previewOverlay.style.display = 'none';
    showStep(1);
  });

  publishBtn.addEventListener('click', () => {
    if (!validateStep(1) || !validateStep(3)) {
      showAlert('Please complete all required fields and add content before publishing.', () => {
        previewOverlay.style.display = 'none';
        if (!validateStep(1)) {
          showStep(1);
        } else if (!validateStep(3)) {
          showStep(3);
          editor.focus();
        }
      });
      return;
    }

    const sanitize = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize : (input) => input;

    try {
      const creatorName = sanitize(document.getElementById('creator-name').value);
      const blogTitle = sanitize(document.getElementById('blog-title').value);
      const blogCategory = sanitize(document.getElementById('blog-category').value);
      let imageBase64 = '';
      if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          imageBase64 = reader.result;
          savePost(imageBase64);
        };
        return; // Wait for async read
      } else {
        imageBase64 = 'https://via.placeholder.com/800x400?text=No+Image';
        savePost(imageBase64);
      }

      function savePost(imageBase64) {
        const newPost = {
          id: Date.now().toString(),
          title: blogTitle,
          category: blogCategory,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          readTime: calculateReadTime(editor.innerHTML),
          image: imageBase64,
          content: sanitize(editor.innerHTML),
          excerpt: generateExcerpt(editor.innerHTML),
          lastModified: new Date().toISOString(),
          creator: {
            name: creatorName,
            email: sanitize(document.getElementById('creator-email').value),
            social: sanitize(document.getElementById('creator-social').value)
          },
          links: Array.from(document.querySelectorAll('.link-url')).map(input => sanitize(input.value)).filter(link => link && /^https?:\/\/[^\s]+$/.test(link))
        };

        blogPosts.push(newPost);
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));

        form.reset();
        editor.innerHTML = '';
        imagePreview.style.display = 'none';
        imagePreview.innerHTML = '';
        linksContainer.innerHTML = '';
        imageInput.value = '';
        previewOverlay.style.display = 'none';
        showStep(1);

        showAlert('Your blog post has been published successfully!', () => {
          try {
            window.location.href = 'index.html';
          } catch (error) {
            console.error('Error redirecting to index.html:', error);
            showAlert('Published successfully, but redirection failed. Please navigate to the homepage manually.');
          }
        });
      }
    } catch (error) {
      console.error('Error during publish:', error);
      showAlert('Failed to publish post. Local storage may be full or another error occurred. Please try again.');
    }
  });

  closePreview.addEventListener('click', () => {
    previewOverlay.style.display = 'none';
    showStep(currentStep);
  });

  function calculateReadTime(content) {
    const sanitize = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize : (input) => input;
    const text = sanitize(content).replace(/<[^>]*>/g, '');
    const wordCount = text.trim() ? text.split(/\s+/).length : 0;
    const minutes = Math.ceil(wordCount / 200) || 1;
    return `${minutes} min read`;
  }

  function generateExcerpt(content) {
    const sanitize = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize : (input) => input;
    const text = sanitize(content).replace(/<[^>]*>/g, '').substring(0, 150);
    return text + (text.length >= 150 ? '...' : '');
  }

  // Initialize the first step
  showStep(1);
});