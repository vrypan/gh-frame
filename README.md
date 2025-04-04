# gh-frame

A GitHub Action that creates a Farcaster-friendly static page from README.md.

## Features

- Converts your README.md to a beautiful static page
- Creates a Farcaster frame mini-app for your repository
- Supports custom domain names
- Mobile-friendly design
- Dark mode support

## Usage

1. Create a new workflow file in your repository at `.github/workflows/gh-frame.yml`:

```yaml
name: Build Farcaster-friendly Repo Page
on:
  push:
    branches:
      - main  # or 'master' or whatever your main branch is
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pages: write
      id-token: write
    on:
      push:
        branches:
          - main
        paths:
          - "README.md"
      pull_request:
        branches:
          - main
        paths:
          - "README.md"
      workflow_dispatch:
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Generate Farcaster-friendly Page
        uses: vrypan/gh-frame@v2.0.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}  # Default GitHub token
          style: light  #  light/dark/custom
          # Optionally set cname or branch_name if you want:
          # cname: yourdomain.com
          # branch_name: gh-frame
```

2. Go to your repository's Settings > Pages and:
   - Select the `gh-frame` branch as the source
   - Click Save

Your page will be available at:
- `https://<username>.github.io/<repository>`
- Or at your custom domain if configured

## Customization

### Images

The action automatically fetches the social sharing image generated by GitHub
for your repo. It will add some white padding to make it look nice as a frame
preview (preview image ideal size is 1200x800, OpenGraph GitHub image is 1200x600).

### Styling
You can set the action parameter `style` to `light`, `dark`, or `custom`.
If you set it to custom, this action will respect `styles.css` found in your
`gh-frame` repo, so you can use your own.


## License

MIT
