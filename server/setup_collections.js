const sdk = require('node-appwrite');
require('dotenv').config();

// Debug: confirm env vars loaded
console.log('ENDPOINT:', process.env.APPWRITE_ENDPOINT);
console.log('PROJECT:', process.env.APPWRITE_PROJECT_ID);
console.log('KEY:', process.env.APPWRITE_API_KEY ? '✅ loaded' : '❌ missing');

const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const DB = 'aidconnect_db';

async function createCollections() {
    const collections = [
        {
            id: 'aid_requests',
            name: 'Aid Requests',
            attributes: [
                { type: 'string',  key: 'beneficiaryId',   size: 36,  required: true  },
                { type: 'string',  key: 'beneficiaryName', size: 100, required: true  },
                { type: 'string',  key: 'aidType',         size: 50,  required: true  },
                { type: 'integer', key: 'quantity',                   required: true  },
                { type: 'string',  key: 'urgency',         size: 20,  required: true  },
                { type: 'string',  key: 'description',     size: 500, required: false },
                { type: 'string',  key: 'location',        size: 100, required: true  },
                { type: 'string',  key: 'status',          size: 20,  required: true  },
                { type: 'integer', key: 'priorityScore',              required: false },
            ]
        },
        {
            id: 'beneficiaries',
            name: 'Beneficiaries',
            attributes: [
                { type: 'string', key: 'fullName',      size: 100, required: true },
                { type: 'string', key: 'uniqueId',      size: 50,  required: true },
                { type: 'string', key: 'location',      size: 100, required: true },
                { type: 'string', key: 'vulnerability', size: 20,  required: true },
            ]
        },
        {
            id: 'deliveries',
            name: 'Deliveries',
            attributes: [
                { type: 'string',  key: 'beneficiaryId',   size: 36,  required: true  },
                { type: 'string',  key: 'beneficiaryName', size: 100, required: true  },
                { type: 'string',  key: 'aidType',         size: 50,  required: true  },
                { type: 'integer', key: 'quantity',                   required: true  },
                { type: 'string',  key: 'status',          size: 20,  required: true  },
                { type: 'string',  key: 'location',        size: 100, required: true  },
                { type: 'string',  key: 'deliveryDate',    size: 20,  required: false },
            ]
        }
    ];

    for (const col of collections) {
        try {
            console.log(`\n⏳ Creating '${col.id}'...`);
            await databases.createCollection(DB, col.id, col.name, [
                sdk.Permission.read(sdk.Role.users()),
                sdk.Permission.create(sdk.Role.users()),
                sdk.Permission.update(sdk.Role.users()),
                sdk.Permission.delete(sdk.Role.users()),
            ]);

            for (const attr of col.attributes) {
                try {
                    if (attr.type === 'string') {
                        await databases.createStringAttribute(
                            DB, col.id, attr.key, attr.size, attr.required
                        );
                    } else if (attr.type === 'integer') {
                        await databases.createIntegerAttribute(
                            DB, col.id, attr.key, attr.required
                        );
                    }
                    console.log(`  ✅ ${attr.key}`);
                } catch (e) {
                    if (e.code === 409) console.log(`  ℹ️  ${attr.key} already exists`);
                    else console.error(`  ❌ ${attr.key}: ${e.message}`);
                }
            }
            console.log(`✅ '${col.id}' done!`);

        } catch (e) {
            if (e.code === 409) console.log(`ℹ️  '${col.id}' already exists — skipping`);
            else console.error(`❌ '${col.id}' failed: ${e.message}`);
        }
    }
    console.log('\n🎉 Done!');
}

createCollections();