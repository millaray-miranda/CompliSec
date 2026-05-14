import express from 'express';
import { handleGetSoA, handleUpsertSoA } from '../controllers/soaController.js';
import { validate } from '../middlewares/validate.js';
import { soaSchema } from '../middlewares/schemas.js';

const router = express.Router();

router.get('/', handleGetSoA);
router.post('/', validate(soaSchema), handleUpsertSoA);
router.put('/', validate(soaSchema), handleUpsertSoA);

export default router;
