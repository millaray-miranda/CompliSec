import express from 'express';
import { handleCreateRisk, handleGetRisks } from '../controllers/riskController.js';
import { validate } from '../middlewares/validate.js';
import { riskSchema } from '../middlewares/schemas.js';

const router = express.Router();

router.post('/', validate(riskSchema), handleCreateRisk);
router.get('/', handleGetRisks);

export default router;
