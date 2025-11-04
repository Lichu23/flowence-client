#!/bin/bash

# Ì∑™ Stripe Integration Test Setup Script
# Sprint 3.3 - Sales Processing Part 2

echo "Ì∫Ä Setting up Stripe Integration Test Environment..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "‚ùå Error: Please run this script from the flowence-client directory"
    exit 1
fi

echo "Ì≥ã Pre-flight checks..."

# Check if backend is running
echo "Ì¥ç Checking backend server..."
if curl -s http://localhost:3002/health > /dev/null; then
    echo "‚úÖ Backend server is running on http://localhost:3002"
else
    echo "‚ùå Backend server is not running. Please start it with: cd ../server && npm run dev"
    exit 1
fi

# Check environment variables
echo "Ì¥ç Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo "‚úÖ .env.local file exists"
    if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env.local; then
        echo "‚úÖ Stripe publishable key is configured"
    else
        echo "‚ö†Ô∏è  Warning: Stripe publishable key not found in .env.local"
        echo "   Please add: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here"
    fi
else
    echo "‚ùå .env.local file not found. Creating template..."
    cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
EOL
    echo "Ì≥ù Created .env.local template. Please update with your actual Stripe key."
fi

# Check if frontend is running
echo "ÔøΩÔøΩ Checking frontend server..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "‚úÖ Frontend server is running on http://localhost:3001"
else
    echo "‚ùå Frontend server is not running. Starting it now..."
    npm run dev &
    echo "‚è≥ Waiting for frontend to start..."
    sleep 10
fi

echo ""
echo "ÌæØ Test Environment Ready!"
echo "========================="
echo "Ì≥± Frontend: http://localhost:3001"
echo "Ì¥ß Backend:  http://localhost:3002"
echo "Ì∑™ Test Plan: tests/stripe-integration/STRIPE_INTEGRATION_TEST.md"
echo ""
echo "Ì∫Ä Next Steps:"
echo "1. Open http://localhost:3001 in your browser"
echo "2. Login to the application"
echo "3. Navigate to /pos"
echo "4. Follow the test cases in STRIPE_INTEGRATION_TEST.md"
echo ""
echo "Ì≤° Test Cards (Stripe Test Mode):"
echo "   ‚úÖ Success: 4242 4242 4242 4242"
echo "   ‚ùå Declined: 4000 0000 0000 0002"
echo "   Ì¥ê Auth Required: 4000 0025 0000 3155"
echo ""
echo "Ìæâ Happy Testing!"
