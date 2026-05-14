import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import OnboardingForm from '../components/onboarding/OnboardingForm';

describe('OnboardingForm Component', () => {
  let mock;

  beforeEach(() => {
    // Setup Axios Mock Adapter
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('renders correctly and allows input', () => {
    render(<OnboardingForm onComplete={() => {}} />);
    
    const orgNameInput = screen.getByTestId('input-org-name');
    fireEvent.change(orgNameInput, { target: { name: 'name', value: 'Tech Corp' } });
    
    expect(orgNameInput.value).toBe('Tech Corp');
  });

  it('handles 400 Bad Request and displays Zod validation errors on the DOM', async () => {
    const mockValidationResponse = {
      error: 'Validation Failed',
      details: [
        { path: 'organization.industry', message: 'Industry must be specified' },
        { path: 'organization.industry', message: 'La industria debe ser especificada' },
        { path: 'admin.email', message: 'Formato de correo electrónico inválido' }
      ]
    };

    mock.onPost('http://localhost:4000/api/onboarding').reply(400, mockValidationResponse);

    render(<OnboardingForm onComplete={() => {}} />);
    
    // Simulate submit without filling the form
    fireEvent.submit(screen.getByTestId('onboarding-form'));

    // Wait for the async API call and state update
    await waitFor(() => {
      // Check if error messages are rendered in the DOM
      expect(screen.getByTestId('error-org-industry').textContent).toBe('La industria debe ser especificada');
      expect(screen.getByTestId('error-admin-email').textContent).toBe('Formato de correo electrónico inválido');
    });

    // Check if the input fields got the 'input-error' CSS class
    expect(screen.getByTestId('input-org-industry').className).toContain('input-error');
    expect(screen.getByTestId('input-admin-email').className).toContain('input-error');
  });

  
  it('handles 409 Conflict (e.g. duplicate email)', async () => {
    const mockConflictResponse = {
      error: 'Conflict',
      message: 'El correo electrónico ya está registrado.'
    };

    mock.onPost('http://localhost:4000/api/onboarding').reply(409, mockConflictResponse);

    render(<OnboardingForm onComplete={() => {}} />);
    fireEvent.submit(screen.getByTestId('onboarding-form'));

    await waitFor(() => {
      expect(screen.getByTestId('server-error').textContent).toBe('El correo electrónico ya está registrado.');
    });
  });
});
