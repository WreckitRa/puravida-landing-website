#!/bin/bash

# Deploy script for Puravida website (Next.js 16 SSR)
# This script runs locally, then connects to server to deploy

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Server configuration
SERVER_USER="deploy"
SERVER_IP="194.163.45.139"
SERVER_PATH="/var/www/html/puravida-website"

echo -e "${GREEN}🚀 Starting SSR deployment...${NC}"

##############################################
# PART 1: LOCAL - Version Bump & Git Push
##############################################

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Part 1: Local Preparation${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if there are any changes to commit
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${GREEN}✅ No changes to commit. Skipping version bump and commit.${NC}"
    echo ""
else
    # Step 1: Version bump
    echo -e "${YELLOW}Step 1: Version bump${NC}"
    current_version=$(node -p "require('./package.json').version")
    IFS='.' read -ra v <<< "$current_version"
    major="${v[0]}"
    minor="${v[1]}"
    patch="${v[2]}"
    
    # Calculate next versions for display
    next_patch="$major.$minor.$((patch + 1))"
    next_minor="$major.$((minor + 1)).0"
    next_major="$((major + 1)).0.0"
    
    echo -e "Choose version bump:"
    echo -e "  1) Patch ($current_version → $next_patch)"
    echo -e "  2) Minor ($current_version → $next_minor)"
    echo -e "  3) Major ($current_version → $next_major)"
    read -p "Enter your choice (1-3): " version_choice

    case $version_choice in
        1) patch=$((patch + 1)) ;;
        2) minor=$((minor + 1)); patch=0 ;;
        3) major=$((major + 1)); minor=0; patch=0 ;;
        *) echo -e "${RED}Invalid choice, keeping same version.${NC}" ;;
    esac

    new_version="$major.$minor.$patch"

    if [ "$new_version" != "$current_version" ]; then
        node -e "const fs=require('fs');let p=require('./package.json');p.version='$new_version';fs.writeFileSync('./package.json',JSON.stringify(p,null,2));"
        echo -e "${GREEN}✅ Updated version: $current_version → $new_version${NC}"
    else
        echo -e "${YELLOW}⚠️  Version unchanged: $current_version${NC}"
        new_version="$current_version"
    fi

    # Step 2: Git add & commit
    echo -e "${YELLOW}Step 2: Git commit${NC}"
    git add .
    read -p "Commit message: " msg
    msg=${msg:-"Deploy v$new_version $(date +'%Y-%m-%d %H:%M:%S')"}
    git commit -m "$msg"

    # Step 3: Git push
    echo -e "${YELLOW}Step 3: Pushing to git${NC}"
    git push

    echo -e "${GREEN}✅ Local preparation complete!${NC}"
    echo ""
fi

##############################################
# PART 2: SERVER - Deploy on Remote Server
##############################################

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Part 2: Server Deployment${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}Connecting to server as ${SERVER_USER}@${SERVER_IP}...${NC}"

# Connect to server and run deployment commands
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
set -e

# Colors for remote output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DEPLOY_PATH="/var/www/html/puravida-website"

echo -e "${GREEN}🚀 Starting server-side deployment...${NC}"

# Change to deployment directory
cd ${DEPLOY_PATH}

# Pull latest code
echo -e "${YELLOW}Step 1: Pulling latest code${NC}"
git pull

# Install dependencies
echo -e "${YELLOW}Step 2: Installing dependencies${NC}"
npm install --production

# Build the application
echo -e "${YELLOW}Step 3: Building Next.js application${NC}"
npm run build

# Restart the systemd service
echo -e "${YELLOW}Step 4: Restarting Next.js service${NC}"
sudo systemctl restart invite-next

echo -e "${GREEN}✅ Server deployment complete!${NC}"
ENDSSH

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${GREEN}Your site is now live on https://invite.puravida.events${NC}"
