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

# Step 1: Add all changes to git
echo -e "${YELLOW}Step 1: Adding files to git...${NC}"
git add .

# Step 2: Commit changes
echo -e "${YELLOW}Step 2: Committing changes...${NC}"
read -p "Enter commit message (or press Enter for default): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Deploy: $(date +'%Y-%m-%d %H:%M:%S')"
fi
git commit -m "$commit_message" || {
    echo -e "${YELLOW}No changes to commit, continuing...${NC}"
}

# Step 3: Push to remote
echo -e "${YELLOW}Step 3: Pushing to remote repository...${NC}"
git push

# Step 4: Install dependencies
echo -e "${YELLOW}Step 4: Installing dependencies...${NC}"
npm install

# Step 5: Build the project
echo -e "${YELLOW}Step 5: Building the project...${NC}"
echo -e "${YELLOW}Note: Make sure all NEXT_PUBLIC_* environment variables are set before building${NC}"
npm run build

# Step 6: Deploy to server
echo -e "${YELLOW}Step 6: Deploying to server...${NC}"
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

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Files have been deployed to ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}${NC}"

