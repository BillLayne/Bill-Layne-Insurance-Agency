# CLS Fixes - Round 2

## Overview
Fixed remaining Cumulative Layout Shift issues to improve CLS score from 0.132 to target <0.1

## Changes Made

### 1. Hero Section Layout Shift (0.114 CLS)
- Added minimum heights for hero content container (280px, mobile: 220px)
- Set explicit heights for headline (3.5em) and subheadline (3em)
- Added minimum height for features section (80px)
- Used clamp() for responsive font sizes to prevent text reflow

### 2. Mobile Sticky Header Layout Shifts
- Initially hidden with `display: none`
- Added fixed positioning with transform animations
- Only shown after scroll > 200px on mobile
- Smooth transition using CSS transforms instead of position changes

### 3. Unsplash Image Dimensions
- Fixed Car Insurance Guide image with proper aspect ratio
- Added inline styles with `aspect-ratio: 400/300`
- Changed URL parameters to request specific sizes (w=400&h=300)
- Added `decoding="async"` to all images

### 4. JavaScript Optimization
- Cached DOM queries to prevent repeated lookups
- Used requestAnimationFrame for scroll handlers
- Added passive event listeners for better performance
- Eliminated forced reflows by batching DOM reads/writes

## Technical Improvements

```javascript
// Before: Forced reflow on every scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar'); // DOM query
    const height = navbar.offsetHeight; // Force reflow
    // ...
});

// After: Cached queries with RAF
let navbarHeight = null;
function initializeElements() {
    navbarHeight = document.querySelector('.navbar').offsetHeight;
}
window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(updateUI);
        ticking = true;
    }
}, { passive: true });
```

## Expected Results
- CLS score: 0.132 → <0.05
- Eliminated 120ms of forced reflow time
- Smoother scrolling experience
- Better mobile performance