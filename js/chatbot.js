document.addEventListener('DOMContentLoaded', () => {
    // Chatbot Functionality
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotWidget = document.querySelector('.chatbot-widget');
    const chatbotClose = document.querySelector('.chatbot-close');
    const chatbotMessages = document.querySelector('.chatbot-messages');
    const chatbotInput = document.querySelector('.chatbot-input input');
    const sendBtn = document.querySelector('.send-btn');
    const quickReplies = document.querySelectorAll('.quick-reply');

    // Utility function from script.js
    const toggleClass = (element, className) => {
        if (element) element.classList.toggle(className);
    };

    // External overlay stack from script.js (assumed to be globally accessible)
    // If not global, ensure it's passed or accessible via a shared scope
    const overlayStack = window.overlayStack || [];

    // Typing indicator element
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing-indicator';
    typingIndicator.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';

    const addMessage = (text, type) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${type}-message`);
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    const showTyping = () => {
        chatbotMessages.appendChild(typingIndicator);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    const hideTyping = () => {
        if (chatbotMessages.contains(typingIndicator)) {
            chatbotMessages.removeChild(typingIndicator);
        }
    };

    const handleUserInput = (text) => {
        if (!text.trim()) return;
        addMessage(text, 'user');
        chatbotInput.value = '';

        showTyping();

        setTimeout(() => {
            hideTyping();
            const lowerText = text.toLowerCase();
            if (lowerText.includes('article') || lowerText.includes('post')) {
                addMessage('Here are some suggested articles:', 'bot');
                addMessage(blogPosts.slice(0, 3).map(post => `<a href="#post/${post.id}">${post.title}</a>`).join('<br>'), 'bot');
            } else if (lowerText.includes('search')) {
                addMessage('What would you like to search for? Try specific topics like "AI trends" or "JavaScript".', 'bot');
            } else if (lowerText.includes('news') || lowerText.includes('trend')) {
                addMessage('Latest tech news:<br>- AI advancements in 2024<br>- New JavaScript frameworks<br>- Upcoming gadget releases', 'bot');
            } else if (lowerText.includes('ai')) {
                addMessage('Check out our AI category for the latest insights!', 'bot');
                addMessage(`<a href="#category/AI">View AI Articles</a>`, 'bot');
            } else if (lowerText.includes('programming')) {
                addMessage('Explore our programming tutorials!', 'bot');
                addMessage(`<a href="#category/Programming">View Programming Articles</a>`, 'bot');
            } else {
                addMessage('I can help with articles, searches, or tech news. Try asking something specific or visit <a href="https://x.ai/api">xAI API</a> for advanced queries.', 'bot');
            }
        }, 1000);
    };

    // Reset overlays function from script.js (assumed to be globally accessible)
    // If not, ensure it's shared or passed appropriately
    const resetOverlays = (excludeOverlay = null) => {
        const overlays = [
            document.querySelector('.article-overlay'),
            document.querySelector('.saved-articles-overlay'),
            document.querySelector('.share-overlay'),
            document.querySelector('.search-overlay'),
            chatbotWidget
        ].filter(o => o && o !== excludeOverlay);
        overlays.forEach(overlay => overlay?.classList.remove('active'));

        // Close main navigation on mobile
        const mainNav = document.querySelector('.main-nav');
        const menuToggle = document.querySelector('.menu-toggle');
        if (mainNav) mainNav.classList.remove('active');
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    };

    // Store last focused element for restoring focus
    let lastFocusedElement = document.activeElement;

    if (chatbotToggle && chatbotWidget) {
        chatbotToggle.removeEventListener('click', chatbotToggle._toggleHandler);
        chatbotToggle._toggleHandler = (e) => {
            e.stopPropagation();
            lastFocusedElement = document.activeElement;
            resetOverlays(chatbotWidget);
            toggleClass(chatbotWidget, 'active');
            toggleClass(chatbotToggle, 'active');
            if (chatbotWidget.classList.contains('active')) {
                overlayStack.push(chatbotWidget);
                chatbotInput.focus();
                const badge = chatbotToggle.querySelector('.notification-badge');
                if (badge) badge.remove();
            } else {
                overlayStack.pop();
                if (overlayStack.length > 0) {
                    const previousOverlay = overlayStack[overlayStack.length - 1];
                    previousOverlay.classList.add('active');
                    const focusableElements = previousOverlay.querySelectorAll('button, a, input, [tabindex="0"]');
                    const firstFocusable = focusableElements[0];
                    firstFocusable?.focus();
                } else {
                    lastFocusedElement.focus();
                }
            }
        };
        chatbotToggle.addEventListener('click', chatbotToggle._toggleHandler);
    }

    if (chatbotClose) {
        chatbotClose.removeEventListener('click', chatbotClose._closeHandler);
        chatbotClose._closeHandler = () => {
            chatbotWidget.classList.remove('active');
            chatbotToggle.classList.remove('active');
            overlayStack.pop();
            if (chatbotWidget._trapFocus) {
                chatbotWidget.removeEventListener('keydown', chatbotWidget._trapFocus);
                delete chatbotWidget._trapFocus;
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
        chatbotClose.addEventListener('click', chatbotClose._closeHandler);
    }

    // Focus trap for chatbot widget
    if (chatbotWidget) {
        const focusableElements = chatbotWidget.querySelectorAll('button, a, input, [tabindex="0"]');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

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
        chatbotWidget._trapFocus = trapFocus;
        chatbotWidget.addEventListener('keydown', trapFocus);
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', () => handleUserInput(chatbotInput.value));
    }

    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserInput(chatbotInput.value);
        });
    }

    quickReplies.forEach(reply => {
        reply.addEventListener('click', () => handleUserInput(reply.textContent));
    });

    // Notification badge
    setTimeout(() => {
        if (!chatbotWidget.classList.contains('active') && document.querySelector('.article-card')) {
            const badge = document.createElement('span');
            badge.classList.add('notification-badge');
            badge.textContent = '1';
            chatbotToggle.appendChild(badge);
        }
    }, 30000);
});