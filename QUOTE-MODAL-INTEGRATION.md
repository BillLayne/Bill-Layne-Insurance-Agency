# Quote Modal Integration Guide

## Overview
The unified quote modal has been implemented to provide a consistent quote form experience across all pages of the Bill Layne Insurance Agency website.

## Main Page (index.html)
The modal is already fully integrated into the main page with:
- Modal HTML structure included
- CSS styles added to style.css
- JavaScript functionality embedded in the page
- Mobile "Get Free Quote" button updated to trigger the modal

## For Other Pages (Landing Pages, etc.)

To add the quote modal to any other page, follow these steps:

### 1. Include the Modal Script
Add this script tag before the closing `</body>` tag:
```html
<script src="quote-modal.js" defer></script>
```

### 2. Configure EmailJS (if different from main site)
If the page uses different EmailJS credentials, add this configuration before loading quote-modal.js:
```html
<script>
    // Configure page-specific EmailJS settings
    window.EMAILJS_CONFIG = {
        serviceId: 'your_service_id',
        templateId: 'your_template_id'
    };
    
    // Optional: Set page location/source for tracking
    window.PAGE_LOCATION = 'Elkin, NC';
    window.PAGE_SOURCE = 'Elkin Landing Page';
</script>
```

### 3. Update Buttons
Change any button that should open the quote modal from:
```html
<button onclick="scrollToQuote()">Get Free Quote</button>
```
To:
```html
<button onclick="openQuoteModal()">Get Free Quote</button>
```

### 4. Example Integration for Landing Pages
```html
<!-- Before </body> tag -->
<script>
    // Configure for this specific landing page
    window.EMAILJS_CONFIG = {
        serviceId: 'service_5sp3w5o',
        templateId: 'template_eouvfvc'
    };
    window.PAGE_LOCATION = 'Elkin, NC';
    window.PAGE_SOURCE = 'Elkin Landing Page';
</script>
<script src="quote-modal.js" defer></script>
```

## Features
- Mobile-optimized responsive design
- Smooth animations and transitions
- ESC key to close
- Form validation
- EmailJS integration with fallback to mailto
- Accessibility features (ARIA labels, focus management)
- Consistent styling matching the main site

## Customization
The modal automatically inherits the site's CSS variables for consistent theming:
- `--color-primary`: Primary button color
- `--color-primary-dark`: Button hover color
- Other standard form styling from the site's CSS

## Testing
After integration, test:
1. Modal opens when clicking quote buttons
2. Form validation works correctly
3. EmailJS submission functions properly
4. Modal closes on ESC key or clicking overlay
5. Mobile responsiveness and touch interactions