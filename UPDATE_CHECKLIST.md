# Website Update Checklist

When making CSS/JS changes:

1. [ ] Make your CSS/JS changes
2. [ ] Update SITE_VERSION in all HTML files
   - Current: 2024.12.13.1
   - New: 2024.MM.DD.X
3. [ ] Update version comment in style.css
4. [ ] Update version comment in app.js
5. [ ] Commit with message: "Update site version to 2024.MM.DD.X"
6. [ ] Push to GitHub
7. [ ] Wait 2-3 minutes for GitHub Pages to update
8. [ ] Test with hard refresh (Ctrl+F5)

## Version Format
- Format: YYYY.MM.DD.iteration
- Example: 2024.12.13.1 (Year 2024, December 13, first update of the day)
- Increment iteration for multiple updates on the same day

## Files to Update

### HTML Files (Update SITE_VERSION)
All HTML files contain the version in two places:
1. In the `<script>` tag: `window.SITE_VERSION = '2024.12.13.1';`
2. In CSS/JS references: `?v=2024.12.13.1`

**Main Directory:**
- index.html
- contact-us.html
- areas-we-serve.html
- auto-coverage-checkup.html
- auto-insurance.html
- auto-quote.html
- blog.html
- home-insurance-evaluator.html
- insurance-elkin-nc.html
- insurance-mount-airy-nc.html
- insurance-quiz.html
- umbrella-policy-calculator.html
- 404.html
- enhanced-quote-section.html
- alamance-farmers.html
- alamance-farmers-landing.html
- nc-grange.html
- nc-grange-landing.html
- progressive-nc-landing.html
- travelers-nc-landing.html

**Carriers Directory:**
- carriers/index.html
- carriers/national-general-north-carolina.html
- carriers/national_general_nc_landing.html
- carriers/nationwide-north-carolina.html

### CSS/JS Files (Update version comments)
- style.css (Update version in header comment)
- app.js (Update version in header comment)

## Quick Update Script (Optional)

You can use this bash command to update all versions at once:

```bash
# Set new version
NEW_VERSION="2024.12.14.1"
OLD_VERSION="2024.12.13.1"

# Update all HTML files
find . -name "*.html" -type f -exec sed -i "s/$OLD_VERSION/$NEW_VERSION/g" {} \;

# Update CSS and JS files
sed -i "s/$OLD_VERSION/$NEW_VERSION/g" style.css
sed -i "s/$OLD_VERSION/$NEW_VERSION/g" app.js

echo "Updated version from $OLD_VERSION to $NEW_VERSION"
```

## Testing Cache Updates

### Development Mode
The site automatically disables caching when accessed from:
- localhost
- 127.0.0.1
- Any URL with `?dev=true` parameter

### Production Testing
1. Open browser DevTools (F12)
2. Go to Network tab
3. Check "Disable cache" while DevTools is open
4. Refresh the page
5. Verify new versions are loaded

### Verify Updates
Look for these in the browser console:
- Development mode: "Development mode: Cache disabled"
- Check Network tab for `style.css?v=2024.12.13.1` and `app.js?v=2024.12.13.1`

## Troubleshooting

### Changes Not Appearing
1. Verify version was updated in all files
2. Check GitHub Actions/Pages build status
3. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Clear browser cache completely
5. Test in incognito/private window

### GitHub Pages Delay
- GitHub Pages can take 2-10 minutes to update
- Check deployment status at: https://github.com/[your-username]/Bill-Layne-Insurance-Agency/deployments

## Important Notes

- **NEVER** update the git config
- **NEVER** add version parameters to external resources (CDNs, APIs)
- **ALWAYS** test in multiple browsers after deployment
- **ALWAYS** maintain the same version across ALL files
- Version changes force browsers to download new files immediately
- Old cached files are automatically replaced

## Benefits of This System

✅ Immediate updates when version changes
✅ Efficient caching between updates
✅ No manual cache clearing needed for users
✅ Development mode for easy testing
✅ Consistent versioning across all resources
✅ Industry-standard approach

---

🔧 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>