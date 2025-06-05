// utils.js
export const toggleClass = (element, className) => {
    if (element) element.classList.toggle(className);
};

export const resetOverlays = (excludeOverlay = null) => {
    const overlays = [
        document.querySelector('.article-overlay'),
        document.querySelector('.saved-articles-overlay'),
        document.querySelector('.share-overlay'),
        document.querySelector('.search-overlay'),
        document.querySelector('.chatbot-widget')
    ].filter(o => o && o !== excludeOverlay);
    overlays.forEach(overlay => overlay?.classList.remove('active'));
    const mainNav = document.querySelector('.main-nav');
    const menuToggle = document.querySelector('.menu-toggle');
    if (mainNav) mainNav.classList.remove('active');
    if (menuToggle) {
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
};