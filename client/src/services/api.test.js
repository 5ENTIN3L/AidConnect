jest.mock('appwrite', () => {
  const queryBuilder = {
    limit: jest.fn((v) => `limit:${v}`),
    equal: jest.fn((k, v) => `equal:${k}:${v}`),
    notEqual: jest.fn((k, v) => `notEqual:${k}:${v}`),
    orderDesc: jest.fn((v) => `orderDesc:${v}`),
  };

  return {
    Client: jest.fn().mockImplementation(() => ({
      setEndpoint: jest.fn().mockReturnThis(),
      setProject: jest.fn().mockReturnThis(),
    })),
    Databases: jest.fn().mockImplementation(() => ({
      listDocuments: jest.fn(),
      createDocument: jest.fn(),
      updateDocument: jest.fn(),
      deleteDocument: jest.fn(),
      getDocument: jest.fn(),
    })),
    Account: jest.fn().mockImplementation(() => ({
      createEmailPasswordSession: jest.fn(),
      get: jest.fn(),
      deleteSession: jest.fn(),
    })),
    Query: queryBuilder,
    ID: {
      unique: jest.fn(() => 'generated-id'),
    },
  };
});

const { appwriteService, databases } = require('./api');

describe('appwriteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createBeneficiary rejects empty full name', async () => {
    await expect(
      appwriteService.createBeneficiary({
        fullName: ' ',
        uniqueId: '1234',
        location: 'Nairobi',
        vulnerability: 'HIGH',
        householdSize: 3,
      })
    ).rejects.toThrow('Full name is required.');
  });

  test('createBeneficiary rejects duplicate national ID', async () => {
    databases.listDocuments.mockResolvedValueOnce({ total: 1 });

    await expect(
      appwriteService.createBeneficiary({
        fullName: 'Jane Doe',
        uniqueId: '1234',
        location: 'Nairobi',
        vulnerability: 'HIGH',
        householdSize: 4,
      })
    ).rejects.toThrow('A beneficiary with this National ID already exists.');
  });

  test('createBeneficiary trims values and creates document', async () => {
    databases.listDocuments.mockResolvedValueOnce({ total: 0 });
    databases.createDocument.mockResolvedValueOnce({ $id: 'benef-1' });

    await appwriteService.createBeneficiary({
      fullName: ' Jane Doe ',
      uniqueId: ' 1234 ',
      location: ' Nairobi ',
      vulnerability: 'HIGH',
      householdSize: 4,
      phone: ' 0700000000 ',
      notes: ' urgent ',
    });

    expect(databases.createDocument).toHaveBeenCalledTimes(1);

    const [dbId, collectionId, , payload] = databases.createDocument.mock.calls[0];

    expect(dbId).toBe('aidconnect_db');
    expect(collectionId).toBe('beneficiaries');
    expect(payload).toEqual(
      expect.objectContaining({
        fullName: 'Jane Doe',
        uniqueId: '1234',
        location: 'Nairobi',
        householdSize: 4,
        phone: '0700000000',
        notes: 'urgent',
      })
    );
  });

  test('createBeneficiary rejects non-numeric householdSize', async () => {
    await expect(
      appwriteService.createBeneficiary({
        fullName: 'Jane Doe',
        uniqueId: '1234',
        location: 'Nairobi',
        vulnerability: 'HIGH',
        householdSize: 'abc',
      })
    ).rejects.toThrow('Household size must be at least 1.');
  });

  test('updateBeneficiary rejects invalid householdSize', async () => {
    await expect(
      appwriteService.updateBeneficiary('benef-1', {
        fullName: 'Jane Doe',
        location: 'Nairobi',
        vulnerability: 'HIGH',
        householdSize: -1,
      })
    ).rejects.toThrow('Household size must be at least 1.');
  });

  test('deleteBeneficiary blocks when active requests exist', async () => {
    databases.listDocuments.mockResolvedValueOnce({ total: 1 });

    await expect(appwriteService.deleteBeneficiary('benef-1')).rejects.toThrow(
      'Cannot delete beneficiary with active aid requests. Resolve all requests first.'
    );
  });

  test('updateAidRequestStatus rejects invalid status', async () => {
    await expect(appwriteService.updateAidRequestStatus('req-1', 'INVALID')).rejects.toThrow(
      'Invalid status: INVALID'
    );
  });

  test('updateDeliveryStatus stamps delivery date when delivered', async () => {
    databases.updateDocument.mockResolvedValueOnce({ $id: 'delivery-1' });

    await appwriteService.updateDeliveryStatus('delivery-1', 'delivered');

    expect(databases.updateDocument).toHaveBeenCalledWith(
      'aidconnect_db',
      'deliveries',
      'delivery-1',
      expect.objectContaining({
        status: 'delivered',
        deliveryDate: expect.any(String),
      })
    );
  });
});