# Development Guide

## Testing UI Without Database Submissions

### Quick Setup: Mock Mode

1. **Create `.env.local` file** in the root directory:
```bash
NEXT_PUBLIC_MOCK_API=true
```

2. **Start the development server**:
```bash
npm run dev
```

3. **Test the UI** - All API calls will be mocked:
   - ✅ No data is sent to the database
   - ✅ All API calls return successful mock responses
   - ✅ You can test the entire flow without affecting production data
   - ✅ Console logs show `🔧 MOCK MODE:` for each API call

### How It Works

When `NEXT_PUBLIC_MOCK_API=true`:
- All API functions check for mock mode first
- Returns mock data instead of making real API calls
- Simulates network delays (300-500ms) for realistic testing
- Logs all mock calls to console for debugging

### Mock Responses

The following functions are mocked:
- `createManualUser()` - Returns mock user with ID 12345
- `submitOnboarding()` - Returns success with pending status
- `savePartialOnboarding()` - Returns success (no actual save)
- `getProducts()` - Returns mock product data
- `getCountries()` - Returns sample countries

### Testing Different Scenarios

You can modify the mock responses in `lib/api.ts` to test different scenarios:
- Success cases
- Error cases
- Different user statuses (pending, approved, etc.)

### Alternative: Use a Test/Staging API

Instead of mock mode, you can point to a test API:

```bash
NEXT_PUBLIC_API_URL=https://test-api.puravida.events
NEXT_PUBLIC_MOCK_API=false
```

### Best Practices

1. **Always use mock mode** when developing UI features
2. **Test with real API** before deploying to staging
3. **Never commit `.env.local`** (it's in .gitignore)
4. **Use different env files** for different environments:
   - `.env.local` - Local development
   - `.env.development` - Development server
   - `.env.production` - Production

### Other Development Tools

#### Browser DevTools
- React DevTools extension
- Network tab to see API calls
- Console for debugging

#### Next.js Features
- Hot reload on file changes
- Error overlay for runtime errors
- Fast Refresh for React components

### Troubleshooting

**Mock mode not working?**
- Check that `.env.local` exists and has `NEXT_PUBLIC_MOCK_API=true`
- Restart the dev server after changing env variables
- Check browser console for `🔧 MOCK MODE:` logs

**Want to test real API?**
- Set `NEXT_PUBLIC_MOCK_API=false` or remove the variable
- Restart the dev server



