import express from 'express';
import { handleOnboarding } from '../controllers/onboardingController.js';
import { validate } from '../middlewares/validate.js';
import { onboardingSchema } from '../middlewares/schemas.js';

const router = express.Router();

// POST /api/onboarding
// Usa middleware 'validate' con Zod schema para sanitización y chequeo estricto
router.post('/', validate(onboardingSchema), handleOnboarding);

export default router;
