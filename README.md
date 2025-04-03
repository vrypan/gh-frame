# README to Static Page GitHub Action

This GitHub Action automatically builds a static page from your repository's README.md file and updates a `gh-frame` branch. The generated page can be served using GitHub Pages with an optional custom domain.


## Features

- Automatically converts README.md to a static HTML page
- Updates a `gh-frame` branch with the generated content
- Supports custom domain configuration via CNAME
- Clean, responsive design
- Automatic updates when README.md changes

## Usage

### Basic Setup

1. Create a workflow file (e.g., `.github/workflows/build.yml`) in your repository:

```yaml
name: Build Static Page

on:
  push:
    branches:
      - main
    paths:
      - 'README.md'

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Build Static Page
        uses: your-username/readme-to-static-page@v1
```

### With Custom Domain

To use a custom domain, add the `cname` input:

```yaml
- name: Build Static Page
  uses: your-username/readme-to-static-page@v1
  with:
    cname: 'docs.yourdomain.com'
```

## Configuration

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `cname` | Custom domain for GitHub Pages | No | '' |

## GitHub Pages Setup

1. Go to your repository's Settings
2. Navigate to Pages
3. Set the source to the `gh-frame` branch
4. If using a custom domain:
   - Enter your domain in the Custom domain field
   - Configure your DNS settings to point to GitHub Pages
   - Wait for DNS propagation

## Customization

The generated page uses a clean, responsive design. You can customize the appearance by:

1. Forking this repository
2. Modifying the `src/styles.css` file
3. Building and publishing your own version of the action

## Development

### Building

```bash
npm install
npm run build
```

### Testing

```bash
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 

## Last updated

Thu Apr  3 10:44:23 EEST 2025

## Last updated

Updated on: Thu Apr  3 10:51:37 EEST 2025

## Last updated

Updated on: Thu Apr  3 10:53:20 EEST 2025
