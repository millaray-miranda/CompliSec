import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-iso27001-key';

/**
 * Autentica a un usuario verificando email y contraseña.
 * Retorna el usuario (sin password_hash) y un JWT firmado.
 */
export const authenticateUser = async (email, password) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) throw new Error('Invalid credentials');

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign(
    {
      userId:         user.id,
      name:           user.name,          // ← incluir name en el payload
      organizationId: user.organization_id,
      role:           user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    user: {
      id:              user.id,
      name:            user.name,
      email:           user.email,
      role:            user.role,
      organization_id: user.organization_id,
    },
    token,
  };
};

/**
 * Genera un token JWT para un usuario existente (usado post-onboarding).
 */
export const generateTokenForUser = (user) => {
  return jwt.sign(
    {
      userId:         user.id,
      name:           user.name || '',
      organizationId: user.organization_id,
      role:           user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};
