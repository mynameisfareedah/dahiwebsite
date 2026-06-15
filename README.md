<<<<<<< HEAD
# DAHI — Doc Adi Health Initiative

Static landing page for DAHI built for Netlify.

Setup

1. Install: None required (static site). If using Netlify functions, ensure `RESEND_API_KEY` and optionally `RESEND_FROM` are set in Netlify environment variables.

Environment variables


Deploy

1. Push to a Git repo and connect to Netlify.
2. Set build settings (none needed for static site). Netlify will publish root and use `functions/` for serverless functions.

 Netlify function

 Endpoint: `/.netlify/functions/send-welcome-email` — accepts POST JSON { firstName, email } and sends a welcome email using Resend.

 Notes

- Navigation is sticky and mobile-first with smooth scrolling.
- Testimonials were removed to respect consent.
- Add `RESEND_API_KEY` in Netlify site settings before deploying functions.

 Local testing

 You can serve the static files locally with a simple server, for example using Python:

 ```bash
 python -m http.server 8000
 ```

=======
# DAHI — Doc Adi Health Initiative

Static landing page for DAHI built for Netlify.

Setup

1. Install: None required (static site). If using Netlify functions, ensure `RESEND_API_KEY` and optionally `RESEND_FROM` are set in Netlify environment variables.

Environment variables


Deploy

1. Push to a Git repo and connect to Netlify.
2. Set build settings (none needed for static site). Netlify will publish root and use `functions/` for serverless functions.

 Netlify function

 Endpoint: `/.netlify/functions/send-welcome-email` — accepts POST JSON { firstName, email } and sends a welcome email using Resend.

 Notes

- Navigation is sticky and mobile-first with smooth scrolling.
- Testimonials were removed to respect consent.
- Add `RESEND_API_KEY` in Netlify site settings before deploying functions.

 Local testing

 You can serve the static files locally with a simple server, for example using Python:

 ```bash
 python -m http.server 8000
 ```

>>>>>>> fb6e75e28af5ae3749cffa9d8a0f147d26a0b8bb
