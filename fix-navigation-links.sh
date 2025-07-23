#!/bin/bash

# Script to update all navigation links to billlayneinsurance.com

echo "=== Updating all navigation links to billlayneinsurance.com ==="

# Update robots.txt
sed -i 's/ncautoandhome\.com/billlayneinsurance.com/g' robots.txt
sed -i 's/billlayne\.github\.io\/[^/]*\//billlayneinsurance.com\//g' robots.txt

# Update sitemap
sed -i 's/ncautoandhome\.com/billlayneinsurance.com/g' sitemap-new.xml

# Update all structured data files
for file in *.json; do
    if [ -f "$file" ]; then
        sed -i 's/ncautoandhome\.com/billlayneinsurance.com/g' "$file"
        sed -i 's/billLayneinsurance\.com/billlayneinsurance.com/g' "$file"
        sed -i 's/billlayne\.github\.io\/[^/]*\//billlayneinsurance.com\//g' "$file"
    fi
done

# Update all HTML files
for html in *.html; do
    if [ -f "$html" ]; then
        echo "Updating $html..."
        
        # Update meta tags and canonical URLs
        sed -i 's/billlayne\.github\.io\/Bill-Layne-Insurance\.gitbhub\.io/billlayneinsurance.com/g' "$html"
        sed -i 's/billlayne\.github\.io\/[^/"]*\//billlayneinsurance.com\//g' "$html"
        sed -i 's/www\.billLayneinsurance\.com/www.billlayneinsurance.com/g' "$html"
        sed -i 's/ncautoandhome\.com/billlayneinsurance.com/g' "$html"
        
        # Update navigation links
        # Replace href="/" with full domain
        sed -i 's|href="/"|href="https://billlayneinsurance.com/"|g' "$html"
        
        # Replace href="index.html" with full domain
        sed -i 's|href="index\.html"|href="https://billlayneinsurance.com/"|g' "$html"
        
        # Fix navbar brand links
        sed -i 's|<a href="#" aria-label="Bill Layne Insurance Agency Home"|<a href="https://billlayneinsurance.com/" aria-label="Bill Layne Insurance Agency Home"|g' "$html"
        
        # Update breadcrumb home links
        sed -i 's|"item": "/"|"item": "https://billlayneinsurance.com/"|g' "$html"
    fi
done

# Special handling for specific navigation patterns
echo "Fixing special navigation patterns..."

# Fix navbar brand in all files
for html in *.html; do
    if [ -f "$html" ]; then
        # Fix navbar-brand links that might have variations
        sed -i 's|class="navbar-brand" href="[^"]*"|class="navbar-brand" href="https://billlayneinsurance.com/"|g' "$html"
        
        # Fix Home menu items
        sed -i 's|>Home</a>|>Home</a>|g' "$html" # This is to identify home links
        sed -i 's|href="[^"]*"\(.*\)>Home</a>|href="https://billlayneinsurance.com/"\1>Home</a>|g' "$html"
    fi
done

echo "=== Navigation update complete ==="
echo "All links now point to billlayneinsurance.com"