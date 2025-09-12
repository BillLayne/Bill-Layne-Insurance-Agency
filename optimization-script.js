// Performance Optimization Script for Bill Layne Insurance
// This script implements lazy loading and performance optimizations

(function() {
    'use strict';
    
    // Lazy load images
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Lazy load background images
    function lazyLoadBackgrounds() {
        const elements = document.querySelectorAll('[data-bg]');
        const bgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.style.backgroundImage = `url(${element.dataset.bg})`;
                    element.removeAttribute('data-bg');
                    element.classList.add('bg-loaded');
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.01
        });
        
        elements.forEach(el => bgObserver.observe(el));
    }
    
    // Optimize third-party scripts
    function optimizeThirdParty() {
        // Delay non-critical third-party scripts
        setTimeout(() => {
            // Load analytics or other tracking scripts here
            console.log('Third-party scripts loaded');
        }, 3000);
    }
    
    // Preload critical resources
    function preloadCritical() {
        const criticalResources = [
            { href: 'styles.css', as: 'style' },
            { href: 'app.min.js', as: 'script' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'font') link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    // Resource hints for faster navigation
    function addResourceHints() {
        const hints = [
            { rel: 'prefetch', href: 'auto-coverage-checkup.html' },
            { rel: 'prefetch', href: 'home-insurance-evaluator.html' },
            { rel: 'prefetch', href: 'auto-quote.html' }
        ];
        
        hints.forEach(hint => {
            const link = document.createElement('link');
            link.rel = hint.rel;
            link.href = hint.href;
            document.head.appendChild(link);
        });
    }
    
    // Mobile optimizations
    function optimizeMobile() {
        if (window.innerWidth <= 768) {
            // Reduce animation durations on mobile
            document.documentElement.style.setProperty('--animation-duration', '0.2s');
            
            // Disable parallax effects on mobile
            document.querySelectorAll('.parallax').forEach(el => {
                el.classList.remove('parallax');
            });
        }
    }
    
    // Initialize optimizations
    function init() {
        // Run immediately
        optimizeMobile();
        
        // Run after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                lazyLoadImages();
                lazyLoadBackgrounds();
                preloadCritical();
                addResourceHints();
            });
        } else {
            lazyLoadImages();
            lazyLoadBackgrounds();
            preloadCritical();
            addResourceHints();
        }
        
        // Run after page load
        window.addEventListener('load', optimizeThirdParty);
    }
    
    // Start optimizations
    init();
    
    // Export for use in other scripts
    window.PerformanceOptimizer = {
        lazyLoadImages,
        lazyLoadBackgrounds,
        optimizeMobile
    };
})();