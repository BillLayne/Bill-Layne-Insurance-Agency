#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Image URLs from GitHub to download
const imageUrls = [
    {
        url: 'https://github.com/BillLayne/bill-layne-images/blob/main/logos/hero-desktop-v5.jpg?raw=true',
        filename: 'hero-desktop-v5.jpg',
        folder: 'images/optimized'
    },
    {
        url: 'https://github.com/BillLayne/bill-layne-images/blob/main/logos/hero-mobile.jpg?raw=true',
        filename: 'hero-mobile.jpg',
        folder: 'images/optimized'
    },
    {
        url: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/main/logos/Nationwide%20Logo%20(1).webp',
        filename: 'nationwide-logo.webp',
        folder: 'images/carriers'
    },
    {
        url: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/main/logos/Progressive%20Logo.webp',
        filename: 'progressive-logo.webp',
        folder: 'images/carriers'
    },
    {
        url: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/main/logos/National%20General%20Insurance%20Logo.webp',
        filename: 'national-general-logo.webp',
        folder: 'images/carriers'
    },
    {
        url: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/main/logos/Travelers%20Logo.webp',
        filename: 'travelers-logo.webp',
        folder: 'images/carriers'
    },
    {
        url: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/main/logos/Alamance%20Logo.webp',
        filename: 'alamance-logo.webp',
        folder: 'images/carriers'
    },
    {
        url: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/main/logos/NC%20Grange%20Logo.webp',
        filename: 'nc-grange-logo.webp',
        folder: 'images/carriers'
    },
    {
        url: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/main/logos/Foremost.webp',
        filename: 'foremost-logo.webp',
        folder: 'images/carriers'
    },
    {
        url: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/main/logos/Hagerty.webp',
        filename: 'hagerty-logo.webp',
        folder: 'images/carriers'
    },
    {
        url: 'https://raw.githubusercontent.com/BillLayne/bill-layne-images/a437c280622aead08e47badac0dab0052e4ed63d/logos/Dairyland%20Logo%20Best.webp',
        filename: 'dairyland-logo.webp',
        folder: 'images/carriers'
    },
    {
        url: 'https://github.com/BillLayne/bill-layne-images/blob/main/logos/Auto%20Insurance.webp?raw=true',
        filename: 'auto-insurance-icon.webp',
        folder: 'images/services'
    },
    {
        url: 'https://github.com/BillLayne/bill-layne-images/blob/main/logos/Home%20Insurance.webp?raw=true',
        filename: 'home-insurance-icon.webp',
        folder: 'images/services'
    },
    {
        url: 'https://github.com/BillLayne/bill-layne-images/blob/main/logos/Business%20Insurance.webp?raw=true',
        filename: 'business-insurance-icon.webp',
        folder: 'images/services'
    },
    {
        url: 'https://github.com/BillLayne/bill-layne-images/blob/main/logos/specialty%20insurance.webp?raw=true',
        filename: 'specialty-insurance-icon.webp',
        folder: 'images/services'
    }
];

// Create directories if they don't exist
function ensureDirectoryExists(dirPath) {
    const fullPath = path.join(projectRoot, dirPath);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created directory: ${dirPath}`);
    }
}

// Download image from URL
function downloadImage(imageInfo) {
    return new Promise((resolve, reject) => {
        const { url, filename, folder } = imageInfo;
        const fullPath = path.join(projectRoot, folder, filename);
        
        // Skip if file already exists
        if (fs.existsSync(fullPath)) {
            console.log(`⏭️  Skipping ${filename} (already exists)`);
            resolve();
            return;
        }

        const file = fs.createWriteStream(fullPath);
        const protocol = url.startsWith('https') ? https : http;

        console.log(`⬇️  Downloading ${filename}...`);
        
        const request = protocol.get(url, (response) => {
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                const redirectUrl = response.headers.location;
                console.log(`↪️  Following redirect for ${filename}`);
                downloadImage({ url: redirectUrl, filename, folder })
                    .then(resolve)
                    .catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                console.log(`✅ Downloaded ${filename}`);
                resolve();
            });
        });

        request.on('error', (err) => {
            fs.unlink(fullPath, () => {}); // Delete the file on error
            reject(err);
        });

        file.on('error', (err) => {
            fs.unlink(fullPath, () => {}); // Delete the file on error
            reject(err);
        });
    });
}

// Main function
async function main() {
    console.log('🚀 Starting image optimization process...\n');

    // Create necessary directories
    const directories = [...new Set(imageUrls.map(img => img.folder))];
    directories.forEach(ensureDirectoryExists);

    // Download all images
    console.log('\n📥 Downloading images from GitHub...\n');
    
    for (const imageInfo of imageUrls) {
        try {
            await downloadImage(imageInfo);
        } catch (error) {
            console.error(`❌ Error downloading ${imageInfo.filename}:`, error.message);
        }
    }

    console.log('\n✨ Image download complete!');
    
    // Generate report
    console.log('\n📊 Image Optimization Report:');
    console.log('================================');
    
    let totalSize = 0;
    let fileCount = 0;
    
    directories.forEach(dir => {
        const dirPath = path.join(projectRoot, dir);
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                if (stats.isFile()) {
                    totalSize += stats.size;
                    fileCount++;
                    console.log(`  ${dir}/${file}: ${(stats.size / 1024).toFixed(2)} KB`);
                }
            });
        }
    });
    
    console.log('================================');
    console.log(`Total files: ${fileCount}`);
    console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n📝 Next Steps:');
    console.log('1. Install sharp for advanced image optimization: npm install sharp');
    console.log('2. Run image compression script to create WebP versions');
    console.log('3. Update HTML files to use local optimized images');
    console.log('4. Test load times with local images');
}

// Run the script
main().catch(console.error);