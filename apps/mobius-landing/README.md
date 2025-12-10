# 🌀 Mobius Systems Landing Page

**Integrity Before Intelligence**

A beautiful, responsive landing page for Mobius Systems — a civic AI substrate that embeds integrity, reflection, and consensus into intelligent systems.

## 🚀 Quick Start

### Development

```bash
# From the workspace root
pnpm install
pnpm --filter mobius-landing dev
```

The development server starts at [http://localhost:3009](http://localhost:3009)

### Production Build

```bash
pnpm --filter mobius-landing build
pnpm --filter mobius-landing start
```

## 📁 Structure

```
mobius-landing/
├── app/
│   ├── globals.css      # CSS variables & base styles
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Main landing page component
│   ├── page.module.css  # Component-specific styles
│   ├── ops/             # Operations dashboard
│   └── api/             # API routes (MII, revalidate)
├── components/          # Reusable components
├── lib/                 # Utilities
└── public/
    └── index.html       # Static HTML version (zero dependencies)
```

## 🎨 Design Features

- **Dark theme** with subtle gradient backgrounds
- **Mobile-first** responsive design
- **System fonts** for fast loading (no external font requests)
- **CSS custom properties** for easy theming
- **Zero JavaScript runtime dependencies** on the main page

## 🚢 Deployment Options

### Option 1: Vercel (Recommended)

The app is pre-configured for Vercel deployment:

```bash
# From the mobius-landing directory
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Option 2: Static Export

For static hosting (GitHub Pages, Netlify, etc.):

```bash
pnpm --filter mobius-landing build
# Output in .next/static or use next export
```

### Option 3: Pure HTML (public/index.html)

For the simplest deployment, use the static `public/index.html`:

1. **GitHub Pages:**
   ```bash
   # Copy index.html to gh-pages branch
   git checkout -b gh-pages
   cp public/index.html .
   git add index.html
   git commit -m "Deploy landing page"
   git push origin gh-pages
   ```

2. **Netlify Drop:**
   - Go to https://app.netlify.com/drop
   - Drag `public/index.html` onto the page
   - Done!

3. **Cloudflare Pages:**
   - Upload directly or connect GitHub repo
   - Set output directory to `public`

## 🔗 Links to Update

Before deploying, update these placeholder links in `page.tsx`:

| Link | Current Value | Update To |
|------|---------------|-----------|
| Book PDF | GitHub blob URL | Your hosted PDF URL |
| KTT Paper | GitHub blob URL | arXiv URL when published |
| Contact | michael@mobiussystems.org | Your contact email |

## 📊 Sections Overview

1. **Hero** — Headline, CTAs, and integrity state demo card
2. **Problem** — Framing the optimization drift challenge
3. **Definition** — What Mobius is (substrate, not app)
4. **Three Pillars** — Integrity, Reflection, Consensus
5. **Audience** — Who it's for (researchers, foundations, builders)
6. **Artifacts** — What exists today (book, paper, code)
7. **CTA** — Invitation to conversation

## 🛠 Technical Details

- **Framework:** Next.js 14.2.5
- **Styling:** CSS Modules + Tailwind CSS
- **Typography:** System fonts
- **Performance:** ~15KB page weight, zero external requests
- **Browser Support:** Chrome, Firefox, Safari, Edge (latest)

## 📈 Future Enhancements

- [ ] Connect live MII metrics via `/api/mii`
- [ ] Add analytics (Plausible recommended)
- [ ] Add Open Graph image
- [ ] Internationalization support

---

*"We heal as we walk." — Mobius Systems*
