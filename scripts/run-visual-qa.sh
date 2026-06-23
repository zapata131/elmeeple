#!/usr/bin/env bash
set -e

echo "=== 🤖 El Meeple: Automated Visual QA Testing Script ==="
echo "This script automates visual QA by launching a headless browser, executing"
echo "the homepage map discovery and 5-step onboarding flows, capturing screenshots"
echo "of each step, and saving them to the 'visual-qa-results' directory."
echo ""

# Ensure we are in the project root
cd "$(dirname "$0")/.."

# Check if playwright is installed in devDependencies
if ! grep -q '"@playwright/test"' package.json; then
  echo "📦 Installing Playwright test runner..."
  npm install -D @playwright/test
fi

# Ensure Playwright browser binaries are installed
echo "🌐 Ensuring Chromium browser binary is installed..."
npx playwright install chromium

# Ensure the results directory exists
mkdir -p visual-qa-results
rm -f visual-qa-results/*.png

# Run the Playwright visual QA spec
echo "🚀 Running Playwright visual QA walkthrough..."
npx playwright test e2e/visual-qa.spec.ts

echo ""
echo "=== 🎉 Visual QA Completed successfully! ==="
echo "Screenshots have been saved to 'visual-qa-results/':"
ls -la visual-qa-results/
echo ""
