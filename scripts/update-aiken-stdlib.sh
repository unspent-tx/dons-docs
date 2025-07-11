#!/bin/bash

# Script to update the Aiken standard library

set -e

echo "🔄 Updating Aiken Standard Library..."

# Remove existing stdlib
echo "📂 Removing existing stdlib..."
rm -rf packages/aiken-stdlib/aiken packages/aiken-stdlib/cardano

# Clone the latest version
echo "📥 Cloning latest version from GitHub..."
git clone https://github.com/aiken-lang/stdlib.git temp-aiken-stdlib

# Copy the lib directory contents
echo "📋 Copying lib directory..."
cp -r temp-aiken-stdlib/lib/* packages/aiken-stdlib/

# Clean up temporary directory
echo "🧹 Cleaning up..."
rm -rf temp-aiken-stdlib

# Update the version in package.json
echo "📝 Updating package.json version..."
cd packages/aiken-stdlib
npm version patch --no-git-tag-version
cd ../..

echo "✅ Aiken standard library updated successfully!"
echo "📦 You may want to run 'npm install' to update dependencies" 