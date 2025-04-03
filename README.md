# Farcaster-friendly Repo Page

This GitHub Action automatically converts your repository's README.md into a Farcaster-friendly static website with frame support, hosted on GitHub Pages. It handles all the setup automatically - no manual configuration needed!

## Features

- 🚀 One-click setup: Automatically configures GitHub Pages
- 🖼️ Farcaster Frame support out of the box
- 📱 Responsive design for both web and Farcaster clients
- 🔄 Auto-updates when README changes
- 🔗 Custom domain support
- 🛠️ Zero configuration needed

## Quick Setup

1. Create `.github/workflows/main.yml` with:

```yaml
name: Build Farcaster Page
on: [push, workflow_dispatch]
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: vrypan/gh-frame@v1.0.30
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

2. **Enable GitHub Pages** (one-time setup):
   - Go to your repository's Settings
   - Navigate to Pages (in the left sidebar)
   - Under "Branch", select `gh-frame`
   - Click Save

That's it! Your page will be available at: `https://{username}.github.io/{repository-name}`

## Full Configuration (Optional)

If you want more control, here's the full configuration with all options:

```yaml
name: Build Farcaster Page

on:
  push:
    branches:
      - main
    paths:
      - 'README.md'  # Only trigger on README updates
  workflow_dispatch:  # Allow manual triggers

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - name: Build Farcaster Page
        uses: vrypan/gh-frame@v1.0.30
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          cname: 'your-custom-domain.com'  # Optional: Add custom domain
          branch_name: 'gh-frame'  # Optional: Custom branch name
```

### Custom Domain (Optional)

To use a custom domain, just add the `cname` parameter:

```yaml
      - uses: vrypan/gh-frame@v1.0.30
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          cname: 'your-custom-domain.com'
```

Then configure your DNS settings to point to GitHub Pages.

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `token` | GitHub token for repository access | Yes | N/A |
| `cname` | Custom domain for GitHub Pages | No | '' |
| `branch_name` | Branch name to deploy the static site to | No | 'gh-frame' |

## How it Works

1. When you push changes, the action automatically:
   - Converts your README to a Farcaster-friendly HTML page
   - Generates OG and splash images for frame support
   - Adds necessary frame meta tags and handlers
   - Creates/updates the gh-frame branch
   - Configures GitHub Pages to serve from this branch

## Frame Support

The generated page includes Farcaster Frame support with:
- Automatic OG image generation
- Splash image for frame transitions
- Frame metadata for Farcaster clients
- Click handling for external links

## Requirements

- GitHub repository with README.md
- GitHub Pages enabled
- Repository permissions for the GitHub token

## License

MIT License - feel free to use this action in your projects!
