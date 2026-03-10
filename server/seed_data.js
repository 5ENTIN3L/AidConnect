const sdk = require('node-appwrite');
require('dotenv').config();

const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const DB = 'aidconnect_db';

async function seed() {
    console.log('🌱 Seeding data...');

    // Beneficiaries
    const beneficiaries = [
        { fullName: 'Maria Santos',  uniqueId: 'NID001', location: 'Nairobi',  vulnerability: 'HIGH'     },
        { fullName: 'John Kamau',    uniqueId: 'NID002', location: 'Mombasa',  vulnerability: 'CRITICAL' },
        { fullName: 'Amina Hassan',  uniqueId: 'NID003', location: 'Kisumu',   vulnerability: 'MEDIUM'   },
        { fullName: 'Peter Ochieng', uniqueId: 'NID004', location: 'Nakuru',   vulnerability: 'LOW'      },
        { fullName: 'Grace Wanjiku', uniqueId: 'NID005', location: 'Eldoret',  vulnerability: 'HIGH'     },
    ];

    const createdBeneficiaries = [];
    for (const b of beneficiaries) {
        try {
            const doc = await databases.createDocument(DB, 'beneficiaries', sdk.ID.unique(), b);
            createdBeneficiaries.push(doc);
            console.log(`  ✅ Beneficiary: ${b.fullName}`);
        } catch (e) {
            console.log(`  ⚠️  ${b.fullName}: ${e.message}`);
        }
    }

    // Aid Requests
    const requests = [
        { beneficiaryId: createdBeneficiaries[0]?.$id, beneficiaryName: 'Maria Santos',  aidType: 'Food',     quantity: 10, urgency: 'HIGH',      location: 'Nairobi', status: 'PENDING',  priorityScore: 60, description: 'Monthly food package' },
        { beneficiaryId: createdBeneficiaries[1]?.$id, beneficiaryName: 'John Kamau',    aidType: 'Medicine', quantity: 5,  urgency: 'EMERGENCY',  location: 'Mombasa', status: 'APPROVED', priorityScore: 80, description: 'Urgent medication'    },
        { beneficiaryId: createdBeneficiaries[2]?.$id, beneficiaryName: 'Amina Hassan',  aidType: 'Shelter',  quantity: 1,  urgency: 'MEDIUM',     location: 'Kisumu',  status: 'PENDING',  priorityScore: 40, description: 'Temporary shelter'    },
        { beneficiaryId: createdBeneficiaries[3]?.$id, beneficiaryName: 'Peter Ochieng', aidType: 'Clothing', quantity: 3,  urgency: 'LOW',        location: 'Nakuru',  status: 'PENDING',  priorityScore: 20, description: 'Winter clothing'      },
        { beneficiaryId: createdBeneficiaries[4]?.$id, beneficiaryName: 'Grace Wanjiku', aidType: 'Food',     quantity: 8,  urgency: 'HIGH',       location: 'Eldoret', status: 'APPROVED', priorityScore: 60, description: 'Weekly food supply'   },
    ];

    for (const r of requests) {
        if (!r.beneficiaryId) continue;
        try {
            await databases.createDocument(DB, 'aid_requests', sdk.ID.unique(), r);
            console.log(`  ✅ Request: ${r.aidType} for ${r.beneficiaryName}`);
        } catch (e) {
            console.log(`  ⚠️  Request failed: ${e.message}`);
        }
    }

    // Deliveries
    const deliveries = [
        { beneficiaryId: createdBeneficiaries[0]?.$id, beneficiaryName: 'Maria Santos',  aidType: 'Food',     quantity: 10, status: 'delivered',  location: 'Nairobi', deliveryDate: '2026-03-01' },
        { beneficiaryId: createdBeneficiaries[1]?.$id, beneficiaryName: 'John Kamau',    aidType: 'Medicine', quantity: 5,  status: 'in_transit', location: 'Mombasa', deliveryDate: null         },
        { beneficiaryId: createdBeneficiaries[2]?.$id, beneficiaryName: 'Amina Hassan',  aidType: 'Shelter',  quantity: 1,  status: 'pending',    location: 'Kisumu',  deliveryDate: null         },
    ];

    for (const d of deliveries) {
        if (!d.beneficiaryId) continue;
        try {
            const data = { ...d };
            if (!data.deliveryDate) delete data.deliveryDate;
            await databases.createDocument(DB, 'deliveries', sdk.ID.unique(), data);
            console.log(`  ✅ Delivery: ${d.aidType} → ${d.beneficiaryName}`);
        } catch (e) {
            console.log(`  ⚠️  Delivery failed: ${e.message}`);
        }
    }

    console.log('\n🎉 Seeding complete!');
}

seed();