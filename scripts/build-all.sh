#!/bin/bash

# Master build script for the entire desktop application
# Builds frontend, backend, and packages everything with Electron

set -e

echo "=========================================="
echo "Building Test Suite Desktop Application"
echo "=========================================="

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Step 1: Build Frontend
echo ""
echo "Step 1/3: Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Step 2: Build Backend
echo ""
echo "Step 2/3: Building backend..."
bash scripts/build-backend.sh

# Step 3: Package with Electron
echo ""
echo "Step 3/3: Packaging with Electron Builder..."
npm install
npm run electron:build

echo ""
echo "=========================================="
echo "Build complete!"
echo "=========================================="
echo "Installers can be found in the 'dist' directory"
