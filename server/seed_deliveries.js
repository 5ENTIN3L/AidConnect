const sdk = require('node-appwrite');
require('dotenv').config({ path: '../.env' }); //

const client = new sdk.Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); //

const databases = new sdk.Databases(client);

async function seed() {
    try {
        const testData = [
            // Case 1: Received aid 45 days ago (Should be ELIGIBLE)
            { beneficiaryId: 'BEN-001', deliveryDate: '2026-01-15', aidType: 'Food Basket', status: 'delivered' },
            // Case 2: Received aid 10 days ago (Should be BLOCKED)
            { beneficiaryId: 'BEN-002', deliveryDate: '2026-02-23', aidType: 'Medical Kit', status: 'delivered' },
            // Case 3: New beneficiary (No records yet - Should be ELIGIBLE)
            { beneficiaryId: 'BEN-003', deliveryDate: '2025-12-01', aidType: 'Educational Supplies', status: 'delivered' }
        ];

        for (const record of testData) {
            await databases.createDocument(
                'aidconnect_db', 
                'deliveries', 
                sdk.ID.unique(), 
                record
            );
            console.log(`Seeded record for: ${record.beneficiaryId}`);
        }
        console.log("All test data successfully injected into Appwrite!");
    } catch (error) {
        console.error("Seeding failed:", error.message);
    }
}

seed();