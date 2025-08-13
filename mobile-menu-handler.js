// Mobile Menu Handler with Scroll Position Fix
// Bill Layne Insurance Agency - Performance Optimization

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const headerNav = document.querySelector('.header-nav');
    let scrollPosition = 0;
    
    if (!mobileMenuToggle || !headerNav) return;
    
    // Prevent scroll jump when menu opens/closes
    function openMobileMenu() {
        scrollPosition = window.pageYOffset;
        document.body.style.top = `-${scrollPosition}px`;
        document.body.classList.add('menu-open');
        headerNav.classList.add('active');
        mobileMenuToggle.classList.add('active');
        
        // Set ARIA attributes for accessibility
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        headerNav.setAttribute('aria-hidden', 'false');
    }
    
    function closeMobileMenu() {
        document.body.classList.remove('menu-open');
        document.body.style.top = '';
        window.scrollTo(0, scrollPosition);
        headerNav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        
        // Set ARIA attributes for accessibility
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        headerNav.setAttribute('aria-hidden', 'true');
    }
    
    // Toggle menu on button click
    mobileMenuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        const isOpen = headerNav.classList.contains('active');
        
        if (!isOpen) {
            openMobileMenu();
        } else {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileMenuToggle.contains(e.target) && 
            !headerNav.contains(e.target) && 
            headerNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && headerNav.classList.contains('active')) {
            closeMobileMenu();
            mobileMenuToggle.focus();
        }
    });
    
    // Close menu when window resizes above mobile breakpoint
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 900 && headerNav.classList.contains('active')) {
                closeMobileMenu();
            }
        }, 250);
    });
});