# DAHI Website

DAHI is a React + Vite website for the Doc Adi Health Initiative. It includes public content pages, responsive layouts, and a demo-ready admin experience while preserving the existing DAHI branding.

## Local development

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open the local Vite URL.

## Environment variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GA_ID=
VITE_CLARITY_ID=
```

## Production build

Run:

```bash
npm run build
```

## Deployment notes

- Netlify SPA redirects are handled by `netlify.toml`.
- PWA support is enabled through `manifest.json` and `public/sw.js`.
- SEO files include `public/robots.txt` and `public/sitemap.xml`.

