#!/bin/bash
set -e
echo "Installing dependencies..."
cd "$(dirname "$0")"
npm install
echo ""
echo "Checking ffmpeg..."
which ffmpeg || (echo "ERROR: ffmpeg not found. Install with: brew install ffmpeg" && exit 1)
echo ""
echo "Rendering all scenes..."
node capture.js
echo ""
echo "Done! Videos are in ./output/"
ls -lh output/
