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
      - uses: vrypan/gh-frame@v1.0.1
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
        uses: vrypan/gh-frame@v1.0.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          cname: 'your-custom-domain.com'  # Optional: Add custom domain
```

### Custom Domain (Optional)

To use a custom domain, just add the `cname` parameter:

```yaml
      - uses: vrypan/gh-frame@v1.0.1
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

## How it Works

1. When you push changes, the action automatically:
   - Converts your README to a Farcaster-friendly HTML page
   - Adds necessary frame meta tags and handlers
   - Creates/updates the gh-frame branch
   - Configures GitHub Pages to serve from this branch
   - Sets up all necessary permissions and settings

2. Your page is immediately available at your GitHub Pages URL, ready to be shared on Farcaster

## Farcaster Frame Support

The generated page includes all necessary meta tags for Farcaster frames, allowing for rich interactions when shared on Farcaster. The page is optimized for both web browsers and Farcaster clients.

## Customization

Want to customize the look? Fork this repository and modify:
- `src/styles.css` for styling
- `src/template.html` for layout and frame configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Last updated

Thu Apr  3 10:44:23 EEST 2025

## Last updated

Updated on: Thu Apr  3 10:51:37 EEST 2025

## Last updated

Updated on: Thu Apr  3 10:53:20 EEST 2025

## Last updated

Updated on: Thu Apr  3 11:26:49 EEST 2025
