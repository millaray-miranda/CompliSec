import { saveDiagnostic, getDiagnostic } from '../services/diagnosticService.js';

/**
 * POST /api/diagnostic
 * Guarda el perfil de riesgo calculado durante el onboarding.
 */
export const handleSaveDiagnostic = async (req, res, next) => {
  try {
    const { organization_id, risks } = req.body;

    if (!organization_id || !Array.isArray(risks)) {
      return res.status(400).json({ error: 'Bad Request', message: 'organization_id y risks son requeridos.' });
    }

    await saveDiagnostic(organization_id, risks);

    return res.status(201).json({ message: 'Diagnóstico guardado correctamente.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/diagnostic?organization_id=:id
 * Obtiene el perfil de riesgo del diagnóstico inicial.
 */
export const handleGetDiagnostic = async (req, res, next) => {
  try {
    const { organization_id } = req.query;

    if (!organization_id) {
      return res.status(400).json({ error: 'Bad Request', message: 'organization_id es requerido.' });
    }

    const risks = await getDiagnostic(organization_id);

    return res.status(200).json({ data: risks });
  } catch (error) {
    next(error);
  }
};
