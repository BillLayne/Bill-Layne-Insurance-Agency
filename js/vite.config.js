import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'path';

export default defineConfig({
  base: '/',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        auto: path.resolve(__dirname, 'auto-insurance.html'),
        'auto-quote': path.resolve(__dirname, 'auto-quote.html'),
        'contact': path.resolve(__dirname, 'contact-us.html'),
        'areas': path.resolve(__dirname, 'areas-we-serve.html'),
        'auto-checkup': path.resolve(__dirname, 'auto-coverage-checkup.html'),
        'home-evaluator': path.resolve(__dirname, 'home-insurance-evaluator.html'),
        'umbrella-calc': path.resolve(__dirname, 'umbrella-policy-calculator.html'),
        'quiz': path.resolve(__dirname, 'insurance-quiz.html'),
        'blog': path.resolve(__dirname, 'blog.html'),
        '404': path.resolve(__dirname, '404.html')
      },
      output: {
        manualChunks: {
          'vendor': ['@fortawesome/fontawesome-free'],
          'utils': ['./app.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  
  server: {
    port: 3000,
    open: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },
  
  preview: {
    port: 4173,
    open: true
  },
  
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Bill Layne Insurance Agency',
        short_name: 'Bill Layne Insurance',
        description: 'Professional insurance services in Elkin, NC',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      }
    }),
    
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz'
    }),
    
    createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true
      }
    })
  ],
  
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    }
  },
  
  optimizeDeps: {
    include: ['@fortawesome/fontawesome-free']
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@images': path.resolve(__dirname, './images'),
      '@js': path.resolve(__dirname, './js'),
      '@css': path.resolve(__dirname, './css'),
      '@components': path.resolve(__dirname, './components')
    }
  }
});