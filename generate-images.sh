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

# Resisze image
if ! convert og-image.orig.png -background white -gravity center -extent 1200x800 og-image.png; then
    echo "Error: Failed to composite images"
    exit 1
fi
echo "Successfully converted og-image.png to 1200x800 with white padding"

# Download GitHub logo for splash image
GITHUB_LOGO_URL="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
curl -s "$GITHUB_LOGO_URL" > splash-image.png
echo "Downloaded splash-image.png"
