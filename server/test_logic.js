/**
 * SCRUM-4: 30-Day Duplication Check Logic
 * This function determines if a beneficiary is eligible for a new delivery.
 */
function isEligible(lastDeliveryDate) {
    const today = new Date(); // Current date
    const last = new Date(lastDeliveryDate);
    
    // Calculate difference in milliseconds and convert to days
    const diffInMs = today - last;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    return {
        lastDelivery: lastDeliveryDate,
        eligible: diffInDays >= 30, // The 30-day business rule
        daysPassed: diffInDays,
        waitDays: diffInDays < 30 ? 30 - diffInDays : 0
    };
}

// --- TEST SUITE ---
console.log("--- AidConnect: Testing 30-Day Eligibility Logic ---");

// Test Case 1: Received aid 10 days ago (Should be BLOCKED)
console.log("Test 1 (Recent):", isEligible("2026-02-23")); 

// Test Case 2: Received aid 45 days ago (Should be ELIGIBLE)
console.log("Test 2 (Old):", isEligible("2026-01-15")); 

// Test Case 3: Received aid exactly 30 days ago (Should be ELIGIBLE)
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
console.log("Test 3 (Exact):", isEligible(thirtyDaysAgo.toISOString().split('T')[0]));