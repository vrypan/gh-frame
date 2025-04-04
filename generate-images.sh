#!/bin/bash

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    exit 1
fi

# Check if GITHUB_REPOSITORY is set
if [ -z "$GITHUB_REPOSITORY" ]; then
    echo "Error: GITHUB_REPOSITORY environment variable is not set"
    exit 1
fi

# Get the repository URL
REPO_URL="https://github.com/$GITHUB_REPOSITORY"
echo "Fetching from: $REPO_URL"

# Fetch the HTML and extract og:image URL
OG_IMAGE_URL=$(curl -s "$REPO_URL" | grep -o '<meta property="og:image" content="[^"]*"' | cut -d'"' -f4)

if [ -z "$OG_IMAGE_URL" ]; then
    echo "Error: Could not find og:image URL"
    exit 1
fi

echo "Found og:image URL: $OG_IMAGE_URL"

# Download the OG image
curl -s "$OG_IMAGE_URL" > og-image.orig.png
echo "Downloaded og-image.orig.png"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed. Please install it first."
    exit 1
fi

# Check if input file exists
if [ ! -f "og-image.png" ]; then
    echo "Error: og-image.png not found in current directory"
    exit 1
fi

# Create temporary white background in RGB color space
if ! convert -size 1200x800 xc:white -type TrueColor -colorspace RGB temp_background.png; then
    echo "Error: Failed to create background image"
    exit 1
fi

# Composite the original image onto the white background
if ! convert temp_background.png og-image.png -gravity center -composite -type TrueColor -colorspace RGB og-image.png; then
    echo "Error: Failed to composite images"
    rm temp_background.png
    exit 1
fi

# Clean up temporary file
rm temp_background.png

# Verify the output file exists and has the correct dimensions
if [ ! -f "og-image.png" ]; then
    echo "Error: Output file og-image.png was not created"
    exit 1
fi

dimensions=$(identify -format "%wx%h" og-image.png)
if [ "$dimensions" != "1200x800" ]; then
    echo "Error: Output image dimensions are incorrect: $dimensions (expected 1200x800)"
    exit 1
fi

echo "Successfully converted og-image.png to 1200x800 with white padding"

# Download GitHub logo for splash image
GITHUB_LOGO_URL="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
curl -s "$GITHUB_LOGO_URL" > splash-image.png
echo "Downloaded splash-image.png"
