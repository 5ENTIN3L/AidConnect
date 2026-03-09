import { Client, Databases, Query, ID, Account } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT)
  .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID);

export { client };
export const databases = new Databases(client);
export const account = new Account(client);

const DB = 'aidconnect_db';

export const appwriteService = {

  // ─── AUTH ───────────────────────────────────────────────
  login: async (email, password) => {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    localStorage.setItem('token', user.$id);
    localStorage.setItem('user', JSON.stringify({
      fullName: user.name,
      email: user.email,
      role: user.labels?.[0] || 'ngo_admin',
    }));
    return user;
  },

  logout: async () => {
    await account.deleteSession('current');
    localStorage.clear();
  },

  // ─── DASHBOARD ──────────────────────────────────────────
  getStats: async () => {
    const [beneficiaries, deliveries, requests] = await Promise.all([
      databases.listDocuments(DB, 'beneficiaries', [Query.limit(1)]),
      databases.listDocuments(DB, 'deliveries', [Query.limit(1)]),
      databases.listDocuments(DB, 'aid_requests', [Query.limit(1)]),
    ]);
    return {
      totalBeneficiaries: beneficiaries.total,
      totalDeliveries: deliveries.total,
      totalRequests: requests.total,
    };
  },

  getRecentBeneficiaries: async () => {
    return await databases.listDocuments(DB, 'beneficiaries', [
      Query.orderDesc('$createdAt'),
      Query.limit(5),
    ]);
  },

  // ─── BENEFICIARIES ──────────────────────────────────────
  getBeneficiaries: async () => {
    return await databases.listDocuments(DB, 'beneficiaries', [
      Query.orderDesc('$createdAt'),
      Query.limit(100),
    ]);
  },

  createBeneficiary: async (data) => {
    const existing = await databases.listDocuments(DB, 'beneficiaries', [
      Query.equal('uniqueId', data.uniqueId),
      Query.limit(1),
    ]);
    if (existing.total > 0) {
      throw new Error('A beneficiary with this National ID already exists.');
    }
    return await databases.createDocument(DB, 'beneficiaries', ID.unique(), {
      fullName: data.fullName,
      uniqueId: data.uniqueId,
      location: data.location,
      vulnerability: data.vulnerability,
      
    });
  },

  // ─── AID REQUESTS ───────────────────────────────────────
  getAidRequests: async () => {
    return await databases.listDocuments(DB, 'aid_requests', [
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]);
  },

  createAidRequest: async (data, beneficiaryVulnerability) => {
    const urgencyScore =     { EMERGENCY: 40, HIGH: 30, MEDIUM: 20, LOW: 10 };
    const vulnerabilityScore = { CRITICAL: 40, HIGH: 30, MEDIUM: 20, LOW: 10 };
    const priorityScore =
      (urgencyScore[data.urgency] || 0) +
      (vulnerabilityScore[beneficiaryVulnerability] || 0);

    return await databases.createDocument(DB, 'aid_requests', ID.unique(), {
      beneficiaryId: data.beneficiaryId,
      beneficiaryName: data.beneficiaryName,
      aidType: data.aidType,
      quantity: data.quantity,
      urgency: data.urgency,
      description: data.description,
      location: data.location,
      status: 'PENDING',
      priorityScore,
    });
  },

  updateAidRequestStatus: async (requestId, status) => {
    return await databases.updateDocument(DB, 'aid_requests', requestId, { status });
  },

  // ─── DELIVERIES ─────────────────────────────────────────
  getDeliveries: async () => {
    return await databases.listDocuments(DB, 'deliveries', [
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]);
  },

  updateDeliveryStatus: async (deliveryId, status) => {
    return await databases.updateDocument(DB, 'deliveries', deliveryId, {
      status,
      ...(status === 'delivered' && {
        deliveryDate: new Date().toISOString().split('T')[0],
      }),
    });
  },
};
