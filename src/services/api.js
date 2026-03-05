import { Client, Databases, Query, ID } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT) 
    .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID);
    
export const databases = new Databases(client);

export const appwriteService = {
    // Fetch total count of beneficiaries
    getStats: async () => {
        const beneficiaries = await databases.listDocuments(
            'aidconnect_db', 
            'beneficiaries', 
            [Query.limit(1)] 
        );
        const deliveries = await databases.listDocuments(
            'aidconnect_db', 
            'deliveries', 
            [Query.limit(1)]
        );
        
        return {
            totalBeneficiaries: beneficiaries.total,
            totalDeliveries: deliveries.total
        };
    },

    // Fetch recent beneficiaries for the table
    getRecentBeneficiaries: async () => {
        return await databases.listDocuments(
            'aidconnect_db',
            'beneficiaries',
            [Query.orderDesc('$createdAt'), Query.limit(5)]
        );
    },

    // Create a new beneficiary
    createBeneficiary: async (data) => {
        try {
          // Check if National ID already exists
          const existing = await databases.listDocuments(
              'aidconnect_db',
              'beneficiaries',
              [Query.equal('uniqueId', data.uniqueId), Query.limit(1)]
          );

          if (existing.total > 0) {
              // If a record is found, throw an error to prevent duplicate entry
              throw new Error("Beneficiary with this National ID already exists.");
          }
        // If no duplicate is found, proceed to create the new beneficiary
        return await databases.createDocument(
            'aidconnect_db', // Database ID
            'beneficiaries',  // Collection ID
            ID.unique(),      // Use ID.unique() from the SDK
            {
                fullName: data.fullName,
                uniqueId: data.uniqueId, // National ID
                location: data.location,
                phone: data.phone,
                gender: data.gender
            }
        );
        } catch (error) {
            console.error("Error creating beneficiary:", error.message);
            throw error; // Re-throw the error to be handled by the caller (UI)
        }
    }

};