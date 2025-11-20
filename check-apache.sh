#!/bin/bash

# Diagnostic script to check Apache configuration for PuraVida website
# Run this on your server: bash check-apache.sh

echo "=== Apache Configuration Diagnostic ==="
echo ""

# Check if .htaccess exists
echo "1. Checking if .htaccess file exists..."
if [ -f "/var/www/html/puravida-website/.htaccess" ]; then
    echo "   ✓ .htaccess file exists"
    echo "   File size: $(stat -c%s /var/www/html/puravida-website/.htaccess) bytes"
    echo "   Permissions: $(stat -c%a /var/www/html/puravida-website/.htaccess)"
else
    echo "   ✗ .htaccess file NOT FOUND!"
    echo "   This is likely the problem. The file should be in: /var/www/html/puravida-website/.htaccess"
fi
echo ""

# Check file permissions
echo "2. Checking file permissions..."
DOC_ROOT="/var/www/html/puravida-website"
if [ -d "$DOC_ROOT" ]; then
    echo "   Directory permissions: $(stat -c%a $DOC_ROOT)"
    echo "   Directory owner: $(stat -c%U:%G $DOC_ROOT)"
    echo "   Apache user: $(ps aux | grep '[a]pache2\|[h]ttpd' | head -1 | awk '{print $1}')"
else
    echo "   ✗ Document root not found: $DOC_ROOT"
fi
echo ""

# Check Apache modules
echo "3. Checking Apache modules..."
if command -v apache2ctl &> /dev/null; then
    echo "   Checking mod_rewrite..."
    if apache2ctl -M 2>/dev/null | grep -q rewrite; then
        echo "   ✓ mod_rewrite is enabled"
    else
        echo "   ✗ mod_rewrite is NOT enabled"
        echo "   Run: sudo a2enmod rewrite && sudo systemctl restart apache2"
    fi
    
    echo "   Checking mod_headers..."
    if apache2ctl -M 2>/dev/null | grep -q headers; then
        echo "   ✓ mod_headers is enabled"
    else
        echo "   ⚠ mod_headers is not enabled (optional but recommended)"
    fi
else
    echo "   ⚠ Cannot check modules (apache2ctl not found)"
fi
echo ""

# Check Apache configuration
echo "4. Checking Apache configuration..."
if [ -f "/etc/apache2/sites-available/puravida.conf" ]; then
    echo "   ✓ Virtual host config found"
    if grep -q "AllowOverride All" /etc/apache2/sites-available/puravida.conf; then
        echo "   ✓ AllowOverride All is set"
    else
        echo "   ✗ AllowOverride All is NOT set"
        echo "   This is required for .htaccess to work!"
    fi
    
    if grep -q "DirectorySlash Off" /etc/apache2/sites-available/puravida.conf; then
        echo "   ✓ DirectorySlash Off is set"
    else
        echo "   ⚠ DirectorySlash Off is not set (recommended to prevent 403 errors)"
    fi
else
    echo "   ⚠ Virtual host config not found at /etc/apache2/sites-available/puravida.conf"
    echo "   Checking default site..."
    if [ -f "/etc/apache2/sites-available/000-default.conf" ]; then
        if grep -q "AllowOverride All" /etc/apache2/sites-available/000-default.conf; then
            echo "   ✓ AllowOverride All is set in default config"
        else
            echo "   ✗ AllowOverride All is NOT set in default config"
        fi
    fi
fi
echo ""

# Check Apache error log location
echo "5. Checking Apache error logs..."
if [ -f "/var/log/apache2/error.log" ]; then
    echo "   Main error log: /var/log/apache2/error.log"
    echo "   Recent errors:"
    tail -5 /var/log/apache2/error.log 2>/dev/null || echo "   (no recent errors or cannot read)"
fi
if [ -f "/var/log/apache2/puravida-error.log" ]; then
    echo "   Site-specific error log: /var/log/apache2/puravida-error.log"
    echo "   Recent errors:"
    tail -5 /var/log/apache2/puravida-error.log 2>/dev/null || echo "   (no recent errors)"
fi
echo ""

# Test Apache configuration
echo "6. Testing Apache configuration..."
if command -v apache2ctl &> /dev/null; then
    if apache2ctl configtest 2>&1 | grep -q "Syntax OK"; then
        echo "   ✓ Apache configuration is valid"
    else
        echo "   ✗ Apache configuration has errors:"
        apache2ctl configtest 2>&1 | grep -v "Syntax OK"
    fi
else
    echo "   ⚠ Cannot test configuration (apache2ctl not found)"
fi
echo ""

echo "=== Diagnostic Complete ==="
echo ""
echo "Common fixes:"
echo "1. If .htaccess is missing, rebuild and redeploy: npm run build && ./deploy.sh"
echo "2. If AllowOverride is not All, edit Apache config and restart: sudo systemctl restart apache2"
echo "3. If permissions are wrong: sudo chmod -R 755 $DOC_ROOT && sudo chown -R www-data:www-data $DOC_ROOT"
echo "4. Enable mod_rewrite: sudo a2enmod rewrite && sudo systemctl restart apache2"

