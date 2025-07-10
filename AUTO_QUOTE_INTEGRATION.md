# Auto Insurance Quote Form Integration

## Overview
This is a comprehensive auto insurance quote form that replaces the simple form in your hero section with a full 6-step process, including declaration page upload functionality.

## Quick Integration

To integrate this enhanced auto quote form into your main website, simply add this script tag before the closing `</body>` tag in your `index.html`:

```html
<script src="auto-quote-hero.js" defer></script>
```

That's it! The script will automatically:
- Find your existing quote form in the hero section
- Replace it with the new 6-step auto insurance form
- Handle all form interactions and submissions to your Formspree account

## Features

### 6-Step Process:
1. **Personal Information** - Name, email, phone, ZIP code
2. **Current Insurance** - Option to upload declaration page or enter manually
3. **Drivers** - Add all drivers on the policy
4. **Vehicles** - Add all vehicles to be insured
5. **Coverage Options** - Select liability, collision, comprehensive, and additional coverages
6. **Additional Information** - Final details and consent

### Key Features:
- **Declaration Page Upload**: Customers can upload their current declaration page for faster processing
- **Multiple Drivers/Vehicles**: Add as many drivers and vehicles as needed
- **Smart Validation**: Each step validates before proceeding
- **Progress Indicator**: Visual progress bar shows completion status
- **Mobile Responsive**: Works perfectly on all devices
- **Formspree Integration**: Submits directly to your account

## Form Behavior
- The form automatically validates required fields
- Users can navigate back and forth between steps
- File uploads are handled seamlessly
- Success message displays after submission
- Form data is sent to: `https://formspree.io/f/xkgbdjgy`

## Customization
If you need to modify the form:
- Colors and styling match your existing site
- All form fields can be edited in the `auto-quote-hero.js` file
- Steps can be added/removed by updating the form structure

## Testing
After integration:
1. Test the form submission
2. Verify file uploads work
3. Check that data arrives in Formspree
4. Test on mobile devices

The form is ready to use and will provide a much better experience for customers requesting auto insurance quotes!