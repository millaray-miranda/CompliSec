import { createOrganizationAndAdmin } from '../services/onboardingService.js';
import { generateTokenForUser } from '../services/authService.js';

export const handleOnboarding = async (req, res, next) => {
  try {
    const { name, industry, size, scope_description } = req.body;
    
    // We are receiving the single object now from our refactored OnboardingForm.
    // However, the OnboardingForm in frontend still only sends these 4 fields currently because we refactored it to use a flat structure for the API.
    // Wait, let's check the schema in schemas.js for onboarding! 
    // In schemas.js, onboardingSchema still expects `organization` and `admin` !
    // Let me fix this mismatch. The frontend was sending flat, but I changed it back to nested.
    // Actually, I wrote the final version of OnboardingForm.jsx to send nested `organization` and `admin`.
    const { organization, admin } = req.body;
    
    const result = await createOrganizationAndAdmin(organization, admin);
    
    // Generar token JWT
    const token = generateTokenForUser({
      id: result.user.id,
      organization_id: result.organizationId,
      role: result.user.role
    });
    
    return res.status(201).json({
      message: 'Organización y Administrador creados exitosamente.',
      data: {
        ...result,
        token
      }
    });
    
  } catch (error) {
    console.error('Onboarding Error:', error);
    
    // Manejo de error de constraint de PostgreSQL (ej. email único)
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      return res.status(409).json({ error: 'Conflict', message: 'Email is already registered.' });
    }
    
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to complete onboarding process.' });
  }
};
