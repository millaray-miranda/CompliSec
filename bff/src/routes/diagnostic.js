import express from 'express';
import { handleSaveDiagnostic, handleGetDiagnostic } from '../controllers/diagnosticController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/diagnostic — guarda el perfil de riesgo del onboarding
router.post('/', requireAuth, handleSaveDiagnostic);

// GET /api/diagnostic?organization_id=:id — obtiene el perfil guardado
router.get('/', requireAuth, handleGetDiagnostic);

export default router;
