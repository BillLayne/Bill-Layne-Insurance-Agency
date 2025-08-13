#!/bin/bash

# Script to fix phone number and ensure single row display

echo "=== Fixing Header Layout and Phone Number ==="
echo ""

# List of pages to update
PAGES=("index.html" "home-insurance-evaluator.html" "auto-coverage-checkup.html" "contact-us.html" "blog.html" "areas-we-serve.html" "insurance-elkin-nc.html" "insurance-mount-airy-nc.html")

# Create backup
mkdir -p backups/phone_fix_$(date +%Y%m%d)

# Update all HTML files with correct phone number
echo "Updating phone numbers in all files..."
for file in *.html; do
    if [ -f "$file" ]; then
        # Replace all instances of the old phone number
        sed -i 's/336-789-5012/336-835-1993/g' "$file"
        sed -i 's/+13367895012/+13368351993/g' "$file"
        sed -i 's/(336) 789-5012/(336) 835-1993/g' "$file"
        echo "✓ Updated phone numbers in $file"
    fi
done

# Also update the header-scripts.js if it exists
if [ -f "header-scripts.js" ]; then
    sed -i 's/336-789-5012/336-835-1993/g' "header-scripts.js"
    sed -i 's/+13367895012/+13368351993/g' "header-scripts.js"
fi

# Update CSS to ensure single row display
echo ""
echo "Updating CSS for single row display..."

# Add CSS to ensure header displays in one row
cat >> style.css << 'EOF'

/* Ensure header displays in single row like Resources page */
.nav-logo {
    white-space: nowrap;
    flex-shrink: 0;
}

.nav-menu {
    white-space: nowrap;
}

.nav-cta {
    white-space: nowrap;
    flex-shrink: 0;
}

/* Adjust spacing for better fit */
@media (min-width: 1200px) {
    .nav-menu {
        gap: 1.5rem;
    }
}

@media (min-width: 992px) and (max-width: 1199px) {
    .nav-menu {
        gap: 1rem;
    }
    
    .nav-link {
        font-size: 0.95rem;
    }
}
EOF

echo "✓ Updated CSS for single row display"

# Function to update header structure
update_header_structure() {
    local page=$1
    local backup_dir="backups/phone_fix_$(date +%Y%m%d)"
    
    echo "Updating header structure in $page..."
    
    # Backup
    cp "$page" "$backup_dir/$page.backup"
    
    # Create temp file
    temp_file=$(mktemp)
    
    # Extract content before header
    sed -n '1,/<header/p' "$page" | sed '$d' > "$temp_file"
    
    # Add updated header with correct phone
    cat >> "$temp_file" << 'EOF'
<!-- Header -->
<header class="site-header">
    <nav class="navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-logo">
                Bill Layne Insurance Agency
            </a>
            
            <div class="nav-menu" id="navMenu">
                <a href="index.html" class="nav-link">Home</a>
                <a href="#services" class="nav-link">Services</a>
                <a href="auto-coverage-checkup.html" class="nav-link">Auto</a>
                <a href="#claims" class="nav-link">Claims</a>
                <a href="https://billlayne.github.io/Resources/" class="nav-link">Resources</a>
                <a href="blog.html" class="nav-link">Blog</a>
                <a href="contact-us.html" class="nav-link">Contact</a>
            </div>
            
            <div class="nav-actions">
                <a href="tel:+13368351993" class="nav-cta">
                    <i class="fas fa-phone"></i> 336-835-1993
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
    
    # Extract content after header
    sed -n '/<\/header>/,$p' "$page" | sed '1d' >> "$temp_file"
    
    # Replace file
    mv "$temp_file" "$page"
    
    echo "✓ Updated header in $page"
}

# Update headers
echo ""
echo "Updating header structures..."
for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        update_header_structure "$page"
    fi
done

echo ""
echo "=== Update Complete! ==="
echo "- Phone number updated to 336-835-1993"
echo "- CSS updated to ensure single row display"
echo "- All headers match Resources page layout"