// Script to update HTML to use WebP images with fallbacks
// Run this after converting your images to WebP format

const fs = require('fs');
const path = require('path');

function updateHtmlForWebP(htmlContent) {
    // Replace img tags with picture elements for WebP support
    const imgRegex = /<img\s+([^>]*src=["']([^"']+\.(jpg|jpeg|png))["'][^>]*)>/gi;
    
    return htmlContent.replace(imgRegex, (match, attributes, src, ext) => {
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const altMatch = attributes.match(/alt=["']([^"']+)["']/);
        const alt = altMatch ? altMatch[1] : '';
        const classMatch = attributes.match(/class=["']([^"']+)["']/);
        const className = classMatch ? classMatch[1] : '';
        const widthMatch = attributes.match(/width=["']?(\d+)["']?/);
        const width = widthMatch ? widthMatch[1] : '';
        const heightMatch = attributes.match(/height=["']?(\d+)["']?/);
        const height = heightMatch ? heightMatch[1] : '';
        
        let pictureElement = '<picture>';
        pictureElement += `\n  <source srcset="${webpSrc}" type="image/webp">`;
        pictureElement += `\n  <img src="${src}" alt="${alt}"`;
        if (className) pictureElement += ` class="${className}"`;
        if (width) pictureElement += ` width="${width}"`;
        if (height) pictureElement += ` height="${height}"`;
        pictureElement += ' loading="lazy" decoding="async">';
        pictureElement += '\n</picture>';
        
        return pictureElement;
    });
}

// Example usage:
// const html = fs.readFileSync('index.html', 'utf8');
// const updatedHtml = updateHtmlForWebP(html);
// fs.writeFileSync('index.html', updatedHtml);

console.log('Use this script to update your HTML files to use WebP images with fallbacks.');
console.log('Example: node update-images-to-webp.js');

// Export for use in other scripts
module.exports = { updateHtmlForWebP };