const sdk = require('node-appwrite');

const client = new sdk.Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') //
    .setProject('69a8a02700294b937751')             //
    .setKey('standard_a4092f86ccbf6fc6b365d1082d1d69e4886aae6367fc67bb0b7f4c64fab7b272b58db0c76c4855e15403c2b47157d4a83774ae56da3e2e1646a2db38305dff6c70385fddd3c0f2e782831351b0e2420c6e5571c51203147c02dc4200ba85161c152c97be339d1f245e65d02a86f8826c436912da7b93f919c975829c4755b893');          //

const databases = new sdk.Databases(client);

async function setup() {
    try {
        // 1. Create the Database
        await databases.create('aidconnect_db', 'AidConnect_DB');
        
        // 2. Create the Beneficiaries Collection
        await databases.createCollection('aidconnect_db', 'beneficiaries', 'Beneficiaries');

        // 3. Add Attributes matching the frontend
        await databases.createStringAttribute('aidconnect_db', 'beneficiaries', 'uniqueId', 50, true);
        await databases.createStringAttribute('aidconnect_db', 'beneficiaries', 'fullName', 100, true);
        await databases.createStringAttribute('aidconnect_db', 'beneficiaries', 'location', 255, true);
        await databases.createStringAttribute('aidconnect_db', 'beneficiaries', 'vulnerability', 50, false);

        console.log("Success: SCRUM-3 Database & Collections Initialized!");
    } catch (error) {
        console.error("Setup failed:", error.message);
    }
}

setup();