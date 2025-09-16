# Deployment Guide

## Production Build

### Pre-deployment Checklist

- [ ] All features tested and working
- [ ] Code reviewed and approved
- [ ] Performance optimized (Lighthouse > 90)
- [ ] SEO meta tags updated
- [ ] Analytics configured
- [ ] Forms tested and validated
- [ ] SSL certificate active
- [ ] Backup created

### Build Process

```bash
# 1. Run preflight checks
npm run preflight

# 2. Create production build
npm run build

# 3. Test production build locally
npm run preview

# 4. Verify build output
ls -la dist/
```

## GitHub Pages Deployment

### Automatic Deployment

GitHub Actions workflow handles automatic deployment on push to main branch.

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy to GitHub Pages
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

### Custom Domain Setup

1. Add CNAME file with domain:
   ```
   billlayneinsurance.com
   ```

2. Configure DNS:
   - A Record: 185.199.108.153
   - A Record: 185.199.109.153
   - A Record: 185.199.110.153
   - A Record: 185.199.111.153
   - CNAME: www -> billlayneinsurance.com

## Environment Variables

### Production Settings

Create `.env.production`:
```env
VITE_API_URL=https://api.billlayneinsurance.com
VITE_GA_ID=UA-XXXXXXXXX-X
VITE_ENV=production
```

### Security Considerations

- Never commit `.env` files
- Use GitHub Secrets for sensitive data
- Implement Content Security Policy
- Enable HTTPS everywhere
- Regular security audits

## Monitoring

### Performance Monitoring

- Google Analytics
- Google Search Console
- Lighthouse CI
- Web Vitals tracking

### Error Tracking

- Browser console errors
- 404 monitoring
- Form submission failures
- API endpoint health

### Uptime Monitoring

- GitHub Pages status
- DNS resolution checks
- SSL certificate expiry
- Response time tracking

## Rollback Procedure

### Quick Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific version
git reset --hard <commit-hash>
git push --force origin main
```

### Backup Strategy

1. Regular git commits
2. GitHub repository backups
3. Local development copies
4. Database exports (if applicable)

## Post-Deployment

### Verification Steps

1. **Functionality Testing**
   - All pages load correctly
   - Forms submit properly
   - Links work (no 404s)
   - Images display

2. **Performance Check**
   - Page load speed < 3s
   - Lighthouse score > 90
   - No console errors
   - Mobile responsive

3. **SEO Validation**
   - Sitemap accessible
   - Robots.txt correct
   - Meta tags present
   - Schema markup valid

4. **Analytics Confirmation**
   - Tracking code active
   - Events firing
   - Goals configured
   - Data collecting

## Troubleshooting

### Common Issues

**404 Errors**
- Check .htaccess configuration
- Verify build output paths
- Confirm GitHub Pages settings

**Slow Performance**
- Enable caching headers
- Compress assets
- Optimize images
- Use CDN for static assets

**SSL Certificate Issues**
- Force HTTPS redirect
- Update mixed content
- Renew certificates timely

**Build Failures**
- Check Node version
- Clear cache
- Update dependencies
- Review error logs

## Support

For deployment issues:
1. Check deployment logs
2. Review GitHub Actions output
3. Verify DNS propagation
4. Contact hosting support if needed