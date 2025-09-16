# Bill Layne Insurance Agency Website

Professional insurance services website for Bill Layne Insurance Agency serving Elkin, NC and surrounding areas.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
├── index.html              # Main landing page
├── app.js                  # Core JavaScript functionality
├── images/                 # Image assets
├── carriers/              # Insurance carrier resources
├── dist/                  # Production build (gitignored)
├── CLAUDE.md              # AI assistant context file
└── docs/                  # Documentation
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint JavaScript and HTML files
- `npm run format` - Format all files with Prettier
- `npm run validate` - Run all validation checks
- `npm run preflight` - Pre-deployment checks

## Features

- **Insurance Calculators**: Auto, Home, Umbrella policy tools
- **Quote Systems**: Multi-step quote forms with validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **PWA Support**: Offline functionality with service worker
- **SEO Optimized**: Meta tags, sitemap, structured data
- **Performance**: Optimized assets, lazy loading, code splitting

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Linting**: ESLint, Prettier
- **PWA**: Workbox, Service Workers
- **Hosting**: GitHub Pages

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm run dev`
4. Open browser to `http://localhost:3000`

### Code Style

This project uses ESLint and Prettier for code formatting. Run `npm run format` before committing.

## Deployment

The site is deployed to GitHub Pages. To deploy:

1. Run preflight checks: `npm run preflight`
2. Build production: `npm run build`
3. Deploy dist folder to GitHub Pages

## Contact

**Bill Layne Insurance Agency**  
Phone: (336) 835-1993  
Website: [billlayneinsurance.com](https://www.billlayneinsurance.com)

## License

© 2025 Bill Layne Insurance Agency. All rights reserved.