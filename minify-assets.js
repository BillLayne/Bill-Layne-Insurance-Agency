// Script to minify CSS and JavaScript files
const fs = require('fs');
const path = require('path');

// Simple CSS minifier
function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        // Remove space around specific characters
        .replace(/\s*([{}:;,])\s*/g, '$1')
        // Remove trailing semicolon before }
        .replace(/;}/g, '}')
        // Remove quotes from URLs when possible
        .replace(/url\(["']?([^"')]+)["']?\)/g, 'url($1)')
        .trim();
}

// Simple JavaScript minifier
function minifyJS(js) {
    // This is a basic minifier - for production use a proper tool like Terser
    return js
        // Remove single-line comments
        .replace(/\/\/.*$/gm, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        // Remove space around operators
        .replace(/\s*([=+\-*/%<>!&|,;:?{}()\[\]])\s*/g, '$1')
        // Remove trailing spaces
        .replace(/\s+$/gm, '')
        .trim();
}

// Example CSS content based on PageSpeed report (8.5 KB style.css)
const exampleCSS = `/* Example minified style.css */
body{margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333}
.container{max-width:1200px;margin:0 auto;padding:0 20px}
.hero{background-color:#f4f4f4;padding:4rem 0;text-align:center}
.hero h1{font-size:2.5rem;margin-bottom:1rem}
.hero p{font-size:1.2rem;margin-bottom:2rem}
.cta-button{display:inline-block;padding:1rem 2rem;background-color:#007bff;color:white;text-decoration:none;border-radius:5px;transition:background-color 0.3s}
.cta-button:hover{background-color:#0056b3}
.logo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:2rem;padding:3rem 0}
.logo-item{display:flex;align-items:center;justify-content:center;height:80px}
.logo-item img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}
@media(max-width:768px){.hero h1{font-size:2rem}.hero p{font-size:1rem}.logo-grid{grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:1rem}}`;

// Example JavaScript content based on PageSpeed report (23.7 KB app.js)
const exampleJS = `/* Example minified app.js */
document.addEventListener('DOMContentLoaded',function(){const nav=document.querySelector('.navbar');const mobileToggle=document.querySelector('.mobile-toggle');const navLinks=document.querySelector('.nav-links');mobileToggle?.addEventListener('click',function(){navLinks.classList.toggle('active');this.classList.toggle('active')});window.addEventListener('scroll',function(){if(window.scrollY>100){nav?.classList.add('scrolled')}else{nav?.classList.remove('scrolled')}});const lazyImages=document.querySelectorAll('img[loading="lazy"]');const imageObserver=new IntersectionObserver((entries,observer)=>{entries.forEach(entry=>{if(entry.isIntersecting){const img=entry.target;img.src=img.dataset.src||img.src;img.classList.add('loaded');observer.unobserve(img)}})});lazyImages.forEach(img=>imageObserver.observe(img))});`;

// Write example minified files
fs.writeFileSync('/tmp/style.min.css', exampleCSS);
fs.writeFileSync('/tmp/app.min.js', exampleJS);

console.log('Minified CSS saved to: /tmp/style.min.css');
console.log('Minified JS saved to: /tmp/app.min.js');
console.log('');
console.log('To minify your actual files:');
console.log('1. Copy this script to your project');
console.log('2. Update the file paths');
console.log('3. Run: node minify-assets.js');

module.exports = { minifyCSS, minifyJS };