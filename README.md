# PuraVida Onboarding Website

A modern, growth-optimized onboarding flow for PuraVida - Dubai's exclusive lifestyle membership.

## Features

- 🎨 **Modern UI/UX**: Duolingo-inspired, tech-forward design with smooth animations
- 📊 **Comprehensive Analytics**: Full Google Analytics 4 integration with event tracking
- 🎯 **Growth Optimized**: Multi-step micro-interactions for maximum completion rates
- 📱 **Responsive**: Works beautifully on all devices
- ⚡ **Fast**: Built with Next.js 16 and optimized for performance

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Google Analytics 4** - Analytics

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Get your GA4 Measurement ID from [Google Analytics](https://analytics.google.com/)

3. Edit `.env.local` and add your values:
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_SITE_URL=https://puravida.com
   ```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the onboarding flow.

## Project Structure

```
├── app/
│   ├── onboarding/
│   │   └── page.tsx          # Main onboarding flow
│   ├── layout.tsx            # Root layout with GA
│   └── globals.css           # Global styles
├── components/
│   └── GoogleAnalytics.tsx   # GA component
├── lib/
│   └── analytics.ts          # Analytics utilities
└── ANALYTICS.md             # Analytics documentation
```

## Onboarding Flow

1. **Hero** - Landing page with CTA
2. **Step 1** - Personal information (name, gender, age, etc.)
3. **Step 2** - Music taste (multi-select)
4. **Step 3** - Favorite DJ
5. **Step 4** - Favorite places in Dubai (multi-select)
6. **Step 5** - Festivals you've been to
7. **Step 6** - Festivals you want to go to
8. **Step 7** - Nightlife frequency
9. **Step 8** - Ideal night out
10. **Step 9** - Emotional lead-in
11. **Step 10** - Confirmation

## SEO

Comprehensive SEO optimization with best practices. See [SEO.md](./SEO.md) for complete documentation.

**SEO Features:**

- ✅ Meta tags (title, description, keywords)
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Cards
- ✅ Structured Data (JSON-LD)
- ✅ Sitemap.xml (auto-generated)
- ✅ Robots.txt (auto-generated)
- ✅ Canonical URLs
- ✅ Mobile optimization
- ✅ PWA support

## Analytics & Attribution

Comprehensive analytics tracking with full UTM parameter support. See [ANALYTICS.md](./ANALYTICS.md) and [UTM_TRACKING.md](./UTM_TRACKING.md) for full documentation.

**Key Metrics Tracked:**

- Step views and completions
- Time spent per step
- Button clicks
- Field interactions
- Form submissions
- Conversions
- Drop-off points
- **Marketing attribution (UTM parameters, click IDs)**
- **First touch & last touch attribution**

**Attribution Tracking:**

- Automatically captures UTM parameters from URL
- Stores attribution data in localStorage
- Includes attribution in all analytics events
- Includes attribution in form submission
- Supports all major platforms (Google, Facebook, TikTok, LinkedIn, etc.)

## API Integration

**For Backend Developers:** Complete API specifications are available:

- **[API_SPECIFICATION.md](./API_SPECIFICATION.md)** - Full detailed API specification
- **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** - Quick reference guide

### Form Submission

The app is now connected to the backend API. Form submissions are automatically sent to:

- **API Endpoint**: `https://api.puravida.events/api/onboarding`
- **Method**: POST
- **Content-Type**: application/json

**Configuration:**

1. The API URL is set via `NEXT_PUBLIC_API_URL` in `.env.local` (defaults to `https://api.puravida.events`)
2. Form data includes all user inputs plus marketing attribution
3. Success/error handling is built-in with user feedback
4. Analytics tracking is integrated with API calls

**Data Sent:**

- All form fields (personal info, preferences, etc.)
- Marketing attribution (UTM parameters, click IDs)
- Submission metadata (timestamp, completion time)

See [API_SPECIFICATION.md](./API_SPECIFICATION.md) for the complete API contract.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to environment variables
4. Deploy!

### Other Platforms

1. Build: `npm run build`
2. Start: `npm start`
3. Set environment variables in your hosting platform

## Customization

### Colors

The design uses a monochrome black/white theme. To customize:

- Edit `app/globals.css` for global styles
- Modify Tailwind classes in components

### Questions

Edit the question steps in `app/onboarding/page.tsx`:

- Update step content
- Add/remove questions
- Modify validation logic

## Performance

- Optimized images and fonts
- Code splitting
- Lazy loading
- Minimal JavaScript bundle

## License

Private - PuraVida
