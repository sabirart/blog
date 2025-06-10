document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const darkIcon = themeToggle.querySelector('.dark-icon');
    const lightIcon = themeToggle.querySelector('.light-icon');
    const body = document.body;

    // Initial theme check
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        body.classList.toggle('dark-theme', savedTheme === 'dark');
    } else if (prefersDark) {
        body.classList.add('dark-theme');
    }

    // Update icons based on theme
    const updateIcons = () => {
        const isDark = body.classList.contains('dark-theme');
        darkIcon.style.display = isDark ? 'none' : 'block';
        lightIcon.style.display = isDark ? 'block' : 'none';
    };

    // Toggle handler
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const isDark = body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateIcons();
    });

    // Initialize
    updateIcons();
});