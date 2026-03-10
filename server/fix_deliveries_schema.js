const sdk = require('node-appwrite');
require('dotenv').config();

const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const DB = 'aidconnect_db';

async function fixDeliveries() {
    console.log('🗑️  Deleting old deliveries collection...');
    try {
        await databases.deleteCollection(DB, 'deliveries');
        console.log('✅ Deleted');
    } catch (e) {
        console.error('❌ Delete failed:', e.message);
        return;
    }

    // Wait for deletion to complete
    console.log('⏳ Waiting 3 seconds...');
    await new Promise(r => setTimeout(r, 3000));

    console.log('\n🏗️  Recreating deliveries collection...');
    try {
        await databases.createCollection(DB, 'deliveries', 'Deliveries', [
            sdk.Permission.read(sdk.Role.users()),
            sdk.Permission.create(sdk.Role.users()),
            sdk.Permission.update(sdk.Role.users()),
            sdk.Permission.delete(sdk.Role.users()),
        ]);
        console.log('✅ Collection created');
    } catch (e) {
        console.error('❌ Create failed:', e.message);
        return;
    }

    console.log('\n📋 Adding attributes...');
    const attributes = [
        { type: 'string',  key: 'beneficiaryId',   size: 36,  required: true  },
        { type: 'string',  key: 'beneficiaryName',  size: 100, required: false },
        { type: 'string',  key: 'aidType',          size: 50,  required: true  },
        { type: 'integer', key: 'quantity',                    required: true  },
        { type: 'string',  key: 'status',           size: 20,  required: true  },
        { type: 'string',  key: 'location',         size: 100, required: false },
        { type: 'string',  key: 'deliveryDate',     size: 20,  required: false },
    ];

    for (const attr of attributes) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(DB, 'deliveries', attr.key, attr.size, attr.required);
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(DB, 'deliveries', attr.key, attr.required);
            }
            console.log(`  ✅ ${attr.key}`);
        } catch (e) {
            console.error(`  ❌ ${attr.key}: ${e.message}`);
        }
    }

    console.log('\n⏳ Waiting 5 seconds for attributes to activate...');
    await new Promise(r => setTimeout(r, 5000));
    console.log('✅ Schema fixed! Now run: node seed_deliveries_only.js');
}

fixDeliveries();