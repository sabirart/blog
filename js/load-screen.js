window.addEventListener('load', () => {
            const preloader = document.getElementById('pagePreloader');
            setTimeout(() => {
                preloader.classList.add('hide');
                document.body.classList.add('loaded'); // Enable scrolling
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 200);
            }, 3000);
        });