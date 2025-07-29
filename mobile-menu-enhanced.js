// Enhanced Mobile Menu Handler
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const body = document.body;
    
    // Check if elements exist
    if (!mobileMenuButton || !mobileMenu) {
        console.error('Mobile menu elements not found');
        return;
    }
    
    // Toggle mobile menu
    function toggleMobileMenu() {
        const isOpen = !mobileMenu.classList.contains('hidden');
        
        if (isOpen) {
            // Close menu
            mobileMenu.classList.add('hidden');
            mobileMenuButton.classList.remove('active');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            body.classList.remove('menu-open');
        } else {
            // Open menu
            mobileMenu.classList.remove('hidden');
            mobileMenuButton.classList.add('active');
            mobileMenuButton.setAttribute('aria-expanded', 'true');
            body.classList.add('menu-open');
        }
    }
    
    // Add click event to menu button
    mobileMenuButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Handle dropdown toggles
    const dropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            const dropdownMenu = this.nextElementSibling;
            const arrow = this.querySelector('svg');
            
            if (dropdownMenu && dropdownMenu.classList.contains('mobile-dropdown-menu')) {
                // Toggle dropdown
                const isOpen = !dropdownMenu.classList.contains('hidden');
                
                if (isOpen) {
                    dropdownMenu.classList.add('hidden');
                    arrow.classList.remove('rotate-180');
                } else {
                    // Close other dropdowns first
                    document.querySelectorAll('.mobile-dropdown-menu').forEach(menu => {
                        menu.classList.add('hidden');
                    });
                    document.querySelectorAll('.mobile-dropdown-toggle svg').forEach(svg => {
                        svg.classList.remove('rotate-180');
                    });
                    
                    // Open this dropdown
                    dropdownMenu.classList.remove('hidden');
                    arrow.classList.add('rotate-180');
                }
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            if (!mobileMenu.classList.contains('hidden')) {
                toggleMobileMenu();
            }
        }
    });
    
    // Close menu when pressing Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            toggleMobileMenu();
        }
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth >= 768 && !mobileMenu.classList.contains('hidden')) {
                toggleMobileMenu();
            }
        }, 250);
    });
});