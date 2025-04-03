const axios = require('axios');
const svg2img = require('svg2img');
const { promisify } = require('util');

const svg2imgAsync = promisify(svg2img);

async function fetchBase64Image(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data).toString('base64');
}

async function generateSVG(data, isOG = true) {
    const avatarBase64 = await fetchBase64Image(data.avatarUrl);
    
    if (isOG) {
        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Background -->
    <rect width="1200" height="800" fill="white"/>
    
    <!-- Border -->
    <rect x="20" y="20" width="1160" height="760" 
          fill="none" stroke="#ffe2ec" stroke-width="40"/>
    
    <!-- Avatar -->
    <defs>
        <clipPath id="avatarClip">
            <circle cx="100" cy="100" r="40"/>
        </clipPath>
    </defs>
    <image x="60" y="60" width="80" height="80"
           clip-path="url(#avatarClip)"
           xlink:href="data:image/png;base64,${avatarBase64}"/>
    
    <!-- Title -->
    <text x="164" y="100" 
          font-family="Arial, sans-serif" 
          font-size="64px" 
          font-weight="bold" 
          fill="#24292f">${escapeXml(data.title)}</text>
    
    <!-- Description -->
    <text x="60" y="200" 
          font-family="Arial, sans-serif" 
          font-size="32px" 
          fill="#57606a">${escapeXml(data.description || '')}</text>
    
    <!-- Username -->
    <text x="60" y="250" 
          font-family="Arial, sans-serif" 
          font-size="32px" 
          fill="#57606a">${escapeXml(data.username)}</text>
</svg>`;
    } else {
        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Background -->
    <rect width="200" height="200" fill="white"/>
    
    <!-- Border -->
    <rect x="5" y="5" width="190" height="190" 
          fill="none" stroke="#ffe2ec" stroke-width="10"/>
    
    <!-- Avatar -->
    <defs>
        <clipPath id="avatarClip">
            <circle cx="100" cy="70" r="30"/>
        </clipPath>
    </defs>
    <image x="70" y="40" width="60" height="60"
           clip-path="url(#avatarClip)"
           xlink:href="data:image/png;base64,${avatarBase64}"/>
    
    <!-- Title -->
    <text x="100" y="140" 
          font-family="Arial, sans-serif" 
          font-size="20px" 
          font-weight="bold"
          text-anchor="middle"
          fill="#24292f">${escapeXml(data.title)}</text>
</svg>`;
    }
}

async function generateOGImage(data) {
    const svg = await generateSVG(data, true);
    return svg2imgAsync(svg, {
        format: 'png',
        width: 1200,
        height: 800
    });
}

async function generateSplashImage(data) {
    const svg = await generateSVG(data, false);
    return svg2imgAsync(svg, {
        format: 'png',
        width: 200,
        height: 200
    });
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

module.exports = {
    generateOGImage,
    generateSplashImage,
    generateSVG
}; 