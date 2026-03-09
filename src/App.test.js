import { render, screen } from '@testing-library/react';
import App from './App';

describe('AidConnect Application', () => {
  test('renders login page initially', () => {
    render(<App />);
    // Check if the login form or AidConnect branding is present
    // Using getAllByText since there are multiple instances of "AidConnect"
    const aidConnectElements = screen.getAllByText(/AidConnect/i);
    expect(aidConnectElements.length).toBeGreaterThan(0);
  });

  test('application mounts without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
