const sdk = require('node-appwrite');
require('dotenv').config();

console.log('ENDPOINT:', process.env.APPWRITE_ENDPOINT);
console.log('PROJECT:', process.env.APPWRITE_PROJECT_ID);
console.log('KEY:', process.env.APPWRITE_API_KEY ? '✅ loaded' : '❌ missing');

const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const DB = 'aidconnect_db';

const collections = [
    {
        id: 'beneficiaries',
        name: 'Beneficiaries',
        attributes: [
            { type: 'string',  key: 'fullName',       size: 100, required: true  },
            { type: 'string',  key: 'uniqueId',        size: 50,  required: true  },
            { type: 'string',  key: 'location',        size: 100, required: true  },
            { type: 'string',  key: 'vulnerability',   size: 20,  required: true  },
            { type: 'string',  key: 'phone',           size: 20,  required: false },
            { type: 'string',  key: 'notes',           size: 500, required: false },
            { type: 'integer', key: 'householdSize',             required: false }, // ← ADD
        ],
        indexes: [
            { key: 'uniqueId_idx',   type: 'unique',   attributes: ['uniqueId']   },
            { key: 'location_idx',   type: 'key',      attributes: ['location']   },
            { key: 'vulnerability_idx', type: 'key',   attributes: ['vulnerability'] },
        ]
    },
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
        ],
        indexes: [
            { key: 'status_idx',        type: 'key',   attributes: ['status']        },
            { key: 'beneficiaryId_idx', type: 'key',   attributes: ['beneficiaryId'] },
            { key: 'urgency_idx',       type: 'key',   attributes: ['urgency']       },
            { key: 'priorityScore_idx', type: 'key',   attributes: ['priorityScore'] },
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
            { type: 'string',  key: 'notes',           size: 500, required: false },
        ],
        indexes: [
            { key: 'status_idx',        type: 'key',   attributes: ['status']        },
            { key: 'beneficiaryId_idx', type: 'key',   attributes: ['beneficiaryId'] },
            { key: 'deliveryDate_idx',  type: 'key',   attributes: ['deliveryDate']  },
        ]
    }
];

// ── Helpers ────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function createAttribute(colId, attr) {
    try {
        if (attr.type === 'string') {
            await databases.createStringAttribute(DB, colId, attr.key, attr.size, attr.required);
        } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(DB, colId, attr.key, attr.required);
        }
        console.log(`    ✅ attribute: ${attr.key}`);
    } catch (e) {
        if (e.code === 409) console.log(`    ℹ️  attribute '${attr.key}' already exists`);
        else console.error(`    ❌ attribute '${attr.key}': ${e.message}`);
    }
}

async function createIndex(colId, index) {
    try {
        // Appwrite needs attributes to be ready before indexing — small delay
        await sleep(1500);
        await databases.createIndex(DB, colId, index.key, index.type, index.attributes);
        console.log(`    ✅ index: ${index.key}`);
    } catch (e) {
        if (e.code === 409) console.log(`    ℹ️  index '${index.key}' already exists`);
        else console.error(`    ❌ index '${index.key}': ${e.message}`);
    }
}

// ── Main ───────────────────────────────────────────────────────
async function setupCollections() {
    for (const col of collections) {
        console.log(`\n⏳ Processing '${col.id}'...`);

        // Create collection
        try {
            await databases.createCollection(DB, col.id, col.name, [
                sdk.Permission.read(sdk.Role.users()),
                sdk.Permission.create(sdk.Role.users()),
                sdk.Permission.update(sdk.Role.users()),
                sdk.Permission.delete(sdk.Role.label('admin')), // only admins can delete
            ]);
            console.log(`  ✅ Collection '${col.id}' created`);
        } catch (e) {
            if (e.code === 409) console.log(`  ℹ️  Collection '${col.id}' already exists — updating attributes & indexes`);
            else { console.error(`  ❌ '${col.id}': ${e.message}`); continue; }
        }

        // Create attributes
        console.log(`  📝 Creating attributes...`);
        for (const attr of col.attributes) {
            await createAttribute(col.id, attr);
        }

        // Wait for Appwrite to process attributes before creating indexes
        console.log(`  ⏳ Waiting for attributes to be ready...`);
        await sleep(3000);

        // Create indexes
        console.log(`  🔍 Creating indexes...`);
        for (const index of col.indexes) {
            await createIndex(col.id, index);
        }

        console.log(`  ✅ '${col.id}' complete!`);
    }

    console.log('\n🎉 Database schema setup complete!');
}

async function setupRelationships() {
    console.log('\n⏳ Setting up relationships...');

    const relationships = [
        {
            // aid_requests.beneficiaryId → beneficiaries.$id
            collectionId: 'aid_requests',
            relatedCollectionId: 'beneficiaries',
            type: sdk.RelationshipType.ManyToOne,
            twoWay: true,
            key: 'beneficiary',
            twoWayKey: 'aidRequests',
            onDelete: sdk.RelationMutate.Restrict, // can't delete beneficiary with active requests
        },
        {
            // deliveries.beneficiaryId → beneficiaries.$id
            collectionId: 'deliveries',
            relatedCollectionId: 'beneficiaries',
            type: sdk.RelationshipType.ManyToOne,
            twoWay: true,
            key: 'beneficiary',
            twoWayKey: 'deliveries',
            onDelete: sdk.RelationMutate.Restrict, // can't delete beneficiary with deliveries
        },
    ];

    for (const rel of relationships) {
        try {
            await databases.createRelationshipAttribute(
                DB,
                rel.collectionId,
                rel.relatedCollectionId,
                rel.type,
                rel.twoWay,
                rel.key,
                rel.twoWayKey,
                rel.onDelete,
            );
            console.log(`  ✅ ${rel.collectionId} → ${rel.relatedCollectionId}`);
        } catch (e) {
            if (e.code === 409) console.log(`  ℹ️  Relationship already exists`);
            else console.error(`  ❌ ${rel.collectionId}: ${e.message}`);
        }
    }

    console.log('✅ Relationships done!');
}

// Update main function to call both
async function main() {
    await setupCollections();
    await setupRelationships();
}

main();