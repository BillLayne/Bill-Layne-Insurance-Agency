#!/bin/bash

# Script to update headers across all main website pages
# This script will backup original files and update headers to match Resources page design

echo "=== Updating Website Headers ==="
echo ""

# List of pages to update
PAGES=("index.html" "home-insurance-evaluator.html" "auto-coverage-checkup.html" "contact-us.html" "blog.html" "areas-we-serve.html" "insurance-elkin-nc.html" "insurance-mount-airy-nc.html")

# Create backups directory
mkdir -p backups/$(date +%Y%m%d)

# Function to update a page's header
update_page_header() {
    local page=$1
    local backup_dir="backups/$(date +%Y%m%d)"
    
    echo "Processing $page..."
    
    # Create backup
    cp "$page" "$backup_dir/$page.backup"
    
    # Create temporary file
    temp_file=$(mktemp)
    
    # Extract content before header
    sed -n '1,/<header/p' "$page" | sed '$d' > "$temp_file"
    
    # Add new header
    cat >> "$temp_file" << 'EOF'
<!-- Updated Header with Consistent Design -->
<header class="site-header">
    <nav class="navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-logo">
                Bill Layne Insurance Agency
            </a>
            
            <div class="nav-menu" id="navMenu">
                <a href="index.html" class="nav-link">Home</a>
                <a href="home-insurance-evaluator.html" class="nav-link">Home Insurance</a>
                <a href="auto-coverage-checkup.html" class="nav-link">Auto Insurance</a>
                <a href="#claims" class="nav-link">Claims Center</a>
                <a href="https://billlayne.github.io/Resources/" class="nav-link" target="_blank">Resources</a>
                <a href="blog.html" class="nav-link">Blog</a>
                <a href="contact-us.html" class="nav-link">Contact</a>
            </div>
            
            <div class="nav-actions">
                <a href="tel:+13367895012" class="nav-cta">
                    <i class="fas fa-phone"></i> (336) 789-5012
                </a>
                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    </nav>
</header>
EOF
    
    # Extract content after original header
    sed -n '/<\/header>/,$p' "$page" | sed '1d' >> "$temp_file"
    
    # Replace original file
    mv "$temp_file" "$page"
    
    echo "✓ Updated $page"
}

# Add/Update CSS in style.css
echo "Updating style.css with consistent header styles..."

# Check if header styles already exist
if ! grep -q "site-header" style.css; then
    # Add header styles to style.css
    cat >> style.css << 'EOF'

/* Consistent Header Styles - Added for unified design */
.site-header {
    background: #ffffff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.navbar {
    padding: 1rem 0;
}

.nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.nav-logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: #007bff;
    text-decoration: none;
    transition: color 0.3s ease;
}

.nav-logo:hover {
    color: #0056b3;
}

.nav-menu {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.nav-link {
    color: #333333;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    position: relative;
}

.nav-link:hover,
.nav-link.active {
    color: #007bff;
}

.nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    height: 2px;
    background: #007bff;
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.nav-cta {
    background: #007bff;
    color: #ffffff;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.nav-cta:hover {
    background: #0056b3;
    text-decoration: none;
}

.mobile-menu-toggle {
    display: none;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
}

.mobile-menu-toggle span {
    width: 25px;
    height: 3px;
    background: #333333;
    transition: all 0.3s ease;
}

/* Mobile Responsive Header */
@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        left: -100%;
        top: 70px;
        flex-direction: column;
        background: #ffffff;
        width: 100%;
        text-align: center;
        transition: all 0.3s ease;
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        padding: 2rem 0;
    }
    
    .nav-menu.active {
        left: 0;
    }
    
    .mobile-menu-toggle {
        display: flex;
    }
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
    
    .nav-cta {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    .nav-logo {
        font-size: 1.2rem;
    }
    
    .nav-cta {
        padding: 0.5rem 0.75rem;
        font-size: 0.85rem;
    }
}
EOF
    echo "✓ Added header styles to style.css"
else
    echo "✓ Header styles already exist in style.css"
fi

# Process each page
for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        update_page_header "$page"
    else
        echo "⚠ Skipping $page - file not found"
    fi
done

# Add mobile menu JavaScript to main script file or inline
echo ""
echo "Adding mobile menu functionality..."

# Create a shared JavaScript file for header functionality
cat > header-scripts.js << 'EOF'
// Mobile Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
        
        // Close menu when clicking on a link (mobile)
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                }
            });
        });
    }
    
    // Add active class to current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
});
EOF

echo "✓ Created header-scripts.js"

echo ""
echo "=== Update Complete! ==="
echo ""
echo "Next steps:"
echo "1. Review the updated files"
echo "2. Add <script src='header-scripts.js'></script> before </body> tag in each HTML file"
echo "3. Test the mobile menu functionality"
echo "4. Commit and push changes to GitHub"
echo ""
echo "Backups saved in: backups/$(date +%Y%m%d)/"