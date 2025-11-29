# Kaizen-OS MkDocs Setup Guide

This guide explains how to set up and use MkDocs with the Kaizen-OS branding.

## Quick Start

### Prerequisites

- Python 3.11+
- pip

### Installation

```bash
# Install dependencies
pip install -r docs/requirements.txt
```

### Local Development

```bash
# Serve documentation locally
mkdocs serve

# Build documentation
mkdocs build
```

The site will be available at `http://127.0.0.1:8000`

### Production Build

```bash
# Build for production
mkdocs build --strict

# Output will be in the `site/` directory
```

## Project Structure

```
docs/
├── assets/
│   ├── css/
│   │   └── kaizen-theme.css      # Custom Kaizen styling
│   ├── js/
│   │   └── kaizen-enhancements.js # Interactive enhancements
│   └── logo/
│       ├── kaizen-logo.svg       # Main logo
│       └── kaizen-favicon.svg    # Favicon
├── index.md                       # Homepage
├── requirements.txt               # Python dependencies
└── [other documentation files]

mkdocs.yml                          # MkDocs configuration
```

## Configuration

The `mkdocs.yml` file contains:

- **Theme**: Material for MkDocs with Kaizen color scheme
- **Navigation**: Complete site structure
- **Extensions**: Markdown extensions for enhanced features
- **Plugins**: Search, git revision dates, minification

## Customization

### Colors

Edit `docs/assets/css/kaizen-theme.css` to modify colors. The color system is defined in CSS variables:

```css
:root {
  --kaizen-deep-teal: #2C4F5E;
  --kaizen-gold: #FFD700;
  --kaizen-cream: #F5E6D3;
  /* ... */
}
```

### Logo

Replace `docs/assets/logo/kaizen-logo.svg` with your custom logo. Update paths in `mkdocs.yml` if needed.

### Navigation

Edit the `nav:` section in `mkdocs.yml` to modify the site structure.

## GitHub Pages Deployment

The site automatically deploys to GitHub Pages via GitHub Actions when:

- Changes are pushed to `main` branch
- Files in `docs/` directory are modified
- `mkdocs.yml` is updated

### Manual Deployment

```bash
# Build the site
mkdocs build

# Deploy to GitHub Pages (requires gh-pages branch)
mkdocs gh-deploy
```

## Features

### Search
Full-text search powered by Material for MkDocs.

### Dark Mode
Default dark mode with Kaizen Deep Teal theme. Light mode toggle available.

### Code Highlighting
Syntax highlighting for code blocks with Kaizen-themed styling.

### Admonitions
Custom-styled admonitions (notes, tips, warnings) with Kaizen colors.

### Git Integration
Automatic "last updated" dates from git history.

### Responsive Design
Mobile-friendly responsive layout.

## Troubleshooting

### Build Errors

```bash
# Check for broken links
mkdocs build --strict

# Validate navigation
mkdocs build --dirty
```

### Missing Dependencies

```bash
# Reinstall dependencies
pip install -r docs/requirements.txt --upgrade
```

### Theme Issues

Clear browser cache and rebuild:

```bash
mkdocs build --clean
mkdocs serve
```

## Resources

- [MkDocs Documentation](https://www.mkdocs.org/)
- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
- [Kaizen Visual Design System](design/theorem_visual_system.yaml)

