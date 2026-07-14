# DAHI Admin Dashboard Setup

## Authentication
- Create Supabase Auth users for admin accounts.
- Use the demo credentials in development mode when Supabase credentials are not configured:
  - Email: admin@dahi.org
  - Password: Dahi2024!

## Roles
- Super Admin: full access
- Administrator: full content management
- Content Editor: manage content but not users or settings

## Dashboard structure
- /admin/login: sign-in and password reset
- /admin: dashboard overview
- /admin/programs: manage programs
- /admin/events: manage events
- /admin/resources: manage resources
- /admin/blog: manage blog content
- /admin/team: manage team members
- /admin/testimonials: manage testimonials
- /admin/newsletter: manage subscribers
- /admin/volunteers: review volunteer applications
- /admin/messages: review contact messages
- /admin/settings: manage site settings
- /admin/analytics: analytics overview

## Deployment
1. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.
2. Enable Supabase Auth and configure redirect URLs.
3. Deploy the Vite app and protect /admin routes with your preferred hosting rules.

## Future enhancements
- Connect Google Analytics or PostHog
- Add rich text editing with TipTap or Quill
- Add Supabase Storage uploads to the media library
- Implement full CRUD backed by Supabase tables
