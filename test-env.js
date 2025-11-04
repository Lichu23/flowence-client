// Load environment variables
import 'dotenv/config';

// Test environment variables
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Test the API URL construction
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
console.log('Final API_URL:', API_URL);

// Test endpoint construction
const storeId = 'ce8ecfd9-f0e1-457f-8fbb-2a69ca12b0d7';
const endpoint = `/api/stores/${storeId}/payments/confirm`;
const fullUrl = `${API_URL}${endpoint}`;
console.log('Full payment URL:', fullUrl);
