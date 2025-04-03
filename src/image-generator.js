const sharp = require('sharp');
const axios = require('axios');

async function fetchImageBuffer(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
}

async function generateOGImage(data) {
    const width = 1200;
    const height = 800;
    
    // Create a white background with pink border
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        <rect x="20" y="20" width="${width-40}" height="${height-40}" 
              fill="none" stroke="#ffe2ec" stroke-width="40"/>
        <text x="164" y="100" font-family="Arial" font-size="64px" font-weight="bold" fill="#24292f">${data.title}</text>
        <text x="60" y="200" font-family="Arial" font-size="32px" fill="#57606a">${data.description || ''}</text>
        <text x="60" y="250" font-family="Arial" font-size="32px" fill="#57606a">${data.username}</text>
    </svg>`;

    // Create the base image
    const baseImage = Buffer.from(svg);

    // Fetch and process the avatar
    const avatarBuffer = await fetchImageBuffer(data.avatarUrl);
    const avatar = await sharp(avatarBuffer)
        .resize(80, 80)
        .toBuffer();

    // Compose the final image
    return sharp(baseImage)
        .composite([
            {
                input: avatar,
                top: 60,
                left: 60
            }
        ])
        .toBuffer();
}

async function generateSplashImage(data) {
    const width = 200;
    const height = 200;
    
    // Create a white background with pink border
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        <rect x="5" y="5" width="${width-10}" height="${height-10}" 
              fill="none" stroke="#ffe2ec" stroke-width="10"/>
        <text x="${width/2}" y="140" 
              font-family="Arial" font-size="20px" font-weight="bold" 
              text-anchor="middle" fill="#24292f">${data.title}</text>
    </svg>`;

    // Create the base image
    const baseImage = Buffer.from(svg);

    // Fetch and process the avatar
    const avatarBuffer = await fetchImageBuffer(data.avatarUrl);
    const avatar = await sharp(avatarBuffer)
        .resize(60, 60)
        .toBuffer();

    // Compose the final image
    return sharp(baseImage)
        .composite([
            {
                input: avatar,
                top: 40,
                left: 70
            }
        ])
        .toBuffer();
}

module.exports = {
    generateOGImage,
    generateSplashImage
}; 