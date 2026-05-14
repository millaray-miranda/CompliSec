import { query } from '../config/db.js';

export const createRisk = async (riskData) => {
  const insertQuery = `
    INSERT INTO risk_profiles (
      organization_id, 
      asset_id, 
      threat, 
      vulnerability, 
      likelihood, 
      impact,
      treatment_decision
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *
  `;
  
  const values = [
    riskData.organization_id,
    riskData.asset_id,
    riskData.threat,
    riskData.vulnerability,
    riskData.likelihood,
    riskData.impact,
    riskData.treatment_decision
  ];

  const result = await query(insertQuery, values);
  return result.rows[0];
};

export const getRisksByOrganization = async (organizationId) => {
  const selectQuery = `
    SELECT r.*, a.name as asset_name 
    FROM risk_profiles r
    JOIN assets a ON r.asset_id = a.id
    WHERE r.organization_id = $1 
    ORDER BY r.risk_level DESC
  `;
  
  const result = await query(selectQuery, [organizationId]);
  return result.rows;
};
