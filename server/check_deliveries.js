const sdk = require('node-appwrite');
require('dotenv').config();

const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const DB = 'aidconnect_db';

async function check() {
    const collection = await databases.getCollection(DB, 'deliveries');
    console.log('\n📋 Deliveries Collection Attributes:');
    collection.attributes.forEach(attr => {
        console.log(`  - ${attr.key} | type: ${attr.type} | required: ${attr.required}`);
    });
}

check();