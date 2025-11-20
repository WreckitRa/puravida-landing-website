#!/bin/bash

# Deploy script for Puravida website
# This script adds, commits, pushes, installs, builds, and deploys to server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="deploy"
SERVER_IP="194.163.45.139"
SERVER_PATH="/var/www/html/puravida-website/"

echo -e "${GREEN}Starting deployment process...${NC}"

# Step 1: Version bump
echo -e "${YELLOW}Step 1: Version bump...${NC}"
echo -e "Select version bump type:"
echo -e "  1) Patch (0.1.0 -> 0.1.1) - Bug fixes"
echo -e "  2) Minor (0.1.0 -> 0.2.0) - New features"
echo -e "  3) Major (0.1.0 -> 1.0.0) - Breaking changes"
read -p "Enter your choice (1-3): " version_choice

# Get current version from package.json
current_version=$(node -p "require('./package.json').version")
IFS='.' read -ra VERSION_PARTS <<< "$current_version"
major="${VERSION_PARTS[0]}"
minor="${VERSION_PARTS[1]}"
patch="${VERSION_PARTS[2]}"

# Increment version based on choice
case $version_choice in
    1)
        patch=$((patch + 1))
        new_version="$major.$minor.$patch"
        echo -e "${GREEN}Bumping patch version: $current_version -> $new_version${NC}"
        ;;
    2)
        minor=$((minor + 1))
        patch=0
        new_version="$major.$minor.$patch"
        echo -e "${GREEN}Bumping minor version: $current_version -> $new_version${NC}"
        ;;
    3)
        major=$((major + 1))
        minor=0
        patch=0
        new_version="$major.$minor.$patch"
        echo -e "${GREEN}Bumping major version: $current_version -> $new_version${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice. Using current version without bump.${NC}"
        new_version="$current_version"
        ;;
esac

# Update package.json version
if [ "$new_version" != "$current_version" ]; then
    node -e "const fs = require('fs'); const pkg = require('./package.json'); pkg.version = '$new_version'; fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');"
    echo -e "${GREEN}Updated package.json version to $new_version${NC}"
fi

# Step 2: Add all changes to git
echo -e "${YELLOW}Step 2: Adding files to git...${NC}"
git add .

# Step 3: Commit changes
echo -e "${YELLOW}Step 3: Committing changes...${NC}"
read -p "Enter commit message (or press Enter for default): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Deploy: $(date +'%Y-%m-%d %H:%M:%S')"
fi
git commit -m "$commit_message" || {
    echo -e "${YELLOW}No changes to commit, continuing...${NC}"
}

# Step 4: Push to remote
echo -e "${YELLOW}Step 4: Pushing to remote repository...${NC}"
git push

# Step 5: Install dependencies
echo -e "${YELLOW}Step 5: Installing dependencies...${NC}"
npm install

# Step 6: Build the project
echo -e "${YELLOW}Step 6: Building the project...${NC}"
echo -e "${YELLOW}Note: Make sure all NEXT_PUBLIC_* environment variables are set before building${NC}"
npm run build

# Step 7: Deploy to server
echo -e "${YELLOW}Step 7: Deploying to server...${NC}"
echo -e "Copying files to ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}"

# Check if build files exist (static export creates 'out' directory)
if [ ! -d "out" ]; then
    echo -e "${RED}Error: 'out' directory not found. Build may have failed.${NC}"
    echo -e "${RED}Make sure next.config.ts has 'output: export' configured.${NC}"
    exit 1
fi

# Create necessary directory on server
echo -e "Creating directory on server..."
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${SERVER_PATH}"

# Copy static files to server using rsync (faster than scp, supports compression and incremental updates)
echo -e "Transferring static files (this may take a few minutes)..."
echo -e "Copying out/ directory (all static files)..."
rsync -avz --progress --delete out/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}

# Set proper permissions for Apache
echo -e "${YELLOW}Setting file permissions...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "chmod -R 755 ${SERVER_PATH} && chown -R www-data:www-data ${SERVER_PATH} 2>/dev/null || chown -R \$(whoami):\$(whoami) ${SERVER_PATH}"

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Files have been deployed to ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}${NC}"
echo -e "${YELLOW}Note: Make sure Apache has mod_rewrite enabled and .htaccess files are allowed${NC}"

