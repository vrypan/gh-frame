const fs = require('fs');
const path = require('path');
const { generateOGImage, generateSplashImage } = require('./src/image-generator');

async function run() {
    try {
        const testData = {
            title: 'gh-frame',
            description: 'Create a Farcaster-friendly page for your GitHub repository',
            username: '@vrypan',
            avatarUrl: 'https://github.com/vrypan.png'
        };

        const outputDir = path.join(__dirname, 'test-output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        console.log('Generating images...');
        const [ogImageBuffer, splashImageBuffer] = await Promise.all([
            generateOGImage(testData),
            generateSplashImage(testData)
        ]);

        fs.writeFileSync(path.join(outputDir, 'og-image.png'), ogImageBuffer);
        fs.writeFileSync(path.join(outputDir, 'splash-image.png'), splashImageBuffer);
        console.log('Images generated in test-output directory!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run(); 