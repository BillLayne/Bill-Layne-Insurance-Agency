#!/bin/bash

# Script to update headers to match Resources page design with simplified navigation

echo "=== Updating Headers to Match Resources Design ==="
echo ""

# List of pages to update
PAGES=("index.html" "home-insurance-evaluator.html" "auto-coverage-checkup.html" "contact-us.html" "blog.html" "areas-we-serve.html" "insurance-elkin-nc.html" "insurance-mount-airy-nc.html")

# Create backup first
mkdir -p backups/simplified_$(date +%Y%m%d)

# Function to update each page
update_page_header() {
    local page=$1
    local backup_dir="backups/simplified_$(date +%Y%m%d)"
    
    echo "Processing $page..."
    
    # Create backup
    cp "$page" "$backup_dir/$page.backup"
    
    # Create temporary file
    temp_file=$(mktemp)
    
    # Extract content before header
    sed -n '1,/<header/p' "$page" | sed '$d' > "$temp_file"
    
    # Add new simplified header matching Resources page
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

# Update each page
for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        update_page_header "$page"
    else
        echo "⚠ Skipping $page - file not found"
    fi
done

echo ""
echo "=== Update Complete! ==="
echo "All headers now match the Resources page design with simplified navigation."
echo "Backups saved in: backups/simplified_$(date +%Y%m%d)/"