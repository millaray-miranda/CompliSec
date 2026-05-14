import { query } from '../config/db.js';

/**
 * Guarda el registro de una evidencia en la base de datos.
 *
 * @param {Object} evidenceData
 * @param {string} evidenceData.soa_id
 * @param {string} evidenceData.document_name
 * @param {string} evidenceData.file_url
 * @param {string} evidenceData.uploaded_by
 * @returns {Promise<Object>} El registro guardado.
 */
export const saveEvidence = async (evidenceData) => {
  const insertQuery = `
    INSERT INTO evidences (soa_id, document_name, file_url, uploaded_by) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `;
  const result = await query(insertQuery, [
    evidenceData.soa_id,
    evidenceData.document_name,
    evidenceData.file_url,
    evidenceData.uploaded_by
  ]);
  return result.rows[0];
};

/**
 * Obtiene todas las evidencias asociadas a un SoA específico.
 *
 * @param {string} soaId
 * @returns {Promise<Array>} Lista de evidencias.
 */
export const getEvidencesBySoaId = async (soaId) => {
  const selectQuery = `
    SELECT e.*, u.name as uploader_name 
    FROM evidences e
    LEFT JOIN users u ON e.uploaded_by = u.id
    WHERE e.soa_id = $1
    ORDER BY e.uploaded_at DESC
  `;
  const result = await query(selectQuery, [soaId]);
  return result.rows;
};
