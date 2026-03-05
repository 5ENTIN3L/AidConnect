const sdk = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

const client = new sdk.Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const { Query } = sdk;

async function checkEligibility(uniqueId) {
    try {
        const now = new Date();
        
        // Find the most recent delivery for this ID
        const response = await databases.listDocuments(
            'aidconnect_db',
            'deliveries',
            [
                Query.equal('beneficiaryId', uniqueId),
                Query.orderDesc('deliveryDate'),
                Query.limit(1)
            ]
        );

        if (response.total === 0) {
            console.log("ELIGIBLE: No prior delivery found.");
            return true;
        }

        const lastDelivery = new Date(response.documents[0].deliveryDate);
        const diffTime = Math.abs(now - lastDelivery);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            console.log(`BLOCKED: Last aid was ${diffDays} days ago. Wait ${30 - diffDays} more days.`);
            return false;
        }

        console.log(`ELIGIBLE: Last aid was ${diffDays} days ago.`);
        return true;

    } catch (error) {
        console.error("Error checking eligibility:", error.message);
    }
}

// Test it with a dummy ID
checkEligibility('BEN-2024-001');