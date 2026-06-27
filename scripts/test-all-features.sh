#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "===================================================="
echo "      El Meeple: Feature Walkthrough Test Runner     "
echo "===================================================="

# Port configuration
DB_PORT=54321
WEB_PORT=3000

# Cleanup function to kill background processes on exit
cleanup() {
  echo ""
  echo "--> Cleaning up background servers..."
  if [ -n "$DB_PID" ]; then
    echo "Killing Mock Supabase (PID: $DB_PID)"
    kill $DB_PID 2>/dev/null || true
  fi
  if [ -n "$WEB_PID" ]; then
    echo "Killing Next.js Dev Server (PID: $WEB_PID)"
    kill $WEB_PID 2>/dev/null || true
  fi
  echo "Cleanup complete."
}

# Register cleanup to run on exit, interrupt, or termination
trap cleanup EXIT INT TERM

# 1. Start Mock Supabase Server
echo "--> Starting Mock Supabase Server on port $DB_PORT..."
node scripts/mock-supabase.js > /tmp/mock-supabase.log 2>&1 &
DB_PID=$!

# Wait for database port to open
echo "Waiting for Mock Supabase to be ready..."
for i in {1..10}; do
  if lsof -i :$DB_PORT >/dev/null 2>&1; then
    echo "Mock Supabase is ready!"
    break
  fi
  sleep 1
done

# 2. Start Next.js Development Server
echo "--> Starting Next.js Dev Server on port $WEB_PORT..."
npm run dev > /tmp/next-dev.log 2>&1 &
WEB_PID=$!

# Wait for web port to open and respond
echo "Waiting for Next.js Dev Server to be ready..."
for i in {1..30}; do
  if curl -s -I http://localhost:$WEB_PORT/login >/dev/null 2>&1; then
    echo "Next.js Dev Server is ready!"
    break
  fi
  sleep 1
done

# 3. Run Walkthroughs
echo ""
echo "===================================================="
echo " Running Walkthrough 1: Core User Journey           "
echo "===================================================="
node scripts/run-walkthrough.js

echo ""
echo "===================================================="
echo " Running Walkthrough 2: BGG Integration & Reviews   "
echo "===================================================="
node scripts/run-walkthrough-m3.js

echo ""
echo "===================================================="
echo " Running Walkthrough 3: Onboarding & Trust Badges   "
echo "===================================================="
node scripts/run-walkthrough-m4.js

echo ""
echo "===================================================="
echo " All walkthrough tests completed successfully!      "
echo "===================================================="
