const sdk = require('node-appwrite');
require('dotenv').config({ path: '../.env' }); // Loads your keys from the root .env

const client = new sdk.Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

async function setupDeliveries() {
    try {
        // 1. Create the Deliveries Collection
        await databases.createCollection('aidconnect_db', 'deliveries', 'Deliveries');

        // 2. Add Attributes for the 30-day logic
        await databases.createStringAttribute('aidconnect_db', 'deliveries', 'beneficiaryId', 50, true);
        await databases.createDatetimeAttribute('aidconnect_db', 'deliveries', 'deliveryDate', true);
        await databases.createStringAttribute('aidconnect_db', 'deliveries', 'aidType', 100, true);
        await databases.createStringAttribute('aidconnect_db', 'deliveries', 'status', 20, true); // e.g., "delivered"

        console.log("Success: Deliveries collection initialized for SCRUM-4!");
    } catch (error) {
        console.error("Setup failed:", error.message);
    }
}

setupDeliveries();