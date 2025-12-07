#!/bin/bash

# Setup script for offchain packages
# This script clones the MeshJS repositories into the packages/offchain directory

set -e

echo "🔧 Setting up offchain packages..."

# Create offchain directory if it doesn't exist
mkdir -p packages/offchain

# Change to offchain directory
cd packages/offchain

# List of MeshJS packages to clone
PACKAGES=(
    "bitcoin"
    "mesh-common"
    "mesh-contract"
    "mesh-core-csl"
    "mesh-core-cst"
    "mesh-core"
    "mesh-hydra"
    "mesh-provider"
    "mesh-transaction"
    "mesh-wallet"
)

# Clone each package
for package in "${PACKAGES[@]}"; do
    if [ ! -d "$package" ]; then
        echo "📦 Cloning $package..."
        git clone "https://github.com/MeshJS/mesh.git" "$package"
        cd "$package"
        
        # Checkout the specific package directory
        if [ -d "packages/$package" ]; then
            # Move the package contents to the root
            mv "packages/$package"/* .
            rm -rf "packages"
            rm -rf ".git"
            
            # Initialize as a new git repo (optional)
            git init
            git add .
            git commit -m "Initial commit from MeshJS"
        else
            echo "⚠️ Package $package not found in MeshJS repository"
            cd ..
            rm -rf "$package"
            continue
        fi
        
        cd ..
        echo "✅ Successfully set up $package"
    else
        echo "ℹ️ $package already exists, skipping..."
    fi
done

echo "🎉 Offchain packages setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run copy-offchain-files' to copy files to public directory"
echo "2. Run 'npm run generate-offchain-data' to generate documentation data"
echo "3. Run 'npm run dev' to start the development server" 