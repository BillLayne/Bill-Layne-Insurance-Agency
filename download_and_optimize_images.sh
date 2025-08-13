#!/bin/bash

# Create images directory if it doesn't exist
mkdir -p images

# Download the hero image from GitHub
echo "Downloading hero image..."
curl -L "https://raw.githubusercontent.com/BillLayne/bill-layne-images/refs/heads/main/logos/Car%20Insurance.webp" -o "images/hero-car-insurance-original.webp"

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "Creating optimized versions..."
    
    # Create desktop version (986x657px, optimized)
    convert images/hero-car-insurance-original.webp -resize 986x657^ -gravity center -extent 986x657 -quality 85 images/hero-car-insurance.webp
    
    # Create mobile version (480x320px, optimized) 
    convert images/hero-car-insurance-original.webp -resize 480x320^ -gravity center -extent 480x320 -quality 80 images/hero-car-insurance-mobile.webp
    
    echo "Image optimization complete!"
    
    # Show file sizes
    echo "File sizes:"
    ls -lh images/hero-car-insurance*.webp
else
    echo "ImageMagick not installed. Using original image."
    cp images/hero-car-insurance-original.webp images/hero-car-insurance.webp
    cp images/hero-car-insurance-original.webp images/hero-car-insurance-mobile.webp
fi

# Download Bill Layne Insurance logo if referenced
echo "Downloading Bill Layne Insurance logo..."
curl -L "https://i.imgur.com/cBAgeX8.png" -o "images/bill-layne-insurance-logo.png"

# Convert logo to WebP if possible
if command -v convert &> /dev/null; then
    convert images/bill-layne-insurance-logo.png -quality 90 images/bill-layne-insurance-logo.webp
fi

echo "Image download and optimization complete!"