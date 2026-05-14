import { query } from '../config/db.js';

export const createAsset = async (assetData) => {
  const insertQuery = `
    INSERT INTO assets (
      organization_id, 
      name, 
      description, 
      confidentiality_req, 
      integrity_req, 
      availability_req
    ) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *
  `;
  
  const values = [
    assetData.organization_id,
    assetData.name,
    assetData.description,
    assetData.confidentiality_req,
    assetData.integrity_req,
    assetData.availability_req
  ];

  const result = await query(insertQuery, values);
  return result.rows[0];
};

export const getAssetsByOrganization = async (organizationId) => {
  const selectQuery = `
    SELECT * FROM assets 
    WHERE organization_id = $1 
    ORDER BY created_at DESC
  `;
  
  const result = await query(selectQuery, [organizationId]);
  return result.rows;
};
