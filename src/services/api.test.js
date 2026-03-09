// Mock Appwrite SDK before importing anything
jest.mock('appwrite', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      setEndpoint: jest.fn().mockReturnThis(),
      setProject: jest.fn().mockReturnThis(),
    })),
    Databases: jest.fn().mockImplementation(() => ({
      listDocuments: jest.fn(),
      createDocument: jest.fn(),
    })),
    Query: {
      limit: jest.fn((limit) => `limit_${limit}`),
      equal: jest.fn((field, value) => `equal_${field}_${value}`),
      orderDesc: jest.fn((field) => `orderDesc_${field}`),
    },
    ID: {
      unique: jest.fn(() => 'unique-id-123'),
    },
  };
});

// eslint-disable-next-line import/first
import { appwriteService, databases } from './api';

describe('AidConnect Service Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    test('returns correct statistics from database', async () => {
      // Mock responses
      databases.listDocuments
        .mockResolvedValueOnce({ total: 150 }) // beneficiaries
        .mockResolvedValueOnce({ total: 320 }) // all deliveries
        .mockResolvedValueOnce({ total: 280 }); // completed deliveries

      const stats = await appwriteService.getDashboardStats();

      expect(stats).toEqual({
        totalBeneficiaries: 150,
        totalDeliveries: 320,
        completedDeliveries: 280,
      });
      expect(databases.listDocuments).toHaveBeenCalledTimes(3);
    });

    test('throws error when database query fails', async () => {
      databases.listDocuments.mockRejectedValue(new Error('Database error'));

      await expect(appwriteService.getDashboardStats()).rejects.toThrow(
        'Failed to load dashboard statistics'
      );
    });
  });

  describe('verifyEligibility - 30-Day Rule', () => {
    test('returns eligible when beneficiary has no previous deliveries', async () => {
      const mockBeneficiary = {
        uniqueId: 'BEN-001',
        fullName: 'Jane Kamau',
        location: 'Kibera',
      };

      databases.listDocuments
        .mockResolvedValueOnce({ 
          total: 1, 
          documents: [mockBeneficiary] 
        }) // beneficiary found
        .mockResolvedValueOnce({ 
          total: 0, 
          documents: [] 
        }); // no deliveries

      const result = await appwriteService.verifyEligibility('BEN-001');

      expect(result.eligible).toBe(true);
      expect(result.reason).toBe('No previous deliveries');
      expect(result.beneficiary).toEqual(mockBeneficiary);
      expect(result.daysSinceLastDelivery).toBeNull();
    });

    test('returns eligible when last delivery was 30+ days ago', async () => {
      const mockBeneficiary = {
        uniqueId: 'BEN-002',
        fullName: 'John Omondi',
        location: 'Mathare',
      };

      const thirtyFiveDaysAgo = new Date();
      thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

      databases.listDocuments
        .mockResolvedValueOnce({ 
          total: 1, 
          documents: [mockBeneficiary] 
        })
        .mockResolvedValueOnce({ 
          total: 1,
          documents: [{
            beneficiaryId: 'BEN-002',
            deliveryDate: thirtyFiveDaysAgo.toISOString(),
          }]
        });

      const result = await appwriteService.verifyEligibility('BEN-002');

      expect(result.eligible).toBe(true);
      expect(result.reason).toBe('Eligible for new delivery');
      expect(result.daysSinceLastDelivery).toBeGreaterThanOrEqual(35);
    });

    test('returns ineligible when last delivery was within 30 days', async () => {
      const mockBeneficiary = {
        uniqueId: 'BEN-003',
        fullName: 'Mary Wanjiru',
        location: 'Kawangware',
      };

      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      databases.listDocuments
        .mockResolvedValueOnce({ 
          total: 1, 
          documents: [mockBeneficiary] 
        })
        .mockResolvedValueOnce({ 
          total: 1,
          documents: [{
            beneficiaryId: 'BEN-003',
            deliveryDate: tenDaysAgo.toISOString(),
          }]
        });

      const result = await appwriteService.verifyEligibility('BEN-003');

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('Must wait');
      expect(result.reason).toContain('more days');
      expect(result.daysRemaining).toBe(20);
      expect(result.daysSinceLastDelivery).toBe(10);
    });

    test('returns ineligible when beneficiary not found', async () => {
      databases.listDocuments.mockResolvedValueOnce({ 
        total: 0, 
        documents: [] 
      });

      const result = await appwriteService.verifyEligibility('BEN-999');

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Beneficiary not found');
      expect(result.beneficiary).toBeNull();
    });

    test('throws error when database query fails', async () => {
      databases.listDocuments.mockRejectedValue(new Error('Connection error'));

      await expect(appwriteService.verifyEligibility('BEN-001')).rejects.toThrow(
        'Failed to verify eligibility'
      );
    });
  });

  describe('registerDelivery', () => {
    test('successfully registers delivery when beneficiary is eligible', async () => {
      const mockBeneficiary = {
        uniqueId: 'BEN-004',
        fullName: 'Peter Otieno',
        location: 'Dagoretti',
      };

      // Mock eligibility check (eligible)
      databases.listDocuments
        .mockResolvedValueOnce({ 
          total: 1, 
          documents: [mockBeneficiary] 
        })
        .mockResolvedValueOnce({ 
          total: 0, 
          documents: [] 
        });

      // Mock delivery creation
      databases.createDocument.mockResolvedValueOnce({
        $id: 'delivery-123',
        beneficiaryId: 'BEN-004',
        aidType: 'Food',
        deliveryDate: new Date().toISOString(),
        status: 'delivered',
      });

      const deliveryData = {
        beneficiaryId: 'BEN-004',
        aidType: 'Food',
        deliveryDate: new Date().toISOString(),
      };

      const result = await appwriteService.registerDelivery(deliveryData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Delivery registered successfully');
      expect(databases.createDocument).toHaveBeenCalled();
    });

    test('fails to register delivery when beneficiary is ineligible', async () => {
      const mockBeneficiary = {
        uniqueId: 'BEN-005',
        fullName: 'Grace Akinyi',
        location: 'Mukuru',
      };

      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      // Mock eligibility check (ineligible)
      databases.listDocuments
        .mockResolvedValueOnce({ 
          total: 1, 
          documents: [mockBeneficiary] 
        })
        .mockResolvedValueOnce({ 
          total: 1,
          documents: [{
            beneficiaryId: 'BEN-005',
            deliveryDate: fiveDaysAgo.toISOString(),
          }]
        });

      const deliveryData = {
        beneficiaryId: 'BEN-005',
        aidType: 'Medical',
      };

      await expect(appwriteService.registerDelivery(deliveryData)).rejects.toThrow(
        'Must wait'
      );

      expect(databases.createDocument).not.toHaveBeenCalled();
    });
  });

  describe('createBeneficiary', () => {
    test('creates new beneficiary when National ID is unique', async () => {
      databases.listDocuments.mockResolvedValueOnce({ 
        total: 0, 
        documents: [] 
      });

      databases.createDocument.mockResolvedValueOnce({
        $id: 'beneficiary-123',
        fullName: 'David Mwangi',
        uniqueId: 'BEN-006',
        location: 'Eastleigh',
        phone: '+254712345678',
        gender: 'Male',
      });

      const newBeneficiary = {
        fullName: 'David Mwangi',
        uniqueId: 'BEN-006',
        location: 'Eastleigh',
        phone: '+254712345678',
        gender: 'Male',
      };

      const result = await appwriteService.createBeneficiary(newBeneficiary);

      expect(result.fullName).toBe('David Mwangi');
      expect(databases.createDocument).toHaveBeenCalled();
    });

    test('prevents duplicate beneficiary creation', async () => {
      databases.listDocuments.mockResolvedValueOnce({ 
        total: 1, 
        documents: [{
          uniqueId: 'BEN-001',
          fullName: 'Existing Person',
        }] 
      });

      const duplicateBeneficiary = {
        fullName: 'Another Person',
        uniqueId: 'BEN-001',
        location: 'Nairobi',
        phone: '+254700000000',
        gender: 'Female',
      };

      await expect(appwriteService.createBeneficiary(duplicateBeneficiary)).rejects.toThrow(
        'Beneficiary with this National ID already exists'
      );

      expect(databases.createDocument).not.toHaveBeenCalled();
    });
  });
});
