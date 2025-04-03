const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

async function generateImage(template, data, width, height, outputPath) {
    const templatePath = path.join(__dirname, 'src', template);
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(templateContent);
    const html = compiledTemplate(data);

    const browser = await puppeteer.launch({
        headless: 'new'
    });
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setContent(html);
    await page.screenshot({
        path: outputPath,
        type: 'png'
    });
    await browser.close();
}

async function run() {
    // Test data
    const testData = {
        title: 'gh-frame',
        description: 'Create a Farcaster-friendly page for your GitHub repository',
        username: '@vrypan',
        avatarUrl: 'https://github.com/vrypan.png'
    };

    // Create test-output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'test-output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Generate OG image
    await generateImage(
        'og-template.html',
        testData,
        1200,
        800,
        path.join(outputDir, 'og-image.png')
    );

    // Generate splash image
    await generateImage(
        'splash-template.html',
        { 
            title: testData.title,
            avatarUrl: testData.avatarUrl
        },
        200,
        200,
        path.join(outputDir, 'splash-image.png')
    );

    console.log('Images generated in test-output directory!');
}

run().catch(console.error); 