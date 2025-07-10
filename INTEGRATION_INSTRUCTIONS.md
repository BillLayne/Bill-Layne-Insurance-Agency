# Enhanced Quote Section Integration Instructions

## Overview
I've created an enhanced quote section for your Bill Layne Insurance website that includes:
- Multi-step forms for both Auto and Homeowners insurance
- Declaration page upload functionality
- Integration with your Formspree account
- Mobile-responsive design
- Progress indicators and better user experience

## Files Created
1. **enhanced-quote-section.html** - A standalone page with the full enhanced quote forms
2. **enhanced-quote-integration.js** - JavaScript to integrate the enhanced forms into your existing site
3. **INTEGRATION_INSTRUCTIONS.md** - This file

## Integration Steps

### Option 1: Quick Integration (Recommended)
This replaces your existing hero quote form with an enhanced mini version that links to the full form.

1. Add the integration script to your index.html file, just before the closing `</body>` tag:
```html
<script src="enhanced-quote-integration.js" defer></script>
```

2. The script will automatically:
   - Replace your existing quote form in the hero section
   - Add auto/home toggle buttons
   - Include a 3-step mini form process
   - Link to the full detailed quote form

### Option 2: Full Page Integration
Use the standalone enhanced quote page for detailed quotes.

1. Link to the enhanced quote page from your navigation or buttons:
```html
<a href="enhanced-quote-section.html" class="btn btn--primary">Get Detailed Quote</a>
```

2. You can also update your existing "Start My Free Quote" buttons to link to this page:
```javascript
function scrollToQuote() {
    window.location.href = 'enhanced-quote-section.html';
}
```

### Option 3: Custom Integration
If you want to integrate specific parts:

1. Copy the styles from enhanced-quote-section.html into your style.css
2. Copy the form HTML for the specific form you want (auto or home)
3. Copy the JavaScript functions needed for that form

## Features Included

### Auto Insurance Quote Form
- **Step 1**: Personal Information (name, email, phone, address)
- **Step 2**: Current Insurance with declaration page upload option
- **Step 3**: Driver Information (supports multiple drivers)
- **Step 4**: Vehicle Information (supports multiple vehicles)
- **Step 5**: Coverage Options (liability, collision, comprehensive, additional coverages)
- **Step 6**: Review and additional information

### Homeowners Insurance Quote Form
- **Step 1**: Personal Information
- **Step 2**: Property Information (address, year built, purchase info)
- **Step 3**: Home Details (square footage, construction type, safety features)
- **Step 4**: Coverage Options (dwelling, personal property, liability)
- **Step 5**: Additional Information and submission

### Key Features
- **Progress Bar**: Visual indicator of form completion
- **Form Validation**: Required fields are validated before proceeding
- **File Upload**: Customers can upload their declaration page for faster quotes
- **Multiple Entries**: Add multiple drivers and vehicles for auto quotes
- **Responsive Design**: Works on all devices
- **Formspree Integration**: All forms submit to your Formspree endpoint

## Formspree Configuration
The forms are configured to submit to: `https://formspree.io/f/xkgbdjgy`

Each submission includes:
- A `form_type` field to identify which form was submitted
- All form data including uploaded files
- Proper field names for easy processing

## Customization Options

### Change Colors
Update these CSS variables in the style section:
```css
--color-primary: #1e3a8a;
--color-primary-light: #3b82f6;
--color-accent: #10b981;
```

### Modify Steps
Each step is contained in a `<div class="form-step">` element. You can:
- Add/remove fields
- Change field types
- Modify validation rules

### Update Progress Steps
Change the `totalSteps` value in the JavaScript:
```javascript
totalSteps: 6  // Change this number
```

## Testing Recommendations

1. **Test Form Submission**: Submit test data to ensure Formspree receives it correctly
2. **Test File Upload**: Try uploading different file types and sizes
3. **Test Validation**: Try submitting with missing required fields
4. **Test Mobile**: Ensure forms work well on mobile devices
5. **Test Navigation**: Verify all navigation buttons work correctly

## Support

If you need any modifications or have questions:
- The enhanced forms are built to match your existing site design
- All forms maintain your current branding and color scheme
- The integration is designed to be seamless with your existing site

## Next Steps

1. Choose your preferred integration method
2. Test the forms thoroughly
3. Monitor Formspree submissions to ensure data is coming through correctly
4. Consider adding email notifications in Formspree for immediate alerts

The enhanced quote section will provide a much better user experience and help capture more detailed information for accurate quotes!