import React, { useState } from 'react';

/**
 * Componente que muestra una tarjeta con la informacion de un riesgo y su control asociado.
 * Permite cambiar el estado de implementacion del control.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.controlNumber - El identificador del control (ej. "5.1").
 * @param {string} props.controlName - El nombre descriptivo del control.
 * @param {string} props.status - El estado actual del control (IMPLEMENTED, PARTIAL, NOT_IMPLEMENTED).
 * @param {number} props.likelihood - La probabilidad del riesgo (1-5).
 * @param {number} props.impact - El impacto del riesgo (1-5).
 * @returns {JSX.Element} La tarjeta de riesgo renderizada.
 */
const RiskCard = ({ controlNumber, controlName, status, likelihood, impact }) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const riskScore = likelihood * impact;
  
  /**
   * Determina la clase CSS basada en la puntuacion del riesgo.
   * @returns {string} Clase CSS.
   */
  const getRiskLevelClass = () => {
    if (riskScore >= 15) return 'risk-high';
    if (riskScore >= 8) return 'risk-medium';
    return 'risk-low';
  };

  /**
   * Maneja el cambio en el selector de estado.
   * @param {React.ChangeEvent<HTMLSelectElement>} e - Evento de cambio.
   */
  const handleStatusChange = (e) => {
    setCurrentStatus(e.target.value);
  };

  return (
    <div className="risk-card glass-panel" data-testid={`risk-card-${controlNumber}`}>
      <div className="card-header">
        <h3>Control {controlNumber}</h3>
        <span className={`status-badge ${currentStatus.toLowerCase()}`} data-testid="status-badge">
          {currentStatus === 'IMPLEMENTED' ? 'Implementado' : currentStatus === 'PARTIAL' ? 'Parcial' : 'No Implementado'}
        </span>
      </div>
      
      <div className="card-body">
        <p className="control-name">{controlName}</p>
        
        <div className="metrics">
          <div className="metric">
            <span className="label">Probabilidad</span>
            <span className="value">{likelihood}/5</span>
          </div>
          <div className="metric">
            <span className="label">Impacto</span>
            <span className="value">{impact}/5</span>
          </div>
          <div className={`metric risk-score ${getRiskLevelClass()}`}>
            <span className="label">Nivel de Riesgo</span>
            <span className="value">{riskScore}</span>
          </div>
        </div>
      </div>
      
      <div className="card-actions">
        <select value={currentStatus} onChange={handleStatusChange} data-testid="status-select">
          <option value="NOT_IMPLEMENTED">No Implementado</option>
          <option value="PARTIAL">Parcial</option>
          <option value="IMPLEMENTED">Implementado</option>
        </select>
        <button className="btn-primary" data-testid="upload-evidence-btn">Subir Evidencia</button>
      </div>
    </div>
  );
};

export default RiskCard;
