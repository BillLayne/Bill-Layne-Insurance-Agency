# Performance Optimization Guide for NC Auto & Home Website

## Overview
This guide addresses all performance issues identified in your PageSpeed Insights report to improve your mobile score from 69 to 90+.

## Files Created
1. **image-optimization-script.html** - Tool to convert images to WebP format
2. **update-images-to-webp.js** - Script to update HTML for WebP images
3. **minify-assets.js** - Script to minify CSS and JavaScript
4. **fix-cls.css** - CSS fixes for Cumulative Layout Shift
5. **optimized-index.html** - Example optimized HTML structure
6. **.htaccess** - Server configuration for caching and compression

## Step-by-Step Implementation

### 1. Image Optimization
- Open `image-optimization-script.html` in a browser
- Upload all logo images (NC Grange, Alamance, National General, etc.)
- Download the optimized WebP versions
- Place them in your images folder with the same names but .webp extension

### 2. Update HTML for WebP
- Run `node update-images-to-webp.js` on your HTML files
- This converts `<img>` tags to `<picture>` elements with WebP support

### 3. Minify CSS and JavaScript
- Copy `minify-assets.js` to your project
- Run it to create minified versions of style.css and app.js
- Update your HTML to use style.min.css and app.min.js

### 4. Fix Layout Shift (CLS)
- Add the CSS from `fix-cls.css` to your stylesheet
- Ensure all images have explicit width and height attributes
- Add min-height to dynamic content areas

### 5. Implement Caching
- Upload the `.htaccess` file to your web server root
- This enables browser caching and gzip compression

### 6. Optimize Critical Path
- Move critical CSS inline (as shown in optimized-index.html)
- Load non-critical CSS asynchronously
- Defer JavaScript loading
- Add preconnect hints for external domains

## Expected Results
- **Image optimization**: 50-80% file size reduction
- **Minification**: ~30% reduction in CSS/JS size
- **CLS fix**: Score should drop from 0.433 to under 0.1
- **Caching**: Faster repeat visits, reduced server load
- **Overall**: Mobile performance score should improve to 85-95

## Testing
After implementing these changes:
1. Test locally first
2. Deploy to a staging environment
3. Run PageSpeed Insights again
4. Fine-tune based on new results

## Maintenance
- Convert new images to WebP before uploading
- Minify CSS/JS after any changes
- Monitor CLS score regularly
- Update cache headers as needed