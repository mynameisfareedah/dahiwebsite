# DAHI Website Conversion Audit

## 1. Executive Summary

The current DAHI project is a static single-page landing site built with plain HTML, Tailwind CSS via CDN, custom CSS, and a small JavaScript file for mobile navigation and smooth scrolling. It already contains strong brand messaging, a clear health-education focus, and a polished visual system, but it is not yet structured as a multi-page website. The immediate opportunity is to preserve the current content and branding while planning a scalable conversion to a more modular, component-based website.

## 2. Current Architecture

### Tech Stack
- Static HTML page
- Tailwind CSS loaded via CDN
- Custom CSS in the HTML head and separate stylesheet
- Vanilla JavaScript for mobile menu and anchor navigation
- Netlify-compatible static hosting
- Optional Netlify Function for welcome email

### Project Structure
- Root HTML page: index.html
- JavaScript: scripts/main.js
- Stylesheet: styles/styles.css
- Assets: images and SVGs in the project root and assets/ folder
- Functions: functions/send-welcome-email.js
- PWA metadata: manifest.json

### Current Page Type
- Single-page marketing website / landing page
- No React, Vite, or routing framework currently present

## 3. Strengths

- Clear mission and brand positioning around women’s health education
- Strong content hierarchy and section flow
- Mobile-friendly layout approach using utility classes
- Good use of imagery and section-based storytelling
- Reusable visual patterns such as soft cards and stat cards
- Existing accessibility considerations such as alt text and navigation labels
- Good foundation for future multi-page conversion

## 4. Weaknesses

- The site is still a single long-page experience rather than a structured website
- Content is heavily hardcoded into one HTML file
- No reusable component architecture exists yet
- No page routing or multi-page structure is present
- Some content appears duplicated or mixed across sections
- The project would benefit from clearer separation of data, layout, and presentation
- The current setup is not ideal for scaling into a React/Vite architecture without restructuring

## 5. Components Inventory

### Current UI Blocks
The current implementation is not built with React components, but the following sections function like reusable building blocks:

- Header / Navigation
- Hero section
- About / Mission & Vision card
- Focus Areas cards
- Meet Doc Adi profile section
- Impact stats section
- Events & Activities section
- Resources cards
- Meet the Team cards
- Testimonials cards
- Community CTA section
- Contact cards
- Privacy Policy section
- Footer

### Suggested Component Categorization
- Keep: Hero, Header, Footer, Contact section, Privacy Policy section
- Refactor: About section, Focus Areas, Impact, Events, Resources, Team, Testimonials, Community CTA
- Split into smaller components: Team cards, Resource cards, Contact cards, Event cards
- Merge: Related cards into shared card grids if used repeatedly

## 6. Pages Inventory

### Existing Page
- Home page: index.html

### Current Section-Based Structure
The landing page contains the following major sections:
- Hero
- About
- Our Focus Areas
- Meet Doc Adi
- Our Impact
- Events & Activities
- Resources
- Meet the Team
- Testimonials
- Community CTA
- Contact
- Privacy Policy

## 7. Asset Inventory

### Images
- logo.jpeg
- docadi.jpeg
- community-768.jpg / community-768.webp
- community-1200.jpg / community-1200.webp
- community-480.jpg / community-480.webp
- header-hijabs.jpg
- WEBINARS.jpg
- CONTRACEPTION.jpg
- MENOPAUSE.jpg
- MENSTRUAL HEALTH.jpg
- WOMEN'S HEALTH.jpg
- COMMUNITY DISCUSSION.jpg
- COMMUNITY SUPPORT GROUP.jpg
- Hormones and health illustration.jpg
- founder.svg
- ebook.svg / ebook1.svg / ebook2.svg / ebook3.svg
- various Selar product images

### Icons
- Font Awesome 6.4.0 via CDN

### Fonts
- Inter, Segoe UI, Roboto, Arial, sans-serif

### Media Notes
- Some images appear to be high-resolution and may be larger than necessary for web use
- There are multiple image variants for similar purposes, which could be standardized in a future conversion

## 8. Accessibility Findings

### Strengths
- Many images include alt text
- Navigation uses descriptive labels
- Buttons and links are clearly visible
- Semantic sectioning is used with headings and landmark content

### Issues to Improve
- Some content is still visually heavy and may need stronger heading hierarchy consistency across sections
- Focus states should be explicitly reinforced in future component work
- The current design relies heavily on color and card styling; contrast should be tested carefully in all states
- Anchor navigation should continue to use descriptive section IDs
- Form elements (if introduced in the future) should use explicit labels and error messaging

## 9. SEO Findings

### Strengths
- The page has a title and meta description
- The site includes descriptive headings and relevant page content
- Images have alt attributes

