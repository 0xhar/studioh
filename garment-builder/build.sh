#!/bin/bash

# Install dependencies
npm install

# Build the application
npm run build

# Copy build to expected location for Vercel
cp -r dist/* ../public/ 2>/dev/null || true