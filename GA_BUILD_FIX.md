# Google Analytics Build Mode Fix

## Problem

Google Analytics works in `npm run dev` but not in production build (`npm run build` + `npm start`).

## Root Cause

In Next.js, `NEXT_PUBLIC_*` environment variables must be:

1. **Accessed at module level** (outside component functions)
2. **Available at build time** (when running `npm run build`)
3. **Embedded during build** (not accessed at runtime)

## Fix Applied

### Before (❌ Broken in Production)

```typescript
export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
  // This doesn't work in production builds
}
```

### After (✅ Works in Production)

```typescript
// Get measurement ID at module level for build-time embedding
const measurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_GA4_ID ||
  "";

export default function GoogleAnalytics() {
  // Use measurementId constant
}
```

## Why This Works

1. **Module-level access**: Next.js replaces `process.env.NEXT_PUBLIC_*` at build time when accessed at module level
2. **Build-time embedding**: The value is embedded into the JavaScript bundle during `npm run build`
3. **Runtime availability**: The embedded value is available in production

## Verification Steps

### 1. Check Environment Variable is Set

```bash
# On your server, before building
echo $NEXT_PUBLIC_GA_MEASUREMENT_ID
# Should output: G-XXXXXXXXXX
```

### 2. Rebuild After Setting Env Var

```bash
# IMPORTANT: Must rebuild after setting env var
npm run build
npm start
```

### 3. Check Browser Console

- Open DevTools → Console
- Look for: `✅ GA initialized with ID: G-XXXXXXXXXX`
- Should appear after page load

### 4. Check Network Tab

- Look for request to: `googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`
- Should return 200 status

### 5. Check DataLayer

```javascript
// In browser console
window.dataLayer;
// Should show array with GA events
```

## Common Issues

### Issue: Still not working after rebuild

**Solution**:

1. Make sure env var is set in production environment
2. Delete `.next` folder: `rm -rf .next`
3. Rebuild: `npm run build`
4. Restart: `npm start`

### Issue: Works locally but not on server

**Solution**:

1. Set env var on server (in `.env.local` or systemd service)
2. Verify it's available: `echo $NEXT_PUBLIC_GA_MEASUREMENT_ID`
3. Rebuild on server: `npm run build`
4. Restart service: `systemctl restart invite-next`

### Issue: Env var not embedded

**Solution**:

- Ensure variable name starts with `NEXT_PUBLIC_`
- Access it at module level (not inside component)
- Rebuild after setting/changing the variable

## Production Deployment Checklist

- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in production environment
- [ ] Verify env var is available: `echo $NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] Delete old build: `rm -rf .next`
- [ ] Rebuild: `npm run build`
- [ ] Check build output for any warnings
- [ ] Restart service: `systemctl restart invite-next`
- [ ] Test in browser (check console and Network tab)
- [ ] Verify events appear in GA Real-Time reports

## Testing

### Quick Test

```javascript
// In browser console after page load
window.gtag("event", "test_event", { test: true });
// Check GA Real-Time → Events (should appear within 30 seconds)
```

### Full Test

1. Navigate between pages
2. Click buttons (should trigger events)
3. Fill forms (should trigger events)
4. Check GA Real-Time → Events section
