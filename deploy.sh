#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building Next.js app..."
npm run build

echo "Exporting static site..."
npm run export

echo "Deploying to public_html..."
rm -rf ../public_html/*
cp -r out/* ../public_html/

echo "Deployment completed successfully."
