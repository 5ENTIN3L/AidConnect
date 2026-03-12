import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.navigateTo = jest.fn();
  });

  test('renders loading state while auth is resolving', () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    render(
      <ProtectedRoute allowedRoles={['ngoadmin']}>
        <div>secure content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(window.navigateTo).not.toHaveBeenCalled();
  });

  test('redirects unauthenticated users to login', async () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    const { container } = render(
      <ProtectedRoute allowedRoles={['ngoadmin']}>
        <div>secure content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(window.navigateTo).toHaveBeenCalledWith('login');
    });
    expect(container).toBeEmptyDOMElement();
  });

  test('redirects unauthorized staff to dashboard', async () => {
    useAuth.mockReturnValue({
      user: { role: 'fieldofficer' },
      loading: false,
    });

    render(
      <ProtectedRoute allowedRoles={['ngoadmin']}>
        <div>secure content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(window.navigateTo).toHaveBeenCalledWith('dashboard');
    });
  });

  test('redirects beneficiary to beneficiary portal when role is not allowed', async () => {
    useAuth.mockReturnValue({
      user: { role: 'beneficiary' },
      loading: false,
    });

    render(
      <ProtectedRoute allowedRoles={['ngoadmin']}>
        <div>secure content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(window.navigateTo).toHaveBeenCalledWith('beneficiary-portal');
    });
  });

  test('renders content for authorized users', () => {
    useAuth.mockReturnValue({
      user: { role: 'ngoadmin' },
      loading: false,
    });

    render(
      <ProtectedRoute allowedRoles={['ngoadmin']}>
        <div>secure content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('secure content')).toBeInTheDocument();
    expect(window.navigateTo).not.toHaveBeenCalled();
  });
});