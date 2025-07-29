#!/bin/bash
# Convert all images to WebP format for better performance
# Bill Layne Insurance Agency - Image Optimization

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "cwebp is not installed. Please install it first:"
    echo "sudo apt-get install webp"
    exit 1
fi

# Create optimized images directory
mkdir -p images/optimized

echo "Starting image optimization..."

# Convert JPG/JPEG files
for img in images/*.{jpg,jpeg,JPG,JPEG}; do
    if [ -f "$img" ]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        
        # Create WebP version (high quality)
        cwebp -q 85 "$img" -o "images/optimized/${name}.webp"
        
        # Create mobile version (smaller)
        cwebp -q 80 -resize 768 0 "$img" -o "images/optimized/${name}-mobile.webp"
        
        # Create desktop version
        cwebp -q 85 -resize 1920 0 "$img" -o "images/optimized/${name}-desktop.webp"
        
        echo "✓ Converted: $img"
    fi
done

# Convert PNG files
for img in images/*.{png,PNG}; do
    if [ -f "$img" ]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        
        # Create WebP version (high quality for PNG)
        cwebp -q 90 "$img" -o "images/optimized/${name}.webp"
        
        # Create mobile version
        cwebp -q 85 -resize 768 0 "$img" -o "images/optimized/${name}-mobile.webp"
        
        # Create desktop version
        cwebp -q 90 -resize 1920 0 "$img" -o "images/optimized/${name}-desktop.webp"
        
        echo "✓ Converted: $img"
    fi
done

# Calculate savings
original_size=$(du -sh images/*.{jpg,jpeg,png,JPG,JPEG,PNG} 2>/dev/null | awk '{total += $1} END {print total}')
optimized_size=$(du -sh images/optimized/*.webp 2>/dev/null | awk '{total += $1} END {print total}')

echo ""
echo "Image optimization complete!"
echo "Original size: ~${original_size}MB"
echo "Optimized size: ~${optimized_size}MB"
echo ""
echo "Next steps:"
echo "1. Move optimized images to your images folder"
echo "2. Update HTML to use WebP with fallbacks"
echo "3. Test on various devices and browsers"