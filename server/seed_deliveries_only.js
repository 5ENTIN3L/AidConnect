const sdk = require('node-appwrite');
require('dotenv').config();

const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const DB = 'aidconnect_db';

async function seedDeliveries() {
    console.log('🌱 Seeding deliveries...');

    const deliveries = [
        { beneficiaryId: 'NID001', beneficiaryName: 'Maria Santos',  aidType: 'Food',     quantity: 10, status: 'delivered',  location: 'Nairobi', deliveryDate: '2026-03-01' },
        { beneficiaryId: 'NID002', beneficiaryName: 'John Kamau',    aidType: 'Medicine', quantity: 5,  status: 'in_transit', location: 'Mombasa' },
        { beneficiaryId: 'NID003', beneficiaryName: 'Amina Hassan',  aidType: 'Shelter',  quantity: 1,  status: 'pending',    location: 'Kisumu'  },
    ];

    for (const d of deliveries) {
        try {
            await databases.createDocument(DB, 'deliveries', sdk.ID.unique(), d);
            console.log(`  ✅ Delivery: ${d.aidType} → ${d.beneficiaryName}`);
        } catch (e) {
            console.log(`  ⚠️  Delivery failed: ${e.message}`);
        }
    }

    console.log('\n🎉 Deliveries seeded!');
}

seedDeliveries();