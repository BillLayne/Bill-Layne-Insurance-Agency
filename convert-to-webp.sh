#!/bin/bash

# Create WebP versions of all logo images
echo "Converting logo images to WebP format..."

# Install cwebp if not available
if ! command -v cwebp &> /dev/null; then
    echo "cwebp not found. Please install webp tools:"
    echo "Ubuntu/Debian: sudo apt-get install webp"
    echo "macOS: brew install webp"
    exit 1
fi

# Convert each PNG logo to WebP
for img in Logos/*.png; do
    if [[ -f "$img" && ! "$img" =~ "Zone.Identifier" ]]; then
        output="${img%.png}.webp"
        echo "Converting $img to $output"
        cwebp -q 85 -resize 150 60 "$img" -o "$output"
    fi
done

echo "Conversion complete!"