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
curl -s "$OG_IMAGE_URL" > og-image.png
echo "Downloaded og-image.png"

# Download GitHub logo for splash image
GITHUB_LOGO_URL="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
curl -s "$GITHUB_LOGO_URL" > splash-image.png
echo "Downloaded splash-image.png"
