const sdk = require('node-appwrite');
require('dotenv').config({ path: '../.env' }); //

const client = new sdk.Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); //

const databases = new sdk.Databases(client);
const { Query } = sdk;

async function verifyEligibility(beneficiaryId) {
    try {
        console.log(`\n Checking Cloud Records for: ${beneficiaryId}...`);
        
        // 1. Fetch the most recent delivery from the Cloud
        const response = await databases.listDocuments(
            'aidconnect_db',
            'deliveries',
            [
                Query.equal('beneficiaryId', beneficiaryId),
                Query.orderDesc('deliveryDate'),
                Query.limit(1)
            ]
        );

        if (response.total === 0) {
            console.log("ELIGIBLE: No records found in the cloud.");
            return;
        }

        // 2. Apply your 30-Day Logic
        const lastDate = new Date(response.documents[0].deliveryDate);
        const today = new Date();
        const diffInDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffInDays < 30) {
            console.log(`BLOCKED: Last aid was ${diffInDays} days ago. Wait ${30 - diffInDays} more days.`);
        } else {
            console.log(`ELIGIBLE: Last aid was ${diffInDays} days ago.`);
        }

    } catch (error) {
        console.error("Verification failed:", error.message);
    }
}

// Test against your seeded data
async function runTests() {
    await verifyEligibility('BEN-002'); // Should be BLOCKED (~10 days ago)
    await verifyEligibility('BEN-001'); // Should be ELIGIBLE (~45 days ago)
    await verifyEligibility('NEW-USER'); // Should be ELIGIBLE (No records)
}

runTests();