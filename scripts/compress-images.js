#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Image optimization settings
const optimizationSettings = {
    webp: {
        quality: 85,
        effort: 6
    },
    jpeg: {
        quality: 85,
        progressive: true,
        mozjpeg: true
    },
    png: {
        compressionLevel: 9,
        adaptiveFiltering: true
    }
};

// Process a single image file
async function processImage(inputPath, outputDir) {
    const filename = path.basename(inputPath);
    const ext = path.extname(filename).toLowerCase();
    const nameWithoutExt = path.basename(filename, ext);
    
    console.log(`📸 Processing ${filename}...`);
    
    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        
        // Create WebP version
        const webpOutput = path.join(outputDir, `${nameWithoutExt}.webp`);
        await image
            .webp(optimizationSettings.webp)
            .toFile(webpOutput);
        
        const webpStats = fs.statSync(webpOutput);
        console.log(`  ✅ WebP created: ${(webpStats.size / 1024).toFixed(2)} KB`);
        
        // Create optimized original format
        if (ext === '.jpg' || ext === '.jpeg') {
            const jpegOutput = path.join(outputDir, `${nameWithoutExt}-optimized.jpg`);
            await sharp(inputPath)
                .jpeg(optimizationSettings.jpeg)
                .toFile(jpegOutput);
            
            const jpegStats = fs.statSync(jpegOutput);
            console.log(`  ✅ JPEG optimized: ${(jpegStats.size / 1024).toFixed(2)} KB`);
        } else if (ext === '.png') {
            const pngOutput = path.join(outputDir, `${nameWithoutExt}-optimized.png`);
            await sharp(inputPath)
                .png(optimizationSettings.png)
                .toFile(pngOutput);
            
            const pngStats = fs.statSync(pngOutput);
            console.log(`  ✅ PNG optimized: ${(pngStats.size / 1024).toFixed(2)} KB`);
        }
        
        // Create responsive sizes for hero images
        if (filename.includes('hero')) {
            const sizes = [
                { width: 640, suffix: 'sm' },
                { width: 1024, suffix: 'md' },
                { width: 1920, suffix: 'lg' },
                { width: 2560, suffix: 'xl' }
            ];
            
            for (const size of sizes) {
                const responsiveOutput = path.join(outputDir, `${nameWithoutExt}-${size.suffix}.webp`);
                await sharp(inputPath)
                    .resize(size.width, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .webp(optimizationSettings.webp)
                    .toFile(responsiveOutput);
                
                const responsiveStats = fs.statSync(responsiveOutput);
                console.log(`  ✅ ${size.suffix.toUpperCase()} (${size.width}px): ${(responsiveStats.size / 1024).toFixed(2)} KB`);
            }
        }
        
        // Return optimization results
        const originalStats = fs.statSync(inputPath);
        const savings = ((originalStats.size - webpStats.size) / originalStats.size * 100).toFixed(1);
        
        return {
            filename,
            original: originalStats.size,
            optimized: webpStats.size,
            savings: `${savings}%`,
            dimensions: `${metadata.width}x${metadata.height}`
        };
        
    } catch (error) {
        console.error(`  ❌ Error processing ${filename}:`, error.message);
        return null;
    }
}

// Process all images in a directory
async function processDirectory(inputDir, outputDir) {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const files = fs.readdirSync(inputDir);
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });
    
    const results = [];
    
    for (const file of imageFiles) {
        const inputPath = path.join(inputDir, file);
        const stats = fs.statSync(inputPath);
        
        if (stats.isFile()) {
            const result = await processImage(inputPath, outputDir);
            if (result) {
                results.push(result);
            }
        }
    }
    
    return results;
}

// Main function
async function main() {
    console.log('🚀 Starting image compression...\n');
    
    const directories = [
        { input: 'images', output: 'dist/images' },
        { input: 'images/carriers', output: 'dist/images/carriers' },
        { input: 'images/services', output: 'dist/images/services' },
        { input: 'carriers', output: 'dist/carriers' },
        { input: 'Logos', output: 'dist/logos' }
    ];
    
    let allResults = [];
    
    for (const dir of directories) {
        const inputPath = path.join(projectRoot, dir.input);
        const outputPath = path.join(projectRoot, dir.output);
        
        if (fs.existsSync(inputPath)) {
            console.log(`\n📁 Processing ${dir.input}...`);
            const results = await processDirectory(inputPath, outputPath);
            allResults = allResults.concat(results);
        }
    }
    
    // Generate report
    console.log('\n\n📊 Optimization Report');
    console.log('=' .repeat(60));
    
    let totalOriginal = 0;
    let totalOptimized = 0;
    
    allResults.forEach(result => {
        totalOriginal += result.original;
        totalOptimized += result.optimized;
        console.log(`${result.filename.padEnd(30)} ${result.dimensions.padEnd(12)} ${result.savings.padStart(6)}`);
    });
    
    console.log('=' .repeat(60));
    const totalSavings = ((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1);
    console.log(`Total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB → ${(totalOptimized / 1024 / 1024).toFixed(2)} MB (${totalSavings}% saved)`);
    
    console.log('\n✨ Image optimization complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Update HTML to use optimized images from dist/ folder');
    console.log('2. Implement picture element for WebP with fallbacks');
    console.log('3. Add lazy loading for below-fold images');
    console.log('4. Consider using a CDN for production');
    
    // Create image manifest
    const manifest = {
        generated: new Date().toISOString(),
        images: allResults,
        settings: optimizationSettings,
        totalSavings: totalSavings + '%'
    };
    
    fs.writeFileSync(
        path.join(projectRoot, 'dist', 'image-manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
    
    console.log('\n📄 Image manifest created at dist/image-manifest.json');
}

// Run the script
main().catch(console.error);