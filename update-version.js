#!/usr/bin/env node
// Version Updater for Bill Layne Insurance Website
const fs = require('fs');
const path = require('path');

// Generate new version (YYYY.MM.DD format)
function generateVersion() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
}

// Get current version from a file or generate new one
function getCurrentVersion() {
  try {
    const versionFile = path.join(__dirname, '.version');
    if (fs.existsSync(versionFile)) {
      return fs.readFileSync(versionFile, 'utf8').trim();
    }
  } catch (error) {
    console.log('⚠️  No existing version file found');
  }
  return generateVersion();
}

// Update version in files
function updateVersion(newVersion) {
  console.log(`🚀 Updating to version: ${newVersion}`);
  
  // Files to update
  const filesToUpdate = [
    'index.html',
    'contact-us.html',
    'auto-quote.html',
    'blog.html',
    'areas-we-serve.html',
    'sw.js',
    'insurance-quiz.html',
    'umbrella-policy-calculator.html',
    'enhanced-quote-section.html',
    '404.html',
    'auto-coverage-checkup.html',
    'home-insurance-evaluator.html',
    'auto-insurance.html',
    'insurance-elkin-nc.html',
    'insurance-mount-airy-nc.html'
  ];
  
  let updatedFiles = 0;
  
  filesToUpdate.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        
        // Update CSS version references
        const cssRegex = /style\.css\?v=[\d.]+/g;
        if (cssRegex.test(content)) {
          content = content.replace(cssRegex, `style.css?v=${newVersion}`);
          hasChanges = true;
        }
        
        // Update JS version references
        const jsRegex = /app\.js\?v=[\d.]+/g;
        if (jsRegex.test(content)) {
          content = content.replace(jsRegex, `app.js?v=${newVersion}`);
          hasChanges = true;
        }
        
        // Update service worker version references
        const swRegex = /sw\.js\?v=[\d.]+/g;
        if (swRegex.test(content)) {
          content = content.replace(swRegex, `sw.js?v=${newVersion}`);
          hasChanges = true;
        }
        
        // Update specialized CSS files
        const quizCssRegex = /insurance-quiz\.css\?v=[\d.]+/g;
        if (quizCssRegex.test(content)) {
          content = content.replace(quizCssRegex, `insurance-quiz.css?v=${newVersion}`);
          hasChanges = true;
        }
        
        const umbrellaCSsRegex = /umbrella-policy-calculator\.css\?v=[\d.]+/g;
        if (umbrellaCSsRegex.test(content)) {
          content = content.replace(umbrellaCSsRegex, `umbrella-policy-calculator.css?v=${newVersion}`);
          hasChanges = true;
        }
        
        // Update service worker cache name
        const swCacheRegex = /bill-layne-v[\d.]+/g;
        if (swCacheRegex.test(content)) {
          content = content.replace(swCacheRegex, `bill-layne-v${newVersion}`);
          hasChanges = true;
        }
        
        // Update static assets array in service worker
        const assetsRegex = /\/style\.css\?v=[\d.]+/g;
        if (assetsRegex.test(content)) {
          content = content.replace(assetsRegex, `/style.css?v=${newVersion}`);
          hasChanges = true;
        }
        
        const assetsJsRegex = /\/app\.js\?v=[\d.]+/g;
        if (assetsJsRegex.test(content)) {
          content = content.replace(assetsJsRegex, `/app.js?v=${newVersion}`);
          hasChanges = true;
        }
        
        if (hasChanges) {
          fs.writeFileSync(filePath, content);
          console.log(`✅ Updated ${filename}`);
          updatedFiles++;
        } else {
          console.log(`ℹ️  No version references found in ${filename}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${filename}:`, error.message);
      }
    } else {
      console.log(`⚠️  File not found: ${filename}`);
    }
  });
  
  // Save new version to file
  fs.writeFileSync(path.join(__dirname, '.version'), newVersion);
  
  console.log(`\n✨ Version update complete!`);
  console.log(`📊 Updated ${updatedFiles} files`);
  console.log(`🔖 New version: ${newVersion}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Test the changes locally`);
  console.log(`   2. Commit and push to GitHub`);
  console.log(`   3. Deploy to production`);
  console.log(`\n💡 Run 'node update-version.js' before each deployment`);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📚 Bill Layne Insurance Version Updater

Usage:
  node update-version.js           - Generate new version and update files
  node update-version.js --current - Show current version
  node update-version.js --help    - Show this help

This script automatically updates version numbers in HTML and JS files
to enable cache busting while maintaining performance optimization.
    `);
    process.exit(0);
  }
  
  if (args.includes('--current')) {
    console.log(`Current version: ${getCurrentVersion()}`);
    process.exit(0);
  }
  
  const newVersion = generateVersion();
  updateVersion(newVersion);
}

module.exports = { updateVersion, generateVersion, getCurrentVersion };