import { query } from '../config/db.js';

export const getSoAForOrganization = async (organizationId) => {
  const selectQuery = `
    SELECT 
      c.id as control_id, 
      c.control_domain, 
      c.control_number, 
      c.control_name, 
      c.description, 
      c.objective,
      s.id as soa_id,
      s.is_applicable,
      s.justification,
      s.implementation_status
    FROM annex_a_controls c
    LEFT JOIN soa s ON c.id = s.control_id AND s.organization_id = $1
    ORDER BY c.control_number ASC
  `;
  
  const result = await query(selectQuery, [organizationId]);
  return result.rows;
};

export const upsertSoA = async (soaData) => {
  const upsertQuery = `
    INSERT INTO soa (
      organization_id, 
      control_id, 
      is_applicable, 
      justification, 
      implementation_status
    ) 
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (organization_id, control_id) 
    DO UPDATE SET 
      is_applicable = EXCLUDED.is_applicable,
      justification = EXCLUDED.justification,
      implementation_status = EXCLUDED.implementation_status,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  
  const values = [
    soaData.organization_id,
    soaData.control_id,
    soaData.is_applicable,
    soaData.justification,
    soaData.implementation_status
  ];

  const result = await query(upsertQuery, values);
  return result.rows[0];
};
