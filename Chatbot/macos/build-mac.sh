#!/bin/bash

# Build script for macOS app
# Run this from the macos/ directory
echo "Building Red Hat AI Chatbot for macOS..."

# Ensure we're in the macos directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the macOS app
echo "Building macOS application..."
npm run build:mac

echo "Build complete! Check the 'dist' directory for the .app and .dmg files."
