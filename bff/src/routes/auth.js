import express from 'express';
import { handleLogin, handleGetMe } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema } from '../middlewares/schemas.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), handleLogin);

// GET /api/auth/me — devuelve los datos del usuario logueado (requiere JWT válido)
router.get('/me', requireAuth, handleGetMe);

export default router;
