#!/bin/bash

# Final Image Optimization Script
# This script optimizes all images for maximum performance

echo "=== Bill Layne Insurance - Final Image Optimization ==="
echo "This script will:"
echo "1. Convert PNG/JPG images to WebP format"
echo "2. Resize images to appropriate dimensions"
echo "3. Compress images for optimal file size"
echo ""

# Check for required tools
command -v cwebp >/dev/null 2>&1 || { echo "cwebp required but not installed. Install with: sudo apt-get install webp"; exit 1; }
command -v convert >/dev/null 2>&1 || { echo "ImageMagick required but not installed. Install with: sudo apt-get install imagemagick"; exit 1; }

# Create backup directory
mkdir -p images-backup
echo "Backing up original images to images-backup/"

# Function to optimize logo images
optimize_logos() {
    echo "Optimizing logo images..."
    
    for img in Logos/*.png Logos/*.jpg; do
        if [[ -f "$img" && ! "$img" =~ "Zone.Identifier" ]]; then
            filename=$(basename "$img")
            name="${filename%.*}"
            ext="${filename##*.}"
            
            # Backup original
            cp "$img" "images-backup/$filename"
            
            # Resize to standard logo size (150x60) maintaining aspect ratio
            convert "$img" -resize 150x60 -background transparent -gravity center -extent 150x60 "Logos/${name}_resized.${ext}"
            
            # Convert to WebP
            cwebp -q 85 -m 6 "Logos/${name}_resized.${ext}" -o "Logos/${name}.webp"
            
            # Clean up temporary file
            rm "Logos/${name}_resized.${ext}"
            
            echo "✓ Optimized: $filename"
        fi
    done
}

# Function to optimize content images
optimize_content_images() {
    echo "Optimizing content images..."
    
    # Create images directory if it doesn't exist
    mkdir -p images
    
    # Hero images and large content images
    for size in "1920x1080" "1200x800" "800x600" "400x300"; do
        width="${size%x*}"
        height="${size#*x}"
        
        # Create placeholder images if needed
        convert -size "$size" xc:gray "images/placeholder-${size}.jpg"
        cwebp -q 80 "images/placeholder-${size}.jpg" -o "images/placeholder-${size}.webp"
    done
}

# Function to generate responsive image sets
generate_responsive_images() {
    echo "Generating responsive image sets..."
    
    # For each original image, create multiple sizes
    for img in images/*.jpg images/*.png; do
        if [[ -f "$img" && ! "$img" =~ "placeholder" ]]; then
            filename=$(basename "$img")
            name="${filename%.*}"
            
            # Generate different sizes for responsive images
            for width in 320 640 768 1024 1920; do
                convert "$img" -resize "${width}x>" "images/${name}-${width}w.jpg"
                cwebp -q 85 "images/${name}-${width}w.jpg" -o "images/${name}-${width}w.webp"
            done
            
            echo "✓ Generated responsive set for: $filename"
        fi
    done
}

# Function to optimize Unsplash placeholder references
create_local_placeholders() {
    echo "Creating local placeholder images..."
    
    # Car Insurance Guide
    convert -size 400x300 -background '#2C3E50' -fill white -gravity center \
        -pointsize 24 label:'Car Insurance' "images/car-insurance-guide.jpg"
    cwebp -q 85 "images/car-insurance-guide.jpg" -o "images/car-insurance-guide.webp"
    
    # Home Insurance Guide
    convert -size 400x300 -background '#27AE60' -fill white -gravity center \
        -pointsize 24 label:'Home Insurance' "images/home-insurance-guide.jpg"
    cwebp -q 85 "images/home-insurance-guide.jpg" -o "images/home-insurance-guide.webp"
    
    # Business Insurance Guide
    convert -size 400x300 -background '#E74C3C' -fill white -gravity center \
        -pointsize 24 label:'Business Insurance' "images/business-insurance-guide.jpg"
    cwebp -q 85 "images/business-insurance-guide.jpg" -o "images/business-insurance-guide.webp"
    
    echo "✓ Created local placeholder images"
}

# Run all optimizations
optimize_logos
optimize_content_images
generate_responsive_images
create_local_placeholders

echo ""
echo "=== Image Optimization Complete ==="
echo "✓ All images converted to WebP format"
echo "✓ Logos resized to 150x60"
echo "✓ Responsive image sets generated"
echo "✓ Local placeholders created"
echo ""
echo "Next steps:"
echo "1. Update HTML to use local images instead of Unsplash URLs"
echo "2. Test all image references"
echo "3. Deploy to production"