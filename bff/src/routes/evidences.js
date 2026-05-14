import express from 'express';
import { handleUploadEvidence, handleGetEvidences, upload } from '../controllers/evidenceController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/evidences/:soa_id - Obtiene las evidencias de un control SoA
router.get('/:soa_id', requireAuth, handleGetEvidences);

// POST /api/evidences - Sube un archivo de evidencia
// Se requiere autenticación y multer intercepta el archivo en el campo 'file'
router.post('/', requireAuth, upload.single('file'), handleUploadEvidence);

export default router;
