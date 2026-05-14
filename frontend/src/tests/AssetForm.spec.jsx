import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AssetForm from '../components/assets/AssetForm';

describe('AssetForm Component', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('renders correctly', () => {
    render(<AssetForm organizationId="test-org-123" onSuccess={() => {}} />);
    expect(screen.getByTestId('input-asset-name')).toBeTruthy();
  });

  it('handles 400 Bad Request and displays Zod validation errors on the DOM', async () => {
    const mockValidationResponse = {
      error: 'Validation Failed',
      details: [
        { path: 'name', message: 'Asset name must be at least 2 characters' }
      ]
    };

    mock.onPost('http://localhost:4000/api/assets').reply(400, mockValidationResponse);

    render(<AssetForm organizationId="test-org-123" onSuccess={() => {}} />);
    
    // Simular submit enviando campos vacíos o inválidos
    fireEvent.submit(screen.getByTestId('asset-form'));

    // Esperar mapeo de errores Zod
    await waitFor(() => {
      expect(screen.getByTestId('error-asset-name').textContent).toBe('Asset name must be at least 2 characters');
    });

    // Validar CSS dinámico de error
    expect(screen.getByTestId('input-asset-name').className).toContain('input-error');
  });

});
