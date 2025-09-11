# Development Guide

## Environment Setup

### Required Software
- Node.js 18+ and npm 9+
- Git
- Code editor (VS Code recommended)

### Initial Setup

```bash
# Clone repository
git clone [repository-url]
cd Bill-Layne-Insurance-Agency-main

# Install dependencies
npm install

# Start development server
npm run dev
```

## Development Workflow

### Branch Strategy
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Making Changes

1. Create feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and test locally
   ```bash
   npm run dev
   ```

3. Validate changes
   ```bash
   npm run validate
   ```

4. Commit with descriptive message
   ```bash
   git add .
   git commit -m "feat: add new insurance calculator"
   ```

## Code Standards

### JavaScript
- ES6+ syntax
- Use const/let, no var
- Arrow functions where appropriate
- Async/await for promises
- Modular code structure

### HTML
- Semantic HTML5
- Accessibility (WCAG 2.1 AA)
- Valid markup (W3C compliant)
- SEO best practices

### CSS
- Tailwind utility classes
- Mobile-first responsive design
- Consistent spacing scale
- Performance optimized

## Testing

### Manual Testing Checklist
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness (320px - 1920px)
- [ ] Form validation and error handling
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Performance (Lighthouse score > 90)

### Automated Checks
```bash
# Lint code
npm run lint

# Format code
npm run format

# Validate HTML/CSS
npm run validate

# Full preflight check
npm run preflight
```

## Performance Guidelines

### Images
- Use WebP format when possible
- Implement lazy loading
- Optimize with imagemin
- Provide appropriate alt text

### JavaScript
- Minimize bundle size
- Code split large modules
- Tree shake unused code
- Defer non-critical scripts

### CSS
- Purge unused styles
- Minify production CSS
- Use critical CSS inline
- Optimize font loading

## Debugging

### Development Tools
- Browser DevTools
- React Developer Tools (if migrating to React)
- Lighthouse for performance
- axe DevTools for accessibility

### Common Issues

**Build Errors**
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

**Port Already in Use**
```bash
# Change port in vite.config.js
# Or kill process on port 3000
lsof -ti:3000 | xargs kill
```

**Module Not Found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev Best Practices](https://web.dev/)