### Issues to Improve
- No Open Graph tags are present
- No Twitter card metadata is present
- No canonical URL is defined
- No structured data is present for organization or article content
- No dedicated sitemap or robots.txt strategy is evident in the current static setup
- A multi-page conversion should include page-specific metadata per route

## 10. Performance Findings

### Strengths
- Images are lazy-loaded where present
- Tailwind is loaded from CDN instead of bundling a large local dependency
- The site is lightweight for a static landing page

### Issues to Improve
- Many large local images may increase initial loading cost
- The page currently loads many asset files and external libraries
- There is no code-splitting because there is no framework-based routing
- Some images may be unnecessarily large for their display size
- Future conversion should consider image optimization and responsive image sets

## 11. Mobile Responsiveness Findings

### Strengths
- The page uses responsive Tailwind classes and a mobile-friendly layout
- The navigation collapses into a mobile menu
- Buttons and cards stack well on smaller screens

### Issues to Improve
- Some sections may become dense on smaller screens and could benefit from tighter spacing or reduced content weight
- The hero section and cards should continue to be tested across phone, tablet, and desktop breakpoints
- Mobile navigation should remain consistent across future pages

## 12. Website Conversion Recommendations

### Recommended Direction
Convert the existing landing page into a professional multi-page website while preserving the current branding and messaging. The safest path is to move the existing content into a structured site with:

- Home page with a summarized version of the main story
- About page with the full mission, vision, founder story, and purpose
- Programs / Focus Areas page for detailed services and educational themes
- Events page for webinars, community events, and engagement opportunities
- Resources page for free and paid guides
- Team page for profiles and leadership
- Contact page for contact channels and community links
- Privacy Policy page as a dedicated legal page

### Recommended Content Migration
- Hero: Keep on Home, possibly reuse as a reusable hero block
- About: Keep a short preview on Home; move full content to About page
- Focus Areas: Keep a preview on Home; expand on Programs page
- Meet Doc Adi: Keep summary on Home; expand on About page
- Impact: Keep on Home as a trust-building section
- Events: Keep a preview on Home; full details on Events page
- Resources: Keep preview on Home; full listing on Resources page
- Team: Keep preview on Home; full list on Team page
- Testimonials: Keep as a reusable section or summary block on Home and related pages
- Contact: Keep on Home and create a dedicated Contact page
- Privacy Policy: Move to its own page and link from footer and contact area

## 13. Proposed Sitemap

- Home
  - Purpose: Introduce DAHI, its mission, and highlight the most important actions
  - Content: Hero, impact stats, short focus areas preview, founder intro, featured resources, community CTA

- About
  - Purpose: Tell the full story of DAHI, its philosophy, founder, and mission
  - Content: Full mission and vision, founder biography, values, purpose, and background

- Programs
  - Purpose: Explain the core health education themes and programs offered
  - Content: Menstrual health, fertility, contraception, menopause, emotional wellbeing, educational offerings

- Events
  - Purpose: Share upcoming and past activities, webinars, and community engagement
  - Content: Webinars, Q&A sessions, quizzes, awareness campaigns, event highlights

- Resources
  - Purpose: Provide access to free and paid educational materials
  - Content: Guides, downloads, products, learning resources, buy/download actions

- Team
  - Purpose: Introduce the multidisciplinary people behind DAHI
  - Content: Team bios, roles, and leadership information

- Blog / Stories
  - Purpose: Share health education content, personal stories, and updates
  - Content: Articles, educational posts, announcements, stories

- Donate / Support
  - Purpose: Invite support for DAHI’s work
  - Content: Donation options, supporter messaging, impact explanation

- Volunteer
  - Purpose: Encourage community involvement
  - Content: Volunteer opportunities, roles, application information

- Contact
  - Purpose: Provide clear ways to get in touch
  - Content: Email, WhatsApp, social links, community forms, contact form placeholder

## 14. Priority Improvements

### High Priority
- Create a scalable component architecture for future React/Vite conversion
- Separate content from layout and presentation
- Introduce a page-based structure instead of one long landing page
- Improve SEO metadata and social sharing tags
- Optimize large images and compress media assets

### Medium Priority
- Refactor repeated content patterns into reusable sections
- Add stronger accessibility and focus states
- Standardize content copy for consistency across pages
- Prepare a content model for team, resources, events, and testimonials

### Low Priority
- Add richer animations and transitions
- Add more structured data and schema markup
- Expand blog or newsletter functionality later

## Summary

The current site is a strong foundation for a future multi-page website. Its content is clear and mission-driven, but its structure needs to evolve from a single static page into a more modular, scalable site architecture. The next step should be a careful conversion plan rather than a visual redesign.
