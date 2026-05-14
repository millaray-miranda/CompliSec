import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import SoAList from '../components/soa/SoAList';

describe('Statement of Applicability (SoA) Module', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('loads and displays the Annex A controls catalog', async () => {
    const mockControls = {
      data: [
        {
          control_id: 'c1',
          control_domain: 'Organizational',
          control_number: '5.1',
          control_name: 'Políticas para la seguridad de la información',
          description: 'Desc',
          soa_id: null,
          is_applicable: null,
          implementation_status: null
        }
      ]
    };

    mock.onGet(/api\/soa/).reply(200, mockControls);

    render(<SoAList organizationId="org-123" />);

    await waitFor(() => {
      expect(screen.getByText('5.1')).toBeTruthy();
      expect(screen.getByText('Políticas para la seguridad de la información')).toBeTruthy();
      expect(screen.getByText('Pendiente')).toBeTruthy(); // Because it has no soa_id yet
    });
  });

  it('allows evaluating a control and requires justification', async () => {
    const mockControls = {
      data: [
        {
          control_id: 'c1',
          control_number: '8.1',
          control_name: 'Dispositivos de punto final',
          description: 'Desc',
          soa_id: null
        }
      ]
    };

    mock.onGet(/api\/soa/).reply(200, mockControls);

    // Mock validation error when justification is missing
    mock.onPost(/api\/soa/).reply(400, {
      error: 'Validation Failed',
      details: [{ path: 'justification', message: 'La justificación debe tener al menos 10 caracteres' }]
    });

    render(<SoAList organizationId="org-123" />);

    await waitFor(() => {
      expect(screen.getByText('8.1')).toBeTruthy();
    });

    // Click "Evaluar"
    fireEvent.click(screen.getByText('Evaluar'));

    // Form should appear
    await waitFor(() => {
      expect(screen.getByTestId('soa-form')).toBeTruthy();
    });

    // Clear justification and submit to trigger error
    fireEvent.change(screen.getByTestId('input-soa-justification'), { target: { value: 'Corto' } });
    fireEvent.submit(screen.getByTestId('soa-form'));

    await waitFor(() => {
      expect(screen.getByTestId('error-soa-justification').textContent).toBe('La justificación debe tener al menos 10 caracteres');
    });
  });
});
