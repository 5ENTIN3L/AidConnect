import { Client, Databases, Query, ID, Account } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT)
  .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID);

export { client };
export const databases = new Databases(client);
export const account = new Account(client);

const DB = 'aidconnect_db';

export const appwriteService = {

  // ─── AUTH ───────────────────────────────────────────────────
  login: async (email, password) => {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    // ← Removed localStorage — AuthContext handles session now
    return user;
  },

  logout: async () => {
    await account.deleteSession('current');
    // ← Removed localStorage.clear() — AuthContext handles this
  },

  // ─── DASHBOARD ──────────────────────────────────────────────
  getStats: async () => {
    const [beneficiaries, deliveries, requests] = await Promise.all([
      databases.listDocuments(DB, 'beneficiaries', [Query.limit(1)]),
      databases.listDocuments(DB, 'deliveries',    [Query.limit(1)]),
      databases.listDocuments(DB, 'aid_requests',  [Query.limit(1)]),
    ]);
    return {
      totalBeneficiaries: beneficiaries.total,
      totalDeliveries:    deliveries.total,
      totalRequests:      requests.total,
    };
  },

  getRecentBeneficiaries: async () => {
    return await databases.listDocuments(DB, 'beneficiaries', [
      Query.orderDesc('$createdAt'),
      Query.limit(5),
    ]);
  },

  // ─── BENEFICIARIES ──────────────────────────────────────────
  getBeneficiaries: async () => {
    return await databases.listDocuments(DB, 'beneficiaries', [
      Query.orderDesc('$createdAt'),
      Query.limit(100),
    ]);
  },

  createBeneficiary: async (data) => {
    // ── Validate required fields ────────────────────────────
    if (!data.fullName?.trim())     throw new Error('Full name is required.');
    if (!data.uniqueId?.trim())     throw new Error('National ID is required.');
    if (!data.location?.trim())     throw new Error('Location is required.');
    if (!data.vulnerability)        throw new Error('Vulnerability level is required.');
    const householdSize = parseInt(data.householdSize);
    if (!data.householdSize || Number.isNaN(householdSize) || householdSize < 1)
                                    throw new Error('Household size must be at least 1.');

    // ── Check duplicate National ID ─────────────────────────
    const existing = await databases.listDocuments(DB, 'beneficiaries', [
      Query.equal('uniqueId', data.uniqueId.trim()),
      Query.limit(1),
    ]);
    if (existing.total > 0) {
      throw new Error('A beneficiary with this National ID already exists.');
    }

    return await databases.createDocument(DB, 'beneficiaries', ID.unique(), {
      fullName:       data.fullName.trim(),
      uniqueId:       data.uniqueId.trim(),
      location:       data.location.trim(),
      vulnerability:  data.vulnerability,
      householdSize:  householdSize,
      phone:          data.phone?.trim() || null,
      notes:          data.notes?.trim() || null,
    });
  },

  updateBeneficiary: async (id, data) => {
    const updatedFields = {
      fullName:      data.fullName?.trim(),
      location:      data.location?.trim(),
      vulnerability: data.vulnerability,
      phone:         data.phone?.trim() || null,
      notes:         data.notes?.trim() || null,
    };
    if (data.householdSize !== undefined) {
      const householdSize = parseInt(data.householdSize);
      if (Number.isNaN(householdSize) || householdSize < 1) {
        throw new Error('Household size must be at least 1.');
      }
      updatedFields.householdSize = householdSize;
    }
    return await databases.updateDocument(DB, 'beneficiaries', id, updatedFields);
  },

  deleteBeneficiary: async (id) => {
    // ── Check for active requests before deleting ───────────
    const activeRequests = await databases.listDocuments(DB, 'aid_requests', [
      Query.equal('beneficiaryId', id),
      Query.notEqual('status', 'REJECTED'),
      Query.notEqual('status', 'COMPLETED'),
      Query.limit(1),
    ]);
    if (activeRequests.total > 0) {
      throw new Error('Cannot delete beneficiary with active aid requests. Resolve all requests first.');
    }

    // ── Check for active deliveries ─────────────────────────
    const activeDeliveries = await databases.listDocuments(DB, 'deliveries', [
      Query.equal('beneficiaryId', id),
      Query.notEqual('status', 'delivered'),
      Query.limit(1),
    ]);
    if (activeDeliveries.total > 0) {
      throw new Error('Cannot delete beneficiary with pending deliveries. Complete all deliveries first.');
    }

    return await databases.deleteDocument(DB, 'beneficiaries', id);
  },

  // ─── AID REQUESTS ───────────────────────────────────────────
  getAidRequests: async () => {
    return await databases.listDocuments(DB, 'aid_requests', [
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]);
  },

  createAidRequest: async (data, beneficiaryVulnerability) => {
    // ── Validate beneficiary exists ─────────────────────────
    if (!data.beneficiaryId) throw new Error('Beneficiary is required.');
    try {
      await databases.getDocument(DB, 'beneficiaries', data.beneficiaryId);
    } catch {
      throw new Error('Selected beneficiary does not exist.');
    }

    // ── Validate required fields ────────────────────────────
    if (!data.aidType)   throw new Error('Aid type is required.');
    if (!data.urgency)   throw new Error('Urgency level is required.');
    if (!data.quantity)  throw new Error('Quantity is required.');
    if (!data.location)  throw new Error('Location is required.');

    const urgencyScore       = { EMERGENCY: 40, HIGH: 30, MEDIUM: 20, LOW: 10 };
    const vulnerabilityScore = { CRITICAL:  40, HIGH: 30, MEDIUM: 20, LOW: 10 };
    const priorityScore =
      (urgencyScore[data.urgency]                 || 0) +
      (vulnerabilityScore[beneficiaryVulnerability] || 0);

    return await databases.createDocument(DB, 'aid_requests', ID.unique(), {
      beneficiaryId:   data.beneficiaryId,
      beneficiaryName: data.beneficiaryName,
      aidType:         data.aidType,
      quantity:        parseInt(data.quantity) || 0,
      urgency:         data.urgency,
      description:     data.description || '',
      location:        data.location,
      status:          'PENDING',
      priorityScore,
    });
  },

  updateAidRequestStatus: async (requestId, status) => {
    const validStatuses = ['PENDING', 'APPROVED', 'ALLOCATED', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    return await databases.updateDocument(DB, 'aid_requests', requestId, { status });
  },

  // ─── DELIVERIES ─────────────────────────────────────────────
  getDeliveries: async () => {
    return await databases.listDocuments(DB, 'deliveries', [
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]);
  },

  createDelivery: async (data) => {
    // ── Validate beneficiary exists ─────────────────────────
    if (!data.beneficiaryId) throw new Error('Beneficiary is required.');
    try {
      await databases.getDocument(DB, 'beneficiaries', data.beneficiaryId);
    } catch {
      throw new Error('Selected beneficiary does not exist.');
    }

    return await databases.createDocument(DB, 'deliveries', ID.unique(), {
      beneficiaryId:   data.beneficiaryId,
      beneficiaryName: data.beneficiaryName,
      aidType:         data.aidType,
      quantity:        parseInt(data.quantity) || 0,
      status:          'scheduled',
      location:        data.location,
      deliveryDate:    data.deliveryDate || null,
      notes:           data.notes || null,
    });
  },

  updateDeliveryStatus: async (deliveryId, status) => {
    const validStatuses = ['scheduled', 'in_progress', 'delivered', 'failed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    return await databases.updateDocument(DB, 'deliveries', deliveryId, {
      status,
      ...(status === 'delivered' && {
        deliveryDate: new Date().toISOString().split('T')[0],
      }),
    });
  },
};
