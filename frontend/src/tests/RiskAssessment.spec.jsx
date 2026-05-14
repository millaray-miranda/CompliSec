import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import RiskAssessment from '../components/risks/RiskAssessment';
import RiskForm from '../components/risks/RiskForm';

describe('Risk Assessment Module', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  describe('RiskForm Component', () => {
    it('handles 400 Bad Request and maps Zod errors', async () => {
      const mockValidationResponse = {
        error: 'Validation Failed',
        details: [
          { path: 'threat', message: 'Threat description must be at least 3 characters' }
        ]
      };

      mock.onPost('http://localhost:4000/api/risks').reply(400, mockValidationResponse);

      render(<RiskForm organizationId="org-1" assetId="asset-1" onSuccess={() => {}} onCancel={() => {}} />);
      
      fireEvent.submit(screen.getByTestId('risk-form'));

      await waitFor(() => {
        expect(screen.getByTestId('error-risk-threat').textContent).toBe('Threat description must be at least 3 characters');
        expect(screen.getByTestId('input-risk-threat').className).toContain('input-error');
      });
    });
  });

});
