import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RiskCard from '../components/dashboard/RiskCard';

describe('RiskCard Component', () => {
  const mockProps = {
    controlNumber: '5.1',
    controlName: 'Policies for information security',
    status: 'NOT_IMPLEMENTED',
    likelihood: 4,
    impact: 4
  };

  it('renders correctly with initial props', () => {
    render(<RiskCard {...mockProps} />);
        expect(screen.getByText('Anexo A 5.1')).toBeTruthy();
      expect(screen.getByText('Test Control')).toBeTruthy();
      expect(screen.getByTestId('status-badge').textContent).toBe('Implementado');
      // likelihood * impact = 2 * 3 = 6 (low risk)
      expect(screen.getByText('6')).toBeTruthy();
    });

    it('allows changing the implementation status', () => {
      render(<RiskCard {...defaultProps} status="PARTIAL" />);
      
      expect(screen.getByTestId('status-badge').textContent).toBe('Parcial');

      const select = screen.getByTestId('status-select');
      fireEvent.change(select, { target: { value: 'NOT_IMPLEMENTED' } });

      expect(screen.getByTestId('status-badge').textContent).toBe('No Implementado');
    });

  it('calculates risk class correctly for high risk', () => {
    const { container } = render(<RiskCard {...mockProps} likelihood={5} impact={4} />);
    const scoreElement = container.querySelector('.risk-score');
    expect(scoreElement.className).toContain('risk-high');
  });
});
