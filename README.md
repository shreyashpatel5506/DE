# Civic Infrastructure Management App

A modern, responsive civic issue reporting and management platform built with **Next.js + React + TailwindCSS**.

## Production-ready UI base included

### Citizen Side

- Submit issue form with:
  - title
  - description
  - category
  - location
  - photo upload
- Track issue lifecycle:
  - Submitted → Verified → In Progress → Resolved
- In-app notifications (SSE stream)
- Email notifications on status updates (via Brevo integration)

### Government Officer Side

- Officer login with fixed government email IDs
- Issue dashboard with filters by category, location, and status
- Verify, update progress, and mark issues resolved
- Analytics view:
  - issues by category
  - status distribution
  - average resolution time

### UI/UX

- Mobile-first responsive layout
- Light/Dark mode toggle (`dark:` classes)
- Blue/green trust-oriented accent palette
- Cards, tables, and charts (Recharts)
- Smooth transitions and micro-interactions

## Default officer email IDs

Configured in `src/lib/constants.ts`:

- `commissioner@city.gov`
- `admin@city.gov`
- `operations@city.gov`
- `publicworks@city.gov`

## Getting started

1. Install dependencies:
   - `npm install`
2. Create env file (if not already present):
   - copy `.env.example` to `.env`
3. Start dev server:
   - `npm run dev`
4. Build for production:
   - `npm run build`
5. Start production server:
   - `npm start`
