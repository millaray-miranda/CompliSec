import { createOrganizationAndAdmin } from '../services/onboardingService.js';
import { generateTokenForUser } from '../services/authService.js';

/**
 * POST /api/onboarding
 * Crea la organización y su usuario administrador en una transacción atómica.
 * Retorna el token JWT para que el frontend haga auto-login.
 *
 * Body esperado:
 * {
 *   organization: { name, industry, size },
 *   admin: { name, email, password }
 * }
 */
export const handleOnboarding = async (req, res, next) => {
  try {
    const { organization, admin } = req.body;

    const result = await createOrganizationAndAdmin(organization, admin);

    const token = generateTokenForUser({
      id: result.user.id,
      organization_id: result.organizationId,
      role: result.user.role,
    });

    return res.status(201).json({
      message: 'Organización y Administrador creados exitosamente.',
      data: {
        organizationId: result.organizationId,
        user: result.user,
        token,
      },
    });
  } catch (error) {
    console.error('Onboarding Error:', error);

    // Email duplicado (constraint users_email_key)
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Este correo ya está registrado. Por favor inicia sesión.',
      });
    }

    next(error);
  }
};
