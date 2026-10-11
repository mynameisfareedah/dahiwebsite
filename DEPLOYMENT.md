# Deployment Guide

## Build and deploy

1. Install dependencies with `npm install`.
2. Build the production output with `npm run build`.
3. Deploy the generated site to Netlify or your preferred static host.

## Required environment variables

Set these in your hosting environment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GA_ID` (optional)
- `VITE_CLARITY_ID` (optional)
- `EMAILOCTOPUS_API_KEY` (Netlify Function secret; required for newsletter subscriptions)
- `EMAILOCTOPUS_LIST_ID` (Netlify Function setting; required for newsletter subscriptions)

Configure the EmailOctopus list with double opt-in enabled. Do not use `VITE_` prefixes for EmailOctopus credentials; they must remain server-side and must not be exposed to the browser.

## Notes

- The site uses SPA routing and Netlify rewrites in `netlify.toml`.
- The manifest and service worker support installability and offline fallback.
