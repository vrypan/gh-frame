# README to Static Page - Sample Repository

This is a sample repository demonstrating how to use the README to Static Page GitHub Action.

## What This Repository Demonstrates

This repository contains:
1. A sample README.md with various markdown features
2. A GitHub Actions workflow that uses the README to Static Page action
3. Configuration for GitHub Pages with a custom domain

## How to Use This Sample

1. Fork this repository
2. Update the workflow file (`.github/workflows/build.yml`):
   - Replace `your-username/readme-to-static-page@v1` with your action's reference
   - Update the `cname` value with your domain (or remove it if not using a custom domain)
3. Push changes to the main branch
4. The action will automatically:
   - Convert README.md to HTML
   - Create/update the `gh-frame` branch
   - Set up GitHub Pages with your custom domain

## GitHub Pages Setup

1. Go to your repository's Settings
2. Navigate to Pages
3. Set the source to the `gh-frame` branch
4. If using a custom domain:
   - Enter your domain in the Custom domain field
   - Configure your DNS settings
   - Wait for DNS propagation

## Customizing the Sample

Feel free to:
- Modify the README.md content
- Update the styles by forking the main action repository
- Add more features to the generated page

## Support

If you encounter any issues:
1. Check the GitHub Actions logs
2. Review the [main repository's documentation](https://github.com/your-username/readme-to-static-page)
3. Open an issue in the main repository

## Features

- Markdown to HTML conversion
- Code highlighting
- Tables
- Lists
- And more!

## Code Example

Here's a simple JavaScript example:

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
}

greet('World');
```

## Table Example

| Feature | Description |
|---------|-------------|
| Markdown | Converts markdown to HTML |
| Styling | Clean, responsive design |
| Updates | Automatic on README changes |

## Lists

### Ordered List
1. First item
2. Second item
3. Third item

### Unordered List
- Item 1
- Item 2
- Item 3

## Blockquotes

> This is a blockquote
> It can span multiple lines

## Links

- [GitHub](https://github.com)
- [Markdown Guide](https://www.markdownguide.org)

## Images

![GitHub Logo](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)

## Task Lists

- [x] Create README
- [x] Add examples
- [ ] Add more features 