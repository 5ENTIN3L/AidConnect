const sdk = require('node-appwrite');
require('dotenv').config();

const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const DB = 'aidconnect_db';

async function fix() {
    console.log('🔧 Fixing deliveries collection...');

    try {
        await databases.createStringAttribute(DB, 'deliveries', 'beneficiaryName', 100, false);
        console.log('✅ Added beneficiaryName');
    } catch (e) {
        if (e.code === 409) console.log('ℹ️  beneficiaryName already exists');
        else console.error('❌ beneficiaryName:', e.message);
    }

    try {
        await databases.createStringAttribute(DB, 'deliveries', 'deliveryDate', 20, false);
        console.log('✅ Added deliveryDate (optional)');
    } catch (e) {
        if (e.code === 409) console.log('ℹ️  deliveryDate already exists');
        else console.error('❌ deliveryDate:', e.message);
    }

    console.log('\n⏳ Waiting for attributes to activate (5 seconds)...');
    await new Promise(r => setTimeout(r, 5000));
    console.log('✅ Done!');
}

fix();