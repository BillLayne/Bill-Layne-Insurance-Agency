// Enhanced lazy loading with IntersectionObserver
document.addEventListener('DOMContentLoaded', function() {
    // Check if browser supports IntersectionObserver
    if ('IntersectionObserver' in window) {
        // Get all images with data-src attribute
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Load the image
                    img.src = img.dataset.src;
                    
                    // Remove data-src attribute
                    img.removeAttribute('data-src');
                    
                    // Add loaded class for CSS transitions
                    img.classList.add('lazy-loaded');
                    
                    // Stop observing this image
                    observer.unobserve(img);
                }
            });
        }, {
            // Start loading when image is 50px away from viewport
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        // Observe all lazy images
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
});

// Add smooth fade-in effect for lazy loaded images
const style = document.createElement('style');
style.textContent = `
    img[data-src] {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    }
    
    img.lazy-loaded {
        opacity: 1;
    }
    
    /* Placeholder background while loading */
    img[data-src] {
        background: #f0f0f0;
        background-image: linear-gradient(90deg, #f0f0f0 0px, #e0e0e0 40px, #f0f0f0 80px);
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: 200px 0; }
    }
`;
document.head.appendChild(style);