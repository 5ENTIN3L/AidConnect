import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { account } from '../services/api';
import { AuthProvider, useAuth } from './AuthContext';

jest.mock('../services/api', () => ({
  account: {
    get: jest.fn(),
    createEmailPasswordSession: jest.fn(),
    deleteSession: jest.fn(),
  },
}));

function TestConsumer() {
  const { user, loading, login, logout, can, canAccess, defaultPage } = useAuth();

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="role">{user?.role || 'none'}</div>
      <div data-testid="default-page">{defaultPage}</div>
      <div data-testid="can-create-request">{String(can('CREATE_REQUEST'))}</div>
      <div data-testid="can-access-reports">{String(canAccess('reports'))}</div>
      <button onClick={() => login('qa@aidconnect.test', 'secret')} type="button">
        login
      </button>
      <button onClick={() => logout()} type="button">
        logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.navigateTo = jest.fn();
    localStorage.setItem('token', 'stale-token');
    localStorage.setItem('user', 'stale-user');
  });

  test('hydrates user session and exposes permissions', async () => {
    account.get.mockResolvedValueOnce({
      $id: 'user-1',
      name: 'QA User',
      email: 'qa@aidconnect.test',
      labels: ['ngoadmin'],
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('role')).toHaveTextContent('ngoadmin');
    expect(screen.getByTestId('default-page')).toHaveTextContent('dashboard');
    expect(screen.getByTestId('can-create-request')).toHaveTextContent('true');
    expect(screen.getByTestId('can-access-reports')).toHaveTextContent('true');
  });

  test('login creates a session then re-checks account', async () => {
    account.get
      .mockRejectedValueOnce(new Error('no active session'))
      .mockResolvedValueOnce({
        $id: 'user-2',
        name: 'Field User',
        email: 'field@aidconnect.test',
        labels: ['fieldofficer'],
      });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    fireEvent.click(screen.getByRole('button', { name: 'login' }));

    await waitFor(() => {
      expect(account.createEmailPasswordSession).toHaveBeenCalledWith('qa@aidconnect.test', 'secret');
    });

    await waitFor(() => {
      expect(screen.getByTestId('role')).toHaveTextContent('fieldofficer');
    });
  });

  test('logout clears client state and redirects even if session deletion fails', async () => {
    account.get.mockResolvedValueOnce({
      $id: 'user-3',
      name: 'Viewer User',
      email: 'viewer@aidconnect.test',
      labels: ['viewer'],
    });
    account.deleteSession.mockRejectedValueOnce(new Error('network error'));

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('role')).toHaveTextContent('viewer');
    });

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('role')).toHaveTextContent('none');
    });

    expect(window.navigateTo).toHaveBeenCalledWith('landing');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();

    warnSpy.mockRestore();
  });
});