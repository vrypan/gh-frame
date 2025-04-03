const axios = require('axios');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

async function fetchBase64Image(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data).toString('base64');
}

async function generateSVG(data, isOG = true) {
    const avatarBase64 = await fetchBase64Image(data.avatarUrl);
    
    if (isOG) {
        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="1200" height="800" fill="white"/>
    <rect x="20" y="20" width="1160" height="760" 
          fill="none" stroke="#ffe2ec" stroke-width="40"/>
    <defs>
        <clipPath id="avatarClip">
            <circle cx="100" cy="100" r="40"/>
        </clipPath>
    </defs>
    <image x="60" y="60" width="80" height="80"
           clip-path="url(#avatarClip)"
           xlink:href="data:image/png;base64,${avatarBase64}"/>
    <text x="164" y="100" 
          font-family="Arial, sans-serif" 
          font-size="64px" 
          font-weight="bold" 
          fill="#24292f">${escapeXml(data.title)}</text>
    <text x="60" y="200" 
          font-family="Arial, sans-serif" 
          font-size="32px" 
          fill="#57606a">${escapeXml(data.description || '')}</text>
    <text x="60" y="250" 
          font-family="Arial, sans-serif" 
          font-size="32px" 
          fill="#57606a">${escapeXml(data.username)}</text>
</svg>`;
    } else {
        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="200" height="200" fill="white"/>
    <rect x="5" y="5" width="190" height="190" 
          fill="none" stroke="#ffe2ec" stroke-width="10"/>
    <defs>
        <clipPath id="avatarClip">
            <circle cx="100" cy="70" r="30"/>
        </clipPath>
    </defs>
    <image x="70" y="40" width="60" height="60"
           clip-path="url(#avatarClip)"
           xlink:href="data:image/png;base64,${avatarBase64}"/>
    <text x="100" y="140" 
          font-family="Arial, sans-serif" 
          font-size="20px" 
          font-weight="bold"
          text-anchor="middle"
          fill="#24292f">${escapeXml(data.title)}</text>
</svg>`;
    }
}

async function svgToPng(svg) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'svg-'));
    const svgPath = path.join(tempDir, 'input.svg');
    const pngPath = path.join(tempDir, 'output.png');

    try {
        await fs.writeFile(svgPath, svg);
        await execFileAsync('convert', [
            svgPath,
            '-background', 'white',
            '-format', 'png',
            pngPath
        ]);
        const pngBuffer = await fs.readFile(pngPath);
        await fs.rm(tempDir, { recursive: true });
        return pngBuffer;
    } catch (error) {
        await fs.rm(tempDir, { recursive: true }).catch(() => {});
        throw error;
    }
}

async function generateOGImage(data) {
    const svg = await generateSVG(data, true);
    return svgToPng(svg);
}

async function generateSplashImage(data) {
    const svg = await generateSVG(data, false);
    return svgToPng(svg);
}

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
    generateSplashImage
}; 