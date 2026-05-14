import { query } from '../config/db.js';

/**
 * Guarda o actualiza el perfil de riesgo del diagnóstico inicial.
 * Usa INSERT ... ON CONFLICT para que re-ejecutar el onboarding no genere duplicados.
 */
export const saveDiagnostic = async (organizationId, risks) => {
  for (const r of risks) {
    await query(
      `INSERT INTO diagnostic_risks
        (organization_id, domain_key, domain_label, probability, impact_value, risk_score, risk_level_label)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (organization_id, domain_key)
       DO UPDATE SET
         probability       = EXCLUDED.probability,
         impact_value      = EXCLUDED.impact_value,
         risk_score        = EXCLUDED.risk_score,
         risk_level_label  = EXCLUDED.risk_level_label,
         updated_at        = CURRENT_TIMESTAMP`,
      [organizationId, r.domain_key, r.domain_label, r.probability, r.impact_value, r.risk_score, r.risk_level_label]
    );
  }
};

/**
 * Obtiene el perfil de riesgo diagnóstico de una organización,
 * ordenado de mayor a menor riesgo.
 */
export const getDiagnostic = async (organizationId) => {
  const result = await query(
    `SELECT domain_key, domain_label, probability, impact_value, risk_score, risk_level_label
     FROM diagnostic_risks
     WHERE organization_id = $1
     ORDER BY risk_score DESC`,
    [organizationId]
  );
  return result.rows;
};
