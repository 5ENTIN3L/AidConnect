import { Query } from 'appwrite';
import { databases } from './api';
import {
    checkDuplication,
    getBeneficiaryAidHistory,
    getPriorityLabel,
    getPriorityScore,
} from './duplicationService';

jest.mock('./api', () => ({
  databases: {
    listDocuments: jest.fn(),
  },
}));

describe('duplicationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calculates priority score from urgency and vulnerability', () => {
    expect(getPriorityScore('EMERGENCY', 'CRITICAL')).toBe(80);
    expect(getPriorityScore('LOW', 'LOW')).toBe(20);
    expect(getPriorityScore('UNKNOWN', 'LOW')).toBe(10);
  });

  test('maps priority score to a critical label', () => {
    expect(getPriorityLabel(75)).toMatchObject({ label: 'Critical' });
    expect(getPriorityLabel(35)).toMatchObject({ label: 'Medium' });
  });

  test('returns duplicate document when an active request exists', async () => {
    const duplicate = { $id: 'req-1', status: 'PENDING' };

    databases.listDocuments.mockResolvedValueOnce({
      documents: [duplicate],
    });

    const result = await checkDuplication('beneficiary-1', 'food');

    expect(databases.listDocuments).toHaveBeenCalledWith('aidconnect_db', 'aid_requests', [
      Query.equal('beneficiaryId', 'beneficiary-1'),
      Query.equal('aidType', 'food'),
      expect.stringContaining('"method":"greaterThan"'),
      Query.notEqual('status', 'REJECTED'),
      Query.limit(1),
    ]);
    expect(result).toEqual({ isDuplicate: true, duplicate });
  });

  test('fails open when duplicate lookup errors', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    databases.listDocuments.mockRejectedValueOnce(new Error('network down'));

    await expect(checkDuplication('beneficiary-1', 'cash')).resolves.toEqual({
      isDuplicate: false,
      duplicate: null,
    });

    errorSpy.mockRestore();
  });

  test('returns beneficiary aid history in descending order', async () => {
    const documents = [{ $id: '1' }, { $id: '2' }];
    databases.listDocuments.mockResolvedValueOnce({ documents });

    await expect(getBeneficiaryAidHistory('beneficiary-2')).resolves.toEqual(documents);
    expect(databases.listDocuments).toHaveBeenCalledWith('aidconnect_db', 'aid_requests', [
      Query.equal('beneficiaryId', 'beneficiary-2'),
      Query.orderDesc('$createdAt'),
      Query.limit(20),
    ]);
  });
});