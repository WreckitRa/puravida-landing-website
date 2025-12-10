# SSR Migration Summary

This document summarizes the refactoring from static export to full Next.js SSR behind Apache reverse proxy.

## ✅ Completed Changes

### 1. Removed Obsolete Artifacts

#### Deleted Files:

- **`scripts/post-build.js`** - Post-build script that manipulated fallback routing for static export
  - **Reason**: No longer needed with SSR. Next.js handles routing server-side.

#### Simplified Files:

- **`public/.htaccess`** - Removed all static export rewrites
  - **Removed**: Event route fallback rewrites (`/event/*` → `fallback.html`)
  - **Removed**: Clean URL → `.html` file rewrites
  - **Removed**: SPA fallback to `index.html`
  - **Kept**: Basic redirects (`/app/invite` → `/ihaveinvite`)
  - **Reason**: With SSR, Apache should proxy to Next.js server. Most routing handled server-side.

#### Updated Files:

- **`app/event/[id]/page.tsx`** - Removed `generateStaticParams()` and static export comments
  - **Reason**: With SSR, dynamic routes work natively. No pre-generation needed.
- **`app/event/[id]/EventPageClient.tsx`** - Cleaned up fallback-related comments
  - **Reason**: Simplified logic since SSR handles routing properly.

### 2. Fixed Deploy Scripts

#### Updated: `deploy.sh`

**Before**:

- Version bumping
- Git commit/push
- Local build with static export
- rsync/scp of `/out` folder to server
- Manual `.htaccess` upload

**After**:

```bash
#!/bin/bash
cd /var/www/html/puravida-website
git pull
npm install --production
npm run build
sudo systemctl restart invite-next
```

**Changes**:

- ✅ Removed version bumping (can be handled separately)
- ✅ Removed git commit/push (deployment happens on server)
- ✅ Removed file copying/uploading logic
- ✅ Added `systemctl restart invite-next` for SSR service
- ✅ Simplified to server-side deployment flow

#### Updated: `package.json`

**Removed**:

- `"build": "next build && node scripts/post-build.js"`
- `"build:prod": "NODE_ENV=production next build && node scripts/post-build.js"`
- `"postbuild": "node scripts/post-build.js"`

**Now**:

- `"build": "next build"`
- `"build:prod": "NODE_ENV=production next build"`

### 3. Modernized Google Analytics

#### Created: `analytics/init.ts`

New SSR-safe GA initialization module with:

- ✅ Client-only execution (SSR safety checks)
- ✅ Prevents double injection across re-renders
- ✅ Queues events even if gtag loads late
- ✅ Loads GA4 ID from environment variable safely
- ✅ Proper TypeScript types

**Key Functions**:

- `initGA(measurementId)` - Initialize dataLayer and gtag
- `loadGAScript(measurementId)` - Dynamically load GA script (prevents duplicates)
- `configureGA(measurementId, config?)` - Configure GA after script loads

#### Updated: `components/GoogleAnalytics.tsx`

**Before**: Mixed initialization logic, potential SSR issues

**After**:

- ✅ Uses new `analytics/init.ts` module
- ✅ SSR-safe initialization
- ✅ Prevents double script injection
- ✅ Supports both `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_GA4_ID`
- ✅ Proper event queuing

### 4. Cleaned Up Documentation

#### Deleted:

- **`DYNAMIC_EVENT_ROUTES.md`** - Outdated documentation about static export fallback routing

#### Note:

Other documentation files (DEPLOYMENT.md, ANALYTICS_SETUP.md, etc.) may still contain static export references. These can be updated as needed, but the core codebase is now SSR-ready.

## 🔧 Configuration Files

### `next.config.ts`

**Current**: Basic config with `images.unoptimized: true`
**Status**: ✅ No `output: 'export'` found - SSR ready

### `.gitignore`

**Status**: ✅ Already includes `/out/` and `/.next/` - no changes needed

## 🚀 Deployment Flow (New)

1. **On Server**:

   ```bash
   cd /var/www/html/puravida-website
   git pull
   npm install --production
   npm run build
   sudo systemctl restart invite-next
   ```

2. **Apache Configuration**:

   - Apache should proxy requests to Next.js server (typically port 3000)
   - Example Apache vhost config:

   ```apache
   ProxyPass / http://localhost:3000/
   ProxyPassReverse / http://localhost:3000/
   ```

3. **Systemd Service** (`invite-next`):
   - Should run `next start` on port 3000
   - Example service file:
   ```ini
   [Service]
   ExecStart=/usr/bin/node /var/www/html/puravida-website/node_modules/.bin/next start
   WorkingDirectory=/var/www/html/puravida-website
   ```

## ⚠️ Important Notes

1. **Environment Variables**:

   - Must be set on the server (not just at build time)
   - SSR can access both `NEXT_PUBLIC_*` and server-only env vars

2. **Apache Reverse Proxy**:

   - Ensure Apache is configured to proxy to Next.js server
   - `.htaccess` in `public/` is minimal - most routing handled by Next.js

3. **No Static Files**:

   - Don't copy `/out` folder
   - Don't upload files manually
   - Next.js server handles everything

4. **Event Routes**:
   - `/event/[id]` now works natively with SSR
   - No fallback.html needed
   - No Apache rewrites needed

## 📝 Next Steps (Optional)

1. Update remaining documentation files to reflect SSR deployment
2. Verify Apache reverse proxy configuration
3. Test all routes work correctly with SSR
4. Monitor systemd service logs: `sudo journalctl -u invite-next -f`

## ✅ Verification Checklist

- [x] Post-build script removed
- [x] Deploy script updated for SSR
- [x] Package.json cleaned up
- [x] Event page simplified (no generateStaticParams)
- [x] .htaccess simplified
- [x] Analytics modernized for SSR
- [x] Outdated docs removed
- [ ] Apache reverse proxy configured
- [ ] Systemd service running
- [ ] All routes tested
