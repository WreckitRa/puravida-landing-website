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
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
     ```
   - ⚠️ **IMPORTANT**: `NEXT_PUBLIC_API_URL` must use `https://` (not `http://`) to prevent mixed-content errors. The code will automatically convert HTTP to HTTPS, but it's best to set it correctly.
   - **Stripe Setup**: See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for complete Stripe Dashboard configuration guide.
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

| Variable                             | Description                           | Example                       |
| ------------------------------------ | ------------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`      | Google Analytics 4 ID                 | `G-XXXXXXXXXX`                |
| `NEXT_PUBLIC_SITE_URL`               | Your production URL                   | `https://puravida.com`        |
| `NEXT_PUBLIC_API_URL`                | Backend API URL (must use HTTPS)      | `https://api.puravida.events` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key (for payments) | `pk_live_xxxxxxxxxxxxx`       |

**Optional:**

- `NEXT_PUBLIC_GOOGLE_PLAY_URL` - Google Play Store URL
- `NEXT_PUBLIC_APPLE_APP_STORE_URL` - Apple App Store web URL
- `NEXT_PUBLIC_APPLE_APP_STORE_DEEP_LINK` - Apple App Store deep link

---

## 🖥️ Hostinger Deployment (Static Export)

The project is configured for **static export** (`output: 'export'`), which means it generates fully static HTML/CSS/JS files that can be served by any web server. **No Node.js server required!**

### Prerequisites

- Hostinger hosting plan (any plan that supports static files - Shared, Business, VPS, or Cloud)
- SSH access to your server (or FTP/SFTP)
- **No Node.js required on the server** (only needed for building)

### Step 1: Build Locally

Build the static export on your local machine (or CI/CD):

```bash
# Install dependencies
npm install

# Set environment variables before building
export NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
export NEXT_PUBLIC_SITE_URL=https://your-domain.com
export NEXT_PUBLIC_API_URL=https://api.puravida.events

# Build the static export
npm run build

# The static files will be in the 'out' directory
```

**Important:** All `NEXT_PUBLIC_*` environment variables must be set **before building** as they are embedded into the static files at build time.

### Step 2: Deploy Static Files

**Option A: Using the deploy script**

```bash
# Make sure deploy.sh is executable
chmod +x deploy.sh

# Run the deploy script
./deploy.sh
```

**Option B: Manual deployment via SSH/rsync**

```bash
# Copy the 'out' directory to your web server
rsync -avz --progress --delete out/ deploy@your-server-ip:/var/www/html/puravida-website/
```

**Option C: Manual deployment via FTP/SFTP**

1. Upload the entire contents of the `out` directory to your web server's document root (e.g., `/public_html/` or `/var/www/html/`)

### Step 3: Configure Web Server

#### Option A: Apache (Recommended for shared hosting)

The `.htaccess` file in the `public/` directory is automatically copied to the build output and handles routing. However, you need to ensure Apache is configured correctly:

**1. Enable required Apache modules:**

```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
sudo systemctl restart apache2
```

**2. Configure Apache Virtual Host:**

```bash
sudo nano /etc/apache2/sites-available/puravida.conf
```

Add:

```apache
<VirtualHost *:80>
    ServerName invite.puravida.events
    DocumentRoot /var/www/html/puravida-website

    # Prevent Apache from automatically adding trailing slashes
    # This prevents "Forbidden" errors when reloading pages
    DirectorySlash Off

    <Directory /var/www/html/puravida-website>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/puravida-error.log
    CustomLog ${APACHE_LOG_DIR}/puravida-access.log combined
    LogLevel warn
</VirtualHost>
```

**3. Enable the site:**

```bash
sudo a2ensite puravida.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

**Important:** The `.htaccess` file from `public/.htaccess` is automatically copied to the root of the `out/` directory during build. Make sure:

- `mod_rewrite` is enabled
- `AllowOverride All` is set in your Apache configuration
- The `.htaccess` file exists in the deployed directory

**Verify `.htaccess` is deployed:**

```bash
# On your server, check if .htaccess exists:
ls -la /var/www/html/puravida-website/.htaccess

# If it doesn't exist, check if it was built:
ls -la out/.htaccess

# If it exists in 'out' but not on server, the deployment didn't copy it
# Manually copy it:
scp out/.htaccess deploy@your-server-ip:/var/www/html/puravida-website/.htaccess
```

**Run diagnostic script:**

```bash
# Copy the diagnostic script to your server and run it:
scp check-apache.sh deploy@your-server-ip:~/
ssh deploy@your-server-ip "bash ~/check-apache.sh"
```

#### Option B: Nginx

If you're using Nginx, create a simple static file server configuration:

```bash
sudo nano /etc/nginx/sites-available/puravida
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/puravida-website;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/puravida /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Set Up SSL Certificate

Use Let's Encrypt (free SSL):

**For Apache:**

```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d invite.puravida.events
```

**For Nginx:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Important Notes for Static Export

- ✅ **No Node.js server needed** - Just serve static files
- ✅ **No PM2 needed** - No process to manage
- ✅ **Works on any hosting** - Shared hosting, VPS, CDN, etc.
- ✅ **Faster and cheaper** - No server resources needed
- ⚠️ **Environment Variables**: Must be set at **build time**, not runtime
- ⚠️ **Build Directory**: Static files are in the `out/` directory after build

### Troubleshooting

**Check if files are deployed:**

```bash
ls -la /var/www/html/puravida-website/
```

**Verify `.htaccess` is present:**

```bash
ls -la /var/www/html/puravida-website/.htaccess
cat /var/www/html/puravida-website/.htaccess
```

**Check Apache configuration:**

```bash
# Test Apache configuration
sudo apache2ctl configtest

# Check if mod_rewrite is enabled
apache2ctl -M | grep rewrite

# Check Apache status
sudo systemctl status apache2

# View Apache error logs
sudo tail -f /var/log/apache2/error.log

# View site-specific error logs
sudo tail -f /var/log/apache2/puravida-error.log
```

**Common Apache Issues:**

1. **"Not Found" errors:** Ensure `mod_rewrite` is enabled and `AllowOverride All` is set
2. **"Forbidden" errors on reload:**
   - The `.htaccess` file includes `DirectorySlash Off` to prevent this
   - Check file permissions: `sudo chmod -R 755 /var/www/html/puravida-website`
   - Check ownership: `sudo chown -R www-data:www-data /var/www/html/puravida-website`
   - Verify Apache can read the directory: `sudo chmod 755 /var/www/html/puravida-website`
3. **Routes not working:** Verify the `.htaccess` file is in the document root and Apache can read it
4. **`/app/invite` not redirecting correctly:**
   - On mobile (Android/iOS): Should redirect to app stores
   - On desktop: Should redirect to `/ihaveinvite`
   - Verify user agent detection is working by checking Apache access logs

**Check Nginx configuration (if using Nginx):**

```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Alternative: Other Platforms

### Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `out` (for static export)
5. Add environment variables (all `NEXT_PUBLIC_*` variables)
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
3. New → Static Site (not Web Service, since we're using static export)
4. Connect GitHub repository
5. Build command: `npm run build`
6. Publish directory: `out`
7. Add environment variables (all `NEXT_PUBLIC_*` variables)
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
