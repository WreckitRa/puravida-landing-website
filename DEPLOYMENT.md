# Deployment Guide - PuraVida Website

## 🚀 Fastest Method: Vercel (Recommended)

Vercel is the fastest and easiest way to deploy Next.js apps. It's made by the creators of Next.js and requires zero configuration.

### Option 1: Deploy via Vercel Dashboard (5 minutes)

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**

   - Sign up/login with your GitHub account

3. **Import your repository**

   - Click "Add New Project"
   - Select your `puravida-new-website` repository
   - Click "Import"

4. **Configure Environment Variables**

   - In the project settings, go to "Environment Variables"
   - Add the following:
     ```
     NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
     NEXT_PUBLIC_SITE_URL=https://your-domain.com
     NEXT_PUBLIC_API_URL=https://api.puravida.events
     ```
   - ⚠️ **IMPORTANT**: `NEXT_PUBLIC_API_URL` must use `https://` (not `http://`) to prevent mixed-content errors. The code will automatically convert HTTP to HTTPS, but it's best to set it correctly.
   - (Optional) Add app store URLs if different from defaults:
     ```
     NEXT_PUBLIC_GOOGLE_PLAY_URL=https://play.google.com/...
     NEXT_PUBLIC_APPLE_APP_STORE_URL=https://apps.apple.com/...
     NEXT_PUBLIC_APPLE_APP_STORE_DEEP_LINK=itms-apps://...
     ```

5. **Deploy!**

   - Click "Deploy"
   - Vercel will automatically:
     - Build your app
     - Run `npm run build`
     - Deploy to a global CDN
     - Provide a production URL (e.g., `puravida-new-website.vercel.app`)

6. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `puravida.com`)
   - Follow DNS configuration instructions

### Option 2: Deploy via Vercel CLI (3 minutes)

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

   - Follow the prompts
   - When asked about environment variables, add them or configure later in dashboard

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Environment Variables Required

Make sure to set these in Vercel Dashboard → Settings → Environment Variables:

| Variable                        | Description                      | Example                       |
| ------------------------------- | -------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 ID            | `G-XXXXXXXXXX`                |
| `NEXT_PUBLIC_SITE_URL`          | Your production URL              | `https://puravida.com`        |
| `NEXT_PUBLIC_API_URL`           | Backend API URL (must use HTTPS) | `https://api.puravida.events` |

**Optional:**

- `NEXT_PUBLIC_GOOGLE_PLAY_URL` - Google Play Store URL
- `NEXT_PUBLIC_APPLE_APP_STORE_URL` - Apple App Store web URL
- `NEXT_PUBLIC_APPLE_APP_STORE_DEEP_LINK` - Apple App Store deep link

---

## 🖥️ Hostinger Deployment

Hostinger supports Node.js applications through their VPS or Business/Cloud hosting plans. The `output: 'standalone'` configuration in `next.config.ts` creates a minimal production build optimized for self-hosting.

### Prerequisites

- Hostinger VPS, Business, or Cloud hosting plan with Node.js support
- SSH access to your server
- Node.js 18+ installed on your server
- PM2 (recommended) for process management

### Step 1: Build Locally (Optional) or on Server

**Option A: Build on your local machine**

```bash
# Install dependencies
npm install

# Build the application
npm run build

# The standalone build will be in .next/standalone/
```

**Option B: Build directly on Hostinger server**

```bash
# SSH into your Hostinger server
ssh your-username@your-server-ip

# Clone your repository
git clone https://github.com/your-username/puravida-new-website.git
cd puravida-new-website

# Install dependencies
npm install

# Build the application
npm run build
```

### Step 2: Set Up Environment Variables

Create a `.env.production` file on your server:

```bash
nano .env.production
```

Add your environment variables:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.puravida.events
```

### Step 3: Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### Step 4: Start the Application

The standalone build creates a minimal server. Start it with:

```bash
# From the project root
node .next/standalone/server.js
```

Or with PM2 (recommended for production):

```bash
pm2 start .next/standalone/server.js --name puravida-website
pm2 save
pm2 startup  # Follow instructions to enable auto-start on reboot
```

### Step 5: Configure Reverse Proxy (Nginx)

If you're using Nginx, create a configuration file:

```bash
sudo nano /etc/nginx/sites-available/puravida
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/puravida /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Set Up SSL Certificate

Use Let's Encrypt (free SSL):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Important Notes for Hostinger

- **Port Configuration**: Next.js runs on port 3000 by default. Make sure this port is open in your firewall
- **Node.js Version**: Ensure Node.js 18+ is installed (`node --version`)
- **Memory**: Next.js standalone builds are optimized but still require adequate server resources
- **Static Files**: The standalone build includes all necessary files in `.next/standalone/`
- **Environment Variables**: Make sure all `NEXT_PUBLIC_*` variables are set before building

### Troubleshooting

**Check if the app is running:**
```bash
pm2 status
pm2 logs puravida-website
```

**Restart the application:**
```bash
pm2 restart puravida-website
```

**Check port availability:**
```bash
netstat -tulpn | grep 3000
```

---

## 🔄 Alternative: Other Platforms

### Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables
6. Deploy

### Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Select repository
5. Add environment variables
6. Deploy

### Render

1. Push to GitHub
2. Go to [render.com](https://render.com)
3. New → Web Service
4. Connect GitHub repository
5. Build command: `npm run build`
6. Start command: `npm start`
7. Add environment variables
8. Deploy

---

## ✅ Post-Deployment Checklist

- [ ] Verify site loads at production URL
- [ ] Test all routes (onboarding, privacy-policy, terms-conditions, etc.)
- [ ] Verify Google Analytics is tracking
- [ ] Test form submission to API
- [ ] Check mobile responsiveness
- [ ] Verify PWA manifest works
- [ ] Test sitemap.xml and robots.txt
- [ ] Set up custom domain (if needed)
- [ ] Configure SSL certificate (automatic on Vercel)

---

## 🎯 Quick Deploy Command

If you have Vercel CLI installed:

```bash
vercel --prod
```

That's it! Your app will be live in ~2 minutes.
