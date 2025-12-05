#!/bin/bash

# Deploy script for Puravida website (Next.js 16 static export)

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Server configuration
SERVER_USER="deploy"
SERVER_IP="194.163.45.139"
SERVER_PATH="/var/www/html/puravida-website/"

echo -e "${GREEN}🚀 Starting deployment...${NC}"

##############################################
# 1. VERSION BUMP
##############################################
echo -e "${YELLOW}Step 1: Version bump${NC}"
echo -e "Choose version bump:"
echo -e "  1) Patch"
echo -e "  2) Minor"
echo -e "  3) Major"
read -p "Enter your choice (1-3): " version_choice

current_version=$(node -p "require('./package.json').version")
IFS='.' read -ra v <<< "$current_version"
major="${v[0]}"
minor="${v[1]}"
patch="${v[2]}"

case $version_choice in
    1) patch=$((patch + 1)) ;;
    2) minor=$((minor + 1)); patch=0 ;;
    3) major=$((major + 1)); minor=0; patch=0 ;;
    *) echo -e "${RED}Invalid choice, keeping same version.${NC}" ;;
esac

new_version="$major.$minor.$patch"

if [ "$new_version" != "$current_version" ]; then
    node -e "const fs=require('fs');let p=require('./package.json');p.version='$new_version';fs.writeFileSync('./package.json',JSON.stringify(p,null,2));"
    echo -e "${GREEN}Updated version: $current_version → $new_version${NC}"
fi

##############################################
# 2. GIT ADD & COMMIT & PUSH
##############################################
echo -e "${YELLOW}Step 2: Git commit${NC}"
git add .
read -p "Commit message: " msg
msg=${msg:-"Deploy $(date +'%Y-%m-%d %H:%M:%S')"}
git commit -m "$msg" || echo -e "${YELLOW}No changes to commit${NC}"
git push

##############################################
# 3. INSTALL & BUILD
##############################################
echo -e "${YELLOW}Step 3: Installing dependencies${NC}"
npm install

echo -e "${YELLOW}Step 4: Building project (Next.js 16 static export)...${NC}"
npm run build

# Validate output
if [ ! -d "out" ]; then
    echo -e "${RED}❌ Build failed: 'out' directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful. 'out/' folder ready.${NC}"

##############################################
# 4. DEPLOY TO SERVER
##############################################
echo -e "${YELLOW}Step 5: Uploading to server...${NC}"

ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${SERVER_PATH}"

rsync -avz --delete out/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}

##############################################
# 5. CREATE FINAL .htaccess ON SERVER
##############################################
echo -e "${YELLOW}Step 6: Uploading .htaccess to server${NC}"

# Use the .htaccess from out/ directory (which should have been copied from public/)
if [ -f "out/.htaccess" ]; then
    scp out/.htaccess ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}.htaccess
    echo -e "${GREEN}.htaccess uploaded successfully.${NC}"
else
    echo -e "${YELLOW}Warning: out/.htaccess not found, using public/.htaccess${NC}"
    if [ -f "public/.htaccess" ]; then
        scp public/.htaccess ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}.htaccess
        echo -e "${GREEN}.htaccess uploaded successfully.${NC}"
    else
        echo -e "${RED}Error: No .htaccess file found${NC}"
        exit 1
    fi
fi

##############################################
# 6. PERMISSIONS
##############################################
echo -e "${YELLOW}Step 7: Permissions${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "chmod -R 755 ${SERVER_PATH}"

echo -e "${GREEN}🎉 Deployment finished successfully!${NC}"
echo -e "${GREEN}Your site is now live on https://invite.puravida.events${NC}"
