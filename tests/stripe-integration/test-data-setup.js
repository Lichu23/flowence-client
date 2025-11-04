/**
 * í·ª Stripe Integration Test Data Setup
 * Sprint 3.3 - Sales Processing Part 2
 * 
 * This script helps set up test data for Stripe integration testing
 */

// Test products for Stripe integration testing
const testProducts = [
  {
    name: "Test Product 1 - Stripe Card",
    barcode: "STRIPE001",
    price: 15.99,
    cost: 10.00,
    stock_venta: 50,
    stock_deposito: 100,
    category: "Test Category",
    description: "Test product for Stripe card payment testing"
  },
  {
    name: "Test Product 2 - Stripe Card",
    barcode: "STRIPE002", 
    price: 25.50,
    cost: 15.00,
    stock_venta: 30,
    stock_deposito: 75,
    category: "Test Category",
    description: "Another test product for Stripe testing"
  },
  {
    name: "Test Product 3 - Stripe Card",
    barcode: "STRIPE003",
    price: 8.75,
    cost: 5.00,
    stock_venta: 100,
    stock_deposito: 200,
    category: "Test Category", 
    description: "Low-cost test product for Stripe testing"
  }
];

// Test scenarios for different payment amounts
const testScenarios = [
  {
    name: "Small Purchase",
    products: ["STRIPE001"],
    expectedTotal: 15.99,
    description: "Single item purchase for basic card testing"
  },
  {
    name: "Medium Purchase", 
    products: ["STRIPE001", "STRIPE002"],
    expectedTotal: 41.49,
    description: "Multiple items for comprehensive testing"
  },
  {
    name: "Large Purchase",
    products: ["STRIPE001", "STRIPE002", "STRIPE003"],
    expectedTotal: 50.24,
    description: "Full cart for complete payment flow testing"
  }
];

// Stripe test card scenarios
const stripeTestCards = [
  {
    name: "Successful Payment",
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/25",
    cvc: "123",
    expectedResult: "success",
    description: "Standard successful test card"
  },
  {
    name: "Declined Payment",
    cardNumber: "4000 0000 0000 0002", 
    expiry: "12/25",
    cvc: "123",
    expectedResult: "declined",
    description: "Card that will be declined by Stripe"
  },
  {
    name: "Authentication Required",
    cardNumber: "4000 0025 0000 3155",
    expiry: "12/25", 
    cvc: "123",
    expectedResult: "authentication_required",
    description: "Card requiring 3D Secure authentication"
  },
  {
    name: "Invalid Card",
    cardNumber: "1234 5678 9012 3456",
    expiry: "12/25",
    cvc: "123", 
    expectedResult: "invalid",
    description: "Invalid card number for validation testing"
  }
];

// Test execution checklist
const testChecklist = [
  "âœ… Backend server running on http://localhost:3002",
  "âœ… Frontend server running on http://localhost:3001", 
  "âœ… Stripe publishable key configured in .env.local",
  "âœ… User logged in with store access",
  "âœ… Test products available in inventory",
  "âœ… Browser developer tools open for network monitoring",
  "âœ… Test plan document open for reference"
];

// Console output for test setup
console.log("í·ª Stripe Integration Test Data Setup");
console.log("=====================================");
console.log("");
console.log("í³‹ Test Products Available:");
testProducts.forEach((product, index) => {
  console.log(`${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock_venta})`);
});
console.log("");
console.log("í¾¯ Test Scenarios:");
testScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}: $${scenario.expectedTotal} - ${scenario.description}`);
});
console.log("");
console.log("í²³ Stripe Test Cards:");
stripeTestCards.forEach((card, index) => {
  console.log(`${index + 1}. ${card.name}: ${card.cardNumber} - ${card.description}`);
});
console.log("");
console.log("âœ… Pre-Test Checklist:");
testChecklist.forEach(item => console.log(item));
console.log("");
console.log("íº€ Ready to start testing!");
console.log("í³– Follow the test cases in STRIPE_INTEGRATION_TEST.md");

// Export for potential use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testProducts,
    testScenarios, 
    stripeTestCards,
    testChecklist
  };
}
