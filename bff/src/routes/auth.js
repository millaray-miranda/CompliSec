import express from 'express';
import { handleLogin } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema } from '../middlewares/schemas.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), handleLogin);

export default router;
