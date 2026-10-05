/* Homepage navigation, hours and click-to-play video. Coverage and blog content are static HTML. */
document.addEventListener('DOMContentLoaded', () => {
            // Dynamic Date
            const dateEl = document.getElementById('current-date-display');
            if(dateEl) {
                const now = new Date();
                const month = now.toLocaleString('default', { month: 'long' });
                const year = now.getFullYear();
                dateEl.textContent = `${month} ${year}`;
            }

            const navbar = document.getElementById('navbar');

            // Scroll Effects - Handle Sticky Header Appearance
            let lastNavState = null;
            window.addEventListener('scroll', () => {
                const scrolled = window.scrollY > 50;
                if (scrolled === lastNavState) return;
                lastNavState = scrolled;

                // Add glass background
                navbar.classList.toggle('glass-nav', scrolled);
                navbar.classList.toggle('bg-transparent', !scrolled);

                // Adjust height
                navbar.classList.toggle('h-16', scrolled);
                navbar.classList.toggle('h-20', !scrolled);

                // Change text colors for contrast on white background
                const logoText = document.getElementById('nav-logo-text');
                const logoAccent = document.getElementById('nav-logo-accent');
                const tagline = document.getElementById('nav-tagline');
                const phoneBtn = document.getElementById('nav-phone-btn');
                const hamburgerLines = document.querySelectorAll('.nav-hamburger-line');

                if (logoText) {
                    logoText.classList.toggle('text-white', !scrolled);
                    logoText.classList.toggle('text-slate-900', scrolled);
                }
                if (logoAccent) {
                    logoAccent.classList.toggle('text-accent-400', !scrolled);
                    logoAccent.classList.toggle('text-primary-600', scrolled);
                }
                if (tagline) {
                    tagline.classList.toggle('text-indigo-200', !scrolled);
                    tagline.classList.toggle('text-slate-500', scrolled);
                }

                if (phoneBtn) {
                    phoneBtn.classList.toggle('border-slate-100', !scrolled);
                    phoneBtn.classList.toggle('border-slate-200', scrolled);
                }

                // Hamburger lines color
                hamburgerLines.forEach(line => {
                    line.classList.toggle('bg-white', !scrolled);
                    line.classList.toggle('bg-slate-900', scrolled);
                });

                // Desktop nav links color
                const navLinks = document.querySelectorAll('.nav-link-item');
                navLinks.forEach(link => {
                    link.classList.toggle('text-white', !scrolled);
                    link.classList.toggle('hover:text-accent-300', !scrolled);
                    link.classList.toggle('text-slate-700', scrolled);
                    link.classList.toggle('hover:text-primary-600', scrolled);
                    link.classList.toggle('scrolled', scrolled);
                });
            });

            // The shared universal menu owns navigation and focus handling.

            const playButton = document.getElementById('play-agent-video');
            if (playButton) playButton.addEventListener('click', () => window.loadYoutubeVideo(document.getElementById('video-wrapper')));

            // Business Hours Indicator
            const checkHours = () => {
                const now = new Date();
                const est = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
                const day = est.getDay();
                const hour = est.getHours();
                const isOpen = (day >= 1 && day <= 5) && (hour >= 9 && hour < 17);
                const dot = document.getElementById('status-dot');
                if(dot) dot.classList.toggle('hidden', !isOpen);
            };
            checkHours(); setInterval(checkHours, 60000);

        });

        // Zero-Weight Video Loader
        const YOUTUBE_VIDEO_ID = "4hJT_wMCcCg";

        window.loadYoutubeVideo = (container) => {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1`;
            iframe.title = "YouTube video player";
            iframe.frameBorder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.allowFullscreen = true;
            iframe.className = "w-full h-full absolute top-0 left-0";

            // Clear container and append iframe
            container.innerHTML = '';
            container.appendChild(iframe);
            iframe.focus();
        };
