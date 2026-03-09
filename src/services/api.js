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

    // Get real-time dashboard statistics
    getDashboardStats: async () => {
        try {
            const beneficiaries = await databases.listDocuments(
                'aidconnect_db',
                'beneficiaries',
                [Query.limit(1)]
            );
            
            const allDeliveries = await databases.listDocuments(
                'aidconnect_db',
                'deliveries',
                [Query.limit(1)]
            );
            
            const completedDeliveries = await databases.listDocuments(
                'aidconnect_db',
                'deliveries',
                [Query.equal('status', 'delivered'), Query.limit(1)]
            );
            
            return {
                totalBeneficiaries: beneficiaries.total,
                totalDeliveries: allDeliveries.total,
                completedDeliveries: completedDeliveries.total
            };
        } catch (error) {
            console.error("Error fetching dashboard stats:", error.message);
            throw new Error("Failed to load dashboard statistics. Please try again.");
        }
    },

    // Verify eligibility based on 30-day rule
    verifyEligibility: async (nationalId) => {
        try {
            // Find the beneficiary by National ID
            const beneficiary = await databases.listDocuments(
                'aidconnect_db',
                'beneficiaries',
                [Query.equal('uniqueId', nationalId), Query.limit(1)]
            );

            if (beneficiary.total === 0) {
                return {
                    eligible: false,
                    reason: 'Beneficiary not found',
                    beneficiary: null
                };
            }

            const beneficiaryData = beneficiary.documents[0];

            // Get most recent delivery for this beneficiary
            const recentDeliveries = await databases.listDocuments(
                'aidconnect_db',
                'deliveries',
                [
                    Query.equal('beneficiaryId', beneficiaryData.uniqueId),
                    Query.orderDesc('deliveryDate'),
                    Query.limit(1)
                ]
            );

            // If no previous deliveries, they are eligible
            if (recentDeliveries.total === 0) {
                return {
                    eligible: true,
                    reason: 'No previous deliveries',
                    beneficiary: beneficiaryData,
                    daysSinceLastDelivery: null
                };
            }

            // Calculate days since last delivery
            const lastDelivery = recentDeliveries.documents[0];
            const lastDeliveryDate = new Date(lastDelivery.deliveryDate);
            const today = new Date();
            const daysSinceLastDelivery = Math.floor(
                (today.getTime() - lastDeliveryDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            const daysRemaining = 30 - daysSinceLastDelivery;

            if (daysSinceLastDelivery >= 30) {
                return {
                    eligible: true,
                    reason: 'Eligible for new delivery',
                    beneficiary: beneficiaryData,
                    daysSinceLastDelivery: daysSinceLastDelivery,
                    lastDeliveryDate: lastDeliveryDate
                };
            } else {
                return {
                    eligible: false,
                    reason: `Must wait ${daysRemaining} more days`,
                    beneficiary: beneficiaryData,
                    daysSinceLastDelivery: daysSinceLastDelivery,
                    daysRemaining: daysRemaining,
                    lastDeliveryDate: lastDeliveryDate
                };
            }
        } catch (error) {
            console.error("Error verifying eligibility:", error.message);
            throw new Error("Failed to verify eligibility. Please try again.");
        }
    },

    // Register a new delivery
    registerDelivery: async (deliveryData) => {
        try {
            // First verify eligibility
            const eligibility = await appwriteService.verifyEligibility(deliveryData.beneficiaryId);

            if (!eligibility.eligible) {
                throw new Error(eligibility.reason);
            }

            // Create the delivery document
            const delivery = await databases.createDocument(
                'aidconnect_db',
                'deliveries',
                ID.unique(),
                {
                    beneficiaryId: deliveryData.beneficiaryId,
                    aidType: deliveryData.aidType,
                    deliveryDate: deliveryData.deliveryDate || new Date().toISOString(),
                    status: deliveryData.status || 'delivered'
                }
            );

            return {
                success: true,
                delivery: delivery,
                message: 'Delivery registered successfully'
            };
        } catch (error) {
            console.error("Error registering delivery:", error.message);
            throw error;
        }
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