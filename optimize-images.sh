#!/bin/bash

# Image optimization script for Bill Layne Insurance website
# This script requires imagemagick to be installed: sudo apt-get install imagemagick

echo "Starting image optimization..."

# Create backup directory
mkdir -p Logos/backup

# Function to optimize image
optimize_image() {
    local file="$1"
    local filename=$(basename "$file")
    
    # Create backup
    cp "$file" "Logos/backup/$filename"
    
    # Get original size
    original_size=$(stat -c%s "$file")
    
    # Optimize based on file type
    if [[ $file == *.png ]]; then
        # For PNG files
        convert "$file" -strip -quality 85 -define png:compression-level=9 "$file"
    elif [[ $file == *.jpg ]] || [[ $file == *.jpeg ]]; then
        # For JPEG files
        convert "$file" -strip -quality 85 -sampling-factor 4:2:0 -interlace JPEG "$file"
    fi
    
    # Get new size
    new_size=$(stat -c%s "$file")
    
    # Calculate savings
    savings=$((original_size - new_size))
    percentage=$((savings * 100 / original_size))
    
    echo "Optimized $filename: ${original_size} -> ${new_size} bytes (${percentage}% reduction)"
}

# Optimize all images in Logos directory
for img in Logos/*.{png,jpg,jpeg}; do
    if [ -f "$img" ]; then
        optimize_image "$img"
    fi
done

echo "Image optimization complete!"
echo "Backups saved in Logos/backup/"

# Create WebP versions for modern browsers
echo ""
echo "Creating WebP versions for modern browsers..."

for img in Logos/*.{png,jpg,jpeg}; do
    if [ -f "$img" ]; then
        filename="${img%.*}"
        cwebp -q 80 "$img" -o "${filename}.webp" 2>/dev/null || echo "WebP conversion skipped (cwebp not installed)"
    fi
done

echo "Done!"